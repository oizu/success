import {RouterOutlet} from "@angular/router";
import {MatIconModule} from "@angular/material/icon";
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatList, MatListItem} from "@angular/material/list";
import {FlexLayoutModule} from "@angular/flex-layout";
import {FlexLayoutServerModule} from "@angular/flex-layout/server";
import {Component} from '@angular/core';
import {HeaderComponent} from "./components/header/header.component";
import {FooterComponent} from "./components/footer/footer.component";
import {HomeComponent} from "./components/home/home.component";
import {AboutComponent} from "./components/about/about.component";
import {GameComponent} from "./components/game/game.component";
import {LoginComponent} from "./components/login/login.component";
import {ArticleComponent} from "./components/article/article.component";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    FlexLayoutModule,
    FlexLayoutServerModule,
    RouterOutlet,
    MatIconModule,
    MatGridList,
    MatGridTile,
    MatList,
    MatListItem,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    AboutComponent,
    GameComponent,
    LoginComponent,
    ArticleComponent
  ]
})
export class AppComponent {
  constructor() {
  }
}
