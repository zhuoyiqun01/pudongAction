// pages/join/index.js
Page({
  data: {
    // 表单数据
    formData: {
      name: '',
      phone: '',
      street: '',
      bio: '',
      interests: []
    },

    // 选项数据
    streets: [
      '长寿路街道',
      '曹杨新村街道',
      '长风新村街道',
      '甘泉路街道',
      '万里街道',
      '长征镇',
      '其他'
    ],
    streetIndex: -1,

    interestOptions: [
      { label: '垃圾分类', value: 'garbage_sorting' },
      { label: '社区花园', value: 'community_garden' },
      { label: '志愿服务', value: 'volunteer' },
      { label: '邻里互助', value: 'neighborhood_help' },
      { label: '环保活动', value: 'environmental' },
      { label: '文化活动', value: 'cultural' },
      { label: '儿童教育', value: 'education' },
      { label: '老年人服务', value: 'elderly_care' }
    ],

    // 页面状态
    submitting: false
  },

  onLoad: function (options) {
    // 页面加载时的初始化
  },

  onShow: function () {
    // 页面显示时
  },

  // 输入框变化处理
  onInputChange: function (e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value

    this.setData({
      [`formData.${field}`]: value
    })
  },

  // 街道选择器变化
  onStreetChange: function (e) {
    const index = e.detail.value
    const street = this.data.streets[index]

    this.setData({
      streetIndex: index,
      'formData.street': street
    })
  },

  // 兴趣标签切换
  onInterestToggle: function (e) {
    const value = e.currentTarget.dataset.value
    const interests = [...this.data.formData.interests]

    const index = interests.indexOf(value)
    if (index > -1) {
      // 移除
      interests.splice(index, 1)
    } else {
      // 添加
      interests.push(value)
    }

    this.setData({
      'formData.interests': interests
    })
  },

  // 表单验证
  validateForm: function () {
    const { name, phone, street } = this.data.formData

    if (!name.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
      return false
    }

    if (!phone.trim()) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return false
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return false
    }

    if (!street) {
      wx.showToast({
        title: '请选择所属街道',
        icon: 'none'
      })
      return false
    }

    return true
  },

  // 提交表单
  onSubmit: async function () {
    if (this.data.submitting) return

    // 表单验证
    if (!this.validateForm()) return

    this.setData({ submitting: true })

    // 模拟提交成功 - 审核期间不调用云服务
    wx.showToast({
      title: '申请提交成功',
      icon: 'success',
      duration: 2000
    })

    // 重置表单
    this.setData({
      formData: {
        name: '',
        phone: '',
        street: '',
        bio: '',
        interests: []
      },
      streetIndex: -1,
      submitting: false
    })

    // 延迟返回首页
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      })
    }, 2000)
  },

  // 分享功能
  onShareAppMessage: function () {
    return {
      title: '加入社区小事 - 在家门口做一件小事',
      path: '/pages/join/index'
    }
  }
})
