var util = require('../../utils/util.js')
var app = getApp();
var urlHeader = app.globalData.urlHeader
var bletools = require('../../utils/bletools.js');
var constants = require('../../utils/constants.js');
const onfire = require('../../utils/onfire.js')
var mqtt = require('../../utils/mqtt.min.2.18.8.js')

Page({
  data: {
    per_checked: false, //更多设置-人员列表-默认不选中
    whi_checked: false, //更多设置-白板-默认不选中
    room_checked:false, //更多设置-聊天室-默认不选中
    auto_checked:false, //更多设置-自动切屏-默认不选中
    blueShow: true,
    personBtnShow: true,
    items: [{
        name: 'USA',
        value: '单屏'
      },
      {
        name: 'CHN',
        value: '画中画',
        checked: 'true'
      },
      {
        name: 'BRA',
        value: '双屏'
      }
    ],
    hideModal: true, //模态框的状态  true-隐藏  false-显示
    animationData: {}, //
    volvalue:0,//当前音量
    num: 0,
    speak_off: true,
    pickup_off: true,
    frame_off: true,
    userlist_off: true,
    allmute_off: true,
    writeboard_off: true,
    charroom_off: true,
    autocut_off:true,
    screenmode_off:true,
    starY: "",
    endY: "",

    setp: 0, //  45 0.25
    rotateStatY: "",
    rotateEndY: "",
    zhuping: false,
    tiren: false,
    huatong: false,
    // deviceName:'', //设备名称
    // deviceId:'',//设备id（32位）

    client: '', //MQTT
    //参会人员列表
    userlist:[
      //{username:"zhnag",manager:"p01"},{username:"zhnaf",manager:"p02"}
    ], 
    terminalNum: 0, //终端数量
    create_at: '', //会议创建时间
    realTimeObj: {
      hou: '00',
      min: '00',
      sec: '00'
    }, //会议实时计时
    meetingTitle:'无标题会议',//会议标题
    RCID:'',//设备会议ID
  
    manager:'0',//返回的主持人id
    currID:"",
  },
  onLoad: function (options) {
    console.log(options);
    this.setData({RCID:options.RCID}) //设备会议ID
    this.setData({meetingID: options.meetingID,})
    // 初始化MQTT
    this.initMQTTData(options.meetingID)
  
  
    // 获取设备在会议中的设置
    this.readDeviceSetting()
    // 初始化会议数据
    this.initMeetingData()
    // 初始化监听数据
    this.initOnfireData()
 
   
    
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.drawbg();
    this.drawps(0)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("页面显示")
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("页面隐藏");
    this.client.end();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("离开页面")
    // 取消事件绑定
    onfire.un("devVolChange")
    onfire.un("devMicChange")
    onfire.un("devCamearChange")
    onfire.un("meetingUserListChange")
    onfire.un("meetingAllMuteChange")
    onfire.un("meetingWBChange")
    onfire.un("meetingCharChange")
    onfire.un("meetingAutoCutChange")
    onfire.un("meetingDidHangup")
    onfire.un("meetingSereenModeCutChange")
    //关闭MQTT连接 
    this.client.end()
  },

  // 初始化MQTT
  initMQTTData: function (meetingID) {
    // console.log("MQTT-----start");
    // MQTT 测试'wxs://ivml.nsitd.com:8584/mqtt'  生产'wxs://m.nsitd.com:8584/mqtt'
    this.client = mqtt.connect('wxs://m.nsitd.com:8584/mqtt', {
      clientId: "clientUserId" + (Math.random() * 1000000).toString(),
      username: "admin",
      password: "7dXxXGjwq$IbYNL9"
    })
    var that = this
    // console.log("MQTT-----");
    this.client.on('connect', function () {
      console.log('连接服务器成功')
      //订阅主题，替换productKey和deviceNaoketme(这里的主题可能会不一样，具体请查看后台设备Topic列表或使用自定义主题)
      var url = 'hyb/meeting/' + meetingID
      that.client.subscribe(url, function (err) {
        if (!err) {
          console.log('订阅成功');
        }
      })
    })
    //接收消息监听
    this.client.on('message', function (topic, message) {
        var arr=message.toString().split(';');
      //  console.log(arr)//["502;4728;67a94296374a407a9cdce02bea83abc3;pe263;张凯"]
        if(arr[0]=="502"){ //加入
          console.log("有人来了")
          let obj={
            account: arr[2],
            meetingAccount:arr[3],
            username: arr[4]
          };
           that.data.userlist.push(obj);
           that.setData({userlist:that.data.userlist})
        }
        if(arr[0]=="503"){
          console.log("有人退了");
          var deluser= that.data.userlist.filter(function(x){
              if (x.meetingAccount!=arr[3]){             
                return true
              }
            })
            that.setData({userlist:deluser})
        }
    })
  },

  // 初始化监听数据
  initOnfireData: function () {

    // 监听音量
    onfire.on('devVolChange', e => {
      console.log('devVolChange ===' + e)
      this.setData({
        volvalue: parseInt(e)
      })
    })

    // 监听麦克风开关
    onfire.on('devMicChange', e => {
      console.log('devMicChange ===' + e)
      if (e == "0") {
        this.setData({
          speak_off: false
        })
      } else {
        this.setData({
          speak_off: true
        });
      }
    })

    // 监听摄像头开关
    onfire.on('devCamearChange', e => {
      console.log('devCamearChange ===' + e)
      if (e == "0") {
        this.setData({
          pickup_off: false
        })
      } else {
        this.setData({
          pickup_off: true
        })
      }
    })

    // 监听成员列表
    onfire.on('meetingUserListChange', e => {
      console.log('meetingUserListChange ===' + e)
      if (e == "0") {
        this.setData({
          userlist_off: false
        })
      } else {
        this.setData({
          userlist_off: true
        })
      }
    })

    // // 监听全员静音
    // onfire.on('meetingAllMuteChange', e => {
    //   console.log('meetingAllMuteChange ===' + e)
    //   if (e == "0") {
    //     this.setData({
    //       allmute_off: false
    //     })
    //   } else {
    //     this.setData({
    //       allmute_off: true
    //     })
    //   }
    // })

    // 监听白板
    onfire.on('meetingWBChange', e => {
      console.log('meetingWBChange ===' + e)
      if (e == "0") {
        this.setData({
          writeboard_off: false
        })
      } else {
        this.setData({
          writeboard_off: true
        })
      }
    })

    // 监听聊天室
    onfire.on('meetingCharChange', e => {
      console.log('meetingCharChange ===' + e)
      if (e == "0") {
        this.setData({
          charroom_off: false
        })
      } else {
        this.setData({
          charroom_off: true
        })
      }
    })

    // 监听自动切屏
    onfire.on('meetingAutoCutChange', e => {
      console.log('meetingAutoCutChange ===' + e)
      if (e == "0") {
        this.setData({
          charroom_off: false
        })
      } else {
        this.setData({
          charroom_off: true
        })
      }
    })

    // 监听大屏模式
    onfire.on('meetingSereenModeCutChange', e => {
      console.log('meetingSereenModeCutChange ===' + e)
      if (e == "0") {
        this.setData({
          screenmode_off: false
        })
      } else {
        this.setData({
          screenmode_off: true
        })
      }
    })


    // 监控挂断
    onfire.on('meetingDidHangup', e => {
      wx.showToast({
        title: '会议已结束',
        duration: 2000
      })
      wx.navigateBack({
        delta: 1
      })
    })
  },

  /**
   * 读数据 
   */
  readDeviceSetting: function () {

    var device = app.globalData.devicesList
    console.log('开始读数据了 ===' + device.deviceId)
    // 音量
    app.readDataFormBLE(device.deviceId, constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_VOL)
    // 话筒
    app.readDataFormBLE(device.deviceId, constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_MIC)
    // 摄像头
    app.readDataFormBLE(device.deviceId, constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_CAMEAR)
    // 画中画
    app.readDataFormBLE(device.deviceId, constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_PIP)
    // 主屏

    // 会议成员列表
    app.readDataFormBLE(device.deviceId, constants.SER_UUID_VIDEO, constants.CHAR_UUID_MEETING_USERLIST)
    // // 全员静音
    // app.readDataFormBLE(device.deviceId, constants.SER_UUID_VIDEO, constants.CHAR_UUID_MEETING_ALLMUTE)
    // 白板
    app.readDataFormBLE(device.deviceId, constants.SER_UUID_VIDEO, constants.CHAR_UUID_MEETING_WHITEBOARD)
    // 聊天室
    app.readDataFormBLE(device.deviceId, constants.SER_UUID_VIDEO, constants.CHAR_UUID_MEETING_CHARROOM)
    // 
    app.readDataFormBLE(device.deviceId, constants.SER_UUID_DEVICE, constants.CHAR_UUID_DEVICE_NAME)
  },

  //话筒开关
  speak: function () {
    var device = app.globalData.devicesList
    // 设备未连接判断
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      // 已经绑定过设备
      if (device.deviceNo != '') {
        wx.showToast({
          title: '设备重连',
          duration: 2000
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
    var str = "0"
    if (this.data.speak_off) { //默认打开  点击就打关闭
      this.setData({
        speak_off: false
      })
      str = "0"
    } else {
      this.setData({
        speak_off: true
      });
      str = "1"
    }
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_MIC, str)
  },
  pickup: function () {
    var device = app.globalData.devicesList
    // 设备未连接判断
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      // 已经绑定过设备
      if (device.deviceNo != '') {
        wx.showToast({
          title: '设备重连',
          duration: 2000
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
    var str = "0"
    if (this.data.pickup_off) { //默认关 就打开
      this.setData({
        pickup_off: false
      });
      str = "0"
    } else {
      this.setData({
        pickup_off: true
      })
      str = "1"
    }
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_CAMEAR, str)
  },
  frame: function () {
    var device = app.globalData.devicesList
    // 设备未连接判断
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      // 已经绑定过设备
      if (device.deviceNo != '') {
        wx.showToast({
          title: '设备重连',
          duration: 2000
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
    if (this.data.frame_off) { //默认关 就打开
      this.setData({
        frame_off: false
      })
      app.globalData.frame_off = "0";
      str = "0"
    } else {
      this.setData({
        frame_off: true
      })
      app.globalData.frame_off = "1";
      str = "1"
    }

    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_PIP, str)
  },
  jump: function () {
    wx.navigateTo({
      url: '../devicerecord/devicerecord',
    })
  },
  drawbg: function () {
    var ctx = wx.createCanvasContext('canvasbg');
    ctx.setLineWidth(0); // 设置圆环的宽度
    ctx.setStrokeStyle('#F6F6F6'); // 设置圆环的颜色
    ctx.setLineCap('round') // 设置圆环端点的形状
    ctx.beginPath(); //开始一个新的路径
    ctx.arc(82.5, 82.5, 70, 0, 2 * Math.PI, false);
    ctx.stroke(); //对当前路径进行描边
    ctx.draw();
  },
  drawps: function (step) {
    if (step > 2 || step < 0) {
      console.log(step + "越界")
    } else {
      var context = wx.createCanvasContext('canvasps');
      context.setLineWidth(20);
      context.setStrokeStyle('#409EFF'); // 设置圆环的颜色
      context.setLineCap('round');
      context.beginPath();
      context.arc(82.5, 82.5, 70, -Math.PI / 2, step * Math.PI - Math.PI / 2, false);
      context.stroke();
      context.draw()
    }

  },


  touchStart: function (e) {
    let starY = e.touches[0].pageY ////最下200 最上100
    console.log(starY)
    this.setData({
      starY: starY
    })
    let num = 200 - starY;
    console.log(num);
    this.setData({
      num: num
    })
  },
  touchMove: function (e) {
    let endY = e.touches[0].pageY; //最下200 201  
    console.log(endY);
    this.setData({
      endY: endY
    })
  },
  touchEnd: function (e) {
    let res = this.data.starY - this.data.endY;
    console.log(res);
    if (this.data.endY == 0) {
      return false;
    }
    if (res > 0) { //加
      this.setData({
        num: this.data.num + res
      })
      console.log(this.data.num)
    } else if (res < 0) {
      this.setData({
        num: this.data.num + res
      })
      console.log(this.data.num)
    } else {
      console.log("0")
    }
  },
  //点击旋转
  rotate: function () {
    // let setp = this.data.setp+=0.25;
    // this.setData({ setp: setp});
    //  this.drawps(setp); 
    // console.log("点击")
  },
  rotateStart: function (e) {
    let starY = e.touches[0].pageY;

    this.setData({
      rotateStatY: starY
    })
  },
  rotateMove: function (e) {
    let starY = e.touches[0].pageY;

    this.setData({
      rotateEndY: starY
    });

  },
  rotateEnd: function (e) {
    let res = this.data.rotateStatY - this.data.rotateEndY
    if (res > 0) {
      console.log("上");
      let setp = this.data.setp += 0.25;
      console.log(setp)
      if (setp > 2) {
        console.log("停");
        this.setData({
          setp: 2
        });
        return false;
      } else {
        this.setData({
          setp: setp
        });
        this.drawps(this.data.setp);
      }
    } else {
      console.log("下");
      let setp = this.data.setp -= 0.25;
      if (setp < 0) {
        console.log("停");
        this.setData({
          setp: 0
        });
      } else {
        this.setData({
          setp: setp
        });
        this.drawps(this.data.setp);
      }
    }
  },

  // 初始化会议数据
  initMeetingData: function () {
    let that = this;
    wx.request({
      url: urlHeader + '/meeting/api/v2/meeting/list',
      method: 'get',
      data: {
        'meetingID': that.data.meetingID,
        'account': app.globalData.devicesList.deviceUUID
      },
      header: {
        Authorization: wx.getStorageSync('JWT')
      },
      success: function (res) {
        if (res.data.code == '200' && res.data.responseData.length != 0) {
          that.data.userlist = res.data.responseData[0].users
          that.setData({
            userlist: res.data.responseData[0].users
          }) //设置界面人员列表
          that.setData({
            terminalNum: res.data.responseData[0].users.length
          }) //设置终端数量
          that.setData({
            create_at: res.data.responseData[0].create_at
          }); //获取会议创建时间
          if (res.data.responseData[0].title != ""){
            that.data.meetingTitle = res.data.responseData[0].title
          }
          that.setData({
            meetingTitle: that.data.meetingTitle
          })
          that.realTimeFn(); //设置实时时间
          
     
          //获取主持人id
          that.setData({manager:res.data.responseData[0].manager})

        } else {
          console.log("没数据")
        }
      },
      fail: function (e) {
       
      },
    })
  },
  realTimeFn: function () {
    let that = this;
    let newTime = new Date().getTime();
    let endTime = this.data.create_at;
    if (newTime - endTime > 0) {
      let time = (newTime - endTime) / 1000;
      // 获取天、时、分、秒
      // let day = parseInt(time / (60 * 60 * 24));
      let hou = parseInt(time % (60 * 60 * 24) / 3600);
      let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
      let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
      var obj = {
        // day: timeFormat(day),
        hou: that.timeFormat(hou),
        min: that.timeFormat(min),
        sec: that.timeFormat(sec)
      }
    }
    // 渲染，然后每隔一秒执行一次倒计时函数
    this.setData({
      realTimeObj: obj
    })
    setTimeout(this.realTimeFn, 500);

  },
  timeFormat(param) { //小于10的格式化函数
    return param < 10 ? '0' + param : param;
  },
  //主屏
  Main_screen: function () {
    if (this.data.zhuping) {
      this.setData({
        zhuping: false
      })
    } else {
      this.setData({
        zhuping: true
      })
    }
  },
  //踢人
  Kick_people: function () {
    if (this.data.tiren) {
      this.setData({
        zhuping: false
      })
    } else {
      this.setData({
        tiren: true
      })
    }
  },
  //话筒静音
  Mic: function () {
    if (this.data.huatong) {
      this.setData({
        huatong: false
      })
    } else {
      this.setData({
        huatong: true
      })
    }
  },
  // 挂断
  hangUp: function (e) {

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

    var device = getApp().globalData.devicesList
    // 设备连接判断
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      // 判断是否有连接过的设备
      if (device.deviceNo == '') {
       
        wx.navigateTo({
          url: '../equiment/equiment',
        })
      } else {
        wx.showToast({
          title: '设备重连',
          duration: 2000
        })
        bletools.connectBle(device)
      }
      return
    }

    // console.log("manager === "+this.data.manager + " RCID === " + this.data.RCID)


    // 写数据
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_MEETING_HANGUP, "0")
  },
  // 
  personList: function () {
    this.setData({per_checked: !this.data.per_checked}) //设置人员列表按钮选择是与否
    var device = app.globalData.devicesList
    // 设备未连接判断
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      // 已经绑定过设备
      if (device.deviceNo != '') {
        wx.showToast({
          title: '设备重连',
          duration: 2000
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
    var str = "0"
    if (this.data.userlist_off) { //默认打开  点击就打关闭
      this.setData({
        userlist_off: false
      })
      str = "0"
    } else {
      this.setData({
        userlist_off: true
      });
      str = "1"
    }
    // 写数据
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_MEETING_USERLIST, str)
  },
  allMute: function () {
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

    var device = app.globalData.devicesList
    // 设备未连接判断
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      // 已经绑定过设备
      if (device.deviceNo != '') {
        wx.showToast({
          title: '设备重连',
          duration: 2000
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
    // var str = "0"
    // if (this.data.allmute_off) { //默认打开  点击就打关闭
    //   this.setData({
    //     allmute_off: false
    //   })
    //   str = "0"
    // } else {
    //   this.setData({
    //     allmute_off: true
    //   });
    //   str = "1"
    // }
    // 写数据
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_MEETING_ALLMUTE, "0")
  },
  /**
   * 解除全员静音
   */
  allUnmute: function () {
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

    this.setData({
      blueShow: true
    })
    var device = app.globalData.devicesList
    // 设备未连接判断
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      // 已经绑定过设备
      if (device.deviceNo != '') {
        wx.showToast({
          title: '设备重连',
          duration: 2000
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
    // 写数据
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_MEETING_ALLMUTE, "1")
    
  },
  whiteBoard: function () {
    this.setData({whi_checked: !this.data.whi_checked}) //设置白板按钮选择是与否
    var device = app.globalData.devicesList
    // 设备未连接判断
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      // 已经绑定过设备
      if (device.deviceNo != '') {
        wx.showToast({
          title: '设备重连',
          duration: 2000
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
    var str = "0"
    if (this.data.writeboard_off) { //默认打开  点击就打关闭
      this.setData({
        writeboard_off: false
      })
      str = "0"
    } else {
      this.setData({
        writeboard_off: true
      });
      str = "1"
    }
    // 写数据
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_MEETING_WHITEBOARD, str)
  },
  /**
   * 聊天室
   */
  chatRoom:function(){
    var device = app.globalData.devicesList
    // 设备未连接判断
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      // 已经绑定过设备
      if (device.deviceNo != '') {
        wx.showToast({
          title: '设备重连',
          duration: 2000
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
    var str = "0"
    if (this.data.charroom_off) { //默认打开  点击就打关闭
      this.setData({
        charroom_off: false
      })
      str = "0"
    } else {
      this.setData({
        charroom_off: true
      });
      str = "1"
    }
    // 写数据
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_MEETING_CHARROOM, str)

  },
    /**
   * 自动切屏
   */
  autoScreen:function(){
    var device = app.globalData.devicesList
    // 设备未连接判断
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      // 已经绑定过设备
      if (device.deviceNo != '') {
        wx.showToast({
          title: '设备重连',
          duration: 2000
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
    var str = "0"
    if (this.data.autocut_off) { //默认打开  点击就打关闭
      this.setData({
        autocut_off: false
      })
      str = "0"
    } else {
      this.setData({
        autocut_off: true
      });
      str = "1"
    }
    // 写数据
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_MEETING_AUTOCUT, str)

  },
   /**
   * 显示聊天室
   */
  charRoom: function () {
    var device = app.globalData.devicesList
    // 设备未连接判断
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      // 已经绑定过设备
      if (device.deviceNo != '') {
        wx.showToast({
          title: '设备重连',
          duration: 2000
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
    var str = "0"
    if (this.data.charroom_off) { //默认打开  点击就打关闭
      this.setData({
        charroom_off: false
      })
      str = "0"
    } else {
      this.setData({
        charroom_off: true
      });
      str = "1"
    }
    // 写数据
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_MEETING_CHARROOM, str)
  },
   /**
   * 大屏模式
   */
  ScreenMode:function(obj){
    var device = app.globalData.devicesList
    // 设备未连接判断
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      // 已经绑定过设备
      if (device.deviceNo != '') {
        wx.showToast({
          title: '设备重连',
          duration: 2000
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
    var str = "0"
    if (this.data.screenmode_off) { //默认打开  点击就打关闭
      this.setData({
        screenmode_off: false
      })
      str = "0"
    } else {
      this.setData({
        screenmode_off: true
      });
      str = "1"
    }
    // 写数据
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_MEETING_SCREENMODE, str)
  },
   /**
   * 切换主屏
   */
  changeHomeScreen: function (obj){
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
    var device = app.globalData.devicesList
    //设备未连接判断
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      // 已经绑定过设备
      if (device.deviceNo != '') {
        wx.showToast({
          title: '设备重连',
          duration: 2000
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
    var str = obj.currentTarget.dataset.data.meetingAccount
    this.setData({currID:str})
    // 写数据
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_MEETING_CHANGESCREEN, str)
  },
  /**
   * 踢人
   */
  changeKicking: function (obj){
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
    var device = app.globalData.devicesList
    //设备未连接判断
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      // 已经绑定过设备
      if (device.deviceNo != '') {
        wx.showToast({
          title: '设备重连',
          duration: 2000
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
    console.log('踢人 +++++' + obj.currentTarget.dataset.data)
    var str = obj.currentTarget.dataset.data.meetingAccount
  
    this.setData({currID:str})
    // 写数据
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_MEETING_KICK, str)
  },
  /**
   * 单人静音
   */
  changeSingleMute: function (obj){
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
    var device = app.globalData.devicesList
    //设备未连接判断
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      // 已经绑定过设备
      if (device.deviceNo != '') {
        wx.showToast({
          title: '设备重连',
          duration: 2000
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
    console.log('单人静音 +++++' + obj.currentTarget.dataset.data)
    var str = obj.currentTarget.dataset.data.meetingAccount
  
    this.setData({currID:str})
    // 写数据
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_MEETING_SINGLEMUTE, str)
  },
  
  //声音
  changevol: function (event) {
    var device = app.globalData.devicesList
    // 设备未连接判断
    if (app.globalData.connectState != constants.STATE_CONNECTED) {
      // 已经绑定过设备
      if (device.deviceNo != '') {
        wx.showToast({
          title: '设备重连',
          duration: 2000
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
    var vol = String(event.detail.value)
    //传给设备
    console.log('音量大小 ====' + vol)
    //写数据
    app.writeToDevice(constants.SER_UUID_VIDEO, constants.CHAR_UUID_VIDEO_VOL, vol)
  },
  // 显示遮罩层
  showModal: function () {
    var that = this;
    that.setData({
      hideModal: false
    })
    var animation = wx.createAnimation({
      duration: 600, //动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
      timingFunction: 'ease', //动画的效果 默认值是linear
    })
    this.animation = animation
    setTimeout(function () {
      that.fadeIn(); //调用显示动画
    }, 200)
  },

  // 隐藏遮罩层
  hideModal: function () {
    var that = this;
    var animation = wx.createAnimation({
      duration: 200, //动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
      timingFunction: 'ease', //动画的效果 默认值是linear
    })
    this.animation = animation
    that.fadeDown(); //调用隐藏动画   
    setTimeout(function () {
      that.setData({
        hideModal: true
      })
    }, 16) //先执行下滑动画，再隐藏模块
  },

  //动画集
  fadeIn: function () {
    this.animation.translateY(0).step()
    this.setData({
      animationData: this.animation.export() //动画实例的export方法导出动画数据传递给组件的animation属性
    })
  },
  fadeDown: function () {
    this.animation.translateY(600).step()
    this.setData({
      animationData: this.animation.export(),
    })
  },
  /**
   * 录视频
   */
  recordVideo: function () {

  },
  /**
   * 录音
   */
  recording: function () {

  }

})