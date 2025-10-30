# Backend Integration Guide - Usuarios Temporales

## 🚨 Problema Actual
```
✅ WebSocket conecta: ws://localhost:3000/sessions
✅ Usuario temporal creado: temp_1759039503813_g67pm41yq
✅ Datos enviados correctamente al backend
❌ Backend responde: "Failed to join session"
```

## 🔍 Análisis del Problema

### **Datos que Envía el Frontend:**
```javascript
{
  sessionId: "68d75771162164a7a9e24ba7",
  userId: "temp_1759039503813_g67pm41yq",  // ← Usuario temporal
  accessCode: "LXQ7TM"
}
```

### **Posibles Causas en el Backend:**
1. **Usuario temporal no existe en BD** - El backend busca el `userId` en la base de datos
2. **Validación de usuario falla** - No reconoce usuarios con prefijo `temp_`
3. **Sesión no encontrada** - El `sessionId` no existe o no está activa
4. **Código de acceso incorrecto** - Validación del `accessCode` falla

## 🛠️ Soluciones para el Backend

### **1. Modificar el WebSocket Gateway**

```typescript
@WebSocketGateway({
  namespace: 'sessions',
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
  },
})
export class SessionGateway {
  
  @SubscribeMessage('joinSession')
  async handleJoinSession(
    @MessageBody() data: { sessionId: string; userId: string; accessCode: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('🔍 Received joinSession:', data);
    
    try {
      // 1. Validar que la sesión existe y está activa
      const session = await this.sessionService.findActiveSession(data.sessionId);
      if (!session) {
        throw new Error('Session not found or inactive');
      }
      
      // 2. Validar código de acceso
      if (session.accessCode !== data.accessCode) {
        throw new Error('Invalid access code');
      }
      
      // 3. Manejar usuarios temporales vs registrados
      let user;
      if (data.userId.startsWith('temp_')) {
        // Usuario temporal - crear objeto user temporal
        user = {
          id: data.userId,
          firstName: 'Estudiante',
          lastName: 'Temporal',
          email: `${data.userId}@temp.local`,
          role: 'student',
          isTemporary: true,
        };
        console.log('👤 Created temporary user:', user);
      } else {
        // Usuario registrado - buscar en BD
        user = await this.userService.findById(data.userId);
        if (!user) {
          throw new Error('User not found');
        }
      }
      
      // 4. Unir usuario a la sesión
      await this.sessionService.addParticipant(session.id, user);
      
      // 5. Unir cliente al room de Socket.IO
      await client.join(session.id);
      
      // 6. Emitir éxito
      client.emit('sessionJoined', {
        sessionId: session.id,
        session: session,
        timestamp: new Date(),
      });
      
      // 7. Notificar a otros participantes
      client.to(session.id).emit('userJoined', {
        user: user,
        timestamp: new Date(),
      });
      
      console.log('✅ User joined session successfully:', {
        userId: user.id,
        sessionId: session.id,
        isTemporary: user.isTemporary || false,
      });
      
    } catch (error) {
      console.error('❌ Failed to join session:', error.message);
      client.emit('joinError', {
        message: error.message || 'Failed to join session',
      });
    }
  }
}
```

### **2. Actualizar el Session Service**

```typescript
@Injectable()
export class SessionService {
  
  async findActiveSession(sessionId: string) {
    const session = await this.sessionModel.findById(sessionId);
    if (!session || session.status !== 'waiting') {
      return null;
    }
    return session;
  }
  
  async addParticipant(sessionId: string, user: any) {
    // Para usuarios temporales, no los agregamos a la BD
    // Solo los mantenemos en memoria o en el estado de la sesión
    if (user.isTemporary) {
      console.log('👤 Temporary user joined, not persisting to DB');
      return;
    }
    
    // Para usuarios registrados, agregar a la sesión en BD
    await this.sessionModel.findByIdAndUpdate(
      sessionId,
      { $addToSet: { participants: user.id } }
    );
  }
}
```

### **3. Endpoint Público para Validar Sesión**

```typescript
@Controller('session')
export class SessionController {
  
  @Get('join/:accessCode')
  async validateSession(@Param('accessCode') accessCode: string) {
    console.log('🔍 Validating session with access code:', accessCode);
    
    const session = await this.sessionService.findByAccessCode(accessCode);
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    
    if (session.status !== 'waiting') {
      throw new BadRequestException('Session is not accepting new participants');
    }
    
    return {
      id: session.id,
      name: session.name,
      teacher: session.teacher,
      exercise: session.exercise,
      status: session.status,
      participantCount: session.participants?.length || 0,
    };
  }
}
```

## 🧪 Testing en el Backend

### **1. Logs que Deberías Ver:**
```
🔍 Received joinSession: {
  sessionId: "68d75771162164a7a9e24ba7",
  userId: "temp_1759039503813_g67pm41yq",
  accessCode: "LXQ7TM"
}
👤 Created temporary user: { id: "temp_...", isTemporary: true }
✅ User joined session successfully
```

### **2. Si Ves Errores:**
```
❌ Failed to join session: Session not found
❌ Failed to join session: Invalid access code
❌ Failed to join session: User not found
```

## 🔧 Debugging Steps

### **1. Verificar en Backend:**
```bash
# Agregar logs en tu SessionGateway
console.log('Session found:', session);
console.log('Access code match:', session.accessCode === data.accessCode);
console.log('User type:', data.userId.startsWith('temp_') ? 'temporary' : 'registered');
```

### **2. Verificar en Base de Datos:**
```javascript
// Verificar que la sesión existe
db.sessions.findOne({ _id: ObjectId("68d75771162164a7a9e24ba7") })

// Verificar el código de acceso
db.sessions.findOne({ accessCode: "LXQ7TM" })
```

## 🎯 Próximos Pasos

1. **Implementar manejo de usuarios temporales** en el backend
2. **Agregar logs detallados** para debugging
3. **Verificar que la sesión existe** en la base de datos
4. **Probar con usuario registrado** para comparar comportamiento

El frontend está funcionando perfectamente. El problema está 100% en el backend WebSocket Gateway. 🚀
