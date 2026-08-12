/* eslint-disable no-console */
import mongoose from 'mongoose';
import { Server } from 'node:http';
import app from './app';
import subscribeToEvents from './app/events';
import config from './config/index';
import { errorlogger } from './shared/logger';
import { RedisClient } from './shared/redis';

process.on('uncaughtException', error => {
  errorlogger.error(error);
  process.exit(1);
});

let server: Server;

async function bootstrap() {
  try {
    await RedisClient.connect();
    subscribeToEvents();

    await mongoose.connect(config.database_url as string);

    console.log(`🛢   Database is connected successfully`);

    server = app.listen(config.port, () => {
      console.log(`Application  listening on port ${config.port}`);
    });
  } catch (err) {
    errorlogger.error('Failed to connect database', err);
  }

  process.on('unhandledRejection', error => {
    if (!server) {
      process.exit(1);
      return;
    }

    server.close(() => {
      errorlogger.error(error);
      process.exit(1);
    });
  });
}

bootstrap();