import * as mocha from 'mocha';
import {expect, assert, should} from 'chai';
import * as chai from 'chai';
import * as chaiaspromised from "chai-as-promised";
import {TaskMastrEvent, participant, admin, supervisor, runner} from '../Event'
import {keyStore} from "../DBDriver/KeyStoreDB";
import {User} from "../DBDriver/UserDBLink";
import {eventMaterial} from "../DBDriver/MaterialDBLink";
import {DBEvent} from "../DBDriver/EventDBLink";
import {DBManager} from "../DBDriver/PGEventLink";
import "reflect-metadata";
import {createConnection, Connection} from "typeorm";
chai.use(chaiaspromised);

describe('verify keystore', () => {
    after(() => {
        createConnection()
        .then((connection) => {
            connection.getRepository(keyStore).clear();
            connection.close();
        }).catch((error) => {throw new Error(error)})
    })
    it('key generation of keys works', () => {
        createConnection().then((conn) => {
            let res = (new DBManager(conn)).generateKeys();
            expect(res).to.eventually.be.instanceof(Array);
            res.then((array) => {
                array.forEach((val) => expect(val).to.be.a("number"))
            })
            conn.close();
        });
    });
});
describe('verify event link', () => {
    after(() => {
        createConnection()
        .then((connection) => {
            connection.getRepository(DBEvent).clear();
            connection.close();
        }).catch((error) => {throw new Error(error)})
    })
    it('Event Generation succeeds', () => {
        createConnection().then((conn) => {
            let manager = new DBManager(conn);
            let tempOwner: admin = {screenName: "one", roomName: "irrelevant", location: "home", tasks: [], socketId: -1};
            let newEv = manager.createEvent("new", tempOwner, "user", "pass");
            expect(newEv).to.eventually.not.be.null;
            conn.close();
        }).catch((error) => {throw new Error(error)})
    })
})