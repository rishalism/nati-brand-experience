import 'reflect-metadata';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Route all pino logs through Nest's logger.
  app.useLogger(app.get(Logger));

  const config = app.get(AppConfigService);

  // --- Security & infra middleware ---
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser(config.cookie.secret));

  app.enableCors({
    origin: config.corsOrigin,
    credentials: true, // required for HTTP-only auth cookies
  });

  // --- API surface: /api/v1/... ---
  app.setGlobalPrefix(config.api.prefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: config.api.version,
  });

  // --- Validation (whitelist + transform, reject unknown props) ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.enableShutdownHooks();

  // --- Swagger / OpenAPI ---
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NATI API')
    .setDescription('NATI e-commerce REST API')
    .setVersion(`v${config.api.version}`)
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .addCookieAuth('refresh_token')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${config.api.prefix}/docs`, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(config.port);

  const logger = app.get(Logger);
  logger.log(
    `NATI API running on http://localhost:${config.port}/${config.api.prefix}/v${config.api.version}`,
  );
  logger.log(`Swagger docs at http://localhost:${config.port}/${config.api.prefix}/docs`);
}

void bootstrap();
