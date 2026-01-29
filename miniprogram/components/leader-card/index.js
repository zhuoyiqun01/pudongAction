// components/leader-card/index.js
Component({
  properties: {
    leader: {
      type: Object,
      value: {}
    }
  },
  methods: {
    onImageError(e) {
      this.triggerEvent('error', e.detail);
    }
  }
});

