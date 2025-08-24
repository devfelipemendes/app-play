import React, { useState } from 'react'

import { ListFilter, Search } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Map from '@/components/screens/maps/current-location-map/index'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input'
import { Pressable } from '@/components/ui/pressable'
import { Icon } from '@/components/ui/icon'

const Maps = () => {
  const [value, setValue] = useState('')
  const insets = useSafeAreaInsets()

  return (
    <VStack className="flex-1 bg-background-0 relative">
      <HStack
        className="px-5 py-4 absolute z-10"
        space="sm"
        style={{ top: insets.top }}
      >
        <Input
          size={'xl'}
          className="flex-1 bg-background-50 rounded-lg border-0"
        >
          <InputField
            value={value}
            onChangeText={setValue}
            placeholder="Search a location"
            className="placeholder:text-typography-200"
          />
          <InputSlot className="pr-4">
            <InputIcon as={Search} className="text-outline-200" size="md" />
          </InputSlot>
        </Input>

        <Pressable className="bg-background-50 p-3 rounded-lg items-center justify-center">
          <Icon as={ListFilter} size="lg" className="text-outline-200" />
        </Pressable>
      </HStack>

      <Map />
    </VStack>
  )
}

export default Maps
