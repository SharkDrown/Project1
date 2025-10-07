import { Component } from '@angular/core';
import { RecommendedBooksComponent } from "./recommended-books/recommended-books.component";
import { FeatureBooksComponent } from "./feature-books/feature-books.component";
import { LatestBooksComponent } from "./latest-books/latest-books.component";
import { MostBorrowedBooksComponent } from "./most-borrowed-books/most-borrowed-books.component";

@Component({
  selector: 'app-home',
  imports: [RecommendedBooksComponent, FeatureBooksComponent, LatestBooksComponent, MostBorrowedBooksComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
