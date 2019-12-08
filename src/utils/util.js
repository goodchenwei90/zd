import { JSEncrypt } from 'jsencrypt'
import { PUBLIC_KEY } from '@/store/mutation-types'
export function timeFix() {
  const time = new Date()
  const hour = time.getHours()
  return hour < 9 ? '早上好' : hour <= 11 ? '上午好' : hour <= 13 ? '中午好' : hour < 20 ? '下午好' : '晚上好'
}

export function welcome() {
  const arr = ['休息一会儿吧', '准备吃什么呢?', '要不要打一把 DOTA', '我猜你可能累了']
  const index = Math.floor(Math.random() * arr.length)
  return arr[index]
}
/**
 * 触发 window.resize
 */
export function triggerWindowResizeEvent() {
  const event = document.createEvent('HTMLEvents')
  event.initEvent('resize', true, true)
  event.eventType = 'message'
  window.dispatchEvent(event)
}

export function handleScrollHeader(callback) {
  let timer = 0

  let beforeScrollTop = window.pageYOffset
  callback = callback || function () { }
  window.addEventListener(
    'scroll',
    event => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let direction = 'up'
        const afterScrollTop = window.pageYOffset
        const delta = afterScrollTop - beforeScrollTop
        if (delta === 0) {
          return false
        }
        direction = delta > 0 ? 'down' : 'up'
        callback(direction)
        beforeScrollTop = afterScrollTop
      }, 50)
    },
    false
  )
}

/**
 * Remove loading animate
 * @param id parent element id or class
 * @param timeout
 */
export function removeLoadingAnimate(id = '', timeout = 1500) {
  if (id === '') {
    return
  }
  setTimeout(() => {
    document.body.removeChild(document.getElementById(id))
  }, timeout)
}

export function numToChinese(num) {

  let changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']; //changeNum[0] = "零"
  let unit = ["", "十", "百", "千", "万"];
  num = parseInt(num);
  let getWan = (temp) => {
    let strArr = temp.toString().split("").reverse();
    let newNum = "";
    for (var i = 0; i < strArr.length; i++) {
      newNum = (i == 0 && strArr[i] == 0 ? "" : (i > 0 && strArr[i] == 0 && strArr[i - 1] == 0 ? "" : changeNum[strArr[i]] + (strArr[i] == 0 ? unit[0] : unit[i]))) + newNum;
    }
    return newNum;
  }
  let overWan = Math.floor(num / 10000);
  let noWan = num % 10000;
  if (noWan.toString().length < 4) noWan = "0" + noWan;
  return overWan ? getWan(overWan) + "万" + getWan(noWan) : getWan(num);
}

export function getSubjectMsg(subject) {
  var subjectQuery = '';
  switch (subject) {
    case 1:
      subjectQuery = '数学'
      break;
    case 2:
      subjectQuery = '物理'
      break;
    case 3:
      subjectQuery = '化学'
      break;
    case 4:
      subjectQuery = '英语'
      break;
    case 5:
      subjectQuery = '生物'
      break;
    case 6:
      subjectQuery = '地理'
      break;

    case 7:
      subjectQuery = '语文'
      break;

    case 8:
      subjectQuery = '历史'
      break;
    case 8:
      subjectQuery = '政治'
      break;
    default:
      break;
  }
  return subjectQuery
}

export function entrypt (val) {
  var encrypt = new JSEncrypt()
  encrypt.setPublicKey(PUBLIC_KEY)
  var data = encrypt.encrypt(val + '')
  return data
}

export function compare (origin, target) {
  if (typeof target !== 'object') {
    return origin === target
  }

  if (typeof origin !== 'object') {
    return false
  }
  for (const key of Object.keys(target)) {
    // 遍历target的所有自身属性的key
    if (!compare(origin[key], target[key])) {
      // 递归比较key对应的value，
      // value不等，则两对象不等，结束循环，退出函数，返回false
      return false
    }
  }
  return true
}


export function GetPercent(num, total) {
  num = parseFloat(num);
  total = parseFloat(total);
  if (isNaN(num) || isNaN(total)) {
      return "-";
  }
  return total <= 0 ? "0%" : (Math.round(num / total * 10000) / 100.00) + "%";
}
