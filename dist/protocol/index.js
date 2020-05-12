"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CLIENT_EVENT_TYPES;
(function (CLIENT_EVENT_TYPES) {
    CLIENT_EVENT_TYPES["GQL_START"] = "start";
    CLIENT_EVENT_TYPES["GQL_STOP"] = "stop";
    CLIENT_EVENT_TYPES["GQL_CONNECTION_INIT"] = "connection_init";
})(CLIENT_EVENT_TYPES = exports.CLIENT_EVENT_TYPES || (exports.CLIENT_EVENT_TYPES = {}));
var SERVER_EVENT_TYPES;
(function (SERVER_EVENT_TYPES) {
    SERVER_EVENT_TYPES["GQL_CONNECTION_ACK"] = "connection_ack";
    SERVER_EVENT_TYPES["GQL_ERROR"] = "error";
    SERVER_EVENT_TYPES["GQL_DATA"] = "data";
    SERVER_EVENT_TYPES["GQL_COMPLETE"] = "complete";
})(SERVER_EVENT_TYPES = exports.SERVER_EVENT_TYPES || (exports.SERVER_EVENT_TYPES = {}));
function isGQLOperation(event) {
    return (event &&
        typeof event === 'object' &&
        event.type === CLIENT_EVENT_TYPES.GQL_START);
}
exports.isGQLOperation = isGQLOperation;
function isGQLStopOperation(event) {
    return (event &&
        typeof event === 'object' &&
        event.type === CLIENT_EVENT_TYPES.GQL_STOP);
}
exports.isGQLStopOperation = isGQLStopOperation;
function isGQLConnectionInit(event) {
    return (event &&
        typeof event === 'object' &&
        event.type === CLIENT_EVENT_TYPES.GQL_CONNECTION_INIT);
}
exports.isGQLConnectionInit = isGQLConnectionInit;
//# sourceMappingURL=index.js.map