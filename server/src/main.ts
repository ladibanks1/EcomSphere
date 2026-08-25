import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser('my_cookie'));

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Olajummy-Store')
      .setDescription('Olajummy-Store API Documentation')
      .addBearerAuth()
      .setVersion('1.0')
      .build(),
  );

  SwaggerModule.setup('v1/docs', app, cleanupOpenApiDoc(document));

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log('Server running on port', port);
}

bootstrap();
