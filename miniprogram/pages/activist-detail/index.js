// pages/activist-detail/index.js
Page({
  data: {
    activist: null,
    loading: true,
    topicMap: {
      'environment': '环保',
      'culture': '文化',
      'education': '教育',
      'health': '健康'
    }
  },
  onLoad(options) {
    const { id } = options;
    if (id) {
      this.loadActivistDetail(id);
    }
  },
  loadActivistDetail(id) {
    const db = wx.cloud.database();
    db.collection('activists').doc(id).get().then(res => {
      this.setData({
        activist: res.data,
        loading: false
      });
      if (res.data.name) {
        wx.setNavigationBarTitle({
          title: `${res.data.name}的行动故事`
        });
      }
    }).catch(err => {
      console.error('加载详情失败', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      urls: [url],
      current: url
    });
  }
});

