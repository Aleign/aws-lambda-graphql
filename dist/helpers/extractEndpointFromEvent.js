"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function extractEndpointFromEvent(event) {
    return `${event.requestContext.domainName}/${event.requestContext.stage}`;
}
exports.extractEndpointFromEvent = extractEndpointFromEvent;
//# sourceMappingURL=extractEndpointFromEvent.js.map