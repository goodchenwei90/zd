import api from './index'
import { axios } from '@/utils/request'

/**
 * login func
 * parameter: {
 *     username: '',
 *     password: '',
 *     remember_me: true,
 *     captcha: '12345'
 * }
 * @param parameter
 * @returns {*}
 */
export function login (parameter) {
  return axios({
    url: 'tlogin',
    method: 'post',
    data: parameter
  })
}

export function getSmsCaptcha (parameter) {
  return axios({
    url: 'sendSms',
    method: 'post',
    data: parameter
  })
}

export function getInfo (params) {
  return axios({
    url: 'getTeacherInfo',
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    params: params
  })
}

export function logout (params) {
  return axios({
    url: 'logout',
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    params: params
  })
}
