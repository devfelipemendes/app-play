import React, { useContext } from 'react'
import { HStack } from '@/components/ui/hstack'
import { SearchIcon } from '@/components/ui/icon'
import { VStack } from '@/components/ui/vstack'
import { Text } from '@/components/ui/text'
import { Box } from '@/components/ui/box'
import { ImageBackground } from '@/components/ui/image-background'

import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input'
import { Mic } from 'lucide-react-native'
import { ThemeContext } from '@/contexts/theme-context'

const CustomHeader = ({
  variant = 'general',
  title,
  label,
  description,
}: {
  variant: 'general' | 'search'
  title?: string
  label?: string
  description?: string
}) => {
  const { colorMode }: any = useContext(ThemeContext)
  return (
    <Box className="bg-background-0 rounded-b-3xl overflow-hidden mb-3">
      <ImageBackground
        source={
          colorMode === 'dark'
            ? require('@/assets/images/backgroundImageApp.jpg')
            : require('@/assets/images/backgroundImageApp.jpg')
        }
      >
        <HStack className="p-5 pt-24 gap-6 justify-between">
          <HStack className="justify-between">
            <VStack className="gap-0 justify-between">
              <Text className="text-white font-dm-sans-bold text-3xl">
                {title}
              </Text>
              <Text className="text-white font-dm-sans-medium text-sm">
                {description}
              </Text>
            </VStack>
          </HStack>
        </HStack>
        {variant === 'search' && (
          <Input
            variant="outline"
            className="border-0 bg-background-50 rounded-xl py-1 px-4 mt-2 mb-5 mx-5"
            size="lg"
          >
            <InputSlot>
              <InputIcon as={SearchIcon} className="text-outline-200" />
            </InputSlot>
            <InputField
              placeholder={label}
              className="placeholder:text-typography-200"
            />
            <InputSlot>
              <InputIcon as={Mic} className="text-outline-200" />
            </InputSlot>
          </Input>
        )}
      </ImageBackground>
    </Box>
  )
}

export default CustomHeader
