<template>
  <q-page class="row items-center justify-evenly">
    <example-component
      title="Example component"
      active
      :todos="todos"
      :meta="meta"
    ></example-component>

    <br />
    Hello
    <x-link to="hello">Link</x-link>
<!--    <x-link :to="{name:'test1'}">Test1</x-link>-->
    <x-dialog ref="dialog" :options="{title:'Testing Component'}" :component="'components/SimpleComponent'">Dialog
    </x-dialog>
    <br/>
    <br/>
    <q-btn @click="createDialog">Create XDialog</q-btn>
    <br/>
    <br/>
    <q-btn @click="createDialog2">Create QDialog</q-btn>
    <router-view></router-view>
  </q-page>
</template>

<script setup lang="ts">
import { Todo, Meta } from 'components/models';
import ExampleComponent from 'components/ExampleComponent.vue';
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar'

import { useX, XDialog } from 'quasar-ui-x'

const $q = useQuasar()
const $x = useX()
const dialog = ref<XDialog>(null)
// const dialog = ref(null)
onMounted(() => {
  const m = dialog.value
  setTimeout(() => {
    m.update({title:'Hahaha', message:'aaaa'})
  }, 0)
})

function createDialog () {
  return $x.dialog({ options: { seamless: true, noRouteDismiss: false }, component: 'components/SimpleComponent' })
}

function createDialog2 () {
  return $q.dialog({ seamless: true, noRouteDismiss: false, title: 'Quasar Dialog', message: 'QDialog' })
}

const todos = ref<Todo[]>([
  {
    id: 1,
    content: 'ct1'
  },
  {
    id: 2,
    content: 'ct2'
  },
  {
    id: 3,
    content: 'ct3'
  },
  {
    id: 4,
    content: 'ct4'
  },
  {
    id: 5,
    content: 'ct5'
  }
]);
const meta = ref<Meta>({
  totalCount: 1200
});
</script>
