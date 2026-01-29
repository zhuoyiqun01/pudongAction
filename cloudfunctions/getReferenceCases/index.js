// 云函数：获取参考案例数据
// 将 reference-cases 从代码迁移到数据库，减少云函数体积
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { angle } = event // 可选：根据角度筛选

    // 从数据库获取所有案例
    let query = db.collection('reference_cases')
    
    // 如果指定了角度，可以根据角度筛选（需要在数据库中存储角度标签）
    // 目前先返回所有案例
    const result = await query.get()

    const cases = result.data.map(item => item.text || item.case)

    // 根据角度筛选（如果提供了角度）
    let filteredCases = cases
    if (angle) {
      filteredCases = filterCasesByAngle(cases, angle)
    }

    return {
      success: true,
      data: filteredCases,
      total: filteredCases.length
    }

  } catch (error) {
    console.error('获取参考案例失败:', error)
    return {
      success: false,
      message: '获取失败',
      error: error.message
    }
  }
}

// 根据角度筛选相关案例（从 generateActionSuggestion 复制）
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



