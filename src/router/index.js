import Vue from 'vue'
import Router from 'vue-router'
import { constantRouterMap, asyncRouterMap, notFoundRouterMap } from '@/config/router.config'

Vue.use(Router)

export default new Router({
  // history需要容器配置404跳转
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior: () => ({ y: 0 }),
  // 分三个路由数组
  routes: constantRouterMap.concat(asyncRouterMap).concat(notFoundRouterMap)
})
