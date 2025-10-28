import { useState } from 'react'
import axios from 'axios'

interface CepData {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

interface UseCepReturn {
  fetchCep: (cep: string) => Promise<CepData | null>
  loading: boolean
  error: string | null
}

export function useCep(): UseCepReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCep = async (cep: string): Promise<CepData | null> => {
    const cleanCep = cep.replace(/\D/g, '')

    if (cleanCep.length !== 8) {
      setError('CEP deve ter 8 dígitos')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const { data } = await axios.get<CepData>(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      )

      if (data.erro) {
        setError('CEP não encontrado')
        return null
      }

      return data
    } catch (err) {
      console.log(err)

      setError('Erro ao buscar CEP. Verifique sua conexão.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    fetchCep,
    loading,
    error,
  }
}
