import { Luck } from './luck';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../../index';

export class BadLuck extends Luck {
  public message!: string;
  public error!: any;

  constructor(message: string, error?: any) {
    super('error');
    this.message = message;
    this.error = error;
  }

  private static replay(code: number, error: any, request: Request, response: Response, message: string) {
    let result: any;

    if (process.env.NODE_ENV === 'development') {
      result = new BadLuck(message, error);
    } else {
      result = new BadLuck(message);
    }

    logger.error(JSON.stringify(result));

    response.status(code).json(result);
  }

  public static send(error: any, request: Request, response: Response, message: string, code: number) ;
  public static send(error: any, request: Request, response: Response, message: string);

  public static send(error: any, request: Request, response: Response, message: string, code?: number) {
    code = !code || code < 400 ? 418 : code; // 418 = I'm a teapot response code, RFC 2324
    this.replay(code, error, request, response, message);
  }

  public static uncaught(error: any, request: Request, response: Response, next: NextFunction) {
    this.replay(500, error, request, response, 'Unhandled exception.');
  }
}
