import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/users/auth'

const VITE_API_URL = import.meta.env.VITE_API_URL

export interface Admin {
  id: number
  nama: string
  email: string
  role: string
  is_active: boolean
  status?: string
}

function authHeaders() {
  const auth = useAuthStore()
  return { Authorization: `Bearer ${auth.accessToken}` }
}

export const useAdminStore = defineStore('admin', () => {
  const admins = ref<Admin[]>([])
  const isLoading = ref(false)

  async function fetchAdmins(query = '') {
    isLoading.value = true
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('search', query.trim())

      const res = await fetch(`${VITE_API_URL}/api/admin/?${params}`, {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Gagal memuat data admin')

      const result = await res.json()
      admins.value = result.map((a: Admin) => ({
        ...a,
        status: a.is_active ? 'Aktif' : 'Non-Aktif',
      }))
    } finally {
      isLoading.value = false
    }
  }

  async function addAdmin(body: Record<string, string>) {
    const res = await fetch(`${VITE_API_URL}/api/admin/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw { status: res.status, data: data }
    await fetchAdmins()
    return data
  }

  async function updateAdmin(id: number, body: Record<string, string>) {
    const res = await fetch(`${VITE_API_URL}/api/admin/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Server Error' }))
      throw { status: res.status, data: errorData }
    }

    return await res.json()
  }

  async function deleteAdmin(id: number) {
    const res = await fetch(`${VITE_API_URL}/api/admin/delete/${id}/`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (!res.ok) {
      const data = await res.json()
      throw { status: res.status, data: data }
    }
    await fetchAdmins()
  }

  async function fetchAdminById(id: string | number) {
    const res = await fetch(`${VITE_API_URL}/api/admin/`, {
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Gagal memuat data admin')

    const result = await res.json()
    const admin = result.find((a: any) => a.id === Number(id))
    if (!admin) throw new Error('Data admin tidak ditemukan')
    return admin
  }

  return { admins, isLoading, fetchAdmins, fetchAdminById, addAdmin, updateAdmin, deleteAdmin }
})
