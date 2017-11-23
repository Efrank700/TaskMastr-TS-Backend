import {PrimaryGeneratedColumn, Entity,  Column,  ManyToOne,  Index} from 'typeorm';
import {DBEvent} from "./EventDBLink";
import {participantTypes} from "../Participant";

@Entity()
@Index(["eventName", "username"], {unique: true})
@Index(["eventName", "screenName"], {unique: true})
export class User{

    @PrimaryGeneratedColumn()
    userID: number;


    @ManyToOne(type => DBEvent, event => event.EventId)
    eventID: number;

    @Column({
        type: "varchar",
        length: 100
    })
    username: string;

    @Column({
        type: "varchar",
        length: 100
    })
    screenName: string;

    @Column({
        type: "varchar",
        length: 100
    })
    password: string;

    @Column({
        type: "integer"
    })
    userType: participantTypes
}

