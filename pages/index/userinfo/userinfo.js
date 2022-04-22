// pages/index/userinfo/userinfo.js
//获取应用实例
const APP = getApp();
var urlHeader = APP.globalData.urlHeader;

Page({

  /**
   * 页面的初始数据
   */
  data: {
      userInfo:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this;

    wx.request({
      url: urlHeader + '/auth/user/info',
      method: 'POST',
      header: {
        'Content-Type':'application/json',
        Authorization: wx.getStorageSync('JWT')
      },
      success(result){
          if(result.data.code == 200){
            console.log('get userinfo success ')
            var rslUserInfo = result.data.responseData
            var tempUser = {}
            var tempName = ""
            if (rslUserInfo.nickname !=""){
              tempUser.nickname = rslUserInfo.nickname
            } else if (rslUserInfo.username != ""){
              tempUser.nickname = rslUserInfo.username
            }else{
              tempUser.nickname = rslUserInfo.phone
            }
            tempUser.phone = rslUserInfo.phone
            tempUser.qq = rslUserInfo.qq
            tempUser.weibo = rslUserInfo.weibo
            tempUser.email = rslUserInfo.email
            that.setData({
              userInfo: tempUser
            })
          }else{
            console.log('get userinfo error ' + result.data.code)
          }
      }
    })
  },
  bindGetUserInfo: function (e) {

    var that = this

    console.log(e.detail.userInfo)
    console.log(that.data.userInfo)

    wx.request({
      url: urlHeader + '/auth/user/modify/nickname?nickname=' + e.detail.userInfo.nickName,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        Authorization: wx.getStorageSync('JWT')
      },
      success(result) {
        if (result.data.code == 200) {
          console.log('change userinfo success ')
          
          var tempUser = {}
          tempUser.nickname = e.detail.userInfo.nickName;
          tempUser.avatarUrl = e.detail.userInfo.avatarUrl;
          tempUser.phone = that.data.userInfo.phone
          tempUser.qq = that.data.userInfo.qq
          tempUser.weibo = that.data.userInfo.weibo
          tempUser.email = that.data.userInfo.email

          that.setData({
            userInfo: tempUser
          })

          //缓存名字
          wx.setStorageSync('nickname', tempUser.nickname)
          //缓存头像地址
          wx.setStorageSync('avatarUrl', tempUser.avatarUrl)
        } else {
          console.log('change userinfo error ' + result.data.code)
        }
      }
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