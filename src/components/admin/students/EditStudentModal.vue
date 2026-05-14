<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { X, Edit } from 'lucide-vue-next'
import { useStudentStore, type Student } from '@/stores/students'
import { parseFieldErrors } from '@/lib/fieldErrors'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VTextareaField from '@/components/common/VTextareaField.vue'

const props = defineProps<{
  isOpen: boolean
  student: Student | null
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'updated'): void
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

const errors = reactive<Record<string, string>>({
  nama: '',
  nis: '',
  email: '',
  jenis_kelamin: '',
  kelas: '',
  tanggal_lahir: '',
})

const submitError = ref('')

const genderOptions = [
  { label: 'Laki-laki', value: 'L' },
  { label: 'Perempuan', value: 'P' },
]

const resetForm = () => {
  if (props.student) {
    form.nama = props.student.nama || ''
    form.nis = props.student.nis || ''
    form.nisn = props.student.nisn || ''
    form.email = props.student.email || ''
    form.jenis_kelamin = props.student.jenis_kelamin || 'L'
    form.kelas = props.student.kelas || ''
    form.tanggal_lahir = props.student.tanggal_lahir || ''
    form.no_hp = props.student.no_hp || ''
    form.alamat = props.student.alamat || ''
  }

  errors.nama = ''
  errors.nis = ''
  errors.email = ''
  errors.jenis_kelamin = ''
  errors.kelas = ''
  errors.tanggal_lahir = ''
  submitError.value = ''
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) resetForm()
  },
)

watch(
  () => props.student,
  () => {
    if (props.isOpen) resetForm()
  },
)

const closeModal = () => {
  emit('update:isOpen', false)
}

const validateForm = () => {
  errors.nama = ''
  errors.nis = ''
  errors.email = ''
  errors.jenis_kelamin = ''
  errors.kelas = ''
  errors.tanggal_lahir = ''

  let isValid = true

  if (!form.nama.trim()) {
    errors.nama = 'Nama wajib diisi.'
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
  if (!validateForm() || !props.student) return

  submitError.value = ''

  try {
    await studentStore.updateStudent(props.student.id_siswa, {
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

    emit('updated')
    closeModal()
  } catch (error) {
    const parsed = parseFieldErrors(
      error,
      {
        nama: ['nama', 'name'],
        nis: ['nis', 'nomor_induk', 'nomor induk'],
        kelas: ['kelas', 'class'],
        tanggal_lahir: ['tanggal_lahir', 'tanggal lahir', 'birth_date'],
      },
      'Gagal memperbarui data siswa.',
    )

    errors.nama = parsed.fieldErrors.nama || ''
    errors.nis = parsed.fieldErrors.nis || ''
    errors.kelas = parsed.fieldErrors.kelas || ''
    errors.tanggal_lahir = parsed.fieldErrors.tanggal_lahir || ''
    submitError.value = parsed.generalError || studentStore.error
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
            class="student-modal-panel relative w-full max-w-[720px] max-h-[calc(100vh-2rem)] flex flex-col"
          >
            <div class="flex h-full flex-col gap-5 min-h-0">
              <div class="flex justify-end">
                <button type="button" @click="closeModal" class="student-modal-close">
                  <X class="w-5 h-5" />
                </button>
              </div>

              <div class="flex flex-col items-center gap-2">
                <Edit class="w-12 h-12 text-[var(--app-accent)]" />

                <b class="student-modal-title text-[1.7rem] leading-[120%]">
                  Edit Data
                </b>
              </div>

              <div class="flex-1 overflow-y-auto pr-1 -mr-1">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <VInputField
                    v-model="form.nama"
                    label="Nama"
                    type="text"
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
                  />

                  <VInputField
                    v-model="form.nisn"
                    label="NISN"
                    type="text"
                    placeholder="Masukkan NISN"
                  />

                  <div class="flex flex-col gap-2">
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
                    v-if="submitError || studentStore.error"
                    class="md:col-span-2 text-[0.93rem] text-[var(--app-danger)] font-medium"
                  >
                    {{ submitError || studentStore.error }}
                  </p>
                </div>
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
                  {{ studentStore.loading ? 'Menyimpan...' : 'Simpan' }}
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