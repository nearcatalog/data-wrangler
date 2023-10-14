import Big from "big.js";

export function msToNano(timestampMs: number): string {
  return Big(timestampMs).mul(1000000).toFixed();
}
