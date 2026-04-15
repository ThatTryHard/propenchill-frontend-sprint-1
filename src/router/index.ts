import { createRouter, createWebHistory } from 'vue-router'
import AdminManagementView from '../views/management/AdminManagementView.vue'
import StatusView from '@/views/StatusView.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/users/LoginView.vue'
import RegisterView from '@/views/users/RegisterView.vue'
import ParentListView from '@/views/admin/parents/ListView.vue'
import ForgetPasswordView from '@/views/users/ForgotPasswordView.vue'
import VerifyOTPView from '@/views/users/VerifyOTPView.vue'
import SetNewPasswordView from '@/views/users/SetNewPasswordView.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import TeacherListView from '../views/admin/teacher/ListView.vue'
import TeacherCreateView from '../views/admin/teacher/CreateView.vue'
import TeacherEditView from '../views/admin/teacher/EditView.vue'
import StudentManagementView from '@/views/students/StudentManagementView.vue'
import VerifyEmailView from '@/views/users/VerifyEmailView.vue'
import FormPengajuanSuratView from '@/views/surat_keluar/FormPengajuanSuratView.vue';
import RiwayatPengajuanSuratView from '@/views/surat_keluar/RiwayatPengajuanSuratView.vue';
import DetailPengajuanSuratView from '@/views/surat_keluar/DetailPengajuanSuratView.vue';
import CreateSuratMasukView from '@/views/department_teachers/CreateSuratMasukView.vue'
import TemplateManagementView from '@/views/letter_templates/TemplateManagementView.vue'
import TemplateCreateView from '@/views/letter_templates/TemplateCreateView.vue'
import TemplateEditView from '@/views/letter_templates/TemplateEditView.vue'
import SuratMasukListView from '@/views/department_teachers/SuratMasukListView.vue'
import SuratMasukDetailView from '@/views/department_teachers/SuratMasukDetailView.vue'
import { useAuthStore } from '@/stores/users/auth'
import { useGlobalAlert } from '@/composables/useGlobalAlert'
import SuratAntreanListView from '@/views/surat_antrean/SuratAntreanListView.vue'
import SuratAntreanDetailView from '@/views/surat_antrean/SuratAntreanDetailView.vue'

const departmentRoles = ['BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK']

function resolveSuratAntreanPathByRole(role: string | null, id?: string | number) {
  const suffix = id !== undefined ? `/${id}` : ''

  if (role === 'ADMIN') return `/admin/surat-antrean${suffix}`
  if (role === 'KEPSEK') return `/kepsek/surat-antrean${suffix}`
  if (role && departmentRoles.includes(role)) return `/department-teachers/surat-antrean${suffix}`

  return '/status'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
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
      meta: { requiresAuth: true, roleAccess: ['ADMIN'] },
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
      meta: { requiresAuth: true, roleAccess: ['ADMIN', 'KEPSEK'] },
    },
    {
      path: '/admin/teachers',
      name: 'admin-guru-list',
      component: TeacherListView,
      meta: { requiresAuth: true, roleAccess: ['ADMIN', 'KEPSEK'] },
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
      meta: {
        requiresAuth: true,
        roleAccess: ['ADMIN', 'KEPSEK', 'BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK'],
      },
    },
    {
      path: '/department-teachers/surat-masuk/create',
      name: 'department-teachers-surat-masuk-create',
      component: CreateSuratMasukView,
      meta: {
        requiresAuth: true,
        roleAccess: ['BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK'],
      },
    },
    {
      path: '/department-teachers/surat-masuk',
      name: 'department-teachers-surat-masuk-list',
      component: SuratMasukListView,
      meta: {
        requiresAuth: true,
        roleAccess: ['BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK'],
      },
    },
    {
      path: '/department-teachers/surat-masuk/:id',
      name: 'department-teachers-surat-masuk-detail',
      component: SuratMasukDetailView,
      meta: {
        requiresAuth: true,
        roleAccess: ['BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK'],
      },
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
    {
    path: '/surat-keluar/pengajuan',
    name: 'FormPengajuanSurat',
    component: FormPengajuanSuratView,
    meta: {
      requiresAuth: true,
      roleAccess: ['GURU', 'WALI_MURID', 'ADMIN', 'KEPSEK', 'BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK'],
    },
    },
    {
    path: '/surat-keluar/riwayat',
    name: 'RiwayatPengajuanSurat',
    component: RiwayatPengajuanSuratView,
    meta: {
      requiresAuth: true,
      roleAccess: ['GURU', 'WALI_MURID', 'ADMIN', 'KEPSEK', 'BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK'],
    },
    },
    {
    path: '/surat-keluar/detail/:id',
    name: 'DetailPengajuanSurat',
    component: DetailPengajuanSuratView,
    meta: {
      requiresAuth: true,
      roleAccess: ['GURU', 'WALI_MURID', 'ADMIN', 'KEPSEK', 'BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK'],
    },
    },
    {
      path: '/letter_templates',
      name: 'letter-template-management',
      component: TemplateManagementView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/letter_templates/create',
      name: 'letter-template-create',
      component: TemplateCreateView,
      meta: {
        requiresAuth: true,
        roleAccess: ['ADMIN', 'BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK'],
      },
    },
    {
      path: '/letter_templates/:id/edit',
      name: 'template-edit',
      component: TemplateEditView,
      meta: {
        requiresAuth: true,
        roleAccess: ['ADMIN', 'BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK']
      },
    },
    {
      path: '/admin/surat-antrean',
      name: 'admin-surat-antrean-list',
      component: SuratAntreanListView,
      meta: {
        requiresAuth: true,
        roleAccess: ['ADMIN'],
      },
    },
    {
      path: '/admin/surat-antrean/:id',
      name: 'admin-surat-antrean-detail',
      component: SuratAntreanDetailView,
      meta: {
        requiresAuth: true,
        roleAccess: ['ADMIN'],
      },
    },
    {
      path: '/surat-antrean',
      name: 'surat-antrean-legacy-list',
      meta: {
        requiresAuth: true,
      },
      redirect: () => {
        const authStore = useAuthStore()
        return resolveSuratAntreanPathByRole(authStore.role)
      },
    },
    {
      path: '/surat-antrean/:id',
      name: 'surat-antrean-legacy-detail',
      meta: {
        requiresAuth: true,
      },
      redirect: (to) => {
        const authStore = useAuthStore()
        return resolveSuratAntreanPathByRole(authStore.role, String(to.params.id || ''))
      },
    },
    {
      path: '/department-teachers/surat-antrean',
      name: 'department-teachers-surat-antrean-list',
      component: SuratAntreanListView,
      meta: {
        requiresAuth: true,
        roleAccess: ['BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK'],
      },
    },
    {
      path: '/department-teachers/surat-antrean/:id',
      name: 'department-teachers-surat-antrean-detail',
      component: SuratAntreanDetailView,
      meta: {
        requiresAuth: true,
        roleAccess: ['BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK'],
      },
    },
    {
      path: '/kepsek/surat-antrean',
      name: 'kepsek-surat-antrean-list',
      component: SuratAntreanListView,
      meta: {
        requiresAuth: true,
        roleAccess: ['KEPSEK'],
      },
    },
    {
      path: '/kepsek/surat-antrean/:id',
      name: 'kepsek-surat-antrean-detail',
      component: SuratAntreanDetailView,
      meta: {
        requiresAuth: true,
        roleAccess: ['KEPSEK'],
      },
    },
    // TODO: Add routes for other roles here
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const { showAlert } = useGlobalAlert()
  const isAuthenticated = !!authStore.accessToken
  const userRole = String(authStore.role || '').toUpperCase()

  // 1. Cek apakah halaman butuh login?
  if (to.meta.requiresAuth && !isAuthenticated) {
    showAlert('warning', 'Anda harus login terlebih dahulu.', 'Peringatan')
    return next({ name: 'login' })
  }

  // 2. Cek apakah role user diizinkan masuk ke halaman ini?
  if (to.meta.roleAccess) {
    const allowedRoles = (to.meta.roleAccess as string[]).map((role) => String(role).toUpperCase())
    if (userRole && !allowedRoles.includes(userRole)) {
      showAlert(
        'error',
        'Akses Ditolak: Anda tidak memiliki izin untuk halaman ini.',
        'Akses Ditolak',
      )
      return next(false)
    }
  }

  next()
})

export default router
