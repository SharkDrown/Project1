import { Component } from '@angular/core';
import { AccountMenuComponentComponent } from "../account-menu-component/account-menu-component.component"
import { FindComponent } from "../find/find.component";
import { NavMenuComponent } from "../nav-menu/nav-menu.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AccountMenuComponentComponent, FindComponent, NavMenuComponent, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

}
