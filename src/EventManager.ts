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

    private getEventByName(roomName: string) : TaskMastrEvent | null{
        let resAddress = this.eventList.findIndex(element => {
            return element.$eventName === roomName;
        });
        if(resAddress === -1) return null;
        return(this.eventList[resAddress]);
    }

    getEventList() : TaskMastrEvent[] {
        return(this.eventList);
    }

    findEventByName(evName: string): TaskMastrEvent | null{
        let index = this.eventList.findIndex((target) => {return target.$eventName === evName});
        if(index === -1) return null;
        else return this.eventList[index];
    }

    findEventByKey(evKey: number): string | null{
        let index = this.eventList.findIndex((target) => {
            return (target.$adminKey === evKey 
                    || target.$supervisorKey === evKey 
                    || target.$runnerKey === evKey)
        })
        if(index === -1) return null;
        else return this.eventList[index].$eventName;
    }

    containsEventByName(evName: string): boolean {
        let index = this.eventList.findIndex((target) => {return target.$eventName === evName});
        return index !== -1;
    }

    containsEventByKey(evKey: number): boolean {
        let index = this.eventList.findIndex((target) => {
            return (target.$adminKey === evKey 
                    || target.$supervisorKey === evKey 
                    || target.$runnerKey === evKey)
        })
        return index !== -1;
    }

    /******************************************************************************************************
    **************************************EVENT MANIPULATION***********************************************
    ******************************************************************************************************/
    nameExists(name : string) : boolean{
        return(this.getEventByName(name) !== null);
    }

    addEvent(targetEvent: TaskMastrEvent) : TaskMastrEvent{
        helper.uniqueInsert(targetEvent, this.eventList);
        return(targetEvent);
    }

    removeEvent(targetEvent: TaskMastrEvent) : TaskMastrEvent | null{
        for (let index = 0; index < this.eventList.length; index++) {
            if(this.eventList[index] === targetEvent) {
                let retEv = this.eventList[index];
                this.eventList.splice(index, 1);
                return(retEv);
            }
        }
        return(null);
    }

    isEmpty(targetEvent: TaskMastrEvent) : boolean {
        return(targetEvent.adminList().length +
            targetEvent.supervisorList().length +
            targetEvent.freeRunnerList().length +
            targetEvent.taskedRunnerList().length ===
            1);
    }

    /****************************************************************************************************
     ************************************ROOM CHARACTERISTICS********************************************
     ***************************************************************************************************/
    adminList(roomName: string) : admin[] | null {
        let event = this.getEventByName(roomName);
        if (event === null || event === undefined) return null;
        else {
            return(event.adminList());
        }
    }

    supervisorList(roomName: string) : supervisor[] | null {
        let event = this.getEventByName(roomName);
        if(event === null || event === undefined) return null;
        else {
            return(event.supervisorList());
        }
    }

    freeRunnerList(roomName: string) : runner[] | null {
        let event = this.getEventByName(roomName);
        if (event === null || event === undefined) return null;
        else {
            return(event.freeRunnerList());
        }
     }

     taskedRunnerList(roomName: string) : runner[] | null {
        let event = this.getEventByName(roomName);
        if (event === null || event === undefined) return null;
        else {
            return(event.taskedRunnerList());
        }
     }

     fullRunnerList(roomName: string) : runner[] | null {
        let event = this.getEventByName(roomName);
        if (event === null || event === undefined) return null;
        else {
            return(event.freeRunnerList().concat(event.taskedRunnerList()));
        }
     }

    getMaterialsAvailable(roomName: string) : {itemName: string, count: number}[] | null {
        let event = this.getEventByName(roomName);
        if (event === null || event === undefined) return null;
        else {
            return(event.getMaterialList());
        }
    }

    getFreeMaterials(roomName: string) : {itemName: string, count: number, user: 
        admin | supervisor}[] | null {
        let event = this.getEventByName(roomName);
        if (event === null || event === undefined) return null;
        else {
            return(event.getUsedMaterialList());
        }
    }
     
    /****************************************************************************************************
     *************************************USER MANIPULATION**********************************************
     ***************************************************************************************************/
    
     addAdmin(target: admin) : admin | null{
        let room = this.getEventByName(target.roomName);
        if(room === null || room === undefined) return(null);
        return(room.addAdmin(target));
    }

    addSupervisor(target: supervisor) : supervisor | null{
        let room = this.getEventByName(target.roomName);
        if (room === null || room === undefined) return(null);
        return(room.addSupervisor(target));
    }

    addRunner(target: runner) : runner | null{
        let room = this.getEventByName(target.roomName);
        if (room === null || room === undefined) return(null);
        return(room.addRunner(target));
    }

    removeAdmin(target: admin): [admin | null, runner | null] | null{
        let room = this.getEventByName(target.roomName);
        if (room === null || room === undefined) return(null);
        let fullMatList = room.getUsedMaterialList();
        let targetMatList = <{itemName: string, count: number, user: admin | supervisor}[]>[];
        fullMatList.forEach(element => {
            if (element.user === target) targetMatList.push(element);
        });
        let retItemNames: string[] = [];
        let retItemQuants: number[] = [];
        targetMatList.forEach(element => {
            let itemIndex = retItemNames.findIndex(stringElement => {
                return element.itemName === stringElement;
            });
            if (itemIndex === -1) {
                retItemNames.push(element.itemName);
                retItemQuants.push(element.count);
            } else retItemQuants[itemIndex] += element.count;
        });
        let depLoc: string;
        if (target.location === null) {
            depLoc = `UNKNOWN: LOCATION OF ${target.screenName} -- CONTACT ADMINISTRATOR`;
        }
        else depLoc = target.location;
        let retTask: task = {supervisor: room.$uniAdmin, runnerRequest: false, 
                             recieveLocation: depLoc, depositLocation: "HOME BASE", 
                             item: retItemNames, quantity: retItemQuants};
        if (retItemNames.length > 0) return([room.removeAdmin(target), room.addTask(retTask)[2]]);
        return([room.removeAdmin(target), null]);
    }
    
    removeSupervisor(target: supervisor): [supervisor | null, runner | null] | null{
        let room = this.getEventByName(target.roomName);
        if (room === null || room === undefined) return(null);
        let fullMatList = room.getUsedMaterialList();
        let targetMatList = <{itemName: string, count: number, user: admin | supervisor}[]>[];
        fullMatList.forEach(element => {
            if (element.user === target) targetMatList.push(element);
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
        if (target.location === null) {
            depLoc = `UNKNOWN: LOCATION OF ${target.screenName} -- CONTACT ADMINISTRATOR`;
        }
        else depLoc = target.location;
        const retTask: task = {supervisor: room.$uniAdmin, runnerRequest: false, 
                             recieveLocation: depLoc, depositLocation: "HOME BASE", 
                             item: retItemNames, quantity: retItemQuants};
        if (retItemNames.length > 0)
            return([
                room.removeSupervisor(target),
                room.addTask(retTask)[2]
            ]);
        return([room.removeSupervisor(target), null]);
    }
    
    removeRunner(target: runner): [boolean, runner | null, task | null] | null{
        const room = this.getEventByName(target.roomName);
        if (room === null || room === undefined) return(null);
        const task = target.task;
        const res = room.removeRunner(target);
        return([res[0], res[1], task]);
    }
    
    /****************************************************************************************************
     ******************************MATERIAL AND TASKS MANIPULATION***************************************
     ***************************************************************************************************/

     addMaterials(roomName: string, materialName: string, quantity: number): boolean | null {
        let room = this.getEventByName(roomName);
        if(room == null) return(null);
        if(quantity <= 0) return null;
        return(room.addFreeMaterials(materialName, quantity));
     }
    
     removeFreeMaterials(roomName: string, materialName: string, quantity: number): boolean | null {
        let room = this.getEventByName(roomName);
        if(room == null) return(null);
        if(quantity <= 0) return(null);
        if(!room.requestValid(materialName, quantity)) return false;
         return(room.removeFreeMaterials(materialName, quantity) > 0);
     }

     requestRunner(requester: admin | supervisor) :
      [boolean, task | null, runner | null] | null{
        let room = this.getEventByName(requester.roomName);
        if(room == null) return(null);
        let depLocation : string = requester.location != null ? requester.location : 
        `UNKNOWN: LOCATION OF ${requester.screenName} -- CONTACT ADMINISTRATOR`;
        let reqTask : task = {supervisor: requester, runnerRequest: true, recieveLocation: "YOUR LOCATION", depositLocation: depLocation};
        let res = room.addTask(reqTask);
         return([res[0], res[1], res[2]]);
     }

     requestMaterial(requester: admin | supervisor, material: string, quantity: number) : [boolean, task | null, runner | null] | null{
        let room = this.getEventByName(requester.roomName);
        if(room == null) return null;
        let possible = room.requestValid(material, quantity);
        if(!possible) return([false, null, null]);
        let checkoutRes = room.checkoutMaterials(material, quantity, requester);
        if(!checkoutRes[0]) return([false, null, null]);
        let depLocation : string = requester.location != null ? requester.location : 
        `UNKNOWN: LOCATION OF ${requester.screenName} -- CONTACT ADMINISTRATOR`;
        let reqTask : task = {supervisor: requester, runnerRequest: false, recieveLocation: "HOME BASE", depositLocation: depLocation, item: material, quantity: quantity};
        let res = room.addTask(reqTask);
         return([res[0], res[1], res[2]]);
     }

     taskComplete(runner: runner): [task | null, runner | null] | null{
        let room = this.getEventByName(runner.roomName);
        if(room == null) return null;
        let targetTask = runner.task;
        if(targetTask == null) return null;
        return room.removeTask(targetTask);
     }

     deleteTask(runner: runner) : [task | null, runner | null] | null {
        let room = this.getEventByName(runner.roomName);
        if(room == null) return null;
        let targetTask = runner.task;
        if(targetTask == null) return null;
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
        return room.removeTask(targetTask);
     }
}