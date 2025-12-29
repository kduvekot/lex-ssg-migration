# Lex Duvekot - WordPress to Eleventy Migration

AI-assisted migration of [lex.virtual-efficiency.nl](https://lex.virtual-efficiency.nl) from WordPress to Eleventy static site.

## Quick Start

1. **Create GitHub repository** named `lex-ssg-migration`

2. **Push this project**:
   ```bash
   git init
   git add -A
   git commit -m "Initial commit: migration scaffold"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/lex-ssg-migration.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: "GitHub Actions"

4. **Capture baseline screenshots**:
   - Go to Actions tab
   - Click "Capture Baseline Screenshots"
   - Click "Run workflow"
   - Wait ~5 minutes

5. **Start iterating!**
   - Push changes → Actions builds & compares → Review at `/compare/`

## URLs After Setup

| What | URL |
|------|-----|
| Deployed site | `https://YOUR_USERNAME.github.io/lex-ssg-migration/` |
| Comparison report | `https://YOUR_USERNAME.github.io/lex-ssg-migration/compare/` |
| Actions | `https://github.com/YOUR_USERNAME/lex-ssg-migration/actions` |

## Documentation

- **[GUIDE.md](./GUIDE.md)** - Complete methodology and architecture
- **[CLAUDE.md](./CLAUDE.md)** - Session instructions for AI workers

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Architecture

```
Human (Pro subscriber)
    ↓ Strategic decisions
Opus 4.5 (Supervisor)
    ↓ Task instructions via CLAUDE.md
Sonnet/Haiku (Worker in Claude Code Web)
    ↓ Commits & pushes
GitHub Actions (FREE)
    → wget mirror
    → Playwright screenshots
    → Pixel comparison
    → Deploy to Pages
    ↓
Review comparison report on mobile 📱
```

## License

MIT
