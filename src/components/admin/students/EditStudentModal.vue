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
        class="
          fixed inset-0 z-[100] flex items-center justify-center
          bg-black/40 p-3 backdrop-blur-sm
        "
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
            class="
              relative flex max-h-[calc(100dvh-32px)] w-full max-w-[640px]
              flex-col overflow-visible rounded-[20px] border-[0.5px]
              border-[var(--app-modal-border)] bg-[var(--app-modal-bg)]
              px-6 py-5 font-[var(--font-sans)] text-[var(--app-modal-text)]
              shadow-[0_-2px_4px_rgba(0,0,0,0.2),0_2px_4px_rgba(255,255,255,0.4)]
              backdrop-blur-[10px]
              max-[640px]:px-4 max-[640px]:py-4
            "
          >
            <div class="flex min-h-0 h-full flex-col gap-4">
              <div class="flex justify-end">
                <button
                  type="button"
                  aria-label="Tutup modal"
                  class="
                    inline-flex items-center justify-center
                    text-[var(--app-modal-text)]
                    transition-opacity duration-200 ease-in-out
                    hover:opacity-70
                    focus:outline-none focus-visible:outline focus-visible:outline-2
                    focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]
                  "
                  @click="closeModal"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>

              <div class="flex flex-col items-center gap-1.5">
                <Edit class="h-9 w-9 text-[var(--app-accent)]" />

                <b
                  class="
                    text-center text-[length:var(--app-card-title-font)]
                    font-bold leading-[1.2] text-[var(--app-modal-text)]
                  "
                >
                  Edit Data
                </b>
              </div>

              <div class="min-h-0 flex-1 overflow-y-auto pr-1 -mr-1">
                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                    <label
                      class="
                        text-[length:var(--app-input-label-font)]
                        font-semibold leading-[1.2] text-[var(--app-modal-text)]
                      "
                    >
                      Jenis Kelamin
                    </label>

                    <VDropdown
                      v-model="form.jenis_kelamin"
                      :options="genderOptions"
                      placeholder="Pilih jenis kelamin"
                    />

                    <div
                      v-if="errors.jenis_kelamin"
                      class="
                        text-[length:var(--app-input-helper-font)]
                        font-light leading-[1.5] text-[var(--app-danger)]
                      "
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
                    class="
                      m-0 md:col-span-2
                      text-[length:var(--app-font-sm)]
                      font-medium leading-[1.5] text-[var(--app-danger)]
                    "
                  >
                    {{ submitError || studentStore.error }}
                  </p>
                </div>
              </div>

              <div class="flex items-center justify-end gap-3">
                <VButton
                  variant="secondary"
                  class="min-w-[92px]"
                  :disabled="studentStore.loading"
                  @click="closeModal"
                >
                  Batal
                </VButton>

                <VButton
                  variant="primary"
                  class="min-w-[92px]"
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