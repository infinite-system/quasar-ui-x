import { h } from 'vue'
import { QBadge } from 'quasar'

export default {
  name: 'X',

  setup () {
    return () => h(QBadge, {
      class: 'X',
      label: 'X'
    })
  }
}
