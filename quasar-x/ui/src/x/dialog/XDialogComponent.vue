<script lang="ts">export default { name: 'XDialogComponent', inheritAttrs: false }</script>
<script setup lang="ts">
import type { PropType } from 'vue'
import XDialog from "@/x/dialog/XDialog.vue";
import { propsXDialogComponent } from "../types/x.ts";
const props = defineProps(propsXDialogComponent)

</script>
