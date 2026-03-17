import { createRouter, createWebHistory } from 'vue-router'
import AdminManagementView from '../views/management/AdminManagementView.vue'
import StatusView from '@/views/StatusView.vue'
import LoginView from '@/views/users/LoginView.vue'
import RegisterView from '@/views/users/RegisterView.vue'
import ParentListView from '@/views/admin/parents/ListView.vue'
import ForgetPasswordView from '@/views/users/ForgotPasswordView.vue'
import VerifyOTPView from '@/views/users/VerifyOTPView.vue'
import SetNewPasswordView from '@/views/users/SetNewPasswordView.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import TeacherListView from '../views/admin/teacher/ListView.vue'
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
      path: '/admin/management',
      name: 'admin-management',
      component: AdminManagementView,
    },
    { path: '/admin/management/create', redirect: '/admin/management' },

    {
      path: '/admin/management/edit/:id',
      name: 'admin-edit',
      redirect: '/admin/management',
    },

    // Admin routes
    {
      path: '/admin/parents',
      name: 'admin-parents',
      component: ParentListView,
    },
    {
      path: '/admin/teachers',
      name: 'admin-guru-list',
      component: TeacherListView,
    },
    {
      path: '/admin/teachers/create',
      name: 'admin-guru-create',
      redirect: '/admin/teachers',
    },
    {
      path: '/admin/teachers/:id/edit',
      name: 'admin-guru-edit',
      redirect: '/admin/teachers',
    },
    {
      path: '/admin/students',
      name: 'student-management',
      component: StudentManagementView,
    },
    // Legacy redirects
    { path: '/admin-management', redirect: '/admin/management' },
    { path: '/admin-management/create', redirect: '/admin/management/create' },
    { path: '/admin-management/edit/:id', redirect: '/admin/management/edit/:id' },
    { path: '/admin/guru', redirect: '/admin/teachers' },
    { path: '/admin/guru/tambah', redirect: '/admin/teachers/create' },
    { path: '/admin/guru/:id/edit', redirect: '/admin/teachers/:id/edit' },
    { path: '/students', redirect: '/admin/students' },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: VerifyEmailView,
    },
    // TODO: Add routes for other roles here
  ],
})

export default router
