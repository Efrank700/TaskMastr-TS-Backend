import "reflect-metadata";
import {DBEvent} from "./EventDBLink";
import {User} from "./UserDBLink";
import {keyStore} from "./KeyStoreDB";
import {eventMaterial} from "./MaterialDBLink";
import {TaskMastrEvent, participant, admin, supervisor, runner, task} from "../Event";
import {participantTypes} from "../Participant";
import {createConnection, Connection} from "typeorm";

class DBManager {
    private static async generateKey() : Promise<number> {
        try {
            const connection = await createConnection();
            let keyVal = Math.round(Math.random() * 9999999999);
            const keyStoreRepo = connection.manager.getRepository(keyStore);
            let exists = await keyStoreRepo.count({key: keyVal});
            while(exists > 0) {
                keyVal = Math.round(Math.random() * 9999999999);
                exists = await keyStoreRepo.count({key: keyVal});
            }
            keyStoreRepo.save({key: keyVal})
            return keyVal;
        }
        catch (error) {
            throw new Error(error);
        }
    }

    public static async generateKeys() : Promise<[number, number, number]> {
        try {
            const adKey = await this.generateKey();
            const supKey = await this.generateKey();
            const runKey = await this.generateKey();
            return [adKey, supKey, runKey];
        } catch (error) {
            throw new Error(error);
        }
    }

    public static async nameIsAvailable(proposedName: string) : Promise<boolean> {
        try {
            const connection = await createConnection();
            const eventConnection = await connection.manager.getRepository(DBEvent);
            const avaiableCount = await eventConnection.count({eventName: proposedName});
            return(avaiableCount == 0)
        } catch (e) {
            throw new Error(e);
        } 
    }
}