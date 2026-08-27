export class ApiError extends Error {
  readonly status: number;
  readonly detail: string | null;
  readonly code: string | null;

  constructor(status: number, detail: string | null = null, code: string | null = null) {
    super(detail ?? `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.code = code;
  }
}

export class AuthExpiredError extends Error {
  constructor(message = "Session expired") {
    super(message);
    this.name = "AuthExpiredError";
  }
}
