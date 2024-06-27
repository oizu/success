import { Router } from 'express';

import StorageController from '../controllers/storage.controller';
import ValidateToken from '../middlewares/validate.token';

class StorageRoutes {
  router = Router();
  controller = new StorageController();

  constructor() {
    this.router
      .route('/storage/model/:model_name')
      .get(
        ValidateToken,
        this.controller.get_model.bind(this.controller)
      );
  }
}

export default new StorageRoutes().router;
