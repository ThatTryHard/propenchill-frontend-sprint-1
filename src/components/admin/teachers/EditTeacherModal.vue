<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Edit, X } from 'lucide-vue-next'
import { useTeacherStore, validateTeacherForm } from '@/stores/teacher'
import { parseFieldErrors } from '@/lib/fieldErrors'
import VButton from '@/components/common/VButton.vue'

const props = defineProps<{ isOpen: boolean; teacherId: number | null }>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'updated', message: string): void
}>()

const store = useTeacherStore()

const form = reactive({ nama: '', email: '', niy: '', jabatan: '' })
const errors = reactive({ nama: '', email: '', niy: '', jabatan: '' })
const isSubmitting = ref(false)
const isFetching = ref(false)
const submitError = ref('')

const closeModal = () => emit('update:isOpen', false)

const resetErrors = () => {
  errors.nama = ''
  errors.email = ''
  errors.niy = ''
  errors.jabatan = ''
  submitError.value = ''
}

const loadTeacher = async () => {
  if (!props.teacherId) return
  isFetching.value = true
  resetErrors()

  try {
    const teacher = await store.fetchTeacherById(props.teacherId)
    form.nama = teacher.nama || ''
    form.email = teacher.email || ''
    form.niy = teacher.niy || ''
    form.jabatan = teacher.jabatan || ''
  } catch (error: any) {
    submitError.value = error?.message || 'Gagal memuat data guru.'
  } finally {
    isFetching.value = false
  }
}

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) await loadTeacher()
  },
)

watch(
  () => props.teacherId,
  async () => {
    if (props.isOpen) await loadTeacher()
  },
)

const validateForm = () => {
  const validationErrors = validateTeacherForm(form)
  errors.nama = validationErrors.nama || ''
  errors.email = validationErrors.email || ''
  errors.niy = validationErrors.niy || ''
  errors.jabatan = validationErrors.jabatan || ''
  return Object.keys(validationErrors).length === 0
}

const isSubmitDisabled = computed(() => isSubmitting.value || isFetching.value)

const handleSubmit = async () => {
  if (!props.teacherId || !validateForm()) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    await store.updateTeacher(props.teacherId, {
      nama: form.nama.trim(),
      email: form.email.trim(),
      niy: form.niy.trim(),
      jabatan: form.jabatan,
    })

    emit('updated', 'Data guru berhasil diperbarui.')
    closeModal()
  } catch (error: any) {
    const parsed = parseFieldErrors(error, {
      nama: ['nama', 'name'],
      email: ['email'],
      niy: ['niy'],
      jabatan: ['jabatan', 'role', 'position'],
    }, 'Gagal memperbarui data guru.')

    errors.nama = parsed.fieldErrors.nama || ''
    errors.email = parsed.fieldErrors.email || ''
    errors.niy = parsed.fieldErrors.niy || ''
    errors.jabatan = parsed.fieldErrors.jabatan || ''
    submitError.value = parsed.generalError
  } finally {
    isSubmitting.value = false
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
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" @click.self="closeModal">
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
                <button type="button" @click="closeModal" class="text-[#111827] hover:opacity-70 transition"><X class="w-5 h-5" /></button>
              </div>

              <div class="flex flex-col items-center gap-2">
                <Edit class="w-12 h-12 text-[#3f9760]" />
                <b class="text-[24px] leading-[120%]">Edit Guru</b>
              </div>

              <div v-if="isFetching" class="text-center text-[14px] text-[#718096] py-8">Memuat data...</div>

              <div v-else class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-[16px] leading-[120%] font-semibold">Nama Lengkap</label>
                  <div class="rounded-[12px] border-2 border-[#b2b5ba] px-[19px] py-[14px]">
                    <input v-model="form.nama" type="text" placeholder="Masukkan nama lengkap" class="w-full appearance-none bg-transparent border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 text-[16px] leading-[150%] text-[#111827] placeholder:text-[#b2b5ba]" />
                  </div>
                  <p v-if="errors.nama" class="text-[12px] text-[#A0453B]">{{ errors.nama }}</p>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-[16px] leading-[120%] font-semibold">Alamat Email</label>
                  <div class="rounded-[12px] border-2 border-[#b2b5ba] px-[19px] py-[14px]">
                    <input v-model="form.email" type="email" placeholder="contoh@sekolah.com" class="w-full appearance-none bg-transparent border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 text-[16px] leading-[150%] text-[#111827] placeholder:text-[#b2b5ba]" />
                  </div>
                  <p v-if="errors.email" class="text-[12px] text-[#A0453B]">{{ errors.email }}</p>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-[16px] leading-[120%] font-semibold">NIY (8 digit)</label>
                  <div class="rounded-[12px] border-2 border-[#b2b5ba] px-[19px] py-[14px]">
                    <input v-model="form.niy" type="text" placeholder="Contoh: 12345678" class="w-full appearance-none bg-transparent border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 text-[16px] leading-[150%] text-[#111827] placeholder:text-[#b2b5ba]" />
                  </div>
                  <p v-if="errors.niy" class="text-[12px] text-[#A0453B]">{{ errors.niy }}</p>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-[16px] leading-[120%] font-semibold">Jabatan</label>
                  <div class="rounded-[12px] border-2 border-[#b2b5ba] px-[19px] py-[14px]">
                    <select v-model="form.jabatan" class="w-full appearance-none bg-transparent border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 text-[16px] leading-[150%] text-[#111827]">
                      <option value="Kepala Sekolah">Kepala Sekolah</option>
                      <option value="Guru Bidang Akademik">Guru Bidang Akademik</option>
                      <option value="Guru Bidang Kesiswaan">Guru Bidang Kesiswaan</option>
                      <option value="Guru Bidang Agama">Guru Bidang Agama</option>
                      <option value="Guru">Guru</option>
                    </select>
                  </div>
                  <p v-if="errors.jabatan" class="text-[12px] text-[#A0453B]">{{ errors.jabatan }}</p>
                </div>

                <p v-if="submitError" class="text-[13px] text-[#A0453B] font-medium">{{ submitError }}</p>
              </div>

              <div class="flex items-center justify-end gap-2">
                <VButton variant="secondary" class="!w-[132px]" :disabled="isSubmitDisabled" @click="closeModal">Batal</VButton>
                <VButton variant="primary" class="!w-[132px]" :disabled="isSubmitDisabled" @click="handleSubmit">
                  {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
                </VButton>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>
