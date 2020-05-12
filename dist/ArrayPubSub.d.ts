import { ISubscriptionEvent } from './types';
/**
 * Array PubSub works as local PubSub that is already fed with all the events that were published
 *
 * Each time you call asyncIterator it will create an iterator that iterates over events
 */
export declare class ArrayPubSub {
    private events;
    constructor(events: ISubscriptionEvent[]);
    publish(): Promise<void>;
    subscribe(): Promise<number>;
    unsubscribe(): Promise<void>;
    asyncIterator(eventNames: string | string[]): AsyncIterator<any, any, undefined>;
}
//# sourceMappingURL=ArrayPubSub.d.ts.map