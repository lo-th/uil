(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.UIL = {}));
})(this, (function (exports) { 'use strict';

	/**
	 * @author lth / https://github.com/lo-th
	 */

	const REVISION = "4.3.0";

	// INTENAL FUNCTION

	const R = {
	  ui: [],

	  dom: null,

	  ID: null,
	  lock: false,
	  wlock: false,
	  current: -1,

	  needReZone: true,
	  needResize: false,
	  forceZone: false,
	  isEventsInit: false,
	  isLeave: false,
	  addDOMEventListeners: true,

	  downTime: 0,
	  prevTime: 0,

	  //prevDefault: ['contextmenu', 'wheel'],
	  prevDefault: ["contextmenu"],
	  pointerEvent: ["pointerdown", "pointermove", "pointerup"],
	  eventOut: ["pointercancel", "pointerout", "pointerleave"],

	  xmlserializer: null,
	  tmpTime: null,
	  tmpImage: null,

	  oldCursor: "auto",

	  input: null,
	  parent: null,
	  firstImput: true,

	  hiddenImput: null,
	  hiddenSizer: null,
	  hasFocus: false,
	  startInput: false,
	  inputRange: [0, 0],
	  cursorId: 0,
	  str: "",
	  pos: 0,
	  startX: -1,
	  moveX: -1,

	  debugInput: false,

	  isLoop: false,
	  listens: [],

	  e: {
	    type: null,
	    clientX: 0,
	    clientY: 0,
	    keyCode: NaN,
	    key: null,
	    delta: 0,
	  },

	  isMobile: false,

	  now: null,
	  needsUpdate: false,

	  getTime: function () {
	    return self.performance && self.performance.now
	      ? self.performance.now.bind(performance)
	      : Date.now;
	  },

	  add: function (o) {
	    // R.ui[0] is de GUI object that is added first by the constructor
	    R.ui.push(o);
	    R.getZone(o);

	    if (!R.isEventsInit) R.initEvents();
	  },

	  testMobile: function () {
	    let n = navigator.userAgent;
	    if (
	      n.match(/Android/i) ||
	      n.match(/webOS/i) ||
	      n.match(/iPhone/i) ||
	      n.match(/iPad/i) ||
	      n.match(/iPod/i) ||
	      n.match(/BlackBerry/i) ||
	      n.match(/Windows Phone/i)
	    )
	      return true;
	    else return false;
	  },

	  remove: function (o) {
	    let i = R.ui.indexOf(o);

	    if (i !== -1) {
	      R.removeListen(o);
	      R.ui.splice(i, 1);
	    }

	    if (R.ui.length === 0) {
	      R.removeEvents();
	    }
	  },

	  // ----------------------
	  //   EVENTS
	  // ----------------------

	  initEvents: function () {
	    if (R.isEventsInit) return;

	    let dom = document.body;

	    R.isMobile = R.testMobile();
	    R.now = R.getTime();

	    if (!R.isMobile) {
	      dom.addEventListener("wheel", R, { passive: false });
	    } else {
	      dom.style.touchAction = "none";
	    }

	    console.log("R.addDOMEventListeners " + R.addDOMEventListeners);
	    if (R.addDOMEventListeners) {
	      dom.addEventListener("pointercancel", R);
	      dom.addEventListener("pointerleave", R);
	      //dom.addEventListener( 'pointerout', R )

	      dom.addEventListener("pointermove", R);
	      dom.addEventListener("pointerdown", R);
	      dom.addEventListener("pointerup", R);

	      dom.addEventListener("keydown", R, false);
	      dom.addEventListener("keyup", R, false);
	    }
	    window.addEventListener("resize", R.resize, false);

	    //window.onblur = R.out;
	    //window.onfocus = R.in;

	    R.isEventsInit = true;
	    R.dom = dom;
	  },

	  removeEvents: function () {
	    if (!R.isEventsInit) return;

	    let dom = document.body;

	    if (!R.isMobile) {
	      dom.removeEventListener("wheel", R);
	    }

	    if (R.addDOMEventListeners) {
	      dom.removeEventListener("pointercancel", R);
	      dom.removeEventListener("pointerleave", R);
	      //dom.removeEventListener( 'pointerout', R );

	      dom.removeEventListener("pointermove", R);
	      dom.removeEventListener("pointerdown", R);
	      dom.removeEventListener("pointerup", R);

	      dom.removeEventListener("keydown", R);
	      dom.removeEventListener("keyup", R);
	    }
	    window.removeEventListener("resize", R.resize);

	    R.isEventsInit = false;
	  },

	  resize: function () {
	    let i = R.ui.length,
	      u;

	    while (i--) {
	      u = R.ui[i];
	      if (u.isGui && !u.isCanvasOnly && u.autoResize) u.calc();
	    }

	    R.needReZone = true;
	    R.needResize = false;
	  },

	  out: function () {
	    console.log("im am out");
	    R.clearOldID();
	  },

	  in: function () {
	    console.log("im am in");
	    //  R.clearOldID();
	  },

	  // ----------------------
	  //   HANDLE EVENTS
	  // ----------------------

	  fakeUp: function () {
	    this.handleEvent({ type: "pointerup" });
	  },

	  handleEvent: function (event) {
	    //console.log("Roots.handleEvent "+event.type)
	    //if(!event.type) return;

	    if (R.prevDefault.indexOf(event.type) !== -1) event.preventDefault();

	    if (R.needResize) R.resize();

	    R.findZone(R.forceZone);

	    let e = R.e;
	    let leave = false;

	    if (event.type === "keydown") R.keydown(event);
	    if (event.type === "keyup") R.keyup(event);

	    if (event.type === "wheel") e.delta = event.deltaY > 0 ? 1 : -1;
	    else e.delta = 0;

	    let ptype = event.pointerType; // mouse, pen, touch

	    e.clientX = (ptype === "touch" ? event.pageX : event.clientX) || 0;
	    e.clientY = (ptype === "touch" ? event.pageY : event.clientY) || 0;

	    e.type = event.type;

	    if (R.eventOut.indexOf(event.type) !== -1) {
	      leave = true;
	      e.type = "mouseup";
	    }

	    if (event.type === "pointerleave") R.isLeave = true;

	    if (event.type === "pointerdown") e.type = "mousedown";
	    if (event.type === "pointerup") e.type = "mouseup";
	    if (event.type === "pointermove") {
	      if (R.isLeave) {
	        // if user resize outside this document
	        R.isLeave = false;
	        R.resize();
	      }
	      e.type = "mousemove";
	    }

	    // double click test
	    if (e.type === "mousedown") {
	      R.downTime = R.now();
	      let time = R.downTime - R.prevTime;

	      // double click on imput
	      if (time < 200) {
	        R.selectAll();
	        return false;
	      }

	      R.prevTime = R.downTime;
	      R.forceZone = false;
	    }

	    // for imput
	    if (e.type === "mousedown") R.clearInput();

	    // mouse lock
	    if (e.type === "mousedown") R.lock = true;
	    if (e.type === "mouseup") R.lock = false;

	    //if( R.current !== null && R.current.neverlock ) R.lock = false;

	    /*if( e.type === 'mousedown' && event.button === 1){
	            R.cursor()
	            e.preventDefault();
	            e.stopPropagation();
	        }*/

	    //console.log("p4 "+R.isMobile+" "+e.type+" "+R.lock)

	    if (R.isMobile && e.type === "mousedown") R.findID(e);
	    if (e.type === "mousemove" && !R.lock) R.findID(e);

	    if (R.ID !== null) {
	      if (R.ID.isCanvasOnly) {
	        e.clientX = R.ID.mouse.x;
	        e.clientY = R.ID.mouse.y;
	      }

	      //if( R.ID.marginDiv ) e.clientY -= R.ID.margin * 0.5

	      R.ID.handleEvent(e);
	    }

	    if (R.isMobile && e.type === "mouseup") R.clearOldID();
	    if (leave) R.clearOldID();
	  },

	  // ----------------------
	  //   ID
	  // ----------------------

	  findID: function (e) {
	    let i = R.ui.length,
	      next = -1,
	      u,
	      x,
	      y;

	    while (i--) {
	      u = R.ui[i];

	      if (u.isCanvasOnly) {
	        x = u.mouse.x;
	        y = u.mouse.y;
	      } else {
	        x = e.clientX;
	        y = e.clientY;
	      }

	      if (R.onZone(u, x, y)) {
	        next = i;

	        if (next !== R.current) {
	          R.clearOldID();
	          R.current = next;
	          R.ID = u;
	        }
	        break;
	      }
	    }

	    if (next === -1) R.clearOldID();
	  },

	  clearOldID: function () {
	    if (!R.ID) return;
	    R.current = -1;
	    R.ID.reset();
	    R.ID = null;
	    R.cursor();
	  },

	  // ----------------------
	  //   GUI / GROUP FUNCTION
	  // ----------------------

	  calcUis: (uis, zone, py, group = false) => {
	    //console.log('calc_uis')

	    let i = uis.length,
	      u,
	      px = 0,
	      n = 0,
	      tw,
	      m;

	    let height = 0;

	    while (i--) {
	      u = uis[n];
	      n++;

	      if (!group && u.isGroup) u.calcUis();

	      m = u.margin;
	      //div = u.marginDiv

	      u.zone.w = u.w;
	      u.zone.h = u.h + m;

	      if (!u.autoWidth) {
	        if (px === 0) height += u.h + m;

	        u.zone.x = zone.x + px;
	        u.zone.y = py; // + u.mtop
	        //if(div) u.zone.y += m * 0.5

	        tw = R.getWidth(u);
	        if (tw) u.zone.w = u.w = tw;
	        else if (u.fw) u.zone.w = u.w = u.fw;

	        px += u.zone.w;

	        if (px >= zone.w) {
	          py += u.h + m;
	          //if(div) py += m * 0.5
	          px = 0;
	        }
	      } else {
	        px = 0;

	        u.zone.x = zone.x + u.dx;
	        u.zone.y = py;
	        py += u.h + m;

	        height += u.h + m;
	      }
	    }

	    return height;
	  },

	  findTarget: function (uis, e) {
	    let i = uis.length;

	    while (i--) {
	      if (R.onZone(uis[i], e.clientX, e.clientY)) return i;
	    }

	    return -1;
	  },

	  // ----------------------
	  //   ZONE
	  // ----------------------

	  findZone: function (force) {
	    if (!R.needReZone && !force) return;

	    var i = R.ui.length,
	      u;

	    while (i--) {
	      u = R.ui[i];
	      R.getZone(u);
	      if (u.isGui) u.calcUis();
	    }

	    R.needReZone = false;
	  },

	  onZone: function (o, x, y) {
	    if (x === undefined || y === undefined) return false;

	    let z = o.zone;
	    let mx = x - z.x; // - o.dx;
	    let my = y - z.y;

	    //if( this.marginDiv ) e.clientY -= this.margin * 0.5
	    //if( o.group && o.group.marginDiv ) my += o.group.margin * 0.5
	    //if( o.group !== null ) mx -= o.dx

	    let over = mx >= 0 && my >= 0 && mx <= z.w && my <= z.h;

	    //if( o.marginDiv ) my -= o.margin * 0.5

	    if (over) o.local.set(mx, my);
	    else o.local.neg();

	    return over;
	  },

	  getWidth: function (o) {
	    //return o.getDom().offsetWidth
	    return o.getDom().clientWidth;

	    //let r = o.getDom().getBoundingClientRect();
	    //return (r.width)
	    //return Math.floor(r.width)
	  },

	  getZone: function (o) {
	    if (o.isCanvasOnly) return;
	    let r = o.getDom().getBoundingClientRect();

	    //if( !r.width ) return
	    //o.zone = { x:Math.floor(r.left), y:Math.floor(r.top), w:Math.floor(r.width), h:Math.floor(r.height) };
	    //o.zone = { x:Math.round(r.left), y:Math.round(r.top), w:Math.round(r.width), h:Math.round(r.height) };
	    o.zone = { x: r.left, y: r.top, w: r.width, h: r.height };

	    //console.log(o.name, o.zone)
	  },

	  // ----------------------
	  //   CURSOR
	  // ----------------------

	  cursor: function (name) {
	    name = name ? name : "auto";
	    if (name !== R.oldCursor) {
	      document.body.style.cursor = name;
	      R.oldCursor = name;
	    }
	  },

	  // ----------------------
	  //   CANVAS
	  // ----------------------

	  toCanvas: function (o, w, h, force) {
	    if (!R.xmlserializer) R.xmlserializer = new XMLSerializer();

	    // prevent exesive redraw

	    if (force && R.tmpTime !== null) {
	      clearTimeout(R.tmpTime);
	      R.tmpTime = null;
	    }

	    if (R.tmpTime !== null) return;

	    if (R.lock)
	      R.tmpTime = setTimeout(function () {
	        R.tmpTime = null;
	      }, 10);

	    ///

	    let isNewSize = false;
	    if (w !== o.canvas.width || h !== o.canvas.height) isNewSize = true;

	    if (R.tmpImage === null) R.tmpImage = new Image();

	    let img = R.tmpImage; //new Image();

	    let htmlString = R.xmlserializer.serializeToString(o.content);

	    let svg =
	      '<svg xmlns="http://www.w3.org/2000/svg" width="' +
	      w +
	      '" height="' +
	      h +
	      '"><foreignObject style="pointer-events: none; left:0;" width="100%" height="100%">' +
	      htmlString +
	      "</foreignObject></svg>";

	    img.onload = function () {
	      let ctx = o.canvas.getContext("2d");

	      if (isNewSize) {
	        o.canvas.width = w;
	        o.canvas.height = h;
	      } else {
	        ctx.clearRect(0, 0, w, h);
	      }
	      ctx.drawImage(this, 0, 0);

	      o.onDraw();
	    };

	    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
	    //img.src = 'data:image/svg+xml;base64,'+ window.btoa( svg );
	    img.crossOrigin = "";
	    R.needsUpdate = false;
	  },

	  // ----------------------
	  //   INPUT
	  // ----------------------

	  setHidden: function () {
	    if (R.hiddenImput === null) {
	      //let css = R.parent.css.txtselect + 'padding:0; width:auto; height:auto; '
	      //let css = R.parent.css.txt + 'padding:0; width:auto; height:auto; text-shadow:none;'
	      //css += 'left:10px; top:auto; border:none; color:#FFF; background:#000;' + hide;

	      R.hiddenImput = document.createElement("input");
	      R.hiddenImput.type = "text";
	      //R.hiddenImput.style.cssText = css + 'bottom:30px;' + (R.debugInput ? '' : 'transform:scale(0);');

	      R.hiddenSizer = document.createElement("div");
	      //R.hiddenSizer.style.cssText = css + 'bottom:60px;';

	      document.body.appendChild(R.hiddenImput);
	      document.body.appendChild(R.hiddenSizer);
	    }

	    let hide = R.debugInput ? "" : "opacity:0; zIndex:0;";
	    let css =
	      R.parent.css.txtselect +
	      "padding:0; width:auto; height:auto; left:10px; top:auto; color:#FFF; background:#000;" +
	      hide;
	    R.hiddenImput.style.cssText =
	      css + "bottom:10px;" + (R.debugInput ? "" : "transform:scale(0);");
	    R.hiddenSizer.style.cssText = css + "bottom:40px;";

	    R.hiddenImput.style.width = R.input.clientWidth + "px";
	    R.hiddenImput.value = R.str;
	    R.hiddenSizer.innerHTML = R.str;

	    R.hasFocus = true;
	  },

	  clearHidden: function (p) {
	    if (R.hiddenImput === null) return;
	    R.hasFocus = false;
	  },

	  clickPos: function (x) {
	    let i = R.str.length,
	      l = 0,
	      n = 0;
	    while (i--) {
	      l += R.textWidth(R.str[n]);
	      if (l >= x) break;
	      n++;
	    }
	    return n;
	  },

	  upInput: function (x, down) {
	    if (R.parent === null) return false;

	    let up = false;

	    if (down) {
	      let id = R.clickPos(x);

	      R.moveX = id;

	      if (R.startX === -1) {
	        R.startX = id;
	        R.cursorId = id;
	        R.inputRange = [R.startX, R.startX];
	      } else {
	        let isSelection = R.moveX !== R.startX;

	        if (isSelection) {
	          if (R.startX > R.moveX) R.inputRange = [R.moveX, R.startX];
	          else R.inputRange = [R.startX, R.moveX];
	        }
	      }

	      up = true;
	    } else {
	      if (R.startX !== -1) {
	        R.hasFocus = true;
	        R.hiddenImput.focus();
	        R.hiddenImput.selectionStart = R.inputRange[0];
	        R.hiddenImput.selectionEnd = R.inputRange[1];
	        R.startX = -1;

	        up = true;
	      }
	    }

	    if (up) R.selectParent();

	    return up;
	  },

	  selectAll: function () {
	    if (!R.parent) return;

	    R.str = R.input.textContent;
	    R.inputRange = [0, R.str.length];
	    R.hasFocus = true;
	    R.hiddenImput.focus();
	    R.hiddenImput.selectionStart = R.inputRange[0];
	    R.hiddenImput.selectionEnd = R.inputRange[1];
	    R.cursorId = R.inputRange[1];
	    R.selectParent();
	  },

	  selectParent: function () {
	    var c = R.textWidth(R.str.substring(0, R.cursorId));
	    var e = R.textWidth(R.str.substring(0, R.inputRange[0]));
	    var s = R.textWidth(R.str.substring(R.inputRange[0], R.inputRange[1]));

	    R.parent.select(c, e, s, R.hiddenSizer.innerHTML);
	  },

	  textWidth: function (text) {
	    if (R.hiddenSizer === null) return 0;
	    text = text.replace(/ /g, "&nbsp;");
	    R.hiddenSizer.innerHTML = text;
	    return R.hiddenSizer.clientWidth;
	  },

	  clearInput: function () {
	    if (R.parent === null) return;
	    if (!R.firstImput) R.parent.validate(true);

	    R.clearHidden();
	    R.parent.unselect();

	    //R.input.style.background = 'none';
	    R.input.style.background = R.parent.colors.back;
	    R.input.style.borderColor = R.parent.colors.border;
	    //R.input.style.color = R.parent.colors.text;
	    R.parent.isEdit = false;

	    R.input = null;
	    R.parent = null;
	    (R.str = ""), (R.firstImput = true);
	  },

	  setInput: function (Input, parent) {
	    R.clearInput();

	    R.input = Input;
	    R.parent = parent;

	    R.input.style.background = R.parent.colors.backoff;
	    R.input.style.borderColor = R.parent.colors.select;
	    //R.input.style.color = R.parent.colors.textSelect;
	    R.str = R.input.textContent;

	    R.setHidden();
	  },

	  keydown: function (e) {
	    if (R.parent === null) return;

	    let keyCode = e.which;
	      e.shiftKey;

	    //console.log( keyCode )

	    R.firstImput = false;

	    if (R.hasFocus) {
	      // hack to fix touch event bug in iOS Safari
	      window.focus();
	      R.hiddenImput.focus();
	    }

	    R.parent.isEdit = true;

	    // e.preventDefault();

	    // add support for Ctrl/Cmd+A selection
	    //if ( keyCode === 65 && (e.ctrlKey || e.metaKey )) {
	    //R.selectText();
	    //e.preventDefault();
	    //return self.render();
	    //}

	    if (keyCode === 13) {
	      //enter

	      R.clearInput();

	      //} else if( keyCode === 9 ){ //tab key

	      // R.input.textContent = '';
	    } else {
	      if (R.input.isNum) {
	        if (
	          (e.keyCode > 47 && e.keyCode < 58) ||
	          (e.keyCode > 95 && e.keyCode < 106) ||
	          e.keyCode === 190 ||
	          e.keyCode === 110 ||
	          e.keyCode === 8 ||
	          e.keyCode === 109
	        ) {
	          R.hiddenImput.readOnly = false;
	        } else {
	          R.hiddenImput.readOnly = true;
	        }
	      } else {
	        R.hiddenImput.readOnly = false;
	      }
	    }
	  },

	  keyup: function (e) {
	    if (R.parent === null) return;

	    R.str = R.hiddenImput.value;

	    if (R.parent.allEqual) R.parent.sameStr(R.str); // numeric samùe value
	    else R.input.textContent = R.str;

	    R.cursorId = R.hiddenImput.selectionStart;
	    R.inputRange = [R.hiddenImput.selectionStart, R.hiddenImput.selectionEnd];

	    R.selectParent();

	    //if( R.parent.allway )
	    R.parent.validate();
	  },

	  // ----------------------
	  //
	  //   LISTENING
	  //
	  // ----------------------

	  loop: function () {
	    // modified by Fedemarino
	    if (R.isLoop) requestAnimationFrame(R.loop);
	    R.needsUpdate = R.update();
	    // if there is a change in a value generated externally, the GUI needs to be redrawn
	    if (R.ui[0]) R.ui[0].draw();
	  },

	  update: function () {
	    // modified by Fedemarino
	    let i = R.listens.length;
	    let needsUpdate = false;
	    while (i--) {
	      //check if the value of the object has changed
	      let hasChanged = R.listens[i].listening();
	      if (hasChanged) needsUpdate = true;
	    }
	    return needsUpdate;
	  },

	  removeListen: function (proto) {
	    let id = R.listens.indexOf(proto);
	    if (id !== -1) R.listens.splice(id, 1);
	    if (R.listens.length === 0) R.isLoop = false;
	  },

	  addListen: function (proto) {
	    let id = R.listens.indexOf(proto);

	    if (id !== -1) return false;

	    R.listens.push(proto);

	    if (!R.isLoop) {
	      R.isLoop = true;
	      R.loop();
	    }

	    return true;
	  },
	};

	const Roots = R;

	/**
	 * @author lth / https://github.com/lo-th
	 */

	const T = {

	    transition: 0.2,

	    frag: document.createDocumentFragment(),

	    colorRing: null,
	    joystick_0: null,
	    joystick_1: null,
	    circular: null,
	    knob: null,
	    pad2d: null,

	    svgns: "http://www.w3.org/2000/svg",
	    links: "http://www.w3.org/1999/xlink",
	    htmls: "http://www.w3.org/1999/xhtml",

	    DOM_SIZE: [ 'height', 'width', 'top', 'left', 'bottom', 'right', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom'],
	    SVG_TYPE_D: [ 'pattern', 'defs', 'transform', 'stop', 'animate', 'radialGradient', 'linearGradient', 'animateMotion', 'use', 'filter', 'feColorMatrix' ],
	    SVG_TYPE_G: [ 'svg', 'rect', 'circle', 'path', 'polygon', 'text', 'g', 'line', 'foreignObject' ],

	    PI: Math.PI,
	    TwoPI: Math.PI*2,
	    pi90: Math.PI * 0.5,
	    pi60: Math.PI/3,
	    
	    torad: Math.PI / 180,
	    todeg: 180 / Math.PI,

	    clamp: ( v, min, max ) => {

	        v = v < min ? min : v;
	        v = v > max ? max : v;
	        return v;

	    },

	    isDivid: ( v ) => ( v*0.5 === Math.floor(v*0.5) ),

	    size: {  w: 240, h: 20, p: 30, s: 8 },

	    // ----------------------
	    //   COLOR
	    // ----------------------

	    defineColor: ( o, cc = T.colors ) => {

	        let color = { ...cc };

	        let textChange = ['fontFamily', 'fontWeight', 'fontShadow', 'fontSize' ];
	        let changeText = false;

	        if( o.font ) o.fontFamily = o.font;
	        if( o.shadow ) o.fontShadow = o.shadow;
	        if( o.weight ) o.fontWeight = o.weight;

	        if( o.fontColor ) o.text = o.fontColor;
	        if( o.color ) o.text = o.color;

	        if( o.text ){
	            color.text = o.text;
	            if( !o.fontColor && !o.color ){ 
	                color.title = T.ColorLuma( o.text, -0.25 );
	                color.titleoff = T.ColorLuma( o.text, -0.5 );
	            }
	            color.textOver = T.ColorLuma( o.text, 0.25 );
	            color.textSelect = T.ColorLuma( o.text, 0.5 );
	        }

	        if( o.button ){
	            color.button = o.button;
	            color.border = T.ColorLuma( o.button, 0.1 );
	            color.overoff = T.ColorLuma( o.button, 0.2 );
	        }

	        if( o.select ){
	            color.select = o.select;
	            color.over = T.ColorLuma( o.select, -0.1 );
	        }

	        if( o.itemBg ) o.back = o.itemBg;

	        if( o.back ){
	            color.back = o.back;
	            color.backoff = T.ColorLuma( o.back, -0.1 );
	        }

	        if( o.fontSelect ) color.textSelect = o.fontSelect;
	        if( o.groupBorder ) color.gborder = o.groupBorder;

	        //if( o.transparent ) o.bg = 'none'
	        //if( o.bg ) color.background = color.backgroundOver = o.bg
	        if( o.bgOver ) color.backgroundOver = o.bgOver;

	        for( let m in color ){
	            if(o[m]!==undefined) color[m] = o[m];
	        }

	        for( let m in o ){
	            if( textChange.indexOf(m) !== -1 ) changeText = true; 
	        }

	        if( changeText ) T.defineText( color );

	        return color

	    },

	    colors: {

	        sx: 4,//4
	        sy: 2,//2
	        radius:2,

	        showOver : 1,
	        //groupOver : 1,

	        content:'none',
	        background: 'rgba(50,50,50,0.15)',
	        backgroundOver: 'rgba(50,50,50,0.3)',

	        title : '#CCC',
	        titleoff : '#BBB',
	        text : '#DDD',
	        textOver : '#EEE',
	        textSelect : '#FFF',
	        
	        back:'rgba(0,0,0,0.2)',
	        backoff:'rgba(0,0,0,0.3)',

	        // input and button border
	        border : '#4c4c4c',
	        borderSize : 1,

	        gborder : 'none',
	        groups : 'none',
	        

	        button : '#3c3c3c',
	        overoff : '#5c5c5c',
	        over : '#024699',
	        select : '#308AFF',
	        action: '#FF3300',
	        
	        //fontFamily: 'Tahoma',
	        fontFamily: 'Consolas, monospace',
	        //fontFamily: "'Roboto Mono', 'Source Code Pro', Menlo, Courier, monospace",
	        fontWeight: 'normal',
	        fontShadow: 'none',//'#000',
	        fontSize:12,

	        joyOver:'rgba(48,138,255,0.25)',
	        joyOut: 'rgba(100,100,100,0.5)',
	        joySelect: '#308AFF',

	        
	        hide: 'rgba(0,0,0,0)',

	    },

	    // style css

	    css : {

	        basic: 'position:absolute; pointer-events:none; box-sizing:border-box; margin:0; padding:0; overflow:hidden; ' + '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;',
	        button:'display:flex; align-items:center; justify-content:center; text-align:center;',
	        middle:'display:flex; align-items:center; justify-content:left; text-align:left; flex-direction: row-reverse;'
	    },

	    // svg path

	    svgs: {

	        g1:'M 6 4 L 0 4 0 6 6 6 6 4 M 6 0 L 0 0 0 2 6 2 6 0 Z',
	        g2:'M 6 0 L 4 0 4 6 6 6 6 0 M 2 0 L 0 0 0 6 2 6 2 0 Z',

	        group:'M 7 7 L 7 8 8 8 8 7 7 7 M 5 7 L 5 8 6 8 6 7 5 7 M 3 7 L 3 8 4 8 4 7 3 7 M 7 5 L 7 6 8 6 8 5 7 5 M 6 6 L 6 5 5 5 5 6 6 6 M 7 3 L 7 4 8 4 8 3 7 3 M 6 4 L 6 3 5 3 5 4 6 4 M 3 5 L 3 6 4 6 4 5 3 5 M 3 3 L 3 4 4 4 4 3 3 3 Z',
	        arrow:'M 3 8 L 8 5 3 2 3 8 Z',

	        arrowDown:'M 5 8 L 8 3 2 3 5 8 Z',
	        arrowUp:'M 5 2 L 2 7 8 7 5 2 Z',

	        solid:'M 13 10 L 13 1 4 1 1 4 1 13 10 13 13 10 M 11 3 L 11 9 9 11 3 11 3 5 5 3 11 3 Z',
	        body:'M 13 10 L 13 1 4 1 1 4 1 13 10 13 13 10 M 11 3 L 11 9 9 11 3 11 3 5 5 3 11 3 M 5 4 L 4 5 4 10 9 10 10 9 10 4 5 4 Z',
	        vehicle:'M 13 6 L 11 1 3 1 1 6 1 13 3 13 3 11 11 11 11 13 13 13 13 6 M 2.4 6 L 4 2 10 2 11.6 6 2.4 6 M 12 8 L 12 10 10 10 10 8 12 8 M 4 8 L 4 10 2 10 2 8 4 8 Z',
	        articulation:'M 13 9 L 12 9 9 2 9 1 5 1 5 2 2 9 1 9 1 13 5 13 5 9 4 9 6 5 8 5 10 9 9 9 9 13 13 13 13 9 Z',
	        character:'M 13 4 L 12 3 9 4 5 4 2 3 1 4 5 6 5 8 4 13 6 13 7 9 8 13 10 13 9 8 9 6 13 4 M 6 1 L 6 3 8 3 8 1 6 1 Z',
	        terrain:'M 13 8 L 12 7 Q 9.06 -3.67 5.95 4.85 4.04 3.27 2 7 L 1 8 7 13 13 8 M 3 8 Q 3.78 5.420 5.4 6.6 5.20 7.25 5 8 L 7 8 Q 8.39 -0.16 11 8 L 7 11 3 8 Z',
	        joint:'M 7.7 7.7 Q 8 7.45 8 7 8 6.6 7.7 6.3 7.45 6 7 6 6.6 6 6.3 6.3 6 6.6 6 7 6 7.45 6.3 7.7 6.6 8 7 8 7.45 8 7.7 7.7 M 3.35 8.65 L 1 11 3 13 5.35 10.65 Q 6.1 11 7 11 8.28 11 9.25 10.25 L 7.8 8.8 Q 7.45 9 7 9 6.15 9 5.55 8.4 5 7.85 5 7 5 6.54 5.15 6.15 L 3.7 4.7 Q 3 5.712 3 7 3 7.9 3.35 8.65 M 10.25 9.25 Q 11 8.28 11 7 11 6.1 10.65 5.35 L 13 3 11 1 8.65 3.35 Q 7.9 3 7 3 5.7 3 4.7 3.7 L 6.15 5.15 Q 6.54 5 7 5 7.85 5 8.4 5.55 9 6.15 9 7 9 7.45 8.8 7.8 L 10.25 9.25 Z',
	        ray:'M 9 11 L 5 11 5 12 9 12 9 11 M 12 5 L 11 5 11 9 12 9 12 5 M 11.5 10 Q 10.9 10 10.45 10.45 10 10.9 10 11.5 10 12.2 10.45 12.55 10.9 13 11.5 13 12.2 13 12.55 12.55 13 12.2 13 11.5 13 10.9 12.55 10.45 12.2 10 11.5 10 M 9 10 L 10 9 2 1 1 2 9 10 Z',
	        collision:'M 11 12 L 13 10 10 7 13 4 11 2 7.5 5.5 9 7 7.5 8.5 11 12 M 3 2 L 1 4 4 7 1 10 3 12 8 7 3 2 Z',
	        map:'M 13 1 L 1 1 1 13 13 13 13 1 M 12 2 L 12 7 7 7 7 12 2 12 2 7 7 7 7 2 12 2 Z',
	        material:'M 13 1 L 1 1 1 13 13 13 13 1 M 12 2 L 12 7 7 7 7 12 2 12 2 7 7 7 7 2 12 2 Z',
	        texture:'M 13 4 L 13 1 1 1 1 4 5 4 5 13 9 13 9 4 13 4 Z',
	        object:'M 10 1 L 7 4 4 1 1 1 1 13 4 13 4 5 7 8 10 5 10 13 13 13 13 1 10 1 Z',
	        none:'M 9 5 L 5 5 5 9 9 9 9 5 Z',
	        cursor:'M 4 7 L 1 10 1 12 2 13 4 13 7 10 9 14 14 0 0 5 4 7 Z',
	        load:'M 13 8 L 11.5 6.5 9 9 9 3 5 3 5 9 2.5 6.5 1 8 7 14 13 8 M 9 2 L 9 0 5 0 5 2 9 2 Z',
	        save:'M 9 12 L 5 12 5 14 9 14 9 12 M 11.5 7.5 L 13 6 7 0 1 6 2.5 7.5 5 5 5 11 9 11 9 5 11.5 7.5 Z',
	        extern:'M 14 14 L 14 0 0 0 0 14 14 14 M 12 6 L 12 12 2 12 2 6 12 6 M 12 2 L 12 4 2 4 2 2 12 2 Z',

	    },

	    rezone () {
	        Roots.needReZone = true;
	    },

	    getImput: function(){

	        return Roots.input ? true : false

	    },

	    setStyle : function ( data ){

	        for ( var o in data ){
	            if( T.colors[o] ) T.colors[o] = data[o];
	        }

	        T.setText();

	    },

	    // ----------------------
	    // custom text
	    // ----------------------

	    defineText: function( o ){

	        T.setText( o.fontSize, o.text, o.fontFamily, o.fontShadow, o.fontWeight );

	    },

	    setText: function( size, color, font, shadow, weight ){

	        let cc = T.colors;

	        if( font === undefined ) font = cc.fontFamily;
	        if( size === undefined ) size = cc.fontSize;
	        if( shadow === undefined ) shadow = cc.fontShadow;
	        if( weight === undefined ) weight = cc.fontWeight;
	        if( color === undefined ) color = cc.text;

	        if( isNaN(size) ){ if( size.search('em')===-1 ) size += 'px';}
	        else size += 'px';
	        

	        //let align = 'display:flex; justify-content:left; align-items:center; text-align:left;'

	        T.css.txt = T.css.basic + T.css.middle + ' font-family:'+ font +'; font-weight:'+weight+'; font-size:'+size+'; color:'+cc.text+'; padding:0px 8px; left:0; top:2px; height:16px; width:100px; overflow:hidden; white-space: nowrap; letter-spacing: normal;';
	        if( shadow !== 'none' ) T.css.txt += ' text-shadow: 1px 1px 1px '+shadow+';';

	        T.css.txtselect = T.css.txt + 'padding:0px 4px; border:1px dashed ' + cc.border + ';';
	        T.css.item = T.css.txt + 'padding:0px 4px; position:relative; margin-bottom:1px; ';

	    },


	    // note

	    //https://developer.mozilla.org/fr/docs/Web/CSS/css_flexible_box_layout/aligning_items_in_a_flex_container

	    /*cloneColor: function () {

	        let cc = Object.assign({}, T.colors );
	        return cc;

	    },*/

	    // intern function

	    cloneCss: function () {

	        //let cc = Object.assign({}, T.css );
	        return { ...T.css };

	    },

	    clone: function ( o ) {

	        return o.cloneNode( true );

	    },

	    setSvg: function( dom, type, value, id, id2 ){

	        if( id === -1 ) dom.setAttributeNS( null, type, value );
	        else if( id2 !== undefined ) dom.childNodes[ id || 0 ].childNodes[ id2 || 0 ].setAttributeNS( null, type, value );
	        else dom.childNodes[ id || 0 ].setAttributeNS( null, type, value );

	    },

	    setCss: function( dom, css ){

	        for( let r in css ){
	            if( T.DOM_SIZE.indexOf(r) !== -1 ) dom.style[r] = css[r] + 'px';
	            else dom.style[r] = css[r];
	        }

	    },

	    set: function( g, o ){

	        for( let att in o ){
	            if( att === 'txt' ) g.textContent = o[ att ];
	            if( att === 'link' ) g.setAttributeNS( T.links, 'xlink:href', o[ att ] );
	            else g.setAttributeNS( null, att, o[ att ] );
	        }
	        
	    },

	    get: function( dom, id ){

	        if( id === undefined ) return dom; // root
	        else if( !isNaN( id ) ) return dom.childNodes[ id ]; // first child
	        else if( id instanceof Array ){
	            if(id.length === 2) return dom.childNodes[ id[0] ].childNodes[ id[1] ];
	            if(id.length === 3) return dom.childNodes[ id[0] ].childNodes[ id[1] ].childNodes[ id[2] ];
	        }

	    },

	    dom : function ( type, css, obj, dom, id ) {

	        type = type || 'div';

	        if( T.SVG_TYPE_D.indexOf(type) !== -1 || T.SVG_TYPE_G.indexOf(type) !== -1 ){ // is svg element

	            if( type ==='svg' ){

	                dom = document.createElementNS( T.svgns, 'svg' );
	                T.set( dom, obj );

	          /*  } else if ( type === 'use' ) {

	                dom = document.createElementNS( T.svgns, 'use' );
	                T.set( dom, obj );
	*/
	            } else {
	                // create new svg if not def
	                if( dom === undefined ) dom = document.createElementNS( T.svgns, 'svg' );
	                T.addAttributes( dom, type, obj, id );

	            }
	            
	        } else { // is html element

	            if( dom === undefined ) dom = document.createElementNS( T.htmls, type );
	            else dom = dom.appendChild( document.createElementNS( T.htmls, type ) );

	        }

	        if( css ) dom.style.cssText = css; 

	        if( id === undefined ) return dom;
	        else return dom.childNodes[ id || 0 ];

	    },

	    addAttributes : function( dom, type, o, id ){

	        let g = document.createElementNS( T.svgns, type );
	        T.set( g, o );
	        T.get( dom, id ).appendChild( g );
	        if( T.SVG_TYPE_G.indexOf(type) !== -1 ) g.style.pointerEvents = 'none';
	        return g;

	    },

	    clear : function( dom ){

	        T.purge( dom );
	        while (dom.firstChild) {
	            if ( dom.firstChild.firstChild ) T.clear( dom.firstChild );
	            dom.removeChild( dom.firstChild ); 
	        }

	    },

	    purge : function ( dom ) {

	        let a = dom.attributes, i, n;
	        if (a) {
	            i = a.length;
	            while(i--){
	                n = a[i].name;
	                if (typeof dom[n] === 'function') dom[n] = null;
	            }
	        }
	        a = dom.childNodes;
	        if (a) {
	            i = a.length;
	            while(i--){ 
	                T.purge( dom.childNodes[i] ); 
	            }
	        }

	    },

	    // ----------------------
	    //   SVG Effects function
	    // ----------------------

	    addSVGGlowEffect: function () {

	        if ( document.getElementById( 'UILGlow') !== null ) return;

	        let svgFilter = T.initUILEffects();

	        let filter = T.addAttributes( svgFilter, 'filter', { id: 'UILGlow', x: '-20%', y: '-20%', width: '140%', height: '140%' } );
	        T.addAttributes( filter, 'feGaussianBlur', { in: 'SourceGraphic', stdDeviation: '3', result: 'uilBlur' } );
	        let feMerge = T.addAttributes( filter, 'feMerge', {  } );
	        
	        for( let i = 0; i <= 3; i++ ) {

	            T.addAttributes( feMerge, 'feMergeNode', { in: 'uilBlur' } );
	        
	        }

	        T.addAttributes( feMerge, 'feMergeNode', { in: 'SourceGraphic' } );

	    },

	    initUILEffects: function () {

	        let svgFilter = document.getElementById( 'UILSVGEffects');
	        
	        if ( svgFilter === null ) {
	            
	            svgFilter = T.dom( 'svg', undefined , { id: 'UILSVGEffects', width: '0', height: '0' } );
	            document.body.appendChild( svgFilter );
	 
	        }

	        return svgFilter;

	    },

	    // ----------------------
	    //   Color function
	    // ----------------------

	    ColorLuma : function ( hex, l ) {

	        //if( hex.substring(0, 3) === 'rgba' ) hex = '#000';

	        if( hex === 'n' ) hex = '#000';

	        // validate hex string
	        hex = String(hex).replace(/[^0-9a-f]/gi, '');
	        if (hex.length < 6) {
	            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	        }
	        l = l || 0;

	        // convert to decimal and change luminosity
	        let rgb = "#", c, i;
	        for (i = 0; i < 3; i++) {
	            c = parseInt(hex.substr(i*2,2), 16);
	            c = Math.round(Math.min(Math.max(0, c + (c * l)), 255)).toString(16);
	            rgb += ("00"+c).substr(c.length);
	        }

	        return rgb;

	    },

	    findDeepInver: function ( c ) { 

	        return (c[0] * 0.3 + c[1] * .59 + c[2] * .11) <= 0.6;
	        
	    },

	    lerpColor: function( c1, c2, factor ) {
	        let newColor = {};
	        for ( let i = 0; i < 3; i++ ) {
	          newColor[i] = c1[ i ] + ( c2[ i ] - c1[ i ] ) * factor;
	        }
	        return newColor;
	    },

	    hexToHtml: function ( v ) { 
	        v = v === undefined ? 0x000000 : v;
	        return "#" + ("000000" + v.toString(16)).substr(-6);
	        
	    },

	    htmlToHex: function ( v ) { 

	        return v.toUpperCase().replace("#", "0x");

	    },

	    u255: function (c, i) {

	        return parseInt(c.substring(i, i + 2), 16) / 255;

	    },

	    u16: function ( c, i ) {

	        return parseInt(c.substring(i, i + 1), 16) / 15;

	    },

	    unpack: function( c ){

	        if (c.length == 7) return [ T.u255(c, 1), T.u255(c, 3), T.u255(c, 5) ];
	        else if (c.length == 4) return [ T.u16(c,1), T.u16(c,2), T.u16(c,3) ];

	    },

	    p255: function ( c ) {
	        let h = Math.round( ( c * 255 ) ).toString( 16 );
	        if ( h.length < 2 ) h = '0' + h;
	        return h;
	    },

	    pack: function ( c ) {

	        return '#' + T.p255( c[ 0 ] ) + T.p255( c[ 1 ] ) + T.p255( c[ 2 ] );

	    },

	    htmlRgb: function( c ){

	        return 'rgb(' + Math.round(c[0] * 255) + ','+ Math.round(c[1] * 255) + ','+ Math.round(c[2] * 255) + ')';

	    },

	    pad: function( n ){
	        if(n.length == 1)n = '0' + n;
	        return n;
	    },

	    rgbToHex : function( c ){

	        let r = Math.round(c[0] * 255).toString(16);
	        let g = Math.round(c[1] * 255).toString(16);
	        let b = Math.round(c[2] * 255).toString(16);
	        return '#' + T.pad(r) + T.pad(g) + T.pad(b);

	       // return '#' + ( '000000' + ( ( c[0] * 255 ) << 16 ^ ( c[1] * 255 ) << 8 ^ ( c[2] * 255 ) << 0 ).toString( 16 ) ).slice( - 6 );

	    },

	    hueToRgb: function( p, q, t ){

	        if ( t < 0 ) t += 1;
	        if ( t > 1 ) t -= 1;
	        if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
	        if ( t < 1 / 2 ) return q;
	        if ( t < 2 / 3 ) return p + ( q - p ) * 6 * ( 2 / 3 - t );
	        return p;

	    },

	    rgbToHsl: function ( c ) {

	        let r = c[0], g = c[1], b = c[2], min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min, h = 0, s = 0, l = (min + max) / 2;
	        if (l > 0 && l < 1) s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
	        if (delta > 0) {
	            if (max == r && max != g) h += (g - b) / delta;
	            if (max == g && max != b) h += (2 + (b - r) / delta);
	            if (max == b && max != r) h += (4 + (r - g) / delta);
	            h /= 6;
	        }
	        return [ h, s, l ];

	    },

	    hslToRgb: function ( c ) {

	        let p, q, h = c[0], s = c[1], l = c[2];

	        if ( s === 0 ) return [ l, l, l ];
	        else {
	            q = l <= 0.5 ? l * (s + 1) : l + s - ( l * s );
	            p = l * 2 - q;
	            return [ T.hueToRgb(p, q, h + 0.33333), T.hueToRgb(p, q, h), T.hueToRgb(p, q, h - 0.33333) ];
	        }

	    },

	    // ----------------------
	    //   SVG MODEL
	    // ----------------------

	    makeGradiant: function ( type, settings, parent, colors ) {

	        T.dom( type, null, settings, parent, 0 );

	        let n = parent.childNodes[0].childNodes.length - 1, c;

	        for( let i = 0; i < colors.length; i++ ){

	            c = colors[i];
	            //T.dom( 'stop', null, { offset:c[0]+'%', style:'stop-color:'+c[1]+'; stop-opacity:'+c[2]+';' }, parent, [0,n] );
	            T.dom( 'stop', null, { offset:c[0]+'%', 'stop-color':c[1],  'stop-opacity':c[2] }, parent, [0,n] );

	        }

	    },

	    /*makeGraph: function () {

	        let w = 128;
	        let radius = 34;
	        let svg = T.dom( 'svg', T.css.basic , { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
	        T.dom( 'path', '', { d:'', stroke:T.colors.text, 'stroke-width':4, fill:'none', 'stroke-linecap':'butt' }, svg );//0
	        //T.dom( 'rect', '', { x:10, y:10, width:108, height:108, stroke:'rgba(0,0,0,0.3)', 'stroke-width':2 , fill:'none'}, svg );//1
	        //T.dom( 'circle', '', { cx:64, cy:64, r:radius, fill:T.colors.button, stroke:'rgba(0,0,0,0.3)', 'stroke-width':8 }, svg );//0
	        
	        //T.dom( 'circle', '', { cx:64, cy:64, r:radius+7, stroke:'rgba(0,0,0,0.3)', 'stroke-width':7 , fill:'none'}, svg );//2
	        //T.dom( 'path', '', { d:'', stroke:'rgba(255,255,255,0.3)', 'stroke-width':2, fill:'none', 'stroke-linecap':'round', 'stroke-opacity':0.5 }, svg );//3
	        T.graph = svg;

	    },*/

	    makePad: function ( model ) {

	        let ww = 256;
	        let svg = T.dom( 'svg', T.css.basic + 'position:relative;', { viewBox:'0 0 '+ww+' '+ww, width:ww, height:ww, preserveAspectRatio:'none' } );
	        let w = 200; 
	        let d = (ww-w)*0.5, m = 20;
	        Tools.dom( 'rect', '', { x: d, y: d,  width: w, height: w, fill:T.colors.back }, svg ); // 0
	        Tools.dom( 'rect', '', { x: d+m*0.5, y: d+m*0.5, width: w - m , height: w - m, fill:T.colors.button }, svg ); // 1
	        // Pointer
	        Tools.dom( 'line', '', { x1: d+(m*0.5), y1: ww *0.5, x2: d+(w-m*0.5), y2: ww * 0.5, stroke:T.colors.back, 'stroke-width': 2 }, svg ); // 2
	        Tools.dom( 'line', '', { x1: ww * 0.5, x2: ww * 0.5, y1: d+(m*0.5), y2: d+(w-m*0.5), stroke:T.colors.back, 'stroke-width': 2 }, svg ); // 3
	        Tools.dom( 'circle', '', { cx: ww * 0.5, cy: ww * 0.5, r:5, stroke: T.colors.text, 'stroke-width': 5, fill:'none' }, svg ); // 4
	        T.pad2d = svg;

	    },

	    makeKnob: function ( model ) {

	        let w = 128;
	        let radius = 34;
	        let svg = T.dom( 'svg', T.css.basic + 'position:relative;', { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
	        T.dom( 'circle', '', { cx:64, cy:64, r:radius, fill:T.colors.button, stroke:'rgba(0,0,0,0.3)', 'stroke-width':8 }, svg );//0
	        T.dom( 'path', '', { d:'', stroke:T.colors.text, 'stroke-width':4, fill:'none', 'stroke-linecap':'round' }, svg );//1
	        T.dom( 'circle', '', { cx:64, cy:64, r:radius+7, stroke:'rgba(0,0,0,0.1)', 'stroke-width':7 , fill:'none'}, svg );//2
	        T.dom( 'path', '', { d:'', stroke:'rgba(255,255,255,0.3)', 'stroke-width':2, fill:'none', 'stroke-linecap':'round', 'stroke-opacity':0.5 }, svg );//3
	        T.knob = svg;

	    },

	    makeCircular: function ( model ) {

	        let w = 128;
	        let radius = 40;
	        let svg = T.dom( 'svg', T.css.basic + 'position:relative;', { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
	        T.dom( 'circle', '', { cx:64, cy:64, r:radius, stroke:'rgba(0,0,0,0.1)', 'stroke-width':10, fill:'none' }, svg );//0
	        T.dom( 'path', '', { d:'', stroke:T.colors.text, 'stroke-width':7, fill:'none', 'stroke-linecap':'butt' }, svg );//1
	        T.circular = svg;

	    },

	    makeJoystick: function ( model ) {

	        //+' background:#f00;'

	        let w = 128, ccc;
	        let radius = Math.floor((w-30)*0.5);
	        let innerRadius = Math.floor(radius*0.6);
	        let svg = T.dom( 'svg', T.css.basic + 'position:relative;', { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
	        T.dom( 'defs', null, {}, svg );
	        T.dom( 'g', null, {}, svg );

	        if( model === 0 ){

	        

	            // gradian background
	            ccc = [ [40, 'rgb(0,0,0)', 0.3], [80, 'rgb(0,0,0)', 0], [90, 'rgb(50,50,50)', 0.4], [100, 'rgb(50,50,50)', 0] ];
	            T.makeGradiant( 'radialGradient', { id:'grad', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, ccc );

	            // gradian shadow
	            ccc = [ [60, 'rgb(0,0,0)', 0.5], [100, 'rgb(0,0,0)', 0] ];
	            T.makeGradiant( 'radialGradient', { id:'gradS', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, ccc );

	            // gradian stick
	            let cc0 = ['rgb(40,40,40)', 'rgb(48,48,48)', 'rgb(30,30,30)'];
	            let cc1 = ['rgb(1,90,197)', 'rgb(3,95,207)', 'rgb(0,65,167)'];

	            ccc = [ [30, cc0[0], 1], [60, cc0[1], 1], [80, cc0[1], 1], [100, cc0[2], 1] ];
	            T.makeGradiant( 'radialGradient', { id:'gradIn', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, ccc );

	            ccc = [ [30, cc1[0], 1], [60, cc1[1], 1], [80, cc1[1], 1], [100, cc1[2], 1] ];
	            T.makeGradiant( 'radialGradient', { id:'gradIn2', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, ccc );

	            // graph

	            T.dom( 'circle', '', { cx:64, cy:64, r:radius, fill:'url(#grad)' }, svg );//2
	            T.dom( 'circle', '', { cx:64+5, cy:64+10, r:innerRadius+10, fill:'url(#gradS)' }, svg );//3
	            T.dom( 'circle', '', { cx:64, cy:64, r:innerRadius, fill:'url(#gradIn)' }, svg );//4

	            T.joystick_0 = svg;

	        } else {
	             // gradian shadow
	            ccc = [ [69, 'rgb(0,0,0)', 0],[70, 'rgb(0,0,0)', 0.3], [100, 'rgb(0,0,0)', 0] ];
	            T.makeGradiant( 'radialGradient', { id:'gradX', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, ccc );

	            T.dom( 'circle', '', { cx:64, cy:64, r:radius, fill:'none', stroke:'rgba(100,100,100,0.25)', 'stroke-width':'4' }, svg );//2
	            T.dom( 'circle', '', { cx:64, cy:64, r:innerRadius+14, fill:'url(#gradX)' }, svg );//3
	            T.dom( 'circle', '', { cx:64, cy:64, r:innerRadius, fill:'none', stroke:'rgb(100,100,100)', 'stroke-width':'4' }, svg );//4

	            T.joystick_1 = svg;
	        }

	        

	    },

	    makeColorRing: function () {

	        let w = 256;
	        let svg = T.dom( 'svg', T.css.basic + 'position:relative;', { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
	        T.dom( 'defs', null, {}, svg );
	        T.dom( 'g', null, {}, svg );

	        let s = 30;//stroke
	        let r =( w-s )*0.5;
	        let mid = w*0.5;
	        let n = 24, nudge = 8 / r / n * Math.PI, a1 = 0;
	        let am, tan, d2, a2, ar, i, j, path, ccc;
	        let color = [];
	        
	        for ( i = 0; i <= n; ++i) {

	            d2 = i / n;
	            a2 = d2 * T.TwoPI;
	            am = (a1 + a2) * 0.5;
	            tan = 1 / Math.cos((a2 - a1) * 0.5);

	            ar = [
	                Math.sin(a1), -Math.cos(a1), 
	                Math.sin(am) * tan, -Math.cos(am) * tan, 
	                Math.sin(a2), -Math.cos(a2)
	            ];
	            
	            color[1] = T.rgbToHex( T.hslToRgb([d2, 1, 0.5]) );

	            if (i > 0) {

	                j = 6;
	                while(j--){
	                   ar[j] = ((ar[j]*r)+mid).toFixed(2);
	                }

	                path = ' M' + ar[0] + ' ' + ar[1] + ' Q' + ar[2] + ' ' + ar[3] + ' ' + ar[4] + ' ' + ar[5];

	                ccc = [ [0,color[0],1], [100,color[1],1] ];
	                T.makeGradiant( 'linearGradient', { id:'G'+i, x1:ar[0], y1:ar[1], x2:ar[4], y2:ar[5], gradientUnits:"userSpaceOnUse" }, svg, ccc );

	                T.dom( 'path', '', { d:path, 'stroke-width':s, stroke:'url(#G'+i+')', 'stroke-linecap':"butt" }, svg, 1 );
	                
	            }
	            a1 = a2 - nudge; 
	            color[0] = color[1];
	        }

	        let tw = 84.90;

	        // black / white
	        ccc = [ [0, '#FFFFFF', 1], [50, '#FFFFFF', 0], [50, '#000000', 0], [100, '#000000', 1] ];
	        T.makeGradiant( 'linearGradient', { id:'GL0', x1:0, y1:mid-tw, x2:0, y2:mid+tw, gradientUnits:"userSpaceOnUse" }, svg, ccc );

	        ccc = [ [0, '#7f7f7f', 1], [50, '#7f7f7f', 0.5], [100, '#7f7f7f', 0] ];
	        T.makeGradiant( 'linearGradient', { id:'GL1', x1:mid-49.05, y1:0, x2:mid+98, y2:0, gradientUnits:"userSpaceOnUse" }, svg, ccc );

	        T.dom( 'g', null, { 'transform-origin': '128px 128px', 'transform':'rotate(0)' }, svg );//2
	        T.dom( 'polygon', '', { points:'78.95 43.1 78.95 212.85 226 128',  fill:'red'  }, svg, 2 );// 2,0
	        T.dom( 'polygon', '', { points:'78.95 43.1 78.95 212.85 226 128',  fill:'url(#GL1)','stroke-width':1, stroke:'url(#GL1)'  }, svg, 2 );//2,1
	        T.dom( 'polygon', '', { points:'78.95 43.1 78.95 212.85 226 128',  fill:'url(#GL0)','stroke-width':1, stroke:'url(#GL0)'  }, svg, 2 );//2,2
	        T.dom( 'path', '', { d:'M 255.75 136.5 Q 256 132.3 256 128 256 123.7 255.75 119.5 L 241 128 255.75 136.5 Z',  fill:'none','stroke-width':2, stroke:'#000'  }, svg, 2 );//2,3
	        //T.dom( 'circle', '', { cx:128+113, cy:128, r:6, 'stroke-width':3, stroke:'#000', fill:'none' }, svg, 2 );//2.3

	        T.dom( 'circle', '', { cx:128, cy:128, r:6, 'stroke-width':2, stroke:'#000', fill:'none' }, svg );//3

	        T.colorRing = svg;

	    },

	    icon: function ( type, color, w ){

	        w = w || 40;
	        //color = color || '#DEDEDE';
	        let viewBox = '0 0 256 256';
	        //let viewBox = '0 0 '+ w +' '+ w;
	        let t = ["<svg xmlns='"+T.svgns+"' version='1.1' xmlns:xlink='"+T.htmls+"' style='pointer-events:none;' preserveAspectRatio='xMinYMax meet' x='0px' y='0px' width='"+w+"px' height='"+w+"px' viewBox='"+viewBox+"'><g>"];
	        switch(type){
	            case 'logo':
	            t[1]="<path id='logoin' fill='"+color+"' stroke='none' d='"+T.logoFill_d+"'/>";
	            break;
	            case 'donate':
	            t[1]="<path id='logoin' fill='"+color+"' stroke='none' d='"+T.logo_donate+"'/>";
	            break;
	            case 'neo':
	            t[1]="<path id='logoin' fill='"+color+"' stroke='none' d='"+T.logo_neo+"'/>";
	            break;
	            case 'phy':
	            t[1]="<path id='logoin' stroke='"+color+"' stroke-width='49' stroke-linejoin='round' stroke-linecap='butt' fill='none' d='"+T.logo_phy+"'/>";
	            break;
	            case 'config':
	            t[1]="<path id='logoin' stroke='"+color+"' stroke-width='49' stroke-linejoin='round' stroke-linecap='butt' fill='none' d='"+T.logo_config+"'/>";
	            break;
	            case 'github':
	            t[1]="<path id='logoin' fill='"+color+"' stroke='none' d='"+T.logo_github+"'/>";
	            break;
	            case 'save':
	            t[1]="<path stroke='"+color+"' stroke-width='4' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 26.125 17 L 20 22.95 14.05 17 M 20 9.95 L 20 22.95'/><path stroke='"+color;
	            t[1]+="' stroke-width='2.5' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 32.6 23 L 32.6 25.5 Q 32.6 28.5 29.6 28.5 L 10.6 28.5 Q 7.6 28.5 7.6 25.5 L 7.6 23'/>";
	            break;
	        }
	        t[2] = "</g></svg>";
	        return t.join("\n");

	    },

	    logoFill_d:`
    M 171 150.75 L 171 33.25 155.5 33.25 155.5 150.75 Q 155.5 162.2 147.45 170.2 139.45 178.25 128 178.25 116.6 178.25 108.55 170.2 100.5 162.2 100.5 150.75 
    L 100.5 33.25 85 33.25 85 150.75 Q 85 168.65 97.55 181.15 110.15 193.75 128 193.75 145.9 193.75 158.4 181.15 171 168.65 171 150.75 
    M 200 33.25 L 184 33.25 184 150.8 Q 184 174.1 167.6 190.4 151.3 206.8 128 206.8 104.75 206.8 88.3 190.4 72 174.1 72 150.8 L 72 33.25 56 33.25 56 150.75 
    Q 56 180.55 77.05 201.6 98.2 222.75 128 222.75 157.8 222.75 178.9 201.6 200 180.55 200 150.75 L 200 33.25 Z
    `,

	    logo_github:`
    M 180.5 70 Q 186.3 82.4 181.55 96.55 196.5 111.5 189.7 140.65 183.65 168.35 146 172.7 152.5 178.7 152.55 185.9 L 152.55 218.15 Q 152.84 224.56 159.15 223.3 
    159.21 223.3 159.25 223.3 181.14 216.25 198.7 198.7 228 169.4 228 128 228 86.6 198.7 57.3 169.4 28 128 28 86.6 28 57.3 57.3 28 86.6 28 128 28 169.4 57.3 198.7 74.85 
    216.25 96.75 223.3 96.78 223.3 96.8 223.3 103.16 224.54 103.45 218.15 L 103.45 200 Q 82.97 203.1 75.1 196.35 69.85 191.65 68.4 185.45 64.27 177.055 59.4 174.15 49.20 
    166.87 60.8 167.8 69.85 169.61 75.7 180 81.13 188.09 90 188.55 98.18 188.86 103.45 185.9 103.49 178.67 110 172.7 72.33 168.33 66.3 140.65 59.48 111.49 74.45 96.55 69.7 
    82.41 75.5 70 84.87 68.74 103.15 80 115.125 76.635 128 76.85 140.85 76.65 152.85 80 171.1 68.75 180.5 70 Z
    `,

	    logo_neo:`
    M 219 52 L 206 52 206 166 Q 206 183.4 193.75 195.65 181.4 208 164 208 146.6 208 134.35 195.65 122 183.4 122 166 L 122 90 Q 122 77.6 113.15 68.85 104.4 60 92 60 79.55 
    60 70.75 68.85 62 77.6 62 90 L 62 204 75 204 75 90 Q 75 83 79.95 78 84.95 73 92 73 99 73 104 78 109 83 109 90 L 109 166 Q 109 188.8 125.15 204.85 141.2 221 164 221 
    186.75 221 202.95 204.85 219 188.8 219 166 L 219 52 M 194 52 L 181 52 181 166 Q 181 173 176.05 178 171.05 183 164 183 157 183 152 178 147 173 147 166 L 147 90 Q 147 
    67.2 130.85 51.15 114.8 35 92 35 69.25 35 53.05 51.15 37 67.2 37 90 L 37 204 50 204 50 90 Q 50 72.6 62.25 60.35 74.6 48 92 48 109.4 48 121.65 60.35 134 72.6 134 90 L 
    134 166 Q 134 178.4 142.85 187.15 151.6 196 164 196 176.45 196 185.25 187.15 194 178.4 194 166 L 194 52 Z
    `,

	    logo_phy:`
    M 103.55 37.95 L 127.95 37.95 Q 162.35 37.95 186.5 55 210.9 72.35 210.9 96.5 210.9 120.65 186.5 137.7 162.35 155 127.95 155 L 127.95 237.95 M 127.95 155 
    Q 93.55 155 69.15 137.7 45 120.65 45 96.5 45 72.35 69.15 55 70.9 53.8 72.85 52.85 M 127.95 155 L 127.95 37.95
    `,

	    logo_config:`
    M 204.35 51.65 L 173.25 82.75 Q 192 101.5 192 128 L 236 128 M 192 128 Q 192 154.55 173.25 173.25 L 204.4 204.4 M 51.65 51.65 L 82.75 82.75 Q 101.5 64 128 64 
    L 128 20 M 51.6 204.4 L 82.75 173.25 Q 64 154.55 64 128 L 20 128 M 128 236 L 128 192 Q 101.5 192 82.75 173.25 M 64 128 Q 64 101.5 82.75 82.75 M 173.25 173.25 
    Q 154.55 192 128 192 M 128 64 Q 154.55 64 173.25 82.75
    `,

	    logo_donate:`
    M 171.3 80.3 Q 179.5 62.15 171.3 45.8 164.1 32.5 141.35 30.1 L 94.35 30.1 Q 89.35 30.4 88.3 35.15 L 70.5 148.05 Q 70.2 152.5 73.7 152.6 L 100.95 152.6 107 111.6 Q 108.75 
    106.55 112.6 106.45 130.45 108.05 145.3 103.9 163.35 98.75 171.3 80.3 M 179.8 71.5 Q 178.6 79.75 174.9 87.85 168.45 102.9 151.9 109.15 140.65 113.95 117.55 113 113.15 
    112.75 111 117.45 L 102.7 169.95 Q 102.45 173.8 105.5 173.85 L 128.95 173.85 Q 132.2 174.2 133.35 169.65 L 138.3 139.95 Q 139.75 135.6 143.1 135.5 146.6 135.75 150.6 135.65 
    154.55 135.5 157.35 135.1 160.15 134.7 166.75 132.35 181.35 127.4 187.9 111.2 194.25 95.75 189.5 81.95 186.75 74.85 179.8 71.5 M 103.5 209.9 Q 103.5 202.85 99.7 198.85 95.95 
    194.75 89.4 194.75 82.8 194.75 79.05 198.85 75.3 202.9 75.3 209.9 75.3 216.85 79.05 220.95 82.8 225.05 89.4 225.05 95.95 225.05 99.7 221 103.5 216.95 103.5 209.9 M 95.45 205.5 
    Q 95.95 207.3 95.95 209.9 95.95 212.65 95.45 214.35 94.95 216 94 217.3 93.1 218.45 91.9 219 90.7 219.55 89.4 219.55 88.15 219.55 86.95 219.05 85.75 218.55 84.8 217.3 83.9 216.15 
    83.4 214.35 82.85 212.6 82.85 209.9 82.85 207.3 83.4 205.45 83.95 203.55 84.85 202.45 85.9 201.2 86.95 200.75 88.05 200.25 89.4 200.25 90.7 200.25 91.85 200.8 93.05 201.3 94 202.5 
    94.9 203.65 95.45 205.5 M 153.3 195.35 L 145.3 195.35 135.5 224.45 142.8 224.45 144.6 218.5 153.75 218.5 155.6 224.45 163.1 224.45 153.3 195.35 M 152.15 213.25 L 146.25 213.25 
    149.2 203.65 152.15 213.25 M 116.75 195.35 L 107.8 195.35 107.8 224.45 114.5 224.45 114.5 204.2 125.7 224.45 132.75 224.45 132.75 195.35 126.05 195.35 126.05 212.05 116.75 195.35 M 
    66.5 197.65 Q 64.15 196.15 61.45 195.75 58.8 195.35 55.75 195.35 L 46.7 195.35 46.7 224.45 55.8 224.45 Q 58.8 224.45 61.5 224.05 64.15 223.6 66.4 222.15 69.15 220.45 70.9 217.2 
    72.7 214 72.7 209.95 72.7 205.7 71 202.6 69.35 199.5 66.5 197.65 M 64.2 205 Q 65.2 207 65.2 209.9 65.2 212.75 64.25 214.75 63.3 216.75 61.5 217.85 60 218.85 58.3 218.9 56.6 219 
    54.15 219 L 54 219 54 200.8 54.15 200.8 Q 56.4 200.8 58.05 200.9 59.7 200.95 61.15 201.75 63.2 202.95 64.2 205 M 210.2 195.35 L 190.5 195.35 190.5 224.45 210.2 224.45 210.2 218.9 
    197.75 218.9 197.75 211.55 209.2 211.55 209.2 206 197.75 206 197.75 200.9 210.2 200.9 210.2 195.35 M 187.5 195.35 L 163 195.35 163 200.9 171.6 200.9 171.6 224.45 178.9 224.45 178.9 
    200.9 187.5 200.9 187.5 195.35 Z
    `,

	};

	T.setText();

	const Tools = T;

	///https://wicg.github.io/file-system-access/#api-filesystemfilehandle-getfile


	class Files {

	    //-----------------------------
	    //  FILE TYPE
	    //-----------------------------

	    static autoTypes( type ) {

	        let t = [];

	        switch( type ){
	            case 'svg':
	            t = [ { accept: { 'image/svg+xml': '.svg'} }, ];
	            break;
	            case 'wav':
	            t = [ { accept: { 'audio/wav': '.wav'} }, ];
	            break;
	            case 'mp3':
	            t = [ { accept: { 'audio/mpeg': '.mp3'} }, ];
	            break;
	            case 'mp4':
	            t = [ { accept: { 'video/mp4': '.mp4'} }, ];
	            break;
	            case 'bin': case 'hex':
	            t = [ { description: 'Binary Files', accept: { 'application/octet-stream': ['.bin', '.hex'] } }, ];
	            break;
	            case 'text':
	            t = [ { description: 'Text Files', accept: { 'text/plain': ['.txt', '.text'], 'text/html': ['.html', '.htm'] } }, ];
	            break;
	            case 'json':
	            t = [ { description: 'JSON Files', accept: { 'application/json': ['.json'] } }, ];//text/plain
	            break;
	            case 'js':
	            t = [ { description: 'JavaScript Files', accept: { 'text/javascript': ['.js'] } }, ];
	            break;
	            case 'image':
	            t = [ { description: 'Images', accept: { 'image/*': ['.png', '.gif', '.jpeg', '.jpg'] } }, ];
	            break;
	            case 'icon':
	            t = [ { description: 'Icons', accept: { 'image/x-ico': ['.ico'] } }, ];
	            break;
	            case 'lut':
	            t = [ { description: 'Lut', accept: { 'text/plain': ['.cube', '.3dl'] } }, ];
	            break;

	        }

	        return t

	    }


	    //-----------------------------
	    //  LOAD
	    //-----------------------------

		static async load( o = {} ) {

	        if (typeof window.showOpenFilePicker !== 'function') {
	            window.showOpenFilePicker = Files.showOpenFilePickerPolyfill;
	        }

	        try {

	        	let type = o.type || '';

	            const options = {
	                excludeAcceptAllOption: type ? true : false,
	                multiple: false,
	                //startIn:'./assets'
	            };

	            options.types = Files.autoTypes( type );

	            // create a new handle
	            const handle = await window.showOpenFilePicker( options );
	            const file = await handle[0].getFile();
	            //let content = await file.text()

	            if( !file ) return null

	            let fname = file.name;
	            let ftype = fname.substring( fname.lastIndexOf('.')+1, fname.length );

	            const dataUrl = [ 'png', 'jpg', 'jpeg', 'mp4', 'webm', 'ogg', 'mp3' ];
	            const dataBuf = [ 'sea', 'z', 'hex', 'bvh', 'BVH', 'glb', 'gltf' ];
	            const reader = new FileReader();

	            if( dataUrl.indexOf( ftype ) !== -1 ) reader.readAsDataURL( file );
	            else if( dataBuf.indexOf( ftype ) !== -1 ) reader.readAsArrayBuffer( file );
	            else reader.readAsText( file );

	            reader.onload = function(e) {

	                let content = e.target.result;

	                switch(type){
	                    case 'image':
	                        let img = new Image;
	                        img.onload = function() {
	                            if( o.callback ) o.callback( img, fname, ftype );
	                        };
	                        img.src = content;
	                    break;
	                    case 'json':
	                        if( o.callback ) o.callback( JSON.parse( content ), fname, ftype );
	                    break;
	                    default:
	                        if( o.callback ) o.callback( content, fname, ftype );
	                    break;
	                }

	            };

	        } catch(e) {

	            console.log(e);
	            if( o.always && o.callback ) o.callback( null );

	        }

	    }

		static showOpenFilePickerPolyfill( options ) {
	        return new Promise((resolve) => {
	            const input = document.createElement("input");
	            input.type = "file";
	            input.multiple = options.multiple;
	            input.accept = options.types
	                .map((type) => type.accept)
	                .flatMap((inst) => Object.keys(inst).flatMap((key) => inst[key]))
	                .join(",");

	            input.addEventListener("change", () => {
	                resolve(
	                    [...input.files].map((file) => {
	                        return {
	                            getFile: async () =>
	                                new Promise((resolve) => {
	                                    resolve(file);
	                                }),
	                        };
	                    })
	                );
	            });

	            input.click();
	        })
	    }


	    //-----------------------------
	    //  SAVE
	    //-----------------------------

	    static async save( o = {} ) {

	        let usePoly = false;

	        if (typeof window.showSaveFilePicker !== 'function') {
	            window.showSaveFilePicker = Files.showSaveFilePickerPolyfill;
	            usePoly = true;
	        }

	        try {

	            let type = o.type || '';

	            const options = {
	                suggestedName: o.name || 'hello',
	                data: o.data || ''
	            };

	            options.types = Files.autoTypes( type );
	            options.finalType = Object.keys( options.types[0].accept )[0];
	            options.suggestedName += options.types[0].accept[options.finalType][0];


	            // create a new handle
	            const handle = await window.showSaveFilePicker( options );

	            if( usePoly ) return

	            // create a FileSystemWritableFileStream to write to
	            const file = await handle.createWritable();

	            let blob = new Blob([ options.data ], { type: options.finalType });

	            // write our file
	            await file.write(blob);

	            // close the file and write the contents to disk.
	            await file.close();

	        } catch(e) {

	            console.log(e);

	        }

	    }

	    static showSaveFilePickerPolyfill( options ) {
	        return new Promise((resolve) => {
	            const a = document.createElement("a");
	            a.download = options.suggestedName || "my-file.txt";
	            let blob = new Blob([ options.data ], { type:options.finalType });
	            a.href = URL.createObjectURL( blob );

	            a.addEventListener("click", () => {
	                resolve(
	                    setTimeout( () => URL.revokeObjectURL(a.href), 1000 )
	                );
	            });
	            a.click();
	        })
	    }


	    //-----------------------------
	    //  FOLDER not possible in poly
	    //-----------------------------

	    static async getFolder() {

	        try {
	    
	            const handle = await window.showDirectoryPicker();
	            const files = [];
	            for await (const entry of handle.values()) {
	                const file = await entry.getFile();
	                files.push(file);
	            }

	            console.log(files);
	            return files;

	        } catch(e) {

	            console.log(e);

	        }
	    
	    }








	    

	}

	class V2 {

		constructor( x = 0, y = 0 ) {

			this.x = x;
			this.y = y;

		}

		set ( x, y ) {

			this.x = x;
			this.y = y;
			return this;

		}

		divide ( v ) {

			this.x /= v.x;
			this.y /= v.y;
			return this;

		}

		multiply ( v ) {

			this.x *= v.x;
			this.y *= v.y;
			return this;

		}

		multiplyScalar ( scalar ) {

			this.x *= scalar;
			this.y *= scalar;
			return this;

		}

		divideScalar ( scalar ) {

			return this.multiplyScalar( 1 / scalar );

		}

		length () {

			return Math.sqrt( this.x * this.x + this.y * this.y );

		}

		angle () {

			// computes the angle in radians with respect to the positive x-axis

			var angle = Math.atan2( this.y, this.x );

			if ( angle < 0 ) angle += 2 * Math.PI;

			return angle;

		}

		addScalar ( s ) {

			this.x += s;
			this.y += s;
			return this;

		}

		negate () {

			this.x *= -1;
			this.y *= -1;
			return this;

		}

		neg () {

			this.x = -1;
			this.y = -1;
			return this;

		}

		isZero () {

			return ( this.x === 0 && this.y === 0 );

		}

		copy ( v ) {

			this.x = v.x;
			this.y = v.y;

			return this;

		}

		equals ( v ) {

			return ( ( v.x === this.x ) && ( v.y === this.y ) );

		}

		nearEquals ( v, n ) {

			return ( ( v.x.toFixed(n) === this.x.toFixed(n) ) && ( v.y.toFixed(n) === this.y.toFixed(n) ) );

		}

		lerp ( v, alpha ) {

			if( v === null ){
				this.x -= this.x * alpha;
			    this.y -= this.y * alpha;
			} else {
				this.x += ( v.x - this.x ) * alpha;
			    this.y += ( v.y - this.y ) * alpha;
			}

			return this;

		}

	}

	/**
	 * @author lth / https://github.com/lo-th
	 */

	class Proto {
	  constructor(o = {}) {
	    // disable mouse controle
	    this.lock = o.lock || false;

	    // for button
	    this.neverlock = false;

	    // only simple space
	    this.isSpace = o.isSpace || false;

	    // if is on gui or group
	    this.main = o.main || null;
	    this.isUI = o.isUI || false;
	    this.group = o.group || null;

	    this.isListen = false;

	    this.top = 0;
	    this.ytop = 0;

	    this.dx = o.dx || 0;

	    this.isSelectable = o.selectable !== undefined ? o.selectable : false;
	    this.unselectable =
	      o.unselect !== undefined ? o.unselect : this.isSelectable;

	    this.ontop = o.ontop ? o.ontop : false; // 'beforebegin' 'afterbegin' 'beforeend' 'afterend'

	    this.css = this.main ? this.main.css : Tools.css;

	    this.colors = Tools.defineColor(
	      o,
	      this.main
	        ? this.group
	          ? this.group.colors
	          : this.main.colors
	        : Tools.colors
	    );

	    this.overEffect = this.colors.showOver;

	    this.svgs = Tools.svgs;

	    this.zone = { x: 0, y: 0, w: 0, h: 0, d: 0 };
	    this.local = new V2().neg();

	    this.isCanvasOnly = false;
	    this.isSelect = false;

	    // percent of title
	    this.p = o.p !== undefined ? o.p : Tools.size.p;

	    this.w = this.isUI ? this.main.size.w : Tools.size.w;
	    if (o.w !== undefined) this.w = o.w;

	    this.h = this.isUI ? this.main.size.h : Tools.size.h;
	    if (o.h !== undefined) this.h = o.h;
	    if (!this.isSpace) this.h = this.h < 11 ? 11 : this.h;
	    else this.lock = true;

	    // decale for canvas only
	    this.fw = o.fw || 0;

	    this.autoWidth = o.auto || true; // auto width or flex
	    this.isOpen = false; //false// open statu

	    // radius for toolbox
	    this.radius = o.radius || this.colors.radius;

	    this.transition = o.transition || Tools.transition;

	    // only for number
	    this.isNumber = false;
	    this.noNeg = o.noNeg || false;
	    this.allEqual = o.allEqual || false;

	    // only most simple
	    this.mono = false;

	    // stop listening for edit slide text
	    this.isEdit = false;

	    // no title
	    this.simple = o.simple || false;
	    if (this.simple) this.sa = 0;

	    // define obj size
	    this.setSize(this.w);

	    // title size
	    if (o.sa !== undefined) this.sa = o.sa;
	    if (o.sb !== undefined) this.sb = o.sb;
	    if (this.simple) this.sb = this.w - this.sa;

	    // last number size for slide
	    this.sc = o.sc === undefined ? 47 : o.sc;

	    // for listening object
	    this.objectLink = null;
	    this.isSend = false;
	    this.objectKey = null;

	    this.txt = o.name || "";
	    this.name = o.rename || this.txt;
	    this.target = o.target || null;

	    // callback
	    this.callback = o.callback === undefined ? null : o.callback;
	    this.endCallback = null;
	    this.openCallback = o.openCallback === undefined ? null : o.openCallback;
	    this.closeCallback = o.closeCallback === undefined ? null : o.closeCallback;

	    // if no callback take one from group or gui
	    if (this.callback === null && this.isUI && this.main.callback !== null) {
	      this.callback = this.group ? this.group.callback : this.main.callback;
	    }

	    // elements
	    this.c = [];

	    // style
	    this.s = [];

	    this.useFlex = this.isUI ? this.main.useFlex : false;
	    let flexible = this.useFlex
	      ? "display:flex; justify-content:center; align-items:center; text-align:center; flex: 1 100%;"
	      : "float:left;";

	    this.c[0] = Tools.dom(
	      "div",
	      this.css.basic + flexible + "position:relative; height:20px;"
	    );

	    this.s[0] = this.c[0].style;

	    // bottom margin
	    this.margin = this.colors.sy;
	    this.mtop = 0;
	    let marginDiv = Tools.isDivid(this.margin);

	    if (this.isUI && this.margin) {
	      this.s[0].boxSizing = "content-box";
	      if (marginDiv) {
	        this.mtop = this.margin * 0.5;
	        //this.s[0].borderTop = '${this.mtop}px solid transparent'
	        //console.log(`${this.mtop}px solid transparent`)
	        this.s[0].borderTop = this.mtop + "px solid transparent";
	        this.s[0].borderBottom = this.mtop + "px solid transparent";
	      } else {
	        this.s[0].borderBottom = this.margin + "px solid transparent";
	      }
	    }

	    // with title
	    if (!this.simple) {
	      this.c[1] = Tools.dom("div", this.css.txt + this.css.middle);
	      this.s[1] = this.c[1].style;
	      this.c[1].textContent = this.name;
	      this.s[1].color = this.lock ? this.colors.titleoff : this.colors.title;
	    }

	    if (o.pos) {
	      this.s[0].position = "absolute";
	      for (let p in o.pos) {
	        this.s[0][p] = o.pos[p];
	      }
	      this.mono = true;
	    }

	    if (o.css) this.s[0].cssText = o.css;
	  }

	  // ----------------------
	  // make the node
	  // ----------------------

	  init() {
	    this.ytop = this.top + this.mtop;

	    this.zone.h = this.h + this.margin;
	    this.zone.w = this.w;

	    let s = this.s; // style cache
	    let c = this.c; // div cach

	    s[0].height = this.h + "px";

	    if (this.isUI) s[0].background = this.colors.background;

	    if (!this.autoWidth && this.useFlex) {
	      s[0].flex = "1 0 auto";
	      s[0].minWidth = this.minw + "px";
	      s[0].textAlign = "center";
	    } else {
	      if (this.isUI) s[0].width = "100%";
	    }

	    //if( this.autoHeight ) s[0].transition = 'height 0.01s ease-out';
	    if (c[1] !== undefined && this.autoWidth) {
	      s[1] = c[1].style;
	      s[1].top = 1 + "px";
	      s[1].height = this.h - 2 + "px";
	    }

	    let frag = Tools.frag;

	    for (let i = 1, lng = c.length; i !== lng; i++) {
	      if (c[i] !== undefined) {
	        frag.appendChild(c[i]);
	        s[i] = c[i].style;
	      }
	    }

	    let pp =
	      this.target !== null
	        ? this.target
	        : this.isUI
	        ? this.main.inner
	        : document.body;

	    if (this.ontop) pp.insertAdjacentElement("afterbegin", c[0]);
	    else pp.appendChild(c[0]);

	    c[0].appendChild(frag);

	    this.rSize();

	    // ! solo proto
	    if (!this.isUI) {
	      this.c[0].style.pointerEvents = "auto";
	      Roots.add(this);
	    }
	  }

	  addTransition() {
	    if (this.baseH && this.transition && this.isUI) {
	      this.c[0].style.transition = "height " + this.transition + "s ease-out";
	    }
	  }

	  // from Tools

	  dom(type, css, obj, dom, id) {
	    return Tools.dom(type, css, obj, dom, id);
	  }

	  setSvg(dom, type, value, id, id2) {
	    Tools.setSvg(dom, type, value, id, id2);
	  }

	  setCss(dom, css) {
	    Tools.setCss(dom, css);
	  }

	  clamp(value, min, max) {
	    return Tools.clamp(value, min, max);
	  }

	  getColorRing() {
	    if (!Tools.colorRing) Tools.makeColorRing();
	    return Tools.clone(Tools.colorRing);
	  }

	  getJoystick(model) {
	    if (!Tools["joystick_" + model]) Tools.makeJoystick(model);
	    return Tools.clone(Tools["joystick_" + model]);
	  }

	  getCircular(model) {
	    if (!Tools.circular) Tools.makeCircular(model);
	    return Tools.clone(Tools.circular);
	  }

	  getKnob(model) {
	    if (!Tools.knob) Tools.makeKnob(model);
	    return Tools.clone(Tools.knob);
	  }

	  getPad2d(model) {
	    if (!Tools.pad2d) Tools.makePad(model);
	    return Tools.clone(Tools.pad2d);
	  }

	  // from Roots

	  cursor(name) {
	    Roots.cursor(name);
	  }

	  /////////

	  update() {}

	  reset() {}

	  /////////

	  content() {
	    return this.c[0];
	  }

	  getDom() {
	    return this.c[0];
	  }

	  uiout() {
	    if (this.lock) return;
	    if (!this.overEffect) return;
	    if (this.s) this.s[0].background = this.colors.background;
	  }

	  uiover() {
	    if (this.lock) return;
	    if (!this.overEffect) return;
	    if (this.s) this.s[0].background = this.colors.backgroundOver;
	  }

	  rename(s) {
	    if (this.c[1] !== undefined) this.c[1].textContent = s;
	  }

	  listen() {
	    this.isListen = Roots.addListen(this);
	    return this;
	  }

	  listening() {
	    // modified by Fedemarino
	    if (this.objectLink === null) return;
	    if (this.isSend) return;
	    if (this.isEdit) return;
	    // check if value has changed
	    let hasChanged = this.setValue(this.objectLink[this.objectKey]);
	    return hasChanged;
	  }

	  setValue(v) {
	    const old = this.value;
	    if (this.isNumber) this.value = this.numValue(v);
	    //else if( v instanceof Array && v.length === 1 ) v = v[0];
	    else this.value = v;
	    this.update();
	    let hasChanged = false;
	    if (old !== this.value) {
	      hasChanged = true;
	    }

	    return hasChanged;
	  }

	  // ----------------------
	  // update every change
	  // ----------------------

	  onChange(f) {
	    if (this.isSpace) return;
	    this.callback = f || null;
	    return this;
	  }

	  // ----------------------
	  // update only on end
	  // ----------------------

	  onFinishChange(f) {
	    if (this.isSpace) return;
	    this.callback = null;
	    this.endCallback = f;
	    return this;
	  }

	  // ----------------------
	  // event on open close
	  // ----------------------

	  onOpen(f) {
	    this.openCallback = f;
	    return this;
	  }

	  onClose(f) {
	    this.closeCallback = f;
	    return this;
	  }

	  // ----------------------
	  //  send back value
	  // ----------------------

	  send(v) {
	    v = v || this.value;
	    if (v instanceof Array && v.length === 1) v = v[0];

	    this.isSend = true;
	    if (this.objectLink !== null) this.objectLink[this.objectKey] = v;
	    if (this.callback) this.callback(v, this.objectKey);
	    this.isSend = false;
	  }

	  sendEnd(v) {
	    v = v || this.value;
	    if (v instanceof Array && v.length === 1) v = v[0];

	    if (this.endCallback) this.endCallback(v);
	    if (this.objectLink !== null) this.objectLink[this.objectKey] = v;
	  }

	  // ----------------------
	  // clear node
	  // ----------------------

	  dispose() {
	    if (this.isListen) Roots.removeListen(this);

	    Tools.clear(this.c[0]);

	    if (this.target !== null) {
	      if (this.group !== null) this.group.clearOne(this);
	      else this.target.removeChild(this.c[0]);
	    } else {
	      if (this.isUI) this.main.clearOne(this);
	      else document.body.removeChild(this.c[0]);
	    }

	    if (!this.isUI) Roots.remove(this);

	    this.c = null;
	    this.s = null;
	    this.callback = null;
	    this.target = null;
	    this.isListen = false;
	  }

	  clear() {}

	  // ----------------------
	  // change size
	  // ----------------------

	  getWidth() {
	    let nw = Roots.getWidth(this);
	    if (nw) this.w = nw;
	  }

	  setSize(sx) {
	    if (!this.autoWidth) return;

	    this.w = sx;

	    if (this.simple) {
	      this.sb = this.w - this.sa;
	    } else {
	      let pp = this.w * (this.p / 100);
	      //this.sa = Math.floor( pp + 10 )
	      //this.sb = Math.floor( this.w - pp - 20 )
	      this.sa = Math.floor(pp + 8);
	      this.sb = Math.floor(this.w - pp - 16);
	    }
	  }

	  rSize() {
	    if (!this.autoWidth) return;
	    if (!this.isUI) this.s[0].width = this.w + "px";
	    if (!this.simple) this.s[1].width = this.sa + "px";
	  }

	  // ----------------------
	  // for numeric value
	  // ----------------------

	  setTypeNumber(o) {
	    this.isNumber = true;

	    this.value = 0;
	    if (o.value !== undefined) {
	      if (typeof o.value === "string") this.value = o.value * 1;
	      else this.value = o.value;
	    }

	    this.min = o.min === undefined ? -Infinity : o.min;
	    this.max = o.max === undefined ? Infinity : o.max;
	    this.precision = o.precision === undefined ? 2 : o.precision;

	    let s;

	    switch (this.precision) {
	      case 0:
	        s = 1;
	        break;
	      case 1:
	        s = 0.1;
	        break;
	      case 2:
	        s = 0.01;
	        break;
	      case 3:
	        s = 0.001;
	        break;
	      case 4:
	        s = 0.0001;
	        break;
	      case 5:
	        s = 0.00001;
	        break;
	      case 6:
	        s = 0.000001;
	        break;
	    }

	    this.step = o.step === undefined ? s : o.step;
	    this.range = this.max - this.min;
	    this.value = this.numValue(this.value);
	  }

	  numValue(n) {
	    if (this.noNeg) n = Math.abs(n);
	    return (
	      Math.min(this.max, Math.max(this.min, n)).toFixed(this.precision) * 1
	    );
	  }

	  // ----------------------
	  //   EVENTS DEFAULT
	  // ----------------------

	  handleEvent(e) {
	    if (this.lock) return;
	    if (this.neverlock) Roots.lock = false;
	    if (!this[e.type])
	      return console.error(e.type, "this type of event no existe !");

	    // TODO !!!!

	    //if( this.marginDiv ) z.d -= this.margin * 0.5

	    //if( this.marginDiv ) e.clientY -= this.margin * 0.5
	    //if( this.group && this.group.marginDiv ) e.clientY -= this.group.margin * 0.5

	    return this[e.type](e);
	  }

	  wheel(e) {
	    return false;
	  }
	  mousedown(e) {
	    return false;
	  }
	  mousemove(e) {
	    return false;
	  }
	  mouseup(e) {
	    return false;
	  }
	  keydown(e) {
	    return false;
	  }
	  keyup(e) {
	    return false;
	  }

	  // ----------------------
	  // object referency
	  // ----------------------

	  setReferency(obj, key) {
	    this.objectLink = obj;
	    this.objectKey = key;
	  }

	  display(v = false) {
	    this.s[0].visibility = v ? "visible" : "hidden";
	  }

	  // ----------------------
	  // resize height
	  // ----------------------

	  open() {
	    if (this.isOpen) return;
	    this.isOpen = true;
	    Roots.needResize = true;
	    if (this.openCallback) this.openCallback();
	  }

	  close() {
	    if (!this.isOpen) return;
	    this.isOpen = false;
	    Roots.needResize = true;
	    if (this.closeCallback) this.closeCallback();
	  }

	  needZone() {
	    Roots.needReZone = true;
	  }

	  rezone() {
	    Roots.needReZone = true;
	  }

	  // ----------------------
	  //  INPUT
	  // ----------------------

	  select() {}

	  unselect() {}

	  setInput(Input) {
	    Roots.setInput(Input, this);
	  }

	  upInput(x, down) {
	    return Roots.upInput(x, down);
	  }

	  // ----------------------
	  // special item
	  // ----------------------

	  selected(b) {
	    this.isSelect = b || false;
	  }
	}

	class Bool extends Proto {

	    constructor( o = {} ) {

	        super( o );
	        
	        this.value = o.value || false;
	        this.model = o.mode !== undefined ? o.mode : 0;

	        this.onName = o.rename || this.txt;
	        if( o.onName ) o.onname = o.onName;
	        if( o.onname ) this.onName = o.onname;

	        this.inh = o.inh || Math.floor( this.h*0.8 );
	        this.inw = o.inw || 36;

	        let cc = this.colors;
	       
	        if( this.model === 0 ){
	            let t = Math.floor(this.h*0.5)-((this.inh-2)*0.5);
	            this.c[2] = this.dom( 'div', this.css.basic + 'background:'+ cc.inputBg +'; height:'+(this.inh-2)+'px; width:'+this.inw+'px; top:'+t+'px; border-radius:10px; border:2px solid '+ cc.back );
	            this.c[3] = this.dom( 'div', this.css.basic + 'height:'+(this.inh-6)+'px; width:16px; top:'+(t+2)+'px; border-radius:10px; background:'+ cc.button+';' );
	        } else {
	            this.p = 0;
	            if( this.c[1] !== undefined ) this.c[1].textContent = '';
	            this.c[2] = this.dom( 'div', this.css.txt + this.css.button + 'top:1px; background:'+cc.button+'; height:'+(this.h-2)+'px; border:'+cc.borderSize+'px solid '+cc.border+'; border-radius:'+this.radius+'px;' );
	        }

	        this.stat = -1;

	        this.init();
	        this.update();

	    }

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mousedown ( e ) {

	        this.value = !this.value;
	        this.update( true );
	        return this.mousemove( e )

	    }

	    mousemove ( e ) {

	        this.cursor('pointer');
	        return this.mode( true )
	        
	    }

	    reset () {

	        this.cursor();
	        return this.mode()

	    }

	    // ----------------------
	    //   MODE
	    // ----------------------

	    mode ( over ) {

	        let change = false;
	        let cc = this.colors, s = this.s, n, v = this.value;

	        if( over ) n = v ? 4 : 3;
	        else n = v ? 2 : 1;

	        if( this.stat !== n ){

	            this.stat = n;

	            if( this.model !== 0 ){

	                switch( n ){

	                    case 1: s[2].color = cc.text; s[2].background = cc.button; break;
	                    case 2: s[2].color = cc.textSelect; s[2].background = cc.select; break;
	                    case 3: s[2].color = cc.textOver; s[2].background = cc.overoff; break;
	                    case 4: s[2].color = cc.textOver; s[2].background = cc.over; break;

	                }

	                this.c[2].innerHTML = v ? this.onName : this.name;

	            } else {

	                switch( n ){

	                    case 1: s[2].background = s[2].borderColor = cc.backoff; s[3].background = cc.button; break;// off out
	                    case 2: s[2].background = s[2].borderColor = cc.back; s[3].background = cc.textOver; break;// on over
	                    case 3: s[2].background = s[2].borderColor = cc.back; s[3].background = cc.overoff; break;// off over
	                    case 4: s[2].background = s[2].borderColor = cc.backoff; s[3].background = cc.textSelect; break;// on out

	                }

	                s[3].marginLeft = v ? '17px' : '2px';
	                this.c[1].textContent = v ? this.onName : this.name;

	            }

	            change = true;

	        }

	        return change

	    }

	    // ----------------------

	    update ( up ) {

	        this.mode();
	        if( up ) this.send();
	            
	    }

	    rSize () {

	        super.rSize();

	        let s = this.s;
	        let w = (this.w - 10 ) - this.inw;
	        if( this.model === 0 ){
	            s[2].left = w + 'px';
	            s[3].left = w + 'px';
	        } else {
	            s[2].left = this.sa + 'px';
	            s[2].width = this.sb  + 'px';
	        }
	        
	    }

	}

	class Button extends Proto {

	    constructor( o = {} ) {

	        super( o );

	        this.value = '';
	        if( o.value !== undefined ) this.value = o.value;

	        this.values = o.value || this.txt;
	        if( o.values ) this.values = o.values;

	        if( !o.values && !o.value ) this.txt = '';

	        this.onName = o.onName || null;

	        this.on = false;

	        // force button width
	        this.bw = o.forceWidth || 0;
	        if(o.bw) this.bw = o.bw;
	        this.space = o.space || 3;

	        if( typeof this.values === 'string' ) this.values = [ this.values ];

	        this.isDown = false;
	        this.neverlock = true;
	        this.res = 0;

	        this.lng = this.values.length;
	        this.tmp = [];
	        this.stat = [];

	        let sel, cc = this.colors;

	        for( let i = 0; i < this.lng; i++ ){

	            sel = false;
	            if( this.values[i] === this.value && this.isSelectable ) sel = true;

	            this.c[i+2] = this.dom( 'div', this.css.txt + this.css.button + 'top:1px; height:'+(this.h-2)+'px; border:'+cc.borderSize+'px solid '+cc.border+'; border-radius:'+this.radius+'px;' );
	            this.c[i+2].style.background = sel ? cc.select : cc.button;
	            this.c[i+2].style.color = sel ? cc.textSelect : cc.text;
	            this.c[i+2].innerHTML = this.values[i];
	            this.stat[i] = sel ? 3:1;

	        }


	        if( this.txt==='' ) this.p = 0; 

	        if( (!o.value && !o.values) || this.p === 0 ){
	            if( this.c[1] !== undefined ) this.c[1].textContent = '';
	        } 
	        

	        this.init();

	    }

	    onOff() {

	        this.on = !this.on;
	        this.label( this.on ? this.onName : this.value );
	        
	    }

	    testZone ( e ) {

	        let l = this.local;
	        if( l.x === -1 && l.y === -1 ) return -1

	        let i = this.lng;
	        let t = this.tmp;
	        
	        while( i-- ){
	        	if( l.x>t[i][0] && l.x<t[i][2] ) return i
	        }

	        return -1

	    }

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mouseup ( e ) {

	        if( !this.isDown ) return false

	        this.isDown = false;
	        if( this.res !== -1 ){
	            if( this.value === this.values[this.res] && this.unselectable ) this.value = '';
	            else this.value = this.values[this.res];
	            if( this.onName !== null ) this.onOff();
	            this.send();
	        }

	        return this.mousemove( e )

	    }

	    mousedown ( e ) {

	        if( this.isDown ) return false
	        this.isDown = true;
	    	return this.mousemove( e )

	    }

	    mousemove ( e ) {

	        let up = false;
	        this.res = this.testZone( e );

	        if( this.res !== -1 ){
	            this.cursor('pointer');
	            up = this.modes( this.isDown ? 3 : 2, this.res );
	        } else {
	        	up = this.reset();
	        }

	        return up

	    }

	    // ----------------------

	    modes ( N = 1, id = -1 ) {

	        let i = this.lng, w, n, r = false;

	        while( i-- ){

	            n = N;
	            w = this.isSelectable ? this.values[ i ] === this.value : false;
	            
	            if( i === id ){
	                if( w && n === 2 ) n = 3; 
	            } else {
	                n = 1;
	                if( w ) n = 4;
	            }

	            //if( this.mode( n, i ) ) r = true
	            r = this.mode( n, i );

	        }

	        return r

	    }

	    mode ( n, id ) {

	        //if(!this.s) return false
	 
	        let change = false;
	        let cc = this.colors, s = this.s;
	        let i = id+2;

	        if( this.stat[id] !== n ){

	            this.stat[id] = n;
	        
	            switch( n ){

	                case 1: s[i].color = cc.text; s[i].background = cc.button; break
	                case 2: s[i].color = cc.textOver; s[i].background = cc.overoff; break
	                case 3: s[i].color = cc.textOver; s[i].background = cc.over; break
	                case 4: s[i].color = cc.textSelect; s[i].background = cc.select; break

	            }

	            change = true;

	        }

	        return change

	    }

	    // ----------------------

	    reset () {

	        this.res = -1;
	        this.cursor();
	        return this.modes()

	    }

	    label ( string, n ) {

	        n = n || 2;
	        this.c[n].textContent = string;

	    }

	    switchValues( n, string ){
	        this.c[n+2].innerHTML = this.values[n] = string;
	    }

	    icon ( string, y = 0, n = 2 ) {

	        //if(y) this.s[n].margin = ( y ) +'px 0px';
	        this.s[n].padding = ( y ) +'px 0px';
	        this.c[n].innerHTML = string;

	        return this

	    }

	    rSize () {

	        super.rSize();

	        let s = this.s;
	        let w = this.sb;
	        let d = this.sa;

	        let i = this.lng;
	        let sx = this.colors.sx; //this.space;
	        //let size = Math.floor( ( w-(dc*(i-1)) ) / i );
	        let size = ( w-(sx*(i-1)) ) / i; 

	        if( this.bw ){ 
	            size = this.bw < size ? this.bw : size;
	            //d = Math.floor((this.w-( (size * i) + (dc * (i-1)) ))*0.5)
	            d = ((this.w-( (size * i) + (sx * (i-1)) ))*0.5);
	        }

	        while( i-- ){

	        	//this.tmp[i] = [ Math.floor( d + ( size * i ) + ( dc * i )), size ];
	            this.tmp[i] = [ ( d + ( size * i ) + ( sx * i )), size ];
	        	this.tmp[i][2] = this.tmp[i][0] + this.tmp[i][1];

	            s[i+2].left = this.tmp[i][0] + 'px';
	            s[i+2].width = this.tmp[i][1] + 'px';

	        }

	    }

	}

	class Circular extends Proto {

	    constructor( o = {} ) {

	        super( o );

	        this.isCyclic = o.cyclic || false;
	        this.model = o.stype || 0;
	        if( o.mode !== undefined ) this.model = o.mode;

	        this.autoWidth = false;
	        this.minw = this.w;
	        this.diam = o.diam || this.w; 

	        this.setTypeNumber( o );

	        this.twoPi = Tools.TwoPI;
	        this.pi90 = Tools.pi90;

	        this.offset = new V2();

	        this.h = o.h || this.w + 10;

	        this.c[0].style.width = this.w +'px';
	        this.c[0].style.display = 'block';

	        if(this.c[1] !== undefined) {

	            this.c[1].style.width = '100%';
	            this.c[1].style.justifyContent = 'center';
	            this.top = 10;
	            this.h += 10;

	        }



	        this.percent = 0;
	        this.cmode = 0;
	        let cc = this.colors;

	        this.c[2] = this.dom( 'div', this.css.txt + 'justify-content:center; top:'+(this.h-20)+'px; width:100%; color:'+ cc.text );

	        // svg
	        
	        this.c[3] = this.getCircular();

	        this.setSvg( this.c[3], 'stroke', cc.back, 0 );
	        this.setSvg( this.c[3], 'd', this.makePath(), 1 );
	        this.setSvg( this.c[3], 'stroke', cc.text, 1 );

	        this.setSvg( this.c[3], 'viewBox', '0 0 '+this.diam+' '+this.diam );
	        this.setCss( this.c[3], { width:this.diam, height:this.diam, left:0, top:this.top });

	        this.init();
	        this.update();

	    }

	    mode ( mode ) {

	        if( this.cmode === mode ) return false;

	        let cc = this.colors;
	        let color;

	        switch( mode ){
	            case 0: // base

	                this.s[2].color = cc.text;
	                this.setSvg( this.c[3], 'stroke', cc.back, 0);
	                color = this.model > 0 ? Tools.pack( Tools.lerpColor( Tools.unpack( Tools.ColorLuma( cc.text, -0.75) ), Tools.unpack( cc.text ), this.percent ) ) : cc.text;
	                this.setSvg( this.c[3], 'stroke', color, 1 );
	                
	            break;
	            case 1: // down

	                this.s[2].color = cc.textOver;
	                this.setSvg( this.c[3], 'stroke', cc.backoff, 0);
	                color = this.model > 0 ? Tools.pack( Tools.lerpColor( Tools.unpack( Tools.ColorLuma( cc.text, -0.75) ), Tools.unpack( cc.text ), this.percent ) ) : cc.textOver;
	                this.setSvg( this.c[3], 'stroke', color, 1 );
	                
	            break;
	        }

	        this.cmode = mode;
	        return true;

	    }

	    reset () {

	        this.isDown = false;
	        
	    }

	    testZone ( e ) {

	        let l = this.local;
	        if( l.x === -1 && l.y === -1 ) return '';
	        
	        if( l.y <= this.c[ 1 ].offsetHeight ) return 'title';
	        else if ( l.y > this.h - this.c[ 2 ].offsetHeight ) return 'text';
	        else return 'circular';

	    }

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mouseup ( e ) {

	        this.isDown = false;
	        this.sendEnd();
	        return this.mode(0);

	    }

	    mousedown ( e ) {

	        this.isDown = true;
	        this.old = this.value;
	        this.oldr = null;
	        this.mousemove( e );
	        return this.mode(1);

	    }

	    mousemove ( e ) {

	        if( !this.isDown ) return;

	        //console.log('over')

	        let off = this.offset;
	        off.x = (this.w*0.5) - ( e.clientX - this.zone.x );
	        off.y = (this.diam*0.5) - ( e.clientY - this.zone.y - this.ytop );

	        this.r = off.angle() - this.pi90;
	        this.r = (((this.r%this.twoPi)+this.twoPi)%this.twoPi);

	        if( this.oldr !== null ){ 

	            let dif = this.r - this.oldr;
	            this.r = Math.abs(dif) > Math.PI ? this.oldr : this.r;

	            if( dif > 6 ) this.r = 0;
	            if( dif < -6 ) this.r = this.twoPi;

	        }

	        let steps = 1 / this.twoPi;
	        let value = this.r * steps;

	        let n = ( ( this.range * value ) + this.min ) - this.old;

	        if(n >= this.step || n <= this.step){ 
	            n = ~~ ( n / this.step );
	            this.value = this.numValue( this.old + ( n * this.step ) );
	            this.update( true );
	            this.old = this.value;
	            this.oldr = this.r;
	        }

	    }

	    wheel ( e ) {

	        let name = this.testZone( e );

	        if( name === 'circular' ) {
	    
	            let v = this.value - this.step * e.delta;
	    
	            if ( v > this.max ) {
	                v = this.isCyclic ? this.min : this.max;
	            } else if ( v < this.min ) {
	                v = this.isCyclic ? this.max : this.min;
	            }
	    
	            this.setValue( v );
	            this.old = v;
	            this.update( true );

	            return true;
	    
	        }
	        return false;

	    }

	    // ----------------------

	    makePath () {

	        let r = 40;
	        let d = 24;
	        let a = this.percent * this.twoPi - 0.001;
	        let x2 = (r + r * Math.sin(a)) + d;
	        let y2 = (r - r * Math.cos(a)) + d;
	        let big = a > Math.PI ? 1 : 0;
	        return "M " + (r+d) + "," + d + " A " + r + "," + r + " 0 " + big + " 1 " + x2 + "," + y2;

	    }

	    update ( up ) {

	        this.c[2].textContent = this.value;
	        this.percent = ( this.value - this.min ) / this.range;

	        this.setSvg( this.c[3], 'd', this.makePath(), 1 );

	        if ( this.model > 0 ) {

	            let cc = this.colors;
	            let color = Tools.pack( Tools.lerpColor( Tools.unpack( Tools.ColorLuma( cc.text, -0.75) ), Tools.unpack( cc.text ), this.percent ) );
	            this.setSvg( this.c[3], 'stroke', color, 1 );
	        
	        }

	        if( up ) this.send();
	        
	    }

	}

	class Color extends Proto {

	    constructor( o = {} ) {

	        super( o );

		    //this.autoHeight = true;

		    this.ctype = o.ctype || 'hex';

		    this.wfixe = 256;

		    this.cw = this.sb > 256 ? 256 : this.sb;
		    if(o.cw != undefined ) this.cw = o.cw;



		    // color up or down
		    this.side = o.side || 'down';
		    this.up = this.side === 'down' ? 0 : 1;
		    
		    this.baseH = this.h;

		    this.offset = new V2();
		    this.decal = new V2();
		    this.pp = new V2();

		    let cc = this.colors;

		   // this.c[2] = this.dom( 'div', this.css.txt + this.css.middle + 'top:1px; height:'+(this.h-2)+'px;' + 'border-radius:'+this.radius+'px; text-shadow:none; border:'+cc.borderSize+'px solid '+cc.border+';' )

		    this.c[2] = this.dom( 'div', `${this.css.txt} ${this.css.middle} top:1px; height:${this.h-2}px; border-radius:${this.radius}px; text-shadow:none; border:${cc.borderSize}px solid ${cc.border};` );
		    //this.s[2] = this.c[2].style;

		    //this.s[2].textShadow = 'none'

		    /*if( this.up ){
		        this.s[2].top = 'auto';
		        this.s[2].bottom = '2px';
		    }*/

		    //this.c[0].style.textAlign = 'center';
		    this.c[0].style.display = 'block';

		    this.c[3] = this.getColorRing();
		    this.c[3].style.visibility  = 'hidden';

		    this.hsl = null;
		    this.value = '#ffffff';
		    if( o.value !== undefined ){
		        if( o.value instanceof Array ) this.value = Tools.rgbToHex( o.value );
		        else if(!isNaN(o.value)) this.value = Tools.hexToHtml( o.value );
		        else this.value = o.value;
		    }

		    this.bcolor = null;
		    this.isDown = false;
		    this.fistDown = false;

		    this.notext = o.notext || false;

		    this.tr = 98;
		    this.tsl = Math.sqrt(3) * this.tr;

		    this.hue = 0;
		    this.d = 256;

		    this.init();

		    this.setColor( this.value );

		    if( o.open !== undefined ) this.open();

		}

		testZone ( mx, my ) {

			let l = this.local;
			if( l.x === -1 && l.y === -1 ) return ''

			if( this.up && this.isOpen ){

				if( l.y > this.wfixe ) return 'title'
			    else return 'color'

			} else {

				if( l.y < this.baseH+2 ) return 'title'
		    	else if( this.isOpen ) return 'color'

			}

	    }

		// ----------------------
	    //   EVENTS
	    // ----------------------

		mouseup ( e ) {

		    this.isDown = false;
		    this.d = 256;

		}

		mousedown ( e ) {


			let name = this.testZone( e.clientX, e.clientY );


			//if( !name ) return;
			if(name === 'title'){
				if( !this.isOpen ) this.open();
		        else this.close();
		        return true;
			}


			if( name === 'color' ){

				this.isDown = true;
				this.fistDown = true;
				this.mousemove( e );
			}
		}

		mousemove ( e ) {

		    let name = this.testZone( e.clientX, e.clientY );

		    let off, d, hue, sat, lum, rad, x, y, rr, T = Tools;

		    if( name === 'title' ) this.cursor('pointer');

		    if( name === 'color' ){

		    	off = this.offset;
			    off.x = e.clientX - ( this.zone.x + this.decal.x + this.mid );
			    off.y = e.clientY - ( this.zone.y + this.decal.y + this.mid ) - this.ytop;
				d = off.length() * this.ratio;
				rr = off.angle();
				if(rr < 0) rr += 2 * T.PI;
							

		    	if ( d < 128 ) this.cursor('crosshair');
		    	else if( !this.isDown ) this.cursor();

		    	if( this.isDown ){

				    if( this.fistDown ){
				    	this.d = d;
				    	this.fistDown = false;
				    }

				    if ( this.d < 128 ) {

					    if ( this.d > this.tr ) { // outside hue

					        hue = ( rr + T.pi90 ) / T.TwoPI;
					        this.hue = (hue + 1) % 1;
					        this.setHSL([(hue + 1) % 1, this.hsl[1], this.hsl[2]]);

					    } else { // triangle

					    	x = off.x * this.ratio;
					    	y = off.y * this.ratio;

					    	let rr = (this.hue * T.TwoPI) + T.PI;
					    	if(rr < 0) rr += 2 * T.PI;

					    	rad = Math.atan2(-y, x);
					    	if(rad < 0) rad += 2 * T.PI;
							
					    	let rad0 = ( rad + T.pi90 + T.TwoPI + rr ) % (T.TwoPI),
					    	rad1 = rad0 % ((2/3) * T.PI) - (T.pi60),
					    	a    = 0.5 * this.tr,
					    	b    = Math.tan(rad1) * a,
					    	r    = Math.sqrt(x*x + y*y),
					    	maxR = Math.sqrt(a*a + b*b);

					    	if( r > maxR ) {
								let dx = Math.tan(rad1) * r;
								let rad2 = Math.atan(dx / maxR);
								if(rad2 > T.pi60)  rad2 = T.pi60;
							    else if( rad2 < -T.pi60 ) rad2 = -T.pi60;
							
								rad += rad2 - rad1;

								rad0 = (rad + T.pi90  + T.TwoPI + rr) % (T.TwoPI),
								rad1 = rad0 % ((2/3) * T.PI) - (T.pi60);
								b = Math.tan(rad1) * a;
								r = maxR = Math.sqrt(a*a + b*b);
							}

							lum = ((Math.sin(rad0) * r) / this.tsl) + 0.5;
					
							let w = 1 - (Math.abs(lum - 0.5) * 2);
							sat = (((Math.cos(rad0) * r) + (this.tr / 2)) / (1.5 * this.tr)) / w;
							sat = T.clamp( sat, 0, 1 );
							
					        this.setHSL([this.hsl[0], sat, lum]);

					    }
					}
				}
			}

		}

		// ----------------------

		setHeight () {

			this.h = this.isOpen ? this.wfixe + this.baseH + 5 : this.baseH;
			this.s[0].height = this.h + 'px';
			this.zone.h = this.h;

		}

		parentHeight ( t ) {

			if ( this.group !== null ) this.group.calc( t );
		    else if ( this.isUI ) this.main.calc( t );

		}

		open () {

			super.open();

			this.setHeight();

			if( this.up ) this.zone.y -= this.wfixe + 5;

			let t = this.h - this.baseH;

		    this.s[3].visibility = 'visible';
		    //this.s[3].display = 'block';
		    this.parentHeight( t );

		}

		close () {

			super.close();

			if( this.up ) this.zone.y += this.wfixe + 5;

			let t = this.h - this.baseH;

			this.setHeight();

		    this.s[3].visibility  = 'hidden';
		    //this.s[3].display = 'none';
		    this.parentHeight( -t );

		}

		update ( up ) {

		    let cc = Tools.rgbToHex( Tools.hslToRgb([ this.hsl[0], 1, 0.5 ]) );

		    this.moveMarkers();
		    
		    this.value = this.bcolor;

		    this.setSvg( this.c[3], 'fill', cc, 2, 0 );

		    this.s[2].background = this.bcolor;
		    if(!this.notext) this.c[2].textContent = Tools.htmlToHex( this.bcolor );

		    this.invert = Tools.findDeepInver( this.rgb );
		    this.s[2].color = this.invert ? '#fff' : '#000';

		    if(!up) return;

		    if( this.ctype === 'array' ) this.send( this.rgb );
		    if( this.ctype === 'rgb' ) this.send( Tools.htmlRgb( this.rgb ) );
		    if( this.ctype === 'hex' ) this.send( Tools.htmlToHex( this.value ) );
		    if( this.ctype === 'html' ) this.send();

		}

		setValue ( v ){

			if( v instanceof Array ) this.value = Tools.rgbToHex( v );
	        else if(!isNaN(v)) this.value = Tools.hexToHtml( v );
	        else this.value = v;

			this.setColor( this.value );
	        this.update();

		}

		setColor ( color ) {

		    let unpack = Tools.unpack(color);
		    if (this.bcolor !== color && unpack) {

		        this.bcolor = color;
		        this.rgb = unpack;
		        this.hsl = Tools.rgbToHsl( this.rgb );

		        this.hue = this.hsl[0];

		        this.update();
		    }
		    return this;

		}

		setHSL ( hsl ) {

		    this.hsl = hsl;
		    this.rgb = Tools.hslToRgb( hsl );
		    this.bcolor = Tools.rgbToHex( this.rgb );
		    this.update( true );
		    return this;

		}

		moveMarkers () {

			let p = this.pp;
			let T = Tools;

		    this.invert ? '#fff' : '#000';
		    let a = this.hsl[0] * T.TwoPI;
		    let third = (2/3) * T.PI;
		    let r = this.tr;
		    let h = this.hsl[0];
		    let s = this.hsl[1];
		    let l = this.hsl[2];

		    let angle = ( a - T.pi90 ) * T.todeg;

		    h = - a + T.pi90;

			let hx = Math.cos(h) * r;
			let hy = -Math.sin(h) * r;
			let sx = Math.cos(h - third) * r;
			let sy = -Math.sin(h - third) * r;
			let vx = Math.cos(h + third) * r;
			let vy = -Math.sin(h + third) * r;
			let mx = (sx + vx) / 2, my = (sy + vy) / 2;
			a  = (1 - 2 * Math.abs(l - .5)) * s;
			let x = sx + (vx - sx) * l + (hx - mx) * a;
			let y = sy + (vy - sy) * l + (hy - my) * a;

		    p.set( x, y ).addScalar(128);

		    //let ff = (1-l)*255;
		    // this.setSvg( this.c[3], 'stroke', 'rgb('+ff+','+ff+','+ff+')', 3 );

		    this.setSvg( this.c[3], 'transform', 'rotate('+angle+' )', 2 );

		    this.setSvg( this.c[3], 'cx', p.x, 3 );
		    this.setSvg( this.c[3], 'cy', p.y, 3 );
		    
		    this.setSvg( this.c[3], 'stroke', this.invert ? '#fff' : '#000', 2, 3 );
		    this.setSvg( this.c[3], 'stroke', this.invert ? '#fff' : '#000', 3 );
		    this.setSvg( this.c[3], 'fill',this.bcolor, 3 );

		}

		rSize () {

		    //Proto.prototype.rSize.call( this );
		    super.rSize();

		    let s = this.s;

		    s[2].width = this.sb + 'px';
		    s[2].left = this.sa + 'px';

		    //console.log(this.sb)

		    this.cw = this.sb > 256 ? 256 : this.sb;



		    this.rSizeColor( this.cw );

		    this.decal.x = Math.floor((this.w - this.wfixe) * 0.5);
		    //s[3].left = this.decal.x + 'px';
		    
		}

		rSizeColor ( w ) {


			if( w === this.wfixe ) return;



			this.wfixe = w;



			let s = this.s;

			//this.decal.x = Math.floor((this.w - this.wfixe) * 0.5);
		    this.decal.y = this.side === 'up' ? 2 : this.baseH + 2;
		    this.mid = Math.floor( this.wfixe * 0.5 );

		    this.setSvg( this.c[3], 'viewBox', '0 0 '+ this.wfixe + ' '+ this.wfixe );
		    s[3].width = this.wfixe + 'px';
		    s[3].height = this.wfixe + 'px';
	    	//s[3].left = this.decal.x + 'px';
		    s[3].top = this.decal.y + 'px';

		    this.ratio = 256 / this.wfixe;
		    this.square = 1 / (60*(this.wfixe/256));
		    this.setHeight();

		}


	}

	class Fps extends Proto {

	    constructor( o = {} ) {

	        super( o );

	        this.round = Math.round;

	        //this.autoHeight = true;

	        this.baseH = this.h;
	        this.hplus = o.hplus || 50;

	        this.res = o.res || 40;
	        this.l = 1;

	        this.precision = o.precision || 0;
	        

	        this.custom = o.custom || false;
	        this.names = o.names || ['FPS', 'MS'];
	        let cc = o.cc || ['220,220,220', '255,255,0'];

	       // this.divid = [ 100, 100, 100 ];
	       // this.multy = [ 30, 30, 30 ];

	        this.adding = o.adding || false;

	        this.range = o.range || [ 165, 100, 100 ];

	        this.alpha = o.alpha || 0.25;

	        this.values = [];
	        this.points = [];
	        this.textDisplay = [];

	        if(!this.custom){

	            this.now = Roots.getTime();
	            this.startTime = 0;//this.now()
	            this.prevTime = 0;//this.startTime;
	            this.frames = 0;

	            this.ms = 0;
	            this.fps = 0;
	            this.mem = 0;
	            this.mm = 0;

	            this.isMem = ( self.performance && self.performance.memory ) ? true : false;

	           // this.divid = [ 100, 200, 1 ];
	           // this.multy = [ 30, 30, 30 ];

	            if( this.isMem ){

	                this.names.push('MEM');
	                cc.push('0,255,255');

	            }

	            this.txt = o.name || 'Fps';

	        }


	        let fltop = Math.floor(this.h*0.5)-3;
	        const ccc = this.colors;

	        this.c[1].textContent = this.txt;
	        //this.c[1].innerHTML = '&#160;' + this.txt
	        this.c[0].style.cursor = 'pointer';
	        this.c[0].style.pointerEvents = 'auto';

	        let panelCss = 'display:none; left:10px; top:'+ this.h + 'px; height:'+(this.hplus - 8)+'px; box-sizing:border-box; background: rgba(0, 0, 0, 0.2); border:1px solid '+ ccc.border +';';

	        if( this.radius !== 0 ) panelCss += 'border-radius:' + this.radius+'px;'; 

	        this.c[2] = this.dom( 'path', this.css.basic + panelCss , {} );

	        this.c[2].setAttribute('viewBox', '0 0 '+this.res+' 50' );
	        this.c[2].setAttribute('height', '100%' );
	        this.c[2].setAttribute('width', '100%' );
	        this.c[2].setAttribute('preserveAspectRatio', 'none' );


	        //this.dom( 'path', null, { fill:'rgba(255,255,0,0.3)', 'stroke-width':1, stroke:'#FF0', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
	        //this.dom( 'path', null, { fill:'rgba(0,255,255,0.3)', 'stroke-width':1, stroke:'#0FF', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
	        
	        // arrow
	        this.c[3] = this.dom( 'path', this.css.basic + 'position:absolute; width:6px; height:6px; left:0; top:'+fltop+'px;', { d:this.svgs.g1, fill:ccc.text, stroke:'none'});
	        //this.c[3] = this.dom( 'path', this.css.basic + 'position:absolute; width:10px; height:10px; left:4px; top:'+fltop+'px;', { d:this.svgs.arrow, fill:this.colors.text, stroke:'none'});

	        // result test
	        this.c[4] = this.dom( 'div', this.css.txt + 'position:absolute; left:10px; top:'+(this.h+2) +'px; display:none; width:100%; text-align:center;' );

	        // bottom line
	        if( o.bottomLine ) this.c[4] = this.dom( 'div', this.css.basic + 'width:100%; bottom:0px; height:1px; background: rgba(255, 255, 255, 0.2);');

	        this.isShow = false;



	        let s = this.s;

	        //s[1].marginLeft = '10px';
	        s[1].lineHeight = this.h-4;
	        s[1].color = ccc.text;
	        //s[1].paddingLeft = '18px';
	        //s[1].fontWeight = 'bold';

	        if( this.radius !== 0 )  s[0].borderRadius = this.radius+'px';
	        if( this.colors.gborder!=='none') s[0].border = '1px solid ' + ccc.gborder;




	        let j = 0;

	        for( j=0; j<this.names.length; j++ ){

	            let base = [];
	            let i = this.res+1;
	            while( i-- ) base.push(50);

	            this.range[j] = ( 1 / this.range[j] ) * 49;
	            
	            this.points.push( base );
	            this.values.push(0);
	           //  this.dom( 'path', null, { fill:'rgba('+cc[j]+',0.5)', 'stroke-width':1, stroke:'rgba('+cc[j]+',1)', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
	            this.textDisplay.push( "<span style='color:rgb("+cc[j]+")'> " + this.names[j] +" ");

	        }

	        j = this.names.length;
	        while(j--){
	            this.dom( 'path', null, { fill:'rgba('+cc[j]+','+this.alpha+')', 'stroke-width':1, stroke:'rgba('+cc[j]+',1)', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
	        }


	        this.init();

	        //if( this.isShow ) this.show();

	    }

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mousedown ( e ) {

	        if( this.isShow ) this.close();
	        else this.open();

	    }

	    // ----------------------

	    /*mode: function ( mode ) {

	        let s = this.s;

	        switch(mode){
	            case 0: // base
	                s[1].color = this.colors.text;
	                //s[1].background = 'none';
	            break;
	            case 1: // over
	                s[1].color = '#FFF';
	                //s[1].background = UIL.SELECT;
	            break;
	            case 2: // edit / down
	                s[1].color = this.colors.text;
	                //s[1].background = UIL.SELECTDOWN;
	            break;

	        }
	    },*/

	    tick ( v ) {

	        this.values = v;
	        if( !this.isShow ) return;
	        this.drawGraph();
	        this.upText();

	    }

	    makePath ( point ) {

	        let p = '';
	        p += 'M ' + (-1) + ' ' + 50;
	        for ( let i = 0; i < this.res + 1; i ++ ) { p += ' L ' + i + ' ' + point[i]; }
	        p += ' L ' + (this.res + 1) + ' ' + 50;
	        return p;

	    }

	    upText ( val ) {

	        let v = val || this.values, t = '';
	        for( let j=0, lng =this.names.length; j<lng; j++ ) t += this.textDisplay[j] + (v[j]).toFixed(this.precision) + '</span>';
	        this.c[4].innerHTML = t;
	    
	    }

	    drawGraph () {

	        let svg = this.c[2];
	        let i = this.names.length, v, old = 0, n = 0;

	        while( i-- ){
	            if( this.adding ) v = (this.values[n]+old) * this.range[n];
	            else  v = (this.values[n] * this.range[n]);
	            this.points[n].shift();
	            this.points[n].push( 50 - v );
	            this.setSvg( svg, 'd', this.makePath( this.points[n] ), i+1 );
	            old += this.values[n];
	            n++;

	        }

	    }

	    open () {

	        super.open();

	        this.h = this.hplus + this.baseH;

	        this.setSvg( this.c[3], 'd', this.svgs.g2 );

	        if( this.group !== null ){ this.group.calc( this.hplus );}
	        else if( this.isUI ) this.main.calc( this.hplus );

	        this.s[0].height = this.h +'px';
	        this.s[2].display = 'block'; 
	        this.s[4].display = 'block';
	        this.isShow = true;

	        if( !this.custom ) Roots.addListen( this );

	    }

	    close () {

	        super.close();

	        this.h = this.baseH;

	        this.setSvg( this.c[3], 'd', this.svgs.g1 );

	        if( this.group !== null ){ this.group.calc( -this.hplus );}
	        else if( this.isUI ) this.main.calc( -this.hplus );
	        
	        this.s[0].height = this.h +'px';
	        this.s[2].display = 'none';
	        this.s[4].display = 'none';
	        this.isShow = false;

	        if( !this.custom ) Roots.removeListen( this );

	        this.c[4].innerHTML = '';
	        
	    }


	    ///// AUTO FPS //////

	    begin () {

	        this.startTime = this.now();
	        
	    }

	    end () {

	        let time = this.now();
	        this.ms = time - this.startTime;

	        this.frames ++;

	        if ( time > this.prevTime + 1000 ) {

	            this.fps = this.round( ( this.frames * 1000 ) / ( time - this.prevTime ) );

	            this.prevTime = time;
	            this.frames = 0;

	            if ( this.isMem ) {

	                let heapSize = performance.memory.usedJSHeapSize;
	                let heapSizeLimit = performance.memory.jsHeapSizeLimit;

	                this.mem = this.round( heapSize * 0.000000954 );
	                this.mm = heapSize / heapSizeLimit;

	            }

	        }

	        this.values = [ this.fps, this.ms , this.mm ];

	        this.drawGraph();
	        this.upText( [ this.fps, this.ms, this.mem ] );

	        return time;

	    }

	    listening () {

	        if( !this.custom ) this.startTime = this.end();
	        
	    }

	    rSize () {

	        let s = this.s;
	        let w = this.w;

	        s[3].left = ( this.sa + this.sb - 6 ) + 'px';

	        s[0].width = w + 'px';
	        s[1].width = w + 'px';
	        s[2].left = 10 + 'px';
	        s[2].width = (w-20) + 'px';
	        s[4].width = (w-20) + 'px';
	        
	    }
	    
	}

	class Graph extends Proto {

	    constructor( o = {} ) {

	        super( o );

	    	this.value = o.value !== undefined ? o.value : [0,0,0];
	        this.lng = this.value.length;

	        this.precision = o.precision !== undefined ? o.precision : 2;
	        this.multiplicator = o.multiplicator || 1;
	        this.neg = o.neg || false;

	        this.line = o.line !== undefined ?  o.line : true;

	        //if(this.neg)this.multiplicator*=2;

	        this.autoWidth = o.autoWidth !== undefined ? o.autoWidth : true;
	        this.isNumber = false;

	        this.isDown = false;

	        this.h = o.h || 128 + 10;
	        this.rh = this.h - 10;
	        this.top = 0;

	        this.c[0].style.width = this.w +'px';

	        if( this.c[1] !== undefined ) { // with title

	            this.c[1].style.width = this.w +'px';

	            if(!this.autoWidth){
	                this.c[1].style.width = '100%';
	                this.c[1].style.justifyContent = 'center';
	            }
	            
	            
	            //this.c[1].style.background = '#ff0000';
	            //this.c[1].style.textAlign = 'center';
	            this.top = 10;
	            this.h += 10;

	        }

	        this.gh = this.rh - 28;
	        this.gw = this.w - 28;

	        //this.c[2] = this.dom( 'div', this.css.txt + 'justify-content:center; text-align: justify; column-count:'+this.lng+'; top:'+(this.h-20)+'px; width:100%; color:'+ this.colors.text );

	        //let colum = 'column-count:'+this.lng+'; column:'+this.lng+'; break-inside: column; top:'
	        this.c[2] = this.dom( 'div', this.css.txt + 'display:block; text-align:center; padding:0px 0px; top:'+(this.h-20)+'px; left:14px; width:'+this.gw+'px;  color:'+ this.colors.text );
	       
	        //this.c[2].textContent = this.value;
	        this.c[2].innerHTML = this.valueToHtml();

	        let svg = this.dom( 'svg', this.css.basic , { viewBox:'0 0 '+this.w+' '+this.rh, width:this.w, height:this.rh, preserveAspectRatio:'none' } );
	        this.setCss( svg, { width:this.w, height:this.rh, left:0, top:this.top });

	        this.dom( 'path', '', { d:'', stroke:this.colors.text, 'stroke-width':2, fill:'none', 'stroke-linecap':'butt' }, svg );
	        this.dom( 'rect', '', { x:10, y:10, width:this.gw+8, height:this.gh+8, stroke:'rgba(0,0,0,0.3)', 'stroke-width':1 , fill:'none'}, svg );

	        this.iw = ((this.gw-(4*(this.lng-1)))/this.lng);
	        let t = [];
	        this.cMode = [];

	        this.v = [];

	        for( let i = 0; i < this.lng; i++ ){

	        	t[i] = [ 14 + (i*this.iw) + (i*4), this.iw ];
	        	t[i][2] = t[i][0] + t[i][1];
	        	this.cMode[i] = 0;

	            if( this.neg ) this.v[i] = ((1+(this.value[i] / this.multiplicator))*0.5);
	        	else this.v[i] = this.value[i] / this.multiplicator;

	        	this.dom( 'rect', '', { x:t[i][0], y:14, width:t[i][1], height:1, fill:this.colors.text, 'fill-opacity':0.3 }, svg );

	        }

	        this.tmp = t;
	        this.c[3] = svg;

	        //console.log(this.w)

	        this.init();

	        if( this.c[1] !== undefined ){
	            this.c[1].style.top = 0 +'px';
	            this.c[1].style.height = 20 +'px';
	            this.s[1].lineHeight = (20-5)+'px';
	        }

	        this.update( false );

	    }

	    setValue ( value ) {

	        this.value = value;
	        this.lng = this.value.length;
	        for (var i = 0; i < this.lng; i++) {
	            if (this.neg) this.v[i] = (1 + value[i] / this.multiplicator) * 0.5;
	            else this.v[i] = value[i] / this.multiplicator;
	        }
	        this.update();

	    }

	    valueToHtml() {

	        let i = this.lng, n=0, r = '<table style="width:100%;"><tr>';
	        let w = 100 / this.lng;
	        let style = 'width:'+ w +'%;';//' text-align:center;'
	        while(i--){
	            if(n===this.lng-1) r += '<td style='+style+'>' + this.value[n] + '</td></tr></table>';
	            else r += '<td style='+style+'>' + this.value[n] + '</td>';
	            n++;
	        }
	        return r
	    }

	    updateSVG () {

	        if( this.line ) this.setSvg( this.c[3], 'd', this.makePath(), 0 );

	        for(let i = 0; i<this.lng; i++ ){

	            this.setSvg( this.c[3], 'height', this.v[i]*this.gh, i+2 );
	            this.setSvg( this.c[3], 'y', 14 + (this.gh - this.v[i]*this.gh), i+2 );
	            if( this.neg ) this.value[i] = ( ((this.v[i]*2)-1) * this.multiplicator ).toFixed( this.precision ) * 1;
	            else this.value[i] = ( (this.v[i] * this.multiplicator) ).toFixed( this.precision ) * 1;

	        }

	        //this.c[2].textContent = this.value;
	        this.c[2].innerHTML = this.valueToHtml();

	    }

	    testZone ( e ) {

	        let l = this.local;
	        if( l.x === -1 && l.y === -1 ) return '';

	        let i = this.lng;
	        let t = this.tmp;
	        
		    if( l.y>this.top && l.y<this.h-20 ){
		        while( i-- ){
		            if( l.x>t[i][0] && l.x<t[i][2] ) return i;
		        }
		    }

	        return ''

	    }

	    mode ( n, name ) {

	    	if( n === this.cMode[name] ) return false;

	    	let a;

	        switch(n){
	            case 0: a=0.3; break;
	            case 1: a=0.6; break;
	            case 2: a=1; break;
	        }

	        this.reset();

	        this.setSvg( this.c[3], 'fill-opacity', a, name + 2 );
	        this.cMode[name] = n;

	        return true;



	    }

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    reset () {

	    	let nup = false;
	        //this.isDown = false;

	        let i = this.lng;
	        while(i--){ 
	            if( this.cMode[i] !== 0 ){
	                this.cMode[i] = 0;
	                this.setSvg( this.c[3], 'fill-opacity', 0.3, i + 2 );
	                nup = true;
	            }
	        }

	        return nup;

	    }

	    mouseup ( e ) {

	        this.isDown = false;
	        if( this.current !== -1 ) return this.reset();
	        
	    }

	    mousedown ( e ) {

	    	this.isDown = true;
	        return this.mousemove( e );

	    }

	    mousemove ( e ) {

	    	let nup = false;

	    	let name = this.testZone(e);

	    	if( name === '' ){

	            nup = this.reset();
	            //this.cursor();

	        } else { 

	            nup = this.mode( this.isDown ? 2 : 1, name );
	            //this.cursor( this.current !== -1 ? 'move' : 'pointer' );
	            if(this.isDown){
	            	this.v[name] = this.clamp( 1 - (( e.clientY - this.zone.y - this.ytop - 10 ) / this.gh) , 0, 1 );
	            	this.update( true );
	            }

	        }

	        return nup;

	    }

	    // ----------------------

	    update ( up ) {

	    	this.updateSVG();

	        if( up ) this.send();

	    }

	    makePath () {

	    	let p = "", h, w, wn, wm, ow, oh;
	    	//let g = this.iw*0.5

	    	for(let i = 0; i<this.lng; i++ ){

	    		h = 14 + (this.gh - this.v[i]*this.gh);
	    		w = (14 + (i*this.iw) + (i*4));

	    		wm = w + this.iw*0.5;
	    		wn = w + this.iw;

	    		if( i === 0 ) p+='M '+w+' '+ h + ' T ' + wm +' '+ h;
	    		else p += ' C ' + ow +' '+ oh + ',' + w +' '+ h + ',' + wm +' '+ h;
	    		if( i === this.lng-1 ) p+=' T ' + wn +' '+ h;

	    		ow = wn;
	    		oh = h; 

	    	}

	    	return p

	    }

	    rSize () {

	        super.rSize();

	        let s = this.s;
	        if( this.c[1] !== undefined ) s[1].width = this.w + 'px';
	        s[3].width = this.w + 'px';

	        let gw = this.w - 28;
	        let iw = ((gw-(4*(this.lng-1)))/this.lng);
	        let t = [];

	        s[2].width = gw + 'px';

	        for( let i = 0; i < this.lng; i++ ){

	            t[i] = [ 14 + (i*iw) + (i*4), iw ];
	            t[i][2] = t[i][0] + t[i][1];

	        }

	        this.tmp = t;

	    }

	}

	class Empty extends Proto {

	    constructor( o = {} ) {

		    o.isSpace = true;
	        o.margin = 0;
	        if(!o.h) o.h = 10;
	        super( o );
	        this.init();

	    }
	    
	}

	class Group extends Proto {

	    constructor( o = {} ) {

	        super( o );

	        this.isGroup = true;

	        this.ADD = o.add;

	        this.autoHeight = true;

	        this.uis = [];
	        this.current = -1;
	        this.proto = null;
	        this.isEmpty = true;

	        this.decal = o.group ? 8 : 0;
	        //this.dd = o.group ? o.group.decal + 8 : 0

	        this.baseH = this.h;

	        this.spaceY = new Empty({h:this.margin});



	        let fltop = Math.floor(this.h*0.5)-3;

	        const cc = this.colors;

	        this.useFlex = true; 
	        let flexible = this.useFlex ? 'display:flex; flex-flow: row wrap;' : '';

	        this.c[2] = this.dom( 'div', this.css.basic + flexible + 'width:100%; left:0;  overflow:hidden; top:'+(this.h)+'px');
	        this.c[3] = this.dom( 'path', this.css.basic + 'position:absolute; width:6px; height:6px; left:0; top:'+fltop+'px;', { d:this.svgs.g1, fill:cc.text, stroke:'none'});

	        let bh = this.mtop === 0 ? this.margin : this.mtop;
	        
	        this.c[4] = this.dom( 'div', this.css.basic + 'width:100%; left:0; height:'+(bh+1)+'px; top:'+((this.h-1))+'px; background:none;');

	        this.s;
	        this.c[1].name = 'group';

	        this.init();

	        this.setBG( o.bg );

	        if( o.open ) this.open();

	    }

	    setBG ( bg ) {

	        const cc = this.colors;
	        const s = this.s;

	        if( bg !== undefined ) cc.groups = bg;
	        if(cc.groups === 'none') cc.groups = cc.background;
	            cc.background = 'none';

	        s[0].background = 'none';
	        s[1].background = cc.groups;
	        s[2].background = cc.groups;

	        if( cc.gborder !== 'none' ){
	            s[1].border = cc.borderSize+'px solid '+ cc.gborder;
	        }

	        if( this.radius !== 0 ){

	            s[1].borderRadius = this.radius+'px';
	            s[2].borderRadius = this.radius+'px';

	        }

	        /*let i = this.uis.length;
	        while(i--){
	            this.uis[i].setBG( 'none' );
	            //this.uis[i].setBG( this.colors.background );
	        }*/

	    }

	    testZone ( e ) {

	        let l = this.local;
	        if( l.x === -1 && l.y === -1 ) return '';

	        let name = '';

	        if( l.y < this.baseH + this.margin ) name = 'title';
	        else {
	            if( this.isOpen ) name = 'content';
	        }

	        //console.log(name)

	        return name;

	    }

	    clearTarget () {

	        if( this.current === -1 ) return false;
	        if( this.proto.s ){
	            // if no s target is delete !!
	            this.proto.uiout();
	            this.proto.reset();
	        }
	        this.proto = null;
	        this.current = -1;
	        this.cursor();
	        return true;

	    }

	    reset () {

	        this.clearTarget();

	    }

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    handleEvent ( e ) {

	        let type = e.type;

	        let change = false;
	        let protoChange = false;

	        let name = this.testZone( e );

	        if( !name ) return;

	        switch( name ){

	            case 'content':

	            //this.cursor()

	            //if( this.marginDiv ) e.clientY -= this.margin * 0.5

	            if( Roots.isMobile && type === 'mousedown' ) this.getNext( e, change );

	            if( this.proto ){ 
	                //e.clientY -= this.margin
	                protoChange = this.proto.handleEvent( e );
	            }

	            if( !Roots.lock ) this.getNext( e, change );

	            break;
	            case 'title':
	            //this.cursor( this.isOpen ? 'n-resize':'s-resize' );
	            this.cursor('pointer');
	            if( type === 'mousedown' ){
	                if( this.isOpen ) this.close();
	                else this.open();
	            }
	            break;


	        }

	        if( this.isDown ) change = true;
	        if( protoChange ) change = true;

	        return change;

	    }

	    getNext ( e, change ) {

	        let next = Roots.findTarget( this.uis, e );

	        if( next !== this.current ){
	            this.clearTarget();
	            this.current = next;
	        }

	        if( next !== -1 ){ 
	            this.proto  = this.uis[ this.current ];
	            this.proto.uiover();
	        }

	    }

	    // ----------------------

	    

	    add() {

	        let a = arguments;

	        if( typeof a[1] === 'object' ){ 
	            a[1].isUI = this.isUI;
	            a[1].target = this.c[2];
	            a[1].main = this.main;
	            a[1].group = this;
	        } else if( typeof arguments[1] === 'string' ){
	            if( a[2] === undefined ) [].push.call( a, { isUI:true, target:this.c[2], main:this.main });
	            else { 
	                a[2].isUI = true;
	                a[2].target = this.c[2];
	                a[2].main = this.main;
	                a[2].group = this;
	            }
	        }

	        let u = this.ADD.apply( this, a );

	        if( u.isGroup ){ 
	            //o.add = add;
	            u.dx = 8;
	        }
	        
	        //u.dx += 4
	        //console.log(this.decal)
	        //u.zone.d -= 8
	        Roots.forceZone = true;
	        //u.margin += this.margin

	        //console.log( u.margin )
	        //Roots.needReZone = true

	        //Roots.resize()
	         //console.log(Roots.needResize)

	        this.uis.push( u );

	        this.isEmpty = false;

	        return u;

	    }

	    // remove one node

	    remove ( n ) {

	        if( n.dispose ) n.dispose();

	    }

	    // clear all iner 

	    dispose() {

	        this.clear();
	        if( this.isUI ) this.main.calc();
	        super.dispose();

	    }

	    clear() {

	        this.empty();

	    }

	    empty () {

	        this.close();

	        let i = this.uis.length, item;

	        while( i-- ){
	            item = this.uis.pop();
	            this.c[2].removeChild( item.c[0] );
	            item.clear( true );

	            //this.uis[i].clear()
	        }

	        this.isEmpty = true;
	        this.h = this.baseH;

	    }

	    // clear one element

	    clearOne ( n ) { 

	        let id = this.uis.indexOf( n );

	        if ( id !== -1 ) {
	            this.calc( - ( this.uis[ id ].h + this.margin ) );
	            this.c[2].removeChild( this.uis[ id ].c[0] );
	            this.uis.splice( id, 1 );

	            if( this.uis.length === 0 ){ 
	                this.isEmpty = true;
	                this.close();
	            }
	        }

	    }

	    

	    open () {

	        super.open();

	        this.setSvg( this.c[3], 'd', this.svgs.g2 );
	        this.rSizeContent();

	        //let t = this.h - this.baseH

	        const s = this.s;
	        const cc = this.colors;

	        //s[2].top = (this.h-1) + 'px'
	        s[2].top = (this.h+this.mtop) + 'px';
	        s[4].background = cc.groups;//'#0f0'

	        if(this.radius){

	            s[1].borderRadius = '0px';
	            s[2].borderRadius = '0px';

	            s[1].borderTopLeftRadius = this.radius+'px';
	            s[1].borderTopRightRadius = this.radius+'px';
	            s[2].borderBottomLeftRadius = this.radius+'px';
	            s[2].borderBottomRightRadius = this.radius+'px';
	        }

	        if( cc.gborder !== 'none' ){

	            s[4].borderLeft = cc.borderSize+'px solid '+ cc.gborder;
	            s[4].borderRight = cc.borderSize+'px solid '+ cc.gborder;

	            s[2].border = cc.borderSize+'px solid '+ cc.gborder;
	            s[2].borderTop = 'none';
	            s[1].borderBottom = cc.borderSize+'px solid rgba(0,0,0,0)';

	        }
	        
	        this.parentHeight();

	        //Roots.isLeave = true
	        //Roots.needResize = true

	    }

	    close () {

	        super.close();

	        //let t = this.h - this.baseH

	        this.setSvg( this.c[3], 'd', this.svgs.g1 );

	        this.h = this.baseH;

	        const s = this.s;
	        const cc = this.colors;
	        
	        s[0].height = this.h + 'px';
	        //s[1].height = (this.h-2) + 'px'
	        //s[2].top = this.h + 'px'
	        s[2].top = (this.h+this.mtop) + 'px';
	        s[4].background = 'none';

	        if( cc.gborder !== 'none' ){

	            s[4].border = 'none';
	            s[2].border = 'none';
	            s[1].border = cc.borderSize+'px solid '+ cc.gborder;
	        }

	        if(this.radius) s[1].borderRadius = this.radius+'px';

	        this.parentHeight();

	    }

	    calcUis () {

	        if( !this.isOpen || this.isEmpty ) this.h = this.baseH;
	        //else this.h = Roots.calcUis( this.uis, this.zone, this.zone.y + this.baseH ) + this.baseH;
	        else this.h = Roots.calcUis( [...this.uis, this.spaceY ], this.zone, this.zone.y + this.baseH + this.margin, true ) + this.baseH;

	        this.s[0].height = this.h + 'px';
	        this.s[2].height =( this.h - this.baseH )+ 'px';

	    }

	    parentHeight ( t ) {

	        if ( this.group !== null ) this.group.calc( t );
	        else if ( this.isUI ) this.main.calc( t );

	    }

	    calc ( y ) {

	        if( !this.isOpen ) return
	        if( this.isUI ) this.main.calc();
	        else this.calcUis();
	        this.s[0].height = this.h + 'px';
	        this.s[2].height = this.h + 'px';

	    }

	    rSizeContent () {

	        let i = this.uis.length;
	        while(i--){
	            this.uis[i].setSize( this.w );
	            this.uis[i].rSize();
	        }

	    }

	    rSize () {

	        super.rSize();

	        let s = this.s;

	        this.w = this.w - this.decal;

	        s[3].left = ( this.sa + this.sb - 6 ) + 'px';

	        s[1].width = this.w + 'px';
	        s[2].width = this.w + 'px';
	        s[1].left = (this.decal) + 'px';
	        s[2].left = (this.decal) + 'px';

	        if( this.isOpen ) this.rSizeContent();

	    }

	    //
	/*
	    uiout() {

	        if( this.lock ) return;
	        if(!this.overEffect) return;
	        if(this.s) this.s[0].background = this.colors.background;

	    }

	    uiover() {

	        if( this.lock ) return;
	        if(!this.overEffect) return;
	        //if( this.isOpen ) return;
	        if(this.s) this.s[0].background = this.colors.backgroundOver;

	    }
	*/
	}

	class Joystick extends Proto {

	    constructor( o = {} ) {

	        super( o );

	        this.autoWidth = false;

	        this.value = [0,0];

	        this.minw  = this.w;
	        this.diam = o.diam || this.w; 

	        this.joyType = 'analogique';
	        this.model = o.mode !== undefined ? o.mode : 0;

	        this.precision = o.precision || 2;
	        this.multiplicator = o.multiplicator || 1;

	        this.pos = new V2();
	        this.tmp = new V2();

	        this.interval = null;
	        this.c[0].style.display = 'block';
	        this.haveText = o.text !== undefined ? o.text : true; 

	        //this.radius = this.w * 0.5;
	        //this.distance = this.radius*0.25;
	        this.distance = (this.diam*0.5)*0.25;

	        this.h = o.h || this.w + (this.haveText ? 10 : 0);

	        this.c[0].style.width = this.w +'px';

	        if( this.c[1] !== undefined ) { // with title

	            this.c[1].style.width = '100%';
	            this.c[1].style.justifyContent = 'center';
	            this.top = 10;
	            this.h += 10;

	        }

	        let cc = this.colors;

	        this.c[2] = this.dom( 'div', this.css.txt + 'justify-content:center; top:'+(this.h-20)+'px; width:100%; color:'+ cc.text );
	        this.c[2].textContent = this.haveText ? this.value : '';

	        this.c[3] = this.getJoystick( this.model );
	        this.setSvg( this.c[3], 'viewBox', '0 0 '+this.diam+' '+this.diam );
	        this.setCss( this.c[3], { width:this.diam, height:this.diam, left:0, top:this.top });

	        this.mode(0);


	        this.ratio = 128/this.w;

	        this.init();

	        this.update(false);
	        
	    }

	    mode ( mode ) {

	        let cc = this.colors;

	        switch(mode){
	            case 0: // base
	                if(this.model===0){
	                    this.setSvg( this.c[3], 'fill', 'url(#gradIn)', 4 );
	                    this.setSvg( this.c[3], 'stroke', '#000', 4 );
	                } else {
	                    this.setSvg( this.c[3], 'stroke', cc.joyOut, 2 );
	                    //this.setSvg( this.c[3], 'stroke', 'rgb(0,0,0,0.1)', 3 );
	                    this.setSvg( this.c[3], 'stroke', cc.joyOut, 4 );
	                    this.setSvg( this.c[3], 'fill', 'none', 4 );
	                }
	                
	            break;
	            case 1: // over
	                if(this.model===0){
	                    this.setSvg( this.c[3], 'fill', 'url(#gradIn2)', 4 );
	                    this.setSvg( this.c[3], 'stroke', 'rgba(0,0,0,0)', 4 );
	                } else {
	                    this.setSvg( this.c[3], 'stroke', cc.joyOver, 2 );
	                    //this.setSvg( this.c[3], 'stroke', 'rgb(0,0,0,0.3)', 3 );
	                    this.setSvg( this.c[3], 'stroke', cc.joySelect, 4 );
	                    this.setSvg( this.c[3], 'fill', cc.joyOver, 4 );
	                }
	            break;

	        }
	    }

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    addInterval (){
	        if( this.interval !== null ) this.stopInterval();
	        if( this.pos.isZero() ) return;
	        this.interval = setInterval( function(){ this.update(); }.bind(this), 10 );

	    }

	    stopInterval (){

	        if( this.interval === null ) return;
	        clearInterval( this.interval );
	        this.interval = null;

	    }

	    reset () {

	        this.addInterval();
	        this.mode(0);

	    }

	    mouseup ( e ) {

	        this.addInterval();
	        this.isDown = false;
	    
	    }

	    mousedown ( e ) {

	        this.isDown = true;
	        this.mousemove( e );
	        this.mode( 2 );

	    }

	    mousemove ( e ) {

	        this.mode(1);

	        if( !this.isDown ) return;

	        //this.tmp.x = this.radius - ( e.clientX - this.zone.x );
	        //this.tmp.y = this.radius - ( e.clientY - this.zone.y - this.top );

	        this.tmp.x = (this.w*0.5) - ( e.clientX - this.zone.x );
	        this.tmp.y = (this.diam*0.5) - ( e.clientY - this.zone.y - this.ytop );

	        let distance = this.tmp.length();

	        if ( distance > this.distance ) {
	            let angle = Math.atan2(this.tmp.x, this.tmp.y);
	            this.tmp.x = Math.sin( angle ) * this.distance;
	            this.tmp.y = Math.cos( angle ) * this.distance;
	        }

	        this.pos.copy( this.tmp ).divideScalar( this.distance ).negate();

	        this.update();

	    }

	    setValue ( v ) {

	        if(v===undefined) v=[0,0];

	        this.pos.set( v[0] || 0, v[1]  || 0 );
	        this.updateSVG();

	    }

	    update ( up ) {

	        if( up === undefined ) up = true;

	        if( this.interval !== null ){

	            if( !this.isDown ){

	                this.pos.lerp( null, 0.3 );

	                this.pos.x = Math.abs( this.pos.x ) < 0.01 ? 0 : this.pos.x;
	                this.pos.y = Math.abs( this.pos.y ) < 0.01 ? 0 : this.pos.y;

	                if( this.isUI && this.main.isCanvas ) this.main.draw();

	            }

	        }

	        this.updateSVG();

	        if( up ) this.send();
	        

	        if( this.pos.isZero() ) this.stopInterval();

	    }

	    updateSVG () {

	        //let x = this.radius - ( -this.pos.x * this.distance );
	        //let y = this.radius - ( -this.pos.y * this.distance );

	        let x = (this.diam*0.5) - ( -this.pos.x * this.distance );
	        let y = (this.diam*0.5) - ( -this.pos.y * this.distance );

	        if(this.model === 0){

	            let sx = x + ((this.pos.x)*5) + 5;
	            let sy = y + ((this.pos.y)*5) + 10;

	            this.setSvg( this.c[3], 'cx', sx*this.ratio, 3 );
	            this.setSvg( this.c[3], 'cy', sy*this.ratio, 3 );
	        } else {
	            this.setSvg( this.c[3], 'cx', x*this.ratio, 3 );
	            this.setSvg( this.c[3], 'cy', y*this.ratio, 3 );
	        }

	        

	        this.setSvg( this.c[3], 'cx', x*this.ratio, 4 );
	        this.setSvg( this.c[3], 'cy', y*this.ratio, 4 );

	        this.value[0] =  ( this.pos.x * this.multiplicator ).toFixed( this.precision ) * 1;
	        this.value[1] =  ( this.pos.y * this.multiplicator ).toFixed( this.precision ) * 1;

	        if(this.haveText) this.c[2].textContent = this.value;

	    }

	    clear () {
	        
	        this.stopInterval();
	        super.clear();

	    }

	}

	class Knob extends Proto {

	    constructor( o = {} ) {

	        super( o );

	        this.isCyclic = o.cyclic || false;
	        this.model = o.stype || 0;
	        if( o.mode !== undefined ) this.model = o.mode;

	        this.autoWidth = false;

	        this.setTypeNumber( o );

	        this.minw  = this.w;
	        this.diam = o.diam || this.w; 

	        this.mPI = Math.PI * 0.8;
	        this.toDeg = 180 / Math.PI;
	        this.cirRange = this.mPI * 2;

	        this.offset = new V2();

	        this.h = o.h || this.w + 10;

	        this.c[0].style.width = this.w +'px';
	        this.c[0].style.display = 'block';

	        if(this.c[1] !== undefined) {

	            this.c[1].style.width = '100%';
	            this.c[1].style.justifyContent = 'center';
	            this.top = 10;
	            this.h += 10;

	        }

	        this.percent = 0;

	        this.cmode = 0;
	        let cc = this.colors;

	        this.c[2] = this.dom( 'div', this.css.txt + 'justify-content:center; top:'+(this.h-20)+'px; width:100%; color:'+ cc.text );

	        this.c[3] = this.getKnob();
	        this.setSvg( this.c[3], 'fill', cc.button, 0 );
	        this.setSvg( this.c[3], 'stroke', cc.text, 1 );
	        this.setSvg( this.c[3], 'stroke', cc.text, 3 );
	        this.setSvg( this.c[3], 'd', this.makeGrad(), 3 );
	        
	        this.setSvg( this.c[3], 'viewBox', '0 0 ' + this.diam + ' ' + this.diam );
	        this.setCss( this.c[3], { width:this.diam, height:this.diam, left:0, top:this.top });

	        if ( this.model > 0 ) {

	            Tools.dom( 'path', '', { d: '', stroke:cc.text, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, this.c[3] ); //4

	            if ( this.model == 2) {
	            
	                Tools.addSVGGlowEffect();
	                this.setSvg( this.c[3], 'style', 'filter: url("#UILGlow");', 4 );
	            
	            }

	        }

	        this.r = 0;

	        this.init();

	        this.update();

	    }

	    mode ( mode ) {

	        let cc = this.colors;

	        if( this.cmode === mode ) return false;

	        switch( mode ) {
	            case 0: // base
	                this.s[2].color = cc.text;
	                this.setSvg( this.c[3], 'fill', cc.button, 0);
	                //this.setSvg( this.c[3], 'stroke','rgba(255,0,0,0.2)', 2);
	                this.setSvg( this.c[3], 'stroke', cc.text, 1 );
	            break;
	            case 1: // down
	                this.s[2].color = cc.textOver;
	                this.setSvg( this.c[3], 'fill', cc.select, 0);
	                //this.setSvg( this.c[3], 'stroke','rgba(0,0,0,0.6)', 2);
	                this.setSvg( this.c[3], 'stroke', cc.textOver, 1 );
	            break;
	        }

	        this.cmode = mode;
	        return true;

	    }

	    testZone ( e ) {

	        let l = this.local;
	        if( l.x === -1 && l.y === -1 ) return '';
	        if( l.y <= this.c[ 1 ].offsetHeight ) return 'title';
	        else if ( l.y > this.h - this.c[ 2 ].offsetHeight ) return 'text';
	        else return 'knob';

	    }

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mouseup ( e ) {

	        this.isDown = false;
	        this.sendEnd();
	        return this.mode(0)

	    }

	    mousedown ( e ) {

	        this.isDown = true;
	        this.old = this.value;
	        this.oldr = null;
	        this.mousemove( e );
	        return this.mode(1)

	    }

	    mousemove ( e ) {

	        if( !this.isDown ) return;

	        let off = this.offset;

	        //off.x = this.radius - ( e.clientX - this.zone.x );
	        //off.y = this.radius - ( e.clientY - this.zone.y - this.top );

	        off.x = (this.w*0.5) - ( e.clientX - this.zone.x );
	        off.y = (this.diam*0.5) - ( e.clientY - this.zone.y - this.ytop );

	        this.r = - Math.atan2( off.x, off.y );

	        if( this.oldr !== null ) this.r = Math.abs(this.r - this.oldr) > Math.PI ? this.oldr : this.r;

	        this.r = this.r > this.mPI ? this.mPI : this.r;
	        this.r = this.r < -this.mPI ? -this.mPI : this.r;

	        let steps = 1 / this.cirRange;
	        let value = (this.r + this.mPI) * steps;

	        let n = ( ( this.range * value ) + this.min ) - this.old;

	        if(n >= this.step || n <= this.step){ 
	            n = Math.floor( n / this.step );
	            this.value = this.numValue( this.old + ( n * this.step ) );
	            this.update( true );
	            this.old = this.value;
	            this.oldr = this.r;
	        }

	    }

	    wheel ( e ) {

	        let name = this.testZone( e );

	        if( name === 'knob' ) {
	    
	            let v = this.value - this.step * e.delta;
	    
	            if ( v > this.max ) {
	                v = this.isCyclic ? this.min : this.max;
	            } else if ( v < this.min ) {
	                v = this.isCyclic ? this.max : this.min;
	            }
	    
	            this.setValue( v );
	            this.old = v;
	            this.update( true );

	            return true;
	    
	        }
	        return false;

	    }

	    makeGrad () {

	        let d = '', step, range, a, x, y, x2, y2, r = 64;
	        let startangle = Math.PI + this.mPI;
	        let endangle = Math.PI - this.mPI;
	        //let step = this.step>5 ? this.step : 1;

	        if(this.step>5){
	            range =  this.range / this.step;
	            step = ( startangle - endangle ) / range;
	        } else {
	            step = (( startangle - endangle ) / r)*2;
	            range = r*0.5;
	        }

	        for ( let i = 0; i <= range; ++i ) {

	            a = startangle - ( step * i );
	            x = r + Math.sin( a ) * ( r - 20 );
	            y = r + Math.cos( a ) * ( r - 20 );
	            x2 = r + Math.sin( a ) * ( r - 24 );
	            y2 = r + Math.cos( a ) * ( r - 24 );
	            d += 'M' + x + ' ' + y + ' L' + x2 + ' '+y2 + ' ';

	        }

	        return d;

	    }

	    update ( up ) {

	        this.c[2].textContent = this.value;
	        this.percent = (this.value - this.min) / this.range;

	        let sa = Math.PI + this.mPI;
	        let ea = ( ( this.percent * this.cirRange ) - ( this.mPI ) );

	        let sin = Math.sin( ea );
	        let cos = Math.cos( ea );

	        let x1 = ( 25 * sin ) + 64;
	        let y1 = -( 25 * cos ) + 64;
	        let x2 = ( 20 * sin ) + 64;
	        let y2 = -( 20 * cos ) + 64;

	        this.setSvg( this.c[3], 'd', 'M ' + x1 +' ' + y1 + ' L ' + x2 +' ' + y2, 1 );
	        
	        if ( this.model > 0 ) {

	            let x1 = 36 * Math.sin( sa ) + 64;
	            let y1 = 36 * Math.cos( sa ) + 64;
	            let x2 = 36 * sin + 64;
	            let y2 = -36 * cos + 64;
	            let big = ea <= Math.PI - this.mPI ? 0 : 1;
	            this.setSvg( this.c[3], 'd', 'M ' + x1 + ',' + y1 + ' A ' + 36 + ',' + 36 + ' 1 ' + big + ' 1 ' + x2 + ',' + y2, 4 );

	            let color = Tools.pack( Tools.lerpColor( Tools.unpack( Tools.ColorLuma( this.colors.text, -0.75) ), Tools.unpack( this.colors.text ), this.percent ) );
	            this.setSvg( this.c[3], 'stroke', color, 4 );
	        
	        }

	        if( up ) this.send();
	        
	    }

	}

	class List extends Proto {

	    constructor( o = {} ) {

	        super( o );

	        // TODO not work
	        this.hideCurrent = false;

	        // images
	        this.path = o.path || '';
	        this.format = o.format || '';
	        

	        this.isWithImage = this.path !== '' ? true:false;
	        this.preLoadComplete = false;

	        this.tmpImage = {};
	        this.tmpUrl = [];

	        this.m = o.m !== undefined ? o.m : 5;


	        let align = o.align || 'left';

	        // scroll size
	        let ss = o.scrollSize || 10;
	        this.ss = ss+1;

	        this.sMode = 0;
	        this.tMode = 0;

	        this.listOnly = o.listOnly || false;
	        this.staticTop = o.staticTop || false;

	        this.isSelectable = this.listOnly;
	        if( o.select !== undefined ) o.selectable = o.select;
	        if( o.selectable !== undefined ) this.isSelectable = o.selectable;

	        if( this.txt === '' ) this.p = 0;


	        let fltop = Math.floor(this.h*0.5)-3;
	        let cc = this.colors;

	        this.c[2] = this.dom( 'div', this.css.basic + 'top:0; display:none; border-radius:'+this.radius+'px;' );
	        this.c[3] = this.dom( 'div', this.css.item + 'padding:0px '+this.m+'px; margin-bottom:0px; position:absolute; justify-content:'+align+'; text-align:'+align+'; line-height:'+(this.h-4)+'px; top:1px; background:'+cc.button+'; height:'+(this.h-2)+'px; border:1px solid '+cc.border+'; border-radius:'+this.radius+'px;' );
	        this.c[4] = this.dom( 'path', this.css.basic + 'position:absolute; width:6px; height:6px; top:'+fltop+'px;', { d:this.svgs.g1, fill:cc.text, stroke:'none'});

	        this.scrollerBack = this.dom( 'div', this.css.basic + 'right:0px; width:'+ss+'px; background:'+cc.back+'; display:none;');
	        this.scroller = this.dom( 'div', this.css.basic + 'right:'+((ss-(ss*0.25))*0.5)+'px; width:'+(ss*0.25)+'px; background:'+cc.text+'; display:none; ');

	        this.c[3].style.color = cc.text;


	        this.list = [];
	        this.refObject = null;

	        if( o.list ){
	            if( o.list instanceof Array ){
	                this.list = o.list;
	            } else if( o.list instanceof Object ){
	                this.refObject = o.list;
	                for( let g in this.refObject ) this.list.push( g );
	            }
	        }

	        this.items = [];

	        this.prevName = '';

	        
	        this.tmpId = 0;

	        this.baseH = this.h;

	        this.itemHeight = o.itemHeight || this.h;//(this.h-3);

	        // force full list 
	        this.full = o.full || false;

	        this.py = 0;
	        this.ww = this.sb;
	        this.scroll = false;
	        this.isDown = false;

	        this.current = null;

	        // list up or down
	        this.side = o.side || 'down';
	        this.up = this.side === 'down' ? 0 : 1;

	        if( this.up ){

	            this.c[2].style.top = 'auto';
	            this.c[3].style.top = 'auto';
	            this.c[4].style.top = 'auto';

	            this.c[2].style.bottom = this.h-2 + 'px';
	            this.c[3].style.bottom = '1px';
	            this.c[4].style.bottom = fltop + 'px';

	        } else {
	            this.c[2].style.top = this.baseH + 'px';
	        }

	        this.listIn = this.dom( 'div', this.css.basic + 'left:0; top:0; width:100%; background:none;');
	        this.listIn.name = 'list';

	        this.topList = 0;
	        
	        this.c[2].appendChild( this.listIn );
	        this.c[2].appendChild( this.scrollerBack );
	        this.c[2].appendChild( this.scroller );

	        if( o.value !== undefined ){
	            if(!isNaN(o.value)) this.value = this.list[ o.value ];
	            else this.value = o.value;
	        }else {
	            this.value = this.list[0];
	        }

	        this.isOpenOnStart = o.open || false;

	        if( this.listOnly ){
	            this.baseH = 5;
	            this.c[3].style.display = 'none';
	            this.c[4].style.display = 'none';
	            this.c[2].style.top = this.baseH+'px';
	            this.isOpenOnStart = true;
	        }


	        this.miniCanvas = o.miniCanvas || false; 
	        this.canvasBg = o.canvasBg || 'rgba(0,0,0,0)';
	        this.imageSize = o.imageSize || [20,20];

	        // dragout function
	        this.drag = o.drag || false;
	        this.dragout = o.dragout || false;
	        this.dragstart = o.dragstart || null;
	        this.dragend = o.dragend || null;

	        

	        //this.c[0].style.background = '#FF0000'
	        ///if( this.isWithImage ) this.preloadImage();
	            
	        this.setList( this.list );
	        this.init();
	        if( this.isWithImage ) this.preloadImage();
	        if( this.isOpenOnStart ) this.open( true );

	        this.baseH += this.mtop;

	    }

	    // image list

	    preloadImage () {



	        this.preLoadComplete = false;

	        this.tmpImage = {};
	        for( let i=0; i<this.list.length; i++ ) this.tmpUrl.push( this.list[i] );
	        this.loadOne();
	        
	    }

	    nextImg () {

	        if(this.c === null) return

	        this.tmpUrl.shift();
	        if( this.tmpUrl.length === 0 ){ 

	            this.preLoadComplete = true;

	            this.addImages();
	            /*this.setList( this.list );
	            this.init();
	            if( this.isOpenOnStart ) this.open();*/

	        }
	        else this.loadOne();

	    }

	    loadOne(){

	        let self = this;
	        let name = this.tmpUrl[0];
	        let img = document.createElement('img');
	        img.style.cssText = 'position:absolute; width:'+self.imageSize[0]+'px; height:'+self.imageSize[1]+'px';
	        img.setAttribute('src', this.path + name + this.format );

	        img.addEventListener('load', function() {

	            self.imageSize[2] = img.width;
	            self.imageSize[3] = img.height;
	            self.tmpImage[name] = img;
	            self.nextImg();

	        });

	    }

	    //

	    testZone ( e ) {

	        let l = this.local;
	        if( l.x === -1 && l.y === -1 ) return '';

	        if( this.up && this.isOpen ){
	            if( l.y > this.h - this.baseH ) return 'title';
	            else {
	                if( this.scroll && ( l.x > (this.sa+this.sb-this.ss)) ) return 'scroll';
	                if(l.x > this.sa) return this.testItems( l.y-this.baseH );
	            }

	        } else {
	            if( l.y < this.baseH+2 ) return 'title';
	            else {
	                if( this.isOpen ){
	                    if( this.scroll && ( l.x > (this.sa+this.sb-this.ss)) ) return 'scroll';
	                    if(l.x > this.sa) return this.testItems( l.y-this.baseH );
	                }
	            }

	        }

	        return '';

	    }

	    testItems ( y ) {

	        let name = '';

	        let items = this.items;

	        /*if(this.hideCurrent){
	            //items = [...this.items]
	            items = this.items.slice(this.tmpId)

	        }*/

	        let i = items.length, item, a, b;
	        while(i--){
	            item = items[i];
	            a = item.posy + this.topList;
	            b = item.posy + this.itemHeight + 1 + this.topList;
	            if( y >= a && y <= b ){ 
	                name = 'item' + i;
	                this.modeItem(0);
	                this.current = item;
	                this.modeItem(1);
	                return name;
	            }

	        }

	        return name;

	    }

	    modeItem ( mode ) {

	        if( !this.current ) return

	        if( this.current.select && mode===0) mode = 2;
	        let cc = this.colors;

	        switch( mode ){

	            case 0: // base
	                this.current.style.background = cc.back;
	                this.current.style.color = cc.text;
	            break;
	            case 1: // over
	                this.current.style.background = cc.over;
	                this.current.style.color = cc.textOver;
	            break;
	            case 2: // edit / down
	                this.current.style.background = cc.select;
	                this.current.style.color = cc.textSelect;
	            break;

	        }
	    }

	    unSelected() {

	        if( !this.current ) return
	        this.modeItem(0);
	        this.current = null;

	    }

	    selected() {

	        if( !this.current ) return
	        this.resetItems();
	        this.modeItem(2);
	        this.current.select = true;

	        

	    }

	    resetItems() {

	        let i = this.items.length;
	        while(i--){
	            this.items[i].select = false;
	            this.items[i].style.background = this.colors.back;
	            this.items[i].style.color = this.colors.text;
	        }

	    }

	    hideActive() {

	        if( !this.hideCurrent ) return
	        //if( !this.current ) return
	        if( this.current )this.tmpId = this.current.id;
	        this.resetHide();
	        //this.items[this.tmpId].style.height = 0+'px'
	        
	    }

	    resetHide() {

	        console.log(this.tmpId);

	        let i = this.items.length;
	        while(i--){
	            if(i===this.tmpId){
	                this.items[i].style.height = 0+'px';
	                this.items[i].posy = -1;
	            } else {
	                this.items[i].style.height = this.itemHeight+'px';
	                this.items[i].posy = (this.itemHeight+1)*(i-1);
	            }
	            //this.items[i].style.display = 'flex'
	            
	            /*this.items[i].select = false
	            this.items[i].style.background = this.colors.back;
	            this.items[i].style.color = this.colors.text;*/
	        }

	    }

	    // ----------------------
	    //   EVENTS
	    // ----------------------


	    mouseup ( e ) {

	        this.isDown = false;

	    }

	    mousedown ( e ) {

	        let name = this.testZone( e );

	        if( !name ) return false;

	        if( name === 'scroll' ){

	            this.isDown = true;
	            this.mousemove( e );

	        } else if( name === 'title' ){

	            this.modeTitle(2);
	            if( !this.listOnly ){
	                this.hideActive();
	                if( !this.isOpen ) this.open();
	                else this.close();
	            }
	        } else {
	            // is item
	            if( this.current ){

	                this.value = this.list[ this.current.id ];
	                //this.tmpId = this.current.id

	                if( this.isSelectable ) this.selected();

	                //this.send( this.refObject !== null ? this.refObject[ this.list[this.current.id]] : this.value );
	                this.send( this.value );

	                if( !this.listOnly ) {
	                    this.close();
	                    this.setTopItem();
	                    //this.hideActive()
	                }
	            }
	            
	        }

	        return true;

	    }

	    mousemove ( e ) {

	        let nup = false;
	        let name = this.testZone( e );

	        if( !name ) return nup;

	        if( name === 'title' ){
	            this.unSelected();
	            this.modeTitle(1);
	            this.cursor('pointer');

	        } else if( name === 'scroll' ){

	            this.cursor('s-resize');
	            this.modeScroll(1);
	            if( this.isDown ){
	                this.modeScroll(2);
	                //this.update( ( e.clientY - top  ) - ( this.sh*0.5 ) );
	                let top = this.zone.y+this.baseH-2;
	                this.update( ( e.clientY - top  ) - ( this.sh*0.5 ) );
	            }
	            //if(this.isDown) this.listmove(e);
	        } else {

	            // is item
	            this.modeTitle(0);
	            this.modeScroll(0);
	            this.cursor('pointer');
	        
	        }

	        if( name !== this.prevName ) nup = true;
	        this.prevName = name;

	        return nup;

	    }

	    wheel ( e ) {

	        let name = this.testZone( e );
	        if( name === 'title' ) return false; 
	        this.py += e.delta*10;
	        this.update(this.py);
	        return true;

	    }



	    // ----------------------

	    reset () {

	        this.prevName = '';
	        this.unSelected();
	        this.modeTitle(0);
	        this.modeScroll(0);

	        //console.log('this is reset')
	        
	    }

	    modeScroll ( mode ) {

	        if( mode === this.sMode ) return;

	        let s = this.scroller.style;
	        let cc = this.colors;

	        switch(mode){
	            case 0: // base
	                s.background = cc.text;
	            break;
	            case 1: // over
	                s.background = cc.select;
	            break;
	            case 2: // edit / down
	                s.background = cc.select;
	            break;

	        }

	        this.sMode = mode;
	    }

	    modeTitle ( mode ) {

	        if( mode === this.tMode ) return;

	        let s = this.s;
	        let cc = this.colors;

	        switch(mode){
	            case 0: // base
	                s[3].color = cc.text;
	                s[3].background = cc.button;
	            break;
	            case 1: // over
	                s[3].color = cc.textOver;
	                s[3].background = cc.overoff;
	            break;
	            case 2: // edit / down
	                s[3].color = cc.textSelect;
	                s[3].background = cc.overoff;
	            break;

	        }

	        this.tMode = mode;

	    }

	    clearList () {

	        while ( this.listIn.children.length ) this.listIn.removeChild( this.listIn.lastChild );
	        this.items = [];

	    }

	    setList ( list ) {

	        this.clearList();

	        this.list = list;
	        this.length = this.list.length;

	        let lng = this.hideCurrent? this.length-1 : this.length;

	        this.maxItem = this.full ? lng : 5;
	        this.maxItem = lng < this.maxItem ? lng : this.maxItem;

	        this.maxHeight = this.maxItem * (this.itemHeight+1) + 2;
	        


	        this.max = lng * (this.itemHeight+1) + 2;
	        this.ratio = this.maxHeight / this.max;
	        this.sh = this.maxHeight * this.ratio;
	        this.range = this.maxHeight - this.sh;

	        this.c[2].style.height = this.maxHeight + 'px';
	        this.scrollerBack.style.height = this.maxHeight + 'px';
	        this.scroller.style.height = this.sh + 'px';

	        if( this.max > this.maxHeight ){ 
	            this.ww = this.sb - this.ss;
	            this.scroll = true;
	        }

	        if( this.miniCanvas ) {

	            this.tmpCanvas = document.createElement('canvas');
	            this.tmpCanvas.width = this.imageSize[0];
	            this.tmpCanvas.height = this.imageSize[1];
	            this.tmpCtx = this.tmpCanvas.getContext("2d");
	            this.tmpCtx.fillStyle = this.canvasBg;
	            this.tmpCtx.fillRect(0, 0, this.imageSize[0], this.imageSize[1]);

	        }

	        let item, n;//, l = this.sb;
	        for( let i=0; i<this.length; i++ ){

	            n = this.list[i];
	            item = this.dom( 'div', this.css.item + 'padding:0px '+(this.m+1)+'px; width:'+this.ww+'px; height:'+this.itemHeight+'px; line-height:'+(this.itemHeight-2)+'px; color:'+this.colors.text+'; background:'+this.colors.back+';' );
	            item.name = 'item'+ i;
	            item.id = i;
	            item.select = false;
	            item.posy = (this.itemHeight+1)*i;
	            this.listIn.appendChild( item );
	            this.items.push( item );

	            if( n === this.value ) this.current = item;

	            //if( this.isWithImage ) item.appendChild( this.tmpImage[n] );
	            if( !this.isWithImage ) item.textContent = n;

	            if( this.miniCanvas ){

	                let c = new Image();
	                c.src = this.tmpCanvas.toDataURL();

	                //item.style.marginLeft = (this.imageSize[0]+8)+'px'


	                /*let c = document.createElement('canvas')

	                c.width = this.imageSize[0]
	                c.height = this.imageSize[1]
	                let ctx = c.getContext("2d")
	                ctx.fillStyle = this.canvasBg
	                ctx.fillRect(0, 0, this.imageSize[0], this.imageSize[1])*/
	                
	                //c.style.cssText = 'position:relative; pointer-events:none; display:inline-block; float:left; margin-left:0px; margin-right:5px; top:2px'
	               // c.style.cssText =' flex-shrink: 0;'

	                c.style.cssText ='margin-right:4px;';


	                //c.style.cssText = 'display:flex; align-content: flex-start; flex-wrap: wrap;'
	                //item.style.float = 'right'
	                item.appendChild( c );

	                this.tmpImage[n] = c;

	            }

	            if( this.dragout ){

	                item.img = this.tmpImage[n];

	                item.style.pointerEvents = 'auto';
	                item.draggable = "true";

	                item.addEventListener('dragstart', this.dragstart || function(){ /*console.log('drag start')*/});
	                item.addEventListener('drag', this.drag || function(){ /*console.log('drag start')*/});
	                //item.addEventListener('dragover', this);
	                //item.addEventListener('dragenter', this);
	                item.addEventListener('dragleave', function(){ Roots.fakeUp(); } );
	                item.addEventListener('dragend', this.dragend || function(){ /*console.log('drag end')*/ }.bind(this) );
	                //item.addEventListener('drop', function(){console.log('drop')})

	            }

	        }

	        this.setTopItem();
	        if( this.isSelectable ) this.selected();
	        
	    }

	    drawImage( name, image, x,y,w,h ){

	        this.tmpCtx.clearRect(0, 0, this.imageSize[0], this.imageSize[1]);
	        this.tmpCtx.drawImage(image, x, y, w, h, 0, 0, this.imageSize[0], this.imageSize[1]);
	        this.tmpImage[name].src = this.tmpCanvas.toDataURL();


	        /*let c = this.tmpImage[name]
	        let ctx = c.getContext("2d")
	        ctx.drawImage(image, x, y, w, h, 0, 0, this.imageSize[0], this.imageSize[1])*/

	    }

	    addImages (){
	        let lng = this.list.length;
	        for( let i=0; i<lng; i++ ){
	            this.items[i].appendChild( this.tmpImage[this.list[i]] );
	        }
	        this.setTopItem();
	    }

	    setValue ( value ) {

	        if(!isNaN(value)) this.value = this.list[ value ];
	        else this.value = value;

	        //this.tmpId = value

	        this.setTopItem();

	    }

	    setTopItem (){

	        if( this.staticTop ) return;

	        if( this.isWithImage ){

	            if(!this.preLoadComplete ) return;

	            if(!this.c[3].children.length){
	                this.canvas = document.createElement('canvas');
	                this.canvas.width = this.imageSize[0];
	                this.canvas.height = this.imageSize[1];
	                this.canvas.style.cssText ='margin-right:4px;';
	                this.ctx = this.canvas.getContext("2d");
	                this.c[3].style.textAlign = 'left';
	                this.c[3].style.justifyContent = 'left';
	                this.c[3].appendChild( this.canvas );
	            }

	            this.tmpImage[ this.value ];
	            this.ctx.drawImage( this.tmpImage[ this.value ], 0, 0, this.imageSize[2], this.imageSize[3], 0,0, this.imageSize[0], this.imageSize[1] );

	        }
	        else this.c[3].textContent = this.value;

	        if( this.miniCanvas ){

	            if(!this.c[3].children.length){
	                this.canvas = document.createElement('canvas');
	                this.canvas.width = this.imageSize[0];
	                this.canvas.height = this.imageSize[1];
	                this.canvas.style.cssText ='margin-right:4px;';
	                this.ctx = this.canvas.getContext("2d");
	                this.c[3].style.textAlign = 'left';
	                this.c[3].style.justifyContent = 'left';
	                this.c[3].appendChild( this.canvas );
	            }

	            this.ctx.drawImage( this.tmpImage[ this.value ], 0, 0 );


	        }

	    }


	    // ----- LIST

	    update ( y ) {

	        if( !this.scroll ) return;

	        y = y < 0 ? 0 : y;
	        y = y > this.range ? this.range : y;

	        this.topList = -Math.floor( y / this.ratio );

	        this.listIn.style.top = this.topList+'px';
	        this.scroller.style.top = Math.floor( y )  + 'px';

	        this.py = y;

	    }

	    parentHeight ( t ) {

	        if ( this.group !== null ) this.group.calc( t );
	        else if ( this.isUI ) this.main.calc( t );

	    }

	    open ( first ) {

	        super.open();

	        this.update( 0 );

	        this.h = this.maxHeight + this.baseH + 5;
	        if( !this.scroll ){
	            this.topList = 0;
	            this.h = this.baseH + 5 + this.max;
	            this.scroller.style.display = 'none';
	            this.scrollerBack.style.display = 'none';
	        } else {
	            this.scroller.style.display = 'block';
	            this.scrollerBack.style.display = 'block';
	        }
	        this.s[0].height = this.h + 'px';
	        this.s[2].display = 'block';

	        if( this.up ){ 
	            this.zone.y -= this.h - (this.baseH-10);
	            this.setSvg( this.c[4], 'd', this.svgs.g1 );
	        } else {
	            this.setSvg( this.c[4], 'd', this.svgs.g2 );
	        }

	        this.rSizeContent();

	        let t = this.h - this.baseH;

	        this.zone.h = this.h;

	        if(!first) this.parentHeight( t );

	    }

	    close () {

	        super.close();

	        if( this.up ) this.zone.y += this.h - (this.baseH-10);

	        let t = this.h - this.baseH;

	        this.h = this.baseH;
	        this.s[0].height = this.h + 'px';
	        this.s[2].display = 'none';
	        this.setSvg( this.c[4], 'd', this.svgs.g1 );

	        this.zone.h = this.h;

	        this.parentHeight( -t );

	    }

	    // -----

	    text ( txt ) {

	        this.c[3].textContent = txt;

	    }

	    rSizeContent () {

	        let i = this.length;
	        while(i--) this.listIn.children[i].style.width = this.ww + 'px';

	    }

	    rSize () {

	        super.rSize();

	        //Proto.prototype.rSize.call( this );

	        let s = this.s;
	        let w = this.sb;
	        let d = this.sa;

	        if(s[2]=== undefined) return;

	        s[2].width = w + 'px';
	        s[2].left = d +'px';

	        s[3].width = w + 'px';
	        s[3].left = d + 'px';

	        s[4].left = d + w - 15 + 'px';

	        this.ww = w;
	        if( this.max > this.maxHeight ) this.ww = w-this.ss;
	        if(this.isOpen) this.rSizeContent();

	    }

	}

	class Numeric extends Proto {

	    constructor( o = {} ) {

	        super( o );

	        this.setTypeNumber( o );

	        this.allway = o.allway || false;

	        this.isDown = false;
	        this.value = [0];
	        this.multy = 1;
	        this.invmulty = 1;
	        this.isSingle = true;
	        this.isAngle = false;
	        this.isVector = false;

	        if( o.isAngle ){
	            this.isAngle = true;
	            this.multy = Tools.torad;
	            this.invmulty = Tools.todeg;
	        }

	        this.isDrag = o.drag || false;

	        if( o.value !== undefined ){
	            if( !isNaN(o.value) ){
	                this.value = [o.value];
	            } else if( o.value instanceof Array ){ 
	                this.value = o.value;
	                this.isSingle = false;
	            } else if( o.value instanceof Object ){ 
	                this.value = [];
	                if( o.value.x !== undefined ) this.value[0] = o.value.x;
	                if( o.value.y !== undefined ) this.value[1] = o.value.y;
	                if( o.value.z !== undefined ) this.value[2] = o.value.z;
	                if( o.value.w !== undefined ) this.value[3] = o.value.w;
	                this.isSingle = false;
	                this.isVector = true;
	            }
	        }

	        this.lng = this.value.length;
	        this.tmp = [];

	        this.current = -1;
	        this.prev = { x:0, y:0, d:0, v:0 };

	        let cc = this.colors;

	        // bg
	        this.c[2] = this.dom( 'div', this.css.basic + ' background:' + cc.select + '; top:4px; width:0px; height:' + (this.h-8) + 'px;' );

	        this.cMode = [];
	        
	        let i = this.lng;
	        while(i--){

	            if( this.isAngle ) this.value[i] = (this.value[i] * 180 / Math.PI).toFixed( this.precision );
	            this.c[3+i] = this.dom( 'div', this.css.txtselect + 'top:1px; height:'+(this.h-2)+'px; color:' + cc.text + '; background:' + cc.back + '; borderColor:' + cc.border+'; border-radius:'+this.radius+'px;');
	            if(o.center) this.c[2+i].style.textAlign = 'center';
	            this.c[3+i].textContent = this.value[i];
	            this.c[3+i].style.color = this.colors.text;
	            this.c[3+i].isNum = true;
	            this.cMode[i] = 0;

	        }

	        // selection
	        this.selectId = 3 + this.lng;
	        this.c[this.selectId] = this.dom(  'div', this.css.txtselect + 'position:absolute; top:2px; height:' + (this.h-4) + 'px; padding:0px 0px; width:0px; color:' + cc.textSelect + '; background:' + cc.select + '; border:none; border-radius:0px;');

	        // cursor
	        this.cursorId = 4 + this.lng;
	        this.c[ this.cursorId ] = this.dom( 'div', this.css.basic + 'top:2px; height:' + (this.h-4) + 'px; width:0px; background:'+cc.text+';' );

	        this.init();
	    }

	    testZone ( e ) {

	        let l = this.local;
	        if( l.x === -1 && l.y === -1 ) return ''

	        let i = this.lng;
	        let t = this.tmp;

	        while( i-- ){
	            if( l.x>t[i][0] && l.x<t[i][2] ) return i
	        }

	        return ''

	    }

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mousedown ( e ) {

	        let name = this.testZone( e );

	        if( !this.isDown ){
	            this.isDown = true;
	            if( name !== '' ){ 
	            	this.current = name;
	            	this.prev = { x:e.clientX, y:e.clientY, d:0, v: this.isSingle ? parseFloat(this.value) : parseFloat( this.value[ this.current ] ) };
	            	this.setInput( this.c[ 3 + this.current ] );
	            }
	            return this.mousemove( e )
	        }

	        return false

	    }

	    mouseup ( e ) {

	    	if( this.isDown ){
	            
	            this.isDown = false;
	            this.prev = { x:0, y:0, d:0, v:0 };

	            return this.mousemove( e )
	        }

	        return false

	    }

	    mousemove ( e ) {

	        let nup = false;
	        let x = 0;

	        let name = this.testZone( e );

	        if( name === '' ) this.cursor();
	        else { 
	        	if(!this.isDrag) this.cursor('text');
	        	else this.cursor( this.current !== -1 ? 'move' : 'pointer' );
	        }

	        

	        if( this.isDrag ){

	        	if( this.current !== -1 ){

	            	this.prev.d += ( e.clientX - this.prev.x ) - ( e.clientY - this.prev.y );

	                let n = this.prev.v + ( this.prev.d * this.step);

	                this.value[ this.current ] = this.numValue(n);
	                this.c[ 3 + this.current ].textContent = this.value[this.current];

	                this.validate();

	                this.prev.x = e.clientX;
	                this.prev.y = e.clientY;

	                nup = true;
	             }

	        } else {

	        	if( this.isDown ) x = e.clientX - this.zone.x -3;
	        	if( this.current !== -1 ) x -= this.tmp[this.current][0];
	        	return this.upInput( x, this.isDown )

	        }

	        return nup

	    }

	    // ----------------------

	    reset () {

	        let nup = false;
	        return nup

	    }


	    setValue ( v ) {

	        if( this.isVector ){
	            if( v.x !== undefined ) this.value[0] = v.x;
	            if( v.y !== undefined ) this.value[1] = v.y;
	            if( v.z !== undefined ) this.value[2] = v.z;
	            if( v.w !== undefined ) this.value[3] = v.w;
	        } else {
	            this.value = this.isSingle ? [v] : v;  
	        }

	        this.update();

	    }

	    sameStr ( str ){

	        let i = this.value.length;
	        while(i--) this.c[ 3 + i ].textContent = str;

	    }

	    update ( up ) {

	        let i = this.value.length;

	        while(i--){
	             this.value[i] = this.numValue( this.value[i] * this.invmulty );
	             this.c[ 3 + i ].textContent = this.value[i];
	        }

	        if( up ) this.send();

	    }

	    send ( v ) {

	        v = v || this.value;

	        this.isSend = true;

	        if( this.objectLink !== null ){ 

	            if( this.isVector ){
	                this.objectLink[ this.objectKey ].fromArray( v );
	            } else {
	                this.objectLink[ this.objectKey ] = v;
	            }

	        }

	        if( this.callback ) this.callback( v, this.objectKey );
	        this.isSend = false;

	    }


	    // ----------------------
	    //   INPUT
	    // ----------------------

	    select ( c, e, w, t ) {

	        let s = this.s;
	        let d = this.current !== -1 ? this.tmp[this.current][0] + 5 : 0;
	        s[this.cursorId].width = '1px';
	        s[this.cursorId].left = ( d + c ) + 'px';
	        s[this.selectId].left =  ( d + e )  + 'px';
	        s[this.selectId].width =  w  + 'px';
	        this.c[this.selectId].innerHTML = t;
	    
	    }

	    unselect () {

	        let s = this.s;
	        if(!s) return
	        this.c[this.selectId].innerHTML = '';
	        s[this.selectId].width = 0 + 'px';
	        s[this.cursorId].width = 0 + 'px';

	    }

	    validate ( force ) {

	        let ar = [];
	        let i = this.lng;

	        if( this.allway ) force = true;

	        while(i--){
	        	if(!isNaN( this.c[ 3 + i ].textContent )){ 
	                let nx = this.numValue( this.c[ 3 + i ].textContent );
	                this.c[ 3 + i ].textContent = nx;
	                this.value[i] = nx;
	            } else { // not number
	                this.c[ 3 + i ].textContent = this.value[i];
	            }

	        	ar[i] = this.value[i] * this.multy;
	        }

	        if( !force ) return
	        this.send( this.isSingle ? ar[0] : ar );

	    }

	    // ----------------------
	    //   REZISE
	    // ----------------------

	    rSize () {

	        super.rSize();
	        let sx = this.colors.sx;
	        let ss = sx * (this.lng-1);
	        let w = (this.sb-ss) / this.lng;//(( this.sb + sx ) / this.lng )-sx
	        let s = this.s;
	        let i = this.lng;

	        while(i--){
	            //this.tmp[i] = [ Math.floor( this.sa + ( w * i )+( 5 * i )), w ];
	            this.tmp[i] = [ ( this.sa + ( w * i )+( sx * i )), w ];
	            this.tmp[i][2] = this.tmp[i][0] + this.tmp[i][1];
	            s[ 3 + i ].left = this.tmp[i][0] + 'px';
	            s[ 3 + i ].width = this.tmp[i][1] + 'px';
	        }

	    }

	}

	class Slide extends Proto {
	  constructor(o = {}) {
	    super(o);

	    if (o.easing <= 0) throw "Easing must be > 0";
	    this.easing = o.easing || 1;

	    this.setTypeNumber(o);

	    this.model = o.stype || 0;
	    if (o.mode !== undefined) this.model = o.mode;

	    //this.defaultBorderColor = this.colors.hide;

	    this.isDown = false;
	    this.isOver = false;
	    this.allway = o.allway || false;

	    this.isDeg = o.isDeg || false;
	    this.isCyclic = o.cyclic || false;

	    this.firstImput = false;

	    let cc = this.colors;

	    //this.c[2] = this.dom( 'div', this.css.txtselect + 'letter-spacing:-1px; text-align:right; width:47px; border:1px dashed '+this.defaultBorderColor+'; color:'+ this.colors.text );
	    //this.c[2] = this.dom( 'div', this.css.txtselect + 'text-align:right; width:47px; border:1px dashed '+this.defaultBorderColor+'; color:'+ this.colors.text );
	    this.c[2] = this.dom(
	      "div",
	      this.css.txtselect +
	        "border:none; background:none; width:47px; color:" +
	        cc.text +
	        ";"
	    );
	    //this.c[2] = this.dom( 'div', this.css.txtselect + 'letter-spacing:-1px; text-align:right; width:47px; color:'+ this.colors.text );
	    this.c[3] = this.dom(
	      "div",
	      this.css.basic + " top:0; height:" + this.h + "px;"
	    );

	    this.c[4] = this.dom(
	      "div",
	      this.css.basic +
	        "background:" +
	        cc.back +
	        "; top:2px; height:" +
	        (this.h - 4) +
	        "px;"
	    );
	    this.c[5] = this.dom(
	      "div",
	      this.css.basic +
	        "left:4px; top:5px; height:" +
	        (this.h - 10) +
	        "px; background:" +
	        cc.text +
	        ";"
	    );

	    this.c[2].isNum = true;
	    //this.c[2].style.height = (this.h-4) + 'px';
	    //this.c[2].style.lineHeight = (this.h-8) + 'px';
	    this.c[2].style.height = this.h - 2 + "px";
	    this.c[2].style.lineHeight = this.h - 10 + "px";

	    if (this.model !== 0) {
	      let r1 = 4,
	        h1 = 4,
	        h2 = 8,
	        ww = this.h - 6,
	        ra = 16;

	      if (this.model === 2) {
	        r1 = 0;
	        h1 = 2;
	        h2 = 4;
	        ra = 2;
	        ww = (this.h - 6) * 0.5;
	      }

	      if (this.model === 3) this.c[5].style.visible = "none";

	      this.c[4].style.borderRadius = r1 + "px";
	      this.c[4].style.height = h2 + "px";
	      this.c[4].style.top = this.h * 0.5 - h1 + "px";
	      this.c[5].style.borderRadius = r1 * 0.5 + "px";
	      this.c[5].style.height = h1 + "px";
	      this.c[5].style.top = this.h * 0.5 - h1 * 0.5 + "px";

	      //this.c[6] = this.dom( 'div', this.css.basic + 'border-radius:'+ra+'px; margin-left:'+(-ww*0.5)+'px; border:1px solid '+cc.border+'; background:'+cc.button+'; left:4px; top:2px; height:'+(this.h-4)+'px; width:'+ww+'px;' );
	      this.c[6] = this.dom(
	        "div",
	        this.css.basic +
	          "border-radius:" +
	          ra +
	          "px; margin-left:" +
	          -ww * 0.5 +
	          "px; background:" +
	          cc.text +
	          "; left:4px; top:3px; height:" +
	          (this.h - 6) +
	          "px; width:" +
	          ww +
	          "px;"
	      );
	    }

	    this.init();
	  }

	  testZone(e) {
	    let l = this.local;
	    if (l.x === -1 && l.y === -1) return "";

	    if (l.x >= this.txl) return "text";
	    else if (l.x >= this.sa) return "scroll";
	    else return "";
	  }

	  // ----------------------
	  //   EVENTS
	  // ----------------------

	  mouseup(e) {
	    if (this.isDown) this.isDown = false;
	  }

	  mousedown(e) {
	    let name = this.testZone(e);

	    if (!name) return false;

	    if (name === "scroll") {
	      this.isDown = true;
	      this.old = this.value;
	      this.mousemove(e);
	    }

	    /*if( name === 'text' ){
	            this.setInput( this.c[2], function(){ this.validate() }.bind(this) );
	        }*/

	    return true;
	  }

	  mousemove(e) {
	    let nup = false;

	    let name = this.testZone(e);

	    if (name === "scroll") {
	      this.mode(1);
	      this.cursor("w-resize");
	      //} else if(name === 'text'){
	      //this.cursor('pointer');
	    } else {
	      this.cursor();
	    }

	    if (this.isDown) {
	      let nNormalized = (e.clientX - (this.zone.x + this.sa) - 3) / this.ww;

	      // lo mapeo al rango 0 ... 1
	      nNormalized = Math.min(1, Math.max(0, nNormalized));

	      // aplico easing
	      let nEased = Math.pow(nNormalized, this.easing); // easing

	      let nNew = nEased * this.range + this.min;
	      let nNewSlider = nNormalized * this.range + this.min;

	      this.sliderValue = this.numValue(nNewSlider);

	      let delta = nNew - this.old;

	      let steps;
	      if (delta >= this.step || delta <= this.step) {
	        steps = Math.floor(delta / this.step);
	        this.value = this.numValue(this.old + steps * this.step);
	        // value without easing applied

	        this.update(true);
	        this.old = this.value;
	      }
	      //console.log("n, normalized, value", nNew, nNormalized, this.value);
	      nup = true;
	    }

	    return nup;
	  }

	  wheel(e) {
	    let name = this.testZone(e);

	    if (name === "scroll") {
	      let v = this.value - this.step * e.delta;

	      if (v > this.max) {
	        v = this.isCyclic ? this.min : this.max;
	      } else if (v < this.min) {
	        v = this.isCyclic ? this.max : this.min;
	      }

	      this.setValue(v);
	      this.old = v;
	      this.update(true);

	      return true;
	    }

	    return false;
	  }

	  //keydown: function ( e ) { return true; },

	  // ----------------------

	  validate() {
	    let n = this.c[2].textContent;

	    if (!isNaN(n)) {
	      this.value = this.numValue(n);
	      this.update(true);
	    } else this.c[2].textContent = this.value + (this.isDeg ? "°" : "");
	  }

	  reset() {
	    //this.clearInput();
	    this.isDown = false;
	    this.mode(0);
	  }

	  mode(mode) {
	    let s = this.s;
	    let cc = this.colors;

	    switch (mode) {
	      case 0: // base
	        // s[2].border = '1px solid ' + this.colors.hide;
	        s[2].color = cc.text;
	        s[4].background = cc.back;
	        s[5].background = cc.text;
	        if (this.model !== 0) s[6].background = cc.text; //cc.button;
	        break;
	      case 1: // scroll over
	        //s[2].border = '1px dashed ' + this.colors.hide;
	        s[2].color = cc.textOver;
	        s[4].background = cc.back;
	        s[5].background = cc.textOver;
	        if (this.model !== 0) s[6].background = cc.textOver; //cc.overoff;
	        break;
	    }
	  }

	  update(up) {
	    let normalized = (this.value - this.min) / this.range;

	    let uneased =
	      this.easing == 1 ? normalized : Math.pow(normalized, 1 / this.easing);

	    let ww = Math.floor(this.ww * uneased);
	    //let ww = Math.floor(this.ww * ((this.value - this.min) / this.range));

	    if (this.model !== 3) this.s[5].width = ww + "px";
	    if (this.s[6]) this.s[6].left = this.sa + ww + 3 + "px";
	    this.c[2].textContent = this.value + (this.isDeg ? "°" : "");

	    if (up) this.send();
	  }

	  rSize() {
	    super.rSize();

	    let w = this.sb - this.sc;
	    this.ww = w - 6;

	    let tx = this.sc;
	    if (this.isUI || !this.simple) tx = this.sc + 10;
	    this.txl = this.w - tx + 2;

	    //let ty = Math.floor(this.h * 0.5) - 8;

	    let s = this.s;

	    s[2].width = this.sc - 6 + "px";
	    s[2].left = this.txl + 4 + "px";
	    //s[2].top = ty + 'px';
	    s[3].left = this.sa + "px";
	    s[3].width = w + "px";
	    s[4].left = this.sa + "px";
	    s[4].width = w + "px";
	    s[5].left = this.sa + 3 + "px";

	    this.update();
	  }
	}

	class TextInput extends Proto {

	    constructor( o = {} ) {

	        super( o );

	        this.cmode = 0;

	        this.value = o.value !== undefined ? o.value : '';
	        this.placeHolder = o.placeHolder || '';

	        this.allway = o.allway || false;
	        this.editable = o.edit !== undefined ? o.edit : true;

	        this.isDown = false;

	        let cc = this.colors;

	        // text
	        this.c[2] = this.dom( 'div', this.css.txtselect + 'top:1px; height:' + (this.h-2) + 'px; color:' + cc.text + '; background:' + cc.back + '; borderColor:' + cc.border+'; border-radius:'+this.radius+'px;' );
	        this.c[2].textContent = this.value;

	        // selection
	        this.c[3] = this.dom(  'div', this.css.txtselect + 'position:absolute; top:2px; height:' + (this.h-4) + 'px; padding:0px 0px; width:0px; color:' + cc.textSelect + '; background:' + cc.select + '; border:none; border-radius:0px;');

	        // cursor
	        this.c[4] = this.dom( 'div', this.css.basic + 'top:2px; height:' + (this.h-4) + 'px; width:0px; background:'+cc.text+';' );

	        // fake
	        this.c[5] = this.dom( 'div', this.css.txtselect + 'top:1px; height:' + (this.h-2) + 'px; border:none; justify-content: center; font-style: italic; color:'+cc.border+';' );
	        if( this.value === '' ) this.c[5].textContent = this.placeHolder;

	        


	        this.init();

	    }

	    testZone ( e ) {

	        let l = this.local;
	        if( l.x === -1 && l.y === -1 ) return '';
	        if( l.x >= this.sa ) return 'text';
	        return '';

	    }

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mouseup ( e ) {

	        if(!this.editable) return;

	        if( this.isDown ){
	            this.isDown = false;
	            return this.mousemove( e );
	        }

	        return false;

	    }

	    mousedown ( e ) {

	        if(!this.editable) return;

	        let name = this.testZone( e );

	        if( !this.isDown ){
	            this.isDown = true;
	            if( name === 'text' ) this.setInput( this.c[2] );
	            return this.mousemove( e );
	        }

	        return false;

	    }

	    mousemove ( e ) {

	        if(!this.editable) return;

	        let name = this.testZone( e );

	        //let l = this.local;
	        //if( l.x === -1 && l.y === -1 ){ return;}

	        //if( l.x >= this.sa ) this.cursor('text');
	        //else this.cursor();

	        let x = 0;

	        if( name === 'text' ) this.cursor('text');
	        else this.cursor();

	        if( this.isDown ) x = e.clientX - this.zone.x;

	        return this.upInput( x - this.sa -3, this.isDown );

	    }

	    update ( ) {

	        this.c[2].textContent = this.value;
	        
	    }

	    // ----------------------

	    reset () {

	        this.cursor();

	    }

	    // ----------------------
	    //   INPUT
	    // ----------------------

	    select ( c, e, w, t ) {

	        let s = this.s;
	        let d = this.sa + 5;
	        s[4].width = '1px';
	        s[4].left = ( d + e ) + 'px';

	        s[3].left =  ( d + e )  + 'px';
	        s[3].width =  w  + 'px';
	        this.c[3].innerHTML = t;
	    
	    }

	    unselect () {

	        let s = this.s;
	        if(!s) return;
	        s[3].width =  0  + 'px';
	        this.c[3].innerHTML = 't';
	        s[4].width = 0 + 'px';

	    }

	    validate ( force ) {

	        if( this.allway ) force = true; 

	        this.value = this.c[2].textContent;

	        if(this.value !== '') this.c[5].textContent = '';
	        else this.c[5].textContent = this.placeHolder;

	        if( !force ) return;

	        this.send();

	    }

	    // ----------------------
	    //   REZISE
	    // ----------------------

	    rSize () {

	        super.rSize();

	        let s = this.s;
	        s[2].left = this.sa + 'px';
	        s[2].width = this.sb + 'px';

	        s[5].left = this.sa + 'px';
	        s[5].width = this.sb + 'px';
	     
	    }


	}

	class Title extends Proto {

	    constructor( o = {} ) {

	        super( o );

	        let prefix = o.prefix || '';

	        this.c[2] = this.dom( 'div', this.css.txt + 'justify-content:right; width:60px; line-height:'+ (this.h-8) + 'px; color:' + this.colors.text );

	        if( this.h === 31 ){

	            this.s[0].height = this.h + 'px';
	            this.s[1].top = 8 + 'px';
	            this.c[2].style.top = 8 + 'px';

	        }

	        let s = this.s;

	        s[1].justifyContent = o.align || 'left';
	        //s[1].textAlign = o.align || 'left';
	        s[1].fontWeight = o.fontWeight || 'bold';


	        this.c[1].textContent = this.txt.substring(0,1).toUpperCase() + this.txt.substring(1).replace("-", " ");
	        this.c[2].textContent = prefix;

	        this.init();

	    }

	    text( txt ) {

	        this.c[1].textContent = txt;

	    }

	    text2( txt ) {

	        this.c[2].textContent = txt;

	    }

	    rSize() {

	        super.rSize();
	        this.s[1].width = this.w + 'px'; //- 50 + 'px';
	        this.s[2].left = this.w + 'px';//- ( 50 + 26 ) + 'px';

	    }

	    setColor( c ) {
	        this.s[1].color = c;
	        this.s[2].color = c;
	    }

	}

	class Select extends Proto {

	    constructor( o = {} ) {

	        super( o );

	        this.value = o.value || '';
	        this.isDown = false;
	        this.onActif = o.onActif || function(){};

	        //let prefix = o.prefix || '';
	        const cc = this.colors;

	        this.c[2] = this.dom( 'div', this.css.txt + this.css.button + ' top:1px; background:'+cc.button+'; height:'+(this.h-2)+'px; border:'+ cc.buttonBorder+'; border-radius:15px; width:30px; left:10px;' );
	        //this.c[2].style.color = this.fontColor;

	        this.c[3] = this.dom( 'div', this.css.txtselect + 'height:' + (this.h-4) + 'px; background:' + cc.inputBg + '; borderColor:' + cc.inputBorder+'; border-radius:'+this.radius+'px;' );
	        this.c[3].textContent = this.value;

	        let fltop = Math.floor(this.h*0.5)-7;
	        this.c[4] = this.dom( 'path', this.css.basic + 'position:absolute; width:14px; height:14px; left:5px; top:'+fltop+'px;', { d:this.svgs[ 'cursor' ], fill:cc.text, stroke:'none'});

	        this.stat = 1;
	        this.isActif = false;

	        this.init();

	    }

	    testZone ( e ) {

	        let l = this.local;
	        if( l.x === -1 && l.y === -1 ) return ''
	        if( l.x > this.sa && l.x < this.sa+30 ) return 'over'
	        return '0'

	    }

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mouseup ( e ) {
	    
	        if( this.isDown ){
	            //this.value = false;
	            this.isDown = false;
	            //this.send();
	            return this.mousemove( e )
	        }

	        return false

	    }

	    mousedown ( e ) {

	        let name = this.testZone( e );

	        if( !name ) return false

	        this.isDown = true;
	        //this.value = this.values[ name-2 ];
	        //this.send();
	        return this.mousemove( e )

	    }

	    mousemove ( e ) {

	        let up = false;
	        let name = this.testZone( e );

	        if( name === 'over' ){
	            this.cursor('pointer');
	            up = this.mode( this.isDown ? 3 : 2 );
	        } else {
	            up = this.reset();
	        }

	        return up

	    }

	    // ----------------------

	    apply ( v ) {

	        v = v || '';

	        if( v !== this.value ) {
	            this.value = v;
	            this.c[3].textContent = this.value;
	            this.send();
	        }
	        
	        this.mode(1);

	    }

	    update () {

	        this.mode( 3 );

	    }

	    mode ( n ) {

	        let change = false;
	        let cc = this.colors;

	        if( this.stat !== n ){

	            if( n===1 ) this.isActif = false;
	            if( n===3 ){ 
	                if( !this.isActif ){ this.isActif = true; n=4; this.onActif( this ); }
	                else { this.isActif = false; }
	            }

	            if( n===2 && this.isActif ) n = 4;

	            this.stat = n;

	            switch( n ){

	                case 1: this.s[ 2 ].color = cc.text; this.s[ 2 ].background = cc.button; break; // base
	                case 2: this.s[ 2 ].color = cc.textOver; this.s[ 2 ].background = cc.overoff; break; // over
	                case 3: this.s[ 2 ].color = cc.textOver; this.s[ 2 ].background = cc.action; break; // down
	                case 4: this.s[ 2 ].color = cc.textSelect; this.s[ 2 ].background = cc.action; break; // actif

	            }

	            change = true;

	        }

	        return change



	    }

	    reset () {

	        this.cursor();
	        return this.mode( this.isActif ? 4 : 1 )

	    }

	    text ( txt ) {

	        this.c[3].textContent = txt;

	    }

	    rSize () {

	        super.rSize();

	        let s = this.s;
	        s[2].left = this.sa + 'px';
	        s[3].left = (this.sa + 40) + 'px';
	        s[3].width = (this.sb - 40) + 'px';
	        s[4].left = (this.sa+8) + 'px';

	    }

	}

	class Bitmap extends Proto {

	    constructor( o = {} ) {

	        super( o );

	        this.value = o.value || '';
	        this.refTexture = o.texture || null;
	        this.img = null;

	        this.isDown = false;
	        this.neverlock = true;



	        const cc = this.colors;

	        this.c[2] = this.dom( 'div', this.css.txt + this.css.button + ' top:1px; background:'+cc.button+'; height:'+(this.h-2)+'px; border:'+cc.buttonBorder+'; border-radius:15px; width:30px; left:10px;' );

	        this.c[3] = this.dom( 'div', this.css.txtselect + 'height:' + (this.h-4) + 'px; background:' + cc.inputBg + '; borderColor:' + cc.inputBorder+'; border-radius:'+this.radius+'px;' );
	        this.c[3].textContent = this.value;

	        let fltop = Math.floor(this.h*0.5)-7;
	        this.c[4] = this.dom( 'path', this.css.basic + 'position:absolute; width:14px; height:14px; left:5px; top:'+fltop+'px;', { d:this.svgs[ 'load' ], fill:cc.text, stroke:'none'});

	        this.stat = 1;

	        this.init();

	    }

	    testZone ( e ) {

	        let l = this.local;
	        if( l.x === -1 && l.y === -1 ) return '';
	        if( l.x > this.sa && l.x < this.sa+30 ) return 'over';
	        return '0'

	    }

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mouseup ( e ) {
	    
	        if( this.isDown ){
	            //this.value = false;
	            this.isDown = false;
	            //this.send();
	            return this.mousemove( e );
	        }

	        return false;

	    }

	    mousedown ( e ) {

	        let name = this.testZone( e );

	        if( !name ) return false;

	        if( name === 'over' ){
	            this.isDown = true;
	            Files.load( { callback:this.changeBitmap.bind(this) } );

	        }

	        
	        //this.value = this.values[ name-2 ];
	        //this.send();
	        return this.mousemove( e );

	    }

	    mousemove ( e ) {

	        let up = false;

	        let name = this.testZone( e );

	        if( name === 'over' ){
	            this.cursor('pointer');
	            up = this.mode( this.isDown ? 3 : 2 );
	        } else {
	            up = this.reset();
	        }

	        return up;

	    }

	    // ----------------------

	    changeBitmap( img, fname ){

	        if( img ){
	            this.img = img;
	            this.apply( fname );
	        } else {
	            this.img = null;
	            this.apply( 'null' );
	        }
	        
	    }

	    // ----------------------

	    apply ( v ) {

	        v = v || '';

	        if( v !== this.value ) {
	            this.value = v;
	            this.c[3].textContent = this.value;

	            if( this.img !== null ){
	                if( this.objectLink !== null ) this.objectLink[ this.val ] = v;
	                if( this.callback ) this.callback( this.value, this.img, this.name );
	            }
	            
	        }
	        
	        this.mode(1);

	    }

	    update () {

	        this.mode( 3 );

	    }

	    mode ( n ) {

	        let change = false;
	        let cc = this.colors;

	        if( this.stat !== n ){

	            this.stat = n;

	            switch( n ){

	                case 1: this.s[ 2 ].color = cc.text; this.s[ 2 ].background = cc.button; break; // base
	                case 2: this.s[ 2 ].color = cc.textOver; this.s[ 2 ].background = cc.overoff; break; // over
	                case 3: this.s[ 2 ].color = cc.textOver; this.s[ 2 ].background = cc.over; break; // down
	                case 4: this.s[ 2 ].color = cc.textSelect; this.s[ 2 ].background = cc.select; break; // actif

	            }

	            change = true;

	        }

	        return change;



	    }

	    reset () {

	        this.cursor();
	        return this.mode( this.isActif ? 4 : 1 );

	    }

	    text ( txt ) {

	        this.c[3].textContent = txt;

	    }

	    rSize () {

	        super.rSize();

	        let s = this.s;
	        s[2].left = this.sa + 'px';
	        s[3].left = (this.sa + 40) + 'px';
	        s[3].width = (this.sb - 40) + 'px';
	        s[4].left = (this.sa+8) + 'px';

	    }

	}

	//import { Proto } from '../core/Proto.js';

	class Selector extends Button {

	    constructor( o = {} ) {

	        if( o.selectable === undefined ) o.selectable = true;
	        super( o );
	     
	    }

	}

	class Item extends Proto {

	    constructor( o = {} ) {

	        super( o );

	        this.p = 100;
	        this.value = this.txt;
	        this.status = 1;

	        this.itype = o.itype || 'none';
	        this.val = this.itype;

	        this.graph = this.svgs[ this.itype ];

	        let fltop = Math.floor(this.h*0.5)-7;

	        this.c[2] = this.dom( 'path', this.css.basic + 'position:absolute; width:14px; height:14px; left:5px; top:'+fltop+'px;', { d:this.graph, fill:this.colors.text, stroke:'none'});

	        this.s[1].marginLeft = 20 + 'px';

	        this.init();

	    }

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mousemove ( e ) {

	        this.cursor('pointer');

	        //up = this.modes( this.isDown ? 3 : 2, name );

	    }

	    mousedown ( e ) {

	        if( this.isUI ) this.main.resetItem();

	        this.selected( true );

	        this.send();

	        return true;

	    }

	    uiout () {

	        if( this.isSelect ) this.mode(3);
	        else this.mode(1);

	    }

	    uiover () {

	        if( this.isSelect ) this.mode(4);
	        else this.mode(2);

	    }

	    update () {
	            
	    }

	    /*rSize () {
	        
	        super.rSize();

	    }*/

	    mode ( n ) {

	        let change = false;

	        if( this.status !== n ){

	            this.status = n;
	            let s = this.s, cc = this.colors;
	        
	            switch( n ){

	                case 1: this.status = 1; s[1].color = cc.text; s[0].background = 'none'; break;
	                case 2: this.status = 2; s[1].color = cc.textOver; s[0].background = cc.back; break;
	                case 3: this.status = 3; s[1].color = cc.textSelect; s[0].background = cc.select; break;
	                case 4: this.status = 4; s[1].color = cc.textOver; s[0].background = cc.over; break;

	            }

	            change = true;

	        }

	        return change;

	    }

	    reset () {

	        this.cursor();
	       // return this.mode( 1 );

	    }

	    selected ( b ){

	        if( this.isSelect ) this.mode(1);

	        this.isSelect = b || false;

	        if( this.isSelect ) this.mode(3);
	        
	    }


	}

	class Grid extends Proto {

	    constructor( o = {} ) {

	        super( o );

	        /*this.values = o.values || [];

	        if( typeof this.values === 'string' ) this.values = [ this.values ];*/

	        this.values = [];

	        if( o.values ){
	            if( o.values instanceof Array ){
	                this.values = o.values;
	            } else if( o.values instanceof String ){
	                this.values = [ o.values ];
	            } else if( o.values instanceof Object ){
	                this.refObject = o.values;
	                for( let g in this.refObject ) this.values.push( g );
	            }
	        }

	        this.lng = this.values.length;



	        this.value = o.value || null;




	        let cc = this.colors;


	        this.isSelectable = o.selectable || false;
	        this.spaces = o.spaces || [ cc.sx, cc.sy ];
	        this.bsize = o.bsize || [ 90, this.h ];

	        this.bsizeMax = this.bsize[0];

	        this.tmp = [];
	        this.stat = [];
	        this.grid = [ 2, Math.round( this.lng * 0.5 ) ];

	        this.h = ( this.grid[1] * this.bsize[1] ) + ( this.grid[1] * this.spaces[1] ); //+ 4 - (this.mtop*2) //+ (this.spaces[1] - this.mtop);

	        this.c[1].textContent = '';
	        //this.c[2] = this.dom( 'table', this.css.basic + 'width:100%; top:'+(this.spaces[1]-2)+'px; height:auto; border-collapse:separate; border:none; border-spacing: '+(this.spaces[0]-2)+'px '+(this.spaces[1]-2)+'px;' );
	        this.c[2] = this.dom( 'table', this.css.basic + 'width:100%; border-spacing: '+(this.spaces[0]-2)+'px '+(this.spaces[1])+'px; border:none;' );

	        let n = 0, b, td, tr, sel;

	        this.res = -1;
	        this.isDown = false;
	        this.neverlock = true;

	        this.buttons = []; 
	        this.stat = [];
	        this.tmpX = [];
	        this.tmpY = [];

	        for( let i = 0; i < this.grid[1]; i++ ){

	            tr = this.c[2].insertRow();
	            tr.style.cssText = 'pointer-events:none;';
	            for( let j = 0; j < this.grid[0]; j++ ){

	                td = tr.insertCell();
	                td.style.cssText = 'pointer-events:none;';

	                if( this.values[n] ){

	                    sel = false;
	                    if( this.values[n] === this.value && this.isSelectable ) sel = true;

	                    b = document.createElement( 'div' );
	                    b.style.cssText = this.css.txt + this.css.button + 'position:static; top:1px; width:'+this.bsize[0]+'px; height:'+(this.bsize[1]-2)+'px; border:'+cc.borderSize+'px solid '+cc.border+'; left:auto; right:auto; border-radius:'+this.radius+'px;';
	                    b.style.background = sel ? cc.select : cc.button;
	                    b.style.color = sel ? cc.textSelect : cc.text;
	                    b.innerHTML = this.values[n];
	                    td.appendChild( b );

	                    this.buttons.push(b);
	                    this.stat.push(1);

	                } else {

	                    b = document.createElement( 'div' );
	                    b.style.cssText = this.css.txt + 'position:static; width:'+this.bsize[0]+'px; height:'+this.bsize[1]+'px; text-align:center; left:auto; right:auto; background:none;';
	                    td.appendChild( b );

	                }

	                if(j===0) b.style.cssText += 'float:right;';
	                else b.style.cssText += 'float:left;';
	            
	                n++;

	            }
	        }

	        this.s[0].border = 'none';

	        this.init();

	    }

	    testZone ( e ) {

	        let l = this.local;
	        if( l.x === -1 && l.y === -1 ) return -1;

	        l.y += this.mtop;
	        
	        let tx = this.tmpX;
	        let ty = this.tmpY;

	        let id = -1;
	        let c = -1;
	        let line = -1;
	        let i = this.grid[0];
	        while( i-- ){
	        	if( l.x > tx[i][0] && l.x < tx[i][1] ) c = i;
	        }

	        i = this.grid[1];
	        while( i-- ){
	            if( l.y > ty[i][0] && l.y < ty[i][1] ) line = i;
	        }

	        if(c!==-1 && line!==-1){
	            id = c + (line*2);
	            if(id>this.lng-1) id = -1;
	        }

	        return id;

	    }

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mouseup ( e ) {

	        if( !this.isDown ) return false

	        this.isDown = false;
	        if( this.res !== -1 ){
	            this.value = this.values[this.res];
	            this.send();
	        }

	        return this.mousemove( e )

	    }

	    mousedown ( e ) {

	        if( this.isDown ) return false
	        this.isDown = true;
	        return this.mousemove( e )

	    }

	    mousemove ( e ) {

	        let up = false;
	        this.res = this.testZone( e );

	        if( this.res !== -1 ){
	            this.cursor('pointer');
	            up = this.modes( this.isDown ? 3 : 2, this.res );
	        } else {
	        	up = this.reset();
	        }

	        return up;

	    }

	    // ----------------------
	    //   MODE
	    // -----------------------

	    modes ( N = 1, id = -1 ) {

	        let i = this.lng, w, n, r = false;

	        while( i-- ){

	            n = N;
	            w = this.isSelectable ? this.values[ i ] === this.value : false;
	            
	            if( i === id ){
	                if( w && n === 2 ) n = 3; 
	            } else {
	                n = 1;
	                if( w ) n = 4;
	            }

	            if( this.mode( n, i ) ) r = true;

	        }

	        return r

	    }

	    mode ( n, id ) {

	        let change = false;
	        let cc = this.colors, s = this.buttons;
	        let i = id;

	        if( this.stat[id] !== n ){

	            this.stat[id] = n;
	        
	            switch( n ){

	                case 1: s[i].style.color = cc.text; s[i].style.background = cc.button; break;
	                case 2: s[i].style.color = cc.textOver; s[i].style.background = cc.overoff; break;
	                case 3: s[i].style.color = cc.textOver; s[i].style.background = cc.over; break;
	                case 4: s[i].style.color = cc.textSelect; s[i].style.background = cc.select; break;

	            }

	            change = true;

	        }

	        return change;

	    }

	    // ----------------------

	    reset () {

	        this.res = -1;
	        this.cursor();
	        return this.modes()

	    }


	    label ( string, n ) {

	        this.buttons[n].textContent = string;

	    }

	    icon ( string, y, n ) {

	        this.buttons[n].style.padding = ( y || 0 ) +'px 0px';
	        this.buttons[n].innerHTML = string;

	    }

	    testW () {

	        let vw = this.spaces[0]*3 + this.bsizeMax*2, rz = false;
	        if( vw > this.w ) {
	            this.bsize[0] = ( this.w-(this.spaces[0]*3) ) * 0.5;
	            rz = true;
	        } else {
	            if( this.bsize[0] !== this.bsizeMax ) {
	                this.bsize[0] = this.bsizeMax;
	                rz = true;
	            }
	        }

	        if( !rz ) return;

	        let i = this.buttons.length;
	        while(i--) this.buttons[i].style.width = this.bsize[0] + 'px';

	    }

	    rSize () {

	        super.rSize();

	        this.testW();

	        let mid;

	        this.tmpX = [];
	        this.tmpY = [];

	        for( let j = 0; j < this.grid[0]; j++ ){

	            if(j===0){
	                mid = ( this.w*0.5 ) - ( this.spaces[0]*0.5 );
	                this.tmpX.push( [ mid-this.bsize[0], mid ] );
	            } else {
	                mid = ( this.w*0.5 ) + ( this.spaces[0]*0.5 );
	                this.tmpX.push( [ mid, mid+this.bsize[0] ] );
	            }

	        }

	        mid = this.spaces[1];

	        for( let i = 0; i < this.grid[1]; i++ ){

	            this.tmpY.push( [ mid, mid + this.bsize[1] ] );
	            mid += this.bsize[1] + this.spaces[1];
	            
	        }

	    }

	}

	class Pad2D extends Proto {

	    constructor( o = {} ) {

	        super( o );

	        this.autoWidth = false;
	        this.minw  = this.w;
	        this.diam = o.diam || this.w; 

	        //this.margin = 15;
	        this.pos = new V2(0,0);
	        this.maxPos = 90;

	        this.model = o.stype || 0;
	        if( o.mode !== undefined ) this.model = o.mode;

	        this.min = o.min === undefined ? -1 : o.min;
	        this.max = o.max === undefined ? 1 : o.max;

	        this.range = (this.max - this.min)*0.5;  

	        this.cmode = 0;


	        //console.log(this.range)

	        this.c[0].style.display = 'block';

	        



	        this.precision = o.precision === undefined ? 2 : o.precision;

	        /*this.bounds = {};
	        this.bounds.x1 = o.x1 || -1;
	        this.bounds.x2 = o.x2 || 1;
	        this.bounds.y1 = o.y1 || -1;
	        this.bounds.y2 = o.y2 || 1;

	        this.lerpX = this.lerp( this.margin, this.w - this.margin , this.bounds.x1, this.bounds.x2 );
	        this.lerpY = this.lerp( this.margin, this.w - this.margin , this.bounds.y1, this.bounds.y2 );

	        this.alerpX = this.lerp( this.bounds.x1, this.bounds.x2, this.margin, this.w - this.margin );
	        this.alerpY = this.lerp( this.bounds.y1, this.bounds.y2, this.margin, this.w - this.margin );*/

	        this.value = ( Array.isArray( o.value ) && o.value.length == 2 ) ? o.value : [ 0, 0 ];
	        
	        
	        this.h = o.h || this.w + 10;

	        this.c[0].style.width = this.w + 'px';

	        // Title
	        if( this.c[1] !== undefined ) { // with title

	            this.c[1].style.width = '100%';
	            this.c[1].style.justifyContent = 'center';
	            this.top = 10;
	            this.h += 10;

	        }

	        //this.top -= this.margin

	        let cc = this.colors;


	        // Value
	        this.c[2] = this.dom( 'div', this.css.txt + 'justify-content:center; top:'+ ( this.h - 20 ) + 'px; width:100%; color:' + cc.text );
	        this.c[2].textContent = this.value;

	        // Pad

	        let pad = this.getPad2d();

	        this.setSvg( pad, 'fill', cc.back, 0 );
	        this.setSvg( pad, 'fill', cc.button, 1 );
	        this.setSvg( pad, 'stroke', cc.back, 2 );
	        this.setSvg( pad, 'stroke', cc.back, 3 );
	        this.setSvg( pad, 'stroke', cc.text, 4 );

	        this.setSvg( pad, 'viewBox', '0 0 '+this.diam+' '+this.diam );
	        this.setCss( pad, { width:this.diam, height:this.diam, left:0, top:this.top });

	        this.c[3] = pad;

	        this.init();
	        this.setValue();

	    }
	    
	    testZone ( e ) {
	        
	        let l = this.local;

	        if( l.x === -1 && l.y === -1 ) return '';



	        if( l.y <= this.c[ 1 ].offsetHeight ) return 'title';
	        else if ( l.y > this.h - this.c[ 2 ].offsetHeight ) return 'text';
	        else return 'pad';

	        /*if( ( l.x >= this.margin ) && ( l.x <= this.w - this.margin ) && ( l.y >= this.top + this.margin ) && ( l.y <= this.top + this.w - this.margin ) ) {
	            return 'pad';
	        }*/
	        
	        //return '';

	    }

	    mouseup ( e ) {

	        this.isDown = false;
	        return this.mode(0);

	    }

	    mousedown ( e ) {

	        if ( this.testZone(e) === 'pad' ) {

	            this.isDown = true;
	            this.mousemove( e );
	            return this.mode(1);
	        }

	    }

	    mousemove ( e ) {

	        if( !this.isDown ) return;

	        let x = (this.w*0.5) - ( e.clientX - this.zone.x );
	        let y = (this.diam*0.5) - ( e.clientY - this.zone.y - this.ytop );
	        

	        let r = 256 / this.diam;

	        x = -(x*r);
	        y = -(y*r);

	        x = Tools.clamp( x, -this.maxPos, this.maxPos );
	        y = Tools.clamp( y, -this.maxPos, this.maxPos );

	        //let x = e.clientX - this.zone.x;
	        //let y = e.clientY - this.zone.y - this.top;

	        /*if( x < this.margin ) x = this.margin;
	        if( x > this.w - this.margin ) x = this.w - this.margin;
	        if( y < this.margin ) y = this.margin;
	        if( y > this.w - this.margin ) y = this.w - this.margin;*/

	        //console.log(x,y)

	        this.setPos( [ x , y ] );
	        
	        this.update( true );

	    }

	    mode ( mode ) {

	        if( this.cmode === mode ) return false;

	        let cc = this.colors;

	        switch( mode ){
	            case 0: // base

	                this.s[2].color = cc.text;
	                this.setSvg( this.c[3], 'fill', cc.back, 0);
	                this.setSvg( this.c[3], 'fill', cc.button, 1);
	                this.setSvg( this.c[3], 'stroke', cc.back, 2);
	                this.setSvg( this.c[3], 'stroke', cc.back, 3);
	                this.setSvg( this.c[3], 'stroke', cc.text, 4 );
	                
	            break;
	            case 1: // down

	                this.s[2].color = cc.textSelect;
	                this.setSvg( this.c[3], 'fill', cc.backoff, 0);
	                this.setSvg( this.c[3], 'fill', cc.overoff, 1);
	                this.setSvg( this.c[3], 'stroke', cc.backoff, 2);
	                this.setSvg( this.c[3], 'stroke', cc.backoff, 3);
	                this.setSvg( this.c[3], 'stroke', cc.textSelect, 4 );
	                
	            break;
	        }

	        this.cmode = mode;
	        return true;



	    }

	    update ( up ) {

	        //if( up === undefined ) up = true;
	        
	        this.c[2].textContent = this.value;

	        this.updateSVG();

	        if( up ) this.send();

	    }

	    updateSVG() {

	        if ( this.model == 1 ) {

	            this.setSvg( this.c[3], 'y1', this.pos.y, 2 );
	            this.setSvg( this.c[3], 'y2', this.pos.y, 2 );

	            this.setSvg( this.c[3], 'x1', this.pos.x, 3 );
	            this.setSvg( this.c[3], 'x2', this.pos.x, 3 );

	        }

	        this.setSvg( this.c[3], 'cx', this.pos.x, 4 );
	        this.setSvg( this.c[3], 'cy', this.pos.y, 4 );

	    }

	    setPos ( p ) {

	        //if( p === undefined ) p = [ this.w / 2, this.w / 2 ];

	        this.pos.set( p[0]+128 , p[1]+128 );

	        let r = 1/this.maxPos;

	        this.value[0] = ((p[0]*r)*this.range).toFixed( this.precision );
	        this.value[1] = ((p[1]*r)*this.range).toFixed( this.precision );

	    }

	    setValue ( v, up = false ) {

	        if( v === undefined ) v = this.value;

	        /*if ( v[0] < this.bounds.x1 ) v[0] = this.bounds.x1;
	        if ( v[0] > this.bounds.x2 ) v[0] = this.bounds.x2;
	        if ( v[1] < this.bounds.y1 ) v[1] = this.bounds.y1;
	        if ( v[1] > this.bounds.y2 ) v[1] = this.bounds.y2;*/

	        this.value[0] = Math.min( this.max, Math.max( this.min, v[0] ) ).toFixed( this.precision ) * 1;
	        this.value[1] = Math.min( this.max, Math.max( this.min, v[1] ) ).toFixed( this.precision ) * 1;

	        this.pos.set( ((this.value[0]/this.range)*this.maxPos)+128  , ((this.value[1]/this.range)*this.maxPos)+128 );

	        //console.log(this.pos)

	        this.update( up );

	    }

	    /*lerp( s1, s2, d1, d2, c = true ) {

	        let s = ( d2 - d1 ) / ( s2 - s1 );

	        return c ? ( v ) => { 
	            return ( ( v < s1 ? s1 : v > s2 ? s2 : v ) - s1 ) * s + d1
	        } : ( v ) => { 
	          return ( v - s1 ) * s + d1
	        }

	    }*/

	}

	const add = function () {

	        let a = arguments; 

	        let type, o, ref = false, n = null;

	        if( typeof a[0] === 'string' ){ 

	            type = a[0];
	            o = a[1] || {};

	        } else if ( typeof a[0] === 'object' ){ // like dat gui

	            ref = true;
	            if( a[2] === undefined ) [].push.call(a, {});
	                
	            type = a[2].type ? a[2].type : autoType( a[0][a[1]], a[2] );

	            o = a[2];
	            o.name = a[1];
	            if (o.hasOwnProperty("displayName")) o.name = o.displayName;

	            if( type === 'list' && !o.list ){ o.list = a[0][a[1]]; }
	            else o.value = a[0][a[1]];

	        }

	        let name = type.toLowerCase();

	        if( name === 'group' ){ 
	            o.add = add;
	            //o.dx = 8
	        }

	        switch( name ){

	            case 'bool': case 'boolean': n = new Bool(o); break;
	            case 'button': n = new Button(o); break;
	            case 'circular': n = new Circular(o); break;
	            case 'color': n = new Color(o); break;
	            case 'fps': n = new Fps(o); break;
	            case 'graph': n = new Graph(o); break;
	            case 'group': n = new Group(o); break;
	            case 'joystick': n = new Joystick(o); break;
	            case 'knob': n = new Knob(o); break;
	            case 'list': n = new List(o); break;
	            case 'numeric': case 'number': n = new Numeric(o); break;
	            case 'slide': n = new Slide(o); break;
	            case 'textInput': case 'string': n = new TextInput(o); break;
	            case 'title': case 'text': n = new Title(o); break;
	            case 'select': n = new Select(o); break;
	            case 'bitmap': n = new Bitmap(o); break;
	            case 'selector': n = new Selector(o); break;
	            case 'empty': case 'space': n = new Empty(o); break;
	            case 'item': n = new Item(o); break;
	            case 'grid': n = new Grid(o); break;
	            case 'pad2d': case 'pad': n = new Pad2D(o); break;

	        }

	        

	        if( n !== null ){

	            Roots.needResize = true;

	            if( ref ) n.setReferency( a[0], a[1] );
	            return n;

	        }

	};

	const autoType = function ( v, o ) {

	    let type = 'slide';

	    if( typeof v === 'boolean' ) type = 'bool'; 
	    else if( typeof v === 'string' ){ 

	        if( v.substring(0,1) === '#' ) type = 'color';
	        else type = 'string'; 

	    } else if( typeof v === 'number' ){ 

	        if( o.ctype ) type = 'color';
	        else type = 'slide';

	    } else if( typeof v === 'array' && v instanceof Array ){

	        if( typeof v[0] === 'number' ) type = 'number';
	        else if( typeof v[0] === 'string' ) type = 'list';

	    } else if( typeof v === 'object' && v instanceof Object ){

	        if( v.x !== undefined ) type = 'number';
	        else type = 'list';

	    }

	    return type

	};

	/**
	 * @author lth / https://github.com/lo-th
	 */

	class Gui {
	  constructor(o = {}) {
	    this.isGui = true;

	    this.name = "gui";

	    // for 3d
	    this.canvas = null;
	    this.screen = null;
	    this.plane = o.plane || null;

	    // color
	    if (o.config) o.colors = o.config;
	    if (o.colors) this.setConfig(o.colors);
	    else this.colors = Tools.defineColor(o);

	    //this.cleanning = false

	    // style
	    this.css = Tools.cloneCss();

	    this.isReset = true;
	    this.tmpAdd = null;
	    //this.tmpH = 0

	    this.isCanvas = o.isCanvas || false;
	    this.isCanvasOnly = false;

	    // Modified by Fedemarino
	    // option to define whether the event listeners should be added or not
	    Roots.addDOMEventListeners = o.hasOwnProperty("addDOMEventListeners")
	      ? o.addDOMEventListeners
	      : true;

	    this.callback = o.callback === undefined ? null : o.callback;

	    this.forceHeight = o.maxHeight || 0;
	    this.lockHeight = o.lockHeight || false;

	    this.isItemMode = o.itemMode !== undefined ? o.itemMode : false;

	    this.cn = "";

	    // size define
	    this.size = Tools.size;
	    if (o.p !== undefined) this.size.p = o.p;
	    if (o.w !== undefined) this.size.w = o.w;
	    if (o.h !== undefined) this.size.h = o.h;
	    if (o.s !== undefined) this.size.s = o.s;

	    this.size.h = this.size.h < 11 ? 11 : this.size.h;

	    // local mouse and zone
	    this.local = new V2().neg();
	    this.zone = { x: 0, y: 0, w: this.size.w, h: 0 };

	    // virtual mouse
	    this.mouse = new V2().neg();

	    this.h = 0;
	    //this.prevY = -1;
	    this.sw = 0;

	    this.margin = this.colors.sy;
	    this.marginDiv = Tools.isDivid(this.margin);

	    // bottom and close height
	    this.isWithClose = o.close !== undefined ? o.close : true;
	    this.bh = !this.isWithClose ? 0 : this.size.h;

	    this.autoResize = o.autoResize === undefined ? true : o.autoResize;

	    // default position
	    this.isCenter = o.center || false;
	    this.cssGui =
	      o.css !== undefined ? o.css : this.isCenter ? "" : "right:10px;";

	    this.isOpen = o.open !== undefined ? o.open : true;
	    this.isDown = false;
	    this.isScroll = false;

	    this.uis = [];
	    this.current = -1;
	    this.proto = null;
	    this.isEmpty = true;
	    this.decal = 0;
	    this.ratio = 1;
	    this.oy = 0;

	    this.isNewTarget = false;

	    let cc = this.colors;

	    this.content = Tools.dom(
	      "div",
	      this.css.basic +
	        " width:0px; height:auto; top:0px; background:" +
	        cc.content +
	        "; " +
	        this.cssGui
	    );

	    this.innerContent = Tools.dom(
	      "div",
	      this.css.basic +
	        "width:100%; top:0; left:0; height:auto; overflow:hidden;"
	    );
	    //this.innerContent = Tools.dom( 'div', this.css.basic + this.css.button + 'width:100%; top:0; left:0; height:auto; overflow:hidden;');
	    this.content.appendChild(this.innerContent);

	    //this.inner = Tools.dom( 'div', this.css.basic + 'width:100%; left:0; ')
	    this.useFlex = true;
	    let flexible = this.useFlex ? "display:flex; flex-flow: row wrap;" : ""; //' display:flex; justify-content:start; align-items:start;flex-direction: column; justify-content: center; align-items: center;';
	    this.inner = Tools.dom(
	      "div",
	      this.css.basic + flexible + "width:100%; left:0; "
	    );
	    this.innerContent.appendChild(this.inner);

	    // scroll
	    this.scrollBG = Tools.dom(
	      "div",
	      this.css.basic +
	        "right:0; top:0; width:" +
	        (this.size.s - 1) +
	        "px; height:10px; display:none; background:" +
	        cc.background +
	        ";"
	    );
	    this.content.appendChild(this.scrollBG);

	    this.scroll = Tools.dom(
	      "div",
	      this.css.basic +
	        "background:" +
	        cc.button +
	        "; right:2px; top:0; width:" +
	        (this.size.s - 4) +
	        "px; height:10px;"
	    );
	    this.scrollBG.appendChild(this.scroll);

	    // bottom button
	    this.bottomText = o.bottomText || ["open", "close"];

	    let r = cc.radius;
	    this.bottom = Tools.dom(
	      "div",
	      this.css.txt +
	        "width:100%; top:auto; bottom:0; left:0; border-bottom-right-radius:" +
	        r +
	        "px; border-bottom-left-radius:" +
	        r +
	        "px; justify-content:center; height:" +
	        this.bh +
	        "px; line-height:" +
	        (this.bh - 5) +
	        "px; color:" +
	        cc.text +
	        ";"
	    ); // border-top:1px solid '+Tools.colors.stroke+';');
	    this.content.appendChild(this.bottom);
	    this.bottom.textContent = this.isOpen
	      ? this.bottomText[1]
	      : this.bottomText[0];
	    this.bottom.style.background = cc.background;

	    //

	    this.parent = o.parent !== undefined ? o.parent : null;
	    this.parent = o.target !== undefined ? o.target : this.parent;

	    if (this.parent === null && !this.isCanvas) {
	      this.parent = document.body;
	    }

	    if (this.parent !== null) this.parent.appendChild(this.content);

	    if (this.isCanvas && this.parent === null) this.isCanvasOnly = true;

	    if (!this.isCanvasOnly) {
	      this.content.style.pointerEvents = "auto";
	    } else {
	      this.content.style.left = "0px";
	      this.content.style.right = "auto";
	      o.transition = 0;
	    }

	    // height transition
	    this.transition =
	      o.transition !== undefined ? o.transition : Tools.transition;
	    if (this.transition) setTimeout(this.addTransition.bind(this), 1000);

	    this.setWidth();

	    if (this.isCanvas) this.makeCanvas();

	    Roots.add(this);
	  }

	  triggerMouseDown(x, y) {
	    Roots.handleEvent({
	      type: "pointerdown",
	      clientX: x,
	      clientY: y,
	      delta: 0,
	      key: null,
	      keyCode: NaN,
	    });
	  }

	  triggerMouseMove() {
	    Roots.handleEvent({
	      type: "pointermove",
	      clientX: -1,
	      clientY: -1,
	      delta: 0,
	      key: null,
	      keyCode: NaN,
	    });
	  }

	  triggerMouseUp(x, y) {
	    /*

	        clientX,clientY are no used when isCanvas==true
	        */
	    Roots.handleEvent({
	      type: "pointerup",
	      clientX: x,
	      clientY: y,
	      delta: 0,
	      key: null,
	      keyCode: NaN,
	    });
	  }

	  setTop(t, h) {
	    this.content.style.top = t + "px";
	    if (h !== undefined) this.forceHeight = h;
	    this.calc();

	    Roots.needReZone = true;
	  }

	  addTransition() {
	    if (this.transition && !this.isCanvas) {
	      this.innerContent.style.transition =
	        "height " + this.transition + "s ease-out";
	      this.content.style.transition =
	        "height " + this.transition + "s ease-out";
	      this.bottom.style.transition = "top " + this.transition + "s ease-out";
	      //this.bottom.addEventListener("transitionend", Roots.resize, true);
	    }

	    let i = this.uis.length;
	    while (i--) this.uis[i].addTransition();
	  }

	  // ----------------------
	  //   CANVAS
	  // ----------------------

	  onDraw() {}

	  makeCanvas() {
	    this.canvas = document.createElementNS(
	      "http://www.w3.org/1999/xhtml",
	      "canvas"
	    );
	    this.canvas.width = this.zone.w;
	    this.canvas.height = this.forceHeight ? this.forceHeight : this.zone.h;

	    //console.log( this.canvas.width, this.canvas.height )
	  }

	  draw(force) {
	    if (this.canvas === null) return;

	    let w = this.zone.w;
	    let h = this.forceHeight ? this.forceHeight : this.zone.h;
	    Roots.toCanvas(this, w, h, force);
	  }

	  //////

	  getDom() {
	    return this.content;
	  }

	  noMouse() {
	    this.mouse.neg();
	  }

	  setMouse(uv, flip = true) {
	    if (flip)
	      this.mouse.set(
	        Math.round(uv.x * this.canvas.width),
	        this.canvas.height - Math.round(uv.y * this.canvas.height)
	      );
	    else
	      this.mouse.set(
	        Math.round(uv.x * this.canvas.width),
	        Math.round(uv.y * this.canvas.height)
	      );
	    //this.mouse.set( m.x, m.y );

	    //console.log("setMouse "+uv.x+" "+uv.y)
	  }

	  setConfig(o) {
	    // reset to default text
	    Tools.setText();
	    this.colors = Tools.defineColor(o);
	  }

	  setColors(o) {
	    for (let c in o) {
	      if (this.colors[c]) this.colors[c] = o[c];
	    }
	  }

	  setText(size, color, font, shadow) {
	    Tools.setText(size, color, font, shadow);
	  }

	  hide(b) {
	    this.content.style.visibility = b ? "hidden" : "visible";
	  }

	  display(v = false) {
	    this.content.style.visibility = v ? "visible" : "hidden";
	  }

	  onChange(f) {
	    this.callback = f || null;
	    return this;
	  }

	  // ----------------------
	  //   STYLES
	  // ----------------------

	  mode(n) {
	    let needChange = false;
	    let cc = this.colors;

	    if (n !== this.cn) {
	      this.cn = n;

	      switch (n) {
	        case "def":
	          Roots.cursor();
	          this.scroll.style.background = cc.button;
	          this.bottom.style.background = cc.background;
	          this.bottom.style.color = cc.text;
	          break;

	        //case 'scrollDef': this.scroll.style.background = this.colors.scroll; break;
	        case "scrollOver":
	          Roots.cursor("ns-resize");
	          this.scroll.style.background = cc.select;
	          break;
	        case "scrollDown":
	          this.scroll.style.background = cc.select;
	          break;

	        //case 'bottomDef': this.bottom.style.background = this.colors.background; break;
	        case "bottomOver":
	          Roots.cursor("pointer");
	          this.bottom.style.background = cc.backgroundOver;
	          this.bottom.style.color = cc.textOver;
	          break;
	        //case 'bottomDown': this.bottom.style.background = this.colors.select; this.bottom.style.color = '#000'; break;
	      }

	      needChange = true;
	    }

	    return needChange;
	  }

	  // ----------------------
	  //   TARGET
	  // ----------------------

	  clearTarget() {
	    if (this.current === -1) return false;
	    if (this.proto.s) {
	      // if no s target is delete !!
	      this.proto.uiout();
	      this.proto.reset();
	    }

	    this.proto = null;
	    this.current = -1;

	    ///console.log(this.isDown)//if(this.isDown)Roots.clearInput();

	    Roots.cursor();
	    return true;
	  }

	  // ----------------------
	  //   ZONE TEST
	  // ----------------------

	  testZone(e) {
	    let l = this.local;
	    if (l.x === -1 && l.y === -1) return "";

	    this.isReset = false;

	    let name = "";

	    let s = this.isScroll ? this.zone.w - this.size.s : this.zone.w;

	    if (l.y > this.zone.h - this.bh && l.y < this.zone.h) name = "bottom";
	    else name = l.x > s ? "scroll" : "content";

	    return name;
	  }

	  // ----------------------
	  //   EVENTS
	  // ----------------------

	  handleEvent(e) {
	    //if( this.cleanning ) return

	    //console.log("Gui.handleEvent")
	    //console.log(e);
	    let type = e.type;

	    let change = false;
	    let protoChange = false;

	    let name = this.testZone(e);

	    if (type === "mouseup" && this.isDown) this.isDown = false;
	    if (type === "mousedown" && !this.isDown) this.isDown = true;

	    if (this.isDown && this.isNewTarget) {
	      Roots.clearInput();
	      this.isNewTarget = false;
	    }

	    if (!name) return;

	    switch (name) {
	      case "content":
	        e.clientY = this.isScroll ? e.clientY + this.decal : e.clientY;

	        if (Roots.isMobile && type === "mousedown") this.getNext(e, change);

	        if (this.proto) protoChange = this.proto.handleEvent(e);

	        if (type === "mousemove") change = this.mode("def");
	        if (type === "wheel" && !protoChange && this.isScroll)
	          change = this.onWheel(e);

	        if (!Roots.lock) {
	          this.getNext(e, change);
	        }

	        break;
	      case "bottom":
	        this.clearTarget();
	        if (type === "mousemove") change = this.mode("bottomOver");
	        if (type === "mousedown") {
	          this.isOpen = this.isOpen ? false : true;
	          this.bottom.textContent = this.isOpen
	            ? this.bottomText[1]
	            : this.bottomText[0];
	          //this.setHeight();
	          this.calc();
	          this.mode("def");
	          change = true;
	        }

	        break;
	      case "scroll":
	        this.clearTarget();
	        if (type === "mousemove") change = this.mode("scrollOver");
	        if (type === "mousedown") change = this.mode("scrollDown");
	        if (type === "wheel") change = this.onWheel(e);
	        if (this.isDown) this.update(e.clientY - this.zone.y - this.sh * 0.5);

	        break;
	    }

	    if (this.isDown) change = true;
	    if (protoChange) change = true;

	    if (type === "keyup") change = true;
	    if (type === "keydown") change = true;

	    if (change) this.draw();
	  }

	  getNext(e, change) {
	    let next = Roots.findTarget(this.uis, e);

	    if (next !== this.current) {
	      this.clearTarget();
	      this.current = next;
	      this.isNewTarget = true;
	    }

	    if (next !== -1) {
	      this.proto = this.uis[this.current];
	      this.proto.uiover();
	    }
	  }

	  onWheel(e) {
	    this.oy += 20 * e.delta;
	    this.update(this.oy);
	    return true;
	  }

	  // ----------------------
	  //   RESET
	  // ----------------------

	  reset(force) {
	    if (this.isReset) return;

	    //this.resetItem();

	    this.mouse.neg();
	    this.isDown = false;

	    //Roots.clearInput();
	    let r = this.mode("def");
	    let r2 = this.clearTarget();

	    if (r || r2) this.draw(true);

	    this.isReset = true;

	    //Roots.lock = false;
	  }

	  // ----------------------
	  //   ADD NODE
	  // ----------------------

	  add() {
	    //if(this.cleanning) this.cleanning = false

	    let a = arguments;
	    let ontop = false;

	    if (typeof a[1] === "object") {
	      a[1].isUI = true;
	      a[1].main = this;

	      ontop = a[1].ontop ? a[1].ontop : false;
	    } else if (typeof a[1] === "string") {
	      if (a[2] === undefined) [].push.call(a, { isUI: true, main: this });
	      else {
	        a[2].isUI = true;
	        a[2].main = this;
	        //ontop = a[1].ontop ? a[1].ontop : false;
	        ontop = a[2].ontop ? a[2].ontop : false;
	      }
	    }

	    let u = add.apply(this, a);

	    if (u === null) return;

	    if (ontop) this.uis.unshift(u);
	    else this.uis.push(u);

	    this.calc();

	    this.isEmpty = false;

	    return u;
	  }

	  // remove one node

	  remove(n) {
	    if (n.dispose) n.dispose();
	  }

	  // call after uis clear

	  clearOne(n) {
	    let id = this.uis.indexOf(n);
	    if (id !== -1) {
	      //this.calc( - (this.uis[ id ].h + 1 ) );
	      this.inner.removeChild(this.uis[id].c[0]);
	      this.uis.splice(id, 1);
	      this.calc();
	    }
	  }

	  // clear all gui

	  empty() {
	    //this.cleanning = true

	    //this.close();

	    let i = this.uis.length,
	      item;

	    while (i--) {
	      item = this.uis.pop();
	      this.inner.removeChild(item.c[0]);
	      item.dispose();
	    }

	    this.uis = [];
	    this.isEmpty = true;
	    this.calc();
	  }

	  clear() {
	    this.empty();
	  }

	  clear2() {
	    setTimeout(this.empty.bind(this), 0);
	  }

	  dispose() {
	    this.clear();
	    if (this.parent !== null) this.parent.removeChild(this.content);
	    Roots.remove(this);
	  }

	  // ----------------------
	  //   ITEMS SPECIAL
	  // ----------------------

	  resetItem() {
	    if (!this.isItemMode) return;

	    let i = this.uis.length;
	    while (i--) this.uis[i].selected();
	  }

	  setItem(name) {
	    if (!this.isItemMode) return;

	    name = name || "";
	    this.resetItem();

	    if (!name) {
	      this.update(0);
	      return;
	    }

	    let i = this.uis.length;
	    while (i--) {
	      if (this.uis[i].value === name) {
	        this.uis[i].selected(true);
	        if (this.isScroll)
	          this.update(i * (this.uis[i].h + this.margin) * this.ratio);
	      }
	    }
	  }

	  // ----------------------
	  //   SCROLL
	  // ----------------------

	  upScroll(b) {
	    this.sw = b ? this.size.s : 0;
	    this.oy = b ? this.oy : 0;
	    this.scrollBG.style.display = b ? "block" : "none";

	    if (b) {
	      this.total = this.h;

	      this.maxView = this.maxHeight;

	      this.ratio = this.maxView / this.total;
	      this.sh = this.maxView * this.ratio;

	      this.range = this.maxView - this.sh;

	      this.oy = Tools.clamp(this.oy, 0, this.range);

	      this.scrollBG.style.height = this.maxView + "px";
	      this.scroll.style.height = this.sh + "px";
	    }

	    this.setItemWidth(this.zone.w - this.sw);
	    this.update(this.oy);
	  }

	  update(y) {
	    y = Tools.clamp(y, 0, this.range);

	    this.decal = Math.floor(y / this.ratio);
	    this.inner.style.top = -this.decal + "px";
	    this.scroll.style.top = Math.floor(y) + "px";
	    this.oy = y;
	  }

	  // ----------------------
	  //   RESIZE FUNCTION
	  // ----------------------

	  calcUis() {
	    return Roots.calcUis(this.uis, this.zone, this.zone.y);
	  }

	  calc() {
	    clearTimeout(this.tmp);
	    this.tmp = setTimeout(this.setHeight.bind(this), 10);
	  }

	  setHeight() {
	    if (this.tmp) clearTimeout(this.tmp);

	    this.zone.h = this.bh;
	    this.isScroll = false;

	    if (this.isOpen) {
	      this.h = this.calcUis();

	      let hhh = this.forceHeight
	        ? this.forceHeight + this.zone.y
	        : window.innerHeight;

	      this.maxHeight = hhh - this.zone.y - this.bh;

	      let diff = this.h - this.maxHeight;

	      if (diff > 1) {
	        this.isScroll = true;
	        this.zone.h = this.maxHeight + this.bh;
	      } else {
	        this.zone.h = this.h + this.bh;
	      }
	    }

	    this.upScroll(this.isScroll);

	    this.innerContent.style.height = this.zone.h - this.bh + "px";
	    this.content.style.height = this.zone.h + "px";
	    this.bottom.style.top = this.zone.h - this.bh + "px";

	    if (this.forceHeight && this.lockHeight)
	      this.content.style.height = this.forceHeight + "px";
	    if (this.isCanvas) this.draw(true);
	  }

	  rezone() {
	    Roots.needReZone = true;
	  }

	  setWidth(w) {
	    if (w) this.zone.w = w;

	    this.zone.w = Math.floor(this.zone.w);
	    this.content.style.width = this.zone.w + "px";
	    if (this.isCenter)
	      this.content.style.marginLeft = -Math.floor(this.zone.w * 0.5) + "px";
	    this.setItemWidth(this.zone.w - this.sw);
	  }

	  setItemWidth(w) {
	    let i = this.uis.length;
	    while (i--) {
	      this.uis[i].setSize(w);
	      this.uis[i].rSize();
	    }
	  }
	}

	exports.Files = Files;
	exports.Gui = Gui;
	exports.REVISION = REVISION;
	exports.Tools = Tools;
	exports.add = add;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWlsLmpzIiwic291cmNlcyI6WyIuLi9zcmMvY29yZS9Sb290cy5qcyIsIi4uL3NyYy9jb3JlL1Rvb2xzLmpzIiwiLi4vc3JjL2NvcmUvRmlsZXMuanMiLCIuLi9zcmMvY29yZS9WMi5qcyIsIi4uL3NyYy9jb3JlL1Byb3RvLmpzIiwiLi4vc3JjL3Byb3RvL0Jvb2wuanMiLCIuLi9zcmMvcHJvdG8vQnV0dG9uLmpzIiwiLi4vc3JjL3Byb3RvL0NpcmN1bGFyLmpzIiwiLi4vc3JjL3Byb3RvL0NvbG9yLmpzIiwiLi4vc3JjL3Byb3RvL0Zwcy5qcyIsIi4uL3NyYy9wcm90by9HcmFwaC5qcyIsIi4uL3NyYy9wcm90by9FbXB0eS5qcyIsIi4uL3NyYy9wcm90by9Hcm91cC5qcyIsIi4uL3NyYy9wcm90by9Kb3lzdGljay5qcyIsIi4uL3NyYy9wcm90by9Lbm9iLmpzIiwiLi4vc3JjL3Byb3RvL0xpc3QuanMiLCIuLi9zcmMvcHJvdG8vTnVtZXJpYy5qcyIsIi4uL3NyYy9wcm90by9TbGlkZS5qcyIsIi4uL3NyYy9wcm90by9UZXh0SW5wdXQuanMiLCIuLi9zcmMvcHJvdG8vVGl0bGUuanMiLCIuLi9zcmMvcHJvdG8vU2VsZWN0LmpzIiwiLi4vc3JjL3Byb3RvL0JpdG1hcC5qcyIsIi4uL3NyYy9wcm90by9TZWxlY3Rvci5qcyIsIi4uL3NyYy9wcm90by9JdGVtLmpzIiwiLi4vc3JjL3Byb3RvL0dyaWQuanMiLCIuLi9zcmMvcHJvdG8vUGFkMkQuanMiLCIuLi9zcmMvY29yZS9hZGQuanMiLCIuLi9zcmMvY29yZS9HdWkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBhdXRob3IgbHRoIC8gaHR0cHM6Ly9naXRodWIuY29tL2xvLXRoXHJcbiAqL1xyXG5cclxuZXhwb3J0IGNvbnN0IFJFVklTSU9OID0gXCI0LjMuMFwiO1xyXG5cclxuLy8gSU5URU5BTCBGVU5DVElPTlxyXG5cclxuY29uc3QgUiA9IHtcclxuICB1aTogW10sXHJcblxyXG4gIGRvbTogbnVsbCxcclxuXHJcbiAgSUQ6IG51bGwsXHJcbiAgbG9jazogZmFsc2UsXHJcbiAgd2xvY2s6IGZhbHNlLFxyXG4gIGN1cnJlbnQ6IC0xLFxyXG5cclxuICBuZWVkUmVab25lOiB0cnVlLFxyXG4gIG5lZWRSZXNpemU6IGZhbHNlLFxyXG4gIGZvcmNlWm9uZTogZmFsc2UsXHJcbiAgaXNFdmVudHNJbml0OiBmYWxzZSxcclxuICBpc0xlYXZlOiBmYWxzZSxcclxuICBhZGRET01FdmVudExpc3RlbmVyczogdHJ1ZSxcclxuXHJcbiAgZG93blRpbWU6IDAsXHJcbiAgcHJldlRpbWU6IDAsXHJcblxyXG4gIC8vcHJldkRlZmF1bHQ6IFsnY29udGV4dG1lbnUnLCAnd2hlZWwnXSxcclxuICBwcmV2RGVmYXVsdDogW1wiY29udGV4dG1lbnVcIl0sXHJcbiAgcG9pbnRlckV2ZW50OiBbXCJwb2ludGVyZG93blwiLCBcInBvaW50ZXJtb3ZlXCIsIFwicG9pbnRlcnVwXCJdLFxyXG4gIGV2ZW50T3V0OiBbXCJwb2ludGVyY2FuY2VsXCIsIFwicG9pbnRlcm91dFwiLCBcInBvaW50ZXJsZWF2ZVwiXSxcclxuXHJcbiAgeG1sc2VyaWFsaXplcjogbnVsbCxcclxuICB0bXBUaW1lOiBudWxsLFxyXG4gIHRtcEltYWdlOiBudWxsLFxyXG5cclxuICBvbGRDdXJzb3I6IFwiYXV0b1wiLFxyXG5cclxuICBpbnB1dDogbnVsbCxcclxuICBwYXJlbnQ6IG51bGwsXHJcbiAgZmlyc3RJbXB1dDogdHJ1ZSxcclxuXHJcbiAgaGlkZGVuSW1wdXQ6IG51bGwsXHJcbiAgaGlkZGVuU2l6ZXI6IG51bGwsXHJcbiAgaGFzRm9jdXM6IGZhbHNlLFxyXG4gIHN0YXJ0SW5wdXQ6IGZhbHNlLFxyXG4gIGlucHV0UmFuZ2U6IFswLCAwXSxcclxuICBjdXJzb3JJZDogMCxcclxuICBzdHI6IFwiXCIsXHJcbiAgcG9zOiAwLFxyXG4gIHN0YXJ0WDogLTEsXHJcbiAgbW92ZVg6IC0xLFxyXG5cclxuICBkZWJ1Z0lucHV0OiBmYWxzZSxcclxuXHJcbiAgaXNMb29wOiBmYWxzZSxcclxuICBsaXN0ZW5zOiBbXSxcclxuXHJcbiAgZToge1xyXG4gICAgdHlwZTogbnVsbCxcclxuICAgIGNsaWVudFg6IDAsXHJcbiAgICBjbGllbnRZOiAwLFxyXG4gICAga2V5Q29kZTogTmFOLFxyXG4gICAga2V5OiBudWxsLFxyXG4gICAgZGVsdGE6IDAsXHJcbiAgfSxcclxuXHJcbiAgaXNNb2JpbGU6IGZhbHNlLFxyXG5cclxuICBub3c6IG51bGwsXHJcbiAgbmVlZHNVcGRhdGU6IGZhbHNlLFxyXG5cclxuICBnZXRUaW1lOiBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gc2VsZi5wZXJmb3JtYW5jZSAmJiBzZWxmLnBlcmZvcm1hbmNlLm5vd1xyXG4gICAgICA/IHNlbGYucGVyZm9ybWFuY2Uubm93LmJpbmQocGVyZm9ybWFuY2UpXHJcbiAgICAgIDogRGF0ZS5ub3c7XHJcbiAgfSxcclxuXHJcbiAgYWRkOiBmdW5jdGlvbiAobykge1xyXG4gICAgLy8gUi51aVswXSBpcyBkZSBHVUkgb2JqZWN0IHRoYXQgaXMgYWRkZWQgZmlyc3QgYnkgdGhlIGNvbnN0cnVjdG9yXHJcbiAgICBSLnVpLnB1c2gobyk7XHJcbiAgICBSLmdldFpvbmUobyk7XHJcblxyXG4gICAgaWYgKCFSLmlzRXZlbnRzSW5pdCkgUi5pbml0RXZlbnRzKCk7XHJcbiAgfSxcclxuXHJcbiAgdGVzdE1vYmlsZTogZnVuY3Rpb24gKCkge1xyXG4gICAgbGV0IG4gPSBuYXZpZ2F0b3IudXNlckFnZW50O1xyXG4gICAgaWYgKFxyXG4gICAgICBuLm1hdGNoKC9BbmRyb2lkL2kpIHx8XHJcbiAgICAgIG4ubWF0Y2goL3dlYk9TL2kpIHx8XHJcbiAgICAgIG4ubWF0Y2goL2lQaG9uZS9pKSB8fFxyXG4gICAgICBuLm1hdGNoKC9pUGFkL2kpIHx8XHJcbiAgICAgIG4ubWF0Y2goL2lQb2QvaSkgfHxcclxuICAgICAgbi5tYXRjaCgvQmxhY2tCZXJyeS9pKSB8fFxyXG4gICAgICBuLm1hdGNoKC9XaW5kb3dzIFBob25lL2kpXHJcbiAgICApXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgZWxzZSByZXR1cm4gZmFsc2U7XHJcbiAgfSxcclxuXHJcbiAgcmVtb3ZlOiBmdW5jdGlvbiAobykge1xyXG4gICAgbGV0IGkgPSBSLnVpLmluZGV4T2Yobyk7XHJcblxyXG4gICAgaWYgKGkgIT09IC0xKSB7XHJcbiAgICAgIFIucmVtb3ZlTGlzdGVuKG8pO1xyXG4gICAgICBSLnVpLnNwbGljZShpLCAxKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoUi51aS5sZW5ndGggPT09IDApIHtcclxuICAgICAgUi5yZW1vdmVFdmVudHMoKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gICBFVkVOVFNcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGluaXRFdmVudHM6IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmIChSLmlzRXZlbnRzSW5pdCkgcmV0dXJuO1xyXG5cclxuICAgIGxldCBkb20gPSBkb2N1bWVudC5ib2R5O1xyXG5cclxuICAgIFIuaXNNb2JpbGUgPSBSLnRlc3RNb2JpbGUoKTtcclxuICAgIFIubm93ID0gUi5nZXRUaW1lKCk7XHJcblxyXG4gICAgaWYgKCFSLmlzTW9iaWxlKSB7XHJcbiAgICAgIGRvbS5hZGRFdmVudExpc3RlbmVyKFwid2hlZWxcIiwgUiwgeyBwYXNzaXZlOiBmYWxzZSB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRvbS5zdHlsZS50b3VjaEFjdGlvbiA9IFwibm9uZVwiO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnNvbGUubG9nKFwiUi5hZGRET01FdmVudExpc3RlbmVycyBcIiArIFIuYWRkRE9NRXZlbnRMaXN0ZW5lcnMpO1xyXG4gICAgaWYgKFIuYWRkRE9NRXZlbnRMaXN0ZW5lcnMpIHtcclxuICAgICAgZG9tLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVyY2FuY2VsXCIsIFIpO1xyXG4gICAgICBkb20uYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJsZWF2ZVwiLCBSKTtcclxuICAgICAgLy9kb20uYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJvdXQnLCBSIClcclxuXHJcbiAgICAgIGRvbS5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcm1vdmVcIiwgUik7XHJcbiAgICAgIGRvbS5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcmRvd25cIiwgUik7XHJcbiAgICAgIGRvbS5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcnVwXCIsIFIpO1xyXG5cclxuICAgICAgZG9tLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIFIsIGZhbHNlKTtcclxuICAgICAgZG9tLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBSLCBmYWxzZSk7XHJcbiAgICB9XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBSLnJlc2l6ZSwgZmFsc2UpO1xyXG5cclxuICAgIC8vd2luZG93Lm9uYmx1ciA9IFIub3V0O1xyXG4gICAgLy93aW5kb3cub25mb2N1cyA9IFIuaW47XHJcblxyXG4gICAgUi5pc0V2ZW50c0luaXQgPSB0cnVlO1xyXG4gICAgUi5kb20gPSBkb207XHJcbiAgfSxcclxuXHJcbiAgcmVtb3ZlRXZlbnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoIVIuaXNFdmVudHNJbml0KSByZXR1cm47XHJcblxyXG4gICAgbGV0IGRvbSA9IGRvY3VtZW50LmJvZHk7XHJcblxyXG4gICAgaWYgKCFSLmlzTW9iaWxlKSB7XHJcbiAgICAgIGRvbS5yZW1vdmVFdmVudExpc3RlbmVyKFwid2hlZWxcIiwgUik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKFIuYWRkRE9NRXZlbnRMaXN0ZW5lcnMpIHtcclxuICAgICAgZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJwb2ludGVyY2FuY2VsXCIsIFIpO1xyXG4gICAgICBkb20ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJsZWF2ZVwiLCBSKTtcclxuICAgICAgLy9kb20ucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJvdXQnLCBSICk7XHJcblxyXG4gICAgICBkb20ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJtb3ZlXCIsIFIpO1xyXG4gICAgICBkb20ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJkb3duXCIsIFIpO1xyXG4gICAgICBkb20ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJ1cFwiLCBSKTtcclxuXHJcbiAgICAgIGRvbS5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBSKTtcclxuICAgICAgZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBSKTtcclxuICAgIH1cclxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIFIucmVzaXplKTtcclxuXHJcbiAgICBSLmlzRXZlbnRzSW5pdCA9IGZhbHNlO1xyXG4gIH0sXHJcblxyXG4gIHJlc2l6ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgbGV0IGkgPSBSLnVpLmxlbmd0aCxcclxuICAgICAgdTtcclxuXHJcbiAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgIHUgPSBSLnVpW2ldO1xyXG4gICAgICBpZiAodS5pc0d1aSAmJiAhdS5pc0NhbnZhc09ubHkgJiYgdS5hdXRvUmVzaXplKSB1LmNhbGMoKTtcclxuICAgIH1cclxuXHJcbiAgICBSLm5lZWRSZVpvbmUgPSB0cnVlO1xyXG4gICAgUi5uZWVkUmVzaXplID0gZmFsc2U7XHJcbiAgfSxcclxuXHJcbiAgb3V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcImltIGFtIG91dFwiKTtcclxuICAgIFIuY2xlYXJPbGRJRCgpO1xyXG4gIH0sXHJcblxyXG4gIGluOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcImltIGFtIGluXCIpO1xyXG4gICAgLy8gIFIuY2xlYXJPbGRJRCgpO1xyXG4gIH0sXHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyAgIEhBTkRMRSBFVkVOVFNcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGZha2VVcDogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5oYW5kbGVFdmVudCh7IHR5cGU6IFwicG9pbnRlcnVwXCIgfSk7XHJcbiAgfSxcclxuXHJcbiAgaGFuZGxlRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgLy9jb25zb2xlLmxvZyhcIlJvb3RzLmhhbmRsZUV2ZW50IFwiK2V2ZW50LnR5cGUpXHJcbiAgICAvL2lmKCFldmVudC50eXBlKSByZXR1cm47XHJcblxyXG4gICAgaWYgKFIucHJldkRlZmF1bHQuaW5kZXhPZihldmVudC50eXBlKSAhPT0gLTEpIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgaWYgKFIubmVlZFJlc2l6ZSkgUi5yZXNpemUoKTtcclxuXHJcbiAgICBSLmZpbmRab25lKFIuZm9yY2Vab25lKTtcclxuXHJcbiAgICBsZXQgZSA9IFIuZTtcclxuICAgIGxldCBsZWF2ZSA9IGZhbHNlO1xyXG5cclxuICAgIGlmIChldmVudC50eXBlID09PSBcImtleWRvd25cIikgUi5rZXlkb3duKGV2ZW50KTtcclxuICAgIGlmIChldmVudC50eXBlID09PSBcImtleXVwXCIpIFIua2V5dXAoZXZlbnQpO1xyXG5cclxuICAgIGlmIChldmVudC50eXBlID09PSBcIndoZWVsXCIpIGUuZGVsdGEgPSBldmVudC5kZWx0YVkgPiAwID8gMSA6IC0xO1xyXG4gICAgZWxzZSBlLmRlbHRhID0gMDtcclxuXHJcbiAgICBsZXQgcHR5cGUgPSBldmVudC5wb2ludGVyVHlwZTsgLy8gbW91c2UsIHBlbiwgdG91Y2hcclxuXHJcbiAgICBlLmNsaWVudFggPSAocHR5cGUgPT09IFwidG91Y2hcIiA/IGV2ZW50LnBhZ2VYIDogZXZlbnQuY2xpZW50WCkgfHwgMDtcclxuICAgIGUuY2xpZW50WSA9IChwdHlwZSA9PT0gXCJ0b3VjaFwiID8gZXZlbnQucGFnZVkgOiBldmVudC5jbGllbnRZKSB8fCAwO1xyXG5cclxuICAgIGUudHlwZSA9IGV2ZW50LnR5cGU7XHJcblxyXG4gICAgaWYgKFIuZXZlbnRPdXQuaW5kZXhPZihldmVudC50eXBlKSAhPT0gLTEpIHtcclxuICAgICAgbGVhdmUgPSB0cnVlO1xyXG4gICAgICBlLnR5cGUgPSBcIm1vdXNldXBcIjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gXCJwb2ludGVybGVhdmVcIikgUi5pc0xlYXZlID0gdHJ1ZTtcclxuXHJcbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gXCJwb2ludGVyZG93blwiKSBlLnR5cGUgPSBcIm1vdXNlZG93blwiO1xyXG4gICAgaWYgKGV2ZW50LnR5cGUgPT09IFwicG9pbnRlcnVwXCIpIGUudHlwZSA9IFwibW91c2V1cFwiO1xyXG4gICAgaWYgKGV2ZW50LnR5cGUgPT09IFwicG9pbnRlcm1vdmVcIikge1xyXG4gICAgICBpZiAoUi5pc0xlYXZlKSB7XHJcbiAgICAgICAgLy8gaWYgdXNlciByZXNpemUgb3V0c2lkZSB0aGlzIGRvY3VtZW50XHJcbiAgICAgICAgUi5pc0xlYXZlID0gZmFsc2U7XHJcbiAgICAgICAgUi5yZXNpemUoKTtcclxuICAgICAgfVxyXG4gICAgICBlLnR5cGUgPSBcIm1vdXNlbW92ZVwiO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGRvdWJsZSBjbGljayB0ZXN0XHJcbiAgICBpZiAoZS50eXBlID09PSBcIm1vdXNlZG93blwiKSB7XHJcbiAgICAgIFIuZG93blRpbWUgPSBSLm5vdygpO1xyXG4gICAgICBsZXQgdGltZSA9IFIuZG93blRpbWUgLSBSLnByZXZUaW1lO1xyXG5cclxuICAgICAgLy8gZG91YmxlIGNsaWNrIG9uIGltcHV0XHJcbiAgICAgIGlmICh0aW1lIDwgMjAwKSB7XHJcbiAgICAgICAgUi5zZWxlY3RBbGwoKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIFIucHJldlRpbWUgPSBSLmRvd25UaW1lO1xyXG4gICAgICBSLmZvcmNlWm9uZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGZvciBpbXB1dFxyXG4gICAgaWYgKGUudHlwZSA9PT0gXCJtb3VzZWRvd25cIikgUi5jbGVhcklucHV0KCk7XHJcblxyXG4gICAgLy8gbW91c2UgbG9ja1xyXG4gICAgaWYgKGUudHlwZSA9PT0gXCJtb3VzZWRvd25cIikgUi5sb2NrID0gdHJ1ZTtcclxuICAgIGlmIChlLnR5cGUgPT09IFwibW91c2V1cFwiKSBSLmxvY2sgPSBmYWxzZTtcclxuXHJcbiAgICAvL2lmKCBSLmN1cnJlbnQgIT09IG51bGwgJiYgUi5jdXJyZW50Lm5ldmVybG9jayApIFIubG9jayA9IGZhbHNlO1xyXG5cclxuICAgIC8qaWYoIGUudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uID09PSAxKXtcclxuICAgICAgICAgICAgUi5jdXJzb3IoKVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSovXHJcblxyXG4gICAgLy9jb25zb2xlLmxvZyhcInA0IFwiK1IuaXNNb2JpbGUrXCIgXCIrZS50eXBlK1wiIFwiK1IubG9jaylcclxuXHJcbiAgICBpZiAoUi5pc01vYmlsZSAmJiBlLnR5cGUgPT09IFwibW91c2Vkb3duXCIpIFIuZmluZElEKGUpO1xyXG4gICAgaWYgKGUudHlwZSA9PT0gXCJtb3VzZW1vdmVcIiAmJiAhUi5sb2NrKSBSLmZpbmRJRChlKTtcclxuXHJcbiAgICBpZiAoUi5JRCAhPT0gbnVsbCkge1xyXG4gICAgICBpZiAoUi5JRC5pc0NhbnZhc09ubHkpIHtcclxuICAgICAgICBlLmNsaWVudFggPSBSLklELm1vdXNlLng7XHJcbiAgICAgICAgZS5jbGllbnRZID0gUi5JRC5tb3VzZS55O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvL2lmKCBSLklELm1hcmdpbkRpdiApIGUuY2xpZW50WSAtPSBSLklELm1hcmdpbiAqIDAuNVxyXG5cclxuICAgICAgUi5JRC5oYW5kbGVFdmVudChlKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoUi5pc01vYmlsZSAmJiBlLnR5cGUgPT09IFwibW91c2V1cFwiKSBSLmNsZWFyT2xkSUQoKTtcclxuICAgIGlmIChsZWF2ZSkgUi5jbGVhck9sZElEKCk7XHJcbiAgfSxcclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vICAgSURcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGZpbmRJRDogZnVuY3Rpb24gKGUpIHtcclxuICAgIGxldCBpID0gUi51aS5sZW5ndGgsXHJcbiAgICAgIG5leHQgPSAtMSxcclxuICAgICAgdSxcclxuICAgICAgeCxcclxuICAgICAgeTtcclxuXHJcbiAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgIHUgPSBSLnVpW2ldO1xyXG5cclxuICAgICAgaWYgKHUuaXNDYW52YXNPbmx5KSB7XHJcbiAgICAgICAgeCA9IHUubW91c2UueDtcclxuICAgICAgICB5ID0gdS5tb3VzZS55O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHggPSBlLmNsaWVudFg7XHJcbiAgICAgICAgeSA9IGUuY2xpZW50WTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKFIub25ab25lKHUsIHgsIHkpKSB7XHJcbiAgICAgICAgbmV4dCA9IGk7XHJcblxyXG4gICAgICAgIGlmIChuZXh0ICE9PSBSLmN1cnJlbnQpIHtcclxuICAgICAgICAgIFIuY2xlYXJPbGRJRCgpO1xyXG4gICAgICAgICAgUi5jdXJyZW50ID0gbmV4dDtcclxuICAgICAgICAgIFIuSUQgPSB1O1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChuZXh0ID09PSAtMSkgUi5jbGVhck9sZElEKCk7XHJcbiAgfSxcclxuXHJcbiAgY2xlYXJPbGRJRDogZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKCFSLklEKSByZXR1cm47XHJcbiAgICBSLmN1cnJlbnQgPSAtMTtcclxuICAgIFIuSUQucmVzZXQoKTtcclxuICAgIFIuSUQgPSBudWxsO1xyXG4gICAgUi5jdXJzb3IoKTtcclxuICB9LFxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gICBHVUkgLyBHUk9VUCBGVU5DVElPTlxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgY2FsY1VpczogKHVpcywgem9uZSwgcHksIGdyb3VwID0gZmFsc2UpID0+IHtcclxuICAgIC8vY29uc29sZS5sb2coJ2NhbGNfdWlzJylcclxuXHJcbiAgICBsZXQgaSA9IHVpcy5sZW5ndGgsXHJcbiAgICAgIHUsXHJcbiAgICAgIHB4ID0gMCxcclxuICAgICAgbiA9IDAsXHJcbiAgICAgIHR3LFxyXG4gICAgICBtLFxyXG4gICAgICBkaXY7XHJcblxyXG4gICAgbGV0IGhlaWdodCA9IDA7XHJcblxyXG4gICAgd2hpbGUgKGktLSkge1xyXG4gICAgICB1ID0gdWlzW25dO1xyXG4gICAgICBuKys7XHJcblxyXG4gICAgICBpZiAoIWdyb3VwICYmIHUuaXNHcm91cCkgdS5jYWxjVWlzKCk7XHJcblxyXG4gICAgICBtID0gdS5tYXJnaW47XHJcbiAgICAgIC8vZGl2ID0gdS5tYXJnaW5EaXZcclxuXHJcbiAgICAgIHUuem9uZS53ID0gdS53O1xyXG4gICAgICB1LnpvbmUuaCA9IHUuaCArIG07XHJcblxyXG4gICAgICBpZiAoIXUuYXV0b1dpZHRoKSB7XHJcbiAgICAgICAgaWYgKHB4ID09PSAwKSBoZWlnaHQgKz0gdS5oICsgbTtcclxuXHJcbiAgICAgICAgdS56b25lLnggPSB6b25lLnggKyBweDtcclxuICAgICAgICB1LnpvbmUueSA9IHB5OyAvLyArIHUubXRvcFxyXG4gICAgICAgIC8vaWYoZGl2KSB1LnpvbmUueSArPSBtICogMC41XHJcblxyXG4gICAgICAgIHR3ID0gUi5nZXRXaWR0aCh1KTtcclxuICAgICAgICBpZiAodHcpIHUuem9uZS53ID0gdS53ID0gdHc7XHJcbiAgICAgICAgZWxzZSBpZiAodS5mdykgdS56b25lLncgPSB1LncgPSB1LmZ3O1xyXG5cclxuICAgICAgICBweCArPSB1LnpvbmUudztcclxuXHJcbiAgICAgICAgaWYgKHB4ID49IHpvbmUudykge1xyXG4gICAgICAgICAgcHkgKz0gdS5oICsgbTtcclxuICAgICAgICAgIC8vaWYoZGl2KSBweSArPSBtICogMC41XHJcbiAgICAgICAgICBweCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHB4ID0gMDtcclxuXHJcbiAgICAgICAgdS56b25lLnggPSB6b25lLnggKyB1LmR4O1xyXG4gICAgICAgIHUuem9uZS55ID0gcHk7XHJcbiAgICAgICAgcHkgKz0gdS5oICsgbTtcclxuXHJcbiAgICAgICAgaGVpZ2h0ICs9IHUuaCArIG07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaGVpZ2h0O1xyXG4gIH0sXHJcblxyXG4gIGZpbmRUYXJnZXQ6IGZ1bmN0aW9uICh1aXMsIGUpIHtcclxuICAgIGxldCBpID0gdWlzLmxlbmd0aDtcclxuXHJcbiAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgIGlmIChSLm9uWm9uZSh1aXNbaV0sIGUuY2xpZW50WCwgZS5jbGllbnRZKSkgcmV0dXJuIGk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIC0xO1xyXG4gIH0sXHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyAgIFpPTkVcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGZpbmRab25lOiBmdW5jdGlvbiAoZm9yY2UpIHtcclxuICAgIGlmICghUi5uZWVkUmVab25lICYmICFmb3JjZSkgcmV0dXJuO1xyXG5cclxuICAgIHZhciBpID0gUi51aS5sZW5ndGgsXHJcbiAgICAgIHU7XHJcblxyXG4gICAgd2hpbGUgKGktLSkge1xyXG4gICAgICB1ID0gUi51aVtpXTtcclxuICAgICAgUi5nZXRab25lKHUpO1xyXG4gICAgICBpZiAodS5pc0d1aSkgdS5jYWxjVWlzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgUi5uZWVkUmVab25lID0gZmFsc2U7XHJcbiAgfSxcclxuXHJcbiAgb25ab25lOiBmdW5jdGlvbiAobywgeCwgeSkge1xyXG4gICAgaWYgKHggPT09IHVuZGVmaW5lZCB8fCB5ID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBsZXQgeiA9IG8uem9uZTtcclxuICAgIGxldCBteCA9IHggLSB6Lng7IC8vIC0gby5keDtcclxuICAgIGxldCBteSA9IHkgLSB6Lnk7XHJcblxyXG4gICAgLy9pZiggdGhpcy5tYXJnaW5EaXYgKSBlLmNsaWVudFkgLT0gdGhpcy5tYXJnaW4gKiAwLjVcclxuICAgIC8vaWYoIG8uZ3JvdXAgJiYgby5ncm91cC5tYXJnaW5EaXYgKSBteSArPSBvLmdyb3VwLm1hcmdpbiAqIDAuNVxyXG4gICAgLy9pZiggby5ncm91cCAhPT0gbnVsbCApIG14IC09IG8uZHhcclxuXHJcbiAgICBsZXQgb3ZlciA9IG14ID49IDAgJiYgbXkgPj0gMCAmJiBteCA8PSB6LncgJiYgbXkgPD0gei5oO1xyXG5cclxuICAgIC8vaWYoIG8ubWFyZ2luRGl2ICkgbXkgLT0gby5tYXJnaW4gKiAwLjVcclxuXHJcbiAgICBpZiAob3Zlcikgby5sb2NhbC5zZXQobXgsIG15KTtcclxuICAgIGVsc2Ugby5sb2NhbC5uZWcoKTtcclxuXHJcbiAgICByZXR1cm4gb3ZlcjtcclxuICB9LFxyXG5cclxuICBnZXRXaWR0aDogZnVuY3Rpb24gKG8pIHtcclxuICAgIC8vcmV0dXJuIG8uZ2V0RG9tKCkub2Zmc2V0V2lkdGhcclxuICAgIHJldHVybiBvLmdldERvbSgpLmNsaWVudFdpZHRoO1xyXG5cclxuICAgIC8vbGV0IHIgPSBvLmdldERvbSgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgLy9yZXR1cm4gKHIud2lkdGgpXHJcbiAgICAvL3JldHVybiBNYXRoLmZsb29yKHIud2lkdGgpXHJcbiAgfSxcclxuXHJcbiAgZ2V0Wm9uZTogZnVuY3Rpb24gKG8pIHtcclxuICAgIGlmIChvLmlzQ2FudmFzT25seSkgcmV0dXJuO1xyXG4gICAgbGV0IHIgPSBvLmdldERvbSgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgIC8vaWYoICFyLndpZHRoICkgcmV0dXJuXHJcbiAgICAvL28uem9uZSA9IHsgeDpNYXRoLmZsb29yKHIubGVmdCksIHk6TWF0aC5mbG9vcihyLnRvcCksIHc6TWF0aC5mbG9vcihyLndpZHRoKSwgaDpNYXRoLmZsb29yKHIuaGVpZ2h0KSB9O1xyXG4gICAgLy9vLnpvbmUgPSB7IHg6TWF0aC5yb3VuZChyLmxlZnQpLCB5Ok1hdGgucm91bmQoci50b3ApLCB3Ok1hdGgucm91bmQoci53aWR0aCksIGg6TWF0aC5yb3VuZChyLmhlaWdodCkgfTtcclxuICAgIG8uem9uZSA9IHsgeDogci5sZWZ0LCB5OiByLnRvcCwgdzogci53aWR0aCwgaDogci5oZWlnaHQgfTtcclxuXHJcbiAgICAvL2NvbnNvbGUubG9nKG8ubmFtZSwgby56b25lKVxyXG4gIH0sXHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyAgIENVUlNPUlxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgY3Vyc29yOiBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgbmFtZSA9IG5hbWUgPyBuYW1lIDogXCJhdXRvXCI7XHJcbiAgICBpZiAobmFtZSAhPT0gUi5vbGRDdXJzb3IpIHtcclxuICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSBuYW1lO1xyXG4gICAgICBSLm9sZEN1cnNvciA9IG5hbWU7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vICAgQ0FOVkFTXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICB0b0NhbnZhczogZnVuY3Rpb24gKG8sIHcsIGgsIGZvcmNlKSB7XHJcbiAgICBpZiAoIVIueG1sc2VyaWFsaXplcikgUi54bWxzZXJpYWxpemVyID0gbmV3IFhNTFNlcmlhbGl6ZXIoKTtcclxuXHJcbiAgICAvLyBwcmV2ZW50IGV4ZXNpdmUgcmVkcmF3XHJcblxyXG4gICAgaWYgKGZvcmNlICYmIFIudG1wVGltZSAhPT0gbnVsbCkge1xyXG4gICAgICBjbGVhclRpbWVvdXQoUi50bXBUaW1lKTtcclxuICAgICAgUi50bXBUaW1lID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoUi50bXBUaW1lICE9PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgaWYgKFIubG9jaylcclxuICAgICAgUi50bXBUaW1lID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgUi50bXBUaW1lID0gbnVsbDtcclxuICAgICAgfSwgMTApO1xyXG5cclxuICAgIC8vL1xyXG5cclxuICAgIGxldCBpc05ld1NpemUgPSBmYWxzZTtcclxuICAgIGlmICh3ICE9PSBvLmNhbnZhcy53aWR0aCB8fCBoICE9PSBvLmNhbnZhcy5oZWlnaHQpIGlzTmV3U2l6ZSA9IHRydWU7XHJcblxyXG4gICAgaWYgKFIudG1wSW1hZ2UgPT09IG51bGwpIFIudG1wSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuXHJcbiAgICBsZXQgaW1nID0gUi50bXBJbWFnZTsgLy9uZXcgSW1hZ2UoKTtcclxuXHJcbiAgICBsZXQgaHRtbFN0cmluZyA9IFIueG1sc2VyaWFsaXplci5zZXJpYWxpemVUb1N0cmluZyhvLmNvbnRlbnQpO1xyXG5cclxuICAgIGxldCBzdmcgPVxyXG4gICAgICAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCInICtcclxuICAgICAgdyArXHJcbiAgICAgICdcIiBoZWlnaHQ9XCInICtcclxuICAgICAgaCArXHJcbiAgICAgICdcIj48Zm9yZWlnbk9iamVjdCBzdHlsZT1cInBvaW50ZXItZXZlbnRzOiBub25lOyBsZWZ0OjA7XCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiPicgK1xyXG4gICAgICBodG1sU3RyaW5nICtcclxuICAgICAgXCI8L2ZvcmVpZ25PYmplY3Q+PC9zdmc+XCI7XHJcblxyXG4gICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgbGV0IGN0eCA9IG8uY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHJcbiAgICAgIGlmIChpc05ld1NpemUpIHtcclxuICAgICAgICBvLmNhbnZhcy53aWR0aCA9IHc7XHJcbiAgICAgICAgby5jYW52YXMuaGVpZ2h0ID0gaDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHcsIGgpO1xyXG4gICAgICB9XHJcbiAgICAgIGN0eC5kcmF3SW1hZ2UodGhpcywgMCwgMCk7XHJcblxyXG4gICAgICBvLm9uRHJhdygpO1xyXG4gICAgfTtcclxuXHJcbiAgICBpbWcuc3JjID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSUNvbXBvbmVudChzdmcpO1xyXG4gICAgLy9pbWcuc3JjID0gJ2RhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsJysgd2luZG93LmJ0b2EoIHN2ZyApO1xyXG4gICAgaW1nLmNyb3NzT3JpZ2luID0gXCJcIjtcclxuICAgIFIubmVlZHNVcGRhdGUgPSBmYWxzZTtcclxuICB9LFxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gICBJTlBVVFxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgc2V0SGlkZGVuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoUi5oaWRkZW5JbXB1dCA9PT0gbnVsbCkge1xyXG4gICAgICAvL2xldCBjc3MgPSBSLnBhcmVudC5jc3MudHh0c2VsZWN0ICsgJ3BhZGRpbmc6MDsgd2lkdGg6YXV0bzsgaGVpZ2h0OmF1dG87ICdcclxuICAgICAgLy9sZXQgY3NzID0gUi5wYXJlbnQuY3NzLnR4dCArICdwYWRkaW5nOjA7IHdpZHRoOmF1dG87IGhlaWdodDphdXRvOyB0ZXh0LXNoYWRvdzpub25lOydcclxuICAgICAgLy9jc3MgKz0gJ2xlZnQ6MTBweDsgdG9wOmF1dG87IGJvcmRlcjpub25lOyBjb2xvcjojRkZGOyBiYWNrZ3JvdW5kOiMwMDA7JyArIGhpZGU7XHJcblxyXG4gICAgICBSLmhpZGRlbkltcHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xyXG4gICAgICBSLmhpZGRlbkltcHV0LnR5cGUgPSBcInRleHRcIjtcclxuICAgICAgLy9SLmhpZGRlbkltcHV0LnN0eWxlLmNzc1RleHQgPSBjc3MgKyAnYm90dG9tOjMwcHg7JyArIChSLmRlYnVnSW5wdXQgPyAnJyA6ICd0cmFuc2Zvcm06c2NhbGUoMCk7Jyk7XHJcblxyXG4gICAgICBSLmhpZGRlblNpemVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgLy9SLmhpZGRlblNpemVyLnN0eWxlLmNzc1RleHQgPSBjc3MgKyAnYm90dG9tOjYwcHg7JztcclxuXHJcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoUi5oaWRkZW5JbXB1dCk7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoUi5oaWRkZW5TaXplcik7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGhpZGUgPSBSLmRlYnVnSW5wdXQgPyBcIlwiIDogXCJvcGFjaXR5OjA7IHpJbmRleDowO1wiO1xyXG4gICAgbGV0IGNzcyA9XHJcbiAgICAgIFIucGFyZW50LmNzcy50eHRzZWxlY3QgK1xyXG4gICAgICBcInBhZGRpbmc6MDsgd2lkdGg6YXV0bzsgaGVpZ2h0OmF1dG87IGxlZnQ6MTBweDsgdG9wOmF1dG87IGNvbG9yOiNGRkY7IGJhY2tncm91bmQ6IzAwMDtcIiArXHJcbiAgICAgIGhpZGU7XHJcbiAgICBSLmhpZGRlbkltcHV0LnN0eWxlLmNzc1RleHQgPVxyXG4gICAgICBjc3MgKyBcImJvdHRvbToxMHB4O1wiICsgKFIuZGVidWdJbnB1dCA/IFwiXCIgOiBcInRyYW5zZm9ybTpzY2FsZSgwKTtcIik7XHJcbiAgICBSLmhpZGRlblNpemVyLnN0eWxlLmNzc1RleHQgPSBjc3MgKyBcImJvdHRvbTo0MHB4O1wiO1xyXG5cclxuICAgIFIuaGlkZGVuSW1wdXQuc3R5bGUud2lkdGggPSBSLmlucHV0LmNsaWVudFdpZHRoICsgXCJweFwiO1xyXG4gICAgUi5oaWRkZW5JbXB1dC52YWx1ZSA9IFIuc3RyO1xyXG4gICAgUi5oaWRkZW5TaXplci5pbm5lckhUTUwgPSBSLnN0cjtcclxuXHJcbiAgICBSLmhhc0ZvY3VzID0gdHJ1ZTtcclxuICB9LFxyXG5cclxuICBjbGVhckhpZGRlbjogZnVuY3Rpb24gKHApIHtcclxuICAgIGlmIChSLmhpZGRlbkltcHV0ID09PSBudWxsKSByZXR1cm47XHJcbiAgICBSLmhhc0ZvY3VzID0gZmFsc2U7XHJcbiAgfSxcclxuXHJcbiAgY2xpY2tQb3M6IGZ1bmN0aW9uICh4KSB7XHJcbiAgICBsZXQgaSA9IFIuc3RyLmxlbmd0aCxcclxuICAgICAgbCA9IDAsXHJcbiAgICAgIG4gPSAwO1xyXG4gICAgd2hpbGUgKGktLSkge1xyXG4gICAgICBsICs9IFIudGV4dFdpZHRoKFIuc3RyW25dKTtcclxuICAgICAgaWYgKGwgPj0geCkgYnJlYWs7XHJcbiAgICAgIG4rKztcclxuICAgIH1cclxuICAgIHJldHVybiBuO1xyXG4gIH0sXHJcblxyXG4gIHVwSW5wdXQ6IGZ1bmN0aW9uICh4LCBkb3duKSB7XHJcbiAgICBpZiAoUi5wYXJlbnQgPT09IG51bGwpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBsZXQgdXAgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoZG93bikge1xyXG4gICAgICBsZXQgaWQgPSBSLmNsaWNrUG9zKHgpO1xyXG5cclxuICAgICAgUi5tb3ZlWCA9IGlkO1xyXG5cclxuICAgICAgaWYgKFIuc3RhcnRYID09PSAtMSkge1xyXG4gICAgICAgIFIuc3RhcnRYID0gaWQ7XHJcbiAgICAgICAgUi5jdXJzb3JJZCA9IGlkO1xyXG4gICAgICAgIFIuaW5wdXRSYW5nZSA9IFtSLnN0YXJ0WCwgUi5zdGFydFhdO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxldCBpc1NlbGVjdGlvbiA9IFIubW92ZVggIT09IFIuc3RhcnRYO1xyXG5cclxuICAgICAgICBpZiAoaXNTZWxlY3Rpb24pIHtcclxuICAgICAgICAgIGlmIChSLnN0YXJ0WCA+IFIubW92ZVgpIFIuaW5wdXRSYW5nZSA9IFtSLm1vdmVYLCBSLnN0YXJ0WF07XHJcbiAgICAgICAgICBlbHNlIFIuaW5wdXRSYW5nZSA9IFtSLnN0YXJ0WCwgUi5tb3ZlWF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB1cCA9IHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoUi5zdGFydFggIT09IC0xKSB7XHJcbiAgICAgICAgUi5oYXNGb2N1cyA9IHRydWU7XHJcbiAgICAgICAgUi5oaWRkZW5JbXB1dC5mb2N1cygpO1xyXG4gICAgICAgIFIuaGlkZGVuSW1wdXQuc2VsZWN0aW9uU3RhcnQgPSBSLmlucHV0UmFuZ2VbMF07XHJcbiAgICAgICAgUi5oaWRkZW5JbXB1dC5zZWxlY3Rpb25FbmQgPSBSLmlucHV0UmFuZ2VbMV07XHJcbiAgICAgICAgUi5zdGFydFggPSAtMTtcclxuXHJcbiAgICAgICAgdXAgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHVwKSBSLnNlbGVjdFBhcmVudCgpO1xyXG5cclxuICAgIHJldHVybiB1cDtcclxuICB9LFxyXG5cclxuICBzZWxlY3RBbGw6IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICghUi5wYXJlbnQpIHJldHVybjtcclxuXHJcbiAgICBSLnN0ciA9IFIuaW5wdXQudGV4dENvbnRlbnQ7XHJcbiAgICBSLmlucHV0UmFuZ2UgPSBbMCwgUi5zdHIubGVuZ3RoXTtcclxuICAgIFIuaGFzRm9jdXMgPSB0cnVlO1xyXG4gICAgUi5oaWRkZW5JbXB1dC5mb2N1cygpO1xyXG4gICAgUi5oaWRkZW5JbXB1dC5zZWxlY3Rpb25TdGFydCA9IFIuaW5wdXRSYW5nZVswXTtcclxuICAgIFIuaGlkZGVuSW1wdXQuc2VsZWN0aW9uRW5kID0gUi5pbnB1dFJhbmdlWzFdO1xyXG4gICAgUi5jdXJzb3JJZCA9IFIuaW5wdXRSYW5nZVsxXTtcclxuICAgIFIuc2VsZWN0UGFyZW50KCk7XHJcbiAgfSxcclxuXHJcbiAgc2VsZWN0UGFyZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgYyA9IFIudGV4dFdpZHRoKFIuc3RyLnN1YnN0cmluZygwLCBSLmN1cnNvcklkKSk7XHJcbiAgICB2YXIgZSA9IFIudGV4dFdpZHRoKFIuc3RyLnN1YnN0cmluZygwLCBSLmlucHV0UmFuZ2VbMF0pKTtcclxuICAgIHZhciBzID0gUi50ZXh0V2lkdGgoUi5zdHIuc3Vic3RyaW5nKFIuaW5wdXRSYW5nZVswXSwgUi5pbnB1dFJhbmdlWzFdKSk7XHJcblxyXG4gICAgUi5wYXJlbnQuc2VsZWN0KGMsIGUsIHMsIFIuaGlkZGVuU2l6ZXIuaW5uZXJIVE1MKTtcclxuICB9LFxyXG5cclxuICB0ZXh0V2lkdGg6IGZ1bmN0aW9uICh0ZXh0KSB7XHJcbiAgICBpZiAoUi5oaWRkZW5TaXplciA9PT0gbnVsbCkgcmV0dXJuIDA7XHJcbiAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8gL2csIFwiJm5ic3A7XCIpO1xyXG4gICAgUi5oaWRkZW5TaXplci5pbm5lckhUTUwgPSB0ZXh0O1xyXG4gICAgcmV0dXJuIFIuaGlkZGVuU2l6ZXIuY2xpZW50V2lkdGg7XHJcbiAgfSxcclxuXHJcbiAgY2xlYXJJbnB1dDogZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKFIucGFyZW50ID09PSBudWxsKSByZXR1cm47XHJcbiAgICBpZiAoIVIuZmlyc3RJbXB1dCkgUi5wYXJlbnQudmFsaWRhdGUodHJ1ZSk7XHJcblxyXG4gICAgUi5jbGVhckhpZGRlbigpO1xyXG4gICAgUi5wYXJlbnQudW5zZWxlY3QoKTtcclxuXHJcbiAgICAvL1IuaW5wdXQuc3R5bGUuYmFja2dyb3VuZCA9ICdub25lJztcclxuICAgIFIuaW5wdXQuc3R5bGUuYmFja2dyb3VuZCA9IFIucGFyZW50LmNvbG9ycy5iYWNrO1xyXG4gICAgUi5pbnB1dC5zdHlsZS5ib3JkZXJDb2xvciA9IFIucGFyZW50LmNvbG9ycy5ib3JkZXI7XHJcbiAgICAvL1IuaW5wdXQuc3R5bGUuY29sb3IgPSBSLnBhcmVudC5jb2xvcnMudGV4dDtcclxuICAgIFIucGFyZW50LmlzRWRpdCA9IGZhbHNlO1xyXG5cclxuICAgIFIuaW5wdXQgPSBudWxsO1xyXG4gICAgUi5wYXJlbnQgPSBudWxsO1xyXG4gICAgKFIuc3RyID0gXCJcIiksIChSLmZpcnN0SW1wdXQgPSB0cnVlKTtcclxuICB9LFxyXG5cclxuICBzZXRJbnB1dDogZnVuY3Rpb24gKElucHV0LCBwYXJlbnQpIHtcclxuICAgIFIuY2xlYXJJbnB1dCgpO1xyXG5cclxuICAgIFIuaW5wdXQgPSBJbnB1dDtcclxuICAgIFIucGFyZW50ID0gcGFyZW50O1xyXG5cclxuICAgIFIuaW5wdXQuc3R5bGUuYmFja2dyb3VuZCA9IFIucGFyZW50LmNvbG9ycy5iYWNrb2ZmO1xyXG4gICAgUi5pbnB1dC5zdHlsZS5ib3JkZXJDb2xvciA9IFIucGFyZW50LmNvbG9ycy5zZWxlY3Q7XHJcbiAgICAvL1IuaW5wdXQuc3R5bGUuY29sb3IgPSBSLnBhcmVudC5jb2xvcnMudGV4dFNlbGVjdDtcclxuICAgIFIuc3RyID0gUi5pbnB1dC50ZXh0Q29udGVudDtcclxuXHJcbiAgICBSLnNldEhpZGRlbigpO1xyXG4gIH0sXHJcblxyXG4gIGtleWRvd246IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoUi5wYXJlbnQgPT09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICBsZXQga2V5Q29kZSA9IGUud2hpY2gsXHJcbiAgICAgIGlzU2hpZnQgPSBlLnNoaWZ0S2V5O1xyXG5cclxuICAgIC8vY29uc29sZS5sb2coIGtleUNvZGUgKVxyXG5cclxuICAgIFIuZmlyc3RJbXB1dCA9IGZhbHNlO1xyXG5cclxuICAgIGlmIChSLmhhc0ZvY3VzKSB7XHJcbiAgICAgIC8vIGhhY2sgdG8gZml4IHRvdWNoIGV2ZW50IGJ1ZyBpbiBpT1MgU2FmYXJpXHJcbiAgICAgIHdpbmRvdy5mb2N1cygpO1xyXG4gICAgICBSLmhpZGRlbkltcHV0LmZvY3VzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgUi5wYXJlbnQuaXNFZGl0ID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgLy8gYWRkIHN1cHBvcnQgZm9yIEN0cmwvQ21kK0Egc2VsZWN0aW9uXHJcbiAgICAvL2lmICgga2V5Q29kZSA9PT0gNjUgJiYgKGUuY3RybEtleSB8fCBlLm1ldGFLZXkgKSkge1xyXG4gICAgLy9SLnNlbGVjdFRleHQoKTtcclxuICAgIC8vZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgLy9yZXR1cm4gc2VsZi5yZW5kZXIoKTtcclxuICAgIC8vfVxyXG5cclxuICAgIGlmIChrZXlDb2RlID09PSAxMykge1xyXG4gICAgICAvL2VudGVyXHJcblxyXG4gICAgICBSLmNsZWFySW5wdXQoKTtcclxuXHJcbiAgICAgIC8vfSBlbHNlIGlmKCBrZXlDb2RlID09PSA5ICl7IC8vdGFiIGtleVxyXG5cclxuICAgICAgLy8gUi5pbnB1dC50ZXh0Q29udGVudCA9ICcnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKFIuaW5wdXQuaXNOdW0pIHtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAoZS5rZXlDb2RlID4gNDcgJiYgZS5rZXlDb2RlIDwgNTgpIHx8XHJcbiAgICAgICAgICAoZS5rZXlDb2RlID4gOTUgJiYgZS5rZXlDb2RlIDwgMTA2KSB8fFxyXG4gICAgICAgICAgZS5rZXlDb2RlID09PSAxOTAgfHxcclxuICAgICAgICAgIGUua2V5Q29kZSA9PT0gMTEwIHx8XHJcbiAgICAgICAgICBlLmtleUNvZGUgPT09IDggfHxcclxuICAgICAgICAgIGUua2V5Q29kZSA9PT0gMTA5XHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICBSLmhpZGRlbkltcHV0LnJlYWRPbmx5ID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIFIuaGlkZGVuSW1wdXQucmVhZE9ubHkgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBSLmhpZGRlbkltcHV0LnJlYWRPbmx5ID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICBrZXl1cDogZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmIChSLnBhcmVudCA9PT0gbnVsbCkgcmV0dXJuO1xyXG5cclxuICAgIFIuc3RyID0gUi5oaWRkZW5JbXB1dC52YWx1ZTtcclxuXHJcbiAgICBpZiAoUi5wYXJlbnQuYWxsRXF1YWwpIFIucGFyZW50LnNhbWVTdHIoUi5zdHIpOyAvLyBudW1lcmljIHNhbcO5ZSB2YWx1ZVxyXG4gICAgZWxzZSBSLmlucHV0LnRleHRDb250ZW50ID0gUi5zdHI7XHJcblxyXG4gICAgUi5jdXJzb3JJZCA9IFIuaGlkZGVuSW1wdXQuc2VsZWN0aW9uU3RhcnQ7XHJcbiAgICBSLmlucHV0UmFuZ2UgPSBbUi5oaWRkZW5JbXB1dC5zZWxlY3Rpb25TdGFydCwgUi5oaWRkZW5JbXB1dC5zZWxlY3Rpb25FbmRdO1xyXG5cclxuICAgIFIuc2VsZWN0UGFyZW50KCk7XHJcblxyXG4gICAgLy9pZiggUi5wYXJlbnQuYWxsd2F5IClcclxuICAgIFIucGFyZW50LnZhbGlkYXRlKCk7XHJcbiAgfSxcclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vXHJcbiAgLy8gICBMSVNURU5JTkdcclxuICAvL1xyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgbG9vcDogZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gbW9kaWZpZWQgYnkgRmVkZW1hcmlub1xyXG4gICAgaWYgKFIuaXNMb29wKSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoUi5sb29wKTtcclxuICAgIFIubmVlZHNVcGRhdGUgPSBSLnVwZGF0ZSgpO1xyXG4gICAgLy8gaWYgdGhlcmUgaXMgYSBjaGFuZ2UgaW4gYSB2YWx1ZSBnZW5lcmF0ZWQgZXh0ZXJuYWxseSwgdGhlIEdVSSBuZWVkcyB0byBiZSByZWRyYXduXHJcbiAgICBpZiAoUi51aVswXSkgUi51aVswXS5kcmF3KCk7XHJcbiAgfSxcclxuXHJcbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBtb2RpZmllZCBieSBGZWRlbWFyaW5vXHJcbiAgICBsZXQgaSA9IFIubGlzdGVucy5sZW5ndGg7XHJcbiAgICBsZXQgbmVlZHNVcGRhdGUgPSBmYWxzZTtcclxuICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgLy9jaGVjayBpZiB0aGUgdmFsdWUgb2YgdGhlIG9iamVjdCBoYXMgY2hhbmdlZFxyXG4gICAgICBsZXQgaGFzQ2hhbmdlZCA9IFIubGlzdGVuc1tpXS5saXN0ZW5pbmcoKTtcclxuICAgICAgaWYgKGhhc0NoYW5nZWQpIG5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZWVkc1VwZGF0ZTtcclxuICB9LFxyXG5cclxuICByZW1vdmVMaXN0ZW46IGZ1bmN0aW9uIChwcm90bykge1xyXG4gICAgbGV0IGlkID0gUi5saXN0ZW5zLmluZGV4T2YocHJvdG8pO1xyXG4gICAgaWYgKGlkICE9PSAtMSkgUi5saXN0ZW5zLnNwbGljZShpZCwgMSk7XHJcbiAgICBpZiAoUi5saXN0ZW5zLmxlbmd0aCA9PT0gMCkgUi5pc0xvb3AgPSBmYWxzZTtcclxuICB9LFxyXG5cclxuICBhZGRMaXN0ZW46IGZ1bmN0aW9uIChwcm90bykge1xyXG4gICAgbGV0IGlkID0gUi5saXN0ZW5zLmluZGV4T2YocHJvdG8pO1xyXG5cclxuICAgIGlmIChpZCAhPT0gLTEpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBSLmxpc3RlbnMucHVzaChwcm90byk7XHJcblxyXG4gICAgaWYgKCFSLmlzTG9vcCkge1xyXG4gICAgICBSLmlzTG9vcCA9IHRydWU7XHJcbiAgICAgIFIubG9vcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgUm9vdHMgPSBSO1xyXG4iLCIvKipcclxuICogQGF1dGhvciBsdGggLyBodHRwczovL2dpdGh1Yi5jb20vbG8tdGhcclxuICovXHJcblxyXG5pbXBvcnQgeyBSb290cyB9IGZyb20gJy4vUm9vdHMuanMnO1xyXG5cclxuY29uc3QgVCA9IHtcclxuXHJcbiAgICB0cmFuc2l0aW9uOiAwLjIsXHJcblxyXG4gICAgZnJhZzogZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLFxyXG5cclxuICAgIGNvbG9yUmluZzogbnVsbCxcclxuICAgIGpveXN0aWNrXzA6IG51bGwsXHJcbiAgICBqb3lzdGlja18xOiBudWxsLFxyXG4gICAgY2lyY3VsYXI6IG51bGwsXHJcbiAgICBrbm9iOiBudWxsLFxyXG4gICAgcGFkMmQ6IG51bGwsXHJcblxyXG4gICAgc3ZnbnM6IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIixcclxuICAgIGxpbmtzOiBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIixcclxuICAgIGh0bWxzOiBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIixcclxuXHJcbiAgICBET01fU0laRTogWyAnaGVpZ2h0JywgJ3dpZHRoJywgJ3RvcCcsICdsZWZ0JywgJ2JvdHRvbScsICdyaWdodCcsICdtYXJnaW4tbGVmdCcsICdtYXJnaW4tcmlnaHQnLCAnbWFyZ2luLXRvcCcsICdtYXJnaW4tYm90dG9tJ10sXHJcbiAgICBTVkdfVFlQRV9EOiBbICdwYXR0ZXJuJywgJ2RlZnMnLCAndHJhbnNmb3JtJywgJ3N0b3AnLCAnYW5pbWF0ZScsICdyYWRpYWxHcmFkaWVudCcsICdsaW5lYXJHcmFkaWVudCcsICdhbmltYXRlTW90aW9uJywgJ3VzZScsICdmaWx0ZXInLCAnZmVDb2xvck1hdHJpeCcgXSxcclxuICAgIFNWR19UWVBFX0c6IFsgJ3N2ZycsICdyZWN0JywgJ2NpcmNsZScsICdwYXRoJywgJ3BvbHlnb24nLCAndGV4dCcsICdnJywgJ2xpbmUnLCAnZm9yZWlnbk9iamVjdCcgXSxcclxuXHJcbiAgICBQSTogTWF0aC5QSSxcclxuICAgIFR3b1BJOiBNYXRoLlBJKjIsXHJcbiAgICBwaTkwOiBNYXRoLlBJICogMC41LFxyXG4gICAgcGk2MDogTWF0aC5QSS8zLFxyXG4gICAgXHJcbiAgICB0b3JhZDogTWF0aC5QSSAvIDE4MCxcclxuICAgIHRvZGVnOiAxODAgLyBNYXRoLlBJLFxyXG5cclxuICAgIGNsYW1wOiAoIHYsIG1pbiwgbWF4ICkgPT4ge1xyXG5cclxuICAgICAgICB2ID0gdiA8IG1pbiA/IG1pbiA6IHY7XHJcbiAgICAgICAgdiA9IHYgPiBtYXggPyBtYXggOiB2O1xyXG4gICAgICAgIHJldHVybiB2O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgaXNEaXZpZDogKCB2ICkgPT4gKCB2KjAuNSA9PT0gTWF0aC5mbG9vcih2KjAuNSkgKSxcclxuXHJcbiAgICBzaXplOiB7ICB3OiAyNDAsIGg6IDIwLCBwOiAzMCwgczogOCB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgQ09MT1JcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBkZWZpbmVDb2xvcjogKCBvLCBjYyA9IFQuY29sb3JzICkgPT4ge1xyXG5cclxuICAgICAgICBsZXQgY29sb3IgPSB7IC4uLmNjIH1cclxuXHJcbiAgICAgICAgbGV0IHRleHRDaGFuZ2UgPSBbJ2ZvbnRGYW1pbHknLCAnZm9udFdlaWdodCcsICdmb250U2hhZG93JywgJ2ZvbnRTaXplJyBdXHJcbiAgICAgICAgbGV0IGNoYW5nZVRleHQgPSBmYWxzZVxyXG5cclxuICAgICAgICBpZiggby5mb250ICkgby5mb250RmFtaWx5ID0gby5mb250XHJcbiAgICAgICAgaWYoIG8uc2hhZG93ICkgby5mb250U2hhZG93ID0gby5zaGFkb3dcclxuICAgICAgICBpZiggby53ZWlnaHQgKSBvLmZvbnRXZWlnaHQgPSBvLndlaWdodFxyXG5cclxuICAgICAgICBpZiggby5mb250Q29sb3IgKSBvLnRleHQgPSBvLmZvbnRDb2xvclxyXG4gICAgICAgIGlmKCBvLmNvbG9yICkgby50ZXh0ID0gby5jb2xvclxyXG5cclxuICAgICAgICBpZiggby50ZXh0ICl7XHJcbiAgICAgICAgICAgIGNvbG9yLnRleHQgPSBvLnRleHRcclxuICAgICAgICAgICAgaWYoICFvLmZvbnRDb2xvciAmJiAhby5jb2xvciApeyBcclxuICAgICAgICAgICAgICAgIGNvbG9yLnRpdGxlID0gVC5Db2xvckx1bWEoIG8udGV4dCwgLTAuMjUgKVxyXG4gICAgICAgICAgICAgICAgY29sb3IudGl0bGVvZmYgPSBULkNvbG9yTHVtYSggby50ZXh0LCAtMC41IClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb2xvci50ZXh0T3ZlciA9IFQuQ29sb3JMdW1hKCBvLnRleHQsIDAuMjUgKVxyXG4gICAgICAgICAgICBjb2xvci50ZXh0U2VsZWN0ID0gVC5Db2xvckx1bWEoIG8udGV4dCwgMC41IClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBvLmJ1dHRvbiApe1xyXG4gICAgICAgICAgICBjb2xvci5idXR0b24gPSBvLmJ1dHRvblxyXG4gICAgICAgICAgICBjb2xvci5ib3JkZXIgPSBULkNvbG9yTHVtYSggby5idXR0b24sIDAuMSApXHJcbiAgICAgICAgICAgIGNvbG9yLm92ZXJvZmYgPSBULkNvbG9yTHVtYSggby5idXR0b24sIDAuMiApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggby5zZWxlY3QgKXtcclxuICAgICAgICAgICAgY29sb3Iuc2VsZWN0ID0gby5zZWxlY3RcclxuICAgICAgICAgICAgY29sb3Iub3ZlciA9IFQuQ29sb3JMdW1hKCBvLnNlbGVjdCwgLTAuMSApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggby5pdGVtQmcgKSBvLmJhY2sgPSBvLml0ZW1CZ1xyXG5cclxuICAgICAgICBpZiggby5iYWNrICl7XHJcbiAgICAgICAgICAgIGNvbG9yLmJhY2sgPSBvLmJhY2tcclxuICAgICAgICAgICAgY29sb3IuYmFja29mZiA9IFQuQ29sb3JMdW1hKCBvLmJhY2ssIC0wLjEgKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG8uZm9udFNlbGVjdCApIGNvbG9yLnRleHRTZWxlY3QgPSBvLmZvbnRTZWxlY3RcclxuICAgICAgICBpZiggby5ncm91cEJvcmRlciApIGNvbG9yLmdib3JkZXIgPSBvLmdyb3VwQm9yZGVyXHJcblxyXG4gICAgICAgIC8vaWYoIG8udHJhbnNwYXJlbnQgKSBvLmJnID0gJ25vbmUnXHJcbiAgICAgICAgLy9pZiggby5iZyApIGNvbG9yLmJhY2tncm91bmQgPSBjb2xvci5iYWNrZ3JvdW5kT3ZlciA9IG8uYmdcclxuICAgICAgICBpZiggby5iZ092ZXIgKSBjb2xvci5iYWNrZ3JvdW5kT3ZlciA9IG8uYmdPdmVyXHJcblxyXG4gICAgICAgIGZvciggbGV0IG0gaW4gY29sb3IgKXtcclxuICAgICAgICAgICAgaWYob1ttXSE9PXVuZGVmaW5lZCkgY29sb3JbbV0gPSBvW21dXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IoIGxldCBtIGluIG8gKXtcclxuICAgICAgICAgICAgaWYoIHRleHRDaGFuZ2UuaW5kZXhPZihtKSAhPT0gLTEgKSBjaGFuZ2VUZXh0ID0gdHJ1ZSBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBjaGFuZ2VUZXh0ICkgVC5kZWZpbmVUZXh0KCBjb2xvciApXHJcblxyXG4gICAgICAgIHJldHVybiBjb2xvclxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY29sb3JzOiB7XHJcblxyXG4gICAgICAgIHN4OiA0LC8vNFxyXG4gICAgICAgIHN5OiAyLC8vMlxyXG4gICAgICAgIHJhZGl1czoyLFxyXG5cclxuICAgICAgICBzaG93T3ZlciA6IDEsXHJcbiAgICAgICAgLy9ncm91cE92ZXIgOiAxLFxyXG5cclxuICAgICAgICBjb250ZW50Oidub25lJyxcclxuICAgICAgICBiYWNrZ3JvdW5kOiAncmdiYSg1MCw1MCw1MCwwLjE1KScsXHJcbiAgICAgICAgYmFja2dyb3VuZE92ZXI6ICdyZ2JhKDUwLDUwLDUwLDAuMyknLFxyXG5cclxuICAgICAgICB0aXRsZSA6ICcjQ0NDJyxcclxuICAgICAgICB0aXRsZW9mZiA6ICcjQkJCJyxcclxuICAgICAgICB0ZXh0IDogJyNEREQnLFxyXG4gICAgICAgIHRleHRPdmVyIDogJyNFRUUnLFxyXG4gICAgICAgIHRleHRTZWxlY3QgOiAnI0ZGRicsXHJcbiAgICAgICAgXHJcbiAgICAgICAgYmFjazoncmdiYSgwLDAsMCwwLjIpJyxcclxuICAgICAgICBiYWNrb2ZmOidyZ2JhKDAsMCwwLDAuMyknLFxyXG5cclxuICAgICAgICAvLyBpbnB1dCBhbmQgYnV0dG9uIGJvcmRlclxyXG4gICAgICAgIGJvcmRlciA6ICcjNGM0YzRjJyxcclxuICAgICAgICBib3JkZXJTaXplIDogMSxcclxuXHJcbiAgICAgICAgZ2JvcmRlciA6ICdub25lJyxcclxuICAgICAgICBncm91cHMgOiAnbm9uZScsXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIGJ1dHRvbiA6ICcjM2MzYzNjJyxcclxuICAgICAgICBvdmVyb2ZmIDogJyM1YzVjNWMnLFxyXG4gICAgICAgIG92ZXIgOiAnIzAyNDY5OScsXHJcbiAgICAgICAgc2VsZWN0IDogJyMzMDhBRkYnLFxyXG4gICAgICAgIGFjdGlvbjogJyNGRjMzMDAnLFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vZm9udEZhbWlseTogJ1RhaG9tYScsXHJcbiAgICAgICAgZm9udEZhbWlseTogJ0NvbnNvbGFzLCBtb25vc3BhY2UnLFxyXG4gICAgICAgIC8vZm9udEZhbWlseTogXCInUm9ib3RvIE1vbm8nLCAnU291cmNlIENvZGUgUHJvJywgTWVubG8sIENvdXJpZXIsIG1vbm9zcGFjZVwiLFxyXG4gICAgICAgIGZvbnRXZWlnaHQ6ICdub3JtYWwnLFxyXG4gICAgICAgIGZvbnRTaGFkb3c6ICdub25lJywvLycjMDAwJyxcclxuICAgICAgICBmb250U2l6ZToxMixcclxuXHJcbiAgICAgICAgam95T3ZlcjoncmdiYSg0OCwxMzgsMjU1LDAuMjUpJyxcclxuICAgICAgICBqb3lPdXQ6ICdyZ2JhKDEwMCwxMDAsMTAwLDAuNSknLFxyXG4gICAgICAgIGpveVNlbGVjdDogJyMzMDhBRkYnLFxyXG5cclxuICAgICAgICBcclxuICAgICAgICBoaWRlOiAncmdiYSgwLDAsMCwwKScsXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBzdHlsZSBjc3NcclxuXHJcbiAgICBjc3MgOiB7XHJcblxyXG4gICAgICAgIGJhc2ljOiAncG9zaXRpb246YWJzb2x1dGU7IHBvaW50ZXItZXZlbnRzOm5vbmU7IGJveC1zaXppbmc6Ym9yZGVyLWJveDsgbWFyZ2luOjA7IHBhZGRpbmc6MDsgb3ZlcmZsb3c6aGlkZGVuOyAnICsgJy1vLXVzZXItc2VsZWN0Om5vbmU7IC1tcy11c2VyLXNlbGVjdDpub25lOyAta2h0bWwtdXNlci1zZWxlY3Q6bm9uZTsgLXdlYmtpdC11c2VyLXNlbGVjdDpub25lOyAtbW96LXVzZXItc2VsZWN0Om5vbmU7JyxcclxuICAgICAgICBidXR0b246J2Rpc3BsYXk6ZmxleDsgYWxpZ24taXRlbXM6Y2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOyB0ZXh0LWFsaWduOmNlbnRlcjsnLFxyXG4gICAgICAgIG1pZGRsZTonZGlzcGxheTpmbGV4OyBhbGlnbi1pdGVtczpjZW50ZXI7IGp1c3RpZnktY29udGVudDpsZWZ0OyB0ZXh0LWFsaWduOmxlZnQ7IGZsZXgtZGlyZWN0aW9uOiByb3ctcmV2ZXJzZTsnXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIHN2ZyBwYXRoXHJcblxyXG4gICAgc3Znczoge1xyXG5cclxuICAgICAgICBnMTonTSA2IDQgTCAwIDQgMCA2IDYgNiA2IDQgTSA2IDAgTCAwIDAgMCAyIDYgMiA2IDAgWicsXHJcbiAgICAgICAgZzI6J00gNiAwIEwgNCAwIDQgNiA2IDYgNiAwIE0gMiAwIEwgMCAwIDAgNiAyIDYgMiAwIFonLFxyXG5cclxuICAgICAgICBncm91cDonTSA3IDcgTCA3IDggOCA4IDggNyA3IDcgTSA1IDcgTCA1IDggNiA4IDYgNyA1IDcgTSAzIDcgTCAzIDggNCA4IDQgNyAzIDcgTSA3IDUgTCA3IDYgOCA2IDggNSA3IDUgTSA2IDYgTCA2IDUgNSA1IDUgNiA2IDYgTSA3IDMgTCA3IDQgOCA0IDggMyA3IDMgTSA2IDQgTCA2IDMgNSAzIDUgNCA2IDQgTSAzIDUgTCAzIDYgNCA2IDQgNSAzIDUgTSAzIDMgTCAzIDQgNCA0IDQgMyAzIDMgWicsXHJcbiAgICAgICAgYXJyb3c6J00gMyA4IEwgOCA1IDMgMiAzIDggWicsXHJcblxyXG4gICAgICAgIGFycm93RG93bjonTSA1IDggTCA4IDMgMiAzIDUgOCBaJyxcclxuICAgICAgICBhcnJvd1VwOidNIDUgMiBMIDIgNyA4IDcgNSAyIFonLFxyXG5cclxuICAgICAgICBzb2xpZDonTSAxMyAxMCBMIDEzIDEgNCAxIDEgNCAxIDEzIDEwIDEzIDEzIDEwIE0gMTEgMyBMIDExIDkgOSAxMSAzIDExIDMgNSA1IDMgMTEgMyBaJyxcclxuICAgICAgICBib2R5OidNIDEzIDEwIEwgMTMgMSA0IDEgMSA0IDEgMTMgMTAgMTMgMTMgMTAgTSAxMSAzIEwgMTEgOSA5IDExIDMgMTEgMyA1IDUgMyAxMSAzIE0gNSA0IEwgNCA1IDQgMTAgOSAxMCAxMCA5IDEwIDQgNSA0IFonLFxyXG4gICAgICAgIHZlaGljbGU6J00gMTMgNiBMIDExIDEgMyAxIDEgNiAxIDEzIDMgMTMgMyAxMSAxMSAxMSAxMSAxMyAxMyAxMyAxMyA2IE0gMi40IDYgTCA0IDIgMTAgMiAxMS42IDYgMi40IDYgTSAxMiA4IEwgMTIgMTAgMTAgMTAgMTAgOCAxMiA4IE0gNCA4IEwgNCAxMCAyIDEwIDIgOCA0IDggWicsXHJcbiAgICAgICAgYXJ0aWN1bGF0aW9uOidNIDEzIDkgTCAxMiA5IDkgMiA5IDEgNSAxIDUgMiAyIDkgMSA5IDEgMTMgNSAxMyA1IDkgNCA5IDYgNSA4IDUgMTAgOSA5IDkgOSAxMyAxMyAxMyAxMyA5IFonLFxyXG4gICAgICAgIGNoYXJhY3RlcjonTSAxMyA0IEwgMTIgMyA5IDQgNSA0IDIgMyAxIDQgNSA2IDUgOCA0IDEzIDYgMTMgNyA5IDggMTMgMTAgMTMgOSA4IDkgNiAxMyA0IE0gNiAxIEwgNiAzIDggMyA4IDEgNiAxIFonLFxyXG4gICAgICAgIHRlcnJhaW46J00gMTMgOCBMIDEyIDcgUSA5LjA2IC0zLjY3IDUuOTUgNC44NSA0LjA0IDMuMjcgMiA3IEwgMSA4IDcgMTMgMTMgOCBNIDMgOCBRIDMuNzggNS40MjAgNS40IDYuNiA1LjIwIDcuMjUgNSA4IEwgNyA4IFEgOC4zOSAtMC4xNiAxMSA4IEwgNyAxMSAzIDggWicsXHJcbiAgICAgICAgam9pbnQ6J00gNy43IDcuNyBRIDggNy40NSA4IDcgOCA2LjYgNy43IDYuMyA3LjQ1IDYgNyA2IDYuNiA2IDYuMyA2LjMgNiA2LjYgNiA3IDYgNy40NSA2LjMgNy43IDYuNiA4IDcgOCA3LjQ1IDggNy43IDcuNyBNIDMuMzUgOC42NSBMIDEgMTEgMyAxMyA1LjM1IDEwLjY1IFEgNi4xIDExIDcgMTEgOC4yOCAxMSA5LjI1IDEwLjI1IEwgNy44IDguOCBRIDcuNDUgOSA3IDkgNi4xNSA5IDUuNTUgOC40IDUgNy44NSA1IDcgNSA2LjU0IDUuMTUgNi4xNSBMIDMuNyA0LjcgUSAzIDUuNzEyIDMgNyAzIDcuOSAzLjM1IDguNjUgTSAxMC4yNSA5LjI1IFEgMTEgOC4yOCAxMSA3IDExIDYuMSAxMC42NSA1LjM1IEwgMTMgMyAxMSAxIDguNjUgMy4zNSBRIDcuOSAzIDcgMyA1LjcgMyA0LjcgMy43IEwgNi4xNSA1LjE1IFEgNi41NCA1IDcgNSA3Ljg1IDUgOC40IDUuNTUgOSA2LjE1IDkgNyA5IDcuNDUgOC44IDcuOCBMIDEwLjI1IDkuMjUgWicsXHJcbiAgICAgICAgcmF5OidNIDkgMTEgTCA1IDExIDUgMTIgOSAxMiA5IDExIE0gMTIgNSBMIDExIDUgMTEgOSAxMiA5IDEyIDUgTSAxMS41IDEwIFEgMTAuOSAxMCAxMC40NSAxMC40NSAxMCAxMC45IDEwIDExLjUgMTAgMTIuMiAxMC40NSAxMi41NSAxMC45IDEzIDExLjUgMTMgMTIuMiAxMyAxMi41NSAxMi41NSAxMyAxMi4yIDEzIDExLjUgMTMgMTAuOSAxMi41NSAxMC40NSAxMi4yIDEwIDExLjUgMTAgTSA5IDEwIEwgMTAgOSAyIDEgMSAyIDkgMTAgWicsXHJcbiAgICAgICAgY29sbGlzaW9uOidNIDExIDEyIEwgMTMgMTAgMTAgNyAxMyA0IDExIDIgNy41IDUuNSA5IDcgNy41IDguNSAxMSAxMiBNIDMgMiBMIDEgNCA0IDcgMSAxMCAzIDEyIDggNyAzIDIgWicsXHJcbiAgICAgICAgbWFwOidNIDEzIDEgTCAxIDEgMSAxMyAxMyAxMyAxMyAxIE0gMTIgMiBMIDEyIDcgNyA3IDcgMTIgMiAxMiAyIDcgNyA3IDcgMiAxMiAyIFonLFxyXG4gICAgICAgIG1hdGVyaWFsOidNIDEzIDEgTCAxIDEgMSAxMyAxMyAxMyAxMyAxIE0gMTIgMiBMIDEyIDcgNyA3IDcgMTIgMiAxMiAyIDcgNyA3IDcgMiAxMiAyIFonLFxyXG4gICAgICAgIHRleHR1cmU6J00gMTMgNCBMIDEzIDEgMSAxIDEgNCA1IDQgNSAxMyA5IDEzIDkgNCAxMyA0IFonLFxyXG4gICAgICAgIG9iamVjdDonTSAxMCAxIEwgNyA0IDQgMSAxIDEgMSAxMyA0IDEzIDQgNSA3IDggMTAgNSAxMCAxMyAxMyAxMyAxMyAxIDEwIDEgWicsXHJcbiAgICAgICAgbm9uZTonTSA5IDUgTCA1IDUgNSA5IDkgOSA5IDUgWicsXHJcbiAgICAgICAgY3Vyc29yOidNIDQgNyBMIDEgMTAgMSAxMiAyIDEzIDQgMTMgNyAxMCA5IDE0IDE0IDAgMCA1IDQgNyBaJyxcclxuICAgICAgICBsb2FkOidNIDEzIDggTCAxMS41IDYuNSA5IDkgOSAzIDUgMyA1IDkgMi41IDYuNSAxIDggNyAxNCAxMyA4IE0gOSAyIEwgOSAwIDUgMCA1IDIgOSAyIFonLFxyXG4gICAgICAgIHNhdmU6J00gOSAxMiBMIDUgMTIgNSAxNCA5IDE0IDkgMTIgTSAxMS41IDcuNSBMIDEzIDYgNyAwIDEgNiAyLjUgNy41IDUgNSA1IDExIDkgMTEgOSA1IDExLjUgNy41IFonLFxyXG4gICAgICAgIGV4dGVybjonTSAxNCAxNCBMIDE0IDAgMCAwIDAgMTQgMTQgMTQgTSAxMiA2IEwgMTIgMTIgMiAxMiAyIDYgMTIgNiBNIDEyIDIgTCAxMiA0IDIgNCAyIDIgMTIgMiBaJyxcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJlem9uZSAoKSB7XHJcbiAgICAgICAgUm9vdHMubmVlZFJlWm9uZSA9IHRydWU7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEltcHV0OiBmdW5jdGlvbigpe1xyXG5cclxuICAgICAgICByZXR1cm4gUm9vdHMuaW5wdXQgPyB0cnVlIDogZmFsc2VcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldFN0eWxlIDogZnVuY3Rpb24gKCBkYXRhICl7XHJcblxyXG4gICAgICAgIGZvciAoIHZhciBvIGluIGRhdGEgKXtcclxuICAgICAgICAgICAgaWYoIFQuY29sb3JzW29dICkgVC5jb2xvcnNbb10gPSBkYXRhW29dO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgVC5zZXRUZXh0KCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBjdXN0b20gdGV4dFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGRlZmluZVRleHQ6IGZ1bmN0aW9uKCBvICl7XHJcblxyXG4gICAgICAgIFQuc2V0VGV4dCggby5mb250U2l6ZSwgby50ZXh0LCBvLmZvbnRGYW1pbHksIG8uZm9udFNoYWRvdywgby5mb250V2VpZ2h0IClcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldFRleHQ6IGZ1bmN0aW9uKCBzaXplLCBjb2xvciwgZm9udCwgc2hhZG93LCB3ZWlnaHQgKXtcclxuXHJcbiAgICAgICAgbGV0IGNjID0gVC5jb2xvcnM7XHJcblxyXG4gICAgICAgIGlmKCBmb250ID09PSB1bmRlZmluZWQgKSBmb250ID0gY2MuZm9udEZhbWlseVxyXG4gICAgICAgIGlmKCBzaXplID09PSB1bmRlZmluZWQgKSBzaXplID0gY2MuZm9udFNpemVcclxuICAgICAgICBpZiggc2hhZG93ID09PSB1bmRlZmluZWQgKSBzaGFkb3cgPSBjYy5mb250U2hhZG93XHJcbiAgICAgICAgaWYoIHdlaWdodCA9PT0gdW5kZWZpbmVkICkgd2VpZ2h0ID0gY2MuZm9udFdlaWdodFxyXG4gICAgICAgIGlmKCBjb2xvciA9PT0gdW5kZWZpbmVkICkgY29sb3IgPSBjYy50ZXh0XHJcblxyXG4gICAgICAgIGlmKCBpc05hTihzaXplKSApeyBpZiggc2l6ZS5zZWFyY2goJ2VtJyk9PT0tMSApIHNpemUgKz0gJ3B4J31cclxuICAgICAgICBlbHNlIHNpemUgKz0gJ3B4J1xyXG4gICAgICAgIFxyXG5cclxuICAgICAgICAvL2xldCBhbGlnbiA9ICdkaXNwbGF5OmZsZXg7IGp1c3RpZnktY29udGVudDpsZWZ0OyBhbGlnbi1pdGVtczpjZW50ZXI7IHRleHQtYWxpZ246bGVmdDsnXHJcblxyXG4gICAgICAgIFQuY3NzLnR4dCA9IFQuY3NzLmJhc2ljICsgVC5jc3MubWlkZGxlICsgJyBmb250LWZhbWlseTonKyBmb250ICsnOyBmb250LXdlaWdodDonK3dlaWdodCsnOyBmb250LXNpemU6JytzaXplKyc7IGNvbG9yOicrY2MudGV4dCsnOyBwYWRkaW5nOjBweCA4cHg7IGxlZnQ6MDsgdG9wOjJweDsgaGVpZ2h0OjE2cHg7IHdpZHRoOjEwMHB4OyBvdmVyZmxvdzpoaWRkZW47IHdoaXRlLXNwYWNlOiBub3dyYXA7IGxldHRlci1zcGFjaW5nOiBub3JtYWw7JztcclxuICAgICAgICBpZiggc2hhZG93ICE9PSAnbm9uZScgKSBULmNzcy50eHQgKz0gJyB0ZXh0LXNoYWRvdzogMXB4IDFweCAxcHggJytzaGFkb3crJzsnO1xyXG5cclxuICAgICAgICBULmNzcy50eHRzZWxlY3QgPSBULmNzcy50eHQgKyAncGFkZGluZzowcHggNHB4OyBib3JkZXI6MXB4IGRhc2hlZCAnICsgY2MuYm9yZGVyICsgJzsnO1xyXG4gICAgICAgIFQuY3NzLml0ZW0gPSBULmNzcy50eHQgKyAncGFkZGluZzowcHggNHB4OyBwb3NpdGlvbjpyZWxhdGl2ZTsgbWFyZ2luLWJvdHRvbToxcHg7ICdcclxuXHJcbiAgICB9LFxyXG5cclxuXHJcbiAgICAvLyBub3RlXHJcblxyXG4gICAgLy9odHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9mci9kb2NzL1dlYi9DU1MvY3NzX2ZsZXhpYmxlX2JveF9sYXlvdXQvYWxpZ25pbmdfaXRlbXNfaW5fYV9mbGV4X2NvbnRhaW5lclxyXG5cclxuICAgIC8qY2xvbmVDb2xvcjogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBsZXQgY2MgPSBPYmplY3QuYXNzaWduKHt9LCBULmNvbG9ycyApO1xyXG4gICAgICAgIHJldHVybiBjYztcclxuXHJcbiAgICB9LCovXHJcblxyXG4gICAgLy8gaW50ZXJuIGZ1bmN0aW9uXHJcblxyXG4gICAgY2xvbmVDc3M6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgLy9sZXQgY2MgPSBPYmplY3QuYXNzaWduKHt9LCBULmNzcyApO1xyXG4gICAgICAgIHJldHVybiB7IC4uLlQuY3NzIH07XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbG9uZTogZnVuY3Rpb24gKCBvICkge1xyXG5cclxuICAgICAgICByZXR1cm4gby5jbG9uZU5vZGUoIHRydWUgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldFN2ZzogZnVuY3Rpb24oIGRvbSwgdHlwZSwgdmFsdWUsIGlkLCBpZDIgKXtcclxuXHJcbiAgICAgICAgaWYoIGlkID09PSAtMSApIGRvbS5zZXRBdHRyaWJ1dGVOUyggbnVsbCwgdHlwZSwgdmFsdWUgKTtcclxuICAgICAgICBlbHNlIGlmKCBpZDIgIT09IHVuZGVmaW5lZCApIGRvbS5jaGlsZE5vZGVzWyBpZCB8fCAwIF0uY2hpbGROb2Rlc1sgaWQyIHx8IDAgXS5zZXRBdHRyaWJ1dGVOUyggbnVsbCwgdHlwZSwgdmFsdWUgKTtcclxuICAgICAgICBlbHNlIGRvbS5jaGlsZE5vZGVzWyBpZCB8fCAwIF0uc2V0QXR0cmlidXRlTlMoIG51bGwsIHR5cGUsIHZhbHVlICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRDc3M6IGZ1bmN0aW9uKCBkb20sIGNzcyApe1xyXG5cclxuICAgICAgICBmb3IoIGxldCByIGluIGNzcyApe1xyXG4gICAgICAgICAgICBpZiggVC5ET01fU0laRS5pbmRleE9mKHIpICE9PSAtMSApIGRvbS5zdHlsZVtyXSA9IGNzc1tyXSArICdweCc7XHJcbiAgICAgICAgICAgIGVsc2UgZG9tLnN0eWxlW3JdID0gY3NzW3JdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldDogZnVuY3Rpb24oIGcsIG8gKXtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgYXR0IGluIG8gKXtcclxuICAgICAgICAgICAgaWYoIGF0dCA9PT0gJ3R4dCcgKSBnLnRleHRDb250ZW50ID0gb1sgYXR0IF07XHJcbiAgICAgICAgICAgIGlmKCBhdHQgPT09ICdsaW5rJyApIGcuc2V0QXR0cmlidXRlTlMoIFQubGlua3MsICd4bGluazpocmVmJywgb1sgYXR0IF0gKTtcclxuICAgICAgICAgICAgZWxzZSBnLnNldEF0dHJpYnV0ZU5TKCBudWxsLCBhdHQsIG9bIGF0dCBdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfSxcclxuXHJcbiAgICBnZXQ6IGZ1bmN0aW9uKCBkb20sIGlkICl7XHJcblxyXG4gICAgICAgIGlmKCBpZCA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIGRvbTsgLy8gcm9vdFxyXG4gICAgICAgIGVsc2UgaWYoICFpc05hTiggaWQgKSApIHJldHVybiBkb20uY2hpbGROb2Rlc1sgaWQgXTsgLy8gZmlyc3QgY2hpbGRcclxuICAgICAgICBlbHNlIGlmKCBpZCBpbnN0YW5jZW9mIEFycmF5ICl7XHJcbiAgICAgICAgICAgIGlmKGlkLmxlbmd0aCA9PT0gMikgcmV0dXJuIGRvbS5jaGlsZE5vZGVzWyBpZFswXSBdLmNoaWxkTm9kZXNbIGlkWzFdIF07XHJcbiAgICAgICAgICAgIGlmKGlkLmxlbmd0aCA9PT0gMykgcmV0dXJuIGRvbS5jaGlsZE5vZGVzWyBpZFswXSBdLmNoaWxkTm9kZXNbIGlkWzFdIF0uY2hpbGROb2Rlc1sgaWRbMl0gXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBkb20gOiBmdW5jdGlvbiAoIHR5cGUsIGNzcywgb2JqLCBkb20sIGlkICkge1xyXG5cclxuICAgICAgICB0eXBlID0gdHlwZSB8fCAnZGl2JztcclxuXHJcbiAgICAgICAgaWYoIFQuU1ZHX1RZUEVfRC5pbmRleE9mKHR5cGUpICE9PSAtMSB8fCBULlNWR19UWVBFX0cuaW5kZXhPZih0eXBlKSAhPT0gLTEgKXsgLy8gaXMgc3ZnIGVsZW1lbnRcclxuXHJcbiAgICAgICAgICAgIGlmKCB0eXBlID09PSdzdmcnICl7XHJcblxyXG4gICAgICAgICAgICAgICAgZG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBULnN2Z25zLCAnc3ZnJyApO1xyXG4gICAgICAgICAgICAgICAgVC5zZXQoIGRvbSwgb2JqICk7XHJcblxyXG4gICAgICAgICAgLyogIH0gZWxzZSBpZiAoIHR5cGUgPT09ICd1c2UnICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGRvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggVC5zdmducywgJ3VzZScgKTtcclxuICAgICAgICAgICAgICAgIFQuc2V0KCBkb20sIG9iaiApO1xyXG4qL1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIG5ldyBzdmcgaWYgbm90IGRlZlxyXG4gICAgICAgICAgICAgICAgaWYoIGRvbSA9PT0gdW5kZWZpbmVkICkgZG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBULnN2Z25zLCAnc3ZnJyApO1xyXG4gICAgICAgICAgICAgICAgVC5hZGRBdHRyaWJ1dGVzKCBkb20sIHR5cGUsIG9iaiwgaWQgKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIHsgLy8gaXMgaHRtbCBlbGVtZW50XHJcblxyXG4gICAgICAgICAgICBpZiggZG9tID09PSB1bmRlZmluZWQgKSBkb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIFQuaHRtbHMsIHR5cGUgKTtcclxuICAgICAgICAgICAgZWxzZSBkb20gPSBkb20uYXBwZW5kQ2hpbGQoIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggVC5odG1scywgdHlwZSApICk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIGNzcyApIGRvbS5zdHlsZS5jc3NUZXh0ID0gY3NzOyBcclxuXHJcbiAgICAgICAgaWYoIGlkID09PSB1bmRlZmluZWQgKSByZXR1cm4gZG9tO1xyXG4gICAgICAgIGVsc2UgcmV0dXJuIGRvbS5jaGlsZE5vZGVzWyBpZCB8fCAwIF07XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBhZGRBdHRyaWJ1dGVzIDogZnVuY3Rpb24oIGRvbSwgdHlwZSwgbywgaWQgKXtcclxuXHJcbiAgICAgICAgbGV0IGcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIFQuc3ZnbnMsIHR5cGUgKTtcclxuICAgICAgICBULnNldCggZywgbyApO1xyXG4gICAgICAgIFQuZ2V0KCBkb20sIGlkICkuYXBwZW5kQ2hpbGQoIGcgKTtcclxuICAgICAgICBpZiggVC5TVkdfVFlQRV9HLmluZGV4T2YodHlwZSkgIT09IC0xICkgZy5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xyXG4gICAgICAgIHJldHVybiBnO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xlYXIgOiBmdW5jdGlvbiggZG9tICl7XHJcblxyXG4gICAgICAgIFQucHVyZ2UoIGRvbSApO1xyXG4gICAgICAgIHdoaWxlIChkb20uZmlyc3RDaGlsZCkge1xyXG4gICAgICAgICAgICBpZiAoIGRvbS5maXJzdENoaWxkLmZpcnN0Q2hpbGQgKSBULmNsZWFyKCBkb20uZmlyc3RDaGlsZCApO1xyXG4gICAgICAgICAgICBkb20ucmVtb3ZlQ2hpbGQoIGRvbS5maXJzdENoaWxkICk7IFxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHB1cmdlIDogZnVuY3Rpb24gKCBkb20gKSB7XHJcblxyXG4gICAgICAgIGxldCBhID0gZG9tLmF0dHJpYnV0ZXMsIGksIG47XHJcbiAgICAgICAgaWYgKGEpIHtcclxuICAgICAgICAgICAgaSA9IGEubGVuZ3RoO1xyXG4gICAgICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICAgICAgbiA9IGFbaV0ubmFtZTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZG9tW25dID09PSAnZnVuY3Rpb24nKSBkb21bbl0gPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGEgPSBkb20uY2hpbGROb2RlcztcclxuICAgICAgICBpZiAoYSkge1xyXG4gICAgICAgICAgICBpID0gYS5sZW5ndGg7XHJcbiAgICAgICAgICAgIHdoaWxlKGktLSl7IFxyXG4gICAgICAgICAgICAgICAgVC5wdXJnZSggZG9tLmNoaWxkTm9kZXNbaV0gKTsgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFNWRyBFZmZlY3RzIGZ1bmN0aW9uXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgYWRkU1ZHR2xvd0VmZmVjdDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiAoIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAnVUlMR2xvdycpICE9PSBudWxsICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgc3ZnRmlsdGVyID0gVC5pbml0VUlMRWZmZWN0cygpO1xyXG5cclxuICAgICAgICBsZXQgZmlsdGVyID0gVC5hZGRBdHRyaWJ1dGVzKCBzdmdGaWx0ZXIsICdmaWx0ZXInLCB7IGlkOiAnVUlMR2xvdycsIHg6ICctMjAlJywgeTogJy0yMCUnLCB3aWR0aDogJzE0MCUnLCBoZWlnaHQ6ICcxNDAlJyB9ICk7XHJcbiAgICAgICAgVC5hZGRBdHRyaWJ1dGVzKCBmaWx0ZXIsICdmZUdhdXNzaWFuQmx1cicsIHsgaW46ICdTb3VyY2VHcmFwaGljJywgc3RkRGV2aWF0aW9uOiAnMycsIHJlc3VsdDogJ3VpbEJsdXInIH0gKTtcclxuICAgICAgICBsZXQgZmVNZXJnZSA9IFQuYWRkQXR0cmlidXRlcyggZmlsdGVyLCAnZmVNZXJnZScsIHsgIH0gKTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8PSAzOyBpKysgKSB7XHJcblxyXG4gICAgICAgICAgICBULmFkZEF0dHJpYnV0ZXMoIGZlTWVyZ2UsICdmZU1lcmdlTm9kZScsIHsgaW46ICd1aWxCbHVyJyB9ICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBULmFkZEF0dHJpYnV0ZXMoIGZlTWVyZ2UsICdmZU1lcmdlTm9kZScsIHsgaW46ICdTb3VyY2VHcmFwaGljJyB9ICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBpbml0VUlMRWZmZWN0czogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBsZXQgc3ZnRmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICdVSUxTVkdFZmZlY3RzJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKCBzdmdGaWx0ZXIgPT09IG51bGwgKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBzdmdGaWx0ZXIgPSBULmRvbSggJ3N2ZycsIHVuZGVmaW5lZCAsIHsgaWQ6ICdVSUxTVkdFZmZlY3RzJywgd2lkdGg6ICcwJywgaGVpZ2h0OiAnMCcgfSApO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBzdmdGaWx0ZXIgKTtcclxuIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHN2Z0ZpbHRlcjtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgQ29sb3IgZnVuY3Rpb25cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBDb2xvckx1bWEgOiBmdW5jdGlvbiAoIGhleCwgbCApIHtcclxuXHJcbiAgICAgICAgLy9pZiggaGV4LnN1YnN0cmluZygwLCAzKSA9PT0gJ3JnYmEnICkgaGV4ID0gJyMwMDAnO1xyXG5cclxuICAgICAgICBpZiggaGV4ID09PSAnbicgKSBoZXggPSAnIzAwMCc7XHJcblxyXG4gICAgICAgIC8vIHZhbGlkYXRlIGhleCBzdHJpbmdcclxuICAgICAgICBoZXggPSBTdHJpbmcoaGV4KS5yZXBsYWNlKC9bXjAtOWEtZl0vZ2ksICcnKTtcclxuICAgICAgICBpZiAoaGV4Lmxlbmd0aCA8IDYpIHtcclxuICAgICAgICAgICAgaGV4ID0gaGV4WzBdK2hleFswXStoZXhbMV0raGV4WzFdK2hleFsyXStoZXhbMl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGwgPSBsIHx8IDA7XHJcblxyXG4gICAgICAgIC8vIGNvbnZlcnQgdG8gZGVjaW1hbCBhbmQgY2hhbmdlIGx1bWlub3NpdHlcclxuICAgICAgICBsZXQgcmdiID0gXCIjXCIsIGMsIGk7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDM7IGkrKykge1xyXG4gICAgICAgICAgICBjID0gcGFyc2VJbnQoaGV4LnN1YnN0cihpKjIsMiksIDE2KTtcclxuICAgICAgICAgICAgYyA9IE1hdGgucm91bmQoTWF0aC5taW4oTWF0aC5tYXgoMCwgYyArIChjICogbCkpLCAyNTUpKS50b1N0cmluZygxNik7XHJcbiAgICAgICAgICAgIHJnYiArPSAoXCIwMFwiK2MpLnN1YnN0cihjLmxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmdiO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZmluZERlZXBJbnZlcjogZnVuY3Rpb24gKCBjICkgeyBcclxuXHJcbiAgICAgICAgcmV0dXJuIChjWzBdICogMC4zICsgY1sxXSAqIC41OSArIGNbMl0gKiAuMTEpIDw9IDAuNjtcclxuICAgICAgICBcclxuICAgIH0sXHJcblxyXG4gICAgbGVycENvbG9yOiBmdW5jdGlvbiggYzEsIGMyLCBmYWN0b3IgKSB7XHJcbiAgICAgICAgbGV0IG5ld0NvbG9yID0ge307XHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgMzsgaSsrICkge1xyXG4gICAgICAgICAgbmV3Q29sb3JbaV0gPSBjMVsgaSBdICsgKCBjMlsgaSBdIC0gYzFbIGkgXSApICogZmFjdG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3Q29sb3I7XHJcbiAgICB9LFxyXG5cclxuICAgIGhleFRvSHRtbDogZnVuY3Rpb24gKCB2ICkgeyBcclxuICAgICAgICB2ID0gdiA9PT0gdW5kZWZpbmVkID8gMHgwMDAwMDAgOiB2O1xyXG4gICAgICAgIHJldHVybiBcIiNcIiArIChcIjAwMDAwMFwiICsgdi50b1N0cmluZygxNikpLnN1YnN0cigtNik7XHJcbiAgICAgICAgXHJcbiAgICB9LFxyXG5cclxuICAgIGh0bWxUb0hleDogZnVuY3Rpb24gKCB2ICkgeyBcclxuXHJcbiAgICAgICAgcmV0dXJuIHYudG9VcHBlckNhc2UoKS5yZXBsYWNlKFwiI1wiLCBcIjB4XCIpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdTI1NTogZnVuY3Rpb24gKGMsIGkpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KGMuc3Vic3RyaW5nKGksIGkgKyAyKSwgMTYpIC8gMjU1O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdTE2OiBmdW5jdGlvbiAoIGMsIGkgKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBwYXJzZUludChjLnN1YnN0cmluZyhpLCBpICsgMSksIDE2KSAvIDE1O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdW5wYWNrOiBmdW5jdGlvbiggYyApe1xyXG5cclxuICAgICAgICBpZiAoYy5sZW5ndGggPT0gNykgcmV0dXJuIFsgVC51MjU1KGMsIDEpLCBULnUyNTUoYywgMyksIFQudTI1NShjLCA1KSBdO1xyXG4gICAgICAgIGVsc2UgaWYgKGMubGVuZ3RoID09IDQpIHJldHVybiBbIFQudTE2KGMsMSksIFQudTE2KGMsMiksIFQudTE2KGMsMykgXTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHAyNTU6IGZ1bmN0aW9uICggYyApIHtcclxuICAgICAgICBsZXQgaCA9IE1hdGgucm91bmQoICggYyAqIDI1NSApICkudG9TdHJpbmcoIDE2ICk7XHJcbiAgICAgICAgaWYgKCBoLmxlbmd0aCA8IDIgKSBoID0gJzAnICsgaDtcclxuICAgICAgICByZXR1cm4gaDtcclxuICAgIH0sXHJcblxyXG4gICAgcGFjazogZnVuY3Rpb24gKCBjICkge1xyXG5cclxuICAgICAgICByZXR1cm4gJyMnICsgVC5wMjU1KCBjWyAwIF0gKSArIFQucDI1NSggY1sgMSBdICkgKyBULnAyNTUoIGNbIDIgXSApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgaHRtbFJnYjogZnVuY3Rpb24oIGMgKXtcclxuXHJcbiAgICAgICAgcmV0dXJuICdyZ2IoJyArIE1hdGgucm91bmQoY1swXSAqIDI1NSkgKyAnLCcrIE1hdGgucm91bmQoY1sxXSAqIDI1NSkgKyAnLCcrIE1hdGgucm91bmQoY1syXSAqIDI1NSkgKyAnKSc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBwYWQ6IGZ1bmN0aW9uKCBuICl7XHJcbiAgICAgICAgaWYobi5sZW5ndGggPT0gMSluID0gJzAnICsgbjtcclxuICAgICAgICByZXR1cm4gbjtcclxuICAgIH0sXHJcblxyXG4gICAgcmdiVG9IZXggOiBmdW5jdGlvbiggYyApe1xyXG5cclxuICAgICAgICBsZXQgciA9IE1hdGgucm91bmQoY1swXSAqIDI1NSkudG9TdHJpbmcoMTYpO1xyXG4gICAgICAgIGxldCBnID0gTWF0aC5yb3VuZChjWzFdICogMjU1KS50b1N0cmluZygxNik7XHJcbiAgICAgICAgbGV0IGIgPSBNYXRoLnJvdW5kKGNbMl0gKiAyNTUpLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICByZXR1cm4gJyMnICsgVC5wYWQocikgKyBULnBhZChnKSArIFQucGFkKGIpO1xyXG5cclxuICAgICAgIC8vIHJldHVybiAnIycgKyAoICcwMDAwMDAnICsgKCAoIGNbMF0gKiAyNTUgKSA8PCAxNiBeICggY1sxXSAqIDI1NSApIDw8IDggXiAoIGNbMl0gKiAyNTUgKSA8PCAwICkudG9TdHJpbmcoIDE2ICkgKS5zbGljZSggLSA2ICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBodWVUb1JnYjogZnVuY3Rpb24oIHAsIHEsIHQgKXtcclxuXHJcbiAgICAgICAgaWYgKCB0IDwgMCApIHQgKz0gMTtcclxuICAgICAgICBpZiAoIHQgPiAxICkgdCAtPSAxO1xyXG4gICAgICAgIGlmICggdCA8IDEgLyA2ICkgcmV0dXJuIHAgKyAoIHEgLSBwICkgKiA2ICogdDtcclxuICAgICAgICBpZiAoIHQgPCAxIC8gMiApIHJldHVybiBxO1xyXG4gICAgICAgIGlmICggdCA8IDIgLyAzICkgcmV0dXJuIHAgKyAoIHEgLSBwICkgKiA2ICogKCAyIC8gMyAtIHQgKTtcclxuICAgICAgICByZXR1cm4gcDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJnYlRvSHNsOiBmdW5jdGlvbiAoIGMgKSB7XHJcblxyXG4gICAgICAgIGxldCByID0gY1swXSwgZyA9IGNbMV0sIGIgPSBjWzJdLCBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKSwgbWF4ID0gTWF0aC5tYXgociwgZywgYiksIGRlbHRhID0gbWF4IC0gbWluLCBoID0gMCwgcyA9IDAsIGwgPSAobWluICsgbWF4KSAvIDI7XHJcbiAgICAgICAgaWYgKGwgPiAwICYmIGwgPCAxKSBzID0gZGVsdGEgLyAobCA8IDAuNSA/ICgyICogbCkgOiAoMiAtIDIgKiBsKSk7XHJcbiAgICAgICAgaWYgKGRlbHRhID4gMCkge1xyXG4gICAgICAgICAgICBpZiAobWF4ID09IHIgJiYgbWF4ICE9IGcpIGggKz0gKGcgLSBiKSAvIGRlbHRhO1xyXG4gICAgICAgICAgICBpZiAobWF4ID09IGcgJiYgbWF4ICE9IGIpIGggKz0gKDIgKyAoYiAtIHIpIC8gZGVsdGEpO1xyXG4gICAgICAgICAgICBpZiAobWF4ID09IGIgJiYgbWF4ICE9IHIpIGggKz0gKDQgKyAociAtIGcpIC8gZGVsdGEpO1xyXG4gICAgICAgICAgICBoIC89IDY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbIGgsIHMsIGwgXTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGhzbFRvUmdiOiBmdW5jdGlvbiAoIGMgKSB7XHJcblxyXG4gICAgICAgIGxldCBwLCBxLCBoID0gY1swXSwgcyA9IGNbMV0sIGwgPSBjWzJdO1xyXG5cclxuICAgICAgICBpZiAoIHMgPT09IDAgKSByZXR1cm4gWyBsLCBsLCBsIF07XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHEgPSBsIDw9IDAuNSA/IGwgKiAocyArIDEpIDogbCArIHMgLSAoIGwgKiBzICk7XHJcbiAgICAgICAgICAgIHAgPSBsICogMiAtIHE7XHJcbiAgICAgICAgICAgIHJldHVybiBbIFQuaHVlVG9SZ2IocCwgcSwgaCArIDAuMzMzMzMpLCBULmh1ZVRvUmdiKHAsIHEsIGgpLCBULmh1ZVRvUmdiKHAsIHEsIGggLSAwLjMzMzMzKSBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgU1ZHIE1PREVMXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbWFrZUdyYWRpYW50OiBmdW5jdGlvbiAoIHR5cGUsIHNldHRpbmdzLCBwYXJlbnQsIGNvbG9ycyApIHtcclxuXHJcbiAgICAgICAgVC5kb20oIHR5cGUsIG51bGwsIHNldHRpbmdzLCBwYXJlbnQsIDAgKTtcclxuXHJcbiAgICAgICAgbGV0IG4gPSBwYXJlbnQuY2hpbGROb2Rlc1swXS5jaGlsZE5vZGVzLmxlbmd0aCAtIDEsIGM7XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgY29sb3JzLmxlbmd0aDsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICBjID0gY29sb3JzW2ldO1xyXG4gICAgICAgICAgICAvL1QuZG9tKCAnc3RvcCcsIG51bGwsIHsgb2Zmc2V0OmNbMF0rJyUnLCBzdHlsZTonc3RvcC1jb2xvcjonK2NbMV0rJzsgc3RvcC1vcGFjaXR5OicrY1syXSsnOycgfSwgcGFyZW50LCBbMCxuXSApO1xyXG4gICAgICAgICAgICBULmRvbSggJ3N0b3AnLCBudWxsLCB7IG9mZnNldDpjWzBdKyclJywgJ3N0b3AtY29sb3InOmNbMV0sICAnc3RvcC1vcGFjaXR5JzpjWzJdIH0sIHBhcmVudCwgWzAsbl0gKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLyptYWtlR3JhcGg6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHcgPSAxMjg7XHJcbiAgICAgICAgbGV0IHJhZGl1cyA9IDM0O1xyXG4gICAgICAgIGxldCBzdmcgPSBULmRvbSggJ3N2ZycsIFQuY3NzLmJhc2ljICwgeyB2aWV3Qm94OicwIDAgJyt3KycgJyt3LCB3aWR0aDp3LCBoZWlnaHQ6dywgcHJlc2VydmVBc3BlY3RSYXRpbzonbm9uZScgfSApO1xyXG4gICAgICAgIFQuZG9tKCAncGF0aCcsICcnLCB7IGQ6JycsIHN0cm9rZTpULmNvbG9ycy50ZXh0LCAnc3Ryb2tlLXdpZHRoJzo0LCBmaWxsOidub25lJywgJ3N0cm9rZS1saW5lY2FwJzonYnV0dCcgfSwgc3ZnICk7Ly8wXHJcbiAgICAgICAgLy9ULmRvbSggJ3JlY3QnLCAnJywgeyB4OjEwLCB5OjEwLCB3aWR0aDoxMDgsIGhlaWdodDoxMDgsIHN0cm9rZToncmdiYSgwLDAsMCwwLjMpJywgJ3N0cm9rZS13aWR0aCc6MiAsIGZpbGw6J25vbmUnfSwgc3ZnICk7Ly8xXHJcbiAgICAgICAgLy9ULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMsIGZpbGw6VC5jb2xvcnMuYnV0dG9uLCBzdHJva2U6J3JnYmEoMCwwLDAsMC4zKScsICdzdHJva2Utd2lkdGgnOjggfSwgc3ZnICk7Ly8wXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9ULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMrNywgc3Ryb2tlOidyZ2JhKDAsMCwwLDAuMyknLCAnc3Ryb2tlLXdpZHRoJzo3ICwgZmlsbDonbm9uZSd9LCBzdmcgKTsvLzJcclxuICAgICAgICAvL1QuZG9tKCAncGF0aCcsICcnLCB7IGQ6JycsIHN0cm9rZToncmdiYSgyNTUsMjU1LDI1NSwwLjMpJywgJ3N0cm9rZS13aWR0aCc6MiwgZmlsbDonbm9uZScsICdzdHJva2UtbGluZWNhcCc6J3JvdW5kJywgJ3N0cm9rZS1vcGFjaXR5JzowLjUgfSwgc3ZnICk7Ly8zXHJcbiAgICAgICAgVC5ncmFwaCA9IHN2ZztcclxuXHJcbiAgICB9LCovXHJcblxyXG4gICAgbWFrZVBhZDogZnVuY3Rpb24gKCBtb2RlbCApIHtcclxuXHJcbiAgICAgICAgbGV0IHd3ID0gMjU2XHJcbiAgICAgICAgbGV0IHN2ZyA9IFQuZG9tKCAnc3ZnJywgVC5jc3MuYmFzaWMgKyAncG9zaXRpb246cmVsYXRpdmU7JywgeyB2aWV3Qm94OicwIDAgJyt3dysnICcrd3csIHdpZHRoOnd3LCBoZWlnaHQ6d3csIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICBsZXQgdyA9IDIwMDsgXHJcbiAgICAgICAgbGV0IGQgPSAod3ctdykqMC41LCBtID0gMjA7XHJcbiAgICAgICAgVG9vbHMuZG9tKCAncmVjdCcsICcnLCB7IHg6IGQsIHk6IGQsICB3aWR0aDogdywgaGVpZ2h0OiB3LCBmaWxsOlQuY29sb3JzLmJhY2sgfSwgc3ZnICk7IC8vIDBcclxuICAgICAgICBUb29scy5kb20oICdyZWN0JywgJycsIHsgeDogZCttKjAuNSwgeTogZCttKjAuNSwgd2lkdGg6IHcgLSBtICwgaGVpZ2h0OiB3IC0gbSwgZmlsbDpULmNvbG9ycy5idXR0b24gfSwgc3ZnICk7IC8vIDFcclxuICAgICAgICAvLyBQb2ludGVyXHJcbiAgICAgICAgVG9vbHMuZG9tKCAnbGluZScsICcnLCB7IHgxOiBkKyhtKjAuNSksIHkxOiB3dyAqMC41LCB4MjogZCsody1tKjAuNSksIHkyOiB3dyAqIDAuNSwgc3Ryb2tlOlQuY29sb3JzLmJhY2ssICdzdHJva2Utd2lkdGgnOiAyIH0sIHN2ZyApOyAvLyAyXHJcbiAgICAgICAgVG9vbHMuZG9tKCAnbGluZScsICcnLCB7IHgxOiB3dyAqIDAuNSwgeDI6IHd3ICogMC41LCB5MTogZCsobSowLjUpLCB5MjogZCsody1tKjAuNSksIHN0cm9rZTpULmNvbG9ycy5iYWNrLCAnc3Ryb2tlLXdpZHRoJzogMiB9LCBzdmcgKTsgLy8gM1xyXG4gICAgICAgIFRvb2xzLmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OiB3dyAqIDAuNSwgY3k6IHd3ICogMC41LCByOjUsIHN0cm9rZTogVC5jb2xvcnMudGV4dCwgJ3N0cm9rZS13aWR0aCc6IDUsIGZpbGw6J25vbmUnIH0sIHN2ZyApOyAvLyA0XHJcbiAgICAgICAgVC5wYWQyZCA9IHN2ZztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1ha2VLbm9iOiBmdW5jdGlvbiAoIG1vZGVsICkge1xyXG5cclxuICAgICAgICBsZXQgdyA9IDEyODtcclxuICAgICAgICBsZXQgcmFkaXVzID0gMzQ7XHJcbiAgICAgICAgbGV0IHN2ZyA9IFQuZG9tKCAnc3ZnJywgVC5jc3MuYmFzaWMgKyAncG9zaXRpb246cmVsYXRpdmU7JywgeyB2aWV3Qm94OicwIDAgJyt3KycgJyt3LCB3aWR0aDp3LCBoZWlnaHQ6dywgcHJlc2VydmVBc3BlY3RSYXRpbzonbm9uZScgfSApO1xyXG4gICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOnJhZGl1cywgZmlsbDpULmNvbG9ycy5idXR0b24sIHN0cm9rZToncmdiYSgwLDAsMCwwLjMpJywgJ3N0cm9rZS13aWR0aCc6OCB9LCBzdmcgKTsvLzBcclxuICAgICAgICBULmRvbSggJ3BhdGgnLCAnJywgeyBkOicnLCBzdHJva2U6VC5jb2xvcnMudGV4dCwgJ3N0cm9rZS13aWR0aCc6NCwgZmlsbDonbm9uZScsICdzdHJva2UtbGluZWNhcCc6J3JvdW5kJyB9LCBzdmcgKTsvLzFcclxuICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMrNywgc3Ryb2tlOidyZ2JhKDAsMCwwLDAuMSknLCAnc3Ryb2tlLXdpZHRoJzo3ICwgZmlsbDonbm9uZSd9LCBzdmcgKTsvLzJcclxuICAgICAgICBULmRvbSggJ3BhdGgnLCAnJywgeyBkOicnLCBzdHJva2U6J3JnYmEoMjU1LDI1NSwyNTUsMC4zKScsICdzdHJva2Utd2lkdGgnOjIsIGZpbGw6J25vbmUnLCAnc3Ryb2tlLWxpbmVjYXAnOidyb3VuZCcsICdzdHJva2Utb3BhY2l0eSc6MC41IH0sIHN2ZyApOy8vM1xyXG4gICAgICAgIFQua25vYiA9IHN2ZztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1ha2VDaXJjdWxhcjogZnVuY3Rpb24gKCBtb2RlbCApIHtcclxuXHJcbiAgICAgICAgbGV0IHcgPSAxMjg7XHJcbiAgICAgICAgbGV0IHJhZGl1cyA9IDQwO1xyXG4gICAgICAgIGxldCBzdmcgPSBULmRvbSggJ3N2ZycsIFQuY3NzLmJhc2ljICsgJ3Bvc2l0aW9uOnJlbGF0aXZlOycsIHsgdmlld0JveDonMCAwICcrdysnICcrdywgd2lkdGg6dywgaGVpZ2h0OncsIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMsIHN0cm9rZToncmdiYSgwLDAsMCwwLjEpJywgJ3N0cm9rZS13aWR0aCc6MTAsIGZpbGw6J25vbmUnIH0sIHN2ZyApOy8vMFxyXG4gICAgICAgIFQuZG9tKCAncGF0aCcsICcnLCB7IGQ6JycsIHN0cm9rZTpULmNvbG9ycy50ZXh0LCAnc3Ryb2tlLXdpZHRoJzo3LCBmaWxsOidub25lJywgJ3N0cm9rZS1saW5lY2FwJzonYnV0dCcgfSwgc3ZnICk7Ly8xXHJcbiAgICAgICAgVC5jaXJjdWxhciA9IHN2ZztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1ha2VKb3lzdGljazogZnVuY3Rpb24gKCBtb2RlbCApIHtcclxuXHJcbiAgICAgICAgLy8rJyBiYWNrZ3JvdW5kOiNmMDA7J1xyXG5cclxuICAgICAgICBsZXQgdyA9IDEyOCwgY2NjO1xyXG4gICAgICAgIGxldCByYWRpdXMgPSBNYXRoLmZsb29yKCh3LTMwKSowLjUpO1xyXG4gICAgICAgIGxldCBpbm5lclJhZGl1cyA9IE1hdGguZmxvb3IocmFkaXVzKjAuNik7XHJcbiAgICAgICAgbGV0IHN2ZyA9IFQuZG9tKCAnc3ZnJywgVC5jc3MuYmFzaWMgKyAncG9zaXRpb246cmVsYXRpdmU7JywgeyB2aWV3Qm94OicwIDAgJyt3KycgJyt3LCB3aWR0aDp3LCBoZWlnaHQ6dywgcHJlc2VydmVBc3BlY3RSYXRpbzonbm9uZScgfSApO1xyXG4gICAgICAgIFQuZG9tKCAnZGVmcycsIG51bGwsIHt9LCBzdmcgKTtcclxuICAgICAgICBULmRvbSggJ2cnLCBudWxsLCB7fSwgc3ZnICk7XHJcblxyXG4gICAgICAgIGlmKCBtb2RlbCA9PT0gMCApe1xyXG5cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgICAgIC8vIGdyYWRpYW4gYmFja2dyb3VuZFxyXG4gICAgICAgICAgICBjY2MgPSBbIFs0MCwgJ3JnYigwLDAsMCknLCAwLjNdLCBbODAsICdyZ2IoMCwwLDApJywgMF0sIFs5MCwgJ3JnYig1MCw1MCw1MCknLCAwLjRdLCBbMTAwLCAncmdiKDUwLDUwLDUwKScsIDBdIF07XHJcbiAgICAgICAgICAgIFQubWFrZUdyYWRpYW50KCAncmFkaWFsR3JhZGllbnQnLCB7IGlkOidncmFkJywgY3g6JzUwJScsIGN5Oic1MCUnLCByOic1MCUnLCBmeDonNTAlJywgZnk6JzUwJScgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGdyYWRpYW4gc2hhZG93XHJcbiAgICAgICAgICAgIGNjYyA9IFsgWzYwLCAncmdiKDAsMCwwKScsIDAuNV0sIFsxMDAsICdyZ2IoMCwwLDApJywgMF0gXTtcclxuICAgICAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdyYWRpYWxHcmFkaWVudCcsIHsgaWQ6J2dyYWRTJywgY3g6JzUwJScsIGN5Oic1MCUnLCByOic1MCUnLCBmeDonNTAlJywgZnk6JzUwJScgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGdyYWRpYW4gc3RpY2tcclxuICAgICAgICAgICAgbGV0IGNjMCA9IFsncmdiKDQwLDQwLDQwKScsICdyZ2IoNDgsNDgsNDgpJywgJ3JnYigzMCwzMCwzMCknXTtcclxuICAgICAgICAgICAgbGV0IGNjMSA9IFsncmdiKDEsOTAsMTk3KScsICdyZ2IoMyw5NSwyMDcpJywgJ3JnYigwLDY1LDE2NyknXTtcclxuXHJcbiAgICAgICAgICAgIGNjYyA9IFsgWzMwLCBjYzBbMF0sIDFdLCBbNjAsIGNjMFsxXSwgMV0sIFs4MCwgY2MwWzFdLCAxXSwgWzEwMCwgY2MwWzJdLCAxXSBdO1xyXG4gICAgICAgICAgICBULm1ha2VHcmFkaWFudCggJ3JhZGlhbEdyYWRpZW50JywgeyBpZDonZ3JhZEluJywgY3g6JzUwJScsIGN5Oic1MCUnLCByOic1MCUnLCBmeDonNTAlJywgZnk6JzUwJScgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgICAgIGNjYyA9IFsgWzMwLCBjYzFbMF0sIDFdLCBbNjAsIGNjMVsxXSwgMV0sIFs4MCwgY2MxWzFdLCAxXSwgWzEwMCwgY2MxWzJdLCAxXSBdO1xyXG4gICAgICAgICAgICBULm1ha2VHcmFkaWFudCggJ3JhZGlhbEdyYWRpZW50JywgeyBpZDonZ3JhZEluMicsIGN4Oic1MCUnLCBjeTonNTAlJywgcjonNTAlJywgZng6JzUwJScsIGZ5Oic1MCUnIH0sIHN2ZywgY2NjICk7XHJcblxyXG4gICAgICAgICAgICAvLyBncmFwaFxyXG5cclxuICAgICAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzLCBmaWxsOid1cmwoI2dyYWQpJyB9LCBzdmcgKTsvLzJcclxuICAgICAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCs1LCBjeTo2NCsxMCwgcjppbm5lclJhZGl1cysxMCwgZmlsbDondXJsKCNncmFkUyknIH0sIHN2ZyApOy8vM1xyXG4gICAgICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjppbm5lclJhZGl1cywgZmlsbDondXJsKCNncmFkSW4pJyB9LCBzdmcgKTsvLzRcclxuXHJcbiAgICAgICAgICAgIFQuam95c3RpY2tfMCA9IHN2ZztcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgIC8vIGdyYWRpYW4gc2hhZG93XHJcbiAgICAgICAgICAgIGNjYyA9IFsgWzY5LCAncmdiKDAsMCwwKScsIDBdLFs3MCwgJ3JnYigwLDAsMCknLCAwLjNdLCBbMTAwLCAncmdiKDAsMCwwKScsIDBdIF07XHJcbiAgICAgICAgICAgIFQubWFrZUdyYWRpYW50KCAncmFkaWFsR3JhZGllbnQnLCB7IGlkOidncmFkWCcsIGN4Oic1MCUnLCBjeTonNTAlJywgcjonNTAlJywgZng6JzUwJScsIGZ5Oic1MCUnIH0sIHN2ZywgY2NjICk7XHJcblxyXG4gICAgICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMsIGZpbGw6J25vbmUnLCBzdHJva2U6J3JnYmEoMTAwLDEwMCwxMDAsMC4yNSknLCAnc3Ryb2tlLXdpZHRoJzonNCcgfSwgc3ZnICk7Ly8yXHJcbiAgICAgICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOmlubmVyUmFkaXVzKzE0LCBmaWxsOid1cmwoI2dyYWRYKScgfSwgc3ZnICk7Ly8zXHJcbiAgICAgICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOmlubmVyUmFkaXVzLCBmaWxsOidub25lJywgc3Ryb2tlOidyZ2IoMTAwLDEwMCwxMDApJywgJ3N0cm9rZS13aWR0aCc6JzQnIH0sIHN2ZyApOy8vNFxyXG5cclxuICAgICAgICAgICAgVC5qb3lzdGlja18xID0gc3ZnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtYWtlQ29sb3JSaW5nOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGxldCB3ID0gMjU2O1xyXG4gICAgICAgIGxldCBzdmcgPSBULmRvbSggJ3N2ZycsIFQuY3NzLmJhc2ljICsgJ3Bvc2l0aW9uOnJlbGF0aXZlOycsIHsgdmlld0JveDonMCAwICcrdysnICcrdywgd2lkdGg6dywgaGVpZ2h0OncsIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICBULmRvbSggJ2RlZnMnLCBudWxsLCB7fSwgc3ZnICk7XHJcbiAgICAgICAgVC5kb20oICdnJywgbnVsbCwge30sIHN2ZyApO1xyXG5cclxuICAgICAgICBsZXQgcyA9IDMwOy8vc3Ryb2tlXHJcbiAgICAgICAgbGV0IHIgPSggdy1zICkqMC41O1xyXG4gICAgICAgIGxldCBtaWQgPSB3KjAuNTtcclxuICAgICAgICBsZXQgbiA9IDI0LCBudWRnZSA9IDggLyByIC8gbiAqIE1hdGguUEksIGExID0gMCwgZDE7XHJcbiAgICAgICAgbGV0IGFtLCB0YW4sIGQyLCBhMiwgYXIsIGksIGosIHBhdGgsIGNjYztcclxuICAgICAgICBsZXQgY29sb3IgPSBbXTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKCBpID0gMDsgaSA8PSBuOyArK2kpIHtcclxuXHJcbiAgICAgICAgICAgIGQyID0gaSAvIG47XHJcbiAgICAgICAgICAgIGEyID0gZDIgKiBULlR3b1BJO1xyXG4gICAgICAgICAgICBhbSA9IChhMSArIGEyKSAqIDAuNTtcclxuICAgICAgICAgICAgdGFuID0gMSAvIE1hdGguY29zKChhMiAtIGExKSAqIDAuNSk7XHJcblxyXG4gICAgICAgICAgICBhciA9IFtcclxuICAgICAgICAgICAgICAgIE1hdGguc2luKGExKSwgLU1hdGguY29zKGExKSwgXHJcbiAgICAgICAgICAgICAgICBNYXRoLnNpbihhbSkgKiB0YW4sIC1NYXRoLmNvcyhhbSkgKiB0YW4sIFxyXG4gICAgICAgICAgICAgICAgTWF0aC5zaW4oYTIpLCAtTWF0aC5jb3MoYTIpXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb2xvclsxXSA9IFQucmdiVG9IZXgoIFQuaHNsVG9SZ2IoW2QyLCAxLCAwLjVdKSApO1xyXG5cclxuICAgICAgICAgICAgaWYgKGkgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaiA9IDY7XHJcbiAgICAgICAgICAgICAgICB3aGlsZShqLS0pe1xyXG4gICAgICAgICAgICAgICAgICAgYXJbal0gPSAoKGFyW2pdKnIpK21pZCkudG9GaXhlZCgyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwYXRoID0gJyBNJyArIGFyWzBdICsgJyAnICsgYXJbMV0gKyAnIFEnICsgYXJbMl0gKyAnICcgKyBhclszXSArICcgJyArIGFyWzRdICsgJyAnICsgYXJbNV07XHJcblxyXG4gICAgICAgICAgICAgICAgY2NjID0gWyBbMCxjb2xvclswXSwxXSwgWzEwMCxjb2xvclsxXSwxXSBdO1xyXG4gICAgICAgICAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdsaW5lYXJHcmFkaWVudCcsIHsgaWQ6J0cnK2ksIHgxOmFyWzBdLCB5MTphclsxXSwgeDI6YXJbNF0sIHkyOmFyWzVdLCBncmFkaWVudFVuaXRzOlwidXNlclNwYWNlT25Vc2VcIiB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICAgICAgICAgIFQuZG9tKCAncGF0aCcsICcnLCB7IGQ6cGF0aCwgJ3N0cm9rZS13aWR0aCc6cywgc3Ryb2tlOid1cmwoI0cnK2krJyknLCAnc3Ryb2tlLWxpbmVjYXAnOlwiYnV0dFwiIH0sIHN2ZywgMSApO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYTEgPSBhMiAtIG51ZGdlOyBcclxuICAgICAgICAgICAgY29sb3JbMF0gPSBjb2xvclsxXTtcclxuICAgICAgICAgICAgZDEgPSBkMjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBiciA9ICgxMjggLSBzICkgKyAyO1xyXG4gICAgICAgIGxldCBidyA9IDYwO1xyXG5cclxuICAgICAgICBsZXQgdHcgPSA4NC45MDtcclxuXHJcbiAgICAgICAgLy8gYmxhY2sgLyB3aGl0ZVxyXG4gICAgICAgIGNjYyA9IFsgWzAsICcjRkZGRkZGJywgMV0sIFs1MCwgJyNGRkZGRkYnLCAwXSwgWzUwLCAnIzAwMDAwMCcsIDBdLCBbMTAwLCAnIzAwMDAwMCcsIDFdIF07XHJcbiAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdsaW5lYXJHcmFkaWVudCcsIHsgaWQ6J0dMMCcsIHgxOjAsIHkxOm1pZC10dywgeDI6MCwgeTI6bWlkK3R3LCBncmFkaWVudFVuaXRzOlwidXNlclNwYWNlT25Vc2VcIiB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICBjY2MgPSBbIFswLCAnIzdmN2Y3ZicsIDFdLCBbNTAsICcjN2Y3ZjdmJywgMC41XSwgWzEwMCwgJyM3ZjdmN2YnLCAwXSBdO1xyXG4gICAgICAgIFQubWFrZUdyYWRpYW50KCAnbGluZWFyR3JhZGllbnQnLCB7IGlkOidHTDEnLCB4MTptaWQtNDkuMDUsIHkxOjAsIHgyOm1pZCs5OCwgeTI6MCwgZ3JhZGllbnRVbml0czpcInVzZXJTcGFjZU9uVXNlXCIgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgVC5kb20oICdnJywgbnVsbCwgeyAndHJhbnNmb3JtLW9yaWdpbic6ICcxMjhweCAxMjhweCcsICd0cmFuc2Zvcm0nOidyb3RhdGUoMCknIH0sIHN2ZyApOy8vMlxyXG4gICAgICAgIFQuZG9tKCAncG9seWdvbicsICcnLCB7IHBvaW50czonNzguOTUgNDMuMSA3OC45NSAyMTIuODUgMjI2IDEyOCcsICBmaWxsOidyZWQnICB9LCBzdmcsIDIgKTsvLyAyLDBcclxuICAgICAgICBULmRvbSggJ3BvbHlnb24nLCAnJywgeyBwb2ludHM6Jzc4Ljk1IDQzLjEgNzguOTUgMjEyLjg1IDIyNiAxMjgnLCAgZmlsbDondXJsKCNHTDEpJywnc3Ryb2tlLXdpZHRoJzoxLCBzdHJva2U6J3VybCgjR0wxKScgIH0sIHN2ZywgMiApOy8vMiwxXHJcbiAgICAgICAgVC5kb20oICdwb2x5Z29uJywgJycsIHsgcG9pbnRzOic3OC45NSA0My4xIDc4Ljk1IDIxMi44NSAyMjYgMTI4JywgIGZpbGw6J3VybCgjR0wwKScsJ3N0cm9rZS13aWR0aCc6MSwgc3Ryb2tlOid1cmwoI0dMMCknICB9LCBzdmcsIDIgKTsvLzIsMlxyXG4gICAgICAgIFQuZG9tKCAncGF0aCcsICcnLCB7IGQ6J00gMjU1Ljc1IDEzNi41IFEgMjU2IDEzMi4zIDI1NiAxMjggMjU2IDEyMy43IDI1NS43NSAxMTkuNSBMIDI0MSAxMjggMjU1Ljc1IDEzNi41IFonLCAgZmlsbDonbm9uZScsJ3N0cm9rZS13aWR0aCc6Miwgc3Ryb2tlOicjMDAwJyAgfSwgc3ZnLCAyICk7Ly8yLDNcclxuICAgICAgICAvL1QuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6MTI4KzExMywgY3k6MTI4LCByOjYsICdzdHJva2Utd2lkdGgnOjMsIHN0cm9rZTonIzAwMCcsIGZpbGw6J25vbmUnIH0sIHN2ZywgMiApOy8vMi4zXHJcblxyXG4gICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6MTI4LCBjeToxMjgsIHI6NiwgJ3N0cm9rZS13aWR0aCc6Miwgc3Ryb2tlOicjMDAwJywgZmlsbDonbm9uZScgfSwgc3ZnICk7Ly8zXHJcblxyXG4gICAgICAgIFQuY29sb3JSaW5nID0gc3ZnO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgaWNvbjogZnVuY3Rpb24gKCB0eXBlLCBjb2xvciwgdyApe1xyXG5cclxuICAgICAgICB3ID0gdyB8fCA0MDtcclxuICAgICAgICAvL2NvbG9yID0gY29sb3IgfHwgJyNERURFREUnO1xyXG4gICAgICAgIGxldCB2aWV3Qm94ID0gJzAgMCAyNTYgMjU2JztcclxuICAgICAgICAvL2xldCB2aWV3Qm94ID0gJzAgMCAnKyB3ICsnICcrIHc7XHJcbiAgICAgICAgbGV0IHQgPSBbXCI8c3ZnIHhtbG5zPSdcIitULnN2Z25zK1wiJyB2ZXJzaW9uPScxLjEnIHhtbG5zOnhsaW5rPSdcIitULmh0bWxzK1wiJyBzdHlsZT0ncG9pbnRlci1ldmVudHM6bm9uZTsnIHByZXNlcnZlQXNwZWN0UmF0aW89J3hNaW5ZTWF4IG1lZXQnIHg9JzBweCcgeT0nMHB4JyB3aWR0aD0nXCIrdytcInB4JyBoZWlnaHQ9J1wiK3crXCJweCcgdmlld0JveD0nXCIrdmlld0JveCtcIic+PGc+XCJdO1xyXG4gICAgICAgIHN3aXRjaCh0eXBlKXtcclxuICAgICAgICAgICAgY2FzZSAnbG9nbyc6XHJcbiAgICAgICAgICAgIHRbMV09XCI8cGF0aCBpZD0nbG9nb2luJyBmaWxsPSdcIitjb2xvcitcIicgc3Ryb2tlPSdub25lJyBkPSdcIitULmxvZ29GaWxsX2QrXCInLz5cIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2RvbmF0ZSc6XHJcbiAgICAgICAgICAgIHRbMV09XCI8cGF0aCBpZD0nbG9nb2luJyBmaWxsPSdcIitjb2xvcitcIicgc3Ryb2tlPSdub25lJyBkPSdcIitULmxvZ29fZG9uYXRlK1wiJy8+XCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICduZW8nOlxyXG4gICAgICAgICAgICB0WzFdPVwiPHBhdGggaWQ9J2xvZ29pbicgZmlsbD0nXCIrY29sb3IrXCInIHN0cm9rZT0nbm9uZScgZD0nXCIrVC5sb2dvX25lbytcIicvPlwiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAncGh5JzpcclxuICAgICAgICAgICAgdFsxXT1cIjxwYXRoIGlkPSdsb2dvaW4nIHN0cm9rZT0nXCIrY29sb3IrXCInIHN0cm9rZS13aWR0aD0nNDknIHN0cm9rZS1saW5lam9pbj0ncm91bmQnIHN0cm9rZS1saW5lY2FwPSdidXR0JyBmaWxsPSdub25lJyBkPSdcIitULmxvZ29fcGh5K1wiJy8+XCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdjb25maWcnOlxyXG4gICAgICAgICAgICB0WzFdPVwiPHBhdGggaWQ9J2xvZ29pbicgc3Ryb2tlPSdcIitjb2xvcitcIicgc3Ryb2tlLXdpZHRoPSc0OScgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgc3Ryb2tlLWxpbmVjYXA9J2J1dHQnIGZpbGw9J25vbmUnIGQ9J1wiK1QubG9nb19jb25maWcrXCInLz5cIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2dpdGh1Yic6XHJcbiAgICAgICAgICAgIHRbMV09XCI8cGF0aCBpZD0nbG9nb2luJyBmaWxsPSdcIitjb2xvcitcIicgc3Ryb2tlPSdub25lJyBkPSdcIitULmxvZ29fZ2l0aHViK1wiJy8+XCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdzYXZlJzpcclxuICAgICAgICAgICAgdFsxXT1cIjxwYXRoIHN0cm9rZT0nXCIrY29sb3IrXCInIHN0cm9rZS13aWR0aD0nNCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBmaWxsPSdub25lJyBkPSdNIDI2LjEyNSAxNyBMIDIwIDIyLjk1IDE0LjA1IDE3IE0gMjAgOS45NSBMIDIwIDIyLjk1Jy8+PHBhdGggc3Ryb2tlPSdcIitjb2xvcjtcclxuICAgICAgICAgICAgdFsxXSs9XCInIHN0cm9rZS13aWR0aD0nMi41JyBzdHJva2UtbGluZWpvaW49J3JvdW5kJyBzdHJva2UtbGluZWNhcD0ncm91bmQnIGZpbGw9J25vbmUnIGQ9J00gMzIuNiAyMyBMIDMyLjYgMjUuNSBRIDMyLjYgMjguNSAyOS42IDI4LjUgTCAxMC42IDI4LjUgUSA3LjYgMjguNSA3LjYgMjUuNSBMIDcuNiAyMycvPlwiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgdFsyXSA9IFwiPC9nPjwvc3ZnPlwiO1xyXG4gICAgICAgIHJldHVybiB0LmpvaW4oXCJcXG5cIik7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBsb2dvRmlsbF9kOmBcclxuICAgIE0gMTcxIDE1MC43NSBMIDE3MSAzMy4yNSAxNTUuNSAzMy4yNSAxNTUuNSAxNTAuNzUgUSAxNTUuNSAxNjIuMiAxNDcuNDUgMTcwLjIgMTM5LjQ1IDE3OC4yNSAxMjggMTc4LjI1IDExNi42IDE3OC4yNSAxMDguNTUgMTcwLjIgMTAwLjUgMTYyLjIgMTAwLjUgMTUwLjc1IFxyXG4gICAgTCAxMDAuNSAzMy4yNSA4NSAzMy4yNSA4NSAxNTAuNzUgUSA4NSAxNjguNjUgOTcuNTUgMTgxLjE1IDExMC4xNSAxOTMuNzUgMTI4IDE5My43NSAxNDUuOSAxOTMuNzUgMTU4LjQgMTgxLjE1IDE3MSAxNjguNjUgMTcxIDE1MC43NSBcclxuICAgIE0gMjAwIDMzLjI1IEwgMTg0IDMzLjI1IDE4NCAxNTAuOCBRIDE4NCAxNzQuMSAxNjcuNiAxOTAuNCAxNTEuMyAyMDYuOCAxMjggMjA2LjggMTA0Ljc1IDIwNi44IDg4LjMgMTkwLjQgNzIgMTc0LjEgNzIgMTUwLjggTCA3MiAzMy4yNSA1NiAzMy4yNSA1NiAxNTAuNzUgXHJcbiAgICBRIDU2IDE4MC41NSA3Ny4wNSAyMDEuNiA5OC4yIDIyMi43NSAxMjggMjIyLjc1IDE1Ny44IDIyMi43NSAxNzguOSAyMDEuNiAyMDAgMTgwLjU1IDIwMCAxNTAuNzUgTCAyMDAgMzMuMjUgWlxyXG4gICAgYCxcclxuXHJcbiAgICBsb2dvX2dpdGh1YjpgXHJcbiAgICBNIDE4MC41IDcwIFEgMTg2LjMgODIuNCAxODEuNTUgOTYuNTUgMTk2LjUgMTExLjUgMTg5LjcgMTQwLjY1IDE4My42NSAxNjguMzUgMTQ2IDE3Mi43IDE1Mi41IDE3OC43IDE1Mi41NSAxODUuOSBMIDE1Mi41NSAyMTguMTUgUSAxNTIuODQgMjI0LjU2IDE1OS4xNSAyMjMuMyBcclxuICAgIDE1OS4yMSAyMjMuMyAxNTkuMjUgMjIzLjMgMTgxLjE0IDIxNi4yNSAxOTguNyAxOTguNyAyMjggMTY5LjQgMjI4IDEyOCAyMjggODYuNiAxOTguNyA1Ny4zIDE2OS40IDI4IDEyOCAyOCA4Ni42IDI4IDU3LjMgNTcuMyAyOCA4Ni42IDI4IDEyOCAyOCAxNjkuNCA1Ny4zIDE5OC43IDc0Ljg1IFxyXG4gICAgMjE2LjI1IDk2Ljc1IDIyMy4zIDk2Ljc4IDIyMy4zIDk2LjggMjIzLjMgMTAzLjE2IDIyNC41NCAxMDMuNDUgMjE4LjE1IEwgMTAzLjQ1IDIwMCBRIDgyLjk3IDIwMy4xIDc1LjEgMTk2LjM1IDY5Ljg1IDE5MS42NSA2OC40IDE4NS40NSA2NC4yNyAxNzcuMDU1IDU5LjQgMTc0LjE1IDQ5LjIwIFxyXG4gICAgMTY2Ljg3IDYwLjggMTY3LjggNjkuODUgMTY5LjYxIDc1LjcgMTgwIDgxLjEzIDE4OC4wOSA5MCAxODguNTUgOTguMTggMTg4Ljg2IDEwMy40NSAxODUuOSAxMDMuNDkgMTc4LjY3IDExMCAxNzIuNyA3Mi4zMyAxNjguMzMgNjYuMyAxNDAuNjUgNTkuNDggMTExLjQ5IDc0LjQ1IDk2LjU1IDY5LjcgXHJcbiAgICA4Mi40MSA3NS41IDcwIDg0Ljg3IDY4Ljc0IDEwMy4xNSA4MCAxMTUuMTI1IDc2LjYzNSAxMjggNzYuODUgMTQwLjg1IDc2LjY1IDE1Mi44NSA4MCAxNzEuMSA2OC43NSAxODAuNSA3MCBaXHJcbiAgICBgLFxyXG5cclxuICAgIGxvZ29fbmVvOmBcclxuICAgIE0gMjE5IDUyIEwgMjA2IDUyIDIwNiAxNjYgUSAyMDYgMTgzLjQgMTkzLjc1IDE5NS42NSAxODEuNCAyMDggMTY0IDIwOCAxNDYuNiAyMDggMTM0LjM1IDE5NS42NSAxMjIgMTgzLjQgMTIyIDE2NiBMIDEyMiA5MCBRIDEyMiA3Ny42IDExMy4xNSA2OC44NSAxMDQuNCA2MCA5MiA2MCA3OS41NSBcclxuICAgIDYwIDcwLjc1IDY4Ljg1IDYyIDc3LjYgNjIgOTAgTCA2MiAyMDQgNzUgMjA0IDc1IDkwIFEgNzUgODMgNzkuOTUgNzggODQuOTUgNzMgOTIgNzMgOTkgNzMgMTA0IDc4IDEwOSA4MyAxMDkgOTAgTCAxMDkgMTY2IFEgMTA5IDE4OC44IDEyNS4xNSAyMDQuODUgMTQxLjIgMjIxIDE2NCAyMjEgXHJcbiAgICAxODYuNzUgMjIxIDIwMi45NSAyMDQuODUgMjE5IDE4OC44IDIxOSAxNjYgTCAyMTkgNTIgTSAxOTQgNTIgTCAxODEgNTIgMTgxIDE2NiBRIDE4MSAxNzMgMTc2LjA1IDE3OCAxNzEuMDUgMTgzIDE2NCAxODMgMTU3IDE4MyAxNTIgMTc4IDE0NyAxNzMgMTQ3IDE2NiBMIDE0NyA5MCBRIDE0NyBcclxuICAgIDY3LjIgMTMwLjg1IDUxLjE1IDExNC44IDM1IDkyIDM1IDY5LjI1IDM1IDUzLjA1IDUxLjE1IDM3IDY3LjIgMzcgOTAgTCAzNyAyMDQgNTAgMjA0IDUwIDkwIFEgNTAgNzIuNiA2Mi4yNSA2MC4zNSA3NC42IDQ4IDkyIDQ4IDEwOS40IDQ4IDEyMS42NSA2MC4zNSAxMzQgNzIuNiAxMzQgOTAgTCBcclxuICAgIDEzNCAxNjYgUSAxMzQgMTc4LjQgMTQyLjg1IDE4Ny4xNSAxNTEuNiAxOTYgMTY0IDE5NiAxNzYuNDUgMTk2IDE4NS4yNSAxODcuMTUgMTk0IDE3OC40IDE5NCAxNjYgTCAxOTQgNTIgWlxyXG4gICAgYCxcclxuXHJcbiAgICBsb2dvX3BoeTpgXHJcbiAgICBNIDEwMy41NSAzNy45NSBMIDEyNy45NSAzNy45NSBRIDE2Mi4zNSAzNy45NSAxODYuNSA1NSAyMTAuOSA3Mi4zNSAyMTAuOSA5Ni41IDIxMC45IDEyMC42NSAxODYuNSAxMzcuNyAxNjIuMzUgMTU1IDEyNy45NSAxNTUgTCAxMjcuOTUgMjM3Ljk1IE0gMTI3Ljk1IDE1NSBcclxuICAgIFEgOTMuNTUgMTU1IDY5LjE1IDEzNy43IDQ1IDEyMC42NSA0NSA5Ni41IDQ1IDcyLjM1IDY5LjE1IDU1IDcwLjkgNTMuOCA3Mi44NSA1Mi44NSBNIDEyNy45NSAxNTUgTCAxMjcuOTUgMzcuOTVcclxuICAgIGAsXHJcblxyXG4gICAgbG9nb19jb25maWc6YFxyXG4gICAgTSAyMDQuMzUgNTEuNjUgTCAxNzMuMjUgODIuNzUgUSAxOTIgMTAxLjUgMTkyIDEyOCBMIDIzNiAxMjggTSAxOTIgMTI4IFEgMTkyIDE1NC41NSAxNzMuMjUgMTczLjI1IEwgMjA0LjQgMjA0LjQgTSA1MS42NSA1MS42NSBMIDgyLjc1IDgyLjc1IFEgMTAxLjUgNjQgMTI4IDY0IFxyXG4gICAgTCAxMjggMjAgTSA1MS42IDIwNC40IEwgODIuNzUgMTczLjI1IFEgNjQgMTU0LjU1IDY0IDEyOCBMIDIwIDEyOCBNIDEyOCAyMzYgTCAxMjggMTkyIFEgMTAxLjUgMTkyIDgyLjc1IDE3My4yNSBNIDY0IDEyOCBRIDY0IDEwMS41IDgyLjc1IDgyLjc1IE0gMTczLjI1IDE3My4yNSBcclxuICAgIFEgMTU0LjU1IDE5MiAxMjggMTkyIE0gMTI4IDY0IFEgMTU0LjU1IDY0IDE3My4yNSA4Mi43NVxyXG4gICAgYCxcclxuXHJcbiAgICBsb2dvX2RvbmF0ZTpgXHJcbiAgICBNIDE3MS4zIDgwLjMgUSAxNzkuNSA2Mi4xNSAxNzEuMyA0NS44IDE2NC4xIDMyLjUgMTQxLjM1IDMwLjEgTCA5NC4zNSAzMC4xIFEgODkuMzUgMzAuNCA4OC4zIDM1LjE1IEwgNzAuNSAxNDguMDUgUSA3MC4yIDE1Mi41IDczLjcgMTUyLjYgTCAxMDAuOTUgMTUyLjYgMTA3IDExMS42IFEgMTA4Ljc1IFxyXG4gICAgMTA2LjU1IDExMi42IDEwNi40NSAxMzAuNDUgMTA4LjA1IDE0NS4zIDEwMy45IDE2My4zNSA5OC43NSAxNzEuMyA4MC4zIE0gMTc5LjggNzEuNSBRIDE3OC42IDc5Ljc1IDE3NC45IDg3Ljg1IDE2OC40NSAxMDIuOSAxNTEuOSAxMDkuMTUgMTQwLjY1IDExMy45NSAxMTcuNTUgMTEzIDExMy4xNSBcclxuICAgIDExMi43NSAxMTEgMTE3LjQ1IEwgMTAyLjcgMTY5Ljk1IFEgMTAyLjQ1IDE3My44IDEwNS41IDE3My44NSBMIDEyOC45NSAxNzMuODUgUSAxMzIuMiAxNzQuMiAxMzMuMzUgMTY5LjY1IEwgMTM4LjMgMTM5Ljk1IFEgMTM5Ljc1IDEzNS42IDE0My4xIDEzNS41IDE0Ni42IDEzNS43NSAxNTAuNiAxMzUuNjUgXHJcbiAgICAxNTQuNTUgMTM1LjUgMTU3LjM1IDEzNS4xIDE2MC4xNSAxMzQuNyAxNjYuNzUgMTMyLjM1IDE4MS4zNSAxMjcuNCAxODcuOSAxMTEuMiAxOTQuMjUgOTUuNzUgMTg5LjUgODEuOTUgMTg2Ljc1IDc0Ljg1IDE3OS44IDcxLjUgTSAxMDMuNSAyMDkuOSBRIDEwMy41IDIwMi44NSA5OS43IDE5OC44NSA5NS45NSBcclxuICAgIDE5NC43NSA4OS40IDE5NC43NSA4Mi44IDE5NC43NSA3OS4wNSAxOTguODUgNzUuMyAyMDIuOSA3NS4zIDIwOS45IDc1LjMgMjE2Ljg1IDc5LjA1IDIyMC45NSA4Mi44IDIyNS4wNSA4OS40IDIyNS4wNSA5NS45NSAyMjUuMDUgOTkuNyAyMjEgMTAzLjUgMjE2Ljk1IDEwMy41IDIwOS45IE0gOTUuNDUgMjA1LjUgXHJcbiAgICBRIDk1Ljk1IDIwNy4zIDk1Ljk1IDIwOS45IDk1Ljk1IDIxMi42NSA5NS40NSAyMTQuMzUgOTQuOTUgMjE2IDk0IDIxNy4zIDkzLjEgMjE4LjQ1IDkxLjkgMjE5IDkwLjcgMjE5LjU1IDg5LjQgMjE5LjU1IDg4LjE1IDIxOS41NSA4Ni45NSAyMTkuMDUgODUuNzUgMjE4LjU1IDg0LjggMjE3LjMgODMuOSAyMTYuMTUgXHJcbiAgICA4My40IDIxNC4zNSA4Mi44NSAyMTIuNiA4Mi44NSAyMDkuOSA4Mi44NSAyMDcuMyA4My40IDIwNS40NSA4My45NSAyMDMuNTUgODQuODUgMjAyLjQ1IDg1LjkgMjAxLjIgODYuOTUgMjAwLjc1IDg4LjA1IDIwMC4yNSA4OS40IDIwMC4yNSA5MC43IDIwMC4yNSA5MS44NSAyMDAuOCA5My4wNSAyMDEuMyA5NCAyMDIuNSBcclxuICAgIDk0LjkgMjAzLjY1IDk1LjQ1IDIwNS41IE0gMTUzLjMgMTk1LjM1IEwgMTQ1LjMgMTk1LjM1IDEzNS41IDIyNC40NSAxNDIuOCAyMjQuNDUgMTQ0LjYgMjE4LjUgMTUzLjc1IDIxOC41IDE1NS42IDIyNC40NSAxNjMuMSAyMjQuNDUgMTUzLjMgMTk1LjM1IE0gMTUyLjE1IDIxMy4yNSBMIDE0Ni4yNSAyMTMuMjUgXHJcbiAgICAxNDkuMiAyMDMuNjUgMTUyLjE1IDIxMy4yNSBNIDExNi43NSAxOTUuMzUgTCAxMDcuOCAxOTUuMzUgMTA3LjggMjI0LjQ1IDExNC41IDIyNC40NSAxMTQuNSAyMDQuMiAxMjUuNyAyMjQuNDUgMTMyLjc1IDIyNC40NSAxMzIuNzUgMTk1LjM1IDEyNi4wNSAxOTUuMzUgMTI2LjA1IDIxMi4wNSAxMTYuNzUgMTk1LjM1IE0gXHJcbiAgICA2Ni41IDE5Ny42NSBRIDY0LjE1IDE5Ni4xNSA2MS40NSAxOTUuNzUgNTguOCAxOTUuMzUgNTUuNzUgMTk1LjM1IEwgNDYuNyAxOTUuMzUgNDYuNyAyMjQuNDUgNTUuOCAyMjQuNDUgUSA1OC44IDIyNC40NSA2MS41IDIyNC4wNSA2NC4xNSAyMjMuNiA2Ni40IDIyMi4xNSA2OS4xNSAyMjAuNDUgNzAuOSAyMTcuMiBcclxuICAgIDcyLjcgMjE0IDcyLjcgMjA5Ljk1IDcyLjcgMjA1LjcgNzEgMjAyLjYgNjkuMzUgMTk5LjUgNjYuNSAxOTcuNjUgTSA2NC4yIDIwNSBRIDY1LjIgMjA3IDY1LjIgMjA5LjkgNjUuMiAyMTIuNzUgNjQuMjUgMjE0Ljc1IDYzLjMgMjE2Ljc1IDYxLjUgMjE3Ljg1IDYwIDIxOC44NSA1OC4zIDIxOC45IDU2LjYgMjE5IFxyXG4gICAgNTQuMTUgMjE5IEwgNTQgMjE5IDU0IDIwMC44IDU0LjE1IDIwMC44IFEgNTYuNCAyMDAuOCA1OC4wNSAyMDAuOSA1OS43IDIwMC45NSA2MS4xNSAyMDEuNzUgNjMuMiAyMDIuOTUgNjQuMiAyMDUgTSAyMTAuMiAxOTUuMzUgTCAxOTAuNSAxOTUuMzUgMTkwLjUgMjI0LjQ1IDIxMC4yIDIyNC40NSAyMTAuMiAyMTguOSBcclxuICAgIDE5Ny43NSAyMTguOSAxOTcuNzUgMjExLjU1IDIwOS4yIDIxMS41NSAyMDkuMiAyMDYgMTk3Ljc1IDIwNiAxOTcuNzUgMjAwLjkgMjEwLjIgMjAwLjkgMjEwLjIgMTk1LjM1IE0gMTg3LjUgMTk1LjM1IEwgMTYzIDE5NS4zNSAxNjMgMjAwLjkgMTcxLjYgMjAwLjkgMTcxLjYgMjI0LjQ1IDE3OC45IDIyNC40NSAxNzguOSBcclxuICAgIDIwMC45IDE4Ny41IDIwMC45IDE4Ny41IDE5NS4zNSBaXHJcbiAgICBgLFxyXG5cclxufVxyXG5cclxuVC5zZXRUZXh0KCk7XHJcblxyXG5leHBvcnQgY29uc3QgVG9vbHMgPSBUOyIsIi8vL2h0dHBzOi8vd2ljZy5naXRodWIuaW8vZmlsZS1zeXN0ZW0tYWNjZXNzLyNhcGktZmlsZXN5c3RlbWZpbGVoYW5kbGUtZ2V0ZmlsZVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBGaWxlcyB7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gIEZJTEUgVFlQRVxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHN0YXRpYyBhdXRvVHlwZXMoIHR5cGUgKSB7XHJcblxyXG4gICAgICAgIGxldCB0ID0gW11cclxuXHJcbiAgICAgICAgc3dpdGNoKCB0eXBlICl7XHJcbiAgICAgICAgICAgIGNhc2UgJ3N2Zyc6XHJcbiAgICAgICAgICAgIHQgPSBbIHsgYWNjZXB0OiB7ICdpbWFnZS9zdmcreG1sJzogJy5zdmcnfSB9LCBdXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICd3YXYnOlxyXG4gICAgICAgICAgICB0ID0gWyB7IGFjY2VwdDogeyAnYXVkaW8vd2F2JzogJy53YXYnfSB9LCBdXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdtcDMnOlxyXG4gICAgICAgICAgICB0ID0gWyB7IGFjY2VwdDogeyAnYXVkaW8vbXBlZyc6ICcubXAzJ30gfSwgXVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnbXA0JzpcclxuICAgICAgICAgICAgdCA9IFsgeyBhY2NlcHQ6IHsgJ3ZpZGVvL21wNCc6ICcubXA0J30gfSwgXVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnYmluJzogY2FzZSAnaGV4JzpcclxuICAgICAgICAgICAgdCA9IFsgeyBkZXNjcmlwdGlvbjogJ0JpbmFyeSBGaWxlcycsIGFjY2VwdDogeyAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJzogWycuYmluJywgJy5oZXgnXSB9IH0sIF1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3RleHQnOlxyXG4gICAgICAgICAgICB0ID0gWyB7IGRlc2NyaXB0aW9uOiAnVGV4dCBGaWxlcycsIGFjY2VwdDogeyAndGV4dC9wbGFpbic6IFsnLnR4dCcsICcudGV4dCddLCAndGV4dC9odG1sJzogWycuaHRtbCcsICcuaHRtJ10gfSB9LCBdXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdqc29uJzpcclxuICAgICAgICAgICAgdCA9IFsgeyBkZXNjcmlwdGlvbjogJ0pTT04gRmlsZXMnLCBhY2NlcHQ6IHsgJ2FwcGxpY2F0aW9uL2pzb24nOiBbJy5qc29uJ10gfSB9LCBdLy90ZXh0L3BsYWluXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdqcyc6XHJcbiAgICAgICAgICAgIHQgPSBbIHsgZGVzY3JpcHRpb246ICdKYXZhU2NyaXB0IEZpbGVzJywgYWNjZXB0OiB7ICd0ZXh0L2phdmFzY3JpcHQnOiBbJy5qcyddIH0gfSwgXVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnaW1hZ2UnOlxyXG4gICAgICAgICAgICB0ID0gWyB7IGRlc2NyaXB0aW9uOiAnSW1hZ2VzJywgYWNjZXB0OiB7ICdpbWFnZS8qJzogWycucG5nJywgJy5naWYnLCAnLmpwZWcnLCAnLmpwZyddIH0gfSwgXVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnaWNvbic6XHJcbiAgICAgICAgICAgIHQgPSBbIHsgZGVzY3JpcHRpb246ICdJY29ucycsIGFjY2VwdDogeyAnaW1hZ2UveC1pY28nOiBbJy5pY28nXSB9IH0sIF1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2x1dCc6XHJcbiAgICAgICAgICAgIHQgPSBbIHsgZGVzY3JpcHRpb246ICdMdXQnLCBhY2NlcHQ6IHsgJ3RleHQvcGxhaW4nOiBbJy5jdWJlJywgJy4zZGwnXSB9IH0sIF1cclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICBMT0FEXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cdHN0YXRpYyBhc3luYyBsb2FkKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93LnNob3dPcGVuRmlsZVBpY2tlciAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB3aW5kb3cuc2hvd09wZW5GaWxlUGlja2VyID0gRmlsZXMuc2hvd09wZW5GaWxlUGlja2VyUG9seWZpbGxcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcblxyXG4gICAgICAgIFx0bGV0IHR5cGUgPSBvLnR5cGUgfHwgJydcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBleGNsdWRlQWNjZXB0QWxsT3B0aW9uOiB0eXBlID8gdHJ1ZSA6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbXVsdGlwbGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgLy9zdGFydEluOicuL2Fzc2V0cydcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIG9wdGlvbnMudHlwZXMgPSBGaWxlcy5hdXRvVHlwZXMoIHR5cGUgKVxyXG5cclxuICAgICAgICAgICAgLy8gY3JlYXRlIGEgbmV3IGhhbmRsZVxyXG4gICAgICAgICAgICBjb25zdCBoYW5kbGUgPSBhd2FpdCB3aW5kb3cuc2hvd09wZW5GaWxlUGlja2VyKCBvcHRpb25zIClcclxuICAgICAgICAgICAgY29uc3QgZmlsZSA9IGF3YWl0IGhhbmRsZVswXS5nZXRGaWxlKClcclxuICAgICAgICAgICAgLy9sZXQgY29udGVudCA9IGF3YWl0IGZpbGUudGV4dCgpXHJcblxyXG4gICAgICAgICAgICBpZiggIWZpbGUgKSByZXR1cm4gbnVsbFxyXG5cclxuICAgICAgICAgICAgbGV0IGZuYW1lID0gZmlsZS5uYW1lO1xyXG4gICAgICAgICAgICBsZXQgZnR5cGUgPSBmbmFtZS5zdWJzdHJpbmcoIGZuYW1lLmxhc3RJbmRleE9mKCcuJykrMSwgZm5hbWUubGVuZ3RoICk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBkYXRhVXJsID0gWyAncG5nJywgJ2pwZycsICdqcGVnJywgJ21wNCcsICd3ZWJtJywgJ29nZycsICdtcDMnIF07XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGFCdWYgPSBbICdzZWEnLCAneicsICdoZXgnLCAnYnZoJywgJ0JWSCcsICdnbGInLCAnZ2x0ZicgXTtcclxuICAgICAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuXHJcbiAgICAgICAgICAgIGlmKCBkYXRhVXJsLmluZGV4T2YoIGZ0eXBlICkgIT09IC0xICkgcmVhZGVyLnJlYWRBc0RhdGFVUkwoIGZpbGUgKVxyXG4gICAgICAgICAgICBlbHNlIGlmKCBkYXRhQnVmLmluZGV4T2YoIGZ0eXBlICkgIT09IC0xICkgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKCBmaWxlIClcclxuICAgICAgICAgICAgZWxzZSByZWFkZXIucmVhZEFzVGV4dCggZmlsZSApXHJcblxyXG4gICAgICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBjb250ZW50ID0gZS50YXJnZXQucmVzdWx0XHJcblxyXG4gICAgICAgICAgICAgICAgc3dpdGNoKHR5cGUpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2ltYWdlJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGltZyA9IG5ldyBJbWFnZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoIG8uY2FsbGJhY2sgKSBvLmNhbGxiYWNrKCBpbWcsIGZuYW1lLCBmdHlwZSApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1nLnNyYyA9IGNvbnRlbnRcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdqc29uJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIG8uY2FsbGJhY2sgKSBvLmNhbGxiYWNrKCBKU09OLnBhcnNlKCBjb250ZW50ICksIGZuYW1lLCBmdHlwZSApXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIG8uY2FsbGJhY2sgKSBvLmNhbGxiYWNrKCBjb250ZW50LCBmbmFtZSwgZnR5cGUgKVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGNhdGNoKGUpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpXHJcbiAgICAgICAgICAgIGlmKCBvLmFsd2F5cyAmJiBvLmNhbGxiYWNrICkgby5jYWxsYmFjayggbnVsbCApXHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG5cdHN0YXRpYyBzaG93T3BlbkZpbGVQaWNrZXJQb2x5ZmlsbCggb3B0aW9ucyApIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XHJcbiAgICAgICAgICAgIGlucHV0LnR5cGUgPSBcImZpbGVcIjtcclxuICAgICAgICAgICAgaW5wdXQubXVsdGlwbGUgPSBvcHRpb25zLm11bHRpcGxlO1xyXG4gICAgICAgICAgICBpbnB1dC5hY2NlcHQgPSBvcHRpb25zLnR5cGVzXHJcbiAgICAgICAgICAgICAgICAubWFwKCh0eXBlKSA9PiB0eXBlLmFjY2VwdClcclxuICAgICAgICAgICAgICAgIC5mbGF0TWFwKChpbnN0KSA9PiBPYmplY3Qua2V5cyhpbnN0KS5mbGF0TWFwKChrZXkpID0+IGluc3Rba2V5XSkpXHJcbiAgICAgICAgICAgICAgICAuam9pbihcIixcIik7XHJcblxyXG4gICAgICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoXHJcbiAgICAgICAgICAgICAgICAgICAgWy4uLmlucHV0LmZpbGVzXS5tYXAoKGZpbGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldEZpbGU6IGFzeW5jICgpID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpbnB1dC5jbGljaygpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICBTQVZFXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc3RhdGljIGFzeW5jIHNhdmUoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgbGV0IHVzZVBvbHkgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuc2hvd1NhdmVGaWxlUGlja2VyICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5zaG93U2F2ZUZpbGVQaWNrZXIgPSBGaWxlcy5zaG93U2F2ZUZpbGVQaWNrZXJQb2x5ZmlsbFxyXG4gICAgICAgICAgICB1c2VQb2x5ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgdHlwZSA9IG8udHlwZSB8fCAnJ1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgIHN1Z2dlc3RlZE5hbWU6IG8ubmFtZSB8fCAnaGVsbG8nLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogby5kYXRhIHx8ICcnXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBvcHRpb25zLnR5cGVzID0gRmlsZXMuYXV0b1R5cGVzKCB0eXBlIClcclxuICAgICAgICAgICAgb3B0aW9ucy5maW5hbFR5cGUgPSBPYmplY3Qua2V5cyggb3B0aW9ucy50eXBlc1swXS5hY2NlcHQgKVswXVxyXG4gICAgICAgICAgICBvcHRpb25zLnN1Z2dlc3RlZE5hbWUgKz0gb3B0aW9ucy50eXBlc1swXS5hY2NlcHRbb3B0aW9ucy5maW5hbFR5cGVdWzBdXHJcblxyXG5cclxuICAgICAgICAgICAgLy8gY3JlYXRlIGEgbmV3IGhhbmRsZVxyXG4gICAgICAgICAgICBjb25zdCBoYW5kbGUgPSBhd2FpdCB3aW5kb3cuc2hvd1NhdmVGaWxlUGlja2VyKCBvcHRpb25zICk7XHJcblxyXG4gICAgICAgICAgICBpZiggdXNlUG9seSApIHJldHVyblxyXG5cclxuICAgICAgICAgICAgLy8gY3JlYXRlIGEgRmlsZVN5c3RlbVdyaXRhYmxlRmlsZVN0cmVhbSB0byB3cml0ZSB0b1xyXG4gICAgICAgICAgICBjb25zdCBmaWxlID0gYXdhaXQgaGFuZGxlLmNyZWF0ZVdyaXRhYmxlKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgYmxvYiA9IG5ldyBCbG9iKFsgb3B0aW9ucy5kYXRhIF0sIHsgdHlwZTogb3B0aW9ucy5maW5hbFR5cGUgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyB3cml0ZSBvdXIgZmlsZVxyXG4gICAgICAgICAgICBhd2FpdCBmaWxlLndyaXRlKGJsb2IpO1xyXG5cclxuICAgICAgICAgICAgLy8gY2xvc2UgdGhlIGZpbGUgYW5kIHdyaXRlIHRoZSBjb250ZW50cyB0byBkaXNrLlxyXG4gICAgICAgICAgICBhd2FpdCBmaWxlLmNsb3NlKCk7XHJcblxyXG4gICAgICAgIH0gY2F0Y2goZSkge1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHNob3dTYXZlRmlsZVBpY2tlclBvbHlmaWxsKCBvcHRpb25zICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgICAgICAgICAgIGEuZG93bmxvYWQgPSBvcHRpb25zLnN1Z2dlc3RlZE5hbWUgfHwgXCJteS1maWxlLnR4dFwiXHJcbiAgICAgICAgICAgIGxldCBibG9iID0gbmV3IEJsb2IoWyBvcHRpb25zLmRhdGEgXSwgeyB0eXBlOm9wdGlvbnMuZmluYWxUeXBlIH0pO1xyXG4gICAgICAgICAgICBhLmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKCBibG9iIClcclxuXHJcbiAgICAgICAgICAgIGEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCggKCkgPT4gVVJMLnJldm9rZU9iamVjdFVSTChhLmhyZWYpLCAxMDAwIClcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgYS5jbGljaygpXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gIEZPTERFUiBub3QgcG9zc2libGUgaW4gcG9seVxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBnZXRGb2xkZXIoKSB7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICBcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlID0gYXdhaXQgd2luZG93LnNob3dEaXJlY3RvcnlQaWNrZXIoKTtcclxuICAgICAgICAgICAgY29uc3QgZmlsZXMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIGF3YWl0IChjb25zdCBlbnRyeSBvZiBoYW5kbGUudmFsdWVzKCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGUgPSBhd2FpdCBlbnRyeS5nZXRGaWxlKCk7XHJcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKGZpbGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhmaWxlcylcclxuICAgICAgICAgICAgcmV0dXJuIGZpbGVzO1xyXG5cclxuICAgICAgICB9IGNhdGNoKGUpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG5cclxuICAgICAgICB9XHJcbiAgICBcclxuICAgIH1cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG4gICAgXHJcblxyXG59IiwiZXhwb3J0IGNsYXNzIFYyIHtcclxuXHJcblx0Y29uc3RydWN0b3IoIHggPSAwLCB5ID0gMCApIHtcclxuXHJcblx0XHR0aGlzLnggPSB4O1xyXG5cdFx0dGhpcy55ID0geTtcclxuXHJcblx0fVxyXG5cclxuXHRzZXQgKCB4LCB5ICkge1xyXG5cclxuXHRcdHRoaXMueCA9IHg7XHJcblx0XHR0aGlzLnkgPSB5O1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcblx0ZGl2aWRlICggdiApIHtcclxuXHJcblx0XHR0aGlzLnggLz0gdi54O1xyXG5cdFx0dGhpcy55IC89IHYueTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdG11bHRpcGx5ICggdiApIHtcclxuXHJcblx0XHR0aGlzLnggKj0gdi54O1xyXG5cdFx0dGhpcy55ICo9IHYueTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdG11bHRpcGx5U2NhbGFyICggc2NhbGFyICkge1xyXG5cclxuXHRcdHRoaXMueCAqPSBzY2FsYXI7XHJcblx0XHR0aGlzLnkgKj0gc2NhbGFyO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcblx0ZGl2aWRlU2NhbGFyICggc2NhbGFyICkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLm11bHRpcGx5U2NhbGFyKCAxIC8gc2NhbGFyICk7XHJcblxyXG5cdH1cclxuXHJcblx0bGVuZ3RoICgpIHtcclxuXHJcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KCB0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkgKTtcclxuXHJcblx0fVxyXG5cclxuXHRhbmdsZSAoKSB7XHJcblxyXG5cdFx0Ly8gY29tcHV0ZXMgdGhlIGFuZ2xlIGluIHJhZGlhbnMgd2l0aCByZXNwZWN0IHRvIHRoZSBwb3NpdGl2ZSB4LWF4aXNcclxuXHJcblx0XHR2YXIgYW5nbGUgPSBNYXRoLmF0YW4yKCB0aGlzLnksIHRoaXMueCApO1xyXG5cclxuXHRcdGlmICggYW5nbGUgPCAwICkgYW5nbGUgKz0gMiAqIE1hdGguUEk7XHJcblxyXG5cdFx0cmV0dXJuIGFuZ2xlO1xyXG5cclxuXHR9XHJcblxyXG5cdGFkZFNjYWxhciAoIHMgKSB7XHJcblxyXG5cdFx0dGhpcy54ICs9IHM7XHJcblx0XHR0aGlzLnkgKz0gcztcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdG5lZ2F0ZSAoKSB7XHJcblxyXG5cdFx0dGhpcy54ICo9IC0xO1xyXG5cdFx0dGhpcy55ICo9IC0xO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcblx0bmVnICgpIHtcclxuXHJcblx0XHR0aGlzLnggPSAtMTtcclxuXHRcdHRoaXMueSA9IC0xO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcblx0aXNaZXJvICgpIHtcclxuXHJcblx0XHRyZXR1cm4gKCB0aGlzLnggPT09IDAgJiYgdGhpcy55ID09PSAwICk7XHJcblxyXG5cdH1cclxuXHJcblx0Y29weSAoIHYgKSB7XHJcblxyXG5cdFx0dGhpcy54ID0gdi54O1xyXG5cdFx0dGhpcy55ID0gdi55O1xyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdGVxdWFscyAoIHYgKSB7XHJcblxyXG5cdFx0cmV0dXJuICggKCB2LnggPT09IHRoaXMueCApICYmICggdi55ID09PSB0aGlzLnkgKSApO1xyXG5cclxuXHR9XHJcblxyXG5cdG5lYXJFcXVhbHMgKCB2LCBuICkge1xyXG5cclxuXHRcdHJldHVybiAoICggdi54LnRvRml4ZWQobikgPT09IHRoaXMueC50b0ZpeGVkKG4pICkgJiYgKCB2LnkudG9GaXhlZChuKSA9PT0gdGhpcy55LnRvRml4ZWQobikgKSApO1xyXG5cclxuXHR9XHJcblxyXG5cdGxlcnAgKCB2LCBhbHBoYSApIHtcclxuXHJcblx0XHRpZiggdiA9PT0gbnVsbCApe1xyXG5cdFx0XHR0aGlzLnggLT0gdGhpcy54ICogYWxwaGE7XHJcblx0XHQgICAgdGhpcy55IC09IHRoaXMueSAqIGFscGhhO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy54ICs9ICggdi54IC0gdGhpcy54ICkgKiBhbHBoYTtcclxuXHRcdCAgICB0aGlzLnkgKz0gKCB2LnkgLSB0aGlzLnkgKSAqIGFscGhhO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG59IiwiaW1wb3J0IHsgUm9vdHMgfSBmcm9tIFwiLi9Sb290cy5qc1wiO1xyXG5pbXBvcnQgeyBUb29scyB9IGZyb20gXCIuL1Rvb2xzLmpzXCI7XHJcbmltcG9ydCB7IFYyIH0gZnJvbSBcIi4vVjIuanNcIjtcclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIGx0aCAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sby10aFxyXG4gKi9cclxuXHJcbmV4cG9ydCBjbGFzcyBQcm90byB7XHJcbiAgY29uc3RydWN0b3IobyA9IHt9KSB7XHJcbiAgICAvLyBkaXNhYmxlIG1vdXNlIGNvbnRyb2xlXHJcbiAgICB0aGlzLmxvY2sgPSBvLmxvY2sgfHwgZmFsc2U7XHJcblxyXG4gICAgLy8gZm9yIGJ1dHRvblxyXG4gICAgdGhpcy5uZXZlcmxvY2sgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBvbmx5IHNpbXBsZSBzcGFjZVxyXG4gICAgdGhpcy5pc1NwYWNlID0gby5pc1NwYWNlIHx8IGZhbHNlO1xyXG5cclxuICAgIC8vIGlmIGlzIG9uIGd1aSBvciBncm91cFxyXG4gICAgdGhpcy5tYWluID0gby5tYWluIHx8IG51bGw7XHJcbiAgICB0aGlzLmlzVUkgPSBvLmlzVUkgfHwgZmFsc2U7XHJcbiAgICB0aGlzLmdyb3VwID0gby5ncm91cCB8fCBudWxsO1xyXG5cclxuICAgIHRoaXMuaXNMaXN0ZW4gPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnRvcCA9IDA7XHJcbiAgICB0aGlzLnl0b3AgPSAwO1xyXG5cclxuICAgIHRoaXMuZHggPSBvLmR4IHx8IDA7XHJcblxyXG4gICAgdGhpcy5pc1NlbGVjdGFibGUgPSBvLnNlbGVjdGFibGUgIT09IHVuZGVmaW5lZCA/IG8uc2VsZWN0YWJsZSA6IGZhbHNlO1xyXG4gICAgdGhpcy51bnNlbGVjdGFibGUgPVxyXG4gICAgICBvLnVuc2VsZWN0ICE9PSB1bmRlZmluZWQgPyBvLnVuc2VsZWN0IDogdGhpcy5pc1NlbGVjdGFibGU7XHJcblxyXG4gICAgdGhpcy5vbnRvcCA9IG8ub250b3AgPyBvLm9udG9wIDogZmFsc2U7IC8vICdiZWZvcmViZWdpbicgJ2FmdGVyYmVnaW4nICdiZWZvcmVlbmQnICdhZnRlcmVuZCdcclxuXHJcbiAgICB0aGlzLmNzcyA9IHRoaXMubWFpbiA/IHRoaXMubWFpbi5jc3MgOiBUb29scy5jc3M7XHJcblxyXG4gICAgdGhpcy5jb2xvcnMgPSBUb29scy5kZWZpbmVDb2xvcihcclxuICAgICAgbyxcclxuICAgICAgdGhpcy5tYWluXHJcbiAgICAgICAgPyB0aGlzLmdyb3VwXHJcbiAgICAgICAgICA/IHRoaXMuZ3JvdXAuY29sb3JzXHJcbiAgICAgICAgICA6IHRoaXMubWFpbi5jb2xvcnNcclxuICAgICAgICA6IFRvb2xzLmNvbG9yc1xyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLm92ZXJFZmZlY3QgPSB0aGlzLmNvbG9ycy5zaG93T3ZlcjtcclxuXHJcbiAgICB0aGlzLnN2Z3MgPSBUb29scy5zdmdzO1xyXG5cclxuICAgIHRoaXMuem9uZSA9IHsgeDogMCwgeTogMCwgdzogMCwgaDogMCwgZDogMCB9O1xyXG4gICAgdGhpcy5sb2NhbCA9IG5ldyBWMigpLm5lZygpO1xyXG5cclxuICAgIHRoaXMuaXNDYW52YXNPbmx5ID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzU2VsZWN0ID0gZmFsc2U7XHJcblxyXG4gICAgLy8gcGVyY2VudCBvZiB0aXRsZVxyXG4gICAgdGhpcy5wID0gby5wICE9PSB1bmRlZmluZWQgPyBvLnAgOiBUb29scy5zaXplLnA7XHJcblxyXG4gICAgdGhpcy53ID0gdGhpcy5pc1VJID8gdGhpcy5tYWluLnNpemUudyA6IFRvb2xzLnNpemUudztcclxuICAgIGlmIChvLncgIT09IHVuZGVmaW5lZCkgdGhpcy53ID0gby53O1xyXG5cclxuICAgIHRoaXMuaCA9IHRoaXMuaXNVSSA/IHRoaXMubWFpbi5zaXplLmggOiBUb29scy5zaXplLmg7XHJcbiAgICBpZiAoby5oICE9PSB1bmRlZmluZWQpIHRoaXMuaCA9IG8uaDtcclxuICAgIGlmICghdGhpcy5pc1NwYWNlKSB0aGlzLmggPSB0aGlzLmggPCAxMSA/IDExIDogdGhpcy5oO1xyXG4gICAgZWxzZSB0aGlzLmxvY2sgPSB0cnVlO1xyXG5cclxuICAgIC8vIGRlY2FsZSBmb3IgY2FudmFzIG9ubHlcclxuICAgIHRoaXMuZncgPSBvLmZ3IHx8IDA7XHJcblxyXG4gICAgdGhpcy5hdXRvV2lkdGggPSBvLmF1dG8gfHwgdHJ1ZTsgLy8gYXV0byB3aWR0aCBvciBmbGV4XHJcbiAgICB0aGlzLmlzT3BlbiA9IGZhbHNlOyAvL2ZhbHNlLy8gb3BlbiBzdGF0dVxyXG5cclxuICAgIC8vIHJhZGl1cyBmb3IgdG9vbGJveFxyXG4gICAgdGhpcy5yYWRpdXMgPSBvLnJhZGl1cyB8fCB0aGlzLmNvbG9ycy5yYWRpdXM7XHJcblxyXG4gICAgdGhpcy50cmFuc2l0aW9uID0gby50cmFuc2l0aW9uIHx8IFRvb2xzLnRyYW5zaXRpb247XHJcblxyXG4gICAgLy8gb25seSBmb3IgbnVtYmVyXHJcbiAgICB0aGlzLmlzTnVtYmVyID0gZmFsc2U7XHJcbiAgICB0aGlzLm5vTmVnID0gby5ub05lZyB8fCBmYWxzZTtcclxuICAgIHRoaXMuYWxsRXF1YWwgPSBvLmFsbEVxdWFsIHx8IGZhbHNlO1xyXG5cclxuICAgIC8vIG9ubHkgbW9zdCBzaW1wbGVcclxuICAgIHRoaXMubW9ubyA9IGZhbHNlO1xyXG5cclxuICAgIC8vIHN0b3AgbGlzdGVuaW5nIGZvciBlZGl0IHNsaWRlIHRleHRcclxuICAgIHRoaXMuaXNFZGl0ID0gZmFsc2U7XHJcblxyXG4gICAgLy8gbm8gdGl0bGVcclxuICAgIHRoaXMuc2ltcGxlID0gby5zaW1wbGUgfHwgZmFsc2U7XHJcbiAgICBpZiAodGhpcy5zaW1wbGUpIHRoaXMuc2EgPSAwO1xyXG5cclxuICAgIC8vIGRlZmluZSBvYmogc2l6ZVxyXG4gICAgdGhpcy5zZXRTaXplKHRoaXMudyk7XHJcblxyXG4gICAgLy8gdGl0bGUgc2l6ZVxyXG4gICAgaWYgKG8uc2EgIT09IHVuZGVmaW5lZCkgdGhpcy5zYSA9IG8uc2E7XHJcbiAgICBpZiAoby5zYiAhPT0gdW5kZWZpbmVkKSB0aGlzLnNiID0gby5zYjtcclxuICAgIGlmICh0aGlzLnNpbXBsZSkgdGhpcy5zYiA9IHRoaXMudyAtIHRoaXMuc2E7XHJcblxyXG4gICAgLy8gbGFzdCBudW1iZXIgc2l6ZSBmb3Igc2xpZGVcclxuICAgIHRoaXMuc2MgPSBvLnNjID09PSB1bmRlZmluZWQgPyA0NyA6IG8uc2M7XHJcblxyXG4gICAgLy8gZm9yIGxpc3RlbmluZyBvYmplY3RcclxuICAgIHRoaXMub2JqZWN0TGluayA9IG51bGw7XHJcbiAgICB0aGlzLmlzU2VuZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5vYmplY3RLZXkgPSBudWxsO1xyXG5cclxuICAgIHRoaXMudHh0ID0gby5uYW1lIHx8IFwiXCI7XHJcbiAgICB0aGlzLm5hbWUgPSBvLnJlbmFtZSB8fCB0aGlzLnR4dDtcclxuICAgIHRoaXMudGFyZ2V0ID0gby50YXJnZXQgfHwgbnVsbDtcclxuXHJcbiAgICAvLyBjYWxsYmFja1xyXG4gICAgdGhpcy5jYWxsYmFjayA9IG8uY2FsbGJhY2sgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBvLmNhbGxiYWNrO1xyXG4gICAgdGhpcy5lbmRDYWxsYmFjayA9IG51bGw7XHJcbiAgICB0aGlzLm9wZW5DYWxsYmFjayA9IG8ub3BlbkNhbGxiYWNrID09PSB1bmRlZmluZWQgPyBudWxsIDogby5vcGVuQ2FsbGJhY2s7XHJcbiAgICB0aGlzLmNsb3NlQ2FsbGJhY2sgPSBvLmNsb3NlQ2FsbGJhY2sgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBvLmNsb3NlQ2FsbGJhY2s7XHJcblxyXG4gICAgLy8gaWYgbm8gY2FsbGJhY2sgdGFrZSBvbmUgZnJvbSBncm91cCBvciBndWlcclxuICAgIGlmICh0aGlzLmNhbGxiYWNrID09PSBudWxsICYmIHRoaXMuaXNVSSAmJiB0aGlzLm1haW4uY2FsbGJhY2sgIT09IG51bGwpIHtcclxuICAgICAgdGhpcy5jYWxsYmFjayA9IHRoaXMuZ3JvdXAgPyB0aGlzLmdyb3VwLmNhbGxiYWNrIDogdGhpcy5tYWluLmNhbGxiYWNrO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGVsZW1lbnRzXHJcbiAgICB0aGlzLmMgPSBbXTtcclxuXHJcbiAgICAvLyBzdHlsZVxyXG4gICAgdGhpcy5zID0gW107XHJcblxyXG4gICAgdGhpcy51c2VGbGV4ID0gdGhpcy5pc1VJID8gdGhpcy5tYWluLnVzZUZsZXggOiBmYWxzZTtcclxuICAgIGxldCBmbGV4aWJsZSA9IHRoaXMudXNlRmxleFxyXG4gICAgICA/IFwiZGlzcGxheTpmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOyBhbGlnbi1pdGVtczpjZW50ZXI7IHRleHQtYWxpZ246Y2VudGVyOyBmbGV4OiAxIDEwMCU7XCJcclxuICAgICAgOiBcImZsb2F0OmxlZnQ7XCI7XHJcblxyXG4gICAgdGhpcy5jWzBdID0gVG9vbHMuZG9tKFxyXG4gICAgICBcImRpdlwiLFxyXG4gICAgICB0aGlzLmNzcy5iYXNpYyArIGZsZXhpYmxlICsgXCJwb3NpdGlvbjpyZWxhdGl2ZTsgaGVpZ2h0OjIwcHg7XCJcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5zWzBdID0gdGhpcy5jWzBdLnN0eWxlO1xyXG5cclxuICAgIC8vIGJvdHRvbSBtYXJnaW5cclxuICAgIHRoaXMubWFyZ2luID0gdGhpcy5jb2xvcnMuc3k7XHJcbiAgICB0aGlzLm10b3AgPSAwO1xyXG4gICAgbGV0IG1hcmdpbkRpdiA9IFRvb2xzLmlzRGl2aWQodGhpcy5tYXJnaW4pO1xyXG5cclxuICAgIGlmICh0aGlzLmlzVUkgJiYgdGhpcy5tYXJnaW4pIHtcclxuICAgICAgdGhpcy5zWzBdLmJveFNpemluZyA9IFwiY29udGVudC1ib3hcIjtcclxuICAgICAgaWYgKG1hcmdpbkRpdikge1xyXG4gICAgICAgIHRoaXMubXRvcCA9IHRoaXMubWFyZ2luICogMC41O1xyXG4gICAgICAgIC8vdGhpcy5zWzBdLmJvcmRlclRvcCA9ICcke3RoaXMubXRvcH1weCBzb2xpZCB0cmFuc3BhcmVudCdcclxuICAgICAgICAvL2NvbnNvbGUubG9nKGAke3RoaXMubXRvcH1weCBzb2xpZCB0cmFuc3BhcmVudGApXHJcbiAgICAgICAgdGhpcy5zWzBdLmJvcmRlclRvcCA9IHRoaXMubXRvcCArIFwicHggc29saWQgdHJhbnNwYXJlbnRcIjtcclxuICAgICAgICB0aGlzLnNbMF0uYm9yZGVyQm90dG9tID0gdGhpcy5tdG9wICsgXCJweCBzb2xpZCB0cmFuc3BhcmVudFwiO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc1swXS5ib3JkZXJCb3R0b20gPSB0aGlzLm1hcmdpbiArIFwicHggc29saWQgdHJhbnNwYXJlbnRcIjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHdpdGggdGl0bGVcclxuICAgIGlmICghdGhpcy5zaW1wbGUpIHtcclxuICAgICAgdGhpcy5jWzFdID0gVG9vbHMuZG9tKFwiZGl2XCIsIHRoaXMuY3NzLnR4dCArIHRoaXMuY3NzLm1pZGRsZSk7XHJcbiAgICAgIHRoaXMuc1sxXSA9IHRoaXMuY1sxXS5zdHlsZTtcclxuICAgICAgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gdGhpcy5uYW1lO1xyXG4gICAgICB0aGlzLnNbMV0uY29sb3IgPSB0aGlzLmxvY2sgPyB0aGlzLmNvbG9ycy50aXRsZW9mZiA6IHRoaXMuY29sb3JzLnRpdGxlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvLnBvcykge1xyXG4gICAgICB0aGlzLnNbMF0ucG9zaXRpb24gPSBcImFic29sdXRlXCI7XHJcbiAgICAgIGZvciAobGV0IHAgaW4gby5wb3MpIHtcclxuICAgICAgICB0aGlzLnNbMF1bcF0gPSBvLnBvc1twXTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm1vbm8gPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvLmNzcykgdGhpcy5zWzBdLmNzc1RleHQgPSBvLmNzcztcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBtYWtlIHRoZSBub2RlXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBpbml0KCkge1xyXG4gICAgdGhpcy55dG9wID0gdGhpcy50b3AgKyB0aGlzLm10b3A7XHJcblxyXG4gICAgdGhpcy56b25lLmggPSB0aGlzLmggKyB0aGlzLm1hcmdpbjtcclxuICAgIHRoaXMuem9uZS53ID0gdGhpcy53O1xyXG5cclxuICAgIGxldCBzID0gdGhpcy5zOyAvLyBzdHlsZSBjYWNoZVxyXG4gICAgbGV0IGMgPSB0aGlzLmM7IC8vIGRpdiBjYWNoXHJcblxyXG4gICAgc1swXS5oZWlnaHQgPSB0aGlzLmggKyBcInB4XCI7XHJcblxyXG4gICAgaWYgKHRoaXMuaXNVSSkgc1swXS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuYmFja2dyb3VuZDtcclxuXHJcbiAgICBpZiAoIXRoaXMuYXV0b1dpZHRoICYmIHRoaXMudXNlRmxleCkge1xyXG4gICAgICBzWzBdLmZsZXggPSBcIjEgMCBhdXRvXCI7XHJcbiAgICAgIHNbMF0ubWluV2lkdGggPSB0aGlzLm1pbncgKyBcInB4XCI7XHJcbiAgICAgIHNbMF0udGV4dEFsaWduID0gXCJjZW50ZXJcIjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0aGlzLmlzVUkpIHNbMF0ud2lkdGggPSBcIjEwMCVcIjtcclxuICAgIH1cclxuXHJcbiAgICAvL2lmKCB0aGlzLmF1dG9IZWlnaHQgKSBzWzBdLnRyYW5zaXRpb24gPSAnaGVpZ2h0IDAuMDFzIGVhc2Utb3V0JztcclxuICAgIGlmIChjWzFdICE9PSB1bmRlZmluZWQgJiYgdGhpcy5hdXRvV2lkdGgpIHtcclxuICAgICAgc1sxXSA9IGNbMV0uc3R5bGU7XHJcbiAgICAgIHNbMV0udG9wID0gMSArIFwicHhcIjtcclxuICAgICAgc1sxXS5oZWlnaHQgPSB0aGlzLmggLSAyICsgXCJweFwiO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBmcmFnID0gVG9vbHMuZnJhZztcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMSwgbG5nID0gYy5sZW5ndGg7IGkgIT09IGxuZzsgaSsrKSB7XHJcbiAgICAgIGlmIChjW2ldICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKGNbaV0pO1xyXG4gICAgICAgIHNbaV0gPSBjW2ldLnN0eWxlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBwID1cclxuICAgICAgdGhpcy50YXJnZXQgIT09IG51bGxcclxuICAgICAgICA/IHRoaXMudGFyZ2V0XHJcbiAgICAgICAgOiB0aGlzLmlzVUlcclxuICAgICAgICA/IHRoaXMubWFpbi5pbm5lclxyXG4gICAgICAgIDogZG9jdW1lbnQuYm9keTtcclxuXHJcbiAgICBpZiAodGhpcy5vbnRvcCkgcHAuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYWZ0ZXJiZWdpblwiLCBjWzBdKTtcclxuICAgIGVsc2UgcHAuYXBwZW5kQ2hpbGQoY1swXSk7XHJcblxyXG4gICAgY1swXS5hcHBlbmRDaGlsZChmcmFnKTtcclxuXHJcbiAgICB0aGlzLnJTaXplKCk7XHJcblxyXG4gICAgLy8gISBzb2xvIHByb3RvXHJcbiAgICBpZiAoIXRoaXMuaXNVSSkge1xyXG4gICAgICB0aGlzLmNbMF0uc3R5bGUucG9pbnRlckV2ZW50cyA9IFwiYXV0b1wiO1xyXG4gICAgICBSb290cy5hZGQodGhpcyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhZGRUcmFuc2l0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuYmFzZUggJiYgdGhpcy50cmFuc2l0aW9uICYmIHRoaXMuaXNVSSkge1xyXG4gICAgICB0aGlzLmNbMF0uc3R5bGUudHJhbnNpdGlvbiA9IFwiaGVpZ2h0IFwiICsgdGhpcy50cmFuc2l0aW9uICsgXCJzIGVhc2Utb3V0XCI7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBmcm9tIFRvb2xzXHJcblxyXG4gIGRvbSh0eXBlLCBjc3MsIG9iaiwgZG9tLCBpZCkge1xyXG4gICAgcmV0dXJuIFRvb2xzLmRvbSh0eXBlLCBjc3MsIG9iaiwgZG9tLCBpZCk7XHJcbiAgfVxyXG5cclxuICBzZXRTdmcoZG9tLCB0eXBlLCB2YWx1ZSwgaWQsIGlkMikge1xyXG4gICAgVG9vbHMuc2V0U3ZnKGRvbSwgdHlwZSwgdmFsdWUsIGlkLCBpZDIpO1xyXG4gIH1cclxuXHJcbiAgc2V0Q3NzKGRvbSwgY3NzKSB7XHJcbiAgICBUb29scy5zZXRDc3MoZG9tLCBjc3MpO1xyXG4gIH1cclxuXHJcbiAgY2xhbXAodmFsdWUsIG1pbiwgbWF4KSB7XHJcbiAgICByZXR1cm4gVG9vbHMuY2xhbXAodmFsdWUsIG1pbiwgbWF4KTtcclxuICB9XHJcblxyXG4gIGdldENvbG9yUmluZygpIHtcclxuICAgIGlmICghVG9vbHMuY29sb3JSaW5nKSBUb29scy5tYWtlQ29sb3JSaW5nKCk7XHJcbiAgICByZXR1cm4gVG9vbHMuY2xvbmUoVG9vbHMuY29sb3JSaW5nKTtcclxuICB9XHJcblxyXG4gIGdldEpveXN0aWNrKG1vZGVsKSB7XHJcbiAgICBpZiAoIVRvb2xzW1wiam95c3RpY2tfXCIgKyBtb2RlbF0pIFRvb2xzLm1ha2VKb3lzdGljayhtb2RlbCk7XHJcbiAgICByZXR1cm4gVG9vbHMuY2xvbmUoVG9vbHNbXCJqb3lzdGlja19cIiArIG1vZGVsXSk7XHJcbiAgfVxyXG5cclxuICBnZXRDaXJjdWxhcihtb2RlbCkge1xyXG4gICAgaWYgKCFUb29scy5jaXJjdWxhcikgVG9vbHMubWFrZUNpcmN1bGFyKG1vZGVsKTtcclxuICAgIHJldHVybiBUb29scy5jbG9uZShUb29scy5jaXJjdWxhcik7XHJcbiAgfVxyXG5cclxuICBnZXRLbm9iKG1vZGVsKSB7XHJcbiAgICBpZiAoIVRvb2xzLmtub2IpIFRvb2xzLm1ha2VLbm9iKG1vZGVsKTtcclxuICAgIHJldHVybiBUb29scy5jbG9uZShUb29scy5rbm9iKTtcclxuICB9XHJcblxyXG4gIGdldFBhZDJkKG1vZGVsKSB7XHJcbiAgICBpZiAoIVRvb2xzLnBhZDJkKSBUb29scy5tYWtlUGFkKG1vZGVsKTtcclxuICAgIHJldHVybiBUb29scy5jbG9uZShUb29scy5wYWQyZCk7XHJcbiAgfVxyXG5cclxuICAvLyBmcm9tIFJvb3RzXHJcblxyXG4gIGN1cnNvcihuYW1lKSB7XHJcbiAgICBSb290cy5jdXJzb3IobmFtZSk7XHJcbiAgfVxyXG5cclxuICAvLy8vLy8vLy9cclxuXHJcbiAgdXBkYXRlKCkge31cclxuXHJcbiAgcmVzZXQoKSB7fVxyXG5cclxuICAvLy8vLy8vLy9cclxuXHJcbiAgY29udGVudCgpIHtcclxuICAgIHJldHVybiB0aGlzLmNbMF07XHJcbiAgfVxyXG5cclxuICBnZXREb20oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jWzBdO1xyXG4gIH1cclxuXHJcbiAgdWlvdXQoKSB7XHJcbiAgICBpZiAodGhpcy5sb2NrKSByZXR1cm47XHJcbiAgICBpZiAoIXRoaXMub3ZlckVmZmVjdCkgcmV0dXJuO1xyXG4gICAgaWYgKHRoaXMucykgdGhpcy5zWzBdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5iYWNrZ3JvdW5kO1xyXG4gIH1cclxuXHJcbiAgdWlvdmVyKCkge1xyXG4gICAgaWYgKHRoaXMubG9jaykgcmV0dXJuO1xyXG4gICAgaWYgKCF0aGlzLm92ZXJFZmZlY3QpIHJldHVybjtcclxuICAgIGlmICh0aGlzLnMpIHRoaXMuc1swXS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuYmFja2dyb3VuZE92ZXI7XHJcbiAgfVxyXG5cclxuICByZW5hbWUocykge1xyXG4gICAgaWYgKHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkKSB0aGlzLmNbMV0udGV4dENvbnRlbnQgPSBzO1xyXG4gIH1cclxuXHJcbiAgbGlzdGVuKCkge1xyXG4gICAgdGhpcy5pc0xpc3RlbiA9IFJvb3RzLmFkZExpc3Rlbih0aGlzKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgbGlzdGVuaW5nKCkge1xyXG4gICAgLy8gbW9kaWZpZWQgYnkgRmVkZW1hcmlub1xyXG4gICAgaWYgKHRoaXMub2JqZWN0TGluayA9PT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgaWYgKHRoaXMuaXNTZW5kKSByZXR1cm47XHJcbiAgICBpZiAodGhpcy5pc0VkaXQpIHJldHVybjtcclxuICAgIC8vIGNoZWNrIGlmIHZhbHVlIGhhcyBjaGFuZ2VkXHJcbiAgICBsZXQgaGFzQ2hhbmdlZCA9IHRoaXMuc2V0VmFsdWUodGhpcy5vYmplY3RMaW5rW3RoaXMub2JqZWN0S2V5XSk7XHJcbiAgICByZXR1cm4gaGFzQ2hhbmdlZDtcclxuICB9XHJcblxyXG4gIHNldFZhbHVlKHYpIHtcclxuICAgIGNvbnN0IG9sZCA9IHRoaXMudmFsdWU7XHJcbiAgICBpZiAodGhpcy5pc051bWJlcikgdGhpcy52YWx1ZSA9IHRoaXMubnVtVmFsdWUodik7XHJcbiAgICAvL2Vsc2UgaWYoIHYgaW5zdGFuY2VvZiBBcnJheSAmJiB2Lmxlbmd0aCA9PT0gMSApIHYgPSB2WzBdO1xyXG4gICAgZWxzZSB0aGlzLnZhbHVlID0gdjtcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICBsZXQgaGFzQ2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgaWYgKG9sZCAhPT0gdGhpcy52YWx1ZSkge1xyXG4gICAgICBoYXNDaGFuZ2VkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaGFzQ2hhbmdlZDtcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyB1cGRhdGUgZXZlcnkgY2hhbmdlXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBvbkNoYW5nZShmKSB7XHJcbiAgICBpZiAodGhpcy5pc1NwYWNlKSByZXR1cm47XHJcbiAgICB0aGlzLmNhbGxiYWNrID0gZiB8fCBudWxsO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gdXBkYXRlIG9ubHkgb24gZW5kXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBvbkZpbmlzaENoYW5nZShmKSB7XHJcbiAgICBpZiAodGhpcy5pc1NwYWNlKSByZXR1cm47XHJcbiAgICB0aGlzLmNhbGxiYWNrID0gbnVsbDtcclxuICAgIHRoaXMuZW5kQ2FsbGJhY2sgPSBmO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gZXZlbnQgb24gb3BlbiBjbG9zZVxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgb25PcGVuKGYpIHtcclxuICAgIHRoaXMub3BlbkNhbGxiYWNrID0gZjtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgb25DbG9zZShmKSB7XHJcbiAgICB0aGlzLmNsb3NlQ2FsbGJhY2sgPSBmO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gIHNlbmQgYmFjayB2YWx1ZVxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgc2VuZCh2KSB7XHJcbiAgICB2ID0gdiB8fCB0aGlzLnZhbHVlO1xyXG4gICAgaWYgKHYgaW5zdGFuY2VvZiBBcnJheSAmJiB2Lmxlbmd0aCA9PT0gMSkgdiA9IHZbMF07XHJcblxyXG4gICAgdGhpcy5pc1NlbmQgPSB0cnVlO1xyXG4gICAgaWYgKHRoaXMub2JqZWN0TGluayAhPT0gbnVsbCkgdGhpcy5vYmplY3RMaW5rW3RoaXMub2JqZWN0S2V5XSA9IHY7XHJcbiAgICBpZiAodGhpcy5jYWxsYmFjaykgdGhpcy5jYWxsYmFjayh2LCB0aGlzLm9iamVjdEtleSk7XHJcbiAgICB0aGlzLmlzU2VuZCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgc2VuZEVuZCh2KSB7XHJcbiAgICB2ID0gdiB8fCB0aGlzLnZhbHVlO1xyXG4gICAgaWYgKHYgaW5zdGFuY2VvZiBBcnJheSAmJiB2Lmxlbmd0aCA9PT0gMSkgdiA9IHZbMF07XHJcblxyXG4gICAgaWYgKHRoaXMuZW5kQ2FsbGJhY2spIHRoaXMuZW5kQ2FsbGJhY2sodik7XHJcbiAgICBpZiAodGhpcy5vYmplY3RMaW5rICE9PSBudWxsKSB0aGlzLm9iamVjdExpbmtbdGhpcy5vYmplY3RLZXldID0gdjtcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBjbGVhciBub2RlXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBkaXNwb3NlKCkge1xyXG4gICAgaWYgKHRoaXMuaXNMaXN0ZW4pIFJvb3RzLnJlbW92ZUxpc3Rlbih0aGlzKTtcclxuXHJcbiAgICBUb29scy5jbGVhcih0aGlzLmNbMF0pO1xyXG5cclxuICAgIGlmICh0aGlzLnRhcmdldCAhPT0gbnVsbCkge1xyXG4gICAgICBpZiAodGhpcy5ncm91cCAhPT0gbnVsbCkgdGhpcy5ncm91cC5jbGVhck9uZSh0aGlzKTtcclxuICAgICAgZWxzZSB0aGlzLnRhcmdldC5yZW1vdmVDaGlsZCh0aGlzLmNbMF0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMuaXNVSSkgdGhpcy5tYWluLmNsZWFyT25lKHRoaXMpO1xyXG4gICAgICBlbHNlIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGhpcy5jWzBdKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMuaXNVSSkgUm9vdHMucmVtb3ZlKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuYyA9IG51bGw7XHJcbiAgICB0aGlzLnMgPSBudWxsO1xyXG4gICAgdGhpcy5jYWxsYmFjayA9IG51bGw7XHJcbiAgICB0aGlzLnRhcmdldCA9IG51bGw7XHJcbiAgICB0aGlzLmlzTGlzdGVuID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBjbGVhcigpIHt9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBjaGFuZ2Ugc2l6ZVxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgZ2V0V2lkdGgoKSB7XHJcbiAgICBsZXQgbncgPSBSb290cy5nZXRXaWR0aCh0aGlzKTtcclxuICAgIGlmIChudykgdGhpcy53ID0gbnc7XHJcbiAgfVxyXG5cclxuICBzZXRTaXplKHN4KSB7XHJcbiAgICBpZiAoIXRoaXMuYXV0b1dpZHRoKSByZXR1cm47XHJcblxyXG4gICAgdGhpcy53ID0gc3g7XHJcblxyXG4gICAgaWYgKHRoaXMuc2ltcGxlKSB7XHJcbiAgICAgIHRoaXMuc2IgPSB0aGlzLncgLSB0aGlzLnNhO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbGV0IHBwID0gdGhpcy53ICogKHRoaXMucCAvIDEwMCk7XHJcbiAgICAgIC8vdGhpcy5zYSA9IE1hdGguZmxvb3IoIHBwICsgMTAgKVxyXG4gICAgICAvL3RoaXMuc2IgPSBNYXRoLmZsb29yKCB0aGlzLncgLSBwcCAtIDIwIClcclxuICAgICAgdGhpcy5zYSA9IE1hdGguZmxvb3IocHAgKyA4KTtcclxuICAgICAgdGhpcy5zYiA9IE1hdGguZmxvb3IodGhpcy53IC0gcHAgLSAxNik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByU2l6ZSgpIHtcclxuICAgIGlmICghdGhpcy5hdXRvV2lkdGgpIHJldHVybjtcclxuICAgIGlmICghdGhpcy5pc1VJKSB0aGlzLnNbMF0ud2lkdGggPSB0aGlzLncgKyBcInB4XCI7XHJcbiAgICBpZiAoIXRoaXMuc2ltcGxlKSB0aGlzLnNbMV0ud2lkdGggPSB0aGlzLnNhICsgXCJweFwiO1xyXG4gIH1cclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIGZvciBudW1lcmljIHZhbHVlXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBzZXRUeXBlTnVtYmVyKG8pIHtcclxuICAgIHRoaXMuaXNOdW1iZXIgPSB0cnVlO1xyXG5cclxuICAgIHRoaXMudmFsdWUgPSAwO1xyXG4gICAgaWYgKG8udmFsdWUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBpZiAodHlwZW9mIG8udmFsdWUgPT09IFwic3RyaW5nXCIpIHRoaXMudmFsdWUgPSBvLnZhbHVlICogMTtcclxuICAgICAgZWxzZSB0aGlzLnZhbHVlID0gby52YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm1pbiA9IG8ubWluID09PSB1bmRlZmluZWQgPyAtSW5maW5pdHkgOiBvLm1pbjtcclxuICAgIHRoaXMubWF4ID0gby5tYXggPT09IHVuZGVmaW5lZCA/IEluZmluaXR5IDogby5tYXg7XHJcbiAgICB0aGlzLnByZWNpc2lvbiA9IG8ucHJlY2lzaW9uID09PSB1bmRlZmluZWQgPyAyIDogby5wcmVjaXNpb247XHJcblxyXG4gICAgbGV0IHM7XHJcblxyXG4gICAgc3dpdGNoICh0aGlzLnByZWNpc2lvbikge1xyXG4gICAgICBjYXNlIDA6XHJcbiAgICAgICAgcyA9IDE7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMTpcclxuICAgICAgICBzID0gMC4xO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDI6XHJcbiAgICAgICAgcyA9IDAuMDE7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMzpcclxuICAgICAgICBzID0gMC4wMDE7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNDpcclxuICAgICAgICBzID0gMC4wMDAxO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDU6XHJcbiAgICAgICAgcyA9IDAuMDAwMDE7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNjpcclxuICAgICAgICBzID0gMC4wMDAwMDE7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zdGVwID0gby5zdGVwID09PSB1bmRlZmluZWQgPyBzIDogby5zdGVwO1xyXG4gICAgdGhpcy5yYW5nZSA9IHRoaXMubWF4IC0gdGhpcy5taW47XHJcbiAgICB0aGlzLnZhbHVlID0gdGhpcy5udW1WYWx1ZSh0aGlzLnZhbHVlKTtcclxuICB9XHJcblxyXG4gIG51bVZhbHVlKG4pIHtcclxuICAgIGlmICh0aGlzLm5vTmVnKSBuID0gTWF0aC5hYnMobik7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBNYXRoLm1pbih0aGlzLm1heCwgTWF0aC5tYXgodGhpcy5taW4sIG4pKS50b0ZpeGVkKHRoaXMucHJlY2lzaW9uKSAqIDFcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gICBFVkVOVFMgREVGQVVMVFxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgaGFuZGxlRXZlbnQoZSkge1xyXG4gICAgaWYgKHRoaXMubG9jaykgcmV0dXJuO1xyXG4gICAgaWYgKHRoaXMubmV2ZXJsb2NrKSBSb290cy5sb2NrID0gZmFsc2U7XHJcbiAgICBpZiAoIXRoaXNbZS50eXBlXSlcclxuICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZS50eXBlLCBcInRoaXMgdHlwZSBvZiBldmVudCBubyBleGlzdGUgIVwiKTtcclxuXHJcbiAgICAvLyBUT0RPICEhISFcclxuXHJcbiAgICAvL2lmKCB0aGlzLm1hcmdpbkRpdiApIHouZCAtPSB0aGlzLm1hcmdpbiAqIDAuNVxyXG5cclxuICAgIC8vaWYoIHRoaXMubWFyZ2luRGl2ICkgZS5jbGllbnRZIC09IHRoaXMubWFyZ2luICogMC41XHJcbiAgICAvL2lmKCB0aGlzLmdyb3VwICYmIHRoaXMuZ3JvdXAubWFyZ2luRGl2ICkgZS5jbGllbnRZIC09IHRoaXMuZ3JvdXAubWFyZ2luICogMC41XHJcblxyXG4gICAgcmV0dXJuIHRoaXNbZS50eXBlXShlKTtcclxuICB9XHJcblxyXG4gIHdoZWVsKGUpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgbW91c2Vkb3duKGUpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgbW91c2Vtb3ZlKGUpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgbW91c2V1cChlKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIGtleWRvd24oZSkge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBrZXl1cChlKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gb2JqZWN0IHJlZmVyZW5jeVxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgc2V0UmVmZXJlbmN5KG9iaiwga2V5KSB7XHJcbiAgICB0aGlzLm9iamVjdExpbmsgPSBvYmo7XHJcbiAgICB0aGlzLm9iamVjdEtleSA9IGtleTtcclxuICB9XHJcblxyXG4gIGRpc3BsYXkodiA9IGZhbHNlKSB7XHJcbiAgICB0aGlzLnNbMF0udmlzaWJpbGl0eSA9IHYgPyBcInZpc2libGVcIiA6IFwiaGlkZGVuXCI7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gcmVzaXplIGhlaWdodFxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgb3BlbigpIHtcclxuICAgIGlmICh0aGlzLmlzT3BlbikgcmV0dXJuO1xyXG4gICAgdGhpcy5pc09wZW4gPSB0cnVlO1xyXG4gICAgUm9vdHMubmVlZFJlc2l6ZSA9IHRydWU7XHJcbiAgICBpZiAodGhpcy5vcGVuQ2FsbGJhY2spIHRoaXMub3BlbkNhbGxiYWNrKCk7XHJcbiAgfVxyXG5cclxuICBjbG9zZSgpIHtcclxuICAgIGlmICghdGhpcy5pc09wZW4pIHJldHVybjtcclxuICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcbiAgICBSb290cy5uZWVkUmVzaXplID0gdHJ1ZTtcclxuICAgIGlmICh0aGlzLmNsb3NlQ2FsbGJhY2spIHRoaXMuY2xvc2VDYWxsYmFjaygpO1xyXG4gIH1cclxuXHJcbiAgbmVlZFpvbmUoKSB7XHJcbiAgICBSb290cy5uZWVkUmVab25lID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHJlem9uZSgpIHtcclxuICAgIFJvb3RzLm5lZWRSZVpvbmUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vICBJTlBVVFxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgc2VsZWN0KCkge31cclxuXHJcbiAgdW5zZWxlY3QoKSB7fVxyXG5cclxuICBzZXRJbnB1dChJbnB1dCkge1xyXG4gICAgUm9vdHMuc2V0SW5wdXQoSW5wdXQsIHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgdXBJbnB1dCh4LCBkb3duKSB7XHJcbiAgICByZXR1cm4gUm9vdHMudXBJbnB1dCh4LCBkb3duKTtcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBzcGVjaWFsIGl0ZW1cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIHNlbGVjdGVkKGIpIHtcclxuICAgIHRoaXMuaXNTZWxlY3QgPSBiIHx8IGZhbHNlO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8uanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJvb2wgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudmFsdWUgPSBvLnZhbHVlIHx8IGZhbHNlXHJcbiAgICAgICAgdGhpcy5tb2RlbCA9IG8ubW9kZSAhPT0gdW5kZWZpbmVkID8gby5tb2RlIDogMFxyXG5cclxuICAgICAgICB0aGlzLm9uTmFtZSA9IG8ucmVuYW1lIHx8IHRoaXMudHh0XHJcbiAgICAgICAgaWYoIG8ub25OYW1lICkgby5vbm5hbWUgPSBvLm9uTmFtZVxyXG4gICAgICAgIGlmKCBvLm9ubmFtZSApIHRoaXMub25OYW1lID0gby5vbm5hbWVcclxuXHJcbiAgICAgICAgdGhpcy5pbmggPSBvLmluaCB8fCBNYXRoLmZsb29yKCB0aGlzLmgqMC44IClcclxuICAgICAgICB0aGlzLmludyA9IG8uaW53IHx8IDM2XHJcblxyXG4gICAgICAgIGxldCBjYyA9IHRoaXMuY29sb3JzXHJcbiAgICAgICBcclxuICAgICAgICBpZiggdGhpcy5tb2RlbCA9PT0gMCApe1xyXG4gICAgICAgICAgICBsZXQgdCA9IE1hdGguZmxvb3IodGhpcy5oKjAuNSktKCh0aGlzLmluaC0yKSowLjUpO1xyXG4gICAgICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ2JhY2tncm91bmQ6JysgY2MuaW5wdXRCZyArJzsgaGVpZ2h0OicrKHRoaXMuaW5oLTIpKydweDsgd2lkdGg6Jyt0aGlzLmludysncHg7IHRvcDonK3QrJ3B4OyBib3JkZXItcmFkaXVzOjEwcHg7IGJvcmRlcjoycHggc29saWQgJysgY2MuYmFjayApXHJcbiAgICAgICAgICAgIHRoaXMuY1szXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnaGVpZ2h0OicrKHRoaXMuaW5oLTYpKydweDsgd2lkdGg6MTZweDsgdG9wOicrKHQrMikrJ3B4OyBib3JkZXItcmFkaXVzOjEwcHg7IGJhY2tncm91bmQ6JysgY2MuYnV0dG9uKyc7JyApXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5wID0gMFxyXG4gICAgICAgICAgICBpZiggdGhpcy5jWzFdICE9PSB1bmRlZmluZWQgKSB0aGlzLmNbMV0udGV4dENvbnRlbnQgPSAnJztcclxuICAgICAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyB0aGlzLmNzcy5idXR0b24gKyAndG9wOjFweDsgYmFja2dyb3VuZDonK2NjLmJ1dHRvbisnOyBoZWlnaHQ6JysodGhpcy5oLTIpKydweDsgYm9yZGVyOicrY2MuYm9yZGVyU2l6ZSsncHggc29saWQgJytjYy5ib3JkZXIrJzsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsnIClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdCA9IC0xXHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpXHJcbiAgICAgICAgdGhpcy51cGRhdGUoKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSAhdGhpcy52YWx1ZVxyXG4gICAgICAgIHRoaXMudXBkYXRlKCB0cnVlIClcclxuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZSggdHJ1ZSApXHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZSgpXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgTU9ERVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vZGUgKCBvdmVyICkge1xyXG5cclxuICAgICAgICBsZXQgY2hhbmdlID0gZmFsc2VcclxuICAgICAgICBsZXQgY2MgPSB0aGlzLmNvbG9ycywgcyA9IHRoaXMucywgbiwgdiA9IHRoaXMudmFsdWVcclxuXHJcbiAgICAgICAgaWYoIG92ZXIgKSBuID0gdiA/IDQgOiAzXHJcbiAgICAgICAgZWxzZSBuID0gdiA/IDIgOiAxXHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnN0YXQgIT09IG4gKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3RhdCA9IG5cclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLm1vZGVsICE9PSAwICl7XHJcblxyXG4gICAgICAgICAgICAgICAgc3dpdGNoKCBuICl7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTogc1syXS5jb2xvciA9IGNjLnRleHQ7IHNbMl0uYmFja2dyb3VuZCA9IGNjLmJ1dHRvbjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOiBzWzJdLmNvbG9yID0gY2MudGV4dFNlbGVjdDsgc1syXS5iYWNrZ3JvdW5kID0gY2Muc2VsZWN0OyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6IHNbMl0uY29sb3IgPSBjYy50ZXh0T3Zlcjsgc1syXS5iYWNrZ3JvdW5kID0gY2Mub3Zlcm9mZjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA0OiBzWzJdLmNvbG9yID0gY2MudGV4dE92ZXI7IHNbMl0uYmFja2dyb3VuZCA9IGNjLm92ZXI7IGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNbMl0uaW5uZXJIVE1MID0gdiA/IHRoaXMub25OYW1lIDogdGhpcy5uYW1lXHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIHN3aXRjaCggbiApe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6IHNbMl0uYmFja2dyb3VuZCA9IHNbMl0uYm9yZGVyQ29sb3IgPSBjYy5iYWNrb2ZmOyBzWzNdLmJhY2tncm91bmQgPSBjYy5idXR0b247IGJyZWFrOy8vIG9mZiBvdXRcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6IHNbMl0uYmFja2dyb3VuZCA9IHNbMl0uYm9yZGVyQ29sb3IgPSBjYy5iYWNrOyBzWzNdLmJhY2tncm91bmQgPSBjYy50ZXh0T3ZlcjsgYnJlYWs7Ly8gb24gb3ZlclxyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzogc1syXS5iYWNrZ3JvdW5kID0gc1syXS5ib3JkZXJDb2xvciA9IGNjLmJhY2s7IHNbM10uYmFja2dyb3VuZCA9IGNjLm92ZXJvZmY7IGJyZWFrOy8vIG9mZiBvdmVyXHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA0OiBzWzJdLmJhY2tncm91bmQgPSBzWzJdLmJvcmRlckNvbG9yID0gY2MuYmFja29mZjsgc1szXS5iYWNrZ3JvdW5kID0gY2MudGV4dFNlbGVjdDsgYnJlYWs7Ly8gb24gb3V0XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHNbM10ubWFyZ2luTGVmdCA9IHYgPyAnMTdweCcgOiAnMnB4J1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gdiA/IHRoaXMub25OYW1lIDogdGhpcy5uYW1lXHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlXHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgdXBkYXRlICggdXAgKSB7XHJcblxyXG4gICAgICAgIHRoaXMubW9kZSgpXHJcbiAgICAgICAgaWYoIHVwICkgdGhpcy5zZW5kKClcclxuICAgICAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpXHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zXHJcbiAgICAgICAgbGV0IHcgPSAodGhpcy53IC0gMTAgKSAtIHRoaXMuaW53XHJcbiAgICAgICAgaWYoIHRoaXMubW9kZWwgPT09IDAgKXtcclxuICAgICAgICAgICAgc1syXS5sZWZ0ID0gdyArICdweCdcclxuICAgICAgICAgICAgc1szXS5sZWZ0ID0gdyArICdweCdcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzWzJdLmxlZnQgPSB0aGlzLnNhICsgJ3B4J1xyXG4gICAgICAgICAgICBzWzJdLndpZHRoID0gdGhpcy5zYiAgKyAncHgnXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90by5qcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgQnV0dG9uIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvIClcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9ICcnO1xyXG4gICAgICAgIGlmKCBvLnZhbHVlICE9PSB1bmRlZmluZWQgKSB0aGlzLnZhbHVlID0gby52YWx1ZVxyXG5cclxuICAgICAgICB0aGlzLnZhbHVlcyA9IG8udmFsdWUgfHwgdGhpcy50eHRcclxuICAgICAgICBpZiggby52YWx1ZXMgKSB0aGlzLnZhbHVlcyA9IG8udmFsdWVzXHJcblxyXG4gICAgICAgIGlmKCAhby52YWx1ZXMgJiYgIW8udmFsdWUgKSB0aGlzLnR4dCA9ICcnXHJcblxyXG4gICAgICAgIHRoaXMub25OYW1lID0gby5vbk5hbWUgfHwgbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5vbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBmb3JjZSBidXR0b24gd2lkdGhcclxuICAgICAgICB0aGlzLmJ3ID0gby5mb3JjZVdpZHRoIHx8IDBcclxuICAgICAgICBpZihvLmJ3KSB0aGlzLmJ3ID0gby5id1xyXG4gICAgICAgIHRoaXMuc3BhY2UgPSBvLnNwYWNlIHx8IDNcclxuXHJcbiAgICAgICAgaWYoIHR5cGVvZiB0aGlzLnZhbHVlcyA9PT0gJ3N0cmluZycgKSB0aGlzLnZhbHVlcyA9IFsgdGhpcy52YWx1ZXMgXVxyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlXHJcbiAgICAgICAgdGhpcy5uZXZlcmxvY2sgPSB0cnVlXHJcbiAgICAgICAgdGhpcy5yZXMgPSAwXHJcblxyXG4gICAgICAgIHRoaXMubG5nID0gdGhpcy52YWx1ZXMubGVuZ3RoXHJcbiAgICAgICAgdGhpcy50bXAgPSBbXVxyXG4gICAgICAgIHRoaXMuc3RhdCA9IFtdXHJcblxyXG4gICAgICAgIGxldCBzZWwsIGNjID0gdGhpcy5jb2xvcnM7XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgc2VsID0gZmFsc2VcclxuICAgICAgICAgICAgaWYoIHRoaXMudmFsdWVzW2ldID09PSB0aGlzLnZhbHVlICYmIHRoaXMuaXNTZWxlY3RhYmxlICkgc2VsID0gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jW2krMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArIHRoaXMuY3NzLmJ1dHRvbiArICd0b3A6MXB4OyBoZWlnaHQ6JysodGhpcy5oLTIpKydweDsgYm9yZGVyOicrY2MuYm9yZGVyU2l6ZSsncHggc29saWQgJytjYy5ib3JkZXIrJzsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsnIClcclxuICAgICAgICAgICAgdGhpcy5jW2krMl0uc3R5bGUuYmFja2dyb3VuZCA9IHNlbCA/IGNjLnNlbGVjdCA6IGNjLmJ1dHRvblxyXG4gICAgICAgICAgICB0aGlzLmNbaSsyXS5zdHlsZS5jb2xvciA9IHNlbCA/IGNjLnRleHRTZWxlY3QgOiBjYy50ZXh0XHJcbiAgICAgICAgICAgIHRoaXMuY1tpKzJdLmlubmVySFRNTCA9IHRoaXMudmFsdWVzW2ldO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRbaV0gPSBzZWwgPyAzOjE7XHJcblxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnR4dD09PScnICkgdGhpcy5wID0gMCBcclxuXHJcbiAgICAgICAgaWYoICghby52YWx1ZSAmJiAhby52YWx1ZXMpIHx8IHRoaXMucCA9PT0gMCApe1xyXG4gICAgICAgICAgICBpZiggdGhpcy5jWzFdICE9PSB1bmRlZmluZWQgKSB0aGlzLmNbMV0udGV4dENvbnRlbnQgPSAnJ1xyXG4gICAgICAgIH0gXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBvbk9mZigpIHtcclxuXHJcbiAgICAgICAgdGhpcy5vbiA9ICF0aGlzLm9uO1xyXG4gICAgICAgIHRoaXMubGFiZWwoIHRoaXMub24gPyB0aGlzLm9uTmFtZSA6IHRoaXMudmFsdWUgKVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gLTFcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZ1xyXG4gICAgICAgIGxldCB0ID0gdGhpcy50bXBcclxuICAgICAgICBcclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgXHRpZiggbC54PnRbaV1bMF0gJiYgbC54PHRbaV1bMl0gKSByZXR1cm4gaVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIC0xXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0Rvd24gKSByZXR1cm4gZmFsc2VcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZVxyXG4gICAgICAgIGlmKCB0aGlzLnJlcyAhPT0gLTEgKXtcclxuICAgICAgICAgICAgaWYoIHRoaXMudmFsdWUgPT09IHRoaXMudmFsdWVzW3RoaXMucmVzXSAmJiB0aGlzLnVuc2VsZWN0YWJsZSApIHRoaXMudmFsdWUgPSAnJ1xyXG4gICAgICAgICAgICBlbHNlIHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlc1t0aGlzLnJlc11cclxuICAgICAgICAgICAgaWYoIHRoaXMub25OYW1lICE9PSBudWxsICkgdGhpcy5vbk9mZigpXHJcbiAgICAgICAgICAgIHRoaXMuc2VuZCgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gKSByZXR1cm4gZmFsc2VcclxuICAgICAgICB0aGlzLmlzRG93biA9IHRydWVcclxuICAgIFx0cmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlIClcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IHVwID0gZmFsc2VcclxuICAgICAgICB0aGlzLnJlcyA9IHRoaXMudGVzdFpvbmUoIGUgKVxyXG5cclxuICAgICAgICBpZiggdGhpcy5yZXMgIT09IC0xICl7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJylcclxuICAgICAgICAgICAgdXAgPSB0aGlzLm1vZGVzKCB0aGlzLmlzRG93biA/IDMgOiAyLCB0aGlzLnJlcyApXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICBcdHVwID0gdGhpcy5yZXNldCgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdXBcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vZGVzICggTiA9IDEsIGlkID0gLTEgKSB7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmcsIHcsIG4sIHIgPSBmYWxzZVxyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcblxyXG4gICAgICAgICAgICBuID0gTlxyXG4gICAgICAgICAgICB3ID0gdGhpcy5pc1NlbGVjdGFibGUgPyB0aGlzLnZhbHVlc1sgaSBdID09PSB0aGlzLnZhbHVlIDogZmFsc2VcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmKCBpID09PSBpZCApe1xyXG4gICAgICAgICAgICAgICAgaWYoIHcgJiYgbiA9PT0gMiApIG4gPSAzIFxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbiA9IDFcclxuICAgICAgICAgICAgICAgIGlmKCB3ICkgbiA9IDRcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9pZiggdGhpcy5tb2RlKCBuLCBpICkgKSByID0gdHJ1ZVxyXG4gICAgICAgICAgICByID0gdGhpcy5tb2RlKCBuLCBpIClcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gclxyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb2RlICggbiwgaWQgKSB7XHJcblxyXG4gICAgICAgIC8vaWYoIXRoaXMucykgcmV0dXJuIGZhbHNlXHJcbiBcclxuICAgICAgICBsZXQgY2hhbmdlID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IGNjID0gdGhpcy5jb2xvcnMsIHMgPSB0aGlzLnNcclxuICAgICAgICBsZXQgaSA9IGlkKzJcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuc3RhdFtpZF0gIT09IG4gKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3RhdFtpZF0gPSBuO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICBzd2l0Y2goIG4gKXtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHNbaV0uY29sb3IgPSBjYy50ZXh0OyBzW2ldLmJhY2tncm91bmQgPSBjYy5idXR0b247IGJyZWFrXHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHNbaV0uY29sb3IgPSBjYy50ZXh0T3Zlcjsgc1tpXS5iYWNrZ3JvdW5kID0gY2Mub3Zlcm9mZjsgYnJlYWtcclxuICAgICAgICAgICAgICAgIGNhc2UgMzogc1tpXS5jb2xvciA9IGNjLnRleHRPdmVyOyBzW2ldLmJhY2tncm91bmQgPSBjYy5vdmVyOyBicmVha1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBzW2ldLmNvbG9yID0gY2MudGV4dFNlbGVjdDsgc1tpXS5iYWNrZ3JvdW5kID0gY2Muc2VsZWN0OyBicmVha1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY2hhbmdlXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMucmVzID0gLTFcclxuICAgICAgICB0aGlzLmN1cnNvcigpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZXMoKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBsYWJlbCAoIHN0cmluZywgbiApIHtcclxuXHJcbiAgICAgICAgbiA9IG4gfHwgMjtcclxuICAgICAgICB0aGlzLmNbbl0udGV4dENvbnRlbnQgPSBzdHJpbmdcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc3dpdGNoVmFsdWVzKCBuLCBzdHJpbmcgKXtcclxuICAgICAgICB0aGlzLmNbbisyXS5pbm5lckhUTUwgPSB0aGlzLnZhbHVlc1tuXSA9IHN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICBpY29uICggc3RyaW5nLCB5ID0gMCwgbiA9IDIgKSB7XHJcblxyXG4gICAgICAgIC8vaWYoeSkgdGhpcy5zW25dLm1hcmdpbiA9ICggeSApICsncHggMHB4JztcclxuICAgICAgICB0aGlzLnNbbl0ucGFkZGluZyA9ICggeSApICsncHggMHB4JztcclxuICAgICAgICB0aGlzLmNbbl0uaW5uZXJIVE1MID0gc3RyaW5nO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKCk7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIGxldCB3ID0gdGhpcy5zYjtcclxuICAgICAgICBsZXQgZCA9IHRoaXMuc2E7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgbGV0IHN4ID0gdGhpcy5jb2xvcnMuc3ggLy90aGlzLnNwYWNlO1xyXG4gICAgICAgIC8vbGV0IHNpemUgPSBNYXRoLmZsb29yKCAoIHctKGRjKihpLTEpKSApIC8gaSApO1xyXG4gICAgICAgIGxldCBzaXplID0gKCB3LShzeCooaS0xKSkgKSAvIGkgXHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmJ3ICl7IFxyXG4gICAgICAgICAgICBzaXplID0gdGhpcy5idyA8IHNpemUgPyB0aGlzLmJ3IDogc2l6ZVxyXG4gICAgICAgICAgICAvL2QgPSBNYXRoLmZsb29yKCh0aGlzLnctKCAoc2l6ZSAqIGkpICsgKGRjICogKGktMSkpICkpKjAuNSlcclxuICAgICAgICAgICAgZCA9ICgodGhpcy53LSggKHNpemUgKiBpKSArIChzeCAqIChpLTEpKSApKSowLjUpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcblxyXG4gICAgICAgIFx0Ly90aGlzLnRtcFtpXSA9IFsgTWF0aC5mbG9vciggZCArICggc2l6ZSAqIGkgKSArICggZGMgKiBpICkpLCBzaXplIF07XHJcbiAgICAgICAgICAgIHRoaXMudG1wW2ldID0gWyAoIGQgKyAoIHNpemUgKiBpICkgKyAoIHN4ICogaSApKSwgc2l6ZSBdO1xyXG4gICAgICAgIFx0dGhpcy50bXBbaV1bMl0gPSB0aGlzLnRtcFtpXVswXSArIHRoaXMudG1wW2ldWzFdO1xyXG5cclxuICAgICAgICAgICAgc1tpKzJdLmxlZnQgPSB0aGlzLnRtcFtpXVswXSArICdweCdcclxuICAgICAgICAgICAgc1tpKzJdLndpZHRoID0gdGhpcy50bXBbaV1bMV0gKyAncHgnXHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvLmpzJztcclxuaW1wb3J0IHsgVG9vbHMgfSBmcm9tICcuLi9jb3JlL1Rvb2xzLmpzJztcclxuaW1wb3J0IHsgVjIgfSBmcm9tICcuLi9jb3JlL1YyLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBDaXJjdWxhciBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApXHJcblxyXG4gICAgICAgIHRoaXMuaXNDeWNsaWMgPSBvLmN5Y2xpYyB8fCBmYWxzZVxyXG4gICAgICAgIHRoaXMubW9kZWwgPSBvLnN0eXBlIHx8IDBcclxuICAgICAgICBpZiggby5tb2RlICE9PSB1bmRlZmluZWQgKSB0aGlzLm1vZGVsID0gby5tb2RlXHJcblxyXG4gICAgICAgIHRoaXMuYXV0b1dpZHRoID0gZmFsc2VcclxuICAgICAgICB0aGlzLm1pbncgPSB0aGlzLndcclxuICAgICAgICB0aGlzLmRpYW0gPSBvLmRpYW0gfHwgdGhpcy53IFxyXG5cclxuICAgICAgICB0aGlzLnNldFR5cGVOdW1iZXIoIG8gKVxyXG5cclxuICAgICAgICB0aGlzLnR3b1BpID0gVG9vbHMuVHdvUElcclxuICAgICAgICB0aGlzLnBpOTAgPSBUb29scy5waTkwXHJcblxyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gbmV3IFYyKClcclxuXHJcbiAgICAgICAgdGhpcy5oID0gby5oIHx8IHRoaXMudyArIDEwXHJcblxyXG4gICAgICAgIHRoaXMuY1swXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4J1xyXG4gICAgICAgIHRoaXMuY1swXS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG5cclxuICAgICAgICBpZih0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLndpZHRoID0gJzEwMCUnXHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS5zdHlsZS5qdXN0aWZ5Q29udGVudCA9ICdjZW50ZXInXHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gMTBcclxuICAgICAgICAgICAgdGhpcy5oICs9IDEwXHJcblxyXG4gICAgICAgIH1cclxuXHJcblxyXG5cclxuICAgICAgICB0aGlzLnBlcmNlbnQgPSAwXHJcbiAgICAgICAgdGhpcy5jbW9kZSA9IDBcclxuICAgICAgICBsZXQgY2MgPSB0aGlzLmNvbG9yc1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICdqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOyB0b3A6JysodGhpcy5oLTIwKSsncHg7IHdpZHRoOjEwMCU7IGNvbG9yOicrIGNjLnRleHQgKVxyXG5cclxuICAgICAgICAvLyBzdmdcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmdldENpcmN1bGFyKClcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIGNjLmJhY2ssIDAgKVxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgdGhpcy5tYWtlUGF0aCgpLCAxIClcclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgY2MudGV4dCwgMSApXHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICd2aWV3Qm94JywgJzAgMCAnK3RoaXMuZGlhbSsnICcrdGhpcy5kaWFtIClcclxuICAgICAgICB0aGlzLnNldENzcyggdGhpcy5jWzNdLCB7IHdpZHRoOnRoaXMuZGlhbSwgaGVpZ2h0OnRoaXMuZGlhbSwgbGVmdDowLCB0b3A6dGhpcy50b3AgfSlcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KClcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpXHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vZGUgKCBtb2RlICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jbW9kZSA9PT0gbW9kZSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IGNjID0gdGhpcy5jb2xvcnNcclxuICAgICAgICBsZXQgY29sb3JcclxuXHJcbiAgICAgICAgc3dpdGNoKCBtb2RlICl7XHJcbiAgICAgICAgICAgIGNhc2UgMDogLy8gYmFzZVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc1syXS5jb2xvciA9IGNjLnRleHQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgY2MuYmFjaywgMCk7XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IHRoaXMubW9kZWwgPiAwID8gVG9vbHMucGFjayggVG9vbHMubGVycENvbG9yKCBUb29scy51bnBhY2soIFRvb2xzLkNvbG9yTHVtYSggY2MudGV4dCwgLTAuNzUpICksIFRvb2xzLnVucGFjayggY2MudGV4dCApLCB0aGlzLnBlcmNlbnQgKSApIDogY2MudGV4dDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCBjb2xvciwgMSApO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIGRvd25cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNbMl0uY29sb3IgPSBjYy50ZXh0T3ZlcjtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCBjYy5iYWNrb2ZmLCAwKTtcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gdGhpcy5tb2RlbCA+IDAgPyBUb29scy5wYWNrKCBUb29scy5sZXJwQ29sb3IoIFRvb2xzLnVucGFjayggVG9vbHMuQ29sb3JMdW1hKCBjYy50ZXh0LCAtMC43NSkgKSwgVG9vbHMudW5wYWNrKCBjYy50ZXh0ICksIHRoaXMucGVyY2VudCApICkgOiBjYy50ZXh0T3ZlclxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIGNvbG9yLCAxICk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNtb2RlID0gbW9kZTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIGwueSA8PSB0aGlzLmNbIDEgXS5vZmZzZXRIZWlnaHQgKSByZXR1cm4gJ3RpdGxlJztcclxuICAgICAgICBlbHNlIGlmICggbC55ID4gdGhpcy5oIC0gdGhpcy5jWyAyIF0ub2Zmc2V0SGVpZ2h0ICkgcmV0dXJuICd0ZXh0JztcclxuICAgICAgICBlbHNlIHJldHVybiAnY2lyY3VsYXInO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2VuZEVuZCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGUoMCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm9sZCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgdGhpcy5vbGRyID0gbnVsbDtcclxuICAgICAgICB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGUoMSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0Rvd24gKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2coJ292ZXInKVxyXG5cclxuICAgICAgICBsZXQgb2ZmID0gdGhpcy5vZmZzZXQ7XHJcbiAgICAgICAgb2ZmLnggPSAodGhpcy53KjAuNSkgLSAoIGUuY2xpZW50WCAtIHRoaXMuem9uZS54ICk7XHJcbiAgICAgICAgb2ZmLnkgPSAodGhpcy5kaWFtKjAuNSkgLSAoIGUuY2xpZW50WSAtIHRoaXMuem9uZS55IC0gdGhpcy55dG9wICk7XHJcblxyXG4gICAgICAgIHRoaXMuciA9IG9mZi5hbmdsZSgpIC0gdGhpcy5waTkwO1xyXG4gICAgICAgIHRoaXMuciA9ICgoKHRoaXMuciV0aGlzLnR3b1BpKSt0aGlzLnR3b1BpKSV0aGlzLnR3b1BpKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMub2xkciAhPT0gbnVsbCApeyBcclxuXHJcbiAgICAgICAgICAgIGxldCBkaWYgPSB0aGlzLnIgLSB0aGlzLm9sZHI7XHJcbiAgICAgICAgICAgIHRoaXMuciA9IE1hdGguYWJzKGRpZikgPiBNYXRoLlBJID8gdGhpcy5vbGRyIDogdGhpcy5yO1xyXG5cclxuICAgICAgICAgICAgaWYoIGRpZiA+IDYgKSB0aGlzLnIgPSAwO1xyXG4gICAgICAgICAgICBpZiggZGlmIDwgLTYgKSB0aGlzLnIgPSB0aGlzLnR3b1BpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzdGVwcyA9IDEgLyB0aGlzLnR3b1BpO1xyXG4gICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuciAqIHN0ZXBzO1xyXG5cclxuICAgICAgICBsZXQgbiA9ICggKCB0aGlzLnJhbmdlICogdmFsdWUgKSArIHRoaXMubWluICkgLSB0aGlzLm9sZDtcclxuXHJcbiAgICAgICAgaWYobiA+PSB0aGlzLnN0ZXAgfHwgbiA8PSB0aGlzLnN0ZXApeyBcclxuICAgICAgICAgICAgbiA9IH5+ICggbiAvIHRoaXMuc3RlcCApO1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5udW1WYWx1ZSggdGhpcy5vbGQgKyAoIG4gKiB0aGlzLnN0ZXAgKSApO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSggdHJ1ZSApO1xyXG4gICAgICAgICAgICB0aGlzLm9sZCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMub2xkciA9IHRoaXMucjtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHdoZWVsICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAnY2lyY3VsYXInICkge1xyXG4gICAgXHJcbiAgICAgICAgICAgIGxldCB2ID0gdGhpcy52YWx1ZSAtIHRoaXMuc3RlcCAqIGUuZGVsdGE7XHJcbiAgICBcclxuICAgICAgICAgICAgaWYgKCB2ID4gdGhpcy5tYXggKSB7XHJcbiAgICAgICAgICAgICAgICB2ID0gdGhpcy5pc0N5Y2xpYyA/IHRoaXMubWluIDogdGhpcy5tYXg7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHYgPCB0aGlzLm1pbiApIHtcclxuICAgICAgICAgICAgICAgIHYgPSB0aGlzLmlzQ3ljbGljID8gdGhpcy5tYXggOiB0aGlzLm1pbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgICAgIHRoaXMuc2V0VmFsdWUoIHYgKTtcclxuICAgICAgICAgICAgdGhpcy5vbGQgPSB2O1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSggdHJ1ZSApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICBcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbWFrZVBhdGggKCkge1xyXG5cclxuICAgICAgICBsZXQgciA9IDQwO1xyXG4gICAgICAgIGxldCBkID0gMjQ7XHJcbiAgICAgICAgbGV0IGEgPSB0aGlzLnBlcmNlbnQgKiB0aGlzLnR3b1BpIC0gMC4wMDE7XHJcbiAgICAgICAgbGV0IHgyID0gKHIgKyByICogTWF0aC5zaW4oYSkpICsgZDtcclxuICAgICAgICBsZXQgeTIgPSAociAtIHIgKiBNYXRoLmNvcyhhKSkgKyBkO1xyXG4gICAgICAgIGxldCBiaWcgPSBhID4gTWF0aC5QSSA/IDEgOiAwO1xyXG4gICAgICAgIHJldHVybiBcIk0gXCIgKyAocitkKSArIFwiLFwiICsgZCArIFwiIEEgXCIgKyByICsgXCIsXCIgKyByICsgXCIgMCBcIiArIGJpZyArIFwiIDEgXCIgKyB4MiArIFwiLFwiICsgeTI7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSAoIHVwICkge1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIHRoaXMucGVyY2VudCA9ICggdGhpcy52YWx1ZSAtIHRoaXMubWluICkgLyB0aGlzLnJhbmdlO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsIHRoaXMubWFrZVBhdGgoKSwgMSApO1xyXG5cclxuICAgICAgICBpZiAoIHRoaXMubW9kZWwgPiAwICkge1xyXG5cclxuICAgICAgICAgICAgbGV0IGNjID0gdGhpcy5jb2xvcnNcclxuICAgICAgICAgICAgbGV0IGNvbG9yID0gVG9vbHMucGFjayggVG9vbHMubGVycENvbG9yKCBUb29scy51bnBhY2soIFRvb2xzLkNvbG9yTHVtYSggY2MudGV4dCwgLTAuNzUpICksIFRvb2xzLnVucGFjayggY2MudGV4dCApLCB0aGlzLnBlcmNlbnQgKSApO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgY29sb3IsIDEgKTtcclxuICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB1cCApIHRoaXMuc2VuZCgpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFRvb2xzIH0gZnJvbSAnLi4vY29yZS9Ub29scy5qcyc7XHJcbmltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90by5qcyc7XHJcbmltcG9ydCB7IFYyIH0gZnJvbSAnLi4vY29yZS9WMi5qcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgQ29sb3IgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcblx0ICAgIC8vdGhpcy5hdXRvSGVpZ2h0ID0gdHJ1ZTtcclxuXHJcblx0ICAgIHRoaXMuY3R5cGUgPSBvLmN0eXBlIHx8ICdoZXgnO1xyXG5cclxuXHQgICAgdGhpcy53Zml4ZSA9IDI1NjtcclxuXHJcblx0ICAgIHRoaXMuY3cgPSB0aGlzLnNiID4gMjU2ID8gMjU2IDogdGhpcy5zYjtcclxuXHQgICAgaWYoby5jdyAhPSB1bmRlZmluZWQgKSB0aGlzLmN3ID0gby5jdztcclxuXHJcblxyXG5cclxuXHQgICAgLy8gY29sb3IgdXAgb3IgZG93blxyXG5cdCAgICB0aGlzLnNpZGUgPSBvLnNpZGUgfHwgJ2Rvd24nO1xyXG5cdCAgICB0aGlzLnVwID0gdGhpcy5zaWRlID09PSAnZG93bicgPyAwIDogMTtcclxuXHQgICAgXHJcblx0ICAgIHRoaXMuYmFzZUggPSB0aGlzLmg7XHJcblxyXG5cdCAgICB0aGlzLm9mZnNldCA9IG5ldyBWMigpO1xyXG5cdCAgICB0aGlzLmRlY2FsID0gbmV3IFYyKCk7XHJcblx0ICAgIHRoaXMucHAgPSBuZXcgVjIoKTtcclxuXHJcblx0ICAgIGxldCBjYyA9IHRoaXMuY29sb3JzXHJcblxyXG5cdCAgIC8vIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgdGhpcy5jc3MubWlkZGxlICsgJ3RvcDoxcHg7IGhlaWdodDonKyh0aGlzLmgtMikrJ3B4OycgKyAnYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsgdGV4dC1zaGFkb3c6bm9uZTsgYm9yZGVyOicrY2MuYm9yZGVyU2l6ZSsncHggc29saWQgJytjYy5ib3JkZXIrJzsnIClcclxuXHJcblx0ICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgYCR7dGhpcy5jc3MudHh0fSAke3RoaXMuY3NzLm1pZGRsZX0gdG9wOjFweDsgaGVpZ2h0OiR7dGhpcy5oLTJ9cHg7IGJvcmRlci1yYWRpdXM6JHt0aGlzLnJhZGl1c31weDsgdGV4dC1zaGFkb3c6bm9uZTsgYm9yZGVyOiR7Y2MuYm9yZGVyU2l6ZX1weCBzb2xpZCAke2NjLmJvcmRlcn07YCApXHJcblx0ICAgIC8vdGhpcy5zWzJdID0gdGhpcy5jWzJdLnN0eWxlO1xyXG5cclxuXHQgICAgLy90aGlzLnNbMl0udGV4dFNoYWRvdyA9ICdub25lJ1xyXG5cclxuXHQgICAgLyppZiggdGhpcy51cCApe1xyXG5cdCAgICAgICAgdGhpcy5zWzJdLnRvcCA9ICdhdXRvJztcclxuXHQgICAgICAgIHRoaXMuc1syXS5ib3R0b20gPSAnMnB4JztcclxuXHQgICAgfSovXHJcblxyXG5cdCAgICAvL3RoaXMuY1swXS5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcclxuXHQgICAgdGhpcy5jWzBdLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcblxyXG5cdCAgICB0aGlzLmNbM10gPSB0aGlzLmdldENvbG9yUmluZygpXHJcblx0ICAgIHRoaXMuY1szXS5zdHlsZS52aXNpYmlsaXR5ICA9ICdoaWRkZW4nXHJcblxyXG5cdCAgICB0aGlzLmhzbCA9IG51bGxcclxuXHQgICAgdGhpcy52YWx1ZSA9ICcjZmZmZmZmJ1xyXG5cdCAgICBpZiggby52YWx1ZSAhPT0gdW5kZWZpbmVkICl7XHJcblx0ICAgICAgICBpZiggby52YWx1ZSBpbnN0YW5jZW9mIEFycmF5ICkgdGhpcy52YWx1ZSA9IFRvb2xzLnJnYlRvSGV4KCBvLnZhbHVlIClcclxuXHQgICAgICAgIGVsc2UgaWYoIWlzTmFOKG8udmFsdWUpKSB0aGlzLnZhbHVlID0gVG9vbHMuaGV4VG9IdG1sKCBvLnZhbHVlIClcclxuXHQgICAgICAgIGVsc2UgdGhpcy52YWx1ZSA9IG8udmFsdWVcclxuXHQgICAgfVxyXG5cclxuXHQgICAgdGhpcy5iY29sb3IgPSBudWxsXHJcblx0ICAgIHRoaXMuaXNEb3duID0gZmFsc2VcclxuXHQgICAgdGhpcy5maXN0RG93biA9IGZhbHNlXHJcblxyXG5cdCAgICB0aGlzLm5vdGV4dCA9IG8ubm90ZXh0IHx8IGZhbHNlXHJcblxyXG5cdCAgICB0aGlzLnRyID0gOThcclxuXHQgICAgdGhpcy50c2wgPSBNYXRoLnNxcnQoMykgKiB0aGlzLnRyXHJcblxyXG5cdCAgICB0aGlzLmh1ZSA9IDBcclxuXHQgICAgdGhpcy5kID0gMjU2XHJcblxyXG5cdCAgICB0aGlzLmluaXQoKVxyXG5cclxuXHQgICAgdGhpcy5zZXRDb2xvciggdGhpcy52YWx1ZSApXHJcblxyXG5cdCAgICBpZiggby5vcGVuICE9PSB1bmRlZmluZWQgKSB0aGlzLm9wZW4oKVxyXG5cclxuXHR9XHJcblxyXG5cdHRlc3Rab25lICggbXgsIG15ICkge1xyXG5cclxuXHRcdGxldCBsID0gdGhpcy5sb2NhbFxyXG5cdFx0aWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJ1xyXG5cclxuXHRcdGlmKCB0aGlzLnVwICYmIHRoaXMuaXNPcGVuICl7XHJcblxyXG5cdFx0XHRpZiggbC55ID4gdGhpcy53Zml4ZSApIHJldHVybiAndGl0bGUnXHJcblx0XHQgICAgZWxzZSByZXR1cm4gJ2NvbG9yJ1xyXG5cclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRpZiggbC55IDwgdGhpcy5iYXNlSCsyICkgcmV0dXJuICd0aXRsZSdcclxuXHQgICAgXHRlbHNlIGlmKCB0aGlzLmlzT3BlbiApIHJldHVybiAnY29sb3InXHJcblxyXG5cdFx0fVxyXG5cclxuICAgIH1cclxuXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblx0bW91c2V1cCAoIGUgKSB7XHJcblxyXG5cdCAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cdCAgICB0aGlzLmQgPSAyNTY7XHJcblxyXG5cdH1cclxuXHJcblx0bW91c2Vkb3duICggZSApIHtcclxuXHJcblxyXG5cdFx0bGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlLmNsaWVudFgsIGUuY2xpZW50WSApO1xyXG5cclxuXHJcblx0XHQvL2lmKCAhbmFtZSApIHJldHVybjtcclxuXHRcdGlmKG5hbWUgPT09ICd0aXRsZScpe1xyXG5cdFx0XHRpZiggIXRoaXMuaXNPcGVuICkgdGhpcy5vcGVuKCk7XHJcblx0ICAgICAgICBlbHNlIHRoaXMuY2xvc2UoKTtcclxuXHQgICAgICAgIHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHRpZiggbmFtZSA9PT0gJ2NvbG9yJyApe1xyXG5cclxuXHRcdFx0dGhpcy5pc0Rvd24gPSB0cnVlO1xyXG5cdFx0XHR0aGlzLmZpc3REb3duID0gdHJ1ZVxyXG5cdFx0XHR0aGlzLm1vdXNlbW92ZSggZSApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0bW91c2Vtb3ZlICggZSApIHtcclxuXHJcblx0ICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZS5jbGllbnRYLCBlLmNsaWVudFkgKTtcclxuXHJcblx0ICAgIGxldCBvZmYsIGQsIGh1ZSwgc2F0LCBsdW0sIHJhZCwgeCwgeSwgcnIsIFQgPSBUb29scztcclxuXHJcblx0ICAgIGlmKCBuYW1lID09PSAndGl0bGUnICkgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuXHJcblx0ICAgIGlmKCBuYW1lID09PSAnY29sb3InICl7XHJcblxyXG5cdCAgICBcdG9mZiA9IHRoaXMub2Zmc2V0O1xyXG5cdFx0ICAgIG9mZi54ID0gZS5jbGllbnRYIC0gKCB0aGlzLnpvbmUueCArIHRoaXMuZGVjYWwueCArIHRoaXMubWlkICk7XHJcblx0XHQgICAgb2ZmLnkgPSBlLmNsaWVudFkgLSAoIHRoaXMuem9uZS55ICsgdGhpcy5kZWNhbC55ICsgdGhpcy5taWQgKSAtIHRoaXMueXRvcDtcclxuXHRcdFx0ZCA9IG9mZi5sZW5ndGgoKSAqIHRoaXMucmF0aW87XHJcblx0XHRcdHJyID0gb2ZmLmFuZ2xlKCk7XHJcblx0XHRcdGlmKHJyIDwgMCkgcnIgKz0gMiAqIFQuUEk7XHJcblx0XHRcdFx0XHRcdFxyXG5cclxuXHQgICAgXHRpZiAoIGQgPCAxMjggKSB0aGlzLmN1cnNvcignY3Jvc3NoYWlyJyk7XHJcblx0ICAgIFx0ZWxzZSBpZiggIXRoaXMuaXNEb3duICkgdGhpcy5jdXJzb3IoKVxyXG5cclxuXHQgICAgXHRpZiggdGhpcy5pc0Rvd24gKXtcclxuXHJcblx0XHRcdCAgICBpZiggdGhpcy5maXN0RG93biApe1xyXG5cdFx0XHQgICAgXHR0aGlzLmQgPSBkO1xyXG5cdFx0XHQgICAgXHR0aGlzLmZpc3REb3duID0gZmFsc2U7XHJcblx0XHRcdCAgICB9XHJcblxyXG5cdFx0XHQgICAgaWYgKCB0aGlzLmQgPCAxMjggKSB7XHJcblxyXG5cdFx0XHRcdCAgICBpZiAoIHRoaXMuZCA+IHRoaXMudHIgKSB7IC8vIG91dHNpZGUgaHVlXHJcblxyXG5cdFx0XHRcdCAgICAgICAgaHVlID0gKCByciArIFQucGk5MCApIC8gVC5Ud29QSTtcclxuXHRcdFx0XHQgICAgICAgIHRoaXMuaHVlID0gKGh1ZSArIDEpICUgMTtcclxuXHRcdFx0XHQgICAgICAgIHRoaXMuc2V0SFNMKFsoaHVlICsgMSkgJSAxLCB0aGlzLmhzbFsxXSwgdGhpcy5oc2xbMl1dKTtcclxuXHJcblx0XHRcdFx0ICAgIH0gZWxzZSB7IC8vIHRyaWFuZ2xlXHJcblxyXG5cdFx0XHRcdCAgICBcdHggPSBvZmYueCAqIHRoaXMucmF0aW87XHJcblx0XHRcdFx0ICAgIFx0eSA9IG9mZi55ICogdGhpcy5yYXRpbztcclxuXHJcblx0XHRcdFx0ICAgIFx0bGV0IHJyID0gKHRoaXMuaHVlICogVC5Ud29QSSkgKyBULlBJO1xyXG5cdFx0XHRcdCAgICBcdGlmKHJyIDwgMCkgcnIgKz0gMiAqIFQuUEk7XHJcblxyXG5cdFx0XHRcdCAgICBcdHJhZCA9IE1hdGguYXRhbjIoLXksIHgpO1xyXG5cdFx0XHRcdCAgICBcdGlmKHJhZCA8IDApIHJhZCArPSAyICogVC5QSTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0ICAgIFx0bGV0IHJhZDAgPSAoIHJhZCArIFQucGk5MCArIFQuVHdvUEkgKyByciApICUgKFQuVHdvUEkpLFxyXG5cdFx0XHRcdCAgICBcdHJhZDEgPSByYWQwICUgKCgyLzMpICogVC5QSSkgLSAoVC5waTYwKSxcclxuXHRcdFx0XHQgICAgXHRhICAgID0gMC41ICogdGhpcy50cixcclxuXHRcdFx0XHQgICAgXHRiICAgID0gTWF0aC50YW4ocmFkMSkgKiBhLFxyXG5cdFx0XHRcdCAgICBcdHIgICAgPSBNYXRoLnNxcnQoeCp4ICsgeSp5KSxcclxuXHRcdFx0XHQgICAgXHRtYXhSID0gTWF0aC5zcXJ0KGEqYSArIGIqYik7XHJcblxyXG5cdFx0XHRcdCAgICBcdGlmKCByID4gbWF4UiApIHtcclxuXHRcdFx0XHRcdFx0XHRsZXQgZHggPSBNYXRoLnRhbihyYWQxKSAqIHI7XHJcblx0XHRcdFx0XHRcdFx0bGV0IHJhZDIgPSBNYXRoLmF0YW4oZHggLyBtYXhSKTtcclxuXHRcdFx0XHRcdFx0XHRpZihyYWQyID4gVC5waTYwKSAgcmFkMiA9IFQucGk2MDtcclxuXHRcdFx0XHRcdFx0ICAgIGVsc2UgaWYoIHJhZDIgPCAtVC5waTYwICkgcmFkMiA9IC1ULnBpNjA7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdHJhZCArPSByYWQyIC0gcmFkMTtcclxuXHJcblx0XHRcdFx0XHRcdFx0cmFkMCA9IChyYWQgKyBULnBpOTAgICsgVC5Ud29QSSArIHJyKSAlIChULlR3b1BJKSxcclxuXHRcdFx0XHRcdFx0XHRyYWQxID0gcmFkMCAlICgoMi8zKSAqIFQuUEkpIC0gKFQucGk2MCk7XHJcblx0XHRcdFx0XHRcdFx0YiA9IE1hdGgudGFuKHJhZDEpICogYTtcclxuXHRcdFx0XHRcdFx0XHRyID0gbWF4UiA9IE1hdGguc3FydChhKmEgKyBiKmIpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRsdW0gPSAoKE1hdGguc2luKHJhZDApICogcikgLyB0aGlzLnRzbCkgKyAwLjU7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGxldCB3ID0gMSAtIChNYXRoLmFicyhsdW0gLSAwLjUpICogMik7XHJcblx0XHRcdFx0XHRcdHNhdCA9ICgoKE1hdGguY29zKHJhZDApICogcikgKyAodGhpcy50ciAvIDIpKSAvICgxLjUgKiB0aGlzLnRyKSkgLyB3O1xyXG5cdFx0XHRcdFx0XHRzYXQgPSBULmNsYW1wKCBzYXQsIDAsIDEgKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0ICAgICAgICB0aGlzLnNldEhTTChbdGhpcy5oc2xbMF0sIHNhdCwgbHVtXSk7XHJcblxyXG5cdFx0XHRcdCAgICB9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHRzZXRIZWlnaHQgKCkge1xyXG5cclxuXHRcdHRoaXMuaCA9IHRoaXMuaXNPcGVuID8gdGhpcy53Zml4ZSArIHRoaXMuYmFzZUggKyA1IDogdGhpcy5iYXNlSFxyXG5cdFx0dGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCdcclxuXHRcdHRoaXMuem9uZS5oID0gdGhpcy5oXHJcblxyXG5cdH1cclxuXHJcblx0cGFyZW50SGVpZ2h0ICggdCApIHtcclxuXHJcblx0XHRpZiAoIHRoaXMuZ3JvdXAgIT09IG51bGwgKSB0aGlzLmdyb3VwLmNhbGMoIHQgKTtcclxuXHQgICAgZWxzZSBpZiAoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5jYWxjKCB0ICk7XHJcblxyXG5cdH1cclxuXHJcblx0b3BlbiAoKSB7XHJcblxyXG5cdFx0c3VwZXIub3BlbigpO1xyXG5cclxuXHRcdHRoaXMuc2V0SGVpZ2h0KCk7XHJcblxyXG5cdFx0aWYoIHRoaXMudXAgKSB0aGlzLnpvbmUueSAtPSB0aGlzLndmaXhlICsgNTtcclxuXHJcblx0XHRsZXQgdCA9IHRoaXMuaCAtIHRoaXMuYmFzZUg7XHJcblxyXG5cdCAgICB0aGlzLnNbM10udmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcclxuXHQgICAgLy90aGlzLnNbM10uZGlzcGxheSA9ICdibG9jayc7XHJcblx0ICAgIHRoaXMucGFyZW50SGVpZ2h0KCB0ICk7XHJcblxyXG5cdH1cclxuXHJcblx0Y2xvc2UgKCkge1xyXG5cclxuXHRcdHN1cGVyLmNsb3NlKCk7XHJcblxyXG5cdFx0aWYoIHRoaXMudXAgKSB0aGlzLnpvbmUueSArPSB0aGlzLndmaXhlICsgNTtcclxuXHJcblx0XHRsZXQgdCA9IHRoaXMuaCAtIHRoaXMuYmFzZUg7XHJcblxyXG5cdFx0dGhpcy5zZXRIZWlnaHQoKTtcclxuXHJcblx0ICAgIHRoaXMuc1szXS52aXNpYmlsaXR5ICA9ICdoaWRkZW4nO1xyXG5cdCAgICAvL3RoaXMuc1szXS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cdCAgICB0aGlzLnBhcmVudEhlaWdodCggLXQgKTtcclxuXHJcblx0fVxyXG5cclxuXHR1cGRhdGUgKCB1cCApIHtcclxuXHJcblx0ICAgIGxldCBjYyA9IFRvb2xzLnJnYlRvSGV4KCBUb29scy5oc2xUb1JnYihbIHRoaXMuaHNsWzBdLCAxLCAwLjUgXSkgKTtcclxuXHJcblx0ICAgIHRoaXMubW92ZU1hcmtlcnMoKTtcclxuXHQgICAgXHJcblx0ICAgIHRoaXMudmFsdWUgPSB0aGlzLmJjb2xvcjtcclxuXHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJywgY2MsIDIsIDAgKTtcclxuXHJcblx0ICAgIHRoaXMuc1syXS5iYWNrZ3JvdW5kID0gdGhpcy5iY29sb3I7XHJcblx0ICAgIGlmKCF0aGlzLm5vdGV4dCkgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gVG9vbHMuaHRtbFRvSGV4KCB0aGlzLmJjb2xvciApO1xyXG5cclxuXHQgICAgdGhpcy5pbnZlcnQgPSBUb29scy5maW5kRGVlcEludmVyKCB0aGlzLnJnYiApO1xyXG5cdCAgICB0aGlzLnNbMl0uY29sb3IgPSB0aGlzLmludmVydCA/ICcjZmZmJyA6ICcjMDAwJztcclxuXHJcblx0ICAgIGlmKCF1cCkgcmV0dXJuO1xyXG5cclxuXHQgICAgaWYoIHRoaXMuY3R5cGUgPT09ICdhcnJheScgKSB0aGlzLnNlbmQoIHRoaXMucmdiICk7XHJcblx0ICAgIGlmKCB0aGlzLmN0eXBlID09PSAncmdiJyApIHRoaXMuc2VuZCggVG9vbHMuaHRtbFJnYiggdGhpcy5yZ2IgKSApO1xyXG5cdCAgICBpZiggdGhpcy5jdHlwZSA9PT0gJ2hleCcgKSB0aGlzLnNlbmQoIFRvb2xzLmh0bWxUb0hleCggdGhpcy52YWx1ZSApICk7XHJcblx0ICAgIGlmKCB0aGlzLmN0eXBlID09PSAnaHRtbCcgKSB0aGlzLnNlbmQoKTtcclxuXHJcblx0fVxyXG5cclxuXHRzZXRWYWx1ZSAoIHYgKXtcclxuXHJcblx0XHRpZiggdiBpbnN0YW5jZW9mIEFycmF5ICkgdGhpcy52YWx1ZSA9IFRvb2xzLnJnYlRvSGV4KCB2ICk7XHJcbiAgICAgICAgZWxzZSBpZighaXNOYU4odikpIHRoaXMudmFsdWUgPSBUb29scy5oZXhUb0h0bWwoIHYgKTtcclxuICAgICAgICBlbHNlIHRoaXMudmFsdWUgPSB2O1xyXG5cclxuXHRcdHRoaXMuc2V0Q29sb3IoIHRoaXMudmFsdWUgKVxyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcblxyXG5cdH1cclxuXHJcblx0c2V0Q29sb3IgKCBjb2xvciApIHtcclxuXHJcblx0ICAgIGxldCB1bnBhY2sgPSBUb29scy51bnBhY2soY29sb3IpO1xyXG5cdCAgICBpZiAodGhpcy5iY29sb3IgIT09IGNvbG9yICYmIHVucGFjaykge1xyXG5cclxuXHQgICAgICAgIHRoaXMuYmNvbG9yID0gY29sb3JcclxuXHQgICAgICAgIHRoaXMucmdiID0gdW5wYWNrXHJcblx0ICAgICAgICB0aGlzLmhzbCA9IFRvb2xzLnJnYlRvSHNsKCB0aGlzLnJnYiApXHJcblxyXG5cdCAgICAgICAgdGhpcy5odWUgPSB0aGlzLmhzbFswXTtcclxuXHJcblx0ICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cdCAgICB9XHJcblx0ICAgIHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdHNldEhTTCAoIGhzbCApIHtcclxuXHJcblx0ICAgIHRoaXMuaHNsID0gaHNsO1xyXG5cdCAgICB0aGlzLnJnYiA9IFRvb2xzLmhzbFRvUmdiKCBoc2wgKTtcclxuXHQgICAgdGhpcy5iY29sb3IgPSBUb29scy5yZ2JUb0hleCggdGhpcy5yZ2IgKTtcclxuXHQgICAgdGhpcy51cGRhdGUoIHRydWUgKTtcclxuXHQgICAgcmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcblx0bW92ZU1hcmtlcnMgKCkge1xyXG5cclxuXHRcdGxldCBwID0gdGhpcy5wcFxyXG5cdFx0bGV0IFQgPSBUb29sc1xyXG5cclxuXHQgICAgbGV0IGMxID0gdGhpcy5pbnZlcnQgPyAnI2ZmZicgOiAnIzAwMCc7XHJcblx0ICAgIGxldCBhID0gdGhpcy5oc2xbMF0gKiBULlR3b1BJO1xyXG5cdCAgICBsZXQgdGhpcmQgPSAoMi8zKSAqIFQuUEk7XHJcblx0ICAgIGxldCByID0gdGhpcy50cjtcclxuXHQgICAgbGV0IGggPSB0aGlzLmhzbFswXTtcclxuXHQgICAgbGV0IHMgPSB0aGlzLmhzbFsxXTtcclxuXHQgICAgbGV0IGwgPSB0aGlzLmhzbFsyXTtcclxuXHJcblx0ICAgIGxldCBhbmdsZSA9ICggYSAtIFQucGk5MCApICogVC50b2RlZztcclxuXHJcblx0ICAgIGggPSAtIGEgKyBULnBpOTA7XHJcblxyXG5cdFx0bGV0IGh4ID0gTWF0aC5jb3MoaCkgKiByO1xyXG5cdFx0bGV0IGh5ID0gLU1hdGguc2luKGgpICogcjtcclxuXHRcdGxldCBzeCA9IE1hdGguY29zKGggLSB0aGlyZCkgKiByO1xyXG5cdFx0bGV0IHN5ID0gLU1hdGguc2luKGggLSB0aGlyZCkgKiByO1xyXG5cdFx0bGV0IHZ4ID0gTWF0aC5jb3MoaCArIHRoaXJkKSAqIHI7XHJcblx0XHRsZXQgdnkgPSAtTWF0aC5zaW4oaCArIHRoaXJkKSAqIHI7XHJcblx0XHRsZXQgbXggPSAoc3ggKyB2eCkgLyAyLCBteSA9IChzeSArIHZ5KSAvIDI7XHJcblx0XHRhICA9ICgxIC0gMiAqIE1hdGguYWJzKGwgLSAuNSkpICogcztcclxuXHRcdGxldCB4ID0gc3ggKyAodnggLSBzeCkgKiBsICsgKGh4IC0gbXgpICogYTtcclxuXHRcdGxldCB5ID0gc3kgKyAodnkgLSBzeSkgKiBsICsgKGh5IC0gbXkpICogYTtcclxuXHJcblx0ICAgIHAuc2V0KCB4LCB5ICkuYWRkU2NhbGFyKDEyOCk7XHJcblxyXG5cdCAgICAvL2xldCBmZiA9ICgxLWwpKjI1NTtcclxuXHQgICAgLy8gdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsICdyZ2IoJytmZisnLCcrZmYrJywnK2ZmKycpJywgMyApO1xyXG5cclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3RyYW5zZm9ybScsICdyb3RhdGUoJythbmdsZSsnICknLCAyICk7XHJcblxyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3gnLCBwLngsIDMgKTtcclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N5JywgcC55LCAzICk7XHJcblx0ICAgIFxyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgdGhpcy5pbnZlcnQgPyAnI2ZmZicgOiAnIzAwMCcsIDIsIDMgKTtcclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuaW52ZXJ0ID8gJyNmZmYnIDogJyMwMDAnLCAzICk7XHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJyx0aGlzLmJjb2xvciwgMyApO1xyXG5cclxuXHR9XHJcblxyXG5cdHJTaXplICgpIHtcclxuXHJcblx0ICAgIC8vUHJvdG8ucHJvdG90eXBlLnJTaXplLmNhbGwoIHRoaXMgKTtcclxuXHQgICAgc3VwZXIuclNpemUoKTtcclxuXHJcblx0ICAgIGxldCBzID0gdGhpcy5zO1xyXG5cclxuXHQgICAgc1syXS53aWR0aCA9IHRoaXMuc2IgKyAncHgnO1xyXG5cdCAgICBzWzJdLmxlZnQgPSB0aGlzLnNhICsgJ3B4JztcclxuXHJcblx0ICAgIC8vY29uc29sZS5sb2codGhpcy5zYilcclxuXHJcblx0ICAgIHRoaXMuY3cgPSB0aGlzLnNiID4gMjU2ID8gMjU2IDogdGhpcy5zYjtcclxuXHJcblxyXG5cclxuXHQgICAgdGhpcy5yU2l6ZUNvbG9yKCB0aGlzLmN3ICk7XHJcblxyXG5cdCAgICB0aGlzLmRlY2FsLnggPSBNYXRoLmZsb29yKCh0aGlzLncgLSB0aGlzLndmaXhlKSAqIDAuNSk7XHJcblx0ICAgIC8vc1szXS5sZWZ0ID0gdGhpcy5kZWNhbC54ICsgJ3B4JztcclxuXHQgICAgXHJcblx0fVxyXG5cclxuXHRyU2l6ZUNvbG9yICggdyApIHtcclxuXHJcblxyXG5cdFx0aWYoIHcgPT09IHRoaXMud2ZpeGUgKSByZXR1cm47XHJcblxyXG5cclxuXHJcblx0XHR0aGlzLndmaXhlID0gdztcclxuXHJcblxyXG5cclxuXHRcdGxldCBzID0gdGhpcy5zO1xyXG5cclxuXHRcdC8vdGhpcy5kZWNhbC54ID0gTWF0aC5mbG9vcigodGhpcy53IC0gdGhpcy53Zml4ZSkgKiAwLjUpO1xyXG5cdCAgICB0aGlzLmRlY2FsLnkgPSB0aGlzLnNpZGUgPT09ICd1cCcgPyAyIDogdGhpcy5iYXNlSCArIDJcclxuXHQgICAgdGhpcy5taWQgPSBNYXRoLmZsb29yKCB0aGlzLndmaXhlICogMC41IClcclxuXHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICd2aWV3Qm94JywgJzAgMCAnKyB0aGlzLndmaXhlICsgJyAnKyB0aGlzLndmaXhlIClcclxuXHQgICAgc1szXS53aWR0aCA9IHRoaXMud2ZpeGUgKyAncHgnXHJcblx0ICAgIHNbM10uaGVpZ2h0ID0gdGhpcy53Zml4ZSArICdweCdcclxuICAgIFx0Ly9zWzNdLmxlZnQgPSB0aGlzLmRlY2FsLnggKyAncHgnO1xyXG5cdCAgICBzWzNdLnRvcCA9IHRoaXMuZGVjYWwueSArICdweCdcclxuXHJcblx0ICAgIHRoaXMucmF0aW8gPSAyNTYgLyB0aGlzLndmaXhlXHJcblx0ICAgIHRoaXMuc3F1YXJlID0gMSAvICg2MCoodGhpcy53Zml4ZS8yNTYpKVxyXG5cdCAgICB0aGlzLnNldEhlaWdodCgpXHJcblxyXG5cdH1cclxuXHJcblxyXG59IiwiaW1wb3J0IHsgUm9vdHMgfSBmcm9tICcuLi9jb3JlL1Jvb3RzLmpzJztcclxuaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBGcHMgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5yb3VuZCA9IE1hdGgucm91bmQ7XHJcblxyXG4gICAgICAgIC8vdGhpcy5hdXRvSGVpZ2h0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5iYXNlSCA9IHRoaXMuaDtcclxuICAgICAgICB0aGlzLmhwbHVzID0gby5ocGx1cyB8fCA1MDtcclxuXHJcbiAgICAgICAgdGhpcy5yZXMgPSBvLnJlcyB8fCA0MDtcclxuICAgICAgICB0aGlzLmwgPSAxO1xyXG5cclxuICAgICAgICB0aGlzLnByZWNpc2lvbiA9IG8ucHJlY2lzaW9uIHx8IDA7XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIHRoaXMuY3VzdG9tID0gby5jdXN0b20gfHwgZmFsc2U7XHJcbiAgICAgICAgdGhpcy5uYW1lcyA9IG8ubmFtZXMgfHwgWydGUFMnLCAnTVMnXTtcclxuICAgICAgICBsZXQgY2MgPSBvLmNjIHx8IFsnMjIwLDIyMCwyMjAnLCAnMjU1LDI1NSwwJ107XHJcblxyXG4gICAgICAgLy8gdGhpcy5kaXZpZCA9IFsgMTAwLCAxMDAsIDEwMCBdO1xyXG4gICAgICAgLy8gdGhpcy5tdWx0eSA9IFsgMzAsIDMwLCAzMCBdO1xyXG5cclxuICAgICAgICB0aGlzLmFkZGluZyA9IG8uYWRkaW5nIHx8IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnJhbmdlID0gby5yYW5nZSB8fCBbIDE2NSwgMTAwLCAxMDAgXTtcclxuXHJcbiAgICAgICAgdGhpcy5hbHBoYSA9IG8uYWxwaGEgfHwgMC4yNTtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBbXTtcclxuICAgICAgICB0aGlzLnBvaW50cyA9IFtdO1xyXG4gICAgICAgIHRoaXMudGV4dERpc3BsYXkgPSBbXTtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuY3VzdG9tKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubm93ID0gUm9vdHMuZ2V0VGltZSgpXHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRUaW1lID0gMDsvL3RoaXMubm93KClcclxuICAgICAgICAgICAgdGhpcy5wcmV2VGltZSA9IDA7Ly90aGlzLnN0YXJ0VGltZTtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZXMgPSAwO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tcyA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuZnBzID0gMDtcclxuICAgICAgICAgICAgdGhpcy5tZW0gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLm1tID0gMDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXNNZW0gPSAoIHNlbGYucGVyZm9ybWFuY2UgJiYgc2VsZi5wZXJmb3JtYW5jZS5tZW1vcnkgKSA/IHRydWUgOiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgLy8gdGhpcy5kaXZpZCA9IFsgMTAwLCAyMDAsIDEgXTtcclxuICAgICAgICAgICAvLyB0aGlzLm11bHR5ID0gWyAzMCwgMzAsIDMwIF07XHJcblxyXG4gICAgICAgICAgICBpZiggdGhpcy5pc01lbSApe1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMubmFtZXMucHVzaCgnTUVNJyk7XHJcbiAgICAgICAgICAgICAgICBjYy5wdXNoKCcwLDI1NSwyNTUnKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMudHh0ID0gby5uYW1lIHx8ICdGcHMnXHJcblxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGxldCBmbHRvcCA9IE1hdGguZmxvb3IodGhpcy5oKjAuNSktMztcclxuICAgICAgICBjb25zdCBjY2MgPSB0aGlzLmNvbG9ycztcclxuXHJcbiAgICAgICAgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gdGhpcy50eHQ7XHJcbiAgICAgICAgLy90aGlzLmNbMV0uaW5uZXJIVE1MID0gJyYjMTYwOycgKyB0aGlzLnR4dFxyXG4gICAgICAgIHRoaXMuY1swXS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgICAgdGhpcy5jWzBdLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnYXV0byc7XHJcblxyXG4gICAgICAgIGxldCBwYW5lbENzcyA9ICdkaXNwbGF5Om5vbmU7IGxlZnQ6MTBweDsgdG9wOicrIHRoaXMuaCArICdweDsgaGVpZ2h0OicrKHRoaXMuaHBsdXMgLSA4KSsncHg7IGJveC1zaXppbmc6Ym9yZGVyLWJveDsgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjIpOyBib3JkZXI6MXB4IHNvbGlkICcrIGNjYy5ib3JkZXIgKyc7JztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMucmFkaXVzICE9PSAwICkgcGFuZWxDc3MgKz0gJ2JvcmRlci1yYWRpdXM6JyArIHRoaXMucmFkaXVzKydweDsnOyBcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdwYXRoJywgdGhpcy5jc3MuYmFzaWMgKyBwYW5lbENzcyAsIHt9ICk7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXS5zZXRBdHRyaWJ1dGUoJ3ZpZXdCb3gnLCAnMCAwICcrdGhpcy5yZXMrJyA1MCcgKTtcclxuICAgICAgICB0aGlzLmNbMl0uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCAnMTAwJScgKTtcclxuICAgICAgICB0aGlzLmNbMl0uc2V0QXR0cmlidXRlKCd3aWR0aCcsICcxMDAlJyApO1xyXG4gICAgICAgIHRoaXMuY1syXS5zZXRBdHRyaWJ1dGUoJ3ByZXNlcnZlQXNwZWN0UmF0aW8nLCAnbm9uZScgKTtcclxuXHJcblxyXG4gICAgICAgIC8vdGhpcy5kb20oICdwYXRoJywgbnVsbCwgeyBmaWxsOidyZ2JhKDI1NSwyNTUsMCwwLjMpJywgJ3N0cm9rZS13aWR0aCc6MSwgc3Ryb2tlOicjRkYwJywgJ3ZlY3Rvci1lZmZlY3QnOidub24tc2NhbGluZy1zdHJva2UnIH0sIHRoaXMuY1syXSApO1xyXG4gICAgICAgIC8vdGhpcy5kb20oICdwYXRoJywgbnVsbCwgeyBmaWxsOidyZ2JhKDAsMjU1LDI1NSwwLjMpJywgJ3N0cm9rZS13aWR0aCc6MSwgc3Ryb2tlOicjMEZGJywgJ3ZlY3Rvci1lZmZlY3QnOidub24tc2NhbGluZy1zdHJva2UnIH0sIHRoaXMuY1syXSApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIGFycm93XHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdwYXRoJywgdGhpcy5jc3MuYmFzaWMgKyAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOjZweDsgaGVpZ2h0OjZweDsgbGVmdDowOyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuc3Zncy5nMSwgZmlsbDpjY2MudGV4dCwgc3Ryb2tlOidub25lJ30pXHJcbiAgICAgICAgLy90aGlzLmNbM10gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6MTBweDsgaGVpZ2h0OjEwcHg7IGxlZnQ6NHB4OyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuc3Zncy5hcnJvdywgZmlsbDp0aGlzLmNvbG9ycy50ZXh0LCBzdHJva2U6J25vbmUnfSk7XHJcblxyXG4gICAgICAgIC8vIHJlc3VsdCB0ZXN0XHJcbiAgICAgICAgdGhpcy5jWzRdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAncG9zaXRpb246YWJzb2x1dGU7IGxlZnQ6MTBweDsgdG9wOicrKHRoaXMuaCsyKSArJ3B4OyBkaXNwbGF5Om5vbmU7IHdpZHRoOjEwMCU7IHRleHQtYWxpZ246Y2VudGVyOycgKTtcclxuXHJcbiAgICAgICAgLy8gYm90dG9tIGxpbmVcclxuICAgICAgICBpZiggby5ib3R0b21MaW5lICkgdGhpcy5jWzRdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICd3aWR0aDoxMDAlOyBib3R0b206MHB4OyBoZWlnaHQ6MXB4OyBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7Jyk7XHJcblxyXG4gICAgICAgIHRoaXMuaXNTaG93ID0gZmFsc2U7XHJcblxyXG5cclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIC8vc1sxXS5tYXJnaW5MZWZ0ID0gJzEwcHgnO1xyXG4gICAgICAgIHNbMV0ubGluZUhlaWdodCA9IHRoaXMuaC00O1xyXG4gICAgICAgIHNbMV0uY29sb3IgPSBjY2MudGV4dDtcclxuICAgICAgICAvL3NbMV0ucGFkZGluZ0xlZnQgPSAnMThweCc7XHJcbiAgICAgICAgLy9zWzFdLmZvbnRXZWlnaHQgPSAnYm9sZCc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnJhZGl1cyAhPT0gMCApICBzWzBdLmJvcmRlclJhZGl1cyA9IHRoaXMucmFkaXVzKydweCc7XHJcbiAgICAgICAgaWYoIHRoaXMuY29sb3JzLmdib3JkZXIhPT0nbm9uZScpIHNbMF0uYm9yZGVyID0gJzFweCBzb2xpZCAnICsgY2NjLmdib3JkZXI7XHJcblxyXG5cclxuXHJcblxyXG4gICAgICAgIGxldCBqID0gMDtcclxuXHJcbiAgICAgICAgZm9yKCBqPTA7IGo8dGhpcy5uYW1lcy5sZW5ndGg7IGorKyApe1xyXG5cclxuICAgICAgICAgICAgbGV0IGJhc2UgPSBbXTtcclxuICAgICAgICAgICAgbGV0IGkgPSB0aGlzLnJlcysxO1xyXG4gICAgICAgICAgICB3aGlsZSggaS0tICkgYmFzZS5wdXNoKDUwKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmFuZ2Vbal0gPSAoIDEgLyB0aGlzLnJhbmdlW2pdICkgKiA0OTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRzLnB1c2goIGJhc2UgKTtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZXMucHVzaCgwKTtcclxuICAgICAgICAgICAvLyAgdGhpcy5kb20oICdwYXRoJywgbnVsbCwgeyBmaWxsOidyZ2JhKCcrY2Nbal0rJywwLjUpJywgJ3N0cm9rZS13aWR0aCc6MSwgc3Ryb2tlOidyZ2JhKCcrY2Nbal0rJywxKScsICd2ZWN0b3ItZWZmZWN0Jzonbm9uLXNjYWxpbmctc3Ryb2tlJyB9LCB0aGlzLmNbMl0gKTtcclxuICAgICAgICAgICAgdGhpcy50ZXh0RGlzcGxheS5wdXNoKCBcIjxzcGFuIHN0eWxlPSdjb2xvcjpyZ2IoXCIrY2Nbal0rXCIpJz4gXCIgKyB0aGlzLm5hbWVzW2pdICtcIiBcIik7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaiA9IHRoaXMubmFtZXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGotLSl7XHJcbiAgICAgICAgICAgIHRoaXMuZG9tKCAncGF0aCcsIG51bGwsIHsgZmlsbDoncmdiYSgnK2NjW2pdKycsJyt0aGlzLmFscGhhKycpJywgJ3N0cm9rZS13aWR0aCc6MSwgc3Ryb2tlOidyZ2JhKCcrY2Nbal0rJywxKScsICd2ZWN0b3ItZWZmZWN0Jzonbm9uLXNjYWxpbmctc3Ryb2tlJyB9LCB0aGlzLmNbMl0gKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICAgICAgLy9pZiggdGhpcy5pc1Nob3cgKSB0aGlzLnNob3coKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1Nob3cgKSB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgZWxzZSB0aGlzLm9wZW4oKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8qbW9kZTogZnVuY3Rpb24gKCBtb2RlICkge1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuXHJcbiAgICAgICAgc3dpdGNoKG1vZGUpe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIHNbMV0uY29sb3IgPSB0aGlzLmNvbG9ycy50ZXh0O1xyXG4gICAgICAgICAgICAgICAgLy9zWzFdLmJhY2tncm91bmQgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIHNbMV0uY29sb3IgPSAnI0ZGRic7XHJcbiAgICAgICAgICAgICAgICAvL3NbMV0uYmFja2dyb3VuZCA9IFVJTC5TRUxFQ1Q7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IC8vIGVkaXQgLyBkb3duXHJcbiAgICAgICAgICAgICAgICBzWzFdLmNvbG9yID0gdGhpcy5jb2xvcnMudGV4dDtcclxuICAgICAgICAgICAgICAgIC8vc1sxXS5iYWNrZ3JvdW5kID0gVUlMLlNFTEVDVERPV047XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9LCovXHJcblxyXG4gICAgdGljayAoIHYgKSB7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWVzID0gdjtcclxuICAgICAgICBpZiggIXRoaXMuaXNTaG93ICkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuZHJhd0dyYXBoKCk7XHJcbiAgICAgICAgdGhpcy51cFRleHQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbWFrZVBhdGggKCBwb2ludCApIHtcclxuXHJcbiAgICAgICAgbGV0IHAgPSAnJztcclxuICAgICAgICBwICs9ICdNICcgKyAoLTEpICsgJyAnICsgNTA7XHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5yZXMgKyAxOyBpICsrICkgeyBwICs9ICcgTCAnICsgaSArICcgJyArIHBvaW50W2ldOyB9XHJcbiAgICAgICAgcCArPSAnIEwgJyArICh0aGlzLnJlcyArIDEpICsgJyAnICsgNTA7XHJcbiAgICAgICAgcmV0dXJuIHA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwVGV4dCAoIHZhbCApIHtcclxuXHJcbiAgICAgICAgbGV0IHYgPSB2YWwgfHwgdGhpcy52YWx1ZXMsIHQgPSAnJztcclxuICAgICAgICBmb3IoIGxldCBqPTAsIGxuZyA9dGhpcy5uYW1lcy5sZW5ndGg7IGo8bG5nOyBqKysgKSB0ICs9IHRoaXMudGV4dERpc3BsYXlbal0gKyAodltqXSkudG9GaXhlZCh0aGlzLnByZWNpc2lvbikgKyAnPC9zcGFuPic7XHJcbiAgICAgICAgdGhpcy5jWzRdLmlubmVySFRNTCA9IHQ7XHJcbiAgICBcclxuICAgIH1cclxuXHJcbiAgICBkcmF3R3JhcGggKCkge1xyXG5cclxuICAgICAgICBsZXQgc3ZnID0gdGhpcy5jWzJdO1xyXG4gICAgICAgIGxldCBpID0gdGhpcy5uYW1lcy5sZW5ndGgsIHYsIG9sZCA9IDAsIG4gPSAwO1xyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmFkZGluZyApIHYgPSAodGhpcy52YWx1ZXNbbl0rb2xkKSAqIHRoaXMucmFuZ2Vbbl07XHJcbiAgICAgICAgICAgIGVsc2UgIHYgPSAodGhpcy52YWx1ZXNbbl0gKiB0aGlzLnJhbmdlW25dKTtcclxuICAgICAgICAgICAgdGhpcy5wb2ludHNbbl0uc2hpZnQoKTtcclxuICAgICAgICAgICAgdGhpcy5wb2ludHNbbl0ucHVzaCggNTAgLSB2ICk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCBzdmcsICdkJywgdGhpcy5tYWtlUGF0aCggdGhpcy5wb2ludHNbbl0gKSwgaSsxICk7XHJcbiAgICAgICAgICAgIG9sZCArPSB0aGlzLnZhbHVlc1tuXTtcclxuICAgICAgICAgICAgbisrO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG9wZW4gKCkge1xyXG5cclxuICAgICAgICBzdXBlci5vcGVuKClcclxuXHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5ocGx1cyArIHRoaXMuYmFzZUg7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgdGhpcy5zdmdzLmcyICk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmdyb3VwICE9PSBudWxsICl7IHRoaXMuZ3JvdXAuY2FsYyggdGhpcy5ocGx1cyApO31cclxuICAgICAgICBlbHNlIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggdGhpcy5ocGx1cyApO1xyXG5cclxuICAgICAgICB0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS5kaXNwbGF5ID0gJ2Jsb2NrJzsgXHJcbiAgICAgICAgdGhpcy5zWzRdLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICAgIHRoaXMuaXNTaG93ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmN1c3RvbSApIFJvb3RzLmFkZExpc3RlbiggdGhpcyApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBjbG9zZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLmNsb3NlKClcclxuXHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5iYXNlSDtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2QnLCB0aGlzLnN2Z3MuZzEgKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuZ3JvdXAgIT09IG51bGwgKXsgdGhpcy5ncm91cC5jYWxjKCAtdGhpcy5ocGx1cyApO31cclxuICAgICAgICBlbHNlIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggLXRoaXMuaHBsdXMgKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuc1s0XS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuaXNTaG93ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5jdXN0b20gKSBSb290cy5yZW1vdmVMaXN0ZW4oIHRoaXMgKTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzRdLmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLy8vLyBBVVRPIEZQUyAvLy8vLy9cclxuXHJcbiAgICBiZWdpbiAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5ub3coKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBlbmQgKCkge1xyXG5cclxuICAgICAgICBsZXQgdGltZSA9IHRoaXMubm93KCk7XHJcbiAgICAgICAgdGhpcy5tcyA9IHRpbWUgLSB0aGlzLnN0YXJ0VGltZTtcclxuXHJcbiAgICAgICAgdGhpcy5mcmFtZXMgKys7XHJcblxyXG4gICAgICAgIGlmICggdGltZSA+IHRoaXMucHJldlRpbWUgKyAxMDAwICkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5mcHMgPSB0aGlzLnJvdW5kKCAoIHRoaXMuZnJhbWVzICogMTAwMCApIC8gKCB0aW1lIC0gdGhpcy5wcmV2VGltZSApICk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnByZXZUaW1lID0gdGltZTtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZXMgPSAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKCB0aGlzLmlzTWVtICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBoZWFwU2l6ZSA9IHBlcmZvcm1hbmNlLm1lbW9yeS51c2VkSlNIZWFwU2l6ZTtcclxuICAgICAgICAgICAgICAgIGxldCBoZWFwU2l6ZUxpbWl0ID0gcGVyZm9ybWFuY2UubWVtb3J5LmpzSGVhcFNpemVMaW1pdDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbSA9IHRoaXMucm91bmQoIGhlYXBTaXplICogMC4wMDAwMDA5NTQgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubW0gPSBoZWFwU2l6ZSAvIGhlYXBTaXplTGltaXQ7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBbIHRoaXMuZnBzLCB0aGlzLm1zICwgdGhpcy5tbSBdO1xyXG5cclxuICAgICAgICB0aGlzLmRyYXdHcmFwaCgpO1xyXG4gICAgICAgIHRoaXMudXBUZXh0KCBbIHRoaXMuZnBzLCB0aGlzLm1zLCB0aGlzLm1lbSBdICk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aW1lO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBsaXN0ZW5pbmcgKCkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuY3VzdG9tICkgdGhpcy5zdGFydFRpbWUgPSB0aGlzLmVuZCgpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgbGV0IHcgPSB0aGlzLnc7XHJcblxyXG4gICAgICAgIHNbM10ubGVmdCA9ICggdGhpcy5zYSArIHRoaXMuc2IgLSA2ICkgKyAncHgnXHJcblxyXG4gICAgICAgIHNbMF0ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgICAgICBzWzFdLndpZHRoID0gdyArICdweCc7XHJcbiAgICAgICAgc1syXS5sZWZ0ID0gMTAgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ud2lkdGggPSAody0yMCkgKyAncHgnO1xyXG4gICAgICAgIHNbNF0ud2lkdGggPSAody0yMCkgKyAncHgnO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8uanMnO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gJy4uL2NvcmUvVjIuanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEdyYXBoIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgXHR0aGlzLnZhbHVlID0gby52YWx1ZSAhPT0gdW5kZWZpbmVkID8gby52YWx1ZSA6IFswLDAsMF07XHJcbiAgICAgICAgdGhpcy5sbmcgPSB0aGlzLnZhbHVlLmxlbmd0aDtcclxuXHJcbiAgICAgICAgdGhpcy5wcmVjaXNpb24gPSBvLnByZWNpc2lvbiAhPT0gdW5kZWZpbmVkID8gby5wcmVjaXNpb24gOiAyO1xyXG4gICAgICAgIHRoaXMubXVsdGlwbGljYXRvciA9IG8ubXVsdGlwbGljYXRvciB8fCAxO1xyXG4gICAgICAgIHRoaXMubmVnID0gby5uZWcgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMubGluZSA9IG8ubGluZSAhPT0gdW5kZWZpbmVkID8gIG8ubGluZSA6IHRydWU7XHJcblxyXG4gICAgICAgIC8vaWYodGhpcy5uZWcpdGhpcy5tdWx0aXBsaWNhdG9yKj0yO1xyXG5cclxuICAgICAgICB0aGlzLmF1dG9XaWR0aCA9IG8uYXV0b1dpZHRoICE9PSB1bmRlZmluZWQgPyBvLmF1dG9XaWR0aCA6IHRydWU7XHJcbiAgICAgICAgdGhpcy5pc051bWJlciA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmggPSBvLmggfHwgMTI4ICsgMTA7XHJcbiAgICAgICAgdGhpcy5yaCA9IHRoaXMuaCAtIDEwO1xyXG4gICAgICAgIHRoaXMudG9wID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5jWzBdLnN0eWxlLndpZHRoID0gdGhpcy53ICsncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jWzFdICE9PSB1bmRlZmluZWQgKSB7IC8vIHdpdGggdGl0bGVcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuXHJcbiAgICAgICAgICAgIGlmKCF0aGlzLmF1dG9XaWR0aCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUud2lkdGggPSAnMTAwJSc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUuanVzdGlmeUNvbnRlbnQgPSAnY2VudGVyJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy90aGlzLmNbMV0uc3R5bGUuYmFja2dyb3VuZCA9ICcjZmYwMDAwJztcclxuICAgICAgICAgICAgLy90aGlzLmNbMV0uc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gMTA7XHJcbiAgICAgICAgICAgIHRoaXMuaCArPSAxMDtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmdoID0gdGhpcy5yaCAtIDI4O1xyXG4gICAgICAgIHRoaXMuZ3cgPSB0aGlzLncgLSAyODtcclxuXHJcbiAgICAgICAgLy90aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICdqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOyB0ZXh0LWFsaWduOiBqdXN0aWZ5OyBjb2x1bW4tY291bnQ6Jyt0aGlzLmxuZysnOyB0b3A6JysodGhpcy5oLTIwKSsncHg7IHdpZHRoOjEwMCU7IGNvbG9yOicrIHRoaXMuY29sb3JzLnRleHQgKTtcclxuXHJcbiAgICAgICAgLy9sZXQgY29sdW0gPSAnY29sdW1uLWNvdW50OicrdGhpcy5sbmcrJzsgY29sdW1uOicrdGhpcy5sbmcrJzsgYnJlYWstaW5zaWRlOiBjb2x1bW47IHRvcDonXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAnZGlzcGxheTpibG9jazsgdGV4dC1hbGlnbjpjZW50ZXI7IHBhZGRpbmc6MHB4IDBweDsgdG9wOicrKHRoaXMuaC0yMCkrJ3B4OyBsZWZ0OjE0cHg7IHdpZHRoOicrdGhpcy5ndysncHg7ICBjb2xvcjonKyB0aGlzLmNvbG9ycy50ZXh0ICk7XHJcbiAgICAgICBcclxuICAgICAgICAvL3RoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgdGhpcy5jWzJdLmlubmVySFRNTCA9IHRoaXMudmFsdWVUb0h0bWwoKTtcclxuXHJcbiAgICAgICAgbGV0IHN2ZyA9IHRoaXMuZG9tKCAnc3ZnJywgdGhpcy5jc3MuYmFzaWMgLCB7IHZpZXdCb3g6JzAgMCAnK3RoaXMudysnICcrdGhpcy5yaCwgd2lkdGg6dGhpcy53LCBoZWlnaHQ6dGhpcy5yaCwgcHJlc2VydmVBc3BlY3RSYXRpbzonbm9uZScgfSApO1xyXG4gICAgICAgIHRoaXMuc2V0Q3NzKCBzdmcsIHsgd2lkdGg6dGhpcy53LCBoZWlnaHQ6dGhpcy5yaCwgbGVmdDowLCB0b3A6dGhpcy50b3AgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZG9tKCAncGF0aCcsICcnLCB7IGQ6JycsIHN0cm9rZTp0aGlzLmNvbG9ycy50ZXh0LCAnc3Ryb2tlLXdpZHRoJzoyLCBmaWxsOidub25lJywgJ3N0cm9rZS1saW5lY2FwJzonYnV0dCcgfSwgc3ZnICk7XHJcbiAgICAgICAgdGhpcy5kb20oICdyZWN0JywgJycsIHsgeDoxMCwgeToxMCwgd2lkdGg6dGhpcy5ndys4LCBoZWlnaHQ6dGhpcy5naCs4LCBzdHJva2U6J3JnYmEoMCwwLDAsMC4zKScsICdzdHJva2Utd2lkdGgnOjEgLCBmaWxsOidub25lJ30sIHN2ZyApO1xyXG5cclxuICAgICAgICB0aGlzLml3ID0gKCh0aGlzLmd3LSg0Kih0aGlzLmxuZy0xKSkpL3RoaXMubG5nKTtcclxuICAgICAgICBsZXQgdCA9IFtdO1xyXG4gICAgICAgIHRoaXMuY01vZGUgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy52ID0gW107XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgICAgICBcdHRbaV0gPSBbIDE0ICsgKGkqdGhpcy5pdykgKyAoaSo0KSwgdGhpcy5pdyBdO1xyXG4gICAgICAgIFx0dFtpXVsyXSA9IHRbaV1bMF0gKyB0W2ldWzFdO1xyXG4gICAgICAgIFx0dGhpcy5jTW9kZVtpXSA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZiggdGhpcy5uZWcgKSB0aGlzLnZbaV0gPSAoKDErKHRoaXMudmFsdWVbaV0gLyB0aGlzLm11bHRpcGxpY2F0b3IpKSowLjUpO1xyXG4gICAgICAgIFx0ZWxzZSB0aGlzLnZbaV0gPSB0aGlzLnZhbHVlW2ldIC8gdGhpcy5tdWx0aXBsaWNhdG9yO1xyXG5cclxuICAgICAgICBcdHRoaXMuZG9tKCAncmVjdCcsICcnLCB7IHg6dFtpXVswXSwgeToxNCwgd2lkdGg6dFtpXVsxXSwgaGVpZ2h0OjEsIGZpbGw6dGhpcy5jb2xvcnMudGV4dCwgJ2ZpbGwtb3BhY2l0eSc6MC4zIH0sIHN2ZyApO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudG1wID0gdDtcclxuICAgICAgICB0aGlzLmNbM10gPSBzdmc7XHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy53KVxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkICl7XHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS5zdHlsZS50b3AgPSAwICsncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUuaGVpZ2h0ID0gMjAgKydweCc7XHJcbiAgICAgICAgICAgIHRoaXMuc1sxXS5saW5lSGVpZ2h0ID0gKDIwLTUpKydweCdcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlKCBmYWxzZSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRWYWx1ZSAoIHZhbHVlICkge1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5sbmcgPSB0aGlzLnZhbHVlLmxlbmd0aDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubG5nOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubmVnKSB0aGlzLnZbaV0gPSAoMSArIHZhbHVlW2ldIC8gdGhpcy5tdWx0aXBsaWNhdG9yKSAqIDAuNTtcclxuICAgICAgICAgICAgZWxzZSB0aGlzLnZbaV0gPSB2YWx1ZVtpXSAvIHRoaXMubXVsdGlwbGljYXRvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdmFsdWVUb0h0bWwoKSB7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmcsIG49MCwgciA9ICc8dGFibGUgc3R5bGU9XCJ3aWR0aDoxMDAlO1wiPjx0cj4nXHJcbiAgICAgICAgbGV0IHcgPSAxMDAgLyB0aGlzLmxuZ1xyXG4gICAgICAgIGxldCBzdHlsZSA9ICd3aWR0aDonKyB3ICsnJTsnLy8nIHRleHQtYWxpZ246Y2VudGVyOydcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICBpZihuPT09dGhpcy5sbmctMSkgciArPSAnPHRkIHN0eWxlPScrc3R5bGUrJz4nICsgdGhpcy52YWx1ZVtuXSArICc8L3RkPjwvdHI+PC90YWJsZT4nXHJcbiAgICAgICAgICAgIGVsc2UgciArPSAnPHRkIHN0eWxlPScrc3R5bGUrJz4nICsgdGhpcy52YWx1ZVtuXSArICc8L3RkPidcclxuICAgICAgICAgICAgbisrXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlU1ZHICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMubGluZSApIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgdGhpcy5tYWtlUGF0aCgpLCAwICk7XHJcblxyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGk8dGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2hlaWdodCcsIHRoaXMudltpXSp0aGlzLmdoLCBpKzIgKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3knLCAxNCArICh0aGlzLmdoIC0gdGhpcy52W2ldKnRoaXMuZ2gpLCBpKzIgKTtcclxuICAgICAgICAgICAgaWYoIHRoaXMubmVnICkgdGhpcy52YWx1ZVtpXSA9ICggKCh0aGlzLnZbaV0qMiktMSkgKiB0aGlzLm11bHRpcGxpY2F0b3IgKS50b0ZpeGVkKCB0aGlzLnByZWNpc2lvbiApICogMTtcclxuICAgICAgICAgICAgZWxzZSB0aGlzLnZhbHVlW2ldID0gKCAodGhpcy52W2ldICogdGhpcy5tdWx0aXBsaWNhdG9yKSApLnRvRml4ZWQoIHRoaXMucHJlY2lzaW9uICkgKiAxO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuICAgICAgICB0aGlzLmNbMl0uaW5uZXJIVE1MID0gdGhpcy52YWx1ZVRvSHRtbCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXN0Wm9uZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMubG5nO1xyXG4gICAgICAgIGxldCB0ID0gdGhpcy50bXA7XHJcbiAgICAgICAgXHJcblx0ICAgIGlmKCBsLnk+dGhpcy50b3AgJiYgbC55PHRoaXMuaC0yMCApe1xyXG5cdCAgICAgICAgd2hpbGUoIGktLSApe1xyXG5cdCAgICAgICAgICAgIGlmKCBsLng+dFtpXVswXSAmJiBsLng8dFtpXVsyXSApIHJldHVybiBpO1xyXG5cdCAgICAgICAgfVxyXG5cdCAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAnJ1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb2RlICggbiwgbmFtZSApIHtcclxuXHJcbiAgICBcdGlmKCBuID09PSB0aGlzLmNNb2RlW25hbWVdICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIFx0bGV0IGE7XHJcblxyXG4gICAgICAgIHN3aXRjaChuKXtcclxuICAgICAgICAgICAgY2FzZSAwOiBhPTAuMzsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogYT0wLjY7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IGE9MTsgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlc2V0KCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsLW9wYWNpdHknLCBhLCBuYW1lICsgMiApO1xyXG4gICAgICAgIHRoaXMuY01vZGVbbmFtZV0gPSBuO1xyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcblxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICBcdGxldCBudXAgPSBmYWxzZTtcclxuICAgICAgICAvL3RoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgd2hpbGUoaS0tKXsgXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmNNb2RlW2ldICE9PSAwICl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNNb2RlW2ldID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsLW9wYWNpdHknLCAwLjMsIGkgKyAyICk7XHJcbiAgICAgICAgICAgICAgICBudXAgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbnVwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICBpZiggdGhpcy5jdXJyZW50ICE9PSAtMSApIHJldHVybiB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICBcdHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICBcdGxldCBudXAgPSBmYWxzZTtcclxuXHJcbiAgICBcdGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZShlKTtcclxuXHJcbiAgICBcdGlmKCBuYW1lID09PSAnJyApe1xyXG5cclxuICAgICAgICAgICAgbnVwID0gdGhpcy5yZXNldCgpO1xyXG4gICAgICAgICAgICAvL3RoaXMuY3Vyc29yKCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7IFxyXG5cclxuICAgICAgICAgICAgbnVwID0gdGhpcy5tb2RlKCB0aGlzLmlzRG93biA/IDIgOiAxLCBuYW1lICk7XHJcbiAgICAgICAgICAgIC8vdGhpcy5jdXJzb3IoIHRoaXMuY3VycmVudCAhPT0gLTEgPyAnbW92ZScgOiAncG9pbnRlcicgKTtcclxuICAgICAgICAgICAgaWYodGhpcy5pc0Rvd24pe1xyXG4gICAgICAgICAgICBcdHRoaXMudltuYW1lXSA9IHRoaXMuY2xhbXAoIDEgLSAoKCBlLmNsaWVudFkgLSB0aGlzLnpvbmUueSAtIHRoaXMueXRvcCAtIDEwICkgLyB0aGlzLmdoKSAsIDAsIDEgKTtcclxuICAgICAgICAgICAgXHR0aGlzLnVwZGF0ZSggdHJ1ZSApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51cDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHVwZGF0ZSAoIHVwICkge1xyXG5cclxuICAgIFx0dGhpcy51cGRhdGVTVkcoKTtcclxuXHJcbiAgICAgICAgaWYoIHVwICkgdGhpcy5zZW5kKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1ha2VQYXRoICgpIHtcclxuXHJcbiAgICBcdGxldCBwID0gXCJcIiwgaCwgdywgd24sIHdtLCBvdywgb2hcclxuICAgIFx0Ly9sZXQgZyA9IHRoaXMuaXcqMC41XHJcblxyXG4gICAgXHRmb3IobGV0IGkgPSAwOyBpPHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICBcdFx0aCA9IDE0ICsgKHRoaXMuZ2ggLSB0aGlzLnZbaV0qdGhpcy5naClcclxuICAgIFx0XHR3ID0gKDE0ICsgKGkqdGhpcy5pdykgKyAoaSo0KSlcclxuXHJcbiAgICBcdFx0d20gPSB3ICsgdGhpcy5pdyowLjVcclxuICAgIFx0XHR3biA9IHcgKyB0aGlzLml3XHJcblxyXG4gICAgXHRcdGlmKCBpID09PSAwICkgcCs9J00gJyt3KycgJysgaCArICcgVCAnICsgd20gKycgJysgaFxyXG4gICAgXHRcdGVsc2UgcCArPSAnIEMgJyArIG93ICsnICcrIG9oICsgJywnICsgdyArJyAnKyBoICsgJywnICsgd20gKycgJysgaFxyXG4gICAgXHRcdGlmKCBpID09PSB0aGlzLmxuZy0xICkgcCs9JyBUICcgKyB3biArJyAnKyBoXHJcblxyXG4gICAgXHRcdG93ID0gd25cclxuICAgIFx0XHRvaCA9IGggXHJcblxyXG4gICAgXHR9XHJcblxyXG4gICAgXHRyZXR1cm4gcFxyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKCk7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIGlmKCB0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCApIHNbMV0ud2lkdGggPSB0aGlzLncgKyAncHgnXHJcbiAgICAgICAgc1szXS53aWR0aCA9IHRoaXMudyArICdweCdcclxuXHJcbiAgICAgICAgbGV0IGd3ID0gdGhpcy53IC0gMjhcclxuICAgICAgICBsZXQgaXcgPSAoKGd3LSg0Kih0aGlzLmxuZy0xKSkpL3RoaXMubG5nKVxyXG4gICAgICAgIGxldCB0ID0gW11cclxuXHJcbiAgICAgICAgc1syXS53aWR0aCA9IGd3ICsgJ3B4J1xyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIHRbaV0gPSBbIDE0ICsgKGkqaXcpICsgKGkqNCksIGl3IF1cclxuICAgICAgICAgICAgdFtpXVsyXSA9IHRbaV1bMF0gKyB0W2ldWzFdXHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy50bXAgPSB0XHJcblxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90by5qcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgRW1wdHkgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcblx0ICAgIG8uaXNTcGFjZSA9IHRydWVcclxuICAgICAgICBvLm1hcmdpbiA9IDBcclxuICAgICAgICBpZighby5oKSBvLmggPSAxMFxyXG4gICAgICAgIHN1cGVyKCBvIClcclxuICAgICAgICB0aGlzLmluaXQoKVxyXG5cclxuICAgIH1cclxuICAgIFxyXG59XHJcbiIsIlxyXG5pbXBvcnQgeyBSb290cyB9IGZyb20gJy4uL2NvcmUvUm9vdHMuanMnO1xyXG5pbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8uanMnO1xyXG5pbXBvcnQgeyBFbXB0eSB9IGZyb20gJy4vRW1wdHkuanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEdyb3VwIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMuaXNHcm91cCA9IHRydWVcclxuXHJcbiAgICAgICAgdGhpcy5BREQgPSBvLmFkZDtcclxuXHJcbiAgICAgICAgdGhpcy5hdXRvSGVpZ2h0ID0gdHJ1ZVxyXG5cclxuICAgICAgICB0aGlzLnVpcyA9IFtdXHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gLTFcclxuICAgICAgICB0aGlzLnByb3RvID0gbnVsbFxyXG4gICAgICAgIHRoaXMuaXNFbXB0eSA9IHRydWVcclxuXHJcbiAgICAgICAgdGhpcy5kZWNhbCA9IG8uZ3JvdXAgPyA4IDogMFxyXG4gICAgICAgIC8vdGhpcy5kZCA9IG8uZ3JvdXAgPyBvLmdyb3VwLmRlY2FsICsgOCA6IDBcclxuXHJcbiAgICAgICAgdGhpcy5iYXNlSCA9IHRoaXMuaFxyXG5cclxuICAgICAgICB0aGlzLnNwYWNlWSA9IG5ldyBFbXB0eSh7aDp0aGlzLm1hcmdpbn0pO1xyXG5cclxuXHJcblxyXG4gICAgICAgIGxldCBmbHRvcCA9IE1hdGguZmxvb3IodGhpcy5oKjAuNSktM1xyXG5cclxuICAgICAgICBjb25zdCBjYyA9IHRoaXMuY29sb3JzXHJcblxyXG4gICAgICAgIHRoaXMudXNlRmxleCA9IHRydWUgXHJcbiAgICAgICAgbGV0IGZsZXhpYmxlID0gdGhpcy51c2VGbGV4ID8gJ2Rpc3BsYXk6ZmxleDsgZmxleC1mbG93OiByb3cgd3JhcDsnIDogJydcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArIGZsZXhpYmxlICsgJ3dpZHRoOjEwMCU7IGxlZnQ6MDsgIG92ZXJmbG93OmhpZGRlbjsgdG9wOicrKHRoaXMuaCkrJ3B4JylcclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6NnB4OyBoZWlnaHQ6NnB4OyBsZWZ0OjA7IHRvcDonK2ZsdG9wKydweDsnLCB7IGQ6dGhpcy5zdmdzLmcxLCBmaWxsOmNjLnRleHQsIHN0cm9rZTonbm9uZSd9KVxyXG5cclxuICAgICAgICBsZXQgYmggPSB0aGlzLm10b3AgPT09IDAgPyB0aGlzLm1hcmdpbiA6IHRoaXMubXRvcFxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnd2lkdGg6MTAwJTsgbGVmdDowOyBoZWlnaHQ6JysoYmgrMSkrJ3B4OyB0b3A6JysoKHRoaXMuaC0xKSkrJ3B4OyBiYWNrZ3JvdW5kOm5vbmU7JylcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgdGhpcy5jWzFdLm5hbWUgPSAnZ3JvdXAnXHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgICAgICB0aGlzLnNldEJHKCBvLmJnIClcclxuXHJcbiAgICAgICAgaWYoIG8ub3BlbiApIHRoaXMub3BlbigpXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldEJHICggYmcgKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IGNjID0gdGhpcy5jb2xvcnNcclxuICAgICAgICBjb25zdCBzID0gdGhpcy5zXHJcblxyXG4gICAgICAgIGlmKCBiZyAhPT0gdW5kZWZpbmVkICkgY2MuZ3JvdXBzID0gYmdcclxuICAgICAgICBpZihjYy5ncm91cHMgPT09ICdub25lJykgY2MuZ3JvdXBzID0gY2MuYmFja2dyb3VuZFxyXG4gICAgICAgICAgICBjYy5iYWNrZ3JvdW5kID0gJ25vbmUnXHJcblxyXG4gICAgICAgIHNbMF0uYmFja2dyb3VuZCA9ICdub25lJztcclxuICAgICAgICBzWzFdLmJhY2tncm91bmQgPSBjYy5ncm91cHNcclxuICAgICAgICBzWzJdLmJhY2tncm91bmQgPSBjYy5ncm91cHNcclxuXHJcbiAgICAgICAgaWYoIGNjLmdib3JkZXIgIT09ICdub25lJyApe1xyXG4gICAgICAgICAgICBzWzFdLmJvcmRlciA9IGNjLmJvcmRlclNpemUrJ3B4IHNvbGlkICcrIGNjLmdib3JkZXJcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnJhZGl1cyAhPT0gMCApe1xyXG5cclxuICAgICAgICAgICAgc1sxXS5ib3JkZXJSYWRpdXMgPSB0aGlzLnJhZGl1cysncHgnXHJcbiAgICAgICAgICAgIHNbMl0uYm9yZGVyUmFkaXVzID0gdGhpcy5yYWRpdXMrJ3B4J1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qbGV0IGkgPSB0aGlzLnVpcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgdGhpcy51aXNbaV0uc2V0QkcoICdub25lJyApO1xyXG4gICAgICAgICAgICAvL3RoaXMudWlzW2ldLnNldEJHKCB0aGlzLmNvbG9ycy5iYWNrZ3JvdW5kICk7XHJcbiAgICAgICAgfSovXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gJyc7XHJcblxyXG4gICAgICAgIGlmKCBsLnkgPCB0aGlzLmJhc2VIICsgdGhpcy5tYXJnaW4gKSBuYW1lID0gJ3RpdGxlJztcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNPcGVuICkgbmFtZSA9ICdjb250ZW50JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2cobmFtZSlcclxuXHJcbiAgICAgICAgcmV0dXJuIG5hbWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyVGFyZ2V0ICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY3VycmVudCA9PT0gLTEgKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgaWYoIHRoaXMucHJvdG8ucyApe1xyXG4gICAgICAgICAgICAvLyBpZiBubyBzIHRhcmdldCBpcyBkZWxldGUgISFcclxuICAgICAgICAgICAgdGhpcy5wcm90by51aW91dCgpO1xyXG4gICAgICAgICAgICB0aGlzLnByb3RvLnJlc2V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucHJvdG8gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IC0xO1xyXG4gICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jbGVhclRhcmdldCgpXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgaGFuZGxlRXZlbnQgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgdHlwZSA9IGUudHlwZTtcclxuXHJcbiAgICAgICAgbGV0IGNoYW5nZSA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBwcm90b0NoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBzd2l0Y2goIG5hbWUgKXtcclxuXHJcbiAgICAgICAgICAgIGNhc2UgJ2NvbnRlbnQnOlxyXG5cclxuICAgICAgICAgICAgLy90aGlzLmN1cnNvcigpXHJcblxyXG4gICAgICAgICAgICAvL2lmKCB0aGlzLm1hcmdpbkRpdiApIGUuY2xpZW50WSAtPSB0aGlzLm1hcmdpbiAqIDAuNVxyXG5cclxuICAgICAgICAgICAgaWYoIFJvb3RzLmlzTW9iaWxlICYmIHR5cGUgPT09ICdtb3VzZWRvd24nICkgdGhpcy5nZXROZXh0KCBlLCBjaGFuZ2UgKVxyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMucHJvdG8gKXsgXHJcbiAgICAgICAgICAgICAgICAvL2UuY2xpZW50WSAtPSB0aGlzLm1hcmdpblxyXG4gICAgICAgICAgICAgICAgcHJvdG9DaGFuZ2UgPSB0aGlzLnByb3RvLmhhbmRsZUV2ZW50KCBlIClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYoICFSb290cy5sb2NrICkgdGhpcy5nZXROZXh0KCBlLCBjaGFuZ2UgKVxyXG5cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3RpdGxlJzpcclxuICAgICAgICAgICAgLy90aGlzLmN1cnNvciggdGhpcy5pc09wZW4gPyAnbi1yZXNpemUnOidzLXJlc2l6ZScgKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKVxyXG4gICAgICAgICAgICBpZiggdHlwZSA9PT0gJ21vdXNlZG93bicgKXtcclxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmlzT3BlbiApIHRoaXMuY2xvc2UoKVxyXG4gICAgICAgICAgICAgICAgZWxzZSB0aGlzLm9wZW4oKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gKSBjaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgIGlmKCBwcm90b0NoYW5nZSApIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiBjaGFuZ2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGdldE5leHQgKCBlLCBjaGFuZ2UgKSB7XHJcblxyXG4gICAgICAgIGxldCBuZXh0ID0gUm9vdHMuZmluZFRhcmdldCggdGhpcy51aXMsIGUgKTtcclxuXHJcbiAgICAgICAgaWYoIG5leHQgIT09IHRoaXMuY3VycmVudCApe1xyXG4gICAgICAgICAgICB0aGlzLmNsZWFyVGFyZ2V0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IG5leHQ7XHJcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggbmV4dCAhPT0gLTEgKXsgXHJcbiAgICAgICAgICAgIHRoaXMucHJvdG8gID0gdGhpcy51aXNbIHRoaXMuY3VycmVudCBdO1xyXG4gICAgICAgICAgICB0aGlzLnByb3RvLnVpb3ZlcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIFxyXG5cclxuICAgIGFkZCgpIHtcclxuXHJcbiAgICAgICAgbGV0IGEgPSBhcmd1bWVudHM7XHJcblxyXG4gICAgICAgIGlmKCB0eXBlb2YgYVsxXSA9PT0gJ29iamVjdCcgKXsgXHJcbiAgICAgICAgICAgIGFbMV0uaXNVSSA9IHRoaXMuaXNVSVxyXG4gICAgICAgICAgICBhWzFdLnRhcmdldCA9IHRoaXMuY1syXVxyXG4gICAgICAgICAgICBhWzFdLm1haW4gPSB0aGlzLm1haW5cclxuICAgICAgICAgICAgYVsxXS5ncm91cCA9IHRoaXNcclxuICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdzdHJpbmcnICl7XHJcbiAgICAgICAgICAgIGlmKCBhWzJdID09PSB1bmRlZmluZWQgKSBbXS5wdXNoLmNhbGwoIGEsIHsgaXNVSTp0cnVlLCB0YXJnZXQ6dGhpcy5jWzJdLCBtYWluOnRoaXMubWFpbiB9KTtcclxuICAgICAgICAgICAgZWxzZXsgXHJcbiAgICAgICAgICAgICAgICBhWzJdLmlzVUkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYVsyXS50YXJnZXQgPSB0aGlzLmNbMl07XHJcbiAgICAgICAgICAgICAgICBhWzJdLm1haW4gPSB0aGlzLm1haW47XHJcbiAgICAgICAgICAgICAgICBhWzJdLmdyb3VwID0gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHUgPSB0aGlzLkFERC5hcHBseSggdGhpcywgYSApXHJcblxyXG4gICAgICAgIGlmKCB1LmlzR3JvdXAgKXsgXHJcbiAgICAgICAgICAgIC8vby5hZGQgPSBhZGQ7XHJcbiAgICAgICAgICAgIHUuZHggPSA4XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vdS5keCArPSA0XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLmRlY2FsKVxyXG4gICAgICAgIC8vdS56b25lLmQgLT0gOFxyXG4gICAgICAgIFJvb3RzLmZvcmNlWm9uZSA9IHRydWVcclxuICAgICAgICAvL3UubWFyZ2luICs9IHRoaXMubWFyZ2luXHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2coIHUubWFyZ2luIClcclxuICAgICAgICAvL1Jvb3RzLm5lZWRSZVpvbmUgPSB0cnVlXHJcblxyXG4gICAgICAgIC8vUm9vdHMucmVzaXplKClcclxuICAgICAgICAgLy9jb25zb2xlLmxvZyhSb290cy5uZWVkUmVzaXplKVxyXG5cclxuICAgICAgICB0aGlzLnVpcy5wdXNoKCB1IClcclxuXHJcbiAgICAgICAgdGhpcy5pc0VtcHR5ID0gZmFsc2VcclxuXHJcbiAgICAgICAgcmV0dXJuIHU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlbW92ZSBvbmUgbm9kZVxyXG5cclxuICAgIHJlbW92ZSAoIG4gKSB7XHJcblxyXG4gICAgICAgIGlmKCBuLmRpc3Bvc2UgKSBuLmRpc3Bvc2UoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2xlYXIgYWxsIGluZXIgXHJcblxyXG4gICAgZGlzcG9zZSgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jbGVhcigpXHJcbiAgICAgICAgaWYoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5jYWxjKClcclxuICAgICAgICBzdXBlci5kaXNwb3NlKClcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXIoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuZW1wdHkoKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBlbXB0eSAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2xvc2UoKTtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLnVpcy5sZW5ndGgsIGl0ZW07XHJcblxyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuICAgICAgICAgICAgaXRlbSA9IHRoaXMudWlzLnBvcCgpXHJcbiAgICAgICAgICAgIHRoaXMuY1syXS5yZW1vdmVDaGlsZCggaXRlbS5jWzBdIClcclxuICAgICAgICAgICAgaXRlbS5jbGVhciggdHJ1ZSApXHJcblxyXG4gICAgICAgICAgICAvL3RoaXMudWlzW2ldLmNsZWFyKClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaXNFbXB0eSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5iYXNlSDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2xlYXIgb25lIGVsZW1lbnRcclxuXHJcbiAgICBjbGVhck9uZSAoIG4gKSB7IFxyXG5cclxuICAgICAgICBsZXQgaWQgPSB0aGlzLnVpcy5pbmRleE9mKCBuICk7XHJcblxyXG4gICAgICAgIGlmICggaWQgIT09IC0xICkge1xyXG4gICAgICAgICAgICB0aGlzLmNhbGMoIC0gKCB0aGlzLnVpc1sgaWQgXS5oICsgdGhpcy5tYXJnaW4gKSApXHJcbiAgICAgICAgICAgIHRoaXMuY1syXS5yZW1vdmVDaGlsZCggdGhpcy51aXNbIGlkIF0uY1swXSApXHJcbiAgICAgICAgICAgIHRoaXMudWlzLnNwbGljZSggaWQsIDEgKVxyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMudWlzLmxlbmd0aCA9PT0gMCApeyBcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNFbXB0eSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIFxyXG5cclxuICAgIG9wZW4gKCkge1xyXG5cclxuICAgICAgICBzdXBlci5vcGVuKClcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2QnLCB0aGlzLnN2Z3MuZzIgKVxyXG4gICAgICAgIHRoaXMuclNpemVDb250ZW50KClcclxuXHJcbiAgICAgICAgLy9sZXQgdCA9IHRoaXMuaCAtIHRoaXMuYmFzZUhcclxuXHJcbiAgICAgICAgY29uc3QgcyA9IHRoaXMuc1xyXG4gICAgICAgIGNvbnN0IGNjID0gdGhpcy5jb2xvcnNcclxuXHJcbiAgICAgICAgLy9zWzJdLnRvcCA9ICh0aGlzLmgtMSkgKyAncHgnXHJcbiAgICAgICAgc1syXS50b3AgPSAodGhpcy5oK3RoaXMubXRvcCkgKyAncHgnXHJcbiAgICAgICAgc1s0XS5iYWNrZ3JvdW5kID0gY2MuZ3JvdXBzLy8nIzBmMCdcclxuXHJcbiAgICAgICAgaWYodGhpcy5yYWRpdXMpe1xyXG5cclxuICAgICAgICAgICAgc1sxXS5ib3JkZXJSYWRpdXMgPSAnMHB4J1xyXG4gICAgICAgICAgICBzWzJdLmJvcmRlclJhZGl1cyA9ICcwcHgnXHJcblxyXG4gICAgICAgICAgICBzWzFdLmJvcmRlclRvcExlZnRSYWRpdXMgPSB0aGlzLnJhZGl1cysncHgnXHJcbiAgICAgICAgICAgIHNbMV0uYm9yZGVyVG9wUmlnaHRSYWRpdXMgPSB0aGlzLnJhZGl1cysncHgnXHJcbiAgICAgICAgICAgIHNbMl0uYm9yZGVyQm90dG9tTGVmdFJhZGl1cyA9IHRoaXMucmFkaXVzKydweCdcclxuICAgICAgICAgICAgc1syXS5ib3JkZXJCb3R0b21SaWdodFJhZGl1cyA9IHRoaXMucmFkaXVzKydweCdcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBjYy5nYm9yZGVyICE9PSAnbm9uZScgKXtcclxuXHJcbiAgICAgICAgICAgIHNbNF0uYm9yZGVyTGVmdCA9IGNjLmJvcmRlclNpemUrJ3B4IHNvbGlkICcrIGNjLmdib3JkZXJcclxuICAgICAgICAgICAgc1s0XS5ib3JkZXJSaWdodCA9IGNjLmJvcmRlclNpemUrJ3B4IHNvbGlkICcrIGNjLmdib3JkZXJcclxuXHJcbiAgICAgICAgICAgIHNbMl0uYm9yZGVyID0gY2MuYm9yZGVyU2l6ZSsncHggc29saWQgJysgY2MuZ2JvcmRlclxyXG4gICAgICAgICAgICBzWzJdLmJvcmRlclRvcCA9ICdub25lJztcclxuICAgICAgICAgICAgc1sxXS5ib3JkZXJCb3R0b20gPSBjYy5ib3JkZXJTaXplKydweCBzb2xpZCByZ2JhKDAsMCwwLDApJ1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5wYXJlbnRIZWlnaHQoKVxyXG5cclxuICAgICAgICAvL1Jvb3RzLmlzTGVhdmUgPSB0cnVlXHJcbiAgICAgICAgLy9Sb290cy5uZWVkUmVzaXplID0gdHJ1ZVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBjbG9zZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLmNsb3NlKClcclxuXHJcbiAgICAgICAgLy9sZXQgdCA9IHRoaXMuaCAtIHRoaXMuYmFzZUhcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2QnLCB0aGlzLnN2Z3MuZzEgKVxyXG5cclxuICAgICAgICB0aGlzLmggPSB0aGlzLmJhc2VIXHJcblxyXG4gICAgICAgIGNvbnN0IHMgPSB0aGlzLnNcclxuICAgICAgICBjb25zdCBjYyA9IHRoaXMuY29sb3JzXHJcbiAgICAgICAgXHJcbiAgICAgICAgc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnXHJcbiAgICAgICAgLy9zWzFdLmhlaWdodCA9ICh0aGlzLmgtMikgKyAncHgnXHJcbiAgICAgICAgLy9zWzJdLnRvcCA9IHRoaXMuaCArICdweCdcclxuICAgICAgICBzWzJdLnRvcCA9ICh0aGlzLmgrdGhpcy5tdG9wKSArICdweCdcclxuICAgICAgICBzWzRdLmJhY2tncm91bmQgPSAnbm9uZSdcclxuXHJcbiAgICAgICAgaWYoIGNjLmdib3JkZXIgIT09ICdub25lJyApe1xyXG5cclxuICAgICAgICAgICAgc1s0XS5ib3JkZXIgPSAnbm9uZSdcclxuICAgICAgICAgICAgc1syXS5ib3JkZXIgPSAnbm9uZSdcclxuICAgICAgICAgICAgc1sxXS5ib3JkZXIgPSBjYy5ib3JkZXJTaXplKydweCBzb2xpZCAnKyBjYy5nYm9yZGVyXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLnJhZGl1cykgc1sxXS5ib3JkZXJSYWRpdXMgPSB0aGlzLnJhZGl1cysncHgnXHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50SGVpZ2h0KClcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2FsY1VpcyAoKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc09wZW4gfHwgdGhpcy5pc0VtcHR5ICkgdGhpcy5oID0gdGhpcy5iYXNlSFxyXG4gICAgICAgIC8vZWxzZSB0aGlzLmggPSBSb290cy5jYWxjVWlzKCB0aGlzLnVpcywgdGhpcy56b25lLCB0aGlzLnpvbmUueSArIHRoaXMuYmFzZUggKSArIHRoaXMuYmFzZUg7XHJcbiAgICAgICAgZWxzZSB0aGlzLmggPSBSb290cy5jYWxjVWlzKCBbLi4udGhpcy51aXMsIHRoaXMuc3BhY2VZIF0sIHRoaXMuem9uZSwgdGhpcy56b25lLnkgKyB0aGlzLmJhc2VIICsgdGhpcy5tYXJnaW4sIHRydWUgKSArIHRoaXMuYmFzZUhcclxuXHJcbiAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCdcclxuICAgICAgICB0aGlzLnNbMl0uaGVpZ2h0ID0oIHRoaXMuaCAtIHRoaXMuYmFzZUggKSsgJ3B4J1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBwYXJlbnRIZWlnaHQgKCB0ICkge1xyXG5cclxuICAgICAgICBpZiAoIHRoaXMuZ3JvdXAgIT09IG51bGwgKSB0aGlzLmdyb3VwLmNhbGMoIHQgKVxyXG4gICAgICAgIGVsc2UgaWYgKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggdCApXHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNhbGMgKCB5ICkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNPcGVuICkgcmV0dXJuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5jYWxjKClcclxuICAgICAgICBlbHNlIHRoaXMuY2FsY1VpcygpXHJcbiAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCdcclxuICAgICAgICB0aGlzLnNbMl0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4J1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZUNvbnRlbnQgKCkge1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMudWlzLmxlbmd0aFxyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgICAgIHRoaXMudWlzW2ldLnNldFNpemUoIHRoaXMudyApXHJcbiAgICAgICAgICAgIHRoaXMudWlzW2ldLnJTaXplKClcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKVxyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMuc1xyXG5cclxuICAgICAgICB0aGlzLncgPSB0aGlzLncgLSB0aGlzLmRlY2FsXHJcblxyXG4gICAgICAgIHNbM10ubGVmdCA9ICggdGhpcy5zYSArIHRoaXMuc2IgLSA2ICkgKyAncHgnXHJcblxyXG4gICAgICAgIHNbMV0ud2lkdGggPSB0aGlzLncgKyAncHgnXHJcbiAgICAgICAgc1syXS53aWR0aCA9IHRoaXMudyArICdweCdcclxuICAgICAgICBzWzFdLmxlZnQgPSAodGhpcy5kZWNhbCkgKyAncHgnXHJcbiAgICAgICAgc1syXS5sZWZ0ID0gKHRoaXMuZGVjYWwpICsgJ3B4J1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc09wZW4gKSB0aGlzLnJTaXplQ29udGVudCgpXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vXHJcbi8qXHJcbiAgICB1aW91dCgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMubG9jayApIHJldHVybjtcclxuICAgICAgICBpZighdGhpcy5vdmVyRWZmZWN0KSByZXR1cm47XHJcbiAgICAgICAgaWYodGhpcy5zKSB0aGlzLnNbMF0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmJhY2tncm91bmQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVpb3ZlcigpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMubG9jayApIHJldHVybjtcclxuICAgICAgICBpZighdGhpcy5vdmVyRWZmZWN0KSByZXR1cm47XHJcbiAgICAgICAgLy9pZiggdGhpcy5pc09wZW4gKSByZXR1cm47XHJcbiAgICAgICAgaWYodGhpcy5zKSB0aGlzLnNbMF0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmJhY2tncm91bmRPdmVyO1xyXG5cclxuICAgIH1cclxuKi9cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90by5qcyc7XHJcbmltcG9ydCB7IFYyIH0gZnJvbSAnLi4vY29yZS9WMi5qcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgSm95c3RpY2sgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5hdXRvV2lkdGggPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IFswLDBdO1xyXG5cclxuICAgICAgICB0aGlzLm1pbncgID0gdGhpcy53XHJcbiAgICAgICAgdGhpcy5kaWFtID0gby5kaWFtIHx8IHRoaXMudyBcclxuXHJcbiAgICAgICAgdGhpcy5qb3lUeXBlID0gJ2FuYWxvZ2lxdWUnO1xyXG4gICAgICAgIHRoaXMubW9kZWwgPSBvLm1vZGUgIT09IHVuZGVmaW5lZCA/IG8ubW9kZSA6IDA7XHJcblxyXG4gICAgICAgIHRoaXMucHJlY2lzaW9uID0gby5wcmVjaXNpb24gfHwgMjtcclxuICAgICAgICB0aGlzLm11bHRpcGxpY2F0b3IgPSBvLm11bHRpcGxpY2F0b3IgfHwgMTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3MgPSBuZXcgVjIoKTtcclxuICAgICAgICB0aGlzLnRtcCA9IG5ldyBWMigpO1xyXG5cclxuICAgICAgICB0aGlzLmludGVydmFsID0gbnVsbDtcclxuICAgICAgICB0aGlzLmNbMF0uc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICAgICAgICB0aGlzLmhhdmVUZXh0ID0gby50ZXh0ICE9PSB1bmRlZmluZWQgPyBvLnRleHQgOiB0cnVlIFxyXG5cclxuICAgICAgICAvL3RoaXMucmFkaXVzID0gdGhpcy53ICogMC41O1xyXG4gICAgICAgIC8vdGhpcy5kaXN0YW5jZSA9IHRoaXMucmFkaXVzKjAuMjU7XHJcbiAgICAgICAgdGhpcy5kaXN0YW5jZSA9ICh0aGlzLmRpYW0qMC41KSowLjI1O1xyXG5cclxuICAgICAgICB0aGlzLmggPSBvLmggfHwgdGhpcy53ICsgKHRoaXMuaGF2ZVRleHQgPyAxMCA6IDApO1xyXG5cclxuICAgICAgICB0aGlzLmNbMF0uc3R5bGUud2lkdGggPSB0aGlzLncgKydweCc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCApIHsgLy8gd2l0aCB0aXRsZVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLndpZHRoID0gJzEwMCUnO1xyXG4gICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUuanVzdGlmeUNvbnRlbnQgPSAnY2VudGVyJztcclxuICAgICAgICAgICAgdGhpcy50b3AgPSAxMDtcclxuICAgICAgICAgICAgdGhpcy5oICs9IDEwO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBjYyA9IHRoaXMuY29sb3JzXHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ2p1c3RpZnktY29udGVudDpjZW50ZXI7IHRvcDonKyh0aGlzLmgtMjApKydweDsgd2lkdGg6MTAwJTsgY29sb3I6JysgY2MudGV4dCApO1xyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMuaGF2ZVRleHQgPyB0aGlzLnZhbHVlIDogJyc7XHJcblxyXG4gICAgICAgIHRoaXMuY1szXSA9IHRoaXMuZ2V0Sm95c3RpY2soIHRoaXMubW9kZWwgKTtcclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAndmlld0JveCcsICcwIDAgJyt0aGlzLmRpYW0rJyAnK3RoaXMuZGlhbSApO1xyXG4gICAgICAgIHRoaXMuc2V0Q3NzKCB0aGlzLmNbM10sIHsgd2lkdGg6dGhpcy5kaWFtLCBoZWlnaHQ6dGhpcy5kaWFtLCBsZWZ0OjAsIHRvcDp0aGlzLnRvcCB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5tb2RlKDApXHJcblxyXG5cclxuICAgICAgICB0aGlzLnJhdGlvID0gMTI4L3RoaXMudztcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlKGZhbHNlKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBtb2RlICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGNjID0gdGhpcy5jb2xvcnNcclxuXHJcbiAgICAgICAgc3dpdGNoKG1vZGUpe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMubW9kZWw9PT0wKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsICd1cmwoI2dyYWRJbiknLCA0ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsICcjMDAwJywgNCApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgY2Muam95T3V0LCAyICk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgJ3JnYigwLDAsMCwwLjEpJywgMyApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCBjYy5qb3lPdXQsIDQgKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsICdub25lJywgNCApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMubW9kZWw9PT0wKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsICd1cmwoI2dyYWRJbjIpJywgNCApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCAncmdiYSgwLDAsMCwwKScsIDQgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIGNjLmpveU92ZXIsIDIgKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3RoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCAncmdiKDAsMCwwLDAuMyknLCAzICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIGNjLmpveVNlbGVjdCwgNCApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJywgY2Muam95T3ZlciwgNCApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiAvLyBlZGl0XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBhZGRJbnRlcnZhbCAoKXtcclxuICAgICAgICBpZiggdGhpcy5pbnRlcnZhbCAhPT0gbnVsbCApIHRoaXMuc3RvcEludGVydmFsKCk7XHJcbiAgICAgICAgaWYoIHRoaXMucG9zLmlzWmVybygpICkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCggZnVuY3Rpb24oKXsgdGhpcy51cGRhdGUoKTsgfS5iaW5kKHRoaXMpLCAxMCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzdG9wSW50ZXJ2YWwgKCl7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmludGVydmFsID09PSBudWxsICkgcmV0dXJuO1xyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoIHRoaXMuaW50ZXJ2YWwgKTtcclxuICAgICAgICB0aGlzLmludGVydmFsID0gbnVsbDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmFkZEludGVydmFsKCk7XHJcbiAgICAgICAgdGhpcy5tb2RlKDApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRJbnRlcnZhbCgpO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICBcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICB0aGlzLm1vZGUoIDIgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNEb3duICkgcmV0dXJuO1xyXG5cclxuICAgICAgICAvL3RoaXMudG1wLnggPSB0aGlzLnJhZGl1cyAtICggZS5jbGllbnRYIC0gdGhpcy56b25lLnggKTtcclxuICAgICAgICAvL3RoaXMudG1wLnkgPSB0aGlzLnJhZGl1cyAtICggZS5jbGllbnRZIC0gdGhpcy56b25lLnkgLSB0aGlzLnRvcCApO1xyXG5cclxuICAgICAgICB0aGlzLnRtcC54ID0gKHRoaXMudyowLjUpIC0gKCBlLmNsaWVudFggLSB0aGlzLnpvbmUueCApO1xyXG4gICAgICAgIHRoaXMudG1wLnkgPSAodGhpcy5kaWFtKjAuNSkgLSAoIGUuY2xpZW50WSAtIHRoaXMuem9uZS55IC0gdGhpcy55dG9wICk7XHJcblxyXG4gICAgICAgIGxldCBkaXN0YW5jZSA9IHRoaXMudG1wLmxlbmd0aCgpO1xyXG5cclxuICAgICAgICBpZiAoIGRpc3RhbmNlID4gdGhpcy5kaXN0YW5jZSApIHtcclxuICAgICAgICAgICAgbGV0IGFuZ2xlID0gTWF0aC5hdGFuMih0aGlzLnRtcC54LCB0aGlzLnRtcC55KTtcclxuICAgICAgICAgICAgdGhpcy50bXAueCA9IE1hdGguc2luKCBhbmdsZSApICogdGhpcy5kaXN0YW5jZTtcclxuICAgICAgICAgICAgdGhpcy50bXAueSA9IE1hdGguY29zKCBhbmdsZSApICogdGhpcy5kaXN0YW5jZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucG9zLmNvcHkoIHRoaXMudG1wICkuZGl2aWRlU2NhbGFyKCB0aGlzLmRpc3RhbmNlICkubmVnYXRlKCk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldFZhbHVlICggdiApIHtcclxuXHJcbiAgICAgICAgaWYodj09PXVuZGVmaW5lZCkgdj1bMCwwXTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3Muc2V0KCB2WzBdIHx8IDAsIHZbMV0gIHx8IDAgKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVNWRygpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCB1cCApIHtcclxuXHJcbiAgICAgICAgaWYoIHVwID09PSB1bmRlZmluZWQgKSB1cCA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmludGVydmFsICE9PSBudWxsICl7XHJcblxyXG4gICAgICAgICAgICBpZiggIXRoaXMuaXNEb3duICl7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3MubGVycCggbnVsbCwgMC4zICk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3MueCA9IE1hdGguYWJzKCB0aGlzLnBvcy54ICkgPCAwLjAxID8gMCA6IHRoaXMucG9zLng7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcy55ID0gTWF0aC5hYnMoIHRoaXMucG9zLnkgKSA8IDAuMDEgPyAwIDogdGhpcy5wb3MueTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5pc1VJICYmIHRoaXMubWFpbi5pc0NhbnZhcyApIHRoaXMubWFpbi5kcmF3KCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVTVkcoKTtcclxuXHJcbiAgICAgICAgaWYoIHVwICkgdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnBvcy5pc1plcm8oKSApIHRoaXMuc3RvcEludGVydmFsKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVNWRyAoKSB7XHJcblxyXG4gICAgICAgIC8vbGV0IHggPSB0aGlzLnJhZGl1cyAtICggLXRoaXMucG9zLnggKiB0aGlzLmRpc3RhbmNlICk7XHJcbiAgICAgICAgLy9sZXQgeSA9IHRoaXMucmFkaXVzIC0gKCAtdGhpcy5wb3MueSAqIHRoaXMuZGlzdGFuY2UgKTtcclxuXHJcbiAgICAgICAgbGV0IHggPSAodGhpcy5kaWFtKjAuNSkgLSAoIC10aGlzLnBvcy54ICogdGhpcy5kaXN0YW5jZSApO1xyXG4gICAgICAgIGxldCB5ID0gKHRoaXMuZGlhbSowLjUpIC0gKCAtdGhpcy5wb3MueSAqIHRoaXMuZGlzdGFuY2UgKTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5tb2RlbCA9PT0gMCl7XHJcblxyXG4gICAgICAgICAgICBsZXQgc3ggPSB4ICsgKCh0aGlzLnBvcy54KSo1KSArIDU7XHJcbiAgICAgICAgICAgIGxldCBzeSA9IHkgKyAoKHRoaXMucG9zLnkpKjUpICsgMTA7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3gnLCBzeCp0aGlzLnJhdGlvLCAzICk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeScsIHN5KnRoaXMucmF0aW8sIDMgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3gnLCB4KnRoaXMucmF0aW8sIDMgKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N5JywgeSp0aGlzLnJhdGlvLCAzICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N4JywgeCp0aGlzLnJhdGlvLCA0ICk7XHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N5JywgeSp0aGlzLnJhdGlvLCA0ICk7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWVbMF0gPSAgKCB0aGlzLnBvcy54ICogdGhpcy5tdWx0aXBsaWNhdG9yICkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKSAqIDE7XHJcbiAgICAgICAgdGhpcy52YWx1ZVsxXSA9ICAoIHRoaXMucG9zLnkgKiB0aGlzLm11bHRpcGxpY2F0b3IgKS50b0ZpeGVkKCB0aGlzLnByZWNpc2lvbiApICogMTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5oYXZlVGV4dCkgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXIgKCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc3RvcEludGVydmFsKCk7XHJcbiAgICAgICAgc3VwZXIuY2xlYXIoKTtcclxuXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvLmpzJztcclxuaW1wb3J0IHsgVG9vbHMgfSBmcm9tICcuLi9jb3JlL1Rvb2xzLmpzJztcclxuaW1wb3J0IHsgVjIgfSBmcm9tICcuLi9jb3JlL1YyLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBLbm9iIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMuaXNDeWNsaWMgPSBvLmN5Y2xpYyB8fCBmYWxzZTtcclxuICAgICAgICB0aGlzLm1vZGVsID0gby5zdHlwZSB8fCAwO1xyXG4gICAgICAgIGlmKCBvLm1vZGUgIT09IHVuZGVmaW5lZCApIHRoaXMubW9kZWwgPSBvLm1vZGU7XHJcblxyXG4gICAgICAgIHRoaXMuYXV0b1dpZHRoID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VHlwZU51bWJlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLm1pbncgID0gdGhpcy53XHJcbiAgICAgICAgdGhpcy5kaWFtID0gby5kaWFtIHx8IHRoaXMudyBcclxuXHJcbiAgICAgICAgdGhpcy5tUEkgPSBNYXRoLlBJICogMC44O1xyXG4gICAgICAgIHRoaXMudG9EZWcgPSAxODAgLyBNYXRoLlBJO1xyXG4gICAgICAgIHRoaXMuY2lyUmFuZ2UgPSB0aGlzLm1QSSAqIDI7XHJcblxyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gbmV3IFYyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaCA9IG8uaCB8fCB0aGlzLncgKyAxMDtcclxuXHJcbiAgICAgICAgdGhpcy5jWzBdLnN0eWxlLndpZHRoID0gdGhpcy53ICsncHgnXHJcbiAgICAgICAgdGhpcy5jWzBdLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcblxyXG4gICAgICAgIGlmKHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUud2lkdGggPSAnMTAwJSdcclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLmp1c3RpZnlDb250ZW50ID0gJ2NlbnRlcidcclxuICAgICAgICAgICAgdGhpcy50b3AgPSAxMDtcclxuICAgICAgICAgICAgdGhpcy5oICs9IDEwO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucGVyY2VudCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuY21vZGUgPSAwO1xyXG4gICAgICAgIGxldCBjYyA9IHRoaXMuY29sb3JzXHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ2p1c3RpZnktY29udGVudDpjZW50ZXI7IHRvcDonKyh0aGlzLmgtMjApKydweDsgd2lkdGg6MTAwJTsgY29sb3I6JysgY2MudGV4dCApO1xyXG5cclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmdldEtub2IoKTtcclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsIGNjLmJ1dHRvbiwgMCApXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIGNjLnRleHQsIDEgKVxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCBjYy50ZXh0LCAzIClcclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsIHRoaXMubWFrZUdyYWQoKSwgMyApXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3ZpZXdCb3gnLCAnMCAwICcgKyB0aGlzLmRpYW0gKyAnICcgKyB0aGlzLmRpYW0gKVxyXG4gICAgICAgIHRoaXMuc2V0Q3NzKCB0aGlzLmNbM10sIHsgd2lkdGg6dGhpcy5kaWFtLCBoZWlnaHQ6dGhpcy5kaWFtLCBsZWZ0OjAsIHRvcDp0aGlzLnRvcCB9KVxyXG5cclxuICAgICAgICBpZiAoIHRoaXMubW9kZWwgPiAwICkge1xyXG5cclxuICAgICAgICAgICAgVG9vbHMuZG9tKCAncGF0aCcsICcnLCB7IGQ6ICcnLCBzdHJva2U6Y2MudGV4dCwgJ3N0cm9rZS13aWR0aCc6IDIsIGZpbGw6ICdub25lJywgJ3N0cm9rZS1saW5lY2FwJzogJ3JvdW5kJyB9LCB0aGlzLmNbM10gKTsgLy80XHJcblxyXG4gICAgICAgICAgICBpZiAoIHRoaXMubW9kZWwgPT0gMikge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIFRvb2xzLmFkZFNWR0dsb3dFZmZlY3QoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHlsZScsICdmaWx0ZXI6IHVybChcIiNVSUxHbG93XCIpOycsIDQgKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnIgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZSAoIG1vZGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBjYyA9IHRoaXMuY29sb3JzXHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNtb2RlID09PSBtb2RlICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBzd2l0Y2goIG1vZGUgKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMDogLy8gYmFzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zWzJdLmNvbG9yID0gY2MudGV4dDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJywgY2MuYnV0dG9uLCAwKTtcclxuICAgICAgICAgICAgICAgIC8vdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsJ3JnYmEoMjU1LDAsMCwwLjIpJywgMik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgY2MudGV4dCwgMSApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBkb3duXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNbMl0uY29sb3IgPSBjYy50ZXh0T3ZlcjtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJywgY2Muc2VsZWN0LCAwKTtcclxuICAgICAgICAgICAgICAgIC8vdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsJ3JnYmEoMCwwLDAsMC42KScsIDIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIGNjLnRleHRPdmVyLCAxICk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jbW9kZSA9IG1vZGU7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcbiAgICAgICAgaWYoIGwueSA8PSB0aGlzLmNbIDEgXS5vZmZzZXRIZWlnaHQgKSByZXR1cm4gJ3RpdGxlJztcclxuICAgICAgICBlbHNlIGlmICggbC55ID4gdGhpcy5oIC0gdGhpcy5jWyAyIF0ub2Zmc2V0SGVpZ2h0ICkgcmV0dXJuICd0ZXh0JztcclxuICAgICAgICBlbHNlIHJldHVybiAna25vYic7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zZW5kRW5kKClcclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlKDApXHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZVxyXG4gICAgICAgIHRoaXMub2xkID0gdGhpcy52YWx1ZVxyXG4gICAgICAgIHRoaXMub2xkciA9IG51bGxcclxuICAgICAgICB0aGlzLm1vdXNlbW92ZSggZSApXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZSgxKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNEb3duICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgb2ZmID0gdGhpcy5vZmZzZXQ7XHJcblxyXG4gICAgICAgIC8vb2ZmLnggPSB0aGlzLnJhZGl1cyAtICggZS5jbGllbnRYIC0gdGhpcy56b25lLnggKTtcclxuICAgICAgICAvL29mZi55ID0gdGhpcy5yYWRpdXMgLSAoIGUuY2xpZW50WSAtIHRoaXMuem9uZS55IC0gdGhpcy50b3AgKTtcclxuXHJcbiAgICAgICAgb2ZmLnggPSAodGhpcy53KjAuNSkgLSAoIGUuY2xpZW50WCAtIHRoaXMuem9uZS54ICk7XHJcbiAgICAgICAgb2ZmLnkgPSAodGhpcy5kaWFtKjAuNSkgLSAoIGUuY2xpZW50WSAtIHRoaXMuem9uZS55IC0gdGhpcy55dG9wICk7XHJcblxyXG4gICAgICAgIHRoaXMuciA9IC0gTWF0aC5hdGFuMiggb2ZmLngsIG9mZi55ICk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLm9sZHIgIT09IG51bGwgKSB0aGlzLnIgPSBNYXRoLmFicyh0aGlzLnIgLSB0aGlzLm9sZHIpID4gTWF0aC5QSSA/IHRoaXMub2xkciA6IHRoaXMucjtcclxuXHJcbiAgICAgICAgdGhpcy5yID0gdGhpcy5yID4gdGhpcy5tUEkgPyB0aGlzLm1QSSA6IHRoaXMucjtcclxuICAgICAgICB0aGlzLnIgPSB0aGlzLnIgPCAtdGhpcy5tUEkgPyAtdGhpcy5tUEkgOiB0aGlzLnI7XHJcblxyXG4gICAgICAgIGxldCBzdGVwcyA9IDEgLyB0aGlzLmNpclJhbmdlO1xyXG4gICAgICAgIGxldCB2YWx1ZSA9ICh0aGlzLnIgKyB0aGlzLm1QSSkgKiBzdGVwcztcclxuXHJcbiAgICAgICAgbGV0IG4gPSAoICggdGhpcy5yYW5nZSAqIHZhbHVlICkgKyB0aGlzLm1pbiApIC0gdGhpcy5vbGQ7XHJcblxyXG4gICAgICAgIGlmKG4gPj0gdGhpcy5zdGVwIHx8IG4gPD0gdGhpcy5zdGVwKXsgXHJcbiAgICAgICAgICAgIG4gPSBNYXRoLmZsb29yKCBuIC8gdGhpcy5zdGVwICk7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLm51bVZhbHVlKCB0aGlzLm9sZCArICggbiAqIHRoaXMuc3RlcCApICk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCB0cnVlICk7XHJcbiAgICAgICAgICAgIHRoaXMub2xkID0gdGhpcy52YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5vbGRyID0gdGhpcy5yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgd2hlZWwgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICdrbm9iJyApIHtcclxuICAgIFxyXG4gICAgICAgICAgICBsZXQgdiA9IHRoaXMudmFsdWUgLSB0aGlzLnN0ZXAgKiBlLmRlbHRhO1xyXG4gICAgXHJcbiAgICAgICAgICAgIGlmICggdiA+IHRoaXMubWF4ICkge1xyXG4gICAgICAgICAgICAgICAgdiA9IHRoaXMuaXNDeWNsaWMgPyB0aGlzLm1pbiA6IHRoaXMubWF4O1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCB2IDwgdGhpcy5taW4gKSB7XHJcbiAgICAgICAgICAgICAgICB2ID0gdGhpcy5pc0N5Y2xpYyA/IHRoaXMubWF4IDogdGhpcy5taW47XHJcbiAgICAgICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgICAgICB0aGlzLnNldFZhbHVlKCB2ICk7XHJcbiAgICAgICAgICAgIHRoaXMub2xkID0gdjtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUoIHRydWUgKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbWFrZUdyYWQgKCkge1xyXG5cclxuICAgICAgICBsZXQgZCA9ICcnLCBzdGVwLCByYW5nZSwgYSwgeCwgeSwgeDIsIHkyLCByID0gNjQ7XHJcbiAgICAgICAgbGV0IHN0YXJ0YW5nbGUgPSBNYXRoLlBJICsgdGhpcy5tUEk7XHJcbiAgICAgICAgbGV0IGVuZGFuZ2xlID0gTWF0aC5QSSAtIHRoaXMubVBJO1xyXG4gICAgICAgIC8vbGV0IHN0ZXAgPSB0aGlzLnN0ZXA+NSA/IHRoaXMuc3RlcCA6IDE7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuc3RlcD41KXtcclxuICAgICAgICAgICAgcmFuZ2UgPSAgdGhpcy5yYW5nZSAvIHRoaXMuc3RlcDtcclxuICAgICAgICAgICAgc3RlcCA9ICggc3RhcnRhbmdsZSAtIGVuZGFuZ2xlICkgLyByYW5nZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdGVwID0gKCggc3RhcnRhbmdsZSAtIGVuZGFuZ2xlICkgLyByKSoyO1xyXG4gICAgICAgICAgICByYW5nZSA9IHIqMC41O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDw9IHJhbmdlOyArK2kgKSB7XHJcblxyXG4gICAgICAgICAgICBhID0gc3RhcnRhbmdsZSAtICggc3RlcCAqIGkgKTtcclxuICAgICAgICAgICAgeCA9IHIgKyBNYXRoLnNpbiggYSApICogKCByIC0gMjAgKTtcclxuICAgICAgICAgICAgeSA9IHIgKyBNYXRoLmNvcyggYSApICogKCByIC0gMjAgKTtcclxuICAgICAgICAgICAgeDIgPSByICsgTWF0aC5zaW4oIGEgKSAqICggciAtIDI0ICk7XHJcbiAgICAgICAgICAgIHkyID0gciArIE1hdGguY29zKCBhICkgKiAoIHIgLSAyNCApO1xyXG4gICAgICAgICAgICBkICs9ICdNJyArIHggKyAnICcgKyB5ICsgJyBMJyArIHgyICsgJyAnK3kyICsgJyAnO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBkO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCB1cCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuICAgICAgICB0aGlzLnBlcmNlbnQgPSAodGhpcy52YWx1ZSAtIHRoaXMubWluKSAvIHRoaXMucmFuZ2U7XHJcblxyXG4gICAgICAgIGxldCBzYSA9IE1hdGguUEkgKyB0aGlzLm1QSTtcclxuICAgICAgICBsZXQgZWEgPSAoICggdGhpcy5wZXJjZW50ICogdGhpcy5jaXJSYW5nZSApIC0gKCB0aGlzLm1QSSApICk7XHJcblxyXG4gICAgICAgIGxldCBzaW4gPSBNYXRoLnNpbiggZWEgKTtcclxuICAgICAgICBsZXQgY29zID0gTWF0aC5jb3MoIGVhICk7XHJcblxyXG4gICAgICAgIGxldCB4MSA9ICggMjUgKiBzaW4gKSArIDY0O1xyXG4gICAgICAgIGxldCB5MSA9IC0oIDI1ICogY29zICkgKyA2NDtcclxuICAgICAgICBsZXQgeDIgPSAoIDIwICogc2luICkgKyA2NDtcclxuICAgICAgICBsZXQgeTIgPSAtKCAyMCAqIGNvcyApICsgNjQ7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgJ00gJyArIHgxICsnICcgKyB5MSArICcgTCAnICsgeDIgKycgJyArIHkyLCAxICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKCB0aGlzLm1vZGVsID4gMCApIHtcclxuXHJcbiAgICAgICAgICAgIGxldCB4MSA9IDM2ICogTWF0aC5zaW4oIHNhICkgKyA2NDtcclxuICAgICAgICAgICAgbGV0IHkxID0gMzYgKiBNYXRoLmNvcyggc2EgKSArIDY0O1xyXG4gICAgICAgICAgICBsZXQgeDIgPSAzNiAqIHNpbiArIDY0O1xyXG4gICAgICAgICAgICBsZXQgeTIgPSAtMzYgKiBjb3MgKyA2NDtcclxuICAgICAgICAgICAgbGV0IGJpZyA9IGVhIDw9IE1hdGguUEkgLSB0aGlzLm1QSSA/IDAgOiAxO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsICdNICcgKyB4MSArICcsJyArIHkxICsgJyBBICcgKyAzNiArICcsJyArIDM2ICsgJyAxICcgKyBiaWcgKyAnIDEgJyArIHgyICsgJywnICsgeTIsIDQgKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjb2xvciA9IFRvb2xzLnBhY2soIFRvb2xzLmxlcnBDb2xvciggVG9vbHMudW5wYWNrKCBUb29scy5Db2xvckx1bWEoIHRoaXMuY29sb3JzLnRleHQsIC0wLjc1KSApLCBUb29scy51bnBhY2soIHRoaXMuY29sb3JzLnRleHQgKSwgdGhpcy5wZXJjZW50ICkgKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIGNvbG9yLCA0ICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdXAgKSB0aGlzLnNlbmQoKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8uanMnO1xyXG5pbXBvcnQgeyBSb290cyB9IGZyb20gJy4uL2NvcmUvUm9vdHMuanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIExpc3QgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgLy8gVE9ETyBub3Qgd29ya1xyXG4gICAgICAgIHRoaXMuaGlkZUN1cnJlbnQgPSBmYWxzZVxyXG5cclxuICAgICAgICAvLyBpbWFnZXNcclxuICAgICAgICB0aGlzLnBhdGggPSBvLnBhdGggfHwgJyc7XHJcbiAgICAgICAgdGhpcy5mb3JtYXQgPSBvLmZvcm1hdCB8fCAnJztcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgdGhpcy5pc1dpdGhJbWFnZSA9IHRoaXMucGF0aCAhPT0gJycgPyB0cnVlOmZhbHNlO1xyXG4gICAgICAgIHRoaXMucHJlTG9hZENvbXBsZXRlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMudG1wSW1hZ2UgPSB7fTtcclxuICAgICAgICB0aGlzLnRtcFVybCA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLm0gPSBvLm0gIT09IHVuZGVmaW5lZCA/IG8ubSA6IDVcclxuXHJcblxyXG4gICAgICAgIGxldCBhbGlnbiA9IG8uYWxpZ24gfHwgJ2xlZnQnO1xyXG5cclxuICAgICAgICAvLyBzY3JvbGwgc2l6ZVxyXG4gICAgICAgIGxldCBzcyA9IG8uc2Nyb2xsU2l6ZSB8fCAxMFxyXG4gICAgICAgIHRoaXMuc3MgPSBzcysxXHJcblxyXG4gICAgICAgIHRoaXMuc01vZGUgPSAwO1xyXG4gICAgICAgIHRoaXMudE1vZGUgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RPbmx5ID0gby5saXN0T25seSB8fCBmYWxzZVxyXG4gICAgICAgIHRoaXMuc3RhdGljVG9wID0gby5zdGF0aWNUb3AgfHwgZmFsc2VcclxuXHJcbiAgICAgICAgdGhpcy5pc1NlbGVjdGFibGUgPSB0aGlzLmxpc3RPbmx5XHJcbiAgICAgICAgaWYoIG8uc2VsZWN0ICE9PSB1bmRlZmluZWQgKSBvLnNlbGVjdGFibGUgPSBvLnNlbGVjdFxyXG4gICAgICAgIGlmKCBvLnNlbGVjdGFibGUgIT09IHVuZGVmaW5lZCApIHRoaXMuaXNTZWxlY3RhYmxlID0gby5zZWxlY3RhYmxlXHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnR4dCA9PT0gJycgKSB0aGlzLnAgPSAwO1xyXG5cclxuXHJcbiAgICAgICAgbGV0IGZsdG9wID0gTWF0aC5mbG9vcih0aGlzLmgqMC41KS0zO1xyXG4gICAgICAgIGxldCBjYyA9IHRoaXMuY29sb3JzXHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAndG9wOjA7IGRpc3BsYXk6bm9uZTsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsnICk7XHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5pdGVtICsgJ3BhZGRpbmc6MHB4ICcrdGhpcy5tKydweDsgbWFyZ2luLWJvdHRvbTowcHg7IHBvc2l0aW9uOmFic29sdXRlOyBqdXN0aWZ5LWNvbnRlbnQ6JythbGlnbisnOyB0ZXh0LWFsaWduOicrYWxpZ24rJzsgbGluZS1oZWlnaHQ6JysodGhpcy5oLTQpKydweDsgdG9wOjFweDsgYmFja2dyb3VuZDonK2NjLmJ1dHRvbisnOyBoZWlnaHQ6JysodGhpcy5oLTIpKydweDsgYm9yZGVyOjFweCBzb2xpZCAnK2NjLmJvcmRlcisnOyBib3JkZXItcmFkaXVzOicrdGhpcy5yYWRpdXMrJ3B4OycgKTtcclxuICAgICAgICB0aGlzLmNbNF0gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6NnB4OyBoZWlnaHQ6NnB4OyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuc3Zncy5nMSwgZmlsbDpjYy50ZXh0LCBzdHJva2U6J25vbmUnfSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2Nyb2xsZXJCYWNrID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICdyaWdodDowcHg7IHdpZHRoOicrc3MrJ3B4OyBiYWNrZ3JvdW5kOicrY2MuYmFjaysnOyBkaXNwbGF5Om5vbmU7Jyk7XHJcbiAgICAgICAgdGhpcy5zY3JvbGxlciA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAncmlnaHQ6JysoKHNzLShzcyowLjI1KSkqMC41KSsncHg7IHdpZHRoOicrKHNzKjAuMjUpKydweDsgYmFja2dyb3VuZDonK2NjLnRleHQrJzsgZGlzcGxheTpub25lOyAnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzNdLnN0eWxlLmNvbG9yID0gY2MudGV4dDtcclxuXHJcblxyXG4gICAgICAgIHRoaXMubGlzdCA9IFtdXHJcbiAgICAgICAgdGhpcy5yZWZPYmplY3QgPSBudWxsXHJcblxyXG4gICAgICAgIGlmKCBvLmxpc3QgKXtcclxuICAgICAgICAgICAgaWYoIG8ubGlzdCBpbnN0YW5jZW9mIEFycmF5ICl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3QgPSBvLmxpc3RcclxuICAgICAgICAgICAgfSBlbHNlIGlmKCBvLmxpc3QgaW5zdGFuY2VvZiBPYmplY3QgKXtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVmT2JqZWN0ID0gby5saXN0XHJcbiAgICAgICAgICAgICAgICBmb3IoIGxldCBnIGluIHRoaXMucmVmT2JqZWN0ICkgdGhpcy5saXN0LnB1c2goIGcgKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLml0ZW1zID0gW107XHJcblxyXG4gICAgICAgIHRoaXMucHJldk5hbWUgPSAnJztcclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50bXBJZCA9IDBcclxuXHJcbiAgICAgICAgdGhpcy5iYXNlSCA9IHRoaXMuaDtcclxuXHJcbiAgICAgICAgdGhpcy5pdGVtSGVpZ2h0ID0gby5pdGVtSGVpZ2h0IHx8IHRoaXMuaC8vKHRoaXMuaC0zKTtcclxuXHJcbiAgICAgICAgLy8gZm9yY2UgZnVsbCBsaXN0IFxyXG4gICAgICAgIHRoaXMuZnVsbCA9IG8uZnVsbCB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5weSA9IDA7XHJcbiAgICAgICAgdGhpcy53dyA9IHRoaXMuc2I7XHJcbiAgICAgICAgdGhpcy5zY3JvbGwgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBudWxsO1xyXG5cclxuICAgICAgICAvLyBsaXN0IHVwIG9yIGRvd25cclxuICAgICAgICB0aGlzLnNpZGUgPSBvLnNpZGUgfHwgJ2Rvd24nO1xyXG4gICAgICAgIHRoaXMudXAgPSB0aGlzLnNpZGUgPT09ICdkb3duJyA/IDAgOiAxO1xyXG5cclxuICAgICAgICBpZiggdGhpcy51cCApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jWzJdLnN0eWxlLnRvcCA9ICdhdXRvJztcclxuICAgICAgICAgICAgdGhpcy5jWzNdLnN0eWxlLnRvcCA9ICdhdXRvJztcclxuICAgICAgICAgICAgdGhpcy5jWzRdLnN0eWxlLnRvcCA9ICdhdXRvJztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1syXS5zdHlsZS5ib3R0b20gPSB0aGlzLmgtMiArICdweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY1szXS5zdHlsZS5ib3R0b20gPSAnMXB4JztcclxuICAgICAgICAgICAgdGhpcy5jWzRdLnN0eWxlLmJvdHRvbSA9IGZsdG9wICsgJ3B4JztcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jWzJdLnN0eWxlLnRvcCA9IHRoaXMuYmFzZUggKyAncHgnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5saXN0SW4gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ2xlZnQ6MDsgdG9wOjA7IHdpZHRoOjEwMCU7IGJhY2tncm91bmQ6bm9uZTsnKTtcclxuICAgICAgICB0aGlzLmxpc3RJbi5uYW1lID0gJ2xpc3QnO1xyXG5cclxuICAgICAgICB0aGlzLnRvcExpc3QgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY1syXS5hcHBlbmRDaGlsZCggdGhpcy5saXN0SW4gKTtcclxuICAgICAgICB0aGlzLmNbMl0uYXBwZW5kQ2hpbGQoIHRoaXMuc2Nyb2xsZXJCYWNrICk7XHJcbiAgICAgICAgdGhpcy5jWzJdLmFwcGVuZENoaWxkKCB0aGlzLnNjcm9sbGVyICk7XHJcblxyXG4gICAgICAgIGlmKCBvLnZhbHVlICE9PSB1bmRlZmluZWQgKXtcclxuICAgICAgICAgICAgaWYoIWlzTmFOKG8udmFsdWUpKSB0aGlzLnZhbHVlID0gdGhpcy5saXN0WyBvLnZhbHVlIF07XHJcbiAgICAgICAgICAgIGVsc2UgdGhpcy52YWx1ZSA9IG8udmFsdWU7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmxpc3RbMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmlzT3Blbk9uU3RhcnQgPSBvLm9wZW4gfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmxpc3RPbmx5ICl7XHJcbiAgICAgICAgICAgIHRoaXMuYmFzZUggPSA1O1xyXG4gICAgICAgICAgICB0aGlzLmNbM10uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgdGhpcy5jWzRdLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIHRoaXMuY1syXS5zdHlsZS50b3AgPSB0aGlzLmJhc2VIKydweCdcclxuICAgICAgICAgICAgdGhpcy5pc09wZW5PblN0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICB0aGlzLm1pbmlDYW52YXMgPSBvLm1pbmlDYW52YXMgfHwgZmFsc2UgXHJcbiAgICAgICAgdGhpcy5jYW52YXNCZyA9IG8uY2FudmFzQmcgfHwgJ3JnYmEoMCwwLDAsMCknXHJcbiAgICAgICAgdGhpcy5pbWFnZVNpemUgPSBvLmltYWdlU2l6ZSB8fCBbMjAsMjBdO1xyXG5cclxuICAgICAgICAvLyBkcmFnb3V0IGZ1bmN0aW9uXHJcbiAgICAgICAgdGhpcy5kcmFnID0gby5kcmFnIHx8IGZhbHNlXHJcbiAgICAgICAgdGhpcy5kcmFnb3V0ID0gby5kcmFnb3V0IHx8IGZhbHNlXHJcbiAgICAgICAgdGhpcy5kcmFnc3RhcnQgPSBvLmRyYWdzdGFydCB8fCBudWxsXHJcbiAgICAgICAgdGhpcy5kcmFnZW5kID0gby5kcmFnZW5kIHx8IG51bGxcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIC8vdGhpcy5jWzBdLnN0eWxlLmJhY2tncm91bmQgPSAnI0ZGMDAwMCdcclxuICAgICAgICAvLy9pZiggdGhpcy5pc1dpdGhJbWFnZSApIHRoaXMucHJlbG9hZEltYWdlKCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0TGlzdCggdGhpcy5saXN0ICk7XHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICAgICAgaWYoIHRoaXMuaXNXaXRoSW1hZ2UgKSB0aGlzLnByZWxvYWRJbWFnZSgpO1xyXG4gICAgICAgIGlmKCB0aGlzLmlzT3Blbk9uU3RhcnQgKSB0aGlzLm9wZW4oIHRydWUgKVxyXG5cclxuICAgICAgICB0aGlzLmJhc2VIICs9IHRoaXMubXRvcFxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBpbWFnZSBsaXN0XHJcblxyXG4gICAgcHJlbG9hZEltYWdlICgpIHtcclxuXHJcblxyXG5cclxuICAgICAgICB0aGlzLnByZUxvYWRDb21wbGV0ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnRtcEltYWdlID0ge307XHJcbiAgICAgICAgZm9yKCBsZXQgaT0wOyBpPHRoaXMubGlzdC5sZW5ndGg7IGkrKyApIHRoaXMudG1wVXJsLnB1c2goIHRoaXMubGlzdFtpXSApO1xyXG4gICAgICAgIHRoaXMubG9hZE9uZSgpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG5leHRJbWcgKCkge1xyXG5cclxuICAgICAgICBpZih0aGlzLmMgPT09IG51bGwpIHJldHVyblxyXG5cclxuICAgICAgICB0aGlzLnRtcFVybC5zaGlmdCgpO1xyXG4gICAgICAgIGlmKCB0aGlzLnRtcFVybC5sZW5ndGggPT09IDAgKXsgXHJcblxyXG4gICAgICAgICAgICB0aGlzLnByZUxvYWRDb21wbGV0ZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFkZEltYWdlcygpO1xyXG4gICAgICAgICAgICAvKnRoaXMuc2V0TGlzdCggdGhpcy5saXN0ICk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgICAgICBpZiggdGhpcy5pc09wZW5PblN0YXJ0ICkgdGhpcy5vcGVuKCk7Ki9cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgdGhpcy5sb2FkT25lKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGxvYWRPbmUoKXtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRtcFVybFswXTtcclxuICAgICAgICBsZXQgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgICAgICAgaW1nLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOicrc2VsZi5pbWFnZVNpemVbMF0rJ3B4OyBoZWlnaHQ6JytzZWxmLmltYWdlU2l6ZVsxXSsncHgnO1xyXG4gICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoJ3NyYycsIHRoaXMucGF0aCArIG5hbWUgKyB0aGlzLmZvcm1hdCApO1xyXG5cclxuICAgICAgICBpbWcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgc2VsZi5pbWFnZVNpemVbMl0gPSBpbWcud2lkdGg7XHJcbiAgICAgICAgICAgIHNlbGYuaW1hZ2VTaXplWzNdID0gaW1nLmhlaWdodDtcclxuICAgICAgICAgICAgc2VsZi50bXBJbWFnZVtuYW1lXSA9IGltZztcclxuICAgICAgICAgICAgc2VsZi5uZXh0SW1nKCk7XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvL1xyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnVwICYmIHRoaXMuaXNPcGVuICl7XHJcbiAgICAgICAgICAgIGlmKCBsLnkgPiB0aGlzLmggLSB0aGlzLmJhc2VIICkgcmV0dXJuICd0aXRsZSc7XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5zY3JvbGwgJiYgKCBsLnggPiAodGhpcy5zYSt0aGlzLnNiLXRoaXMuc3MpKSApIHJldHVybiAnc2Nyb2xsJztcclxuICAgICAgICAgICAgICAgIGlmKGwueCA+IHRoaXMuc2EpIHJldHVybiB0aGlzLnRlc3RJdGVtcyggbC55LXRoaXMuYmFzZUggKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiggbC55IDwgdGhpcy5iYXNlSCsyICkgcmV0dXJuICd0aXRsZSc7XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5pc09wZW4gKXtcclxuICAgICAgICAgICAgICAgICAgICBpZiggdGhpcy5zY3JvbGwgJiYgKCBsLnggPiAodGhpcy5zYSt0aGlzLnNiLXRoaXMuc3MpKSApIHJldHVybiAnc2Nyb2xsJztcclxuICAgICAgICAgICAgICAgICAgICBpZihsLnggPiB0aGlzLnNhKSByZXR1cm4gdGhpcy50ZXN0SXRlbXMoIGwueS10aGlzLmJhc2VIICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gJyc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3RJdGVtcyAoIHkgKSB7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gJyc7XHJcblxyXG4gICAgICAgIGxldCBpdGVtcyA9IHRoaXMuaXRlbXNcclxuXHJcbiAgICAgICAgLyppZih0aGlzLmhpZGVDdXJyZW50KXtcclxuICAgICAgICAgICAgLy9pdGVtcyA9IFsuLi50aGlzLml0ZW1zXVxyXG4gICAgICAgICAgICBpdGVtcyA9IHRoaXMuaXRlbXMuc2xpY2UodGhpcy50bXBJZClcclxuXHJcbiAgICAgICAgfSovXHJcblxyXG4gICAgICAgIGxldCBpID0gaXRlbXMubGVuZ3RoLCBpdGVtLCBhLCBiO1xyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgICAgIGl0ZW0gPSBpdGVtc1tpXTtcclxuICAgICAgICAgICAgYSA9IGl0ZW0ucG9zeSArIHRoaXMudG9wTGlzdDtcclxuICAgICAgICAgICAgYiA9IGl0ZW0ucG9zeSArIHRoaXMuaXRlbUhlaWdodCArIDEgKyB0aGlzLnRvcExpc3Q7XHJcbiAgICAgICAgICAgIGlmKCB5ID49IGEgJiYgeSA8PSBiICl7IFxyXG4gICAgICAgICAgICAgICAgbmFtZSA9ICdpdGVtJyArIGk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVJdGVtKDApXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBpdGVtO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlSXRlbSgxKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5hbWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbmFtZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZUl0ZW0gKCBtb2RlICkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuY3VycmVudCApIHJldHVyblxyXG5cclxuICAgICAgICBpZiggdGhpcy5jdXJyZW50LnNlbGVjdCAmJiBtb2RlPT09MCkgbW9kZSA9IDJcclxuICAgICAgICBsZXQgY2MgPSB0aGlzLmNvbG9yc1xyXG5cclxuICAgICAgICBzd2l0Y2goIG1vZGUgKXtcclxuXHJcbiAgICAgICAgICAgIGNhc2UgMDogLy8gYmFzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50LnN0eWxlLmJhY2tncm91bmQgPSBjYy5iYWNrXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQuc3R5bGUuY29sb3IgPSBjYy50ZXh0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQuc3R5bGUuYmFja2dyb3VuZCA9IGNjLm92ZXJcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudC5zdHlsZS5jb2xvciA9IGNjLnRleHRPdmVyO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiAvLyBlZGl0IC8gZG93blxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50LnN0eWxlLmJhY2tncm91bmQgPSBjYy5zZWxlY3RcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudC5zdHlsZS5jb2xvciA9IGNjLnRleHRTZWxlY3Q7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdW5TZWxlY3RlZCgpIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmN1cnJlbnQgKSByZXR1cm5cclxuICAgICAgICB0aGlzLm1vZGVJdGVtKDApXHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbFxyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZWxlY3RlZCgpIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmN1cnJlbnQgKSByZXR1cm5cclxuICAgICAgICB0aGlzLnJlc2V0SXRlbXMoKVxyXG4gICAgICAgIHRoaXMubW9kZUl0ZW0oMilcclxuICAgICAgICB0aGlzLmN1cnJlbnQuc2VsZWN0ID0gdHJ1ZVxyXG5cclxuICAgICAgICBcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXRJdGVtcygpIHtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLml0ZW1zLmxlbmd0aFxyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgICAgIHRoaXMuaXRlbXNbaV0uc2VsZWN0ID0gZmFsc2VcclxuICAgICAgICAgICAgdGhpcy5pdGVtc1tpXS5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuYmFjaztcclxuICAgICAgICAgICAgdGhpcy5pdGVtc1tpXS5zdHlsZS5jb2xvciA9IHRoaXMuY29sb3JzLnRleHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBoaWRlQWN0aXZlKCkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaGlkZUN1cnJlbnQgKSByZXR1cm5cclxuICAgICAgICAvL2lmKCAhdGhpcy5jdXJyZW50ICkgcmV0dXJuXHJcbiAgICAgICAgaWYoIHRoaXMuY3VycmVudCApdGhpcy50bXBJZCA9IHRoaXMuY3VycmVudC5pZFxyXG4gICAgICAgIHRoaXMucmVzZXRIaWRlKClcclxuICAgICAgICAvL3RoaXMuaXRlbXNbdGhpcy50bXBJZF0uc3R5bGUuaGVpZ2h0ID0gMCsncHgnXHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXRIaWRlKCkge1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnRtcElkKVxyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMuaXRlbXMubGVuZ3RoXHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgaWYoaT09PXRoaXMudG1wSWQpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtc1tpXS5zdHlsZS5oZWlnaHQgPSAwKydweCdcclxuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXNbaV0ucG9zeSA9IC0xO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtc1tpXS5zdHlsZS5oZWlnaHQgPSB0aGlzLml0ZW1IZWlnaHQrJ3B4J1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtc1tpXS5wb3N5ID0gKHRoaXMuaXRlbUhlaWdodCsxKSooaS0xKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL3RoaXMuaXRlbXNbaV0uc3R5bGUuZGlzcGxheSA9ICdmbGV4J1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLyp0aGlzLml0ZW1zW2ldLnNlbGVjdCA9IGZhbHNlXHJcbiAgICAgICAgICAgIHRoaXMuaXRlbXNbaV0uc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmJhY2s7XHJcbiAgICAgICAgICAgIHRoaXMuaXRlbXNbaV0uc3R5bGUuY29sb3IgPSB0aGlzLmNvbG9ycy50ZXh0OyovXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCAhbmFtZSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICdzY3JvbGwnICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiggbmFtZSA9PT0gJ3RpdGxlJyApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tb2RlVGl0bGUoMilcclxuICAgICAgICAgICAgaWYoICF0aGlzLmxpc3RPbmx5ICl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGVBY3RpdmUoKVxyXG4gICAgICAgICAgICAgICAgaWYoICF0aGlzLmlzT3BlbiApIHRoaXMub3BlbigpXHJcbiAgICAgICAgICAgICAgICBlbHNlIHRoaXMuY2xvc2UoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gaXMgaXRlbVxyXG4gICAgICAgICAgICBpZiggdGhpcy5jdXJyZW50ICl7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubGlzdFsgdGhpcy5jdXJyZW50LmlkIF1cclxuICAgICAgICAgICAgICAgIC8vdGhpcy50bXBJZCA9IHRoaXMuY3VycmVudC5pZFxyXG5cclxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmlzU2VsZWN0YWJsZSApIHRoaXMuc2VsZWN0ZWQoKVxyXG5cclxuICAgICAgICAgICAgICAgIC8vdGhpcy5zZW5kKCB0aGlzLnJlZk9iamVjdCAhPT0gbnVsbCA/IHRoaXMucmVmT2JqZWN0WyB0aGlzLmxpc3RbdGhpcy5jdXJyZW50LmlkXV0gOiB0aGlzLnZhbHVlICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmQoIHRoaXMudmFsdWUgKVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKCAhdGhpcy5saXN0T25seSApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFRvcEl0ZW0oKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcy5oaWRlQWN0aXZlKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbnVwID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCAhbmFtZSApIHJldHVybiBudXA7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAndGl0bGUnICl7XHJcbiAgICAgICAgICAgIHRoaXMudW5TZWxlY3RlZCgpO1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVUaXRsZSgxKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmKCBuYW1lID09PSAnc2Nyb2xsJyApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3MtcmVzaXplJyk7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZVNjcm9sbCgxKTtcclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVTY3JvbGwoMik7XHJcbiAgICAgICAgICAgICAgICAvL3RoaXMudXBkYXRlKCAoIGUuY2xpZW50WSAtIHRvcCAgKSAtICggdGhpcy5zaCowLjUgKSApO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRvcCA9IHRoaXMuem9uZS55K3RoaXMuYmFzZUgtMjtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlKCAoIGUuY2xpZW50WSAtIHRvcCAgKSAtICggdGhpcy5zaCowLjUgKSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vaWYodGhpcy5pc0Rvd24pIHRoaXMubGlzdG1vdmUoZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGlzIGl0ZW1cclxuICAgICAgICAgICAgdGhpcy5tb2RlVGl0bGUoMCk7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZVNjcm9sbCgwKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBuYW1lICE9PSB0aGlzLnByZXZOYW1lICkgbnVwID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnByZXZOYW1lID0gbmFtZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG51cDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgd2hlZWwgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuICAgICAgICBpZiggbmFtZSA9PT0gJ3RpdGxlJyApIHJldHVybiBmYWxzZTsgXHJcbiAgICAgICAgdGhpcy5weSArPSBlLmRlbHRhKjEwO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKHRoaXMucHkpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMucHJldk5hbWUgPSAnJztcclxuICAgICAgICB0aGlzLnVuU2VsZWN0ZWQoKTtcclxuICAgICAgICB0aGlzLm1vZGVUaXRsZSgwKTtcclxuICAgICAgICB0aGlzLm1vZGVTY3JvbGwoMCk7XHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2coJ3RoaXMgaXMgcmVzZXQnKVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG1vZGVTY3JvbGwgKCBtb2RlICkge1xyXG5cclxuICAgICAgICBpZiggbW9kZSA9PT0gdGhpcy5zTW9kZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnNjcm9sbGVyLnN0eWxlO1xyXG4gICAgICAgIGxldCBjYyA9IHRoaXMuY29sb3JzXHJcblxyXG4gICAgICAgIHN3aXRjaChtb2RlKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgICBzLmJhY2tncm91bmQgPSBjYy50ZXh0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICBzLmJhY2tncm91bmQgPSBjYy5zZWxlY3Q7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IC8vIGVkaXQgLyBkb3duXHJcbiAgICAgICAgICAgICAgICBzLmJhY2tncm91bmQgPSBjYy5zZWxlY3Q7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc01vZGUgPSBtb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIG1vZGVUaXRsZSAoIG1vZGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCBtb2RlID09PSB0aGlzLnRNb2RlICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBsZXQgY2MgPSB0aGlzLmNvbG9yc1xyXG5cclxuICAgICAgICBzd2l0Y2gobW9kZSl7XHJcbiAgICAgICAgICAgIGNhc2UgMDogLy8gYmFzZVxyXG4gICAgICAgICAgICAgICAgc1szXS5jb2xvciA9IGNjLnRleHQ7XHJcbiAgICAgICAgICAgICAgICBzWzNdLmJhY2tncm91bmQgPSBjYy5idXR0b247XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIHNbM10uY29sb3IgPSBjYy50ZXh0T3ZlcjtcclxuICAgICAgICAgICAgICAgIHNbM10uYmFja2dyb3VuZCA9IGNjLm92ZXJvZmY7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IC8vIGVkaXQgLyBkb3duXHJcbiAgICAgICAgICAgICAgICBzWzNdLmNvbG9yID0gY2MudGV4dFNlbGVjdDtcclxuICAgICAgICAgICAgICAgIHNbM10uYmFja2dyb3VuZCA9IGNjLm92ZXJvZmY7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudE1vZGUgPSBtb2RlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBjbGVhckxpc3QgKCkge1xyXG5cclxuICAgICAgICB3aGlsZSAoIHRoaXMubGlzdEluLmNoaWxkcmVuLmxlbmd0aCApIHRoaXMubGlzdEluLnJlbW92ZUNoaWxkKCB0aGlzLmxpc3RJbi5sYXN0Q2hpbGQgKTtcclxuICAgICAgICB0aGlzLml0ZW1zID0gW107XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldExpc3QgKCBsaXN0ICkge1xyXG5cclxuICAgICAgICB0aGlzLmNsZWFyTGlzdCgpO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3QgPSBsaXN0O1xyXG4gICAgICAgIHRoaXMubGVuZ3RoID0gdGhpcy5saXN0Lmxlbmd0aDtcclxuXHJcbiAgICAgICAgbGV0IGxuZyA9IHRoaXMuaGlkZUN1cnJlbnQ/IHRoaXMubGVuZ3RoLTEgOiB0aGlzLmxlbmd0aFxyXG5cclxuICAgICAgICB0aGlzLm1heEl0ZW0gPSB0aGlzLmZ1bGwgPyBsbmcgOiA1O1xyXG4gICAgICAgIHRoaXMubWF4SXRlbSA9IGxuZyA8IHRoaXMubWF4SXRlbSA/IGxuZyA6IHRoaXMubWF4SXRlbTtcclxuXHJcbiAgICAgICAgdGhpcy5tYXhIZWlnaHQgPSB0aGlzLm1heEl0ZW0gKiAodGhpcy5pdGVtSGVpZ2h0KzEpICsgMjtcclxuICAgICAgICBcclxuXHJcblxyXG4gICAgICAgIHRoaXMubWF4ID0gbG5nICogKHRoaXMuaXRlbUhlaWdodCsxKSArIDI7XHJcbiAgICAgICAgdGhpcy5yYXRpbyA9IHRoaXMubWF4SGVpZ2h0IC8gdGhpcy5tYXg7XHJcbiAgICAgICAgdGhpcy5zaCA9IHRoaXMubWF4SGVpZ2h0ICogdGhpcy5yYXRpbztcclxuICAgICAgICB0aGlzLnJhbmdlID0gdGhpcy5tYXhIZWlnaHQgLSB0aGlzLnNoO1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0uc3R5bGUuaGVpZ2h0ID0gdGhpcy5tYXhIZWlnaHQgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsZXJCYWNrLnN0eWxlLmhlaWdodCA9IHRoaXMubWF4SGVpZ2h0ICsgJ3B4JztcclxuICAgICAgICB0aGlzLnNjcm9sbGVyLnN0eWxlLmhlaWdodCA9IHRoaXMuc2ggKyAncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5tYXggPiB0aGlzLm1heEhlaWdodCApeyBcclxuICAgICAgICAgICAgdGhpcy53dyA9IHRoaXMuc2IgLSB0aGlzLnNzO1xyXG4gICAgICAgICAgICB0aGlzLnNjcm9sbCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdGhpcy5taW5pQ2FudmFzICkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy50bXBDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxyXG4gICAgICAgICAgICB0aGlzLnRtcENhbnZhcy53aWR0aCA9IHRoaXMuaW1hZ2VTaXplWzBdXHJcbiAgICAgICAgICAgIHRoaXMudG1wQ2FudmFzLmhlaWdodCA9IHRoaXMuaW1hZ2VTaXplWzFdXHJcbiAgICAgICAgICAgIHRoaXMudG1wQ3R4ID0gdGhpcy50bXBDYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpXHJcbiAgICAgICAgICAgIHRoaXMudG1wQ3R4LmZpbGxTdHlsZSA9IHRoaXMuY2FudmFzQmdcclxuICAgICAgICAgICAgdGhpcy50bXBDdHguZmlsbFJlY3QoMCwgMCwgdGhpcy5pbWFnZVNpemVbMF0sIHRoaXMuaW1hZ2VTaXplWzFdKVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBpdGVtLCBuOy8vLCBsID0gdGhpcy5zYjtcclxuICAgICAgICBmb3IoIGxldCBpPTA7IGk8dGhpcy5sZW5ndGg7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgbiA9IHRoaXMubGlzdFtpXTtcclxuICAgICAgICAgICAgaXRlbSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuaXRlbSArICdwYWRkaW5nOjBweCAnKyh0aGlzLm0rMSkrJ3B4OyB3aWR0aDonK3RoaXMud3crJ3B4OyBoZWlnaHQ6Jyt0aGlzLml0ZW1IZWlnaHQrJ3B4OyBsaW5lLWhlaWdodDonKyh0aGlzLml0ZW1IZWlnaHQtMikrJ3B4OyBjb2xvcjonK3RoaXMuY29sb3JzLnRleHQrJzsgYmFja2dyb3VuZDonK3RoaXMuY29sb3JzLmJhY2srJzsnICk7XHJcbiAgICAgICAgICAgIGl0ZW0ubmFtZSA9ICdpdGVtJysgaVxyXG4gICAgICAgICAgICBpdGVtLmlkID0gaTtcclxuICAgICAgICAgICAgaXRlbS5zZWxlY3QgPSBmYWxzZVxyXG4gICAgICAgICAgICBpdGVtLnBvc3kgPSAodGhpcy5pdGVtSGVpZ2h0KzEpKmk7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdEluLmFwcGVuZENoaWxkKCBpdGVtICk7XHJcbiAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaCggaXRlbSApO1xyXG5cclxuICAgICAgICAgICAgaWYoIG4gPT09IHRoaXMudmFsdWUgKSB0aGlzLmN1cnJlbnQgPSBpdGVtXHJcblxyXG4gICAgICAgICAgICAvL2lmKCB0aGlzLmlzV2l0aEltYWdlICkgaXRlbS5hcHBlbmRDaGlsZCggdGhpcy50bXBJbWFnZVtuXSApO1xyXG4gICAgICAgICAgICBpZiggIXRoaXMuaXNXaXRoSW1hZ2UgKSBpdGVtLnRleHRDb250ZW50ID0gbjtcclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLm1pbmlDYW52YXMgKXtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgYyA9IG5ldyBJbWFnZSgpXHJcbiAgICAgICAgICAgICAgICBjLnNyYyA9IHRoaXMudG1wQ2FudmFzLnRvRGF0YVVSTCgpXHJcblxyXG4gICAgICAgICAgICAgICAgLy9pdGVtLnN0eWxlLm1hcmdpbkxlZnQgPSAodGhpcy5pbWFnZVNpemVbMF0rOCkrJ3B4J1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAvKmxldCBjID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcclxuXHJcbiAgICAgICAgICAgICAgICBjLndpZHRoID0gdGhpcy5pbWFnZVNpemVbMF1cclxuICAgICAgICAgICAgICAgIGMuaGVpZ2h0ID0gdGhpcy5pbWFnZVNpemVbMV1cclxuICAgICAgICAgICAgICAgIGxldCBjdHggPSBjLmdldENvbnRleHQoXCIyZFwiKVxyXG4gICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuY2FudmFzQmdcclxuICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLmltYWdlU2l6ZVswXSwgdGhpcy5pbWFnZVNpemVbMV0pKi9cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy9jLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246cmVsYXRpdmU7IHBvaW50ZXItZXZlbnRzOm5vbmU7IGRpc3BsYXk6aW5saW5lLWJsb2NrOyBmbG9hdDpsZWZ0OyBtYXJnaW4tbGVmdDowcHg7IG1hcmdpbi1yaWdodDo1cHg7IHRvcDoycHgnXHJcbiAgICAgICAgICAgICAgIC8vIGMuc3R5bGUuY3NzVGV4dCA9JyBmbGV4LXNocmluazogMDsnXHJcblxyXG4gICAgICAgICAgICAgICAgYy5zdHlsZS5jc3NUZXh0ID0nbWFyZ2luLXJpZ2h0OjRweDsnXHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vYy5zdHlsZS5jc3NUZXh0ID0gJ2Rpc3BsYXk6ZmxleDsgYWxpZ24tY29udGVudDogZmxleC1zdGFydDsgZmxleC13cmFwOiB3cmFwOydcclxuICAgICAgICAgICAgICAgIC8vaXRlbS5zdHlsZS5mbG9hdCA9ICdyaWdodCdcclxuICAgICAgICAgICAgICAgIGl0ZW0uYXBwZW5kQ2hpbGQoIGMgKVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMudG1wSW1hZ2Vbbl0gPSBjXHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiggdGhpcy5kcmFnb3V0ICl7XHJcblxyXG4gICAgICAgICAgICAgICAgaXRlbS5pbWcgPSB0aGlzLnRtcEltYWdlW25dXHJcblxyXG4gICAgICAgICAgICAgICAgaXRlbS5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ2F1dG8nO1xyXG4gICAgICAgICAgICAgICAgaXRlbS5kcmFnZ2FibGUgPSBcInRydWVcIlxyXG5cclxuICAgICAgICAgICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgdGhpcy5kcmFnc3RhcnQgfHwgZnVuY3Rpb24oKXsgLypjb25zb2xlLmxvZygnZHJhZyBzdGFydCcpKi99KVxyXG4gICAgICAgICAgICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdkcmFnJywgdGhpcy5kcmFnIHx8IGZ1bmN0aW9uKCl7IC8qY29uc29sZS5sb2coJ2RyYWcgc3RhcnQnKSovfSlcclxuICAgICAgICAgICAgICAgIC8vaXRlbS5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgLy9pdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdkcmFnbGVhdmUnLCBmdW5jdGlvbigpeyBSb290cy5mYWtlVXAoKTsgfSApO1xyXG4gICAgICAgICAgICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdkcmFnZW5kJywgdGhpcy5kcmFnZW5kIHx8IGZ1bmN0aW9uKCl7IC8qY29uc29sZS5sb2coJ2RyYWcgZW5kJykqLyB9LmJpbmQodGhpcykgKVxyXG4gICAgICAgICAgICAgICAgLy9pdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCBmdW5jdGlvbigpe2NvbnNvbGUubG9nKCdkcm9wJyl9KVxyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VG9wSXRlbSgpO1xyXG4gICAgICAgIGlmKCB0aGlzLmlzU2VsZWN0YWJsZSApIHRoaXMuc2VsZWN0ZWQoKVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGRyYXdJbWFnZSggbmFtZSwgaW1hZ2UsIHgseSx3LGggKXtcclxuXHJcbiAgICAgICAgdGhpcy50bXBDdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuaW1hZ2VTaXplWzBdLCB0aGlzLmltYWdlU2l6ZVsxXSk7XHJcbiAgICAgICAgdGhpcy50bXBDdHguZHJhd0ltYWdlKGltYWdlLCB4LCB5LCB3LCBoLCAwLCAwLCB0aGlzLmltYWdlU2l6ZVswXSwgdGhpcy5pbWFnZVNpemVbMV0pXHJcbiAgICAgICAgdGhpcy50bXBJbWFnZVtuYW1lXS5zcmMgPSB0aGlzLnRtcENhbnZhcy50b0RhdGFVUkwoKVxyXG5cclxuXHJcbiAgICAgICAgLypsZXQgYyA9IHRoaXMudG1wSW1hZ2VbbmFtZV1cclxuICAgICAgICBsZXQgY3R4ID0gYy5nZXRDb250ZXh0KFwiMmRcIilcclxuICAgICAgICBjdHguZHJhd0ltYWdlKGltYWdlLCB4LCB5LCB3LCBoLCAwLCAwLCB0aGlzLmltYWdlU2l6ZVswXSwgdGhpcy5pbWFnZVNpemVbMV0pKi9cclxuXHJcbiAgICB9XHJcblxyXG4gICAgYWRkSW1hZ2VzICgpe1xyXG4gICAgICAgIGxldCBsbmcgPSB0aGlzLmxpc3QubGVuZ3RoO1xyXG4gICAgICAgIGZvciggbGV0IGk9MDsgaTxsbmc7IGkrKyApe1xyXG4gICAgICAgICAgICB0aGlzLml0ZW1zW2ldLmFwcGVuZENoaWxkKCB0aGlzLnRtcEltYWdlW3RoaXMubGlzdFtpXV0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZXRUb3BJdGVtKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VmFsdWUgKCB2YWx1ZSApIHtcclxuXHJcbiAgICAgICAgaWYoIWlzTmFOKHZhbHVlKSkgdGhpcy52YWx1ZSA9IHRoaXMubGlzdFsgdmFsdWUgXTtcclxuICAgICAgICBlbHNlIHRoaXMudmFsdWUgPSB2YWx1ZTtcclxuXHJcbiAgICAgICAgLy90aGlzLnRtcElkID0gdmFsdWVcclxuXHJcbiAgICAgICAgdGhpcy5zZXRUb3BJdGVtKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldFRvcEl0ZW0gKCl7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnN0YXRpY1RvcCApIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNXaXRoSW1hZ2UgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCF0aGlzLnByZUxvYWRDb21wbGV0ZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGlmKCF0aGlzLmNbM10uY2hpbGRyZW4ubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuaW1hZ2VTaXplWzBdXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmltYWdlU2l6ZVsxXVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUuY3NzVGV4dCA9J21hcmdpbi1yaWdodDo0cHg7J1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNbM10uc3R5bGUudGV4dEFsaWduID0gJ2xlZnQnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNbM10uc3R5bGUuanVzdGlmeUNvbnRlbnQgPSAnbGVmdCdcclxuICAgICAgICAgICAgICAgIHRoaXMuY1szXS5hcHBlbmRDaGlsZCggdGhpcy5jYW52YXMgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGltZyA9IHRoaXMudG1wSW1hZ2VbIHRoaXMudmFsdWUgXTtcclxuICAgICAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKCB0aGlzLnRtcEltYWdlWyB0aGlzLnZhbHVlIF0sIDAsIDAsIHRoaXMuaW1hZ2VTaXplWzJdLCB0aGlzLmltYWdlU2l6ZVszXSwgMCwwLCB0aGlzLmltYWdlU2l6ZVswXSwgdGhpcy5pbWFnZVNpemVbMV0gKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgdGhpcy5jWzNdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMubWluaUNhbnZhcyApe1xyXG5cclxuICAgICAgICAgICAgaWYoIXRoaXMuY1szXS5jaGlsZHJlbi5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5pbWFnZVNpemVbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmltYWdlU2l6ZVsxXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmNzc1RleHQgPSdtYXJnaW4tcmlnaHQ6NHB4OydcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNbM10uc3R5bGUudGV4dEFsaWduID0gJ2xlZnQnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNbM10uc3R5bGUuanVzdGlmeUNvbnRlbnQgPSAnbGVmdCdcclxuICAgICAgICAgICAgICAgIHRoaXMuY1szXS5hcHBlbmRDaGlsZCggdGhpcy5jYW52YXMgKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UoIHRoaXMudG1wSW1hZ2VbIHRoaXMudmFsdWUgXSwgMCwgMCApO1xyXG5cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gLS0tLS0gTElTVFxyXG5cclxuICAgIHVwZGF0ZSAoIHkgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5zY3JvbGwgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHkgPSB5IDwgMCA/IDAgOiB5O1xyXG4gICAgICAgIHkgPSB5ID4gdGhpcy5yYW5nZSA/IHRoaXMucmFuZ2UgOiB5O1xyXG5cclxuICAgICAgICB0aGlzLnRvcExpc3QgPSAtTWF0aC5mbG9vciggeSAvIHRoaXMucmF0aW8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0SW4uc3R5bGUudG9wID0gdGhpcy50b3BMaXN0KydweCc7XHJcbiAgICAgICAgdGhpcy5zY3JvbGxlci5zdHlsZS50b3AgPSBNYXRoLmZsb29yKCB5ICkgICsgJ3B4JztcclxuXHJcbiAgICAgICAgdGhpcy5weSA9IHk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHBhcmVudEhlaWdodCAoIHQgKSB7XHJcblxyXG4gICAgICAgIGlmICggdGhpcy5ncm91cCAhPT0gbnVsbCApIHRoaXMuZ3JvdXAuY2FsYyggdCApO1xyXG4gICAgICAgIGVsc2UgaWYgKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggdCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBvcGVuICggZmlyc3QgKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLm9wZW4oKTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGUoIDAgKVxyXG5cclxuICAgICAgICB0aGlzLmggPSB0aGlzLm1heEhlaWdodCArIHRoaXMuYmFzZUggKyA1O1xyXG4gICAgICAgIGlmKCAhdGhpcy5zY3JvbGwgKXtcclxuICAgICAgICAgICAgdGhpcy50b3BMaXN0ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5oID0gdGhpcy5iYXNlSCArIDUgKyB0aGlzLm1heDtcclxuICAgICAgICAgICAgdGhpcy5zY3JvbGxlci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICB0aGlzLnNjcm9sbGVyQmFjay5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsZXJCYWNrLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuICAgICAgICB0aGlzLnNbMl0uZGlzcGxheSA9ICdibG9jayc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnVwICl7IFxyXG4gICAgICAgICAgICB0aGlzLnpvbmUueSAtPSB0aGlzLmggLSAodGhpcy5iYXNlSC0xMCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbNF0sICdkJywgdGhpcy5zdmdzLmcxICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1s0XSwgJ2QnLCB0aGlzLnN2Z3MuZzIgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuclNpemVDb250ZW50KCk7XHJcblxyXG4gICAgICAgIGxldCB0ID0gdGhpcy5oIC0gdGhpcy5iYXNlSDtcclxuXHJcbiAgICAgICAgdGhpcy56b25lLmggPSB0aGlzLmg7XHJcblxyXG4gICAgICAgIGlmKCFmaXJzdCkgdGhpcy5wYXJlbnRIZWlnaHQoIHQgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5jbG9zZSgpO1xyXG5cclxuICAgICAgICBpZiggdGhpcy51cCApIHRoaXMuem9uZS55ICs9IHRoaXMuaCAtICh0aGlzLmJhc2VILTEwKTtcclxuXHJcbiAgICAgICAgbGV0IHQgPSB0aGlzLmggLSB0aGlzLmJhc2VIO1xyXG5cclxuICAgICAgICB0aGlzLmggPSB0aGlzLmJhc2VIO1xyXG4gICAgICAgIHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbNF0sICdkJywgdGhpcy5zdmdzLmcxICk7XHJcblxyXG4gICAgICAgIHRoaXMuem9uZS5oID0gdGhpcy5oO1xyXG5cclxuICAgICAgICB0aGlzLnBhcmVudEhlaWdodCggLXQgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS1cclxuXHJcbiAgICB0ZXh0ICggdHh0ICkge1xyXG5cclxuICAgICAgICB0aGlzLmNbM10udGV4dENvbnRlbnQgPSB0eHQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplQ29udGVudCAoKSB7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoaS0tKSB0aGlzLmxpc3RJbi5jaGlsZHJlbltpXS5zdHlsZS53aWR0aCA9IHRoaXMud3cgKyAncHgnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKClcclxuXHJcbiAgICAgICAgLy9Qcm90by5wcm90b3R5cGUuclNpemUuY2FsbCggdGhpcyApO1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBsZXQgdyA9IHRoaXMuc2I7XHJcbiAgICAgICAgbGV0IGQgPSB0aGlzLnNhO1xyXG5cclxuICAgICAgICBpZihzWzJdPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBzWzJdLndpZHRoID0gdyArICdweCc7XHJcbiAgICAgICAgc1syXS5sZWZ0ID0gZCArJ3B4JztcclxuXHJcbiAgICAgICAgc1szXS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgICAgIHNbM10ubGVmdCA9IGQgKyAncHgnO1xyXG5cclxuICAgICAgICBzWzRdLmxlZnQgPSBkICsgdyAtIDE1ICsgJ3B4JztcclxuXHJcbiAgICAgICAgdGhpcy53dyA9IHc7XHJcbiAgICAgICAgaWYoIHRoaXMubWF4ID4gdGhpcy5tYXhIZWlnaHQgKSB0aGlzLnd3ID0gdy10aGlzLnNzO1xyXG4gICAgICAgIGlmKHRoaXMuaXNPcGVuKSB0aGlzLnJTaXplQ29udGVudCgpO1xyXG5cclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8uanMnO1xyXG5pbXBvcnQgeyBUb29scyB9IGZyb20gJy4uL2NvcmUvVG9vbHMuanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE51bWVyaWMgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKVxyXG5cclxuICAgICAgICB0aGlzLnNldFR5cGVOdW1iZXIoIG8gKVxyXG5cclxuICAgICAgICB0aGlzLmFsbHdheSA9IG8uYWxsd2F5IHx8IGZhbHNlXHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2VcclxuICAgICAgICB0aGlzLnZhbHVlID0gWzBdXHJcbiAgICAgICAgdGhpcy5tdWx0eSA9IDFcclxuICAgICAgICB0aGlzLmludm11bHR5ID0gMVxyXG4gICAgICAgIHRoaXMuaXNTaW5nbGUgPSB0cnVlXHJcbiAgICAgICAgdGhpcy5pc0FuZ2xlID0gZmFsc2VcclxuICAgICAgICB0aGlzLmlzVmVjdG9yID0gZmFsc2VcclxuXHJcbiAgICAgICAgaWYoIG8uaXNBbmdsZSApe1xyXG4gICAgICAgICAgICB0aGlzLmlzQW5nbGUgPSB0cnVlXHJcbiAgICAgICAgICAgIHRoaXMubXVsdHkgPSBUb29scy50b3JhZFxyXG4gICAgICAgICAgICB0aGlzLmludm11bHR5ID0gVG9vbHMudG9kZWdcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaXNEcmFnID0gby5kcmFnIHx8IGZhbHNlXHJcblxyXG4gICAgICAgIGlmKCBvLnZhbHVlICE9PSB1bmRlZmluZWQgKXtcclxuICAgICAgICAgICAgaWYoICFpc05hTihvLnZhbHVlKSApe1xyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFtvLnZhbHVlXVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYoIG8udmFsdWUgaW5zdGFuY2VvZiBBcnJheSApeyBcclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSBvLnZhbHVlXHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2luZ2xlID0gZmFsc2VcclxuICAgICAgICAgICAgfSBlbHNlIGlmKCBvLnZhbHVlIGluc3RhbmNlb2YgT2JqZWN0ICl7IFxyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFtdXHJcbiAgICAgICAgICAgICAgICBpZiggby52YWx1ZS54ICE9PSB1bmRlZmluZWQgKSB0aGlzLnZhbHVlWzBdID0gby52YWx1ZS54XHJcbiAgICAgICAgICAgICAgICBpZiggby52YWx1ZS55ICE9PSB1bmRlZmluZWQgKSB0aGlzLnZhbHVlWzFdID0gby52YWx1ZS55XHJcbiAgICAgICAgICAgICAgICBpZiggby52YWx1ZS56ICE9PSB1bmRlZmluZWQgKSB0aGlzLnZhbHVlWzJdID0gby52YWx1ZS56XHJcbiAgICAgICAgICAgICAgICBpZiggby52YWx1ZS53ICE9PSB1bmRlZmluZWQgKSB0aGlzLnZhbHVlWzNdID0gby52YWx1ZS53XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2luZ2xlID0gZmFsc2VcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNWZWN0b3IgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubG5nID0gdGhpcy52YWx1ZS5sZW5ndGhcclxuICAgICAgICB0aGlzLnRtcCA9IFtdXHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IC0xXHJcbiAgICAgICAgdGhpcy5wcmV2ID0geyB4OjAsIHk6MCwgZDowLCB2OjAgfVxyXG5cclxuICAgICAgICBsZXQgY2MgPSB0aGlzLmNvbG9yc1xyXG5cclxuICAgICAgICAvLyBiZ1xyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnIGJhY2tncm91bmQ6JyArIGNjLnNlbGVjdCArICc7IHRvcDo0cHg7IHdpZHRoOjBweDsgaGVpZ2h0OicgKyAodGhpcy5oLTgpICsgJ3B4OycgKVxyXG5cclxuICAgICAgICB0aGlzLmNNb2RlID0gW11cclxuICAgICAgICBcclxuICAgICAgICBsZXQgaSA9IHRoaXMubG5nXHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmlzQW5nbGUgKSB0aGlzLnZhbHVlW2ldID0gKHRoaXMudmFsdWVbaV0gKiAxODAgLyBNYXRoLlBJKS50b0ZpeGVkKCB0aGlzLnByZWNpc2lvbiApXHJcbiAgICAgICAgICAgIHRoaXMuY1szK2ldID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAndG9wOjFweDsgaGVpZ2h0OicrKHRoaXMuaC0yKSsncHg7IGNvbG9yOicgKyBjYy50ZXh0ICsgJzsgYmFja2dyb3VuZDonICsgY2MuYmFjayArICc7IGJvcmRlckNvbG9yOicgKyBjYy5ib3JkZXIrJzsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsnKVxyXG4gICAgICAgICAgICBpZihvLmNlbnRlcikgdGhpcy5jWzIraV0uc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcidcclxuICAgICAgICAgICAgdGhpcy5jWzMraV0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlW2ldXHJcbiAgICAgICAgICAgIHRoaXMuY1szK2ldLnN0eWxlLmNvbG9yID0gdGhpcy5jb2xvcnMudGV4dFxyXG4gICAgICAgICAgICB0aGlzLmNbMytpXS5pc051bSA9IHRydWVcclxuICAgICAgICAgICAgdGhpcy5jTW9kZVtpXSA9IDBcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzZWxlY3Rpb25cclxuICAgICAgICB0aGlzLnNlbGVjdElkID0gMyArIHRoaXMubG5nO1xyXG4gICAgICAgIHRoaXMuY1t0aGlzLnNlbGVjdElkXSA9IHRoaXMuZG9tKCAgJ2RpdicsIHRoaXMuY3NzLnR4dHNlbGVjdCArICdwb3NpdGlvbjphYnNvbHV0ZTsgdG9wOjJweDsgaGVpZ2h0OicgKyAodGhpcy5oLTQpICsgJ3B4OyBwYWRkaW5nOjBweCAwcHg7IHdpZHRoOjBweDsgY29sb3I6JyArIGNjLnRleHRTZWxlY3QgKyAnOyBiYWNrZ3JvdW5kOicgKyBjYy5zZWxlY3QgKyAnOyBib3JkZXI6bm9uZTsgYm9yZGVyLXJhZGl1czowcHg7Jyk7XHJcblxyXG4gICAgICAgIC8vIGN1cnNvclxyXG4gICAgICAgIHRoaXMuY3Vyc29ySWQgPSA0ICsgdGhpcy5sbmc7XHJcbiAgICAgICAgdGhpcy5jWyB0aGlzLmN1cnNvcklkIF0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3RvcDoycHg7IGhlaWdodDonICsgKHRoaXMuaC00KSArICdweDsgd2lkdGg6MHB4OyBiYWNrZ3JvdW5kOicrY2MudGV4dCsnOycgKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGVzdFpvbmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbCA9IHRoaXMubG9jYWxcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnXHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmdcclxuICAgICAgICBsZXQgdCA9IHRoaXMudG1wXHJcblxyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuICAgICAgICAgICAgaWYoIGwueD50W2ldWzBdICYmIGwueDx0W2ldWzJdICkgcmV0dXJuIGlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAnJ1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApXHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlXHJcbiAgICAgICAgICAgIGlmKCBuYW1lICE9PSAnJyApeyBcclxuICAgICAgICAgICAgXHR0aGlzLmN1cnJlbnQgPSBuYW1lXHJcbiAgICAgICAgICAgIFx0dGhpcy5wcmV2ID0geyB4OmUuY2xpZW50WCwgeTplLmNsaWVudFksIGQ6MCwgdjogdGhpcy5pc1NpbmdsZSA/IHBhcnNlRmxvYXQodGhpcy52YWx1ZSkgOiBwYXJzZUZsb2F0KCB0aGlzLnZhbHVlWyB0aGlzLmN1cnJlbnQgXSApIH1cclxuICAgICAgICAgICAgXHR0aGlzLnNldElucHV0KCB0aGlzLmNbIDMgKyB0aGlzLmN1cnJlbnQgXSApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlIClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuXHJcbiAgICBcdGlmKCB0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZVxyXG4gICAgICAgICAgICB0aGlzLnByZXYgPSB7IHg6MCwgeTowLCBkOjAsIHY6MCB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBudXAgPSBmYWxzZVxyXG4gICAgICAgIGxldCB4ID0gMFxyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKVxyXG5cclxuICAgICAgICBpZiggbmFtZSA9PT0gJycgKSB0aGlzLmN1cnNvcigpXHJcbiAgICAgICAgZWxzZXsgXHJcbiAgICAgICAgXHRpZighdGhpcy5pc0RyYWcpIHRoaXMuY3Vyc29yKCd0ZXh0Jyk7XHJcbiAgICAgICAgXHRlbHNlIHRoaXMuY3Vyc29yKCB0aGlzLmN1cnJlbnQgIT09IC0xID8gJ21vdmUnIDogJ3BvaW50ZXInICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEcmFnICl7XHJcblxyXG4gICAgICAgIFx0aWYoIHRoaXMuY3VycmVudCAhPT0gLTEgKXtcclxuXHJcbiAgICAgICAgICAgIFx0dGhpcy5wcmV2LmQgKz0gKCBlLmNsaWVudFggLSB0aGlzLnByZXYueCApIC0gKCBlLmNsaWVudFkgLSB0aGlzLnByZXYueSApXHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG4gPSB0aGlzLnByZXYudiArICggdGhpcy5wcmV2LmQgKiB0aGlzLnN0ZXApXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZVsgdGhpcy5jdXJyZW50IF0gPSB0aGlzLm51bVZhbHVlKG4pXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNbIDMgKyB0aGlzLmN1cnJlbnQgXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWVbdGhpcy5jdXJyZW50XVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGUoKVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucHJldi54ID0gZS5jbGllbnRYXHJcbiAgICAgICAgICAgICAgICB0aGlzLnByZXYueSA9IGUuY2xpZW50WVxyXG5cclxuICAgICAgICAgICAgICAgIG51cCA9IHRydWVcclxuICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgXHRpZiggdGhpcy5pc0Rvd24gKSB4ID0gZS5jbGllbnRYIC0gdGhpcy56b25lLnggLTNcclxuICAgICAgICBcdGlmKCB0aGlzLmN1cnJlbnQgIT09IC0xICkgeCAtPSB0aGlzLnRtcFt0aGlzLmN1cnJlbnRdWzBdXHJcbiAgICAgICAgXHRyZXR1cm4gdGhpcy51cElucHV0KCB4LCB0aGlzLmlzRG93biApXHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51cFxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICBsZXQgbnVwID0gZmFsc2VcclxuICAgICAgICByZXR1cm4gbnVwXHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBzZXRWYWx1ZSAoIHYgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzVmVjdG9yICl7XHJcbiAgICAgICAgICAgIGlmKCB2LnggIT09IHVuZGVmaW5lZCApIHRoaXMudmFsdWVbMF0gPSB2LnhcclxuICAgICAgICAgICAgaWYoIHYueSAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVsxXSA9IHYueVxyXG4gICAgICAgICAgICBpZiggdi56ICE9PSB1bmRlZmluZWQgKSB0aGlzLnZhbHVlWzJdID0gdi56XHJcbiAgICAgICAgICAgIGlmKCB2LncgIT09IHVuZGVmaW5lZCApIHRoaXMudmFsdWVbM10gPSB2LndcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5pc1NpbmdsZSA/IFt2XSA6IHYgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGUoKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBzYW1lU3RyICggc3RyICl7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy52YWx1ZS5sZW5ndGhcclxuICAgICAgICB3aGlsZShpLS0pIHRoaXMuY1sgMyArIGkgXS50ZXh0Q29udGVudCA9IHN0clxyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCB1cCApIHtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLnZhbHVlLmxlbmd0aFxyXG5cclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICAgdGhpcy52YWx1ZVtpXSA9IHRoaXMubnVtVmFsdWUoIHRoaXMudmFsdWVbaV0gKiB0aGlzLmludm11bHR5IClcclxuICAgICAgICAgICAgIHRoaXMuY1sgMyArIGkgXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWVbaV1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB1cCApIHRoaXMuc2VuZCgpXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNlbmQgKCB2ICkge1xyXG5cclxuICAgICAgICB2ID0gdiB8fCB0aGlzLnZhbHVlXHJcblxyXG4gICAgICAgIHRoaXMuaXNTZW5kID0gdHJ1ZVxyXG5cclxuICAgICAgICBpZiggdGhpcy5vYmplY3RMaW5rICE9PSBudWxsICl7IFxyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNWZWN0b3IgKXtcclxuICAgICAgICAgICAgICAgIHRoaXMub2JqZWN0TGlua1sgdGhpcy5vYmplY3RLZXkgXS5mcm9tQXJyYXkoIHYgKVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vYmplY3RMaW5rWyB0aGlzLm9iamVjdEtleSBdID0gdlxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY2FsbGJhY2sgKSB0aGlzLmNhbGxiYWNrKCB2LCB0aGlzLm9iamVjdEtleSApXHJcbiAgICAgICAgdGhpcy5pc1NlbmQgPSBmYWxzZVxyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBJTlBVVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHNlbGVjdCAoIGMsIGUsIHcsIHQgKSB7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zXHJcbiAgICAgICAgbGV0IGQgPSB0aGlzLmN1cnJlbnQgIT09IC0xID8gdGhpcy50bXBbdGhpcy5jdXJyZW50XVswXSArIDUgOiAwXHJcbiAgICAgICAgc1t0aGlzLmN1cnNvcklkXS53aWR0aCA9ICcxcHgnXHJcbiAgICAgICAgc1t0aGlzLmN1cnNvcklkXS5sZWZ0ID0gKCBkICsgYyApICsgJ3B4J1xyXG4gICAgICAgIHNbdGhpcy5zZWxlY3RJZF0ubGVmdCA9ICAoIGQgKyBlICkgICsgJ3B4J1xyXG4gICAgICAgIHNbdGhpcy5zZWxlY3RJZF0ud2lkdGggPSAgdyAgKyAncHgnXHJcbiAgICAgICAgdGhpcy5jW3RoaXMuc2VsZWN0SWRdLmlubmVySFRNTCA9IHRcclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHVuc2VsZWN0ICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnNcclxuICAgICAgICBpZighcykgcmV0dXJuXHJcbiAgICAgICAgdGhpcy5jW3RoaXMuc2VsZWN0SWRdLmlubmVySFRNTCA9ICcnXHJcbiAgICAgICAgc1t0aGlzLnNlbGVjdElkXS53aWR0aCA9IDAgKyAncHgnXHJcbiAgICAgICAgc1t0aGlzLmN1cnNvcklkXS53aWR0aCA9IDAgKyAncHgnXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHZhbGlkYXRlICggZm9yY2UgKSB7XHJcblxyXG4gICAgICAgIGxldCBhciA9IFtdXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZ1xyXG5cclxuICAgICAgICBpZiggdGhpcy5hbGx3YXkgKSBmb3JjZSA9IHRydWVcclxuXHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICBcdGlmKCFpc05hTiggdGhpcy5jWyAzICsgaSBdLnRleHRDb250ZW50ICkpeyBcclxuICAgICAgICAgICAgICAgIGxldCBueCA9IHRoaXMubnVtVmFsdWUoIHRoaXMuY1sgMyArIGkgXS50ZXh0Q29udGVudCApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jWyAzICsgaSBdLnRleHRDb250ZW50ID0gbnhcclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWVbaV0gPSBueFxyXG4gICAgICAgICAgICB9IGVsc2UgeyAvLyBub3QgbnVtYmVyXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNbIDMgKyBpIF0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlW2ldXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgXHRhcltpXSA9IHRoaXMudmFsdWVbaV0gKiB0aGlzLm11bHR5XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggIWZvcmNlICkgcmV0dXJuXHJcbiAgICAgICAgdGhpcy5zZW5kKCB0aGlzLmlzU2luZ2xlID8gYXJbMF0gOiBhciApXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgUkVaSVNFXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpXHJcbiAgICAgICAgbGV0IHN4ID0gdGhpcy5jb2xvcnMuc3hcclxuICAgICAgICBsZXQgc3MgPSBzeCAqICh0aGlzLmxuZy0xKVxyXG4gICAgICAgIGxldCB3ID0gKHRoaXMuc2Itc3MpIC8gdGhpcy5sbmcvLygoIHRoaXMuc2IgKyBzeCApIC8gdGhpcy5sbmcgKS1zeFxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZ1xyXG5cclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICAvL3RoaXMudG1wW2ldID0gWyBNYXRoLmZsb29yKCB0aGlzLnNhICsgKCB3ICogaSApKyggNSAqIGkgKSksIHcgXTtcclxuICAgICAgICAgICAgdGhpcy50bXBbaV0gPSBbICggdGhpcy5zYSArICggdyAqIGkgKSsoIHN4ICogaSApKSwgdyBdXHJcbiAgICAgICAgICAgIHRoaXMudG1wW2ldWzJdID0gdGhpcy50bXBbaV1bMF0gKyB0aGlzLnRtcFtpXVsxXVxyXG4gICAgICAgICAgICBzWyAzICsgaSBdLmxlZnQgPSB0aGlzLnRtcFtpXVswXSArICdweCdcclxuICAgICAgICAgICAgc1sgMyArIGkgXS53aWR0aCA9IHRoaXMudG1wW2ldWzFdICsgJ3B4J1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tIFwiLi4vY29yZS9Qcm90by5qc1wiO1xyXG5pbXBvcnQgeyBUb29scyB9IGZyb20gXCIuLi9jb3JlL1Rvb2xzLmpzXCI7XHJcblxyXG5mdW5jdGlvbiBlYXNlKHgsIG1pbiwgbWF4LCBwb3dlcikge1xyXG4gIGxldCBuID0gbWluICsgTWF0aC5wb3coKHggLSBtaW4pIC8gKG1heCAtIG1pbiksIHBvd2VyKSAqIChtYXggLSBtaW4pO1xyXG4gIHJldHVybiBuO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2xpZGUgZXh0ZW5kcyBQcm90byB7XHJcbiAgY29uc3RydWN0b3IobyA9IHt9KSB7XHJcbiAgICBzdXBlcihvKTtcclxuXHJcbiAgICBpZiAoby5lYXNpbmcgPD0gMCkgdGhyb3cgXCJFYXNpbmcgbXVzdCBiZSA+IDBcIjtcclxuICAgIHRoaXMuZWFzaW5nID0gby5lYXNpbmcgfHwgMTtcclxuXHJcbiAgICB0aGlzLnNldFR5cGVOdW1iZXIobyk7XHJcblxyXG4gICAgdGhpcy5tb2RlbCA9IG8uc3R5cGUgfHwgMDtcclxuICAgIGlmIChvLm1vZGUgIT09IHVuZGVmaW5lZCkgdGhpcy5tb2RlbCA9IG8ubW9kZTtcclxuXHJcbiAgICAvL3RoaXMuZGVmYXVsdEJvcmRlckNvbG9yID0gdGhpcy5jb2xvcnMuaGlkZTtcclxuXHJcbiAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc092ZXIgPSBmYWxzZTtcclxuICAgIHRoaXMuYWxsd2F5ID0gby5hbGx3YXkgfHwgZmFsc2U7XHJcblxyXG4gICAgdGhpcy5pc0RlZyA9IG8uaXNEZWcgfHwgZmFsc2U7XHJcbiAgICB0aGlzLmlzQ3ljbGljID0gby5jeWNsaWMgfHwgZmFsc2U7XHJcblxyXG4gICAgdGhpcy5maXJzdEltcHV0ID0gZmFsc2U7XHJcblxyXG4gICAgbGV0IGNjID0gdGhpcy5jb2xvcnM7XHJcblxyXG4gICAgLy90aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dHNlbGVjdCArICdsZXR0ZXItc3BhY2luZzotMXB4OyB0ZXh0LWFsaWduOnJpZ2h0OyB3aWR0aDo0N3B4OyBib3JkZXI6MXB4IGRhc2hlZCAnK3RoaXMuZGVmYXVsdEJvcmRlckNvbG9yKyc7IGNvbG9yOicrIHRoaXMuY29sb3JzLnRleHQgKTtcclxuICAgIC8vdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAndGV4dC1hbGlnbjpyaWdodDsgd2lkdGg6NDdweDsgYm9yZGVyOjFweCBkYXNoZWQgJyt0aGlzLmRlZmF1bHRCb3JkZXJDb2xvcisnOyBjb2xvcjonKyB0aGlzLmNvbG9ycy50ZXh0ICk7XHJcbiAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbShcclxuICAgICAgXCJkaXZcIixcclxuICAgICAgdGhpcy5jc3MudHh0c2VsZWN0ICtcclxuICAgICAgICBcImJvcmRlcjpub25lOyBiYWNrZ3JvdW5kOm5vbmU7IHdpZHRoOjQ3cHg7IGNvbG9yOlwiICtcclxuICAgICAgICBjYy50ZXh0ICtcclxuICAgICAgICBcIjtcIlxyXG4gICAgKTtcclxuICAgIC8vdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAnbGV0dGVyLXNwYWNpbmc6LTFweDsgdGV4dC1hbGlnbjpyaWdodDsgd2lkdGg6NDdweDsgY29sb3I6JysgdGhpcy5jb2xvcnMudGV4dCApO1xyXG4gICAgdGhpcy5jWzNdID0gdGhpcy5kb20oXHJcbiAgICAgIFwiZGl2XCIsXHJcbiAgICAgIHRoaXMuY3NzLmJhc2ljICsgXCIgdG9wOjA7IGhlaWdodDpcIiArIHRoaXMuaCArIFwicHg7XCJcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5jWzRdID0gdGhpcy5kb20oXHJcbiAgICAgIFwiZGl2XCIsXHJcbiAgICAgIHRoaXMuY3NzLmJhc2ljICtcclxuICAgICAgICBcImJhY2tncm91bmQ6XCIgK1xyXG4gICAgICAgIGNjLmJhY2sgK1xyXG4gICAgICAgIFwiOyB0b3A6MnB4OyBoZWlnaHQ6XCIgK1xyXG4gICAgICAgICh0aGlzLmggLSA0KSArXHJcbiAgICAgICAgXCJweDtcIlxyXG4gICAgKTtcclxuICAgIHRoaXMuY1s1XSA9IHRoaXMuZG9tKFxyXG4gICAgICBcImRpdlwiLFxyXG4gICAgICB0aGlzLmNzcy5iYXNpYyArXHJcbiAgICAgICAgXCJsZWZ0OjRweDsgdG9wOjVweDsgaGVpZ2h0OlwiICtcclxuICAgICAgICAodGhpcy5oIC0gMTApICtcclxuICAgICAgICBcInB4OyBiYWNrZ3JvdW5kOlwiICtcclxuICAgICAgICBjYy50ZXh0ICtcclxuICAgICAgICBcIjtcIlxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLmNbMl0uaXNOdW0gPSB0cnVlO1xyXG4gICAgLy90aGlzLmNbMl0uc3R5bGUuaGVpZ2h0ID0gKHRoaXMuaC00KSArICdweCc7XHJcbiAgICAvL3RoaXMuY1syXS5zdHlsZS5saW5lSGVpZ2h0ID0gKHRoaXMuaC04KSArICdweCc7XHJcbiAgICB0aGlzLmNbMl0uc3R5bGUuaGVpZ2h0ID0gdGhpcy5oIC0gMiArIFwicHhcIjtcclxuICAgIHRoaXMuY1syXS5zdHlsZS5saW5lSGVpZ2h0ID0gdGhpcy5oIC0gMTAgKyBcInB4XCI7XHJcblxyXG4gICAgaWYgKHRoaXMubW9kZWwgIT09IDApIHtcclxuICAgICAgbGV0IHIxID0gNCxcclxuICAgICAgICBoMSA9IDQsXHJcbiAgICAgICAgaDIgPSA4LFxyXG4gICAgICAgIHd3ID0gdGhpcy5oIC0gNixcclxuICAgICAgICByYSA9IDE2O1xyXG5cclxuICAgICAgaWYgKHRoaXMubW9kZWwgPT09IDIpIHtcclxuICAgICAgICByMSA9IDA7XHJcbiAgICAgICAgaDEgPSAyO1xyXG4gICAgICAgIGgyID0gNDtcclxuICAgICAgICByYSA9IDI7XHJcbiAgICAgICAgd3cgPSAodGhpcy5oIC0gNikgKiAwLjU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh0aGlzLm1vZGVsID09PSAzKSB0aGlzLmNbNV0uc3R5bGUudmlzaWJsZSA9IFwibm9uZVwiO1xyXG5cclxuICAgICAgdGhpcy5jWzRdLnN0eWxlLmJvcmRlclJhZGl1cyA9IHIxICsgXCJweFwiO1xyXG4gICAgICB0aGlzLmNbNF0uc3R5bGUuaGVpZ2h0ID0gaDIgKyBcInB4XCI7XHJcbiAgICAgIHRoaXMuY1s0XS5zdHlsZS50b3AgPSB0aGlzLmggKiAwLjUgLSBoMSArIFwicHhcIjtcclxuICAgICAgdGhpcy5jWzVdLnN0eWxlLmJvcmRlclJhZGl1cyA9IHIxICogMC41ICsgXCJweFwiO1xyXG4gICAgICB0aGlzLmNbNV0uc3R5bGUuaGVpZ2h0ID0gaDEgKyBcInB4XCI7XHJcbiAgICAgIHRoaXMuY1s1XS5zdHlsZS50b3AgPSB0aGlzLmggKiAwLjUgLSBoMSAqIDAuNSArIFwicHhcIjtcclxuXHJcbiAgICAgIC8vdGhpcy5jWzZdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICdib3JkZXItcmFkaXVzOicrcmErJ3B4OyBtYXJnaW4tbGVmdDonKygtd3cqMC41KSsncHg7IGJvcmRlcjoxcHggc29saWQgJytjYy5ib3JkZXIrJzsgYmFja2dyb3VuZDonK2NjLmJ1dHRvbisnOyBsZWZ0OjRweDsgdG9wOjJweDsgaGVpZ2h0OicrKHRoaXMuaC00KSsncHg7IHdpZHRoOicrd3crJ3B4OycgKTtcclxuICAgICAgdGhpcy5jWzZdID0gdGhpcy5kb20oXHJcbiAgICAgICAgXCJkaXZcIixcclxuICAgICAgICB0aGlzLmNzcy5iYXNpYyArXHJcbiAgICAgICAgICBcImJvcmRlci1yYWRpdXM6XCIgK1xyXG4gICAgICAgICAgcmEgK1xyXG4gICAgICAgICAgXCJweDsgbWFyZ2luLWxlZnQ6XCIgK1xyXG4gICAgICAgICAgLXd3ICogMC41ICtcclxuICAgICAgICAgIFwicHg7IGJhY2tncm91bmQ6XCIgK1xyXG4gICAgICAgICAgY2MudGV4dCArXHJcbiAgICAgICAgICBcIjsgbGVmdDo0cHg7IHRvcDozcHg7IGhlaWdodDpcIiArXHJcbiAgICAgICAgICAodGhpcy5oIC0gNikgK1xyXG4gICAgICAgICAgXCJweDsgd2lkdGg6XCIgK1xyXG4gICAgICAgICAgd3cgK1xyXG4gICAgICAgICAgXCJweDtcIlxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaW5pdCgpO1xyXG4gIH1cclxuXHJcbiAgdGVzdFpvbmUoZSkge1xyXG4gICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgaWYgKGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSkgcmV0dXJuIFwiXCI7XHJcblxyXG4gICAgaWYgKGwueCA+PSB0aGlzLnR4bCkgcmV0dXJuIFwidGV4dFwiO1xyXG4gICAgZWxzZSBpZiAobC54ID49IHRoaXMuc2EpIHJldHVybiBcInNjcm9sbFwiO1xyXG4gICAgZWxzZSByZXR1cm4gXCJcIjtcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyAgIEVWRU5UU1xyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgbW91c2V1cChlKSB7XHJcbiAgICBpZiAodGhpcy5pc0Rvd24pIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBtb3VzZWRvd24oZSkge1xyXG4gICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKGUpO1xyXG5cclxuICAgIGlmICghbmFtZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIGlmIChuYW1lID09PSBcInNjcm9sbFwiKSB7XHJcbiAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgdGhpcy5vbGQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICB0aGlzLm1vdXNlbW92ZShlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKmlmKCBuYW1lID09PSAndGV4dCcgKXtcclxuICAgICAgICAgICAgdGhpcy5zZXRJbnB1dCggdGhpcy5jWzJdLCBmdW5jdGlvbigpeyB0aGlzLnZhbGlkYXRlKCkgfS5iaW5kKHRoaXMpICk7XHJcbiAgICAgICAgfSovXHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICBtb3VzZW1vdmUoZSkge1xyXG4gICAgbGV0IG51cCA9IGZhbHNlO1xyXG5cclxuICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZShlKTtcclxuXHJcbiAgICBpZiAobmFtZSA9PT0gXCJzY3JvbGxcIikge1xyXG4gICAgICB0aGlzLm1vZGUoMSk7XHJcbiAgICAgIHRoaXMuY3Vyc29yKFwidy1yZXNpemVcIik7XHJcbiAgICAgIC8vfSBlbHNlIGlmKG5hbWUgPT09ICd0ZXh0Jyl7XHJcbiAgICAgIC8vdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuY3Vyc29yKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuaXNEb3duKSB7XHJcbiAgICAgIGxldCBuTm9ybWFsaXplZCA9IChlLmNsaWVudFggLSAodGhpcy56b25lLnggKyB0aGlzLnNhKSAtIDMpIC8gdGhpcy53dztcclxuXHJcbiAgICAgIC8vIGxvIG1hcGVvIGFsIHJhbmdvIDAgLi4uIDFcclxuICAgICAgbk5vcm1hbGl6ZWQgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCBuTm9ybWFsaXplZCkpO1xyXG5cclxuICAgICAgLy8gYXBsaWNvIGVhc2luZ1xyXG4gICAgICBsZXQgbkVhc2VkID0gTWF0aC5wb3cobk5vcm1hbGl6ZWQsIHRoaXMuZWFzaW5nKTsgLy8gZWFzaW5nXHJcblxyXG4gICAgICBsZXQgbk5ldyA9IG5FYXNlZCAqIHRoaXMucmFuZ2UgKyB0aGlzLm1pbjtcclxuICAgICAgbGV0IG5OZXdTbGlkZXIgPSBuTm9ybWFsaXplZCAqIHRoaXMucmFuZ2UgKyB0aGlzLm1pbjtcclxuXHJcbiAgICAgIHRoaXMuc2xpZGVyVmFsdWUgPSB0aGlzLm51bVZhbHVlKG5OZXdTbGlkZXIpO1xyXG5cclxuICAgICAgbGV0IGRlbHRhID0gbk5ldyAtIHRoaXMub2xkO1xyXG5cclxuICAgICAgbGV0IHN0ZXBzO1xyXG4gICAgICBpZiAoZGVsdGEgPj0gdGhpcy5zdGVwIHx8IGRlbHRhIDw9IHRoaXMuc3RlcCkge1xyXG4gICAgICAgIHN0ZXBzID0gTWF0aC5mbG9vcihkZWx0YSAvIHRoaXMuc3RlcCk7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubnVtVmFsdWUodGhpcy5vbGQgKyBzdGVwcyAqIHRoaXMuc3RlcCk7XHJcbiAgICAgICAgLy8gdmFsdWUgd2l0aG91dCBlYXNpbmcgYXBwbGllZFxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZSh0cnVlKTtcclxuICAgICAgICB0aGlzLm9sZCA9IHRoaXMudmFsdWU7XHJcbiAgICAgIH1cclxuICAgICAgLy9jb25zb2xlLmxvZyhcIm4sIG5vcm1hbGl6ZWQsIHZhbHVlXCIsIG5OZXcsIG5Ob3JtYWxpemVkLCB0aGlzLnZhbHVlKTtcclxuICAgICAgbnVwID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbnVwO1xyXG4gIH1cclxuXHJcbiAgd2hlZWwoZSkge1xyXG4gICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKGUpO1xyXG5cclxuICAgIGlmIChuYW1lID09PSBcInNjcm9sbFwiKSB7XHJcbiAgICAgIGxldCB2ID0gdGhpcy52YWx1ZSAtIHRoaXMuc3RlcCAqIGUuZGVsdGE7XHJcblxyXG4gICAgICBpZiAodiA+IHRoaXMubWF4KSB7XHJcbiAgICAgICAgdiA9IHRoaXMuaXNDeWNsaWMgPyB0aGlzLm1pbiA6IHRoaXMubWF4O1xyXG4gICAgICB9IGVsc2UgaWYgKHYgPCB0aGlzLm1pbikge1xyXG4gICAgICAgIHYgPSB0aGlzLmlzQ3ljbGljID8gdGhpcy5tYXggOiB0aGlzLm1pbjtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5zZXRWYWx1ZSh2KTtcclxuICAgICAgdGhpcy5vbGQgPSB2O1xyXG4gICAgICB0aGlzLnVwZGF0ZSh0cnVlKTtcclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8va2V5ZG93bjogZnVuY3Rpb24gKCBlICkgeyByZXR1cm4gdHJ1ZTsgfSxcclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICB2YWxpZGF0ZSgpIHtcclxuICAgIGxldCBuID0gdGhpcy5jWzJdLnRleHRDb250ZW50O1xyXG5cclxuICAgIGlmICghaXNOYU4obikpIHtcclxuICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubnVtVmFsdWUobik7XHJcbiAgICAgIHRoaXMudXBkYXRlKHRydWUpO1xyXG4gICAgfSBlbHNlIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWUgKyAodGhpcy5pc0RlZyA/IFwiwrBcIiA6IFwiXCIpO1xyXG4gIH1cclxuXHJcbiAgcmVzZXQoKSB7XHJcbiAgICAvL3RoaXMuY2xlYXJJbnB1dCgpO1xyXG4gICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgIHRoaXMubW9kZSgwKTtcclxuICB9XHJcblxyXG4gIG1vZGUobW9kZSkge1xyXG4gICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICBsZXQgY2MgPSB0aGlzLmNvbG9ycztcclxuXHJcbiAgICBzd2l0Y2ggKG1vZGUpIHtcclxuICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgLy8gc1syXS5ib3JkZXIgPSAnMXB4IHNvbGlkICcgKyB0aGlzLmNvbG9ycy5oaWRlO1xyXG4gICAgICAgIHNbMl0uY29sb3IgPSBjYy50ZXh0O1xyXG4gICAgICAgIHNbNF0uYmFja2dyb3VuZCA9IGNjLmJhY2s7XHJcbiAgICAgICAgc1s1XS5iYWNrZ3JvdW5kID0gY2MudGV4dDtcclxuICAgICAgICBpZiAodGhpcy5tb2RlbCAhPT0gMCkgc1s2XS5iYWNrZ3JvdW5kID0gY2MudGV4dDsgLy9jYy5idXR0b247XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMTogLy8gc2Nyb2xsIG92ZXJcclxuICAgICAgICAvL3NbMl0uYm9yZGVyID0gJzFweCBkYXNoZWQgJyArIHRoaXMuY29sb3JzLmhpZGU7XHJcbiAgICAgICAgc1syXS5jb2xvciA9IGNjLnRleHRPdmVyO1xyXG4gICAgICAgIHNbNF0uYmFja2dyb3VuZCA9IGNjLmJhY2s7XHJcbiAgICAgICAgc1s1XS5iYWNrZ3JvdW5kID0gY2MudGV4dE92ZXI7XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwgIT09IDApIHNbNl0uYmFja2dyb3VuZCA9IGNjLnRleHRPdmVyOyAvL2NjLm92ZXJvZmY7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB1cGRhdGUodXApIHtcclxuICAgIGxldCBub3JtYWxpemVkID0gKHRoaXMudmFsdWUgLSB0aGlzLm1pbikgLyB0aGlzLnJhbmdlO1xyXG5cclxuICAgIGxldCB1bmVhc2VkID1cclxuICAgICAgdGhpcy5lYXNpbmcgPT0gMSA/IG5vcm1hbGl6ZWQgOiBNYXRoLnBvdyhub3JtYWxpemVkLCAxIC8gdGhpcy5lYXNpbmcpO1xyXG5cclxuICAgIGxldCB3dyA9IE1hdGguZmxvb3IodGhpcy53dyAqIHVuZWFzZWQpO1xyXG4gICAgLy9sZXQgd3cgPSBNYXRoLmZsb29yKHRoaXMud3cgKiAoKHRoaXMudmFsdWUgLSB0aGlzLm1pbikgLyB0aGlzLnJhbmdlKSk7XHJcblxyXG4gICAgaWYgKHRoaXMubW9kZWwgIT09IDMpIHRoaXMuc1s1XS53aWR0aCA9IHd3ICsgXCJweFwiO1xyXG4gICAgaWYgKHRoaXMuc1s2XSkgdGhpcy5zWzZdLmxlZnQgPSB0aGlzLnNhICsgd3cgKyAzICsgXCJweFwiO1xyXG4gICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZSArICh0aGlzLmlzRGVnID8gXCLCsFwiIDogXCJcIik7XHJcblxyXG4gICAgaWYgKHVwKSB0aGlzLnNlbmQoKTtcclxuICB9XHJcblxyXG4gIHJTaXplKCkge1xyXG4gICAgc3VwZXIuclNpemUoKTtcclxuXHJcbiAgICBsZXQgdyA9IHRoaXMuc2IgLSB0aGlzLnNjO1xyXG4gICAgdGhpcy53dyA9IHcgLSA2O1xyXG5cclxuICAgIGxldCB0eCA9IHRoaXMuc2M7XHJcbiAgICBpZiAodGhpcy5pc1VJIHx8ICF0aGlzLnNpbXBsZSkgdHggPSB0aGlzLnNjICsgMTA7XHJcbiAgICB0aGlzLnR4bCA9IHRoaXMudyAtIHR4ICsgMjtcclxuXHJcbiAgICAvL2xldCB0eSA9IE1hdGguZmxvb3IodGhpcy5oICogMC41KSAtIDg7XHJcblxyXG4gICAgbGV0IHMgPSB0aGlzLnM7XHJcblxyXG4gICAgc1syXS53aWR0aCA9IHRoaXMuc2MgLSA2ICsgXCJweFwiO1xyXG4gICAgc1syXS5sZWZ0ID0gdGhpcy50eGwgKyA0ICsgXCJweFwiO1xyXG4gICAgLy9zWzJdLnRvcCA9IHR5ICsgJ3B4JztcclxuICAgIHNbM10ubGVmdCA9IHRoaXMuc2EgKyBcInB4XCI7XHJcbiAgICBzWzNdLndpZHRoID0gdyArIFwicHhcIjtcclxuICAgIHNbNF0ubGVmdCA9IHRoaXMuc2EgKyBcInB4XCI7XHJcbiAgICBzWzRdLndpZHRoID0gdyArIFwicHhcIjtcclxuICAgIHNbNV0ubGVmdCA9IHRoaXMuc2EgKyAzICsgXCJweFwiO1xyXG5cclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90by5qcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgVGV4dElucHV0IGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMuY21vZGUgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gby52YWx1ZSAhPT0gdW5kZWZpbmVkID8gby52YWx1ZSA6ICcnO1xyXG4gICAgICAgIHRoaXMucGxhY2VIb2xkZXIgPSBvLnBsYWNlSG9sZGVyIHx8ICcnO1xyXG5cclxuICAgICAgICB0aGlzLmFsbHdheSA9IG8uYWxsd2F5IHx8IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZWRpdGFibGUgPSBvLmVkaXQgIT09IHVuZGVmaW5lZCA/IG8uZWRpdCA6IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBjYyA9IHRoaXMuY29sb3JzXHJcblxyXG4gICAgICAgIC8vIHRleHRcclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dHNlbGVjdCArICd0b3A6MXB4OyBoZWlnaHQ6JyArICh0aGlzLmgtMikgKyAncHg7IGNvbG9yOicgKyBjYy50ZXh0ICsgJzsgYmFja2dyb3VuZDonICsgY2MuYmFjayArICc7IGJvcmRlckNvbG9yOicgKyBjYy5ib3JkZXIrJzsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsnICk7XHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICAgICAgLy8gc2VsZWN0aW9uXHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ3Bvc2l0aW9uOmFic29sdXRlOyB0b3A6MnB4OyBoZWlnaHQ6JyArICh0aGlzLmgtNCkgKyAncHg7IHBhZGRpbmc6MHB4IDBweDsgd2lkdGg6MHB4OyBjb2xvcjonICsgY2MudGV4dFNlbGVjdCArICc7IGJhY2tncm91bmQ6JyArIGNjLnNlbGVjdCArICc7IGJvcmRlcjpub25lOyBib3JkZXItcmFkaXVzOjBweDsnKTtcclxuXHJcbiAgICAgICAgLy8gY3Vyc29yXHJcbiAgICAgICAgdGhpcy5jWzRdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICd0b3A6MnB4OyBoZWlnaHQ6JyArICh0aGlzLmgtNCkgKyAncHg7IHdpZHRoOjBweDsgYmFja2dyb3VuZDonK2NjLnRleHQrJzsnICk7XHJcblxyXG4gICAgICAgIC8vIGZha2VcclxuICAgICAgICB0aGlzLmNbNV0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dHNlbGVjdCArICd0b3A6MXB4OyBoZWlnaHQ6JyArICh0aGlzLmgtMikgKyAncHg7IGJvcmRlcjpub25lOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgZm9udC1zdHlsZTogaXRhbGljOyBjb2xvcjonK2NjLmJvcmRlcisnOycgKTtcclxuICAgICAgICBpZiggdGhpcy52YWx1ZSA9PT0gJycgKSB0aGlzLmNbNV0udGV4dENvbnRlbnQgPSB0aGlzLnBsYWNlSG9sZGVyO1xyXG5cclxuICAgICAgICBcclxuXHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXN0Wm9uZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG4gICAgICAgIGlmKCBsLnggPj0gdGhpcy5zYSApIHJldHVybiAndGV4dCc7XHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkge1xyXG5cclxuICAgICAgICBpZighdGhpcy5lZGl0YWJsZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCF0aGlzLmVkaXRhYmxlKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYoIG5hbWUgPT09ICd0ZXh0JyApIHRoaXMuc2V0SW5wdXQoIHRoaXMuY1syXSApO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuZWRpdGFibGUpIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIC8vbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIC8vaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApeyByZXR1cm47fVxyXG5cclxuICAgICAgICAvL2lmKCBsLnggPj0gdGhpcy5zYSApIHRoaXMuY3Vyc29yKCd0ZXh0Jyk7XHJcbiAgICAgICAgLy9lbHNlIHRoaXMuY3Vyc29yKCk7XHJcblxyXG4gICAgICAgIGxldCB4ID0gMDtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICd0ZXh0JyApIHRoaXMuY3Vyc29yKCd0ZXh0Jyk7XHJcbiAgICAgICAgZWxzZSB0aGlzLmN1cnNvcigpO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gKSB4ID0gZS5jbGllbnRYIC0gdGhpcy56b25lLng7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnVwSW5wdXQoIHggLSB0aGlzLnNhIC0zLCB0aGlzLmlzRG93biApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIElOUFVUXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc2VsZWN0ICggYywgZSwgdywgdCApIHtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgbGV0IGQgPSB0aGlzLnNhICsgNTtcclxuICAgICAgICBzWzRdLndpZHRoID0gJzFweCc7XHJcbiAgICAgICAgc1s0XS5sZWZ0ID0gKCBkICsgZSApICsgJ3B4JztcclxuXHJcbiAgICAgICAgc1szXS5sZWZ0ID0gICggZCArIGUgKSAgKyAncHgnO1xyXG4gICAgICAgIHNbM10ud2lkdGggPSAgdyAgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY1szXS5pbm5lckhUTUwgPSB0XHJcbiAgICBcclxuICAgIH1cclxuXHJcbiAgICB1bnNlbGVjdCAoKSB7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIGlmKCFzKSByZXR1cm47XHJcbiAgICAgICAgc1szXS53aWR0aCA9ICAwICArICdweCc7XHJcbiAgICAgICAgdGhpcy5jWzNdLmlubmVySFRNTCA9ICd0J1xyXG4gICAgICAgIHNbNF0ud2lkdGggPSAwICsgJ3B4JztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdmFsaWRhdGUgKCBmb3JjZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuYWxsd2F5ICkgZm9yY2UgPSB0cnVlOyBcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuY1syXS50ZXh0Q29udGVudDtcclxuXHJcbiAgICAgICAgaWYodGhpcy52YWx1ZSAhPT0gJycpIHRoaXMuY1s1XS50ZXh0Q29udGVudCA9ICcnO1xyXG4gICAgICAgIGVsc2UgdGhpcy5jWzVdLnRleHRDb250ZW50ID0gdGhpcy5wbGFjZUhvbGRlcjtcclxuXHJcbiAgICAgICAgaWYoICFmb3JjZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5zZW5kKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgUkVaSVNFXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBzWzJdLmxlZnQgPSB0aGlzLnNhICsgJ3B4JztcclxuICAgICAgICBzWzJdLndpZHRoID0gdGhpcy5zYiArICdweCc7XHJcblxyXG4gICAgICAgIHNbNV0ubGVmdCA9IHRoaXMuc2EgKyAncHgnO1xyXG4gICAgICAgIHNbNV0ud2lkdGggPSB0aGlzLnNiICsgJ3B4JztcclxuICAgICBcclxuICAgIH1cclxuXHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvLmpzJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgVGl0bGUgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgbGV0IHByZWZpeCA9IG8ucHJlZml4IHx8ICcnO1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICdqdXN0aWZ5LWNvbnRlbnQ6cmlnaHQ7IHdpZHRoOjYwcHg7IGxpbmUtaGVpZ2h0OicrICh0aGlzLmgtOCkgKyAncHg7IGNvbG9yOicgKyB0aGlzLmNvbG9ycy50ZXh0ICk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmggPT09IDMxICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5zWzFdLnRvcCA9IDggKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbMl0uc3R5bGUudG9wID0gOCArICdweCc7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIHNbMV0uanVzdGlmeUNvbnRlbnQgPSBvLmFsaWduIHx8ICdsZWZ0JztcclxuICAgICAgICAvL3NbMV0udGV4dEFsaWduID0gby5hbGlnbiB8fCAnbGVmdCc7XHJcbiAgICAgICAgc1sxXS5mb250V2VpZ2h0ID0gby5mb250V2VpZ2h0IHx8ICdib2xkJztcclxuXHJcblxyXG4gICAgICAgIHRoaXMuY1sxXS50ZXh0Q29udGVudCA9IHRoaXMudHh0LnN1YnN0cmluZygwLDEpLnRvVXBwZXJDYXNlKCkgKyB0aGlzLnR4dC5zdWJzdHJpbmcoMSkucmVwbGFjZShcIi1cIiwgXCIgXCIpO1xyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHByZWZpeDtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRleHQoIHR4dCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gdHh0O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXh0MiggdHh0ICkge1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0eHQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG4gICAgICAgIHRoaXMuc1sxXS53aWR0aCA9IHRoaXMudyArICdweCc7IC8vLSA1MCArICdweCc7XHJcbiAgICAgICAgdGhpcy5zWzJdLmxlZnQgPSB0aGlzLncgKyAncHgnOy8vLSAoIDUwICsgMjYgKSArICdweCc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldENvbG9yKCBjICkge1xyXG4gICAgICAgIHRoaXMuc1sxXS5jb2xvciA9IGNcclxuICAgICAgICB0aGlzLnNbMl0uY29sb3IgPSBjXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTZWxlY3QgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKVxyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gby52YWx1ZSB8fCAnJ1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2VcclxuICAgICAgICB0aGlzLm9uQWN0aWYgPSBvLm9uQWN0aWYgfHwgZnVuY3Rpb24oKXt9XHJcblxyXG4gICAgICAgIC8vbGV0IHByZWZpeCA9IG8ucHJlZml4IHx8ICcnO1xyXG4gICAgICAgIGNvbnN0IGNjID0gdGhpcy5jb2xvcnNcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyB0aGlzLmNzcy5idXR0b24gKyAnIHRvcDoxcHg7IGJhY2tncm91bmQ6JytjYy5idXR0b24rJzsgaGVpZ2h0OicrKHRoaXMuaC0yKSsncHg7IGJvcmRlcjonKyBjYy5idXR0b25Cb3JkZXIrJzsgYm9yZGVyLXJhZGl1czoxNXB4OyB3aWR0aDozMHB4OyBsZWZ0OjEwcHg7JyApXHJcbiAgICAgICAgLy90aGlzLmNbMl0uc3R5bGUuY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuXHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAnaGVpZ2h0OicgKyAodGhpcy5oLTQpICsgJ3B4OyBiYWNrZ3JvdW5kOicgKyBjYy5pbnB1dEJnICsgJzsgYm9yZGVyQ29sb3I6JyArIGNjLmlucHV0Qm9yZGVyKyc7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JyApXHJcbiAgICAgICAgdGhpcy5jWzNdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZVxyXG5cclxuICAgICAgICBsZXQgZmx0b3AgPSBNYXRoLmZsb29yKHRoaXMuaCowLjUpLTdcclxuICAgICAgICB0aGlzLmNbNF0gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6MTRweDsgaGVpZ2h0OjE0cHg7IGxlZnQ6NXB4OyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuc3Znc1sgJ2N1cnNvcicgXSwgZmlsbDpjYy50ZXh0LCBzdHJva2U6J25vbmUnfSlcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0ID0gMVxyXG4gICAgICAgIHRoaXMuaXNBY3RpZiA9IGZhbHNlXHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsXHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJ1xyXG4gICAgICAgIGlmKCBsLnggPiB0aGlzLnNhICYmIGwueCA8IHRoaXMuc2ErMzAgKSByZXR1cm4gJ292ZXInXHJcbiAgICAgICAgcmV0dXJuICcwJ1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkge1xyXG4gICAgXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIC8vdGhpcy52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlXHJcbiAgICAgICAgICAgIC8vdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlIClcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICkgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZVxyXG4gICAgICAgIC8vdGhpcy52YWx1ZSA9IHRoaXMudmFsdWVzWyBuYW1lLTIgXTtcclxuICAgICAgICAvL3RoaXMuc2VuZCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApXHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCB1cCA9IGZhbHNlXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlIClcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICdvdmVyJyApe1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG4gICAgICAgICAgICB1cCA9IHRoaXMubW9kZSggdGhpcy5pc0Rvd24gPyAzIDogMiApXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdXAgPSB0aGlzLnJlc2V0KClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB1cFxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgYXBwbHkgKCB2ICkge1xyXG5cclxuICAgICAgICB2ID0gdiB8fCAnJztcclxuXHJcbiAgICAgICAgaWYoIHYgIT09IHRoaXMudmFsdWUgKSB7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2O1xyXG4gICAgICAgICAgICB0aGlzLmNbM10udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLnNlbmQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCkge1xyXG5cclxuICAgICAgICB0aGlzLm1vZGUoIDMgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZSAoIG4gKSB7XHJcblxyXG4gICAgICAgIGxldCBjaGFuZ2UgPSBmYWxzZVxyXG4gICAgICAgIGxldCBjYyA9IHRoaXMuY29sb3JzXHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnN0YXQgIT09IG4gKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCBuPT09MSApIHRoaXMuaXNBY3RpZiA9IGZhbHNlOztcclxuXHJcbiAgICAgICAgICAgIGlmKCBuPT09MyApeyBcclxuICAgICAgICAgICAgICAgIGlmKCAhdGhpcy5pc0FjdGlmICl7IHRoaXMuaXNBY3RpZiA9IHRydWU7IG49NDsgdGhpcy5vbkFjdGlmKCB0aGlzICk7IH1cclxuICAgICAgICAgICAgICAgIGVsc2UgeyB0aGlzLmlzQWN0aWYgPSBmYWxzZTsgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiggbj09PTIgJiYgdGhpcy5pc0FjdGlmICkgbiA9IDQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnN0YXQgPSBuXHJcblxyXG4gICAgICAgICAgICBzd2l0Y2goIG4gKXtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHRoaXMuc1sgMiBdLmNvbG9yID0gY2MudGV4dDsgdGhpcy5zWyAyIF0uYmFja2dyb3VuZCA9IGNjLmJ1dHRvbjsgYnJlYWs7IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIGNhc2UgMjogdGhpcy5zWyAyIF0uY29sb3IgPSBjYy50ZXh0T3ZlcjsgdGhpcy5zWyAyIF0uYmFja2dyb3VuZCA9IGNjLm92ZXJvZmY7IGJyZWFrOyAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6IHRoaXMuc1sgMiBdLmNvbG9yID0gY2MudGV4dE92ZXI7IHRoaXMuc1sgMiBdLmJhY2tncm91bmQgPSBjYy5hY3Rpb247IGJyZWFrOyAvLyBkb3duXHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IHRoaXMuc1sgMiBdLmNvbG9yID0gY2MudGV4dFNlbGVjdDsgdGhpcy5zWyAyIF0uYmFja2dyb3VuZCA9IGNjLmFjdGlvbjsgYnJlYWs7IC8vIGFjdGlmXHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlXHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZVxyXG5cclxuXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlKCB0aGlzLmlzQWN0aWYgPyA0IDogMSApXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRleHQgKCB0eHQgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1szXS50ZXh0Q29udGVudCA9IHR4dFxyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKClcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnNcclxuICAgICAgICBzWzJdLmxlZnQgPSB0aGlzLnNhICsgJ3B4J1xyXG4gICAgICAgIHNbM10ubGVmdCA9ICh0aGlzLnNhICsgNDApICsgJ3B4J1xyXG4gICAgICAgIHNbM10ud2lkdGggPSAodGhpcy5zYiAtIDQwKSArICdweCdcclxuICAgICAgICBzWzRdLmxlZnQgPSAodGhpcy5zYSs4KSArICdweCdcclxuXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvLmpzJztcclxuaW1wb3J0IHsgRmlsZXMgfSBmcm9tICcuLi9jb3JlL0ZpbGVzLmpzJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgQml0bWFwIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvIClcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IG8udmFsdWUgfHwgJydcclxuICAgICAgICB0aGlzLnJlZlRleHR1cmUgPSBvLnRleHR1cmUgfHwgbnVsbDtcclxuICAgICAgICB0aGlzLmltZyA9IG51bGxcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZVxyXG4gICAgICAgIHRoaXMubmV2ZXJsb2NrID0gdHJ1ZVxyXG5cclxuXHJcblxyXG4gICAgICAgIGNvbnN0IGNjID0gdGhpcy5jb2xvcnNcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyB0aGlzLmNzcy5idXR0b24gKyAnIHRvcDoxcHg7IGJhY2tncm91bmQ6JytjYy5idXR0b24rJzsgaGVpZ2h0OicrKHRoaXMuaC0yKSsncHg7IGJvcmRlcjonK2NjLmJ1dHRvbkJvcmRlcisnOyBib3JkZXItcmFkaXVzOjE1cHg7IHdpZHRoOjMwcHg7IGxlZnQ6MTBweDsnIClcclxuXHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAnaGVpZ2h0OicgKyAodGhpcy5oLTQpICsgJ3B4OyBiYWNrZ3JvdW5kOicgKyBjYy5pbnB1dEJnICsgJzsgYm9yZGVyQ29sb3I6JyArIGNjLmlucHV0Qm9yZGVyKyc7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JyApXHJcbiAgICAgICAgdGhpcy5jWzNdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICAgICAgbGV0IGZsdG9wID0gTWF0aC5mbG9vcih0aGlzLmgqMC41KS03XHJcbiAgICAgICAgdGhpcy5jWzRdID0gdGhpcy5kb20oICdwYXRoJywgdGhpcy5jc3MuYmFzaWMgKyAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOjE0cHg7IGhlaWdodDoxNHB4OyBsZWZ0OjVweDsgdG9wOicrZmx0b3ArJ3B4OycsIHsgZDp0aGlzLnN2Z3NbICdsb2FkJyBdLCBmaWxsOmNjLnRleHQsIHN0cm9rZTonbm9uZSd9KVxyXG5cclxuICAgICAgICB0aGlzLnN0YXQgPSAxXHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcbiAgICAgICAgaWYoIGwueCA+IHRoaXMuc2EgJiYgbC54IDwgdGhpcy5zYSszMCApIHJldHVybiAnb3Zlcic7XHJcbiAgICAgICAgcmV0dXJuICcwJ1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkge1xyXG4gICAgXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIC8vdGhpcy52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvL3RoaXMuc2VuZCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCAhbmFtZSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICdvdmVyJyApe1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IHRydWVcclxuICAgICAgICAgICAgRmlsZXMubG9hZCggeyBjYWxsYmFjazp0aGlzLmNoYW5nZUJpdG1hcC5iaW5kKHRoaXMpIH0gKVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vdGhpcy52YWx1ZSA9IHRoaXMudmFsdWVzWyBuYW1lLTIgXTtcclxuICAgICAgICAvL3RoaXMuc2VuZCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgdXAgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAnb3ZlcicgKXtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuICAgICAgICAgICAgdXAgPSB0aGlzLm1vZGUoIHRoaXMuaXNEb3duID8gMyA6IDIgKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHVwID0gdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHVwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY2hhbmdlQml0bWFwKCBpbWcsIGZuYW1lICl7XHJcblxyXG4gICAgICAgIGlmKCBpbWcgKXtcclxuICAgICAgICAgICAgdGhpcy5pbWcgPSBpbWdcclxuICAgICAgICAgICAgdGhpcy5hcHBseSggZm5hbWUgKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW1nID0gbnVsbFxyXG4gICAgICAgICAgICB0aGlzLmFwcGx5KCAnbnVsbCcgKVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgYXBwbHkgKCB2ICkge1xyXG5cclxuICAgICAgICB2ID0gdiB8fCAnJztcclxuXHJcbiAgICAgICAgaWYoIHYgIT09IHRoaXMudmFsdWUgKSB7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2O1xyXG4gICAgICAgICAgICB0aGlzLmNbM10udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMuaW1nICE9PSBudWxsICl7XHJcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5vYmplY3RMaW5rICE9PSBudWxsICkgdGhpcy5vYmplY3RMaW5rWyB0aGlzLnZhbCBdID0gdlxyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuY2FsbGJhY2sgKSB0aGlzLmNhbGxiYWNrKCB0aGlzLnZhbHVlLCB0aGlzLmltZywgdGhpcy5uYW1lIClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCkge1xyXG5cclxuICAgICAgICB0aGlzLm1vZGUoIDMgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZSAoIG4gKSB7XHJcblxyXG4gICAgICAgIGxldCBjaGFuZ2UgPSBmYWxzZVxyXG4gICAgICAgIGxldCBjYyA9IHRoaXMuY29sb3JzXHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnN0YXQgIT09IG4gKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3RhdCA9IG5cclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCggbiApe1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMTogdGhpcy5zWyAyIF0uY29sb3IgPSBjYy50ZXh0OyB0aGlzLnNbIDIgXS5iYWNrZ3JvdW5kID0gY2MuYnV0dG9uOyBicmVhazsgLy8gYmFzZVxyXG4gICAgICAgICAgICAgICAgY2FzZSAyOiB0aGlzLnNbIDIgXS5jb2xvciA9IGNjLnRleHRPdmVyOyB0aGlzLnNbIDIgXS5iYWNrZ3JvdW5kID0gY2Mub3Zlcm9mZjsgYnJlYWs7IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIGNhc2UgMzogdGhpcy5zWyAyIF0uY29sb3IgPSBjYy50ZXh0T3ZlcjsgdGhpcy5zWyAyIF0uYmFja2dyb3VuZCA9IGNjLm92ZXI7IGJyZWFrOyAvLyBkb3duXHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IHRoaXMuc1sgMiBdLmNvbG9yID0gY2MudGV4dFNlbGVjdDsgdGhpcy5zWyAyIF0uYmFja2dyb3VuZCA9IGNjLnNlbGVjdDsgYnJlYWs7IC8vIGFjdGlmXHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjaGFuZ2U7XHJcblxyXG5cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGUoIHRoaXMuaXNBY3RpZiA/IDQgOiAxICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRleHQgKCB0eHQgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1szXS50ZXh0Q29udGVudCA9IHR4dDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBzWzJdLmxlZnQgPSB0aGlzLnNhICsgJ3B4JztcclxuICAgICAgICBzWzNdLmxlZnQgPSAodGhpcy5zYSArIDQwKSArICdweCc7XHJcbiAgICAgICAgc1szXS53aWR0aCA9ICh0aGlzLnNiIC0gNDApICsgJ3B4JztcclxuICAgICAgICBzWzRdLmxlZnQgPSAodGhpcy5zYSs4KSArICdweCc7XHJcblxyXG4gICAgfVxyXG5cclxufSIsIi8vaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvLmpzJztcclxuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi9CdXR0b24uanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFNlbGVjdG9yIGV4dGVuZHMgQnV0dG9uIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBpZiggby5zZWxlY3RhYmxlID09PSB1bmRlZmluZWQgKSBvLnNlbGVjdGFibGUgPSB0cnVlXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuICAgICBcclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8uanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEl0ZW0gZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5wID0gMTAwO1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLnR4dDtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IDE7XHJcblxyXG4gICAgICAgIHRoaXMuaXR5cGUgPSBvLml0eXBlIHx8ICdub25lJztcclxuICAgICAgICB0aGlzLnZhbCA9IHRoaXMuaXR5cGU7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JhcGggPSB0aGlzLnN2Z3NbIHRoaXMuaXR5cGUgXTtcclxuXHJcbiAgICAgICAgbGV0IGZsdG9wID0gTWF0aC5mbG9vcih0aGlzLmgqMC41KS03O1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6MTRweDsgaGVpZ2h0OjE0cHg7IGxlZnQ6NXB4OyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuZ3JhcGgsIGZpbGw6dGhpcy5jb2xvcnMudGV4dCwgc3Ryb2tlOidub25lJ30pO1xyXG5cclxuICAgICAgICB0aGlzLnNbMV0ubWFyZ2luTGVmdCA9IDIwICsgJ3B4JztcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuXHJcbiAgICAgICAgLy91cCA9IHRoaXMubW9kZXMoIHRoaXMuaXNEb3duID8gMyA6IDIsIG5hbWUgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5yZXNldEl0ZW0oKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCggdHJ1ZSApO1xyXG5cclxuICAgICAgICB0aGlzLnNlbmQoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVpb3V0ICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNTZWxlY3QgKSB0aGlzLm1vZGUoMyk7XHJcbiAgICAgICAgZWxzZSB0aGlzLm1vZGUoMSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVpb3ZlciAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzU2VsZWN0ICkgdGhpcy5tb2RlKDQpO1xyXG4gICAgICAgIGVsc2UgdGhpcy5tb2RlKDIpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCkge1xyXG4gICAgICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICAvKnJTaXplICgpIHtcclxuICAgICAgICBcclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG5cclxuICAgIH0qL1xyXG5cclxuICAgIG1vZGUgKCBuICkge1xyXG5cclxuICAgICAgICBsZXQgY2hhbmdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnN0YXR1cyAhPT0gbiApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zdGF0dXMgPSBuO1xyXG4gICAgICAgICAgICBsZXQgcyA9IHRoaXMucywgY2MgPSB0aGlzLmNvbG9yc1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICBzd2l0Y2goIG4gKXtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHRoaXMuc3RhdHVzID0gMTsgc1sxXS5jb2xvciA9IGNjLnRleHQ7IHNbMF0uYmFja2dyb3VuZCA9ICdub25lJzsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHRoaXMuc3RhdHVzID0gMjsgc1sxXS5jb2xvciA9IGNjLnRleHRPdmVyOyBzWzBdLmJhY2tncm91bmQgPSBjYy5iYWNrOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzogdGhpcy5zdGF0dXMgPSAzOyBzWzFdLmNvbG9yID0gY2MudGV4dFNlbGVjdDsgc1swXS5iYWNrZ3JvdW5kID0gY2Muc2VsZWN0OyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDogdGhpcy5zdGF0dXMgPSA0OyBzWzFdLmNvbG9yID0gY2MudGV4dE92ZXI7IHNbMF0uYmFja2dyb3VuZCA9IGNjLm92ZXI7IGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY2hhbmdlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcbiAgICAgICAvLyByZXR1cm4gdGhpcy5tb2RlKCAxICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNlbGVjdGVkICggYiApe1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1NlbGVjdCApIHRoaXMubW9kZSgxKTtcclxuXHJcbiAgICAgICAgdGhpcy5pc1NlbGVjdCA9IGIgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzU2VsZWN0ICkgdGhpcy5tb2RlKDMpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8uanMnXHJcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4vQnV0dG9uLmpzJ1xyXG5cclxuZXhwb3J0IGNsYXNzIEdyaWQgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgLyp0aGlzLnZhbHVlcyA9IG8udmFsdWVzIHx8IFtdO1xyXG5cclxuICAgICAgICBpZiggdHlwZW9mIHRoaXMudmFsdWVzID09PSAnc3RyaW5nJyApIHRoaXMudmFsdWVzID0gWyB0aGlzLnZhbHVlcyBdOyovXHJcblxyXG4gICAgICAgIHRoaXMudmFsdWVzID0gW107XHJcblxyXG4gICAgICAgIGlmKCBvLnZhbHVlcyApe1xyXG4gICAgICAgICAgICBpZiggby52YWx1ZXMgaW5zdGFuY2VvZiBBcnJheSApe1xyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZXMgPSBvLnZhbHVlc1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoIG8udmFsdWVzIGluc3RhbmNlb2YgU3RyaW5nICl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlcyA9IFsgby52YWx1ZXMgXTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKCBvLnZhbHVlcyBpbnN0YW5jZW9mIE9iamVjdCApe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWZPYmplY3QgPSBvLnZhbHVlc1xyXG4gICAgICAgICAgICAgICAgZm9yKCBsZXQgZyBpbiB0aGlzLnJlZk9iamVjdCApIHRoaXMudmFsdWVzLnB1c2goIGcgKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxuZyA9IHRoaXMudmFsdWVzLmxlbmd0aDtcclxuXHJcblxyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gby52YWx1ZSB8fCBudWxsO1xyXG5cclxuXHJcblxyXG5cclxuICAgICAgICBsZXQgY2MgPSB0aGlzLmNvbG9yc1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5pc1NlbGVjdGFibGUgPSBvLnNlbGVjdGFibGUgfHwgZmFsc2VcclxuICAgICAgICB0aGlzLnNwYWNlcyA9IG8uc3BhY2VzIHx8IFsgY2Muc3gsIGNjLnN5IF1cclxuICAgICAgICB0aGlzLmJzaXplID0gby5ic2l6ZSB8fCBbIDkwLCB0aGlzLmggXTtcclxuXHJcbiAgICAgICAgdGhpcy5ic2l6ZU1heCA9IHRoaXMuYnNpemVbMF1cclxuXHJcbiAgICAgICAgdGhpcy50bXAgPSBbXTtcclxuICAgICAgICB0aGlzLnN0YXQgPSBbXTtcclxuICAgICAgICB0aGlzLmdyaWQgPSBbIDIsIE1hdGgucm91bmQoIHRoaXMubG5nICogMC41ICkgXTtcclxuXHJcbiAgICAgICAgdGhpcy5oID0gKCB0aGlzLmdyaWRbMV0gKiB0aGlzLmJzaXplWzFdICkgKyAoIHRoaXMuZ3JpZFsxXSAqIHRoaXMuc3BhY2VzWzFdICkgLy8rIDQgLSAodGhpcy5tdG9wKjIpIC8vKyAodGhpcy5zcGFjZXNbMV0gLSB0aGlzLm10b3ApO1xyXG5cclxuICAgICAgICB0aGlzLmNbMV0udGV4dENvbnRlbnQgPSAnJztcclxuICAgICAgICAvL3RoaXMuY1syXSA9IHRoaXMuZG9tKCAndGFibGUnLCB0aGlzLmNzcy5iYXNpYyArICd3aWR0aDoxMDAlOyB0b3A6JysodGhpcy5zcGFjZXNbMV0tMikrJ3B4OyBoZWlnaHQ6YXV0bzsgYm9yZGVyLWNvbGxhcHNlOnNlcGFyYXRlOyBib3JkZXI6bm9uZTsgYm9yZGVyLXNwYWNpbmc6ICcrKHRoaXMuc3BhY2VzWzBdLTIpKydweCAnKyh0aGlzLnNwYWNlc1sxXS0yKSsncHg7JyApO1xyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAndGFibGUnLCB0aGlzLmNzcy5iYXNpYyArICd3aWR0aDoxMDAlOyBib3JkZXItc3BhY2luZzogJysodGhpcy5zcGFjZXNbMF0tMikrJ3B4ICcrKHRoaXMuc3BhY2VzWzFdKSsncHg7IGJvcmRlcjpub25lOycgKTtcclxuXHJcbiAgICAgICAgbGV0IG4gPSAwLCBiLCBtaWQsIHRkLCB0ciwgc2VsO1xyXG5cclxuICAgICAgICB0aGlzLnJlcyA9IC0xXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZVxyXG4gICAgICAgIHRoaXMubmV2ZXJsb2NrID0gdHJ1ZVxyXG5cclxuICAgICAgICB0aGlzLmJ1dHRvbnMgPSBbXTsgXHJcbiAgICAgICAgdGhpcy5zdGF0ID0gW107XHJcbiAgICAgICAgdGhpcy50bXBYID0gW107XHJcbiAgICAgICAgdGhpcy50bXBZID0gW107XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5ncmlkWzFdOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIHRyID0gdGhpcy5jWzJdLmluc2VydFJvdygpO1xyXG4gICAgICAgICAgICB0ci5zdHlsZS5jc3NUZXh0ID0gJ3BvaW50ZXItZXZlbnRzOm5vbmU7JztcclxuICAgICAgICAgICAgZm9yKCBsZXQgaiA9IDA7IGogPCB0aGlzLmdyaWRbMF07IGorKyApe1xyXG5cclxuICAgICAgICAgICAgICAgIHRkID0gdHIuaW5zZXJ0Q2VsbCgpO1xyXG4gICAgICAgICAgICAgICAgdGQuc3R5bGUuY3NzVGV4dCA9ICdwb2ludGVyLWV2ZW50czpub25lOyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMudmFsdWVzW25dICl7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNlbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKCB0aGlzLnZhbHVlc1tuXSA9PT0gdGhpcy52YWx1ZSAmJiB0aGlzLmlzU2VsZWN0YWJsZSApIHNlbCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xyXG4gICAgICAgICAgICAgICAgICAgIGIuc3R5bGUuY3NzVGV4dCA9IHRoaXMuY3NzLnR4dCArIHRoaXMuY3NzLmJ1dHRvbiArICdwb3NpdGlvbjpzdGF0aWM7IHRvcDoxcHg7IHdpZHRoOicrdGhpcy5ic2l6ZVswXSsncHg7IGhlaWdodDonKyh0aGlzLmJzaXplWzFdLTIpKydweDsgYm9yZGVyOicrY2MuYm9yZGVyU2l6ZSsncHggc29saWQgJytjYy5ib3JkZXIrJzsgbGVmdDphdXRvOyByaWdodDphdXRvOyBib3JkZXItcmFkaXVzOicrdGhpcy5yYWRpdXMrJ3B4Oyc7XHJcbiAgICAgICAgICAgICAgICAgICAgYi5zdHlsZS5iYWNrZ3JvdW5kID0gc2VsID8gY2Muc2VsZWN0IDogY2MuYnV0dG9uO1xyXG4gICAgICAgICAgICAgICAgICAgIGIuc3R5bGUuY29sb3IgPSBzZWwgPyBjYy50ZXh0U2VsZWN0IDogY2MudGV4dDtcclxuICAgICAgICAgICAgICAgICAgICBiLmlubmVySFRNTCA9IHRoaXMudmFsdWVzW25dO1xyXG4gICAgICAgICAgICAgICAgICAgIHRkLmFwcGVuZENoaWxkKCBiICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9ucy5wdXNoKGIpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0LnB1c2goMSlcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBiID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKVxyXG4gICAgICAgICAgICAgICAgICAgIGIuc3R5bGUuY3NzVGV4dCA9IHRoaXMuY3NzLnR4dCArICdwb3NpdGlvbjpzdGF0aWM7IHdpZHRoOicrdGhpcy5ic2l6ZVswXSsncHg7IGhlaWdodDonK3RoaXMuYnNpemVbMV0rJ3B4OyB0ZXh0LWFsaWduOmNlbnRlcjsgbGVmdDphdXRvOyByaWdodDphdXRvOyBiYWNrZ3JvdW5kOm5vbmU7J1xyXG4gICAgICAgICAgICAgICAgICAgIHRkLmFwcGVuZENoaWxkKCBiIClcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoaj09PTApIGIuc3R5bGUuY3NzVGV4dCArPSAnZmxvYXQ6cmlnaHQ7JztcclxuICAgICAgICAgICAgICAgIGVsc2UgYi5zdHlsZS5jc3NUZXh0ICs9ICdmbG9hdDpsZWZ0Oyc7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbisrO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zWzBdLmJvcmRlciA9ICdub25lJ1xyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGVzdFpvbmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAtMTtcclxuXHJcbiAgICAgICAgbC55ICs9IHRoaXMubXRvcFxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCB0eCA9IHRoaXMudG1wWDtcclxuICAgICAgICBsZXQgdHkgPSB0aGlzLnRtcFk7XHJcblxyXG4gICAgICAgIGxldCBpZCA9IC0xO1xyXG4gICAgICAgIGxldCBjID0gLTE7XHJcbiAgICAgICAgbGV0IGxpbmUgPSAtMTtcclxuICAgICAgICBsZXQgaSA9IHRoaXMuZ3JpZFswXTtcclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgXHRpZiggbC54ID4gdHhbaV1bMF0gJiYgbC54IDwgdHhbaV1bMV0gKSBjID0gaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGkgPSB0aGlzLmdyaWRbMV07XHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgICAgICBpZiggbC55ID4gdHlbaV1bMF0gJiYgbC55IDwgdHlbaV1bMV0gKSBsaW5lID0gaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGMhPT0tMSAmJiBsaW5lIT09LTEpe1xyXG4gICAgICAgICAgICBpZCA9IGMgKyAobGluZSoyKTtcclxuICAgICAgICAgICAgaWYoaWQ+dGhpcy5sbmctMSkgaWQgPSAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBpZDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzRG93biApIHJldHVybiBmYWxzZVxyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlXHJcbiAgICAgICAgaWYoIHRoaXMucmVzICE9PSAtMSApe1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZXNbdGhpcy5yZXNdXHJcbiAgICAgICAgICAgIHRoaXMuc2VuZCgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gKSByZXR1cm4gZmFsc2VcclxuICAgICAgICB0aGlzLmlzRG93biA9IHRydWVcclxuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgdXAgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnJlcyA9IHRoaXMudGVzdFpvbmUoIGUgKVxyXG5cclxuICAgICAgICBpZiggdGhpcy5yZXMgIT09IC0xICl7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJylcclxuICAgICAgICAgICAgdXAgPSB0aGlzLm1vZGVzKCB0aGlzLmlzRG93biA/IDMgOiAyLCB0aGlzLnJlcyApXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICBcdHVwID0gdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHVwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIE1PREVcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW9kZXMgKCBOID0gMSwgaWQgPSAtMSApIHtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZywgdywgbiwgciA9IGZhbHNlXHJcblxyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuXHJcbiAgICAgICAgICAgIG4gPSBOXHJcbiAgICAgICAgICAgIHcgPSB0aGlzLmlzU2VsZWN0YWJsZSA/IHRoaXMudmFsdWVzWyBpIF0gPT09IHRoaXMudmFsdWUgOiBmYWxzZVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYoIGkgPT09IGlkICl7XHJcbiAgICAgICAgICAgICAgICBpZiggdyAmJiBuID09PSAyICkgbiA9IDMgXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBuID0gMVxyXG4gICAgICAgICAgICAgICAgaWYoIHcgKSBuID0gNFxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiggdGhpcy5tb2RlKCBuLCBpICkgKSByID0gdHJ1ZVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByXHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vZGUgKCBuLCBpZCApIHtcclxuXHJcbiAgICAgICAgbGV0IGNoYW5nZSA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBjYyA9IHRoaXMuY29sb3JzLCBzID0gdGhpcy5idXR0b25zXHJcbiAgICAgICAgbGV0IGkgPSBpZFxyXG5cclxuICAgICAgICBpZiggdGhpcy5zdGF0W2lkXSAhPT0gbiApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zdGF0W2lkXSA9IG47XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIHN3aXRjaCggbiApe1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMTogc1tpXS5zdHlsZS5jb2xvciA9IGNjLnRleHQ7IHNbaV0uc3R5bGUuYmFja2dyb3VuZCA9IGNjLmJ1dHRvbjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHNbaV0uc3R5bGUuY29sb3IgPSBjYy50ZXh0T3Zlcjsgc1tpXS5zdHlsZS5iYWNrZ3JvdW5kID0gY2Mub3Zlcm9mZjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6IHNbaV0uc3R5bGUuY29sb3IgPSBjYy50ZXh0T3Zlcjsgc1tpXS5zdHlsZS5iYWNrZ3JvdW5kID0gY2Mub3ZlcjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IHNbaV0uc3R5bGUuY29sb3IgPSBjYy50ZXh0U2VsZWN0OyBzW2ldLnN0eWxlLmJhY2tncm91bmQgPSBjYy5zZWxlY3Q7IGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY2hhbmdlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLnJlcyA9IC0xXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoKVxyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGVzKClcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIGxhYmVsICggc3RyaW5nLCBuICkge1xyXG5cclxuICAgICAgICB0aGlzLmJ1dHRvbnNbbl0udGV4dENvbnRlbnQgPSBzdHJpbmc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGljb24gKCBzdHJpbmcsIHksIG4gKSB7XHJcblxyXG4gICAgICAgIHRoaXMuYnV0dG9uc1tuXS5zdHlsZS5wYWRkaW5nID0gKCB5IHx8IDAgKSArJ3B4IDBweCc7XHJcbiAgICAgICAgdGhpcy5idXR0b25zW25dLmlubmVySFRNTCA9IHN0cmluZztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGVzdFcgKCkge1xyXG5cclxuICAgICAgICBsZXQgdncgPSB0aGlzLnNwYWNlc1swXSozICsgdGhpcy5ic2l6ZU1heCoyLCByeiA9IGZhbHNlO1xyXG4gICAgICAgIGlmKCB2dyA+IHRoaXMudyApIHtcclxuICAgICAgICAgICAgdGhpcy5ic2l6ZVswXSA9ICggdGhpcy53LSh0aGlzLnNwYWNlc1swXSozKSApICogMC41O1xyXG4gICAgICAgICAgICByeiA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYoIHRoaXMuYnNpemVbMF0gIT09IHRoaXMuYnNpemVNYXggKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJzaXplWzBdID0gdGhpcy5ic2l6ZU1heDtcclxuICAgICAgICAgICAgICAgIHJ6ID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoICFyeiApIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmJ1dHRvbnMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSkgdGhpcy5idXR0b25zW2ldLnN0eWxlLndpZHRoID0gdGhpcy5ic2l6ZVswXSArICdweCc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuXHJcbiAgICAgICAgdGhpcy50ZXN0VygpO1xyXG5cclxuICAgICAgICBsZXQgbiA9IDAsIGIsIG1pZDtcclxuXHJcbiAgICAgICAgdGhpcy50bXBYID0gW107XHJcbiAgICAgICAgdGhpcy50bXBZID0gW107XHJcblxyXG4gICAgICAgIGZvciggbGV0IGogPSAwOyBqIDwgdGhpcy5ncmlkWzBdOyBqKysgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKGo9PT0wKXtcclxuICAgICAgICAgICAgICAgIG1pZCA9ICggdGhpcy53KjAuNSApIC0gKCB0aGlzLnNwYWNlc1swXSowLjUgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudG1wWC5wdXNoKCBbIG1pZC10aGlzLmJzaXplWzBdLCBtaWQgXSApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbWlkID0gKCB0aGlzLncqMC41ICkgKyAoIHRoaXMuc3BhY2VzWzBdKjAuNSApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50bXBYLnB1c2goIFsgbWlkLCBtaWQrdGhpcy5ic2l6ZVswXSBdICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtaWQgPSB0aGlzLnNwYWNlc1sxXTtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmdyaWRbMV07IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy50bXBZLnB1c2goIFsgbWlkLCBtaWQgKyB0aGlzLmJzaXplWzFdIF0gKTtcclxuICAgICAgICAgICAgbWlkICs9IHRoaXMuYnNpemVbMV0gKyB0aGlzLnNwYWNlc1sxXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8uanMnO1xyXG5pbXBvcnQgeyBUb29scyB9IGZyb20gJy4uL2NvcmUvVG9vbHMuanMnO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gJy4uL2NvcmUvVjIuanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFBhZDJEIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMuYXV0b1dpZHRoID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5taW53ICA9IHRoaXMud1xyXG4gICAgICAgIHRoaXMuZGlhbSA9IG8uZGlhbSB8fCB0aGlzLncgXHJcblxyXG4gICAgICAgIC8vdGhpcy5tYXJnaW4gPSAxNTtcclxuICAgICAgICB0aGlzLnBvcyA9IG5ldyBWMigwLDApO1xyXG4gICAgICAgIHRoaXMubWF4UG9zID0gOTBcclxuXHJcbiAgICAgICAgdGhpcy5tb2RlbCA9IG8uc3R5cGUgfHwgMDtcclxuICAgICAgICBpZiggby5tb2RlICE9PSB1bmRlZmluZWQgKSB0aGlzLm1vZGVsID0gby5tb2RlO1xyXG5cclxuICAgICAgICB0aGlzLm1pbiA9IG8ubWluID09PSB1bmRlZmluZWQgPyAtMSA6IG8ubWluO1xyXG4gICAgICAgIHRoaXMubWF4ID0gby5tYXggPT09IHVuZGVmaW5lZCA/IDEgOiBvLm1heDtcclxuXHJcbiAgICAgICAgdGhpcy5yYW5nZSA9ICh0aGlzLm1heCAtIHRoaXMubWluKSowLjU7ICBcclxuXHJcbiAgICAgICAgdGhpcy5jbW9kZSA9IDA7XHJcblxyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMucmFuZ2UpXHJcblxyXG4gICAgICAgIHRoaXMuY1swXS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG5cclxuICAgICAgICBcclxuXHJcblxyXG5cclxuICAgICAgICB0aGlzLnByZWNpc2lvbiA9IG8ucHJlY2lzaW9uID09PSB1bmRlZmluZWQgPyAyIDogby5wcmVjaXNpb247XHJcblxyXG4gICAgICAgIC8qdGhpcy5ib3VuZHMgPSB7fTtcclxuICAgICAgICB0aGlzLmJvdW5kcy54MSA9IG8ueDEgfHwgLTE7XHJcbiAgICAgICAgdGhpcy5ib3VuZHMueDIgPSBvLngyIHx8IDE7XHJcbiAgICAgICAgdGhpcy5ib3VuZHMueTEgPSBvLnkxIHx8IC0xO1xyXG4gICAgICAgIHRoaXMuYm91bmRzLnkyID0gby55MiB8fCAxO1xyXG5cclxuICAgICAgICB0aGlzLmxlcnBYID0gdGhpcy5sZXJwKCB0aGlzLm1hcmdpbiwgdGhpcy53IC0gdGhpcy5tYXJnaW4gLCB0aGlzLmJvdW5kcy54MSwgdGhpcy5ib3VuZHMueDIgKTtcclxuICAgICAgICB0aGlzLmxlcnBZID0gdGhpcy5sZXJwKCB0aGlzLm1hcmdpbiwgdGhpcy53IC0gdGhpcy5tYXJnaW4gLCB0aGlzLmJvdW5kcy55MSwgdGhpcy5ib3VuZHMueTIgKTtcclxuXHJcbiAgICAgICAgdGhpcy5hbGVycFggPSB0aGlzLmxlcnAoIHRoaXMuYm91bmRzLngxLCB0aGlzLmJvdW5kcy54MiwgdGhpcy5tYXJnaW4sIHRoaXMudyAtIHRoaXMubWFyZ2luICk7XHJcbiAgICAgICAgdGhpcy5hbGVycFkgPSB0aGlzLmxlcnAoIHRoaXMuYm91bmRzLnkxLCB0aGlzLmJvdW5kcy55MiwgdGhpcy5tYXJnaW4sIHRoaXMudyAtIHRoaXMubWFyZ2luICk7Ki9cclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9ICggQXJyYXkuaXNBcnJheSggby52YWx1ZSApICYmIG8udmFsdWUubGVuZ3RoID09IDIgKSA/IG8udmFsdWUgOiBbIDAsIDAgXTtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmggPSBvLmggfHwgdGhpcy53ICsgMTA7XHJcblxyXG4gICAgICAgIHRoaXMuY1swXS5zdHlsZS53aWR0aCA9IHRoaXMudyArICdweCc7XHJcblxyXG4gICAgICAgIC8vIFRpdGxlXHJcbiAgICAgICAgaWYoIHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkICkgeyAvLyB3aXRoIHRpdGxlXHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUud2lkdGggPSAnMTAwJSc7XHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS5zdHlsZS5qdXN0aWZ5Q29udGVudCA9ICdjZW50ZXInO1xyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IDEwO1xyXG4gICAgICAgICAgICB0aGlzLmggKz0gMTA7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy90aGlzLnRvcCAtPSB0aGlzLm1hcmdpblxyXG5cclxuICAgICAgICBsZXQgY2MgPSB0aGlzLmNvbG9yc1xyXG5cclxuXHJcbiAgICAgICAgLy8gVmFsdWVcclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICdqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOyB0b3A6JysgKCB0aGlzLmggLSAyMCApICsgJ3B4OyB3aWR0aDoxMDAlOyBjb2xvcjonICsgY2MudGV4dCApO1xyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgICAgIC8vIFBhZFxyXG5cclxuICAgICAgICBsZXQgcGFkID0gdGhpcy5nZXRQYWQyZCgpXHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCBwYWQsICdmaWxsJywgY2MuYmFjaywgMCApXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHBhZCwgJ2ZpbGwnLCBjYy5idXR0b24sIDEgKVxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCBwYWQsICdzdHJva2UnLCBjYy5iYWNrLCAyIClcclxuICAgICAgICB0aGlzLnNldFN2ZyggcGFkLCAnc3Ryb2tlJywgY2MuYmFjaywgMyApXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHBhZCwgJ3N0cm9rZScsIGNjLnRleHQsIDQgKVxyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggcGFkLCAndmlld0JveCcsICcwIDAgJyt0aGlzLmRpYW0rJyAnK3RoaXMuZGlhbSApXHJcbiAgICAgICAgdGhpcy5zZXRDc3MoIHBhZCwgeyB3aWR0aDp0aGlzLmRpYW0sIGhlaWdodDp0aGlzLmRpYW0sIGxlZnQ6MCwgdG9wOnRoaXMudG9wIH0pXHJcblxyXG4gICAgICAgIHRoaXMuY1szXSA9IHBhZFxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKVxyXG4gICAgICAgIHRoaXMuc2V0VmFsdWUoKVxyXG5cclxuICAgIH1cclxuICAgIFxyXG4gICAgdGVzdFpvbmUgKCBlICkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuXHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuXHJcblxyXG5cclxuICAgICAgICBpZiggbC55IDw9IHRoaXMuY1sgMSBdLm9mZnNldEhlaWdodCApIHJldHVybiAndGl0bGUnO1xyXG4gICAgICAgIGVsc2UgaWYgKCBsLnkgPiB0aGlzLmggLSB0aGlzLmNbIDIgXS5vZmZzZXRIZWlnaHQgKSByZXR1cm4gJ3RleHQnO1xyXG4gICAgICAgIGVsc2UgcmV0dXJuICdwYWQnO1xyXG5cclxuICAgICAgICAvKmlmKCAoIGwueCA+PSB0aGlzLm1hcmdpbiApICYmICggbC54IDw9IHRoaXMudyAtIHRoaXMubWFyZ2luICkgJiYgKCBsLnkgPj0gdGhpcy50b3AgKyB0aGlzLm1hcmdpbiApICYmICggbC55IDw9IHRoaXMudG9wICsgdGhpcy53IC0gdGhpcy5tYXJnaW4gKSApIHtcclxuICAgICAgICAgICAgcmV0dXJuICdwYWQnO1xyXG4gICAgICAgIH0qL1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vcmV0dXJuICcnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlKDApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICBpZiAoIHRoaXMudGVzdFpvbmUoZSkgPT09ICdwYWQnICkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb2RlKDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzRG93biApIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IHggPSAodGhpcy53KjAuNSkgLSAoIGUuY2xpZW50WCAtIHRoaXMuem9uZS54IClcclxuICAgICAgICBsZXQgeSA9ICh0aGlzLmRpYW0qMC41KSAtICggZS5jbGllbnRZIC0gdGhpcy56b25lLnkgLSB0aGlzLnl0b3AgKVxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICBsZXQgciA9IDI1NiAvIHRoaXMuZGlhbVxyXG5cclxuICAgICAgICB4ID0gLSh4KnIpXHJcbiAgICAgICAgeSA9IC0oeSpyKVxyXG5cclxuICAgICAgICB4ID0gVG9vbHMuY2xhbXAoIHgsIC10aGlzLm1heFBvcywgdGhpcy5tYXhQb3MgKVxyXG4gICAgICAgIHkgPSBUb29scy5jbGFtcCggeSwgLXRoaXMubWF4UG9zLCB0aGlzLm1heFBvcyApXHJcblxyXG4gICAgICAgIC8vbGV0IHggPSBlLmNsaWVudFggLSB0aGlzLnpvbmUueDtcclxuICAgICAgICAvL2xldCB5ID0gZS5jbGllbnRZIC0gdGhpcy56b25lLnkgLSB0aGlzLnRvcDtcclxuXHJcbiAgICAgICAgLyppZiggeCA8IHRoaXMubWFyZ2luICkgeCA9IHRoaXMubWFyZ2luO1xyXG4gICAgICAgIGlmKCB4ID4gdGhpcy53IC0gdGhpcy5tYXJnaW4gKSB4ID0gdGhpcy53IC0gdGhpcy5tYXJnaW47XHJcbiAgICAgICAgaWYoIHkgPCB0aGlzLm1hcmdpbiApIHkgPSB0aGlzLm1hcmdpbjtcclxuICAgICAgICBpZiggeSA+IHRoaXMudyAtIHRoaXMubWFyZ2luICkgeSA9IHRoaXMudyAtIHRoaXMubWFyZ2luOyovXHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2coeCx5KVxyXG5cclxuICAgICAgICB0aGlzLnNldFBvcyggWyB4ICwgeSBdICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy51cGRhdGUoIHRydWUgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZSAoIG1vZGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNtb2RlID09PSBtb2RlICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgY2MgPSB0aGlzLmNvbG9yc1xyXG5cclxuICAgICAgICBzd2l0Y2goIG1vZGUgKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5zWzJdLmNvbG9yID0gY2MudGV4dDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJywgY2MuYmFjaywgMClcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJywgY2MuYnV0dG9uLCAxKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIGNjLmJhY2ssIDIpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgY2MuYmFjaywgMylcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCBjYy50ZXh0LCA0IClcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBkb3duXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5zWzJdLmNvbG9yID0gY2MudGV4dFNlbGVjdDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJywgY2MuYmFja29mZiwgMClcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJywgY2Mub3Zlcm9mZiwgMSlcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCBjYy5iYWNrb2ZmLCAyKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIGNjLmJhY2tvZmYsIDMpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgY2MudGV4dFNlbGVjdCwgNCApXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNtb2RlID0gbW9kZTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcblxyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCB1cCApIHtcclxuXHJcbiAgICAgICAgLy9pZiggdXAgPT09IHVuZGVmaW5lZCApIHVwID0gdHJ1ZTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZVNWRygpO1xyXG5cclxuICAgICAgICBpZiggdXAgKSB0aGlzLnNlbmQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlU1ZHKCkge1xyXG5cclxuICAgICAgICBpZiAoIHRoaXMubW9kZWwgPT0gMSApIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICd5MScsIHRoaXMucG9zLnksIDIgKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3kyJywgdGhpcy5wb3MueSwgMiApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3gxJywgdGhpcy5wb3MueCwgMyApO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAneDInLCB0aGlzLnBvcy54LCAzICk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N4JywgdGhpcy5wb3MueCwgNCApO1xyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeScsIHRoaXMucG9zLnksIDQgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0UG9zICggcCApIHtcclxuXHJcbiAgICAgICAgLy9pZiggcCA9PT0gdW5kZWZpbmVkICkgcCA9IFsgdGhpcy53IC8gMiwgdGhpcy53IC8gMiBdO1xyXG5cclxuICAgICAgICB0aGlzLnBvcy5zZXQoIHBbMF0rMTI4ICwgcFsxXSsxMjggKTtcclxuXHJcbiAgICAgICAgbGV0IHIgPSAxL3RoaXMubWF4UG9zXHJcblxyXG4gICAgICAgIHRoaXMudmFsdWVbMF0gPSAoKHBbMF0qcikqdGhpcy5yYW5nZSkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKTtcclxuICAgICAgICB0aGlzLnZhbHVlWzFdID0gKChwWzFdKnIpKnRoaXMucmFuZ2UpLnRvRml4ZWQoIHRoaXMucHJlY2lzaW9uICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldFZhbHVlICggdiwgdXAgPSBmYWxzZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHYgPT09IHVuZGVmaW5lZCApIHYgPSB0aGlzLnZhbHVlO1xyXG5cclxuICAgICAgICAvKmlmICggdlswXSA8IHRoaXMuYm91bmRzLngxICkgdlswXSA9IHRoaXMuYm91bmRzLngxO1xyXG4gICAgICAgIGlmICggdlswXSA+IHRoaXMuYm91bmRzLngyICkgdlswXSA9IHRoaXMuYm91bmRzLngyO1xyXG4gICAgICAgIGlmICggdlsxXSA8IHRoaXMuYm91bmRzLnkxICkgdlsxXSA9IHRoaXMuYm91bmRzLnkxO1xyXG4gICAgICAgIGlmICggdlsxXSA+IHRoaXMuYm91bmRzLnkyICkgdlsxXSA9IHRoaXMuYm91bmRzLnkyOyovXHJcblxyXG4gICAgICAgIHRoaXMudmFsdWVbMF0gPSBNYXRoLm1pbiggdGhpcy5tYXgsIE1hdGgubWF4KCB0aGlzLm1pbiwgdlswXSApICkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKSAqIDE7XHJcbiAgICAgICAgdGhpcy52YWx1ZVsxXSA9IE1hdGgubWluKCB0aGlzLm1heCwgTWF0aC5tYXgoIHRoaXMubWluLCB2WzFdICkgKS50b0ZpeGVkKCB0aGlzLnByZWNpc2lvbiApICogMTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3Muc2V0KCAoKHRoaXMudmFsdWVbMF0vdGhpcy5yYW5nZSkqdGhpcy5tYXhQb3MpKzEyOCAgLCAoKHRoaXMudmFsdWVbMV0vdGhpcy5yYW5nZSkqdGhpcy5tYXhQb3MpKzEyOCApXHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy5wb3MpXHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlKCB1cCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKmxlcnAoIHMxLCBzMiwgZDEsIGQyLCBjID0gdHJ1ZSApIHtcclxuXHJcbiAgICAgICAgbGV0IHMgPSAoIGQyIC0gZDEgKSAvICggczIgLSBzMSApO1xyXG5cclxuICAgICAgICByZXR1cm4gYyA/ICggdiApID0+IHsgXHJcbiAgICAgICAgICAgIHJldHVybiAoICggdiA8IHMxID8gczEgOiB2ID4gczIgPyBzMiA6IHYgKSAtIHMxICkgKiBzICsgZDFcclxuICAgICAgICB9IDogKCB2ICkgPT4geyBcclxuICAgICAgICAgIHJldHVybiAoIHYgLSBzMSApICogcyArIGQxXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0qL1xyXG5cclxufSIsIlxyXG5pbXBvcnQgeyBCb29sIH0gZnJvbSAnLi4vcHJvdG8vQm9vbC5qcyc7XHJcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL3Byb3RvL0J1dHRvbi5qcyc7XHJcbmltcG9ydCB7IENpcmN1bGFyIH0gZnJvbSAnLi4vcHJvdG8vQ2lyY3VsYXIuanMnO1xyXG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJy4uL3Byb3RvL0NvbG9yLmpzJztcclxuaW1wb3J0IHsgRnBzIH0gZnJvbSAnLi4vcHJvdG8vRnBzLmpzJztcclxuaW1wb3J0IHsgR3JhcGggfSBmcm9tICcuLi9wcm90by9HcmFwaC5qcyc7XHJcbmltcG9ydCB7IEdyb3VwICB9IGZyb20gJy4uL3Byb3RvL0dyb3VwLmpzJztcclxuaW1wb3J0IHsgSm95c3RpY2sgfSBmcm9tICcuLi9wcm90by9Kb3lzdGljay5qcyc7XHJcbmltcG9ydCB7IEtub2IgfSBmcm9tICcuLi9wcm90by9Lbm9iLmpzJztcclxuaW1wb3J0IHsgTGlzdCB9IGZyb20gJy4uL3Byb3RvL0xpc3QuanMnO1xyXG5pbXBvcnQgeyBOdW1lcmljIH0gZnJvbSAnLi4vcHJvdG8vTnVtZXJpYy5qcyc7XHJcbmltcG9ydCB7IFNsaWRlIH0gZnJvbSAnLi4vcHJvdG8vU2xpZGUuanMnO1xyXG5pbXBvcnQgeyBUZXh0SW5wdXQgfSBmcm9tICcuLi9wcm90by9UZXh0SW5wdXQuanMnO1xyXG5pbXBvcnQgeyBUaXRsZSB9IGZyb20gJy4uL3Byb3RvL1RpdGxlLmpzJztcclxuaW1wb3J0IHsgU2VsZWN0IH0gZnJvbSAnLi4vcHJvdG8vU2VsZWN0LmpzJztcclxuaW1wb3J0IHsgQml0bWFwIH0gZnJvbSAnLi4vcHJvdG8vQml0bWFwLmpzJztcclxuaW1wb3J0IHsgU2VsZWN0b3IgfSBmcm9tICcuLi9wcm90by9TZWxlY3Rvci5qcyc7XHJcbmltcG9ydCB7IEVtcHR5IH0gZnJvbSAnLi4vcHJvdG8vRW1wdHkuanMnO1xyXG5pbXBvcnQgeyBJdGVtIH0gZnJvbSAnLi4vcHJvdG8vSXRlbS5qcyc7XHJcbmltcG9ydCB7IEdyaWQgfSBmcm9tICcuLi9wcm90by9HcmlkLmpzJztcclxuaW1wb3J0IHsgUGFkMkQgfSBmcm9tICcuLi9wcm90by9QYWQyRC5qcyc7XHJcbmltcG9ydCB7IFJvb3RzIH0gZnJvbSAnLi9Sb290cy5qcyc7XHJcblxyXG5leHBvcnQgY29uc3QgYWRkID0gZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBsZXQgYSA9IGFyZ3VtZW50czsgXHJcblxyXG4gICAgICAgIGxldCB0eXBlLCBvLCByZWYgPSBmYWxzZSwgbiA9IG51bGw7XHJcblxyXG4gICAgICAgIGlmKCB0eXBlb2YgYVswXSA9PT0gJ3N0cmluZycgKXsgXHJcblxyXG4gICAgICAgICAgICB0eXBlID0gYVswXTtcclxuICAgICAgICAgICAgbyA9IGFbMV0gfHwge307XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZiBhWzBdID09PSAnb2JqZWN0JyApeyAvLyBsaWtlIGRhdCBndWlcclxuXHJcbiAgICAgICAgICAgIHJlZiA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmKCBhWzJdID09PSB1bmRlZmluZWQgKSBbXS5wdXNoLmNhbGwoYSwge30pO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHR5cGUgPSBhWzJdLnR5cGUgPyBhWzJdLnR5cGUgOiBhdXRvVHlwZSggYVswXVthWzFdXSwgYVsyXSApO1xyXG5cclxuICAgICAgICAgICAgbyA9IGFbMl07XHJcbiAgICAgICAgICAgIG8ubmFtZSA9IGFbMV07XHJcbiAgICAgICAgICAgIGlmIChvLmhhc093blByb3BlcnR5KFwiZGlzcGxheU5hbWVcIikpIG8ubmFtZSA9IG8uZGlzcGxheU5hbWU7XHJcblxyXG4gICAgICAgICAgICBpZiggdHlwZSA9PT0gJ2xpc3QnICYmICFvLmxpc3QgKXsgby5saXN0ID0gYVswXVthWzFdXTsgfVxyXG4gICAgICAgICAgICBlbHNlIG8udmFsdWUgPSBhWzBdW2FbMV1dO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdHlwZS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICBpZiggbmFtZSA9PT0gJ2dyb3VwJyApeyBcclxuICAgICAgICAgICAgby5hZGQgPSBhZGQ7XHJcbiAgICAgICAgICAgIC8vby5keCA9IDhcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN3aXRjaCggbmFtZSApe1xyXG5cclxuICAgICAgICAgICAgY2FzZSAnYm9vbCc6IGNhc2UgJ2Jvb2xlYW4nOiBuID0gbmV3IEJvb2wobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdidXR0b24nOiBuID0gbmV3IEJ1dHRvbihvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2NpcmN1bGFyJzogbiA9IG5ldyBDaXJjdWxhcihvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2NvbG9yJzogbiA9IG5ldyBDb2xvcihvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2Zwcyc6IG4gPSBuZXcgRnBzKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnZ3JhcGgnOiBuID0gbmV3IEdyYXBoKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnZ3JvdXAnOiBuID0gbmV3IEdyb3VwKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnam95c3RpY2snOiBuID0gbmV3IEpveXN0aWNrKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAna25vYic6IG4gPSBuZXcgS25vYihvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2xpc3QnOiBuID0gbmV3IExpc3Qobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdudW1lcmljJzogY2FzZSAnbnVtYmVyJzogbiA9IG5ldyBOdW1lcmljKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnc2xpZGUnOiBuID0gbmV3IFNsaWRlKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAndGV4dElucHV0JzogY2FzZSAnc3RyaW5nJzogbiA9IG5ldyBUZXh0SW5wdXQobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICd0aXRsZSc6IGNhc2UgJ3RleHQnOiBuID0gbmV3IFRpdGxlKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnc2VsZWN0JzogbiA9IG5ldyBTZWxlY3Qobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdiaXRtYXAnOiBuID0gbmV3IEJpdG1hcChvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3NlbGVjdG9yJzogbiA9IG5ldyBTZWxlY3RvcihvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2VtcHR5JzogY2FzZSAnc3BhY2UnOiBuID0gbmV3IEVtcHR5KG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnaXRlbSc6IG4gPSBuZXcgSXRlbShvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2dyaWQnOiBuID0gbmV3IEdyaWQobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdwYWQyZCc6IGNhc2UgJ3BhZCc6IG4gPSBuZXcgUGFkMkQobyk7IGJyZWFrO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICBpZiggbiAhPT0gbnVsbCApe1xyXG5cclxuICAgICAgICAgICAgUm9vdHMubmVlZFJlc2l6ZSA9IHRydWVcclxuXHJcbiAgICAgICAgICAgIGlmKCByZWYgKSBuLnNldFJlZmVyZW5jeSggYVswXSwgYVsxXSApO1xyXG4gICAgICAgICAgICByZXR1cm4gbjtcclxuXHJcbiAgICAgICAgfVxyXG5cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGF1dG9UeXBlID0gZnVuY3Rpb24gKCB2LCBvICkge1xyXG5cclxuICAgIGxldCB0eXBlID0gJ3NsaWRlJ1xyXG5cclxuICAgIGlmKCB0eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nICkgdHlwZSA9ICdib29sJyBcclxuICAgIGVsc2UgaWYoIHR5cGVvZiB2ID09PSAnc3RyaW5nJyApeyBcclxuXHJcbiAgICAgICAgaWYoIHYuc3Vic3RyaW5nKDAsMSkgPT09ICcjJyApIHR5cGUgPSAnY29sb3InXHJcbiAgICAgICAgZWxzZSB0eXBlID0gJ3N0cmluZycgXHJcblxyXG4gICAgfSBlbHNlIGlmKCB0eXBlb2YgdiA9PT0gJ251bWJlcicgKXsgXHJcblxyXG4gICAgICAgIGlmKCBvLmN0eXBlICkgdHlwZSA9ICdjb2xvcidcclxuICAgICAgICBlbHNlIHR5cGUgPSAnc2xpZGUnXHJcblxyXG4gICAgfSBlbHNlIGlmKCB0eXBlb2YgdiA9PT0gJ2FycmF5JyAmJiB2IGluc3RhbmNlb2YgQXJyYXkgKXtcclxuXHJcbiAgICAgICAgaWYoIHR5cGVvZiB2WzBdID09PSAnbnVtYmVyJyApIHR5cGUgPSAnbnVtYmVyJ1xyXG4gICAgICAgIGVsc2UgaWYoIHR5cGVvZiB2WzBdID09PSAnc3RyaW5nJyApIHR5cGUgPSAnbGlzdCdcclxuXHJcbiAgICB9IGVsc2UgaWYoIHR5cGVvZiB2ID09PSAnb2JqZWN0JyAmJiB2IGluc3RhbmNlb2YgT2JqZWN0ICl7XHJcblxyXG4gICAgICAgIGlmKCB2LnggIT09IHVuZGVmaW5lZCApIHR5cGUgPSAnbnVtYmVyJ1xyXG4gICAgICAgIGVsc2UgdHlwZSA9ICdsaXN0J1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHlwZVxyXG5cclxufSIsImltcG9ydCB7IFJvb3RzIH0gZnJvbSBcIi4vUm9vdHMuanNcIjtcclxuaW1wb3J0IHsgVG9vbHMgfSBmcm9tIFwiLi9Ub29scy5qc1wiO1xyXG5pbXBvcnQgeyBhZGQgfSBmcm9tIFwiLi9hZGQuanNcIjtcclxuaW1wb3J0IHsgVjIgfSBmcm9tIFwiLi9WMi5qc1wiO1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgbHRoIC8gaHR0cHM6Ly9naXRodWIuY29tL2xvLXRoXHJcbiAqL1xyXG5cclxuZXhwb3J0IGNsYXNzIEd1aSB7XHJcbiAgY29uc3RydWN0b3IobyA9IHt9KSB7XHJcbiAgICB0aGlzLmlzR3VpID0gdHJ1ZTtcclxuXHJcbiAgICB0aGlzLm5hbWUgPSBcImd1aVwiO1xyXG5cclxuICAgIC8vIGZvciAzZFxyXG4gICAgdGhpcy5jYW52YXMgPSBudWxsO1xyXG4gICAgdGhpcy5zY3JlZW4gPSBudWxsO1xyXG4gICAgdGhpcy5wbGFuZSA9IG8ucGxhbmUgfHwgbnVsbDtcclxuXHJcbiAgICAvLyBjb2xvclxyXG4gICAgaWYgKG8uY29uZmlnKSBvLmNvbG9ycyA9IG8uY29uZmlnO1xyXG4gICAgaWYgKG8uY29sb3JzKSB0aGlzLnNldENvbmZpZyhvLmNvbG9ycyk7XHJcbiAgICBlbHNlIHRoaXMuY29sb3JzID0gVG9vbHMuZGVmaW5lQ29sb3Iobyk7XHJcblxyXG4gICAgLy90aGlzLmNsZWFubmluZyA9IGZhbHNlXHJcblxyXG4gICAgLy8gc3R5bGVcclxuICAgIHRoaXMuY3NzID0gVG9vbHMuY2xvbmVDc3MoKTtcclxuXHJcbiAgICB0aGlzLmlzUmVzZXQgPSB0cnVlO1xyXG4gICAgdGhpcy50bXBBZGQgPSBudWxsO1xyXG4gICAgLy90aGlzLnRtcEggPSAwXHJcblxyXG4gICAgdGhpcy5pc0NhbnZhcyA9IG8uaXNDYW52YXMgfHwgZmFsc2U7XHJcbiAgICB0aGlzLmlzQ2FudmFzT25seSA9IGZhbHNlO1xyXG5cclxuICAgIC8vIE1vZGlmaWVkIGJ5IEZlZGVtYXJpbm9cclxuICAgIC8vIG9wdGlvbiB0byBkZWZpbmUgd2hldGhlciB0aGUgZXZlbnQgbGlzdGVuZXJzIHNob3VsZCBiZSBhZGRlZCBvciBub3RcclxuICAgIFJvb3RzLmFkZERPTUV2ZW50TGlzdGVuZXJzID0gby5oYXNPd25Qcm9wZXJ0eShcImFkZERPTUV2ZW50TGlzdGVuZXJzXCIpXHJcbiAgICAgID8gby5hZGRET01FdmVudExpc3RlbmVyc1xyXG4gICAgICA6IHRydWU7XHJcblxyXG4gICAgdGhpcy5jYWxsYmFjayA9IG8uY2FsbGJhY2sgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBvLmNhbGxiYWNrO1xyXG5cclxuICAgIHRoaXMuZm9yY2VIZWlnaHQgPSBvLm1heEhlaWdodCB8fCAwO1xyXG4gICAgdGhpcy5sb2NrSGVpZ2h0ID0gby5sb2NrSGVpZ2h0IHx8IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuaXNJdGVtTW9kZSA9IG8uaXRlbU1vZGUgIT09IHVuZGVmaW5lZCA/IG8uaXRlbU1vZGUgOiBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmNuID0gXCJcIjtcclxuXHJcbiAgICAvLyBzaXplIGRlZmluZVxyXG4gICAgdGhpcy5zaXplID0gVG9vbHMuc2l6ZTtcclxuICAgIGlmIChvLnAgIT09IHVuZGVmaW5lZCkgdGhpcy5zaXplLnAgPSBvLnA7XHJcbiAgICBpZiAoby53ICE9PSB1bmRlZmluZWQpIHRoaXMuc2l6ZS53ID0gby53O1xyXG4gICAgaWYgKG8uaCAhPT0gdW5kZWZpbmVkKSB0aGlzLnNpemUuaCA9IG8uaDtcclxuICAgIGlmIChvLnMgIT09IHVuZGVmaW5lZCkgdGhpcy5zaXplLnMgPSBvLnM7XHJcblxyXG4gICAgdGhpcy5zaXplLmggPSB0aGlzLnNpemUuaCA8IDExID8gMTEgOiB0aGlzLnNpemUuaDtcclxuXHJcbiAgICAvLyBsb2NhbCBtb3VzZSBhbmQgem9uZVxyXG4gICAgdGhpcy5sb2NhbCA9IG5ldyBWMigpLm5lZygpO1xyXG4gICAgdGhpcy56b25lID0geyB4OiAwLCB5OiAwLCB3OiB0aGlzLnNpemUudywgaDogMCB9O1xyXG5cclxuICAgIC8vIHZpcnR1YWwgbW91c2VcclxuICAgIHRoaXMubW91c2UgPSBuZXcgVjIoKS5uZWcoKTtcclxuXHJcbiAgICB0aGlzLmggPSAwO1xyXG4gICAgLy90aGlzLnByZXZZID0gLTE7XHJcbiAgICB0aGlzLnN3ID0gMDtcclxuXHJcbiAgICB0aGlzLm1hcmdpbiA9IHRoaXMuY29sb3JzLnN5O1xyXG4gICAgdGhpcy5tYXJnaW5EaXYgPSBUb29scy5pc0RpdmlkKHRoaXMubWFyZ2luKTtcclxuXHJcbiAgICAvLyBib3R0b20gYW5kIGNsb3NlIGhlaWdodFxyXG4gICAgdGhpcy5pc1dpdGhDbG9zZSA9IG8uY2xvc2UgIT09IHVuZGVmaW5lZCA/IG8uY2xvc2UgOiB0cnVlO1xyXG4gICAgdGhpcy5iaCA9ICF0aGlzLmlzV2l0aENsb3NlID8gMCA6IHRoaXMuc2l6ZS5oO1xyXG5cclxuICAgIHRoaXMuYXV0b1Jlc2l6ZSA9IG8uYXV0b1Jlc2l6ZSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IG8uYXV0b1Jlc2l6ZTtcclxuXHJcbiAgICAvLyBkZWZhdWx0IHBvc2l0aW9uXHJcbiAgICB0aGlzLmlzQ2VudGVyID0gby5jZW50ZXIgfHwgZmFsc2U7XHJcbiAgICB0aGlzLmNzc0d1aSA9XHJcbiAgICAgIG8uY3NzICE9PSB1bmRlZmluZWQgPyBvLmNzcyA6IHRoaXMuaXNDZW50ZXIgPyBcIlwiIDogXCJyaWdodDoxMHB4O1wiO1xyXG5cclxuICAgIHRoaXMuaXNPcGVuID0gby5vcGVuICE9PSB1bmRlZmluZWQgPyBvLm9wZW4gOiB0cnVlO1xyXG4gICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgIHRoaXMuaXNTY3JvbGwgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnVpcyA9IFtdO1xyXG4gICAgdGhpcy5jdXJyZW50ID0gLTE7XHJcbiAgICB0aGlzLnByb3RvID0gbnVsbDtcclxuICAgIHRoaXMuaXNFbXB0eSA9IHRydWU7XHJcbiAgICB0aGlzLmRlY2FsID0gMDtcclxuICAgIHRoaXMucmF0aW8gPSAxO1xyXG4gICAgdGhpcy5veSA9IDA7XHJcblxyXG4gICAgdGhpcy5pc05ld1RhcmdldCA9IGZhbHNlO1xyXG5cclxuICAgIGxldCBjYyA9IHRoaXMuY29sb3JzO1xyXG5cclxuICAgIHRoaXMuY29udGVudCA9IFRvb2xzLmRvbShcclxuICAgICAgXCJkaXZcIixcclxuICAgICAgdGhpcy5jc3MuYmFzaWMgK1xyXG4gICAgICAgIFwiIHdpZHRoOjBweDsgaGVpZ2h0OmF1dG87IHRvcDowcHg7IGJhY2tncm91bmQ6XCIgK1xyXG4gICAgICAgIGNjLmNvbnRlbnQgK1xyXG4gICAgICAgIFwiOyBcIiArXHJcbiAgICAgICAgdGhpcy5jc3NHdWlcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5pbm5lckNvbnRlbnQgPSBUb29scy5kb20oXHJcbiAgICAgIFwiZGl2XCIsXHJcbiAgICAgIHRoaXMuY3NzLmJhc2ljICtcclxuICAgICAgICBcIndpZHRoOjEwMCU7IHRvcDowOyBsZWZ0OjA7IGhlaWdodDphdXRvOyBvdmVyZmxvdzpoaWRkZW47XCJcclxuICAgICk7XHJcbiAgICAvL3RoaXMuaW5uZXJDb250ZW50ID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyB0aGlzLmNzcy5idXR0b24gKyAnd2lkdGg6MTAwJTsgdG9wOjA7IGxlZnQ6MDsgaGVpZ2h0OmF1dG87IG92ZXJmbG93OmhpZGRlbjsnKTtcclxuICAgIHRoaXMuY29udGVudC5hcHBlbmRDaGlsZCh0aGlzLmlubmVyQ29udGVudCk7XHJcblxyXG4gICAgLy90aGlzLmlubmVyID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnd2lkdGg6MTAwJTsgbGVmdDowOyAnKVxyXG4gICAgdGhpcy51c2VGbGV4ID0gdHJ1ZTtcclxuICAgIGxldCBmbGV4aWJsZSA9IHRoaXMudXNlRmxleCA/IFwiZGlzcGxheTpmbGV4OyBmbGV4LWZsb3c6IHJvdyB3cmFwO1wiIDogXCJcIjsgLy8nIGRpc3BsYXk6ZmxleDsganVzdGlmeS1jb250ZW50OnN0YXJ0OyBhbGlnbi1pdGVtczpzdGFydDtmbGV4LWRpcmVjdGlvbjogY29sdW1uOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgYWxpZ24taXRlbXM6IGNlbnRlcjsnO1xyXG4gICAgdGhpcy5pbm5lciA9IFRvb2xzLmRvbShcclxuICAgICAgXCJkaXZcIixcclxuICAgICAgdGhpcy5jc3MuYmFzaWMgKyBmbGV4aWJsZSArIFwid2lkdGg6MTAwJTsgbGVmdDowOyBcIlxyXG4gICAgKTtcclxuICAgIHRoaXMuaW5uZXJDb250ZW50LmFwcGVuZENoaWxkKHRoaXMuaW5uZXIpO1xyXG5cclxuICAgIC8vIHNjcm9sbFxyXG4gICAgdGhpcy5zY3JvbGxCRyA9IFRvb2xzLmRvbShcclxuICAgICAgXCJkaXZcIixcclxuICAgICAgdGhpcy5jc3MuYmFzaWMgK1xyXG4gICAgICAgIFwicmlnaHQ6MDsgdG9wOjA7IHdpZHRoOlwiICtcclxuICAgICAgICAodGhpcy5zaXplLnMgLSAxKSArXHJcbiAgICAgICAgXCJweDsgaGVpZ2h0OjEwcHg7IGRpc3BsYXk6bm9uZTsgYmFja2dyb3VuZDpcIiArXHJcbiAgICAgICAgY2MuYmFja2dyb3VuZCArXHJcbiAgICAgICAgXCI7XCJcclxuICAgICk7XHJcbiAgICB0aGlzLmNvbnRlbnQuYXBwZW5kQ2hpbGQodGhpcy5zY3JvbGxCRyk7XHJcblxyXG4gICAgdGhpcy5zY3JvbGwgPSBUb29scy5kb20oXHJcbiAgICAgIFwiZGl2XCIsXHJcbiAgICAgIHRoaXMuY3NzLmJhc2ljICtcclxuICAgICAgICBcImJhY2tncm91bmQ6XCIgK1xyXG4gICAgICAgIGNjLmJ1dHRvbiArXHJcbiAgICAgICAgXCI7IHJpZ2h0OjJweDsgdG9wOjA7IHdpZHRoOlwiICtcclxuICAgICAgICAodGhpcy5zaXplLnMgLSA0KSArXHJcbiAgICAgICAgXCJweDsgaGVpZ2h0OjEwcHg7XCJcclxuICAgICk7XHJcbiAgICB0aGlzLnNjcm9sbEJHLmFwcGVuZENoaWxkKHRoaXMuc2Nyb2xsKTtcclxuXHJcbiAgICAvLyBib3R0b20gYnV0dG9uXHJcbiAgICB0aGlzLmJvdHRvbVRleHQgPSBvLmJvdHRvbVRleHQgfHwgW1wib3BlblwiLCBcImNsb3NlXCJdO1xyXG5cclxuICAgIGxldCByID0gY2MucmFkaXVzO1xyXG4gICAgdGhpcy5ib3R0b20gPSBUb29scy5kb20oXHJcbiAgICAgIFwiZGl2XCIsXHJcbiAgICAgIHRoaXMuY3NzLnR4dCArXHJcbiAgICAgICAgXCJ3aWR0aDoxMDAlOyB0b3A6YXV0bzsgYm90dG9tOjA7IGxlZnQ6MDsgYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXM6XCIgK1xyXG4gICAgICAgIHIgK1xyXG4gICAgICAgIFwicHg7IGJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXM6XCIgK1xyXG4gICAgICAgIHIgK1xyXG4gICAgICAgIFwicHg7IGp1c3RpZnktY29udGVudDpjZW50ZXI7IGhlaWdodDpcIiArXHJcbiAgICAgICAgdGhpcy5iaCArXHJcbiAgICAgICAgXCJweDsgbGluZS1oZWlnaHQ6XCIgK1xyXG4gICAgICAgICh0aGlzLmJoIC0gNSkgK1xyXG4gICAgICAgIFwicHg7IGNvbG9yOlwiICtcclxuICAgICAgICBjYy50ZXh0ICtcclxuICAgICAgICBcIjtcIlxyXG4gICAgKTsgLy8gYm9yZGVyLXRvcDoxcHggc29saWQgJytUb29scy5jb2xvcnMuc3Ryb2tlKyc7Jyk7XHJcbiAgICB0aGlzLmNvbnRlbnQuYXBwZW5kQ2hpbGQodGhpcy5ib3R0b20pO1xyXG4gICAgdGhpcy5ib3R0b20udGV4dENvbnRlbnQgPSB0aGlzLmlzT3BlblxyXG4gICAgICA/IHRoaXMuYm90dG9tVGV4dFsxXVxyXG4gICAgICA6IHRoaXMuYm90dG9tVGV4dFswXTtcclxuICAgIHRoaXMuYm90dG9tLnN0eWxlLmJhY2tncm91bmQgPSBjYy5iYWNrZ3JvdW5kO1xyXG5cclxuICAgIC8vXHJcblxyXG4gICAgdGhpcy5wYXJlbnQgPSBvLnBhcmVudCAhPT0gdW5kZWZpbmVkID8gby5wYXJlbnQgOiBudWxsO1xyXG4gICAgdGhpcy5wYXJlbnQgPSBvLnRhcmdldCAhPT0gdW5kZWZpbmVkID8gby50YXJnZXQgOiB0aGlzLnBhcmVudDtcclxuXHJcbiAgICBpZiAodGhpcy5wYXJlbnQgPT09IG51bGwgJiYgIXRoaXMuaXNDYW52YXMpIHtcclxuICAgICAgdGhpcy5wYXJlbnQgPSBkb2N1bWVudC5ib2R5O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnBhcmVudCAhPT0gbnVsbCkgdGhpcy5wYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5jb250ZW50KTtcclxuXHJcbiAgICBpZiAodGhpcy5pc0NhbnZhcyAmJiB0aGlzLnBhcmVudCA9PT0gbnVsbCkgdGhpcy5pc0NhbnZhc09ubHkgPSB0cnVlO1xyXG5cclxuICAgIGlmICghdGhpcy5pc0NhbnZhc09ubHkpIHtcclxuICAgICAgdGhpcy5jb250ZW50LnN0eWxlLnBvaW50ZXJFdmVudHMgPSBcImF1dG9cIjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuY29udGVudC5zdHlsZS5sZWZ0ID0gXCIwcHhcIjtcclxuICAgICAgdGhpcy5jb250ZW50LnN0eWxlLnJpZ2h0ID0gXCJhdXRvXCI7XHJcbiAgICAgIG8udHJhbnNpdGlvbiA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaGVpZ2h0IHRyYW5zaXRpb25cclxuICAgIHRoaXMudHJhbnNpdGlvbiA9XHJcbiAgICAgIG8udHJhbnNpdGlvbiAhPT0gdW5kZWZpbmVkID8gby50cmFuc2l0aW9uIDogVG9vbHMudHJhbnNpdGlvbjtcclxuICAgIGlmICh0aGlzLnRyYW5zaXRpb24pIHNldFRpbWVvdXQodGhpcy5hZGRUcmFuc2l0aW9uLmJpbmQodGhpcyksIDEwMDApO1xyXG5cclxuICAgIHRoaXMuc2V0V2lkdGgoKTtcclxuXHJcbiAgICBpZiAodGhpcy5pc0NhbnZhcykgdGhpcy5tYWtlQ2FudmFzKCk7XHJcblxyXG4gICAgUm9vdHMuYWRkKHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgdHJpZ2dlck1vdXNlRG93bih4LCB5KSB7XHJcbiAgICBSb290cy5oYW5kbGVFdmVudCh7XHJcbiAgICAgIHR5cGU6IFwicG9pbnRlcmRvd25cIixcclxuICAgICAgY2xpZW50WDogeCxcclxuICAgICAgY2xpZW50WTogeSxcclxuICAgICAgZGVsdGE6IDAsXHJcbiAgICAgIGtleTogbnVsbCxcclxuICAgICAga2V5Q29kZTogTmFOLFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB0cmlnZ2VyTW91c2VNb3ZlKCkge1xyXG4gICAgUm9vdHMuaGFuZGxlRXZlbnQoe1xyXG4gICAgICB0eXBlOiBcInBvaW50ZXJtb3ZlXCIsXHJcbiAgICAgIGNsaWVudFg6IC0xLFxyXG4gICAgICBjbGllbnRZOiAtMSxcclxuICAgICAgZGVsdGE6IDAsXHJcbiAgICAgIGtleTogbnVsbCxcclxuICAgICAga2V5Q29kZTogTmFOLFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB0cmlnZ2VyTW91c2VVcCh4LCB5KSB7XHJcbiAgICAvKlxyXG5cclxuICAgICAgICBjbGllbnRYLGNsaWVudFkgYXJlIG5vIHVzZWQgd2hlbiBpc0NhbnZhcz09dHJ1ZVxyXG4gICAgICAgICovXHJcbiAgICBSb290cy5oYW5kbGVFdmVudCh7XHJcbiAgICAgIHR5cGU6IFwicG9pbnRlcnVwXCIsXHJcbiAgICAgIGNsaWVudFg6IHgsXHJcbiAgICAgIGNsaWVudFk6IHksXHJcbiAgICAgIGRlbHRhOiAwLFxyXG4gICAgICBrZXk6IG51bGwsXHJcbiAgICAgIGtleUNvZGU6IE5hTixcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgc2V0VG9wKHQsIGgpIHtcclxuICAgIHRoaXMuY29udGVudC5zdHlsZS50b3AgPSB0ICsgXCJweFwiO1xyXG4gICAgaWYgKGggIT09IHVuZGVmaW5lZCkgdGhpcy5mb3JjZUhlaWdodCA9IGg7XHJcbiAgICB0aGlzLmNhbGMoKTtcclxuXHJcbiAgICBSb290cy5uZWVkUmVab25lID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGFkZFRyYW5zaXRpb24oKSB7XHJcbiAgICBpZiAodGhpcy50cmFuc2l0aW9uICYmICF0aGlzLmlzQ2FudmFzKSB7XHJcbiAgICAgIHRoaXMuaW5uZXJDb250ZW50LnN0eWxlLnRyYW5zaXRpb24gPVxyXG4gICAgICAgIFwiaGVpZ2h0IFwiICsgdGhpcy50cmFuc2l0aW9uICsgXCJzIGVhc2Utb3V0XCI7XHJcbiAgICAgIHRoaXMuY29udGVudC5zdHlsZS50cmFuc2l0aW9uID1cclxuICAgICAgICBcImhlaWdodCBcIiArIHRoaXMudHJhbnNpdGlvbiArIFwicyBlYXNlLW91dFwiO1xyXG4gICAgICB0aGlzLmJvdHRvbS5zdHlsZS50cmFuc2l0aW9uID0gXCJ0b3AgXCIgKyB0aGlzLnRyYW5zaXRpb24gKyBcInMgZWFzZS1vdXRcIjtcclxuICAgICAgLy90aGlzLmJvdHRvbS5hZGRFdmVudExpc3RlbmVyKFwidHJhbnNpdGlvbmVuZFwiLCBSb290cy5yZXNpemUsIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBpID0gdGhpcy51aXMubGVuZ3RoO1xyXG4gICAgd2hpbGUgKGktLSkgdGhpcy51aXNbaV0uYWRkVHJhbnNpdGlvbigpO1xyXG4gIH1cclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vICAgQ0FOVkFTXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBvbkRyYXcoKSB7fVxyXG5cclxuICBtYWtlQ2FudmFzKCkge1xyXG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXHJcbiAgICAgIFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLFxyXG4gICAgICBcImNhbnZhc1wiXHJcbiAgICApO1xyXG4gICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLnpvbmUudztcclxuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuZm9yY2VIZWlnaHQgPyB0aGlzLmZvcmNlSGVpZ2h0IDogdGhpcy56b25lLmg7XHJcblxyXG4gICAgLy9jb25zb2xlLmxvZyggdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCApXHJcbiAgfVxyXG5cclxuICBkcmF3KGZvcmNlKSB7XHJcbiAgICBpZiAodGhpcy5jYW52YXMgPT09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICBsZXQgdyA9IHRoaXMuem9uZS53O1xyXG4gICAgbGV0IGggPSB0aGlzLmZvcmNlSGVpZ2h0ID8gdGhpcy5mb3JjZUhlaWdodCA6IHRoaXMuem9uZS5oO1xyXG4gICAgUm9vdHMudG9DYW52YXModGhpcywgdywgaCwgZm9yY2UpO1xyXG4gIH1cclxuXHJcbiAgLy8vLy8vXHJcblxyXG4gIGdldERvbSgpIHtcclxuICAgIHJldHVybiB0aGlzLmNvbnRlbnQ7XHJcbiAgfVxyXG5cclxuICBub01vdXNlKCkge1xyXG4gICAgdGhpcy5tb3VzZS5uZWcoKTtcclxuICB9XHJcblxyXG4gIHNldE1vdXNlKHV2LCBmbGlwID0gdHJ1ZSkge1xyXG4gICAgaWYgKGZsaXApXHJcbiAgICAgIHRoaXMubW91c2Uuc2V0KFxyXG4gICAgICAgIE1hdGgucm91bmQodXYueCAqIHRoaXMuY2FudmFzLndpZHRoKSxcclxuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgLSBNYXRoLnJvdW5kKHV2LnkgKiB0aGlzLmNhbnZhcy5oZWlnaHQpXHJcbiAgICAgICk7XHJcbiAgICBlbHNlXHJcbiAgICAgIHRoaXMubW91c2Uuc2V0KFxyXG4gICAgICAgIE1hdGgucm91bmQodXYueCAqIHRoaXMuY2FudmFzLndpZHRoKSxcclxuICAgICAgICBNYXRoLnJvdW5kKHV2LnkgKiB0aGlzLmNhbnZhcy5oZWlnaHQpXHJcbiAgICAgICk7XHJcbiAgICAvL3RoaXMubW91c2Uuc2V0KCBtLngsIG0ueSApO1xyXG5cclxuICAgIC8vY29uc29sZS5sb2coXCJzZXRNb3VzZSBcIit1di54K1wiIFwiK3V2LnkpXHJcbiAgfVxyXG5cclxuICBzZXRDb25maWcobykge1xyXG4gICAgLy8gcmVzZXQgdG8gZGVmYXVsdCB0ZXh0XHJcbiAgICBUb29scy5zZXRUZXh0KCk7XHJcbiAgICB0aGlzLmNvbG9ycyA9IFRvb2xzLmRlZmluZUNvbG9yKG8pO1xyXG4gIH1cclxuXHJcbiAgc2V0Q29sb3JzKG8pIHtcclxuICAgIGZvciAobGV0IGMgaW4gbykge1xyXG4gICAgICBpZiAodGhpcy5jb2xvcnNbY10pIHRoaXMuY29sb3JzW2NdID0gb1tjXTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNldFRleHQoc2l6ZSwgY29sb3IsIGZvbnQsIHNoYWRvdykge1xyXG4gICAgVG9vbHMuc2V0VGV4dChzaXplLCBjb2xvciwgZm9udCwgc2hhZG93KTtcclxuICB9XHJcblxyXG4gIGhpZGUoYikge1xyXG4gICAgdGhpcy5jb250ZW50LnN0eWxlLnZpc2liaWxpdHkgPSBiID8gXCJoaWRkZW5cIiA6IFwidmlzaWJsZVwiO1xyXG4gIH1cclxuXHJcbiAgZGlzcGxheSh2ID0gZmFsc2UpIHtcclxuICAgIHRoaXMuY29udGVudC5zdHlsZS52aXNpYmlsaXR5ID0gdiA/IFwidmlzaWJsZVwiIDogXCJoaWRkZW5cIjtcclxuICB9XHJcblxyXG4gIG9uQ2hhbmdlKGYpIHtcclxuICAgIHRoaXMuY2FsbGJhY2sgPSBmIHx8IG51bGw7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyAgIFNUWUxFU1xyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgbW9kZShuKSB7XHJcbiAgICBsZXQgbmVlZENoYW5nZSA9IGZhbHNlO1xyXG4gICAgbGV0IGNjID0gdGhpcy5jb2xvcnM7XHJcblxyXG4gICAgaWYgKG4gIT09IHRoaXMuY24pIHtcclxuICAgICAgdGhpcy5jbiA9IG47XHJcblxyXG4gICAgICBzd2l0Y2ggKG4pIHtcclxuICAgICAgICBjYXNlIFwiZGVmXCI6XHJcbiAgICAgICAgICBSb290cy5jdXJzb3IoKTtcclxuICAgICAgICAgIHRoaXMuc2Nyb2xsLnN0eWxlLmJhY2tncm91bmQgPSBjYy5idXR0b247XHJcbiAgICAgICAgICB0aGlzLmJvdHRvbS5zdHlsZS5iYWNrZ3JvdW5kID0gY2MuYmFja2dyb3VuZDtcclxuICAgICAgICAgIHRoaXMuYm90dG9tLnN0eWxlLmNvbG9yID0gY2MudGV4dDtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAvL2Nhc2UgJ3Njcm9sbERlZic6IHRoaXMuc2Nyb2xsLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zY3JvbGw7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJzY3JvbGxPdmVyXCI6XHJcbiAgICAgICAgICBSb290cy5jdXJzb3IoXCJucy1yZXNpemVcIik7XHJcbiAgICAgICAgICB0aGlzLnNjcm9sbC5zdHlsZS5iYWNrZ3JvdW5kID0gY2Muc2VsZWN0O1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcInNjcm9sbERvd25cIjpcclxuICAgICAgICAgIHRoaXMuc2Nyb2xsLnN0eWxlLmJhY2tncm91bmQgPSBjYy5zZWxlY3Q7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgLy9jYXNlICdib3R0b21EZWYnOiB0aGlzLmJvdHRvbS5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuYmFja2dyb3VuZDsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcImJvdHRvbU92ZXJcIjpcclxuICAgICAgICAgIFJvb3RzLmN1cnNvcihcInBvaW50ZXJcIik7XHJcbiAgICAgICAgICB0aGlzLmJvdHRvbS5zdHlsZS5iYWNrZ3JvdW5kID0gY2MuYmFja2dyb3VuZE92ZXI7XHJcbiAgICAgICAgICB0aGlzLmJvdHRvbS5zdHlsZS5jb2xvciA9IGNjLnRleHRPdmVyO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy9jYXNlICdib3R0b21Eb3duJzogdGhpcy5ib3R0b20uc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNlbGVjdDsgdGhpcy5ib3R0b20uc3R5bGUuY29sb3IgPSAnIzAwMCc7IGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBuZWVkQ2hhbmdlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmVlZENoYW5nZTtcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyAgIFRBUkdFVFxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgY2xlYXJUYXJnZXQoKSB7XHJcbiAgICBpZiAodGhpcy5jdXJyZW50ID09PSAtMSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgaWYgKHRoaXMucHJvdG8ucykge1xyXG4gICAgICAvLyBpZiBubyBzIHRhcmdldCBpcyBkZWxldGUgISFcclxuICAgICAgdGhpcy5wcm90by51aW91dCgpO1xyXG4gICAgICB0aGlzLnByb3RvLnJlc2V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5wcm90byA9IG51bGw7XHJcbiAgICB0aGlzLmN1cnJlbnQgPSAtMTtcclxuXHJcbiAgICAvLy9jb25zb2xlLmxvZyh0aGlzLmlzRG93bikvL2lmKHRoaXMuaXNEb3duKVJvb3RzLmNsZWFySW5wdXQoKTtcclxuXHJcbiAgICBSb290cy5jdXJzb3IoKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vICAgWk9ORSBURVNUXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICB0ZXN0Wm9uZShlKSB7XHJcbiAgICBsZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICBpZiAobC54ID09PSAtMSAmJiBsLnkgPT09IC0xKSByZXR1cm4gXCJcIjtcclxuXHJcbiAgICB0aGlzLmlzUmVzZXQgPSBmYWxzZTtcclxuXHJcbiAgICBsZXQgbmFtZSA9IFwiXCI7XHJcblxyXG4gICAgbGV0IHMgPSB0aGlzLmlzU2Nyb2xsID8gdGhpcy56b25lLncgLSB0aGlzLnNpemUucyA6IHRoaXMuem9uZS53O1xyXG5cclxuICAgIGlmIChsLnkgPiB0aGlzLnpvbmUuaCAtIHRoaXMuYmggJiYgbC55IDwgdGhpcy56b25lLmgpIG5hbWUgPSBcImJvdHRvbVwiO1xyXG4gICAgZWxzZSBuYW1lID0gbC54ID4gcyA/IFwic2Nyb2xsXCIgOiBcImNvbnRlbnRcIjtcclxuXHJcbiAgICByZXR1cm4gbmFtZTtcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyAgIEVWRU5UU1xyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgaGFuZGxlRXZlbnQoZSkge1xyXG4gICAgLy9pZiggdGhpcy5jbGVhbm5pbmcgKSByZXR1cm5cclxuXHJcbiAgICAvL2NvbnNvbGUubG9nKFwiR3VpLmhhbmRsZUV2ZW50XCIpXHJcbiAgICAvL2NvbnNvbGUubG9nKGUpO1xyXG4gICAgbGV0IHR5cGUgPSBlLnR5cGU7XHJcblxyXG4gICAgbGV0IGNoYW5nZSA9IGZhbHNlO1xyXG4gICAgbGV0IHByb3RvQ2hhbmdlID0gZmFsc2U7XHJcblxyXG4gICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKGUpO1xyXG5cclxuICAgIGlmICh0eXBlID09PSBcIm1vdXNldXBcIiAmJiB0aGlzLmlzRG93bikgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgIGlmICh0eXBlID09PSBcIm1vdXNlZG93blwiICYmICF0aGlzLmlzRG93bikgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG5cclxuICAgIGlmICh0aGlzLmlzRG93biAmJiB0aGlzLmlzTmV3VGFyZ2V0KSB7XHJcbiAgICAgIFJvb3RzLmNsZWFySW5wdXQoKTtcclxuICAgICAgdGhpcy5pc05ld1RhcmdldCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghbmFtZSkgcmV0dXJuO1xyXG5cclxuICAgIHN3aXRjaCAobmFtZSkge1xyXG4gICAgICBjYXNlIFwiY29udGVudFwiOlxyXG4gICAgICAgIGUuY2xpZW50WSA9IHRoaXMuaXNTY3JvbGwgPyBlLmNsaWVudFkgKyB0aGlzLmRlY2FsIDogZS5jbGllbnRZO1xyXG5cclxuICAgICAgICBpZiAoUm9vdHMuaXNNb2JpbGUgJiYgdHlwZSA9PT0gXCJtb3VzZWRvd25cIikgdGhpcy5nZXROZXh0KGUsIGNoYW5nZSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnByb3RvKSBwcm90b0NoYW5nZSA9IHRoaXMucHJvdG8uaGFuZGxlRXZlbnQoZSk7XHJcblxyXG4gICAgICAgIGlmICh0eXBlID09PSBcIm1vdXNlbW92ZVwiKSBjaGFuZ2UgPSB0aGlzLm1vZGUoXCJkZWZcIik7XHJcbiAgICAgICAgaWYgKHR5cGUgPT09IFwid2hlZWxcIiAmJiAhcHJvdG9DaGFuZ2UgJiYgdGhpcy5pc1Njcm9sbClcclxuICAgICAgICAgIGNoYW5nZSA9IHRoaXMub25XaGVlbChlKTtcclxuXHJcbiAgICAgICAgaWYgKCFSb290cy5sb2NrKSB7XHJcbiAgICAgICAgICB0aGlzLmdldE5leHQoZSwgY2hhbmdlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiYm90dG9tXCI6XHJcbiAgICAgICAgdGhpcy5jbGVhclRhcmdldCgpO1xyXG4gICAgICAgIGlmICh0eXBlID09PSBcIm1vdXNlbW92ZVwiKSBjaGFuZ2UgPSB0aGlzLm1vZGUoXCJib3R0b21PdmVyXCIpO1xyXG4gICAgICAgIGlmICh0eXBlID09PSBcIm1vdXNlZG93blwiKSB7XHJcbiAgICAgICAgICB0aGlzLmlzT3BlbiA9IHRoaXMuaXNPcGVuID8gZmFsc2UgOiB0cnVlO1xyXG4gICAgICAgICAgdGhpcy5ib3R0b20udGV4dENvbnRlbnQgPSB0aGlzLmlzT3BlblxyXG4gICAgICAgICAgICA/IHRoaXMuYm90dG9tVGV4dFsxXVxyXG4gICAgICAgICAgICA6IHRoaXMuYm90dG9tVGV4dFswXTtcclxuICAgICAgICAgIC8vdGhpcy5zZXRIZWlnaHQoKTtcclxuICAgICAgICAgIHRoaXMuY2FsYygpO1xyXG4gICAgICAgICAgdGhpcy5tb2RlKFwiZGVmXCIpO1xyXG4gICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwic2Nyb2xsXCI6XHJcbiAgICAgICAgdGhpcy5jbGVhclRhcmdldCgpO1xyXG4gICAgICAgIGlmICh0eXBlID09PSBcIm1vdXNlbW92ZVwiKSBjaGFuZ2UgPSB0aGlzLm1vZGUoXCJzY3JvbGxPdmVyXCIpO1xyXG4gICAgICAgIGlmICh0eXBlID09PSBcIm1vdXNlZG93blwiKSBjaGFuZ2UgPSB0aGlzLm1vZGUoXCJzY3JvbGxEb3duXCIpO1xyXG4gICAgICAgIGlmICh0eXBlID09PSBcIndoZWVsXCIpIGNoYW5nZSA9IHRoaXMub25XaGVlbChlKTtcclxuICAgICAgICBpZiAodGhpcy5pc0Rvd24pIHRoaXMudXBkYXRlKGUuY2xpZW50WSAtIHRoaXMuem9uZS55IC0gdGhpcy5zaCAqIDAuNSk7XHJcblxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmlzRG93bikgY2hhbmdlID0gdHJ1ZTtcclxuICAgIGlmIChwcm90b0NoYW5nZSkgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICBpZiAodHlwZSA9PT0gXCJrZXl1cFwiKSBjaGFuZ2UgPSB0cnVlO1xyXG4gICAgaWYgKHR5cGUgPT09IFwia2V5ZG93blwiKSBjaGFuZ2UgPSB0cnVlO1xyXG5cclxuICAgIGlmIChjaGFuZ2UpIHRoaXMuZHJhdygpO1xyXG4gIH1cclxuXHJcbiAgZ2V0TmV4dChlLCBjaGFuZ2UpIHtcclxuICAgIGxldCBuZXh0ID0gUm9vdHMuZmluZFRhcmdldCh0aGlzLnVpcywgZSk7XHJcblxyXG4gICAgaWYgKG5leHQgIT09IHRoaXMuY3VycmVudCkge1xyXG4gICAgICB0aGlzLmNsZWFyVGFyZ2V0KCk7XHJcbiAgICAgIHRoaXMuY3VycmVudCA9IG5leHQ7XHJcbiAgICAgIGNoYW5nZSA9IHRydWU7XHJcbiAgICAgIHRoaXMuaXNOZXdUYXJnZXQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChuZXh0ICE9PSAtMSkge1xyXG4gICAgICB0aGlzLnByb3RvID0gdGhpcy51aXNbdGhpcy5jdXJyZW50XTtcclxuICAgICAgdGhpcy5wcm90by51aW92ZXIoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG9uV2hlZWwoZSkge1xyXG4gICAgdGhpcy5veSArPSAyMCAqIGUuZGVsdGE7XHJcbiAgICB0aGlzLnVwZGF0ZSh0aGlzLm95KTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vICAgUkVTRVRcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIHJlc2V0KGZvcmNlKSB7XHJcbiAgICBpZiAodGhpcy5pc1Jlc2V0KSByZXR1cm47XHJcblxyXG4gICAgLy90aGlzLnJlc2V0SXRlbSgpO1xyXG5cclxuICAgIHRoaXMubW91c2UubmVnKCk7XHJcbiAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgIC8vUm9vdHMuY2xlYXJJbnB1dCgpO1xyXG4gICAgbGV0IHIgPSB0aGlzLm1vZGUoXCJkZWZcIik7XHJcbiAgICBsZXQgcjIgPSB0aGlzLmNsZWFyVGFyZ2V0KCk7XHJcblxyXG4gICAgaWYgKHIgfHwgcjIpIHRoaXMuZHJhdyh0cnVlKTtcclxuXHJcbiAgICB0aGlzLmlzUmVzZXQgPSB0cnVlO1xyXG5cclxuICAgIC8vUm9vdHMubG9jayA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vICAgQUREIE5PREVcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGFkZCgpIHtcclxuICAgIC8vaWYodGhpcy5jbGVhbm5pbmcpIHRoaXMuY2xlYW5uaW5nID0gZmFsc2VcclxuXHJcbiAgICBsZXQgYSA9IGFyZ3VtZW50cztcclxuICAgIGxldCBvbnRvcCA9IGZhbHNlO1xyXG5cclxuICAgIGlmICh0eXBlb2YgYVsxXSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICBhWzFdLmlzVUkgPSB0cnVlO1xyXG4gICAgICBhWzFdLm1haW4gPSB0aGlzO1xyXG5cclxuICAgICAgb250b3AgPSBhWzFdLm9udG9wID8gYVsxXS5vbnRvcCA6IGZhbHNlO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgYVsxXSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICBpZiAoYVsyXSA9PT0gdW5kZWZpbmVkKSBbXS5wdXNoLmNhbGwoYSwgeyBpc1VJOiB0cnVlLCBtYWluOiB0aGlzIH0pO1xyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBhWzJdLmlzVUkgPSB0cnVlO1xyXG4gICAgICAgIGFbMl0ubWFpbiA9IHRoaXM7XHJcbiAgICAgICAgLy9vbnRvcCA9IGFbMV0ub250b3AgPyBhWzFdLm9udG9wIDogZmFsc2U7XHJcbiAgICAgICAgb250b3AgPSBhWzJdLm9udG9wID8gYVsyXS5vbnRvcCA6IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHUgPSBhZGQuYXBwbHkodGhpcywgYSk7XHJcblxyXG4gICAgaWYgKHUgPT09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICBpZiAob250b3ApIHRoaXMudWlzLnVuc2hpZnQodSk7XHJcbiAgICBlbHNlIHRoaXMudWlzLnB1c2godSk7XHJcblxyXG4gICAgdGhpcy5jYWxjKCk7XHJcblxyXG4gICAgdGhpcy5pc0VtcHR5ID0gZmFsc2U7XHJcblxyXG4gICAgcmV0dXJuIHU7XHJcbiAgfVxyXG5cclxuICAvLyByZW1vdmUgb25lIG5vZGVcclxuXHJcbiAgcmVtb3ZlKG4pIHtcclxuICAgIGlmIChuLmRpc3Bvc2UpIG4uZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLy8gY2FsbCBhZnRlciB1aXMgY2xlYXJcclxuXHJcbiAgY2xlYXJPbmUobikge1xyXG4gICAgbGV0IGlkID0gdGhpcy51aXMuaW5kZXhPZihuKTtcclxuICAgIGlmIChpZCAhPT0gLTEpIHtcclxuICAgICAgLy90aGlzLmNhbGMoIC0gKHRoaXMudWlzWyBpZCBdLmggKyAxICkgKTtcclxuICAgICAgdGhpcy5pbm5lci5yZW1vdmVDaGlsZCh0aGlzLnVpc1tpZF0uY1swXSk7XHJcbiAgICAgIHRoaXMudWlzLnNwbGljZShpZCwgMSk7XHJcbiAgICAgIHRoaXMuY2FsYygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gY2xlYXIgYWxsIGd1aVxyXG5cclxuICBlbXB0eSgpIHtcclxuICAgIC8vdGhpcy5jbGVhbm5pbmcgPSB0cnVlXHJcblxyXG4gICAgLy90aGlzLmNsb3NlKCk7XHJcblxyXG4gICAgbGV0IGkgPSB0aGlzLnVpcy5sZW5ndGgsXHJcbiAgICAgIGl0ZW07XHJcblxyXG4gICAgd2hpbGUgKGktLSkge1xyXG4gICAgICBpdGVtID0gdGhpcy51aXMucG9wKCk7XHJcbiAgICAgIHRoaXMuaW5uZXIucmVtb3ZlQ2hpbGQoaXRlbS5jWzBdKTtcclxuICAgICAgaXRlbS5kaXNwb3NlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51aXMgPSBbXTtcclxuICAgIHRoaXMuaXNFbXB0eSA9IHRydWU7XHJcbiAgICB0aGlzLmNhbGMoKTtcclxuICB9XHJcblxyXG4gIGNsZWFyKCkge1xyXG4gICAgdGhpcy5lbXB0eSgpO1xyXG4gIH1cclxuXHJcbiAgY2xlYXIyKCkge1xyXG4gICAgc2V0VGltZW91dCh0aGlzLmVtcHR5LmJpbmQodGhpcyksIDApO1xyXG4gIH1cclxuXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuY2xlYXIoKTtcclxuICAgIGlmICh0aGlzLnBhcmVudCAhPT0gbnVsbCkgdGhpcy5wYXJlbnQucmVtb3ZlQ2hpbGQodGhpcy5jb250ZW50KTtcclxuICAgIFJvb3RzLnJlbW92ZSh0aGlzKTtcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyAgIElURU1TIFNQRUNJQUxcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIHJlc2V0SXRlbSgpIHtcclxuICAgIGlmICghdGhpcy5pc0l0ZW1Nb2RlKSByZXR1cm47XHJcblxyXG4gICAgbGV0IGkgPSB0aGlzLnVpcy5sZW5ndGg7XHJcbiAgICB3aGlsZSAoaS0tKSB0aGlzLnVpc1tpXS5zZWxlY3RlZCgpO1xyXG4gIH1cclxuXHJcbiAgc2V0SXRlbShuYW1lKSB7XHJcbiAgICBpZiAoIXRoaXMuaXNJdGVtTW9kZSkgcmV0dXJuO1xyXG5cclxuICAgIG5hbWUgPSBuYW1lIHx8IFwiXCI7XHJcbiAgICB0aGlzLnJlc2V0SXRlbSgpO1xyXG5cclxuICAgIGlmICghbmFtZSkge1xyXG4gICAgICB0aGlzLnVwZGF0ZSgwKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBpID0gdGhpcy51aXMubGVuZ3RoO1xyXG4gICAgd2hpbGUgKGktLSkge1xyXG4gICAgICBpZiAodGhpcy51aXNbaV0udmFsdWUgPT09IG5hbWUpIHtcclxuICAgICAgICB0aGlzLnVpc1tpXS5zZWxlY3RlZCh0cnVlKTtcclxuICAgICAgICBpZiAodGhpcy5pc1Njcm9sbClcclxuICAgICAgICAgIHRoaXMudXBkYXRlKGkgKiAodGhpcy51aXNbaV0uaCArIHRoaXMubWFyZ2luKSAqIHRoaXMucmF0aW8pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gICBTQ1JPTExcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIHVwU2Nyb2xsKGIpIHtcclxuICAgIHRoaXMuc3cgPSBiID8gdGhpcy5zaXplLnMgOiAwO1xyXG4gICAgdGhpcy5veSA9IGIgPyB0aGlzLm95IDogMDtcclxuICAgIHRoaXMuc2Nyb2xsQkcuc3R5bGUuZGlzcGxheSA9IGIgPyBcImJsb2NrXCIgOiBcIm5vbmVcIjtcclxuXHJcbiAgICBpZiAoYikge1xyXG4gICAgICB0aGlzLnRvdGFsID0gdGhpcy5oO1xyXG5cclxuICAgICAgdGhpcy5tYXhWaWV3ID0gdGhpcy5tYXhIZWlnaHQ7XHJcblxyXG4gICAgICB0aGlzLnJhdGlvID0gdGhpcy5tYXhWaWV3IC8gdGhpcy50b3RhbDtcclxuICAgICAgdGhpcy5zaCA9IHRoaXMubWF4VmlldyAqIHRoaXMucmF0aW87XHJcblxyXG4gICAgICB0aGlzLnJhbmdlID0gdGhpcy5tYXhWaWV3IC0gdGhpcy5zaDtcclxuXHJcbiAgICAgIHRoaXMub3kgPSBUb29scy5jbGFtcCh0aGlzLm95LCAwLCB0aGlzLnJhbmdlKTtcclxuXHJcbiAgICAgIHRoaXMuc2Nyb2xsQkcuc3R5bGUuaGVpZ2h0ID0gdGhpcy5tYXhWaWV3ICsgXCJweFwiO1xyXG4gICAgICB0aGlzLnNjcm9sbC5zdHlsZS5oZWlnaHQgPSB0aGlzLnNoICsgXCJweFwiO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2V0SXRlbVdpZHRoKHRoaXMuem9uZS53IC0gdGhpcy5zdyk7XHJcbiAgICB0aGlzLnVwZGF0ZSh0aGlzLm95KTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZSh5KSB7XHJcbiAgICB5ID0gVG9vbHMuY2xhbXAoeSwgMCwgdGhpcy5yYW5nZSk7XHJcblxyXG4gICAgdGhpcy5kZWNhbCA9IE1hdGguZmxvb3IoeSAvIHRoaXMucmF0aW8pO1xyXG4gICAgdGhpcy5pbm5lci5zdHlsZS50b3AgPSAtdGhpcy5kZWNhbCArIFwicHhcIjtcclxuICAgIHRoaXMuc2Nyb2xsLnN0eWxlLnRvcCA9IE1hdGguZmxvb3IoeSkgKyBcInB4XCI7XHJcbiAgICB0aGlzLm95ID0geTtcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyAgIFJFU0laRSBGVU5DVElPTlxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgY2FsY1VpcygpIHtcclxuICAgIHJldHVybiBSb290cy5jYWxjVWlzKHRoaXMudWlzLCB0aGlzLnpvbmUsIHRoaXMuem9uZS55KTtcclxuICB9XHJcblxyXG4gIGNhbGMoKSB7XHJcbiAgICBjbGVhclRpbWVvdXQodGhpcy50bXApO1xyXG4gICAgdGhpcy50bXAgPSBzZXRUaW1lb3V0KHRoaXMuc2V0SGVpZ2h0LmJpbmQodGhpcyksIDEwKTtcclxuICB9XHJcblxyXG4gIHNldEhlaWdodCgpIHtcclxuICAgIGlmICh0aGlzLnRtcCkgY2xlYXJUaW1lb3V0KHRoaXMudG1wKTtcclxuXHJcbiAgICB0aGlzLnpvbmUuaCA9IHRoaXMuYmg7XHJcbiAgICB0aGlzLmlzU2Nyb2xsID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKHRoaXMuaXNPcGVuKSB7XHJcbiAgICAgIHRoaXMuaCA9IHRoaXMuY2FsY1VpcygpO1xyXG5cclxuICAgICAgbGV0IGhoaCA9IHRoaXMuZm9yY2VIZWlnaHRcclxuICAgICAgICA/IHRoaXMuZm9yY2VIZWlnaHQgKyB0aGlzLnpvbmUueVxyXG4gICAgICAgIDogd2luZG93LmlubmVySGVpZ2h0O1xyXG5cclxuICAgICAgdGhpcy5tYXhIZWlnaHQgPSBoaGggLSB0aGlzLnpvbmUueSAtIHRoaXMuYmg7XHJcblxyXG4gICAgICBsZXQgZGlmZiA9IHRoaXMuaCAtIHRoaXMubWF4SGVpZ2h0O1xyXG5cclxuICAgICAgaWYgKGRpZmYgPiAxKSB7XHJcbiAgICAgICAgdGhpcy5pc1Njcm9sbCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy56b25lLmggPSB0aGlzLm1heEhlaWdodCArIHRoaXMuYmg7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy56b25lLmggPSB0aGlzLmggKyB0aGlzLmJoO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51cFNjcm9sbCh0aGlzLmlzU2Nyb2xsKTtcclxuXHJcbiAgICB0aGlzLmlubmVyQ29udGVudC5zdHlsZS5oZWlnaHQgPSB0aGlzLnpvbmUuaCAtIHRoaXMuYmggKyBcInB4XCI7XHJcbiAgICB0aGlzLmNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gdGhpcy56b25lLmggKyBcInB4XCI7XHJcbiAgICB0aGlzLmJvdHRvbS5zdHlsZS50b3AgPSB0aGlzLnpvbmUuaCAtIHRoaXMuYmggKyBcInB4XCI7XHJcblxyXG4gICAgaWYgKHRoaXMuZm9yY2VIZWlnaHQgJiYgdGhpcy5sb2NrSGVpZ2h0KVxyXG4gICAgICB0aGlzLmNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gdGhpcy5mb3JjZUhlaWdodCArIFwicHhcIjtcclxuICAgIGlmICh0aGlzLmlzQ2FudmFzKSB0aGlzLmRyYXcodHJ1ZSk7XHJcbiAgfVxyXG5cclxuICByZXpvbmUoKSB7XHJcbiAgICBSb290cy5uZWVkUmVab25lID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHNldFdpZHRoKHcpIHtcclxuICAgIGlmICh3KSB0aGlzLnpvbmUudyA9IHc7XHJcblxyXG4gICAgdGhpcy56b25lLncgPSBNYXRoLmZsb29yKHRoaXMuem9uZS53KTtcclxuICAgIHRoaXMuY29udGVudC5zdHlsZS53aWR0aCA9IHRoaXMuem9uZS53ICsgXCJweFwiO1xyXG4gICAgaWYgKHRoaXMuaXNDZW50ZXIpXHJcbiAgICAgIHRoaXMuY29udGVudC5zdHlsZS5tYXJnaW5MZWZ0ID0gLU1hdGguZmxvb3IodGhpcy56b25lLncgKiAwLjUpICsgXCJweFwiO1xyXG4gICAgdGhpcy5zZXRJdGVtV2lkdGgodGhpcy56b25lLncgLSB0aGlzLnN3KTtcclxuICB9XHJcblxyXG4gIHNldEl0ZW1XaWR0aCh3KSB7XHJcbiAgICBsZXQgaSA9IHRoaXMudWlzLmxlbmd0aDtcclxuICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgdGhpcy51aXNbaV0uc2V0U2l6ZSh3KTtcclxuICAgICAgdGhpcy51aXNbaV0uclNpemUoKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztDQUFBO0NBQ0E7Q0FDQTtBQUNBO0FBQ1ksT0FBQyxRQUFRLEdBQUcsUUFBUTtBQUNoQztDQUNBO0FBQ0E7Q0FDQSxNQUFNLENBQUMsR0FBRztDQUNWLEVBQUUsRUFBRSxFQUFFLEVBQUU7QUFDUjtDQUNBLEVBQUUsR0FBRyxFQUFFLElBQUk7QUFDWDtDQUNBLEVBQUUsRUFBRSxFQUFFLElBQUk7Q0FDVixFQUFFLElBQUksRUFBRSxLQUFLO0NBQ2IsRUFBRSxLQUFLLEVBQUUsS0FBSztDQUNkLEVBQUUsT0FBTyxF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T0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDekU7Q0FDQSxJQUFJLElBQUksQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDakM7Q0FDQSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzVCO0NBQ0EsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ2hCLElBQUksSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ3RCO0NBQ0EsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDbkQsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDL0M7Q0FDQSxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Q0FDcEUsU0FBUyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNyQjtDQUNBLElBQUksSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztBQUNsQztDQUNBLElBQUksQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLEtBQUssS0FBSyxPQUFPLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQztDQUN2RSxJQUFJLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxLQUFLLEtBQUssT0FBTyxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUM7QUFDdkU7Q0FD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QixRQUFRLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUc7Q0FDdEMsVUFBVSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxNQUFNLENBQUM7Q0FDakUsU0FBUztDQUNULFFBQVEsT0FBTyxRQUFRLENBQUM7Q0FDeEIsS0FBSztBQUNMO0NBQ0EsSUFBSSxTQUFTLEVBQUUsV0FBVyxDQUFDLEdBQUc7Q0FDOUIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLFNBQVMsR0FBRyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0NBQzNDLFFBQVEsT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUM1RDtDQUNBLEtBQUs7QUFDTDtDQUNBLElBQUksU0FBUyxFQUFFLFdBQVcsQ0FBQyxHQUFHO0FBQzlCO0NBQ0EsUUFBUSxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xEO0NBQ0EsS0FBSztBQUNMO0NBQ0EsSUFBSSxJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzFCO0NBQ0EsUUFBUSxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3pEO0NBQ0EsS0FBSztBQUNMO0NBQ0EsSUFBSSxHQUFHLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQzNCO0NBQ0EsUUFBUSxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3hEO0NBQ0EsS0FBSztBQUNMO0NBQ0EsSUFBSSxNQUFNLEVBQUUsVUFBVSxDQUFDLEVBQUU7QUFDekI7Q0FDQSxRQUFRLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7Q0FDL0UsYUFBYSxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzlFO0NBQ0EsS0FBSztBQUNMO0NBQ0EsSUFBSSxJQUFJLEVBQUUsV0FBVyxDQUFDLEdBQUc7Q0FDekIsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUM7Q0FDekQsUUFBUSxLQUFLLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0NBQ3hDLFFBQVEsT0FBTyxDQUFDLENBQUM7Q0FDakIsS0FBSztBQUNMO0NBQ0EsSUFBSSxJQUFJLEVBQUUsV0FBVyxDQUFDLEdBQUc7QUFDekI7Q0FDQSxRQUFRLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQzVFO0NBQ0EsS0FBSztBQUNMO0NBQ0EsSUFBSSxPQUFPLEVBQUUsVUFBVSxDQUFDLEVBQUU7QUFDMUI7Q0FDQSxRQUFRLE9BQU8sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ2pIO0NBQ0EsS0FBSztBQUNMO0NBQ0EsSUFBSSxHQUFHLEVBQUUsVUFBVSxDQUFDLEVBQUU7Q0FDdEIsUUFBUSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0NBQ3JDLFFBQVEsT0FBTyxDQUFDLENBQUM7Q0FDakIsS0FBSztBQUNMO0NBQ0EsSUFBSSxRQUFRLEdBQUcsVUFBVSxDQUFDLEVBQUU7QUFDNUI7Q0FDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNwRCxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNwRCxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNwRCxRQUFRLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BEO0NBQ0E7QUFDQTtDQUNBLEtBQUs7QUFDTDtDQUNBLElBQUksUUFBUSxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDakM7Q0FDQSxRQUFRLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQzVCLFFBQVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDNUIsUUFBUSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3RELFFBQVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztDQUNsQyxRQUFRLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0NBQ2xFLFFBQVEsT0FBTyxDQUFDLENBQUM7QUFDakI7Q0FDQSxLQUFLO0FBQ0w7Q0FDQSxJQUFJLFFBQVEsRUFBRSxXQUFXLENBQUMsR0FBRztBQUM3QjtDQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO0NBQ2pKLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzFFLFFBQVEsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO0NBQ3ZCLFlBQVksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUM7Q0FDM0QsWUFBWSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQztDQUNqRSxZQUFZLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDO0NBQ2pFLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUNuQixTQUFTO0NBQ1QsUUFBUSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUMzQjtDQUNBLEtBQUs7QUFDTDtDQUNBLElBQUksUUFBUSxFQUFFLFdBQVcsQ0FBQyxHQUFHO0FBQzdCO0NBQ0EsUUFBUSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0M7Q0FDQSxRQUFRLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztDQUMxQyxhQUFhO0NBQ2IsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0NBQzNELFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQzFCLFlBQVksT0FBTyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQztDQUN6RyxTQUFTO0FBQ1Q7Q0FDQSxLQUFLO0FBQ0w7Q0FDQTtDQUNBO0NBQ0E7QUFDQTtDQUNBLElBQUksWUFBWSxFQUFFLFdBQVcsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHO0FBQzlEO0NBQ0EsUUFBUSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNqRDtDQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUQ7Q0FDQSxRQUFRLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ2hEO0NBQ0EsWUFBWSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzFCO0NBQ0EsWUFBWSxDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUMvRztDQUNBLFNBQVM7QUFDVDtDQUNBLEtBQUs7QUFDTDtDQUNBO0FBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtBQUNBO0NBQ0E7QUFDQTtDQUNBLElBQUksT0FBTyxFQUFFLFdBQVcsS0FBSyxHQUFHO0FBQ2hDO0NBQ0EsUUFBUSxJQUFJLEVBQUUsR0FBRyxJQUFHO0NBQ3BCLFFBQVEsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsb0JBQW9CLEVBQUUsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO0NBQ3BKLFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO0NBQ3BCLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO0NBQ25DLFFBQVEsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQztDQUMvRixRQUFRLEtBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7Q0FDckg7Q0FDQSxRQUFRLEtBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO0NBQzdJLFFBQVEsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxFQUFFLENB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RSxDQUFDLEVBQUUsRUFBRSxZQUFZLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7Q0FDdEUsWUFBWSxDQUFDLENBQUMsWUFBWSxFQUFFLGdCQUFnQixFQUFFLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDMUg7Q0FDQTtDQUNBLFlBQVksSUFBSSxHQUFHLEdBQUcsQ0FBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0NBQzFFLFlBQVksSUFBSSxHQUFHLEdBQUcsQ0FBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQzFFO0NBQ0EsWUFBWSxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztDQUMxRixZQUFZLENBQUMsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMzSDtDQUNBLFlBQVksR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7Q0FDMUYsWUFBWSxDQUFDLENBQUMsWUFBWSxFQUFFLGdCQUFnQixFQUFFLEVBQUUsRUFBRSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDNUg7Q0FDQTtBQUNBO0NBQ0EsWUFBWSxDQUFDLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7Q0FDdEYsWUFBWSxDQUFDLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7Q0FDcEcsWUFBWSxDQUFDLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDN0Y7Q0FDQSxZQUFZLENBQUMsQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO0FBQy9CO0NBQ0EsU0FBUyxNQUFNO0NBQ2Y7Q0FDQSxZQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxZQUFZLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7Q0FDNUYsWUFBWSxDQUFDLENBQUMsWUFBWSxFQUFFLGdCQUFnQixFQUFFLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDMUg7Q0FDQSxZQUFZLENBQUMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLHdCQUF3QixFQUFFLGNBQWMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQztDQUNySSxZQUFZLENBQUMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7Q0FDL0YsWUFBWSxDQUFDLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxjQUFjLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDcEk7Q0FDQSxZQUFZLENBQUMsQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO0NBQy9CLFNBQVM7QUFDVDtDQUNBO0FBQ0E7Q0FDQSxLQUFLO0FBQ0w7Q0FDQSxJQUFJLGFBQWEsRUFBRSxZQUFZO0FBQy9CO0NBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUM7Q0FDcEIsUUFBUSxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxvQkFBb0IsRUFBRSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7Q0FDaEosUUFBUSxDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO0NBQ3ZDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNwQztDQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0NBQ25CLFFBQVEsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztDQUMzQixRQUFRLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUM7Q0FDeEIsUUFBVyxJQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUs7Q0FDNUQsUUFBUSxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDO0NBQ2pELFFBQVEsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO0NBQ3ZCO0NBQ0EsUUFBUSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUNsQztDQUNBLFlBQVksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDdkIsWUFBWSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7Q0FDOUIsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEdBQUcsQ0FBQztDQUNqQyxZQUFZLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUM7QUFDaEQ7Q0FDQSxZQUFZLEVBQUUsR0FBRztDQUNqQixnQkFBZ0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0NBQzNDLGdCQUFnQixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRztDQUN2RCxnQkFBZ0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0NBQzNDLGFBQWEsQ0FBQztDQUNkO0NBQ0EsWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFB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LFFBQVEsQ0FBQztBQUMzQztDQUNBLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQzNCO0NBQ0EsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Q0FDakQsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDaEM7Q0FDQSxJQUFJLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO0NBQzlCLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDMUI7Q0FDQTtDQUNBLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3BEO0NBQ0EsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQ3pELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEM7Q0FDQSxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDekQsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN4QyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDMUQsU0FBUyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUMxQjtDQUNBO0NBQ0EsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3hCO0NBQ0EsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDO0NBQ3BDLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDeEI7Q0FDQTtDQUNBLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2pEO0NBQ0EsSUFBSSxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQztBQUN2RDtDQUNBO0NBQ0EsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztDQUMxQixJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUM7Q0FDbEMsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDO0FBQ3hDO0NBQ0E7Q0FDQSxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBQ3RCO0NBQ0E7Q0FDQSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3hCO0NBQ0E7Q0FDQSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUM7Q0FDcEMsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDakM7Q0FDQTtDQUNBLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekI7Q0FDQTtDQUNBLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7Q0FDM0MsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLEtBQUssU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztDQUMzQyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUNoRDtDQUNBO0NBQ0EsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssU0FBUyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzdDO0NBQ0E7Q0FDQSxJQUFJLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0NBQzNCLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7Q0FDeEIsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztBQUMxQjtDQUNBLElBQUksSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztDQUM1QixJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDO0NBQ3JDLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQztBQUNuQztDQUNBO0NBQ0EsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLEtBQUssU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsUUFB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QU8sQ0FBQyxDQUFDLEVBQUU7Q0FDYixJQUFJLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO0NBQzNCLElBQUksT0FBTyxJQUFJLENBQUM7Q0FDaEIsR0FBRztBQUNIO0NBQ0E7Q0FDQTtDQUNBO0FBQ0E7Q0FDQSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUU7Q0FDVixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQztDQUN4QixJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZEO0NBQ0EsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztDQUN2QixJQUFJLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3RFLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztDQUN4RCxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0NBQ3hCLEdBQUc7QUFDSDtDQUNBLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRTtDQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDO0NBQ3hCLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkQ7Q0FDQSxJQUFJLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzlDLElBQUksSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLElBQUksRUFBRSxJ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QUFRLElBQUksQ0FBQyxTQUFTO0NBQzFCLE1BQU0sS0FBSyxDQUFDO0NBQ1osUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2QsUUFBUSxNQUFNO0NBQ2QsTUFBTSxLQUFLLENBQUM7Q0FDWixRQUFRLENBQUMsR0FBRyxHQUFHLENBQUM7Q0FDaEIsUUFBUSxNQUFNO0NBQ2QsTUFBTSxLQUFLLENBQUM7Q0FDWixRQUFRLENBQUMsR0FBRyxJQUFJLENBQUM7Q0FDakIsUUFBUSxNQUFNO0NBQ2QsTUFBTSxLQUFLLENBQUM7Q0FDWixRQUFRLENBQUMsR0FBRyxLQUFLLENBQUM7Q0FDbEIsUUFBUSxNQUFNO0NBQ2QsTUFBTSxLQUFLLENBQUM7Q0FDWixRQUFRLENBQUMsR0FBRyxNQUFNLENBQUM7Q0FDbkIsUUFBUSxNQUFNO0NBQ2QsTUFBTSxLQUFLLENBQUM7Q0FDWixRQUFRLENBQUMsR0FBRyxPQUFPLENBQUM7Q0FDcEIsUUFBUSxNQUFNO0NBQ2QsTUFBTSxLQUFLLENBQUM7Q0FDWixRQUFRLENBQUMsR0FBRyxRQUFRLENBQUM7Q0FDckIsUUFBUSxNQUFNO0NBQ2QsS0FBSztBQUNMO0NBQ0EsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO0NBQ2xELElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7Q0FDckMsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQzNDLEdBQUc7QUFDSDtDQUNBLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRTtDQUNkLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3BDLElBQUk7Q0FDSixNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMs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QVEsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE9BQU07QUFDN0M7Q0FDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUU7QUFDakQ7Q0FDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUM7QUFDdkM7Q0FDQSxRQUFRLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDO0FBQ3hCO0NBQ0E7Q0FDQSxRQUFRLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFVBQVUsSUFBSSxFQUFDO0NBQ25DLFFBQVEsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUU7Q0FDL0IsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBQztBQUNqQztDQUNBLFFBQVEsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFFO0FBQzNFO0NBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQUs7Q0FDM0IsUUFBUSxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUk7Q0FDN0IsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUM7QUFDcEI7Q0FDQSxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFNO0NBQ3JDLFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFFO0NBQ3JCLFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFFO0FBQ3RCO0NBQ0EsUUFBUSxJQUFJLEdBQUcsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUNsQztDQUNBLFFBQVEsS0FBSyxJQUFJLENB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RDtDQUNBLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFDO0NBQzVELFNBQVM7QUFDVDtDQUNBLFFBQVEsT0FBTyxDQUFDLEVBQUUsRUFBRTtBQUNwQjtDQUNBO0NBQ0EsWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUM7Q0FDckUsU0FBUyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRDtDQUNBLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFJO0NBQy9DLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFJO0FBQ2hEO0NBQ0EsU0FBUztBQUNUO0NBQ0EsS0FBSztBQUNMO0NBQ0E7O0NDcFBPLE1BQU0sUUFBUSxTQUFTLEtBQUssQ0FBQztBQUNwQztDQUNBLElBQUksV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUc7QUFDMUI7Q0FDQSxRQUFRLEtBQUssRUFBRSxDQUFDLEdBQUU7QUFDbEI7Q0FDQSxRQUFRLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxNQUFLO0NBQ3pDLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUM7Q0FDakMsUUFBUSxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUk7QUFDdEQ7Q0FDQSxRQUFRLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBSztDQUM5QixRQUFRLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUM7Q0FDMUIsUUFBUSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUM7QUFDcEM7Q0FDQSxRQUFRLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxHQUFFO0FBQy9CO0NBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFLO0NBQ2hDLFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSTtBQUM5QjtDQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEVBQUUsR0FBRTtBQUM5QjtDQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRTtBQUNuQztDQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsS0FBSTtDQUM1QyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFPO0FBQ3pDO0NBQ0EsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxFQUFFO0FBQ3BDO0NBQ0EsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTTtDQUMxQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWMsR0FBRyxTQUFRO0NBQ3JELFlBQVksSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFFO0NBQ3pCLFlBQVksSUFBSSxDQUFDLENBQUMsSUFBSSxHQUFFO0FBQ3hCO0NBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtDQUNBLFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFDO0NBQ3hCLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFDO0NBQ3RCLFFBQVEsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU07QUFDNUI7Q0FDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsOEJBQThCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFFO0FBQ2xJO0NBQ0E7Q0FDQTtDQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxHQUFFO0FBQ3RDO0NBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFFO0NBQ3RELFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxHQUFFO0NBQ3pELFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRTtBQUN0RDtDQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRTtDQUMzRSxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBQztBQUM1RjtDQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRTtDQUNuQixRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUU7QUFDckI7Q0FDQSxLQUFLO0FBQ0w7Q0FDQSxJQUFJLElBQUksQ0FBQyxFQUFFLElBQUksR0FBRztBQUNsQjtDQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksR0FBRyxPQUFPLEtBQUssQ0FBQztBQUMvQztDQUNBLFFBQVEsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU07Q0FDNUIsUUFBUSxJQUFJLE1BQUs7QUFDakI7Q0FDQSxRQUFRLFFBQVEsSUFBSTtDQUNwQixZQUFZLEtBQUssQ0FBQztBQUNsQjtDQUNBLGdCQUFnQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO0NBQzFDLGdCQUFnQixJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDOUQsZ0JBQWdCLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7Q0FDNUssZ0JBQWdCLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO0NBQzdEO0NBQ0EsWUFBWSxNQUFNO0NBQ2xCLFlBQVksS0FBSyxDQUFDO0FBQ2xCO0NBQ0EsZ0JBQWdCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUM7Q0FDOUMsZ0JBQWdCLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNqRSxnQkFBZ0IsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVE7Q0FDL0ssZ0JBQWdCLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO0NBQzdEO0NBQ0EsWUFBWSxNQUFNO0NBQ2xCLFNBQVM7QUFDVDtDQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7Q0FDMUIsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQjtDQUNBLEtBQUs7QUFDTDtDQUNBLElBQUksS0FBSyxDQUFDLEdBQUc7QUFDYjtDQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7Q0FDNUI7Q0FDQSxLQUFLO0FBQ0w7Q0FDQSxJQUFJLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNuQjtDQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztDQUMzQixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDO0NBQ2pEO0NBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEdBQUcsT0FBTyxPQUFPLENBQUM7Q0FDN0QsYUFBYSxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFlBQVksR0FBRyxPQUFPLE1BQU0sQ0FBQztDQUMxRSxhQUFhLE9BQU8sVUFBVSxDQUFDO0FBQy9CO0NBQ0EsS0FBSztBQUNMO0NBQ0E7Q0FDQTtDQUNBO0FBQ0E7Q0FDQSxJQUFJLE9BQU8sQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNsQjtDQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7Q0FDNUIsUUFBUSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Q0FDdkIsUUFBUSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUI7Q0FDQSxLQUFLO0FBQ0w7Q0FDQSxJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNwQjtDQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7Q0FDM0IsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Q0FDOUIsUUFBUSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztDQUN6QixRQUFRLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUM7Q0FDNUIsUUFBUSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUI7Q0FDQSxLQUFLO0FBQ0w7Q0FDQSxJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNwQjtDQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTztBQUNsQztDQUNBO0FBQ0E7Q0FDQSxRQUFRLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7Q0FDOUIsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0NBQzNELFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzFFO0NBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0NBQ3pDLFFBQVEsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9EO0NBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO0FBQ2hDO0NBQ0EsWUFBWSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7Q0FDekMsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDbEU7Q0FDQSxZQUFZLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNyQyxZQUFZLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUMvQztDQUNBLFNBQVM7QUFDVDtDQUNBLFFBQVEsSUFBSSxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Q0FDbkMsUUFBUSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUNuQztDQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxLQUFLLElBQUksQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUNqRTtDQUNBLFFBQVEsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQztDQUM1QyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUNyQyxZQUFZLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztDQUN2RSxZQUFZLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUM7Q0FDaEMsWUFBWSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Q0FDbEMsWUFBWSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDL0IsU0FBUztBQUNUO0NBQ0EsS0FBSztBQUNMO0NBQ0EsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDaEI7Q0FDQSxRQUFRLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDdEM7Q0FDQSxRQUFRLElBQUksSUFBSSxLQUFLLFVBQVUsR0FBRztDQUNsQztDQUNBLFlBQVksSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7Q0FDckQ7Q0FDQSxZQUFZLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUc7Q0FDaEMsZ0JBQWdCLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztDQUN4RCxhQUFhLE1BQU0sS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRztDQUN2QyxnQkFBZ0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0NBQ3hELGFBQWE7Q0FDYjtDQUNBLFlBQVksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQztDQUMvQixZQUFZLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0NBQ3pCLFlBQVksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUNoQztDQUNBLFlBQVksT0FBTyxJQUFJLENBQUM7Q0FDeEI7Q0FDQSxTQUFTO0NBQ1QsUUFBUSxPQUFPLEtBQUssQ0FBQztBQUNyQjtDQUNBLEtBQUs7QUFDTDtDQUNBO0FBQ0E7Q0FDQSxJQUFJLFFBQVEsQ0FBQyxHQUFHO0FBQ2hCO0NBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7Q0FDbkIsUUFBUSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7Q0FDbkIsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0NBQ2xELFFBQVEsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQzNDLFFBQVEsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQzNDLFFBQVEsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUN0QyxRQUFRLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNsRztDQUNBLEtBQUs7QUFDTDtDQUNBLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHO0FBQ2xCO0NBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0NBQzNDLFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzlEO0NBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENB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QyxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO0NBQ3hELE9BQU8sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUMvQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUM5QixPQUFPLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN2QyxPQUFPO0FBQ1A7Q0FDQSxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUM7Q0FDcEQ7Q0FDQSxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUM1QyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQzNFLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztDQUNqQztDQUNBLFlBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcs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LENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDaEQ7Q0FDQSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7Q0FDeEMsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUM3RTtDQUNBLEtBQUssSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztDQUNuRCxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyRDtDQUNBLEtBQUssR0FBRyxDQUFDLEVBQUUsRUFBRSxPQUFPO0FBQ3BCO0NBQ0EsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0NBQ3hELEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7Q0FDdkUsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQztDQUMzRSxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzdD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S0FBSyxDQUFDO0FBQzFDO0NBQ0EsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUN0QjtDQUNBLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDM0IsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQzVCLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ25DLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDcEMsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDbkMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNwQyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDN0MsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUN0QyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDN0MsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdDO0NBQ0EsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEM7Q0FDQTtDQUNBO0FBQ0E7Q0FDQSxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDcEU7Q0FDQSxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztDQUM1QyxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztDQUM1QztDQUNBLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0NBQzdFLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7Q0FDMUUsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVB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QUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztDQUMxRSxZQUFZLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ2xDLFlBQVksQ0FBQyxFQUFFLENBQUM7QUFDaEI7Q0FDQSxTQUFTO0FBQ1Q7Q0FDQSxLQUFLO0FBQ0w7Q0FDQSxJQUFJLElBQUksQ0FBQyxHQUFHO0FBQ1o7Q0FDQSxRQUFRLEtBQUssQ0FBQyxJQUFJLEdBQUU7QUFDcEI7Q0FDQSxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3pDO0NBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDcEQ7Q0FDQSxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztDQUNsRSxhQUFhLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDMUQ7Q0FDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO0NBQ3hDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0NBQ3BDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0NBQ3BDLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDM0I7Q0FDQSxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDbkQ7Q0FDQSxLQUFLO0FBQ0w7Q0FDQSxJQUFJLEtBQUssQ0FBQyxHQUFHO0FBQ2I7Q0FDQSxRQUFRLEtBQUssQ0FBQyxLQUFLLEdBQUU7QUFDckI7Q0FDQSxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUM1QjtDQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ3BEO0NBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztDQUNuRSxhQUFhLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztDQUMzRDtDQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7Q0FDeEMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7Q0FDbkMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7Q0FDbkMsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUM1QjtDQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUN0RDtDQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFD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QUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7Q0FDdEQsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNyQyxTQUFTLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzNCO0NBQ0EsWUFBWSxJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztDQUN0RixjQUFjLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0FBQzdEO0NBQ0EsU0FBUyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDOUg7Q0FDQSxTQUFTO0FBQ1Q7Q0FDQSxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0NBQ3JCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDeEI7Q0FDQTtBQUNBO0NBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDcEI7Q0FDQSxRQUFRLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEVBQUU7Q0FDckMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQztDQUMxQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDO0NBQzlDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUk7Q0FDOUMsU0FBUztBQUNUO0NBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQzdCO0NBQ0EsS0FBSztBQUNMO0NBQ0EsSUFBSSxRQUFRLENBQUMsRUFBRSxLQUFLLEdBQUc7QUFDdkI7Q0FDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0NBQzNCLFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztDQUNyQyxRQUFRLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0NBQzNDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLElBQUksR0FBRyxDQUFDO0NBQ2hGLGlCQUFpQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMs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QUksRUFBRSxDQUFDO0NBQ2pDLGFBQWE7QUFDYjtDQUNBLFNBQVM7QUFDVDtDQUNBLFFBQVEsT0FBTyxHQUFHLENBQUM7QUFDbkI7Q0FDQSxLQUFLO0FBQ0w7Q0FDQTtBQUNBO0NBQ0EsSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUc7QUFDbEI7Q0FDQSxLQUFLLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN0QjtDQUNBLFFBQVEsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzdCO0NBQ0EsS0FBSztBQUNMO0NBQ0EsSUFBSSxRQUFRLENBQUMsR0FBRztBQUNoQjtDQUNBLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRTtDQUNyQztBQUNBO0NBQ0EsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNyQztDQUNBLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBQztDQUM1QyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFDcEM7Q0FDQSxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFHO0NBQzFCLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRTtBQUN0QjtDQUNBLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsS0FBSyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUs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LElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ25JLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNoRTtDQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztDQUNuRCxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUM1RSxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQzdGO0NBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBQztBQUNwQjtBQUNBO0NBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2hDO0NBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDcEI7Q0FDQSxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDM0I7Q0FDQSxLQUFLO0FBQ0w7Q0FDQSxJQUFJLElBQUksQ0FBQyxFQUFFLElBQUksR0FBRztBQUNsQjtDQUNBLFFBQVEsSUFBSSxFQUFFLEdB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QUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUMvRTtDQUNBLFFBQVEsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN6QztDQUNBLFFBQVEsS0FBSyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRztDQUN4QyxZQUFZLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUMzRCxZQUFZLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztDQUMzRCxZQUFZLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztDQUMzRCxTQUFTO0FBQ1Q7Q0FDQSxRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3pFO0NBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDdEI7Q0FDQSxLQUFLO0FBQ0w7Q0FDQSxJQUFJLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNuQjtDQUNBLFFBQVEsR0FBRyxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQztDQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Q0FDOUMsUUFBUSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDekI7Q0FDQSxLQUFLO0FBQ0w7Q0FDQSxJQUFJLE1BQU0sQ0FBQyxFQUFFLEVBQUUsR0FBRztBQUNsQjtDQUNBLFFBQVEsSUFBSSxFQUFFLEtBQUssU0FBUyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDekM7Q0FDQSxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLEVBQUU7QUFDcEM7Q0FDQSxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQzlCO0NBQ0EsZ0JBQWdCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMzQztDQUNBLGdCQUFnQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUM1RSxnQkFBZ0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUU7Q0FDQSxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDdkU7Q0FDQSxhQUFhO0FBQ2I7Q0FDQSxTQUFTO0FBQ1Q7Q0FDQSxRQUFRLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN6QjtDQUNBLFFBQVEsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0NBQzdCO0FBQ0E7Q0FDQSxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDcEQ7Q0FDQSxLQUFLO0FBQ0w7Q0FDQSxJQUFJLFNBQVMsQ0FBQyxHQUFHO0FBQ2pCO0NBQ0E7Q0FDQTtBQUNBO0NBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0NBQ2xFLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNsRTtDQUNBLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQztBQUM1QjtDQUNBLFlBQVksSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQzlDLFlBQVksSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQy9DO0NBQ0EsWUFBWSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO0NBQzdELFlBQVksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFD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Q0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25JO0NBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztDQUNuQyxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUU7Q0FDdEQsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFFO0NBQ3RELFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRTtDQUN0RCxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsR0FBRTtDQUN6RDtDQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRTtDQUNqRixRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBQztB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Q0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7Q0FDM0QsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDMUU7Q0FDQSxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzlDO0NBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN0RztDQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQ3ZELFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN6RDtDQUNBLFFBQVEsSUFBSSxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7Q0FDdEMsUUFBUSxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFB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QUFNO0NBQ2YsWUFBWSxJQUFJLEdBQUcsQ0FBQyxFQUFFLFVBQVUsR0FBRyxRQUFRLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNyRCxZQUFZLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO0NBQzFCLFNBQVM7QUFDVDtDQUNBLFFBQVEsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxFQUFFLENBQUMsR0FBRztBQUMzQztDQUNBLFlBQVksQ0FBQyxHQUFHLFVBQVUsS0FBSyxJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUM7Q0FDMUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO0NBQy9DLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztDQUMvQyxZQUFZLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7Q0FDaEQsWUFBWSxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO0NBQ2hELFlBQVksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDO0FBQzlEO0NBQ0EsU0FBUztBQUNUO0NBQ0EsUUFBUSxPQUFPLENBQUMsQ0FBQztBQUNqQjtDQUNBLEtBQUs7QUFDTDtDQUNBLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHO0FBQ2xCO0NBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0NBQzNDLFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzVEO0NBQ0EsUUFBUSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7Q0FDcEMsUUFBUSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsT0FBTyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUNyRTtDQUNBLFFBQVEsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQztDQUNqQyxRQUFRLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDakM7Q0FDQSxRQUFRLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLEdBQUcsS0FBSyxFQUFFLENBQUM7Q0FDbkMsUUFBUSxJQUFJLEVBQUUsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7Q0FDcEMsUUFBUSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsR0FBRyxHQUFHLEtBQUssRUFBRSxDQUFDO0NBQ25DLFFBQVEsSUFBSSxFQUFFLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3BDO0NBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksR0FBRyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7Q0FDckY7Q0FDQSxRQUFRLEtBQUssSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUc7QUFDOUI7Q0FDQSxZQUFZLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQztDQUM5QyxZQUFZLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQztDQUM5QyxZQUFZLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO0NBQ25DLFlBQVksSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztDQUNwQyxZQUFZLElBQUksR0FBRyxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUN2RCxZQUFZLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNqSTtDQUNBLFlBQVksSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO0NBQ25LLFlBQVksSUFBSSxDQUFDLE1BQU0sRUFBRSxJ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QUksR0FBRyxJQUFJLENBQUM7Q0FDekIsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ3ZDO0NBQ0EsUUFBUSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFNO0FBQy9EO0NBQ0EsUUFBUSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztDQUMzQyxRQUFRLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDL0Q7Q0FDQSxRQUFRLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNoRTtBQUNBO0FBQ0E7Q0FDQSxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2pELFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7Q0FDL0MsUUFBUSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztDQUM5QyxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQzlDO0NBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Q0FDdkQsUUFBUSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxN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WUFBWSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7Q0FDeEQsU0FBUztBQUNUO0NBQ0EsUUFBUSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDNUI7Q0FDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNwQztDQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUM3QjtDQUNBLFFBQVEsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzFDO0NBQ0EsS0FBSztBQUNMO0NBQ0EsSUFBSSxLQUFLLENBQUMsR0FBRztBQUNiO0NBQ0EsUUFBUSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDdEI7Q0FDQSxRQUFRLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUQ7Q0FDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNwQztDQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0NBQzVCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7Q0FDekMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7Q0FDbkMsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFD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QUFNLEVBQUUsQ0FBQztDQUNwQixLQUFLO0FBQ0w7Q0FDQSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtDQUNyQixNQUFNLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDNUU7Q0FDQTtDQUNBLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFDMUQ7Q0FDQTtDQUNBLE1BQU0sSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3REO0NBQ0EsTUFBTSxJQUFJLElBQUksR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0NBQ2hELE1BQU0sSUFBSSxVQUFVLEdBQUcsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUMzRDtDQUNBLE1BQU0sSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25EO0NBQ0EsTUFBTSxJQUFJLEtBQUssR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUNsQztDQUNBLE1BQU0sSUFBSSxLQUFLLENBQUM7Q0FDaEIsTUFBTSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO0NBQ3BELFFBQVEsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUM5QyxRQUFRLElBQUksQ0FBQyxLQUFL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QUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztDQUNsQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztDQUNsQyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO0NBQ3hELFFBQVEsTUFBTTtDQUNkLE1BQU0sS0FBSyxDQUFDO0NBQ1o7Q0FDQSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztDQUNqQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztDQUNsQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztDQUN0QyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO0NBQzVELFFBQVEsTUFBTTtDQUNkLEtBQUs7Q0FDTCxHQUFHO0FBQ0g7Q0FDQSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUU7Q0FDYixJQUFJLElBQUksVUFBVSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDMUQ7Q0FDQSxJQUFJLElBQUksT0FBTztDQUNmLE1BQU0sSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLEdBQUcsVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDNUU7Q0FDQSxJQUFJLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQztDQUMzQztBQUNBO0NBQ0EsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7Q0FDdEQsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztDQUM1RCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDakU7Q0FDQSxJQUFJLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUN4QixHQUFHO0FBQ0g7Q0FDQSxFQUFFLEtBQUssR0FBRztDQUNWLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2xCO0NBQ0EsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7Q0FDOUIsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDcEI7Q0FDQSxJQUFJLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7Q0FDckIsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztDQUNyRCxJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FB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QyxDQUFDO0NBQzVCLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7Q0FDM0IsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLENBQUM7QUFDckM7Q0FDQSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQztDQUN2QyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQztDQUNoQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLEVBQUM7Q0FDL0I7Q0FDQSxLQUFLO0FBQ0w7Q0FDQSxJQUFJLFFBQVEsQ0FBQyxHQUFHO0FBQ2hCO0NBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQ3ZCLFFBQVEsR0FBRyxDQUFDLENBQUMsRUFBRSxPQUFPO0NBQ3RCLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDO0NBQ2hDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsSUFBRztDQUNqQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUM5QjtDQUNBLEtBQUs7QUFDTDtDQUNBLElBQUksUUFBUSxDQUFDLEVBQUUsS0FBSyxHQUFHO0FBQ3ZCO0NBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQztBQUN2QztDQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztBQUMzQztDQUNBLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7Q0FDekQsYUFBYSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0FBQ3REO0NBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU87QUFDNUI7Q0FDQSxRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNwQjtDQUNBLEtBQUs7QUFDTDtDQUNBO0NBQ0E7Q0FDQTtBQUNBO0NBQ0EsSUFBSSxLQUFLLENBQUMsR0FBRztBQUNiO0NBQ0EsUUFBUSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDdEI7Q0FDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDdkIsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO0NBQ25DLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztBQUNwQztDQUNBLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztDQUNuQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7Q0FDcEM7Q0FDQSxLQUFLO0FBQ0w7QUFDQTtDQUNBOztDQ2pMTyxNQUFNLEtBQUssU0FBUyxLQUFLLENBQUM7QUFDakM7Q0FDQSxJQUFJLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHO0FBQzFCO0NBQ0EsUUFBUSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbkI7Q0FDQSxRQUFRLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO0FBQ3BDO0NBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLGlEQUFpRCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDdEo7Q0FDQSxRQUFRLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7QUFDM0I7Q0FDQSxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0NBQzdDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztDQUNyQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzNDO0NBQ0EsU0FBUztBQUNUO0NBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCO0NBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDO0NBQ2hEO0NBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxVQUFVLElBQUksTUFBTSxDQUFDO0FBQ2pEO0FBQ0E7Q0FDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxJQUFJLENB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QzdDO0NBQ0EsUUFBUSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdDO0NBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLDREQUE0RCxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDeEw7Q0FDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDekM7Q0FDQSxRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNwQjtDQUNBLEtBQUs7QUFDTDtDQUNBO0NBQ0E7Q0FDQTtBQUNBO0NBQ0EsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDcEI7Q0FDQSxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDL0I7Q0FDQTtBQUNBO0NBQ0EsS0FBSztBQUNMO0NBQ0EsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDcEI7Q0FDQSxRQUFRLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQzlDO0NBQ0EsUUFBUSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDO0FBQzlCO0NBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDcEI7Q0FDQSxRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQ3BCO0NBQ0EsS0FBSztBQUNMO0NBQ0EsSUFBSSxLQUFLLENBQUMsR0FB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QyxDQUFDLElBQUksQ0FBQztBQUN2RDtDQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO0NBQ3BELFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLFNBQVMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUNuRDtDQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDL0M7Q0FDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCO0FBQ0E7Q0FDQTtBQUNBO0NBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsUUFBTztBQUN6QztDQUNBO0FBQ0E7QUFDQTtBQUNBO0NBQ0EsUUFBUSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLEtBQUssU0FBUyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDO0FBQ3JFO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtBQUNBO0NBQ0E7Q0FDQTtBQUNBO0NBQ0E7Q0FDQTtBQUNBO0NBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Q0FDOUY7Q0FDQTtDQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3BDO0NBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDOUM7Q0FDQTtDQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsR0FBRztBQUN0QztDQUNBLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztDQUMzQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUM7Q0FDdEQsWUFBWSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztDQUMxQixZQUFZLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3pCO0NBQ0EsU0FBUztBQUNUO0NBQ0E7QUFDQTtDQUNBLFFBQVEsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU07QUFDNUI7QUFDQTtDQUNBO0NBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLDhCQUE4QixJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsd0JBQXdCLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0NBQzNJLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUMzQztDQUNBO0FBQ0E7Q0FDQSxRQUFRLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUU7QUFDakM7Q0FDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRTtDQUM5QyxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRTtDQUNoRCxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRTtDQUNoRCxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRTtDQUNoRCxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRTtBQUNoRDtDQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFFO0NBQ3JFLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUM7QUFDdEY7Q0FDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBRztBQUN2QjtDQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRTtDQUNuQixRQUFRLElBQUksQ0FBQyxRQUFRLEdBQUU7QUFDdkI7Q0FDQSxLQUFLO0NBQ0w7Q0FDQSxJQUFJLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRztDQUNuQjtDQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUMzQjtDQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUM7QUFDakQ7QUFDQTtBQUNBO0NBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEdBQUcsT0FBTyxPQUFPLENBQUM7Q0FDN0QsYUFBYSxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFlBQVksR0FBRyxPQUFPLE1BQU0sQ0FBQztDQUMxRSxhQUFhLE9BQU8sS0FBSyxDQUFDO0FBQzFCO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtBQUNBO0NBQ0EsS0FBSztBQUNMO0NBQ0EsSUFBSSxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDbEI7Q0FDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0NBQzVCLFFBQVEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVCO0NBQ0EsS0FBSztBQUNMO0NBQ0EsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDcEI7Q0FDQSxRQUFRLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLEdBQUc7QUFDMUM7Q0FDQSxZQUFZLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0NBQy9CLFlBQVksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQztDQUNoQyxZQUFZLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNoQyxTQUFTO0FBQ1Q7Q0FDQSxLQUFLO0FBQ0w7Q0FDQSxJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNwQjtDQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTztBQUNsQztDQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFFO0NBQzFELFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUU7Q0FDekU7QUFDQTtDQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFJO0FBQy9CO0NBQ0EsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFDO0NBQ2xCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUNsQjtDQUNBLFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFFO0NBQ3ZELFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFFO0FBQ3ZEO0NBQ0E7Q0FDQTtBQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7QUFDQTtDQUNBO0FBQ0E7Q0FDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQztDQUNqQztDQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUM1QjtDQUNBLEtBQUs7QUFDTDtDQUNBLElBQUksSUFBSSxDQUFDLEVBQUUsSUFBSSxHQUFHO0FBQ2xCO0NBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxHQUFHLE9BQU8sS0FBSyxDQUFDO0FBQy9DO0NBQ0EsUUFBUSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTTtBQUM1QjtDQUNBLFFBQVEsUUFBUSxJQUFJO0NBQ3BCLFlBQVksS0FBSyxDQUFDO0FBQ2xCO0NBQ0EsZ0JBQWdCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7Q0FDMUMsZ0JBQWdCLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUM7Q0FDM0QsZ0JBQWdCLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUM7Q0FDN0QsZ0JBQWdCLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUM7Q0FDN0QsZ0JBQWdCLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUM7Q0FDN0QsZ0JBQWdCLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUU7Q0FDOUQ7Q0FDQSxZQUFZLE1BQU07Q0FDbEIsWUFBWSxLQUFLLENBQUM7QUFDbEI7Q0FDQSxnQkFBZ0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQztDQUNoRCxnQkFBZ0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBQztDQUM5RCxnQkFBZ0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBQztDQUM5RCxnQkFBZ0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBQztDQUNoRSxnQkFBZ0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBQztDQUNoRSxnQkFBZ0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRTtDQUNwRTtDQUNBLFlBQVksTUFBTTtDQUNsQixTQUFTO0FBQ1Q7Q0FDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0NBQzFCLFFBQVEsT0FBTyxJQUFJLENBQUM7QUFDcEI7QUFDQTtBQUNBO0NBQ0EsS0FBSztBQUNMO0NBQ0EsSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUc7QUFDbEI7Q0FDQTtDQUNBO0NBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzNDO0NBQ0EsUUFBUSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDekI7Q0FDQSxRQUFRLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUM3QjtDQUNBLEtBQUs7QUFDTDtDQUNBLElBQUksU0FBUyxHQUFHO0FBQ2hCO0NBQ0EsUUFBUSxLQUFLLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxHQUFHO0FBQy9CO0NBQ0EsWUFBWSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0NBQzFELFlBQVksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUMxRDtDQUNBLFlBQVksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztDQUMxRCxZQUFZLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDMUQ7Q0FDQSxTQUFTO0FBQ1Q7Q0FDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Q0FDdEQsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3REO0NBQ0EsS0FBSztBQUNMO0NBQ0EsSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDakI7Q0FDQTtBQUNBO0NBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUM1QztDQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFNO0FBQzdCO0NBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztDQUN4RSxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3hFO0NBQ0EsS0FBSztBQUNMO0NBQ0EsSUFBSSxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEtBQUssR0FBRztBQUMvQjtDQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssU0FBUyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzdDO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7QUFDQTtDQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7Q0FDdkcsUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN2RztDQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFFO0FBQ3BIO0NBQ0E7QUFDQTtDQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUMxQjtDQUNBLEtBQUs7QUFDTDtDQUNBO0FBQ0E7Q0FDQTtBQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtBQUNBO0NBQ0E7QUFDQTtDQUNBOztBQzdQWSxPQUFDLEdBQUcsR0FBRyxZQUFZO0FBQy9CO0NBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUM7QUFDMUI7Q0FDQSxRQUFRLElBQUksSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsS0FBSyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDM0M7Q0FDQSxRQUFRLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFO0FBQ3RDO0NBQ0EsWUFBWSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3hCLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDM0I7Q0FDQSxTQUFTLE1BQU0sS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQUU7QUFDOUM7Q0FDQSxZQUFZLEdBQUcsR0FBRyxJQUFJLENBQUM7Q0FDdkIsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxT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SUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO0NBQ2xFLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztDQUNuRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztBQUN6RDtDQUNBLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxVQUFVO0NBQzNDLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0NBQzFELElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDdkMsR0FBRztBQUNIO0NBQ0EsRUFBRSxNQUFNLEdBQUc7Q0FDWCxJQUFJLEtBQUssQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0NBQzVCLEdBQUc7QUFDSDtDQUNBLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRTtDQUNkLElBQUksSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzNCO0NBQ0EsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDMUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0NBQ2xELElBQUksSUFBSSxJQUFJLENBQUMsUUFBUTtDQUNyQixNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0NBQzVFLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDN0MsR0FBRztBQUNIO0NBQ0EsRUFBRSxZQUFZLENBQUMsQ0FBQyxFQUFFO0NBQ2xCLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7Q0FDNUIsSUFBSSxPQUFPLENBQUMsRUFBRSxFQUFFO0NBQ2hCLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDN0IsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0NBQzFCLEtBQUs7Q0FDTCxHQUFHO0NBQ0g7Ozs7Ozs7Ozs7Ozs7OyJ9
