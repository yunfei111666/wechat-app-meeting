var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wifiMsg:"",
    passwd:"",
    show:true,
    deviceName:'', //设备名称
    username:''//设备id（32位）
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ wifiMsg: options.SSID})//获取全局变量的wifi 名字
    var device = app.globalData.devicesList
    if (device.deviceNo != '') {
      this.setData({
        deviceName: app.globalData.devicesList.deviceName,
        username: app.globalData.devicesList.deviceUUID,
      });
    }
  },

  // 获取密码值
  getpasswd: function (e) {
    var val = e.detail.value;
    this.setData({passwd: val});
  },
  //获取wifi名字

  getname:function(e){
    var val = e.detail.value;
    this.setData({wifiMsg: val});
  },


  // 连接wifi
  connectWifi() {
    var that = this;
    console.log('SSID ===' + that.data.wifiMsg + '   password === ' + that.data.passwd);
    wx.navigateTo({
      url: '../wifiSend/wifiSend?SSID=' + that.data.wifiMsg + '&password=' + that.data.passwd,
    })
  },
  //看密码
  look:function(){
    console.log(this.data.show)
    if(this.data.show){
      this.setData({show:false})
    }else{
      this.setData({ show: true})
    }
  },
  change:function(){
    wx.navigateTo({
      url: '../deviceWiFi/deviceWiFi'
    })
  }
})