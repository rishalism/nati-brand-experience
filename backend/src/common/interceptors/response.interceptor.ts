import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ApiResponse, PaginatedData } from '@nati/shared';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

function isPaginated(value: unknown): value is PaginatedData<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'items' in value &&
    'pagination' in value &&
    Array.isArray((value as { items: unknown }).items)
  );
}

/**
 * Wraps every successful controller return in the canonical ApiResponse
 * envelope, so controllers just return their data (or a { items, pagination }
 * object) and never assemble the envelope by hand.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor<unknown, ApiResponse<unknown>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<ApiResponse<unknown>> {
    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'Success';

    return next.handle().pipe(
      map((payload): ApiResponse<unknown> => {
        if (isPaginated(payload)) {
          return {
            success: true,
            message,
            data: payload.items,
            pagination: payload.pagination,
          };
        }
        return {
          success: true,
          message,
          data: payload ?? null,
        };
      }),
    );
  }
}
