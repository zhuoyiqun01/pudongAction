// pages/leader-detail/index.js
Page({
  data: {
    leader: null,
    loading: true
  },
  onLoad(options) {
    const { id } = options;
    this.loadLeaderDetail(id);
  },
  loadLeaderDetail(id) {
    // TODO: 调用云函数获取详情
    this.setData({ loading: false });
  }
});

