import ResizeSensor from "css-element-queries/src/ResizeSensor";
import { isObject, log, isFunction, createComponent, extractData } from '../utils'
import { h, isRef, markRaw } from 'vue'
import XDialog from './XDialog.vue'

let uniqueDialogId = 1

export function dialogId () {
  return uniqueDialogId++
}

export function optionsFromString (options) {
  return typeof options === 'string' ? JSON.parse(options) : options
}

export function remove (dialogId) {
  const domContent = document.getElementById(dialogId);
  if (domContent) {
    // get the QDialog component wrapper DOM element
    domContent.closest('[data-v-app]').remove()
    domContent.remove()
  }
}

export function wrap (dialogId, message = '') {
  return `<div id="${dialogId}">${message}</div>`
}

export function setButtonDefaults (defaults, options, btnDefaults) {
  for (let btn in btnDefaults) {

    let btnEnabledByDefault = btn in defaults && (defaults[btn] || isObject(defaults[btn]))
    if (btnEnabledByDefault) {
      defaults[btn] = btnDefaults[btn];
    }
    // if options are set to boolean, we set the default btn object
    if (btn in options && options[btn] === true) {
      options[btn] = btnDefaults[btn];
    }
    /**
     * set options buttons names to __ok__, __cancel__
     * these cannot be overwritten by the options settings to preserve a standard
     * in case people are relying on __ok__, __cancel__ in their template definitions,
     * to get the functionality of those buttons
     */
    if (btn in options && isObject(options[btn]) && 'name' in options[btn]) {
      options[btn].name = btnDefaults[btn].name
    }
  }
}

export function redirectFn (router, route) {

  const parentIndex = route.matched.length - 2
  const parent = parentIndex in route.matched ? route.matched[parentIndex] : null

  if (parent) {

    const parentOptions = { name: parent.name, params: route.params, query: parent.query }
    const resolvedRoute = router.resolve(parentOptions)

    if (resolvedRoute.fullPath === router.options.history.state.back) {
      log('!!! router.back to parent', 'parent', parentOptions)
      return router.back()
    } else {
      log('!!! router.push to parent', 'parent', parentOptions)
      return router.push(parentOptions)
    }
  }
}

export function payloadFn(element, ...args){
  return extractData(element, ...args)
}

export function getAndroidNavbarHeight (dialogId) {

  let controlHeight = document.createElement('div')

  controlHeight.setAttribute('id', dialogId + '_controlHeight');
  controlHeight.style.height = '100vh'
  controlHeight.style.width = '0'
  controlHeight.style.position = 'absolute'

  document.body.append(controlHeight)

  const actualHeight = window.innerHeight;
  const elementHeight = controlHeight.clientHeight;
  const androidNavbarHeight = elementHeight - actualHeight;

  controlHeight.remove()

  return androidNavbarHeight;
}

/**
 * On Android in maximized : true, position : 'bottom' mode, if the content grows
 * taller it shows under the Android's Chrome Url Navigation bar, to offset that height
 * properly this code does this detection of the sizes of the dialog inner content
 * against the viewable area and performs adjustments to never go behind the Android
 * navigation bar.
 *
 * Fix Android Mobile Navigation toolbar overlapping the text in the dialog
 * It only happens in position:bottom + maximized:true variant of the QDialog
 * I think their logic is correct for the mobile apps, but for the mobile phone,
 * the navigation bar creates side effects, so does also the coming up of the keyboard
 * when the input is focused, both of these issues are solved in the following function
 * @param dialogId
 * @param dialogOptions
 */
export function dialogFix_Android_Mobile_Browser_Maximized_Bottom_Navbar_Overflow (dialogId, dialogOptions) {

  let dialogContent = document.getElementById(dialogId);

  if (dialogContent) {

    // get the QDialog component wrapper DOM element
    let element = dialogContent.closest('.q-dialog-plugin');
    let elementParent = element.closest('.q-dialog');

    let isRightContext = document.body.classList.contains('mobile')
      && document.body.classList.contains('platform-android')
      && document.body.classList.contains('q-body--dialog')
      && dialogOptions?.position === 'bottom'
      && dialogOptions?.maximized === true;

    if (isRightContext) {

      log('**fix_android', 'context correct: mobile android platform ')

      let androidNavbarHeight = getAndroidNavbarHeight(dialogId);

      if (androidNavbarHeight > 0) {

        let originalMaxHeight = '100vh'

        // inner dialog element sensor
        new ResizeSensor(element, function() {
          // if internal element is greater than the parent
          if (element.clientHeight > elementParent.clientHeight) {
            // set a limit to the size of the parent element
            element.style.maxHeight = elementParent.clientHeight + 'px'
            //log('element > element.maxHeight', elementParent.clientHeight + 'px')

            // or if inner element height is smaller than the parent height
          } else if (element.clientHeight < elementParent.clientHeight
            // and element maxHeight is already bound by the parent
            && element.style.maxHeight !== originalMaxHeight) {
            // then release it from the parent limits and restore original size
            element.style.maxHeight = originalMaxHeight
            //log('element < element.maxHeight', originalMaxHeight)
          }
        });

        // parent element sensor
        new ResizeSensor(elementParent, function() {
          // only change this if we are already changed the element before
          // then element.style.maxHeight won't equal to originalMaxHeight
          if (element.style.maxHeight !== originalMaxHeight
            // and only if internal element height is greater than its bounding box
            && element.scrollHeight > element.clientHeight) {
            if (element.scrollHeight > elementParent.clientHeight) {
              // element internal size is greater than parent bounding box ?
              // then set max height to a limited value equal to the parent box height
              element.style.maxHeight = elementParent.clientHeight + 'px'
              //log('parent > element.maxHeight', elementParent.clientHeight + 'px')
            } else {
              // remove limit as the internal height will not overlap the android navbar
              // as its real value is smaller than that
              element.style.maxHeight = originalMaxHeight
              //log('parent < element.maxHeight', originalMaxHeight)
            }
          }
        });
      }
    }
  }
}


export function xDialog (app) {

  return (props, listeners) => {

    const container = document.createElement('div')
    document.body.appendChild(container)

    let modelEvents = {}
    const models = ['modelValue', 'options', 'import', 'props']

    /* Retain reactivity */
    for (let model of models) {
      modelEvents[`onUpdate:${model}`] = function(modelValue) {
        if (model in props && isRef(props[model])) {
          props[model].value = modelValue
        }
      }
    }

    if ('show' in props) props.modelValue = props.show

    if ('import' in props && !isRef(props.import) && isObject(props.import)){
      props.import = markRaw(props.import)
    }

    return createComponent({
      el: container,
      component: h(XDialog, { ...modelEvents, ...listeners }),
      props: props,
      appContext: app._context,
    })
  }
}

