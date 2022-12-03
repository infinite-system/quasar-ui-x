<script setup>
import { watch, ref } from "vue";
import { useRoute } from "vue-router";
import { prop } from "../../../src/x/utils";

const props = defineProps(['dialog', 'fold'])
const route = useRoute()
const dialog = prop(props.dialog)

const foldStyle = ref('50vh')
watch(() => props.fold, () => {
  if (props.fold){
    foldStyle.value = '30vh'
  } else {
    foldStyle.value = '50vh'
  }
})
</script>
<template>
  <div class="q-pa-md" :style="'height:'+foldStyle">
    <div>Simple Component</div>
    <div class="q-pa-lg-sm">
      <q-btn class="float-right" @click="dialog.ok()">Ok</q-btn>
    </div>
  </div>
</template>
