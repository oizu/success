import {Routes} from '@angular/router';
import {LoginComponent} from "./components/login/login.component";
import {GameComponent} from "./components/game/game.component";
import {HomeComponent} from "./components/home/home.component";
import {AboutComponent} from "./components/about/about.component";
import {ArticleComponent} from "./components/article/article.component";
import {AccountComponent} from "./components/account/account.component";

export const routes: Routes = [
  {path: "articles/:code", component: ArticleComponent, title: "Tropical Bunnies - article"},
  {path: "account", component: AccountComponent, title: "Tropical Bunnies - Account"},
  {path: "about", component: AboutComponent, title: "Tropical Bunnies - About"},
  {path: "login", component: LoginComponent, title: "Tropical Bunnies - Sign in"},
  {path: "game", component: GameComponent, title: "Tropical Bunnies - Play"},
  {path: "", component: HomeComponent, title: "Tropical Bunnies"}
];
