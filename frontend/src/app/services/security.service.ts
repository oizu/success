import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import {webSocket} from "rxjs/webSocket";
import {environment} from '../../environments/environment';
import {v4 as uuid} from 'uuid';
import {User} from "../models/user";

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly session_id: string;

  private web_socket!: Subject<string> | undefined;

  private readonly url = {
    protocol: 'https',
    host: 'patreon.com',
    pathname: '/oauth2/authorize',
    response_type: 'code',
    client_id: environment.patreon_client_id,
    redirect_uri: environment.patreon_client_redirect,
    state: ''
  };

  constructor() {
    this.session_id = uuid();
    this.url.state = this.session_id;

    if (typeof document !== 'undefined') {
      this.url.state = this.session_id = localStorage.getItem('session_id') || this.session_id;

      localStorage.setItem('session_id', this.session_id);

      this.connect(environment.web_socket_url);
    }
  }

  private connect(url: string): Subject<string> {
    if (!this.web_socket) {
      this.web_socket = this.create(url);
      this.login.subscribe({
        complete: () => {
          this.web_socket?.complete();
        }
      });
    }
    return this.web_socket;
  }

  private create(url: string): Subject<string> {
    this.web_socket = webSocket<string>({url: url});

    this.web_socket.subscribe({
      next: (user: any) => {
        localStorage.setItem('current_user', JSON.stringify(user));
        this.login.next(user);
      },
      error: (error: any) => {
        let message = JSON.stringify(error);
        console.error(`Error receiving message from server: ${message}`);
      }
    });

    this.web_socket.next(this.session_id);

    return this.web_socket;
  }

  public login: Subject<User> = new Subject<User>();
  public logout: Subject<void> = new Subject<void>();

  public checkin(): string {
    const url = `${this.url.protocol}://${this.url.host}/${this.url.pathname}`;

    let response_type = `response_type=${this.url.response_type}`;
    let client_id = `client_id=${this.url.client_id}`;
    let state = `state=${this.url.state}`;
    let scope = 'scope=identity%20identity%5Bemail%5D%20identity.memberships';
    let redirect_uri = `redirect_uri=${this.url.redirect_uri}`;

    return `${url}?${response_type}&${client_id}&${redirect_uri}&${state}&${scope}`;
  }

  public checkout(): void {
    localStorage.removeItem('current_user');

    this.logout.next();
  }
}
