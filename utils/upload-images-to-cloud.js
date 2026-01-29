/**
 * 批量上传图片到云存储的工具脚本
 * 使用方法：
 * 1. 在微信开发者工具中打开项目
 * 2. 在小程序页面中调用此脚本（通过开发者工具的控制台或创建一个临时页面）
 * 
 * 或者使用 Node.js 脚本版本（需要配置云开发环境）
 */

// 小程序端使用版本
const uploadImagesToCloud = {
  // 上传单个图片
  async uploadSingleImage(filePath, category, options = {}) {
    return new Promise((resolve, reject) => {
      // 先读取文件
      const fs = wx.getFileSystemManager()
      fs.readFile({
        filePath: filePath,
        success: (res) => {
          // 生成云存储路径
          const fileName = filePath.split('/').pop()
          const cloudPath = `images/${category}/${fileName}`
          
          // 上传到云存储
          wx.cloud.uploadFile({
            cloudPath: cloudPath,
            filePath: filePath,
            success: (uploadRes) => {
              console.log('上传成功:', uploadRes.fileID)
              
              // 保存配置到数据库
              wx.cloud.callFunction({
                name: 'uploadImage',
                data: {
                  cloudPath: uploadRes.fileID, // 使用 cloudPath 参数
                  category: category,
                  name: options.name || fileName.split('.')[0],
                  page: options.page,
                  type: options.type,
                  order: options.order
                },
                success: (configRes) => {
                  if (configRes.result.success) {
                    resolve({
                      fileID: uploadRes.fileID,
                      config: configRes.result.data
                    })
                  } else {
                    reject(new Error(configRes.result.message || '保存配置失败'))
                  }
                },
                fail: reject
              })
            },
            fail: reject
          })
        },
        fail: reject
      })
    })
  },

  // 批量上传 Banner 图片
  async uploadBannerImages(page = 'leaders') {
    const images = [
      '/images/banners/leaders/leaders1.jpeg',
      '/images/banners/leaders/leaders2.jpeg',
      '/images/banners/leaders/leaders3.jpeg',
      '/images/banners/leaders/leaders4.png',
      '/images/banners/leaders/leaders5.jpeg',
      '/images/banners/leaders/leaders6.jpeg',
    ]

    const results = []
    for (let i = 0; i < images.length; i++) {
      try {
        const result = await this.uploadSingleImage(images[i], 'banner', {
          page: page,
          order: i + 1
        })
        results.push(result)
        console.log(`上传进度: ${i + 1}/${images.length}`)
      } catch (error) {
        console.error(`上传失败 ${images[i]}:`, error)
      }
    }
    return results
  },

  // 批量上传 Icon 图片
  async uploadIconImages() {
    const icons = [
      { path: '/images/icons/action-icon.png', name: 'action-icon' },
      { path: '/images/icons/generator-icon.png', name: 'generator-icon' },
      { path: '/images/icons/learn-more-arrow.png', name: 'learn-more-arrow' },
      { path: '/images/icons/more-arrow.png', name: 'more-arrow' },
    ]

    const results = []
    for (const icon of icons) {
      try {
        const result = await this.uploadSingleImage(icon.path, 'icon', {
          name: icon.name
        })
        results.push(result)
      } catch (error) {
        console.error(`上传失败 ${icon.path}:`, error)
      }
    }
    return results
  },

  // 批量上传 TabBar Icon 图片
  async uploadTabBarImages() {
    const tabbarIcons = [
      { path: '/images/tabbar/home.png', page: 'home', type: 'icon' },
      { path: '/images/tabbar/home-active.png', page: 'home', type: 'selectedIcon' },
      { path: '/images/tabbar/generator.png', page: 'generator', type: 'icon' },
      { path: '/images/tabbar/generator-active.png', page: 'generator', type: 'selectedIcon' },
      { path: '/images/tabbar/action.png', page: 'action-hub', type: 'icon' },
      { path: '/images/tabbar/action-active.png', page: 'action-hub', type: 'selectedIcon' },
    ]

    const results = []
    for (const icon of tabbarIcons) {
      try {
        const result = await this.uploadSingleImage(icon.path, 'tabbar', {
          page: icon.page,
          type: icon.type,
          name: `${icon.page}-${icon.type}`
        })
        results.push(result)
      } catch (error) {
        console.error(`上传失败 ${icon.path}:`, error)
      }
    }
    return results
  },

  // 一键上传所有图片
  async uploadAll() {
    console.log('开始上传所有图片...')
    
    const [banners, icons, tabbar] = await Promise.all([
      this.uploadBannerImages('leaders'),
      this.uploadIconImages(),
      this.uploadTabBarImages()
    ])

    console.log('上传完成!')
    console.log('Banner:', banners.length, '个')
    console.log('Icon:', icons.length, '个')
    console.log('TabBar:', tabbar.length, '个')

    return { banners, icons, tabbar }
  }
}

// 导出供小程序使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = uploadImagesToCloud
}

// 如果在小程序环境中，挂载到全局
if (typeof wx !== 'undefined') {
  wx.uploadImagesToCloud = uploadImagesToCloud
}

