
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
      wifiList:'',
      passwad:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.testPhone();
    console.log("onLoad")
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("onReady")
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("onShow")
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

  //1.检测
  testPhone:function(){
    var that = this;
    //检测手机型号api
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        var system = '';
        if (res.platform == 'android') system = parseInt(res.system.substr(8));
        if (res.platform == 'ios') system = parseInt(res.system.substr(4));
        if (res.platform == 'android' && system < 6) {
          wx.showToast({
            title: '手机版本不支持',
            duration: 2000
          })
          return
        }
        if (res.platform == 'ios' && system < 11.2) {
          wx.showToast({
            title: '手机版本不支持',
            duration: 2000
          })
          return
        }
        //2.初始化 Wi-Fi 模块
        that.startWifi();
      }
    })
  },
  //2初始化wifi
  startWifi:function(){
    var that = this;
    wx.startWifi({
      success(res){
        console.log('startWifi ==== ' + res);
        that.getWifiList();
      }
    })
  },
  //3 跳转系统页面?
  getWifiList:function(){
    var that = this;
    wx.getWifiList({
      success(res){
        console.log('getWifiList === ' + res);
        //getWifiList:ok 跳转系统页面
        that.onGetWifiList();
      },
      fail(res){
        console.log('getWifiList fail ====' + res.errCode)
        if (res.errCode == 12002) {
          wx.showToast({
            title: '密码错误',
            icon: 'fails',
            duration: 2000,
          })
        } else if (res.errCode == 12007) {
          wx.showToast({
            title: '用户拒接',
            icon: 'fails',
            duration: 2000,
          })
        } else if (res.errCode == 12005) {
          wx.showToast({
            title: '未打开Wi-Fi开关',
            icon: 'fails',
            duration: 2000,
          })
        } else if (res.errCode == 12006) {
          wx.showToast({
            title: '未打开GPS定位开关',
            icon: 'fails',
            duration: 2000,
          })
        } else {
          console.log('连接wifi错误 errcode ==' + res.errCode)
          wx.showToast({
            title: '其他错误',
            icon: 'fails',
            duration: 2000,
          })
        }
      }
    })

  },
  //4监听列表 在getlist之后才执行
  onGetWifiList:function(){
    var that=this;
    wx.onGetWifiList(function (res) {
      console.log('onGetWifiList ==== ' + res)

      var wifiList = []
      for (let i = 0; i < res.wifiList.length; i++){
        var temp = res.wifiList[i]
        if(temp.SSID != ""){
          wifiList.push(temp)
        }
      }

      that.setData({ wifiList: wifiList})
    })
  },

  /*
  安卓才有这个页面 点击wifi列表，
  */
  jump:function(e){
    console.log(e)
    let item = e.currentTarget.dataset.data
    // app.globalData.curr_wifi=item;
    console.log(app.globalData.curr_wifi)
    // BSSID: "5c:e7:bf:03:07:70"
    // SSID: "zhanghongwei"
    // frequency: 2462
    // secure: true
    // signalStrength: 68
    wx.navigateTo({
      url: '../wifiLink/wifiLink?SSID='+item.SSID
    })
  }
 
})