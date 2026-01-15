// cloudfunctions/generateActionSuggestion/index.js
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// --- 配置区域 ---
// 建议使用 DeepSeek (深度求索) API，中文理解好，且兼容 OpenAI 格式
const API_KEY = 'sk-5f83d07dd9d14fe98955cb9080ecde7a'//'cf23fd89-d339-44a8-93ea-287c313b175e' // ⚠️ 请替换为你的真实 Key
const API_URL = 'https://api.deepseek.com/chat/completions'//'https://ark.cn-beijing.volces.com/api/v3/chat/completions'//'https://api.deepseek.com/v1/chat/completions' 

exports.main = async (event, context) => {
  const { keyword } = event // 用户输入，例如 "流浪猫"、"楼道堆物"

  if (!keyword) {
    return { success: false, msg: '请输入你的想法' }
  }

  // 1. 构造 System Prompt (核心指令)
  const systemPrompt = `
    你是一位资深的“社区营造专家”。你的任务是根据用户输入的【感兴趣的议题】，生成 3 个不同维度的微行动建议。
    
    【参考案例风格】
    - 观察类：拍一张小区早晨第一缕阳光下的长椅，发到业主群配文“早安”。
    - 互动类：进电梯时如果看到有人赶过来，按住开门键多等3秒。
    - 行动类：遇到遛狗邻居，夸狗狗很乖，顺便问问狗狗的名字。

    要求：
    1. 必须生成 3 个方案，且 level 字段必须【严格只能】从以下三个词中选择：
       - "观察类" (定义：低门槛、个人化，如拍照、记录、发现美等)
       - "互动类" (定义：有简单的邻里接触，如打招呼、小小举手之劳等)
       - "行动类" (定义：更有组织性或仪式感，如发起一个小倡议、组织一次共学等)
    2. 语气要温暖、具体、极其低门槛（让居民觉得“我立刻就能做”）。
    3. **必须严格返回 JSON 格式**，不要包含任何多余文字。
    
    JSON 结构示例：
    [
      {
        "level": "观察类",
        "title": "随手拍一拍",
        "desc": "下楼时关注角落...",
        "tags": ["环境", "随手做"]
      },
      ...
    ]
  `

  // 2. 构造 User Prompt
  // 增加随机噪声（当前时间戳），防止模型或 API 层的缓存导致结果重复
  const salt = Date.now();
  const userPrompt = `我对"${keyword}"很感兴趣，请给我建议。请确保你的创意是独特的、具体的，并且每次生成都有所不同。 [Ref: ${salt}]`

  try {
    // 3. 调用 AI 接口
    const response = await axios.post(API_URL, {
      model: "deepseek-chat", // 使用更通用的模型名称，如 deepseek-chat (V3) 或 deepseek-reasoner (R1)
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 1.0, 
      max_tokens: 1000,
      // 注意：如果模型不支持 json_object，请在 prompt 中强调返回 JSON 即可
      response_format: { type: "json_object" }
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 稍微增加一点超时时间
    })

    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      throw new Error('AI 返回数据结构异常');
    }

    const aiText = response.data.choices[0].message.content
    console.log('AI Original Response:', aiText)

    // 4. 数据清洗
    // 清除可能存在的 Markdown 标记和首尾空白
    let cleanJsonStr = aiText.replace(/```json/g, '').replace(/```/g, '').trim()
    
    // 如果返回的不是以 [ 或 { 开头，尝试截取 JSON 部分
    if (!cleanJsonStr.startsWith('[') && !cleanJsonStr.startsWith('{')) {
      const startBracket = cleanJsonStr.indexOf('[');
      const endBracket = cleanJsonStr.lastIndexOf(']');
      if (startBracket !== -1 && endBracket !== -1) {
        cleanJsonStr = cleanJsonStr.substring(startBracket, endBracket + 1);
      }
    }

    const suggestions = JSON.parse(cleanJsonStr)

    return {
      success: true,
      data: Array.isArray(suggestions) ? suggestions : (suggestions.data || suggestions.suggestions || [])
    }

  } catch (err) {
    console.error('AI 调用异常详情:', err.response ? err.response.data : err.message)
    
    // 5. 兜底策略：如果 AI 挂了，返回模拟数据
    return {
      success: true,
      isFallback: true, 
      errorMsg: err.message, // 将错误信息传回前端便于排查（正式发布前可移除）
      data: [
        { level: "观察类", title: "观察与记录", desc: `去社区里找找与“${keyword}”相关的问题，拍照记录下来。`, tags: ["观察"] },
        { level: "互动类", title: "分享给邻居", desc: "把你的发现发到业主群，问问大家的看法，听听更多人的声音。", tags: ["讨论"] },
        { level: "行动类", title: "联系带领人", desc: "在小程序里找到相关议题的带领人，通过“小事行动吧”加入他们的行动。", tags: ["行动"] }
      ]
    }
  }
}
