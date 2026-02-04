# Cyberpunk 2077 UI Theme Implementation Plan

**Document Version:** 1.1
**Created:** January 26, 2026
**Status:** ✅ Complete

---

## Table of Contents

1. [Overview](#overview)
2. [Design Inspiration](#design-inspiration)
3. [Color Palette](#color-palette)
4. [Typography](#typography)
5. [UI Components](#ui-components)
6. [Effects & Animations](#effects--animations)
7. [Implementation Phases](#implementation-phases)
8. [File Changes](#file-changes)

---

## Overview

Add a **Cyberpunk 2077-inspired theme** as a 4th theme option alongside the existing Light, Dark, and System themes. Users can choose their preferred theme from the theme toggle.

### Theme Options After Implementation
| Theme | Description |
|-------|-------------|
| Light | Existing light theme (unchanged) |
| Dark | Existing dark theme (unchanged) |
| System | Auto-switches between Light/Dark based on OS preference |
| **Cyberpunk** | New futuristic theme with neon aesthetics |

### Cyberpunk Theme Features
- Dark, high-contrast backgrounds
- Neon accent colors (cyan, yellow, red)
- Futuristic typography (Rajdhani, Orbitron)
- Glitch effects and scan lines
- Angular, tech-inspired UI elements

**Guiding Principle:** The UI should feel like it's part of V's optic implants - a HUD overlay on the real world.

### Theme Architecture
```
html.light     → Light theme styles
html.dark      → Dark theme styles
html.cyberpunk → Cyberpunk theme styles (extends dark base)
```

The Cyberpunk theme will use `dark` as its base and override specific styles with cyberpunk aesthetics.

---

## Design Inspiration

### Sources
- [Cyberpunk 2077 Official Website](https://www.cyberpunk.net/)
- [Cyberpunk 2077 UI Color Palette](https://www.color-hex.com/color-palette/1041326)
- [Fonts In Use - Cyberpunk 2077](https://fontsinuse.com/uses/60926/cyberpunk-2077-video-game)
- [Behance UI Art Bible](https://www.behance.net/gallery/118663901/Cyberpunk-2077User-Interface-Part-1)

### Key Design Elements from Cyberpunk 2077
1. **Neomilitarism Style** - The default UI style with clean, technical aesthetics
2. **High Contrast** - Bright neon colors against pure black backgrounds
3. **Curved/Distorted Elements** - Slight perspective distortion on HUD elements
4. **Layered Information** - Primary info in bright colors, secondary in muted grays
5. **Tech Decorations** - Corner brackets, scan lines, data readouts as ornaments

---

## Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Cyber Black** | `#000000` | 0, 0, 0 | Primary background |
| **Night City** | `#0a0a0f` | 10, 10, 15 | Card backgrounds, elevated surfaces |
| **Chrome** | `#1a1a2e` | 26, 26, 46 | Secondary backgrounds, borders |

### Accent Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Neon Cyan** | `#55ead4` | 85, 234, 212 | Primary accent, links, active states |
| **Electric Yellow** | `#f3e600` | 243, 230, 0 | Highlights, warnings, important info |
| **Hot Red** | `#c5003c` | 197, 0, 60 | Danger, errors, aggressive actions |
| **Deep Red** | `#880425` | 136, 4, 37 | Red shadows, secondary alerts |

### Text Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Pure White** | `#ffffff` | 255, 255, 255 | Primary text, headings |
| **Cyber Gray** | `#a0a0a0` | 160, 160, 160 | Secondary text, descriptions |
| **Muted Gray** | `#606060` | 96, 96, 96 | Tertiary text, timestamps |

### Glow Effects

```css
/* Cyan Glow */
--glow-cyan: 0 0 10px #55ead4, 0 0 20px #55ead4, 0 0 40px #55ead466;

/* Yellow Glow */
--glow-yellow: 0 0 10px #f3e600, 0 0 20px #f3e600, 0 0 40px #f3e60066;

/* Red Glow */
--glow-red: 0 0 10px #c5003c, 0 0 20px #c5003c, 0 0 40px #c5003c66;
```

---

## Typography

### Font Stack

**Primary Font: Rajdhani** (Google Fonts - Free)
- Used for: Headings, navigation, buttons, UI labels
- Weights: 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold)
- Style: Technical, futuristic appearance

**Secondary Font: Orbitron** (Google Fonts - Free)
- Used for: Data displays, numbers, timestamps, badges
- Weights: 400 (Regular), 700 (Bold)
- Style: Geometric, space-age feel

**Monospace: JetBrains Mono or Share Tech Mono** (Google Fonts - Free)
- Used for: Code-like elements, IDs, technical data

### Font Import

```css
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;700&family=Share+Tech+Mono&display=swap');
```

### Typography Scale

```css
--font-display: 'Rajdhani', sans-serif;
--font-data: 'Orbitron', sans-serif;
--font-mono: 'Share Tech Mono', monospace;

/* Sizes */
--text-xs: 0.75rem;    /* 12px - timestamps, badges */
--text-sm: 0.875rem;   /* 14px - secondary text */
--text-base: 1rem;     /* 16px - body text */
--text-lg: 1.125rem;   /* 18px - large body */
--text-xl: 1.25rem;    /* 20px - small headings */
--text-2xl: 1.5rem;    /* 24px - section headings */
--text-3xl: 2rem;      /* 32px - page headings */
--text-4xl: 2.5rem;    /* 40px - hero headings */
--text-5xl: 3.5rem;    /* 56px - display headings */

/* Letter Spacing - Cyberpunk uses wide tracking */
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.05em;
--tracking-wider: 0.1em;
--tracking-widest: 0.2em;
```

---

## UI Components

### 1. Buttons

#### Primary Button (Cyan)
```
┌─────────────────────────────┐
│  ▸ ADD TO WATCHLIST         │
└─────────────────────────────┘
     ↑ Corner accents
```
- Background: Transparent with cyan border
- Border: 1px solid #55ead4 with corner "cut" accents
- Text: Uppercase, letter-spacing: 0.1em
- Hover: Cyan background, black text, glow effect
- Active: Scale down slightly, brighter glow

#### Secondary Button (Yellow)
- Same structure, yellow accent color
- Used for: Watchlist actions, highlights

#### Danger Button (Red)
- Same structure, red accent color
- Used for: Remove, delete actions

#### Button Corner Accents (CSS)
```css
.cyber-button {
  position: relative;
  clip-path: polygon(
    0 0,
    calc(100% - 8px) 0,
    100% 8px,
    100% 100%,
    8px 100%,
    0 calc(100% - 8px)
  );
}

/* Or using pseudo-elements for corner brackets */
.cyber-button::before,
.cyber-button::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border: 1px solid currentColor;
}
.cyber-button::before {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}
.cyber-button::after {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}
```

### 2. Cards (Media Cards)

```
┌──┬─────────────────────────┬──┐
│▪ │                         │ ▪│  ← Corner decorations
├──┘                         └──┤
│                               │
│      [POSTER IMAGE]           │
│                               │
│   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  ← Scan line overlay
│                               │
├──┐                         ┌──┤
│▪ │  MOVIE TITLE            │ ▪│
│  │  2024 • ★ 8.5           │  │
└──┴─────────────────────────┴──┘
```

- Background: #0a0a0f with subtle gradient
- Border: 1px solid #1a1a2e, hover: #55ead4
- Corner brackets as decorations
- Scan line overlay on poster (subtle)
- Hover: Lift effect, cyan border glow, slight glitch

### 3. Navigation Bar

```
┌────────────────────────────────────────────────────────────┐
│ ◢◤ ENTHUB          HOME   SEARCH   WATCHLIST   ◉ USER     │
│ ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔ │
└────────────────────────────────────────────────────────────┘
                    ↑ Animated underline on active
```

- Background: #000000 with slight transparency
- Bottom border: Animated gradient line (cyan → yellow)
- Logo: Styled with angular brackets
- Active link: Cyan color with underline animation
- Hover: Yellow highlight

### 4. Input Fields

```
┌──────────────────────────────────────┐
│ ▸ Search for movies, TV shows...    │
└──────────────────────────────────────┘
  ↑ Blinking cursor accent
```

- Background: #0a0a0f
- Border: 1px solid #1a1a2e, focus: #55ead4
- Placeholder: #606060
- Focus: Cyan glow, animated border
- Prefix icon with subtle animation

### 5. Badges & Tags

```
┌─────────┐   ┌─────────┐   ┌─────────┐
│ MOVIE   │   │ 8.5 ★   │   │ WATCHED │
└─────────┘   └─────────┘   └─────────┘
  (cyan)       (yellow)       (green)
```

- Font: Orbitron, uppercase, small
- Background: Color at 20% opacity
- Border: 1px solid color
- Text: Color at full opacity

### 6. Hero Section

```
┌────────────────────────────────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← Scan lines
│                                                            │
│   ┌──┐                                                     │
│   │▸ │  EXPLORE THE UNIVERSE OF CINEMA                     │
│   └──┘                                                     │
│         Discover millions of movies, TV shows...           │
│                                                            │
│   ┌─────────────────────────────────────┬──────────┐       │
│   │ ▸ Search...                         │  SEARCH  │       │
│   └─────────────────────────────────────┴──────────┘       │
│                                                            │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
└────────────────────────────────────────────────────────────┘
```

- Full-width with backdrop image
- Scan line overlay effect
- Gradient overlay: Black to transparent
- Text with subtle text-shadow glow
- Animated decorative elements

### 7. Section Headers

```
┌──┬────────────────────────────────────────────────┐
│▸ │  TRENDING TODAY                                │
└──┴────────────────────────────────────────────────┘
    ═══════════════════════════════════════════════
                    ↑ Animated underline
```

- Prefix bracket decoration
- Uppercase text with wide letter-spacing
- Animated underline (gradient sweep)
- Font: Rajdhani Bold

### 8. Rating Display

```
┌─────────────────┐
│  ◢████████░░◣   │
│     85%         │
│   USER SCORE    │
└─────────────────┘
```

- Circular or bar progress indicator
- Neon glow effect
- Orbitron font for percentage
- Color based on score (red < 50 < yellow < 80 < cyan)

### 9. Skeleton Loading

```
┌─────────────────────────┐
│ ▓░▓░▓░▓░▓░▓░▓░▓░▓░▓░▓░ │  ← Animated scan line shimmer
│ ░▓░▓░▓░▓░▓░▓░▓░▓░▓░▓░▓ │
│ ▓░▓░▓░▓░▓░▓░▓░▓░▓░▓░▓░ │
└─────────────────────────┘
```

- Replace current shimmer with scan line effect
- Cyan tinted scan lines moving vertically
- Glitch flicker occasionally

---

## Effects & Animations

### 1. Glitch Effect

Used for: Hover states, loading, transitions

```css
@keyframes glitch {
  0% {
    transform: translate(0);
    opacity: 1;
  }
  20% {
    transform: translate(-2px, 2px);
    opacity: 0.8;
  }
  40% {
    transform: translate(-2px, -2px);
    opacity: 1;
  }
  60% {
    transform: translate(2px, 2px);
    opacity: 0.8;
  }
  80% {
    transform: translate(2px, -2px);
    opacity: 1;
  }
  100% {
    transform: translate(0);
    opacity: 1;
  }
}

/* RGB Split for text */
.glitch-text {
  position: relative;
}
.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.glitch-text::before {
  color: #c5003c;
  animation: glitch-1 0.3s infinite;
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
  transform: translate(-2px, -2px);
}
.glitch-text::after {
  color: #55ead4;
  animation: glitch-2 0.3s infinite;
  clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
  transform: translate(2px, 2px);
}
```

### 2. Scan Lines Overlay

```css
.scan-lines {
  position: relative;
}
.scan-lines::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.1) 2px,
    rgba(0, 0, 0, 0.1) 4px
  );
  pointer-events: none;
}
```

### 3. Neon Glow Pulse

```css
@keyframes neon-pulse {
  0%, 100% {
    box-shadow: 0 0 5px #55ead4, 0 0 10px #55ead4, 0 0 20px #55ead466;
  }
  50% {
    box-shadow: 0 0 10px #55ead4, 0 0 20px #55ead4, 0 0 40px #55ead466;
  }
}
```

### 4. Chromatic Aberration (Hover)

```css
.chromatic-hover:hover {
  text-shadow:
    -1px 0 #c5003c,
    1px 0 #55ead4;
}
```

### 5. Flicker Effect

```css
@keyframes flicker {
  0%, 100% { opacity: 1; }
  92% { opacity: 1; }
  93% { opacity: 0.8; }
  94% { opacity: 1; }
  95% { opacity: 0.9; }
  96% { opacity: 1; }
}
```

### 6. Border Animation

```css
@keyframes border-flow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

.animated-border {
  background: linear-gradient(
    90deg,
    #55ead4,
    #f3e600,
    #c5003c,
    #55ead4
  );
  background-size: 200% 100%;
  animation: border-flow 3s linear infinite;
}
```

---

## Implementation Phases

### Phase 1: Theme System Update

**Files to modify/create:**
1. `src/composables/useTheme.ts` - Add 'cyberpunk' to theme options
2. `src/components/ThemeToggle.vue` - Add 4th option for Cyberpunk
3. `src/assets/css/cyberpunk.css` - New CSS file with cyberpunk-specific styles
4. `tailwind.config.js` - Extend with cyberpunk colors and fonts
5. `index.html` - Add Google Fonts import

**Tasks:**
- [x] Update `Theme` type to include `'cyberpunk'`
- [x] Update `useTheme` composable to handle cyberpunk theme
- [x] Add `cyberpunk` class to HTML element when theme is selected
- [x] Update ThemeToggle UI to show 4 options (Light, Dark, System, Cyberpunk)
- [x] Import Google Fonts (Rajdhani, Orbitron, Share Tech Mono)
- [x] Create cyberpunk.css with all custom properties and base styles

**Theme Toggle UI Update:**
```
┌─────────────────────────────────────┐
│  ☀️ Light                           │
│  🌙 Dark                            │
│  💻 System                          │
│  ⚡ Cyberpunk                       │  ← New option
└─────────────────────────────────────┘
```

**useTheme.ts Changes:**
```typescript
type Theme = 'light' | 'dark' | 'system' | 'cyberpunk';

// When cyberpunk is selected:
// - Add 'cyberpunk' class to <html>
// - Also add 'dark' class (cyberpunk extends dark theme)
```

### Phase 2: Foundation (Cyberpunk Styles)

**Files to create/modify:**
1. `src/assets/css/cyberpunk.css` - Core styles, animations, utilities

**Tasks:**
- [x] Define CSS custom properties for cyberpunk colors
- [x] Create keyframe animations (glitch, scan, neon-pulse, flicker)
- [x] Create utility classes for effects (.cyber-glow, .scan-lines, .glitch-text)
- [x] Override Tailwind defaults for cyberpunk theme
- [x] Style base elements (body, headings, links) for cyberpunk

**CSS Structure:**
```css
/* Only apply when .cyberpunk class is present */
html.cyberpunk {
  /* Color overrides */
  --color-primary: #55ead4;
  --color-accent: #f3e600;
  /* ... */
}

html.cyberpunk body {
  font-family: 'Rajdhani', sans-serif;
  /* ... */
}
```

### Phase 3: Core Components

**Files to modify:**
1. `src/components/Navbar.vue` - Add cyberpunk variant styles
2. `src/components/Skeleton.vue` - Add scan line variant for cyberpunk

**Tasks:**
- [x] Add conditional cyberpunk classes to Navbar
- [x] Style Navbar with angular design, animated border (cyberpunk only)
- [x] Create scan line skeleton variant for cyberpunk theme
- [x] Ensure light/dark themes remain unchanged

**Conditional Styling Approach:**
```vue
<nav :class="{ 'cyber-nav': isCyberpunk }">
  <!-- ... -->
</nav>
```

### Phase 4: Home Page

**Files to modify:**
1. `src/views/Home.vue`

**Tasks:**
- [x] Add cyberpunk variant for hero section (scan lines, glow)
- [x] Add cyberpunk variant for search input
- [x] Add cyberpunk variant for section headers
- [x] Add cyberpunk variant for media cards (corner accents)
- [x] Keep light/dark styles intact

### Phase 5: Detail Pages

**Files to modify:**
1. `src/views/Details.vue`
2. `src/views/Person.vue`
3. `src/views/Collection.vue`

**Tasks:**
- [x] Add cyberpunk variant for hero/backdrop sections
- [x] Add cyberpunk variant for info cards and sidebars
- [x] Add cyberpunk variant for buttons (watchlist, watched)
- [x] Add cyberpunk variant for cast/crew cards
- [x] Add scan line overlays for cyberpunk theme

### Phase 6: List Pages

**Files to modify:**
1. `src/views/Search.vue`
2. `src/views/Watchlist.vue`
3. `src/views/Watched.vue`

**Tasks:**
- [x] Add cyberpunk variant for page headers
- [x] Add cyberpunk variant for media grids
- [x] Add cyberpunk variant for empty states
- [x] Add cyberpunk variant for status badges

### Phase 7: Auth & Forms

**Files to modify:**
1. `src/views/Login.vue`

**Tasks:**
- [x] Add cyberpunk variant for login form
- [x] Add cyberpunk variant for input fields
- [x] Add glitch effects for cyberpunk transitions
- [x] Add cyberpunk variant for error/success messages

### Phase 8: Polish & Testing

**Tasks:**
- [x] Test all 4 themes work correctly
- [x] Ensure theme persistence works for cyberpunk
- [x] Add page transition animations for cyberpunk
- [x] Performance optimization for animations
- [x] Test on various screen sizes (responsive CSS added)
- [x] Add reduced-motion support
- [x] Verify no style leakage between themes

---

## File Changes

### New Files

| File | Purpose |
|------|---------|
| `src/assets/css/cyberpunk.css` | Core cyberpunk styles, animations, utilities (only applied when `.cyberpunk` class present) |

### Modified Files

| File | Changes |
|------|---------|
| `index.html` | Add Google Fonts (Rajdhani, Orbitron, Share Tech Mono) |
| `tailwind.config.js` | Add cyberpunk colors, fonts, animations to extend config |
| `src/main.ts` | Import cyberpunk.css |
| `src/composables/useTheme.ts` | Add 'cyberpunk' to Theme type, handle cyberpunk class toggling |
| `src/components/ThemeToggle.vue` | Add 4th option for Cyberpunk theme |
| `src/components/Navbar.vue` | Add conditional cyberpunk variant styles |
| `src/components/Skeleton.vue` | Add cyberpunk scan line variant |
| `src/App.vue` | Add conditional scan lines overlay for cyberpunk |
| `src/views/Home.vue` | Add conditional cyberpunk variant styles |
| `src/views/Search.vue` | Add conditional cyberpunk variant styles |
| `src/views/Details.vue` | Add conditional cyberpunk variant styles |
| `src/views/Collection.vue` | Add conditional cyberpunk variant styles |
| `src/views/Person.vue` | Add conditional cyberpunk variant styles |
| `src/views/Watchlist.vue` | Add conditional cyberpunk variant styles |
| `src/views/Watched.vue` | Add conditional cyberpunk variant styles |
| `src/views/Login.vue` | Add conditional cyberpunk variant styles |

### Styling Strategy

**Approach:** Use CSS specificity with `.cyberpunk` class selector to override default styles only when cyberpunk theme is active.

```css
/* Default styles (light/dark) remain unchanged */
.button {
  @apply bg-teal-500 text-white;
}

/* Cyberpunk overrides - only applied when theme is active */
html.cyberpunk .button {
  @apply bg-transparent border border-cyber-cyan text-cyber-cyan;
  /* Additional cyberpunk-specific styles */
}
```

**Benefits:**
- Light and Dark themes remain completely unchanged
- No risk of breaking existing functionality
- Easy to add/remove cyberpunk styles
- Clear separation of concerns

---

## Tailwind Configuration

```javascript
// tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#000000',
          night: '#0a0a0f',
          chrome: '#1a1a2e',
          cyan: '#55ead4',
          yellow: '#f3e600',
          red: '#c5003c',
          'red-dark': '#880425',
        }
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        data: ['Orbitron', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      },
      animation: {
        'glitch': 'glitch 0.3s infinite',
        'scan': 'scan 8s linear infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'border-flow': 'border-flow 3s linear infinite',
        'flicker': 'flicker 4s infinite',
      },
      boxShadow: {
        'neon-cyan': '0 0 5px #55ead4, 0 0 10px #55ead4, 0 0 20px #55ead466',
        'neon-yellow': '0 0 5px #f3e600, 0 0 10px #f3e600, 0 0 20px #f3e60066',
        'neon-red': '0 0 5px #c5003c, 0 0 10px #c5003c, 0 0 20px #c5003c66',
      },
    },
  },
  plugins: [],
}
```

---

## Accessibility Considerations

1. **Reduced Motion**: Respect `prefers-reduced-motion` media query
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
     }
   }
   ```

2. **Contrast**: Ensure text meets WCAG AA standards
   - Cyan (#55ead4) on black: 11.5:1 ✓
   - Yellow (#f3e600) on black: 15.3:1 ✓
   - White on black: 21:1 ✓

3. **Focus States**: Maintain visible focus indicators with neon glow

4. **Scan Lines**: Keep opacity low (0.1) to not impair readability

---

## Performance Considerations

1. **Animation Performance**:
   - Use `transform` and `opacity` for animations (GPU accelerated)
   - Avoid animating `box-shadow` directly; use pseudo-elements
   - Use `will-change` sparingly on animated elements

2. **Font Loading**:
   - Use `font-display: swap` to prevent FOIT
   - Preload critical fonts

3. **Effect Throttling**:
   - Disable intensive effects on low-power devices
   - Use CSS containment where appropriate

---

## Success Metrics

- [x] All 4 themes work correctly (Light, Dark, System, Cyberpunk)
- [x] Theme selection persists across sessions
- [x] Light and Dark themes remain unchanged
- [x] Cyberpunk theme applied consistently across all pages
- [x] Cyberpunk color palette used correctly
- [x] Cyberpunk typography (Rajdhani/Orbitron) renders properly
- [x] Animations smooth at 60fps
- [x] No accessibility regressions
- [x] All existing functionality preserved
- [x] Responsive design maintained across all themes
- [x] No style leakage between themes

---

## References

- [Cyberpunk 2077 Official Website](https://www.cyberpunk.net/)
- [Cyberpunk 2077 UI Art Bible - Behance](https://www.behance.net/gallery/118663901/Cyberpunk-2077User-Interface-Part-1)
- [Fonts In Use - Cyberpunk 2077](https://fontsinuse.com/uses/60926/cyberpunk-2077-video-game)
- [Rajdhani Font - Google Fonts](https://fonts.google.com/specimen/Rajdhani)
- [Orbitron Font - Google Fonts](https://fonts.google.com/specimen/Orbitron)
- [Game UI Database - Cyberpunk 2077](https://www.gameuidatabase.com/gameData.php?id=439)
