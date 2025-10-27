import React, { useState, useContext } from 'react'
import { VStack } from '@/components/ui/vstack'
import RedirectCard from '@/components/screens/settings/redirect-card'
import { RefreshCcw, Plus, Smartphone, Repeat, Box } from 'lucide-react-native'
import CustomHeader from '@/components/shared/custom-header'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import ActivateLineBottomSheet from '@/components/layout/ActivateLineBottomSheetWithSteps'
import AdditionalRechargeBottomSheet from '@/components/layout/AdditionalRechargeBottomSheet'
import ChangePlanBottomSheet from '@/components/layout/ChangePlanBottomSheet'
import PortabilityBottomSheet from '@/components/layout/PortabilityBottomSheet'
import { useAppSelector } from '@/src/store/hooks'
import type { RootState } from '@/src/store'
import { StatusBar } from 'expo-status-bar'
import { ThemeContext } from '@/contexts/theme-context'
import { useRouter } from 'expo-router'
import { selectDet2Data, selectDet2Error } from '@/src/store/slices/det2Slice'
import { maskCelular } from '@/utils/masks'

const Plans = () => {
  const { colors } = useCompanyThemeSimple()
  const { colorMode }: any = useContext(ThemeContext)
  const router = useRouter()
  const [showChangePlanModal, setShowChangePlanModal] = useState(false)
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  const [showActivateLineModal, setShowActivateLineModal] = useState(false)
  const [showPortabilityModal, setShowPortabilityModal] = useState(false)

  // Pegar dados do usuário e da linha selecionada
  const user = useAppSelector((state: RootState) => state.auth.user)
  const det2Data = useAppSelector(selectDet2Data)
  const det2Error = useAppSelector(selectDet2Error)

  const msisdn = det2Data?.msisdn || ''
  const currentPlanId = user?.planid_personalizado || ''
  const codigoP = user?.cp || ''
  const tempMsisdn = user?.tempmsisdn || ''

  // Verificar se a linha selecionada tem MSISDN ativo
  const isNoMsisdn = det2Error === 'NO_MSISDN'
  const hasMsisdn = !isNoMsisdn && Boolean(msisdn && msisdn.trim().length > 0)

  // Verificar se é pós-pago
  const isPospago = user?.pospago === true
  const graceStatuses = ['GRACE 1', 'GRACE 2', 'GRACE 3', 'BLOQUEADO', 'EX']
  const isGrace = graceStatuses.includes(det2Data?.statusplan || '')

  console.log('📱 [PLANS] det2Error:', det2Error)
  console.log('📱 [PLANS] det2Data?.msisdn:', det2Data?.msisdn)
  console.log('📱 [PLANS] isNoMsisdn:', isNoMsisdn)
  console.log('📱 [PLANS] hasMsisdn:', hasMsisdn)
  console.log('📱 [PLANS] isPospago:', isPospago)

  const handleChangePlan = () => {
    setShowChangePlanModal(true)
  }

  const handleAdditionalRecharge = () => {
    setShowRechargeModal(true)
  }

  const handleActivateLine = () => {
    setShowActivateLineModal(true)
  }

  const handlePortability = () => {
    setShowPortabilityModal(true)
  }

  const handleChangePlanModalClose = () => {
    setShowChangePlanModal(false)
  }

  const handleRechargeModalClose = () => {
    setShowRechargeModal(false)
  }

  const handleActivateLineModalClose = () => {
    setShowActivateLineModal(false)
  }

  const handlePortabilityModalClose = () => {
    setShowPortabilityModal(false)
  }

  const handleActivationSuccess = () => {
    console.log('Linha ativada com sucesso!')
    // Atualizar lista de linhas ou recarregar dados
  }

  const handlePortabilitySuccess = () => {
    console.log('Portabilidade solicitada com sucesso!')
    // Atualizar lista de linhas ou recarregar dados
  }

  const handleChangePlanSuccess = (fatura?: string) => {
    console.log('Plano alterado com sucesso!')
    // Se tiver fatura, navegar para a tela de fatura
    if (fatura) {
      // TODO: Implementar navegação para tela de fatura
      console.log('Navegar para fatura:', fatura)
    }
  }

  const handleRechargeSuccess = (payid?: string) => {
    console.log('Recarga realizada com sucesso!')
    // Se tiver payid, navegar para a tela de fatura
    if (payid) {
      // TODO: Implementar navegação para tela de fatura
      console.log('Navegar para fatura:', payid)
    }
  }

  return (
    <VStack space="md" className=" dark:bg-gray-900 flex-1">
      <StatusBar style="light" />
      <CustomHeader
        variant="general"
        title="Sua Operadora"
        description="Gerencie sua linha"
      />

      <VStack className="px-4" space="md">
        {/* Se é PÓS-PAGO, mostra apenas Portabilidade */}
        {isPospago ? (
          <RedirectCard
            title="Portabilidade"
            icon={Repeat}
            onPress={handlePortability}
          />
        ) : !hasMsisdn ? (
          // Se NÃO é pós-pago e NÃO tem MSISDN, mostra apenas Ativar Nova Linha
          <RedirectCard
            title="Ativar Nova Linha"
            icon={Smartphone}
            onPress={handleActivateLine}
          />
        ) : (
          // Se NÃO é pós-pago e TEM MSISDN, mostra todos os botões
          <>
            <RedirectCard
              title="Alterar Plano"
              icon={RefreshCcw}
              onPress={handleChangePlan}
            />
            {!isGrace && (
              <RedirectCard
                title="Recarga Adicional"
                icon={Plus}
                onPress={handleAdditionalRecharge}
              />
            )}
            <RedirectCard
              title="Portabilidade"
              icon={Repeat}
              onPress={handlePortability}
            />
            <RedirectCard
              title="Ativar Nova Linha"
              icon={Smartphone}
              onPress={handleActivateLine}
            />
          </>
        )}
      </VStack>

      {/* Bottom Sheet de Alterar Plano */}
      <ChangePlanBottomSheet
        isOpen={showChangePlanModal}
        onClose={handleChangePlanModalClose}
        colors={colors}
        msisdn={msisdn}
        currentPlanId={currentPlanId}
        onSuccess={handleChangePlanSuccess}
      />

      {/* Bottom Sheet de Recarga Adicional */}
      <AdditionalRechargeBottomSheet
        isOpen={showRechargeModal}
        onClose={handleRechargeModalClose}
        colors={colors}
        msisdn={msisdn}
        onSuccess={handleRechargeSuccess}
      />

      {/* Bottom Sheet de Portabilidade */}
      <PortabilityBottomSheet
        isOpen={showPortabilityModal}
        onClose={handlePortabilityModalClose}
        colors={colors}
        msisdn={msisdn}
        codigoP={codigoP}
        tempMsisdn={tempMsisdn}
        onSuccess={handlePortabilitySuccess}
      />

      {/* Bottom Sheet de Ativação de Linha (com steps) */}
      <ActivateLineBottomSheet
        isOpen={showActivateLineModal}
        onClose={handleActivateLineModalClose}
        colors={colors}
        onSuccess={handleActivationSuccess}
      />
    </VStack>
  )
}

export default Plans
