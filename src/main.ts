import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { FirebaseUtil } from './common/utils/firebase.util';
import { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
   console.log('AWS_BUCKET_NAME=', process.env.AWS_BUCKET_NAME);
  // const app = await NestFactory.create(AppModule);
  FirebaseUtil.initialize();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(compression());

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.enable('trust proxy');
  app.setGlobalPrefix('api');


  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(
    new ResponseInterceptor(),
  );

  app.useGlobalFilters(
    new HttpExceptionFilter(),
  );

  const port = process.env.PORT || 3000;

  await app.listen(port);

  console.log(`Server running on port ${port}`);
}
bootstrap();