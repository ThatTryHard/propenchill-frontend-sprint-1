import { createRouter, createWebHistory } from 'vue-router'
import StatusView from '../views/StatusView.vue'
import LoginView from '../views/users/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/status',
      name: 'status',
      component: StatusView,
    },
  ],
})

export default router
