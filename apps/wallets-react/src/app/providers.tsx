"use client";

import {
  CrossmintProvider,
  CrossmintAuthProvider,
  CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-ui";

const apiKey = process.env.NEXT_PUBLIC_CROSSMINT_API_KEY;

export function Providers({ children }: { children: React.ReactNode }) {
  if (!apiKey || apiKey === "your_client_api_key_here") {
    return (
      <div style={{ padding: 20, color: "red" }}>
        <h2>Missing API Key</h2>
        <p>
          Run <code>./setup.sh</code> or copy <code>.env.example</code> to{" "}
          <code>.env.local</code> and add your Crossmint API key.
        </p>
      </div>
    );
  }

  return (
    <CrossmintProvider apiKey={apiKey}>
      <CrossmintAuthProvider>
        <CrossmintWalletProvider
          createOnLogin={{
            chain: "base-sepolia",
            signer: { type: "email" },
          }}
        >
          {children}
        </CrossmintWalletProvider>
      </CrossmintAuthProvider>
    </CrossmintProvider>
  );
}
