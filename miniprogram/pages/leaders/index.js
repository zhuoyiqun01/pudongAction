// pages/leaders/index.js
Page({
  data: {
    // 页面数据
    leaders: [],
    loading: true,
    selectedStreet: '',
    searchQuery: '',
    streets: ['长征镇', '曹杨新村街道', '长寿路街道', '甘泉路街道', '万里街道'],

    // 分页相关
    page: 1,
    limit: 10,
    hasMore: true,
    loadingMore: false
  },

  onLoad: function (options) {
    // 页面加载时的初始化
    this.loadLeaders()
  },

  onShow: function () {
    // 页面显示时
  },

  // 加载领导者数据
  async loadLeaders(isLoadMore = false) {
    if (this.data.loadingMore) return

    try {
      if (isLoadMore) {
        this.setData({ loadingMore: true })
      } else {
        this.setData({ loading: true, page: 1, hasMore: true })
      }

      const { selectedStreet, searchQuery, page, limit } = this.data

      // 调用云函数获取数据
      const result = await wx.cloud.callFunction({
        name: 'getLeaders',
        data: {
          page: isLoadMore ? page : 1,
          limit,
          street: selectedStreet || undefined,
          search: searchQuery || undefined
        }
      })

      if (result.result.success) {
        const { items, hasNext } = result.result.data

        this.setData({
          leaders: isLoadMore ? [...this.data.leaders, ...items] : items,
          hasMore: hasNext,
          page: isLoadMore ? page + 1 : 2,
          loading: false,
          loadingMore: false
        })
      } else {
        throw new Error(result.result.message)
      }

    } catch (error) {
      console.error('加载领导者数据失败:', error)
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
    this.loadLeaders()
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
    this.loadLeaders()
  },

  // 加载更多
  onLoadMore: function () {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadLeaders(true)
    }
  },

  // 领导者卡片点击
  onLeaderTap: function (e) {
    const id = e.currentTarget.dataset.id
    // 显示联系方式
    const leader = this.data.leaders.find(item => item._id === id)
    if (leader) {
      wx.showModal({
        title: '联系方式',
        content: `联系人：${leader.name}\n电话：${leader.contact}\n社区：${leader.community}`,
        showCancel: true,
        confirmText: '拨打电话',
        success: (res) => {
          if (res.confirm) {
            wx.makePhoneCall({
              phoneNumber: leader.contact
            })
          }
        }
      })
    }
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
    this.loadLeaders().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 分享功能
  onShareAppMessage: function () {
    return {
      title: '社区带领人 - 他们引领社区前行',
      path: '/pages/leaders/index'
    }
  }
})
