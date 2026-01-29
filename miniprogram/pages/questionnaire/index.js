// pages/questionnaire/index.js - 问卷页面
Page({
  data: {
    questionnaireUrl: ''
  },

  onLoad(options) {
    const { url } = options;
    if (url) {
      // 解码 URL
      let decodedUrl = decodeURIComponent(url);
      
      // 检测是否为金数据表单（jsj.top 域名）
      // 参考：https://open.jinshuju.net/embedded/overview
      if (this.isJinshujuForm(decodedUrl)) {
        decodedUrl = this.optimizeJinshujuUrl(decodedUrl);
      }
      
      this.setData({
        questionnaireUrl: decodedUrl
      });
      
      // 设置页面标题
      wx.setNavigationBarTitle({
        title: '活动报名'
      });
    } else {
      wx.showToast({
        title: '链接无效',
        icon: 'none'
      });
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 检测是否为金数据表单
  // 支持多种金数据域名格式：
  // - jsj.top（短链接域名）
  // - *.jinshuju.com（二级域名，企业版）
  // - jinshuju.net（不收集微信信息时可用）
  isJinshujuForm(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      // 支持多种金数据域名格式
      return hostname === 'jsj.top' 
          || hostname.endsWith('.jsj.top')
          || hostname.endsWith('.jinshuju.com')
          || hostname === 'jinshuju.net';
    } catch (e) {
      return false;
    }
  },

  // 优化金数据表单 URL，添加定制参数
  // 参考：https://open.jinshuju.net/embedded/overview
  optimizeJinshujuUrl(url) {
    try {
      const urlObj = new URL(url);
      
      // 添加定制参数（如果 URL 中还没有）
      // banner: hide - 隐藏页眉，更适合小程序嵌入
      // background: white - 白色背景，确保在小程序中显示正常
      if (!urlObj.searchParams.has('banner')) {
        urlObj.searchParams.set('banner', 'hide');
      }
      if (!urlObj.searchParams.has('background')) {
        urlObj.searchParams.set('background', 'white');
      }
      
      return urlObj.toString();
    } catch (e) {
      // 如果 URL 解析失败，返回原始 URL
      console.warn('URL 解析失败，使用原始 URL:', e);
      return url;
    }
  },

  // 监听 web-view 消息（来自网页）
  onWebViewMessage(e) {
    console.log('web-view 消息:', e.detail.data);
  },

  // 监听 web-view 加载错误
  onWebViewError(e) {
    console.error('web-view 加载失败:', e);
    // 提取域名用于提示
    let domain = '';
    try {
      const url = new URL(this.data.questionnaireUrl);
      domain = url.hostname;
    } catch (err) {
      domain = '该域名';
    }
    
    wx.showModal({
      title: '提示',
      content: `问卷页面无法加载。\n\n可能原因：\n1. ${domain} 未配置到小程序业务域名\n2. 问卷平台不支持在小程序中打开\n\n是否复制链接到浏览器打开？`,
      confirmText: '复制链接',
      cancelText: '返回',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: this.data.questionnaireUrl,
            success: () => {
              wx.showToast({
                title: '链接已复制',
                icon: 'success'
              });
              // 延迟返回
              setTimeout(() => {
                wx.navigateBack();
              }, 1500);
            }
          });
        } else {
          // 取消则返回
          wx.navigateBack();
        }
      }
    });
  }
});

