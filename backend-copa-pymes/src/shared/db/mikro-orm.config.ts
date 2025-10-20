import { MikroORM } from "@mikro-orm/core";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { MySqlDriver } from "@mikro-orm/mysql";

// Configuración de base de datos desde variables de entorno o valores por defecto
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || ''; // Vacío por defecto para MySQL local sin contraseña
const DB_NAME = process.env.DB_NAME || 'copa_pymes';

const config = {
  entities: ["dist/models/**/*.js"],
  entitiesTs: ["src/models/**/*.ts"],
  discoveryWarnWhenNoEntities: false,
  dbName: DB_NAME,
  clientUrl: `mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
  driver: MySqlDriver,

  highlighter: new SqlHighlighter(),
  debug: true,
  pool: {
    min: 1,
    max: 3,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 60000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 300000,
    reapIntervalMillis: 10000,
    createRetryIntervalMillis: 500,
  },
  driverOptions: {
    connection: {
      timezone: "Z",
      connectTimeout: 60000,
      ssl: false,
      supportBigNumbers: true,
      bigNumberStrings: true,
      dateStrings: false,
      charset: "utf8mb4",
    },
  },

  migrations: {
    path: "./dist/migrations",
    pathTs: "./src/migrations",
    transactional: true,
  },

  schemaGenerator: {
    disableForeignKeys: false, 
    createForeignKeyConstraints: true,
    safe: true,                 
  },

  autoLoadEntities: true, 
};

let orm: MikroORM;

export const initializeORM = async (): Promise<MikroORM> => {
  if (!orm) {
    try {
      orm = await MikroORM.init(config);
      console.log("📡 MikroORM inicializado correctamente");
    } catch (error: any) {
      console.error("❌ Error inicializando MikroORM:", error.message);
      throw error;
    }
  }
  return orm;
};

export const getORM = (): MikroORM => {
  if (!orm) {
    throw new Error(
      "ORM no ha sido inicializado. Llama a initializeORM() primero."
    );
  }
  return orm;
};

export const checkConnection = async (): Promise<boolean> => {
  try {
    if (!orm) {
      await initializeORM();
    }

    await orm.em.getConnection().execute("SELECT 1");
    return true;
  } catch (error: any) {
    console.error("❌ Error verificando conexión:", error.message);
    return false;
  }
};

export default config;
