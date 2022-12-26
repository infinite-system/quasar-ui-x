<template>
  <div ref="root" :id="rootId" :class="['vue-dd', {
    'vue-dd-inline': inline,
    'vue-dd-open': openClass,
    'vue-dd-dark': dark,
  }, css]">
    <node-primitive
      v-if="primitive"

      :root="$refs.root"
      :rootId="rootId"

      :modelValue="modelValue"
      :name="name"
      :rootName="name"
      :scrollTo="scrollTo"
      :escapeQuotes="escapeQuotes"

      pointer=""
      :type="type"
      :escapeQuotesFn="escapeQuotesFn" />
    <node-complex
      v-else

      :root="$refs.root"
      :rootId="rootId"

      :modelValue="modelValue"
      :name="name"
      :rootName="name"
      :paddingLeft="paddingLeft"
      :openLevel="openLevel"
      :openSpecific="openSpecific"
      :scrollTo="scrollTo"
      :escapeQuotes="escapeQuotes"
      :longText="longText"
      :preview="preview"
      :previewInitial="previewInitial"
      :deep="isSet ? false : deep"
      :watch="watch"

      pointer=""
      :type="type"
      :getTypeFn="getTypeFn"
      :isPrimitiveFn="isPrimitiveFn"
      :escapeQuotesFn="escapeQuotesFn"

      @toggle="toggle"
      @open="open"
    />
  </div>
</template>
<script>
import NodeComplex from "./NodeComplex.vue";
import NodePrimitive from "./NodePrimitive.vue";

let uniqueId = 1
const rootId = () => `dd_${uniqueId++}`

export default {
  name: 'VueDd',
  inheritAttrs: false,
  emits: ['open', 'toggle'],
  props: {
    // main options
    modelValue: undefined,
    name: { type: String, default: '' },
    openLevel: { type: [Number, Array], default: 0 },
    openSpecific: { type: Array, default: () => [] },
    scrollTo: { type: String, default: '' },
    preview: { type: [Number, Boolean], default: 5 },
    previewInitial: { type: Boolean, default: true },
    escapeQuotes: { type: Boolean, default: false },
    longText: { type: Number, default: 50 },
    // styling options
    class: { type: [String, Array, Object], default: '' },
    inline: { type: Boolean, default: true },
    dark: { type: Boolean, default: true },
    fontFamily: { type: String, default: '"JetBrains Mono", "Courier", serif' },
    fontSize: { type: String, default: '.7rem' },
    lineHeight: { type: String, default: '1rem' },
    paddingLeft: { type: String, default: '.7rem' },
    maxHeight: { type: String, default: '500px' },
    maxWidth: { type: String, default: 'auto' },
    position: { type: String, default: 'relative' },
    // watch options
    watch: { type: Boolean, default: true },
    deep: { type: Boolean, default: true },
  },
  data () {
    return {
      rootId: rootId(),
      openClass: false,
      css: this.class,
    }
  },
  mounted () {
    if (this.scrollTo !== '') {
      setTimeout(() => {
        const scrollEl = document.getElementById(`${this.name}${this.rootId}.${this.scrollTo}`)
        if (scrollEl) {
          this.$refs.root.scrollTop = scrollEl.offsetTop
          scrollEl.classList.add('vue-dd-highlight')
        }
      }, 0)
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

    open (setup) {
      const { open, pointer, level } = setup
      this.openClass = open
      this.$emit('open', setup)
    },
    toggle (setup) {
      const { event, open, pointer, level } = setup
      this.open(setup)
      this.$emit('toggle', setup)
    },
    getTypeFn (value) {
      let _type = typeof value;

      if (_type === 'object') {
        if (value === null) {
          return "null";
        }
        if (Array.isArray(value)) {
          return "array";
        }
        return "object";
      }
      if (_type === 'string') {
        if (value.length > this.longText) {
          _type = 'longtext'
        }
      }
      return _type;
    },
    isPrimitiveFn (type) {
      return !(type === 'array' || type === 'object' || type === 'function' || type === 'longtext');
    },
    escapeQuotesFn (text) {
      return this.escapeQuotes ? text.replaceAll('"', '\\"') : text
    }
  },
  components: {
    NodeComplex,
    NodePrimitive
  }
}
</script>
<style>
.vue-dd, .vue-dd pre {
  font-family: v-bind(fontFamily);
  font-size: v-bind(fontSize);
  line-height: v-bind(lineHeight);
}

.vue-dd {
  max-height: v-bind(maxHeight);
  max-width: v-bind(maxWidth);
  position: v-bind(position);

  text-align: left;
  color: #4e5e6b;
  padding: 2px 5px 2px 3px;
  transition: 0.2s;
  margin-bottom: 2px;
  background: #fff6de;
  border-radius: 3px;
  border: 1px solid #d7ccae;
  overflow-y: auto;
  overflow-x: auto;
  scroll-behavior: smooth;
}

.vue-dd-open {

}

.vue-dd-open.vue-dd-inline {
  display: block;
}

.vue-dd-inline:not(.vue-dd-open) {
  display: inline-block;
  margin-right: 3px;
}

.vue-dd.vue-dd-dark {
  background: #000;
  border: 1px solid #000
}

.vue-dd::-webkit-scrollbar {
  width: 4px;
  height: 4px;
  background: rgba(0, 0, 0, 0.05);
}

.vue-dd::-webkit-scrollbar-corner {
  background: rgba(0, 0, 0, 0.05);
}

.vue-dd::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.1);
}

.vue-dd.vue-dd-dark::-webkit-scrollbar {
  background: rgba(255, 255, 255, 0.05);
}

.vue-dd.vue-dd-dark::-webkit-scrollbar-corner {
  background: rgba(255, 255, 255, 0.05);
}

.vue-dd.vue-dd-dark::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.vue-dd-box-open {
  display: block;
  overflow: visible;
  scrollbar-color: #ccc white;
  scrollbar-width: thin;
}

.vue-dd-box-open > div {
  /*float: left;*/
  display: block;
  overflow: visible;
}

.vue-dd-box-open > div > div {
  display: block;
  padding-left: v-bind(paddingLeft);
}

.vue-dd-box-inline, .vue-dd-box-inline div, .vue-dd-box-inline div div {
  display: inline-block;
  cursor: default;
  white-space: nowrap;
}

div.vue-dd-start {
  display: inline-block;
}

button.vue-dd-expand {
  vertical-align: middle;
  background: none;
  border: 0;
  border-radius: 3px;
  padding: 3px 0 3px 0;
  line-height: 10px;
  cursor: default;
  color: grey;
  -webkit-user-select: none;
  user-select: none;
}

button.vue-dd-expand:hover {
  background: rgba(50, 50, 50, 0.2);
  color: #21BA45;
}

button.vue-dd-expand:active {
  padding-top: 4px;
  padding-bottom: 2px !important;
}

.vue-dd-ref {
  -webkit-user-select: none;
  user-select: none;
  cursor: default;
  color: grey;
  font-family: Georgia, 'Courier', serif;
  font-size: 9px;
  font-style: italic;
  letter-spacing: -0.5px;
  display: inline-block;
  padding: 0 3px 0 0;
}

.vue-dd-r {
  -webkit-user-select: none;
  user-select: none;
  cursor: default;
  color: grey;
  font-family: Georgia, 'Courier', serif;
  font-size: 80%;
  font-style: italic;
  letter-spacing: -0.5px;
  display: inline-block;
  padding: 0 3px 0 0;
}

.vue-dd-function-f {
  -webkit-user-select: none;
  user-select: none;
  cursor: default;
  color: grey;
  font-style: italic;
  font-family: Georgia, serif;
  font-size: 80%;
  letter-spacing: -1px;
  display: inline-block;
  padding: 0 3px 0 3px;
}

.vue-dd-function-inline {
  color: #4e5e6b;
  font-style: italic;
}

.vue-dd-function-start {
  display: inline;
  color: #55606a;
}


.vue-dd-dark pre.vue-dd-function-start {
  padding: 0;
  margin: 0;
  color: #cbeaff;
}

.vue-dd-dark pre.vue-dd-function-start .hljs-property {
  color: #6ec3ff;
}


.vue-dd-function-content {
  padding: 0;
}


.vue-dd-function-content pre {
  padding: 0;
  margin: 0;
  color: #333;
}

.vue-dd-dark .vue-dd-function-content pre .hljs-property {
  color: #6ec3ff;
}

.vue-dd-dark .vue-dd-function-content pre {
  padding: 0;
  margin: 0;
  color: #cbeaff;
}

button.vue-dd-arrow {
  border: none;
  display: inline-block;
  background: none;
  color: slategrey;
  cursor: default;
  -webkit-user-select: none;
  user-select: none;
  font-size: 80%;
  padding: 0 3px 0 2px;
  transition: 0.2s;
}

button.vue-dd-arrow:hover {
  color: darkgrey;
}

button.vue-dd-arrow-collapsed {
  padding: 0 2px 0 2px;
  transform: rotate(-90deg);
}

.vue-dd-name {
  padding-right: 0;
  cursor: default;
  color: #1b7ccf;
}

.vue-dd-dark .vue-dd-name {
  cursor: default;
  color: #09BAFF;
}

.vue-dd-name.vue-dd-function-name {
  color: #d114d1;
  font-weight: normal;
}

.vue-dd-instance {
  user-select: none;
  padding-left: 5px;
  font-style: italic;
  color: #21BA45;
  -webkit-user-select: none;
}

.vue-dd-size {
  user-select: none;
  margin-left: 3px;
  padding: 0 5px;
  border-radius: 10px;
  background: #ffeed0;
  color: #999;
  font-size: 80%;
  line-height: 100%;
}

.vue-dd-dark .vue-dd-size {
  background: #131313;
  color: #555;
}

.vue-dd-promise-prototype {
  padding-right: 5px;
  padding-left: 0;
}

.vue-dd-promise-content {
  -webkit-user-select: none;
  user-select: none;
  padding: 0 4px;
  font-style: italic;
}

.vue-dd-highlight {
  animation: vue-dd-highlight 1s;
}

.vue-dd-dark .vue-dd-highlight {
  animation: vue-dd-highlight-on-dark 1s;
}

@keyframes vue-dd-highlight-on-dark {
  from {
    background-color: yellow;
  }
}

@keyframes vue-dd-highlight {
  from {
    background-color: yellowgreen;
  }
}

.vue-dd-null, .vue-dd-undefined {
  color: slategrey;
}

.vue-dd-boolean {
  color: green;
}

.vue-dd-false {
  cursor: default;
  color: #f34747;
}

.vue-dd-string {
  color: forestgreen;
}

.vue-dd-dark .vue-dd-key {
  color: #c7e5fe;
}

.vue-dd-key {
  color: #384e61;
  padding-left: 1px;
  padding-right: 2px;
  font-weight: normal;
}
</style>
<style>
/* highlight.js styles */
.vue-dd pre code.hljs {
  display: block;
  overflow-x: auto;
  padding: 1em;
}

.vue-dd code.hljs {
  padding: 3px 5px;
}

.vue-dd .hljs {
  color: #abb2bf;
  background: #282c34;
}

.vue-dd .hljs-comment, .vue-dd .hljs-quote {
  color: #5c6370;
  font-style: italic;
}

.vue-dd .hljs-doctag, .vue-dd .hljs-formula, .vue-dd .hljs-keyword {
  color: #c678dd;
}

.vue-dd .hljs-deletion, .vue-dd .hljs-name, .vue-dd .hljs-section, .vue-dd .hljs-selector-tag, .vue-dd .hljs-subst {
  color: #e06c75;
}

.vue-dd .hljs-literal {
  color: #56b6c2;
}

.vue-dd .hljs-addition, .vue-dd .hljs-attribute, .vue-dd .hljs-meta .hljs-string, .vue-dd .hljs-regexp, .vue-dd .hljs-string {
  color: #98c379;
}

.vue-dd .hljs-attr, .vue-dd .hljs-number, .vue-dd .hljs-selector-attr, .vue-dd .hljs-selector-class, .vue-dd .hljs-selector-pseudo, .vue-dd .hljs-template-variable, .vue-dd .hljs-type, .vue-dd .hljs-variable {
  color: #d19a66;
}

.vue-dd .hljs-bullet, .vue-dd .hljs-link, .vue-dd .hljs-meta, .vue-dd .hljs-selector-id, .vue-dd .hljs-symbol, .vue-dd .hljs-title {
  color: #61aeee;
}

.vue-dd .hljs-built_in, .vue-dd .hljs-class .hljs-title, .vue-dd .hljs-title.class_ {
  color: #e6c07b;
}

.vue-dd .hljs-emphasis {
  font-style: italic;
}

.vue-dd .hljs-strong {
  font-weight: 700;
}

.vue-dd .hljs-link {
  text-decoration: underline;
}
</style>
