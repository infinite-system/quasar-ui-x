
import { log, isFunction,logify } from '../utils'


export async function linkHandler (dialog, event, router, route, { href, route: to, navigate }) {

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
      if (siblingProps?.config?.router?.restart) {

        log('+++ sibling requires router restart meaning the re-render of the component')
        await hideDialogNavigate(dialog, navigate, event)

        // show dialog with new content
        dialog.show()

      } else {

        log('+++ sibling does not require restart, seamless navigation and render of component withou restarting')
        navigate(event)
      }

    } else {
      log('+++ sibling component files are NOT the same ' + sibling.component?.__file + ' != ' + current.component?.__file)
      log('+++ wait for hide and navigate to the next route')
      await hideDialogNavigate(dialog, navigate, event)
    }
  } else {
    log('+++ not sibling or child, just wait for dialog to hide')
    await hideDialogNavigate(dialog, navigate, event)
  }
}


function isAncestor (routes, name, recursive = true) {
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

function isChild (route, to) {

  let currentIndex = route.matched.length - 1
  let currentRoute = route.matched[currentIndex]

  return isAncestor(currentRoute?.children, to, true /*recursive*/);
}

function isSibling (route, to) {
  if (to === undefined || to == null || to === '') return false

  let parentIndex = route.matched.length - 2
  let parentRoute = parentIndex in route.matched ? route.matched[parentIndex] : false

  return isAncestor(parentRoute?.children, to, false /*not recursive*/);
}

function getRouteDefinition (flatRoutes, to) {
  if (to in flatRoutes) {
    return flatRoutes[to]
  }
}

function getRouteDefinitions (flatRoutes = {}, routes, required = []) {

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

async function hideDialogNavigate (dialog, navigate, event) {

  event.preventDefault();

  dialog.config({ dismiss: { redirect: { on: false } } })
  await dialog.hideAsync()
  dialog.config({ dismiss: { redirect: { on: true } } })

  navigate(event.originalEvent)
}
