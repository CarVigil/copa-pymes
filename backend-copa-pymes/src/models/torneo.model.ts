import { BaseModel } from "../shared/db/baseModel.model";
import { Entity, ManyToMany, Property } from "@mikro-orm/core";
import { Collection } from "@mikro-orm/core";
import { Inscripcion } from "./inscripcion.model";
import { OneToMany } from "@mikro-orm/core";

@Entity()
export class Torneo extends BaseModel {
  @Property()
  nombre!: string;

  @Property()
  tipo!: "eliminatorio" | "todos_contra_todos";

  @Property()
  modalidad!: "futbol5" | "futbol8" | "futbol11";

  @Property({ nullable: true })
  cantidad_divisiones?: number;

  @Property({ nullable: true })
  cantidad_equipos?: number;

  @Property({ nullable: true, columnType: 'date' })
  fecha_inicio?: Date;

  @Property({ nullable: true, columnType: 'date' })
  fecha_fin?: Date;

  @Property({ default: 'pendiente' })
  estado: 'pendiente' | 'inscripciones_abiertas' | 'activo' | 'finalizado' = 'pendiente';

  @OneToMany(() => Inscripcion, inscripcion => inscripcion.torneo)
  inscripciones = new Collection<Inscripcion>(this);
}
