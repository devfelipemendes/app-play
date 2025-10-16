// checaICCID.ts - InjectEndpoint
import { apiPlay } from '../apiPlay'

export type ChecaICCIDBody = {
  companyid: string | number | null
  iccid: string
}

export type ChecaIccidRes = {
  success: boolean
  descricao: string
  rede: string
  codigo: number
}

export const checaICCIDApi = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    checaICCID: builder.mutation<ChecaIccidRes, ChecaICCIDBody>({
      query: (payload) => ({
        url: '/api/app/planos/iccid',
        method: 'POST',
        data: payload, // Mudando de 'body' para 'data' para compatibilidade com axiosBaseQuery
      }),
      // Invalidações de tags se necessário
      invalidatesTags: ['ICCID'],
    }),
  }),
  overrideExisting: false,
})

export const { useChecaICCIDMutation } = checaICCIDApi

// Hook customizado para usar no componente
export const useChecaICCID = () => {
  const [checaICCID, { isLoading, error, data }] = useChecaICCIDMutation()

  const validateICCID = async (payload: ChecaICCIDBody) => {
    try {
      const result = await checaICCID(payload).unwrap()
      return {
        success: true,
        data: result,
        error: null,
      }
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: err?.data?.message || 'Erro ao validar ICCID',
      }
    }
  }

  return {
    validateICCID,
    isLoading,
    error,
    data,
  }
}

// Exemplo de uso no componente FormCadastro
/*
import { useChecaICCID } from '@/src/api/endpoints/checaICCID'

export default function FormCadastro() {
  const { validateICCID, isLoading: loadingIccid } = useChecaICCID()
  const { user } = useAuth()
  const [iccidValue, setIccidValue] = useState('')
  const [isIccidValid, setIsIccidValid] = useState<boolean | null>(null)

  const handleValidateICCID = async (iccid: string) => {
    if (iccid.length >= 19 && iccid.length <= 20) {
      const result = await validateICCID({
        token: user?.token || '',
        iccid,
      })

      if (result.success && result.data) {
        setIsIccidValid(true)
        Toast.show({
          type: 'success',
          text1: 'ICCID válido',
          text2: `${result.data.descricao} - Rede: ${result.rede}`,
        })
        
        // Se for TIM ou VIVO, buscar planos
        if (result.rede === 'TIM' || result.rede === 'VIVO') {
          // handleBuscaPlanos()
        }
      } else {
        setIsIccidValid(false)
        Toast.show({
          type: 'error',
          text1: 'ICCID inválido',
          text2: result.error || 'Verifique o ICCID e tente novamente',
        })
      }
    } else {
      setIsIccidValid(null)
    }
  }

  // Função do scanner
  function scanCode({ data }: { type: string; data: string }) {
    const cleanedData = data.replace(/\D/g, '').trim()
    setIccidValue(cleanedData)
    setShowScan(false)
    
    Toast.show({
      type: 'success',
      text1: 'ICCID escaneado!',
      text2: `ICCID: ${cleanedData}`,
    })
  }

  // useEffect para validar quando ICCID mudar
  useEffect(() => {
    if (iccidValue.length >= 19) {
      handleValidateICCID(iccidValue)
    } else {
      setIsIccidValid(null)
    }
  }, [iccidValue])

  // No seu JSX, o ProgressBar ficaria:
  <ProgressBar
    progress={0}
    indeterminate={loadingIccid}
    color={colors.primary}
    style={{
      marginTop: 5,
      backgroundColor: colors.disabled,
      borderRadius: 5,
    }}
  />

  // E o ícone de validação no input:
  rightIcon={
    isIccidValid !== null 
      ? (isIccidValid ? CheckCircle : XCircle)
      : undefined
  }
}
*/
