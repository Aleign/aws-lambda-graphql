import { ApolloServer, Config, CreateHandlerOptions, GraphQLOptions } from 'apollo-server-lambda';
import { APIGatewayProxyResult, APIGatewayProxyEvent, Context as LambdaContext, Handler as LambdaHandler } from 'aws-lambda';
import { APIGatewayWebSocketEvent, IConnectionManager, IContext, IEventProcessor, ISubscriptionManager, IConnection, OperationRequest } from './types';
import { ExecutionParams } from './execute';
interface ExtraGraphQLOptions extends GraphQLOptions {
    $$internal: IContext['$$internal'];
}
export interface ServerConfig<TServer extends object, TEventHandler extends LambdaHandler> extends Omit<Config, 'context' | 'subscriptions'> {
    /**
     * Connection manager takes care of
     *  - registering/unregistering WebSocket connections
     *  - sending data to connections
     */
    connectionManager: IConnectionManager;
    context?: object | ((contextParams: IContext) => object | Promise<object>);
    eventProcessor: IEventProcessor<TServer, TEventHandler>;
    /**
     * Use to report errors from web socket handler
     */
    onError?: (err: any) => void;
    /**
     * Subscriptions manager takes care of
     *  - registering/unregistering connection's subscribed operations
     */
    subscriptionManager: ISubscriptionManager;
    subscriptions?: {
        onOperation?: (message: OperationRequest, params: ExecutionParams, connection: IConnection) => Promise<ExecutionParams> | ExecutionParams;
        onOperationComplete?: (connection: IConnection, operationId: string) => void;
        onConnect?: (messagePayload: {
            [key: string]: any;
        } | undefined | null, connection: IConnection, event: APIGatewayWebSocketEvent, context: LambdaContext) => Promise<boolean | {
            [key: string]: any;
        }> | boolean | {
            [key: string]: any;
        };
        onDisconnect?: (connection: IConnection) => void;
        /**
         * If connection is not initialized on GraphQL operation, wait for connection to be initialized
         * Or throw prohibited connection error
         *
         */
        waitForInitialization?: {
            /**
             * How many times should we try to determine connection state?
             *
             * Default is 10
             */
            retryCount?: number;
            /**
             * How long should we wait until we try determine connection state again?
             *
             * Default is 50ms
             */
            timeout?: number;
        };
    };
}
export declare class Server<TEventHandler extends LambdaHandler = any> extends ApolloServer {
    private connectionManager;
    private eventProcessor;
    private onError;
    private subscriptionManager;
    private subscriptionOptions;
    constructor({ connectionManager, context, eventProcessor, onError, subscriptionManager, subscriptions, ...restConfig }: ServerConfig<Server, TEventHandler>);
    getConnectionManager(): IConnectionManager;
    getSubscriptionManager(): ISubscriptionManager;
    createGraphQLServerOptions(event: APIGatewayProxyEvent, context: LambdaContext, internal?: Omit<IContext['$$internal'], 'connectionManager' | 'subscriptionManager'>): Promise<ExtraGraphQLOptions>;
    /**
     * Event handler is responsible for processing published events and sending them
     * to all subscribed connections
     */
    createEventHandler(): TEventHandler;
    /**
     * HTTP event handler is responsible for processing AWS API Gateway v1 events
     */
    createHttpHandler(options?: CreateHandlerOptions): (event: APIGatewayProxyEvent, context: LambdaContext) => Promise<unknown>;
    /**
     * WebSocket handler is responsible for processing AWS API Gateway v2 events
     */
    createWebSocketHandler(): (event: APIGatewayWebSocketEvent, context: LambdaContext) => Promise<APIGatewayProxyResult>;
    installSubscriptionHandlers(): void;
}
export {};
//# sourceMappingURL=Server.d.ts.map