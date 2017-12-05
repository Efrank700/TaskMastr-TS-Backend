import {Entity, Column, OneToOne, JoinColumn, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {keyStore} from "./KeyStoreDB";
import {User} from "./UserDBLink"
import {eventMaterial} from "./MaterialDBLink"

@Entity()
export class DBEvent{
    @PrimaryGeneratedColumn()
    EventId: number;

    @Column({
        type: "varchar",
        length: 100,
        unique: true
    })
    eventName: string;

    @OneToOne(type => keyStore, key => key.key, {
        cascadeRemove: true,
        onDelete: "CASCADE"
    })
    @JoinColumn()
    adminKey: number;
    
    @OneToOne(type => keyStore, key => key.key, {
        cascadeRemove: true,
        onDelete: "CASCADE"
    })
    @JoinColumn()
    supervisorKey: number;

    @OneToOne(type => keyStore, key => key.key, {
        cascadeRemove: true,
        onDelete: "CASCADE"
    })
    @JoinColumn()
    runnerKey: number;

    @Column({
        type: "varchar"
    })
    ownerName: string;

    @OneToMany(type => eventMaterial, mat=>mat.eventId)
    materials: eventMaterial[];

    @OneToMany(type => User, user => user.userID)
    users: User[];
}