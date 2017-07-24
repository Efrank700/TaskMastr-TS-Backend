export class EVENT{
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
    private materialsAvailable: {itemName: String, count: Number}[]; //Name and count of free materials
    private materialsInUse: {itemName: String, count: Number, supervisorName: string}[]; //Name, count, and using supervisor
    private waitingTasks: {id: Number, task: task}[]; //Tasks currently waiting to be assigned.
    
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
                owner: admin,
                taskCount?: number,
                admins?: [admin],
                supervisors?: [supervisor],
                freeRunners?: [runner],
                taskedRunners?: [runner],
                materialsAvailable?: [{itemName: String, count: Number}],
                materialsInUse?: [{itemName: String, count: Number, supervisorName: string}],
                tasks?: [{id: Number, task: task}]) {
                    this.eventName = eventName;
                    this.adminKey = adminkey;
                    this.supervisorKey = supervisorKey;
                    this.runnerKey = runnerKey;
                    this.taskCount = taskCount !== undefined? taskCount: 0;
                    this.admins = admins !== undefined? admins: <admin[]>[];
                    this.owner = owner;
                    this.supervisors = supervisors !== undefined? supervisors: <supervisor[]>[];
                    this.freeRunners = freeRunners !== undefined? freeRunners: <runner[]>[];
                    this.taskedRunners = taskedRunners !== undefined? taskedRunners: <runner[]>[];
                    this.materialsAvailable = materialsAvailable !== undefined? materialsAvailable: <{itemName: String, count: Number}[]>[];
                    this.materialsInUse = materialsInUse !== undefined? materialsInUse: <{itemName: String, count: Number, supervisorName: string}[]>[];
                    this.waitingTasks = tasks !== undefined? tasks: <{id: Number, task: task}[]>[];
                }

    private static uniqueInsert<T>(target: T, array: T[]): void{
        let position = array.findIndex((targetItem) => {return targetItem === target});
        if(position === -1) array.push(target);
    }
    
                /**
     * @param admin
     * @returns
     */
    addAdmin(admin: admin) : admin {
        EVENT.uniqueInsert(admin, this.admins);
        return(admin);
    }

    addSupervisor(supervisor: supervisor) : supervisor{
        EVENT.uniqueInsert(supervisor, this.supervisors);
        return(supervisor);
    }

    /**
     * @param runner to be added
     * @returns runner added
     */
    addRunner(runner: runner) : runner {
        if(runner.task !== null) {
            EVENT.uniqueInsert(runner, this.taskedRunners);
            return(runner);
        }
        else {
            if(this.waitingTasks.length !== 0) {
                runner.task = this.waitingTasks[0].task;
                this.waitingTasks.splice(0, 1);
                EVENT.uniqueInsert(runner, this.taskedRunners);
                return(runner);
            }
            else {
                EVENT.uniqueInsert(runner, this.freeRunners);
                return(runner);
            }
        }
    }

    /**
     * @param screenName
     * @returns admin target Admin 
     */
    getAdminByScreenName(screenName: string) : admin | null{
        let found: number = (this.admins.findIndex((targetAdmin) => {return(targetAdmin.screenName === screenName)}));
        if(found === -1) return(null);
        else return(this.admins[found]);
    }

    /**
     * @param screenName
     * @returns supervisor target supervisor 
     */
    getSupervisorByScreenName(screenName: string) : supervisor | null{
        let found: number = (this.supervisors.findIndex((targetSup) => {return(targetSup.screenName === screenName)}));
        if(found === -1) return(null)
        else return(this.supervisors[found]);
    }

    /**
     *@param screenName
     *@return runner target runner 
     */
     getRunnerByScreenName(screenName: string) : runner | null{
       let freePos = this.freeRunners.findIndex((targetRunner) => {return targetRunner.screenName === screenName});
       if(freePos !== -1) return(this.freeRunners[freePos]);
       else{
           let taskedPos = this.taskedRunners.findIndex((targetRunner) => {return targetRunner.screenName === screenName});
           if(taskedPos !== -1) return(this.taskedRunners[taskedPos]);
           else return(null);
       }
     }

         /**
     * @param screenName
     * @returns admin target Admin 
     */
    getAdminBySocket(socketID: number) : admin | null{
        let found: number = (this.admins.findIndex((targetAdmin) => {return(targetAdmin.socketId === socketID)}));
        if(found === -1) return(null);
        else return(this.admins[found]);
    }

    /**
     * @param screenName
     * @returns supervisor target supervisor 
     */
    getSupervisorBySocket(socketID: number) : supervisor | null{
        let found: number = (this.supervisors.findIndex((targetSup) => {return(targetSup.socketId === socketID)}));
        if(found === -1) return(null)
        else return(this.supervisors[found]);
    }

    /**
     *@param screenName
     *@return runner target runner 
     */
     getRunnerBySocket(socketID: number) : runner | null{
       let freePos = this.freeRunners.findIndex((targetRunner) => {return targetRunner.socketId === socketID});
       if(freePos !== -1) return(this.freeRunners[freePos]);
       else{
           let taskedPos = this.taskedRunners.findIndex((targetRunner) => {return targetRunner.socketId === socketID});
           if(taskedPos !== -1) return(this.taskedRunners[taskedPos]);
           else return(null);
       }
     }

     /**
      * @param task 
      * @param runner
      * @return runner | null 
      */
     private assignTask(task : task, runner : runner) : runner | null {
        let runnerPos = this.freeRunners.findIndex((targetRunner) => {return targetRunner.screenName === runner.screenName});
        if(runnerPos === -1) return(null);
        else {
            let targetRunner = this.freeRunners[runnerPos];
            targetRunner.task = task;
            this.freeRunners.splice(runnerPos, 1);
            EVENT.uniqueInsert(targetRunner, this.taskedRunners);
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
            while(i < this.freeRunners.length && res == null); {
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
     * @param admin administrator to be removed
     * @return [boolean, admin| null] boolean indicates that it has been found, admin indicates removal
     */
    removeAdmin(admin : admin) : [boolean, admin | null] {
        if(this.owner === admin) return([true, null]);
        if(this.admins.length === 0) return([false, null]);
        else {
            let adminIndex: number = this.admins.findIndex((targetAdmin: admin) => {
                return(targetAdmin.screenName === admin.screenName);
            })
            if(adminIndex === -1) return([false, null]);
            else{
                let retAdmin : admin = this.admins[adminIndex];
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
     * @returns [removed, removedSupervisor]
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
     * @returns [tasked, removedRunner]
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
            let [retBool, retTask] = [retRemFreeTask[0], retRemFreeTask[1]];
            return([retTask, null]);
        }
    }

    adminList() : string[] {
        let ret = <string[]>[];
        this.admins.forEach(element => {
            ret.push(element.screenName);
        });
        return(ret);
    }
    
    supervisorList() : string[] {
        let ret = <string[]>[];
        this.supervisors.forEach(element =>{
            ret.push(element.screenName);
        })
        return(ret);
    }

    freeRunnerList() : string[] {
        let ret = <string[]>[];
        this.freeRunners.forEach(element => {
            ret.push(element.screenName);
        });
        return(ret);
    }
}
