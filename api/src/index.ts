import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as http from 'http';
import app from './app';
import config from './config/config';
import logger from './config/logger';
import { User } from './entities/User';

const database = 'postgres';
const AppDataSource = new DataSource({
  type: database,
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  entities: [User], // add more entities here
  synchronize: true,
  logging: false,
});

let server: http.Server | undefined;

AppDataSource.initialize()
  .then(() => {
    logger.info(`Connected to ${database}!`);
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  })
  .catch((error) => logger.error(error));

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: Error): void => {
  logger.error(error);
  exitHandler();
};

const unhandledRejectionHandler = (reason: Record<string, unknown> | null | undefined): void => {
  logger.error(reason);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unhandledRejectionHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
