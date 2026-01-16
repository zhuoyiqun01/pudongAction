// components/action-card/index.js
Component({
  properties: {
    action: {
      type: Object,
      value: {},
      observer: function(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.processDisplayTitle(newVal);
        }
      }
    }
  },
  data: {
    displayTitle: ''
  },
  lifetimes: {
    ready() {
      if (this.properties.action && Object.keys(this.properties.action).length > 0) {
        this.processDisplayTitle(this.properties.action);
      }
    }
  },
  methods: {
    processDisplayTitle(action) {
      // 直接从 bio 中提取第一句话
      let bio = action.bio || '';
      
      if (bio) {
        // 1. 去除 HTML 标签
        let plainText = bio.replace(/<[^>]+>/g, '');
        
        // 2. 查找第一个句号（支持中英文标点）
        const markers = ['。', '！', '？', '.', '!', '?'];
        let firstEndIndex = -1;
        
        for (const marker of markers) {
          const index = plainText.indexOf(marker);
          if (index !== -1 && (firstEndIndex === -1 || index < firstEndIndex)) {
            firstEndIndex = index;
          }
        }
        
        if (firstEndIndex !== -1) {
          this.setData({ displayTitle: plainText.substring(0, firstEndIndex) });
          return;
        } else if (plainText.length > 0) {
          // 没有标点但有文字，取前 25 字
          this.setData({ displayTitle: plainText.substring(0, 25) });
          return;
        }
      }
      
      this.setData({ displayTitle: '' });
    },
    onTap() {
      const id = this.properties.action._id || this.properties.action.id;
      // 改为自定义名称 'click'，避免与原生 tap 冲突
      this.triggerEvent('click', { id });
    }
  }
});

