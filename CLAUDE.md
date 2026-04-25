# GGI Website — Astro + Sanity Scaffolding

## Project Context
Read these files for full context:
- `../GGI Brand Guidelines - Website Build Reference.md` — Colors, fonts, typography, imagery, layout rules
- `../GGI Website Build - OpenClaw Project Briefing.md` — Tech stack, architecture, integrations

## Your Task: Scaffold the Foundation

### 1. Initialize Astro Project
- Create a new Astro project in this directory (use the latest Astro)
- SSG (Static Site Generation) as default rendering mode
- Install `@sanity/astro` plugin (`npx astro add @sanity/astro`)
- Configure for Cloudflare Pages deployment

### 2. Global Styles & Design Tokens
Set up CSS custom properties exactly as specified in the brand guide:

```css
:root {
  --color-navy: #0e3352;
  --color-gold: #b89a47;
  --color-crimson: #84292d;
  --color-parchment: #f8ebd9;
  --color-ivory: #e2e1cb;
  --color-linen: #faf6f0;
  --color-ink: #1a1a2e;
  --color-gray: #5a5a6e;
  --color-text-on-dark: #f5efe5;
  --color-success: #2d6a4f;
  --color-error: #9b2c2c;
  --font-display: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
  --font-body: 'Source Serif 4', 'Lora', Georgia, serif;
  --font-ui: 'Inter', system-ui, -apple-system, sans-serif;
  --space-section: 80px;
  --space-component: 40px;
  --space-element: 16px;
  --max-content-width: 1200px;
  --max-prose-width: 680px;
}
```

### 3. Google Fonts
Load from Google Fonts:
- Cormorant Garamond: 400, 400i, 500, 500i, 600, 700
- Source Serif 4: 400, 400i, 600
- Inter: 400, 500, 600

### 4. Typography System
- Headlines: Cormorant Garamond (ALWAYS serif, never sans-serif)
- Body: Source Serif 4
- UI only: Inter (nav, form labels, buttons, metadata)
- Line height body: 1.65-1.75
- Max prose width: 65-75 characters
- All-caps letter-spacing: +0.05-0.1em
- Background: Parchment or Linen, NEVER pure white #ffffff

### 5. Base Layout Component
- `BaseLayout.astro` with proper HTML head (fonts, meta, CSS)
- Responsive breakpoints: Mobile <640px, Tablet 640-1024px, Desktop >1024px

### 6. Component Library (create all as .astro components)
- `Navigation.astro` — Navy background, gold logo, cream text, "Give" CTA in gold/crimson, 5-7 items, hamburger on mobile
- `Footer.astro` — Navy background, logo, nav links in cream, tagline "Fides • Ratio • Cultura", social links, copyright
- `Hero.astro` — Full-width, navy bg with serif headline in cream/gold OR classical painting with dark overlay. Subtitle in Source Serif 4. Single CTA button.
- `Card.astro` — Cream/ivory background, subtle 1px border, image top, Cormorant headline, Source Serif body, gold accent line, sharp corners (2-4px max)
- `Button.astro` — Primary (crimson bg, cream text, serif), Secondary (gold outline on navy), Tertiary (gold text link). Generous padding 16px 32px.
- `QuoteBlock.astro` — Large Cormorant Garamond Italic, gold quotation marks, attribution in small caps
- `SectionDivider.astro` — Thin gold rules (1-2px)
- `GivingTier.astro` — Elegant card for donation tiers (not pricing table). Monthly anchor, annual in parens.
- `DarkSection.astro` — Navy background section with cream/gold text for emphasis

### 7. Image Pipeline
- Use Astro's built-in `<Image>` component
- Create `/public/images/` folder structure: `/branding`, `/people`, `/events`, `/art`, `/stock`
- Copy key assets from `../site-audit/assets/` into appropriate folders

### 8. Homepage Prototype
Build a working homepage using the components above with placeholder content that demonstrates the full visual language:
- Navy hero with large serif headline + gold accent
- Endorsement quote block
- Events section with cards
- What We Do section
- Dark navy section for CTA
- Footer

### Rules
- NO Tailwind — use custom CSS with the design tokens
- NO rounded corners beyond 2-4px
- NO gradients, glassmorphism, or neon
- NO pure white backgrounds
- NO sans-serif headlines EVER
- Italic for emphasis in body text, not bold
- Background should be warm (parchment/linen)
- Gold on navy is the signature combination

When completely finished, run this command to notify me:
openclaw system event --text "Done: GGI Astro project scaffolded with component library and homepage prototype" --mode now
