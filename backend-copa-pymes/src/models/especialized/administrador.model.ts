import { Entity, Property } from '@mikro-orm/core';
import { Usuario, UsuarioRole } from '../usuario.model';

@Entity({ discriminatorValue: UsuarioRole.ADMINISTRADOR })
export class Administrador extends Usuario {
  @Property({ nullable: true })
  nivel_acceso?: string; // super_admin, admin

  @Property({ nullable: true })
  permisos_especiales?: string; // JSON string con permisos específicos

  @Property({ nullable: true })
  fecha_nombramiento?: Date;

  constructor() {
    super();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      nivel_acceso: this.nivel_acceso,
      permisos_especiales: this.permisos_especiales,
      fecha_nombramiento: this.fecha_nombramiento
    };
  }
}