import express from 'express';
import cors from 'cors';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { initializeORM, getORM } from './shared/db/mikro-orm.config';
import jugadorRoutes from './routes/jugador.routes';

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

// Rutas de jugadores
app.use('/api/jugadores', jugadorRoutes);



// Función para cerrar conexiones de base de datos
const closeDatabase = async () => {
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

// Inicializar aplicación
const init = async () => {
  try {
    console.log('🔄 Conectando a la base de datos...');
    const orm = await initializeORM();
    
    console.log('🔄 Actualizando esquema de base de datos...');
    await orm.getSchemaGenerator().updateSchema();
    
    console.log('✅ Base de datos configurada correctamente');

    const server = app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 Base de datos: MySQL (Cloud)`);
      console.log('💡 Presiona Ctrl+C para cerrar el servidor');
    });

    // Manejar cierre del servidor
    process.on('SIGINT', () => {
      console.log('\n🔄 Cerrando servidor HTTP...');
      server.close(() => {
        console.log('✅ Servidor HTTP cerrado');
      });
    });

    process.on('SIGTERM', () => {
      console.log('\n🔄 Cerrando servidor HTTP...');
      server.close(() => {
        console.log('✅ Servidor HTTP cerrado');
      });
    });

  } catch (error) {
    console.error('❌ Error inicializando la aplicación:', error);
    await closeDatabase();
    process.exit(1);
  }
};

init();