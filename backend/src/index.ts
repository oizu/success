import * as morgan from 'morgan';
import * as helmet from 'helmet';
import * as winston from 'winston';
import * as fs from 'fs';

const cors = require('cors');

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: winston.format.json(),
  defaultMeta: {service: 'Backend Service'},
  transports: [
    new winston.transports.Console({level: 'debug'}),
    new winston.transports.File({filename: './logs/debug.log', level: 'debug'}),
    new winston.transports.File({filename: './logs/error.log', level: 'error'}),
    new winston.transports.File({filename: './logs/combined.log'}),
  ],
});

import {Application, json, urlencoded} from 'express';

import rateLimiter from './middlewares/limit.rate';

import Routes from './routes';
import {BadLuck} from './models/luck/bad.luck';


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
    const accessLogStream: fs.WriteStream = fs.createWriteStream('./logs/access.log', {flags: 'a'});

    const cors_options = {
      origin: process.env.CORS_ORIGIN,
      credentials: true
    };

    this.application.use(morgan('combined', {stream: accessLogStream}));
    this.application.use(urlencoded({extended: true}));
    this.application.use(json());
    this.application.use(helmet());
/*
    this.application.use(rateLimiter()); //  apply to all requests
*/
    this.application.use(cors(cors_options));
    this.application.use(BadLuck.uncaught);

    new Routes(this.application);
  }
}

process.on('beforeExit', function (error) {
  logger.error(JSON.stringify(error));
  console.error(error);
});
