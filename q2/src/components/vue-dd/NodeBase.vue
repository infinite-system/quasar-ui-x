<template>
  <node-primitive
    v-if="primitive"
    :model-value="modelValue"
    :name="name"
    :position="position"
    :size="size"
    :type="type" />
  <node-complex
    v-else
    :model-value="modelValue"
    :pointer="pointer"
    :type="type"
    :level="level"
    :position="position"
    :size="size"
    :paddingLeft="paddingLeft"
    :name="name"
    :openLevel="openLevel"
    :openSpecific="openSpecific"
    :getTypeFn="getTypeFn"
    :isPrimitiveFn="isPrimitiveFn"
    :primary="primary" />
</template>
<script>
import NodeComplex from './NodeComplex.vue';
import NodePrimitive from './NodePrimitive.vue';

export default {
  name: 'NodeBase',
  props: {
    modelValue: undefined,
    pointer: [String, Number],
    primary: Boolean,
    openLevel: { type: [Number, String], default: 0 },
    openSpecific: { type: Array, default: () => [] },
    level: Number,
    paddingLeft: String,
    position: Number,
    size: Number,
    name: String,
  },
  data () {
    return {
      isMounted: false
    }
  },
  computed: {
    type () {
      return this.getTypeFn(this.modelValue)
    },
    primitive () {
      return this.isPrimitiveFn(this.type)
    }
  },
  methods: {
    getTypeFn (v) {
      let _type = typeof (v);
      if (_type === 'object') {
        if (v === null) {
          return "null";
        }
        if (Array.isArray(v)) {
          return "array";
        }
        return "object";
      }
      return _type;
    },
    isPrimitiveFn (type) {
      return !(type === 'array' || type === 'object' || type === 'function');
    },
  },
  components: {
    NodeComplex,
    NodePrimitive
  }
}
</script>
