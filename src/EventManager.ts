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
        let resAddress = this.eventList.findIndex(element => {return element.$eventName === roomName});
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

    removeAdmin(target: admin): admin | null{
        let room = this.getEventByName(target.roomName);
        if(room === null) return(null);
        return(room.removeAdmin(target))
    }
    
    removeSupervisor(target: supervisor): supervisor | null{
        let room = this.getEventByName(target.roomName);
        if(room === null) return null;
        return(room.removeSupervisor(target))
    }
    
    removeRunner(target: runner): [boolean, runner | null]{
        let room = this.getEventByName(target.roomName);
        if(room === null) return([false, null]);
        return(room.removeRunner(target));
    }
    
    /****************************************************************************************************
     ***********************************MATERIAL MANIPULATION********************************************
     ***************************************************************************************************/
    
}