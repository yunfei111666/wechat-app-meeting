// pages/setting/setting.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    camera:false,
    min: '0',
    max: '10',
    text: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  
  switch1Change:function(e){
    console.log( e.detail)
    if (e.detail.value){

    }else{
      
    }
  },
  sliderBindchange: function (e) {
    this.setData({
      text: e.detail.value
    })
  },




})