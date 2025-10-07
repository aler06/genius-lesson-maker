# Solución para el Error de CORS

## 🚨 Problema Actual
```
Error de conexión: Verifica que el backend esté ejecutándose y configurado correctamente para CORS.
```

**Causa**: Tu frontend está desplegado en `https://taller-frontend-bhaobk-607ebf-173-212-248-96.traefik.me` pero tu backend no permite requests desde este dominio.

## ⚡ Solución Rápida para Producción

**En tu backend (API en la nube), actualiza la configuración CORS para incluir tu dominio de frontend:**

## 🔧 Solución en el Backend (NestJS)

### 1. Instalar el paquete CORS
```bash
npm install @nestjs/cors
# o
yarn add @nestjs/cors
```

### 2. Configurar CORS en main.ts
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',  // Frontend en desarrollo
      'http://localhost:5173',  // Vite dev server
      'http://localhost:8081',  // Vite dev server alternativo
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'https://taller-frontend-bhaobk-607ebf-173-212-248-96.traefik.me', // Frontend en producción
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    credentials: true, // Permitir cookies y headers de autenticación
  });

  // Configurar prefijo global para API
  app.setGlobalPrefix('api/v1');
  
  await app.listen(3001);
}
bootstrap();
```

### 3. Configuración Alternativa (más permisiva para desarrollo)
```typescript
// Para desarrollo local - MÁS PERMISIVO
app.enableCors({
  origin: true, // Permite cualquier origen
  credentials: true,
});
```

### 4. Verificar el Controlador de Sesiones
Asegúrate de que tu controlador tenga la ruta correcta:

```typescript
@Controller('session') // Sin 'api/v1' porque ya está en el prefijo global
export class SessionController {
  
  @Get('join/:accessCode')
  async joinSession(@Param('accessCode') accessCode: string) {
    // Tu lógica aquí
    return await this.sessionService.validateSession(accessCode);
  }
}
```

## 🌐 Para WebSocket (Socket.IO)

### Configurar CORS en el Gateway
```typescript
@WebSocketGateway({
  namespace: 'sessions',
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8081',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'https://taller-frontend-bhaobk-607ebf-173-212-248-96.traefik.me',
    ],
    credentials: true,
  },
})
export class SessionGateway {
  // Tu código del gateway
}
```

## 🧪 Verificar la Solución

### 1. Reiniciar el servidor backend
```bash
npm run start:dev
# o
yarn start:dev
```

### 2. Probar el endpoint directamente
```bash
curl -X GET http://localhost:3001/api/v1/session/join/TEST123
```

### 3. Verificar en el navegador
- Abrir DevTools → Network
- Intentar unirse a una sesión
- Verificar que no aparezcan errores de CORS

## 🔍 Debugging

### Headers que debe enviar el servidor:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Accept, Origin, X-Requested-With
Access-Control-Allow-Credentials: true
```

### Si sigue sin funcionar:
1. Verificar que el puerto del frontend sea correcto (3000 o 5173)
2. Comprobar que el backend esté corriendo en el puerto 3001
3. Revisar los logs del servidor para errores
4. Probar con una configuración CORS más permisiva temporalmente

## 📝 Notas Importantes

- **Desarrollo**: Usa configuración permisiva (`origin: true`)
- **Producción**: Especifica dominios exactos por seguridad
- **WebSocket**: Necesita configuración CORS separada en el Gateway
- **Prefijo Global**: Usar `app.setGlobalPrefix('api/v1')` en lugar de repetir en cada controlador

## ✅ Resultado Esperado

Después de aplicar estos cambios, el frontend debería poder hacer solicitudes al endpoint:
```
GET http://localhost:3001/api/v1/session/join/{accessCode}
```

Sin errores de CORS y recibir la respuesta JSON con los datos de la sesión.
