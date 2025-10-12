import React, { useState, useContext } from 'react'
import { VStack } from '@/components/ui/vstack'
import RedirectCard from '@/components/screens/settings/redirect-card'
import { RefreshCcw, Plus, Smartphone } from 'lucide-react-native'
import CustomHeader from '@/components/shared/custom-header'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import ActivateLineModal from '@/components/layout/ActivateLineModal'
import { useAppSelector } from '@/src/store/hooks'
import type { RootState } from '@/src/store'
import { StatusBar } from 'expo-status-bar'
import { ThemeContext } from '@/contexts/theme-context'

const Plans = () => {
  const { colors } = useCompanyThemeSimple()
  const { colorMode }: any = useContext(ThemeContext)
  const [showPlansModal, setShowPlansModal] = useState(false)

  // Pegar ICCID do usuário para passar ao modal
  const user = useAppSelector((state: RootState) => state.auth.user)
  const iccid = user?.iccid || ''

  const handleChangePlan = () => {
    setShowPlansModal(true)
  }

  const handleAdditionalRecharge = () => {
    // TODO: Implementar funcionalidade de recarga adicional
    console.log('Recarga adicional clicada')
  }

  const handleActivateLine = () => {
    setShowPlansModal(true)
  }

  const handleModalClose = () => {
    setShowPlansModal(false)
  }

  const handleActivationSuccess = () => {
    // TODO: Atualizar dados do usuário após ativação bem-sucedida
    console.log('Linha ativada com sucesso!')
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

      {/* Modal de Planos */}
      <ActivateLineModal
        visible={showPlansModal}
        onClose={handleModalClose}
        colors={colors}
        iccid={iccid}
        onSuccess={handleActivationSuccess}
      />
    </VStack>
  )
}

export default Plans
