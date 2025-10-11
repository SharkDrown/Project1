import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // Thêm imports nếu bạn dùng Header/Footer trong template (nếu chưa có)
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title="FrontEnd"

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnInit(): void {
    // Ẩn preloader sau khi app init
    setTimeout(() => {
      const preloader = document.getElementById('preloader');
      if (preloader) {
        preloader.classList.add('hide');
      }
    }, 1000);
  }

  // Listen scroll event trên window
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = document.getElementById('scroll-top');
    if (scrollTop) {
      if (window.pageYOffset > 100) { // Hiện nút khi scroll > 100px
        scrollTop.classList.add('show');
      } else {
        scrollTop.classList.remove('show');
      }
    }
  }

  // Listen click trên nút (alternative nếu không dùng (click) trong HTML)
  @HostListener('click', ['$event'])
  onClick(event: Event) {
    const target = event.target as HTMLElement;
    if (target.closest('#scroll-top')) {
      event.preventDefault(); // Ngăn routerLink mặc định
      this.scrollToTop();
    }
  }
}
