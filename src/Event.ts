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
     assignTask(task : task, runner : runner) : runner | null {
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

     unassignTask(runner : runner) : [task | null, runner | null] {
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

     addTask(task : task) : [boolean, task, runner | null]{
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
    removeAdmin(admin: admin) : [boolean, admin | null] {
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

    removeSupervisor(supervisor : supervisor) : [boolean, supervisor | null] {
        
    }
    
}