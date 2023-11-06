export function dot2num(dot: string) {
  const d = dot.split('.');
  return ((+d[0] * 256 + +d[1]) * 256 + +d[2]) * 256 + +d[3];
}

export function num2dot(num: number) {
  let ip: string = '' + (num % 256);

  for (let i = 3; i > 0; i--) {
    num = Math.floor(num / 256);
    ip = (num % 256) + '.' + ip;
  }
  return ip;
}
