# Guía de Instalación del Nodo OpenCode en n8n (CasaOS)

## Resumen Rápido

El nodo OpenCode está compilado y listo en `/workspace/n8n-nodes-opencode/dist/`. Necesitas:

1. Copiar los archivos compilados a tu servidor CasaOS
2. Reiniciar el contenedor n8n
3. Configurar las credenciales en n8n UI

---

## Opción 1: SSH desde este ambiente (Recomendado)

Si tienes SSH acceso a tu servidor CasaOS:

```bash
# 1. Conectar por SSH (reemplaza con tu IP/hostname)
ssh root@192.168.0.177

# 2. Una vez conectado, crear directorio para el nodo
mkdir -p /DATA/AppData/n8n/nodes/OpenCode
mkdir -p /DATA/AppData/n8n/credentials

# 3. Copiar archivos (necesitarás SCP desde tu máquina)
# Desde OpenCode:
scp -r /workspace/n8n-nodes-opencode/dist/nodes/OpenCode/* root@192.168.0.177:/DATA/AppData/n8n/nodes/OpenCode/
scp -r /workspace/n8n-nodes-opencode/dist/credentials/* root@192.168.0.177:/DATA/AppData/n8n/credentials/

# 4. Reiniciar n8n desde CasaOS UI o:
ssh root@192.168.0.177 'docker restart n8n'
```

---

## Opción 2: Copiar archivos manualmente en CasaOS UI

1. **En tu servidor CasaOS, abre File Manager:**
   - Navega a: `/DATA/AppData/n8n/`

2. **Crea carpetas si no existen:**
   - `nodes/OpenCode/`
   - `credentials/`

3. **Descarga los archivos compilados desde GitHub** (si tienes acceso):
   - Node: `https://github.com/your-repo/n8n-nodes-opencode/dist/nodes/OpenCode/`
   - Credentials: `https://github.com/your-repo/n8n-nodes-opencode/dist/credentials/`

4. **Extrae y copia** los archivos `.js` a las carpetas correspondientes

5. **Reinicia n8n:**
   - CasaOS UI → Services → n8n → Restart

---

## Opción 3: Montar volumen en docker-compose (Mejor para desarrollo)

Modifica tu `docker-compose.yml` de n8n:

```yaml
services:
  n8n:
    # ... configuración existente ...
    volumes:
      - /DATA/AppData/n8n:/home/node/.n8n
      # AGREGAR ESTAS LÍNEAS:
      - /workspace/n8n-nodes-opencode/dist/nodes:/home/node/.n8n/nodes
      - /workspace/n8n-nodes-opencode/dist/credentials:/home/node/.n8n/credentials
```

---

## Verificar que el nodo está instalado

1. **Abre n8n:** http://192.168.0.177:5678

2. **En un workflow, busca "OpenCode":**
   - Click en `+` para agregar nodo
   - Buscador: escribe "opencode"
   - Deberías ver: "OpenCode" en la sección "Transform"

3. **Si no aparece:**
   ```bash
   # Verifica logs del contenedor
   docker logs n8n | grep -i opencode
   
   # O reinicia nuevamente
   docker restart n8n
   ```

---

## Configurar Credenciales

1. **En n8n UI, top-right:**
   - Click en "Credentials" (icono de llave)

2. **Click en "Create new" → busca "OpenCode"**

3. **Configura:**
   - **Base URL:** `http://192.168.0.214:4096`
   - **Session Timeout:** `180` segundos

4. **Click "Save"**

---

## Probar el Nodo

### Test 1: Ejecución básica

1. **Crear workflow nuevo** en n8n
2. **Agregar trigger:** Manual
3. **Agregar nodo:** OpenCode
4. **Configurar:**
   - Credentials: (la que creaste)
   - Prompt: `"Responde 'OK'"`
   - Title: `"Test Inicial"`
5. **Execute** (Botón play)
6. **Resultado esperado:**
   ```json
   {
     "success": true,
     "sessionId": "sess_...",
     "response": {
       "content": "OK",
       "tokens_used": 15,
       "execution_time": 2.5
     }
   }
   ```

### Test 2: Con expresiones

1. **Agregar Webhook trigger** (para enviar data)
2. **OpenCode node con:**
   - Prompt: `"{{ $json.message }}"`
3. **Ejecutar:**
   ```bash
   curl -X POST http://192.168.0.177:5678/webhook/test \
     -H "Content-Type: application/json" \
     -d '{"message": "Hola OpenCode"}'
   ```

---

## Troubleshooting

### El nodo no aparece en n8n

**Problema:** Buscas "opencode" pero no ves el nodo

**Soluciones:**
1. Verifica que archivos están en: `/DATA/AppData/n8n/nodes/OpenCode/`
2. Reinicia n8n nuevamente: `docker restart n8n`
3. Borra caché del navegador: Ctrl+Shift+Del
4. Revisa logs: `docker logs n8n 2>&1 | tail -50`

### Error: "OpenCode node not found"

**Solución:**
```bash
# SSH a CasaOS
ls -la /DATA/AppData/n8n/nodes/OpenCode/
# Deberías ver: OpenCode.node.js, OpenCodeDescription.js, etc.
```

### Error: "Cannot connect to OpenCode"

**Verifica:**
```bash
# Desde OpenCode environment:
curl -X POST http://192.168.0.214:4096/session \
  -H "Content-Type: application/json" \
  -d '{"title": "test"}'
  
# Desde CasaOS:
curl -X POST http://opencode:4096/session \
  -H "Content-Type: application/json" \
  -d '{"title": "test"}'
```

---

## Archivos Compilados

Los siguientes archivos están listos en `/workspace/n8n-nodes-opencode/dist/`:

**Nodo:**
- `nodes/OpenCode/OpenCode.node.js` - Lógica principal
- `nodes/OpenCode/OpenCodeDescription.js` - UI/Parámetros
- `nodes/OpenCode/OpenCode.test.js` - Tests

**Credenciales:**
- `credentials/OpenCodeApi.credentials.js` - Configuración

**Entry point:**
- `index.js` - Exporta nodo y credenciales

---

## Pasos Siguientes

Una vez instalado y testado:

1. ✅ Verificar conectividad en n8n
2. ✅ Crear workflow de prueba
3. → **Migrar el workflow LinkedIn** para usar OpenCode node
4. → Remover 3+ nodos HTTP redundantes
5. → Simplificar lógica del workflow

