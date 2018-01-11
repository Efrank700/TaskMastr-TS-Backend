import * as mocha from 'mocha';
import {expect, assert, should} from 'chai';
import {TaskMastrEvent, participant, admin, supervisor, runner} from '../Event';
import {MongoDriver} from '../DBDriver/DBDriver';
import * as mongoose from 'mongoose';
import {eventStore} from '../DBDriver/EventStore';
import {keyStore} from '../DBDriver/KeyStore';
import { participantTypes } from '../Participant';
(<any>mongoose).Promise = Promise;

let genAdmin1: admin = {screenName: 'hi', roomName: 'eventName', location: null, tasks: [], socketId: 1};
let genAdmin2: admin = {screenName: 'hi', roomName: 'eventName', location: null, tasks: [], socketId: 1};
let genAdmin3: admin = {screenName: 'hi', roomName: 'eventName', location: null, tasks: [], socketId: 1};
let genAdmin4: admin = {screenName: 'hi', roomName: 'eventName', location: null, tasks: [], socketId: 1};
let genAdmin5: admin = {screenName: 'hi', roomName: 'eventName', location: null, tasks: [], socketId: 1};
let genAdmin6: admin = {screenName: 'hi', roomName: 'eventName', location: null, tasks: [], socketId: 1};

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
        MongoDriver.createEvent('eventName', genAdmin1, 'ownerUser', 'ownerPass').then((res) => {
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
        MongoDriver.createEvent('notAvailable', genAdmin2, 'ownerUser', 'ownerPass').then((res) => {
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
                    expect(event.$owner).to.equal(genAdmin1.screenName);
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
      Tested methods confirmed to work individually.*/
    it('successfully deletes event with proper key', (done) => {
        MongoDriver.createEvent("ev2", genAdmin3, "user", "pass").then((res) => {
            if(res === null) {
                eventStore.findOne({eventName: "ev2"}).then((findRes) => {
                    if(findRes === null) {
                        expect(1).to.equal(0);
                        done()
                    }
                    else {
                        MongoDriver.deleteEventByAdminID(findRes.adminKey).then((delRes) => {
                            eventStore.findOne({eventName: "ev2"}).then((endRes) => {
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
    })

    it('will return null if admin key is not valid', (done) => {
        MongoDriver.deleteEventByAdminID(-1).then((res) => {
            expect(res).to.be.false;
            done();
        }).catch((err) => {
            done(err);
        })
    })
    
    it('will return null if event name is not valid', (done) => {
        MongoDriver.deleteEventByName("invalidEV").then((res) => {
            expect(res).to.be.false;
            done();
        }).catch((err) => {
            done(err);
        })
    })

    it('can add user properly given proper values', function(done) {
        this.retries(2);
        MongoDriver.createEvent("userEvent", genAdmin4, "user", "pass").then((res) => {
            if(res === null) {
                eventStore.findOne({eventName: "userEvent"}).then((findRes) => {
                    if(findRes === null) {
                        expect(1).to.equal(0);
                        done()
                    }
                    else {
                        MongoDriver.addUser(findRes.adminKey, "target", "target", "target").then((addRes) => {
                            expect(addRes).to.equal(participantTypes.admin);
                            eventStore.findOne({eventName: "userEvent"}).then((findRes) => {
                                if(findRes === null) {
                                    expect(1).to.equal(2);
                                    eventStore.findOneAndRemove({eventName: "userEvent"}).then((end) => {
                                        done()
                                    }).catch((err) => {
                                        done(err);
                                    })
                                }
                                else {
                                    expect(findRes.logins.length).to.equal(2);
                                    expect(findRes.logins.findIndex((target) => {
                                        return target.screenName == "target";
                                    })).to.not.equal(-1);
                                    eventStore.findOneAndRemove({eventName: "userEvent"}).then((end) => {
                                        done()
                                    }).catch((err) => {
                                        done(err);
                                    })
                                }
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
            }
            else {
                MongoDriver.addUser(res.$adminKey, "target", "target", "target").then((addRes) => {
                    expect(addRes).to.equal(participantTypes.admin);
                    eventStore.findOne({eventName: "userEvent"}).then((findRes) => {
                        if(findRes === null) {
                            expect(1).to.equal(3);
                            eventStore.findOneAndRemove({eventName: "userEvent"}).then((end) => {
                                done()
                            }).catch((err) => {
                                done(err);
                            })
                        }
                        else {
                            expect(findRes.logins.length).to.equal(2);
                            expect(findRes.logins.findIndex((target) => {
                                return target.screenName == "target";
                            })).to.not.equal(-1);
                            eventStore.findOneAndRemove({eventName: "userEvent"}).then((end) => {
                                done()
                            }).catch((err) => {
                                done(err);
                            })
                        }
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
    })

    it('Throws error when attempting to add a repeat user', (done) => {
        MongoDriver.addUser(1111, "user", "screen", "pass").then((typeRes) => {
            if(typeRes === null) {
                expect(0).to.equal(1);
                done()
            }
            else {
                MongoDriver.addUser(1111, "user", "screen", "pass").then((res) => {
                    if(res != undefined) expect(0).to.equal(2);
                    done()
                }).catch((err) => {
                    const castErr = err as Error;
                    if(castErr.message === "SUEXISTS") {
                        expect(1).to.equal(1);
                        done()
                    }
                    else {
                        done(err);
                    }
                })
            }
        }).catch((err) => {
            const castErr = err as Error;
            if(castErr.message === "SUEXISTS") {
                expect(1).to.equal(1);
                done()
            }
            else {
                done(err);
            }
        })
    })

    it('Returns null when finding unlisted event', (done) => {
        MongoDriver.addUser(-1, "user", "screen", "pass").then((res) => {
            expect(res).to.be.null;
            done()
        }).catch((err) => {
            done(err);
        })
    })

    it('authenticates when supplied proper info', (done) => {
        MongoDriver.authenticate(1111, "user", "pass").then((res) => {
            if(res === null) {
                expect(0).to.equal(1);
                done();
            }
            else {
                expect(res[0]).to.be.true;
                expect(res[1]).to.equal("screen");
                expect(res[2]).to.equal(participantTypes.admin);
                done();
            }
        }).catch((err) => {
            done(err);
        })
    })

    it('fails authentication when supplied incorrect key', (done) => {
        MongoDriver.authenticate(1112, "user", "pass").then((res) => {
            if(res === null) {
                expect(0).to.equal(1);
                done();
            }
            else {
                expect(res[0]).to.be.false;
                expect(res[1]).to.equal("IKEY");
                expect(res[2]).to.equal(participantTypes.admin);
                done();
            }
        }).catch((err) => {
            done(err);
        })
    })

    it('fails authentication when supplied invalid event', (done) => {
        MongoDriver.authenticate(-1, "user", "pass").then((res) => {
            expect(res[0]).to.be.false;
            expect(res[1]).to.equal("NSEVENT");
            expect(res[2]).to.equal(participantTypes.admin);
            done();
        }).catch((err) => {
            done(err);
        })
    })

    it('fails authentication when supplied invalid username', (done) => {
        MongoDriver.authenticate(1111, "user1", "pass").then((res) => {
            expect(res[0]).to.be.false;
            expect(res[1]).to.equal("NSUSER");
            expect(res[2]).to.equal(participantTypes.admin);
            done();
        }).catch((err) => {
            done(err);
        })
    })

    it('fails authentication when supplied invalid password', (done) => {
        MongoDriver.authenticate(1111, "user", "pass1").then((res) => {
            expect(res[0]).to.be.false;
            expect(res[1]).to.equal("IPASS");
            expect(res[2]).to.equal(participantTypes.admin);
            done();
        }).catch((err) => {
            done(err);
        })
    })

    it('can delete user', function(done) {
        this.retries(2);
        MongoDriver.addUser(1111, "user", "screen", "pass").then((res) => {
            MongoDriver.deleteUser(1111, "user").then((ev) => {
                expect(ev).to.be.true;
                done()
            }).catch((err) => {
                done(err);
            })
        }).catch((err) => {
            const castErr = err as Error;
            if(castErr.message === "SUEXISTS") {
                MongoDriver.deleteUser(1111, "user").then((ev) => {
                    expect(ev).to.be.true;
                    done()
                }).catch((err) => {
                    done(err);
                })
            }
            else done(err);
        })
    })

    it('returns null on delete user for invalid event', (done) => {
        MongoDriver.deleteUser(-1, "fun").then((res) => {
            expect(res).to.be.null;
            done();
        }).catch((err) => {
            done(err);
        })
    })

    it('returns false on delete user for invalid user', (done) => {
        MongoDriver.deleteUser(1111, "fun").then((res) => {
            expect(res).to.be.false;
            done();
        }).catch((err) => {
            done(err);
        })
    })

    it('can add new type of material to existing event', (done) => {
        MongoDriver.createEvent("matTestEvent", genAdmin5, "user", "pass").then((res) => {
            if(res === null) {
                eventStore.findOne({eventName: "matTestEvent"}).then((findRes) => {
                    if(findRes === null) {
                        expect(0).to.equal(1);
                        done()
                    }
                    else {
                        MongoDriver.addMaterials(findRes.adminKey, "pencils", 5).then((addRes) => {
                            expect(addRes).to.be.false;
                            eventStore.findOne({eventName: "matTestEvent"}).then((materialFind) => {
                                if(materialFind === null) {
                                    expect(0).to.equal(2);
                                    done()
                                }
                                else {
                                   expect(materialFind.materials[0].itemName).to.equal("pencils");
                                   expect(materialFind.materials[0].count).to.equal(5);
                                   eventStore.findOneAndRemove({adminKey: findRes.adminKey})
                                   .then((delRes) => {
                                        done()
                                   }).catch((err) => {
                                    done(err);
                                })
                                }
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
            }
            else{
                MongoDriver.addMaterials(res.$adminKey, "pencils", 5).then((addRes) => {
                    expect(addRes).to.be.false;
                    eventStore.findOne({eventName: "matTestEvent"}).then((materialFind) => {
                        if(materialFind === null) {
                            expect(0).to.equal(2);
                            done()
                        }
                        else {
                           expect(materialFind.materials[0].itemName).to.equal("pencils");
                           expect(materialFind.materials[0].count).to.equal(5);
                           eventStore.findOneAndRemove({adminKey: res.$adminKey})
                           .then((delRes) => {
                                done()
                           }).catch((err) => {
                            done(err);
                        })
                        }
                    }).catch((err) => {
                        done(err);
                    })
                }).catch((err) => {
                    done(err);
                })
            }
        })
    })

    it('returns null for adding material to invalid event', (done) => {
        MongoDriver.addMaterials(-1, "pencils", 5).then((res) => {
            expect(res).to.be.null;
            done();
        }).catch((err) => {
            done(err);
        })
    })

    it('successfully adds material to event with existing material', (done) => {
        MongoDriver.createEvent("matTestEvent1", genAdmin6, "user", "pass").then((res) => {
            if(res === null) {
                eventStore.findOne({eventName: "matTestEvent1"}).then((findRes) => {
                    if(findRes === null) {
                        expect(0).to.equal(1);
                        done()
                    }
                    else {
                        MongoDriver.addMaterials(findRes.adminKey, "pencils", 5).then((initialAddRes) => {
                            if(initialAddRes === null) {
                                expect(0).to.equal(3);
                                done();
                            }
                            MongoDriver.addMaterials(findRes.adminKey, "pencils", 5).then((addRes) => {
                                if(addRes === null) {
                                    expect(0).to.equal(3);
                                    done();
                                }
                                else {
                                    expect(addRes).to.be.true;
                                    eventStore.findOne({eventName: "matTestEvent1"}).then((materialFind) => {
                                        if(materialFind === null) {
                                            expect(0).to.equal(2);
                                            done()
                                        }
                                        else {
                                           expect(materialFind.materials[0].itemName).to.equal("pencils");
                                           expect(materialFind.materials[0].count).to.equal(10);
                                           eventStore.findOneAndRemove({adminKey: materialFind.adminKey})
                                           .then((delRes) => {
                                                done()
                                           }).catch((err) => {
                                            done(err);
                                        })
                                        }
                                    }).catch((err) => {
                                        done(err);
                                    })
                                }
                            })
                        }).catch((err) => {
                            done(err);
                        })
                    }
                }).catch((err) => {
                    done(err);
                })
            }
            else{
                MongoDriver.addMaterials(res.$adminKey, "pencils", 5).then((initialAddRes) => {
                    if(initialAddRes === null) {
                        expect(0).to.equal(3);
                        done();
                    }
                    MongoDriver.addMaterials(res.$adminKey, "pencils", 5).then((addRes) => {
                        expect(addRes).to.be.true;
                        eventStore.findOne({eventName: "matTestEvent1"}).then((materialFind) => {
                            if(materialFind === null) {
                                expect(0).to.equal(2);
                                done()
                            }
                            else {
                               expect(materialFind.materials[0].itemName).to.equal("pencils");
                               expect(materialFind.materials[0].count).to.equal(10);
                               eventStore.findOneAndRemove({adminKey: res.$adminKey})
                               .then((delRes) => {
                                    done()
                               }).catch((err) => {
                                done(err);
                            })
                            }
                        }).catch((err) => {
                            done(err);
                        })
                    }).catch((err) => {
                        done(err);
                    })
                }).catch((err) => {
                    done(err);
                })
            }
        })
    })
})