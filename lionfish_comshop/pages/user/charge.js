var app = getApp();
var util = require('../../utils/util.js');

Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    canPay: false,
    money: '',
    onFocus: false,
    accountMoney: 0,
    chargetype_list: [],
    activeTypeId: '',
    recharge_get_money: '',
    rewardIdx: -1,
    chargeArr: []
  },
  rech_id: 0,
  revenue: [],
  reward: [],

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAccountMoney();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (!util.check_login()) {
      wx.redirectTo({
        url: '/lionfish_comshop/pages/user/me',
      })
    }
  },

  getAccountMoney() {
    let token = wx.getStorageSync('token');
    let that = this;
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'user.get_account_money',
        token: token
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let rdata = res.data;
          let member_charge_publish = rdata.member_charge_publish;
          let chargetype_list = rdata.chargetype_list;
          let recharge_get_money = rdata.recharge_get_money || '';

          let chargeArr = chargetype_list.sort(function (a, b) {
            return a.money - b.money;
          });
          let revenue = [];
          let reward = [];
          chargeArr.forEach(item => {
            revenue.push(item.money * 1);
            reward.push(item.send_money * 1);
          })
          that.revenue = revenue;
          that.reward = reward;

          let excharge_nav_name = res.data.excharge_nav_name || '详情';
          wx.setNavigationBarTitle({
            title: excharge_nav_name,
          })

          that.setData({
            accountMoney: rdata.data,
            chargetype_list,
            member_charge_publish,
            recharge_get_money,
            chargeArr
          })
        } else if (res.data.code == 1) {
          wx.redirectTo({
            url: '/lionfish_comshop/pages/user/me',
          })
        }
      }
    })
  },

  getMoney: function (e) {
    var val = e.detail.value;
    val ? this.setData({
      canPay: true
    }) : this.setData({
      canPay: false
    });
    let money = val;
    let rewardIdx = -1;
    if(this.data.recharge_get_money==1) {
      rewardIdx = this.canAwardMoney(money);
      console.log('rewardIdx', rewardIdx);
    }
    this.setData({
      money,
      rewardIdx
    });
    // return money;
  },

  /**
   * 获得送金额提示
   */
  canAwardMoney: function (money) {
    let revenue = this.revenue;
    let reward = this.reward;
    //小于最小值
    if (money < Math.min.apply(null, revenue)) {
      return -1;
    }
    if (money >= Math.max.apply(null, revenue)) {
      return revenue.length - 1;
    }

    let idx = 0, i = 0, j = revenue.length;
    for (i; i < j; i++) {
      if (revenue[i] > money) {
        idx = i;
        break;
      }
    }
    return idx-1;
  },

/**
 * 余额充值
 */
wxcharge: function (sendMoney = 0) {
  let oriMoney = 0;
  if (sendMoney > 0) {
    oriMoney = sendMoney;
  } else {
    oriMoney = this.data.money;
    var reg = /^\d+(\.\d+)?$/;
    if (!reg.test(oriMoney)) {
      wx.showToast({
        title: '请输入正确的金额',
        icon: 'none'
      })
      return false;
    }
  }
  let money = parseFloat(oriMoney).toFixed(2) || 0;
  let token = wx.getStorageSync('token');
  let that = this;

  that.data.canPay && app.util.request({
    url: 'entry/wxapp/user',
    data: {
      controller: 'car.wxcharge',
      token: token,
      money: money,
      rech_id: that.rech_id
    },
    dataType: 'json',
    success: function (res) {
      wx.requestPayment({
        "appId": res.data.appId,
        "timeStamp": res.data.timeStamp,
        "nonceStr": res.data.nonceStr,
        "package": res.data.package,
        "signType": res.data.signType,
        "paySign": res.data.paySign,
        'success': function (wxres) {
          that.setData({
            canPay: false,
            activeTypeId: 0
          })
          that.getAccountMoney();
          that.rech_id = 0;
          wx.showToast({
            icon: 'none',
            title: '充值成功',
          })
          setTimeout(() => {
            wx.reLaunch({
              url: '/lionfish_comshop/pages/user/me',
            })
          }, 2000)
        },
        'fail': function (error) {
          if (that.rech_id > 0) that.setData({
            canPay: false,
            activeTypeId: 0
          }), that.rech_id = 0;
          wx.showToast({
            icon: 'none',
            title: '充值失败，请重试！',
          })
        }
      })
    }
  })
},

/**
 * 获得焦点
 */
bindIptFocus: function () {
  this.rech_id = 0;
  this.setData({
    onFocus: true,
    activeTypeId: 0,
    money: '',
    canPay: false
  })
},

/**
 * 失去焦点
 */
bindIptBlur: function () {
  this.setData({
    onFocus: false
  })
},

goCharge: function (e) {
  let that = this;
  let chargetype_list = this.data.chargetype_list;
  let idx = e.currentTarget.dataset.idx;
  let rech_id = chargetype_list[idx].id;
  let money = chargetype_list[idx].money;
  this.rech_id = rech_id;
  this.setData({
    canPay: true
  }, () => {
    that.wxcharge(money);
  })
},

selChargeType: function (e) {
  let that = this;
  let chargetype_list = this.data.chargetype_list;
  let idx = e.currentTarget.dataset.idx;
  let activeTypeId = chargetype_list[idx].id || 0;
  let money = chargetype_list[idx].money;
  this.rech_id = activeTypeId;
  that.setData({
    activeTypeId,
    money,
    canPay: true
  })
}
})