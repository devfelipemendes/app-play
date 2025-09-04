import React, { useState } from 'react'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Text } from '@/components/ui/text'
import { Input, InputField } from '@/components/ui/input'
import { Button, ButtonText } from '@/components/ui/button'
import { Box } from '@/components/ui/box'

import { SafeAreaView } from '@/components/ui/safe-area-view'
import { useAuth } from '@/src/store/hooks/useAuth'
import { Image } from 'react-native'
import IconLogo from '../../assets/AssetsPartners/adaptive-icon.png'
import { CustomInput } from '@/components/layout/CustomInput'

export default function LoginScreen() {
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, loadingAuth } = useAuth()

  const handleLogin = () => {
    if (!cpf || !password) {
      return alert('Preencha CPF e senha')
    }
    signIn(cpf, password, '0', '0', 'login', 'app')
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1c1c22' }}>
      {/* 20% - Área do logo */}
      <Box
        style={{
          flex: 4,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#1c1c22',
          position: 'relative',
        }}
      >
        {/* Background pattern - Grid manual */}

        {/* Logo principal */}

        <Image
          source={IconLogo}
          style={{
            width: 120,
            height: 120,
            zIndex: 1,
          }}
          resizeMode="contain"
        />
      </Box>

      {/* 80% - Área do formulário */}
      <Box
        style={{
          flex: 8,
          paddingHorizontal: 24,
          paddingTop: 32,
          justifyContent: 'flex-start',
          borderTopLeftRadius: 70,

          backgroundColor: 'white',
        }}
      >
        {/* Título Login */}
        <Box style={{ marginBottom: 32, alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>
            Bem vindo!
          </Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
            À Melhor Operadora do Brasil
          </Text>
        </Box>

        {/* CPF */}
        <Box style={{ marginBottom: 20 }}>
          <Text style={{ marginBottom: 8, fontSize: 14, color: '#666' }}>
            CPF/CNPJ
          </Text>
          <CustomInput
            placeholder="000.000.000-00"
            value={cpf}
            onChangeText={setCpf}
          />
        </Box>

        {/* Senha */}
        <Box style={{ marginBottom: 24 }}>
          <Text style={{ marginBottom: 8, fontSize: 14, color: '#666' }}>
            Senha
          </Text>
          <CustomInput
            placeholder="Digite sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </Box>

        {/* Botão Login */}
        <Button
          onPress={handleLogin}
          style={{
            borderRadius: 10,

            marginBottom: 24,
          }}
        >
          <ButtonText
            style={{ color: 'white', fontSize: 16, fontWeight: '600' }}
          >
            {loadingAuth ? 'Entrando...' : 'Login'}
          </ButtonText>
        </Button>

        {/* Link para cadastro */}
        <Box style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: '#666' }}>
            Ainda não possui uma conta?{' '}
            <Text style={{ color: '#000', fontWeight: '600' }}>
              Cadastre-se
            </Text>
          </Text>
        </Box>
        <Box style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: '#666' }}>
            Esqueci minha Senha!{' '}
            <Text style={{ color: '#000', fontWeight: '600' }}>
              Cliquei aqui!
            </Text>
          </Text>
        </Box>
      </Box>
    </SafeAreaView>
  )
}
