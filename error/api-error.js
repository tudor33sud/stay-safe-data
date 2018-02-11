module.exports = class ApiError extends Error {
    constructor(message, statusCode = 500, options = { log: false }) {
        super(message);
        this.statusCode = statusCode;
        this.options = options;
    }

    toJSON() {
        return { message: this.message };
    }
}