"use client";

import { useWallet } from "@crossmint/client-sdk-react-ui";
import { useState } from "react";

export function TransferForm() {
  const { wallet } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txExplorerLink, setTxExplorerLink] = useState("");

  const handleTransfer = async () => {
    if (!wallet || !recipient || !amount) return;
    const { explorerLink } = await wallet.send(recipient, "usdxm", amount);
    setTxExplorerLink(explorerLink);
    setRecipient("");
    setAmount("");
  };

  return (
    <div className="qs-card qs-card--nested">
      <p className="qs-label">Transfer Funds</p>
      <input
        className="qs-input qs-mt-sm"
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        className="qs-input qs-mt-sm"
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        className="qs-btn qs-btn--primary qs-btn--full qs-mt-md"
        onClick={handleTransfer}
        disabled={!recipient || !amount}
      >
        Transfer
      </button>
      {txExplorerLink && (
        <a href={txExplorerLink} target="_blank" rel="noopener noreferrer">
          View transaction
        </a>
      )}
    </div>
  );
}
