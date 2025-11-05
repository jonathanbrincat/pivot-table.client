import './css/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import RootView from './views/RootView.vue'
import IndexView from './views/projects/IndexView.vue'
import ErrorView from './views/ErrorView.vue'

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
            // JB: former getTaxonomy() preload (SB specific requirement for UI) and handler redundant

            to.meta.uid = to.params.projectId

            next()
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
