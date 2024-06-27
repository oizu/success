import * as jwt from 'jsonwebtoken';
import { Secret } from 'jsonwebtoken';
import * as fs from 'fs';

export class JwtToken {
  private static key: Secret = fs.readFileSync(process.env.JWT_TOKEN_KEY as string, 'utf8');
  private static pub: Secret = fs.readFileSync(process.env.JWT_TOKEN_PUB as string, 'utf8');

  private static options: any = {
    algorithm: 'RS384',
    issuer: process.env.JWT_TOKEN_ISSUER as string,
    expiresIn: '1h'
  };

  public static generate(username: string): string {
    return jwt.sign({user: username}, JwtToken.key, this.options);
  }

  public static verify(token: string) {
    return jwt.verify(token, JwtToken.key, this.options);
  }
}
