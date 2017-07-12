"use strict";
class EVENT {
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
    constructor(eventName, adminkey, supervisorKey, runnerKey, administrator, owner, taskCount, admins, supervisors, freeRunners, taskedRunners, materialsAvailable, materialsInUse, tasks) {
        this.eventName = eventName;
        this.adminKey = adminkey;
        this.supervisorKey = supervisorKey;
        this.runnerKey = runnerKey;
        this.owner = owner !== undefined ? owner : "";
        this.taskCount = taskCount !== undefined ? taskCount : 0;
        this.admins = admins !== undefined ? admins : null;
        if (administrator !== undefined) {
            this.owner = administrator.screenName;
            if (this.admins === null)
                this.admins = [administrator];
            else
                this.admins.push(administrator);
        }
        this.supervisors = supervisors !== undefined ? supervisors : null;
        this.freeRunners = freeRunners !== undefined ? freeRunners : null;
        this.taskedRunners = taskedRunners !== undefined ? taskedRunners : null;
        this.materialsAvailable = materialsAvailable !== undefined ? materialsAvailable : null;
        this.materialsInUse = materialsInUse !== undefined ? materialsInUse : null;
        this.waitingTasks = tasks !== undefined ? tasks : null;
    }
    /**
     * @param admin
     * @returns
     */
    addAdmin(admin) {
        if (this.admins === null)
            this.admins = [admin];
        else
            this.admins.push(admin);
        return (admin);
    }
    addSupervisor(supervisor) {
        if (this.supervisors === null)
            this.supervisors = [supervisor];
        else
            this.supervisors.push(supervisor);
        return (supervisor);
    }
    /**
     * @param runner to be added
     * @returns runner added
     */
    addRunner(runner) {
        if (runner.task !== null) {
            if (this.taskedRunners === null)
                this.taskedRunners = [runner];
            else
                this.taskedRunners.push(runner);
            return (runner);
        }
        else {
            if (this.waitingTasks !== null) {
                if (this.waitingTasks.length !== 0) {
                    runner.task = this.waitingTasks[this.waitingTasks.length - 1].task;
                    this.waitingTasks.pop();
                    if (this.taskedRunners === null)
                        this.taskedRunners = [runner];
                    else
                        this.taskedRunners.push(runner);
                    return (runner);
                }
                else {
                    if (this.freeRunners === null)
                        this.freeRunners = [runner];
                    else
                        this.freeRunners.push(runner);
                    return (runner);
                }
            }
            else {
                if (this.freeRunners === null)
                    this.freeRunners = [runner];
                else
                    this.freeRunners.push(runner);
                return (runner);
            }
        }
    }
    /**
     * @param screenName
     * @returns admin target Admin
     */
    getAdminByScreenName(screenName) {
        if (this.admins === null)
            return (null);
        else {
            let found = (this.admins.findIndex((targetAdmin) => { return (targetAdmin.screenName === screenName); }));
            if (found === -1)
                return (null);
            else
                return (this.admins[found]);
        }
    }
    /**
     * @param screenName
     * @returns supervisor target supervisor
     */
    getSupervisorByScreenName(screenName) {
        if (this.supervisors === null)
            return (null);
        else {
            let found = (this.supervisors.findIndex((targetSup) => { return (targetSup.screenName === screenName); }));
            if (found === -1)
                return (null);
            else
                return (this.supervisors[found]);
        }
    }
    /**
     *@param screenName
     *@return runner target runner
     */
    getRunnerByScreenName(screenName) {
        if (this.freeRunners === null) {
            if (this.taskedRunners === null)
                return (null);
            else {
                let runnerPos = this.taskedRunners.findIndex((targetRunner) => { return targetRunner.screenName === screenName; });
                if (runnerPos === -1)
                    return (null);
                else
                    return (this.taskedRunners[runnerPos]);
            }
        }
        else {
            let runnerPos = this.freeRunners.findIndex((targetRunner) => { return targetRunner.screenName === screenName; });
            if (runnerPos === -1) {
                if (this.taskedRunners === null)
                    return (null);
                else {
                    runnerPos = this.taskedRunners.findIndex((targetRunner) => { return targetRunner.screenName === screenName; });
                    if (runnerPos === -1)
                        return (null);
                    else
                        return (this.taskedRunners[runnerPos]);
                }
            }
            else
                return (this.freeRunners[runnerPos]);
        }
    }
    /**
     * @param task
     * @param runner
     * @return runner | null
     */
    assignTask(task, runner) {
        if (this.freeRunners === null)
            return (null);
        else {
            let runnerPos = this.freeRunners.findIndex((targetRunner) => { return targetRunner.screenName === runner.screenName; });
            if (runnerPos === -1)
                return (null);
            else {
                let targetRunner = this.freeRunners[runnerPos];
                targetRunner.task = task;
                this.freeRunners.splice(runnerPos, 1);
                if (this.taskedRunners === null)
                    this.taskedRunners = [targetRunner];
                else
                    this.taskedRunners.push(targetRunner);
                return (targetRunner);
            }
        }
    }
    unassignTask(runner) {
        if (runner.task === null)
            return ([null, null]);
        let runnerTask = runner.task;
        runner.task = null;
        if (this.taskedRunners === null)
            return ([runnerTask, null]);
        else {
            let runnerIndex = this.taskedRunners.findIndex((targetRunner) => { return targetRunner === runner; });
            if (runnerIndex === -1) {
                if (runner.roomName === this.eventName) {
                    if (this.freeRunners === null) {
                        this.freeRunners = [runner];
                        return ([runnerTask, runner]);
                    }
                    else {
                        let secondIndex = this.freeRunners.findIndex((targetRunner) => { return targetRunner === runner; });
                        if (secondIndex === -1) {
                            this.freeRunners.push(runner);
                            return ([runnerTask, runner]);
                        }
                        else
                            return ([runnerTask, runner]);
                    }
                }
                else
                    return ([null, runner]);
            }
            else {
                this.taskedRunners.splice(runnerIndex, 1);
                if (runner.roomName === this.eventName) {
                    if (this.freeRunners === null) {
                        this.freeRunners = [runner];
                        return ([runnerTask, runner]);
                    }
                    else {
                        let secondIndex = this.freeRunners.findIndex((targetRunner) => { return targetRunner === runner; });
                        if (secondIndex === -1) {
                            this.freeRunners.push(runner);
                            return ([runnerTask, runner]);
                        }
                        else
                            return ([runnerTask, runner]);
                    }
                }
                else
                    return ([null, runner]);
            }
        }
    }
    addTask(task) {
        task.supervisor.tasks.push(task);
        if (this.freeRunners === null) {
            if (this.waitingTasks === null) {
                this.waitingTasks = [{ id: this.taskCount, task: task }];
                this.taskCount++;
                return ([false, task, null]);
            }
            else {
                this.waitingTasks.push({ id: this.taskCount, task: task });
                this.taskCount++;
                return ([false, task, null]);
            }
        }
        else {
            if (this.freeRunners.length > 0) {
                let res;
                let i = 0;
                do {
                    res = this.assignTask(task, this.freeRunners[i]);
                    i++;
                } while (i < this.freeRunners.length && res == null);
                if (res == null) {
                    if (this.waitingTasks === null) {
                        this.waitingTasks = [{ id: this.taskCount, task: task }];
                        this.taskCount++;
                        return ([false, task, null]);
                    }
                    else {
                        this.waitingTasks.push({ id: this.taskCount, task: task });
                        this.taskCount++;
                        return ([false, task, null]);
                    }
                }
                else {
                    let runner = this.assignTask(task, res);
                    return ([true, task, runner]);
                }
            }
            else {
                if (this.waitingTasks === null) {
                    this.waitingTasks = [{ id: this.taskCount, task: task }];
                    this.taskCount++;
                    return ([false, task, null]);
                }
                else {
                    this.waitingTasks.push({ id: this.taskCount, task: task });
                    this.taskCount++;
                    return ([false, task, null]);
                }
            }
        }
    }
    /**
     * @param admin administrator to be removed
     * @return [boolean, admin| null] boolean indicates that it has been found, admin indicates removal
     */
    removeAdmin(admin) {
        if (this.owner === admin.screenName)
            return ([true, null]);
        else {
            if (this.admins === null)
                return ([false, null]);
            else {
                let adminIndex = this.admins.findIndex((targetAdmin) => {
                    return (targetAdmin.screenName === admin.screenName);
                });
                if (adminIndex === -1)
                    return ([false, null]);
                else {
                    this.admins.splice(adminIndex, 1);
                    return ([true, admin]);
                }
            }
        }
    }
    removeSupervisor(supervisor) {
        if (this.supervisors === null)
            return ([false, null]);
        if (this.supervisors.length === 0)
            return ([false, null]);
        else {
            let supervisorIndex = this.supervisors.findIndex((targetSupervisor) => {
                return targetSupervisor === supervisor;
            });
            if (supervisorIndex === -1)
                return ([true, null]);
            else {
                let retSupervisor = this.supervisors[supervisorIndex];
                this.supervisors.splice(supervisorIndex, 1);
                return ([true, retSupervisor]);
            }
        }
    }
    removeRunner(runner) {
        if (this.freeRunners === null && this.taskedRunners === null)
            return ([false, null]);
        else {
            if (this.freeRunners === null) {
                if (this.taskedRunners !== null) {
                    let taskedIndex = this.taskedRunners.findIndex((targetRunner) => { return targetRunner === runner; });
                    if (taskedIndex === -1)
                        return ([false, null]);
                    else {
                        let [task, targetRunner] = this.unassignTask(this.taskedRunners[taskedIndex]);
                        if (task === null) {
                            return ([false, null]);
                        }
                        else {
                            if (targetRunner === null) {
                                return ([true, null]);
                            }
                            else {
                                return (this.removeRunner(targetRunner));
                            }
                        }
                    }
                }
                else {
                    return ([false, null]);
                }
            }
            else {
                let firstIndex = this.freeRunners.findIndex((targetRunner) => { return targetRunner === runner; });
                if (firstIndex === -1) {
                    if (this.taskedRunners === null)
                        return ([false, null]);
                    else {
                        let secondIndex = this.taskedRunners.findIndex((targetRunner) => { return targetRunner === runner; });
                        if (secondIndex === -1)
                            return ([true, null]);
                        else {
                            let newRunner = this.taskedRunners[secondIndex];
                            this.taskedRunners.splice(secondIndex, 1);
                            return ([true, newRunner]);
                        }
                    }
                }
                else {
                    let newRunner = this.freeRunners[firstIndex];
                    this.freeRunners.splice(firstIndex, 1);
                    return ([true, newRunner]);
                }
            }
        }
    }
    taskIsAssigned(task) {
        if (this.taskedRunners === null)
            return (false);
        else {
            let taskIndex = this.taskedRunners.findIndex((targetRunner) => { return targetRunner.task === task; });
            return (taskIndex !== -1);
        }
    }
    removeAssignedTask(task) {
        if (this.taskedRunners === null)
            return ([false, null, null]);
        else {
            let taskedIndex = this.taskedRunners.findIndex((targetRunner) => { return targetRunner.task === task; });
            if (taskedIndex === -1)
                return ([true, null, null]);
            else {
                let targetTask = this.taskedRunners[taskedIndex].task;
                if (targetTask === null)
                    return ([false, null, null]);
                else {
                    let [retTask, retRunner] = this.unassignTask(this.taskedRunners[taskedIndex]);
                    let [success, freedTask] = this.removeFreeTask(targetTask);
                    return ([success, freedTask, retRunner]);
                }
            }
        }
    }
    removeFreeTask(task) {
    }
}
