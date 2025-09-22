<script setup lang="js">
import { useRoute } from 'vue-router'
import App from '../../App.vue'

const { uid, preflight } = useRoute().meta
</script>

<template>
  <App :uid="uid" :taxonomy="preflight" />
</template>

<!-- in jsx
 
import { defineComponent, ref } from 'vue'
import App from '../../App'
import { getTaxonomy } from '../../../js/services/dataService'

export default defineComponent({
  async beforeRouteEnter(to, from, next) {
    try {
      const preflight = await getTaxonomy(to.params.projectId)
      
      if (!preflight) {
        next({ name: 'not-found' })
        return
      }
      
      // JB: this will probably not work because at this point the component has gone through created lifecycle and reactivity is not initialised - both uid and preflight will be set to null
      next(vm => {
        vm.preflight = preflight
        vm.uid = to.params.projectId
      })
    } catch (error) {
      next({ name: 'not-found' })
    }
  },

  setup() {
    const uid = ref(null)
    const preflight = ref(null)

    return () => (
      <App uid={uid.value} taxonomy={preflight.value} />
    )
  }
})
-->

<!-- in jsx endgoal
 
export default defineComponent({
  setup() {
    const { uid, preflight } = useRoute().meta

    return () => (
      <App uid={uid} taxonomy={preflight} />
    )
  }
})
-->