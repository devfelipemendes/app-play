# Documentação - Tela de Fatura

## 📋 Visão Geral

Foi implementada uma tela moderna de visualização de fatura em formato de **BottomSheet** para o app-play, seguindo os padrões de design e arquitetura do projeto. A funcionalidade permite visualizar detalhes completos de uma fatura e exportá-la para PDF ou abri-la na web.

## 🗂️ Estrutura de Arquivos Criados

### 1. **API Endpoint** - `src/api/endpoints/faturaApi.ts`
Endpoint RTK Query para buscar dados detalhados da fatura:

```typescript
// Request
interface GetFaturaRequest {
  payid: string
}

// Response
interface FaturaDetalhada {
  nome: string
  cpf: string
  nomeempresa: string
  parceiro: string
  cnpj: string
  email: string
  msisdn: string
  planid: number
  plandescription: string
  planvalue: string
  invoiceNumber: string
  value: number
  dueDate: string
  description: string
  customer: string
  status: string
  id: string
  codigoboleto: string
  barcode: string
  encodedimage: string
  payload: string
  logo: string
  contafatura: string | null
  revendedor: string | null
  link: string
  payment: string
  companyid: number
}
```

**Endpoint**: `POST /api/asaasfatura`

### 2. **Componente BottomSheet** - `src/components/screens/FaturaBottomSheet.tsx`
BottomSheet principal que exibe todos os detalhes da fatura:

**Recursos implementados**:
- ✅ Visualização completa dos dados da fatura
- ✅ Badge de status (Pago, Pendente, Vencido, Cancelado)
- ✅ Formatação de CPF, CNPJ, telefone e valores monetários
- ✅ Exibição do código de barras com opção de compartilhamento
- ✅ Botões de ação: "Abrir na Web" e "Exportar PDF"
- ✅ Design responsivo e moderno
- ✅ Integração com tema do WhiteLabel

**Seções da Fatura**:
1. **Dados do Cliente**: Nome, CPF, Telefone, Email
2. **Dados da Operadora**: Nome, CNPJ, Parceiro
3. **Detalhes da Fatura**: Número, Plano, Vencimento, Valores
4. **Código de Barras**: Com opção de compartilhar
5. **Descrição**: Informações adicionais

### 3. **Componente de Teste** - `src/components/screens/TesteFaturaButton.tsx`
Botão para testar a visualização da fatura durante o desenvolvimento:

**Funcionalidades**:
- Busca fatura com ID de teste (`pay_oen852i0nu920t7w`)
- Loading state durante a busca
- Tratamento de erros com Alert
- Abre o BottomSheet automaticamente ao receber os dados

## 🎯 Como Usar

### Modo de Teste (Desenvolvimento)

O botão de teste já está integrado na **tela de Settings** e só aparece em modo de desenvolvimento (`__DEV__`).

**Para visualizar**:
1. Abra o app em modo desenvolvimento
2. Navegue até a aba "Settings" (Configurações)
3. Role até a seção "Desenvolvimento"
4. Clique no botão "Visualizar Fatura (Teste)"

### Integração em Produção

Para usar a funcionalidade em outras partes do app:

```typescript
import { useState, useRef } from 'react'
import BottomSheet from '@gorhom/bottom-sheet'
import { useGetFaturaMutation } from '@/src/api/endpoints/faturaApi'
import { FaturaBottomSheet } from '@/src/components/screens/FaturaBottomSheet'

const SuaScreen = () => {
  const bottomSheetRef = useRef<BottomSheet>(null)
  const [getFatura, { data: fatura }] = useGetFaturaMutation()

  const handleAbrirFatura = async (paymentId: string) => {
    try {
      const result = await getFatura({ payid: paymentId }).unwrap()
      if (result) {
        bottomSheetRef.current?.expand()
      }
    } catch (error) {
      console.error('Erro ao buscar fatura:', error)
    }
  }

  const handleClose = () => {
    bottomSheetRef.current?.close()
  }

  return (
    <>
      {/* Seu conteúdo aqui */}
      <Button onPress={() => handleAbrirFatura('pay_xxx')}>
        Ver Fatura
      </Button>

      {/* BottomSheet */}
      <FaturaBottomSheet
        ref={bottomSheetRef}
        fatura={fatura || null}
        onClose={handleClose}
      />
    </>
  )
}
```

## 📤 Funcionalidades de Exportação

### 1. **Abrir na Web**
Abre a fatura em uma visualização web usando o link:
```
https://fatura.operadora.app.br/?payid={paymentId}
```

### 2. **Exportar PDF**
Duas opções implementadas:

**a) Se existe link direto (`fatura.link`)**:
- Abre o PDF diretamente no navegador/visualizador

**b) Se não existe link direto**:
- Baixa o PDF usando `expo-file-system`
- Compartilha usando `expo-sharing`
- Suporta iOS e Android

### 3. **Compartilhar Código de Barras**
- Compartilha o código de barras e nosso número via Share API nativa
- Facilita o pagamento manual

## 🎨 Personalização de Tema

O componente utiliza o **WhitelabelTheme** para cores e estilos:

```typescript
const { theme } = useWhitelabelTheme()

// Cores principais usadas
theme.colors.primary    // Cor principal do tenant
theme.colors.secondary  // Cor secundária
```

### Status da Fatura - Cores

| Status | Cor | Texto |
|--------|-----|-------|
| `RECEIVED_IN_CASH` | Verde (#10b981) | Pago |
| `PENDING` | Amarelo (#f59e0b) | Pendente |
| `OVERDUE` | Vermelho (#ef4444) | Vencido |
| `CANCELED` | Cinza (#6b7280) | Cancelado |

## 📱 Responsividade

O BottomSheet ocupa **85%** da altura da tela e possui:
- ScrollView para conteúdo longo
- Layout adaptável para diferentes tamanhos de tela
- Backdrop semi-transparente
- Gesto de arrastar para fechar

## 🔧 Dependências Utilizadas

```json
{
  "@gorhom/bottom-sheet": "^4.6.4",
  "expo-file-system": "latest",
  "expo-sharing": "latest",
  "@expo/vector-icons": "latest"
}
```

## 🛠️ Melhorias Futuras

Sugestões para próximas versões:

1. **Cache de Faturas**
   - Implementar cache local com AsyncStorage
   - Modo offline para visualização

2. **Histórico de Faturas**
   - Lista de todas as faturas do usuário
   - Filtros por status, data, valor

3. **Notificações**
   - Lembrete de vencimento
   - Confirmação de pagamento

4. **QR Code**
   - Gerar QR Code PIX para pagamento
   - Integração com Asaas

5. **Analytics**
   - Rastreamento de visualizações
   - Taxa de conversão de pagamentos

## 🐛 Tratamento de Erros

Erros são tratados em diferentes níveis:

1. **API Error**: Alert com mensagem de erro
2. **Network Error**: Mensagem genérica
3. **PDF Download Error**: Console.error + Toast (implementar)

## 📝 Notas Importantes

- O endpoint espera um `payid` válido (formato: `pay_xxxxxxxxxxxxx`)
- A URL da fatura web pode ser customizada por tenant
- O componente suporta temas claro/escuro automaticamente
- Todos os valores monetários são formatados em R$ (BRL)
- CPF, CNPJ e telefones são formatados automaticamente

## 🔗 Links Relacionados

- [Documentação Asaas API](https://docs.asaas.com/)
- [Gorhom Bottom Sheet](https://gorhom.dev/react-native-bottom-sheet/)
- [Expo File System](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [Expo Sharing](https://docs.expo.dev/versions/latest/sdk/sharing/)

---

**Desenvolvido para**: App WhiteLabel Multi-Tenant
**Versão**: 1.0.0
**Data**: Outubro 2024
