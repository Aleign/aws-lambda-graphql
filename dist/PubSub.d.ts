import { IEventStore, SubcribeResolveFn } from './types';
interface PubSubOptions {
    eventStore: IEventStore;
}
export declare class PubSub {
    private eventStore;
    constructor({ eventStore }: PubSubOptions);
    subscribe: (eventNames: string | string[]) => SubcribeResolveFn;
    /**
     * Notice that this propagates event through storage
     * So you should not expect to fire in same process
     */
    publish: (eventName: string, payload: any) => Promise<void>;
}
export {};
//# sourceMappingURL=PubSub.d.ts.map