import { IConnection, ISubscriber, ISubscriptionManager, OperationRequest } from './types';
export declare class MemorySubscriptionManager implements ISubscriptionManager {
    private subscriptions;
    constructor();
    subscribersByEventName: (name: string) => AsyncIterable<ISubscriber[]> & AsyncIterator<ISubscriber[], any, undefined>;
    subscribe: (names: string[], connection: IConnection, operation: OperationRequest & {
        operationId: string;
    }) => Promise<void>;
    unsubscribe: (subscriber: ISubscriber) => Promise<void>;
    unsubscribeOperation: (connectionId: string, operationId: string) => Promise<void>;
    unsubscribeAllByConnectionId: (connectionId: string) => Promise<void>;
}
//# sourceMappingURL=MemorySubscriptionManager.d.ts.map