class ApiError extends Error {
    constructor(message, statusCode,error=[]) {

        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.error = error;
    }
}