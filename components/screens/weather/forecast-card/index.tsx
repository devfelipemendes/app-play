import React from 'react'
import { Box } from '@/components/ui/box'
import { VStack } from '@/components/ui/vstack'
import { Text } from '@/components/ui/text'
import { Image } from '@/components/ui/image'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'

interface IForeCastCard {
  time: string
  imgUrl: any
  temperature: number | string
}

const ForeCastCard = ({ time, imgUrl, temperature }: IForeCastCard) => {
  const { colors } = useCompanyThemeSimple()
  return (
    <VStack className="gap-1.5 items-center">
      <Text
        size="sm"
        style={{ color: colors.secondary, fontFamily: 'font-dm-sans-regular' }}
      >
        {time}
      </Text>
      <Box className="h-8 w-6">
        <Image
          source={imgUrl}
          alt="image"
          className="h-full w-full"
          contentFit="contain"
        />
      </Box>
      <Text
        style={{
          color: colors.secondary,
          fontFamily: 'font-dm-sans-regular',
          fontSize: 12,
        }}
      >
        {temperature}
      </Text>
    </VStack>
  )
}

export default ForeCastCard
