// pages/leaders/index.js
Page({
  data: {
    // --- 修改 1: 数据源拆分 ---
    goldLeaders: [],   // 存放金牌带领人 (用于顶部展示)
    leaders: [],       // 存放普通带领人 (用于列表展示)
    
    loading: true,
    selectedStreet: '',
    selectedStreetText: '全部街道',
    streetDropdownOpen: false,
    streets: [], // 改为动态获取

    // 分页相关
    page: 1,
    limit: 10,
    hasMore: true,
    loadingMore: false
  },

  onLoad: function (options) {
    this.loadStreets()
    this.loadLeaders()
  },

  /**
   * 动态加载街道列表
   */
  loadStreets: function() {
    wx.cloud.callFunction({
      name: 'getHomeConfig',
      success: res => {
        if (res.result && res.result.success) {
          const { regions } = res.result.data;
          // 过滤掉“全部地区”选项，因为 UI 已经有了一个手写的“全部”按钮
          const streetNames = regions
            .filter(r => r.id !== 'all')
            .map(r => r.name);
          this.setData({ streets: streetNames });
        }
      }
    })
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
        // 如果是刷新，重置所有数据
        this.setData({ 
          loading: true, 
          page: 1, 
          hasMore: true, 
          goldLeaders: [], 
          leaders: [] 
        })
      }

      const { selectedStreet, page, limit } = this.data

      // 1. 尝试从云函数获取数据
      let items = [];
      let hasNext = false;
      
      try {
        const result = await wx.cloud.callFunction({
          name: 'getLeaders',
          data: {
            page: isLoadMore ? page : 1,
            limit,
            street: selectedStreet || undefined
          }
        })

        if (result.result && result.result.success) {
          items = result.result.data.items;
          hasNext = result.result.data.hasNext;
        } else {
          throw new Error('云函数返回失败');
        }
      } catch (e) {
        console.warn('云函数调用失败，使用模拟数据 fallback:', e);
        // --- 模拟数据更新 (添加 is_gold_medal 和 wechat_id 字段) ---
        const mockData = [
          {
            _id: 'l1',
            name: '倪小倩',
            street: '长征镇',
            community: '象源丽都社区',
            role: '社区书记',
            is_gold_medal: true, // 🌟 标记为金牌
            slogan: '每一个小小的改变，都是社区幸福的起点。',
            contact: '13800000001',
            wechat_id: 'nini_123',
            photo: 'https://picsum.photos/seed/leader1/400/400'
          },
          {
            _id: 'l2',
            name: '陈骏',
            street: '曹杨新村街道',
            community: '社区骨干',
            role: '街道专员',
            is_gold_medal: false,
            slogan: '邻里之间，小事里见真情，行动中显担当。',
            contact: '13800000002',
            wechat_id: 'chen_456',
            photo: 'https://picsum.photos/seed/leader2/400/400'
          },
          {
            _id: 'l3',
            name: '李嘉',
            street: '长寿路街道',
            community: '共建单位负责人',
            role: '社区规划师',
            is_gold_medal: false,
            slogan: '让社区的角落都有光，让居民的愿望都有响。',
            contact: '13800000003',
            wechat_id: 'li_789',
            photo: 'https://picsum.photos/seed/leader3/400/400'
          }
        ];
        items = mockData;
        hasNext = false;
      }

      // --- 修改 2: 数据分流逻辑 ---
      this.processLeaderData(items, isLoadMore, hasNext);

      this.setData({
        loading: false,
        loadingMore: false
      })

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

  // --- 新增：核心分流函数 ---
  processLeaderData: function(newItems, isAppend, hasNext) {
    let newGold = [];
    let newNormal = [];

    // 根据 is_gold_medal 字段分流
    newItems.forEach(item => {
      if (item.is_gold_medal) {
        newGold.push(item);
      } else {
        newNormal.push(item);
      }
    });

    if (!isAppend) {
      // 刷新/首次加载模式
      this.setData({
        goldLeaders: newGold,
        leaders: newNormal,
        page: 2,
        hasMore: hasNext
      });
    } else {
      // 加载更多模式：金牌通常只在第一页，后续页数据全部追加到 leaders
      this.setData({
        leaders: this.data.leaders.concat(newItems),
        page: this.data.page + 1,
        hasMore: hasNext
      });
    }
  },

  /**
   * 切换街道下拉框
   */
  toggleStreetDropdown: function() {
    this.setData({
      streetDropdownOpen: !this.data.streetDropdownOpen
    });
  },

  // 街道筛选
  onStreetFilter: function (e) {
    const street = e.currentTarget.dataset.street
    this.setData({
      selectedStreet: street,
      selectedStreetText: street || '全部街道',
      streetDropdownOpen: false,
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

  // 针对金牌或普通带领人的点击
  onLeaderTap: function (e) {
    // 兼容逻辑：优先取 e.detail.id (组件传来的)，如果没有，取 e.currentTarget.dataset.id (原生view传来的)
    const id = e.detail.id || e.currentTarget.dataset.id;
    if (!id) return;

    // 优先在 leaders 找，找不到去 goldLeaders 找
    let leader = this.data.leaders.find(item => item._id === id)
    if (!leader) {
      leader = this.data.goldLeaders.find(item => item._id === id)
    }

    if (leader) {
      wx.showActionSheet({
        itemList: ['拨打电话', '复制微信号'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 打电话
            wx.makePhoneCall({
              phoneNumber: leader.contact
            })
          } else if (res.tapIndex === 1) {
            // 复制微信
            if (leader.wechat_id) {
              wx.setClipboardData({
                data: leader.wechat_id,
                success: () => {
                  wx.showToast({
                    title: '微信号已复制',
                    icon: 'success'
                  })
                }
              })
            } else {
              wx.showToast({
                title: '暂无微信号记录',
                icon: 'none'
              })
            }
          }
        }
      })
    }
  },

  // 图片加载错误处理
  onImageError: function (e) {
    console.log('图片加载失败:', e)
  },

  // 下拉刷新
  onPullDownRefresh: async function () {
    this.setData({
      page: 1,
      hasMore: true
    })
    await this.loadLeaders()
    wx.stopPullDownRefresh()
  },

  // 分享功能
  onShareAppMessage: function () {
    return {
      title: '社区带领人 - 他们引领社区前行',
      path: '/pages/leaders/index'
    }
  }
})
