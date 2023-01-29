<script setup>
import { useX } from "../../../src/x/utils/use-x";

const $x = useX()

function createBasicDynamic () {
  return $x.dialog({ options: { title: 'Hello', message: 'World' } })
}

</script>
<template>
  <q-page padding>

    <q-btn @click="createBasicDynamic">Create Basic Dynamic Dialog</q-btn>

  </q-page>
</template>
