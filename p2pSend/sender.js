import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { mplex } from '@libp2p/mplex';
import { noise } from '@chainsafe/libp2p-noise';
import { multiaddr } from '@multiformats/multiaddr';
import fs from 'node:fs';
import path from 'node:path';

const PROTOCOL = '/p2p-send/1.0.0';

// العنوان الحالي للـ receiver
const RECEIVER_ADDR = '/ip4/127.0.0.1/tcp/57482/p2p/12D3KooWLwDcwDSpyEpgCBZbF85Q3BuLUoTUw6TcvK4GPukGJoPW';

(async () => {
  const node = await createLibp2p({
    addresses: { listen: ['/ip4/0.0.0.0/tcp/0'] },
    transports: [tcp()],
    streamMuxers: [mplex()],
    connectionEncryption: [noise()]
  });

  await node.start();
  console.log('Sender node started');

  const receiverMultiaddr = multiaddr(RECEIVER_ADDR);

  await node.dial(receiverMultiaddr);
  const stream = await node.dialProtocol(receiverMultiaddr, PROTOCOL);

  const filePath = 'test.txt';
  const stat = fs.statSync(filePath);
  const fileName = path.basename(filePath);
  const fileSize = stat.size;

  // header: name|size
  const header = Buffer.from(`${fileName}|${fileSize}`);
  const fileContent = fs.readFileSync(filePath);

  await stream.sink([header, fileContent]);

  console.log(`✅ Sent ${fileName} (${fileSize} bytes)`);

  await node.stop();
})();
