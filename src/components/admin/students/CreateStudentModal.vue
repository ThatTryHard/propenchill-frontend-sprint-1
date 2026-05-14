<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { X, PlusCircle } from 'lucide-vue-next'
import { useStudentStore } from '@/stores/students'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VTextareaField from '@/components/common/VTextareaField.vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'created'): void
}>()

const studentStore = useStudentStore()

const form = reactive({
  nama: '',
  nis: '',
  nisn: '',
  email: '',
  jenis_kelamin: 'L' as 'L' | 'P',
  kelas: '',
  tanggal_lahir: '',
  no_hp: '',
  alamat: '',
})

const errors = reactive({
  nama: '',
  nis: '',
  nisn: '',
  email: '',
  jenis_kelamin: '',
})

const submitError = ref('')

const genderOptions = [
  { label: 'Laki-laki', value: 'L' },
  { label: 'Perempuan', value: 'P' },
]

const resetForm = () => {
  form.nama = ''
  form.nis = ''
  form.nisn = ''
  form.email = ''
  form.jenis_kelamin = 'L'
  form.kelas = ''
  form.tanggal_lahir = ''
  form.no_hp = ''
  form.alamat = ''

  errors.nama = ''
  errors.nis = ''
  errors.nisn = ''
  errors.email = ''
  errors.jenis_kelamin = ''
  submitError.value = ''
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) resetForm()
  },
)

const closeModal = () => {
  emit('update:isOpen', false)
}

const validateForm = () => {
  errors.nama = ''
  errors.nis = ''
  errors.nisn = ''
  errors.email = ''
  errors.jenis_kelamin = ''

  let isValid = true

  if (!form.nama.trim()) {
    errors.nama = 'Nama wajib diisi.'
    isValid = false
  }

  if (!form.nis.trim()) {
    errors.nis = 'NIS wajib diisi.'
    isValid = false
  } else if (!/^\d+$/.test(form.nis)) {
    errors.nis = 'NIS harus berupa angka.'
    isValid = false
  } else if (form.nis.length !== 10) {
    errors.nis = 'NIS harus terdiri dari 10 digit.'
    isValid = false
  }

  if (!form.nisn.trim()) {
    errors.nisn = 'NISN wajib diisi.'
    isValid = false
  } else if (!/^\d+$/.test(form.nisn)) {
    errors.nisn = 'NISN harus berupa angka.'
    isValid = false
  } else if (form.nisn.length !== 10) {
    errors.nisn = 'NISN harus terdiri dari 10 digit.'
    isValid = false
  }

  if (!form.email.trim()) {
    errors.email = 'Email wajib diisi.'
    isValid = false
  }

  if (!form.jenis_kelamin) {
    errors.jenis_kelamin = 'Jenis kelamin wajib dipilih.'
    isValid = false
  }

  return isValid
}

const isSubmitDisabled = computed(() => studentStore.loading)

const handleSubmit = async () => {
  if (!validateForm()) return

  submitError.value = ''

  try {
    await studentStore.createStudent({
      nama: form.nama.trim(),
      nis: form.nis.trim(),
      nisn: form.nisn.trim(),
      email: form.email.trim(),
      jenis_kelamin: form.jenis_kelamin,
      kelas: form.kelas.trim() || null,
      tanggal_lahir: form.tanggal_lahir || null,
      no_hp: form.no_hp.trim() || null,
      alamat: form.alamat.trim() || null,
    })

    emit('created')
    closeModal()
  } catch {
    // error sudah ditangani store
  }
}
</script>

<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="closeModal"
      >
        <transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="isOpen"
            class="student-modal-panel relative w-full max-w-[720px]"
          >
            <div class="flex flex-col gap-5">
              <div class="flex justify-end">
                <button type="button" @click="closeModal" class="student-modal-close">
                  <X class="w-5 h-5" />
                </button>
              </div>

              <div class="flex flex-col items-center gap-2">
                <PlusCircle class="w-12 h-12 text-[var(--app-accent)]" />

                <b class="student-modal-title text-[1.7rem] leading-[120%]">
                  Tambah Data
                </b>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <VInputField
                  v-model="form.nama"
                  label="Nama"
                  placeholder="Masukkan nama"
                  :state="errors.nama ? 'error' : 'default'"
                  :message="errors.nama"
                />

                <VInputField
                  v-model="form.email"
                  label="Email"
                  type="email"
                  placeholder="Masukkan email"
                  :state="errors.email ? 'error' : 'default'"
                  :message="errors.email"
                />

                <VInputField
                  v-model="form.nis"
                  label="NIS"
                  type="text"
                  placeholder="Masukkan NIS"
                  :state="errors.nis ? 'error' : 'default'"
                  :message="errors.nis"
                />

                <VInputField
                  v-model="form.nisn"
                  label="NISN"
                  type="text"
                  placeholder="Masukkan NISN"
                  :state="errors.nisn ? 'error' : 'default'"
                  :message="errors.nisn"
                />

                <div class="flex flex-col gap-2 w-full">
                  <label class="text-[1rem] font-semibold leading-[120%] text-[var(--app-modal-text)]">
                    Jenis Kelamin
                  </label>

                  <VDropdown
                    v-model="form.jenis_kelamin"
                    :options="genderOptions"
                    placeholder="Pilih jenis kelamin"
                  />

                  <div
                    v-if="errors.jenis_kelamin"
                    class="text-[0.85rem] font-light leading-[150%] text-[var(--app-danger)]"
                  >
                    {{ errors.jenis_kelamin }}
                  </div>
                </div>

                <VInputField
                  v-model="form.kelas"
                  label="Kelas"
                  type="text"
                  placeholder="Masukkan kelas"
                />

                <VInputField
                  v-model="form.tanggal_lahir"
                  label="Tanggal Lahir"
                  type="date"
                  placeholder="Pilih tanggal lahir"
                />

                <VInputField
                  v-model="form.no_hp"
                  label="No HP"
                  type="text"
                  placeholder="Masukkan no hp"
                />

                <VTextareaField
                  v-model="form.alamat"
                  label="Alamat"
                  placeholder="Masukkan alamat"
                  :rows="3"
                  class="md:col-span-2"
                />

                <p
                  v-if="studentStore.error"
                  class="md:col-span-2 text-[0.93rem] text-[var(--app-danger)] font-medium"
                >
                  {{ studentStore.error }}
                </p>
              </div>

              <div class="flex items-center justify-end gap-2">
                <VButton
                  variant="secondary"
                  class="!w-[132px]"
                  :disabled="studentStore.loading"
                  @click="closeModal"
                >
                  Batal
                </VButton>

                <VButton
                  variant="primary"
                  class="!w-[132px]"
                  :disabled="isSubmitDisabled"
                  @click="handleSubmit"
                >
                  {{ studentStore.loading ? 'Menyimpan...' : 'Tambah' }}
                </VButton>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.student-modal-panel {
  overflow: visible;
  border: 0.5px solid var(--app-modal-border);
  border-radius: 24px;
  background: var(--app-modal-bg);
  color: var(--app-modal-text);
  padding: 28px 32px;
  box-shadow:
    0px -2px 4px rgba(0, 0, 0, 0.2),
    0px 2px 4px rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
}

.student-modal-close,
.student-modal-title {
  color: var(--app-modal-text);
}

.student-modal-close {
  transition: opacity 0.2s ease;
}

.student-modal-close:hover {
  opacity: 0.7;
}
</style>