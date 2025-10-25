import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir arquivos estáticos da pasta public
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  });

  // API prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Clinic Companion API')
    .setDescription(
      'API para acompanhamento pós-operatório de procedimentos estéticos\n\n' +
      '**Autenticação:** Todos os endpoints (exceto /auth/login) requerem JWT token.\n\n' +
      '**Como usar:**\n' +
      '1. Faça login em POST /auth/login\n' +
      '2. Copie o access_token da resposta\n' +
      '3. Clique em "Authorize" no topo e cole o token\n\n' +
      '**Credenciais de teste:**\n' +
      '- Admin: admin@clinic.com / admin123\n' +
      '- Doctor: doctor@clinic.com / doctor123\n' +
      '- User: demo@clinic.com / demo123'
    )
    .setVersion('1.0')
    .addTag('auth', 'Autenticação e autorização')
    .addTag('procedures', 'Endpoints de procedimentos')
    .addTag('protocols', 'Endpoints de protocolos')
    .addTag('alerts', 'Endpoints de alertas')
    .addTag('emotional', 'Endpoints de mapeamento emocional')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Cole o token JWT obtido no endpoint /auth/login',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || process.env.API_PORT || 3000;
  await app.listen(port, '0.0.0.0');

  // Masked database URL for security (show only host)
  const dbUrl = process.env.DATABASE_URL;
  const dbInfo = dbUrl
    ? `DATABASE_URL (${dbUrl.split('@')[1]?.split('/')[0] || 'configured'})`
    : `${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}`;

  console.log('');
  console.log('🚀 CLINIC COMPANION API STARTED');
  console.log('='.repeat(70));
  console.log(`✅ Server running on: http://0.0.0.0:${port}`);
  console.log(`🌐 Frontend: http://0.0.0.0:${port}/index.html`);
  console.log(`📚 API Documentation: http://0.0.0.0:${port}/api/docs`);
  console.log(`🔌 Database: ${dbInfo}`);
  console.log(`📦 Redis: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(70));
  console.log('');
}

bootstrap();
