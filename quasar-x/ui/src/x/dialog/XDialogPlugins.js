import { isString } from "../utils/is.js";

export function $style (dialog, name) {

  let i = 1

  function injectStyle (style) {
    const id = `${dialog.xId()}__style__${i++}`
    if (!document.getElementById(id)) {
      const div = document.createElement("div")
      div.innerHTML = style;
      const styleElement = div.firstElementChild;
      styleElement.setAttribute('id', id);
      document.body.appendChild(styleElement)
    }
  }

  return (style) => injectStyle(style)
}

export function $move (dialog) {

  return (position) => {

    if (isString(position)) {

      const dialogs = document.querySelectorAll('div[data-v-app][x-type="XDialog"]')

      switch (position) {
        case 'bottom':
          if (dialogs.length) {
            dialogs[0].parentNode
              .insertBefore(dialog.xDOM().xComponent(), dialogs[0])
          }
          break;
        case 'top':
          if (dialogs.length) {
            dialogs[0].parentNode
              .insertBefore(dialog.xDOM().xComponent(), dialogs[dialogs.length - 1].nextSibling)
          }
          break;
        case 'html':
          document.documentElement.insertBefore(dialog.xDOM().xComponent(), document.body.nextSibling)
          break;
      }
    }
  }
}
