import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // LAN-only kitchen app accessed from multiple devices (iPad, mobile, Pi) and
  // hosts (dev machine, home server). Allow any private-network origin on the
  // frontend/Pi ports instead of hardcoding a single IP, so one image works
  // everywhere. No cookies/auth are used, so credentials are not enabled
  // (avoids the unsafe reflect-any-origin + credentials combination).
  const allowedOrigin = [
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:(3000|3002)$/,
    /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:(3000|3002)$/,
    /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}:(3000|3002)$/,
    /^http:\/\/localhost:(3000|3002)$/,
  ];
  app.enableCors({
    origin: (origin, cb) => {
      // Allow non-browser clients (no Origin header) and any matching LAN origin.
      if (!origin || allowedOrigin.some((re) => re.test(origin))) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  await app.listen(3001, '0.0.0.0');
  console.log(`Application is running on: http://localhost:3001`);
}

bootstrap();
