// pages/modifyName/modifyName.js
var app = getApp()
var constants = require('../../utils/constants.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchinput:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  // 获取密码值
  getName: function (e) {
    var val = e.detail.value;
    this.setData({ searchinput: val });
  },
  //清除
  clearName:function(){
    this.setData({ searchinput: "" });
  },
  //提交
  submit:function(){

    var deviceName = this.data.searchinput
    if (deviceName.length == 0) {
      wx.showToast({
        title: '请输入设备名',
        icon: 'warn',
        duration: 2000
      });
      return
    }
    if (deviceName.length > 10) {
        wx.showToast({
          title: '名字超10个字符',
          icon: 'warn',
          duration: 2000
        });
        return
    }

    // 修改别名
    var device = app.globalData.devicesList

    wx.request({
      url: app.globalData.urlHeader + '/auth/user/modify/nickname?nickname=' + deviceName + '&account=' + device.deviceUUID,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        Authorization: wx.getStorageSync('JWT')
      },
      success(result) {
        if (result.data.code == 200) {
          wx.showToast({
            title: '修改成功',
            icon:'success',
            duration: 2000
          })
          console.log('change deviceName success ')
          app.globalData.devicesList.deviceName = deviceName
          // 通知蓝牙设备修改名称
          app.writeToDevice(constants.SER_UUID_DEVICE, constants.CHAR_UUID_DEVICE_NAME, deviceName)
          wx.navigateBack({
            delta: 1
          })
        } else {
          console.log('change deviceName error ' + result.data.code)
        }
      },
      fail(err){
        console.log('change deviceName error ' + err.errMsg)
      }
    })
  }

})