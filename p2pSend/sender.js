import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { yamux } from '@chainsafe/libp2p-yamux';
import { noise } from '@chainsafe/libp2p-noise';
import { identify } from '@libp2p/identify';
import { multiaddr } from '@multiformats/multiaddr';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PROTOCOL = '/p2p-send/1.0.0';

// العنوان الحالي للـ receiver
const RECEIVER_ADDR = '/ip4/127.0.0.1/tcp/51281/p2p/12D3KooWT3Lu8zNFUHKd5QSLq6Dk5FPuY1KPQxbQPG64EntM48sW';

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

  await node.start();
  console.log('Sender node started');

  const receiverMultiaddr = multiaddr(RECEIVER_ADDR);

  await node.dial(receiverMultiaddr);
  const stream = await node.dialProtocol(receiverMultiaddr, PROTOCOL);

  const filePath = 'test-file.txt';
  const stat = fs.statSync(filePath);
  const fileName = path.basename(filePath);
  const fileSize = stat.size;

  // حساب الـ hash
  const hash = crypto.createHash('sha256');
  const fileContent = fs.readFileSync(filePath);
  hash.update(fileContent);
  const fileHash = hash.digest('hex');

  // header: name|size|hash
  const header = Buffer.from(`${fileName}|${fileSize}|${fileHash}`);

  await stream.sink([header, fileContent]);

  console.log(`✅ Sent ${fileName} (${fileSize} bytes) | hash: ${fileHash}`);

  await node.stop();
})();
