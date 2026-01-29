// pages/generator/index.js
Page({
  data: {
    inputValue: '',
    isLoading: false,
    showResult: false,
    showModal: false,
    showDisclaimer: false, // 免责声明弹窗
    selectedItem: null,
    suggestions: [], // 存放 AI 返回的 3 个卡片
    categoryIcons: {
      '观察类': '',
      '互动类': '',
      '行动类': ''
    },
    
    // 预设标签 (减少用户输入成本)
    hotTags: ['楼道堆物', '流浪猫', '社区绿化', '老人互助', '亲子阅读'],
    
    // 输入框示例提示
    examplePlaceholder: '',
    examples: [
      '春节了，很多人返乡，年味很弱，我能做点什么小事让社区更有温度？',
      '想打破社区的"陌生感"，用一件怎么样的温暖小事让邻里间产生连接？',
      '对于我们每天见到的社区工作者，如何通过一个微小举动，表达感谢？'
    ],
    currentExampleIndex: 0
  },

  onLoad() {
    // 随机选择一个例子作为输入框提示
    const randomIndex = Math.floor(Math.random() * this.data.examples.length);
    this.setData({
      examplePlaceholder: this.data.examples[randomIndex],
      currentExampleIndex: randomIndex
    });
    
    // 检查是否已显示过免责声明
    this.checkDisclaimer();
  },

  // 检查是否需要显示免责声明
  checkDisclaimer() {
    try {
      const hasShownDisclaimer = wx.getStorageSync('hasShownGeneratorDisclaimer');
      if (!hasShownDisclaimer) {
        // 首次使用，显示免责声明
        this.setData({ showDisclaimer: true });
      }
    } catch (e) {
      console.error('读取本地存储失败:', e);
      // 如果读取失败，为了安全起见，显示免责声明
      this.setData({ showDisclaimer: true });
    }
  },

  // 确认免责声明
  confirmDisclaimer() {
    try {
      // 保存到本地存储，标记已显示过
      wx.setStorageSync('hasShownGeneratorDisclaimer', true);
      this.setData({ showDisclaimer: false });
    } catch (e) {
      console.error('保存本地存储失败:', e);
      // 即使保存失败，也关闭弹窗
      this.setData({ showDisclaimer: false });
    }
  },

  // 换个话题 - 切换到下一个预输入文本
  changeTopic() {
    const { examples, currentExampleIndex } = this.data;
    const nextIndex = (currentExampleIndex + 1) % examples.length;
    this.setData({
      examplePlaceholder: examples[nextIndex],
      currentExampleIndex: nextIndex,
      inputValue: '' // 清空当前输入
    });
  },

  // 输入框监听
  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  // 点击标签快速填入
  onTagTap(e) {
    const text = e.currentTarget.dataset.text;
    this.setData({ inputValue: text });
  },

  // 核心：生成行动
  generate() {
    let keyword = this.data.inputValue.trim();
    // 如果用户没有输入，使用 placeholder 的案例内容
    if (!keyword) {
      keyword = this.data.examplePlaceholder;
      // 将案例内容设置为实际输入值
      this.setData({ inputValue: keyword });
    }

    // 判断是否是"换一批"操作
    const isRegenerate = this.data.showResult;
    
    // 如果是"换一批"，随机选择一个切入角度
    let angle = null;
    if (isRegenerate) {
      const angles = ['不同角度', '不同场景', '不同人群', '不同方式', '不同时间'];
      angle = angles[Math.floor(Math.random() * angles.length)];
    }

    this.setData({ isLoading: true, showResult: false, showModal: false });

    wx.cloud.callFunction({
      name: 'generateActionSuggestion',
      data: { keyword, angle }, // 传递切入角度
      timeout: 40000, // 前端等待超时时间设置为40秒
      success: res => {
        if (res.result && res.result.success) {
          // 如果返回的是兜底模拟数据，给开发者一个提示
          if (res.result.isFallback) {
            console.warn('AI 调用失败，正在使用模拟数据:', res.result.errorMsg);
            wx.showToast({ 
              title: 'AI 暂时休息，为您推荐经典方案', 
              icon: 'none',
              duration: 2000
            });
          }

          // 数据归一化：确保 level 标签统一为新版名称，防止 AI 或旧版本返回旧标签
          const normalizedData = res.result.data.map(item => {
            let level = item.level;
            if (level === '简单') level = '观察类';
            if (level === '进阶') level = '互动类';
            if (level === '挑战') level = '行动类';
            return { ...item, level };
          });

          this.setData({
            suggestions: normalizedData,
            showResult: true
          });
        } else {
          wx.showToast({ title: '生成创意失败，请重试', icon: 'none' });
        }
      },
      fail: err => {
        console.error('云函数调用失败:', err);
        wx.showToast({ title: '网络连接超时', icon: 'none' });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 查看详情 - 打开弹窗
  onViewDetail(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.suggestions[index];
    this.setData({
      selectedItem: item,
      showModal: true
    });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({ showModal: false });
  },

  // 阻止事件冒泡
  preventBubble() {
    // 阻止事件冒泡，点击弹窗内容区域不关闭弹窗
  },

  // 核心：绘制画布内容 (供保存和分享共用)
  async drawShareCanvas() {
    const { selectedItem, inputValue } = this.data;
    if (!selectedItem) return null;

    try {
      const query = wx.createSelectorQuery();
      const canvasObj = await new Promise((resolve) => {
        query.select('#shareCanvas')
          .fields({ node: true, size: true })
          .exec((res) => resolve(res[0]));
      });

      const canvas = canvasObj.node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getSystemInfoSync().pixelRatio;

      // 设置画布尺寸
      canvas.width = canvasObj.width * dpr;
      canvas.height = canvasObj.height * dpr;
      ctx.scale(dpr, dpr);

      // 1. 绘制背景 (上半部分：主色)
      ctx.fillStyle = '#068D7B'; // 使用主题翠绿色 (--primary-color)
      ctx.fillRect(0, 0, 600, 300);

      // 2. 绘制标题
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '24px sans-serif';
      ctx.fillText('我正在关注的社区话题', 40, 60);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px sans-serif';
      this.wrapText(ctx, inputValue, 40, 120, 520, 50);

      // 3. 绘制背景 (下半部分：根据类型变色)
      let bottomBgColor = '#F1F8FF'; // 观察类背景
      let accentColor = '#A4CCFE';   // 观察类强调色

      if (selectedItem.level === '互动类') {
        bottomBgColor = '#F1FBEF';
        accentColor = '#068D7B';
      } else if (selectedItem.level === '行动类') {
        bottomBgColor = '#FFFBFA';
        accentColor = '#F49B9B';
      }
      
      ctx.fillStyle = bottomBgColor;
      ctx.fillRect(0, 300, 600, 500);

      // 4. 绘制类型标签
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(`[ ${selectedItem.level}微行动 ]`, 40, 380);

      // 5. 绘制行动标题和描述
      ctx.fillStyle = '#333333'; // 正文深色
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText(selectedItem.title, 40, 440);

      ctx.fillStyle = '#64748b'; // 辅助灰色
      ctx.font = '28px sans-serif';
      this.wrapText(ctx, selectedItem.desc, 40, 500, 520, 45);

      // 6. 绘制水印 (增加小程序名称)
      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('由社区小事小程序 AI 生成', 300, 750);
      ctx.textAlign = 'left';

      // 7. 生成图片路径
      return await new Promise((resolve, reject) => {
        wx.canvasToTempFilePath({
          canvas,
          success: res => resolve(res.tempFilePath),
          fail: reject
        });
      });
    } catch (err) {
      console.error('绘制画布失败:', err);
      return null;
    }
  },

  // 绘制并预览卡片（长按保存）
  async saveImage() {
    const { selectedItem } = this.data;
    if (!selectedItem) return;

    wx.showLoading({ title: '正在生成卡片...', mask: true });

    try {
      const tempFilePath = await this.drawShareCanvas();
      if (!tempFilePath) throw new Error('生成图片失败');

      wx.hideLoading();
      
      // 预览图片，用户长按图片时系统会自动弹出保存选项
      wx.previewImage({
        urls: [tempFilePath], // 图片地址数组
        current: tempFilePath, // 当前显示图片的链接
        success: () => {
          // 预览成功后关闭弹窗
          this.closeModal();
        },
        fail: (err) => {
          console.error('预览图片失败:', err);
          wx.showToast({ title: '预览失败', icon: 'none' });
        }
      });

    } catch (err) {
      console.error('生成图片失败:', err);
      wx.hideLoading();
      wx.showToast({ title: '生成失败', icon: 'none' });
    }
  },

  // 文字换行辅助函数
  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    let words = text.split('');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n];
      let metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n];
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  },

  // 分享功能
  onShareAppMessage() {
    const { selectedItem, inputValue } = this.data;
    
    if (selectedItem) {
      // 创建一个 promise 来处理异步生成分享图
      const promise = new Promise(async (resolve) => {
        const tempFilePath = await this.drawShareCanvas();
        resolve({
          title: `发现一个有趣的社区小事点子：${selectedItem.title}`,
          path: `/pages/generator/index?keyword=${encodeURIComponent(inputValue)}`,
          imageUrl: tempFilePath || '' // 使用生成的卡片图片
        });
      });

      return {
        title: `发现一个有趣的社区小事点子：${selectedItem.title}`,
        path: `/pages/generator/index?keyword=${encodeURIComponent(inputValue)}`,
        promise
      };
    }

    return {
      title: '社区小事点子生成器，快来试试吧！',
      path: '/pages/generator/index'
    };
  }
})
