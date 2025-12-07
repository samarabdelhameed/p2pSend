#!/usr/bin/env node
import { Command } from 'commander';
import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { mplex } from '@libp2p/mplex';
import { noise } from '@chainsafe/libp2p-noise';
import { multiaddr } from '@multiformats/multiaddr';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PROTOCOL = '/p2p-send/1.0.0';
const program = new Command();

program
  .name('p2psend')
  .description('P2P file transfer CLI')
  .version('1.0.0');

// receive mode
program
  .command('receive')
  .description('Start receiver daemon')
  .action(async () => {
    const node = await createLibp2p({
      addresses: { listen: ['/ip4/0.0.0.0/tcp/0'] },
      transports: [tcp()],
      streamMuxers: [mplex()],
      connectionEncryption: [noise()]
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
          fileName = path.basename(name);
          fileSize = parseInt(size, 10);
          expectedHash = hash;
          headerDone = true;
          console.log(`📥 Incoming: ${fileName} | ${fileSize} bytes`);
          continue;
        }
        chunks.push(chunk.subarray());
      }

      const hash = crypto.createHash('sha256');
      chunks.forEach(c => hash.update(c));
      const actualHash = hash.digest('hex');

      if (actualHash !== expectedHash) {
        console.error('❌ Hash mismatch');
        return;
      }

      const filePath = path.join(process.cwd(), 'received', fileName);
      const write = fs.createWriteStream(filePath);
      for (const c of chunks) write.write(c);
      write.end();
      console.log(`✅ Saved: ${filePath} | Hash verified`);
    });

    await node.start();
    console.log(`Receiver ready\nPeer ID: ${node.peerId.toString()}`);
    console.log('Addresses:', node.getMultiaddrs().map(ma => ma.toString()));
    process.stdin.resume(); // keep alive
  });

// send mode
program
  .command('send')
  .description('Send a file')
  .argument('<file>', 'file to send')
  .requiredOption('-t, --to <addr>', 'receiver multiaddr')
  .action(async (file, options) => {
    if (!fs.existsSync(file)) {
      console.error(`❌ File not found: ${file}`);
      process.exit(1);
    }

    const node = await createLibp2p({
      addresses: { listen: ['/ip4/0.0.0.0/tcp/0'] },
      transports: [tcp()],
      streamMuxers: [mplex()],
      connectionEncryption: [noise()]
    });

    await node.start();

    const receiverMultiaddr = multiaddr(options.to);
    await node.dial(receiverMultiaddr);
    const stream = await node.dialProtocol(receiverMultiaddr, PROTOCOL);

    const stat = fs.statSync(file);
    const fileName = path.basename(file);
    const fileSize = stat.size;

    const hash = crypto.createHash('sha256');
    const fileContent = fs.readFileSync(file);
    hash.update(fileContent);
    const fileHash = hash.digest('hex');

    const header = Buffer.from(`${fileName}|${fileSize}|${fileHash}`);
    await stream.sink([header, fileContent]);

    console.log(`✅ Sent ${fileName} (${fileSize} bytes)`);

    await node.stop();
    process.exit(0);
  });

program.parse();
