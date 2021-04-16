var app = getApp();

Page({
  data: {
    orderdistribution_info: {},
    can_tixian_money: 0
  },

  onLoad: function (options) {

  },

  onShow: function () {
    this.getData();
  },

  getData: function () {
    let token = wx.getStorageSync('token');
    app.util.ProReq('localtown.get_distribution_center_info', { token }).then(res => {
      let { orderdistribution_info, can_tixian_money } = res.data;
      this.setData({
        orderdistribution_info, can_tixian_money
      })
    }).catch(err => {
      console.log(err)
      app.util.message(err.msg || '请求出错', 'switchTo:/lionfish_comshop/pages/user/me', 'error');
    })
  },

  goLink: function(event) {
    let link = event.currentTarget.dataset.link;
    var pages_all = getCurrentPages();
    if (pages_all.length > 3) {
      wx.redirectTo({
        url: link
      })
    } else {
      wx.navigateTo({
        url: link
      })
    }
  },

  switchNotice: function(e){
    let token = wx.getStorageSync('token');
    let is_new_notice = e.detail.value?1:0;
    app.util.ProReq('localtown.change_distribution_notice', { token, is_new_notice }).then(res => {
      this.getData();
    }).catch(err => {
      this.getData();
      console.log(err)
    })
  }

})