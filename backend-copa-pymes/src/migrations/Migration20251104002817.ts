import { Migration } from '@mikro-orm/migrations';

export class Migration20251104002817 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`partido\` drop foreign key \`partido_equipo1_id_foreign\`;`);
    this.addSql(`alter table \`partido\` drop foreign key \`partido_equipo2_id_foreign\`;`);

    this.addSql(`alter table \`usuario\` modify \`equipo_id\` int unsigned;`);
    this.addSql(`alter table \`usuario\` add constraint \`usuario_equipo_id_foreign\` foreign key (\`equipo_id\`) references \`equipo\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`usuario\` add index \`usuario_equipo_id_index\`(\`equipo_id\`);`);

    this.addSql(`alter table \`partido\` add \`fase\` varchar(255) null, add \`numero_partido\` int null, add \`equipo_ganador\` int null, add \`partido_siguiente_id\` int unsigned null, add \`posicion_en_siguiente\` int null;`);
    this.addSql(`alter table \`partido\` modify \`equipo1_id\` int unsigned null, modify \`equipo2_id\` int unsigned null;`);
    this.addSql(`alter table \`partido\` add constraint \`partido_partido_siguiente_id_foreign\` foreign key (\`partido_siguiente_id\`) references \`partido\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`partido\` add constraint \`partido_equipo1_id_foreign\` foreign key (\`equipo1_id\`) references \`equipo\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`partido\` add constraint \`partido_equipo2_id_foreign\` foreign key (\`equipo2_id\`) references \`equipo\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`partido\` add index \`partido_partido_siguiente_id_index\`(\`partido_siguiente_id\`);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`usuario\` drop foreign key \`usuario_equipo_id_foreign\`;`);

    this.addSql(`alter table \`partido\` drop foreign key \`partido_partido_siguiente_id_foreign\`;`);
    this.addSql(`alter table \`partido\` drop foreign key \`partido_equipo1_id_foreign\`;`);
    this.addSql(`alter table \`partido\` drop foreign key \`partido_equipo2_id_foreign\`;`);

    this.addSql(`alter table \`usuario\` drop index \`usuario_equipo_id_index\`;`);

    this.addSql(`alter table \`usuario\` modify \`equipo_id\` int;`);

    this.addSql(`alter table \`partido\` drop index \`partido_partido_siguiente_id_index\`;`);
    this.addSql(`alter table \`partido\` drop column \`fase\`, drop column \`numero_partido\`, drop column \`equipo_ganador\`, drop column \`partido_siguiente_id\`, drop column \`posicion_en_siguiente\`;`);

    this.addSql(`alter table \`partido\` modify \`equipo1_id\` int unsigned not null, modify \`equipo2_id\` int unsigned not null;`);
    this.addSql(`alter table \`partido\` add constraint \`partido_equipo1_id_foreign\` foreign key (\`equipo1_id\`) references \`equipo\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`partido\` add constraint \`partido_equipo2_id_foreign\` foreign key (\`equipo2_id\`) references \`equipo\` (\`id\`) on update cascade;`);
  }

}
