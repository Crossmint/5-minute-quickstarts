"use client";

import {
  CrossmintProvider,
  CrossmintAuthProvider,
  CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CrossmintProvider apiKey={process.env.NEXT_PUBLIC_CROSSMINT_API_KEY!}>
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
