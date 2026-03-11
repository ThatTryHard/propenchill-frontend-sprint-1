import { createRouter, createWebHistory } from 'vue-router'
import AdminManagementView from '../views/users/AdminManagementView.vue'
import AdminCreateView from '../views/users/AdminCreateView.vue'
import AdminEditView from '../views/users/AdminEditView.vue'
import StatusView from '@/views/StatusView.vue'
import LoginView from '@/views/users/LoginView.vue'
import RegisterView from '@/views/users/RegisterView.vue'
import ParentListView from '@/views/admin/parents/ListView.vue'
import ParentCreateView from '@/views/admin/parents/CreateView.vue'
import ParentEditView from '@/views/admin/parents/EditView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/status',
      name: 'status',
      component: StatusView,
    },
    {
      path: '/admin-management',
      name: 'admin-management',
      component: AdminManagementView
    },
    { path: '/admin-management/create', component: AdminCreateView },

    {
      path: '/admin-management/edit/:id', 
      name: 'admin-edit',
      component: () => import('@/views/users/AdminEditView.vue')
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
