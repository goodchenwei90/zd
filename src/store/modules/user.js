import Vue from 'vue'
import { login, getInfo, logout } from '@/api/login'
import { ACCESS_TOKEN } from '@/store/mutation-types'

const user = {
  state: {
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {},
    // 0：初始化，1：未登录或被挤出 2：已登录
    status: 0,
    expirytime: 0
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    },
    SET_STATUS: (state, status) => {
      state.status = status
    },
    SET_EXPIRYTIME: (state, expirytime) => {
      state.expirytime = expirytime
    }
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(response => {
          const ret = response.ret
          if (ret === 0 && response.datas) {
            const result = response.datas
            Vue.ls.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
            commit('SET_TOKEN', result.token)
            commit('SET_INFO', response.datas)
            commit('SET_STATUS', 2)
          }
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        getInfo({}).then(response => {
          const ret = response.ret
          if (ret === 0 && response.datas) {
            const result = response.datas
            commit('SET_INFO', result)
          }
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout({}).then((response) => {
           // 不管后台是否成功
           Vue.ls.remove(ACCESS_TOKEN)
           commit('SET_TOKEN', '')
           commit('SET_INFO', {})
           commit('SET_ROLES', [])
           commit('SET_STATUS', 0)
          resolve(response)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    // remove token
    RemoveToken ({ commit, state }) {
      return new Promise((resolve) => {
        commit('SET_TOKEN', '')
        commit('SET_INFO', {})
        commit('SET_ROLES', [])
        commit('SET_STATUS', 0)
        Vue.ls.remove(ACCESS_TOKEN)
        resolve()
      })
    },
    setStatus ({ commit, state }, val) {
      return new Promise((resolve) => {
        commit('SET_STATUS', val)
        resolve()
      })
    },
    setExpirytime ({ commit, state }, val) {
      return new Promise((resolve) => {
        commit('SET_EXPIRYTIME', val)
        resolve()
      })
    }

  }
}

export default user
