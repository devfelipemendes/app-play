export const formatDateToBR = (dateString: any) => {
  if (!dateString) return ''

  // Remove espaços e substitui - por /
  return dateString.trim().replace(/-/g, '/')
}

// Ou se quiser validar o formato:
export const formatDateWithValidation = (dateString: any) => {
  if (!dateString) return ''

  const cleaned = dateString.trim()

  // Verifica se está no formato dd-MM-yyyy
  const dateRegex = /^\d{2}-\d{2}-\d{4}$/

  if (!dateRegex.test(cleaned)) {
    console.warn('Formato de data inválido. Esperado: dd-MM-yyyy')
    return cleaned // Retorna original se não estiver no formato esperado
  }

  return cleaned.replace(/-/g, '/')
}
