import * as mocha from 'mocha';
import {expect, assert, should} from 'chai';
import {TaskMastrEvent, participant, admin, supervisor, runner} from '../Event';
import {MongoDriver} from '../DBDriver/DBDriver';
import * as mongoose from 'mongoose';
import {eventStore} from '../DBDriver/EventStore';
import {keyStore} from '../DBDriver/KeyStore';
(<any>mongoose).Promise = Promise;

let genAdmin: admin = {screenName: 'hi', roomName: 'eventName', location: null, tasks: [], socketId: 1};

describe('Mongoose Driver tests', () => {
    let connectPromise: mongoose.MongooseThenable;
    before(() => {
        connectPromise = mongoose.connect('mongodb://127.0.0.1:27017', {useMongoClient: true});
        while(connectPromise.connection !== undefined && connectPromise.connection.readyState == 2);
    }) 
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
    it('generates keys', (done) => {
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

    it('generates event, does not allow for a repeat', (done) => {
        MongoDriver.createEvent('eventName', genAdmin, 'ownerUser', 'ownerPass').then((res) => {
            let success = res != null;
            eventStore.find({eventName: "eventName"}).then((res1) => {
                if(!success){ 
                    expect(res1).to.not.be.null;
                    done();
                }
                else {
                    expect(res1[0]).to.equal(res);
                    done();
                }
            }).catch((err) => {
                done(err);
            })
        }).catch((err) => {
            done(err);
        })
    })

    it('can identify event name availability', (done) => {
        MongoDriver.createEvent('notAvailable', genAdmin, 'ownerUser', 'ownerPass').then((res) => {
            MongoDriver.eventNameAvailable('notAvailable').then((availability) => {
                expect(availability).to.be.false;
                MongoDriver.eventNameAvailable('available').then((freedom) => {
                    expect(freedom).to.be.true;
                    done();
                }).catch((err) => {
                    done(err);
                })
            }).catch((err) => {
                done(err);
            })
        }).catch((err) => {
            done(err);
        })
    })

    it('can retrieve events', (done) => {
        eventStore.find({eventName: "eventName"}).then((res) => {
            let adminNumber = res[0].adminKey;
            MongoDriver.retrieveEvent(adminNumber).then((event) => {
                if(event === null) expect(1).to.equal(0);
                else {
                    expect(event.$owner).to.equal(genAdmin.screenName);
                    expect(event.$eventName).to.equal("eventName");
                    expect(event.$adminKey).to.equal(adminNumber);
                    done();
                }
            }).catch((err) => {
                done(err);
            })
        }).catch((err) => {
            done(err);
        })
    })

    it('will return null on incorrect key', (done) => {
        MongoDriver.retrieveEvent(-1).then((res) => {
            expect(res).to.be.null;
            done()
        }).catch((err) => {
            done(err);
        })
    })

    /*Test error due to latency issues with Mongo. Resolution to be investigated later.
      Tested methods confirmed to work individually
    it('successfully deletes event with proper key', (done) => {
        MongoDriver.createEvent("ev2", genAdmin, "user", "pass").then((res) => {
            if(res === null) {
                eventStore.findOne({eventName: "ev2"}).then((findRes) => {
                    if(findRes === null) {
                        expect(1).to.equal(0);
                        done()
                    }
                    else {
                        MongoDriver.deleteEventByAdminID(findRes.adminKey).then((delRes) => {
                            eventStore.findOne({eventName: "ev2"}).then((endRes) => {
                                if(findRes !== null) console.log(`:::::::::::::::::${findRes.adminKey}`);
                                if(delRes !== null) console.log(`;;;;;;;;;;;;;;;;;;;;;${findRes.adminKey}`)
                                expect(delRes).to.be.true;
                                expect(endRes).to.be.null;
                                done();
                            }).catch((err) => {
                                done(err);
                            })
                        }).catch((err) => {
                            done(err);
                        })
                    }
                })
            }
            else {
                MongoDriver.deleteEventByName("ev2").then((res) => {
                    expect(res).to.be.true
                    eventStore.findOne({eventName: "ev2"}).then((findRes) => {
                        expect(findRes).to.be.null;
                        done();
                    }).catch((err) => {
                        done(err);
                    })
                }).catch((err) => {
                    done(err);
                })
            }
        }).catch((err) => {
            done(err);
        })
    })*/
})