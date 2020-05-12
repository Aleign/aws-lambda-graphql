"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const iterall_1 = require("iterall");
/**
 * Array PubSub works as local PubSub that is already fed with all the events that were published
 *
 * Each time you call asyncIterator it will create an iterator that iterates over events
 */
class ArrayPubSub {
    constructor(events) {
        this.events = events;
    }
    async publish() {
        throw new Error('ArrayPubSub is read only');
    }
    async subscribe() {
        throw new Error('Please do not use this PubSub implementation');
    }
    async unsubscribe() {
        throw new Error('Please do not use this PubSub implementation');
    }
    asyncIterator(eventNames) {
        const names = Array.isArray(eventNames) ? eventNames : [eventNames];
        return iterall_1.createAsyncIterator(this.events
            .filter(event => names.includes(event.event))
            .map(event => typeof event.payload === 'string'
            ? JSON.parse(event.payload)
            : event.payload));
    }
}
exports.ArrayPubSub = ArrayPubSub;
//# sourceMappingURL=ArrayPubSub.js.map