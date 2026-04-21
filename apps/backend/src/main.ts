import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  app.use(helmet());

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

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

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Softzeno POS Backend running on port: ${port}`);
  logger.log(`📚 API Documentation available at /api/docs`);
}

bootstrap();
