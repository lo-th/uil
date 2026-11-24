# UIL `v5.0.6` — Documentation

Bibliothèque d'interface utilisateur légère en JavaScript pur (DOM, SVG & rendu Canvas/WebGL), sans dépendances.

## Sommaire

- [1. Démarrage & Panneau (`Gui`)](#1-démarrage--panneau-gui)
- [2. Ajouter des contrôles (`add`)](#2-ajouter-des-contrôles-add)
- [3. Catalogue des composants](#3-catalogue-des-composants)
- [4. Méthodes communes (`Proto`)](#4-méthodes-communes-proto)
- [5. Thème & Personnalisation (`Tools.colors`)](#5-thème--personnalisation-toolscolors)
- [6. Utilitaires (`Files` & Rendu Canvas 3D)](#6-utilitaires-files--rendu-canvas-3d)

---

## 1. Démarrage & Panneau (`Gui`)

```javascript
import { UIL, Gui, add, Tools, Files } from './uil.js';

const ui = new Gui({
    w: 300,                 // Largeur en px (défaut: 320)
    h: 24,                  // Hauteur par défaut des lignes (défaut: 24)
    p: 30,                  // Pourcentage réservé aux labels (défaut: 30)
    css: 'right:10px;',     // Positionnement CSS personnalisé
    center: false,          // Centrer horizontalement
    bottom: 0,              // Ancrer en bas à X px
    open: true,             // Ouvert au démarrage (défaut: true)
    close: true,            // Afficher le bouton ouvrir/fermer en bas
    topClose: false,        // Bouton rétractable en haut ('left' | 'right' | true)
    maxHeight: 0,           // Hauteur max avant apparition du scroll
    isCanvas: false,        // Mode rendu sur <canvas> (pour textures 3D)
    canvasScale: 1,         // Multiplicateur de résolution en mode Canvas
    colors: {               // Surcharge du thème
        select: '#308AFF',
        radius: 4
    }
});
```

---

## 2. Ajouter des contrôles (`add`)

Deux syntaxes sont supportées :

```javascript
// 1. Déclarative
ui.add('slide', { name: 'Vitesse', min: 0, max: 100, value: 50 })
  .onChange(val => console.log(val));

// 2. Liée à un objet (type dat.GUI) — détecte automatiquement le type
const params = { vitesse: 50, actif: true, couleur: '#308AFF', mode: 'A' };
ui.add(params, 'vitesse', { min: 0, max: 100 });
ui.add(params, 'actif');
ui.add(params, 'couleur');
ui.add(params, 'mode', { list: ['A', 'B', 'C'] });
```

---

## 3. Catalogue des composants

| Type | Alias | Options spécifiques | Description |
| :--- | :--- | :--- | :--- |
| `slide` | — | `min`, `max`, `step`, `precision`, `editable`, `mode` (0..3), `isDeg`, `isTime`, `cyclic`, `allway` | Curseur numérique avec saisie clavier (`Tab` supporté si `editable: true`) |
| `numeric` | `number` | `value` (nombre, `[x,y,z]` ou `{x,y,z}`), `min`, `max`, `step`, `precision`, `drag`, `isAngle`, `center` | Boîtes numériques simples ou vectorielles |
| `string` | `textInput` | `value`, `placeHolder`, `edit`, `allway` | Champ texte éditable (navigation clavier `Tab` / `Shift+Tab`) |
| `bool` | `boolean` | `value`, `onName`, `mode` (0: switch, 1: bouton, 2: checkbox) | Case à cocher ou interrupteur |
| `button` | — | `values` (string ou array), `bw`, `space`, `onName`, `selectable`, `unselect` | Bouton simple ou barre de boutons |
| `selector` | — | Identique à `button` (`selectable: true` par défaut) | Sélecteur exclusif parmi plusieurs choix |
| `grid` | — | `values` (array ou objet), `bsize: [w, h]`, `spaces: [x, y]`, `selectable` | Grille de boutons sur 2 colonnes |
| `list` | — | `list` (array ou objet), `openItem`, `full`, `side` ('up'/'down'), `path`, `format`, `miniIcon`, `emojii` | Menu déroulant avec scroll rapide |
| `color` | — | `value` (hex, int, `[r,g,b]`, `Color`), `ctype` ('hex'/'html'/'rgb'/'array'), `side`, `open` | Sélecteur roue chromatique + triangle HSL |
| `knob` | — | `min`, `max`, `step`, `diam`, `mode` (0..2), `limit`, `cyclic` | Potentiomètre rotatif |
| `circular` | — | `min`, `max`, `step`, `diam`, `mode` (0..1), `cyclic` | Jauge circulaire interactive |
| `pad2d` | `pad` | `value: [x, y]`, `min`, `max`, `diam`, `mode` (0..1), `flipY` | Pavé tactile 2D |
| `joystick` | — | `diam`, `mode` (0: 3D, 1: flat), `multiplicator`, `precision`, `text` | Joystick analogique avec retour au centre |
| `graph` | — | `value: [...]`, `multiplicator`, `neg`, `line`, `precision` | Éditeur de courbe / barres multi-points |
| `bitmap` | — | `value` (`Texture`), `colorSpace` | Chargeur d'image avec aperçu et mise à jour de texture |
| `group` | — | `name`, `mark` (couleur hex), `open`, `bgAlpha` | Dossier pliable (supporte les sous-groupes imbriqués) |
| `title` | `text`, `note` | `name`, `align` ('left'/'center'/'right'), `fontSize`, `weight`, `color` | Titre ou texte informatif (supporte le HTML) |
| `empty` | `space` | `h` (hauteur en px) | Espaceur vertical invisible |
| `fps` | — | `custom`, `names`, `range`, `cc`, `res` | Moniteur de performances FPS / MS / Mémoire |
| `checker` | — | `name` | Mire de calibration 24 couleurs dépliable |
| `item` | — | `name`, `itype` ('solid', 'body', 'vehicle', 'joint', 'object'...) | Élément de liste avec icône SVG (pour `itemMode: true`) |
| `select` | — | `value`, `onActif` | Bouton pipette / outil de sélection actif |

---

## 4. Méthodes communes (`Proto`)

Tous les composants héritent de `Proto` et exposent des méthodes chaînables :

```javascript
const ctrl = ui.add('slide', { name: 'Force', min: 0, max: 10 })
    .onChange(v => { /* appelé à chaque changement */ })
    .onFinishChange(v => { /* appelé au relâchement (alias: .onEnd()) */ })
    .listen(); // Synchronise automatiquement l'UI si l'objet lié est modifié ailleurs

ctrl.setValue(5);       // Modifie la valeur sans déclencher onChange
ctrl.rename('Gravité'); // Change le label affiché
ctrl.display(false);    // Masque ou affiche le composant
ctrl.dispose();         // Supprime proprement le composant du DOM et de la mémoire
```

---

## 5. Thème & Personnalisation (`Tools.colors`)

Ces propriétés peuvent être passées dans `new Gui({ colors: { ... } })`, directement dans les options d'un widget, ou globalement via `Tools.setStyle({ ... })` :

- **Espacement & Bordures :** `sx` (marge X, défaut `4`), `sy` (marge Y, défaut `0`), `radius` (arrondi en px ou `'50%'`, défaut `0`), `borderSize` (défaut `1`).
- **Couleurs :** `background`, `backgroundOver`, `content`, `button`, `overoff`, `select`, `over`, `action`, `text`, `textOver`, `textSelect`, `title`, `titleoff`, `back`, `backoff`, `border`, `gborder`, `groups`.
- **Typographie :** `fontFamily`, `fontSize` (défaut `11`), `fontWeight`, `fontShadow`.

---

## 6. Utilitaires (`Files` & Rendu Canvas 3D)

### Gestionnaire de fichiers (`Files`)

```javascript
// Charger un fichier ('image' | 'json' | 'text' | 'bin' | 'svg' | 'hdr' | 'exr' | 'ktx2'...)
const res = await Files.load({ type: 'image' });
if (res) console.log(res.data, res.name, res.dim);

// Sauvegarder un fichier
await Files.save({ name: 'config', type: 'json', data: JSON.stringify(params) });
```

### Rendu sur Canvas (WebGL / 3D)

```javascript
const gui3D = new Gui({ w: 256, isCanvas: true, canvasScale: 2 });
gui3D.onDraw = () => { texture.needsUpdate = true; };

// Transmettre les coordonnées UV (0..1) depuis un Raycaster :
gui3D.setMouse(uv);
gui3D.triggerMouseUV('down', uv.x, uv.y); // 'down' | 'move' | 'up'
```
