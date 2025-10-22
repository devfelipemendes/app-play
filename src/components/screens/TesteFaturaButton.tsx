import React, { useRef, useState } from 'react'
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useGetFaturaMutation } from '@/src/api/endpoints/faturaApi'
import { FaturaBottomSheet } from './FaturaBottomSheet'
import { Ionicons } from '@expo/vector-icons'

export const TesteFaturaButton = () => {
  const { colors } = useCompanyThemeSimple()
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const [getFatura, { data: fatura, isLoading }] = useGetFaturaMutation()

  const handleOpenFatura = async () => {
    try {
      const result = await getFatura({ payid: 'pay_gx5308hqrmzk4lot' }).unwrap()
      if (result) {
        bottomSheetRef.current?.present()
      }
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error?.data?.message ||
          'Não foi possível carregar a fatura. Tente novamente.',
      )
    }
  }

  const handleClose = () => {
    bottomSheetRef.current?.dismiss()
  }

  return (
    <>
      <Pressable
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleOpenFatura}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <>
            <Ionicons name="document-text-outline" size={20} color="#ffffff" />
            <Text style={styles.buttonText}>Visualizar Fatura (Teste)</Text>
          </>
        )}
      </Pressable>

      <FaturaBottomSheet
        ref={bottomSheetRef}
        fatura={fatura || null}
        onClose={handleClose}
      />
    </>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
})
