# p2pSend – True P2P File Transfer

Send files directly peer-to-peer with **SHA-256 verification** and **end-to-end encryption**.

🌐 **Web Interface** + 💻 **CLI** + 🔐 **Encrypted** + ⚡ **Real P2P**

## ⚠️ Important: This is TRUE Peer-to-Peer

This application uses **real libp2p** in both browser and Node.js. There is **NO central server** for file transfer. Files go directly from peer to peer.

## 🌐 Live Demo

**Frontend:** [https://p2psend.surge.sh](https://p2psend.surge.sh)

> **Note:** This is a true P2P app - no backend server needed! Files transfer directly between browsers.

## 🎥 Demo Video

![Demo Video](p2pSend/demo.mp4)

[📹 Watch Demo Video](https://github.com/samarabdelhameed/p2pSend/raw/main/p2pSend/demo.mp4)

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Installation

```bash
# Clone the repository
git clone https://github.com/samarabdelhameed/p2pSend.git
cd p2pSend/p2pSend

# Install backend dependencies (for CLI)
npm install

# Install frontend dependencies (IMPORTANT: includes libp2p!)
cd frontend
rm -rf node_modules package-lock.json  # Clean install
npm install
cd ..
```

**⚠️ Important:** After updating to v2.0, you MUST reinstall frontend dependencies to get libp2p packages!

### Verify Installation

After installing, verify libp2p is installed:

```bash
cd frontend
npm list libp2p
# Should show: libp2p@1.x.x
```

Test the build:
```bash
npm run typecheck  # Check for TypeScript errors
npm run build      # Build for production
```

**Note:** Bundle size is ~600KB (libp2p is a full P2P stack). This is normal for true P2P applications.

---

## 🎯 Running the Application

### Option 1: Web Interface (Recommended)

#### Step 1: Start Frontend
```bash
# From p2pSend directory
cd frontend
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

#### Step 2: Open Browser
Open your browser and navigate to:
```
http://localhost:5173
```

**That's it!** No backend server needed. libp2p runs directly in your browser.

---

## 📱 Using the Web Interface

### Receiver Side:
1. Click **"Receive"** button
2. Wait for libp2p initialization (~2 seconds)
3. Copy your peer address (e.g., `/p2p/12D3KooW...`)
4. Share this address with the sender
5. Keep the tab open and wait for incoming files

### Sender Side:
1. Open a new browser tab: `http://localhost:5173`
2. Click **"Send File"** button
3. Select or drag & drop your file
4. Paste the receiver's peer address
5. Click **"Start Transfer"**
6. Watch the real-time progress!

### Download Received File:
- File is **automatically downloaded** to your Downloads folder
- No server storage - direct P2P transfer!

---

## 💻 Option 2: CLI Interface

### Start Receiver
```bash
p2psend receive
```

Output:
```
Receiver ready
Peer ID: 12D3KooW...
Addresses: [
  '/ip4/127.0.0.1/tcp/xxxxx/p2p/12D3KooW...',
  '/ip4/192.168.1.x/tcp/xxxxx/p2p/12D3KooW...'
]
```

Copy one of the addresses.

### Send File
```bash
p2psend send <file> --to <receiver-address>
```

**Example:**
```bash
p2psend send document.pdf --to /ip4/127.0.0.1/tcp/50322/p2p/12D3KooWBgEWKgRtquDQP5YxDi41BsXgvLJS1kcgZWBfTDF5Sjkw
```

**Output:**
```
✅ Sent document.pdf (1024 bytes)
```

### CLI Help
```bash
p2psend --help
p2psend send --help
p2psend receive --help
```

---

## ✨ Features

- 🌐 **Web Interface** – Modern React UI with real-time updates
- 💻 **CLI Interface** – Command-line for power users
- 🔐 **Encrypted** – Noise protocol end-to-end encryption
- ✅ **SHA-256 Verification** – Automatic integrity check
- ⚡ **Real-time Progress** – Direct P2P progress tracking
- 📁 **Original Filename** – Files saved with correct names
- 🚀 **TRUE P2P** – libp2p in browser, no central server
- 📥 **Auto Download** – Files download automatically
- 🌍 **Cross-platform** – Works on Mac, Linux, Windows
- 🔗 **WebRTC** – Browser-to-browser direct connections

---

## 🔧 Tech Stack

### Frontend (Browser)
- **libp2p** – P2P networking in browser
- **@libp2p/webrtc** – Browser-to-browser connections
- **@libp2p/websockets** – Browser-to-Node connections
- **React** – UI framework
- **TypeScript** – Type-safe development
- **Vite** – Fast build tool
- **Tailwind CSS** – Styling

### Backend (CLI)
- **libp2p** – P2P networking (TCP, mplex, Noise)
- **Node.js** – Runtime environment

### Security
- **Noise Protocol** – End-to-end encryption
- **SHA-256** – Cryptographic hash verification

---

## 📋 P2P Protocol

### Protocol ID
`/p2p-send/1.0.0`

### Message Format
1. **Header**: `filename|filesize|sha256hash`
2. **Data**: File content in chunks

### Transports
- **WebRTC**: Browser ↔ Browser
- **WebSockets**: Browser ↔ Node.js
- **TCP**: Node.js ↔ Node.js

### No REST API
This is a true P2P app - no HTTP endpoints for file transfer!

---

## 🐛 Troubleshooting

### Frontend not loading?
```bash
# Check if port 5173 is in use
lsof -i :5173

# Restart frontend
cd frontend
npm run dev
```

### "Failed to initialize P2P"?
- Use a modern browser (Chrome, Firefox, Edge)
- Check browser console for errors
- WebRTC might be blocked by firewall
- Try disabling browser extensions

### Transfer failing?
- Ensure receiver address is copied correctly
- Check that receiver is still active (didn't close the tab)
- Try with a smaller file first (< 10MB)
- Both peers must be on same network or use relay

### Connection timeout?
- Verify both peers can reach each other
- Check firewall settings
- Try using WebSocket transport
- Consider using a relay server for NAT traversal

### "Hash verification failed"?
- File was corrupted during transfer
- Try sending again
- Check network stability

---

## 📁 Project Structure

```
p2pSend/
├── frontend/                 # React Web Application
│   ├── src/
│   │   ├── api/
│   │   │   └── p2pClient.ts # Real libp2p client
│   │   ├── components/      # UI components
│   │   ├── pages/
│   │   │   ├── Landing.tsx  # Home page
│   │   │   ├── Send.tsx     # Sender interface
│   │   │   └── Receive.tsx  # Receiver interface
│   │   └── App.tsx
│   └── package.json
│
├── cli.js                    # CLI interface
├── index.js                  # Standalone receiver
├── sender.js                 # Standalone sender
├── server.js                 # (Legacy - can be deleted)
├── received/                 # Received files directory (CLI only)
├── README.md                 # This file
├── ARCHITECTURE.md           # Architecture explanation
└── MIGRATION.md              # Migration guide
```

---

## 🎬 Demo for Presentation

**Total time: 60 seconds**

1. Show landing page (5s)
2. Start receiver → Copy address (10s)
3. Open sender → Select file (10s)
4. Paste address → Start transfer (5s)
5. Watch real-time progress (20s)
6. Download received file (10s)

**Key talking points:**
- "True peer-to-peer with libp2p in browser"
- "No central server - direct connections"
- "Cryptographic hash verification"
- "WebRTC for browser-to-browser transfer"

---

## 📊 Performance

- **Transfer Speed**: Direct P2P (no server bottleneck)
- **Security**: End-to-end encrypted (Noise protocol)
- **Reliability**: Hash verification (0% corruption)
- **File Size**: No artificial limits (browser memory only)
- **Latency**: Lower than client-server (direct connection)

---

## 🔒 Security

- **Noise Protocol**: XX pattern with ChaCha20-Poly1305
- **SHA-256**: File integrity verification
- **Path Traversal Protection**: Filename sanitization
- **No Data Storage**: Files only stored locally

---

## 📄 License

MIT

---

## 👤 Author

Samar Abdelhameed

---

## 🏗️ Architecture

### True P2P Design

```
┌─────────────┐                    ┌─────────────┐
│  Browser A  │                    │  Browser B  │
│  (Sender)   │                    │ (Receiver)  │
│             │                    │             │
│  libp2p     │◄──────WebRTC──────►│  libp2p     │
│  node       │                    │  node       │
└─────────────┘                    └─────────────┘
      Direct P2P Connection
      No server involved!
```

### What Changed from v1.0?

**Before (Wrong ❌):**
- REST API server for file transfer
- Files uploaded to server via HTTP
- WebSocket for progress updates
- Not actually peer-to-peer

**Now (Correct ✅):**
- Real libp2p in browser
- Direct peer-to-peer connections
- No server needed
- True decentralized architecture

### Key Improvements

| Aspect | v1.0 (Fake P2P) | v2.0 (Real P2P) |
|--------|-----------------|-----------------|
| Architecture | Client-Server | Peer-to-Peer |
| File Transfer | HTTP Upload/Download | Direct P2P |
| Progress Updates | WebSocket | P2P Protocol |
| Server Required | Yes | No |
| Privacy | Server sees files | End-to-end |
| Scalability | Limited | Unlimited |
| Latency | High (2x transfer) | Low (direct) |

---

## 🙏 Acknowledgments

Special thanks to the colleague who provided critical feedback that led to this complete rewrite. Their points were:
1. "P2P is not supposed to have a RESTful API server" ✅ Fixed
2. "If you go with a server, that is not a p2p app" ✅ Fixed
3. "You are using a fake p2pClient" ✅ Fixed
4. "Not really create a libp2p peer in a browser" ✅ Fixed
5. "There are no any libp2p libs in your frontend package.json" ✅ Fixed

Built with:
- [libp2p](https://libp2p.io/) - Modular P2P networking
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

**v2.0.0** – True P2P with libp2p in browser
