# CLAUDE.md - Session Instructions

> **READ THIS FIRST** when starting any session on this project.

## Project Overview

Converting https://lex.virtual-efficiency.nl/ (WordPress) to Eleventy static site.

**Human**: Pro subscription user, cost-conscious  
**Supervisor**: Opus 4.5 (strategic decisions only)  
**Worker**: You (Sonnet/Haiku) - execute specific tasks

---

## Current Status

**Phase**: [✓] Setup → [▶] Baseline → [ ] Conversion → [ ] Refinement → [ ] CMS → [ ] Done

**Last Updated**: 2025-12-29

**Last Completed Task**:
- Generated package-lock.json and committed to main
- Project scaffold verified with Eleventy 3.1.2
- Bootstrap script configured and tested

**Current Task**:
- Waiting for "Capture Baseline Screenshots" workflow to complete
- Once baseline is captured, begin page conversion starting with high-priority pages

**Blockers**:
- None - baseline workflow is running

---

## Session Startup Checklist

```bash
# 1. Navigate to project
cd lex-ssg-migration

# 2. Run bootstrap script
./bootstrap.sh

# 3. Check git status
git status
git log --oneline -5

# 4. Check latest Actions run
# Visit: https://github.com/[OWNER]/lex-ssg-migration/actions

# 5. Read current task above, then execute
```

---

## Environment Notes

- **Node.js**: v20 LTS (via nvm)
- **Package Manager**: npm
- **SSG**: Eleventy 3.x
- **Screenshots**: Playwright (run in Actions, NOT in CCW)
- **Diff Tool**: pixelmatch (run in Actions, NOT in CCW)

---

## DO NOT Do in CCW (expensive)

1. ❌ Run `wget` to mirror the site
2. ❌ Run Playwright screenshots
3. ❌ Run comparison scripts
4. ❌ Install large npm packages unnecessarily
5. ❌ Long-running processes

## DO in CCW (efficient)

1. ✅ Edit templates (.njk files)
2. ✅ Edit content (.md files)
3. ✅ Edit configuration files
4. ✅ Small, focused code changes
5. ✅ Commit and push

---

## File Locations

| What | Where |
|------|-------|
| Eleventy config | `.eleventy.js` |
| Templates | `src/_includes/layouts/` |
| Partials | `src/_includes/partials/` |
| Content pages | `src/content/` |
| Original CSS | `src/assets/css/` |
| Original images | `src/assets/images/` |
| Comparison scripts | `scripts/` |
| GitHub Actions | `.github/workflows/` |
| Decap CMS | `admin/` |

---

## Git Workflow

```bash
# After making changes:
git add -A
git commit -m "type: description"
# Types: feat, fix, style, refactor, docs, chore

git push origin main
# This triggers Actions: build → screenshot → compare → deploy
```

---

## Checking Results

After pushing, wait for Actions to complete (~3-5 min), then:

1. **View deployed site**: https://[OWNER].github.io/lex-ssg-migration/
2. **View comparison report**: https://[OWNER].github.io/lex-ssg-migration/compare/
3. **View Actions logs**: https://github.com/[OWNER]/lex-ssg-migration/actions

The comparison report is mobile-friendly — bookmark `/compare/` for easy access!

---

## Comparison Report Interpretation

The report shows pixel diff percentages:

| Diff % | Meaning | Action |
|--------|---------|--------|
| 0-1% | Excellent | Minor tweaks only |
| 1-2% | Good | Acceptable, review specific areas |
| 2-5% | Needs work | Identify and fix major issues |
| 5%+ | Significant | Template or CSS problem |

Focus on the **largest diffs first** - they indicate the biggest visual problems.

---

## Common Tasks

### Task: Fix header styling
```bash
# Edit the header partial
nano src/_includes/partials/header.njk
# Or edit CSS
nano src/assets/css/style.css
```

### Task: Convert a new page
```bash
# 1. Look at mirror HTML structure
# 2. Create markdown file with front matter
nano src/content/[page-name].md

# Front matter template:
---
layout: layouts/page.njk
title: "Page Title"
description: "Meta description"
permalink: /[url-path]/
---
```

### Task: Update Eleventy config
```bash
nano .eleventy.js
```

---

## Session End Checklist

Before ending session:

1. [ ] All changes committed
2. [ ] Changes pushed to origin
3. [ ] Updated "Current Status" section above
4. [ ] Updated "Last Completed Task"
5. [ ] Set "Current Task" for next session
6. [ ] Note any blockers

---

## Escalation

If you encounter:
- Architectural decisions → Ask human to consult Opus
- Complex debugging → Ask human to consult Opus
- Unclear requirements → Ask human for clarification
- Actions failures → Check logs, fix if simple, escalate if complex

---

## Project-Specific Notes

### Target Site: lex.virtual-efficiency.nl

Dutch healthcare psychologist website. Key considerations:
- Professional, clean design
- Blue/white color scheme
- Must maintain trust signals (registrations, certifications)
- WhatsApp integration for appointments
- Cookie consent (simplify or remove)

### URL Structure

Keep identical to original for SEO:
- `/` → homepage
- `/over-mij/` → about
- `/behandeling/` → treatment
- etc.

---

## Contact

Repository owner: [OWNER]
Questions/escalation: Update this file with questions, commit, and notify human.
