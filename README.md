# ASTechno website

The static website for **astechno.dev**, introducing the upcoming Decisphere product. No runtime dependencies, external fonts, analytics, forms, or backend services are required.

## Local development

Use Node.js 22 or later. No dependency installation is needed:

```text
node tools/build.mjs
node tools/preview.mjs
```

Open http://127.0.0.1:8088. Stop the preview with Ctrl+C. An optional `PORT` environment variable changes the port. The preview binds only to local loopback and serves an explicit list of public files.

The existing Windows preview helper also supports language directories:

```powershell
.\serve.ps1 -Root .\dist -Port 8080
```

The Node helper was used for this redesign's browser verification; the PowerShell helper was syntax-checked but could not run in the restricted execution environment.

## Editing and building

- Edit `src/page.html` for shared structure and `src/translations.mjs` for English, Dutch, Arabic, and German copy, including labels and metadata.
- Edit `styles.css` for presentation. `script.js` preserves the current section when following a language link and keeps the copyright year current.
- Run `node tools/build.mjs` after edits. It regenerates `index.html`, `nl/index.html`, `ar/index.html`, `de/index.html`, `robots.txt`, and `sitemap.xml`, then packages the public files into ignored `dist/`.
- Do not edit generated pages directly. `node tools/build.mjs --check` detects stale output.

Localized pages have their own canonical URL, reciprocal hreflang links, Open Graph/Twitter metadata, and localized WebPage structured data. All content and language navigation work as ordinary static HTML. The locale URL survives reloads and can be shared; language selection no longer depends on local storage. Arabic uses RTL layout and isolated LTR company identifiers.

The old `#building` and `#company` anchors remain available. The Decisphere navigation link targets the hero's teaser figure at `#decisphere`, which can receive keyboard focus. There are no hero or body calls to action. The footer contains the only contact link, `mailto:contact@astechno.dev`, with a localized Say hello label. Back to top targets the header at `#top`.

## Assets and visual design

`logo-nav.png` is the original ASTechno asset, unchanged. `new_logo.png` is retained in the repository but is unused and excluded from `dist/`.

`assets/decisphere-logo.png` is an unmodified copy of the authentic `assets/brand/decisphere_logo.png` from the existing Flutter project. SHA-256:

```text
eaf2833031a2140b76cc80fe1a1ce71122eb94d42119c0f5866a91aad63635a0
```

Both original logo files remain byte-for-byte unchanged. CSS crops the company lockup to show its authentic symbol beside the visible label ASTechno. It also crops the Decisphere image to its symbol above the wordmark. This symbol is upright, charcoal and subtly blurred, directly on the page's ivory background. A single localized Coming soon label sits above it, in an orange variant chosen for readable contrast. A discreet Decisphere caption sits beneath it as readable text, outside the cropped graphic. The teaser has no card background, border, shadow, ribbon or added ornament.

There are two visible Decisphere references per page: the navigation link and teaser caption. The hero retains its headline and the English description, "A different approach to deciding what to cook.", with localized equivalents. The entire product-explanation section and its three benefit columns are removed. Capability claims are also removed from localized metadata. The company section follows the hero directly, without the removed section's spacing. The verified footer details are preserved.

Warm ivory, white, charcoal and orange form the palette; darker rust and muted brown provide accessible text contrast. Small labels and business details use larger text. The teaser is static, and reduced-motion preferences also disable transitions and smooth scrolling. The copyright year is generated at build time and refreshed in the browser.

## Validation

```text
node --test tests/site.test.mjs
node tools/build.mjs --check
node --check script.js
node --check tools/build.mjs
node --check tools/preview.mjs
```

Optional development-only tools, run temporarily without adding dependencies to the website:

```text
pnpm dlx prettier@3.9.10 --check styles.css script.js src/page.html src/translations.mjs tools/*.mjs tests/*.mjs eslint.config.mjs package.json .htmlvalidate.json README.md
pnpm dlx eslint@10.13.0 .
pnpm dlx html-validate@11.17.0 index.html nl/index.html ar/index.html de/index.html
```

The HTML validator's casing and void-element style settings match Prettier; its recommended semantic/accessibility checks remain enabled.

The 13 focused tests cover translation completeness, static localized content, metadata, direction, local links/assets, unique anchor IDs, label references, company identity, removal of personal names and unsupported launch claims, escaped content, both original logos' integrity, text contrast, a single localized Coming soon label, the teaser caption and navigation target, removal of product explanations and capability claims, no body calls to action, exactly two visible product-name mentions, a single footer email link, header branding and the current copyright year.

The final content-pass browser review covered all four languages at 320, 390, 768 and 1280 CSS pixels. All 16 combinations had no page overflow or broken images, no body links/buttons or product-explanation section, a status label above the symbol, and a centered caption beneath it. Computed styles confirmed a transparent teaser background, zero border and no shadow. Desktop, tablet and Arabic mobile views were inspected. Keyboard activation of the Decisphere link focused the teaser with a visible focus indicator, and language switching preserved that target. Back to top also passed. No console errors or warnings were observed. The earlier refinement additionally checked company and skip navigation. This is focused verification, not a full assistive-technology or cross-browser certification. Reduced-motion rules remain unchanged; OS-level preference emulation was unavailable in the browser tool.

## Company disclosures — owner decision still outstanding

Preserved from the existing site:

- Registered name: AS Technology V.O.F.
- Trading name: ASTechno
- KvK: 99714922
- VAT identification number: NL869102801B01
- Email: contact@astechno.dev

Founders' personal names are removed from generated public text, metadata, and structured data. No confirmed requirement to display those names was identified for this Dutch company teaser.

The original site supplied no business address or additional rapid-contact method. On 25 October 2026 the owner said these are not yet available and instructed that they be skipped. No address or phone number has been inferred or published. This leaves a disclosure gap to resolve before a production release is treated as legally complete.

The Netherlands Enterprise Agency's [business correspondence guidance](https://business.gov.nl/regulations/rules-business-correspondence/) calls for business identity, physical-address details (with an exception for a visiting address shielded in the Business Register), and contact details such as email plus phone or chat. No shielding status has been confirmed here. [EU e-commerce Directive Article 5](https://eur-lex.europa.eu/eli/dir/2000/31/oj) also addresses provider identity, geographic address, effective direct contact, register information and applicable VAT identification. [CJEU case C-298/07](https://eur-lex.europa.eu/legal-content/SL-EN/TXT/?from=SL&uri=CELEX%3A62007CJ0298) explains that additional rapid-contact information need not necessarily be a telephone number. These sources were reviewed on 25 October 2026; the implementation does not assert legal compliance.

## Release setup and handoff

The inspected source was the clean `C:\Site` repository, remote `https://github.com/Asaaf-debug/astechno-site.git`, at `30ea735ea39ebb905cc5f0f517ce1355e021b807`. Its local and remote `main` matched when inspected. Work is isolated on `codex/astechno-redesign`; the original checkout and the Decisphere app/backend repositories were not modified.

No deployment workflow, hosting manifest, or domain configuration is present in the repository. The public GitHub metadata reported `has_pages: false`. The production domain could not be resolved from the inspection environment, so live parity and hosting behavior could not be verified. The owner must confirm the actual hosting provider, intended release branch/process, and production approval before any push or deployment.

The generated pages are checked in at the repository root to remain compatible with simple static hosting. Prefer publishing only the contents of `dist/` when the release workflow is confirmed. The host needs ordinary directory index handling for `/nl/`, `/ar/`, and `/de/`, and should redirect their slashless forms to the trailing-slash URL. No SPA fallback is needed. Do not upload source, tests, or local QA evidence as part of a `dist/` release.

## Exact redesign file list

Modified:

- `index.html` — generated English homepage, SEO and organization metadata.
- `styles.css` — responsive warm visual system, teaser, focus and motion treatment, RTL.
- `script.js` — minimal enhancement preserving section anchors between languages.
- `serve.ps1` — directory indexes/redirects for locale pages and stricter root containment.
- `README.md` — editing, verification, provenance, legal gaps and release notes.

Added:

- `src/page.html`, `src/translations.mjs` — shared page source and all four language dictionaries.
- `nl/index.html`, `ar/index.html`, `de/index.html` — generated localized pages.
- `assets/decisphere-logo.png` — authentic, unchanged product logo.
- `tools/build.mjs`, `tools/preview.mjs` — dependency-free static build and local preview.
- `tests/site.test.mjs` — focused regression tests.
- `robots.txt`, `sitemap.xml` — crawler guidance and multilingual sitemap.
- `package.json`, `.gitignore`, `.gitattributes`, `eslint.config.mjs`, `.htmlvalidate.json` — development commands, output exclusions, consistent text line endings and validation configuration.

`dist/` is generated, ignored output. `.qa/` contains ignored local visual evidence. Neither is a source change.

## Teaser-first refinement file list

Relative to the preceding local refinement, this pass changed only:

- `src/page.html` — removes the hero CTA and repetitive labels; moves Coming soon above a borderless symbol; simplifies the product heading.
- `src/translations.mjs` — shorter hero, product, benefit and company copy in all four languages, plus quieter metadata.
- `styles.css` — integrated charcoal symbol on ivory; no card/ribbon/button styles; balanced desktop and mobile spacing.
- `tests/site.test.mjs` — acceptance checks for no body CTAs, one status label and reduced product naming.
- `index.html`, `nl/index.html`, `ar/index.html`, `de/index.html` — regenerated localized output.
- `README.md` — current editing, verification and handoff notes.

The original assets, browser script, build helper, server helpers, dependencies and release configuration were preserved. Local screenshots and layout evidence are in ignored `.qa/teaser-first/`; `.qa/teaser-first-before/` retains the previous website for comparison. The missing business address and additional rapid-contact method remain the disclosure gap described above, in line with the owner's earlier instruction to omit them until available. The refinement is ready for final visual review; nothing has been pushed, published or deployed.

## Final content-simplification file list

Relative to the teaser-first refinement, this pass changed only:

- `src/page.html` — removes the complete product-explanation section; places a readable Decisphere caption beneath the symbol; moves `#decisphere` to the focusable hero teaser.
- `src/translations.mjs` — updates hero copy, footer greeting and descriptive metadata in all four languages; removes unused product-capability copy.
- `styles.css` — styles the discreet caption, adjusts teaser spacing and removes unused product-section rules.
- `tests/site.test.mjs` — updates existing checks for the teaser target, caption and absence of product explanations/capability claims.
- `index.html`, `nl/index.html`, `ar/index.html`, `de/index.html` — regenerated localized pages.
- `README.md` — current content, navigation, verification and file-change notes.

Build, generated-output checks, all 13 tests, formatting, ESLint and HTML validation passed. Screenshots and the 16 responsive checks are retained locally in ignored `.qa/content-final/`; the preceding files are preserved in `.qa/content-final-before/` for comparison. The assets, company introduction, legal information, browser script, build/preview helpers and dependencies are unchanged. The existing disclosure gap remains documented above. Nothing has been pushed or deployed.

## Localization refinement

The subsequent text-only pass reviewed all four dictionaries and shortened the hero descriptions to avoid repeating the teaser's launch message:

| Language | Hero description                                  |
| -------- | ------------------------------------------------- |
| English  | A different approach to deciding what to cook.    |
| Dutch    | Een andere manier om te kiezen wat je gaat koken. |
| Arabic   | طريقة مختلفة لاختيار ما ستطبخه.                   |
| German   | Ein anderer Ansatz für die Frage: Was koche ich?  |

The Arabic company headline now reads "برمجيات مستقلة." followed by the emphasized second line "نطوّرها لهدف واضح." The Arabic hero headline and "يسعدنا تواصلك" contact label are unchanged. English "More to come.", Dutch "Binnenkort meer.", German "Bald mehr." and Arabic "المزيد قريبًا." are removed from the hero descriptions and descriptive metadata. Arabic metadata also uses "طريقة مختلفة لاختيار ما ستطبخه."; German metadata uses the more natural "Decisphere kommt bald." instead of "Decisphere kommt." The shared description updates flow through SEO, social cards and WebPage structured data. All other translations remain unchanged, and no product claims were added.

Only `src/translations.mjs`, the four generated locale pages and this README changed. Template markup, styles, scripts, assets, section structure and business disclosures are unchanged. Existing translation-completeness/content checks passed for all four languages. Browser checks at 320, 390, 768 and 1280 CSS pixels found no page/text overflow or broken images. Arabic remains RTL, both Latin brand names remain LTR, and the company headline retains its explicit line break and orange emphasis. Arabic desktop/mobile screenshots and responsive evidence are in ignored `.qa/localization/`; `.qa/localization-before/` preserves the preceding files. No localization issue was identified in this focused review. Nothing has been pushed or deployed.
