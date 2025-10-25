import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'

export default function Loading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#c3c3c3" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
})
