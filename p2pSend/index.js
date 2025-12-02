import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { mplex } from '@libp2p/mplex';
import { noise } from '@chainsafe/libp2p-noise';
import fs from 'node:fs';
import path from 'node:path';

const PROTOCOL = '/p2p-send/1.0.0';

(async () => {
  const node = await createLibp2p({
    addresses: { listen: ['/ip4/0.0.0.0/tcp/0'] },
    transports: [tcp()],
    streamMuxers: [mplex()],
    connectionEncryption: [noise()]
  });

  node.handle(PROTOCOL, async ({ stream }) => {
    let fileName = '';
    let fileSize = 0;
    let headerDone = false;
    const chunks = [];

    for await (const chunk of stream.source) {
      if (!headerDone) {
        const header = chunk.subarray().toString();
        const [name, size] = header.split('|');
        fileName = path.basename(name); // منعًا للـ path traversal
        fileSize = parseInt(size, 10);
        headerDone = true;
        console.log(`📥 Incoming: ${fileName} (${fileSize} bytes)`);
        continue;
      }
      chunks.push(chunk.subarray());
    }

    const totalSize = chunks.reduce((sum, c) => sum + c.length, 0);
    if (totalSize !== fileSize) {
      console.warn(`⚠️  Size mismatch: expected ${fileSize}, got ${totalSize}`);
    }

    const filePath = path.join('received', fileName);
    const write = fs.createWriteStream(filePath);
    for (const c of chunks) write.write(c);
    write.end();
    console.log(`✅ Saved: ${filePath}`);
  });

  await node.start();
  console.log('libp2p node started');
  console.log('Peer ID:', node.peerId.toString());
  console.log('Listen addresses:', node.getMultiaddrs().map(ma => ma.toString()));
})();
