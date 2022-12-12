import pages from './pages'
import XDialog from '../../../src/x/dialog/XDialog.vue'


const children = pages.map(page => {

  const route = {
    path: page.path,
    component: () => import('pages/' + page.file + '.vue')
  }

  if (page.file === 'XDialogYmMobile') {

    Object.assign(route, {
      name: 'x-dialog-youtube-music-mobile',
      children: [
        {
          path: '',
          name: 'home',
          components: {
            default: () => import('src/components/YmMobile/Home.vue'),
            player: () => import('src/components/YmMobile/XDialogProxy.vue'),
            search: () => import('src/components/YmMobile/XDialogProxy.vue'),
          },
          props: {
            default: {},
            player: { dialog: {} },
          }
        },
        {
          path: 'watch',
          name: 'watch',
          components: {
            default: () => import('src/components/YmMobile/Watch.vue'),
            player: () => import('src/components/YmMobile/XDialogProxy.vue'),
            search: () => import('src/components/YmMobile/XDialogProxy.vue'),
          },
          props: {
            default: {},
            player: { dialog: {} },
          }
        },
        {
          path: 'explore',
          name: 'explore',
          components: {
            default: () => import('src/components/YmMobile/Explore.vue'),
            player: () => import('src/components/YmMobile/XDialogProxy.vue'),
            search: () => import('src/components/YmMobile/XDialogProxy.vue'),
          },
          props: {
            default: {},
            player: { dialog: {} },
          }
        },
        {
          path: 'library',
          name: 'library',
          components: {
            default: () => import('src/components/YmMobile/Library.vue'),
            player: () => import('src/components/YmMobile/XDialogProxy.vue'),
            search: () => import('src/components/YmMobile/XDialogProxy.vue'),
          },
          props: {
            default: {},
            player: { dialog: {} },
          }
        },
        {
          path: 'search',
          name: 'search',
          components: {
            default: () => import('src/components/YmMobile/Search.vue'),
            player: () => import('src/components/YmMobile/XDialogProxy.vue'),
            search: () => import('src/components/YmMobile/XDialogProxy.vue'),
          },
          props: {
            default: {},
            player: { dialog: {} },
            search: { dialog: {} }
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
