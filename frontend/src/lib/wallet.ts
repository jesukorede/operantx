import { createWalletClient, custom } from "viem";

export function getWalletClient() {
  if (typeof window === "undefined") return null;
  const anyWin = window as any;
  if (!anyWin.ethereum) return null;
  return createWalletClient({ transport: custom(anyWin.ethereum) });
}

export async function connectWallet(): Promise<`0x${string}`> {
  const client = getWalletClient();
  if (!client) throw new Error("no_wallet");
  const [addr] = await client.requestAddresses();
  return addr;
}

export async function signMessage(message: string, address: `0x${string}`): Promise<`0x${string}`> {
  const client = getWalletClient();
  if (!client) throw new Error("no_wallet");
  return await client.signMessage({ account: address, message });
}
