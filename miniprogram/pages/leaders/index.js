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

      // 调用云函数获取数据 - 暂时注释，审核期间不启用云服务
      // const result = await wx.cloud.callFunction({
      //   name: 'getLeaders',
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
      //     leaders: isLoadMore ? [...this.data.leaders, ...items] : items,
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
          _id: 'l1',
          name: '倪小倩',
          street: '长征镇',
          community: '象源丽都社区',
          role: '社区书记',
          slogan: '每一个小小的改变，都是社区幸福的起点。',
          contact: '021-12345678',
          photo: 'https://picsum.photos/seed/leader1/400/400'
        },
        {
          _id: 'l2',
          name: '陈骏',
          street: '曹杨新村街道',
          community: '社区骨干',
          role: '街道专员',
          slogan: '邻里之间，小事里见真情，行动中显担当。',
          contact: '021-22334455',
          photo: 'https://picsum.photos/seed/leader2/400/400'
        },
        {
          _id: 'l3',
          name: '李嘉',
          street: '长寿路街道',
          community: '共建单位负责人',
          role: '社区规划师',
          slogan: '让社区的角落都有光，让居民的愿望都有响。',
          contact: '021-33445566',
          photo: 'https://picsum.photos/seed/leader3/400/400'
        }
      ]

      // 模拟异步延迟
      setTimeout(() => {
        this.setData({
          leaders: isLoadMore ? [...this.data.leaders, ...mockData] : mockData,
          hasMore: !isLoadMore, // 第一次加载后不再加载更多
          page: isLoadMore ? page + 1 : 2,
          loading: false,
          loadingMore: false
        })
      }, 1000)

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
