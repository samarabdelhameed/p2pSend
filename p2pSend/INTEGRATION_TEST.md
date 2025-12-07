# 🎯 Integration Test Guide

## ✅ System Status

- ✅ Backend API: `http://localhost:3001`
- ✅ WebSocket: `ws://localhost:3002`
- ✅ Frontend: `http://localhost:5173`

---

## 🧪 Test Scenario: Complete P2P File Transfer

### Step 1: Open Frontend
1. Open browser: `http://localhost:5173`
2. You should see the landing page with "Send files peer-to-peer"

### Step 2: Start Receiver
1. Click **"Receive"** button
2. Wait for receiver to initialize (~2 seconds)
3. You'll see a **multiaddr** like:
   ```
   /ip4/127.0.0.1/tcp/xxxxx/p2p/12D3KooW...
   ```
4. Click **"Copy"** to copy the address
5. Keep this tab open!

### Step 3: Open Sender (New Tab)
1. Open new tab: `http://localhost:5173`
2. Click **"Send File"** button
3. **Drag & drop** a file OR click **"Browse Files"**
4. Select any file (PDF, image, zip, etc.)

### Step 4: Enter Receiver Address
1. After selecting file, you'll see Step 2
2. **Paste** the receiver address you copied earlier
3. Click **"Start Transfer"**

### Step 5: Watch the Magic! ✨
1. **Sender tab**: Progress bar shows 0% → 100%
2. **Receiver tab**: Automatically switches to "Receiving" with progress
3. Both tabs show real-time progress
4. When complete:
   - Sender: "File sent successfully!"
   - Receiver: "Transfer Complete!" with download button

### Step 6: Verify File
1. Check `p2pSend/received/` folder
2. Your file should be there with original name
3. Hash verified automatically!

---

## 🎬 Demo Flow for Judges

### Opening Statement:
> "I'll demonstrate a fully functional peer-to-peer file transfer system with real-time progress tracking and cryptographic verification."

### Live Demo:
1. **Show Landing Page** (5 sec)
   - "Clean, modern UI built with React + TypeScript"
   
2. **Start Receiver** (10 sec)
   - "Click Receive → System generates unique P2P address"
   - "Copy this address to share with sender"
   
3. **Open Sender** (15 sec)
   - "New tab → Click Send → Select file"
   - "Paste receiver address → Start Transfer"
   
4. **Show Real-time Transfer** (20 sec)
   - "Watch both screens update simultaneously"
   - "WebSocket provides real-time progress"
   - "No servers storing files - direct P2P"
   
5. **Verify Completion** (10 sec)
   - "File received with original name"
   - "SHA-256 hash verified automatically"
   - "Show file in received/ folder"

### Technical Highlights:
- ✅ **libp2p** - Industry-standard P2P networking
- ✅ **Noise Protocol** - End-to-end encryption
- ✅ **SHA-256** - Cryptographic integrity verification
- ✅ **WebSocket** - Real-time bidirectional communication
- ✅ **React + TypeScript** - Modern, type-safe frontend
- ✅ **Express** - RESTful API backend

---

## 🐛 Troubleshooting

### Receiver not starting?
```bash
# Check backend logs
cd p2pSend
npm run server
```

### Frontend not loading?
```bash
# Check frontend
cd p2pSend/frontend
npm run dev
```

### Transfer failing?
- Make sure receiver address is copied correctly
- Check both backend and frontend are running
- Look at browser console for errors

---

## 📊 Expected Results

### Console Logs (Backend):
```
🚀 Backend API running on http://localhost:3001
🔌 WebSocket server running on ws://localhost:3002
Client connected
📥 Incoming: document.pdf | 1024 bytes
✅ Saved: .../received/document.pdf | Hash verified
```

### Browser Console:
```
WebSocket connected
Receiver started: 12D3KooW...
File sent successfully
```

### File System:
```
p2pSend/received/
├── document.pdf  ← Your transferred file!
└── .gitkeep
```

---

## 🎯 Success Criteria

- [x] Frontend loads without errors
- [x] Receiver generates valid multiaddr
- [x] File selection works (drag & drop + browse)
- [x] Transfer shows real-time progress
- [x] File arrives with correct name and size
- [x] Hash verification passes
- [x] UI updates smoothly on both sides

---

## 🚀 Next Steps

1. Test with different file types (PDF, images, videos)
2. Test with larger files (10MB+)
3. Test on different networks (LAN)
4. Show multiple simultaneous transfers

---

**Ready to impress the judges! 🎉**
