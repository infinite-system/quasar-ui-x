import pages from './pages'

const children = pages.map(page => {

  const route = {
    path: page.path,
    component: () => import('pages/' + page.file + '.vue')
  }

  if (page.file === 'XDialogYmMobile') {

    const XDialogProxy = () => import('src/components/YmMobile/XDialogExtended/XDialogProxy.vue')

    const DialogProxies = {
      menu: XDialogProxy,
      player: XDialogProxy,
      search: XDialogProxy,
      account: XDialogProxy,
    }

    Object.assign(route, {
      name: 'x-dialog-ym-mobile',
      children: [
        {
          path: '',
          name: 'home',
          components: {
            default: () => import('src/components/YmMobile/Home.vue'),
            ...DialogProxies
          },
          props: {
            default: {},
          }
        },
        {
          path: 'watch',
          name: 'watch',
          components: {
            default: () => import('src/components/YmMobile/Watch.vue'),
            ...DialogProxies
          },
          props: {
            default: {},
          }
        },
        {
          path: 'explore',
          name: 'explore',
          components: {
            default: () => import('src/components/YmMobile/Explore.vue'),
            ...DialogProxies
          },
          props: {
            default: {},
          }
        },
        {
          path: 'library',
          name: 'library',
          components: {
            default: () => import('src/components/YmMobile/Library.vue'),
            ...DialogProxies
          },
          props: {
            default: {},
          }
        },
        {
          path: 'search',
          name: 'search',
          components: {
            default: () => import('src/components/YmMobile/Search.vue'),
            ...DialogProxies
          },
          props: {
            default: {},
          }
        },
        {
          path: 'account/:part*',
          name: 'account',
          components: {
            default: () => import('src/components/YmMobile/Account.vue'),
            ...DialogProxies
          },
          props: {
            default: {},
          }
        },
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
