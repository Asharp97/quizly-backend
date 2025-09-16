import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.enableCors({
    // origin: process.env.DOMAIN, // The origin of your Nuxt frontend
    origin: 'http://localhost:3000', // IMPORTANT: Use your frontend's actual origin
    credentials: true, // This is crucial for cookies to be sent
  });

  await app.listen(process.env.PORT || 3002);
}
bootstrap();
