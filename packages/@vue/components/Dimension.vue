<script setup lang="js">
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <li class="dimension__list-item sortable">
    <div class="pivot__dimension">
      <span>{{ props.item.name }}</span>
      <button class="dimension__dropdown-toggle">&#9662;</button>
    </div>
  </li>
</template>

<style>
@import './dimension.css';
</style>