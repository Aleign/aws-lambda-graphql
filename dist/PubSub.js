"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PubSub {
    constructor({ eventStore }) {
        this.subscribe = (eventNames) => {
            return async (rootValue, args, { $$internal }) => {
                const { connection, operation, pubSub, registerSubscriptions, subscriptionManager, } = $$internal;
                const names = Array.isArray(eventNames) ? eventNames : [eventNames];
                if (pubSub == null) {
                    throw new Error('`pubSub` is not provided in context');
                }
                // register subscriptions only if it set to do so
                // basically this means that client sent subscription operation over websocket
                if (registerSubscriptions) {
                    if (connection == null) {
                        throw new Error('`connection` is not provided in context');
                    }
                    await subscriptionManager.subscribe(names, connection, 
                    // this is called only on subscription so operationId should be filled
                    operation);
                }
                return pubSub.asyncIterator(names);
            };
        };
        /**
         * Notice that this propagates event through storage
         * So you should not expect to fire in same process
         */
        this.publish = async (eventName, payload) => {
            if (typeof eventName !== 'string' || eventName === '') {
                throw new Error('Event name must be nonempty string');
            }
            await this.eventStore.publish({
                payload: JSON.stringify(payload),
                event: eventName,
            });
        };
        this.eventStore = eventStore;
    }
}
exports.PubSub = PubSub;
//# sourceMappingURL=PubSub.js.map