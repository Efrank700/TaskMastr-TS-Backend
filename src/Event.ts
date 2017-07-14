class EVENT{
    private eventName: string;
    private adminKey: number;
    private supervisorKey: number;
    private runnerKey: number;
    private owner: string;
    private taskCount: number;
    private admins: admin[] | null;
    private supervisors: supervisor[] | null;
    private freeRunners: runner[] | null;
    private taskedRunners: runner[] | null;
    private materialsAvailable: {itemName: String, count: Number}[] | null;
    private materialsInUse: {itemName: String, count: Number, supervisorName: string}[] | null;
    private waitingTasks: {id: Number, task: task}[] | null;
    
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
                administrator?: admin,
                owner?: string,
                taskCount?: number,
                admins?: [admin],
                supervisors?: [supervisor],
                freeRunners?: [runner],
                taskedRunners?: [runner],
                materialsAvailable?: [{itemName: String, count: Number}],
                materialsInUse?: [{itemName: String, count: Number, supervisorName: string}],
                tasks?: [{id: Number, task: task}] | null) {
                    this.eventName = eventName;
                    this.adminKey = adminkey;
                    this.supervisorKey = supervisorKey;
                    this.runnerKey = runnerKey;
                    this.owner = owner !== undefined? owner: "";
                    this.taskCount = taskCount !== undefined? taskCount: 0;
                    this.admins = admins !== undefined? admins: null;
                    if(administrator !== undefined) {
                        this.owner = administrator.screenName;
                        if(this.admins === null) this.admins = [administrator];
                        else this.admins.push(administrator);
                    }
                    this.supervisors = supervisors !== undefined? supervisors: null;
                    this.freeRunners = freeRunners !== undefined? freeRunners: null;
                    this.taskedRunners = taskedRunners !== undefined? taskedRunners: null;
                    this.materialsAvailable = materialsAvailable !== undefined? materialsAvailable: null;
                    this.materialsInUse = materialsInUse !== undefined? materialsInUse: null;
                    this.waitingTasks = tasks !== undefined? tasks: null;
                }

    /**
     * @param admin
     * @returns
     */
    addAdmin(admin: admin) : admin {
        if(this.admins === null) this.admins = [admin];
        else this.admins.push(admin);
        return(admin);
    }

    addSupervisor(supervisor: supervisor) : supervisor{
        if(this.supervisors === null) this.supervisors = [supervisor];
        else this.supervisors.push(supervisor);
        return(supervisor);
    }

    /**
     * @param runner to be added
     * @returns runner added
     */
    addRunner(runner: runner) : runner {
        if(runner.task !== null) {
            if(this.taskedRunners === null) this.taskedRunners = [runner];
            else this.taskedRunners.push(runner);
            return(runner);
        }
        else {
            if(this.waitingTasks !== null) {
                if(this.waitingTasks.length !== 0) {
                    runner.task = this.waitingTasks[this.waitingTasks.length - 1].task;
                    this.waitingTasks.pop();
                    if(this.taskedRunners === null) this.taskedRunners = [runner];
                    else this.taskedRunners.push(runner);
                    return(runner);
                }
                else {
                    if(this.freeRunners === null) this.freeRunners = [runner];
                    else this.freeRunners.push(runner);
                    return(runner);
                }
            }
            else {
                if(this.freeRunners === null) this.freeRunners = [runner];
                else this.freeRunners.push(runner);
                return(runner);
            }
        }
    }

    /**
     * @param screenName
     * @returns admin target Admin 
     */
    getAdminByScreenName(screenName: string) : admin | null{
        if(this.admins === null) return(null);
        else {
            let found: number = (this.admins.findIndex((targetAdmin) => {return(targetAdmin.screenName === screenName)}));
            if(found === -1) return(null)
            else return(this.admins[found]);
        }
    }

    /**
     * @param screenName
     * @returns supervisor target supervisor 
     */
    getSupervisorByScreenName(screenName: string) : supervisor | null{
        if(this.supervisors === null) return(null);
        else {
            let found: number = (this.supervisors.findIndex((targetSup) => {return(targetSup.screenName === screenName)}));
            if(found === -1) return(null)
            else return(this.supervisors[found]);
        }
    }

    /**
     *@param screenName
     *@return runner target runner 
     */
     getRunnerByScreenName(screenName: string) : runner | null{
        if(this.freeRunners === null) {
            if(this.taskedRunners === null) return(null);
            else {
                let runnerPos : number = this.taskedRunners.findIndex((targetRunner) => {return targetRunner.screenName === screenName});
                if(runnerPos === -1) return(null);
                else return(this.taskedRunners[runnerPos]);
            }
        }
        else {
            let runnerPos : number = this.freeRunners.findIndex((targetRunner) => {return targetRunner.screenName === screenName});
            if(runnerPos === -1) {
                if(this.taskedRunners === null) return(null);
                else {
                    runnerPos = this.taskedRunners.findIndex((targetRunner) => {return targetRunner.screenName === screenName});
                    if(runnerPos === -1) return(null);
                    else return(this.taskedRunners[runnerPos]);
                }
            }
            else return(this.freeRunners[runnerPos]);
        }
     }

     /**
      * @param task 
      * @param runner
      * @return runner | null 
      */
     private assignTask(task : task, runner : runner) : runner | null {
         if(this.freeRunners === null) return(null);
         else {
             let runnerPos = this.freeRunners.findIndex((targetRunner) => {return targetRunner.screenName === runner.screenName});
             if(runnerPos === -1) return(null);
             else {
                 let targetRunner = this.freeRunners[runnerPos];
                 targetRunner.task = task;
                 this.freeRunners.splice(runnerPos, 1);
                 if(this.taskedRunners === null) this.taskedRunners = [targetRunner];
                 else this.taskedRunners.push(targetRunner);
                 return(targetRunner);
             }
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
        if(this.taskedRunners === null) return([runnerTask, null]);
        else {
            let runnerIndex = this.taskedRunners.findIndex((targetRunner) => {return targetRunner === runner});
            if(runnerIndex === -1) {
                if(runner.roomName === this.eventName) {
                    if(this.freeRunners === null) {
                        this.freeRunners = [runner];
                        return([runnerTask, runner]);
                    }
                    else {
                        let secondIndex = this.freeRunners.findIndex((targetRunner) => {return targetRunner === runner});
                        if(secondIndex === -1) {
                            this.freeRunners.push(runner);
                            return([runnerTask, runner]);
                        }
                        else return([runnerTask, runner]);
                    }
                }
                else return([null, runner]);
            }
            else {
                this.taskedRunners.splice(runnerIndex, 1);
                if(runner.roomName === this.eventName) {
                    if(this.freeRunners === null) {
                        this.freeRunners = [runner];
                        return([runnerTask, runner]);
                    }
                    else {
                        let secondIndex = this.freeRunners.findIndex((targetRunner) => {return targetRunner === runner});
                        if(secondIndex === -1) {
                            this.freeRunners.push(runner);
                            return([runnerTask, runner]);
                        }
                        else return([runnerTask, runner]);
                    }
                }
                else return([null, runner]);
            }
        }
    }
    /**
     * @param task
     * @returns [assigned, task, assignedRunner]
     */
     addTask(task : task) : [boolean, task, runner | null]{
         task.supervisor.tasks.push(task);
         if(this.freeRunners === null) {
             if(this.waitingTasks === null) {
                 this.waitingTasks = [{id: this.taskCount, task: task}];
                 this.taskCount++;
                 return([false, task, null]);
             }
             else{
                 this.waitingTasks.push({id: this.taskCount, task: task});
                 this.taskCount++;
                 return([false, task, null]);
             }
         }
         else{
            if(this.freeRunners.length > 0) {
                let res : runner | null;
                let i : number = 0;
                do {
                    res = this.assignTask(task, this.freeRunners[i]);
                    i++;
                } while(i < this.freeRunners.length && res == null);
                if(res == null) {
                    if(this.waitingTasks === null) {
                        this.waitingTasks = [{id: this.taskCount, task: task}];
                        this.taskCount++;
                        return([false, task, null]);
                    }   
                    else{
                        this.waitingTasks.push({id: this.taskCount, task: task});
                        this.taskCount++;
                        return([false, task, null]);
                    }
                }
                else {
                    let runner : runner | null = this.assignTask(task, res);
                    return([true, task, runner]);
                }
            }
            else {
                if(this.waitingTasks === null) {
                    this.waitingTasks = [{id: this.taskCount, task: task}];
                    this.taskCount++;
                    return([false, task, null]);
                }   
                else{
                    this.waitingTasks.push({id: this.taskCount, task: task});
                    this.taskCount++;
                    return([false, task, null]);
                }
            }
         }
     }

    /**
     * @param admin administrator to be removed
     * @return [boolean, admin| null] boolean indicates that it has been found, admin indicates removal
     */
    removeAdmin(admin : admin) : [boolean, admin | null] {
        if(this.owner === admin.screenName) return([true, null]);
        else {
            if(this.admins === null) return([false, null]);
            else {
                let adminIndex: number = this.admins.findIndex((targetAdmin: admin) => {
                    return(targetAdmin.screenName === admin.screenName);
                })
                if(adminIndex === -1) return([false, null]);
                else{
                    this.admins.splice(adminIndex, 1);
                    return([true, admin]);
                }
            }
        }
    }
    /**
     * @param supervisor
     * @returns [removed, removedSupervisor]
     */
    removeSupervisor(supervisor : supervisor) : [boolean, supervisor | null] {
        if(this.supervisors === null) return([false, null]);
        if(this.supervisors.length === 0) return([false, null]);
        else {
            let supervisorIndex = this.supervisors.findIndex((targetSupervisor : supervisor) => {
                return targetSupervisor === supervisor;
            });
            if(supervisorIndex === -1) return([true, null]);
            else {
                let retSupervisor : supervisor = this.supervisors[supervisorIndex];
                retSupervisor.tasks.forEach(element => {
                    
                });
                this.supervisors.splice(supervisorIndex, 1);
                return([true, retSupervisor]);
            }
        }
    }
    /**
     * @param runner
     * @returns [found, removedRunner]
     */
    removeRunner(runner : runner) : [boolean, runner | null] {
        if(this.freeRunners === null && this.taskedRunners === null) return([false, null]);
        else {
            if(this.freeRunners === null) {
                if(this.taskedRunners !== null) {
                    let taskedIndex = this.taskedRunners.findIndex((targetRunner) => {return targetRunner === runner});
                    if(taskedIndex === -1) return([false, null]);
                    else {
                        let [task, targetRunner] = this.unassignTask(this.taskedRunners[taskedIndex]);
                        if(task === null) {
                            return([false, null]);
                        }
                        else {
                            if(targetRunner === null) {
                                return([true, null]);
                            }
                            else {
                                return(this.removeRunner(targetRunner));
                            }
                        }
                    }
                }
                else {
                    return([false, null]);
                }
            }
            else {
                let firstIndex = this.freeRunners.findIndex((targetRunner) => {return targetRunner === runner});
                if(firstIndex === -1) {
                    if(this.taskedRunners === null) return([false, null]);
                    else {
                        let secondIndex = this.taskedRunners.findIndex((targetRunner) => {return targetRunner === runner});
                        if(secondIndex === -1) return([true, null]);
                        else {
                            let newRunner = this.taskedRunners[secondIndex];
                            this.taskedRunners.splice(secondIndex, 1);
                            return([true, newRunner]);
                        }
                    }
                }
                else {
                    let newRunner = this.freeRunners[firstIndex];
                    this.freeRunners.splice(firstIndex, 1);
                    return([true, newRunner]);
                }
            }
        }
    }
    /**
     * @param task 
     * @returns isAssigned
     */
    private taskIsAssigned(task : task) : boolean {
        if(this.taskedRunners === null) return(false);
        else{
            let taskIndex = this.taskedRunners.findIndex((targetRunner) => {return targetRunner.task === task});
            return(taskIndex !== -1);
        }
    }
    /**
     * @param task
     * @returns [tasksExist, taskRemoved, taskedRunner] 
     */
    private removeAssignedTask(task : task) : [boolean, task | null, runner | null] {
        if(this.taskedRunners === null) return([false, null, null]);
        else {
            let taskedIndex = this.taskedRunners.findIndex((targetRunner) => {return targetRunner.task === task});
            if(taskedIndex === -1) return([true, null, null]);
            else {
                let targetTask = this.taskedRunners[taskedIndex].task;
                if(targetTask === null) return([false, null, null]);
                else {
                    let [retTask, retRunner] = this.unassignTask(this.taskedRunners[taskedIndex]);
                    if(retTask === null) return([true, null, null]);
                    else{
                        let [success, freeTask] = this.removeFreeTask(retTask);
                        return([success, freeTask, retRunner]);
                    }
                }
            }
        }
    }
    /**
     * @param task
     * @returns [removed, taskInEvent] 
     */
    private removeFreeTask(task : task) : [boolean, task | null] {
        if(this.waitingTasks === null) return([false, null]);
        else {
            let taskIndex = this.waitingTasks.findIndex((targetTask) => {return targetTask.task === task});
            if(taskIndex === -1) return([true, null]);
            else {
                let targetTask = this.waitingTasks[taskIndex];
                this.waitingTasks.splice(taskIndex, 1);
                return([true, targetTask.task]);
            }
        }
    }
    /**
     * @param task
     * @returns [removed, taskInEvent, taskedRunner] 
     */
    removeTask(task : task) : [boolean, task | null, runner | null] {
        if(this.taskIsAssigned(task)) return(this.removeAssignedTask(task));
        else {
            let [retBool, retTask] = this.removeFreeTask(task)
            return([retBool, retTask, null]);
        }
    }
}