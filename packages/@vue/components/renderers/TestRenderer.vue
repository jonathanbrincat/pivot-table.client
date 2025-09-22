<script setup lang="js">
const props = defineProps({
  data: Array,
})
</script>

<template>
  <div class="border-green-500 border-2 p-2">
    <h1 class="text-green-500">Test Renderer</h1>

    <code class="text-xs">{{ props.data }}</code>
  </div>
</template>
