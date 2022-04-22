// pages/wifiSend/wifiSend.js
var app = getApp()
var constants = require('../../utils/constants.js')
var onfire = require('../../utils/onfire.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    devices:'',
    show1:true,
    show2:true,
    show3:true,
    show4:true,
    progress:0,
    isEnd:true,
    msg:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {    
    console.log('要写数据了 options.SSID ===== ' + options.SSID + ' password ===' + options.password)

    var device = app.globalData.devicesList

    // 写数据 conFig-start
    app.writeToDevice(constants.SER_UUID_WIFI, constants.CHAR_UUID_WIFI_CONFLG_START, '0')

    var SSID_A = options.SSID
    var SSID_B = ''
    if (options.SSID.length > 20){
      SSID_A = options.SSID.substring(0,20)
      SSID_B = options.SSID.substring(20)
    }

    // 写数据 SSID_A
    setTimeout(function () {
      app.writeToDevice(constants.SER_UUID_WIFI, constants.CHAR_UUID_WIFI_SSID_A, SSID_A)
    }, 100)
    
    if(SSID_B != ''){
      // 写数据 SSID_B
      setTimeout(function () {
        app.writeToDevice(constants.SER_UUID_WIFI, constants.CHAR_UUID_WIFI_SSID_B, SSID_B)
      }, 200) 
    }

    var passwd_A = options.password
    var passwd_B = ''
    if (options.password.length > 20){
      passwd_A = options.password.substring(0,20)
      passwd_B = options.password.substring(20)
    }

    // 写数据 passwd_A
    setTimeout(function () {
      app.writeToDevice(constants.SER_UUID_WIFI, constants.CHAR_UUID_WIFI_PASSWORD_A, passwd_A)
    }, 300) 
    
    if (passwd_B != '') {
      // 写数据 passwd_B
      setTimeout(function () {
        app.writeToDevice(constants.SER_UUID_WIFI, constants.CHAR_UUID_WIFI_PASSWORD_B, passwd_B)
    }, 400) 
      
    }

    // 写数据 conFig-complete
    setTimeout(function () {
      app.writeToDevice(constants.SER_UUID_WIFI, constants.CHAR_UUID_WIFI_CONFLG_COMPLETE, '1')
    }, 500) 
  
    console.log('WIFI 写入结束')

    var that = this
    // 动画设置
    setTimeout(function () {
      that.setData({
        show1:false,
        progress:20,
      })
    }, 100) 
    setTimeout(function () {
      that.setData({
        show1:false,
        progress:20,
      })
    }, 300)
    setTimeout(function () {
      that.setData({
        show2:false,
        progress:40,
      })
    }, 500)
    setTimeout(function () {
      that.setData({
        show3:true,
        progress:60,
      })
    }, 700)
    setTimeout(function () {
      that.setData({
        show4:false,
        progress:80,
      })
    }, 900)

    // setTimeout(() => {
    //   // 读取WiFi连接状态
    //   app.readDataFormBLE(device.deviceId, constants.SER_UUID_WIFI, constants.CHAR_UUID_WIFI_CONFLG_COMPLETE)
    // }, 1000);

    // 监听wifi连接结果
    onfire.on('wifiConflgResult',e=>{
      that.setData({
        isEnd:false,
        progress:100,
      })
      
      if(e=='1'){
        that.setData({
          msg:'WiFi连接成功'
        })
        
      }else{
        that.setData({
          msg:'WiFi连接失败，请重试'
        })
      }
    })

  },
  btnClicked:function(){
    let pagesInt = getCurrentPages().length

    if(this.isEnd == true){
      if(pagesInt == 6){
        wx.navigateBack({
          delta:4
        })
      }else{
        wx.navigateBack({
          delta:2
        })
      }
    }else{
      wx.navigateBack({
        delta:1
      })
    }
    

  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  },
})