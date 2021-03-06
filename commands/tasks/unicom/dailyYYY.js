var crypto = require('crypto');
var CryptoJS = require("crypto-js");
var moment = require('moment');

// 摇一摇送好礼
var transParams = (data) => {
  let params = new URLSearchParams();
  for (let item in data) {
    params.append(item, data['' + item + '']);
  }
  return params;
};

var sign = (data) => {
  let str = 'integralofficial&'
  let params = []
  data.forEach((v, i) => {
    if (v) {
      params.push('arguments' + (i + 1) + v)
    }
  });
  return crypto.createHash('md5').update(str + params.join('&')).digest('hex')
}

var secretkeyArray = function () {
  for (var e = [], t = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E",
    "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X",
    "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q",
    "r", "s", "t", "u", "v", "w", "x", "y", "z"], i = 0;
    5 > i;
    i++) {
    for (var n = "", s = 0; 16 > s; s++) {
      var a = Math.floor(62 * Math.random());
      n += t[a]
    }
    e.push(n)
  }
  return e;
}

var encrypt = function (word, keyStr) {
  var key = CryptoJS.enc.Utf8.parse(keyStr);
  var srcs = CryptoJS.enc.Utf8.parse(word);
  var encrypted = CryptoJS.AES.encrypt(srcs, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
}

var decrypt = function (word, keyStr) {
  var key = CryptoJS.enc.Utf8.parse(keyStr);
  var decrypted = CryptoJS.AES.decrypt(word, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}



var dailyYYY = {
  doTask: async (axios, options) => {
    const useragent = `Mozilla/5.0 (Linux; Android 7.1.2; SM-G977N Build/LMY48Z; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/75.0.3770.143 Mobile Safari/537.36; unicom{version:android@8.0100,desmobile:${options.user}};devicetype{deviceBrand:samsung,deviceModel:SM-G977N};{yw_code:}`
    let searchParams = {}
    let result = await axios.request({
      baseURL: 'https://m.client.10010.com/',
      headers: {
        "user-agent": useragent,
        "referer": `https://img.client.10010.com/`,
        "origin": "https://img.client.10010.com"
      },
      url: `https://m.client.10010.com/mobileService/openPlatform/openPlatLine.htm?to_url=https://m.jf.10010.com/jf-order/avoidLogin/forActive/yyyqd&duanlianjieabc=tbkwx`,
      method: 'GET',
      transformResponse: (data, headers) => {
        if ('location' in headers) {
          let uu = new URL(headers.location)
          let pp = {}
          for (let p of uu.searchParams) {
            pp[p[0]] = p[1]
          }
          if ('ticket' in pp) {
            searchParams = pp
          }
        }
        return data
      }
    }).catch(err => console.log(err))
    let jar1 = result.config.jar

    let cookiesJson = jar1.toJSON()
    let ecs_token = cookiesJson.cookies.find(i => i.key == 'ecs_token')
    if (!ecs_token) {
      throw new Error('ecs_token缺失')
    }
    ecs_token = ecs_token.value
    let jfid = cookiesJson.cookies.find(i => i.key == '_jf_id')
    if (!jfid) {
      throw new Error('jfid缺失')
    }
    jfid = jfid.value

    // let ff = { "params": "vogRkS7brjqaInNHJv4oumE6HtGp7tbG7ZE9P21hmoaBq/rSwtvFjI/vcw2bNbdFUW1s27XOdaXbcBWHpgDYxmQuMP4aFj0Fy3JYp566sCH+97rQyrJRf1GzslAsSiLQJC4DQawzH+J54FIipKElMw==4", "parKey": ["YTJapEBcsMsMOU1i", "yJI3cV3zUxqZWd5j", "TmLBjGV8hTfZ7rMf", "QqAuodE1Zz9eA84p", "IM9f9CfT8LDK2RQ7"] }
    // console.log(decrypt(ff.params.substr(0, ff.params.length - 1), ff.parKey[parseInt(ff.params.substr(-1, 1))]))
    // process.exit(0)
    let keyArr = secretkeyArray()
    let keyrdm = Math.floor(Math.random() * 5)

    let params = {
      activityId: "Ac-9b71780cb87844b9ac3ab5d34b11dd24",
      userCookie: jfid,
      userNumber: searchParams.userNumber,
      time: new Date().getTime()
    };

    let reqdata = {
      params: encrypt(JSON.stringify(params), keyArr[keyrdm]) + keyrdm,
      parKey: keyArr
    }

    let res = await axios.request({
      baseURL: 'https://m.jf.10010.com/',
      headers: {
        "user-agent": useragent,
        "referer": "https://m.jf.10010.com/cms/yuech/unicom-integral-ui/yuech-Blindbox/shake/index.html?jump=sign",
        "origin": "https://img.jf.10010.com",
        "Content-Type": "application/json"
      },
      jar: jar1,
      url: `/jf-yuech/p/freeLoginRock`,
      method: 'post',
      data: reqdata
    }).catch(err => console.log(err))

    result = res.data
    if (result.code !== 0) {
      throw new Error(result.message)
    }

    let activity = result.data.activityInfos.activityVOs[0]
    let Authorization = result.data.token.access_token
    let freeTimes = activity.activityTimesInfo.freeTimes
    let advertTimes = activity.activityTimesInfo.advertTimes

    do {

      let orderId = ''

      console.log("已消耗机会", (1 + 4) - (freeTimes + advertTimes), "剩余免费机会", freeTimes, '看视频广告机会', advertTimes)

      if (!freeTimes && !advertTimes) {
        console.log('没有游戏次数')
        break
      }

      let currentTimes = (1 + 4) - (freeTimes + advertTimes) + 1

      let p1 = {
        'activityId': activity.activityId,
        'currentTimes': freeTimes,
        'type': '免费',
      }

      if (!freeTimes && advertTimes) {
        let params = {
          'arguments1': 'AC20200611152252',
          'arguments2': '',
          'arguments3': '',
          'arguments4': new Date().getTime(),
          'arguments6': '',
          'arguments7': '',
          'arguments8': '',
          'arguments9': '',
          'netWay': 'Wifi',
          'remark1': '签到小游戏摇摇乐不倒翁',
          'remark': '签到小游戏翻倍得积分',
          'version': `android@8.0100`,
          'codeId': 945689604
        }
        params['sign'] = sign([params.arguments1, params.arguments2, params.arguments3, params.arguments4])
        params['orderId'] = crypto.createHash('md5').update(new Date().getTime() + '').digest('hex')
        params['arguments4'] = new Date().getTime()

        result = await require('./taskcallback').reward(axios, {
          ...options,
          params,
          jar: jar1
        })

        let timestamp = moment().format('YYYYMMDDHHmmss')
        result = await axios.request({
          headers: {
            "user-agent": useragent,
            "referer": `https://img.client.10010.com/`,
          },
          url: `https://m.jf.10010.com/jf-order/avoidLogin/forActive/yyyqd?ticket=${searchParams.ticket}&type=02&version=android@8.0100&timestamp=${timestamp}&desmobile=${options.user}&num=0&postage=${searchParams.postage}&duanlianjieabc=tbkwx&userNumber=${options.user}`,
          method: 'GET'
        })

        p1 = {
          'activityId': activity.activityId,
          'currentTimes': advertTimes,
          'type': '广告',
          'orderId': params['orderId'],
          'phoneType': 'android',
          'version': '8.01'
        }
        advertTimes--

        orderId = params['orderId']
      } else {
        freeTimes--
      }

      res = await axios.request({
        headers: {
          "user-agent": useragent,
          "Authorization": `Bearer ${Authorization}`,
          "referer": "https://m.jf.10010.com/cms/yuech/unicom-integral-ui/yuech-Blindbox/shake/index.html?jump=sign",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        jar: null,
        url: `https://m.jf.10010.com/jf-yuech/api/gameResultV2/consumptionGameTimes`,
        method: 'get',
        params: transParams(p1)
      }).catch(err => console.log(err))

      if (res.data.code !== 0) {
        throw new Error(res.data.message)
      } else {
        if (res.data.data.code !== '0') {
          throw new Error(res.data.data.result)
        }
      }

      let t = {
        activityId: activity.activityId,
        resultId: res.data.data.resultId
      }

      let n = Math.floor(5 * Math.random())
      let i = secretkeyArray()

      params = {
        "params": encrypt(JSON.stringify(t), i[n]) + n,
        "parKey": i
      }
      res = await axios.request({
        headers: {
          "Authorization": `Bearer ${Authorization}`,
          "user-agent": useragent,
          "referer": "https://img.jf.10010.com/",
          "origin": "https://img.jf.10010.com"
        },
        url: `https://m.jf.10010.com/jf-yuech/api/gameResultV2/luckDraw`,
        method: 'post',
        data: params
      })
      result = res.data
      if (result.code !== 0) {
        console.log("摇一摇送好礼:", result.message)
      } else {
        console.log('摇一摇送好礼:', result.data.status === '中奖' ? result.data.prizeName : result.data.status)
        if (result.data.doublingStatus) {
          console.log('提交积分翻倍')
          await dailyYYY.lookVideoDouble(axios, {
            ...options
          })
          await dailyYYY.lookVideoDoubleResult(axios, {
            ...options,
            Authorization,
            activityId: activity.activityId,
            winningRecordId: result.data.winningRecordId
          })
        }
      }

      console.log('等待15秒再继续')
      await new Promise((resolve, reject) => setTimeout(resolve, 15 * 1000))

    } while (freeTimes || advertTimes)
  },
  lookVideoDouble: async (axios, options) => {
    let params = {
      'arguments1': 'AC20200611152252', // acid
      'arguments2': 'GGPD', // yhChannel
      'arguments3': '627292f1243148159c58fd58917c3e67', // yhTaskId menuId
      'arguments4': new Date().getTime(), // time
      'arguments6': '517050707',
      'netWay': 'Wifi',
      'version': `android@8.0100`
    }
    params['sign'] = sign([params.arguments1, params.arguments2, params.arguments3, params.arguments4])
    let { num, jar } = await require('./taskcallback').query(axios, {
      ...options,
      params
    })

    if (!num) {
      console.log('签到小游戏摇摇乐不倒翁: 今日已完成')
      return
    }

    params = {
      'arguments1': 'AC20200611152252', // acid
      'arguments2': 'GGPD', // yhChannel
      'arguments3': '627292f1243148159c58fd58917c3e67', // yhTaskId menuId
      'arguments4': new Date().getTime(), // time
      'arguments6': '',
      'arguments7': '',
      'arguments8': '',
      'arguments9': '',
      'orderId': crypto.createHash('md5').update(new Date().getTime() + '').digest('hex'),
      'netWay': 'Wifi',
      'remark': '签到小游戏摇摇乐不倒翁',
      'version': `android@8.0100`,
      'codeId': 945689604
    }
    params['sign'] = sign([params.arguments1, params.arguments2, params.arguments3, params.arguments4])
    await require('./taskcallback').doTask(axios, {
      ...options,
      params,
      jar
    })
  },
  lookVideoDoubleResult: async (axios, options) => {
    let { Authorization, activityId, winningRecordId } = options
    const useragent = `Mozilla/5.0 (Linux; Android 7.1.2; SM-G977N Build/LMY48Z; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/75.0.3770.143 Mobile Safari/537.36; unicom{version:android@8.0100,desmobile:${options.user}};devicetype{deviceBrand:samsung,deviceModel:SM-G977N};{yw_code:}`
    let res = await axios.request({
      headers: {
        "Authorization": `Bearer ${Authorization}`,
        "user-agent": useragent,
        "referer": "https://img.jf.10010.com/",
        "origin": "https://img.jf.10010.com"
      },
      url: `https://m.jf.10010.com/jf-yuech/api/gameResult/doublingIntegral?activityId=${activityId}&winningRecordId=${winningRecordId}`,
      method: 'get'
    })
    result = res.data
    if (result.code !== 0) {
      console.log("摇一摇送好礼翻倍结果:", result.message)
    } else {
      console.log("摇一摇送好礼翻倍结果:", result.data)
    }
  }
}

module.exports = dailyYYY