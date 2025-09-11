// src/utils/dateFormatter.ts

export const useDateFormatter = () => {
  // Função para obter data atual formatada
  const getCurrentDate = (
    format: 'full' | 'short' | 'date-only' | 'time-only' = 'full',
  ): string => {
    const now = new Date()

    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ]

    const day = now.getDate()
    const month = months[now.getMonth()]
    const year = now.getFullYear()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')

    switch (format) {
      case 'full':
        return `${day} de ${month} - ${hours}:${minutes}`
      case 'short':
        return `${day}/${(now.getMonth() + 1)
          .toString()
          .padStart(2, '0')}/${year} ${hours}:${minutes}`
      case 'date-only':
        return `${day} de ${month} de ${year}`
      case 'time-only':
        return `${hours}:${minutes}`
      default:
        return `${day} de ${month} - ${hours}:${minutes}`
    }
  }

  // Função para formatar data específica
  const formatDate = (
    date: Date,
    format: 'full' | 'short' | 'date-only' | 'time-only' = 'full',
  ): string => {
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ]

    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    switch (format) {
      case 'full':
        return `${day} de ${month} - ${hours}:${minutes}`
      case 'short':
        return `${day}/${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}/${year} ${hours}:${minutes}`
      case 'date-only':
        return `${day} de ${month} de ${year}`
      case 'time-only':
        return `${hours}:${minutes}`
      default:
        return `${day} de ${month} - ${hours}:${minutes}`
    }
  }

  // Função para converter formato dd-MM-yyyy para dd/MM/yyyy
  const formatDateString = (dateString: string): string => {
    if (!dateString) return ''
    return dateString.replace(/-/g, '/')
  }

  return {
    getCurrentDate,
    formatDate,
    formatDateString,
  }
}

// Funções standalone para usar fora de componentes
export const getCurrentFormattedDate = (
  format: 'full' | 'short' | 'date-only' | 'time-only' = 'full',
): string => {
  const now = new Date()

  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]

  const day = now.getDate()
  const month = months[now.getMonth()]
  const year = now.getFullYear()

  switch (format) {
    case 'full':
      return `${day} de ${month} `
    case 'short':
      return `${day}/${(now.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${year} `
    case 'date-only':
      return `${day} de ${month} de ${year}`
    default:
      return `${day} de ${month} `
  }
}

// Função para formatar string de data
export const formatDateString = (dateString: string): string => {
  if (!dateString) return ''
  return dateString.replace(/-/g, '/')
}

// Exemplos de uso:
/*
getCurrentFormattedDate('full')      // "11 de Setembro - 14:30"
getCurrentFormattedDate('short')     // "11/09/2025 14:30"
getCurrentFormattedDate('date-only') // "11 de Setembro de 2025"
getCurrentFormattedDate('time-only') // "14:30"

formatDateString('02-10-2025')       // "02/10/2025"
*/
