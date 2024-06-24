import { Request, Response, NextFunction } from 'express';
import { logger } from '../index';

export function uncaughtErrorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  const result: object = {'error': error};
  logger.error(JSON.stringify(result));
  res.end(result);
}

export function apiErrorHandler(error: any, req: Request, res: Response, message: string) {
  const result: object = {'error': error, 'message': message};
  logger.error(JSON.stringify(result));
  res.json(result);
}
