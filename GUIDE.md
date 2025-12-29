# AI-Assisted WordPress to Eleventy Migration Guide

## Project: lex.virtual-efficiency.nl → Static Site Generator

This guide documents a cost-efficient workflow for converting a WordPress site to Eleventy using Claude Code Web (CCW), with GitHub Actions handling heavy computation and Opus 4.5 as supervisor while Sonnet/Haiku execute tasks.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         COST OPTIMIZATION STRATEGY                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐     Supervise      ┌──────────────────────────────┐  │
│   │  Opus 4.5    │ ◄─────────────────► │  Human (Pro Subscription)    │  │
│   │  Supervisor  │     Review/Guide    │  Decision Maker              │  │
│   └──────┬───────┘                     └──────────────────────────────┘  │
│          │                                                               │
│          │ Delegate tasks via CLAUDE.md instructions                     │
│          ▼                                                               │
│   ┌──────────────┐                                                       │
│   │ Sonnet 4.5   │ ◄──── Execute conversion, fix templates, iterate     │
│   │ Worker       │                                                       │
│   └──────┬───────┘                                                       │
│          │                                                               │
│          │ Commit & Push                                                 │
│          ▼                                                               │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                    GitHub Actions (FREE)                          │  │
│   │  • wget mirror capture                                            │  │
│   │  • Playwright screenshots (baseline + current)                    │  │
│   │  • Pixel comparison & diff generation                             │  │
│   │  • Deploy to GitHub Pages                                         │  │
│   │  • Store artifacts in orphan branch                               │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Why This Architecture?

| Component | Cost | Purpose |
|-----------|------|---------|
| Opus 4.5 | High | Strategic decisions, complex debugging, guide creation |
| Sonnet 4.5 | Medium | Template creation, content conversion, iterative fixes |
| Haiku 4.5 | Low | Simple file edits, repetitive tasks, bulk operations |
| GitHub Actions | FREE | Screenshots, comparisons, deployment (2000 min/month private, unlimited public) |

---

## Repository Structure

```
lex-ssg-migration/
├── .github/
│   └── workflows/
│       ├── capture-baseline.yml      # One-time: capture original site
│       ├── compare-and-deploy.yml    # On push: build, screenshot, diff, deploy
│       └── scheduled-mirror.yml      # Weekly: keep mirror fresh
├── admin/
│   ├── index.html                    # Decap CMS entry point
│   └── config.yml                    # Decap CMS configuration
├── comparison/
│   ├── baseline/                     # Screenshots of original site (git-ignored, in orphan branch)
│   ├── current/                      # Screenshots of built site
│   ├── diffs/                        # Visual diff images
│   └── report.html                   # Comparison report
├── scripts/
│   ├── capture-screenshots.js        # Playwright screenshot script
│   ├── compare-screenshots.js        # Pixel diff script
│   └── generate-report.js            # HTML report generator
├── mirror/                           # wget mirror (git-ignored, cached in Actions)
├── src/
│   ├── _data/                        # Global data files
│   │   └── site.json
│   ├── _includes/
│   │   ├── layouts/
│   │   │   ├── base.njk              # Base HTML template
│   │   │   ├── page.njk              # Standard page layout
│   │   │   └── home.njk              # Homepage layout
│   │   └── partials/
│   │       ├── header.njk
│   │       ├── footer.njk
│   │       └── nav.njk
│   ├── assets/
│   │   ├── css/                      # Original CSS (copied from mirror)
│   │   ├── images/                   # Original images
│   │   └── js/                       # Original JS
│   └── content/
│       ├── index.md                  # Homepage
│       ├── over-mij.md
│       ├── contact.md
│       └── ...                       # Other pages
├── .eleventy.js                      # Eleventy configuration
├── .gitignore
├── bootstrap.sh                      # Environment setup script
├── CLAUDE.md                         # Instructions for Claude instances
├── GUIDE.md                          # This file
├── package.json
├── viewports.json                    # Screenshot viewport definitions
└── urls.json                         # URLs to capture/compare
```

---

## Phase 1: Initial Setup

### 1.1 Create Empty GitHub Repository

```bash
# On GitHub: Create new repository "lex-ssg-migration"
# Settings → Pages → Enable GitHub Pages from "gh-pages" branch
```

### 1.2 Bootstrap in Claude Code Web

When starting a new CCW session, the worker Claude should:

1. Clone the repository
2. Run `./bootstrap.sh`
3. Read `CLAUDE.md` for current task context

The bootstrap script ensures consistent environment across sessions.

---

## Phase 2: GitHub Actions Workflows

### Why Actions Instead of CCW?

| Task | CCW Time | Actions Time | CCW Cost | Actions Cost |
|------|----------|--------------|----------|--------------|
| wget mirror (full site) | ~5 min | ~2 min | Tokens | FREE |
| Playwright screenshots (20 pages × 5 viewports) | ~10 min | ~3 min | Tokens | FREE |
| Pixel comparison | ~5 min | ~1 min | Tokens | FREE |
| Build & Deploy | ~2 min | ~1 min | Tokens | FREE |

**Total savings: ~20 minutes of expensive CCW token time per iteration**

### Artifact Storage Strategy

Screenshots and diffs are stored in an orphan branch `comparison-artifacts`:
- Doesn't pollute main branch history
- Accessible for review
- Can be pruned periodically

---

## Phase 3: Iterative Conversion Workflow

### Supervisor (Opus 4.5) Tasks:
1. Review comparison reports
2. Identify highest-impact issues
3. Write specific fix instructions in CLAUDE.md
4. Make architectural decisions

### Worker (Sonnet/Haiku) Tasks:
1. Run `./bootstrap.sh`
2. Read CLAUDE.md for current task
3. Execute the specific fix
4. Commit and push
5. Wait for Actions to complete
6. Report results

### Iteration Cycle:

```
┌─────────────────┐
│ Sonnet makes    │
│ changes         │
└────────┬────────┘
         │ git push
         ▼
┌─────────────────┐
│ GitHub Actions: │
│ • Build site    │
│ • Screenshots   │
│ • Compare       │
│ • Deploy        │
└────────┬────────┘
         │ Results in orphan branch
         ▼
┌─────────────────┐
│ Human/Opus      │
│ reviews report  │
└────────┬────────┘
         │ Update CLAUDE.md with next task
         ▼
┌─────────────────┐
│ Next iteration  │
└─────────────────┘
```

---

## Phase 4: Comparison Thresholds

Target metrics for "done":

| Viewport | Max Pixel Diff | Notes |
|----------|----------------|-------|
| Mobile (375px) | < 2% | Critical - most traffic |
| Tablet (768px) | < 2% | |
| Desktop (1024px) | < 1% | Primary design target |
| Wide (1440px) | < 1% | |
| Ultra-wide (1920px) | < 2% | Edge case |

When all pages meet these thresholds, visual migration is complete.

---

## Phase 5: Decap CMS Integration

After visual parity is achieved:

1. Configure Decap CMS in `/admin/`
2. Set up GitHub OAuth or Git Gateway
3. Test content editing workflow
4. Document for site owner

---

## Phase 6: Production Deployment (Future)

When ready for Bunny.net:
1. Build static site
2. Upload to Bunny.net Storage
3. Configure CDN
4. Update DNS
5. (Optional) Migrate Decap to edge scripts

---

## CCW Session Best Practices

### Starting a Session

```bash
# Always start with:
git clone https://github.com/[user]/lex-ssg-migration.git
cd lex-ssg-migration
./bootstrap.sh
cat CLAUDE.md  # Read current task
```

### Ending a Session

```bash
# Always end with:
git add -A
git commit -m "descriptive message"
git push
# Then update CLAUDE.md with status/next steps
```

### Avoiding Token Waste

1. **Don't run wget in CCW** - Let Actions do it
2. **Don't run Playwright in CCW** - Let Actions do it
3. **Don't generate screenshots in CCW** - Let Actions do it
4. **DO use CCW for**: Template editing, content conversion, config changes

---

## Troubleshooting

### GitHub CLI (gh) in CCW

The `gh` CLI may not be authenticated in CCW. Workarounds:
- Use git with HTTPS + token
- Use GitHub API directly with curl
- Pre-configure repository secrets

### Session State Lost

If a session dies unexpectedly:
1. All committed work is safe in git
2. Run bootstrap.sh in new session
3. Check CLAUDE.md for last known state
4. Check Actions for latest comparison results

### Actions Failing

Common issues:
- Playwright browser install: ensure `npx playwright install chromium` runs
- Node version: pin to LTS in workflow
- Timeout: increase for slow pages

---

## Site-Specific Notes: lex.virtual-efficiency.nl

### Pages to Convert

| URL Path | Priority | Notes |
|----------|----------|-------|
| `/` | High | Homepage, hero section |
| `/over-mij/` | High | About page |
| `/behandeling/` | High | Main service page |
| `/aanmelding/` | Medium | Registration info |
| `/tarieven-en-vergoeding/` | Medium | Pricing |
| `/cursussen/` | Medium | Courses |
| `/werkwijze/` | Medium | Methodology |
| `/werk/` | Medium | Work psychology |
| `/sport/` | Medium | Sports psychology |
| `/gezondheid/` | Medium | Health |
| `/running-therapie/` | Medium | Running therapy |
| `/contact/` | High | Contact form |
| `/privacy/` | Low | Legal |
| `/disclaimer/` | Low | Legal |
| `/kwaliteitsstatuut/` | Low | Quality certification |

### Special Elements

- **Cookie consent banner**: Skip or use simple alternative (Complianz replacement)
- **WhatsApp integration**: Preserve links to `wa.me/31626838558`
- **PDF downloads**: Copy to assets, update links
- **Contact form**: Replace with Formspree or similar

### Design Characteristics

- Clean, professional healthcare design
- Blue/white color scheme
- Responsive layout
- Hero images
- Card-based sections

---

## Success Criteria

- [ ] All pages converted to Markdown
- [ ] Visual diff < 2% on all viewports
- [ ] All internal links working
- [ ] Images optimized and loading
- [ ] Contact form functional
- [ ] Decap CMS configured
- [ ] GitHub Pages deployment working
- [ ] Documentation complete

---

## Next Steps After This Guide

1. Human creates GitHub repository
2. Human runs initial capture-baseline workflow
3. Sonnet begins template extraction
4. Iterative refinement until thresholds met
5. Decap CMS integration
6. Handoff to production
