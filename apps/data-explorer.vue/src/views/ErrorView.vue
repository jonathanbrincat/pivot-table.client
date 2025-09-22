<script setup lang="js">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div id="error-page">
    <h1>Oops!</h1>
    <p>Sorry, an unexpected error has occurred.</p>
    <!-- <p>
      <i>{error.statusText || error.message}</i>
    </p> -->
  </div>
</template>
