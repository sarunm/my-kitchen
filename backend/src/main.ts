import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for iPad and Pi access
  app.enableCors({
    origin: ['http://192.168.1.131:3000', 'http://192.168.1.131:3002'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3001, '0.0.0.0');
  console.log(`Application is running on: http://localhost:3001`);
}

bootstrap();
