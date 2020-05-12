"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
// polyfill Symbol.asyncIterator
if (Symbol.asyncIterator === undefined) {
    Symbol.asyncIterator = Symbol.for('asyncIterator');
}
/**
 * DynamoDBSubscriptionManager
 *
 * Stores all subsrciptions in Subscriptions and SubscriptionOperations tables (both can be overridden)
 *
 * DynamoDB table structures
 *
 * Subscriptions:
 *  event: primary key (HASH)
 *  subscriptionId: range key (RANGE) - connectionId:operationId (this is always unique per client)
 *
 * SubscriptionOperations:
 *  subscriptionId: primary key (HASH) - connectionId:operationId (this is always unique per client)
 */
class DynamoDBSubscriptionManager {
    constructor({ dynamoDbClient, subscriptionsTableName = 'Subscriptions', subscriptionOperationsTableName = 'SubscriptionOperations', } = {}) {
        this.subscribersByEventName = (name) => {
            let ExclusiveStartKey;
            let done = false;
            return {
                next: async () => {
                    if (done) {
                        return { value: [], done: true };
                    }
                    const result = await this.db
                        .query({
                        ExclusiveStartKey,
                        TableName: this.subscriptionsTableName,
                        Limit: 50,
                        KeyConditionExpression: 'event = :event',
                        ExpressionAttributeValues: {
                            ':event': name,
                        },
                    })
                        .promise();
                    ExclusiveStartKey = result.LastEvaluatedKey;
                    if (ExclusiveStartKey == null) {
                        done = true;
                    }
                    // we store connectionData on subscription too so we don't
                    // need to load data from connections table
                    const value = result.Items;
                    return { value, done: value.length === 0 };
                },
                [Symbol.asyncIterator]() {
                    return this;
                },
            };
        };
        this.subscribe = async (names, connection, operation) => {
            const subscriptionId = this.generateSubscriptionId(connection.id, operation.operationId);
            // we can only subscribe to one subscription in GQL document
            if (names.length !== 1) {
                throw new Error('Only one active operation per event name is allowed');
            }
            const [name] = names;
            await this.db
                .batchWrite({
                RequestItems: {
                    [this.subscriptionsTableName]: [
                        {
                            PutRequest: {
                                Item: {
                                    connection,
                                    operation,
                                    event: name,
                                    subscriptionId,
                                    operationId: operation.operationId,
                                },
                            },
                        },
                    ],
                    [this.subscriptionOperationsTableName]: [
                        {
                            PutRequest: {
                                Item: {
                                    subscriptionId,
                                    event: name,
                                },
                            },
                        },
                    ],
                },
            })
                .promise();
        };
        this.unsubscribe = async (subscriber) => {
            const subscriptionId = this.generateSubscriptionId(subscriber.connection.id, subscriber.operationId);
            await this.db
                .transactWrite({
                TransactItems: [
                    {
                        Delete: {
                            TableName: this.subscriptionsTableName,
                            Key: {
                                event: subscriber.event,
                                subscriptionId,
                            },
                        },
                    },
                    {
                        Delete: {
                            TableName: this.subscriptionOperationsTableName,
                            Key: {
                                subscriptionId,
                            },
                        },
                    },
                ],
            })
                .promise();
        };
        this.unsubscribeOperation = async (connectionId, operationId) => {
            const operation = await this.db
                .get({
                TableName: this.subscriptionOperationsTableName,
                Key: {
                    subscriptionId: this.generateSubscriptionId(connectionId, operationId),
                },
            })
                .promise();
            if (operation.Item) {
                await this.db
                    .transactWrite({
                    TransactItems: [
                        {
                            Delete: {
                                TableName: this.subscriptionsTableName,
                                Key: {
                                    event: operation.Item.event,
                                    subscriptionId: operation.Item.subscriptionId,
                                },
                            },
                        },
                        {
                            Delete: {
                                TableName: this.subscriptionOperationsTableName,
                                Key: {
                                    subscriptionId: operation.Item.subscriptionId,
                                },
                            },
                        },
                    ],
                })
                    .promise();
            }
        };
        this.unsubscribeAllByConnectionId = async (connectionId) => {
            let cursor;
            do {
                const { Items, LastEvaluatedKey } = await this.db
                    .scan({
                    TableName: this.subscriptionsTableName,
                    ExclusiveStartKey: cursor,
                    FilterExpression: 'begins_with(subscriptionId, :connection_id)',
                    ExpressionAttributeValues: {
                        ':connection_id': connectionId,
                    },
                    Limit: 12,
                })
                    .promise();
                if (Items == null || !Items.length) {
                    return;
                }
                await this.db
                    .batchWrite({
                    RequestItems: {
                        [this.subscriptionsTableName]: Items.map(item => ({
                            DeleteRequest: {
                                Key: { event: item.event, subscriptionId: item.subscriptionId },
                            },
                        })),
                        [this.subscriptionOperationsTableName]: Items.map(item => ({
                            DeleteRequest: {
                                Key: { subscriptionId: item.subscriptionId },
                            },
                        })),
                    },
                })
                    .promise();
                cursor = LastEvaluatedKey;
            } while (cursor);
        };
        this.generateSubscriptionId = (connectionId, operationId) => {
            return `${connectionId}:${operationId}`;
        };
        this.subscriptionsTableName = subscriptionsTableName;
        this.subscriptionOperationsTableName = subscriptionOperationsTableName;
        this.db = dynamoDbClient || new aws_sdk_1.DynamoDB.DocumentClient();
    }
}
exports.DynamoDBSubscriptionManager = DynamoDBSubscriptionManager;
//# sourceMappingURL=DynamoDBSubscriptionManager.js.map