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
        :class="{'vue-dd-f-name': isFunction}">{{ name }}<span v-show="level !== 0">:</span>
      </span>
      <span v-show="name && isIterable && isRefReactive"
            @mousedown="preventSelect($event)"
            style="user-select:none">&nbsp;</span>
      <span v-if="isIterable && isReactive"
            @click="toggleOpen"
            @mousedown="preventSelect($event)"
            class="vue-dd-reactive"
            title="Reactive">R</span>
      <span v-else-if="isIterable && isRef"
            @click="toggleOpen"
            @mousedown="preventSelect($event)"
            class="vue-dd-ref"
            title="Ref">Ref</span>
      <span v-else-if="isFunction"
            @click="toggleOpen"
            @mousedown="preventSelect($event)"
            class="vue-dd-f"
            title="Function">f</span>
      <span v-show="name || isIterable && isRefReactive || isFunction"
            @click="toggleOpen"
            @mousedown="preventSelect($event)">&nbsp;</span>
      <pre v-if="open && isFunction"
           @click="toggleOpen" class="vue-dd-f-start"
           v-html="functionName"></pre>
      <span v-show="open && isIterable"
            @click="toggleOpen"
            @mousedown="preventSelect($event)"
            v-html="charOpen" />
      <span v-show="open && isIterable"
            class="vue-dd-instance">{{ instanceOf }}</span>
      <span v-if="!open && isIterable && isPromise"
            class="vue-dd-instance vue-dd-promise-prototype">Promise</span>
    </div>
    <div
      :class="{
      'vue-dd-open': open,
      'vue-dd-inline': !open,
      'vue-dd-complex': true
    }"
      @click="open = true">
      <div>
        <span v-show="!open && isIterable" v-html="charOpen" />
        <span v-if="isIterable && isPromise" class="vue-dd-promise-content">&lt;pending&gt;</span>
        <button
          v-show="(!open && !expanded) && isIterable"
          @click="expand"
          class="vue-dd-expand">...
        </button>
        <div ref="surround">
          <div v-if="(open || expanded) && isIterable">
            <div v-for="(key, index) in (open ? items : items.slice(0,7))">
              <node-primitive
                v-if="isPrimitiveFn(getTypeFn(modelValue[key]))"
                :model-value="modelValue[key]"
                :name="keyOrNothing(key)"
                :size="useSize"
                :position="index+1"
                :type="getTypeFn(modelValue[key])" />
              <node-complex
                v-else
                :model-value="modelValue[key]"
                :pointer="pointer ? pointer + '.'+key : key"
                :name="keyOrNothing(key)"
                :primary="open"
                :parentExpanded="expanded"
                :level="level+1"
                :openLevel="useOpenLevel"
                :openSpecific="useOpenSpecific"
                :size="useSize"
                :position="index+1"
                :type="getTypeFn(modelValue[key])"
                :getTypeFn="getTypeFn"
                :isPrimitiveFn="isPrimitiveFn"
              />
            </div>
          </div>
        </div>

        <div v-if="isFunction" class="vue-dd-f-content">
          <pre v-if="open && functionContent" v-html="functionContent"></pre>
          <span v-else-if="open && !functionContent"></span>
          <span v-else class="vue-dd-f-inline">{{ primary ? items : functionInline(name) }}<span
            v-if="size && position && position !== size">,&nbsp;</span>
          </span>
        </div>

        <span v-if="isIterable" v-html="charClose" />
        <span v-if="isIterable && size && position && position !== size">,&nbsp;</span>
      </div>
    </div>
  </div>
</template>

<script>
import { version, isReactive, isRef } from 'vue';
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
  if (pointer in allPointerCache) {
    // console.log('using pointer cache', pointer)
    allPointer = allPointerCache[pointer]
  } else {
    const pointerParts = pointer.split('.')
    pointerParts.pop()
    let allPointer = ''
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
    // paddingLeft: String,
    position: Number,
    size: Number,
    openLevel: [Number, String],
    name: String,
    openSpecific: Array,
    isPrimitiveFn: Function,
    getTypeFn: Function,
    parentExpanded: Boolean
  },
  data () {
    return {
      hideTimes: 0,
      isMounted: false,
      open: false,
      expanded: this.primary,
      items: [],
      getSize: 0,
      useOpenLevel: this.openLevel,
      useOpenSpecific: this.openSpecific,
      originalOpenLevel: this.openLevel
    }
  },
  methods: {
    // prevent select on double click
    preventSelect (event) {
      if (event.detail > 1) {
        event.preventDefault();
      }
    },
    keyOrNothing (key) {
      return this.type === 'array' ? '' : key
    },
    expand () {
      this.expanded = true
    },
    async toggleOpen () {

      // const initial = this.$refs.surround.style.display
      // if (this.open) {
      //   this.$refs.surround.style.display = 'none'
      // }

      this.open = !this.open

      // try {
      //   await this.$nextTick()
      // } catch (e) {
      //   do nothing
      // }

      // this.$refs.surround.style.display = initial
    },
    makeItems () {
      switch (true) {
        case this.type === 'object':
          let keys = [], i = 0;
          for (let k in this.modelValue) {
            keys[i] = k
            i++
          }
          this.getSize = i
          return keys
        case this.type === 'array':
          this.getSize = this.modelValue.length
          return [...Array(this.modelValue.length).keys()]
        default:
          return this.modelValue
      }
    },
    functionInline (name) {
      let f = this.items.toString()
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

    useSize () {
      return this.getSize
    },
    instanceOf () {
      const name = typeof this.modelValue === 'object'
      && 'constructor' in this.modelValue
      && 'name' in this.modelValue.constructor
        ? this.modelValue.constructor.name
        : ''
      return ['Object', 'Array'].includes(name) ? '' : name
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
            const parts = el.split('.')
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
    functionName () {
      const str = String(this.items).trim().split('\n')[0]
      const code = typeof hljs !== "undefined"
        ? hljs.highlight(str, { language: 'javascript' }).value
        : str
      const comma = this.open
      && !this.functionContent
      && this.size
      && this.position
      && this.position !== this.size
        ? ',' : ''
      return code + comma
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

        const highlight = typeof hljs !== 'undefined'
          ? hljs.highlight(code, { language: 'javascript' }).value
          : code

        const comma = code && this.size && this.position && this.position !== this.size ? ',' : ''

        return highlight + comma
      }

      return ''
    },
    isRefReactive () {
      return this.isRef || this.isReactive
    },
    isIterable () {
      return this.type === 'array' || this.type === 'object'
    },
    isArray () {
      return this.type === 'array'
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

    modelValue: {
      handler (value) {
        this.items = this.makeItems()
      },
      deep: true,
      immediate: true
    },

    openLevel: {
      handler (value) {

        // open levels up to this one
        if (typeof this.openLevel === 'number') {
          if (this.level < this.openLevel) {
            this.open = true
          }
        }

        // handle several levels to pre-open
        if (typeof this.openLevel === 'string') {

          let levels = this.openLevel.split(',')

          for (let i = 0; i < levels.length; i++) {
            if (this.level === parseInt(levels[i])) {
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

          if (this.pointer in value || allPointer in value) {
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
          if (this.hideTimes === 0){
            resetLevels()
          } else {
            // setTimeout speeds up hiding significantly
            setTimeout(() => resetLevels(), 0)
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
