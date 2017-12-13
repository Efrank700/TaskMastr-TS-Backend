import * as mongoose from "mongoose";
import {eventStore} from './EventStore';
import {keyStore} from './KeyStore';
import {participantTypes} from '../Participant';
import {TaskMastrEvent} from '../Event'

mongoose.connect('mongodb://127.0.0.1:27017');

class MongoDriver {

    private static async generateKey(): Promise<number> {
        try {
            let num = Math.round(Math.random() * 999999999);
            let count = await keyStore.count({'key': num});
            while(count > 0) {
                let num = Math.round(Math.random() * 999999999);
                let count = await keyStore.count({'key': num});
            }
            const toStore = new keyStore({key: num});
            toStore.save();
            return num;
        } catch (error) {
            throw new Error(error);
        }
    }

    public static async generateKeySet(): Promise<number[]> {
        try {
            let res = [await this.generateKey(), await this.generateKey(), await this.generateKey()];
            return res;
        } catch (error) {
            throw new Error(error);
        }
    }



    public static async retrieveEvent(evKey: number): Promise<TaskMastrEvent | null> {
        try {
            let res = await eventStore.findOne().or([{adminKey: evKey}, {supervisorKey: evKey}, {runnerKey: evKey}]);
                if(res === null) return null;
                const evName = res.eventName;
                const keys = [res.adminKey, res.supervisorKey, res.runnerKey];
                const materials = res.materials;
                const owner = res.owner;
                let newEV = new TaskMastrEvent(evName, keys[0], keys[1], keys[2], owner, materials);
                return newEV;
        } catch (error) {
            throw new Error
        }
    }
}