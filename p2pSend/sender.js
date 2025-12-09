import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { yamux } from '@chainsafe/libp2p-yamux';
import { noise } from '@chainsafe/libp2p-noise';
import { identify } from '@libp2p/identify';
import { multiaddr } from '@multiformats/multiaddr';
import { pipe } from 'it-pipe';
import * as lp from 'it-length-prefixed';
import { Uint8ArrayList } from 'uint8arraylist';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PROTOCOL = '/p2p-send/1.0.0';

// العنوان الحالي للـ receiver
const RECEIVER_ADDR = '/ip4/127.0.0.1/tcp/57750/p2p/12D3KooWLTNrn7mqcYjZDBZrsRxccwZZgrZdJbLvgwnRCHVVzpKz';

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

  const filePath = 'test-large.txt';
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

  console.log('Sending header:', header.toString());
  console.log('Sending file content:', fileContent.length, 'bytes');
  
  // Send data using sendData method with Uint8ArrayList
  const headerList = new Uint8ArrayList(new Uint8Array(header));
  const contentList = new Uint8ArrayList(new Uint8Array(fileContent));
  
  stream.sendData(headerList);
  stream.sendData(contentList);
  stream.sendCloseWrite();

  console.log(`✅ Sent ${fileName} (${fileSize} bytes) | hash: ${fileHash}`);

  await node.stop();
})();
