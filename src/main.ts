import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true, ///enables Pino-for structured Json logging
      trustProxy: true, // Required if behind Nginx / Docker network / any proxy
      // Without this, request.ip returns the proxy IP,
      // making IP-based rate limiting useless
    }),
  );

  await app.register(import('@fastify/helmet'), {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['self'],
        scriptSrc: ['self'],
        objectSrc: ['none'],
        upgradeInsecureRequests: [],
      },
    },
  });

  await app.register(import('@fastify/compress'), {
    threshold: 1024, // Only compress responses > 1KB
  });

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    // All routes become: /api/v1/...
    //If you introduce breaking API changes in the future,
    // you can roll out v2
    //endpoints without disrupting existing clients relying on v1.
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //it strips away unknown field from request body
      forbidNonWhitelisted: true, //it rejects request if unknown properties are sent

      transform: true, //converts plain objects to DTO class instances
      transformOptions: {
        enableImplicitConversion: true,
        // Allows @Query() params to
        // auto-convert from string to number/boolean
      },
    }),
  );

  app.enableShutdownHooks();//for graceful shutdown

  await app.listen(process.env.PORT ?? 3000,'0.0.0.0');

}

bootstrap();
