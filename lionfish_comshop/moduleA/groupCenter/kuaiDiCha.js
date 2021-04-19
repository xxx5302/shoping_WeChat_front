//kuaiDi.js
//获取应用实例
var app = getApp();
var communityData;

Page({

  data: {
    inputValue: '', //搜索框输入内容
    userName: '未知', //取件人
    packageCode: '' //快递编码
  },
  //事件处理函数
  bindViewTap: function () {

  },
  onLoad: function () {
    //TODO..
    //后期完善取用户信息记录用户查询信息
    //取用户信息
    var userInfo = wx.getStorageSync("userInfo");
    this.setData({
      userName: userInfo.nickName
    })
    app.setShareConfig();
  },
  onShow() {

  },
  //通过bindinput绑定函数，实现input输入框输入实时同步data.inputValue值
  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  //事件绑定searchPackage函数wx.navigateTo跳转并携带参数
  searchPackage: function (e) {
    wx.navigateTo({
      url: 'kuaiDiChaUser?packageCode=' + this.data.inputValue,
      success: function (res) {
        console.log(res)
      }
    })
  },
  //扫码取件
  takePackage: function (e) {
    let that = this;
    // 二维码控件处理
    wx.scanCode({
      scanType: ['barCode'],
      success: (res) => {
        //获得二维码上面的信息
        const info = res.result;
        console.log('二维码信息：' + info);
        wx.showModal({
          title: '确认取件？',
          content: info,
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
              that.setData({
                packageCode: info
              })
              //调用后台接口，更新取件信息
              app.util.request({
                'url': 'entry/wxapp/index',
                'data': {
                  controller: 'kuaidi.update_package_getinfo',
                  packageCode: that.data.packageCode,
                  get_user: that.data.userName
                },
                method: 'get',
                dataType: 'json',
                success: function (res) {
                  console.log(res)
                  if (res.data.data==1) {
                    wx.showToast({
                      title: '取件登记成功',
                      duration: 1000
                    })
                  } else {
                    //手机震动告警
                    wx.vibrateLong({
                    })
                    // //播放声音
                    // const innerAudioContext = wx.createInnerAudioContext();//新建一个createInnerAudioContext();
                    // innerAudioContext.autoplay = true;//音频自动播放设置
                    // innerAudioContext.src = '../assets/classic.mp3';//链接到音频的地址
                    // innerAudioContext.onPlay(() => {});//播放音效
                    //消息框告警
                    wx.showToast({
                      title: '取件登记失败',
                      duration: 3000
                    })
                  }
                  
                }
              })


            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
        return;
      },
      fail: (res) => {
        console.log('扫码失败')
      }
    })
  }

})