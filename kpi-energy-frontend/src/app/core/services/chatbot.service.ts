import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { TokenStorageService } from './token-storage.service';

export interface ChatMessage {
  id: number;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'data' | 'chart' | 'error';
  data?: any;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'http://localhost:8081/api/chatbot';
  private currentSession = this.generateSessionId();

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.tokenStorage.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  sendMessage(message: string): Observable<any> {
    const request = {
      message: message,
      sessionId: this.currentSession,
      context: {} // Contexte de conversation
    };

    return this.http.post(`${this.apiUrl}/message`, request, {
      headers: this.getHeaders()
    });
  }

  addUserMessage(message: string): void {
    const userMessage: ChatMessage = {
      id: Date.now(),
      message: message,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    this.addMessage(userMessage);
  }

  addBotMessage(response: any): void {
    const botMessage: ChatMessage = {
      id: Date.now(),
      message: response.response,
      sender: 'bot',
      timestamp: new Date(),
      type: response.type,
      data: response.data
    };

    this.addMessage(botMessage);
  }

  private addMessage(message: ChatMessage): void {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
    this.currentSession = this.generateSessionId();
  }
}
