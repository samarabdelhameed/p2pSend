# p2pSend – P2P File Transfer

Send any file directly to another peer **without servers** – SHA-256 verified.

🌐 **Web Interface** + 💻 **CLI** + 🔐 **Encrypted** + ⚡ **Real-time**

## 🚀 Quick Start

### Install Dependencies
```bash
git clone https://github.com/samarabdelhameed/p2pSend.git
cd p2pSend/p2pSend
npm install
npm link  # For CLI

cd frontend
npm install
```

### Start Backend
```bash
npm run server
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Open Browser
```
http://localhost:5173
```

## 📦 Usage

### Option 1: Web Interface (Recommended)

**Receiver:**
1. Open `http://localhost:5173`
2. Click **"Receive"**
3. Copy the address shown
4. Share with sender

**Sender:**
1. Open `http://localhost:5173` (new tab)
2. Click **"Send File"**
3. Select/drop file
4. Paste receiver address
5. Click **"Start Transfer"**

### Option 2: CLI

**Receiver:**
```bash
p2psend receive
```

**Sender:**
```bash
p2psend send document.pdf --to /ip4/127.0.0.1/tcp/xxxxx/p2p/12D3KooW...
```

## ✨ Features

- 🌐 **Web Interface** – Modern React UI with real-time updates
- 💻 **CLI Interface** – Command-line for power users
- 🔐 **Encrypted** – Noise protocol end-to-end encryption
- ✅ **SHA-256 Verification** – Automatic integrity check
- ⚡ **Real-time Progress** – WebSocket live updates
- 📁 **Original Filename** – Files saved with correct names
- 🚀 **No Servers** – Direct P2P transfer using libp2p
- 🌍 **Cross-platform** – Works on Mac, Linux, Windows

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

## 📋 CLI Commands

```bash
p2psend --help              # Show help
p2psend receive             # Start receiver daemon
p2psend send <file> --to <addr>  # Send file to peer
```

## 🛠️ Development

```bash
# Run receiver directly
node index.js

# Run sender (edit RECEIVER_ADDR first)
node sender.js
```

## 📄 License

MIT

## 👤 Author

Samar Abdelhameed

---

**v1.0.0** – Production-ready P2P file transfer CLI
