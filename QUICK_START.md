# Guía Completa: Instalación y Prueba del Nodo OpenCode

## 📋 Tabla de Contenidos

1. [Resumen Rápido](#resumen-rápido)
2. [Despliegue en CasaOS](#despliegue-en-casaos)
3. [Verificación](#verificación)
4. [Pruebas](#pruebas)
5. [Migración del Workflow LinkedIn](#migración-del-workflow-linkedin)

---

## Resumen Rápido

**Estado del Proyecto:** ✅ Listo para producción

**Ubicación de Archivos Compilados:**
- Nodo: `/workspace/n8n-nodes-opencode/dist/nodes/OpenCode/`
- Credenciales: `/workspace/n8n-nodes-opencode/dist/credentials/`

**Tu n8n:** `http://192.168.0.177:5678`  
**Tu OpenCode:** `http://192.168.0.214:4096`

---

## Despliegue en CasaOS

### Método 1: SCP (Más rápido - Recomendado)

Ejecuta desde tu terminal local (o desde OpenCode):

```bash
# 1. Copiar archivos del nodo
scp -r /workspace/n8n-nodes-opencode/dist/nodes/OpenCode \
    root@192.168.0.177:/DATA/AppData/n8n/nodes/

# 2. Copiar credenciales
scp -r /workspace/n8n-nodes-opencode/dist/credentials \
    root@192.168.0.177:/DATA/AppData/n8n/

# 3. Reiniciar n8n
ssh root@192.168.0.177 'docker restart n8n'

# 4. Esperar a que inicie
sleep 30

# 5. Verificar logs
ssh root@192.168.0.177 'docker logs n8n | grep -i opencode'
```

### Método 2: Manual en CasaOS

1. **SSH a tu CasaOS:**
   ```bash
   ssh root@192.168.0.177
   ```

2. **Crear directorios:**
   ```bash
   mkdir -p /DATA/AppData/n8n/nodes/OpenCode
   mkdir -p /DATA/AppData/n8n/credentials
   ```

3. **Copiar archivos** (desde otra terminal):
   ```bash
   # Terminal 1: En OpenCode
   scp -r /workspace/n8n-nodes-opencode/dist/nodes/OpenCode/* \
       root@192.168.0.177:/DATA/AppData/n8n/nodes/OpenCode/
   
   scp -r /workspace/n8n-nodes-opencode/dist/credentials/* \
       root@192.168.0.177:/DATA/AppData/n8n/credentials/
   ```

4. **Reiniciar n8n:**
   ```bash
   # En SSH:
   docker restart n8n
   
   # O manualmente en CasaOS UI:
   # Services → n8n → Restart
   ```

### Método 3: Montar volumen (Mejor para desarrollo)

Edita tu `docker-compose.yml` en CasaOS y agrega:

```yaml
services:
  n8n:
    # ... existing config ...
    volumes:
      - /DATA/AppData/n8n:/home/node/.n8n
      # ADD THESE LINES:
      - /workspace/n8n-nodes-opencode/dist/nodes:/home/node/.n8n/nodes
      - /workspace/n8n-nodes-opencode/dist/credentials:/home/node/.n8n/credentials
```

Luego reinicia:
```bash
docker-compose up -d
```

---

## Verificación

### Paso 1: Verificar archivos en el servidor

```bash
# SSH a CasaOS
ssh root@192.168.0.177

# Listar archivos instalados
ls -la /DATA/AppData/n8n/nodes/OpenCode/
ls -la /DATA/AppData/n8n/credentials/

# Deberías ver:
# OpenCode.node.js
# OpenCodeDescription.js  
# OpenCodeApi.credentials.js
```

### Paso 2: Verificar logs de n8n

```bash
ssh root@192.168.0.177 'docker logs n8n 2>&1 | tail -50'

# Busca líneas como:
# - "Successfully loaded custom nodes"
# - Error messages if any
```

### Paso 3: Verificar en n8n UI

1. Abre: **http://192.168.0.177:5678**
2. Crea un **nuevo workflow**
3. Click en `+` para agregar nodo
4. Busca: **"opencode"**
5. Deberías ver: **"OpenCode"** bajo la sección "Transform"

Si no ves el nodo:
- Borra caché: Ctrl+Shift+Del
- Recarga: F5
- Reinicia n8n nuevamente

---

## Configuración de Credenciales

### Crear credenciales OpenCode

1. **En n8n UI** (http://192.168.0.177:5678)
2. **Top-right:** Click en icono de **engranaje** o tu usuario
3. **Selecciona:** "Credentials" (o busca en el menú)
4. **Click:** "Create new credential"
5. **Busca:** "OpenCode"
6. **Selecciona:** "OpenCode API"
7. **Completa:**
   - **Base URL:** `http://192.168.0.214:4096`
   - **Session Timeout (seconds):** `180`
8. **Click:** "Save"
9. **Asigna nombre:** e.g., "OpenCode-Dev" o "OpenCode-Prod"

Ahora tienes las credenciales listas para usar en workflows.

---

## Pruebas

### Test 1: Prueba Básica

**Objetivo:** Verificar que el nodo funciona

**Pasos:**

1. **Nuevo workflow** en n8n
2. **Agregar trigger:** 
   - Busca "Manual"
   - Selecciona "Manual Trigger"
3. **Conectar nodo OpenCode:**
   - Click en trigger
   - Click `+` para agregar nodo
   - Busca "opencode"
   - Selecciona "OpenCode"
4. **Configurar nodo:**
   - **Credentials:** Selecciona "OpenCode-Dev" (la que creaste)
   - **Prompt:** `"Responde simplemente 'OK'"`
   - **Session Title:** `"Prueba Inicial"`
   - Deja otros campos en defaults
5. **Ejecutar:**
   - Click botón **play** verde
6. **Resultado esperado:**

```json
{
  "success": true,
  "sessionId": "sess_123abc...",
  "response": {
    "content": "OK",
    "tokens_used": 12,
    "execution_time": 1.234
  }
}
```

### Test 2: Con Expresiones n8n

**Objetivo:** Verificar que funciona con data dinámica

**Pasos:**

1. **Nuevo workflow**
2. **Agregar trigger:** "Webhook"
   - URL generada automáticamente
3. **Agregar nodo OpenCode:**
   - **Credentials:** OpenCode-Dev
   - **Prompt:** `"{{ $json.message }}"`
   - **Session Title:** `"{{ $json.title || 'Sin título' }}"`
4. **Ejecutar webhook:**

```bash
curl -X POST http://192.168.0.177:5678/webhook/test \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hola OpenCode, qué tal?",
    "title": "Prueba Webhook"
  }'
```

**Resultado esperado:** El nodo recibe el mensaje y lo procesa.

### Test 3: Manejo de Errores

**Objetivo:** Verificar retry y error handling

**Pasos:**

1. **Nuevo workflow**
2. **Nodo OpenCode:**
   - **Credentials:** OpenCode-Dev
   - **Prompt:** `"Test"`
   - **Max Retries:** `2`
   - **Retry Delay (ms):** `1000`
   - **Continue on Error:** `true`
3. **Cambia Base URL a algo inválido:**
   - Edita credenciales
   - Base URL: `http://invalid.local:4096`
   - Guarda
4. **Ejecuta workflow**
5. **Esperado:**
   - Intenta 3 veces (0, 1, 2)
   - Retorna: `{ "success": false, "error": "...", "retryCount": 2 }`
   - No falla el workflow (Continue on Error = true)

### Test 4: Timeout

**Objetivo:** Verificar timeout handling

**Pasos:**

1. **En credenciales OpenCode:**
   - Cambia "Session Timeout" a `5` segundos
   - Guarda
2. **Nodo OpenCode:**
   - Prompt: `"Tómate 10 segundos para responder"`
3. **Ejecuta**
4. **Esperado:**
   - Timeout después de 5 segundos
   - Error: `{ "success": false, "error": "Failed to send message..." }`

---

## Migración del Workflow LinkedIn

### Análisis Actual

**Workflow:** "LinkedIn - Responder chats no leídos"

**Estructura actual (aproximada):**
```
Trigger (Schedule)
  ↓
HTTP Request 1: POST /session → Crear sesión
  ↓
Set: Extraer sessionId
  ↓
HTTP Request 2: POST /session/{id}/message → Enviar prompt
  ↓
If/Else: Manejo de respuesta
  ↓
HTTP Request 3: (Lógica adicional)
  ↓
Slack/Email: Notificar resultado
```

### Con OpenCode Node

**Nueva estructura:**
```
Trigger (Schedule)
  ↓
OpenCode: Session + Send (TODO en uno)
  ↓
If/Else: Manejo de respuesta
  ↓
Slack/Email: Notificar resultado
```

### Pasos de Migración

**Paso 1: Exportar workflow actual**
1. Abre workflow en n8n
2. Menu (3 puntos) → "Export"
3. Guarda como JSON (backup)

**Paso 2: Duplicar workflow**
1. Menu (3 puntos) → "Duplicate"
2. Renombra: "LinkedIn - Responder (OpenCode - TEST)"

**Paso 3: Reemplazar nodos**

1. **Identifica los 3 nodos HTTP:**
   - HTTP 1: `POST /session` → Crear sesión
   - HTTP 2: `POST /session/{id}/message` → Enviar mensaje
   - Otros HTTP nodes → Mantener si es necesario

2. **Elimina:**
   - HTTP 1 (crear sesión)
   - Set node (extracción de ID)
   - HTTP 2 (enviar mensaje)

3. **Agrega OpenCode nodo:**
   - Click entre Trigger e If
   - `+` → Busca "OpenCode"
   - Conecta desde Trigger
   - Configura:
     - **Credentials:** OpenCode-Dev
     - **Prompt:** (usa el valor que tenías en HTTP 2)
     - **Session Title:** (puedes usar nombre del contacto)
     - **Max Retries:** 3
     - **Wait for Response:** true

4. **Reemplaza referencias:**
   - En If/Else que checaba respuesta:
     - Antiguo: `steps.HTTP2.data.response.content`
     - Nuevo: `steps.OpenCode.data.response.content`
   - En otros nodos que usaban sessionId:
     - Antiguo: `steps.SetSessionId.data.sessionId`
     - Nuevo: `steps.OpenCode.data.sessionId`

**Paso 4: Prueba**
1. Ejecuta el workflow
2. Verifica en logs que OpenCode node se ejecuta
3. Compara resultado con version antigua
4. Si funciona → Actualiza workflow original
5. Si hay problemas → Revisa mapeos de variables

---

## Troubleshooting

### El nodo no aparece en n8n

**Solución:**
```bash
# 1. SSH a CasaOS
ssh root@192.168.0.177

# 2. Verifica archivos
ls -la /DATA/AppData/n8n/nodes/OpenCode/
ls -la /DATA/AppData/n8n/credentials/

# 3. Verifica logs
docker logs n8n | grep -i opencode

# 4. Reinicia
docker restart n8n

# 5. En n8n UI:
# - Borra caché: Ctrl+Shift+Del
# - Recarga: F5
```

### Error: "Cannot connect to OpenCode"

**Verifica:**
```bash
# 1. Desde OpenCode environment:
curl -X POST http://192.168.0.214:4096/session \
  -H "Content-Type: application/json" \
  -d '{"title": "test"}'

# 2. Desde CasaOS:
ssh root@192.168.0.177
curl -X POST http://192.168.0.214:4096/session \
  -H "Content-Type: application/json" \
  -d '{"title": "test"}'
```

Si ambos fallan → OpenCode está caído o URL es incorrecta

### Credenciales no se guardan

1. Verifica que `/DATA/AppData/n8n/credentials/` existe
2. Reinicia n8n
3. En credenciales, asegúrate de hacer click en "Save"

---

## ¡Éxito!

Una vez completados estos pasos, tendrás:

✅ Nodo OpenCode instalado en n8n  
✅ Credenciales configuradas  
✅ Pruebas básicas completadas  
✅ Workflow LinkedIn migrado (opcional pero recomendado)  
✅ Sistema más limpio y mantenible  

**Cualquier pregunta, revisa los documentos en `/workspace/n8n-nodes-opencode/`**

