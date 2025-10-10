# useRefresh Hook

Hook genérico e reutilizável para implementar **Pull-to-Refresh** (arrastar para baixo para atualizar) em qualquer tela do aplicativo.

## 📋 Propósito

- Evitar chamadas desnecessárias de API ao focar em uma tab
- Fornecer controle manual ao usuário para atualizar dados
- Reutilizar lógica de refresh em múltiplas telas
- Executar múltiplas ações de refresh simultaneamente

## 🚀 Instalação

O hook já está disponível em `@/hooks/useRefresh`.

## 💡 Como Usar

### Exemplo Básico com RTK Query

```tsx
import { useRefresh } from '@/hooks/useRefresh'
import { useGetDataQuery } from '@/src/api/endpoints/yourApi'
import { ScrollView, RefreshControl } from 'react-native'

const MyScreen = () => {
  const { data, refetch } = useGetDataQuery()

  // Passar a função refetch do RTK Query
  const { refreshing, onRefresh } = useRefresh([refetch])

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Seu conteúdo aqui */}
    </ScrollView>
  )
}
```

### Exemplo com Múltiplas Ações

```tsx
import { useRefresh } from '@/hooks/useRefresh'
import { useAppDispatch } from '@/src/store/hooks'
import { fetchUserData } from '@/src/store/slices/userSlice'
import { useGetDataQuery } from '@/src/api/endpoints/yourApi'

const MyScreen = () => {
  const dispatch = useAppDispatch()
  const { refetch } = useGetDataQuery()

  // Executar múltiplas ações ao fazer pull-to-refresh
  const { refreshing, onRefresh } = useRefresh([
    async () => await refetch(),
    async () => await dispatch(fetchUserData()).unwrap(),
  ])

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Seu conteúdo aqui */}
    </ScrollView>
  )
}
```

### Exemplo com Redux Thunk

```tsx
import { useRefresh } from '@/hooks/useRefresh'
import { useAppDispatch } from '@/src/store/hooks'
import { fetchLineData } from '@/src/store/slices/det2Slice'

const MyScreen = () => {
  const dispatch = useAppDispatch()
  const selectedLine = useAppSelector(selectSelectedLine)

  const { refreshing, onRefresh } = useRefresh([
    async () => {
      if (selectedLine) {
        await dispatch(fetchLineData(selectedLine)).unwrap()
      }
    },
  ])

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Seu conteúdo aqui */}
    </ScrollView>
  )
}
```

### Exemplo com FlatList

```tsx
import { useRefresh } from '@/hooks/useRefresh'
import { FlatList, RefreshControl } from 'react-native'

const MyListScreen = () => {
  const { data, refetch } = useGetListQuery()
  const { refreshing, onRefresh } = useRefresh([refetch])

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <ItemCard item={item} />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  )
}
```

### Exemplo com Animated ScrollView

```tsx
import Animated from 'react-native-reanimated'
import { RefreshControl } from 'react-native'

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)

const MyScreen = () => {
  const { refreshing, onRefresh } = useRefresh([refetch])

  return (
    <AnimatedScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Seu conteúdo aqui */}
    </AnimatedScrollView>
  )
}
```

## 📦 API

### `useRefresh(refreshFunctions)`

**Parâmetros:**
- `refreshFunctions`: `Array<() => Promise<any>>` - Array de funções assíncronas a serem executadas

**Retorna:**
```typescript
{
  refreshing: boolean,     // Estado de loading do refresh
  onRefresh: () => void    // Função para acionar o refresh
}
```

## ⚡ Comportamento

1. **Execução em paralelo**: Todas as funções são executadas simultaneamente com `Promise.all`
2. **Error handling**: Erros são logados no console mas não travam o app
3. **Estado de loading**: `refreshing` fica `true` enquanto as funções estão executando
4. **Performance**: Use `useCallback` internamente para evitar re-renders desnecessários

### Exemplo com Tabs Internas (via Context)

Quando você tem **múltiplas tabs dentro de uma tela** (como home, faturas, consumo), implemente o refresh via contexto:

**1. No Context (`weather-screen-context/index.tsx`):**
```tsx
const refreshCallbacks = useRef<{
  [key: number]: (() => Promise<void>) | null
}>({
  0: null, // Tab home
  1: null, // Tab faturas
  2: null, // Tab consumo
})

const registerRefreshCallback = (tabIndex: number, callback: () => Promise<void>) => {
  refreshCallbacks.current[tabIndex] = callback
}

const refreshCurrentTab = async () => {
  const callback = refreshCallbacks.current[selectedTabIndex]
  if (callback) {
    await callback()
  }
}
```

**2. No Layout (`_layout.tsx`):**
```tsx
const { refreshCurrentTab } = useContext(WeatherTabContext)
const { refreshing, onRefresh } = useRefresh([refreshCurrentTab])

<ScrollView
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
  <Slot />
</ScrollView>
```

**3. Em cada Tab (ex: `days.tsx` - tab faturas):**
```tsx
const { registerRefreshCallback } = useContext(WeatherTabContext)
const { refetch } = useListarFaturasQuery(...)

useEffect(() => {
  if (registerRefreshCallback) {
    const refreshFaturas = async () => {
      await refetch()
    }
    registerRefreshCallback(1, refreshFaturas) // Tab index 1
  }
}, [registerRefreshCallback, refetch])
```

**Vantagens:**
- ✅ Refresh específico por tab
- ✅ Não rechama endpoint ao trocar de tab
- ✅ Pull-to-refresh funciona em qualquer tab
- ✅ Um único ScrollView compartilhado

## 🎯 Casos de Uso

- ✅ Tela Home - Recarregar dados da linha selecionada (det2)
- ✅ Tela Faturas - Atualizar lista de faturas
- ✅ Tela Consumo - Recarregar dados de consumo
- ✅ Tela Settings - Atualizar informações do usuário
- ✅ Qualquer lista que precise de atualização manual
- ✅ **Tabs internas** - Via contexto compartilhado (ver exemplo acima)

## 🔧 Customização do RefreshControl

Você pode personalizar cores e estilo do RefreshControl:

```tsx
<RefreshControl
  refreshing={refreshing}
  onRefresh={onRefresh}
  colors={['#FF6B00']}           // Android - cores do spinner
  tintColor="#FF6B00"            // iOS - cor do spinner
  title="Atualizando..."         // iOS - texto abaixo do spinner
  titleColor="#666"              // iOS - cor do texto
/>
```

## ⚠️ Importante

1. **Sempre use com ScrollView ou FlatList**: O RefreshControl só funciona dentro de componentes scrolláveis
2. **Funções assíncronas**: Todas as funções devem retornar Promises
3. **Dependências**: Se suas funções dependem de props/state, considere usar `useMemo` para o array:

```tsx
const refreshFunctions = useMemo(
  () => [
    async () => await fetchData(userId),
    async () => await refetch(),
  ],
  [userId], // Recria o array quando userId mudar
)

const { refreshing, onRefresh } = useRefresh(refreshFunctions)
```

## 🐛 Troubleshooting

**Problema**: Pull-to-refresh não aparece
- ✅ Verifique se está usando ScrollView ou FlatList
- ✅ Certifique-se de que o conteúdo é scrollável (altura > viewport)

**Problema**: Funções não são executadas
- ✅ Verifique se as funções são assíncronas (`async`)
- ✅ Confira os logs no console para erros

**Problema**: Loading não aparece
- ✅ Certifique-se de que está passando `refreshing` e `onRefresh` corretamente
- ✅ Verifique se as Promises estão sendo resolvidas

## 📚 Recursos

- [React Native RefreshControl Docs](https://reactnative.dev/docs/refreshcontrol)
- [RTK Query - Refetching](https://redux-toolkit.js.org/rtk-query/usage/queries#refetching)
