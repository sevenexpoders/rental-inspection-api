import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, any>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {

    const request =
      context.switchToHttp().getRequest();

    const response =
      context.switchToHttp().getResponse();

    // Don't wrap Android App Links file
    if (
      request.path === '/.well-known/assetlinks.json'
    ) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: response.statusCode,
        message:
          data?.message || 'Success',
        data:
          data?.data !== undefined
            ? data.data
            : data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}