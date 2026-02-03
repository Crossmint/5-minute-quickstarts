#!/usr/bin/env node

/**
 * Syncs docs.mdx files from quickstart apps to the docs repo.
 *
 * Usage:
 *   node scripts/sync-to-docs.mjs --docs-path ../docs
 *
 * This script:
 * 1. Finds all docs.mdx files in apps/
 * 2. Copies them to the corresponding location in the docs repo
 * 3. Adds a header comment indicating the file is auto-generated
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

const APPS_DIR = join(process.cwd(), 'apps');
const HEADER = `{/* AUTO-GENERATED - Source: https://github.com/Crossmint/5-minute-quickstarts */}

`;

// Mapping from app directory name to docs path
const DOCS_PATHS = {
  'wallets-react': 'wallets/quickstarts/react.mdx',
  'wallets-react-native': 'wallets/quickstarts/react-native.mdx',
  'wallets-nextjs': 'wallets/quickstarts/nextjs.mdx',
  'onramp-react': 'onramp/quickstarts/react.mdx',
  // Add more mappings as quickstarts are added
};

async function getAppsWithDocs() {
  const entries = await readdir(APPS_DIR, { withFileTypes: true });
  const apps = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const docsPath = join(APPS_DIR, entry.name, 'docs.mdx');
      if (existsSync(docsPath)) {
        apps.push({
          name: entry.name,
          docsPath,
          targetPath: DOCS_PATHS[entry.name],
        });
      }
    }
  }

  return apps;
}

async function syncToDocs(docsRepoPath) {
  const apps = await getAppsWithDocs();

  console.log(`Found ${apps.length} quickstart(s) with docs.mdx\n`);

  for (const app of apps) {
    if (!app.targetPath) {
      console.log(`⚠️  ${app.name}: No docs path mapping defined, skipping`);
      continue;
    }

    const targetPath = join(docsRepoPath, app.targetPath);
    const content = await readFile(app.docsPath, 'utf-8');
    const contentWithHeader = HEADER + content;

    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, contentWithHeader);
    console.log(`✓ ${app.name} → ${app.targetPath}`);
  }

  console.log('\nSync complete!');
}

// Parse args
const args = process.argv.slice(2);
const docsPathIndex = args.indexOf('--docs-path');

if (docsPathIndex === -1 || !args[docsPathIndex + 1]) {
  console.log('Usage: node scripts/sync-to-docs.mjs --docs-path <path-to-docs-repo>');
  console.log('\nExample:');
  console.log('  node scripts/sync-to-docs.mjs --docs-path ../docs');
  process.exit(1);
}

const docsPath = args[docsPathIndex + 1];

if (!existsSync(docsPath)) {
  console.error(`Error: Docs path does not exist: ${docsPath}`);
  process.exit(1);
}

syncToDocs(docsPath);
