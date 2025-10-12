import React, { useContext } from 'react'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import CustomHeader from '@/components/shared/custom-header'
import { StatusBar } from 'expo-status-bar'
import { MessageCircle, Headphones, Clock } from 'lucide-react-native'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { TouchableOpacity, Linking } from 'react-native'
import { Icon } from '@/components/ui/icon'
import { env } from '@/config/env'
import { ThemeContext } from '@/contexts/theme-context'

const Support = () => {
  const { colors, isDark } = useCompanyThemeSimple()
  const { colorMode }: any = useContext(ThemeContext)

  const handleOpenChat = async () => {
    const supportUrl = env.SUPPORT_CHAT_URL || 'https://wa.me/5511999999999'

    try {
      const canOpen = await Linking.canOpenURL(supportUrl)
      if (canOpen) {
        await Linking.openURL(supportUrl)
      } else {
        console.error('Não foi possível abrir o URL de suporte')
      }
    } catch (error) {
      console.error('Erro ao abrir chat de suporte:', error)
    }
  }

  return (
    <VStack space="md" className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
      <CustomHeader variant="general" title="Atendimento" />

      <VStack className="px-6 pt-8" style={{ gap: 24 }}>
        {/* Card de informações */}
        <Box
          style={{
            backgroundColor: colors.background,
            borderRadius: 20,
            padding: 24,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          <VStack style={{ gap: 20 }}>
            {/* Header do card */}
            <HStack style={{ alignItems: 'center', gap: 12 }}>
              <Box
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: colors.primary + '20',
                  borderRadius: 24,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Icon
                  as={Headphones}
                  size="xl"
                  style={{ color: colors.primary }}
                />
              </Box>
              <VStack style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: colors.text,
                  }}
                >
                  Central de Ajuda
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.secondary,
                    marginTop: 2,
                  }}
                >
                  Estamos aqui para ajudar você
                </Text>
              </VStack>
            </HStack>

            {/* Informações de atendimento */}
            <VStack
              style={{
                gap: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: colors.secondary + '20',
              }}
            >
              <HStack style={{ alignItems: 'center', gap: 10 }}>
                <Icon
                  as={Clock}
                  size="sm"
                  style={{ color: colors.secondary }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.secondary,
                  }}
                >
                  Atendimento: Segunda a Sexta, 9h às 18h
                </Text>
              </HStack>
              <HStack style={{ alignItems: 'center', gap: 10 }}>
                <Icon
                  as={MessageCircle}
                  size="sm"
                  style={{ color: colors.secondary }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.secondary,
                  }}
                >
                  Resposta média em até 5 minutos
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        {/* Botão de iniciar chat */}
        <TouchableOpacity
          onPress={handleOpenChat}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 16,
            padding: 20,
            elevation: 4,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          <HStack
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <Icon
              as={MessageCircle}
              size="lg"
              style={{ color: colors.textButton }}
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.textButton,
              }}
            >
              Iniciar Chat
            </Text>
          </HStack>
        </TouchableOpacity>

        {/* Card de dicas */}
        <Box
          style={{
            backgroundColor: colors.background,
            borderRadius: 16,
            padding: 20,
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 8,
            }}
          >
            Antes de entrar em contato
          </Text>
          <VStack style={{ gap: 6 }}>
            <Text style={{ fontSize: 14, color: colors.secondary }}>
              • Tenha seu CPF e número da linha em mãos
            </Text>
            <Text style={{ fontSize: 14, color: colors.secondary }}>
              • Descreva detalhadamente sua dúvida ou problema
            </Text>
            <Text style={{ fontSize: 14, color: colors.secondary }}>
              • Verifique se sua dúvida não está na seção de Ajuda
            </Text>
          </VStack>
        </Box>
      </VStack>
    </VStack>
  )
}

export default Support
