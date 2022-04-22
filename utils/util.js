const rsasign = require('/jsrsasign-all-min.js')
var pk = "-----BEGIN PUBLIC KEY-----\n" + "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDRdzZZ8EEb1OCxNPCYrrbAS2GE8yh6h4YVsUWFclPt/A//SppgIVRXiBGVhTHDsPRmr8BM4nmc9yQz7Ngrkuz0LgB6/hLtuT2vcybd+IpAUfji0Zmrs6yPtKrNpF2LtviddujlUyc7LFETs/3KBQKjsd8/pb7CXh3a0rRsn669MwIDAQAB\n" + "-----END PUBLIC KEY-----";


const formatTime = date => {
  var date = new Date(date)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getRSA_str(str){
  console.log('加密前：' + str)
  var pub = rsasign.getKey(pk)
  var enc = rsasign.encrypt(str, pub)
  console.log('加密后：' + enc)
  return enc
}

function hexCharCodeToStr(hexCharCodeStr) {
  　　var trimedStr = hexCharCodeStr.trim();
  　　var rawStr =
    　　trimedStr.substr(0, 2).toLowerCase() === "0x"
      　　?
      　　trimedStr.substr(2)
      　　:
      　　trimedStr;
  　　var len = rawStr.length;
  　　if (len % 2 !== 0) {
    　　　　alert("Illegal Format ASCII Code!");
    　　　　return "";
  　　}
  　　var curCharCode;
  　　var resultStr = [];
  　　for (var i = 0; i < len; i = i + 2) {
    　　　　curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
    　　　　resultStr.push(String.fromCharCode(curCharCode));
  　　}
  　　return resultStr.join("");
}

module.exports = {
  formatTime: formatTime,
  getRSA_str: getRSA_str,
  hexCharCodeToStr: hexCharCodeToStr,
}
