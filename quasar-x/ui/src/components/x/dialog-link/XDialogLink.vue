<script setup>
import { useRoute, useRouter } from "vue-router";
import { RouterLink } from 'vue-router'
import { logify, log, isFunction } from '@/x/utils'
import XLink from '@/x/link/XLink.vue'
import { QBtn } from "quasar";
import { dialogHideAsync } from "@/x/dialog/XDialogHelpers";

const props = defineProps({
  ...RouterLink.props,
  trigger: { default: 'a', type: [String, QBtn] },
  dialog: { required: true },
  routerView: { default: 'default', type: String },
})

const router = useRouter()
const route = useRoute()

function isAncestor(routes, name, recursive = true) {
  if (!routes?.length) return false
  if (name === '' || name === null || name === undefined) return false
  for (let route of routes) {
    if (route.name === name)
      return true;
    else if (route.children?.length > 0 && recursive)
      return isAncestor(route.children, name);
  }
  return false
}

function isChild(route, to) {

  let currentIndex = route.matched.length - 1
  let currentRoute = route.matched[currentIndex]

  return isAncestor(currentRoute?.children, to, true /*recursive*/);
}

function isSibling(route, to) {
  if (to === undefined || to == null || to === '') return false

  let parentIndex = route.matched.length - 2
  let parentRoute = parentIndex in route.matched ? route.matched[parentIndex] : false

  return isAncestor(parentRoute?.children, to, false /*not recursive*/);
}

function getRouteDefinition(flatRoutes, to) {
  if (to in flatRoutes) {
    return flatRoutes[to]
  }
}

function getRouteDefinitions(flatRoutes = {}, routes, required = []) {

  if (typeof routes !== 'object') return

  routes.forEach(route => {

    if (required.includes(route.name)) {
      flatRoutes[route.name] = route
    }

    getRouteDefinitions(flatRoutes, route?.children, required)

    // if we found all the required routes definitions
    // we return to not do excessive searching
    if (Object.keys(flatRoutes).length === required.length) {
      return flatRoutes
    }

  })

  return flatRoutes
}

async function hideDialogNavigate(dialog, navigate, event) {

  event.preventDefault();

  await dialogHideAsync(dialog)

  navigate(event.originalEvent)
}

async function linkHandler(event, { href, route: to, navigate }) {

  let flatRoutes = {}

  getRouteDefinitions(flatRoutes, router.options.routes, [route.name, to.name])

 log('+++ flatRoutes', flatRoutes)
 log('+++ router', logify(router))
 log('+++ route', logify(route))
 log('+++ to', logify(to))

  if (isChild(route, to.name)) {

   log('+++ isChild')
   log('+++ navigate seamlessly')

    navigate(event)

  } else if (isSibling(route, to.name)) {

    let sibling = getRouteDefinition(flatRoutes, to.name)
    let current = getRouteDefinition(flatRoutes, route.name)

   log('+++ isSibling', sibling, sibling.component?.__file)
   log('+++ current', current, current.component?.__file)

    // if ('components' in current){
    //   if (props.routerView in current.components) {
    //     current.component = current.components[props.routerView]
    //   }
    // }
    // if ('components' in sibling){
    //   if (props.routerView in sibling.components) {
    //     sibling.component = sibling.components[props.routerView]
    //   }
    // }

    // check if sibling is same module
    if (current.component?.__file === sibling.component?.__file) {

     log('+++ sibling component files are the same ' + sibling.component?.__file)

      let siblingProps = isFunction(sibling.props) ? sibling.props(to) : sibling.props;

      // we need to restart the component
      if (siblingProps?.routerRestart) {

       log('+++ sibling requires router restart meaning the re-render of the component')
        await hideDialogNavigate(props.dialog, navigate, event)

        // show dialog with new content
        props.dialog.show()

      } else {

       log('+++ sibling does not require restart, seamless navigation and render of component withou restarting')
        navigate(event)
      }

    } else {
     log('+++ sibling component files are NOT the same ' + sibling.component?.__file + ' != ' + current.component?.__file)
     log('+++ wait for hide and navigate to the next route')
      await hideDialogNavigate(props.dialog, navigate, event)
    }
  } else {
   log('+++ not sibling or child, just wait for dialog to hide')
    await hideDialogNavigate(props.dialog, navigate, event)
  }
}

const onClick = (event, custom) => {
  linkHandler(event, custom)
  // emit('x-dialog-link-click');{ href, route, navigate }
}
//log('props', props)
</script>
<template>
  <x-link v-bind="props" :custom="true" v-slot="{ href, isActive, isExactActive, route, navigate }">
    <component :is="trigger" :href="href" v-bind="$attrs" :class="[
        'x-dialog-link',
        isExactActive ? 'x-dialog-link--exact-active' : '',
        isActive ? 'x-dialog-link--active' : ''
      ]"
               @click="onClick($event, { href, route, navigate })">
      <slot/>
    </component>
  </x-link>
</template>
