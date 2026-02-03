#!/bin/bash
set -e

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

# Check for existing keys
if [ "$NEED_CLIENT" = true ]; then
    CLIENT_KEY="${!CLIENT_VAR}"
    if [ -n "$CLIENT_KEY" ] && [ "$CLIENT_KEY" != "your_client_api_key_here" ]; then
        echo "Using client key from environment"
        ENV_CONTENT+="$CLIENT_VAR=$CLIENT_KEY"$'\n'
    elif [ -f "$ENV_FILE" ] && grep -q "$CLIENT_VAR=" "$ENV_FILE" && ! grep -q "your_client_api_key_here" "$ENV_FILE"; then
        echo "Using existing client key"
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
        echo "Using existing server key"
    else
        NEED_LOGIN=true
    fi
fi

# Login and retrieve keys if needed
if [ "$NEED_LOGIN" = true ]; then
    echo "Opening browser to log in to Crossmint..."
    npx @crossmint/cli login

    echo "Retrieving API keys..."

    if [ "$NEED_CLIENT" = true ] && [ -z "$CLIENT_KEY" ]; then
        CLIENT_KEY=$(npx @crossmint/cli keys list client 2>/dev/null | grep -o 'ck_[a-zA-Z0-9_]*' | head -1 || true)
        if [ -z "$CLIENT_KEY" ]; then
            echo "Creating new client key..."
            npx @crossmint/cli keys create 2>&1
            CLIENT_KEY=$(npx @crossmint/cli keys list client 2>/dev/null | grep -o 'ck_[a-zA-Z0-9_]*' | head -1 || true)
        fi
        [ -n "$CLIENT_KEY" ] && ENV_CONTENT+="$CLIENT_VAR=$CLIENT_KEY"$'\n'
    fi

    if [ "$NEED_SERVER" = true ] && [ -z "$SERVER_KEY" ]; then
        SERVER_KEY=$(npx @crossmint/cli keys list server 2>/dev/null | grep -o 'sk_[a-zA-Z0-9_]*' | head -1 || true)
        if [ -z "$SERVER_KEY" ]; then
            echo "Creating new server key..."
            npx @crossmint/cli keys create 2>&1
            SERVER_KEY=$(npx @crossmint/cli keys list server 2>/dev/null | grep -o 'sk_[a-zA-Z0-9_]*' | head -1 || true)
        fi
        [ -n "$SERVER_KEY" ] && ENV_CONTENT+="$SERVER_VAR=$SERVER_KEY"$'\n'
    fi
fi

# Write .env.local if we have new content
if [ -n "$ENV_CONTENT" ]; then
    echo "$ENV_CONTENT" > "$ENV_FILE"
    echo "API keys saved"
fi

# Manual fallback for missing keys
if [ "$NEED_CLIENT" = true ] && ! grep -q "$CLIENT_VAR=" "$ENV_FILE" 2>/dev/null; then
    echo ""
    echo "Get your client key from: https://staging.crossmint.com/console/projects/apiKeys"
    read -p "Paste client API key: " CLIENT_KEY
    echo "$CLIENT_VAR=$CLIENT_KEY" >> "$ENV_FILE"
fi

if [ "$NEED_SERVER" = true ] && ! grep -q "$SERVER_VAR=" "$ENV_FILE" 2>/dev/null; then
    echo ""
    echo "Get your server key from: https://staging.crossmint.com/console/projects/apiKeys"
    read -p "Paste server API key: " SERVER_KEY
    echo "$SERVER_VAR=$SERVER_KEY" >> "$ENV_FILE"
fi

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
