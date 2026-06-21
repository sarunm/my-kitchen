import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for all origins. This is a LAN-only kitchen app accessed from
  // multiple devices (iPad, mobile, Pi) and hosts (dev machine, home server),
  // so we reflect whatever origin makes the request instead of hardcoding IPs.
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3001, '0.0.0.0');
  console.log(`Application is running on: http://localhost:3001`);
}

bootstrap();
