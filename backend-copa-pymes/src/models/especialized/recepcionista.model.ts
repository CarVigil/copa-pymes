import { Entity, Property } from '@mikro-orm/core';
import { Usuario, UsuarioRole } from '../usuario.model';

@Entity({ discriminatorValue: UsuarioRole.RECEPCIONISTA })
export class Recepcionista extends Usuario {
  @Property({ nullable: true })
  turno?: string; // mañana, tarde, noche

  @Property({ nullable: true })
  fecha_ingreso?: Date;

  @Property({ default: true })
  puede_cargar_asistencia: boolean = true;

  @Property({ default: true })
  puede_cargar_resultados: boolean = true;

  @Property({ default: false })
  puede_crear_partidos: boolean = false;

  constructor() {
    super();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      turno: this.turno,
      fecha_ingreso: this.fecha_ingreso,
      puede_cargar_asistencia: this.puede_cargar_asistencia,
      puede_cargar_resultados: this.puede_cargar_resultados,
      puede_crear_partidos: this.puede_crear_partidos
    };
  }
}