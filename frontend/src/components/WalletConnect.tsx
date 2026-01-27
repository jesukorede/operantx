"use client";

import { useEffect, useState } from "react";
import { api, setToken } from "../lib/api";
import { connectWallet, signMessage } from "../lib/wallet";

export function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const a = localStorage.getItem("operantx_address");
    if (a) setAddress(a);
  }, []);

  async function onConnect() {
    setBusy(true);
    setError(null);
    try {
      const addr = await connectWallet();
      const { message } = await api.nonce(addr);
      const sig = await signMessage(message, addr);
      const { token } = await api.verify(addr, sig);

      setToken(token);
      localStorage.setItem("operantx_address", addr);
      setAddress(addr);
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      setError(msg === "backend_unreachable" ? "Backend is not reachable (is it running on :4000?)" : msg);
    } finally {
      setBusy(false);
    }
  }

  function onDisconnect() {
    setToken(null);
    localStorage.removeItem("operantx_address");
    setAddress(null);
  }

  if (!address) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <button className="btn" onClick={onConnect} disabled={busy}>
          {busy ? "Connecting..." : "Connect Wallet"}
        </button>
        {error ? <div style={{ color: "tomato", fontSize: 12 }}>{error}</div> : null}
      </div>
    );
  }

  return (
    <button className="btn secondary" onClick={onDisconnect}>
      {address.slice(0, 6)}…{address.slice(-4)}
    </button>
  );
}
