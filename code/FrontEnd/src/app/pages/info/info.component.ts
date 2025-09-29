import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InfoMenuComponent } from "./info-menu/info-menu.component";

@Component({
  selector: 'app-info',
  imports: [RouterModule, InfoMenuComponent],
  templateUrl: './info.component.html',
  styleUrl: './info.component.css'
})
export class InfoComponent {

}
