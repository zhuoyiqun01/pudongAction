// 云函数：获取图片配置（Banners、Icons、TabBar Icons）
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { type } = event // 'banners', 'icons', 'tabbar', 'all'

    // 如果请求所有类型，并发获取
    if (type === 'all' || !type) {
      const [bannersRes, iconsRes, logoRes, tabbarRes] = await Promise.all([
        // 1. 获取 Banner 图片配置
        db.collection('image_config')
          .where({ category: 'banner' })
          .orderBy('order', 'asc')
          .get(),
        
        // 2. 获取 Icon 图片配置
        db.collection('image_config')
          .where({ category: 'icon' })
          .get(),
        
        // 3. 获取 Logo 配置
        db.collection('image_config')
          .where({ category: 'logo' })
          .get(),
        
        // 4. 获取 TabBar Icon 配置
        db.collection('image_config')
          .where({ category: 'tabbar' })
          .get()
      ])

      return {
        success: true,
        data: {
          banners: bannersRes.data.map(item => ({
            id: item._id,
            url: item.cloudPath || item.url,
            page: item.page, // 'leaders', 'activists', 'home'
            order: item.order || 0
          })),
          icons: iconsRes.data.reduce((acc, item) => {
            acc[item.name] = item.cloudPath || item.url
            return acc
          }, {}),
          logo: logoRes.data.length > 0 ? (logoRes.data[0].cloudPath || logoRes.data[0].url) : null,
          tabbar: tabbarRes.data.reduce((acc, item) => {
            if (!acc[item.page]) acc[item.page] = {}
            acc[item.page][item.type] = item.cloudPath || item.url // type: 'icon' or 'selectedIcon'
            return acc
          }, {})
        }
      }
    }

    // 根据类型返回对应数据
    let query = db.collection('image_config')
    
    if (type === 'banners') {
      query = query.where({ category: 'banner' }).orderBy('order', 'asc')
    } else if (type === 'icons') {
      query = query.where({ category: 'icon' })
    } else if (type === 'logo') {
      query = query.where({ category: 'logo' })
    } else if (type === 'tabbar') {
      query = query.where({ category: 'tabbar' })
    }

    const result = await query.get()

    return {
      success: true,
      data: result.data.map(item => ({
        id: item._id,
        url: item.cloudPath || item.url,
        ...(item.page && { page: item.page }),
        ...(item.name && { name: item.name }),
        ...(item.type && { type: item.type }),
        ...(item.order && { order: item.order })
      }))
    }

  } catch (error) {
    console.error('获取图片配置失败:', error)
    return {
      success: false,
      message: '获取失败',
      error: error.message
    }
  }
}


