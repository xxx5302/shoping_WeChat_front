var util = require('we7/resource/js/util.js');
var timeQueue = require('lionfish_comshop/utils/timeQueue');
require('lionfish_comshop/utils//mixins.js');
require('/lib/SPage.js')
App({
  //小程序生命周期--当小程序初始化完成时，会触发 onLaunch（全局只触发一次）（app.js）；
  onLaunch: async function (options) {
    console.log('小程序生命周期--当小程序初始化完成时，会触发 onLaunch（全局只触发一次）（app.js）；');
    let scene = options.scene || '';
    this.globalData.scene = scene;
    var userInfo = wx.getStorageSync("userInfo");
    console.log(userInfo.country);
    this.globalData.userInfo = userInfo;
    var currentCommunity = wx.getStorageSync("community");
    this.globalData.hasDefaultCommunity = !!currentCommunity;
    this.globalData.community = currentCommunity;
    var phoneInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = phoneInfo;
    var model = this.globalData.systemInfo.model;
    this.globalData.isIpx = model.indexOf("iPhone X") > -1 || model.indexOf("unknown<iPhone") > -1;
    this.globalData.timer = new timeQueue.default();
    //小程序初始化完成后，记录访客信息 by:lwn
    util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'index.write_access_records',
        m: 'lionfish_comshop',
        nickName:userInfo.nickName,
        country:userInfo.country,
        province:userInfo.province,
        city:userInfo.city,
        gender:userInfo.gender,
        model:model
      },
      method: 'get',
      dataType: 'json',
      success: function(res) {
        console.log(res);
      }
    })
  },
  $mixinP:{
		onLoad(options){
			console.log("options", options)
		}
	},
  //小程序生命周期--页面显示，页面载入后触发onShow方法，显示页面。每次打开页面都会调用一次（比如当小程序有后台进入到前台运行或重新进入页面时）。
  onShow: function () {
    console.log('小程序生命周期--页面显示，页面载入后触发onShow方法，显示页面。每次打开页面都会调用一次（比如当小程序有后台进入到前台运行或重新进入页面时）。');
    if(this.globalData.scene!=1154) this.getUpdate();
  },
  //小程序生命周期--页面隐藏，当navigateTo、底部tab切换、上传文件选择图片时调用。
  onHide: function () {
    console.log('小程序生命周期--页面隐藏，当navigateTo、底部tab切换、上传文件选择图片时调用。');
  },
  //加载微擎工具类
  util: util,
  //用户信息，sessionid是用户是否登录的凭证
  userInfo: {
    sessionid: null,
  },
  globalData: {
    systemInfo: {},
    isIpx: false,
    userInfo: {},
    canGetGPS: true,
    city: {},
    community: {},
    location: {},
    hasDefaultCommunity: true,
    historyCommunity: [],
    changedCommunity: false,
    disUserInfo: {},
    changeCity: "",
    timer: 0,
    formIds: [],
    community_id: '',
    placeholdeImg: '',
    cartNum: 0,
    cartNumStamp: 0,
    common_header_backgroundimage: '',
    appLoadStatus: 1, // 1 正常 0 未登录 2 未选择社区
    goodsListCarCount: [],
    typeCateId: 0,
    navBackUrl: '',
    isblack: 0,
    skin: {
      color: '#ff5344',
      subColor: '#ed7b3a',
      lighter: '#fff9f4'
    },
    goods_sale_unit: '件',
    scene: '',
    indexCateId: ''
  },
  getUpdate: function(){
    if (wx.canIUse("getUpdateManager")) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {
        res.hasUpdate && (updateManager.onUpdateReady(function () {
          wx.showModal({
            title: "更新提示",
            content: "新版本已经准备好，是否马上重启小程序？",
            success: function (t) {
              t.confirm && updateManager.applyUpdate();
            }
          });
        }), updateManager.onUpdateFailed(function () {
          wx.showModal({
            title: "已经有新版本了哟~",
            content: "新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~"
          });
        }));
      });
    } else wx.showModal({
      title: "提示",
      content: "当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。"
    });
  },
  getConfig: function() {
    var token = wx.getStorageSync('token');
    console.log(token);
    return new Promise((resolve, reject)=>{
      util.request({
        url: 'entry/wxapp/user',
        data: {
          controller: 'index.get_firstload_msg',
          token,
          m: 'lionfish_comshop'
        },
        method: 'post',
        dataType: 'json',
        success: function(res) {
          if(res.data.code==0) {
            console.log(res);
            let { new_head_id, default_head_info, isparse_formdata } = res.data;
            console.log(res);
            if(!token) isparse_formdata = 0;
            wx.setStorageSync('isparse_formdata', isparse_formdata);

            if(new_head_id>0&&Object.keys(default_head_info).length) {
              wx.setStorageSync('community', default_head_info);
            }
            resolve(res)
          } else {
            reject()
          }
        }
      })
    })
  },
  setShareConfig: function(){
    wx.showShareMenu({
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },
  siteInfo: require('siteinfo.js')
});
