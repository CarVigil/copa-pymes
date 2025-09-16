import { MikroORM } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { MySqlDriver } from '@mikro-orm/mysql';

const config = {
  entities: ['dist/models/**/*.js'],
  entitiesTs: ['src/models/**/*.ts'],
  dbName: 'bvyzuetsns2jpfto0ops',
  driver: MySqlDriver,
  clientUrl: 'mysql://utcxia3koyihzi4k:Vu8ZtMMSIwjR4Gx0HZIP@bvyzuetsns2jpfto0ops-mysql.services.clever-cloud.com:3306/bvyzuetsns2jpfto0ops',
  highlighter: new SqlHighlighter(),
  debug: true,
  pool: {
    min: 1,
    max: 3, // Reducido a 3 para no exceder el límite de 5 conexiones
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },
  driverOptions: {
    connection: {
      timezone: 'Z',
      connectTimeout: 10000,
      acquireTimeout: 10000,
      timeout: 10000,
    },
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
    orm = await MikroORM.init(config);
  }
  return orm;
};

export const getORM = (): MikroORM => {
  if (!orm) {
    throw new Error('ORM no ha sido inicializado. Llama a initializeORM() primero.');
  }
  return orm;
};

export default config;

export const syncSchema = async () => {
  const ormInstance = await MikroORM.init(config);
  const generator = ormInstance.getSchemaGenerator();
  await generator.updateSchema();
};
