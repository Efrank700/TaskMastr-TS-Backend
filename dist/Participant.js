"use strict";
var participantTypes;
(function (participantTypes) {
    participantTypes[participantTypes["admin"] = 0] = "admin";
    participantTypes[participantTypes["supervisor"] = 1] = "supervisor";
    participantTypes[participantTypes["runner"] = 2] = "runner";
})(participantTypes || (participantTypes = {}));
