//index.js
var app = getApp()
var bletools = require('../../utils/bletools.js')
var constants = require('../../utils/constants.js')
const onfire = require('../../utils/onfire.js')

Page({
  data: {
    isShowBtn: true,
    isShowName: false,
    nickname: '',
    hasEquipment:false,
    isMicroOpen:true,
    microSrc:'../../img/speak.png',
    isCameraOpen:true,
    cameraSrc:'../../img/camera.png',
    deviceName:'会议宝',
    avatarUrl: '../../img/logo.png'  //微信头像地址
  },
  
  onLoad: function () {
    // 账号部分
    this.setData({
      isShowBtn: !wx.getStorageSync('bind'),
      isShowName: wx.getStorageSync('bind'),
      nickname: wx.getStorageSync('nickname'),
      avatarUrl:wx.getStorageSync('avatarUrl')
    })
    // 监听连接状态
    onfire.on('connectStateChange', e => {
      if (e == constants.STATE_CONNECTED) {
       // 话筒
      app.readDataFormBLE(app.globalData.devicesList.deviceId, constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_MIC)
      // 摄像头
      app.readDataFormBLE(app.globalData.devicesList.deviceId, constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_CAMEAR)
      }
    })
    
    // 监听麦克风开关
    onfire.on('devMicChange', e => {
      console.log('devMicChange ===' + e)
      if (e == "0") {
        this.setData({
          isMicroOpen: false,
          microSrc: '../../img/speak-off.png',
        })
      } else {
        this.setData({
          isMicroOpen: true,
          microSrc: '../../img/speak.png',
        })
      }
    })

    // 监听摄像头开关
    onfire.on('devCamearChange', e => {
      console.log('devCamearChange ===' + e)
      if (e == "0") {
        this.setData({
          isCameraOpen: false,
          cameraSrc: '../../img/camera-off.png',
        })
      } else {
        this.setData({
          isCameraOpen: true,
          cameraSrc: '../../img/camera.png',
        })
      }
    })
  },

  onShow: function () {
    this.setData({
      isShowBtn: !wx.getStorageSync('bind'),
      isShowName: wx.getStorageSync('bind'),
      nickname: wx.getStorageSync('nickname'),
      avatarUrl:wx.getStorageSync('avatarUrl')
    })

    // 初始化数据
    var device = app.globalData.devicesList
    console.log('开始读数据了 ===' + device.deviceId)
    // 已经绑定过设备
    if (device.deviceNo != '') {
      // 有设备，变更UI和数据
      this.setData({
        hasEquipment:true,
        deviceName:device.deviceName
      })
    }
    
    // 设备未连接判断
    if (app.globalData.connectState != constants.STATE_CONNECTED) { 
        // 重连
        bletools.connectBle(device)
        return
    }else{
       // 话筒
       app.readDataFormBLE(device.deviceId, constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_MIC)
       // 摄像头
       app.readDataFormBLE(device.deviceId, constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_CAMEAR)
    }

  },
  //事件处理函数
  naviToLogin:function(){
    wx.navigateTo({
      url: 'login/login',
    })
  },
  naviToUserinfo:function(){
    if (wx.getStorageSync('bind')){
      wx.navigateTo({
        url: 'userinfo/userinfo?username=' + wx.getStorageSync('nickname'),
      })
    }else{
      console.log("失败")
    }
  },
  // 添加设备点击方法
  addEquipment:function(){

    if (!wx.getStorageSync('bind')){
      wx.navigateTo({
        url: 'login/login',
      })
      return
    }

    wx.navigateTo({
      url: '../equiment/equiment',
    })
    
  },
  //跳转至切换设备
  naviToDeviceChange: function () {
    wx.navigateTo({
      url: '../appointmentDeviceChange/appointmentDeviceChange'
    })
  },
  //跳转至其他设置
  naviToDeviceConfig: function () {
    wx.navigateTo({
      url: '../deviceConfig/deviceConfig'
    })
  },
  //话筒按钮点击
  microBtnClicked:function(){

    var device = getApp().globalData.devicesList
    // 判断设备是否连接
    if (app.globalData.connectState != constants.STATE_CONNECTED){
      wx.showToast({
        title: '设备重连',
        duration: 2000
      })
      bletools.connectBle(device)
      return
    }

    // true的时候通知关闭，false通知打开
    var str = "0"
    if (this.data.isMicroOpen){
      this.setData({
        isMicroOpen: false,
        microSrc: '../../img/speak-off.png',
      })
      str = "0"
    }else{
      this.setData({
        isMicroOpen: true,
        microSrc: '../../img/speak.png',
      })
      str = "1"
    }

    console.log('开始准备写话筒开关数据，数据为：' + str)

    // 写数据
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_MIC, str)

  },
  //摄像按钮点击
  cameraBtnCkicked:function(){

    var device = getApp().globalData.devicesList
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      wx.showToast({
        title: '设备重连',
        duration: 2000
      })
      bletools.connectBle(device)
      return
    }

    // true的时候通知关闭，false通知打开
    var str = "0"

    if (this.data.isCameraOpen) {
      this.setData({
        isCameraOpen: false,
        cameraSrc: '../../img/camera-off.png',
      })
      str = "0"
    } else {
      this.setData({
        isCameraOpen: true,
        cameraSrc: '../../img/camera.png',
      })
      str = "1"
    }
    console.log('开始准备写摄像开关数据，数据为：' + str)

    // 写数据
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_CAMEAR, str)
  },
  onUnload:function(){
   
  },
  onHide:function(){
     // 取消事件绑定
    //  onfire.un("connectStateChange")
    //  onfire.un("devMicChange")
    //  onfire.un("devCamearChange")
  },
  gotoFeedback:function(e){
    wx.navigateTo({
      url: 'feedback/feedback',
    })
  },
  gotoReadme:function(e){
    wx.navigateTo({
      url: 'readme/readme',
    })
  }

})



