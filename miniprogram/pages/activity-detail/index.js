// pages/activity-detail/index.js
Page({
  data: {
    activity: null,
    loading: true
  },
  onLoad(options) {
    const { id } = options;
    if (id) {
      this.loadActivityDetail(id);
    }
  },
  loadActivityDetail(id) {
    const db = wx.cloud.database();
    
    // 1. 先尝试直接查询（最快）
    db.collection('activities').doc(id).get().then(res => {
      this.processActivityData(res.data);
    }).catch(err => {
      // 2. 如果失败，尝试补全前缀查询 (兼容运营录入 1, 2, 3)
      let searchId = id;
      if (/^\d+$/.test(id)) {
        searchId = `activity_${id}`;
        console.log('ID 自动补全查询:', searchId);
        
        db.collection('activities').doc(searchId).get().then(res => {
          this.processActivityData(res.data);
        }).catch(err2 => {
          this.handleLoadError(err2);
        });
      } else {
        this.handleLoadError(err);
      }
    });
  },

  processActivityData(activity) {
    // 处理时间显示
    if (activity.start_time) {
      const date = new Date(activity.start_time);
      activity.timeStr = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else {
      activity.timeStr = activity.time_display || activity.time;
    }

    this.setData({
      activity: activity,
      loading: false
    });
    
    if (activity.name || activity.title) {
      wx.setNavigationBarTitle({
        title: activity.name || activity.title
      });
    }
  },

  handleLoadError(err) {
    console.error('加载详情失败', err);
    this.setData({ loading: false });
    wx.showToast({ title: '内容已下架或不存在', icon: 'none' });
  },
  onJoin() {
    wx.showModal({
      title: '报名提示',
      content: '该活动需要通过“小事行动吧”联系带领人进行报名，是否现在前往？',
      success: (res) => {
        if (res.confirm) {
          wx.switchTab({ url: '/pages/action-hub/index' });
        }
      }
    });
  }
});

