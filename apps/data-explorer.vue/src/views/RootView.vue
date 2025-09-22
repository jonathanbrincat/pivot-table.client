<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'

// const router = useRouter()
</script>

<template>
  <!-- <div
    id="root"
    :class="[{
      router.state === 'vue-router--loading' ? 'vue-router--loading' : ''
    }]"
  > -->
  <div
    id="root-vue"
  >
    <!-- <Suspense> -->
      <RouterView />
    <!-- </Suspense> -->
  </div>
</template>
