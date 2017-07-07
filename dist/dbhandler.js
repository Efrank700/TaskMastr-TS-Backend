"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const mongoose_1 = require("mongoose");
mongoose.connect('mongodb://localhost/');
exports;
const eventSchema = new mongoose_1.Schema({
    eventName: String,
    adminKey: Number,
    supervisorKey: Number,
    runnerKey: Number,
    owner: String,
    admins: [{ username: String, password: String, screenName: String }],
    supervisors: [{ username: String, password: String, screenName: String }],
    runners: [{ username: String, password: String, screenName: String }],
    materialsAvailable: [{ itemName: String, count: Number }],
    materialsInUse: [{ itemName: String, count: Number, }],
    tasks: [{ id: Number, taskInfo: { supervisor: String,
                runnerRequest: Boolean,
                recieveLocation: String,
                depositLocation: String,
                item: String,
                quantity: Number } }]
});
let SingleEvent = module.exports = mongoose.model('Event', eventSchema);
module.exports.getKeyType = function (eventNumber, callback) {
    SingleEvent.findOne({ $or: [{ adminKey: eventNumber }, { supervisorKey: eventNumber }, { runnerKey: eventNumber }] }, function (err, doc) {
        if (err)
            callback(err, null);
        else {
        }
    });
};
