// components/shared/BiometricLockScreen.tsx
import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { Icon } from '@/components/ui/icon'
import { Fingerprint, ScanFace, AlertCircle } from 'lucide-react-native'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useBiometricAuth } from '@/hooks/useBiometricAuth'
import { Pressable } from '@/components/ui/pressable'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'expo-router'

const BiometricLockScreen = () => {
  const { colors } = useCompanyThemeSimple()
  const { signOut } = useAuth()
  const router = useRouter()
  const {
    biometricType,
    isBiometricSupported,
    hasStoredCredentials,
    authenticateWithBiometric,
  } = useBiometricAuth()

  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Iniciar autenticação automaticamente ao montar o componente
    if (isBiometricSupported && hasStoredCredentials) {
      handleBiometricAuth()
    }
  }, [isBiometricSupported, hasStoredCredentials])

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true)
    setError(null)

    try {
      const credentials = await authenticateWithBiometric()

      if (credentials) {
        // Autenticação bem-sucedida - navegar para o app
        // O hook useAuth já gerencia o login
        // Apenas navegar para a tela principal
        router.replace('/(tabs)/(home)')
      } else {
        setError('Falha na autenticação. Tente novamente.')
      }
    } catch (err) {
      console.error('Erro na autenticação biométrica:', err)
      setError('Erro ao autenticar. Tente novamente.')
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleLogout = () => {
    signOut()
  }

  const getBiometricIcon = () => {
    if (biometricType?.toLowerCase().includes('face')) {
      return ScanFace
    }
    return Fingerprint
  }

  if (!isBiometricSupported || !hasStoredCredentials) {
    return null // Não mostrar nada se não houver suporte ou credenciais
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background || '#f2f2f2' },
      ]}
    >
      <VStack space="xl" style={styles.content}>
        {/* Ícone de biometria */}
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.primary + '15' },
            ]}
          >
            <Icon
              as={getBiometricIcon()}
              size="4xl"
              style={{ color: colors.primary }}
            />
          </View>
        </View>

        {/* Texto de instrução */}
        <VStack space="sm" style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: colors.text,
              textAlign: 'center',
            }}
          >
            Desbloqueie o app
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.subTitle,
              textAlign: 'center',
            }}
          >
            Use {biometricType || 'biometria'} para continuar
          </Text>
        </VStack>

        {/* Botão de autenticar */}
        {!isAuthenticating && (
          <Pressable
            onPress={handleBiometricAuth}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 32,
              minWidth: 200,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: 'white',
                textAlign: 'center',
              }}
            >
              Autenticar
            </Text>
          </Pressable>
        )}

        {/* Loading */}
        {isAuthenticating && (
          <View style={{ alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={{
                fontSize: 14,
                color: colors.subTitle,
                marginTop: 12,
              }}
            >
              Autenticando...
            </Text>
          </View>
        )}

        {/* Mensagem de erro */}
        {error && (
          <View
            style={{
              backgroundColor: '#FEE2E2',
              borderRadius: 8,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Icon as={AlertCircle} size="md" style={{ color: '#EF4444' }} />
            <Text
              style={{
                fontSize: 14,
                color: '#EF4444',
                marginLeft: 8,
                flex: 1,
              }}
            >
              {error}
            </Text>
          </View>
        )}

        {/* Botão de logout */}
        <Pressable
          onPress={handleLogout}
          style={{
            marginTop: 32,
            paddingVertical: 12,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: colors.primary,
              textAlign: 'center',
              textDecorationLine: 'underline',
            }}
          >
            Sair da conta
          </Text>
        </Pressable>
      </VStack>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default BiometricLockScreen
