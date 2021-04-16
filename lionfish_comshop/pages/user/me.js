//index.js
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');
var wcache = require('../../utils/wcache.js');

var app = getApp()
Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    tablebar: 4,
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
    theme_type: '',
    add_mo: 0,
    is_show_on: 0,
    level_name: '',
    member_level_is_open: 0,
    is_yue_open: 0,
    needAuth: false,
    opencommiss: 0,
    inputValue: 0,
    getfocus: false,
    showguess: true,
    items: [],
    auditStatus: 5,
    isShowCoder: false,
    myCoderList: [],
    qrcodebase64: "",
    setInter: null,
    copyright: '',
    common_header_backgroundimage: '',
    enabled_front_supply: 0,
    cartNum: 0,
    is_show_about_us: 0,
    groupInfo: {
      group_name: '社区',
      owner_name: '团长'
    },
    is_show_score: 0,
    showGetPhone: false,
    user_tool_icons: {},
    community: ''
  },
  isCalling: false,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideTabBar();
    let that = this;
    status.setNavBgColor();
    status.setGroupInfo().then((groupInfo) => {
      that.setData({ groupInfo })
    });
    wx.showLoading();
  },

  getMemberInfo: function() {
    var token = wx.getStorageSync('token');
    this.getCommunityInfo();
    let that = this;
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'user.get_user_info',
        token: token
      },
      dataType: 'json',
      success: function(res) {
        // wx.hideLoading();
        setTimeout(function(){ wx.hideLoading(); },1000);
        if (res.data.code == 0) {
          let showGetPhone = false;
          if (res.data.is_show_auth_mobile == 1 && !res.data.data.telephone) showGetPhone = true;
          let member_info = res.data.data || '';
          let params = {};

          if (member_info){
            member_info.member_level_info && (member_info.member_level_info.discount = (member_info.member_level_info.discount/10).toFixed(1));
            //开启分销
            if (res.data.commiss_level > 0) {
              //还差多少人升级
              let commiss_share_member_update = res.data.commiss_share_member_update * 1;
              let share_member_count = res.data.share_member_count * 1;
              let need_num_update = res.data.commiss_share_member_update * 1 - res.data.share_member_count * 1;

              //判断表单状态状态
              let formStatus = 0; //未填写 1 已填写未审核 2 已审核
              if (member_info.is_writecommiss_form == 1) {
                formStatus = 1;
                //已填写
                if (member_info.comsiss_flag == 1) {
                  member_info.comsiss_state == 0 ? formStatus = 1 : formStatus = 2;
                }
              }

              params = {
                formStatus,
                commiss_level: res.data.commiss_level,
                commiss_sharemember_need: res.data.commiss_sharemember_need,
                commiss_share_member_update,
                commiss_biaodan_need: res.data.commiss_biaodan_need,
                share_member_count,
                today_share_member_count: res.data.today_share_member_count,
                yestoday_share_member_count: res.data.yestoday_share_member_count,
                need_num_update
              };
            }
          } else {
            params.needAuth = true;
          }

          let { 
            is_supply, 
            is_open_vipcard_buy, 
            modify_vipcard_name, 
            is_vip_card_member, 
            modify_vipcard_logo, 
            isopen_signinreward, 
            show_signinreward_icon, 
            is_open_supplymobile,
            needAuth,
            show_user_tuan_mobile,
            is_localtown_distributionman,
            user_tool_showtype
          } = res.data;
          that.setData({
            ...params,
            member_info,
            is_supply: is_supply || 0,
            showGetPhone: showGetPhone,
            is_open_vipcard_buy: is_open_vipcard_buy || 0, 
            modify_vipcard_name: modify_vipcard_name || "会员", 
            is_vip_card_member: is_vip_card_member || 0,
            modify_vipcard_logo,
            show_signinreward_icon,
            isopen_signinreward,
            is_open_supplymobile,
            needAuth,
            show_user_tuan_mobile,
            is_localtown_distributionman,
            user_tool_showtype: user_tool_showtype || 0
          });
        } else {
          //needAuth
          that.setData({
            needAuth: true
          })
          wx.setStorage({
            key: "member_id",
            data: null
          })
        }
      }
    })
  },

  getCommunityInfo: function(){
    let that = this;
    let community = wx.getStorageSync('community');
    if (community) {
      if(!community.head_mobile) {
        util.getCommunityById(community.communityId).then(res=>{
          let head_mobile = res.data.disUserMobile || res.data.head_mobile;
          head_mobile && (res.data.hideTel = util.filterTel(head_mobile));
          that.setData({ community: res.data })
        })
      } else {
        let head_mobile = community.disUserMobile || community.head_mobile;
        head_mobile && (community.hideTel = util.filterTel(head_mobile));
        that.setData({ community })
      }
    } else {
      var token = wx.getStorageSync('token');
      token && util.getCommunityInfo().then(res => {
        let head_mobile = res.disUserMobile || res.head_mobile;
        head_mobile && (res.hideTel = util.filterTel(head_mobile));
        that.setData({ community: res })
      })
    }
  },

  getCopyright: function() {
    let that = this;
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'user.get_copyright'
      },
      dataType: 'json',
      success: function(res) {
        if (res.data.code == 0) {
          let rdata = res.data;
          let {
            enabled_front_supply,
            is_open_yue_pay,
            is_show_score,
            user_order_menu_icons,
            close_community_apply_enter,
            user_tool_icons,
            ishow_user_loginout_btn,
            commiss_diy_name,
            supply_diy_name,
            user_service_switch,
            fetch_coder_type,
            show_user_pin,
            common_header_backgroundimage,
            is_show_about_us,
            show_user_change_comunity,
            show_user_change_comunity_map,
            open_danhead_model,
            default_head_info,
            is_open_solitaire,
            user_top_font_color,
            excharge_nav_name,
            hide_community_change_btn,
            hide_community_change_word,
            close_community_index
          } = rdata;

          let h = {};
          if (open_danhead_model==1) {
            let hideTel = (default_head_info.head_mobile && util.filterTel(default_head_info.head_mobile)) || '';
            default_head_info.hideTel = hideTel;
            h.community = default_head_info;
            wx.setStorageSync('community', default_head_info);
          }

          commiss_diy_name = commiss_diy_name || '分销';
          supply_diy_name = supply_diy_name || '供应商';
          wcache.put('commiss_diy_name', commiss_diy_name);
          wcache.put('supply_diy_name', supply_diy_name);

          that.setData({
            copyright: rdata.data || '',
            common_header_backgroundimage: common_header_backgroundimage || '',
            is_show_about_us: is_show_about_us || 0,
            enabled_front_supply,
            is_open_yue_pay,
            is_show_score,
            user_order_menu_icons: user_order_menu_icons || {},
            commiss_diy_name,
            close_community_apply_enter: close_community_apply_enter || 0,
            user_tool_icons: user_tool_icons || {},
            ishow_user_loginout_btn: ishow_user_loginout_btn || 0,
            supply_diy_name,
            user_service_switch,
            fetch_coder_type: fetch_coder_type || 0,
            show_user_pin,
            show_user_change_comunity,
            show_user_change_comunity_map,
            open_danhead_model,
            is_open_solitaire,
            user_top_font_color,
            excharge_nav_name: excharge_nav_name || '查看',
            hide_community_change_btn: hide_community_change_btn || 0,
            hide_community_change_word: hide_community_change_word || 0,
            close_community_index,
            ...h
          })
        }
      }
    })
  },

  /**
   * 授权成功回调
   */
  authSuccess: function() {
    let that = this;
    wx.showLoading();
    that.setData({ needAuth: false, showAuthModal: false, tabbarRefresh: true });
    (0, status.cartNum)('', true).then((res) => {
      res.code == 0 && that.setData({
        cartNum: res.data
      })
    });
    that.getMemberInfo();
  },

  authModal: function(){
    if(this.data.needAuth) {
      this.setData({ showAuthModal: !this.data.showAuthModal });
      return false;
    }
    return true;
  },

  /**
   * 跳转团长中心
   */
  goToGroup: function() {
    5 === this.data.auditStatus ? wx.navigateTo({
      url: "/lionfish_comshop/moduleA/groupCenter/index"
    }) : wx.navigateTo({
      url: "/lionfish_comshop/moduleA/groupCenter/apply"
    });
  },

  /**
   * 更新资料
   */
  bindGetUserInfo: function(e) {
    let that = this;
    if ("getUserInfo:ok" === e.detail.errMsg) {
      var userInfo = Object.assign({}, wx.getStorageSync("userInfo"), {
        avatarUrl: e.detail.userInfo.avatarUrl,
        nickName: e.detail.userInfo.nickName
      });
      let { nickName, avatarUrl } = e.detail.userInfo;
      app.globalData.userInfo = userInfo, wx.setStorage({
        key: "userInfo",
        data: userInfo
      }), this.setData({
        userInfo: userInfo
      }), wx.showToast({
        title: "资料已更新",
        icon: "none",
        duration: 2000
      }), nickName && app.util.request({
        url: 'entry/wxapp/user',
        data: {
          controller: 'user.update_user_info',
          token: wx.getStorageSync("token"),
          nickName,
          avatarUrl
        },
        dataType: 'json',
        success: function(res) {
          if(res.data.code==0) {
            let member_info = that.data.member_info;
            let user_info = Object.assign({}, member_info, {
              avatar: e.detail.userInfo.avatarUrl,
              username: e.detail.userInfo.nickName
            });
            that.setData({
              member_info: user_info
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: "资料更新失败。",
        icon: "none"
      });
    }
  },

  /** 
   * 预览图片
   */
  previewImage: function(e) {
    var current = e.target.dataset.src;
    current && wx.previewImage({
      current: current,
      urls: [current]
    })
  },

  goLink2: function(event) {
    if(!this.authModal()) return;
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    util.check_login_new().then((res)=>{
      console.log(res)
      if (res) {
        that.setData({ tabbarRefresh: true });
        (0, status.cartNum)('', true).then((res) => {
          res.code == 0 && that.setData({
            cartNum: res.data
          })
        });
      } else {
        that.setData({ needAuth: true });
        wx.hideLoading();
      }
    })
    that.getCopyright();
    that.getMemberInfo();
  },
  
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.setData({
      tabbarRefresh: false
    })
  },

  /**
   * 设置手机号
   */
  getReceiveMobile: function(e) {
    wx.showToast({
      icon: 'none',
      title: '授权成功',
    })
    this.setData({
      showGetPhone: false
    });
  },

  /**
   * 关闭手机授权
   */
  close: function() {
    this.setData({
      showGetPhone: false
    });
  },

  /**
   * 关闭分销
   */
  closeDistribution: function() {
    this.setData({
      showDistribution: false
    })
  },

  /**
   * 分销下一步
   */
  goDistribution: function() {
    let member_info = this.data.member_info;
    //判断是不是分销商
    if (member_info.comsiss_flag == 0) {
      this.distributionNext();
    } else {
      if (member_info.comsiss_state == 0) {
        //分销商未审核
        this.distributionNext();
      } else {
        //分销商已审核
        wx.navigateTo({
          url: '/lionfish_comshop/distributionCenter/pages/me',
        })
      }
    }
  },

  distributionNext: function() {
    if (this.data.commiss_sharemember_need == 1) {
      console.log('需要分享');
      let url = '/lionfish_comshop/distributionCenter/pages/recruit';
      wx.navigateTo({
        url
      })
    } else if (this.data.commiss_biaodan_need == 1) {
      console.log('需要表单');
      // let url = '/lionfish_comshop/pages/distribution/apply';
      wx.navigateTo({
        url: '/lionfish_comshop/distributionCenter/pages/recruit',
      })
    } else {
      // 跳转表单自动审核
      let status = 0;
      let member_info = this.data.member_info;
      if (member_info.comsiss_flag == 1) {
        member_info.comsiss_state == 0 ? status = 1 : status = 2;
      }
      let url = '/lionfish_comshop/distributionCenter/pages/recruit';
      if (status == 2) {
        url = '/lionfish_comshop/distributionCenter/pages/me';
      }
      wx.navigateTo({
        url
      })
    }
  },

  goNext: function(e) {
    console.log(e)
    let status = 0;
    let member_info = this.data.member_info;
    if (member_info.comsiss_flag == 1) {
      member_info.comsiss_state == 0 ? status = 1 : status = 2;
    }
    let type = e.currentTarget.dataset.type;
    if (type == 'share') {
      wx.navigateTo({
        url: '/lionfish_comshop/distributionCenter/pages/share',
      })
    } else if (type == 'commiss') {
      if (status == 2) {
        wx.navigateTo({
          url: '/lionfish_comshop/distributionCenter/pages/me',
        })
      } else {
        wx.navigateTo({
          url: '/lionfish_comshop/distributionCenter/pages/recruit',
        })
      }
    } else if (type == 'form') {
      if (status == 2) {
        wx.navigateTo({
          url: '/lionfish_comshop/distributionCenter/pages/me',
        })
      } else {
        // let url = '/lionfish_comshop/pages/distribution/apply';
        wx.navigateTo({
          url: '/lionfish_comshop/distributionCenter/pages/recruit',
        })
      }
    }
  },

  loginOut: function() {
    wx.removeStorageSync('community');
    wx.removeStorage({
      key: 'token',
      success(res) {
        wx.reLaunch({
          url: '/lionfish_comshop/pages/user/me',
        })
      }
    })
  },

  toggleFetchCoder: function() {
    if (!this.authModal()) return;
    this.setData({
      isShowCoder: !this.data.isShowCoder
    })
  },

  /**
   * 拨打电话
   */
  callTelphone: function (e) {
    var that = this;
    var phoneNumber = e.currentTarget.dataset.phone;
    if (phoneNumber) {
      this.isCalling || (this.isCalling = true, wx.makePhoneCall({
        phoneNumber: phoneNumber,
        complete: function () {
          that.isCalling = false;
        }
      }));
    }
  },

  /**
  * 查看地图
  */
  gotoMap: function () {
    let community = this.data.community;
    let postion = {lat: community.lat, lon: community.lon};
    let longitude = parseFloat(postion.lon),
      latitude = parseFloat(postion.lat),
      name = community.disUserName,
      address = `${community.fullAddress}(${community.communityName})`;
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: name,
      address: address,
      scale: 28
    })
  },
})