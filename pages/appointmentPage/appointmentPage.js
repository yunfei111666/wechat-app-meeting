var dateTimePicker = require('../../utils/dateTimePicker.js');
const APP = getApp();
// 服务地址
var urlHeader = APP.globalData.urlHeader;
Page({
  data: {
    btnLoading: false,
    date: '2018-10-01',
    time: '12:00',
    dateTimeArray1: null,
    dateTime1: null,
    startYear: 2000,
    endYear: 2050,
    isPassWord: true, // 切换密码显示隐藏
    pwd_val: '', // 密码值
    type: '', //会议类型
    deviceNo:'',//设备号
    account: '',
    meetingID: '',
    password: '',
    title: '',
    time: ''
  },
  onLoad(options) {
    console.log(options)
    var that = this;
    that.setData({
      type: options.type,
      deviceNo: options.deviceNo,
      account: options.account
    })
    // 获取完整的年月日 时分秒，以及默认显示的数组
    var obj1 = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    // 精确到分的处理，将数组的秒去掉
    var lastArray = obj1.dateTimeArray.pop();
    var lastTime = obj1.dateTime.pop();
    this.setData({
      dateTimeArray1: obj1.dateTimeArray,
      dateTime1: obj1.dateTime,
    });
  },

  // 预约提交
  formSubmit: function(e) {
    var param = e.detail.value;
    this.mysubmit(param);
  },
  mysubmit: function(param) {
    console.log(param)
    var that = this;
    param.account = this.data.account;
    
    //获取视频ID-------------
    wx.request({
      url: urlHeader + '/meeting/api/v2/meeting/getid',
      method: 'POST',
      data: {
        'account': that.data.account,
        'password': '',
        'type': that.data.type,
        'title': that.data.title
      },
      header: {
        Authorization: wx.getStorageSync('JWT')
      }, // 设置请求的 header
      success: function(res) {
        console.log(res)
        if (res.data.code == '200') {
          param.meetingID = res.data.responseData.meetingID;
          // that.setData({
          //   meetingID: res.data.responseData.meetingID
          // })
          // 预约接口-----------------------------
          console.log(param)
          wx.request({
            url: urlHeader + '/meeting/api/v2/meeting/appointment',
            data: param,
            method: 'POST',
            header: { // 设置请求的 header
              Authorization: wx.getStorageSync('JWT')
            },
            success: function(res) {
              console.log(res);
              if (res.data.code == 200) {
                console.log(that.data.meetingID)
                console.log(param.password)
                wx.navigateTo({
                  url: "../appointmentNum/appointmentNum?meetingID=" + param.meetingID + '&password=' + param.password + '&title=' + param.title + '&time=' +param.time,
                })
              }
            },
            fail: function(e) {
              wx.showToast({
                title: '预约失败',
                icon: 'warn',
                duration: 2000
              });
              console.log(e)
            },
            complete: function() {
              // complete
            }
          })
          // 接口-----------------------------

        }
      },
      fail: function(e) {
        wx.showToast({
          title: '预约失败',
          icon: 'warn',
          duration: 2000
        });
      },
      complete: function() {
        // complete
      }
    })

  },
  // 错误提示
  isError: function(msg) {
    wx.showModal({
      title: '提示',
      showCancel: false,
      content: msg
    });
  },
  // 密码框失去焦点时
  bindblur: function(e) {
    this.setData({
      pwd_val: e.detail.value
    })
  },
  // 密码显示隐藏
  isShow: function() {
    this.setData({
      isPassWord: !this.data.isPassWord
    })
  },
  changeDate(e) {
    this.setData({
      date: e.detail.value
    });
  },
  changeTime(e) {
    this.setData({
      time: e.detail.value
    });
  },
  changeDateTime1(e) {
    this.setData({
      dateTime1: e.detail.value
    });
  },
  changeDateTimeColumn1(e) {
    var arr = this.data.dateTime1,
      dateArr = this.data.dateTimeArray1;

    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
    this.setData({
      dateTimeArray1: dateArr,
      dateTime1: arr
    });
  }
})