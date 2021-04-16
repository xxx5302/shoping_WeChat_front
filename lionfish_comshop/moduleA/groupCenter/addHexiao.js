var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    qrcode: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!util.check_login()) {
      wx.redirectTo({
        url: '/lionfish_comshop/pages/user/me',
      })
    }
    this.get_hx_qrcode();
  },

  get_hx_qrcode: function () {
    var that = this;
    var token = wx.getStorageSync('token');
    wx.showLoading();

    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'community.get_community_bind_member_qrcode',
        token: token
      },
      dataType: 'json',
      success: function (res) {
        console.log(res)
        if (res.data.code == 0) {
          console.log(res)
          that.setData({ qrcode: res.data.qrcode })
        } else {
          // todo
        }
        wx.hideLoading();
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  }
})