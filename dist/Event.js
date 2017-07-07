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
}
