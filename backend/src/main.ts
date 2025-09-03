import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow frontend (Vite @ 5173) to call backend
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,POST',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
