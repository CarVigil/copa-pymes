import { BaseModel } from "../shared/db/baseModel.model";
import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { Torneo } from "./torneo.model";
import { Equipo } from "./equipo.model";
import { Division } from "./division.model";

@Entity()
export class Inscripcion extends BaseModel {
  @ManyToOne(() => Torneo)
  torneo!: Torneo;

  @ManyToOne(() => Equipo)
  equipo!: Equipo;

  @ManyToOne(() => Division, { nullable: true })
  division?: Division;

  @Property({ default: 'pendiente' })
  estado: 'pendiente' | 'aceptada' | 'rechazada' = 'pendiente';

  @Property({ type: 'date', nullable: true })
  fechaInscripcion?: Date = new Date();
}
