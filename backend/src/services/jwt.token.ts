import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import { Secret } from 'jsonwebtoken';

export class JwtToken {
  private static key: Secret = fs.readFileSync(process.env.JWT_TOKEN_KEY as string, 'utf8');
  private static pub: Secret = fs.readFileSync(process.env.JWT_TOKEN_PUB as string, 'utf8');
  private static options: any = {
    algorithm: 'RS256',
    expiresIn: '1h',
    issuer: process.env.JWT_TOKEN_ISSUER as string,
  };

  public static generate(username: string): string {
    return jwt.sign({user: username}, JwtToken.key, {...this.options, subject: username });
  }

  public static verify(token: string): string | jwt.JwtPayload {
    return jwt.verify(token, JwtToken.pub, {...this.options });
  }
}
