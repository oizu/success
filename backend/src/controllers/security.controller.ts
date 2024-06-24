import { Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { oauth, patreon } from 'patreon';

import { logger } from '../index';

import { JwtToken } from '../services/jwt.token';
import { Account } from '../models/account';
import { PatreonToken } from '../models/patreon.token';
import { apiErrorHandler } from '../handlers/error.handler';

export default class SecurityController {
  private server;
  private clients: any = {};

  constructor() {
    const that = this;

    this.server = new WebSocketServer({port: process.env.WEB_SOCKET_PORT});
    this.server.on('connection', (socket: WebSocket) => {
      let sessionId: string;
      socket.on('open', () => {
        console.log(`Web socket connection is established.`);
      });
      socket.on('message', (message: string) => {
        sessionId = JSON.parse(message);
        that.clients[sessionId] = socket;
      });
      socket.on('close', () => {
        if (sessionId) {
          delete this.clients[sessionId];
        }
      });
      socket.on('error', (error: Event) => {
        logger.error(`Error in websocket: ${error}`);
      });
    });
  }

  public async patreonRedirect(req: Request, res: Response) {
    const {code, state} = req.query;

    oauth(process.env.PATREON_CLIENT_ID, process.env.PATREON_CLIENT_SECRET)
      .getTokens(code, process.env.PATREON_CLIENT_REDIRECT)
      .then(({
               access_token,
               refresh_token,
               expires_in,
               scope,
               token_type
             }) => {
        patreon(access_token)('/current_user').then(({store}) => {

          const user = store.findAll('user')[0];

          let account: Account;
          Account.findOrBuild({
            where: {name: user.email}
          }).then(([result]) => {
            result.last_login = new Date();
            result.save();
            account = result;
          });

          PatreonToken.findOrBuild({
            where: {email: user.email}
          }).then(([result]) => {
            result.access_token = access_token;
            result.refresh_token = refresh_token;
            result.expires_in = expires_in;
            result.scope = scope;
            result.token_type = token_type;

            result.account = account;
            result.changed('account', true);

            result.save();
          });

          const client: WebSocket = this.clients[state as string];

          if (client) {
            client.send(JSON.stringify({
              email: user.email,
              tokens: {
                jwt: JwtToken.generate(user.email),
                patreon: {
                  access_token: access_token,
                  refresh_token: refresh_token,
                  expires_in: expires_in,
                  scope: scope,
                  token_type: token_type
                }
              }
            }));
          } else {
            res.status(404).send({type: 'success', message: 'Client session not found.'});
          }

          res.status(200).send({type: 'success', message: 'User has been logged in successfully.'});
        });
      })
      .catch((error) => {
        apiErrorHandler(error, req, res, 'PatreonTokens OAuth redirect failed.');
      });
  }
}
