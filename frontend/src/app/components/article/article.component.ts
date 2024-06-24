import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {NgIf} from "@angular/common";
import {FooterComponent} from "../footer/footer.component";

@Component({
  selector: 'app-article',
  standalone: true,
  templateUrl: './article.component.html',
  imports: [
    NgIf,
    FooterComponent
  ],
  styleUrl: './article.component.scss'
})
export class ArticleComponent implements OnInit {
  protected code: string | null = null;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.code = params.get('code');
    })
  }
}
