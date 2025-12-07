# 🚀 Quick Start Guide

## Start Everything in 3 Commands

### Terminal 1: Start Backend
```bash
cd p2pSend
npm run server
```
✅ Backend running on `http://localhost:3001`

### Terminal 2: Start Frontend
```bash
cd p2pSend/frontend
npm run dev
```
✅ Frontend running on `http://localhost:5173`

### Terminal 3: Open Browser
```bash
open http://localhost:5173
```

---

## 📱 Using the Web Interface

### Receiver Side:
1. Click **"Receive"**
2. Copy the address shown
3. Share it with sender
4. Wait for file

### Sender Side:
1. Click **"Send File"**
2. Select/drop your file
3. Paste receiver address
4. Click **"Start Transfer"**
5. Watch progress!

---

## 🎯 Test with CLI (Alternative)

### Terminal 1: Start Receiver
```bash
p2psend receive
```

### Terminal 2: Send File
```bash
p2psend send myfile.pdf --to <address-from-receiver>
```

---

## ✅ What's Working

- ✅ Real P2P file transfer (no central server)
- ✅ SHA-256 hash verification
- ✅ Real-time progress updates
- ✅ Original filename preservation
- ✅ Encrypted connections (Noise protocol)
- ✅ Web UI + CLI interface
- ✅ Cross-platform (Mac, Linux, Windows)

---

## 🎬 Demo for Judges

**Total time: 60 seconds**

1. **Show landing page** (5s)
2. **Start receiver** → Copy address (10s)
3. **Open sender** → Select file (10s)
4. **Paste address** → Start transfer (5s)
5. **Watch real-time progress** (20s)
6. **Show received file** (10s)

**Key talking points:**
- "Direct peer-to-peer, no servers"
- "Real-time WebSocket updates"
- "Cryptographic hash verification"
- "Production-ready libp2p stack"

---

## 📊 Architecture

```
┌─────────────┐         ┌─────────────┐
│   Browser   │◄───────►│   Browser   │
│  (Sender)   │         │ (Receiver)  │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │  HTTP/WS              │  HTTP/WS
       │                       │
       └───────┬───────────────┘
               │
        ┌──────▼──────┐
        │   Backend   │
        │  (Node.js)  │
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │   libp2p    │
        │  P2P Layer  │
        └─────────────┘
```

---

## 🔥 Impressive Features

1. **Real-time Updates**: WebSocket shows live progress
2. **Hash Verification**: SHA-256 ensures integrity
3. **Modern Stack**: React + TypeScript + libp2p
4. **Dual Interface**: Web UI + CLI
5. **Production Ready**: Error handling, validation, security

---

**You're ready to demo! 🎉**
