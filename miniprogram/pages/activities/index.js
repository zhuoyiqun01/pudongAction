// pages/activities/index.js
Page({
  data: {
    activities: [],
    loading: true,
    selectedStatus: 'all',
    selectedStatusText: '全部',
    statusDropdownOpen: false,
    statusOptions: [
      { label: '全部', value: 'all' },
      { label: '即将开始', value: 'upcoming' },
      { label: '未开始', value: 'pending' },
      { label: '进行中', value: 'ongoing' },
      { label: '即将结束', value: 'ending_soon' },
      { label: '已结束', value: 'ended' }
    ]
  },
  onLoad: function() {
    this.loadActivities();
  },
  toggleStatusDropdown: function() {
    this.setData({
      statusDropdownOpen: !this.data.statusDropdownOpen
    });
  },
  selectStatus: function(e) {
    const status = e.currentTarget.dataset.status;
    const option = this.data.statusOptions.find(opt => opt.value === status);
    this.setData({
      selectedStatus: status,
      selectedStatusText: option ? option.label : '全部',
      statusDropdownOpen: false
    });
    this.loadActivities();
  },
  closeDropdown: function() {
    if (this.data.statusDropdownOpen) {
      this.setData({
        statusDropdownOpen: false
      });
    }
  },
  stopPropagation: function() {
    // 阻止事件冒泡，点击筛选器区域不关闭下拉菜单
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
    this.setData({ loading: true });
    wx.cloud.callFunction({
      name: 'getActivities',
      data: {
        type: 'all',
        limit: 20,
        statusFilter: this.data.selectedStatus
      },
      success: res => {
        if (res.result && res.result.success) {
          const processed = res.result.data.map(item => {
            // 时间格式化处理
            let timeStr = '';
            // 如果有开始时间，格式化显示（适用于有明确时间的活动）
            if (item.start_time) {
              const startDate = new Date(item.start_time);
              timeStr = `${startDate.getFullYear()}-${(startDate.getMonth()+1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')} ${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
              
              // 如果有结束时间，显示时间范围
              if (item.end_time) {
                const endDate = new Date(item.end_time);
                // 如果是同一天，只显示一次日期
                if (startDate.toDateString() === endDate.toDateString()) {
                  timeStr = `${startDate.getFullYear()}-${(startDate.getMonth()+1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')} ${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}-${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
                } else {
                  // 不同天，显示日期范围
                  timeStr = `${startDate.getFullYear()}-${(startDate.getMonth()+1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')} 至 ${endDate.getFullYear()}-${(endDate.getMonth()+1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`;
                }
              }
            } else {
              // 没有开始时间，使用 time_display（适用于长期活动、周期性活动等）
              timeStr = item.time_display || item.time || '时间待定';
            }

            // 计算活动状态
            let statusLabel = '';
            let statusClass = '';
            if (item.start_time) {
              // 有具体时间，自动计算状态
              const now = new Date();
              const startDate = new Date(item.start_time);
              const endDate = item.end_time ? new Date(item.end_time) : null;
              
              if (now < startDate) {
                statusLabel = '未开始';
                statusClass = 'pending';
              } else if (endDate && now > endDate) {
                statusLabel = '已结束';
                statusClass = 'ended';
              } else {
                statusLabel = '进行中';
                statusClass = 'ongoing';
              }
            } else {
              // 长期活动，使用 CMS 手动选择的状态
              // activity_status 字段：枚举值 'pending' | 'ongoing' | 'ended'（选项标识）
              // 选项值映射：pending -> 未开始, ongoing -> 进行中, ended -> 已结束
              const statusMap = {
                'pending': { label: '未开始', class: 'pending' },
                'ongoing': { label: '进行中', class: 'ongoing' },
                'ended': { label: '已结束', class: 'ended' }
              };
              const status = statusMap[item.activity_status] || statusMap['ongoing'];
              statusLabel = status.label;
              statusClass = status.class;
            }
            
            return {
              ...item,
              image: this.parseImage(item.image),
              timeStr,
              statusLabel,
              statusClass
            };
          });
          
          // 云函数已经完成智能排序，直接使用
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
  },
  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadActivities();
    wx.stopPullDownRefresh();
  }
})

