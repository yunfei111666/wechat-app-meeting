// pages/appointmentAdd/appointmentAdd.js
const APP = getApp();
var bletools = require('../../utils/bletools.js');
var constants = require('../../utils/constants.js');
const onfire = require('../../utils/onfire.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPassWord: true, // 切换密码显示隐藏
    pwd_val: '', // 密码值
    deviceName:'',//设备名称
    deviceId:''//设备id（32位）
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      deviceName: options.deviceName,
      deviceId: options.username
    })

    //监听扫描结果
    onfire.on('meetingJoinSuccess', e => {
      var chararray = e.split("&")
      console.log('meetingJoinSuccess value ===' + e)
      wx.navigateTo({
        url: '../deviceMeeting/deviceMeeting?meetingID='+chararray[0]+'&RCID='+chararray[1],
      })
    })

  },
  // 一键开会
  formSubmit: function (e) {

    // 震动反馈
    wx.vibrateShort({
      complete: (res) => {},
      success:(res)=>{
        console.log("震动成功")
      },
      fail:(res)=>{
        console.log("震动失败 res ==" + res)
      },
    })
    
    var param = e.detail.value;
    console.log(param)

    if (param.meetingID.length == 0){
      wx.showToast({
        title: '请输入会议号',
        duration: 2000,
      })
      return
    }

    // 设备连接判断
    if (APP.globalData.connectState != constants.STATE_CONNECTED) {
      wx.navigateTo({
        url: '../equiment/equiment',
      })
      return
    }

    // 无密码为FFFF
    var str = ""
    if (param.password.length == 0){
      str = param.meetingID + "&FFFF"
    }else{
      str = param.meetingID + "&" + param.password
    }
    // 写数据
    APP.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_MEETING_JOIN, str)

  },
  // 密码框失去焦点时
  bindblur: function (e) {
    this.setData({
      pwd_val: e.detail.value
    })
  },
  // 密码显示隐藏
  isShow: function () {
    this.setData({
      isPassWord: !this.data.isPassWord
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
    // 取消监听
    onfire.un("meetingJoinSuccess")
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