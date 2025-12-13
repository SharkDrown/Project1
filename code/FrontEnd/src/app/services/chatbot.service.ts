import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = '/api/Chatbot';

  constructor(private http: HttpClient) {}

  ask(question: string): Observable<{ question: string, answer: string }> {
    return this.http.get<{ question: string, answer: string }>(
      `${this.apiUrl}/ask?question=${encodeURIComponent(question)}`
    );
  }
}
