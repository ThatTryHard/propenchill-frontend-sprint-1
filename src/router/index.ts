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
import ForgetPasswordView from '@/views/users/ForgotPasswordView.vue'
import VerifyOTPView from '@/views/users/VerifyOTPView.vue'
import SetNewPasswordView from '@/views/users/SetNewPasswordView.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import TeacherListView from '../views/admin/teacher/ListView.vue'
import TeacherCreateView from '../views/admin/teacher/CreateView.vue'
import TeacherEditView from '../views/admin/teacher/EditView.vue'
import StudentManagementView from '@/views/students/StudentManagementView.vue'
import VerifyEmailView from '@/views/users/VerifyEmailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        {
          path: '/login',
          name: 'login',
          component: LoginView,
        },
        {
          path: '/register',
          name: 'register',
          component: RegisterView,
        },
        {
          path: '/password-reset',
          name: 'password-reset',
          component: ForgetPasswordView,
        },
        {
          path: '/verify-otp/',
          name: 'verify-otp',
          component: VerifyOTPView,
        },
        {
          path: '/set-new-password',
          name: 'set-new-password',
          component: SetNewPasswordView,
        },
      ],
    },
    {
      path: '/status',
      name: 'status',
      component: StatusView,
    },
    {
      path: '/admin-management',
      name: 'admin-management',
      component: AdminManagementView,
    },
    { path: '/admin-management/create', component: AdminCreateView },

    {
      path: '/admin-management/edit/:id',
      name: 'admin-edit',
      component: () => import('@/views/users/AdminEditView.vue'),
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
    {
      path: '/admin/guru',
      name: 'admin-guru-list',
      component: TeacherListView,
    },
    {
      path: '/admin/guru/tambah',
      name: 'admin-guru-create',
      component: TeacherCreateView,
    },
    {
      path: '/admin/guru/:id/edit',
      name: 'admin-guru-edit',
      component: TeacherEditView,
    },
    {
      path: '/students',
      name: 'student-management',
      component: StudentManagementView,
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: VerifyEmailView,
    },
    // TODO: Add routes for other roles here
  ],
})

export default router
