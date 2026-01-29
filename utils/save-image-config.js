/**
 * 保存图片配置到数据库的工具
 * 将云存储中的图片路径保存到 image_config 集合
 * 
 * 使用方法：
 * 1. 在小程序控制台运行此脚本
 * 2. 或者在小程序页面中调用
 */

const saveImageConfig = {
  // 保存单个图片配置
  async saveSingle(config) {
    const { cloudPath, category, name, page, type, order } = config
    
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'uploadImage',
        data: {
          cloudPath: cloudPath,
          category: category,
          name: name,
          page: page,
          type: type,
          order: order
        },
        success: (res) => {
          if (res.result.success) {
            console.log('✅ 保存成功:', res.result.data)
            resolve(res.result.data)
          } else {
            reject(new Error(res.result.message || '保存失败'))
          }
        },
        fail: reject
      })
    })
  },

  // 批量保存 Banner 图片配置
  async saveBannerImages(cloudFileIDs, page = 'leaders') {
    console.log(`开始保存 ${cloudFileIDs.length} 个 Banner 图片配置...`)
    
    const results = []
    for (let i = 0; i < cloudFileIDs.length; i++) {
      try {
        const fileName = cloudFileIDs[i].split('/').pop()
        const result = await this.saveSingle({
          cloudPath: cloudFileIDs[i],
          category: 'banner',
          page: page,
          order: i + 1,
          name: fileName.split('.')[0] // 去掉扩展名
        })
        results.push(result)
        console.log(`✅ 进度: ${i + 1}/${cloudFileIDs.length} - ${fileName}`)
      } catch (error) {
        console.error(`❌ 保存失败 (${i + 1}):`, error)
      }
    }
    
    console.log(`🎉 完成！成功保存 ${results.length}/${cloudFileIDs.length} 个配置`)
    return results
  },

  // 批量保存 Icon 图片配置
  async saveIconImages(iconConfigs) {
    console.log(`开始保存 ${iconConfigs.length} 个 Icon 图片配置...`)
    
    const results = []
    for (const config of iconConfigs) {
      try {
        const result = await this.saveSingle({
          cloudPath: config.cloudPath,
          category: 'icon',
          name: config.name
        })
        results.push(result)
        console.log(`✅ 保存成功: ${config.name}`)
      } catch (error) {
        console.error(`❌ 保存失败 (${config.name}):`, error)
      }
    }
    
    console.log(`🎉 完成！成功保存 ${results.length}/${iconConfigs.length} 个配置`)
    return results
  },

  // 批量保存 TabBar 图标配置
  async saveTabBarImages(tabbarConfigs) {
    console.log(`开始保存 ${tabbarConfigs.length} 个 TabBar 图标配置...`)
    
    const results = []
    for (const config of tabbarConfigs) {
      try {
        const result = await this.saveSingle({
          cloudPath: config.cloudPath,
          category: 'tabbar',
          page: config.page,
          type: config.type, // 'icon' 或 'selectedIcon'
          name: `${config.page}-${config.type}`
        })
        results.push(result)
        console.log(`✅ 保存成功: ${config.page}-${config.type}`)
      } catch (error) {
        console.error(`❌ 保存失败 (${config.page}-${config.type}):`, error)
      }
    }
    
    console.log(`🎉 完成！成功保存 ${results.length}/${tabbarConfigs.length} 个配置`)
    return results
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = saveImageConfig
}

// 挂载到全局
if (typeof wx !== 'undefined') {
  wx.saveImageConfig = saveImageConfig
}



