// pages/intro/index.js - 项目介绍页面
Page({
  data: {},

  onLoad: function() {
    // 页面加载时的初始化
  },

  onJoinTap: function() {
    // 跳转到申请页面
    wx.navigateTo({
      url: '/pages/apply/index'
    });
  }
});
