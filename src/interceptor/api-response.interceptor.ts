import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map, catchError, throwError } from 'rxjs';
import { APIResponse, FailureResponse } from '../dto/api-response.type';

@Injectable()
export class SearchQueryResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<APIResponse<any>> | Promise<Observable<APIResponse<any>>> {
    return next.handle().pipe(
      catchError((err) => {
        const errorResponse = new FailureResponse();
        Object.assign(errorResponse, err);
        return throwError(errorResponse);
      }),
      map((data) => {
        return {
          error: false,
          data,
          code: 0,
          message: 'success',
        };
      }),
    );
  }
}
