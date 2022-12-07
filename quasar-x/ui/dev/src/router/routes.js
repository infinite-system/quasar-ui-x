import pages from './pages'
import XDialog from '../../../src/x/dialog/XDialog.vue'

const playerInstance = function (show) {
  return to => ({
    // modelValue: show,
    id: 'BigPlayer',
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
            // if (!window.__isInitialLoad){
              route.back()
            // }
          }
        }
      }
    },
    load: () => import('../components/BigPlayer.vue'),
    // props: { fold: !show },
    data: to.meta?.data ?? {},
  })
}

const children = pages.map(page => {

  const route = {
    path: page.path,
    component: () => import('pages/' + page.file + '.vue')
  }

  if (page.file === 'XDialogYMM') {
    Object.assign(route, {
      name: 'x-dialog-youtube-music-mobile',
      children: [
        {
          path: '',
          name: 'home',
          components: {
            default: () => import('../components/Home.vue'),
            player: () => import('../components/YMXDialogProxyComponent.vue'),
          },
          props: {
            default: {},
            player: {
              dialog: {
                props: {
                  // fold:true
                }
              }
            }
          }
        },
        {
          path: 'watch',
          name: 'watch',
          components: {
            default: () => import('../components/Watch.vue'),
            player: () => import('../components/YMXDialogProxyComponent.vue'),
          },
          props: {
            default: {},
            player: {
              dialog: {
                options: { position: 'bottom'},
                props: {
                  // fold:false
                }
              }
            }
            // player: playerInstance(true)
          }
        },
        {
          path: 'explore',
          name: 'explore',
          components: {
            default: () => import('../components/Explore.vue'),
            player: () => import('../components/YMXDialogProxyComponent.vue'),
          },
          props: {
            default: {},
            player: {
              dialog: {
                // options: { position: 'right'},
                props: {
                  // fold:true
                }
              }
            },
          }
        },
        {
          path: 'library',
          name: 'library',
          components: {
            default: () => import('../components/Library.vue'),
            player: () => import('../components/YMXDialogProxyComponent.vue'),
          },
          props: {
            default: {},
            player: {
              dialog: {
                props: {
                  // fold:true
                }
              }
            }
          }
        }
      ]
    })
  }

  if (page.file === 'XDialogYMD') {

    Object.assign(route, {
      name: 'x-dialog-youtube-music-desktop',
      children: [
        {
          path: '',
          name: 'ymd-home',
          components: {
            default: () => import('../components/Home.vue'),
          },
          props: {
            default: {},
          }
        },
        {
          path: 'watch',
          name: 'ymd-watch',
          components: {
            default: () => import('../components/Watch.vue'),
            player: () => import('../components/YMXDialogProxyComponent.vue'),
          },
          props: {
            default: {},
            // player: playerInstance(true)
          }
        },
        {
          path: 'explore',
          name: 'ymd-explore',
          components: {
            default: () => import('../components/Explore.vue'),
          },
          props: {
            default: {},
          }
        },
        {
          path: 'library',
          name: 'ymd-library',
          components: {
            default: () => import('../components/Library.vue'),
          },
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
