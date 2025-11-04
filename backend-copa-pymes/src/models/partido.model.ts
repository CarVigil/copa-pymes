import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Torneo } from './torneo.model';
import { Equipo } from './equipo.model';
import { Sede } from './sede.model';
import { Usuario } from './usuario.model';

@Entity()
export class Partido {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true, columnType: 'date' })
  fecha?: Date;

  @ManyToOne(() => Torneo)
  torneo!: Torneo;

  @ManyToOne(() => Equipo, { nullable: true })
  equipo1?: Equipo;

  @ManyToOne(() => Equipo, { nullable: true })
  equipo2?: Equipo;

  @ManyToOne(() => Sede, { nullable: true })
  sede?: Sede;

  @ManyToOne(() => Usuario, { nullable: true })
  arbitro?: Usuario;

  @Property({ nullable: true })
  golesEquipo1?: number;

  @Property({ nullable: true })
  golesEquipo2?: number;

  @Property({ default: 'pendiente' })
  estado: string = 'pendiente'; // pendiente | en_juego | finalizado | suspendido

  // Campos para manejo de llave/bracket del torneo
  @Property({ nullable: true })
  fase?: string; // octavos | cuartos | semifinal | final

  @Property({ nullable: true })
  numeroPartido?: number; // 1, 2, 3, 4 para octavos, etc.

  @Property({ nullable: true })
  equipoGanador?: number; // ID del equipo ganador (null si no hay resultado)

  @ManyToOne(() => Partido, { nullable: true })
  partidoSiguiente?: Partido; // Referencia al partido de la siguiente fase

  @Property({ nullable: true })
  posicionEnSiguiente?: number; // 1 o 2 (equipo1 o equipo2 en el siguiente partido)
}
