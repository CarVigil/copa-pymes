import { MikroORM } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { MySqlDriver } from '@mikro-orm/mysql';
import { Usuario } from '../../models/usuario.model';
import { Administrador } from '../../models/especialized/administrador.model';
import { Gestor } from '../../models/especialized/gestor.model';
import { Recepcionista } from '../../models/especialized/recepcionista.model';
import { Arbitro } from '../../models/especialized/arbitro.model';
import { Jugador } from '../../models/especialized/jugador.model';
import { Torneo } from '../../models/torneo.model';

const config = {
  entities: ['dist/models/usuario.model.js', 'dist/models/especialized/*.js', 'dist/models/torneo.model.js'],
  entitiesTs: ['src/models/usuario.model.ts', 'src/models/especialized/*.ts', 'src/models/torneo.model.ts'],
  discoveryWarnWhenNoEntities: false,
  dbName: 'bvyzuetsns2jpfto0ops',
  driver: MySqlDriver,
  clientUrl: 'mysql://utcxia3koyihzi4k:Vu8ZtMMSIwjR4Gx0HZIP@bvyzuetsns2jpfto0ops-mysql.services.clever-cloud.com:3306/bvyzuetsns2jpfto0ops',
  highlighter: new SqlHighlighter(),
  debug: true,
  pool: {
    min: 1,
    max: 3, // Reducido a 3 para no exceder el límite de 5 conexiones
    acquireTimeoutMillis: 60000, // Aumentado para conexiones en la nube
    createTimeoutMillis: 60000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 300000, // 5 minutos
    reapIntervalMillis: 10000, // Cada 10 segundos
    createRetryIntervalMillis: 500,
  },
  driverOptions: {
    connection: {
      timezone: 'Z',
      connectTimeout: 60000, // 60 segundos para conexiones en la nube
      // Eliminamos acquireTimeout y timeout ya que no son válidas para MySQL2
      ssl: false, // Clever Cloud no requiere SSL por defecto
      // Configuraciones adicionales para estabilidad
      supportBigNumbers: true,
      bigNumberStrings: true,
      dateStrings: false,
      charset: 'utf8mb4',
    },
  },
  // Configuración de reconexión automática
  migrations: {
    path: './dist/migrations',
    pathTs: './src/migrations',
  },
  schemaGenerator: {
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: [],
  },
};

// Variable global para el ORM
let orm: MikroORM;

export const initializeORM = async (): Promise<MikroORM> => {
  if (!orm) {
    try {
      orm = await MikroORM.init(config);
      console.log('📡 MikroORM inicializado correctamente');
    } catch (error: any) {
      console.error('❌ Error inicializando MikroORM:', error.message);
      throw error;
    }
  }
  return orm;
};

export const getORM = (): MikroORM => {
  if (!orm) {
    throw new Error('ORM no ha sido inicializado. Llama a initializeORM() primero.');
  }
  return orm;
};

// Función para verificar y reconectar si es necesario
export const checkConnection = async (): Promise<boolean> => {
  try {
    if (!orm) {
      await initializeORM();
    }
    
    await orm.em.getConnection().execute('SELECT 1');
    return true;
  } catch (error: any) {
    console.error('❌ Error verificando conexión:', error.message);
    return false;
  }
};

export default config;

export const syncSchema = async () => {
  const ormInstance = await MikroORM.init(config);
  const generator = ormInstance.getSchemaGenerator();
  await generator.updateSchema();
};
