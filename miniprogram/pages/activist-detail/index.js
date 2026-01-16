// pages/activist-detail/index.js
Page({
  data: {
    activist: null,
    loading: true,
    regionsCache: null,
    topicsCache: null
  },
  onLoad(options) {
    const { id } = options;
    if (id) {
      this.loadActivistDetail(id);
    }
  },
  loadActivistDetail(id) {
    const db = wx.cloud.database();

    // 设置超时
    const timeout = setTimeout(() => {
      wx.showToast({ title: '加载超时，请重试', icon: 'none' });
      this.setData({ loading: false });
    }, 15000); // 15秒超时

    // 1. 先获取行动者详情
    db.collection('activists').doc(id).get().then(activistRes => {
      clearTimeout(timeout);
      const activist = activistRes.data;

      // 2. 异步处理地区和话题解析（不阻塞页面显示）
      this.resolveRegionsAndTopics(activist).then(resolvedActivist => {
        this.setData({
          activist: resolvedActivist,
          loading: false
        });

        if (resolvedActivist.name) {
          wx.setNavigationBarTitle({
            title: `${resolvedActivist.name}的行动故事`
          });
        }
      }).catch(err => {
        console.warn('地区话题解析失败，使用原始数据:', err);
        // 如果解析失败，直接显示原始数据
        this.setData({
          activist,
          loading: false
        });

        if (activist.name) {
          wx.setNavigationBarTitle({
            title: `${activist.name}的行动故事`
          });
        }
      });

    }).catch(err => {
      clearTimeout(timeout);
      console.error('加载详情失败', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    });
  },

  // 解析地区和话题（带缓存优化）
  async resolveRegionsAndTopics(activist) {
    const tasks = [];

    // 如果有街道ID，需要解析
    if (activist.street && typeof activist.street === 'string') {
      tasks.push(this.resolveRegion(activist.street));
    }

    // 如果有话题ID，需要解析
    if (activist.topic && typeof activist.topic === 'string') {
      tasks.push(this.resolveTopic(activist.topic));
    }

    // 如果有话题数组，需要解析
    if (activist.topics && Array.isArray(activist.topics)) {
      tasks.push(this.resolveTopics(activist.topics));
    }

    try {
      const results = await Promise.all(tasks);
      const resolvedActivist = { ...activist };

      // 应用解析结果
      results.forEach(result => {
        if (result.type === 'region') {
          resolvedActivist.street = result.name;
        } else if (result.type === 'topic') {
          resolvedActivist.topic = result.name;
        } else if (result.type === 'topics') {
          // 如果有多个话题，取第一个作为主要显示话题
          if (result.names && result.names.length > 0) {
            resolvedActivist.topic = result.names[0];
          }
        }
      });

      return resolvedActivist;
    } catch (error) {
      console.warn('部分数据解析失败:', error);
      return activist; // 返回原始数据
    }
  },

  // 解析地区（带缓存）
  async resolveRegion(streetId) {
    // 先检查缓存
    if (this.data.regionsCache) {
      const region = this.data.regionsCache.find(r => r._id === streetId || r.id === streetId);
      if (region) {
        return { type: 'region', name: region.name };
      }
    }

    // 缓存不存在，查询数据库
    try {
      const db = wx.cloud.database();
      const result = await db.collection('regions').where({
        $or: [{ _id: streetId }, { id: streetId }]
      }).get();

      if (result.data && result.data.length > 0) {
        const region = result.data[0];
        // 更新缓存
        const cache = this.data.regionsCache || [];
        cache.push(region);
        this.setData({ regionsCache: cache });

        return { type: 'region', name: region.name };
      }
    } catch (error) {
      console.warn('地区查询失败:', error);
    }

    // 查询失败，返回原始ID
    return { type: 'region', name: streetId };
  },

  // 解析单个话题（带缓存）
  async resolveTopic(topicId) {
    // 先检查缓存
    if (this.data.topicsCache) {
      const topic = this.data.topicsCache.find(t => t._id === topicId || t.id === topicId);
      if (topic) {
        return { type: 'topic', name: topic.name };
      }
    }

    // 缓存不存在，查询数据库
    try {
      const db = wx.cloud.database();
      const result = await db.collection('topics').where({
        $or: [{ _id: topicId }, { id: topicId }]
      }).get();

      if (result.data && result.data.length > 0) {
        const topic = result.data[0];
        // 更新缓存
        const cache = this.data.topicsCache || [];
        cache.push(topic);
        this.setData({ topicsCache: cache });

        return { type: 'topic', name: topic.name };
      }
    } catch (error) {
      console.warn('话题查询失败:', error);
    }

    // 查询失败，返回原始ID
    return { type: 'topic', name: topicId };
  },

  // 解析话题数组（带缓存）
  async resolveTopics(topicIds) {
    if (!Array.isArray(topicIds) || topicIds.length === 0) {
      return { type: 'topics', names: [] };
    }

    const names = [];
    const unresolvedIds = [];

    // 先从缓存中查找
    for (const topicId of topicIds) {
      if (this.data.topicsCache) {
        const topic = this.data.topicsCache.find(t => t._id === topicId || t.id === topicId);
        if (topic) {
          names.push(topic.name);
          continue;
        }
      }
      unresolvedIds.push(topicId);
    }

    // 查询未缓存的话题
    if (unresolvedIds.length > 0) {
      try {
        const db = wx.cloud.database();
        const result = await db.collection('topics').where({
          $or: unresolvedIds.map(id => ({ _id: id })).concat(unresolvedIds.map(id => ({ id: id })))
        }).get();

        if (result.data && result.data.length > 0) {
          const cache = this.data.topicsCache || [];

          for (const topic of result.data) {
            names.push(topic.name);
            cache.push(topic);
          }

          this.setData({ topicsCache: cache });
        }
      } catch (error) {
        console.warn('话题数组查询失败:', error);
      }
    }

    return { type: 'topics', names };
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      urls: [url],
      current: url
    });
  }
});

