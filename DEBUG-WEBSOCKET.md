# WebSocket Debugging Guide

## 🚨 Problema Actual
```
La conexión a ws://localhost:3000/socket.io/?EIO=4&transport=websocket fue interrumpida
Connected to WebSocket
Join error: { message: "Failed to join session" }
```

## 🔍 Diagnóstico

### 1. **Configuración de Puertos Correcta**
- ✅ **Backend**: Puerto 3000 (API REST + WebSocket)
- ✅ **Frontend**: Puerto 5173 (Vite dev server)
- ✅ **WebSocket**: `ws://localhost:3000/sessions`

### 2. **Error "Failed to join session"**
- **Posibles causas**:
  - Backend WebSocket Gateway no está configurado correctamente
  - Namespace incorrecto (`/sessions` vs sin namespace)
  - Evento `joinSession` no manejado en el backend
  - Datos del usuario incorrectos (ID, formato)

## 🛠️ Soluciones Implementadas

### 1. **Configuración WebSocket Corregida**
```typescript
// ANTES: Puerto incorrecto
ws://localhost:3000/socket.io/

// AHORA: Puerto correcto
http://localhost:3001 (Socket.IO maneja la conversión)
```

### 2. **Debugging Mejorado**
- ✅ Logs detallados en conexión
- ✅ Logs en intento de unirse a sesión
- ✅ Manejo de errores específicos

### 3. **Manejo de Usuarios Mejorado**
```typescript
// Maneja tanto usuarios autenticados como temporales
const userToUse = currentUser || user;
const userId = userToUse.id || userToUse._id;
```

## 🧪 Para Verificar en el Backend

### 1. **WebSocket Gateway debe tener**:
```typescript
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  },
})
export class SessionGateway {
  @SubscribeMessage('joinSession')
  async handleJoinSession(
    @MessageBody() data: { sessionId: string; userId: string; accessCode: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Lógica para unirse a la sesión
  }
}
```

### 2. **Verificar que el backend esté escuchando**:
```bash
# El backend debe mostrar algo como:
WebSocket server listening on port 3001
```

## 🔧 Comandos de Debugging

### 1. **Verificar conexión WebSocket**:
```javascript
// En la consola del navegador:
const socket = io('http://localhost:3001');
socket.on('connect', () => console.log('Connected!'));
socket.on('connect_error', (err) => console.error('Error:', err));
```

### 2. **Verificar eventos**:
```javascript
// Emitir evento de prueba:
socket.emit('joinSession', {
  sessionId: 'test',
  userId: 'test-user',
  accessCode: 'TEST123'
});
```

## 📋 Checklist de Verificación

### Frontend ✅
- [x] WebSocket conecta al puerto 3001
- [x] Eventos usan nombres correctos
- [x] Datos del usuario son válidos
- [x] Logs de debugging habilitados

### Backend (Verificar)
- [ ] WebSocket Gateway configurado
- [ ] CORS habilitado para WebSocket
- [ ] Evento `joinSession` implementado
- [ ] Validación de sesión funciona
- [ ] Logs del servidor muestran intentos de conexión

## 🚀 Próximos Pasos

1. **Verificar logs del backend** cuando se intente unir a sesión
2. **Confirmar que el Gateway esté corriendo** en el puerto 3001
3. **Probar conexión directa** con herramientas como Postman o wscat
4. **Verificar estructura de datos** que espera el backend

## 📝 Logs Esperados

### Frontend (Consola del navegador):
```
Connecting to WebSocket at: http://localhost:3001
Connected to WebSocket
Attempting to join session: { sessionId: "...", userId: "...", accessCode: "..." }
Session joined: { session: {...}, timestamp: "..." }
```

### Backend (Consola del servidor):
```
WebSocket connection established
Received joinSession event: { sessionId: "...", userId: "...", accessCode: "..." }
User joined session successfully
```
