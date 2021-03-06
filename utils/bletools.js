var errorInfo = require('/errorInfo.js');
var constants = require('/constants.js');
const util = require('/util.js')
const onfire = require('/onfire.js')
const base64 = require('/Base64.js')
//当前连接设备
var currentBle = null
// page的实例对象 用来回调处理结果回去 
var _this = null

var timeOut= null

/** 
 * 
 * 只需要最简单的配置 傻瓜式使用 只要通过配置文件修改uuid 即可发送自己的数据至设备 √
 * 兼容ios android  √
 * 对当前用户的手机系统进行判断是否支持ble   √
 *   获取系统  及系统版本  √
 *   获取微信版本   √
 * 判断用户手机蓝牙是否打开  √
 * 错误码定义 √
 * 所有可变的配置抽取出来 统一配置参数  config文件编写√
 * 连接函数需要抽取出来   √
 * 扫描方法抽取 √
 * ble 操作过程中希望所有状态都抽取出来 通过一个函数来分发 而不是在代码中到处修改 √
 * 希望能对ui有最小的侵入 用户可以定义显示的ui 这边只采用最简单的显示在dialog中 √
 * 如果用户的场景不是手动点击连接 而是代码自动进行连接设备 可以调用_connectBle()传入device即可 √
 * 如果用户的场景不需要扫描 则不调用startScanBle()方法即可 这个方法只是断开当前正在连接的设备 开始扫描附近的外围设备 如果对你的逻辑有侵入 请自行修改 √
 * ios扫描同一个设备出现了两个  × 有瑕疵
 * 扫描时间配置  √
 * 将ble所有的操作都抽取为一个js  √
 *  1.之后也可以拷贝到其他地方使用,耦合低
 *  2.如果和业务逻辑都写在一起,代码很乱,阅读性差,不好维护
 *  3.每个用户可能自己的业务逻辑都不同,所以ble部分可能还需要自己再稍加修改，可以更快更容易定位到需要修改的地方
 *  4.更方便测试
 */


/**
 * 写入数据至设备 
 * data 16进制数组
 */
function write(server_uuid,char_uuid,buffer) {
  // let buffer = new ArrayBuffer(data.length)
  // let dataView = new DataView(buffer)
  // for (var i = 0; i < data.length; i++) {
  //   dataView.setUint8(i, data[i])
  // }
  //写数据
  console.log('开始写数据 server_uuid ===' + server_uuid + ' char_uuid == ' + char_uuid + '  buffer' + buffer)
  wx.writeBLECharacteristicValue({
    deviceId: currentBle.deviceId,
    serviceId: server_uuid,
    characteristicId: char_uuid,
    value: buffer,
    success: res => {
      _this.writeListener(true)
    },
    fail: res => {
      console.log('写入错误 res ==== ' + res.errMsg)
      if (res.errCode == 10001) {
        _this.bleStateListener(constants.STATE_CLOSE_BLE)
      }else{  
      _this.bleStateListener(constants.STATE_DISCONNECTED)
      _this.writeListener(false, errorInfo.getErrorInfo(res.errCode))
      } 
    }
  })
}



/**
 * 扫描蓝牙  扫描时先断开连接 避免在连接时同时扫描 因为他们都比较消耗性能 容易导致卡顿等不良体验
 */
function startScanBle(obj) {
  disconnect()
  // // 监听寻找到新设备的事件
  // wx.onBluetoothDeviceFound((devices) => {
  //   // 扫描结果暴露出去 
  //   obj.success(devices)
  // })
  //扫描附近的外围设备
  wx.startBluetoothDevicesDiscovery({
    services: [
      constants.SER_UUID_WIFI
      // constants.SER_UUID_VIDEO,
      // constants.SER_UUID_DEVICE
    ],
    success:function(res){
      setTimeout(function () {
        wx.getBluetoothDevices({
          success: function (devices) {

            // 扫描结果暴露出去 
            obj.success(devices.devices)
            onfire.fire('BLESearchResult', "success")
            if (devices.devices.length == 0){
              onfire.fire('BLESearchResult', "deviceNull")
            }
          },
          fail: function (err) {
            if (err.errCode == 10001) {
              _this.bleStateListener(constants.STATE_CLOSE_BLE)
            }
            console.log('getBluetoothDevices err ===' + errMsg)
            onfire.fire('BLESearchResult', "fail")
          }
        })
      }, 1000);
    },
    fail:function(err){
      // 如果需要更加详细的错误分析
      // if(err.errCode == 10001){
      //   _this.bleStateListener(constants.STATE_SCANNING_NOT_AVAILABLE)
      // }else if(err.errCode == 10002){
      //   this.bleStateListener(constants.STATE_SCANNING_NO_DEVICE)
      // }else{
      //   this.bleStateListener(constants.STATE_SCANNING_FAIL)
      // }
      if (err.errCode == 10001) {
        _this.bleStateListener(constants.STATE_CLOSE_BLE)
      } else { 
        _this.bleStateListener(constants.STATE_SCANNING_FAIL)
      }
      onfire.fire('BLESearchResult', "fail")
      console.log("开启扫描失败 下面是开启监听失败的原因")
      console.dir(err)
    }
  })
  if (timeOut != null){
    console.log('有扫描任务在进行 先清除任务')
    clearTimeout(timeOut)
  }
  //时间到停止扫描
  timeOut = setTimeout(function() {
    //停止搜寻附近的蓝牙外围设备
    wx.stopBluetoothDevicesDiscovery({})
    timeOut= null
  }, constants.SCANTIME)
}

/**
 * 初始化蓝牙适配器
 */
function _initBleTools() {
  console.log("初始化蓝牙适配器")
  //初始化蓝牙适配器
  wx.openBluetoothAdapter({
    success: function(res) {
      console.log("初始化蓝牙适配器成功")
      //监听蓝牙适配器状态变化事件
      wx.onBluetoothAdapterStateChange(res => {
        if (res.discovering) {
          _this.bleStateListener(constants.STATE_SCANNING)
        } else {
          _this.bleStateListener(constants.STATE_SCANNED)
        }
      })
      //在后面的版本中我发现外部调用没有一个好的位置让调用者能够自动的发起扫描 添加这个方法就是让调用者在初始化适配器之后自动开启扫描
      _this.bleStateListener(constants.STATE_INIT_SUCCESS)
    },
    fail: function(err) {
      //在用户蓝牙开关未开启或者手机不支持蓝牙功能的情况下，调用 wx.openBluetoothAdapter 会返回错误（errCode=10001），表示手机蓝牙功能不可用
      if (err.errCode == 10001) {
        _this.bleStateListener(constants.STATE_CLOSE_BLE)
      }
    }
  })
}

/**
 * 连接设备的函数 传入对象device即可 在该函数中连接成功后 就会启动监听特征变化用来获取数据
 */
function connectBle(device) {
 
  console.log('开始本次连接 device ===' + device.deviceId + ' deviceNo ====' + device.deviceNo)
  disconnect()
  //获取到设备的deviceId地址
  currentBle = device
  //连接时停止扫描 避免连接与扫描在同时进行消耗性能 可能会导致卡顿等影响 如果你需要扫描请注释此代码 对逻辑不会有影响
  wx.stopBluetoothDevicesDiscovery({})
  //记录本次连接的设备 当再次扫描时 本次连接就需要断开 因为蓝牙的扫描和连接都需要高消耗 避免两个操作同时进行
  //开始本次连接
  _this.bleStateListener(constants.STATE_CONNECTING)
  wx.createBLEConnection({
    deviceId: currentBle.deviceId,
    timeOut: constants.CONNECTTIME,
    fail: err => {
      if (err.errCode == 10001) {
        _this.bleStateListener(constants.STATE_CLOSE_BLE)
      } else { 
        _this.bleStateListener(constants.STATE_CONNECTING_ERROR)
      }
      //蓝牙已经断开连接了  那么当前连接设备要取消掉
      currentBle = null
      console.log('连接失败 下面是连接失败原因')
      console.dir(err)
    }
  })
  //监听低功耗蓝牙连接状态的改变事件。包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
  wx.onBLEConnectionStateChange(res => {
    // 该方法回调中可以用于处理连接意外断开等异常情况
    if (res.connected) {
      // 连接设备成功，缓存连接设备信息
      _this.bleStateListener(constants.STATE_CONNECTED)
      if (currentBle.localName == ""){
        currentBle.localName = "会议宝"
      }
      if (device.deviceNo == ""){
        _this.bleStateListener(constants.STATE_DISCONNECTED)
        //不允许绑定这个设备
        currentBle = null
        return
      }


      var encValue = util.getRSA_str(device.deviceNo)
      // var encValue = "ff00303230303030303030303030"
      // 向服务端发送设备绑定
      wx.request({
        url: getApp().globalData.urlHeader + '/auth/device/bind',
        // url: 'http://192.168.26.88:8080' + '/device/bind',
        method: 'POST',
        data:{
          deviceNo: encValue
        },  
        header: {
          Authorization: wx.getStorageSync('JWT')
        },
        success(result) {
          // 请求成功或者保存过都算连接成功
          if (result.data.code == '200') {
            console.log('device/bind success' + result.data.msg)
            // 缓存绑定后设备信息
            var deviceObj = {}
            deviceObj.deviceName = currentBle.localName
            deviceObj.deviceNo = currentBle.deviceNo
            deviceObj.deviceId = currentBle.deviceId
            deviceObj.deviceUUID = result.data.responseData.username
            console.log('device/bind device ===' + deviceObj.deviceName + ' deviceNo=== ' + deviceObj.deviceNo + ' deviceId=== ' + deviceObj.deviceId + ' deviceUUID===' + deviceObj.deviceUUID)
            getApp().globalData.devicesList = deviceObj
            console.log('连接设备：' + currentBle)
            //获取所有的服务 不获取不影响Android的蓝牙通信 但是官方文档说会影响ios 所以按照文档来 
            _getDevices(currentBle.deviceId)
          } else {
            disconnect()
            console.log('device/bind err ' + result.data.code)
            _this.bleStateListener(constants.STATE_DISCONNECTED)
            //蓝牙已经断开连接了  那么当前连接设备要取消掉
            currentBle = null
            wx.showToast({
              title: '设备绑定失败' + result.data.code,
              icon: 'none',
              duration: 2000
            })
          }
        },
        fail(error) {
          disconnect()
          console.log('device/bind fail ' + error.errMsg)
          console.log(error);
          _this.bleStateListener(constants.STATE_DISCONNECTED)
          //蓝牙已经断开连接了  那么当前连接设备要取消掉
          currentBle = null
        }
      })
      
    } else {
      _this.bleStateListener(constants.STATE_DISCONNECTED)
      //蓝牙已经断开连接了  那么当前连接设备要取消掉
      currentBle = null
    }
  })
}

/**
 * 获取已连接设备的所有服务
 */
function _getDevices(deviceId) {
  wx.getBLEDeviceServices({
    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
    deviceId: deviceId,
    success: res => {
      var servicesArray = res.services
      for (var i = 0; i < servicesArray.length; i++) {
        var services = servicesArray[i].uuid
        // console.log('查找服务成功 deviceId === ' + deviceId + '   services === ' + services)
        // _getCharacteristic(deviceId, services)
        // 需要订阅的服务，先写一个设备控制，后续再补充
        // if (constants.SER_UUID_VIDEO.toUpperCase() === services ) {
        //   console.log('查找服务成功')
        //   constants.SERUUID = services
        //   _getCharacteristic(deviceId, services)
        //   break;
        // }
        // 需要订阅的服务
        _getCharacteristic(deviceId, services)
      }
    },
    fail(err) {
      console.log("没有找到服务")
    }
  })
}

//服务uuid已经找到  
//获取蓝牙设备某个服务中所有特征值(characteristic)。
function _getCharacteristic(deviceId, services) {
  wx.getBLEDeviceCharacteristics({
    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
    deviceId: deviceId,
    // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
    serviceId: services,
    success: (res) => {
      var characteristicsArray = res.characteristics
      for (var i = 0; i < characteristicsArray.length; i++) {
        var characteristics = characteristicsArray[i].uuid
        // //这里有两种情况 1.同一个uuid具备写和通知通过 2.通知和写是两个uuid
        // if (constants.NOTIFYUUID.toUpperCase() === characteristics) {
        //   console.log('查找通知服务成功')
        //   constants.NOTIFYUUID = characteristics
        // }
        // if (constants.WRITEUUID.toUpperCase() === characteristics) {
        //   console.log('查找写服务成功')
        //   constants.WRITEUUID = characteristics
        // }
        console.log('获取特征值 deviceId == ' + deviceId + '  services ==' + services + '  characteristics == ' + characteristics)
        _startNotifyListener(deviceId,services,characteristics)
      }
      // _startNotifyListener(deviceId)
    }
  })
}

//启用低功耗蓝牙设备特征值变化时的 notify 功能，订阅特征值
function _startNotifyListener(deviceId, services, characteristics) {
  wx.notifyBLECharacteristicValueChange({
    deviceId: deviceId,
    serviceId: services,
    characteristicId: characteristics,
    state: true,
    success: res => {
      //启动成功后 监听数据变化
      _onNotifyListener()
      _this.bleStateListener(constants.STATE_NOTIFY_SUCCESS)
    },
    fail: res => {
      _this.bleStateListener(constants.STATE_NOTIFY_FAIL)
      console.log("开启监听失败 下面是开启监听失败的原因")
      console.dir(res)
    }
  })
}

//监听低功耗蓝牙设备的特征值变化。必须先启用 notifyBLECharacteristicValueChange 接口才能接收到设备推送的 notification。
function _onNotifyListener() {
  wx.onBLECharacteristicValueChange(res => {
  //   console.log(ab2hex(res.value))
	// //转换数据
  //   var buffer = res.value
  //   var dataResult = new Uint8Array(buffer)
    _this.notifyListener(res)
  })
}

//停止搜寻附近的蓝牙外围设备
function stopBluetoothDevicesDiscovery() {
  wx.stopBluetoothDevicesDiscovery({})
}

/**
 * 释放资源
 */
function clear() {
  wx.closeBluetoothAdapter({
    success: function(res) {
      console.log("销毁页面 释放适配器资源")
    }
  })
}

/**
 * 获取系统及系统版本及微信版本
 *   iOS 微信客户端 6.5.6 版本开始支持，Android 6.5.7 版本开始支持  ble
 *    Android 8.0.0 -> res.system
 *    6.7.3 -> res.version
 *    android -> res.platform
 */
function initBle(that) {
  _this = that
  try {
    // 同步获取系统信息 反之有异步 自己根据情况使用
    const res = wx.getSystemInfoSync()
    var tempPlatform = res.platform
    var tempVersion = res.version
    var tempSystem = res.system
    //判断用户当前的微信版本是否支持ble
    _checkPermission(tempPlatform, tempVersion, tempSystem)
  } catch (e) {
    // Do something when catch error
    console.log('initBle fail ==== ' + e)
  }
}

/**
 * 判断微信客户端是否支持使用蓝牙API
 */
function _checkPermission(platform, version, tempSystem) {
  if (platform === 'android') {
    //android 4.3才开始支持ble Android 8.0.0
    var systemVersion = tempSystem.substring(8, tempSystem.length)
    console.log('安卓系统版本 systemVersion ===' + systemVersion + '   version' + version)
    if (systemVersion >= '4.3.0' || systemVersion == '10') {
      //系统支持
      if (version >= '6.5.7') {
        //支持ble 初始化蓝牙适配器
        _initBleTools()
      } else{
        //不支持ble  微信版本过低
        _this.bleStateListener(constants.STATE_NOTBLE_WCHAT_VERSION)
      }
    }else{
      //不支持ble 系统版本过低
      _this.bleStateListener(constants.STATE_NOTBLE_SYSTEM_VERSION)
    }
  } else if (platform === 'ios') {
    console.log('iOS系统版本 systemVersion ===' + systemVersion + '   version' + version)
    if (version >= '6.5.6') {
      //支持ble 初始化蓝牙适配器
      _initBleTools()
    }else{
      //不支持ble  微信版本过低
      _this.bleStateListener(constants.STATE_NOTBLE_WCHAT_VERSION)
    }
  } else {
    console.log('未知系统 请自行探索')
  }
}
/**
 * 断开当前连接
 */
function disconnect(){
  // 1.断开连接(如果有连接的话) 
  //当前正在连接的设备 当前也可能没有设备连接
  if (currentBle != null) {
    console.log("有设备在连接中")
    //说明当前有设备在连接 需要执行断开操作
    wx.closeBLEConnection({
      deviceId: currentBle.deviceId
    })
  } else {
    console.log("没有设备在连接中")
  }
}
/**
 * 获取蓝牙列表和设备列表去重后的obj值
 */
function getDeviceList(getServerDevList, devicesList) {
  if (getServerDevList.length == 0 && devicesList.length == 0) {
    return;
  }
  var devicesListNew = []; //蓝牙去重后的数组对象集合
  var hash = {};
  for (let i = 0; i < devicesList.length; i++) {
    var temp = devicesList[i];
    console.log('startScanBle 1 ====' + temp.advertisData)
    if (temp.advertisData == undefined) {
      continue
    } 
    var elem = base64.arrayBufferToStr(temp.advertisData);
    console.log('startScanBle 2 ====' + elem)
    if (!hash[elem] && elem != '' && temp.localName != '') {
      devicesListNew.push(devicesList[i]);
      hash[elem] = true;
    }
  }
  var deviceObj = {};
  for (var g = 0; g < devicesListNew.length; g++) {
    for (var j = 0; j < getServerDevList.length; j++) {
      var deviceNo = base64.arrayBufferToStr(devicesListNew[g].advertisData)
      // 去掉首字符type
      deviceNo = deviceNo.substr(1)
      if (deviceNo == getServerDevList[j].deviceNo) {
        deviceObj.deviceName = getServerDevList[j].nickname;
        deviceObj.deviceNo = deviceNo
        deviceObj.deviceUUID = getServerDevList[j].username;
        deviceObj.deviceId = devicesListNew[g].deviceId;
      }
    }
  }
  return deviceObj;
}

module.exports = {
  write,//写数据
  startScanBle,//开始扫描
  clear,//退出释放资源
  stopBluetoothDevicesDiscovery,//停止扫描
  connectBle,//连接设备
  initBle,//初始化蓝牙模块
  disconnect,//断开连接
  getDeviceList: getDeviceList//获取蓝牙和设置去重后的列表值
}