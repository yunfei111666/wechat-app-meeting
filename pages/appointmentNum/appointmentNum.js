// pages/appointmentNum/appointmentNum.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    meetingID: '',
    password: '',
    title: '',
    time: '',
    isActive: '0',
    countDownTime: '',//倒计时
    actEndTimeTime: ''//结束时间
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var that = this;
    that.setData({
      meetingID: options.meetingID,
      password: options.password,
      title: options.title,
      time: options.time
    })
    // 设置倒计时逻辑----start
    that.setData({ actEndTimeTime: options.time });
    // 执行倒计时函数
    that.countDown();
    // 设置倒计时逻辑----end
  },
  timeFormat(param) {//小于10的格式化函数
    return param < 10 ? '0' + param : param;
  },
  countDown() {//倒计时函数
    // 获取当前时间，同时得到活动结束时间数组
    let newTime = new Date().getTime();
    let endTimeList = this.data.actEndTimeTime;
    let et = endTimeList.replace(/-/g, '/');//解决IOS日期不显示问题，将时间转换下
    // 对结束时间进行处理渲染到页面
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
    } else {//活动已结束，全部设置为'00'
      obj = {
        day: '00',
        hou: '00',
        min: '00',
        sec: '00'
      }
      // 会议倒计时活动结束刷新列表数据
      this.onLoad();
    }
    // 渲染，然后每隔一秒执行一次倒计时函数
    this.setData({ countDownTime: obj })
    setTimeout(this.countDown, 500);
  },
  copy: function () {
    var that = this;
    that.setData({
      isActive: '0'
    });
    wx.setClipboardData({
      data: '会议号：' + that.data.meetingID + '\n参会密码：' + that.data.password + '\n会议主题：' + that.data.title + '\n会议时间：' + that.data.time,
      success: function (res) {
        // wx.showModal({
        //   title: '提示',
        //   content: '复制成功',
        //   showCancel: false
        // });
      }
    })
  },
  share: function () {
    var that = this;
    that.setData({
      isActive: '1'
    });
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