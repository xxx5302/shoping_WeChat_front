var app = getApp();
var status = require('../../utils/index.js');

Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    currentTab: 0,
    pageSize: 10,
    navList: [{
        name: "全部",
        status: "-1"
      }, {
        name: "待结算",
        status: "0"
      }, {
        name: "已结算",
        status: "1"
      }, {
        name: "已失效",
        status: "2"
      }
    ],
    list: [],
    loadText: "加载中...",
    info: {},
    noData: 0,
    loadMore: true,
    stateArr: ["待结算", "已结算", "已失效"]
  },
  page: 1,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    status.setNavBgColor();
    this.getInfo();
    this.getData();
  },

  getInfo: function () {
    wx.showLoading();
    var token = wx.getStorageSync('token');
    let that = this;
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'groupdo.get_pincommiss_account_info',
        token: token
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          that.setData({ info: res.data.data })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg || '获取失败',
            showCancel: false,
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定')
                wx.reLaunch({
                  url: '/lionfish_comshop/pages/user/me',
                })
              }
            }
          })
        }
      }
    })
  },

  getData: function () {
    let that = this;
    let token = wx.getStorageSync('token');
    let currentTab = this.data.currentTab;
    let state = this.data.navList[currentTab].status;

    wx.showLoading();
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'groupdo.listorder_list',
        token: token,
        state: state,
        page: this.page
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let h = {};
          let list = res.data.data;
          if (list.length < 6) h.noMore = true;
          let oldList = that.data.list;
          list = oldList.concat(list);
          that.page++;
          that.setData({ list, ...h })
        } else {
          // 无数据
          if (that.page == 1) that.setData({ noData: 1 })
          that.setData({ loadMore: false, noMore: false, loadText: "没有更多记录了~" })
        }
        wx.hideLoading();
      }
    })
  },

  getCurrentList: function () {
    if (!this.data.loadMore) return false;
    this.getData();
    this.setData({
      isHideLoadMore: false
    })
  },

  onReachBottom: function(){
    this.getCurrentList();
  },

  bindChange: function () {
    this.page = 1;
    this.setData({
      list: [],
      noData: 0,
      loadMore: true,
      loadText: "加载中...",
    }, () => {
      console.log('我变啦');
      this.getData();
    });
  },

  /**
   * 切换导航
   */
  switchNav: function (e) {
    let that = this;
    if (this.data.currentTab === 1 * e.target.dataset.current) return false;
    this.setData({
      currentTab: 1 * e.target.dataset.current
    }, ()=>{
      that.bindChange()
    });
  }
})