// pages/activist-detail/index.js
Page({
  data: {
    activist: null,
    loading: true
  },
  onLoad(options) {
    const { id } = options;
    if (id) {
      // 立即开始加载，不等待页面渲染完成
      this.loadActivistDetail(id);
    } else {
      this.setData({ loading: false });
      wx.showToast({ title: '参数错误', icon: 'none' });
    }
  },
  
  loadActivistDetail(id) {
    const db = wx.cloud.database();
    
    // 直接使用数据库查询，比云函数更快
    db.collection('activists').doc(id).get({
      success: (res) => {
        if (res.data) {
          this.processActivistData(res.data);
        } else {
          this.handleLoadError(new Error('数据不存在'));
        }
      },
      fail: (err) => {
        // 如果失败，尝试补全前缀查询（兼容运营录入的简单ID）
        let searchId = id;
        if (/^\d+$/.test(id)) {
          searchId = `activist_${id}`;
          console.log('ID 自动补全查询:', searchId);
          
          db.collection('activists').doc(searchId).get({
            success: (res) => {
              if (res.data) {
                this.processActivistData(res.data);
              } else {
                this.handleLoadError(new Error('数据不存在'));
              }
            },
            fail: (err2) => {
              this.handleLoadError(err2);
            }
          });
        } else {
          this.handleLoadError(err);
        }
      }
    });
  },

  processActivistData(activist) {
    // 处理图片字段
    if (activist.image) {
      activist.image = this.parseImage(activist.image);
    }
    if (activist.action_image) {
      activist.action_image = this.parseImage(activist.action_image);
    }
    if (activist.feeling_image) {
      activist.feeling_image = this.parseImage(activist.feeling_image);
    }

    // 处理议题字段：topics 是数组，需要转换为显示文本数组（排除"其他"）
    // 议题映射：1=楼组, 2=为老, 3=爱宠, 4=文化, 5=亲子, 6=无障碍, 7=可持续, 8=其他
    const topicMap = {
      1: '楼组',
      2: '为老',
      3: '爱宠',
      4: '文化',
      5: '亲子',
      6: '无障碍',
      7: '可持续',
      8: '其他'
    };
    
    // 处理所有议题，排除"其他"
    activist.topicsList = [];
    if (activist.topics && Array.isArray(activist.topics) && activist.topics.length > 0) {
      activist.topicsList = activist.topics
        .map(topicId => topicMap[topicId] || null)
        .filter(topicName => topicName && topicName !== '其他'); // 排除"其他"和无效值
    }
    
    // 如果没有有效议题，设置为空数组（不显示议题标签）
    if (activist.topicsList.length === 0) {
      activist.topicsList = [];
    }

    // 处理街道名称：如果 street 是 regions 的 _id（如 reg_4），需要查询获取名称
    this.processStreetName(activist, () => {
      this.setData({
        activist: activist,
        loading: false
      });

      // 设置导航栏标题
      if (activist.name) {
        wx.setNavigationBarTitle({
          title: activist.name
        });
      }
    });
  },

  processStreetName(activist, callback) {
    // 如果 street 已经是字符串名称，直接使用
    if (typeof activist.street === 'string' && !activist.street.startsWith('reg_')) {
      callback();
      return;
    }

    // 如果 street 是 _id（如 reg_4），需要查询 regions 集合
    const streetId = activist.street;
    if (!streetId) {
      activist.street = '';
      callback();
      return;
    }

    const db = wx.cloud.database();
    db.collection('regions').doc(streetId).get({
      success: (res) => {
        if (res.data && res.data.name) {
          activist.street = res.data.name;
        } else {
          // 如果查询失败，尝试使用原始值或空字符串
          activist.street = typeof streetId === 'string' ? streetId : '';
        }
        callback();
      },
      fail: (err) => {
        console.warn('查询街道名称失败:', err);
        // 查询失败时，如果原始值是字符串，尝试直接使用
        activist.street = typeof streetId === 'string' ? streetId : '';
        callback();
      }
    });
  },

  // 解析图片路径（与 activity-detail 保持一致）
  parseImage(rawImg) {
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

  handleLoadError(err) {
    console.error('加载详情失败', err);
    this.setData({ loading: false });
    wx.showToast({ 
      title: '内容已下架或不存在', 
      icon: 'none',
      duration: 2000
    });
    // 延迟返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 2000);
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

