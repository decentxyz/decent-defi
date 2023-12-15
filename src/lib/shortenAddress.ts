export default function shortenAddress(
  addr?: string,
  frontSlice = 5,
  backSlice = 3
): string {
  if (!addr) return '';
  if (addr.length < frontSlice + backSlice) return addr;
  return addr.slice(0, frontSlice) + '...' + addr.slice(-backSlice);
}
