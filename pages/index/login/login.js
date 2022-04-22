// pages/index/login/login.js
//获取应用实例
const APP = getApp();
var urlHeader = APP.globalData.urlHeader;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    blueBtnColor:true,
    phoneNum: '',
    smsCode: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    // if (app.globalData.userInfo) {
    //   console.log('app.globalData.userInfo')
    //   this.setData({
    //     userInfo: app.globalData.userInfo,
    //     hasUserInfo: true
    //   })
    // } else if (this.data.canIUse) {
    //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //   // 所以此处加入 callback 以防止这种情况
    //   app.userInfoReadyCallback = res => {
    //     console.log('app.userInfoReadyCallback')
    //     this.setData({
    //       userInfo: res.userInfo,
    //       hasUserInfo: true
    //     })
    //   }
    // } else {
    //   // 在没有 open-type=getUserInfo 版本的兼容处理
    //   wx.getUserInfo({
    //     success: res => {
    //       console.log('wx.getUserInf' + e)
    //       app.globalData.userInfo = res.userInfo
    //       this.setData({
    //         userInfo: res.userInfo,
    //         hasUserInfo: true
    //       })
    //     }
    //   })
    // }
  },
  getUserInfo: function (e) {
    console.log('getUserInfo' + e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // 微信号登陆
  getPhoneNumber(e) {
    this.setData({
      blueBtnColor:!this.data.blueBtnColor
    })
    console.log('获取手机号返回值e.detail.errMsg：' + e.detail.errMsg)
    console.log('获取手机号返回值e.detail.iv：' + e.detail.iv)
    console.log('获取手机号返回值e.detail.encryptedData：' + e.detail.encryptedData)

    if (e.detail.errMsg != 'getPhoneNumber:ok'){
      wx.showToast({
        title: '授权失败',
        icon: 'none',
        duration: 2000
      })
      return
    }

    const res = wx.getSystemInfoSync()
    console.log('encryptedData==' + e.detail.encryptedData)
    console.log('iv==' + e.detail.iv)
    console.log('nickname==')
    console.log('imei==')
    console.log('manufacturerAndModel==' + res.brand)
    
    var networktype = ''
    wx.getNetworkType({
      success: function (res) {
        console.log('network===' + res.networkType)
        networktype = res.networkType
      },
    })

    console.log('osVersion==' + res.model + res.system)
    console.log('appVersion==' + APP.globalData.appVersion)
    console.log('appType==7')

    //微信手机号登陆
    wx.request({
      url: urlHeader + '/auth/wechat/send/phone/',
      method: 'POST',
      data: {
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
        nickname: '',
        imei: '',
        manufacturerAndModel: res.brand,
        network: networktype,
        osVersion: res.model + res.system,
        appVersion: APP.globalData.appVersion,
        appType: '7'
      },
      header: {
        'content-type': 'application/json;charset=utf-8',
        Authorization: wx.getStorageSync('JWT')
      },
      success(rslt) {
        console.log('解密手机号接口 rslt === ' + rslt.data);
        if (rslt.data.code == '200') {
          //存储登陆数据
          wx.setStorageSync('JWT', rslt.data.responseData.token)
          wx.setStorageSync('bind', rslt.data.responseData.bind)
          wx.setStorageSync('nickname', rslt.data.responseData.nickname)
          wx.setStorageSync('username', rslt.data.responseData.username)
          console.log('get/number+++ 微信登陆成功 +++ JWT = ' + rslt.data.responseData.token + '++++bind == ' + rslt.data.responseData.bind + '++++nickname == ' + rslt.data.responseData.nickname)
          wx.showToast({
            title: '登陆成功',
            icon: 'none',
            duration: 2000
          })
          //返回
          wx.navigateBack({
            delta: 1
          })
        } else {
          wx.showToast({
            title: '登陆失败',
            icon: 'none',
            duration: 2000
          })
          console.log('get/number+++ 微信登陆失败 ' + rslt.data.code)
        }
      }
    })

  },

  //手机号登陆
  naviToPhoneLogin(){
    this.setData({
      blueBtnColor:!this.data.blueBtnColor
    })
    wx.navigateTo({
      url: 'phoneNumLogin',
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