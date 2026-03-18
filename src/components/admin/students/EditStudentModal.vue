<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { X, Edit } from 'lucide-vue-next'
import { useStudentStore, type Student } from '@/stores/students'
import { parseFieldErrors } from '@/lib/fieldErrors'
import VButton from '@/components/common/VButton.vue'

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
  kelas: '',
  tanggal_lahir: '',
})

const errors = reactive({
  nama: '',
  nis: '',
  kelas: '',
  tanggal_lahir: '',
})

const submitError = ref('')

const resetForm = () => {
  if (props.student) {
    form.nama = props.student.nama
    form.nis = props.student.nis
    form.kelas = props.student.kelas
    form.tanggal_lahir = props.student.tanggal_lahir
  }

  errors.nama = ''
  errors.nis = ''
  errors.kelas = ''
  errors.tanggal_lahir = ''
  submitError.value = ''
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      resetForm()
    }
  }
)

watch(
  () => props.student,
  () => {
    if (props.isOpen) {
      resetForm()
    }
  }
)

const closeModal = () => {
  emit('update:isOpen', false)
}

const validateForm = () => {
  errors.nama = ''
  errors.nis = ''
  errors.kelas = ''
  errors.tanggal_lahir = ''

  let isValid = true

  if (!form.nama.trim()) {
    errors.nama = 'Nama lengkap wajib diisi.'
    isValid = false
  }

  if (!form.nis.trim()) {
    errors.nis = 'Nomor induk wajib diisi.'
    isValid = false
  } else if (!/^\d+$/.test(form.nis)) {
    errors.nis = 'Nomor induk harus berupa angka.'
    isValid = false
  }

  if (!form.kelas.trim()) {
    errors.kelas = 'Kelas/Jabatan wajib diisi.'
    isValid = false
  }

  if (!form.tanggal_lahir) {
    errors.tanggal_lahir = 'Tanggal lahir wajib diisi.'
    isValid = false
  }

  return isValid
}

const isSubmitDisabled = computed(() => studentStore.loading)

const handleSubmit = async () => {
  if (!validateForm() || !props.student) return

  submitError.value = ''

  try {
    await studentStore.updateStudent(props.student.student_id, {
      nama: form.nama.trim(),
      nis: form.nis.trim(),
      kelas: form.kelas.trim(),
      tanggal_lahir: form.tanggal_lahir,
    })

    emit('updated')
    closeModal()
  } catch (error) {
    const parsed = parseFieldErrors(error, {
      nama: ['nama', 'name'],
      nis: ['nis', 'nomor_induk', 'nomor induk'],
      kelas: ['kelas', 'class'],
      tanggal_lahir: ['tanggal_lahir', 'tanggal lahir', 'birth_date'],
    }, 'Gagal memperbarui data siswa.')

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
            class="relative w-full max-w-[643px] rounded-[24px] border-[0.5px] border-transparent overflow-hidden backdrop-blur-[10px] px-8 py-7 text-[#111827] shadow-[0px_-2px_4px_rgba(0,0,0,0.2),0px_2px_4px_rgba(255,255,255,0.4)]"
            style="
              background:
                linear-gradient(#f8fafc, #f8fafc) padding-box,
                linear-gradient(
                    243.74deg,
                    rgba(255, 255, 255, 0.05),
                    #ffffff 47.12%,
                    rgba(255, 255, 255, 0.05)
                  )
                  border-box;
            "
          >
            <div class="flex flex-col gap-5">
              <div class="flex justify-end">
                <button
                  type="button"
                  @click="closeModal"
                  class="text-[#111827] hover:opacity-70 transition"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <div class="flex flex-col items-center gap-2">
                <Edit class="w-12 h-12 text-[#3f9760]" />
                <b class="text-[24px] leading-[120%]">Edit Data</b>
              </div>

              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-[16px] leading-[120%] font-semibold">
                    Nama Lengkap
                  </label>
                  <div class="rounded-[12px] border-2 border-[#b2b5ba] px-[19px] py-[14px]">
                    <input
                      v-model="form.nama"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      class="w-full appearance-none bg-transparent border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 text-[16px] leading-[150%] text-[#111827] placeholder:text-[#b2b5ba]"
                    />
                  </div>
                  <p v-if="errors.nama" class="text-[12px] text-[#A0453B]">
                    {{ errors.nama }}
                  </p>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-[16px] leading-[120%] font-semibold">
                    Nomor Induk
                  </label>
                  <div class="rounded-[12px] border-2 border-[#b2b5ba] px-[19px] py-[14px]">
                    <input
                      v-model="form.nis"
                      type="text"
                      inputmode="numeric"
                      placeholder="Masukkan nomor induk"
                      class="w-full appearance-none bg-transparent border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 text-[16px] leading-[150%] text-[#111827] placeholder:text-[#b2b5ba]"
                    />
                  </div>
                  <p v-if="errors.nis" class="text-[12px] text-[#A0453B]">
                    {{ errors.nis }}
                  </p>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-[16px] leading-[120%] font-semibold">
                    Kelas/Jabatan
                  </label>
                  <div class="rounded-[12px] border-2 border-[#b2b5ba] px-[19px] py-[14px]">
                    <input
                      v-model="form.kelas"
                      type="text"
                      placeholder="Contoh: XII IPA 1 / Kepala TU"
                      class="w-full appearance-none bg-transparent border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 text-[16px] leading-[150%] text-[#111827] placeholder:text-[#b2b5ba]"
                    />
                  </div>
                  <p v-if="errors.kelas" class="text-[12px] text-[#A0453B]">
                    {{ errors.kelas }}
                  </p>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-[16px] leading-[120%] font-semibold">
                    Tanggal Lahir
                  </label>
                  <div class="rounded-[12px] border-2 border-[#b2b5ba] px-[19px] py-[14px]">
                    <input
                      v-model="form.tanggal_lahir"
                      type="date"
                      class="w-full appearance-none bg-transparent border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 text-[16px] leading-[150%] text-[#111827]"
                    />
                  </div>
                  <p v-if="errors.tanggal_lahir" class="text-[12px] text-[#A0453B]">
                    {{ errors.tanggal_lahir }}
                  </p>
                </div>

                <p
                  v-if="submitError"
                  class="text-[13px] text-[#A0453B] font-medium"
                >
                  {{ submitError }}
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
