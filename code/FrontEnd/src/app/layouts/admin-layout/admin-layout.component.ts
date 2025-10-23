import { Component } from '@angular/core';
import { AdminPagesComponent } from "../../admin-pages/admin-pages.component";

@Component({
  selector: 'app-admin-layout',
  imports: [AdminPagesComponent, AdminPagesComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {

}
