import { Migration } from '@mikro-orm/migrations';

export class Migration20251010214012 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create schema if not exists \`copa_pymes\`;`);
    this.addSql(`create table \`copa_pymes\`.\`division\` (\`id\` int unsigned not null auto_increment primary key, \`nombre\` varchar(255) null, \`cupo\` varchar(255) null) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`copa_pymes\`.\`equipo\` (\`id\` int unsigned not null auto_increment primary key, \`nombre\` varchar(255) not null, \`sigla\` varchar(255) not null, \`estado\` tinyint(1) not null default true, \`escudo\` varchar(255) null) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`copa_pymes\`.\`sede\` (\`id\` int unsigned not null auto_increment primary key, \`nombre\` varchar(255) null, \`ubicacion\` varchar(255) null, \`capacidad\` varchar(255) null) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`copa_pymes\`.\`torneo\` (\`id\` int unsigned not null auto_increment primary key, \`nombre\` varchar(255) not null, \`tipo\` varchar(255) not null, \`modalidad\` varchar(255) not null, \`cantidad_divisiones\` int null, \`cantidad_equipos\` int null, \`fecha_inicio\` date null, \`fecha_fin\` date null, \`estado\` varchar(255) not null default 'pendiente') default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`copa_pymes\`.\`premio\` (\`id\` int unsigned not null auto_increment primary key, \`fecha_entrega\` datetime not null, \`torneo_id\` int unsigned not null, \`nombre\` varchar(255) not null, \`descripcion\` varchar(255) null, \`posicion\` varchar(255) not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`copa_pymes\`.\`premio\` add index \`premio_torneo_id_index\`(\`torneo_id\`);`);

    this.addSql(`create table \`copa_pymes\`.\`inscripcion\` (\`id\` int unsigned not null auto_increment primary key, \`torneo_id\` int unsigned not null, \`equipo_id\` int unsigned not null, \`estado\` varchar(255) not null default 'pendiente', \`fecha_inscripcion\` date null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`copa_pymes\`.\`inscripcion\` add index \`inscripcion_torneo_id_index\`(\`torneo_id\`);`);
    this.addSql(`alter table \`copa_pymes\`.\`inscripcion\` add index \`inscripcion_equipo_id_index\`(\`equipo_id\`);`);

    this.addSql(`create table \`copa_pymes\`.\`usuario\` (\`id\` int unsigned not null auto_increment primary key, \`email\` varchar(255) not null, \`password\` varchar(255) not null, \`nombre\` varchar(255) not null, \`apellido\` varchar(255) not null, \`role\` enum('administrador', 'gestor', 'recepcionista', 'arbitro', 'jugador') not null, \`activo\` tinyint(1) not null default true, \`ultimo_login\` datetime null, \`documento\` varchar(255) null, \`telefono\` varchar(255) null, \`fecha_nacimiento\` datetime null, \`nivel_acceso\` varchar(255) null, \`departamento\` varchar(255) null, \`turno\` varchar(255) null, \`categoria\` varchar(255) null, \`numero_licencia\` varchar(255) null, \`especialidad\` varchar(255) null, \`posicion\` varchar(255) null, \`numero_camiseta\` int null, \`equipo_id\` int null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`copa_pymes\`.\`usuario\` add unique \`usuario_email_unique\`(\`email\`);`);
    this.addSql(`alter table \`copa_pymes\`.\`usuario\` add index \`usuario_role_index\`(\`role\`);`);

    this.addSql(`create table \`copa_pymes\`.\`partido\` (\`id\` int unsigned not null auto_increment primary key, \`torneo_id\` int unsigned not null, \`equipo1_id\` int unsigned not null, \`equipo2_id\` int unsigned not null, \`sede_id\` int unsigned null, \`arbitro_id\` int unsigned null, \`goles_equipo1\` int null, \`goles_equipo2\` int null, \`estado\` varchar(255) not null default 'pendiente') default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`copa_pymes\`.\`partido\` add index \`partido_torneo_id_index\`(\`torneo_id\`);`);
    this.addSql(`alter table \`copa_pymes\`.\`partido\` add index \`partido_equipo1_id_index\`(\`equipo1_id\`);`);
    this.addSql(`alter table \`copa_pymes\`.\`partido\` add index \`partido_equipo2_id_index\`(\`equipo2_id\`);`);
    this.addSql(`alter table \`copa_pymes\`.\`partido\` add index \`partido_sede_id_index\`(\`sede_id\`);`);
    this.addSql(`alter table \`copa_pymes\`.\`partido\` add index \`partido_arbitro_id_index\`(\`arbitro_id\`);`);

    this.addSql(`alter table \`copa_pymes\`.\`premio\` add constraint \`premio_torneo_id_foreign\` foreign key (\`torneo_id\`) references \`copa_pymes\`.\`torneo\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`copa_pymes\`.\`inscripcion\` add constraint \`inscripcion_torneo_id_foreign\` foreign key (\`torneo_id\`) references \`copa_pymes\`.\`torneo\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`copa_pymes\`.\`inscripcion\` add constraint \`inscripcion_equipo_id_foreign\` foreign key (\`equipo_id\`) references \`copa_pymes\`.\`equipo\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`copa_pymes\`.\`partido\` add constraint \`partido_torneo_id_foreign\` foreign key (\`torneo_id\`) references \`copa_pymes\`.\`torneo\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`copa_pymes\`.\`partido\` add constraint \`partido_equipo1_id_foreign\` foreign key (\`equipo1_id\`) references \`copa_pymes\`.\`equipo\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`copa_pymes\`.\`partido\` add constraint \`partido_equipo2_id_foreign\` foreign key (\`equipo2_id\`) references \`copa_pymes\`.\`equipo\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`copa_pymes\`.\`partido\` add constraint \`partido_sede_id_foreign\` foreign key (\`sede_id\`) references \`copa_pymes\`.\`sede\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`copa_pymes\`.\`partido\` add constraint \`partido_arbitro_id_foreign\` foreign key (\`arbitro_id\`) references \`copa_pymes\`.\`usuario\` (\`id\`) on update cascade on delete set null;`);
  }

}
