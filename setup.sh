#!/bin/bash
set -e

# ============================================
# Crossmint 5-Minute Quickstart Setup
# ============================================
#
# This script sets up and runs a Crossmint quickstart app.
# All quickstarts use the Crossmint STAGING environment
# (staging.crossmint.com).
#
# Usage:
#   ./setup.sh <quickstart-name>
#
# Example:
#   ./setup.sh wallets-react
#
# What this script does:
#   1. Checks for an existing API key in .env.local or environment variables
#   2. If no key is found:
#      a. Runs `npx @crossmint/cli login --env staging`
#         (opens browser — the user completes authentication there.
#          The --env flag is only for login; all other CLI commands
#          inherit the environment from the session.)
#      b. Runs `npx @crossmint/cli projects select` to let the user
#         pick a project. If the interactive picker fails (e.g. in an
#         agent terminal), lists projects and falls back to ID-based
#         selection (TTY) or exits with instructions (non-TTY).
#      c. Retrieves or creates API keys for the selected project
#   3. Writes keys to apps/<quickstart>/.env.local
#   4. Installs dependencies with pnpm
#   5. Starts the dev server
# ============================================

QUICKSTART=${1:-}

# Show usage if no quickstart specified
if [ -z "$QUICKSTART" ]; then
    echo "5-Minute Quickstarts"
    echo "===================="
    echo ""
    echo "Usage: ./setup.sh <quickstart-name>"
    echo ""
    echo "Available quickstarts:"
    node -e "Object.entries(require('./quickstarts.json')).forEach(([k,v]) => console.log('  ' + k.padEnd(20) + v.name))"
    echo ""
    echo "Example: ./setup.sh wallets-react"
    exit 0
fi

# Check if quickstart exists
if [ ! -d "apps/$QUICKSTART" ]; then
    echo "Error: Quickstart '$QUICKSTART' not found"
    echo "Run ./setup.sh to see available quickstarts"
    exit 1
fi

# Load config for this quickstart
CONFIG=$(node -e "console.log(JSON.stringify(require('./quickstarts.json')['$QUICKSTART'] || {}))")
NAME=$(echo $CONFIG | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).name||'$QUICKSTART'))")
CLIENT_VAR=$(echo $CONFIG | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).envVars?.client||''))")
SERVER_VAR=$(echo $CONFIG | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).envVars?.server||''))")

echo "$NAME"
echo "====================================="
echo ""

APP_DIR="apps/$QUICKSTART"

# ============================================
# COMMON: API Key Setup (all platforms)
# ============================================

NEED_CLIENT=false
NEED_SERVER=false
NEED_LOGIN=false
[ -n "$CLIENT_VAR" ] && NEED_CLIENT=true
[ -n "$SERVER_VAR" ] && NEED_SERVER=true

ENV_FILE="$APP_DIR/.env.local"
ENV_CONTENT=""

# Check for existing keys in environment or .env.local
if [ "$NEED_CLIENT" = true ]; then
    CLIENT_KEY="${!CLIENT_VAR}"
    if [ -n "$CLIENT_KEY" ] && [ "$CLIENT_KEY" != "your_client_api_key_here" ]; then
        echo "Using client key from environment"
        ENV_CONTENT+="$CLIENT_VAR=$CLIENT_KEY"$'\n'
    elif [ -f "$ENV_FILE" ] && grep -q "$CLIENT_VAR=" "$ENV_FILE" && ! grep -q "your_client_api_key_here" "$ENV_FILE"; then
        echo "Using existing client key from .env.local"
    else
        NEED_LOGIN=true
    fi
fi

if [ "$NEED_SERVER" = true ]; then
    SERVER_KEY="${!SERVER_VAR}"
    if [ -n "$SERVER_KEY" ] && [ "$SERVER_KEY" != "your_server_api_key_here" ]; then
        echo "Using server key from environment"
        ENV_CONTENT+="$SERVER_VAR=$SERVER_KEY"$'\n'
    elif [ -f "$ENV_FILE" ] && grep -q "$SERVER_VAR=" "$ENV_FILE" && ! grep -q "your_server_api_key_here" "$ENV_FILE"; then
        echo "Using existing server key from .env.local"
    else
        NEED_LOGIN=true
    fi
fi

# Login, select project, and retrieve keys if needed
if [ "$NEED_LOGIN" = true ]; then
    echo "No API key found. Logging in to Crossmint (staging)..."
    echo ""
    echo "This will open a browser for authentication and project selection."
    echo "Complete the login in your browser, select a project, then return here."
    echo ""
    echo "NOTE: This is safe to run from any terminal, including AI agents."
    echo "The browser handles all interactive steps — this terminal just waits."
    echo ""
    npx @crossmint/cli login --env staging

    echo ""

    # Select a project. The CLI picker is interactive (TUI), so it may fail
    # in non-TTY environments. If it does, list projects and let the user
    # pick by ID (works in any terminal, including agent environments).
    echo "Select a project to use for this quickstart:"
    echo ""
    if ! npx @crossmint/cli projects select 2>/dev/null; then
        echo ""
        echo "Interactive project picker unavailable. Listing projects..."
        echo ""
        npx @crossmint/cli projects list 2>/dev/null || true
        echo ""
        if [ -t 0 ]; then
            read -p "Enter a project ID from the list above: " PROJECT_ID
        else
            echo "Non-interactive terminal detected."
            echo "To continue, select a project and re-run:"
            echo ""
            echo "  npx @crossmint/cli projects select <project-id>"
            echo "  ./setup.sh $QUICKSTART"
            echo ""
            exit 1
        fi
        if [ -n "$PROJECT_ID" ]; then
            npx @crossmint/cli projects select "$PROJECT_ID" 2>&1
        else
            echo "No project selected. Using default project from login."
        fi
    fi

    echo ""
    echo "Retrieving API keys..."

    if [ "$NEED_CLIENT" = true ] && [ -z "$CLIENT_KEY" ]; then
        CLIENT_KEY=$(npx @crossmint/cli keys list client 2>/dev/null | grep -o 'ck_[a-zA-Z0-9_]*' | head -1 || true)
        if [ -z "$CLIENT_KEY" ]; then
            echo "No client key found. Creating one..."
            npx @crossmint/cli keys create 2>&1
            CLIENT_KEY=$(npx @crossmint/cli keys list client 2>/dev/null | grep -o 'ck_[a-zA-Z0-9_]*' | head -1 || true)
        fi
        [ -n "$CLIENT_KEY" ] && ENV_CONTENT+="$CLIENT_VAR=$CLIENT_KEY"$'\n'
    fi

    if [ "$NEED_SERVER" = true ] && [ -z "$SERVER_KEY" ]; then
        SERVER_KEY=$(npx @crossmint/cli keys list server 2>/dev/null | grep -o 'sk_[a-zA-Z0-9_]*' | head -1 || true)
        if [ -z "$SERVER_KEY" ]; then
            echo "No server key found. Creating one..."
            npx @crossmint/cli keys create 2>&1
            SERVER_KEY=$(npx @crossmint/cli keys list server 2>/dev/null | grep -o 'sk_[a-zA-Z0-9_]*' | head -1 || true)
        fi
        [ -n "$SERVER_KEY" ] && ENV_CONTENT+="$SERVER_VAR=$SERVER_KEY"$'\n'
    fi
fi

# Write .env.local if we have new content
if [ -n "$ENV_CONTENT" ]; then
    echo "$ENV_CONTENT" > "$ENV_FILE"
    echo "API keys saved to $ENV_FILE"
fi

# Manual fallback if keys are still missing after CLI flow
MISSING_KEYS=false

if [ "$NEED_CLIENT" = true ] && ! grep -q "$CLIENT_VAR=" "$ENV_FILE" 2>/dev/null; then
    echo ""
    echo "Could not retrieve client key automatically."
    echo "Get your client key from: https://staging.crossmint.com/console/projects/apiKeys"
    if [ -t 0 ]; then
        read -p "Paste client API key: " CLIENT_KEY
        echo "$CLIENT_VAR=$CLIENT_KEY" >> "$ENV_FILE"
    else
        MISSING_KEYS=true
    fi
fi

if [ "$NEED_SERVER" = true ] && ! grep -q "$SERVER_VAR=" "$ENV_FILE" 2>/dev/null; then
    echo ""
    echo "Could not retrieve server key automatically."
    echo "Get your server key from: https://staging.crossmint.com/console/projects/apiKeys"
    if [ -t 0 ]; then
        read -p "Paste server API key: " SERVER_KEY
        echo "$SERVER_VAR=$SERVER_KEY" >> "$ENV_FILE"
    else
        MISSING_KEYS=true
    fi
fi

if [ "$MISSING_KEYS" = true ]; then
    echo ""
    echo "Non-interactive terminal — cannot prompt for keys."
    echo "Set the missing key(s) in your environment and re-run:"
    echo ""
    [ "$NEED_CLIENT" = true ] && ! grep -q "$CLIENT_VAR=" "$ENV_FILE" 2>/dev/null && echo "  export $CLIENT_VAR=ck_staging_..."
    [ "$NEED_SERVER" = true ] && ! grep -q "$SERVER_VAR=" "$ENV_FILE" 2>/dev/null && echo "  export $SERVER_VAR=sk_staging_..."
    echo "  ./setup.sh $QUICKSTART"
    echo ""
    exit 1
fi

# ============================================
# Validate key format
# ============================================

if [ -f "$ENV_FILE" ]; then
    if [ "$NEED_CLIENT" = true ]; then
        CONFIGURED_KEY=$(grep "$CLIENT_VAR=" "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2)
        if [ -n "$CONFIGURED_KEY" ] && [[ ! "$CONFIGURED_KEY" =~ ^ck_ ]]; then
            echo "Warning: Client key does not start with 'ck_' — it may be invalid."
            echo "Expected format: ck_staging_..."
            echo ""
        fi
    fi
    if [ "$NEED_SERVER" = true ]; then
        CONFIGURED_KEY=$(grep "$SERVER_VAR=" "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2)
        if [ -n "$CONFIGURED_KEY" ] && [[ ! "$CONFIGURED_KEY" =~ ^sk_ ]]; then
            echo "Warning: Server key does not start with 'sk_' — it may be invalid."
            echo "Expected format: sk_staging_..."
            echo ""
        fi
    fi
fi

# ============================================
# Summary
# ============================================

echo "====================================="
echo "  $NAME"
if [ -f "$ENV_FILE" ]; then
    if [ "$NEED_CLIENT" = true ]; then
        KEY_PREVIEW=$(grep "$CLIENT_VAR=" "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2 | cut -c1-20)
        [ -n "$KEY_PREVIEW" ] && echo "  Client key: ${KEY_PREVIEW}..."
    fi
    if [ "$NEED_SERVER" = true ]; then
        KEY_PREVIEW=$(grep "$SERVER_VAR=" "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2 | cut -c1-20)
        [ -n "$KEY_PREVIEW" ] && echo "  Server key: ${KEY_PREVIEW}..."
    fi
fi
echo "  Env file:   $ENV_FILE"
echo "====================================="
echo ""

# ============================================
# PLATFORM-SPECIFIC: Delegate or default
# ============================================

if [ -f "$APP_DIR/setup.sh" ]; then
    # Delegate to local setup script (Swift, Kotlin, etc.)
    echo "Running platform-specific setup..."
    cd "$APP_DIR"
    ./setup.sh
else
    # Default: Node.js flow
    if ! command -v pnpm &> /dev/null; then
        echo "Installing pnpm..."
        npm install -g pnpm
    fi

    echo "Installing dependencies..."
    pnpm install

    echo ""
    echo "Starting dev server..."
    cd "$APP_DIR"
    pnpm dev
fi
