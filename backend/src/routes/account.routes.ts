import { Router } from 'express';
import SecurityController from '../controllers/security.controller';

class PatreonRoutes {
  router = Router();
  security = new SecurityController();

  constructor() {
    this.router.route('/patreon/oauth/redirect').get(this.security.patreonRedirect.bind(this.security));
  }
}

export default new PatreonRoutes().router;
