// pages/appointmentDeviceChange/appointmentDeviceChange.js
const APP = getApp();
var urlHeader = APP.globalData.urlHeader;
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showView: true,
    deviceList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  /**
   * 设备选中
   */
  seleDevice: function(e) {
    console.log(e)
    var deviceNo = e.currentTarget.id
    wx.setStorageSync('deviceNo', deviceNo);
    wx.navigateBack({
      delta: 1
    })

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 显示页面自动刷新
    var that = this;
    //获取设备列表
    wx.request({
      url: urlHeader + '/auth/device/list',
      method: 'POST',
      header: {
        Authorization: wx.getStorageSync('JWT')
      }, // 设置请求的 header
      success: function(res) {
        console.log(res);
        if (res.data.code == '200') {
          if (res.data.responseData.length > 0) {
            that.setData({
              deviceList: res.data.responseData
            })
            that.setData({
              showView: false //有数据设置列表显示
            })
          } else {
            that.setData({
              showView: true
            })
          }
        }
      },
      fail: function() {
        that.setData({
          showView: true
        })
      },
      complete: function() {
        // complete
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  unBind:function(e){
      console.log(e)
    var encValue = util.getRSA_str(e.currentTarget.id);
    let that = this;
    wx.request({
      url: urlHeader + '/auth/device/unbind',
      method: 'post',
      data: {
        'deviceNo': encValue,
      },
      header: {
        Authorization: wx.getStorageSync('JWT')
      }, // 设置请求的 header
      success: function (res) {
        console.log(res);
        if (res.data.code == '200') {
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