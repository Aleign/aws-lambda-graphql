"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const iterall_1 = require("iterall");
// polyfill Symbol.asyncIterator
if (Symbol.asyncIterator === undefined) {
    Symbol.asyncIterator = Symbol.for('asyncIterator');
}
class MemorySubscriptionManager {
    constructor() {
        this.subscribersByEventName = (name) => {
            return {
                [Symbol.asyncIterator]: () => {
                    const subscriptions = this.subscriptions.get(name) || [];
                    const subscribers = subscriptions.filter(subscriber => subscriber.event === name);
                    return iterall_1.createAsyncIterator([subscribers]);
                },
            };
        };
        this.subscribe = async (names, connection, operation) => {
            names.forEach(name => {
                const subscriptions = this.subscriptions.get(name);
                const subscription = {
                    connection,
                    operation,
                    event: name,
                    operationId: operation.operationId,
                };
                if (subscriptions == null) {
                    this.subscriptions.set(name, [subscription]);
                }
                else if (!subscriptions.find(s => s.connection.id === connection.id)) {
                    subscriptions.push({
                        connection,
                        operation,
                        event: name,
                        operationId: operation.operationId,
                    });
                }
            });
        };
        this.unsubscribe = async (subscriber) => {
            const subscriptions = this.subscriptions.get(subscriber.event);
            if (subscriptions) {
                this.subscriptions.set(subscriber.event, subscriptions.filter(s => s.connection.id !== subscriber.connection.id));
            }
        };
        this.unsubscribeOperation = async (connectionId, operationId) => {
            this.subscriptions.forEach((subscribers, event) => {
                this.subscriptions.set(event, subscribers.filter(subscriber => subscriber.connection.id !== connectionId &&
                    subscriber.operationId !== operationId));
            });
        };
        this.unsubscribeAllByConnectionId = (connectionId) => {
            for (const key of this.subscriptions.keys()) {
                this.subscriptions.set(key, this.subscriptions
                    .get(key)
                    .filter(s => s.connection.id === connectionId));
            }
            return Promise.resolve();
        };
        this.subscriptions = new Map();
    }
}
exports.MemorySubscriptionManager = MemorySubscriptionManager;
//# sourceMappingURL=MemorySubscriptionManager.js.map