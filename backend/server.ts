import * as express from 'express';
import * as dotenv from 'dotenv';
dotenv.config({ path: `./.env.${process.env.NODE_ENV}` });

import Server from './src/index';

const server: Server = new Server(express());
server.start();