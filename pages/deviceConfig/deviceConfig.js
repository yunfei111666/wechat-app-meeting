var app = getApp()
var bletools = require('../../utils/bletools.js')
var constants = require('../../utils/constants.js')
const onfire = require('../../utils/onfire.js')
const util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
      min:0,
      max:100,
    isMicroOpen:true,
    isCameraOpen: true,
    isCameraRiseOpen: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     // 初始化数据
     var device = app.globalData.devicesList
     console.log('开始读数据了 ===' + device.deviceId)
     
     // 设备未连接判断
     if (app.globalData.connectState != constants.STATE_CONNECTED) {
       // 已经绑定过设备
       if (device.deviceNo != '') {
         // 有设备，变更UI和数据
         this.setData({
          hasEquipment:true,
           deviceName:device.deviceName
         })
         // 重连
         bletools.connectBle(device)
         return
       } 
     }else{
        // 话筒
        app.readDataFormBLE(device.deviceId, constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_MIC)
        // 摄像头
        app.readDataFormBLE(device.deviceId, constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_CAMEAR)
        // 音量
        app.readDataFormBLE(device.deviceId, constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_VOL)
        // 摄像头升降
        app.readDataFormBLE(device.deviceId,constants.SER_UUID_DEVICE, constants.CHAR_UUID_DEVICE_CAMEAR)
     }
 
     // 监听连接状态
     onfire.on('connectStateChange', e => {
       if (e == constants.STATE_CONNECTED) {
        // 话筒
       app.readDataFormBLE(device.deviceId, constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_MIC)
       // 摄像头
       app.readDataFormBLE(device.deviceId, constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_CAMEAR)
       // 音量
       app.readDataFormBLE(device.deviceId, constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_VOL)
       }
     })
     
     // 监听麦克风开关
     onfire.on('devMicChange', e => {
       console.log('devMicChange ===' + e)
       if (e == "0") {
         this.setData({
          isMicroOpen: false,
         })
       } else {
         this.setData({
          isMicroOpen: true,
         })
       }
     })
 
     // 监听摄像头开关
     onfire.on('devCamearChange', e => {
       console.log('devCamearChange ===' + e)
       if (e == "0") {
         this.setData({
          isCameraOpen: false,
         })
       } else {
         this.setData({
          isCameraOpen: true,
         })
       }
     })

     // 监听摄像头升起开关
     onfire.on('devCamearRiseChange', e => {
      console.log('devCamearRiseChange ===' + e)
      if (e == "0") {
        this.setData({
         isCameraRiseOpen: false,
        })
      } else {
        this.setData({
         isCameraRiseOpen: true,
        })
      }
    })

      // 监听音量
    onfire.on('devVolChange', e => {
      console.log('devVolChange ===' + e)
      this.setData({
        volvalue: parseInt(e)
      })
    })
 

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
    onfire.un("devVolChange")
    onfire.un("devMicChange")
    onfire.un("devCamearChange")
    onfire.un("devCamearRiseChange")
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
  toWiFi:function(){
    var that = this;
    //检测手机型号api
    wx.getSystemInfo({
      success: function (res) {
        console.log(res);
        let sys= res.platform;
        if(sys=="ios"){
         console.log("apple");
             wx.navigateTo({
                url: "../wifiLink/wifiLink?SSID="
            })

        }else{
            wx.navigateTo({
              url: "../deviceWiFi/deviceWiFi"
          })
        }
      }
    })

  },
  //话筒按钮点击
  microBtnClicked: function () {

    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      wx.navigateTo({
        url: '../equiment/equiment',
      })
      return
    }

    // true的时候通知关闭，false通知打开
    var str = "0"
    if (this.data.isMicroOpen) {
      this.setData({ isMicroOpen: false,})
      str = "0"
    } else {
      this.setData({isMicroOpen: true,})
      str = "1"
    }

    console.log('开始准备写话筒开关数据，数据为：' + str)

    // 写数据
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_MIC, str)

  },
  //摄像按钮点击
  cameraBtnCkicked: function () {
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      
      wx.navigateTo({
        url: '../equiment/equiment',
      })
      return
    }

    // true的时候通知关闭，false通知打开
    var str = "0"

    if (this.data.isCameraOpen) {
      this.setData({isCameraOpen: false,})
      str = "0"
    } else {
      this.setData({isCameraOpen: true,})
      str = "1"
    }
    console.log('开始准备写摄像开关数据，数据为：' + str)

    // 写数据
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_CAMEAR, str)
  },
  //摄像按钮升起点击
  cameraRiseBtnCkicked: function () {
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      wx.navigateTo({
        url: '../equiment/equiment',
      })
      return
    }

    // true的时候通知关闭，false通知打开
    var str = "0"

    if (this.data.isCameraRiseOpen) {
      this.setData({isCameraRiseOpen: false,})
      str = "0"
    } else {
      this.setData({isCameraRiseOpen: true,})
      str = "1"
    }
    console.log('开始准备写摄像升降数据，数据为：' + str)

    // 写数据
    app.writeToDevice(constants.SER_UUID_DEVICE, constants.CHAR_UUID_DEVICE_CAMEAR, str)
  },
  //声音
  changevol: function (event){

    var device = app.globalData.devicesList
    // 设备未连接判断
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      // 已经绑定过设备
      if (device.deviceNo != '') {
        wx.showToast({
          title: '设备重连',
          duration: 2000
        })
        // 重连
        bletools.connectBle(device)
        return
      } else {
        // 去添加设备
        wx.navigateTo({
          url: '../equiment/equiment',
        })
        return
      }
    }
    var vol = String(event.detail.value)
    //传给设备
    console.log('音量大小 ====' + vol)
    //写数据
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_VOL, vol)
  },
  /**
   * 解绑设备
   */
  remove:function(){
    var encValue = util.getRSA_str(app.globalData.devicesList.deviceNo);
    let that = this;
    wx.request({
      url: app.globalData.urlHeader + '/auth/device/unbind',
      method: 'post',
      data: {
        'deviceNo': encValue,
      },
      header: {
        Authorization: wx.getStorageSync('JWT')
      }, // 设置请求的 header
      success: function (res) {
        console.log(res);
        if (res.data.code =='200'){
          wx.showModal({
            title: '提示',
            content: '确定要解绑设备！',
            success(res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1
                })
              } else if (res.cancel) {

              }
            }
          })
        }
      },
      fail: function () {
        
      }
    })
  }
})