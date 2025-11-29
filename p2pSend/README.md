# p2pSend - Peer-to-Peer File Transfer

## 📋 Overview
A decentralized peer-to-peer file transfer application built on **libp2p**, enabling direct file sharing between nodes without centralized servers.

## 🏗️ Architecture

### Core Components
- **libp2p**: Modular networking stack for P2P applications
- **Transport Layer**: TCP for reliable connection establishment
- **Stream Multiplexing**: mplex for concurrent streams over single connection
- **Encryption**: Noise protocol for secure channel establishment
- **DHT**: Kademlia Distributed Hash Table for peer discovery (client mode)

### Current Implementation (v0.1)
```
┌─────────────────────────────────────┐
│         libp2p Node                 │
├─────────────────────────────────────┤
│  • TCP Transport (0.0.0.0:random)   │
│  • Noise Encryption                 │
│  • mplex Stream Muxer               │
│  • Kad-DHT (client mode)            │
└─────────────────────────────────────┘
```

## 🔧 Technical Stack

### Dependencies
```json
{
  "libp2p": "^1.9.4",
  "@libp2p/tcp": "^9.1.4",
  "@libp2p/mplex": "^10.1.4",
  "@libp2p/noise": "^15.1.1",
  "@libp2p/kad-dht": "^12.1.4"
}
```

### Node Configuration
- **Listen Address**: `0.0.0.0:0` (binds to all interfaces, random port)
- **Connection Encryption**: Noise XX handshake pattern
- **Stream Multiplexer**: mplex (lightweight, efficient)
- **DHT Mode**: Client (queries only, doesn't store records)

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Installation
```bash
cd p2pSend
npm install
```

### Run Basic Node
```bash
node index.js
```

**Expected Output:**
```
libp2p node started
Peer ID: 12D3KooW...
Listen addresses: [
  '/ip4/127.0.0.1/tcp/xxxxx/p2p/12D3KooW...',
  '/ip4/192.168.x.x/tcp/xxxxx/p2p/12D3KooW...'
]
```

## 📡 Network Protocol

### Multiaddr Format
```
/ip4/<IP>/tcp/<PORT>/p2p/<PEER_ID>
```
- **IP**: IPv4 address (127.0.0.1 for localhost, LAN IP for network)
- **PORT**: Dynamically assigned TCP port
- **PEER_ID**: Base58-encoded multihash of node's public key

### Peer ID Generation
- Uses Ed25519 key pair by default
- PeerId format: `12D3KooW...` (CIDv1 with libp2p-key codec)
- Deterministic from private key (persists across restarts if key saved)

## 🔐 Security Features

### Noise Protocol
- **Pattern**: XX (mutual authentication)
- **Cipher**: ChaCha20-Poly1305
- **Hash**: SHA256
- Provides forward secrecy and identity hiding

### Connection Flow
```
1. TCP handshake
2. Noise XX handshake (3 messages)
   ├─ Initiator → Responder: ephemeral key
   ├─ Responder → Initiator: ephemeral + static keys
   └─ Initiator → Responder: static key
3. Encrypted channel established
4. Protocol negotiation via multistream-select
```

## 📊 Current Status

### ✅ Implemented
- [x] Basic libp2p node initialization
- [x] TCP transport layer
- [x] Noise encryption
- [x] mplex stream multiplexing
- [x] DHT client mode
- [x] Peer ID generation
- [x] Multi-interface listening

### 🚧 Roadmap
- [ ] Custom protocol handler for file transfer
- [ ] File chunking and streaming
- [ ] Progress tracking
- [ ] Peer discovery mechanisms
- [ ] Bootstrap nodes configuration
- [ ] Resume interrupted transfers
- [ ] Multi-file support
- [ ] CLI interface

## 🧪 Development

### Debug Mode
```bash
DEBUG=libp2p:* node index.js
```

### Key Modules
- `createLibp2p()`: Factory function for node creation
- `node.start()`: Initializes transports and starts listening
- `node.peerId`: Unique identifier for this node
- `node.getMultiaddrs()`: Returns all listening addresses

## 📚 Resources
- [libp2p Documentation](https://docs.libp2p.io/)
- [Noise Protocol Framework](https://noiseprotocol.org/)
- [Kademlia DHT Paper](https://pdos.csail.mit.edu/~petar/papers/maymounkov-kademlia-lncs.pdf)
- [Multiaddr Specification](https://github.com/multiformats/multiaddr)

## 📄 License
MIT

## 👤 Author
Samar Abdelhameed

---
**Note**: This is an early-stage implementation. Production use requires additional features like NAT traversal, relay servers, and comprehensive error handling.
