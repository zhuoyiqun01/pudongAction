const app = getApp();
const imageConfig = require('../../utils/imageConfig.js')

Component({
  data: {
    show: true,
    visible: false,
    offset: 0,
    isDragging: false,
    windowHeight: 0,
    logoUrl: '' // 从云存储加载
  },
  lifetimes: {
    attached() {
      // 加载 Logo
      this.loadLogo()
      // 检查本次启动是否已经显示过二楼
      if (!app.globalData || !app.globalData.hasShownIntro) {
        const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
        this.setData({ 
          visible: true,
          windowHeight: windowInfo.windowHeight 
        });
        wx.hideTabBar(); // 尝试隐藏 TabBar (如果是 Tab 页面)
        
        if (app.globalData) {
          app.globalData.hasShownIntro = true;
        }
      } else {
        this.setData({ visible: false });
      }
    }
  },
  methods: {
    touchStart(e) {
      this.startY = e.touches[0].clientY;
      this.startX = e.touches[0].clientX;
      this.setData({ isDragging: true });
    },
    touchMove(e) {
      if (!this.data.show) return;
      
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - this.startY;
      
      // 只处理向上划（deltaY < 0）
      if (deltaY < 0) {
        this.setData({ offset: deltaY });
      }
    },
    touchEnd(e) {
      const endY = e.changedTouches[0].clientY;
      const endX = e.changedTouches[0].clientX;
      const deltaY = this.startY - endY; 
      const deltaX = Math.abs(endX - this.startX);
      const moveDistance = Math.sqrt(Math.pow(deltaY, 2) + Math.pow(deltaX, 2));
      
      this.setData({ isDragging: false });
      
      // 如果向上滑动超过 100px，则关闭
      if (deltaY > 100 && deltaY > deltaX * 1.5) {
        this.close();
      } else if (moveDistance < 10) {
        // 如果移动距离很小（小于10px），认为是点击，直接关闭
        this.close();
      } else {
        // 否则回弹
        this.setData({ offset: 0 });
      }
    },
    close() {
      this.setData({ 
        show: false, 
        offset: -this.data.windowHeight,
        isDragging: false
      });
      wx.showTabBar(); // 恢复显示 TabBar
      
      // 动画完成后隐藏组件
      setTimeout(() => {
        this.setData({ visible: false });
        this.triggerEvent('close');
      }, 500);
    },
    // 加载 Logo
    async loadLogo() {
      try {
        const logoUrl = await imageConfig.getLogo()
        if (logoUrl) {
          this.setData({ logoUrl })
        }
      } catch (error) {
        console.warn('⚠️ 加载 Logo 失败，使用本地路径:', error)
      }
    }
  }
});