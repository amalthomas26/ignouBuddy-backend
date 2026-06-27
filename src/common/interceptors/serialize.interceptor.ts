import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { type ClassConstructor, plainToInstance } from 'class-transformer';

@Injectable()
export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private readonly dto: ClassConstructor<T>) {}

  intercept(_context: ExecutionContext, handler: CallHandler): Observable<T> {
    return handler.handle().pipe(
      map((data: unknown) =>
        plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
          // Only include fields decorated with @Expose()
        }),
      ),
    );
  }
}
