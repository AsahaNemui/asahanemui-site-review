# asahanemui-site-review

Public code-review snapshot for [asaha-nemui.com](https://asaha-nemui.com/).

This repository exists only so external code-review tools can inspect the site's HTML/CSS/JavaScript implementation.

## Included
- public-facing page generator/source
- public CSS and JavaScript
- public content data needed to understand rendering
- package metadata needed to understand the build

## Intentionally excluded
- original/high-resolution artwork and video
- `private/`
- admin UI and protected form-management code
- Cloudflare secrets, credentials and account configuration
- deployment/admin/security-maintenance scripts
- generated `dist/` output

This is a **review snapshot**, not the production source of truth. The private repository remains authoritative.

## Suggested review scope
Please review:
1. HTML structure and semantic/accessibility issues
2. CSS responsive behavior, overflow, spacing and mobile readability
3. JavaScript runtime errors, race conditions and interaction bugs
4. navigation/link consistency
5. SEO/meta implementation
6. performance and maintainability
7. any implementation that can visibly fail for real users

Do not assume this repository contains private backend/admin implementation or original media assets.
