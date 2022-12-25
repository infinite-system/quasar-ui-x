<template>
  <node-primitive
    v-if="primitive"
    :modelValue="modelValue"
    :name="name"
    :position="position"
    :size="size"
    :escapeQuotes="escapeQuotes"
    :escapeQuotesFn="escapeQuotesFn"
    :type="type" />
  <node-complex
    v-else
    :modelValue="modelValue"
    :type="type"
    :level="level"
    :position="position"
    :pointer="pointer"
    :size="size"
    :paddingLeft="paddingLeft"
    :name="name"
    :openLevel="openLevel"
    :openSpecific="openSpecific"
    :longText="longText"
    :escapeQuotes="escapeQuotes"
    :escapeQuotesFn="escapeQuotesFn"
    :getTypeFn="getTypeFn"
    :isPrimitiveFn="isPrimitiveFn"
    :primary="false"
    :deep="isSet ? false : deep"
  />
  <!-- Sets always must have { deep: false } -->
</template>
<script>
import NodeComplex from './NodeComplex.vue';
import NodePrimitive from './NodePrimitive.vue';

export default {
  name: 'NodeBase',
  props: {
    modelValue: undefined,
    name: [String, Number],
    openLevel: { type: [Number, String], default: 0 },
    openSpecific: { type: Array, default: () => [] },
    level: Number,
    paddingLeft: String,
    position: Number,
    longText: { type: Number, default: 50 },
    escapeQuotes: Boolean,
    deep: Boolean,
    size: Number,
  },
  data () {
    return {
      // this is required, to make openSpecific:[''] be able to open first level
      pointer: '',
    }
  },
  computed: {
    type () {
      return this.getTypeFn(this.modelValue)
    },
    primitive () {
      return this.isPrimitiveFn(this.type)
    },
    isSet () {
      return this.type === 'object' && this.modelValue instanceof Set
    },
  },
  methods: {
    getTypeFn (v) {
      let _type = typeof v;
      // console.log('_type', _type, v)
      if (_type === 'object') {
        if (v === null) {
          return "null";
        }
        if (Array.isArray(v)) {
          return "array";
        }
        return "object";
      }
      if (_type === 'string'){
        if (v.length > this.longText){
          _type = 'longtext'
        }
      }
      return _type;
    },
    isPrimitiveFn (type) {
      return !(type === 'array' || type === 'object' || type === 'function' || type === 'longtext');
    },
    escapeQuotesFn (text){
      return this.escapeQuotes
        ? text.replaceAll('"','\\"')
        : text
    }
  },
  components: {
    NodeComplex,
    NodePrimitive
  }
}
</script>
