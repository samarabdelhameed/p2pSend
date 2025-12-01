import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { mplex } from '@libp2p/mplex';
import { noise } from '@chainsafe/libp2p-noise';
import fs from 'node:fs';
import path from 'node:path';

const PROTOCOL = '/p2p-send/1.0.0';

// Create receiver
const receiver = await createLibp2p({
  addresses: { listen: ['/ip4/127.0.0.1/tcp/0'] },
  transports: [tcp()],
  streamMuxers: [mplex()],
  connectionEncryption: [noise()]
});

receiver.handle(PROTOCOL, async ({ stream }) => {
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

await receiver.start();
console.log('Receiver started');
console.log('Peer ID:', receiver.peerId.toString());
const receiverAddr = receiver.getMultiaddrs()[0];
console.log('Address:', receiverAddr.toString());

// Create sender
const sender = await createLibp2p({
  addresses: { listen: ['/ip4/127.0.0.1/tcp/0'] },
  transports: [tcp()],
  streamMuxers: [mplex()],
  connectionEncryption: [noise()]
});

await sender.start();
console.log('\nSender started');
console.log('Sender Peer ID:', sender.peerId.toString());

// Wait a bit
await new Promise(resolve => setTimeout(resolve, 1000));

// Send file
console.log('\n📤 Sending file...');
const stream = await sender.dialProtocol(receiverAddr, PROTOCOL);

const fileContent = fs.readFileSync('test.txt');
await stream.sink([fileContent]);

console.log('✅ File sent!');

// Cleanup
await new Promise(resolve => setTimeout(resolve, 2000));
await sender.stop();
await receiver.stop();
console.log('\n✅ Test complete!');
