// 小程序入口文件
App({
  onLaunch: function (options) {
    // 小程序启动时的初始化工作
    console.log('小程序启动')

    // 初始化云开发 - 暂时注释，审核期间不启用云服务
    // if (!wx.cloud) {
    //   console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    // } else {
    //   wx.cloud.init({
    //     // env 参数说明：
    //     //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
    //     //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
    //     //   如不填则使用默认环境（第一个创建的环境）
    //     env: 'your-env-id-here', // 请替换为你的云环境ID
    //     traceUser: true,
    //   })
    // }

    // 获取系统信息
    wx.getSystemInfo({
      success: res => {
        this.globalData.systemInfo = res
        this.globalData.statusBarHeight = res.statusBarHeight
        this.globalData.navBarHeight = res.statusBarHeight + 44
      }
    })
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
    // 格式化日期
    formatDate: function (date, format = 'YYYY-MM-DD') {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')

      switch (format) {
        case 'YYYY-MM-DD':
          return `${year}-${month}-${day}`
        case 'MM/DD':
          return `${month}/${day}`
        default:
          return `${year}-${month}-${day}`
      }
    },

    // 显示加载提示
    showLoading: function (title = '加载中...') {
      wx.showLoading({
        title: title,
        mask: true
      })
    },

    // 隐藏加载提示
    hideLoading: function () {
      wx.hideLoading()
    },

    // 显示成功提示
    showSuccess: function (title = '操作成功') {
      wx.showToast({
        title: title,
        icon: 'success',
        duration: 2000
      })
    },

    // 显示错误提示
    showError: function (title = '操作失败') {
      wx.showToast({
        title: title,
        icon: 'error',
        duration: 2000
      })
    }
  }
})
