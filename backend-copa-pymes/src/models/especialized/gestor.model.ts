import { Entity, Property } from '@mikro-orm/core';
import { Usuario, UsuarioRole } from '../usuario.model';

@Entity({ discriminatorValue: UsuarioRole.GESTOR })
export class Gestor extends Usuario {
  @Property({ nullable: true })
  departamento?: string; // juveniles, primera_division, reserva

  @Property({ nullable: true })
  fecha_nombramiento?: Date;

  @Property({ nullable: true })
  equipos_a_cargo?: string; // JSON string con IDs de equipos

  @Property({ default: true })
  puede_crear_jugadores: boolean = true;

  @Property({ default: true })
  puede_modificar_equipos: boolean = true;

  constructor() {
    super();
  }

  // Métodos específicos para gestores
  asignarEquipo(equipoId: number): void {
    const equipos = this.equipos_a_cargo ? JSON.parse(this.equipos_a_cargo) : [];
    if (!equipos.includes(equipoId)) {
      equipos.push(equipoId);
      this.equipos_a_cargo = JSON.stringify(equipos);
    }
  }

  removerEquipo(equipoId: number): void {
    const equipos = this.equipos_a_cargo ? JSON.parse(this.equipos_a_cargo) : [];
    const index = equipos.indexOf(equipoId);
    if (index > -1) {
      equipos.splice(index, 1);
      this.equipos_a_cargo = JSON.stringify(equipos);
    }
  }

  getEquiposBajoGestion(): number[] {
    return this.equipos_a_cargo ? JSON.parse(this.equipos_a_cargo) : [];
  }

  toJSON() {
    return {
      ...super.toJSON(),
      departamento: this.departamento,
      fecha_nombramiento: this.fecha_nombramiento,
      equipos_a_cargo: this.getEquiposBajoGestion(),
      puede_crear_jugadores: this.puede_crear_jugadores,
      puede_modificar_equipos: this.puede_modificar_equipos
    };
  }
}