# API de Autenticación - Copa Pymes

## Descripción del Sistema de Privilegios

### Roles de Usuario:
- **ADMIN**: Puede realizar todas las operaciones (CRUD completo)
- **JUGADOR**: Solo puede ver información (solo lectura)

### Endpoints de Autenticación

#### 1. Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "contraseña"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@email.com",
      "nombre": "Nombre",
      "apellido": "Apellido",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  },
  "message": "Login exitoso"
}
```

#### 2. Registro de Usuario (Solo Admins)
```
POST /api/auth/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "nuevo@email.com",
  "password": "contraseña123",
  "nombre": "Nombre",
  "apellido": "Apellido",
  "role": "jugador"
}
```

#### 3. Obtener Perfil
```
GET /api/auth/profile
Authorization: Bearer <token>
```

#### 4. Cambiar Contraseña
```
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "contraseñaActual",
  "newPassword": "nuevaContraseña"
}
```

#### 5. Listar Usuarios (Solo Admins)
```
GET /api/auth/users
Authorization: Bearer <token>
```

### Endpoints Protegidos por Rol

#### Jugadores (Solo Lectura)
- `GET /api/jugadores` - Ver todos los jugadores
- `GET /api/jugadores/:id` - Ver jugador específico
- `GET /api/torneos` - Ver todos los torneos
- `GET /api/torneos/:id` - Ver torneo específico

#### Administradores (CRUD Completo)
- Todos los endpoints de jugadores +
- `POST /api/jugadores` - Crear jugador
- `PUT /api/jugadores/:id` - Actualizar jugador
- `DELETE /api/jugadores/:id` - Eliminar jugador
- `POST /api/torneos` - Crear torneo
- `PUT /api/torneos/:id` - Actualizar torneo
- `DELETE /api/torneos/:id` - Eliminar torneo
- `POST /api/auth/register` - Registrar usuarios
- `GET /api/auth/users` - Ver todos los usuarios

### Uso del Token
Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <token>
```

### Códigos de Estado
- `200` - Operación exitosa
- `201` - Recurso creado
- `400` - Datos inválidos
- `401` - No autenticado / Token inválido
- `403` - Acceso denegado (sin privilegios)
- `404` - Recurso no encontrado
- `409` - Conflicto (recurso ya existe)
- `500` - Error interno del servidor

### Usuario Administrador por Defecto
```
Email: admin@copapymes.com
Contraseña: admin123
```

**⚠️ IMPORTANTE: Cambiar la contraseña después del primer login**