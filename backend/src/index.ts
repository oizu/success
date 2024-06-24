import * as morgan from 'morgan';
import * as helmet from 'helmet';
import * as winston from 'winston';
import * as fs from 'fs';

import { Application, json, urlencoded } from 'express';

import rateLimiter from './middlewares/limit.rate';
import tokenValidator from './middlewares/validate.token';
import { uncaughtErrorHandler } from './handlers/error.handler';

import accounts from './routes/account.routes';
import Routes from "./routes";

export const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: './logs/combined.log' }),
  ],
});

export default class Server {
  private readonly application: Application;

  constructor(app: Application) {
    this.application = app;
    this.config();
  }

  public start() {
    const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 80;

    this.application.listen(port, function () {
      console.info(`Server: running on http://localhost:${port}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log('Server: startup error, address already in use');
      } else {
        console.log(`Server: ${err}`);
      }
    });
  }

  public config(): void {
    const accessLogStream: fs.WriteStream = fs.createWriteStream('./logs/access.log', { flags: 'a' });

    this.application.use(morgan('combined', { stream: accessLogStream }));
    this.application.use(urlencoded({ extended: true }));
    this.application.use(json());
    this.application.use(helmet());
    this.application.use(rateLimiter()); //  apply to all requests
    // this.application.use(tokenValidator); //  apply to all requests
    this.application.use(uncaughtErrorHandler);

    new Routes(this.application);
  }
}

process.on('beforeExit', function (err) {
  logger.error(JSON.stringify(err));
  console.error(err);
});
