import {MongoDriver} from "./DBDriver/DBDriver";
import {EventManager} from "./EventManager";
import {TaskMastrEvent, admin, supervisor, runner, task, participant} from "./Event";
import {participantTypes} from "./Participant";

export class ActionHandler {
    
    private events: EventManager;
    private manager: MongoDriver;
   
    constructor() {
        this.events = new EventManager();
        this.manager = new MongoDriver();
    }

    public async eventNameAvailable(eventName: string): Promise<boolean> {
        try {
            return MongoDriver.eventNameAvailable(eventName);
        } catch (error) {
            let castError = error as Error
            throw new Error(castError.message);
        }
    }

    public async addEvent(eventName: string, ownerUser: string, ownerPass: string, 
                            ownerScreen: string, ownerSocket: number, ownerLocation: string):
    Promise<[boolean, TaskMastrEvent | null] | null> {
        try {
            let tempAdmin:admin =  {screenName: ownerScreen, socketId: ownerSocket, 
                                    location: ownerLocation, roomName: "irrelevant", tasks: []}
            let available = await MongoDriver.eventNameAvailable(eventName);
            if(!available) return[false, null];
            let eventCreated = await MongoDriver.createEvent(eventName, tempAdmin, ownerUser, ownerPass);
            if(eventCreated === null) return null;
            let retEvent = this.events.addEvent(eventCreated);
            return [true, retEvent];
        } catch (error) {
            let castError = error as Error
            throw new Error(castError.message);
        }
    }

    public removeEvent(eventName: string): TaskMastrEvent | null {
        let event = this.events.removeEvent(eventName);
        return event;
    }

    public async deleteEvent(eventKey: number, authUser: string, authPass: string): 
    Promise<[boolean, TaskMastrEvent | null] | null> {
        try {
            let authenticated = await MongoDriver.authenticateOwner(eventKey, authUser, authPass);
        if(!authenticated) return null;
        let deleteEventPromise = MongoDriver.deleteEventByAdminID(eventKey);
        let targetEventName = this.events.findEventByKey(eventKey);
        let remEvent: TaskMastrEvent | null = null;
        if(targetEventName !== null) {
            remEvent = this.events.removeEvent(targetEventName);
        }
        let deleteEvent = await deleteEventPromise;
        return [deleteEvent, remEvent];
        } catch (error) {
            let castError = error as Error;
            throw new Error(castError.message);
        }
    }

    public async addUserToEvent(user: string, screen: string, pass: string, socket: number,  
        eventKey: number, location?: string): Promise<[boolean, participantTypes] | null> {
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
                let targetEvent = this.events.findEventByKey(eventKey);
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

    public async authenticates(user: string, pass: string, eventKey: number):
                             Promise<[boolean, string, participantTypes]> {
        try {
            return MongoDriver.authenticate(eventKey, user, pass);
        } catch (error) {
            let castError = error as Error;
            throw error;
        }
    }

    public async kickAdmin(authorizingUser: string, authorizingPass: string, 
                             targetScreen: string, eventKey: number): 
                             Promise<[boolean, admin| null, runner| null] | null> {
        try {
            let authenticatePromise = MongoDriver.authenticateOwner(eventKey, 
                                                                    authorizingUser, authorizingPass);
            let eventName = this.events.findEventByKey(eventKey);
            let authenticated = await authenticatePromise;
            if(!authenticated[0]) {
                return null;
            }
            let deletePromise = MongoDriver.deleteAdmin(eventKey, targetScreen);
            let delAdmin: [admin | null, runner | null] | null = null;
            if(eventName !== null) {
                delAdmin = this.events.removeAdmin(targetScreen, eventName);
            }
            let retAdmin: admin|null = null;
            let retRunner: runner|null = null;
            if(delAdmin !== null) {
                retAdmin = delAdmin[0];
                retRunner = delAdmin[1];
            }
            let deleteResolution = await deletePromise;
            if(deleteResolution === null) return([false, retAdmin, retRunner]);
            else return([deleteResolution, retAdmin, retRunner]);
        } catch (error) {
            let castError = error as Error;
            throw new Error(castError.message);
        }
    }

    public async kickSupervisor(authorizingUser: string, authorizingPass: string, 
        targetScreen: string, eventKey: number) : Promise<[boolean, supervisor| null, runner| null] | null> {
        try {
            let authenticatePromise = MongoDriver.authenticate(eventKey, authorizingUser, authorizingPass);
            let eventName = this.events.findEventByKey(eventKey);
            let authenticated = await authenticatePromise;
            if(!authenticated[0] || authenticated[2] != participantTypes.admin) return null;
            let deletePromise = MongoDriver.deleteSupervisor(eventKey, targetScreen);
            let delSupervisor: [supervisor | null, runner | null] | null = null;
            if(eventName !== null) delSupervisor = this.events.removeSupervisor(targetScreen, eventName);
            let retSupervisor: supervisor|null = null;
            let retRunner: runner|null = null;
            if(delSupervisor !== null) {
                retSupervisor = delSupervisor[0];
                retRunner = delSupervisor[1];
            }
            let deleteResolution = await deletePromise;
            if(deleteResolution === null) return([false, retSupervisor, retRunner]);
            else return([deleteResolution, retSupervisor, retRunner]);
        } catch (error) {
            let castError = error as Error;
            throw new Error(castError.message);
        }
    }

    public async kickRunner(authorizingUser: string, authorizingPass: string, 
        targetScreen: string, eventKey: number) : Promise<[boolean, runner| null, task| null] | null> {
        try {
            let authenticatePromise = MongoDriver.authenticate(eventKey, authorizingUser, authorizingPass);
            let eventName = this.events.findEventByKey(eventKey);
            let authenticated = await authenticatePromise;
            if(!authenticated[0] || authenticated[2] != participantTypes.admin) return null;
            let deletePromise = MongoDriver.deleteRunner(eventKey, targetScreen);
            let delRunner: [boolean, runner | null, task | null] | null = null;
            if(eventName !== null) delRunner = this.events.removeRunner(targetScreen, eventName);
            let retRunner: runner|null = null;
            let retTask: task|null = null;
            if(delRunner !== null) {
                retRunner = delRunner[1];
                retTask = delRunner[2];
            }
            let deleteResolution = await deletePromise;
            if(deleteResolution === null) return([false, retRunner, retTask]);
            else return([deleteResolution, retRunner, retTask]);
        } catch (error) {
            let castError = error as Error;
            throw new Error(castError.message);
        }
    }

    public async addMaterials(eventKey: number, materialName: string, quantity: number) :
    Promise<[boolean | null, boolean | null]> {
        try {
            if(quantity <= 0) return [null, null];
            else {
                let additionPromise = MongoDriver.addMaterials(eventKey, materialName, quantity);
                let eventName = this.events.findEventByKey(eventKey);
                if(eventName !== null) {
                    let addition = this.events.addMaterials(eventName, materialName, quantity);
                    let DBaddition = await additionPromise;
                    if(DBaddition === null) return [null, null];
                    return([DBaddition, addition])
                }
                else {
                    return([await additionPromise, null]);
                }
            }
        } catch (error) {
            let castError = error as Error;
            throw new Error(castError.message);
        }
    }

    public async removeMaterials(eventKey: number, materialName: string, quantity: number):
    Promise<[boolean | null, boolean | null]> {
        try {
            if(quantity <= 0) return [null, null];
            else{
                let removalPromise = MongoDriver.removeMaterials(eventKey, materialName, quantity);
                let eventName = this.events.findEventByKey(eventKey);
                if(eventName !== null) {
                    let addition = this.events.removeFreeMaterials(eventName, materialName, quantity);
                    let DBremoval = await removalPromise;
                    if(DBremoval === null) return [null, null];
                    return([DBremoval, addition])
                }
                else {
                    return([await removalPromise, null]);
                }
            }
        } catch (error) {
            let castError = error as Error;
            throw new Error(castError.message);
        }
    }

    public async logUserIn(eventKey: number, user: string, pass: string, socketId: number, location?: string): Promise<[boolean, string, string | null] | null> {
        try{
            let loginPromise = MongoDriver.authenticate(eventKey, user, pass);
            let eventName = this.events.findEventByKey(eventKey);
            let login = await loginPromise;
            if(login === null) return null;
            else if(!login[0]) {
                return([login[0], login[1], null]);
            }
            else {
                if(eventName === null) {
                    let targetEvent = await MongoDriver.retrieveEvent(eventKey);
                    if(targetEvent === null) return null;
                    this.events.addEvent(targetEvent);
                    eventName = targetEvent.$eventName;
                }
                if(login[2] === participantTypes.admin) {
                    let targetLocation: string | null;
                    if(location === undefined) targetLocation = null;
                    else targetLocation = location;
                    let adminToAdd: admin = {screenName: login[1],roomName:eventName, location: targetLocation, tasks: [], socketId: socketId};
                    let adminAdded = this.events.addAdmin(adminToAdd);
                    return([adminToAdd !== null, login[1], eventName]);
                }
                else if(login[2] === participantTypes.supervisor) {
                    let targetLocation: string;
                    if(location === undefined) targetLocation = "UNKNOWN";
                    else targetLocation = location;
                    let supervisorToAdd: supervisor = {screenName: login[1],roomName:eventName, 
                                                location: targetLocation, tasks: [], socketId: socketId};
                    let supervisorAdded = this.events.addSupervisor(supervisorToAdd);
                    return([supervisorToAdd !== null, login[1], eventName]);
                }
                else {
                    let runnerToAdd: runner = {screenName: login[1],roomName:eventName, 
                                                task: null, socketId: socketId};
                    let runnerAdded = this.events.addRunner(runnerToAdd);
                    return([runnerToAdd !== null, login[1], eventName]);
                }
            }
        } catch (error) {
            let castError = error as Error;
            throw new Error(castError.message);
        }
    }

    public async logUserOut(eventName: string, screenName: string): 
    Promise<[admin | null, supervisor | null, runner | null, task | null] | null> {
        let removeAdmin = this.events.removeAdmin(screenName, eventName);
        let removeSupervisor = this.events.removeSupervisor(screenName, eventName);
        let removeRunner = this.events.removeRunner(screenName, eventName);
        if(removeAdmin === null && removeSupervisor === null && removeRunner === null) return null;
        else {
            if(removeAdmin !== null) {
                return[removeAdmin[0], null, removeAdmin[1], null];
            }
            else if(removeSupervisor !== null) {
                return[null, removeSupervisor[0], removeSupervisor[1], null]
            }
            else if(removeRunner !== null) {
                return[null, null, removeRunner[1], removeRunner[2]];
            }
            else return[null, null, null, null];
        }
    }

    public getMaterials(eventName: string): [{itemName: string, count: number, user: 
    admin | supervisor}[], {itemName: string, count: number}[]] | null {
        let retFreeMaterials = this.events.getMaterialsAvailable(eventName);
        let retUsedMaterials = this.events.getUsedMaterials(eventName);
        if(retFreeMaterials === null || retUsedMaterials === null) return null;
        else return[retUsedMaterials, retFreeMaterials];
    }

    public getUsersLoggedIn(eventName: string): [string[], string[], string[], string[]] | null {
        let admins = this.events.adminList(eventName);
        let supervisors = this.events.supervisorList(eventName);
        let freeRunners = this.events.freeRunnerList(eventName);
        let taskedRunners = this.events.taskedRunnerList(eventName);
        if(admins === null || supervisors === null 
            || freeRunners === null || taskedRunners === null) return null;
        let adminNames = admins.map((admin) => {return admin.screenName});
        let supervisorNames = supervisors.map((supervisor) => {return supervisor.screenName});
        let freeRunnerNames = freeRunners.map((runner) => {return runner.screenName});
        let taskedRunnerNames = taskedRunners.map((runner) => {return runner.screenName});
        return([adminNames, supervisorNames, freeRunnerNames, taskedRunnerNames]);
    }
    
    public getCurrentTasks(eventName: string) : {assigned: runner | null,task: task}[] | null {
        let targetEvent = this.events.findEventByName(eventName);
        if(targetEvent === null) return null
        return targetEvent.taskList();
    }

    public addTask(eventName: string, requesterScreenName: string, userRequest: boolean, 
    materialName?: string, quantity?: number):
    [boolean, task | null, runner | null] | null {
        if(!userRequest && (materialName === undefined || quantity === undefined)) return null;
        else if(materialName !== undefined && quantity === undefined) return null;
        else if(materialName === undefined && quantity !== undefined) return null;
        else if(materialName !== undefined && quantity !== undefined) {
            if(userRequest) {
                return this.events.requestMaterialAndRunner(eventName, requesterScreenName, materialName, quantity);
            }
            else {
                return this.events.requestMaterial(eventName, requesterScreenName, materialName, quantity);
            }
        }
        else {
            return this.events.requestRunner(eventName, requesterScreenName)
        }
    }

    public cancelTask(eventName: string, runnerScreenName: string) : [task | null, runner | null, supervisor | admin] | null{
        return this.events.deleteTask(eventName, runnerScreenName);
    }

    public taskComplete(eventName: string, runnerScreenName: string) : [task | null, runner | null, supervisor | admin] | null {
        return this.events.taskComplete(eventName, runnerScreenName);
    }
}