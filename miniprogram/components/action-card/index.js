// components/action-card/index.js
Component({
  properties: {
    action: {
      type: Object,
      value: {}
    }
  },
  methods: {
    onTap() {
      const id = this.properties.action._id || this.properties.action.id;
      // 改为自定义名称 'click'，避免与原生 tap 冲突
      this.triggerEvent('click', { id });
    }
  }
});

