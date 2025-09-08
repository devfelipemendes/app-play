// src/store/providers/index.tsx
import React, { useEffect, useRef } from 'react'
import { useAppDispatch } from '../hooks'
import { setLoadingSystem } from '../slices/authSlice'

interface AuthProviderProps {
  children: React.ReactNode
}

// Provider simplificado que apenas gerencia o estado inicial
export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch()
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Garantir que só executa uma vez
    if (hasInitialized.current) return
    hasInitialized.current = true

    // Inicializar o sistema
    const initSystem = async () => {
      // Aguardar um momento para garantir que tudo está montado
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Sistema está pronto
      dispatch(setLoadingSystem(false))
    }

    initSystem()
  }, [dispatch])

  return children
}
