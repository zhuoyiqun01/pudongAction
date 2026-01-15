// 云函数：首页初始化配置 (Banners, Regions, Topics)
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    // 使用 Promise.all 并发请求，提升加载速度
    const [bannersRes, regionsRes, topicsRes] = await Promise.all([
      // 1. 获取轮播图 (只取展示中的，限制数量)
      db.collection('activities')
        .where({ 
          status: 'show',   // 修正：使用 status: 'show'
          published: true 
        })
        .orderBy('order', 'asc')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get(),
      
      // 2. 获取筛选器 - 地区 (普陀区街道)
      db.collection('regions')
        .orderBy('order', 'asc')
        .get(),
      
      // 3. 获取筛选器 - 议题
      db.collection('topics')
        .orderBy('order', 'asc')
        .get()
    ])

    return {
      success: true,
      data: {
        banners: bannersRes.data,
        regions: regionsRes.data,
        topics: topicsRes.data
      },
      message: '初始化成功'
    }

  } catch (error) {
    console.error('首页初始化数据获取失败:', error)
    return {
      success: false,
      message: '获取失败',
      error: error.message
    }
  }
}
