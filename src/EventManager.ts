"use strict";
import * as helper from "./helperFunctions";
import {TaskMastrEvent, admin, runner, supervisor, task} from "./Event";

export class EventManager{
    private eventList: TaskMastrEvent[];
    constructor() {
        this.eventList = <TaskMastrEvent[]>[];
    }

    getEventCount() : number {
        return(this.eventList.length);
    }

    findEventByName(roomName: string) : TaskMastrEvent | null{
        let resAddress = this.eventList.findIndex(element => {
            return element.$eventName === roomName;
        });
        if(resAddress === -1) return null;
        return(this.eventList[resAddress]);
    }

    getEventList() : TaskMastrEvent[] {
        return(this.eventList);
    }

    findEventByKey(evKey: number): string | null{
        let index = this.eventList.findIndex((target) => {
            return (target.$adminKey === evKey 
                    || target.$supervisorKey === evKey 
                    || target.$runnerKey === evKey)
        });
        if(index === -1) return null;
        else return this.eventList[index].$eventName;
    }

    /******************************************************************************************************
    **************************************EVENT MANIPULATION***********************************************
    ******************************************************************************************************/

    addEvent(targetEvent: TaskMastrEvent) : TaskMastrEvent{
        helper.uniqueInsert(targetEvent, this.eventList);
        return(targetEvent);
    }

    removeEvent(targetEventName: string) : TaskMastrEvent | null{
        for (let index = 0; index < this.eventList.length; index++) {
            if(this.eventList[index].$eventName === targetEventName) {
                let retEv = this.eventList[index];
                this.eventList.splice(index, 1);
                return(retEv);
            }
        }
        return(null);
    }

    static isEmpty(targetEvent: TaskMastrEvent) : boolean {
        return(targetEvent.adminList().length +
            targetEvent.supervisorList().length +
            targetEvent.freeRunnerList().length +
            targetEvent.taskedRunnerList().length ===
            0);
    }

    /****************************************************************************************************
     ************************************ROOM CHARACTERISTICS********************************************
     ***************************************************************************************************/
    adminList(roomName: string) : admin[] | null {
        let event = this.findEventByName(roomName);
        if (event === null || event === undefined) return null;
        else {
            return(event.adminList());
        }
    }

    supervisorList(roomName: string) : supervisor[] | null {
        let event = this.findEventByName(roomName);
        if(event === null || event === undefined) return null;
        else {
            return(event.supervisorList());
        }
    }

    freeRunnerList(roomName: string) : runner[] | null {
        let event = this.findEventByName(roomName);
        if (event === null || event === undefined) return null;
        else {
            return(event.freeRunnerList());
        }
     }

     taskedRunnerList(roomName: string) : runner[] | null {
        let event = this.findEventByName(roomName);
        if (event === null || event === undefined) return null;
        else {
            return(event.taskedRunnerList());
        }
     }

     fullRunnerList(roomName: string) : runner[] | null {
        let event = this.findEventByName(roomName);
        if (event === null || event === undefined) return null;
        else {
            return(event.freeRunnerList().concat(event.taskedRunnerList()));
        }
     }

    getMaterialsAvailable(roomName: string) : {itemName: string, count: number}[] | null {
        let event = this.findEventByName(roomName);
        if (event === null || event === undefined) return null;
        else {
            return(event.getMaterialList());
        }
    }

    getUsedMaterials(roomName: string) : {itemName: string, count: number, user: 
        admin | supervisor}[] | null {
        let event = this.findEventByName(roomName);
        if (event === null || event === undefined) return null;
        else {
            return(event.getUsedMaterialList());
        }
    }
     
    /****************************************************************************************************
     *************************************USER MANIPULATION**********************************************
     ***************************************************************************************************/
    
     addAdmin(target: admin) : admin | null{
        let room = this.findEventByName(target.roomName);
        if(room === null || room === undefined) return(null);
        return(room.addAdmin(target));
    }

    addSupervisor(target: supervisor) : supervisor | null{
        let room = this.findEventByName(target.roomName);
        if (room === null || room === undefined) return(null);
        return(room.addSupervisor(target));
    }

    addRunner(target: runner) : runner | null{
        let room = this.findEventByName(target.roomName);
        if (room === null || room === undefined) return(null);
        return(room.addRunner(target));
    }

    removeAdmin(target: string, roomName: string): [admin | null, runner | null] | null{
        let room = this.findEventByName(roomName);
        if (room === null || room === undefined) return(null);
        let targetAdmin = room.getAdminByScreenName(target);
        if(targetAdmin === null) return(null);
        let fullMatList = room.getUsedMaterialList();
        let targetMatList = <{itemName: string, count: number, user: admin | supervisor}[]>[];
        fullMatList.forEach(element => {
            if (element.user.screenName === target) targetMatList.push(element);
        });
        let retItemNames: string[] = [];
        let retItemQuants: number[] = [];
        targetMatList.forEach(element => {
            let itemIndex = retItemNames.findIndex((stringElement) => {
                return element.itemName === stringElement;
            });
            if (itemIndex === -1) {
                retItemNames.push(element.itemName);
                retItemQuants.push(element.count);
            } else retItemQuants[itemIndex] += element.count;
        });
        let depLoc: string;
        if (targetAdmin.location === null) {
            depLoc = `UNKNOWN: LOCATION OF ${targetAdmin.screenName} -- CONTACT ADMINISTRATOR`;
        }
        else depLoc = targetAdmin.location;
        let retTask: task = {supervisor: room.$uniAdmin, runnerRequest: false, 
                             recieveLocation: depLoc, depositLocation: "HOME BASE", 
                             item: retItemNames, quantity: retItemQuants};
        if (retItemNames.length > 0) return([room.removeAdmin(targetAdmin), room.addTask(retTask)[2]]);
        return([room.removeAdmin(targetAdmin), null]);
    }
    
    removeSupervisor(target: string, roomName: string): [supervisor | null, runner | null] | null{
        let room = this.findEventByName(roomName);
        if (room === null || room === undefined) return(null);
        let targetSupervisor = room.getSupervisorByScreenName(target);
        if(targetSupervisor === null) return(null);
        let fullMatList = room.getUsedMaterialList();
        let targetMatList = <{itemName: string, count: number, user: admin | supervisor}[]>[];
        fullMatList.forEach(element => {
            if (element.user.screenName === target) targetMatList.push(element);
        });
        let retItemNames: string[] = [];
        let retItemQuants: number[] = [];
        targetMatList.forEach(element => {
            const itemIndex = retItemNames.findIndex(stringElement => {
                return element.itemName === stringElement;
            });
            if (itemIndex === -1) {
                retItemNames.push(element.itemName);
                retItemQuants.push(element.count);
            } else retItemQuants[itemIndex] += element.count;
        });
        let depLoc: string;
        if (targetSupervisor.location === null) {
            depLoc = `UNKNOWN: LOCATION OF ${target} -- CONTACT ADMINISTRATOR`;
        }
        else depLoc = targetSupervisor.location;
        const retTask: task = {supervisor: room.$uniAdmin, runnerRequest: false, 
                             recieveLocation: depLoc, depositLocation: "HOME BASE", 
                             item: retItemNames, quantity: retItemQuants};
        if (retItemNames.length > 0)
            return([
                room.removeSupervisor(targetSupervisor),
                room.addTask(retTask)[2]
            ]);
        return([room.removeSupervisor(targetSupervisor), null]);
    }
    
    removeRunner(target: string, roomName: string): [boolean, runner | null, task | null] | null{
        const room = this.findEventByName(roomName);
        if (room === null || room === undefined) return(null);
        let targetRunner = room.getRunnerByScreenName(target);
        if(targetRunner === null) return null;
        const task = targetRunner.task;
        const res = room.removeRunner(targetRunner);
        return([res[0], res[1], task]);
    }
    
    /****************************************************************************************************
     ******************************MATERIAL AND TASKS MANIPULATION***************************************
     ***************************************************************************************************/

     addMaterials(roomName: string, materialName: string, quantity: number): boolean | null {
        let room = this.findEventByName(roomName);
        if(room == null) return(null);
        if(quantity <= 0) return null;
        return(room.addFreeMaterials(materialName, quantity));
     }
    
     removeFreeMaterials(roomName: string, materialName: string, quantity: number): boolean | null {
        let room = this.findEventByName(roomName);
        if(room == null) return(null);
        if(quantity <= 0) return(null);
        if(!room.requestValid(materialName, quantity)) return false;
         return(room.removeFreeMaterials(materialName, quantity) > 0);
     }

     requestRunner(eventName: string, requesterScreenName: string) :
      [boolean, task | null, runner | null] | null{
        let room = this.findEventByName(eventName);
        if(room == null) return(null);
        let requester = room.getAdminByScreenName(requesterScreenName);
        if(requester === null) requester = room.getSupervisorByScreenName(requesterScreenName);
        if(requester === null) return null;
        let depLocation : string = requester.location != null ? requester.location : 
        `UNKNOWN: LOCATION OF ${requester.screenName} -- CONTACT ADMINISTRATOR`;
        let reqTask : task = {supervisor: requester, runnerRequest: true, recieveLocation: "YOUR LOCATION", depositLocation: depLocation};
        let res = room.addTask(reqTask);
         return([res[0], res[1], res[2]]);
     }

     requestMaterial(eventName: string, requesterScreenName: string, material: string, quantity: number) : [boolean, task | null, runner | null] | null{
        let room = this.findEventByName(eventName);
        if(room === null) return null;
        let possible = room.requestValid(material, quantity);
        if(!possible) return([false, null, null]);
        let requester = room.getAdminByScreenName(requesterScreenName);
        if(requester === null) requester = room.getSupervisorByScreenName(requesterScreenName);
        if(requester === null) return null;
        let checkoutRes = room.checkoutMaterials(material, quantity, requester);
        if(!checkoutRes[0]) return([false, null, null]);
        let depLocation : string = requester.location != null ? requester.location : 
        `UNKNOWN: LOCATION OF ${requester.screenName} -- CONTACT ADMINISTRATOR`;
        let reqTask : task = {supervisor: requester, runnerRequest: false, recieveLocation: "HOME BASE", depositLocation: depLocation, item: material, quantity: quantity};
        let res = room.addTask(reqTask);
         return([res[0], res[1], res[2]]);
     }

     requestMaterialAndRunner(eventName: string, requesterScreenName: string, material: string, quantity: number): [boolean, task | null, runner | null] | null {
        let room = this.findEventByName(eventName);
        if(room === null) return null;
        let possible = room.requestValid(material, quantity);
        if(!possible) return([false, null, null]);
        let requester = room.getAdminByScreenName(requesterScreenName);
        if(requester === null) requester = room.getSupervisorByScreenName(requesterScreenName);
        if(requester === null) return null;
        let checkoutRes = room.checkoutMaterials(material, quantity, requester);
        if(!checkoutRes[0]) return([false, null, null]);
        let depLocation : string = requester.location != null ? requester.location : 
        `UNKNOWN: LOCATION OF ${requester.screenName} -- CONTACT ADMINISTRATOR`;
        let reqTask : task = {supervisor: requester, runnerRequest: true, recieveLocation: "HOME BASE", depositLocation: depLocation, item: material, quantity: quantity};
        let res = room.addTask(reqTask);
         return([res[0], res[1], res[2]]);
     }

     taskComplete(eventName: string, runnerName: string): [task | null, runner | null, admin | supervisor] | null{
        let room = this.findEventByName(eventName);
        if(room === null) return null;
        let runner = room.getRunnerByScreenName(runnerName);
        if(runner === null) return null;
        let targetTask = runner.task;
        if(targetTask == null) return null;
        let requester = targetTask.supervisor;
        let removeRes = room.removeTask(targetTask);
        return [removeRes[0], removeRes[1], requester];
     }

     deleteTask(eventName: string, runnerName: string) : [task | null, runner | null, supervisor | admin] | null {
        let room = this.findEventByName(eventName);
        if(room === null) return null;
        let runner = room.getRunnerByScreenName(runnerName);
        if(runner === null) return null;
        let targetTask = runner.task;
        if(targetTask === null) return null;
        if(targetTask.item !== undefined && targetTask.quantity !== undefined) {
            if(targetTask.item instanceof Array) {
                if(targetTask.quantity instanceof Array) {
                    for(let i = 0; i < targetTask.item.length; i++) {
                        room.addFreeMaterials(targetTask.item[i], targetTask.quantity[i]);
                    }
                }
            }
            else {
                if(!(targetTask.quantity instanceof Array)) {
                    room.addFreeMaterials(targetTask.item, targetTask.quantity);
                }
            }
        }
        let requester = targetTask.supervisor;
        let removeRes = room.removeTask(targetTask);
        return [removeRes[0], removeRes[1], requester];
     }
}