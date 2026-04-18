import { computed, reactive, ref } from 'vue'
import type { TemplateMode } from '@/stores/letter_templates'

// struktur form yang dipakai di halaman create/edit template
export interface TemplateForm {
  nama_template: string
  jenis: string
  is_active: boolean
  template_mode: TemplateMode
  konten_template: string
  allowed_roles: string[]
  file_template: File | null
}

export function useTemplateForm() {
  // state utama form
  const form = reactive<TemplateForm>({
    nama_template: '',
    jenis: '',
    is_active: true,
    template_mode: 'DOCX',
    konten_template: '',
    allowed_roles: [],
    file_template: null,
  })

  // state untuk error per field + pesan umum
  const fieldErrors = reactive<Record<string, string>>({})
  const generalError = ref('')
  const successMessage = ref('')

  // bantu binding dropdown status aktif/nonaktif
  // karena di form disimpan boolean, tapi dropdown biasanya pakai string
  const isActiveString = computed({
    get: () => String(form.is_active),
    set: (val: string) => {
      form.is_active = val === 'true'
    },
  })

  function clearErrors() {
    // reset semua pesan error dan success
    generalError.value = ''
    successMessage.value = ''
    Object.keys(fieldErrors).forEach((key) => delete fieldErrors[key])
  }

  function resetForm() {
    // kembalikan form ke state awal
    form.nama_template = ''
    form.jenis = ''
    form.is_active = true
    form.template_mode = 'DOCX'
    form.konten_template = ''
    form.allowed_roles = []
    form.file_template = null
  }

  function applyTemplateDetail(data: any) {
    // isi form dari data detail template
    // dipakai waktu halaman edit pertama kali dibuka
    form.nama_template = data.nama_template || ''
    form.jenis = data.jenis || ''
    form.is_active = Boolean(data.is_active)
    form.template_mode = (data.template_mode || 'DOCX') as TemplateMode
    form.konten_template = data.konten_template || ''
    form.allowed_roles = Array.isArray(data.allowed_roles) ? [...data.allowed_roles] : []
    form.file_template = null
  }

  function toggleRole(role: string) {
    // toggle role di chip akses:
    // kalau sudah ada → hapus
    // kalau belum ada → tambahkan
    const index = form.allowed_roles.indexOf(role)

    if (index >= 0) {
      form.allowed_roles.splice(index, 1)
    } else {
      form.allowed_roles.push(role)
    }
  }

  function handleFileChange(file: File | null) {
    // handle upload file template DOCX
    if (!file) {
      form.file_template = null
      return
    }

    // validasi extension file
    if (!file.name.toLowerCase().endsWith('.docx')) {
      fieldErrors.file_template = 'File template harus berformat .docx.'
      form.file_template = null
      return
    }

    // validasi ukuran maksimal 10 MB
    if (file.size > 10 * 1024 * 1024) {
      fieldErrors.file_template = 'Ukuran file maksimal 10 MB.'
      form.file_template = null
      return
    }

    delete fieldErrors.file_template
    form.file_template = file
  }

  function insertPlaceholder(value: string) {
    // tambahkan placeholder ke konten template manual
    form.konten_template = `${form.konten_template}${value}`
  }

  function stripHtml(html: string) {
    // hapus tag HTML biar bisa dicek apakah kontennya beneran kosong atau tidak
    return html.replace(/<[^>]*>/g, '').trim()
  }

  function handleTemplateModeChange(newMode: TemplateMode) {
    // kalau mode diganti, reset field yang tidak relevan
    delete fieldErrors.file_template
    delete fieldErrors.konten_template

    if (newMode === 'MANUAL') {
      // pindah ke manual → file ga dipakai
      form.file_template = null
    }

    if (newMode === 'DOCX') {
      // pindah ke DOCX → konten manual dikosongkan
      form.konten_template = ''
    }
  }

  function validateForm(options?: { requireDocxFile?: boolean }) {
    // validasi form sebelum submit
    clearErrors()

    // di halaman edit, upload file DOCX baru itu optional
    const requireDocxFile = options?.requireDocxFile ?? true

    if (!form.nama_template.trim()) {
      fieldErrors.nama_template = 'Nama template wajib diisi.'
    }

    if (!form.jenis) {
      fieldErrors.jenis = 'Jenis template wajib dipilih.'
    }

    if (!form.template_mode) {
      fieldErrors.template_mode = 'Metode template wajib dipilih.'
    }

    if (form.allowed_roles.length === 0) {
      fieldErrors.allowed_roles = 'Pilih minimal satu role akses.'
    }

    if (form.template_mode === 'DOCX' && requireDocxFile && !form.file_template) {
      fieldErrors.file_template = 'File template wajib diisi untuk mode DOCX.'
    }

    if (form.template_mode === 'MANUAL' && !stripHtml(form.konten_template)) {
      fieldErrors.konten_template = 'Konten template wajib diisi untuk mode MANUAL.'
    }

    return Object.keys(fieldErrors).length === 0
  }

  return {
    form,
    fieldErrors,
    generalError,
    successMessage,
    isActiveString,
    clearErrors,
    resetForm,
    applyTemplateDetail,
    toggleRole,
    handleFileChange,
    insertPlaceholder,
    stripHtml,
    handleTemplateModeChange,
    validateForm,
  }
}