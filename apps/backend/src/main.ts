import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Softzeno POS API')
    .setDescription('Complete multi-tenant SaaS POS system API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication & Authorization')
    .addTag('Tenants', 'Tenant management')
    .addTag('Branches', 'Branch management')
    .addTag('Users', 'User management')
    .addTag('Products', 'Product catalog')
    .addTag('Categories', 'Product categories')
    .addTag('Inventory', 'Stock management')
    .addTag('Customers', 'Customer management')
    .addTag('Sales', 'POS sales & transactions')
    .addTag('Restaurant', 'Restaurant & table management')
    .addTag('Suppliers & Purchases', 'Supplier & purchase order management')
    .addTag('Expenses', 'Business expense tracking')
    .addTag('Employees', 'Employee & attendance management')
    .addTag('Reports', 'Business reports & analytics')
    .addTag('Coupons', 'Coupon & discount management')
    .addTag('Settings', 'System configuration')
    .addTag('Audit', 'Audit logs')
    .addTag('Notifications', 'Push notifications')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 Softzeno POS Backend running on: http://localhost:${port}/api/v1`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
