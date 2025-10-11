import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AccountMenuComponentComponent } from "../account-menu-component/account-menu-component.component"
import { FindComponent } from "../find/find.component";
import { NavMenuComponent } from "../nav-menu/nav-menu.component";
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
declare var Swiper: any;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AccountMenuComponentComponent, FindComponent, NavMenuComponent, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  searchQuery: string = '';  // Property cho search input (nếu dùng ngModel)

  constructor(private router: Router) {}  // Inject Router

  ngOnInit(): void {
    // Init logic ban đầu (loại bỏ console.log test)
  }

  ngAfterViewInit(): void {
    // Init Swiper cho announcement-slider
    const swiperElement = document.querySelector('.announcement-slider');
    if (swiperElement) {
      new Swiper(swiperElement, {
        loop: true,
        speed: 600,
        autoplay: { delay: 5000 },
        slidesPerView: 1,
        direction: 'vertical',
        effect: 'slide'
      });
    }
  }

  // Method cho search form submit (navigate đến search-results với query param)
  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search-results'], { queryParams: { q: this.searchQuery } });
    }
  }
}
