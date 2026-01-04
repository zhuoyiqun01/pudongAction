const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { limit = 10, type = 'banner' } = event
    
    // 获取活动信息，通常用于首页Banner
    const activities = await db.collection('activities')
      .where({ 
        published: true,
        isBanner: type === 'banner'
      })
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

