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

  node.handle(PROTOCOL, async ({ stream }) => {
    let fileName = '';
    let fileSize = 0;
    let expectedHash = '';
    let headerDone = false;
    const chunks = [];

    for await (const chunk of stream.source) {
      if (!headerDone) {
        const header = chunk.subarray().toString();
        const [name, size, hash] = header.split('|');
        fileName = path.basename(name); // منعًا للـ path traversal
        fileSize = parseInt(size, 10);
        expectedHash = hash;
        headerDone = true;
        console.log(`📥 Incoming: ${fileName} | ${fileSize} bytes`);
        continue;
      }
      chunks.push(chunk.subarray());
    }

    // حساب الـ hash للملف المستقبل
    const hash = crypto.createHash('sha256');
    chunks.forEach(c => hash.update(c));
    const actualHash = hash.digest('hex');

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
