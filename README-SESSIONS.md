# Sistema de Sesiones Interactivas - EduAI

## 📋 Descripción General

Este sistema permite que los estudiantes se unan a sesiones interactivas de aprendizaje sin necesidad de crear cuentas, mientras que los profesores mantienen acceso completo para crear y gestionar ejercicios.

## 🚀 Características Principales

### Para Estudiantes
- ✅ **Acceso sin registro**: Solo necesitan un código de sesión y su nombre
- ✅ **Datos temporales**: La información se almacena localmente, no en la base de datos
- ✅ **Experiencia completa**: Pueden responder preguntas y ver su progreso en tiempo real
- ✅ **Conexión WebSocket**: Interacción en tiempo real con la sesión

### Para Profesores
- ✅ **Gestión completa**: Crear ejercicios, iniciar sesiones, ver estadísticas
- ✅ **Acceso autenticado**: Login/Register con datos persistidos
- ✅ **Control de sesiones**: Iniciar, pausar, finalizar sesiones
- ✅ **Dashboard avanzado**: Gestión de ejercicios y sesiones

## 🏗️ Arquitectura del Sistema

### Frontend (React + TypeScript)
```
src/
├── components/
│   └── StudentNameModal.tsx          # Modal para capturar nombre del estudiante
├── hooks/
│   ├── useWebSocket.ts              # Hook para conexión WebSocket
│   └── useTemporaryUser.ts          # Gestión de usuarios temporales
├── modules/sessions/
│   └── pages/
│       ├── JoinSession.tsx          # Página principal (unirse a sesión)
│       └── SessionRoom.tsx          # Sala de sesión interactiva
└── types/
    └── session-backend.ts           # Tipos TypeScript para el backend
```

### Backend (NestJS + WebSocket)
- **WebSocket Gateway**: Manejo de conexiones en tiempo real
- **Session Service**: Lógica de negocio para sesiones
- **Controllers**: Endpoints REST para validación y gestión

## 🔄 Flujo de Usuario

### Estudiantes (Sin Registro)
1. **Acceso**: Visitan la página principal (`/`)
2. **Código**: Ingresan el código de 6 dígitos proporcionado por el profesor
3. **Validación**: El sistema valida que la sesión existe
4. **Nombre**: Modal solicita su nombre (si es primera vez)
5. **Usuario Temporal**: Se crea un usuario temporal local
6. **Conexión**: Se conectan vía WebSocket a la sesión
7. **Participación**: Responden preguntas y ven progreso en tiempo real

### Profesores (Con Registro)
1. **Login**: Acceden con sus credenciales desde la página principal
2. **Dashboard**: Ven sus ejercicios y pueden crear nuevos
3. **Sesión**: Crean sesiones basadas en ejercicios publicados
4. **Gestión**: Controlan el flujo de la sesión (iniciar/pausar/finalizar)
5. **Monitoreo**: Ven participantes y estadísticas en tiempo real

## 🛠️ Configuración

### Variables de Entorno
```bash
# API Configuration
VITE_API_URL=http://localhost:3001

# WebSocket Configuration
VITE_WS_URL=http://localhost:3001

# Frontend URL
VITE_FRONTEND_URL=http://localhost:3000
```

### Instalación
```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev
```

## 📡 WebSocket Events

### Cliente → Servidor
- `joinSession`: Unirse a una sesión
- `leaveSession`: Salir de una sesión
- `submitAnswer`: Enviar respuesta a pregunta
- `getSessionStatus`: Obtener estado de la sesión

### Servidor → Cliente
- `sessionJoined`: Confirmación de unión exitosa
- `userJoined`: Nuevo participante se unió
- `userLeft`: Participante salió
- `sessionStarted`: Sesión iniciada por profesor
- `sessionEnded`: Sesión finalizada
- `answerResult`: Resultado de respuesta enviada
- `participantCountUpdate`: Actualización de contador de participantes

## 🎨 Componentes Principales

### JoinSession (Página Principal)
- **Ubicación**: `/src/modules/sessions/pages/JoinSession.tsx`
- **Función**: Página principal con dos secciones (estudiantes/profesores)
- **Características**:
  - Formulario de código de sesión
  - Botones de login/register para profesores
  - Información explicativa
  - Manejo de usuarios temporales

### SessionRoom (Sala de Sesión)
- **Ubicación**: `/src/modules/sessions/pages/SessionRoom.tsx`
- **Función**: Interfaz de participación en sesión activa
- **Características**:
  - Estado de conexión WebSocket
  - Progreso del estudiante
  - Interfaz de preguntas interactivas
  - Estadísticas en tiempo real
  - Detección automática de categorías temáticas

### StudentNameModal
- **Ubicación**: `/src/components/StudentNameModal.tsx`
- **Función**: Captura nombre de estudiantes no registrados
- **Características**:
  - Validación de nombre
  - Diseño atractivo
  - No se puede cerrar sin completar

## 🔧 Hooks Personalizados

### useTemporaryUser
- **Función**: Gestiona usuarios temporales (localStorage)
- **Métodos**:
  - `createTemporaryUser(name)`: Crear usuario temporal
  - `updateTemporaryUser(name)`: Actualizar nombre
  - `clearTemporaryUser()`: Limpiar datos temporales

### useWebSocket
- **Función**: Maneja conexión WebSocket con el backend
- **Características**:
  - Reconexión automática
  - Manejo de eventos
  - Estado de conexión
  - Métodos para interactuar con sesiones

## 📊 Tipos de Datos

### Usuario Temporal
```typescript
interface TemporaryUser {
  id: string;           // ID único generado localmente
  firstName: string;    // Primer nombre
  lastName: string;     // Apellido
  fullName: string;     // Nombre completo
  isTemporary: true;    // Flag para identificar tipo
  role: 'student';      // Siempre estudiante
}
```

### Sesión
```typescript
interface SessionResponse {
  id: string;
  teacher: User;
  exercise: Exercise;
  name: string;
  accessCode: string;   // Código de 6 dígitos
  status: 'waiting' | 'active' | 'finished' | 'cancelled';
  participants: User[];
  // ... más propiedades
}
```

## 🎯 Próximas Mejoras

1. **Dashboard de Participantes**: Mostrar estadísticas detalladas de estudiantes temporales
2. **Persistencia Opcional**: Permitir a estudiantes crear cuentas después de participar
3. **Análisis de Sesiones**: Reportes detallados de participación y rendimiento
4. **Notificaciones Push**: Alertas en tiempo real para profesores
5. **Modo Offline**: Funcionalidad básica sin conexión a internet

## 🐛 Solución de Problemas

### WebSocket no conecta
- Verificar que `VITE_API_URL` esté configurado correctamente
- Confirmar que el backend WebSocket esté ejecutándose
- Revisar la consola del navegador para errores

### Usuario temporal no se guarda
- Verificar que localStorage esté habilitado
- Limpiar caché del navegador
- Verificar que no hay errores en la consola

### Sesión no se encuentra
- Confirmar que el código de acceso sea correcto
- Verificar que la sesión esté activa en el backend
- Revisar que el endpoint público esté funcionando

## 📝 Notas de Desarrollo

- Los usuarios temporales se identifican con el flag `isTemporary: true`
- Los datos temporales se almacenan en `localStorage` con la clave `genius_temp_user`
- El sistema es compatible con el detector de categorías temáticas existente
- La navegación se adapta según el tipo de usuario (temporal vs registrado)
