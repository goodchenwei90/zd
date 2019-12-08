import Vue from 'vue'
import axios from 'axios'
import store from '@/store'
import Qs from 'qs'
import {
  VueAxios
} from './axios'
import notification from 'ant-design-vue/es/notification'
import {
  ACCESS_TOKEN, MD5KEY, APIBASEURL
} from '@/store/mutation-types'
import md5 from 'md5'
import uuid from 'uuid/v1'

// 创建 axios 实例
const service = axios.create({
  baseURL: APIBASEURL, // api base_url
  timeout: 16000 // 请求超时时间
})

const err = (error) => {
  store.state.loadding = false
  if (error.response) {
    const data = error.response.data
    const token = Vue.ls.get(ACCESS_TOKEN)
    if (error.response.status === 403) {
      notification.error({
        message: 'Forbidden',
        description: data.message
      })
    }
    if (error.response.status === 401 && !(data.result && data.result.isLogin)) {
      notification.error({
        message: 'Unauthorized',
        description: 'Authorization verification failed'
      })
      if (token) {
        store.dispatch('Logout').then(() => {
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        })
      }
    }
  }
  return Promise.reject(error)
}

// request interceptor
service.interceptors.request.use(config => {
  store.state.loadding = true
  const token = Vue.ls.get(ACCESS_TOKEN)
  if (token) {
    config.headers['Access-Token'] = token // 让每个请求携带自定义 token 请根据实际情况自行修改
  }
  const method = config.method.toLowerCase()
  var RHS = uuid()
  var RHV = '1.0'
  var RHTL = new Date().getTime()
  var requestUrl = APIBASEURL + config.url + '?RHV=' + RHV + '&RHS=' + RHS + '&RHTL=' + RHTL
  var defaultParam = {
    RHV: RHV,
    RHS: RHS,
    RHTL: RHTL
  }
  if (method === 'get') {
    Object.assign(defaultParam, config.params)
    // 遍历config.params
    for (const pro in config.params) {
       requestUrl = requestUrl + '&' + pro + '=' + encodeURI(config.params[pro])      
    }
    var authKey = md5(requestUrl + MD5KEY)
    defaultParam.authKey = authKey
    config.params = defaultParam
  } else if (method === 'post') {
    Object.assign(defaultParam, config.data)
    defaultParam.authKey = md5(requestUrl + MD5KEY)
    config.data = defaultParam

    config.transformRequest = [
      function (data) {
        // 对 data 进行任意转换处理
        return Qs.stringify(data)
      }
    ]
  }
  return config
}, err)

// response interceptor
service.interceptors.response.use((response) => {
  store.state.loadding = false
  if (response.data) {
    if (response.data.ret) {
      // 3000==其他地方登陆过
      if (response.data.ret === 3000 || response.data.ret === 3001) {
        store.dispatch('RemoveToken')
        // 需要登录
        store.dispatch('setStatus', 1)
      } else if (response.data.ret === 3002) {
        // 帐号到期,设置1 弹出续费
        notification.error({
          message: '购买提示',
          description: '您的帐号已到期，请续费'
        })
      }
    }
  }
  return response.data
}, err)

const installer = {
  vm: {},
  install(Vue) {
    Vue.use(VueAxios, service)
  }
}

export {
  installer as VueAxios,
  service as axios
}
