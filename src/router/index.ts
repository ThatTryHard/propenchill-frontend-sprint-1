import { createRouter, createWebHistory } from 'vue-router'
import StatusView from '@/views/StatusView.vue'
import LoginView from '@/views/users/LoginView.vue'
import ParentListView from '@/views/admin/parents/ListView.vue'
import ParentCreateView from '@/views/admin/parents/CreateView.vue'
import ParentEditView from '@/views/admin/parents/EditView.vue'

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

    // Admin routes
    {
      path: '/admin/parents',
      name: 'admin-parents',
      component: ParentListView,
    },
    {
      path: '/admin/parents/create',
      name: 'admin-parents-create',
      component: ParentCreateView,
    },
    {
      path: '/admin/parents/:id/edit',
      name: 'admin-parents-edit',
      component: ParentEditView,
    },

    // TODO: Add routes for other roles here
  ],
})

export default router
