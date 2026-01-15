const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { limit = 20, type = 'all' } = event
    
    let query = { 
      published: true 
    }

    // 如果指定了 banner 类型，则只取 banner
    if (type === 'banner') {
      query.isBanner = true
    }

    const activities = await db.collection('activities')
      .where(query)
      .orderBy('order', 'asc')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()

    return {
      success: true,
      data: activities.data,
      message: '获取活动成功'
    }
  } catch (e) {
    console.error(e)
    return { success: false, message: e.message }
  }
}





