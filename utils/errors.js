export class ChatError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = "ChatError";
    this.statusCode = this.determineStatusCode(originalError);
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }

  determineStatusCode(error) {
    if (error?.statusCode) return error.statusCode;
    if (error?.response?.status) return error.response.status;
    return 500;
  }
}
