import pages from './pages'
import XDialog from '../../../src/x/dialog/XDialog.vue'

const playerInstance = function (show) {
  return to => ({
    modelValue: show,
    id: 'WatchPlayer',
    router: 'watch',
    options: {
      position: 'bottom',
      seamless: true,
      noRouteDismiss: true,
      transitionShow: 'jump-up',
      ok: false
    },
    config: {
      dismiss: {
        redirect: {
          fn (route, router) {
            route.back()
          }
        }
      }
    },
    load: () => import('../components/WatchPlayer.vue'),
    data: to.meta?.data ?? {},
  })
}

const children = pages.map(page => {
  const route = {
    path: page.path,
    component: () => import('pages/' + page.file + '.vue')
  }

  if (page.file === 'XDialogRoutes') {
    Object.assign(route, {
      name: 'home',
      children: [
        {
          path: 'watch',
          name: 'watch',
          components: {
            default: () => import('../components/Library.vue'),
            player: XDialog
          },
          props: {
            default: {},
            player: playerInstance(true)
          }
        },
        {
          path: 'explore',
          name: 'explore',
          components: {
            default: () => import('../components/Explore.vue'),
            // player: XDialog
          },
          props: {
            default: {},
            // player: playerInstance(false)
          }
        }
      ]
    })
  }

  return route
})

const routes = [
  {
    path: '/',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') }
    ].concat(children)
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
