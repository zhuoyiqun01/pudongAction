// pages/home/index.js
Page({
  data: {
    // Banner数据
    banners: [
      {
        id: 1,
        image: 'https://picsum.photos/seed/banner1/750/400',
        title: '社区环保日',
        description: '一起守护我们的绿色家园',
        url: '/pages/action/detail?id=1'
      },
      {
        id: 2,
        image: 'https://picsum.photos/seed/banner2/750/400',
        title: '邻里读书会',
        description: '分享知识，增进友谊',
        url: '/pages/action/detail?id=2'
      },
      {
        id: 3,
        image: 'https://picsum.photos/seed/banner3/750/400',
        title: '健康生活月',
        description: '运动起来，快乐生活',
        url: '/pages/action/detail?id=3'
      }
    ],

    // 筛选器数据
    regions: [
      { id: 'all', name: '全部地区' },
      { id: 'putuo', name: '普陀区' },
      { id: 'changning', name: '长宁区' },
      { id: 'xuhui', name: '徐汇区' },
      { id: 'huangpu', name: '黄浦区' }
    ],
    topics: [
      { id: 'all', name: '全部议题' },
      { id: 'environment', name: '环保' },
      { id: 'culture', name: '文化' },
      { id: 'health', name: '健康' },
      { id: 'education', name: '教育' },
      { id: 'community', name: '互助' }
    ],

    selectedRegion: 'all',
    selectedTopic: 'all',
    selectedRegionText: '全部地区',
    selectedTopicText: '全部议题',

    // 下拉框状态
    regionDropdownOpen: false,
    topicDropdownOpen: false,

    // 行动墙数据
    actions: [
      {
        id: 1,
        title: '社区花园种植活动',
        image: 'https://picsum.photos/seed/action1/300/400',
        tags: ['环保', '园艺'],
        region: 'putuo',
        topic: 'environment'
      },
      {
        id: 2,
        title: '邻里读书分享会',
        image: 'https://picsum.photos/seed/action2/300/350',
        tags: ['文化', '教育'],
        region: 'changning',
        topic: 'culture'
      },
      {
        id: 3,
        title: '晨跑健康小组',
        image: 'https://picsum.photos/seed/action3/300/450',
        tags: ['健康', '运动'],
        region: 'putuo',
        topic: 'health'
      },
      {
        id: 4,
        title: '垃圾分类知识讲座',
        image: 'https://picsum.photos/seed/action4/300/380',
        tags: ['环保', '教育'],
        region: 'xuhui',
        topic: 'environment'
      },
      {
        id: 5,
        title: '社区手工艺工作坊',
        image: 'https://picsum.photos/seed/action5/300/420',
        tags: ['文化', '创意'],
        region: 'huangpu',
        topic: 'culture'
      },
      {
        id: 6,
        title: '养老院探访活动',
        image: 'https://picsum.photos/seed/action6/300/360',
        tags: ['互助', '关爱'],
        region: 'putuo',
        topic: 'community'
      }
    ],

    leftColumn: [],
    rightColumn: []
  },

  onLoad: function() {
    this.filterActions();
  },

  // Banner点击
  onBannerTap: function(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    });
  },

  // 跳转到小事生成器
  goToGenerator: function() {
    wx.switchTab({
      url: '/pages/generator/index'
    });
  },

  // 跳转到小事行动吧
  goToAction: function() {
    wx.switchTab({
      url: '/pages/action/index'
    });
  },

  // 获取选中地区名称
  getSelectedRegionName: function() {
    const region = this.data.regions.find(item => item.id === this.data.selectedRegion);
    return region ? region.name : '全部地区';
  },

  // 获取选中议题名称
  getSelectedTopicName: function() {
    const topic = this.data.topics.find(item => item.id === this.data.selectedTopic);
    return topic ? topic.name : '全部议题';
  },

  // 切换地区下拉框
  toggleRegionDropdown: function() {
    this.setData({
      regionDropdownOpen: !this.data.regionDropdownOpen,
      topicDropdownOpen: false // 关闭另一个下拉框
    });
  },

  // 切换议题下拉框
  toggleTopicDropdown: function() {
    this.setData({
      topicDropdownOpen: !this.data.topicDropdownOpen,
      regionDropdownOpen: false // 关闭另一个下拉框
    });
  },

  // 地区筛选
  selectRegion: function(e) {
    const regionId = e.currentTarget.dataset.region;
    const region = this.data.regions.find(item => item.id === regionId);
    const regionText = region ? region.name : '全部地区';

    this.setData({
      selectedRegion: regionId,
      selectedRegionText: regionText,
      regionDropdownOpen: false // 选择后关闭下拉框
    });
    this.filterActions();
  },

  // 议题筛选
  selectTopic: function(e) {
    const topicId = e.currentTarget.dataset.topic;
    const topic = this.data.topics.find(item => item.id === topicId);
    const topicText = topic ? topic.name : '全部议题';

    this.setData({
      selectedTopic: topicId,
      selectedTopicText: topicText,
      topicDropdownOpen: false // 选择后关闭下拉框
    });
    this.filterActions();
  },

  // 筛选行动
  filterActions: function() {
    let filteredActions = this.data.actions;

    // 地区筛选
    if (this.data.selectedRegion !== 'all') {
      filteredActions = filteredActions.filter(action => action.region === this.data.selectedRegion);
    }

    // 议题筛选
    if (this.data.selectedTopic !== 'all') {
      filteredActions = filteredActions.filter(action => action.topic === this.data.selectedTopic);
    }

    // 分配到左右两列（简单的瀑布流）
    const leftColumn = [];
    const rightColumn = [];

    filteredActions.forEach((action, index) => {
      if (index % 2 === 0) {
        leftColumn.push(action);
      } else {
        rightColumn.push(action);
      }
    });

    this.setData({
      leftColumn,
      rightColumn
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
