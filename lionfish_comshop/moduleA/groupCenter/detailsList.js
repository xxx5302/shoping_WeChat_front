var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadText: "正在加载",
    LoadingComplete: true,
    currentTab: 1,
    no_order: 0,
    page: 1,
    hide_tip: true,
    order: [],
    tip: '正在加载',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var s_type = options.type;
    this.setData({
      currentTab: s_type
    })
    this.getData();
  },
  getData: function () {
    wx.showLoading({
      title: "加载中...",
      mask: true
    });
    this.setData({
      isHideLoadMore: true
    })

    this.data.no_order = 1
    let that = this;

    var chooseDate = this.data.chooseDate;
    var token = wx.getStorageSync('token');

    var currentTab = this.data.currentTab;

    var order_status = 1;

    if (currentTab == 1) {
      order_status = 1;
    } else if (currentTab == 2) {
      order_status = 2;
    } 

    //currentTab

    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'community.headorderlist',
        token: token,
        page: that.data.page,
        order_status: order_status
      },
      method: 'post',
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          console.log(that.data.page);
          let rushList = that.data.order.concat(res.data.data);

          that.setData({
            order: rushList,
            hide_tip: true,
            'no_order': 0
          });
          wx.hideLoading();
        } else {
          that.setData({
            isHideLoadMore: true
          })
          wx.hideLoading();
          return false;
        }

      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 导航切换
   */
  switchTab: function(e){
    let currentTab = e.currentTarget.dataset.type || 1;
    this.setData({
      currentTab: currentTab,
      page:1,
      order:[]
    })

    this.getData();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.no_order == 1) return false;
    this.data.page += 1;
    this.getData();

    this.setData({
      isHideLoadMore: false
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})