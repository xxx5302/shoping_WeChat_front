var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_login: true,
    list: [],
    showData: 1,
    loadText: '加载中',
    remark: ['未结算','已结算']
  },
  page: 1,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.check_login() ? this.setData({ is_login: true }) : this.setData({ is_login: false });
    this.getData();
  },

  getData: function () {
    var token = wx.getStorageSync('token');
    let that = this;
    wx.showLoading();
    this.setData({ isHideLoadMore: false })
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'user.get_user_distribution_order',
        token: token,
        page: that.page
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          var list = that.data.list;
          list = list.concat(res.data.data);
          that.setData({ list, isHideLoadMore: true })
        } else if (res.data.code == 1) {
          if (that.data.list.length == 0 && that.page == 1) that.setData({ showData: 0 });
          that.setData({ isHideLoadMore: true, no_data: 1 })
          return false;
        } else if (res.data.code == 2) {
          that.setData({ is_login: false })
        }
      },
      fail: (error) => {
        console.log(error)
        wx.showLoading();
      }
    })
  },

  /**
  * 授权成功回调
  */
  authSuccess: function () {
    wx.reLaunch({
      url: '/lionfish_comshop/pages/user/scoreDetails',
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.no_data == 1) return false;
    this.page += 1;
    this.getData();
    this.setData({
      isHideLoadMore: false
    })
  }
})