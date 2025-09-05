// proto/TreeList.js
import { Proto } from '../core/Proto.js';
import { Tools } from '../core/Tools.js';
import { Roots } from '../core/Roots.js';

export class TreeList extends Proto {
  constructor(o = {}) {
    // Propiedades públicas esperadas (API)
    // o.tree (obj/array), o.value (array), o.focused (bool),
    // o.focusPath (array), o.focusLevel (number),
    // o.tabIndex, o.itemIndex, o.onChange (fn)
    o.selectable = true;           // navegable por teclado si activas flechas
    o.name = o.name || 'TreeList';
    super(o);

    // Datos & estado
    this.tree       = o.tree || {};
    this.value      = Array.isArray(o.value) ? o.value.slice() : [];
    this.focused    = !!o.focused;
    this.focusPath  = Array.isArray(o.focusPath) ? o.focusPath.slice() : [];
    this.focusLevel = typeof o.focusLevel === 'number' ? o.focusLevel : -1;

    this.tabIndex   = o.tabIndex ?? null;
    this.itemIndex  = o.itemIndex ?? null;

    // Callback de notificación
    this.changeCb   = typeof o.onChange === 'function' ? o.onChange : (/*tabIdx, itemIdx, newPath*/) => {};

    // Layout interno
    this.levels = [];   // [{type:'map'|'list', items:[{key,label,zone}], zone:{x,y,w,h}}...]
    this.leafMax = 0;   // alto reservado para el último nivel (máximo tamaño de hoja)
    this.levelGap = 2;  // gap vertical entre niveles
    this.hItem    = this.h;  // alto por ítem

    // Hover / foco de mouse
    this.hover = { level: -1, index: -1 };

    // DOM visual (sin listeners directos; los eventos llegan vía Roots->handleEvent)
    this.c[2] = this.dom('div', this.css.basic + 'left:0; top:0; width:100%; height:100%;'); // container interno
    this.s[2] = this.c[2].style;

    // Inicializa nodos visuales de forma perezosa en rSize()
    this.itemsDom = []; // mirror de this.levels (matriz de nodos)

    this.init();
  }

  // =============== Helpers de datos ===============

  static isMap(node)  { return node && typeof node === 'object' && !Array.isArray(node); }
  static isList(node) { return Array.isArray(node); }

  // Devuelve el subnodo al seguir path (se detiene si no existe)
  getNodeAtPath(path) {
    let node = this.tree;
    for (let i = 0; i < path.length; i++) {
      if (TreeList.isMap(node)) {
        if (!Object.prototype.hasOwnProperty.call(node, path[i])) return { node: null, depth: i };
        node = node[path[i]];
      } else if (TreeList.isList(node)) {
        // Al llegar a lista, ya no hay más descendencia válida para claves
        if (i < path.length) return { node, depth: i }; 
      } else {
        return { node: null, depth: i };
      }
    }
    return { node, depth: path.length };
  }

  // Autocompleta descendiendo por la primera clave de cada mapa hasta alcanzar una lista
  autoCompleteToLeaf(basePath) {
    let nodeInfo = this.getNodeAtPath(basePath);
    let node = nodeInfo.node;
    const path = basePath.slice();

    while (TreeList.isMap(node)) {
      const keys = Object.keys(node);
      if (!keys.length) break; // mapa vacío
      const k0 = keys[0];
      path.push(k0);
      node = node[k0];
    }
    // Si termina en lista, NO agrega selección final de elemento hoja
    return path;
  }

  // Ruta activa para construir niveles (focusPath si focused, si no value)
  getActivePath() {
    return this.focused ? this.focusPath : this.value;
  }

  // Calcula el máximo tamaño de hoja del árbol (para reservar alto estable)
  computeLeafMax(node = this.tree) {
    if (TreeList.isList(node)) return node.length;
    if (!TreeList.isMap(node)) return 0;
    let m = 0;
    for (const k of Object.keys(node)) {
      m = Math.max(m, this.computeLeafMax(node[k]));
    }
    return m;
  }

  // =============== Construcción de niveles (modelo lógico) ===============

  buildLevels() {
    this.levels.length = 0;
    const activePath = this.getActivePath();

    let node = this.tree;
    let level = 0;

    while (node) {
      if (TreeList.isMap(node)) {
        // Opciones = claves del mapa (nivel intermedio)
        const keys = Object.keys(node);
        if (!keys.length) break; // detener expansión si vacío
        this.levels.push({ type: 'map', items: keys.map(k => ({ key: k, label: k, zone: {x:0,y:0,w:0,h:0} })), zone: {x:0,y:0,w:0,h:this.hItem} });

        // Avanza según la ruta activa (si existe), sino se detiene
        const nextKey = activePath[level];
        if (!nextKey || !node.hasOwnProperty(nextKey)) break;
        node = node[nextKey];
      } else if (TreeList.isList(node)) {
        // Último nivel: lista/hoja (vertical)
        const items = node.map(label => ({ key: label, label, zone: {x:0,y:0,w:0,h:0} }));
        this.levels.push({ type: 'list', items, zone: {x:0,y:0,w:0,h: Math.max(items.length, this.leafMax) * this.hItem } });
        break; // fin
      } else {
        break; // nodo inválido
      }
      level++;
    }
  }

  // =============== Layout (zonas internas) ===============

  // Calcula zonas internas de cada ítem/level y construye/actualiza dom
  layoutLevels() {
    const padX = 8;
    const w = this.zone.w - padX * 2;
    let y = 0;

    // Asegura `itemsDom` anidado por nivel
    while (this.itemsDom.length < this.levels.length) this.itemsDom.push([]);
    // Limpia extra DOM si niveles disminuyen
    for (let L = this.levels.length; L < this.itemsDom.length; L++) {
      for (const el of this.itemsDom[L]) if (el && el.parentNode) el.parentNode.removeChild(el);
    }
    this.itemsDom.length = this.levels.length;

    for (let L = 0; L < this.levels.length; L++) {
      const lvl = this.levels[L];
      if (lvl.type === 'map') {
        const n = Math.max(1, lvl.items.length);
        const cellW = Math.floor(w / n);
        lvl.zone = { x: padX, y, w, h: this.hItem };
        let x = padX;
        // Asegura contenedor dom de nivel si querés uno (opcional)
        for (let i = 0; i < lvl.items.length; i++) {
          const it = lvl.items[i];
          it.zone = { x, y, w: cellW, h: this.hItem };

          // crea/actualiza nodo visual
          const dom = this.ensureItemDom(L, i);
          this.paintItemDom(dom, L, i, it, 'map');

          x += cellW;
        }
        y += this.hItem + this.levelGap;
      } else {
        // lista/hoja vertical
        const n = lvl.items.length;
        const hList = Math.max(n, this.leafMax) * this.hItem;
        lvl.zone = { x: padX, y, w, h: hList };

        for (let i = 0; i < Math.max(n, this.leafMax); i++) {
          // Puede haber "espacio vacío" si n < leafMax
          const isReal = i < n;
          const it = isReal ? lvl.items[i] : { key: null, label: '', zone: {x:0,y:0,w:0,h:0} };
          it.zone = { x: padX, y: y + i * this.hItem, w, h: this.hItem };

          const dom = this.ensureItemDom(L, i);
          this.paintItemDom(dom, L, i, it, 'list', isReal);
        }
        y += hList;
      }
    }

    // Ajusta alto visible del control
    const totalH = y;
    this.zone.h = totalH + this.margin; // Proto se encarga del margen
    this.s[0].height = this.zone.h + 'px';
    this.s[2].height = totalH + 'px';
  }

  ensureItemDom(L, i) {
    const row = this.itemsDom[L];
    while (row.length <= i) row.push(null);
    if (!row[i]) {
      // Cada ítem es un DIV posicionado absoluto dentro de this.c[2]
      const div = this.dom('div', Tools.css.txt + 'position:absolute; pointer-events:none;');
      this.c[2].appendChild(div);
      row[i] = div;
    }
    return row[i];
  }

  // Colorea y posiciona el DOM del ítem según estados (seleccionado / foco)
  paintItemDom(div, L, i, it, kind, isReal = true) {
    const s = div.style;
    const cc = this.colors;

    // Posición
    s.left = it.zone.x + 'px';
    s.top  = it.zone.y + 'px';
    s.width  = it.zone.w + 'px';
    s.height = (it.zone.h - 2) + 'px';  // -2 para evitar overlap de bordes

    // Texto
    div.textContent = isReal ? it.label : '';

    // Estados semánticos
    const value = this.value;
    const selected = (value[L] !== undefined) && (value[L] === it.key) && isReal;

    const inFocusLevel = this.focused && (this.focusLevel === L);
    const focusMatch   = inFocusLevel && (this.focusPath[L] === it.key) && isReal;

    // Hover (mouse)
    const isHover = (this.hover.level === L && this.hover.index === i && isReal);

    // Estilos base
    s.background = cc.back;
    s.color      = cc.text;
    s.border     = '1px solid ' + cc.border;

    // Mapa = horizontal, Lista = vertical
    if (kind === 'map') s.textAlign = 'center';
    else s.textAlign = 'left';

    // Priorización visual: seleccionado > foco > hover > base
    if (selected) {
      s.background = cc.select;
      s.color = cc.textSelect;
    } else if (focusMatch) {
      s.background = cc.backgroundOver;
      s.color = cc.textOver;
    } else if (isHover) {
      s.background = cc.overoff;
      s.color = cc.textOver;
    }
    // Deshabilitar DOM si no hay ítem real en filas de padding
    s.opacity = isReal ? '1' : '0';
  }

  // =============== Ciclo de vida visual ===============

  rSize() {
    // Recalcula leafMax y niveles cada vez que cambia tamaño/datos
    this.leafMax = this.computeLeafMax(this.tree);
    this.buildLevels();
    this.layoutLevels();
  }

  update() {
    // Redibuja cuando cambian estados de hover/focus/value externamente
    this.buildLevels();
    this.layoutLevels();
  }

  // =============== Interacción (hit-testing y selección) ===============

  // Convierte coords globales a locales del control (igual que Proto)
  _toLocal(e) {
    const mx = e.clientX - this.zone.x;
    const my = e.clientY - this.zone.y;
    return { x: mx, y: my };
  }

  // Busca qué ítem (L,i) está bajo el mouse; respeta zonas por nivel
  _hitTest(mx, my) {
    for (let L = 0; L < this.levels.length; L++) {
      const lvl = this.levels[L];
      const z = lvl.zone;
      if (mx < z.x || my < z.y || mx > z.x + z.w || my > z.y + z.h) continue;

      if (lvl.type === 'map') {
        for (let i = 0; i < lvl.items.length; i++) {
          const itz = lvl.items[i].zone;
          if (mx >= itz.x && my >= itz.y && mx <= itz.x + itz.w && my <= itz.y + itz.h) {
            return { L, i, real: true };
          }
        }
      } else {
        // hoja: puede contener filas de padding
        const nRows = Math.max(lvl.items.length, this.leafMax);
        for (let i = 0; i < nRows; i++) {
          const isReal = i < lvl.items.length;
          const itz = isReal ? lvl.items[i].zone : { x: z.x, y: z.y + i * this.hItem, w: z.w, h: this.hItem };
          if (mx >= itz.x && my >= itz.y && mx <= itz.x + itz.w && my <= itz.y + itz.h) {
            return { L, i, real: isReal };
          }
        }
      }
    }
    return { L: -1, i: -1, real: false };
  }

  handleEvent(e) {
    if (this.lock) return false;

    // Delega estados de hover / click
    if (e.type === 'mousemove') {
      const { x, y } = this._toLocal(e);
      const ht = this._hitTest(x, y);
      this.hover = (ht.L !== -1 && ht.real) ? { level: ht.L, index: ht.i } : { level: -1, index: -1 };
      this.update(); // repintar con hover
      return true;
    }

    if (e.type === 'mousedown') {
      const { x, y } = this._toLocal(e);
      const ht = this._hitTest(x, y);
      if (ht.L !== -1 && ht.real) {
        this._selectAt(ht.L, ht.i);
        return true;
      }
    }

    if (e.type === 'mouseup') {
      // nada por ahora
      return true;
    }

    // Soporte básico para teclado (opcional: Up/Down/Left/Right)
    if (e.type === 'keydown') {
      // Puedes integrar navegación de flechas aquí si lo deseas,
      // reutilizando this.isSelectable (ya marcada en ctor).
      // Recomendación: mover foco entre niveles/ítems con Roots+Gui. :contentReference[oaicite:1]{index=1} :contentReference[oaicite:2]{index=2}
    }

    return false;
  }

  // Regla de selección y autocompletado
  _selectAt(L, i) {
    const lvl = this.levels[L];
    const chosen = lvl.items[i];
    if (!chosen || !chosen.key) return;

    // 1) Recortar value hasta L e insertar la opción elegida
    const base = this.value.slice(0, L);
    base[L] = chosen.key;

    // 2) Autocompletar por primera clave descendiendo hasta una lista
    const newPath = this.autoCompleteToLeaf(base);

    // 3) Notificar
    this.value = newPath.slice(); // reflejar selección interna
    this.update();
    this.changeCb(this.tabIndex, this.itemIndex, newPath);
  }

  // API pública para sincronización externa (por si quieres settear desde afuera)
  setValue(path) {
    this.value = Array.isArray(path) ? path.slice() : [];
    this.update();
  }
  setTree(tree) {
    this.tree = tree || {};
    this.update();
  }
  setFocus({ focused, focusPath, focusLevel }) {
    if (typeof focused === 'boolean') this.focused = focused;
    if (Array.isArray(focusPath)) this.focusPath = focusPath.slice();
    if (typeof focusLevel === 'number') this.focusLevel = focusLevel;
    this.update();
  }
}
