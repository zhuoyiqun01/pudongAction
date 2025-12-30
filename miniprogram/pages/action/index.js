// pages/action/index.js
Page({
  data: {
    activeActions: [],
    completedActions: [],
    currentFilter: 'all'
  },

  onLoad: function() {
    this.loadActions();
  },

  onShow: function() {
    // 每次显示页面时刷新数据
    this.loadActions();
  },

  loadActions: function() {
    // 这里可以从云数据库加载真实数据
    // 暂时使用模拟数据
    const mockActions = [
      {
        id: 1,
        title: '社区垃圾分类活动',
        description: '组织邻里学习垃圾分类知识，共同维护社区环境',
        category: 'environment',
        participants: 12,
        status: 'active',
        creator: '小明',
        createTime: '2025-01-01',
        location: '社区花园'
      },
      {
        id: 2,
        title: '邻里读书会',
        description: '每周六晚上7点，在社区图书角举办读书分享活动',
        category: 'culture',
        participants: 8,
        status: 'active',
        creator: '小红',
        createTime: '2025-01-02',
        location: '社区图书角'
      },
      {
        id: 3,
        title: '健康跑步小组',
        description: '每周日早上组织社区晨跑，强身健体',
        category: 'health',
        participants: 15,
        status: 'completed',
        creator: '小刚',
        createTime: '2024-12-25',
        location: '社区公园'
      }
    ];

    const activeActions = mockActions.filter(action => action.status === 'active');
    const completedActions = mockActions.filter(action => action.status === 'completed');

    this.setData({
      activeActions,
      completedActions
    });
  },

  switchFilter: function(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      currentFilter: filter
    });
  },

  viewActionDetail: function(e) {
    const actionId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/action/detail?id=${actionId}`
    });
  },

  joinAction: function(e) {
    const actionId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认参加',
      content: '确定要参加这个活动吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '参加成功！',
            icon: 'success'
          });
          // 这里可以调用API更新参与状态
        }
      }
    });
  },

  createNewAction: function() {
    wx.navigateTo({
      url: '/pages/action/create'
    });
  },

  getCategoryIcon: function(category) {
    const icons = {
      environment: '🌱',
      community: '🤝',
      culture: '📚',
      health: '💚',
      education: '🎓'
    };
    return icons[category] || '📌';
  },

  getCategoryName: function(category) {
    const names = {
      environment: '环保行动',
      community: '社区互助',
      culture: '文化传承',
      health: '健康生活',
      education: '教育分享'
    };
    return names[category] || '其他';
  }
});
