import {Entity, Column, OneToOne} from "typeorm";
import {keyStore} from "./KeyStoreDB";

@Entity()
export class DBEvent{
    @Column({
        primary: true,
        type: "varchar",
        length: 100,
        unique: true
    })
    eventName: string;

    @OneToOne(type => keyStore, {
        cascadeRemove: true,
        onDelete: "CASCADE"
    })
    @Column({
        unique: true,
        type: "integer"
    })
    adminKey: number;
    
    @OneToOne(type => keyStore, {
        cascadeRemove: true,
        onDelete: "CASCADE"
    })
    @Column({
        unique: true,
        type: "integer"
    })
    supervisorKey: number;

    @OneToOne(type => keyStore, {
        cascadeRemove: true,
        onDelete: "CASCADE"
    })
    @Column({
        unique: true,
        type: "integer"
    })
    runnerKey: number;
}