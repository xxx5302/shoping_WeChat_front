//kuaiDi.js
//获取应用实例
var app = getApp();
var communityData;
var userInfo;
var place;
var items = ['地面','第1层','第2层','第3层','第4层','第5层'];
import news from '../api/new';

Page({

  data: {
    newsList: news || [] //新闻列表
  },
  //事件处理函数
  bindViewTap: function () {

  },
  onLoad: function () {
    app.setShareConfig();
    userInfo = wx.getStorageSync("userInfo");

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
                    wx.showToast({
                      title: '该包裹已录入过',
                      duration: 1000
                    })
                    // todo
                  }
                }
              })
            } else {
              
            }
            
          }
       })



        return;
      },
      fail: (res) => {


      }
    })
  }
})