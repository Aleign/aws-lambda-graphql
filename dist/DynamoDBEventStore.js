"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const ulid_1 = require("ulid");
const helpers_1 = require("./helpers");
const DEFAULT_TTL = 7200;
/**
 * DynamoDB event store
 *
 * This event store stores published events in DynamoDB table
 *
 * The server needs to expose DynamoDBEventProcessor handler in order to process these events
 */
class DynamoDBEventStore {
    constructor({ dynamoDbClient, eventsTable = 'Events', ttl = DEFAULT_TTL, } = {}) {
        this.publish = async (event) => {
            await this.db
                .put({
                TableName: this.tableName,
                Item: Object.assign(Object.assign({ id: ulid_1.ulid() }, event), { ttl: helpers_1.computeTTL(this.ttl) }),
            })
                .promise();
        };
        this.db = dynamoDbClient || new aws_sdk_1.DynamoDB.DocumentClient();
        this.tableName = eventsTable;
        this.ttl = ttl;
    }
}
exports.DynamoDBEventStore = DynamoDBEventStore;
//# sourceMappingURL=DynamoDBEventStore.js.map