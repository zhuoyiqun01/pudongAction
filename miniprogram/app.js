// 小程序入口文件
App({
  onLaunch: function (options) {
    // 小程序启动时的初始化工作
    console.log('小程序启动')

    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-3g71minke37b68b6', // 改回有效的 ID
        traceUser: true,
      })
    }

    // 获取系统信息
    const res = wx.getSystemInfoSync()
    this.globalData.systemInfo = res
    this.globalData.statusBarHeight = res.statusBarHeight
    this.globalData.navBarHeight = res.statusBarHeight + 44
  },

  onShow: function (options) {
    // 小程序显示时的操作
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
    }
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
