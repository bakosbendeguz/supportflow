import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SupportFlow API')
    .setDescription('API documentation for the SupportFlow helpdesk system.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument);

  const configService = app.get(ConfigService);
  const port = Number(configService.get('BACKEND_PORT') ?? 3000);

  await app.listen(port);
}

bootstrap();
