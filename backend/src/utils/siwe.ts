// Minimal SIWE-style message builder/validator for MVP.
// We intentionally avoid full EIP-4361 compliance here.

export function buildLoginMessage(params: {
  address: string;
  nonce: string;
  domain: string;
  uri: string;
  chainId: number;
}): string {
  const { address, nonce, domain, uri, chainId } = params;

  return [
    `${domain} wants you to sign in with your Ethereum account:`,
    `${address}`,
    "",
    `URI: ${uri}`,
    "Version: 1",
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`
  ].join("\n");
}
