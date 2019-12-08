import Vue from 'vue'
import { ZUJUAN_DATAKEY } from '@/store/mutation-types'
/**
 * 存放试题ID和题型数量
 */
const zujuan = {
  state: {
    total: 0,
    // 换一题选中的ID
    item: [{
      count: 0, title: '选择题', type: 1, list: [], index: 1
    },
    {
      count: 0, title: '填空题', type: 2, list: [], index: 2
    },
    {
      count: 0, title: '计算题', type: 4, list: [], index: 3
    },
    {
      count: 0, title: '解答题', type: 5, list: [], index: 4
    },
    {
      count: 0, title: '实验与探究题', type: 6, list: [], index: 5
    },
    {
      count: 0, title: '综合题', type: 7, list: [], index: 6
    },
    {
      count: 0, title: '作图、实验、探究题', type: 8, index: 7, list: []
    },
    {
      count: 0, title: '简答题', type: 9, list: [], index: 8
    },
    {
      count: 0, title: '判断题', type: 11, list: [], index: 9
    },
    {
      count: 0, title: '应用题', type: 12, list: [], index: 10
    },
    {
      count: 0, title: '完形填空', type: 20, list: [], index: 12
    },
    {
      count: 0, title: '阅读理解', type: 21, list: [], index: 13
    },
    {
      count: 0, title: '翻译', type: 22, list: [], index: 14
    },
    {
      count: 0, title: '多选', type: 10, list: [], index: 15
    },
    {
      count: 0, title: '其他', type: 99, list: [], index: 11
    }
    ],
    ids: []
  },

  mutations: {
    SET_TOTAL: (state, total) => {
      state.total = total
    },
    SET_ITEM: (state, item) => {
      state.item = item
    },
    SET_IDS: (state, ids) => {
      state.ids = ids
    }
  },

  actions: {
    // 从本地加载数据到state
    lsloadtostate({ commit, state }) {
      return new Promise((resolve) => {
        if (Vue.ls.get(ZUJUAN_DATAKEY)) {
          if (Vue.ls.get(ZUJUAN_DATAKEY).ids) {
            state.ids = Vue.ls.get(ZUJUAN_DATAKEY).ids
          }
          if (Vue.ls.get(ZUJUAN_DATAKEY).total) {
            state.total = Vue.ls.get(ZUJUAN_DATAKEY).total
          }
          if (Vue.ls.get(ZUJUAN_DATAKEY).item) {
            state.item = Vue.ls.get(ZUJUAN_DATAKEY).item
          }
        }
        resolve()
      })
    },

    clearZujuanAll({ commit, state }) {
      return new Promise((resolve) => {
        commit('SET_TOTAL', 0)
        state.item.forEach(zjItem => {
          zjItem.count = 0
          if (zjItem.list) {
            zjItem.list = []
          }
        })

        commit('SET_ITEM', state.item)
        commit('SET_IDS', [])

        var zujuandata = { total: state.total, item: state.item, ids: state.ids }
        Vue.ls.set(ZUJUAN_DATAKEY, zujuandata, 7 * 24 * 60 * 60 * 1000)
        resolve()
      })
    },
    // 换一题
    changeAnther({ commit, state }, changeArr) {
      return new Promise((resolve) => {
        state.item.forEach(item => {
          if (item.list) {
            var index = 0
            item.list.forEach(it => {
              if (it.id === changeArr.oldId) {
                var q = changeArr.q
                q.index = (index + 1)
                item.list.splice(index, 1, changeArr.q)
                var index2 = state.ids.indexOf(changeArr.oldId)
                state.ids.splice(index2, 1, changeArr.q.id)
                return
              }
              index++
            })
          }
        })
        commit('SET_ITEM', state.item)
        commit('SET_IDS', state.ids)

        var zujuandata = { total: state.total, item: state.item, ids: state.ids }
        Vue.ls.set(ZUJUAN_DATAKEY, zujuandata, 7 * 24 * 60 * 60 * 1000)
        resolve()
      })
    },
    updateCount({ commit, state }, question) {
      return new Promise((resolve) => {
        // 判断试题是否加入
        var isExist = false
        state.ids.forEach(id => {
          if (id === question.id) {
            isExist = true
            state.total = state.total - 1
            var index = state.ids.indexOf(question.id)
            state.ids.splice(index, 1)
            state.item.forEach(il => {
              if (!il.type) { il.type = 99 }
              if (il.type + '' === question.type + '') {
                il.count = il.count - 1
                // 移除
                var tindex = 0
                il.list.forEach(r => {
                  if (r.id === question.id) {
                    il.list.splice(tindex, 1)
                  }
                  tindex++
                })
              }
            })
          }
        })

        if (isExist === false) {
          state.total = state.total + 1
          state.ids.push(question.id)
          state.item.forEach(il => {
            if (!il.type) {
              // 其他
              il.type = 99
            }
            if (il.type + '' === question.type + '') {
              il.count = il.count + 1
              il.list.push(question)
            }
          })
        }
        commit('SET_TOTAL', state.total)
        commit('SET_ITEM', state.item)
        commit('SET_IDS', state.ids)

        // 存入本地数据
        var zujuandata = { total: state.total, item: state.item, ids: state.ids }
        Vue.ls.set(ZUJUAN_DATAKEY, zujuandata, 7 * 24 * 60 * 60 * 1000)
        resolve()
      })
    }
  }
}

export default zujuan
