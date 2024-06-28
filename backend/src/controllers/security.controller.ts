import { Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { oauth, patreon } from 'patreon';

import { logger } from '../index';

import { JwtToken } from '../utils/jwt.token';
import { Account } from '../repositories/entities/account';
import { PatreonToken } from '../repositories/entities/patreon.token';
import { GoodLuck } from '../models/luck/good.luck';
import { BadLuck } from '../models/luck/bad.luck';
import { BaseController } from './base.controller';

export default class SecurityController extends BaseController {
  private server: WebSocketServer;
  private clients: { [key: string]: WebSocket } = {};

  constructor() {
    super();

    const scope = this;

    logger.debug(`SecurityCController creating WebSocketServer on port ${process.env.WEB_SOCKET_PORT}`);
    this.server = new WebSocketServer({port: process.env.WEB_SOCKET_PORT});

    this.server.on('connection', (socket: WebSocket) => {
      logger.debug(`WebSocketServer new connection.`);
      logger.debug(JSON.stringify(socket));

      let client_id: string;

      socket.on('open', () => {
        logger.debug(`WebSocket opened`);
      });

      socket.on('message', (message: string) => {
        client_id = JSON.parse(message);

        logger.debug(`WebSocket new session: ${client_id}`);

        scope.clients[client_id] = socket;
      });

      socket.on('close', () => {
        if (client_id) {
          logger.debug(`WebSocket closing session: ${client_id}`);
          delete scope.clients[client_id];
        }
        logger.debug(`WebSocket closed`);
      });

      socket.on('error', (error: Event) => {
        logger.error(`WebSocket error: ${error}`);
      });
    });
  }

  public async redirect(request: Request, response: Response) {
    const {code, state} = request.query;

    logger.debug(`SecurityController new redirect for session ${state}`);

    const oauth_client = oauth(process.env.PATREON_CLIENT_ID, process.env.PATREON_CLIENT_SECRET);

    logger.debug(`SecurityController access tokens for the session.`);

    oauth_client.getTokens(code, process.env.PATREON_CLIENT_REDIRECT)
      .then(({access_token, refresh_token, expires_in, scope, token_type }) => {

        logger.debug(`SecurityController getting user profile from Patreon.`);

        patreon(access_token)('/identity?fields%5Buser%5D=email,full_name,first_name,last_name,vanity&fields%5Bmember%5D=patron_status,currently_entitled_amount_cents&fields%5Bcampaign%5D=creation_name,vanity,url&include=memberships,memberships.campaign')
          .then(({store}) => {

            const user = store.findAll('user')[0];

            logger.debug(`SecurityController user profile received for '${user.email}'.`);

            let account: Account;
            Account.findOrBuild({
              where: {name: user.email}
            }).then(([result]) => {
              result.last_login = new Date();
              result.save();
              account = result;
              logger.debug(`SecurityController account information saved to the database.`);
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
              logger.debug(`SecurityController patreon tokens saved to the database.`);
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
              BadLuck.send(undefined, request, response, 'Client session not found.', 404);
            }
            GoodLuck.send(response, 'User has been logged in successfully.');
          })
          .catch((error) => {
            BadLuck.send(error, request, response, 'Unable to get current user profile from Patreon..');
          });
      })
      .catch((error) => {
        BadLuck.send(error, request, response, 'PatreonTokens OAuth redirect failed.');
      });
  }
}
