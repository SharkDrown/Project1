import { Component } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';
import { ChatbotComponent } from "../../chatbot/chatbot.component";

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [HeaderComponent, RouterModule, FooterComponent, ChatbotComponent],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.css'
})
export class UserLayoutComponent {

}
