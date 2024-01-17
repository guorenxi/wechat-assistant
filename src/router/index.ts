import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/home.vue'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import { checkLogin } from '../api/index'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    children: [
      {
        path: '/dashboard',
        name: '看板',
        component: () =>
          import(/* webpackChunkName: "dashboard" */ '../views/dashboard.vue')
      },
      {
        path: '/contact',
        name: 'Contact',
        meta: {
          title: '联系人'
        },
        component: () =>
          import(/* webpackChunkName: "contact" */ '../views/contact.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    meta: {
      title: '登录'
    },
    component: () =>
      import(/* webpackChunkName: "login" */ '../views/login.vue')
  },
  {
    path: '/403',
    name: '403',
    meta: {
      title: '没有权限'
    },
    component: () => import(/* webpackChunkName: "403" */ '../views/403.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  NProgress.start()

  const loginRes = await checkLogin()

  if (loginRes.code != 1) {
    next('/login')
    return
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router