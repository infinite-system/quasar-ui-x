<template>
  <q-page class="flex flex-center">
    <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    >
    Hello
    <x-link to="hello">Link</x-link>
    <x-link :to="{name:'test1'}">Test1</x-link>
    <x-dialog ref="dialog" :options="{title:'Testing Component'}" :component="'components/SimpleComponent'">Dialog
    </x-dialog>
    <br/>
    <br/>
    <q-btn @click="createDialog">Create XDialog</q-btn>
    <br/>
    <br/>
    <q-btn @click="createDialog2">Create QDialog</q-btn>
    <q-grid :data="data" :columns="columns"></q-grid>
    <router-view></router-view>
  </q-page>
</template>
<script setup lang="ts">
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import { useX } from 'quasar-ui-x'
// import type { XDialog } from 'quasar-ui-x'

const $q = useQuasar()
const $x = useX()
// const dialog = ref<XDialog>(null)
const dialog = ref(null)

function createDialog () {
  return $x.dialog({ options: { seamless: true, noRouteDismiss: false }, component: 'components/SimpleComponent' })
}

function createDialog2 () {
  return $q.dialog({ seamless: true, noRouteDismiss: false, title: 'Quasar Dialog', message: 'QDialog' })
}

// import ErrorNotFound from "src/pages/ErrorNotFound.vue";
// import { ref, onMounted } from 'vue'
// import { XDialog } from 'quasar-ui-x'
// import { XDialogInter} from 'quasar-ui-x'
// <x-dialog :show="true" :options="{title:'hey'}">Hi</x-dialog>
// console.log('XDialog', XDialog)
// console.log('X', XDialogChainObject)

// const dialog = ref<XDialog>(null);
//
// onMounted(() => {
//   const d = dialog.value
//   d.onShow(() => {
//     console.log('dialog.getDOM().inner()', d.getDOM().getInner())
//     console.log('dialog.getDOM().template()', d.getDOM().getContent())
//     console.log('dialog.getId()', d.getId())
//     d.update({ title : 'test'})
//   })
// })

const columns = [
  {
    name: 'name',
    required: true,
    label: 'Dessert (100g serving)',
    align: 'left',
    field: 'name',
    sortable: true
  },
  { name: 'calories', align: 'center', label: 'Calories', field: 'calories', sortable: true },
  { name: 'fat', label: 'Fat (g)', field: 'fat', sortable: true },
  { name: 'carbs', label: 'Carbs (g)', field: 'carbs' },
  { name: 'protein', label: 'Protein (g)', field: 'protein' },
  { name: 'sodium', label: 'Sodium (mg)', field: 'sodium' },
  {
    name: 'calcium',
    label: 'Calcium (%)',
    field: 'calcium',
    sortable: true,
    sort: (a, b) => parseInt(a, 10) - parseInt(b, 10)
  },
  {
    name: 'iron',
    label: 'Iron (%)',
    field: 'iron',
    sortable: true,
    sort: (a, b) => parseInt(a, 10) - parseInt(b, 10)
  }
]

const data = [
  {
    name: 'Frozen Yogurt',
    calories: 159,
    fat: 6.0,
    carbs: 24,
    protein: 4.0,
    sodium: 87,
    calcium: '14%',
    iron: '1%'
  },
  {
    name: 'Ice cream sandwich',
    calories: 237,
    fat: 9.0,
    carbs: 37,
    protein: 4.3,
    sodium: 129,
    calcium: '8%',
    iron: '1%'
  },
  {
    name: 'Eclair',
    calories: 262,
    fat: 16.0,
    carbs: 23,
    protein: 6.0,
    sodium: 337,
    calcium: '6%',
    iron: '7%'
  },
  {
    name: 'Cupcake',
    calories: 305,
    fat: 3.7,
    carbs: 67,
    protein: 4.3,
    sodium: 413,
    calcium: '3%',
    iron: '8%'
  },
  {
    name: 'Gingerbread',
    calories: 356,
    fat: 16.0,
    carbs: 49,
    protein: 3.9,
    sodium: 327,
    calcium: '7%',
    iron: '16%'
  },
  {
    name: 'Jelly bean',
    calories: 375,
    fat: 0.0,
    carbs: 94,
    protein: 0.0,
    sodium: 50,
    calcium: '0%',
    iron: '0%'
  },
  {
    name: 'Lollipop',
    calories: 392,
    fat: 0.2,
    carbs: 98,
    protein: 0,
    sodium: 38,
    calcium: '0%',
    iron: '2%'
  },
  {
    name: 'Honeycomb',
    calories: 408,
    fat: 3.2,
    carbs: 87,
    protein: 6.5,
    sodium: 562,
    calcium: '0%',
    iron: '45%'
  },
  {
    name: 'Donut',
    calories: 452,
    fat: 25.0,
    carbs: 51,
    protein: 4.9,
    sodium: 326,
    calcium: '2%',
    iron: '22%'
  },
  {
    name: 'KitKat',
    calories: 518,
    fat: 26.0,
    carbs: 65,
    protein: 7,
    sodium: 54,
    calcium: '12%',
    iron: '6%'
  }
]
/* eslint-disable */
</script>
