// components/custom-tabbar/index.js
const imageConfig = require('../utils/imageConfig.js')

Component({
  data: {
    activeTab: 0,
    tabbarList: [
      {
        pagePath: "/pages/home/index",
        text: "首页",
        iconPath: "", // 从云存储加载
        selectedIconPath: "" // 从云存储加载
      },
      {
        pagePath: "/pages/generator/index",
        text: "小事生成器",
        iconPath: "", // 从云存储加载
        selectedIconPath: "" // 从云存储加载
      },
      {
        pagePath: "/pages/action-hub/index",
        text: "小事行动吧",
        iconPath: "", // 从云存储加载
        selectedIconPath: "" // 从云存储加载
      }
    ]
  },

  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index;
      const url = this.data.tabbarList[index].pagePath;

      wx.switchTab({
        url: url
      });
    }
  },

  lifetimes: {
    attached() {
      // 获取当前页面路径，设置activeTab
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const currentPath = '/' + currentPage.route;

      const activeIndex = this.data.tabbarList.findIndex(item => item.pagePath === currentPath);
      if (activeIndex !== -1) {
        this.setData({
          activeTab: activeIndex
        });
      }
      
      // 加载云存储的 tabbar 图标
      this.loadTabbarIcons()
    }
  },

  methods: {
    // 加载云存储的 tabbar 图标
    async loadTabbarIcons() {
      try {
        const tabbarList = [...this.data.tabbarList]
        
        // 加载每个 tab 的图标
        for (let i = 0; i < tabbarList.length; i++) {
          const tab = tabbarList[i]
          let pageName = ''
          
          // 根据路径确定页面名称
          if (tab.pagePath.includes('home')) {
            pageName = 'home'
          } else if (tab.pagePath.includes('generator')) {
            pageName = 'generator'
          } else if (tab.pagePath.includes('action-hub')) {
            pageName = 'action-hub'
          }
          
          if (pageName) {
            // 获取普通图标
            const icon = await imageConfig.getTabbarIcon(pageName, 'icon')
            if (icon) {
              tab.iconPath = icon
            }
            
            // 获取选中图标
            const selectedIcon = await imageConfig.getTabbarIcon(pageName, 'selectedIcon')
            if (selectedIcon) {
              tab.selectedIconPath = selectedIcon
            }
          }
        }
        
        this.setData({ tabbarList })
        console.log('✅ Tabbar 图标加载完成')
      } catch (error) {
        console.warn('⚠️ 加载 Tabbar 图标失败，使用本地路径:', error)
      }
    }
  }
});


