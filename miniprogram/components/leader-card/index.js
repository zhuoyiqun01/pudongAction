// components/leader-card/index.js
Component({
  properties: {
    leader: {
      type: Object,
      value: {}
    }
  },
  methods: {
    onTap() {
      // 改为自定义名称 'click'，避免与原生 tap 冲突
      this.triggerEvent('click', { id: this.properties.leader._id });
    },
    onImageError(e) {
      this.triggerEvent('error', e.detail);
    }
  }
});

