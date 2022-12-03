<script setup>
import { toRefs } from 'vue'
const props = defineProps(['dialog','player'])
const { player } = toRefs(props)
</script>
<template>
<div class="row q-pa-lg">
  <div><q-btn flat round icon="play_arrow"/></div>
  <div class="col-grow"><q-slider style="padding:7px 20px" color="black" v-model="player.position" :min="0" :max="500" /></div>
</div>
</template>
