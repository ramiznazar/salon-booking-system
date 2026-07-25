export function getLocalizedField(item, field, language, fallback = '') {
  if (!item || !field) return fallback

  const normalizedLanguage = String(language || 'en').toLowerCase()
  const primary = item[field]

  if (normalizedLanguage.startsWith('it')) {
    const italianValue = item[`${field}_it`]
    if (italianValue !== null && italianValue !== undefined && italianValue !== '') return italianValue
  }

  if (primary !== null && primary !== undefined && primary !== '') return primary
  return fallback
}

export function getLocalizedArray(item, field, language) {
  if (!item || !field) return []

  const normalizedLanguage = String(language || 'en').toLowerCase()
  const primary = Array.isArray(item[field]) ? item[field] : []

  if (normalizedLanguage.startsWith('it')) {
    const italianValue = Array.isArray(item[`${field}_it`]) ? item[`${field}_it`] : []
    if (italianValue.length > 0) return italianValue
  }

  return primary
}
