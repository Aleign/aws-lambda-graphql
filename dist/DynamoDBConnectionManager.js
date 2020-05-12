"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const errors_1 = require("./errors");
class ConnectionNotFoundError extends errors_1.ExtendableError {
}
exports.ConnectionNotFoundError = ConnectionNotFoundError;
/**
 * DynamoDBConnectionManager
 *
 * Stores connections in DynamoDB table (default table name is Connections, you can override that)
 */
class DynamoDBConnectionManager {
    constructor({ apiGatewayManager, connectionsTable = 'Connections', dynamoDbClient, subscriptions, }) {
        this.hydrateConnection = async (connectionId, options) => {
            const { retryCount = 0, timeout = 50 } = options || {};
            // if connection is not found, throw so we can terminate connection
            let connection;
            for (let i = 0; i <= retryCount; i++) {
                const result = await this.db
                    .get({
                    TableName: this.connectionsTable,
                    Key: {
                        id: connectionId,
                    },
                })
                    .promise();
                if (result.Item) {
                    // Jump out of loop
                    connection = result.Item;
                    break;
                }
                // wait for another round
                await new Promise(r => setTimeout(r, timeout));
            }
            if (!connection) {
                throw new ConnectionNotFoundError(`Connection ${connectionId} not found`);
            }
            return connection;
        };
        this.setConnectionData = async (data, { id }) => {
            await this.db
                .update({
                TableName: this.connectionsTable,
                Key: {
                    id,
                },
                UpdateExpression: 'set #data = :data',
                ExpressionAttributeValues: {
                    ':data': data,
                },
                ExpressionAttributeNames: {
                    '#data': 'data',
                },
            })
                .promise();
        };
        this.registerConnection = async ({ connectionId, endpoint, }) => {
            const connection = {
                id: connectionId,
                data: { endpoint, context: {}, isInitialized: false },
            };
            await this.db
                .put({
                TableName: this.connectionsTable,
                Item: {
                    createdAt: new Date().toString(),
                    id: connection.id,
                    data: connection.data,
                },
            })
                .promise();
            return connection;
        };
        this.sendToConnection = async (connection, payload) => {
            try {
                await this.createApiGatewayManager(connection.data.endpoint)
                    .postToConnection({ ConnectionId: connection.id, Data: payload })
                    .promise();
            }
            catch (e) {
                // this is stale connection
                // remove it from DB
                if (e && e.statusCode === 410) {
                    await this.unregisterConnection(connection);
                }
                else {
                    throw e;
                }
            }
        };
        this.unregisterConnection = async ({ id }) => {
            await Promise.all([
                this.db
                    .delete({
                    Key: {
                        id,
                    },
                    TableName: this.connectionsTable,
                })
                    .promise(),
                this.subscriptions.unsubscribeAllByConnectionId(id),
            ]);
        };
        this.closeConnection = async ({ id, data }) => {
            await this.createApiGatewayManager(data.endpoint)
                .deleteConnection({ ConnectionId: id })
                .promise();
        };
        this.apiGatewayManager = apiGatewayManager;
        this.connectionsTable = connectionsTable;
        this.db = dynamoDbClient || new aws_sdk_1.DynamoDB.DocumentClient();
        this.subscriptions = subscriptions;
    }
    /**
     * Creates api gateway manager
     *
     * If custom api gateway manager is provided, uses it instead
     */
    createApiGatewayManager(endpoint) {
        if (this.apiGatewayManager) {
            return this.apiGatewayManager;
        }
        this.apiGatewayManager = new aws_sdk_1.ApiGatewayManagementApi({ endpoint });
        return this.apiGatewayManager;
    }
}
exports.DynamoDBConnectionManager = DynamoDBConnectionManager;
//# sourceMappingURL=DynamoDBConnectionManager.js.map