// cloudfunctions/generateActionSuggestion/index.js
const cloud = require('wx-server-sdk')
const axios = require('axios')
// 引入参考案例（120个案例）- 作为兜底数据
let REFERENCE_CASES_FALLBACK = []
try {
  REFERENCE_CASES_FALLBACK = require('./cases.js').REFERENCE_CASES || []
} catch (e) {
  console.warn('无法加载本地 cases.js，将使用数据库数据')
}

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 从数据库获取参考案例
async function getReferenceCasesFromDB(angle = null) {
  try {
    let query = db.collection('reference_cases')
    const result = await query.get()
    
    if (result.data && result.data.length > 0) {
      const cases = result.data.map(item => item.text || item.case)
      
      // 如果指定了角度，进行筛选
      if (angle) {
        return filterCasesByAngle(cases, angle)
      }
      
      return cases
    }
  } catch (error) {
    console.error('从数据库获取参考案例失败:', error)
  }
  
  // 如果数据库获取失败，返回兜底数据
  return REFERENCE_CASES_FALLBACK
}

// --- 配置区域 ---
// 建议使用 DeepSeek (深度求索) API，中文理解好，且兼容 OpenAI 格式
const API_KEY = 'sk-5f83d07dd9d14fe98955cb9080ecde7a'//'cf23fd89-d339-44a8-93ea-287c313b175e' // ⚠️ 请替换为你的真实 Key
const API_URL = 'https://api.deepseek.com/chat/completions'//'https://ark.cn-beijing.volces.com/api/v3/chat/completions'//'https://api.deepseek.com/v1/chat/completions' 

// 根据角度筛选相关案例
function filterCasesByAngle(cases, angle) {
  if (!angle || !cases || cases.length === 0) return cases
  
  // 定义角度关键词映射
  const angleKeywords = {
    '不同角度': ['观察', '思考', '视角', '发现', '记录', '探索'],
    '不同场景': ['楼道', '电梯', '社区', '活动室', '广场', '阳台', '公告栏', '垃圾', '公共空间', '街坊群'],
    '不同人群': ['邻居', '老人', '孩子', '伙伴', '工作者', '保安', '保洁', '快递', '街坊'],
    '不同方式': ['拍照', '组织', '分享', '发起', '制作', '设置', '邀请', '帮助', '送', '认识'],
    '不同时间': ['早晨', '周末', '节日', '春节', '每天', '每周', '定期', '临时']
  }
  
  const keywords = angleKeywords[angle] || []
  if (keywords.length === 0) return cases
  
  // 筛选包含关键词的案例
  const filtered = cases.filter(caseText => {
    return keywords.some(keyword => caseText.includes(keyword))
  })
  
  // 如果筛选结果太少（少于5个），补充一些随机案例
  if (filtered.length < 5) {
    const remaining = cases.filter(c => !filtered.includes(c))
    const randomCount = Math.min(10 - filtered.length, remaining.length)
    const randomCases = remaining.sort(() => Math.random() - 0.5).slice(0, randomCount)
    return [...filtered, ...randomCases]
  }
  
  // 如果筛选结果太多，随机选择15-20个
  if (filtered.length > 20) {
    return filtered.sort(() => Math.random() - 0.5).slice(0, 20)
  }
  
  return filtered
}

// 格式化案例为 prompt 文本
function formatCasesForPrompt(cases, angle = null) {
  if (!cases || cases.length === 0) return ''
  
  let promptTitle = '\n【参考案例库】'
  if (angle) {
    promptTitle += `（基于"${angle}"筛选的${cases.length}个相关案例，请重点参考这些案例，结合新角度创造全新方案）`
  } else {
    promptTitle += `（共${cases.length}个案例，请参考这些案例的风格和思路，但不要直接复制）`
  }
  promptTitle += '\n\n'
  
  let prompt = promptTitle
  cases.forEach((c, idx) => {
    prompt += `${idx + 1}. ${c}\n`
  })
  
  return prompt
}

exports.main = async (event, context) => {
  const { keyword, angle } = event // 用户输入和切入角度（换一批时传入）

  if (!keyword) {
    return { success: false, msg: '请输入你的想法' }
  }

  // 从数据库获取参考案例（如果数据库没有数据，使用本地兜底数据）
  const REFERENCE_CASES = await getReferenceCasesFromDB(angle)
  
  // 根据角度筛选相关案例（如果数据库已经筛选过，这里就不需要再筛选了）
  const relevantCases = angle && REFERENCE_CASES.length === REFERENCE_CASES_FALLBACK.length 
    ? filterCasesByAngle(REFERENCE_CASES, angle) 
    : REFERENCE_CASES
  const casesPrompt = formatCasesForPrompt(relevantCases, angle)

  // 1. 构造 System Prompt (核心指令)
  const systemPrompt = `
    你是一位资深的"社区营造专家"。你的任务是根据用户输入的【感兴趣的议题】，生成 3 个不同维度的微行动建议。
    ${casesPrompt}
    
    要求：
    1. 必须生成 3 个方案，且 level 字段必须【严格只能】从以下三个词中选择：
       - "观察类" (定义：低门槛、个人化，如拍照、记录、发现美等)
       - "互动类" (定义：有简单的邻里接触，如打招呼、小小举手之劳等)
       - "行动类" (定义：更有组织性或仪式感，如发起一个小倡议、组织一次共学等)
    2. 语气要温暖、具体、极其低门槛（让居民觉得"我立刻就能做"）。
    3. 参考上述案例的风格，但请创造性地生成新的、独特的建议，不要直接复制案例。
    4. **必须严格返回 JSON 数组格式**，不要包含任何多余文字、说明或解释，只返回纯 JSON 数组。
    5. 返回的 JSON 必须是一个数组，直接以 [ 开头，以 ] 结尾，不要包装在对象中。
    
    JSON 结构示例（直接返回这个格式，不要任何其他文字）：
    [
      {
        "level": "观察类",
        "title": "随手拍一拍",
        "desc": "下楼时关注角落...",
        "tags": ["环境", "随手做"]
      },
      {
        "level": "互动类",
        "title": "打个招呼",
        "desc": "遇到邻居时主动问好...",
        "tags": ["互动", "邻里"]
      },
      {
        "level": "行动类",
        "title": "组织活动",
        "desc": "发起一次社区活动...",
        "tags": ["组织", "社区"]
      }
    ]
  `

  // 2. 构造 User Prompt
  // 增加随机噪声和多样性要求，防止模型或 API 层的缓存导致结果重复
  const salt = Date.now();
  
  // 构造 User Prompt
  let angleRequirement = '';
  if (angle) {
    angleRequirement = `1. 必须从"${angle}"切入，基于上述筛选的相关案例，创造全新的、与之前完全不同的建议`;
  } else {
    angleRequirement = '1. 建议要具体针对议题，要有创新性';
  }
  
  const userPrompt = `我在关注这件事，"${keyword}"，想知道我作为社区的生活者可以做些什么，请给我建议。

重要要求：
${angleRequirement}
2. 建议要具体针对"${keyword}"这个议题，不要泛泛而谈
3. 每次生成必须完全不同，要有创新性和多样性
4. 参考上述案例的风格和思路，但必须原创，严禁直接模仿或改写

[Ref: ${salt}]`

  try {
    // 3. 调用 AI 接口
    const response = await axios.post(API_URL, {
      model: "deepseek-chat", // 使用更通用的模型名称，如 deepseek-chat (V3) 或 deepseek-reasoner (R1)
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 1.2, // 提高温度值，增加输出的随机性和创造性 
      max_tokens: 2000, // 增加 token 限制，确保能返回完整内容
      // 移除 response_format，让 AI 直接返回数组格式的 JSON
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 40000 // 超时时间设置为40秒，给AI更多思考时间
    })

    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      throw new Error('AI 返回数据结构异常');
    }

    const aiText = response.data.choices[0].message.content
    console.log('AI Original Response:', aiText)

    // 4. 数据清洗和解析
    let suggestions = null
    
    try {
      // 清除可能存在的 Markdown 标记和首尾空白
      let cleanJsonStr = aiText.replace(/```json/g, '').replace(/```/g, '').trim()
      
      // 尝试直接解析
      try {
        const parsed = JSON.parse(cleanJsonStr)
        // 如果解析成功，检查格式
        if (Array.isArray(parsed)) {
          suggestions = parsed
        } else if (parsed.data && Array.isArray(parsed.data)) {
          suggestions = parsed.data
        } else if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
          suggestions = parsed.suggestions
        } else if (typeof parsed === 'object') {
          // 如果是对象，尝试提取数组字段
          const keys = Object.keys(parsed)
          for (const key of keys) {
            if (Array.isArray(parsed[key])) {
              suggestions = parsed[key]
              break
            }
          }
        }
      } catch (parseErr) {
        // 如果直接解析失败，尝试提取 JSON 部分
        console.log('直接解析失败，尝试提取 JSON 部分:', parseErr.message)
        
        // 尝试找到 JSON 数组
        const arrayMatch = cleanJsonStr.match(/\[[\s\S]*\]/)
        if (arrayMatch) {
          suggestions = JSON.parse(arrayMatch[0])
        } else {
          // 尝试找到 JSON 对象
          const objectMatch = cleanJsonStr.match(/\{[\s\S]*\}/)
          if (objectMatch) {
            const parsed = JSON.parse(objectMatch[0])
            if (Array.isArray(parsed.data)) {
              suggestions = parsed.data
            } else if (Array.isArray(parsed.suggestions)) {
              suggestions = parsed.suggestions
            } else {
              // 查找对象中的数组字段
              const keys = Object.keys(parsed)
              for (const key of keys) {
                if (Array.isArray(parsed[key])) {
                  suggestions = parsed[key]
                  break
                }
              }
            }
          }
        }
      }
      
      // 如果还是没有找到，抛出错误
      if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
        throw new Error('无法从 AI 响应中提取有效的建议数组')
      }
      
    } catch (parseError) {
      console.error('JSON 解析失败:', parseError.message)
      console.error('原始内容:', aiText)
      throw new Error(`JSON 解析失败: ${parseError.message}。原始内容: ${aiText.substring(0, 200)}...`)
    }

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
