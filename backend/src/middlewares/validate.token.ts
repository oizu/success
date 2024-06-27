import { NextFunction, Request, Response } from 'express';
import { JwtToken } from '../utils/jwt.token';
import { BadLuck } from '../models/luck/bad.luck';

export default (request: Request, response: Response, next: NextFunction) => {
  if (request.headers['authorization']) {
    const token: string | undefined = request.headers['authorization'].split(' ')[1];

    try {
      const jwt: any = JwtToken.verify(token);
      request.params['user'] = jwt.user;
      next(); // authenticated!!

    } catch (error: any) {
      let message: string = error?.message;
      if (error.name === 'TokenExpiredError') {
        message = `Token has expired: ${message}`;
      } else if (error.name === 'JsonWebTokenError') {
        message = `Invalid token: ${message}`;
      } else if (error.name === 'NotBeforeError') {
        message = `Token not active: ${message}`;
      } else {
        message = `Failed to authenticate a token: ${message}`;
      }
      BadLuck.send(error, request, response, message, 401);
    }
  } else {
    BadLuck.send(undefined, request, response, 'No authorization token found.', 401);
  }
};
