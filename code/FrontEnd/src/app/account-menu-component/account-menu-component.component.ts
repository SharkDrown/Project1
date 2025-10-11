import { Component } from '@angular/core';
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
}
