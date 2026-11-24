# 📘 UIL `v5.0.6` — Quick Reference

A lightweight, zero-dependency JavaScript UI library featuring DOM, SVG, and full 3D Canvas/WebGL display support.

---

## Table of Contents
1. [Quick Start (`Gui`)](#1-quick-start-gui)
2. [Adding Controls (`add`) & Widget Catalog](#2-adding-controls-add--widget-catalog)
3. [Common Control API (`Proto`)](#3-common-control-api-proto)
4. [Theming & Customization (`Tools.colors`)](#4-theming--customization-toolscolors)
5. [Built-in Utilities (`Files` & 3D Canvas)](#5-built-in-utilities-files--3d-canvas)

---

## 1. Quick Start (`Gui`)

```javascript
import { UIL, Gui, add, Tools, Files } from './uil.js';

const ui = new Gui({
    w: 300,                 // Panel width in px (default: 320)
    h: 24,                  // Default row height in px (default: 24)
    p: 30,                  // Label width percentage (default: 30)
    css: 'right:10px;',     // Custom CSS positioning
    center: false,          // Center horizontally
    bottom: 0,              // Anchor to bottom at X px
    open: true,             // Open on startup (default: true)
    close: true,            // Show bottom open/close bar
    topClose: false,        // Collapsible top button ('left' | 'right' | true)
    maxHeight: 0,           // Max height before scrollbar appears
    isCanvas: false,        // Render UI to an offscreen <canvas> (for 3D textures)
    canvasScale: 1,         // Resolution multiplier in Canvas mode
    colors: {               // Theme overrides (see Section 4)
        select: '#308AFF',
        radius: 4
    }
});
```

---

## 2. Adding Controls (`add`) & Widget Catalog

Two syntaxes are supported:

```javascript
// 1. Declarative
ui.add('slide', { name: 'Speed', min: 0, max: 100, value: 50 })
  .onChange(val => console.log(val));

// 2. Object-bound (dat.GUI style) — auto-detects control type
const params = { speed: 50, active: true, color: '#308AFF', mode: 'A' };
ui.add(params, 'speed', { min: 0, max: 100 });
ui.add(params, 'active');
ui.add(params, 'color');
ui.add(params, 'mode', { list: ['A', 'B', 'C'] });
```

### Widget Catalog

| Type | Aliases | Specific Options | Description |
| :--- | :--- | :--- | :--- |
| **`slide`** | — | `min`, `max`, `step`, `precision`, `editable` (bool), `mode` (0..3), `isDeg`, `isTime`, `cyclic`, `allway` | Numeric slider with optional keyboard input (`Tab` supported when `editable: true`) |
| **`numeric`** | `number` | `value` (number, `[x,y,z]` or `{x,y,z}`), `min`, `max`, `step`, `precision`, `drag`, `isAngle`, `center` | Single or multi-component vector number boxes |
| **`string`** | `textInput` | `value`, `placeHolder`, `edit` (bool), `allway` | Editable text field (`Tab` / `Shift+Tab` navigation) |
| **`bool`** | `boolean` | `value`, `onName`, `mode` (0: switch, 1: button, 2: checkbox) | Toggle switch, button, or checkbox |
| **`button`** | — | `values` (string or array), `bw`, `space`, `onName`, `selectable`, `unselect` | Single button or multi-button bar |
| **`selector`** | — | Same as `button` (`selectable: true` by default) | Exclusive multi-option selector |
| **`grid`** | — | `values` (array or object), `bsize: [w, h]`, `spaces: [x, y]`, `selectable` | 2-column button grid |
| **`list`** | — | `list` (array or object), `openItem`, `full`, `side` ('up'/'down'), `path`, `format`, `miniIcon`, `emojii` | Dropdown menu with accelerated wheel scrolling |
| **`color`** | — | `value` (hex, int, `[r,g,b]`, `THREE.Color`), `ctype` ('hex'/'html'/'rgb'/'array'), `side`, `open` | Hue ring + HSL triangle color picker |
| **`knob`** | — | `min`, `max`, `step`, `diam`, `mode` (0..2), `limit`, `cyclic` | Rotary potentiometer |
| **`circular`**| — | `min`, `max`, `step`, `diam`, `mode` (0..1), `cyclic` | Interactive circular progress gauge |
| **`pad2d`** | `pad` | `value: [x, y]`, `min`, `max`, `diam`, `mode` (0..1), `flipY` | 2D XY touch pad |
| **`joystick`**| — | `diam`, `mode` (0: 3D, 1: flat), `multiplicator`, `precision`, `text` | Spring-return analog joystick |
| **`graph`** | — | `value: [...]`, `multiplicator`, `neg`, `line`, `precision` | Multi-point bar / curve editor |
| **`bitmap`** | — | `value` (`THREE.Texture`), `colorSpace` | Image loader with live preview and texture auto-update |
| **`group`** | — | `name`, `mark` (hex color), `open`, `bgAlpha` | Collapsible folder (supports nested groups) |
| **`title`** | `text`, `note` | `name`, `align` ('left'/'center'/'right'), `fontSize`, `weight`, `color` | Header or informational label (supports HTML) |
| **`empty`** | `space` | `h` (height in px) | Invisible vertical spacer |
| **`fps`** | — | `custom`, `names`, `range`, `cc`, `res` | Real-time FPS / MS / Memory performance monitor |
| **`checker`** | — | `name` | Collapsible 24-swatch color calibration chart |
| **`item`** | — | `name`, `itype` ('solid', 'body', 'vehicle', 'joint', 'object'...) | List item with built-in SVG icon (for `itemMode: true`) |
| **`select`** | — | `value`, `onActif` | Eyedropper / active selection tool button |

---

## 3. Common Control API (`Proto`)

All widgets inherit from `Proto` and expose chainable methods:

```javascript
const ctrl = ui.add('slide', { name: 'Force', min: 0, max: 10 })
    .onChange(v => { /* triggered on every change */ })
    .onFinishChange(v => { /* triggered on release (alias: .onEnd()) */ })
    .listen(); // Auto-syncs UI when the bound object property changes externally

ctrl.setValue(5);       // Set value programmatically without firing onChange
ctrl.rename('Gravity'); // Update label text
ctrl.display(false);    // Toggle visibility
ctrl.dispose();         // Cleanly remove widget from DOM and memory
```

### Panel Methods (`Gui`)
* `ui.clear()` / `ui.empty()` — Remove all controls from the panel.
* `ui.remove(ctrl)` — Remove a single control.
* `ui.setLeft(x)` / `ui.setTop(y, maxHeight)` — Reposition the panel and update hit zones.
* `ui.hide(bool)` / `ui.display(bool)` — Hide or show the entire panel.
* `ui.dispose()` — Destroy the panel and unbind all events.

---

## 4. Theming & Customization (`Tools.colors`)

Pass any of these properties inside `new Gui({...})` or an individual widget's options object:

* **Layout:** `sx` (horizontal gap, default `4`), `sy` (vertical gap, default `0`), `radius` (corner radius in px or `'50%'`, default `0`), `borderSize` (default `1`).
* **Colors:** `background`, `backgroundOver`, `content`, `button`, `overoff`, `select`, `over`, `action`, `text`, `textOver`, `textSelect`, `title`, `back`, `backoff`, `border`, `gborder`.
* **Typography:** `fontFamily`, `fontSize` (default `11`), `fontWeight`, `fontShadow`.

```javascript
// Global theme update
Tools.setStyle({ select: '#FF3300', radius: 4, fontSize: 12 });
```

---

## 5. Built-in Utilities (`Files` & 3D Canvas)

### File Loader & Saver (`Files`)
```javascript
// Load a file ('image' | 'json' | 'text' | 'bin' | 'svg' | 'hdr' | 'exr' | 'ktx2'...)
const res = await Files.load({ type: 'image' });
if (res) console.log(res.data, res.name, res.dim);

// Save a file
await Files.save({ name: 'config', type: 'json', data: JSON.stringify(params) });
```

### 3D Canvas Rendering (Three.js / WebGL)
```javascript
const gui3D = new Gui({ w: 256, isCanvas: true, canvasScale: 2 });
gui3D.onDraw = () => { texture.needsUpdate = true; };

// Forward raycast UV coordinates (0..1) to UIL:
gui3D.setMouse(uv);
gui3D.triggerMouseUV('down', uv.x, uv.y); // 'down' | 'move' | 'up'
```
