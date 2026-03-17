<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { Edit, PlusCircle, X } from 'lucide-vue-next'
import VButton from '@/components/common/VButton.vue'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    isEdit: boolean
    loading: boolean
    errorMessage?: string
    initialForm?: { nama: string; email: string; role: string }
  }>(),
  {
    errorMessage: '',
    initialForm: () => ({ nama: '', email: '', role: 'ADMIN' }),
  },
)

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'submit', payload: { nama: string; email: string; role: string }): void
}>()

const form = reactive({ nama: '', email: '', role: 'ADMIN' })
const errors = reactive({ nama: '', email: '' })

watch(
  () => [props.isOpen, props.initialForm],
  ([isOpen]) => {
    if (!isOpen) return
    form.nama = props.initialForm.nama || ''
    form.email = props.initialForm.email || ''
    form.role = props.initialForm.role || 'ADMIN'
    errors.nama = ''
    errors.email = ''
  },
  { deep: true },
)

const closeModal = () => emit('update:isOpen', false)

const validateForm = () => {
  errors.nama = ''
  errors.email = ''

  let isValid = true

  if (!form.nama.trim()) {
    errors.nama = 'Nama wajib diisi!'
    isValid = false
  }

  if (!form.email.trim()) {
    errors.email = 'Email wajib diisi!'
    isValid = false
  }

  return isValid
}

const isSubmitDisabled = computed(() => props.loading)

const handleSubmit = () => {
  if (!validateForm()) return
  emit('submit', {
    nama: form.nama.trim(),
    email: form.email.trim(),
    role: form.role,
  })
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
                <button type="button" @click="closeModal" class="text-[#111827] hover:opacity-70 transition">
                  <X class="w-5 h-5" />
                </button>
              </div>

              <div class="flex flex-col items-center gap-2">
                <component :is="isEdit ? Edit : PlusCircle" class="w-12 h-12 text-[#3f9760]" />
                <b class="text-[24px] leading-[120%]">{{ isEdit ? 'Edit Staff' : 'Tambah Staff' }}</b>
              </div>

              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-[16px] leading-[120%] font-semibold">Nama Lengkap</label>
                  <div class="rounded-[12px] border-2 border-[#b2b5ba] px-[19px] py-[14px]">
                    <input v-model="form.nama" type="text" placeholder="Masukkan nama lengkap staff" class="w-full appearance-none bg-transparent border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 text-[16px] leading-[150%] text-[#111827] placeholder:text-[#b2b5ba]" />
                  </div>
                  <p v-if="errors.nama" class="text-[12px] text-[#A0453B]">{{ errors.nama }}</p>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-[16px] leading-[120%] font-semibold">Alamat Email</label>
                  <div class="rounded-[12px] border-2 border-[#b2b5ba] px-[19px] py-[14px]">
                    <input v-model="form.email" type="email" placeholder="contoh: staff@simp.com" class="w-full appearance-none bg-transparent border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 text-[16px] leading-[150%] text-[#111827] placeholder:text-[#b2b5ba]" />
                  </div>
                  <p v-if="errors.email" class="text-[12px] text-[#A0453B]">{{ errors.email }}</p>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-[16px] leading-[120%] font-semibold">Role Akses</label>
                  <div class="rounded-[12px] border-2 border-[#b2b5ba] px-[19px] py-[14px]">
                    <select v-model="form.role" class="w-full appearance-none bg-transparent border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 text-[16px] leading-[150%] text-[#111827]">
                      <option value="ADMIN">ADMIN</option>
                      <option value="BIDANG_AGAMA">BIDANG AGAMA</option>
                      <option value="BIDANG_KESISWAAN">BIDANG KESISWAAN</option>
                      <option value="BIDANG_KURIKULUM">BIDANG KURIKULUM</option>
                      <option value="KEPSEK">KEPALA SEKOLAH</option>
                    </select>
                  </div>
                </div>

                <p v-if="errorMessage" class="text-[13px] text-[#A0453B] font-medium">{{ errorMessage }}</p>
              </div>

              <div class="flex items-center justify-end gap-2">
                <VButton variant="secondary" class="!w-[132px]" :disabled="loading" @click="closeModal">Batal</VButton>
                <VButton variant="primary" class="!w-[132px]" :disabled="isSubmitDisabled" @click="handleSubmit">
                  {{ loading ? 'Menyimpan...' : isEdit ? 'Simpan' : 'Tambah' }}
                </VButton>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>
