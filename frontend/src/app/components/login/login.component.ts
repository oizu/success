import { Component } from '@angular/core';
import {HeaderComponent} from "../header/header.component";
import {FlexLayoutModule, FlexModule} from "@angular/flex-layout";
import {FlexLayoutServerModule} from "@angular/flex-layout/server";
import {FooterComponent} from "../footer/footer.component";

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
    imports: [
        HeaderComponent,
        FlexLayoutModule,
        FlexLayoutServerModule,
        FooterComponent
    ]
})
export class LoginComponent {

}
