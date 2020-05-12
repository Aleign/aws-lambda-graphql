"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const iterall_1 = require("iterall");
const ArrayPubSub_1 = require("./ArrayPubSub");
const formatMessage_1 = require("./formatMessage");
const execute_1 = require("./execute");
const protocol_1 = require("./protocol");
/**
 * DynamoDBEventProcessor
 *
 * Processes DynamoDB stream event in order to send events to subscribed clients
 */
class DynamoDBEventProcessor {
    constructor(options = {}) {
        this.onError = options.onError || ((err) => console.log(err));
    }
    createHandler(server) {
        return async (lambdaEvent, lambdaContext) => {
            var e_1, _a;
            const connectionManager = server.getConnectionManager();
            const subscriptionManager = server.getSubscriptionManager();
            const { Records } = lambdaEvent;
            for (const record of Records) {
                // process only INSERT events
                if (record.eventName !== 'INSERT') {
                    continue;
                }
                // now construct event from dynamodb image
                const event = aws_sdk_1.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
                // iterate over subscribers that listen to this event
                // and for each connection:
                //  - create a schema (so we have subscribers registered in PubSub)
                //  - execute operation from event againt schema
                //  - if iterator returns a result, send it to client
                //  - clean up subscriptions and follow with next page of subscriptions
                //  - if the are no more subscriptions, process next event
                // make sure that you won't throw any errors otherwise dynamo will call
                // handler with same events again
                try {
                    try {
                        for (var _b = __asyncValues(subscriptionManager.subscribersByEventName(event.event)), _c; _c = await _b.next(), !_c.done;) {
                            const subscribers = _c.value;
                            const promises = subscribers
                                .map(async (subscriber) => {
                                // create PubSub for this subscriber
                                try {
                                    const pubSub = new ArrayPubSub_1.ArrayPubSub([event]);
                                    const options = await server.createGraphQLServerOptions(lambdaEvent, lambdaContext, {
                                        // this allows createGraphQLServerOptions() to append more extra data
                                        // to context from connection.data.context
                                        connection: subscriber.connection,
                                        operation: subscriber.operation,
                                        pubSub,
                                    });
                                    // execute operation by executing it and then publishing the event
                                    const iterable = await execute_1.execute({
                                        connectionManager,
                                        subscriptionManager,
                                        schema: options.schema,
                                        event: lambdaEvent,
                                        lambdaContext,
                                        context: options.context,
                                        connection: subscriber.connection,
                                        operation: subscriber.operation,
                                        pubSub,
                                        registerSubscriptions: false,
                                    });
                                    if (!iterall_1.isAsyncIterable(iterable)) {
                                        console.log('!isAsyncIterable(iterable)', iterable);
                                        // something went wrong, probably there is an error
                                        return Promise.resolve();
                                    }
                                    const iterator = iterall_1.getAsyncIterator(iterable);
                                    const result = await iterator.next();
                                    if (result.value != null) {
                                        return connectionManager.sendToConnection(subscriber.connection, formatMessage_1.formatMessage({
                                            id: subscriber.operationId,
                                            payload: result.value,
                                            type: protocol_1.SERVER_EVENT_TYPES.GQL_DATA,
                                        }));
                                    }
                                }
                                catch (e) {
                                    console.log(' dynamo execute', e);
                                }
                                return Promise.resolve();
                            })
                                .map(promise => promise.catch(this.onError));
                            await Promise.all(promises);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                catch (e) {
                    console.log('dynamo last', e);
                }
            }
        };
    }
}
exports.DynamoDBEventProcessor = DynamoDBEventProcessor;
//# sourceMappingURL=DynamoDBEventProcessor.js.map