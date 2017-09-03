import * as mocha from 'mocha';
import {expect, assert, should} from 'chai';
import {TaskMastrEvent} from '../Event';

import {task} from "../task";
import {participant, admin, supervisor, runner} from "../Participant";

const genAdmin: admin = {screenName: "hello", roomName: "hello", tasks: <task[]>[], location: null, socketId: 10};
const secondAdmin: admin = {screenName: "hi", roomName: "hello", tasks: <task[]>[], location: null, socketId: 9};
const genSupervisor: supervisor = {screenName: "wow", roomName: "hello", tasks: <task[]>[], location: "null", socketId: 11};
const genRunner: runner = {screenName: "woot", roomName: "hello", task: null, socketId: 15};

describe('Event Generation', () => {
    const newEvent = new TaskMastrEvent("hello", 100, 101, 102, genAdmin, <{itemName: string, count: number}[]>[]);
    it('should generate a new Event', () => {
        expect(newEvent).to.not.equal(null);
    })
    it('can get owner', () => {
        expect(newEvent.$owner).to.equal(genAdmin);
    })
    it('can add admin', () => {
        expect(newEvent.addAdmin(secondAdmin)).to.equal(secondAdmin);
    })
    it('can add supervisor', () => {
        expect(newEvent.addSupervisor(genSupervisor)).to.equal(genSupervisor);
    })
    it('can add runner', () => {
        expect(newEvent.addRunner(genRunner)).to.equal(genRunner);
    })
    it('can get admins, supervisors, and runners', () => {
        newEvent.addAdmin(secondAdmin);
        newEvent.addSupervisor(genSupervisor);
        newEvent.addRunner(genRunner);
        expect(newEvent.adminList()[0]).to.equal(genAdmin);
        expect(newEvent.adminList()[1]).to.equal(secondAdmin);
        expect(newEvent.supervisorList()[0]).to.equal(genSupervisor);
        expect(newEvent.freeRunnerList()[0]).to.equal(genRunner);
    })
})

describe('Participant Removal', () => {
    const newEvent = new TaskMastrEvent("hello", 100, 101, 102, genAdmin, <{itemName: string, count: number}[]>[]);
    newEvent.addAdmin(secondAdmin);
    newEvent.addSupervisor(genSupervisor);
    newEvent.addRunner(genRunner);
    it('can remove a non-owner admin', () => {
        expect(newEvent.removeAdmin(secondAdmin)[1]).to.equal(secondAdmin)
    })
    it('can find but not remove owner', () => {
        let result = newEvent.removeAdmin(genAdmin);
        expect(result[0]).to.equal(true);
        expect(result[1]).to.equal(null);
    })
})
/*describe('Material manipulation', () => {
    const newEvent = new TaskMastrEvent("hello", 100, 101, 102, genAdmin);
    newEvent.addSupervisor(genSupervisor);
    newEvent.addRunner(genRunner);
    it('addition of materials', () => {
        newEvent.
    })
})*/
