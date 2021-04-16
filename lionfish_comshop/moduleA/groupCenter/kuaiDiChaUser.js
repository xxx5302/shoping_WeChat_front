// lionfish_comshop/moduleA/groupCenter/kuaiDiChaUser.js
var app = getApp();
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    saved: true, //包裹到店状态 true到店 false未到店
    packageCode: '546845312',
    saveTime: '2021-04-15 05:07:12',
    takeTime: '2021-04-17 05:07:12',
    sumTime: '48小时',
    communityName: '恒盛豪庭',
    headName: '尚品商超',
    place: '第3层',
    lastQueryName: '未知',
    status: 1, //包裹状态：1存入 2取出
    showStatus: '未取', //包裹状态：1存入 2取出
    isShowTakeTime: false //是否显示取件时间
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //取用户信息
    var userInfo = wx.getStorageSync("userInfo");
    this.setData({
      lastQueryName: userInfo.nickName
    })
    //取上一页面传递过来的参数并同步data.packageCode

    app.setShareConfig();
    this.setData({
      packageCode: options.packageCode
    })
  },
  /**
   * 计算两个时间之间的时间差
   */
  timedifference: function (faultDate, completeTime) {
    var stime = Date.parse(new Date(faultDate)); //获得开始时间的毫秒数
    var etime = Date.parse(new Date(completeTime)); //获得结束时间的毫秒数
    var usedTime = etime - stime; //两个时间戳相差的毫秒数
    var days = Math.floor(usedTime / (24 * 3600 * 1000));
    //计算出小时数
    var leave1 = usedTime % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
    var hours = Math.floor(leave1 / (3600 * 1000)); //将剩余的毫秒数转化成小时数
    //计算相差分钟数
    var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
    var minutes = Math.floor(leave2 / (60 * 1000)); //将剩余的毫秒数转化成分钟
    //计算相差秒数
    var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
    var seconds = Math.floor(leave3 / 1000); //将剩余的毫秒数转化成秒数

    var dayStr = days == 0 ? "" : days + "天";
    var hoursStr = hours == 0 ? "" : hours + "小时";
    var minutesStr = minutes == 0 ? "" : minutes + "分"
    var time = dayStr + hoursStr + minutesStr + seconds + "秒";
    return time;
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    //查询快递信息,并调用后台接口
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'kuaidi.get_package',
        packageCode: that.data.packageCode,
        lastQueryName: that.data.lastQueryName
      },
      method: 'get',
      dataType: 'json',
      success: function (res) {
        console.log(res)
        if (res.data.code == 1) {
          var nowTime = util.formatTime2(new Date()); //当前时间，用于取件时间为空时计算存放时长
          var packageCode = res.data.data['package_code'];
          var saveTime = res.data.data['save_time'];
          var status = res.data.data['status'];
          //如果包裹状态为1，则分拆为当前时间用于计算存放时长，另转换为未取
          //如果包裹状态为2，则正常显示取件时间,isShowTakeTime:true
          if (status == 1) {
            console.log('未取')
            that.setData({
              isShowTakeTime: false,
              takeTime: nowTime,
              showStatus: '未取'
            })
          } else {
            console.log('已取出')
            that.setData({
              isShowTakeTime: true,
              takeTime: res.data.data['take_time'],
              showStatus: '已取出'
            })
          }
          //计算存放时间
          var sumTime = that.timedifference(saveTime, that.data.takeTime);
          console.log(that.data.saveTime)
          console.log(that.data.takeTime)
          console.log(sumTime)
          var communityName = res.data.data['community_name'];
          var headName = res.data.data['head_name'];
          var place = res.data.data['place'];

          //查询成功
          //console.log(res.data);
          wx.showToast({
            title: '快递已到店',
            duration: 1000
          })
          that.setData({
            saved: true,
            packageCode: packageCode,
            saveTime: saveTime,
            //takeTime:nowTime,
            sumTime: sumTime,
            communityName: communityName,
            headName: headName,
            place: place
          });

        } else {
          console.log('lwn:')
          that.setData({
            saved: false
          })
          //数据库无相关信息
          wx.showToast({
            title: '当前快递尚未到达超市',
            duration: 1000
          })
          // todo
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})