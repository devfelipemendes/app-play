// src/services/secureStorage.ts
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'

const TOKEN_KEY = 'auth_token'
const USER_DATA_KEY = 'user_data'
const REMEMBER_ME_KEY = 'remember_me'

class SecureStorageService {
  // Salvar token de forma segura
  async saveToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token)
    } catch (error) {
      console.error('Erro ao salvar token:', error)
      throw error
    }
  }

  // Buscar token
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY)
    } catch (error) {
      console.error('Erro ao buscar token:', error)
      return null
    }
  }

  // Remover token
  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY)
    } catch (error) {
      console.error('Erro ao remover token:', error)
    }
  }

  // Salvar dados do usuário (não sensíveis)
  async saveUserData(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error)
    }
  }

  // Buscar dados do usuário
  async getUserData(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(USER_DATA_KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
      return null
    }
  }

  // Limpar todos os dados
  async clearAll(): Promise<void> {
    try {
      await this.removeToken()
      await AsyncStorage.removeItem(USER_DATA_KEY)
      await AsyncStorage.removeItem(REMEMBER_ME_KEY)
    } catch (error) {
      console.error('Erro ao limpar dados:', error)
    }
  }

  // Verificar se o token existe e é válido
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken()
    return !!token
  }

  // Salvar credenciais para "Lembrar-me"
  async saveRememberMe(cpf: string, password: string): Promise<void> {
    try {
      const credentials = { cpf, password }
      await SecureStore.setItemAsync(
        REMEMBER_ME_KEY,
        JSON.stringify(credentials),
      )
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error)
    }
  }

  // Buscar credenciais salvas
  async getRememberMe(): Promise<{ cpf: string; password: string } | null> {
    try {
      const data = await SecureStore.getItemAsync(REMEMBER_ME_KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Erro ao buscar credenciais:', error)
      return null
    }
  }

  // Remover credenciais salvas
  async clearRememberMe(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(REMEMBER_ME_KEY)
    } catch (error) {
      console.error('Erro ao remover credenciais:', error)
    }
  }
}

export default new SecureStorageService()
