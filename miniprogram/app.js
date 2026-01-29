// 小程序入口文件
App({
  onLaunch: function (options) {
    // 小程序启动时的初始化工作
    console.log('小程序启动', 'scene:', options.scene)

    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-3g71minke37b68b6', // 改回有效的 ID
        traceUser: false, // 不追踪用户，不收集用户信息
      })
    }

    // 获取系统信息
    const res = wx.getSystemInfoSync()
    this.globalData.systemInfo = res
    this.globalData.statusBarHeight = res.statusBarHeight
    this.globalData.navBarHeight = res.statusBarHeight + 44

    // 每次小程序启动时（onLaunch），重置开屏页标志
    // 这样无论是首次启动还是通过分享进入，都会显示开屏页
    // onLaunch 只在小程序首次启动时调用，所以这里重置是安全的
    this.globalData.hasShownIntro = false
    try {
      wx.setStorageSync('hasShownIntro', false)
    } catch (e) {
      console.error('设置本地存储失败:', e)
    }
  },

  onShow: function (options) {
    // 小程序显示时的操作
    // 注意：从右上角退出不会杀后台，再次打开只会触发 onShow，不会触发 onLaunch
    
    // 如果是从分享链接进入（scene 为分享相关场景），重置开屏页标志
    // 使用本地存储确保状态持久化，避免时序问题
    // 常见的分享场景：
    // 1001: 发现栏小程序主入口
    // 1007: 单人聊天会话中的小程序消息卡片
    // 1008: 群聊会话中的小程序消息卡片
    // 1047: 扫描小程序码
    // 1049: 长按识别小程序码
    // 1011: 扫描二维码
    // 1012: 长按图片识别小程序码
    // 1013: 手机相册选取小程序码
    // 1014: 小程序 profile 页
    const shareScenes = [1001, 1007, 1008, 1047, 1049, 1011, 1012, 1013, 1014]
    if (options.scene && shareScenes.includes(options.scene)) {
      // 重置全局变量和本地存储
      this.globalData.hasShownIntro = false
      try {
        wx.setStorageSync('hasShownIntro', false)
      } catch (e) {
        console.error('设置本地存储失败:', e)
      }
    }
  },

  onHide: function () {
    // 小程序隐藏时的操作
  },

  onError: function (msg) {
    // 小程序发生脚本错误或 API 调用失败时触发的回调
    console.error('小程序错误:', msg)
  },

  // 全局数据
  globalData: {
    userInfo: null,
    systemInfo: null,
    statusBarHeight: 0,
    navBarHeight: 0,

    // 品牌颜色配置
    brandColors: {
      primary: '#068D7B',      // 主色 - 翠绿色
      secondary: '#FFE501',    // 辅助色 - 亮黄
      accent1: '#F49B9B',      // 强调色1 - 粉红
      accent2: '#A4CCFE',      // 强调色2 - 淡蓝
      accent3: '#FDC57A',      // 强调色3 - 橙黄
      gray: '#64748b'          // 灰色
    },
    hasShownIntro: false
  },

  // 工具函数
  utils: {
    // 基础 UI 提示
    showLoading: function (title = '加载中...') {
      wx.showLoading({ title, mask: true })
    },
    hideLoading: function () {
      wx.hideLoading()
    },
    showSuccess: function (title = '操作成功') {
      wx.showToast({ title, icon: 'success' })
    },
    showError: function (title = '操作失败') {
      wx.showToast({ title, icon: 'error' })
    }
  }
})
