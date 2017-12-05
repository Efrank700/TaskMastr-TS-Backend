import {PrimaryGeneratedColumn, Entity,  Column,  OneToOne,  JoinColumn,  ManyToOne,  Index} from 'typeorm';
import {keyStore} from "./KeyStoreDB";
import {DBEvent} from "./EventDBLink";

@Entity()
@Index(["eventName", "materialName"], {unique: true})
export class eventMaterial{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar"
    })
    materialName: string;

    @Column({
        type: "integer"
    })
    materialCount: number;

    @ManyToOne(type=>DBEvent, event=>event.EventId)
    eventId: number;
}