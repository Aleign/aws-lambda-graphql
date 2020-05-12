"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Base Error class for all custom errors
 */
class ExtendableError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ExtendableError = ExtendableError;
//# sourceMappingURL=index.js.map