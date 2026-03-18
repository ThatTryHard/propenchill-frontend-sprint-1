<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { PlusCircle, X } from 'lucide-vue-next'
import { useParentStore, validateParentForm } from '@/stores/parents'
import { parseFieldErrors } from '@/lib/fieldErrors'
import VButton from '@/components/common/VButton.vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'created', message: string): void
}>()

const store = useParentStore()

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
})

const submitError = ref('')
const isSubmitting = ref(false)

const resetForm = () => {
  form.nama = ''
  form.email = ''
  form.no_hp = ''
  form.tanggal_lahir = ''
  form.alamat = ''

  errors.nama = ''
  errors.email = ''
  errors.no_hp = ''
  submitError.value = ''
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      resetForm()
    }
  },
)

const closeModal = () => {
  emit('update:isOpen', false)
}

const validateForm = () => {
  const result = validateParentForm(form)
  errors.nama = result.nama || ''
  errors.email = result.email || ''
  errors.no_hp = result.no_hp || ''

  return Object.keys(result).length === 0
}

const isSubmitDisabled = computed(() => isSubmitting.value)

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    const body: Record<string, string> = {
      nama: form.nama.trim(),
      email: form.email.trim(),
      no_hp: form.no_hp.trim(),
    }

    if (form.tanggal_lahir) body.tanggal_lahir = form.tanggal_lahir
    if (form.alamat.trim()) body.alamat = form.alamat.trim()

    const data = await store.createParent(body)
    emit('created', data.message || 'Akun wali murid berhasil dibuat.')
    closeModal()
  } catch (error) {
    const parsed = parseFieldErrors(error, {
      nama: ['nama', 'name'],
      email: ['email'],
      no_hp: ['no_hp', 'nomor_hp', 'nomor hp', 'phone'],
    })

    errors.nama = parsed.fieldErrors.nama || ''
    errors.email = parsed.fieldErrors.email || ''
    errors.no_hp = parsed.fieldErrors.no_hp || ''
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
                <PlusCircle class="w-12 h-12 text-[#3f9760]" />
                <b class="text-[24px] leading-[120%]">Tambah Wali Murid</b>
              </div>

              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-[16px] leading-[120%] font-semibold"> Nama Lengkap </label>
                  <div class="rounded-[12px] border-2 border-[#b2b5ba] px-[19px] py-[14px]">
                    <input
                      v-model="form.nama"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      class="w-full appearance-none bg-transparent border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 text-[16px] leading-[150%] text-[#111827] placeholder:text-[#b2b5ba]"
                    />
                  </div>
                  <p v-if="errors.nama" class="text-[12px] text-[#A0453B]">{{ errors.nama }}</p>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-[16px] leading-[120%] font-semibold"> Email </label>
                  <div class="rounded-[12px] border-2 border-[#b2b5ba] px-[19px] py-[14px]">
                    <input
                      v-model="form.email"
                      type="email"
                      placeholder="nama@email.com"
                      class="w-full appearance-none bg-transparent border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 text-[16px] leading-[150%] text-[#111827] placeholder:text-[#b2b5ba]"
                    />
                  </div>
                  <p v-if="errors.email" class="text-[12px] text-[#A0453B]">{{ errors.email }}</p>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-[16px] leading-[120%] font-semibold"> Nomor HP </label>
                  <div class="rounded-[12px] border-2 border-[#b2b5ba] px-[19px] py-[14px]">
                    <input
                      v-model="form.no_hp"
                      type="text"
                      placeholder="08123456789"
                      class="w-full appearance-none bg-transparent border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 text-[16px] leading-[150%] text-[#111827] placeholder:text-[#b2b5ba]"
                    />
                  </div>
                  <p v-if="errors.no_hp" class="text-[12px] text-[#A0453B]">{{ errors.no_hp }}</p>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-[16px] leading-[120%] font-semibold"> Tanggal Lahir </label>
                  <div class="rounded-[12px] border-2 border-[#b2b5ba] px-[19px] py-[14px]">
                    <input
                      v-model="form.tanggal_lahir"
                      type="date"
                      class="w-full appearance-none bg-transparent border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 text-[16px] leading-[150%] text-[#111827]"
                    />
                  </div>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-[16px] leading-[120%] font-semibold"> Alamat </label>
                  <div class="rounded-[12px] border-2 border-[#b2b5ba] px-[19px] py-[14px]">
                    <input
                      v-model="form.alamat"
                      type="text"
                      placeholder="Masukkan alamat"
                      class="w-full appearance-none bg-transparent border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 text-[16px] leading-[150%] text-[#111827] placeholder:text-[#b2b5ba]"
                    />
                  </div>
                </div>

                <p v-if="submitError" class="text-[13px] text-[#A0453B] font-medium">{{ submitError }}</p>
              </div>

              <div class="flex items-center justify-end gap-2">
                <VButton
                  variant="secondary"
                  class="!w-[132px]"
                  :disabled="isSubmitting"
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
                  {{ isSubmitting ? 'Menyimpan...' : 'Tambah' }}
                </VButton>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>
