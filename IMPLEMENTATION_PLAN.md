5-Minute Quickstarts Framework
Author: Jonathan (DevRel) | Date: January 2026

Problem
35+ quickstarts with inconsistent structure (docs.crossmint.com)
Code samples aren't runnable — hard to audit
No single source of truth — docs drift from working code
Setup takes too long (environment, dependencies, API keys)

Solution
Monorepo: crossmint/5-minute-quickstarts
crossmint/5-minute-quickstarts/ 
├── apps/ 
│   ├── onramp-react/ 
│   │   ├── README.mdx        ← Single source of truth (synced to docs) 
│   │   ├── setup.sh          ← One-command setup 
│   │   └── .env.example 
│   ├── wallets-react/ 
│   └── ... 
└── scripts/ 
   └── sync-to-docs.mjs      ← Syncs READMEs to docs repo 
Instant Setup
Every quickstart starts with a one-liner:
git clone https://github.com/Crossmint/5-minute-quickstarts && cd 5-minute-quickstarts/apps/onramp-react && ./setup.sh 
The setup.sh script:
Installs dependencies
Opens browser to staging console for login, auto-retrieves Development Keys and writes them to config (uses @crossmint/cli commands to handle this)
Starts dev server

Development Keys have full API access in staging — no scope configuration needed! 
Docs Sync
README.mdx files (written with Mintlify syntax) are synced to docs at build time, following our existing changelog pattern. copyChangelog.mjs
Benefits
Single source of truth — code and docs live together
Auditable — run the quickstart to verify it works
Language/environment agnostic — one-liner works for React, React Native, Swift, Kotlin
Agent-friendly — one command to clone, setup, and run
< 60 second setup — including API keys

Implementation
Create crossmint/5-minute-quickstarts monorepo
Add setup.sh with auto API key retrieval to each quickstart
Build sync script to pull READMEs into docs
Add CI to validate sync on PRs
Could also setup a CI that triggers an automated Devin workflow using a simple playbook containing the framework

Does not replace exhaustive demos on crossmint.com/quickstarts.
