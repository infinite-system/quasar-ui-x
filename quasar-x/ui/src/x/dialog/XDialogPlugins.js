import { isString } from "../utils/is.js";

export function XDialogPluginStyle (dialog, name) {

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

export function XDialogPluginMove (dialog) {

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

export function XDialogPluginWide ({ $style = '$style' } = {}) {

  return (dialog, name) => {
    dialog[$style](`<style>
      .x-dialog.wide .x-dialog-content {
        border-radius: 0;
        width: 100vw !important;
      }

      .x-dialog.wide .q-dialog__inner--minimized {
        padding: 0;
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