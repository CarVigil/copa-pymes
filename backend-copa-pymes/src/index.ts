import express from 'express';
import cors from 'cors';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { initializeORM, getORM } from './shared/db/mikro-orm.config';
import { usuarioRoutes } from './routes/usuario.routes';
import torneoRoutes from './routes/torneo.routes';
import equipoRoutes from './routes/equipo.routes';
import divisionRoutes from './routes/division.routes';
import sedeRoutes from './routes/sede.routes';
import premioRoutes from './routes/premio.routes';
import authRoutes from './routes/auth.routes';
import inscripcionRoutes from './routes/inscripcion.routes';
import partidosRoutes from './routes/partido.routes';
import { startTorneoEstadoScheduler, stopTorneoEstadoScheduler } from './services/torneoEstadoScheduler';

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware para MikroORM
app.use((req: any, res: any, next: any) => {
  RequestContext.create(getORM().em, next);
});

// Rutas
app.get('/api/health', (req: any, res: any) => {
  res.json({ 
    message: 'Backend funcionando correctamente!',
    database: 'Conectado a SQL',
    timestamp: new Date().toISOString()
  });
});

// Endpoint temporal para probar conexión con torneos
app.get('/api/test-torneos', async (req: any, res: any) => {
  try {
    const orm = getORM();
    const em = orm.em.fork();
    
    // Probar consulta directa
    const count = await em.getConnection().execute('SELECT COUNT(*) as total FROM torneo');
    const torneos = await em.getConnection().execute('SELECT * FROM torneo LIMIT 5');
    
    res.json({
      success: true,
      message: 'Conexión con tabla torneos exitosa',
      data: {
        count: count[0],
        sample: torneos
      }
    });
  } catch (error: any) {
    console.error('Error en test-torneos:', error);
    res.status(500).json({
      success: false,
      message: 'Error conectando con torneos',
      error: error.message
    });
  }
});

// Rutas de autenticación (públicas)
app.use('/api/auth', authRoutes);

// Rutas de usuarios (protegidas) - reemplaza a jugadores
app.use('/api/usuarios', usuarioRoutes);

// Rutas de torneos (protegidas)
app.use('/api/torneos', torneoRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/divisiones', divisionRoutes);
app.use('/api/sedes', sedeRoutes);
app.use('/api/premios', premioRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
app.use('/api/partidos', partidosRoutes);

// Función para cerrar conexiones de base de datos
const closeDatabase = async () => {
  stopTorneoEstadoScheduler();
  try {
    const orm = getORM();
    console.log('🔄 Cerrando conexiones de base de datos...');
    await orm.close();
    console.log('✅ Conexiones de base de datos cerradas');
  } catch (error) {
    console.log('ℹ️ Base de datos ya cerrada o no inicializada');
  }
};

// Manejadores de señales para cerrar conexiones
process.on('SIGINT', async () => {
  console.log('\n🛑 Señal SIGINT recibida. Cerrando servidor...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Señal SIGTERM recibida. Cerrando servidor...');
  await closeDatabase();
  process.exit(0);
});

process.on('exit', async () => {
  console.log('🛑 Proceso terminando...');
});

// Manejar errores no capturados
process.on('uncaughtException', async (error) => {
  console.error('❌ Error no capturado:', error);
  await closeDatabase();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  await closeDatabase();
  process.exit(1);
});

// Inicializar aplicación con reintentos
const init = async () => {
  let retries = 0;
  const maxRetries = 5;
  const retryDelay = 5000; // 5 segundos

  while (retries < maxRetries) {
    try {
      console.log(`🔄 Conectando a la base de datos... (Intento ${retries + 1}/${maxRetries})`);
      const orm = await initializeORM();

      // Probar la conexión
      await orm.em.getConnection().execute('SELECT 1');

      //console.log('🔄 Actualizando esquema de base de datos...');
      //await orm.getSchemaGenerator().updateSchema();

      console.log('✅ Base de datos configurada correctamente');

      const server = app.listen(PORT, () => {
        console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
        console.log(`📊 Base de datos: MySQL (Local)`);
        console.log('💡 Presiona Ctrl+C para cerrar el servidor');
      });
      startTorneoEstadoScheduler();

      // Manejar cierre del servidor
      const gracefulShutdown = async () => {
        console.log('\n🔄 Cerrando servidor HTTP...');
        server.close(async () => {
          console.log('✅ Servidor HTTP cerrado');
          await closeDatabase();
          process.exit(0);
        });
      };

      process.on('SIGINT', gracefulShutdown);
      process.on('SIGTERM', gracefulShutdown);

      // Si llegamos aquí, la inicialización fue exitosa
      return;

    } catch (error: any) {
      retries++;
      console.error(`❌ Error conectando a la base de datos (Intento ${retries}/${maxRetries}):`, error.message);
      
      if (retries >= maxRetries) {
        console.error('❌ Máximo número de reintentos alcanzado. Cerrando aplicación.');
        await closeDatabase();
        process.exit(1);
      }
      
      console.log(`⏳ Reintentando en ${retryDelay / 1000} segundos...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

init();