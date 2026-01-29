// pages/activists/index.js
Page({
  data: {
    // 页面数据
    activists: [],
    loading: true,
    selectedStreet: '',
    searchQuery: '',
    streets: ['长寿路街道', '曹杨新村街道', '长风新村街道', '甘泉路街道', '万里街道'],

    // Banner 图片列表（请将图片放在 miniprogram/images/banners/activists/ 目录下）
    banners: [
      // '/images/banners/activists/banner1.jpg',
      // '/images/banners/activists/banner2.jpg',
      // '/images/banners/activists/banner3.jpg',
    ],

    // 分页相关
    page: 1,
    limit: 10,
    hasMore: true,
    loadingMore: false
  },

  onLoad: function (options) {
    // 页面加载时的初始化
    this.loadActivists()
  },

  onShow: function () {
    // 页面显示时
  },

  // 加载活动家数据
  async loadActivists(isLoadMore = false) {
    if (this.data.loadingMore) return

    try {
      if (isLoadMore) {
        this.setData({ loadingMore: true })
      } else {
        this.setData({ loading: true, page: 1, hasMore: true })
      }

      const { selectedStreet, searchQuery, page, limit } = this.data

      // 调用云函数获取数据 - 暂时注释，审核期间不启用云服务
      // const result = await wx.cloud.callFunction({
      //   name: 'getActivists',
      //   data: {
      //     page: isLoadMore ? page : 1,
      //     limit,
      //     street: selectedStreet || undefined,
      //     search: searchQuery || undefined
      //   }
      // })

      // if (result.result.success) {
      //   const { items, hasNext } = result.result.data

      //   this.setData({
      //     activists: isLoadMore ? [...this.data.activists, ...items] : items,
      //     hasMore: hasNext,
      //     page: isLoadMore ? page + 1 : 2,
      //     loading: false,
      //     loadingMore: false
      //   })
      // } else {
      //   throw new Error(result.result.message)
      // }

      // 暂时使用模拟数据
      const mockData = [
        {
          _id: '1',
          name: '张建国',
          tag: '环保卫士',
          photo: 'https://picsum.photos/seed/a1/800/1000',
          bio: '在社区坚持推广垃圾分类3年，带动了超过200户家庭加入。他相信每一份微小的坚持都能改变环境。',
          street: '长寿路街道'
        },
        {
          _id: '2',
          name: '李梅',
          tag: '绿意使者',
          photo: 'https://picsum.photos/seed/a2/800/1000',
          bio: '将废弃空地改造为微型花园，为邻里提供休闲好去处。她认为自然的绿色是社区最温暖的底色。',
          street: '长寿路街道'
        },
        {
          _id: '3',
          name: '王小明',
          tag: '教育辅助',
          photo: 'https://picsum.photos/seed/a3/800/1000',
          bio: '利用周末时间为社区外来务工子弟辅导功课。用知识点亮孩子们的未来。',
          street: '曹杨新村街道'
        }
      ]

      // 模拟异步延迟
      setTimeout(() => {
        this.setData({
          activists: isLoadMore ? [...this.data.activists, ...mockData] : mockData,
          hasMore: !isLoadMore, // 第一次加载后不再加载更多
          page: isLoadMore ? page + 1 : 2,
          loading: false,
          loadingMore: false
        })
      }, 1000)

    } catch (error) {
      console.error('加载活动家数据失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })

      this.setData({
        loading: false,
        loadingMore: false
      })
    }
  },

  // 街道筛选
  onStreetFilter: function (e) {
    const street = e.currentTarget.dataset.street
    this.setData({
      selectedStreet: street,
      page: 1,
      hasMore: true
    })
    this.loadActivists()
  },

  // 搜索输入
  onSearchInput: function (e) {
    this.setData({
      searchQuery: e.detail.value
    })
  },

  // 搜索确认
  onSearchConfirm: function () {
    this.setData({
      page: 1,
      hasMore: true
    })
    this.loadActivists()
  },

  // 加载更多
  onLoadMore: function () {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadActivists(true)
    }
  },

  // 活动家卡片点击
  onActivistTap: function (e) {
    const id = e.currentTarget.dataset.id
    // 跳转到活动家详情页（如果有的话）
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 图片加载错误处理
  onImageError: function (e) {
    console.log('图片加载失败:', e)
    // 可以设置默认头像
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      hasMore: true
    })
    this.loadActivists().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 分享功能
  onShareAppMessage: function () {
    return {
      title: '社区活动家 - 他们用行动温暖社区',
      path: '/pages/activists/index'
    }
  }
})
