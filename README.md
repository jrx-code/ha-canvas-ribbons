# Canvas Ribbons Background for Home Assistant

Animated canvas ribbon background for Home Assistant dashboards.

Based on [Boris Šehovac's CodePen](https://codepen.io/bsehovac/pen/LQVzxJ).

## Installation

### HACS (recommended)

1. Open HACS → Frontend
2. Add custom repository: `https://gitlab.iwanus.eu/jiwanus/ha-canvas-ribbons`
3. Install **Canvas Ribbons Background**
4. Add resource in Settings → Dashboards → Resources:
   - URL: `/hacsfiles/ha-canvas-ribbons/ha-canvas-ribbons.js`
   - Type: JavaScript Module
5. Refresh browser (Ctrl+Shift+R)

### Manual

1. Copy `dist/ha-canvas-ribbons.js` to `/config/www/`
2. Add resource: `/local/ha-canvas-ribbons.js` (JavaScript Module)
3. Refresh browser

## Configuration

Optional — set `window.canvasRibbonsConfig` before the script loads:

```html
<script>
  window.canvasRibbonsConfig = {
    waves: 3,          // number of ribbon waves (default: 3)
    width: 120,        // ribbon trail length (default: 120)
    rotation: 45,      // rotation angle in degrees (default: 45)
    amplitude: 0.5,    // wave amplitude (default: 0.5)
    speed: [0.004, 0.008], // min/max animation speed (default: [0.004, 0.008])
    hue: [11, 14],     // hue oscillation range (default: [11, 14])
    cardAlpha: 0.85,   // card background opacity (default: 0.85)
    headerAlpha: 0.7,  // header opacity (default: 0.7)
    sidebarAlpha: 0.8, // sidebar opacity (default: 0.8)
  };
</script>
```
