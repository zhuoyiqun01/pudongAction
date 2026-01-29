// pages/home/index.js
const app = getApp(); // 获取全局应用实例
const imageConfig = require('../../utils/imageConfig.js')

Page({
  data: {
    banners: [],
    regions: [{ _id: 'all', id: 'all', name: '全部街镇', order: 0 }], // 初始化时包含"全部街镇"选项
    // 图片配置（从云存储加载）
    icons: {
      'learn-more-arrow': '',
      'generator-icon': '',
      'action-icon': '',
      'more-arrow': ''
    },
    // topics 硬编码数据：数字标识 -> 中文名称
    topics: [
      { _id: 'top_1', id: 'all', name: '全部议题', order: 1 },
      { _id: 'top_2', id: 1, name: '楼组', order: 2 },
      { _id: 'top_3', id: 2, name: '为老', order: 3 },
      { _id: 'top_4', id: 3, name: '爱宠', order: 4 },
      { _id: 'top_5', id: 4, name: '文化', order: 5 },
      { _id: 'top_6', id: 5, name: '亲子', order: 6 },
      { _id: 'top_7', id: 6, name: '无障碍', order: 7 },
      { _id: 'top_8', id: 7, name: '可持续', order: 8 },
      { _id: 'top_9', id: 8, name: '其他', order: 9 }
    ],
    selectedRegion: 'all',
    selectedTopic: 'all',
    selectedRegionText: '全部街镇',
    selectedTopicText: '全部议题',
    regionDropdownOpen: false,
    topicDropdownOpen: false,
    actions: [],
    leftColumn: [],
    rightColumn: [],

    // --- 新增分页状态 ---
    page: 1,           // 当前页码 (与云函数对齐，从1开始)
    pageSize: 4,      // 每页数量 (测试模式：暂时设为 4)
    hasMore: true,     // 是否还有更多数据
    isLoading: false   // 防止重复请求锁
  },

  onLoad: function(options) {
    this.loadHomeConfig(); // 获取配置和Banner
    this.resetAndLoadActivists(); // 初始化加载
    this.loadImages(); // 加载 icons
  },

  // --- 新增：触底加载更多 ---
  onReachBottom: function() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadActivists(true); // true 表示是追加模式
    }
  },

  // --- 新增：下拉刷新 ---
  onPullDownRefresh: function() {
    // 同时刷新数据
    this.loadHomeConfig();
    this.resetAndLoadActivists(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 监听二楼组件关闭事件
  onSecondFloorClose: function() {
    // 组件关闭后的回调，可以在这里做一些处理
    console.log('二楼已关闭');
  },

  // 辅助：重置并加载（用于筛选变化或下拉刷新）
  resetAndLoadActivists: function(cb) {
    this.setData({
      page: 1,
      hasMore: true,
      actions: [],
      leftColumn: [],  // 清空瀑布流
      rightColumn: []
    }, () => {
      this.loadActivists(false, cb); // false 表示非追加模式
    });
  },

  // 1. 深度抓取图片路径
  parseImage: function(rawImg) {
    if (!rawImg) {
      console.log('parseImage: rawImg is empty');
      return '';
    }
    let img = '';
    
    // 如果是 CMS 返回的数组格式 [{url, fileID}]
    if (Array.isArray(rawImg) && rawImg.length > 0) {
      img = rawImg[0].url || rawImg[0].fileID || rawImg[0];
    } 
    // 如果是对象格式
    else if (typeof rawImg === 'object' && rawImg !== null) {
      img = rawImg.url || rawImg.fileID || rawImg;
    } 
    // 如果直接是字符串
    else {
      img = rawImg;
    }
    
    if (typeof img !== 'string') {
      console.log('parseImage: img is not a string', img);
      return '';
    }
    img = img.trim();
    
    // 如果拿到的是 // 开头的地址，补全它
    if (img.startsWith('//')) img = 'https:' + img;
    
    console.log('parseImage final URL:', img);
    return img;
  },

  /**
   * 加载图片配置（Icons，Logo 由组件自己加载）
   */
  loadImages: async function() {
    try {
      // 加载 Icons
      const iconNames = ['learn-more-arrow', 'generator-icon', 'action-icon', 'more-arrow']
      const icons = { ...this.data.icons }
      
      for (const name of iconNames) {
        const iconUrl = await imageConfig.getIcon(name)
        if (iconUrl) {
          icons[name] = iconUrl
        }
      }
      
      this.setData({ icons })
      console.log('✅ Icons 加载完成')
    } catch (error) {
      console.warn('⚠️ 加载图片配置失败，使用本地路径:', error)
    }
  },

  /**
   * 加载首页配置信息 (Banner, Regions, Topics)
   */
  loadHomeConfig: function() {
    // 使用 getActivities 云函数获取 Banner 数据（isBanner: true 的活动）
    wx.cloud.callFunction({
      name: 'getActivities',
      data: {
        type: 'banner', // 只获取 isBanner: true 的活动
        limit: 10
      },
      success: res => {
        console.log('getActivities (banner) result:', res);
        if (res.result && res.result.success) {
          const banners = res.result.data || [];
          
          // 处理 Banner 图片
          let processedBanners = banners.map(item => ({
            ...item,
            image: this.parseImage(item.image)
          })).filter((item, index, self) => 
            item.image !== '' && self.findIndex(t => t.image === item.image) === index
          );

          this.setData({
            banners: processedBanners
          });
        } else {
          console.error('getActivities (banner) failed:', res.result);
          this.setData({
            banners: []
          });
        }
      },
      fail: err => {
        console.error('call getActivities (banner) failed:', err);
        this.setData({
          banners: []
        });
      }
    });

    // 加载地区数据（topics 已硬编码，不需要从服务器加载）
    // 如果 getHomeConfig 失败，使用默认空数组，不影响页面显示
    wx.cloud.callFunction({
      name: 'getHomeConfig',
      success: res => {
        console.log('getHomeConfig 返回结果:', res.result);
        if (res.result && res.result.success) {
          const { regions } = res.result.data;
          console.log('加载的 regions:', regions);
          // 在 regions 数组前面添加"全部街镇"选项
          const allStreetOption = { _id: 'all', id: 'all', name: '全部街镇', order: 0 };
          const regionsWithAll = regions && regions.length > 0 
            ? [allStreetOption, ...regions] 
            : [allStreetOption];
          this.setData({
            regions: regionsWithAll
          });
          console.log('设置后的 regions:', this.data.regions);
        } else {
          console.warn('getHomeConfig 返回失败，使用默认数据:', res.result);
          // 失败时也添加"全部街镇"选项
          const allStreetOption = { _id: 'all', id: 'all', name: '全部街镇', order: 0 };
          this.setData({
            regions: [allStreetOption]
          });
        }
      },
      fail: err => {
        console.warn('call getHomeConfig failed，使用默认数据:', err);
        // 失败时也添加"全部街镇"选项
        const allStreetOption = { _id: 'all', id: 'all', name: '全部街镇', order: 0 };
        this.setData({
          regions: [allStreetOption]
        });
      }
    });
  },

  loadActivists: function(isAppend = false, cb) {
    if (this.data.isLoading) return;
    this.setData({ isLoading: true });
    
    wx.showLoading({ title: '加载中...' });

    // 处理地区筛选：如果是关联数据，street 字段存储的是 region 的 _id
    // 需要传递 _id 而不是 id
    // 如果选择"全部地区"，不传递 street 参数
    let streetParam = undefined; // 默认不传递，表示不过滤
    
    // 确保 selectedRegion 是 'all' 时，不添加筛选条件
    if (this.data.selectedRegion && this.data.selectedRegion !== 'all') {
      const regions = this.data.regions || [];
      const reg = regions.find(i => (i && (i.id === this.data.selectedRegion || i._id === this.data.selectedRegion)));
      // 如果是关联数据，传递 _id；否则传递 id
      streetParam = reg ? (reg._id || reg.id || this.data.selectedRegion) : this.data.selectedRegion;
    }

    // 构建请求参数，只传递有值的参数
    const requestData = {
      page: this.data.page,
      limit: this.data.pageSize
    };
    
    // 只添加有效的筛选参数
    if (streetParam !== undefined && streetParam !== null && streetParam !== '') {
      requestData.street = streetParam;
    }
    if (this.data.selectedTopic && this.data.selectedTopic !== 'all') {
      requestData.topic = this.data.selectedTopic;
    }

    // 调试：打印筛选参数
    console.log('筛选参数:', {
      selectedRegion: this.data.selectedRegion,
      selectedTopic: this.data.selectedTopic,
      streetParam: streetParam,
      requestData: requestData
    });

    wx.cloud.callFunction({
      name: 'getActivists',
      data: requestData,
      success: res => {
        console.log('getActivists 返回结果:', res.result);
        console.log('返回数据详情:', {
          success: res.result?.success,
          itemsCount: res.result?.data?.items?.length || 0,
          total: res.result?.data?.total || 0,
          hasNext: res.result?.data?.hasNext,
          isAppend: isAppend
        });
        
        if (res.result && res.result.success) {
          // 确保 items 存在且是数组
          const items = res.result.data.items || [];
          console.log('获取到的 items 数量:', items.length, 'isAppend:', isAppend);
          
          if (items.length === 0) {
            console.warn('返回的 items 为空数组，可能的原因：查询条件不匹配或数据库中没有数据');
          }
          const regions = this.data.regions || [];
          
          const newItems = items.map(item => {
            try {
              // 处理街道名称：如果 street 是 _id，需要映射到名称
              let streetName = item.street;
              if (item.street) {
                // 尝试从 regions 中找到对应的名称
                const region = regions.find(r => (r._id === item.street || r.id === item.street));
                if (region) {
                  streetName = region.name;
                } else {
                  // 如果找不到，尝试使用缓存
                  const cachedName = app.globalData.regionCache?.[item.street];
                  if (cachedName) {
                    streetName = cachedName;
                  } else {
                    // 如果还是找不到，尝试从数据库查询（异步，先显示原始值）
                    this.loadRegionName(item.street, (name) => {
                      // 更新缓存
                      if (!app.globalData.regionCache) app.globalData.regionCache = {};
                      app.globalData.regionCache[item.street] = name;
                    });
                  }
                }
              }
              
              return {
                ...item,
                image: this.parseImage(item.image || ''),
                street: streetName || item.street // 使用映射后的名称，如果没有则使用原始值
              };
            } catch (e) {
              console.error('处理行动者数据失败:', e, item);
              return {
                ...item,
                image: ''
              };
            }
          });

          // 判断是否还有更多数据
          const hasMore = res.result.data.hasNext;

          // 处理瀑布流分发
          this.distributeWaterfall(newItems, isAppend);

          const finalActions = isAppend ? this.data.actions.concat(newItems) : newItems;
          console.log('设置 actions，数量:', finalActions.length, 'isAppend:', isAppend, 'newItems:', newItems.length);

          this.setData({
            page: this.data.page + 1,
            hasMore: hasMore,
            actions: finalActions
          });
        } else {
          console.error('getActivists 返回失败:', res.result);
          // 即使失败也要清空加载状态
          this.setData({
            actions: isAppend ? this.data.actions : [],
            leftColumn: isAppend ? this.data.leftColumn : [],
            rightColumn: isAppend ? this.data.rightColumn : []
          });
        }
      },
      fail: err => {
        console.error('调用 getActivists 失败:', err);
        // 失败时也要清空加载状态
        this.setData({
          actions: isAppend ? this.data.actions : [],
          leftColumn: isAppend ? this.data.leftColumn : [],
          rightColumn: isAppend ? this.data.rightColumn : []
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
        wx.hideLoading();
        if (cb) cb();
      }
    });
  },

  distributeWaterfall: function(items, isAppend) {
    if (!items || !Array.isArray(items)) {
      console.warn('distributeWaterfall: items 不是数组', items);
      return;
    }
    
    const leftColumn = isAppend ? (this.data.leftColumn || []) : [];
    const rightColumn = isAppend ? (this.data.rightColumn || []) : [];
    
    // 使用当前已有的总数来决定新项目的起始奇偶性
    const currentTotal = isAppend ? (this.data.actions ? this.data.actions.length : 0) : 0;

    items.forEach((item, index) => {
      if (item) {
        if ((currentTotal + index) % 2 === 0) {
          leftColumn.push(item);
        } else {
          rightColumn.push(item);
        }
      }
    });
    this.setData({ leftColumn, rightColumn });
  },

  selectRegion: function(e) {
    const id = e.currentTarget.dataset.region;
    // 支持关联数据：regions 的 id 可能是 _id 或 id 字段
    const reg = this.data.regions.find(i => (i.id === id || i._id === id));
    
    // 如果选择的是"全部街镇"（id 为 'all' 或 name 为 '全部街镇'），设置为 'all'
    const finalId = (id === 'all' || (reg && (reg.id === 'all' || reg.name === '全部街镇'))) ? 'all' : id;
    
    console.log('选择地区:', { id, finalId, regName: reg ? reg.name : '未找到' });
    
    this.setData({ 
      selectedRegion: finalId, 
      selectedRegionText: reg ? reg.name : '全部街镇', 
      regionDropdownOpen: false 
    }, () => {
      this.resetAndLoadActivists(); // 筛选变更，重置列表
    });
  },

  selectTopic: function(e) {
    const id = e.currentTarget.dataset.topic;
    // 将 id 转换为数字（topics 现在使用数字标识 1-8）
    const topicId = id === 'all' ? 'all' : (typeof id === 'string' ? parseInt(id) : id);
    const top = this.data.topics.find(i => i.id === topicId || i.id === id);
    this.setData({ 
      selectedTopic: topicId, 
      selectedTopicText: top ? top.name : '全部议题', 
      topicDropdownOpen: false 
    }, () => {
      this.resetAndLoadActivists(); // 筛选变更，重置列表
    });
  },

  onBannerTap: function(e) {
    const { id } = e.currentTarget.dataset;
    console.log('Banner tapped, navigating to activity:', id);
    if (id) {
      wx.navigateTo({ url: `/pages/activity-detail/index?id=${id}` });
    }
  },

  goToGenerator: function() { wx.switchTab({ url: '/pages/generator/index' }); },
  goToAction: function() { wx.navigateTo({ url: '/pages/apply/index' }); },
  onLearnMore: function() { wx.switchTab({ url: '/pages/action-hub/index' }); },
  goToActivities: function() { wx.navigateTo({ url: '/pages/activities/index' }); },

  toggleRegionDropdown: function() {
    this.setData({ regionDropdownOpen: !this.data.regionDropdownOpen, topicDropdownOpen: false });
  },
  toggleTopicDropdown: function() {
    this.setData({ topicDropdownOpen: !this.data.topicDropdownOpen, regionDropdownOpen: false });
  },

  viewActionDetail: function(e) {
    // 兼容逻辑：优先取 e.detail.id (组件传来的)，如果没有，取 e.currentTarget.dataset.id (原生view传来的)
    const id = e.detail.id || e.currentTarget.dataset.id;
    if (!id) return;
    // 使用 navigateTo 的 success 回调来确保页面跳转成功
    wx.navigateTo({ 
      url: `/pages/activist-detail/index?id=${id}`,
      success: () => {
        // 跳转成功，详情页会自己加载数据
      },
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({ title: '跳转失败', icon: 'none' });
      }
    });
  },

  // Banner 图片加载错误处理
  onBannerImageError: function(e) {
    console.warn('Banner 图片加载失败:', e);
    // 可以设置默认图片或隐藏该 banner
  }
});
