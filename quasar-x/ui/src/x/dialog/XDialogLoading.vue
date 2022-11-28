<script lang="ts">
export default {
  name: 'XDialogLoading',
  inheritAttrs: false,
}
</script>
<script setup lang="ts">
import { QInnerLoading, QSpinnerTail } from 'quasar'
const props = defineProps(['dialog','component'])
</script>
<template>
  <div style="padding:30px;">
    <q-inner-loading :showing="true" label-class="" label-style="font-size: 1.1em;">
      <q-spinner-tail size="24px"></q-spinner-tail>
    </q-inner-loading>
  </div>
</template>
