import { Migration } from '@mikro-orm/migrations';

export class Migration20251117232129 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`partido\` (\`id\` int unsigned not null auto_increment primary key, \`fecha\` date null, \`torneo_id\` int unsigned not null, \`equipo1_id\` int unsigned null, \`equipo2_id\` int unsigned null, \`sede_id\` int unsigned null, \`arbitro_id\` int unsigned null, \`goles_equipo1\` int null, \`goles_equipo2\` int null, \`estado\` varchar(255) not null default 'pendiente', \`fase\` varchar(255) null, \`numero_partido\` int null, \`equipo_ganador\` int null, \`partido_siguiente_id\` int unsigned null, \`posicion_en_siguiente\` int null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`partido\` add index \`partido_torneo_id_index\`(\`torneo_id\`);`);
    this.addSql(`alter table \`partido\` add index \`partido_equipo1_id_index\`(\`equipo1_id\`);`);
    this.addSql(`alter table \`partido\` add index \`partido_equipo2_id_index\`(\`equipo2_id\`);`);
    this.addSql(`alter table \`partido\` add index \`partido_sede_id_index\`(\`sede_id\`);`);
    this.addSql(`alter table \`partido\` add index \`partido_arbitro_id_index\`(\`arbitro_id\`);`);
    this.addSql(`alter table \`partido\` add index \`partido_partido_siguiente_id_index\`(\`partido_siguiente_id\`);`);

    this.addSql(`alter table \`partido\` add constraint \`partido_torneo_id_foreign\` foreign key (\`torneo_id\`) references \`torneo\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`partido\` add constraint \`partido_equipo1_id_foreign\` foreign key (\`equipo1_id\`) references \`equipo\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`partido\` add constraint \`partido_equipo2_id_foreign\` foreign key (\`equipo2_id\`) references \`equipo\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`partido\` add constraint \`partido_sede_id_foreign\` foreign key (\`sede_id\`) references \`sede\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`partido\` add constraint \`partido_arbitro_id_foreign\` foreign key (\`arbitro_id\`) references \`usuario\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`partido\` add constraint \`partido_partido_siguiente_id_foreign\` foreign key (\`partido_siguiente_id\`) references \`partido\` (\`id\`) on update cascade on delete set null;`);

    this.addSql(`alter table \`inscripcion\` drop foreign key \`inscripcion_ibfk_1\`;`);
    this.addSql(`alter table \`inscripcion\` drop foreign key \`inscripcion_ibfk_2\`;`);

    this.addSql(`alter table \`division\` drop primary key;`);

    this.addSql(`alter table \`division\` add primary key \`division_pkey\`(\`id\`);`);

    this.addSql(`alter table \`equipo\` drop primary key;`);

    this.addSql(`alter table \`equipo\` add primary key \`equipo_pkey\`(\`id\`);`);

    this.addSql(`alter table \`sede\` drop primary key;`);

    this.addSql(`alter table \`sede\` add primary key \`sede_pkey\`(\`id\`);`);

    this.addSql(`alter table \`torneo\` drop primary key;`);

    this.addSql(`alter table \`torneo\` add primary key \`torneo_pkey\`(\`id\`);`);

    this.addSql(`alter table \`premio\` drop primary key;`);

    this.addSql(`alter table \`premio\` modify \`fecha_entrega\` datetime not null;`);
    this.addSql(`alter table \`premio\` add constraint \`premio_torneo_id_foreign\` foreign key (\`torneo_id\`) references \`torneo\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`premio\` add primary key \`premio_pkey\`(\`id\`);`);

    this.addSql(`alter table \`inscripcion\` drop primary key;`);

    this.addSql(`alter table \`inscripcion\` add constraint \`inscripcion_torneo_id_foreign\` foreign key (\`torneo_id\`) references \`torneo\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`inscripcion\` add constraint \`inscripcion_equipo_id_foreign\` foreign key (\`equipo_id\`) references \`equipo\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`inscripcion\` add primary key \`inscripcion_pkey\`(\`id\`);`);

    this.addSql(`alter table \`usuario\` drop primary key;`);

    this.addSql(`alter table \`usuario\` modify \`ultimo_login\` datetime, modify \`fecha_nacimiento\` datetime, modify \`equipo_id\` int unsigned;`);
    this.addSql(`alter table \`usuario\` add constraint \`usuario_equipo_id_foreign\` foreign key (\`equipo_id\`) references \`equipo\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`usuario\` add unique \`usuario_email_unique\`(\`email\`);`);
    this.addSql(`alter table \`usuario\` add index \`usuario_role_index\`(\`role\`);`);
    this.addSql(`alter table \`usuario\` add index \`usuario_equipo_id_index\`(\`equipo_id\`);`);
    this.addSql(`alter table \`usuario\` add primary key \`usuario_pkey\`(\`id\`);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`partido\` drop foreign key \`partido_partido_siguiente_id_foreign\`;`);

    this.addSql(`drop table if exists \`partido\`;`);

    this.addSql(`alter table \`inscripcion\` drop foreign key \`inscripcion_torneo_id_foreign\`;`);
    this.addSql(`alter table \`inscripcion\` drop foreign key \`inscripcion_equipo_id_foreign\`;`);

    this.addSql(`alter table \`premio\` drop foreign key \`premio_torneo_id_foreign\`;`);

    this.addSql(`alter table \`usuario\` drop foreign key \`usuario_equipo_id_foreign\`;`);

    this.addSql(`alter table \`division\` drop primary key;`);

    this.addSql(`alter table \`division\` add primary key \`division_pkey\`(\`id\`);`);

    this.addSql(`alter table \`equipo\` drop primary key;`);

    this.addSql(`alter table \`equipo\` add primary key \`equipo_pkey\`(\`id\`);`);

    this.addSql(`alter table \`inscripcion\` drop primary key;`);

    this.addSql(`alter table \`inscripcion\` add primary key \`inscripcion_pkey\`(\`id\`);`);

    this.addSql(`alter table \`premio\` drop primary key;`);

    this.addSql(`alter table \`premio\` modify \`fecha_entrega\` datetime not null;`);
    this.addSql(`alter table \`premio\` add primary key \`premio_pkey\`(\`id\`);`);

    this.addSql(`alter table \`sede\` drop primary key;`);

    this.addSql(`alter table \`sede\` add primary key \`sede_pkey\`(\`id\`);`);

    this.addSql(`alter table \`torneo\` drop primary key;`);

    this.addSql(`alter table \`torneo\` add primary key \`torneo_pkey\`(\`id\`);`);

    this.addSql(`alter table \`usuario\` drop index \`usuario_email_unique\`;`);
    this.addSql(`alter table \`usuario\` drop index \`usuario_role_index\`;`);
    this.addSql(`alter table \`usuario\` drop index \`usuario_equipo_id_index\`;`);
    this.addSql(`alter table \`usuario\` drop primary key;`);

    this.addSql(`alter table \`usuario\` modify \`ultimo_login\` datetime, modify \`fecha_nacimiento\` datetime, modify \`equipo_id\` int;`);
    this.addSql(`alter table \`usuario\` add primary key \`usuario_pkey\`(\`id\`);`);
  }

}
