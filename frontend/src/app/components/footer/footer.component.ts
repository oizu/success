import { Component } from '@angular/core';
import {FlexLayoutModule, FlexModule} from "@angular/flex-layout";
import {HeaderComponent} from "../header/header.component";
import {RouterLink, RouterOutlet} from "@angular/router";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  imports: [
    FlexModule,
    FlexLayoutModule,
    HeaderComponent,
    RouterOutlet,
    RouterLink,
    MatIcon
  ],
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

}
