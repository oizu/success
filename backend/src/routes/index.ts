import { Application } from 'express';

import accounts from './account.routes';

export default class Routes {
  constructor(app: Application) {
    app.use('/api', accounts);
  }
}
