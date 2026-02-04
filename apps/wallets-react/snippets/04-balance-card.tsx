"use client";

import { useWallet } from "@crossmint/client-sdk-react-ui";
import { useState } from "react";

export function BalanceCard() {
  const { wallet } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);

  const refreshBalance = async () => {
    if (!wallet) return;
    const balances = await wallet.balances(["usdxm"]);
    const token = balances.tokens.find((t) => t.symbol === "usdxm");
    setBalance(token?.amount ?? "0");
  };

  const handleFund = async () => {
    if (!wallet) return;
    await wallet.stagingFund(10);
    await refreshBalance();
  };

  return (
    <div className="qs-card qs-card--nested">
      <p className="qs-label">USDXM Balance</p>
      <p className="qs-value">${balance ?? "—"}</p>
      <div className="qs-flex qs-flex--gap-sm qs-mt-md">
        <button className="qs-btn qs-btn--primary" onClick={handleFund}>
          Add funds
        </button>
        <button className="qs-btn qs-btn--secondary" onClick={refreshBalance}>
          Refresh
        </button>
      </div>
    </div>
  );
}
