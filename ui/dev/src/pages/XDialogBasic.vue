<script setup>

function ok ({ payload }) {
  console.log('payload', payload)
  alert('ok')
}

function cancel () {
  alert('cancel')
}

function toggle ({ toggle }) {
  alert('toggle state: ' + (toggle ? 'true' : 'false'))
}

</script>
<template>
  <q-page padding>

    <x-dialog
      :model-value="false"
      :options="{
        title:'Button slot test',
        message:'You clicked button default slot'
      }"
      @toggle="toggle"
    >button</x-dialog>

    <br />

    <x-dialog
      :model-value="false"
      :options="{
        title: 'Fast toggle test',
        message: 'Click toggle quickly',
        seamless: true
      }"
      @cancel="cancel">toggle fast</x-dialog>

    <br />

    <x-dialog
      :model-value="false"
      :options="{
        cancel: true,
        title: 'Hello',
        message: 'World'
      }"
      @cancel="cancel"
      @ok="ok">simple ok/cancel events test</x-dialog>
    <br />

    <x-dialog
      :model-value="false"
      load="components/Simple"
      :options="{
        cancel: true,
        title: 'test component'
      }">simple component load</x-dialog>
    <br />

  </q-page>
</template>
