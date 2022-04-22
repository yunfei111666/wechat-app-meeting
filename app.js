//app.js
var bletools = require('/utils/bletools.js')
var constants = require('/utils/constants.js')
const onfire = require('/utils/onfire.js')
const util = require('/utils/util.js')
var base64 = require('/utils/Base64.js')

App({
  onLaunch: function () {
    // wx.clearStorage(); //测试使用
    
    console.log("JWT======" + wx.getStorageSync('JWT'))

    // 蓝牙初始化
    bletools.initBle(this)

    var that = this

    // 登录
    wx.login({
      success: res => {
        console.log('wx.login code ====' + res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.request({
          url: this.globalData.urlHeader + '/auth/wechat/wxlogin?code=' + res.code,
          method: 'POST',
          success(result) {
            if (result.data.code == '200') {
              console.log('loginInfo +++ JWT= ' + result.data.responseData.token + ' bind=' + result.data.responseData.bind + ' nickname= ' + result.data.responseData.nickname)
              //存储登陆数据
              wx.setStorageSync('JWT', result.data.responseData.token)
              wx.setStorageSync('bind', result.data.responseData.bind)
              wx.setStorageSync('nickname', result.data.responseData.nickname)
              wx.setStorageSync('username', result.data.responseData.username)
              // 获取列表数据
              that.getDeviceList()
            } else {
              console.log("login error code = " + result.data.code)
              wx.showToast({
                title: '请重新登陆',
                icon: 'none',
                duration: 2000,
              })
              wx.clearStorageSync()
            }
          },
          fail(error) {
            console.log(error);
          }
        })
      }
    })
       
  },
  getDeviceList:function(){
    var that = this;
    //获取设备列表，默认显示第一个或设置设备缓存选中状态
    wx.request({
      url: that.globalData.urlHeader + '/auth/device/list',
      method: 'POST',
      header: {
        Authorization: wx.getStorageSync('JWT')
      }, // 设置请求的 header
      success: function (res) {
        console.log(res)
        if (res.data.code == '200') {
          if (res.data.responseData.length > 0) {
            // ----------------------------------------------蓝牙功能
            if (that.globalData.connectState == 9) {
              bletools.initBle(that);
            } else {
              setTimeout(() => {
                bletools.startScanBle({ //获取蓝牙列表
                  success: devicesList => {

                    console.log('初始化获取蓝牙设备列表 === ' + devicesList)
                    console.log(devicesList)
                    if (devicesList.length > 0) { //有数据
                      var obj = bletools.getDeviceList(res.data.responseData, devicesList);
                      that.globalData.devicesList = obj;
                      
                      console.log('数据比对结果===' + obj)
                      console.log(that.globalData.devicesList)
                    }else{
                      console.log("没发现设备")
                    }

                  }
                })
              }, 2000)
            }

          } 
        }
      },
      fail: function () {
        console.log("设备搜索失败")
      },
      complete: function () { }
    })
  },
  /**
   * 给设备写数据
   * server_uuid 服务UUID
   * char_uuid 特征UUID
   * str 值（字符串）
   */
  writeToDevice(server_uuid, char_uuid, str) {

    var that = this

    console.log('开始写数据，数据为 ==' + str)

    // 使用base64
    var buffer = base64.strToArrayBuffer(str)
    
    if (buffer.byteLength != 0){
      bletools.write(server_uuid, char_uuid, buffer)
    }else{
      console.log('数据错误，数据为 ==' + str)
    }    
  },

  /**
   * 发送数据结果 true or false
   * 如果为false msg是失败原因
   */
  writeListener: function (result, msg) {
    //此处可以执行自己的逻辑 比如一些提示
    console.log(result ? '发送数据成功' : msg)
  },

  readDataFormBLE: function (deviceId,serviceId, characteristicId){
    // 准备开始读设备设置
    wx.readBLECharacteristicValue({
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      success: function (res) {
        console.log('读取BLE数据成功')
      },
      fail: function (err) {
        console.log('读取BLE数据失败 =' + err.code + ' msg == ' + err.errMsg + ' charid ==' + characteristicId)
      }
    })
  },
  
  /**
  * 接收数据 
  */
  notifyListener: function (res) {

    var value = base64.arrayBufferToStr(res.value)
    console.log('监听低功耗蓝牙设备的特征值变化  serviceId ===' + res.serviceId + '   characteristic === ' + res.characteristicId + '  value ===' + value)
    
    // 音视频设置
    if (res.serviceId == constants.SER_UUID_VIDEO){
      switch (res.characteristicId){
        case constants.CHAR_UUID_VIDEO_VOL:
          // 音量
          console.log('接收数据 音量 ===' + value)
          onfire.fire('devVolChange', value)
          break;
        case constants.CHAR_UUID_VIDEO_MIC:
          // 麦克风开关
          console.log('接收数据 麦克风开关 ===' + value)
          onfire.fire('devMicChange', value)
          break;
        case constants.CHAR_UUID_VIDEO_CAMEAR:
          // 摄像头开关
          console.log('接收数据 摄像头开关 ===' + value)
          onfire.fire('devCamearChange', value)
          break;
        case constants.CHAR_UUID_VIDEO_PIP:
          // 画中画
          console.log('接收数据 画中画 ===' + value)
          onfire.fire('devPIPChange', value)
          
          break;
        case constants.CHAR_UUID_MEETING_USERLIST:
          // 开关成员列表
          console.log('接收数据 开关成员列表 ===' + value)
          onfire.fire('meetingUserListChange', value)
          break;
        case constants.CHAR_UUID_MEETING_ALLMUTE:
          // 全员静音/单个静音
          console.log('接收数据 全员静音/单个静音 ===' + value)
          onfire.fire('meetingAllMuteChange', value)
          break;
        case constants.CHAR_UUID_MEETING_WHITEBOARD:
          // 开关白板
          console.log('接收数据 开关白板 ===' + value)
          onfire.fire('meetingWBChange', value)
          break;
        case constants.CHAR_UUID_MEETING_CHARROOM:
          // 开关白板
          console.log('接收数据 开关聊天室 ===' + value)
          onfire.fire('meetingCharChange', value)
          break;
        case constants.CHAR_UUID_MEETING_AUTOCUT:
          // 开关自动切屏
          console.log('接收数据 开关自动切屏 ===' + value)
          onfire.fire('meetingAutoCutChange', value)
          break;
        case constants.CHAR_UUID_MEETING_AUTOCUT:
          // 开关大屏模式
          console.log('接收数据 大屏模式 ===' + value)
          onfire.fire('meetingSereenModeCutChange', value)
          break;
        case constants.CHAR_UUID_MEETING_RESULT:
          // 参会/召会 成功
          var chararray = value.split("&")
          if(chararray.length == 4 || chararray[0] == 1){
            console.log('接收数据 参会/召会 成功 ===' + value)
            onfire.fire('meetingJoinSuccess', chararray[1] + '&' + chararray[3])
          }else{
            wx.showToast({
              title: '加入会议失败',
              duration: 2000,
            })
          }
          break;
        case constants.CHAR_UUID_MEETING_HANGUP:
          // 挂断
          getApp().globalData.isMeeting = false
          console.log('接收数据 挂断 ===' + value)
          onfire.fire('meetingDidHangup', value)
          break;
      }  
    } else if (res.serviceId == constants.SER_UUID_WIFI){
      if (res.characteristicId == constants.CHAR_UUID_WIFI_CONFLG_COMPLETE){
        //wifi配置结果
        console.log('wifi链接结果 ===' + value)
        onfire.fire('wifiConflgResult',value)
      }
    }else if(res.serviceId == constants.SER_UUID_DEVICE){
      if(res.characteristicId == constants.CHAR_UUID_DEVICE_CAMEAR){
        // 摄像头升降
        console.log('摄像头升降结果 ===' + value)
        onfire.fire('devCamearRiseChange',value)
      }
    }
  },
  /**
   * ble状态监听
   */
  bleStateListener: function (state) {

    // // 注册状态监听事件
    // onfire.fire('bleStateChange', state)

    var that = this
    switch (state) {
      case constants.STATE_DISCONNECTED: //设备连接断开
        console.log('设备连接断开')
        that.globalData.connectState = constants.STATE_DISCONNECTED
        // 监听蓝牙连接状态
        onfire.fire('connectStateChange', constants.STATE_DISCONNECTED)
        break;
      case constants.STATE_SCANNING: //设备正在扫描
        console.log('设备正在扫描')
        break;
      case constants.STATE_SCANNED: //设备扫描结束
        console.log('设备扫描结束')
        break;
      case constants.STATE_CONNECTING: //设备正在连接
        console.log('设备正在连接')
        wx.showLoading({
          title: '设备正在连接',
        })
        break;
      case constants.STATE_CONNECTED: //设备连接成功
        wx.hideLoading()
        console.log('设备连接成功')
        that.globalData.connectState = constants.STATE_CONNECTED
        // 监听蓝牙连接状态
        onfire.fire('connectStateChange', constants.STATE_CONNECTED)
        break;
      case constants.STATE_CONNECTING_ERROR: //连接失败
        wx.hideLoading()
        console.log('连接失败')
        that.globalData.connectState = constants.STATE_DISCONNECTED
        // 监听蓝牙连接状态
        onfire.fire('connectStateChange', constants.STATE_DISCONNECTED)
        break;
      case constants.STATE_NOTIFY_SUCCESS: //开启notify成功
        console.log('开启notify成功')
        break;
      case constants.STATE_NOTIFY_FAIL: //开启notify失败
        console.log('开启notify失败')
        break;
      case constants.STATE_CLOSE_BLE: //蓝牙未打开 关闭状态
        console.log('蓝牙未打开 关闭状态')
        that.globalData.connectState = constants.STATE_CLOSE_BLE
        // 监听蓝牙关闭状态
        onfire.fire('connectStateChange', constants.STATE_CLOSE_BLE)
        break;
      case constants.STATE_NOTBLE_WCHAT_VERSION: //微信版本过低 不支持ble
        console.log('微信版本过低 不支持ble')
        wx.showToast({
          title: '微信版本过低',
          icon: 'fail',
          duration: 2000,
        })
        break;
      case constants.STATE_NOTBLE_SYSTEM_VERSION: //系统版本过低 不支持ble
        console.log('系统版本过低 不支持ble')
        wx.showToast({
          title: '系统版本过低',
          icon: 'fail',
          duration: 2000,
        })
        break;
      case constants.STATE_SCANNING_FAIL: //ble搜索失败
        console.log('搜索设备失败')
        break;
      case constants.STATE_INIT_SUCCESS: //初始化蓝牙适配器成功 
        //tips:可以在此处调用扫描函数 蓝牙适配器初始化成功表示蓝牙在开启状态
        break;
    }
    console.log('globalData.connectState === ' + that.globalData.connectState)
  },
  globalData: {
    userInfo: {},
   // urlHeader: 'https://ivml.nsitd.com:8584',//测试环境
     urlHeader:'https://m.nsitd.com:8584',//生产环境
    connectState: constants.STATE_DISCONNECTED, //设备连接状态
    devicesList:{
      deviceId:'',//连蓝牙用ID
      deviceName:'',//设备名称
      deviceNo:'',//设备唯一标识
      deviceUUID:''//和服务端交互用ID
    }, //当前连接设备缓存
    isMeeting:false,//当前是否会议中
    appVersion:'0.0.17',//当前小程序版本
  },
  
})
