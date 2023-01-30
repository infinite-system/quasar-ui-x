<script setup>
import { reactive } from "vue";
import { extend } from "#/x/utils";
import VueDd from 'src/components/vue-dd/src/VueDd.vue'

const original = {

}

const extendObject = {
  reactive: reactive({ add: 1 }),
  circular: original,
}

setInterval(() => original.reactive.add++, 100)

extend(original, extendObject)
</script>
<template>
  <div class="q-pa-sm">
    <strong>Testing X extend() helper:</strong><br />
    <vue-dd v-model="original" :open-level="2" />
  </div>
</template>
