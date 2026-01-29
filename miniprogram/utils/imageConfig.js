// 图片配置工具函数
// 用于从云存储获取图片配置

/**
 * 获取图片配置
 * @param {string} type - 类型：'banners', 'icons', 'tabbar', 'logo', 'all'
 * @returns {Promise} 返回图片配置数据
 */
function getImageConfig(type = 'all') {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'getImageConfig',
      data: { type },
      success: res => {
        if (res.result && res.result.success) {
          resolve(res.result.data)
        } else {
          reject(new Error(res.result?.message || '获取图片配置失败'))
        }
      },
      fail: err => {
        reject(err)
      }
    })
  })
}

/**
 * 获取单个图标
 * @param {string} iconName - 图标名称，如 'action-icon', 'generator-icon'
 * @returns {Promise<string>} 返回图标 URL
 */
async function getIcon(iconName) {
  try {
    const config = await getImageConfig('icons')
    // 如果返回的是数组，转换为对象
    if (Array.isArray(config)) {
      const iconObj = config.find(item => item.name === iconName)
      return iconObj ? (iconObj.url || iconObj.cloudPath) : null
    }
    // 如果返回的是对象
    return config[iconName] || null
  } catch (error) {
    console.error('获取图标失败:', error)
    return null
  }
}

/**
 * 获取 Logo
 * @returns {Promise<string>} 返回 Logo URL
 */
async function getLogo() {
  try {
    // Logo 存储在 category='logo' 中
    const config = await getImageConfig('logo')
    if (Array.isArray(config) && config.length > 0) {
      // 返回第一个 logo 的 URL
      return config[0].url || config[0].cloudPath || null
    }
    // 如果获取失败，尝试从 all 配置中获取
    const allConfig = await getImageConfig('all')
    if (allConfig && allConfig.logo) {
      return allConfig.logo
    }
    return null
  } catch (error) {
    console.error('获取 Logo 失败:', error)
    return null
  }
}

/**
 * 获取 Tabbar 图标
 * @param {string} page - 页面名称：'home', 'generator', 'action-hub'
 * @param {string} type - 类型：'icon' 或 'selectedIcon'
 * @returns {Promise<string>} 返回图标 URL
 */
async function getTabbarIcon(page, type = 'icon') {
  try {
    const config = await getImageConfig('tabbar')
    // 如果返回的是数组，转换为对象
    if (Array.isArray(config)) {
      const icon = config.find(item => item.page === page && item.type === type)
      return icon ? (icon.url || icon.cloudPath) : null
    }
    // 如果返回的是对象
    return config[page] && config[page][type] ? config[page][type] : null
  } catch (error) {
    console.error('获取 Tabbar 图标失败:', error)
    return null
  }
}

module.exports = {
  getImageConfig,
  getIcon,
  getLogo,
  getTabbarIcon
}

