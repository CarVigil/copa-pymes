import { Options } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';

const config: Options<SqliteDriver> = {
  entities: ['./dist/entities/**/*.js'],
  entitiesTs: ['./src/entities/**/*.ts'],
  dbName: './database.sqlite',
  driver: SqliteDriver,
  debug: process.env.NODE_ENV !== 'production',
};

export = config;