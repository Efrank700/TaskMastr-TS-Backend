import {Entity, Column} from "typeorm";

@Entity()
export class keyStore {
    @Column({
        type: "integer",
        primary: true,
        unique: true
    })
    key: number;
}