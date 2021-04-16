// lionfish_comshop/components/vipModal/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    imgUrl: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goUrl: function(){
      wx.navigateTo({
        url: '/lionfish_comshop/moduleA/vip/upgrade',
      })
    },
    closeModal: function() {
      this.setData({
        visible: false
      })
    }
  }
})
