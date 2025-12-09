#!/usr/bin/env node
import { Command } from 'commander';
import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { webSockets } from '@libp2p/websockets';
import { yamux } from '@chainsafe/libp2p-yamux';
import { noise } from '@chainsafe/libp2p-noise';
import { identify } from '@libp2p/identify';
import { multiaddr } from '@multiformats/multiaddr';
import { Uint8ArrayList } from 'uint8arraylist';
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
      addresses: { 
        listen: [
          '/ip4/0.0.0.0/tcp/0',
          '/ip4/0.0.0.0/tcp/0/ws'
        ] 
      },
      transports: [tcp(), webSockets()],
      streamMuxers: [yamux()],
      connectionEncrypters: [noise()],
      services: {
        identify: identify()
      }
    });

    node.handle(PROTOCOL, async (stream) => {
      const allData = [];
      
      // Collect all data first
      for await (const chunk of stream) {
        const data = chunk.subarray ? chunk.subarray() : (chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk));
        allData.push(data);
      }
      
      if (allData.length === 0) {
        console.error('❌ No data received');
        return;
      }
      
      // Parse header from first chunk
      const headerChunk = allData[0];
      const header = new TextDecoder().decode(headerChunk);
      const parts = header.split('|');
      
      if (parts.length !== 3) {
        console.error('❌ Invalid header format:', header);
        return;
      }
      
      const [name, size, hash] = parts;
      const fileName = path.basename(name);
      const fileSize = parseInt(size, 10);
      const expectedHash = hash;
      
      console.log(`📥 Incoming: ${fileName} | ${fileSize} bytes`);
      
      // File data is in remaining chunks
      const chunks = allData.slice(1);

      // Calculate hash
      const hashCalculator = crypto.createHash('sha256');
      chunks.forEach(c => hashCalculator.update(c));
      const actualHash = hashCalculator.digest('hex');

      if (actualHash !== expectedHash) {
        console.error(`❌ Hash mismatch! expected ${expectedHash}, got ${actualHash}`);
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
      addresses: { 
        listen: [
          '/ip4/0.0.0.0/tcp/0',
          '/ip4/0.0.0.0/tcp/0/ws'
        ] 
      },
      transports: [tcp(), webSockets()],
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

    const header = Buffer.from(`${fileName}|${fileSize}|${fileHash}`);
    
    // Send data using sendData method with Uint8ArrayList
    const headerList = new Uint8ArrayList(new Uint8Array(header));
    const contentList = new Uint8ArrayList(new Uint8Array(fileContent));
    
    stream.sendData(headerList);
    stream.sendData(contentList);
    stream.sendCloseWrite();

    console.log(`✅ Sent ${fileName} (${fileSize} bytes)`);

    await node.stop();
    process.exit(0);
  });

program.parse();
