// src/hooks/useDataConverter.ts
import { useMemo } from 'react'

interface DataConversion {
  originalMB: number
  valueGB: number
  formatted: string
  percentage?: number
}

interface DataConverterResult {
  convertMBtoGB: (mbValue: string | number) => DataConversion
  formatDataUsage: (
    mbValue: string | number,
    showPercentage?: boolean,
    originalMB?: string | number,
  ) => string
  formatConsumptionData: (consumoData: any) => any
}

export const useDadosFormatter = (): DataConverterResult => {
  const convertMBtoGB = useMemo(() => {
    return (mbValue: string | number): DataConversion => {
      // Converter para número
      const mb =
        typeof mbValue === 'string' ? parseFloat(mbValue) || 0 : mbValue

      // Converter MB para GB
      const gb = mb / 1024

      // Formatar baseado no valor
      let formatted: string
      if (gb >= 1) {
        // Se >= 1GB, mostrar em GB
        // Usar parseFloat para remover zeros desnecessários
        const gbFormatted =
          gb >= 10 ? gb.toFixed(0) : parseFloat(gb.toFixed(1)).toString()
        formatted = `${gbFormatted} GB`
      } else {
        // Se < 1GB, mostrar em MB
        formatted = `${mb.toFixed(0)} MB`
      }

      return {
        originalMB: mb,
        valueGB: gb,
        formatted,
      }
    }
  }, [])

  const formatDataUsage = useMemo(() => {
    return (
      mbValue: string | number,
      showPercentage?: boolean,
      originalMB?: string | number,
    ): string => {
      const conversion = convertMBtoGB(mbValue)

      if (!showPercentage || !originalMB) {
        return conversion.formatted
      }

      // Calcular porcentagem se dados originais forem fornecidos
      const originalValue =
        typeof originalMB === 'string'
          ? parseFloat(originalMB) || 0
          : originalMB
      const usedMB = originalValue - conversion.originalMB
      const percentage = originalValue > 0 ? (usedMB / originalValue) * 100 : 0

      return `${conversion.formatted} (${percentage.toFixed(0)}% usado)`
    }
  }, [convertMBtoGB])

  const formatConsumptionData = useMemo(() => {
    return (consumoData: any) => {
      if (!consumoData) return null

      // Função auxiliar para calcular porcentagem de uso
      const calculateUsagePercentage = (
        restante: string | number,
        original: string | number,
      ): number => {
        const rest =
          typeof restante === 'string' ? parseFloat(restante) || 0 : restante
        const orig =
          typeof original === 'string' ? parseFloat(original) || 0 : original

        if (orig === 0) return 0

        const used = orig - rest
        return Math.round((used / orig) * 100)
      }

      return {
        dados: {
          restante: convertMBtoGB(consumoData.dados || 0).formatted,
          original: convertMBtoGB(consumoData.dadosoriginal || 0).formatted,
          usado: formatDataUsage(
            consumoData.dados || 0,
            true,
            consumoData.dadosoriginal || 0,
          ),
          percentage: calculateUsagePercentage(
            consumoData.dados || 0,
            consumoData.dadosoriginal || 0,
          ),
          restanteMB: parseFloat(consumoData.dados || 0),
          originalMB: parseFloat(consumoData.dadosoriginal || 0),
        },
        minutos: {
          restante: `${consumoData.minutos || 0} min`,
          original: `${consumoData.minutosoriginal || 0} min`,
          usado: `${
            parseFloat(consumoData.minutosoriginal || 0) -
            parseFloat(consumoData.minutos || 0)
          } min`,
          percentage: calculateUsagePercentage(
            consumoData.minutos || 0,
            consumoData.minutosoriginal || 0,
          ),
          restanteValue: parseFloat(consumoData.minutos || 0),
          originalValue: parseFloat(consumoData.minutosoriginal || 0),
        },
        sms: {
          restante: `${consumoData.smsrestante || 0} SMS`,
          original: `${consumoData.smsoriginal || 0} SMS`,
          usado: `${
            parseFloat(consumoData.smsoriginal || 0) -
            parseFloat(consumoData.smsrestante || 0)
          } SMS`,
          percentage: calculateUsagePercentage(
            consumoData.smsrestante || 0,
            consumoData.smsoriginal || 0,
          ),
          restanteValue: parseFloat(consumoData.smsrestante || 0),
          originalValue: parseFloat(consumoData.smsoriginal || 0),
        },
      }
    }
  }, [convertMBtoGB, formatDataUsage])

  return {
    convertMBtoGB,
    formatDataUsage,
    formatConsumptionData,
  }
}
