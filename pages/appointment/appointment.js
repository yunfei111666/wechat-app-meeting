// pages/appointmentPage/appointmentPage.js
const APP = getApp();
var urlHeader = APP.globalData.urlHeader;
var bletools = require('../../utils/bletools.js');
var constants = require('../../utils/constants.js');
var util = require('../../utils/util.js');
var onfire = require('../../utils/onfire.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    hasShowOrHide: true, //控制设备是否绑定，否，显示添加设备界面
    showView: true, //控制我的预约列表隐藏显示
    showViewCard: true, //控制卡片隐藏显示
    deviceName: '', //昵称
    username: '', //用户名32位
    deviceNo: '', //设备编号
    snNum: '', //设备数量
    deviceTime: '', //设备时间
    deviceTitle: '', //设备标题
    // account: '',
    meetingID: '',
    list: [], //后台返回数据
    countDownList: [], //倒计时数组
    actEndTimeList: [] //结束时间数组
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {

    //监听进入会议室
    onfire.on('meetingJoinSuccess', e => {
      var chararray = e.split("&")
      console.log('meetingJoinSuccess value ===' + e)
      wx.navigateTo({
        url: '../deviceMeeting/deviceMeeting?meetingID='+chararray[0]+'&RCID='+chararray[1],
      })
    })
    
  },
  timeFormat(param) { //小于10的格式化函数
    return param < 10 ? '0' + param : param;
  },
  countDown() { //倒计时函数
    // 获取当前时间，同时得到活动结束时间数组
    let newTime = new Date().getTime();
    let endTimeList = this.data.actEndTimeList;
    let countDownArr = [];
    // 对结束时间进行处理渲染到页面
    endTimeList.forEach(e => {
      let et = e.replace(/-/g, '/'); //解决IOS日期不显示问题，将时间转换下
      let endTime = new Date(et).getTime();
      let obj = null;
      // 如果活动未结束，对时间进行处理
      if (endTime - newTime > 0) {
        let time = (endTime - newTime) / 1000;
        // 获取天、时、分、秒
        let day = parseInt(time / (60 * 60 * 24));
        let hou = parseInt(time % (60 * 60 * 24) / 3600);
        let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
        let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
        obj = {
          day: this.timeFormat(day),
          hou: this.timeFormat(hou),
          min: this.timeFormat(min),
          sec: this.timeFormat(sec)
        }
      } else { //活动已结束，全部设置为'00'
        obj = {
          day: '00',
          hou: '00',
          min: '00',
          sec: '00'
        }
        // 会议倒计时活动结束刷新列表数据
        // this.onLoad();
      }
      countDownArr.push(obj);
    })
    // 渲染，然后每隔一秒执行一次倒计时函数
    this.setData({
      countDownList: countDownArr
    })
    setTimeout(this.countDown, 500);
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
        // 取消监听
    onfire.un("meetingJoinSuccess")

    wx.reLaunch({
      url: '../appointment/appointment'
    })
  },
  /**
   * 进入房间
   */
  inRoom: function() {

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
  
      // wx.vibrateLong({
      //   complete: (res) => {},
      //   success:(res)=>{
      //     console.log("震动成功")
      //   },
      //   fail:(res)=>{
      //     console.log("震动失败 res ==" + res)
      //   },
      // })

    var device = APP.globalData.devicesList
    // 设备未连接判断
    if (APP.globalData.connectState != constants.STATE_CONNECTED) {
      // 已经绑定过设备
      if (device.deviceNo != '') {
        wx.showToast({
          title: '设备重连',
          duration: 2000,
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

    // 无密码为FFFF
    var str = "0000&FFFF"
    // 写数据
    APP.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_MEETING_JOIN, str)
    // wx.navigateTo({
    //   url: '../deviceMeeting/deviceMeeting?meetingID=' + this.data.meetingID,
    // })
  },
  /**
   * 快速会议
   */
  rapidGo: function() {

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

    if (getApp().globalData.isMeeting){
      wx.showToast({
        title: '会议进行中',
        duration: 2000,
      })
      return
    }

    var device = getApp().globalData.devicesList
    // 设备连接判断
    if (APP.globalData.connectState != constants.STATE_CONNECTED) {
      // 判断是否有连接过的设备
      if (device.deviceNo == '') {
        wx.navigateTo({
          url: '../equiment/equiment',
        })
      } else {
        wx.showToast({
          title: '设备重连',
          duration: 2000,
        })
        bletools.connectBle(device)
      }
      return
    }

    // 写数据
    APP.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_MEETING_CREAT, "FFFF")


    
  },
  /**
   * 界面无数据，添加设备
   */
  addDevice: function() {
    if (!wx.getStorageSync('bind')) { //true为登录状态
      wx.navigateTo({
        url: '../index/login/login',
      })
    } else {
      wx.navigateTo({
        url: '../equiment/equiment',
      })
    }

  },
  /**
   * 设备列表入口
   */
  deviceChange: function() {
    wx.navigateTo({
      url: '../appointmentDeviceChange/appointmentDeviceChange'
    })
  },

  /**
   * 加入会议-圆圈
   */
  addGo: function() {
  
    if (getApp().globalData.isMeeting) {
      wx.showToast({
        title: '会议进行中',
        duration: 2000,
      })
      return
    }
    wx.navigateTo({
      url: '../appointmentAdd/appointmentAdd?deviceName=' + this.data.deviceName + '&username=' + this.data.username,
    })
  },
  /**
   * 预约会议
   */
  appointmentGo: function() {

    wx.navigateTo({
      url: '../appointmentPage/appointmentPage?type=' + 1 + '&deviceNo=' + this.data.deviceName + '&account=' + this.data.username
    })
  },
  titleCopy: function(res) {
    wx.setClipboardData({
      data: '会议号：' + '0910' + '\n会议主题：' + '会议宝小助手产品动员启动大会' + '\n会议时间：' + '9点30分开始',
      success: function(res) {

      }
    })
  },
  /**
   * 复制按钮
   */
  copy: function(res) {
    wx.setClipboardData({
      data: '会议号：' + res.target.id + '\n参会密码：' + res.currentTarget.dataset.password + '\n会议主题：' + res.currentTarget.dataset.title + '\n会议时间：' + res.currentTarget.dataset.time,
      success: function(res) {

      }
    })
  },

  /**
   * 用户点击分享触发事件
   */
  onShareAppMessage: function(res) {
    // 来自页面内转发按钮
    if (res.from === 'button') {
      return {
        title: '会议号：' + res.target.id + '\n参会密码：' + res.target.dataset.password + '\n会议主题：' + res.target.dataset.title + '\n会议时间：' + res.target.dataset.time,
        path: '/pages/appointmentList?id=' + 1410,
        imageUrl: "../../img/appointment/share.png", //不设置则默认为当前页面的截图
        success: (res) => {
          
        },
        fail: (res) => {
          
        }
      }
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    // -----------------------------------------------------------------业务注释

    console.log(APP.globalData.devicesList)
    var device = APP.globalData.devicesList
    if (device.deviceNo == ''){
      that.setData({
        hasShowOrHide: true //无数据设置界面为空
      })
    }else{
      that.setData({
        hasShowOrHide: false //无数据设置界面显示
      })
      that.setData({
        deviceName: APP.globalData.devicesList.deviceName,
        username: APP.globalData.devicesList.deviceUUID,
      });
      that.appointmentList();
      that.getCardData();
    }
  },

  /**
   * 获取卡片数据
   */
  getCardData: function() {
    let that = this;
    wx.request({
      url: urlHeader + '/meeting/api/v2/meeting/list',
      method: 'get',
      data: {
        'account': that.data.username,
        'meetingID': '',
      },
      header: {
        Authorization: wx.getStorageSync('JWT')
      }, // 设置请求的 header
      success: function(res) {
        console.log(res)
        if (res.data.code == '200') {
          if (res.data.responseData.length > 0) {
            // 设置会议中标识
            getApp().globalData.isMeeting = true
            that.setData({
              meetingID: res.data.responseData[0].meetingID,
              snNum: res.data.responseData[0].users.length,
              deviceTime: util.formatTime(res.data.responseData[0].create_at),
              deviceTitle: res.data.responseData[0].title
            });
            that.setData({
              showViewCard: false //有数据设置卡片显示
            })
          } else { //卡片无数据隐藏
            getApp().globalData.isMeeting = false
            console.log('没有正在进行中的会议')
            that.setData({
              showViewCard: true //无数据设置卡片隐藏
            })
          }
        }
      },
      fail: function() {
        
      },
      complete: function() {
        // complete
      }
    })
  },
  /**
   * 获取我的预约列表数据
   */
  appointmentList: function() {
    let that = this;
    // 会议列表接口-----
    wx.request({
      url: urlHeader + '/meeting/api/v2/meeting/appointment',
      method: 'get',
      data: {
        'account': that.data.username,
        'meetingID': '',
        'title': '',
      },
      header: {
        Authorization: wx.getStorageSync('JWT')
      }, // 设置请求的 header
      success: function(res) {
        console.log(res);
        if (res.data.code == '200') {
          if (res.data.responseData.length > 0) {
            that.setData({
              list: res.data.responseData
            });
            that.setData({
              showView: false //有数据设置列表显示
            })
            // 设置倒计时逻辑----start
            let endTimeList = [];
            // 将活动的结束时间参数提成一个单独的数组，方便操作
            that.data.list.forEach(e => {
              endTimeList.push(e.time)
            })
            that.setData({
              actEndTimeList: endTimeList
            });
            // 执行倒计时函数
            that.countDown();
            // 设置倒计时逻辑----end
          } else {
            console.log(res.data.responseData)
            that.setData({
              showView: true
            })
          }

        }
      },
      fail: function() {
        
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
})