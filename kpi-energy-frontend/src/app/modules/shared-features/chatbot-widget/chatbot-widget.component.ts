import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage } from '../../../core/services/chatbot.service';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.css']
})
export class ChatbotWidgetComponent implements OnInit {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';
  isOpen = false;
  isLoading = false;

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    this.chatbotService.messages$.subscribe(messages => {
      this.messages = messages;
      this.scrollToBottom();
    });
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      this.addWelcomeMessage();
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    this.isLoading = true;
    const message = this.newMessage.trim();
    this.newMessage = '';

    // Ajouter le message utilisateur
    this.chatbotService.addUserMessage(message);

    // Envoyer au backend
    this.chatbotService.sendMessage(message).subscribe({
      next: (response) => {
        this.chatbotService.addBotMessage(response);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chatbot:', error);
        this.addErrorMessage('Désolé, une erreur est survenue.');
        this.isLoading = false;
      }
    });
  }

  private addWelcomeMessage(): void {
    const welcomeMessage: ChatMessage = {
      id: Date.now(),
      message: 'Bonjour ! Je suis votre assistant EnergyTracker. Comment puis-je vous aider aujourd\'hui ?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    };
    this.chatbotService.addBotMessage(welcomeMessage);
  }

  private addErrorMessage(message: string): void {
    const errorMessage: ChatMessage = {
      id: Date.now(),
      message: message,
      sender: 'bot',
      timestamp: new Date(),
      type: 'error'
    };
    this.chatbotService.addBotMessage(errorMessage);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  formatData(data: any): string {
    if (!data) return '';

    if (Array.isArray(data)) {
      return data.map(item => JSON.stringify(item)).join('\n');
    }

    return JSON.stringify(data, null, 2);
  }
}
