<script setup>
import { prop } from "#/x/utils";
const props = defineProps(['test', 'app'])
const app = prop(props.app)

const selectOptions = ['some text', 'another text', 'more text']

const positionOptions = ['left', 'right', 'bottom', 'top', 'standard']

</script>
<template>
  <q-page>Search


    <q-toggle v-model="app.dialog.search.props.config.dismiss.redirect.on" label="config.dismiss.redirect.on" />
    <q-toggle v-model="app.dialog.search.props.options.maximized" label="maximized" />
    <q-select v-model="app.dialog.search.props.props.reactiveProp" :options="selectOptions" label="Select Prop" />
    <q-select v-model="app.dialog.search.props.options.position" :options="positionOptions" label="Select Position" />

    <q-input v-model="app.dialog.search.props.reactiveProp" />
  </q-page>
</template>
