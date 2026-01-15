// pages/activities/index.js
Page({
  data: {
    activities: [],
    loading: true
  },
  onLoad: function() {
    this.loadActivities();
  },
  // 深度抓取图片路径
  parseImage: function(rawImg) {
    if (!rawImg) return '';
    let img = '';
    if (Array.isArray(rawImg) && rawImg.length > 0) {
      img = rawImg[0].url || rawImg[0].fileID || rawImg[0];
    } else if (typeof rawImg === 'object' && rawImg !== null) {
      img = rawImg.url || rawImg.fileID || rawImg;
    } else {
      img = rawImg;
    }
    if (typeof img !== 'string') return '';
    img = img.trim();
    if (img.startsWith('//')) img = 'https:' + img;
    return img;
  },
  loadActivities: function() {
    wx.cloud.callFunction({
      name: 'getActivities',
      data: {
        type: 'all',
        limit: 20
      },
      success: res => {
        if (res.result && res.result.success) {
          const processed = res.result.data.map(item => {
            // 时间格式化处理
            let timeStr = item.time_display || item.time || '';
            if (item.start_time) {
              const date = new Date(item.start_time);
              timeStr = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            }
            
            return {
              ...item,
              image: this.parseImage(item.image),
              timeStr
            };
          });
          this.setData({
            activities: processed,
            loading: false
          });
        }
      },
      fail: err => {
        console.error('加载活动列表失败', err);
        this.setData({ loading: false });
      }
    });
  },
  onActivityTap: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/activity-detail/index?id=${id}` });
  }
})

