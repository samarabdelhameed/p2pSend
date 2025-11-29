import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { mplex } from '@libp2p/mplex';
import { noise } from '@libp2p/noise';
import { kadDHT } from '@libp2p/kad-dht';

(async () => {
  const node = await createLibp2p({
    addresses: { listen: ['/ip4/0.0.0.0/tcp/0'] },
    transports: [tcp()],
    streamMuxers: [mplex()],
    connectionEncryption: [noise()],
    dht: kadDHT({ clientMode: true })
  });

  await node.start();
  console.log('libp2p node started');
  console.log('Peer ID:', node.peerId.toString());
  console.log('Listen addresses:', node.getMultiaddrs().map(ma => ma.toString()));
})();
