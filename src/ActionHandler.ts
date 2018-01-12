import {MongoDriver} from "./DBDriver/DBDriver";
import * as mongoose from 'mongoose';
import {EventManager} from "./EventManager";
import {TaskMastrEvent, admin, supervisor, runner, task} from "./Event";
import {participantTypes} from "./Participant";

mongoose.connection.on('error', console.error.bind(console, "MONGO ERROR"));
export class ActionHandler {
    
    private events: EventManager;
    constructor() {
        this.events = new EventManager();
        let connectPromise = mongoose.connect('mongodb://127.0.0.1:27017', {useMongoClient: true});
        while(connectPromise.connection !== undefined && connectPromise.connection.readyState == 2);
    }

    public async addUser(user: string, screen: string, pass: string, eventKey: number): Promise<boolean | null> {
        try {
            let findEVPromise = MongoDriver.addUser(eventKey, user, screen, pass);
            let event = this.events.findEventByKey(eventKey);
            if(event === null) {
                let retrieveEventPromise = MongoDriver.retrieveEvent(eventKey);
                let findEV: participantTypes | null;
                let errCode: string;
                try {
                    findEV = await findEVPromise;
                } catch (error) {
                    let castError = error as Error;

                }
                if(findEV === null) return null;

            }
        } catch (error) {
            
        }
    }
}