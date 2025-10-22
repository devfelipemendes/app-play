import React, { useCallback, useMemo, forwardRef, useState } from 'react'
import { StyleSheet, View, Text, Pressable, Linking, Share, Platform, TouchableOpacity } from 'react-native'
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Ionicons } from '@expo/vector-icons'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { FaturaDetalhada } from '@/src/api/endpoints/faturaApi'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as Clipboard from 'expo-clipboard'
import { env } from '@/config/env'
import QRCode from 'react-native-qrcode-svg'

interface FaturaBottomSheetProps {
  fatura: FaturaDetalhada | null
  onClose: () => void
}

export const FaturaBottomSheet = forwardRef<BottomSheetModal, FaturaBottomSheetProps>(
  ({ fatura, onClose }, ref) => {
    const { colors } = useCompanyThemeSimple()
    const snapPoints = useMemo(() => ['90%'], [])
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'boleto' | 'recorrente'>('pix')

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
      ),
      []
    )

    const formatCurrency = (value: number | string) => {
      const numValue = typeof value === 'string' ? parseFloat(value) : value
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(numValue)
    }

    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('pt-BR')
      } catch {
        return dateString
      }
    }

    const formatCPF = (cpf: string) => {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }

    const formatCNPJ = (cnpj: string) => {
      return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }

    const formatPhone = (phone: string) => {
      return phone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4')
    }

    const getStatusColor = (status: string) => {
      const statusColors: Record<string, string> = {
        'RECEIVED_IN_CASH': '#10b981',
        'PENDING': '#f59e0b',
        'OVERDUE': '#ef4444',
        'CANCELED': '#6b7280',
      }
      return statusColors[status] || '#6b7280'
    }

    const getStatusText = (status: string) => {
      const statusText: Record<string, string> = {
        'RECEIVED_IN_CASH': 'Pago',
        'PENDING': 'Pendente',
        'OVERDUE': 'Vencido',
        'CANCELED': 'Cancelado',
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
        // Se existir link direto do PDF
        if (fatura.link) {
          const canOpen = await Linking.canOpenURL(fatura.link)
          if (canOpen) {
            await Linking.openURL(fatura.link)
            return
          }
        }

        // Caso contrário, baixa e compartilha
        const fileName = `fatura_${fatura.invoiceNumber}.pdf`
        const fileUri = FileSystem.documentDirectory + fileName

        const downloadResult = await FileSystem.downloadAsync(
          fatura.link || `https://fatura.operadora.app.br/?payid=${fatura.id}`,
          fileUri
        )

        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          const canShare = await Sharing.isAvailableAsync()
          if (canShare) {
            await Sharing.shareAsync(downloadResult.uri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Compartilhar Fatura',
            })
          }
        } else {
          await Share.share({
            title: 'Fatura',
            url: downloadResult.uri,
          })
        }
      } catch (error) {
        console.error('Erro ao exportar PDF:', error)
      }
    }

    const handleCompartilharBoleto = async () => {
      if (!fatura?.barcode) return

      try {
        await Share.share({
          message: `Código de barras do boleto:\n${fatura.barcode}\n\nNosso número: ${fatura.codigoboleto}`,
        })
      } catch (error) {
        console.error('Erro ao compartilhar:', error)
      }
    }

    const handleCopiarPix = async () => {
      if (!fatura?.payload) return

      try {
        await Clipboard.setStringAsync(fatura.payload)
        // Poderia adicionar um Toast aqui
        console.log('Código PIX copiado!')
      } catch (error) {
        console.error('Erro ao copiar:', error)
      }
    }

    const handleCopiarBarcode = async () => {
      if (!fatura?.barcode) return

      try {
        await Clipboard.setStringAsync(fatura.barcode)
        console.log('Código de barras copiado!')
      } catch (error) {
        console.error('Erro ao copiar:', error)
      }
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
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(fatura.status) }]}>
              <Text style={styles.statusText}>{getStatusText(fatura.status)}</Text>
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
                <Text style={styles.value}>{formatCurrency(fatura.planvalue)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Valor Total:</Text>
                <Text style={[styles.value, styles.totalValue, { color: colors.primary }]}>
                  {formatCurrency(fatura.value)}
                </Text>
              </View>
            </View>

            {/* Métodos de Pagamento */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Métodos de Pagamento</Text>

              {/* Tabs */}
              <View style={styles.paymentTabs}>
                <TouchableOpacity
                  style={[
                    styles.paymentTab,
                    paymentMethod === 'pix' && styles.paymentTabActive,
                    paymentMethod === 'pix' && { borderBottomColor: colors.primary }
                  ]}
                  onPress={() => setPaymentMethod('pix')}
                >
                  <Ionicons
                    name="qr-code"
                    size={18}
                    color={paymentMethod === 'pix' ? colors.primary : '#6b7280'}
                  />
                  <Text style={[
                    styles.paymentTabText,
                    paymentMethod === 'pix' && { color: colors.primary, fontWeight: '600' }
                  ]}>
                    PIX
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentTab,
                    paymentMethod === 'boleto' && styles.paymentTabActive,
                    paymentMethod === 'boleto' && { borderBottomColor: colors.primary }
                  ]}
                  onPress={() => setPaymentMethod('boleto')}
                >
                  <Ionicons
                    name="barcode"
                    size={18}
                    color={paymentMethod === 'boleto' ? colors.primary : '#6b7280'}
                  />
                  <Text style={[
                    styles.paymentTabText,
                    paymentMethod === 'boleto' && { color: colors.primary, fontWeight: '600' }
                  ]}>
                    Boleto
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentTab,
                    paymentMethod === 'recorrente' && styles.paymentTabActive,
                    paymentMethod === 'recorrente' && { borderBottomColor: colors.primary }
                  ]}
                  onPress={() => setPaymentMethod('recorrente')}
                >
                  <Ionicons
                    name="card"
                    size={18}
                    color={paymentMethod === 'recorrente' ? colors.primary : '#6b7280'}
                  />
                  <Text style={[
                    styles.paymentTabText,
                    paymentMethod === 'recorrente' && { color: colors.primary, fontWeight: '600' }
                  ]}>
                    Cartão
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Conteúdo PIX */}
              {paymentMethod === 'pix' && fatura.payload && (
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
                    style={[styles.copyButton, { backgroundColor: colors.primary }]}
                    onPress={handleCopiarPix}
                  >
                    <Ionicons name="copy-outline" size={18} color="#ffffff" />
                    <Text style={styles.copyButtonText}>Copiar Código PIX</Text>
                  </Pressable>
                </View>
              )}

              {/* Conteúdo Boleto */}
              {paymentMethod === 'boleto' && fatura.barcode && (
                <View style={styles.paymentContent}>
                  <Text style={styles.paymentInstruction}>
                    Código de barras do boleto:
                  </Text>

                  <View style={styles.barcodeContainer}>
                    <Text style={styles.barcodeText}>{fatura.barcode}</Text>
                  </View>

                  <Pressable
                    style={[styles.copyButton, { backgroundColor: colors.primary }]}
                    onPress={handleCopiarBarcode}
                  >
                    <Ionicons name="copy-outline" size={18} color="#ffffff" />
                    <Text style={styles.copyButtonText}>Copiar Código de Barras</Text>
                  </Pressable>

                  {fatura.codigoboleto && (
                    <Text style={styles.barcodeLabel}>
                      Nosso Número: {fatura.codigoboleto}
                    </Text>
                  )}
                </View>
              )}

              {/* Conteúdo Recorrente/Cartão */}
              {paymentMethod === 'recorrente' && (
                <View style={styles.paymentContent}>
                  <View style={styles.recurrenteContainer}>
                    <View style={styles.recurrenteIcon}>
                      <Ionicons name="card" size={48} color={colors.primary} />
                    </View>

                    <Text style={styles.recurrenteTitle}>
                      Pagamento Recorrente
                    </Text>

                    <Text style={styles.recurrenteDescription}>
                      Configure o pagamento automático no cartão de crédito e nunca mais se preocupe com vencimentos.
                    </Text>

                    <View style={styles.recurrenteBenefits}>
                      <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                        <Text style={styles.benefitText}>Pagamento automático todo mês</Text>
                      </View>
                      <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                        <Text style={styles.benefitText}>Sem preocupação com vencimentos</Text>
                      </View>
                      <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                        <Text style={styles.benefitText}>Cobrança segura e protegida</Text>
                      </View>
                      <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                        <Text style={styles.benefitText}>Cancele quando quiser</Text>
                      </View>
                    </View>

                    <Pressable
                      style={[styles.recurrenteButton, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        Linking.openURL(`https://fatura.operadora.app.br/?payid=${fatura.id}`)
                      }}
                    >
                      <Ionicons name="card-outline" size={20} color="#ffffff" />
                      <Text style={styles.recurrenteButtonText}>
                        Configurar Pagamento Recorrente
                      </Text>
                    </Pressable>

                    <Text style={styles.recurrenteNote}>
                      Você será redirecionado para uma página segura para cadastrar seu cartão de crédito.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Código de Barras */}
            {false && fatura.barcode && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Código de Barras</Text>
                  <Pressable onPress={handleCompartilharBoleto} style={styles.shareButton}>
                    <Ionicons name="share-outline" size={20} color={colors.primary} />
                    <Text style={[styles.shareText, { color: colors.primary }]}>
                      Compartilhar
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.barcodeContainer}>
                  <Text style={styles.barcodeText}>{fatura.barcode}</Text>
                </View>
                <Text style={styles.barcodeLabel}>Nosso Número: {fatura.codigoboleto}</Text>
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
            <Pressable
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={handleAbrirWeb}
            >
              <Ionicons name="globe-outline" size={20} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                Abrir na Web
              </Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleExportarPDF}
            >
              <Ionicons name="download-outline" size={20} color="#ffffff" />
              <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
                Exportar PDF
              </Text>
            </Pressable>
          </View>
          </>
        )}
      </BottomSheetModal>
    )
  }
)

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
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: 'currentColor',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonTextPrimary: {
    color: '#ffffff',
  },
  recurrenteContainer: {
    alignItems: 'center',
    padding: 20,
  },
  recurrenteIcon: {
    marginBottom: 16,
  },
  recurrenteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  recurrenteDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  recurrenteBenefits: {
    width: '100%',
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  recurrenteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    marginBottom: 12,
  },
  recurrenteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  recurrenteNote: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
})
