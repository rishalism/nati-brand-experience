import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ApiErrorDetail, ApiResponse } from '@nati/shared';

/**
 * Global catch-all filter. Normalizes every thrown error into the standard
 * ApiResponse error shape and — critically — never leaks stack traces or
 * internal messages for unexpected (5xx) errors to the client. Full detail is
 * logged server-side instead.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, errors } = this.normalize(exception);

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ApiResponse<null> = {
      success: false,
      message,
      data: null,
      ...(errors ? { errors } : {}),
    };

    response.status(status).json(body);
  }

  private normalize(exception: unknown): {
    status: number;
    message: string;
    errors?: ApiErrorDetail[];
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        return { status, message: res };
      }

      const payload = res as { message?: string | string[]; error?: string };
      const rawMessage = payload.message ?? payload.error ?? exception.message;

      // class-validator produces a string[] of field errors
      if (Array.isArray(rawMessage)) {
        return {
          status,
          message: 'Validation failed',
          errors: rawMessage.map((m) => ({ message: m })),
        };
      }
      return { status, message: rawMessage };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}
