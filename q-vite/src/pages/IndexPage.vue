<template>

    <br />
    Hello

    <vue-dd :model-value="w" name="test"></vue-dd>
    <x-link to="hello">Link</x-link>
<!--    <x-link :to="{name:'test1'}">Test1</x-link>-->
    <x-dialog :model-value="false" ref="dialog" :options="{title:'Testing Component!'}" :load="'components/LargeComponent'">Dialog
    </x-dialog>
    <br/>
    <br/>
    <q-btn @click="createDialog">Create XDialog</q-btn>
    <br/>
    <q-btn @click="createLargeDialog">Create Large XDialog</q-btn>
    <br/>
    <br/>
    <q-btn @click="createDialog2">Create QDialog</q-btn>
    <router-view></router-view>


    <h1>Recursive</h1>
    <FileTree :contents="tree" />

</template>

<script setup lang="ts">
import { Todo, Meta } from 'components/models';
import ExampleComponent from 'components/ExampleComponent.vue';
import { getCurrentInstance,onMounted, ref } from 'vue';
import { useQuasar } from 'quasar'

import { useX, utils } from 'quasar-ui-x'
const { keepAlive } = utils
import VueDd from '../components/vue-dd/VueDd.vue'
import FileTree from '../components/FileTree.vue'

//import RecursiveComponent from '../components/RecursiveComponent.vue';

let w = window
const tree =  [
  {
    type: 'file',
    name: 'README.md'
  },
  {
    type: 'folder',
    name: 'src',
    contents: [
      {
        type: 'file',
        name: 'foo.js'
      },
    ]
  },
  {
    type: 'folder',
    name: 'tests',
    contents: [
      {
        type: 'file',
        name: 'setup.js'
      },
      {
        name: 'unit',
        type: 'folder',
        contents: [
          {
            type: 'file',
            name: 'foo.spec.js'
          }
        ]
      }
    ]
  }
]
// console.log('Vue', getCurrentInstance())
const $q = useQuasar()
const $x = useX()
console.log('keepAlive', keepAlive)
// $x.dialog({})
const dialog = ref<XDialog>(null)
// const dialog = ref(null)
onMounted(() => {
  const m = dialog.value
  setTimeout(() => {
    // m.update({title:'Hahaha', message:'aaaa'})
  }, 0)
})

function createDialog () {
  return $x.dialog({ options: { seamless: true, noEscDismiss: false }, load: 'components/SimpleComponent' })
}

function createLargeDialog () {
  return $x.dialog({ debug: true, options: { seamless: false, noEscDismiss: false }, load: 'components/LargeComponent' })
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
<style>
#container {
  border: 2px solid #41b883;
  display: flex;
  margin: 0 auto;
  max-width: 800px;
}
</style>
