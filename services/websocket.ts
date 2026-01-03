// src/services/websocket.ts
import { API_CONFIG } from '../config/api';
import { Notification } from './api';

type MessageHandler = (notification: Notification) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private subscribers: Set<MessageHandler> = new Set();
  private reconnectTimeout: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private token: string | null = null;
  private isIntentionallyClosed = false;

  connect(token: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.token = token;
    this.isIntentionallyClosed = false;
    this.createConnection();
  }

  private createConnection() {
    if (!this.token) {
      console.error('No token available for WebSocket connection');
      return;
    }

    try {
      const wsUrl = `${API_CONFIG.WS_NOTIFICATION}?token=${this.token}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'notification' && message.data) {
            this.notifySubscribers(message.data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.ws = null;

        if (!this.isIntentionallyClosed) {
          this.attemptReconnect();
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimeout) {
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.createConnection();
    }, delay);
  }

  disconnect() {
    this.isIntentionallyClosed = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.token = null;
    this.reconnectAttempts = 0;
  }

  subscribe(handler: MessageHandler): () => void {
    this.subscribers.add(handler);
    
    return () => {
      this.subscribers.delete(handler);
    };
  }

  private notifySubscribers(notification: Notification) {
    this.subscribers.forEach((handler) => {
      try {
        handler(notification);
      } catch (error) {
        console.error('Error in notification handler', error);
      }
    });
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();
export type { Notification };