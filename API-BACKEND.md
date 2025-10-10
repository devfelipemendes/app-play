# 📡 API Backend - Especificação Completa

## Visão Geral

Este documento especifica a estrutura completa que o backend PHP deve implementar para suportar o sistema WhiteLabel Multi-Tenant.

---

## 🔐 Autenticação

Todas as requisições devem incluir autenticação via Bearer Token:

```http
Authorization: Bearer {API_KEY}
Content-Type: application/json
```

---

## 📋 Endpoints

### 1. `GET /api/tenants` - Listar Todos os Tenants

Lista todos os tenants ativos no sistema.

**Request:**
```http
GET https://sistema.playmovel.com.br/api/tenants
Authorization: Bearer {API_KEY}
Content-Type: application/json
```

**Response (200 OK):**
```json
[
  {
    "id": 46,
    "name": "PLAY MÓVEL",
    "slug": "playmovel",
    "active": true,
    "appName": "Play Móvel",
    "apiUrl": "https://sistema.playmovel.com.br",
    "accessToken": "30684d5f2e7cfdd198e58f6a1efedf6f8da743c85ef0ef6558",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2025-01-06T12:00:00Z"
  },
  {
    "id": 47,
    "name": "Operadora XYZ",
    "slug": "operadoraxyz",
    "active": true,
    "appName": "XYZ Móvel",
    "apiUrl": "https://api.operadoraxyz.com.br",
    "accessToken": "abc123...",
    "createdAt": "2024-06-15T10:30:00Z",
    "updatedAt": "2025-01-05T08:15:00Z"
  }
]
```

**Campos:**
- `id` (number) - ID único do tenant
- `name` (string) - Nome da empresa
- `slug` (string) - Identificador em URL-friendly
- `active` (boolean) - Se o tenant está ativo
- `appName` (string) - Nome do aplicativo
- `apiUrl` (string) - URL base da API do tenant
- `accessToken` (string) - Token de acesso
- `createdAt` (string ISO 8601) - Data de criação
- `updatedAt` (string ISO 8601) - Última atualização

---

### 2. `GET /api/tenants/{id}` - Detalhes Completos do Tenant

Retorna todos os dados de configuração de um tenant específico.

**Request:**
```http
GET https://sistema.playmovel.com.br/api/tenants/46
Authorization: Bearer {API_KEY}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  // ========================================
  // INFORMAÇÕES BÁSICAS
  // ========================================
  "id": 46,
  "name": "PLAY MÓVEL",
  "slug": "playmovel",
  "active": true,
  "appName": "Play Móvel",
  "appVersion": "1.0.0",

  // ========================================
  // CONFIGURAÇÕES DE API
  // ========================================
  "apiUrl": "https://sistema.playmovel.com.br",
  "accessToken": "30684d5f2e7cfdd198e58f6a1efedf6f8da743c85ef0ef6558",

  // ========================================
  // EXPO CONFIGURATION
  // ========================================
  "expoOwner": "playmovel-org",
  "easProjectId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",

  // ========================================
  // TEMA E BRANDING (JSON ou String JSON)
  // ========================================
  "appTheme": {
    "darkLightMode": true,
    "colors": {
      "primary": "#007AFF",
      "secondary": "#5856D6",
      "accent": "#FF9500",
      "background": {
        "light": "#FFFFFF",
        "dark": "#000000"
      },
      "text": {
        "light": "#000000",
        "dark": "#FFFFFF"
      },
      "card": {
        "light": "#F2F2F7",
        "dark": "#1C1C1E"
      }
    },
    "fonts": {
      "regular": "dm-sans-regular",
      "medium": "dm-sans-medium",
      "bold": "dm-sans-bold"
    },
    "branding": {
      "companyName": "PLAY MÓVEL",
      "tagline": "Conecte-se com liberdade",
      "description": "A melhor operadora virtual do Brasil"
    }
  },

  // ========================================
  // CONFIGURAÇÕES iOS
  // ========================================
  "ios": {
    "bundleIdentifier": "com.playmovel.app",
    "buildNumber": "1",
    "supportsTablet": true,
    "infoPlist": {}
  },

  // ========================================
  // CONFIGURAÇÕES ANDROID
  // ========================================
  "android": {
    "packageName": "com.playmovel.app",
    "versionCode": 1,
    "permissions": [
      "ACCESS_FINE_LOCATION",
      "CAMERA",
      "READ_EXTERNAL_STORAGE"
    ]
  },

  // ========================================
  // ASSETS (URLs públicas no CDN)
  // ========================================
  "assets": {
    "icon": "https://cdn.playmovel.com.br/tenants/46/icon.png",
    "adaptiveIcon": "https://cdn.playmovel.com.br/tenants/46/adaptive-icon.png",
    "splash": "https://cdn.playmovel.com.br/tenants/46/splash.png",
    "favicon": "https://cdn.playmovel.com.br/tenants/46/favicon.png",
    "logo": "https://cdn.playmovel.com.br/tenants/46/logo.png"
  },

  // ========================================
  // INFORMAÇÕES DE CONTATO/SUPORTE
  // ========================================
  "supportEmail": "suporte@playmovel.com.br",
  "supportPhone": "+55 11 0000-0000",
  "websiteUrl": "https://playmovel.com.br",

  // ========================================
  // FEATURES HABILITADAS
  // ========================================
  "features": {
    "recharge": true,
    "portability": true,
    "support": true,
    "plans": true,
    "consumption": true,
    "wallet": false,
    "referral": false
  },

  // ========================================
  // CONFIGURAÇÕES EXTRAS (opcional)
  // ========================================
  "extraConfig": {
    "welcomeMessage": "Bem-vindo ao Play Móvel!",
    "termsUrl": "https://playmovel.com.br/termos",
    "privacyUrl": "https://playmovel.com.br/privacidade",
    "faqUrl": "https://playmovel.com.br/faq"
  },

  // ========================================
  // ANALYTICS E MONITORAMENTO
  // ========================================
  "enableAnalytics": false,
  "enableCrashReporting": false,
  "analyticsKeys": {
    "googleAnalytics": null,
    "firebase": null,
    "mixpanel": null
  },

  // ========================================
  // METADATA
  // ========================================
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2025-01-06T12:00:00Z",
  "createdBy": "admin",
  "status": "active"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Tenant not found",
  "code": "TENANT_NOT_FOUND"
}
```

---

## 📊 Especificação de Campos

### Campos Obrigatórios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | number | ID único do tenant |
| `name` | string | Nome da empresa |
| `slug` | string | Identificador URL-friendly (único) |
| `appTheme` | object/string | Tema do app (deve conter `colors.primary` e `colors.secondary`) |
| `ios.bundleIdentifier` | string | Bundle ID único para iOS |
| `android.packageName` | string | Package name único para Android |

### Campos Recomendados

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `apiUrl` | string | URL base da API do tenant |
| `accessToken` | string | Token de acesso à API |
| `assets.*` | object | URLs de todos os assets (icon, splash, etc.) |
| `features` | object | Features habilitadas no app |
| `supportEmail` | string | Email de suporte |
| `expoOwner` | string | Owner/org no Expo |

### Campos Opcionais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `easProjectId` | string | ID do projeto no EAS |
| `extraConfig` | object | Configurações extras personalizadas |
| `analyticsKeys` | object | Chaves de analytics |
| `enableAnalytics` | boolean | Ativar analytics |
| `enableCrashReporting` | boolean | Ativar crash reporting |

---

## 🎨 Campo `appTheme` - Estrutura Detalhada

O campo `appTheme` pode ser retornado como **objeto JSON** ou **string JSON** (será parseado pelo frontend).

### Formato Completo

```json
{
  "darkLightMode": true,
  "colors": {
    // OBRIGATÓRIOS
    "primary": "#007AFF",
    "secondary": "#5856D6",

    // OPCIONAIS
    "accent": "#FF9500",
    "background": {
      "light": "#FFFFFF",
      "dark": "#000000"
    },
    "text": {
      "light": "#000000",
      "dark": "#FFFFFF"
    },
    "card": {
      "light": "#F2F2F7",
      "dark": "#1C1C1E"
    },
    "error": "#FF3B30",
    "success": "#34C759",
    "warning": "#FF9500"
  },
  "fonts": {
    "regular": "dm-sans-regular",
    "medium": "dm-sans-medium",
    "bold": "dm-sans-bold"
  },
  "branding": {
    "companyName": "PLAY MÓVEL",
    "tagline": "Conecte-se com liberdade",
    "description": "A melhor operadora virtual do Brasil",
    "logo": "./assets/logo.png"
  }
}
```

### Variações Aceitas

**Opção 1: Objeto JSON (recomendado)**
```json
"appTheme": {
  "darkLightMode": true,
  "colors": {
    "primary": "#007AFF",
    "secondary": "#5856D6"
  }
}
```

**Opção 2: String JSON** (será parseada automaticamente)
```json
"appTheme": "{\"darkLightMode\":true,\"colors\":{\"primary\":\"#007AFF\",\"secondary\":\"#5856D6\"}}"
```

---

## 🖼️ Assets - URLs e Especificações

### URLs dos Assets

Todos os assets devem ser **URLs públicas completas** sem necessidade de autenticação:

```json
"assets": {
  "icon": "https://cdn.playmovel.com.br/tenants/46/icon.png",
  "adaptiveIcon": "https://cdn.playmovel.com.br/tenants/46/adaptive-icon.png",
  "splash": "https://cdn.playmovel.com.br/tenants/46/splash.png",
  "favicon": "https://cdn.playmovel.com.br/tenants/46/favicon.png",
  "logo": "https://cdn.playmovel.com.br/tenants/46/logo.png"
}
```

❌ **Formatos NÃO aceitos:**
```json
"icon": "/uploads/icon.png"           // Caminho relativo
"icon": "icon.png"                     // Sem domínio
"icon": "file:///path/to/icon.png"    // Caminho local
```

### Especificações dos Assets

| Asset | Dimensões | Formato | Observações |
|-------|-----------|---------|-------------|
| **icon** | 1024x1024px | PNG | Fundo transparente recomendado |
| **adaptiveIcon** | 1024x1024px | PNG | Foreground layer para Android |
| **splash** | 2048x2048px min | PNG | Imagem centralizada, fundo pode ser cor sólida |
| **favicon** | 256x256px+ | PNG/ICO | Para web |
| **logo** | Vetorial ou alta res | PNG/SVG | Logo da empresa para uso no app |

---

## 🗄️ Estrutura de Banco de Dados Sugerida (MySQL)

```sql
CREATE TABLE tenants (
    -- IDs e Básicos
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT 1,

    -- Aplicativo
    app_name VARCHAR(255) NOT NULL,
    app_version VARCHAR(20) DEFAULT '1.0.0',

    -- API Configuration
    api_url VARCHAR(500),
    access_token TEXT,

    -- Expo Configuration
    expo_owner VARCHAR(255),
    eas_project_id VARCHAR(255),

    -- Tema (JSON)
    app_theme JSON NOT NULL,

    -- iOS Configuration
    ios_bundle_id VARCHAR(255) UNIQUE NOT NULL,
    ios_build_number VARCHAR(20) DEFAULT '1',
    ios_supports_tablet BOOLEAN DEFAULT 1,

    -- Android Configuration
    android_package VARCHAR(255) UNIQUE NOT NULL,
    android_version_code INT DEFAULT 1,

    -- Assets (URLs públicas)
    asset_icon_url TEXT,
    asset_adaptive_icon_url TEXT,
    asset_splash_url TEXT,
    asset_favicon_url TEXT,
    asset_logo_url TEXT,

    -- Informações de Contato
    support_email VARCHAR(255),
    support_phone VARCHAR(50),
    website_url VARCHAR(500),

    -- Features (JSON)
    features JSON,

    -- Configurações Extras (JSON)
    extra_config JSON,

    -- Analytics
    enable_analytics BOOLEAN DEFAULT 0,
    enable_crash_reporting BOOLEAN DEFAULT 0,
    analytics_keys JSON,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',

    -- Índices
    INDEX idx_slug (slug),
    INDEX idx_active (active),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 💻 Exemplo de Implementação PHP

### Arquivo: `api/tenants.php`

```php
<?php
header('Content-Type: application/json');

// Autenticação
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$apiKey = $matches[1];
// Validar API key aqui...

// Conexão com banco
$db = new PDO('mysql:host=localhost;dbname=whitelabel', 'user', 'pass');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// ========================================
// GET /api/tenants - Listar todos
// ========================================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    $stmt = $db->query("
        SELECT
            id,
            name,
            slug,
            active,
            app_name as appName,
            api_url as apiUrl,
            access_token as accessToken,
            created_at as createdAt,
            updated_at as updatedAt
        FROM tenants
        WHERE active = 1
        ORDER BY name ASC
    ");

    $tenants = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Converter tipos
    foreach ($tenants as &$tenant) {
        $tenant['id'] = (int) $tenant['id'];
        $tenant['active'] = (bool) $tenant['active'];
    }

    echo json_encode($tenants, JSON_PRETTY_PRINT);
    exit;
}

// ========================================
// GET /api/tenants/{id} - Detalhes
// ========================================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = (int) $_GET['id'];

    $stmt = $db->prepare("SELECT * FROM tenants WHERE id = ?");
    $stmt->execute([$id]);
    $tenant = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$tenant) {
        http_response_code(404);
        echo json_encode([
            'error' => 'Tenant not found',
            'code' => 'TENANT_NOT_FOUND'
        ]);
        exit;
    }

    // Montar resposta completa
    $response = [
        // Básico
        'id' => (int) $tenant['id'],
        'name' => $tenant['name'],
        'slug' => $tenant['slug'],
        'active' => (bool) $tenant['active'],
        'appName' => $tenant['app_name'],
        'appVersion' => $tenant['app_version'] ?? '1.0.0',

        // API
        'apiUrl' => $tenant['api_url'],
        'accessToken' => $tenant['access_token'],

        // Expo
        'expoOwner' => $tenant['expo_owner'],
        'easProjectId' => $tenant['eas_project_id'],

        // Tema (parse JSON se string)
        'appTheme' => is_string($tenant['app_theme'])
            ? json_decode($tenant['app_theme'], true)
            : $tenant['app_theme'],

        // iOS
        'ios' => [
            'bundleIdentifier' => $tenant['ios_bundle_id'],
            'buildNumber' => $tenant['ios_build_number'] ?? '1',
            'supportsTablet' => (bool) ($tenant['ios_supports_tablet'] ?? true)
        ],

        // Android
        'android' => [
            'packageName' => $tenant['android_package'],
            'versionCode' => (int) ($tenant['android_version_code'] ?? 1),
            'permissions' => json_decode($tenant['android_permissions'] ?? '[]', true)
        ],

        // Assets
        'assets' => [
            'icon' => $tenant['asset_icon_url'],
            'adaptiveIcon' => $tenant['asset_adaptive_icon_url'],
            'splash' => $tenant['asset_splash_url'],
            'favicon' => $tenant['asset_favicon_url'],
            'logo' => $tenant['asset_logo_url']
        ],

        // Contato
        'supportEmail' => $tenant['support_email'],
        'supportPhone' => $tenant['support_phone'],
        'websiteUrl' => $tenant['website_url'],

        // Features
        'features' => json_decode($tenant['features'], true) ?? [
            'recharge' => true,
            'portability' => true,
            'support' => true,
            'plans' => true,
            'consumption' => true
        ],

        // Extras
        'extraConfig' => json_decode($tenant['extra_config'] ?? '{}', true),

        // Analytics
        'enableAnalytics' => (bool) ($tenant['enable_analytics'] ?? false),
        'enableCrashReporting' => (bool) ($tenant['enable_crash_reporting'] ?? false),
        'analyticsKeys' => json_decode($tenant['analytics_keys'] ?? '{}', true),

        // Metadata
        'createdAt' => $tenant['created_at'],
        'updatedAt' => $tenant['updated_at'],
        'createdBy' => $tenant['created_by'],
        'status' => $tenant['status']
    ];

    // Remover campos null
    $response = array_filter($response, function($value) {
        return $value !== null;
    });

    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// Método não suportado
http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
```

---

## 🧪 Exemplo de Inserção de Dados

```sql
INSERT INTO tenants (
    name,
    slug,
    app_name,
    app_version,
    api_url,
    access_token,
    expo_owner,
    app_theme,
    ios_bundle_id,
    android_package,
    asset_icon_url,
    asset_adaptive_icon_url,
    asset_splash_url,
    asset_favicon_url,
    asset_logo_url,
    support_email,
    support_phone,
    website_url,
    features
) VALUES (
    'PLAY MÓVEL',
    'playmovel',
    'Play Móvel',
    '1.0.0',
    'https://sistema.playmovel.com.br',
    '30684d5f2e7cfdd198e58f6a1efedf6f8da743c85ef0ef6558',
    'playmovel-org',
    JSON_OBJECT(
        'darkLightMode', true,
        'colors', JSON_OBJECT(
            'primary', '#007AFF',
            'secondary', '#5856D6',
            'accent', '#FF9500'
        ),
        'branding', JSON_OBJECT(
            'companyName', 'PLAY MÓVEL',
            'tagline', 'Conecte-se com liberdade'
        )
    ),
    'com.playmovel.app',
    'com.playmovel.app',
    'https://cdn.playmovel.com.br/tenants/46/icon.png',
    'https://cdn.playmovel.com.br/tenants/46/adaptive-icon.png',
    'https://cdn.playmovel.com.br/tenants/46/splash.png',
    'https://cdn.playmovel.com.br/tenants/46/favicon.png',
    'https://cdn.playmovel.com.br/tenants/46/logo.png',
    'suporte@playmovel.com.br',
    '+55 11 0000-0000',
    'https://playmovel.com.br',
    JSON_OBJECT(
        'recharge', true,
        'portability', true,
        'support', true,
        'plans', true,
        'consumption', true
    )
);
```

---

## ✅ Validação Automática

O script `sync-configs.js` valida automaticamente:

- ✅ Campos obrigatórios presentes (`id`, `name`, `slug`, `appTheme`)
- ✅ `appTheme` contém `colors.primary` e `colors.secondary`
- ✅ URLs de assets são válidas (protocolo HTTP/HTTPS)
- ✅ JSONs são parseáveis
- ✅ Bundle IDs e Package Names estão presentes

Se alguma validação falhar, o sync aborta com mensagem de erro detalhada.

---

## 🧪 Testando a API

### cURL - Listar Tenants
```bash
curl -X GET \
  https://sistema.playmovel.com.br/api/tenants \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### cURL - Detalhes do Tenant
```bash
curl -X GET \
  https://sistema.playmovel.com.br/api/tenants/46 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### JavaScript - Teste no Frontend
```javascript
const response = await fetch('https://sistema.playmovel.com.br/api/tenants/46', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const tenant = await response.json();
console.log(tenant);
```

---

## 🚨 Tratamento de Erros

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "code": "INVALID_TOKEN"
}
```

### 404 Not Found
```json
{
  "error": "Tenant not found",
  "code": "TENANT_NOT_FOUND"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR",
  "message": "Database connection failed"
}
```

---

## 📝 Checklist de Implementação

- [ ] Criar tabela `tenants` no banco de dados
- [ ] Implementar endpoint `GET /api/tenants`
- [ ] Implementar endpoint `GET /api/tenants/{id}`
- [ ] Configurar autenticação Bearer Token
- [ ] Configurar CDN para servir assets
- [ ] Inserir dados de teste (tenant PLAY MÓVEL)
- [ ] Testar endpoints com cURL/Postman
- [ ] Validar formato JSON das respostas
- [ ] Configurar CORS se necessário
- [ ] Documentar API_KEY para uso no frontend

---

## 🔗 Integração com Frontend

Após implementar a API, configure no frontend:

### 1. Variáveis de Ambiente (GitHub Secrets)
```bash
BACKEND_URL=https://sistema.playmovel.com.br
BACKEND_API_KEY=your_api_key_here
```

### 2. Testar Sincronização
```bash
node scripts/sync-configs.js 46
```

### 3. Validar Resultado
```bash
./scripts/prepare-build.sh 46 --validate
```

---

**Última atualização**: 2025-01-06
