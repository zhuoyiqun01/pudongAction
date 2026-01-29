// pages/activity-detail/index.js
Page({
  data: {
    activity: null,
    loading: true,
    buttonText: '立即报名',
    showModal: false
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

  // 深度抓取图片路径（与 activities 列表页保持一致）
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

  processActivityData(activity) {
    // 处理介绍图片 intro_images
    if (activity.intro_images) {
      if (typeof activity.intro_images === 'string') {
        // 如果是字符串，尝试按逗号或换行符分割
        activity.intro_images = activity.intro_images.split(/[,\n]/).map(url => url.trim()).filter(url => url);
      }
      // 处理每个图片 URL
      activity.intro_images = activity.intro_images.map(img => this.parseImage(img)).filter(img => img);
    }

    // 处理时间显示
    // 如果有开始时间，格式化显示（适用于有明确时间的活动）
    if (activity.start_time) {
      const startDate = new Date(activity.start_time);
      let timeStr = `${startDate.getFullYear()}-${(startDate.getMonth()+1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')} ${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
      
      // 如果有结束时间，显示时间范围
      if (activity.end_time) {
        const endDate = new Date(activity.end_time);
        // 如果是同一天，只显示一次日期
        if (startDate.toDateString() === endDate.toDateString()) {
          timeStr = `${startDate.getFullYear()}-${(startDate.getMonth()+1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')} ${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}-${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
        } else {
          // 不同天，显示日期范围
          timeStr = `${startDate.getFullYear()}-${(startDate.getMonth()+1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')} 至 ${endDate.getFullYear()}-${(endDate.getMonth()+1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`;
        }
      }
      activity.timeStr = timeStr;
    } else {
      // 没有开始时间，使用 time_display（适用于长期活动、周期性活动等）
      // 例如："长期开放"、"每周一至周五 9:00-18:00"、"持续进行中" 等
      activity.timeStr = activity.time_display || activity.time || '时间待定';
    }

    // 计算活动状态
    // 如果有具体时间，自动计算状态；否则使用 CMS 手动选择的状态
    if (activity.start_time) {
      const now = new Date();
      const startDate = new Date(activity.start_time);
      const endDate = activity.end_time ? new Date(activity.end_time) : null;
      
      if (now < startDate) {
        activity.statusLabel = '未开始';
        activity.statusClass = 'pending';
      } else if (endDate && now > endDate) {
        activity.statusLabel = '已结束';
        activity.statusClass = 'ended';
      } else {
        activity.statusLabel = '进行中';
        activity.statusClass = 'ongoing';
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
      const status = statusMap[activity.activity_status] || statusMap['ongoing'];
      activity.statusLabel = status.label;
      activity.statusClass = status.class;
    }

    // 根据是否有报名链接设置按钮文字
    // 检查顺序：register_jsj → register_url → register_info
    // 如果有 register_jsj 或 register_url → "立即报名"
    // 如果只有 register_info 或都没有 → "报名方式"
    const hasRegisterUrl = (activity.register_jsj && activity.register_jsj.trim()) || 
                           (activity.register_url && activity.register_url.trim());
    const buttonText = hasRegisterUrl ? '立即报名' : '报名方式';

    this.setData({
      activity: activity,
      loading: false,
      buttonText: buttonText
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

  /**
   * 检测是否为金数据小程序路径
   * 支持的格式：
   * - pages/forms/publish?token=xxxxx（新格式，推荐）
   * - pages/form/index?entry=xxxxx（旧格式，兼容）
   * @param {string} url - 待检测的 URL
   * @returns {boolean} 是否为金数据小程序路径
   */
  isJinshujuMiniProgramPath(url) {
    if (!url || typeof url !== 'string') return false;
    const trimmedUrl = url.trim();
    return trimmedUrl.startsWith('pages/forms/publish') || 
           trimmedUrl.startsWith('pages/form/index');
  },

  /**
   * 跳转到金数据小程序
   * @param {string} path - 金数据小程序路径
   * @param {string} fallbackUrl - 失败时的备用 URL（用于复制）
   */
  navigateToJinshujuMiniProgram(path, fallbackUrl) {
    // 金数据小程序 AppID（固定值）
    const JINSHUJU_APPID = 'wx34b0738d0eef5f78';
    
    wx.navigateToMiniProgram({
      appId: JINSHUJU_APPID,
      path: path,
      success: () => {
        console.log('跳转到金数据小程序成功:', path);
      },
      fail: (err) => {
        console.error('跳转金数据小程序失败:', err);
        wx.showModal({
          title: '提示',
          content: '无法跳转到金数据小程序。\n\n可能原因：\n1. 未在小程序后台配置跳转权限\n2. 金数据小程序未授权\n\n是否复制链接？',
          confirmText: '复制链接',
          cancelText: '返回',
          success: (res) => {
            if (res.confirm) {
              wx.setClipboardData({
                data: fallbackUrl || path,
                success: () => {
                  wx.showToast({
                    title: '链接已复制',
                    icon: 'success'
                  });
                }
              });
            }
          }
        });
      }
    });
  },

  onJoin() {
    const activity = this.data.activity;
    
    // 优先使用 register_jsj（金数据小程序路径），如果没有则使用 register_url（兼容旧数据）
    let registerUrl = null;
    let registerSource = null;
    
    if (activity.register_jsj && activity.register_jsj.trim()) {
      // 优先使用新字段 register_jsj
      registerUrl = activity.register_jsj.trim();
      registerSource = 'register_jsj';
    } else if (activity.register_url && activity.register_url.trim()) {
      // 回退到旧字段 register_url（兼容）
      registerUrl = activity.register_url.trim();
      registerSource = 'register_url';
    }
    
    // 如果有报名链接，跳转到链接
    if (registerUrl) {
      // 优先检测：是否为金数据小程序路径
      // register_jsj 字段存储的应该是金数据小程序路径
      // register_url 字段可能是金数据小程序路径或 HTTP 链接
      if (this.isJinshujuMiniProgramPath(registerUrl)) {
        // 跳转到金数据小程序
        this.navigateToJinshujuMiniProgram(registerUrl, registerUrl);
        return;
      }
      
      // 判断是外部链接还是小程序路径
      if (registerUrl.startsWith('http://') || registerUrl.startsWith('https://')) {
        // HTTP 链接自动转换为 HTTPS（微信小程序 web-view 要求 HTTPS）
        if (registerUrl.startsWith('http://')) {
          registerUrl = registerUrl.replace('http://', 'https://');
          console.log('HTTP 链接已转换为 HTTPS:', registerUrl);
        }
        
        // 外部链接，尝试使用 web-view 打开
        // 如果域名未配置，会失败，提供降级方案
        wx.navigateTo({
          url: '/pages/questionnaire/index?url=' + encodeURIComponent(registerUrl),
          fail: (err) => {
            console.error('跳转问卷页面失败:', err);
            // 降级方案：复制链接
            wx.showActionSheet({
              itemList: ['复制链接到浏览器'],
              success: () => {
                  wx.setClipboardData({
                    data: registerUrl, // 使用原始链接
                    success: () => {
                      wx.showModal({
                        title: '提示',
                        content: '链接已复制，请在浏览器中打开。\n\n如果问卷无法在小程序中打开，可能是域名未配置，请联系管理员。',
                        showCancel: false
                      });
                    }
                  });
              }
            });
          }
        });
      } else {
        // 小程序路径（非金数据小程序的其他小程序路径）
        wx.navigateTo({
          url: registerUrl,
          fail: () => {
            wx.showToast({
              title: '跳转失败',
              icon: 'none'
            });
          }
        });
      }
    } else {
      // 没有报名链接，检查是否有 register_info
      // 检查顺序：register_jsj → register_url → register_info
      if (activity.register_info && activity.register_info.trim()) {
        // 有 register_info，显示弹窗
        this.setData({
          showModal: true
        });
      } else {
        // 三个字段都没有，提示用户
        wx.showToast({
          title: '暂无报名信息',
          icon: 'none'
        });
      }
    }
  },

  closeModal() {
    this.setData({
      showModal: false
    });
  },

  stopPropagation() {
    // 阻止事件冒泡，点击弹窗内容区域不关闭弹窗
  },

  copyRegisterInfo() {
    const registerInfo = this.data.activity.register_info || '暂无报名信息';
    wx.setClipboardData({
      data: registerInfo,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success',
          duration: 1500
        });
      }
    });
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    const urls = e.currentTarget.dataset.urls || [url];
    wx.previewImage({
      urls: urls,
      current: url
    });
  }
});

