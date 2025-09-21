import './data_explorer/css/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Root from './data_explorer/react/views/root'
import Index from './data_explorer/react/views/projects/index'
import Project, { loader as projectLoader } from './data_explorer/react/views/projects/project'
import ErrorPage from './data_explorer/react/views/error-page'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import RootView from './data_explorer/vue/views/RootView.vue'
import IndexView from './data_explorer/vue/views/projects/IndexView.vue'
import ErrorView from './data_explorer/vue/views/ErrorView.vue'
import { getTaxonomy } from './data_explorer/js/services/dataService'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            element: <Index />
          },
          {
            path: 'projects/:projectId',
            element: <Project />,
            loader: projectLoader,
          },
        ]
      }
    ],
  },
])

ReactDOM
  .createRoot(document.getElementById('app'))
  .render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  )

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
          component: () => import('./data_explorer/vue/views/projects/ProjectView.vue'),
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

              console.log('Preflight data fetched:', to.meta.preflight)
              console.log('Route params:', to.meta.uid)

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
app.mount('#app-vue')
