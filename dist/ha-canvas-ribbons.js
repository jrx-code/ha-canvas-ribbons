// Canvas Ribbons — animated background for Home Assistant
// https://gitlab.iwanus.eu/jiwanus/ha-canvas-ribbons
// Based on Boris Šehovac's CodePen (https://codepen.io/bsehovac/pen/LQVzxJ)

const VERSION = "1.7.0";

(function () {
  "use strict";

  const STORAGE_KEY = "ha-canvas-ribbons-config";
  const PANELS_KEY = "ha-canvas-ribbons-panels";
  const TAU = 2 * Math.PI;

  // --- i18n ---
  var TRANSLATIONS = {
    en: {
      title: "Canvas Ribbons",
      enablePanel: "Enabled on this panel",
      refreshHint: "Refresh page (F5) to apply",
      reset: "Reset",
      waves: "Waves",
      trailWidth: "Trail width",
      rotation: "Rotation",
      amplitude: "Amplitude",
      speedMin: "Speed min",
      speedMax: "Speed max",
      huePosition: "Hue",
      hueRange: "Hue range",
      saturation: "Saturation",
      brightness: "Brightness",
      cardAlpha: "Card alpha",
      headerAlpha: "Header alpha",
      sidebarAlpha: "Sidebar alpha",
      preset: "Preset",
      presetCustom: "Custom",
      presetCatGames: "Games",
      presetCatSeasons: "Seasons",
      presetCatDaytime: "Time of day",
      presetCatThemes: "Themes",
      saveClose: "Save & close",
    },
    pl: {
      title: "Canvas Ribbons",
      enablePanel: "Włączone na tym panelu",
      refreshHint: "Odśwież stronę (F5) aby zastosować",
      reset: "Reset",
      waves: "Wstęgi",
      trailWidth: "Dług. śladu",
      rotation: "Rotacja",
      amplitude: "Amplituda",
      speedMin: "Prędk. min",
      speedMax: "Prędk. max",
      huePosition: "Barwa",
      hueRange: "Zakres barwy",
      saturation: "Nasycenie",
      brightness: "Jasność",
      cardAlpha: "Karty alfa",
      headerAlpha: "Header alfa",
      sidebarAlpha: "Sidebar alfa",
      preset: "Preset",
      presetCustom: "Własny",
      presetCatGames: "Gry",
      presetCatSeasons: "Pory roku",
      presetCatDaytime: "Pora dnia",
      presetCatThemes: "Motywy",
      saveClose: "Zapisz i zamknij",
    },
    de: {
      title: "Canvas Ribbons",
      enablePanel: "Auf diesem Panel aktiviert",
      refreshHint: "Seite neu laden (F5) zum Anwenden",
      reset: "Zurücksetzen",
      waves: "Wellen",
      trailWidth: "Spurlänge",
      rotation: "Drehung",
      amplitude: "Amplitude",
      speedMin: "Geschw. min",
      speedMax: "Geschw. max",
      huePosition: "Farbton",
      hueRange: "Farbtonbreite",
      saturation: "Sättigung",
      brightness: "Helligkeit",
      cardAlpha: "Karten-Alpha",
      headerAlpha: "Header-Alpha",
      sidebarAlpha: "Sidebar-Alpha",
      preset: "Vorlage",
      presetCustom: "Eigene",
      presetCatGames: "Spiele",
      presetCatSeasons: "Jahreszeiten",
      presetCatDaytime: "Tageszeit",
      presetCatThemes: "Designs",
      saveClose: "Speichern & schließen",
    },
    es: {
      title: "Canvas Ribbons",
      enablePanel: "Activado en este panel",
      refreshHint: "Actualizar página (F5) para aplicar",
      reset: "Restablecer",
      waves: "Ondas",
      trailWidth: "Longitud estela",
      rotation: "Rotación",
      amplitude: "Amplitud",
      speedMin: "Veloc. mín",
      speedMax: "Veloc. máx",
      huePosition: "Tono",
      hueRange: "Rango tono",
      saturation: "Saturación",
      brightness: "Brillo",
      cardAlpha: "Tarjetas alfa",
      headerAlpha: "Header alfa",
      sidebarAlpha: "Sidebar alfa",
      preset: "Preajuste",
      presetCustom: "Personal.",
      presetCatGames: "Juegos",
      presetCatSeasons: "Estaciones",
      presetCatDaytime: "Hora del día",
      presetCatThemes: "Temas",
      saveClose: "Guardar y cerrar",
    },
    cs: {
      title: "Canvas Ribbons",
      enablePanel: "Povoleno na tomto panelu",
      refreshHint: "Obnovte stránku (F5) pro použití",
      reset: "Obnovit",
      waves: "Vlny",
      trailWidth: "Délka stopy",
      rotation: "Rotace",
      amplitude: "Amplituda",
      speedMin: "Rychl. min",
      speedMax: "Rychl. max",
      huePosition: "Odstín",
      hueRange: "Rozsah odstínu",
      saturation: "Sytost",
      brightness: "Jas",
      cardAlpha: "Karty alfa",
      headerAlpha: "Header alfa",
      sidebarAlpha: "Sidebar alfa",
      preset: "Předvolba",
      presetCustom: "Vlastní",
      presetCatGames: "Hry",
      presetCatSeasons: "Roční období",
      presetCatDaytime: "Denní doba",
      presetCatThemes: "Motivy",
      saveClose: "Uložit a zavřít",
    },
  };

  function detectLang() {
    var lang = (document.documentElement.lang || navigator.language || "en").toLowerCase().split("-")[0];
    return TRANSLATIONS[lang] ? lang : "en";
  }
  var T = TRANSLATIONS[detectLang()];

  // --- Presets ---
  var PRESETS = [
    // Games
    { id: "pipboy",       cat: "presetCatGames",   name: "Pip-Boy",       waves:2, width:80,  rotation:30,  amplitude:0.3, speed:[0.002,0.005], hue:[19,21], saturation:0.9,  brightness:0.6  },
    { id: "neoncity",     cat: "presetCatGames",   name: "Neon City",     waves:4, width:150, rotation:60,  amplitude:0.8, speed:[0.006,0.012], hue:[8,16],  saturation:1.0,  brightness:1.0  },
    { id: "digitalrain",  cat: "presetCatGames",   name: "Digital Rain",  waves:6, width:200, rotation:90,  amplitude:0.2, speed:[0.004,0.008], hue:[19.5,20.5], saturation:1.0, brightness:0.45 },
    { id: "underworld",   cat: "presetCatGames",   name: "Underworld",    waves:3, width:100, rotation:40,  amplitude:0.6, speed:[0.004,0.008], hue:[3.5,6.5], saturation:0.95, brightness:0.7  },
    // Seasons
    { id: "spring",       cat: "presetCatSeasons",  name: "Wiosna",        waves:3, width:120, rotation:45,  amplitude:0.5, speed:[0.003,0.006], hue:[17.5,22.5], saturation:0.7, brightness:0.9  },
    { id: "summer",       cat: "presetCatSeasons",  name: "Lato",          waves:4, width:140, rotation:50,  amplitude:0.6, speed:[0.004,0.008], hue:[23,27], saturation:0.85, brightness:1.0  },
    { id: "autumn",       cat: "presetCatSeasons",  name: "Jesień",        waves:3, width:100, rotation:35,  amplitude:0.4, speed:[0.003,0.006], hue:[2,8],   saturation:0.75, brightness:0.65 },
    { id: "winter",       cat: "presetCatSeasons",  name: "Zima",          waves:2, width:90,  rotation:40,  amplitude:0.3, speed:[0.002,0.005], hue:[13.5,16.5], saturation:0.25, brightness:0.85 },
    // Time of day
    { id: "dawn",         cat: "presetCatDaytime",  name: "Świt",          waves:3, width:130, rotation:45,  amplitude:0.5, speed:[0.003,0.006], hue:[20,30], saturation:0.6,  brightness:0.75 },
    { id: "noon",         cat: "presetCatDaytime",  name: "Południe",      waves:2, width:80,  rotation:45,  amplitude:0.3, speed:[0.002,0.005], hue:[12.5,17.5], saturation:0.5, brightness:1.0  },
    { id: "sunset",       cat: "presetCatDaytime",  name: "Zachód",        waves:4, width:150, rotation:55,  amplitude:0.7, speed:[0.004,0.008], hue:[1,9],   saturation:1.0,  brightness:0.8  },
    { id: "night",        cat: "presetCatDaytime",  name: "Noc",           waves:2, width:100, rotation:40,  amplitude:0.4, speed:[0.002,0.005], hue:[10,14], saturation:0.6,  brightness:0.35 },
    // Themes
    { id: "iosdark",      cat: "presetCatThemes",   name: "iOS Dark",      waves:2, width:90,  rotation:40,  amplitude:0.3, speed:[0.002,0.004], hue:[14,16], saturation:0.2,  brightness:0.5  },
    { id: "materialyou",  cat: "presetCatThemes",   name: "Material You",  waves:3, width:120, rotation:45,  amplitude:0.5, speed:[0.004,0.007], hue:[15,21], saturation:0.9,  brightness:0.85 },
    { id: "amoled",       cat: "presetCatThemes",   name: "AMOLED",        waves:2, width:70,  rotation:35,  amplitude:0.2, speed:[0.002,0.004], hue:[9,11],  saturation:0.4,  brightness:0.2  },
    { id: "monokai",      cat: "presetCatThemes",   name: "Monokai",       waves:3, width:110, rotation:45,  amplitude:0.5, speed:[0.004,0.007], hue:[2.5,7.5], saturation:0.8, brightness:0.55 },
  ];

  function rnd(a, b) { return b === undefined ? Math.random() * a : a + Math.random() * (b - a); }
  function rndSign() { return Math.random() > 0.5 ? 1 : -1; }
  function degToRad(d) { return (d * Math.PI) / 180; }

  class Line {
    constructor(wave, color) {
      const { angle, speed } = wave;
      this.angle = [
        Math.sin((angle[0] += speed[0])),
        Math.sin((angle[1] += speed[1])),
        Math.sin((angle[2] += speed[2])),
        Math.sin((angle[3] += speed[3])),
      ];
      this.color = color;
    }
  }

  class Wave {
    constructor(r) {
      const [lo, hi] = r.options.speed;
      this.ribbons = r;
      this.lines = [];
      this.angle = [rnd(TAU), rnd(TAU), rnd(TAU), rnd(TAU)];
      this.speed = [rnd(lo, hi) * rndSign(), rnd(lo, hi) * rndSign(), rnd(lo, hi) * rndSign(), rnd(lo, hi) * rndSign()];
    }
    update() {
      this.lines.push(new Line(this, this.ribbons.color));
      if (this.lines.length > this.ribbons.options.width) this.lines.shift();
    }
    draw(ctx) {
      const r = this.ribbons;
      const radius = r.radius, cx = r.cx, cy = r.cy, options = r.options;
      const r3 = radius / 3, rot = degToRad(options.rotation), amp = options.amplitude;
      for (const l of this.lines) {
        const a = l.angle;
        ctx.strokeStyle = l.color;
        ctx.beginPath();
        ctx.moveTo(cx - radius * Math.cos(a[0] * amp + rot), cy - radius * Math.sin(a[0] * amp + rot));
        ctx.bezierCurveTo(
          cx - r3 * Math.cos(a[1] * amp * 2), cy - r3 * Math.sin(a[1] * amp * 2),
          cx + r3 * Math.cos(a[2] * amp * 2), cy + r3 * Math.sin(a[2] * amp * 2),
          cx + radius * Math.cos(a[3] * amp + rot), cy + radius * Math.sin(a[3] * amp + rot)
        );
        ctx.stroke();
      }
    }
  }

  const DEFAULTS = {
    rotation: 45,
    waves: 3,
    width: 120,
    hue: [11, 14],
    amplitude: 0.5,
    speed: [0.004, 0.008],
    saturation: 0.8,
    brightness: 1.0,
    cardAlpha: 0.85,
    headerAlpha: 0.7,
    sidebarAlpha: 0.8,
  };

  // Clamp value to valid range
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // Validate and sanitize a config value
  function sanitizeConfig(parsed) {
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    var clean = {};
    if (typeof parsed.waves === "number" && isFinite(parsed.waves))
      clean.waves = clamp(Math.round(parsed.waves), 1, 8);
    if (typeof parsed.width === "number" && isFinite(parsed.width))
      clean.width = clamp(Math.round(parsed.width), 20, 300);
    if (typeof parsed.rotation === "number" && isFinite(parsed.rotation))
      clean.rotation = clamp(parsed.rotation, 0, 360);
    if (typeof parsed.amplitude === "number" && isFinite(parsed.amplitude))
      clean.amplitude = clamp(parsed.amplitude, 0.1, 2.0);
    if (typeof parsed.cardAlpha === "number" && isFinite(parsed.cardAlpha))
      clean.cardAlpha = clamp(parsed.cardAlpha, 0, 1);
    if (typeof parsed.headerAlpha === "number" && isFinite(parsed.headerAlpha))
      clean.headerAlpha = clamp(parsed.headerAlpha, 0, 1);
    if (typeof parsed.saturation === "number" && isFinite(parsed.saturation))
      clean.saturation = clamp(parsed.saturation, 0, 1);
    if (typeof parsed.brightness === "number" && isFinite(parsed.brightness))
      clean.brightness = clamp(parsed.brightness, 0, 1);
    if (typeof parsed.sidebarAlpha === "number" && isFinite(parsed.sidebarAlpha))
      clean.sidebarAlpha = clamp(parsed.sidebarAlpha, 0, 1);
    if (Array.isArray(parsed.speed) && parsed.speed.length === 2 &&
        typeof parsed.speed[0] === "number" && typeof parsed.speed[1] === "number" &&
        isFinite(parsed.speed[0]) && isFinite(parsed.speed[1]))
      clean.speed = [clamp(parsed.speed[0], 0.001, 0.02), clamp(parsed.speed[1], 0.002, 0.04)];
    if (Array.isArray(parsed.hue) && parsed.hue.length === 2 &&
        typeof parsed.hue[0] === "number" && typeof parsed.hue[1] === "number" &&
        isFinite(parsed.hue[0]) && isFinite(parsed.hue[1]))
      clean.hue = [clamp(parsed.hue[0], 0, 30), clamp(parsed.hue[1], 0, 30)];
    return clean;
  }

  // Load saved config from localStorage
  function loadConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? sanitizeConfig(JSON.parse(raw)) : {};
    } catch (e) { return {}; }
  }

  function saveConfig(cfg) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  }

  // --- Per-panel enable/disable ---
  function getCurrentPanel() {
    return location.pathname;
  }

  function loadPanelStates() {
    try {
      var raw = localStorage.getItem(PANELS_KEY);
      var parsed = raw ? JSON.parse(raw) : {};
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
      return parsed;
    } catch (e) { return {}; }
  }

  function savePanelStates(states) {
    localStorage.setItem(PANELS_KEY, JSON.stringify(states));
  }

  function isPanelEnabled(path) {
    var states = loadPanelStates();
    // Default: enabled (true). Only disabled if explicitly set to false.
    return states[path] !== false;
  }

  function setPanelEnabled(path, enabled) {
    var states = loadPanelStates();
    if (enabled) {
      delete states[path]; // Remove entry = default (enabled)
    } else {
      states[path] = false;
    }
    savePanelStates(states);
  }

  // --- GUI ---
  function buildGUI(opts, state, reinit) {
    var panel = document.getElementById("ha-canvas-ribbons-gui");
    if (panel) { panel.style.display = panel.style.display === "none" ? "flex" : "none"; return; }

    var sliders = [
      { key: "waves",        label: T.waves,        min: 1,     max: 8,     step: 1,     val: opts.waves,        restart: true },
      { key: "width",        label: T.trailWidth,    min: 20,    max: 300,   step: 10,    val: opts.width         },
      { key: "rotation",     label: T.rotation,      min: 0,     max: 360,   step: 5,     val: opts.rotation      },
      { key: "amplitude",    label: T.amplitude,     min: 0.1,   max: 2.0,   step: 0.1,   val: opts.amplitude     },
      { key: "speedMin",     label: T.speedMin,      min: 0.001, max: 0.02,  step: 0.001, val: opts.speed[0]      },
      { key: "speedMax",     label: T.speedMax,      min: 0.002, max: 0.04,  step: 0.001, val: opts.speed[1]      },
      { key: "saturation",  label: T.saturation,    min: 0,     max: 1,     step: 0.05,  val: opts.saturation    },
      { key: "brightness",  label: T.brightness,    min: 0,     max: 1,     step: 0.05,  val: opts.brightness    },
      { key: "cardAlpha",   label: T.cardAlpha,     min: 0,     max: 1,     step: 0.05,  val: opts.cardAlpha     },
      { key: "headerAlpha",  label: T.headerAlpha,   min: 0,     max: 1,     step: 0.05,  val: opts.headerAlpha   },
      { key: "sidebarAlpha", label: T.sidebarAlpha,  min: 0,     max: 1,     step: 0.05,  val: opts.sidebarAlpha  },
    ];

    panel = document.createElement("div");
    panel.id = "ha-canvas-ribbons-gui";
    panel.style.cssText =
      "position:fixed;top:50%;right:16px;transform:translateY(-50%);z-index:1000;" +
      "background:rgba(20,20,24,0.95);border:1px solid rgba(255,255,255,0.15);border-radius:12px;" +
      "padding:16px 18px;display:flex;flex-direction:column;gap:6px;pointer-events:auto;" +
      "font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#eee;font-size:12px;" +
      "min-width:240px;box-shadow:0 8px 32px rgba(0,0,0,0.6);backdrop-filter:blur(12px);";

    // Title bar
    var titleBar = document.createElement("div");
    titleBar.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;";
    var title = document.createElement("span");
    title.textContent = T.title;
    title.style.cssText = "font-size:14px;font-weight:600;letter-spacing:0.3px;";
    var closeBtn = document.createElement("button");
    closeBtn.textContent = "\u2715";
    closeBtn.style.cssText = "background:none;border:none;color:#888;font-size:16px;cursor:pointer;padding:0 2px;";
    closeBtn.onclick = function () { panel.style.display = "none"; };
    titleBar.appendChild(title);
    titleBar.appendChild(closeBtn);
    panel.appendChild(titleBar);

    // Per-panel toggle
    var panelPath = getCurrentPanel();
    var toggleRow = document.createElement("div");
    toggleRow.style.cssText = "display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.08);margin-bottom:4px;";

    var toggleLabel = document.createElement("label");
    toggleLabel.style.cssText = "flex:1;color:#aaa;font-size:11px;cursor:pointer;display:flex;align-items:center;gap:6px;";

    var toggleCb = document.createElement("input");
    toggleCb.type = "checkbox";
    toggleCb.checked = isPanelEnabled(panelPath);
    toggleCb.style.cssText = "accent-color:#6d8fff;cursor:pointer;width:14px;height:14px;";

    var toggleText = document.createElement("span");
    toggleText.textContent = T.enablePanel;

    var panelPathLabel = document.createElement("div");
    panelPathLabel.textContent = panelPath;
    panelPathLabel.style.cssText = "color:#666;font-size:9px;font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;";

    toggleCb.onchange = function () {
      setPanelEnabled(panelPath, this.checked);
      var container = document.getElementById("ha-canvas-ribbons");
      var ribbonStyle = document.getElementById("ha-canvas-ribbons-style");
      if (this.checked) {
        if (container) container.style.display = "";
        if (ribbonStyle) ribbonStyle.disabled = false;
      } else {
        if (container) container.style.display = "none";
        if (ribbonStyle) ribbonStyle.disabled = true;
      }
    };

    toggleLabel.appendChild(toggleCb);
    toggleLabel.appendChild(toggleText);
    toggleRow.appendChild(toggleLabel);
    panel.appendChild(toggleRow);
    panel.appendChild(panelPathLabel);

    // --- Preset selector ---
    var presetRow = document.createElement("div");
    presetRow.style.cssText = "display:flex;align-items:center;gap:8px;padding:4px 0 6px 0;border-bottom:1px solid rgba(255,255,255,0.08);margin-bottom:4px;";
    var presetLbl = document.createElement("label");
    presetLbl.textContent = T.preset;
    presetLbl.style.cssText = "min-width:90px;color:#aaa;font-size:11px;";
    var presetSelect = document.createElement("select");
    presetSelect.style.cssText = "flex:1;background:rgba(255,255,255,0.08);color:#ccc;border:1px solid rgba(255,255,255,0.15);" +
      "border-radius:4px;padding:3px 6px;font-size:11px;cursor:pointer;outline:none;color-scheme:dark;";

    var customOpt = document.createElement("option");
    customOpt.value = "";
    customOpt.textContent = T.presetCustom;
    presetSelect.appendChild(customOpt);

    var lastCat = "";
    PRESETS.forEach(function (p) {
      if (p.cat !== lastCat) {
        var grp = document.createElement("optgroup");
        grp.label = T[p.cat] || p.cat;
        PRESETS.forEach(function (pp) {
          if (pp.cat === p.cat) {
            var o = document.createElement("option");
            o.value = pp.id;
            o.textContent = pp.name;
            grp.appendChild(o);
          }
        });
        presetSelect.appendChild(grp);
        lastCat = p.cat;
      }
    });

    var applyingPreset = false;

    function applyPreset(p) {
      applyingPreset = true;
      opts.waves = p.waves; opts.width = p.width; opts.rotation = p.rotation;
      opts.amplitude = p.amplitude; opts.speed = [p.speed[0], p.speed[1]];
      opts.hue = [p.hue[0], p.hue[1]]; opts.saturation = p.saturation;
      opts.brightness = p.brightness;

      // Update all slider inputs
      var inputs = panel.querySelectorAll("input[type=range]");
      inputs.forEach(function (inp) {
        var key = inp.dataset.key;
        if (!key) return;
        var v;
        if (key === "speedMin") v = opts.speed[0];
        else if (key === "speedMax") v = opts.speed[1];
        else if (key === "saturation") v = opts.saturation;
        else if (key === "brightness") v = opts.brightness;
        else v = opts[key];
        if (v !== undefined) {
          inp.value = v;
          var ev = new Event("input", { bubbles: true });
          inp.dispatchEvent(ev);
        }
      });

      // Update hue position/range sliders
      if (huePosInput) {
        huePos = (p.hue[0] + p.hue[1]) / 2;
        hueWidth = p.hue[1] - p.hue[0];
        huePosInput.value = huePos;
        huePosVal.textContent = huePos.toFixed(1);
        hueRngInput.value = hueWidth;
        hueRngVal.textContent = hueWidth.toFixed(1);
        huePosInput.style.background = buildRainbowGradient();
        updateHuePreview();
      }

      saveConfig({
        waves: opts.waves, width: opts.width, rotation: opts.rotation,
        amplitude: opts.amplitude, speed: [opts.speed[0], opts.speed[1]],
        hue: [opts.hue[0], opts.hue[1]], saturation: opts.saturation,
        brightness: opts.brightness, cardAlpha: opts.cardAlpha,
        headerAlpha: opts.headerAlpha, sidebarAlpha: opts.sidebarAlpha,
      });

      // Show restart hint for waves change
      var hint = document.getElementById("ribbon-restart-hint");
      if (!hint) {
        hint = document.createElement("div");
        hint.id = "ribbon-restart-hint";
        hint.style.cssText = "color:#f90;font-size:11px;text-align:center;padding:2px 0;";
        hint.textContent = T.refreshHint;
        panel.appendChild(hint);
      }
      applyingPreset = false;
    }

    presetSelect.onchange = function () {
      var id = this.value;
      if (!id) return;
      var p = PRESETS.find(function (x) { return x.id === id; });
      if (p) applyPreset(p);
    };

    presetRow.appendChild(presetLbl);
    presetRow.appendChild(presetSelect);
    panel.appendChild(presetRow);

    var valueDisplays = {};

    function updateStyle() {
      var s = document.getElementById("ha-canvas-ribbons-style");
      if (!s) return;
      var cA = "rgba(32,33,36," + opts.cardAlpha + ")";
      var hA = "rgba(32,33,36," + opts.headerAlpha + ")";
      var sA = "rgba(32,33,36," + opts.sidebarAlpha + ")";
      s.textContent =
        "html, body { background: #000 !important; }\n" +
        "home-assistant {\n" +
        "  --primary-background-color: transparent !important;\n" +
        "  --secondary-background-color: rgba(0,0,0,0.3) !important;\n" +
        "  --card-background-color: " + cA + " !important;\n" +
        "  --ha-card-background: " + cA + " !important;\n" +
        "  --app-header-background-color: " + hA + " !important;\n" +
        "  --sidebar-background-color: " + sA + " !important;\n" +
        "  --divider-color: rgba(255,255,255,0.08) !important;\n" +
        "}";
    }

    sliders.forEach(function (s) {
      var row = document.createElement("div");
      row.style.cssText = "display:flex;align-items:center;gap:8px;";

      var lbl = document.createElement("label");
      lbl.textContent = s.label;
      lbl.style.cssText = "min-width:90px;color:#aaa;font-size:11px;";

      var input = document.createElement("input");
      input.type = "range";
      input.dataset.key = s.key;
      input.min = s.min;
      input.max = s.max;
      input.step = s.step;
      input.value = s.val;
      input.style.cssText = "flex:1;accent-color:#6d8fff;height:4px;cursor:pointer;";

      var valSpan = document.createElement("span");
      valSpan.textContent = Number(s.val).toFixed(s.step < 1 ? String(s.step).split(".")[1].length : 0);
      valSpan.style.cssText = "min-width:36px;text-align:right;font-size:11px;color:#ccc;font-variant-numeric:tabular-nums;";
      valueDisplays[s.key] = valSpan;

      input.oninput = function () {
        var v = parseFloat(this.value);
        var decimals = s.step < 1 ? String(s.step).split(".")[1].length : 0;
        valSpan.textContent = v.toFixed(decimals);
        if (!applyingPreset) presetSelect.value = "";

        if (s.key === "speedMin") { opts.speed[0] = v; }
        else if (s.key === "speedMax") { opts.speed[1] = v; }
        else { opts[s.key] = v; }

        if (s.key === "cardAlpha" || s.key === "headerAlpha" || s.key === "sidebarAlpha") {
          updateStyle();
        }
        if (s.key === "saturation" || s.key === "brightness") {
          if (huePosInput) huePosInput.style.background = buildRainbowGradient();
          updateHuePreview();
        }

        // Save to localStorage
        saveConfig({
          waves: opts.waves, width: opts.width, rotation: opts.rotation,
          amplitude: opts.amplitude, speed: [opts.speed[0], opts.speed[1]],
          hue: [opts.hue[0], opts.hue[1]], saturation: opts.saturation,
          brightness: opts.brightness, cardAlpha: opts.cardAlpha,
          headerAlpha: opts.headerAlpha, sidebarAlpha: opts.sidebarAlpha,
        });

        if (s.restart) {
          // Show restart hint
          var hint = document.getElementById("ribbon-restart-hint");
          if (!hint) {
            hint = document.createElement("div");
            hint.id = "ribbon-restart-hint";
            hint.style.cssText = "color:#f90;font-size:11px;text-align:center;padding:2px 0;";
            hint.textContent = T.refreshHint;
            panel.appendChild(hint);
          }
        }
      };

      row.appendChild(lbl);
      row.appendChild(input);
      row.appendChild(valSpan);
      panel.appendChild(row);
    });

    // Inject slider thumb styles for hue rainbow slider
    if (!document.getElementById("ha-canvas-ribbons-hue-style")) {
      var hueStyle = document.createElement("style");
      hueStyle.id = "ha-canvas-ribbons-hue-style";
      hueStyle.textContent =
        "#ha-canvas-ribbons-hue::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid #333;box-shadow:0 1px 4px rgba(0,0,0,0.5);cursor:pointer;}" +
        "#ha-canvas-ribbons-hue::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid #333;box-shadow:0 1px 4px rgba(0,0,0,0.5);cursor:pointer;}" +
        "#ha-canvas-ribbons-hue::-moz-range-track{height:12px;border-radius:6px;}";
      document.head.appendChild(hueStyle);
    }

    // --- Hue position + range sliders with color preview ---
    function hueToRgb(h) {
      var r0 = 127 * Math.sin(0.3 * h) + 128;
      var g0 = 127 * Math.sin(0.3 * h + 2) + 128;
      var b0 = 127 * Math.sin(0.3 * h + 4) + 128;
      var gray = (r0 + g0 + b0) / 3;
      var sat = opts.saturation, brt = opts.brightness;
      var r = Math.floor((gray + (r0 - gray) * sat) * brt);
      var g = Math.floor((gray + (g0 - gray) * sat) * brt);
      var b = Math.floor((gray + (b0 - gray) * sat) * brt);
      return "rgb(" + r + "," + g + "," + b + ")";
    }

    function buildRainbowGradient() {
      var stops = [];
      for (var i = 0; i <= 10; i++) {
        var h = (i / 10) * 30;
        stops.push(hueToRgb(h) + " " + (i * 10) + "%");
      }
      return "linear-gradient(to right," + stops.join(",") + ")";
    }

    var huePos = (opts.hue[0] + opts.hue[1]) / 2;
    var hueWidth = opts.hue[1] - opts.hue[0];

    function updateHuePreview() {
      if (huePreviewBar) {
        var lo = Math.max(0, huePos - hueWidth / 2);
        var hi = Math.min(30, huePos + hueWidth / 2);
        var stops = [];
        var steps = Math.max(2, Math.round((hi - lo) * 2));
        for (var i = 0; i <= steps; i++) {
          var h = lo + (i / steps) * (hi - lo);
          stops.push(hueToRgb(h));
        }
        huePreviewBar.style.background = stops.length > 1
          ? "linear-gradient(to right," + stops.join(",") + ")"
          : stops[0];
      }
    }

    function onHueChange() {
      opts.hue[0] = Math.max(0, huePos - hueWidth / 2);
      opts.hue[1] = Math.min(30, huePos + hueWidth / 2);
      updateHuePreview();
      saveConfig({
        waves: opts.waves, width: opts.width, rotation: opts.rotation,
        amplitude: opts.amplitude, speed: [opts.speed[0], opts.speed[1]],
        hue: [opts.hue[0], opts.hue[1]], cardAlpha: opts.cardAlpha,
        headerAlpha: opts.headerAlpha, sidebarAlpha: opts.sidebarAlpha,
      });
    }

    // Hue position slider
    var huePosRow = document.createElement("div");
    huePosRow.style.cssText = "display:flex;align-items:center;gap:8px;";
    var huePosLbl = document.createElement("label");
    huePosLbl.textContent = T.huePosition;
    huePosLbl.style.cssText = "min-width:90px;color:#aaa;font-size:11px;";
    var huePosInput = document.createElement("input");
    huePosInput.id = "ha-canvas-ribbons-hue";
    huePosInput.type = "range";
    huePosInput.min = 0;
    huePosInput.max = 30;
    huePosInput.step = 0.5;
    huePosInput.value = huePos;
    huePosInput.style.cssText = "flex:1;height:12px;cursor:pointer;-webkit-appearance:none;appearance:none;" +
      "border-radius:6px;outline:none;background:" + buildRainbowGradient() + ";";
    var huePosVal = document.createElement("span");
    huePosVal.textContent = huePos.toFixed(1);
    huePosVal.style.cssText = "min-width:36px;text-align:right;font-size:11px;color:#ccc;font-variant-numeric:tabular-nums;";
    huePosInput.oninput = function () {
      huePos = parseFloat(this.value);
      huePosVal.textContent = huePos.toFixed(1);
      if (!applyingPreset) presetSelect.value = "";
      onHueChange();
    };
    huePosRow.appendChild(huePosLbl);
    huePosRow.appendChild(huePosInput);
    huePosRow.appendChild(huePosVal);
    panel.appendChild(huePosRow);

    // Hue range slider
    var hueRngRow = document.createElement("div");
    hueRngRow.style.cssText = "display:flex;align-items:center;gap:8px;";
    var hueRngLbl = document.createElement("label");
    hueRngLbl.textContent = T.hueRange;
    hueRngLbl.style.cssText = "min-width:90px;color:#aaa;font-size:11px;";
    var hueRngInput = document.createElement("input");
    hueRngInput.type = "range";
    hueRngInput.min = 0;
    hueRngInput.max = 15;
    hueRngInput.step = 0.5;
    hueRngInput.value = hueWidth;
    hueRngInput.style.cssText = "flex:1;accent-color:#6d8fff;height:4px;cursor:pointer;";
    var hueRngVal = document.createElement("span");
    hueRngVal.textContent = hueWidth.toFixed(1);
    hueRngVal.style.cssText = "min-width:36px;text-align:right;font-size:11px;color:#ccc;font-variant-numeric:tabular-nums;";
    hueRngInput.oninput = function () {
      hueWidth = parseFloat(this.value);
      hueRngVal.textContent = hueWidth.toFixed(1);
      if (!applyingPreset) presetSelect.value = "";
      onHueChange();
    };
    hueRngRow.appendChild(hueRngLbl);
    hueRngRow.appendChild(hueRngInput);
    hueRngRow.appendChild(hueRngVal);
    panel.appendChild(hueRngRow);

    // Color preview bar
    var huePreviewBar = document.createElement("div");
    huePreviewBar.style.cssText = "height:8px;border-radius:4px;margin:2px 0 4px 0;";
    updateHuePreview();
    panel.appendChild(huePreviewBar);

    // Reset button
    var btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex;gap:8px;margin-top:6px;";

    var resetBtn = document.createElement("button");
    resetBtn.textContent = T.reset;
    resetBtn.style.cssText =
      "flex:1;padding:6px 0;border:1px solid rgba(255,255,255,0.15);border-radius:6px;" +
      "background:rgba(255,255,255,0.06);color:#ccc;cursor:pointer;font-size:11px;";
    resetBtn.onclick = function () {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    };
    btnRow.appendChild(resetBtn);

    var saveBtn = document.createElement("button");
    saveBtn.textContent = T.saveClose;
    saveBtn.style.cssText =
      "flex:1;padding:6px 0;border:1px solid rgba(100,140,255,0.4);border-radius:6px;" +
      "background:rgba(109,143,255,0.25);color:#9db8ff;cursor:pointer;font-size:11px;font-weight:600;";
    saveBtn.onclick = function () { panel.style.display = "none"; };
    btnRow.appendChild(saveBtn);
    panel.appendChild(btnRow);

    // Version + GitHub link
    var ver = document.createElement("div");
    ver.style.cssText = "text-align:center;font-size:10px;margin-top:2px;";
    var verText = document.createTextNode("v" + VERSION + " \u2022 ");
    var ghLink = document.createElement("a");
    ghLink.href = "https://github.com/jrx-code/ha-canvas-ribbons";
    ghLink.target = "_blank";
    ghLink.rel = "noopener noreferrer";
    ghLink.textContent = "GitHub";
    ghLink.style.cssText = "color:#6d8fff;text-decoration:none;";
    ver.style.color = "#555";
    ver.appendChild(verText);
    ver.appendChild(ghLink);
    panel.appendChild(ver);

    document.body.appendChild(panel);
  }

  // --- Floating toggle button ---
  function createToggleButton(opts, state) {
    var btn = document.createElement("button");
    btn.id = "ha-canvas-ribbons-toggle";
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    var path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", "M4 12c0 0 4-8 8-8s8 8 8 8-4 8-8 8-8-8-8-8z");
    var circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", "12");
    circle.setAttribute("cy", "12");
    circle.setAttribute("r", "3");
    svg.appendChild(path);
    svg.appendChild(circle);
    btn.appendChild(svg);
    btn.style.cssText =
      "position:fixed;bottom:16px;right:16px;z-index:999;width:40px;height:40px;" +
      "border-radius:50%;border:1px solid rgba(255,255,255,0.15);background:rgba(20,20,24,0.8);" +
      "color:#6d8fff;cursor:pointer;display:flex;align-items:center;justify-content:center;" +
      "pointer-events:auto;box-shadow:0 2px 12px rgba(0,0,0,0.4);backdrop-filter:blur(8px);" +
      "transition:transform 0.15s,background 0.15s;";
    btn.onmouseenter = function () { btn.style.transform = "scale(1.1)"; btn.style.background = "rgba(40,40,48,0.9)"; };
    btn.onmouseleave = function () { btn.style.transform = "scale(1)"; btn.style.background = "rgba(20,20,24,0.8)"; };
    btn.onclick = function () { buildGUI(opts, state); };
    document.body.appendChild(btn);
  }

  // --- Main ---
  function createRibbonCanvas() {
    if (document.getElementById("ha-canvas-ribbons")) {
      console.info("[ha-canvas-ribbons] v" + VERSION + " already injected");
      return;
    }

    // Merge: defaults < localStorage < window config (all validated)
    var saved = loadConfig();
    var windowCfg = sanitizeConfig(window.canvasRibbonsConfig || {});
    var opts = Object.assign({}, DEFAULTS, saved, windowCfg);

    // Ensure arrays are proper
    if (!Array.isArray(opts.speed)) opts.speed = [DEFAULTS.speed[0], DEFAULTS.speed[1]];
    if (!Array.isArray(opts.hue)) opts.hue = [DEFAULTS.hue[0], DEFAULTS.hue[1]];

    // Container
    var container = document.createElement("div");
    container.id = "ha-canvas-ribbons";
    container.style.cssText =
      "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:0;pointer-events:none;";

    var canvas = document.createElement("canvas");
    container.appendChild(canvas);
    document.body.prepend(container);

    // Transparent HA theme
    var style = document.createElement("style");
    style.id = "ha-canvas-ribbons-style";
    function applyStyle() {
      var cA = "rgba(32,33,36," + opts.cardAlpha + ")";
      var hA = "rgba(32,33,36," + opts.headerAlpha + ")";
      var sA = "rgba(32,33,36," + opts.sidebarAlpha + ")";
      style.textContent =
        "html, body { background: #000 !important; }\n" +
        "home-assistant {\n" +
        "  --primary-background-color: transparent !important;\n" +
        "  --secondary-background-color: rgba(0,0,0,0.3) !important;\n" +
        "  --card-background-color: " + cA + " !important;\n" +
        "  --ha-card-background: " + cA + " !important;\n" +
        "  --app-header-background-color: " + hA + " !important;\n" +
        "  --sidebar-background-color: " + sA + " !important;\n" +
        "  --divider-color: rgba(255,255,255,0.08) !important;\n" +
        "}";
    }
    applyStyle();
    document.head.appendChild(style);

    // Canvas state
    var ctx = canvas.getContext("2d");
    var state = {
      hue: opts.hue[0], hueFw: true, color: "rgba(128,128,128,0.1)",
      w: 0, h: 0, cx: 0, cy: 0, radius: 0, gradient: null, lastColor: null,
      options: opts,
    };

    function resize() {
      var s = Math.min(window.devicePixelRatio || 1, 1.25);
      var w = window.innerWidth, h = window.innerHeight;
      canvas.width = w * s;
      canvas.height = h * s;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      state.w = canvas.width;
      state.h = canvas.height;
      state.cx = state.w / 2;
      state.cy = state.h / 2;
      state.radius = Math.sqrt(state.w * state.w + state.h * state.h) / 2;
      state.gradient = null;
    }

    resize();
    window.addEventListener("resize", resize);

    // Waves (clamped as defense-in-depth against malformed config)
    var waves = [];
    for (var i = 0; i < Math.min(opts.waves, 8); i++) waves.push(new Wave(state));

    function updateColor() {
      state.hue += state.hueFw ? 0.01 : -0.01;
      if (state.hue > opts.hue[1]) { state.hue = opts.hue[1]; state.hueFw = false; }
      else if (state.hue < opts.hue[0]) { state.hue = opts.hue[0]; state.hueFw = true; }
      var r0 = 127 * Math.sin(0.3 * state.hue) + 128;
      var g0 = 127 * Math.sin(0.3 * state.hue + 2) + 128;
      var b0 = 127 * Math.sin(0.3 * state.hue + 4) + 128;
      var gray = (r0 + g0 + b0) / 3;
      var sat = opts.saturation, brt = opts.brightness;
      var r = Math.floor((gray + (r0 - gray) * sat) * brt);
      var g = Math.floor((gray + (g0 - gray) * sat) * brt);
      var b = Math.floor((gray + (b0 - gray) * sat) * brt);
      state.color = "rgba(" + r + "," + g + "," + b + ",0.1)";
    }

    // Preload (clamped to safe maximums as defense-in-depth)
    var safeWaves = Math.min(opts.waves, 8);
    var safeWidth = Math.min(opts.width, 300);
    for (var i = 0; i < safeWaves; i++) {
      updateColor();
      for (var j = 0; j < safeWidth; j++) waves[i].update();
    }

    var rafId = null;
    var running = true;

    function render() {
      if (!running) return;
      updateColor();
      ctx.clearRect(0, 0, state.w, state.h);

      if (!state.gradient || state.lastColor !== state.color) {
        state.gradient = ctx.createLinearGradient(0, 0, 0, state.h);
        state.gradient.addColorStop(0, "#000");
        state.gradient.addColorStop(1, state.color);
        state.lastColor = state.color;
      }
      ctx.fillStyle = state.gradient;
      ctx.fillRect(0, 0, state.w, state.h);

      ctx.lineWidth = 1;
      for (var k = 0; k < waves.length; k++) { waves[k].update(); waves[k].draw(ctx); }
      rafId = requestAnimationFrame(render);
    }

    // Pause animation when tab is hidden to save resources
    function onVisibilityChange() {
      if (document.hidden) {
        running = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      } else if (isPanelEnabled(getCurrentPanel())) {
        running = true;
        render();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Check per-panel state on init
    var currentEnabled = isPanelEnabled(getCurrentPanel());
    if (!currentEnabled) {
      container.style.display = "none";
      style.disabled = true;
      running = false;
    }

    if (running) render();

    // Listen for HA SPA navigation to show/hide per-panel
    function onNavigate() {
      var enabled = isPanelEnabled(getCurrentPanel());
      if (enabled && !running) {
        container.style.display = "";
        style.disabled = false;
        running = true;
        render();
      } else if (!enabled && running) {
        running = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        container.style.display = "none";
        style.disabled = true;
      }
      // Update GUI toggle if open
      var gui = document.getElementById("ha-canvas-ribbons-gui");
      if (gui) {
        var cb = gui.querySelector("input[type=checkbox]");
        if (cb) cb.checked = enabled;
      }
    }
    // HA fires 'location-changed' on window for SPA navigation
    window.addEventListener("location-changed", onNavigate);
    window.addEventListener("popstate", onNavigate);

    // Cleanup function for proper resource release
    window._haCanvasRibbonsDestroy = function () {
      running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      window.removeEventListener("resize", resize);
      window.removeEventListener("location-changed", onNavigate);
      window.removeEventListener("popstate", onNavigate);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      var el = document.getElementById("ha-canvas-ribbons");
      if (el) el.remove();
      var st = document.getElementById("ha-canvas-ribbons-style");
      if (st) st.remove();
      var gui = document.getElementById("ha-canvas-ribbons-gui");
      if (gui) gui.remove();
      var tog = document.getElementById("ha-canvas-ribbons-toggle");
      if (tog) tog.remove();
      var hs = document.getElementById("ha-canvas-ribbons-hue-style");
      if (hs) hs.remove();
      delete window._haCanvasRibbonsDestroy;
    };

    // GUI toggle button
    createToggleButton(opts, state);

    console.info("[ha-canvas-ribbons] v" + VERSION + " loaded — " + opts.waves + " waves, width " + opts.width);
  }

  if (document.body) {
    createRibbonCanvas();
  } else {
    document.addEventListener("DOMContentLoaded", createRibbonCanvas);
  }
})();
