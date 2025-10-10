import { Entity, Property, ManyToOne, PrimaryKey } from '@mikro-orm/core';
import { Torneo } from './torneo.model';
import { BaseModel } from '../shared/db/baseModel.model';

@Entity()
export class Premio extends BaseModel {
    @Property()
    fecha_entrega!: Date;

    @ManyToOne(() => Torneo)
    torneo!: Torneo;

    @Property()
    nombre!: string;

    @Property({ nullable: true })
    descripcion?: string;

    @Property()
    posicion!: string;
}