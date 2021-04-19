//kuaiDi.js
//获取应用实例
var app = getApp();
var communityData;
var userInfo;
var place;
var items = ['第5层','第4层','第3层','第2层','第1层','地面'];
var util = require('../../utils/util.js');

Page({

  data: {
    saved: true, //包裹到店状态 true到店 false未到店
    packageCode: '',
    saveTime: '',
    takeTime: '',
    sumTime: '',
    place: '',
    status: 1, //包裹状态：1存入 2取出
  },
  //事件处理函数
  bindViewTap: function () {

  },
  onLoad: function () {
    app.setShareConfig();
    userInfo = wx.getStorageSync("userInfo");

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
  onShow() {
    var token = wx.getStorageSync('token');
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'community.get_community_info',
        'token': token
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          communityData = res.data.community_info;
        } else {
          //is_login
          wx.reLaunch({
            url: '/lionfish_comshop/pages/user/me',
          })
        }
      }
    })
  },
  // 控件处理程序
  controltap() {
    // 二维码控件处理
    wx.scanCode({
      scanType: ['barCode'],
      success: (res) => {
        //获得二维码上面的信息
        const info = res.result;
        console.log('二维码信息：' + info);
        //如果扫描返回数据小于10位，告警提示
        if (info.length < 10) {
          //手机震动告警
          wx.vibrateLong({
          })
          wx.showToast({
            icon:'error',
            title: '请重新扫描',
            duration: 2000
          })

        } else {
          //先查询是否录入过，如果录入过，则弹出提示
          var that = this;
          app.util.request({
            'url': 'entry/wxapp/index',
            'data': {
              controller: 'kuaidi.get_package_head',
              packageCode: info
            },
            method: 'get',
            dataType: 'json',
            success: function (res) {
              console.log(res)
              //已录入过
              if (res.data.code == 1) {
                var nowTime = util.formatTime2(new Date()); //当前时间，用于取件时间为空时计算存放时长
                var saveTime = res.data.data['save_time'];
                //计算存放时间
                var sumTime = that.timedifference(saveTime, nowTime);
                console.log(nowTime)
                console.log(saveTime)
                console.log(sumTime)
                var place = res.data.data['place'];

                //弹出提示框，快递已录入过
                wx.showModal({
                  showCancel:false,
                  title: '快递已录入过',
                  content: '单号：' + info + '\r\n到店时间：' + saveTime + '\r\n存放时长：' + sumTime + '\r\n存放位置：' + place,
                  success (res) {
                    if (res.confirm) {
                      console.log('用户点击确定')
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
                
                  // saved: true,
                  // packageCode: packageCode,
                  // saveTime: saveTime,
                  // //takeTime:nowTime,
                  // sumTime: sumTime,
                  // communityName: communityName,
                  // headName: headName,
                  // place: place

              } else {
                // todo
                wx.showActionSheet({
                  alertText:'单号：' + info,
                  itemList: items,//显示的列表项
                  success: function (res) {//res.tapIndex点击的列表项
                     console.log("点击了列表项：" + items[res.tapIndex])
                     place = items[res.tapIndex];
                  },
                  fail: function (res) { },
                  complete:function(res){ 
                    console.log(res);
                    if (res.errMsg === "showActionSheet:ok") {
                      //记录包裹二维码信息
                      app.util.request({
                        'url': 'entry/wxapp/index',
                        'data': {
                          controller: 'kuaidi.save_package',
                          packageCode: info,
                          status: 1,
                          headName: communityData.head_name,
                          communityName: communityData.community_name,
                          operator: userInfo.nickName,
                          place: place
                        },
                        method: 'get',
                        dataType: 'json',
                        success: function (res) {
                          //console.log(res)
                          if (res.statusCode == 200) {
                            //录入成功
                            //console.log(res.data);
                            wx.showToast({
                              title: '录入成功',
                              duration: 1000
                            })
                          } else {
                            //录入失败，应该录入过
                            //console.log('该单号已录入过')
                            //手机震动告警
                            wx.vibrateLong({
                            })
                            wx.showToast({
                              icon:'error',
                              title: '录入失败',
                              duration: 2000
                            })
                            // todo
                          }
                        }
                      })
                    } else {

                    }
                    
                  }
               })

              }
            }
          })





















          
        }


        



        return;
      },
      fail: (res) => {


      }
    })
  }
})