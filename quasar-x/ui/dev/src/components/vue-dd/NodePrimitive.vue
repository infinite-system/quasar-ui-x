<template>
  <span>
  <span v-if="name !== ''" class="vue-dd-key">{{ name }}: </span>
  <span v-if="type === 'null'"
        class="vue-dd-null">null</span>
  <span v-else-if="type === 'undefined'"
        class="vue-dd-undefined">undefined</span>
  <span v-else-if="type === 'number'"
        class="vue-dd-number">{{ modelValue }}</span>
  <span v-else-if="type === 'string'"
        class="vue-dd-string">"{{ escapeQuotesFn(modelValue) }}"</span>
  <span v-else-if="type === 'boolean'"
        class="vue-dd-boolean"
        :class="{'vue-dd-false':!modelValue}">{{ modelValue }}</span>
  <span v-else
        class="vue-dd-false">[unknown_type]{{ modelValue }}</span>
  <span v-if="size && position !== size">,&nbsp;</span>
  </span>
</template>
<script>
export default {
  name: 'NodePrimitive',
  props: ['type', 'name', 'modelValue', 'size', 'position', 'escapeQuotes', 'escapeQuotesFn']
}
</script>
