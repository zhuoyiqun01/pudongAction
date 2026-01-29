// pages/leaders/index.js
Page({
  data: {
    // 数据源：金牌和普通带领人合并显示
    leaders: [],       // 存放所有带领人（金牌在前，普通在后）
    
    loading: true,
    selectedStreet: '',
    selectedStreetText: '全部街道',
    streetDropdownOpen: false,
    streets: [], // 改为动态获取
    regions: [], // 保存完整的 regions 数据，用于映射

    // Banner 图片列表（从云存储加载）
    banners: [],

    // 分页相关
    page: 1,
    limit: 10,
    hasMore: true,
    loadingMore: false
  },

  onLoad: function (options) {
    // 先加载街道列表，加载完成后再加载带领人数据
    this.loadStreets(() => {
      this.loadLeaders()
    })
    // 加载图片配置（Banner）
    this.loadImageConfig()
  },

  /**
   * 动态加载街道列表
   */
  loadStreets: function(callback) {
    wx.cloud.callFunction({
      name: 'getHomeConfig',
      success: res => {
        if (res.result && res.result.success) {
          const { regions } = res.result.data;
          // 保存完整的 regions 数据，用于映射
          this.setData({ regions: regions });
          // 过滤掉"全部地区"选项，因为 UI 已经有了一个手写的"全部"按钮
          const streetNames = regions
            .filter(r => r.id !== 'all')
            .map(r => r.name);
          this.setData({ streets: streetNames });
          console.log('regions 加载完成，数量:', regions.length);
          if (callback) callback();
        }
      },
      fail: err => {
        console.error('加载 regions 失败:', err);
        if (callback) callback();
      }
    })
  },

  onShow: function () {
    // 页面显示时
  },

  /**
   * 加载图片配置（从云存储）
   */
  loadImageConfig: function() {
    wx.cloud.callFunction({
      name: 'getImageConfig',
      data: { type: 'banners' },
      success: res => {
        if (res.result && res.result.success) {
          // 筛选出 leaders 页面的 banner
          const banners = res.result.data
            .filter(item => item.page === 'leaders')
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(item => item.url || item.cloudPath)
          
          // 如果有云存储的图片，使用云存储；否则保持空数组
          if (banners.length > 0) {
            console.log('✅ 从云存储加载 Banner 图片:', banners.length, '张')
            this.setData({ banners })
          } else {
            console.warn('⚠️ 云存储中没有 Banner 配置')
            this.setData({ banners: [] })
          }
        } else {
          console.warn('⚠️ 获取图片配置失败:', res.result?.message)
          this.setData({ banners: [] })
        }
      },
      fail: err => {
        console.error('❌ 加载图片配置失败:', err)
        // 失败时设置为空数组，避免使用已删除的本地图片
        this.setData({ banners: [] })
      }
    })
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
          leaders: [] 
        })
      }

      const { selectedStreet, page, limit, regions } = this.data

      // 处理街道筛选：如果数据库中 street 字段存储的是 region 的 _id，需要转换
      // 参考主页的实现方式
      let streetParam = undefined;
      if (selectedStreet && selectedStreet !== '') {
        // 尝试从 regions 中找到对应的 region
        const region = regions.find(r => r.name === selectedStreet);
        if (region) {
          // 优先使用 _id，如果没有则使用 id，最后使用名称
          streetParam = region._id || region.id || selectedStreet;
        } else {
          // 如果找不到，直接使用选中的街道名称
          streetParam = selectedStreet;
        }
      }

      // 调试：打印筛选参数
      console.log('筛选参数:', {
        selectedStreet: selectedStreet,
        streetParam: streetParam,
        regions: regions.length
      });

      // 1. 尝试从云函数获取数据
      let items = [];
      let hasNext = false;
      
      try {
        const result = await wx.cloud.callFunction({
          name: 'getLeaders',
          data: {
            page: isLoadMore ? page : 1,
            limit,
            street: streetParam || undefined
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

      // 处理街道名称映射：如果 street 字段是 _id（如 reg_2），需要映射到名称
      const processedItems = items.map(item => {
        let streetName = item.street;
        if (item.street && regions.length > 0) {
          // 尝试从 regions 中找到对应的名称
          // 匹配 _id 或 id 字段
          const region = regions.find(r => (r._id === item.street || r.id === item.street));
          if (region) {
            // regions 数据结构：{ _id: 'reg_2', id: '曹杨新村街道', name: '曹杨新村街道' }
            // 优先使用 name 字段
            streetName = region.name || region.id || item.street;
            console.log('街道映射:', item.street, '->', streetName, 'region:', region);
          } else {
            console.warn('未找到对应的 region，street:', item.street, 'regions数量:', regions.length);
          }
        } else if (item.street && regions.length === 0) {
          console.warn('regions 数据未加载，无法映射 street:', item.street);
        }
        return {
          ...item,
          street: streetName
        };
      });

      // 合并金牌和普通带领人，金牌在前
      this.processLeaderData(processedItems, isLoadMore, hasNext);

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

  // 处理带领人数据：合并金牌和普通，金牌在前
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
      // 刷新/首次加载模式：金牌在前，普通在后
      this.setData({
        leaders: [...newGold, ...newNormal],
        page: 2,
        hasMore: hasNext
      });
    } else {
      // 加载更多模式：直接追加（金牌通常只在第一页）
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
