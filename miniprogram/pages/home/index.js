// pages/home/index.js
Page({
  data: {
    showSecondFloor: true, // 初始显示二楼（引导页）
    secondFloorOffset: 0,   // 二楼实时偏移量
    isDragging: false,      // 是否正在拖拽
    windowHeight: 0,        // 屏幕高度
    banners: [],
    regions: [],
    topics: [],
    selectedRegion: 'all',
    selectedTopic: 'all',
    selectedRegionText: '全部地区',
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

  onLoad: function() {
    const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    this.setData({ windowHeight: windowInfo.windowHeight });
    
    // 初始进入如果是二楼，隐藏 TabBar
    if (this.data.showSecondFloor) {
      wx.hideTabBar();
    }

    this.loadHomeConfig(); // 获取配置和Banner
    this.resetAndLoadActivists(); // 初始化加载
  },

  // --- 新增：触底加载更多 ---
  onReachBottom: function() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadActivists(true); // true 表示是追加模式
    }
  },

  // --- 新增：下拉刷新 (触发二楼) ---
  onPullDownRefresh: function() {
    // 触发二楼展开
    this.setData({ showSecondFloor: true, secondFloorOffset: 0 });
    wx.hideTabBar(); // 隐藏底部导航栏
    
    // 同时刷新数据
    this.loadHomeConfig();
    this.resetAndLoadActivists(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 关闭二楼
  closeSecondFloor: function() {
    this.setData({ 
      showSecondFloor: false,
      secondFloorOffset: 0,
      isDragging: false
    });
    wx.showTabBar(); // 恢复显示底部导航栏
  },

  // 触摸交互处理
  touchStart: function(e) {
    this.startY = e.touches[0].clientY;
    this.startX = e.touches[0].clientX;
    this.setData({ isDragging: true });
  },

  touchMove: function(e) {
    if (!this.data.showSecondFloor) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - this.startY;
    
    // 只处理向上划（deltaY < 0）
    if (deltaY < 0) {
      this.setData({ secondFloorOffset: deltaY });
    }
  },

  touchEnd: function(e) {
    const endY = e.changedTouches[0].clientY;
    const endX = e.changedTouches[0].clientX;
    const deltaY = this.startY - endY; 
    const deltaX = Math.abs(endX - this.startX);

    this.setData({ isDragging: false });

    // 如果向上滑动超过 100px，则关闭二楼
    if (deltaY > 100 && deltaY > deltaX * 1.5) {
      this.closeSecondFloor();
    } else {
      // 否则回弹
      this.setData({ secondFloorOffset: 0 });
    }
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
   * 加载首页配置信息 (Banner, Regions, Topics)
   */
  loadHomeConfig: function() {
    wx.cloud.callFunction({
      name: 'getHomeConfig',
      success: res => {
        console.log('getHomeConfig result:', res);
        if (res.result && res.result.success) {
          const { banners, regions, topics } = res.result.data;
          
          // 处理 Banner 图片
          let processedBanners = banners.map(item => ({
            ...item,
            image: this.parseImage(item.image)
          })).filter((item, index, self) => 
            item.image !== '' && self.findIndex(t => t.image === item.image) === index
          );

          // 如果没有从云端获取到 Banner，使用模拟数据占位
          if (processedBanners.length === 0) {
            console.log('No banners from cloud, using mocks');
            processedBanners = [
              { _id: 'banner_1', image: 'https://picsum.photos/seed/banner1/750/400', url: '' },
              { _id: 'banner_2', image: 'https://picsum.photos/seed/banner2/750/400', url: '' }
            ];
          }

          this.setData({
            banners: processedBanners,
            regions: regions.length > 0 ? regions : this.data.regions,
            topics: topics.length > 0 ? topics : this.data.topics
          });
        } else {
          console.error('getHomeConfig failed or returned empty:', res.result);
        }
      },
      fail: err => {
        console.error('call getHomeConfig failed:', err);
      }
    });
  },

  loadActivists: function(isAppend = false, cb) {
    if (this.data.isLoading) return;
    this.setData({ isLoading: true });
    
    wx.showLoading({ title: '加载中...' });

    wx.cloud.callFunction({
      name: 'getActivists',
      data: { 
        topic: this.data.selectedTopic,
        street: this.data.selectedRegion === 'all' ? '' : this.data.selectedRegion,
        page: this.data.page,      // 传页码给云函数
        limit: this.data.pageSize
      },
      success: res => {
        if (res.result && res.result.success) {
          const newItems = res.result.data.items.map(item => ({
            ...item,
            image: this.parseImage(item.image)
          }));

          // 判断是否还有更多数据
          const hasMore = res.result.data.hasNext;

          // 处理瀑布流分发
          this.distributeWaterfall(newItems, isAppend);

          this.setData({
            page: this.data.page + 1,
            hasMore: hasMore,
            actions: isAppend ? this.data.actions.concat(newItems) : newItems 
          });
        }
      },
      complete: () => {
        this.setData({ isLoading: false });
        wx.hideLoading();
        if (cb) cb();
      }
    });
  },

  distributeWaterfall: function(items, isAppend) {
    const leftColumn = isAppend ? this.data.leftColumn : [];
    const rightColumn = isAppend ? this.data.rightColumn : [];
    
    // 使用当前已有的总数来决定新项目的起始奇偶性
    const currentTotal = isAppend ? this.data.actions.length : 0;

    items.forEach((item, index) => {
      if ((currentTotal + index) % 2 === 0) {
        leftColumn.push(item);
      } else {
        rightColumn.push(item);
      }
    });
    this.setData({ leftColumn, rightColumn });
  },

  selectRegion: function(e) {
    const id = e.currentTarget.dataset.region;
    const reg = this.data.regions.find(i => i.id === id);
    this.setData({ 
      selectedRegion: id, 
      selectedRegionText: reg ? reg.name : '全部地区', 
      regionDropdownOpen: false 
    }, () => {
      this.resetAndLoadActivists(); // 筛选变更，重置列表
    });
  },

  selectTopic: function(e) {
    const id = e.currentTarget.dataset.topic;
    const top = this.data.topics.find(i => i.id === id);
    this.setData({ 
      selectedTopic: id, 
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
  goToAction: function() { wx.switchTab({ url: '/pages/action-hub/index' }); },
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
    wx.navigateTo({ url: `/pages/activist-detail/index?id=${id}` });
  }
});
