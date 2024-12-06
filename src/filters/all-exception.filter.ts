import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  LoggerService,
  Inject,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Request } from 'express';
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}
  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    const responseData: any = {
      status: httpStatus,
      error: {
        message: 'Internal server error',
      },
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };
    if (exception instanceof HttpException) {
      throw exception;
    }
    this.logger.error(
      {
        message: exception.message || 'Internal server error',
        fields: {
          info: `${JSON.stringify(exception.stack || {})}`,
          method: request.method,
          url: request.url,
          bodyReq: JSON.stringify(request.body || {}),
          queryReq: JSON.stringify(request.query || {}),
          paramsReq: JSON.stringify(request.params || {}),
          headers: JSON.stringify(request.headers || {}),
          status: httpStatus,
          dataRes: JSON.stringify(responseData),
        },
      },
      'Exceptions',
      false,
    );
    httpAdapter.reply(ctx.getResponse(), responseData, httpStatus);
  }
}
