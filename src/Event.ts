/**
 * This file contains the class description for the TaskMastrEvent Object, which directly defines the 
 * behavior of individual events for taskmastr
 */

"use strict";
import * as helper from "./helperFunctions"
import {participant, admin, runner, upperLevelWorker, supervisor, task} from "./Participant"
export {participant, admin, runner, upperLevelWorker, supervisor, task}
export class TaskMastrEvent{
    private eventName: string; //Event Name in string form, also room name for socket
    private adminKey: number; //Key for admin to login
    private supervisorKey: number; //Key for supervisor to login
    private runnerKey: number; //Key for runner to login
    private owner: admin; //Administrator with highest level priviledge
    private taskCount: number; //Running task count for the event
    private admins: admin[]; //Admins currently active in the event
    private supervisors: supervisor[]; //Supervisors currently active in the event
    private freeRunners: runner[]; //Runners currently active and free of task
    private taskedRunners: runner[]; //Runners currently active and tasked
    private materialsAvailable: {itemName: string, count: number}[]; //Name and count of free materials
    private materialsInUse: {itemName: string, count: number, user: upperLevelWorker}[]; //Name, count, and using supervisor
    private unfinishedTasks: {assigned: runner | null, task: task}[];
    private waitingTasks: {id: number, task: task}[]; //Tasks currently waiting to be assigned.
    
    /**
     * @constructor
     * @param eventName 
     * @param adminkey 
     * @param supervisorKey 
     * @param runnerKey 
     * @param administrator 
     * @param owner 
     * @param taskCount 
     * @param admins 
     * @param supervisors 
     * @param freeRunners 
     * @param taskedRunners 
     * @param materialsAvailable 
     * @param materialsInUse 
     * @param tasks 
     */
    constructor(eventName: string, adminkey: number, supervisorKey: number, runnerKey: number,
                owner: admin, materialsAvailable: {itemName: string, count: number}[]) {
                    this.eventName = eventName;
                    this.adminKey = adminkey;
                    this.supervisorKey = supervisorKey;
                    this.runnerKey = runnerKey;
                    this.taskCount = 0;
                    this.admins =  <admin[]>[owner];
                    this.owner = owner;
                    this.supervisors =  <supervisor[]>[];
                    this.freeRunners =  <runner[]>[];
                    this.taskedRunners =  <runner[]>[];
                    this.materialsAvailable =  <{itemName: string, count: number}[]>[];
                    this.materialsInUse =  <{itemName: string, count: number, user: upperLevelWorker}[]>[];
                    this.unfinishedTasks = <{assigned: runner | null, task:task}[]>[];
                    this.waitingTasks =  <{id: number, task: task}[]>[];
                }
    
	 get $eventName(): string {
		return this.eventName;
	}

	 set $eventName(value: string) {
		this.eventName = value;
	}

	 get $adminKey(): number {
		return this.adminKey;
	}

	 get $supervisorKey(): number {
		return this.supervisorKey;
	}

	 get $runnerKey(): number {
		return this.runnerKey;
	}

	 get $owner(): admin {
		return this.owner;
	}

	 get $taskCount(): number {
		return this.taskCount;
	}

     adminList() : admin[] {
        let ret = <admin[]>[];
        this.admins.forEach((element) => {
            
            ret.push(element);
        });
        return(ret);
    }
    
     supervisorList() : supervisor[] {
        const ret = [] as supervisor[];
        this.supervisors.forEach(element =>{
            ret.push(element);
        });
        return(ret);
    }

    freeRunnerList() : runner[] {
        const ret = [] as runner[];
        this.freeRunners.forEach(element => {
            ret.push(element);
        });
        return(ret);
    }

    taskList(){
        const ret = <{assigned: runner | null, task:task}[]>[];
        this.unfinishedTasks.forEach(element => {
            ret.push(element);
        })
        return(ret);
    }


    /******************************************************************************************************************************************************************
     * Participant Interactions
     *****************************************************************************************************************************************************************/
   
     /**
     * @param admin
     * @returns
     */
     addAdmin(admin: admin) : admin {
        helper.uniqueInsert(admin, this.admins);
        return(admin);
    }

     addSupervisor(supervisor: supervisor) : supervisor{
        helper.uniqueInsert(supervisor, this.supervisors);
        return(supervisor);
    }

    /**
     * @param runner to be added
     * @returns runner added
     */
     addRunner(runner: runner) : runner {
        if(runner.task !== null) {
            helper.uniqueInsert(runner, this.taskedRunners);
            return(runner);
        }
        else {
            if(this.waitingTasks.length !== 0) {
                runner.task = this.waitingTasks[0].task;
                this.waitingTasks.splice(0, 1);
                helper.uniqueInsert(runner, this.taskedRunners);
                return(runner);
            }
            else {
                helper.uniqueInsert(runner, this.freeRunners);
                return(runner);
            }
        }
    }

    /**
     * @param screenName
     * @returns admin target Admin 
     */
     getAdminByScreenName(screenName: string) : admin | null{
        const found: number = (this.admins.findIndex((targetAdmin) => {return(targetAdmin.screenName === screenName)}));
        if(found === -1) return(null);
        else return(this.admins[found]);
    }

    /**
     * @param screenName
     * @returns supervisor target supervisor 
     */
     getSupervisorByScreenName(screenName: string) : supervisor | null{
        const found: number = (this.supervisors.findIndex((targetSup) => {return(targetSup.screenName === screenName)}));
        if (found === -1) return(null);
        else return(this.supervisors[found]);
    }

    /**
     *@param screenName
     *@return runner target runner 
     */
      getRunnerByScreenName(screenName: string) : runner | null{
       const freePos = this.freeRunners.findIndex((targetRunner) => {return targetRunner.screenName === screenName});
       if(freePos !== -1) return(this.freeRunners[freePos]);
       else{
           const taskedPos = this.taskedRunners.findIndex((targetRunner) => {return targetRunner.screenName === screenName});
           if(taskedPos !== -1) return(this.taskedRunners[taskedPos]);
           else return(null);
       }
     }

         /**
     * @param screenName
     * @returns admin target Admin 
     */
     getAdminBySocket(socketId: number) : admin | null{
        const found: number = (this.admins.findIndex((targetAdmin) => {return(targetAdmin.socketId === socketId)}));
        if(found === -1) return(null);
        else return(this.admins[found]);
    }

    /**
     * @param screenName
     * @returns supervisor target supervisor 
     */
     getSupervisorBySocket(socketId: number) : supervisor | null{
        const found: number = (this.supervisors.findIndex((targetSup) => {return(targetSup.socketId === socketId)}));
        if (found === -1) return(null);
        else return(this.supervisors[found]);
    }

    /**
     *@param screenName
     *@return runner target runner 
     */
      getRunnerBySocket(socketId: number) : runner | null{
       const freePos = this.freeRunners.findIndex((targetRunner) => {return targetRunner.socketId === socketId});
       if(freePos !== -1) return(this.freeRunners[freePos]);
       else{
           const taskedPos = this.taskedRunners.findIndex((targetRunner) => {return targetRunner.socketId === socketId});
           if(taskedPos !== -1) return(this.taskedRunners[taskedPos]);
           else return(null);
       }
    }
    
    /**
     * @param admin administrator to be removed
     * @return [boolean, admin| null] boolean indicates that it has been found, admin indicates removal
     */
     removeAdmin(admin : admin) : [boolean, admin | null] {
        if(this.owner === admin) return([true, null]);
        if(this.admins.length === 0) return([false, null]);
        else {
            const adminIndex: number = this.admins.findIndex((targetAdmin: admin) => {
                return(targetAdmin.screenName === admin.screenName);
            });
            if(adminIndex === -1) return([false, null]);
            else{
                const retAdmin : admin = this.admins[adminIndex];
                retAdmin.tasks.forEach(element => {
                    this.removeTask(element);
                });
                this.admins.splice(adminIndex, 1);
                return([true, admin]);
            }
        }
    }
    
    /**
     * @param supervisor
     * @returns [removed, removedSupervisor] removed indicates code success, removedSupervisor indicates
     * the actual removed object
     */
     removeSupervisor(supervisor : supervisor) : [boolean, supervisor | null] {
        if(this.supervisors.length === 0) return([false, null]);
        else {
            let supervisorIndex = this.supervisors.findIndex((targetSupervisor : supervisor) => {
                return targetSupervisor === supervisor;
            });
            if(supervisorIndex === -1) return([true, null]);
            else {
                let retSupervisor : supervisor = this.supervisors[supervisorIndex];
                retSupervisor.tasks.forEach(element => {
                    this.removeTask(element);
                });
                this.supervisors.splice(supervisorIndex, 1);
                return([true, retSupervisor]);
            }
        }
    }
    
    /**
     * @param runner
     * @returns [tasked, removedRunner] tasked indicates if a task had to be assigned, removedRunner
     * indicates the actual removed object
     */
     removeRunner(runner : runner) : [boolean, runner | null] {
        let freePosition = this.freeRunners.findIndex((freeRunner) => {return runner === freeRunner});
        if(freePosition === -1) {
            let taskedPosition = this.taskedRunners.findIndex((taskedRunner) => {return runner === taskedRunner});
            if(taskedPosition === -1) return([false, null]);
            else {
                this.unassignTask(this.taskedRunners[taskedPosition]);
                return([true, this.removeRunner(runner)[1]]);
            }
        }
        else{
            this.freeRunners.splice(freePosition, 1);
            return([false, runner]);
        }
    }


    /******************************************************************************************************************************************************************
     * Materials Interactions
     *****************************************************************************************************************************************************************/
    /**
     * @param name: the name of the  object to get the count of
     * @return amount of that material that is free
     */
     getMaterialCount(name: string): number {
        let position = this.materialsAvailable.findIndex((element) => {return element.itemName === name});
        if(position === -1) return 0;
        return(this.materialsAvailable[position].count);
    }

    /**
     * @returns the list of all available materials
     */
    getMaterialList(): {itemName: string, count: number}[]{
        let retArr: {itemName: string, count: number}[] = [];
        this.materialsAvailable.forEach(element => {
            retArr.push(element);
        });
        return(retArr);
    }

    addFreeMaterials(name: string, quantity: number): boolean{
        let position = this.materialsAvailable.findIndex((element) => {
            return element.itemName === name
        });
        if(position === -1) {
            this.materialsAvailable.push({itemName: name, count: quantity});
            return(false);
        }
        this.materialsAvailable[position].count += quantity;
        return(true);
    }

    removeFreeMaterials(name: string, quantity: number): number{
        let position = this.materialsAvailable.findIndex((element) => {
            return(element.itemName === name);
        });
        if(position === -1) return 0;
        else if(this.materialsAvailable[position].count <= quantity) {
            let removed = this.materialsAvailable[position].count;
            this.materialsAvailable[position].count = 0;
            return(removed);
        }
        else {
            this.materialsAvailable[position].count -= quantity;
            return(quantity);
        }
    }

    checkoutMaterials(name: string, quantity: number, caller: upperLevelWorker): [boolean, number]{
        let position = this.materialsAvailable.findIndex((element) => {return element.itemName === name});
        if(position === -1) return([false, 0]);
        if(this.materialsAvailable[position].count < quantity) {
            return([false, this.materialsAvailable[position].count]);
        }
        else {
            this.materialsAvailable[position].count -= quantity;
            let matPosition = this.materialsInUse.findIndex((element) => {
                return(element.user === caller && element.itemName === name);
            });
            if(matPosition === -1) {
                this.materialsInUse.push({itemName: name, count: quantity, user: caller});
                return([true, quantity]);
            }
            else {
                this.materialsInUse[matPosition].count += quantity;
                return([true, quantity]);
            }
        }
    }
    
    returnMaterials(name: string, quantity: number, supervisor: upperLevelWorker) : [boolean, number, upperLevelWorker] {
        if(supervisor.roomName !== this.eventName) return([false, -1, supervisor]);
        else {
            let supervisorMats = this.materialsInUse.findIndex((element) => {
                return(element.itemName === name && element.user === supervisor)
            })
            if(supervisorMats === -1) return([false, -1, supervisor]);
            let takenAmount = this.materialsInUse[supervisorMats].count;
            if(takenAmount < quantity) return([false, takenAmount, supervisor]);
            else if(takenAmount === quantity) {
                this.addFreeMaterials(name, quantity);
                this.materialsInUse.splice(supervisorMats, 1);
            }
            else {
                this.addFreeMaterials(name, quantity);
                this.materialsInUse[supervisorMats].count -= quantity;
            }
            return([true, quantity, supervisor]);
        }
    }
    
    /******************************************************************************************************************************************************************
     * Task Interactions
     *****************************************************************************************************************************************************************/
         /**
      * @param task 
      * @param runner
      * @return runner | null 
      */
     private assignTask(task : task, runner : runner) : runner | null {
        const runnerPos = this.freeRunners.findIndex((targetRunner) => {return targetRunner.screenName === runner.screenName});
        if(runnerPos === -1) return(null);
        else {
            const targetRunner = this.freeRunners[runnerPos];
            targetRunner.task = task;
            this.freeRunners.splice(runnerPos, 1);
            helper.uniqueInsert(targetRunner, this.taskedRunners);
            return(targetRunner);
        }
     }

     /**
      * @param runner
      * @returns [task, runner] - both or each may be null
      */
     private unassignTask(runner : runner) : [task | null, runner | null] {
        if(runner.task === null) return([null, null]);
        let runnerTask : task = runner.task;
        runner.task = null;
        let runnerIndex = this.taskedRunners.findIndex((targetRunner) => {return targetRunner === runner});
        if(runnerIndex === -1) {
            if(runner.roomName === this.eventName) {
                return([runnerTask, runner]);
            }
            else return([null, runner]);
        }
        else {
            this.taskedRunners.splice(runnerIndex, 1);
            if(runner.roomName === this.eventName) {
                return([runnerTask, runner]);
            }
            else return([null, runner]);
        }
    }
    /**
     * @param task
     * @returns [assigned, task, assignedRunner]
     */
      addTask(task : task) : [boolean, task, runner | null]{
         task.supervisor.tasks.push(task);
        if(this.freeRunners.length > 0) {
            let res : runner | null = null;
            let i : number = 0;
            while(i < this.freeRunners.length && res == null) {
                res = this.assignTask(task, this.freeRunners[i]);
                i++;
            }
            if(res == null) {
                this.waitingTasks.push({id: this.taskCount, task: task});
                this.taskCount++;
                return([false, task, null]);
            }
            else {
                let runner : runner | null = this.assignTask(task, res);
                return([true, task, runner]);
            }
        }
        else {
            this.waitingTasks.push({id: this.taskCount, task: task});
            this.taskCount++;
            return([false, task, null]);
        }
     }


    /**
     * @param task 
     * @returns isAssigned
     */
    private taskIsAssigned(task : task) : boolean {
        let taskIndex = this.taskedRunners.findIndex((targetRunner) => {return targetRunner.task === task});
        return(taskIndex !== -1);
    }
    /**
     * @param task
     * @returns [taskRemoved, taskedRunner] 
     */
    private removeAssignedTask(task : task) : [task | null, runner | null] {
        let taskedIndex = this.taskedRunners.findIndex((targetRunner) => {return targetRunner.task === task});
        if(taskedIndex === -1) return([null, null]);
        else {
            let targetTask = this.taskedRunners[taskedIndex].task;
            if(targetTask === null) return([null, null]);
            else {
                let [retTask, retRunner] = this.unassignTask(this.taskedRunners[taskedIndex]);
                if(retTask === null) return([null, null]);
                else{
                    return([retTask, retRunner]);
                }
            }
        }
    }
    /**
     * @param task
     * @returns [removed, taskInEvent] 
     */
    private removeFreeTask(task : task) : [boolean, task | null] {
        let taskIndex = this.waitingTasks.findIndex((targetTask) => {return targetTask.task === task});
        if(taskIndex === -1) return([true, null]);
        else {
            let targetTask = this.waitingTasks[taskIndex];
            this.waitingTasks.splice(taskIndex, 1);
            return([true, targetTask.task]);
        }
    }

    
    /**
     * @param task
     * @returns [removed, taskInEvent, taskedRunner] 
     */
     removeTask(task : task) : [task | null, runner | null] {
        if(this.taskIsAssigned(task)) return(this.removeAssignedTask(task));
        else {
            let retRemFreeTask = this.removeFreeTask(task);
            let retTask = retRemFreeTask[1];
            return([retTask, null]);
        }
    }
}