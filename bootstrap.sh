#!/bin/bash
# bootstrap.sh - Environment setup for Claude Code Web sessions
# Run this at the start of every CCW session

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Lex SSG Migration - Environment Bootstrap                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
status() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# 1. Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    status "Node.js installed: $NODE_VERSION"
else
    warn "Node.js not found, installing via nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 20
    nvm use 20
    status "Node.js installed: $(node --version)"
fi

# 2. Check npm
echo ""
echo "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    status "npm installed: $NPM_VERSION"
else
    error "npm not found - this shouldn't happen if Node.js is installed"
    exit 1
fi

# 3. Install dependencies (if package.json exists)
echo ""
echo "Installing dependencies..."
if [ -f "package.json" ]; then
    npm install --silent
    status "Dependencies installed"
else
    warn "No package.json found - skipping npm install"
fi

# 4. Check git status
echo ""
echo "Git status..."
if git rev-parse --is-inside-work-tree &> /dev/null; then
    BRANCH=$(git branch --show-current)
    REMOTE=$(git remote get-url origin 2>/dev/null || echo "no remote")
    status "Git repository: $REMOTE"
    status "Current branch: $BRANCH"
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        warn "Uncommitted changes detected:"
        git status --short
    else
        status "Working tree clean"
    fi
else
    warn "Not a git repository"
fi

# 5. Verify project structure
echo ""
echo "Verifying project structure..."

REQUIRED_DIRS=("src" "src/_includes" "src/content" "scripts" ".github/workflows")
MISSING_DIRS=()

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        status "Directory exists: $dir"
    else
        MISSING_DIRS+=("$dir")
        warn "Directory missing: $dir"
    fi
done

if [ ${#MISSING_DIRS[@]} -gt 0 ]; then
    echo ""
    warn "Creating missing directories..."
    for dir in "${MISSING_DIRS[@]}"; do
        mkdir -p "$dir"
        status "Created: $dir"
    done
fi

# 6. Check Eleventy installation
echo ""
echo "Checking Eleventy..."
if npx eleventy --version &> /dev/null 2>&1; then
    ELEVENTY_VERSION=$(npx eleventy --version 2>/dev/null)
    status "Eleventy available: $ELEVENTY_VERSION"
else
    warn "Eleventy not installed - will be installed with npm install"
fi

# 7. Display current task from CLAUDE.md
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  CURRENT TASK                                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
if [ -f "CLAUDE.md" ]; then
    # Extract current task section
    sed -n '/\*\*Current Task\*\*:/,/\*\*Blockers\*\*:/p' CLAUDE.md | head -n -1
else
    warn "CLAUDE.md not found - check project setup"
fi

# 8. Summary
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  BOOTSTRAP COMPLETE                                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Quick commands:"
echo "  npm run dev      - Start Eleventy dev server"
echo "  npm run build    - Build site"
echo "  git push         - Push changes (triggers Actions)"
echo ""
echo "Remember: Don't run wget or Playwright in CCW - let Actions do it!"
echo ""

# 9. Optional: Start dev server reminder
read -p "Start Eleventy dev server? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run dev
fi
