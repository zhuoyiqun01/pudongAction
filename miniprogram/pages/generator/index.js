// pages/generator/index.js
Page({
  data: {
    currentStep: 1,
    selectedCategory: '',
    userInput: '',
    generatedIdea: '',
    categories: [
      { id: 'environment', name: '环保行动', icon: '🌱' },
      { id: 'community', name: '社区互助', icon: '🤝' },
      { id: 'culture', name: '文化传承', icon: '📚' },
      { id: 'health', name: '健康生活', icon: '💚' },
      { id: 'education', name: '教育分享', icon: '🎓' }
    ]
  },

  onLoad: function() {
    this.setData({
      currentStep: 1
    });
  },

  selectCategory: function(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      selectedCategory: category,
      currentStep: 2
    });
  },

  getSelectedCategoryName: function() {
    if (!this.data.selectedCategory) return '';
    const category = this.data.categories.find(item => item.id === this.data.selectedCategory);
    return category ? category.name : '';
  },

  onInputChange: function(e) {
    this.setData({
      userInput: e.detail.value
    });
  },

  generateIdea: function() {
    if (!this.data.selectedCategory || !this.data.userInput.trim()) {
      wx.showToast({
        title: '请先选择类别并输入想法',
        icon: 'none'
      });
      return;
    }

    // 这里可以调用AI接口生成想法，暂时使用模拟数据
    const ideas = this.getIdeasByCategory(this.data.selectedCategory);
    const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];

    this.setData({
      generatedIdea: randomIdea,
      currentStep: 3
    });
  },

  getIdeasByCategory: function(category) {
    const ideaTemplates = {
      environment: [
        '组织社区垃圾分类活动，让邻里共同守护美好家园',
        '创建小区共享花园，种植有机蔬菜供大家采摘',
        '发起"光盘行动"，号召大家珍惜食物，减少浪费'
      ],
      community: [
        '建立邻里互助群，为独居老人提供日常帮助',
        '组织周末手工艺工作坊，让孩子们学习传统文化',
        '创建社区图书交换站，促进知识分享'
      ],
      culture: [
        '举办传统文化讲座，讲述地方历史故事',
        '组织民乐表演，让老传统在现代焕发新生',
        '创建社区故事收集计划，记录邻里美好回忆'
      ],
      health: [
        '发起社区晨跑活动，号召大家一起运动健身',
        '组织健康知识讲座，提高大家的养生意识',
        '创建社区运动队，定期开展体育比赛'
      ],
      education: [
        '开设亲子阅读活动，让孩子和家长共同成长',
        '组织技能分享会，邻里互相学习实用技能',
        '创建学习小组，共同进步，共同成长'
      ]
    };

    return ideaTemplates[category] || ['这是一个很好的想法，让我们一起实现它！'];
  },

  shareIdea: function() {
    wx.showShareMenu({
      withShareTicket: true
    });
  },

  startOver: function() {
    this.setData({
      currentStep: 1,
      selectedCategory: '',
      userInput: '',
      generatedIdea: ''
    });
  }
});
