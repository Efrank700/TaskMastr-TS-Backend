"use strict";

import * as mongoose from "mongoose";
import {Document, Schema} from "mongoose";
mongoose.connect('mongodb://localhost/');

exports

const eventSchema: Schema = new Schema({
    eventName: String,
    adminKey: Number,
    supervisorKey: Number,
    runnerKey: Number,
    owner: String,
    admins: [{username: String, password: String, screenName: String}],
    supervisors: [{username: String, password: String, screenName: String}],
    runners: [{username: String, password: String, screenName: String}],
    materialsAvailable: [{itemName: String, count: Number}],
    materialsInUse: [{itemName: String, count: Number, }],
    tasks: [{id: Number, taskInfo: {supervisor: String,
            runnerRequest: Boolean,
            recieveLocation: String,
            depositLocation:String,
            item: String,
            quantity: Number}}]
});

let SingleEvent = module.exports = mongoose.model('Event', eventSchema);

module.exports.getKeyType = function(eventNumber: number, callback: (err: any, type: participantTypes | null) => void) {
    SingleEvent.findOne({$or: [{adminKey: eventNumber}, {supervisorKey: eventNumber}, {runnerKey: eventNumber}]},
        function(err: any, doc: mongoose.Document){
            if(err) callback(err, null);
            else{
                
            }
        })
}