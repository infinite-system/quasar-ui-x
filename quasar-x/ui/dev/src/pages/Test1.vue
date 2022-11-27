<template>
  <q-page padding>

    hello
    <x-dialog :options="{title:'hello',message:'amazing!',cancel:true}"/>
    <x-dialog component="components/Simple">show</x-dialog>

    <br/>
    <x-link to="https://google.com">Google</x-link>

    <q-btn @click="createDialog">Create</q-btn>
  </q-page>
</template>
<script setup>
import { inject } from 'vue'

const $x = inject('x')

function createDialog() {
  return $x.dialog({ options: { title: 'Hello', message: 'World' } })
}
</script>
<style lang="sass" scoped>
.directive-target
  width: 50px
  height: 50px
</style>
