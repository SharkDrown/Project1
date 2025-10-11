import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-account-menu',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './account-menu-component.component.html',
  styleUrls: ['./account-menu-component.component.css']
})
export class AccountMenuComponentComponent {
  dropdownOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  // Đóng dropdown khi click ra ngoài
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.account-dropdown')) {
      this.closeDropdown();
    }
  }
}
