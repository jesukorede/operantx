import { createWalletClient, custom } from "viem";
import EthereumProvider from "@walletconnect/ethereum-provider";

type Eip1193Provider = any;

let cachedProvider: Eip1193Provider | null = null;

async function getEip1193Provider(): Promise<Eip1193Provider | null> {
  if (typeof window === "undefined") return null;
  if (cachedProvider) return cachedProvider;

  const anyWin = window as any;
  if (anyWin.ethereum) {
    cachedProvider = anyWin.ethereum;
    return cachedProvider;
  }

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  if (!projectId) return null;

  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 9990);
  const rpcUrl = process.env.NEXT_PUBLIC_PEAQ_RPC_URL ?? "https://peaq-agung.api.onfinality.io/public";

  const provider = await EthereumProvider.init({
    projectId,
    chains: [chainId],
    showQrModal: true,
    rpcMap: { [chainId]: rpcUrl },
  });

  cachedProvider = provider as any;
  return cachedProvider;
}

export async function getWalletClient() {
  const provider = await getEip1193Provider();
  if (!provider) return null;
  return createWalletClient({ transport: custom(provider) });
}

export async function connectWallet(): Promise<`0x${string}`> {
  const client = await getWalletClient();
  if (!client) throw new Error("no_wallet");
  const [addr] = await client.requestAddresses();
  return addr;
}

export async function disconnectWallet(): Promise<void> {
  const provider: any = cachedProvider;
  cachedProvider = null;

  if (!provider) return;

  try {
    if (typeof provider.disconnect === "function") {
      await provider.disconnect();
    } else if (typeof provider.close === "function") {
      await provider.close();
    }
  } catch {
    // best-effort disconnect
  }
}

export async function signMessage(message: string, address: `0x${string}`): Promise<`0x${string}`> {
  const client = await getWalletClient();
  if (!client) throw new Error("no_wallet");
  return await client.signMessage({ account: address, message });
}
