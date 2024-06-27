import { Application } from 'express';

import patreon from './patreon.routes';
import storage from './storage.routes';

export default class Routes {
  constructor(app: Application) {
    app.use('/api', patreon);
    app.use('/api', storage);
  }
}
