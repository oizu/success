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

  private web_socket!: Subject<string>;

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
    this.url.state = this.session_id = uuid();

    if (typeof document !== 'undefined') {
      this.connect(environment.web_socket_url);
      this.login.subscribe({
        complete: () => {
          this.web_socket.complete();
        }
      });
    }
  }

  private connect(url: string): Subject<string> {
    if (!this.web_socket) {
      this.web_socket = this.create(url);
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
        console.error(`Error receiving message from server: ${error}`);
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
    let redirect_uri = `redirect_uri=${this.url.redirect_uri}`;

    return `${url}?${response_type}&${client_id}&${redirect_uri}&${state}`;
  }

  public checkout(): void {
    localStorage.removeItem('current_user');

    this.logout.next();
  }
}
