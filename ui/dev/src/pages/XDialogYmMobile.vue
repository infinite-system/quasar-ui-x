<script setup>
import { computed, onMounted, ref, watch, reactive, onBeforeUnmount, markRaw, isRef, nextTick, getCurrentInstance, toRef, toRaw } from "vue";
import VueDd from 'src/components/vue-dd/src/VueDd.vue'
import XRaySelect from 'src/components/vue-dd/src/components/XRaySelect.vue'
import XRayCheckbox from 'src/components/vue-dd/src/components/XRayCheckbox.vue'

import { useRoute, useRouter } from "vue-router";
import { useX, extend, isArray, onFrame, storage, session } from "#/x/utils";

import { XDialogPluginStyle as $style, XDialogPluginMove as $move, XDialogPluginWide as $wide } from "#/x/dialog/XDialogPlugins";
import { XDialogPluginMenu as $menu, XDialogPluginPlayer as $player } from "src/components/YmMobile/XDialogExtended/XDialogPlugins";

import { QBtn, useQuasar } from 'quasar'
import Plyr from 'plyr'
import data from 'src/assets/YoutubeItems.json'
import { kebabToPascalCase } from "#/x/utils/strings";


const $x = useX()
const $q = useQuasar()

const route = useRoute()
const router = useRouter()

const player = reactive({
  position: 0,
  item: storage.get('player.item'),
  view: storage.get('player.item') ? 'folded' : 'hidden',
  setItem: false
})


let app = {
  config: {
    history: 'push', // 'replace' | 'push'
    home: { name: 'home' },
    dialogViews: ['watch', 'search', 'user', 'account'],
  },
  player,
  view: {
    state: ref(''),
    routerState: computed(() => app.view.state.value ? resolve(app.view.state.value) : route),
    isFrozen: false,
    beforeWatch: ref(''),
    freeze (value) {

      // more info on this implementation
      // https://github.com/vuejs/vue-router/issues/703
      // https://github.com/vuejs/rfcs/blob/master/active-rfcs/0036-router-view-route-prop.md
      // https://github.com/vuejs/vue-router/issues/703#issuecomment-428123334
      if (!this.isFrozen) {

        // save router-view state, make it static
        // it won't change with router change now
        app.view.state.value = value || route.fullPath
        this.isFrozen = true
      }
    },
    unfreeze () {

      if (this.isFrozen) {
        // unfreeze router-view to be able to set it
        // from the router navigation
        app.view.state.value = null
        this.isFrozen = false
      }
    }
  }
}

let test = {}


const options = reactive({
  maximized: false,
  fullWidth: true,
  fullHeight: true,
  position: 'right',
  seamless: true,
  ok: false
})

const props = reactive({
  go,
  reactiveProp: 'lalala',
  options: options
})

const config = reactive({
  dismiss: { redirect: { on: false } }
})


const dialog = {
  menu: {
    mount: () => {
      if (!app.dialog.menu.instance) {
        app.dialog.menu.instance = $x.dialog(app.dialog.menu.props)
      }
    },
    props: {
      id: 'Menu',
      options: {
        position: 'bottom',
        seamless: true,
        ok: false
      },
      load: () => import('../components/YmMobile/Dialogs/Menu.vue'),
      props: { player, go, app },
      onLoad: () => {
        setInterval(() => {
          // app.__tracker__.i++
          player.position += 1
          // app.__tracker__.scrollY = window.scrollY
          // // window.scrollY
          if (player.position >= 500) {
            player.position = 0
          }
        }, 500)
      },
      plugins: {
        $style,
        $wide: $wide(),
        $menu: $menu()
      }
    },
    instance: null
  },
  player: {
    mount (props) {
      if (!app.dialog.player.instance) {
        app.dialog.player.instance = $x.dialog(app.dialog.player.props)
      }
    },
    props: {
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
      config: { dismiss: { redirect: { on: false } } },
      load: import('src/components/YmMobile/Dialogs/Player.vue'),
      props: {
        app,
        player,
        go,
      },
      plugins: {
        $style,
        $wide: $wide(),
        $player: $player()
      }
    },
    instance: null
  },
  search: {
    mount: () => {

      if (route.name === 'search') {

        function searchDismissRedirectFn ({ router }) {
          if (history.state.back) {
            return goBack()
          } else {
            return goHome()
          }
        }

        extend(app.dialog.search.props, {
          modelValue: true,
          options: { maximized: false },
          config: { dismiss: { redirect: { on: true, fn: searchDismissRedirectFn } } },
          props: { reactiveProp: 'test' }
        })

        if (!app.dialog.search.instance) {
          app.dialog.search.instance = $x.dialog(app.dialog.search.props)
        }

      } else {

        return hide(app.dialog.search.props)
      }
    },
    props: reactive({
      modelValue: false,
      id: 'Search',
      router: 'search',
      options: options,
      load: () => import('src/components/YmMobile/Dialogs/Search.vue'),
      onShow: ({ dialog }) => {
        dialog.$move('bottom')
      },
      props: props,
      plugins: { $move },
      config
    }),
    instance: null
  },
  account: {
    mount: () => {
      if (route.name === 'account') {

        const accountDismissRedirectFn = ({ router }) => {

          const back = history.state.back ? resolve(history.state.back) : null

          if (isAccountView(back)) {
            return goHome()
          } else {
            return goBack()
          }
        }

        extend(dialog.account.props, {
          modelValue: { value: true },
          config: { dismiss: { redirect: { on: true, fn: accountDismissRedirectFn } } },
        })

        if (!dialog.account.instance) {
          app.dialog.account.instance = $x.dialog(dialog.account.props)
          console.log('dialog.account.instance', dialog.account.instance)
        }

        dialog.accountslug.mount()

      } else {
        hide(dialog.account.props)
        hide(dialog.accountslug.props)
      }
    },
    props: {
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
    },
    instance: null
  },
  accountslug: {
    mount: () => {

      const routePart = normalizePart(route)

      if (routePart?.[0]) {

        function isParent (back, routePart) {
          const backPart = normalizePart(back)
          return back && back.name === 'account' && backPart.length < routePart.length;
        }

        const accountslugDismissRedirectFn = ({ router }) => {

          const back = history.state.back ? resolve(history.state.back) : null

          if (isParent(back, routePart)) {
            console.log('go-back')
            return goBack()
          } else {
            console.log('go-to-account')
            return goToAccount()
          }
        }

        // empty from previous component
        extend(dialog.accountslug.props, { load: { value: null } })

        const componentParts = [...routePart].map((value) => kebabToPascalCase(value))
        const component = kebabToPascalCase(componentParts.join('/'))

        let options = {}
        switch (routePart[0]) {
          case 'switch':
            options = { class: `${accountslugOriginalClass} narrow`, position: 'standard' }
            break;
          default:
            options = { class: `${accountslugOriginalClass}`, position: 'right' }
        }

        extend(dialog.accountslug.props, {
          config: { dismiss: { redirect: { on: true, fn: accountslugDismissRedirectFn } } },
          load: { value: `components/YmMobile/Dialogs/Account/${component}` },
          options: options
        })

        if (!dialog.accountslug.instance) {
          dialog.accountslug.instance = $x.dialog(dialog.accountslug.props)
          dialog.accountslug.instance.$style(`<style>.x-dialog-content.narrow { min-width: 300px }</style>`)
        }

        onFrame(() => {
          // Settings.show()
          extend(dialog.accountslug.props, { modelValue: { value: true } })
        })

      } else {
        hide(dialog.accountslug.props)
      }
    },
    props: {
      modelValue: ref(true),
      load: ref(() => import(`src/components/YmMobile/Dialogs/Account/Settings.vue`)),
      // debug: ['componentChanged'],
      id: 'Settings',
      router: 'account',
      options: reactive({
        class: '',
        position: 'right',
        noRouteDismiss: true,
        // seamless: true,
        ok: false
      }),
      config: reactive({}),
      props: { app, accountslugBack },
      plugins: { $style }
    },
    instance: null,
  }
}

const accountslugOriginalClass = dialog.accountslug.props.options.class

// app.dialog = dialog
//
extend(app, { dialog })
console.log('app', app)

// console.log('app.dialog', dialog)


function notDialogView (route) {
  // route is not 'watch' and not all other dialog views, like 'search', 'user', etc.
  return !app.config.dialogViews.includes(route.name)
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
    app.view.unfreeze()
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
  console.log('app.view.beforeWatch.value', app.view.beforeWatch.value)
  return go(app.view.beforeWatch.value)
}

function goBack () {
  console.log('goBack')
  return router.back()
}

function goHome () {
  return go(app.config.home)
}

function goBackOrHome () {
  const back = history.state.back ? resolve(history.state.back) : null
  if (back && !isDialogView(back)) {
    return goBack()
  } else {
    return goHome()
  }
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
  session.set('app.view.beforeWatch', app.view.beforeWatch.value = to)
}

function getBeforeWatchPath () {
  return app.view.beforeWatch.value = session.get('app.view.beforeWatch')
}

function youtubeGo (to) {

  const watchToWatch = to.name === 'watch' && route.name === 'watch'

  if (watchToWatch) {
    return replace(to)
  } else {
    return push(to)
  }
}

function isDialogView (route) {
  return app.config.dialogViews.includes(route.name)
}

function go (to) {
  to = resolve(to)

  if (isDialogView(to)) {
    app.view.freeze()
  } else {
    app.view.unfreeze()
    setBeforeWatchPath(to.fullPath)
  }

  if (app.config.history === 'replace') {
    return youtubeGo(to)
  } else {
    return push(to)
  }
}

const accountRoute = 'account'

function normalizePart (route) {
  const part = route.params?.part || []
  return isArray(part) ? [...part] : [part]
}

function goUpOneLevel (routePart) {
  routePart.pop()
  return go({ name: accountRoute, params: { part: routePart } })
}

/**
 * Handle back button
 * @returns {*}
 */
function accountslugBack () {

  const back = history.state.back ? resolve(history.state.back) : null

  // current accountslug route 'part' param
  let routePart = normalizePart(route)

  if (!back) {
    return goUpOneLevel(routePart)
  }

  // if back is not 'account'
  if (!isAccountView(back)) {
    return goUpOneLevel(routePart)
  }

  // back history 'part' param
  let backPart = normalizePart(back)

  // back is 'accountslug' route, but up 1 level
  // for ex. 'accountslug/general/captions', up one level route
  // is 'accountslug/general', so just by going back we will
  // get desired history movement
  const backIsUpLevel = backPart.length < routePart.length

  if (backIsUpLevel) {
    return goBack()
  } else {
    return goUpOneLevel(routePart)
  }
}

function goToAccount () {
  return go({ name: 'account' })
}

function isAccountView (route) {
  return route.name === 'account'
}

function hide (obj) {
  const hideAndDisableRedirect = {
    modelValue: isRef(obj.modelValue) ? { value: false } : false,
    config: { dismiss: { redirect: { on: false } } }
  }
  extend(obj, hideAndDisableRedirect)
}

function toggleDarkMode (v, evt) {
  $q.dark.set(v)
  storage.set('darkMode', v)
}

const app2 = window

const level = ref(1)

const specificOptions = [
  [
    // 'dialog.accountslug.props.*',
    // 'dialog.accountslug.props.props.app',
    // 'dialog.accountslug.props.config.*'
  ],
  ['dialog.accountslug.props'],
  ['search.props.*', 'account.props.*', 'accountslug.props.*'],
  ['config'],
  ['player']
]

const specific = ref(specificOptions[0])

const dd1 = ref(null)
const surround = ref(null)

const renderComponent = ref(true)

function changeSpecific (value) {
  // console.log('value', value, evt)
  if (value === null) {
    specific.value = []
  }
  toggleSettings()
  // forceRerender()
}

const variable = ref('app')
const instance = getCurrentInstance()

const variables = {
  'app': app,
  'config': app.config,
  'view': app.view,
  'player': app.player,
  'dialog': app.dialog,
  'route': route,
  'router': router,
  'instance': instance,
  'window': window,
}

let actualVariable = { value: variables['app'], id: 'app' }

async function changeVariable (value) {
  // variable
  actualVariable.value = {}

  try {
    toggleSettings()
    setTimeout(async () => {
      actualVariable.value = variables[value]
      actualVariable.id = value

      await forceRerender()
    })
  } catch (e) {
    console.error('we caught an error', e)
    // do nothing
  }

}

const forceRerender = async () => {


  try {

    const initial = surround.value.style.display
    surround.value.style.display = 'none'
    // Remove MyComponent from the DOM
    renderComponent.value = false;
    // Wait for the change to get flushed to the DOM
    await nextTick();

    renderComponent.value = true;
    surround.value.style.display = initial
  } catch (e) {
    // do nothing
  }


};

const darkDd = ref(true)

function toggleDarkDd () {
  darkDd.value = !!darkDd.value
  // forceRerender()
}

const Storage = sessionStorage


const sticky = ref(true)

const arrayOfObjects = ref([22, { obj: ref(false) }, { obj: ref(true) }])
const a = { a: arrayOfObjects }
const aOpenSpecific = ['a']
const vueDdSettings = ref(false)

const startClosed = ref(true)
const previewInitial = ref(false)

function toggleSettings () {
  vueDdSettings.value = !vueDdSettings.value;
}

function toggleSave () {
  save.value = !save.value;
}

function dragEnd (evt) {
  const rect = evt.target.getBoundingClientRect();

  console.log('rect', rect)
  surround.value.style.bottom = rect.bottom + 'px'
  surround.value.style.left = rect.left + 'px'
}

const dd = ref(null)
function toggleDd() {
  dd.value.toggle()
}

const right = ref(true)
const save = ref(false)
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
    <q-page-container style="padding-top:10px">

      <div class="q-px-lg layout">

<!--        <div class="row">-->
<!--          <div class="col-grow q-pa-sm" style="padding-top:13px">-->
<!--            <q-item class="q-pa-none  app-viewer">-->
<!--              <q-item-section avatar style="min-width:24px;padding-right:0px !important">-->
<!--                &lt;!&ndash;                <q-icon name="sym_s_visibility" class="app-viewer-icon" size="38px" />&ndash;&gt;-->
<!--                <span class="vue-dd-focus vue-dd-focus-selected vue-dd-icon-eye app-viewer-icon"-->
<!--                      style="font-size:32px;margin:0 3px 0 auto;display:inline-block"></span>-->
<!--              </q-item-section>-->
<!--              <q-item-section>-->
<!--                <q-item-label>-->
<!--                  <h5 class="q-pa-none q-ma-none app-viewer-text">vue-dd</h5>-->
<!--                </q-item-label>-->
<!--              </q-item-section>-->
<!--            </q-item>-->
<!--          </div>-->
<!--        </div>-->


        <div ref="surround" class="x-ray" :class="{'x-ray-right-align': right, 'x-ray-dark': darkDd}" :style="$q.platform.is.mobile ? 'max-width:93vw;max-height:50vh;':'max-width:50vw;max-height:60vh;'">
          <div class="x-ray-inner">
            <vue-dd
              v-if="renderComponent"
              ref="dd"
              :id="actualVariable.id"
              :dark="darkDd"
              :name="variable"
              :start-closed="startClosed"
              :preview-initial="previewInitial"
              :model-value="actualVariable.value"
              :open-level="level"
              :focus-sticky="sticky"
              :save="save"
              max-height="50vh"
              max-width="100%"
              :open-specific="specific" />
            <!--@dragend="dragEnd($event)" draggable="true" -->
            <span class="x-ray-eye" @click="toggleDd"><span
              class="vue-dd-focus vue-dd-focus-selected vue-dd-icon-eye app-viewer-icon x-ray-floating"></span></span>
            <span class="x-ray-wrench" @click="toggleSettings"><q-icon class="x-ray-wrench-icon" name="sym_s_build_circle" size="35px" /></span>

            <div v-show="vueDdSettings" class="x-ray-settings">
              <div class="q-pa-sm">
                <x-ray-select
                  v-model="specific"
                  label="open-specific"
                  style="max-width:200px; text-overflow:ellipsis "
                  @update:model-value="changeSpecific"
                  :options="specificOptions" />
              </div>
              <div class="q-pa-sm" style="padding-right:0">
                <x-ray-select
                  standout
                  v-model="level"
                  @update:model-value="toggleSettings()"
                  label="open-level"
                  :options="[0,1,2,3,[0,1,2],[0,1,2,4,5]]" />

              </div>
              <div class="q-pa-sm">
                <x-ray-checkbox label="focus-sticky" @update:model-value="toggleSettings" v-model="sticky" />
              </div>
              <div class="q-pa-sm">
                <x-ray-checkbox label="start-closed" v-model="startClosed" />
              </div>
              <div class="q-pa-sm">
                <x-ray-checkbox label="preview-initial" v-model="previewInitial" />
              </div>
              <div class="q-pa-sm">
                <x-ray-checkbox label="dark" v-model="darkDd" />
                <x-ray-checkbox label="right" @update:model-value="toggleSettings" v-model="right" />
                <x-ray-checkbox label="save" @update:model-value="toggleSave" v-model="save" />
              </div>

              <div class="q-pa-sm col-grow" style="padding-right:0">
                <x-ray-select
                  standout
                  v-model="variable"
                  @update:model-value="changeVariable"
                  :options="Object.keys(variables)" />
              </div>
              <div style="text-align:right">
                <button class="x-ray-ok" @click="toggleSettings">ok</button>
              </div>
            </div>
          </div>
        </div>

        <br />

        <br />

        <div v-for="item in data.items"
             class="row q-pa-sm song"
             @click="go({ name: 'watch', query: { id: item.id } })">
          <div>
            <img width="200" :src="`https://img.youtube.com/vi/${item.id}/0.jpg`">
          </div>
          <div class="q-pa-sm">
            <strong>{{ item.title }}</strong><br />
            {{ item.author }}<br />
          </div>
        </div>

        <!--    <div id="plyr" data-plyr-provider="youtube" data-plyr-embed-id="bTqVqk7FSmY"></div>-->

        <q-slider style="padding:7px 20px" color="black" v-model="player.position" :min="0" :max="500" />

        <router-view :app="app" :route="app.view.routerState.value" v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>

        <router-view name="player" @mount="app.dialog.player.mount"></router-view>
        <router-view name="menu" @mount="app.dialog.menu.mount"></router-view>
        <router-view name="search" @mount="app.dialog.search.mount"></router-view>
        <router-view name="account" @mount="app.dialog.account.mount"></router-view>
      </div>
    </q-page-container>

  </q-layout>
</template>
<style lang="sass">
@import 'https://cdn.plyr.io/3.7.3/plyr.css'

.x-ray
  position: fixed
  bottom: 110px
  left: 15px
  z-index: 1000000000

.x-ray-right-align
  right: 15px
  left: auto

  .x-ray-eye
    right: 0
    left: auto

  .x-ray-wrench
    right: 40px
    left: auto

  .x-ray-settings
    right: 0
    left: auto

.x-ray-inner
  position: relative

  input[type=checkbox]
    vertical-align: middle

.x-ray-inner label
  padding: 5px

.x-ray-eye
  position: absolute
  bottom: -40px
  left: 0
  border-radius: 30px
  display: inline-block
  width: 35px
  height: 35px
  text-align: center
  vertical-align: middle
  background-color: #ffffff1a
  -webkit-user-select: none
  user-select: none
  cursor: pointer
  transition: 0.3s

  &:hover
    background-color: #eeeeee
  &:active
    background-color: #92b9f8

  .vue-dd-focus
    cursor: pointer

.x-ray-wrench
  position: absolute
  bottom: -40px
  left: 40px
  cursor: pointer
  border-radius: 30px
  display: inline-block
  width: 35px
  height: 35px
  text-align: center
  vertical-align: middle
  background-color: #ffffff1a
  -webkit-backdrop-filter: blur(7px)
  backdrop-filter: blur(7px)
  -webkit-user-select: none
  user-select: none
  transition: 0.3s

  &:hover
    background-color: #eeeeee
  &:active
    background-color: #92b9f8

.x-ray-settings
  -webkit-box-shadow: 0px 2px 9px 1px #B4B4B4
  box-shadow: 0px 2px 9px 1px #B4B4B4
  border-radius: 5px
  position: absolute
  bottom: 5px
  color: #333
  left: 0
  background-color: #ffffff
  -webkit-backdrop-filter: blur(7px)
  backdrop-filter: blur(7px)

.x-ray-dark

  .x-ray-settings
    background-color: #000000
    color: #fff

.x-ray-floating
  font-size: 25px
  line-height: 35px
  margin: 0 3px 0 3px
  display: inline-block

.x-ray-wrench-icon
  background: -webkit-linear-gradient(60deg, #116dea, #00ff95 90%)
  -webkit-background-clip: text
  -webkit-text-fill-color: transparent
  text-shadow: 0 0 #00000000

.x-ray-ok
  padding: 5px 15px 4px 15px
  margin: 0 10px 10px 0
  border: 0
  border-radius: 5px
  cursor: pointer
  transition: 0.3s
  font-weight: bold
  text-transform: uppercase
  color: #fff
  background: #00ff95
  background: -webkit-linear-gradient(60deg, #116dea, #00ff95 90%)

  &:hover
    background: #00ff95
    background: -webkit-linear-gradient(60deg, #116dea, #00ff95 60%)

  &:active
    background: #00ff95
    background: -webkit-linear-gradient(60deg, #00ff95, #116dea 100%)

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

.adjust-back-arrow
  margin-top: -5px
  margin-left: -1px

.app-viewer-icon
  color: #116dea
//background: -webkit-linear-gradient(45deg, #09009f, #00ff95 80%)
//-webkit-background-clip: text
//-webkit-text-fill-color: transparent

.app-viewer
  background: -webkit-linear-gradient(60deg, #116dea, #00ff95 90%)
  -webkit-background-clip: text
  -webkit-text-fill-color: transparent
  text-shadow: 0 0 #00000000

.app-viewer-text
  background: -webkit-linear-gradient(70deg, #116dea, #00ff95 70%)
  -webkit-background-clip: text
  -webkit-text-fill-color: transparent
  text-shadow: 0 0 #00000000

.song
  border-radius: 10px
  transition: 0.3s
  cursor: pointer

  &:hover
    background: #eeeeee

.body--dark .song
  border-radius: 10px
  transition: 0.3s
  cursor: pointer

  &:hover
    background: #0000001a
</style>
