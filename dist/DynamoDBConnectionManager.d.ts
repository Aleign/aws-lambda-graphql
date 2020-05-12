/// <reference types="node" />
import { ApiGatewayManagementApi, DynamoDB } from 'aws-sdk';
import { ExtendableError } from './errors';
import { IConnection, IConnectEvent, IConnectionManager, ISubscriptionManager, IConnectionData, HydrateConnectionOptions } from './types';
export declare class ConnectionNotFoundError extends ExtendableError {
}
interface DynamoDBConnectionManagerOptions {
    /**
     * Use this to override ApiGatewayManagementApi (for example in usage with serverless-offline)
     *
     * If not provided it will be created with endpoint from connections
     */
    apiGatewayManager?: ApiGatewayManagementApi;
    /**
     * Connections table name (default is Connections)
     */
    connectionsTable?: string;
    /**
     * Use this to override default document client (for example if you want to use local dynamodb)
     */
    dynamoDbClient?: DynamoDB.DocumentClient;
    subscriptions: ISubscriptionManager;
}
/**
 * DynamoDBConnectionManager
 *
 * Stores connections in DynamoDB table (default table name is Connections, you can override that)
 */
export declare class DynamoDBConnectionManager implements IConnectionManager {
    private apiGatewayManager;
    private connectionsTable;
    private db;
    private subscriptions;
    constructor({ apiGatewayManager, connectionsTable, dynamoDbClient, subscriptions, }: DynamoDBConnectionManagerOptions);
    hydrateConnection: (connectionId: string, options: HydrateConnectionOptions) => Promise<IConnection>;
    setConnectionData: (data: IConnectionData, { id }: IConnection) => Promise<void>;
    registerConnection: ({ connectionId, endpoint, }: IConnectEvent) => Promise<IConnection>;
    sendToConnection: (connection: IConnection, payload: string | Buffer) => Promise<void>;
    unregisterConnection: ({ id }: IConnection) => Promise<void>;
    closeConnection: ({ id, data }: IConnection) => Promise<void>;
    /**
     * Creates api gateway manager
     *
     * If custom api gateway manager is provided, uses it instead
     */
    private createApiGatewayManager;
}
export {};
//# sourceMappingURL=DynamoDBConnectionManager.d.ts.map