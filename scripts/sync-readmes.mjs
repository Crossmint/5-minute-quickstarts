#!/usr/bin/env node

/**
 * Sync README.mdx files with their respective snippets
 *
 * This script reads _meta.json and snippet files from each quickstart,
 * then generates a deterministic README.mdx following the template.
 *
 * Usage: node scripts/sync-readmes.mjs [quickstart-id]
 *   - No args: syncs all quickstarts
 *   - With arg: syncs only the specified quickstart
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const APPS_DIR = join(ROOT, "apps");

// Map file extensions to markdown code block languages
const LANG_MAP = {
  ".tsx": "tsx",
  ".ts": "typescript",
  ".swift": "swift",
  ".kt": "kotlin",
  ".sh": "bash",
};

function getLanguage(filename) {
  const ext = filename.substring(filename.lastIndexOf("."));
  return LANG_MAP[ext] || "text";
}

/**
 * Strip numeric prefix from filename for cleaner display in docs.
 * "01-provider-setup.tsx" → "provider-setup.tsx"
 */
function stripNumericPrefix(filename) {
  return filename.replace(/^\d+-/, "");
}

/**
 * Strip className and style attributes from JSX code for cleaner docs.
 * Handles: className="...", className='...', className={...}, style={{...}}, style={...}
 */
function stripStyles(code) {
  let result = code;
  result = result.replace(/\s+className=["'][^"']*["']/g, "");
  result = result.replace(/\s+className=\{[^}]*\}/g, "");
  result = result.replace(/\s+style=\{\{[^}]*\}\}/g, "");
  result = result.replace(/\s+style=\{[^}]*\}/g, "");
  result = result.replace(/\n{3,}/g, "\n\n");
  return result;
}

function generateReadme(meta, snippets) {
  const lines = [];

  // Frontmatter
  lines.push("---");
  lines.push(`title: "${meta.framework}"`);
  lines.push(`description: "${meta.description}"`);
  lines.push("---");
  lines.push("");
  lines.push(
    "{/* AUTO-GENERATED FROM _meta.json AND snippets/ - DO NOT EDIT MANUALLY */}",
  );
  lines.push("");

  // Prerequisites
  lines.push("## Prerequisites");
  lines.push("");
  lines.push("- Node.js 18+");
  lines.push("");

  // Note (if exists)
  if (meta.note) {
    lines.push("<Note>");
    lines.push(meta.note);
    lines.push("</Note>");
    lines.push("");
  }

  // Quick Setup
  lines.push("## Quick Setup");
  lines.push("");
  lines.push("<Steps>");
  lines.push('  <Step title="Clone and run">');
  lines.push("    ```bash");
  lines.push("    git clone https://github.com/Crossmint/5-minute-quickstarts");
  lines.push("    cd 5-minute-quickstarts");
  lines.push(`    ./setup.sh ${meta.id}`);
  lines.push("    ```");
  lines.push("  </Step>");
  lines.push('  <Step title="Follow the prompts">');
  lines.push(
    "    The setup script installs dependencies, prompts for your API key (or [create one here](https://staging.crossmint.com/console)), and starts the dev server.",
  );
  lines.push("  </Step>");
  lines.push("</Steps>");
  lines.push("");

  // How It Works
  lines.push("## How It Works");
  lines.push("");
  lines.push(meta.howItWorks);
  lines.push("");

  // Code Walkthrough
  lines.push("## Code Walkthrough");
  lines.push("");

  for (const snippet of meta.snippets) {
    const rawContent = snippets[snippet.file];
    const cleanContent = stripStyles(rawContent);
    const lang = getLanguage(snippet.file);
    const displayFilename = stripNumericPrefix(snippet.file);

    lines.push(`### ${snippet.title}`);
    lines.push("");
    lines.push(snippet.description);
    lines.push("");
    lines.push(`\`\`\`${lang} title="${displayFilename}"`);
    lines.push(cleanContent.trim());
    lines.push("```");
    lines.push("");

    if (snippet.accordion) {
      lines.push('<Accordion title="What\'s happening here?">');
      lines.push(snippet.accordion);
      lines.push("</Accordion>");
      lines.push("");
    }
  }

  // Next Steps
  lines.push("## Next Steps");
  lines.push("");
  lines.push(
    `<Card title="View Source" icon="github" href="https://github.com/Crossmint/5-minute-quickstarts/tree/main/apps/${meta.id}">`,
  );
  lines.push("  See the full quickstart code");
  lines.push("</Card>");

  return lines.join("\n");
}

function syncQuickstart(quickstartId) {
  const appDir = join(APPS_DIR, quickstartId);
  const snippetsDir = join(appDir, "snippets");
  const metaPath = join(snippetsDir, "_meta.json");

  if (!existsSync(metaPath)) {
    console.log(`  ⏭️  Skipping ${quickstartId} (no snippets/_meta.json)`);
    return false;
  }

  // Read _meta.json
  const meta = JSON.parse(readFileSync(metaPath, "utf-8"));

  // Validate required fields
  const required = ["id", "framework", "description", "howItWorks", "snippets"];
  for (const field of required) {
    if (!meta[field]) {
      console.error(
        `  ❌ ${quickstartId}: Missing required field "${field}" in _meta.json`,
      );
      return false;
    }
  }

  // Read all snippet files
  const snippets = {};
  for (const snippet of meta.snippets) {
    const snippetPath = join(snippetsDir, snippet.file);
    if (!existsSync(snippetPath)) {
      console.error(
        `  ❌ ${quickstartId}: Snippet file not found: ${snippet.file}`,
      );
      return false;
    }
    snippets[snippet.file] = readFileSync(snippetPath, "utf-8");
  }

  // Generate README.mdx
  const readme = generateReadme(meta, snippets);
  const readmePath = join(appDir, "README.mdx");

  // Check if content changed
  const existingContent = existsSync(readmePath)
    ? readFileSync(readmePath, "utf-8")
    : "";
  if (existingContent === readme) {
    console.log(`  ✓ ${quickstartId} (no changes)`);
    return true;
  }

  writeFileSync(readmePath, readme);
  console.log(`  ✓ ${quickstartId} (updated)`);
  return true;
}

function main() {
  const args = process.argv.slice(2);
  const targetQuickstart = args[0];

  console.log("Syncing README.mdx files...\n");

  if (targetQuickstart) {
    // Sync single quickstart
    if (!existsSync(join(APPS_DIR, targetQuickstart))) {
      console.error(
        `Error: Quickstart "${targetQuickstart}" not found in apps/`,
      );
      process.exit(1);
    }
    syncQuickstart(targetQuickstart);
  } else {
    // Sync all quickstarts
    const apps = readdirSync(APPS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    let synced = 0;
    for (const app of apps) {
      if (syncQuickstart(app)) {
        synced++;
      }
    }

    console.log(`\nDone! Synced ${synced} quickstart(s).`);
  }
}

main();
