/**
 * ⚠️ LEGACY FILE - NO LONGER NEEDED ⚠️
 * 
 * This file is from the old client-server architecture.
 * The application now uses TRUE peer-to-peer with libp2p in the browser.
 * 
 * This file can be safely deleted.
 * 
 * See ARCHITECTURE.md and MIGRATION.md for details.
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { mplex } from '@libp2p/mplex';
import { noise } from '@chainsafe/libp2p-noise';
import { multiaddr } from '@multiformats/multiaddr';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import cors from 'cors';

const PROTOCOL = '/p2p-send/1.0.0';
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '100mb' })); // Increase payload limit
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Store active libp2p nodes
let receiverNode = null;
let senderNode = null;

// WebSocket server for real-time updates
const wss = new WebSocketServer({ port: 3002 });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Client connected');

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

function broadcast(data) {
  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}

// Start receiver
app.post('/api/receiver/start', async (req, res) => {
  try {
    if (receiverNode) {
      return res.json({
        peerId: receiverNode.peerId.toString(),
        addresses: receiverNode.getMultiaddrs().map(ma => ma.toString())
      });
    }

    receiverNode = await createLibp2p({
      addresses: { listen: ['/ip4/0.0.0.0/tcp/0'] },
      transports: [tcp()],
      streamMuxers: [mplex()],
      connectionEncryption: [noise()]
    });

    receiverNode.handle(PROTOCOL, async ({ stream }) => {
      let fileName = '';
      let fileSize = 0;
      let expectedHash = '';
      let headerDone = false;
      const chunks = [];

      broadcast({ type: 'receiving', status: 'started' });

      for await (const chunk of stream.source) {
        if (!headerDone) {
          const header = chunk.subarray().toString();
          const [name, size, hash] = header.split('|');
          fileName = path.basename(name);
          fileSize = parseInt(size, 10);
          expectedHash = hash;
          headerDone = true;

          broadcast({
            type: 'receiving',
            status: 'metadata',
            fileName,
            fileSize
          });
          continue;
        }
        chunks.push(chunk.subarray());

        const received = chunks.reduce((sum, c) => sum + c.length, 0);
        const progress = Math.round((received / fileSize) * 100);
        
        broadcast({
          type: 'receiving',
          status: 'progress',
          progress,
          received,
          total: fileSize
        });
      }

      const hash = crypto.createHash('sha256');
      chunks.forEach(c => hash.update(c));
      const actualHash = hash.digest('hex');

      if (actualHash !== expectedHash) {
        broadcast({ type: 'receiving', status: 'error', message: 'Hash mismatch' });
        return;
      }

      const filePath = path.join(process.cwd(), 'received', fileName);
      const write = fs.createWriteStream(filePath);
      for (const c of chunks) write.write(c);
      write.end();

      broadcast({
        type: 'receiving',
        status: 'complete',
        fileName,
        fileSize,
        filePath,
        hash: actualHash
      });
    });

    await receiverNode.start();

    const response = {
      peerId: receiverNode.peerId.toString(),
      addresses: receiverNode.getMultiaddrs().map(ma => ma.toString())
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send file
app.post('/api/sender/send', async (req, res) => {
  try {
    const { fileName, fileData, receiverAddr } = req.body;

    console.log('📤 Send request:', { fileName, receiverAddr, dataSize: fileData?.length });

    if (!fileName || !fileData || !receiverAddr) {
      console.error('❌ Missing fields:', { fileName: !!fileName, fileData: !!fileData, receiverAddr: !!receiverAddr });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    senderNode = await createLibp2p({
      addresses: { listen: ['/ip4/0.0.0.0/tcp/0'] },
      transports: [tcp()],
      streamMuxers: [mplex()],
      connectionEncryption: [noise()]
    });

    await senderNode.start();

    const receiverMultiaddr = multiaddr(receiverAddr);
    await senderNode.dial(receiverMultiaddr);
    const stream = await senderNode.dialProtocol(receiverMultiaddr, PROTOCOL);

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(fileData, 'base64');
    const fileSize = fileBuffer.length;

    const hash = crypto.createHash('sha256');
    hash.update(fileBuffer);
    const fileHash = hash.digest('hex');

    const header = Buffer.from(`${fileName}|${fileSize}|${fileHash}`);

    broadcast({
      type: 'sending',
      status: 'started',
      fileName,
      fileSize
    });

    // Send in chunks to show progress
    const chunkSize = 64 * 1024; // 64KB chunks
    const chunks = [header];
    
    for (let i = 0; i < fileBuffer.length; i += chunkSize) {
      const chunk = fileBuffer.slice(i, i + chunkSize);
      chunks.push(chunk);
      
      const progress = Math.round(((i + chunk.length) / fileBuffer.length) * 100);
      broadcast({
        type: 'sending',
        status: 'progress',
        progress
      });
    }

    await stream.sink(chunks);

    broadcast({
      type: 'sending',
      status: 'complete',
      fileName,
      fileSize,
      hash: fileHash
    });

    await senderNode.stop();
    senderNode = null;

    res.json({
      success: true,
      fileName,
      fileSize,
      hash: fileHash
    });
  } catch (error) {
    console.error('❌ Send error:', error);
    broadcast({ type: 'sending', status: 'error', message: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Stop receiver
app.post('/api/receiver/stop', async (req, res) => {
  try {
    if (receiverNode) {
      await receiverNode.stop();
      receiverNode = null;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download file
app.get('/api/download/:filename', (req, res) => {
  try {
    const filename = path.basename(req.params.filename); // Security: prevent path traversal
    const filePath = path.join(process.cwd(), 'received', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.download(filePath, filename);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    receiver: receiverNode ? 'running' : 'stopped',
    sender: senderNode ? 'running' : 'stopped'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend API running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server running on ws://localhost:3002`);
});
