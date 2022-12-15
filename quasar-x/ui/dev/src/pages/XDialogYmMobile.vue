<script setup>
import { computed, onMounted, ref, watch, reactive, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useX, extend } from "#/x/utils";
import {
  XDialogPluginStyle as $style,
  XDialogPluginMove as $move
} from "#/x/dialog/XDialogPlugins";
import { QBtn, useQuasar } from 'quasar'
import Plyr from 'plyr'
import data from 'src/assets/YoutubeItems.json'
import { kebabToPascalCase } from "../../../src/x/utils/strings.js";
import { isArray } from "../../../src/x/utils.js";

const $x = useX()
const $q = useQuasar()

const route = useRoute()
const router = useRouter()

let Menu, Player, Search, Account, Settings

onBeforeUnmount(() => {
  Player?.destroy()
  Menu?.destroy()
  Search?.destroy()
  Account?.destroy()
  Settings?.destroy()
})

const bgRouterView = ref(null)
const routedDialog = computed(() => bgRouterView.value ? resolve(bgRouterView.value) : route)

function $wide ({ $style = '$style' } = {}) {

  return (dialog, name) => {
    dialog[$style](`<style>
      .x-dialog.wide .x-dialog-plugin-load {
        border-radius: 0;
        width: 100vw !important;
      }

      .x-dialog.wide .q-dialog__inner--minimized {
        padding:0;
      }

     .x-dialog.wide .q-dialog__inner--minimized > div {
       max-width: 100vw !important;
       width: 100vw !important;
       max-height: 100vh !important;
     }
    </style>`)

    dialog.update({
      class: `${dialog.xClass()} wide`,
    });
  }
}

function $player ({ $style = '$style' } = {}) {

  return (dialog, name) => {

    dialog[$style](`<style>
      .x-dialog.player .x-dialog-plugin-load {
        -webkit-box-shadow: 0 0 4px -1px rgba(0,0,0,0.33);
        box-shadow: 0 0 4px -1px rgba(0,0,0,0.33);
      }

      .x-dialog.player .x-dialog-plugin-load {
        overflow: inherit; /* makes knob visible on folded player */
      }
    </style>`)

    dialog.update({
      class: `${dialog.xClass()} player`,
    });

  }
}

const storage = {
  get: (key) => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {}
  },
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value))
}

const session = {
  get: (key) => {
    try {
      return JSON.parse(sessionStorage.getItem(key));
    } catch (e) {}
  },
  set: (key, value) => sessionStorage.setItem(key, JSON.stringify(value))
}

const app = {
  history: 'push', // 'replace' | 'push'
  home: { name: 'home' },
  dialogViews: ['watch', 'search', 'user', 'account', 'settings', 'switch']
}

const player = reactive({
  position: 0,
  item: storage.get('player.item'),
  view: storage.get('player.item') ? 'folded' : 'hidden',
  setItem: false
})

const menu = {
  id: 'Menu',
  options: {
    position: 'bottom',
    seamless: true,
    ok: false
  },
  load: () => import('../components/YmMobile/Dialogs/Menu.vue'),
  props: { player, go },
  onLoad: () => {
    setInterval(() => {
      player.position += 1
      if (player.position >= 500) {
        player.position = 0
      }
    }, 250)
  },
  plugins: {
    $style,
    $wide: $wide(),
  },
}

const beforeWatchPath = ref('')
const playerDialog = {
  id: 'Player',
  router: 'watch',
  debug: false,
  options: {
    position: 'bottom',
    seamless: true,
    noRouteDismiss: true,
    transitionShow: 'jump-up',
    ok: false
  },
  onHide: () => {
    player.view = 'hidden'
  },
  config: {
    dismiss: {
      redirect: {
        on: false
      }
    }
  },
  load: import('src/components/YmMobile/Dialogs/Player.vue'),
  props: {
    app,
    player,
    beforeWatchPath,
    freezeView,
    go,
  },
  plugins: {
    $style,
    $wide: $wide(),
    $player: $player()
  }
}


function notDialogView (route) {
  // route is not 'watch' and not all other dialog views, like 'search', 'user', etc.
  return !app.dialogViews.includes(route.name)
}

function onBackForward (fn) {
  // onBackForward history change
  // https://stackoverflow.com/a/58950454/1502706
  addEventListener('popstate', fn)
}

toggleDarkMode(storage.get('darkMode'))

onBackForward(() => {
  const current = resolve(currentPath())

  if (notDialogView(current)) {
    unfreezeView()
    setBeforeWatchPath(current.fullPath)
  }
})

onMounted(() => {

  const plyr = new Plyr('#plyr');

  if (notDialogView(route)) {
    setBeforeWatchPath(route.fullPath)
  }
})

watch(() => route.name, () => {
  if (route.name === 'watch') {
    player.view = 'full'
  } else {
    player.view = player.item ? 'folded' : 'hidden'
  }
}, { immediate: true })

watch(() => player.item, () => {
  if (!player.item) {
    player.view = 'hidden'
  }
  storage.set('player.item', player.item)
})

function goBeforeWatch () {
  console.log('beforeWatchPath.value', beforeWatchPath.value)
  return go(beforeWatchPath.value)
}

function goBack () {
  return router.back()
}

function goHome () {
  return go(app.home)
}

function goBackOrHome () {
  const back = history.state.back ? resolve(history.state.back) : null
  return back && !isDialogView(back)
    ? goBack()
    : goHome()
}

function isWatchView () {
  return route.name === 'watch'
}

function playerIsFoldingHiding () {
  return ['hidden', 'folded'].includes(player.view)
}

function playerFoldMoveHistory () {
  if (getBeforeWatchPath()) {
    return goBeforeWatch()
  } else {
    return goBackOrHome()
  }
}

watch(() => player.view, () => {

  if (player.view === 'hidden') {
    player.item = null
  }

  if (isWatchView() && playerIsFoldingHiding()) {
    playerFoldMoveHistory()
  }
})

function resolve (to) {
  return router.resolve(to)
}

function push (to) {
  to = resolve(to)

  if (to.name === 'watch') {
    player.setItem = true
  }

  return router.push(to)
}

function replace (to) {
  to = resolve(to)

  if (to.name === 'watch') {
    player.setItem = true
  }

  return router.replace(to)
}

function currentPath () {
  const { pathname, search, hash } = document.location
  const currentPath = pathname + search + hash
  console.log('currentPath', currentPath)
  return currentPath
}

function setBeforeWatchPath (to) {
  console.log('setBeforeWatchPath', to)
  session.set('beforeWatchPath', beforeWatchPath.value = to)
}

function getBeforeWatchPath () {
  return beforeWatchPath.value = session.get('beforeWatchPath')
}

function youtubeGo (to) {

  const watchToWatch = to.name === 'watch' && route.name === 'watch'

  return watchToWatch ? replace(to) : push(to)
}

function isDialogView (route) {
  return app.dialogViews.includes(route.name)
}

function go (to) {
  to = resolve(to)

  if (isDialogView(to)) {
    freezeView()
  } else {
    unfreezeView()
    setBeforeWatchPath(to.fullPath)
  }

  if (app.history === 'replace') {
    return youtubeGo()
  } else {
    return push(to)
  }
}

function mountPlayer (props) {
  extend(playerDialog, props)
  if (!Player) Player = $x.dialog(playerDialog)
}

const account = {
  modelValue: ref(false),
  id: 'Account',
  router: 'account',
  options: {
    maximized: true,
    fullWidth: true,
    fullHeight: true,
    position: 'right',
    noRouteDismiss: true,
    // seamless: true,
    ok: false
  },
  load: () => import('src/components/YmMobile/Dialogs/Account.vue'),
}


const settings = {
  modelValue: ref(true),
  load: ref(() => import(`src/components/YmMobile/Dialogs/Account/Settings.vue`)),
  debug: ['componentChanged'],
  id: 'Settings',
  router: 'account',
  options: reactive({
    class: '',
    position: 'right',
    noRouteDismiss: true,
    // seamless: true,
    ok: false
  }),
  props: { app, settingsBack },
  plugins: { $style }
}

const originalClass = settings.options.class
const accountRoute = 'account'

function normalizePart (route) {
  const part = route.params?.part || []
  return isArray(part) ? [...part] : [part]
}

function goUpOneLevel (routePart) {

  console.log('routePart:==', routePart)
  routePart.pop()
  return go({ name: accountRoute, params: { part: routePart } })
}

/**
 * Handle back button
 * @returns {*}
 */
function settingsBack () {

  const back = history.state.back ? router.resolve(history.state.back) : null

  // current settings route 'part' param
  let routePart = normalizePart(route)

  if (back) {

    // if back is not 'account'
    if (!isAccountView(back)) goUpOneLevel(routePart)

    // back history 'part' param
    let backPart = normalizePart(back)

    console.log('backPart', backPart, 'routePart', routePart)
    // back is 'settings' route, but up 1 level
    // for ex. 'settings/general/captions', up one level route
    // is 'settings/general', so just by going back we will
    // get desired history movement
    const backIsUpLevel = backPart.length < routePart.length
    return backIsUpLevel ? goBack() : goUpOneLevel(routePart)

  } else {
    // go up one level
    return goUpOneLevel(routePart)
  }
}

function goToAccount () {
  return go({ name: 'account' })
}

const hideAndDisableRedirect = {
  modelValue: { value: false },
  config: { dismiss: { redirect: { on: false } } }
}

function isAccountView (route) {
  return route.name === 'account'
}

function mountAccount () {

  if (route.name === 'account') {

    const accountDismissRedirectFn = ({ router }) => {
      const back = history.state.back ? resolve(history.state.back) : null
      return isAccountView(back) ? goHome() : goBack()
    }

    extend(account, {
      modelValue: { value: true },
      config: { dismiss: { redirect: { on: true, fn: accountDismissRedirectFn } } },
    })

    if (!Account) Account = $x.dialog(account)

    mountSettings()

  } else {
    unmount(account)
    unmount(settings)
  }
}

function mountSettings () {
  const routePart = normalizePart(route)

  console.log('routePart', routePart)

  function isNotAccountDescendant (route) {
    return route && route.name === 'account' && route.params.part.length === 0
  }

  if (routePart?.[0]) {

    const settingsDismissRedirectFn = ({ router }) => {
      const back = history.state.back ? resolve(history.state.back) : null
      return isNotAccountDescendant(back) ? goBack() : goToAccount()
    }

    // empty from previous component
    extend(settings, { load: { value: null } })

    const componentParts = [...routePart].map((value) => kebabToPascalCase(value))
    const component = kebabToPascalCase(componentParts.join('/'))


    if (!Settings) {
      Settings = $x.dialog(settings)
      Settings.$style(`<style>.x-dialog-plugin-load.narrow { min-width: 300px }</style>`)
    }

    let options = {}
    switch (routePart[0]) {
      case 'switch':
        options = { class: `${originalClass} narrow`, position: 'standard' }
        break;
      default:
        options = { class: `${originalClass}`, position: 'right' }
    }

    extend(settings, {
      modelValue: { value: true },
      config: { dismiss: { redirect: { on: true, fn: settingsDismissRedirectFn } } },
      load: { value: `components/YmMobile/Dialogs/Account/${component}` },
      options: options
    })

  } else {
    unmount(settings)
  }
}

function unmount (obj) {
  extend(obj, hideAndDisableRedirect)
}

const show = ref(true)

const options = reactive({
  maximized: false,
  fullWidth: true,
  fullHeight: true,
  position: 'right',
  seamless: true,
  ok: false
})

const load = ref(() => import('src/components/YmMobile/Dialogs/Search.vue'))

const props = reactive({
  go,
  reactiveProp: 'lalala',
  options: options
})

const config = reactive({
  dismiss: { redirect: { on: false } }
})

const search = {
  modelValue: ref(false),
  id: 'Search',
  router: 'search',
  options: options,
  load: load,
  onShow: ({ dialog }) => {
    dialog.$move('bottom')
  },
  props: props,
  plugins: { $move },
  config
}

function mountSearch () {

  if (route.name === 'search') {
    // search.modelValue.value = true
    extend(search, {
      modelValue: {
        value: true
      },
      options: {
        maximized: true
      },
      config: {
        dismiss: {
          redirect: {
            on: true,
            fn: ({ router }) => {
              return history.state.back ? router.back() : go(app.home)
            }
          }
        }
      },
      // props: { reactiveProp: 'yes '}
    })
    if (!Search) Search = $x.dialog(search)

  } else {

    // search.modelValue.value = false
    extend(search, {
      modelValue: { value: false, },
      options: { maximized: false },
      config: { dismiss: { redirect: { on: false } } },
      // props: { reactiveProp: 'aaaa '}
    })

  }
}


const isFrozenView = ref(false)

function freezeView (value) {

  // more info on this implementation
  // https://github.com/vuejs/vue-router/issues/703
  // https://github.com/vuejs/rfcs/blob/master/active-rfcs/0036-router-view-route-prop.md
  // https://github.com/vuejs/vue-router/issues/703#issuecomment-428123334

  if (!isFrozenView.value) {

    // save router-view state, make it static
    // it won't change with router change now
    bgRouterView.value = value || route.fullPath
    isFrozenView.value = true
  }
}

function unfreezeView () {

  if (isFrozenView.value) {
    // unfreeze router-view to be able to set it
    // from the router navigation
    bgRouterView.value = null
    isFrozenView.value = false
  }
}

const selectOptions = [
  'lalala',
  'blablabla'
]

const positionOptions = [
  'left',
  'right',
  'bottom',
  'top',
  'standard'
]

function toggleDarkMode (v, evt) {
  $q.dark.set(v)
  storage.set('darkMode', v)
}

function mountMenu () {
  if (!Menu) Menu = $x.dialog(menu)
}
</script>
<template>
  <q-layout view="hHh lpr fFf">
    <q-header :elevated="false" :class="$q.dark.isActive ? 'bg-dark' : 'bg-white' ">
      <q-toolbar>
        <q-toolbar-title>
          <div @click="go({ name: 'home' })" :class="['logo', { dark: $q.dark.isActive }]"></div>
        </q-toolbar-title>

        <div>
          <q-toggle
            v-model="$q.dark.isActive"
            :dark="false"
            :color="$q.dark.isActive ? 'black': 'grey-10'"
            keep-color
            checked-icon="dark_mode"
            unchecked-icon="light_mode"
            @update:model-value="toggleDarkMode" />
        </div>
        <q-btn flat @click="go({name:'search'})" round dense :color="$q.dark.isActive ? 'white' : 'black'"
               icon="sym_s_search" class="q-mr-xs" />
        <q-btn flat @click="go({name:'account'})" round dense :color="$q.dark.isActive ? 'white' : 'black'"
               icon="sym_s_account_circle" />
      </q-toolbar>
    </q-header>
    <q-page-container>

      <div class="q-pa-lg layout">

        <q-toggle v-model="search.config.dismiss.redirect.on" label="config.dismiss.redirect.on" />
        <q-toggle v-model="options.maximized" label="maximized" />
        <q-select v-model="props.reactiveProp" :options="selectOptions" label="Select Prop" />
        <q-select v-model="options.position" :options="positionOptions" label="Select Position" />

        <q-input v-model="props.reactiveProp" />
        <br />

        {{ beforeWatchPath }}

        <q-toggle v-model="search.modelValue.value" label="show" />
        <!--    <pre>{{ player }}</pre>-->
        <pre>{{ search }}</pre>

        <div v-for="item in data.items" class="row q-pa-sm" @click="go({ name: 'watch', query: { id: item.id } })">
          <div>
            <img width="100" :src="`https://img.youtube.com/vi/${item.id}/0.jpg`">
          </div>
          <div class="q-pa-sm">
            {{ item.title }}<br />
            {{ item.author }}<br />
          </div>
        </div>

        <!--    <div id="plyr" data-plyr-provider="youtube" data-plyr-embed-id="bTqVqk7FSmY"></div>-->

        <q-slider style="padding:7px 20" color="black" v-model="player.position" :min="0" :max="500" />

        <router-view :route="routedDialog" v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>

        <router-view name="player" @mount="mountPlayer"></router-view>
        <router-view name="menu" @mount="mountMenu"></router-view>
        <router-view name="search" @mount="mountSearch"></router-view>
        <router-view name="account" @mount="mountAccount"></router-view>
      </div>
    </q-page-container>

  </q-layout>
</template>
<style lang="sass">
@import 'https://cdn.plyr.io/3.7.3/plyr.css'

.logo
  margin-left: 3px
  width: 80px
  height: 50px
  background: url('src/assets/YouTube-Music-Logo.png') center center
  background-size: 120px 85px
  cursor: pointer

.logo.dark
  background-image: url('src/assets/YouTube-Music-Logo-White.png')

.material-symbols-sharp
  font-variation-account: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48

.layout
  max-width: 1200px
  margin: 0 auto
</style>
