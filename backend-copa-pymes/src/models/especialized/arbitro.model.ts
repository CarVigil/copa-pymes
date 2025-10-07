import { Entity, Property } from '@mikro-orm/core';
import { Usuario, UsuarioRole } from '../usuario.model';

@Entity({ discriminatorValue: UsuarioRole.ARBITRO })
export class Arbitro extends Usuario {
  @Property({ nullable: true })
  categoria?: string; // regional, nacional, internacional

  @Property({ nullable: true })
  fecha_licencia?: Date;

  @Property({ nullable: true })
  numero_licencia?: string;

  @Property({ default: 0 })
  partidos_arbitrados: number = 0;

  @Property({ default: true })
  disponible_para_arbitrar: boolean = true;

  @Property({ nullable: true })
  especialidad?: string; // principal, asistente, cuarto_arbitro

  constructor() {
    super();
  }

  // Métodos específicos para árbitros
  arbitrarPartido(): void {
    this.partidos_arbitrados++;
  }

  suspender(motivo: string): void {
    this.disponible_para_arbitrar = false;
    // Aquí podrías agregar un campo para el motivo de suspensión
  }

  reactivar(): void {
    this.disponible_para_arbitrar = true;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      categoria: this.categoria,
      fecha_licencia: this.fecha_licencia,
      numero_licencia: this.numero_licencia,
      partidos_arbitrados: this.partidos_arbitrados,
      disponible_para_arbitrar: this.disponible_para_arbitrar,
      especialidad: this.especialidad
    };
  }
}