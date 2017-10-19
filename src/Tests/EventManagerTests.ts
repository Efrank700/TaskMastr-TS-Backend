import * as mocha from 'mocha';
import {expect, assert, should} from 'chai';
import {TaskMastrEvent, participant, admin, supervisor, runner} from '../Event'
import {EventManager} from '../EventManager'
let genAdmin1: admin = {screenName: "admin1", roomName: "ev1", socketId: 1, tasks: [], location: null};
let genSupervisor1: supervisor = {screenName: "supervisor1", roomName: "ev1", socketId: 2, tasks: [], location: "home"};
let genRunner1: runner = {screenName: "runner1", roomName: "ev1", socketId: 3, task: null};
let genEvent1: TaskMastrEvent = new TaskMastrEvent("ev1", 10000, 10001, 10002, genAdmin1, []);
let genAdmin2: admin = {screenName: "admin2", roomName: "ev2", socketId: 4, tasks: [], location: null};
let genSupervisor2: supervisor = {screenName: "supervisor2", roomName: "ev2", socketId: 5, tasks: [], location: "home"};
let genRunner2: runner = {screenName: "runner2", roomName: "ev2", socketId: 6, task: null};
let genEvent2: TaskMastrEvent = new TaskMastrEvent("ev2", 10003, 10004, 10005, genAdmin2, []);
let badAdmin: admin = {screenName: "admin1", roomName: "", socketId: 1, tasks: [], location: null};
let badSupervisor: supervisor = {screenName: "supervisor1", roomName: "ev3", socketId: 2, tasks: [], location: "home"};
let badRunner: runner = {screenName: "runner3", roomName: "not real", socketId: 10, task: null};

// SIMPLE CASE TESTS
describe('EventManager Event Manipulation', () => {
    let newManager = new EventManager();
    it('Creates EventManager Length 0', () => {
        expect(newManager).to.not.be.null;
        expect(newManager.getEventCount()).to.equal(0);
    })

    it("Accpets first event", () => {
        let res = newManager.addEvent(genEvent1);
        expect(res).to.equal(genEvent1);
        expect(newManager.getEventCount()).to.equal(1);
        expect(newManager.getEventList()[0]).to.equal(genEvent1);
    })

    it('Accepts second event', () => {
        let res = newManager.addEvent(genEvent2);
        expect(res).to.equal(genEvent2);
        expect(newManager.getEventCount()).to.equal(2);
        expect(newManager.getEventList()[1]).to.equal(genEvent2);
    })

    it('Does not accept duplicates', () => {
        let res = newManager.addEvent(genEvent1);
        expect(res).to.equal(genEvent1);
        expect(newManager.getEventCount()).to.equal(2);
        expect(newManager.getEventList()[0]).to.equal(genEvent1);
        expect(newManager.getEventList().length).to.equal(2);
    })

    it('Properly removes event', () => {
        let res = newManager.removeEvent(genEvent1);
        expect(res).to.equal(genEvent1);
        expect(newManager.getEventCount()).to.equal(1);
        expect(newManager.getEventList()[0]).to.equal(genEvent2);
    })

    it('Ignores removal of non-present events', () => {
        let res = newManager.removeEvent(genEvent1);
        expect(res).to.be.null;
        expect(newManager.getEventCount()).to.equal(1);
        expect(newManager.getEventList()[0]).to.equal(genEvent2);
    })
})

describe("EventManager User Manipulations", () => {
    let newManager = new EventManager();
    newManager.addEvent(genEvent1);
    newManager.addEvent(genEvent2);
    
    it("Properly inserts admins when all events are empty", () => {
        let res = newManager.addAdmin(genAdmin1);
        expect(res).to.equal(genAdmin1);
        expect(genEvent1.adminList().length).to.equal(1);
        expect(genEvent1.adminList()[0]).to.equal(genAdmin1);
        expect(genEvent2.adminList().length).to.equal(0);
    })

    it("Properly inserts admin when an event has members", () => {
        let res = newManager.addAdmin(genAdmin2);
        expect(res).to.equal(genAdmin2);
        expect(genEvent2.adminList().length).to.equal(1);
        expect(genEvent1.adminList().length).to.equal(1);
    })

    it("Returns null when adding admin of unadded channel", () => {
        let res = newManager.addAdmin(badAdmin);
        expect(res).to.be.null;
        expect(genEvent1.adminList().length).to.equal(1);
        expect(genEvent2.adminList().length).to.equal(1);
    })

    it("Properly removes admin", () => {
        let res = newManager.removeAdmin(genAdmin1);
        expect(res[0]).to.equal(genAdmin1);
        expect(genEvent1.adminList().length).to.equal(0);
        expect(genEvent2.adminList().length).to.equal(1);
    })

    it("Ignores remove on irrelevant admin", () => {
        let res = newManager.removeAdmin(badAdmin);
        expect(res[0]).to.be.null;
        expect(res[1]).to.be.null;
        expect(genEvent2.adminList().length).to.equal(1);
    })

    it("Properly inserts supervisors when all events are empty", () => {
        let res = newManager.addSupervisor(genSupervisor1);
        expect(res).to.equal(genSupervisor1);
        expect(genEvent1.supervisorList().length).to.equal(1);
        expect(genEvent1.supervisorList()[0]).to.equal(genSupervisor1);
        expect(genEvent2.supervisorList().length).to.equal(0);
    })

    it("Properly inserts supervisor when an event has members", () => {
        let res = newManager.addSupervisor(genSupervisor2);
        expect(res).to.equal(genSupervisor2);
        expect(genEvent2.supervisorList().length).to.equal(1);
        expect(genEvent1.supervisorList().length).to.equal(1);
    })

    it("Returns null when adding supervisor of unadded channel", () => {
        let res = newManager.addSupervisor(badSupervisor);
        expect(res).to.be.null;
        expect(genEvent1.supervisorList().length).to.equal(1);
        expect(genEvent2.supervisorList().length).to.equal(1);
    })

    it("Properly removes supervisor", () => {
        let res = newManager.removeSupervisor(genSupervisor1);
        expect(res[0]).to.equal(genSupervisor1);
        expect(genEvent1.supervisorList().length).to.equal(0);
        expect(genEvent2.supervisorList().length).to.equal(1);
    })

    it("Ignores remove on irrelevant supervisor", () => {
        let res = newManager.removeSupervisor(badSupervisor);
        expect(res[0]).to.be.null;
        expect(res[1]).to.be.null;
        expect(genEvent2.supervisorList().length).to.equal(1);
    })

    it("Properly inserts runner when all events are empty", () => {
        let res = newManager.addRunner(genRunner1);
        expect(res).to.equal(genRunner1);
        expect(genEvent1.freeRunnerList().length).to.equal(1);
        expect(genEvent1.freeRunnerList()[0]).to.equal(genRunner1);
        expect(genEvent2.freeRunnerList().length).to.equal(0);
    })

    it("Properly inserts runner when an event has members", () => {
        let res = newManager.addRunner(genRunner2);
        expect(res).to.equal(genRunner2);
        expect(genEvent2.freeRunnerList().length).to.equal(1);
        expect(genEvent1.freeRunnerList().length).to.equal(1);
    })

    it("Returns null when adding runner of unadded channel", () => {
        let res = newManager.addRunner(badRunner);
        expect(res).to.be.null;
        expect(genEvent1.freeRunnerList().length).to.equal(1);
        expect(genEvent2.freeRunnerList().length).to.equal(1);
    })

    it("Properly removes runner", () => {
        let res = newManager.removeRunner(genRunner1);
        expect(res[0]).to.be.false;
        expect(res[1]).to.equal(genRunner1);
        expect(genEvent1.freeRunnerList().length).to.equal(0);
        expect(genEvent2.freeRunnerList().length).to.equal(1);
    })

    it("Ignores remove on irrelevant runner", () => {
        let res = newManager.removeRunner(badRunner);
        expect(res[0]).to.be.false;
        expect(res[1]).to.be.null;
        expect(genEvent2.freeRunnerList().length).to.equal(1);
    })
})