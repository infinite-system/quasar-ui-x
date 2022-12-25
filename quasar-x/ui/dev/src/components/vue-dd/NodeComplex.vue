<template>
  <div :class="{'vue-dd-inline': !open}">
    <div class="vue-dd-start">
      <button
        @click="toggleOpen"
        class="vue-dd-arrow"
        :class="{'vue-dd-arrow-collapsed': !open}"
        v-html="'&#x25BC;'"></button>
      <span
        v-if="name"
        @click="toggleOpen"
        @mousedown="preventSelect($event)"
        class="vue-dd-name"
        :class="{'vue-dd-function-name': isFunction}">{{ name }}<span v-show="level !== 0">:</span>
      </span>
      <span v-show="name && isIterable && isRefReactive"
            @mousedown="preventSelect($event)"
            style="user-select:none">&nbsp;</span>
      <span v-if="isIterable && isReactive"
            @click="toggleOpen"
            @mousedown="preventSelect($event)"
            class="vue-dd-r"
            title="Reactive">R</span>
      <span v-else-if="isIterable && isRef"
            @click="toggleOpen"
            @mousedown="preventSelect($event)"
            class="vue-dd-ref"
            title="Ref">Ref</span>
      <span v-else-if="isFunction"
            @click="toggleOpen"
            @mousedown="preventSelect($event)"
            class="vue-dd-function-f"
            title="Function">f</span>
      <span v-show="name || isIterable && isRefReactive || isFunction"
            @click="toggleOpen"
            @mousedown="preventSelect($event)">&nbsp;</span>
      <pre v-if="isFunction && open"
           @click="toggleOpen" class="vue-dd-function-start"
           v-html="functionName"></pre>
      <span v-show="isIterable && open"
            @click="toggleOpen"
            @mousedown="preventSelect($event)"
            v-html="charOpen" />
      <span v-show="isIterable && open"
            class="vue-dd-prototype">{{ prototypeOf }}</span>
      <span v-if="isIterable && isPromise && !open"
            class="vue-dd-prototype vue-dd-promise-prototype">Promise</span>
    </div>
    <div
      :class="{
      'vue-dd-open': open,
      'vue-dd-inline': !open,
      'vue-dd-complex': true
    }"
      @click="open = true">
      <div>
        <span v-show="isIterable && !open" v-html="charOpen" />
        <span v-if="isIterable && isPromise" class="vue-dd-promise-content">&lt;pending&gt;</span>
        <button
          v-show="isIterable && (!open && !expanded)"
          @click="expand"
          class="vue-dd-expand">...
        </button>

        <div v-if="isIterable && (open || expanded)">
          <div v-for="index in (open ? items.length : (items.length > 7 ? 7 : items.length))" :key="index">
            <node-primitive
              v-if="isPrimitiveFn(getSpecialType(items[index-1]))"
              :modelValue="getModelValue(items[index-1])"
              :name="getName(items[index-1])"
              :size="getSize"
              :position="index"
              :escapeQuotes="escapeQuotes"
              :escapeQuotesFn="escapeQuotesFn"
              :type="getSpecialType(items[index-1])" />
            <!--  Handle Map & Set objects -->
            <node-complex
              v-else-if="isMapSet"
              :modelValue="getMapSet[items[index-1]]"
              :pointer="getPointer(items[index-1])"
              :name="getName(items[index-1])"
              :deep="isMap ? deep : false"
              :primary="open"
              :level="level+1"
              :openLevel="useOpenLevel"
              :openSpecific="useOpenSpecific"
              :size="getSize"
              :position="index"
              :type="getSpecialType(items[index-1])"
              :escapeQuotes="escapeQuotes"
              :escapeQuotesFn="escapeQuotesFn"
              :getTypeFn="getTypeFn"
              :isPrimitiveFn="isPrimitiveFn"
            />
            <!--  Handle regular objects -->
            <node-complex
              v-else
              :modelValue="modelValue[items[index-1]]"
              :pointer="getPointer(items[index-1])"
              :name="getName(items[index-1])"
              :primary="open"
              :deep="deep"
              :level="level+1"
              :openLevel="useOpenLevel"
              :openSpecific="useOpenSpecific"
              :size="getSize"
              :position="index"
              :type="getSpecialType(items[index-1])"
              :escapeQuotes="escapeQuotes"
              :escapeQuotesFn="escapeQuotesFn"
              :getTypeFn="getTypeFn"
              :isPrimitiveFn="isPrimitiveFn"
            />
          </div>
        </div>

        <div v-if="isFunction" class="vue-dd-function-content">
          <pre v-if="open && functionContent" v-html="functionContent"></pre>
          <span v-else-if="open && !functionContent"></span>
          <span v-else class="vue-dd-function-inline">{{
              primary
                ? functionInlinePrimary
                : functionInline(name)
            }}<span
              v-if="size && position && position !== size">,&nbsp;</span>
          </span>
        </div>

        <div v-if="isLongText" class="vue-dd-string">
          <span v-if="open">{{longTextContent}}</span>
          <span v-else class="vue-dd-string">{{longTextInline}}</span>
        </div>

        <span v-if="isIterable" v-html="charClose" />
        <span v-if="isIterable && size && position && position !== size">,&nbsp;</span>
      </div>
    </div>
  </div>
</template>

<script>
import { isReactive, isRef } from 'vue';
import NodePrimitive from "./NodePrimitive.vue";

import hljs from './highlight.js/core.min.js';
import javascript from './highlight.js/javascript.min.js';

hljs.registerLanguage('javascript', javascript);

function isPromise (p) {
  return p !== null &&
    typeof p === 'object' &&
    typeof p.then === 'function' &&
    typeof p.catch === 'function';
}

let unwrapCache = {}
let allPointerCache = {}

function getAllPointer (pointer) {
  let allPointer = '*'
  pointer = String(pointer)

  if (pointer in allPointerCache) {
    // console.log('using pointer cache', pointer)
    allPointer = allPointerCache[pointer]
  } else {
    const pointerParts = pointer.split('.')
    pointerParts.pop()
    if (pointerParts.length) {
      allPointer = pointerParts.join('.') + '.*'
    }
    allPointerCache[pointer] = allPointer
  }
  return allPointer
}

export default {
  name: 'NodeComplex',
  props: {
    type: String,
    modelValue: undefined,
    pointer: [String, Number],
    primary: Boolean,
    level: Number,
    deep: { type: Boolean, default: true },
    position: Number,
    size: Number,
    openLevel: [Number, Array],
    name: [String, Number],
    openSpecific: Array,
    longText: Number,
    escapeQuotes: Boolean,
    escapeQuotesFn: Function,
    isPrimitiveFn: Function,
    getTypeFn: Function,
  },
  data () {
    return {
      hideTimes: 0,
      isMounted: false,
      open: false,
      expanded: this.primary,
      // items: this.makeItems(),
      getMapSet: {},
      items: [],
      getSize: 0,
      useOpenLevel: this.openLevel,
      useOpenSpecific: this.openSpecific,
      originalOpenLevel: this.openLevel
    }
  },
  created () {
    this.watch(this.deep)
  },
  methods: {
    watch: function(deep) {
      return this.$watch('modelValue', () => {
        this.items = this.makeItems()
      }, {
        deep: deep,
        immediate: true
      })
    },
    getPointer (index) {
      return this.pointer ? this.pointer + '.' + index : index
    },
    getSpecialType (index) {
      if (this.isMapSet) {
        return this.getTypeFn(this.getMapSet[index])
      } else {
        return this.getTypeFn(this.modelValue[index])
      }
    },
    getModelValue (index) {
      if (this.isMapSet) {
        return this.getMapSet[index]
      } else {
        return this.modelValue[index]
      }
    },
    // prevent select on double click
    preventSelect (event) {
      if (event.detail > 1) {
        event.preventDefault();
      }
    },
    getName (key) {
      // console.log('name', key)
      return this.isArray ? '' : key
    },
    expand () {
      this.expanded = true
    },
    async toggleOpen () {
      this.open = !this.open
    },
    makeItems () {
      switch (true) {
        case this.isObject:
          let keys = [], i = 0;
          switch (true) {
            case this.isSet:
              this.getMapSet = Array.from(this.modelValue)
              keys = [...Array(this.getMapSet.length).keys()]
              this.getSize = this.getMapSet.length
              break;
            case this.isMap:
              this.modelValue.forEach((value, key) => {
                this.getMapSet[key] = value
                keys[i] = key
                i++
              });
              this.getSize = i
              break;
            default:
              for (let k in this.modelValue) {
                keys[i] = k
                i++
              }
              this.getSize = i
          }
          return keys;
        case this.isArray:
          this.getSize = this.modelValue.length
          return [...Array(this.modelValue.length).keys()]
        default:
          return this.modelValue
      }
    },
    functionInline (name) {
      let f = this.modelValue.toString()
      switch (true) {
        case f.startsWith('function '):
          f = f.substring(9).trim()
          if (f.startsWith(name)) {
            f = f.substring(name.length)
          }
          break
        case f.startsWith('()'):
          f = '(){...}'
          break
        case f.startsWith(name):
          f = f.substring(name.length)
          break
      }
      const maxFuncLength = 25
      if (f.length > maxFuncLength) {
        f = f.substring(0, maxFuncLength) + '...'
      }
      return f
    },
  },
  computed: {
    isMap () {
      return this.isObject && this.modelValue instanceof Map
    },
    isSet () {
      return this.isObject && this.modelValue instanceof Set
    },
    isMapSet () {
      return this.isMap || this.isSet
    },
    prototypeOf () {
      const name = this.isObject
      && 'constructor' in this.modelValue
      && 'name' in this.modelValue.constructor
        ? this.modelValue.constructor.name
        : ''
      return name === 'Object' ? '' : name
    },
    unwrapSpecific () {
      let unwrap = {}

      if (this.openSpecific.length) {

        const index = typeof this.openSpecific === 'object'
          ? JSON.stringify(this.openSpecific)
          : this.openSpecific

        if (index in unwrapCache) {
          // console.log('using cache...', this.openSpecific.toString());
          return unwrapCache[index]
        } else {
          this.openSpecific.forEach((el) => {
            const parts = String(el).split('.')
            let pointer = '', i = 0
            for (let k in parts) {
              pointer += (i > 0 ? '.' : '') + parts[k]
              unwrap[pointer] = true
              i++
            }
          })
          unwrapCache[index] = unwrap
          //console.log('unwrapCache', unwrapCache)
        }

      }
      return unwrap
    },
    nextLevel () {
      return this.level + 1
    },
    charOpen () {
      return this.type === 'object' ? "{" : "["
    },
    charClose () {
      return this.type === 'object' ? "}" : "]"
    },
    functionInlinePrimary (name) {
      const length = this.items.toString().length
      const maxLength = 100
      if (length > maxLength) {
        return this.items.toString().substring(0, maxLength) + '...}'
      } else {
        return this.items.toString()
      }
    },
    functionName () {
      let code = String(this.items)
      const newLinePosition = code.indexOf('\n')
      if (newLinePosition >= 0) {
        code = code.substring(0, newLinePosition)
      }
      const highlight = hljs.highlight(code, { language: 'javascript' }).value
      const comma = !this.functionContent && this.shouldComma ? ',' : ''
      return highlight + comma
    },

    functionContent () {
      let lines = String(this.items).trim().split('\n')
      if (lines.length) {
        // calculate extra white space
        const lastLine = lines.length - 1
        const trimLeftSize = lines[lastLine].indexOf('}')

        // trim extra white space on the left, extra tabs/spaces
        lines = lines.map(val => val.substring(trimLeftSize))

        // remove first line as we want to show only content
        lines.shift()

        const code = lines.join('\n')

        const highlight = hljs.highlight(code, { language: 'javascript' }).value

        const comma = code && this.shouldComma ? ',' : ''

        return highlight + comma
      }

      return ''
    },
    shouldComma() {
      return this.size && this.position && this.position !== this.size
    },
    longTextInline(){
      let text = this.modelValue.substring(0, this.longText)
      text = this.escapeQuotesFn(text)
      text = `"${text}..."`

      const comma = this.shouldComma ? ',' : ''

      return text + comma
    },
    longTextContent(){
      let text = this.modelValue
      text = this.escapeQuotesFn(text)
      text = `"${text}"`

      const comma = this.shouldComma ? ',' : ''

      return text + comma
    },
    isLongText() {
      return this.type === 'longtext'
    },
    isRefReactive () {
      return this.isRef || this.isReactive
    },
    isIterable () {
      return this.isArray || this.isObject
    },
    isArray () {
      return this.type === 'array'
    },
    isObject () {
      return this.type === 'object'
    },
    isFunction () {
      return this.type === 'function'
    },
    isPromise () {
      return isPromise(this.modelValue)
    },
    isReactive () {
      return isReactive(this.modelValue)
    },
    isRef () {
      return isRef(this.modelValue)
    }
  },
  watch: {


    openLevel: {
      handler (value) {

        // open levels up to this one
        if (typeof this.openLevel === 'number') {
          if (this.level < this.openLevel) {
            this.open = true
          }
        }

        // handle several levels to pre-open [1,2,3,4]
        if (this.getTypeFn(this.openLevel) === 'array') {
          for (let i = 0; i < this.openLevel.length; i++) {
            if (this.level === parseInt(this.openLevel[i])) {
              this.open = true
            }
          }
        }

      },
      immediate: true
    },

    unwrapSpecific: {
      handler (value) {

        if (this.openSpecific.length
          && typeof this.pointer !== 'undefined'
          && this.pointer !== null) {

          let allPointer = getAllPointer(this.pointer)
          // console.log('allPointer', allPointer, this.pointer)

          if (this.pointer in value || allPointer in value) {
            // $nextTick is necessary here!
            this.$nextTick(() => {
              this.open = true
            })
          }
        }
      },
      immediate: true
    },

    open: {
      handler (value) {

        if (!value) {
          // on initial load this will hide everything
          // even if openSpecific is specified, this complicated
          // logic is necessary
          const resetLevels = () => {
            this.useOpenLevel = 0
            this.useOpenSpecific = []
          }
          if (this.hideTimes === 0) {
            resetLevels()
          } else {
            // setTimeout:1 speeds up hiding significantly
            setTimeout(() => resetLevels(), 1)
          }
          this.hideTimes++
        } else {
          this.useOpenLevel = this.openLevel
          this.useOpenSpecific = this.openSpecific
        }

      },
      immediate: true
    },

    primary (primary) {
      this.expanded = primary;
      this.open = this.open && primary;
    }
  },
  components: {
    NodePrimitive
  }
}
</script>
