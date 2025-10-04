import { Component, OnInit, AfterViewInit } from '@angular/core';
declare var AOS: any; // Declare cho global libs
declare var GLightbox: any;
declare var Drift: any;
declare var PureCounter: any;
declare var Swiper: any; // Nếu có swiper khác trong page

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, AfterViewInit {
  ngOnInit() {
    // Init AOS (animation)
    AOS.init({ duration: 1000, once: true });

    // Init PureCounter nếu có counters (trong HTML không thấy, nhưng nếu có)
    new PureCounter();
  }

  ngAfterViewInit() {
    // Init GLightbox nếu có gallery (trong HTML không thấy, nhưng vendor có)
    GLightbox({ selector: '.glightbox' });

    // Init Drift Zoom nếu có zoom image (cho product images)
    document.querySelectorAll('.product-image').forEach(el => {
      new Drift(el, { paneContainer: document.body });
    });

    
  }
}