import * as mocha from 'mocha';
import {expect, assert, should} from 'chai';
import {TaskMastrEvent, participant, admin, supervisor, runner} from '../Event';
import {MongoDriver} from '../DBDriver/DBDriver';
import * as mongoose from 'mongoose';
import {eventStore} from '../DBDriver/EventStore';
import {keyStore} from '../DBDriver/KeyStore';
(<any>mongoose).Promise = Promise;

describe('basic tests', () => {
    let connectPromise = mongoose.connect('mongodb://127.0.0.1:27017', {useMongoClient: true});
    after(() => {
        mongoose.disconnect();
    })
    it('we are connected', (done) => {
        connectPromise.then(() => {
            done();
        }).catch((err) => {
            done(err);
        })
    })
    it('generate keys', (done) => {
        MongoDriver.generateKeySet().then((numArr) => {
            let first = numArr[0];
            let second = numArr[1];
            let third = numArr[2];
            expect(first).to.be.a('number');
            expect(second).to.be.a('number');
            expect(third).to.be.a('number');
            keyStore.findOne({key: first}).then((val) => {
                expect(val).to.not.be.null;
            }).then(() => {
                keyStore.findOne({key: second}).then((val) => {
                    expect(val).to.not.be.null; 
                }).then(() => {
                    keyStore.findOne({key: third}).then((val) => {
                        expect(val).to.not.be.null; 
                        done();
                    }).catch((err) => {
                        done(err)
                    })
                }).catch((err) => {
                    done(err);
                })
            }).catch((err) => {
            done(err)
            })
        })
    })
})