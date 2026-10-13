# Discord Mobile Design System Specification

## 1. System Foundations & Brand Vision
A high-fidelity mobile application designed around Discord's iconic visual language, enhanced with the precision and tactile feedback of the **Premium Design System**, the relentless quality standards of **Impeccable**, and the ergonomics of **UI/UX Pro Max**.

- **Brand Archetype:** Modern, expressive, and ergonomic mobile communication client.
- **Form Factor:** Mobile-first (360px – 430px viewport base with dynamic safe area insets).
- **Surface Elevation:** Dark theme standard with multi-layered depth (`#111214` lowest background, `#1E1F22` sidebar/nav, `#2B2D31` secondary panels, `#313338` primary content cards).

---

## 2. Color Palette & Semantic Tokens

### Core Discord Colors
- **Blurple (Brand Primary):** `#5865F2` (Hover: `#4752C4`, Active: `#3C45A5`)
- **Green (Success / Online):** `#23A55A` (Alt: `#57F287`)
- **Yellow (Idle / Warning):** `#FEE75C` (Darker: `#F0B232`)
- **Red (Do Not Disturb / Danger):** `#F23F43` (Alt: `#ED4245`)
- **Fuchsia / Nitro:** `#EB459E`
- **Streaming Purple:** `#593695`

### Surface & Neutral Hierarchy (Dark Theme)
- **Background Primary:** `#313338` (Main chat / active screens)
- **Background Secondary:** `#2B2D31` (Channel list / panel headers)
- **Background Tertiary:** `#1E1F22` (Server rail / dock / bottom bar)
- **Background Floating / Modal:** `#232428`
- **Background Deepest (OLED / Shell):** `#111214`
- **Interactive Normal:** `#949BA4`
- **Interactive Hover:** `#DBDEE1`
- **Interactive Active / White:** `#FFFFFF`
- **Interactive Muted:** `#4E5058`

---

## 3. Typography Hierarchy
Primary Font Stack: `gg sans`, `Inter`, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif.

| Level | Size | Weight | Line Height | Tracking | Usage |
|---|---|---|---|---|---|
| Display | 24px (1.5rem) | 800 (Heavy) | 1.25 | -0.02em | Splash / Main Headers |
| Title | 20px (1.25rem) | 700 (Bold) | 1.3 | -0.01em | Modal Titles / Screen Names |
| Section Header | 16px (1.0rem) | 600 (Semibold) | 1.4 | 0 | Group Titles / Category Headers |
| Body Regular | 15px (0.9375rem) | 400 (Regular) | 1.5 | 0 | Messages / Description |
| Body Medium | 14px (0.875rem) | 500 (Medium) | 1.4 | 0 | Channel Names / Secondary Items |
| Caption / Micro | 12px (0.75rem) | 500 (Medium) | 1.3 | +0.02em | Timestamps / Meta Info |

---

## 4. Spacing & The 8-Point Grid
Mathematical visual rhythm using the standard 8pt grid with 4pt baseline:
- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-5`: 20px
- `space-6`: 24px
- `space-8`: 32px

---

## 5. Assets & Visual Resources
- **Source Assets Path:** `/home/fatihfarhat/Downloads/discord asset`
- **Project Assets Path:** `src/assets/discord/` and `public/discord-assets/`
- **Figma Reference:** [Discord Assets Community](https://www.figma.com/design/PDTzEvCwsI2WfehTMzjn5a/Discord-assets--icons-and-images---Community-?t=tzw0EdEb9dlwWThO-0)
- **Splash Screen:** `public/splash/splash.gif` (URL: `https://i.redd.it/lufiuaku68361.gif`)

### Icon Catalog:
- `active-violations.svg`, `all-good.svg`, `at-risk.svg`, `expired-violations.svg`, `limited.svg`, `suspended.svg`
- `checkbox-active.svg`, `checkbox-deactive.svg`
- `clips.svg`, `cloud.svg`, `donwload.svg`, `download-from-cloud.svg`, `upload-to-cloud.svg`
- `dots-horizontal.svg`, `dots-vertical.svg`
- `edit-profile.svg`, `my-account.svg`, `settings.svg`, `notifications.svg`, `padlock.svg`, `plugins.svg`
- `label-selected.svg`, `label-notselected.svg`
- `turn-on.svg`, `turn-off.svg`
- `subcategory-line-active.svg`, `subcategory-line-deactive.svg`
- `Vector.svg`, `FULL SET.svg`

---

## 6. Motion & Physics
- **Smooth Scrolling:** Powered by `Lenis` for momentum, zero jank, and organic touch response.
- **Transitions:** Powered by `Framer Motion`:
  * Default spring: `{ type: "spring", stiffness: 400, damping: 30 }`
  * Sheet / Drawer: `{ type: "spring", damping: 28, stiffness: 300 }`
  * Micro-interactions: 150ms ease-out transitions on press/touch states.

---

## 7. Absolute Rules & Anti-Patterns
1. **Dilarang keras membuat badge/tag/pill tanpa perintah eksplisit.**
2. **Dilarang membuat komponen apa pun di luar instruksi (WAJIB HANYA membuat komponen yang secara spesifik disebutkan dalam instruksi atau desain referensi).**
3. **Selalu patuhi prinsip Apple Touch & Ergonomics: minimum touch target 44×44px.**
4. **Halaman kosong (blank page) awal wajib rapi, elegan, berpusat pada mobile frame viewport yang responsif, dan siap untuk tahap pengembangan berikutnya.**
