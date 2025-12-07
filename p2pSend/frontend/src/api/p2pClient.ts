const API_URL = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:3002';

export interface ReceiverInfo {
  peerId: string;
  addresses: string[];
}

export interface SendFileParams {
  fileName: string;
  fileData: string; // base64
  receiverAddr: string;
}

export interface WebSocketMessage {
  type: 'receiving' | 'sending';
  status: 'started' | 'metadata' | 'progress' | 'complete' | 'error';
  fileName?: string;
  fileSize?: number;
  progress?: number;
  received?: number;
  total?: number;
  filePath?: string;
  hash?: string;
  message?: string;
}

class P2PClient {
  private ws: WebSocket | null = null;
  private listeners: Set<(msg: WebSocketMessage) => void> = new Set();

  async startReceiver(): Promise<ReceiverInfo> {
    const response = await fetch(`${API_URL}/receiver/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Failed to start receiver');
    }

    return response.json();
  }

  async stopReceiver(): Promise<void> {
    await fetch(`${API_URL}/receiver/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async sendFile(params: SendFileParams): Promise<any> {
    const response = await fetch(`${API_URL}/sender/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error('Failed to send file');
    }

    return response.json();
  }

  connectWebSocket(): void {
    if (this.ws) return;

    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.listeners.forEach(listener => listener(message));
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.ws = null;
      // Auto-reconnect after 2 seconds
      setTimeout(() => this.connectWebSocket(), 2000);
    };
  }

  onMessage(listener: (msg: WebSocketMessage) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }
}

export const p2pClient = new P2PClient();
