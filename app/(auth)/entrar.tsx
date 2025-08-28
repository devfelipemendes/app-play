import React, { useState } from 'react'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Text } from '@/components/ui/text'
import { Input, InputField } from '@/components/ui/input'
import { Button, ButtonText } from '@/components/ui/button'
import { Box } from '@/components/ui/box'

import { SafeAreaView } from '@/components/ui/safe-area-view'
import { useAuth } from '@/src/store/hooks/useAuth'

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
    <SafeAreaView className="flex-1 bg-background-0">
      <VStack className="flex-1 px-6 justify-center" space="xl">
        {/* Logo */}
        <Box className="items-center mb-8">
          <Text className="text-3xl font-bold text-typography-900">
            MVNO App
          </Text>
          <Text className="text-sm text-typography-600 mt-2">
            Sua operadora móvel
          </Text>
        </Box>

        {/* Formulário */}
        <VStack space="lg">
          {/* CPF */}
          <VStack space="sm">
            <Text className="text-sm font-medium text-typography-700">
              CPF/CNPJ
            </Text>
            <Input className="border-outline-300">
              <InputField
                placeholder="000.000.000-00"
                value={cpf}
                onChangeText={setCpf}
                keyboardType="numeric"
              />
            </Input>
          </VStack>

          {/* Senha */}
          <VStack space="sm">
            <Text className="text-sm font-medium text-typography-700">
              Senha
            </Text>
            <Input className="border-outline-300">
              <InputField
                placeholder="Digite sua senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </Input>
          </VStack>

          {/* Botão Login */}
          <Button onPress={handleLogin} disabled={loadingAuth} className="mt-6">
            <ButtonText>{loadingAuth ? 'Entrando...' : 'Entrar'}</ButtonText>
          </Button>

          {/* Links */}
          <HStack className="justify-between mt-4">
            <Text className="text-sm text-primary-600">
              Esqueci minha senha
            </Text>
            <Text className="text-sm text-primary-600">Criar conta</Text>
          </HStack>
        </VStack>
      </VStack>
    </SafeAreaView>
  )
}
