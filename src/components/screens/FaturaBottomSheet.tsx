import React, {
  useCallback,
  useMemo,
  forwardRef,
  useState,
  useEffect,
} from 'react'
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Linking,
  Share,
  Platform,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Switch,
} from 'react-native'
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import { Ionicons } from '@expo/vector-icons'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { FaturaDetalhada } from '@/src/api/endpoints/faturaApi'
import {
  useListaCartoesMutation,
  useCadastraCartaoMutation,
  useStatusRecorrenciaMutation,
  Cartao,
} from '@/src/api/endpoints/recorrenciaApi'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as Clipboard from 'expo-clipboard'
import { env } from '@/config/env'
import QRCode from 'react-native-qrcode-svg'
import Toast from 'react-native-toast-message'

interface FaturaBottomSheetProps {
  fatura: FaturaDetalhada | null
  onClose: () => void
}

export const FaturaBottomSheet = forwardRef<
  BottomSheetModal,
  FaturaBottomSheetProps
>(({ fatura, onClose }, ref) => {
  const { colors } = useCompanyThemeSimple()
  const snapPoints = useMemo(() => ['90%'], [])
  const [paymentMethod, setPaymentMethod] = useState<
    'pix' | 'boleto' | 'recorrente'
  >('pix')

  // 🔍 DEBUG: Log quando o paymentMethod mudar
  useEffect(() => {
    console.log('💳 [FATURA_MODAL] paymentMethod atual:', paymentMethod)
  }, [paymentMethod])

  // 🔍 DEBUG: Log sempre que a prop fatura mudar
  useEffect(() => {
    console.log('📨 [FATURA_MODAL] Prop fatura recebida:', fatura ? '✅ existe' : '❌ null/undefined')
    if (fatura) {
      console.log('📨 [FATURA_MODAL] fatura.payment:', fatura.payment)
      console.log('📨 [FATURA_MODAL] Dados da fatura:', {
        id: fatura.id,
        payment: fatura.payment,
        value: fatura.value,
        status: fatura.status,
        dueDate: fatura.dueDate,
        barcode: fatura.barcode ? '✅ existe' : '❌ não existe',
        payload: fatura.payload ? '✅ existe' : '❌ não existe',
        invoiceNumber: fatura.invoiceNumber,
        nome: fatura.nome,
        cpf: fatura.cpf,
      })

      // Define automaticamente a aba de pagamento baseada no campo payment
      if (fatura.payment) {
        const paymentLower = fatura.payment.toLowerCase()
        console.log('🔄 [FATURA_MODAL] fatura.payment (lowercase):', paymentLower)

        if (paymentLower.includes('pix') || paymentLower === 'pix') {
          console.log('✅ [FATURA_MODAL] Definindo paymentMethod como: pix')
          setPaymentMethod('pix')
        } else if (paymentLower.includes('boleto') || paymentLower === 'boleto' || paymentLower === 'bank_slip') {
          console.log('✅ [FATURA_MODAL] Definindo paymentMethod como: boleto')
          setPaymentMethod('boleto')
        } else if (paymentLower.includes('credit') || paymentLower.includes('card') || paymentLower === 'credit_card') {
          console.log('✅ [FATURA_MODAL] Definindo paymentMethod como: recorrente')
          setPaymentMethod('recorrente')
        } else {
          console.log('⚠️ [FATURA_MODAL] Payment não reconhecido, mantendo default: pix')
        }
      } else {
        console.log('⚠️ [FATURA_MODAL] fatura.payment está vazio/null, mantendo default: pix')
      }
    }
  }, [fatura])

  // Estados de recorrência
  const [cartoes, setCartoes] = useState<Cartao[]>([])
  const [isRecActive, setIsRecActive] = useState(false)
  const [showAddCard, setShowAddCard] = useState(false)
  const [loadingCartoes, setLoadingCartoes] = useState(false)

  // Formulário de cartão
  const [nomeCartao, setNomeCartao] = useState('')
  const [numCartao, setNumCartao] = useState('')
  const [mesVencimento, setMesVencimento] = useState('')
  const [anoVencimento, setAnoVencimento] = useState('')
  const [cvv, setCvv] = useState('')
  const [cpfCartao, setCpfCartao] = useState('')
  const [emailTitular, setEmailTitular] = useState('')
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')

  // Hooks da API
  const [listaCartoes] = useListaCartoesMutation()
  const [cadastraCartao, { isLoading: loadingCadastro }] =
    useCadastraCartaoMutation()
  const [statusRecorrencia, { isLoading: loadingStatus }] =
    useStatusRecorrenciaMutation()

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  )

  const formatCurrency = (value: number | string) => {
    if (value === undefined || value === null) return 'R$ 0,00'
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(numValue)) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      return date.toLocaleDateString('pt-BR')
    } catch {
      return dateString || '-'
    }
  }

  const formatCPF = (cpf: string) => {
    if (!cpf) return '-'
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return '-'
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const formatPhone = (phone: string) => {
    if (!phone) return '-'
    return phone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4')
  }

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      RECEIVED_IN_CASH: '#10b981',
      PENDING: '#f59e0b',
      OVERDUE: '#ef4444',
      CANCELED: '#6b7280',
    }
    return statusColors[status] || '#6b7280'
  }

  const getStatusText = (status: string) => {
    const statusText: Record<string, string> = {
      RECEIVED_IN_CASH: 'Pago',
      PENDING: 'Pendente',
      OVERDUE: 'Vencido',
      CANCELED: 'Cancelado',
    }
    return statusText[status] || status
  }

  const handleAbrirWeb = async () => {
    if (!fatura) return

    const url = `https://fatura.operadora.app.br/?payid=${fatura.id}`
    const canOpen = await Linking.canOpenURL(url)

    if (canOpen) {
      await Linking.openURL(url)
    }
  }

  const handleExportarPDF = async () => {
    if (!fatura) return

    try {
      Toast.show({
        text1: '⏳ Baixando PDF...',
        text2: 'Aguarde enquanto preparamos sua fatura',
        type: 'info',
        position: 'bottom',
      })

      // Remove o prefixo "pay_" do ID para gerar o link do Asaas
      const faturaId = fatura.id.replace('pay_', '')
      const pdfUrl = `https://www.asaas.com/b/pdf/${faturaId}`

      // Define o nome e caminho do arquivo
      const fileName = `fatura_${fatura.invoiceNumber || faturaId}.pdf`
      const fileUri = FileSystem.documentDirectory + fileName

      // Faz o download do PDF
      const downloadResult = await FileSystem.downloadAsync(pdfUrl, fileUri)

      if (downloadResult.status === 200) {
        // Compartilha/salva o PDF baixado
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          const canShare = await Sharing.isAvailableAsync()
          if (canShare) {
            await Sharing.shareAsync(downloadResult.uri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Salvar/Compartilhar Fatura',
              UTI: 'com.adobe.pdf',
            })

            Toast.show({
              text1: '✅ PDF baixado com sucesso!',
              text2: 'Escolha onde salvar ou compartilhar',
              type: 'success',
              position: 'bottom',
            })
          }
        } else {
          // Web fallback
          await Linking.openURL(downloadResult.uri)
        }
      } else {
        throw new Error('Falha no download')
      }
    } catch (error) {
      Toast.show({
        text1: 'Erro ao baixar PDF',
        text2: 'Verifique sua conexão e tente novamente',
        type: 'error',
      })
    }
  }

  const handleCompartilharBoleto = async () => {
    if (!fatura?.barcode) return

    try {
      await Share.share({
        message: `Código de barras do boleto:\n${fatura.barcode}\n\nNosso número: ${fatura.codigoboleto}`,
      })
    } catch (error) {
      // Silently fail
    }
  }

  const handleCompartilhar = async () => {
    if (!fatura) return

    try {
      const mensagem = `
📄 *Fatura ${fatura.nomeempresa}*

👤 Cliente: ${fatura.nome}
📱 Telefone: ${formatPhone(fatura.msisdn)}

📋 Número da Fatura: ${fatura.invoiceNumber}
📦 Plano: ${fatura.plandescription}
📅 Vencimento: ${formatDate(fatura.dueDate)}
💰 Valor: ${formatCurrency(fatura.value)}
📊 Status: ${getStatusText(fatura.status)}

🔗 Ver detalhes: https://fatura.operadora.app.br/?payid=${fatura.id}
      `.trim()

      await Share.share({
        message: mensagem,
        title: 'Compartilhar Fatura',
      })
    } catch (error) {
      // Silently fail
    }
  }

  const handleCopiarPix = async () => {
    if (!fatura?.payload) return

    try {
      await Clipboard.setStringAsync(fatura.payload)
      Toast.show({
        text1: '✅ Código PIX copiado!',
        text2: 'Cole no app do seu banco para pagar',
        type: 'success',
        position: 'bottom',
      })
    } catch (error) {
      Toast.show({
        text1: 'Erro ao copiar código PIX',
        type: 'error',
      })
    }
  }

  const handleCopiarBarcode = async () => {
    if (!fatura?.barcode) return

    try {
      await Clipboard.setStringAsync(fatura.barcode)
      Toast.show({
        text1: '✅ Código de barras copiado!',
        text2: 'Cole no app do seu banco para pagar',
        type: 'success',
        position: 'bottom',
      })
    } catch (error) {
      Toast.show({
        text1: 'Erro ao copiar código de barras',
        type: 'error',
      })
    }
  }

  // Carrega cartões quando a tab recorrente é selecionada
  useEffect(() => {
    if (paymentMethod === 'recorrente' && fatura && cartoes.length === 0) {
      carregarCartoes()
    }
  }, [paymentMethod, fatura])

  const carregarCartoes = async () => {
    if (!fatura) return

    setLoadingCartoes(true)
    try {
      const result = await listaCartoes({
        cpf: fatura.cpf,
        companyid: env.COMPANY_ID,
        msisdn: fatura.msisdn,
      }).unwrap()

      if (result.status === 'success' && result.cartoes) {
        setCartoes(result.cartoes)
        // Verifica se tem cartão principal para determinar se recorrência está ativa
        const temCartaoPrincipal = result.cartoes.some((c) => c.principal)
        setIsRecActive(temCartaoPrincipal)
      }
    } catch (error: any) {
      // Silently fail - cartões não carregados
    } finally {
      setLoadingCartoes(false)
    }
  }

  const handleAdicionarCartao = async () => {
    if (!fatura) return

    // Validações básicas
    if (!nomeCartao || !numCartao || !mesVencimento || !anoVencimento || !cvv) {
      Toast.show({
        text1: 'Campos obrigatórios',
        text2: 'Preencha todos os campos obrigatórios',
        type: 'error',
      })
      return
    }

    if (numCartao.replace(/\s/g, '').length < 13) {
      Toast.show({
        text1: 'Número do cartão inválido',
        text2: 'Verifique o número do cartão',
        type: 'error',
      })
      return
    }

    try {
      await cadastraCartao({
        name: nomeCartao,
        cpf: fatura.cpf,
        numerocartao: numCartao.replace(/\s/g, ''),
        expirames: mesVencimento,
        expiraano: '20' + anoVencimento,
        ccv: cvv,
        email: emailTitular || fatura.email,
        telefone: fatura.msisdn,
        cep: cep,
        endereco: endereco,
        card_id: cartoes.length + 1,
        cpfcartao: cpfCartao || fatura.cpf,
      }).unwrap()

      Toast.show({
        text1: '✅ Cartão adicionado!',
        text2: 'Seu cartão foi cadastrado com sucesso',
        type: 'success',
        position: 'bottom',
      })

      // Limpa formulário
      setNomeCartao('')
      setNumCartao('')
      setMesVencimento('')
      setAnoVencimento('')
      setCvv('')
      setCpfCartao('')
      setEmailTitular('')
      setCep('')
      setEndereco('')
      setShowAddCard(false)

      // Recarrega lista de cartões
      carregarCartoes()
    } catch (error: any) {
      Toast.show({
        text1: 'Erro ao adicionar cartão',
        text2: error?.data?.error || 'Tente novamente',
        type: 'error',
      })
    }
  }

  const handleToggleRecorrencia = async (value: boolean) => {
    if (!fatura) return

    // Se estiver ativando, verifica se tem cartão
    if (value && cartoes.length === 0) {
      Toast.show({
        text1: 'Cadastre um cartão primeiro',
        text2: 'Você precisa cadastrar um cartão antes de ativar a recorrência',
        type: 'error',
      })
      return
    }

    try {
      await statusRecorrencia({
        cpf: fatura.cpf,
        statusrec: value,
        msisdn: fatura.msisdn,
      }).unwrap()

      setIsRecActive(value)
      Toast.show({
        text1: value ? '✅ Recorrência ativada!' : 'Recorrência desativada',
        text2: value
          ? 'Seus pagamentos serão automáticos'
          : 'Você voltará a pagar manualmente',
        type: 'success',
        position: 'bottom',
      })
    } catch (error: any) {
      if (error?.response?.status === 590) {
        Toast.show({
          text1: 'Cartão principal não cadastrado',
          text2: 'Adicione um cartão primeiro',
          type: 'error',
        })
      } else {
        Toast.show({
          text1: 'Erro ao atualizar recorrência',
          text2: 'Tente novamente',
          type: 'error',
        })
      }
    }
  }

  const getBandeira = (numero: string): string => {
    const num = numero.replace(/\s/g, '')
    if (/^4/.test(num)) return 'Visa'
    if (/^5[1-5]/.test(num)) return 'Mastercard'
    if (/^3[47]/.test(num)) return 'American Express'
    if (/^6(?:011|5)/.test(num)) return 'Discover'
    if (/^636[2-9]|^637[0-9]|^638[0-9]/.test(num)) return 'Elo'
    if (/^606282/.test(num)) return 'Hipercard'
    return 'Desconhecido'
  }

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '')
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
    return formatted
  }

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#ffffff' }}
    >
      {!fatura ? (
        <View style={styles.loadingContainer}>
          <Text>Carregando...</Text>
        </View>
      ) : (
        <>
          {/* Header Fixo */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="document-text" size={24} color={colors.primary} />
              <Text style={[styles.headerTitle, { color: colors.primary }]}>
                Fatura
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </Pressable>
          </View>

          {/* Conteúdo Scrollável */}
          <BottomSheetScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(fatura.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusText(fatura.status)}
              </Text>
            </View>

            {/* Informações do Cliente */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dados do Cliente</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Nome:</Text>
                <Text style={styles.value}>{fatura.nome}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>CPF:</Text>
                <Text style={styles.value}>{formatCPF(fatura.cpf)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Telefone:</Text>
                <Text style={styles.value}>{formatPhone(fatura.msisdn)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{fatura.email}</Text>
              </View>
            </View>

            {/* Informações da Operadora */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dados da Operadora</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Operadora:</Text>
                <Text style={styles.value}>{fatura.nomeempresa}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>CNPJ:</Text>
                <Text style={styles.value}>{formatCNPJ(fatura.cnpj)}</Text>
              </View>
              {fatura.parceiro && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Parceiro:</Text>
                  <Text style={styles.value}>{fatura.parceiro}</Text>
                </View>
              )}
            </View>

            {/* Informações da Fatura */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detalhes da Fatura</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Número:</Text>
                <Text style={styles.value}>{fatura.invoiceNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Plano:</Text>
                <Text style={styles.value}>{fatura.plandescription}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Vencimento:</Text>
                <Text style={styles.value}>{formatDate(fatura.dueDate)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Valor do Plano:</Text>
                <Text style={styles.value}>
                  {formatCurrency(fatura.planvalue)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Valor Total:</Text>
                <Text
                  style={[
                    styles.value,
                    styles.totalValue,
                    { color: colors.primary },
                  ]}
                >
                  {formatCurrency(fatura.value)}
                </Text>
              </View>
            </View>

            {/* Métodos de Pagamento */}
            {fatura.status !== 'RECEIVED_IN_CASH' &&
              fatura.status !== 'RECEIVED' &&
              fatura.status !== 'CONFIRMED' && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Métodos de Pagamento</Text>

                  {/* Tabs */}
                  <View style={styles.paymentTabs}>
                    <TouchableOpacity
                      style={[
                        styles.paymentTab,
                        paymentMethod === 'pix' && styles.paymentTabActive,
                        paymentMethod === 'pix' && {
                          borderBottomColor: colors.primary,
                        },
                      ]}
                      onPress={() => setPaymentMethod('pix')}
                    >
                      <Ionicons
                        name="qr-code"
                        size={18}
                        color={
                          paymentMethod === 'pix' ? colors.primary : '#6b7280'
                        }
                      />
                      <Text
                        style={[
                          styles.paymentTabText,
                          paymentMethod === 'pix' && {
                            color: colors.primary,
                            fontWeight: '600',
                          },
                        ]}
                      >
                        PIX
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.paymentTab,
                        paymentMethod === 'boleto' && styles.paymentTabActive,
                        paymentMethod === 'boleto' && {
                          borderBottomColor: colors.primary,
                        },
                      ]}
                      onPress={() => setPaymentMethod('boleto')}
                    >
                      <Ionicons
                        name="barcode"
                        size={18}
                        color={
                          paymentMethod === 'boleto'
                            ? colors.primary
                            : '#6b7280'
                        }
                      />
                      <Text
                        style={[
                          styles.paymentTabText,
                          paymentMethod === 'boleto' && {
                            color: colors.primary,
                            fontWeight: '600',
                          },
                        ]}
                      >
                        Boleto
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.paymentTab,
                        paymentMethod === 'recorrente' &&
                          styles.paymentTabActive,
                        paymentMethod === 'recorrente' && {
                          borderBottomColor: colors.primary,
                        },
                      ]}
                      onPress={() => setPaymentMethod('recorrente')}
                    >
                      <Ionicons
                        name="card"
                        size={18}
                        color={
                          paymentMethod === 'recorrente'
                            ? colors.primary
                            : '#6b7280'
                        }
                      />
                      <Text
                        style={[
                          styles.paymentTabText,
                          paymentMethod === 'recorrente' && {
                            color: colors.primary,
                            fontWeight: '600',
                          },
                        ]}
                      >
                        Cartão
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Conteúdo PIX */}
                  {paymentMethod === 'pix' && (() => {
                    console.log('🔍 [RENDER] Tentando renderizar PIX')
                    console.log('🔍 [RENDER] paymentMethod === "pix"?', paymentMethod === 'pix')
                    console.log('🔍 [RENDER] fatura.payload existe?', !!fatura.payload)
                    return fatura.payload
                  })() && (
                    <View style={styles.paymentContent}>
                      <View style={styles.qrCodeContainer}>
                        <QRCode
                          value={fatura.payload}
                          size={200}
                          backgroundColor="white"
                          color="black"
                        />
                      </View>

                      <Text style={styles.paymentInstruction}>
                        Escaneie o QR Code acima ou copie o código PIX:
                      </Text>

                      <View style={styles.pixCodeContainer}>
                        <Text style={styles.pixCode} numberOfLines={3}>
                          {fatura.payload}
                        </Text>
                      </View>

                      <Pressable
                        style={[
                          styles.copyButton,
                          { backgroundColor: colors.primary },
                        ]}
                        onPress={handleCopiarPix}
                      >
                        <Ionicons
                          name="copy-outline"
                          size={18}
                          color="#ffffff"
                        />
                        <Text style={styles.copyButtonText}>
                          Copiar Código PIX
                        </Text>
                      </Pressable>
                    </View>
                  )}

                  {/* Conteúdo Boleto */}
                  {paymentMethod === 'boleto' && (() => {
                    console.log('🔍 [RENDER] Tentando renderizar Boleto')
                    console.log('🔍 [RENDER] paymentMethod === "boleto"?', paymentMethod === 'boleto')
                    console.log('🔍 [RENDER] fatura.barcode existe?', !!fatura.barcode)
                    return fatura.barcode
                  })() && (
                    <View style={styles.paymentContent}>
                      <Text style={styles.paymentInstruction}>
                        Código de barras do boleto:
                      </Text>

                      <View style={styles.barcodeContainer}>
                        <Text style={styles.barcodeText}>{fatura.barcode}</Text>
                      </View>

                      <Pressable
                        style={[
                          styles.copyButton,
                          { backgroundColor: colors.primary },
                        ]}
                        onPress={handleCopiarBarcode}
                      >
                        <Ionicons
                          name="copy-outline"
                          size={18}
                          color="#ffffff"
                        />
                        <Text style={styles.copyButtonText}>
                          Copiar Código de Barras
                        </Text>
                      </Pressable>

                      {fatura.codigoboleto && (
                        <Text style={styles.barcodeLabel}>
                          Nosso Número: {fatura.codigoboleto}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Conteúdo Recorrente/Cartão */}
                  {paymentMethod === 'recorrente' && (() => {
                    console.log('🔍 [RENDER] Renderizando Cartão/Recorrente')
                    console.log('🔍 [RENDER] paymentMethod === "recorrente"?', paymentMethod === 'recorrente')
                    return true
                  })() && (
                    <View style={styles.paymentContent}>
                      {loadingCartoes ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator
                            size="large"
                            color={colors.primary}
                          />
                          <Text style={styles.loadingText}>
                            Carregando cartões...
                          </Text>
                        </View>
                      ) : (
                        <>
                          {/* Lista de Cartões */}
                          {cartoes.length > 0 && (
                            <View style={styles.cartoesSection}>
                              <View style={styles.recorrenciaHeader}>
                                <Text style={styles.sectionTitle}>
                                  Pagamento Recorrente
                                </Text>
                                <Switch
                                  value={isRecActive}
                                  onValueChange={handleToggleRecorrencia}
                                  disabled={loadingStatus}
                                  trackColor={{
                                    false: '#d1d5db',
                                    true: colors.primary + '50',
                                  }}
                                  thumbColor={
                                    isRecActive ? colors.primary : '#f3f4f6'
                                  }
                                />
                              </View>

                              <Text style={styles.recorrenciaDesc}>
                                {isRecActive
                                  ? 'Cobrança automática ativada. Seus cartões serão cobrados automaticamente todo mês.'
                                  : 'Ative a cobrança recorrente para não se preocupar mais com vencimentos.'}
                              </Text>

                              {cartoes.length > 1 && (
                                <View style={styles.prioridadeAlert}>
                                  <Ionicons
                                    name="information-circle"
                                    size={20}
                                    color="#3b82f6"
                                  />
                                  <Text style={styles.prioridadeText}>
                                    A cobrança será feita no primeiro cartão. Se
                                    não for possível, tentaremos no segundo e
                                    terceiro.
                                  </Text>
                                </View>
                              )}

                              {cartoes.map((cartao, index) => (
                                <View key={cartao.id} style={styles.cartaoItem}>
                                  <View style={styles.cartaoInfo}>
                                    <Ionicons
                                      name="card"
                                      size={24}
                                      color={colors.primary}
                                    />
                                    <View style={styles.cartaoDetails}>
                                      <Text style={styles.cartaoNome}>
                                        {cartao.nome}
                                      </Text>
                                      <Text style={styles.cartaoNumero}>
                                        {cartao.bandeira} •••• {cartao.final}
                                      </Text>
                                    </View>
                                  </View>
                                  {index === 0 && (
                                    <View style={styles.principalBadge}>
                                      <Text style={styles.principalText}>
                                        Principal
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              ))}

                              {cartoes.length < 3 && !showAddCard && (
                                <Pressable
                                  style={[
                                    styles.addCardButton,
                                    { borderColor: colors.primary },
                                  ]}
                                  onPress={() => setShowAddCard(true)}
                                >
                                  <Ionicons
                                    name="add-circle-outline"
                                    size={20}
                                    color={colors.primary}
                                  />
                                  <Text
                                    style={[
                                      styles.addCardButtonText,
                                      { color: colors.primary },
                                    ]}
                                  >
                                    Adicionar Outro Cartão
                                  </Text>
                                </Pressable>
                              )}
                            </View>
                          )}

                          {/* Formulário Adicionar Cartão */}
                          {(cartoes.length === 0 || showAddCard) && (
                            <View style={styles.formContainer}>
                              <View style={styles.formHeader}>
                                <Ionicons
                                  name="card"
                                  size={40}
                                  color={colors.primary}
                                />
                                <Text style={styles.formTitle}>
                                  {cartoes.length === 0
                                    ? 'Pagamento Recorrente'
                                    : 'Adicionar Novo Cartão'}
                                </Text>
                                <Text style={styles.formSubtitle}>
                                  Configure o pagamento automático e nunca mais
                                  se preocupe com vencimentos.
                                </Text>
                              </View>

                              <View style={styles.benefitsList}>
                                <View style={styles.benefitItem}>
                                  <Ionicons
                                    name="checkmark-circle"
                                    size={20}
                                    color="#10b981"
                                  />
                                  <Text style={styles.benefitText}>
                                    Pagamento automático todo mês
                                  </Text>
                                </View>
                                <View style={styles.benefitItem}>
                                  <Ionicons
                                    name="checkmark-circle"
                                    size={20}
                                    color="#10b981"
                                  />
                                  <Text style={styles.benefitText}>
                                    Sem preocupação com vencimentos
                                  </Text>
                                </View>
                                <View style={styles.benefitItem}>
                                  <Ionicons
                                    name="checkmark-circle"
                                    size={20}
                                    color="#10b981"
                                  />
                                  <Text style={styles.benefitText}>
                                    Cobrança segura e protegida
                                  </Text>
                                </View>
                                <View style={styles.benefitItem}>
                                  <Ionicons
                                    name="checkmark-circle"
                                    size={20}
                                    color="#10b981"
                                  />
                                  <Text style={styles.benefitText}>
                                    Cancele quando quiser
                                  </Text>
                                </View>
                              </View>

                              <View style={styles.divider} />

                              <Text style={styles.formSectionTitle}>
                                Dados do Cartão
                              </Text>

                              <TextInput
                                style={styles.input}
                                placeholder="Nome no cartão"
                                value={nomeCartao}
                                onChangeText={setNomeCartao}
                                autoCapitalize="words"
                              />

                              <TextInput
                                style={styles.input}
                                placeholder="Número do cartão"
                                value={numCartao}
                                onChangeText={(text) =>
                                  setNumCartao(formatCardNumber(text))
                                }
                                keyboardType="numeric"
                                maxLength={19}
                              />

                              <View style={styles.rowInputs}>
                                <TextInput
                                  style={[styles.input, styles.inputSmall]}
                                  placeholder="Mês"
                                  value={mesVencimento}
                                  onChangeText={setMesVencimento}
                                  keyboardType="numeric"
                                  maxLength={2}
                                />
                                <TextInput
                                  style={[styles.input, styles.inputSmall]}
                                  placeholder="Ano"
                                  value={anoVencimento}
                                  onChangeText={setAnoVencimento}
                                  keyboardType="numeric"
                                  maxLength={2}
                                />
                                <TextInput
                                  style={[styles.input, styles.inputSmall]}
                                  placeholder="CVV"
                                  value={cvv}
                                  onChangeText={setCvv}
                                  keyboardType="numeric"
                                  maxLength={4}
                                  secureTextEntry
                                />
                              </View>

                              <TextInput
                                style={styles.input}
                                placeholder="CPF do titular"
                                value={cpfCartao}
                                onChangeText={setCpfCartao}
                                keyboardType="numeric"
                                maxLength={14}
                              />

                              <TextInput
                                style={styles.input}
                                placeholder="E-mail"
                                value={emailTitular}
                                onChangeText={setEmailTitular}
                                keyboardType="email-address"
                                autoCapitalize="none"
                              />

                              <TextInput
                                style={styles.input}
                                placeholder="CEP"
                                value={cep}
                                onChangeText={setCep}
                                keyboardType="numeric"
                                maxLength={9}
                              />

                              <TextInput
                                style={styles.input}
                                placeholder="Endereço completo"
                                value={endereco}
                                onChangeText={setEndereco}
                                multiline
                              />

                              <View style={styles.formButtons}>
                                {showAddCard && (
                                  <Pressable
                                    style={[
                                      styles.formButton,
                                      styles.cancelButton,
                                    ]}
                                    onPress={() => setShowAddCard(false)}
                                  >
                                    <Text style={styles.cancelButtonText}>
                                      Cancelar
                                    </Text>
                                  </Pressable>
                                )}

                                <Pressable
                                  style={[
                                    styles.formButton,
                                    styles.submitButton,
                                    { backgroundColor: colors.primary },
                                    loadingCadastro && styles.buttonDisabled,
                                  ]}
                                  onPress={handleAdicionarCartao}
                                  disabled={loadingCadastro}
                                >
                                  {loadingCadastro ? (
                                    <ActivityIndicator color="#ffffff" />
                                  ) : (
                                    <>
                                      <Ionicons
                                        name="checkmark-circle"
                                        size={20}
                                        color="#ffffff"
                                      />
                                      <Text style={styles.submitButtonText}>
                                        {cartoes.length === 0
                                          ? 'Adicionar Cartão'
                                          : 'Salvar Cartão'}
                                      </Text>
                                    </>
                                  )}
                                </Pressable>
                              </View>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  )}
                </View>
              )}

            {/* Código de Barras */}
            {false && fatura?.barcode && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Código de Barras</Text>
                  <Pressable
                    onPress={handleCompartilharBoleto}
                    style={styles.shareButton}
                  >
                    <Ionicons
                      name="share-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.shareText, { color: colors.primary }]}>
                      Compartilhar
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.barcodeContainer}>
                  <Text style={styles.barcodeText}>{fatura?.barcode}</Text>
                </View>
                <Text style={styles.barcodeLabel}>
                  Nosso Número: {fatura?.codigoboleto}
                </Text>
              </View>
            )}

            {/* Descrição */}
            {fatura.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Descrição</Text>
                <Text style={styles.description}>{fatura.description}</Text>
              </View>
            )}
          </BottomSheetScrollView>

          {/* Botões de Ação Fixos */}
          <View style={styles.actions}>
            {/* Linha 1: Botões Secundários */}
            <View style={styles.actionsRow}>
              <Pressable
                style={[
                  styles.actionButtonSmall,
                  { borderColor: colors.primary },
                ]}
                onPress={handleCompartilhar}
              >
                <Ionicons
                  name="share-social"
                  size={20}
                  color={colors.primary}
                />
                <Text
                  style={[
                    styles.actionButtonSmallText,
                    { color: colors.primary },
                  ]}
                >
                  Compartilhar
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.actionButtonSmall,
                  { borderColor: colors.primary },
                ]}
                onPress={handleAbrirWeb}
              >
                <Ionicons name="globe" size={20} color={colors.primary} />
                <Text
                  style={[
                    styles.actionButtonSmallText,
                    { color: colors.primary },
                  ]}
                >
                  Abrir na Web
                </Text>
              </Pressable>
            </View>

            {/* Linha 2: Botão Principal */}
            <Pressable
              style={[
                styles.actionButtonMain,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleExportarPDF}
            >
              <Ionicons name="print" size={24} color="#ffffff" />
              <Text style={styles.actionButtonMainText}>Imprimir Fatura</Text>
            </Pressable>
          </View>
        </>
      )}
    </BottomSheetModal>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  paymentTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 20,
  },
  paymentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  paymentTabActive: {
    borderBottomWidth: 2,
  },
  paymentTabText: {
    fontSize: 14,
    color: '#6b7280',
  },
  paymentContent: {
    marginTop: 8,
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  paymentInstruction: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  pixCodeContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  pixCode: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#1f2937',
    textAlign: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  copyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  barcodeContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  barcodeText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#1f2937',
    textAlign: 'center',
  },
  barcodeLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shareText: {
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fafafa',
    gap: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButtonSmall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: '#ffffff',
  },
  actionButtonSmallText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtonMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonMainText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  cartoesSection: {
    marginTop: 8,
  },
  recorrenciaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recorrenciaDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  prioridadeAlert: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    marginBottom: 16,
  },
  prioridadeText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  cartaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cartaoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cartaoDetails: {
    flex: 1,
  },
  cartaoNome: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  cartaoNumero: {
    fontSize: 13,
    color: '#6b7280',
  },
  principalBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  principalText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addCardButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    marginTop: 8,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  benefitsList: {
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 20,
  },
  formSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1f2937',
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  inputSmall: {
    flex: 1,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#4b5563',
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    // backgroundColor dinâmico via inline style
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  benefitItem: {
    display: 'flex',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 2,
  },
  benefitText: {
    fontWeight: 700,
  },
})
