import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';

dotenv.config({path: `./.env.${process.env.NODE_ENV}`});

import { Request, Response, NextFunction } from 'express';
import { Secret, SignOptions } from 'jsonwebtoken';

export default (req: Request, res: Response, next: NextFunction) => {
  if (req.headers['authorization']) {
    const token: string | undefined = req.headers['authorization'].split(' ')[1];
    const options: SignOptions = {
      algorithm: 'RS256',
      expiresIn: '1h',
      issuer: process.env.JWT_TOKEN_ISSUER,  // Token issuer
    };

    const publicKey: Secret = fs.readFileSync('./keys/server.pub', 'utf8');
    jwt.verify(token, publicKey, options, (error, decoded) => {
      if (error) return res.status(403).json({message: 'Failed to authenticate a token'});
      req['user'] = decoded as string;
      next();
    });
  }
};
