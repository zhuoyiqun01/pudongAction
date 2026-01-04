// pages/home/index.js
Page({
  data: {
    // Banner数据
    banners: [],

    // 筛选器数据
    regions: [],
    topics: [],

    selectedRegion: 'all',
    selectedTopic: 'all',
    selectedRegionText: '全部地区',
    selectedTopicText: '全部议题',

    // 下拉框状态
    regionDropdownOpen: false,
    topicDropdownOpen: false,

    // 行动墙数据
    actions: [],

    leftColumn: [],
    rightColumn: []
  },

  onLoad: function() {
    this.loadBanners();
    this.loadActivists();
    this.loadFilters();
  },

  // 获取Banner (from getActivities)
  loadBanners: function() {
    wx.cloud.callFunction({
      name: 'getActivities',
      data: { type: 'banner', limit: 5 },
      success: res => {
        if (res.result && res.result.success) {
          this.setData({ banners: res.result.data });
        }
      },
      fail: err => console.error('加载Banner失败', err)
    });
  },

  // 获取行动者墙 (from getActivists)
  loadActivists: function() {
    wx.showLoading({ title: '加载中...' });
    
    wx.cloud.callFunction({
      name: 'getActivists',
      data: { 
        topic: this.data.selectedTopic,
        street: this.data.selectedRegion === 'all' ? '' : this.data.selectedRegion,
        limit: 10 
      },
      success: res => {
        if (res.result && res.result.success) {
          const items = res.result.data.items;
          this.setData({ actions: items }, () => {
            this.distributeWaterfall(items);
          });
        }
      },
      fail: err => {
        console.error('加载行动者墙失败', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
      },
      complete: () => wx.hideLoading()
    });
  },

  // 获取筛选配置 (可以从云端获取 regions/topics)
  loadFilters: function() {
    const db = wx.cloud.database();
    db.collection('regions').orderBy('order', 'asc').get().then(res => {
      if (res.data.length > 0) this.setData({ regions: res.data });
    });
    db.collection('topics').orderBy('order', 'asc').get().then(res => {
      if (res.data.length > 0) this.setData({ topics: res.data });
    });
  },

  // 分配瀑布流
  distributeWaterfall: function(items) {
    const leftColumn = [];
    const rightColumn = [];
    items.forEach((item, index) => {
      if (index % 2 === 0) leftColumn.push(item);
      else rightColumn.push(item);
    });
    this.setData({ leftColumn, rightColumn });
  },

  // 地区筛选
  selectRegion: function(e) {
    const regionId = e.currentTarget.dataset.region;
    const region = this.data.regions.find(item => item.id === regionId);
    const regionText = region ? region.name : '全部地区';

    this.setData({
      selectedRegion: regionId,
      selectedRegionText: regionText,
      regionDropdownOpen: false
    });
    this.loadActivists(); // 重新从云端加载
  },

  // 议题筛选
  selectTopic: function(e) {
    const topicId = e.currentTarget.dataset.topic;
    const topic = this.data.topics.find(item => item.id === topicId);
    const topicText = topic ? topic.name : '全部议题';

    this.setData({
      selectedTopic: topicId,
      selectedTopicText: topicText,
      topicDropdownOpen: false
    });
    this.loadActivists(); // 重新从云端加载
  },

  // Banner点击
  onBannerTap: function(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  },

  // 跳转
  goToGenerator: function() { wx.switchTab({ url: '/pages/generator/index' }); },
  goToAction: function() { wx.switchTab({ url: '/pages/action/index' }); },
  onLearnMore: function() { wx.switchTab({ url: '/pages/action/index' }); },

  // 切换下拉框
  toggleRegionDropdown: function() {
    this.setData({
      regionDropdownOpen: !this.data.regionDropdownOpen,
      topicDropdownOpen: false
    });
  },
  toggleTopicDropdown: function() {
    this.setData({
      topicDropdownOpen: !this.data.topicDropdownOpen,
      regionDropdownOpen: false
    });
  },

  // 查看行动详情
  viewActionDetail: function(e) {
    const actionId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/action/detail?id=${actionId}`
    });
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    // 停止下拉刷新
    wx.stopPullDownRefresh()
  },

  // 分享功能
  onShareAppMessage: function () {
    return {
      title: '社区小事 - 在家门口的五十米，做一件小事',
      path: '/pages/home/index',
      imageUrl: 'https://picsum.photos/seed/community-share/500/400'
    }
  },

  onShareTimeline: function () {
    return {
      title: '社区小事 - 在家门口的五十米，做一件小事',
      imageUrl: 'https://picsum.photos/seed/community-share/500/400'
    }
  }
});
