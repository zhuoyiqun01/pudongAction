// pages/home/index.js
Page({
  data: {
    // 页面数据
    loading: false
  },

  onLoad: function (options) {
    // 页面加载时的初始化
    console.log('首页加载')
  },

  onShow: function () {
    // 页面显示时
  },

  onHide: function () {
    // 页面隐藏时
  },

  onUnload: function () {
    // 页面卸载时
  },

  // 事件处理函数
  onJoinTap: function () {
    // 跳转到加入页面
    wx.switchTab({
      url: '/pages/join/index'
    })
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    // 停止下拉刷新
    wx.stopPullDownRefresh()
  },

  // 分享功能
  onShareAppMessage: function () {
    return {
      title: '社区小事 - 在家门口的五十米，做一件小事',
      path: '/pages/home/index',
      imageUrl: 'https://picsum.photos/seed/community-share/500/400'
    }
  },

  onShareTimeline: function () {
    return {
      title: '社区小事 - 在家门口的五十米，做一件小事',
      imageUrl: 'https://picsum.photos/seed/community-share/500/400'
    }
  }
})
