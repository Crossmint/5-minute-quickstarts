"use client";

import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import { useState } from "react";

export default function Home() {
  const { login, logout, user } = useAuth();
  const { wallet, status } = useWallet();

  if (!user) {
    return (
      <div className="qs-page">
        <div className="qs-center">
          <img
            src="https://5jjohasqe3i09jgh.public.blob.vercel-storage.com/crossmint-icons/crossmint.svg"
            alt="Crossmint"
            className="qs-center__icon"
          />
          <h1 className="qs-title">Wallets Quickstart</h1>
          <p className="qs-subtitle qs-mb-lg">
            Create and interact with Crossmint wallets
          </p>
          <button className="qs-btn qs-btn--primary" onClick={login}>
            Sign In
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="qs-page">
      <header className="qs-header">
        <div className="qs-header__brand">
          <img
            src="https://5jjohasqe3i09jgh.public.blob.vercel-storage.com/crossmint-icons/crossmint.svg"
            alt="Crossmint"
            className="qs-header__logo"
          />
          <span>Wallets Quickstart</span>
        </div>
        <button className="qs-btn qs-btn--ghost" onClick={logout}>
          Log out
        </button>
      </header>

      <main className="qs-container">
        <div className="qs-card">
          <div className="qs-card__header">
            <h2 className="qs-card__title">Dashboard</h2>
          </div>
          <div className="qs-card__body">
            {status === "in-progress" && (
              <p className="qs-text-muted">Creating wallet...</p>
            )}
            {status === "error" && (
              <p className="qs-text-error">Error loading wallet</p>
            )}
            {status === "loaded" && wallet && (
              <>
                <div className="qs-grid qs-grid--2">
                  <BalanceCard />
                  <TransferCard />
                </div>
                <div className="qs-mt-md">
                  <WalletDetails email={user.email} />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function BalanceCard() {
  const { wallet } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFund = async () => {
    if (!wallet) return;
    setLoading(true);
    try {
      await wallet.stagingFund(10);
      await refreshBalance();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const refreshBalance = async () => {
    if (!wallet) return;
    try {
      const balances = await wallet.balances(["usdxm"]);
      const token = balances.tokens.find((t) => t.symbol === "usdxm");
      setBalance(token?.amount ?? "0");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="qs-card qs-card--nested">
      <div className="qs-card__body">
        <p className="qs-label">USDXM Balance</p>
        <p className="qs-value">${balance ?? "—"}</p>
        <div className="qs-flex qs-flex--gap-sm qs-mt-md">
          <button
            className="qs-btn qs-btn--primary"
            onClick={handleFund}
            disabled={loading}
          >
            {loading ? "..." : "Add funds"}
          </button>
          <button className="qs-btn qs-btn--secondary" onClick={refreshBalance}>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

function TransferCard() {
  const { wallet } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [txExplorerLink, setTxExplorerLink] = useState<string | null>(null);

  const handleTransfer = async () => {
    if (!wallet || !recipient || !amount) return;
    setLoading(true);
    setStatus("idle");
    setTxExplorerLink(null);
    try {
      const { explorerLink } = await wallet.send(recipient, "usdxm", amount);
      setTxExplorerLink(explorerLink);
      setStatus("success");
      setRecipient("");
      setAmount("");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
    setLoading(false);
  };

  return (
    <div className="qs-card qs-card--nested">
      <div className="qs-card__body">
        <p className="qs-label">Transfer Funds</p>
        <div className="qs-mt-sm">
          <input
            type="text"
            className="qs-input"
            placeholder="Recipient address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>
        <div className="qs-mt-sm">
          <input
            type="number"
            className="qs-input"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <button
          className="qs-btn qs-btn--primary qs-btn--full qs-mt-md"
          onClick={handleTransfer}
          disabled={loading || !recipient || !amount}
        >
          {loading ? "Sending..." : "Transfer"}
        </button>
        {status === "success" && (
          <div className="qs-mt-sm">
            <p className="qs-text-success">Transfer successful!</p>
            {txExplorerLink && (
              <a href={txExplorerLink} target="_blank" className="qs-tx-link">
                View transaction →
              </a>
            )}
          </div>
        )}
        {status === "error" && (
          <p className="qs-text-error qs-mt-sm">Transfer failed</p>
        )}
      </div>
    </div>
  );
}

function WalletDetails({ email }: { email?: string }) {
  const { wallet } = useWallet();
  const [copied, setCopied] = useState(false);

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const copyAddress = async () => {
    if (!wallet) return;
    await navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="qs-card qs-card--nested">
      <div className="qs-card__body">
        <p className="qs-label">Wallet Details</p>
        <div className="qs-details qs-mt-sm">
          <div className="qs-details__row">
            <span className="qs-details__label">Address</span>
            <span className="qs-details__value qs-address">
              {wallet ? truncateAddress(wallet.address) : "—"}
              {wallet && (
                <button
                  onClick={copyAddress}
                  className="qs-copy-btn"
                  title="Copy address"
                >
                  {copied ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              )}
            </span>
          </div>
          <div className="qs-details__row">
            <span className="qs-details__label">Owner</span>
            <span className="qs-details__value">{email ?? "—"}</span>
          </div>
          <div className="qs-details__row">
            <span className="qs-details__label">Chain</span>
            <span className="qs-details__value">Base Sepolia</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="qs-footer">
      <div className="qs-footer__links">
        <a
          href="https://github.com/Crossmint/5-minute-quickstarts/tree/main/apps/wallets-react"
          className="qs-footer__link"
          target="_blank"
        >
          View code
        </a>
        <a
          href="https://docs.crossmint.com"
          className="qs-footer__link"
          target="_blank"
        >
          Documentation
        </a>
        <a
          href="https://crossmint.com"
          className="qs-footer__link"
          target="_blank"
        >
          crossmint.com →
        </a>
      </div>
      <img
        src="https://5jjohasqe3i09jgh.public.blob.vercel-storage.com/crossmint-icons/powered-by.svg"
        alt="Powered by Crossmint"
        className="qs-footer__powered"
      />
    </footer>
  );
}
