import * as Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const schema = Joi.object().keys({
  id: Joi.number().integer(),
  status: Joi.string().trim().max(16)
    .allow('active', 'disabled', 'deleted').default('active'),
  logins: Joi.array().items(Joi.object().keys({
    provider: Joi.string().max(64).trim().required(),
    username: Joi.string().max(64).trim().required(),
    status: Joi.string().trim().max(16)
      .allow('active', 'disabled', 'deleted').default('active')
  }))
});

export default () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({ errors: errorMessages });
    }
    next();
  };
};
