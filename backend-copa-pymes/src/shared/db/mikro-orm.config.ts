import { MikroORM } from "@mikro-orm/core";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { MySqlDriver } from "@mikro-orm/mysql";

const config = {
  entities: ["dist/models/**/*.js"],
  entitiesTs: ["src/models/**/*.ts"],
  discoveryWarnWhenNoEntities: false,
  dbName: "copa_pymes",
  clientUrl: "mysql://root:@localhost:3306/copa_pymes",
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
