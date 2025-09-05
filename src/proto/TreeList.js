// proto/TreeList.js
import { Proto } from '../core/Proto.js';
import { Tools } from '../core/Tools.js';
import { Roots } from '../core/Roots.js';

export class TreeList extends Proto {
  constructor(o = {}) {
    // API pública esperada:
    // o.tree (obj/array), o.value (array)
    // o.focused (bool), o.focusPath (array), o.focusLevel (number)
    // o.tabIndex, o.itemIndex, o.onChange (fn)
    o.selectable = true;
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

    // Callback
    this.changeCb = typeof o.onChange === 'function' ? o.onChange : () => {};

    // Layout interno / publicación de altura
    this.lineH    = this.h;               // alto de UNA fila
    this.levelGap = this.colors.sy || 2;  // separación vertical entre niveles
    this.leafMax  = 0;                    // se calcula en rSize()

    // Modelo visual
    this.levels   = [];   // [{type:'map'|'list', items:[{key,label,zone}], zone:{x,y,w,h}}...]
    this.itemsDom = [];   // espejo DOM por nivel
    this.hover    = { level: -1, index: -1 };

    // Contenedor interno (absoluto)
    this.c[2] = this.dom('div', this.css.basic + 'left:0; top:0; width:100%; height:100%;');
    this.s[2] = this.c[2].style;

    this.init();
  }

  // ======= Helpers de tipo =======
  static isMap(node)  { return node && typeof node === 'object' && !Array.isArray(node); }
  static isList(node) { return Array.isArray(node); }

  // ======= Recorrido de datos =======
  getNodeAtPath(path) {
    let node = this.tree;
    for (let i = 0; i < path.length; i++) {
      if (TreeList.isMap(node)) {
        if (!Object.prototype.hasOwnProperty.call(node, path[i])) return { node: null, depth: i };
        node = node[path[i]];
      } else if (TreeList.isList(node)) {
        // Llegamos a una lista: ya no hay más claves válidas
        if (i < path.length) return { node, depth: i };
      } else {
        return { node: null, depth: i };
      }
    }
    return { node, depth: path.length };
  }

  // Autocompletar: baja por primeras claves de cada mapa hasta alcanzar una lista
  autoCompleteToLeaf(basePath) {
    let { node } = this.getNodeAtPath(basePath);
    const path = basePath.slice();
    while (TreeList.isMap(node)) {
      const keys = Object.keys(node);
      if (!keys.length) break;
      const k0 = keys[0];
      path.push(k0);
      node = node[k0];
    }
    // Si termina en lista, NO agrega un ítem final de la hoja
    return path;
  }

  // Ruta activa (focusPath si focused, sino value)
  getActivePath() {
    return this.focused ? this.focusPath : this.value;
  }

  // ======= Tamaño de hoja máximo (para layout estable) =======
  computeLeafMax(node = this.tree) {
    if (Array.isArray(node)) return node.length;
    if (!node || typeof node !== 'object') return 0;
    let m = 0;
    for (const k of Object.keys(node)) {
      m = Math.max(m, this.computeLeafMax(node[k]));
    }
    return m;
  }

  // ======= Construcción de niveles (modelo lógico) =======
  buildLevels() {
    this.levels.length = 0;
    const activePath = this.getActivePath();

    let node = this.tree;
    let level = 0;

    while (node) {
      if (TreeList.isMap(node)) {
        // Nivel intermedio: claves del mapa (horizontal)
        const keys = Object.keys(node);
        if (!keys.length) break;
        this.levels.push({
          type: 'map',
          items: keys.map(k => ({ key: k, label: k, zone: { x:0,y:0,w:0,h:0 } })),
          zone: { x:0,y:0,w:0,h: this.lineH }
        });

        const nextKey = activePath[level];
        if (!nextKey || !node.hasOwnProperty(nextKey)) break;
        node = node[nextKey];
      } else if (TreeList.isList(node)) {
        // Nivel hoja: lista vertical
        const items = node.map(label => ({ key: label, label, zone: { x:0,y:0,w:0,h:0 } }));
        const hList = Math.max(items.length, this.leafMax) * this.lineH;
        this.levels.push({ type: 'list', items, zone: { x:0, y:0, w:0, h: hList } });
        break;
      } else {
        break;
      }
      level++;
    }
  }

  // ======= Layout (zonas & DOM) =======
  layoutLevels() {
    
    const contentX = (this.sa || 100) + 8;   // columna de label + padding
    const padRight = 8;
    const w = this.zone.w - contentX - padRight;

    
    let y = 0;

    // Ajustar itemsDom a cantidad de niveles
    while (this.itemsDom.length < this.levels.length) this.itemsDom.push([]);
    for (let L = this.levels.length; L < this.itemsDom.length; L++) {
      for (const el of this.itemsDom[L]) if (el && el.parentNode) el.parentNode.removeChild(el);
    }
    this.itemsDom.length = this.levels.length;

    for (let L = 0; L < this.levels.length; L++) {
      const lvl = this.levels[L];
      const row = this.itemsDom[L];
      if (lvl.type === 'map') {
        const n = Math.max(1, lvl.items.length);
        const cellW = Math.floor(w / n);

        lvl.zone = { x: contentX, y, w, h: this.lineH };
        let x = contentX;
        

        for (let i = 0; i < lvl.items.length; i++) {
          const it = lvl.items[i];
          it.zone = { x, y, w: cellW, h: this.lineH };
          const dom = this.ensureItemDom(L, i);
          this.paintItemDom(dom, L, i, it, 'map');
          x += cellW;
        }
        // eliminar DOM sobrante si antes había más celdas
        this._pruneRow(L, lvl.items.length);
        y += this.lineH + this.levelGap;
      } else {
        // lista/hoja: reservar h según leafMax
        const n = lvl.items.length;
        const hList = Math.max(n, this.leafMax) * this.lineH;
        
        lvl.zone = { x: contentX, y, w, h: hList };

         const rows = Math.max(n, this.leafMax);
         for (let i = 0; i < rows; i++) {
          const isReal = i < n;
          const it = isReal ? lvl.items[i] : { key: null, label: '', zone: { x:0,y:0,w:0,h:0 } };
          
           it.zone = { x: contentX, y: y + i * this.lineH, w, h: this.lineH };
          const dom = this.ensureItemDom(L, i);
          this.paintItemDom(dom, L, i, it, 'list', isReal);
        }
        // eliminar DOM sobrante si antes había más filas
        this._pruneRow(L, rows);
        y += hList;
      }
    }

    // Ajustes de alto interno del contenedor visual
    const totalH = y;
    this.zone.h = totalH + this.margin;
    this.s[0].height = this.zone.h + 'px';
    this.s[2].height = totalH + 'px';

    // Publicar alto total al GUI (sumará u.h)
    this._publishHeight();
  }



  // Elimina nodos DOM sobrantes en la fila L a partir del índice keep
  _pruneRow(L, keep) {
    const row = this.itemsDom[L];
    // si nunca se creó, nada que hacer
    if (!row) return;
    for (let j = keep; j < row.length; j++) {
      const el = row[j];
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }
    row.length = keep;
  }


  ensureItemDom(L, i) {
    const row = this.itemsDom[L];
    while (row.length <= i) row.push(null);
    if (!row[i]) {
      const div = this.dom('div', Tools.css.txt + 'position:absolute; pointer-events:none;');
      this.c[2].appendChild(div);
      row[i] = div;
    }
    return row[i];
  }

  paintItemDom(div, L, i, it, kind, isReal = true) {
    const s = div.style;
    const cc = this.colors;

    // Posición
    s.left   = it.zone.x + 'px';
    s.top    = it.zone.y + 'px';
    s.width  = it.zone.w + 'px';
    s.height = (it.zone.h - 2) + 'px';

    // Texto
    div.textContent = isReal ? it.label : '';

    // Estados
    const selected   = isReal && this.value[L] !== undefined && this.value[L] === it.key;
    const inFocusLvl = this.focused && (this.focusLevel === L);
    const focusMatch = isReal && inFocusLvl && (this.focusPath[L] === it.key);
    const isHover    = isReal && (this.hover.level === L && this.hover.index === i);

    // Estilos base
    s.background = cc.back;
    s.color      = cc.text;
    s.border     = '1px solid ' + cc.border;
    s.textAlign  = kind === 'map' ? 'center' : 'left';

    // Prioridad visual: seleccionado > foco > hover > base
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

    // Filas de padding invisibles en hoja
    s.opacity = isReal ? '1' : '0';
  }

  // ======= Ciclo de vida =======
  rSize() {
    this.leafMax = this.computeLeafMax(this.tree);
    this.buildLevels();
    this.layoutLevels();
  }

  update() {
    this.buildLevels();
    this.layoutLevels();
  }

  // ======= Interacción =======
  _toLocal(e) {
    const mx = e.clientX - this.zone.x;
    const my = e.clientY - this.zone.y;
    return { x: mx, y: my };
  }

  _hitTest(mx, my) {
  for (let L = 0; L < this.levels.length; L++) {
    const lvl = this.levels[L];
    const z = lvl.zone;  // x y w ya incluyen contentX
    if (mx < z.x || my < z.y || mx > z.x + z.w || my > z.y + z.h) continue;

      if (lvl.type === 'map') {
        for (let i = 0; i < lvl.items.length; i++) {
          const itz = lvl.items[i].zone;
          if (mx >= itz.x && my >= itz.y && mx <= itz.x + itz.w && my <= itz.y + itz.h) {
            return { L, i, real: true };
          }
        }
      } else {
        const nRows = Math.max(lvl.items.length, this.leafMax);
        for (let i = 0; i < nRows; i++) {
          const isReal = i < lvl.items.length;
          const itz = isReal ? lvl.items[i].zone : { x: z.x, y: z.y + i * this.lineH, w: z.w, h: this.lineH };
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

    if (e.type === 'mousemove') {
      const { x, y } = this._toLocal(e);
      const ht = this._hitTest(x, y);
      this.hover = (ht.L !== -1 && ht.real) ? { level: ht.L, index: ht.i } : { level: -1, index: -1 };
      this.update();
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
      return true;
    }

    // (Opcional) teclado: integrar navegación en Gui y reenviar aquí si se desea
    return false;
  }

  // Selección + autocompletado + notificación
  _selectAt(L, i) {
    const lvl = this.levels[L];
    const chosen = lvl.items[i];
    if (!chosen || !chosen.key) return;

    const base = this.value.slice(0, L);
    base[L] = chosen.key;

    const newPath = this.autoCompleteToLeaf(base);

    this.value = newPath.slice();
    this.update();
    this.changeCb(this.tabIndex, this.itemIndex, newPath);
  }

  // ======= API pública =======
  setValue(path) {
    this.value = Array.isArray(path) ? path.slice() : [];
    this.update();
  }

  setTree(tree) {
    this.tree = tree || {};
    // recalcular leafMax en próxima pasada
    this.leafMax = this.computeLeafMax(this.tree);
    this.update();
  }

  setFocus({ focused, focusPath, focusLevel }) {
    if (typeof focused === 'boolean') this.focused = focused;
    if (Array.isArray(focusPath)) this.focusPath = focusPath.slice();
    if (typeof focusLevel === 'number') this.focusLevel = focusLevel;
    this.update();
  }

  // ======= Publicación de altura =======
  _countVisibleIntermediates() {
    let c = 0;
    for (let i = 0; i < this.levels.length; i++) if (this.levels[i].type === 'map') c++;
    return c;
  }

  _getCurrentLeafLength() {
    const last = this.levels[this.levels.length - 1];
    return last && last.type === 'list' ? last.items.length : 0;
  }

  _publishHeight() {
    const inter = this._countVisibleIntermediates();
    const leafLen = Math.max(this.leafMax, this._getCurrentLeafLength());
    const leafH  = leafLen * this.lineH;
    const interH = inter * (this.lineH + this.levelGap);
    const totalH = interH + (inter ? this.levelGap : 0) + leafH;

    // Actualiza métricas del proto (lo que suma el GUI)
    this.h = totalH;
    this.zone.h = this.h + this.margin;
    this.s[0].height = this.h + 'px';

    // Avisar al GUI y refrescar zonas
    if (this.isUI && this.main) this.main.calc();
    Roots.needReZone = true;
  }
}
