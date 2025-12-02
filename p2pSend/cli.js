#!/usr/bin/env node
import inquirer from 'inquirer';
import { spawn } from 'node:child_process';
import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { mplex } from '@libp2p/mplex';
import { noise } from '@chainsafe/libp2p-noise';
import { multiaddr } from '@multiformats/multiaddr';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PROTOCOL = '/p2p-send/1.0.0';

console.log('🚀 p2pSend CLI – Easy P2P File Transfer\n');

const answers = await inquirer.prompt([
  {
    type: 'list',
    name: 'role',
    message: 'What do you want to do?',
    choices: ['Receive a file', 'Send a file']
  }
]);

if (answers.role === 'Receive a file') {
  console.log('Starting receiver...\n');
  
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
        console.log(`\n📥 Incoming: ${fileName} | ${fileSize} bytes`);
        continue;
      }
      chunks.push(chunk.subarray());
    }

    const hash = crypto.createHash('sha256');
    chunks.forEach(c => hash.update(c));
    const actualHash = hash.digest('hex');

    if (actualHash !== expectedHash) {
      console.error(`❌ Hash mismatch!`);
      return;
    }

    const filePath = path.join('received', fileName);
    const write = fs.createWriteStream(filePath);
    for (const c of chunks) write.write(c);
    write.end();
    console.log(`✅ Saved: ${filePath} | Hash verified\n`);
  });

  await node.start();
  const addresses = node.getMultiaddrs();
  
  console.log('📋 Your receiver address (share this with sender):\n');
  addresses.forEach(addr => console.log(`   ${addr.toString()}`));
  console.log('\n⏳ Waiting for files... (Press Ctrl+C to stop)\n');

} else {
  const { filePath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'filePath',
      message: 'Enter file path (or drag file here):',
      validate: (input) => {
        const cleanPath = input.replace(/^['"]|['"]$/g, '').trim();
        return fs.existsSync(cleanPath) ? true : 'File not found!';
      }
    }
  ]);

  const { receiverAddr } = await inquirer.prompt([
    {
      type: 'input',
      name: 'receiverAddr',
      message: 'Paste receiver address:'
    }
  ]);

  const cleanPath = filePath.replace(/^['"]|['"]$/g, '').trim();
  
  console.log('\n📤 Sending file...\n');

  const node = await createLibp2p({
    addresses: { listen: ['/ip4/0.0.0.0/tcp/0'] },
    transports: [tcp()],
    streamMuxers: [mplex()],
    connectionEncryption: [noise()]
  });

  await node.start();

  const receiverMultiaddr = multiaddr(receiverAddr.trim());
  await node.dial(receiverMultiaddr);
  const stream = await node.dialProtocol(receiverMultiaddr, PROTOCOL);

  const stat = fs.statSync(cleanPath);
  const fileName = path.basename(cleanPath);
  const fileSize = stat.size;

  const hash = crypto.createHash('sha256');
  const fileContent = fs.readFileSync(cleanPath);
  hash.update(fileContent);
  const fileHash = hash.digest('hex');

  const header = Buffer.from(`${fileName}|${fileSize}|${fileHash}`);
  await stream.sink([header, fileContent]);

  console.log(`✅ Sent ${fileName} (${fileSize} bytes) | hash: ${fileHash}\n`);

  await node.stop();
  process.exit(0);
}
