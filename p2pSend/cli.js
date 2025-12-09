#!/usr/bin/env node
import { Command } from 'commander';
import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { yamux } from '@chainsafe/libp2p-yamux';
import { noise } from '@chainsafe/libp2p-noise';
import { identify } from '@libp2p/identify';
import { multiaddr } from '@multiformats/multiaddr';
import { pipe } from 'it-pipe';
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
      streamMuxers: [yamux()],
      connectionEncrypters: [noise()],
      services: {
        identify: identify()
      }
    });

    node.handle(PROTOCOL, async (stream) => {
      const chunks = [];
      
      // Read all data from stream
      for await (const chunk of stream) {
        chunks.push(chunk.subarray());
      }
      
      // Combine all chunks
      const allData = Buffer.concat(chunks);
      
      // Find newline separator between header and file content
      const newlineIndex = allData.indexOf('\n');
      if (newlineIndex === -1) {
        console.error('❌ Invalid data format');
        return;
      }
      
      // Parse header
      const headerStr = allData.subarray(0, newlineIndex).toString();
      const [name, size, hash] = headerStr.split('|');
      const fileName = path.basename(name);
      const fileSize = parseInt(size, 10);
      const expectedHash = hash;
      
      console.log(`📥 Incoming: ${fileName} | ${fileSize} bytes`);
      
      // Extract file content (after newline)
      const fileContent = allData.subarray(newlineIndex + 1);
      
      // Calculate hash
      const actualHash = crypto.createHash('sha256').update(fileContent).digest('hex');

      if (actualHash !== expectedHash) {
        console.error(`❌ Hash mismatch: expected ${expectedHash}, got ${actualHash}`);
        return;
      }

      const filePath = path.join(process.cwd(), 'received', fileName);
      fs.writeFileSync(filePath, fileContent);
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
      streamMuxers: [yamux()],
      connectionEncrypters: [noise()],
      services: {
        identify: identify()
      }
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

    const header = `${fileName}|${fileSize}|${fileHash}\n`;
    const headerBuffer = Buffer.from(header);
    
    // Send data using pipe with async generator as source
    await pipe(
      (async function* () {
        yield headerBuffer;
        yield fileContent;
      })(),
      async (source) => {
        for await (const chunk of source) {
          await stream.sendFrame(chunk);
        }
      }
    );
    
    await stream.close();

    console.log(`✅ Sent ${fileName} (${fileSize} bytes)`);

    await node.stop();
    process.exit(0);
  });

program.parse();
