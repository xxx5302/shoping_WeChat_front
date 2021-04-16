// lionfish_comshop/components/fixed-cart/index.js
Component({
  externalClasses: ["i-class"],
  properties: {
    cartNum: {
      type: Number,
      default: 0
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goCart: function () {
      wx.switchTab({
        url: '/lionfish_comshop/pages/order/shopCart',
      })
    }
  }
})
