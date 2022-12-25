export function XDialogPluginMenu ({ $style = '$style' } = {}) {

  return (dialog, name) => {
    dialog[$style](`<style>
      .x-dialog.menu .x-dialog-content {
        -webkit-box-shadow: 0 0px 4px 0px rgba(0,0,0,0.3);
        box-shadow: 0 0px 4px 0px rgba(0,0,0,0.3);
      }
    </style>`)

    dialog.update({
      class: `${dialog.xClass()} menu`,
    });
  }
}

export function XDialogPluginPlayer ({ $style = '$style' } = {}) {

  return (dialog, name) => {

    dialog[$style](`<style>
      .x-dialog.player .x-dialog-content {
        -webkit-box-shadow: 0 0 4px -1px rgba(0,0,0,0.3);
        box-shadow: 0 0 4px -1px rgba(0,0,0,0.3);
      }

      .x-dialog.player .x-dialog-content {
        overflow: inherit; /* makes knob visible on folded player */
      }
    </style>`)

    dialog.update({
      class: `${dialog.xClass()} player`,
    });
  }
}
