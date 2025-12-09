import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { yamux } from '@chainsafe/libp2p-yamux';
import { noise } from '@chainsafe/libp2p-noise';
import { identify } from '@libp2p/identify';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PROTOCOL = '/p2p-send/1.0.0';

(async () => {
  const node = await createLibp2p({
    addresses: { listen: ['/ip4/0.0.0.0/tcp/0'] },
    transports: [tcp()],
    streamMuxers: [yamux()],
    connectionEncrypters: [noise()],
    services: {
      identify: identify()
    }
  });

  node.handle(PROTOCOL, async (stream) => {
    const allData = [];
    
    // Collect all data first
    for await (const chunk of stream) {
      // Convert Uint8ArrayList to Buffer
      const data = chunk.subarray ? chunk.subarray() : (chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk));
      console.log('Received chunk:', data.length, 'bytes');
      allData.push(data);
    }
    
    console.log('Total chunks received:', allData.length);
    
    if (allData.length === 0) {
      console.error('❌ No data received');
      return;
    }
    
    // Parse header from first chunk
    const headerChunk = allData[0];
    const header = new TextDecoder().decode(headerChunk);
    console.log('Header:', header);
    const parts = header.split('|');
    
    if (parts.length !== 3) {
      console.error('❌ Invalid header format:', header);
      return;
    }
    
    const [name, size, hash] = parts;
    const fileName = path.basename(name);
    const fileSize = parseInt(size, 10);
    const expectedHash = hash;
    
    console.log(`📥 Incoming: ${fileName} | ${fileSize} bytes | hash: ${expectedHash}`);
    
    // File data is in remaining chunks
    const chunks = allData.slice(1);

    // حساب الـ hash للملف المستقبل
    const hashCalculator = crypto.createHash('sha256');
    chunks.forEach(c => hashCalculator.update(c));
    const actualHash = hashCalculator.digest('hex');

    if (actualHash !== expectedHash) {
      console.error(`❌ Hash mismatch! expected ${expectedHash}, got ${actualHash}`);
      return;
    }

    const filePath = path.join('received', fileName);
    const write = fs.createWriteStream(filePath);
    for (const c of chunks) write.write(c);
    write.end();
    console.log(`✅ Saved: ${filePath} | Hash verified`);
  });

  await node.start();
  console.log('libp2p node started');
  console.log('Peer ID:', node.peerId.toString());
  console.log('Listen addresses:', node.getMultiaddrs().map(ma => ma.toString()));
})();
