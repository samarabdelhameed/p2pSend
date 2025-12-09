import { createLibp2p, Libp2p } from 'libp2p';
import { webSockets } from '@libp2p/websockets';
import { webRTC } from '@libp2p/webrtc';
import { yamux } from '@chainsafe/libp2p-yamux';
import { noise } from '@chainsafe/libp2p-noise';
import { identify } from '@libp2p/identify';
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2';
import { bootstrap } from '@libp2p/bootstrap';
import { multiaddr } from '@multiformats/multiaddr';
import type { Connection } from '@libp2p/interface';

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
  private handlerRegistered: boolean = false;

  async initialize(): Promise<void> {
    if (this.node) return;

    this.node = await createLibp2p({
      addresses: {
        listen: [
          '/webrtc',
          '/p2p-circuit'
        ]
      },
      transports: [
        webSockets(),
        webRTC({
          rtcConfiguration: {
            iceServers: [
              {
                urls: [
                  'stun:stun.l.google.com:19302',
                  'stun:global.stun.twilio.com:3478'
                ]
              }
            ]
          }
        }),
        circuitRelayTransport()
      ],
      streamMuxers: [yamux()],
      connectionEncrypters: [noise()],
      services: {
        identify: identify(),
        bootstrap: bootstrap({
          list: [
            // libp2p public bootstrap nodes with relay support
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
            // Additional public relay nodes
            '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ'
          ],
          timeout: 10000,
          tagName: 'bootstrap',
          tagValue: 50,
          tagTTL: 120000
        })
      },
      connectionManager: {
        maxConnections: 100
      }
    });

    await this.node.start();
    console.log('✅ libp2p node started in browser');
    console.log('Peer ID:', this.node.peerId.toString());
    
    // Wait for bootstrap connections
    console.log('Connecting to bootstrap nodes...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const connections = this.node.getConnections();
    console.log(`Connected to ${connections.length} peers`);
    connections.forEach(conn => {
      console.log('Connected peer:', conn.remotePeer.toString());
    });
  }

  async startReceiver(): Promise<ReceiverInfo> {
    await this.initialize();

    if (!this.node) throw new Error('Node not initialized');

    // Unregister old handler if exists, then register new one
    try {
      if (this.handlerRegistered) {
        await this.node.unhandle(PROTOCOL);
        this.handlerRegistered = false;
      }
    } catch (err) {
      // Ignore if handler doesn't exist
    }

    // Register protocol handler
    await this.node.handle(PROTOCOL, async (stream) => {
      await this.handleIncomingFile(stream);
    });
    this.handlerRegistered = true;

    // Get all multiaddrs including circuit relay addresses
    const addresses = this.node.getMultiaddrs().map(ma => ma.toString());
    const peerId = this.node.peerId.toString();
    
    // Add circuit relay addresses for each connected peer
    const connections = this.node.getConnections();
    const relayAddresses: string[] = [];
    
    for (const conn of connections) {
      const remoteAddr = conn.remoteAddr.toString();
      // Create circuit relay address through this peer
      const relayAddr = `${remoteAddr}/p2p-circuit/p2p/${peerId}`;
      relayAddresses.push(relayAddr);
    }
    
    console.log('Direct addresses:', addresses);
    console.log('Relay addresses:', relayAddresses);
    
    const allAddresses = [...addresses, ...relayAddresses];
    
    return {
      peerId,
      addresses: allAddresses.length > 0 ? allAddresses : [`/p2p/${peerId}`]
    };
  }

  private async handleIncomingFile(stream: any): Promise<void> {
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

      for await (const chunk of stream) {
        const data = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);

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

      // Parse receiver address
      let receiverMultiaddr = multiaddr(receiverAddr);
      
      // If it's just a peer ID, try to find the peer through relay
      if (receiverAddr.startsWith('/p2p/')) {
        const peerId = receiverAddr.replace('/p2p/', '');
        console.log('Attempting to connect to peer via relay:', peerId);
        
        // Wait for bootstrap connections
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Try to connect through circuit relay
        const relayAddrs = [
          `/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN/p2p-circuit/p2p/${peerId}`,
          `/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa/p2p-circuit/p2p/${peerId}`,
          `/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ/p2p-circuit/p2p/${peerId}`
        ];
        
        let connected = false;
        for (const addr of relayAddrs) {
          try {
            console.log('Trying relay address:', addr);
            receiverMultiaddr = multiaddr(addr);
            await this.node.dial(receiverMultiaddr);
            connected = true;
            console.log('✅ Connected via relay:', addr);
            break;
          } catch (err) {
            console.log('Failed to connect via relay:', addr, err);
            continue;
          }
        }
        
        if (!connected) {
          throw new Error('Could not connect to receiver via any relay. Make sure the receiver is online and connected to the network.');
        }
      } else {
        // Direct connection with full multiaddr
        await this.node.dial(receiverMultiaddr);
      }

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
      for (const chunk of chunks) {
        stream.send(chunk);
      }
      
      await stream.close();

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
    this.handlerRegistered = false;
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
