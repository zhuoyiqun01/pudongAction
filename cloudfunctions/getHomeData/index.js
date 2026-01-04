const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    // 1. 获取轮播图
    const banners = await db.collection('banners')
      .where({ status: 'show' })
      .orderBy('order', 'asc')
      .get()

    // 2. 获取所有行动卡片
    const actions = await db.collection('actions')
      .orderBy('createdAt', 'desc')
      .get()

    // 3. 获取筛选器配置
    const regions = await db.collection('regions').orderBy('order', 'asc').get()
    const topics = await db.collection('topics').orderBy('order', 'asc').get()

    return {
      success: true,
      data: {
        banners: banners.data,
        actions: actions.data,
        regions: regions.data,
        topics: topics.data
      }
    }
  } catch (e) {
    console.error(e)
    return { success: false, msg: e.message }
  }
}

