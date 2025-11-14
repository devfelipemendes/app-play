# Correção: Compatibilidade com 16 KB Page Size - Android

## 📋 Contexto do Problema

Você está recebendo este erro ao enviar seu app para a Google Play Store:

> **"Seu app não é compatível com tamanhos de página de 16 KB de memória"**

Este é um novo requisito do Google Play que **entra em vigor em 1º de novembro de 2025** para todos os apps que targetam Android 15+ (API 35+).

### Por que isso acontece?

Seu app atualmente usa:
- **Expo SDK 52.0.47** ❌ (incompatível)
- **React Native 0.76.9** ❌ (precisa de 0.77+ para suporte completo)
- **Target SDK 35** ✅ (Android 15)

O suporte completo a 16 KB page size foi adicionado apenas no **Expo SDK 53** com React Native 0.77+.

---

## ✅ Solução 1: Atualizar para Expo SDK 53+ (RECOMENDADO)

Esta é a **solução oficial e mais confiável** recomendada pela equipe do Expo.

### Passo a Passo

#### 1. Fazer Backup

```bash
# Commit todas as alterações atuais
git add .
git commit -m "backup antes de atualizar para SDK 53"
git push
```

#### 2. Atualizar Expo CLI (Opcional mas Recomendado)

```bash
npm install -g expo-cli@latest
```

#### 3. Atualizar SDK do Projeto

```bash
# Atualizar para o SDK mais recente
npx expo install expo@latest

# Atualizar TODAS as dependências para versões compatíveis
npx expo install --fix
```

O comando `expo install --fix` irá atualizar automaticamente:
- ✅ React Native para 0.77+
- ✅ Todas as bibliotecas Expo para versões compatíveis
- ✅ Bibliotecas nativas com suporte a 16 KB (expo-camera, expo-image, react-native-maps, etc.)

#### 4. Revisar Breaking Changes

Consulte o changelog oficial:
- [Expo SDK 53 Changelog](https://expo.dev/changelog/2025/01-14-sdk-53)

Principais mudanças:
- React Native 0.77 (pode ter breaking changes em componentes)
- Possíveis atualizações em APIs do Expo
- Verificar se há mudanças em bibliotecas de terceiros

#### 5. Testar Localmente

```bash
# Limpar cache do Metro
npm start -- --clear

# Testar em desenvolvimento
npm run android-teste
```

#### 6. Build de Produção

```bash
# Gerar AAB para Play Store
npm run android
```

#### 7. Verificar Compatibilidade (Linux/macOS)

Após o build, use o script de verificação:

```bash
bash scripts/check-16kb-compatibility.sh caminho/para/seu-app.aab
```

---

## ⚠️ Solução 2: Configuração Manual (NÃO RECOMENDADO)

Se você **não puder** atualizar para SDK 53 agora, já fiz uma configuração manual no `app.json`.

### O que foi alterado

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 35,
            "targetSdkVersion": 35,
            "buildToolsVersion": "35.0.0",
            "kotlinVersion": "1.9.25",
            "ndkVersion": "27.2.12479018",  // ← NDK 27 adicionado
            "packagingOptions": {
              "jniLibs": {
                "useLegacyPackaging": false  // ← Alinhamento correto
              }
            }
          }
        }
      ]
    ]
  }
}
```

### ⚠️ Limitações desta Abordagem

- **Não garante 100% de compatibilidade** porque:
  - React Native 0.76 pode ter bibliotecas nativas não compiladas com 16 KB
  - Bibliotecas Expo do SDK 52 podem estar incompatíveis
  - Bibliotecas de terceiros podem precisar de atualizações

- **Pode funcionar parcialmente**, mas você pode continuar recebendo o erro do Play Store

- **Não é suportado oficialmente** pelo Expo

### Como testar esta solução

1. Fazer um build de teste:
```bash
npm run android-teste
```

2. Enviar para o Play Store em track interna/fechada para validar

3. Se o erro persistir, você **precisará** atualizar para SDK 53

---

## 🔍 Como Verificar se Seu App Está Compatível

### Método 1: Google Play Console (Mais Fácil)

Após fazer upload do AAB, o Google Play Console irá validar automaticamente e avisar se houver problemas.

### Método 2: Script de Verificação (Linux/macOS)

```bash
bash scripts/check-16kb-compatibility.sh seu-app.aab
```

Este script verifica o alinhamento de todas as bibliotecas nativas (.so) e informa quais estão incompatíveis.

### Método 3: Ferramenta oficial do Android

```bash
# Baixar o script oficial
curl -o check_page_size.sh https://raw.githubusercontent.com/android/ndk-samples/main/scripts/check_page_size.sh

# Executar
bash check_page_size.sh seu-app.aab
```

---

## 📅 Prazos Importantes

| Data | Requisito |
|------|-----------|
| **31 de agosto de 2025** | Obrigatório targetar Android 15+ (API 35) |
| **1 de novembro de 2025** | Obrigatório suporte a 16 KB page size |
| **31 de maio de 2026** | Prazo estendido (se solicitar extensão) |

---

## 🆘 Troubleshooting

### "Ainda recebo erro após atualizar para SDK 53"

Possíveis causas:
1. **Bibliotecas de terceiros incompatíveis**: Verifique se todas as suas dependências estão atualizadas
   ```bash
   npm outdated
   ```

2. **Cache do build**: Limpe o cache do EAS Build
   ```bash
   eas build:clear-cache
   ```

3. **Bibliotecas nativas personalizadas**: Se você tem código nativo customizado, ele precisa ser recompilado com NDK 27+

### "Não consigo atualizar para SDK 53 agora"

Opções:
1. **Solicitar extensão de prazo** ao Google Play (até 31/05/2026)
2. **Downgrade do targetSdkVersion** para 34 temporariamente (não recomendado)
   - ⚠️ Isso limita funcionalidades do Android 15
   - ⚠️ Eventualmente será obrigatório usar API 35

3. Usar a configuração manual (Solução 2) e testar extensivamente

---

## 📚 Recursos Adicionais

- [Expo: Guia oficial sobre 16 KB](https://github.com/expo/fyi/blob/main/android-16kb-page-sizes.md)
- [Android Developers: Page Sizes](https://developer.android.com/guide/practices/page-sizes)
- [React Native 0.77 Release Notes](https://reactnative.dev/blog/2025/01/21/version-0.77)
- [Expo SDK 53 Changelog](https://expo.dev/changelog/2025/01-14-sdk-53)

---

## ✅ Checklist de Ação

Use esta checklist para acompanhar o processo:

- [ ] Fazer backup do projeto atual (`git commit + push`)
- [ ] Atualizar para Expo SDK 53 (`npx expo install expo@latest`)
- [ ] Atualizar dependências (`npx expo install --fix`)
- [ ] Revisar breaking changes do SDK 53
- [ ] Testar localmente (`npm start -- --clear`)
- [ ] Fazer build de teste (`npm run android-teste`)
- [ ] Verificar compatibilidade com script ou Play Console
- [ ] Fazer build de produção (`npm run android`)
- [ ] Enviar para Play Store em track interna para validação
- [ ] Se aprovado, promover para produção

---

## 💡 Recomendação Final

**Atualize para Expo SDK 53+**. Esta é a única solução garantida e suportada oficialmente. A configuração manual pode funcionar temporariamente, mas não é confiável a longo prazo.

Se tiver dúvidas ou problemas durante a atualização, consulte:
- [Expo Discord](https://chat.expo.dev/)
- [Expo Forums](https://forums.expo.dev/)
- [React Native Community](https://reactnative.dev/help)
