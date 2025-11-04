# Configuración del Webhook N8N

## Descripción
El sistema envía automáticamente una notificación al webhook de N8N cuando un **usuario registrado** (no temporal) completa una sesión.

## Configuración

### 1. Crear archivo de variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.template .env.local
```

### 2. Configurar la URL del webhook

Edita el archivo `.env.local` y asegúrate de que contenga:

```env
VITE_N8N_WEBHOOK_URL=https://n8n.automaginex-ai.lat/webhook-test/a245315a-7478-444c-a8fa-4ab50452cdde
```

### 3. Reiniciar el servidor de desarrollo

Después de crear o modificar el archivo `.env.local`, reinicia el servidor:

```bash
npm run dev
```

## Datos enviados al webhook

Cuando un usuario registrado completa una sesión, se envía un POST request con el siguiente formato JSON:

```json
{
  "nombre": "Alessandro Rodriguez",
  "correo": "estudiante@gmail.com",
  "puntajeFinal": 15.5,
  "nombreSesion": "Redes - Sesión 1",
  "timestamp": "2025-11-04T02:30:00.000Z"
}
```

### Campos:
- **nombre**: Nombre completo del usuario
- **correo**: Email del usuario
- **puntajeFinal**: Puntaje final obtenido (sobre 20)
- **nombreSesion**: Nombre de la sesión completada
- **timestamp**: Fecha y hora de completitud (ISO 8601)

## Comportamiento

### ✅ Se envía webhook cuando:
- El usuario es **autenticado** (registrado en el sistema)
- Completa **todos los ejercicios** de la sesión
- Es la **primera vez** que completa esa sesión

### ❌ NO se envía webhook cuando:
- El usuario es **temporal** (invitado sin cuenta)
- El usuario ya había completado la sesión anteriormente
- La variable `VITE_N8N_WEBHOOK_URL` no está configurada

## Logs de debug

En la consola del navegador verás:

```
📨 Sending webhook notification for authenticated user
📤 Sending session completion to n8n webhook: { ... }
✅ Session completion sent to n8n webhook successfully
```

O si es usuario temporal:
```
⏭️ Skipping webhook notification for temporary user
```

## Manejo de errores

- Si el webhook falla, se registra el error en consola pero **NO bloquea** la UI
- El usuario puede continuar normalmente aunque el webhook falle
- Los errores se muestran como: `❌ Webhook request failed: ...`

## Seguridad

- El archivo `.env.local` está en `.gitignore` y **NO se versiona**
- La URL del webhook es privada y solo se usa en el cliente
- Solo usuarios autenticados pueden activar el webhook

## Testing

Para probar el webhook:

1. Inicia sesión como usuario registrado (no temporal)
2. Únete a una sesión con código de acceso
3. Completa todos los ejercicios
4. Verifica en N8N que recibió los datos
5. Revisa la consola del navegador para ver los logs

## Troubleshooting

### El webhook no se envía
- ✅ Verifica que `.env.local` existe y tiene la URL correcta
- ✅ Reinicia el servidor de desarrollo después de crear `.env.local`
- ✅ Confirma que estás usando un usuario **registrado**, no temporal
- ✅ Revisa la consola del navegador para ver los logs

### Error de CORS
- El webhook de N8N debe permitir requests desde el dominio del frontend
- Verifica la configuración de CORS en N8N

### Webhook recibe datos incorrectos
- Revisa los logs en la consola: `📤 Sending session completion to n8n webhook`
- Verifica que el formato JSON coincide con lo esperado por N8N
