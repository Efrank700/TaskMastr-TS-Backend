import "reflect-metadata";
import * as bcryptjs from "bcryptjs";
import {DBEvent} from "./EventDBLink";
import {User} from "./UserDBLink";
import {keyStore} from "./KeyStoreDB";
import {eventMaterial} from "./MaterialDBLink";
import {TaskMastrEvent, participant, admin, supervisor, runner, task} from "../Event";
import {participantTypes} from "../Participant";
import {createConnection, Connection} from "typeorm";
import { PromiseUtils } from "typeorm/util/PromiseUtils";

export class DBManager {
    private connection: Connection;
    public constructor(connection: Connection) {
        this.connection = connection;
    }


    private async generateKey() : Promise<number> {
        try {
            let keyVal = Math.round(Math.random() * 9999999999);
            const keyStoreRepo = this.connection.manager.getRepository(keyStore);
            let exists = await keyStoreRepo.count({key: keyVal});
            while(exists > 0) {
                keyVal = Math.round(Math.random() * 9999999999);
                exists = await keyStoreRepo.count({key: keyVal});
            }
            keyStoreRepo.save({key: keyVal});
            return keyVal;
        }
        catch (error) {
            throw new Error(error);
        }
    }

    public async generateKeys() : Promise<[number, number, number]> {
        try {
            const adKey = await this.generateKey();
            const supKey = await this.generateKey();
            const runKey = await this.generateKey();
            return [adKey, supKey, runKey];
        } catch (error) {
            throw new Error(error);
        }
    }

    private async getEventFromCode(eventCode: number): Promise<[DBEvent, participantTypes] | null> {
        try {
            const eventManager = await this.connection.manager.getRepository(DBEvent);
            let codeType = participantTypes.admin;
            let foundEvent = await eventManager.findOne({adminKey: eventCode});
            if(foundEvent != undefined) codeType = participantTypes.admin;
            else {
                foundEvent = await eventManager.findOne({supervisorKey: eventCode});
                if(foundEvent != undefined) codeType = participantTypes.supervisor;
                else {
                    foundEvent = await eventManager.findOne({runnerKey: eventCode});
                    if(foundEvent != undefined) codeType = participantTypes.runner;
                }
            }
            if(foundEvent === undefined) return null;
            else return([foundEvent, codeType]);
        } catch (error) {
            throw new Error(error);
        }

    }

    private async getEventFromName(eventName: string): Promise<DBEvent | null> {
        try {
            const eventManager = await this.connection.manager.getRepository(DBEvent);
            let foundEvent = await eventManager.findOne({eventName: eventName});
            if(foundEvent === undefined) return null;
            return foundEvent;
        } catch (error) {
            throw new Error(error);
        }
    }

    public async nameIsAvailable(proposedName: string) : Promise<boolean> {
        try {
            const eventConnection = await this.connection.manager.getRepository(DBEvent);
            const avaiableCount = await eventConnection.count({eventName: proposedName});
            return(avaiableCount == 0)
        } catch (e) {
            throw new Error(e);
        } 
    }

    public async createEvent(eventName: string, owner: admin, ownerUN: string, ownerPass: string) : Promise<TaskMastrEvent> {
        try {
            const keySet = await this.generateKeys();
            let event: TaskMastrEvent = new TaskMastrEvent(eventName, keySet[0], keySet[1], keySet[2], 
                                                           owner, []);
            const eventConnection = await this.connection.manager.getRepository(DBEvent);
            const eventToSave = new DBEvent();
            eventToSave.adminKey = event.$adminKey;
            eventToSave.eventName = event.$eventName;
            eventToSave.materials = [];
            eventToSave.ownerName = event.$owner;
            eventToSave.runnerKey = event.$runnerKey;
            eventToSave.supervisorKey = event.$supervisorKey;
            eventToSave.users = [];
            eventConnection.save(eventToSave);
            owner.roomName = eventName;
            const userConnection = await this.connection.manager.getRepository(User);
            let userToSave = new User();
            userToSave.eventID = eventToSave.EventId;
            userToSave.password = ownerPass;
            userToSave.screenName = owner.screenName;
            userToSave.username = ownerUN;
            userToSave.userType = participantTypes.admin;
            userConnection.save(userToSave);
            return event;
        } catch (error) {
            throw new Error(error);
        }
    }

    public async screenNameAvaiable(eventCode: number, screenName: string): Promise<Boolean | null> {
        const eventManager = await this.connection.manager.getRepository(DBEvent);
        let eventID;
        let foundEvent = await eventManager.findOne({adminKey: eventCode});
        if(foundEvent != undefined) eventID = foundEvent.EventId;
        else {
            foundEvent = await eventManager.findOne({supervisorKey: eventCode});
            if(foundEvent != undefined) eventID = foundEvent.EventId;
            else {
                foundEvent = await eventManager.findOne({runnerKey: eventCode});
                if(foundEvent != undefined) eventID = foundEvent.EventId;
            }
        }
        if(foundEvent == undefined) {
            return null;
        }
        let userManager = await this.connection.manager.getRepository(User);
        let exists = await userManager.findOne({eventID: eventID, screenName: screenName});
        return(exists == undefined);
    }

    public async userNameAvailable(eventCode: number, username: string): Promise<Boolean | null> {
        const eventManager = await this.connection.manager.getRepository(DBEvent);
        let eventID;
        let foundEvent = await eventManager.findOne({adminKey: eventCode});
        if(foundEvent != undefined) eventID = foundEvent.EventId;
        else {
            foundEvent = await eventManager.findOne({supervisorKey: eventCode});
            if(foundEvent != undefined) eventID = foundEvent.EventId;
            else {
                foundEvent = await eventManager.findOne({runnerKey: eventCode});
                if(foundEvent != undefined) eventID = foundEvent.EventId;
            }
        }
        if(foundEvent == undefined) {
            return null;
        }
        let userManager = await this.connection.manager.getRepository(User);
        let exists = await userManager.findOne({eventID: eventID, username: username});
        return(exists == undefined);
    }

    public async createUser(eventCode: number, username: string, screenName: string, password: string): Promise<participant | null> {
        let event: [DBEvent, participantTypes] | null;
        try {
            event = await this.getEventFromCode(eventCode);
            if(event === null) return null;

        } catch (error) {
            throw new Error(error)
        }
        try {
            let salt = await bcryptjs.genSalt();
            let hashedPass = await bcryptjs.hash(password, salt);
            const user: User = new User();
            user.eventID = event[0].EventId;
            user.password = hashedPass;
            user.screenName = screenName;
            user.username = username;
            user.userType = event[1];
            const userLink = this.connection.manager.getRepository(User);
            await userLink.save(user);
        } catch (error) {
            throw new Error(error);
        }

        if(event[1] === participantTypes.admin) {
            let retAdmin: admin = {screenName: screenName, roomName: event[0].eventName, 
                                   location: null, tasks: [], socketId: -1};
            return retAdmin; 
        }
        else if(event[1] === participantTypes.supervisor) {
            let retSup: supervisor = {screenName: screenName, roomName: event[0].eventName, 
                location: "null", tasks: [], socketId: -1};
            return retSup;
        }
        else {
            let retRunner: runner = {screenName: screenName, roomName: event[0].eventName, 
                                     task: null, socketId: -1};
            return retRunner;
        }
    }

    public async addMaterials(eventName: string, materialName: string, quantitiy: number): Promise<[boolean, number] | null> {
        let event: DBEvent | null;
        try {
            event = await this.getEventFromName(eventName);
            if(event === null) return null;
        } catch (error) {
            throw new Error(error);
        }
        try {
            let eventID = event.EventId;
            const materialManager = this.connection.manager.getRepository(eventMaterial);
            let material = await materialManager.findOne({eventId: eventID, materialName: materialName});
            if(material === undefined) {
                let matToSubmit = new eventMaterial();
                matToSubmit.eventId = eventID;
                matToSubmit.materialCount = quantitiy;
                matToSubmit.materialName = materialName;
                materialManager.save(matToSubmit);
                return([false, quantitiy]);
            }
            else {
                material.materialCount += quantitiy;
                materialManager.updateById(material.eventId, {materialCount: material.materialCount});
                return([true, material.materialCount]);
            }
        } catch (error) {
            throw new Error(error);
        }
    }

    public async userLogin(eventCode: number, username: string, password: string): Promise<[boolean, string]> {
        let event: [DBEvent, participantTypes] | null;
        try {
            event = await this.getEventFromCode(eventCode);
        } catch (error) {
            throw new Error(error);
        }
        if(event === null) return [false, "Event not found"];
        try {
            let evID = event[0].EventId;
            let user = await this.connection.getRepository(User).findOne({eventID: evID, username: username});
            if(user === undefined || user.userType != event[1]) {
                return [false, "Username not found"];
            } 
            else {
                if(await bcryptjs.compare(password, user.password)) {
                    return([true, user.screenName]);
                }
                else {
                    return([false, "Password incorrect"]);
                }
            }
        } catch (error) {
            throw new Error(error);
        }
    } 
}