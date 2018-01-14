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

    public async addUser(user: string, screen: string, pass: string, socket: number,  eventKey: number, location?: string): Promise<[boolean, participantTypes] | null> {
        try {
            let findEVPromise = MongoDriver.addUser(eventKey, user, screen, pass);
            let retrieveEventPromise = MongoDriver.retrieveEvent(eventKey);
            let event = this.events.findEventByKey(eventKey);
            if(event === null) {
                let event = await retrieveEventPromise;
                if(event === null) return null;
                this.events.addEvent(event);
            }
            let findEV: participantTypes | null | undefined;
                let errCode: string = "";
                try {
                    findEV = await findEVPromise;
                } catch (error) {
                    let castError = error as Error;
                    findEV = undefined;
                    errCode = castError.message;
                }
                if(findEV === null) return null;
                if(findEV === undefined) {
                    if(errCode === "SUEXISTS") {
                        return [false, participantTypes.admin];
                    }
                    else return null;
                }
                let targetEvent = this.events.findEventByKey(eventKey)
                if(targetEvent === null) return null;
                if(findEV === participantTypes.admin) {
                    let adminLocation = location === undefined ? null : location;
                    let adminToAdd: admin = {screenName: screen, 
                                                roomName: targetEvent,
                                                location: adminLocation,
                                                tasks: [],
                                                socketId: socket};
                    let success = this.events.addAdmin(adminToAdd);
                    if(success === null) return null;
                    return([true, findEV]);
                }
                else if(findEV === participantTypes.supervisor) {
                    if(location === undefined) return [false, participantTypes.supervisor];
                    let supervisorToAdd: supervisor = {screenName: screen,
                                                        roomName: targetEvent,
                                                        location: location,
                                                        tasks: [],
                                                        socketId: socket};
                    let success = this.events.addSupervisor(supervisorToAdd);
                    if(success === null) return null;
                    return([true, findEV]);
                }
                else {
                    let runnerToAdd: runner = {screenName: screen,
                                                roomName: targetEvent,
                                                task: null,
                                                socketId: socket};
                    let success = this.events.addRunner(runnerToAdd);
                    if(success === null) return null;
                    return([true, findEV]);
                }
        } catch (error) {
            throw new Error(error);
        }
    }
}