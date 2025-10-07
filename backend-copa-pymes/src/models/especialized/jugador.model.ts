import { Entity, Property } from '@mikro-orm/core';
import { Usuario, UsuarioRole } from '../usuario.model';

@Entity({ discriminatorValue: UsuarioRole.JUGADOR })
export class Jugador extends Usuario {
  @Property()
  posicion!: string; // arquero, defensor, mediocampista, delantero

  @Property({ unique: true })
  numero_camiseta!: number;

  @Property({ nullable: true })
  equipo_id?: number; // Referencia al equipo

  @Property({ nullable: true })
  fecha_inicio_club?: Date; // Fecha de inicio en el club actual

  @Property({ default: 0 })
  goles_marcados: number = 0;

  @Property({ default: 0 })
  tarjetas_amarillas: number = 0;

  @Property({ default: 0 })
  tarjetas_rojas: number = 0;

  @Property({ default: 0 })
  partidos_jugados: number = 0;

  @Property({ default: true })
  disponible: boolean = true; // Si está disponible para jugar

  @Property({ nullable: true })
  lesion_actual?: string; // Descripción de lesión actual si existe

  constructor() {
    super();
  }

  // Métodos específicos para jugadores
  marcarGol(): void {
    this.goles_marcados++;
  }

  recibirTarjetaAmarilla(): void {
    this.tarjetas_amarillas++;
  }

  recibirTarjetaRoja(): void {
    this.tarjetas_rojas++;
    this.disponible = false; // Suspendido temporalmente
  }

  registrarPartido(): void {
    this.partidos_jugados++;
  }

  lesionarse(descripcion: string): void {
    this.lesion_actual = descripcion;
    this.disponible = false;
  }

  recuperarse(): void {
    this.lesion_actual = undefined;
    this.disponible = true;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      posicion: this.posicion,
      numero_camiseta: this.numero_camiseta,
      equipo_id: this.equipo_id,
      fecha_inicio_club: this.fecha_inicio_club,
      goles_marcados: this.goles_marcados,
      tarjetas_amarillas: this.tarjetas_amarillas,
      tarjetas_rojas: this.tarjetas_rojas,
      partidos_jugados: this.partidos_jugados,
      disponible: this.disponible,
      lesion_actual: this.lesion_actual
    };
  }
}