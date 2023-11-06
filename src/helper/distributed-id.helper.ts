import * as os from 'os';
import { dot2num } from './ip-address.helper';

let cachedIps: null | string[] = null;
let sequence = 0;

const maxBitOfSeq = 8;
const maxByteOfClusterId = 4;
const maxBytesOfNetworkId = 2;
const maxBytesOfTime = 5;

const getNetworkIPs: () => string[] = () => {
  if (cachedIps !== null) {
    return cachedIps;
  }

  const networkInterfaces = os.networkInterfaces();
  const ips: string[] = [];
  for (const networkCardId of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[networkCardId]) {
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
      if (net.family === familyV4Value && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  cachedIps = ips;
  return cachedIps;
};

export const distributedId = (): string => {
  const firstIp = getNetworkIPs().slice(0, 1).shift();

  const shortenNetworkId = Buffer.from(
    dot2num(firstIp).toString(16),
    'hex',
  ).slice(-maxBytesOfNetworkId);

  const time = Buffer.from(Date.now().toString(16), 'hex').slice(
    0,
    maxBytesOfTime,
  );

  const shortenClusterId = Buffer.from(
    '' + process.env['CLUSTER_ID'],
    'utf-8',
  ).slice(-maxByteOfClusterId);

  // Limit the seq to maximum.
  sequence = (sequence % (1 << maxBitOfSeq)) + 1;

  // 40 Timestamp
  // 8 ClusterId
  // 16 MachineId
  // 8 Seq

  return Buffer.concat([
    time,
    shortenClusterId,
    shortenNetworkId,
    Buffer.alloc(maxBitOfSeq / 8, sequence),
  ]).toString('base64');
};
