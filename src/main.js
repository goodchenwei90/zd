// ie polyfill
import '@babel/polyfill'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/'
import { VueAxios } from './utils/request'

import bootstrap from './core/bootstrap'
import './core/lazy_use'
import './utils/filter'

import MetaInfo from 'vue-meta-info' // global filter
Vue.config.productionTip = false
Vue.use(MetaInfo)
// mount axios Vue.$http and this.$http
Vue.use(VueAxios)

new Vue({
  router,
  store,
  created () {
    bootstrap()
  },
  mounted () {
    // build打开
    document.dispatchEvent(new Event('render-event'))
  },
  render: h => h(App)
}).$mount('#app')
