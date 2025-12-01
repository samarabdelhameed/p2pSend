import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { mplex } from '@libp2p/mplex';
import { noise } from '@chainsafe/libp2p-noise';
import { multiaddr } from '@multiformats/multiaddr';
import fs from 'node:fs';

const PROTOCOL = '/p2p-send/1.0.0';

// العنوان الحالي للـ receiver
const RECEIVER_ADDR = '/ip4/127.0.0.1/tcp/51694/p2p/12D3KooWQQ3XNY1piGUv8x6m3gaV9Tn8Yd2ZcJKdCMCasZ5woqS6';

(async () => {
  const node = await createLibp2p({
    addresses: { listen: ['/ip4/0.0.0.0/tcp/0'] },
    transports: [tcp()],
    streamMuxers: [mplex()],
    connectionEncryption: [noise()]
  });

  await node.start();
  console.log('Sender node started');
  console.log('Sender Peer ID:', node.peerId.toString());

  // نحول الـ string لـ multiaddr object
  const receiverMultiaddr = multiaddr(RECEIVER_ADDR);

  console.log('Connecting to receiver...');
  // نتصل بالـ receiver
  const connection = await node.dial(receiverMultiaddr);
  console.log('Connected to receiver');

  // نفتح stream على الـ protocol
  console.log('Opening stream...');
  const stream = await node.dialProtocol(receiverMultiaddr, PROTOCOL);

  // نبعت الملف
  const filePath = 'test.txt';
  const fileContent = fs.readFileSync(filePath);
  
  await stream.sink([fileContent]);

  console.log(`✅ Sent ${filePath}`);

  await node.stop();
})();
