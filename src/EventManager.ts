"use strict";
import * as helper from './helperFunctions'
import {TaskMastrEvent, participant, upperLevelWorker, admin, runner, supervisor, task} from './Event'

export class EventManager{
    private eventList: TaskMastrEvent[];
    constructor() {
        this.eventList = <TaskMastrEvent[]>[]
    }

    getEventCount() : number {
        return(this.eventList.length);
    }

    private getEventByName(roomName: string) : TaskMastrEvent | null{
        let resAddress = this.eventList.findIndex(element => {
            return element.$eventName === roomName
        });
        if(resAddress === -1) return null;
        return(this.eventList[resAddress]);
    }

    getEventList() : TaskMastrEvent[] {
        return(this.eventList);
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
        return(targetEvent.adminList().length + targetEvent.supervisorList().length + 
               targetEvent.freeRunnerList().length + targetEvent.taskedRunnerList().length === 0)
    }

    /****************************************************************************************************
     ************************************ROOM CHARACTERISTICS********************************************
     ***************************************************************************************************/
    adminList(roomName: string) : admin[] | null {
        let event = this.getEventByName(roomName);
        if(event === null) return null;
        else {
            return(event.adminList());
        }
    }

    supervisorList(roomName: string) : supervisor[] | null {
        let event = this.getEventByName(roomName);
        if(event === null) return null;
        else {
            return(event.supervisorList());
        }
    }

    freeRunnerList(roomName: string) : runner[] | null {
        let event = this.getEventByName(roomName);
        if(event === null) return null;
        else {
            return(event.freeRunnerList());
        }
     }

     taskedRunnerList(roomName: string) : runner[] | null {
        let event = this.getEventByName(roomName);
        if(event === null) return null;
        else {
            return(event.taskedRunnerList());
        }
     }

     fullRunnerList(roomName: string) : runner[] | null {
        let event = this.getEventByName(roomName);
        if(event === null) return null;
        else {
            return(event.freeRunnerList().concat(event.taskedRunnerList()));
        }
     }

    getMaterialsAvailable(roomName: string) : {itemName: string, count: number}[] | null {
        let event = this.getEventByName(roomName);
        if(event === null) return null;
        else {
            return(event.getMaterialList())
        }
    }

    getFreeMaterials(roomName: string) : {itemName: string, count: number, user: 
        upperLevelWorker}[] | null {
        let event = this.getEventByName(roomName);
        if(event === null) return null;
        else {
            return(event.getUsedMaterialList());
        }
    }
     
    /****************************************************************************************************
     *************************************USER MANIPULATION**********************************************
     ***************************************************************************************************/
    
     addAdmin(target: admin) : admin | null{
        let room = this.getEventByName(target.roomName);
        if(room === null) return(null);
        return(room.addAdmin(target));
    }

    addSupervisor(target: supervisor) : supervisor | null{
        let room = this.getEventByName(target.roomName);
        if(room === null) return(null);
        return(room.addSupervisor(target));
    }

    addRunner(target: runner) : runner | null{
        let room = this.getEventByName(target.roomName);
        if(room === null) return(null);
        return(room.addRunner(target));
    }

    removeAdmin(target: admin): [admin | null, runner | null]{
        let room = this.getEventByName(target.roomName);
        if(room === null) return([null, null]);
        let fullMatList = room.getUsedMaterialList();
        let targetMatList = <{itemName: string, count: number, user: upperLevelWorker}[]>[];
        fullMatList.forEach(element => {
            if(element.user === target) targetMatList.push(element);
        })
        let retItemNames: string[] = [];
        let retItemQuants: number[] = [];
        targetMatList.forEach(element => {
            let itemIndex = retItemNames.findIndex(stringElement => {
                return element.itemName === stringElement
            })
            if(itemIndex === -1) {
                retItemNames.push(element.itemName);
                retItemQuants.push(element.count);
            }
            else retItemQuants[itemIndex] += element.count;
        })
        let depLoc: string;
        if(target.location === null) depLoc = `UNKNOWN: LOCATION OF ${target.screenName} -- 
        CONTACT ADMINISTRATOR`
        else depLoc = target.location;
        let retTask: task = {supervisor: room.$uniAdmin, runnerRequest: false, 
                             recieveLocation: depLoc, depositLocation: "HOME BASE", 
                             item: retItemNames, quantity: retItemQuants};
        if(retItemNames.length > 0) return([room.removeAdmin(target), room.addTask(retTask)[2]])
        return([room.removeAdmin(target), null]);
    }
    
    removeSupervisor(target: supervisor): [supervisor | null, runner | null]{
        let room = this.getEventByName(target.roomName);
        if(room === null) return([null, null]);
        let fullMatList = room.getUsedMaterialList();
        let targetMatList = <{itemName: string, count: number, user: upperLevelWorker}[]>[];
        fullMatList.forEach(element => {
            if(element.user === target) targetMatList.push(element);
        })
        let retItemNames: string[] = [];
        let retItemQuants: number[] = [];
        targetMatList.forEach(element => {
            let itemIndex = retItemNames.findIndex(stringElement => {
                return element.itemName === stringElement
            })
            if(itemIndex === -1) {
                retItemNames.push(element.itemName);
                retItemQuants.push(element.count);
            }
            else retItemQuants[itemIndex] += element.count;
        })
        let depLoc: string;
        if(target.location === null) depLoc = `UNKNOWN: LOCATION OF ${target.screenName} -- 
        CONTACT ADMINISTRATOR`
        else depLoc = target.location;
        let retTask: task = {supervisor: room.$uniAdmin, runnerRequest: false, 
                             recieveLocation: depLoc, depositLocation: "HOME BASE", 
                             item: retItemNames, quantity: retItemQuants};
        if(retItemNames.length > 0) return([room.removeSupervisor(target), 
                                            room.addTask(retTask)[2]])
        return([room.removeSupervisor(target), null]);
    }
    
    removeRunner(target: runner): [boolean, runner | null, task | null]{
        let room = this.getEventByName(target.roomName);
        if(room === null) return([false, null, null]);
        let task = target.task;
        let res = room.removeRunner(target);
        return([res[0], res[1], task]);
    }
    
    /****************************************************************************************************
     ******************************MATERIAL AND TASKS MANIPULATION***************************************
     ***************************************************************************************************/
    
     requestRunner(requester: admin | supervisor) :
      [boolean, task | null, runner | null] {
        let room = this.getEventByName(requester.roomName);
        if(room == null) return [false, null, null];
        let depLocation : string = requester.location != null ? requester.location : 
        `UNKNOWN: LOCATION OF ${requester.screenName} -- CONTACT ADMINISTRATOR`;
        let reqTask : task = {supervisor: requester, runnerRequest: true, recieveLocation: "YOUR LOCATION", depositLocation: depLocation};
        let res = room.addTask(reqTask);

     }
}