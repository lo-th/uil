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

export { Files, Gui, REVISION, Tools, add };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWlsLm1vZHVsZS5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvcmUvUm9vdHMuanMiLCIuLi9zcmMvY29yZS9Ub29scy5qcyIsIi4uL3NyYy9jb3JlL0ZpbGVzLmpzIiwiLi4vc3JjL2NvcmUvVjIuanMiLCIuLi9zcmMvY29yZS9Qcm90by5qcyIsIi4uL3NyYy9wcm90by9Cb29sLmpzIiwiLi4vc3JjL3Byb3RvL0J1dHRvbi5qcyIsIi4uL3NyYy9wcm90by9DaXJjdWxhci5qcyIsIi4uL3NyYy9wcm90by9Db2xvci5qcyIsIi4uL3NyYy9wcm90by9GcHMuanMiLCIuLi9zcmMvcHJvdG8vR3JhcGguanMiLCIuLi9zcmMvcHJvdG8vRW1wdHkuanMiLCIuLi9zcmMvcHJvdG8vR3JvdXAuanMiLCIuLi9zcmMvcHJvdG8vSm95c3RpY2suanMiLCIuLi9zcmMvcHJvdG8vS25vYi5qcyIsIi4uL3NyYy9wcm90by9MaXN0LmpzIiwiLi4vc3JjL3Byb3RvL051bWVyaWMuanMiLCIuLi9zcmMvcHJvdG8vU2xpZGUuanMiLCIuLi9zcmMvcHJvdG8vVGV4dElucHV0LmpzIiwiLi4vc3JjL3Byb3RvL1RpdGxlLmpzIiwiLi4vc3JjL3Byb3RvL1NlbGVjdC5qcyIsIi4uL3NyYy9wcm90by9CaXRtYXAuanMiLCIuLi9zcmMvcHJvdG8vU2VsZWN0b3IuanMiLCIuLi9zcmMvcHJvdG8vSXRlbS5qcyIsIi4uL3NyYy9wcm90by9HcmlkLmpzIiwiLi4vc3JjL3Byb3RvL1BhZDJELmpzIiwiLi4vc3JjL2NvcmUvYWRkLmpzIiwiLi4vc3JjL2NvcmUvR3VpLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAYXV0aG9yIGx0aCAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sby10aFxyXG4gKi9cclxuXHJcbmV4cG9ydCBjb25zdCBSRVZJU0lPTiA9IFwiNC4zLjBcIjtcclxuXHJcbi8vIElOVEVOQUwgRlVOQ1RJT05cclxuXHJcbmNvbnN0IFIgPSB7XHJcbiAgdWk6IFtdLFxyXG5cclxuICBkb206IG51bGwsXHJcblxyXG4gIElEOiBudWxsLFxyXG4gIGxvY2s6IGZhbHNlLFxyXG4gIHdsb2NrOiBmYWxzZSxcclxuICBjdXJyZW50OiAtMSxcclxuXHJcbiAgbmVlZFJlWm9uZTogdHJ1ZSxcclxuICBuZWVkUmVzaXplOiBmYWxzZSxcclxuICBmb3JjZVpvbmU6IGZhbHNlLFxyXG4gIGlzRXZlbnRzSW5pdDogZmFsc2UsXHJcbiAgaXNMZWF2ZTogZmFsc2UsXHJcbiAgYWRkRE9NRXZlbnRMaXN0ZW5lcnM6IHRydWUsXHJcblxyXG4gIGRvd25UaW1lOiAwLFxyXG4gIHByZXZUaW1lOiAwLFxyXG5cclxuICAvL3ByZXZEZWZhdWx0OiBbJ2NvbnRleHRtZW51JywgJ3doZWVsJ10sXHJcbiAgcHJldkRlZmF1bHQ6IFtcImNvbnRleHRtZW51XCJdLFxyXG4gIHBvaW50ZXJFdmVudDogW1wicG9pbnRlcmRvd25cIiwgXCJwb2ludGVybW92ZVwiLCBcInBvaW50ZXJ1cFwiXSxcclxuICBldmVudE91dDogW1wicG9pbnRlcmNhbmNlbFwiLCBcInBvaW50ZXJvdXRcIiwgXCJwb2ludGVybGVhdmVcIl0sXHJcblxyXG4gIHhtbHNlcmlhbGl6ZXI6IG51bGwsXHJcbiAgdG1wVGltZTogbnVsbCxcclxuICB0bXBJbWFnZTogbnVsbCxcclxuXHJcbiAgb2xkQ3Vyc29yOiBcImF1dG9cIixcclxuXHJcbiAgaW5wdXQ6IG51bGwsXHJcbiAgcGFyZW50OiBudWxsLFxyXG4gIGZpcnN0SW1wdXQ6IHRydWUsXHJcblxyXG4gIGhpZGRlbkltcHV0OiBudWxsLFxyXG4gIGhpZGRlblNpemVyOiBudWxsLFxyXG4gIGhhc0ZvY3VzOiBmYWxzZSxcclxuICBzdGFydElucHV0OiBmYWxzZSxcclxuICBpbnB1dFJhbmdlOiBbMCwgMF0sXHJcbiAgY3Vyc29ySWQ6IDAsXHJcbiAgc3RyOiBcIlwiLFxyXG4gIHBvczogMCxcclxuICBzdGFydFg6IC0xLFxyXG4gIG1vdmVYOiAtMSxcclxuXHJcbiAgZGVidWdJbnB1dDogZmFsc2UsXHJcblxyXG4gIGlzTG9vcDogZmFsc2UsXHJcbiAgbGlzdGVuczogW10sXHJcblxyXG4gIGU6IHtcclxuICAgIHR5cGU6IG51bGwsXHJcbiAgICBjbGllbnRYOiAwLFxyXG4gICAgY2xpZW50WTogMCxcclxuICAgIGtleUNvZGU6IE5hTixcclxuICAgIGtleTogbnVsbCxcclxuICAgIGRlbHRhOiAwLFxyXG4gIH0sXHJcblxyXG4gIGlzTW9iaWxlOiBmYWxzZSxcclxuXHJcbiAgbm93OiBudWxsLFxyXG4gIG5lZWRzVXBkYXRlOiBmYWxzZSxcclxuXHJcbiAgZ2V0VGltZTogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHNlbGYucGVyZm9ybWFuY2UgJiYgc2VsZi5wZXJmb3JtYW5jZS5ub3dcclxuICAgICAgPyBzZWxmLnBlcmZvcm1hbmNlLm5vdy5iaW5kKHBlcmZvcm1hbmNlKVxyXG4gICAgICA6IERhdGUubm93O1xyXG4gIH0sXHJcblxyXG4gIGFkZDogZnVuY3Rpb24gKG8pIHtcclxuICAgIC8vIFIudWlbMF0gaXMgZGUgR1VJIG9iamVjdCB0aGF0IGlzIGFkZGVkIGZpcnN0IGJ5IHRoZSBjb25zdHJ1Y3RvclxyXG4gICAgUi51aS5wdXNoKG8pO1xyXG4gICAgUi5nZXRab25lKG8pO1xyXG5cclxuICAgIGlmICghUi5pc0V2ZW50c0luaXQpIFIuaW5pdEV2ZW50cygpO1xyXG4gIH0sXHJcblxyXG4gIHRlc3RNb2JpbGU6IGZ1bmN0aW9uICgpIHtcclxuICAgIGxldCBuID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcclxuICAgIGlmIChcclxuICAgICAgbi5tYXRjaCgvQW5kcm9pZC9pKSB8fFxyXG4gICAgICBuLm1hdGNoKC93ZWJPUy9pKSB8fFxyXG4gICAgICBuLm1hdGNoKC9pUGhvbmUvaSkgfHxcclxuICAgICAgbi5tYXRjaCgvaVBhZC9pKSB8fFxyXG4gICAgICBuLm1hdGNoKC9pUG9kL2kpIHx8XHJcbiAgICAgIG4ubWF0Y2goL0JsYWNrQmVycnkvaSkgfHxcclxuICAgICAgbi5tYXRjaCgvV2luZG93cyBQaG9uZS9pKVxyXG4gICAgKVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIGVsc2UgcmV0dXJuIGZhbHNlO1xyXG4gIH0sXHJcblxyXG4gIHJlbW92ZTogZnVuY3Rpb24gKG8pIHtcclxuICAgIGxldCBpID0gUi51aS5pbmRleE9mKG8pO1xyXG5cclxuICAgIGlmIChpICE9PSAtMSkge1xyXG4gICAgICBSLnJlbW92ZUxpc3RlbihvKTtcclxuICAgICAgUi51aS5zcGxpY2UoaSwgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKFIudWkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIFIucmVtb3ZlRXZlbnRzKCk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vICAgRVZFTlRTXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBpbml0RXZlbnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoUi5pc0V2ZW50c0luaXQpIHJldHVybjtcclxuXHJcbiAgICBsZXQgZG9tID0gZG9jdW1lbnQuYm9keTtcclxuXHJcbiAgICBSLmlzTW9iaWxlID0gUi50ZXN0TW9iaWxlKCk7XHJcbiAgICBSLm5vdyA9IFIuZ2V0VGltZSgpO1xyXG5cclxuICAgIGlmICghUi5pc01vYmlsZSkge1xyXG4gICAgICBkb20uYWRkRXZlbnRMaXN0ZW5lcihcIndoZWVsXCIsIFIsIHsgcGFzc2l2ZTogZmFsc2UgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkb20uc3R5bGUudG91Y2hBY3Rpb24gPSBcIm5vbmVcIjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zb2xlLmxvZyhcIlIuYWRkRE9NRXZlbnRMaXN0ZW5lcnMgXCIgKyBSLmFkZERPTUV2ZW50TGlzdGVuZXJzKTtcclxuICAgIGlmIChSLmFkZERPTUV2ZW50TGlzdGVuZXJzKSB7XHJcbiAgICAgIGRvbS5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcmNhbmNlbFwiLCBSKTtcclxuICAgICAgZG9tLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVybGVhdmVcIiwgUik7XHJcbiAgICAgIC8vZG9tLmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVyb3V0JywgUiApXHJcblxyXG4gICAgICBkb20uYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJtb3ZlXCIsIFIpO1xyXG4gICAgICBkb20uYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJkb3duXCIsIFIpO1xyXG4gICAgICBkb20uYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJ1cFwiLCBSKTtcclxuXHJcbiAgICAgIGRvbS5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBSLCBmYWxzZSk7XHJcbiAgICAgIGRvbS5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgUiwgZmFsc2UpO1xyXG4gICAgfVxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgUi5yZXNpemUsIGZhbHNlKTtcclxuXHJcbiAgICAvL3dpbmRvdy5vbmJsdXIgPSBSLm91dDtcclxuICAgIC8vd2luZG93Lm9uZm9jdXMgPSBSLmluO1xyXG5cclxuICAgIFIuaXNFdmVudHNJbml0ID0gdHJ1ZTtcclxuICAgIFIuZG9tID0gZG9tO1xyXG4gIH0sXHJcblxyXG4gIHJlbW92ZUV2ZW50czogZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKCFSLmlzRXZlbnRzSW5pdCkgcmV0dXJuO1xyXG5cclxuICAgIGxldCBkb20gPSBkb2N1bWVudC5ib2R5O1xyXG5cclxuICAgIGlmICghUi5pc01vYmlsZSkge1xyXG4gICAgICBkb20ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIndoZWVsXCIsIFIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChSLmFkZERPTUV2ZW50TGlzdGVuZXJzKSB7XHJcbiAgICAgIGRvbS5yZW1vdmVFdmVudExpc3RlbmVyKFwicG9pbnRlcmNhbmNlbFwiLCBSKTtcclxuICAgICAgZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJwb2ludGVybGVhdmVcIiwgUik7XHJcbiAgICAgIC8vZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVyb3V0JywgUiApO1xyXG5cclxuICAgICAgZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJwb2ludGVybW92ZVwiLCBSKTtcclxuICAgICAgZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJwb2ludGVyZG93blwiLCBSKTtcclxuICAgICAgZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJwb2ludGVydXBcIiwgUik7XHJcblxyXG4gICAgICBkb20ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgUik7XHJcbiAgICAgIGRvbS5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgUik7XHJcbiAgICB9XHJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBSLnJlc2l6ZSk7XHJcblxyXG4gICAgUi5pc0V2ZW50c0luaXQgPSBmYWxzZTtcclxuICB9LFxyXG5cclxuICByZXNpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgIGxldCBpID0gUi51aS5sZW5ndGgsXHJcbiAgICAgIHU7XHJcblxyXG4gICAgd2hpbGUgKGktLSkge1xyXG4gICAgICB1ID0gUi51aVtpXTtcclxuICAgICAgaWYgKHUuaXNHdWkgJiYgIXUuaXNDYW52YXNPbmx5ICYmIHUuYXV0b1Jlc2l6ZSkgdS5jYWxjKCk7XHJcbiAgICB9XHJcblxyXG4gICAgUi5uZWVkUmVab25lID0gdHJ1ZTtcclxuICAgIFIubmVlZFJlc2l6ZSA9IGZhbHNlO1xyXG4gIH0sXHJcblxyXG4gIG91dDogZnVuY3Rpb24gKCkge1xyXG4gICAgY29uc29sZS5sb2coXCJpbSBhbSBvdXRcIik7XHJcbiAgICBSLmNsZWFyT2xkSUQoKTtcclxuICB9LFxyXG5cclxuICBpbjogZnVuY3Rpb24gKCkge1xyXG4gICAgY29uc29sZS5sb2coXCJpbSBhbSBpblwiKTtcclxuICAgIC8vICBSLmNsZWFyT2xkSUQoKTtcclxuICB9LFxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gICBIQU5ETEUgRVZFTlRTXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBmYWtlVXA6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuaGFuZGxlRXZlbnQoeyB0eXBlOiBcInBvaW50ZXJ1cFwiIH0pO1xyXG4gIH0sXHJcblxyXG4gIGhhbmRsZUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIC8vY29uc29sZS5sb2coXCJSb290cy5oYW5kbGVFdmVudCBcIitldmVudC50eXBlKVxyXG4gICAgLy9pZighZXZlbnQudHlwZSkgcmV0dXJuO1xyXG5cclxuICAgIGlmIChSLnByZXZEZWZhdWx0LmluZGV4T2YoZXZlbnQudHlwZSkgIT09IC0xKSBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgIGlmIChSLm5lZWRSZXNpemUpIFIucmVzaXplKCk7XHJcblxyXG4gICAgUi5maW5kWm9uZShSLmZvcmNlWm9uZSk7XHJcblxyXG4gICAgbGV0IGUgPSBSLmU7XHJcbiAgICBsZXQgbGVhdmUgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gXCJrZXlkb3duXCIpIFIua2V5ZG93bihldmVudCk7XHJcbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gXCJrZXl1cFwiKSBSLmtleXVwKGV2ZW50KTtcclxuXHJcbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gXCJ3aGVlbFwiKSBlLmRlbHRhID0gZXZlbnQuZGVsdGFZID4gMCA/IDEgOiAtMTtcclxuICAgIGVsc2UgZS5kZWx0YSA9IDA7XHJcblxyXG4gICAgbGV0IHB0eXBlID0gZXZlbnQucG9pbnRlclR5cGU7IC8vIG1vdXNlLCBwZW4sIHRvdWNoXHJcblxyXG4gICAgZS5jbGllbnRYID0gKHB0eXBlID09PSBcInRvdWNoXCIgPyBldmVudC5wYWdlWCA6IGV2ZW50LmNsaWVudFgpIHx8IDA7XHJcbiAgICBlLmNsaWVudFkgPSAocHR5cGUgPT09IFwidG91Y2hcIiA/IGV2ZW50LnBhZ2VZIDogZXZlbnQuY2xpZW50WSkgfHwgMDtcclxuXHJcbiAgICBlLnR5cGUgPSBldmVudC50eXBlO1xyXG5cclxuICAgIGlmIChSLmV2ZW50T3V0LmluZGV4T2YoZXZlbnQudHlwZSkgIT09IC0xKSB7XHJcbiAgICAgIGxlYXZlID0gdHJ1ZTtcclxuICAgICAgZS50eXBlID0gXCJtb3VzZXVwXCI7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGV2ZW50LnR5cGUgPT09IFwicG9pbnRlcmxlYXZlXCIpIFIuaXNMZWF2ZSA9IHRydWU7XHJcblxyXG4gICAgaWYgKGV2ZW50LnR5cGUgPT09IFwicG9pbnRlcmRvd25cIikgZS50eXBlID0gXCJtb3VzZWRvd25cIjtcclxuICAgIGlmIChldmVudC50eXBlID09PSBcInBvaW50ZXJ1cFwiKSBlLnR5cGUgPSBcIm1vdXNldXBcIjtcclxuICAgIGlmIChldmVudC50eXBlID09PSBcInBvaW50ZXJtb3ZlXCIpIHtcclxuICAgICAgaWYgKFIuaXNMZWF2ZSkge1xyXG4gICAgICAgIC8vIGlmIHVzZXIgcmVzaXplIG91dHNpZGUgdGhpcyBkb2N1bWVudFxyXG4gICAgICAgIFIuaXNMZWF2ZSA9IGZhbHNlO1xyXG4gICAgICAgIFIucmVzaXplKCk7XHJcbiAgICAgIH1cclxuICAgICAgZS50eXBlID0gXCJtb3VzZW1vdmVcIjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBkb3VibGUgY2xpY2sgdGVzdFxyXG4gICAgaWYgKGUudHlwZSA9PT0gXCJtb3VzZWRvd25cIikge1xyXG4gICAgICBSLmRvd25UaW1lID0gUi5ub3coKTtcclxuICAgICAgbGV0IHRpbWUgPSBSLmRvd25UaW1lIC0gUi5wcmV2VGltZTtcclxuXHJcbiAgICAgIC8vIGRvdWJsZSBjbGljayBvbiBpbXB1dFxyXG4gICAgICBpZiAodGltZSA8IDIwMCkge1xyXG4gICAgICAgIFIuc2VsZWN0QWxsKCk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBSLnByZXZUaW1lID0gUi5kb3duVGltZTtcclxuICAgICAgUi5mb3JjZVpvbmUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBmb3IgaW1wdXRcclxuICAgIGlmIChlLnR5cGUgPT09IFwibW91c2Vkb3duXCIpIFIuY2xlYXJJbnB1dCgpO1xyXG5cclxuICAgIC8vIG1vdXNlIGxvY2tcclxuICAgIGlmIChlLnR5cGUgPT09IFwibW91c2Vkb3duXCIpIFIubG9jayA9IHRydWU7XHJcbiAgICBpZiAoZS50eXBlID09PSBcIm1vdXNldXBcIikgUi5sb2NrID0gZmFsc2U7XHJcblxyXG4gICAgLy9pZiggUi5jdXJyZW50ICE9PSBudWxsICYmIFIuY3VycmVudC5uZXZlcmxvY2sgKSBSLmxvY2sgPSBmYWxzZTtcclxuXHJcbiAgICAvKmlmKCBlLnR5cGUgPT09ICdtb3VzZWRvd24nICYmIGV2ZW50LmJ1dHRvbiA9PT0gMSl7XHJcbiAgICAgICAgICAgIFIuY3Vyc29yKClcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH0qL1xyXG5cclxuICAgIC8vY29uc29sZS5sb2coXCJwNCBcIitSLmlzTW9iaWxlK1wiIFwiK2UudHlwZStcIiBcIitSLmxvY2spXHJcblxyXG4gICAgaWYgKFIuaXNNb2JpbGUgJiYgZS50eXBlID09PSBcIm1vdXNlZG93blwiKSBSLmZpbmRJRChlKTtcclxuICAgIGlmIChlLnR5cGUgPT09IFwibW91c2Vtb3ZlXCIgJiYgIVIubG9jaykgUi5maW5kSUQoZSk7XHJcblxyXG4gICAgaWYgKFIuSUQgIT09IG51bGwpIHtcclxuICAgICAgaWYgKFIuSUQuaXNDYW52YXNPbmx5KSB7XHJcbiAgICAgICAgZS5jbGllbnRYID0gUi5JRC5tb3VzZS54O1xyXG4gICAgICAgIGUuY2xpZW50WSA9IFIuSUQubW91c2UueTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy9pZiggUi5JRC5tYXJnaW5EaXYgKSBlLmNsaWVudFkgLT0gUi5JRC5tYXJnaW4gKiAwLjVcclxuXHJcbiAgICAgIFIuSUQuaGFuZGxlRXZlbnQoZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKFIuaXNNb2JpbGUgJiYgZS50eXBlID09PSBcIm1vdXNldXBcIikgUi5jbGVhck9sZElEKCk7XHJcbiAgICBpZiAobGVhdmUpIFIuY2xlYXJPbGRJRCgpO1xyXG4gIH0sXHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyAgIElEXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBmaW5kSUQ6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBsZXQgaSA9IFIudWkubGVuZ3RoLFxyXG4gICAgICBuZXh0ID0gLTEsXHJcbiAgICAgIHUsXHJcbiAgICAgIHgsXHJcbiAgICAgIHk7XHJcblxyXG4gICAgd2hpbGUgKGktLSkge1xyXG4gICAgICB1ID0gUi51aVtpXTtcclxuXHJcbiAgICAgIGlmICh1LmlzQ2FudmFzT25seSkge1xyXG4gICAgICAgIHggPSB1Lm1vdXNlLng7XHJcbiAgICAgICAgeSA9IHUubW91c2UueTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB4ID0gZS5jbGllbnRYO1xyXG4gICAgICAgIHkgPSBlLmNsaWVudFk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChSLm9uWm9uZSh1LCB4LCB5KSkge1xyXG4gICAgICAgIG5leHQgPSBpO1xyXG5cclxuICAgICAgICBpZiAobmV4dCAhPT0gUi5jdXJyZW50KSB7XHJcbiAgICAgICAgICBSLmNsZWFyT2xkSUQoKTtcclxuICAgICAgICAgIFIuY3VycmVudCA9IG5leHQ7XHJcbiAgICAgICAgICBSLklEID0gdTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAobmV4dCA9PT0gLTEpIFIuY2xlYXJPbGRJRCgpO1xyXG4gIH0sXHJcblxyXG4gIGNsZWFyT2xkSUQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICghUi5JRCkgcmV0dXJuO1xyXG4gICAgUi5jdXJyZW50ID0gLTE7XHJcbiAgICBSLklELnJlc2V0KCk7XHJcbiAgICBSLklEID0gbnVsbDtcclxuICAgIFIuY3Vyc29yKCk7XHJcbiAgfSxcclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vICAgR1VJIC8gR1JPVVAgRlVOQ1RJT05cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGNhbGNVaXM6ICh1aXMsIHpvbmUsIHB5LCBncm91cCA9IGZhbHNlKSA9PiB7XHJcbiAgICAvL2NvbnNvbGUubG9nKCdjYWxjX3VpcycpXHJcblxyXG4gICAgbGV0IGkgPSB1aXMubGVuZ3RoLFxyXG4gICAgICB1LFxyXG4gICAgICBweCA9IDAsXHJcbiAgICAgIG4gPSAwLFxyXG4gICAgICB0dyxcclxuICAgICAgbSxcclxuICAgICAgZGl2O1xyXG5cclxuICAgIGxldCBoZWlnaHQgPSAwO1xyXG5cclxuICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgdSA9IHVpc1tuXTtcclxuICAgICAgbisrO1xyXG5cclxuICAgICAgaWYgKCFncm91cCAmJiB1LmlzR3JvdXApIHUuY2FsY1VpcygpO1xyXG5cclxuICAgICAgbSA9IHUubWFyZ2luO1xyXG4gICAgICAvL2RpdiA9IHUubWFyZ2luRGl2XHJcblxyXG4gICAgICB1LnpvbmUudyA9IHUudztcclxuICAgICAgdS56b25lLmggPSB1LmggKyBtO1xyXG5cclxuICAgICAgaWYgKCF1LmF1dG9XaWR0aCkge1xyXG4gICAgICAgIGlmIChweCA9PT0gMCkgaGVpZ2h0ICs9IHUuaCArIG07XHJcblxyXG4gICAgICAgIHUuem9uZS54ID0gem9uZS54ICsgcHg7XHJcbiAgICAgICAgdS56b25lLnkgPSBweTsgLy8gKyB1Lm10b3BcclxuICAgICAgICAvL2lmKGRpdikgdS56b25lLnkgKz0gbSAqIDAuNVxyXG5cclxuICAgICAgICB0dyA9IFIuZ2V0V2lkdGgodSk7XHJcbiAgICAgICAgaWYgKHR3KSB1LnpvbmUudyA9IHUudyA9IHR3O1xyXG4gICAgICAgIGVsc2UgaWYgKHUuZncpIHUuem9uZS53ID0gdS53ID0gdS5mdztcclxuXHJcbiAgICAgICAgcHggKz0gdS56b25lLnc7XHJcblxyXG4gICAgICAgIGlmIChweCA+PSB6b25lLncpIHtcclxuICAgICAgICAgIHB5ICs9IHUuaCArIG07XHJcbiAgICAgICAgICAvL2lmKGRpdikgcHkgKz0gbSAqIDAuNVxyXG4gICAgICAgICAgcHggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBweCA9IDA7XHJcblxyXG4gICAgICAgIHUuem9uZS54ID0gem9uZS54ICsgdS5keDtcclxuICAgICAgICB1LnpvbmUueSA9IHB5O1xyXG4gICAgICAgIHB5ICs9IHUuaCArIG07XHJcblxyXG4gICAgICAgIGhlaWdodCArPSB1LmggKyBtO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGhlaWdodDtcclxuICB9LFxyXG5cclxuICBmaW5kVGFyZ2V0OiBmdW5jdGlvbiAodWlzLCBlKSB7XHJcbiAgICBsZXQgaSA9IHVpcy5sZW5ndGg7XHJcblxyXG4gICAgd2hpbGUgKGktLSkge1xyXG4gICAgICBpZiAoUi5vblpvbmUodWlzW2ldLCBlLmNsaWVudFgsIGUuY2xpZW50WSkpIHJldHVybiBpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiAtMTtcclxuICB9LFxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gICBaT05FXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBmaW5kWm9uZTogZnVuY3Rpb24gKGZvcmNlKSB7XHJcbiAgICBpZiAoIVIubmVlZFJlWm9uZSAmJiAhZm9yY2UpIHJldHVybjtcclxuXHJcbiAgICB2YXIgaSA9IFIudWkubGVuZ3RoLFxyXG4gICAgICB1O1xyXG5cclxuICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgdSA9IFIudWlbaV07XHJcbiAgICAgIFIuZ2V0Wm9uZSh1KTtcclxuICAgICAgaWYgKHUuaXNHdWkpIHUuY2FsY1VpcygpO1xyXG4gICAgfVxyXG5cclxuICAgIFIubmVlZFJlWm9uZSA9IGZhbHNlO1xyXG4gIH0sXHJcblxyXG4gIG9uWm9uZTogZnVuY3Rpb24gKG8sIHgsIHkpIHtcclxuICAgIGlmICh4ID09PSB1bmRlZmluZWQgfHwgeSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgbGV0IHogPSBvLnpvbmU7XHJcbiAgICBsZXQgbXggPSB4IC0gei54OyAvLyAtIG8uZHg7XHJcbiAgICBsZXQgbXkgPSB5IC0gei55O1xyXG5cclxuICAgIC8vaWYoIHRoaXMubWFyZ2luRGl2ICkgZS5jbGllbnRZIC09IHRoaXMubWFyZ2luICogMC41XHJcbiAgICAvL2lmKCBvLmdyb3VwICYmIG8uZ3JvdXAubWFyZ2luRGl2ICkgbXkgKz0gby5ncm91cC5tYXJnaW4gKiAwLjVcclxuICAgIC8vaWYoIG8uZ3JvdXAgIT09IG51bGwgKSBteCAtPSBvLmR4XHJcblxyXG4gICAgbGV0IG92ZXIgPSBteCA+PSAwICYmIG15ID49IDAgJiYgbXggPD0gei53ICYmIG15IDw9IHouaDtcclxuXHJcbiAgICAvL2lmKCBvLm1hcmdpbkRpdiApIG15IC09IG8ubWFyZ2luICogMC41XHJcblxyXG4gICAgaWYgKG92ZXIpIG8ubG9jYWwuc2V0KG14LCBteSk7XHJcbiAgICBlbHNlIG8ubG9jYWwubmVnKCk7XHJcblxyXG4gICAgcmV0dXJuIG92ZXI7XHJcbiAgfSxcclxuXHJcbiAgZ2V0V2lkdGg6IGZ1bmN0aW9uIChvKSB7XHJcbiAgICAvL3JldHVybiBvLmdldERvbSgpLm9mZnNldFdpZHRoXHJcbiAgICByZXR1cm4gby5nZXREb20oKS5jbGllbnRXaWR0aDtcclxuXHJcbiAgICAvL2xldCByID0gby5nZXREb20oKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgIC8vcmV0dXJuIChyLndpZHRoKVxyXG4gICAgLy9yZXR1cm4gTWF0aC5mbG9vcihyLndpZHRoKVxyXG4gIH0sXHJcblxyXG4gIGdldFpvbmU6IGZ1bmN0aW9uIChvKSB7XHJcbiAgICBpZiAoby5pc0NhbnZhc09ubHkpIHJldHVybjtcclxuICAgIGxldCByID0gby5nZXREb20oKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAvL2lmKCAhci53aWR0aCApIHJldHVyblxyXG4gICAgLy9vLnpvbmUgPSB7IHg6TWF0aC5mbG9vcihyLmxlZnQpLCB5Ok1hdGguZmxvb3Ioci50b3ApLCB3Ok1hdGguZmxvb3Ioci53aWR0aCksIGg6TWF0aC5mbG9vcihyLmhlaWdodCkgfTtcclxuICAgIC8vby56b25lID0geyB4Ok1hdGgucm91bmQoci5sZWZ0KSwgeTpNYXRoLnJvdW5kKHIudG9wKSwgdzpNYXRoLnJvdW5kKHIud2lkdGgpLCBoOk1hdGgucm91bmQoci5oZWlnaHQpIH07XHJcbiAgICBvLnpvbmUgPSB7IHg6IHIubGVmdCwgeTogci50b3AsIHc6IHIud2lkdGgsIGg6IHIuaGVpZ2h0IH07XHJcblxyXG4gICAgLy9jb25zb2xlLmxvZyhvLm5hbWUsIG8uem9uZSlcclxuICB9LFxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gICBDVVJTT1JcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGN1cnNvcjogZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgIG5hbWUgPSBuYW1lID8gbmFtZSA6IFwiYXV0b1wiO1xyXG4gICAgaWYgKG5hbWUgIT09IFIub2xkQ3Vyc29yKSB7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gbmFtZTtcclxuICAgICAgUi5vbGRDdXJzb3IgPSBuYW1lO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyAgIENBTlZBU1xyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgdG9DYW52YXM6IGZ1bmN0aW9uIChvLCB3LCBoLCBmb3JjZSkge1xyXG4gICAgaWYgKCFSLnhtbHNlcmlhbGl6ZXIpIFIueG1sc2VyaWFsaXplciA9IG5ldyBYTUxTZXJpYWxpemVyKCk7XHJcblxyXG4gICAgLy8gcHJldmVudCBleGVzaXZlIHJlZHJhd1xyXG5cclxuICAgIGlmIChmb3JjZSAmJiBSLnRtcFRpbWUgIT09IG51bGwpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KFIudG1wVGltZSk7XHJcbiAgICAgIFIudG1wVGltZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKFIudG1wVGltZSAhPT0gbnVsbCkgcmV0dXJuO1xyXG5cclxuICAgIGlmIChSLmxvY2spXHJcbiAgICAgIFIudG1wVGltZSA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIFIudG1wVGltZSA9IG51bGw7XHJcbiAgICAgIH0sIDEwKTtcclxuXHJcbiAgICAvLy9cclxuXHJcbiAgICBsZXQgaXNOZXdTaXplID0gZmFsc2U7XHJcbiAgICBpZiAodyAhPT0gby5jYW52YXMud2lkdGggfHwgaCAhPT0gby5jYW52YXMuaGVpZ2h0KSBpc05ld1NpemUgPSB0cnVlO1xyXG5cclxuICAgIGlmIChSLnRtcEltYWdlID09PSBudWxsKSBSLnRtcEltYWdlID0gbmV3IEltYWdlKCk7XHJcblxyXG4gICAgbGV0IGltZyA9IFIudG1wSW1hZ2U7IC8vbmV3IEltYWdlKCk7XHJcblxyXG4gICAgbGV0IGh0bWxTdHJpbmcgPSBSLnhtbHNlcmlhbGl6ZXIuc2VyaWFsaXplVG9TdHJpbmcoby5jb250ZW50KTtcclxuXHJcbiAgICBsZXQgc3ZnID1cclxuICAgICAgJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiJyArXHJcbiAgICAgIHcgK1xyXG4gICAgICAnXCIgaGVpZ2h0PVwiJyArXHJcbiAgICAgIGggK1xyXG4gICAgICAnXCI+PGZvcmVpZ25PYmplY3Qgc3R5bGU9XCJwb2ludGVyLWV2ZW50czogbm9uZTsgbGVmdDowO1wiIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIj4nICtcclxuICAgICAgaHRtbFN0cmluZyArXHJcbiAgICAgIFwiPC9mb3JlaWduT2JqZWN0Pjwvc3ZnPlwiO1xyXG5cclxuICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGxldCBjdHggPSBvLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblxyXG4gICAgICBpZiAoaXNOZXdTaXplKSB7XHJcbiAgICAgICAgby5jYW52YXMud2lkdGggPSB3O1xyXG4gICAgICAgIG8uY2FudmFzLmhlaWdodCA9IGg7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCB3LCBoKTtcclxuICAgICAgfVxyXG4gICAgICBjdHguZHJhd0ltYWdlKHRoaXMsIDAsIDApO1xyXG5cclxuICAgICAgby5vbkRyYXcoKTtcclxuICAgIH07XHJcblxyXG4gICAgaW1nLnNyYyA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUklDb21wb25lbnQoc3ZnKTtcclxuICAgIC8vaW1nLnNyYyA9ICdkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LCcrIHdpbmRvdy5idG9hKCBzdmcgKTtcclxuICAgIGltZy5jcm9zc09yaWdpbiA9IFwiXCI7XHJcbiAgICBSLm5lZWRzVXBkYXRlID0gZmFsc2U7XHJcbiAgfSxcclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vICAgSU5QVVRcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIHNldEhpZGRlbjogZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKFIuaGlkZGVuSW1wdXQgPT09IG51bGwpIHtcclxuICAgICAgLy9sZXQgY3NzID0gUi5wYXJlbnQuY3NzLnR4dHNlbGVjdCArICdwYWRkaW5nOjA7IHdpZHRoOmF1dG87IGhlaWdodDphdXRvOyAnXHJcbiAgICAgIC8vbGV0IGNzcyA9IFIucGFyZW50LmNzcy50eHQgKyAncGFkZGluZzowOyB3aWR0aDphdXRvOyBoZWlnaHQ6YXV0bzsgdGV4dC1zaGFkb3c6bm9uZTsnXHJcbiAgICAgIC8vY3NzICs9ICdsZWZ0OjEwcHg7IHRvcDphdXRvOyBib3JkZXI6bm9uZTsgY29sb3I6I0ZGRjsgYmFja2dyb3VuZDojMDAwOycgKyBoaWRlO1xyXG5cclxuICAgICAgUi5oaWRkZW5JbXB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcclxuICAgICAgUi5oaWRkZW5JbXB1dC50eXBlID0gXCJ0ZXh0XCI7XHJcbiAgICAgIC8vUi5oaWRkZW5JbXB1dC5zdHlsZS5jc3NUZXh0ID0gY3NzICsgJ2JvdHRvbTozMHB4OycgKyAoUi5kZWJ1Z0lucHV0ID8gJycgOiAndHJhbnNmb3JtOnNjYWxlKDApOycpO1xyXG5cclxuICAgICAgUi5oaWRkZW5TaXplciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgIC8vUi5oaWRkZW5TaXplci5zdHlsZS5jc3NUZXh0ID0gY3NzICsgJ2JvdHRvbTo2MHB4Oyc7XHJcblxyXG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKFIuaGlkZGVuSW1wdXQpO1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKFIuaGlkZGVuU2l6ZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBoaWRlID0gUi5kZWJ1Z0lucHV0ID8gXCJcIiA6IFwib3BhY2l0eTowOyB6SW5kZXg6MDtcIjtcclxuICAgIGxldCBjc3MgPVxyXG4gICAgICBSLnBhcmVudC5jc3MudHh0c2VsZWN0ICtcclxuICAgICAgXCJwYWRkaW5nOjA7IHdpZHRoOmF1dG87IGhlaWdodDphdXRvOyBsZWZ0OjEwcHg7IHRvcDphdXRvOyBjb2xvcjojRkZGOyBiYWNrZ3JvdW5kOiMwMDA7XCIgK1xyXG4gICAgICBoaWRlO1xyXG4gICAgUi5oaWRkZW5JbXB1dC5zdHlsZS5jc3NUZXh0ID1cclxuICAgICAgY3NzICsgXCJib3R0b206MTBweDtcIiArIChSLmRlYnVnSW5wdXQgPyBcIlwiIDogXCJ0cmFuc2Zvcm06c2NhbGUoMCk7XCIpO1xyXG4gICAgUi5oaWRkZW5TaXplci5zdHlsZS5jc3NUZXh0ID0gY3NzICsgXCJib3R0b206NDBweDtcIjtcclxuXHJcbiAgICBSLmhpZGRlbkltcHV0LnN0eWxlLndpZHRoID0gUi5pbnB1dC5jbGllbnRXaWR0aCArIFwicHhcIjtcclxuICAgIFIuaGlkZGVuSW1wdXQudmFsdWUgPSBSLnN0cjtcclxuICAgIFIuaGlkZGVuU2l6ZXIuaW5uZXJIVE1MID0gUi5zdHI7XHJcblxyXG4gICAgUi5oYXNGb2N1cyA9IHRydWU7XHJcbiAgfSxcclxuXHJcbiAgY2xlYXJIaWRkZW46IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBpZiAoUi5oaWRkZW5JbXB1dCA9PT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgUi5oYXNGb2N1cyA9IGZhbHNlO1xyXG4gIH0sXHJcblxyXG4gIGNsaWNrUG9zOiBmdW5jdGlvbiAoeCkge1xyXG4gICAgbGV0IGkgPSBSLnN0ci5sZW5ndGgsXHJcbiAgICAgIGwgPSAwLFxyXG4gICAgICBuID0gMDtcclxuICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgbCArPSBSLnRleHRXaWR0aChSLnN0cltuXSk7XHJcbiAgICAgIGlmIChsID49IHgpIGJyZWFrO1xyXG4gICAgICBuKys7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbjtcclxuICB9LFxyXG5cclxuICB1cElucHV0OiBmdW5jdGlvbiAoeCwgZG93bikge1xyXG4gICAgaWYgKFIucGFyZW50ID09PSBudWxsKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgbGV0IHVwID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKGRvd24pIHtcclxuICAgICAgbGV0IGlkID0gUi5jbGlja1Bvcyh4KTtcclxuXHJcbiAgICAgIFIubW92ZVggPSBpZDtcclxuXHJcbiAgICAgIGlmIChSLnN0YXJ0WCA9PT0gLTEpIHtcclxuICAgICAgICBSLnN0YXJ0WCA9IGlkO1xyXG4gICAgICAgIFIuY3Vyc29ySWQgPSBpZDtcclxuICAgICAgICBSLmlucHV0UmFuZ2UgPSBbUi5zdGFydFgsIFIuc3RhcnRYXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZXQgaXNTZWxlY3Rpb24gPSBSLm1vdmVYICE9PSBSLnN0YXJ0WDtcclxuXHJcbiAgICAgICAgaWYgKGlzU2VsZWN0aW9uKSB7XHJcbiAgICAgICAgICBpZiAoUi5zdGFydFggPiBSLm1vdmVYKSBSLmlucHV0UmFuZ2UgPSBbUi5tb3ZlWCwgUi5zdGFydFhdO1xyXG4gICAgICAgICAgZWxzZSBSLmlucHV0UmFuZ2UgPSBbUi5zdGFydFgsIFIubW92ZVhdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgdXAgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKFIuc3RhcnRYICE9PSAtMSkge1xyXG4gICAgICAgIFIuaGFzRm9jdXMgPSB0cnVlO1xyXG4gICAgICAgIFIuaGlkZGVuSW1wdXQuZm9jdXMoKTtcclxuICAgICAgICBSLmhpZGRlbkltcHV0LnNlbGVjdGlvblN0YXJ0ID0gUi5pbnB1dFJhbmdlWzBdO1xyXG4gICAgICAgIFIuaGlkZGVuSW1wdXQuc2VsZWN0aW9uRW5kID0gUi5pbnB1dFJhbmdlWzFdO1xyXG4gICAgICAgIFIuc3RhcnRYID0gLTE7XHJcblxyXG4gICAgICAgIHVwID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh1cCkgUi5zZWxlY3RQYXJlbnQoKTtcclxuXHJcbiAgICByZXR1cm4gdXA7XHJcbiAgfSxcclxuXHJcbiAgc2VsZWN0QWxsOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoIVIucGFyZW50KSByZXR1cm47XHJcblxyXG4gICAgUi5zdHIgPSBSLmlucHV0LnRleHRDb250ZW50O1xyXG4gICAgUi5pbnB1dFJhbmdlID0gWzAsIFIuc3RyLmxlbmd0aF07XHJcbiAgICBSLmhhc0ZvY3VzID0gdHJ1ZTtcclxuICAgIFIuaGlkZGVuSW1wdXQuZm9jdXMoKTtcclxuICAgIFIuaGlkZGVuSW1wdXQuc2VsZWN0aW9uU3RhcnQgPSBSLmlucHV0UmFuZ2VbMF07XHJcbiAgICBSLmhpZGRlbkltcHV0LnNlbGVjdGlvbkVuZCA9IFIuaW5wdXRSYW5nZVsxXTtcclxuICAgIFIuY3Vyc29ySWQgPSBSLmlucHV0UmFuZ2VbMV07XHJcbiAgICBSLnNlbGVjdFBhcmVudCgpO1xyXG4gIH0sXHJcblxyXG4gIHNlbGVjdFBhcmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGMgPSBSLnRleHRXaWR0aChSLnN0ci5zdWJzdHJpbmcoMCwgUi5jdXJzb3JJZCkpO1xyXG4gICAgdmFyIGUgPSBSLnRleHRXaWR0aChSLnN0ci5zdWJzdHJpbmcoMCwgUi5pbnB1dFJhbmdlWzBdKSk7XHJcbiAgICB2YXIgcyA9IFIudGV4dFdpZHRoKFIuc3RyLnN1YnN0cmluZyhSLmlucHV0UmFuZ2VbMF0sIFIuaW5wdXRSYW5nZVsxXSkpO1xyXG5cclxuICAgIFIucGFyZW50LnNlbGVjdChjLCBlLCBzLCBSLmhpZGRlblNpemVyLmlubmVySFRNTCk7XHJcbiAgfSxcclxuXHJcbiAgdGV4dFdpZHRoOiBmdW5jdGlvbiAodGV4dCkge1xyXG4gICAgaWYgKFIuaGlkZGVuU2l6ZXIgPT09IG51bGwpIHJldHVybiAwO1xyXG4gICAgdGV4dCA9IHRleHQucmVwbGFjZSgvIC9nLCBcIiZuYnNwO1wiKTtcclxuICAgIFIuaGlkZGVuU2l6ZXIuaW5uZXJIVE1MID0gdGV4dDtcclxuICAgIHJldHVybiBSLmhpZGRlblNpemVyLmNsaWVudFdpZHRoO1xyXG4gIH0sXHJcblxyXG4gIGNsZWFySW5wdXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmIChSLnBhcmVudCA9PT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgaWYgKCFSLmZpcnN0SW1wdXQpIFIucGFyZW50LnZhbGlkYXRlKHRydWUpO1xyXG5cclxuICAgIFIuY2xlYXJIaWRkZW4oKTtcclxuICAgIFIucGFyZW50LnVuc2VsZWN0KCk7XHJcblxyXG4gICAgLy9SLmlucHV0LnN0eWxlLmJhY2tncm91bmQgPSAnbm9uZSc7XHJcbiAgICBSLmlucHV0LnN0eWxlLmJhY2tncm91bmQgPSBSLnBhcmVudC5jb2xvcnMuYmFjaztcclxuICAgIFIuaW5wdXQuc3R5bGUuYm9yZGVyQ29sb3IgPSBSLnBhcmVudC5jb2xvcnMuYm9yZGVyO1xyXG4gICAgLy9SLmlucHV0LnN0eWxlLmNvbG9yID0gUi5wYXJlbnQuY29sb3JzLnRleHQ7XHJcbiAgICBSLnBhcmVudC5pc0VkaXQgPSBmYWxzZTtcclxuXHJcbiAgICBSLmlucHV0ID0gbnVsbDtcclxuICAgIFIucGFyZW50ID0gbnVsbDtcclxuICAgIChSLnN0ciA9IFwiXCIpLCAoUi5maXJzdEltcHV0ID0gdHJ1ZSk7XHJcbiAgfSxcclxuXHJcbiAgc2V0SW5wdXQ6IGZ1bmN0aW9uIChJbnB1dCwgcGFyZW50KSB7XHJcbiAgICBSLmNsZWFySW5wdXQoKTtcclxuXHJcbiAgICBSLmlucHV0ID0gSW5wdXQ7XHJcbiAgICBSLnBhcmVudCA9IHBhcmVudDtcclxuXHJcbiAgICBSLmlucHV0LnN0eWxlLmJhY2tncm91bmQgPSBSLnBhcmVudC5jb2xvcnMuYmFja29mZjtcclxuICAgIFIuaW5wdXQuc3R5bGUuYm9yZGVyQ29sb3IgPSBSLnBhcmVudC5jb2xvcnMuc2VsZWN0O1xyXG4gICAgLy9SLmlucHV0LnN0eWxlLmNvbG9yID0gUi5wYXJlbnQuY29sb3JzLnRleHRTZWxlY3Q7XHJcbiAgICBSLnN0ciA9IFIuaW5wdXQudGV4dENvbnRlbnQ7XHJcblxyXG4gICAgUi5zZXRIaWRkZW4oKTtcclxuICB9LFxyXG5cclxuICBrZXlkb3duOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKFIucGFyZW50ID09PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgbGV0IGtleUNvZGUgPSBlLndoaWNoLFxyXG4gICAgICBpc1NoaWZ0ID0gZS5zaGlmdEtleTtcclxuXHJcbiAgICAvL2NvbnNvbGUubG9nKCBrZXlDb2RlIClcclxuXHJcbiAgICBSLmZpcnN0SW1wdXQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoUi5oYXNGb2N1cykge1xyXG4gICAgICAvLyBoYWNrIHRvIGZpeCB0b3VjaCBldmVudCBidWcgaW4gaU9TIFNhZmFyaVxyXG4gICAgICB3aW5kb3cuZm9jdXMoKTtcclxuICAgICAgUi5oaWRkZW5JbXB1dC5mb2N1cygpO1xyXG4gICAgfVxyXG5cclxuICAgIFIucGFyZW50LmlzRWRpdCA9IHRydWU7XHJcblxyXG4gICAgLy8gZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgIC8vIGFkZCBzdXBwb3J0IGZvciBDdHJsL0NtZCtBIHNlbGVjdGlvblxyXG4gICAgLy9pZiAoIGtleUNvZGUgPT09IDY1ICYmIChlLmN0cmxLZXkgfHwgZS5tZXRhS2V5ICkpIHtcclxuICAgIC8vUi5zZWxlY3RUZXh0KCk7XHJcbiAgICAvL2UucHJldmVudERlZmF1bHQoKTtcclxuICAgIC8vcmV0dXJuIHNlbGYucmVuZGVyKCk7XHJcbiAgICAvL31cclxuXHJcbiAgICBpZiAoa2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgLy9lbnRlclxyXG5cclxuICAgICAgUi5jbGVhcklucHV0KCk7XHJcblxyXG4gICAgICAvL30gZWxzZSBpZigga2V5Q29kZSA9PT0gOSApeyAvL3RhYiBrZXlcclxuXHJcbiAgICAgIC8vIFIuaW5wdXQudGV4dENvbnRlbnQgPSAnJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChSLmlucHV0LmlzTnVtKSB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgKGUua2V5Q29kZSA+IDQ3ICYmIGUua2V5Q29kZSA8IDU4KSB8fFxyXG4gICAgICAgICAgKGUua2V5Q29kZSA+IDk1ICYmIGUua2V5Q29kZSA8IDEwNikgfHxcclxuICAgICAgICAgIGUua2V5Q29kZSA9PT0gMTkwIHx8XHJcbiAgICAgICAgICBlLmtleUNvZGUgPT09IDExMCB8fFxyXG4gICAgICAgICAgZS5rZXlDb2RlID09PSA4IHx8XHJcbiAgICAgICAgICBlLmtleUNvZGUgPT09IDEwOVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgUi5oaWRkZW5JbXB1dC5yZWFkT25seSA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBSLmhpZGRlbkltcHV0LnJlYWRPbmx5ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgUi5oaWRkZW5JbXB1dC5yZWFkT25seSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAga2V5dXA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoUi5wYXJlbnQgPT09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICBSLnN0ciA9IFIuaGlkZGVuSW1wdXQudmFsdWU7XHJcblxyXG4gICAgaWYgKFIucGFyZW50LmFsbEVxdWFsKSBSLnBhcmVudC5zYW1lU3RyKFIuc3RyKTsgLy8gbnVtZXJpYyBzYW3DuWUgdmFsdWVcclxuICAgIGVsc2UgUi5pbnB1dC50ZXh0Q29udGVudCA9IFIuc3RyO1xyXG5cclxuICAgIFIuY3Vyc29ySWQgPSBSLmhpZGRlbkltcHV0LnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgUi5pbnB1dFJhbmdlID0gW1IuaGlkZGVuSW1wdXQuc2VsZWN0aW9uU3RhcnQsIFIuaGlkZGVuSW1wdXQuc2VsZWN0aW9uRW5kXTtcclxuXHJcbiAgICBSLnNlbGVjdFBhcmVudCgpO1xyXG5cclxuICAgIC8vaWYoIFIucGFyZW50LmFsbHdheSApXHJcbiAgICBSLnBhcmVudC52YWxpZGF0ZSgpO1xyXG4gIH0sXHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvL1xyXG4gIC8vICAgTElTVEVOSU5HXHJcbiAgLy9cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGxvb3A6IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIG1vZGlmaWVkIGJ5IEZlZGVtYXJpbm9cclxuICAgIGlmIChSLmlzTG9vcCkgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKFIubG9vcCk7XHJcbiAgICBSLm5lZWRzVXBkYXRlID0gUi51cGRhdGUoKTtcclxuICAgIC8vIGlmIHRoZXJlIGlzIGEgY2hhbmdlIGluIGEgdmFsdWUgZ2VuZXJhdGVkIGV4dGVybmFsbHksIHRoZSBHVUkgbmVlZHMgdG8gYmUgcmVkcmF3blxyXG4gICAgaWYgKFIudWlbMF0pIFIudWlbMF0uZHJhdygpO1xyXG4gIH0sXHJcblxyXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gbW9kaWZpZWQgYnkgRmVkZW1hcmlub1xyXG4gICAgbGV0IGkgPSBSLmxpc3RlbnMubGVuZ3RoO1xyXG4gICAgbGV0IG5lZWRzVXBkYXRlID0gZmFsc2U7XHJcbiAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgIC8vY2hlY2sgaWYgdGhlIHZhbHVlIG9mIHRoZSBvYmplY3QgaGFzIGNoYW5nZWRcclxuICAgICAgbGV0IGhhc0NoYW5nZWQgPSBSLmxpc3RlbnNbaV0ubGlzdGVuaW5nKCk7XHJcbiAgICAgIGlmIChoYXNDaGFuZ2VkKSBuZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmVlZHNVcGRhdGU7XHJcbiAgfSxcclxuXHJcbiAgcmVtb3ZlTGlzdGVuOiBmdW5jdGlvbiAocHJvdG8pIHtcclxuICAgIGxldCBpZCA9IFIubGlzdGVucy5pbmRleE9mKHByb3RvKTtcclxuICAgIGlmIChpZCAhPT0gLTEpIFIubGlzdGVucy5zcGxpY2UoaWQsIDEpO1xyXG4gICAgaWYgKFIubGlzdGVucy5sZW5ndGggPT09IDApIFIuaXNMb29wID0gZmFsc2U7XHJcbiAgfSxcclxuXHJcbiAgYWRkTGlzdGVuOiBmdW5jdGlvbiAocHJvdG8pIHtcclxuICAgIGxldCBpZCA9IFIubGlzdGVucy5pbmRleE9mKHByb3RvKTtcclxuXHJcbiAgICBpZiAoaWQgIT09IC0xKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgUi5saXN0ZW5zLnB1c2gocHJvdG8pO1xyXG5cclxuICAgIGlmICghUi5pc0xvb3ApIHtcclxuICAgICAgUi5pc0xvb3AgPSB0cnVlO1xyXG4gICAgICBSLmxvb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IFJvb3RzID0gUjtcclxuIiwiLyoqXHJcbiAqIEBhdXRob3IgbHRoIC8gaHR0cHM6Ly9naXRodWIuY29tL2xvLXRoXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgUm9vdHMgfSBmcm9tICcuL1Jvb3RzLmpzJztcclxuXHJcbmNvbnN0IFQgPSB7XHJcblxyXG4gICAgdHJhbnNpdGlvbjogMC4yLFxyXG5cclxuICAgIGZyYWc6IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSxcclxuXHJcbiAgICBjb2xvclJpbmc6IG51bGwsXHJcbiAgICBqb3lzdGlja18wOiBudWxsLFxyXG4gICAgam95c3RpY2tfMTogbnVsbCxcclxuICAgIGNpcmN1bGFyOiBudWxsLFxyXG4gICAga25vYjogbnVsbCxcclxuICAgIHBhZDJkOiBudWxsLFxyXG5cclxuICAgIHN2Z25zOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXHJcbiAgICBsaW5rczogXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsXHJcbiAgICBodG1sczogXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsXHJcblxyXG4gICAgRE9NX1NJWkU6IFsgJ2hlaWdodCcsICd3aWR0aCcsICd0b3AnLCAnbGVmdCcsICdib3R0b20nLCAncmlnaHQnLCAnbWFyZ2luLWxlZnQnLCAnbWFyZ2luLXJpZ2h0JywgJ21hcmdpbi10b3AnLCAnbWFyZ2luLWJvdHRvbSddLFxyXG4gICAgU1ZHX1RZUEVfRDogWyAncGF0dGVybicsICdkZWZzJywgJ3RyYW5zZm9ybScsICdzdG9wJywgJ2FuaW1hdGUnLCAncmFkaWFsR3JhZGllbnQnLCAnbGluZWFyR3JhZGllbnQnLCAnYW5pbWF0ZU1vdGlvbicsICd1c2UnLCAnZmlsdGVyJywgJ2ZlQ29sb3JNYXRyaXgnIF0sXHJcbiAgICBTVkdfVFlQRV9HOiBbICdzdmcnLCAncmVjdCcsICdjaXJjbGUnLCAncGF0aCcsICdwb2x5Z29uJywgJ3RleHQnLCAnZycsICdsaW5lJywgJ2ZvcmVpZ25PYmplY3QnIF0sXHJcblxyXG4gICAgUEk6IE1hdGguUEksXHJcbiAgICBUd29QSTogTWF0aC5QSSoyLFxyXG4gICAgcGk5MDogTWF0aC5QSSAqIDAuNSxcclxuICAgIHBpNjA6IE1hdGguUEkvMyxcclxuICAgIFxyXG4gICAgdG9yYWQ6IE1hdGguUEkgLyAxODAsXHJcbiAgICB0b2RlZzogMTgwIC8gTWF0aC5QSSxcclxuXHJcbiAgICBjbGFtcDogKCB2LCBtaW4sIG1heCApID0+IHtcclxuXHJcbiAgICAgICAgdiA9IHYgPCBtaW4gPyBtaW4gOiB2O1xyXG4gICAgICAgIHYgPSB2ID4gbWF4ID8gbWF4IDogdjtcclxuICAgICAgICByZXR1cm4gdjtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGlzRGl2aWQ6ICggdiApID0+ICggdiowLjUgPT09IE1hdGguZmxvb3IodiowLjUpICksXHJcblxyXG4gICAgc2l6ZTogeyAgdzogMjQwLCBoOiAyMCwgcDogMzAsIHM6IDggfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIENPTE9SXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgZGVmaW5lQ29sb3I6ICggbywgY2MgPSBULmNvbG9ycyApID0+IHtcclxuXHJcbiAgICAgICAgbGV0IGNvbG9yID0geyAuLi5jYyB9XHJcblxyXG4gICAgICAgIGxldCB0ZXh0Q2hhbmdlID0gWydmb250RmFtaWx5JywgJ2ZvbnRXZWlnaHQnLCAnZm9udFNoYWRvdycsICdmb250U2l6ZScgXVxyXG4gICAgICAgIGxldCBjaGFuZ2VUZXh0ID0gZmFsc2VcclxuXHJcbiAgICAgICAgaWYoIG8uZm9udCApIG8uZm9udEZhbWlseSA9IG8uZm9udFxyXG4gICAgICAgIGlmKCBvLnNoYWRvdyApIG8uZm9udFNoYWRvdyA9IG8uc2hhZG93XHJcbiAgICAgICAgaWYoIG8ud2VpZ2h0ICkgby5mb250V2VpZ2h0ID0gby53ZWlnaHRcclxuXHJcbiAgICAgICAgaWYoIG8uZm9udENvbG9yICkgby50ZXh0ID0gby5mb250Q29sb3JcclxuICAgICAgICBpZiggby5jb2xvciApIG8udGV4dCA9IG8uY29sb3JcclxuXHJcbiAgICAgICAgaWYoIG8udGV4dCApe1xyXG4gICAgICAgICAgICBjb2xvci50ZXh0ID0gby50ZXh0XHJcbiAgICAgICAgICAgIGlmKCAhby5mb250Q29sb3IgJiYgIW8uY29sb3IgKXsgXHJcbiAgICAgICAgICAgICAgICBjb2xvci50aXRsZSA9IFQuQ29sb3JMdW1hKCBvLnRleHQsIC0wLjI1IClcclxuICAgICAgICAgICAgICAgIGNvbG9yLnRpdGxlb2ZmID0gVC5Db2xvckx1bWEoIG8udGV4dCwgLTAuNSApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29sb3IudGV4dE92ZXIgPSBULkNvbG9yTHVtYSggby50ZXh0LCAwLjI1IClcclxuICAgICAgICAgICAgY29sb3IudGV4dFNlbGVjdCA9IFQuQ29sb3JMdW1hKCBvLnRleHQsIDAuNSApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggby5idXR0b24gKXtcclxuICAgICAgICAgICAgY29sb3IuYnV0dG9uID0gby5idXR0b25cclxuICAgICAgICAgICAgY29sb3IuYm9yZGVyID0gVC5Db2xvckx1bWEoIG8uYnV0dG9uLCAwLjEgKVxyXG4gICAgICAgICAgICBjb2xvci5vdmVyb2ZmID0gVC5Db2xvckx1bWEoIG8uYnV0dG9uLCAwLjIgKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG8uc2VsZWN0ICl7XHJcbiAgICAgICAgICAgIGNvbG9yLnNlbGVjdCA9IG8uc2VsZWN0XHJcbiAgICAgICAgICAgIGNvbG9yLm92ZXIgPSBULkNvbG9yTHVtYSggby5zZWxlY3QsIC0wLjEgKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG8uaXRlbUJnICkgby5iYWNrID0gby5pdGVtQmdcclxuXHJcbiAgICAgICAgaWYoIG8uYmFjayApe1xyXG4gICAgICAgICAgICBjb2xvci5iYWNrID0gby5iYWNrXHJcbiAgICAgICAgICAgIGNvbG9yLmJhY2tvZmYgPSBULkNvbG9yTHVtYSggby5iYWNrLCAtMC4xIClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBvLmZvbnRTZWxlY3QgKSBjb2xvci50ZXh0U2VsZWN0ID0gby5mb250U2VsZWN0XHJcbiAgICAgICAgaWYoIG8uZ3JvdXBCb3JkZXIgKSBjb2xvci5nYm9yZGVyID0gby5ncm91cEJvcmRlclxyXG5cclxuICAgICAgICAvL2lmKCBvLnRyYW5zcGFyZW50ICkgby5iZyA9ICdub25lJ1xyXG4gICAgICAgIC8vaWYoIG8uYmcgKSBjb2xvci5iYWNrZ3JvdW5kID0gY29sb3IuYmFja2dyb3VuZE92ZXIgPSBvLmJnXHJcbiAgICAgICAgaWYoIG8uYmdPdmVyICkgY29sb3IuYmFja2dyb3VuZE92ZXIgPSBvLmJnT3ZlclxyXG5cclxuICAgICAgICBmb3IoIGxldCBtIGluIGNvbG9yICl7XHJcbiAgICAgICAgICAgIGlmKG9bbV0hPT11bmRlZmluZWQpIGNvbG9yW21dID0gb1ttXVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yKCBsZXQgbSBpbiBvICl7XHJcbiAgICAgICAgICAgIGlmKCB0ZXh0Q2hhbmdlLmluZGV4T2YobSkgIT09IC0xICkgY2hhbmdlVGV4dCA9IHRydWUgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggY2hhbmdlVGV4dCApIFQuZGVmaW5lVGV4dCggY29sb3IgKVxyXG5cclxuICAgICAgICByZXR1cm4gY29sb3JcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNvbG9yczoge1xyXG5cclxuICAgICAgICBzeDogNCwvLzRcclxuICAgICAgICBzeTogMiwvLzJcclxuICAgICAgICByYWRpdXM6MixcclxuXHJcbiAgICAgICAgc2hvd092ZXIgOiAxLFxyXG4gICAgICAgIC8vZ3JvdXBPdmVyIDogMSxcclxuXHJcbiAgICAgICAgY29udGVudDonbm9uZScsXHJcbiAgICAgICAgYmFja2dyb3VuZDogJ3JnYmEoNTAsNTAsNTAsMC4xNSknLFxyXG4gICAgICAgIGJhY2tncm91bmRPdmVyOiAncmdiYSg1MCw1MCw1MCwwLjMpJyxcclxuXHJcbiAgICAgICAgdGl0bGUgOiAnI0NDQycsXHJcbiAgICAgICAgdGl0bGVvZmYgOiAnI0JCQicsXHJcbiAgICAgICAgdGV4dCA6ICcjREREJyxcclxuICAgICAgICB0ZXh0T3ZlciA6ICcjRUVFJyxcclxuICAgICAgICB0ZXh0U2VsZWN0IDogJyNGRkYnLFxyXG4gICAgICAgIFxyXG4gICAgICAgIGJhY2s6J3JnYmEoMCwwLDAsMC4yKScsXHJcbiAgICAgICAgYmFja29mZjoncmdiYSgwLDAsMCwwLjMpJyxcclxuXHJcbiAgICAgICAgLy8gaW5wdXQgYW5kIGJ1dHRvbiBib3JkZXJcclxuICAgICAgICBib3JkZXIgOiAnIzRjNGM0YycsXHJcbiAgICAgICAgYm9yZGVyU2l6ZSA6IDEsXHJcblxyXG4gICAgICAgIGdib3JkZXIgOiAnbm9uZScsXHJcbiAgICAgICAgZ3JvdXBzIDogJ25vbmUnLFxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICBidXR0b24gOiAnIzNjM2MzYycsXHJcbiAgICAgICAgb3Zlcm9mZiA6ICcjNWM1YzVjJyxcclxuICAgICAgICBvdmVyIDogJyMwMjQ2OTknLFxyXG4gICAgICAgIHNlbGVjdCA6ICcjMzA4QUZGJyxcclxuICAgICAgICBhY3Rpb246ICcjRkYzMzAwJyxcclxuICAgICAgICBcclxuICAgICAgICAvL2ZvbnRGYW1pbHk6ICdUYWhvbWEnLFxyXG4gICAgICAgIGZvbnRGYW1pbHk6ICdDb25zb2xhcywgbW9ub3NwYWNlJyxcclxuICAgICAgICAvL2ZvbnRGYW1pbHk6IFwiJ1JvYm90byBNb25vJywgJ1NvdXJjZSBDb2RlIFBybycsIE1lbmxvLCBDb3VyaWVyLCBtb25vc3BhY2VcIixcclxuICAgICAgICBmb250V2VpZ2h0OiAnbm9ybWFsJyxcclxuICAgICAgICBmb250U2hhZG93OiAnbm9uZScsLy8nIzAwMCcsXHJcbiAgICAgICAgZm9udFNpemU6MTIsXHJcblxyXG4gICAgICAgIGpveU92ZXI6J3JnYmEoNDgsMTM4LDI1NSwwLjI1KScsXHJcbiAgICAgICAgam95T3V0OiAncmdiYSgxMDAsMTAwLDEwMCwwLjUpJyxcclxuICAgICAgICBqb3lTZWxlY3Q6ICcjMzA4QUZGJyxcclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgaGlkZTogJ3JnYmEoMCwwLDAsMCknLFxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gc3R5bGUgY3NzXHJcblxyXG4gICAgY3NzIDoge1xyXG5cclxuICAgICAgICBiYXNpYzogJ3Bvc2l0aW9uOmFic29sdXRlOyBwb2ludGVyLWV2ZW50czpub25lOyBib3gtc2l6aW5nOmJvcmRlci1ib3g7IG1hcmdpbjowOyBwYWRkaW5nOjA7IG92ZXJmbG93OmhpZGRlbjsgJyArICctby11c2VyLXNlbGVjdDpub25lOyAtbXMtdXNlci1zZWxlY3Q6bm9uZTsgLWtodG1sLXVzZXItc2VsZWN0Om5vbmU7IC13ZWJraXQtdXNlci1zZWxlY3Q6bm9uZTsgLW1vei11c2VyLXNlbGVjdDpub25lOycsXHJcbiAgICAgICAgYnV0dG9uOidkaXNwbGF5OmZsZXg7IGFsaWduLWl0ZW1zOmNlbnRlcjsganVzdGlmeS1jb250ZW50OmNlbnRlcjsgdGV4dC1hbGlnbjpjZW50ZXI7JyxcclxuICAgICAgICBtaWRkbGU6J2Rpc3BsYXk6ZmxleDsgYWxpZ24taXRlbXM6Y2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6bGVmdDsgdGV4dC1hbGlnbjpsZWZ0OyBmbGV4LWRpcmVjdGlvbjogcm93LXJldmVyc2U7J1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBzdmcgcGF0aFxyXG5cclxuICAgIHN2Z3M6IHtcclxuXHJcbiAgICAgICAgZzE6J00gNiA0IEwgMCA0IDAgNiA2IDYgNiA0IE0gNiAwIEwgMCAwIDAgMiA2IDIgNiAwIFonLFxyXG4gICAgICAgIGcyOidNIDYgMCBMIDQgMCA0IDYgNiA2IDYgMCBNIDIgMCBMIDAgMCAwIDYgMiA2IDIgMCBaJyxcclxuXHJcbiAgICAgICAgZ3JvdXA6J00gNyA3IEwgNyA4IDggOCA4IDcgNyA3IE0gNSA3IEwgNSA4IDYgOCA2IDcgNSA3IE0gMyA3IEwgMyA4IDQgOCA0IDcgMyA3IE0gNyA1IEwgNyA2IDggNiA4IDUgNyA1IE0gNiA2IEwgNiA1IDUgNSA1IDYgNiA2IE0gNyAzIEwgNyA0IDggNCA4IDMgNyAzIE0gNiA0IEwgNiAzIDUgMyA1IDQgNiA0IE0gMyA1IEwgMyA2IDQgNiA0IDUgMyA1IE0gMyAzIEwgMyA0IDQgNCA0IDMgMyAzIFonLFxyXG4gICAgICAgIGFycm93OidNIDMgOCBMIDggNSAzIDIgMyA4IFonLFxyXG5cclxuICAgICAgICBhcnJvd0Rvd246J00gNSA4IEwgOCAzIDIgMyA1IDggWicsXHJcbiAgICAgICAgYXJyb3dVcDonTSA1IDIgTCAyIDcgOCA3IDUgMiBaJyxcclxuXHJcbiAgICAgICAgc29saWQ6J00gMTMgMTAgTCAxMyAxIDQgMSAxIDQgMSAxMyAxMCAxMyAxMyAxMCBNIDExIDMgTCAxMSA5IDkgMTEgMyAxMSAzIDUgNSAzIDExIDMgWicsXHJcbiAgICAgICAgYm9keTonTSAxMyAxMCBMIDEzIDEgNCAxIDEgNCAxIDEzIDEwIDEzIDEzIDEwIE0gMTEgMyBMIDExIDkgOSAxMSAzIDExIDMgNSA1IDMgMTEgMyBNIDUgNCBMIDQgNSA0IDEwIDkgMTAgMTAgOSAxMCA0IDUgNCBaJyxcclxuICAgICAgICB2ZWhpY2xlOidNIDEzIDYgTCAxMSAxIDMgMSAxIDYgMSAxMyAzIDEzIDMgMTEgMTEgMTEgMTEgMTMgMTMgMTMgMTMgNiBNIDIuNCA2IEwgNCAyIDEwIDIgMTEuNiA2IDIuNCA2IE0gMTIgOCBMIDEyIDEwIDEwIDEwIDEwIDggMTIgOCBNIDQgOCBMIDQgMTAgMiAxMCAyIDggNCA4IFonLFxyXG4gICAgICAgIGFydGljdWxhdGlvbjonTSAxMyA5IEwgMTIgOSA5IDIgOSAxIDUgMSA1IDIgMiA5IDEgOSAxIDEzIDUgMTMgNSA5IDQgOSA2IDUgOCA1IDEwIDkgOSA5IDkgMTMgMTMgMTMgMTMgOSBaJyxcclxuICAgICAgICBjaGFyYWN0ZXI6J00gMTMgNCBMIDEyIDMgOSA0IDUgNCAyIDMgMSA0IDUgNiA1IDggNCAxMyA2IDEzIDcgOSA4IDEzIDEwIDEzIDkgOCA5IDYgMTMgNCBNIDYgMSBMIDYgMyA4IDMgOCAxIDYgMSBaJyxcclxuICAgICAgICB0ZXJyYWluOidNIDEzIDggTCAxMiA3IFEgOS4wNiAtMy42NyA1Ljk1IDQuODUgNC4wNCAzLjI3IDIgNyBMIDEgOCA3IDEzIDEzIDggTSAzIDggUSAzLjc4IDUuNDIwIDUuNCA2LjYgNS4yMCA3LjI1IDUgOCBMIDcgOCBRIDguMzkgLTAuMTYgMTEgOCBMIDcgMTEgMyA4IFonLFxyXG4gICAgICAgIGpvaW50OidNIDcuNyA3LjcgUSA4IDcuNDUgOCA3IDggNi42IDcuNyA2LjMgNy40NSA2IDcgNiA2LjYgNiA2LjMgNi4zIDYgNi42IDYgNyA2IDcuNDUgNi4zIDcuNyA2LjYgOCA3IDggNy40NSA4IDcuNyA3LjcgTSAzLjM1IDguNjUgTCAxIDExIDMgMTMgNS4zNSAxMC42NSBRIDYuMSAxMSA3IDExIDguMjggMTEgOS4yNSAxMC4yNSBMIDcuOCA4LjggUSA3LjQ1IDkgNyA5IDYuMTUgOSA1LjU1IDguNCA1IDcuODUgNSA3IDUgNi41NCA1LjE1IDYuMTUgTCAzLjcgNC43IFEgMyA1LjcxMiAzIDcgMyA3LjkgMy4zNSA4LjY1IE0gMTAuMjUgOS4yNSBRIDExIDguMjggMTEgNyAxMSA2LjEgMTAuNjUgNS4zNSBMIDEzIDMgMTEgMSA4LjY1IDMuMzUgUSA3LjkgMyA3IDMgNS43IDMgNC43IDMuNyBMIDYuMTUgNS4xNSBRIDYuNTQgNSA3IDUgNy44NSA1IDguNCA1LjU1IDkgNi4xNSA5IDcgOSA3LjQ1IDguOCA3LjggTCAxMC4yNSA5LjI1IFonLFxyXG4gICAgICAgIHJheTonTSA5IDExIEwgNSAxMSA1IDEyIDkgMTIgOSAxMSBNIDEyIDUgTCAxMSA1IDExIDkgMTIgOSAxMiA1IE0gMTEuNSAxMCBRIDEwLjkgMTAgMTAuNDUgMTAuNDUgMTAgMTAuOSAxMCAxMS41IDEwIDEyLjIgMTAuNDUgMTIuNTUgMTAuOSAxMyAxMS41IDEzIDEyLjIgMTMgMTIuNTUgMTIuNTUgMTMgMTIuMiAxMyAxMS41IDEzIDEwLjkgMTIuNTUgMTAuNDUgMTIuMiAxMCAxMS41IDEwIE0gOSAxMCBMIDEwIDkgMiAxIDEgMiA5IDEwIFonLFxyXG4gICAgICAgIGNvbGxpc2lvbjonTSAxMSAxMiBMIDEzIDEwIDEwIDcgMTMgNCAxMSAyIDcuNSA1LjUgOSA3IDcuNSA4LjUgMTEgMTIgTSAzIDIgTCAxIDQgNCA3IDEgMTAgMyAxMiA4IDcgMyAyIFonLFxyXG4gICAgICAgIG1hcDonTSAxMyAxIEwgMSAxIDEgMTMgMTMgMTMgMTMgMSBNIDEyIDIgTCAxMiA3IDcgNyA3IDEyIDIgMTIgMiA3IDcgNyA3IDIgMTIgMiBaJyxcclxuICAgICAgICBtYXRlcmlhbDonTSAxMyAxIEwgMSAxIDEgMTMgMTMgMTMgMTMgMSBNIDEyIDIgTCAxMiA3IDcgNyA3IDEyIDIgMTIgMiA3IDcgNyA3IDIgMTIgMiBaJyxcclxuICAgICAgICB0ZXh0dXJlOidNIDEzIDQgTCAxMyAxIDEgMSAxIDQgNSA0IDUgMTMgOSAxMyA5IDQgMTMgNCBaJyxcclxuICAgICAgICBvYmplY3Q6J00gMTAgMSBMIDcgNCA0IDEgMSAxIDEgMTMgNCAxMyA0IDUgNyA4IDEwIDUgMTAgMTMgMTMgMTMgMTMgMSAxMCAxIFonLFxyXG4gICAgICAgIG5vbmU6J00gOSA1IEwgNSA1IDUgOSA5IDkgOSA1IFonLFxyXG4gICAgICAgIGN1cnNvcjonTSA0IDcgTCAxIDEwIDEgMTIgMiAxMyA0IDEzIDcgMTAgOSAxNCAxNCAwIDAgNSA0IDcgWicsXHJcbiAgICAgICAgbG9hZDonTSAxMyA4IEwgMTEuNSA2LjUgOSA5IDkgMyA1IDMgNSA5IDIuNSA2LjUgMSA4IDcgMTQgMTMgOCBNIDkgMiBMIDkgMCA1IDAgNSAyIDkgMiBaJyxcclxuICAgICAgICBzYXZlOidNIDkgMTIgTCA1IDEyIDUgMTQgOSAxNCA5IDEyIE0gMTEuNSA3LjUgTCAxMyA2IDcgMCAxIDYgMi41IDcuNSA1IDUgNSAxMSA5IDExIDkgNSAxMS41IDcuNSBaJyxcclxuICAgICAgICBleHRlcm46J00gMTQgMTQgTCAxNCAwIDAgMCAwIDE0IDE0IDE0IE0gMTIgNiBMIDEyIDEyIDIgMTIgMiA2IDEyIDYgTSAxMiAyIEwgMTIgNCAyIDQgMiAyIDEyIDIgWicsXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZXpvbmUgKCkge1xyXG4gICAgICAgIFJvb3RzLm5lZWRSZVpvbmUgPSB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRJbXB1dDogZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgICAgcmV0dXJuIFJvb3RzLmlucHV0ID8gdHJ1ZSA6IGZhbHNlXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRTdHlsZSA6IGZ1bmN0aW9uICggZGF0YSApe1xyXG5cclxuICAgICAgICBmb3IgKCB2YXIgbyBpbiBkYXRhICl7XHJcbiAgICAgICAgICAgIGlmKCBULmNvbG9yc1tvXSApIFQuY29sb3JzW29dID0gZGF0YVtvXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFQuc2V0VGV4dCgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gY3VzdG9tIHRleHRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBkZWZpbmVUZXh0OiBmdW5jdGlvbiggbyApe1xyXG5cclxuICAgICAgICBULnNldFRleHQoIG8uZm9udFNpemUsIG8udGV4dCwgby5mb250RmFtaWx5LCBvLmZvbnRTaGFkb3csIG8uZm9udFdlaWdodCApXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRUZXh0OiBmdW5jdGlvbiggc2l6ZSwgY29sb3IsIGZvbnQsIHNoYWRvdywgd2VpZ2h0ICl7XHJcblxyXG4gICAgICAgIGxldCBjYyA9IFQuY29sb3JzO1xyXG5cclxuICAgICAgICBpZiggZm9udCA9PT0gdW5kZWZpbmVkICkgZm9udCA9IGNjLmZvbnRGYW1pbHlcclxuICAgICAgICBpZiggc2l6ZSA9PT0gdW5kZWZpbmVkICkgc2l6ZSA9IGNjLmZvbnRTaXplXHJcbiAgICAgICAgaWYoIHNoYWRvdyA9PT0gdW5kZWZpbmVkICkgc2hhZG93ID0gY2MuZm9udFNoYWRvd1xyXG4gICAgICAgIGlmKCB3ZWlnaHQgPT09IHVuZGVmaW5lZCApIHdlaWdodCA9IGNjLmZvbnRXZWlnaHRcclxuICAgICAgICBpZiggY29sb3IgPT09IHVuZGVmaW5lZCApIGNvbG9yID0gY2MudGV4dFxyXG5cclxuICAgICAgICBpZiggaXNOYU4oc2l6ZSkgKXsgaWYoIHNpemUuc2VhcmNoKCdlbScpPT09LTEgKSBzaXplICs9ICdweCd9XHJcbiAgICAgICAgZWxzZSBzaXplICs9ICdweCdcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgLy9sZXQgYWxpZ24gPSAnZGlzcGxheTpmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6bGVmdDsgYWxpZ24taXRlbXM6Y2VudGVyOyB0ZXh0LWFsaWduOmxlZnQ7J1xyXG5cclxuICAgICAgICBULmNzcy50eHQgPSBULmNzcy5iYXNpYyArIFQuY3NzLm1pZGRsZSArICcgZm9udC1mYW1pbHk6JysgZm9udCArJzsgZm9udC13ZWlnaHQ6Jyt3ZWlnaHQrJzsgZm9udC1zaXplOicrc2l6ZSsnOyBjb2xvcjonK2NjLnRleHQrJzsgcGFkZGluZzowcHggOHB4OyBsZWZ0OjA7IHRvcDoycHg7IGhlaWdodDoxNnB4OyB3aWR0aDoxMDBweDsgb3ZlcmZsb3c6aGlkZGVuOyB3aGl0ZS1zcGFjZTogbm93cmFwOyBsZXR0ZXItc3BhY2luZzogbm9ybWFsOyc7XHJcbiAgICAgICAgaWYoIHNoYWRvdyAhPT0gJ25vbmUnICkgVC5jc3MudHh0ICs9ICcgdGV4dC1zaGFkb3c6IDFweCAxcHggMXB4ICcrc2hhZG93Kyc7JztcclxuXHJcbiAgICAgICAgVC5jc3MudHh0c2VsZWN0ID0gVC5jc3MudHh0ICsgJ3BhZGRpbmc6MHB4IDRweDsgYm9yZGVyOjFweCBkYXNoZWQgJyArIGNjLmJvcmRlciArICc7JztcclxuICAgICAgICBULmNzcy5pdGVtID0gVC5jc3MudHh0ICsgJ3BhZGRpbmc6MHB4IDRweDsgcG9zaXRpb246cmVsYXRpdmU7IG1hcmdpbi1ib3R0b206MXB4OyAnXHJcblxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgLy8gbm90ZVxyXG5cclxuICAgIC8vaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZnIvZG9jcy9XZWIvQ1NTL2Nzc19mbGV4aWJsZV9ib3hfbGF5b3V0L2FsaWduaW5nX2l0ZW1zX2luX2FfZmxleF9jb250YWluZXJcclxuXHJcbiAgICAvKmNsb25lQ29sb3I6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgbGV0IGNjID0gT2JqZWN0LmFzc2lnbih7fSwgVC5jb2xvcnMgKTtcclxuICAgICAgICByZXR1cm4gY2M7XHJcblxyXG4gICAgfSwqL1xyXG5cclxuICAgIC8vIGludGVybiBmdW5jdGlvblxyXG5cclxuICAgIGNsb25lQ3NzOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIC8vbGV0IGNjID0gT2JqZWN0LmFzc2lnbih7fSwgVC5jc3MgKTtcclxuICAgICAgICByZXR1cm4geyAuLi5ULmNzcyB9O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xvbmU6IGZ1bmN0aW9uICggbyApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG8uY2xvbmVOb2RlKCB0cnVlICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRTdmc6IGZ1bmN0aW9uKCBkb20sIHR5cGUsIHZhbHVlLCBpZCwgaWQyICl7XHJcblxyXG4gICAgICAgIGlmKCBpZCA9PT0gLTEgKSBkb20uc2V0QXR0cmlidXRlTlMoIG51bGwsIHR5cGUsIHZhbHVlICk7XHJcbiAgICAgICAgZWxzZSBpZiggaWQyICE9PSB1bmRlZmluZWQgKSBkb20uY2hpbGROb2Rlc1sgaWQgfHwgMCBdLmNoaWxkTm9kZXNbIGlkMiB8fCAwIF0uc2V0QXR0cmlidXRlTlMoIG51bGwsIHR5cGUsIHZhbHVlICk7XHJcbiAgICAgICAgZWxzZSBkb20uY2hpbGROb2Rlc1sgaWQgfHwgMCBdLnNldEF0dHJpYnV0ZU5TKCBudWxsLCB0eXBlLCB2YWx1ZSApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0Q3NzOiBmdW5jdGlvbiggZG9tLCBjc3MgKXtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgciBpbiBjc3MgKXtcclxuICAgICAgICAgICAgaWYoIFQuRE9NX1NJWkUuaW5kZXhPZihyKSAhPT0gLTEgKSBkb20uc3R5bGVbcl0gPSBjc3Nbcl0gKyAncHgnO1xyXG4gICAgICAgICAgICBlbHNlIGRvbS5zdHlsZVtyXSA9IGNzc1tyXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXQ6IGZ1bmN0aW9uKCBnLCBvICl7XHJcblxyXG4gICAgICAgIGZvciggbGV0IGF0dCBpbiBvICl7XHJcbiAgICAgICAgICAgIGlmKCBhdHQgPT09ICd0eHQnICkgZy50ZXh0Q29udGVudCA9IG9bIGF0dCBdO1xyXG4gICAgICAgICAgICBpZiggYXR0ID09PSAnbGluaycgKSBnLnNldEF0dHJpYnV0ZU5TKCBULmxpbmtzLCAneGxpbms6aHJlZicsIG9bIGF0dCBdICk7XHJcbiAgICAgICAgICAgIGVsc2UgZy5zZXRBdHRyaWJ1dGVOUyggbnVsbCwgYXR0LCBvWyBhdHQgXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0OiBmdW5jdGlvbiggZG9tLCBpZCApe1xyXG5cclxuICAgICAgICBpZiggaWQgPT09IHVuZGVmaW5lZCApIHJldHVybiBkb207IC8vIHJvb3RcclxuICAgICAgICBlbHNlIGlmKCAhaXNOYU4oIGlkICkgKSByZXR1cm4gZG9tLmNoaWxkTm9kZXNbIGlkIF07IC8vIGZpcnN0IGNoaWxkXHJcbiAgICAgICAgZWxzZSBpZiggaWQgaW5zdGFuY2VvZiBBcnJheSApe1xyXG4gICAgICAgICAgICBpZihpZC5sZW5ndGggPT09IDIpIHJldHVybiBkb20uY2hpbGROb2Rlc1sgaWRbMF0gXS5jaGlsZE5vZGVzWyBpZFsxXSBdO1xyXG4gICAgICAgICAgICBpZihpZC5sZW5ndGggPT09IDMpIHJldHVybiBkb20uY2hpbGROb2Rlc1sgaWRbMF0gXS5jaGlsZE5vZGVzWyBpZFsxXSBdLmNoaWxkTm9kZXNbIGlkWzJdIF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZG9tIDogZnVuY3Rpb24gKCB0eXBlLCBjc3MsIG9iaiwgZG9tLCBpZCApIHtcclxuXHJcbiAgICAgICAgdHlwZSA9IHR5cGUgfHwgJ2Rpdic7XHJcblxyXG4gICAgICAgIGlmKCBULlNWR19UWVBFX0QuaW5kZXhPZih0eXBlKSAhPT0gLTEgfHwgVC5TVkdfVFlQRV9HLmluZGV4T2YodHlwZSkgIT09IC0xICl7IC8vIGlzIHN2ZyBlbGVtZW50XHJcblxyXG4gICAgICAgICAgICBpZiggdHlwZSA9PT0nc3ZnJyApe1xyXG5cclxuICAgICAgICAgICAgICAgIGRvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggVC5zdmducywgJ3N2ZycgKTtcclxuICAgICAgICAgICAgICAgIFQuc2V0KCBkb20sIG9iaiApO1xyXG5cclxuICAgICAgICAgIC8qICB9IGVsc2UgaWYgKCB0eXBlID09PSAndXNlJyApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBkb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIFQuc3ZnbnMsICd1c2UnICk7XHJcbiAgICAgICAgICAgICAgICBULnNldCggZG9tLCBvYmogKTtcclxuKi9cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBuZXcgc3ZnIGlmIG5vdCBkZWZcclxuICAgICAgICAgICAgICAgIGlmKCBkb20gPT09IHVuZGVmaW5lZCApIGRvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggVC5zdmducywgJ3N2ZycgKTtcclxuICAgICAgICAgICAgICAgIFQuYWRkQXR0cmlidXRlcyggZG9tLCB0eXBlLCBvYmosIGlkICk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSB7IC8vIGlzIGh0bWwgZWxlbWVudFxyXG5cclxuICAgICAgICAgICAgaWYoIGRvbSA9PT0gdW5kZWZpbmVkICkgZG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBULmh0bWxzLCB0eXBlICk7XHJcbiAgICAgICAgICAgIGVsc2UgZG9tID0gZG9tLmFwcGVuZENoaWxkKCBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIFQuaHRtbHMsIHR5cGUgKSApO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBjc3MgKSBkb20uc3R5bGUuY3NzVGV4dCA9IGNzczsgXHJcblxyXG4gICAgICAgIGlmKCBpZCA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIGRvbTtcclxuICAgICAgICBlbHNlIHJldHVybiBkb20uY2hpbGROb2Rlc1sgaWQgfHwgMCBdO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgYWRkQXR0cmlidXRlcyA6IGZ1bmN0aW9uKCBkb20sIHR5cGUsIG8sIGlkICl7XHJcblxyXG4gICAgICAgIGxldCBnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBULnN2Z25zLCB0eXBlICk7XHJcbiAgICAgICAgVC5zZXQoIGcsIG8gKTtcclxuICAgICAgICBULmdldCggZG9tLCBpZCApLmFwcGVuZENoaWxkKCBnICk7XHJcbiAgICAgICAgaWYoIFQuU1ZHX1RZUEVfRy5pbmRleE9mKHR5cGUpICE9PSAtMSApIGcuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcclxuICAgICAgICByZXR1cm4gZztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyIDogZnVuY3Rpb24oIGRvbSApe1xyXG5cclxuICAgICAgICBULnB1cmdlKCBkb20gKTtcclxuICAgICAgICB3aGlsZSAoZG9tLmZpcnN0Q2hpbGQpIHtcclxuICAgICAgICAgICAgaWYgKCBkb20uZmlyc3RDaGlsZC5maXJzdENoaWxkICkgVC5jbGVhciggZG9tLmZpcnN0Q2hpbGQgKTtcclxuICAgICAgICAgICAgZG9tLnJlbW92ZUNoaWxkKCBkb20uZmlyc3RDaGlsZCApOyBcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBwdXJnZSA6IGZ1bmN0aW9uICggZG9tICkge1xyXG5cclxuICAgICAgICBsZXQgYSA9IGRvbS5hdHRyaWJ1dGVzLCBpLCBuO1xyXG4gICAgICAgIGlmIChhKSB7XHJcbiAgICAgICAgICAgIGkgPSBhLmxlbmd0aDtcclxuICAgICAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgICAgIG4gPSBhW2ldLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRvbVtuXSA9PT0gJ2Z1bmN0aW9uJykgZG9tW25dID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBhID0gZG9tLmNoaWxkTm9kZXM7XHJcbiAgICAgICAgaWYgKGEpIHtcclxuICAgICAgICAgICAgaSA9IGEubGVuZ3RoO1xyXG4gICAgICAgICAgICB3aGlsZShpLS0peyBcclxuICAgICAgICAgICAgICAgIFQucHVyZ2UoIGRvbS5jaGlsZE5vZGVzW2ldICk7IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBTVkcgRWZmZWN0cyBmdW5jdGlvblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGFkZFNWR0dsb3dFZmZlY3Q6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYgKCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ1VJTEdsb3cnKSAhPT0gbnVsbCApIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IHN2Z0ZpbHRlciA9IFQuaW5pdFVJTEVmZmVjdHMoKTtcclxuXHJcbiAgICAgICAgbGV0IGZpbHRlciA9IFQuYWRkQXR0cmlidXRlcyggc3ZnRmlsdGVyLCAnZmlsdGVyJywgeyBpZDogJ1VJTEdsb3cnLCB4OiAnLTIwJScsIHk6ICctMjAlJywgd2lkdGg6ICcxNDAlJywgaGVpZ2h0OiAnMTQwJScgfSApO1xyXG4gICAgICAgIFQuYWRkQXR0cmlidXRlcyggZmlsdGVyLCAnZmVHYXVzc2lhbkJsdXInLCB7IGluOiAnU291cmNlR3JhcGhpYycsIHN0ZERldmlhdGlvbjogJzMnLCByZXN1bHQ6ICd1aWxCbHVyJyB9ICk7XHJcbiAgICAgICAgbGV0IGZlTWVyZ2UgPSBULmFkZEF0dHJpYnV0ZXMoIGZpbHRlciwgJ2ZlTWVyZ2UnLCB7ICB9ICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPD0gMzsgaSsrICkge1xyXG5cclxuICAgICAgICAgICAgVC5hZGRBdHRyaWJ1dGVzKCBmZU1lcmdlLCAnZmVNZXJnZU5vZGUnLCB7IGluOiAndWlsQmx1cicgfSApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgVC5hZGRBdHRyaWJ1dGVzKCBmZU1lcmdlLCAnZmVNZXJnZU5vZGUnLCB7IGluOiAnU291cmNlR3JhcGhpYycgfSApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgaW5pdFVJTEVmZmVjdHM6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHN2Z0ZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAnVUlMU1ZHRWZmZWN0cycpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICggc3ZnRmlsdGVyID09PSBudWxsICkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgc3ZnRmlsdGVyID0gVC5kb20oICdzdmcnLCB1bmRlZmluZWQgLCB7IGlkOiAnVUlMU1ZHRWZmZWN0cycsIHdpZHRoOiAnMCcsIGhlaWdodDogJzAnIH0gKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggc3ZnRmlsdGVyICk7XHJcbiBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzdmdGaWx0ZXI7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIENvbG9yIGZ1bmN0aW9uXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgQ29sb3JMdW1hIDogZnVuY3Rpb24gKCBoZXgsIGwgKSB7XHJcblxyXG4gICAgICAgIC8vaWYoIGhleC5zdWJzdHJpbmcoMCwgMykgPT09ICdyZ2JhJyApIGhleCA9ICcjMDAwJztcclxuXHJcbiAgICAgICAgaWYoIGhleCA9PT0gJ24nICkgaGV4ID0gJyMwMDAnO1xyXG5cclxuICAgICAgICAvLyB2YWxpZGF0ZSBoZXggc3RyaW5nXHJcbiAgICAgICAgaGV4ID0gU3RyaW5nKGhleCkucmVwbGFjZSgvW14wLTlhLWZdL2dpLCAnJyk7XHJcbiAgICAgICAgaWYgKGhleC5sZW5ndGggPCA2KSB7XHJcbiAgICAgICAgICAgIGhleCA9IGhleFswXStoZXhbMF0raGV4WzFdK2hleFsxXStoZXhbMl0raGV4WzJdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsID0gbCB8fCAwO1xyXG5cclxuICAgICAgICAvLyBjb252ZXJ0IHRvIGRlY2ltYWwgYW5kIGNoYW5nZSBsdW1pbm9zaXR5XHJcbiAgICAgICAgbGV0IHJnYiA9IFwiI1wiLCBjLCBpO1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCAzOyBpKyspIHtcclxuICAgICAgICAgICAgYyA9IHBhcnNlSW50KGhleC5zdWJzdHIoaSoyLDIpLCAxNik7XHJcbiAgICAgICAgICAgIGMgPSBNYXRoLnJvdW5kKE1hdGgubWluKE1hdGgubWF4KDAsIGMgKyAoYyAqIGwpKSwgMjU1KSkudG9TdHJpbmcoMTYpO1xyXG4gICAgICAgICAgICByZ2IgKz0gKFwiMDBcIitjKS5zdWJzdHIoYy5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJnYjtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGZpbmREZWVwSW52ZXI6IGZ1bmN0aW9uICggYyApIHsgXHJcblxyXG4gICAgICAgIHJldHVybiAoY1swXSAqIDAuMyArIGNbMV0gKiAuNTkgKyBjWzJdICogLjExKSA8PSAwLjY7XHJcbiAgICAgICAgXHJcbiAgICB9LFxyXG5cclxuICAgIGxlcnBDb2xvcjogZnVuY3Rpb24oIGMxLCBjMiwgZmFjdG9yICkge1xyXG4gICAgICAgIGxldCBuZXdDb2xvciA9IHt9O1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IDM7IGkrKyApIHtcclxuICAgICAgICAgIG5ld0NvbG9yW2ldID0gYzFbIGkgXSArICggYzJbIGkgXSAtIGMxWyBpIF0gKSAqIGZhY3RvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ld0NvbG9yO1xyXG4gICAgfSxcclxuXHJcbiAgICBoZXhUb0h0bWw6IGZ1bmN0aW9uICggdiApIHsgXHJcbiAgICAgICAgdiA9IHYgPT09IHVuZGVmaW5lZCA/IDB4MDAwMDAwIDogdjtcclxuICAgICAgICByZXR1cm4gXCIjXCIgKyAoXCIwMDAwMDBcIiArIHYudG9TdHJpbmcoMTYpKS5zdWJzdHIoLTYpO1xyXG4gICAgICAgIFxyXG4gICAgfSxcclxuXHJcbiAgICBodG1sVG9IZXg6IGZ1bmN0aW9uICggdiApIHsgXHJcblxyXG4gICAgICAgIHJldHVybiB2LnRvVXBwZXJDYXNlKCkucmVwbGFjZShcIiNcIiwgXCIweFwiKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHUyNTU6IGZ1bmN0aW9uIChjLCBpKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBwYXJzZUludChjLnN1YnN0cmluZyhpLCBpICsgMiksIDE2KSAvIDI1NTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHUxNjogZnVuY3Rpb24gKCBjLCBpICkge1xyXG5cclxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoYy5zdWJzdHJpbmcoaSwgaSArIDEpLCAxNikgLyAxNTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHVucGFjazogZnVuY3Rpb24oIGMgKXtcclxuXHJcbiAgICAgICAgaWYgKGMubGVuZ3RoID09IDcpIHJldHVybiBbIFQudTI1NShjLCAxKSwgVC51MjU1KGMsIDMpLCBULnUyNTUoYywgNSkgXTtcclxuICAgICAgICBlbHNlIGlmIChjLmxlbmd0aCA9PSA0KSByZXR1cm4gWyBULnUxNihjLDEpLCBULnUxNihjLDIpLCBULnUxNihjLDMpIF07XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBwMjU1OiBmdW5jdGlvbiAoIGMgKSB7XHJcbiAgICAgICAgbGV0IGggPSBNYXRoLnJvdW5kKCAoIGMgKiAyNTUgKSApLnRvU3RyaW5nKCAxNiApO1xyXG4gICAgICAgIGlmICggaC5sZW5ndGggPCAyICkgaCA9ICcwJyArIGg7XHJcbiAgICAgICAgcmV0dXJuIGg7XHJcbiAgICB9LFxyXG5cclxuICAgIHBhY2s6IGZ1bmN0aW9uICggYyApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuICcjJyArIFQucDI1NSggY1sgMCBdICkgKyBULnAyNTUoIGNbIDEgXSApICsgVC5wMjU1KCBjWyAyIF0gKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGh0bWxSZ2I6IGZ1bmN0aW9uKCBjICl7XHJcblxyXG4gICAgICAgIHJldHVybiAncmdiKCcgKyBNYXRoLnJvdW5kKGNbMF0gKiAyNTUpICsgJywnKyBNYXRoLnJvdW5kKGNbMV0gKiAyNTUpICsgJywnKyBNYXRoLnJvdW5kKGNbMl0gKiAyNTUpICsgJyknO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcGFkOiBmdW5jdGlvbiggbiApe1xyXG4gICAgICAgIGlmKG4ubGVuZ3RoID09IDEpbiA9ICcwJyArIG47XHJcbiAgICAgICAgcmV0dXJuIG47XHJcbiAgICB9LFxyXG5cclxuICAgIHJnYlRvSGV4IDogZnVuY3Rpb24oIGMgKXtcclxuXHJcbiAgICAgICAgbGV0IHIgPSBNYXRoLnJvdW5kKGNbMF0gKiAyNTUpLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICBsZXQgZyA9IE1hdGgucm91bmQoY1sxXSAqIDI1NSkudG9TdHJpbmcoMTYpO1xyXG4gICAgICAgIGxldCBiID0gTWF0aC5yb3VuZChjWzJdICogMjU1KS50b1N0cmluZygxNik7XHJcbiAgICAgICAgcmV0dXJuICcjJyArIFQucGFkKHIpICsgVC5wYWQoZykgKyBULnBhZChiKTtcclxuXHJcbiAgICAgICAvLyByZXR1cm4gJyMnICsgKCAnMDAwMDAwJyArICggKCBjWzBdICogMjU1ICkgPDwgMTYgXiAoIGNbMV0gKiAyNTUgKSA8PCA4IF4gKCBjWzJdICogMjU1ICkgPDwgMCApLnRvU3RyaW5nKCAxNiApICkuc2xpY2UoIC0gNiApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgaHVlVG9SZ2I6IGZ1bmN0aW9uKCBwLCBxLCB0ICl7XHJcblxyXG4gICAgICAgIGlmICggdCA8IDAgKSB0ICs9IDE7XHJcbiAgICAgICAgaWYgKCB0ID4gMSApIHQgLT0gMTtcclxuICAgICAgICBpZiAoIHQgPCAxIC8gNiApIHJldHVybiBwICsgKCBxIC0gcCApICogNiAqIHQ7XHJcbiAgICAgICAgaWYgKCB0IDwgMSAvIDIgKSByZXR1cm4gcTtcclxuICAgICAgICBpZiAoIHQgPCAyIC8gMyApIHJldHVybiBwICsgKCBxIC0gcCApICogNiAqICggMiAvIDMgLSB0ICk7XHJcbiAgICAgICAgcmV0dXJuIHA7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZ2JUb0hzbDogZnVuY3Rpb24gKCBjICkge1xyXG5cclxuICAgICAgICBsZXQgciA9IGNbMF0sIGcgPSBjWzFdLCBiID0gY1syXSwgbWluID0gTWF0aC5taW4ociwgZywgYiksIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpLCBkZWx0YSA9IG1heCAtIG1pbiwgaCA9IDAsIHMgPSAwLCBsID0gKG1pbiArIG1heCkgLyAyO1xyXG4gICAgICAgIGlmIChsID4gMCAmJiBsIDwgMSkgcyA9IGRlbHRhIC8gKGwgPCAwLjUgPyAoMiAqIGwpIDogKDIgLSAyICogbCkpO1xyXG4gICAgICAgIGlmIChkZWx0YSA+IDApIHtcclxuICAgICAgICAgICAgaWYgKG1heCA9PSByICYmIG1heCAhPSBnKSBoICs9IChnIC0gYikgLyBkZWx0YTtcclxuICAgICAgICAgICAgaWYgKG1heCA9PSBnICYmIG1heCAhPSBiKSBoICs9ICgyICsgKGIgLSByKSAvIGRlbHRhKTtcclxuICAgICAgICAgICAgaWYgKG1heCA9PSBiICYmIG1heCAhPSByKSBoICs9ICg0ICsgKHIgLSBnKSAvIGRlbHRhKTtcclxuICAgICAgICAgICAgaCAvPSA2O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gWyBoLCBzLCBsIF07XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBoc2xUb1JnYjogZnVuY3Rpb24gKCBjICkge1xyXG5cclxuICAgICAgICBsZXQgcCwgcSwgaCA9IGNbMF0sIHMgPSBjWzFdLCBsID0gY1syXTtcclxuXHJcbiAgICAgICAgaWYgKCBzID09PSAwICkgcmV0dXJuIFsgbCwgbCwgbCBdO1xyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBxID0gbCA8PSAwLjUgPyBsICogKHMgKyAxKSA6IGwgKyBzIC0gKCBsICogcyApO1xyXG4gICAgICAgICAgICBwID0gbCAqIDIgLSBxO1xyXG4gICAgICAgICAgICByZXR1cm4gWyBULmh1ZVRvUmdiKHAsIHEsIGggKyAwLjMzMzMzKSwgVC5odWVUb1JnYihwLCBxLCBoKSwgVC5odWVUb1JnYihwLCBxLCBoIC0gMC4zMzMzMykgXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFNWRyBNT0RFTFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1ha2VHcmFkaWFudDogZnVuY3Rpb24gKCB0eXBlLCBzZXR0aW5ncywgcGFyZW50LCBjb2xvcnMgKSB7XHJcblxyXG4gICAgICAgIFQuZG9tKCB0eXBlLCBudWxsLCBzZXR0aW5ncywgcGFyZW50LCAwICk7XHJcblxyXG4gICAgICAgIGxldCBuID0gcGFyZW50LmNoaWxkTm9kZXNbMF0uY2hpbGROb2Rlcy5sZW5ndGggLSAxLCBjO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IGNvbG9ycy5sZW5ndGg7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgYyA9IGNvbG9yc1tpXTtcclxuICAgICAgICAgICAgLy9ULmRvbSggJ3N0b3AnLCBudWxsLCB7IG9mZnNldDpjWzBdKyclJywgc3R5bGU6J3N0b3AtY29sb3I6JytjWzFdKyc7IHN0b3Atb3BhY2l0eTonK2NbMl0rJzsnIH0sIHBhcmVudCwgWzAsbl0gKTtcclxuICAgICAgICAgICAgVC5kb20oICdzdG9wJywgbnVsbCwgeyBvZmZzZXQ6Y1swXSsnJScsICdzdG9wLWNvbG9yJzpjWzFdLCAgJ3N0b3Atb3BhY2l0eSc6Y1syXSB9LCBwYXJlbnQsIFswLG5dICk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8qbWFrZUdyYXBoOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGxldCB3ID0gMTI4O1xyXG4gICAgICAgIGxldCByYWRpdXMgPSAzNDtcclxuICAgICAgICBsZXQgc3ZnID0gVC5kb20oICdzdmcnLCBULmNzcy5iYXNpYyAsIHsgdmlld0JveDonMCAwICcrdysnICcrdywgd2lkdGg6dywgaGVpZ2h0OncsIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICBULmRvbSggJ3BhdGgnLCAnJywgeyBkOicnLCBzdHJva2U6VC5jb2xvcnMudGV4dCwgJ3N0cm9rZS13aWR0aCc6NCwgZmlsbDonbm9uZScsICdzdHJva2UtbGluZWNhcCc6J2J1dHQnIH0sIHN2ZyApOy8vMFxyXG4gICAgICAgIC8vVC5kb20oICdyZWN0JywgJycsIHsgeDoxMCwgeToxMCwgd2lkdGg6MTA4LCBoZWlnaHQ6MTA4LCBzdHJva2U6J3JnYmEoMCwwLDAsMC4zKScsICdzdHJva2Utd2lkdGgnOjIgLCBmaWxsOidub25lJ30sIHN2ZyApOy8vMVxyXG4gICAgICAgIC8vVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzLCBmaWxsOlQuY29sb3JzLmJ1dHRvbiwgc3Ryb2tlOidyZ2JhKDAsMCwwLDAuMyknLCAnc3Ryb2tlLXdpZHRoJzo4IH0sIHN2ZyApOy8vMFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzKzcsIHN0cm9rZToncmdiYSgwLDAsMCwwLjMpJywgJ3N0cm9rZS13aWR0aCc6NyAsIGZpbGw6J25vbmUnfSwgc3ZnICk7Ly8yXHJcbiAgICAgICAgLy9ULmRvbSggJ3BhdGgnLCAnJywgeyBkOicnLCBzdHJva2U6J3JnYmEoMjU1LDI1NSwyNTUsMC4zKScsICdzdHJva2Utd2lkdGgnOjIsIGZpbGw6J25vbmUnLCAnc3Ryb2tlLWxpbmVjYXAnOidyb3VuZCcsICdzdHJva2Utb3BhY2l0eSc6MC41IH0sIHN2ZyApOy8vM1xyXG4gICAgICAgIFQuZ3JhcGggPSBzdmc7XHJcblxyXG4gICAgfSwqL1xyXG5cclxuICAgIG1ha2VQYWQ6IGZ1bmN0aW9uICggbW9kZWwgKSB7XHJcblxyXG4gICAgICAgIGxldCB3dyA9IDI1NlxyXG4gICAgICAgIGxldCBzdmcgPSBULmRvbSggJ3N2ZycsIFQuY3NzLmJhc2ljICsgJ3Bvc2l0aW9uOnJlbGF0aXZlOycsIHsgdmlld0JveDonMCAwICcrd3crJyAnK3d3LCB3aWR0aDp3dywgaGVpZ2h0Ond3LCBwcmVzZXJ2ZUFzcGVjdFJhdGlvOidub25lJyB9ICk7XHJcbiAgICAgICAgbGV0IHcgPSAyMDA7IFxyXG4gICAgICAgIGxldCBkID0gKHd3LXcpKjAuNSwgbSA9IDIwO1xyXG4gICAgICAgIFRvb2xzLmRvbSggJ3JlY3QnLCAnJywgeyB4OiBkLCB5OiBkLCAgd2lkdGg6IHcsIGhlaWdodDogdywgZmlsbDpULmNvbG9ycy5iYWNrIH0sIHN2ZyApOyAvLyAwXHJcbiAgICAgICAgVG9vbHMuZG9tKCAncmVjdCcsICcnLCB7IHg6IGQrbSowLjUsIHk6IGQrbSowLjUsIHdpZHRoOiB3IC0gbSAsIGhlaWdodDogdyAtIG0sIGZpbGw6VC5jb2xvcnMuYnV0dG9uIH0sIHN2ZyApOyAvLyAxXHJcbiAgICAgICAgLy8gUG9pbnRlclxyXG4gICAgICAgIFRvb2xzLmRvbSggJ2xpbmUnLCAnJywgeyB4MTogZCsobSowLjUpLCB5MTogd3cgKjAuNSwgeDI6IGQrKHctbSowLjUpLCB5Mjogd3cgKiAwLjUsIHN0cm9rZTpULmNvbG9ycy5iYWNrLCAnc3Ryb2tlLXdpZHRoJzogMiB9LCBzdmcgKTsgLy8gMlxyXG4gICAgICAgIFRvb2xzLmRvbSggJ2xpbmUnLCAnJywgeyB4MTogd3cgKiAwLjUsIHgyOiB3dyAqIDAuNSwgeTE6IGQrKG0qMC41KSwgeTI6IGQrKHctbSowLjUpLCBzdHJva2U6VC5jb2xvcnMuYmFjaywgJ3N0cm9rZS13aWR0aCc6IDIgfSwgc3ZnICk7IC8vIDNcclxuICAgICAgICBUb29scy5kb20oICdjaXJjbGUnLCAnJywgeyBjeDogd3cgKiAwLjUsIGN5OiB3dyAqIDAuNSwgcjo1LCBzdHJva2U6IFQuY29sb3JzLnRleHQsICdzdHJva2Utd2lkdGgnOiA1LCBmaWxsOidub25lJyB9LCBzdmcgKTsgLy8gNFxyXG4gICAgICAgIFQucGFkMmQgPSBzdmc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtYWtlS25vYjogZnVuY3Rpb24gKCBtb2RlbCApIHtcclxuXHJcbiAgICAgICAgbGV0IHcgPSAxMjg7XHJcbiAgICAgICAgbGV0IHJhZGl1cyA9IDM0O1xyXG4gICAgICAgIGxldCBzdmcgPSBULmRvbSggJ3N2ZycsIFQuY3NzLmJhc2ljICsgJ3Bvc2l0aW9uOnJlbGF0aXZlOycsIHsgdmlld0JveDonMCAwICcrdysnICcrdywgd2lkdGg6dywgaGVpZ2h0OncsIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMsIGZpbGw6VC5jb2xvcnMuYnV0dG9uLCBzdHJva2U6J3JnYmEoMCwwLDAsMC4zKScsICdzdHJva2Utd2lkdGgnOjggfSwgc3ZnICk7Ly8wXHJcbiAgICAgICAgVC5kb20oICdwYXRoJywgJycsIHsgZDonJywgc3Ryb2tlOlQuY29sb3JzLnRleHQsICdzdHJva2Utd2lkdGgnOjQsIGZpbGw6J25vbmUnLCAnc3Ryb2tlLWxpbmVjYXAnOidyb3VuZCcgfSwgc3ZnICk7Ly8xXHJcbiAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzKzcsIHN0cm9rZToncmdiYSgwLDAsMCwwLjEpJywgJ3N0cm9rZS13aWR0aCc6NyAsIGZpbGw6J25vbmUnfSwgc3ZnICk7Ly8yXHJcbiAgICAgICAgVC5kb20oICdwYXRoJywgJycsIHsgZDonJywgc3Ryb2tlOidyZ2JhKDI1NSwyNTUsMjU1LDAuMyknLCAnc3Ryb2tlLXdpZHRoJzoyLCBmaWxsOidub25lJywgJ3N0cm9rZS1saW5lY2FwJzoncm91bmQnLCAnc3Ryb2tlLW9wYWNpdHknOjAuNSB9LCBzdmcgKTsvLzNcclxuICAgICAgICBULmtub2IgPSBzdmc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtYWtlQ2lyY3VsYXI6IGZ1bmN0aW9uICggbW9kZWwgKSB7XHJcblxyXG4gICAgICAgIGxldCB3ID0gMTI4O1xyXG4gICAgICAgIGxldCByYWRpdXMgPSA0MDtcclxuICAgICAgICBsZXQgc3ZnID0gVC5kb20oICdzdmcnLCBULmNzcy5iYXNpYyArICdwb3NpdGlvbjpyZWxhdGl2ZTsnLCB7IHZpZXdCb3g6JzAgMCAnK3crJyAnK3csIHdpZHRoOncsIGhlaWdodDp3LCBwcmVzZXJ2ZUFzcGVjdFJhdGlvOidub25lJyB9ICk7XHJcbiAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzLCBzdHJva2U6J3JnYmEoMCwwLDAsMC4xKScsICdzdHJva2Utd2lkdGgnOjEwLCBmaWxsOidub25lJyB9LCBzdmcgKTsvLzBcclxuICAgICAgICBULmRvbSggJ3BhdGgnLCAnJywgeyBkOicnLCBzdHJva2U6VC5jb2xvcnMudGV4dCwgJ3N0cm9rZS13aWR0aCc6NywgZmlsbDonbm9uZScsICdzdHJva2UtbGluZWNhcCc6J2J1dHQnIH0sIHN2ZyApOy8vMVxyXG4gICAgICAgIFQuY2lyY3VsYXIgPSBzdmc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtYWtlSm95c3RpY2s6IGZ1bmN0aW9uICggbW9kZWwgKSB7XHJcblxyXG4gICAgICAgIC8vKycgYmFja2dyb3VuZDojZjAwOydcclxuXHJcbiAgICAgICAgbGV0IHcgPSAxMjgsIGNjYztcclxuICAgICAgICBsZXQgcmFkaXVzID0gTWF0aC5mbG9vcigody0zMCkqMC41KTtcclxuICAgICAgICBsZXQgaW5uZXJSYWRpdXMgPSBNYXRoLmZsb29yKHJhZGl1cyowLjYpO1xyXG4gICAgICAgIGxldCBzdmcgPSBULmRvbSggJ3N2ZycsIFQuY3NzLmJhc2ljICsgJ3Bvc2l0aW9uOnJlbGF0aXZlOycsIHsgdmlld0JveDonMCAwICcrdysnICcrdywgd2lkdGg6dywgaGVpZ2h0OncsIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICBULmRvbSggJ2RlZnMnLCBudWxsLCB7fSwgc3ZnICk7XHJcbiAgICAgICAgVC5kb20oICdnJywgbnVsbCwge30sIHN2ZyApO1xyXG5cclxuICAgICAgICBpZiggbW9kZWwgPT09IDAgKXtcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgICAgICAvLyBncmFkaWFuIGJhY2tncm91bmRcclxuICAgICAgICAgICAgY2NjID0gWyBbNDAsICdyZ2IoMCwwLDApJywgMC4zXSwgWzgwLCAncmdiKDAsMCwwKScsIDBdLCBbOTAsICdyZ2IoNTAsNTAsNTApJywgMC40XSwgWzEwMCwgJ3JnYig1MCw1MCw1MCknLCAwXSBdO1xyXG4gICAgICAgICAgICBULm1ha2VHcmFkaWFudCggJ3JhZGlhbEdyYWRpZW50JywgeyBpZDonZ3JhZCcsIGN4Oic1MCUnLCBjeTonNTAlJywgcjonNTAlJywgZng6JzUwJScsIGZ5Oic1MCUnIH0sIHN2ZywgY2NjICk7XHJcblxyXG4gICAgICAgICAgICAvLyBncmFkaWFuIHNoYWRvd1xyXG4gICAgICAgICAgICBjY2MgPSBbIFs2MCwgJ3JnYigwLDAsMCknLCAwLjVdLCBbMTAwLCAncmdiKDAsMCwwKScsIDBdIF07XHJcbiAgICAgICAgICAgIFQubWFrZUdyYWRpYW50KCAncmFkaWFsR3JhZGllbnQnLCB7IGlkOidncmFkUycsIGN4Oic1MCUnLCBjeTonNTAlJywgcjonNTAlJywgZng6JzUwJScsIGZ5Oic1MCUnIH0sIHN2ZywgY2NjICk7XHJcblxyXG4gICAgICAgICAgICAvLyBncmFkaWFuIHN0aWNrXHJcbiAgICAgICAgICAgIGxldCBjYzAgPSBbJ3JnYig0MCw0MCw0MCknLCAncmdiKDQ4LDQ4LDQ4KScsICdyZ2IoMzAsMzAsMzApJ107XHJcbiAgICAgICAgICAgIGxldCBjYzEgPSBbJ3JnYigxLDkwLDE5NyknLCAncmdiKDMsOTUsMjA3KScsICdyZ2IoMCw2NSwxNjcpJ107XHJcblxyXG4gICAgICAgICAgICBjY2MgPSBbIFszMCwgY2MwWzBdLCAxXSwgWzYwLCBjYzBbMV0sIDFdLCBbODAsIGNjMFsxXSwgMV0sIFsxMDAsIGNjMFsyXSwgMV0gXTtcclxuICAgICAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdyYWRpYWxHcmFkaWVudCcsIHsgaWQ6J2dyYWRJbicsIGN4Oic1MCUnLCBjeTonNTAlJywgcjonNTAlJywgZng6JzUwJScsIGZ5Oic1MCUnIH0sIHN2ZywgY2NjICk7XHJcblxyXG4gICAgICAgICAgICBjY2MgPSBbIFszMCwgY2MxWzBdLCAxXSwgWzYwLCBjYzFbMV0sIDFdLCBbODAsIGNjMVsxXSwgMV0sIFsxMDAsIGNjMVsyXSwgMV0gXTtcclxuICAgICAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdyYWRpYWxHcmFkaWVudCcsIHsgaWQ6J2dyYWRJbjInLCBjeDonNTAlJywgY3k6JzUwJScsIHI6JzUwJScsIGZ4Oic1MCUnLCBmeTonNTAlJyB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICAgICAgLy8gZ3JhcGhcclxuXHJcbiAgICAgICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOnJhZGl1cywgZmlsbDondXJsKCNncmFkKScgfSwgc3ZnICk7Ly8yXHJcbiAgICAgICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQrNSwgY3k6NjQrMTAsIHI6aW5uZXJSYWRpdXMrMTAsIGZpbGw6J3VybCgjZ3JhZFMpJyB9LCBzdmcgKTsvLzNcclxuICAgICAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6aW5uZXJSYWRpdXMsIGZpbGw6J3VybCgjZ3JhZEluKScgfSwgc3ZnICk7Ly80XHJcblxyXG4gICAgICAgICAgICBULmpveXN0aWNrXzAgPSBzdmc7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAvLyBncmFkaWFuIHNoYWRvd1xyXG4gICAgICAgICAgICBjY2MgPSBbIFs2OSwgJ3JnYigwLDAsMCknLCAwXSxbNzAsICdyZ2IoMCwwLDApJywgMC4zXSwgWzEwMCwgJ3JnYigwLDAsMCknLCAwXSBdO1xyXG4gICAgICAgICAgICBULm1ha2VHcmFkaWFudCggJ3JhZGlhbEdyYWRpZW50JywgeyBpZDonZ3JhZFgnLCBjeDonNTAlJywgY3k6JzUwJScsIHI6JzUwJScsIGZ4Oic1MCUnLCBmeTonNTAlJyB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzLCBmaWxsOidub25lJywgc3Ryb2tlOidyZ2JhKDEwMCwxMDAsMTAwLDAuMjUpJywgJ3N0cm9rZS13aWR0aCc6JzQnIH0sIHN2ZyApOy8vMlxyXG4gICAgICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjppbm5lclJhZGl1cysxNCwgZmlsbDondXJsKCNncmFkWCknIH0sIHN2ZyApOy8vM1xyXG4gICAgICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjppbm5lclJhZGl1cywgZmlsbDonbm9uZScsIHN0cm9rZToncmdiKDEwMCwxMDAsMTAwKScsICdzdHJva2Utd2lkdGgnOic0JyB9LCBzdmcgKTsvLzRcclxuXHJcbiAgICAgICAgICAgIFQuam95c3RpY2tfMSA9IHN2ZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbWFrZUNvbG9yUmluZzogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBsZXQgdyA9IDI1NjtcclxuICAgICAgICBsZXQgc3ZnID0gVC5kb20oICdzdmcnLCBULmNzcy5iYXNpYyArICdwb3NpdGlvbjpyZWxhdGl2ZTsnLCB7IHZpZXdCb3g6JzAgMCAnK3crJyAnK3csIHdpZHRoOncsIGhlaWdodDp3LCBwcmVzZXJ2ZUFzcGVjdFJhdGlvOidub25lJyB9ICk7XHJcbiAgICAgICAgVC5kb20oICdkZWZzJywgbnVsbCwge30sIHN2ZyApO1xyXG4gICAgICAgIFQuZG9tKCAnZycsIG51bGwsIHt9LCBzdmcgKTtcclxuXHJcbiAgICAgICAgbGV0IHMgPSAzMDsvL3N0cm9rZVxyXG4gICAgICAgIGxldCByID0oIHctcyApKjAuNTtcclxuICAgICAgICBsZXQgbWlkID0gdyowLjU7XHJcbiAgICAgICAgbGV0IG4gPSAyNCwgbnVkZ2UgPSA4IC8gciAvIG4gKiBNYXRoLlBJLCBhMSA9IDAsIGQxO1xyXG4gICAgICAgIGxldCBhbSwgdGFuLCBkMiwgYTIsIGFyLCBpLCBqLCBwYXRoLCBjY2M7XHJcbiAgICAgICAgbGV0IGNvbG9yID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPD0gbjsgKytpKSB7XHJcblxyXG4gICAgICAgICAgICBkMiA9IGkgLyBuO1xyXG4gICAgICAgICAgICBhMiA9IGQyICogVC5Ud29QSTtcclxuICAgICAgICAgICAgYW0gPSAoYTEgKyBhMikgKiAwLjU7XHJcbiAgICAgICAgICAgIHRhbiA9IDEgLyBNYXRoLmNvcygoYTIgLSBhMSkgKiAwLjUpO1xyXG5cclxuICAgICAgICAgICAgYXIgPSBbXHJcbiAgICAgICAgICAgICAgICBNYXRoLnNpbihhMSksIC1NYXRoLmNvcyhhMSksIFxyXG4gICAgICAgICAgICAgICAgTWF0aC5zaW4oYW0pICogdGFuLCAtTWF0aC5jb3MoYW0pICogdGFuLCBcclxuICAgICAgICAgICAgICAgIE1hdGguc2luKGEyKSwgLU1hdGguY29zKGEyKVxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29sb3JbMV0gPSBULnJnYlRvSGV4KCBULmhzbFRvUmdiKFtkMiwgMSwgMC41XSkgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGogPSA2O1xyXG4gICAgICAgICAgICAgICAgd2hpbGUoai0tKXtcclxuICAgICAgICAgICAgICAgICAgIGFyW2pdID0gKChhcltqXSpyKSttaWQpLnRvRml4ZWQoMik7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcGF0aCA9ICcgTScgKyBhclswXSArICcgJyArIGFyWzFdICsgJyBRJyArIGFyWzJdICsgJyAnICsgYXJbM10gKyAnICcgKyBhcls0XSArICcgJyArIGFyWzVdO1xyXG5cclxuICAgICAgICAgICAgICAgIGNjYyA9IFsgWzAsY29sb3JbMF0sMV0sIFsxMDAsY29sb3JbMV0sMV0gXTtcclxuICAgICAgICAgICAgICAgIFQubWFrZUdyYWRpYW50KCAnbGluZWFyR3JhZGllbnQnLCB7IGlkOidHJytpLCB4MTphclswXSwgeTE6YXJbMV0sIHgyOmFyWzRdLCB5Mjphcls1XSwgZ3JhZGllbnRVbml0czpcInVzZXJTcGFjZU9uVXNlXCIgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBULmRvbSggJ3BhdGgnLCAnJywgeyBkOnBhdGgsICdzdHJva2Utd2lkdGgnOnMsIHN0cm9rZTondXJsKCNHJytpKycpJywgJ3N0cm9rZS1saW5lY2FwJzpcImJ1dHRcIiB9LCBzdmcsIDEgKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGExID0gYTIgLSBudWRnZTsgXHJcbiAgICAgICAgICAgIGNvbG9yWzBdID0gY29sb3JbMV07XHJcbiAgICAgICAgICAgIGQxID0gZDI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgYnIgPSAoMTI4IC0gcyApICsgMjtcclxuICAgICAgICBsZXQgYncgPSA2MDtcclxuXHJcbiAgICAgICAgbGV0IHR3ID0gODQuOTA7XHJcblxyXG4gICAgICAgIC8vIGJsYWNrIC8gd2hpdGVcclxuICAgICAgICBjY2MgPSBbIFswLCAnI0ZGRkZGRicsIDFdLCBbNTAsICcjRkZGRkZGJywgMF0sIFs1MCwgJyMwMDAwMDAnLCAwXSwgWzEwMCwgJyMwMDAwMDAnLCAxXSBdO1xyXG4gICAgICAgIFQubWFrZUdyYWRpYW50KCAnbGluZWFyR3JhZGllbnQnLCB7IGlkOidHTDAnLCB4MTowLCB5MTptaWQtdHcsIHgyOjAsIHkyOm1pZCt0dywgZ3JhZGllbnRVbml0czpcInVzZXJTcGFjZU9uVXNlXCIgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgY2NjID0gWyBbMCwgJyM3ZjdmN2YnLCAxXSwgWzUwLCAnIzdmN2Y3ZicsIDAuNV0sIFsxMDAsICcjN2Y3ZjdmJywgMF0gXTtcclxuICAgICAgICBULm1ha2VHcmFkaWFudCggJ2xpbmVhckdyYWRpZW50JywgeyBpZDonR0wxJywgeDE6bWlkLTQ5LjA1LCB5MTowLCB4MjptaWQrOTgsIHkyOjAsIGdyYWRpZW50VW5pdHM6XCJ1c2VyU3BhY2VPblVzZVwiIH0sIHN2ZywgY2NjICk7XHJcblxyXG4gICAgICAgIFQuZG9tKCAnZycsIG51bGwsIHsgJ3RyYW5zZm9ybS1vcmlnaW4nOiAnMTI4cHggMTI4cHgnLCAndHJhbnNmb3JtJzoncm90YXRlKDApJyB9LCBzdmcgKTsvLzJcclxuICAgICAgICBULmRvbSggJ3BvbHlnb24nLCAnJywgeyBwb2ludHM6Jzc4Ljk1IDQzLjEgNzguOTUgMjEyLjg1IDIyNiAxMjgnLCAgZmlsbDoncmVkJyAgfSwgc3ZnLCAyICk7Ly8gMiwwXHJcbiAgICAgICAgVC5kb20oICdwb2x5Z29uJywgJycsIHsgcG9pbnRzOic3OC45NSA0My4xIDc4Ljk1IDIxMi44NSAyMjYgMTI4JywgIGZpbGw6J3VybCgjR0wxKScsJ3N0cm9rZS13aWR0aCc6MSwgc3Ryb2tlOid1cmwoI0dMMSknICB9LCBzdmcsIDIgKTsvLzIsMVxyXG4gICAgICAgIFQuZG9tKCAncG9seWdvbicsICcnLCB7IHBvaW50czonNzguOTUgNDMuMSA3OC45NSAyMTIuODUgMjI2IDEyOCcsICBmaWxsOid1cmwoI0dMMCknLCdzdHJva2Utd2lkdGgnOjEsIHN0cm9rZTondXJsKCNHTDApJyAgfSwgc3ZnLCAyICk7Ly8yLDJcclxuICAgICAgICBULmRvbSggJ3BhdGgnLCAnJywgeyBkOidNIDI1NS43NSAxMzYuNSBRIDI1NiAxMzIuMyAyNTYgMTI4IDI1NiAxMjMuNyAyNTUuNzUgMTE5LjUgTCAyNDEgMTI4IDI1NS43NSAxMzYuNSBaJywgIGZpbGw6J25vbmUnLCdzdHJva2Utd2lkdGgnOjIsIHN0cm9rZTonIzAwMCcgIH0sIHN2ZywgMiApOy8vMiwzXHJcbiAgICAgICAgLy9ULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjEyOCsxMTMsIGN5OjEyOCwgcjo2LCAnc3Ryb2tlLXdpZHRoJzozLCBzdHJva2U6JyMwMDAnLCBmaWxsOidub25lJyB9LCBzdmcsIDIgKTsvLzIuM1xyXG5cclxuICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjEyOCwgY3k6MTI4LCByOjYsICdzdHJva2Utd2lkdGgnOjIsIHN0cm9rZTonIzAwMCcsIGZpbGw6J25vbmUnIH0sIHN2ZyApOy8vM1xyXG5cclxuICAgICAgICBULmNvbG9yUmluZyA9IHN2ZztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGljb246IGZ1bmN0aW9uICggdHlwZSwgY29sb3IsIHcgKXtcclxuXHJcbiAgICAgICAgdyA9IHcgfHwgNDA7XHJcbiAgICAgICAgLy9jb2xvciA9IGNvbG9yIHx8ICcjREVERURFJztcclxuICAgICAgICBsZXQgdmlld0JveCA9ICcwIDAgMjU2IDI1Nic7XHJcbiAgICAgICAgLy9sZXQgdmlld0JveCA9ICcwIDAgJysgdyArJyAnKyB3O1xyXG4gICAgICAgIGxldCB0ID0gW1wiPHN2ZyB4bWxucz0nXCIrVC5zdmducytcIicgdmVyc2lvbj0nMS4xJyB4bWxuczp4bGluaz0nXCIrVC5odG1scytcIicgc3R5bGU9J3BvaW50ZXItZXZlbnRzOm5vbmU7JyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSd4TWluWU1heCBtZWV0JyB4PScwcHgnIHk9JzBweCcgd2lkdGg9J1wiK3crXCJweCcgaGVpZ2h0PSdcIit3K1wicHgnIHZpZXdCb3g9J1wiK3ZpZXdCb3grXCInPjxnPlwiXTtcclxuICAgICAgICBzd2l0Y2godHlwZSl7XHJcbiAgICAgICAgICAgIGNhc2UgJ2xvZ28nOlxyXG4gICAgICAgICAgICB0WzFdPVwiPHBhdGggaWQ9J2xvZ29pbicgZmlsbD0nXCIrY29sb3IrXCInIHN0cm9rZT0nbm9uZScgZD0nXCIrVC5sb2dvRmlsbF9kK1wiJy8+XCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdkb25hdGUnOlxyXG4gICAgICAgICAgICB0WzFdPVwiPHBhdGggaWQ9J2xvZ29pbicgZmlsbD0nXCIrY29sb3IrXCInIHN0cm9rZT0nbm9uZScgZD0nXCIrVC5sb2dvX2RvbmF0ZStcIicvPlwiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnbmVvJzpcclxuICAgICAgICAgICAgdFsxXT1cIjxwYXRoIGlkPSdsb2dvaW4nIGZpbGw9J1wiK2NvbG9yK1wiJyBzdHJva2U9J25vbmUnIGQ9J1wiK1QubG9nb19uZW8rXCInLz5cIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3BoeSc6XHJcbiAgICAgICAgICAgIHRbMV09XCI8cGF0aCBpZD0nbG9nb2luJyBzdHJva2U9J1wiK2NvbG9yK1wiJyBzdHJva2Utd2lkdGg9JzQ5JyBzdHJva2UtbGluZWpvaW49J3JvdW5kJyBzdHJva2UtbGluZWNhcD0nYnV0dCcgZmlsbD0nbm9uZScgZD0nXCIrVC5sb2dvX3BoeStcIicvPlwiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnY29uZmlnJzpcclxuICAgICAgICAgICAgdFsxXT1cIjxwYXRoIGlkPSdsb2dvaW4nIHN0cm9rZT0nXCIrY29sb3IrXCInIHN0cm9rZS13aWR0aD0nNDknIHN0cm9rZS1saW5lam9pbj0ncm91bmQnIHN0cm9rZS1saW5lY2FwPSdidXR0JyBmaWxsPSdub25lJyBkPSdcIitULmxvZ29fY29uZmlnK1wiJy8+XCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdnaXRodWInOlxyXG4gICAgICAgICAgICB0WzFdPVwiPHBhdGggaWQ9J2xvZ29pbicgZmlsbD0nXCIrY29sb3IrXCInIHN0cm9rZT0nbm9uZScgZD0nXCIrVC5sb2dvX2dpdGh1YitcIicvPlwiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnc2F2ZSc6XHJcbiAgICAgICAgICAgIHRbMV09XCI8cGF0aCBzdHJva2U9J1wiK2NvbG9yK1wiJyBzdHJva2Utd2lkdGg9JzQnIHN0cm9rZS1saW5lam9pbj0ncm91bmQnIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgZmlsbD0nbm9uZScgZD0nTSAyNi4xMjUgMTcgTCAyMCAyMi45NSAxNC4wNSAxNyBNIDIwIDkuOTUgTCAyMCAyMi45NScvPjxwYXRoIHN0cm9rZT0nXCIrY29sb3I7XHJcbiAgICAgICAgICAgIHRbMV0rPVwiJyBzdHJva2Utd2lkdGg9JzIuNScgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBmaWxsPSdub25lJyBkPSdNIDMyLjYgMjMgTCAzMi42IDI1LjUgUSAzMi42IDI4LjUgMjkuNiAyOC41IEwgMTAuNiAyOC41IFEgNy42IDI4LjUgNy42IDI1LjUgTCA3LjYgMjMnLz5cIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRbMl0gPSBcIjwvZz48L3N2Zz5cIjtcclxuICAgICAgICByZXR1cm4gdC5qb2luKFwiXFxuXCIpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbG9nb0ZpbGxfZDpgXHJcbiAgICBNIDE3MSAxNTAuNzUgTCAxNzEgMzMuMjUgMTU1LjUgMzMuMjUgMTU1LjUgMTUwLjc1IFEgMTU1LjUgMTYyLjIgMTQ3LjQ1IDE3MC4yIDEzOS40NSAxNzguMjUgMTI4IDE3OC4yNSAxMTYuNiAxNzguMjUgMTA4LjU1IDE3MC4yIDEwMC41IDE2Mi4yIDEwMC41IDE1MC43NSBcclxuICAgIEwgMTAwLjUgMzMuMjUgODUgMzMuMjUgODUgMTUwLjc1IFEgODUgMTY4LjY1IDk3LjU1IDE4MS4xNSAxMTAuMTUgMTkzLjc1IDEyOCAxOTMuNzUgMTQ1LjkgMTkzLjc1IDE1OC40IDE4MS4xNSAxNzEgMTY4LjY1IDE3MSAxNTAuNzUgXHJcbiAgICBNIDIwMCAzMy4yNSBMIDE4NCAzMy4yNSAxODQgMTUwLjggUSAxODQgMTc0LjEgMTY3LjYgMTkwLjQgMTUxLjMgMjA2LjggMTI4IDIwNi44IDEwNC43NSAyMDYuOCA4OC4zIDE5MC40IDcyIDE3NC4xIDcyIDE1MC44IEwgNzIgMzMuMjUgNTYgMzMuMjUgNTYgMTUwLjc1IFxyXG4gICAgUSA1NiAxODAuNTUgNzcuMDUgMjAxLjYgOTguMiAyMjIuNzUgMTI4IDIyMi43NSAxNTcuOCAyMjIuNzUgMTc4LjkgMjAxLjYgMjAwIDE4MC41NSAyMDAgMTUwLjc1IEwgMjAwIDMzLjI1IFpcclxuICAgIGAsXHJcblxyXG4gICAgbG9nb19naXRodWI6YFxyXG4gICAgTSAxODAuNSA3MCBRIDE4Ni4zIDgyLjQgMTgxLjU1IDk2LjU1IDE5Ni41IDExMS41IDE4OS43IDE0MC42NSAxODMuNjUgMTY4LjM1IDE0NiAxNzIuNyAxNTIuNSAxNzguNyAxNTIuNTUgMTg1LjkgTCAxNTIuNTUgMjE4LjE1IFEgMTUyLjg0IDIyNC41NiAxNTkuMTUgMjIzLjMgXHJcbiAgICAxNTkuMjEgMjIzLjMgMTU5LjI1IDIyMy4zIDE4MS4xNCAyMTYuMjUgMTk4LjcgMTk4LjcgMjI4IDE2OS40IDIyOCAxMjggMjI4IDg2LjYgMTk4LjcgNTcuMyAxNjkuNCAyOCAxMjggMjggODYuNiAyOCA1Ny4zIDU3LjMgMjggODYuNiAyOCAxMjggMjggMTY5LjQgNTcuMyAxOTguNyA3NC44NSBcclxuICAgIDIxNi4yNSA5Ni43NSAyMjMuMyA5Ni43OCAyMjMuMyA5Ni44IDIyMy4zIDEwMy4xNiAyMjQuNTQgMTAzLjQ1IDIxOC4xNSBMIDEwMy40NSAyMDAgUSA4Mi45NyAyMDMuMSA3NS4xIDE5Ni4zNSA2OS44NSAxOTEuNjUgNjguNCAxODUuNDUgNjQuMjcgMTc3LjA1NSA1OS40IDE3NC4xNSA0OS4yMCBcclxuICAgIDE2Ni44NyA2MC44IDE2Ny44IDY5Ljg1IDE2OS42MSA3NS43IDE4MCA4MS4xMyAxODguMDkgOTAgMTg4LjU1IDk4LjE4IDE4OC44NiAxMDMuNDUgMTg1LjkgMTAzLjQ5IDE3OC42NyAxMTAgMTcyLjcgNzIuMzMgMTY4LjMzIDY2LjMgMTQwLjY1IDU5LjQ4IDExMS40OSA3NC40NSA5Ni41NSA2OS43IFxyXG4gICAgODIuNDEgNzUuNSA3MCA4NC44NyA2OC43NCAxMDMuMTUgODAgMTE1LjEyNSA3Ni42MzUgMTI4IDc2Ljg1IDE0MC44NSA3Ni42NSAxNTIuODUgODAgMTcxLjEgNjguNzUgMTgwLjUgNzAgWlxyXG4gICAgYCxcclxuXHJcbiAgICBsb2dvX25lbzpgXHJcbiAgICBNIDIxOSA1MiBMIDIwNiA1MiAyMDYgMTY2IFEgMjA2IDE4My40IDE5My43NSAxOTUuNjUgMTgxLjQgMjA4IDE2NCAyMDggMTQ2LjYgMjA4IDEzNC4zNSAxOTUuNjUgMTIyIDE4My40IDEyMiAxNjYgTCAxMjIgOTAgUSAxMjIgNzcuNiAxMTMuMTUgNjguODUgMTA0LjQgNjAgOTIgNjAgNzkuNTUgXHJcbiAgICA2MCA3MC43NSA2OC44NSA2MiA3Ny42IDYyIDkwIEwgNjIgMjA0IDc1IDIwNCA3NSA5MCBRIDc1IDgzIDc5Ljk1IDc4IDg0Ljk1IDczIDkyIDczIDk5IDczIDEwNCA3OCAxMDkgODMgMTA5IDkwIEwgMTA5IDE2NiBRIDEwOSAxODguOCAxMjUuMTUgMjA0Ljg1IDE0MS4yIDIyMSAxNjQgMjIxIFxyXG4gICAgMTg2Ljc1IDIyMSAyMDIuOTUgMjA0Ljg1IDIxOSAxODguOCAyMTkgMTY2IEwgMjE5IDUyIE0gMTk0IDUyIEwgMTgxIDUyIDE4MSAxNjYgUSAxODEgMTczIDE3Ni4wNSAxNzggMTcxLjA1IDE4MyAxNjQgMTgzIDE1NyAxODMgMTUyIDE3OCAxNDcgMTczIDE0NyAxNjYgTCAxNDcgOTAgUSAxNDcgXHJcbiAgICA2Ny4yIDEzMC44NSA1MS4xNSAxMTQuOCAzNSA5MiAzNSA2OS4yNSAzNSA1My4wNSA1MS4xNSAzNyA2Ny4yIDM3IDkwIEwgMzcgMjA0IDUwIDIwNCA1MCA5MCBRIDUwIDcyLjYgNjIuMjUgNjAuMzUgNzQuNiA0OCA5MiA0OCAxMDkuNCA0OCAxMjEuNjUgNjAuMzUgMTM0IDcyLjYgMTM0IDkwIEwgXHJcbiAgICAxMzQgMTY2IFEgMTM0IDE3OC40IDE0Mi44NSAxODcuMTUgMTUxLjYgMTk2IDE2NCAxOTYgMTc2LjQ1IDE5NiAxODUuMjUgMTg3LjE1IDE5NCAxNzguNCAxOTQgMTY2IEwgMTk0IDUyIFpcclxuICAgIGAsXHJcblxyXG4gICAgbG9nb19waHk6YFxyXG4gICAgTSAxMDMuNTUgMzcuOTUgTCAxMjcuOTUgMzcuOTUgUSAxNjIuMzUgMzcuOTUgMTg2LjUgNTUgMjEwLjkgNzIuMzUgMjEwLjkgOTYuNSAyMTAuOSAxMjAuNjUgMTg2LjUgMTM3LjcgMTYyLjM1IDE1NSAxMjcuOTUgMTU1IEwgMTI3Ljk1IDIzNy45NSBNIDEyNy45NSAxNTUgXHJcbiAgICBRIDkzLjU1IDE1NSA2OS4xNSAxMzcuNyA0NSAxMjAuNjUgNDUgOTYuNSA0NSA3Mi4zNSA2OS4xNSA1NSA3MC45IDUzLjggNzIuODUgNTIuODUgTSAxMjcuOTUgMTU1IEwgMTI3Ljk1IDM3Ljk1XHJcbiAgICBgLFxyXG5cclxuICAgIGxvZ29fY29uZmlnOmBcclxuICAgIE0gMjA0LjM1IDUxLjY1IEwgMTczLjI1IDgyLjc1IFEgMTkyIDEwMS41IDE5MiAxMjggTCAyMzYgMTI4IE0gMTkyIDEyOCBRIDE5MiAxNTQuNTUgMTczLjI1IDE3My4yNSBMIDIwNC40IDIwNC40IE0gNTEuNjUgNTEuNjUgTCA4Mi43NSA4Mi43NSBRIDEwMS41IDY0IDEyOCA2NCBcclxuICAgIEwgMTI4IDIwIE0gNTEuNiAyMDQuNCBMIDgyLjc1IDE3My4yNSBRIDY0IDE1NC41NSA2NCAxMjggTCAyMCAxMjggTSAxMjggMjM2IEwgMTI4IDE5MiBRIDEwMS41IDE5MiA4Mi43NSAxNzMuMjUgTSA2NCAxMjggUSA2NCAxMDEuNSA4Mi43NSA4Mi43NSBNIDE3My4yNSAxNzMuMjUgXHJcbiAgICBRIDE1NC41NSAxOTIgMTI4IDE5MiBNIDEyOCA2NCBRIDE1NC41NSA2NCAxNzMuMjUgODIuNzVcclxuICAgIGAsXHJcblxyXG4gICAgbG9nb19kb25hdGU6YFxyXG4gICAgTSAxNzEuMyA4MC4zIFEgMTc5LjUgNjIuMTUgMTcxLjMgNDUuOCAxNjQuMSAzMi41IDE0MS4zNSAzMC4xIEwgOTQuMzUgMzAuMSBRIDg5LjM1IDMwLjQgODguMyAzNS4xNSBMIDcwLjUgMTQ4LjA1IFEgNzAuMiAxNTIuNSA3My43IDE1Mi42IEwgMTAwLjk1IDE1Mi42IDEwNyAxMTEuNiBRIDEwOC43NSBcclxuICAgIDEwNi41NSAxMTIuNiAxMDYuNDUgMTMwLjQ1IDEwOC4wNSAxNDUuMyAxMDMuOSAxNjMuMzUgOTguNzUgMTcxLjMgODAuMyBNIDE3OS44IDcxLjUgUSAxNzguNiA3OS43NSAxNzQuOSA4Ny44NSAxNjguNDUgMTAyLjkgMTUxLjkgMTA5LjE1IDE0MC42NSAxMTMuOTUgMTE3LjU1IDExMyAxMTMuMTUgXHJcbiAgICAxMTIuNzUgMTExIDExNy40NSBMIDEwMi43IDE2OS45NSBRIDEwMi40NSAxNzMuOCAxMDUuNSAxNzMuODUgTCAxMjguOTUgMTczLjg1IFEgMTMyLjIgMTc0LjIgMTMzLjM1IDE2OS42NSBMIDEzOC4zIDEzOS45NSBRIDEzOS43NSAxMzUuNiAxNDMuMSAxMzUuNSAxNDYuNiAxMzUuNzUgMTUwLjYgMTM1LjY1IFxyXG4gICAgMTU0LjU1IDEzNS41IDE1Ny4zNSAxMzUuMSAxNjAuMTUgMTM0LjcgMTY2Ljc1IDEzMi4zNSAxODEuMzUgMTI3LjQgMTg3LjkgMTExLjIgMTk0LjI1IDk1Ljc1IDE4OS41IDgxLjk1IDE4Ni43NSA3NC44NSAxNzkuOCA3MS41IE0gMTAzLjUgMjA5LjkgUSAxMDMuNSAyMDIuODUgOTkuNyAxOTguODUgOTUuOTUgXHJcbiAgICAxOTQuNzUgODkuNCAxOTQuNzUgODIuOCAxOTQuNzUgNzkuMDUgMTk4Ljg1IDc1LjMgMjAyLjkgNzUuMyAyMDkuOSA3NS4zIDIxNi44NSA3OS4wNSAyMjAuOTUgODIuOCAyMjUuMDUgODkuNCAyMjUuMDUgOTUuOTUgMjI1LjA1IDk5LjcgMjIxIDEwMy41IDIxNi45NSAxMDMuNSAyMDkuOSBNIDk1LjQ1IDIwNS41IFxyXG4gICAgUSA5NS45NSAyMDcuMyA5NS45NSAyMDkuOSA5NS45NSAyMTIuNjUgOTUuNDUgMjE0LjM1IDk0Ljk1IDIxNiA5NCAyMTcuMyA5My4xIDIxOC40NSA5MS45IDIxOSA5MC43IDIxOS41NSA4OS40IDIxOS41NSA4OC4xNSAyMTkuNTUgODYuOTUgMjE5LjA1IDg1Ljc1IDIxOC41NSA4NC44IDIxNy4zIDgzLjkgMjE2LjE1IFxyXG4gICAgODMuNCAyMTQuMzUgODIuODUgMjEyLjYgODIuODUgMjA5LjkgODIuODUgMjA3LjMgODMuNCAyMDUuNDUgODMuOTUgMjAzLjU1IDg0Ljg1IDIwMi40NSA4NS45IDIwMS4yIDg2Ljk1IDIwMC43NSA4OC4wNSAyMDAuMjUgODkuNCAyMDAuMjUgOTAuNyAyMDAuMjUgOTEuODUgMjAwLjggOTMuMDUgMjAxLjMgOTQgMjAyLjUgXHJcbiAgICA5NC45IDIwMy42NSA5NS40NSAyMDUuNSBNIDE1My4zIDE5NS4zNSBMIDE0NS4zIDE5NS4zNSAxMzUuNSAyMjQuNDUgMTQyLjggMjI0LjQ1IDE0NC42IDIxOC41IDE1My43NSAyMTguNSAxNTUuNiAyMjQuNDUgMTYzLjEgMjI0LjQ1IDE1My4zIDE5NS4zNSBNIDE1Mi4xNSAyMTMuMjUgTCAxNDYuMjUgMjEzLjI1IFxyXG4gICAgMTQ5LjIgMjAzLjY1IDE1Mi4xNSAyMTMuMjUgTSAxMTYuNzUgMTk1LjM1IEwgMTA3LjggMTk1LjM1IDEwNy44IDIyNC40NSAxMTQuNSAyMjQuNDUgMTE0LjUgMjA0LjIgMTI1LjcgMjI0LjQ1IDEzMi43NSAyMjQuNDUgMTMyLjc1IDE5NS4zNSAxMjYuMDUgMTk1LjM1IDEyNi4wNSAyMTIuMDUgMTE2Ljc1IDE5NS4zNSBNIFxyXG4gICAgNjYuNSAxOTcuNjUgUSA2NC4xNSAxOTYuMTUgNjEuNDUgMTk1Ljc1IDU4LjggMTk1LjM1IDU1Ljc1IDE5NS4zNSBMIDQ2LjcgMTk1LjM1IDQ2LjcgMjI0LjQ1IDU1LjggMjI0LjQ1IFEgNTguOCAyMjQuNDUgNjEuNSAyMjQuMDUgNjQuMTUgMjIzLjYgNjYuNCAyMjIuMTUgNjkuMTUgMjIwLjQ1IDcwLjkgMjE3LjIgXHJcbiAgICA3Mi43IDIxNCA3Mi43IDIwOS45NSA3Mi43IDIwNS43IDcxIDIwMi42IDY5LjM1IDE5OS41IDY2LjUgMTk3LjY1IE0gNjQuMiAyMDUgUSA2NS4yIDIwNyA2NS4yIDIwOS45IDY1LjIgMjEyLjc1IDY0LjI1IDIxNC43NSA2My4zIDIxNi43NSA2MS41IDIxNy44NSA2MCAyMTguODUgNTguMyAyMTguOSA1Ni42IDIxOSBcclxuICAgIDU0LjE1IDIxOSBMIDU0IDIxOSA1NCAyMDAuOCA1NC4xNSAyMDAuOCBRIDU2LjQgMjAwLjggNTguMDUgMjAwLjkgNTkuNyAyMDAuOTUgNjEuMTUgMjAxLjc1IDYzLjIgMjAyLjk1IDY0LjIgMjA1IE0gMjEwLjIgMTk1LjM1IEwgMTkwLjUgMTk1LjM1IDE5MC41IDIyNC40NSAyMTAuMiAyMjQuNDUgMjEwLjIgMjE4LjkgXHJcbiAgICAxOTcuNzUgMjE4LjkgMTk3Ljc1IDIxMS41NSAyMDkuMiAyMTEuNTUgMjA5LjIgMjA2IDE5Ny43NSAyMDYgMTk3Ljc1IDIwMC45IDIxMC4yIDIwMC45IDIxMC4yIDE5NS4zNSBNIDE4Ny41IDE5NS4zNSBMIDE2MyAxOTUuMzUgMTYzIDIwMC45IDE3MS42IDIwMC45IDE3MS42IDIyNC40NSAxNzguOSAyMjQuNDUgMTc4LjkgXHJcbiAgICAyMDAuOSAxODcuNSAyMDAuOSAxODcuNSAxOTUuMzUgWlxyXG4gICAgYCxcclxuXHJcbn1cclxuXHJcblQuc2V0VGV4dCgpO1xyXG5cclxuZXhwb3J0IGNvbnN0IFRvb2xzID0gVDsiLCIvLy9odHRwczovL3dpY2cuZ2l0aHViLmlvL2ZpbGUtc3lzdGVtLWFjY2Vzcy8jYXBpLWZpbGVzeXN0ZW1maWxlaGFuZGxlLWdldGZpbGVcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRmlsZXMge1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICBGSUxFIFRZUEVcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzdGF0aWMgYXV0b1R5cGVzKCB0eXBlICkge1xyXG5cclxuICAgICAgICBsZXQgdCA9IFtdXHJcblxyXG4gICAgICAgIHN3aXRjaCggdHlwZSApe1xyXG4gICAgICAgICAgICBjYXNlICdzdmcnOlxyXG4gICAgICAgICAgICB0ID0gWyB7IGFjY2VwdDogeyAnaW1hZ2Uvc3ZnK3htbCc6ICcuc3ZnJ30gfSwgXVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnd2F2JzpcclxuICAgICAgICAgICAgdCA9IFsgeyBhY2NlcHQ6IHsgJ2F1ZGlvL3dhdic6ICcud2F2J30gfSwgXVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnbXAzJzpcclxuICAgICAgICAgICAgdCA9IFsgeyBhY2NlcHQ6IHsgJ2F1ZGlvL21wZWcnOiAnLm1wMyd9IH0sIF1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ21wNCc6XHJcbiAgICAgICAgICAgIHQgPSBbIHsgYWNjZXB0OiB7ICd2aWRlby9tcDQnOiAnLm1wNCd9IH0sIF1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2Jpbic6IGNhc2UgJ2hleCc6XHJcbiAgICAgICAgICAgIHQgPSBbIHsgZGVzY3JpcHRpb246ICdCaW5hcnkgRmlsZXMnLCBhY2NlcHQ6IHsgJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSc6IFsnLmJpbicsICcuaGV4J10gfSB9LCBdXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICd0ZXh0JzpcclxuICAgICAgICAgICAgdCA9IFsgeyBkZXNjcmlwdGlvbjogJ1RleHQgRmlsZXMnLCBhY2NlcHQ6IHsgJ3RleHQvcGxhaW4nOiBbJy50eHQnLCAnLnRleHQnXSwgJ3RleHQvaHRtbCc6IFsnLmh0bWwnLCAnLmh0bSddIH0gfSwgXVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnanNvbic6XHJcbiAgICAgICAgICAgIHQgPSBbIHsgZGVzY3JpcHRpb246ICdKU09OIEZpbGVzJywgYWNjZXB0OiB7ICdhcHBsaWNhdGlvbi9qc29uJzogWycuanNvbiddIH0gfSwgXS8vdGV4dC9wbGFpblxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnanMnOlxyXG4gICAgICAgICAgICB0ID0gWyB7IGRlc2NyaXB0aW9uOiAnSmF2YVNjcmlwdCBGaWxlcycsIGFjY2VwdDogeyAndGV4dC9qYXZhc2NyaXB0JzogWycuanMnXSB9IH0sIF1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2ltYWdlJzpcclxuICAgICAgICAgICAgdCA9IFsgeyBkZXNjcmlwdGlvbjogJ0ltYWdlcycsIGFjY2VwdDogeyAnaW1hZ2UvKic6IFsnLnBuZycsICcuZ2lmJywgJy5qcGVnJywgJy5qcGcnXSB9IH0sIF1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2ljb24nOlxyXG4gICAgICAgICAgICB0ID0gWyB7IGRlc2NyaXB0aW9uOiAnSWNvbnMnLCBhY2NlcHQ6IHsgJ2ltYWdlL3gtaWNvJzogWycuaWNvJ10gfSB9LCBdXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdsdXQnOlxyXG4gICAgICAgICAgICB0ID0gWyB7IGRlc2NyaXB0aW9uOiAnTHV0JywgYWNjZXB0OiB7ICd0ZXh0L3BsYWluJzogWycuY3ViZScsICcuM2RsJ10gfSB9LCBdXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgTE9BRFxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHRzdGF0aWMgYXN5bmMgbG9hZCggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5zaG93T3BlbkZpbGVQaWNrZXIgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgd2luZG93LnNob3dPcGVuRmlsZVBpY2tlciA9IEZpbGVzLnNob3dPcGVuRmlsZVBpY2tlclBvbHlmaWxsXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG5cclxuICAgICAgICBcdGxldCB0eXBlID0gby50eXBlIHx8ICcnXHJcblxyXG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgZXhjbHVkZUFjY2VwdEFsbE9wdGlvbjogdHlwZSA/IHRydWUgOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIG11bHRpcGxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIC8vc3RhcnRJbjonLi9hc3NldHMnXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBvcHRpb25zLnR5cGVzID0gRmlsZXMuYXV0b1R5cGVzKCB0eXBlIClcclxuXHJcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIG5ldyBoYW5kbGVcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlID0gYXdhaXQgd2luZG93LnNob3dPcGVuRmlsZVBpY2tlciggb3B0aW9ucyApXHJcbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSBhd2FpdCBoYW5kbGVbMF0uZ2V0RmlsZSgpXHJcbiAgICAgICAgICAgIC8vbGV0IGNvbnRlbnQgPSBhd2FpdCBmaWxlLnRleHQoKVxyXG5cclxuICAgICAgICAgICAgaWYoICFmaWxlICkgcmV0dXJuIG51bGxcclxuXHJcbiAgICAgICAgICAgIGxldCBmbmFtZSA9IGZpbGUubmFtZTtcclxuICAgICAgICAgICAgbGV0IGZ0eXBlID0gZm5hbWUuc3Vic3RyaW5nKCBmbmFtZS5sYXN0SW5kZXhPZignLicpKzEsIGZuYW1lLmxlbmd0aCApO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZGF0YVVybCA9IFsgJ3BuZycsICdqcGcnLCAnanBlZycsICdtcDQnLCAnd2VibScsICdvZ2cnLCAnbXAzJyBdO1xyXG4gICAgICAgICAgICBjb25zdCBkYXRhQnVmID0gWyAnc2VhJywgJ3onLCAnaGV4JywgJ2J2aCcsICdCVkgnLCAnZ2xiJywgJ2dsdGYnIF07XHJcbiAgICAgICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gICAgICAgICAgICBpZiggZGF0YVVybC5pbmRleE9mKCBmdHlwZSApICE9PSAtMSApIHJlYWRlci5yZWFkQXNEYXRhVVJMKCBmaWxlIClcclxuICAgICAgICAgICAgZWxzZSBpZiggZGF0YUJ1Zi5pbmRleE9mKCBmdHlwZSApICE9PSAtMSApIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciggZmlsZSApXHJcbiAgICAgICAgICAgIGVsc2UgcmVhZGVyLnJlYWRBc1RleHQoIGZpbGUgKVxyXG5cclxuICAgICAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgY29udGVudCA9IGUudGFyZ2V0LnJlc3VsdFxyXG5cclxuICAgICAgICAgICAgICAgIHN3aXRjaCh0eXBlKXtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdpbWFnZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbWcgPSBuZXcgSW1hZ2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBvLmNhbGxiYWNrICkgby5jYWxsYmFjayggaW1nLCBmbmFtZSwgZnR5cGUgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZy5zcmMgPSBjb250ZW50XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnanNvbic6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBvLmNhbGxiYWNrICkgby5jYWxsYmFjayggSlNPTi5wYXJzZSggY29udGVudCApLCBmbmFtZSwgZnR5cGUgKVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBvLmNhbGxiYWNrICkgby5jYWxsYmFjayggY29udGVudCwgZm5hbWUsIGZ0eXBlIClcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBjYXRjaChlKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKVxyXG4gICAgICAgICAgICBpZiggby5hbHdheXMgJiYgby5jYWxsYmFjayApIG8uY2FsbGJhY2soIG51bGwgKVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuXHRzdGF0aWMgc2hvd09wZW5GaWxlUGlja2VyUG9seWZpbGwoIG9wdGlvbnMgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xyXG4gICAgICAgICAgICBpbnB1dC50eXBlID0gXCJmaWxlXCI7XHJcbiAgICAgICAgICAgIGlucHV0Lm11bHRpcGxlID0gb3B0aW9ucy5tdWx0aXBsZTtcclxuICAgICAgICAgICAgaW5wdXQuYWNjZXB0ID0gb3B0aW9ucy50eXBlc1xyXG4gICAgICAgICAgICAgICAgLm1hcCgodHlwZSkgPT4gdHlwZS5hY2NlcHQpXHJcbiAgICAgICAgICAgICAgICAuZmxhdE1hcCgoaW5zdCkgPT4gT2JqZWN0LmtleXMoaW5zdCkuZmxhdE1hcCgoa2V5KSA9PiBpbnN0W2tleV0pKVxyXG4gICAgICAgICAgICAgICAgLmpvaW4oXCIsXCIpO1xyXG5cclxuICAgICAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKFxyXG4gICAgICAgICAgICAgICAgICAgIFsuLi5pbnB1dC5maWxlc10ubWFwKChmaWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRGaWxlOiBhc3luYyAoKSA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaW5wdXQuY2xpY2soKTtcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgU0FWRVxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBzYXZlKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIGxldCB1c2VQb2x5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93LnNob3dTYXZlRmlsZVBpY2tlciAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB3aW5kb3cuc2hvd1NhdmVGaWxlUGlja2VyID0gRmlsZXMuc2hvd1NhdmVGaWxlUGlja2VyUG9seWZpbGxcclxuICAgICAgICAgICAgdXNlUG9seSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG5cclxuICAgICAgICAgICAgbGV0IHR5cGUgPSBvLnR5cGUgfHwgJydcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBzdWdnZXN0ZWROYW1lOiBvLm5hbWUgfHwgJ2hlbGxvJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG8uZGF0YSB8fCAnJ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgb3B0aW9ucy50eXBlcyA9IEZpbGVzLmF1dG9UeXBlcyggdHlwZSApXHJcbiAgICAgICAgICAgIG9wdGlvbnMuZmluYWxUeXBlID0gT2JqZWN0LmtleXMoIG9wdGlvbnMudHlwZXNbMF0uYWNjZXB0IClbMF1cclxuICAgICAgICAgICAgb3B0aW9ucy5zdWdnZXN0ZWROYW1lICs9IG9wdGlvbnMudHlwZXNbMF0uYWNjZXB0W29wdGlvbnMuZmluYWxUeXBlXVswXVxyXG5cclxuXHJcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIG5ldyBoYW5kbGVcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlID0gYXdhaXQgd2luZG93LnNob3dTYXZlRmlsZVBpY2tlciggb3B0aW9ucyApO1xyXG5cclxuICAgICAgICAgICAgaWYoIHVzZVBvbHkgKSByZXR1cm5cclxuXHJcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIEZpbGVTeXN0ZW1Xcml0YWJsZUZpbGVTdHJlYW0gdG8gd3JpdGUgdG9cclxuICAgICAgICAgICAgY29uc3QgZmlsZSA9IGF3YWl0IGhhbmRsZS5jcmVhdGVXcml0YWJsZSgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGJsb2IgPSBuZXcgQmxvYihbIG9wdGlvbnMuZGF0YSBdLCB7IHR5cGU6IG9wdGlvbnMuZmluYWxUeXBlIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gd3JpdGUgb3VyIGZpbGVcclxuICAgICAgICAgICAgYXdhaXQgZmlsZS53cml0ZShibG9iKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGNsb3NlIHRoZSBmaWxlIGFuZCB3cml0ZSB0aGUgY29udGVudHMgdG8gZGlzay5cclxuICAgICAgICAgICAgYXdhaXQgZmlsZS5jbG9zZSgpO1xyXG5cclxuICAgICAgICB9IGNhdGNoKGUpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBzaG93U2F2ZUZpbGVQaWNrZXJQb2x5ZmlsbCggb3B0aW9ucyApIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xyXG4gICAgICAgICAgICBhLmRvd25sb2FkID0gb3B0aW9ucy5zdWdnZXN0ZWROYW1lIHx8IFwibXktZmlsZS50eHRcIlxyXG4gICAgICAgICAgICBsZXQgYmxvYiA9IG5ldyBCbG9iKFsgb3B0aW9ucy5kYXRhIF0sIHsgdHlwZTpvcHRpb25zLmZpbmFsVHlwZSB9KTtcclxuICAgICAgICAgICAgYS5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTCggYmxvYiApXHJcblxyXG4gICAgICAgICAgICBhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKFxyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoICgpID0+IFVSTC5yZXZva2VPYmplY3RVUkwoYS5ocmVmKSwgMTAwMCApXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIGEuY2xpY2soKVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICBGT0xERVIgbm90IHBvc3NpYmxlIGluIHBvbHlcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0Rm9sZGVyKCkge1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgXHJcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZSA9IGF3YWl0IHdpbmRvdy5zaG93RGlyZWN0b3J5UGlja2VyKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbGVzID0gW107XHJcbiAgICAgICAgICAgIGZvciBhd2FpdCAoY29uc3QgZW50cnkgb2YgaGFuZGxlLnZhbHVlcygpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlID0gYXdhaXQgZW50cnkuZ2V0RmlsZSgpO1xyXG4gICAgICAgICAgICAgICAgZmlsZXMucHVzaChmaWxlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coZmlsZXMpXHJcbiAgICAgICAgICAgIHJldHVybiBmaWxlcztcclxuXHJcbiAgICAgICAgfSBjYXRjaChlKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICB9XHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuICAgIFxyXG5cclxufSIsImV4cG9ydCBjbGFzcyBWMiB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKCB4ID0gMCwgeSA9IDAgKSB7XHJcblxyXG5cdFx0dGhpcy54ID0geDtcclxuXHRcdHRoaXMueSA9IHk7XHJcblxyXG5cdH1cclxuXHJcblx0c2V0ICggeCwgeSApIHtcclxuXHJcblx0XHR0aGlzLnggPSB4O1xyXG5cdFx0dGhpcy55ID0geTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdGRpdmlkZSAoIHYgKSB7XHJcblxyXG5cdFx0dGhpcy54IC89IHYueDtcclxuXHRcdHRoaXMueSAvPSB2Lnk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRtdWx0aXBseSAoIHYgKSB7XHJcblxyXG5cdFx0dGhpcy54ICo9IHYueDtcclxuXHRcdHRoaXMueSAqPSB2Lnk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRtdWx0aXBseVNjYWxhciAoIHNjYWxhciApIHtcclxuXHJcblx0XHR0aGlzLnggKj0gc2NhbGFyO1xyXG5cdFx0dGhpcy55ICo9IHNjYWxhcjtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdGRpdmlkZVNjYWxhciAoIHNjYWxhciApIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5tdWx0aXBseVNjYWxhciggMSAvIHNjYWxhciApO1xyXG5cclxuXHR9XHJcblxyXG5cdGxlbmd0aCAoKSB7XHJcblxyXG5cdFx0cmV0dXJuIE1hdGguc3FydCggdGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICk7XHJcblxyXG5cdH1cclxuXHJcblx0YW5nbGUgKCkge1xyXG5cclxuXHRcdC8vIGNvbXB1dGVzIHRoZSBhbmdsZSBpbiByYWRpYW5zIHdpdGggcmVzcGVjdCB0byB0aGUgcG9zaXRpdmUgeC1heGlzXHJcblxyXG5cdFx0dmFyIGFuZ2xlID0gTWF0aC5hdGFuMiggdGhpcy55LCB0aGlzLnggKTtcclxuXHJcblx0XHRpZiAoIGFuZ2xlIDwgMCApIGFuZ2xlICs9IDIgKiBNYXRoLlBJO1xyXG5cclxuXHRcdHJldHVybiBhbmdsZTtcclxuXHJcblx0fVxyXG5cclxuXHRhZGRTY2FsYXIgKCBzICkge1xyXG5cclxuXHRcdHRoaXMueCArPSBzO1xyXG5cdFx0dGhpcy55ICs9IHM7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRuZWdhdGUgKCkge1xyXG5cclxuXHRcdHRoaXMueCAqPSAtMTtcclxuXHRcdHRoaXMueSAqPSAtMTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdG5lZyAoKSB7XHJcblxyXG5cdFx0dGhpcy54ID0gLTE7XHJcblx0XHR0aGlzLnkgPSAtMTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdGlzWmVybyAoKSB7XHJcblxyXG5cdFx0cmV0dXJuICggdGhpcy54ID09PSAwICYmIHRoaXMueSA9PT0gMCApO1xyXG5cclxuXHR9XHJcblxyXG5cdGNvcHkgKCB2ICkge1xyXG5cclxuXHRcdHRoaXMueCA9IHYueDtcclxuXHRcdHRoaXMueSA9IHYueTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRlcXVhbHMgKCB2ICkge1xyXG5cclxuXHRcdHJldHVybiAoICggdi54ID09PSB0aGlzLnggKSAmJiAoIHYueSA9PT0gdGhpcy55ICkgKTtcclxuXHJcblx0fVxyXG5cclxuXHRuZWFyRXF1YWxzICggdiwgbiApIHtcclxuXHJcblx0XHRyZXR1cm4gKCAoIHYueC50b0ZpeGVkKG4pID09PSB0aGlzLngudG9GaXhlZChuKSApICYmICggdi55LnRvRml4ZWQobikgPT09IHRoaXMueS50b0ZpeGVkKG4pICkgKTtcclxuXHJcblx0fVxyXG5cclxuXHRsZXJwICggdiwgYWxwaGEgKSB7XHJcblxyXG5cdFx0aWYoIHYgPT09IG51bGwgKXtcclxuXHRcdFx0dGhpcy54IC09IHRoaXMueCAqIGFscGhhO1xyXG5cdFx0ICAgIHRoaXMueSAtPSB0aGlzLnkgKiBhbHBoYTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMueCArPSAoIHYueCAtIHRoaXMueCApICogYWxwaGE7XHJcblx0XHQgICAgdGhpcy55ICs9ICggdi55IC0gdGhpcy55ICkgKiBhbHBoYTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxufSIsImltcG9ydCB7IFJvb3RzIH0gZnJvbSBcIi4vUm9vdHMuanNcIjtcclxuaW1wb3J0IHsgVG9vbHMgfSBmcm9tIFwiLi9Ub29scy5qc1wiO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gXCIuL1YyLmpzXCI7XHJcblxyXG4vKipcclxuICogQGF1dGhvciBsdGggLyBodHRwczovL2dpdGh1Yi5jb20vbG8tdGhcclxuICovXHJcblxyXG5leHBvcnQgY2xhc3MgUHJvdG8ge1xyXG4gIGNvbnN0cnVjdG9yKG8gPSB7fSkge1xyXG4gICAgLy8gZGlzYWJsZSBtb3VzZSBjb250cm9sZVxyXG4gICAgdGhpcy5sb2NrID0gby5sb2NrIHx8IGZhbHNlO1xyXG5cclxuICAgIC8vIGZvciBidXR0b25cclxuICAgIHRoaXMubmV2ZXJsb2NrID0gZmFsc2U7XHJcblxyXG4gICAgLy8gb25seSBzaW1wbGUgc3BhY2VcclxuICAgIHRoaXMuaXNTcGFjZSA9IG8uaXNTcGFjZSB8fCBmYWxzZTtcclxuXHJcbiAgICAvLyBpZiBpcyBvbiBndWkgb3IgZ3JvdXBcclxuICAgIHRoaXMubWFpbiA9IG8ubWFpbiB8fCBudWxsO1xyXG4gICAgdGhpcy5pc1VJID0gby5pc1VJIHx8IGZhbHNlO1xyXG4gICAgdGhpcy5ncm91cCA9IG8uZ3JvdXAgfHwgbnVsbDtcclxuXHJcbiAgICB0aGlzLmlzTGlzdGVuID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy50b3AgPSAwO1xyXG4gICAgdGhpcy55dG9wID0gMDtcclxuXHJcbiAgICB0aGlzLmR4ID0gby5keCB8fCAwO1xyXG5cclxuICAgIHRoaXMuaXNTZWxlY3RhYmxlID0gby5zZWxlY3RhYmxlICE9PSB1bmRlZmluZWQgPyBvLnNlbGVjdGFibGUgOiBmYWxzZTtcclxuICAgIHRoaXMudW5zZWxlY3RhYmxlID1cclxuICAgICAgby51bnNlbGVjdCAhPT0gdW5kZWZpbmVkID8gby51bnNlbGVjdCA6IHRoaXMuaXNTZWxlY3RhYmxlO1xyXG5cclxuICAgIHRoaXMub250b3AgPSBvLm9udG9wID8gby5vbnRvcCA6IGZhbHNlOyAvLyAnYmVmb3JlYmVnaW4nICdhZnRlcmJlZ2luJyAnYmVmb3JlZW5kJyAnYWZ0ZXJlbmQnXHJcblxyXG4gICAgdGhpcy5jc3MgPSB0aGlzLm1haW4gPyB0aGlzLm1haW4uY3NzIDogVG9vbHMuY3NzO1xyXG5cclxuICAgIHRoaXMuY29sb3JzID0gVG9vbHMuZGVmaW5lQ29sb3IoXHJcbiAgICAgIG8sXHJcbiAgICAgIHRoaXMubWFpblxyXG4gICAgICAgID8gdGhpcy5ncm91cFxyXG4gICAgICAgICAgPyB0aGlzLmdyb3VwLmNvbG9yc1xyXG4gICAgICAgICAgOiB0aGlzLm1haW4uY29sb3JzXHJcbiAgICAgICAgOiBUb29scy5jb2xvcnNcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5vdmVyRWZmZWN0ID0gdGhpcy5jb2xvcnMuc2hvd092ZXI7XHJcblxyXG4gICAgdGhpcy5zdmdzID0gVG9vbHMuc3ZncztcclxuXHJcbiAgICB0aGlzLnpvbmUgPSB7IHg6IDAsIHk6IDAsIHc6IDAsIGg6IDAsIGQ6IDAgfTtcclxuICAgIHRoaXMubG9jYWwgPSBuZXcgVjIoKS5uZWcoKTtcclxuXHJcbiAgICB0aGlzLmlzQ2FudmFzT25seSA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc1NlbGVjdCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIHBlcmNlbnQgb2YgdGl0bGVcclxuICAgIHRoaXMucCA9IG8ucCAhPT0gdW5kZWZpbmVkID8gby5wIDogVG9vbHMuc2l6ZS5wO1xyXG5cclxuICAgIHRoaXMudyA9IHRoaXMuaXNVSSA/IHRoaXMubWFpbi5zaXplLncgOiBUb29scy5zaXplLnc7XHJcbiAgICBpZiAoby53ICE9PSB1bmRlZmluZWQpIHRoaXMudyA9IG8udztcclxuXHJcbiAgICB0aGlzLmggPSB0aGlzLmlzVUkgPyB0aGlzLm1haW4uc2l6ZS5oIDogVG9vbHMuc2l6ZS5oO1xyXG4gICAgaWYgKG8uaCAhPT0gdW5kZWZpbmVkKSB0aGlzLmggPSBvLmg7XHJcbiAgICBpZiAoIXRoaXMuaXNTcGFjZSkgdGhpcy5oID0gdGhpcy5oIDwgMTEgPyAxMSA6IHRoaXMuaDtcclxuICAgIGVsc2UgdGhpcy5sb2NrID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBkZWNhbGUgZm9yIGNhbnZhcyBvbmx5XHJcbiAgICB0aGlzLmZ3ID0gby5mdyB8fCAwO1xyXG5cclxuICAgIHRoaXMuYXV0b1dpZHRoID0gby5hdXRvIHx8IHRydWU7IC8vIGF1dG8gd2lkdGggb3IgZmxleFxyXG4gICAgdGhpcy5pc09wZW4gPSBmYWxzZTsgLy9mYWxzZS8vIG9wZW4gc3RhdHVcclxuXHJcbiAgICAvLyByYWRpdXMgZm9yIHRvb2xib3hcclxuICAgIHRoaXMucmFkaXVzID0gby5yYWRpdXMgfHwgdGhpcy5jb2xvcnMucmFkaXVzO1xyXG5cclxuICAgIHRoaXMudHJhbnNpdGlvbiA9IG8udHJhbnNpdGlvbiB8fCBUb29scy50cmFuc2l0aW9uO1xyXG5cclxuICAgIC8vIG9ubHkgZm9yIG51bWJlclxyXG4gICAgdGhpcy5pc051bWJlciA9IGZhbHNlO1xyXG4gICAgdGhpcy5ub05lZyA9IG8ubm9OZWcgfHwgZmFsc2U7XHJcbiAgICB0aGlzLmFsbEVxdWFsID0gby5hbGxFcXVhbCB8fCBmYWxzZTtcclxuXHJcbiAgICAvLyBvbmx5IG1vc3Qgc2ltcGxlXHJcbiAgICB0aGlzLm1vbm8gPSBmYWxzZTtcclxuXHJcbiAgICAvLyBzdG9wIGxpc3RlbmluZyBmb3IgZWRpdCBzbGlkZSB0ZXh0XHJcbiAgICB0aGlzLmlzRWRpdCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIG5vIHRpdGxlXHJcbiAgICB0aGlzLnNpbXBsZSA9IG8uc2ltcGxlIHx8IGZhbHNlO1xyXG4gICAgaWYgKHRoaXMuc2ltcGxlKSB0aGlzLnNhID0gMDtcclxuXHJcbiAgICAvLyBkZWZpbmUgb2JqIHNpemVcclxuICAgIHRoaXMuc2V0U2l6ZSh0aGlzLncpO1xyXG5cclxuICAgIC8vIHRpdGxlIHNpemVcclxuICAgIGlmIChvLnNhICE9PSB1bmRlZmluZWQpIHRoaXMuc2EgPSBvLnNhO1xyXG4gICAgaWYgKG8uc2IgIT09IHVuZGVmaW5lZCkgdGhpcy5zYiA9IG8uc2I7XHJcbiAgICBpZiAodGhpcy5zaW1wbGUpIHRoaXMuc2IgPSB0aGlzLncgLSB0aGlzLnNhO1xyXG5cclxuICAgIC8vIGxhc3QgbnVtYmVyIHNpemUgZm9yIHNsaWRlXHJcbiAgICB0aGlzLnNjID0gby5zYyA9PT0gdW5kZWZpbmVkID8gNDcgOiBvLnNjO1xyXG5cclxuICAgIC8vIGZvciBsaXN0ZW5pbmcgb2JqZWN0XHJcbiAgICB0aGlzLm9iamVjdExpbmsgPSBudWxsO1xyXG4gICAgdGhpcy5pc1NlbmQgPSBmYWxzZTtcclxuICAgIHRoaXMub2JqZWN0S2V5ID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLnR4dCA9IG8ubmFtZSB8fCBcIlwiO1xyXG4gICAgdGhpcy5uYW1lID0gby5yZW5hbWUgfHwgdGhpcy50eHQ7XHJcbiAgICB0aGlzLnRhcmdldCA9IG8udGFyZ2V0IHx8IG51bGw7XHJcblxyXG4gICAgLy8gY2FsbGJhY2tcclxuICAgIHRoaXMuY2FsbGJhY2sgPSBvLmNhbGxiYWNrID09PSB1bmRlZmluZWQgPyBudWxsIDogby5jYWxsYmFjaztcclxuICAgIHRoaXMuZW5kQ2FsbGJhY2sgPSBudWxsO1xyXG4gICAgdGhpcy5vcGVuQ2FsbGJhY2sgPSBvLm9wZW5DYWxsYmFjayA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IG8ub3BlbkNhbGxiYWNrO1xyXG4gICAgdGhpcy5jbG9zZUNhbGxiYWNrID0gby5jbG9zZUNhbGxiYWNrID09PSB1bmRlZmluZWQgPyBudWxsIDogby5jbG9zZUNhbGxiYWNrO1xyXG5cclxuICAgIC8vIGlmIG5vIGNhbGxiYWNrIHRha2Ugb25lIGZyb20gZ3JvdXAgb3IgZ3VpXHJcbiAgICBpZiAodGhpcy5jYWxsYmFjayA9PT0gbnVsbCAmJiB0aGlzLmlzVUkgJiYgdGhpcy5tYWluLmNhbGxiYWNrICE9PSBudWxsKSB7XHJcbiAgICAgIHRoaXMuY2FsbGJhY2sgPSB0aGlzLmdyb3VwID8gdGhpcy5ncm91cC5jYWxsYmFjayA6IHRoaXMubWFpbi5jYWxsYmFjaztcclxuICAgIH1cclxuXHJcbiAgICAvLyBlbGVtZW50c1xyXG4gICAgdGhpcy5jID0gW107XHJcblxyXG4gICAgLy8gc3R5bGVcclxuICAgIHRoaXMucyA9IFtdO1xyXG5cclxuICAgIHRoaXMudXNlRmxleCA9IHRoaXMuaXNVSSA/IHRoaXMubWFpbi51c2VGbGV4IDogZmFsc2U7XHJcbiAgICBsZXQgZmxleGlibGUgPSB0aGlzLnVzZUZsZXhcclxuICAgICAgPyBcImRpc3BsYXk6ZmxleDsganVzdGlmeS1jb250ZW50OmNlbnRlcjsgYWxpZ24taXRlbXM6Y2VudGVyOyB0ZXh0LWFsaWduOmNlbnRlcjsgZmxleDogMSAxMDAlO1wiXHJcbiAgICAgIDogXCJmbG9hdDpsZWZ0O1wiO1xyXG5cclxuICAgIHRoaXMuY1swXSA9IFRvb2xzLmRvbShcclxuICAgICAgXCJkaXZcIixcclxuICAgICAgdGhpcy5jc3MuYmFzaWMgKyBmbGV4aWJsZSArIFwicG9zaXRpb246cmVsYXRpdmU7IGhlaWdodDoyMHB4O1wiXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuc1swXSA9IHRoaXMuY1swXS5zdHlsZTtcclxuXHJcbiAgICAvLyBib3R0b20gbWFyZ2luXHJcbiAgICB0aGlzLm1hcmdpbiA9IHRoaXMuY29sb3JzLnN5O1xyXG4gICAgdGhpcy5tdG9wID0gMDtcclxuICAgIGxldCBtYXJnaW5EaXYgPSBUb29scy5pc0RpdmlkKHRoaXMubWFyZ2luKTtcclxuXHJcbiAgICBpZiAodGhpcy5pc1VJICYmIHRoaXMubWFyZ2luKSB7XHJcbiAgICAgIHRoaXMuc1swXS5ib3hTaXppbmcgPSBcImNvbnRlbnQtYm94XCI7XHJcbiAgICAgIGlmIChtYXJnaW5EaXYpIHtcclxuICAgICAgICB0aGlzLm10b3AgPSB0aGlzLm1hcmdpbiAqIDAuNTtcclxuICAgICAgICAvL3RoaXMuc1swXS5ib3JkZXJUb3AgPSAnJHt0aGlzLm10b3B9cHggc29saWQgdHJhbnNwYXJlbnQnXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhgJHt0aGlzLm10b3B9cHggc29saWQgdHJhbnNwYXJlbnRgKVxyXG4gICAgICAgIHRoaXMuc1swXS5ib3JkZXJUb3AgPSB0aGlzLm10b3AgKyBcInB4IHNvbGlkIHRyYW5zcGFyZW50XCI7XHJcbiAgICAgICAgdGhpcy5zWzBdLmJvcmRlckJvdHRvbSA9IHRoaXMubXRvcCArIFwicHggc29saWQgdHJhbnNwYXJlbnRcIjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnNbMF0uYm9yZGVyQm90dG9tID0gdGhpcy5tYXJnaW4gKyBcInB4IHNvbGlkIHRyYW5zcGFyZW50XCI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyB3aXRoIHRpdGxlXHJcbiAgICBpZiAoIXRoaXMuc2ltcGxlKSB7XHJcbiAgICAgIHRoaXMuY1sxXSA9IFRvb2xzLmRvbShcImRpdlwiLCB0aGlzLmNzcy50eHQgKyB0aGlzLmNzcy5taWRkbGUpO1xyXG4gICAgICB0aGlzLnNbMV0gPSB0aGlzLmNbMV0uc3R5bGU7XHJcbiAgICAgIHRoaXMuY1sxXS50ZXh0Q29udGVudCA9IHRoaXMubmFtZTtcclxuICAgICAgdGhpcy5zWzFdLmNvbG9yID0gdGhpcy5sb2NrID8gdGhpcy5jb2xvcnMudGl0bGVvZmYgOiB0aGlzLmNvbG9ycy50aXRsZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoby5wb3MpIHtcclxuICAgICAgdGhpcy5zWzBdLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xyXG4gICAgICBmb3IgKGxldCBwIGluIG8ucG9zKSB7XHJcbiAgICAgICAgdGhpcy5zWzBdW3BdID0gby5wb3NbcF07XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5tb25vID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoby5jc3MpIHRoaXMuc1swXS5jc3NUZXh0ID0gby5jc3M7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gbWFrZSB0aGUgbm9kZVxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgaW5pdCgpIHtcclxuICAgIHRoaXMueXRvcCA9IHRoaXMudG9wICsgdGhpcy5tdG9wO1xyXG5cclxuICAgIHRoaXMuem9uZS5oID0gdGhpcy5oICsgdGhpcy5tYXJnaW47XHJcbiAgICB0aGlzLnpvbmUudyA9IHRoaXMudztcclxuXHJcbiAgICBsZXQgcyA9IHRoaXMuczsgLy8gc3R5bGUgY2FjaGVcclxuICAgIGxldCBjID0gdGhpcy5jOyAvLyBkaXYgY2FjaFxyXG5cclxuICAgIHNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgXCJweFwiO1xyXG5cclxuICAgIGlmICh0aGlzLmlzVUkpIHNbMF0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmJhY2tncm91bmQ7XHJcblxyXG4gICAgaWYgKCF0aGlzLmF1dG9XaWR0aCAmJiB0aGlzLnVzZUZsZXgpIHtcclxuICAgICAgc1swXS5mbGV4ID0gXCIxIDAgYXV0b1wiO1xyXG4gICAgICBzWzBdLm1pbldpZHRoID0gdGhpcy5taW53ICsgXCJweFwiO1xyXG4gICAgICBzWzBdLnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAodGhpcy5pc1VJKSBzWzBdLndpZHRoID0gXCIxMDAlXCI7XHJcbiAgICB9XHJcblxyXG4gICAgLy9pZiggdGhpcy5hdXRvSGVpZ2h0ICkgc1swXS50cmFuc2l0aW9uID0gJ2hlaWdodCAwLjAxcyBlYXNlLW91dCc7XHJcbiAgICBpZiAoY1sxXSAhPT0gdW5kZWZpbmVkICYmIHRoaXMuYXV0b1dpZHRoKSB7XHJcbiAgICAgIHNbMV0gPSBjWzFdLnN0eWxlO1xyXG4gICAgICBzWzFdLnRvcCA9IDEgKyBcInB4XCI7XHJcbiAgICAgIHNbMV0uaGVpZ2h0ID0gdGhpcy5oIC0gMiArIFwicHhcIjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZnJhZyA9IFRvb2xzLmZyYWc7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDEsIGxuZyA9IGMubGVuZ3RoOyBpICE9PSBsbmc7IGkrKykge1xyXG4gICAgICBpZiAoY1tpXSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChjW2ldKTtcclxuICAgICAgICBzW2ldID0gY1tpXS5zdHlsZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBwcCA9XHJcbiAgICAgIHRoaXMudGFyZ2V0ICE9PSBudWxsXHJcbiAgICAgICAgPyB0aGlzLnRhcmdldFxyXG4gICAgICAgIDogdGhpcy5pc1VJXHJcbiAgICAgICAgPyB0aGlzLm1haW4uaW5uZXJcclxuICAgICAgICA6IGRvY3VtZW50LmJvZHk7XHJcblxyXG4gICAgaWYgKHRoaXMub250b3ApIHBwLmluc2VydEFkamFjZW50RWxlbWVudChcImFmdGVyYmVnaW5cIiwgY1swXSk7XHJcbiAgICBlbHNlIHBwLmFwcGVuZENoaWxkKGNbMF0pO1xyXG5cclxuICAgIGNbMF0uYXBwZW5kQ2hpbGQoZnJhZyk7XHJcblxyXG4gICAgdGhpcy5yU2l6ZSgpO1xyXG5cclxuICAgIC8vICEgc29sbyBwcm90b1xyXG4gICAgaWYgKCF0aGlzLmlzVUkpIHtcclxuICAgICAgdGhpcy5jWzBdLnN0eWxlLnBvaW50ZXJFdmVudHMgPSBcImF1dG9cIjtcclxuICAgICAgUm9vdHMuYWRkKHRoaXMpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYWRkVHJhbnNpdGlvbigpIHtcclxuICAgIGlmICh0aGlzLmJhc2VIICYmIHRoaXMudHJhbnNpdGlvbiAmJiB0aGlzLmlzVUkpIHtcclxuICAgICAgdGhpcy5jWzBdLnN0eWxlLnRyYW5zaXRpb24gPSBcImhlaWdodCBcIiArIHRoaXMudHJhbnNpdGlvbiArIFwicyBlYXNlLW91dFwiO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gZnJvbSBUb29sc1xyXG5cclxuICBkb20odHlwZSwgY3NzLCBvYmosIGRvbSwgaWQpIHtcclxuICAgIHJldHVybiBUb29scy5kb20odHlwZSwgY3NzLCBvYmosIGRvbSwgaWQpO1xyXG4gIH1cclxuXHJcbiAgc2V0U3ZnKGRvbSwgdHlwZSwgdmFsdWUsIGlkLCBpZDIpIHtcclxuICAgIFRvb2xzLnNldFN2Zyhkb20sIHR5cGUsIHZhbHVlLCBpZCwgaWQyKTtcclxuICB9XHJcblxyXG4gIHNldENzcyhkb20sIGNzcykge1xyXG4gICAgVG9vbHMuc2V0Q3NzKGRvbSwgY3NzKTtcclxuICB9XHJcblxyXG4gIGNsYW1wKHZhbHVlLCBtaW4sIG1heCkge1xyXG4gICAgcmV0dXJuIFRvb2xzLmNsYW1wKHZhbHVlLCBtaW4sIG1heCk7XHJcbiAgfVxyXG5cclxuICBnZXRDb2xvclJpbmcoKSB7XHJcbiAgICBpZiAoIVRvb2xzLmNvbG9yUmluZykgVG9vbHMubWFrZUNvbG9yUmluZygpO1xyXG4gICAgcmV0dXJuIFRvb2xzLmNsb25lKFRvb2xzLmNvbG9yUmluZyk7XHJcbiAgfVxyXG5cclxuICBnZXRKb3lzdGljayhtb2RlbCkge1xyXG4gICAgaWYgKCFUb29sc1tcImpveXN0aWNrX1wiICsgbW9kZWxdKSBUb29scy5tYWtlSm95c3RpY2sobW9kZWwpO1xyXG4gICAgcmV0dXJuIFRvb2xzLmNsb25lKFRvb2xzW1wiam95c3RpY2tfXCIgKyBtb2RlbF0pO1xyXG4gIH1cclxuXHJcbiAgZ2V0Q2lyY3VsYXIobW9kZWwpIHtcclxuICAgIGlmICghVG9vbHMuY2lyY3VsYXIpIFRvb2xzLm1ha2VDaXJjdWxhcihtb2RlbCk7XHJcbiAgICByZXR1cm4gVG9vbHMuY2xvbmUoVG9vbHMuY2lyY3VsYXIpO1xyXG4gIH1cclxuXHJcbiAgZ2V0S25vYihtb2RlbCkge1xyXG4gICAgaWYgKCFUb29scy5rbm9iKSBUb29scy5tYWtlS25vYihtb2RlbCk7XHJcbiAgICByZXR1cm4gVG9vbHMuY2xvbmUoVG9vbHMua25vYik7XHJcbiAgfVxyXG5cclxuICBnZXRQYWQyZChtb2RlbCkge1xyXG4gICAgaWYgKCFUb29scy5wYWQyZCkgVG9vbHMubWFrZVBhZChtb2RlbCk7XHJcbiAgICByZXR1cm4gVG9vbHMuY2xvbmUoVG9vbHMucGFkMmQpO1xyXG4gIH1cclxuXHJcbiAgLy8gZnJvbSBSb290c1xyXG5cclxuICBjdXJzb3IobmFtZSkge1xyXG4gICAgUm9vdHMuY3Vyc29yKG5hbWUpO1xyXG4gIH1cclxuXHJcbiAgLy8vLy8vLy8vXHJcblxyXG4gIHVwZGF0ZSgpIHt9XHJcblxyXG4gIHJlc2V0KCkge31cclxuXHJcbiAgLy8vLy8vLy8vXHJcblxyXG4gIGNvbnRlbnQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jWzBdO1xyXG4gIH1cclxuXHJcbiAgZ2V0RG9tKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY1swXTtcclxuICB9XHJcblxyXG4gIHVpb3V0KCkge1xyXG4gICAgaWYgKHRoaXMubG9jaykgcmV0dXJuO1xyXG4gICAgaWYgKCF0aGlzLm92ZXJFZmZlY3QpIHJldHVybjtcclxuICAgIGlmICh0aGlzLnMpIHRoaXMuc1swXS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuYmFja2dyb3VuZDtcclxuICB9XHJcblxyXG4gIHVpb3ZlcigpIHtcclxuICAgIGlmICh0aGlzLmxvY2spIHJldHVybjtcclxuICAgIGlmICghdGhpcy5vdmVyRWZmZWN0KSByZXR1cm47XHJcbiAgICBpZiAodGhpcy5zKSB0aGlzLnNbMF0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmJhY2tncm91bmRPdmVyO1xyXG4gIH1cclxuXHJcbiAgcmVuYW1lKHMpIHtcclxuICAgIGlmICh0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCkgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gcztcclxuICB9XHJcblxyXG4gIGxpc3RlbigpIHtcclxuICAgIHRoaXMuaXNMaXN0ZW4gPSBSb290cy5hZGRMaXN0ZW4odGhpcyk7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIGxpc3RlbmluZygpIHtcclxuICAgIC8vIG1vZGlmaWVkIGJ5IEZlZGVtYXJpbm9cclxuICAgIGlmICh0aGlzLm9iamVjdExpbmsgPT09IG51bGwpIHJldHVybjtcclxuICAgIGlmICh0aGlzLmlzU2VuZCkgcmV0dXJuO1xyXG4gICAgaWYgKHRoaXMuaXNFZGl0KSByZXR1cm47XHJcbiAgICAvLyBjaGVjayBpZiB2YWx1ZSBoYXMgY2hhbmdlZFxyXG4gICAgbGV0IGhhc0NoYW5nZWQgPSB0aGlzLnNldFZhbHVlKHRoaXMub2JqZWN0TGlua1t0aGlzLm9iamVjdEtleV0pO1xyXG4gICAgcmV0dXJuIGhhc0NoYW5nZWQ7XHJcbiAgfVxyXG5cclxuICBzZXRWYWx1ZSh2KSB7XHJcbiAgICBjb25zdCBvbGQgPSB0aGlzLnZhbHVlO1xyXG4gICAgaWYgKHRoaXMuaXNOdW1iZXIpIHRoaXMudmFsdWUgPSB0aGlzLm51bVZhbHVlKHYpO1xyXG4gICAgLy9lbHNlIGlmKCB2IGluc3RhbmNlb2YgQXJyYXkgJiYgdi5sZW5ndGggPT09IDEgKSB2ID0gdlswXTtcclxuICAgIGVsc2UgdGhpcy52YWx1ZSA9IHY7XHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgbGV0IGhhc0NoYW5nZWQgPSBmYWxzZTtcclxuICAgIGlmIChvbGQgIT09IHRoaXMudmFsdWUpIHtcclxuICAgICAgaGFzQ2hhbmdlZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGhhc0NoYW5nZWQ7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gdXBkYXRlIGV2ZXJ5IGNoYW5nZVxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgb25DaGFuZ2UoZikge1xyXG4gICAgaWYgKHRoaXMuaXNTcGFjZSkgcmV0dXJuO1xyXG4gICAgdGhpcy5jYWxsYmFjayA9IGYgfHwgbnVsbDtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIHVwZGF0ZSBvbmx5IG9uIGVuZFxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgb25GaW5pc2hDaGFuZ2UoZikge1xyXG4gICAgaWYgKHRoaXMuaXNTcGFjZSkgcmV0dXJuO1xyXG4gICAgdGhpcy5jYWxsYmFjayA9IG51bGw7XHJcbiAgICB0aGlzLmVuZENhbGxiYWNrID0gZjtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIGV2ZW50IG9uIG9wZW4gY2xvc2VcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIG9uT3BlbihmKSB7XHJcbiAgICB0aGlzLm9wZW5DYWxsYmFjayA9IGY7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIG9uQ2xvc2UoZikge1xyXG4gICAgdGhpcy5jbG9zZUNhbGxiYWNrID0gZjtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vICBzZW5kIGJhY2sgdmFsdWVcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIHNlbmQodikge1xyXG4gICAgdiA9IHYgfHwgdGhpcy52YWx1ZTtcclxuICAgIGlmICh2IGluc3RhbmNlb2YgQXJyYXkgJiYgdi5sZW5ndGggPT09IDEpIHYgPSB2WzBdO1xyXG5cclxuICAgIHRoaXMuaXNTZW5kID0gdHJ1ZTtcclxuICAgIGlmICh0aGlzLm9iamVjdExpbmsgIT09IG51bGwpIHRoaXMub2JqZWN0TGlua1t0aGlzLm9iamVjdEtleV0gPSB2O1xyXG4gICAgaWYgKHRoaXMuY2FsbGJhY2spIHRoaXMuY2FsbGJhY2sodiwgdGhpcy5vYmplY3RLZXkpO1xyXG4gICAgdGhpcy5pc1NlbmQgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIHNlbmRFbmQodikge1xyXG4gICAgdiA9IHYgfHwgdGhpcy52YWx1ZTtcclxuICAgIGlmICh2IGluc3RhbmNlb2YgQXJyYXkgJiYgdi5sZW5ndGggPT09IDEpIHYgPSB2WzBdO1xyXG5cclxuICAgIGlmICh0aGlzLmVuZENhbGxiYWNrKSB0aGlzLmVuZENhbGxiYWNrKHYpO1xyXG4gICAgaWYgKHRoaXMub2JqZWN0TGluayAhPT0gbnVsbCkgdGhpcy5vYmplY3RMaW5rW3RoaXMub2JqZWN0S2V5XSA9IHY7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gY2xlYXIgbm9kZVxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIGlmICh0aGlzLmlzTGlzdGVuKSBSb290cy5yZW1vdmVMaXN0ZW4odGhpcyk7XHJcblxyXG4gICAgVG9vbHMuY2xlYXIodGhpcy5jWzBdKTtcclxuXHJcbiAgICBpZiAodGhpcy50YXJnZXQgIT09IG51bGwpIHtcclxuICAgICAgaWYgKHRoaXMuZ3JvdXAgIT09IG51bGwpIHRoaXMuZ3JvdXAuY2xlYXJPbmUodGhpcyk7XHJcbiAgICAgIGVsc2UgdGhpcy50YXJnZXQucmVtb3ZlQ2hpbGQodGhpcy5jWzBdKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0aGlzLmlzVUkpIHRoaXMubWFpbi5jbGVhck9uZSh0aGlzKTtcclxuICAgICAgZWxzZSBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRoaXMuY1swXSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLmlzVUkpIFJvb3RzLnJlbW92ZSh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmMgPSBudWxsO1xyXG4gICAgdGhpcy5zID0gbnVsbDtcclxuICAgIHRoaXMuY2FsbGJhY2sgPSBudWxsO1xyXG4gICAgdGhpcy50YXJnZXQgPSBudWxsO1xyXG4gICAgdGhpcy5pc0xpc3RlbiA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgY2xlYXIoKSB7fVxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gY2hhbmdlIHNpemVcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGdldFdpZHRoKCkge1xyXG4gICAgbGV0IG53ID0gUm9vdHMuZ2V0V2lkdGgodGhpcyk7XHJcbiAgICBpZiAobncpIHRoaXMudyA9IG53O1xyXG4gIH1cclxuXHJcbiAgc2V0U2l6ZShzeCkge1xyXG4gICAgaWYgKCF0aGlzLmF1dG9XaWR0aCkgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMudyA9IHN4O1xyXG5cclxuICAgIGlmICh0aGlzLnNpbXBsZSkge1xyXG4gICAgICB0aGlzLnNiID0gdGhpcy53IC0gdGhpcy5zYTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxldCBwcCA9IHRoaXMudyAqICh0aGlzLnAgLyAxMDApO1xyXG4gICAgICAvL3RoaXMuc2EgPSBNYXRoLmZsb29yKCBwcCArIDEwIClcclxuICAgICAgLy90aGlzLnNiID0gTWF0aC5mbG9vciggdGhpcy53IC0gcHAgLSAyMCApXHJcbiAgICAgIHRoaXMuc2EgPSBNYXRoLmZsb29yKHBwICsgOCk7XHJcbiAgICAgIHRoaXMuc2IgPSBNYXRoLmZsb29yKHRoaXMudyAtIHBwIC0gMTYpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgclNpemUoKSB7XHJcbiAgICBpZiAoIXRoaXMuYXV0b1dpZHRoKSByZXR1cm47XHJcbiAgICBpZiAoIXRoaXMuaXNVSSkgdGhpcy5zWzBdLndpZHRoID0gdGhpcy53ICsgXCJweFwiO1xyXG4gICAgaWYgKCF0aGlzLnNpbXBsZSkgdGhpcy5zWzFdLndpZHRoID0gdGhpcy5zYSArIFwicHhcIjtcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBmb3IgbnVtZXJpYyB2YWx1ZVxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgc2V0VHlwZU51bWJlcihvKSB7XHJcbiAgICB0aGlzLmlzTnVtYmVyID0gdHJ1ZTtcclxuXHJcbiAgICB0aGlzLnZhbHVlID0gMDtcclxuICAgIGlmIChvLnZhbHVlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgaWYgKHR5cGVvZiBvLnZhbHVlID09PSBcInN0cmluZ1wiKSB0aGlzLnZhbHVlID0gby52YWx1ZSAqIDE7XHJcbiAgICAgIGVsc2UgdGhpcy52YWx1ZSA9IG8udmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5taW4gPSBvLm1pbiA9PT0gdW5kZWZpbmVkID8gLUluZmluaXR5IDogby5taW47XHJcbiAgICB0aGlzLm1heCA9IG8ubWF4ID09PSB1bmRlZmluZWQgPyBJbmZpbml0eSA6IG8ubWF4O1xyXG4gICAgdGhpcy5wcmVjaXNpb24gPSBvLnByZWNpc2lvbiA9PT0gdW5kZWZpbmVkID8gMiA6IG8ucHJlY2lzaW9uO1xyXG5cclxuICAgIGxldCBzO1xyXG5cclxuICAgIHN3aXRjaCAodGhpcy5wcmVjaXNpb24pIHtcclxuICAgICAgY2FzZSAwOlxyXG4gICAgICAgIHMgPSAxO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgcyA9IDAuMTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAyOlxyXG4gICAgICAgIHMgPSAwLjAxO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDM6XHJcbiAgICAgICAgcyA9IDAuMDAxO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDQ6XHJcbiAgICAgICAgcyA9IDAuMDAwMTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA1OlxyXG4gICAgICAgIHMgPSAwLjAwMDAxO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDY6XHJcbiAgICAgICAgcyA9IDAuMDAwMDAxO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc3RlcCA9IG8uc3RlcCA9PT0gdW5kZWZpbmVkID8gcyA6IG8uc3RlcDtcclxuICAgIHRoaXMucmFuZ2UgPSB0aGlzLm1heCAtIHRoaXMubWluO1xyXG4gICAgdGhpcy52YWx1ZSA9IHRoaXMubnVtVmFsdWUodGhpcy52YWx1ZSk7XHJcbiAgfVxyXG5cclxuICBudW1WYWx1ZShuKSB7XHJcbiAgICBpZiAodGhpcy5ub05lZykgbiA9IE1hdGguYWJzKG4pO1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgTWF0aC5taW4odGhpcy5tYXgsIE1hdGgubWF4KHRoaXMubWluLCBuKSkudG9GaXhlZCh0aGlzLnByZWNpc2lvbikgKiAxXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vICAgRVZFTlRTIERFRkFVTFRcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGhhbmRsZUV2ZW50KGUpIHtcclxuICAgIGlmICh0aGlzLmxvY2spIHJldHVybjtcclxuICAgIGlmICh0aGlzLm5ldmVybG9jaykgUm9vdHMubG9jayA9IGZhbHNlO1xyXG4gICAgaWYgKCF0aGlzW2UudHlwZV0pXHJcbiAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKGUudHlwZSwgXCJ0aGlzIHR5cGUgb2YgZXZlbnQgbm8gZXhpc3RlICFcIik7XHJcblxyXG4gICAgLy8gVE9ETyAhISEhXHJcblxyXG4gICAgLy9pZiggdGhpcy5tYXJnaW5EaXYgKSB6LmQgLT0gdGhpcy5tYXJnaW4gKiAwLjVcclxuXHJcbiAgICAvL2lmKCB0aGlzLm1hcmdpbkRpdiApIGUuY2xpZW50WSAtPSB0aGlzLm1hcmdpbiAqIDAuNVxyXG4gICAgLy9pZiggdGhpcy5ncm91cCAmJiB0aGlzLmdyb3VwLm1hcmdpbkRpdiApIGUuY2xpZW50WSAtPSB0aGlzLmdyb3VwLm1hcmdpbiAqIDAuNVxyXG5cclxuICAgIHJldHVybiB0aGlzW2UudHlwZV0oZSk7XHJcbiAgfVxyXG5cclxuICB3aGVlbChlKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIG1vdXNlZG93bihlKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIG1vdXNlbW92ZShlKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIG1vdXNldXAoZSkge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBrZXlkb3duKGUpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAga2V5dXAoZSkge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIG9iamVjdCByZWZlcmVuY3lcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIHNldFJlZmVyZW5jeShvYmosIGtleSkge1xyXG4gICAgdGhpcy5vYmplY3RMaW5rID0gb2JqO1xyXG4gICAgdGhpcy5vYmplY3RLZXkgPSBrZXk7XHJcbiAgfVxyXG5cclxuICBkaXNwbGF5KHYgPSBmYWxzZSkge1xyXG4gICAgdGhpcy5zWzBdLnZpc2liaWxpdHkgPSB2ID8gXCJ2aXNpYmxlXCIgOiBcImhpZGRlblwiO1xyXG4gIH1cclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIHJlc2l6ZSBoZWlnaHRcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIG9wZW4oKSB7XHJcbiAgICBpZiAodGhpcy5pc09wZW4pIHJldHVybjtcclxuICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcclxuICAgIFJvb3RzLm5lZWRSZXNpemUgPSB0cnVlO1xyXG4gICAgaWYgKHRoaXMub3BlbkNhbGxiYWNrKSB0aGlzLm9wZW5DYWxsYmFjaygpO1xyXG4gIH1cclxuXHJcbiAgY2xvc2UoKSB7XHJcbiAgICBpZiAoIXRoaXMuaXNPcGVuKSByZXR1cm47XHJcbiAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgUm9vdHMubmVlZFJlc2l6ZSA9IHRydWU7XHJcbiAgICBpZiAodGhpcy5jbG9zZUNhbGxiYWNrKSB0aGlzLmNsb3NlQ2FsbGJhY2soKTtcclxuICB9XHJcblxyXG4gIG5lZWRab25lKCkge1xyXG4gICAgUm9vdHMubmVlZFJlWm9uZSA9IHRydWU7XHJcbiAgfVxyXG5cclxuICByZXpvbmUoKSB7XHJcbiAgICBSb290cy5uZWVkUmVab25lID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyAgSU5QVVRcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIHNlbGVjdCgpIHt9XHJcblxyXG4gIHVuc2VsZWN0KCkge31cclxuXHJcbiAgc2V0SW5wdXQoSW5wdXQpIHtcclxuICAgIFJvb3RzLnNldElucHV0KElucHV0LCB0aGlzKTtcclxuICB9XHJcblxyXG4gIHVwSW5wdXQoeCwgZG93bikge1xyXG4gICAgcmV0dXJuIFJvb3RzLnVwSW5wdXQoeCwgZG93bik7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gc3BlY2lhbCBpdGVtXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBzZWxlY3RlZChiKSB7XHJcbiAgICB0aGlzLmlzU2VsZWN0ID0gYiB8fCBmYWxzZTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBCb29sIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvIClcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnZhbHVlID0gby52YWx1ZSB8fCBmYWxzZVxyXG4gICAgICAgIHRoaXMubW9kZWwgPSBvLm1vZGUgIT09IHVuZGVmaW5lZCA/IG8ubW9kZSA6IDBcclxuXHJcbiAgICAgICAgdGhpcy5vbk5hbWUgPSBvLnJlbmFtZSB8fCB0aGlzLnR4dFxyXG4gICAgICAgIGlmKCBvLm9uTmFtZSApIG8ub25uYW1lID0gby5vbk5hbWVcclxuICAgICAgICBpZiggby5vbm5hbWUgKSB0aGlzLm9uTmFtZSA9IG8ub25uYW1lXHJcblxyXG4gICAgICAgIHRoaXMuaW5oID0gby5pbmggfHwgTWF0aC5mbG9vciggdGhpcy5oKjAuOCApXHJcbiAgICAgICAgdGhpcy5pbncgPSBvLmludyB8fCAzNlxyXG5cclxuICAgICAgICBsZXQgY2MgPSB0aGlzLmNvbG9yc1xyXG4gICAgICAgXHJcbiAgICAgICAgaWYoIHRoaXMubW9kZWwgPT09IDAgKXtcclxuICAgICAgICAgICAgbGV0IHQgPSBNYXRoLmZsb29yKHRoaXMuaCowLjUpLSgodGhpcy5pbmgtMikqMC41KTtcclxuICAgICAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICdiYWNrZ3JvdW5kOicrIGNjLmlucHV0QmcgKyc7IGhlaWdodDonKyh0aGlzLmluaC0yKSsncHg7IHdpZHRoOicrdGhpcy5pbncrJ3B4OyB0b3A6Jyt0KydweDsgYm9yZGVyLXJhZGl1czoxMHB4OyBib3JkZXI6MnB4IHNvbGlkICcrIGNjLmJhY2sgKVxyXG4gICAgICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ2hlaWdodDonKyh0aGlzLmluaC02KSsncHg7IHdpZHRoOjE2cHg7IHRvcDonKyh0KzIpKydweDsgYm9yZGVyLXJhZGl1czoxMHB4OyBiYWNrZ3JvdW5kOicrIGNjLmJ1dHRvbisnOycgKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucCA9IDBcclxuICAgICAgICAgICAgaWYoIHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkICkgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgdGhpcy5jc3MuYnV0dG9uICsgJ3RvcDoxcHg7IGJhY2tncm91bmQ6JytjYy5idXR0b24rJzsgaGVpZ2h0OicrKHRoaXMuaC0yKSsncHg7IGJvcmRlcjonK2NjLmJvcmRlclNpemUrJ3B4IHNvbGlkICcrY2MuYm9yZGVyKyc7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JyApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnN0YXQgPSAtMVxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKVxyXG4gICAgICAgIHRoaXMudXBkYXRlKClcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gIXRoaXMudmFsdWVcclxuICAgICAgICB0aGlzLnVwZGF0ZSggdHJ1ZSApXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlIClcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKVxyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGUoIHRydWUgKVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoKVxyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGUoKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIE1PREVcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb2RlICggb3ZlciApIHtcclxuXHJcbiAgICAgICAgbGV0IGNoYW5nZSA9IGZhbHNlXHJcbiAgICAgICAgbGV0IGNjID0gdGhpcy5jb2xvcnMsIHMgPSB0aGlzLnMsIG4sIHYgPSB0aGlzLnZhbHVlXHJcblxyXG4gICAgICAgIGlmKCBvdmVyICkgbiA9IHYgPyA0IDogM1xyXG4gICAgICAgIGVsc2UgbiA9IHYgPyAyIDogMVxyXG5cclxuICAgICAgICBpZiggdGhpcy5zdGF0ICE9PSBuICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnN0YXQgPSBuXHJcblxyXG4gICAgICAgICAgICBpZiggdGhpcy5tb2RlbCAhPT0gMCApe1xyXG5cclxuICAgICAgICAgICAgICAgIHN3aXRjaCggbiApe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6IHNbMl0uY29sb3IgPSBjYy50ZXh0OyBzWzJdLmJhY2tncm91bmQgPSBjYy5idXR0b247IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjogc1syXS5jb2xvciA9IGNjLnRleHRTZWxlY3Q7IHNbMl0uYmFja2dyb3VuZCA9IGNjLnNlbGVjdDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOiBzWzJdLmNvbG9yID0gY2MudGV4dE92ZXI7IHNbMl0uYmFja2dyb3VuZCA9IGNjLm92ZXJvZmY7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDogc1syXS5jb2xvciA9IGNjLnRleHRPdmVyOyBzWzJdLmJhY2tncm91bmQgPSBjYy5vdmVyOyBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jWzJdLmlubmVySFRNTCA9IHYgPyB0aGlzLm9uTmFtZSA6IHRoaXMubmFtZVxyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2goIG4gKXtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOiBzWzJdLmJhY2tncm91bmQgPSBzWzJdLmJvcmRlckNvbG9yID0gY2MuYmFja29mZjsgc1szXS5iYWNrZ3JvdW5kID0gY2MuYnV0dG9uOyBicmVhazsvLyBvZmYgb3V0XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOiBzWzJdLmJhY2tncm91bmQgPSBzWzJdLmJvcmRlckNvbG9yID0gY2MuYmFjazsgc1szXS5iYWNrZ3JvdW5kID0gY2MudGV4dE92ZXI7IGJyZWFrOy8vIG9uIG92ZXJcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6IHNbMl0uYmFja2dyb3VuZCA9IHNbMl0uYm9yZGVyQ29sb3IgPSBjYy5iYWNrOyBzWzNdLmJhY2tncm91bmQgPSBjYy5vdmVyb2ZmOyBicmVhazsvLyBvZmYgb3ZlclxyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDogc1syXS5iYWNrZ3JvdW5kID0gc1syXS5ib3JkZXJDb2xvciA9IGNjLmJhY2tvZmY7IHNbM10uYmFja2dyb3VuZCA9IGNjLnRleHRTZWxlY3Q7IGJyZWFrOy8vIG9uIG91dFxyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzWzNdLm1hcmdpbkxlZnQgPSB2ID8gJzE3cHgnIDogJzJweCdcclxuICAgICAgICAgICAgICAgIHRoaXMuY1sxXS50ZXh0Q29udGVudCA9IHYgPyB0aGlzLm9uTmFtZSA6IHRoaXMubmFtZVxyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjaGFuZ2VcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHVwZGF0ZSAoIHVwICkge1xyXG5cclxuICAgICAgICB0aGlzLm1vZGUoKVxyXG4gICAgICAgIGlmKCB1cCApIHRoaXMuc2VuZCgpXHJcbiAgICAgICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKVxyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMuc1xyXG4gICAgICAgIGxldCB3ID0gKHRoaXMudyAtIDEwICkgLSB0aGlzLmlud1xyXG4gICAgICAgIGlmKCB0aGlzLm1vZGVsID09PSAwICl7XHJcbiAgICAgICAgICAgIHNbMl0ubGVmdCA9IHcgKyAncHgnXHJcbiAgICAgICAgICAgIHNbM10ubGVmdCA9IHcgKyAncHgnXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc1syXS5sZWZ0ID0gdGhpcy5zYSArICdweCdcclxuICAgICAgICAgICAgc1syXS53aWR0aCA9IHRoaXMuc2IgICsgJ3B4J1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8uanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJ1dHRvbiBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApXHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSAnJztcclxuICAgICAgICBpZiggby52YWx1ZSAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZSA9IG8udmFsdWVcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBvLnZhbHVlIHx8IHRoaXMudHh0XHJcbiAgICAgICAgaWYoIG8udmFsdWVzICkgdGhpcy52YWx1ZXMgPSBvLnZhbHVlc1xyXG5cclxuICAgICAgICBpZiggIW8udmFsdWVzICYmICFvLnZhbHVlICkgdGhpcy50eHQgPSAnJ1xyXG5cclxuICAgICAgICB0aGlzLm9uTmFtZSA9IG8ub25OYW1lIHx8IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMub24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gZm9yY2UgYnV0dG9uIHdpZHRoXHJcbiAgICAgICAgdGhpcy5idyA9IG8uZm9yY2VXaWR0aCB8fCAwXHJcbiAgICAgICAgaWYoby5idykgdGhpcy5idyA9IG8uYndcclxuICAgICAgICB0aGlzLnNwYWNlID0gby5zcGFjZSB8fCAzXHJcblxyXG4gICAgICAgIGlmKCB0eXBlb2YgdGhpcy52YWx1ZXMgPT09ICdzdHJpbmcnICkgdGhpcy52YWx1ZXMgPSBbIHRoaXMudmFsdWVzIF1cclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZVxyXG4gICAgICAgIHRoaXMubmV2ZXJsb2NrID0gdHJ1ZVxyXG4gICAgICAgIHRoaXMucmVzID0gMFxyXG5cclxuICAgICAgICB0aGlzLmxuZyA9IHRoaXMudmFsdWVzLmxlbmd0aFxyXG4gICAgICAgIHRoaXMudG1wID0gW11cclxuICAgICAgICB0aGlzLnN0YXQgPSBbXVxyXG5cclxuICAgICAgICBsZXQgc2VsLCBjYyA9IHRoaXMuY29sb3JzO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIHNlbCA9IGZhbHNlXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLnZhbHVlc1tpXSA9PT0gdGhpcy52YWx1ZSAmJiB0aGlzLmlzU2VsZWN0YWJsZSApIHNlbCA9IHRydWVcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1tpKzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyB0aGlzLmNzcy5idXR0b24gKyAndG9wOjFweDsgaGVpZ2h0OicrKHRoaXMuaC0yKSsncHg7IGJvcmRlcjonK2NjLmJvcmRlclNpemUrJ3B4IHNvbGlkICcrY2MuYm9yZGVyKyc7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JyApXHJcbiAgICAgICAgICAgIHRoaXMuY1tpKzJdLnN0eWxlLmJhY2tncm91bmQgPSBzZWwgPyBjYy5zZWxlY3QgOiBjYy5idXR0b25cclxuICAgICAgICAgICAgdGhpcy5jW2krMl0uc3R5bGUuY29sb3IgPSBzZWwgPyBjYy50ZXh0U2VsZWN0IDogY2MudGV4dFxyXG4gICAgICAgICAgICB0aGlzLmNbaSsyXS5pbm5lckhUTUwgPSB0aGlzLnZhbHVlc1tpXTtcclxuICAgICAgICAgICAgdGhpcy5zdGF0W2ldID0gc2VsID8gMzoxO1xyXG5cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBpZiggdGhpcy50eHQ9PT0nJyApIHRoaXMucCA9IDAgXHJcblxyXG4gICAgICAgIGlmKCAoIW8udmFsdWUgJiYgIW8udmFsdWVzKSB8fCB0aGlzLnAgPT09IDAgKXtcclxuICAgICAgICAgICAgaWYoIHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkICkgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gJydcclxuICAgICAgICB9IFxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgb25PZmYoKSB7XHJcblxyXG4gICAgICAgIHRoaXMub24gPSAhdGhpcy5vbjtcclxuICAgICAgICB0aGlzLmxhYmVsKCB0aGlzLm9uID8gdGhpcy5vbk5hbWUgOiB0aGlzLnZhbHVlIClcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICB0ZXN0Wm9uZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuIC0xXHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmdcclxuICAgICAgICBsZXQgdCA9IHRoaXMudG1wXHJcbiAgICAgICAgXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgIFx0aWYoIGwueD50W2ldWzBdICYmIGwueDx0W2ldWzJdICkgcmV0dXJuIGlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAtMVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNEb3duICkgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2VcclxuICAgICAgICBpZiggdGhpcy5yZXMgIT09IC0xICl7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLnZhbHVlID09PSB0aGlzLnZhbHVlc1t0aGlzLnJlc10gJiYgdGhpcy51bnNlbGVjdGFibGUgKSB0aGlzLnZhbHVlID0gJydcclxuICAgICAgICAgICAgZWxzZSB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZXNbdGhpcy5yZXNdXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLm9uTmFtZSAhPT0gbnVsbCApIHRoaXMub25PZmYoKVxyXG4gICAgICAgICAgICB0aGlzLnNlbmQoKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlIClcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICkgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlXHJcbiAgICBcdHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApXHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCB1cCA9IGZhbHNlXHJcbiAgICAgICAgdGhpcy5yZXMgPSB0aGlzLnRlc3Rab25lKCBlIClcclxuXHJcbiAgICAgICAgaWYoIHRoaXMucmVzICE9PSAtMSApe1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpXHJcbiAgICAgICAgICAgIHVwID0gdGhpcy5tb2RlcyggdGhpcy5pc0Rvd24gPyAzIDogMiwgdGhpcy5yZXMgKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgXHR1cCA9IHRoaXMucmVzZXQoKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHVwXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb2RlcyAoIE4gPSAxLCBpZCA9IC0xICkge1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMubG5nLCB3LCBuLCByID0gZmFsc2VcclxuXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG5cclxuICAgICAgICAgICAgbiA9IE5cclxuICAgICAgICAgICAgdyA9IHRoaXMuaXNTZWxlY3RhYmxlID8gdGhpcy52YWx1ZXNbIGkgXSA9PT0gdGhpcy52YWx1ZSA6IGZhbHNlXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiggaSA9PT0gaWQgKXtcclxuICAgICAgICAgICAgICAgIGlmKCB3ICYmIG4gPT09IDIgKSBuID0gMyBcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG4gPSAxXHJcbiAgICAgICAgICAgICAgICBpZiggdyApIG4gPSA0XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vaWYoIHRoaXMubW9kZSggbiwgaSApICkgciA9IHRydWVcclxuICAgICAgICAgICAgciA9IHRoaXMubW9kZSggbiwgaSApXHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZSAoIG4sIGlkICkge1xyXG5cclxuICAgICAgICAvL2lmKCF0aGlzLnMpIHJldHVybiBmYWxzZVxyXG4gXHJcbiAgICAgICAgbGV0IGNoYW5nZSA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBjYyA9IHRoaXMuY29sb3JzLCBzID0gdGhpcy5zXHJcbiAgICAgICAgbGV0IGkgPSBpZCsyXHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnN0YXRbaWRdICE9PSBuICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnN0YXRbaWRdID0gbjtcclxuICAgICAgICBcclxuICAgICAgICAgICAgc3dpdGNoKCBuICl7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAxOiBzW2ldLmNvbG9yID0gY2MudGV4dDsgc1tpXS5iYWNrZ3JvdW5kID0gY2MuYnV0dG9uOyBicmVha1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyOiBzW2ldLmNvbG9yID0gY2MudGV4dE92ZXI7IHNbaV0uYmFja2dyb3VuZCA9IGNjLm92ZXJvZmY7IGJyZWFrXHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6IHNbaV0uY29sb3IgPSBjYy50ZXh0T3Zlcjsgc1tpXS5iYWNrZ3JvdW5kID0gY2Mub3ZlcjsgYnJlYWtcclxuICAgICAgICAgICAgICAgIGNhc2UgNDogc1tpXS5jb2xvciA9IGNjLnRleHRTZWxlY3Q7IHNbaV0uYmFja2dyb3VuZCA9IGNjLnNlbGVjdDsgYnJlYWtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLnJlcyA9IC0xXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoKVxyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGVzKClcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbGFiZWwgKCBzdHJpbmcsIG4gKSB7XHJcblxyXG4gICAgICAgIG4gPSBuIHx8IDI7XHJcbiAgICAgICAgdGhpcy5jW25dLnRleHRDb250ZW50ID0gc3RyaW5nXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHN3aXRjaFZhbHVlcyggbiwgc3RyaW5nICl7XHJcbiAgICAgICAgdGhpcy5jW24rMl0uaW5uZXJIVE1MID0gdGhpcy52YWx1ZXNbbl0gPSBzdHJpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgaWNvbiAoIHN0cmluZywgeSA9IDAsIG4gPSAyICkge1xyXG5cclxuICAgICAgICAvL2lmKHkpIHRoaXMuc1tuXS5tYXJnaW4gPSAoIHkgKSArJ3B4IDBweCc7XHJcbiAgICAgICAgdGhpcy5zW25dLnBhZGRpbmcgPSAoIHkgKSArJ3B4IDBweCc7XHJcbiAgICAgICAgdGhpcy5jW25dLmlubmVySFRNTCA9IHN0cmluZztcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBsZXQgdyA9IHRoaXMuc2I7XHJcbiAgICAgICAgbGV0IGQgPSB0aGlzLnNhO1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMubG5nO1xyXG4gICAgICAgIGxldCBzeCA9IHRoaXMuY29sb3JzLnN4IC8vdGhpcy5zcGFjZTtcclxuICAgICAgICAvL2xldCBzaXplID0gTWF0aC5mbG9vciggKCB3LShkYyooaS0xKSkgKSAvIGkgKTtcclxuICAgICAgICBsZXQgc2l6ZSA9ICggdy0oc3gqKGktMSkpICkgLyBpIFxyXG5cclxuICAgICAgICBpZiggdGhpcy5idyApeyBcclxuICAgICAgICAgICAgc2l6ZSA9IHRoaXMuYncgPCBzaXplID8gdGhpcy5idyA6IHNpemVcclxuICAgICAgICAgICAgLy9kID0gTWF0aC5mbG9vcigodGhpcy53LSggKHNpemUgKiBpKSArIChkYyAqIChpLTEpKSApKSowLjUpXHJcbiAgICAgICAgICAgIGQgPSAoKHRoaXMudy0oIChzaXplICogaSkgKyAoc3ggKiAoaS0xKSkgKSkqMC41KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG5cclxuICAgICAgICBcdC8vdGhpcy50bXBbaV0gPSBbIE1hdGguZmxvb3IoIGQgKyAoIHNpemUgKiBpICkgKyAoIGRjICogaSApKSwgc2l6ZSBdO1xyXG4gICAgICAgICAgICB0aGlzLnRtcFtpXSA9IFsgKCBkICsgKCBzaXplICogaSApICsgKCBzeCAqIGkgKSksIHNpemUgXTtcclxuICAgICAgICBcdHRoaXMudG1wW2ldWzJdID0gdGhpcy50bXBbaV1bMF0gKyB0aGlzLnRtcFtpXVsxXTtcclxuXHJcbiAgICAgICAgICAgIHNbaSsyXS5sZWZ0ID0gdGhpcy50bXBbaV1bMF0gKyAncHgnXHJcbiAgICAgICAgICAgIHNbaSsyXS53aWR0aCA9IHRoaXMudG1wW2ldWzFdICsgJ3B4J1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90by5qcyc7XHJcbmltcG9ydCB7IFRvb2xzIH0gZnJvbSAnLi4vY29yZS9Ub29scy5qcyc7XHJcbmltcG9ydCB7IFYyIH0gZnJvbSAnLi4vY29yZS9WMi5qcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgQ2lyY3VsYXIgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKVxyXG5cclxuICAgICAgICB0aGlzLmlzQ3ljbGljID0gby5jeWNsaWMgfHwgZmFsc2VcclxuICAgICAgICB0aGlzLm1vZGVsID0gby5zdHlwZSB8fCAwXHJcbiAgICAgICAgaWYoIG8ubW9kZSAhPT0gdW5kZWZpbmVkICkgdGhpcy5tb2RlbCA9IG8ubW9kZVxyXG5cclxuICAgICAgICB0aGlzLmF1dG9XaWR0aCA9IGZhbHNlXHJcbiAgICAgICAgdGhpcy5taW53ID0gdGhpcy53XHJcbiAgICAgICAgdGhpcy5kaWFtID0gby5kaWFtIHx8IHRoaXMudyBcclxuXHJcbiAgICAgICAgdGhpcy5zZXRUeXBlTnVtYmVyKCBvIClcclxuXHJcbiAgICAgICAgdGhpcy50d29QaSA9IFRvb2xzLlR3b1BJXHJcbiAgICAgICAgdGhpcy5waTkwID0gVG9vbHMucGk5MFxyXG5cclxuICAgICAgICB0aGlzLm9mZnNldCA9IG5ldyBWMigpXHJcblxyXG4gICAgICAgIHRoaXMuaCA9IG8uaCB8fCB0aGlzLncgKyAxMFxyXG5cclxuICAgICAgICB0aGlzLmNbMF0uc3R5bGUud2lkdGggPSB0aGlzLncgKydweCdcclxuICAgICAgICB0aGlzLmNbMF0uc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuXHJcbiAgICAgICAgaWYodGhpcy5jWzFdICE9PSB1bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS5zdHlsZS53aWR0aCA9ICcxMDAlJ1xyXG4gICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUuanVzdGlmeUNvbnRlbnQgPSAnY2VudGVyJ1xyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IDEwXHJcbiAgICAgICAgICAgIHRoaXMuaCArPSAxMFxyXG5cclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5wZXJjZW50ID0gMFxyXG4gICAgICAgIHRoaXMuY21vZGUgPSAwXHJcbiAgICAgICAgbGV0IGNjID0gdGhpcy5jb2xvcnNcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAnanVzdGlmeS1jb250ZW50OmNlbnRlcjsgdG9wOicrKHRoaXMuaC0yMCkrJ3B4OyB3aWR0aDoxMDAlOyBjb2xvcjonKyBjYy50ZXh0IClcclxuXHJcbiAgICAgICAgLy8gc3ZnXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5nZXRDaXJjdWxhcigpXHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCBjYy5iYWNrLCAwIClcclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsIHRoaXMubWFrZVBhdGgoKSwgMSApXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIGNjLnRleHQsIDEgKVxyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAndmlld0JveCcsICcwIDAgJyt0aGlzLmRpYW0rJyAnK3RoaXMuZGlhbSApXHJcbiAgICAgICAgdGhpcy5zZXRDc3MoIHRoaXMuY1szXSwgeyB3aWR0aDp0aGlzLmRpYW0sIGhlaWdodDp0aGlzLmRpYW0sIGxlZnQ6MCwgdG9wOnRoaXMudG9wIH0pXHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpXHJcbiAgICAgICAgdGhpcy51cGRhdGUoKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb2RlICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY21vZGUgPT09IG1vZGUgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBjYyA9IHRoaXMuY29sb3JzXHJcbiAgICAgICAgbGV0IGNvbG9yXHJcblxyXG4gICAgICAgIHN3aXRjaCggbW9kZSApe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNbMl0uY29sb3IgPSBjYy50ZXh0O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIGNjLmJhY2ssIDApO1xyXG4gICAgICAgICAgICAgICAgY29sb3IgPSB0aGlzLm1vZGVsID4gMCA/IFRvb2xzLnBhY2soIFRvb2xzLmxlcnBDb2xvciggVG9vbHMudW5wYWNrKCBUb29scy5Db2xvckx1bWEoIGNjLnRleHQsIC0wLjc1KSApLCBUb29scy51bnBhY2soIGNjLnRleHQgKSwgdGhpcy5wZXJjZW50ICkgKSA6IGNjLnRleHQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgY29sb3IsIDEgKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBkb3duXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5zWzJdLmNvbG9yID0gY2MudGV4dE92ZXI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgY2MuYmFja29mZiwgMCk7XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IHRoaXMubW9kZWwgPiAwID8gVG9vbHMucGFjayggVG9vbHMubGVycENvbG9yKCBUb29scy51bnBhY2soIFRvb2xzLkNvbG9yTHVtYSggY2MudGV4dCwgLTAuNzUpICksIFRvb2xzLnVucGFjayggY2MudGV4dCApLCB0aGlzLnBlcmNlbnQgKSApIDogY2MudGV4dE92ZXJcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCBjb2xvciwgMSApO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jbW9kZSA9IG1vZGU7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICB0ZXN0Wm9uZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCBsLnkgPD0gdGhpcy5jWyAxIF0ub2Zmc2V0SGVpZ2h0ICkgcmV0dXJuICd0aXRsZSc7XHJcbiAgICAgICAgZWxzZSBpZiAoIGwueSA+IHRoaXMuaCAtIHRoaXMuY1sgMiBdLm9mZnNldEhlaWdodCApIHJldHVybiAndGV4dCc7XHJcbiAgICAgICAgZWxzZSByZXR1cm4gJ2NpcmN1bGFyJztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNlbmRFbmQoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlKDApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5vbGQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIHRoaXMub2xkciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNEb3duICkgcmV0dXJuO1xyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKCdvdmVyJylcclxuXHJcbiAgICAgICAgbGV0IG9mZiA9IHRoaXMub2Zmc2V0O1xyXG4gICAgICAgIG9mZi54ID0gKHRoaXMudyowLjUpIC0gKCBlLmNsaWVudFggLSB0aGlzLnpvbmUueCApO1xyXG4gICAgICAgIG9mZi55ID0gKHRoaXMuZGlhbSowLjUpIC0gKCBlLmNsaWVudFkgLSB0aGlzLnpvbmUueSAtIHRoaXMueXRvcCApO1xyXG5cclxuICAgICAgICB0aGlzLnIgPSBvZmYuYW5nbGUoKSAtIHRoaXMucGk5MDtcclxuICAgICAgICB0aGlzLnIgPSAoKCh0aGlzLnIldGhpcy50d29QaSkrdGhpcy50d29QaSkldGhpcy50d29QaSk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLm9sZHIgIT09IG51bGwgKXsgXHJcblxyXG4gICAgICAgICAgICBsZXQgZGlmID0gdGhpcy5yIC0gdGhpcy5vbGRyO1xyXG4gICAgICAgICAgICB0aGlzLnIgPSBNYXRoLmFicyhkaWYpID4gTWF0aC5QSSA/IHRoaXMub2xkciA6IHRoaXMucjtcclxuXHJcbiAgICAgICAgICAgIGlmKCBkaWYgPiA2ICkgdGhpcy5yID0gMDtcclxuICAgICAgICAgICAgaWYoIGRpZiA8IC02ICkgdGhpcy5yID0gdGhpcy50d29QaTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgc3RlcHMgPSAxIC8gdGhpcy50d29QaTtcclxuICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLnIgKiBzdGVwcztcclxuXHJcbiAgICAgICAgbGV0IG4gPSAoICggdGhpcy5yYW5nZSAqIHZhbHVlICkgKyB0aGlzLm1pbiApIC0gdGhpcy5vbGQ7XHJcblxyXG4gICAgICAgIGlmKG4gPj0gdGhpcy5zdGVwIHx8IG4gPD0gdGhpcy5zdGVwKXsgXHJcbiAgICAgICAgICAgIG4gPSB+fiAoIG4gLyB0aGlzLnN0ZXAgKTtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubnVtVmFsdWUoIHRoaXMub2xkICsgKCBuICogdGhpcy5zdGVwICkgKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUoIHRydWUgKTtcclxuICAgICAgICAgICAgdGhpcy5vbGQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLm9sZHIgPSB0aGlzLnI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICB3aGVlbCAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggbmFtZSA9PT0gJ2NpcmN1bGFyJyApIHtcclxuICAgIFxyXG4gICAgICAgICAgICBsZXQgdiA9IHRoaXMudmFsdWUgLSB0aGlzLnN0ZXAgKiBlLmRlbHRhO1xyXG4gICAgXHJcbiAgICAgICAgICAgIGlmICggdiA+IHRoaXMubWF4ICkge1xyXG4gICAgICAgICAgICAgICAgdiA9IHRoaXMuaXNDeWNsaWMgPyB0aGlzLm1pbiA6IHRoaXMubWF4O1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCB2IDwgdGhpcy5taW4gKSB7XHJcbiAgICAgICAgICAgICAgICB2ID0gdGhpcy5pc0N5Y2xpYyA/IHRoaXMubWF4IDogdGhpcy5taW47XHJcbiAgICAgICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgICAgICB0aGlzLnNldFZhbHVlKCB2ICk7XHJcbiAgICAgICAgICAgIHRoaXMub2xkID0gdjtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUoIHRydWUgKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1ha2VQYXRoICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHIgPSA0MDtcclxuICAgICAgICBsZXQgZCA9IDI0O1xyXG4gICAgICAgIGxldCBhID0gdGhpcy5wZXJjZW50ICogdGhpcy50d29QaSAtIDAuMDAxO1xyXG4gICAgICAgIGxldCB4MiA9IChyICsgciAqIE1hdGguc2luKGEpKSArIGQ7XHJcbiAgICAgICAgbGV0IHkyID0gKHIgLSByICogTWF0aC5jb3MoYSkpICsgZDtcclxuICAgICAgICBsZXQgYmlnID0gYSA+IE1hdGguUEkgPyAxIDogMDtcclxuICAgICAgICByZXR1cm4gXCJNIFwiICsgKHIrZCkgKyBcIixcIiArIGQgKyBcIiBBIFwiICsgciArIFwiLFwiICsgciArIFwiIDAgXCIgKyBiaWcgKyBcIiAxIFwiICsgeDIgKyBcIixcIiArIHkyO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCB1cCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuICAgICAgICB0aGlzLnBlcmNlbnQgPSAoIHRoaXMudmFsdWUgLSB0aGlzLm1pbiApIC8gdGhpcy5yYW5nZTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2QnLCB0aGlzLm1ha2VQYXRoKCksIDEgKTtcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLm1vZGVsID4gMCApIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBjYyA9IHRoaXMuY29sb3JzXHJcbiAgICAgICAgICAgIGxldCBjb2xvciA9IFRvb2xzLnBhY2soIFRvb2xzLmxlcnBDb2xvciggVG9vbHMudW5wYWNrKCBUb29scy5Db2xvckx1bWEoIGNjLnRleHQsIC0wLjc1KSApLCBUb29scy51bnBhY2soIGNjLnRleHQgKSwgdGhpcy5wZXJjZW50ICkgKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIGNvbG9yLCAxICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdXAgKSB0aGlzLnNlbmQoKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBUb29scyB9IGZyb20gJy4uL2NvcmUvVG9vbHMuanMnO1xyXG5pbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8uanMnO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gJy4uL2NvcmUvVjIuanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIENvbG9yIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG5cdCAgICAvL3RoaXMuYXV0b0hlaWdodCA9IHRydWU7XHJcblxyXG5cdCAgICB0aGlzLmN0eXBlID0gby5jdHlwZSB8fCAnaGV4JztcclxuXHJcblx0ICAgIHRoaXMud2ZpeGUgPSAyNTY7XHJcblxyXG5cdCAgICB0aGlzLmN3ID0gdGhpcy5zYiA+IDI1NiA/IDI1NiA6IHRoaXMuc2I7XHJcblx0ICAgIGlmKG8uY3cgIT0gdW5kZWZpbmVkICkgdGhpcy5jdyA9IG8uY3c7XHJcblxyXG5cclxuXHJcblx0ICAgIC8vIGNvbG9yIHVwIG9yIGRvd25cclxuXHQgICAgdGhpcy5zaWRlID0gby5zaWRlIHx8ICdkb3duJztcclxuXHQgICAgdGhpcy51cCA9IHRoaXMuc2lkZSA9PT0gJ2Rvd24nID8gMCA6IDE7XHJcblx0ICAgIFxyXG5cdCAgICB0aGlzLmJhc2VIID0gdGhpcy5oO1xyXG5cclxuXHQgICAgdGhpcy5vZmZzZXQgPSBuZXcgVjIoKTtcclxuXHQgICAgdGhpcy5kZWNhbCA9IG5ldyBWMigpO1xyXG5cdCAgICB0aGlzLnBwID0gbmV3IFYyKCk7XHJcblxyXG5cdCAgICBsZXQgY2MgPSB0aGlzLmNvbG9yc1xyXG5cclxuXHQgICAvLyB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArIHRoaXMuY3NzLm1pZGRsZSArICd0b3A6MXB4OyBoZWlnaHQ6JysodGhpcy5oLTIpKydweDsnICsgJ2JvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7IHRleHQtc2hhZG93Om5vbmU7IGJvcmRlcjonK2NjLmJvcmRlclNpemUrJ3B4IHNvbGlkICcrY2MuYm9yZGVyKyc7JyApXHJcblxyXG5cdCAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIGAke3RoaXMuY3NzLnR4dH0gJHt0aGlzLmNzcy5taWRkbGV9IHRvcDoxcHg7IGhlaWdodDoke3RoaXMuaC0yfXB4OyBib3JkZXItcmFkaXVzOiR7dGhpcy5yYWRpdXN9cHg7IHRleHQtc2hhZG93Om5vbmU7IGJvcmRlcjoke2NjLmJvcmRlclNpemV9cHggc29saWQgJHtjYy5ib3JkZXJ9O2AgKVxyXG5cdCAgICAvL3RoaXMuc1syXSA9IHRoaXMuY1syXS5zdHlsZTtcclxuXHJcblx0ICAgIC8vdGhpcy5zWzJdLnRleHRTaGFkb3cgPSAnbm9uZSdcclxuXHJcblx0ICAgIC8qaWYoIHRoaXMudXAgKXtcclxuXHQgICAgICAgIHRoaXMuc1syXS50b3AgPSAnYXV0byc7XHJcblx0ICAgICAgICB0aGlzLnNbMl0uYm90dG9tID0gJzJweCc7XHJcblx0ICAgIH0qL1xyXG5cclxuXHQgICAgLy90aGlzLmNbMF0uc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcblx0ICAgIHRoaXMuY1swXS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG5cclxuXHQgICAgdGhpcy5jWzNdID0gdGhpcy5nZXRDb2xvclJpbmcoKVxyXG5cdCAgICB0aGlzLmNbM10uc3R5bGUudmlzaWJpbGl0eSAgPSAnaGlkZGVuJ1xyXG5cclxuXHQgICAgdGhpcy5oc2wgPSBudWxsXHJcblx0ICAgIHRoaXMudmFsdWUgPSAnI2ZmZmZmZidcclxuXHQgICAgaWYoIG8udmFsdWUgIT09IHVuZGVmaW5lZCApe1xyXG5cdCAgICAgICAgaWYoIG8udmFsdWUgaW5zdGFuY2VvZiBBcnJheSApIHRoaXMudmFsdWUgPSBUb29scy5yZ2JUb0hleCggby52YWx1ZSApXHJcblx0ICAgICAgICBlbHNlIGlmKCFpc05hTihvLnZhbHVlKSkgdGhpcy52YWx1ZSA9IFRvb2xzLmhleFRvSHRtbCggby52YWx1ZSApXHJcblx0ICAgICAgICBlbHNlIHRoaXMudmFsdWUgPSBvLnZhbHVlXHJcblx0ICAgIH1cclxuXHJcblx0ICAgIHRoaXMuYmNvbG9yID0gbnVsbFxyXG5cdCAgICB0aGlzLmlzRG93biA9IGZhbHNlXHJcblx0ICAgIHRoaXMuZmlzdERvd24gPSBmYWxzZVxyXG5cclxuXHQgICAgdGhpcy5ub3RleHQgPSBvLm5vdGV4dCB8fCBmYWxzZVxyXG5cclxuXHQgICAgdGhpcy50ciA9IDk4XHJcblx0ICAgIHRoaXMudHNsID0gTWF0aC5zcXJ0KDMpICogdGhpcy50clxyXG5cclxuXHQgICAgdGhpcy5odWUgPSAwXHJcblx0ICAgIHRoaXMuZCA9IDI1NlxyXG5cclxuXHQgICAgdGhpcy5pbml0KClcclxuXHJcblx0ICAgIHRoaXMuc2V0Q29sb3IoIHRoaXMudmFsdWUgKVxyXG5cclxuXHQgICAgaWYoIG8ub3BlbiAhPT0gdW5kZWZpbmVkICkgdGhpcy5vcGVuKClcclxuXHJcblx0fVxyXG5cclxuXHR0ZXN0Wm9uZSAoIG14LCBteSApIHtcclxuXHJcblx0XHRsZXQgbCA9IHRoaXMubG9jYWxcclxuXHRcdGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJydcclxuXHJcblx0XHRpZiggdGhpcy51cCAmJiB0aGlzLmlzT3BlbiApe1xyXG5cclxuXHRcdFx0aWYoIGwueSA+IHRoaXMud2ZpeGUgKSByZXR1cm4gJ3RpdGxlJ1xyXG5cdFx0ICAgIGVsc2UgcmV0dXJuICdjb2xvcidcclxuXHJcblx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0aWYoIGwueSA8IHRoaXMuYmFzZUgrMiApIHJldHVybiAndGl0bGUnXHJcblx0ICAgIFx0ZWxzZSBpZiggdGhpcy5pc09wZW4gKSByZXR1cm4gJ2NvbG9yJ1xyXG5cclxuXHRcdH1cclxuXHJcbiAgICB9XHJcblxyXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cdG1vdXNldXAgKCBlICkge1xyXG5cclxuXHQgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHQgICAgdGhpcy5kID0gMjU2O1xyXG5cclxuXHR9XHJcblxyXG5cdG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG5cclxuXHRcdGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZS5jbGllbnRYLCBlLmNsaWVudFkgKTtcclxuXHJcblxyXG5cdFx0Ly9pZiggIW5hbWUgKSByZXR1cm47XHJcblx0XHRpZihuYW1lID09PSAndGl0bGUnKXtcclxuXHRcdFx0aWYoICF0aGlzLmlzT3BlbiApIHRoaXMub3BlbigpO1xyXG5cdCAgICAgICAgZWxzZSB0aGlzLmNsb3NlKCk7XHJcblx0ICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0aWYoIG5hbWUgPT09ICdjb2xvcicgKXtcclxuXHJcblx0XHRcdHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy5maXN0RG93biA9IHRydWVcclxuXHRcdFx0dGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG5cdCAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUuY2xpZW50WCwgZS5jbGllbnRZICk7XHJcblxyXG5cdCAgICBsZXQgb2ZmLCBkLCBodWUsIHNhdCwgbHVtLCByYWQsIHgsIHksIHJyLCBUID0gVG9vbHM7XHJcblxyXG5cdCAgICBpZiggbmFtZSA9PT0gJ3RpdGxlJyApIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcblxyXG5cdCAgICBpZiggbmFtZSA9PT0gJ2NvbG9yJyApe1xyXG5cclxuXHQgICAgXHRvZmYgPSB0aGlzLm9mZnNldDtcclxuXHRcdCAgICBvZmYueCA9IGUuY2xpZW50WCAtICggdGhpcy56b25lLnggKyB0aGlzLmRlY2FsLnggKyB0aGlzLm1pZCApO1xyXG5cdFx0ICAgIG9mZi55ID0gZS5jbGllbnRZIC0gKCB0aGlzLnpvbmUueSArIHRoaXMuZGVjYWwueSArIHRoaXMubWlkICkgLSB0aGlzLnl0b3A7XHJcblx0XHRcdGQgPSBvZmYubGVuZ3RoKCkgKiB0aGlzLnJhdGlvO1xyXG5cdFx0XHRyciA9IG9mZi5hbmdsZSgpO1xyXG5cdFx0XHRpZihyciA8IDApIHJyICs9IDIgKiBULlBJO1xyXG5cdFx0XHRcdFx0XHRcclxuXHJcblx0ICAgIFx0aWYgKCBkIDwgMTI4ICkgdGhpcy5jdXJzb3IoJ2Nyb3NzaGFpcicpO1xyXG5cdCAgICBcdGVsc2UgaWYoICF0aGlzLmlzRG93biApIHRoaXMuY3Vyc29yKClcclxuXHJcblx0ICAgIFx0aWYoIHRoaXMuaXNEb3duICl7XHJcblxyXG5cdFx0XHQgICAgaWYoIHRoaXMuZmlzdERvd24gKXtcclxuXHRcdFx0ICAgIFx0dGhpcy5kID0gZDtcclxuXHRcdFx0ICAgIFx0dGhpcy5maXN0RG93biA9IGZhbHNlO1xyXG5cdFx0XHQgICAgfVxyXG5cclxuXHRcdFx0ICAgIGlmICggdGhpcy5kIDwgMTI4ICkge1xyXG5cclxuXHRcdFx0XHQgICAgaWYgKCB0aGlzLmQgPiB0aGlzLnRyICkgeyAvLyBvdXRzaWRlIGh1ZVxyXG5cclxuXHRcdFx0XHQgICAgICAgIGh1ZSA9ICggcnIgKyBULnBpOTAgKSAvIFQuVHdvUEk7XHJcblx0XHRcdFx0ICAgICAgICB0aGlzLmh1ZSA9IChodWUgKyAxKSAlIDE7XHJcblx0XHRcdFx0ICAgICAgICB0aGlzLnNldEhTTChbKGh1ZSArIDEpICUgMSwgdGhpcy5oc2xbMV0sIHRoaXMuaHNsWzJdXSk7XHJcblxyXG5cdFx0XHRcdCAgICB9IGVsc2UgeyAvLyB0cmlhbmdsZVxyXG5cclxuXHRcdFx0XHQgICAgXHR4ID0gb2ZmLnggKiB0aGlzLnJhdGlvO1xyXG5cdFx0XHRcdCAgICBcdHkgPSBvZmYueSAqIHRoaXMucmF0aW87XHJcblxyXG5cdFx0XHRcdCAgICBcdGxldCByciA9ICh0aGlzLmh1ZSAqIFQuVHdvUEkpICsgVC5QSTtcclxuXHRcdFx0XHQgICAgXHRpZihyciA8IDApIHJyICs9IDIgKiBULlBJO1xyXG5cclxuXHRcdFx0XHQgICAgXHRyYWQgPSBNYXRoLmF0YW4yKC15LCB4KTtcclxuXHRcdFx0XHQgICAgXHRpZihyYWQgPCAwKSByYWQgKz0gMiAqIFQuUEk7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdCAgICBcdGxldCByYWQwID0gKCByYWQgKyBULnBpOTAgKyBULlR3b1BJICsgcnIgKSAlIChULlR3b1BJKSxcclxuXHRcdFx0XHQgICAgXHRyYWQxID0gcmFkMCAlICgoMi8zKSAqIFQuUEkpIC0gKFQucGk2MCksXHJcblx0XHRcdFx0ICAgIFx0YSAgICA9IDAuNSAqIHRoaXMudHIsXHJcblx0XHRcdFx0ICAgIFx0YiAgICA9IE1hdGgudGFuKHJhZDEpICogYSxcclxuXHRcdFx0XHQgICAgXHRyICAgID0gTWF0aC5zcXJ0KHgqeCArIHkqeSksXHJcblx0XHRcdFx0ICAgIFx0bWF4UiA9IE1hdGguc3FydChhKmEgKyBiKmIpO1xyXG5cclxuXHRcdFx0XHQgICAgXHRpZiggciA+IG1heFIgKSB7XHJcblx0XHRcdFx0XHRcdFx0bGV0IGR4ID0gTWF0aC50YW4ocmFkMSkgKiByO1xyXG5cdFx0XHRcdFx0XHRcdGxldCByYWQyID0gTWF0aC5hdGFuKGR4IC8gbWF4Uik7XHJcblx0XHRcdFx0XHRcdFx0aWYocmFkMiA+IFQucGk2MCkgIHJhZDIgPSBULnBpNjA7XHJcblx0XHRcdFx0XHRcdCAgICBlbHNlIGlmKCByYWQyIDwgLVQucGk2MCApIHJhZDIgPSAtVC5waTYwO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0XHRyYWQgKz0gcmFkMiAtIHJhZDE7XHJcblxyXG5cdFx0XHRcdFx0XHRcdHJhZDAgPSAocmFkICsgVC5waTkwICArIFQuVHdvUEkgKyBycikgJSAoVC5Ud29QSSksXHJcblx0XHRcdFx0XHRcdFx0cmFkMSA9IHJhZDAgJSAoKDIvMykgKiBULlBJKSAtIChULnBpNjApO1xyXG5cdFx0XHRcdFx0XHRcdGIgPSBNYXRoLnRhbihyYWQxKSAqIGE7XHJcblx0XHRcdFx0XHRcdFx0ciA9IG1heFIgPSBNYXRoLnNxcnQoYSphICsgYipiKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0bHVtID0gKChNYXRoLnNpbihyYWQwKSAqIHIpIC8gdGhpcy50c2wpICsgMC41O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRsZXQgdyA9IDEgLSAoTWF0aC5hYnMobHVtIC0gMC41KSAqIDIpO1xyXG5cdFx0XHRcdFx0XHRzYXQgPSAoKChNYXRoLmNvcyhyYWQwKSAqIHIpICsgKHRoaXMudHIgLyAyKSkgLyAoMS41ICogdGhpcy50cikpIC8gdztcclxuXHRcdFx0XHRcdFx0c2F0ID0gVC5jbGFtcCggc2F0LCAwLCAxICk7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdCAgICAgICAgdGhpcy5zZXRIU0woW3RoaXMuaHNsWzBdLCBzYXQsIGx1bV0pO1xyXG5cclxuXHRcdFx0XHQgICAgfVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblx0c2V0SGVpZ2h0ICgpIHtcclxuXHJcblx0XHR0aGlzLmggPSB0aGlzLmlzT3BlbiA/IHRoaXMud2ZpeGUgKyB0aGlzLmJhc2VIICsgNSA6IHRoaXMuYmFzZUhcclxuXHRcdHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnXHJcblx0XHR0aGlzLnpvbmUuaCA9IHRoaXMuaFxyXG5cclxuXHR9XHJcblxyXG5cdHBhcmVudEhlaWdodCAoIHQgKSB7XHJcblxyXG5cdFx0aWYgKCB0aGlzLmdyb3VwICE9PSBudWxsICkgdGhpcy5ncm91cC5jYWxjKCB0ICk7XHJcblx0ICAgIGVsc2UgaWYgKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggdCApO1xyXG5cclxuXHR9XHJcblxyXG5cdG9wZW4gKCkge1xyXG5cclxuXHRcdHN1cGVyLm9wZW4oKTtcclxuXHJcblx0XHR0aGlzLnNldEhlaWdodCgpO1xyXG5cclxuXHRcdGlmKCB0aGlzLnVwICkgdGhpcy56b25lLnkgLT0gdGhpcy53Zml4ZSArIDU7XHJcblxyXG5cdFx0bGV0IHQgPSB0aGlzLmggLSB0aGlzLmJhc2VIO1xyXG5cclxuXHQgICAgdGhpcy5zWzNdLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XHJcblx0ICAgIC8vdGhpcy5zWzNdLmRpc3BsYXkgPSAnYmxvY2snO1xyXG5cdCAgICB0aGlzLnBhcmVudEhlaWdodCggdCApO1xyXG5cclxuXHR9XHJcblxyXG5cdGNsb3NlICgpIHtcclxuXHJcblx0XHRzdXBlci5jbG9zZSgpO1xyXG5cclxuXHRcdGlmKCB0aGlzLnVwICkgdGhpcy56b25lLnkgKz0gdGhpcy53Zml4ZSArIDU7XHJcblxyXG5cdFx0bGV0IHQgPSB0aGlzLmggLSB0aGlzLmJhc2VIO1xyXG5cclxuXHRcdHRoaXMuc2V0SGVpZ2h0KCk7XHJcblxyXG5cdCAgICB0aGlzLnNbM10udmlzaWJpbGl0eSAgPSAnaGlkZGVuJztcclxuXHQgICAgLy90aGlzLnNbM10uZGlzcGxheSA9ICdub25lJztcclxuXHQgICAgdGhpcy5wYXJlbnRIZWlnaHQoIC10ICk7XHJcblxyXG5cdH1cclxuXHJcblx0dXBkYXRlICggdXAgKSB7XHJcblxyXG5cdCAgICBsZXQgY2MgPSBUb29scy5yZ2JUb0hleCggVG9vbHMuaHNsVG9SZ2IoWyB0aGlzLmhzbFswXSwgMSwgMC41IF0pICk7XHJcblxyXG5cdCAgICB0aGlzLm1vdmVNYXJrZXJzKCk7XHJcblx0ICAgIFxyXG5cdCAgICB0aGlzLnZhbHVlID0gdGhpcy5iY29sb3I7XHJcblxyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsIGNjLCAyLCAwICk7XHJcblxyXG5cdCAgICB0aGlzLnNbMl0uYmFja2dyb3VuZCA9IHRoaXMuYmNvbG9yO1xyXG5cdCAgICBpZighdGhpcy5ub3RleHQpIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IFRvb2xzLmh0bWxUb0hleCggdGhpcy5iY29sb3IgKTtcclxuXHJcblx0ICAgIHRoaXMuaW52ZXJ0ID0gVG9vbHMuZmluZERlZXBJbnZlciggdGhpcy5yZ2IgKTtcclxuXHQgICAgdGhpcy5zWzJdLmNvbG9yID0gdGhpcy5pbnZlcnQgPyAnI2ZmZicgOiAnIzAwMCc7XHJcblxyXG5cdCAgICBpZighdXApIHJldHVybjtcclxuXHJcblx0ICAgIGlmKCB0aGlzLmN0eXBlID09PSAnYXJyYXknICkgdGhpcy5zZW5kKCB0aGlzLnJnYiApO1xyXG5cdCAgICBpZiggdGhpcy5jdHlwZSA9PT0gJ3JnYicgKSB0aGlzLnNlbmQoIFRvb2xzLmh0bWxSZ2IoIHRoaXMucmdiICkgKTtcclxuXHQgICAgaWYoIHRoaXMuY3R5cGUgPT09ICdoZXgnICkgdGhpcy5zZW5kKCBUb29scy5odG1sVG9IZXgoIHRoaXMudmFsdWUgKSApO1xyXG5cdCAgICBpZiggdGhpcy5jdHlwZSA9PT0gJ2h0bWwnICkgdGhpcy5zZW5kKCk7XHJcblxyXG5cdH1cclxuXHJcblx0c2V0VmFsdWUgKCB2ICl7XHJcblxyXG5cdFx0aWYoIHYgaW5zdGFuY2VvZiBBcnJheSApIHRoaXMudmFsdWUgPSBUb29scy5yZ2JUb0hleCggdiApO1xyXG4gICAgICAgIGVsc2UgaWYoIWlzTmFOKHYpKSB0aGlzLnZhbHVlID0gVG9vbHMuaGV4VG9IdG1sKCB2ICk7XHJcbiAgICAgICAgZWxzZSB0aGlzLnZhbHVlID0gdjtcclxuXHJcblx0XHR0aGlzLnNldENvbG9yKCB0aGlzLnZhbHVlIClcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cclxuXHR9XHJcblxyXG5cdHNldENvbG9yICggY29sb3IgKSB7XHJcblxyXG5cdCAgICBsZXQgdW5wYWNrID0gVG9vbHMudW5wYWNrKGNvbG9yKTtcclxuXHQgICAgaWYgKHRoaXMuYmNvbG9yICE9PSBjb2xvciAmJiB1bnBhY2spIHtcclxuXHJcblx0ICAgICAgICB0aGlzLmJjb2xvciA9IGNvbG9yXHJcblx0ICAgICAgICB0aGlzLnJnYiA9IHVucGFja1xyXG5cdCAgICAgICAgdGhpcy5oc2wgPSBUb29scy5yZ2JUb0hzbCggdGhpcy5yZ2IgKVxyXG5cclxuXHQgICAgICAgIHRoaXMuaHVlID0gdGhpcy5oc2xbMF07XHJcblxyXG5cdCAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuXHQgICAgfVxyXG5cdCAgICByZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRzZXRIU0wgKCBoc2wgKSB7XHJcblxyXG5cdCAgICB0aGlzLmhzbCA9IGhzbDtcclxuXHQgICAgdGhpcy5yZ2IgPSBUb29scy5oc2xUb1JnYiggaHNsICk7XHJcblx0ICAgIHRoaXMuYmNvbG9yID0gVG9vbHMucmdiVG9IZXgoIHRoaXMucmdiICk7XHJcblx0ICAgIHRoaXMudXBkYXRlKCB0cnVlICk7XHJcblx0ICAgIHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdG1vdmVNYXJrZXJzICgpIHtcclxuXHJcblx0XHRsZXQgcCA9IHRoaXMucHBcclxuXHRcdGxldCBUID0gVG9vbHNcclxuXHJcblx0ICAgIGxldCBjMSA9IHRoaXMuaW52ZXJ0ID8gJyNmZmYnIDogJyMwMDAnO1xyXG5cdCAgICBsZXQgYSA9IHRoaXMuaHNsWzBdICogVC5Ud29QSTtcclxuXHQgICAgbGV0IHRoaXJkID0gKDIvMykgKiBULlBJO1xyXG5cdCAgICBsZXQgciA9IHRoaXMudHI7XHJcblx0ICAgIGxldCBoID0gdGhpcy5oc2xbMF07XHJcblx0ICAgIGxldCBzID0gdGhpcy5oc2xbMV07XHJcblx0ICAgIGxldCBsID0gdGhpcy5oc2xbMl07XHJcblxyXG5cdCAgICBsZXQgYW5nbGUgPSAoIGEgLSBULnBpOTAgKSAqIFQudG9kZWc7XHJcblxyXG5cdCAgICBoID0gLSBhICsgVC5waTkwO1xyXG5cclxuXHRcdGxldCBoeCA9IE1hdGguY29zKGgpICogcjtcclxuXHRcdGxldCBoeSA9IC1NYXRoLnNpbihoKSAqIHI7XHJcblx0XHRsZXQgc3ggPSBNYXRoLmNvcyhoIC0gdGhpcmQpICogcjtcclxuXHRcdGxldCBzeSA9IC1NYXRoLnNpbihoIC0gdGhpcmQpICogcjtcclxuXHRcdGxldCB2eCA9IE1hdGguY29zKGggKyB0aGlyZCkgKiByO1xyXG5cdFx0bGV0IHZ5ID0gLU1hdGguc2luKGggKyB0aGlyZCkgKiByO1xyXG5cdFx0bGV0IG14ID0gKHN4ICsgdngpIC8gMiwgbXkgPSAoc3kgKyB2eSkgLyAyO1xyXG5cdFx0YSAgPSAoMSAtIDIgKiBNYXRoLmFicyhsIC0gLjUpKSAqIHM7XHJcblx0XHRsZXQgeCA9IHN4ICsgKHZ4IC0gc3gpICogbCArIChoeCAtIG14KSAqIGE7XHJcblx0XHRsZXQgeSA9IHN5ICsgKHZ5IC0gc3kpICogbCArIChoeSAtIG15KSAqIGE7XHJcblxyXG5cdCAgICBwLnNldCggeCwgeSApLmFkZFNjYWxhcigxMjgpO1xyXG5cclxuXHQgICAgLy9sZXQgZmYgPSAoMS1sKSoyNTU7XHJcblx0ICAgIC8vIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCAncmdiKCcrZmYrJywnK2ZmKycsJytmZisnKScsIDMgKTtcclxuXHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICd0cmFuc2Zvcm0nLCAncm90YXRlKCcrYW5nbGUrJyApJywgMiApO1xyXG5cclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N4JywgcC54LCAzICk7XHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeScsIHAueSwgMyApO1xyXG5cdCAgICBcclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuaW52ZXJ0ID8gJyNmZmYnIDogJyMwMDAnLCAyLCAzICk7XHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCB0aGlzLmludmVydCA/ICcjZmZmJyA6ICcjMDAwJywgMyApO1xyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsdGhpcy5iY29sb3IsIDMgKTtcclxuXHJcblx0fVxyXG5cclxuXHRyU2l6ZSAoKSB7XHJcblxyXG5cdCAgICAvL1Byb3RvLnByb3RvdHlwZS5yU2l6ZS5jYWxsKCB0aGlzICk7XHJcblx0ICAgIHN1cGVyLnJTaXplKCk7XHJcblxyXG5cdCAgICBsZXQgcyA9IHRoaXMucztcclxuXHJcblx0ICAgIHNbMl0ud2lkdGggPSB0aGlzLnNiICsgJ3B4JztcclxuXHQgICAgc1syXS5sZWZ0ID0gdGhpcy5zYSArICdweCc7XHJcblxyXG5cdCAgICAvL2NvbnNvbGUubG9nKHRoaXMuc2IpXHJcblxyXG5cdCAgICB0aGlzLmN3ID0gdGhpcy5zYiA+IDI1NiA/IDI1NiA6IHRoaXMuc2I7XHJcblxyXG5cclxuXHJcblx0ICAgIHRoaXMuclNpemVDb2xvciggdGhpcy5jdyApO1xyXG5cclxuXHQgICAgdGhpcy5kZWNhbC54ID0gTWF0aC5mbG9vcigodGhpcy53IC0gdGhpcy53Zml4ZSkgKiAwLjUpO1xyXG5cdCAgICAvL3NbM10ubGVmdCA9IHRoaXMuZGVjYWwueCArICdweCc7XHJcblx0ICAgIFxyXG5cdH1cclxuXHJcblx0clNpemVDb2xvciAoIHcgKSB7XHJcblxyXG5cclxuXHRcdGlmKCB3ID09PSB0aGlzLndmaXhlICkgcmV0dXJuO1xyXG5cclxuXHJcblxyXG5cdFx0dGhpcy53Zml4ZSA9IHc7XHJcblxyXG5cclxuXHJcblx0XHRsZXQgcyA9IHRoaXMucztcclxuXHJcblx0XHQvL3RoaXMuZGVjYWwueCA9IE1hdGguZmxvb3IoKHRoaXMudyAtIHRoaXMud2ZpeGUpICogMC41KTtcclxuXHQgICAgdGhpcy5kZWNhbC55ID0gdGhpcy5zaWRlID09PSAndXAnID8gMiA6IHRoaXMuYmFzZUggKyAyXHJcblx0ICAgIHRoaXMubWlkID0gTWF0aC5mbG9vciggdGhpcy53Zml4ZSAqIDAuNSApXHJcblxyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAndmlld0JveCcsICcwIDAgJysgdGhpcy53Zml4ZSArICcgJysgdGhpcy53Zml4ZSApXHJcblx0ICAgIHNbM10ud2lkdGggPSB0aGlzLndmaXhlICsgJ3B4J1xyXG5cdCAgICBzWzNdLmhlaWdodCA9IHRoaXMud2ZpeGUgKyAncHgnXHJcbiAgICBcdC8vc1szXS5sZWZ0ID0gdGhpcy5kZWNhbC54ICsgJ3B4JztcclxuXHQgICAgc1szXS50b3AgPSB0aGlzLmRlY2FsLnkgKyAncHgnXHJcblxyXG5cdCAgICB0aGlzLnJhdGlvID0gMjU2IC8gdGhpcy53Zml4ZVxyXG5cdCAgICB0aGlzLnNxdWFyZSA9IDEgLyAoNjAqKHRoaXMud2ZpeGUvMjU2KSlcclxuXHQgICAgdGhpcy5zZXRIZWlnaHQoKVxyXG5cclxuXHR9XHJcblxyXG5cclxufSIsImltcG9ydCB7IFJvb3RzIH0gZnJvbSAnLi4vY29yZS9Sb290cy5qcyc7XHJcbmltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90by5qcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgRnBzIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMucm91bmQgPSBNYXRoLnJvdW5kO1xyXG5cclxuICAgICAgICAvL3RoaXMuYXV0b0hlaWdodCA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuYmFzZUggPSB0aGlzLmg7XHJcbiAgICAgICAgdGhpcy5ocGx1cyA9IG8uaHBsdXMgfHwgNTA7XHJcblxyXG4gICAgICAgIHRoaXMucmVzID0gby5yZXMgfHwgNDA7XHJcbiAgICAgICAgdGhpcy5sID0gMTtcclxuXHJcbiAgICAgICAgdGhpcy5wcmVjaXNpb24gPSBvLnByZWNpc2lvbiB8fCAwO1xyXG4gICAgICAgIFxyXG5cclxuICAgICAgICB0aGlzLmN1c3RvbSA9IG8uY3VzdG9tIHx8IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubmFtZXMgPSBvLm5hbWVzIHx8IFsnRlBTJywgJ01TJ107XHJcbiAgICAgICAgbGV0IGNjID0gby5jYyB8fCBbJzIyMCwyMjAsMjIwJywgJzI1NSwyNTUsMCddO1xyXG5cclxuICAgICAgIC8vIHRoaXMuZGl2aWQgPSBbIDEwMCwgMTAwLCAxMDAgXTtcclxuICAgICAgIC8vIHRoaXMubXVsdHkgPSBbIDMwLCAzMCwgMzAgXTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRpbmcgPSBvLmFkZGluZyB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5yYW5nZSA9IG8ucmFuZ2UgfHwgWyAxNjUsIDEwMCwgMTAwIF07XHJcblxyXG4gICAgICAgIHRoaXMuYWxwaGEgPSBvLmFscGhhIHx8IDAuMjU7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWVzID0gW107XHJcbiAgICAgICAgdGhpcy5wb2ludHMgPSBbXTtcclxuICAgICAgICB0aGlzLnRleHREaXNwbGF5ID0gW107XHJcblxyXG4gICAgICAgIGlmKCF0aGlzLmN1c3RvbSl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm5vdyA9IFJvb3RzLmdldFRpbWUoKVxyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IDA7Ly90aGlzLm5vdygpXHJcbiAgICAgICAgICAgIHRoaXMucHJldlRpbWUgPSAwOy8vdGhpcy5zdGFydFRpbWU7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVzID0gMDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubXMgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmZwcyA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMubWVtID0gMDtcclxuICAgICAgICAgICAgdGhpcy5tbSA9IDA7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlzTWVtID0gKCBzZWxmLnBlcmZvcm1hbmNlICYmIHNlbGYucGVyZm9ybWFuY2UubWVtb3J5ICkgPyB0cnVlIDogZmFsc2U7XHJcblxyXG4gICAgICAgICAgIC8vIHRoaXMuZGl2aWQgPSBbIDEwMCwgMjAwLCAxIF07XHJcbiAgICAgICAgICAgLy8gdGhpcy5tdWx0eSA9IFsgMzAsIDMwLCAzMCBdO1xyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNNZW0gKXtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLm5hbWVzLnB1c2goJ01FTScpO1xyXG4gICAgICAgICAgICAgICAgY2MucHVzaCgnMCwyNTUsMjU1Jyk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnR4dCA9IG8ubmFtZSB8fCAnRnBzJ1xyXG5cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBsZXQgZmx0b3AgPSBNYXRoLmZsb29yKHRoaXMuaCowLjUpLTM7XHJcbiAgICAgICAgY29uc3QgY2NjID0gdGhpcy5jb2xvcnM7XHJcblxyXG4gICAgICAgIHRoaXMuY1sxXS50ZXh0Q29udGVudCA9IHRoaXMudHh0O1xyXG4gICAgICAgIC8vdGhpcy5jWzFdLmlubmVySFRNTCA9ICcmIzE2MDsnICsgdGhpcy50eHRcclxuICAgICAgICB0aGlzLmNbMF0uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICAgIHRoaXMuY1swXS5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ2F1dG8nO1xyXG5cclxuICAgICAgICBsZXQgcGFuZWxDc3MgPSAnZGlzcGxheTpub25lOyBsZWZ0OjEwcHg7IHRvcDonKyB0aGlzLmggKyAncHg7IGhlaWdodDonKyh0aGlzLmhwbHVzIC0gOCkrJ3B4OyBib3gtc2l6aW5nOmJvcmRlci1ib3g7IGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC4yKTsgYm9yZGVyOjFweCBzb2xpZCAnKyBjY2MuYm9yZGVyICsnOyc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnJhZGl1cyAhPT0gMCApIHBhbmVsQ3NzICs9ICdib3JkZXItcmFkaXVzOicgKyB0aGlzLnJhZGl1cysncHg7JzsgXHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAncGF0aCcsIHRoaXMuY3NzLmJhc2ljICsgcGFuZWxDc3MgLCB7fSApO1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0uc2V0QXR0cmlidXRlKCd2aWV3Qm94JywgJzAgMCAnK3RoaXMucmVzKycgNTAnICk7XHJcbiAgICAgICAgdGhpcy5jWzJdLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgJzEwMCUnICk7XHJcbiAgICAgICAgdGhpcy5jWzJdLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCAnMTAwJScgKTtcclxuICAgICAgICB0aGlzLmNbMl0uc2V0QXR0cmlidXRlKCdwcmVzZXJ2ZUFzcGVjdFJhdGlvJywgJ25vbmUnICk7XHJcblxyXG5cclxuICAgICAgICAvL3RoaXMuZG9tKCAncGF0aCcsIG51bGwsIHsgZmlsbDoncmdiYSgyNTUsMjU1LDAsMC4zKScsICdzdHJva2Utd2lkdGgnOjEsIHN0cm9rZTonI0ZGMCcsICd2ZWN0b3ItZWZmZWN0Jzonbm9uLXNjYWxpbmctc3Ryb2tlJyB9LCB0aGlzLmNbMl0gKTtcclxuICAgICAgICAvL3RoaXMuZG9tKCAncGF0aCcsIG51bGwsIHsgZmlsbDoncmdiYSgwLDI1NSwyNTUsMC4zKScsICdzdHJva2Utd2lkdGgnOjEsIHN0cm9rZTonIzBGRicsICd2ZWN0b3ItZWZmZWN0Jzonbm9uLXNjYWxpbmctc3Ryb2tlJyB9LCB0aGlzLmNbMl0gKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBhcnJvd1xyXG4gICAgICAgIHRoaXMuY1szXSA9IHRoaXMuZG9tKCAncGF0aCcsIHRoaXMuY3NzLmJhc2ljICsgJ3Bvc2l0aW9uOmFic29sdXRlOyB3aWR0aDo2cHg7IGhlaWdodDo2cHg7IGxlZnQ6MDsgdG9wOicrZmx0b3ArJ3B4OycsIHsgZDp0aGlzLnN2Z3MuZzEsIGZpbGw6Y2NjLnRleHQsIHN0cm9rZTonbm9uZSd9KVxyXG4gICAgICAgIC8vdGhpcy5jWzNdID0gdGhpcy5kb20oICdwYXRoJywgdGhpcy5jc3MuYmFzaWMgKyAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOjEwcHg7IGhlaWdodDoxMHB4OyBsZWZ0OjRweDsgdG9wOicrZmx0b3ArJ3B4OycsIHsgZDp0aGlzLnN2Z3MuYXJyb3csIGZpbGw6dGhpcy5jb2xvcnMudGV4dCwgc3Ryb2tlOidub25lJ30pO1xyXG5cclxuICAgICAgICAvLyByZXN1bHQgdGVzdFxyXG4gICAgICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3Bvc2l0aW9uOmFic29sdXRlOyBsZWZ0OjEwcHg7IHRvcDonKyh0aGlzLmgrMikgKydweDsgZGlzcGxheTpub25lOyB3aWR0aDoxMDAlOyB0ZXh0LWFsaWduOmNlbnRlcjsnICk7XHJcblxyXG4gICAgICAgIC8vIGJvdHRvbSBsaW5lXHJcbiAgICAgICAgaWYoIG8uYm90dG9tTGluZSApIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnd2lkdGg6MTAwJTsgYm90dG9tOjBweDsgaGVpZ2h0OjFweDsgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpOycpO1xyXG5cclxuICAgICAgICB0aGlzLmlzU2hvdyA9IGZhbHNlO1xyXG5cclxuXHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG5cclxuICAgICAgICAvL3NbMV0ubWFyZ2luTGVmdCA9ICcxMHB4JztcclxuICAgICAgICBzWzFdLmxpbmVIZWlnaHQgPSB0aGlzLmgtNDtcclxuICAgICAgICBzWzFdLmNvbG9yID0gY2NjLnRleHQ7XHJcbiAgICAgICAgLy9zWzFdLnBhZGRpbmdMZWZ0ID0gJzE4cHgnO1xyXG4gICAgICAgIC8vc1sxXS5mb250V2VpZ2h0ID0gJ2JvbGQnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5yYWRpdXMgIT09IDAgKSAgc1swXS5ib3JkZXJSYWRpdXMgPSB0aGlzLnJhZGl1cysncHgnO1xyXG4gICAgICAgIGlmKCB0aGlzLmNvbG9ycy5nYm9yZGVyIT09J25vbmUnKSBzWzBdLmJvcmRlciA9ICcxcHggc29saWQgJyArIGNjYy5nYm9yZGVyO1xyXG5cclxuXHJcblxyXG5cclxuICAgICAgICBsZXQgaiA9IDA7XHJcblxyXG4gICAgICAgIGZvciggaj0wOyBqPHRoaXMubmFtZXMubGVuZ3RoOyBqKysgKXtcclxuXHJcbiAgICAgICAgICAgIGxldCBiYXNlID0gW107XHJcbiAgICAgICAgICAgIGxldCBpID0gdGhpcy5yZXMrMTtcclxuICAgICAgICAgICAgd2hpbGUoIGktLSApIGJhc2UucHVzaCg1MCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJhbmdlW2pdID0gKCAxIC8gdGhpcy5yYW5nZVtqXSApICogNDk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLnBvaW50cy5wdXNoKCBiYXNlICk7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWVzLnB1c2goMCk7XHJcbiAgICAgICAgICAgLy8gIHRoaXMuZG9tKCAncGF0aCcsIG51bGwsIHsgZmlsbDoncmdiYSgnK2NjW2pdKycsMC41KScsICdzdHJva2Utd2lkdGgnOjEsIHN0cm9rZToncmdiYSgnK2NjW2pdKycsMSknLCAndmVjdG9yLWVmZmVjdCc6J25vbi1zY2FsaW5nLXN0cm9rZScgfSwgdGhpcy5jWzJdICk7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dERpc3BsYXkucHVzaCggXCI8c3BhbiBzdHlsZT0nY29sb3I6cmdiKFwiK2NjW2pdK1wiKSc+IFwiICsgdGhpcy5uYW1lc1tqXSArXCIgXCIpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGogPSB0aGlzLm5hbWVzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShqLS0pe1xyXG4gICAgICAgICAgICB0aGlzLmRvbSggJ3BhdGgnLCBudWxsLCB7IGZpbGw6J3JnYmEoJytjY1tqXSsnLCcrdGhpcy5hbHBoYSsnKScsICdzdHJva2Utd2lkdGgnOjEsIHN0cm9rZToncmdiYSgnK2NjW2pdKycsMSknLCAndmVjdG9yLWVmZmVjdCc6J25vbi1zY2FsaW5nLXN0cm9rZScgfSwgdGhpcy5jWzJdICk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgICAgIC8vaWYoIHRoaXMuaXNTaG93ICkgdGhpcy5zaG93KCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNTaG93ICkgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIGVsc2UgdGhpcy5vcGVuKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvKm1vZGU6IGZ1bmN0aW9uICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIHN3aXRjaChtb2RlKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgICBzWzFdLmNvbG9yID0gdGhpcy5jb2xvcnMudGV4dDtcclxuICAgICAgICAgICAgICAgIC8vc1sxXS5iYWNrZ3JvdW5kID0gJ25vbmUnO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICBzWzFdLmNvbG9yID0gJyNGRkYnO1xyXG4gICAgICAgICAgICAgICAgLy9zWzFdLmJhY2tncm91bmQgPSBVSUwuU0VMRUNUO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiAvLyBlZGl0IC8gZG93blxyXG4gICAgICAgICAgICAgICAgc1sxXS5jb2xvciA9IHRoaXMuY29sb3JzLnRleHQ7XHJcbiAgICAgICAgICAgICAgICAvL3NbMV0uYmFja2dyb3VuZCA9IFVJTC5TRUxFQ1RET1dOO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfSwqL1xyXG5cclxuICAgIHRpY2sgKCB2ICkge1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlcyA9IHY7XHJcbiAgICAgICAgaWYoICF0aGlzLmlzU2hvdyApIHJldHVybjtcclxuICAgICAgICB0aGlzLmRyYXdHcmFwaCgpO1xyXG4gICAgICAgIHRoaXMudXBUZXh0KCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1ha2VQYXRoICggcG9pbnQgKSB7XHJcblxyXG4gICAgICAgIGxldCBwID0gJyc7XHJcbiAgICAgICAgcCArPSAnTSAnICsgKC0xKSArICcgJyArIDUwO1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMucmVzICsgMTsgaSArKyApIHsgcCArPSAnIEwgJyArIGkgKyAnICcgKyBwb2ludFtpXTsgfVxyXG4gICAgICAgIHAgKz0gJyBMICcgKyAodGhpcy5yZXMgKyAxKSArICcgJyArIDUwO1xyXG4gICAgICAgIHJldHVybiBwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cFRleHQgKCB2YWwgKSB7XHJcblxyXG4gICAgICAgIGxldCB2ID0gdmFsIHx8IHRoaXMudmFsdWVzLCB0ID0gJyc7XHJcbiAgICAgICAgZm9yKCBsZXQgaj0wLCBsbmcgPXRoaXMubmFtZXMubGVuZ3RoOyBqPGxuZzsgaisrICkgdCArPSB0aGlzLnRleHREaXNwbGF5W2pdICsgKHZbal0pLnRvRml4ZWQodGhpcy5wcmVjaXNpb24pICsgJzwvc3Bhbj4nO1xyXG4gICAgICAgIHRoaXMuY1s0XS5pbm5lckhUTUwgPSB0O1xyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgZHJhd0dyYXBoICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHN2ZyA9IHRoaXMuY1syXTtcclxuICAgICAgICBsZXQgaSA9IHRoaXMubmFtZXMubGVuZ3RoLCB2LCBvbGQgPSAwLCBuID0gMDtcclxuXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgICAgICBpZiggdGhpcy5hZGRpbmcgKSB2ID0gKHRoaXMudmFsdWVzW25dK29sZCkgKiB0aGlzLnJhbmdlW25dO1xyXG4gICAgICAgICAgICBlbHNlICB2ID0gKHRoaXMudmFsdWVzW25dICogdGhpcy5yYW5nZVtuXSk7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRzW25dLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRzW25dLnB1c2goIDUwIC0gdiApO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2Zyggc3ZnLCAnZCcsIHRoaXMubWFrZVBhdGgoIHRoaXMucG9pbnRzW25dICksIGkrMSApO1xyXG4gICAgICAgICAgICBvbGQgKz0gdGhpcy52YWx1ZXNbbl07XHJcbiAgICAgICAgICAgIG4rKztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBvcGVuICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIub3BlbigpXHJcblxyXG4gICAgICAgIHRoaXMuaCA9IHRoaXMuaHBsdXMgKyB0aGlzLmJhc2VIO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsIHRoaXMuc3Zncy5nMiApO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5ncm91cCAhPT0gbnVsbCApeyB0aGlzLmdyb3VwLmNhbGMoIHRoaXMuaHBsdXMgKTt9XHJcbiAgICAgICAgZWxzZSBpZiggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNhbGMoIHRoaXMuaHBsdXMgKTtcclxuXHJcbiAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArJ3B4JztcclxuICAgICAgICB0aGlzLnNbMl0uZGlzcGxheSA9ICdibG9jayc7IFxyXG4gICAgICAgIHRoaXMuc1s0XS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICB0aGlzLmlzU2hvdyA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5jdXN0b20gKSBSb290cy5hZGRMaXN0ZW4oIHRoaXMgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5jbG9zZSgpXHJcblxyXG4gICAgICAgIHRoaXMuaCA9IHRoaXMuYmFzZUg7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgdGhpcy5zdmdzLmcxICk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmdyb3VwICE9PSBudWxsICl7IHRoaXMuZ3JvdXAuY2FsYyggLXRoaXMuaHBsdXMgKTt9XHJcbiAgICAgICAgZWxzZSBpZiggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNhbGMoIC10aGlzLmhwbHVzICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArJ3B4JztcclxuICAgICAgICB0aGlzLnNbMl0uZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB0aGlzLnNbNF0uZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB0aGlzLmlzU2hvdyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuY3VzdG9tICkgUm9vdHMucmVtb3ZlTGlzdGVuKCB0aGlzICk7XHJcblxyXG4gICAgICAgIHRoaXMuY1s0XS5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8vLy8gQVVUTyBGUFMgLy8vLy8vXHJcblxyXG4gICAgYmVnaW4gKCkge1xyXG5cclxuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IHRoaXMubm93KCk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgZW5kICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHRpbWUgPSB0aGlzLm5vdygpO1xyXG4gICAgICAgIHRoaXMubXMgPSB0aW1lIC0gdGhpcy5zdGFydFRpbWU7XHJcblxyXG4gICAgICAgIHRoaXMuZnJhbWVzICsrO1xyXG5cclxuICAgICAgICBpZiAoIHRpbWUgPiB0aGlzLnByZXZUaW1lICsgMTAwMCApIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZnBzID0gdGhpcy5yb3VuZCggKCB0aGlzLmZyYW1lcyAqIDEwMDAgKSAvICggdGltZSAtIHRoaXMucHJldlRpbWUgKSApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5wcmV2VGltZSA9IHRpbWU7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVzID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmICggdGhpcy5pc01lbSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgaGVhcFNpemUgPSBwZXJmb3JtYW5jZS5tZW1vcnkudXNlZEpTSGVhcFNpemU7XHJcbiAgICAgICAgICAgICAgICBsZXQgaGVhcFNpemVMaW1pdCA9IHBlcmZvcm1hbmNlLm1lbW9yeS5qc0hlYXBTaXplTGltaXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW0gPSB0aGlzLnJvdW5kKCBoZWFwU2l6ZSAqIDAuMDAwMDAwOTU0ICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1tID0gaGVhcFNpemUgLyBoZWFwU2l6ZUxpbWl0O1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWVzID0gWyB0aGlzLmZwcywgdGhpcy5tcyAsIHRoaXMubW0gXTtcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3R3JhcGgoKTtcclxuICAgICAgICB0aGlzLnVwVGV4dCggWyB0aGlzLmZwcywgdGhpcy5tcywgdGhpcy5tZW0gXSApO1xyXG5cclxuICAgICAgICByZXR1cm4gdGltZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbGlzdGVuaW5nICgpIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmN1c3RvbSApIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5lbmQoKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIGxldCB3ID0gdGhpcy53O1xyXG5cclxuICAgICAgICBzWzNdLmxlZnQgPSAoIHRoaXMuc2EgKyB0aGlzLnNiIC0gNiApICsgJ3B4J1xyXG5cclxuICAgICAgICBzWzBdLndpZHRoID0gdyArICdweCc7XHJcbiAgICAgICAgc1sxXS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ubGVmdCA9IDEwICsgJ3B4JztcclxuICAgICAgICBzWzJdLndpZHRoID0gKHctMjApICsgJ3B4JztcclxuICAgICAgICBzWzRdLndpZHRoID0gKHctMjApICsgJ3B4JztcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvLmpzJztcclxuaW1wb3J0IHsgVjIgfSBmcm9tICcuLi9jb3JlL1YyLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBHcmFwaCBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgIFx0dGhpcy52YWx1ZSA9IG8udmFsdWUgIT09IHVuZGVmaW5lZCA/IG8udmFsdWUgOiBbMCwwLDBdO1xyXG4gICAgICAgIHRoaXMubG5nID0gdGhpcy52YWx1ZS5sZW5ndGg7XHJcblxyXG4gICAgICAgIHRoaXMucHJlY2lzaW9uID0gby5wcmVjaXNpb24gIT09IHVuZGVmaW5lZCA/IG8ucHJlY2lzaW9uIDogMjtcclxuICAgICAgICB0aGlzLm11bHRpcGxpY2F0b3IgPSBvLm11bHRpcGxpY2F0b3IgfHwgMTtcclxuICAgICAgICB0aGlzLm5lZyA9IG8ubmVnIHx8IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmxpbmUgPSBvLmxpbmUgIT09IHVuZGVmaW5lZCA/ICBvLmxpbmUgOiB0cnVlO1xyXG5cclxuICAgICAgICAvL2lmKHRoaXMubmVnKXRoaXMubXVsdGlwbGljYXRvcio9MjtcclxuXHJcbiAgICAgICAgdGhpcy5hdXRvV2lkdGggPSBvLmF1dG9XaWR0aCAhPT0gdW5kZWZpbmVkID8gby5hdXRvV2lkdGggOiB0cnVlO1xyXG4gICAgICAgIHRoaXMuaXNOdW1iZXIgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5oID0gby5oIHx8IDEyOCArIDEwO1xyXG4gICAgICAgIHRoaXMucmggPSB0aGlzLmggLSAxMDtcclxuICAgICAgICB0aGlzLnRvcCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuY1swXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkICkgeyAvLyB3aXRoIHRpdGxlXHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUud2lkdGggPSB0aGlzLncgKydweCc7XHJcblxyXG4gICAgICAgICAgICBpZighdGhpcy5hdXRvV2lkdGgpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLndpZHRoID0gJzEwMCUnO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLmp1c3RpZnlDb250ZW50ID0gJ2NlbnRlcidcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vdGhpcy5jWzFdLnN0eWxlLmJhY2tncm91bmQgPSAnI2ZmMDAwMCc7XHJcbiAgICAgICAgICAgIC8vdGhpcy5jWzFdLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IDEwO1xyXG4gICAgICAgICAgICB0aGlzLmggKz0gMTA7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5naCA9IHRoaXMucmggLSAyODtcclxuICAgICAgICB0aGlzLmd3ID0gdGhpcy53IC0gMjg7XHJcblxyXG4gICAgICAgIC8vdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAnanVzdGlmeS1jb250ZW50OmNlbnRlcjsgdGV4dC1hbGlnbjoganVzdGlmeTsgY29sdW1uLWNvdW50OicrdGhpcy5sbmcrJzsgdG9wOicrKHRoaXMuaC0yMCkrJ3B4OyB3aWR0aDoxMDAlOyBjb2xvcjonKyB0aGlzLmNvbG9ycy50ZXh0ICk7XHJcblxyXG4gICAgICAgIC8vbGV0IGNvbHVtID0gJ2NvbHVtbi1jb3VudDonK3RoaXMubG5nKyc7IGNvbHVtbjonK3RoaXMubG5nKyc7IGJyZWFrLWluc2lkZTogY29sdW1uOyB0b3A6J1xyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ2Rpc3BsYXk6YmxvY2s7IHRleHQtYWxpZ246Y2VudGVyOyBwYWRkaW5nOjBweCAwcHg7IHRvcDonKyh0aGlzLmgtMjApKydweDsgbGVmdDoxNHB4OyB3aWR0aDonK3RoaXMuZ3crJ3B4OyAgY29sb3I6JysgdGhpcy5jb2xvcnMudGV4dCApO1xyXG4gICAgICAgXHJcbiAgICAgICAgLy90aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIHRoaXMuY1syXS5pbm5lckhUTUwgPSB0aGlzLnZhbHVlVG9IdG1sKCk7XHJcblxyXG4gICAgICAgIGxldCBzdmcgPSB0aGlzLmRvbSggJ3N2ZycsIHRoaXMuY3NzLmJhc2ljICwgeyB2aWV3Qm94OicwIDAgJyt0aGlzLncrJyAnK3RoaXMucmgsIHdpZHRoOnRoaXMudywgaGVpZ2h0OnRoaXMucmgsIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICB0aGlzLnNldENzcyggc3ZnLCB7IHdpZHRoOnRoaXMudywgaGVpZ2h0OnRoaXMucmgsIGxlZnQ6MCwgdG9wOnRoaXMudG9wIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmRvbSggJ3BhdGgnLCAnJywgeyBkOicnLCBzdHJva2U6dGhpcy5jb2xvcnMudGV4dCwgJ3N0cm9rZS13aWR0aCc6MiwgZmlsbDonbm9uZScsICdzdHJva2UtbGluZWNhcCc6J2J1dHQnIH0sIHN2ZyApO1xyXG4gICAgICAgIHRoaXMuZG9tKCAncmVjdCcsICcnLCB7IHg6MTAsIHk6MTAsIHdpZHRoOnRoaXMuZ3crOCwgaGVpZ2h0OnRoaXMuZ2grOCwgc3Ryb2tlOidyZ2JhKDAsMCwwLDAuMyknLCAnc3Ryb2tlLXdpZHRoJzoxICwgZmlsbDonbm9uZSd9LCBzdmcgKTtcclxuXHJcbiAgICAgICAgdGhpcy5pdyA9ICgodGhpcy5ndy0oNCoodGhpcy5sbmctMSkpKS90aGlzLmxuZyk7XHJcbiAgICAgICAgbGV0IHQgPSBbXTtcclxuICAgICAgICB0aGlzLmNNb2RlID0gW107XHJcblxyXG4gICAgICAgIHRoaXMudiA9IFtdO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICAgICAgXHR0W2ldID0gWyAxNCArIChpKnRoaXMuaXcpICsgKGkqNCksIHRoaXMuaXcgXTtcclxuICAgICAgICBcdHRbaV1bMl0gPSB0W2ldWzBdICsgdFtpXVsxXTtcclxuICAgICAgICBcdHRoaXMuY01vZGVbaV0gPSAwO1xyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMubmVnICkgdGhpcy52W2ldID0gKCgxKyh0aGlzLnZhbHVlW2ldIC8gdGhpcy5tdWx0aXBsaWNhdG9yKSkqMC41KTtcclxuICAgICAgICBcdGVsc2UgdGhpcy52W2ldID0gdGhpcy52YWx1ZVtpXSAvIHRoaXMubXVsdGlwbGljYXRvcjtcclxuXHJcbiAgICAgICAgXHR0aGlzLmRvbSggJ3JlY3QnLCAnJywgeyB4OnRbaV1bMF0sIHk6MTQsIHdpZHRoOnRbaV1bMV0sIGhlaWdodDoxLCBmaWxsOnRoaXMuY29sb3JzLnRleHQsICdmaWxsLW9wYWNpdHknOjAuMyB9LCBzdmcgKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnRtcCA9IHQ7XHJcbiAgICAgICAgdGhpcy5jWzNdID0gc3ZnO1xyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMudylcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCApe1xyXG4gICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUudG9wID0gMCArJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLmhlaWdodCA9IDIwICsncHgnO1xyXG4gICAgICAgICAgICB0aGlzLnNbMV0ubGluZUhlaWdodCA9ICgyMC01KSsncHgnXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZSggZmFsc2UgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0VmFsdWUgKCB2YWx1ZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMubG5nID0gdGhpcy52YWx1ZS5sZW5ndGg7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm5lZykgdGhpcy52W2ldID0gKDEgKyB2YWx1ZVtpXSAvIHRoaXMubXVsdGlwbGljYXRvcikgKiAwLjU7XHJcbiAgICAgICAgICAgIGVsc2UgdGhpcy52W2ldID0gdmFsdWVbaV0gLyB0aGlzLm11bHRpcGxpY2F0b3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHZhbHVlVG9IdG1sKCkge1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMubG5nLCBuPTAsIHIgPSAnPHRhYmxlIHN0eWxlPVwid2lkdGg6MTAwJTtcIj48dHI+J1xyXG4gICAgICAgIGxldCB3ID0gMTAwIC8gdGhpcy5sbmdcclxuICAgICAgICBsZXQgc3R5bGUgPSAnd2lkdGg6JysgdyArJyU7Jy8vJyB0ZXh0LWFsaWduOmNlbnRlcjsnXHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgaWYobj09PXRoaXMubG5nLTEpIHIgKz0gJzx0ZCBzdHlsZT0nK3N0eWxlKyc+JyArIHRoaXMudmFsdWVbbl0gKyAnPC90ZD48L3RyPjwvdGFibGU+J1xyXG4gICAgICAgICAgICBlbHNlIHIgKz0gJzx0ZCBzdHlsZT0nK3N0eWxlKyc+JyArIHRoaXMudmFsdWVbbl0gKyAnPC90ZD4nXHJcbiAgICAgICAgICAgIG4rK1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gclxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVNWRyAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmxpbmUgKSB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsIHRoaXMubWFrZVBhdGgoKSwgMCApO1xyXG5cclxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpPHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdoZWlnaHQnLCB0aGlzLnZbaV0qdGhpcy5naCwgaSsyICk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICd5JywgMTQgKyAodGhpcy5naCAtIHRoaXMudltpXSp0aGlzLmdoKSwgaSsyICk7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLm5lZyApIHRoaXMudmFsdWVbaV0gPSAoICgodGhpcy52W2ldKjIpLTEpICogdGhpcy5tdWx0aXBsaWNhdG9yICkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKSAqIDE7XHJcbiAgICAgICAgICAgIGVsc2UgdGhpcy52YWx1ZVtpXSA9ICggKHRoaXMudltpXSAqIHRoaXMubXVsdGlwbGljYXRvcikgKS50b0ZpeGVkKCB0aGlzLnByZWNpc2lvbiApICogMTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3RoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgdGhpcy5jWzJdLmlubmVySFRNTCA9IHRoaXMudmFsdWVUb0h0bWwoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGVzdFpvbmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZztcclxuICAgICAgICBsZXQgdCA9IHRoaXMudG1wO1xyXG4gICAgICAgIFxyXG5cdCAgICBpZiggbC55PnRoaXMudG9wICYmIGwueTx0aGlzLmgtMjAgKXtcclxuXHQgICAgICAgIHdoaWxlKCBpLS0gKXtcclxuXHQgICAgICAgICAgICBpZiggbC54PnRbaV1bMF0gJiYgbC54PHRbaV1bMl0gKSByZXR1cm4gaTtcclxuXHQgICAgICAgIH1cclxuXHQgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gJydcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZSAoIG4sIG5hbWUgKSB7XHJcblxyXG4gICAgXHRpZiggbiA9PT0gdGhpcy5jTW9kZVtuYW1lXSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBcdGxldCBhO1xyXG5cclxuICAgICAgICBzd2l0Y2gobil7XHJcbiAgICAgICAgICAgIGNhc2UgMDogYT0wLjM7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IGE9MC42OyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiBhPTE7IGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yZXNldCgpO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbC1vcGFjaXR5JywgYSwgbmFtZSArIDIgKTtcclxuICAgICAgICB0aGlzLmNNb2RlW25hbWVdID0gbjtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG5cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgXHRsZXQgbnVwID0gZmFsc2U7XHJcbiAgICAgICAgLy90aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMubG5nO1xyXG4gICAgICAgIHdoaWxlKGktLSl7IFxyXG4gICAgICAgICAgICBpZiggdGhpcy5jTW9kZVtpXSAhPT0gMCApe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jTW9kZVtpXSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbC1vcGFjaXR5JywgMC4zLCBpICsgMiApO1xyXG4gICAgICAgICAgICAgICAgbnVwID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51cDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgaWYoIHRoaXMuY3VycmVudCAhPT0gLTEgKSByZXR1cm4gdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgXHR0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgXHRsZXQgbnVwID0gZmFsc2U7XHJcblxyXG4gICAgXHRsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoZSk7XHJcblxyXG4gICAgXHRpZiggbmFtZSA9PT0gJycgKXtcclxuXHJcbiAgICAgICAgICAgIG51cCA9IHRoaXMucmVzZXQoKTtcclxuICAgICAgICAgICAgLy90aGlzLmN1cnNvcigpO1xyXG5cclxuICAgICAgICB9IGVsc2UgeyBcclxuXHJcbiAgICAgICAgICAgIG51cCA9IHRoaXMubW9kZSggdGhpcy5pc0Rvd24gPyAyIDogMSwgbmFtZSApO1xyXG4gICAgICAgICAgICAvL3RoaXMuY3Vyc29yKCB0aGlzLmN1cnJlbnQgIT09IC0xID8gJ21vdmUnIDogJ3BvaW50ZXInICk7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuaXNEb3duKXtcclxuICAgICAgICAgICAgXHR0aGlzLnZbbmFtZV0gPSB0aGlzLmNsYW1wKCAxIC0gKCggZS5jbGllbnRZIC0gdGhpcy56b25lLnkgLSB0aGlzLnl0b3AgLSAxMCApIC8gdGhpcy5naCkgLCAwLCAxICk7XHJcbiAgICAgICAgICAgIFx0dGhpcy51cGRhdGUoIHRydWUgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBudXA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICB1cGRhdGUgKCB1cCApIHtcclxuXHJcbiAgICBcdHRoaXMudXBkYXRlU1ZHKCk7XHJcblxyXG4gICAgICAgIGlmKCB1cCApIHRoaXMuc2VuZCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtYWtlUGF0aCAoKSB7XHJcblxyXG4gICAgXHRsZXQgcCA9IFwiXCIsIGgsIHcsIHduLCB3bSwgb3csIG9oXHJcbiAgICBcdC8vbGV0IGcgPSB0aGlzLml3KjAuNVxyXG5cclxuICAgIFx0Zm9yKGxldCBpID0gMDsgaTx0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgXHRcdGggPSAxNCArICh0aGlzLmdoIC0gdGhpcy52W2ldKnRoaXMuZ2gpXHJcbiAgICBcdFx0dyA9ICgxNCArIChpKnRoaXMuaXcpICsgKGkqNCkpXHJcblxyXG4gICAgXHRcdHdtID0gdyArIHRoaXMuaXcqMC41XHJcbiAgICBcdFx0d24gPSB3ICsgdGhpcy5pd1xyXG5cclxuICAgIFx0XHRpZiggaSA9PT0gMCApIHArPSdNICcrdysnICcrIGggKyAnIFQgJyArIHdtICsnICcrIGhcclxuICAgIFx0XHRlbHNlIHAgKz0gJyBDICcgKyBvdyArJyAnKyBvaCArICcsJyArIHcgKycgJysgaCArICcsJyArIHdtICsnICcrIGhcclxuICAgIFx0XHRpZiggaSA9PT0gdGhpcy5sbmctMSApIHArPScgVCAnICsgd24gKycgJysgaFxyXG5cclxuICAgIFx0XHRvdyA9IHduXHJcbiAgICBcdFx0b2ggPSBoIFxyXG5cclxuICAgIFx0fVxyXG5cclxuICAgIFx0cmV0dXJuIHBcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBpZiggdGhpcy5jWzFdICE9PSB1bmRlZmluZWQgKSBzWzFdLndpZHRoID0gdGhpcy53ICsgJ3B4J1xyXG4gICAgICAgIHNbM10ud2lkdGggPSB0aGlzLncgKyAncHgnXHJcblxyXG4gICAgICAgIGxldCBndyA9IHRoaXMudyAtIDI4XHJcbiAgICAgICAgbGV0IGl3ID0gKChndy0oNCoodGhpcy5sbmctMSkpKS90aGlzLmxuZylcclxuICAgICAgICBsZXQgdCA9IFtdXHJcblxyXG4gICAgICAgIHNbMl0ud2lkdGggPSBndyArICdweCdcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICB0W2ldID0gWyAxNCArIChpKml3KSArIChpKjQpLCBpdyBdXHJcbiAgICAgICAgICAgIHRbaV1bMl0gPSB0W2ldWzBdICsgdFtpXVsxXVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudG1wID0gdFxyXG5cclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8uanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVtcHR5IGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG5cdCAgICBvLmlzU3BhY2UgPSB0cnVlXHJcbiAgICAgICAgby5tYXJnaW4gPSAwXHJcbiAgICAgICAgaWYoIW8uaCkgby5oID0gMTBcclxuICAgICAgICBzdXBlciggbyApXHJcbiAgICAgICAgdGhpcy5pbml0KClcclxuXHJcbiAgICB9XHJcbiAgICBcclxufVxyXG4iLCJcclxuaW1wb3J0IHsgUm9vdHMgfSBmcm9tICcuLi9jb3JlL1Jvb3RzLmpzJztcclxuaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvLmpzJztcclxuaW1wb3J0IHsgRW1wdHkgfSBmcm9tICcuL0VtcHR5LmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBHcm91cCBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLmlzR3JvdXAgPSB0cnVlXHJcblxyXG4gICAgICAgIHRoaXMuQUREID0gby5hZGQ7XHJcblxyXG4gICAgICAgIHRoaXMuYXV0b0hlaWdodCA9IHRydWVcclxuXHJcbiAgICAgICAgdGhpcy51aXMgPSBbXVxyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IC0xXHJcbiAgICAgICAgdGhpcy5wcm90byA9IG51bGxcclxuICAgICAgICB0aGlzLmlzRW1wdHkgPSB0cnVlXHJcblxyXG4gICAgICAgIHRoaXMuZGVjYWwgPSBvLmdyb3VwID8gOCA6IDBcclxuICAgICAgICAvL3RoaXMuZGQgPSBvLmdyb3VwID8gby5ncm91cC5kZWNhbCArIDggOiAwXHJcblxyXG4gICAgICAgIHRoaXMuYmFzZUggPSB0aGlzLmhcclxuXHJcbiAgICAgICAgdGhpcy5zcGFjZVkgPSBuZXcgRW1wdHkoe2g6dGhpcy5tYXJnaW59KTtcclxuXHJcblxyXG5cclxuICAgICAgICBsZXQgZmx0b3AgPSBNYXRoLmZsb29yKHRoaXMuaCowLjUpLTNcclxuXHJcbiAgICAgICAgY29uc3QgY2MgPSB0aGlzLmNvbG9yc1xyXG5cclxuICAgICAgICB0aGlzLnVzZUZsZXggPSB0cnVlIFxyXG4gICAgICAgIGxldCBmbGV4aWJsZSA9IHRoaXMudXNlRmxleCA/ICdkaXNwbGF5OmZsZXg7IGZsZXgtZmxvdzogcm93IHdyYXA7JyA6ICcnXHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyBmbGV4aWJsZSArICd3aWR0aDoxMDAlOyBsZWZ0OjA7ICBvdmVyZmxvdzpoaWRkZW47IHRvcDonKyh0aGlzLmgpKydweCcpXHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdwYXRoJywgdGhpcy5jc3MuYmFzaWMgKyAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOjZweDsgaGVpZ2h0OjZweDsgbGVmdDowOyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuc3Zncy5nMSwgZmlsbDpjYy50ZXh0LCBzdHJva2U6J25vbmUnfSlcclxuXHJcbiAgICAgICAgbGV0IGJoID0gdGhpcy5tdG9wID09PSAwID8gdGhpcy5tYXJnaW4gOiB0aGlzLm10b3BcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNbNF0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3dpZHRoOjEwMCU7IGxlZnQ6MDsgaGVpZ2h0OicrKGJoKzEpKydweDsgdG9wOicrKCh0aGlzLmgtMSkpKydweDsgYmFja2dyb3VuZDpub25lOycpXHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIHRoaXMuY1sxXS5uYW1lID0gJ2dyb3VwJ1xyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRCRyggby5iZyApXHJcblxyXG4gICAgICAgIGlmKCBvLm9wZW4gKSB0aGlzLm9wZW4oKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRCRyAoIGJnICkge1xyXG5cclxuICAgICAgICBjb25zdCBjYyA9IHRoaXMuY29sb3JzXHJcbiAgICAgICAgY29uc3QgcyA9IHRoaXMuc1xyXG5cclxuICAgICAgICBpZiggYmcgIT09IHVuZGVmaW5lZCApIGNjLmdyb3VwcyA9IGJnXHJcbiAgICAgICAgaWYoY2MuZ3JvdXBzID09PSAnbm9uZScpIGNjLmdyb3VwcyA9IGNjLmJhY2tncm91bmRcclxuICAgICAgICAgICAgY2MuYmFja2dyb3VuZCA9ICdub25lJ1xyXG5cclxuICAgICAgICBzWzBdLmJhY2tncm91bmQgPSAnbm9uZSc7XHJcbiAgICAgICAgc1sxXS5iYWNrZ3JvdW5kID0gY2MuZ3JvdXBzXHJcbiAgICAgICAgc1syXS5iYWNrZ3JvdW5kID0gY2MuZ3JvdXBzXHJcblxyXG4gICAgICAgIGlmKCBjYy5nYm9yZGVyICE9PSAnbm9uZScgKXtcclxuICAgICAgICAgICAgc1sxXS5ib3JkZXIgPSBjYy5ib3JkZXJTaXplKydweCBzb2xpZCAnKyBjYy5nYm9yZGVyXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdGhpcy5yYWRpdXMgIT09IDAgKXtcclxuXHJcbiAgICAgICAgICAgIHNbMV0uYm9yZGVyUmFkaXVzID0gdGhpcy5yYWRpdXMrJ3B4J1xyXG4gICAgICAgICAgICBzWzJdLmJvcmRlclJhZGl1cyA9IHRoaXMucmFkaXVzKydweCdcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKmxldCBpID0gdGhpcy51aXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgICAgIHRoaXMudWlzW2ldLnNldEJHKCAnbm9uZScgKTtcclxuICAgICAgICAgICAgLy90aGlzLnVpc1tpXS5zZXRCRyggdGhpcy5jb2xvcnMuYmFja2dyb3VuZCApO1xyXG4gICAgICAgIH0qL1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXN0Wm9uZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9ICcnO1xyXG5cclxuICAgICAgICBpZiggbC55IDwgdGhpcy5iYXNlSCArIHRoaXMubWFyZ2luICkgbmFtZSA9ICd0aXRsZSc7XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmlzT3BlbiApIG5hbWUgPSAnY29udGVudCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKG5hbWUpXHJcblxyXG4gICAgICAgIHJldHVybiBuYW1lO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBjbGVhclRhcmdldCAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmN1cnJlbnQgPT09IC0xICkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGlmKCB0aGlzLnByb3RvLnMgKXtcclxuICAgICAgICAgICAgLy8gaWYgbm8gcyB0YXJnZXQgaXMgZGVsZXRlICEhXHJcbiAgICAgICAgICAgIHRoaXMucHJvdG8udWlvdXQoKTtcclxuICAgICAgICAgICAgdGhpcy5wcm90by5yZXNldCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnByb3RvID0gbnVsbDtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSAtMTtcclxuICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2xlYXJUYXJnZXQoKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGhhbmRsZUV2ZW50ICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IHR5cGUgPSBlLnR5cGU7XHJcblxyXG4gICAgICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcclxuICAgICAgICBsZXQgcHJvdG9DaGFuZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCAhbmFtZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgc3dpdGNoKCBuYW1lICl7XHJcblxyXG4gICAgICAgICAgICBjYXNlICdjb250ZW50JzpcclxuXHJcbiAgICAgICAgICAgIC8vdGhpcy5jdXJzb3IoKVxyXG5cclxuICAgICAgICAgICAgLy9pZiggdGhpcy5tYXJnaW5EaXYgKSBlLmNsaWVudFkgLT0gdGhpcy5tYXJnaW4gKiAwLjVcclxuXHJcbiAgICAgICAgICAgIGlmKCBSb290cy5pc01vYmlsZSAmJiB0eXBlID09PSAnbW91c2Vkb3duJyApIHRoaXMuZ2V0TmV4dCggZSwgY2hhbmdlIClcclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLnByb3RvICl7IFxyXG4gICAgICAgICAgICAgICAgLy9lLmNsaWVudFkgLT0gdGhpcy5tYXJnaW5cclxuICAgICAgICAgICAgICAgIHByb3RvQ2hhbmdlID0gdGhpcy5wcm90by5oYW5kbGVFdmVudCggZSApXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKCAhUm9vdHMubG9jayApIHRoaXMuZ2V0TmV4dCggZSwgY2hhbmdlIClcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICd0aXRsZSc6XHJcbiAgICAgICAgICAgIC8vdGhpcy5jdXJzb3IoIHRoaXMuaXNPcGVuID8gJ24tcmVzaXplJzoncy1yZXNpemUnICk7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJylcclxuICAgICAgICAgICAgaWYoIHR5cGUgPT09ICdtb3VzZWRvd24nICl7XHJcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5pc09wZW4gKSB0aGlzLmNsb3NlKClcclxuICAgICAgICAgICAgICAgIGVsc2UgdGhpcy5vcGVuKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICkgY2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICBpZiggcHJvdG9DaGFuZ2UgKSBjaGFuZ2UgPSB0cnVlO1xyXG5cclxuICAgICAgICByZXR1cm4gY2hhbmdlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBnZXROZXh0ICggZSwgY2hhbmdlICkge1xyXG5cclxuICAgICAgICBsZXQgbmV4dCA9IFJvb3RzLmZpbmRUYXJnZXQoIHRoaXMudWlzLCBlICk7XHJcblxyXG4gICAgICAgIGlmKCBuZXh0ICE9PSB0aGlzLmN1cnJlbnQgKXtcclxuICAgICAgICAgICAgdGhpcy5jbGVhclRhcmdldCgpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBuZXh0O1xyXG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG5leHQgIT09IC0xICl7IFxyXG4gICAgICAgICAgICB0aGlzLnByb3RvICA9IHRoaXMudWlzWyB0aGlzLmN1cnJlbnQgXTtcclxuICAgICAgICAgICAgdGhpcy5wcm90by51aW92ZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBcclxuXHJcbiAgICBhZGQoKSB7XHJcblxyXG4gICAgICAgIGxldCBhID0gYXJndW1lbnRzO1xyXG5cclxuICAgICAgICBpZiggdHlwZW9mIGFbMV0gPT09ICdvYmplY3QnICl7IFxyXG4gICAgICAgICAgICBhWzFdLmlzVUkgPSB0aGlzLmlzVUlcclxuICAgICAgICAgICAgYVsxXS50YXJnZXQgPSB0aGlzLmNbMl1cclxuICAgICAgICAgICAgYVsxXS5tYWluID0gdGhpcy5tYWluXHJcbiAgICAgICAgICAgIGFbMV0uZ3JvdXAgPSB0aGlzXHJcbiAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnc3RyaW5nJyApe1xyXG4gICAgICAgICAgICBpZiggYVsyXSA9PT0gdW5kZWZpbmVkICkgW10ucHVzaC5jYWxsKCBhLCB7IGlzVUk6dHJ1ZSwgdGFyZ2V0OnRoaXMuY1syXSwgbWFpbjp0aGlzLm1haW4gfSk7XHJcbiAgICAgICAgICAgIGVsc2V7IFxyXG4gICAgICAgICAgICAgICAgYVsyXS5pc1VJID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGFbMl0udGFyZ2V0ID0gdGhpcy5jWzJdO1xyXG4gICAgICAgICAgICAgICAgYVsyXS5tYWluID0gdGhpcy5tYWluO1xyXG4gICAgICAgICAgICAgICAgYVsyXS5ncm91cCA9IHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB1ID0gdGhpcy5BREQuYXBwbHkoIHRoaXMsIGEgKVxyXG5cclxuICAgICAgICBpZiggdS5pc0dyb3VwICl7IFxyXG4gICAgICAgICAgICAvL28uYWRkID0gYWRkO1xyXG4gICAgICAgICAgICB1LmR4ID0gOFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvL3UuZHggKz0gNFxyXG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy5kZWNhbClcclxuICAgICAgICAvL3Uuem9uZS5kIC09IDhcclxuICAgICAgICBSb290cy5mb3JjZVpvbmUgPSB0cnVlXHJcbiAgICAgICAgLy91Lm1hcmdpbiArPSB0aGlzLm1hcmdpblxyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKCB1Lm1hcmdpbiApXHJcbiAgICAgICAgLy9Sb290cy5uZWVkUmVab25lID0gdHJ1ZVxyXG5cclxuICAgICAgICAvL1Jvb3RzLnJlc2l6ZSgpXHJcbiAgICAgICAgIC8vY29uc29sZS5sb2coUm9vdHMubmVlZFJlc2l6ZSlcclxuXHJcbiAgICAgICAgdGhpcy51aXMucHVzaCggdSApXHJcblxyXG4gICAgICAgIHRoaXMuaXNFbXB0eSA9IGZhbHNlXHJcblxyXG4gICAgICAgIHJldHVybiB1O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyByZW1vdmUgb25lIG5vZGVcclxuXHJcbiAgICByZW1vdmUgKCBuICkge1xyXG5cclxuICAgICAgICBpZiggbi5kaXNwb3NlICkgbi5kaXNwb3NlKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNsZWFyIGFsbCBpbmVyIFxyXG5cclxuICAgIGRpc3Bvc2UoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2xlYXIoKVxyXG4gICAgICAgIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYygpXHJcbiAgICAgICAgc3VwZXIuZGlzcG9zZSgpXHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyKCkge1xyXG5cclxuICAgICAgICB0aGlzLmVtcHR5KClcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZW1wdHkgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmNsb3NlKCk7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy51aXMubGVuZ3RoLCBpdGVtO1xyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgICAgIGl0ZW0gPSB0aGlzLnVpcy5wb3AoKVxyXG4gICAgICAgICAgICB0aGlzLmNbMl0ucmVtb3ZlQ2hpbGQoIGl0ZW0uY1swXSApXHJcbiAgICAgICAgICAgIGl0ZW0uY2xlYXIoIHRydWUgKVxyXG5cclxuICAgICAgICAgICAgLy90aGlzLnVpc1tpXS5jbGVhcigpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmlzRW1wdHkgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaCA9IHRoaXMuYmFzZUg7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNsZWFyIG9uZSBlbGVtZW50XHJcblxyXG4gICAgY2xlYXJPbmUgKCBuICkgeyBcclxuXHJcbiAgICAgICAgbGV0IGlkID0gdGhpcy51aXMuaW5kZXhPZiggbiApO1xyXG5cclxuICAgICAgICBpZiAoIGlkICE9PSAtMSApIHtcclxuICAgICAgICAgICAgdGhpcy5jYWxjKCAtICggdGhpcy51aXNbIGlkIF0uaCArIHRoaXMubWFyZ2luICkgKVxyXG4gICAgICAgICAgICB0aGlzLmNbMl0ucmVtb3ZlQ2hpbGQoIHRoaXMudWlzWyBpZCBdLmNbMF0gKVxyXG4gICAgICAgICAgICB0aGlzLnVpcy5zcGxpY2UoIGlkLCAxIClcclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLnVpcy5sZW5ndGggPT09IDAgKXsgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzRW1wdHkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBcclxuXHJcbiAgICBvcGVuICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIub3BlbigpXHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgdGhpcy5zdmdzLmcyIClcclxuICAgICAgICB0aGlzLnJTaXplQ29udGVudCgpXHJcblxyXG4gICAgICAgIC8vbGV0IHQgPSB0aGlzLmggLSB0aGlzLmJhc2VIXHJcblxyXG4gICAgICAgIGNvbnN0IHMgPSB0aGlzLnNcclxuICAgICAgICBjb25zdCBjYyA9IHRoaXMuY29sb3JzXHJcblxyXG4gICAgICAgIC8vc1syXS50b3AgPSAodGhpcy5oLTEpICsgJ3B4J1xyXG4gICAgICAgIHNbMl0udG9wID0gKHRoaXMuaCt0aGlzLm10b3ApICsgJ3B4J1xyXG4gICAgICAgIHNbNF0uYmFja2dyb3VuZCA9IGNjLmdyb3Vwcy8vJyMwZjAnXHJcblxyXG4gICAgICAgIGlmKHRoaXMucmFkaXVzKXtcclxuXHJcbiAgICAgICAgICAgIHNbMV0uYm9yZGVyUmFkaXVzID0gJzBweCdcclxuICAgICAgICAgICAgc1syXS5ib3JkZXJSYWRpdXMgPSAnMHB4J1xyXG5cclxuICAgICAgICAgICAgc1sxXS5ib3JkZXJUb3BMZWZ0UmFkaXVzID0gdGhpcy5yYWRpdXMrJ3B4J1xyXG4gICAgICAgICAgICBzWzFdLmJvcmRlclRvcFJpZ2h0UmFkaXVzID0gdGhpcy5yYWRpdXMrJ3B4J1xyXG4gICAgICAgICAgICBzWzJdLmJvcmRlckJvdHRvbUxlZnRSYWRpdXMgPSB0aGlzLnJhZGl1cysncHgnXHJcbiAgICAgICAgICAgIHNbMl0uYm9yZGVyQm90dG9tUmlnaHRSYWRpdXMgPSB0aGlzLnJhZGl1cysncHgnXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggY2MuZ2JvcmRlciAhPT0gJ25vbmUnICl7XHJcblxyXG4gICAgICAgICAgICBzWzRdLmJvcmRlckxlZnQgPSBjYy5ib3JkZXJTaXplKydweCBzb2xpZCAnKyBjYy5nYm9yZGVyXHJcbiAgICAgICAgICAgIHNbNF0uYm9yZGVyUmlnaHQgPSBjYy5ib3JkZXJTaXplKydweCBzb2xpZCAnKyBjYy5nYm9yZGVyXHJcblxyXG4gICAgICAgICAgICBzWzJdLmJvcmRlciA9IGNjLmJvcmRlclNpemUrJ3B4IHNvbGlkICcrIGNjLmdib3JkZXJcclxuICAgICAgICAgICAgc1syXS5ib3JkZXJUb3AgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIHNbMV0uYm9yZGVyQm90dG9tID0gY2MuYm9yZGVyU2l6ZSsncHggc29saWQgcmdiYSgwLDAsMCwwKSdcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGFyZW50SGVpZ2h0KClcclxuXHJcbiAgICAgICAgLy9Sb290cy5pc0xlYXZlID0gdHJ1ZVxyXG4gICAgICAgIC8vUm9vdHMubmVlZFJlc2l6ZSA9IHRydWVcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5jbG9zZSgpXHJcblxyXG4gICAgICAgIC8vbGV0IHQgPSB0aGlzLmggLSB0aGlzLmJhc2VIXHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgdGhpcy5zdmdzLmcxIClcclxuXHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5iYXNlSFxyXG5cclxuICAgICAgICBjb25zdCBzID0gdGhpcy5zXHJcbiAgICAgICAgY29uc3QgY2MgPSB0aGlzLmNvbG9yc1xyXG4gICAgICAgIFxyXG4gICAgICAgIHNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4J1xyXG4gICAgICAgIC8vc1sxXS5oZWlnaHQgPSAodGhpcy5oLTIpICsgJ3B4J1xyXG4gICAgICAgIC8vc1syXS50b3AgPSB0aGlzLmggKyAncHgnXHJcbiAgICAgICAgc1syXS50b3AgPSAodGhpcy5oK3RoaXMubXRvcCkgKyAncHgnXHJcbiAgICAgICAgc1s0XS5iYWNrZ3JvdW5kID0gJ25vbmUnXHJcblxyXG4gICAgICAgIGlmKCBjYy5nYm9yZGVyICE9PSAnbm9uZScgKXtcclxuXHJcbiAgICAgICAgICAgIHNbNF0uYm9yZGVyID0gJ25vbmUnXHJcbiAgICAgICAgICAgIHNbMl0uYm9yZGVyID0gJ25vbmUnXHJcbiAgICAgICAgICAgIHNbMV0uYm9yZGVyID0gY2MuYm9yZGVyU2l6ZSsncHggc29saWQgJysgY2MuZ2JvcmRlclxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodGhpcy5yYWRpdXMpIHNbMV0uYm9yZGVyUmFkaXVzID0gdGhpcy5yYWRpdXMrJ3B4J1xyXG5cclxuICAgICAgICB0aGlzLnBhcmVudEhlaWdodCgpXHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNhbGNVaXMgKCkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNPcGVuIHx8IHRoaXMuaXNFbXB0eSApIHRoaXMuaCA9IHRoaXMuYmFzZUhcclxuICAgICAgICAvL2Vsc2UgdGhpcy5oID0gUm9vdHMuY2FsY1VpcyggdGhpcy51aXMsIHRoaXMuem9uZSwgdGhpcy56b25lLnkgKyB0aGlzLmJhc2VIICkgKyB0aGlzLmJhc2VIO1xyXG4gICAgICAgIGVsc2UgdGhpcy5oID0gUm9vdHMuY2FsY1VpcyggWy4uLnRoaXMudWlzLCB0aGlzLnNwYWNlWSBdLCB0aGlzLnpvbmUsIHRoaXMuem9uZS55ICsgdGhpcy5iYXNlSCArIHRoaXMubWFyZ2luLCB0cnVlICkgKyB0aGlzLmJhc2VIXHJcblxyXG4gICAgICAgIHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnXHJcbiAgICAgICAgdGhpcy5zWzJdLmhlaWdodCA9KCB0aGlzLmggLSB0aGlzLmJhc2VIICkrICdweCdcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcGFyZW50SGVpZ2h0ICggdCApIHtcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLmdyb3VwICE9PSBudWxsICkgdGhpcy5ncm91cC5jYWxjKCB0IClcclxuICAgICAgICBlbHNlIGlmICggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNhbGMoIHQgKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBjYWxjICggeSApIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzT3BlbiApIHJldHVyblxyXG4gICAgICAgIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYygpXHJcbiAgICAgICAgZWxzZSB0aGlzLmNhbGNVaXMoKVxyXG4gICAgICAgIHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnXHJcbiAgICAgICAgdGhpcy5zWzJdLmhlaWdodCA9IHRoaXMuaCArICdweCdcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemVDb250ZW50ICgpIHtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLnVpcy5sZW5ndGhcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICB0aGlzLnVpc1tpXS5zZXRTaXplKCB0aGlzLncgKVxyXG4gICAgICAgICAgICB0aGlzLnVpc1tpXS5yU2l6ZSgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKClcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnNcclxuXHJcbiAgICAgICAgdGhpcy53ID0gdGhpcy53IC0gdGhpcy5kZWNhbFxyXG5cclxuICAgICAgICBzWzNdLmxlZnQgPSAoIHRoaXMuc2EgKyB0aGlzLnNiIC0gNiApICsgJ3B4J1xyXG5cclxuICAgICAgICBzWzFdLndpZHRoID0gdGhpcy53ICsgJ3B4J1xyXG4gICAgICAgIHNbMl0ud2lkdGggPSB0aGlzLncgKyAncHgnXHJcbiAgICAgICAgc1sxXS5sZWZ0ID0gKHRoaXMuZGVjYWwpICsgJ3B4J1xyXG4gICAgICAgIHNbMl0ubGVmdCA9ICh0aGlzLmRlY2FsKSArICdweCdcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNPcGVuICkgdGhpcy5yU2l6ZUNvbnRlbnQoKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvL1xyXG4vKlxyXG4gICAgdWlvdXQoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmxvY2sgKSByZXR1cm47XHJcbiAgICAgICAgaWYoIXRoaXMub3ZlckVmZmVjdCkgcmV0dXJuO1xyXG4gICAgICAgIGlmKHRoaXMucykgdGhpcy5zWzBdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5iYWNrZ3JvdW5kO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1aW92ZXIoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmxvY2sgKSByZXR1cm47XHJcbiAgICAgICAgaWYoIXRoaXMub3ZlckVmZmVjdCkgcmV0dXJuO1xyXG4gICAgICAgIC8vaWYoIHRoaXMuaXNPcGVuICkgcmV0dXJuO1xyXG4gICAgICAgIGlmKHRoaXMucykgdGhpcy5zWzBdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5iYWNrZ3JvdW5kT3ZlcjtcclxuXHJcbiAgICB9XHJcbiovXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8uanMnO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gJy4uL2NvcmUvVjIuanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEpveXN0aWNrIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMuYXV0b1dpZHRoID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSBbMCwwXTtcclxuXHJcbiAgICAgICAgdGhpcy5taW53ICA9IHRoaXMud1xyXG4gICAgICAgIHRoaXMuZGlhbSA9IG8uZGlhbSB8fCB0aGlzLncgXHJcblxyXG4gICAgICAgIHRoaXMuam95VHlwZSA9ICdhbmFsb2dpcXVlJztcclxuICAgICAgICB0aGlzLm1vZGVsID0gby5tb2RlICE9PSB1bmRlZmluZWQgPyBvLm1vZGUgOiAwO1xyXG5cclxuICAgICAgICB0aGlzLnByZWNpc2lvbiA9IG8ucHJlY2lzaW9uIHx8IDI7XHJcbiAgICAgICAgdGhpcy5tdWx0aXBsaWNhdG9yID0gby5tdWx0aXBsaWNhdG9yIHx8IDE7XHJcblxyXG4gICAgICAgIHRoaXMucG9zID0gbmV3IFYyKCk7XHJcbiAgICAgICAgdGhpcy50bXAgPSBuZXcgVjIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnRlcnZhbCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5jWzBdLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgICAgICAgdGhpcy5oYXZlVGV4dCA9IG8udGV4dCAhPT0gdW5kZWZpbmVkID8gby50ZXh0IDogdHJ1ZSBcclxuXHJcbiAgICAgICAgLy90aGlzLnJhZGl1cyA9IHRoaXMudyAqIDAuNTtcclxuICAgICAgICAvL3RoaXMuZGlzdGFuY2UgPSB0aGlzLnJhZGl1cyowLjI1O1xyXG4gICAgICAgIHRoaXMuZGlzdGFuY2UgPSAodGhpcy5kaWFtKjAuNSkqMC4yNTtcclxuXHJcbiAgICAgICAgdGhpcy5oID0gby5oIHx8IHRoaXMudyArICh0aGlzLmhhdmVUZXh0ID8gMTAgOiAwKTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzBdLnN0eWxlLndpZHRoID0gdGhpcy53ICsncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jWzFdICE9PSB1bmRlZmluZWQgKSB7IC8vIHdpdGggdGl0bGVcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS5zdHlsZS53aWR0aCA9ICcxMDAlJztcclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLmp1c3RpZnlDb250ZW50ID0gJ2NlbnRlcic7XHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gMTA7XHJcbiAgICAgICAgICAgIHRoaXMuaCArPSAxMDtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgY2MgPSB0aGlzLmNvbG9yc1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICdqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOyB0b3A6JysodGhpcy5oLTIwKSsncHg7IHdpZHRoOjEwMCU7IGNvbG9yOicrIGNjLnRleHQgKTtcclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLmhhdmVUZXh0ID8gdGhpcy52YWx1ZSA6ICcnO1xyXG5cclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmdldEpveXN0aWNrKCB0aGlzLm1vZGVsICk7XHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3ZpZXdCb3gnLCAnMCAwICcrdGhpcy5kaWFtKycgJyt0aGlzLmRpYW0gKTtcclxuICAgICAgICB0aGlzLnNldENzcyggdGhpcy5jWzNdLCB7IHdpZHRoOnRoaXMuZGlhbSwgaGVpZ2h0OnRoaXMuZGlhbSwgbGVmdDowLCB0b3A6dGhpcy50b3AgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubW9kZSgwKVxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5yYXRpbyA9IDEyOC90aGlzLnc7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZShmYWxzZSk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZSAoIG1vZGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBjYyA9IHRoaXMuY29sb3JzXHJcblxyXG4gICAgICAgIHN3aXRjaChtb2RlKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLm1vZGVsPT09MCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwnLCAndXJsKCNncmFkSW4pJywgNCApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCAnIzAwMCcsIDQgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIGNjLmpveU91dCwgMiApO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsICdyZ2IoMCwwLDAsMC4xKScsIDMgKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgY2Muam95T3V0LCA0ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwnLCAnbm9uZScsIDQgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLm1vZGVsPT09MCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwnLCAndXJsKCNncmFkSW4yKScsIDQgKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgJ3JnYmEoMCwwLDAsMCknLCA0ICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCBjYy5qb3lPdmVyLCAyICk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgJ3JnYigwLDAsMCwwLjMpJywgMyApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCBjYy5qb3lTZWxlY3QsIDQgKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsIGNjLmpveU92ZXIsIDQgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjogLy8gZWRpdFxyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgYWRkSW50ZXJ2YWwgKCl7XHJcbiAgICAgICAgaWYoIHRoaXMuaW50ZXJ2YWwgIT09IG51bGwgKSB0aGlzLnN0b3BJbnRlcnZhbCgpO1xyXG4gICAgICAgIGlmKCB0aGlzLnBvcy5pc1plcm8oKSApIHJldHVybjtcclxuICAgICAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwoIGZ1bmN0aW9uKCl7IHRoaXMudXBkYXRlKCk7IH0uYmluZCh0aGlzKSwgMTAgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc3RvcEludGVydmFsICgpe1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pbnRlcnZhbCA9PT0gbnVsbCApIHJldHVybjtcclxuICAgICAgICBjbGVhckludGVydmFsKCB0aGlzLmludGVydmFsICk7XHJcbiAgICAgICAgdGhpcy5pbnRlcnZhbCA9IG51bGw7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRJbnRlcnZhbCgpO1xyXG4gICAgICAgIHRoaXMubW9kZSgwKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkSW50ZXJ2YWwoKTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgdGhpcy5tb2RlKCAyICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMubW9kZSgxKTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzRG93biApIHJldHVybjtcclxuXHJcbiAgICAgICAgLy90aGlzLnRtcC54ID0gdGhpcy5yYWRpdXMgLSAoIGUuY2xpZW50WCAtIHRoaXMuem9uZS54ICk7XHJcbiAgICAgICAgLy90aGlzLnRtcC55ID0gdGhpcy5yYWRpdXMgLSAoIGUuY2xpZW50WSAtIHRoaXMuem9uZS55IC0gdGhpcy50b3AgKTtcclxuXHJcbiAgICAgICAgdGhpcy50bXAueCA9ICh0aGlzLncqMC41KSAtICggZS5jbGllbnRYIC0gdGhpcy56b25lLnggKTtcclxuICAgICAgICB0aGlzLnRtcC55ID0gKHRoaXMuZGlhbSowLjUpIC0gKCBlLmNsaWVudFkgLSB0aGlzLnpvbmUueSAtIHRoaXMueXRvcCApO1xyXG5cclxuICAgICAgICBsZXQgZGlzdGFuY2UgPSB0aGlzLnRtcC5sZW5ndGgoKTtcclxuXHJcbiAgICAgICAgaWYgKCBkaXN0YW5jZSA+IHRoaXMuZGlzdGFuY2UgKSB7XHJcbiAgICAgICAgICAgIGxldCBhbmdsZSA9IE1hdGguYXRhbjIodGhpcy50bXAueCwgdGhpcy50bXAueSk7XHJcbiAgICAgICAgICAgIHRoaXMudG1wLnggPSBNYXRoLnNpbiggYW5nbGUgKSAqIHRoaXMuZGlzdGFuY2U7XHJcbiAgICAgICAgICAgIHRoaXMudG1wLnkgPSBNYXRoLmNvcyggYW5nbGUgKSAqIHRoaXMuZGlzdGFuY2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBvcy5jb3B5KCB0aGlzLnRtcCApLmRpdmlkZVNjYWxhciggdGhpcy5kaXN0YW5jZSApLm5lZ2F0ZSgpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRWYWx1ZSAoIHYgKSB7XHJcblxyXG4gICAgICAgIGlmKHY9PT11bmRlZmluZWQpIHY9WzAsMF07XHJcblxyXG4gICAgICAgIHRoaXMucG9zLnNldCggdlswXSB8fCAwLCB2WzFdICB8fCAwICk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTVkcoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlICggdXAgKSB7XHJcblxyXG4gICAgICAgIGlmKCB1cCA9PT0gdW5kZWZpbmVkICkgdXAgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pbnRlcnZhbCAhPT0gbnVsbCApe1xyXG5cclxuICAgICAgICAgICAgaWYoICF0aGlzLmlzRG93biApe1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucG9zLmxlcnAoIG51bGwsIDAuMyApO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucG9zLnggPSBNYXRoLmFicyggdGhpcy5wb3MueCApIDwgMC4wMSA/IDAgOiB0aGlzLnBvcy54O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3MueSA9IE1hdGguYWJzKCB0aGlzLnBvcy55ICkgPCAwLjAxID8gMCA6IHRoaXMucG9zLnk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuaXNVSSAmJiB0aGlzLm1haW4uaXNDYW52YXMgKSB0aGlzLm1haW4uZHJhdygpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlU1ZHKCk7XHJcblxyXG4gICAgICAgIGlmKCB1cCApIHRoaXMuc2VuZCgpO1xyXG4gICAgICAgIFxyXG5cclxuICAgICAgICBpZiggdGhpcy5wb3MuaXNaZXJvKCkgKSB0aGlzLnN0b3BJbnRlcnZhbCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVTVkcgKCkge1xyXG5cclxuICAgICAgICAvL2xldCB4ID0gdGhpcy5yYWRpdXMgLSAoIC10aGlzLnBvcy54ICogdGhpcy5kaXN0YW5jZSApO1xyXG4gICAgICAgIC8vbGV0IHkgPSB0aGlzLnJhZGl1cyAtICggLXRoaXMucG9zLnkgKiB0aGlzLmRpc3RhbmNlICk7XHJcblxyXG4gICAgICAgIGxldCB4ID0gKHRoaXMuZGlhbSowLjUpIC0gKCAtdGhpcy5wb3MueCAqIHRoaXMuZGlzdGFuY2UgKTtcclxuICAgICAgICBsZXQgeSA9ICh0aGlzLmRpYW0qMC41KSAtICggLXRoaXMucG9zLnkgKiB0aGlzLmRpc3RhbmNlICk7XHJcblxyXG4gICAgICAgIGlmKHRoaXMubW9kZWwgPT09IDApe1xyXG5cclxuICAgICAgICAgICAgbGV0IHN4ID0geCArICgodGhpcy5wb3MueCkqNSkgKyA1O1xyXG4gICAgICAgICAgICBsZXQgc3kgPSB5ICsgKCh0aGlzLnBvcy55KSo1KSArIDEwO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N4Jywgc3gqdGhpcy5yYXRpbywgMyApO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3knLCBzeSp0aGlzLnJhdGlvLCAzICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N4JywgeCp0aGlzLnJhdGlvLCAzICk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeScsIHkqdGhpcy5yYXRpbywgMyApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeCcsIHgqdGhpcy5yYXRpbywgNCApO1xyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeScsIHkqdGhpcy5yYXRpbywgNCApO1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlWzBdID0gICggdGhpcy5wb3MueCAqIHRoaXMubXVsdGlwbGljYXRvciApLnRvRml4ZWQoIHRoaXMucHJlY2lzaW9uICkgKiAxO1xyXG4gICAgICAgIHRoaXMudmFsdWVbMV0gPSAgKCB0aGlzLnBvcy55ICogdGhpcy5tdWx0aXBsaWNhdG9yICkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKSAqIDE7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuaGF2ZVRleHQpIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyICgpIHtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnN0b3BJbnRlcnZhbCgpO1xyXG4gICAgICAgIHN1cGVyLmNsZWFyKCk7XHJcblxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90by5qcyc7XHJcbmltcG9ydCB7IFRvb2xzIH0gZnJvbSAnLi4vY29yZS9Ub29scy5qcyc7XHJcbmltcG9ydCB7IFYyIH0gZnJvbSAnLi4vY29yZS9WMi5qcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgS25vYiBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLmlzQ3ljbGljID0gby5jeWNsaWMgfHwgZmFsc2U7XHJcbiAgICAgICAgdGhpcy5tb2RlbCA9IG8uc3R5cGUgfHwgMDtcclxuICAgICAgICBpZiggby5tb2RlICE9PSB1bmRlZmluZWQgKSB0aGlzLm1vZGVsID0gby5tb2RlO1xyXG5cclxuICAgICAgICB0aGlzLmF1dG9XaWR0aCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnNldFR5cGVOdW1iZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5taW53ICA9IHRoaXMud1xyXG4gICAgICAgIHRoaXMuZGlhbSA9IG8uZGlhbSB8fCB0aGlzLncgXHJcblxyXG4gICAgICAgIHRoaXMubVBJID0gTWF0aC5QSSAqIDAuODtcclxuICAgICAgICB0aGlzLnRvRGVnID0gMTgwIC8gTWF0aC5QSTtcclxuICAgICAgICB0aGlzLmNpclJhbmdlID0gdGhpcy5tUEkgKiAyO1xyXG5cclxuICAgICAgICB0aGlzLm9mZnNldCA9IG5ldyBWMigpO1xyXG5cclxuICAgICAgICB0aGlzLmggPSBvLmggfHwgdGhpcy53ICsgMTA7XHJcblxyXG4gICAgICAgIHRoaXMuY1swXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4J1xyXG4gICAgICAgIHRoaXMuY1swXS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG5cclxuICAgICAgICBpZih0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLndpZHRoID0gJzEwMCUnXHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS5zdHlsZS5qdXN0aWZ5Q29udGVudCA9ICdjZW50ZXInXHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gMTA7XHJcbiAgICAgICAgICAgIHRoaXMuaCArPSAxMDtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBlcmNlbnQgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmNtb2RlID0gMDtcclxuICAgICAgICBsZXQgY2MgPSB0aGlzLmNvbG9yc1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICdqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOyB0b3A6JysodGhpcy5oLTIwKSsncHg7IHdpZHRoOjEwMCU7IGNvbG9yOicrIGNjLnRleHQgKTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5nZXRLbm9iKCk7XHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwnLCBjYy5idXR0b24sIDAgKVxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCBjYy50ZXh0LCAxIClcclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgY2MudGV4dCwgMyApXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2QnLCB0aGlzLm1ha2VHcmFkKCksIDMgKVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICd2aWV3Qm94JywgJzAgMCAnICsgdGhpcy5kaWFtICsgJyAnICsgdGhpcy5kaWFtIClcclxuICAgICAgICB0aGlzLnNldENzcyggdGhpcy5jWzNdLCB7IHdpZHRoOnRoaXMuZGlhbSwgaGVpZ2h0OnRoaXMuZGlhbSwgbGVmdDowLCB0b3A6dGhpcy50b3AgfSlcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLm1vZGVsID4gMCApIHtcclxuXHJcbiAgICAgICAgICAgIFRvb2xzLmRvbSggJ3BhdGgnLCAnJywgeyBkOiAnJywgc3Ryb2tlOmNjLnRleHQsICdzdHJva2Utd2lkdGgnOiAyLCBmaWxsOiAnbm9uZScsICdzdHJva2UtbGluZWNhcCc6ICdyb3VuZCcgfSwgdGhpcy5jWzNdICk7IC8vNFxyXG5cclxuICAgICAgICAgICAgaWYgKCB0aGlzLm1vZGVsID09IDIpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBUb29scy5hZGRTVkdHbG93RWZmZWN0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3R5bGUnLCAnZmlsdGVyOiB1cmwoXCIjVUlMR2xvd1wiKTsnLCA0ICk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vZGUgKCBtb2RlICkge1xyXG5cclxuICAgICAgICBsZXQgY2MgPSB0aGlzLmNvbG9yc1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jbW9kZSA9PT0gbW9kZSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgc3dpdGNoKCBtb2RlICkge1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIHRoaXMuc1syXS5jb2xvciA9IGNjLnRleHQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsIGNjLmJ1dHRvbiwgMCk7XHJcbiAgICAgICAgICAgICAgICAvL3RoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCdyZ2JhKDI1NSwwLDAsMC4yKScsIDIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIGNjLnRleHQsIDEgKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogLy8gZG93blxyXG4gICAgICAgICAgICAgICAgdGhpcy5zWzJdLmNvbG9yID0gY2MudGV4dE92ZXI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsIGNjLnNlbGVjdCwgMCk7XHJcbiAgICAgICAgICAgICAgICAvL3RoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCdyZ2JhKDAsMCwwLDAuNiknLCAyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCBjYy50ZXh0T3ZlciwgMSApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY21vZGUgPSBtb2RlO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXN0Wm9uZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG4gICAgICAgIGlmKCBsLnkgPD0gdGhpcy5jWyAxIF0ub2Zmc2V0SGVpZ2h0ICkgcmV0dXJuICd0aXRsZSc7XHJcbiAgICAgICAgZWxzZSBpZiAoIGwueSA+IHRoaXMuaCAtIHRoaXMuY1sgMiBdLm9mZnNldEhlaWdodCApIHJldHVybiAndGV4dCc7XHJcbiAgICAgICAgZWxzZSByZXR1cm4gJ2tub2InO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2VuZEVuZCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZSgwKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IHRydWVcclxuICAgICAgICB0aGlzLm9sZCA9IHRoaXMudmFsdWVcclxuICAgICAgICB0aGlzLm9sZHIgPSBudWxsXHJcbiAgICAgICAgdGhpcy5tb3VzZW1vdmUoIGUgKVxyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGUoMSlcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzRG93biApIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IG9mZiA9IHRoaXMub2Zmc2V0O1xyXG5cclxuICAgICAgICAvL29mZi54ID0gdGhpcy5yYWRpdXMgLSAoIGUuY2xpZW50WCAtIHRoaXMuem9uZS54ICk7XHJcbiAgICAgICAgLy9vZmYueSA9IHRoaXMucmFkaXVzIC0gKCBlLmNsaWVudFkgLSB0aGlzLnpvbmUueSAtIHRoaXMudG9wICk7XHJcblxyXG4gICAgICAgIG9mZi54ID0gKHRoaXMudyowLjUpIC0gKCBlLmNsaWVudFggLSB0aGlzLnpvbmUueCApO1xyXG4gICAgICAgIG9mZi55ID0gKHRoaXMuZGlhbSowLjUpIC0gKCBlLmNsaWVudFkgLSB0aGlzLnpvbmUueSAtIHRoaXMueXRvcCApO1xyXG5cclxuICAgICAgICB0aGlzLnIgPSAtIE1hdGguYXRhbjIoIG9mZi54LCBvZmYueSApO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5vbGRyICE9PSBudWxsICkgdGhpcy5yID0gTWF0aC5hYnModGhpcy5yIC0gdGhpcy5vbGRyKSA+IE1hdGguUEkgPyB0aGlzLm9sZHIgOiB0aGlzLnI7XHJcblxyXG4gICAgICAgIHRoaXMuciA9IHRoaXMuciA+IHRoaXMubVBJID8gdGhpcy5tUEkgOiB0aGlzLnI7XHJcbiAgICAgICAgdGhpcy5yID0gdGhpcy5yIDwgLXRoaXMubVBJID8gLXRoaXMubVBJIDogdGhpcy5yO1xyXG5cclxuICAgICAgICBsZXQgc3RlcHMgPSAxIC8gdGhpcy5jaXJSYW5nZTtcclxuICAgICAgICBsZXQgdmFsdWUgPSAodGhpcy5yICsgdGhpcy5tUEkpICogc3RlcHM7XHJcblxyXG4gICAgICAgIGxldCBuID0gKCAoIHRoaXMucmFuZ2UgKiB2YWx1ZSApICsgdGhpcy5taW4gKSAtIHRoaXMub2xkO1xyXG5cclxuICAgICAgICBpZihuID49IHRoaXMuc3RlcCB8fCBuIDw9IHRoaXMuc3RlcCl7IFxyXG4gICAgICAgICAgICBuID0gTWF0aC5mbG9vciggbiAvIHRoaXMuc3RlcCApO1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5udW1WYWx1ZSggdGhpcy5vbGQgKyAoIG4gKiB0aGlzLnN0ZXAgKSApO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSggdHJ1ZSApO1xyXG4gICAgICAgICAgICB0aGlzLm9sZCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMub2xkciA9IHRoaXMucjtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHdoZWVsICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAna25vYicgKSB7XHJcbiAgICBcclxuICAgICAgICAgICAgbGV0IHYgPSB0aGlzLnZhbHVlIC0gdGhpcy5zdGVwICogZS5kZWx0YTtcclxuICAgIFxyXG4gICAgICAgICAgICBpZiAoIHYgPiB0aGlzLm1heCApIHtcclxuICAgICAgICAgICAgICAgIHYgPSB0aGlzLmlzQ3ljbGljID8gdGhpcy5taW4gOiB0aGlzLm1heDtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICggdiA8IHRoaXMubWluICkge1xyXG4gICAgICAgICAgICAgICAgdiA9IHRoaXMuaXNDeWNsaWMgPyB0aGlzLm1heCA6IHRoaXMubWluO1xyXG4gICAgICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICAgICAgdGhpcy5zZXRWYWx1ZSggdiApO1xyXG4gICAgICAgICAgICB0aGlzLm9sZCA9IHY7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCB0cnVlICk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1ha2VHcmFkICgpIHtcclxuXHJcbiAgICAgICAgbGV0IGQgPSAnJywgc3RlcCwgcmFuZ2UsIGEsIHgsIHksIHgyLCB5MiwgciA9IDY0O1xyXG4gICAgICAgIGxldCBzdGFydGFuZ2xlID0gTWF0aC5QSSArIHRoaXMubVBJO1xyXG4gICAgICAgIGxldCBlbmRhbmdsZSA9IE1hdGguUEkgLSB0aGlzLm1QSTtcclxuICAgICAgICAvL2xldCBzdGVwID0gdGhpcy5zdGVwPjUgPyB0aGlzLnN0ZXAgOiAxO1xyXG5cclxuICAgICAgICBpZih0aGlzLnN0ZXA+NSl7XHJcbiAgICAgICAgICAgIHJhbmdlID0gIHRoaXMucmFuZ2UgLyB0aGlzLnN0ZXA7XHJcbiAgICAgICAgICAgIHN0ZXAgPSAoIHN0YXJ0YW5nbGUgLSBlbmRhbmdsZSApIC8gcmFuZ2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3RlcCA9ICgoIHN0YXJ0YW5nbGUgLSBlbmRhbmdsZSApIC8gcikqMjtcclxuICAgICAgICAgICAgcmFuZ2UgPSByKjAuNTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8PSByYW5nZTsgKytpICkge1xyXG5cclxuICAgICAgICAgICAgYSA9IHN0YXJ0YW5nbGUgLSAoIHN0ZXAgKiBpICk7XHJcbiAgICAgICAgICAgIHggPSByICsgTWF0aC5zaW4oIGEgKSAqICggciAtIDIwICk7XHJcbiAgICAgICAgICAgIHkgPSByICsgTWF0aC5jb3MoIGEgKSAqICggciAtIDIwICk7XHJcbiAgICAgICAgICAgIHgyID0gciArIE1hdGguc2luKCBhICkgKiAoIHIgLSAyNCApO1xyXG4gICAgICAgICAgICB5MiA9IHIgKyBNYXRoLmNvcyggYSApICogKCByIC0gMjQgKTtcclxuICAgICAgICAgICAgZCArPSAnTScgKyB4ICsgJyAnICsgeSArICcgTCcgKyB4MiArICcgJyt5MiArICcgJztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlICggdXAgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgdGhpcy5wZXJjZW50ID0gKHRoaXMudmFsdWUgLSB0aGlzLm1pbikgLyB0aGlzLnJhbmdlO1xyXG5cclxuICAgICAgICBsZXQgc2EgPSBNYXRoLlBJICsgdGhpcy5tUEk7XHJcbiAgICAgICAgbGV0IGVhID0gKCAoIHRoaXMucGVyY2VudCAqIHRoaXMuY2lyUmFuZ2UgKSAtICggdGhpcy5tUEkgKSApO1xyXG5cclxuICAgICAgICBsZXQgc2luID0gTWF0aC5zaW4oIGVhICk7XHJcbiAgICAgICAgbGV0IGNvcyA9IE1hdGguY29zKCBlYSApO1xyXG5cclxuICAgICAgICBsZXQgeDEgPSAoIDI1ICogc2luICkgKyA2NDtcclxuICAgICAgICBsZXQgeTEgPSAtKCAyNSAqIGNvcyApICsgNjQ7XHJcbiAgICAgICAgbGV0IHgyID0gKCAyMCAqIHNpbiApICsgNjQ7XHJcbiAgICAgICAgbGV0IHkyID0gLSggMjAgKiBjb3MgKSArIDY0O1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsICdNICcgKyB4MSArJyAnICsgeTEgKyAnIEwgJyArIHgyICsnICcgKyB5MiwgMSApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICggdGhpcy5tb2RlbCA+IDAgKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgeDEgPSAzNiAqIE1hdGguc2luKCBzYSApICsgNjQ7XHJcbiAgICAgICAgICAgIGxldCB5MSA9IDM2ICogTWF0aC5jb3MoIHNhICkgKyA2NDtcclxuICAgICAgICAgICAgbGV0IHgyID0gMzYgKiBzaW4gKyA2NDtcclxuICAgICAgICAgICAgbGV0IHkyID0gLTM2ICogY29zICsgNjQ7XHJcbiAgICAgICAgICAgIGxldCBiaWcgPSBlYSA8PSBNYXRoLlBJIC0gdGhpcy5tUEkgPyAwIDogMTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2QnLCAnTSAnICsgeDEgKyAnLCcgKyB5MSArICcgQSAnICsgMzYgKyAnLCcgKyAzNiArICcgMSAnICsgYmlnICsgJyAxICcgKyB4MiArICcsJyArIHkyLCA0ICk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY29sb3IgPSBUb29scy5wYWNrKCBUb29scy5sZXJwQ29sb3IoIFRvb2xzLnVucGFjayggVG9vbHMuQ29sb3JMdW1hKCB0aGlzLmNvbG9ycy50ZXh0LCAtMC43NSkgKSwgVG9vbHMudW5wYWNrKCB0aGlzLmNvbG9ycy50ZXh0ICksIHRoaXMucGVyY2VudCApICk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCBjb2xvciwgNCApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHVwICkgdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvLmpzJztcclxuaW1wb3J0IHsgUm9vdHMgfSBmcm9tICcuLi9jb3JlL1Jvb3RzLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBMaXN0IGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIC8vIFRPRE8gbm90IHdvcmtcclxuICAgICAgICB0aGlzLmhpZGVDdXJyZW50ID0gZmFsc2VcclxuXHJcbiAgICAgICAgLy8gaW1hZ2VzXHJcbiAgICAgICAgdGhpcy5wYXRoID0gby5wYXRoIHx8ICcnO1xyXG4gICAgICAgIHRoaXMuZm9ybWF0ID0gby5mb3JtYXQgfHwgJyc7XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIHRoaXMuaXNXaXRoSW1hZ2UgPSB0aGlzLnBhdGggIT09ICcnID8gdHJ1ZTpmYWxzZTtcclxuICAgICAgICB0aGlzLnByZUxvYWRDb21wbGV0ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnRtcEltYWdlID0ge307XHJcbiAgICAgICAgdGhpcy50bXBVcmwgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5tID0gby5tICE9PSB1bmRlZmluZWQgPyBvLm0gOiA1XHJcblxyXG5cclxuICAgICAgICBsZXQgYWxpZ24gPSBvLmFsaWduIHx8ICdsZWZ0JztcclxuXHJcbiAgICAgICAgLy8gc2Nyb2xsIHNpemVcclxuICAgICAgICBsZXQgc3MgPSBvLnNjcm9sbFNpemUgfHwgMTBcclxuICAgICAgICB0aGlzLnNzID0gc3MrMVxyXG5cclxuICAgICAgICB0aGlzLnNNb2RlID0gMDtcclxuICAgICAgICB0aGlzLnRNb2RlID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0T25seSA9IG8ubGlzdE9ubHkgfHwgZmFsc2VcclxuICAgICAgICB0aGlzLnN0YXRpY1RvcCA9IG8uc3RhdGljVG9wIHx8IGZhbHNlXHJcblxyXG4gICAgICAgIHRoaXMuaXNTZWxlY3RhYmxlID0gdGhpcy5saXN0T25seVxyXG4gICAgICAgIGlmKCBvLnNlbGVjdCAhPT0gdW5kZWZpbmVkICkgby5zZWxlY3RhYmxlID0gby5zZWxlY3RcclxuICAgICAgICBpZiggby5zZWxlY3RhYmxlICE9PSB1bmRlZmluZWQgKSB0aGlzLmlzU2VsZWN0YWJsZSA9IG8uc2VsZWN0YWJsZVxyXG5cclxuICAgICAgICBpZiggdGhpcy50eHQgPT09ICcnICkgdGhpcy5wID0gMDtcclxuXHJcblxyXG4gICAgICAgIGxldCBmbHRvcCA9IE1hdGguZmxvb3IodGhpcy5oKjAuNSktMztcclxuICAgICAgICBsZXQgY2MgPSB0aGlzLmNvbG9yc1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3RvcDowOyBkaXNwbGF5Om5vbmU7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JyApO1xyXG4gICAgICAgIHRoaXMuY1szXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuaXRlbSArICdwYWRkaW5nOjBweCAnK3RoaXMubSsncHg7IG1hcmdpbi1ib3R0b206MHB4OyBwb3NpdGlvbjphYnNvbHV0ZTsganVzdGlmeS1jb250ZW50OicrYWxpZ24rJzsgdGV4dC1hbGlnbjonK2FsaWduKyc7IGxpbmUtaGVpZ2h0OicrKHRoaXMuaC00KSsncHg7IHRvcDoxcHg7IGJhY2tncm91bmQ6JytjYy5idXR0b24rJzsgaGVpZ2h0OicrKHRoaXMuaC0yKSsncHg7IGJvcmRlcjoxcHggc29saWQgJytjYy5ib3JkZXIrJzsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsnICk7XHJcbiAgICAgICAgdGhpcy5jWzRdID0gdGhpcy5kb20oICdwYXRoJywgdGhpcy5jc3MuYmFzaWMgKyAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOjZweDsgaGVpZ2h0OjZweDsgdG9wOicrZmx0b3ArJ3B4OycsIHsgZDp0aGlzLnN2Z3MuZzEsIGZpbGw6Y2MudGV4dCwgc3Ryb2tlOidub25lJ30pO1xyXG5cclxuICAgICAgICB0aGlzLnNjcm9sbGVyQmFjayA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAncmlnaHQ6MHB4OyB3aWR0aDonK3NzKydweDsgYmFja2dyb3VuZDonK2NjLmJhY2srJzsgZGlzcGxheTpub25lOycpO1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsZXIgPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3JpZ2h0OicrKChzcy0oc3MqMC4yNSkpKjAuNSkrJ3B4OyB3aWR0aDonKyhzcyowLjI1KSsncHg7IGJhY2tncm91bmQ6JytjYy50ZXh0Kyc7IGRpc3BsYXk6bm9uZTsgJyk7XHJcblxyXG4gICAgICAgIHRoaXMuY1szXS5zdHlsZS5jb2xvciA9IGNjLnRleHQ7XHJcblxyXG5cclxuICAgICAgICB0aGlzLmxpc3QgPSBbXVxyXG4gICAgICAgIHRoaXMucmVmT2JqZWN0ID0gbnVsbFxyXG5cclxuICAgICAgICBpZiggby5saXN0ICl7XHJcbiAgICAgICAgICAgIGlmKCBvLmxpc3QgaW5zdGFuY2VvZiBBcnJheSApe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5saXN0ID0gby5saXN0XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiggby5saXN0IGluc3RhbmNlb2YgT2JqZWN0ICl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlZk9iamVjdCA9IG8ubGlzdFxyXG4gICAgICAgICAgICAgICAgZm9yKCBsZXQgZyBpbiB0aGlzLnJlZk9iamVjdCApIHRoaXMubGlzdC5wdXNoKCBnIClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pdGVtcyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLnByZXZOYW1lID0gJyc7XHJcblxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudG1wSWQgPSAwXHJcblxyXG4gICAgICAgIHRoaXMuYmFzZUggPSB0aGlzLmg7XHJcblxyXG4gICAgICAgIHRoaXMuaXRlbUhlaWdodCA9IG8uaXRlbUhlaWdodCB8fCB0aGlzLmgvLyh0aGlzLmgtMyk7XHJcblxyXG4gICAgICAgIC8vIGZvcmNlIGZ1bGwgbGlzdCBcclxuICAgICAgICB0aGlzLmZ1bGwgPSBvLmZ1bGwgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMucHkgPSAwO1xyXG4gICAgICAgIHRoaXMud3cgPSB0aGlzLnNiO1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDtcclxuXHJcbiAgICAgICAgLy8gbGlzdCB1cCBvciBkb3duXHJcbiAgICAgICAgdGhpcy5zaWRlID0gby5zaWRlIHx8ICdkb3duJztcclxuICAgICAgICB0aGlzLnVwID0gdGhpcy5zaWRlID09PSAnZG93bicgPyAwIDogMTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMudXAgKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1syXS5zdHlsZS50b3AgPSAnYXV0byc7XHJcbiAgICAgICAgICAgIHRoaXMuY1szXS5zdHlsZS50b3AgPSAnYXV0byc7XHJcbiAgICAgICAgICAgIHRoaXMuY1s0XS5zdHlsZS50b3AgPSAnYXV0byc7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbMl0uc3R5bGUuYm90dG9tID0gdGhpcy5oLTIgKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbM10uc3R5bGUuYm90dG9tID0gJzFweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY1s0XS5zdHlsZS5ib3R0b20gPSBmbHRvcCArICdweCc7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuY1syXS5zdHlsZS50b3AgPSB0aGlzLmJhc2VIICsgJ3B4JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubGlzdEluID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICdsZWZ0OjA7IHRvcDowOyB3aWR0aDoxMDAlOyBiYWNrZ3JvdW5kOm5vbmU7Jyk7XHJcbiAgICAgICAgdGhpcy5saXN0SW4ubmFtZSA9ICdsaXN0JztcclxuXHJcbiAgICAgICAgdGhpcy50b3BMaXN0ID0gMDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNbMl0uYXBwZW5kQ2hpbGQoIHRoaXMubGlzdEluICk7XHJcbiAgICAgICAgdGhpcy5jWzJdLmFwcGVuZENoaWxkKCB0aGlzLnNjcm9sbGVyQmFjayApO1xyXG4gICAgICAgIHRoaXMuY1syXS5hcHBlbmRDaGlsZCggdGhpcy5zY3JvbGxlciApO1xyXG5cclxuICAgICAgICBpZiggby52YWx1ZSAhPT0gdW5kZWZpbmVkICl7XHJcbiAgICAgICAgICAgIGlmKCFpc05hTihvLnZhbHVlKSkgdGhpcy52YWx1ZSA9IHRoaXMubGlzdFsgby52YWx1ZSBdO1xyXG4gICAgICAgICAgICBlbHNlIHRoaXMudmFsdWUgPSBvLnZhbHVlO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5saXN0WzBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pc09wZW5PblN0YXJ0ID0gby5vcGVuIHx8IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5saXN0T25seSApe1xyXG4gICAgICAgICAgICB0aGlzLmJhc2VIID0gNTtcclxuICAgICAgICAgICAgdGhpcy5jWzNdLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIHRoaXMuY1s0XS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICB0aGlzLmNbMl0uc3R5bGUudG9wID0gdGhpcy5iYXNlSCsncHgnXHJcbiAgICAgICAgICAgIHRoaXMuaXNPcGVuT25TdGFydCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5taW5pQ2FudmFzID0gby5taW5pQ2FudmFzIHx8IGZhbHNlIFxyXG4gICAgICAgIHRoaXMuY2FudmFzQmcgPSBvLmNhbnZhc0JnIHx8ICdyZ2JhKDAsMCwwLDApJ1xyXG4gICAgICAgIHRoaXMuaW1hZ2VTaXplID0gby5pbWFnZVNpemUgfHwgWzIwLDIwXTtcclxuXHJcbiAgICAgICAgLy8gZHJhZ291dCBmdW5jdGlvblxyXG4gICAgICAgIHRoaXMuZHJhZyA9IG8uZHJhZyB8fCBmYWxzZVxyXG4gICAgICAgIHRoaXMuZHJhZ291dCA9IG8uZHJhZ291dCB8fCBmYWxzZVxyXG4gICAgICAgIHRoaXMuZHJhZ3N0YXJ0ID0gby5kcmFnc3RhcnQgfHwgbnVsbFxyXG4gICAgICAgIHRoaXMuZHJhZ2VuZCA9IG8uZHJhZ2VuZCB8fCBudWxsXHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICAvL3RoaXMuY1swXS5zdHlsZS5iYWNrZ3JvdW5kID0gJyNGRjAwMDAnXHJcbiAgICAgICAgLy8vaWYoIHRoaXMuaXNXaXRoSW1hZ2UgKSB0aGlzLnByZWxvYWRJbWFnZSgpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICB0aGlzLnNldExpc3QoIHRoaXMubGlzdCApO1xyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIGlmKCB0aGlzLmlzV2l0aEltYWdlICkgdGhpcy5wcmVsb2FkSW1hZ2UoKTtcclxuICAgICAgICBpZiggdGhpcy5pc09wZW5PblN0YXJ0ICkgdGhpcy5vcGVuKCB0cnVlIClcclxuXHJcbiAgICAgICAgdGhpcy5iYXNlSCArPSB0aGlzLm10b3BcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gaW1hZ2UgbGlzdFxyXG5cclxuICAgIHByZWxvYWRJbWFnZSAoKSB7XHJcblxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5wcmVMb2FkQ29tcGxldGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy50bXBJbWFnZSA9IHt9O1xyXG4gICAgICAgIGZvciggbGV0IGk9MDsgaTx0aGlzLmxpc3QubGVuZ3RoOyBpKysgKSB0aGlzLnRtcFVybC5wdXNoKCB0aGlzLmxpc3RbaV0gKTtcclxuICAgICAgICB0aGlzLmxvYWRPbmUoKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBuZXh0SW1nICgpIHtcclxuXHJcbiAgICAgICAgaWYodGhpcy5jID09PSBudWxsKSByZXR1cm5cclxuXHJcbiAgICAgICAgdGhpcy50bXBVcmwuc2hpZnQoKTtcclxuICAgICAgICBpZiggdGhpcy50bXBVcmwubGVuZ3RoID09PSAwICl7IFxyXG5cclxuICAgICAgICAgICAgdGhpcy5wcmVMb2FkQ29tcGxldGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGRJbWFnZXMoKTtcclxuICAgICAgICAgICAgLyp0aGlzLnNldExpc3QoIHRoaXMubGlzdCApO1xyXG4gICAgICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNPcGVuT25TdGFydCApIHRoaXMub3BlbigpOyovXHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHRoaXMubG9hZE9uZSgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBsb2FkT25lKCl7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpc1xyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50bXBVcmxbMF07XHJcbiAgICAgICAgbGV0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gICAgICAgIGltZy5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOmFic29sdXRlOyB3aWR0aDonK3NlbGYuaW1hZ2VTaXplWzBdKydweDsgaGVpZ2h0Oicrc2VsZi5pbWFnZVNpemVbMV0rJ3B4JztcclxuICAgICAgICBpbWcuc2V0QXR0cmlidXRlKCdzcmMnLCB0aGlzLnBhdGggKyBuYW1lICsgdGhpcy5mb3JtYXQgKTtcclxuXHJcbiAgICAgICAgaW1nLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW1hZ2VTaXplWzJdID0gaW1nLndpZHRoO1xyXG4gICAgICAgICAgICBzZWxmLmltYWdlU2l6ZVszXSA9IGltZy5oZWlnaHQ7XHJcbiAgICAgICAgICAgIHNlbGYudG1wSW1hZ2VbbmFtZV0gPSBpbWc7XHJcbiAgICAgICAgICAgIHNlbGYubmV4dEltZygpO1xyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy9cclxuXHJcbiAgICB0ZXN0Wm9uZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy51cCAmJiB0aGlzLmlzT3BlbiApe1xyXG4gICAgICAgICAgICBpZiggbC55ID4gdGhpcy5oIC0gdGhpcy5iYXNlSCApIHJldHVybiAndGl0bGUnO1xyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuc2Nyb2xsICYmICggbC54ID4gKHRoaXMuc2ErdGhpcy5zYi10aGlzLnNzKSkgKSByZXR1cm4gJ3Njcm9sbCc7XHJcbiAgICAgICAgICAgICAgICBpZihsLnggPiB0aGlzLnNhKSByZXR1cm4gdGhpcy50ZXN0SXRlbXMoIGwueS10aGlzLmJhc2VIICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYoIGwueSA8IHRoaXMuYmFzZUgrMiApIHJldHVybiAndGl0bGUnO1xyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuaXNPcGVuICl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoIHRoaXMuc2Nyb2xsICYmICggbC54ID4gKHRoaXMuc2ErdGhpcy5zYi10aGlzLnNzKSkgKSByZXR1cm4gJ3Njcm9sbCc7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobC54ID4gdGhpcy5zYSkgcmV0dXJuIHRoaXMudGVzdEl0ZW1zKCBsLnktdGhpcy5iYXNlSCApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXN0SXRlbXMgKCB5ICkge1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9ICcnO1xyXG5cclxuICAgICAgICBsZXQgaXRlbXMgPSB0aGlzLml0ZW1zXHJcblxyXG4gICAgICAgIC8qaWYodGhpcy5oaWRlQ3VycmVudCl7XHJcbiAgICAgICAgICAgIC8vaXRlbXMgPSBbLi4udGhpcy5pdGVtc11cclxuICAgICAgICAgICAgaXRlbXMgPSB0aGlzLml0ZW1zLnNsaWNlKHRoaXMudG1wSWQpXHJcblxyXG4gICAgICAgIH0qL1xyXG5cclxuICAgICAgICBsZXQgaSA9IGl0ZW1zLmxlbmd0aCwgaXRlbSwgYSwgYjtcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICBpdGVtID0gaXRlbXNbaV07XHJcbiAgICAgICAgICAgIGEgPSBpdGVtLnBvc3kgKyB0aGlzLnRvcExpc3Q7XHJcbiAgICAgICAgICAgIGIgPSBpdGVtLnBvc3kgKyB0aGlzLml0ZW1IZWlnaHQgKyAxICsgdGhpcy50b3BMaXN0O1xyXG4gICAgICAgICAgICBpZiggeSA+PSBhICYmIHkgPD0gYiApeyBcclxuICAgICAgICAgICAgICAgIG5hbWUgPSAnaXRlbScgKyBpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlSXRlbSgwKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gaXRlbTtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZUl0ZW0oMSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBuYW1lO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG5hbWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vZGVJdGVtICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmN1cnJlbnQgKSByZXR1cm5cclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY3VycmVudC5zZWxlY3QgJiYgbW9kZT09PTApIG1vZGUgPSAyXHJcbiAgICAgICAgbGV0IGNjID0gdGhpcy5jb2xvcnNcclxuXHJcbiAgICAgICAgc3dpdGNoKCBtb2RlICl7XHJcblxyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudC5zdHlsZS5iYWNrZ3JvdW5kID0gY2MuYmFja1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50LnN0eWxlLmNvbG9yID0gY2MudGV4dDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogLy8gb3ZlclxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50LnN0eWxlLmJhY2tncm91bmQgPSBjYy5vdmVyXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQuc3R5bGUuY29sb3IgPSBjYy50ZXh0T3ZlcjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjogLy8gZWRpdCAvIGRvd25cclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudC5zdHlsZS5iYWNrZ3JvdW5kID0gY2Muc2VsZWN0XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQuc3R5bGUuY29sb3IgPSBjYy50ZXh0U2VsZWN0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVuU2VsZWN0ZWQoKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5jdXJyZW50ICkgcmV0dXJuXHJcbiAgICAgICAgdGhpcy5tb2RlSXRlbSgwKVxyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IG51bGxcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2VsZWN0ZWQoKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5jdXJyZW50ICkgcmV0dXJuXHJcbiAgICAgICAgdGhpcy5yZXNldEl0ZW1zKClcclxuICAgICAgICB0aGlzLm1vZGVJdGVtKDIpXHJcbiAgICAgICAgdGhpcy5jdXJyZW50LnNlbGVjdCA9IHRydWVcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0SXRlbXMoKSB7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5pdGVtcy5sZW5ndGhcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICB0aGlzLml0ZW1zW2ldLnNlbGVjdCA9IGZhbHNlXHJcbiAgICAgICAgICAgIHRoaXMuaXRlbXNbaV0uc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmJhY2s7XHJcbiAgICAgICAgICAgIHRoaXMuaXRlbXNbaV0uc3R5bGUuY29sb3IgPSB0aGlzLmNvbG9ycy50ZXh0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgaGlkZUFjdGl2ZSgpIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmhpZGVDdXJyZW50ICkgcmV0dXJuXHJcbiAgICAgICAgLy9pZiggIXRoaXMuY3VycmVudCApIHJldHVyblxyXG4gICAgICAgIGlmKCB0aGlzLmN1cnJlbnQgKXRoaXMudG1wSWQgPSB0aGlzLmN1cnJlbnQuaWRcclxuICAgICAgICB0aGlzLnJlc2V0SGlkZSgpXHJcbiAgICAgICAgLy90aGlzLml0ZW1zW3RoaXMudG1wSWRdLnN0eWxlLmhlaWdodCA9IDArJ3B4J1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0SGlkZSgpIHtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy50bXBJZClcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLml0ZW1zLmxlbmd0aFxyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgICAgIGlmKGk9PT10aGlzLnRtcElkKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXNbaV0uc3R5bGUuaGVpZ2h0ID0gMCsncHgnXHJcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zW2ldLnBvc3kgPSAtMTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXNbaV0uc3R5bGUuaGVpZ2h0ID0gdGhpcy5pdGVtSGVpZ2h0KydweCdcclxuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXNbaV0ucG9zeSA9ICh0aGlzLml0ZW1IZWlnaHQrMSkqKGktMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy90aGlzLml0ZW1zW2ldLnN0eWxlLmRpc3BsYXkgPSAnZmxleCdcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8qdGhpcy5pdGVtc1tpXS5zZWxlY3QgPSBmYWxzZVxyXG4gICAgICAgICAgICB0aGlzLml0ZW1zW2ldLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5iYWNrO1xyXG4gICAgICAgICAgICB0aGlzLml0ZW1zW2ldLnN0eWxlLmNvbG9yID0gdGhpcy5jb2xvcnMudGV4dDsqL1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIW5hbWUgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAnc2Nyb2xsJyApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYoIG5hbWUgPT09ICd0aXRsZScgKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubW9kZVRpdGxlKDIpXHJcbiAgICAgICAgICAgIGlmKCAhdGhpcy5saXN0T25seSApe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlQWN0aXZlKClcclxuICAgICAgICAgICAgICAgIGlmKCAhdGhpcy5pc09wZW4gKSB0aGlzLm9wZW4oKVxyXG4gICAgICAgICAgICAgICAgZWxzZSB0aGlzLmNsb3NlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGlzIGl0ZW1cclxuICAgICAgICAgICAgaWYoIHRoaXMuY3VycmVudCApe1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmxpc3RbIHRoaXMuY3VycmVudC5pZCBdXHJcbiAgICAgICAgICAgICAgICAvL3RoaXMudG1wSWQgPSB0aGlzLmN1cnJlbnQuaWRcclxuXHJcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5pc1NlbGVjdGFibGUgKSB0aGlzLnNlbGVjdGVkKClcclxuXHJcbiAgICAgICAgICAgICAgICAvL3RoaXMuc2VuZCggdGhpcy5yZWZPYmplY3QgIT09IG51bGwgPyB0aGlzLnJlZk9iamVjdFsgdGhpcy5saXN0W3RoaXMuY3VycmVudC5pZF1dIDogdGhpcy52YWx1ZSApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kKCB0aGlzLnZhbHVlIClcclxuXHJcbiAgICAgICAgICAgICAgICBpZiggIXRoaXMubGlzdE9ubHkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRUb3BJdGVtKClcclxuICAgICAgICAgICAgICAgICAgICAvL3RoaXMuaGlkZUFjdGl2ZSgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IG51cCA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIW5hbWUgKSByZXR1cm4gbnVwO1xyXG5cclxuICAgICAgICBpZiggbmFtZSA9PT0gJ3RpdGxlJyApe1xyXG4gICAgICAgICAgICB0aGlzLnVuU2VsZWN0ZWQoKTtcclxuICAgICAgICAgICAgdGhpcy5tb2RlVGl0bGUoMSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiggbmFtZSA9PT0gJ3Njcm9sbCcgKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdzLXJlc2l6ZScpO1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVTY3JvbGwoMSk7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlU2Nyb2xsKDIpO1xyXG4gICAgICAgICAgICAgICAgLy90aGlzLnVwZGF0ZSggKCBlLmNsaWVudFkgLSB0b3AgICkgLSAoIHRoaXMuc2gqMC41ICkgKTtcclxuICAgICAgICAgICAgICAgIGxldCB0b3AgPSB0aGlzLnpvbmUueSt0aGlzLmJhc2VILTI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZSggKCBlLmNsaWVudFkgLSB0b3AgICkgLSAoIHRoaXMuc2gqMC41ICkgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2lmKHRoaXMuaXNEb3duKSB0aGlzLmxpc3Rtb3ZlKGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBpcyBpdGVtXHJcbiAgICAgICAgICAgIHRoaXMubW9kZVRpdGxlKDApO1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVTY3JvbGwoMCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggbmFtZSAhPT0gdGhpcy5wcmV2TmFtZSApIG51cCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5wcmV2TmFtZSA9IG5hbWU7XHJcblxyXG4gICAgICAgIHJldHVybiBudXA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHdoZWVsICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICd0aXRsZScgKSByZXR1cm4gZmFsc2U7IFxyXG4gICAgICAgIHRoaXMucHkgKz0gZS5kZWx0YSoxMDtcclxuICAgICAgICB0aGlzLnVwZGF0ZSh0aGlzLnB5KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLnByZXZOYW1lID0gJyc7XHJcbiAgICAgICAgdGhpcy51blNlbGVjdGVkKCk7XHJcbiAgICAgICAgdGhpcy5tb2RlVGl0bGUoMCk7XHJcbiAgICAgICAgdGhpcy5tb2RlU2Nyb2xsKDApO1xyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKCd0aGlzIGlzIHJlc2V0JylcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBtb2RlU2Nyb2xsICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgaWYoIG1vZGUgPT09IHRoaXMuc01vZGUgKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zY3JvbGxlci5zdHlsZTtcclxuICAgICAgICBsZXQgY2MgPSB0aGlzLmNvbG9yc1xyXG5cclxuICAgICAgICBzd2l0Y2gobW9kZSl7XHJcbiAgICAgICAgICAgIGNhc2UgMDogLy8gYmFzZVxyXG4gICAgICAgICAgICAgICAgcy5iYWNrZ3JvdW5kID0gY2MudGV4dDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogLy8gb3ZlclxyXG4gICAgICAgICAgICAgICAgcy5iYWNrZ3JvdW5kID0gY2Muc2VsZWN0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiAvLyBlZGl0IC8gZG93blxyXG4gICAgICAgICAgICAgICAgcy5iYWNrZ3JvdW5kID0gY2Muc2VsZWN0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNNb2RlID0gbW9kZTtcclxuICAgIH1cclxuXHJcbiAgICBtb2RlVGl0bGUgKCBtb2RlICkge1xyXG5cclxuICAgICAgICBpZiggbW9kZSA9PT0gdGhpcy50TW9kZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgbGV0IGNjID0gdGhpcy5jb2xvcnNcclxuXHJcbiAgICAgICAgc3dpdGNoKG1vZGUpe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIHNbM10uY29sb3IgPSBjYy50ZXh0O1xyXG4gICAgICAgICAgICAgICAgc1szXS5iYWNrZ3JvdW5kID0gY2MuYnV0dG9uO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICBzWzNdLmNvbG9yID0gY2MudGV4dE92ZXI7XHJcbiAgICAgICAgICAgICAgICBzWzNdLmJhY2tncm91bmQgPSBjYy5vdmVyb2ZmO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiAvLyBlZGl0IC8gZG93blxyXG4gICAgICAgICAgICAgICAgc1szXS5jb2xvciA9IGNjLnRleHRTZWxlY3Q7XHJcbiAgICAgICAgICAgICAgICBzWzNdLmJhY2tncm91bmQgPSBjYy5vdmVyb2ZmO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnRNb2RlID0gbW9kZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXJMaXN0ICgpIHtcclxuXHJcbiAgICAgICAgd2hpbGUgKCB0aGlzLmxpc3RJbi5jaGlsZHJlbi5sZW5ndGggKSB0aGlzLmxpc3RJbi5yZW1vdmVDaGlsZCggdGhpcy5saXN0SW4ubGFzdENoaWxkICk7XHJcbiAgICAgICAgdGhpcy5pdGVtcyA9IFtdO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRMaXN0ICggbGlzdCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jbGVhckxpc3QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ID0gbGlzdDtcclxuICAgICAgICB0aGlzLmxlbmd0aCA9IHRoaXMubGlzdC5sZW5ndGg7XHJcblxyXG4gICAgICAgIGxldCBsbmcgPSB0aGlzLmhpZGVDdXJyZW50PyB0aGlzLmxlbmd0aC0xIDogdGhpcy5sZW5ndGhcclxuXHJcbiAgICAgICAgdGhpcy5tYXhJdGVtID0gdGhpcy5mdWxsID8gbG5nIDogNTtcclxuICAgICAgICB0aGlzLm1heEl0ZW0gPSBsbmcgPCB0aGlzLm1heEl0ZW0gPyBsbmcgOiB0aGlzLm1heEl0ZW07XHJcblxyXG4gICAgICAgIHRoaXMubWF4SGVpZ2h0ID0gdGhpcy5tYXhJdGVtICogKHRoaXMuaXRlbUhlaWdodCsxKSArIDI7XHJcbiAgICAgICAgXHJcblxyXG5cclxuICAgICAgICB0aGlzLm1heCA9IGxuZyAqICh0aGlzLml0ZW1IZWlnaHQrMSkgKyAyO1xyXG4gICAgICAgIHRoaXMucmF0aW8gPSB0aGlzLm1heEhlaWdodCAvIHRoaXMubWF4O1xyXG4gICAgICAgIHRoaXMuc2ggPSB0aGlzLm1heEhlaWdodCAqIHRoaXMucmF0aW87XHJcbiAgICAgICAgdGhpcy5yYW5nZSA9IHRoaXMubWF4SGVpZ2h0IC0gdGhpcy5zaDtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdLnN0eWxlLmhlaWdodCA9IHRoaXMubWF4SGVpZ2h0ICsgJ3B4JztcclxuICAgICAgICB0aGlzLnNjcm9sbGVyQmFjay5zdHlsZS5oZWlnaHQgPSB0aGlzLm1heEhlaWdodCArICdweCc7XHJcbiAgICAgICAgdGhpcy5zY3JvbGxlci5zdHlsZS5oZWlnaHQgPSB0aGlzLnNoICsgJ3B4JztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMubWF4ID4gdGhpcy5tYXhIZWlnaHQgKXsgXHJcbiAgICAgICAgICAgIHRoaXMud3cgPSB0aGlzLnNiIC0gdGhpcy5zcztcclxuICAgICAgICAgICAgdGhpcy5zY3JvbGwgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHRoaXMubWluaUNhbnZhcyApIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudG1wQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcclxuICAgICAgICAgICAgdGhpcy50bXBDYW52YXMud2lkdGggPSB0aGlzLmltYWdlU2l6ZVswXVxyXG4gICAgICAgICAgICB0aGlzLnRtcENhbnZhcy5oZWlnaHQgPSB0aGlzLmltYWdlU2l6ZVsxXVxyXG4gICAgICAgICAgICB0aGlzLnRtcEN0eCA9IHRoaXMudG1wQ2FudmFzLmdldENvbnRleHQoXCIyZFwiKVxyXG4gICAgICAgICAgICB0aGlzLnRtcEN0eC5maWxsU3R5bGUgPSB0aGlzLmNhbnZhc0JnXHJcbiAgICAgICAgICAgIHRoaXMudG1wQ3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMuaW1hZ2VTaXplWzBdLCB0aGlzLmltYWdlU2l6ZVsxXSlcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgaXRlbSwgbjsvLywgbCA9IHRoaXMuc2I7XHJcbiAgICAgICAgZm9yKCBsZXQgaT0wOyBpPHRoaXMubGVuZ3RoOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIG4gPSB0aGlzLmxpc3RbaV07XHJcbiAgICAgICAgICAgIGl0ZW0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLml0ZW0gKyAncGFkZGluZzowcHggJysodGhpcy5tKzEpKydweDsgd2lkdGg6Jyt0aGlzLnd3KydweDsgaGVpZ2h0OicrdGhpcy5pdGVtSGVpZ2h0KydweDsgbGluZS1oZWlnaHQ6JysodGhpcy5pdGVtSGVpZ2h0LTIpKydweDsgY29sb3I6Jyt0aGlzLmNvbG9ycy50ZXh0Kyc7IGJhY2tncm91bmQ6Jyt0aGlzLmNvbG9ycy5iYWNrKyc7JyApO1xyXG4gICAgICAgICAgICBpdGVtLm5hbWUgPSAnaXRlbScrIGlcclxuICAgICAgICAgICAgaXRlbS5pZCA9IGk7XHJcbiAgICAgICAgICAgIGl0ZW0uc2VsZWN0ID0gZmFsc2VcclxuICAgICAgICAgICAgaXRlbS5wb3N5ID0gKHRoaXMuaXRlbUhlaWdodCsxKSppO1xyXG4gICAgICAgICAgICB0aGlzLmxpc3RJbi5hcHBlbmRDaGlsZCggaXRlbSApO1xyXG4gICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2goIGl0ZW0gKTtcclxuXHJcbiAgICAgICAgICAgIGlmKCBuID09PSB0aGlzLnZhbHVlICkgdGhpcy5jdXJyZW50ID0gaXRlbVxyXG5cclxuICAgICAgICAgICAgLy9pZiggdGhpcy5pc1dpdGhJbWFnZSApIGl0ZW0uYXBwZW5kQ2hpbGQoIHRoaXMudG1wSW1hZ2Vbbl0gKTtcclxuICAgICAgICAgICAgaWYoICF0aGlzLmlzV2l0aEltYWdlICkgaXRlbS50ZXh0Q29udGVudCA9IG47XHJcblxyXG4gICAgICAgICAgICBpZiggdGhpcy5taW5pQ2FudmFzICl7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGMgPSBuZXcgSW1hZ2UoKVxyXG4gICAgICAgICAgICAgICAgYy5zcmMgPSB0aGlzLnRtcENhbnZhcy50b0RhdGFVUkwoKVxyXG5cclxuICAgICAgICAgICAgICAgIC8vaXRlbS5zdHlsZS5tYXJnaW5MZWZ0ID0gKHRoaXMuaW1hZ2VTaXplWzBdKzgpKydweCdcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLypsZXQgYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXHJcblxyXG4gICAgICAgICAgICAgICAgYy53aWR0aCA9IHRoaXMuaW1hZ2VTaXplWzBdXHJcbiAgICAgICAgICAgICAgICBjLmhlaWdodCA9IHRoaXMuaW1hZ2VTaXplWzFdXHJcbiAgICAgICAgICAgICAgICBsZXQgY3R4ID0gYy5nZXRDb250ZXh0KFwiMmRcIilcclxuICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmNhbnZhc0JnXHJcbiAgICAgICAgICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgdGhpcy5pbWFnZVNpemVbMF0sIHRoaXMuaW1hZ2VTaXplWzFdKSovXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vYy5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOnJlbGF0aXZlOyBwb2ludGVyLWV2ZW50czpub25lOyBkaXNwbGF5OmlubGluZS1ibG9jazsgZmxvYXQ6bGVmdDsgbWFyZ2luLWxlZnQ6MHB4OyBtYXJnaW4tcmlnaHQ6NXB4OyB0b3A6MnB4J1xyXG4gICAgICAgICAgICAgICAvLyBjLnN0eWxlLmNzc1RleHQgPScgZmxleC1zaHJpbms6IDA7J1xyXG5cclxuICAgICAgICAgICAgICAgIGMuc3R5bGUuY3NzVGV4dCA9J21hcmdpbi1yaWdodDo0cHg7J1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAvL2Muc3R5bGUuY3NzVGV4dCA9ICdkaXNwbGF5OmZsZXg7IGFsaWduLWNvbnRlbnQ6IGZsZXgtc3RhcnQ7IGZsZXgtd3JhcDogd3JhcDsnXHJcbiAgICAgICAgICAgICAgICAvL2l0ZW0uc3R5bGUuZmxvYXQgPSAncmlnaHQnXHJcbiAgICAgICAgICAgICAgICBpdGVtLmFwcGVuZENoaWxkKCBjIClcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRtcEltYWdlW25dID0gY1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMuZHJhZ291dCApe1xyXG5cclxuICAgICAgICAgICAgICAgIGl0ZW0uaW1nID0gdGhpcy50bXBJbWFnZVtuXVxyXG5cclxuICAgICAgICAgICAgICAgIGl0ZW0uc3R5bGUucG9pbnRlckV2ZW50cyA9ICdhdXRvJztcclxuICAgICAgICAgICAgICAgIGl0ZW0uZHJhZ2dhYmxlID0gXCJ0cnVlXCJcclxuXHJcbiAgICAgICAgICAgICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIHRoaXMuZHJhZ3N0YXJ0IHx8IGZ1bmN0aW9uKCl7IC8qY29uc29sZS5sb2coJ2RyYWcgc3RhcnQnKSovfSlcclxuICAgICAgICAgICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignZHJhZycsIHRoaXMuZHJhZyB8fCBmdW5jdGlvbigpeyAvKmNvbnNvbGUubG9nKCdkcmFnIHN0YXJ0JykqL30pXHJcbiAgICAgICAgICAgICAgICAvL2l0ZW0uYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzKTtcclxuICAgICAgICAgICAgICAgIC8vaXRlbS5hZGRFdmVudExpc3RlbmVyKCdkcmFnZW50ZXInLCB0aGlzKTtcclxuICAgICAgICAgICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2xlYXZlJywgZnVuY3Rpb24oKXsgUm9vdHMuZmFrZVVwKCk7IH0gKTtcclxuICAgICAgICAgICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2VuZCcsIHRoaXMuZHJhZ2VuZCB8fCBmdW5jdGlvbigpeyAvKmNvbnNvbGUubG9nKCdkcmFnIGVuZCcpKi8gfS5iaW5kKHRoaXMpIClcclxuICAgICAgICAgICAgICAgIC8vaXRlbS5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgZnVuY3Rpb24oKXtjb25zb2xlLmxvZygnZHJvcCcpfSlcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNldFRvcEl0ZW0oKTtcclxuICAgICAgICBpZiggdGhpcy5pc1NlbGVjdGFibGUgKSB0aGlzLnNlbGVjdGVkKClcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBkcmF3SW1hZ2UoIG5hbWUsIGltYWdlLCB4LHksdyxoICl7XHJcblxyXG4gICAgICAgIHRoaXMudG1wQ3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmltYWdlU2l6ZVswXSwgdGhpcy5pbWFnZVNpemVbMV0pO1xyXG4gICAgICAgIHRoaXMudG1wQ3R4LmRyYXdJbWFnZShpbWFnZSwgeCwgeSwgdywgaCwgMCwgMCwgdGhpcy5pbWFnZVNpemVbMF0sIHRoaXMuaW1hZ2VTaXplWzFdKVxyXG4gICAgICAgIHRoaXMudG1wSW1hZ2VbbmFtZV0uc3JjID0gdGhpcy50bXBDYW52YXMudG9EYXRhVVJMKClcclxuXHJcblxyXG4gICAgICAgIC8qbGV0IGMgPSB0aGlzLnRtcEltYWdlW25hbWVdXHJcbiAgICAgICAgbGV0IGN0eCA9IGMuZ2V0Q29udGV4dChcIjJkXCIpXHJcbiAgICAgICAgY3R4LmRyYXdJbWFnZShpbWFnZSwgeCwgeSwgdywgaCwgMCwgMCwgdGhpcy5pbWFnZVNpemVbMF0sIHRoaXMuaW1hZ2VTaXplWzFdKSovXHJcblxyXG4gICAgfVxyXG5cclxuICAgIGFkZEltYWdlcyAoKXtcclxuICAgICAgICBsZXQgbG5nID0gdGhpcy5saXN0Lmxlbmd0aDtcclxuICAgICAgICBmb3IoIGxldCBpPTA7IGk8bG5nOyBpKysgKXtcclxuICAgICAgICAgICAgdGhpcy5pdGVtc1tpXS5hcHBlbmRDaGlsZCggdGhpcy50bXBJbWFnZVt0aGlzLmxpc3RbaV1dICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0VG9wSXRlbSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFZhbHVlICggdmFsdWUgKSB7XHJcblxyXG4gICAgICAgIGlmKCFpc05hTih2YWx1ZSkpIHRoaXMudmFsdWUgPSB0aGlzLmxpc3RbIHZhbHVlIF07XHJcbiAgICAgICAgZWxzZSB0aGlzLnZhbHVlID0gdmFsdWU7XHJcblxyXG4gICAgICAgIC8vdGhpcy50bXBJZCA9IHZhbHVlXHJcblxyXG4gICAgICAgIHRoaXMuc2V0VG9wSXRlbSgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRUb3BJdGVtICgpe1xyXG5cclxuICAgICAgICBpZiggdGhpcy5zdGF0aWNUb3AgKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzV2l0aEltYWdlICl7XHJcblxyXG4gICAgICAgICAgICBpZighdGhpcy5wcmVMb2FkQ29tcGxldGUgKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBpZighdGhpcy5jWzNdLmNoaWxkcmVuLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmltYWdlU2l6ZVswXVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5pbWFnZVNpemVbMV1cclxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmNzc1RleHQgPSdtYXJnaW4tcmlnaHQ6NHB4OydcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jWzNdLnN0eWxlLnRleHRBbGlnbiA9ICdsZWZ0J1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jWzNdLnN0eWxlLmp1c3RpZnlDb250ZW50ID0gJ2xlZnQnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNbM10uYXBwZW5kQ2hpbGQoIHRoaXMuY2FudmFzICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBpbWcgPSB0aGlzLnRtcEltYWdlWyB0aGlzLnZhbHVlIF07XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZSggdGhpcy50bXBJbWFnZVsgdGhpcy52YWx1ZSBdLCAwLCAwLCB0aGlzLmltYWdlU2l6ZVsyXSwgdGhpcy5pbWFnZVNpemVbM10sIDAsMCwgdGhpcy5pbWFnZVNpemVbMF0sIHRoaXMuaW1hZ2VTaXplWzFdICk7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHRoaXMuY1szXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLm1pbmlDYW52YXMgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCF0aGlzLmNbM10uY2hpbGRyZW4ubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuaW1hZ2VTaXplWzBdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5pbWFnZVNpemVbMV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5jc3NUZXh0ID0nbWFyZ2luLXJpZ2h0OjRweDsnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jWzNdLnN0eWxlLnRleHRBbGlnbiA9ICdsZWZ0J1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jWzNdLnN0eWxlLmp1c3RpZnlDb250ZW50ID0gJ2xlZnQnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNbM10uYXBwZW5kQ2hpbGQoIHRoaXMuY2FudmFzIClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKCB0aGlzLnRtcEltYWdlWyB0aGlzLnZhbHVlIF0sIDAsIDAgKTtcclxuXHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIC0tLS0tIExJU1RcclxuXHJcbiAgICB1cGRhdGUgKCB5ICkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuc2Nyb2xsICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB5ID0geSA8IDAgPyAwIDogeTtcclxuICAgICAgICB5ID0geSA+IHRoaXMucmFuZ2UgPyB0aGlzLnJhbmdlIDogeTtcclxuXHJcbiAgICAgICAgdGhpcy50b3BMaXN0ID0gLU1hdGguZmxvb3IoIHkgLyB0aGlzLnJhdGlvICk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdEluLnN0eWxlLnRvcCA9IHRoaXMudG9wTGlzdCsncHgnO1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUudG9wID0gTWF0aC5mbG9vciggeSApICArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMucHkgPSB5O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBwYXJlbnRIZWlnaHQgKCB0ICkge1xyXG5cclxuICAgICAgICBpZiAoIHRoaXMuZ3JvdXAgIT09IG51bGwgKSB0aGlzLmdyb3VwLmNhbGMoIHQgKTtcclxuICAgICAgICBlbHNlIGlmICggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNhbGMoIHQgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgb3BlbiAoIGZpcnN0ICkge1xyXG5cclxuICAgICAgICBzdXBlci5vcGVuKCk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlKCAwIClcclxuXHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5tYXhIZWlnaHQgKyB0aGlzLmJhc2VIICsgNTtcclxuICAgICAgICBpZiggIXRoaXMuc2Nyb2xsICl7XHJcbiAgICAgICAgICAgIHRoaXMudG9wTGlzdCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuaCA9IHRoaXMuYmFzZUggKyA1ICsgdGhpcy5tYXg7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgdGhpcy5zY3JvbGxlckJhY2suc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNjcm9sbGVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICAgICAgICB0aGlzLnNjcm9sbGVyQmFjay5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCc7XHJcbiAgICAgICAgdGhpcy5zWzJdLmRpc3BsYXkgPSAnYmxvY2snO1xyXG5cclxuICAgICAgICBpZiggdGhpcy51cCApeyBcclxuICAgICAgICAgICAgdGhpcy56b25lLnkgLT0gdGhpcy5oIC0gKHRoaXMuYmFzZUgtMTApO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzRdLCAnZCcsIHRoaXMuc3Zncy5nMSApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbNF0sICdkJywgdGhpcy5zdmdzLmcyICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJTaXplQ29udGVudCgpO1xyXG5cclxuICAgICAgICBsZXQgdCA9IHRoaXMuaCAtIHRoaXMuYmFzZUg7XHJcblxyXG4gICAgICAgIHRoaXMuem9uZS5oID0gdGhpcy5oO1xyXG5cclxuICAgICAgICBpZighZmlyc3QpIHRoaXMucGFyZW50SGVpZ2h0KCB0ICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuY2xvc2UoKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMudXAgKSB0aGlzLnpvbmUueSArPSB0aGlzLmggLSAodGhpcy5iYXNlSC0xMCk7XHJcblxyXG4gICAgICAgIGxldCB0ID0gdGhpcy5oIC0gdGhpcy5iYXNlSDtcclxuXHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5iYXNlSDtcclxuICAgICAgICB0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuICAgICAgICB0aGlzLnNbMl0uZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzRdLCAnZCcsIHRoaXMuc3Zncy5nMSApO1xyXG5cclxuICAgICAgICB0aGlzLnpvbmUuaCA9IHRoaXMuaDtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJlbnRIZWlnaHQoIC10ICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tXHJcblxyXG4gICAgdGV4dCAoIHR4dCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jWzNdLnRleHRDb250ZW50ID0gdHh0O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZUNvbnRlbnQgKCkge1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSkgdGhpcy5saXN0SW4uY2hpbGRyZW5baV0uc3R5bGUud2lkdGggPSB0aGlzLnd3ICsgJ3B4JztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpXHJcblxyXG4gICAgICAgIC8vUHJvdG8ucHJvdG90eXBlLnJTaXplLmNhbGwoIHRoaXMgKTtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgbGV0IHcgPSB0aGlzLnNiO1xyXG4gICAgICAgIGxldCBkID0gdGhpcy5zYTtcclxuXHJcbiAgICAgICAgaWYoc1syXT09PSB1bmRlZmluZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgc1syXS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ubGVmdCA9IGQgKydweCc7XHJcblxyXG4gICAgICAgIHNbM10ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgICAgICBzWzNdLmxlZnQgPSBkICsgJ3B4JztcclxuXHJcbiAgICAgICAgc1s0XS5sZWZ0ID0gZCArIHcgLSAxNSArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMud3cgPSB3O1xyXG4gICAgICAgIGlmKCB0aGlzLm1heCA+IHRoaXMubWF4SGVpZ2h0ICkgdGhpcy53dyA9IHctdGhpcy5zcztcclxuICAgICAgICBpZih0aGlzLmlzT3BlbikgdGhpcy5yU2l6ZUNvbnRlbnQoKTtcclxuXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvLmpzJztcclxuaW1wb3J0IHsgVG9vbHMgfSBmcm9tICcuLi9jb3JlL1Rvb2xzLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBOdW1lcmljIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvIClcclxuXHJcbiAgICAgICAgdGhpcy5zZXRUeXBlTnVtYmVyKCBvIClcclxuXHJcbiAgICAgICAgdGhpcy5hbGx3YXkgPSBvLmFsbHdheSB8fCBmYWxzZVxyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IFswXVxyXG4gICAgICAgIHRoaXMubXVsdHkgPSAxXHJcbiAgICAgICAgdGhpcy5pbnZtdWx0eSA9IDFcclxuICAgICAgICB0aGlzLmlzU2luZ2xlID0gdHJ1ZVxyXG4gICAgICAgIHRoaXMuaXNBbmdsZSA9IGZhbHNlXHJcbiAgICAgICAgdGhpcy5pc1ZlY3RvciA9IGZhbHNlXHJcblxyXG4gICAgICAgIGlmKCBvLmlzQW5nbGUgKXtcclxuICAgICAgICAgICAgdGhpcy5pc0FuZ2xlID0gdHJ1ZVxyXG4gICAgICAgICAgICB0aGlzLm11bHR5ID0gVG9vbHMudG9yYWRcclxuICAgICAgICAgICAgdGhpcy5pbnZtdWx0eSA9IFRvb2xzLnRvZGVnXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmlzRHJhZyA9IG8uZHJhZyB8fCBmYWxzZVxyXG5cclxuICAgICAgICBpZiggby52YWx1ZSAhPT0gdW5kZWZpbmVkICl7XHJcbiAgICAgICAgICAgIGlmKCAhaXNOYU4oby52YWx1ZSkgKXtcclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSBbby52YWx1ZV1cclxuICAgICAgICAgICAgfSBlbHNlIGlmKCBvLnZhbHVlIGluc3RhbmNlb2YgQXJyYXkgKXsgXHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gby52YWx1ZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1NpbmdsZSA9IGZhbHNlXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiggby52YWx1ZSBpbnN0YW5jZW9mIE9iamVjdCApeyBcclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSBbXVxyXG4gICAgICAgICAgICAgICAgaWYoIG8udmFsdWUueCAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVswXSA9IG8udmFsdWUueFxyXG4gICAgICAgICAgICAgICAgaWYoIG8udmFsdWUueSAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVsxXSA9IG8udmFsdWUueVxyXG4gICAgICAgICAgICAgICAgaWYoIG8udmFsdWUueiAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVsyXSA9IG8udmFsdWUuelxyXG4gICAgICAgICAgICAgICAgaWYoIG8udmFsdWUudyAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVszXSA9IG8udmFsdWUud1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1NpbmdsZSA9IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzVmVjdG9yID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxuZyA9IHRoaXMudmFsdWUubGVuZ3RoXHJcbiAgICAgICAgdGhpcy50bXAgPSBbXVxyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSAtMVxyXG4gICAgICAgIHRoaXMucHJldiA9IHsgeDowLCB5OjAsIGQ6MCwgdjowIH1cclxuXHJcbiAgICAgICAgbGV0IGNjID0gdGhpcy5jb2xvcnNcclxuXHJcbiAgICAgICAgLy8gYmdcclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJyBiYWNrZ3JvdW5kOicgKyBjYy5zZWxlY3QgKyAnOyB0b3A6NHB4OyB3aWR0aDowcHg7IGhlaWdodDonICsgKHRoaXMuaC04KSArICdweDsnIClcclxuXHJcbiAgICAgICAgdGhpcy5jTW9kZSA9IFtdXHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZ1xyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcblxyXG4gICAgICAgICAgICBpZiggdGhpcy5pc0FuZ2xlICkgdGhpcy52YWx1ZVtpXSA9ICh0aGlzLnZhbHVlW2ldICogMTgwIC8gTWF0aC5QSSkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKVxyXG4gICAgICAgICAgICB0aGlzLmNbMytpXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ3RvcDoxcHg7IGhlaWdodDonKyh0aGlzLmgtMikrJ3B4OyBjb2xvcjonICsgY2MudGV4dCArICc7IGJhY2tncm91bmQ6JyArIGNjLmJhY2sgKyAnOyBib3JkZXJDb2xvcjonICsgY2MuYm9yZGVyKyc7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JylcclxuICAgICAgICAgICAgaWYoby5jZW50ZXIpIHRoaXMuY1syK2ldLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInXHJcbiAgICAgICAgICAgIHRoaXMuY1szK2ldLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZVtpXVxyXG4gICAgICAgICAgICB0aGlzLmNbMytpXS5zdHlsZS5jb2xvciA9IHRoaXMuY29sb3JzLnRleHRcclxuICAgICAgICAgICAgdGhpcy5jWzMraV0uaXNOdW0gPSB0cnVlXHJcbiAgICAgICAgICAgIHRoaXMuY01vZGVbaV0gPSAwXHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gc2VsZWN0aW9uXHJcbiAgICAgICAgdGhpcy5zZWxlY3RJZCA9IDMgKyB0aGlzLmxuZztcclxuICAgICAgICB0aGlzLmNbdGhpcy5zZWxlY3RJZF0gPSB0aGlzLmRvbSggICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAncG9zaXRpb246YWJzb2x1dGU7IHRvcDoycHg7IGhlaWdodDonICsgKHRoaXMuaC00KSArICdweDsgcGFkZGluZzowcHggMHB4OyB3aWR0aDowcHg7IGNvbG9yOicgKyBjYy50ZXh0U2VsZWN0ICsgJzsgYmFja2dyb3VuZDonICsgY2Muc2VsZWN0ICsgJzsgYm9yZGVyOm5vbmU7IGJvcmRlci1yYWRpdXM6MHB4OycpO1xyXG5cclxuICAgICAgICAvLyBjdXJzb3JcclxuICAgICAgICB0aGlzLmN1cnNvcklkID0gNCArIHRoaXMubG5nO1xyXG4gICAgICAgIHRoaXMuY1sgdGhpcy5jdXJzb3JJZCBdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICd0b3A6MnB4OyBoZWlnaHQ6JyArICh0aGlzLmgtNCkgKyAncHg7IHdpZHRoOjBweDsgYmFja2dyb3VuZDonK2NjLnRleHQrJzsnICk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsXHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJ1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMubG5nXHJcbiAgICAgICAgbGV0IHQgPSB0aGlzLnRtcFxyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgICAgIGlmKCBsLng+dFtpXVswXSAmJiBsLng8dFtpXVsyXSApIHJldHVybiBpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gJydcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKVxyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZVxyXG4gICAgICAgICAgICBpZiggbmFtZSAhPT0gJycgKXsgXHJcbiAgICAgICAgICAgIFx0dGhpcy5jdXJyZW50ID0gbmFtZVxyXG4gICAgICAgICAgICBcdHRoaXMucHJldiA9IHsgeDplLmNsaWVudFgsIHk6ZS5jbGllbnRZLCBkOjAsIHY6IHRoaXMuaXNTaW5nbGUgPyBwYXJzZUZsb2F0KHRoaXMudmFsdWUpIDogcGFyc2VGbG9hdCggdGhpcy52YWx1ZVsgdGhpcy5jdXJyZW50IF0gKSB9XHJcbiAgICAgICAgICAgIFx0dGhpcy5zZXRJbnB1dCggdGhpcy5jWyAzICsgdGhpcy5jdXJyZW50IF0gKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcblxyXG4gICAgXHRpZiggdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2VcclxuICAgICAgICAgICAgdGhpcy5wcmV2ID0geyB4OjAsIHk6MCwgZDowLCB2OjAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlIClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbnVwID0gZmFsc2VcclxuICAgICAgICBsZXQgeCA9IDBcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlIClcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICcnICkgdGhpcy5jdXJzb3IoKVxyXG4gICAgICAgIGVsc2V7IFxyXG4gICAgICAgIFx0aWYoIXRoaXMuaXNEcmFnKSB0aGlzLmN1cnNvcigndGV4dCcpO1xyXG4gICAgICAgIFx0ZWxzZSB0aGlzLmN1cnNvciggdGhpcy5jdXJyZW50ICE9PSAtMSA/ICdtb3ZlJyA6ICdwb2ludGVyJyApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRHJhZyApe1xyXG5cclxuICAgICAgICBcdGlmKCB0aGlzLmN1cnJlbnQgIT09IC0xICl7XHJcblxyXG4gICAgICAgICAgICBcdHRoaXMucHJldi5kICs9ICggZS5jbGllbnRYIC0gdGhpcy5wcmV2LnggKSAtICggZS5jbGllbnRZIC0gdGhpcy5wcmV2LnkgKVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBuID0gdGhpcy5wcmV2LnYgKyAoIHRoaXMucHJldi5kICogdGhpcy5zdGVwKVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWVbIHRoaXMuY3VycmVudCBdID0gdGhpcy5udW1WYWx1ZShuKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jWyAzICsgdGhpcy5jdXJyZW50IF0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlW3RoaXMuY3VycmVudF1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRlKClcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnByZXYueCA9IGUuY2xpZW50WFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2LnkgPSBlLmNsaWVudFlcclxuXHJcbiAgICAgICAgICAgICAgICBudXAgPSB0cnVlXHJcbiAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIFx0aWYoIHRoaXMuaXNEb3duICkgeCA9IGUuY2xpZW50WCAtIHRoaXMuem9uZS54IC0zXHJcbiAgICAgICAgXHRpZiggdGhpcy5jdXJyZW50ICE9PSAtMSApIHggLT0gdGhpcy50bXBbdGhpcy5jdXJyZW50XVswXVxyXG4gICAgICAgIFx0cmV0dXJuIHRoaXMudXBJbnB1dCggeCwgdGhpcy5pc0Rvd24gKVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBudXBcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgbGV0IG51cCA9IGZhbHNlXHJcbiAgICAgICAgcmV0dXJuIG51cFxyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgc2V0VmFsdWUgKCB2ICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1ZlY3RvciApe1xyXG4gICAgICAgICAgICBpZiggdi54ICE9PSB1bmRlZmluZWQgKSB0aGlzLnZhbHVlWzBdID0gdi54XHJcbiAgICAgICAgICAgIGlmKCB2LnkgIT09IHVuZGVmaW5lZCApIHRoaXMudmFsdWVbMV0gPSB2LnlcclxuICAgICAgICAgICAgaWYoIHYueiAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVsyXSA9IHYuelxyXG4gICAgICAgICAgICBpZiggdi53ICE9PSB1bmRlZmluZWQgKSB0aGlzLnZhbHVlWzNdID0gdi53XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuaXNTaW5nbGUgPyBbdl0gOiB2ICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlKClcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2FtZVN0ciAoIHN0ciApe1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMudmFsdWUubGVuZ3RoXHJcbiAgICAgICAgd2hpbGUoaS0tKSB0aGlzLmNbIDMgKyBpIF0udGV4dENvbnRlbnQgPSBzdHJcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlICggdXAgKSB7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy52YWx1ZS5sZW5ndGhcclxuXHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgIHRoaXMudmFsdWVbaV0gPSB0aGlzLm51bVZhbHVlKCB0aGlzLnZhbHVlW2ldICogdGhpcy5pbnZtdWx0eSApXHJcbiAgICAgICAgICAgICB0aGlzLmNbIDMgKyBpIF0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlW2ldXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdXAgKSB0aGlzLnNlbmQoKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZW5kICggdiApIHtcclxuXHJcbiAgICAgICAgdiA9IHYgfHwgdGhpcy52YWx1ZVxyXG5cclxuICAgICAgICB0aGlzLmlzU2VuZCA9IHRydWVcclxuXHJcbiAgICAgICAgaWYoIHRoaXMub2JqZWN0TGluayAhPT0gbnVsbCApeyBcclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmlzVmVjdG9yICl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9iamVjdExpbmtbIHRoaXMub2JqZWN0S2V5IF0uZnJvbUFycmF5KCB2IClcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub2JqZWN0TGlua1sgdGhpcy5vYmplY3RLZXkgXSA9IHZcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNhbGxiYWNrICkgdGhpcy5jYWxsYmFjayggdiwgdGhpcy5vYmplY3RLZXkgKVxyXG4gICAgICAgIHRoaXMuaXNTZW5kID0gZmFsc2VcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgSU5QVVRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzZWxlY3QgKCBjLCBlLCB3LCB0ICkge1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMuc1xyXG4gICAgICAgIGxldCBkID0gdGhpcy5jdXJyZW50ICE9PSAtMSA/IHRoaXMudG1wW3RoaXMuY3VycmVudF1bMF0gKyA1IDogMFxyXG4gICAgICAgIHNbdGhpcy5jdXJzb3JJZF0ud2lkdGggPSAnMXB4J1xyXG4gICAgICAgIHNbdGhpcy5jdXJzb3JJZF0ubGVmdCA9ICggZCArIGMgKSArICdweCdcclxuICAgICAgICBzW3RoaXMuc2VsZWN0SWRdLmxlZnQgPSAgKCBkICsgZSApICArICdweCdcclxuICAgICAgICBzW3RoaXMuc2VsZWN0SWRdLndpZHRoID0gIHcgICsgJ3B4J1xyXG4gICAgICAgIHRoaXMuY1t0aGlzLnNlbGVjdElkXS5pbm5lckhUTUwgPSB0XHJcbiAgICBcclxuICAgIH1cclxuXHJcbiAgICB1bnNlbGVjdCAoKSB7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zXHJcbiAgICAgICAgaWYoIXMpIHJldHVyblxyXG4gICAgICAgIHRoaXMuY1t0aGlzLnNlbGVjdElkXS5pbm5lckhUTUwgPSAnJ1xyXG4gICAgICAgIHNbdGhpcy5zZWxlY3RJZF0ud2lkdGggPSAwICsgJ3B4J1xyXG4gICAgICAgIHNbdGhpcy5jdXJzb3JJZF0ud2lkdGggPSAwICsgJ3B4J1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB2YWxpZGF0ZSAoIGZvcmNlICkge1xyXG5cclxuICAgICAgICBsZXQgYXIgPSBbXVxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmdcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuYWxsd2F5ICkgZm9yY2UgPSB0cnVlXHJcblxyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgXHRpZighaXNOYU4oIHRoaXMuY1sgMyArIGkgXS50ZXh0Q29udGVudCApKXsgXHJcbiAgICAgICAgICAgICAgICBsZXQgbnggPSB0aGlzLm51bVZhbHVlKCB0aGlzLmNbIDMgKyBpIF0udGV4dENvbnRlbnQgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY1sgMyArIGkgXS50ZXh0Q29udGVudCA9IG54XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlW2ldID0gbnhcclxuICAgICAgICAgICAgfSBlbHNlIHsgLy8gbm90IG51bWJlclxyXG4gICAgICAgICAgICAgICAgdGhpcy5jWyAzICsgaSBdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZVtpXVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIFx0YXJbaV0gPSB0aGlzLnZhbHVlW2ldICogdGhpcy5tdWx0eVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoICFmb3JjZSApIHJldHVyblxyXG4gICAgICAgIHRoaXMuc2VuZCggdGhpcy5pc1NpbmdsZSA/IGFyWzBdIDogYXIgKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFJFWklTRVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKVxyXG4gICAgICAgIGxldCBzeCA9IHRoaXMuY29sb3JzLnN4XHJcbiAgICAgICAgbGV0IHNzID0gc3ggKiAodGhpcy5sbmctMSlcclxuICAgICAgICBsZXQgdyA9ICh0aGlzLnNiLXNzKSAvIHRoaXMubG5nLy8oKCB0aGlzLnNiICsgc3ggKSAvIHRoaXMubG5nICktc3hcclxuICAgICAgICBsZXQgcyA9IHRoaXMuc1xyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmdcclxuXHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgLy90aGlzLnRtcFtpXSA9IFsgTWF0aC5mbG9vciggdGhpcy5zYSArICggdyAqIGkgKSsoIDUgKiBpICkpLCB3IF07XHJcbiAgICAgICAgICAgIHRoaXMudG1wW2ldID0gWyAoIHRoaXMuc2EgKyAoIHcgKiBpICkrKCBzeCAqIGkgKSksIHcgXVxyXG4gICAgICAgICAgICB0aGlzLnRtcFtpXVsyXSA9IHRoaXMudG1wW2ldWzBdICsgdGhpcy50bXBbaV1bMV1cclxuICAgICAgICAgICAgc1sgMyArIGkgXS5sZWZ0ID0gdGhpcy50bXBbaV1bMF0gKyAncHgnXHJcbiAgICAgICAgICAgIHNbIDMgKyBpIF0ud2lkdGggPSB0aGlzLnRtcFtpXVsxXSArICdweCdcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSBcIi4uL2NvcmUvUHJvdG8uanNcIjtcclxuaW1wb3J0IHsgVG9vbHMgfSBmcm9tIFwiLi4vY29yZS9Ub29scy5qc1wiO1xyXG5cclxuZnVuY3Rpb24gZWFzZSh4LCBtaW4sIG1heCwgcG93ZXIpIHtcclxuICBsZXQgbiA9IG1pbiArIE1hdGgucG93KCh4IC0gbWluKSAvIChtYXggLSBtaW4pLCBwb3dlcikgKiAobWF4IC0gbWluKTtcclxuICByZXR1cm4gbjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFNsaWRlIGV4dGVuZHMgUHJvdG8ge1xyXG4gIGNvbnN0cnVjdG9yKG8gPSB7fSkge1xyXG4gICAgc3VwZXIobyk7XHJcblxyXG4gICAgaWYgKG8uZWFzaW5nIDw9IDApIHRocm93IFwiRWFzaW5nIG11c3QgYmUgPiAwXCI7XHJcbiAgICB0aGlzLmVhc2luZyA9IG8uZWFzaW5nIHx8IDE7XHJcblxyXG4gICAgdGhpcy5zZXRUeXBlTnVtYmVyKG8pO1xyXG5cclxuICAgIHRoaXMubW9kZWwgPSBvLnN0eXBlIHx8IDA7XHJcbiAgICBpZiAoby5tb2RlICE9PSB1bmRlZmluZWQpIHRoaXMubW9kZWwgPSBvLm1vZGU7XHJcblxyXG4gICAgLy90aGlzLmRlZmF1bHRCb3JkZXJDb2xvciA9IHRoaXMuY29sb3JzLmhpZGU7XHJcblxyXG4gICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgIHRoaXMuaXNPdmVyID0gZmFsc2U7XHJcbiAgICB0aGlzLmFsbHdheSA9IG8uYWxsd2F5IHx8IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuaXNEZWcgPSBvLmlzRGVnIHx8IGZhbHNlO1xyXG4gICAgdGhpcy5pc0N5Y2xpYyA9IG8uY3ljbGljIHx8IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuZmlyc3RJbXB1dCA9IGZhbHNlO1xyXG5cclxuICAgIGxldCBjYyA9IHRoaXMuY29sb3JzO1xyXG5cclxuICAgIC8vdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAnbGV0dGVyLXNwYWNpbmc6LTFweDsgdGV4dC1hbGlnbjpyaWdodDsgd2lkdGg6NDdweDsgYm9yZGVyOjFweCBkYXNoZWQgJyt0aGlzLmRlZmF1bHRCb3JkZXJDb2xvcisnOyBjb2xvcjonKyB0aGlzLmNvbG9ycy50ZXh0ICk7XHJcbiAgICAvL3RoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ3RleHQtYWxpZ246cmlnaHQ7IHdpZHRoOjQ3cHg7IGJvcmRlcjoxcHggZGFzaGVkICcrdGhpcy5kZWZhdWx0Qm9yZGVyQ29sb3IrJzsgY29sb3I6JysgdGhpcy5jb2xvcnMudGV4dCApO1xyXG4gICAgdGhpcy5jWzJdID0gdGhpcy5kb20oXHJcbiAgICAgIFwiZGl2XCIsXHJcbiAgICAgIHRoaXMuY3NzLnR4dHNlbGVjdCArXHJcbiAgICAgICAgXCJib3JkZXI6bm9uZTsgYmFja2dyb3VuZDpub25lOyB3aWR0aDo0N3B4OyBjb2xvcjpcIiArXHJcbiAgICAgICAgY2MudGV4dCArXHJcbiAgICAgICAgXCI7XCJcclxuICAgICk7XHJcbiAgICAvL3RoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ2xldHRlci1zcGFjaW5nOi0xcHg7IHRleHQtYWxpZ246cmlnaHQ7IHdpZHRoOjQ3cHg7IGNvbG9yOicrIHRoaXMuY29sb3JzLnRleHQgKTtcclxuICAgIHRoaXMuY1szXSA9IHRoaXMuZG9tKFxyXG4gICAgICBcImRpdlwiLFxyXG4gICAgICB0aGlzLmNzcy5iYXNpYyArIFwiIHRvcDowOyBoZWlnaHQ6XCIgKyB0aGlzLmggKyBcInB4O1wiXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKFxyXG4gICAgICBcImRpdlwiLFxyXG4gICAgICB0aGlzLmNzcy5iYXNpYyArXHJcbiAgICAgICAgXCJiYWNrZ3JvdW5kOlwiICtcclxuICAgICAgICBjYy5iYWNrICtcclxuICAgICAgICBcIjsgdG9wOjJweDsgaGVpZ2h0OlwiICtcclxuICAgICAgICAodGhpcy5oIC0gNCkgK1xyXG4gICAgICAgIFwicHg7XCJcclxuICAgICk7XHJcbiAgICB0aGlzLmNbNV0gPSB0aGlzLmRvbShcclxuICAgICAgXCJkaXZcIixcclxuICAgICAgdGhpcy5jc3MuYmFzaWMgK1xyXG4gICAgICAgIFwibGVmdDo0cHg7IHRvcDo1cHg7IGhlaWdodDpcIiArXHJcbiAgICAgICAgKHRoaXMuaCAtIDEwKSArXHJcbiAgICAgICAgXCJweDsgYmFja2dyb3VuZDpcIiArXHJcbiAgICAgICAgY2MudGV4dCArXHJcbiAgICAgICAgXCI7XCJcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5jWzJdLmlzTnVtID0gdHJ1ZTtcclxuICAgIC8vdGhpcy5jWzJdLnN0eWxlLmhlaWdodCA9ICh0aGlzLmgtNCkgKyAncHgnO1xyXG4gICAgLy90aGlzLmNbMl0uc3R5bGUubGluZUhlaWdodCA9ICh0aGlzLmgtOCkgKyAncHgnO1xyXG4gICAgdGhpcy5jWzJdLnN0eWxlLmhlaWdodCA9IHRoaXMuaCAtIDIgKyBcInB4XCI7XHJcbiAgICB0aGlzLmNbMl0uc3R5bGUubGluZUhlaWdodCA9IHRoaXMuaCAtIDEwICsgXCJweFwiO1xyXG5cclxuICAgIGlmICh0aGlzLm1vZGVsICE9PSAwKSB7XHJcbiAgICAgIGxldCByMSA9IDQsXHJcbiAgICAgICAgaDEgPSA0LFxyXG4gICAgICAgIGgyID0gOCxcclxuICAgICAgICB3dyA9IHRoaXMuaCAtIDYsXHJcbiAgICAgICAgcmEgPSAxNjtcclxuXHJcbiAgICAgIGlmICh0aGlzLm1vZGVsID09PSAyKSB7XHJcbiAgICAgICAgcjEgPSAwO1xyXG4gICAgICAgIGgxID0gMjtcclxuICAgICAgICBoMiA9IDQ7XHJcbiAgICAgICAgcmEgPSAyO1xyXG4gICAgICAgIHd3ID0gKHRoaXMuaCAtIDYpICogMC41O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodGhpcy5tb2RlbCA9PT0gMykgdGhpcy5jWzVdLnN0eWxlLnZpc2libGUgPSBcIm5vbmVcIjtcclxuXHJcbiAgICAgIHRoaXMuY1s0XS5zdHlsZS5ib3JkZXJSYWRpdXMgPSByMSArIFwicHhcIjtcclxuICAgICAgdGhpcy5jWzRdLnN0eWxlLmhlaWdodCA9IGgyICsgXCJweFwiO1xyXG4gICAgICB0aGlzLmNbNF0uc3R5bGUudG9wID0gdGhpcy5oICogMC41IC0gaDEgKyBcInB4XCI7XHJcbiAgICAgIHRoaXMuY1s1XS5zdHlsZS5ib3JkZXJSYWRpdXMgPSByMSAqIDAuNSArIFwicHhcIjtcclxuICAgICAgdGhpcy5jWzVdLnN0eWxlLmhlaWdodCA9IGgxICsgXCJweFwiO1xyXG4gICAgICB0aGlzLmNbNV0uc3R5bGUudG9wID0gdGhpcy5oICogMC41IC0gaDEgKiAwLjUgKyBcInB4XCI7XHJcblxyXG4gICAgICAvL3RoaXMuY1s2XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnYm9yZGVyLXJhZGl1czonK3JhKydweDsgbWFyZ2luLWxlZnQ6JysoLXd3KjAuNSkrJ3B4OyBib3JkZXI6MXB4IHNvbGlkICcrY2MuYm9yZGVyKyc7IGJhY2tncm91bmQ6JytjYy5idXR0b24rJzsgbGVmdDo0cHg7IHRvcDoycHg7IGhlaWdodDonKyh0aGlzLmgtNCkrJ3B4OyB3aWR0aDonK3d3KydweDsnICk7XHJcbiAgICAgIHRoaXMuY1s2XSA9IHRoaXMuZG9tKFxyXG4gICAgICAgIFwiZGl2XCIsXHJcbiAgICAgICAgdGhpcy5jc3MuYmFzaWMgK1xyXG4gICAgICAgICAgXCJib3JkZXItcmFkaXVzOlwiICtcclxuICAgICAgICAgIHJhICtcclxuICAgICAgICAgIFwicHg7IG1hcmdpbi1sZWZ0OlwiICtcclxuICAgICAgICAgIC13dyAqIDAuNSArXHJcbiAgICAgICAgICBcInB4OyBiYWNrZ3JvdW5kOlwiICtcclxuICAgICAgICAgIGNjLnRleHQgK1xyXG4gICAgICAgICAgXCI7IGxlZnQ6NHB4OyB0b3A6M3B4OyBoZWlnaHQ6XCIgK1xyXG4gICAgICAgICAgKHRoaXMuaCAtIDYpICtcclxuICAgICAgICAgIFwicHg7IHdpZHRoOlwiICtcclxuICAgICAgICAgIHd3ICtcclxuICAgICAgICAgIFwicHg7XCJcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmluaXQoKTtcclxuICB9XHJcblxyXG4gIHRlc3Rab25lKGUpIHtcclxuICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuICAgIGlmIChsLnggPT09IC0xICYmIGwueSA9PT0gLTEpIHJldHVybiBcIlwiO1xyXG5cclxuICAgIGlmIChsLnggPj0gdGhpcy50eGwpIHJldHVybiBcInRleHRcIjtcclxuICAgIGVsc2UgaWYgKGwueCA+PSB0aGlzLnNhKSByZXR1cm4gXCJzY3JvbGxcIjtcclxuICAgIGVsc2UgcmV0dXJuIFwiXCI7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gICBFVkVOVFNcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIG1vdXNldXAoZSkge1xyXG4gICAgaWYgKHRoaXMuaXNEb3duKSB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgbW91c2Vkb3duKGUpIHtcclxuICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZShlKTtcclxuXHJcbiAgICBpZiAoIW5hbWUpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBpZiAobmFtZSA9PT0gXCJzY3JvbGxcIikge1xyXG4gICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgIHRoaXMub2xkID0gdGhpcy52YWx1ZTtcclxuICAgICAgdGhpcy5tb3VzZW1vdmUoZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyppZiggbmFtZSA9PT0gJ3RleHQnICl7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0SW5wdXQoIHRoaXMuY1syXSwgZnVuY3Rpb24oKXsgdGhpcy52YWxpZGF0ZSgpIH0uYmluZCh0aGlzKSApO1xyXG4gICAgICAgIH0qL1xyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgbW91c2Vtb3ZlKGUpIHtcclxuICAgIGxldCBudXAgPSBmYWxzZTtcclxuXHJcbiAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoZSk7XHJcblxyXG4gICAgaWYgKG5hbWUgPT09IFwic2Nyb2xsXCIpIHtcclxuICAgICAgdGhpcy5tb2RlKDEpO1xyXG4gICAgICB0aGlzLmN1cnNvcihcInctcmVzaXplXCIpO1xyXG4gICAgICAvL30gZWxzZSBpZihuYW1lID09PSAndGV4dCcpe1xyXG4gICAgICAvL3RoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmN1cnNvcigpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmlzRG93bikge1xyXG4gICAgICBsZXQgbk5vcm1hbGl6ZWQgPSAoZS5jbGllbnRYIC0gKHRoaXMuem9uZS54ICsgdGhpcy5zYSkgLSAzKSAvIHRoaXMud3c7XHJcblxyXG4gICAgICAvLyBsbyBtYXBlbyBhbCByYW5nbyAwIC4uLiAxXHJcbiAgICAgIG5Ob3JtYWxpemVkID0gTWF0aC5taW4oMSwgTWF0aC5tYXgoMCwgbk5vcm1hbGl6ZWQpKTtcclxuXHJcbiAgICAgIC8vIGFwbGljbyBlYXNpbmdcclxuICAgICAgbGV0IG5FYXNlZCA9IE1hdGgucG93KG5Ob3JtYWxpemVkLCB0aGlzLmVhc2luZyk7IC8vIGVhc2luZ1xyXG5cclxuICAgICAgbGV0IG5OZXcgPSBuRWFzZWQgKiB0aGlzLnJhbmdlICsgdGhpcy5taW47XHJcbiAgICAgIGxldCBuTmV3U2xpZGVyID0gbk5vcm1hbGl6ZWQgKiB0aGlzLnJhbmdlICsgdGhpcy5taW47XHJcblxyXG4gICAgICB0aGlzLnNsaWRlclZhbHVlID0gdGhpcy5udW1WYWx1ZShuTmV3U2xpZGVyKTtcclxuXHJcbiAgICAgIGxldCBkZWx0YSA9IG5OZXcgLSB0aGlzLm9sZDtcclxuXHJcbiAgICAgIGxldCBzdGVwcztcclxuICAgICAgaWYgKGRlbHRhID49IHRoaXMuc3RlcCB8fCBkZWx0YSA8PSB0aGlzLnN0ZXApIHtcclxuICAgICAgICBzdGVwcyA9IE1hdGguZmxvb3IoZGVsdGEgLyB0aGlzLnN0ZXApO1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLm51bVZhbHVlKHRoaXMub2xkICsgc3RlcHMgKiB0aGlzLnN0ZXApO1xyXG4gICAgICAgIC8vIHZhbHVlIHdpdGhvdXQgZWFzaW5nIGFwcGxpZWRcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGUodHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5vbGQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICB9XHJcbiAgICAgIC8vY29uc29sZS5sb2coXCJuLCBub3JtYWxpemVkLCB2YWx1ZVwiLCBuTmV3LCBuTm9ybWFsaXplZCwgdGhpcy52YWx1ZSk7XHJcbiAgICAgIG51cCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG51cDtcclxuICB9XHJcblxyXG4gIHdoZWVsKGUpIHtcclxuICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZShlKTtcclxuXHJcbiAgICBpZiAobmFtZSA9PT0gXCJzY3JvbGxcIikge1xyXG4gICAgICBsZXQgdiA9IHRoaXMudmFsdWUgLSB0aGlzLnN0ZXAgKiBlLmRlbHRhO1xyXG5cclxuICAgICAgaWYgKHYgPiB0aGlzLm1heCkge1xyXG4gICAgICAgIHYgPSB0aGlzLmlzQ3ljbGljID8gdGhpcy5taW4gOiB0aGlzLm1heDtcclxuICAgICAgfSBlbHNlIGlmICh2IDwgdGhpcy5taW4pIHtcclxuICAgICAgICB2ID0gdGhpcy5pc0N5Y2xpYyA/IHRoaXMubWF4IDogdGhpcy5taW47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuc2V0VmFsdWUodik7XHJcbiAgICAgIHRoaXMub2xkID0gdjtcclxuICAgICAgdGhpcy51cGRhdGUodHJ1ZSk7XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvL2tleWRvd246IGZ1bmN0aW9uICggZSApIHsgcmV0dXJuIHRydWU7IH0sXHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgdmFsaWRhdGUoKSB7XHJcbiAgICBsZXQgbiA9IHRoaXMuY1syXS50ZXh0Q29udGVudDtcclxuXHJcbiAgICBpZiAoIWlzTmFOKG4pKSB7XHJcbiAgICAgIHRoaXMudmFsdWUgPSB0aGlzLm51bVZhbHVlKG4pO1xyXG4gICAgICB0aGlzLnVwZGF0ZSh0cnVlKTtcclxuICAgIH0gZWxzZSB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlICsgKHRoaXMuaXNEZWcgPyBcIsKwXCIgOiBcIlwiKTtcclxuICB9XHJcblxyXG4gIHJlc2V0KCkge1xyXG4gICAgLy90aGlzLmNsZWFySW5wdXQoKTtcclxuICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICB0aGlzLm1vZGUoMCk7XHJcbiAgfVxyXG5cclxuICBtb2RlKG1vZGUpIHtcclxuICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgbGV0IGNjID0gdGhpcy5jb2xvcnM7XHJcblxyXG4gICAgc3dpdGNoIChtb2RlKSB7XHJcbiAgICAgIGNhc2UgMDogLy8gYmFzZVxyXG4gICAgICAgIC8vIHNbMl0uYm9yZGVyID0gJzFweCBzb2xpZCAnICsgdGhpcy5jb2xvcnMuaGlkZTtcclxuICAgICAgICBzWzJdLmNvbG9yID0gY2MudGV4dDtcclxuICAgICAgICBzWzRdLmJhY2tncm91bmQgPSBjYy5iYWNrO1xyXG4gICAgICAgIHNbNV0uYmFja2dyb3VuZCA9IGNjLnRleHQ7XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwgIT09IDApIHNbNl0uYmFja2dyb3VuZCA9IGNjLnRleHQ7IC8vY2MuYnV0dG9uO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDE6IC8vIHNjcm9sbCBvdmVyXHJcbiAgICAgICAgLy9zWzJdLmJvcmRlciA9ICcxcHggZGFzaGVkICcgKyB0aGlzLmNvbG9ycy5oaWRlO1xyXG4gICAgICAgIHNbMl0uY29sb3IgPSBjYy50ZXh0T3ZlcjtcclxuICAgICAgICBzWzRdLmJhY2tncm91bmQgPSBjYy5iYWNrO1xyXG4gICAgICAgIHNbNV0uYmFja2dyb3VuZCA9IGNjLnRleHRPdmVyO1xyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsICE9PSAwKSBzWzZdLmJhY2tncm91bmQgPSBjYy50ZXh0T3ZlcjsgLy9jYy5vdmVyb2ZmO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdXBkYXRlKHVwKSB7XHJcbiAgICBsZXQgbm9ybWFsaXplZCA9ICh0aGlzLnZhbHVlIC0gdGhpcy5taW4pIC8gdGhpcy5yYW5nZTtcclxuXHJcbiAgICBsZXQgdW5lYXNlZCA9XHJcbiAgICAgIHRoaXMuZWFzaW5nID09IDEgPyBub3JtYWxpemVkIDogTWF0aC5wb3cobm9ybWFsaXplZCwgMSAvIHRoaXMuZWFzaW5nKTtcclxuXHJcbiAgICBsZXQgd3cgPSBNYXRoLmZsb29yKHRoaXMud3cgKiB1bmVhc2VkKTtcclxuICAgIC8vbGV0IHd3ID0gTWF0aC5mbG9vcih0aGlzLnd3ICogKCh0aGlzLnZhbHVlIC0gdGhpcy5taW4pIC8gdGhpcy5yYW5nZSkpO1xyXG5cclxuICAgIGlmICh0aGlzLm1vZGVsICE9PSAzKSB0aGlzLnNbNV0ud2lkdGggPSB3dyArIFwicHhcIjtcclxuICAgIGlmICh0aGlzLnNbNl0pIHRoaXMuc1s2XS5sZWZ0ID0gdGhpcy5zYSArIHd3ICsgMyArIFwicHhcIjtcclxuICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWUgKyAodGhpcy5pc0RlZyA/IFwiwrBcIiA6IFwiXCIpO1xyXG5cclxuICAgIGlmICh1cCkgdGhpcy5zZW5kKCk7XHJcbiAgfVxyXG5cclxuICByU2l6ZSgpIHtcclxuICAgIHN1cGVyLnJTaXplKCk7XHJcblxyXG4gICAgbGV0IHcgPSB0aGlzLnNiIC0gdGhpcy5zYztcclxuICAgIHRoaXMud3cgPSB3IC0gNjtcclxuXHJcbiAgICBsZXQgdHggPSB0aGlzLnNjO1xyXG4gICAgaWYgKHRoaXMuaXNVSSB8fCAhdGhpcy5zaW1wbGUpIHR4ID0gdGhpcy5zYyArIDEwO1xyXG4gICAgdGhpcy50eGwgPSB0aGlzLncgLSB0eCArIDI7XHJcblxyXG4gICAgLy9sZXQgdHkgPSBNYXRoLmZsb29yKHRoaXMuaCAqIDAuNSkgLSA4O1xyXG5cclxuICAgIGxldCBzID0gdGhpcy5zO1xyXG5cclxuICAgIHNbMl0ud2lkdGggPSB0aGlzLnNjIC0gNiArIFwicHhcIjtcclxuICAgIHNbMl0ubGVmdCA9IHRoaXMudHhsICsgNCArIFwicHhcIjtcclxuICAgIC8vc1syXS50b3AgPSB0eSArICdweCc7XHJcbiAgICBzWzNdLmxlZnQgPSB0aGlzLnNhICsgXCJweFwiO1xyXG4gICAgc1szXS53aWR0aCA9IHcgKyBcInB4XCI7XHJcbiAgICBzWzRdLmxlZnQgPSB0aGlzLnNhICsgXCJweFwiO1xyXG4gICAgc1s0XS53aWR0aCA9IHcgKyBcInB4XCI7XHJcbiAgICBzWzVdLmxlZnQgPSB0aGlzLnNhICsgMyArIFwicHhcIjtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8uanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRleHRJbnB1dCBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLmNtb2RlID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IG8udmFsdWUgIT09IHVuZGVmaW5lZCA/IG8udmFsdWUgOiAnJztcclxuICAgICAgICB0aGlzLnBsYWNlSG9sZGVyID0gby5wbGFjZUhvbGRlciB8fCAnJztcclxuXHJcbiAgICAgICAgdGhpcy5hbGx3YXkgPSBvLmFsbHdheSB8fCBmYWxzZTtcclxuICAgICAgICB0aGlzLmVkaXRhYmxlID0gby5lZGl0ICE9PSB1bmRlZmluZWQgPyBvLmVkaXQgOiB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgY2MgPSB0aGlzLmNvbG9yc1xyXG5cclxuICAgICAgICAvLyB0ZXh0XHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAndG9wOjFweDsgaGVpZ2h0OicgKyAodGhpcy5oLTIpICsgJ3B4OyBjb2xvcjonICsgY2MudGV4dCArICc7IGJhY2tncm91bmQ6JyArIGNjLmJhY2sgKyAnOyBib3JkZXJDb2xvcjonICsgY2MuYm9yZGVyKyc7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JyApO1xyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgICAgIC8vIHNlbGVjdGlvblxyXG4gICAgICAgIHRoaXMuY1szXSA9IHRoaXMuZG9tKCAgJ2RpdicsIHRoaXMuY3NzLnR4dHNlbGVjdCArICdwb3NpdGlvbjphYnNvbHV0ZTsgdG9wOjJweDsgaGVpZ2h0OicgKyAodGhpcy5oLTQpICsgJ3B4OyBwYWRkaW5nOjBweCAwcHg7IHdpZHRoOjBweDsgY29sb3I6JyArIGNjLnRleHRTZWxlY3QgKyAnOyBiYWNrZ3JvdW5kOicgKyBjYy5zZWxlY3QgKyAnOyBib3JkZXI6bm9uZTsgYm9yZGVyLXJhZGl1czowcHg7Jyk7XHJcblxyXG4gICAgICAgIC8vIGN1cnNvclxyXG4gICAgICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAndG9wOjJweDsgaGVpZ2h0OicgKyAodGhpcy5oLTQpICsgJ3B4OyB3aWR0aDowcHg7IGJhY2tncm91bmQ6JytjYy50ZXh0Kyc7JyApO1xyXG5cclxuICAgICAgICAvLyBmYWtlXHJcbiAgICAgICAgdGhpcy5jWzVdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAndG9wOjFweDsgaGVpZ2h0OicgKyAodGhpcy5oLTIpICsgJ3B4OyBib3JkZXI6bm9uZTsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IGZvbnQtc3R5bGU6IGl0YWxpYzsgY29sb3I6JytjYy5ib3JkZXIrJzsnICk7XHJcbiAgICAgICAgaWYoIHRoaXMudmFsdWUgPT09ICcnICkgdGhpcy5jWzVdLnRleHRDb250ZW50ID0gdGhpcy5wbGFjZUhvbGRlcjtcclxuXHJcbiAgICAgICAgXHJcblxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGVzdFpvbmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuICAgICAgICBpZiggbC54ID49IHRoaXMuc2EgKSByZXR1cm4gJ3RleHQnO1xyXG4gICAgICAgIHJldHVybiAnJztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuZWRpdGFibGUpIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICBpZighdGhpcy5lZGl0YWJsZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmKCBuYW1lID09PSAndGV4dCcgKSB0aGlzLnNldElucHV0KCB0aGlzLmNbMl0gKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCF0aGlzLmVkaXRhYmxlKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICAvL2xldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICAvL2lmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKXsgcmV0dXJuO31cclxuXHJcbiAgICAgICAgLy9pZiggbC54ID49IHRoaXMuc2EgKSB0aGlzLmN1cnNvcigndGV4dCcpO1xyXG4gICAgICAgIC8vZWxzZSB0aGlzLmN1cnNvcigpO1xyXG5cclxuICAgICAgICBsZXQgeCA9IDA7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAndGV4dCcgKSB0aGlzLmN1cnNvcigndGV4dCcpO1xyXG4gICAgICAgIGVsc2UgdGhpcy5jdXJzb3IoKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICkgeCA9IGUuY2xpZW50WCAtIHRoaXMuem9uZS54O1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy51cElucHV0KCB4IC0gdGhpcy5zYSAtMywgdGhpcy5pc0Rvd24gKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlICggKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBJTlBVVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHNlbGVjdCAoIGMsIGUsIHcsIHQgKSB7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIGxldCBkID0gdGhpcy5zYSArIDU7XHJcbiAgICAgICAgc1s0XS53aWR0aCA9ICcxcHgnO1xyXG4gICAgICAgIHNbNF0ubGVmdCA9ICggZCArIGUgKSArICdweCc7XHJcblxyXG4gICAgICAgIHNbM10ubGVmdCA9ICAoIGQgKyBlICkgICsgJ3B4JztcclxuICAgICAgICBzWzNdLndpZHRoID0gIHcgICsgJ3B4JztcclxuICAgICAgICB0aGlzLmNbM10uaW5uZXJIVE1MID0gdFxyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgdW5zZWxlY3QgKCkge1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBpZighcykgcmV0dXJuO1xyXG4gICAgICAgIHNbM10ud2lkdGggPSAgMCAgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY1szXS5pbm5lckhUTUwgPSAndCdcclxuICAgICAgICBzWzRdLndpZHRoID0gMCArICdweCc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHZhbGlkYXRlICggZm9yY2UgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmFsbHdheSApIGZvcmNlID0gdHJ1ZTsgXHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmNbMl0udGV4dENvbnRlbnQ7XHJcblxyXG4gICAgICAgIGlmKHRoaXMudmFsdWUgIT09ICcnKSB0aGlzLmNbNV0udGV4dENvbnRlbnQgPSAnJztcclxuICAgICAgICBlbHNlIHRoaXMuY1s1XS50ZXh0Q29udGVudCA9IHRoaXMucGxhY2VIb2xkZXI7XHJcblxyXG4gICAgICAgIGlmKCAhZm9yY2UgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuc2VuZCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFJFWklTRVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgc1syXS5sZWZ0ID0gdGhpcy5zYSArICdweCc7XHJcbiAgICAgICAgc1syXS53aWR0aCA9IHRoaXMuc2IgKyAncHgnO1xyXG5cclxuICAgICAgICBzWzVdLmxlZnQgPSB0aGlzLnNhICsgJ3B4JztcclxuICAgICAgICBzWzVdLndpZHRoID0gdGhpcy5zYiArICdweCc7XHJcbiAgICAgXHJcbiAgICB9XHJcblxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90by5qcyc7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFRpdGxlIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIGxldCBwcmVmaXggPSBvLnByZWZpeCB8fCAnJztcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAnanVzdGlmeS1jb250ZW50OnJpZ2h0OyB3aWR0aDo2MHB4OyBsaW5lLWhlaWdodDonKyAodGhpcy5oLTgpICsgJ3B4OyBjb2xvcjonICsgdGhpcy5jb2xvcnMudGV4dCApO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5oID09PSAzMSApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCc7XHJcbiAgICAgICAgICAgIHRoaXMuc1sxXS50b3AgPSA4ICsgJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5jWzJdLnN0eWxlLnRvcCA9IDggKyAncHgnO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG5cclxuICAgICAgICBzWzFdLmp1c3RpZnlDb250ZW50ID0gby5hbGlnbiB8fCAnbGVmdCc7XHJcbiAgICAgICAgLy9zWzFdLnRleHRBbGlnbiA9IG8uYWxpZ24gfHwgJ2xlZnQnO1xyXG4gICAgICAgIHNbMV0uZm9udFdlaWdodCA9IG8uZm9udFdlaWdodCB8fCAnYm9sZCc7XHJcblxyXG5cclxuICAgICAgICB0aGlzLmNbMV0udGV4dENvbnRlbnQgPSB0aGlzLnR4dC5zdWJzdHJpbmcoMCwxKS50b1VwcGVyQ2FzZSgpICsgdGhpcy50eHQuc3Vic3RyaW5nKDEpLnJlcGxhY2UoXCItXCIsIFwiIFwiKTtcclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSBwcmVmaXg7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXh0KCB0eHQgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1sxXS50ZXh0Q29udGVudCA9IHR4dDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGV4dDIoIHR4dCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdHh0O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuICAgICAgICB0aGlzLnNbMV0ud2lkdGggPSB0aGlzLncgKyAncHgnOyAvLy0gNTAgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS5sZWZ0ID0gdGhpcy53ICsgJ3B4JzsvLy0gKCA1MCArIDI2ICkgKyAncHgnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRDb2xvciggYyApIHtcclxuICAgICAgICB0aGlzLnNbMV0uY29sb3IgPSBjXHJcbiAgICAgICAgdGhpcy5zWzJdLmNvbG9yID0gY1xyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90by5qcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgU2VsZWN0IGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvIClcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IG8udmFsdWUgfHwgJydcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlXHJcbiAgICAgICAgdGhpcy5vbkFjdGlmID0gby5vbkFjdGlmIHx8IGZ1bmN0aW9uKCl7fVxyXG5cclxuICAgICAgICAvL2xldCBwcmVmaXggPSBvLnByZWZpeCB8fCAnJztcclxuICAgICAgICBjb25zdCBjYyA9IHRoaXMuY29sb3JzXHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgdGhpcy5jc3MuYnV0dG9uICsgJyB0b3A6MXB4OyBiYWNrZ3JvdW5kOicrY2MuYnV0dG9uKyc7IGhlaWdodDonKyh0aGlzLmgtMikrJ3B4OyBib3JkZXI6JysgY2MuYnV0dG9uQm9yZGVyKyc7IGJvcmRlci1yYWRpdXM6MTVweDsgd2lkdGg6MzBweDsgbGVmdDoxMHB4OycgKVxyXG4gICAgICAgIC8vdGhpcy5jWzJdLnN0eWxlLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcblxyXG4gICAgICAgIHRoaXMuY1szXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ2hlaWdodDonICsgKHRoaXMuaC00KSArICdweDsgYmFja2dyb3VuZDonICsgY2MuaW5wdXRCZyArICc7IGJvcmRlckNvbG9yOicgKyBjYy5pbnB1dEJvcmRlcisnOyBib3JkZXItcmFkaXVzOicrdGhpcy5yYWRpdXMrJ3B4OycgKVxyXG4gICAgICAgIHRoaXMuY1szXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWVcclxuXHJcbiAgICAgICAgbGV0IGZsdG9wID0gTWF0aC5mbG9vcih0aGlzLmgqMC41KS03XHJcbiAgICAgICAgdGhpcy5jWzRdID0gdGhpcy5kb20oICdwYXRoJywgdGhpcy5jc3MuYmFzaWMgKyAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOjE0cHg7IGhlaWdodDoxNHB4OyBsZWZ0OjVweDsgdG9wOicrZmx0b3ArJ3B4OycsIHsgZDp0aGlzLnN2Z3NbICdjdXJzb3InIF0sIGZpbGw6Y2MudGV4dCwgc3Ryb2tlOidub25lJ30pXHJcblxyXG4gICAgICAgIHRoaXMuc3RhdCA9IDFcclxuICAgICAgICB0aGlzLmlzQWN0aWYgPSBmYWxzZVxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXN0Wm9uZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbFxyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJydcclxuICAgICAgICBpZiggbC54ID4gdGhpcy5zYSAmJiBsLnggPCB0aGlzLnNhKzMwICkgcmV0dXJuICdvdmVyJ1xyXG4gICAgICAgIHJldHVybiAnMCdcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuICAgIFxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICAvL3RoaXMudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZVxyXG4gICAgICAgICAgICAvL3RoaXMuc2VuZCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApXHJcblxyXG4gICAgICAgIGlmKCAhbmFtZSApIHJldHVybiBmYWxzZVxyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IHRydWVcclxuICAgICAgICAvL3RoaXMudmFsdWUgPSB0aGlzLnZhbHVlc1sgbmFtZS0yIF07XHJcbiAgICAgICAgLy90aGlzLnNlbmQoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgdXAgPSBmYWxzZVxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApXHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAnb3ZlcicgKXtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuICAgICAgICAgICAgdXAgPSB0aGlzLm1vZGUoIHRoaXMuaXNEb3duID8gMyA6IDIgKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHVwID0gdGhpcy5yZXNldCgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdXBcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGFwcGx5ICggdiApIHtcclxuXHJcbiAgICAgICAgdiA9IHYgfHwgJyc7XHJcblxyXG4gICAgICAgIGlmKCB2ICE9PSB0aGlzLnZhbHVlICkge1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdjtcclxuICAgICAgICAgICAgdGhpcy5jWzNdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubW9kZSgxKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5tb2RlKCAzICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vZGUgKCBuICkge1xyXG5cclxuICAgICAgICBsZXQgY2hhbmdlID0gZmFsc2VcclxuICAgICAgICBsZXQgY2MgPSB0aGlzLmNvbG9yc1xyXG5cclxuICAgICAgICBpZiggdGhpcy5zdGF0ICE9PSBuICl7XHJcblxyXG4gICAgICAgICAgICBpZiggbj09PTEgKSB0aGlzLmlzQWN0aWYgPSBmYWxzZTs7XHJcblxyXG4gICAgICAgICAgICBpZiggbj09PTMgKXsgXHJcbiAgICAgICAgICAgICAgICBpZiggIXRoaXMuaXNBY3RpZiApeyB0aGlzLmlzQWN0aWYgPSB0cnVlOyBuPTQ7IHRoaXMub25BY3RpZiggdGhpcyApOyB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHsgdGhpcy5pc0FjdGlmID0gZmFsc2U7IH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYoIG49PT0yICYmIHRoaXMuaXNBY3RpZiApIG4gPSA0O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zdGF0ID0gblxyXG5cclxuICAgICAgICAgICAgc3dpdGNoKCBuICl7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAxOiB0aGlzLnNbIDIgXS5jb2xvciA9IGNjLnRleHQ7IHRoaXMuc1sgMiBdLmJhY2tncm91bmQgPSBjYy5idXR0b247IGJyZWFrOyAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHRoaXMuc1sgMiBdLmNvbG9yID0gY2MudGV4dE92ZXI7IHRoaXMuc1sgMiBdLmJhY2tncm91bmQgPSBjYy5vdmVyb2ZmOyBicmVhazsgLy8gb3ZlclxyXG4gICAgICAgICAgICAgICAgY2FzZSAzOiB0aGlzLnNbIDIgXS5jb2xvciA9IGNjLnRleHRPdmVyOyB0aGlzLnNbIDIgXS5iYWNrZ3JvdW5kID0gY2MuYWN0aW9uOyBicmVhazsgLy8gZG93blxyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiB0aGlzLnNbIDIgXS5jb2xvciA9IGNjLnRleHRTZWxlY3Q7IHRoaXMuc1sgMiBdLmJhY2tncm91bmQgPSBjYy5hY3Rpb247IGJyZWFrOyAvLyBhY3RpZlxyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjaGFuZ2VcclxuXHJcblxyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZSggdGhpcy5pc0FjdGlmID8gNCA6IDEgKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXh0ICggdHh0ICkge1xyXG5cclxuICAgICAgICB0aGlzLmNbM10udGV4dENvbnRlbnQgPSB0eHRcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpXHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zXHJcbiAgICAgICAgc1syXS5sZWZ0ID0gdGhpcy5zYSArICdweCdcclxuICAgICAgICBzWzNdLmxlZnQgPSAodGhpcy5zYSArIDQwKSArICdweCdcclxuICAgICAgICBzWzNdLndpZHRoID0gKHRoaXMuc2IgLSA0MCkgKyAncHgnXHJcbiAgICAgICAgc1s0XS5sZWZ0ID0gKHRoaXMuc2ErOCkgKyAncHgnXHJcblxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90by5qcyc7XHJcbmltcG9ydCB7IEZpbGVzIH0gZnJvbSAnLi4vY29yZS9GaWxlcy5qcyc7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEJpdG1hcCBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApXHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSBvLnZhbHVlIHx8ICcnXHJcbiAgICAgICAgdGhpcy5yZWZUZXh0dXJlID0gby50ZXh0dXJlIHx8IG51bGw7XHJcbiAgICAgICAgdGhpcy5pbWcgPSBudWxsXHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2VcclxuICAgICAgICB0aGlzLm5ldmVybG9jayA9IHRydWVcclxuXHJcblxyXG5cclxuICAgICAgICBjb25zdCBjYyA9IHRoaXMuY29sb3JzXHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgdGhpcy5jc3MuYnV0dG9uICsgJyB0b3A6MXB4OyBiYWNrZ3JvdW5kOicrY2MuYnV0dG9uKyc7IGhlaWdodDonKyh0aGlzLmgtMikrJ3B4OyBib3JkZXI6JytjYy5idXR0b25Cb3JkZXIrJzsgYm9yZGVyLXJhZGl1czoxNXB4OyB3aWR0aDozMHB4OyBsZWZ0OjEwcHg7JyApXHJcblxyXG4gICAgICAgIHRoaXMuY1szXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ2hlaWdodDonICsgKHRoaXMuaC00KSArICdweDsgYmFja2dyb3VuZDonICsgY2MuaW5wdXRCZyArICc7IGJvcmRlckNvbG9yOicgKyBjYy5pbnB1dEJvcmRlcisnOyBib3JkZXItcmFkaXVzOicrdGhpcy5yYWRpdXMrJ3B4OycgKVxyXG4gICAgICAgIHRoaXMuY1szXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgICAgIGxldCBmbHRvcCA9IE1hdGguZmxvb3IodGhpcy5oKjAuNSktN1xyXG4gICAgICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAncGF0aCcsIHRoaXMuY3NzLmJhc2ljICsgJ3Bvc2l0aW9uOmFic29sdXRlOyB3aWR0aDoxNHB4OyBoZWlnaHQ6MTRweDsgbGVmdDo1cHg7IHRvcDonK2ZsdG9wKydweDsnLCB7IGQ6dGhpcy5zdmdzWyAnbG9hZCcgXSwgZmlsbDpjYy50ZXh0LCBzdHJva2U6J25vbmUnfSlcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0ID0gMVxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXN0Wm9uZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG4gICAgICAgIGlmKCBsLnggPiB0aGlzLnNhICYmIGwueCA8IHRoaXMuc2ErMzAgKSByZXR1cm4gJ292ZXInO1xyXG4gICAgICAgIHJldHVybiAnMCdcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuICAgIFxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICAvL3RoaXMudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgLy90aGlzLnNlbmQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIW5hbWUgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAnb3ZlcicgKXtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlXHJcbiAgICAgICAgICAgIEZpbGVzLmxvYWQoIHsgY2FsbGJhY2s6dGhpcy5jaGFuZ2VCaXRtYXAuYmluZCh0aGlzKSB9IClcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuICAgICAgICAvL3RoaXMudmFsdWUgPSB0aGlzLnZhbHVlc1sgbmFtZS0yIF07XHJcbiAgICAgICAgLy90aGlzLnNlbmQoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IHVwID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggbmFtZSA9PT0gJ292ZXInICl7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcbiAgICAgICAgICAgIHVwID0gdGhpcy5tb2RlKCB0aGlzLmlzRG93biA/IDMgOiAyIClcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB1cCA9IHRoaXMucmVzZXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB1cDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNoYW5nZUJpdG1hcCggaW1nLCBmbmFtZSApe1xyXG5cclxuICAgICAgICBpZiggaW1nICl7XHJcbiAgICAgICAgICAgIHRoaXMuaW1nID0gaW1nXHJcbiAgICAgICAgICAgIHRoaXMuYXBwbHkoIGZuYW1lIClcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmltZyA9IG51bGxcclxuICAgICAgICAgICAgdGhpcy5hcHBseSggJ251bGwnIClcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGFwcGx5ICggdiApIHtcclxuXHJcbiAgICAgICAgdiA9IHYgfHwgJyc7XHJcblxyXG4gICAgICAgIGlmKCB2ICE9PSB0aGlzLnZhbHVlICkge1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdjtcclxuICAgICAgICAgICAgdGhpcy5jWzNdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmltZyAhPT0gbnVsbCApe1xyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMub2JqZWN0TGluayAhPT0gbnVsbCApIHRoaXMub2JqZWN0TGlua1sgdGhpcy52YWwgXSA9IHZcclxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmNhbGxiYWNrICkgdGhpcy5jYWxsYmFjayggdGhpcy52YWx1ZSwgdGhpcy5pbWcsIHRoaXMubmFtZSApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubW9kZSgxKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5tb2RlKCAzICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vZGUgKCBuICkge1xyXG5cclxuICAgICAgICBsZXQgY2hhbmdlID0gZmFsc2VcclxuICAgICAgICBsZXQgY2MgPSB0aGlzLmNvbG9yc1xyXG5cclxuICAgICAgICBpZiggdGhpcy5zdGF0ICE9PSBuICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnN0YXQgPSBuXHJcblxyXG4gICAgICAgICAgICBzd2l0Y2goIG4gKXtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHRoaXMuc1sgMiBdLmNvbG9yID0gY2MudGV4dDsgdGhpcy5zWyAyIF0uYmFja2dyb3VuZCA9IGNjLmJ1dHRvbjsgYnJlYWs7IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIGNhc2UgMjogdGhpcy5zWyAyIF0uY29sb3IgPSBjYy50ZXh0T3ZlcjsgdGhpcy5zWyAyIF0uYmFja2dyb3VuZCA9IGNjLm92ZXJvZmY7IGJyZWFrOyAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6IHRoaXMuc1sgMiBdLmNvbG9yID0gY2MudGV4dE92ZXI7IHRoaXMuc1sgMiBdLmJhY2tncm91bmQgPSBjYy5vdmVyOyBicmVhazsgLy8gZG93blxyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiB0aGlzLnNbIDIgXS5jb2xvciA9IGNjLnRleHRTZWxlY3Q7IHRoaXMuc1sgMiBdLmJhY2tncm91bmQgPSBjYy5zZWxlY3Q7IGJyZWFrOyAvLyBhY3RpZlxyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY2hhbmdlO1xyXG5cclxuXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlKCB0aGlzLmlzQWN0aWYgPyA0IDogMSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXh0ICggdHh0ICkge1xyXG5cclxuICAgICAgICB0aGlzLmNbM10udGV4dENvbnRlbnQgPSB0eHQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgc1syXS5sZWZ0ID0gdGhpcy5zYSArICdweCc7XHJcbiAgICAgICAgc1szXS5sZWZ0ID0gKHRoaXMuc2EgKyA0MCkgKyAncHgnO1xyXG4gICAgICAgIHNbM10ud2lkdGggPSAodGhpcy5zYiAtIDQwKSArICdweCc7XHJcbiAgICAgICAgc1s0XS5sZWZ0ID0gKHRoaXMuc2ErOCkgKyAncHgnO1xyXG5cclxuICAgIH1cclxuXHJcbn0iLCIvL2ltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90by5qcyc7XHJcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4vQnV0dG9uLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTZWxlY3RvciBleHRlbmRzIEJ1dHRvbiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgaWYoIG8uc2VsZWN0YWJsZSA9PT0gdW5kZWZpbmVkICkgby5zZWxlY3RhYmxlID0gdHJ1ZVxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcbiAgICAgXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBJdGVtIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMucCA9IDEwMDtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy50eHQ7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSAxO1xyXG5cclxuICAgICAgICB0aGlzLml0eXBlID0gby5pdHlwZSB8fCAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy52YWwgPSB0aGlzLml0eXBlO1xyXG5cclxuICAgICAgICB0aGlzLmdyYXBoID0gdGhpcy5zdmdzWyB0aGlzLml0eXBlIF07XHJcblxyXG4gICAgICAgIGxldCBmbHRvcCA9IE1hdGguZmxvb3IodGhpcy5oKjAuNSktNztcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdwYXRoJywgdGhpcy5jc3MuYmFzaWMgKyAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOjE0cHg7IGhlaWdodDoxNHB4OyBsZWZ0OjVweDsgdG9wOicrZmx0b3ArJ3B4OycsIHsgZDp0aGlzLmdyYXBoLCBmaWxsOnRoaXMuY29sb3JzLnRleHQsIHN0cm9rZTonbm9uZSd9KTtcclxuXHJcbiAgICAgICAgdGhpcy5zWzFdLm1hcmdpbkxlZnQgPSAyMCArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcblxyXG4gICAgICAgIC8vdXAgPSB0aGlzLm1vZGVzKCB0aGlzLmlzRG93biA/IDMgOiAyLCBuYW1lICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4ucmVzZXRJdGVtKCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQoIHRydWUgKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZW5kKCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1aW91dCAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzU2VsZWN0ICkgdGhpcy5tb2RlKDMpO1xyXG4gICAgICAgIGVsc2UgdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1aW92ZXIgKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1NlbGVjdCApIHRoaXMubW9kZSg0KTtcclxuICAgICAgICBlbHNlIHRoaXMubW9kZSgyKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlICgpIHtcclxuICAgICAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgLypyU2l6ZSAoKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuXHJcbiAgICB9Ki9cclxuXHJcbiAgICBtb2RlICggbiApIHtcclxuXHJcbiAgICAgICAgbGV0IGNoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5zdGF0dXMgIT09IG4gKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzID0gbjtcclxuICAgICAgICAgICAgbGV0IHMgPSB0aGlzLnMsIGNjID0gdGhpcy5jb2xvcnNcclxuICAgICAgICBcclxuICAgICAgICAgICAgc3dpdGNoKCBuICl7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAxOiB0aGlzLnN0YXR1cyA9IDE7IHNbMV0uY29sb3IgPSBjYy50ZXh0OyBzWzBdLmJhY2tncm91bmQgPSAnbm9uZSc7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyOiB0aGlzLnN0YXR1cyA9IDI7IHNbMV0uY29sb3IgPSBjYy50ZXh0T3Zlcjsgc1swXS5iYWNrZ3JvdW5kID0gY2MuYmFjazsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6IHRoaXMuc3RhdHVzID0gMzsgc1sxXS5jb2xvciA9IGNjLnRleHRTZWxlY3Q7IHNbMF0uYmFja2dyb3VuZCA9IGNjLnNlbGVjdDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IHRoaXMuc3RhdHVzID0gNDsgc1sxXS5jb2xvciA9IGNjLnRleHRPdmVyOyBzWzBdLmJhY2tncm91bmQgPSBjYy5vdmVyOyBicmVhaztcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG4gICAgICAgLy8gcmV0dXJuIHRoaXMubW9kZSggMSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZWxlY3RlZCAoIGIgKXtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNTZWxlY3QgKSB0aGlzLm1vZGUoMSk7XHJcblxyXG4gICAgICAgIHRoaXMuaXNTZWxlY3QgPSBiIHx8IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1NlbGVjdCApIHRoaXMubW9kZSgzKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvLmpzJ1xyXG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuL0J1dHRvbi5qcydcclxuXHJcbmV4cG9ydCBjbGFzcyBHcmlkIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIC8qdGhpcy52YWx1ZXMgPSBvLnZhbHVlcyB8fCBbXTtcclxuXHJcbiAgICAgICAgaWYoIHR5cGVvZiB0aGlzLnZhbHVlcyA9PT0gJ3N0cmluZycgKSB0aGlzLnZhbHVlcyA9IFsgdGhpcy52YWx1ZXMgXTsqL1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlcyA9IFtdO1xyXG5cclxuICAgICAgICBpZiggby52YWx1ZXMgKXtcclxuICAgICAgICAgICAgaWYoIG8udmFsdWVzIGluc3RhbmNlb2YgQXJyYXkgKXtcclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWVzID0gby52YWx1ZXNcclxuICAgICAgICAgICAgfSBlbHNlIGlmKCBvLnZhbHVlcyBpbnN0YW5jZW9mIFN0cmluZyApe1xyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZXMgPSBbIG8udmFsdWVzIF07XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiggby52YWx1ZXMgaW5zdGFuY2VvZiBPYmplY3QgKXtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVmT2JqZWN0ID0gby52YWx1ZXNcclxuICAgICAgICAgICAgICAgIGZvciggbGV0IGcgaW4gdGhpcy5yZWZPYmplY3QgKSB0aGlzLnZhbHVlcy5wdXNoKCBnIClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sbmcgPSB0aGlzLnZhbHVlcy5sZW5ndGg7XHJcblxyXG5cclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IG8udmFsdWUgfHwgbnVsbDtcclxuXHJcblxyXG5cclxuXHJcbiAgICAgICAgbGV0IGNjID0gdGhpcy5jb2xvcnNcclxuXHJcblxyXG4gICAgICAgIHRoaXMuaXNTZWxlY3RhYmxlID0gby5zZWxlY3RhYmxlIHx8IGZhbHNlXHJcbiAgICAgICAgdGhpcy5zcGFjZXMgPSBvLnNwYWNlcyB8fCBbIGNjLnN4LCBjYy5zeSBdXHJcbiAgICAgICAgdGhpcy5ic2l6ZSA9IG8uYnNpemUgfHwgWyA5MCwgdGhpcy5oIF07XHJcblxyXG4gICAgICAgIHRoaXMuYnNpemVNYXggPSB0aGlzLmJzaXplWzBdXHJcblxyXG4gICAgICAgIHRoaXMudG1wID0gW107XHJcbiAgICAgICAgdGhpcy5zdGF0ID0gW107XHJcbiAgICAgICAgdGhpcy5ncmlkID0gWyAyLCBNYXRoLnJvdW5kKCB0aGlzLmxuZyAqIDAuNSApIF07XHJcblxyXG4gICAgICAgIHRoaXMuaCA9ICggdGhpcy5ncmlkWzFdICogdGhpcy5ic2l6ZVsxXSApICsgKCB0aGlzLmdyaWRbMV0gKiB0aGlzLnNwYWNlc1sxXSApIC8vKyA0IC0gKHRoaXMubXRvcCoyKSAvLysgKHRoaXMuc3BhY2VzWzFdIC0gdGhpcy5tdG9wKTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gJyc7XHJcbiAgICAgICAgLy90aGlzLmNbMl0gPSB0aGlzLmRvbSggJ3RhYmxlJywgdGhpcy5jc3MuYmFzaWMgKyAnd2lkdGg6MTAwJTsgdG9wOicrKHRoaXMuc3BhY2VzWzFdLTIpKydweDsgaGVpZ2h0OmF1dG87IGJvcmRlci1jb2xsYXBzZTpzZXBhcmF0ZTsgYm9yZGVyOm5vbmU7IGJvcmRlci1zcGFjaW5nOiAnKyh0aGlzLnNwYWNlc1swXS0yKSsncHggJysodGhpcy5zcGFjZXNbMV0tMikrJ3B4OycgKTtcclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ3RhYmxlJywgdGhpcy5jc3MuYmFzaWMgKyAnd2lkdGg6MTAwJTsgYm9yZGVyLXNwYWNpbmc6ICcrKHRoaXMuc3BhY2VzWzBdLTIpKydweCAnKyh0aGlzLnNwYWNlc1sxXSkrJ3B4OyBib3JkZXI6bm9uZTsnICk7XHJcblxyXG4gICAgICAgIGxldCBuID0gMCwgYiwgbWlkLCB0ZCwgdHIsIHNlbDtcclxuXHJcbiAgICAgICAgdGhpcy5yZXMgPSAtMVxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2VcclxuICAgICAgICB0aGlzLm5ldmVybG9jayA9IHRydWVcclxuXHJcbiAgICAgICAgdGhpcy5idXR0b25zID0gW107IFxyXG4gICAgICAgIHRoaXMuc3RhdCA9IFtdO1xyXG4gICAgICAgIHRoaXMudG1wWCA9IFtdO1xyXG4gICAgICAgIHRoaXMudG1wWSA9IFtdO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMuZ3JpZFsxXTsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICB0ciA9IHRoaXMuY1syXS5pbnNlcnRSb3coKTtcclxuICAgICAgICAgICAgdHIuc3R5bGUuY3NzVGV4dCA9ICdwb2ludGVyLWV2ZW50czpub25lOyc7XHJcbiAgICAgICAgICAgIGZvciggbGV0IGogPSAwOyBqIDwgdGhpcy5ncmlkWzBdOyBqKysgKXtcclxuXHJcbiAgICAgICAgICAgICAgICB0ZCA9IHRyLmluc2VydENlbGwoKTtcclxuICAgICAgICAgICAgICAgIHRkLnN0eWxlLmNzc1RleHQgPSAncG9pbnRlci1ldmVudHM6bm9uZTsnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLnZhbHVlc1tuXSApe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzZWwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiggdGhpcy52YWx1ZXNbbl0gPT09IHRoaXMudmFsdWUgJiYgdGhpcy5pc1NlbGVjdGFibGUgKSBzZWwgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBiID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcclxuICAgICAgICAgICAgICAgICAgICBiLnN0eWxlLmNzc1RleHQgPSB0aGlzLmNzcy50eHQgKyB0aGlzLmNzcy5idXR0b24gKyAncG9zaXRpb246c3RhdGljOyB0b3A6MXB4OyB3aWR0aDonK3RoaXMuYnNpemVbMF0rJ3B4OyBoZWlnaHQ6JysodGhpcy5ic2l6ZVsxXS0yKSsncHg7IGJvcmRlcjonK2NjLmJvcmRlclNpemUrJ3B4IHNvbGlkICcrY2MuYm9yZGVyKyc7IGxlZnQ6YXV0bzsgcmlnaHQ6YXV0bzsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsnO1xyXG4gICAgICAgICAgICAgICAgICAgIGIuc3R5bGUuYmFja2dyb3VuZCA9IHNlbCA/IGNjLnNlbGVjdCA6IGNjLmJ1dHRvbjtcclxuICAgICAgICAgICAgICAgICAgICBiLnN0eWxlLmNvbG9yID0gc2VsID8gY2MudGV4dFNlbGVjdCA6IGNjLnRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYi5pbm5lckhUTUwgPSB0aGlzLnZhbHVlc1tuXTtcclxuICAgICAgICAgICAgICAgICAgICB0ZC5hcHBlbmRDaGlsZCggYiApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbnMucHVzaChiKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdC5wdXNoKDEpXHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnIClcclxuICAgICAgICAgICAgICAgICAgICBiLnN0eWxlLmNzc1RleHQgPSB0aGlzLmNzcy50eHQgKyAncG9zaXRpb246c3RhdGljOyB3aWR0aDonK3RoaXMuYnNpemVbMF0rJ3B4OyBoZWlnaHQ6Jyt0aGlzLmJzaXplWzFdKydweDsgdGV4dC1hbGlnbjpjZW50ZXI7IGxlZnQ6YXV0bzsgcmlnaHQ6YXV0bzsgYmFja2dyb3VuZDpub25lOydcclxuICAgICAgICAgICAgICAgICAgICB0ZC5hcHBlbmRDaGlsZCggYiApXHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKGo9PT0wKSBiLnN0eWxlLmNzc1RleHQgKz0gJ2Zsb2F0OnJpZ2h0Oyc7XHJcbiAgICAgICAgICAgICAgICBlbHNlIGIuc3R5bGUuY3NzVGV4dCArPSAnZmxvYXQ6bGVmdDsnO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIG4rKztcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc1swXS5ib3JkZXIgPSAnbm9uZSdcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gLTE7XHJcblxyXG4gICAgICAgIGwueSArPSB0aGlzLm10b3BcclxuICAgICAgICBcclxuICAgICAgICBsZXQgdHggPSB0aGlzLnRtcFg7XHJcbiAgICAgICAgbGV0IHR5ID0gdGhpcy50bXBZO1xyXG5cclxuICAgICAgICBsZXQgaWQgPSAtMTtcclxuICAgICAgICBsZXQgYyA9IC0xO1xyXG4gICAgICAgIGxldCBsaW5lID0gLTE7XHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmdyaWRbMF07XHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgIFx0aWYoIGwueCA+IHR4W2ldWzBdICYmIGwueCA8IHR4W2ldWzFdICkgYyA9IGk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpID0gdGhpcy5ncmlkWzFdO1xyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuICAgICAgICAgICAgaWYoIGwueSA+IHR5W2ldWzBdICYmIGwueSA8IHR5W2ldWzFdICkgbGluZSA9IGk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihjIT09LTEgJiYgbGluZSE9PS0xKXtcclxuICAgICAgICAgICAgaWQgPSBjICsgKGxpbmUqMik7XHJcbiAgICAgICAgICAgIGlmKGlkPnRoaXMubG5nLTEpIGlkID0gLTE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaWQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0Rvd24gKSByZXR1cm4gZmFsc2VcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZVxyXG4gICAgICAgIGlmKCB0aGlzLnJlcyAhPT0gLTEgKXtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMudmFsdWVzW3RoaXMucmVzXVxyXG4gICAgICAgICAgICB0aGlzLnNlbmQoKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlIClcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICkgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlIClcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IHVwID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5yZXMgPSB0aGlzLnRlc3Rab25lKCBlIClcclxuXHJcbiAgICAgICAgaWYoIHRoaXMucmVzICE9PSAtMSApe1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpXHJcbiAgICAgICAgICAgIHVwID0gdGhpcy5tb2RlcyggdGhpcy5pc0Rvd24gPyAzIDogMiwgdGhpcy5yZXMgKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgXHR1cCA9IHRoaXMucmVzZXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB1cDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBNT0RFXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vZGVzICggTiA9IDEsIGlkID0gLTEgKSB7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmcsIHcsIG4sIHIgPSBmYWxzZVxyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcblxyXG4gICAgICAgICAgICBuID0gTlxyXG4gICAgICAgICAgICB3ID0gdGhpcy5pc1NlbGVjdGFibGUgPyB0aGlzLnZhbHVlc1sgaSBdID09PSB0aGlzLnZhbHVlIDogZmFsc2VcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmKCBpID09PSBpZCApe1xyXG4gICAgICAgICAgICAgICAgaWYoIHcgJiYgbiA9PT0gMiApIG4gPSAzIFxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbiA9IDFcclxuICAgICAgICAgICAgICAgIGlmKCB3ICkgbiA9IDRcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMubW9kZSggbiwgaSApICkgciA9IHRydWVcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gclxyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb2RlICggbiwgaWQgKSB7XHJcblxyXG4gICAgICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcclxuICAgICAgICBsZXQgY2MgPSB0aGlzLmNvbG9ycywgcyA9IHRoaXMuYnV0dG9uc1xyXG4gICAgICAgIGxldCBpID0gaWRcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuc3RhdFtpZF0gIT09IG4gKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3RhdFtpZF0gPSBuO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICBzd2l0Y2goIG4gKXtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHNbaV0uc3R5bGUuY29sb3IgPSBjYy50ZXh0OyBzW2ldLnN0eWxlLmJhY2tncm91bmQgPSBjYy5idXR0b247IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyOiBzW2ldLnN0eWxlLmNvbG9yID0gY2MudGV4dE92ZXI7IHNbaV0uc3R5bGUuYmFja2dyb3VuZCA9IGNjLm92ZXJvZmY7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOiBzW2ldLnN0eWxlLmNvbG9yID0gY2MudGV4dE92ZXI7IHNbaV0uc3R5bGUuYmFja2dyb3VuZCA9IGNjLm92ZXI7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBzW2ldLnN0eWxlLmNvbG9yID0gY2MudGV4dFNlbGVjdDsgc1tpXS5zdHlsZS5iYWNrZ3JvdW5kID0gY2Muc2VsZWN0OyBicmVhaztcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5yZXMgPSAtMVxyXG4gICAgICAgIHRoaXMuY3Vyc29yKClcclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlcygpXHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBsYWJlbCAoIHN0cmluZywgbiApIHtcclxuXHJcbiAgICAgICAgdGhpcy5idXR0b25zW25dLnRleHRDb250ZW50ID0gc3RyaW5nO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpY29uICggc3RyaW5nLCB5LCBuICkge1xyXG5cclxuICAgICAgICB0aGlzLmJ1dHRvbnNbbl0uc3R5bGUucGFkZGluZyA9ICggeSB8fCAwICkgKydweCAwcHgnO1xyXG4gICAgICAgIHRoaXMuYnV0dG9uc1tuXS5pbm5lckhUTUwgPSBzdHJpbmc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3RXICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHZ3ID0gdGhpcy5zcGFjZXNbMF0qMyArIHRoaXMuYnNpemVNYXgqMiwgcnogPSBmYWxzZTtcclxuICAgICAgICBpZiggdncgPiB0aGlzLncgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnNpemVbMF0gPSAoIHRoaXMudy0odGhpcy5zcGFjZXNbMF0qMykgKSAqIDAuNTtcclxuICAgICAgICAgICAgcnogPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmJzaXplWzBdICE9PSB0aGlzLmJzaXplTWF4ICkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ic2l6ZVswXSA9IHRoaXMuYnNpemVNYXg7XHJcbiAgICAgICAgICAgICAgICByeiA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCAhcnogKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5idXR0b25zLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pIHRoaXMuYnV0dG9uc1tpXS5zdHlsZS53aWR0aCA9IHRoaXMuYnNpemVbMF0gKyAncHgnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKCk7XHJcblxyXG4gICAgICAgIHRoaXMudGVzdFcoKTtcclxuXHJcbiAgICAgICAgbGV0IG4gPSAwLCBiLCBtaWQ7XHJcblxyXG4gICAgICAgIHRoaXMudG1wWCA9IFtdO1xyXG4gICAgICAgIHRoaXMudG1wWSA9IFtdO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBqID0gMDsgaiA8IHRoaXMuZ3JpZFswXTsgaisrICl7XHJcblxyXG4gICAgICAgICAgICBpZihqPT09MCl7XHJcbiAgICAgICAgICAgICAgICBtaWQgPSAoIHRoaXMudyowLjUgKSAtICggdGhpcy5zcGFjZXNbMF0qMC41ICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRtcFgucHVzaCggWyBtaWQtdGhpcy5ic2l6ZVswXSwgbWlkIF0gKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1pZCA9ICggdGhpcy53KjAuNSApICsgKCB0aGlzLnNwYWNlc1swXSowLjUgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudG1wWC5wdXNoKCBbIG1pZCwgbWlkK3RoaXMuYnNpemVbMF0gXSApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbWlkID0gdGhpcy5zcGFjZXNbMV07XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5ncmlkWzFdOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudG1wWS5wdXNoKCBbIG1pZCwgbWlkICsgdGhpcy5ic2l6ZVsxXSBdICk7XHJcbiAgICAgICAgICAgIG1pZCArPSB0aGlzLmJzaXplWzFdICsgdGhpcy5zcGFjZXNbMV07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvLmpzJztcclxuaW1wb3J0IHsgVG9vbHMgfSBmcm9tICcuLi9jb3JlL1Rvb2xzLmpzJztcclxuaW1wb3J0IHsgVjIgfSBmcm9tICcuLi9jb3JlL1YyLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBQYWQyRCBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLmF1dG9XaWR0aCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubWludyAgPSB0aGlzLndcclxuICAgICAgICB0aGlzLmRpYW0gPSBvLmRpYW0gfHwgdGhpcy53IFxyXG5cclxuICAgICAgICAvL3RoaXMubWFyZ2luID0gMTU7XHJcbiAgICAgICAgdGhpcy5wb3MgPSBuZXcgVjIoMCwwKTtcclxuICAgICAgICB0aGlzLm1heFBvcyA9IDkwXHJcblxyXG4gICAgICAgIHRoaXMubW9kZWwgPSBvLnN0eXBlIHx8IDA7XHJcbiAgICAgICAgaWYoIG8ubW9kZSAhPT0gdW5kZWZpbmVkICkgdGhpcy5tb2RlbCA9IG8ubW9kZTtcclxuXHJcbiAgICAgICAgdGhpcy5taW4gPSBvLm1pbiA9PT0gdW5kZWZpbmVkID8gLTEgOiBvLm1pbjtcclxuICAgICAgICB0aGlzLm1heCA9IG8ubWF4ID09PSB1bmRlZmluZWQgPyAxIDogby5tYXg7XHJcblxyXG4gICAgICAgIHRoaXMucmFuZ2UgPSAodGhpcy5tYXggLSB0aGlzLm1pbikqMC41OyAgXHJcblxyXG4gICAgICAgIHRoaXMuY21vZGUgPSAwO1xyXG5cclxuXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnJhbmdlKVxyXG5cclxuICAgICAgICB0aGlzLmNbMF0uc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuXHJcbiAgICAgICAgXHJcblxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5wcmVjaXNpb24gPSBvLnByZWNpc2lvbiA9PT0gdW5kZWZpbmVkID8gMiA6IG8ucHJlY2lzaW9uO1xyXG5cclxuICAgICAgICAvKnRoaXMuYm91bmRzID0ge307XHJcbiAgICAgICAgdGhpcy5ib3VuZHMueDEgPSBvLngxIHx8IC0xO1xyXG4gICAgICAgIHRoaXMuYm91bmRzLngyID0gby54MiB8fCAxO1xyXG4gICAgICAgIHRoaXMuYm91bmRzLnkxID0gby55MSB8fCAtMTtcclxuICAgICAgICB0aGlzLmJvdW5kcy55MiA9IG8ueTIgfHwgMTtcclxuXHJcbiAgICAgICAgdGhpcy5sZXJwWCA9IHRoaXMubGVycCggdGhpcy5tYXJnaW4sIHRoaXMudyAtIHRoaXMubWFyZ2luICwgdGhpcy5ib3VuZHMueDEsIHRoaXMuYm91bmRzLngyICk7XHJcbiAgICAgICAgdGhpcy5sZXJwWSA9IHRoaXMubGVycCggdGhpcy5tYXJnaW4sIHRoaXMudyAtIHRoaXMubWFyZ2luICwgdGhpcy5ib3VuZHMueTEsIHRoaXMuYm91bmRzLnkyICk7XHJcblxyXG4gICAgICAgIHRoaXMuYWxlcnBYID0gdGhpcy5sZXJwKCB0aGlzLmJvdW5kcy54MSwgdGhpcy5ib3VuZHMueDIsIHRoaXMubWFyZ2luLCB0aGlzLncgLSB0aGlzLm1hcmdpbiApO1xyXG4gICAgICAgIHRoaXMuYWxlcnBZID0gdGhpcy5sZXJwKCB0aGlzLmJvdW5kcy55MSwgdGhpcy5ib3VuZHMueTIsIHRoaXMubWFyZ2luLCB0aGlzLncgLSB0aGlzLm1hcmdpbiApOyovXHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSAoIEFycmF5LmlzQXJyYXkoIG8udmFsdWUgKSAmJiBvLnZhbHVlLmxlbmd0aCA9PSAyICkgPyBvLnZhbHVlIDogWyAwLCAwIF07XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5oID0gby5oIHx8IHRoaXMudyArIDEwO1xyXG5cclxuICAgICAgICB0aGlzLmNbMF0uc3R5bGUud2lkdGggPSB0aGlzLncgKyAncHgnO1xyXG5cclxuICAgICAgICAvLyBUaXRsZVxyXG4gICAgICAgIGlmKCB0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCApIHsgLy8gd2l0aCB0aXRsZVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLndpZHRoID0gJzEwMCUnO1xyXG4gICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUuanVzdGlmeUNvbnRlbnQgPSAnY2VudGVyJztcclxuICAgICAgICAgICAgdGhpcy50b3AgPSAxMDtcclxuICAgICAgICAgICAgdGhpcy5oICs9IDEwO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vdGhpcy50b3AgLT0gdGhpcy5tYXJnaW5cclxuXHJcbiAgICAgICAgbGV0IGNjID0gdGhpcy5jb2xvcnNcclxuXHJcblxyXG4gICAgICAgIC8vIFZhbHVlXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAnanVzdGlmeS1jb250ZW50OmNlbnRlcjsgdG9wOicrICggdGhpcy5oIC0gMjAgKSArICdweDsgd2lkdGg6MTAwJTsgY29sb3I6JyArIGNjLnRleHQgKTtcclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG5cclxuICAgICAgICAvLyBQYWRcclxuXHJcbiAgICAgICAgbGV0IHBhZCA9IHRoaXMuZ2V0UGFkMmQoKVxyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggcGFkLCAnZmlsbCcsIGNjLmJhY2ssIDAgKVxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCBwYWQsICdmaWxsJywgY2MuYnV0dG9uLCAxIClcclxuICAgICAgICB0aGlzLnNldFN2ZyggcGFkLCAnc3Ryb2tlJywgY2MuYmFjaywgMiApXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHBhZCwgJ3N0cm9rZScsIGNjLmJhY2ssIDMgKVxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCBwYWQsICdzdHJva2UnLCBjYy50ZXh0LCA0IClcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHBhZCwgJ3ZpZXdCb3gnLCAnMCAwICcrdGhpcy5kaWFtKycgJyt0aGlzLmRpYW0gKVxyXG4gICAgICAgIHRoaXMuc2V0Q3NzKCBwYWQsIHsgd2lkdGg6dGhpcy5kaWFtLCBoZWlnaHQ6dGhpcy5kaWFtLCBsZWZ0OjAsIHRvcDp0aGlzLnRvcCB9KVxyXG5cclxuICAgICAgICB0aGlzLmNbM10gPSBwYWRcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KClcclxuICAgICAgICB0aGlzLnNldFZhbHVlKClcclxuXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRlc3Rab25lICggZSApIHtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbCA9IHRoaXMubG9jYWw7XHJcblxyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG5cclxuXHJcbiAgICAgICAgaWYoIGwueSA8PSB0aGlzLmNbIDEgXS5vZmZzZXRIZWlnaHQgKSByZXR1cm4gJ3RpdGxlJztcclxuICAgICAgICBlbHNlIGlmICggbC55ID4gdGhpcy5oIC0gdGhpcy5jWyAyIF0ub2Zmc2V0SGVpZ2h0ICkgcmV0dXJuICd0ZXh0JztcclxuICAgICAgICBlbHNlIHJldHVybiAncGFkJztcclxuXHJcbiAgICAgICAgLyppZiggKCBsLnggPj0gdGhpcy5tYXJnaW4gKSAmJiAoIGwueCA8PSB0aGlzLncgLSB0aGlzLm1hcmdpbiApICYmICggbC55ID49IHRoaXMudG9wICsgdGhpcy5tYXJnaW4gKSAmJiAoIGwueSA8PSB0aGlzLnRvcCArIHRoaXMudyAtIHRoaXMubWFyZ2luICkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAncGFkJztcclxuICAgICAgICB9Ki9cclxuICAgICAgICBcclxuICAgICAgICAvL3JldHVybiAnJztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZSgwKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLnRlc3Rab25lKGUpID09PSAncGFkJyApIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW9kZSgxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0Rvd24gKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCB4ID0gKHRoaXMudyowLjUpIC0gKCBlLmNsaWVudFggLSB0aGlzLnpvbmUueCApXHJcbiAgICAgICAgbGV0IHkgPSAodGhpcy5kaWFtKjAuNSkgLSAoIGUuY2xpZW50WSAtIHRoaXMuem9uZS55IC0gdGhpcy55dG9wIClcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgbGV0IHIgPSAyNTYgLyB0aGlzLmRpYW1cclxuXHJcbiAgICAgICAgeCA9IC0oeCpyKVxyXG4gICAgICAgIHkgPSAtKHkqcilcclxuXHJcbiAgICAgICAgeCA9IFRvb2xzLmNsYW1wKCB4LCAtdGhpcy5tYXhQb3MsIHRoaXMubWF4UG9zIClcclxuICAgICAgICB5ID0gVG9vbHMuY2xhbXAoIHksIC10aGlzLm1heFBvcywgdGhpcy5tYXhQb3MgKVxyXG5cclxuICAgICAgICAvL2xldCB4ID0gZS5jbGllbnRYIC0gdGhpcy56b25lLng7XHJcbiAgICAgICAgLy9sZXQgeSA9IGUuY2xpZW50WSAtIHRoaXMuem9uZS55IC0gdGhpcy50b3A7XHJcblxyXG4gICAgICAgIC8qaWYoIHggPCB0aGlzLm1hcmdpbiApIHggPSB0aGlzLm1hcmdpbjtcclxuICAgICAgICBpZiggeCA+IHRoaXMudyAtIHRoaXMubWFyZ2luICkgeCA9IHRoaXMudyAtIHRoaXMubWFyZ2luO1xyXG4gICAgICAgIGlmKCB5IDwgdGhpcy5tYXJnaW4gKSB5ID0gdGhpcy5tYXJnaW47XHJcbiAgICAgICAgaWYoIHkgPiB0aGlzLncgLSB0aGlzLm1hcmdpbiApIHkgPSB0aGlzLncgLSB0aGlzLm1hcmdpbjsqL1xyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKHgseSlcclxuXHJcbiAgICAgICAgdGhpcy5zZXRQb3MoIFsgeCAsIHkgXSApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudXBkYXRlKCB0cnVlICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vZGUgKCBtb2RlICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jbW9kZSA9PT0gbW9kZSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IGNjID0gdGhpcy5jb2xvcnNcclxuXHJcbiAgICAgICAgc3dpdGNoKCBtb2RlICl7XHJcbiAgICAgICAgICAgIGNhc2UgMDogLy8gYmFzZVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc1syXS5jb2xvciA9IGNjLnRleHQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsIGNjLmJhY2ssIDApXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsIGNjLmJ1dHRvbiwgMSlcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCBjYy5iYWNrLCAyKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIGNjLmJhY2ssIDMpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgY2MudGV4dCwgNCApXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogLy8gZG93blxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc1syXS5jb2xvciA9IGNjLnRleHRTZWxlY3Q7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsIGNjLmJhY2tvZmYsIDApXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsIGNjLm92ZXJvZmYsIDEpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgY2MuYmFja29mZiwgMilcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCBjYy5iYWNrb2ZmLCAzKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIGNjLnRleHRTZWxlY3QsIDQgKVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jbW9kZSA9IG1vZGU7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG5cclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlICggdXAgKSB7XHJcblxyXG4gICAgICAgIC8vaWYoIHVwID09PSB1bmRlZmluZWQgKSB1cCA9IHRydWU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVTVkcoKTtcclxuXHJcbiAgICAgICAgaWYoIHVwICkgdGhpcy5zZW5kKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVNWRygpIHtcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLm1vZGVsID09IDEgKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAneTEnLCB0aGlzLnBvcy55LCAyICk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICd5MicsIHRoaXMucG9zLnksIDIgKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICd4MScsIHRoaXMucG9zLngsIDMgKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3gyJywgdGhpcy5wb3MueCwgMyApO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeCcsIHRoaXMucG9zLngsIDQgKTtcclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3knLCB0aGlzLnBvcy55LCA0ICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldFBvcyAoIHAgKSB7XHJcblxyXG4gICAgICAgIC8vaWYoIHAgPT09IHVuZGVmaW5lZCApIHAgPSBbIHRoaXMudyAvIDIsIHRoaXMudyAvIDIgXTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3Muc2V0KCBwWzBdKzEyOCAsIHBbMV0rMTI4ICk7XHJcblxyXG4gICAgICAgIGxldCByID0gMS90aGlzLm1heFBvc1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlWzBdID0gKChwWzBdKnIpKnRoaXMucmFuZ2UpLnRvRml4ZWQoIHRoaXMucHJlY2lzaW9uICk7XHJcbiAgICAgICAgdGhpcy52YWx1ZVsxXSA9ICgocFsxXSpyKSp0aGlzLnJhbmdlKS50b0ZpeGVkKCB0aGlzLnByZWNpc2lvbiApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRWYWx1ZSAoIHYsIHVwID0gZmFsc2UgKSB7XHJcblxyXG4gICAgICAgIGlmKCB2ID09PSB1bmRlZmluZWQgKSB2ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICAgICAgLyppZiAoIHZbMF0gPCB0aGlzLmJvdW5kcy54MSApIHZbMF0gPSB0aGlzLmJvdW5kcy54MTtcclxuICAgICAgICBpZiAoIHZbMF0gPiB0aGlzLmJvdW5kcy54MiApIHZbMF0gPSB0aGlzLmJvdW5kcy54MjtcclxuICAgICAgICBpZiAoIHZbMV0gPCB0aGlzLmJvdW5kcy55MSApIHZbMV0gPSB0aGlzLmJvdW5kcy55MTtcclxuICAgICAgICBpZiAoIHZbMV0gPiB0aGlzLmJvdW5kcy55MiApIHZbMV0gPSB0aGlzLmJvdW5kcy55MjsqL1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlWzBdID0gTWF0aC5taW4oIHRoaXMubWF4LCBNYXRoLm1heCggdGhpcy5taW4sIHZbMF0gKSApLnRvRml4ZWQoIHRoaXMucHJlY2lzaW9uICkgKiAxO1xyXG4gICAgICAgIHRoaXMudmFsdWVbMV0gPSBNYXRoLm1pbiggdGhpcy5tYXgsIE1hdGgubWF4KCB0aGlzLm1pbiwgdlsxXSApICkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKSAqIDE7XHJcblxyXG4gICAgICAgIHRoaXMucG9zLnNldCggKCh0aGlzLnZhbHVlWzBdL3RoaXMucmFuZ2UpKnRoaXMubWF4UG9zKSsxMjggICwgKCh0aGlzLnZhbHVlWzFdL3RoaXMucmFuZ2UpKnRoaXMubWF4UG9zKSsxMjggKVxyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMucG9zKVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZSggdXAgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLypsZXJwKCBzMSwgczIsIGQxLCBkMiwgYyA9IHRydWUgKSB7XHJcblxyXG4gICAgICAgIGxldCBzID0gKCBkMiAtIGQxICkgLyAoIHMyIC0gczEgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGMgPyAoIHYgKSA9PiB7IFxyXG4gICAgICAgICAgICByZXR1cm4gKCAoIHYgPCBzMSA/IHMxIDogdiA+IHMyID8gczIgOiB2ICkgLSBzMSApICogcyArIGQxXHJcbiAgICAgICAgfSA6ICggdiApID0+IHsgXHJcbiAgICAgICAgICByZXR1cm4gKCB2IC0gczEgKSAqIHMgKyBkMVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9Ki9cclxuXHJcbn0iLCJcclxuaW1wb3J0IHsgQm9vbCB9IGZyb20gJy4uL3Byb3RvL0Jvb2wuanMnO1xyXG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9wcm90by9CdXR0b24uanMnO1xyXG5pbXBvcnQgeyBDaXJjdWxhciB9IGZyb20gJy4uL3Byb3RvL0NpcmN1bGFyLmpzJztcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi9wcm90by9Db2xvci5qcyc7XHJcbmltcG9ydCB7IEZwcyB9IGZyb20gJy4uL3Byb3RvL0Zwcy5qcyc7XHJcbmltcG9ydCB7IEdyYXBoIH0gZnJvbSAnLi4vcHJvdG8vR3JhcGguanMnO1xyXG5pbXBvcnQgeyBHcm91cCAgfSBmcm9tICcuLi9wcm90by9Hcm91cC5qcyc7XHJcbmltcG9ydCB7IEpveXN0aWNrIH0gZnJvbSAnLi4vcHJvdG8vSm95c3RpY2suanMnO1xyXG5pbXBvcnQgeyBLbm9iIH0gZnJvbSAnLi4vcHJvdG8vS25vYi5qcyc7XHJcbmltcG9ydCB7IExpc3QgfSBmcm9tICcuLi9wcm90by9MaXN0LmpzJztcclxuaW1wb3J0IHsgTnVtZXJpYyB9IGZyb20gJy4uL3Byb3RvL051bWVyaWMuanMnO1xyXG5pbXBvcnQgeyBTbGlkZSB9IGZyb20gJy4uL3Byb3RvL1NsaWRlLmpzJztcclxuaW1wb3J0IHsgVGV4dElucHV0IH0gZnJvbSAnLi4vcHJvdG8vVGV4dElucHV0LmpzJztcclxuaW1wb3J0IHsgVGl0bGUgfSBmcm9tICcuLi9wcm90by9UaXRsZS5qcyc7XHJcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4uL3Byb3RvL1NlbGVjdC5qcyc7XHJcbmltcG9ydCB7IEJpdG1hcCB9IGZyb20gJy4uL3Byb3RvL0JpdG1hcC5qcyc7XHJcbmltcG9ydCB7IFNlbGVjdG9yIH0gZnJvbSAnLi4vcHJvdG8vU2VsZWN0b3IuanMnO1xyXG5pbXBvcnQgeyBFbXB0eSB9IGZyb20gJy4uL3Byb3RvL0VtcHR5LmpzJztcclxuaW1wb3J0IHsgSXRlbSB9IGZyb20gJy4uL3Byb3RvL0l0ZW0uanMnO1xyXG5pbXBvcnQgeyBHcmlkIH0gZnJvbSAnLi4vcHJvdG8vR3JpZC5qcyc7XHJcbmltcG9ydCB7IFBhZDJEIH0gZnJvbSAnLi4vcHJvdG8vUGFkMkQuanMnO1xyXG5pbXBvcnQgeyBSb290cyB9IGZyb20gJy4vUm9vdHMuanMnO1xyXG5cclxuZXhwb3J0IGNvbnN0IGFkZCA9IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgbGV0IGEgPSBhcmd1bWVudHM7IFxyXG5cclxuICAgICAgICBsZXQgdHlwZSwgbywgcmVmID0gZmFsc2UsIG4gPSBudWxsO1xyXG5cclxuICAgICAgICBpZiggdHlwZW9mIGFbMF0gPT09ICdzdHJpbmcnICl7IFxyXG5cclxuICAgICAgICAgICAgdHlwZSA9IGFbMF07XHJcbiAgICAgICAgICAgIG8gPSBhWzFdIHx8IHt9O1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKCB0eXBlb2YgYVswXSA9PT0gJ29iamVjdCcgKXsgLy8gbGlrZSBkYXQgZ3VpXHJcblxyXG4gICAgICAgICAgICByZWYgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiggYVsyXSA9PT0gdW5kZWZpbmVkICkgW10ucHVzaC5jYWxsKGEsIHt9KTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0eXBlID0gYVsyXS50eXBlID8gYVsyXS50eXBlIDogYXV0b1R5cGUoIGFbMF1bYVsxXV0sIGFbMl0gKTtcclxuXHJcbiAgICAgICAgICAgIG8gPSBhWzJdO1xyXG4gICAgICAgICAgICBvLm5hbWUgPSBhWzFdO1xyXG4gICAgICAgICAgICBpZiAoby5oYXNPd25Qcm9wZXJ0eShcImRpc3BsYXlOYW1lXCIpKSBvLm5hbWUgPSBvLmRpc3BsYXlOYW1lO1xyXG5cclxuICAgICAgICAgICAgaWYoIHR5cGUgPT09ICdsaXN0JyAmJiAhby5saXN0ICl7IG8ubGlzdCA9IGFbMF1bYVsxXV07IH1cclxuICAgICAgICAgICAgZWxzZSBvLnZhbHVlID0gYVswXVthWzFdXTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHR5cGUudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICdncm91cCcgKXsgXHJcbiAgICAgICAgICAgIG8uYWRkID0gYWRkO1xyXG4gICAgICAgICAgICAvL28uZHggPSA4XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzd2l0Y2goIG5hbWUgKXtcclxuXHJcbiAgICAgICAgICAgIGNhc2UgJ2Jvb2wnOiBjYXNlICdib29sZWFuJzogbiA9IG5ldyBCb29sKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnYnV0dG9uJzogbiA9IG5ldyBCdXR0b24obyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdjaXJjdWxhcic6IG4gPSBuZXcgQ2lyY3VsYXIobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdjb2xvcic6IG4gPSBuZXcgQ29sb3Iobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdmcHMnOiBuID0gbmV3IEZwcyhvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2dyYXBoJzogbiA9IG5ldyBHcmFwaChvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2dyb3VwJzogbiA9IG5ldyBHcm91cChvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2pveXN0aWNrJzogbiA9IG5ldyBKb3lzdGljayhvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2tub2InOiBuID0gbmV3IEtub2Iobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdsaXN0JzogbiA9IG5ldyBMaXN0KG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnbnVtZXJpYyc6IGNhc2UgJ251bWJlcic6IG4gPSBuZXcgTnVtZXJpYyhvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3NsaWRlJzogbiA9IG5ldyBTbGlkZShvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3RleHRJbnB1dCc6IGNhc2UgJ3N0cmluZyc6IG4gPSBuZXcgVGV4dElucHV0KG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAndGl0bGUnOiBjYXNlICd0ZXh0JzogbiA9IG5ldyBUaXRsZShvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3NlbGVjdCc6IG4gPSBuZXcgU2VsZWN0KG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnYml0bWFwJzogbiA9IG5ldyBCaXRtYXAobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdzZWxlY3Rvcic6IG4gPSBuZXcgU2VsZWN0b3Iobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdlbXB0eSc6IGNhc2UgJ3NwYWNlJzogbiA9IG5ldyBFbXB0eShvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2l0ZW0nOiBuID0gbmV3IEl0ZW0obyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdncmlkJzogbiA9IG5ldyBHcmlkKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAncGFkMmQnOiBjYXNlICdwYWQnOiBuID0gbmV3IFBhZDJEKG8pOyBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgaWYoIG4gIT09IG51bGwgKXtcclxuXHJcbiAgICAgICAgICAgIFJvb3RzLm5lZWRSZXNpemUgPSB0cnVlXHJcblxyXG4gICAgICAgICAgICBpZiggcmVmICkgbi5zZXRSZWZlcmVuY3koIGFbMF0sIGFbMV0gKTtcclxuICAgICAgICAgICAgcmV0dXJuIG47XHJcblxyXG4gICAgICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBhdXRvVHlwZSA9IGZ1bmN0aW9uICggdiwgbyApIHtcclxuXHJcbiAgICBsZXQgdHlwZSA9ICdzbGlkZSdcclxuXHJcbiAgICBpZiggdHlwZW9mIHYgPT09ICdib29sZWFuJyApIHR5cGUgPSAnYm9vbCcgXHJcbiAgICBlbHNlIGlmKCB0eXBlb2YgdiA9PT0gJ3N0cmluZycgKXsgXHJcblxyXG4gICAgICAgIGlmKCB2LnN1YnN0cmluZygwLDEpID09PSAnIycgKSB0eXBlID0gJ2NvbG9yJ1xyXG4gICAgICAgIGVsc2UgdHlwZSA9ICdzdHJpbmcnIFxyXG5cclxuICAgIH0gZWxzZSBpZiggdHlwZW9mIHYgPT09ICdudW1iZXInICl7IFxyXG5cclxuICAgICAgICBpZiggby5jdHlwZSApIHR5cGUgPSAnY29sb3InXHJcbiAgICAgICAgZWxzZSB0eXBlID0gJ3NsaWRlJ1xyXG5cclxuICAgIH0gZWxzZSBpZiggdHlwZW9mIHYgPT09ICdhcnJheScgJiYgdiBpbnN0YW5jZW9mIEFycmF5ICl7XHJcblxyXG4gICAgICAgIGlmKCB0eXBlb2YgdlswXSA9PT0gJ251bWJlcicgKSB0eXBlID0gJ251bWJlcidcclxuICAgICAgICBlbHNlIGlmKCB0eXBlb2YgdlswXSA9PT0gJ3N0cmluZycgKSB0eXBlID0gJ2xpc3QnXHJcblxyXG4gICAgfSBlbHNlIGlmKCB0eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgdiBpbnN0YW5jZW9mIE9iamVjdCApe1xyXG5cclxuICAgICAgICBpZiggdi54ICE9PSB1bmRlZmluZWQgKSB0eXBlID0gJ251bWJlcidcclxuICAgICAgICBlbHNlIHR5cGUgPSAnbGlzdCdcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHR5cGVcclxuXHJcbn0iLCJpbXBvcnQgeyBSb290cyB9IGZyb20gXCIuL1Jvb3RzLmpzXCI7XHJcbmltcG9ydCB7IFRvb2xzIH0gZnJvbSBcIi4vVG9vbHMuanNcIjtcclxuaW1wb3J0IHsgYWRkIH0gZnJvbSBcIi4vYWRkLmpzXCI7XHJcbmltcG9ydCB7IFYyIH0gZnJvbSBcIi4vVjIuanNcIjtcclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIGx0aCAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sby10aFxyXG4gKi9cclxuXHJcbmV4cG9ydCBjbGFzcyBHdWkge1xyXG4gIGNvbnN0cnVjdG9yKG8gPSB7fSkge1xyXG4gICAgdGhpcy5pc0d1aSA9IHRydWU7XHJcblxyXG4gICAgdGhpcy5uYW1lID0gXCJndWlcIjtcclxuXHJcbiAgICAvLyBmb3IgM2RcclxuICAgIHRoaXMuY2FudmFzID0gbnVsbDtcclxuICAgIHRoaXMuc2NyZWVuID0gbnVsbDtcclxuICAgIHRoaXMucGxhbmUgPSBvLnBsYW5lIHx8IG51bGw7XHJcblxyXG4gICAgLy8gY29sb3JcclxuICAgIGlmIChvLmNvbmZpZykgby5jb2xvcnMgPSBvLmNvbmZpZztcclxuICAgIGlmIChvLmNvbG9ycykgdGhpcy5zZXRDb25maWcoby5jb2xvcnMpO1xyXG4gICAgZWxzZSB0aGlzLmNvbG9ycyA9IFRvb2xzLmRlZmluZUNvbG9yKG8pO1xyXG5cclxuICAgIC8vdGhpcy5jbGVhbm5pbmcgPSBmYWxzZVxyXG5cclxuICAgIC8vIHN0eWxlXHJcbiAgICB0aGlzLmNzcyA9IFRvb2xzLmNsb25lQ3NzKCk7XHJcblxyXG4gICAgdGhpcy5pc1Jlc2V0ID0gdHJ1ZTtcclxuICAgIHRoaXMudG1wQWRkID0gbnVsbDtcclxuICAgIC8vdGhpcy50bXBIID0gMFxyXG5cclxuICAgIHRoaXMuaXNDYW52YXMgPSBvLmlzQ2FudmFzIHx8IGZhbHNlO1xyXG4gICAgdGhpcy5pc0NhbnZhc09ubHkgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBNb2RpZmllZCBieSBGZWRlbWFyaW5vXHJcbiAgICAvLyBvcHRpb24gdG8gZGVmaW5lIHdoZXRoZXIgdGhlIGV2ZW50IGxpc3RlbmVycyBzaG91bGQgYmUgYWRkZWQgb3Igbm90XHJcbiAgICBSb290cy5hZGRET01FdmVudExpc3RlbmVycyA9IG8uaGFzT3duUHJvcGVydHkoXCJhZGRET01FdmVudExpc3RlbmVyc1wiKVxyXG4gICAgICA/IG8uYWRkRE9NRXZlbnRMaXN0ZW5lcnNcclxuICAgICAgOiB0cnVlO1xyXG5cclxuICAgIHRoaXMuY2FsbGJhY2sgPSBvLmNhbGxiYWNrID09PSB1bmRlZmluZWQgPyBudWxsIDogby5jYWxsYmFjaztcclxuXHJcbiAgICB0aGlzLmZvcmNlSGVpZ2h0ID0gby5tYXhIZWlnaHQgfHwgMDtcclxuICAgIHRoaXMubG9ja0hlaWdodCA9IG8ubG9ja0hlaWdodCB8fCBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmlzSXRlbU1vZGUgPSBvLml0ZW1Nb2RlICE9PSB1bmRlZmluZWQgPyBvLml0ZW1Nb2RlIDogZmFsc2U7XHJcblxyXG4gICAgdGhpcy5jbiA9IFwiXCI7XHJcblxyXG4gICAgLy8gc2l6ZSBkZWZpbmVcclxuICAgIHRoaXMuc2l6ZSA9IFRvb2xzLnNpemU7XHJcbiAgICBpZiAoby5wICE9PSB1bmRlZmluZWQpIHRoaXMuc2l6ZS5wID0gby5wO1xyXG4gICAgaWYgKG8udyAhPT0gdW5kZWZpbmVkKSB0aGlzLnNpemUudyA9IG8udztcclxuICAgIGlmIChvLmggIT09IHVuZGVmaW5lZCkgdGhpcy5zaXplLmggPSBvLmg7XHJcbiAgICBpZiAoby5zICE9PSB1bmRlZmluZWQpIHRoaXMuc2l6ZS5zID0gby5zO1xyXG5cclxuICAgIHRoaXMuc2l6ZS5oID0gdGhpcy5zaXplLmggPCAxMSA/IDExIDogdGhpcy5zaXplLmg7XHJcblxyXG4gICAgLy8gbG9jYWwgbW91c2UgYW5kIHpvbmVcclxuICAgIHRoaXMubG9jYWwgPSBuZXcgVjIoKS5uZWcoKTtcclxuICAgIHRoaXMuem9uZSA9IHsgeDogMCwgeTogMCwgdzogdGhpcy5zaXplLncsIGg6IDAgfTtcclxuXHJcbiAgICAvLyB2aXJ0dWFsIG1vdXNlXHJcbiAgICB0aGlzLm1vdXNlID0gbmV3IFYyKCkubmVnKCk7XHJcblxyXG4gICAgdGhpcy5oID0gMDtcclxuICAgIC8vdGhpcy5wcmV2WSA9IC0xO1xyXG4gICAgdGhpcy5zdyA9IDA7XHJcblxyXG4gICAgdGhpcy5tYXJnaW4gPSB0aGlzLmNvbG9ycy5zeTtcclxuICAgIHRoaXMubWFyZ2luRGl2ID0gVG9vbHMuaXNEaXZpZCh0aGlzLm1hcmdpbik7XHJcblxyXG4gICAgLy8gYm90dG9tIGFuZCBjbG9zZSBoZWlnaHRcclxuICAgIHRoaXMuaXNXaXRoQ2xvc2UgPSBvLmNsb3NlICE9PSB1bmRlZmluZWQgPyBvLmNsb3NlIDogdHJ1ZTtcclxuICAgIHRoaXMuYmggPSAhdGhpcy5pc1dpdGhDbG9zZSA/IDAgOiB0aGlzLnNpemUuaDtcclxuXHJcbiAgICB0aGlzLmF1dG9SZXNpemUgPSBvLmF1dG9SZXNpemUgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBvLmF1dG9SZXNpemU7XHJcblxyXG4gICAgLy8gZGVmYXVsdCBwb3NpdGlvblxyXG4gICAgdGhpcy5pc0NlbnRlciA9IG8uY2VudGVyIHx8IGZhbHNlO1xyXG4gICAgdGhpcy5jc3NHdWkgPVxyXG4gICAgICBvLmNzcyAhPT0gdW5kZWZpbmVkID8gby5jc3MgOiB0aGlzLmlzQ2VudGVyID8gXCJcIiA6IFwicmlnaHQ6MTBweDtcIjtcclxuXHJcbiAgICB0aGlzLmlzT3BlbiA9IG8ub3BlbiAhPT0gdW5kZWZpbmVkID8gby5vcGVuIDogdHJ1ZTtcclxuICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzU2Nyb2xsID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy51aXMgPSBbXTtcclxuICAgIHRoaXMuY3VycmVudCA9IC0xO1xyXG4gICAgdGhpcy5wcm90byA9IG51bGw7XHJcbiAgICB0aGlzLmlzRW1wdHkgPSB0cnVlO1xyXG4gICAgdGhpcy5kZWNhbCA9IDA7XHJcbiAgICB0aGlzLnJhdGlvID0gMTtcclxuICAgIHRoaXMub3kgPSAwO1xyXG5cclxuICAgIHRoaXMuaXNOZXdUYXJnZXQgPSBmYWxzZTtcclxuXHJcbiAgICBsZXQgY2MgPSB0aGlzLmNvbG9ycztcclxuXHJcbiAgICB0aGlzLmNvbnRlbnQgPSBUb29scy5kb20oXHJcbiAgICAgIFwiZGl2XCIsXHJcbiAgICAgIHRoaXMuY3NzLmJhc2ljICtcclxuICAgICAgICBcIiB3aWR0aDowcHg7IGhlaWdodDphdXRvOyB0b3A6MHB4OyBiYWNrZ3JvdW5kOlwiICtcclxuICAgICAgICBjYy5jb250ZW50ICtcclxuICAgICAgICBcIjsgXCIgK1xyXG4gICAgICAgIHRoaXMuY3NzR3VpXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuaW5uZXJDb250ZW50ID0gVG9vbHMuZG9tKFxyXG4gICAgICBcImRpdlwiLFxyXG4gICAgICB0aGlzLmNzcy5iYXNpYyArXHJcbiAgICAgICAgXCJ3aWR0aDoxMDAlOyB0b3A6MDsgbGVmdDowOyBoZWlnaHQ6YXV0bzsgb3ZlcmZsb3c6aGlkZGVuO1wiXHJcbiAgICApO1xyXG4gICAgLy90aGlzLmlubmVyQ29udGVudCA9IFRvb2xzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgdGhpcy5jc3MuYnV0dG9uICsgJ3dpZHRoOjEwMCU7IHRvcDowOyBsZWZ0OjA7IGhlaWdodDphdXRvOyBvdmVyZmxvdzpoaWRkZW47Jyk7XHJcbiAgICB0aGlzLmNvbnRlbnQuYXBwZW5kQ2hpbGQodGhpcy5pbm5lckNvbnRlbnQpO1xyXG5cclxuICAgIC8vdGhpcy5pbm5lciA9IFRvb2xzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3dpZHRoOjEwMCU7IGxlZnQ6MDsgJylcclxuICAgIHRoaXMudXNlRmxleCA9IHRydWU7XHJcbiAgICBsZXQgZmxleGlibGUgPSB0aGlzLnVzZUZsZXggPyBcImRpc3BsYXk6ZmxleDsgZmxleC1mbG93OiByb3cgd3JhcDtcIiA6IFwiXCI7IC8vJyBkaXNwbGF5OmZsZXg7IGp1c3RpZnktY29udGVudDpzdGFydDsgYWxpZ24taXRlbXM6c3RhcnQ7ZmxleC1kaXJlY3Rpb246IGNvbHVtbjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IGFsaWduLWl0ZW1zOiBjZW50ZXI7JztcclxuICAgIHRoaXMuaW5uZXIgPSBUb29scy5kb20oXHJcbiAgICAgIFwiZGl2XCIsXHJcbiAgICAgIHRoaXMuY3NzLmJhc2ljICsgZmxleGlibGUgKyBcIndpZHRoOjEwMCU7IGxlZnQ6MDsgXCJcclxuICAgICk7XHJcbiAgICB0aGlzLmlubmVyQ29udGVudC5hcHBlbmRDaGlsZCh0aGlzLmlubmVyKTtcclxuXHJcbiAgICAvLyBzY3JvbGxcclxuICAgIHRoaXMuc2Nyb2xsQkcgPSBUb29scy5kb20oXHJcbiAgICAgIFwiZGl2XCIsXHJcbiAgICAgIHRoaXMuY3NzLmJhc2ljICtcclxuICAgICAgICBcInJpZ2h0OjA7IHRvcDowOyB3aWR0aDpcIiArXHJcbiAgICAgICAgKHRoaXMuc2l6ZS5zIC0gMSkgK1xyXG4gICAgICAgIFwicHg7IGhlaWdodDoxMHB4OyBkaXNwbGF5Om5vbmU7IGJhY2tncm91bmQ6XCIgK1xyXG4gICAgICAgIGNjLmJhY2tncm91bmQgK1xyXG4gICAgICAgIFwiO1wiXHJcbiAgICApO1xyXG4gICAgdGhpcy5jb250ZW50LmFwcGVuZENoaWxkKHRoaXMuc2Nyb2xsQkcpO1xyXG5cclxuICAgIHRoaXMuc2Nyb2xsID0gVG9vbHMuZG9tKFxyXG4gICAgICBcImRpdlwiLFxyXG4gICAgICB0aGlzLmNzcy5iYXNpYyArXHJcbiAgICAgICAgXCJiYWNrZ3JvdW5kOlwiICtcclxuICAgICAgICBjYy5idXR0b24gK1xyXG4gICAgICAgIFwiOyByaWdodDoycHg7IHRvcDowOyB3aWR0aDpcIiArXHJcbiAgICAgICAgKHRoaXMuc2l6ZS5zIC0gNCkgK1xyXG4gICAgICAgIFwicHg7IGhlaWdodDoxMHB4O1wiXHJcbiAgICApO1xyXG4gICAgdGhpcy5zY3JvbGxCRy5hcHBlbmRDaGlsZCh0aGlzLnNjcm9sbCk7XHJcblxyXG4gICAgLy8gYm90dG9tIGJ1dHRvblxyXG4gICAgdGhpcy5ib3R0b21UZXh0ID0gby5ib3R0b21UZXh0IHx8IFtcIm9wZW5cIiwgXCJjbG9zZVwiXTtcclxuXHJcbiAgICBsZXQgciA9IGNjLnJhZGl1cztcclxuICAgIHRoaXMuYm90dG9tID0gVG9vbHMuZG9tKFxyXG4gICAgICBcImRpdlwiLFxyXG4gICAgICB0aGlzLmNzcy50eHQgK1xyXG4gICAgICAgIFwid2lkdGg6MTAwJTsgdG9wOmF1dG87IGJvdHRvbTowOyBsZWZ0OjA7IGJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzOlwiICtcclxuICAgICAgICByICtcclxuICAgICAgICBcInB4OyBib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOlwiICtcclxuICAgICAgICByICtcclxuICAgICAgICBcInB4OyBqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOyBoZWlnaHQ6XCIgK1xyXG4gICAgICAgIHRoaXMuYmggK1xyXG4gICAgICAgIFwicHg7IGxpbmUtaGVpZ2h0OlwiICtcclxuICAgICAgICAodGhpcy5iaCAtIDUpICtcclxuICAgICAgICBcInB4OyBjb2xvcjpcIiArXHJcbiAgICAgICAgY2MudGV4dCArXHJcbiAgICAgICAgXCI7XCJcclxuICAgICk7IC8vIGJvcmRlci10b3A6MXB4IHNvbGlkICcrVG9vbHMuY29sb3JzLnN0cm9rZSsnOycpO1xyXG4gICAgdGhpcy5jb250ZW50LmFwcGVuZENoaWxkKHRoaXMuYm90dG9tKTtcclxuICAgIHRoaXMuYm90dG9tLnRleHRDb250ZW50ID0gdGhpcy5pc09wZW5cclxuICAgICAgPyB0aGlzLmJvdHRvbVRleHRbMV1cclxuICAgICAgOiB0aGlzLmJvdHRvbVRleHRbMF07XHJcbiAgICB0aGlzLmJvdHRvbS5zdHlsZS5iYWNrZ3JvdW5kID0gY2MuYmFja2dyb3VuZDtcclxuXHJcbiAgICAvL1xyXG5cclxuICAgIHRoaXMucGFyZW50ID0gby5wYXJlbnQgIT09IHVuZGVmaW5lZCA/IG8ucGFyZW50IDogbnVsbDtcclxuICAgIHRoaXMucGFyZW50ID0gby50YXJnZXQgIT09IHVuZGVmaW5lZCA/IG8udGFyZ2V0IDogdGhpcy5wYXJlbnQ7XHJcblxyXG4gICAgaWYgKHRoaXMucGFyZW50ID09PSBudWxsICYmICF0aGlzLmlzQ2FudmFzKSB7XHJcbiAgICAgIHRoaXMucGFyZW50ID0gZG9jdW1lbnQuYm9keTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5wYXJlbnQgIT09IG51bGwpIHRoaXMucGFyZW50LmFwcGVuZENoaWxkKHRoaXMuY29udGVudCk7XHJcblxyXG4gICAgaWYgKHRoaXMuaXNDYW52YXMgJiYgdGhpcy5wYXJlbnQgPT09IG51bGwpIHRoaXMuaXNDYW52YXNPbmx5ID0gdHJ1ZTtcclxuXHJcbiAgICBpZiAoIXRoaXMuaXNDYW52YXNPbmx5KSB7XHJcbiAgICAgIHRoaXMuY29udGVudC5zdHlsZS5wb2ludGVyRXZlbnRzID0gXCJhdXRvXCI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmNvbnRlbnQuc3R5bGUubGVmdCA9IFwiMHB4XCI7XHJcbiAgICAgIHRoaXMuY29udGVudC5zdHlsZS5yaWdodCA9IFwiYXV0b1wiO1xyXG4gICAgICBvLnRyYW5zaXRpb24gPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGhlaWdodCB0cmFuc2l0aW9uXHJcbiAgICB0aGlzLnRyYW5zaXRpb24gPVxyXG4gICAgICBvLnRyYW5zaXRpb24gIT09IHVuZGVmaW5lZCA/IG8udHJhbnNpdGlvbiA6IFRvb2xzLnRyYW5zaXRpb247XHJcbiAgICBpZiAodGhpcy50cmFuc2l0aW9uKSBzZXRUaW1lb3V0KHRoaXMuYWRkVHJhbnNpdGlvbi5iaW5kKHRoaXMpLCAxMDAwKTtcclxuXHJcbiAgICB0aGlzLnNldFdpZHRoKCk7XHJcblxyXG4gICAgaWYgKHRoaXMuaXNDYW52YXMpIHRoaXMubWFrZUNhbnZhcygpO1xyXG5cclxuICAgIFJvb3RzLmFkZCh0aGlzKTtcclxuICB9XHJcblxyXG4gIHRyaWdnZXJNb3VzZURvd24oeCwgeSkge1xyXG4gICAgUm9vdHMuaGFuZGxlRXZlbnQoe1xyXG4gICAgICB0eXBlOiBcInBvaW50ZXJkb3duXCIsXHJcbiAgICAgIGNsaWVudFg6IHgsXHJcbiAgICAgIGNsaWVudFk6IHksXHJcbiAgICAgIGRlbHRhOiAwLFxyXG4gICAgICBrZXk6IG51bGwsXHJcbiAgICAgIGtleUNvZGU6IE5hTixcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgdHJpZ2dlck1vdXNlTW92ZSgpIHtcclxuICAgIFJvb3RzLmhhbmRsZUV2ZW50KHtcclxuICAgICAgdHlwZTogXCJwb2ludGVybW92ZVwiLFxyXG4gICAgICBjbGllbnRYOiAtMSxcclxuICAgICAgY2xpZW50WTogLTEsXHJcbiAgICAgIGRlbHRhOiAwLFxyXG4gICAgICBrZXk6IG51bGwsXHJcbiAgICAgIGtleUNvZGU6IE5hTixcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgdHJpZ2dlck1vdXNlVXAoeCwgeSkge1xyXG4gICAgLypcclxuXHJcbiAgICAgICAgY2xpZW50WCxjbGllbnRZIGFyZSBubyB1c2VkIHdoZW4gaXNDYW52YXM9PXRydWVcclxuICAgICAgICAqL1xyXG4gICAgUm9vdHMuaGFuZGxlRXZlbnQoe1xyXG4gICAgICB0eXBlOiBcInBvaW50ZXJ1cFwiLFxyXG4gICAgICBjbGllbnRYOiB4LFxyXG4gICAgICBjbGllbnRZOiB5LFxyXG4gICAgICBkZWx0YTogMCxcclxuICAgICAga2V5OiBudWxsLFxyXG4gICAgICBrZXlDb2RlOiBOYU4sXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHNldFRvcCh0LCBoKSB7XHJcbiAgICB0aGlzLmNvbnRlbnQuc3R5bGUudG9wID0gdCArIFwicHhcIjtcclxuICAgIGlmIChoICE9PSB1bmRlZmluZWQpIHRoaXMuZm9yY2VIZWlnaHQgPSBoO1xyXG4gICAgdGhpcy5jYWxjKCk7XHJcblxyXG4gICAgUm9vdHMubmVlZFJlWm9uZSA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBhZGRUcmFuc2l0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMudHJhbnNpdGlvbiAmJiAhdGhpcy5pc0NhbnZhcykge1xyXG4gICAgICB0aGlzLmlubmVyQ29udGVudC5zdHlsZS50cmFuc2l0aW9uID1cclxuICAgICAgICBcImhlaWdodCBcIiArIHRoaXMudHJhbnNpdGlvbiArIFwicyBlYXNlLW91dFwiO1xyXG4gICAgICB0aGlzLmNvbnRlbnQuc3R5bGUudHJhbnNpdGlvbiA9XHJcbiAgICAgICAgXCJoZWlnaHQgXCIgKyB0aGlzLnRyYW5zaXRpb24gKyBcInMgZWFzZS1vdXRcIjtcclxuICAgICAgdGhpcy5ib3R0b20uc3R5bGUudHJhbnNpdGlvbiA9IFwidG9wIFwiICsgdGhpcy50cmFuc2l0aW9uICsgXCJzIGVhc2Utb3V0XCI7XHJcbiAgICAgIC8vdGhpcy5ib3R0b20uYWRkRXZlbnRMaXN0ZW5lcihcInRyYW5zaXRpb25lbmRcIiwgUm9vdHMucmVzaXplLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgaSA9IHRoaXMudWlzLmxlbmd0aDtcclxuICAgIHdoaWxlIChpLS0pIHRoaXMudWlzW2ldLmFkZFRyYW5zaXRpb24oKTtcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyAgIENBTlZBU1xyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgb25EcmF3KCkge31cclxuXHJcbiAgbWFrZUNhbnZhcygpIHtcclxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFxyXG4gICAgICBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIixcclxuICAgICAgXCJjYW52YXNcIlxyXG4gICAgKTtcclxuICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy56b25lLnc7XHJcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmZvcmNlSGVpZ2h0ID8gdGhpcy5mb3JjZUhlaWdodCA6IHRoaXMuem9uZS5oO1xyXG5cclxuICAgIC8vY29uc29sZS5sb2coIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQgKVxyXG4gIH1cclxuXHJcbiAgZHJhdyhmb3JjZSkge1xyXG4gICAgaWYgKHRoaXMuY2FudmFzID09PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgbGV0IHcgPSB0aGlzLnpvbmUudztcclxuICAgIGxldCBoID0gdGhpcy5mb3JjZUhlaWdodCA/IHRoaXMuZm9yY2VIZWlnaHQgOiB0aGlzLnpvbmUuaDtcclxuICAgIFJvb3RzLnRvQ2FudmFzKHRoaXMsIHcsIGgsIGZvcmNlKTtcclxuICB9XHJcblxyXG4gIC8vLy8vL1xyXG5cclxuICBnZXREb20oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jb250ZW50O1xyXG4gIH1cclxuXHJcbiAgbm9Nb3VzZSgpIHtcclxuICAgIHRoaXMubW91c2UubmVnKCk7XHJcbiAgfVxyXG5cclxuICBzZXRNb3VzZSh1diwgZmxpcCA9IHRydWUpIHtcclxuICAgIGlmIChmbGlwKVxyXG4gICAgICB0aGlzLm1vdXNlLnNldChcclxuICAgICAgICBNYXRoLnJvdW5kKHV2LnggKiB0aGlzLmNhbnZhcy53aWR0aCksXHJcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0IC0gTWF0aC5yb3VuZCh1di55ICogdGhpcy5jYW52YXMuaGVpZ2h0KVxyXG4gICAgICApO1xyXG4gICAgZWxzZVxyXG4gICAgICB0aGlzLm1vdXNlLnNldChcclxuICAgICAgICBNYXRoLnJvdW5kKHV2LnggKiB0aGlzLmNhbnZhcy53aWR0aCksXHJcbiAgICAgICAgTWF0aC5yb3VuZCh1di55ICogdGhpcy5jYW52YXMuaGVpZ2h0KVxyXG4gICAgICApO1xyXG4gICAgLy90aGlzLm1vdXNlLnNldCggbS54LCBtLnkgKTtcclxuXHJcbiAgICAvL2NvbnNvbGUubG9nKFwic2V0TW91c2UgXCIrdXYueCtcIiBcIit1di55KVxyXG4gIH1cclxuXHJcbiAgc2V0Q29uZmlnKG8pIHtcclxuICAgIC8vIHJlc2V0IHRvIGRlZmF1bHQgdGV4dFxyXG4gICAgVG9vbHMuc2V0VGV4dCgpO1xyXG4gICAgdGhpcy5jb2xvcnMgPSBUb29scy5kZWZpbmVDb2xvcihvKTtcclxuICB9XHJcblxyXG4gIHNldENvbG9ycyhvKSB7XHJcbiAgICBmb3IgKGxldCBjIGluIG8pIHtcclxuICAgICAgaWYgKHRoaXMuY29sb3JzW2NdKSB0aGlzLmNvbG9yc1tjXSA9IG9bY107XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzZXRUZXh0KHNpemUsIGNvbG9yLCBmb250LCBzaGFkb3cpIHtcclxuICAgIFRvb2xzLnNldFRleHQoc2l6ZSwgY29sb3IsIGZvbnQsIHNoYWRvdyk7XHJcbiAgfVxyXG5cclxuICBoaWRlKGIpIHtcclxuICAgIHRoaXMuY29udGVudC5zdHlsZS52aXNpYmlsaXR5ID0gYiA/IFwiaGlkZGVuXCIgOiBcInZpc2libGVcIjtcclxuICB9XHJcblxyXG4gIGRpc3BsYXkodiA9IGZhbHNlKSB7XHJcbiAgICB0aGlzLmNvbnRlbnQuc3R5bGUudmlzaWJpbGl0eSA9IHYgPyBcInZpc2libGVcIiA6IFwiaGlkZGVuXCI7XHJcbiAgfVxyXG5cclxuICBvbkNoYW5nZShmKSB7XHJcbiAgICB0aGlzLmNhbGxiYWNrID0gZiB8fCBudWxsO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gICBTVFlMRVNcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIG1vZGUobikge1xyXG4gICAgbGV0IG5lZWRDaGFuZ2UgPSBmYWxzZTtcclxuICAgIGxldCBjYyA9IHRoaXMuY29sb3JzO1xyXG5cclxuICAgIGlmIChuICE9PSB0aGlzLmNuKSB7XHJcbiAgICAgIHRoaXMuY24gPSBuO1xyXG5cclxuICAgICAgc3dpdGNoIChuKSB7XHJcbiAgICAgICAgY2FzZSBcImRlZlwiOlxyXG4gICAgICAgICAgUm9vdHMuY3Vyc29yKCk7XHJcbiAgICAgICAgICB0aGlzLnNjcm9sbC5zdHlsZS5iYWNrZ3JvdW5kID0gY2MuYnV0dG9uO1xyXG4gICAgICAgICAgdGhpcy5ib3R0b20uc3R5bGUuYmFja2dyb3VuZCA9IGNjLmJhY2tncm91bmQ7XHJcbiAgICAgICAgICB0aGlzLmJvdHRvbS5zdHlsZS5jb2xvciA9IGNjLnRleHQ7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgLy9jYXNlICdzY3JvbGxEZWYnOiB0aGlzLnNjcm9sbC5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuc2Nyb2xsOyBicmVhaztcclxuICAgICAgICBjYXNlIFwic2Nyb2xsT3ZlclwiOlxyXG4gICAgICAgICAgUm9vdHMuY3Vyc29yKFwibnMtcmVzaXplXCIpO1xyXG4gICAgICAgICAgdGhpcy5zY3JvbGwuc3R5bGUuYmFja2dyb3VuZCA9IGNjLnNlbGVjdDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJzY3JvbGxEb3duXCI6XHJcbiAgICAgICAgICB0aGlzLnNjcm9sbC5zdHlsZS5iYWNrZ3JvdW5kID0gY2Muc2VsZWN0O1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIC8vY2FzZSAnYm90dG9tRGVmJzogdGhpcy5ib3R0b20uc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmJhY2tncm91bmQ7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJib3R0b21PdmVyXCI6XHJcbiAgICAgICAgICBSb290cy5jdXJzb3IoXCJwb2ludGVyXCIpO1xyXG4gICAgICAgICAgdGhpcy5ib3R0b20uc3R5bGUuYmFja2dyb3VuZCA9IGNjLmJhY2tncm91bmRPdmVyO1xyXG4gICAgICAgICAgdGhpcy5ib3R0b20uc3R5bGUuY29sb3IgPSBjYy50ZXh0T3ZlcjtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vY2FzZSAnYm90dG9tRG93bic6IHRoaXMuYm90dG9tLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7IHRoaXMuYm90dG9tLnN0eWxlLmNvbG9yID0gJyMwMDAnOyBicmVhaztcclxuICAgICAgfVxyXG5cclxuICAgICAgbmVlZENoYW5nZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5lZWRDaGFuZ2U7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gICBUQVJHRVRcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGNsZWFyVGFyZ2V0KCkge1xyXG4gICAgaWYgKHRoaXMuY3VycmVudCA9PT0gLTEpIHJldHVybiBmYWxzZTtcclxuICAgIGlmICh0aGlzLnByb3RvLnMpIHtcclxuICAgICAgLy8gaWYgbm8gcyB0YXJnZXQgaXMgZGVsZXRlICEhXHJcbiAgICAgIHRoaXMucHJvdG8udWlvdXQoKTtcclxuICAgICAgdGhpcy5wcm90by5yZXNldCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucHJvdG8gPSBudWxsO1xyXG4gICAgdGhpcy5jdXJyZW50ID0gLTE7XHJcblxyXG4gICAgLy8vY29uc29sZS5sb2codGhpcy5pc0Rvd24pLy9pZih0aGlzLmlzRG93bilSb290cy5jbGVhcklucHV0KCk7XHJcblxyXG4gICAgUm9vdHMuY3Vyc29yKCk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyAgIFpPTkUgVEVTVFxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgdGVzdFpvbmUoZSkge1xyXG4gICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgaWYgKGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSkgcmV0dXJuIFwiXCI7XHJcblxyXG4gICAgdGhpcy5pc1Jlc2V0ID0gZmFsc2U7XHJcblxyXG4gICAgbGV0IG5hbWUgPSBcIlwiO1xyXG5cclxuICAgIGxldCBzID0gdGhpcy5pc1Njcm9sbCA/IHRoaXMuem9uZS53IC0gdGhpcy5zaXplLnMgOiB0aGlzLnpvbmUudztcclxuXHJcbiAgICBpZiAobC55ID4gdGhpcy56b25lLmggLSB0aGlzLmJoICYmIGwueSA8IHRoaXMuem9uZS5oKSBuYW1lID0gXCJib3R0b21cIjtcclxuICAgIGVsc2UgbmFtZSA9IGwueCA+IHMgPyBcInNjcm9sbFwiIDogXCJjb250ZW50XCI7XHJcblxyXG4gICAgcmV0dXJuIG5hbWU7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gICBFVkVOVFNcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGhhbmRsZUV2ZW50KGUpIHtcclxuICAgIC8vaWYoIHRoaXMuY2xlYW5uaW5nICkgcmV0dXJuXHJcblxyXG4gICAgLy9jb25zb2xlLmxvZyhcIkd1aS5oYW5kbGVFdmVudFwiKVxyXG4gICAgLy9jb25zb2xlLmxvZyhlKTtcclxuICAgIGxldCB0eXBlID0gZS50eXBlO1xyXG5cclxuICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcclxuICAgIGxldCBwcm90b0NoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZShlKTtcclxuXHJcbiAgICBpZiAodHlwZSA9PT0gXCJtb3VzZXVwXCIgJiYgdGhpcy5pc0Rvd24pIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICBpZiAodHlwZSA9PT0gXCJtb3VzZWRvd25cIiAmJiAhdGhpcy5pc0Rvd24pIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuXHJcbiAgICBpZiAodGhpcy5pc0Rvd24gJiYgdGhpcy5pc05ld1RhcmdldCkge1xyXG4gICAgICBSb290cy5jbGVhcklucHV0KCk7XHJcbiAgICAgIHRoaXMuaXNOZXdUYXJnZXQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIW5hbWUpIHJldHVybjtcclxuXHJcbiAgICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgICAgY2FzZSBcImNvbnRlbnRcIjpcclxuICAgICAgICBlLmNsaWVudFkgPSB0aGlzLmlzU2Nyb2xsID8gZS5jbGllbnRZICsgdGhpcy5kZWNhbCA6IGUuY2xpZW50WTtcclxuXHJcbiAgICAgICAgaWYgKFJvb3RzLmlzTW9iaWxlICYmIHR5cGUgPT09IFwibW91c2Vkb3duXCIpIHRoaXMuZ2V0TmV4dChlLCBjaGFuZ2UpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5wcm90bykgcHJvdG9DaGFuZ2UgPSB0aGlzLnByb3RvLmhhbmRsZUV2ZW50KGUpO1xyXG5cclxuICAgICAgICBpZiAodHlwZSA9PT0gXCJtb3VzZW1vdmVcIikgY2hhbmdlID0gdGhpcy5tb2RlKFwiZGVmXCIpO1xyXG4gICAgICAgIGlmICh0eXBlID09PSBcIndoZWVsXCIgJiYgIXByb3RvQ2hhbmdlICYmIHRoaXMuaXNTY3JvbGwpXHJcbiAgICAgICAgICBjaGFuZ2UgPSB0aGlzLm9uV2hlZWwoZSk7XHJcblxyXG4gICAgICAgIGlmICghUm9vdHMubG9jaykge1xyXG4gICAgICAgICAgdGhpcy5nZXROZXh0KGUsIGNoYW5nZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImJvdHRvbVwiOlxyXG4gICAgICAgIHRoaXMuY2xlYXJUYXJnZXQoKTtcclxuICAgICAgICBpZiAodHlwZSA9PT0gXCJtb3VzZW1vdmVcIikgY2hhbmdlID0gdGhpcy5tb2RlKFwiYm90dG9tT3ZlclwiKTtcclxuICAgICAgICBpZiAodHlwZSA9PT0gXCJtb3VzZWRvd25cIikge1xyXG4gICAgICAgICAgdGhpcy5pc09wZW4gPSB0aGlzLmlzT3BlbiA/IGZhbHNlIDogdHJ1ZTtcclxuICAgICAgICAgIHRoaXMuYm90dG9tLnRleHRDb250ZW50ID0gdGhpcy5pc09wZW5cclxuICAgICAgICAgICAgPyB0aGlzLmJvdHRvbVRleHRbMV1cclxuICAgICAgICAgICAgOiB0aGlzLmJvdHRvbVRleHRbMF07XHJcbiAgICAgICAgICAvL3RoaXMuc2V0SGVpZ2h0KCk7XHJcbiAgICAgICAgICB0aGlzLmNhbGMoKTtcclxuICAgICAgICAgIHRoaXMubW9kZShcImRlZlwiKTtcclxuICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInNjcm9sbFwiOlxyXG4gICAgICAgIHRoaXMuY2xlYXJUYXJnZXQoKTtcclxuICAgICAgICBpZiAodHlwZSA9PT0gXCJtb3VzZW1vdmVcIikgY2hhbmdlID0gdGhpcy5tb2RlKFwic2Nyb2xsT3ZlclwiKTtcclxuICAgICAgICBpZiAodHlwZSA9PT0gXCJtb3VzZWRvd25cIikgY2hhbmdlID0gdGhpcy5tb2RlKFwic2Nyb2xsRG93blwiKTtcclxuICAgICAgICBpZiAodHlwZSA9PT0gXCJ3aGVlbFwiKSBjaGFuZ2UgPSB0aGlzLm9uV2hlZWwoZSk7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNEb3duKSB0aGlzLnVwZGF0ZShlLmNsaWVudFkgLSB0aGlzLnpvbmUueSAtIHRoaXMuc2ggKiAwLjUpO1xyXG5cclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5pc0Rvd24pIGNoYW5nZSA9IHRydWU7XHJcbiAgICBpZiAocHJvdG9DaGFuZ2UpIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgaWYgKHR5cGUgPT09IFwia2V5dXBcIikgY2hhbmdlID0gdHJ1ZTtcclxuICAgIGlmICh0eXBlID09PSBcImtleWRvd25cIikgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICBpZiAoY2hhbmdlKSB0aGlzLmRyYXcoKTtcclxuICB9XHJcblxyXG4gIGdldE5leHQoZSwgY2hhbmdlKSB7XHJcbiAgICBsZXQgbmV4dCA9IFJvb3RzLmZpbmRUYXJnZXQodGhpcy51aXMsIGUpO1xyXG5cclxuICAgIGlmIChuZXh0ICE9PSB0aGlzLmN1cnJlbnQpIHtcclxuICAgICAgdGhpcy5jbGVhclRhcmdldCgpO1xyXG4gICAgICB0aGlzLmN1cnJlbnQgPSBuZXh0O1xyXG4gICAgICBjaGFuZ2UgPSB0cnVlO1xyXG4gICAgICB0aGlzLmlzTmV3VGFyZ2V0ID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobmV4dCAhPT0gLTEpIHtcclxuICAgICAgdGhpcy5wcm90byA9IHRoaXMudWlzW3RoaXMuY3VycmVudF07XHJcbiAgICAgIHRoaXMucHJvdG8udWlvdmVyKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBvbldoZWVsKGUpIHtcclxuICAgIHRoaXMub3kgKz0gMjAgKiBlLmRlbHRhO1xyXG4gICAgdGhpcy51cGRhdGUodGhpcy5veSk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyAgIFJFU0VUXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICByZXNldChmb3JjZSkge1xyXG4gICAgaWYgKHRoaXMuaXNSZXNldCkgcmV0dXJuO1xyXG5cclxuICAgIC8vdGhpcy5yZXNldEl0ZW0oKTtcclxuXHJcbiAgICB0aGlzLm1vdXNlLm5lZygpO1xyXG4gICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICAvL1Jvb3RzLmNsZWFySW5wdXQoKTtcclxuICAgIGxldCByID0gdGhpcy5tb2RlKFwiZGVmXCIpO1xyXG4gICAgbGV0IHIyID0gdGhpcy5jbGVhclRhcmdldCgpO1xyXG5cclxuICAgIGlmIChyIHx8IHIyKSB0aGlzLmRyYXcodHJ1ZSk7XHJcblxyXG4gICAgdGhpcy5pc1Jlc2V0ID0gdHJ1ZTtcclxuXHJcbiAgICAvL1Jvb3RzLmxvY2sgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyAgIEFERCBOT0RFXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBhZGQoKSB7XHJcbiAgICAvL2lmKHRoaXMuY2xlYW5uaW5nKSB0aGlzLmNsZWFubmluZyA9IGZhbHNlXHJcblxyXG4gICAgbGV0IGEgPSBhcmd1bWVudHM7XHJcbiAgICBsZXQgb250b3AgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAodHlwZW9mIGFbMV0gPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgYVsxXS5pc1VJID0gdHJ1ZTtcclxuICAgICAgYVsxXS5tYWluID0gdGhpcztcclxuXHJcbiAgICAgIG9udG9wID0gYVsxXS5vbnRvcCA/IGFbMV0ub250b3AgOiBmYWxzZTtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGFbMV0gPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgaWYgKGFbMl0gPT09IHVuZGVmaW5lZCkgW10ucHVzaC5jYWxsKGEsIHsgaXNVSTogdHJ1ZSwgbWFpbjogdGhpcyB9KTtcclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgYVsyXS5pc1VJID0gdHJ1ZTtcclxuICAgICAgICBhWzJdLm1haW4gPSB0aGlzO1xyXG4gICAgICAgIC8vb250b3AgPSBhWzFdLm9udG9wID8gYVsxXS5vbnRvcCA6IGZhbHNlO1xyXG4gICAgICAgIG9udG9wID0gYVsyXS5vbnRvcCA/IGFbMl0ub250b3AgOiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCB1ID0gYWRkLmFwcGx5KHRoaXMsIGEpO1xyXG5cclxuICAgIGlmICh1ID09PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgaWYgKG9udG9wKSB0aGlzLnVpcy51bnNoaWZ0KHUpO1xyXG4gICAgZWxzZSB0aGlzLnVpcy5wdXNoKHUpO1xyXG5cclxuICAgIHRoaXMuY2FsYygpO1xyXG5cclxuICAgIHRoaXMuaXNFbXB0eSA9IGZhbHNlO1xyXG5cclxuICAgIHJldHVybiB1O1xyXG4gIH1cclxuXHJcbiAgLy8gcmVtb3ZlIG9uZSBub2RlXHJcblxyXG4gIHJlbW92ZShuKSB7XHJcbiAgICBpZiAobi5kaXNwb3NlKSBuLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8vIGNhbGwgYWZ0ZXIgdWlzIGNsZWFyXHJcblxyXG4gIGNsZWFyT25lKG4pIHtcclxuICAgIGxldCBpZCA9IHRoaXMudWlzLmluZGV4T2Yobik7XHJcbiAgICBpZiAoaWQgIT09IC0xKSB7XHJcbiAgICAgIC8vdGhpcy5jYWxjKCAtICh0aGlzLnVpc1sgaWQgXS5oICsgMSApICk7XHJcbiAgICAgIHRoaXMuaW5uZXIucmVtb3ZlQ2hpbGQodGhpcy51aXNbaWRdLmNbMF0pO1xyXG4gICAgICB0aGlzLnVpcy5zcGxpY2UoaWQsIDEpO1xyXG4gICAgICB0aGlzLmNhbGMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIGNsZWFyIGFsbCBndWlcclxuXHJcbiAgZW1wdHkoKSB7XHJcbiAgICAvL3RoaXMuY2xlYW5uaW5nID0gdHJ1ZVxyXG5cclxuICAgIC8vdGhpcy5jbG9zZSgpO1xyXG5cclxuICAgIGxldCBpID0gdGhpcy51aXMubGVuZ3RoLFxyXG4gICAgICBpdGVtO1xyXG5cclxuICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgaXRlbSA9IHRoaXMudWlzLnBvcCgpO1xyXG4gICAgICB0aGlzLmlubmVyLnJlbW92ZUNoaWxkKGl0ZW0uY1swXSk7XHJcbiAgICAgIGl0ZW0uZGlzcG9zZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudWlzID0gW107XHJcbiAgICB0aGlzLmlzRW1wdHkgPSB0cnVlO1xyXG4gICAgdGhpcy5jYWxjKCk7XHJcbiAgfVxyXG5cclxuICBjbGVhcigpIHtcclxuICAgIHRoaXMuZW1wdHkoKTtcclxuICB9XHJcblxyXG4gIGNsZWFyMigpIHtcclxuICAgIHNldFRpbWVvdXQodGhpcy5lbXB0eS5iaW5kKHRoaXMpLCAwKTtcclxuICB9XHJcblxyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLmNsZWFyKCk7XHJcbiAgICBpZiAodGhpcy5wYXJlbnQgIT09IG51bGwpIHRoaXMucGFyZW50LnJlbW92ZUNoaWxkKHRoaXMuY29udGVudCk7XHJcbiAgICBSb290cy5yZW1vdmUodGhpcyk7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gICBJVEVNUyBTUEVDSUFMXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICByZXNldEl0ZW0oKSB7XHJcbiAgICBpZiAoIXRoaXMuaXNJdGVtTW9kZSkgcmV0dXJuO1xyXG5cclxuICAgIGxldCBpID0gdGhpcy51aXMubGVuZ3RoO1xyXG4gICAgd2hpbGUgKGktLSkgdGhpcy51aXNbaV0uc2VsZWN0ZWQoKTtcclxuICB9XHJcblxyXG4gIHNldEl0ZW0obmFtZSkge1xyXG4gICAgaWYgKCF0aGlzLmlzSXRlbU1vZGUpIHJldHVybjtcclxuXHJcbiAgICBuYW1lID0gbmFtZSB8fCBcIlwiO1xyXG4gICAgdGhpcy5yZXNldEl0ZW0oKTtcclxuXHJcbiAgICBpZiAoIW5hbWUpIHtcclxuICAgICAgdGhpcy51cGRhdGUoMCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgaSA9IHRoaXMudWlzLmxlbmd0aDtcclxuICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgaWYgKHRoaXMudWlzW2ldLnZhbHVlID09PSBuYW1lKSB7XHJcbiAgICAgICAgdGhpcy51aXNbaV0uc2VsZWN0ZWQodHJ1ZSk7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNTY3JvbGwpXHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZShpICogKHRoaXMudWlzW2ldLmggKyB0aGlzLm1hcmdpbikgKiB0aGlzLnJhdGlvKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vICAgU0NST0xMXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICB1cFNjcm9sbChiKSB7XHJcbiAgICB0aGlzLnN3ID0gYiA/IHRoaXMuc2l6ZS5zIDogMDtcclxuICAgIHRoaXMub3kgPSBiID8gdGhpcy5veSA6IDA7XHJcbiAgICB0aGlzLnNjcm9sbEJHLnN0eWxlLmRpc3BsYXkgPSBiID8gXCJibG9ja1wiIDogXCJub25lXCI7XHJcblxyXG4gICAgaWYgKGIpIHtcclxuICAgICAgdGhpcy50b3RhbCA9IHRoaXMuaDtcclxuXHJcbiAgICAgIHRoaXMubWF4VmlldyA9IHRoaXMubWF4SGVpZ2h0O1xyXG5cclxuICAgICAgdGhpcy5yYXRpbyA9IHRoaXMubWF4VmlldyAvIHRoaXMudG90YWw7XHJcbiAgICAgIHRoaXMuc2ggPSB0aGlzLm1heFZpZXcgKiB0aGlzLnJhdGlvO1xyXG5cclxuICAgICAgdGhpcy5yYW5nZSA9IHRoaXMubWF4VmlldyAtIHRoaXMuc2g7XHJcblxyXG4gICAgICB0aGlzLm95ID0gVG9vbHMuY2xhbXAodGhpcy5veSwgMCwgdGhpcy5yYW5nZSk7XHJcblxyXG4gICAgICB0aGlzLnNjcm9sbEJHLnN0eWxlLmhlaWdodCA9IHRoaXMubWF4VmlldyArIFwicHhcIjtcclxuICAgICAgdGhpcy5zY3JvbGwuc3R5bGUuaGVpZ2h0ID0gdGhpcy5zaCArIFwicHhcIjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNldEl0ZW1XaWR0aCh0aGlzLnpvbmUudyAtIHRoaXMuc3cpO1xyXG4gICAgdGhpcy51cGRhdGUodGhpcy5veSk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGUoeSkge1xyXG4gICAgeSA9IFRvb2xzLmNsYW1wKHksIDAsIHRoaXMucmFuZ2UpO1xyXG5cclxuICAgIHRoaXMuZGVjYWwgPSBNYXRoLmZsb29yKHkgLyB0aGlzLnJhdGlvKTtcclxuICAgIHRoaXMuaW5uZXIuc3R5bGUudG9wID0gLXRoaXMuZGVjYWwgKyBcInB4XCI7XHJcbiAgICB0aGlzLnNjcm9sbC5zdHlsZS50b3AgPSBNYXRoLmZsb29yKHkpICsgXCJweFwiO1xyXG4gICAgdGhpcy5veSA9IHk7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gICBSRVNJWkUgRlVOQ1RJT05cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGNhbGNVaXMoKSB7XHJcbiAgICByZXR1cm4gUm9vdHMuY2FsY1Vpcyh0aGlzLnVpcywgdGhpcy56b25lLCB0aGlzLnpvbmUueSk7XHJcbiAgfVxyXG5cclxuICBjYWxjKCkge1xyXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMudG1wKTtcclxuICAgIHRoaXMudG1wID0gc2V0VGltZW91dCh0aGlzLnNldEhlaWdodC5iaW5kKHRoaXMpLCAxMCk7XHJcbiAgfVxyXG5cclxuICBzZXRIZWlnaHQoKSB7XHJcbiAgICBpZiAodGhpcy50bXApIGNsZWFyVGltZW91dCh0aGlzLnRtcCk7XHJcblxyXG4gICAgdGhpcy56b25lLmggPSB0aGlzLmJoO1xyXG4gICAgdGhpcy5pc1Njcm9sbCA9IGZhbHNlO1xyXG5cclxuICAgIGlmICh0aGlzLmlzT3Blbikge1xyXG4gICAgICB0aGlzLmggPSB0aGlzLmNhbGNVaXMoKTtcclxuXHJcbiAgICAgIGxldCBoaGggPSB0aGlzLmZvcmNlSGVpZ2h0XHJcbiAgICAgICAgPyB0aGlzLmZvcmNlSGVpZ2h0ICsgdGhpcy56b25lLnlcclxuICAgICAgICA6IHdpbmRvdy5pbm5lckhlaWdodDtcclxuXHJcbiAgICAgIHRoaXMubWF4SGVpZ2h0ID0gaGhoIC0gdGhpcy56b25lLnkgLSB0aGlzLmJoO1xyXG5cclxuICAgICAgbGV0IGRpZmYgPSB0aGlzLmggLSB0aGlzLm1heEhlaWdodDtcclxuXHJcbiAgICAgIGlmIChkaWZmID4gMSkge1xyXG4gICAgICAgIHRoaXMuaXNTY3JvbGwgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuem9uZS5oID0gdGhpcy5tYXhIZWlnaHQgKyB0aGlzLmJoO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuem9uZS5oID0gdGhpcy5oICsgdGhpcy5iaDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudXBTY3JvbGwodGhpcy5pc1Njcm9sbCk7XHJcblxyXG4gICAgdGhpcy5pbm5lckNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gdGhpcy56b25lLmggLSB0aGlzLmJoICsgXCJweFwiO1xyXG4gICAgdGhpcy5jb250ZW50LnN0eWxlLmhlaWdodCA9IHRoaXMuem9uZS5oICsgXCJweFwiO1xyXG4gICAgdGhpcy5ib3R0b20uc3R5bGUudG9wID0gdGhpcy56b25lLmggLSB0aGlzLmJoICsgXCJweFwiO1xyXG5cclxuICAgIGlmICh0aGlzLmZvcmNlSGVpZ2h0ICYmIHRoaXMubG9ja0hlaWdodClcclxuICAgICAgdGhpcy5jb250ZW50LnN0eWxlLmhlaWdodCA9IHRoaXMuZm9yY2VIZWlnaHQgKyBcInB4XCI7XHJcbiAgICBpZiAodGhpcy5pc0NhbnZhcykgdGhpcy5kcmF3KHRydWUpO1xyXG4gIH1cclxuXHJcbiAgcmV6b25lKCkge1xyXG4gICAgUm9vdHMubmVlZFJlWm9uZSA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBzZXRXaWR0aCh3KSB7XHJcbiAgICBpZiAodykgdGhpcy56b25lLncgPSB3O1xyXG5cclxuICAgIHRoaXMuem9uZS53ID0gTWF0aC5mbG9vcih0aGlzLnpvbmUudyk7XHJcbiAgICB0aGlzLmNvbnRlbnQuc3R5bGUud2lkdGggPSB0aGlzLnpvbmUudyArIFwicHhcIjtcclxuICAgIGlmICh0aGlzLmlzQ2VudGVyKVxyXG4gICAgICB0aGlzLmNvbnRlbnQuc3R5bGUubWFyZ2luTGVmdCA9IC1NYXRoLmZsb29yKHRoaXMuem9uZS53ICogMC41KSArIFwicHhcIjtcclxuICAgIHRoaXMuc2V0SXRlbVdpZHRoKHRoaXMuem9uZS53IC0gdGhpcy5zdyk7XHJcbiAgfVxyXG5cclxuICBzZXRJdGVtV2lkdGgodykge1xyXG4gICAgbGV0IGkgPSB0aGlzLnVpcy5sZW5ndGg7XHJcbiAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgIHRoaXMudWlzW2ldLnNldFNpemUodyk7XHJcbiAgICAgIHRoaXMudWlzW2ldLnJTaXplKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNZLE1BQUMsUUFBUSxHQUFHLFFBQVE7QUFDaEM7QUFDQTtBQUNBO0FBQ0EsTUFBTSxDQUFDLEdBQUc7QUFDVixFQUFFLEVBQUUsRUFBRSxFQUFFO0FBQ1I7QUFDQSxFQUFFLEdBQUcsRUFBRSxJQUFJO0FBQ1g7QUFDQSxFQUFFLEVBQUUsRUFBRSxJQUFJO0FBQ1YsRUFBRSxJQUFJLEVBQUUsS0FBSztBQUNiLEVBQUUsS0FBSyxFQUFFLEtBQUs7QUFDZCxFQUFFLE9BQU8s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QUcsRUFBRTtBQUN0QixRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN0QixRQUFRLE9BQU8sS0FBSyxDQUFDO0FBQ3JCLE9BQU87QUFDUDtBQUNBLE1BQU0sQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDO0FBQzlCLE1BQU0sQ0FBQyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDMUIsS0FBSztBQUNMO0FBQ0E7QUFDQSxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxXQUFXLEVBQUUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQy9DO0FBQ0E7QUFDQSxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxXQUFXLEVBQUUsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDOUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUMsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLElBQUksQ0FBQyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLFdBQVcsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLFdBQVcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RDtBQUNBLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLElBQUksRUFBRTtBQUN2QixNQUFNLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUU7QUFDN0IsUUFBUSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNqQyxRQUFRLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFD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QUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN4RDtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksTUFBTSxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQ3pCO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQy9FLGFBQWEsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM5RTtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxFQUFFLFdBQVcsQ0FBQyxHQUFHO0FBQ3pCLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ3pELFFBQVEsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUN4QyxRQUFRLE9BQU8sQ0FBQyxDQUFDO0FBQ2pCLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxFQUFFLFdBQVcsQ0FBQyxHQUFHO0FBQ3pCO0FBQ0EsUUFBUSxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUM1RTtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksT0FBTyxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQzFCO0FBQ0EsUUFBUSxPQUFPLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNqSDtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksR0FBRyxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQ3RCLFFBQVEsR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNyQyxRQUFRLE9BQU8sQ0FBQyxDQUFDO0FBQ2pCLEtBQUs7QUFDTDtBQUNBLElBQUksUUFBUSxHQUFHLFVBQVUsQ0FBQyxFQUFFO0FBQzVCO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEQsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEQsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEQsUUFBUSxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLFFBQVEsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2pDO0FBQ0EsUUFBUSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixRQUFRLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLFFBQVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0RCxRQUFRLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7QUFDbEMsUUFBUSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNsRSxRQUFRLE9BQU8sQ0FBQyxDQUFDO0FBQ2pCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxRQUFRLEVBQUUsV0FBVyxDQUFDLEdBQUc7QUFDN0I7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNqSixRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRSxRQUFRLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtBQUN2QixZQUFZLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDO0FBQzNELFlBQVksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUM7QUFDakUsWUFBWSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQztBQUNqRSxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkIsU0FBUztBQUNULFFBQVEsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDM0I7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLFFBQVEsRUFBRSxXQUFXLENBQUMsR0FBRztBQUM3QjtBQUNBLFFBQVEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9DO0FBQ0EsUUFBUSxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDMUMsYUFBYTtBQUNiLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUMzRCxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMxQixZQUFZLE9BQU8sRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFDekcsU0FBUztBQUNUO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLFlBQVksRUFBRSxXQUFXLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRztBQUM5RDtBQUNBLFFBQVEsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDakQ7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlEO0FBQ0EsUUFBUSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNoRDtBQUNBLFlBQVksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQjtBQUNBLFlBQVksQ0FBQyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDL0c7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLE9BQU8sRUFBRSxXQUFXLEtBQUssR0FBRztBQUNoQztBQUNBLFFBQVEsSUFBSSxFQUFFLEdBQUcsSUFBRztBQUNwQixRQUFRLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLG9CQUFvQixFQUFFLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsbUJBQW1CLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztBQUNwSixRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNwQixRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNuQyxRQUFRLEtBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDL0YsUUFBUSxLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3JIO0FBQ0EsUUFBUSxLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUM3SSxRQUFRLEtBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsRUFBRSxD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QUUsQ0FBQyxFQUFFLEVBQUUsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3RFLFlBQVksQ0FBQyxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzFIO0FBQ0E7QUFDQSxZQUFZLElBQUksR0FBRyxHQUFHLENBQUMsZUFBZSxFQUFFLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQztBQUMxRSxZQUFZLElBQUksR0FBRyxHQUFHLENBQUMsZUFBZSxFQUFFLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQztBQUMxRTtBQUNBLFlBQVksR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDMUYsWUFBWSxDQUFDLENBQUMsWUFBWSxFQUFFLGdCQUFnQixFQUFFLEVBQUUsRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDM0g7QUFDQSxZQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzFGLFlBQVksQ0FBQyxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzVIO0FBQ0E7QUFDQTtBQUNBLFlBQVksQ0FBQyxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3RGLFlBQVksQ0FBQyxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3BHLFlBQVksQ0FBQyxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxX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Q0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFLO0FBQzVELFFBQVEsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQztBQUNqRCxRQUFRLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUN2QjtBQUNBLFFBQVEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDbEM7QUFDQSxZQUFZLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLFlBQVksRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzlCLFlBQVksRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxHQUFHLENBQUM7QUFDakMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ2hEO0FBQ0EsWUFBWSxFQUFFLEdBQUc7QUFDakIsZ0JBQWdCLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUMzQyxnQkFBZ0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUc7QUFDdkQsZ0JBQWdCLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUMzQyxhQUFhLENBQUM7QUFDZDtBQUNBLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzlEO0FBQ0EsWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDdkI7QUFDQSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QixnQkFBZ0IsTUFBTSxDQUFDLEVBQUUsQ0FBQztBQUMxQixtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEQsaUJBQWlCO0FBQ2pCO0FBQ0EsZ0JBQWdCLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzRztBQUNBLGdCQUFnQixHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDM0QsZ0JBQWdCLENBQUMsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLGFBQWEsQ0FB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QyxRQUFRLENBQUM7QUFDM0M7QUFDQSxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztBQUMzQjtBQUNBLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2pELElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2hDO0FBQ0EsSUFBSSxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztBQUM5QixJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQzFCO0FBQ0E7QUFDQSxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNwRDtBQUNBLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN6RCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hDO0FBQ0EsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3pELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzFELFNBQVMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDMUI7QUFDQTtBQUNBLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN4QjtBQUNBLElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztBQUNwQyxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3hCO0FBQ0E7QUFDQSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNqRDtBQUNBLElBQUksSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUM7QUFDdkQ7QUFDQTtBQUNBLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDMUIsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDO0FBQ2xDLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQztBQUN4QztBQUNBO0FBQ0EsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztBQUN0QjtBQUNBO0FBQ0EsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUN4QjtBQUNBO0FBQ0EsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDO0FBQ3BDLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2pDO0FBQ0E7QUFDQSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pCO0FBQ0E7QUFDQSxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsS0FBSyxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzNDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDM0MsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDaEQ7QUFDQTtBQUNBLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLFNBQVMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM3QztBQUNBO0FBQ0EsSUFBSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztBQUMzQixJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3hCLElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDMUI7QUFDQSxJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7QUFDNUIsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUNyQyxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUM7QUFDbkM7QUFDQTtBQUNBLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxLQUFLLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUNqRSxJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQzVCLElBQUksSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsWUFBWSxLQUFLLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQztBQUM3RSxJQUFJLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLGFBQWEsS0FBSyxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUM7QUFDaEY7QUFDQTtBQUNBLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtBQUM1RSxNQUFNLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUM1RSxLQUFLO0FBQ0w7QUFDQTtBQUNBLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDaEI7QUFDQTtBQUNBLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDaEI7QUFDQSxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDekQsSUFBSSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTztBQUMvQixRQUFRLDRGQUE0RjtBQUNwRyxRQUFRLGFBQWEsQ0FBQztBQUN0QjtBQUNBLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRztBQUN6QixNQUFNLEtBQUs7QUFDWCxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLFFBQVEsR0FBRyxpQ0FBaUM7QUFDbkUsS0FBSyxDQUFDO0FBQ047QUFDQSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDaEM7QUFDQTtBQUNBLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztBQUNqQyxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLElBQUksSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDL0M7QUFDQSxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2xDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsYUFBYSxDQUFDO0FBQzFDLE1BQU0sSUFBSSxTQUFTLEVBQUU7QUFDckIsUUFBUSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO0FBQ3RDO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsc0JBQXNCLENBQUM7QUFDakUsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLHNCQUFzQixDQUFDO0FBQ3BFLE9BQU8sTUFBTTtBQUNiLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxzQkFBc0IsQ0FBQztBQUN0RSxPQUFPO0FBQ1AsS0FBSztBQUNMO0FBQ0E7QUFDQSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ3RCLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ25FLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNsQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDeEMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQzdFLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFO0FBQ2YsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7QUFDdEMsTUFBTSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUU7QUFDM0IsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEMsT0FBTztBQUNQLE1BQU0sSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDdkIsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUN6QyxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsSUFBSSxHQUFHO0FBQ1QsSUFBSSxJQUFJLENB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LENBQUM7QUFDakUsU0FBUyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCO0FBQ0EsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCO0FBQ0EsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDakI7QUFDQTtBQUNBLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDcEIsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO0FBQzdDLE1BQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QixLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0EsRUFBRSxhQUFhLEdBQUc7QUFDbEIsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ3BELE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLFlBQVksQ0FBQztBQUM5RSxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUU7QUFDL0IsSUFBSSxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzlDLEdBQUc7QUFDSDtBQUNBLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUU7QUFDcEMsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUM1QyxHQUFHO0FBQ0g7QUFDQSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFO0FBQ25CLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDM0IsR0FBRztBQUNIO0FBQ0EsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7QUFDekIsSUFBSSxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN4QyxHQUFHO0FBQ0g7QUFDQSxFQUFFLFlBQVksR0FBRztBQUNqQixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUNoRCxJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDeEMsR0FBRztBQUNIO0FBQ0EsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFO0FBQ3JCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMvRCxJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDbkQsR0FBRztBQUNIO0FBQ0EsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFO0FBQ3JCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNuRCxJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdkMsR0FBRztBQUNIO0FBQ0EsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFO0FBQ2pCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQyxJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkMsR0FBRztBQUNIO0FBQ0EsRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFO0FBQ2xCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQyxJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDcEMsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRTtBQUNmLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2QixHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsRUFBRSxNQUFNLEdBQUcsRUFBRTtBQUNiO0FBQ0EsRUFBRSxLQUFLLEdBQUcsRUFBRTtBQUNaO0FBQ0E7QUFDQTtBQUNBLEVBQUUsT0FBTyxHQUFHO0FBQ1osSUFBSSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsR0FBRztBQUNIO0FBQ0EsRUFBRSxNQUFNLEdBQUc7QUFDWCxJQUFJLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQixHQUFHO0FBQ0g7QUFDQSxFQUFFLEtBQUssR0FBRztBQUNWLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU87QUFDMUIsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFPO0FBQ2pDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQzlELEdBQUc7QUFDSDtBQUNBLEVBQUUsTUFBTSxHQUFHO0FBQ1gsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTztBQUMxQixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE9BQU87QUFDakMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7QUFDbEUsR0FBRztBQUNIO0FBQ0EsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFO0FBQ1osSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztBQUMzRCxHQUFHO0FBQ0g7QUFDQSxFQUFFLE1BQU0sR0FBRztBQUNYLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFDLElBQUksT0FBTyxJQUFJLENBQUM7QUFDaEIsR0FBRztBQUNIO0FBQ0EsRUFBRSxTQUFTLEdBQUc7QUFDZDtBQUNBLElBQUksSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLElBQUksRUFBRSxPQUFPO0FBQ3pDLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU87QUFDNUIsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTztBQUM1QjtBQUNBLElBQUksSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ3BFLElBQUksT0FBTyxVQUFVLENBQUM7QUFDdEIsR0FBRztBQUNIO0FBQ0EsRUFBRSxRQUFRLENBQUMsQ0FBQyxFQUFFO0FBQ2QsSUFBSSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzNCLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRDtBQUNBLFNBQVMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDeEIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDbEIsSUFBSSxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7QUFDM0IsSUFBSSxJQUFJLEdBQUcsS0FBSyxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQzVCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQztBQUN4QixLQUFLO0FBQ0w7QUFDQSxJQUFJLE9BQU8sVUFBVSxDQUFDO0FBQ3RCLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxRQUFRLENBQUMsQ0FBQyxFQUFFO0FBQ2QsSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTztBQUM3QixJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQztBQUM5QixJQUFJLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxjQUFjLENBQUMsQ0FBQyxFQUFFO0FBQ3BCLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU87QUFDN0IsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztBQUN6QixJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLElBQUksT0FBTyxJQUFJLENBQUM7QUFDaEIsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUU7QUFDWixJQUFJLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO0FBQzFCLElBQUksT0FBTyxJQUFJLENBQUM7QUFDaEIsR0FBRztBQUNIO0FBQ0EsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFO0FBQ2IsSUFBSSxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztBQUMzQixJQUFJLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFO0FBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDeEIsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RDtBQUNBLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDdkIsSUFBSSxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0RSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDeEQsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUN4QixHQUFHO0FBQ0g7QUFDQSxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUU7QUFDYixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN4QixJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZEO0FBQ0EsSUFBSSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QyxJQUFJLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RFLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxPQUFPLEdBQUc7QUFDWixJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hEO0FBQ0EsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQjtBQUNBLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLElBQUksRUFBRTtBQUM5QixNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekQsV0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUMsS0FBSyxNQUFNO0FBQ1gsTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUMsV0FBVyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEQsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZDO0FBQ0EsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNsQixJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDekIsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQUN2QixJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQzFCLEdBQUc7QUFDSDtBQUNBLEVBQUUsS0FBSyxHQUFHLEVBQUU7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxRQUFRLEdBQUc7QUFDYixJQUFJLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEMsSUFBSSxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN4QixHQUFHO0FBQ0g7QUFDQSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUU7QUFDZCxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU87QUFDaEM7QUFDQSxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2hCO0FBQ0EsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDckIsTUFBTSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUNqQyxLQUFLLE1BQU07QUFDWCxNQUFNLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUN2QztBQUNBO0FBQ0EsTUFBTSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ25DLE1BQU0sSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQzdDLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQSxFQUFFLEtBQUssR0FBRztBQUNWLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTztBQUNoQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3BELElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDdkQsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLGFBQWEsQ0FBQyxDQUFDLEVBQUU7QUFDbkIsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztBQUN6QjtBQUNBLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDbkIsSUFBSSxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO0FBQy9CLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDaEUsV0FBVyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDaEMsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssU0FBUyxHQUFHLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDdkQsSUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssU0FBUyxHQUFHLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO0FBQ3RELElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxLQUFLLFNBQVMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNqRTtBQUNBLElBQUksSUFBSSxDQUFDLENBQUM7QUFDVjtBQUNBLElBQUksUUFBUSxJQUFJLENBQUMsU0FBUztBQUMxQixNQUFNLEtBQUssQ0FBQztBQUNaLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNkLFFBQVEsTUFBTTtBQUNkLE1BQU0sS0FBSyxDQUFDO0FBQ1osUUFBUSxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLFFBQVEsTUFBTTtBQUNkLE1BQU0sS0FBSyxDQUFDO0FBQ1osUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFFBQVEsTUFBTTtBQUNkLE1BQU0sS0FBSyxDQUFDO0FBQ1osUUFBUSxDQUFDLEdBQUcsS0FBSyxDQUFDO0FBQ2xCLFFBQVEsTUFBTTtBQUNkLE1BQU0sS0FBSyxDQUFDO0FBQ1osUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFDO0FBQ25CLFFBQVEsTUFBTTtBQUNkLE1BQU0sS0FBSyxDQUFDO0FBQ1osUUFBUSxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQ3BCLFFBQVEsTUFBTTtBQUNkLE1BQU0sS0FBSyxDQUFDO0FBQ1osUUFBUSxDQUFDLEdBQUcsUUFBUSxDQUFDO0FBQ3JCLFFBQVEsTUFBTTtBQUNkLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNsRCxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ3JDLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQyxHQUFHO0FBQ0g7QUFDQSxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUU7QUFDZCxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQyxJQUFJO0FBQ0osTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDO0FBQzNFLE1BQU07QUFDTixHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRTtBQUNqQixJQUFJLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPO0FBQzFCLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBQzNDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3JCLE1BQU0sT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztBQUNyRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsR0FBRztBQUNIO0FBQ0EsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ1gsSUFBSSxPQUFPLEtBQUssQ0FBQztBQUNqQixHQUFHO0FBQ0gsRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFFO0FBQ2YsSUFBSSxPQUFPLEtBQUssQ0FBQztBQUNqQixHQUFHO0FBQ0gsRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFFO0FBQ2YsSUFBSSxPQUFPLEtBQUssQ0FBQztBQUNqQixHQUFHO0FBQ0gsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFO0FBQ2IsSUFBSSxPQUFPLEtBQUssQ0FBQztBQUNqQixHQUFHO0FBQ0gsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFO0FBQ2IsSUFBSSxPQUFPLEtBQUssQ0FBQztBQUNqQixHQUFHO0FBQ0gsRUFBRSxLQUFLLENBQUMs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LENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsT0FBTTtBQUM3QztBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUU7QUFDcEQsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRTtBQUM5QjtBQUNBLFFBQVEsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU07QUFDNUI7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDOUIsWUFBWSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUM5RCxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsYUFBYSxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQywyQ0FBMkMsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFFO0FBQ3ZNLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxTQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMscUNBQXFDLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUU7QUFDcEssU0FBUyxNQUFNO0FBQ2YsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUM7QUFDdEIsWUFBWSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUNyRSxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsc0JBQXNCLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRTtBQUMxTixTQUFTO0FBQ1Q7QUFDQSxRQUFRLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFDO0FBQ3RCO0FBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxHQUFFO0FBQ25CLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRTtBQUNyQjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDcEI7QUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBSztBQUNoQyxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxHQUFFO0FBQzNCLFFBQVEsT0FBTyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRTtBQUNsQztBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ3BCO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBQztBQUM5QixRQUFRLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDaEM7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLEtBQUssQ0FBQyxHQUFHO0FBQ2I7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUU7QUFDckIsUUFBUSxPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDMUI7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksSUFBSSxDQUFDLEVBQUUsSUFBSSxHQUFHO0FBQ2xCO0FBQ0EsUUFBUSxJQUFJLE1BQU0sR0FBRyxNQUFLO0FBQzFCLFFBQVEsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFLO0FBQzNEO0FBQ0EsUUFBUSxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFDO0FBQ2hDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBQztBQUMxQjtBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtBQUM3QjtBQUNBLFlBQVksSUFBSSxDQUFDLElBQUksR0FBRyxFQUFDO0FBQ3pCO0FBQ0EsWUFBWSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ2xDO0FBQ0EsZ0JBQWdCLFFBQVEsQ0FBQztBQUN6QjtBQUNBLG9CQUFvQixLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNO0FBQ3JGLG9CQUFvQixLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNO0FBQzNGLG9CQUFvQixLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNO0FBQzFGLG9CQUFvQixLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNO0FBQ3ZGO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0EsZ0JBQWdCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFJO0FBQ2pFO0FBQ0EsYUFBYSxNQUFNO0FBQ25CO0FBQ0EsZ0JBQWdCLFFBQVEsQ0FBQztBQUN6QjtBQUNBLG9CQUFvQixLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU07QUFDaEgsb0JBQW9CLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTTtBQUMvRyxvQkFBb0IsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNO0FBQzlHLG9CQUFvQixLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU07QUFDcEg7QUFDQSxpQkFBaUI7QUFDakI7QUFDQSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLE1BQUs7QUFDcEQsZ0JBQWdCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFJO0FBQ25FO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsWUFBWSxNQUFNLEdBQUcsS0FBSTtBQUN6QjtBQUNBLFNBQVM7QUFDVDtBQUNBLFFBQVEsT0FBTyxNQUFNO0FBQ3JCO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHO0FBQ2xCO0FBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxHQUFFO0FBQ25CLFFBQVEsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRTtBQUM1QjtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksS0FBSyxDQUFDLEdBQUc7QUFDYjtBQUNBLFFBQVEsS0FBSyxDQUFDLEtBQUssR0FBRTtBQUNyQjtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUM7QUFDdEIsUUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLElBQUksQ0FBQyxJQUFHO0FBQ3pDLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtBQUM5QixZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEtBQUk7QUFDaEMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxLQUFJO0FBQ2hDLFNBQVMsTUFBTTtBQUNmLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUk7QUFDdEMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLElBQUksS0FBSTtBQUN4QyxTQUFTO0FBQ1Q7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUMzSU8sTUFBTSxNQUFNLFNBQVMsS0FBSyxDQUFDO0FBQ2xDO0FBQ0EsSUFBSSxXQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRztBQUMxQjtBQUNBLFFBQVEsS0FBSyxFQUFFLENBQUMsR0FBRTtBQUNsQjtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDeEIsUUFBUSxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLE1BQUs7QUFDeEQ7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBRztBQUN6QyxRQUFRLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxPQUFNO0FBQzdDO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFFO0FBQ2pEO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDO0FBQ3ZDO0FBQ0EsUUFBUSxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztBQUN4QjtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxVQUFVLElBQUksRUFBQztBQUNuQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFFO0FBQy9CLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUM7QUFDakM7QUFDQSxRQUFRLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxLQUFLLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRTtBQUMzRTtBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFLO0FBQzNCLFFBQVEsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFJO0FBQzdCLFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFDO0FBQ3BCO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTTtBQUNyQyxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRTtBQUNyQixRQUFRLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRTtBQUN0QjtBQUNBLFFBQVEsSUFBSSxHQUFHLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDbEM7QUFDQSxRQUFRLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzNDO0FBQ0EsWUFBWSxHQUFHLEdBQUcsTUFBSztBQUN2QixZQUFZLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxHQUFHLEtBQUk7QUFDL0U7QUFDQSxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUU7QUFDbE0sWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxPQUFNO0FBQ3RFLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUMsS0FBSTtBQUNuRSxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25ELFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQztBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBQztBQUN0QztBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDckQsWUFBWSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLEdBQUU7QUFDcEUsU0FBUztBQUNUO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNwQjtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksS0FBSyxHQUFHO0FBQ1o7QUFDQSxRQUFRLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQzNCLFFBQVEsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRTtBQUN4RDtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ25CO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzNCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7QUFDaEQ7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFHO0FBQ3hCLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUc7QUFDeEI7QUFDQSxRQUFRLE9BQU8sQ0FBQyxFQUFFLEVBQUU7QUFDcEIsU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztBQUNsRCxTQUFTO0FBQ1Q7QUFDQSxRQUFRLE9BQU8sQ0FBQyxDQUFDO0FBQ2pCO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLE9BQU8sQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNsQjtBQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxLQUFLO0FBQ3ZDO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQUs7QUFDM0IsUUFBUSxJQUFJLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDN0IsWUFBWSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUU7QUFDM0YsaUJBQWlCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFDO0FBQ25ELFlBQVksSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFFO0FBQ25ELFlBQVksSUFBSSxDQUFDLElBQUksR0FBRTtBQUN2QixTQUFTO0FBQ1Q7QUFDQSxRQUFRLE9BQU8sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUU7QUFDbEM7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNwQjtBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sS0FBSztBQUN0QyxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSTtBQUMxQixLQUFLLE9BQU8sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUU7QUFDL0I7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNwQjtBQUNBLFFBQVEsSUFBSSxFQUFFLEdBQUcsTUFBSztBQUN0QixRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUU7QUFDckM7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUM3QixZQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFDO0FBQ2xDLFlBQVksRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUU7QUFDNUQsU0FBUyxNQUFNO0FBQ2YsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRTtBQUMxQixTQUFTO0FBQ1Q7QUFDQSxRQUFRLE9BQU8sRUFBRTtBQUNqQjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHO0FBQzdCO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQUs7QUFDekM7QUFDQSxRQUFRLE9BQU8sQ0FBQyxFQUFFLEVBQUU7QUFDcEI7QUFDQSxZQUFZLENBQUMsR0FBRyxFQUFDO0FBQ2pCLFlBQVksQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQUs7QUFDM0U7QUFDQSxZQUFZLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRTtBQUMxQixnQkFBZ0IsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBQztBQUN4QyxhQUFhLE1BQU07QUFDbkIsZ0JBQWdCLENBQUMsR0FBRyxFQUFDO0FBQ3JCLGdCQUFnQixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBQztBQUM3QixhQUFhO0FBQ2I7QUFDQTtBQUNBLFlBQVksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRTtBQUNqQztBQUNBLFNBQVM7QUFDVDtBQUNBLFFBQVEsT0FBTyxDQUFDO0FBQ2hCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHO0FBQ25CO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQzNCLFFBQVEsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUM7QUFDeEMsUUFBUSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBQztBQUNwQjtBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNqQztBQUNBLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUI7QUFDQSxZQUFZLFFBQVEsQ0FBQztBQUNyQjtBQUNBLGdCQUFnQixLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLO0FBQ2hGLGdCQUFnQixLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLO0FBQ3JGLGdCQUFnQixLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLO0FBQ2xGLGdCQUFnQixLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLO0FBQ3RGO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsWUFBWSxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQzFCO0FBQ0EsU0FBUztBQUNUO0FBQ0EsUUFBUSxPQUFPLE1BQU07QUFDckI7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsSUFBSSxLQUFLLENBQUMsR0FBRztBQUNiO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBQztBQUNyQixRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUU7QUFDckIsUUFBUSxPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDM0I7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUc7QUFDeEI7QUFDQSxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25CLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsT0FBTTtBQUN0QztBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksWUFBWSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUU7QUFDN0IsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7QUFDeEQsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHO0FBQ2xDO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxJQUFJLFFBQVEsQ0FBQztBQUM1QyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztBQUNyQztBQUNBLFFBQVEsT0FBTyxJQUFJO0FBQ25CO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxLQUFLLENBQUMsR0FBRztBQUNiO0FBQ0EsUUFBUSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDdEI7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdkIsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ3hCLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUN4QjtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUN6QixRQUFRLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRTtBQUMvQjtBQUNBLFFBQVEsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUM7QUFDdkM7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRTtBQUNyQixZQUFZLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUk7QUFDbEQ7QUFDQSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBQztBQUM1RCxTQUFTO0FBQ1Q7QUFDQSxRQUFRLE9BQU8sQ0FBQyxFQUFFLEVBQUU7QUFDcEI7QUFDQTtBQUNBLFlBQVksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDO0FBQ3JFLFNBQVMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUQ7QUFDQSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSTtBQUMvQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSTtBQUNoRDtBQUNBLFNBQVM7QUFDVDtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQ3BQTyxNQUFNLFFBQVEsU0FBUyxLQUFLLENBQUM7QUFDcEM7QUFDQSxJQUFJLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHO0FBQzFCO0FBQ0EsUUFBUSxLQUFLLEVBQUUsQ0FBQyxHQUFFO0FBQ2xCO0FBQ0EsUUFBUSxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksTUFBSztBQUN6QyxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFDO0FBQ2pDLFFBQVEsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFJO0FBQ3REO0FBQ0EsUUFBUSxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQUs7QUFDOUIsUUFBUSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFDO0FBQzFCLFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFDO0FBQ3BDO0FBQ0EsUUFBUSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBRTtBQUMvQjtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBSztBQUNoQyxRQUFRLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUk7QUFDOUI7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxFQUFFLEdBQUU7QUFDOUI7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUU7QUFDbkM7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLEtBQUk7QUFDNUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsUUFBTztBQUN6QztBQUNBLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsRUFBRTtBQUNwQztBQUNBLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE9BQU07QUFDMUMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjLEdBQUcsU0FBUTtBQUNyRCxZQUFZLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRTtBQUN6QixZQUFZLElBQUksQ0FBQyxDQUFDLElBQUksR0FBRTtBQUN4QjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBQztBQUN4QixRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBQztBQUN0QixRQUFRLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFNO0FBQzVCO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLDhCQUE4QixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxDQUFDLElBQUksR0FBRTtBQUNsSTtBQUNBO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRTtBQUN0QztBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRTtBQUN0RCxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsR0FBRTtBQUN6RCxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUU7QUFDdEQ7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUU7QUFDM0UsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUM7QUFDNUY7QUFDQSxRQUFRLElBQUksQ0FBQyxJQUFJLEdBQUU7QUFDbkIsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFFO0FBQ3JCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsRUFBRSxJQUFJLEdBQUc7QUFDbEI7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLEdBQUcsT0FBTyxLQUFLLENBQUM7QUFDL0M7QUFDQSxRQUFRLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFNO0FBQzVCLFFBQVEsSUFBSSxNQUFLO0FBQ2pCO0FBQ0EsUUFBUSxRQUFRLElBQUk7QUFDcEIsWUFBWSxLQUFLLENBQUM7QUFDbEI7QUFDQSxnQkFBZ0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztBQUMxQyxnQkFBZ0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzlELGdCQUFnQixLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQzVLLGdCQUFnQixJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM3RDtBQUNBLFlBQVksTUFBTTtBQUNsQixZQUFZLEtBQUssQ0FBQztBQUNsQjtBQUNBLGdCQUFnQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO0FBQzlDLGdCQUFnQixJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDakUsZ0JBQWdCLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxTQUFRO0FBQy9LLGdCQUFnQixJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM3RDtBQUNBLFlBQVksTUFBTTtBQUNsQixTQUFTO0FBQ1Q7QUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQzFCLFFBQVEsT0FBTyxJQUFJLENBQUM7QUFDcEI7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLEtBQUssQ0FBQyxHQUFHO0FBQ2I7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQzVCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDbkI7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDM0IsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQztBQUNqRDtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsWUFBWSxHQUFHLE9BQU8sT0FBTyxDQUFDO0FBQzdELGFBQWEsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEdBQUcsT0FBTyxNQUFNLENBQUM7QUFDMUUsYUFBYSxPQUFPLFVBQVUsQ0FBQztBQUMvQjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDbEI7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQzVCLFFBQVEsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3ZCLFFBQVEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDcEI7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQzNCLFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzlCLFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDekIsUUFBUSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzVCLFFBQVEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDcEI7QUFDQSxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU87QUFDbEM7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQzlCLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUMzRCxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUMxRTtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUN6QyxRQUFRLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMvRDtBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtBQUNoQztBQUNBLFlBQVksSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3pDLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2xFO0FBQ0EsWUFBWSxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckMsWUFBWSxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDL0M7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxRQUFRLElBQUksS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ25DLFFBQVEsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDbkM7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDakU7QUFDQSxRQUFRLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDNUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDckMsWUFBWSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7QUFDdkUsWUFBWSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ2hDLFlBQVksSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ2xDLFlBQVksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQy9CLFNBQVM7QUFDVDtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ2hCO0FBQ0EsUUFBUSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3RDO0FBQ0EsUUFBUSxJQUFJLElBQUksS0FBSyxVQUFVLEdBQUc7QUFDbEM7QUFDQSxZQUFZLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3JEO0FBQ0EsWUFBWSxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHO0FBQ2hDLGdCQUFnQixDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDeEQsYUFBYSxNQUFNLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUc7QUFDdkMsZ0JBQWdCLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUN4RCxhQUFhO0FBQ2I7QUFDQSxZQUFZLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDL0IsWUFBWSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUN6QixZQUFZLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDaEM7QUFDQSxZQUFZLE9BQU8sSUFBSSxDQUFDO0FBQ3hCO0FBQ0EsU0FBUztBQUNULFFBQVEsT0FBTyxLQUFLLENBQUM7QUFDckI7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsSUFBSSxRQUFRLENBQUMsR0FBRztBQUNoQjtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ25CLFFBQVEsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ25CLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNsRCxRQUFRLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQyxRQUFRLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQyxRQUFRLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEMsUUFBUSxPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDbEc7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLE1BQU0sQ0FBQyxFQUFFLEVBQUUsR0FBRztBQUNsQjtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUMzQyxRQUFRLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQztBQUM5RDtBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDMUQ7QUFDQSxRQUFRLEtBQUssSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUc7QUFDOUI7QUFDQSxZQUFZLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFNO0FBQ2hDLFlBQVksSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztBQUNqSixZQUFZLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3pEO0FBQ0EsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDN0I7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUNqT08sTUFBTSxLQUFLLFNBQVMsS0FBSyxDQUFDO0FBQ2pDO0FBQ0EsSUFBSSxXQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRztBQUMxQjtBQUNBLFFBQVEsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ25CO0FBQ0E7QUFDQTtBQUNBLEtBQUssSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQztBQUNuQztBQUNBLEtBQUssSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7QUFDdEI7QUFDQSxLQUFLLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDN0MsS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUssSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQztBQUNsQyxLQUFLLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM1QztBQUNBLEtBQUssSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3pCO0FBQ0EsS0FBSyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksRUFBRSxFQUFFLENBQUM7QUFDNUIsS0FBSyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUM7QUFDM0IsS0FBSyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFLENBQUM7QUFDeEI7QUFDQSxLQUFLLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFNO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsNkJBQTZCLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRTtBQUN2TTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUN4RCxPQUFPLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0MsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUIsT0FBTyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsT0FBTztBQUNQO0FBQ0EsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDO0FBQ3BEO0FBQ0EsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzRSxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDakM7QUFDQSxZQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFH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LEtBQUssQ0FBQztBQUMxQztBQUNBLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDdEI7QUFDQSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM1QixFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuQyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDcEMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdDLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QztBQUNBLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3BFO0FBQ0EsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDNUMsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDNUM7QUFDQSxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM3RSxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzFFLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3JEO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxLQUFLLENBQUMsR0FBRztBQUNWO0FBQ0E7QUFDQSxLQUFLLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQjtBQUNBLEtBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNwQjtBQUNBLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztBQUNqQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDaEM7QUFDQTtBQUNBO0FBQ0EsS0FBSyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQzdDO0FBQ0E7QUFDQTtBQUNBLEtBQUssSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDaEM7QUFDQSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLENBQUM7QUFDNUQ7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ2xCO0FBQ0E7QUFDQSxFQUFFLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTztBQUNoQztBQUNBO0FBQ0E7QUFDQSxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLEVBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNqQjtBQUNBO0FBQ0EsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFDO0FBQzNELEtBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFFO0FBQzlDO0FBQ0EsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFFO0FBQzlFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUk7QUFDbkMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSTtBQUNwQztBQUNBLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFJO0FBQ25DO0FBQ0EsS0FBSyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBSztBQUNsQyxLQUFLLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFDO0FBQzVDLEtBQUssSUFBSSxDQUFDLFNBQVMsR0FBRTtBQUNyQjtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7O0FDcGFPLE1BQU0sR0FBRyxTQUFTLEtBQUssQ0FBQztBQUMvQjtBQUNBLElBQUksV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUc7QUFDMUI7QUFDQSxRQUFRLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNuQjtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMs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Q0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQzlCLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDO0FBQ25DLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDO0FBQ25DO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FDM1VPLE1BQU0sS0FBSyxTQUFTLEtBQUssQ0FBQztBQUNqQztBQUNBLElBQUksV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUc7QUFDMUI7QUFDQSxRQUFRLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNuQjtBQUNBLEtBQUssSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RCxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDckM7QUFDQSxRQUFRLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsS0FBSyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDckUsUUFBUSxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDO0FBQ2xELFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQztBQUNsQztBQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUMxRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxD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SUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ3RELFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckMsU0FBUyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzQjtBQUNBLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdEYsY0FBYyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztBQUM3RDtBQUNBLFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzlIO0FBQ0EsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNyQixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FB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R0FBRyxDQUFDLE9BQU07QUFDL0IsUUFBUSxNQUFNLENBQUMsRUFBRSxDQUFDO0FBQ2xCLFlBQVksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRTtBQUN6QyxZQUFZLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFFO0FBQy9CLFNBQVM7QUFDVDtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksS0FBSyxDQUFDLEdBQUc7QUFDYjtBQUNBLFFBQVEsS0FBSyxDQUFDLEtBQUssR0FBRTtBQUNyQjtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUM7QUFDdEI7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBSztBQUNwQztBQUNBLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEtBQUssS0FBSTtBQUNwRDtBQUNBLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUk7QUFDbEMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSTtBQUNsQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUk7QUFDdkMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxLQUFJO0FBQ3ZDO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRTtBQUM3QztBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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RSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLHdCQUF3QixFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuSSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDaEU7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDbkQsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDNUUsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUM3RjtBQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUM7QUFDcEI7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNoQztBQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3BCO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzNCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsRUFBRSxJQUFJLEdBQUc7QUFDbEI7QUFDQSxRQUFRLElBQUksRUFBRSxH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QUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDL0U7QUFDQSxRQUFRLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDekM7QUFDQSxRQUFRLEtBQUssUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUc7QUFDeEMsWUFBWSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0QsWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDM0QsWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDM0QsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN6RTtBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3RCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDbkI7QUFDQSxRQUFRLEdBQUcsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEM7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO0FBQzlDLFFBQVEsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3pCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUc7QUFDbEI7QUFDQSxRQUFRLElBQUksRUFBRSxLQUFLLFNBQVMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ3pDO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxFQUFFO0FBQ3BDO0FBQ0EsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUM5QjtBQUNBLGdCQUFnQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDM0M7QUFDQSxnQkFBZ0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUUsZ0JBQWdCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVFO0FBQ0EsZ0JBQWdCLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3ZFO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDekI7QUFDQSxRQUFRLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUM3QjtBQUNBO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ3BEO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxTQUFTLENBQUMsR0FBRztBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNsRSxRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDbEU7QUFDQSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUM7QUFDNUI7QUFDQSxZQUFZLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QyxZQUFZLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUMvQztBQUNBLFlBQVksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM3RCxZQUFZLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDN0QsU0FBUyxNQUFNO0FBQ2YsWUFBWSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzVELFlBQVksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM1RCxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3hELFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUN4RDtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDM0YsUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMzRjtBQUNBLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxD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LENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLHdCQUF3QixFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuSTtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbkMsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFFO0FBQ3RELFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRTtBQUN0RCxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUU7QUFDdEQsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEdBQUU7QUFDekQ7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUU7QUFDakYsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUM7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LENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzNELFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzFFO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM5QztBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdEc7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN2RCxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDekQ7QUFDQSxRQUFRLElBQUksS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQ3RDLFFBQVEsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDO0FBQ2hEO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLEtBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ2pFO0FBQ0EsUUFBUSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQzVDLFlBQVksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUM1QyxZQUFZLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztBQUN2RSxZQUFZLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDaEMsWUFBWSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDbEMsWUFBWSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDL0IsU0FBUztBQUNUO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDaEI7QUFDQSxRQUFRLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDdEM7QUFDQSxRQUFRLElBQUksSUFBSSxLQUFLLE1BQU0sR0FBRztBQUM5QjtBQUNBLFlBQVksSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDckQ7QUFDQSxZQUFZLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUc7QUFDaEMsZ0JBQWdCLENBQUMsR0FBRyxJQUFJLENB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LEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUMzQyxRQUFRLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQztBQUM1RDtBQUNBLFFBQVEsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ3BDLFFBQVEsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLE9BQU8sSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDckU7QUFDQSxRQUFRLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDakMsUUFBUSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ2pDO0FBQ0EsUUFBUSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsR0FBRyxHQUFHLEtBQUssRUFBRSxDQUFDO0FBQ25DLFFBQVEsSUFBSSxFQUFFLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3BDLFFBQVEsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFLEdBQUcsR0FBRyxLQUFLLEVBQUUsQ0FBQztBQUNuQyxRQUFRLElBQUksRUFBRSxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNwQztBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEdBQUcsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3JGO0FBQ0EsUUFBUSxLQUFLLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHO0FBQzlCO0FBQ0EsWUFBWSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDOUMsWUFBWSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDOUMsWUFBWSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNuQyxZQUFZLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDcEMsWUFBWSxJQUFJLEdBQUcsR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkQsWUFBWSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDakk7QUFDQSxZQUFZLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztBQUNuSyxZQUFZLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3pEO0FBQ0EsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDN0I7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUNsUU8sTUFBTSxJQUFJLFNBQVMsS0FBSyxDQUFDO0FBQ2hDO0FBQ0EsSUFBSSxXQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRztBQUMxQjtBQUNBLFFBQVEsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ25CO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBSztBQUNoQztBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ2pDLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztBQUNyQztBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDekQsUUFBUSxJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztBQUNyQztBQUNBLFFBQVEsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDM0IsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUN6QjtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUM7QUFDNUM7QUFDQTtBQUNBLFFBQVEsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUM7QUFDdEM7QUFDQTtBQUNBLFFBQVEsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLFVBQVUsSUFBSSxHQUFFO0FBQ25DLFFBQVEsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBQztBQUN0QjtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDdkIsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUN2QjtBQUNBLFFBQVEsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxJQUFJLE1BQUs7QUFDM0MsUUFBUSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLElBQUksTUFBSztBQUM3QztBQUNBLFFBQVEsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUTtBQUN6QyxRQUFRLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsT0FBTTtBQUM1RCxRQUFRLElBQUksQ0FBQyxDQUFDLFVBQVUsS0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsV0FBVTtBQUN6RTtBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsR0FBRyxLQUFLLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6QztBQUNBO0FBQ0EsUUFBUSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdDLFFBQVEsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU07QUFDNUI7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcscUNBQXFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNoSCxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsNERBQTRELENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNyVSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsZ0RBQWdELENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNySztBQUNBLFFBQVEsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2xJLFFBQVEsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFlBQVksRUFB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LEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLFNBQVM7QUFDVDtBQUNBLFFBQVEsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQztBQUM3QztBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQzNCLFlBQVksSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDM0IsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQzdDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUM3QyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUk7QUFDakQsWUFBWSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUN0QyxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsVUFBVSxJQUFJLE1BQUs7QUFDL0MsUUFBUSxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLElBQUksZ0JBQWU7QUFDckQsUUFBUSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEQ7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLE1BQUs7QUFDbkMsUUFBUSxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLElBQUksTUFBSztBQUN6QyxRQUFRLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsSUFBSSxLQUFJO0FBQzVDLFFBQVEsSUFBSSxDQUFD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LFlBQVksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ3hELFNBQVM7QUFDVDtBQUNBLFFBQVEsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQzVCO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDcEM7QUFDQSxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDN0I7QUFDQSxRQUFRLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUMxQztBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksS0FBSyxDQUFDLEdBQUc7QUFDYjtBQUNBLFFBQVEsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3RCO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlEO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDcEM7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUM1QixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3pDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQ25DLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ3BEO0FBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzdCO0FBQ0EsUUFBUSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDaEM7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUc7QUFDakI7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztBQUNwQztBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksWUFBWSxDQUFDLEdBQUc7QUFDcEI7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDNUIsUUFBUSxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDeEU7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLEtBQUssQ0FBQyxHQUFHO0FBQ2I7QUFDQSxRQUFRLEtBQUssQ0FBQyxLQUFLLEdBQUU7QUFDckI7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUN4QixRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDeEI7QUFDQSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsRUFBRSxPQUFPO0FBQ3JDO0FBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMs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QUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSTtBQUN0RCxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxLQUFJO0FBQ3BDLFlBQVksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFDO0FBQzdCO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDckMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxxQ0FBcUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLHdDQUF3QyxHQUFHLEVBQUUsQ0FBQyxVQUFVLEdBQUcsZUFBZSxHQUFHLEVBQUUsQ0FBQyxNQUFNLEdBQUcsbUNBQW1DLENBQUMsQ0FBQztBQUMxUDtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ3JDLFFBQVEsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsa0JBQWtCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyw0QkFBNEIsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2pKO0FBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDcEIsS0FBSztBQUNMO0FBQ0EsSUFBSSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDbkI7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFLO0FBQzFCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsT0FBTyxFQUFFO0FBQ2hEO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBRztBQUN4QixRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFHO0FBQ3hCO0FBQ0EsUUFBUSxPQUFPLENBQUMsRUFBRSxFQUFFO0FBQ3BCLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUM7QUFDckQsU0FBUztBQUNUO0FBQ0EsUUFBUSxPQUFPLEVBQUU7QUFDakI7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ3BCO0FBQ0EsUUFBUSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRTtBQUNyQztBQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDMUIsWUFBWSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUk7QUFDOUIsWUFBWSxJQUFJLElBQUksS0FBSyxFQUFFLEVBQUU7QUFDN0IsYUFBYSxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUk7QUFDaEMsYUFBYSxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLFVBQVUsRUFBRSxJQUFJLENBQUMs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ZCxRQUFRLEVBQUUsR0FBRyxDQUFDO0FBQ2QsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDO0FBQ3ZCLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNoQjtBQUNBLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtBQUM1QixRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDZixRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDZixRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDZixRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDZixRQUFRLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQztBQUNoQyxPQUFPO0FBQ1A7QUFDQSxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUM3RDtBQUNBLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDL0MsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztBQUN6QyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ3JELE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQ3JELE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFL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TUFBTSxFQUFFLENBQUM7QUFDcEIsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDckIsTUFBTSxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQzVFO0FBQ0E7QUFDQSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO0FBQzFEO0FBQ0E7QUFDQSxNQUFNLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN0RDtBQUNBLE1BQU0sSUFBSSxJQUFJLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUNoRCxNQUFNLElBQUksVUFBVSxHQUFHLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDM0Q7QUFDQSxNQUFNLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNuRDtBQUNBLE1BQU0sSUFBSSxLQUFLLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDbEM7QUFDQSxNQUFNLElBQUksS0FBSyxDQUFDO0FBQ2hCLE1BQU0sSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtBQUNwRCxRQUFRLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUMsUUFBUSxJQUFJLENBQUMsS0FB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QUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7QUFDbEMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7QUFDbEMsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztBQUN4RCxRQUFRLE1BQU07QUFDZCxNQUFNLEtBQUssQ0FBQztBQUNaO0FBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUM7QUFDakMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7QUFDbEMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUM7QUFDdEMsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztBQUM1RCxRQUFRLE1BQU07QUFDZCxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0EsRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFO0FBQ2IsSUFBSSxJQUFJLFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzFEO0FBQ0EsSUFBSSxJQUFJLE9BQU87QUFDZixNQUFNLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzVFO0FBQ0EsSUFBSSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUM7QUFDM0M7QUFDQTtBQUNBLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ3RELElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDNUQsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ2pFO0FBQ0EsSUFBSSxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDeEIsR0FBRztBQUNIO0FBQ0EsRUFBRSxLQUFLLEdBQUc7QUFDVixJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNsQjtBQUNBLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQzlCLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCO0FBQ0EsSUFBSSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ3JCLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDckQsSUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMvQjtBQUNBO0FBQ0E7QUFDQSxJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDbkI7QUFDQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3BDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDcEM7QUFDQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDL0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDMUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQy9CLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzFCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDbkM7QUFDQSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNsQixHQUFHO0FBQ0g7O0FDN1NPLE1BQU0sU0FBUyxTQUFTLEtBQUssQ0FBQztBQUNyQztBQUNBLElBQUksV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUc7QUFDMUI7QUFDQSxRQUFRLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNuQjtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDdkI7QUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssS0FBSyxT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QyxRQUFRLEVBQUUsT0FBTztBQUNsQztBQUNBLFFBQVEsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCO0FBQ0EsUUFBUSxJQUFJLElBQUksS0FBSyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsRCxhQUFhLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUMzQjtBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3REO0FBQ0EsUUFBUSxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUMzRDtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksTUFBTSxDQUFDLElBQUk7QUFDZjtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUMzQztBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxJQUFJLEtBQUssQ0FBQyxHQUFHO0FBQ2I7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN0QjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDMUI7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdkIsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUM1QixRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQzNCLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFDO0FBQ3JDO0FBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUM7QUFDdkMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDaEMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxFQUFDO0FBQy9CO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxRQUFRLENBQUMsR0FBRztBQUNoQjtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN2QixRQUFRLEdBQUcsQ0FBQyxDQUFDLEVBQUUsT0FBTztBQUN0QixRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQztBQUNoQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLElBQUc7QUFDakMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDOUI7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLFFBQVEsQ0FBQyxFQUFFLEtBQUssR0FBRztBQUN2QjtBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDdkM7QUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7QUFDM0M7QUFDQSxRQUFRLEdB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QUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNoSCxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQztBQUN2QztBQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3BCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLEVBQUUsR0FBRyxHQUFHO0FBQ2hCO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7QUFDcEM7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLEtBQUssRUFBRSxHQUFHLEdBQUc7QUFDakI7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztBQUNwQztBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksS0FBSyxHQUFHO0FBQ1o7QUFDQSxRQUFRLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN0QixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3hDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDdkM7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLFFBQVEsRUFBRSxDQUFDLEdBQUc7QUFDbEIsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFDO0FBQzNCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBQztBQUMzQixLQUFLO0FBQ0w7QUFDQTs7QUMxRE8sTUFBTSxNQUFNLFNBQVMsS0FBSyxD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LElBQUksQ0FBQztBQUMxQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUM7QUFDM0MsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO0FBQ3ZDO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FDL0xBO0FBRUE7QUFDTyxNQUFNLFFBQVEsU0FBUyxNQUFNLENBQUM7QUFDckM7QUFDQSxJQUFJLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHO0FBQzFCO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxVQUFVLEtBQUssU0FBUyxHQUFHLENBQUMsQ0FBQyxVQUFVLEdBQUcsS0FBSTtBQUM1RCxRQUFRLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNuQjtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQ1ZPLE1BQU0sSUFBSSxTQUFTLEtBQUssQ0FBQztBQUNoQztBQUNBLElBQUksV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUc7QUFDMUI7QUFDQSxRQUFRLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNuQjtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDckIsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDOUIsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUN4QjtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQztBQUN2QyxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUM5QjtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUM3QztBQUNBLFFBQVEsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QztBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyw0REFBNEQsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ3hMO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ3pDO0FBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDcEI7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ3BCO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ3BCO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUM5QztBQUNBLFFBQVEsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUM5QjtBQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3BCO0FBQ0EsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQjtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksS0FBSyxDQUFDLEdB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UUFBUSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTTtBQUM1QjtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxVQUFVLElBQUksTUFBSztBQUNqRCxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRTtBQUNsRCxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDL0M7QUFDQSxRQUFRLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUM7QUFDckM7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDdkIsUUFBUSxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQ3hEO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRTtBQUNyRjtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ25DO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMs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QUMsQ0FBQyxDQUFDLENBQUM7QUFDN0I7QUFDQSxRQUFRLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQy9DO0FBQ0EsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDM0QsWUFBWSxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xEO0FBQ0EsU0FBUztBQUNUO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FDMVRPLE1BQU0sS0FBSyxTQUFTLEtBQUssQ0FBQztBQUNqQztBQUNBLElBQUksV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUc7QUFDMUI7QUFDQSxRQUFRLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNuQjtBQUNBLFFBQVEsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDL0IsUUFBUSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFDO0FBQzNCLFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFDO0FBQ3BDO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFFO0FBQ3hCO0FBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO0FBQ2xDLFFBQVEsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDdkQ7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUNwRCxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxTQUFTLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDbkQ7QUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQy9DO0FBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLFFBQU87QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxLQUFLLFNBQVMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNyRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzlGO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNwQztBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzlDO0FBQ0E7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEdBQUc7QUFDdEM7QUFDQSxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7QUFDM0MsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDO0FBQ3RELFlBQVksSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDMUIsWUFBWSxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN6QjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxRQUFRLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFNO0FBQzVCO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyw4QkFBOEIsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLHdCQUF3QixHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUMzSSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDM0M7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFFO0FBQ2pDO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUU7QUFDOUMsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUU7QUFDaEQsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUU7QUFDaEQsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUU7QUFDaEQsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUU7QUFDaEQ7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRTtBQUNyRSxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFDO0FBQ3RGO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUc7QUFDdkI7QUFDQSxRQUFRLElBQUksQ0FBQyxJQUFJLEdBQUU7QUFDbkIsUUFBUSxJQUFJLENBQUMsUUFBUSxHQUFFO0FBQ3ZCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDbkI7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDM0I7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENB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QUFRLFFBQVEsSUFBSTtBQUNwQixZQUFZLEtBQUssQ0FBQztBQUNsQjtBQUNBLGdCQUFnQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQzFDLGdCQUFnQixJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFDO0FBQzNELGdCQUFnQixJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFDO0FBQzdELGdCQUFnQixJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFDO0FBQzdELGdCQUFnQixJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFDO0FBQzdELGdCQUFnQixJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFFO0FBQzlEO0FBQ0EsWUFBWSxNQUFNO0FBQ2xCLFlBQVksS0FBSyxDQUFDO0FBQ2xCO0FBQ0EsZ0JBQWdCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUM7QUFDaEQsZ0JBQWdCLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUM7QUFDOUQsZ0JBQWdCLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUM7QUFDOUQsZ0JBQWdCLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUM7QUFDaEUsZ0JBQWdCLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUM7QUFDaEUsZ0JBQWdCLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUU7QUFDcEU7QUFDQSxZQUFZLE1BQU07QUFDbEIsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUMxQixRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUMzQztBQUNBLFFBQVEsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3pCO0FBQ0EsUUFBUSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDN0I7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLFNBQVMsR0FBRztBQUNoQjtBQUNBLFFBQVEsS0FBSyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsR0FBRztBQUMvQjtBQUNBLFlBQVksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUMxRCxZQUFZLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDMUQ7QUFDQSxZQUFZLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDMUQsWUFBWSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzFEO0FBQ0EsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3RELFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUN0RDtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDNUM7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTTtBQUM3QjtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDeEUsUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN4RTtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxLQUFLLEdBQUc7QUFDL0I7QUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLFNBQVMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZHLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFB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LENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0MsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0M7QUFDQSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdEQ7QUFDQTtBQUNBLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2hDLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3JEO0FBQ0E7QUFDQSxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNoQztBQUNBLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDZjtBQUNBLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDaEI7QUFDQSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7QUFDakMsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hEO0FBQ0E7QUFDQSxJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDOUQsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFH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LElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDOUIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdkQ7QUFDQSxJQUFJLElBQUksQ0FBQyxFQUFFO0FBQ1gsTUFBTSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDMUI7QUFDQSxNQUFNLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUNwQztBQUNBLE1BQU0sSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDN0MsTUFBTSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUMxQztBQUNBLE1BQU0sSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDMUM7QUFDQSxNQUFNLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDcEQ7QUFDQSxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUN2RCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztBQUNoRCxLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzdDLElBQUksSUFB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LElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztBQUNsRSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDbkQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDekQ7QUFDQSxJQUFJLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsVUFBVTtBQUMzQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztBQUMxRCxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZDLEdBQUc7QUFDSDtBQUNBLEVBQUUsTUFBTSxHQUFHO0FBQ1gsSUFBSSxLQUFLLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztBQUM1QixHQUFHO0FBQ0g7QUFDQSxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUU7QUFDZCxJQUFJLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzQjtBQUNBLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNsRCxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVE7QUFDckIsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUM1RSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzdDLEdBQUc7QUFDSDtBQUNBLEVBQUUsWUFBWSxDQUFDLENBQUMsRUFBRTtBQUNsQixJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO0FBQzVCLElBQUksT0FBTyxDQUFDLEVBQUUsRUFBRTtBQUNoQixNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMxQixLQUFLO0FBQ0wsR0FBRztBQUNIOzs7OyJ9
