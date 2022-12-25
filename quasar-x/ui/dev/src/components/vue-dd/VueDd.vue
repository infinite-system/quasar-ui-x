<template>
  <div
    class="vue-dd"
    :class="{'vue-dd-dark':dark}">
    <node-base
      :modelValue="modelValue"
      :name="name"
      :primary="true"
      :level="0"
      :openLevel="openLevel"
      :escapeQuotes="escapeQuotes"
      :openSpecific="openSpecific"
      :deep="deep"
    />
  </div>
</template>
<script>
import NodeBase from './NodeBase.vue';

export default {
  name: 'VueDd',
  props: {
    modelValue: undefined,
    name: { type: String, default: '' },
    openLevel: { type: [Number, Array], default: 0 },
    openSpecific: { type: [Array, Object], default: () => [] },
    dark: { type: Boolean, default: true },
    fontFamily: { type: String, default: '"JetBrains Mono", "Courier", serif' },
    fontSize: { type: String, default: '11px' },
    paddingLeft: { type: String, default: '10px' },
    escapeQuotes: { type: Boolean, default: true },
    deep: { type: Boolean, default: true },
  },
  components: {
    NodeBase
  }
}
</script>
<style>
div.vue-dd, div.vue-dd pre {
  font-family: v-bind(fontFamily);
  font-size: v-bind(fontSize);
}

div.vue-dd {
  text-align: left;
  color: #4e5e6b;
  padding: 2px 5px 2px 3px;
  transition: 0.2s;
  margin-bottom: 2px;
  background: #fff6de;
  border-radius: 3px;
  border:1px solid #d7ccae;
  overflow-y: auto;
  overflow-x: auto;
  max-height: 500px;
}

div.vue-dd.vue-dd-dark {
  background: #000;
  border:1px solid #000
}

div.vue-dd-open {
  display: block;
  overflow:visible;
  scrollbar-color: #ccc white;
  scrollbar-width: thin;
}

.vue-dd::-webkit-scrollbar {
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.05);
}

.vue-dd::-webkit-scrollbar-corner {
  background: rgba(255, 255, 255, 0.05);
}
.vue-dd::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.2);
}

/*.vue-dd-dark div.vue-dd-open::-webkit-scrollbar {*/
/*  height: 4px;*/
/*  background: rgba(0, 0, 0, 0.05);*/
/*}*/

/*.vue-dd-dark div.vue-dd-open::-webkit-scrollbar-thumb {*/
/*  border-radius: 5px;*/
/*  background: rgba(255, 255, 0, 0.2);*/
/*}*/

div.vue-dd-open > div {
  /*float: left;*/
  display: block;
  overflow: visible;
}

div.vue-dd-open > div > div {
  display: block;
  padding-left: v-bind(paddingLeft);
}

div.vue-dd-inline, div.vue-dd-inline div, div.vue-dd-inline div div {
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
  cursor: pointer;
  color: grey;
  font-family: Georgia, 'Courier', serif;
  font-size: 9px;
  font-style: italic;
  letter-spacing: -0.5px;
  display: inline-block;
  padding-top: 0;
}

.vue-dd-function-f {
  -webkit-user-select: none;
  user-select: none;
  cursor: default;
  color: grey;
  font-style: italic;
  font-family: Georgia, serif;
  font-size: 9px;
  letter-spacing: -1px;
  display: inline-block;
  padding-top: 1px;
  padding-left: 5px;
}

.vue-dd-function-inline {
  color: #4e5e6b;
  font-style: italic;
}

.vue-dd-function-content {
  padding: 0;
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
  font-size: 9px;
  padding: 0 3px 0 2px;
  transition: 0.2s;
}

button.vue-dd-arrow:hover {
  color: darkgrey;
}

button.vue-dd-arrow-collapsed {
  transform: rotate(-90deg);
}

.vue-dd-r {
  -webkit-user-select: none;
  user-select: none;
  cursor: default;
  color: grey;
  font-family: Georgia, 'Courier', serif;
  font-size: 9px;
  font-style: italic;
  letter-spacing: -0.5px;
  display: inline-block;
}

.vue-dd-name {
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
  /*font-style: italic;*/
}

.vue-dd-prototype {
  padding-left: 5px;
  font-style: italic;
  color: #21BA45;
  -webkit-user-select: none;
  user-select: none;
}

.vue-dd-promise-prototype {
  padding-right: 5px;
  padding-left: 0;
}

.vue-dd-promise-content {
  padding: 0 4px;
  font-style: italic;
  -webkit-user-select: none;
  user-select: none;
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
  font-weight: normal;
}
</style>
<style>
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
