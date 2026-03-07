import { Migration } from '@mikro-orm/migrations';

export class Migration20260307200000 extends Migration {

  override async up(): Promise<void> {
    this.addSql('alter table `division` add `torneo_id` int unsigned null;');
    this.addSql('alter table `division` add index `division_torneo_id_index`(`torneo_id`);');
    this.addSql('alter table `division` add constraint `division_torneo_id_foreign` foreign key (`torneo_id`) references `torneo` (`id`) on update cascade on delete set null;');

    this.addSql('alter table `inscripcion` add `division_id` int unsigned null;');
    this.addSql('alter table `inscripcion` add index `inscripcion_division_id_index`(`division_id`);');
    this.addSql('alter table `inscripcion` add constraint `inscripcion_division_id_foreign` foreign key (`division_id`) references `division` (`id`) on update cascade on delete set null;');
  }

  override async down(): Promise<void> {
    this.addSql('alter table `inscripcion` drop foreign key `inscripcion_division_id_foreign`;');
    this.addSql('alter table `inscripcion` drop index `inscripcion_division_id_index`;');
    this.addSql('alter table `inscripcion` drop column `division_id`;');

    this.addSql('alter table `division` drop foreign key `division_torneo_id_foreign`;');
    this.addSql('alter table `division` drop index `division_torneo_id_index`;');
    this.addSql('alter table `division` drop column `torneo_id`;');
  }

}
