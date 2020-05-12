"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Computes TTL in UNIX timestamp with seconds precision
 */
function computeTTL(ttl) {
    return Math.round(Date.now() / 1000 + ttl);
}
exports.computeTTL = computeTTL;
//# sourceMappingURL=computeTTL.js.map