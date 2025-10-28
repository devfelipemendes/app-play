// app/(auth)/partner-blocked.tsx
import React from 'react'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { StatusBar } from 'expo-status-bar'
import { AlertCircle, MessageCircle, LogOut } from 'lucide-react-native'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { TouchableOpacity, Linking, ScrollView } from 'react-native'
import { Icon } from '@/components/ui/icon'
import { env } from '@/config/env'
import { useAuth } from '@/hooks/useAuth'

const PartnerBlockedScreen = () => {
  const { colors } = useCompanyThemeSimple()
  const { signOut } = useAuth()

  const handleOpenSupport = async () => {
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

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <VStack className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingVertical: 40,
        }}
      >
        <VStack style={{ gap: 32, alignItems: 'center' }}>
          {/* Ícone de alerta */}
          <Box
            style={{
              width: 120,
              height: 120,
              backgroundColor: colors.error + '20',
              borderRadius: 60,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon
              as={AlertCircle}
              size="xl"
              style={{ color: colors.error, width: 64, height: 64 }}
            />
          </Box>

          {/* Mensagem principal */}
          <VStack style={{ gap: 12, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: colors.text,
                textAlign: 'center',
              }}
            >
              Serviço Temporariamente Indisponível
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: colors.secondary,
                textAlign: 'center',
                lineHeight: 24,
                paddingHorizontal: 20,
              }}
            >
              Nossos serviços estão temporariamente indisponíveis. Entre em
              contato com o suporte para mais informações.
            </Text>
          </VStack>

          {/* Card de informações */}
          <Box
            style={{
              width: '100%',
              backgroundColor: colors.background,
              borderRadius: 20,
              padding: 24,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              borderWidth: 1,
              borderColor: colors.secondary + '20',
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
                    as={MessageCircle}
                    size="xl"
                    style={{ color: colors.primary }}
                  />
                </Box>
                <VStack style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: colors.text,
                    }}
                  >
                    Precisa de ajuda?
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.secondary,
                      marginTop: 2,
                    }}
                  >
                    Nossa equipe está pronta para atender você
                  </Text>
                </VStack>
              </HStack>

              {/* Botão de contato */}
              <TouchableOpacity
                onPress={handleOpenSupport}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  elevation: 3,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                }}
              >
                <HStack
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Icon
                    as={MessageCircle}
                    size="md"
                    style={{ color: colors.textButton }}
                  />
                  <Text
                    style={{
                      color: colors.textButton,
                      fontSize: 16,
                      fontWeight: '600',
                    }}
                  >
                    Falar com Suporte
                  </Text>
                </HStack>
              </TouchableOpacity>
            </VStack>
          </Box>

          {/* Botão de sair */}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              marginTop: 20,
              paddingVertical: 14,
              paddingHorizontal: 24,
            }}
          >
            <HStack style={{ alignItems: 'center', gap: 8 }}>
              <Icon as={LogOut} size="sm" style={{ color: colors.secondary }} />
              <Text
                style={{
                  color: colors.secondary,
                  fontSize: 16,
                  fontWeight: '500',
                }}
              >
                Sair da conta
              </Text>
            </HStack>
          </TouchableOpacity>
        </VStack>
      </ScrollView>
    </VStack>
  )
}

export default PartnerBlockedScreen
