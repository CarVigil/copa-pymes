import { MikroORM } from "@mikro-orm/core";
import config from "../shared/db/mikro-orm.config";

async function existsColumn(
  orm: MikroORM,
  table: string,
  column: string
): Promise<boolean> {
  const rows = await orm.em.getConnection().execute(
    `
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_NAME = ?
    LIMIT 1
    `,
    [table, column]
  );
  return rows.length > 0;
}

async function existsIndex(
  orm: MikroORM,
  table: string,
  index: string
): Promise<boolean> {
  const rows = await orm.em.getConnection().execute(
    `
    SELECT 1
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND INDEX_NAME = ?
    LIMIT 1
    `,
    [table, index]
  );
  return rows.length > 0;
}

async function existsForeignKey(
  orm: MikroORM,
  table: string,
  fkName: string
): Promise<boolean> {
  const rows = await orm.em.getConnection().execute(
    `
    SELECT 1
    FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND CONSTRAINT_NAME = ?
    LIMIT 1
    `,
    [table, fkName]
  );
  return rows.length > 0;
}

async function run(): Promise<void> {
  const orm = await MikroORM.init(config);
  const conn = orm.em.getConnection();

  try {
    if (!(await existsColumn(orm, "division", "torneo_id"))) {
      await conn.execute("ALTER TABLE `division` ADD `torneo_id` INT UNSIGNED NULL;");
      console.log("OK: columna division.torneo_id creada");
    } else {
      console.log("SKIP: columna division.torneo_id ya existe");
    }

    if (!(await existsIndex(orm, "division", "division_torneo_id_index"))) {
      await conn.execute("ALTER TABLE `division` ADD INDEX `division_torneo_id_index` (`torneo_id`);");
      console.log("OK: índice division_torneo_id_index creado");
    } else {
      console.log("SKIP: índice division_torneo_id_index ya existe");
    }

    if (!(await existsForeignKey(orm, "division", "division_torneo_id_foreign"))) {
      await conn.execute(
        "ALTER TABLE `division` ADD CONSTRAINT `division_torneo_id_foreign` FOREIGN KEY (`torneo_id`) REFERENCES `torneo` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;"
      );
      console.log("OK: FK division_torneo_id_foreign creada");
    } else {
      console.log("SKIP: FK division_torneo_id_foreign ya existe");
    }

    if (!(await existsColumn(orm, "inscripcion", "division_id"))) {
      await conn.execute("ALTER TABLE `inscripcion` ADD `division_id` INT UNSIGNED NULL;");
      console.log("OK: columna inscripcion.division_id creada");
    } else {
      console.log("SKIP: columna inscripcion.division_id ya existe");
    }

    if (!(await existsIndex(orm, "inscripcion", "inscripcion_division_id_index"))) {
      await conn.execute(
        "ALTER TABLE `inscripcion` ADD INDEX `inscripcion_division_id_index` (`division_id`);"
      );
      console.log("OK: índice inscripcion_division_id_index creado");
    } else {
      console.log("SKIP: índice inscripcion_division_id_index ya existe");
    }

    if (!(await existsForeignKey(orm, "inscripcion", "inscripcion_division_id_foreign"))) {
      await conn.execute(
        "ALTER TABLE `inscripcion` ADD CONSTRAINT `inscripcion_division_id_foreign` FOREIGN KEY (`division_id`) REFERENCES `division` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;"
      );
      console.log("OK: FK inscripcion_division_id_foreign creada");
    } else {
      console.log("SKIP: FK inscripcion_division_id_foreign ya existe");
    }
  } finally {
    await orm.close(true);
  }
}

run().catch((error) => {
  console.error("ERROR syncDivisionInscripcionColumns:", error);
  process.exit(1);
});
