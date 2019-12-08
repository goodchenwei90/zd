import { axios } from '@/utils/request'

const api = {
  btree: 'basicKnowTreeList',
  search: 'search'
}

export default api

export function getBasicKnowTreeList (parameter) {
  return axios({
    url: api.btree,
    method: 'get',
    params: parameter
  })
}

export function search (parameter) {
  return axios({
    url: api.search,
    method: 'post',
    data: parameter
  })
}
export function getQuestionInfo (id, subject) {
  return axios({
    url: 'getQue/' + id + '/' + subject,
    method: 'get',
    params: {}
  })
}

export function getQuestionList (parameter) {
  return axios({
    url: 'getQueList',
    method: 'get',
    params: parameter
  })
}

export function queryTestInfo (parameter) {
  return axios({
    url: 'queryTestInfo',
    method: 'get',
    params: parameter
  })
}
export function zujuan (parameter) {
  return axios({
    url: 'zujuan',
    method: 'post',
    data: parameter
  })
}
export function queryTeacherTestInfo (parameter) {
  return axios({
    url: 'queryTeacherTestInfo',
    method: 'get',
    params: parameter
  })
}
export function deleteTeacherTestInfo (parameter) {
  return axios({
    url: 'deleteTeacherTestInfo',
    method: 'get',
    params: parameter
  })
}
// 获取试卷下试题
export function getTestRelQuest (parameter) {
  return axios({
    url: 'getTestRelQuest',
    method: 'post',
    data: parameter
  })
}
// 打印
export function printTest (parameter, call) {
  return axios({
    url: 'printTest',
    method: 'post',
    data: parameter,
    responseType: 'blob',
    headers: {
      'responseType': 'blob'
    },
    onDownloadProgress (a) {
      call(a)
    }
  })
}
// 打印错题本
export function printCtb (parameter, call) {
  return axios({
    url: 'printCtb',
    method: 'post',
    data: parameter,
    responseType: 'blob',
    headers: {
      'responseType': 'blob'
    },
    onDownloadProgress (a) {
      call(a)
    }
  })
}
// 获取校区学生
export function getStudents (parameter) {
  return axios({
    url: 'getWebStudents',
    method: 'post',
    data: parameter
  })
}
// 学生错题信息
export function getCtbList (parameter) {
  return axios({
    url: 'getWEBCtbList',
    method: 'get',
    params: parameter
  })
}
export function buildIndex (parameter) {
  return axios({
    url: 'buildIndex',
    method: 'get',
    params: parameter
  })
}

export function changeTeaPwd (parameter) {
  return axios({
    url: 'teacherCHGPWD',
    method: 'post',
    data: parameter
  })
}

export function suggestBS (parameter) {
  return axios({
    url: 'suggest/bs',
    method: 'post',
    data: parameter
  })
}

export function getGovSchool (parameter) {
  return axios({
    url: 'getGovSchool',
    method: 'post',
    data: parameter
  })
}

export function updateZujuan (parameter) {
  return axios({
    url: 'updateZujuan',
    method: 'post',
    data: parameter
  })
}
export function register (parameter) {
  return axios({
    url: 'register',
    method: 'post',
    data: parameter
  })
}
export function getPayCode (parameter) {
  return axios({
    url: 'unifiedorder',
    method: 'post',
    responseType: 'blob',
    headers: {
      'responseType': 'blob'
    },
    data: parameter
  })
}
// 下单
export function order (parameter) {
  return axios({
    url: 'order',
    method: 'post',
    data: parameter
  })
}
export function getProduct (parameter) {
  return axios({
    url: 'getProduct',
    method: 'get',
    params: parameter
  })
}
export function getPayResult (parameter) {
  return axios({
    url: 'getPayResult',
    method: 'get',
    params: parameter
  })
}
export function getPayResultList (parameter) {
  return axios({
    url: 'getPayResultList',
    method: 'post',
    data: parameter
  })
}
