# 🧪 Guia de Testes para Assets WhiteLabel

Este guia mostra como validar se os assets (ícones e splash screens) dos parceiros estão configurados corretamente.

## 📋 Checklist Rápido

Antes de fazer build, valide:

- [ ] Arquivos de assets existem no diretório correto
- [ ] Dimensões das imagens estão corretas
- [ ] Cores configuradas no `app.config.json`
- [ ] `app.config.js` carrega os assets corretamente
- [ ] Teste local funcionando (Expo Go ou Dev Client)
- [ ] Preview build testado em dispositivo real

---

## 🔍 Método 1: Script de Validação Automática

**Mais rápido e recomendado!**

```bash
# Validar assets de um parceiro específico
node scripts/validate-assets.js 46

# O script verifica:
# ✓ Existência dos arquivos
# ✓ Dimensões das imagens
# ✓ Configuração do app.config.json
# ✓ Carregamento pelo app.config.js
```

### Saída Esperada

```
═══════════════════════════════════════════
  Validação de Assets - Tenant 46
═══════════════════════════════════════════

ℹ Procurando por partner-46-...
✓ Parceiro encontrado: partner-46-playmovel
   Caminho: /partners/partner-46-playmovel

═══════════════════════════════════════════
  1. Validando app.config.json
═══════════════════════════════════════════

✓ app.config.json válido
✓ Splash backgroundColor: #000624
✓ Android adaptiveIcon backgroundColor: #000624
✓ iOS icon backgroundColor: #000624

═══════════════════════════════════════════
  2. Validando Existência dos Assets
═══════════════════════════════════════════

✓ Diretório /assets encontrado

✓ Icon Principal encontrado
✓ Adaptive Icon (Android) encontrado
✓ Splash Screen encontrado
✓ Favicon (Web) encontrado

═══════════════════════════════════════════
  3. Validando Dimensões das Imagens
═══════════════════════════════════════════

icon.png:
ℹ Dimensões: 1024x1024px
✓ Dimensões corretas (1024x1024px)

adaptive-icon.png:
ℹ Dimensões: 1024x1024px
✓ Dimensões corretas (1024x1024px)

splash-icon.png:
ℹ Dimensões: 1242x2436px
✓ Dimensões adequadas (mínimo recomendado: 1242x2436px)

favicon.png:
ℹ Dimensões: 48x48px
✓ Dimensões corretas (48x48px)

📊 Tamanho dos Arquivos:
ℹ icon.png: 21.86 KB
ℹ adaptive-icon.png: 17.14 KB
ℹ splash-icon.png: 17.14 KB
ℹ favicon.png: 1.43 KB

═══════════════════════════════════════════
  4. Testando app.config.js
═══════════════════════════════════════════

✓ app.config.js carregou configuração com sucesso
ℹ Nome do app: Play Móvel
ℹ Slug: playmovel
ℹ Bundle ID (iOS): com.playmovel.app
ℹ Package (Android): com.playmovel.app
ℹ Icon path: partners/partner-46-playmovel/assets/icon.png
ℹ Splash path: partners/partner-46-playmovel/assets/splash-icon.png

═══════════════════════════════════════════
  Resultado da Validação
═══════════════════════════════════════════

✓ ✨ Todos os assets estão corretos!
✓ Pronto para build!

ℹ Próximos passos:
ℹ   1. Testar localmente: TENANT_ID=46 npx expo start
ℹ   2. Build preview: node scripts/build-partner.js 46 --platform=android --profile=preview
```

---

## 🖥️ Método 2: Teste Local com Expo

### 2.1 Testar no Expo Go (Limitado)

```bash
# Iniciar com o tenant específico
TENANT_ID=46 npx expo start

# Ou no Windows (PowerShell)
$env:TENANT_ID="46"; npx expo start

# Ou no Windows (CMD)
set TENANT_ID=46 && npx expo start
```

**⚠️ Limitações do Expo Go:**
- Não mostra o ícone real do app
- Splash screen pode não aparecer corretamente
- Útil apenas para validar tema/cores

### 2.2 Testar com Development Build (Recomendado)

```bash
# 1. Criar development build
TENANT_ID=46 eas build --profile development --platform android

# 2. Instalar no dispositivo
# (baixe o APK/IPA do link fornecido)

# 3. Rodar o app
TENANT_ID=46 npx expo start --dev-client
```

**✅ Vantagens:**
- Mostra ícone e splash screen reais
- Comportamento idêntico ao build de produção
- Suporta native modules

---

## 📱 Método 3: Preview Build (Mais Próximo da Produção)

**Melhor forma de validar antes de lançar!**

```bash
# Android (APK)
node scripts/build-partner.js 46 --platform=android --profile=preview

# iOS (Simulator)
node scripts/build-partner.js 46 --platform=ios --profile=preview

# Ambas plataformas
node scripts/build-partner.js 46 --platform=all --profile=preview
```

### O que validar no Preview Build

1. **Ícone do App**
   - [ ] Aparece na lista de apps
   - [ ] Não está borrado ou pixelizado
   - [ ] Cores corretas
   - [ ] No Android, testar diferentes launchers (Samsung, Xiaomi, etc.)

2. **Splash Screen**
   - [ ] Aparece ao abrir o app
   - [ ] Cor de fundo correta
   - [ ] Imagem centralizada/ajustada
   - [ ] Não há "flash" de cor branca
   - [ ] Transição suave para a tela principal

3. **Informações do App**
   - [ ] Nome correto nas configurações
   - [ ] Bundle ID/Package correto
   - [ ] Versão correta

---

## 🔧 Método 4: Validação Manual de Arquivos

### Verificar estrutura de diretórios

```bash
# Listar arquivos do parceiro
ls -la partners/partner-46-playmovel/

# Deve mostrar:
# ├── assets/
# ├── app.config.json
# ├── env.json
# ├── theme.json
# └── README.md

# Listar assets
ls -la partners/partner-46-playmovel/assets/

# Deve mostrar:
# ├── icon.png
# ├── adaptive-icon.png
# ├── splash-icon.png
# └── favicon.png
```

### Validar dimensões das imagens

#### No Linux/Mac

```bash
# Usando imagemagick
identify partners/partner-46-playmovel/assets/icon.png
# Deve mostrar: icon.png PNG 1024x1024 ...

# Usando file
file partners/partner-46-playmovel/assets/icon.png
```

#### No Windows (PowerShell)

```powershell
# Usar Get-ImageInfo (requer PowerShell 5+)
Get-ChildItem "partners\partner-46-playmovel\assets\*.png" | ForEach-Object {
    $img = New-Object System.Drawing.Bitmap($_.FullName)
    [PSCustomObject]@{
        Name = $_.Name
        Width = $img.Width
        Height = $img.Height
        Size = "{0:N2} KB" -f ($_.Length / 1KB)
    }
    $img.Dispose()
}
```

### Validar app.config.json

```bash
# Verificar sintaxe JSON
node -e "console.log(JSON.parse(require('fs').readFileSync('partners/partner-46-playmovel/app.config.json')))"

# Ou usar jq (Linux/Mac)
jq . partners/partner-46-playmovel/app.config.json

# Ver campos importantes
jq '.ios.bundleIdentifier, .android.package' partners/partner-46-playmovel/app.config.json
```

---

## 🎯 Método 5: Teste de Configuração do app.config.js

```bash
# Testar se o app.config.js carrega corretamente
TENANT_ID=46 node -e "
const getConfig = require('./app.config.js');
const config = getConfig({ config: { expo: {} } });
console.log('Nome:', config.expo.name);
console.log('Icon:', config.expo.icon);
console.log('Splash:', config.expo.splash.image);
console.log('Bundle ID:', config.expo.ios.bundleIdentifier);
console.log('Package:', config.expo.android.package);
"
```

**Saída esperada:**

```
🏢 Building for Tenant ID: 46
✅ Loaded config for: Play Móvel
Nome: Play Móvel
Icon: partners/partner-46-playmovel/assets/icon.png
Splash: partners/partner-46-playmovel/assets/splash-icon.png
Bundle ID: com.playmovel.app
Package: com.playmovel.app
```

---

## 🚨 Problemas Comuns e Soluções

### ❌ Erro: "Asset não encontrado"

**Causa:** Caminho do arquivo incorreto ou arquivo não existe

**Solução:**

```bash
# 1. Verificar se arquivo existe
ls partners/partner-46-playmovel/assets/icon.png

# 2. Verificar permissões
chmod 644 partners/partner-46-playmovel/assets/*.png

# 3. Recriar o arquivo se necessário
```

### ❌ Splash screen com fundo branco

**Causa:** `backgroundColor` não configurado

**Solução:**

```json
// partners/partner-46-playmovel/app.config.json
{
  "splash": {
    "backgroundColor": "#000624",  // ← Adicionar esta linha
    "resizeMode": "contain"
  }
}
```

### ❌ Ícone cortado no Android

**Causa:** Adaptive icon sem safe zone

**Solução:**
- Certifique-se de que elementos importantes estão na área central (66%)
- Use `backgroundColor` que combina com o fundo do ícone
- Teste em diferentes launchers

### ❌ Dimensões incorretas

**Causa:** Imagem exportada com dimensões erradas

**Solução:**

```bash
# Redimensionar com ImageMagick
convert icon-original.png -resize 1024x1024 partners/partner-46-playmovel/assets/icon.png

# Ou use ferramentas online:
# - https://www.resizeimage.net/
# - https://imageresizer.com/
```

### ❌ app.config.js não carrega a configuração

**Causa:** `TENANT_ID` não está definido ou configuração incorreta

**Solução:**

```bash
# 1. Verificar variável de ambiente
echo $TENANT_ID  # Linux/Mac
echo %TENANT_ID%  # Windows CMD
$env:TENANT_ID  # Windows PowerShell

# 2. Definir explicitamente
export TENANT_ID=46  # Linux/Mac
set TENANT_ID=46  # Windows CMD
$env:TENANT_ID="46"  # Windows PowerShell

# 3. Testar novamente
node scripts/validate-assets.js 46
```

---

## 📊 Matriz de Testes Completa

| Teste | Ferramenta | Tempo | Confiabilidade | Quando Usar |
|-------|-----------|-------|----------------|-------------|
| Script de validação | `validate-assets.js` | 5s | ⭐⭐⭐ | Sempre, antes de qualquer build |
| Expo Go | `expo start` | 30s | ⭐ | Teste rápido de funcionalidades |
| Dev Build | `eas build --profile development` | 10min | ⭐⭐⭐⭐ | Desenvolvimento ativo |
| Preview Build | `eas build --profile preview` | 10min | ⭐⭐⭐⭐⭐ | Antes de release |
| Production Build | `eas build --profile production` | 15min | ⭐⭐⭐⭐⭐ | Release final |

---

## 🎓 Workflow Recomendado

### Para Novo Parceiro

```bash
# 1. Criar estrutura
mkdir -p partners/partner-47-novooperador/assets

# 2. Copiar assets
# (adicionar icon.png, adaptive-icon.png, splash-icon.png, favicon.png)

# 3. Criar configurações
# (criar app.config.json, env.json, theme.json)

# 4. VALIDAR
node scripts/validate-assets.js 47

# 5. Testar localmente
TENANT_ID=47 npx expo start

# 6. Preview build
node scripts/build-partner.js 47 --platform=android --profile=preview

# 7. Testar em dispositivo real
# (instalar APK e validar ícone/splash)

# 8. Se tudo OK → Production build
node scripts/build-partner.js 47 --platform=all --profile=production
```

### Para Atualização de Assets

```bash
# 1. Atualizar arquivos
cp novo-icon.png partners/partner-46-playmovel/assets/icon.png

# 2. VALIDAR
node scripts/validate-assets.js 46

# 3. Preview build para testar
node scripts/build-partner.js 46 --profile=preview

# 4. Se OK → Production build
node scripts/build-partner.js 46 --profile=production
```

---

## 📝 Checklist Final Antes de Release

- [ ] `node scripts/validate-assets.js {TENANT_ID}` passou sem erros
- [ ] Preview build testado em dispositivo Android real
- [ ] Preview build testado em dispositivo iOS real (se aplicável)
- [ ] Ícone aparece corretamente nos launchers (Samsung, Xiaomi, Stock Android)
- [ ] Splash screen aparece sem flash branco
- [ ] Nome do app correto nas configurações
- [ ] Cores consistentes com a marca do parceiro
- [ ] Bundle ID/Package único e correto
- [ ] Versão incrementada corretamente

---

## 🔗 Recursos Adicionais

- [Expo App Icons](https://docs.expo.dev/develop/user-interface/app-icons/)
- [Expo Splash Screens](https://docs.expo.dev/develop/user-interface/splash-screen/)
- [Android Adaptive Icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Image Optimization Tools](https://tinypng.com/)

---

**💡 Dica:** Sempre rode `node scripts/validate-assets.js` antes de qualquer build. Isso economiza tempo e evita builds desperdiçados!
