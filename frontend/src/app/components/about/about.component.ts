import {Component, HostListener} from '@angular/core';
import {NgForOf} from "@angular/common";
import {MatList, MatListItem, MatListItemLine, MatListItemTitle} from "@angular/material/list";
import {FlexModule} from "@angular/flex-layout";
import {FooterComponent} from "../footer/footer.component";
import {SliderComponent} from "../slider/slider.component";
import * as THREE from 'three';

class Feature {
  public title: string;
  public bullets: string[];

  constructor(title: string, bullets: string[]) {
    this.title = title;
    this.bullets = bullets;
  }
}

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.component.html',
  imports: [
    NgForOf,
    MatListItem,
    MatListItemTitle,
    MatListItemLine,
    MatList,
    FlexModule,
    FooterComponent,
    SliderComponent
  ],
  styleUrl: './about.component.scss'
})
export class AboutComponent {
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

  private bone?: THREE.Bone;
  protected scrollStep = 0;

  constructor() {
    this.onWindowResize()
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    if (typeof document !== 'undefined') {
      this.scrollStep = window.innerHeight - 80;
    }
  }
}
