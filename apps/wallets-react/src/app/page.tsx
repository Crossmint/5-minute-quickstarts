"use client";

import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import { AuthButton } from "../../snippets/02-auth-button";
import { WalletDisplay } from "../../snippets/03-wallet-display";
import { BalanceCard } from "../../snippets/04-balance-card";
import { TransferForm } from "../../snippets/05-transfer-form";

export default function Home() {
  const { user } = useAuth();
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
          <AuthButton />
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
        <AuthButton />
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
                  <TransferForm />
                </div>
                <div className="qs-card qs-card--nested qs-mt-md">
                  <div className="qs-card__body">
                    <p className="qs-label">Wallet Details</p>
                    <WalletDisplay />
                  </div>
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
