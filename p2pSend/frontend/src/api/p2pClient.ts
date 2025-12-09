import { createLibp2p, Libp2p } from 'libp2p';
import { webSockets } from '@libp2p/websockets';
import { webRTC } from '@libp2p/webrtc';
import { mplex } from '@libp2p/mplex';
import { noise } from '@chainsafe/libp2p-noise';
import { multiaddr } from '@multiformats/multiaddr';
import type { Stream } from '@libp2p/interface';

const PROTOCOL = '/p2p-send/1.0.0';

export interface ReceiverInfo {
  peerId: string;
  addresses: string[];
}

export interface SendFileParams {
  file: File;
  receiverAddr: string;
}

export interface TransferProgress {
  type: 'receiving' | 'sending';
  status: 'started' | 'metadata' | 'progress' | 'complete' | 'error';
  fileName?: string;
  fileSize?: number;
  progress?: number;
  received?: number;
  total?: number;
  hash?: string;
  message?: string;
}

type ProgressCallback = (progress: TransferProgress) => void;

class P2PClient {
  private node: Libp2p | null = null;
  private listeners: Set<ProgressCallback> = new Set();

  async initialize(): Promise<void> {
    if (this.node) return;

    this.node = await createLibp2p({
      addresses: {
        listen: [
          '/webrtc',
          '/wss/0.0.0.0/tcp/0/ws'
        ]
      },
      transports: [
        webSockets(),
        webRTC()
      ],
      streamMuxers: [mplex()],
      connectionEncryption: [noise()],
      connectionManager: {
        minConnections: 0
      }
    });

    await this.node.start();
    console.log('✅ libp2p node started in browser');
    console.log('Peer ID:', this.node.peerId.toString());
  }

  async startReceiver(): Promise<ReceiverInfo> {
    await this.initialize();

    if (!this.node) throw new Error('Node not initialized');

    // Register protocol handler
    await this.node.handle(PROTOCOL, async ({ stream }) => {
      await this.handleIncomingFile(stream);
    });

    const addresses = this.node.getMultiaddrs().map(ma => ma.toString());
    
    return {
      peerId: this.node.peerId.toString(),
      addresses: addresses.length > 0 ? addresses : [`/p2p/${this.node.peerId.toString()}`]
    };
  }

  private async handleIncomingFile(stream: Stream): Promise<void> {
    try {
      let fileName = '';
      let fileSize = 0;
      let expectedHash = '';
      let headerDone = false;
      const chunks: Uint8Array[] = [];

      this.notifyListeners({
        type: 'receiving',
        status: 'started'
      });

      for await (const chunk of stream.source) {
        const data = chunk.subarray();

        if (!headerDone) {
          const header = new TextDecoder().decode(data);
          const [name, size, hash] = header.split('|');
          fileName = name;
          fileSize = parseInt(size, 10);
          expectedHash = hash;
          headerDone = true;

          this.notifyListeners({
            type: 'receiving',
            status: 'metadata',
            fileName,
            fileSize
          });
          continue;
        }

        chunks.push(data);

        const received = chunks.reduce((sum, c) => sum + c.length, 0);
        const progress = Math.round((received / fileSize) * 100);

        this.notifyListeners({
          type: 'receiving',
          status: 'progress',
          progress,
          received,
          total: fileSize
        });
      }

      // Verify hash
      const fileData = new Uint8Array(chunks.reduce((sum, c) => sum + c.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        fileData.set(chunk, offset);
        offset += chunk.length;
      }

      const hashBuffer = await crypto.subtle.digest('SHA-256', fileData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const actualHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (actualHash !== expectedHash) {
        this.notifyListeners({
          type: 'receiving',
          status: 'error',
          message: 'Hash verification failed'
        });
        return;
      }

      // Create download link
      const blob = new Blob([fileData]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.notifyListeners({
        type: 'receiving',
        status: 'complete',
        fileName,
        fileSize,
        hash: actualHash
      });
    } catch (error: any) {
      this.notifyListeners({
        type: 'receiving',
        status: 'error',
        message: error.message
      });
    }
  }

  async sendFile(params: SendFileParams): Promise<void> {
    await this.initialize();

    if (!this.node) throw new Error('Node not initialized');

    try {
      const { file, receiverAddr } = params;

      this.notifyListeners({
        type: 'sending',
        status: 'started',
        fileName: file.name,
        fileSize: file.size
      });

      // Connect to receiver
      const receiverMultiaddr = multiaddr(receiverAddr);
      await this.node.dial(receiverMultiaddr);

      // Open stream
      const stream = await this.node.dialProtocol(receiverMultiaddr, PROTOCOL);

      // Read file
      const arrayBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      // Calculate hash
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Prepare header
      const header = new TextEncoder().encode(`${file.name}|${file.size}|${fileHash}`);

      // Send in chunks
      const chunkSize = 64 * 1024; // 64KB
      const chunks: Uint8Array[] = [header];

      for (let i = 0; i < fileData.length; i += chunkSize) {
        const chunk = fileData.slice(i, i + chunkSize);
        chunks.push(chunk);

        const progress = Math.round(((i + chunk.length) / fileData.length) * 100);
        this.notifyListeners({
          type: 'sending',
          status: 'progress',
          progress
        });
      }

      // Send all chunks
      await stream.sink(chunks);

      this.notifyListeners({
        type: 'sending',
        status: 'complete',
        fileName: file.name,
        fileSize: file.size,
        hash: fileHash
      });
    } catch (error: any) {
      this.notifyListeners({
        type: 'sending',
        status: 'error',
        message: error.message
      });
      throw error;
    }
  }

  onProgress(callback: ProgressCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(progress: TransferProgress): void {
    this.listeners.forEach(listener => listener(progress));
  }

  async stop(): Promise<void> {
    if (this.node) {
      await this.node.stop();
      this.node = null;
    }
    this.listeners.clear();
  }

  getAddresses(): string[] {
    if (!this.node) return [];
    return this.node.getMultiaddrs().map(ma => ma.toString());
  }

  getPeerId(): string {
    if (!this.node) return '';
    return this.node.peerId.toString();
  }
}

export const p2pClient = new P2PClient();
