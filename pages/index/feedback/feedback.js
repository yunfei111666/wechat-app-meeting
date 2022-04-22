// pages/index/feedback/feedback.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    feedbackurl:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var urlstr = app.globalData.urlHeader + "/config/feedback/feedbackOpenUrl?authorization=" + wx.getStorageSync('JWT')
      console.log("urlStr = " + urlstr)
      this.setData({
        feedbackurl:urlstr
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