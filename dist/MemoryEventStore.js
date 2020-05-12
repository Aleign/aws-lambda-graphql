"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MemoryEventStore {
    constructor() {
        this.publish = async (event) => {
            this.events.push(event);
        };
        this.events = [];
    }
}
exports.MemoryEventStore = MemoryEventStore;
//# sourceMappingURL=MemoryEventStore.js.map