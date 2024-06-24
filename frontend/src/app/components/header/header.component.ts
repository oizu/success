import {Component, OnDestroy} from '@angular/core';
import {FlexLayoutServerModule} from "@angular/flex-layout/server";
import {FlexLayoutModule} from "@angular/flex-layout";
import {RouterLink} from "@angular/router";
import {NgIf} from "@angular/common";
import {SecurityService} from "../../services/security.service";
import {User} from "../../models/user";

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [
    FlexLayoutModule,
    FlexLayoutServerModule,
    RouterLink,
    NgIf
  ],
  providers: []
})
export class HeaderComponent implements OnDestroy {
  protected user!: User | undefined;

  constructor(protected security: SecurityService) {
    if (typeof document !== 'undefined') {
      const current_user = localStorage.getItem('current_user');
      this.user = current_user ? JSON.parse(current_user) : null;
    }

    this.security.login.subscribe((event) => {
      this.user = event;
    });
    this.security.logout.subscribe((event) => {
      this.user = undefined;
    });
  }

  ngOnDestroy(): void {
    this.security.login.complete();
  }
}
