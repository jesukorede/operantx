"use client";

import { useEffect, useState } from "react";
import { api, setToken } from "../lib/api";
import { connectWallet, signMessage } from "../lib/wallet";

export function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMobile = typeof window !== "undefined" ? /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) : false;
  const wcEnabled = Boolean(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID);

  const metamaskDeepLink = (() => {
    if (typeof window === "undefined") return "";
    const url = window.location.href;
    return `https://metamask.app.link/dapp/${url.replace(/^https?:\/\//, "")}`;
  })();

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
      if (msg === "backend_unreachable") {
        setError("Backend is not reachable.");
      } else if (msg === "no_wallet") {
        setError(isMobile ? "No wallet detected in this browser." : "No wallet detected (install MetaMask/Rabby). ");
      } else {
        setError(msg);
      }
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
        {error === "No wallet detected in this browser." && isMobile ? (
          <a className="btn secondary" href={metamaskDeepLink} target="_blank" rel="noreferrer">
            Open in MetaMask
          </a>
        ) : null}
        {error === "No wallet detected in this browser." && !wcEnabled ? (
          <div style={{ color: "var(--muted)", fontSize: 12, maxWidth: 220, textAlign: "right" }}>
            Tip: install MetaMask mobile or open this site inside a wallet browser.
          </div>
        ) : null}
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
