<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useParentStore, validateParentForm } from '@/stores/parents'
import { useStudentStore } from '@/stores/students'
import { useAuthStore } from '@/stores/users/auth'

import VModal from '@/components/common/VModal.vue'
import VInputField from '@/components/common/VInputField.vue'
import VTextareaField from '@/components/common/VTextareaField.vue'
import VButton from '@/components/common/VButton.vue'
import VAlert from '@/components/common/VAlert.vue'
import VChip from '@/components/common/VChip.vue'

type AlertType = 'success' | 'error' | 'warning' | 'information'

const props = defineProps<{
  isOpen: boolean
  parentId: number | null
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'updated', message: string): void
}>()

const store = useParentStore()
const studentStore = useStudentStore()
const authStore = useAuthStore()

const form = reactive({
  nama: '',
  email: '',
  no_hp: '',
  tanggal_lahir: '',
  alamat: '',
})

const errors = reactive({
  nama: '',
  email: '',
  no_hp: '',
  alamat: '',
})

const alert = reactive({
  visible: false,
  type: 'error' as AlertType,
  title: '',
  message: '',
})

const isFetching = ref(false)
const isLoading = ref(false)

const studentQuery = ref('')
const studentSearchTimer = ref<number | null>(null)
const studentResults = ref<any[]>([])
const selectedChildren = ref<any[]>([])
const existingChildren = ref<any[]>([])
const initialChildren = ref<any[]>([])
const autocompleteOpen = ref(false)
const autocompleteRef = ref<HTMLElement | null>(null)

const toDateInputValue = (value: string | null | undefined): string => {
  if (!value) return ''
  return (value.includes('T') ? value.split('T')[0] : value) || ''
}

// Student search functions
const searchStudents = async (q: string) => {
  if (!q || q.trim().length < 2) {
    studentResults.value = []
    return
  }

  try {
    await studentStore.fetchStudents(1, 10, q.trim(), '')
    studentResults.value = studentStore.students
  } catch {
    studentResults.value = []
  }
}

const onStudentQueryInput = (val: string) => {
  studentQuery.value = val
  if (studentSearchTimer.value) window.clearTimeout(studentSearchTimer.value)
  studentSearchTimer.value = window.setTimeout(() => searchStudents(val), 300)
}

const addChild = (s: any) => {
  if (!selectedChildren.value.find((c) => c.id_siswa === s.id_siswa)) {
    selectedChildren.value.push(s)
  }
  studentQuery.value = ''
  studentResults.value = []
  autocompleteOpen.value = false
}

const removeChild = (id_siswa: number) => {
  selectedChildren.value = selectedChildren.value.filter((c) => c.id_siswa !== id_siswa)
}

const removeExistingChild = (id_siswa: number) => {
  existingChildren.value = existingChildren.value.filter((c) => c.id_siswa !== id_siswa)
}

const handleClickOutsideAutocomplete = (event: MouseEvent) => {
  if (autocompleteRef.value && !autocompleteRef.value.contains(event.target as Node)) {
    autocompleteOpen.value = false
  }
}

const resetErrors = () => {
  errors.nama = ''
  errors.email = ''
  errors.no_hp = ''
  errors.alamat = ''
  studentQuery.value = ''
  studentResults.value = []
  selectedChildren.value = []
  existingChildren.value = []
  initialChildren.value = []
  autocompleteOpen.value = false
}

const resetAlert = () => {
  alert.visible = false
  alert.type = 'error'
  alert.title = ''
  alert.message = ''
}

const resetForm = () => {
  form.nama = ''
  form.email = ''
  form.no_hp = ''
  form.tanggal_lahir = ''
  form.alamat = ''
}

const handleModalVisibilityChange = (value: boolean) => {
  if (!value && isLoading.value) return

  emit('update:isOpen', value)

  if (!value) {
    resetErrors()
    resetAlert()
  }
}

const loadParent = async () => {
  if (!props.parentId) return

  isFetching.value = true
  resetErrors()
  resetAlert()

  try {
    const parent = await store.fetchParentById(String(props.parentId))

    form.nama = parent.nama || ''
    form.email = parent.email || ''
    form.no_hp = parent.no_hp || ''
    form.tanggal_lahir = toDateInputValue(parent.tanggal_lahir)
    form.alamat = parent.alamat || ''

    try {
      const viteApiUrl = import.meta.env.VITE_API_URL
      const res = await fetch(`${viteApiUrl}/api/siswa/?parent_id=${props.parentId}`, {
        headers: { Authorization: `Bearer ${authStore.accessToken}` },
      })

      if (res.ok) {
        const data = await res.json()
        const studentList = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
        existingChildren.value = [...studentList]
        initialChildren.value = [...studentList]
      } else {
        existingChildren.value = []
        initialChildren.value = []
      }
    } catch {
      existingChildren.value = []
      initialChildren.value = []
    }
  } catch (error) {
    alert.visible = true
    alert.type = 'error'
    alert.title = 'Gagal Memuat Data'
    alert.message = (error as Error).message || 'Data wali murid gagal dimuat.'
  } finally {
    isFetching.value = false
  }
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      loadParent()
      return
    }

    resetForm()
    resetErrors()
    resetAlert()
  },
)

watch(
  () => props.parentId,
  () => {
    if (props.isOpen) {
      loadParent()
    }
  },
)

watch(() => form.nama, () => { errors.nama = '' })
watch(() => form.email, () => { errors.email = '' })
watch(() => form.no_hp, () => { errors.no_hp = '' })

const validateForm = () => {
  const result = validateParentForm(form)
  errors.nama = result.nama || ''
  errors.email = result.email || ''
  errors.no_hp = result.no_hp || ''
  return Object.keys(result).length === 0
}

const closeModal = () => {
  handleModalVisibilityChange(false)
}

const handleSubmit = async () => {
  if (!props.parentId || isLoading.value) return
  if (!validateForm()) return

  isLoading.value = true
  resetAlert()

  try {
    const body: Record<string, string> = {
      nama: form.nama.trim(),
      email: form.email.trim(),
      no_hp: form.no_hp.trim(),
    }

    if (form.tanggal_lahir) {
      body.tanggal_lahir = form.tanggal_lahir
    }

    if (form.alamat.trim()) {
      body.alamat = form.alamat.trim()
    }

    // Update parent
    const data = await store.updateParent(String(props.parentId), body)

    try {
      const currentChildrenIds = new Set(existingChildren.value.map((c) => c.id_siswa))
      const originalChildrenIds = new Set(initialChildren.value.map((c: any) => c.id_siswa))

      const childrenToUnlink = Array.from(originalChildrenIds).filter(
        (id) => !currentChildrenIds.has(id)
      )

      if (childrenToUnlink.length > 0) {
        const unlinks = childrenToUnlink.map((id) => studentStore.assignParent(id, null))
        await Promise.all(unlinks)
      }
    } catch (e) {
      console.warn('Failed to unlink some children', e)
    }

    try {
      if (selectedChildren.value.length) {
        const assigns = selectedChildren.value.map((c) =>
          studentStore.assignParent(c.id_siswa, props.parentId)
        )
        await Promise.all(assigns)
      }
    } catch (e) {
      console.warn('Failed to assign some children to parent', e)
    }

    emit('updated', data.message || 'Data wali murid berhasil diperbarui.')
    emit('update:isOpen', false)
  } catch (error) {
    alert.visible = true
    alert.type = 'error'
    alert.title = 'Gagal Memperbarui Data'
    alert.message = (error as Error).message || 'Data wali murid gagal diperbarui.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutsideAutocomplete)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutsideAutocomplete)
})
</script>

<template>
  <VModal
    :is-open="isOpen"
    title="Edit Wali Murid"
    max-width-class="max-w-[550px]"
    :buttons="[]"
    @update:is-open="handleModalVisibilityChange"
  >
    <div class="flex flex-col w-full text-left font-sans text-[var(--app-text)] max-h-[75vh] overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-[var(--app-border)] scrollbar-track-transparent">

      <div v-if="isFetching" class="py-8 text-center text-[var(--app-muted)] text-[14px]">
        Memuat data...
      </div>

      <form v-else class="flex flex-col gap-4 w-full pb-2" @submit.prevent="handleSubmit">
        <VAlert
          v-if="alert.visible"
          :visible="alert.visible"
          :type="alert.type"
          :title="alert.title"
          :message="alert.message"
          @close="alert.visible = false"
        />

        <div v-if="existingChildren.length > 0" class="flex flex-col gap-2">
          <label class="text-[14px] font-bold leading-[120%] text-[var(--app-heading)]">
            Anak-anak (Terhubung)
          </label>
          <div class="flex flex-wrap gap-2">
            <VChip
              v-for="child in existingChildren"
              :key="child.id_siswa"
              :removable="true"
              @remove="removeExistingChild(child.id_siswa)"
            >
              {{ child.nama }} ({{ child.nisn }})
            </VChip>
          </div>
        </div>

        <div class="flex flex-col gap-2 w-full" ref="autocompleteRef">
          <label class="text-[14px] font-bold leading-[120%] text-[var(--app-heading)]">
            Hubungkan Siswa Baru
          </label>

          <div class="relative">
            <VInputField
              :modelValue="studentQuery"
              placeholder="Cari berdasarkan nama siswa"
              @update:modelValue="onStudentQueryInput(String($event || ''))"
              @focusin="autocompleteOpen = true"
            />

            <div
              v-if="autocompleteOpen && studentResults.length > 0"
              class="absolute top-[calc(100%+6px)] left-0 w-full bg-[var(--app-card)] border border-[var(--app-border)] rounded-[12px] shadow-lg z-20 overflow-hidden"
            >
              <ul class="m-0 p-0 list-none max-h-[240px] overflow-auto">
                <li
                  v-for="s in studentResults"
                  :key="s.id_siswa"
                  class="px-4 py-3 cursor-pointer text-[14px] text-[var(--app-text)] hover:bg-[var(--app-bg)] transition-colors"
                  @mousedown.prevent="addChild(s)"
                >
                  <div class="font-semibold">{{ s.nama }}</div>
                  <div class="text-[12px] text-[var(--app-muted)] mt-0.5">
                    NIS: {{ s.nis }} • NISN: {{ s.nisn }}
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div v-if="selectedChildren.length" class="flex flex-wrap gap-2 mt-2">
            <VChip
              v-for="c in selectedChildren"
              :key="c.id_siswa"
              :removable="true"
              @remove="removeChild(c.id_siswa)"
            >
              {{ c.nama }} ({{ c.nisn }})
            </VChip>
          </div>
        </div>

        <hr class="border-[var(--app-border)] my-1" />

        <VInputField
          v-model="form.nama"
          label="Nama Lengkap"
          placeholder="Masukkan nama lengkap"
          :disabled="isLoading"
          :state="errors.nama ? 'error' : 'default'"
          :message="errors.nama"
        />

        <VInputField
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="Masukkan email"
          :disabled="isLoading"
          :state="errors.email ? 'error' : 'default'"
          :message="errors.email"
        />

        <VInputField
          v-model="form.no_hp"
          label="Nomor HP"
          placeholder="Masukkan nomor HP"
          :disabled="isLoading"
          :state="errors.no_hp ? 'error' : 'default'"
          :message="errors.no_hp"
        />

        <VInputField
          v-model="form.tanggal_lahir"
          label="Tanggal Lahir"
          type="date"
          :disabled="isLoading"
        />

        <VTextareaField
          v-model="form.alamat"
          label="Alamat"
          placeholder="Masukkan alamat"
          :disabled="isLoading"
          :rows="2"
        />

        <div class="flex items-center justify-end gap-3 mt-2">
          <VButton
            type="button"
            variant="secondary"
            class="min-w-[110px]"
            :disabled="isLoading"
            @click="closeModal"
          >
            Batal
          </VButton>

          <VButton
            type="submit"
            variant="primary"
            class="min-w-[110px]"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Menyimpan...' : 'Simpan' }}
          </VButton>
        </div>
      </form>
    </div>
  </VModal>
</template>
