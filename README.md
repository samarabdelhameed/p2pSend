# p2pSend - Peer-to-Peer File Transfer

## 📋 Overview
A decentralized peer-to-peer file transfer application built on **libp2p**, enabling direct file sharing between nodes without centralized servers.

## 📦 Project Structure

```
libp2p-file-share/
├── p2pSend/              # Main P2P file transfer application
│   ├── index.js          # Node implementation with file receiver
│   ├── package.json      # Dependencies and project metadata
│   └── received/         # Directory for received files
└── README.md             # This file
```

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
│  • Protocol: /p2p-send/1.0.0        │
└─────────────────────────────────────┘
```

## 🔧 Technical Stack

### Dependencies
```json
{
  "libp2p": "^1.8.1",
  "@libp2p/tcp": "^9.1.4",
  "@libp2p/mplex": "^10.1.4",
  "@chainsafe/libp2p-noise": "^15.1.0",
  "@multiformats/multiaddr": "^12.3.1",
  "it-pipe": "^3.0.1",
  "it-buffer": "^0.1.3"
}
```

### Node Configuration
- **Listen Address**: `0.0.0.0:0` (binds to all interfaces, random port)
- **Connection Encryption**: Noise XX handshake pattern
- **Stream Multiplexer**: mplex (lightweight, efficient)
- **DHT Mode**: Client (queries only, doesn't store records)
- **Custom Protocol**: `/p2p-send/1.0.0` for file transfers

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Installation
```bash
cd p2pSend
npm install
```

### Run Receiver Node
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

### Send a File

1. Copy the receiver's multiaddr from the output above
2. Edit `sender.js` and update `RECEIVER_ADDR` with the copied address
3. Run the sender:

```bash
node sender.js
```

**Expected Output:**
```
Sender node started
Sender Peer ID: 12D3KooW...
Connecting to receiver...
Connected to receiver
Opening stream...
✅ Sent test.txt
```

The receiver will show:
```
📥 Receiving file...
✅ File saved to received/1234567890.bin
```

### Quick Test (Both Nodes)
```bash
node simple-test.js
```

This runs both sender and receiver in a single process for quick testing.

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

### File Transfer Protocol
- **Protocol ID**: `/p2p-send/1.0.0`
- **Method**: Stream-based transfer
- **Metadata Format**: `{filename}|{filesize}` (sent as first chunk)
- **Storage**: Files saved to `received/` with original filename
- **Security**: Path traversal protection using `path.basename()`
- **Verification**: File size validation after transfer

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
5. File transfer over /p2p-send/1.0.0
```

## 📊 Current Status

### ✅ Implemented
- [x] Basic libp2p node initialization
- [x] TCP transport layer
- [x] Noise encryption (@chainsafe/libp2p-noise)
- [x] mplex stream multiplexing
- [x] Peer ID generation
- [x] Multi-interface listening
- [x] Custom protocol handler for file transfer (`/p2p-send/1.0.0`)
- [x] Stream-based file reception
- [x] Sender node implementation
- [x] **File metadata transmission** (filename + size) ✨
- [x] **Original filename preservation** ✨
- [x] **File size verification** ✨
- [x] **Path traversal protection** ✨

### 📊 Test Results

**Step 5: Basic File Transfer (December 1, 2024)**

**Receiver Output:**
```
libp2p node started
Peer ID: 12D3KooWQQ3XNY1piGUv8x6m3gaV9Tn8Yd2ZcJKdCMCasZ5woqS6
Listen addresses: [
  '/ip4/127.0.0.1/tcp/51694/p2p/12D3KooWQQ3XNY1piGUv8x6m3gaV9Tn8Yd2ZcJKdCMCasZ5woqS6',
  '/ip4/172.20.10.3/tcp/51694/p2p/12D3KooWQQ3XNY1piGUv8x6m3gaV9Tn8Yd2ZcJKdCMCasZ5woqS6'
]
📥 Receiving file...
✅ File saved to received/1764587055311.bin
```

**Sender Output:**
```
Sender node started
✅ Sent test.txt
```

---

**Step 6: Metadata & Filename Preservation (December 2, 2024)**

**Receiver Output:**
```
libp2p node started
Peer ID: 12D3KooWLwDcwDSpyEpgCBZbF85Q3BuLUoTUw6TcvK4GPukGJoPW
Listen addresses: [
  '/ip4/127.0.0.1/tcp/57482/p2p/12D3KooWLwDcwDSpyEpgCBZbF85Q3BuLUoTUw6TcvK4GPukGJoPW',
  '/ip4/192.168.1.2/tcp/57482/p2p/12D3KooWLwDcwDSpyEpgCBZbF85Q3BuLUoTUw6TcvK4GPukGJoPW'
]
📥 Incoming: test.txt (18 bytes)
✅ Saved: received/test.txt
```

**Sender Output:**
```
Sender node started
✅ Sent test.txt (18 bytes)
```

**File Verification:**
```bash
$ ls -la received/
-rw-r--r--  1 s  staff  18 Dec  2 06:08 test.txt

$ cat received/test.txt
Hello from libp2p!
```

**Status:** ✅ **Enhanced P2P file transfer working!** Files now include metadata (name + size) and are saved with original filenames.

### 🚧 Roadmap
- [x] Create sender script to test file transfer ✅
- [x] Basic P2P file transfer working ✅
- [x] Add file metadata (name, size) transmission ✅
- [x] Original filename preservation ✅
- [x] File size verification ✅
- [x] Path traversal protection ✅
- [ ] File chunking for large files
- [ ] Hash verification (integrity check)
- [ ] Progress tracking
- [ ] Peer discovery mechanisms
- [ ] Bootstrap nodes configuration
- [ ] Resume interrupted transfers
- [ ] Multi-file support
- [ ] CLI interface
- [ ] NAT traversal support

## 🧪 Development

### Debug Mode
```bash
DEBUG=libp2p:* node index.js
```

### Key Modules
- `createLibp2p()`: Factory function for node creation
- `node.start()`: Initializes transports and starts listening
- `node.handle()`: Registers protocol handler for incoming streams
- `node.peerId`: Unique identifier for this node
- `node.getMultiaddrs()`: Returns all listening addresses

### File Reception Flow
```javascript
1. Incoming connection on /p2p-send/1.0.0
2. Read first chunk as metadata header (filename|filesize)
3. Extract and sanitize filename using path.basename()
4. Collect remaining chunks as file data
5. Verify total size matches expected size
6. Write to received/ directory with original filename
7. Log success message with filename and size
```

### File Sending Flow
```javascript
1. Read file stats (name, size)
2. Create metadata header: "filename|filesize"
3. Connect to receiver via multiaddr
4. Open stream on /p2p-send/1.0.0 protocol
5. Send header as first chunk
6. Send file content as subsequent chunks
7. Close connection
```

## 📚 Resources
- [libp2p Documentation](https://docs.libp2p.io/)
- [Noise Protocol Framework](https://noiseprotocol.org/)
- [Kademlia DHT Paper](https://pdos.csail.mit.edu/~petar/papers/maymounkov-kademlia-lncs.pdf)
- [Multiaddr Specification](https://github.com/multiformats/multiaddr)
- [it-pipe Documentation](https://github.com/alanshaw/it-pipe)

## 📄 License
MIT

## 👤 Author
Samar Abdelhameed

---
**Note**: This is an early-stage implementation. Production use requires additional features like NAT traversal, relay servers, and comprehensive error handling.
