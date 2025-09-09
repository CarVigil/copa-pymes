const express = require('express');
const cors = require('cors');
const { MikroORM, RequestContext } = require('@mikro-orm/core');
const config = require('./mikro-orm.config');
const { User } = require('./entities/User');

const app = express();
const PORT = 3001;

let orm: any;

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware para MikroORM
app.use((req: any, res: any, next: any) => {
  RequestContext.create(orm.em, next);
});

// Rutas
app.get('/api/health', (req: any, res: any) => {
  res.json({ 
    message: 'Backend funcionando correctamente!',
    database: 'Conectado a SQLite',
    timestamp: new Date().toISOString()
  });
});

// Ruta para obtener usuarios
app.get('/api/users', async (req: any, res: any) => {
  try {
    const users = await orm.em.find(User, {});
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo usuarios'
    });
  }
});

// Ruta para crear usuario
app.post('/api/users', async (req: any, res: any) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y contraseña son requeridos'
      });
    }

    const user = new User();
    user.name = name;
    user.email = email;
    user.password = password; // En producción, hashear la contraseña

    await orm.em.persistAndFlush(user);

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error('Error creando usuario:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creando usuario'
    });
  }
});

// Inicializar aplicación
const init = async () => {
  try {
    console.log('🔄 Conectando a la base de datos...');
    orm = await MikroORM.init(config);
    
    console.log('🔄 Actualizando esquema de base de datos...');
    await orm.getSchemaGenerator().updateSchema();
    
    console.log('✅ Base de datos configurada correctamente');

    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
      console.log(`🔍 API Health: http://localhost:${PORT}/api/health`);
      console.log(`👥 API Users: http://localhost:${PORT}/api/users`);
      console.log(`📊 Base de datos: SQLite (database.sqlite)`);
    });
  } catch (error) {
    console.error('❌ Error inicializando la aplicación:', error);
    process.exit(1);
  }
};

init();