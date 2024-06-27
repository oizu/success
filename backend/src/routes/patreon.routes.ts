import { Router } from 'express';
import SecurityController from '../controllers/security.controller';

class PatreonRoutes {
  router = Router();
  controller = new SecurityController();

  constructor() {
    this.router
      .route('/patreon/oauth/redirect')
      .get(
        this.controller.redirect.bind(this.controller)
      );
  }
}

export default new PatreonRoutes().router;
