const permission = {
  state: {
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
    }
  },
  actions: {
    GenerateRoutes ({ commit }, data) {
      return new Promise(resolve => {
        commit('SET_ROUTERS', data)
        resolve()
      })
    }
  }
}

export default permission
