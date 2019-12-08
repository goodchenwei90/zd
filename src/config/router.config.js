// eslint-disable-next-line
import { UserLayout, BasicLayout, RouteView, BlankLayout, PageView } from '@/layouts'
import { bxAnaalyse } from '@/core/icons'

export const asyncRouterMap = [
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: '首页' },
    redirect: '/index',
    children: [
      {
        path: '/dashboard',
        name: 'dashboard',
        redirect: '/index',
        component: RouteView,
        hideChildrenInMenu: true,
        meta: { title: '知识点挑题', keepAlive: true, icon: bxAnaalyse },
        children: [
          {
            path: '/index',
            name: 'Workplace',
            component: resolve => require(['@/views/dashboard/Workplace'], resolve),
            meta: { title: '学科', keepAlive: true }
          }
        ]
      },
      /** 试卷中心 */
      {
        path: '/testcenter',
        name: 'testcenter',
        component: RouteView,
        redirect: '/test/list',
        meta: { title: '试卷中心', icon: 'book' },
        hideChildrenInMenu: true,
        children: [
          {
            path: '/test/list',
            name: 'testlist',
            component: resolve => require(/* webpackChunkName: "sj" */['@/views/dashboard/testinfo'], resolve),
            meta: { title: '列表' }
          },
          {
            path: '/test/qlist',
            name: 'testqlist',
            component: resolve => require(/* webpackChunkName: "sj" */['@/views/dashboard/testreqquest'], resolve),
            meta: { title: '试题列表' }
          }
        ]
      },
      {
        path: '/search',
        name: 'search',
        component: RouteView,
        redirect: '/search/list',
        meta: { title: '试题搜索', icon: 'search' },
        hideChildrenInMenu: true,
        children: [
          {
            path: '/search/list',
            name: 'searchlist',
            component: resolve => require(/* webpackChunkName: "sj" */['@/views/dashboard/search'], resolve),
            meta: { title: '列表' }
          }
        ]
      },
      {
        path: '/zj',
        name: 'zj',
        component: RouteView,
        redirect: '/zj/info',
        meta: { title: '组卷中心', icon: 'cloud' },
        hideChildrenInMenu: true,
        children: [
          {
            path: '/zj/info',
            name: 'info',
            component: resolve => require(/* webpackChunkName: "sj" */['@/views/dashboard/zujuancenter'], resolve),
            meta: { title: '试题篮' }
          }
        ]
      }
    ]
  }
]
// 基礎路由
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult')
      }
    ]
  },
  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }
]
// 找不到跳转404
export const notFoundRouterMap = [
  {
    path: '*', redirect: '/404', hidden: true
  }
]
