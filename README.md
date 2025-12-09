# p2pSend – P2P File Transfer

Send files directly peer-to-peer with **SHA-256 verification** and **end-to-end encryption**.

🌐 **Web Interface** + 💻 **CLI** + 🔐 **Encrypted** + ⚡ **Real-time**

## 🌐 Live Demo

**Frontend:** [https://p2psend.surge.sh](https://p2psend.surge.sh)

> **Note:** For full functionality, the backend server needs to run locally. See [Running the Application](#-running-the-application) below.

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

# Install backend dependencies
npm install

# Install CLI globally (optional)
npm link

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## 🎯 Running the Application

### Option 1: Web Interface (Recommended)

#### Step 1: Start Backend Server
```bash
# In terminal 1 - from p2pSend directory
npm run server
```

You should see:
```
🚀 Backend API running on http://localhost:3001
🔌 WebSocket server running on ws://localhost:3002
```

#### Step 2: Start Frontend
```bash
# In terminal 2 - from p2pSend directory
cd frontend
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

#### Step 3: Open Browser
Open your browser and navigate to:
```
http://localhost:5173
```

---

## 📱 Using the Web Interface

### Receiver Side:
1. Click **"Receive"** button
2. Wait for initialization (~2 seconds)
3. Copy the multiaddr shown (e.g., `/ip4/127.0.0.1/tcp/xxxxx/p2p/12D3KooW...`)
4. Share this address with the sender
5. Keep the tab open and wait for incoming files

### Sender Side:
1. Open a new browser tab: `http://localhost:5173`
2. Click **"Send File"** button
3. Select or drag & drop your file
4. Paste the receiver's address
5. Click **"Start Transfer"**
6. Watch the real-time progress!

### Download Received File:
1. After transfer completes, click **"Download File"**
2. File will be downloaded to your Downloads folder
3. File is also saved in `received/` directory

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
- ⚡ **Real-time Progress** – WebSocket live updates
- 📁 **Original Filename** – Files saved with correct names
- 🚀 **No Servers** – Direct P2P transfer using libp2p
- 📥 **Download Support** – Download received files directly
- 🌍 **Cross-platform** – Works on Mac, Linux, Windows

---

## 🔧 Tech Stack

### Backend
- **libp2p** – P2P networking (TCP, mplex, Noise)
- **Express** – REST API server
- **WebSocket** – Real-time bidirectional communication
- **Node.js** – Runtime environment

### Frontend
- **React** – UI framework
- **TypeScript** – Type-safe development
- **Vite** – Fast build tool
- **Tailwind CSS** – Styling

### Security
- **Noise Protocol** – End-to-end encryption
- **SHA-256** – Cryptographic hash verification

---

## 📋 API Endpoints

### Backend API (http://localhost:3001)

- `POST /api/receiver/start` - Start receiver node
- `POST /api/receiver/stop` - Stop receiver node
- `POST /api/sender/send` - Send file to peer
- `GET /api/download/:filename` - Download received file
- `GET /api/health` - Health check

### WebSocket (ws://localhost:3002)

Real-time events:
- `receiving` - File receiving progress
- `sending` - File sending progress

---

## 🐛 Troubleshooting

### Backend not starting?
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill the process if needed
kill -9 <PID>

# Restart backend
npm run server
```

### Frontend not loading?
```bash
# Check if port 5173 is in use
lsof -i :5173

# Restart frontend
cd frontend
npm run dev
```

### Transfer failing?
- Make sure both backend and frontend are running
- Ensure receiver address is copied correctly (entire multiaddr)
- Check that receiver is still active (didn't close the tab)
- Try with a smaller file first (< 10MB)

### "Failed to send file" error?
- Refresh both sender and receiver pages
- Start a new receiver session
- Copy the new address and try again

---

## 📁 Project Structure

```
p2pSend/
├── frontend/                 # React Web Application
│   ├── src/
│   │   ├── api/
│   │   │   └── p2pClient.ts # API client
│   │   ├── components/      # UI components
│   │   ├── pages/
│   │   │   ├── Landing.tsx  # Home page
│   │   │   ├── Send.tsx     # Sender interface
│   │   │   └── Receive.tsx  # Receiver interface
│   │   └── App.tsx
│   └── package.json
│
├── server.js                 # Express + WebSocket backend
├── cli.js                    # CLI interface
├── index.js                  # Standalone receiver
├── sender.js                 # Standalone sender
├── received/                 # Received files directory
└── README.md                 # This file
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
- "Direct peer-to-peer, no servers"
- "Real-time WebSocket updates"
- "Cryptographic hash verification"
- "Production-ready libp2p stack"

---

## 📊 Performance

- **Transfer Speed**: Direct P2P (no server bottleneck)
- **Security**: End-to-end encrypted (Noise protocol)
- **Reliability**: Hash verification (0% corruption)
- **File Size**: Supports up to 100MB (configurable)

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

## 🙏 Acknowledgments

Built with:
- [libp2p](https://libp2p.io/) - Modular P2P networking
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

**v1.0.0** – Production-ready P2P file transfer system
