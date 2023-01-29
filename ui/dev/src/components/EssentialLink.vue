<template>
  <q-item tag="div" v-ripple active-class="" clickable @click="go(link)">
    <q-item-section v-if="icon" style="margin-right:-15px" class="q-pr-none" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section class="q-pt-xs">
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
export interface EssentialLinkProps {
  title: string;
  caption?: string;
  link?: string;
  icon?: string;
  go?: object | Function;
}
withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',
  link: '#',
  icon: '',
  go: () => () => {}
});
</script>
