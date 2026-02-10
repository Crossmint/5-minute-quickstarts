# Quickstart Generation Guide

This guide instructs AI agents on generating consistent, well-structured quickstarts for the Crossmint 5-minute-quickstarts repository.

---

## Core Principles

1. **Snippets are the source of truth** - All code shown in documentation comes directly from snippet files
2. **If it runs, it's correct** - Snippets are imported by the actual app, so a working quickstart = valid snippets
3. **Deterministic docs** - AI decides nothing about how snippets render; `_meta.json` controls everything
4. **Single source of truth** - The `README.mdx` in each quickstart IS the documentation page

---

## Directory Structure

Every quickstart follows this exact structure:

```
apps/{product}-{framework}/
  snippets/
    01-{concept}.{ext}
    02-{concept}.{ext}
    03-{concept}.{ext}
    _meta.json
  src/
    ... (working app that IMPORTS from snippets/)
  README.mdx
  package.json
```

### Naming Convention

Quickstart folder names follow the pattern: `{product}-{framework}`

| Product | Frameworks                                 | Example          |
| ------- | ------------------------------------------ | ---------------- |
| wallets | react, react-native, nodejs, swift, kotlin | `wallets-react`  |
| pay     | react, react-native, nodejs, swift, kotlin | `pay-nodejs`     |
| minting | nodejs, rest                               | `minting-nodejs` |

---

## Snippet Files

### Location

`apps/{quickstart-id}/snippets/`

### Naming

Files use zero-padded numeric prefixes:

- `01-provider-setup.tsx`
- `02-auth-hook.tsx`
- `03-wallet-display.tsx`

### Language Extensions

| Framework    | Extension             |
| ------------ | --------------------- |
| React        | `.tsx`                |
| React Native | `.tsx`                |
| Node.js      | `.ts`                 |
| Swift        | `.swift`              |
| Kotlin       | `.kt`                 |
| REST API     | `.sh` (curl examples) |

### Content Rules

Each snippet file must:

- Be a valid, importable/runnable module
- Focus on ONE concept only
- Be under 30 lines (aim for 10-20)
- Include only necessary imports at the top
- Export named exports for easy importing

### Environment Variables

| Context          | Variable Name                               |
| ---------------- | ------------------------------------------- |
| React (client)   | `process.env.NEXT_PUBLIC_CROSSMINT_API_KEY` |
| React Native     | `process.env.EXPO_PUBLIC_CROSSMINT_API_KEY` |
| Node.js (server) | `process.env.CROSSMINT_API_KEY`             |
| Swift            | Read from plist or environment              |
| Kotlin           | `BuildConfig.CROSSMINT_API_KEY`             |

### Styling

Use the shared CSS design system (`shared/styles.css`) for all quickstarts. When rendered in docs, all `className` and `style` attributes are automatically stripped, so styling only affects the running quickstart app.

**Why plain CSS over Tailwind:**

- **Cleaner snippets** - `className="qs-btn"` keeps focus on Crossmint concepts, not styling
- **Cross-platform** - Same approach works for React, React Native, and can adapt for native platforms
- **Consistency** - One design system ensures all quickstarts look unified

**Rules:**

- Import `shared/styles.css` in your app's global CSS file
- Use semantic class names prefixed with `qs-` (e.g., `qs-btn`, `qs-card`, `qs-input`)
- Do not use Tailwind, CSS modules, styled-components, or other CSS frameworks
- Code must still make sense after styles are removed

**Common classes:**

| Element | Classes |
|---------|---------|
| Buttons | `qs-btn`, `qs-btn--primary`, `qs-btn--secondary`, `qs-btn--ghost` |
| Cards | `qs-card`, `qs-card--nested`, `qs-card__header`, `qs-card__body` |
| Layout | `qs-page`, `qs-container`, `qs-header`, `qs-footer` |
| Typography | `qs-title`, `qs-subtitle`, `qs-label`, `qs-value` |
| Forms | `qs-input` |
| Utilities | `qs-mt-sm`, `qs-mt-md`, `qs-mb-lg`, `qs-flex`, `qs-grid` |

### Integration Requirement

**Critical:** The quickstart's `src/` directory MUST import from `snippets/`. This ensures snippets are tested when the quickstart runs.

```typescript
// src/app/layout.tsx
import { Providers } from "../snippets/01-provider-setup";

// src/app/page.tsx
import { WalletDisplay } from "../snippets/03-wallet-display";
```

---

## \_meta.json Schema

Every quickstart must include `snippets/_meta.json`:

```json
{
  "id": "wallets-react",
  "framework": "React",
  "description": "Create user wallets from your frontend in under 5 minutes",
  "note": "This quickstart uses Next.js, but the same patterns work with any React setup.",
  "howItWorks": "This quickstart uses `@crossmint/client-sdk-react-ui` to integrate Crossmint wallets into a React app. The `CrossmintProvider` component wraps your app and manages authentication state, while the `useWallet` hook provides access to wallet data. Users can sign in with email or social login, and Crossmint handles wallet creation automatically.",
  "snippets": [
    {
      "file": "01-provider-setup.tsx",
      "title": "Configure the Provider",
      "description": "The `CrossmintProvider` wraps your app and manages authentication."
    },
    {
      "file": "02-auth-hook.tsx",
      "title": "Authentication",
      "description": "The `useAuth` hook provides methods to sign in and out, plus the current user state.",
      "accordion": "Calling `signIn()` opens the Crossmint auth modal. Once authenticated, `user` contains the wallet address and email."
    },
    {
      "file": "03-wallet-display.tsx",
      "title": "Display Wallet Info",
      "description": "The `useWallet` hook returns the connected wallet address and balance."
    }
  ]
}
```

### Field Definitions

| Field                    | Required | Description                                                         |
| ------------------------ | -------- | ------------------------------------------------------------------- |
| `id`                     | Yes      | Matches folder name exactly                                         |
| `framework`              | Yes      | Display name: "React", "Node.js", "Swift", "Kotlin", "React Native" |
| `description`            | Yes      | Action-oriented, under 80 chars (see Description Convention)        |
| `note`                   | No       | Framework/library note, renders as `<Note>` in docs                 |
| `howItWorks`             | Yes      | Single paragraph, 3-4 sentences explaining the core concept         |
| `snippets`               | Yes      | Array of snippet definitions in display order                       |
| `snippets[].file`        | Yes      | Filename in snippets folder                                         |
| `snippets[].title`       | Yes      | Section heading in docs                                             |
| `snippets[].description` | Yes      | One sentence, can include \`backticks\` for inline code             |
| `snippets[].accordion`   | No       | Only include for complex snippets needing extra explanation         |

### Description Convention

Pattern: `{Action} {target context} {with what} in under 5 minutes`

| Quickstart             | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| `wallets-react`        | "Create user wallets from your frontend in under 5 minutes"   |
| `wallets-nodejs`       | "Create user wallets from your backend in under 5 minutes"    |
| `wallets-swift`        | "Create user wallets from your iOS app in under 5 minutes"    |
| `wallets-react-native` | "Create user wallets from your mobile app in under 5 minutes" |
| `pay-react`            | "Accept credit card payments for crypto in under 5 minutes"   |
| `minting-nodejs`       | "Mint an NFT from your backend in under 5 minutes"            |

Rules:

- Start with action verb: "Create", "Accept", "Mint", "Enable"
- Specify context: "from your frontend", "from your backend", "from your iOS app"
- Keep under 80 characters

### Note Convention

Check `package.json` dependencies to identify the framework:

| Dependency | Note                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| `next`     | "This quickstart uses Next.js, but the same patterns work with any React setup." |
| `expo`     | "This quickstart uses Expo for easier setup."                                    |
| `express`  | "This quickstart uses Express, but the SDK works with any Node.js server."       |

Only add a note if there is a meaningful framework to mention. Skip for vanilla setups.

---

## README.mdx Template

The README.mdx is the single source of truth for documentation. It lives in the quickstart folder and is fetched by the docs site.

````mdx
---
title: "{framework}"
description: "{description from _meta.json}"
---

{/* AUTO-GENERATED FROM _meta.json AND snippets/ - DO NOT EDIT MANUALLY */}

## Prerequisites

- Node.js 18+

{/* Include <Note> here if _meta.json has a "note" field */}

## Quick Setup

<Steps>
  <Step title="Clone and run">
    ```bash git clone https://github.com/Crossmint/5-minute-quickstarts cd
    5-minute-quickstarts ./setup.sh {id}
    ```
  </Step>
  <Step title="Follow the prompts">
    The setup script installs dependencies, prompts for your API key (or [create
    one here](https://staging.crossmint.com/console)), and starts the dev
    server.
  </Step>
</Steps>

## How It Works

{howItWorks from \_meta.json}

## Code Walkthrough

{/* For each snippet in _meta.json.snippets, render: */}

### {snippet.title}

{snippet.description}

```{language inferred from file extension}
{EXACT contents of snippets/{snippet.file}}
```
````

{/_ Only if snippet.accordion exists: _/}
<Accordion title="What's happening here?">
{snippet.accordion}
</Accordion>

## Next Steps

<Card title="View Source" icon="github" href="https://github.com/Crossmint/5-minute-quickstarts/tree/main/apps/{id}">
  See the full quickstart code
</Card>
```

### Language Inference

Infer the code block language from the snippet file extension:

| Extension | Language     |
| --------- | ------------ |
| `.tsx`    | `tsx`        |
| `.ts`     | `typescript` |
| `.swift`  | `swift`      |
| `.kt`     | `kotlin`     |
| `.sh`     | `bash`       |

---

## Text Style Rules

All text in `_meta.json` and `README.mdx` must follow these rules:

- Use American English
- Use active voice
- Do not use contractions (use "do not" instead of "don't")
- Refer to Crossmint by name (never "we" or "us")
- Refer to the developer as "you"
- Default chain: `base-sepolia` unless guide is explicitly about another chain

---

## quickstarts.json

Every quickstart must be registered in `quickstarts.json` at the project root. This file is used by `setup.sh` to configure API keys and start the app.

```json
{
  "wallets-react": {
    "name": "Crossmint Wallets - React",
    "runtime": "node",
    "envVars": {
      "client": "NEXT_PUBLIC_CROSSMINT_API_KEY"
    }
  }
}
```

| Field | Description |
| --- | --- |
| key | Matches the folder name in `apps/` exactly |
| `name` | Human-readable display name |
| `runtime` | `"node"` for JS/TS quickstarts |
| `envVars.client` | Client-side API key variable name (if applicable) |
| `envVars.server` | Server-side API key variable name (if applicable) |

---

## Quality Checklist

Before a quickstart is considered complete:

- [ ] All snippet files are valid and importable
- [ ] `src/` imports from `snippets/` (app must use the snippet code)
- [ ] Running `./setup.sh {id}` successfully starts the app
- [ ] `quickstarts.json` includes an entry for this quickstart
- [ ] `_meta.json` includes all required fields
- [ ] `framework` is display name only ("React", not "Crossmint React Quickstart")
- [ ] `description` is action-oriented and under 80 characters
- [ ] `howItWorks` is exactly ONE paragraph (3-4 sentences)
- [ ] `accordion` only exists on complex snippets
- [ ] `README.mdx` follows the template exactly
- [ ] All text follows style rules (American English, active voice, no contractions)

---

## Example: Complete wallets-react Quickstart

### File: `snippets/01-provider-setup.tsx`

```tsx
import { CrossmintProvider } from "@crossmint/client-sdk-react-ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CrossmintProvider apiKey={process.env.NEXT_PUBLIC_CROSSMINT_API_KEY!}>
      {children}
    </CrossmintProvider>
  );
}
```

### File: `snippets/02-auth-hook.tsx`

```tsx
"use client";

import { useAuth } from "@crossmint/client-sdk-react-ui";

export function AuthButton() {
  const { login, logout, user } = useAuth();

  if (user) {
    return (
      <div>
        <p>Signed in as {user.email}</p>
        <button onClick={logout}>Sign Out</button>
      </div>
    );
  }

  return <button onClick={login}>Sign In</button>;
}
```

### File: `snippets/03-wallet-display.tsx`

```tsx
"use client";

import { useWallet } from "@crossmint/client-sdk-react-ui";

export function WalletDisplay() {
  const { wallet } = useWallet();

  if (!wallet) return <p>No wallet connected</p>;

  return (
    <div>
      <p>Address: {wallet.address}</p>
    </div>
  );
}
```

### File: `snippets/_meta.json`

```json
{
  "id": "wallets-react",
  "framework": "React",
  "description": "Create user wallets from your frontend in under 5 minutes",
  "note": "This quickstart uses Next.js, but the same patterns work with any React setup.",
  "howItWorks": "This quickstart uses `@crossmint/client-sdk-react-ui` to integrate Crossmint wallets into a React app. The `CrossmintProvider` component wraps your app and manages authentication state, while the `useWallet` hook provides access to wallet data. Users can sign in with email or social login, and Crossmint handles wallet creation automatically.",
  "snippets": [
    {
      "file": "01-provider-setup.tsx",
      "title": "Configure the Provider",
      "description": "The `CrossmintProvider` wraps your app and manages authentication."
    },
    {
      "file": "02-auth-hook.tsx",
      "title": "Authentication",
      "description": "The `useAuth` hook provides methods to sign in and out, plus the current user state.",
      "accordion": "Calling `login()` opens the Crossmint auth modal. Once authenticated, `user` contains the wallet address and email. The `logout()` function clears the session."
    },
    {
      "file": "03-wallet-display.tsx",
      "title": "Display Wallet Info",
      "description": "The `useWallet` hook returns the connected wallet and its address."
    }
  ]
}
```

### File: `src/app/layout.tsx` (imports from snippets)

```tsx
import { Providers } from "../snippets/01-provider-setup";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```
