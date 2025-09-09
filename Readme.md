# Proyecto Full Stack - Copa Pymes

Sistema completo con Node.js, React, TypeScript y MikroORM.

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** v20.10.0
- **Express.js** - Framework web
- **TypeScript** - Tipado estático
- **MikroORM** - ORM para base de datos
- **SQLite** - Base de datos

### Frontend
- **React** v18 con TypeScript
- **Axios** - Cliente HTTP
- **Create React App** - Configuración inicial

## 📋 Prerrequisitos

Asegurate de tener instalado:
- **Node.js** v18 o superior ([Descargar aquí](https://nodejs.org/))
- **npm** v9 o superior (viene con Node.js)
- **Git** ([Descargar aquí](https://git-scm.com/))

Verifica las versiones:
```bash
node --version
npm --version
git --version
```

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/CarVigil/copa-pymes.git
cd copa-pymes
```

### 2. Configurar el Backend
```bash
cd backend-copa-pymes
npm install
```

### 3. Configurar el Frontend
```bash
cd ../frontend-copa-pymes
npm install
```

### 4. Configurar variables de entorno (opcional)
Crea un archivo `.env` en la carpeta backend:
```env
PORT=3001
NODE_ENV=development
DB_NAME=database.sqlite
```

## 🏃‍♂️ Ejecutar el Proyecto

### Opción 1: Ejecutar por separado
**Terminal 1 - Backend:**
```bash
cd backend-copa-pymes
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Opción 2: Ejecutar todo junto (próximamente)
```bash
npm run dev
```

## 📱 URLs de la Aplicación

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/api/health
- **API Users:** http://localhost:3001/api/users

## 🗄️ Base de Datos

### Estructura de la Base de Datos
La aplicación utiliza SQLite con las siguientes tablas:

**Tabla Users:**
- `id` - Primary Key (autoincremental)
- `name` - Nombre del usuario
- `email` - Email único
- `password` - Contraseña
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización

### Comandos de Base de Datos
```bash
# La base de datos se crea automáticamente al iniciar el servidor
# Archivo: backend/database.sqlite
```

## 📡 API Endpoints

### Health Check
```http
GET /api/health
```

### Usuarios
```http
GET /api/users
# Obtiene todos los usuarios

POST /api/users
Content-Type: application/json

{
  "name": "Nombre del usuario",
  "email": "usuario@email.com",
  "password": "contraseña123"
}
```

## 📁 Estructura del Proyecto

```
copa-pymes/
├── backend-copa-pymes/           # API Backend
│   ├── src/
│   │   ├── entities/            # Entidades de la BD
│   │   │   └── User.ts
│   │   ├── index.ts            # Servidor principal
│   │   └── mikro-orm.config.ts # Configuración BD
│   ├── package.json
│   └── tsconfig.json
├── frontend/                    # Aplicación React
│   ├── src/
│   │   ├── App.tsx             # Componente principal
│   │   └── ...
│   └── package.json
├── README.md
└── .gitignore
```

## 🛠️ Scripts Disponibles

### Backend
```bash
npm run dev      # Ejecutar en modo desarrollo
npm run build    # Compilar TypeScript
npm start        # Ejecutar versión compilada
```

### Frontend
```bash
npm start        # Ejecutar en modo desarrollo
npm run build    # Crear build de producción
npm test         # Ejecutar tests
```

## 🔧 Solución de Problemas Comunes

### Error de TypeScript con imports
Si ves errores como "ECMAScript imports cannot be written in a CommonJS file":
1. Verifica que el `tsconfig.json` tenga `"module": "commonjs"`
2. Asegúrate de no tener `"type": "module"` en el `package.json`

### Error de conexión Frontend-Backend
1. Verifica que el backend esté corriendo en puerto 3001
2. Verifica que no haya problemas de CORS
3. Revisa la URL de la API en `App.tsx`

### Error de base de datos
1. Elimina el archivo `database.sqlite` y reinicia el servidor
2. Verifica que las entidades estén bien configuradas
3. Revisa los logs del servidor
