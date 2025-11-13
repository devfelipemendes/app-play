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

      // Converter MB para GB (usando 1000, não 1024 - conversão decimal)
      const gb = mb / 1000

      // Formatar baseado no valor
      let formatted: string
      if (gb >= 1) {
        // Se >= 1GB, mostrar em GB com uma casa decimal
        // Usar parseFloat para remover zeros desnecessários (ex: 10.0 vira 10)
        const gbFormatted = parseFloat(gb.toFixed(1)).toString()
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

      // Função auxiliar para calcular porcentagem de uso ou acúmulo
      const calculateUsagePercentage = (
        restante: string | number,
        original: string | number,
      ): { percentage: number; hasAccumulated: boolean; accumulatedValue?: number } => {
        const rest =
          typeof restante === 'string' ? parseFloat(restante) || 0 : restante
        const orig =
          typeof original === 'string' ? parseFloat(original) || 0 : original

        if (orig === 0) return { percentage: 0, hasAccumulated: false }

        // Se o restante é maior que o original, há acúmulo
        if (rest > orig) {
          const accumulated = rest - orig
          return {
            percentage: 0,
            hasAccumulated: true,
            accumulatedValue: accumulated
          }
        }

        // Calcular porcentagem normalmente quando está consumindo do plano base
        const used = orig - rest
        const percentage = (used / orig) * 100

        return {
          percentage: Math.min(Math.round(percentage), 100),
          hasAccumulated: false
        }
      }

      // IMPORTANTE: "dados" vem em MB, "dadosoriginal" vem em GB
      // Precisamos converter dadosoriginal para MB antes de calcular (usando 1000, não 1024)
      const dadosOriginalEmMB = parseFloat(consumoData.dadosoriginal || 0) * 1000

      const dadosCalc = calculateUsagePercentage(
        consumoData.dados || 0,
        dadosOriginalEmMB,
      )

      console.log('🔍 [DADOS FORMATTER] ===== DEBUG CÁLCULO =====')
      console.log('🔍 dados (API em MB):', consumoData.dados)
      console.log('🔍 dadosoriginal (API em GB):', consumoData.dadosoriginal)
      console.log('🔍 dadosoriginal convertido (MB):', dadosOriginalEmMB)
      console.log('🔍 hasAccumulated:', dadosCalc.hasAccumulated)
      console.log('🔍 accumulatedValue (MB):', dadosCalc.accumulatedValue)
      console.log('🔍 accumulated (formatado):', dadosCalc.accumulatedValue ? convertMBtoGB(dadosCalc.accumulatedValue).formatted : undefined)
      console.log('🔍 restante (formatado):', convertMBtoGB(consumoData.dados || 0).formatted)
      console.log('🔍 ==========================================')

      return {
        dados: {
          restante: convertMBtoGB(consumoData.dados || 0).formatted,
          original: `${parseFloat(consumoData.dadosoriginal || 0)} GB`, // Já vem em GB
          usado: formatDataUsage(
            consumoData.dados || 0,
            true,
            dadosOriginalEmMB, // Usar valor convertido
          ),
          percentage: dadosCalc.percentage,
          hasAccumulated: dadosCalc.hasAccumulated,
          accumulated: dadosCalc.accumulatedValue
            ? convertMBtoGB(dadosCalc.accumulatedValue).formatted
            : undefined,
          restanteMB: parseFloat(consumoData.dados || 0),
          originalMB: dadosOriginalEmMB, // MB convertido
        },
        minutos: (() => {
          const minutosCalc = calculateUsagePercentage(
            consumoData.minutos || 0,
            consumoData.minutosoriginal || 0,
          )
          return {
            restante: `${consumoData.minutos || 0} min`,
            original: `${consumoData.minutosoriginal || 0} min`,
            usado: `${
              parseFloat(consumoData.minutosoriginal || 0) -
              parseFloat(consumoData.minutos || 0)
            } min`,
            percentage: minutosCalc.percentage,
            hasAccumulated: minutosCalc.hasAccumulated,
            accumulated: minutosCalc.accumulatedValue
              ? `${Math.round(minutosCalc.accumulatedValue)} min`
              : undefined,
            restanteValue: parseFloat(consumoData.minutos || 0),
            originalValue: parseFloat(consumoData.minutosoriginal || 0),
          }
        })(),
        sms: (() => {
          const smsCalc = calculateUsagePercentage(
            consumoData.smsrestante || 0,
            consumoData.smsoriginal || 0,
          )
          return {
            restante: `${consumoData.smsrestante || 0} SMS`,
            original: `${consumoData.smsoriginal || 0} SMS`,
            usado: `${
              parseFloat(consumoData.smsoriginal || 0) -
              parseFloat(consumoData.smsrestante || 0)
            } SMS`,
            percentage: smsCalc.percentage,
            hasAccumulated: smsCalc.hasAccumulated,
            accumulated: smsCalc.accumulatedValue
              ? `${Math.round(smsCalc.accumulatedValue)} SMS`
              : undefined,
            restanteValue: parseFloat(consumoData.smsrestante || 0),
            originalValue: parseFloat(consumoData.smsoriginal || 0),
          }
        })(),
      }
    }
  }, [convertMBtoGB, formatDataUsage])

  return {
    convertMBtoGB,
    formatDataUsage,
    formatConsumptionData,
  }
}
