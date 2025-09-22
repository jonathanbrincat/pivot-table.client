import './css/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import RootView from './views/RootView.vue'
import IndexView from './views/projects/IndexView.vue'
import ErrorView from './views/ErrorView.vue'
import { getTaxonomy } from '../../../common/js/services/dataService'

const routerVue = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      // component: RootView,
      children: [
        {
          path: '',
          name: 'root',
          component: IndexView,
        },
        {
          path: 'projects/:projectId',
          name: 'about',
          component: () => import('./views/projects/ProjectView.vue'),
          beforeEnter: async (to, from, next) => {
            try {
              const preflight = await getTaxonomy(to.params.projectId)
              if (!preflight) {
                // next({ name: 'error' })
                // return
                throw new Error('Project data not found')
              }
              to.meta.preflight = preflight
              to.meta.uid = to.params.projectId

              // console.log('Preflight data fetched:', to.meta.preflight)
              // console.log('Route params:', to.meta.uid)

              next()
            } catch (error) {
              console.log('Error fetching preflight data:', error)
              next({ name: 'error' })
            }
          },
        },
      ]
    },
    {
      path: '/:catchall(.*)*',
      name: 'error',
      component: ErrorView,
    },
  ],
})

const app = createApp(RootView)
app.use(routerVue)
app.mount('#app')
