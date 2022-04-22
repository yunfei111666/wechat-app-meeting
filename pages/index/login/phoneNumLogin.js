// pages/index/login/phoneNumLogin.js
//获取应用实例
const APP = getApp();
var urlHeader = APP.globalData.urlHeader;
var base64 = require('../../../utils/Base64.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sendTime: '发送验证码',
    sendColor: '#ffffff',
    snsMsgWait: 60
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // var str = "a"

    // console.log(base64.strToArrayBuffer(str))
    // console.log(base64.arrayBufferToStr(base64.strToArrayBuffer(str)))

    // console.log(base64.encode(str))
    // console.log(base64.decode(base64.encode(str)))
    // console.log(wx.base64ToArrayBuffer(base64.encode(str)))
   

  },

  //获取验证码
  getSmsCodeBtnClick: function () {
    console.log('JWT code =======' + wx.getStorageSync('JWT'))

    console.log('getSmsCode phoneNum =======' + this.data.phoneNum)

    var that = this;

    //验证手机号
    var phone = this.data.phoneNum
    // var phone = '19919891424'
    if(phone == undefined || phone == ''){
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 2000
      })
    }else if (phone.length != 11) {
      wx.showToast({
        title: '手机号位数不正确',
        icon: 'none',
        duration: 2000
      })
    } else {
      // 60s倒计时
      that.sendCode()
      // var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
      var myreg = /^1(3|4|5|6|7|8|9)\d{9}$/
      if (myreg.test(phone)) {
        
        wx.request({
          url: urlHeader + '/auth/wechat/send/code?phone=' + this.data.phoneNum,
          method: 'POST',
          header: {
            Authorization: wx.getStorageSync('JWT')
          },
          success(res) {
            console.log(res)
            if (res.data.code == '200') {
              wx.showToast({
                title: '已发送验证码',
                icon: 'none',
                duration: 2000
              })
              console.log('getSmsCode +++ 已发送验证码 ')
            } else if (res.data.code == '30006') {
              wx.showToast({
                title: '手机号已绑定',
                icon: 'none',
                duration: 2000
              })
              console.log('getSmsCode +++ 手机号已绑定 ')
            } else {
              wx.showToast({
                title: '获取验证码失败',
                duration: 2000,
              })
            }
          },
          fail(error) {
            console.log('getSmsCode +++ ' + error)
          }
        })
      } else {
        wx.showToast({
          title: '手机号格式错误',
          icon: 'none',
          duration: 2000
        })
      }
    }
  },

  //验证码校验
  verificationCodeBtnClick: function () {

    var that = this
    const res = wx.getSystemInfoSync()
    console.log('phone==' + that.data.phoneNum)
    console.log('code==' + that.data.smsCode)
    console.log('nickname==')
    console.log('imei==')
    console.log('manufacturerAndModel==' + res.brand)

    var networktype = ''
    wx.getNetworkType({
      success: function (res) {
        console.log('当前网络===' + res.networkType)
        networktype = res.networkType
      },
    })

    console.log('osVersion==' + res.model + res.system)
    console.log('appVersion==' + APP.globalData.appVersion)
    console.log('appType==7')
   
    wx.request({
      url: urlHeader + '/auth/wechat/verification/code',
      data:{
        phone:that.data.phoneNum,
        code:that.data.smsCode,
        nickname:'',
        imei:'',
        manufacturerAndModel: res.brand,
        network:networktype,
        osVersion:res.model+res.system,
        appVersion:APP.globalData.appVersion,
        appType:'7'
      },
      method: 'POST',
      header: {
        Authorization: wx.getStorageSync('JWT')
      },
      success(res) {
        if (res.data.code == '200') {
          console.log('verificationCode+++ 绑定手机号成功 +++ JWT = ' + res.data.responseData.token + '++++username == ' + res.data.responseData.username);
          //存储登陆数据
          wx.setStorageSync('JWT', res.data.responseData.token)
          wx.setStorageSync('bind', res.data.responseData.bind)
          wx.setStorageSync('nickname', res.data.responseData.nickname)
          wx.setStorageSync('username', res.data.responseData.username)
          wx.showToast({
            title: '登陆成功',
            icon: 'none',
            duration: 2000
          })
          //返回
          wx.navigateBack({
            delta: 2
          })
        } else if (res.data.code == '30005') {
          wx.showToast({
            title: '验证码不正确',
            icon: 'none',
            duration: 2000
          })
          console.log('verificationCode+++ 验证码不正确')
        } else{
          wx.showToast({
            title: '服务错误',
            icon: 'none',
            duration: 2000
          })
          console.log('verificationCode+++ 服务错误 ' + res.data.code)
        }  
      },
      fail(error) {
        console.log('verificationCode+++' + error)
      }
    })
  },
  getPhoneNum: function (num) {
    this.data.phoneNum = num.detail.value
  },
  getSmsCode: function (code) {
    this.data.smsCode = code.detail.value
  },

  // 获取验证码
  sendCode: function () {
    // 60秒后重新获取验证码
    var inter = setInterval(function () {
      this.setData({
        smsFlag: true,
        sendColor: '#cccccc',
        sendTime: this.data.snsMsgWait + 's后重发',
        snsMsgWait: this.data.snsMsgWait - 1
      });
      if (this.data.snsMsgWait < 0) {
        clearInterval(inter)
        this.setData({
          sendColor: '#ffffff',
          sendTime: '发送验证码',
          snsMsgWait: 60,
          smsFlag: false
        });
      }
    }.bind(this), 1000);
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