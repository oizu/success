import {Component, ElementRef, Input, TemplateRef, ViewChild} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {NgClass, NgForOf, NgTemplateOutlet} from "@angular/common";
import {FlexModule} from "@angular/flex-layout";
import {MatList, MatListItem} from "@angular/material/list";

@Component({
  selector: 'app-slider',
  standalone: true,
  templateUrl: './slider.component.html',
  imports: [
    MatIcon,
    NgClass,
    NgForOf,
    NgTemplateOutlet,
    FlexModule,
    MatList,
    MatListItem
  ],
  styleUrl: './slider.component.scss'
})
export class SliderComponent<T> {
  @ViewChild('scroll') scroll: ElementRef | undefined;
  // @ts-ignore
  @Input() scrollTemplate: TemplateRef<any>;
  @Input() scrollStep: number = 0;
  @Input() scrollTitle = 'Tropical Bunnies';

  protected scrollTop = 0;
  protected scrollEnd = false;

  @Input() items: T[] = [];

  slide(shift: number) {
    if (this.scroll) {
      this.scroll.nativeElement.scrollBy(0, shift, 'smooth');
      this.scroll.nativeElement.scrollLeft += shift;
      this.scrollCheck();
    }
  }

  scrollCheck() {
    if (this.scroll) {
      let element = this.scroll.nativeElement;

      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight;
      const offsetHeight = element.offsetHeight;

      this.scrollTop = scrollTop;
      this.scrollEnd = Math.floor(scrollHeight - scrollTop) <= offsetHeight;
    }
  }
}
