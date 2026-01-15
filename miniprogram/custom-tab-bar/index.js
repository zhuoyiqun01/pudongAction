// components/custom-tabbar/index.js
Component({
  data: {
    activeTab: 0,
    tabbarList: [
      {
        pagePath: "/pages/home/index",
        text: "首页🏠",
        iconPath: "/images/tabbar/home.png",
        selectedIconPath: "/images/tabbar/home-active.png"
      },
      {
        pagePath: "/pages/generator/index",
        text: "小事生成器💡",
        iconPath: "/images/tabbar/generator.png",
        selectedIconPath: "/images/tabbar/generator-active.png"
      },
      {
        pagePath: "/pages/action-hub/index",
        text: "小事行动吧🧩",
        iconPath: "/images/tabbar/action.png",
        selectedIconPath: "/images/tabbar/action-active.png"
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
    }
  }
});


