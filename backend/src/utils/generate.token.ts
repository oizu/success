import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import { SignOptions } from 'jsonwebtoken';

console.log(process.env.NODE_ENV);
dotenv.config({ path: `./.env.${process.env.NODE_ENV}` });

const args = process.argv.slice(2);

const username = args[0];
console.log(`Generating JWT token for "${username}"`);

const payload: object = {
    user: username,
};

const issuer = process.env.JWT_TOKEN_ISSUER as string;
console.log(issuer);

const options: SignOptions = {
  algorithm: 'RS256',
  expiresIn: '1h',
  issuer: issuer,
  subject: username
};

const privateKey = fs.readFileSync('./keys/server.key', 'utf8');
const token = jwt.sign(payload, privateKey, options);

console.log(`Token: ${token}`);
