import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

// Global exception filter that ensures ALL errors return a consistent shape.
// Shape:
// {
//   statusCode: 404,
//  error: "NOT_FOUND",
//   message: "Student not found",
//  timestamp: "2026-06-23T12:00:00.000Z",
//  path: "/api/v1/students/123"
// }

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let statusCode: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        const responseObj = response as Record<string, unknown>;
        message = (responseObj.message as string) ?? exception.message;

        // class-validator returns message as array — join them
        if (Array.isArray(responseObj.message)) {
          message = (responseObj.message as string[]).join('; ');
        }
      } else {
        message = exception.message;
      }

      error = HttpStatus[statusCode] ?? 'UNKNOWN_ERROR';
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
      error = 'INTERNAL_SERVER_ERROR';

      this.logger.error(
        'Unhandled exception',
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    reply.status(statusCode).send({
      statusCode,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
