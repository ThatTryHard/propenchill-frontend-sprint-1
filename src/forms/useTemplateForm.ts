import { computed, reactive, ref } from 'vue'
import type { TemplateMode } from '@/stores/letter_templates'
import mammoth from 'mammoth'

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

const NAME_MAX_LENGTH = 255
const DOCX_MAX_SIZE = 10 * 1024 * 1024
const SCRIPT_PATTERN = /(<\s*script)|(&lt;\s*script)/i
const VALID_PLACEHOLDER_PATTERN = /^\{[a-zA-Z_][a-zA-Z0-9_]*\}$/
const RAW_PLACEHOLDER_PATTERN = /\{.*?\}/g
const DOUBLE_BRACE_PATTERN = /\{\{.*?\}\}/g

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
  const isActiveString = computed({
    get: () => String(form.is_active),
    set: (val: string) => {
      form.is_active = val === 'true'
    },
  })

  function clearFieldError(fieldName: string) {
    delete fieldErrors[fieldName]
  }

  function setFieldError(fieldName: string, message: string) {
    fieldErrors[fieldName] = message
  }

  function getFirstError(errors: string[]): string | null {
    return errors.length > 0 ? errors[0] || null : null
  }

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

  function normalizeSpaces(value: string) {
    // hapus spasi depan/belakang
    // ubah spasi ganda di tengah jadi satu spasi
    return value.trim().replace(/\s+/g, ' ')
  }

  function normalizeNamaTemplate() {
    form.nama_template = normalizeSpaces(form.nama_template)
    validateNamaTemplate()
  }

  function trimFormValues() {
    // rapihin value sebelum validasi / submit
    form.nama_template = normalizeSpaces(form.nama_template)
    form.jenis = form.jenis.trim()

    if (form.template_mode === 'MANUAL') {
      form.konten_template = form.konten_template.trim()
    }
  }

  function applyTemplateDetail(data: any) {
    // isi form dari data detail template
    form.nama_template = normalizeSpaces(data.nama_template || '')
    form.jenis = data.jenis || ''
    form.is_active = Boolean(data.is_active)
    form.template_mode = (data.template_mode || 'DOCX') as TemplateMode
    form.konten_template = data.konten_template || ''
    form.allowed_roles = Array.isArray(data.allowed_roles) ? [...data.allowed_roles] : []
    form.file_template = null
  }

  function toggleRole(role: string) {
    // toggle role di chip akses
    const index = form.allowed_roles.indexOf(role)

    if (index >= 0) {
      form.allowed_roles.splice(index, 1)
    } else {
      form.allowed_roles.push(role)
    }
  }

  function insertPlaceholder(value: string) {
    // tambahkan placeholder ke konten template manual
    form.konten_template = `${form.konten_template}${value}`
    validateManualContent()
  }

  function stripHtml(html: string) {
    // hapus tag HTML biar bisa dicek apakah kontennya beneran kosong atau tidak
    return html.replace(/<[^>]*>/g, '').trim()
  }

  function validateDangerousContent(text: string): string[] {
    const errors: string[] = []

    if (!text) return errors

    if (SCRIPT_PATTERN.test(text)) {
      errors.push('Script tidak diperbolehkan.')
    }

    return errors
  }

  function validatePlaceholderFormat(text: string): string[] {
    const errors: string[] = []

    if (!text) return errors

    const rawMatches = text.match(RAW_PLACEHOLDER_PATTERN) || []
    rawMatches.forEach((item) => {
      if (!VALID_PLACEHOLDER_PATTERN.test(item)) {
        errors.push(`Format placeholder tidak valid: ${item}`)
      }
    })

    const doubleBraceMatches = text.match(DOUBLE_BRACE_PATTERN) || []
    doubleBraceMatches.forEach((item) => {
      errors.push(`Gunakan single brace, bukan: ${item}`)
    })

    return [...new Set(errors)]
  }

  function validateTextContent(text: string): string | null {
    const dangerousError = getFirstError(validateDangerousContent(text))
    if (dangerousError) return dangerousError

    const placeholderError = getFirstError(validatePlaceholderFormat(text))
    if (placeholderError) return placeholderError

    return null
  }

  function validateNamaTemplate() {
    clearFieldError('nama_template')

    const normalizedName = normalizeSpaces(form.nama_template)

    if (!normalizedName) {
      setFieldError('nama_template', 'Nama template wajib diisi.')
      return
    }

    if (normalizedName.length > NAME_MAX_LENGTH) {
      setFieldError('nama_template', `Nama template maksimal ${NAME_MAX_LENGTH} karakter.`)
    }
  }

  function validateManualContent() {
    clearFieldError('konten_template')

    if (form.template_mode !== 'MANUAL') return

    const plainText = stripHtml(form.konten_template)
    if (!plainText) return

    const contentError = validateTextContent(form.konten_template)
    if (contentError) {
      setFieldError('konten_template', contentError)
    }
  }

  async function extractDocxText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value || ''
  }

  async function validateDocxContent(file: File): Promise<string | null> {
    try {
      const text = await extractDocxText(file)
      return validateTextContent(text)
    } catch {
      return 'Isi file DOCX tidak dapat dibaca.'
    }
  }

  async function handleFileChange(file: File | null) {
    clearFieldError('file_template')

    if (!file) {
      form.file_template = null
      return
    }

    if (!file.name.toLowerCase().endsWith('.docx')) {
      setFieldError('file_template', 'File template harus berformat .docx.')
      form.file_template = null
      return
    }

    if (file.size > DOCX_MAX_SIZE) {
      setFieldError('file_template', 'Ukuran file maksimal 10 MB.')
      form.file_template = null
      return
    }

    const docxError = await validateDocxContent(file)
    if (docxError) {
      setFieldError('file_template', docxError)
      form.file_template = null
      return
    }

    form.file_template = file
  }

  function handleTemplateModeChange(newMode: TemplateMode) {
    clearFieldError('file_template')
    clearFieldError('konten_template')

    if (newMode === 'MANUAL') {
      form.file_template = null
      validateManualContent()
    }

    if (newMode === 'DOCX') {
      form.konten_template = ''
    }
  }

  function validateForm(options?: { requireDocxFile?: boolean }) {
    clearErrors()
    trimFormValues()

    const requireDocxFile = options?.requireDocxFile ?? true

    validateNamaTemplate()

    if (!form.jenis) {
      setFieldError('jenis', 'Jenis template wajib dipilih.')
    }

    if (!form.template_mode) {
      setFieldError('template_mode', 'Metode template wajib dipilih.')
    }

    if (form.allowed_roles.length === 0) {
      setFieldError('allowed_roles', 'Pilih minimal satu role akses.')
    }

    if (form.template_mode === 'DOCX' && requireDocxFile && !form.file_template) {
      setFieldError('file_template', 'File template wajib diisi untuk mode DOCX.')
    }

    if (form.template_mode === 'MANUAL') {
      if (!stripHtml(form.konten_template)) {
        setFieldError('konten_template', 'Konten template wajib diisi untuk mode MANUAL.')
      } else {
        validateManualContent()
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      generalError.value = 'Periksa kembali form. Masih ada input yang belum sesuai.'
      return false
    }

    return true
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
    normalizeNamaTemplate,
    handleTemplateModeChange,
    validateForm,
    validateManualContent,
    validateNamaTemplate,
  }
}