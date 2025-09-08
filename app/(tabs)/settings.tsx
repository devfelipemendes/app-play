import React, { useContext } from 'react'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import RedirectCard from '@/components/screens/settings/redirect-card'
import { Settings2, User } from 'lucide-react-native'
import { SettingsIcon, SunIcon, MoonIcon } from '@/components/ui/icon'
import { HStack } from '@/components/ui/hstack'
import ThemeCard from '@/components/screens/settings/theme-card'

import CustomHeader from '@/components/shared/custom-header'
import { Link } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { ThemeContext } from '@/contexts/theme-context'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'

const Settings = () => {
  const { colorMode, setColorMode }: any = useContext(ThemeContext)
  const { signOut, loadingAuth } = useAuth()

  return (
    <VStack space="md" className="bg-background-0 flex-1">
      <CustomHeader variant="general" title="Settings" />

      <VStack className="px-4" space="md">
        <RedirectCard title={'General info'} icon={User} />
        <RedirectCard title={'Settings'} icon={SettingsIcon} />
        <RedirectCard title={'Preferences'} icon={Settings2} />
      </VStack>

      <VStack className="px-4" space="md">
        <Text className="font-semibold">Theme</Text>
        <HStack space="sm">
          <ThemeCard
            title="Light Mode"
            icon={SunIcon}
            onPress={() => setColorMode('light')}
            active={colorMode === 'light'}
          />
          <ThemeCard
            title="Dark Mode"
            icon={MoonIcon}
            onPress={() => setColorMode('dark')}
            active={colorMode === 'dark'}
          />
        </HStack>
      </VStack>
      <VStack className="px-4" space="md">
        <Link href="/(auth)/entrar" onPress={() => signOut()}>
          <Text className="font-semibold text-red-600">Logout</Text>
        </Link>
      </VStack>
    </VStack>
  )
}

export default Settings
