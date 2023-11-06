export default function extractNLastBits(num: number, nLastBits: number) {
  const maximumOfNBits = (1 << nLastBits) - 1;
  return num & maximumOfNBits;
}

export const addBinary = (a, b) => {
  return (BigInt(`0b${a}`) + BigInt(`0b${b}`)).toString(2);
};

export const concatBit = (a, b) => (a << (Math.ceil(Math.log2(b)) + 1)) + b;
