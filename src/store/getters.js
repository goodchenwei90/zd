
const getters = {
  device: state => state.app.device,
  theme: state => state.app.theme,
  color: state => state.app.color,
  token: state => state.user.token,
  userStatus: state => state.user.status,
  avatar: state => state.user.avatar,
  nickname: state => state.user.name,
  welcome: state => state.user.welcome,
  roles: state => state.user.roles,
  userInfo: state => state.user.info,
  addRouters: state => state.permission.addRouters,
  multiTab: state => state.app.multiTab,
  zujuanTotal: state => state.zujuan.total,
  zujuanItem: state => state.zujuan.item,
  zujuanIds: state => state.zujuan.ids
}

export default getters
