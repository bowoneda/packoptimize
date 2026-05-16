import './instrument';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  try {
    console.error('[BOOT] Bootstrap starting...');

    const app = await NestFactory.create(AppModule, {
      rawBody: true,
    });

    console.error('[BOOT] NestJS app created, configuring...');

    const logger = new Logger('Bootstrap');

    // Use Pino logger
    app.useLogger(app.get(PinoLogger));

    // Cookie parser (required for httpOnly cookie auth)
    app.use(cookieParser());

    // Enable CORS
    app.enableCors({
      origin: process.env.FRONTEND_URL
        ? [process.env.FRONTEND_URL, 'http://localhost:3001']
        : ['http://localhost:3001'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Global exception filter
    app.useGlobalFilters(new HttpExceptionFilter());

    const port = process.env['PORT'] ?? 3000;

    // Swagger setup — disabled in production
    if (process.env['NODE_ENV'] !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('PackOptimize API')
        .setDescription('Multi-Tenant Packaging Optimization SaaS API')
        .setVersion('1.0')
        .addBearerAuth()
        .addApiKey(
          { type: 'apiKey', name: 'X-API-Key', in: 'header' },
          'api-key',
        )
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
      logger.log(`Swagger docs available at: http://0.0.0.0:${port}/api/docs`);
    }

    await app.listen(port, '0.0.0.0');
    logger.log(`Application is running on: http://0.0.0.0:${port}`);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}
void bootstrap();
