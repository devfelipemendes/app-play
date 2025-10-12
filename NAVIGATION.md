# Guia de Navegação em Pilha - App Play

## 📚 Visão Geral

O aplicativo agora utiliza **navegação em pilha (Stack Navigation)** em toda a estrutura, proporcionando transições suaves e gestos de navegação nativos.

## 🏗️ Estrutura de Navegação

### Hierarquia de Stacks

```
app/_layout.tsx (Root Stack)
├── index (Splash)
├── (auth) Stack
│   ├── loading
│   └── entrar
└── (tabs) Stack
    ├── (home) Stack
    │   ├── index
    │   ├── days
    │   └── monthly
    ├── plans
    ├── location
    ├── maps
    └── settings
```

## 🎨 Configurações de Animação

### Root Layout (`app/_layout.tsx`)
- **Animação**: `slide_from_right` (padrão iOS)
- **Duração**: 300ms
- **Gestos**: Habilitados (deslizar da borda para voltar)
- **Direção**: Horizontal

```typescript
<Stack
  screenOptions={{
    headerShown: false,
    animation: 'slide_from_right',
    animationDuration: 300,
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    fullScreenGestureEnabled: true,
  }}
>
```

### Auth Layout (`app/(auth)/_layout.tsx`)
- **Animação padrão**: `fade`
- **Tela de loading**: Transição com fade
- **Tela de login**: `slide_from_bottom`
- **Gestos**: Desabilitados (evita navegação acidental)

```typescript
<Stack
  screenOptions={{
    headerShown: false,
    animation: 'fade',
    animationDuration: 250,
    gestureEnabled: false,
  }}
>
  <Stack.Screen name="loading" options={{ animation: 'fade' }} />
  <Stack.Screen
    name="entrar"
    options={{
      animation: 'slide_from_bottom',
      gestureEnabled: false
    }}
  />
</Stack>
```

### Tabs Layout (`app/(tabs)/_layout.tsx`)
- **Stack Navigator** com Bottom Tab Bar customizada
- **Animação**: `slide_from_right`
- **Duração**: 300ms
- **Bottom Bar**: Posicionada absolutamente sobre o Stack

## 🚀 Como Usar

### Navegação Básica

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// Navegar para uma nova tela (push na pilha)
router.push('/(tabs)/plans');

// Substituir a tela atual (replace)
router.replace('/(tabs)/(home)');

// Voltar na pilha
router.back();

// Voltar para a tela inicial (limpa a pilha)
router.replace('/(tabs)/(home)');
```

### Navegação Imperativa com Parâmetros

```typescript
// Com parâmetros
router.push({
  pathname: '/(tabs)/plans',
  params: { id: '123', name: 'Plan Premium' }
});

// Receber parâmetros
import { useLocalSearchParams } from 'expo-router';

const params = useLocalSearchParams();
console.log(params.id); // '123'
```

### Navegação com Gesto de Voltar

O gesto de voltar (swipe from edge) está habilitado por padrão:
- **iOS**: Deslizar da borda esquerda
- **Android**: Botão de voltar nativo

Para desabilitar em uma tela específica:

```typescript
<Stack.Screen
  name="minha-tela"
  options={{ gestureEnabled: false }}
/>
```

## 🎯 Tipos de Animação Disponíveis

### Expo Router Stack Animations

- `default` - Animação padrão da plataforma
- `fade` - Fade in/out
- `fade_from_bottom` - Fade + slide do fundo
- `flip` - Efeito de flip 3D
- `simple_push` - Push simples sem animação de fade
- `slide_from_bottom` - Desliza de baixo (modal)
- `slide_from_right` - Desliza da direita (iOS padrão)
- `slide_from_left` - Desliza da esquerda
- `none` - Sem animação

### Exemplo de Customização

```typescript
<Stack.Screen
  name="modal-screen"
  options={{
    animation: 'slide_from_bottom',
    presentation: 'modal',
    gestureEnabled: true,
    gestureDirection: 'vertical'
  }}
/>
```

## 📱 Bottom Tab Bar

A Bottom Tab Bar foi adaptada para funcionar com Stack Navigation:

### Características
- Posicionada **absolutamente** sobre o Stack
- Detecta rota ativa via `usePathname()`
- Navega usando `router.push()`
- Animação de underline suave
- Safe area insets para iOS

### Como Funciona

```typescript
// No TabLayout
<View style={styles.container}>
  <Stack>{/* Rotas */}</Stack>

  <View style={styles.tabBarContainer}>
    <BottomTabBar />
  </View>
</View>
```

```typescript
// No BottomTabBar
const router = useRouter();
const pathname = usePathname();

// Detectar rota ativa
const getCurrentRoute = () => {
  if (pathname.includes('(home)')) return '(home)';
  if (pathname.includes('plans')) return 'plans';
  // ...
};

// Navegar
<Pressable onPress={() => router.push(`/(tabs)/${item.path}`)}>
```

## 🔧 Troubleshooting

### Problema: Gestos não funcionam
**Solução**: Verifique se `gestureEnabled: true` está configurado

### Problema: Animação travando
**Solução**: Reduza `animationDuration` ou use `animation: 'simple_push'`

### Problema: Bottom bar sobrepondo conteúdo
**Solução**: Adicione padding bottom no conteúdo das telas

```typescript
<ScrollView contentContainerClassName="pb-24">
  {/* Conteúdo */}
</ScrollView>
```

### Problema: Rota não sendo detectada na Bottom Bar
**Solução**: Verifique se o `pathname` está sendo corretamente parseado em `getCurrentRoute()`

## 🎨 Best Practices

1. **Use `router.replace()` para fluxos de autenticação**
   - Evita que o usuário volte para tela de login após autenticar

2. **Use `animation: 'slide_from_bottom'` para modais**
   - Indica visualmente que é uma ação temporária

3. **Desabilite gestos em telas críticas**
   - Exemplos: checkout, confirmação de pagamento

4. **Mantenha animações consistentes**
   - Use o mesmo tipo de animação em contextos similares

5. **Teste em ambas plataformas**
   - Comportamento de gestos pode variar entre iOS e Android

## 📚 Referências

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Stack Navigator Options](https://docs.expo.dev/router/advanced/stack/)
- [Navigation Patterns](https://docs.expo.dev/guides/routing-and-navigation/)

## 🆕 Próximos Passos

- [ ] Implementar deep linking
- [ ] Adicionar animações customizadas
- [ ] Melhorar transições entre tabs
- [ ] Adicionar loading states nas navegações
- [ ] Implementar navegação com histórico persistente
