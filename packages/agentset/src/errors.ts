/**
 * Base error class for all Agentset API errors
 */
export class AgentsetError extends Error {
  readonly code: string;
  readonly status: number;
  readonly docUrl?: string;

  constructor(message: string, code: string, status: number, docUrl?: string) {
    super(message);
    this.name = "AgentsetError";
    this.code = code;
    this.status = status;
    this.docUrl = docUrl;

    // Maintains proper stack trace for where error was thrown
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error for 400 Bad Request responses
 */
export class BadRequestError extends AgentsetError {
  constructor(message: string, docUrl?: string) {
    super(message, "bad_request", 400, docUrl);
    this.name = "BadRequestError";
  }
}

/**
 * Error for 401 Unauthorized responses
 */
export class UnauthorizedError extends AgentsetError {
  constructor(message: string, docUrl?: string) {
    super(message, "unauthorized", 401, docUrl);
    this.name = "UnauthorizedError";
  }
}

/**
 * Error for 403 Forbidden responses
 */
export class ForbiddenError extends AgentsetError {
  constructor(message: string, docUrl?: string) {
    super(message, "forbidden", 403, docUrl);
    this.name = "ForbiddenError";
  }
}

/**
 * Error for 404 Not Found responses
 */
export class NotFoundError extends AgentsetError {
  constructor(message: string, docUrl?: string) {
    super(message, "not_found", 404, docUrl);
    this.name = "NotFoundError";
  }
}

/**
 * Error for 409 Conflict responses
 */
export class ConflictError extends AgentsetError {
  constructor(message: string, docUrl?: string) {
    super(message, "conflict", 409, docUrl);
    this.name = "ConflictError";
  }
}

/**
 * Error for 410 Invite Expired responses
 */
export class InviteExpiredError extends AgentsetError {
  constructor(message: string, docUrl?: string) {
    super(message, "invite_expired", 410, docUrl);
    this.name = "InviteExpiredError";
  }
}

/**
 * Error for 422 Unprocessable Entity responses
 */
export class UnprocessableEntityError extends AgentsetError {
  constructor(message: string, docUrl?: string) {
    super(message, "unprocessable_entity", 422, docUrl);
    this.name = "UnprocessableEntityError";
  }
}

/**
 * Error for 429 Rate Limit Exceeded responses
 */
export class RateLimitExceededError extends AgentsetError {
  constructor(message: string, docUrl?: string) {
    super(message, "rate_limit_exceeded", 429, docUrl);
    this.name = "RateLimitExceededError";
  }
}

/**
 * Error for 500 Internal Server Error responses
 */
export class InternalServerError extends AgentsetError {
  constructor(message: string, docUrl?: string) {
    super(message, "internal_server_error", 500, docUrl);
    this.name = "InternalServerError";
  }
}

/**
 * Creates the appropriate error class based on the status code
 */
export function createError(
  status: number,
  message: string,
  docUrl?: string,
): AgentsetError {
  switch (status) {
    case 400:
      return new BadRequestError(message, docUrl);
    case 401:
      return new UnauthorizedError(message, docUrl);
    case 403:
      return new ForbiddenError(message, docUrl);
    case 404:
      return new NotFoundError(message, docUrl);
    case 409:
      return new ConflictError(message, docUrl);
    case 410:
      return new InviteExpiredError(message, docUrl);
    case 422:
      return new UnprocessableEntityError(message, docUrl);
    case 429:
      return new RateLimitExceededError(message, docUrl);
    case 500:
      return new InternalServerError(message, docUrl);
    default:
      return new AgentsetError(message, "unknown_error", status, docUrl);
  }
}
