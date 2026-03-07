import { BaseModel } from '../shared/db/baseModel.model';
import { Collection } from '@mikro-orm/core';
import { Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/core';
import { Torneo } from './torneo.model';
import { Inscripcion } from './inscripcion.model';

@Entity()
export class Division extends BaseModel {
    @Property({ nullable: true })
    nombre!: string;

    @Property({ nullable: true })
    cupo!: string;

    @ManyToOne(() => Torneo, { nullable: true })
    torneo?: Torneo;

    @OneToMany(() => Inscripcion, inscripcion => inscripcion.division)
    inscripciones = new Collection<Inscripcion>(this);

}
