<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { X, PlusCircle } from 'lucide-vue-next'
import { useStudentStore } from '@/stores/students'
import { parseFieldErrors } from '@/lib/fieldErrors'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'

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
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) resetForm()
  }
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
            class="relative w-full max-w-[720px] rounded-[24px] border-[0.5px] border-transparent overflow-hidden backdrop-blur-[10px] px-8 py-7 text-[#111827] shadow-[0px_-2px_4px_rgba(0,0,0,0.2),0px_2px_4px_rgba(255,255,255,0.4)]"
            style="background: linear-gradient(#f8fafc, #f8fafc) padding-box, linear-gradient(243.74deg, rgba(255,255,255,0.05), #ffffff 47.12%, rgba(255,255,255,0.05)) border-box;"
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
                <b class="text-[24px] leading-[120%]">Tambah Data</b>
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
                  <label class="text-[16px] font-semibold leading-[120%] text-[#111827]">
                    Jenis Kelamin
                  </label>
                  <div class="rounded-[12px] p-[2px] bg-[#b2b5ba]">
                    <select
                      v-model="form.jenis_kelamin"
                      class="w-full rounded-[10px] bg-white px-[19px] py-[14px] text-[16px] leading-[150%] text-[#111827] outline-none"
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <div
                    v-if="errors.jenis_kelamin"
                    class="text-[12px] font-light leading-[150%] bg-[linear-gradient(91.01deg,#c37973,#81413c)] bg-clip-text text-transparent"
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

                <div class="md:col-span-2 flex flex-col gap-2">
                  <label class="text-[16px] font-semibold leading-[120%] text-[#111827]">
                    Alamat
                  </label>
                  <div class="rounded-[12px] p-[2px] bg-[#b2b5ba]">
                    <textarea
                      v-model="form.alamat"
                      rows="3"
                      placeholder="Masukkan alamat"
                      class="w-full rounded-[10px] bg-white px-[19px] py-[14px] text-[16px] leading-[150%] text-[#111827] outline-none resize-none"
                    />
                  </div>
                </div>

                <p
                  v-if="studentStore.error"
                  class="md:col-span-2 text-[13px] text-[#A0453B] font-medium"
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
