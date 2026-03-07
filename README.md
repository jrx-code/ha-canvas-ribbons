# Canvas Ribbons Background for Home Assistant

**License:** MIT | **HACS:** Custom | **HA:** 2024.1+

Animated canvas ribbon background for Home Assistant dashboards. Adds smooth, flowing ribbon animations behind your HA interface with full GUI configuration.

Based on `animation.79.canvas-ribbons` from [lovelace-bg-animation](https://github.com/ibz0q/lovelace-bg-animation) by [@ibz0q](https://github.com/ibz0q), which itself is based on [Boris Šehovac's CodePen](https://codepen.io/bsehovac/pen/LQVzxJ). Rewritten as a standalone, lightweight HACS plugin with live GUI configuration.

![Preview](screenshots/preview.png)

## Changelog

| Version | Type | Description |
|---|---|---|
| **1.x** | **Major** | **Single-file HACS plugin with canvas ribbon animation** |
| 1.8 | Minor | Auto-preset based on sun position (elevation + rising) |
| 1.7 | Minor | Save & close button (blue, default action) |
| 1.7.1 | Fix | Preset dropdown: dark theme colors, retain selection |
| 1.7.2 | Fix | HACS validation: remove deprecated type field, add topics |
| 1.6 | Minor | 16 presets in 4 categories (Games, Seasons, Time of day, Themes) |
| 1.5 | Minor | Saturation and brightness controls |
| 1.4 | Minor | Hue position+range sliders with rainbow gradient and color preview |
| 1.3 | Minor | i18n: PL, EN, DE, ES, CS with auto-detection |
| 1.2 | Minor | Per-panel enable/disable, security fixes (H1–H4) |
| 1.1 | Minor | GUI configuration panel, localStorage persistence |
| 1.0 | Minor | Initial release — canvas ribbons, HA theme transparency |

## Features

- Animated ribbon background rendered on HTML5 Canvas
- **GUI configuration panel** — click the button in the bottom-right corner
- **16 presets** (Pip-Boy, Neon City, seasons, iOS Dark, Material You…)
- 13 configurable parameters (waves, speed, colors, saturation, brightness, transparency)
- Settings persisted to `localStorage`
- Automatic HA theme transparency (cards, header, sidebar)
- Lightweight (~6 KB), no dependencies
- HACS compatible

## Installation

### HACS (recommended)

1. Open HACS → Frontend → **Custom repositories**
2. Add this repository URL, category: **Lovelace**
3. Install **Canvas Ribbons Background**
4. Add resource in **Settings → Dashboards → Resources**:
   - URL: `/hacsfiles/ha-canvas-ribbons/ha-canvas-ribbons.js`
   - Type: JavaScript Module
5. Refresh browser (**Ctrl+Shift+R**)

### Manual

1. Copy `dist/ha-canvas-ribbons.js` to your HA `/config/www/` directory
2. Add resource in **Settings → Dashboards → Resources**:
   - URL: `/local/ha-canvas-ribbons.js`
   - Type: JavaScript Module
3. Refresh browser (**Ctrl+Shift+R**)

## GUI Configuration

Click the floating button in the bottom-right corner to open the settings panel:

| Parameter | Range | Live | Description |
|---|---|---|---|
| Enable on panel | on/off | yes | Enable/disable ribbons per HA panel (stored per URL path) |
| Waves | 1–8 | reload | Number of ribbon waves |
| Trail width | 20–300 | yes | Length of ribbon trail |
| Rotation | 0–360° | yes | Rotation angle |
| Amplitude | 0.1–2.0 | yes | Wave amplitude |
| Speed min/max | 0.001–0.04 | yes | Animation speed range |
| Hue | 0–30 | yes | Color hue position (rainbow slider) |
| Hue range | 0–15 | yes | Color oscillation width |
| Saturation | 0–1 | yes | Color saturation |
| Brightness | 0–1 | yes | Color brightness |
| Card alpha | 0–1 | yes | Card background opacity |
| Header alpha | 0–1 | yes | Header opacity |
| Sidebar alpha | 0–1 | yes | Sidebar opacity |

Settings are saved to `localStorage` and persist across page reloads. Click **Reset** to restore defaults.

## Advanced Configuration

You can also set config programmatically via `window.canvasRibbonsConfig`:

```html
<script>
  window.canvasRibbonsConfig = {
    waves: 3,              // number of ribbon waves (default: 3)
    width: 120,            // ribbon trail length (default: 120)
    rotation: 45,          // rotation angle in degrees (default: 45)
    amplitude: 0.5,        // wave amplitude (default: 0.5)
    speed: [0.004, 0.008], // min/max animation speed
    hue: [11, 14],         // hue oscillation range
    saturation: 0.8,       // color saturation (default: 0.8)
    brightness: 1.0,       // color brightness (default: 1.0)
    cardAlpha: 0.85,       // card background opacity (default: 0.85)
    headerAlpha: 0.7,      // header opacity (default: 0.7)
    sidebarAlpha: 0.8,     // sidebar opacity (default: 0.8)
  };
</script>
```

Config priority: defaults → localStorage → `window.canvasRibbonsConfig`

## How it works

1. Injects a `<canvas>` element on `document.body` with `z-index: 0` and `pointer-events: none`
2. Adds CSS custom properties to make HA backgrounds transparent
3. Renders animated Bézier curves (ribbons) via `requestAnimationFrame`
4. No iframes, no shadow DOM hacks — clean DOM injection

## Development

```bash
# Install dependencies (for tests)
npm install

# Run tests (20 unit tests, jsdom)
node canvas-ribbons.test.js

# Generate screenshot
node scripts/generate-screenshot.js
```

## License

[MIT](LICENSE) — Copyright (c) 2026 JI ENGINEERING

Based on `animation.79.canvas-ribbons` from [lovelace-bg-animation](https://github.com/ibz0q/lovelace-bg-animation) by [@ibz0q](https://github.com/ibz0q).
Original animation by [Boris Šehovac](https://codepen.io/bsehovac/pen/LQVzxJ).
