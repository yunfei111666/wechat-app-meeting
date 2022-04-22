var app = getApp();
var bletools = require('../../utils/bletools.js')
var constants = require('../../utils/constants.js')
const onfire = require('../../utils/onfire.js')
var base64 = require('../../utils/Base64.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadingShowHide:false,//默认进来显示加载动态
    hasDeviceShowOrHide: true,//全局默认隐藏hearder,body,bottom
    notBlueShowOrHide:true,//无蓝牙界面默认隐藏
    notDeiveceShowOrHide:true,//无设备界面默认隐藏
    animationData: {}, //旋转动画使用
    show: true,
    list: [],
    advertisDataArr: [],
    dev_id: '0', //设置设备列表默认勾选第一个
    // ser_id:"",  //主服务uuid
    // char_id:"", // 特征值
    selDevice: '', //已选设备
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    var that = this;
    // this.animation()
    var animation = wx.createAnimation({
      duration: 16,
      timingFunction: 'ease',
    })
    this.animation = animation
    this.setData({
      animationData: animation.export()
    })
    var n = 0;
    //连续动画需要添加定时器,所传参数每次+1就行
    setInterval(function () {
      n = n + 1;
      this.animation.rotate(80 * (n)).step()
      this.setData({
        animationData: this.animation.export()
      })
    }.bind(this), 100)
    //监听扫描结果
    onfire.on('BLESearchResult',e=>{
      if (e == "deviceNull") {
        that.setData({
          notDeiveceShowOrHide: false,//没有设备显示无设备画面
          hasDeviceShowOrHide: true,
          notBlueShowOrHide: true, //蓝牙界面隐藏
          loadingShowHide:true  //隐藏load
        })
      }
    })

    bletools.clear()
    bletools.initBle(app)
    setTimeout(() => {
      that.startScanBle()
    }, 1000)

    // 监听连接状态
    onfire.on('connectStateChange', e => {
      if (e == constants.STATE_CONNECTED) {
        // wifi配置先不做，先返回页面
        // wx.navigateTo({
        //   url: '../deviceWiFi/deviceWiFi',
        // })
        wx.showToast({
          title: '设备连接成功',
          icon: 'success',
          duration: 2000,
        })
        wx.navigateBack({
          delta: 1
        })
      } else if (e == constants.STATE_CLOSE_BLE) {
        that.setData({
          notBlueShowOrHide: false,//未打开蓝牙
          loadingShowHide:true, //隐藏搜索界面
          hasDeviceShowOrHide: true,//隐藏设备界面
          notDeiveceShowOrHide: true,//隐藏无设备界面
        })
      } else {
        wx.showToast({
          title: '设备连接失败',
          icon: 'fail',
          duration: 2000,
        })
      }
    })


  },
  // animation:function(){
   
  // },
  onShow:function(){

   
  },
  /**
   * 扫描蓝牙 
   */
  startScanBle: function() {
    var devList = []
    var that = this;
    bletools.startScanBle({
      success: devicesList => {
        
        var advertisDataArr = [];//单独缓存advertisData集合
        var result = []; //去重后的数组对象集合
        var hash = {};
        for (let i = 0; i < devicesList.length; i++) {
          var temp = devicesList[i];
          console.log('startScanBle 1 ====' + temp.advertisData)
          if (temp.advertisData == undefined) {
            continue
          }  
          var elem = base64.arrayBufferToStr(temp.advertisData)
          console.log('startScanBle 2 ====' + elem)
          // 去掉首字符type
          elem = elem.substr(1);
          console.log('startScanBle 3 ====' + elem)
          if (!hash[elem] && elem != '' && temp.localName !='') {
            result.push(devicesList[i]);
            advertisDataArr.push(elem)
            hash[elem] = true;
          }
          console.log('扫描到的device name =' + temp.name + ' localName =' + temp.localName + ' deviceId =' + temp.deviceId + ' advertisData = ' + elem)
        }
        if (result.length>0){
          that.setData({
            loadingShowHide: true,//隐藏加载动态
            hasDeviceShowOrHide: false,//有设备,显示界面
            notBlueShowOrHide: true,//隐藏蓝牙
            notDeiveceShowOrHide: true,//无设备,隐藏无设备界面
          })
          that.setData({
            list: result,
            advertisDataArr: advertisDataArr
          });
          that.setData({
            show: false
          });
        }else{
          // that.setData({
          //   hasDeviceShowOrHide: true,//无设备,隐藏设备界面
          //   notDeiveceShowOrHide: false,//无设备,显示无设备界面
          //   notBlueShowOrHide:true, //蓝牙界面隐藏
          //   loadingShowHide: true
          // })
        }
      }
    })
  },

  //4.连接设备
  createBLEConnection: function(obj) {
    var tempDev = obj.currentTarget.dataset.data
    var advertisData = obj.currentTarget.id;
    console.log(advertisData)

    console.log('开始本次连接 tempDev ===' + tempDev.deviceId + ' deviceNo ====' + advertisData)
    this.selDevice = tempDev
    this.selDevice.deviceNo = advertisData
    console.log('this.selDevice.deviceNo ===' + this.selDevice.deviceNo)

    this.setData({
      dev_id: tempDev.deviceId
    });
  },

  naviToWiFi: function() {
    console.log('4.连接设备 device === ' + this.selDevice)
    if (this.selDevice){
      bletools.connectBle(this.selDevice)
    }else{
      wx.showToast({
        title: '请选择设备！',
        icon: 'fail',
        duration: 2000,
      })
    }
    
  },

  onUnload: function() {
    // 取消事件绑定
    onfire.un("BLESearchResult")
    onfire.un("connectStateChange")
  },
    /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this;
    that.onLoad();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 3000);
  },
})