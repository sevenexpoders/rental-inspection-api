// src/common/filters/http-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter
  implements ExceptionFilter
{
  catch(
    exception: unknown,
    host: ArgumentsHost,
  ) {
    const ctx =
      host.switchToHttp();

    const response =
      ctx.getResponse<Response>();

    const request =
      ctx.getRequest<Request>();

    let status =
      HttpStatus.INTERNAL_SERVER_ERROR;

    let message =
      'Internal server error';

    if (
      exception instanceof HttpException
    ) {
      status = exception.getStatus();

      const exceptionResponse =
        exception.getResponse();

      if (
        typeof exceptionResponse ===
        'string'
      ) {
        message = exceptionResponse;
      } else {
        const res =
          exceptionResponse as any;

        message =
          res.message || message;
      }
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp:
        new Date().toISOString(),
    });
  }
}