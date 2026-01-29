// pages/intro/index.js - 项目介绍页面
const imageConfig = require('../../utils/imageConfig.js')

Page({
  data: {
    logoUrl: '', // 从云存储加载
    moreArrowUrl: '', // 从云存储加载
    puzzleImageUrl: '', // 拼图图片URL（可从云存储加载）
    missionImageUrl: '' // 使命图片URL（可从云存储加载）
  },

  onLoad: async function() {
    // 页面加载时的初始化
    this.loadImages()
  },

  // 加载图片
  async loadImages() {
    try {
      const logoUrl = await imageConfig.getLogo()
      if (logoUrl) {
        this.setData({ logoUrl })
      }
      
      const moreArrowUrl = await imageConfig.getIcon('more-arrow')
      if (moreArrowUrl) {
        this.setData({ moreArrowUrl })
      }
    } catch (error) {
      console.warn('⚠️ 加载图片失败，使用本地路径:', error)
    }
  },

  onJoinTap: function() {
    // 跳转到申请页面
    wx.navigateTo({
      url: '/pages/apply/index'
    });
  },

  // 图片加载错误处理
  onLogoError: function(e) {
    console.warn('Logo 图片加载失败:', e);
  },

  onPuzzleImageError: function(e) {
    console.warn('拼图图片加载失败:', e);
    // 可以设置默认图片
    this.setData({ puzzleImageUrl: '' });
  },

  onMissionImageError: function(e) {
    console.warn('使命图片加载失败:', e);
    // 可以设置默认图片
    this.setData({ missionImageUrl: '' });
  }
});
