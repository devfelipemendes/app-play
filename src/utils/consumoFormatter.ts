// src/utils/consumoFormatter.ts
import { ConsumoDaily } from '@/src/api/endpoints/consumoApi'

/**
 * Converte bytes para GB formatado
 */
export const bytesToGB = (bytes: number): string => {
  const gb = bytes / (1024 * 1024 * 1024)
  return gb.toFixed(2)
}

/**
 * Converte bytes para MB formatado
 */
export const bytesToMB = (bytes: number): string => {
  const mb = bytes / (1024 * 1024)
  return mb.toFixed(2)
}

/**
 * Filtra os últimos 7 dias de consumo a partir da data atual
 */
export const filterLast7Days = (
  consumoData: ConsumoDaily[],
): ConsumoDaily[] => {
  if (!consumoData || consumoData.length === 0) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0) // Zerar horas para comparação de data

  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6) // -6 para pegar exatamente 7 dias (incluindo hoje)

  // Filtrar apenas os últimos 7 dias
  const filtered = consumoData.filter((item) => {
    const itemDate = new Date(item.dtConsumo)
    itemDate.setHours(0, 0, 0, 0)

    return itemDate >= sevenDaysAgo && itemDate <= today
  })

  // Ordenar por data (do mais antigo para o mais recente)
  return filtered.sort((a, b) => {
    const dateA = new Date(a.dtConsumo).getTime()
    const dateB = new Date(b.dtConsumo).getTime()
    return dateA - dateB
  })
}

/**
 * Formata data ISO para formato brasileiro (DD/MM)
 */
export const formatDateToDDMM = (isoDate: string): string => {
  const date = new Date(isoDate)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}`
}

/**
 * Formata data ISO para dia da semana abreviado (Seg, Ter, Qua, etc)
 */
export const formatDateToWeekday = (isoDate: string): string => {
  const date = new Date(isoDate)
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return weekdays[date.getDay()]
}

/**
 * Calcula o total de download no período
 */
export const calculateTotalDownload = (consumoData: ConsumoDaily[]): number => {
  if (!consumoData || consumoData.length === 0) return 0

  return consumoData.reduce((total, item) => total + item.qtUsadoDownload, 0)
}

/**
 * Calcula o total de upload no período
 */
export const calculateTotalUpload = (consumoData: ConsumoDaily[]): number => {
  if (!consumoData || consumoData.length === 0) return 0

  return consumoData.reduce((total, item) => total + item.qtUsadoUpload, 0)
}

/**
 * Formata dados de consumo para exibição em gráfico semanal
 */
export interface WeeklyChartData {
  day: string // Dia da semana abreviado
  date: string // Data formatada DD/MM
  downloadGB: number // Download em GB
  downloadMB: number // Download em MB
  uploadGB: number // Upload em GB
  uploadMB: number // Upload em MB
}

export const formatToWeeklyChart = (
  consumoData: ConsumoDaily[],
): WeeklyChartData[] => {
  const last7Days = filterLast7Days(consumoData)

  return last7Days.map((item) => ({
    day: formatDateToWeekday(item.dtConsumo),
    date: formatDateToDDMM(item.dtConsumo),
    downloadGB: parseFloat(bytesToGB(item.qtUsadoDownload)),
    downloadMB: parseFloat(bytesToMB(item.qtUsadoDownload)),
    uploadGB: parseFloat(bytesToGB(item.qtUsadoUpload)),
    uploadMB: parseFloat(bytesToMB(item.qtUsadoUpload)),
  }))
}

/**
 * Formata dados de consumo para exibição em gráfico mensal
 */
export interface MonthlyChartData {
  day: number // Dia do mês
  date: string // Data formatada DD/MM
  downloadGB: number // Download em GB
  downloadMB: number // Download em MB
  uploadGB: number // Upload em GB
  uploadMB: number // Upload em MB
}

export const formatToMonthlyChart = (
  consumoData: ConsumoDaily[],
): MonthlyChartData[] => {
  if (!consumoData || consumoData.length === 0) return []

  return consumoData.map((item) => {
    const date = new Date(item.dtConsumo)
    return {
      day: date.getDate(),
      date: formatDateToDDMM(item.dtConsumo),
      downloadGB: parseFloat(bytesToGB(item.qtUsadoDownload)),
      downloadMB: parseFloat(bytesToMB(item.qtUsadoDownload)),
      uploadGB: parseFloat(bytesToGB(item.qtUsadoUpload)),
      uploadMB: parseFloat(bytesToMB(item.qtUsadoUpload)),
    }
  })
}

/**
 * Obtém mês e ano atuais no formato necessário para a API
 */
export const getCurrentMonthYear = () => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0') // 01-12
  const year = String(now.getFullYear()) // 2025

  return { month, year }
}

/**
 * Remove máscara do MSISDN e garante formato correto com código do país
 * Entrada: "(61) 99851-3259" ou "5561998513259"
 * Saída: "5561998513259"
 */
export const normalizeMsisdn = (msisdn: string): string => {
  if (!msisdn) return ''

  // Remove todos os caracteres não numéricos
  const digitsOnly = msisdn.replace(/\D/g, '')

  // Se já tem 13 dígitos (55 + DDD + número), retorna
  if (digitsOnly.length === 13 && digitsOnly.startsWith('55')) {
    return digitsOnly
  }

  // Se tem 11 dígitos (DDD + número), adiciona 55
  if (digitsOnly.length === 11) {
    return '55' + digitsOnly
  }

  // Retorna o que conseguiu limpar
  return digitsOnly
}
