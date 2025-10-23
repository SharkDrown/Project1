import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-admin-pages',
  imports: [RouterModule, SidebarComponent,NavbarComponent],
  templateUrl: './admin-pages.component.html',
  styleUrl: './admin-pages.component.css'
})
export class AdminPagesComponent {

}
