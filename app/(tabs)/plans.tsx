import React, { useState, useContext } from 'react'
import { VStack } from '@/components/ui/vstack'
import RedirectCard from '@/components/screens/settings/redirect-card'
import { RefreshCcw, Plus, Smartphone } from 'lucide-react-native'
import CustomHeader from '@/components/shared/custom-header'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import ActivateLineBottomSheet from '@/components/layout/ActivateLineBottomSheet'
import AdditionalRechargeBottomSheet from '@/components/layout/AdditionalRechargeBottomSheet'
import { useAppSelector } from '@/src/store/hooks'
import type { RootState } from '@/src/store'
import { StatusBar } from 'expo-status-bar'
import { ThemeContext } from '@/contexts/theme-context'
import { useRouter } from 'expo-router'

const Plans = () => {
  const { colors } = useCompanyThemeSimple()
  const { colorMode }: any = useContext(ThemeContext)
  const router = useRouter()
  const [showPlansModal, setShowPlansModal] = useState(false)
  const [showRechargeModal, setShowRechargeModal] = useState(false)

  // Pegar dados do usuário
  const user = useAppSelector((state: RootState) => state.auth.user)
  const iccid = user?.iccid || ''
  const msisdn = user?.msisdn || ''

  const handleChangePlan = () => {
    setShowPlansModal(true)
  }

  const handleAdditionalRecharge = () => {
    setShowRechargeModal(true)
  }

  const handleActivateLine = () => {
    setShowPlansModal(true)
  }

  const handleModalClose = () => {
    setShowPlansModal(false)
  }

  const handleRechargeModalClose = () => {
    setShowRechargeModal(false)
  }

  const handleActivationSuccess = () => {
    console.log('Linha ativada com sucesso!')
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
    <VStack space="md" className="bg-white dark:bg-gray-900 flex-1">
      <StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
      <CustomHeader variant="general" title="Planos" />

      <VStack className="px-4" space="md">
        <RedirectCard
          title="Alterar Plano"
          icon={RefreshCcw}
          onPress={handleChangePlan}
        />
        <RedirectCard
          title="Recarga Adicional"
          icon={Plus}
          onPress={handleAdditionalRecharge}
        />
        <RedirectCard
          title="Ativar Linha"
          icon={Smartphone}
          onPress={handleActivateLine}
        />
      </VStack>

      {/* Bottom Sheet de Planos */}
      <ActivateLineBottomSheet
        isOpen={showPlansModal}
        onClose={handleModalClose}
        colors={colors}
        iccid={iccid}
        onSuccess={handleActivationSuccess}
      />

      {/* Bottom Sheet de Recarga Adicional */}
      <AdditionalRechargeBottomSheet
        isOpen={showRechargeModal}
        onClose={handleRechargeModalClose}
        colors={colors}
        msisdn={msisdn}
        onSuccess={handleRechargeSuccess}
      />
    </VStack>
  )
}

export default Plans
