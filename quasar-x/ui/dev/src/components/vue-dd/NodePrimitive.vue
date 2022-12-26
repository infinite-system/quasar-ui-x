<template>
  <span :id="id">
    <span v-if="name !== ''"
          class="vue-dd-key">{{ name }}:</span>
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
    <span v-if="shouldComma">,&nbsp;</span>
  </span>
</template>
<script>
export default {
  name: 'NodePrimitive',
  inheritAttrs: false,
  props: [
    // ref
    'root',
    'rootId',
    // options
    'modelValue',
    'name',
    'rootName',
    'escapeQuotes',
    // helpers
    'pointer',
    'type',
    'size',
    'position',
    // functions
    'escapeQuotesFn'
  ],
  data () {
    return {
      id: `${this.rootName}${this.rootId}.${this.pointer}`
    }
  },
  computed: {
    shouldComma () {
      return this.size && this.position && this.position !== this.size
    }
  }
}
</script>
