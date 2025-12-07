# p2pSend – CLI P2P File Transfer

Send any file directly to another peer **without servers** – SHA-256 verified.

## 🚀 Install

```bash
git clone https://github.com/samarabdelhameed/p2pSend.git
cd p2pSend/p2pSend
npm install
npm link
```

## 📦 Usage

### Start Receiver
```bash
p2psend receive
```

Output:
```
Receiver ready
Peer ID: 12D3KooW...
Addresses: [
  '/ip4/127.0.0.1/tcp/50322/p2p/12D3KooW...',
  '/ip4/192.168.1.x/tcp/50322/p2p/12D3KooW...'
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

**Receiver shows:**
```
📥 Incoming: document.pdf | 1024 bytes
✅ Saved: /path/to/received/document.pdf | Hash verified
```

## ✨ Features

- ✅ **No servers** – Direct P2P transfer using libp2p
- ✅ **SHA-256 verification** – Automatic integrity check
- ✅ **Original filename** – Files saved with correct names
- ✅ **CLI interface** – Easy to use from command line
- ✅ **Encrypted** – Noise protocol encryption
- ✅ **Cross-platform** – Works on any OS with Node.js

## 🔧 Built With

- **libp2p** – Modular P2P networking stack
- **Commander** – CLI framework
- **Noise Protocol** – Encrypted connections
- **SHA-256** – File integrity verification

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
