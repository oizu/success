import { Component } from '@angular/core';
import {MatListModule} from "@angular/material/list";
import {FlexModule, FlexLayoutModule} from "@angular/flex-layout";
import {FooterComponent} from "../footer/footer.component";
import {NgForOf} from "@angular/common";

class Feature {
  public title: string;
  public bullets: string[];

  constructor(title: string, bullets: string[]) {
    this.title = title;
    this.bullets = bullets;
  }
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [
    MatListModule,
    FlexModule,
    FlexLayoutModule,
    FooterComponent,
    NgForOf
  ]
})
export class HomeComponent {
  protected features: Feature[] = [
    new Feature(
      'Flirting',
      [
        'With robust privacy and security measures, users can explore romantic connections safely and confidently. ',
        'With robust privacy and security measures, users can explore romantic connections safely and confidently. ',
        'With robust privacy and security measures, users can explore romantic connections safely and confidently. '
      ]
    ),
    new Feature(
      'Romance',
      [
        'With robust privacy and security measures, users can explore romantic connections safely and confidently. ',
        'With robust privacy and security measures, users can explore romantic connections safely and confidently. ',
        'With robust privacy and security measures, users can explore romantic connections safely and confidently. '
      ]
    ),
    new Feature(
      'Chatting',
      [
        'With robust privacy and security measures, users can explore romantic connections safely and confidently. ',
        'With robust privacy and security measures, users can explore romantic connections safely and confidently. ',
        'With robust privacy and security measures, users can explore romantic connections safely and confidently. '
      ]
    ),
    new Feature(
      'Shopping',
      [
        'With robust privacy and security measures, users can explore romantic connections safely and confidently. ',
        'With robust privacy and security measures, users can explore romantic connections safely and confidently. ',
        'With robust privacy and security measures, users can explore romantic connections safely and confidently. '
      ]
    ),
    new Feature(
      'Texting',
      [
        'With robust privacy and security measures, users can explore romantic connections safely and confidently. ',
        'With robust privacy and security measures, users can explore romantic connections safely and confidently. ',
        'With robust privacy and security measures, users can explore romantic connections safely and confidently. '
      ]
    )
  ];
}
