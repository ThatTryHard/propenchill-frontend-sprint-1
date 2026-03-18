type UnknownRecord = Record<string, unknown>

export type FieldAliasMap<T extends string> = Record<T, string[]>

export interface ParsedFieldErrors<T extends string> {
  fieldErrors: Partial<Record<T, string>>
  generalError: string
}

const FALLBACK_GENERAL_ERROR = 'Terjadi kesalahan pada sistem.'

const isObject = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null

const normalize = (value: string) => value.toLowerCase().replace(/[_\s-]+/g, '')

const toMessage = (value: unknown): string => {
  if (typeof value === 'string') return value.trim()
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === 'string')
    return typeof first === 'string' ? first.trim() : ''
  }
  return ''
}

const getPayloads = (error: unknown): unknown[] => {
  if (!isObject(error)) return []

  const err = error as UnknownRecord
  return [
    err.response && isObject(err.response) ? (err.response as UnknownRecord).data : undefined,
    err.details,
    err.data,
    err,
  ].filter(Boolean)
}

const getObjectCandidates = (payload: unknown): UnknownRecord[] => {
  if (!isObject(payload)) return []

  const p = payload as UnknownRecord
  const candidates: UnknownRecord[] = []

  if (isObject(p.errors)) candidates.push(p.errors as UnknownRecord)
  if (isObject(p.error)) candidates.push(p.error as UnknownRecord)
  if (isObject(p.message)) candidates.push(p.message as UnknownRecord)
  candidates.push(p)

  return candidates
}

const getStringCandidates = (error: unknown, payloads: unknown[]): string[] => {
  const candidates: string[] = []

  for (const payload of payloads) {
    if (!isObject(payload)) continue

    const p = payload as UnknownRecord
    const values = [p.error, p.message, p.detail, p.non_field_errors]

    for (const value of values) {
      const message = toMessage(value)
      if (message) candidates.push(message)
    }
  }

  const directMessage = isObject(error) ? toMessage((error as UnknownRecord).message) : ''
  if (directMessage) candidates.push(directMessage)
  if (typeof error === 'string' && error.trim()) candidates.push(error.trim())

  return candidates
}

const keywordLooksLikeField = (message: string, keywords: string[]) => {
  const lowerMessage = normalize(message)
  return keywords.some((keyword) => lowerMessage.includes(normalize(keyword)))
}

export function parseFieldErrors<T extends string>(
  error: unknown,
  fieldAliases: FieldAliasMap<T>,
  fallbackGeneralError = FALLBACK_GENERAL_ERROR,
): ParsedFieldErrors<T> {
  const payloads = getPayloads(error)
  const fieldErrors: Partial<Record<T, string>> = {}

  for (const payload of payloads) {
    for (const candidate of getObjectCandidates(payload)) {
      const candidateKeys = Object.keys(candidate)
      for (const [field, aliases] of Object.entries(fieldAliases) as Array<[T, string[]]>) {
        if (fieldErrors[field]) continue

        const matchKey = candidateKeys.find((key) => {
          const normalizedKey = normalize(key)
          return aliases.some((alias) => normalizedKey === normalize(alias))
        })

        if (!matchKey) continue

        const message = toMessage(candidate[matchKey])
        if (message) fieldErrors[field] = message
      }
    }
  }

  const messageCandidates = getStringCandidates(error, payloads)
  let generalError = messageCandidates[0] || ''

  if (!generalError && Object.keys(fieldErrors).length === 0) {
    generalError = fallbackGeneralError
  }

  if (generalError) {
    let matchedField: T | null = null

    for (const [field, aliases] of Object.entries(fieldAliases) as Array<[T, string[]]>) {
      if (fieldErrors[field]) continue
      if (keywordLooksLikeField(generalError, aliases)) {
        fieldErrors[field] = generalError
        matchedField = field
        break
      }
    }

    if (matchedField) {
      generalError = ''
    }
  }

  return { fieldErrors, generalError }
}
