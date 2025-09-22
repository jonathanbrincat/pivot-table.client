import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/education',
      name: 'education',
      component: () => import('../views/EducationView.vue'),
    },
    {
      path: '/work-history',
      name: 'work-history',
      component: () => import('../views/WorkHistoryView.vue'),
    },
    {
      path: '/hobbies-and-interests',
      name: 'hobbies-and-interests',
      component: () => import('../views/HobbiesAndInterestsView.vue'),
    },
  ],
})

export default router
