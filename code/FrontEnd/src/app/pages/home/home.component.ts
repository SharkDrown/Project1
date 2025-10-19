import { RecommendedBooksComponent } from "./recommended-books/recommended-books.component";
import { FeatureBooksComponent } from "./feature-books/feature-books.component";
import { LatestBooksComponent } from "./latest-books/latest-books.component";
import { MostBorrowedBooksComponent } from "./most-borrowed-books/most-borrowed-books.component";
import { Component, OnInit, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule} from '@angular/common';
import { HttpClient } from '@angular/common/http';
import AOS from 'aos';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RecommendedBooksComponent, FeatureBooksComponent, LatestBooksComponent, MostBorrowedBooksComponent,CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit {

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Nếu sau này muốn dùng lại RSS XML thì bật lại phần loadRSS()
  }

  ngAfterViewInit() {
    // Tạo script RSS.app để hiển thị bảng tin dạng imageboard
    const script = document.createElement('script');
    script.src = 'https://widget.rss.app/v1/imageboard.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
  const board = document.querySelector('rssapp-imageboard');
  if (board) board.classList.add('rssapp-loaded');
  AOS.refresh();
};


    document.body.appendChild(script);

    
  }

  
}
