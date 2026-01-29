// 云函数：保存图片配置到数据库（图片已通过小程序端上传到云存储）
// 注意：此云函数不负责实际上传，只负责保存配置
// 图片上传应该在小程序端使用 wx.cloud.uploadFile 完成
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { cloudPath, category, name, page, type, order } = event

    if (!cloudPath || !category) {
      return {
        success: false,
        message: '缺少必要参数：cloudPath 和 category'
      }
    }

    // 保存配置到数据库
    const configData = {
      category, // 'banner', 'icon', 'tabbar'
      cloudPath: cloudPath,
      url: cloudPath, // 兼容字段
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }

    if (name) configData.name = name
    if (page) configData.page = page // 'leaders', 'activists', 'home', 'generator', 'action-hub'
    if (type) configData.type = type // 'icon' or 'selectedIcon' (for tabbar)
    if (order !== undefined) configData.order = order

    const result = await db.collection('image_config').add({
      data: configData
    })

    return {
      success: true,
      data: {
        id: result._id,
        cloudPath: cloudPath,
        ...configData
      },
      message: '保存成功'
    }

  } catch (error) {
    console.error('保存图片配置失败:', error)
    return {
      success: false,
      message: '保存失败',
      error: error.message
    }
  }
}

