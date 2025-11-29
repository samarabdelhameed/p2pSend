import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { mplex } from '@libp2p/mplex';
import { noise } from '@libp2p/noise';
import { kadDHT } from '@libp2p/kad-dht';
import { pipe } from 'it-pipe';
import { toBuffer } from 'it-buffer';
import fs from 'node:fs';
import path from 'node:path';

const PROTOCOL = '/p2p-send/1.0.0';

(async () => {
  const node = await createLibp2p({
    addresses: { listen: ['/ip4/0.0.0.0/tcp/0'] },
    transports: [tcp()],
    streamMuxers: [mplex()],
    connectionEncryption: [noise()],
    dht: kadDHT({ clientMode: true })
  });

  // handler لاستقبال الملفات
  node.handle(PROTOCOL, async ({ stream }) => {
    const now = Date.now();
    const filePath = path.join('received', `${now}.bin`);
    const write = fs.createWriteStream(filePath);

    await pipe(
      stream.source,
      toBuffer,
      async source => {
        for await (const chunk of source) {
          write.write(chunk);
        }
      }
    );

    write.end();
    console.log(`✅ File saved to ${filePath}`);
  });

  await node.start();
  console.log('libp2p node started');
  console.log('Peer ID:', node.peerId.toString());
  console.log('Listen addresses:', node.getMultiaddrs().map(ma => ma.toString()));
})();
