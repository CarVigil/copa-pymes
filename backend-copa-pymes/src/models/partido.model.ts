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

  @ManyToOne(() => Equipo)
  equipo1!: Equipo;

  @ManyToOne(() => Equipo)
  equipo2!: Equipo;

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
}
