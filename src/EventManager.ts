"use strict";
import * as helper from './helperFunctions'
import {TaskMastrEvent, participant, admin, runner, supervisor, task} from './Event'

class EventManager{
    eventList: TaskMastrEvent[];
    constructor() {
        this.eventList = <TaskMastrEvent[]>[]
    }

    private getEventByName(roomName: string) : TaskMastrEvent | null{
        this.eventList.forEach(element => {
            if(element.$eventName === roomName) return(element);
        });
        return(null);
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

    removeAdmin(target: admin): [boolean, admin | null]{
        let room = this.getEventByName(target.roomName);
        if(room === null) return([false, null]);
        return(room.removeAdmin(target))
    }
    
    removeSupervisor(target: supervisor): [boolean, supervisor | null]{
        let room = this.getEventByName(target.roomName);
        if(room === null) return([false, null]);
        return(room.removeSupervisor(target))
    }
    
    removeRunner(target: runner): [boolean, runner | null]{
        let room = this.getEventByName(target.roomName);
        if(room === null) return([false, null]);
        return(room.removeRunner(target));
    }
    
    /****************************************************************************************************
     *************************************USER MANIPULATION**********************************************
     ***************************************************************************************************/
    
}