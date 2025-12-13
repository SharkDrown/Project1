import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chatbot.service';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {

  isOpen = false;
  userInput = '';
  messages: ChatMessage[] = [];

  constructor(private chatService: ChatService) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const question = this.userInput;
    this.messages.push({ sender: 'user', text: question });
    this.userInput = '';

    this.chatService.ask(question).subscribe(res => {
      this.messages.push({
        sender: 'ai',
        text: res.answer
      });
    });
  }
}
