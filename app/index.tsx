import { View, Text, StyleSheet } from 'react-native'
import { useAppSelector } from '../src/hooks/useAppSelector'

export default function Page() {
  const theme = useAppSelector((state) => state.theme)

  return (
    <View style={[styles.container, { backgroundColor: theme.primary_color }]}>
      <Text style={styles.title}>App Funcionando com Redux!</Text>
      <Text style={styles.subtitle}>Brand: {theme.brand_name}</Text>
      <Text style={styles.subtitle}>Partner: {theme.partner_id}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
})
