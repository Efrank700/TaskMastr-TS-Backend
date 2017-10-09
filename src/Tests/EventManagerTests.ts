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
})