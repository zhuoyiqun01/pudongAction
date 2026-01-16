// pages/action-hub/index.js - 小事行动吧 (入口枢纽页)
Page({
  data: {
    menuItems: [
      {
        id: 'intro',
        title: '社区小事是什么',
        icon: '💡',
        span: 2,
        url: '/pages/intro/index',
        color: 'var(--primary-color)'
      },
      {
        id: 'join',
        title: '成为小事行动者',
        icon: '🧩',
        span: 2,
        url: '/pages/apply/index',
        color: 'var(--accent-pink)'
      },
      {
        id: 'leaders',
        title: '联系小事带领人',
        icon: '🤝',
        span: 1,
        url: '/pages/leaders/index',
        color: 'var(--secondary-color)'
      },
      {
        id: 'space',
        title: '寻找小事空间',
        icon: '🏠',
        span: 1,
        url: '', // 建设中
        color: 'var(--accent-blue)'
      },
      {
        id: 'learning',
        title: '小事学习中心',
        icon: '📚',
        span: 2,
        url: '', // 建设中
        color: 'var(--accent-orange)'
      }
    ]
  },

  onMenuItemTap: function(e) {
    const item = e.currentTarget.dataset.item;
    if (!item.url || item.id === 'space' || item.id === 'learning') {
      wx.showToast({ title: '功能建设中', icon: 'none' });
      return;
    }
    
    // 根据是 Tab 还是普通页面进行跳转
    const tabPages = ['/pages/home/index', '/pages/generator/index', '/pages/action-hub/index'];
    if (tabPages.includes(item.url)) {
      wx.switchTab({ url: item.url });
    } else {
      wx.navigateTo({ url: item.url });
    }
  }
});
