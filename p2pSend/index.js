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

  // handler لاستقبال الملفات
  node.handle(PROTOCOL, async ({ stream }) => {
    console.log('📥 Receiving file...');
    const now = Date.now();
    const filePath = path.join('received', `${now}.bin`);
    const write = fs.createWriteStream(filePath);

    for await (const chunk of stream.source) {
      write.write(chunk.subarray());
    }

    write.end();
    console.log(`✅ File saved to ${filePath}`);
  });

  await node.start();
  console.log('libp2p node started');
  console.log('Peer ID:', node.peerId.toString());
  console.log('Listen addresses:', node.getMultiaddrs().map(ma => ma.toString()));
})();
