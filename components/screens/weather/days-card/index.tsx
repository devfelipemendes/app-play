import React from 'react'
import { Pressable } from 'react-native'
import { HStack } from '@/components/ui/hstack'
import { VStack } from '@/components/ui/vstack'
import { Text } from '@/components/ui/text'
import { Divider } from '@/components/ui/divider'
import { Box } from '@/components/ui/box'
import { Icon } from '@/components/ui/icon'
import { CheckCircle, Clock, XCircle } from 'lucide-react-native'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useDeviceSize } from '@/hooks/useDeviceSize'

interface IDaysCard {
  name: string // Tipo da fatura (ex: "Muda Plano", "Recarga")
  created: string // Data de criação (ex: "2024-08-15 15:55:08")
  highest: string | number | null // Valor bruto (valuetopup)

  paymentStatus: number // 1 = pago, 0 = pendente, 2 = estornado
  onPress?: () => void // Callback quando clicar no card
}

// Função para formatar data no formato dd/MM/yyyy
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

const DaysCard = ({
  name,
  created,
  highest,

  paymentStatus,
  onPress,
}: IDaysCard) => {
  const formattedDateCreated = formatDate(created)

  // Garantir que valorBruto seja sempre um número válido
  const valorBruto = (() => {
    if (highest === null || highest === undefined) return 0
    const parsed = typeof highest === 'string' ? parseFloat(highest) : highest
    return isNaN(parsed) ? 0 : parsed
  })()

  const { colors } = useCompanyThemeSimple()

  // Definir cor, ícone e label baseado no status
  const getStatusConfig = (status: number) => {
    switch (status) {
      case 1: // Pago
        return {
          color: '#10B981', // Verde
          icon: CheckCircle,
          label: 'Pago',
        }
      case 2: // Estornado
        return {
          color: '#EF4444', // Vermelho
          icon: XCircle,
          label: 'Estornado',
        }
      default: // 0 ou outro = Pendente
        return {
          color: '#F59E0B', // Amarelo
          icon: Clock,
          label: 'Pendente',
        }
    }
  }

  const statusConfig = getStatusConfig(paymentStatus)
  const StatusIcon = statusConfig.icon
  const { isSmallPhone } = useDeviceSize()

  const CardContent = (
    <HStack
      style={{
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        flexDirection: `${isSmallPhone ? 'row' : 'row'}`,
        justifyContent: 'space-between',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      }}
    >
      <VStack className="w-3/4">
        <VStack space="xs">
          <Text
            className={`${
              isSmallPhone
                ? 'text-typography-900 font-dm-sans-medium text-base'
                : 'text-typography-900 font-dm-sans-medium text-base'
            }`}
          >
            {name ? name : 'Fatura'}
          </Text>
          <Text className="text-typography-600 font-dm-sans-regular text-sm">
            Gerada em {formattedDateCreated}
          </Text>
        </VStack>

        <HStack space="sm" className={'items-center'}>
          <VStack
            space="xs"
            className={`${isSmallPhone ? 'flex flex-row' : 'flex  flex-row'}`}
          >
            <Text
              className={
                'text-typography-700 text-start font-dm-sans-regular text-sm'
              }
            >
              Valor:
            </Text>
            <Text className="text-typography-900 text-right font-dm-sans-bold text-base">
              R$ {valorBruto.toFixed(2)}''
            </Text>
          </VStack>
        </HStack>
      </VStack>

      <VStack className="items-center justify-center">
        <Box
          style={{
            width: 48,
            height: 48,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon
            as={StatusIcon}
            size="xl"
            style={{ color: statusConfig.color }}
          />
        </Box>
      </VStack>
    </HStack>
  )

  // Se tiver onPress, envolver com Pressable
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        android_ripple={{ color: colors.primary + '20' }}
      >
        {CardContent}
      </Pressable>
    )
  }

  // Senão, retornar apenas o conteúdo
  return CardContent
}

export default DaysCard
