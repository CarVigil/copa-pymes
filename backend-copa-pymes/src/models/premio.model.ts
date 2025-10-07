import { Entity, Property, ManyToOne, PrimaryKey } from '@mikro-orm/core';
import { Torneo } from './torneo.model';

@Entity()
export class Premio {
    @PrimaryKey()
    fecha_entrega!: Date;

    @ManyToOne(() => Torneo, { primary: true })
    torneo!: Torneo;

    @Property()
    nombre!: string;

    @Property({ nullable: true })
    descripcion?: string;

    @Property()
    posicion!: string;
}