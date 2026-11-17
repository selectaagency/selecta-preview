/* ======================================================================
   PANAME REND FOU — plateforme dans le métro parisien
   ----------------------------------------------------------------------
   Cinq stations dessinées à la main (pas de génération aléatoire) :
     1. Châtelet         ligne 1   trottoir roulant, portillons, tunnel
     2. Abbesses         ligne 12  l'escalier de 176 marches, édicule Guimard
     3. Arts et Métiers  ligne 11  le Nautilus en cuivre, engrenages mobiles
     4. Bir-Hakeim       ligne 6   viaduc au-dessus de la Seine, navette
     5. Madeleine        ligne 14  portes palières, rames automatiques
   Physique à pas fixe (120 Hz) : mêmes sauts quel que soit l'écran.
   Rendu net : pixel art à l'échelle entière du périphérique, textes en
   vraie typographie à la résolution de l'écran.
   API conservée : window.metropop.{start, menu, size, stop, isRunning}.
   ====================================================================== */
(function () {
  'use strict';
  var root = document.getElementById('pr');
  var cv = document.getElementById('pr-cv');
  if (!root || !cv) return;
  var ctx = cv.getContext('2d', { alpha: false });
  var phone = document.getElementById('phone');

  var LEVELS = [{"id":"chatelet","name":"Châtelet","line":"1","color":"#FFCE00","ink":"#1D1D1B","theme":"carreaux","map":["                                                                                                                                                                                                                                                         ","                                                                                                                                                                                                                                                         ","                                                                                                                                                                                                                                                         ","                                                                                                                                                                                                                                                         ","                                                                                                                                                                                                                                                         ","                                                                                              N                                                                                                                                                          ","                                                                                             ===                                                                                                                                                         ","                                                                                                                                                                                                                                                         ","                                                                                                  ===                                                                                                                                                    ","                                                                                             o                                                                         o        o         o                                                              ","                    o o                                                                     ===                                                                     ====     ====      ====                                N                             ","                          o o                o o o          o   o   o   o   o   o                 o                                       o o o o o o                                                                     ===                            ","       o o o        ####                    o     o                                       ==     ===          H     H                           c          #####                                 ####                 o o o                              ","   S                ####  ####                                    r                                           H     H     K                                #####                                 ####                ##########                          ","############################################     ############>>>>>>>>>>>>>>>>>>>>>>###################################################!!!!!!!!!!!!!!!!!#########                                 ####                ##########            E             ","############################################     ###################################### ########################################################################                                 ####                ##########     ##############       ","############################################     ###################################### #################################################################################################################################################################","############################################     ###################################### #################################################################################################################################################################"],"par":75,"trains":[{"kind":"pass","dir":1,"speed":170,"period":9.0,"delay":3.0,"x0":155,"x1":209}],"hints":[[4,10,"Glisse à gauche pour courir"],[24,8,"Touche à droite pour sauter"],[53,9,"Trottoir roulant !"],[99,7,"Portillon : 1 ticket"],[99,8,"…ou saute (à tes risques)"],[131,8,"Le train arrive : grimpe !"]]},{"id":"abbesses","name":"Abbesses","line":"12","color":"#00814F","ink":"#FFFFFF","theme":"nordsud","map":["#                        #","#                        #","#                        #","#                        #","#    N                   #","#   ====                 #","#               H        #","#               H        #","#      o o      H  o E   #","##########======##########","##                      ##","##                      ##","##        ======        ##","##                 o o  ##","##               =======##","##                      ##","##        ======        ##","##  o o                 ##","##=======               ##","##                      ##","##        ======        ##","##                 o o  ##","##               =======##","##          K           ##","##        ======        ##","##  o o                 ##","##=======               ##","##                   p  ##","##        ======        ##","##                 o o  ##","##               =======##","##          c           ##","##        ======        ##","##  o o               N ##","##=======               ##","##                      ##","##        ======        ##","##                 o o  ##","##               =======##","##                      ##","##        ======        ##","##  o o                 ##","##=======               ##","##                      ##","##        ======        ##","## r               o o  ##","##               =======##","##                      ##","##        ======        ##","##  o o                 ##","##=======               ##","##                      ##","##        ======        ##","##                 o o  ##","##               =======##","##                      ##","##        ======        ##","##  o o                 ##","##=======               ##","##                      ##","##  S                   ##","##########################","##########################","##########################"],"par":70,"vertical":true,"trains":[],"hints":[[5,56,"176 marches : en haut !"],[12,50,"Double saut : retouche en l’air"]]},{"id":"arts","name":"Arts et Métiers","line":"11","color":"#8D5E2A","ink":"#FFFFFF","theme":"cuivre","map":["                                                                                                                                                                                         ","                                                                                                                                                                                         ","                                                                                                                                                                                         ","                                                                                                                                                                                         ","                                                                                                                                                                                         ","                                                                                                                                                                                         ","                                                                                                                                                                                         ","                                                                                                                               ===                                                       ","                                                                                                                           o        ===   o                                              ","                       o      o      o              N                                                                     ===            ===    c                                        ","                                                   ===                           o                o                                                                   N                  ","                                                                                ===              ===        K                     r            ===                   ===                 ","     o o o                                      o o o     g            #####                                  ######    ######   #######   #######   ####     o o          g             ","   S                                         ###############################                                  ######    ######   #######   #######   ##############################   E  ","####################                       #################################                                  ######    ######   #######   #######   ####################################","####################                       #################################                                  ######    ######   #######   #######   ####################################","####################                       ###################################################################################   #######   #######   ####################################","####################                       ###################################################################################   #######   #######   ####################################"],"par":80,"trains":[{"kind":"pass","dir":-1,"speed":190,"period":7.0,"delay":2.0,"x0":71,"x1":120}],"movers":[{"x":21,"y":13,"w":3,"dx":0,"dy":-4,"period":3.2},{"x":29,"y":12,"w":3,"dx":6,"dy":0,"period":3.6}],"hints":[[20,8,"Les engrenages bougent"],[70,8,"Dash : bouton DASH"]]},{"id":"birhakeim","name":"Bir-Hakeim","line":"6","color":"#6ECA97","ink":"#1D1D1B","theme":"viaduc","map":["                                                                                                                                      ","                                                                                                                                      ","                                                                                                                                      ","                                                                                                                                      ","                                                                                                                                      ","                                                                                                                                      ","                                                                                                                                      ","                                                                                                                                      ","                                                                                                                                      ","                                                                            N                                                         ","                 p          o o            o   o   o                                                        c        N                ","              o     o                                                         o  o  o  o  o  o  o                  ===      o o       ","                                               p                                                            p                         "," S   o o o  ==========    ===================     ==========     K                                     ############     #####         ","############ #      #      #      #  #      #     # #      #   ###### #                               #############     #####   E     ","############ #      #      #      #  #      #     # #      #   ###### #xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx#############     ##############","############~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~","############~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"],"par":80,"trains":[{"kind":"shuttle","dir":1,"speed":110,"dwell":2.2,"x0":70,"x1":103}],"hints":[[14,9,"Attention à la Seine"],[72,7,"Prends la rame : son toit !"]]},{"id":"madeleine","name":"Madeleine","line":"14","color":"#662483","ink":"#FFFFFF","theme":"l14","map":["                                                                                                                                                                                        ","                                                                                                                                                                                        ","                                                                                                                                                                                        ","                                                                                                                                                                                        ","                                                                                                                                                                                        ","                                                                                                                                                                                        ","                                                                                                                                                                                        ","                                                                                                                                                                                        ","                                                                                                                                                                                        ","                                                o o o                                                                                                                                   ","                                               ####                                               o            o            o                    o o o      N                           ","                   o    o    o    o        o   ####      o o                                     ===          ===          ===                             ===                          ","     o o o         |    |    |    |       ####<<<<<<<<<<<<<<######   g                    ####                                       ####       |    |                    o o o         ","   S               |    |    |    |       ####                ##########                  ####                                       ####       |    |       r                          ","##############################################  N             ##########     K            ####                                       ####    ######################################   E ","##############################################################################################                                       ####    ###########################################","########################################################################################################################################################################################","########################################################################################################################################################################################"],"par":85,"trains":[{"kind":"pass","dir":1,"speed":250,"period":6.5,"delay":2.0,"x0":90,"x1":141},{"kind":"pass","dir":1,"speed":230,"period":6.5,"delay":5.2,"x0":90,"x1":141}],"hints":[[20,8,"Portes palières : attends l’ouverture"],[100,8,"Ligne 14 : sans conducteur, très rapide"]]}];
  var T = 16, STEP = 1 / 120;

  /* réglages fins par niveau, que la carte ASCII ne peut pas exprimer */
  /* plus aucun texte d'explication sur les murs : le joueur découvre les mécaniques en jouant
     (les commandes restent dans « Commandes », au menu) */
  LEVELS.forEach(function (l) { l.hints = []; });
  LEVELS[2].movers = [{ x: 21, y: 13, w: 3, dx: 0, dy: -3, period: 3.0 }, { x: 27, y: 12, w: 3, dx: 7, dy: 0, period: 3.8 },
    { x: 38, y: 11, w: 3, dx: 0, dy: 2, period: 2.6 }];

  /* ---------------------------------------------------------------- sauvegarde */
  var SKINS = [
    { id: 'classique', name: 'Classique', need: 0, t: '#B79BFF', T: '#8E6FE0', a: '#FF8FB1', p: '#F4E9FF', P: '#CFC3E6' },
    { id: 'nuit', name: 'Nuit', need: 3, t: '#2E2B4A', T: '#1F1C36', a: '#7CF7C4', p: '#232033', P: '#16141F' },
    { id: 'or', name: 'Or', need: 6, t: '#FFD166', T: '#E0A93A', a: '#FFFFFF', p: '#3A2E12', P: '#241C0A' },
    { id: 'rouge', name: 'Rouge', need: 9, t: '#E23B4E', T: '#B21F33', a: '#FFD166', p: '#2A0F14', P: '#1A080B' }
  ];
  var SAVE = { done: {}, stars: {}, best: {}, found: {}, skin: 'classique', muted: false };
  (function load() {
    try { var j = JSON.parse(localStorage.getItem('paname-v2') || 'null'); if (j) for (var k in j) SAVE[k] = j[k]; } catch (e) {}
    try {   /* reprise des anciennes parties (niveaux finis, pass Navigo) */
      var old = JSON.parse(localStorage.getItem('metropop-save') || '{}');
      for (var i = 0; i < 5; i++) if (old['l' + i] !== undefined) SAVE.done[i] = 1;
      var nv = JSON.parse(localStorage.getItem('paname-navigo') || 'null');
      if (nv) { SAVE.oldNavigo = Math.max(SAVE.oldNavigo || 0, nv.count || 0); if (nv.skin && !j) SAVE.skin = nv.skin; }
    } catch (e) {}
  })();
  function save() { try { localStorage.setItem('paname-v2', JSON.stringify(SAVE)); } catch (e) {} }
  function navigoCount() { return Math.max(Object.keys(SAVE.found).length, SAVE.oldNavigo || 0); }
  function skin() { for (var i = 0; i < SKINS.length; i++) if (SKINS[i].id === SAVE.skin && navigoCount() >= SKINS[i].need) return SKINS[i]; return SKINS[0]; }

  /* ---------------------------------------------------------------- audio */
  var AC = null, master = null, muted = !!SAVE.muted;
  var music = null, musicWanted = false;
  function ac() {
    if (!AC) {
      try { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = 0.9; master.connect(AC.destination); }
      catch (e) { AC = null; }
    }
    if (AC && AC.state === 'suspended') AC.resume();
    return AC;
  }
  function tone(f, dur, type, vol, slide, delay) {
    if (muted) return; var a = ac(); if (!a) return;
    var t0 = a.currentTime + (delay || 0);
    var o = a.createOscillator(), g = a.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.05, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.03);
  }
  function noise(dur, vol, hp) {
    if (muted) return; var a = ac(); if (!a) return;
    var n = Math.floor(a.sampleRate * dur), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = hp || 800;
    s.buffer = b; g.gain.value = vol || 0.05; s.connect(f); f.connect(g); g.connect(master); s.start();
  }
  var SFX = {
    jump: function () { tone(330, 0.11, 'square', 0.04, 620); },
    djump: function () { tone(520, 0.12, 'triangle', 0.05, 990); },
    ticket: function () { tone(1320, 0.06, 'square', 0.03); tone(1760, 0.09, 'square', 0.03, 0, 0.05); },
    navigo: function () { [988, 1319, 1568, 1976].forEach(function (f, i) { tone(f, 0.12, 'triangle', 0.045, 0, i * 0.07); }); },
    valid: function () { tone(1850, 0.07, 'sine', 0.06); tone(1850, 0.07, 'sine', 0.06, 0, 0.11); },     /* bip-bip du valideur */
    deny: function () { tone(180, 0.22, 'square', 0.05); },
    dash: function () { noise(0.16, 0.05, 1600); tone(220, 0.14, 'sawtooth', 0.03, 520); },
    stomp: function () { tone(500, 0.08, 'square', 0.05, 200); noise(0.05, 0.04, 2000); },
    hurt: function () { tone(280, 0.25, 'sawtooth', 0.06, 80); },
    zap: function () { noise(0.3, 0.07, 3000); tone(90, 0.3, 'sawtooth', 0.05, 60); },
    splash: function () { noise(0.4, 0.07, 500); },
    cp: function () { tone(1850, 0.07, 'sine', 0.06); tone(2470, 0.12, 'sine', 0.05, 0, 0.09); },
    heal: function () { tone(660, 0.1, 'triangle', 0.05); tone(880, 0.14, 'triangle', 0.05, 0, 0.08); },
    horn: function () { tone(392, 0.35, 'sawtooth', 0.035); tone(330, 0.45, 'sawtooth', 0.035, 0, 0.32); },
    buzz: function () { for (var i = 0; i < 5; i++) tone(740, 0.06, 'square', 0.025, 0, i * 0.1); },
    fine: function () { tone(420, 0.12, 'square', 0.05); tone(300, 0.2, 'square', 0.05, 0, 0.13); },
    win: function () { [523, 659, 784, 1046, 1318].forEach(function (f, i) { tone(f, 0.24, 'triangle', 0.05, 0, i * 0.1); }); },
    ui: function () { tone(880, 0.04, 'sine', 0.03); }
  };
  function sfx(k) { try { SFX[k] && SFX[k](); } catch (e) {} }
  function musicPlay() {
    musicWanted = true; if (muted) return;
    if (!music) { music = new Audio('sounds/paname-8bit.m4a'); music.loop = true; music.volume = 0.13; music.preload = 'auto'; }
    var p = music.play(); if (p && p.catch) p.catch(function () {});
  }
  function musicPause() { if (music) try { music.pause(); } catch (e) {} }
  function musicStop() { musicWanted = false; if (music) try { music.pause(); music.currentTime = 0; } catch (e) {} }
  function setMuted(m) { muted = m; SAVE.muted = m; save(); if (m) musicPause(); else if (musicWanted && G.state === 'play') musicPlay(); }

  /* ---------------------------------------------------------------- entrées */
  var K = { l: 0, r: 0, jump: 0, dash: 0 }, P_ = { jump: 0, dash: 0 };
  var touchDir = 0;
  function onScreen() { return phone && phone.dataset.screen === 'metro' && !phone.dataset.panel; }
  function keyOf(e) {
    var k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A' || k === 'q' || k === 'Q') return 'l';
    if (k === 'ArrowRight' || k === 'd' || k === 'D') return 'r';
    if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W' || k === 'z' || k === 'Z') return 'jump';
    if (k === 'Shift' || k === 'x' || k === 'X' || k === 'j' || k === 'J') return 'dash';
    return null;
  }
  document.addEventListener('keydown', function (e) {
    if (!onScreen()) return;
    if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;   /* on tape son pseudo : le jeu ne capte rien */
    var n = keyOf(e);
    if (n) { if (!K[n] && (n === 'jump' || n === 'dash')) P_[n] = 1; K[n] = 1; e.preventDefault(); e.stopPropagation(); }
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') { e.preventDefault(); e.stopPropagation(); if (G.state === 'play') pause(); else if (G.state === 'pause') resume(); }
    if (e.key === 'Enter') { var b = root.querySelector('.pr-ui.on [data-default]'); if (b) { e.preventDefault(); b.click(); } }
  }, true);
  document.addEventListener('keyup', function (e) { var n = keyOf(e); if (n) K[n] = 0; });
  window.addEventListener('blur', function () { K.l = K.r = K.jump = K.dash = 0; if (G.state === 'play') pause(); });

  /* tactile : moitié gauche = pavé glissant, moitié droite = saut (maintenu = plus haut), bouton DASH */
  var touchEl = document.getElementById('pr-touch');
  var padEl = touchEl.querySelector('.pr-pad'), knob = padEl.querySelector('i'), dashEl = touchEl.querySelector('.pr-dash'), jumpEl = touchEl.querySelector('.pr-jump');
  var pads = {};
  function rectOf() { return touchEl.getBoundingClientRect(); }
  touchEl.addEventListener('pointerdown', function (e) {
    if (G.state !== 'play') return;
    e.preventDefault(); e.stopPropagation();
    try { touchEl.setPointerCapture(e.pointerId); } catch (er) {}
    ac();
    var r = rectOf(), lx = e.clientX - r.left;
    if (e.target.closest('.pr-dash')) { pads[e.pointerId] = { kind: 'dash' }; P_.dash = 1; K.dash = 1; dashEl.classList.add('on'); return; }
    if (lx < r.width * 0.5) {
      pads[e.pointerId] = { kind: 'pad', x0: e.clientX, y0: e.clientY };
      padEl.style.left = (lx) + 'px'; padEl.style.top = (e.clientY - r.top) + 'px';
      padEl.classList.add('on'); knob.style.transform = 'translate(0,0)';
      touchDir = 0;
    } else {
      pads[e.pointerId] = { kind: 'jump' }; P_.jump = 1; K.jump = 1; jumpEl.classList.add('on');
    }
  }, { passive: false });
  touchEl.addEventListener('pointermove', function (e) {
    var p = pads[e.pointerId]; if (!p || p.kind !== 'pad') return;
    e.preventDefault();
    var k = phone.getBoundingClientRect().width / (phone.clientWidth || 393);
    var dx = (e.clientX - p.x0) / k, dy = (e.clientY - p.y0) / k;
    /* le centre suit le doigt s'il s'éloigne trop : on peut inverser la course sans relever le pouce */
    if (dx > 44) { p.x0 += (dx - 44) * k; dx = 44; } else if (dx < -44) { p.x0 += (dx + 44) * k; dx = -44; }
    touchDir = dx > 9 ? 1 : dx < -9 ? -1 : 0;
    knob.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + Math.max(-20, Math.min(20, dy)).toFixed(1) + 'px)';
  }, { passive: false });
  function touchUp(e) {
    var p = pads[e.pointerId]; if (!p) return;
    delete pads[e.pointerId];
    if (p.kind === 'pad') { touchDir = 0; padEl.classList.remove('on'); }
    if (p.kind === 'jump') { K.jump = 0; jumpEl.classList.remove('on'); }
    if (p.kind === 'dash') { K.dash = 0; dashEl.classList.remove('on'); }
  }
  touchEl.addEventListener('pointerup', touchUp);
  touchEl.addEventListener('pointercancel', touchUp);
  function releaseAll() { pads = {}; touchDir = 0; K.l = K.r = K.jump = K.dash = 0; padEl.classList.remove('on'); jumpEl.classList.remove('on'); dashEl.classList.remove('on'); }

  /* ---------------------------------------------------------------- état */
  var G = { state: 'menu', lv: 0, raf: 0, acc: 0, last: 0, t: 0, time: 0 };
  var L = null, P = null, cam = { x: 0, y: 0 }, shake = 0;
  var parts = [], floats = [], ents = [], trains = [], movers = [], gates = [], doors = [], items = [], cps = [];
  var stats = null;

  /* tuiles */
  var E_ = 0, SOLID = 1, ONEWAY = 2, CONV_R = 3, CONV_L = 4, CONV_X = 5, WATER = 6, VOLT = 7;
  function tileAt(tx, ty) {
    if (tx < 0 || tx >= L.w) return SOLID;
    if (ty < 0 || ty >= L.h) return E_;
    return L.t[ty * L.w + tx];
  }
  function isSolid(v) { return v === SOLID || v === CONV_R || v === CONV_L || v === CONV_X || v === VOLT; }
  function topSurface(v) { return isSolid(v) || v === ONEWAY; }

  function load(i) {
    var D = LEVELS[i], m = D.map;
    L = { d: D, w: m[0].length, h: m.length, t: new Uint8Array(m[0].length * m.length), idx: i, theme: D.theme };
    ents = []; trains = []; movers = []; gates = []; doors = []; items = []; cps = []; parts = []; floats = [];
    var spawn = { x: 2 * T, y: 0 }, exit = null;
    var gateCols = {}, doorCols = {};
    for (var y = 0; y < L.h; y++) for (var x = 0; x < L.w; x++) {
      var c = m[y][x], v = E_;
      if (c === '#') v = SOLID; else if (c === '=') v = ONEWAY; else if (c === '>') v = CONV_R; else if (c === '<') v = CONV_L;
      else if (c === '!') v = CONV_X; else if (c === '~') v = WATER; else if (c === 'x') v = VOLT;
      L.t[y * L.w + x] = v;
      var px = x * T, py = y * T;
      if (c === 'S') spawn = { x: px + 2, y: py + T - 20 };
      else if (c === 'E') exit = { x: px, y: py };
      else if (c === 'o') items.push({ k: 'ticket', x: px + 8, y: py + 8 });
      else if (c === 'N') items.push({ k: 'navigo', x: px + 8, y: py + 8, id: i + '-' + x + '-' + y });
      else if (c === 'c') items.push({ k: 'croissant', x: px + 8, y: py + 8 });
      else if (c === 'K') cps.push({ x: px + 8, y: py + T, on: false });
      else if (c === 'r') ents.push({ k: 'rat', x: px + 2, y: py + T - 8, w: 12, h: 8, vx: -28, alive: true });
      else if (c === 'p') ents.push({ k: 'pigeon', x: px, y: py + 2, w: 12, h: 9, x0: px, y0: py + 2, ph: x * 0.7, alive: true });
      else if (c === 'g') ents.push({ k: 'ctrl', x: px + 2, y: py + T - 26, w: 12, h: 26, vx: -18, alive: true, say: 0 });
      else if (c === 'H') (gateCols[x] = gateCols[x] || []).push(y);
      else if (c === '|') (doorCols[x] = doorCols[x] || []).push(y);
    }
    Object.keys(gateCols).forEach(function (x) {
      var ys = gateCols[x].sort(function (a, b) { return a - b; });
      gates.push({ x: +x * T + 5, y: ys[0] * T, w: 6, h: ys.length * T, open: 0, deny: 0, light: 0, paid: false });
    });
    Object.keys(doorCols).forEach(function (x, n) {
      var ys = doorCols[x].sort(function (a, b) { return a - b; });
      doors.push({ x: +x * T + 4, y: ys[0] * T, w: 8, h: ys.length * T, ph: n * 0.9, open: 0, solid: true });
    });
    (D.trains || []).forEach(function (s, n) {
      var a = s.x0 * T, b = s.x1 * T, mid = Math.floor((s.x0 + s.x1) / 2), fy = 0;
      while (fy < L.h && !isSolid(tileAt(mid, fy)) && tileAt(mid, fy) !== WATER) fy++;
      var len = s.kind === 'shuttle' ? 9 * T : 12 * T, hgt = 44;
      var tr = { s: s, a: a, b: b, len: len, h: hgt, y: fy * T - hgt, x: -9999, vx: 0, t: -(s.delay || 0), active: false, warn: 0, n: n, doors: 0, carry: 0 };
      if (s.kind === 'shuttle') { tr.active = true; tr.x = a + T; tr.state = 'dwell'; tr.timer = s.dwell; tr.dir = 1; }
      trains.push(tr);
    });
    (D.movers || []).forEach(function (mv) {
      movers.push({ x0: mv.x * T, y0: mv.y * T, w: mv.w * T, dx: mv.dx * T, dy: mv.dy * T, period: mv.period, x: mv.x * T, y: mv.y * T, vx: 0, vy: 0, ph: 0 });
    });
    L.spawn = spawn; L.exit = exit; L.start = { x: spawn.x, y: spawn.y };
    L.ticketsTotal = items.filter(function (it) { return it.k === 'ticket'; }).length;
    prerender();
  }

  function newPlayer() {
    return { x: L.spawn.x, y: L.spawn.y, w: 10, h: 20, vx: 0, vy: 0, face: 1, ground: false, coyote: 0, buffer: 0, jumps: 0,
      dash: 0, dashCd: 0, airDash: true, inv: 0, anim: 0, ride: null, squash: 0, land: 0, hurtT: 0, dead: 0, onConv: 0 };
  }

  /* ---------------------------------------------------------------- démarrage */
  function startLevel(i, keepCp) {
    G.lv = i; load(i);
    /* classement : le serveur note l'heure de départ de la station */
    G.lbToken = window.SelectaLB ? SelectaLB.start('paname', i) : Promise.resolve(null);
    stats = { tickets: 0, navigo: 0, hits: 0, fraud: 0, hearts: 3, time: 0, falls: 0 };
    P = newPlayer();
    cam.x = P.x - viewW() * 0.4; cam.y = P.y - viewH() * 0.6; clampCam(true);
    G.state = 'play'; G.acc = 0; G.last = 0; G.time = 0;
    hideUI(); hud(true); releaseAll();
    root.classList.add('playing');
    musicPlay(); ac(); sfx('ui');
    announce(LEVELS[i]);
    loopStart();
  }
  function announce(D) {
    var a = document.getElementById('pr-announce');
    a.innerHTML = '<i style="background:' + D.color + ';color:' + D.ink + '">' + D.line + '</i><b>' + D.name + '</b>';
    a.classList.remove('on'); void a.offsetWidth; a.classList.add('on');
  }

  /* ---------------------------------------------------------------- boucle */
  function loopStart() { if (!G.raf) { G.last = 0; G.raf = requestAnimationFrame(loop); } }
  function loopStop() { if (G.raf) cancelAnimationFrame(G.raf); G.raf = 0; }
  function loop(now) {
    G.raf = 0;
    if (!onScreen()) { if (G.state === 'play') pause(true); return; }
    var dt = G.last ? Math.min(0.1, (now - G.last) / 1000) : STEP; G.last = now;
    if (G.state === 'play') {
      G.acc += dt;
      var n = 0;
      while (G.acc >= STEP && n < 12) { update(STEP); G.acc -= STEP; n++; }
      if (n === 12) G.acc = 0;
      hud();
    }
    G.t += dt;
    render();
    if (G.state === 'play' || G.state === 'dying' || G.state === 'menu') G.raf = requestAnimationFrame(loop);
  }

  /* ---------------------------------------------------------------- physique */
  function overlapTiles(x, y, w, h, test) {
    var x0 = Math.floor(x / T), x1 = Math.floor((x + w - 0.001) / T), y0 = Math.floor(y / T), y1 = Math.floor((y + h - 0.001) / T);
    for (var ty = y0; ty <= y1; ty++) for (var tx = x0; tx <= x1; tx++) if (test(tileAt(tx, ty), tx, ty)) return true;
    return false;
  }
  function solidRects() {   /* obstacles dynamiques : portillons fermés, portes palières fermées */
    var r = [];
    gates.forEach(function (g) { if (g.open <= 0.05) r.push(g); });
    doors.forEach(function (d) { if (d.solid) r.push(d); });
    return r;
  }
  function hitRect(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  function blocked(x, y, w, h, dyn) {
    if (overlapTiles(x, y, w, h, isSolid)) return true;
    var bx = { x: x, y: y, w: w, h: h };
    for (var i = 0; i < dyn.length; i++) if (hitRect(bx, dyn[i])) return dyn[i];
    return false;
  }

  function update(dt) {
    G.time += dt; stats.time += dt;
    var p = P;
    /* plateformes et trains d'abord : on sait ce qui porte le joueur */
    updateMovers(dt); updateTrains(dt); updateGates(dt); updateDoors(dt);

    var dir = (K.r ? 1 : 0) - (K.l ? 1 : 0); if (touchDir) dir = touchDir;
    var maxV = 112, accel = p.ground ? 1250 : 900, fric = p.ground ? 1500 : 420;
    if (p.dash > 0) {
      p.dash -= dt; p.vx = p.face * 290; p.vy = 0;
      if (Math.random() < 0.6) parts.push({ x: p.x + p.w / 2, y: p.y + 6 + Math.random() * 12, vx: -p.face * 30, vy: 0, l: 0.25, c: skin().a, s: 2, g: 0 });
      if (p.dash <= 0) p.vx = p.face * maxV;
    } else {
      if (dir) { p.vx += dir * accel * dt; if (Math.sign(p.vx) !== dir && p.ground) p.vx += dir * fric * dt * 0.6; p.face = dir; }
      else { var dv = fric * dt; p.vx = Math.abs(p.vx) <= dv ? 0 : p.vx - Math.sign(p.vx) * dv; }
      p.vx = Math.max(-maxV, Math.min(maxV, p.vx));
    }
    /* saut : mémoire d'appui + tolérance de bord + double saut + hauteur variable */
    if (P_.jump) { p.buffer = 0.12; P_.jump = 0; }
    p.buffer = Math.max(0, p.buffer - dt);
    p.coyote = p.ground ? 0.1 : Math.max(0, p.coyote - dt);
    if (p.buffer > 0 && p.dash <= 0) {
      if (p.coyote > 0) { jump(p, -400, false); }
      else if (p.jumps < 2) { jump(p, -345, true); }
    }
    if (!K.jump && p.vy < -140 && p.dash <= 0) p.vy += 1900 * dt;        /* relâcher = saut plus court */
    /* dash */
    p.dashCd = Math.max(0, p.dashCd - dt);
    if (P_.dash) {
      P_.dash = 0;
      if (p.dashCd <= 0 && p.dash <= 0 && (p.ground || p.airDash)) {
        p.dash = 0.17; p.dashCd = 0.5; if (!p.ground) p.airDash = false; sfx('dash'); shake = Math.max(shake, 1.5);
      }
    }
    if (p.dash <= 0) p.vy = Math.min(560, p.vy + (p.vy > 0 ? 1650 : 1450) * dt);

    /* tapis roulant et plateforme porteuse */
    var carryX = 0, carryY = 0;
    if (p.ground && p.onConv) carryX += p.onConv * 62;
    if (p.ride) { carryX += p.ride.vx; carryY += Math.max(0, p.ride.vy || 0); }

    var dyn = solidRects();
    moveX(p, (p.vx + carryX) * dt, dyn);
    var wasGround = p.ground, preVy = p.vy;
    moveY(p, (p.vy + carryY) * dt, dyn);
    if (p.ground && !wasGround) {
      p.squash = Math.min(1, preVy / 420); p.jumps = 0; p.airDash = true;
      if (preVy > 260) { dust(p.x + p.w / 2, p.y + p.h, 5); }
    }
    if (p.ground) { p.jumps = 0; p.airDash = true; }
    p.squash = Math.max(0, p.squash - dt * 5);
    p.inv = Math.max(0, p.inv - dt);
    p.anim += dt * (p.ground ? Math.abs(p.vx) / 14 : 0);
    if (p.ground && Math.abs(p.vx) > 70 && Math.random() < 0.05) dust(p.x + p.w / 2 - p.face * 4, p.y + p.h, 1);

    /* dangers */
    if (p.y > L.h * T + 40) return die('fall');
    if (overlapTiles(p.x + 2, p.y + 4, p.w - 4, p.h - 4, function (v) { return v === WATER; })) return die('water');
    if (overlapTiles(p.x + 1, p.y + p.h - 2, p.w - 2, 3, function (v) { return v === VOLT; })) return die('volt');

    items.forEach(function (it) {
      if (it.got) return;
      if (Math.abs(it.x - (p.x + p.w / 2)) < 11 && Math.abs(it.y - (p.y + p.h / 2)) < 15) collect(it);
    });
    cps.forEach(function (c) {
      if (!c.on && Math.abs(c.x - (p.x + p.w / 2)) < 12 && p.y + p.h > c.y - 34 && p.y < c.y) {
        cps.forEach(function (o) { o.on = false; });
        c.on = true; L.spawn = { x: c.x - 5, y: c.y - 20 }; stats.hearts = 3; sfx('cp');
        burst(c.x, c.y - 26, '#7CF7C4', 10); for (var hh = 0; hh < 3; hh++) parts.push({ x: c.x + (hh - 1) * 6, y: c.y - 34, vx: (hh - 1) * 20, vy: -50, l: .8, c: '#FF8FB8', heart: true, g: -10 });
        floatTxt(c.x, c.y - 36, 'Validé ✓', '#7CF7C4'); hud();
      }
    });
    updateEnts(dt);
    /* sortie */
    if (L.exit && p.x + p.w > L.exit.x && p.x < L.exit.x + T && p.y + p.h > L.exit.y - 16 && p.y < L.exit.y + T) return win();

    /* caméra : avance dans le sens de la course, suit le joueur verticalement */
    var vw = viewW(), vh = viewH();
    var look = p.face * Math.min(46, vw * 0.16);
    cam.lx = (cam.lx || 0) + (look - (cam.lx || 0)) * Math.min(1, dt * 2.2);
    var tx = p.x + p.w / 2 - vw / 2 + cam.lx;
    var ty = p.y + p.h / 2 - vh * (L.d.vertical ? 0.55 : 0.58);
    cam.x += (tx - cam.x) * Math.min(1, dt * 7);
    var vy = p.ground ? 4.5 : (p.vy > 200 ? 9 : 2.6);
    cam.y += (ty - cam.y) * Math.min(1, dt * vy);
    clampCam(false);
    shake = Math.max(0, shake - dt * 10);

    parts.forEach(function (q) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += (q.g === undefined ? 300 : q.g) * dt; q.l -= dt; });
    parts = parts.filter(function (q) { return q.l > 0; });
    floats.forEach(function (f) { f.y -= 22 * dt; f.l -= dt; });
    floats = floats.filter(function (f) { return f.l > 0; });
  }
  function jump(p, v, dbl) {
    p.vy = v; p.ground = false; p.coyote = 0; p.buffer = 0; p.ride = null;
    p.jumps = dbl ? 2 : 1;
    sfx(dbl ? 'djump' : 'jump');
    if (dbl) { for (var i = 0; i < 8; i++) parts.push({ x: p.x + p.w / 2, y: p.y + p.h, vx: Math.cos(i / 8 * 6.28) * 60, vy: Math.abs(Math.sin(i / 8 * 6.28)) * 30, l: 0.3, c: i % 2 ? '#FFB3D1' : '#FFFFFF', s: 2, g: 0, spark: i % 4 === 0 }); }
    else dust(p.x + p.w / 2, p.y + p.h, 3);
  }
  function moveX(p, dx, dyn) {
    if (!dx) return;
    var steps = Math.ceil(Math.abs(dx) / 4), sx = dx / steps;
    for (var i = 0; i < steps; i++) {
      var nx = p.x + sx, b = blocked(nx, p.y, p.w, p.h, dyn);
      if (b) {
        /* marche de 4 px : on monte sans sauter (bordures de quai, joints) */
        if (p.ground && !blocked(nx, p.y - 4, p.w, p.h, dyn)) { p.y -= 4; p.x = nx; continue; }
        if (b !== true) {
          if (gates.indexOf(b) >= 0) touchGate(b, sx > 0 ? 1 : -1);
          p.x = sx > 0 ? b.x - p.w - 0.001 : b.x + b.w + 0.001;
        } else p.x = sx > 0 ? Math.floor((nx + p.w) / T) * T - p.w - 0.001 : Math.floor(nx / T + 1) * T + 0.001;
        if (p.dash <= 0) p.vx = 0;
        return;
      }
      p.x = nx;
    }
  }
  function moveY(p, dy, dyn) {
    var prevBottom = p.y + p.h;
    p.ground = false; p.onConv = 0;
    var ride = null;
    var steps = Math.max(1, Math.ceil(Math.abs(dy) / 4)), sy = dy / steps;
    for (var i = 0; i < steps; i++) {
      var ny = p.y + sy, b = blocked(p.x, ny, p.w, p.h, dyn);
      if (b) {
        if (sy > 0) {
          if (b === true) p.y = Math.floor((ny + p.h) / T) * T - p.h; else p.y = b.y - p.h;
          p.ground = true; p.vy = Math.min(p.vy, 0); p.vy = 0;
        } else {
          /* correction de coin : on glisse au lieu de se cogner la tête sur un bord */
          for (var nud = 1; nud <= 5; nud++) {
            if (!blocked(p.x + nud, ny, p.w, p.h, dyn)) { p.x += nud; p.y = ny; b = false; break; }
            if (!blocked(p.x - nud, ny, p.w, p.h, dyn)) { p.x -= nud; p.y = ny; b = false; break; }
          }
          if (b) { p.y = b === true ? Math.floor(ny / T + 1) * T + 0.001 : b.y + b.h + 0.001; p.vy = Math.max(p.vy, 40); }
          continue;
        }
        break;
      }
      /* plateformes à sens unique : passerelles, engrenages, toits de rames */
      if (sy >= 0) {
        var bottom = ny + p.h, landed = false;
        var tx0 = Math.floor((p.x + 1) / T), tx1 = Math.floor((p.x + p.w - 1) / T), ty = Math.floor(bottom / T);
        for (var tx = tx0; tx <= tx1 && !landed; tx++) {
          if (tileAt(tx, ty) === ONEWAY && prevBottom <= ty * T + 0.5 && bottom >= ty * T) { p.y = ty * T - p.h; landed = true; }
        }
        if (!landed) {
          var plats = movers.concat(trains.filter(function (t) { return t.active; }));
          for (var k = 0; k < plats.length; k++) {
            var q = plats[k], top = q.y, qx = q.x, qw = q.w || q.len;
            if (p.x + p.w > qx + 1 && p.x < qx + qw - 1 && prevBottom <= top + 3 + Math.abs(q.vy || 0) * STEP * 2 && bottom >= top) {
              p.y = top - p.h; landed = true; ride = q; break;
            }
          }
        }
        if (landed) { p.ground = true; p.vy = 0; break; }
      }
      p.y = ny; prevBottom = p.y + p.h;
    }
    p.ride = ride;
    if (p.ground && !ride) {
      var fy = Math.floor((p.y + p.h + 1) / T), cx = Math.floor((p.x + p.w / 2) / T), v = tileAt(cx, fy);
      p.onConv = v === CONV_R ? 1 : v === CONV_L ? -1 : 0;
    }
    if (p.ground) p.coyote = 0.1;
  }

  /* ---------------------------------------------------------------- monde vivant */
  function updateMovers(dt) {
    movers.forEach(function (m) {
      m.ph += dt;
      var k = (1 - Math.cos(m.ph / m.period * Math.PI * 2)) / 2;
      var nx = m.x0 + m.dx * k, ny = m.y0 + m.dy * k;
      m.vx = (nx - m.x) / dt; m.vy = (ny - m.y) / dt; m.x = nx; m.y = ny;
    });
  }
  function updateTrains(dt) {
    trains.forEach(function (tr) {
      var s = tr.s;
      if (s.kind === 'shuttle') {
        var lo = tr.a + T, hi = tr.b - T - tr.len;
        if (tr.state === 'dwell') {
          tr.vx = 0; tr.timer -= dt; tr.doors = Math.min(1, tr.doors + dt * 3);
          if (tr.timer < 0.6) tr.doors = Math.max(0, tr.doors - dt * 4);
          if (tr.timer <= 0.6 && !tr.buzzed) { tr.buzzed = true; if (near(tr.x + tr.len / 2)) sfx('buzz'); }
          if (tr.timer <= 0) { tr.state = 'run'; tr.buzzed = false; tr.doors = 0; }
        } else {
          var target = tr.dir > 0 ? hi : lo, dist = Math.abs(target - tr.x);
          var v = Math.min(s.speed, Math.sqrt(2 * 140 * dist) + 8);
          tr.vx = tr.dir * v;
          tr.x += tr.vx * dt;
          if ((tr.dir > 0 && tr.x >= target) || (tr.dir < 0 && tr.x <= target)) { tr.x = target; tr.vx = 0; tr.dir *= -1; tr.state = 'dwell'; tr.timer = s.dwell; }
        }
        tr.vy = 0;
        return;
      }
      tr.t += dt;
      var cyc = tr.t % s.period, travel = (tr.b - tr.a + tr.len + 64) / s.speed;
      if (tr.t < 0) { tr.active = false; tr.warn = Math.max(0, 1 + tr.t / 1.6); return; }
      tr.warn = 0;
      if (cyc < travel) {
        if (!tr.active) { tr.active = true; if (near(s.dir > 0 ? tr.a : tr.b)) sfx('horn'); }
        tr.vx = s.dir * s.speed;
        tr.x = s.dir > 0 ? tr.a - tr.len - 32 + cyc * s.speed : tr.b + 32 - cyc * s.speed;
      } else {
        tr.active = false; tr.vx = 0; tr.x = -9999;
        var left = s.period - cyc; if (left < 1.6) tr.warn = 1 - left / 1.6;
      }
      tr.vy = 0;
    });
    /* collision : le flanc d'une rame en marche est dangereux, son toit est un refuge */
    trains.forEach(function (tr) {
      if (!tr.active || Math.abs(tr.vx) < 1) return;
      var body = { x: tr.x, y: tr.y + 6, w: tr.len, h: tr.h - 6 };
      if (P.ride === tr) return;
      if (hitRect(P, body)) {
        if (P.y + P.h <= tr.y + 10) { P.y = tr.y - P.h; P.ride = tr; P.ground = true; P.vy = 0; return; }
        hurt(tr.vx > 0 ? 1 : -1, 'train');
        P.vy = -380; P.vx = Math.sign(tr.vx) * 200;
        if (hitRect(P, body)) { P.y = tr.y - P.h - 1; }
      }
    });
  }
  function near(x) { return Math.abs(x - (P.x || 0)) < viewW() * 1.1; }
  function updateGates(dt) {
    gates.forEach(function (g) {
      g.open = Math.max(0, g.open - dt);
      g.deny = Math.max(0, g.deny - dt);
      g.light = Math.max(0, g.light - dt);
      /* fraude : passé par-dessus un portillon fermé */
      var cx = P.x + P.w / 2;
      if (g.side === undefined) g.side = cx < g.x ? -1 : 1;
      var side = cx < g.x + g.w / 2 ? -1 : 1;
      if (side !== g.side) {
        if (g.open <= 0 && !g.paid && P.y + P.h <= g.y + 2) fraud(g);
        g.side = side; g.paid = false;
      }
    });
  }
  function touchGate(g, dir) {
    if (g.open > 0) return;
    if (stats.tickets > 0) {
      stats.tickets--; g.open = 1.1; g.paid = true; g.light = 1.1; sfx('valid');
      floatTxt(g.x + 3, g.y - 6, '−1 🎫', '#7CF7C4'); hud();
    } else if (g.deny <= 0) {
      g.deny = 1.2; sfx('deny'); floatTxt(g.x + 3, g.y - 6, 'Pas de ticket !', '#FF6B6B');
    }
  }
  function fraud(g) {
    stats.fraud++;
    var fine = Math.min(stats.tickets, 5);
    stats.tickets -= fine; sfx('fine'); shake = 3;
    floatTxt(g.x + 3, g.y - 14, fine ? 'Amende ! −' + fine + ' 🎫' : 'Vu, fraudeur !', '#FFB020', 1.8);
    hud();
  }
  function updateDoors(dt) {
    doors.forEach(function (d) {
      var c = (G.time + d.ph) % 4.2;           /* ouvertes 2,2 s, fermées 2 s */
      var target = c < 2.2 ? 1 : 0;
      d.open += (target - d.open) * Math.min(1, dt * 7);
      d.warn = c > 1.6 && c < 2.2;
      var was = d.solid;
      d.solid = d.open < 0.5;
      if (d.solid && !was && hitRect(P, d)) { P.x = (P.x + P.w / 2 < d.x + d.w / 2) ? d.x - P.w - 0.5 : d.x + d.w + 0.5; }
      if (d.warn && !d.buzzed && near(d.x) && Math.abs(d.x - P.x) < 120) { d.buzzed = true; sfx('buzz'); }
      if (!d.warn) d.buzzed = false;
    });
  }
  function updateEnts(dt) {
    ents.forEach(function (e) {
      if (!e.alive) { e.dt = (e.dt || 0) + dt; return; }
      if (e.k === 'rat' || e.k === 'ctrl') {
        var nx = e.x + e.vx * dt;
        var ahead = e.vx > 0 ? nx + e.w : nx;
        var foot = Math.floor((e.y + e.h + 2) / T), col = Math.floor(ahead / T);
        if (overlapTiles(nx, e.y, e.w, e.h - 1, isSolid) || !topSurface(tileAt(col, foot)) || gates.some(function (g) { return hitRect({ x: nx, y: e.y, w: e.w, h: e.h }, g); })) e.vx = -e.vx;
        else e.x = nx;
        e.anim = (e.anim || 0) + dt * Math.abs(e.vx) / 6;
        if (e.say > 0) e.say -= dt;
      } else if (e.k === 'pigeon') {
        e.ph += dt;
        var nx2 = e.x0 + Math.sin(e.ph * 0.9) * 40;
        e.vx = (nx2 - e.x) / dt; e.x = nx2; e.y = e.y0 + Math.sin(e.ph * 3.1) * 6;
      }
      if (hitRect(P, e)) {
        var stomp = P.vy > 40 && P.y + P.h - e.y < 9;
        if (stomp && e.k !== 'ctrl') {
          e.alive = false; P.vy = K.jump ? -390 : -260; P.jumps = 1; P.airDash = true;
          sfx('stomp'); burst(e.x + e.w / 2, e.y + e.h / 2, e.k === 'rat' ? '#B08A70' : '#D9D9E3', 10);
          floatTxt(e.x + 6, e.y - 4, e.k === 'rat' ? 'Pouic !' : 'Rrrou !', '#FFFFFF');
        } else if (stomp && e.k === 'ctrl') {
          P.vy = -360; P.jumps = 1; sfx('stomp'); e.say = 1.4; floatTxt(e.x + 6, e.y - 6, 'Titre de transport ?', '#FFFFFF', 1.4);
        } else if (P.dash > 0 && e.k !== 'ctrl') {
          e.alive = false; sfx('stomp'); burst(e.x + e.w / 2, e.y + e.h / 2, '#FFFFFF', 8);
        } else hurt(P.x + P.w / 2 < e.x + e.w / 2 ? -1 : 1, e.k);
      }
    });
    ents = ents.filter(function (e) { return e.alive || e.dt < 0.4; });
  }

  /* ---------------------------------------------------------------- événements */
  function collect(it) {
    it.got = true;
    if (it.k === 'ticket') {
      stats.tickets++; sfx('ticket'); burst(it.x, it.y, '#FFF4C8', 5);
      parts.push({ x: it.x, y: it.y - 4, vx: (Math.random() - .5) * 30, vy: -60, l: .7, c: '#FF8FB8', heart: true, g: -20 });
    } else if (it.k === 'navigo') {
      stats.navigo++; sfx('navigo'); burst(it.x, it.y, '#7FC4FF', 18); shake = 2;
      var before = navigoCount();
      if (!SAVE.found[it.id]) { SAVE.found[it.id] = 1; save(); }
      var after = navigoCount(), un = SKINS.filter(function (k) { return k.need > before && k.need <= after; })[0];
      floatTxt(it.x, it.y - 10, un ? 'Tenue « ' + un.name + ' » débloquée !' : 'Pass Navigo ! (' + after + ')', '#7FC4FF', 2);
    } else if (it.k === 'croissant') {
      stats.hearts = Math.min(3, stats.hearts + 1); sfx('heal'); burst(it.x, it.y, '#F2B35B', 10); floatTxt(it.x, it.y - 8, '+1 ❤', '#FFB3C7');
    }
    hud();
  }
  function hurt(dir, why) {
    if (P.inv > 0 || G.state !== 'play') return;
    stats.hearts--; stats.hits++;
    P.inv = 1.3; P.vx = dir * 160; P.vy = -260; P.dash = 0; shake = 4; sfx('hurt');
    try { navigator.vibrate && navigator.vibrate(40); } catch (e) {}
    burst(P.x + P.w / 2, P.y + P.h / 2, '#FF6B6B', 10);
    if (why === 'ctrl') floatTxt(P.x, P.y - 8, 'Contrôle !', '#FFB020');
    hud();
    if (stats.hearts <= 0) gameOver();
  }
  function die(why) {
    if (G.state !== 'play') return;
    stats.hearts--; stats.falls++;
    sfx(why === 'water' ? 'splash' : why === 'volt' ? 'zap' : 'hurt');
    if (why === 'water') for (var i = 0; i < 16; i++) parts.push({ x: P.x + P.w / 2, y: P.y + P.h, vx: (Math.random() - .5) * 120, vy: -Math.random() * 200, l: .6, c: '#BFE6FF', s: 2 });
    if (why === 'volt') burst(P.x + P.w / 2, P.y + P.h, '#FFE45C', 16);
    shake = 5; hud();
    if (stats.hearts <= 0) return gameOver();
    G.state = 'dying'; G.dieT = 0.75;
    setTimeout(function () {
      if (G.state !== 'dying') return;
      var sp = L.spawn; P = newPlayer(); P.x = sp.x; P.y = sp.y; P.inv = 1.2;
      G.state = 'play'; G.last = 0; loopStart();
    }, 750);
  }
  function burst(x, y, c, n) { for (var i = 0; i < n; i++) parts.push({ x: x, y: y, vx: (Math.random() - .5) * 170, vy: -Math.random() * 150 - 20, l: .35 + Math.random() * .35, c: c, s: Math.random() < .5 ? 2 : 1 }); }
  function dust(x, y, n) { for (var i = 0; i < n; i++) parts.push({ x: x + (Math.random() - .5) * 8, y: y - 1, vx: (Math.random() - .5) * 40, vy: -Math.random() * 30, l: .3, c: 'rgba(255,255,255,.7)', s: 2, g: 40 }); }
  function floatTxt(x, y, t, c, l) { floats.push({ x: x, y: y, t: t, c: c, l: l || 1.1, l0: l || 1.1 }); }

  /* ---------------------------------------------------------------- écrans */
  var ui = document.getElementById('pr-ui');
  function showUI(html, cls) { ui.className = 'pr-ui on ' + (cls || ''); ui.innerHTML = html; }
  function hideUI() { ui.className = 'pr-ui'; ui.innerHTML = ''; }
  function stars(n) { var s = ''; for (var i = 0; i < 3; i++) s += '<i class="' + (i < n ? 'on' : '') + '">★</i>'; return s; }
  function fmt(t) { var m = Math.floor(t / 60), s = Math.floor(t % 60); return m + ':' + (s < 10 ? '0' : '') + s; }
  var LB_TOT = [32, 27, 15, 19, 22];
  function stationScore(i, st) {
    var D = LEVELS[i], tot = LB_TOT[i] || 1;
    var stars = 1 + (st.tickets / tot >= 0.8 ? 1 : 0) + (st.time <= D.par ? 1 : 0);
    return Math.max(0, st.tickets * 100 + st.navigo * 500 + stars * 1000 + Math.max(0, Math.round((D.par * 1.5 - st.time) * 20)) - (st.fraud || 0) * 200);
  }
  function unlocked(i) { return i === 0 || !!SAVE.done[i - 1]; }

  function menu() {
    G.state = 'menu'; musicStop(); root.classList.remove('playing'); releaseAll();
    var next = 0; for (var i = 0; i < LEVELS.length; i++) if (unlocked(i)) next = i;
    var nc = navigoCount();
    var stops = LEVELS.map(function (D, i) {
      var ok = unlocked(i), st = SAVE.stars[i] || 0;
      return '<button class="pr-stop' + (ok ? '' : ' locked') + (SAVE.done[i] ? ' done' : '') + '" data-lv="' + i + '"' + (ok ? '' : ' disabled') + '>' +
        '<span class="pr-dot"></span><i class="pr-bullet" style="background:' + D.color + ';color:' + D.ink + '">' + D.line + '</i>' +
        '<span class="pr-sname">' + D.name + '</span>' +
        '<span class="pr-sstars">' + (ok ? stars(st) : '🔒') + '</span></button>';
    }).join('');
    showUI(
      '<div class="pr-menu">' +
        '<div class="pr-titlewrap"><div class="pr-plaque"><span>PANAME</span><span>REND FOU</span></div><span class="pr-sticker">Filiz<br><small>✿ edition ✿</small></span></div>' +
        '<p class="pr-tag">Cinq stations, un seul but&nbsp;: la sortie.</p>' +
        '<div class="pr-line">' + stops + '</div>' +
        '<button class="pr-go" data-default data-lv="' + next + '">' + (SAVE.done[0] ? 'Continuer' : 'Jouer') + ' · ' + LEVELS[next].name + '</button>' +
        '<button class="pr-btn ghost pr-lbopen" data-act="lb"><span class="pr-cup"></span>Classement</button>' +
        '<div class="pr-pass"><span class="pr-card"></span><b>' + nc + '</b><span>pass Navigo trouvé' + (nc > 1 ? 's' : '') + ' sur 10</span></div>' +
        '<div class="pr-skins">' + SKINS.map(function (k) {
          var ok = nc >= k.need;
          return '<button class="pr-skin' + (skin().id === k.id ? ' on' : '') + '" data-skin="' + k.id + '"' + (ok ? '' : ' disabled') + '>' +
            '<i style="--a:' + k.t + ';--b:' + k.a + '"></i>' + k.name + (ok ? '' : ' · ' + k.need) + '</button>';
        }).join('') + '</div>' +
        '<div class="pr-row"><button class="pr-mini" data-act="sound">' + (muted ? 'Son coupé' : 'Son activé') + '</button>' +
        '<button class="pr-mini" data-act="help">Commandes</button></div>' +
      '</div>', 'menu');
    G.last = 0; loopStart();
  }
  function help() {
    showUI('<div class="pr-panel"><div class="pr-kick">Commandes</div>' +
      '<div class="pr-help"><b>Sur iPhone</b><p>Pouce gauche&nbsp;: glisse pour courir. Pouce droit&nbsp;: touche pour sauter, maintiens pour sauter plus haut, retouche en l’air pour le double saut. Bouton DASH&nbsp;: élan.</p>' +
      '<b>Au clavier</b><p>← → ou Q D&nbsp;: courir · Espace ou ↑&nbsp;: sauter · Maj ou X&nbsp;: dash · Échap&nbsp;: pause</p>' +
      '<b>Dans le métro</b><p>Les portillons prennent un ticket. Sauter par-dessus, c’est une amende. Les valideurs sauvegardent ta progression. Sur les voies, le flanc des rames fait mal, mais leur toit porte.</p></div>' +
      '<button class="pr-btn" data-default data-act="menu">Retour</button></div>');
  }
  function pause(silent) {
    if (G.state !== 'play') return;
    G.state = 'pause'; musicPause(); releaseAll();
    var D = LEVELS[G.lv];
    showUI('<div class="pr-panel"><div class="pr-kick"><i class="pr-bullet" style="background:' + D.color + ';color:' + D.ink + '">' + D.line + '</i> ' + D.name + '</div>' +
      '<div class="pr-big">Pause <span class="pr-k">♡</span></div>' +
      '<button class="pr-btn" data-default data-act="resume">Reprendre</button>' +
      '<button class="pr-btn ghost" data-act="restart">Recommencer la station</button>' +
      '<button class="pr-btn ghost" data-act="sound">' + (muted ? 'Activer le son' : 'Couper le son') + '</button>' +
      '<button class="pr-btn ghost" data-act="menu">Plan de la ligne</button></div>');
  }
  function resume() { if (G.state !== 'pause') return; hideUI(); G.state = 'play'; G.last = 0; if (musicWanted) musicPlay(); loopStart(); }
  function gameOver() {
    G.state = 'over'; musicPause(); releaseAll();
    showUI('<div class="pr-panel"><div class="pr-kick">Terminus <span class="pr-k">(｡•́︿•̀｡)</span></div><div class="pr-big">Tout le monde descend</div>' +
      '<p class="pr-note">Plus de cœurs. Les croissants en redonnent, les valideurs remettent tout à trois.</p>' +
      '<button class="pr-btn" data-default data-act="retry">Repartir du dernier valideur</button>' +
      '<button class="pr-btn ghost" data-act="restart">Recommencer la station</button>' +
      '<button class="pr-btn ghost" data-act="menu">Plan de la ligne</button></div>');
  }
  function retry() {
    hideUI(); stats.hearts = 3; var sp = L.spawn; P = newPlayer(); P.x = sp.x; P.y = sp.y; P.inv = 1.2;
    G.state = 'play'; G.last = 0; if (musicWanted) musicPlay(); hud(true); loopStart();
  }
  function win() {
    G.state = 'win'; musicStop(); sfx('win'); releaseAll();
    var i = G.lv, D = LEVELS[i];
    G.lastStats = { tickets: stats.tickets, navigo: stats.navigo, time: stats.time, fraud: stats.fraud };
    var pct = stats.tickets / Math.max(1, L.ticketsTotal);
    var st = 1 + (pct >= 0.8 ? 1 : 0) + (stats.time <= D.par ? 1 : 0);
    var first = !SAVE.done[i];
    SAVE.done[i] = 1; SAVE.stars[i] = Math.max(SAVE.stars[i] || 0, st);
    var best = SAVE.best[i], rec = !best || stats.time < best;
    if (rec) SAVE.best[i] = Math.round(stats.time * 10) / 10;
    save();
    var last = i === LEVELS.length - 1;
    showUI('<div class="pr-panel win"><div class="pr-kick"><i class="pr-bullet" style="background:' + D.color + ';color:' + D.ink + '">' + D.line + '</i> ' + D.name + '</div>' +
      '<div class="pr-sortie">SORTIE</div><div class="pr-yay">✿ bravo ✿ (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧</div>' +
      '<div class="pr-stars big">' + stars(st) + '</div>' +
      '<div class="pr-rows">' +
        '<div><span>Tickets</span><b>' + stats.tickets + ' / ' + L.ticketsTotal + '</b><em>' + (pct >= 0.8 ? '★' : '80 % pour l’étoile') + '</em></div>' +
        '<div><span>Temps</span><b>' + fmt(stats.time) + (rec && !first ? ' · record' : '') + '</b><em>' + (stats.time <= D.par ? '★' : 'objectif ' + fmt(D.par)) + '</em></div>' +
        '<div><span>Pass Navigo</span><b>' + stats.navigo + '</b><em>' + (stats.fraud ? stats.fraud + ' fraude' + (stats.fraud > 1 ? 's' : '') : 'zéro fraude') + '</em></div>' +
      '</div>' +
      '<div class="pr-scorebox"><span>Score de la station</span><b>' + LBfmt(G.lastScore = stationScore(i, stats)) + '</b></div>' +
      lbForm() +
      (last ? '<p class="pr-note">Terminus de la ligne&nbsp;! Tu connais Paname mieux qu’un Parisien.</p>' : '') +
      '<button class="pr-btn" data-default data-act="' + (last ? 'menu' : 'next') + '">' + (last ? 'Plan de la ligne' : 'Station suivante · ' + LEVELS[i + 1].name) + '</button>' +
      '<button class="pr-btn ghost" data-act="restart">Rejouer</button>' +
      (last ? '' : '<button class="pr-btn ghost" data-act="menu">Plan de la ligne</button>') + '</div>');
    for (var k = 0; k < 40; k++) parts.push({ x: P.x + (Math.random() - .5) * 80, y: P.y - 40, vx: (Math.random() - .5) * 200, vy: -Math.random() * 220, l: 1.4, c: ['#FFCE00', '#FF8FB1', '#7CF7C4', '#7FC4FF'][k % 4], s: 2, heart: k % 5 === 0, spark: k % 7 === 0 });
    G.last = 0; G.raf = 0; G.state = 'win';
    var fin = performance.now(); (function confetti(now) { if (G.state !== 'win' || now - fin > 1600) return; var dt = 1 / 60; parts.forEach(function (q) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 260 * dt; q.l -= dt; }); render(); requestAnimationFrame(confetti); })(fin);
  }
  /* ---------------------------------------------------------------- classement */
  function LBfmt(n) { return window.SelectaLB ? SelectaLB.fmt(n) : String(n); }
  function lbForm() {
    if (!window.SelectaLB || !SelectaLB.enabled)
      return '<div class="pr-lbmsg">Classement en ligne bientôt disponible ♡</div>';
    return '<form class="pr-lbform" data-lbform><input class="pr-lbname" name="n" maxlength="14" autocomplete="nickname" spellcheck="false" placeholder="Ton pseudo" value="' + SelectaLB.esc(SelectaLB.name()) + '">' +
      '<button type="submit" class="pr-lbsend">Enregistrer</button></form><div class="pr-lbmsg" data-lbmsg></div>';
  }
  var MEDAL = ['#F5C542', '#C9CED6', '#D8925B'];
  function boardRows(top) {
    if (!top.length) return '<div class="pr-lbempty">Personne encore. Sois la première ligne du tableau ♡</div>';
    return top.map(function (r, k) {
      var md = r.rank <= 3 ? ' style="background:' + MEDAL[r.rank - 1] + ';color:#1D1D1B"' : '';
      return '<li class="pr-lbrow' + (r.me ? ' me' : '') + (r.rank <= 3 ? ' podium' : '') + '" style="--d:' + (k * 55) + 'ms">' +
        '<i class="pr-bullet pr-rk"' + md + '>' + r.rank + '</i><span class="pr-lbn">' + SelectaLB.esc(r.name) + (r.me ? ' <em>toi</em>' : '') + '</span>' +
        '<span class="pr-lbst">' + r.levels + '/5</span><b class="pr-lbsc">' + LBfmt(r.score) + '</b></li>';
    }).join('');
  }
  function showBoard(from, celebrate) {
    var back = from === 'win' ? '' : '<button class="pr-btn ghost" data-act="menu">Plan de la ligne</button>';
    showUI('<div class="pr-panel pr-board"><div class="pr-lbhead"><span class="pr-cup big"></span><div><b>CLASSEMENT</b><small>Score total · meilleures stations cumulées</small></div></div>' +
      (celebrate ? '<div class="pr-lbcele">' + celebrate + '</div>' : '') +
      '<ol class="pr-lbtab" data-lbtab><li class="pr-lbload">Chargement du tableau…</li></ol><div class="pr-lbme" data-lbme></div>' +
      (from === 'win' ? '<button class="pr-btn" data-default data-act="' + (G.lv < LEVELS.length - 1 ? 'next' : 'menu') + '">' + (G.lv < LEVELS.length - 1 ? 'Station suivante · ' + LEVELS[G.lv + 1].name : 'Plan de la ligne') + '</button><button class="pr-btn ghost" data-act="restart">Rejouer</button>' : '') +
      back + '</div>', 'board');
    var tab = ui.querySelector('[data-lbtab]'), me = ui.querySelector('[data-lbme]');
    if (!window.SelectaLB || !SelectaLB.enabled) { tab.innerHTML = '<li class="pr-lbempty">Classement en ligne bientôt disponible ♡<br><small>Ton meilleur score reste enregistré sur cet appareil.</small></li>'; return; }
    SelectaLB.top('paname', !!celebrate).then(function (d) {
      tab.innerHTML = boardRows(d.top || []);
      if (d.me) me.innerHTML = 'Toi : <b>' + d.me.rank + (d.me.rank === 1 ? 're' : 'e') + '</b> sur ' + d.players + ' · <b>' + LBfmt(d.me.best) + '</b> pts · ' + d.me.levels + '/5 stations';
      else me.textContent = d.players ? d.players + ' joueur' + (d.players > 1 ? 's' : '') + ' classé' + (d.players > 1 ? 's' : '') : '';
    }, function (e) { tab.innerHTML = '<li class="pr-lbempty">' + SelectaLB.why(e) + '</li>'; });
  }
  ui.addEventListener('submit', function (e) {
    var f = e.target.closest('[data-lbform]'); if (!f) return;
    e.preventDefault();
    var inp = f.querySelector('input'), msg = ui.querySelector('[data-lbmsg]'), btn = f.querySelector('button');
    var name = SelectaLB.clean(inp.value);
    if (name.length < 2) { msg.textContent = 'Choisis un pseudo de 2 à 14 caractères.'; inp.focus(); return; }
    inp.blur(); btn.disabled = true; btn.textContent = 'Envoi…'; msg.textContent = '';
    SelectaLB.name(name);
    var st = { tickets: G.lastStats.tickets, navigo: G.lastStats.navigo, time: Math.round(G.lastStats.time * 100) / 100, fraud: G.lastStats.fraud };
    Promise.resolve(G.lbToken).then(function (tok) { return SelectaLB.submit(tok, name, G.lastScore, st); }).then(function (r) {
      sfx('navigo');
      var cele = r.newTop10 ? '<span class="pr-lbstk">TOP 10 ♡</span>' : r.rank <= 3 ? '<span class="pr-lbstk">PODIUM ★</span>' : r.record && r.previous ? '<span class="pr-lbstk">RECORD ✿</span>' : '';
      if (!cele) cele = '<span class="pr-lbstk soft">' + r.rank + (r.rank === 1 ? 're' : 'e') + ' place</span>';
      G.lbToken = null;
      showBoard('win', cele);
    }, function (err) {
      btn.disabled = false; btn.textContent = 'Enregistrer';
      msg.textContent = SelectaLB.why(err);
      if (err && /bad_token|no_token|implausible|mismatch/.test(err.code)) { f.style.display = 'none'; }
    });
  });

  ui.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.disabled) return;
    if (b.closest('[data-lbform]')) return;   /* le bouton Enregistrer est géré par le formulaire */
    ac(); sfx('ui');
    if (b.dataset.lv !== undefined) return startLevel(+b.dataset.lv);
    if (b.dataset.skin) { SAVE.skin = b.dataset.skin; save(); ui.querySelectorAll('.pr-skin').forEach(function (x) { x.classList.toggle('on', x === b); }); return; }
    var a = b.dataset.act;
    if (a === 'resume') resume();
    else if (a === 'restart') startLevel(G.lv);
    else if (a === 'next') startLevel(G.lv + 1);
    else if (a === 'retry') retry();
    else if (a === 'menu') menu();
    else if (a === 'help') help();
    else if (a === 'lb') showBoard('menu');
    else if (a === 'sound') { setMuted(!muted); b.textContent = G.state === 'menu' ? (muted ? 'Son coupé' : 'Son activé') : (muted ? 'Activer le son' : 'Couper le son'); }
  });
  document.getElementById('pr-pause').addEventListener('click', function () { ac(); if (G.state === 'play') pause(); else if (G.state === 'pause') resume(); });

  /* ---------------------------------------------------------------- HUD */
  var hudEls = { hearts: document.getElementById('pr-hearts'), tix: document.getElementById('pr-tix'), st: document.getElementById('pr-st'),
    time: document.getElementById('pr-time'), bar: document.getElementById('pr-bar'), warn: document.getElementById('pr-warn') };
  var hudLast = {};
  function hud(force) {
    if (!stats || !L) return;
    var D = L.d;
    var h = stats.hearts + '', t = stats.tickets + '', tm = fmt(stats.time);
    if (force || hudLast.h !== h) { var s = ''; for (var i = 0; i < 3; i++) s += '<i class="' + (i < stats.hearts ? 'on' : '') + '"></i>'; hudEls.hearts.innerHTML = s; hudLast.h = h; }
    if (force || hudLast.t !== t) { hudEls.tix.textContent = t; hudLast.t = t; hudEls.tix.parentNode.classList.remove('pop'); void hudEls.tix.offsetWidth; if (!force) hudEls.tix.parentNode.classList.add('pop'); }
    if (force || hudLast.tm !== tm) { hudEls.time.textContent = tm; hudLast.tm = tm; }
    if (force || hudLast.lv !== G.lv) {
      hudEls.st.innerHTML = '<i class="pr-bullet" style="background:' + D.color + ';color:' + D.ink + '">' + D.line + '</i>' + D.name;
      hudLast.lv = G.lv;
    }
    var prog = D.vertical ? 1 - (P.y - L.exit.y) / Math.max(1, L.start.y - L.exit.y) : (P.x - L.start.x) / Math.max(1, L.exit.x - L.start.x);
    hudEls.bar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, prog)).toFixed(3) + ')';
    var w = trains.some(function (tr) { return tr.warn > 0 && Math.abs((tr.s.dir > 0 ? tr.a : tr.b) - P.x) < 420; });
    if (w !== hudLast.w) { hudEls.warn.classList.toggle('on', w); hudLast.w = w; }
  }

  /* ---------------------------------------------------------------- rendu */
  var Z = 3, CW = 0, CH = 0, DPR = 1;
  function size() {
    var r = cv.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    var scale = r.width / (cv.clientWidth || r.width);
    DPR = Math.min(3, (window.devicePixelRatio || 1));
    var w = Math.round(cv.clientWidth * DPR), h = Math.round(cv.clientHeight * DPR);
    if (w !== CW || h !== CH) { cv.width = CW = w; cv.height = CH = h; }
    /* échelle entière : chaque pixel du jeu = un carré exact de pixels de l'écran */
    var wide = cv.clientWidth > 600;
    /* Cadrage : on agrandit la scène pour que la partie jouable du niveau (de la 4e rangée au sol)
       remplisse la bande libre entre le bandeau du haut et les commandes, sans jamais montrer
       moins de ~11 cases de large (il faut voir arriver les obstacles). Échelle entière : pixels nets. */
    BAND = null;
    var band = frameBand(), cssPx = CW / (cv.clientWidth || 1);
    var base = Math.max(2, Math.round(CW / (wide ? 400 : 200)));
    var fit = Math.round((band[1] - band[0]) * cssPx / (CONTENT_ROWS * T));
    var cap = Math.max(base, Math.floor(CW / (wide ? 200 : 176)));
    Z = Math.max(base, Math.min(fit, cap));
    if (CH / Z < 200) Z = Math.max(2, Math.floor(CH / 200));
    ctx.imageSmoothingEnabled = false;
    return true;
  }
  /* bande verticale (en px CSS du canvas) où l'on veut voir le jeu : sous le bandeau, au-dessus des pouces */
  var CONTENT_ROWS = 11;          /* de la 6e rangée (hauteur max des sauts) au haut du sol : là où tout se joue */
  var BAND = null;
  function frameBand() { return BAND || (BAND = measureBand()); }
  function measureBand() {
    var h = cv.clientHeight || 1, top = 112;
    var hud = document.querySelector('#pr .pr-hud');
    if (hud && hud.offsetParent) { var r = hud.getBoundingClientRect(), c = cv.getBoundingClientRect(), k = (cv.clientHeight || 1) / (c.height || 1); top = Math.max(top * 0.6, (r.bottom - c.top) * k + 10); }
    var bot = COARSE ? h * 0.72 : h - 14;
    if (bot - top < 160) bot = Math.min(h, top + 160);
    return [top, bot];
  }
  function viewW() { return CW / Z; }
  function viewH() { return CH / Z; }
  /* sur écran tactile, le bas de la carte s'arrête au-dessus des pouces (zone des commandes) */
  var COARSE = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  function clampCam(snap) {
    var vw = viewW(), vh = viewH(), mw = L.w * T, mh = L.h * T;
    var k = (cv.clientHeight || 1) / vh;                 /* px CSS par pixel du jeu */
    var band = frameBand(), top = band[0] / k, bot = band[1] / k;   /* en pixels du jeu */
    var y0 = L.d.vertical ? 0 : 5 * T, span = L.d.vertical ? mh : CONTENT_ROWS * T;
    cam.x = mw <= vw ? (mw - vw) / 2 : Math.max(0, Math.min(mw - vw, cam.x));
    if (span <= bot - top) {
      /* le niveau tient dans la bande : on le centre, il ne bouge plus verticalement */
      cam.y = y0 - (top + (bot - top - span) / 2);
    } else {
      /* plus haut que la bande (Abbesses, petits écrans) : la caméra suit, sans montrer le vide sous la carte */
      var maxY = mh - bot, minY = y0 - top;
      cam.y = Math.max(minY, Math.min(maxY, cam.y));
    }
  }

  /* palettes et décors de chaque station */
  var TH = {
    carreaux: { bg: '#E9E6DE', tile: '#F7F5EF', joint: '#D2CEC4', floor: '#8C8A86', floor2: '#6E6C68', edge: '#F2F0EA', dark: '#2A2A2E', accent: '#FFCE00', light: '#FFF6D8', pit: '#2B2A2C' },
    nordsud: { bg: '#E8E3D6', tile: '#F6F2E7', joint: '#CFC7B5', floor: '#8E8478', floor2: '#6E655A', edge: '#F2EEE3', dark: '#2A2622', accent: '#00814F', frieze: '#7A4A2B', light: '#FFF2D0', pit: '#2A2622' },
    cuivre: { bg: '#5A3418', tile: '#B8733A', joint: '#7A4520', floor: '#6B4A33', floor2: '#4E3524', edge: '#D99A5B', dark: '#24150B', accent: '#E8A65A', light: '#FFD9A0', pit: '#1E120A' },
    viaduc: { bg: '#F6C7A6', tile: '#5E6B6A', joint: '#46514F', floor: '#5E6B6A', floor2: '#46514F', edge: '#8FA09D', dark: '#2A3332', accent: '#6ECA97', light: '#FFE7C8', pit: '#1E2A2C' },
    l14: { bg: '#E7E8EC', tile: '#D9DBE1', joint: '#C3C6CF', floor: '#A9ADB8', floor2: '#8B8F9A', edge: '#F1F2F5', dark: '#24242C', accent: '#662483', light: '#F3EEFF', pit: '#24242C' }
  };

  var tileCv = null;
  function prerender() {
    var th = TH[L.theme], W = L.w * T, Hh = L.h * T;
    tileCv = document.createElement('canvas'); tileCv.width = W; tileCv.height = Hh;
    var g = tileCv.getContext('2d');
    for (var y = 0; y < L.h; y++) for (var x = 0; x < L.w; x++) {
      var v = L.t[y * L.w + x]; if (!v) continue;
      var px = x * T, py = y * T, up = tileAt(x, y - 1), topOpen = !isSolid(up) && up !== WATER;
      if (v === SOLID || v === CONV_X || v === CONV_R || v === CONV_L) {
        if (L.theme === 'viaduc') {
          /* tablier métallique riveté */
          g.fillStyle = (x + y) % 2 ? th.tile : '#58645F'; g.fillRect(px, py, T, T);
          g.fillStyle = th.joint; g.fillRect(px, py + T - 2, T, 2); g.fillRect(px + T - 1, py, 1, T);
          g.fillStyle = '#9BAAA6'; g.fillRect(px + 3, py + 3, 1, 1); g.fillRect(px + 12, py + 3, 1, 1); g.fillRect(px + 3, py + 12, 1, 1); g.fillRect(px + 12, py + 12, 1, 1);
          if (topOpen) { g.fillStyle = th.edge; g.fillRect(px, py, T, 2); g.fillStyle = '#C9D3D0'; for (var k = 1; k < T; k += 3) g.fillRect(px + k, py + 2, 1, 1); }
        } else if (L.theme === 'cuivre') {
          g.fillStyle = (y % 2) ? '#7A4E2E' : '#6B4429'; g.fillRect(px, py, T, T);
          g.fillStyle = '#4E3220'; g.fillRect(px, py + T - 1, T, 1); g.fillRect(px + T - 1, py, 1, T);
          g.fillStyle = '#C98A4E'; g.fillRect(px + 2, py + 2, 1, 1); g.fillRect(px + 13, py + 2, 1, 1);
          if (topOpen) { g.fillStyle = '#D99A5B'; g.fillRect(px, py, T, 3); g.fillStyle = '#F2C08A'; g.fillRect(px, py, T, 1); g.fillStyle = '#8A5A33'; g.fillRect(px, py + 3, T, 1); }
        } else {
          /* sol de quai : dalles grises, bande d'éveil blanche en bord */
          var deep = !topOpen;
          g.fillStyle = deep ? th.floor2 : th.floor; g.fillRect(px, py, T, T);
          g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(px, py + T - 1, T, 1); if (x % 2 === 0) g.fillRect(px, py, 1, T);
          if (deep) { g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(px + 4, py + 5, 2, 2); }
          if (topOpen) {
            g.fillStyle = th.edge; g.fillRect(px, py, T, 3);
            g.fillStyle = 'rgba(0,0,0,.18)'; for (var k2 = 1; k2 < T; k2 += 3) g.fillRect(px + k2, py + 1, 1, 1);
            g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(px, py + 3, T, 1);
          }
        }
        if (v === CONV_X || v === CONV_R || v === CONV_L) {
          g.fillStyle = '#3A3B40'; g.fillRect(px, py, T, 6);
          g.fillStyle = '#C9CCD3'; g.fillRect(px, py, T, 1);
          g.fillStyle = '#1F2024'; g.fillRect(px, py + 5, T, 2);
          g.fillStyle = v === CONV_X ? '#5A5B60' : '#2A2B30'; g.fillRect(px, py + 1, T, 4);
        }
      } else if (v === ONEWAY) {
        if (L.theme === 'cuivre') {
          g.fillStyle = '#C98A4E'; g.fillRect(px, py, T, 5); g.fillStyle = '#F2C08A'; g.fillRect(px, py, T, 1);
          g.fillStyle = '#7A4A26'; g.fillRect(px, py + 5, T, 1); g.fillStyle = '#E8B47A'; g.fillRect(px + 4, py + 2, 1, 1); g.fillRect(px + 11, py + 2, 1, 1);
        } else if (L.theme === 'viaduc') {
          g.fillStyle = '#5E6B6A'; g.fillRect(px, py, T, 5); g.fillStyle = th.edge; g.fillRect(px, py, T, 1);
          g.fillStyle = '#46514F'; for (var b = 0; b < T; b += 4) { g.fillRect(px + b, py + 5, 1, 4); }
          g.fillRect(px, py + 8, T, 1);
        } else if (L.theme === 'l14') {
          g.fillStyle = '#B9895A'; g.fillRect(px, py, T, 5); g.fillStyle = '#D9AE7E'; g.fillRect(px, py, T, 1); g.fillStyle = '#8A6038'; g.fillRect(px, py + 4, T, 1);
        } else {
          /* passerelle : garde-corps vert métro + platelage */
          g.fillStyle = '#5E6A63'; g.fillRect(px, py, T, 4); g.fillStyle = '#9DAAA2'; g.fillRect(px, py, T, 1);
          g.fillStyle = '#3B4540'; g.fillRect(px, py + 4, T, 1);
          g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(px + 7, py + 5, 2, 3);
        }
      } else if (v === VOLT) {
        g.fillStyle = '#3A3530'; g.fillRect(px, py, T, T);
        g.fillStyle = '#6E655A'; g.fillRect(px, py + 3, T, 2); g.fillRect(px, py + 10, T, 2);
        g.fillStyle = '#FFCE00'; g.fillRect(px, py + 6, T, 2);
        g.fillStyle = '#1D1D1B'; for (var s = 0; s < T; s += 4) g.fillRect(px + s, py + 6, 2, 2);
      }
    }
  }

  /* ---------- petites aides de dessin ---------- */
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  var FONT = '"Archivo", "Inter", -apple-system, "Helvetica Neue", Arial, sans-serif';
  var tilePat = {};
  function wallPattern(theme) {
    if (tilePat[theme]) return tilePat[theme];
    var c = document.createElement('canvas'), th = TH[theme];
    if (theme === 'cuivre') {
      c.width = 32; c.height = 32; var g = c.getContext('2d');
      var gr = g.createLinearGradient(0, 0, 0, 32); gr.addColorStop(0, '#C07C40'); gr.addColorStop(.5, '#A8652F'); gr.addColorStop(1, '#94562A');
      g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
      g.fillStyle = '#6E3F1C'; g.fillRect(0, 31, 32, 1); g.fillRect(31, 0, 1, 32);
      g.fillStyle = '#E3A869'; g.fillRect(0, 0, 32, 1);
      g.fillStyle = '#5E3416'; [3, 28].forEach(function (a) { [3, 28].forEach(function (b) { g.fillRect(a, b, 2, 2); }); });
      g.fillStyle = '#F2C08A'; [3, 28].forEach(function (a) { [3, 28].forEach(function (b) { g.fillRect(a, b, 1, 1); }); });
    } else if (theme === 'l14') {
      c.width = 48; c.height = 24; var g2 = c.getContext('2d');
      g2.fillStyle = '#E4E5EA'; g2.fillRect(0, 0, 48, 24); g2.fillStyle = '#D3D5DC'; g2.fillRect(0, 23, 48, 1); g2.fillRect(47, 0, 1, 24);
      g2.fillStyle = 'rgba(255,255,255,.6)'; g2.fillRect(0, 0, 48, 1);
    } else {
      /* le carreau biseauté du métro : 2 × 1, joints décalés, biseau clair en haut à gauche */
      c.width = 16; c.height = 8; var g3 = c.getContext('2d');
      g3.fillStyle = th.joint; g3.fillRect(0, 0, 16, 8);
      [[0, 0, 8], [8, 0, 8], [-4, 4, 8], [4, 4, 8], [12, 4, 8]].forEach(function (b) {
        g3.fillStyle = th.tile; g3.fillRect(b[0] + .5, b[1] + .5, b[2] - 1, 3);
        g3.fillStyle = '#FFFFFF'; g3.fillRect(b[0] + .5, b[1] + .5, b[2] - 1, 1);
        g3.fillStyle = 'rgba(0,0,0,.07)'; g3.fillRect(b[0] + .5, b[1] + 3, b[2] - 1, .5);
      });
    }
    tilePat[theme] = ctx.createPattern(c, 'repeat');
    return tilePat[theme];
  }

  function worldTx(par) {   /* transformation monde → écran, avec parallaxe */
    var ox = Math.round(cam.x * par * Z), oy = Math.round(cam.y * (par === 1 ? 1 : par * 0.6 + 0.4) * Z);
    var sx = shake > 0 ? Math.round((Math.random() - .5) * shake * Z * 0.5) : 0, sy = shake > 0 ? Math.round((Math.random() - .5) * shake * Z * 0.5) : 0;
    ctx.setTransform(Z, 0, 0, Z, -ox + sx, -oy + sy);
  }

  var sized = false;
  function render() {
    if (!sized) { sized = size(); if (!sized) return; }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (!L) { load(0); P = newPlayer(); stats = { tickets: 0, hearts: 3, time: 0 }; cam.x = 0; cam.y = L.h * T - viewH(); }
    if (G.state === 'menu') { cam.x = (G.t * 18) % Math.max(1, L.w * T - viewW()); cam.y = L.h * T - viewH() + 20; }
    var th = TH[L.theme];
    drawBackground(th);
    worldTx(1);
    drawBackDecor(th);
    drawTrains(th, true);
    var x0 = Math.floor(cam.x), y0 = Math.floor(cam.y), vw = Math.ceil(viewW()) + 2, vh = Math.ceil(viewH()) + 2;
    var sx = Math.max(0, x0 - 1), sy = Math.max(0, y0 - 1);
    var sw = Math.min(tileCv.width - sx, vw + 2), sh = Math.min(tileCv.height - sy, vh + 2);
    if (sw > 0 && sh > 0) ctx.drawImage(tileCv, sx, sy, sw, sh, sx, sy, sw, sh);
    drawDynamicTiles(th);
    drawMovers(th); drawGates(); drawDoors(); drawCps(); drawExit(th);
    drawItems(); drawEnts();
    if (G.state !== 'menu' && P && G.state !== 'dying') drawPlayer();
    drawTrains(th, false);
    drawWater(th);
    drawBelow(th);
    parts.forEach(function (q) {
      ctx.globalAlpha = Math.max(0, Math.min(1, q.l * 3));
      if (q.heart) { pixHeart(Math.round(q.x), Math.round(q.y), q.c); return; }
      if (q.spark) { sparkle(Math.round(q.x), Math.round(q.y), 2, q.c, Math.max(0, Math.min(1, q.l * 3))); return; }
      ctx.fillStyle = q.c; ctx.fillRect(Math.round(q.x), Math.round(q.y), q.s, q.s);
    });
    ctx.globalAlpha = 1;
    /* textes à la résolution de l'écran */
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawHints(); drawFloats(); drawSigns(th, true);
    if (G.state === 'menu') { ctx.fillStyle = 'rgba(10,10,20,.55)'; ctx.fillRect(0, 0, CW, CH); }
  }
  function sxy(wx, wy) { return [Math.round((wx - cam.x) * Z), Math.round((wy - cam.y) * Z)]; }

  /* ---------- fonds ---------- */
  function drawBackground(th) {
    var t = L.theme;
    if (t === 'viaduc') {
      var gr = ctx.createLinearGradient(0, 0, 0, CH);
      gr.addColorStop(0, '#5B7DB8'); gr.addColorStop(.55, '#F2A98C'); gr.addColorStop(1, '#FFD9B0');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, CW, CH);
      /* soleil bas */
      ctx.fillStyle = 'rgba(255,240,200,.85)'; ctx.beginPath(); ctx.arc(CW * 0.78, CH * 0.52, CW * 0.07, 0, 7); ctx.fill();
      worldTx(0.08); drawEiffel(); worldTx(0.25); drawSkyline(); worldTx(0.5); drawFarBridge();
      return;
    }
    if (t === 'nordsud') {
      ctx.fillStyle = th.bg; ctx.fillRect(0, 0, CW, CH);
      worldTx(1); ctx.fillStyle = wallPattern('nordsud'); ctx.fillRect(cam.x - 2, cam.y - 2, viewW() + 4, viewH() + 4);
      drawFresco(); return;
    }
    ctx.fillStyle = th.bg; ctx.fillRect(0, 0, CW, CH);
    worldTx(1);
    ctx.fillStyle = wallPattern(t); ctx.fillRect(cam.x - 2, cam.y - 2, viewW() + 4, viewH() + 4);
    /* voûte : ombre douce en haut, bandeau lumineux façon Motte */
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    var vg = ctx.createLinearGradient(0, 0, 0, CH * 0.45);
    vg.addColorStop(0, t === 'cuivre' ? 'rgba(20,8,0,.55)' : 'rgba(30,25,20,.28)'); vg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, CW, CH * 0.45);
    var bot = ctx.createLinearGradient(0, CH * 0.6, 0, CH);
    bot.addColorStop(0, 'rgba(0,0,0,0)'); bot.addColorStop(1, 'rgba(0,0,0,.18)');
    ctx.fillStyle = bot; ctx.fillRect(0, CH * 0.6, CW, CH * 0.4);
  }
  function drawEiffel() {
    /* la tour, en silhouette lointaine (structure de 1889, domaine public) */
    var bx = 260, by = L.h * T - 40, s = 1;
    ctx.fillStyle = 'rgba(70,60,80,.55)';
    ctx.beginPath(); ctx.moveTo(bx - 40, by); ctx.quadraticCurveTo(bx - 14, by - 70, bx - 4, by - 190); ctx.lineTo(bx + 4, by - 190);
    ctx.quadraticCurveTo(bx + 14, by - 70, bx + 40, by); ctx.lineTo(bx + 26, by); ctx.quadraticCurveTo(bx, by - 40, bx - 26, by); ctx.closePath(); ctx.fill();
    ctx.fillRect(bx - 22, by - 64, 44, 4); ctx.fillRect(bx - 11, by - 120, 22, 3); ctx.fillRect(bx - 1, by - 214, 2, 26);
    ctx.fillStyle = 'rgba(255,230,200,.25)'; for (var i = 0; i < 10; i++) ctx.fillRect(bx - 18 + i * 4, by - 60, 1, 4);
  }
  function drawSkyline() {
    var base = L.h * T - 44;
    for (var i = -2; i < 40; i++) {
      var x = i * 46, h = 34 + ((i * 37) % 23);
      ctx.fillStyle = i % 2 ? '#C9A08E' : '#D7AE98'; ctx.fillRect(x, base - h, 40, h + 40);
      ctx.fillStyle = '#7D8A99'; ctx.fillRect(x - 2, base - h - 6, 44, 7);                /* toits en zinc */
      ctx.fillStyle = '#5E6A78'; ctx.fillRect(x + 8, base - h - 11, 5, 6); ctx.fillRect(x + 26, base - h - 11, 5, 6);   /* cheminées */
      ctx.fillStyle = 'rgba(255,240,210,.55)';
      for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) ctx.fillRect(x + 4 + c * 9, base - h + 6 + r * 9, 4, 5);
      ctx.fillStyle = '#3E3A40'; ctx.fillRect(x + 2, base - h + 13, 36, 1);     /* balcons filants */
    }
  }
  function drawFarBridge() {
    var y = L.h * T - 30;
    ctx.fillStyle = 'rgba(70,80,90,.35)';
    for (var i = -2; i < 80; i++) { ctx.beginPath(); ctx.arc(i * 40 + 20, y + 14, 16, Math.PI, 0); ctx.lineTo(i * 40 + 40, y + 30); ctx.lineTo(i * 40, y + 30); ctx.fill(); }
    ctx.fillRect(-100, y - 4, 4000, 3);
  }
  function drawFresco() {
    /* fresque des escaliers d'Abbesses : toits de Montmartre, couleurs vives */
    var cols = ['#E85D75', '#F2B134', '#3FA7D6', '#59CD90', '#A162E8', '#EE6352'];
    for (var y = 0; y < L.h * T; y += 120) {
      var ry = y + 30;
      if (ry < cam.y - 140 || ry > cam.y + viewH() + 20) continue;
      for (var k = 0; k < 6; k++) {
        ctx.fillStyle = cols[(k + y / 120) % cols.length]; ctx.globalAlpha = .5;
        var x = 40 + k * 56 + ((y / 120) % 2) * 20, h = 30 + (k * 13 % 20);
        ctx.fillRect(x, ry + 50 - h, 44, h);
        ctx.beginPath(); ctx.moveTo(x - 4, ry + 50 - h); ctx.lineTo(x + 22, ry + 30 - h); ctx.lineTo(x + 48, ry + 50 - h); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.globalAlpha = .6; ctx.fillRect(x + 8, ry + 56 - h, 6, 8); ctx.fillRect(x + 26, ry + 56 - h, 6, 8);
      }
      ctx.globalAlpha = 1;
      /* frise Nord-Sud : bandeau brun et vert */
      ctx.fillStyle = TH.nordsud.frieze; ctx.fillRect(0, ry + 70, L.w * T, 4);
      ctx.fillStyle = '#00814F'; ctx.fillRect(0, ry + 74, L.w * T, 2);
    }
  }
  /* décor posé contre le mur : plaques, affiches, sièges, hublots */
  var POSTERS = [['SATINE', '#FF5A8A', '#FFE3EC'], ['FILIZ', '#2F6BFF', '#E3EBFF'], ['MITTY', '#14131A', '#F4F0E6'], ['SELECTA', '#FFCE00', '#1D1D1B']];
  /* campagne d'affichage Filiz : visuels officiels, proportions d'origine (aucun recadrage du visage, aucune déformation).
     Chaque cadre prend exactement le format de son image. */
  var CAMPAIGN = [
    { src: 'images/filiz/filiz-point-ephemere.jpg', w: 36, h: 45 },     /* 720 × 899 (4:5) */
    { src: 'images/filiz/filiz-portrait.jpg', w: 60, h: 40 },           /* 960 × 640 (3:2) */
    { src: 'images/filiz/filiz-sourire.jpg', w: 33, h: 44 },            /* 720 × 960 (3:4) */
    { selecta: true, w: 60, h: 40 }
  ];
  CAMPAIGN.forEach(function (c) { if (c.src) { c.im = new Image(); c.im.decoding = 'async'; c.im.src = c.src; } });
  function campaignAt(cx) { return CAMPAIGN[((cx / 28 | 0) + L.idx) % CAMPAIGN.length]; }
  /* une affiche dans son cadre : ombre sur la faïence, cadre alu, lumière de la voûte, reflet de la vitre */
  function drawPoster(c, ax, ay) {
    var w = c.w, h = c.h;
    ctx.fillStyle = 'rgba(40,30,20,.10)'; ctx.fillRect(ax - 1, ay + 1, w + 6, h + 6);
    ctx.fillStyle = 'rgba(40,30,20,.14)'; ctx.fillRect(ax, ay + 2, w + 4, h + 4);
    ctx.fillStyle = '#6E6A64'; ctx.fillRect(ax - 2, ay - 2, w + 4, h + 4);
    ctx.fillStyle = '#B9B4AC'; ctx.fillRect(ax - 2, ay - 2, w + 4, 1);
    ctx.fillStyle = '#4A4743'; ctx.fillRect(ax - 2, ay + h + 1, w + 4, 1);
    if (c.im && c.im.complete && c.im.naturalWidth) {
      ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(c.im, ax, ay, w, h);
      ctx.restore();
    } else { ctx.fillStyle = '#F7C6DA'; ctx.fillRect(ax, ay, w, h); }
    var lg = ctx.createLinearGradient(0, ay, 0, ay + h);
    lg.addColorStop(0, 'rgba(255,248,230,.10)'); lg.addColorStop(.45, 'rgba(255,248,230,0)'); lg.addColorStop(1, 'rgba(20,10,0,.12)');
    ctx.fillStyle = lg; ctx.fillRect(ax, ay, w, h);
    ctx.save(); ctx.beginPath(); ctx.rect(ax, ay, w, h); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,.10)';
    ctx.beginPath(); ctx.moveTo(ax + w * .55, ay); ctx.lineTo(ax + w * .78, ay); ctx.lineTo(ax + w * .38, ay + h); ctx.lineTo(ax + w * .15, ay + h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(ax, ay, w, 1);
    ctx.restore();
  }
  /* petites touches kawaii / Y2K : scintillement en croix, cœur en pixels */
  function sparkle(x, y, s, c, a) {
    ctx.globalAlpha = a === undefined ? 1 : a; ctx.fillStyle = c || '#FFFFFF';
    ctx.fillRect(x - s, y, s * 2 + 1, 1); ctx.fillRect(x, y - s, 1, s * 2 + 1);
    if (s > 2) { ctx.fillRect(x - 1, y - 1, 3, 3); }
    ctx.globalAlpha = 1;
  }
  function pixHeart(x, y, c) {
    ctx.fillStyle = c; ctx.fillRect(x - 2, y - 1, 2, 2); ctx.fillRect(x + 1, y - 1, 2, 2); ctx.fillRect(x - 2, y, 5, 2); ctx.fillRect(x - 1, y + 2, 3, 1); ctx.fillRect(x, y + 3, 1, 1);
  }
  function inTrack(x) { for (var i = 0; i < trains.length; i++) if (x * T >= trains[i].a - T && x * T <= trains[i].b) return true; return false; }
  function groundY(x) {   /* hauteur du sol à une colonne donnée (première tuile pleine sous l'espace libre le plus bas) */
    if (inTrack(x) || inTrack(x + 5)) return L.h * T;
    for (var y = L.h - 1; y > 0; y--) if (!topSurface(tileAt(x, y)) && topSurface(tileAt(x, y + 1)) && tileAt(x, y + 1) !== ONEWAY) return (y + 1) * T;
    return L.h * T;
  }
  function drawDust() {
    if (L.theme === 'viaduc') return;
    for (var i = 0; i < 9; i++) {
      var px = ((i * 137.5 + G.t * (4 + i % 3)) % (viewW() + 40)) - 20 + cam.x * 0.92;
      var py = cam.y + ((i * 71.3 + Math.sin(G.t * 0.5 + i) * 14) % Math.max(60, viewH() * 0.62)) + 30;
      var a = 0.18 + 0.16 * Math.sin(G.t * 1.7 + i * 1.3);
      if (i % 3 === 0) sparkle(Math.round(px), Math.round(py), 1, '#FFC2DA', a + .15);
      else { ctx.globalAlpha = a; ctx.fillStyle = i % 2 ? '#FFD6E8' : '#FFFFFF'; ctx.fillRect(Math.round(px), Math.round(py), 1, 1); ctx.globalAlpha = 1; }
    }
  }
  function drawBackDecor(th) {
    drawDust();
    var t = L.theme;
    var c0 = Math.floor(cam.x / T) - 6, c1 = Math.ceil((cam.x + viewW()) / T) + 6;
    if (t === 'viaduc') {
      /* poutres en treillis sous les passerelles */
      for (var x = Math.max(0, c0); x < Math.min(L.w, c1); x++) {
        for (var y = 1; y < L.h - 2; y++) {
          var v = tileAt(x, y);
          if ((v === ONEWAY || v === VOLT) && tileAt(x, y + 1) !== SOLID) {
            ctx.strokeStyle = 'rgba(60,72,70,.9)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x * T, y * T + 6); ctx.lineTo(x * T + T, y * T + 22); ctx.moveTo(x * T + T, y * T + 6); ctx.lineTo(x * T, y * T + 22); ctx.stroke();
            ctx.fillStyle = '#46514F'; ctx.fillRect(x * T, y * T + 22, T, 2);
          }
        }
      }
      return;
    }
    if (t === 'nordsud') return;
    /* plaques de station, affiches 4×3 et sièges coque, posés au-dessus du quai */
    for (var cx = Math.max(0, c0 - (c0 % 14)); cx < Math.min(L.w, c1); cx += 14) {
      var gy = groundY(cx + 4); if (gy >= L.h * T) continue;
      var wallTop = gy - 6 * T;
      if (t === 'cuivre') {
        /* hublots du Nautilus */
        var hx = cx * T + 30, hy = gy - 54;
        ctx.fillStyle = '#5E3416'; ctx.beginPath(); ctx.arc(hx, hy, 15, 0, 7); ctx.fill();
        ctx.fillStyle = '#E3A869'; ctx.beginPath(); ctx.arc(hx, hy, 13, 0, 7); ctx.fill();
        ctx.fillStyle = '#1E2E3A'; ctx.beginPath(); ctx.arc(hx, hy, 10, 0, 7); ctx.fill();
        ctx.save(); ctx.translate(hx, hy); ctx.rotate(G.t * 0.6 + cx); ctx.fillStyle = '#C98A4E';
        for (var k = 0; k < 8; k++) { ctx.rotate(Math.PI / 4); ctx.fillRect(-1.5, -9, 3, 4); }
        ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, 7); ctx.fill(); ctx.fillStyle = '#1E2E3A'; ctx.beginPath(); ctx.arc(0, 0, 2, 0, 7); ctx.fill();
        ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(hx - 6, hy - 7, 3, 3);
        ctx.fillStyle = '#F2C08A'; for (var r = 0; r < 8; r++) { var a = r / 8 * 6.283; ctx.fillRect(Math.round(hx + Math.cos(a) * 14) - .5, Math.round(hy + Math.sin(a) * 14) - .5, 1, 1); }
        continue;
      }
      if (t === 'l14') {
        /* ligne 14 : corniche lumineuse, bandeau violet, bancs en bois (Bernard Kohn, 1998) */
        ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(cx * T, wallTop - 10, 14 * T, 4);
        ctx.fillStyle = 'rgba(102,36,131,.55)'; ctx.fillRect(cx * T, wallTop - 6, 14 * T, 2);
        ctx.fillStyle = 'rgba(102,36,131,.10)'; ctx.fillRect(cx * T, wallTop + 10, 7 * T, 3);
        ctx.fillStyle = '#B9895A'; ctx.fillRect(cx * T + 70, gy - 12, 46, 4); ctx.fillStyle = '#D9AE7E'; ctx.fillRect(cx * T + 70, gy - 12, 46, 1);
        ctx.fillStyle = '#8B8F9A'; ctx.fillRect(cx * T + 74, gy - 8, 2, 8); ctx.fillRect(cx * T + 110, gy - 8, 2, 8);
        ctx.fillStyle = '#2A2A33'; rr(ctx, cx * T + 8, gy - 62, 44, 18, 2); ctx.fill();
        ctx.fillStyle = '#FFCE00'; ctx.fillRect(cx * T + 12, gy - 57, 3, 3);
        /* écran publicitaire numérique (couloirs de la ligne 14) : fondu entre les visuels portrait */
        var sx0 = cx * T + 150, sy0 = gy - 70, sw = 36, sh = 48;
        ctx.fillStyle = 'rgba(0,0,0,.14)'; rr(ctx, sx0 - 2, sy0, sw + 6, sh + 6, 3); ctx.fill();
        ctx.fillStyle = '#1C1C22'; rr(ctx, sx0 - 3, sy0 - 3, sw + 6, sh + 6, 3); ctx.fill();
        ctx.fillStyle = '#0E0E12'; ctx.fillRect(sx0, sy0, sw, sh);
        var ph = (G.t / 6 + cx) % 2, A = CAMPAIGN[0], B = CAMPAIGN[2], f = Math.max(0, Math.min(1, (ph % 1 - 0.85) / 0.15));
        var cur = ph < 1 ? A : B, nxt = ph < 1 ? B : A;
        [[cur, 1 - f], [nxt, f]].forEach(function (pr) {
          var cc = pr[0]; if (pr[1] <= 0 || !(cc.im && cc.im.complete && cc.im.naturalWidth)) return;
          var k = Math.min(sw / cc.w, sh / cc.h), dw = cc.w * k, dh = cc.h * k;
          ctx.save(); ctx.globalAlpha = pr[1]; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(cc.im, sx0 + (sw - dw) / 2, sy0 + (sh - dh) / 2, dw, dh); ctx.restore();
        });
        ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(sx0, sy0, sw, 2);
        ctx.fillStyle = 'rgba(160,120,255,.35)'; ctx.fillRect(sx0 - 3, sy0 + sh + 3, sw + 6, 1);
        continue;
      }
      var k2 = (cx / 14) % 2;
      if (k2 === 0) {
        var camp = campaignAt(cx), aw = 60;
        var ax = cx * T + 10, ay = gy - 64;
        if (camp.selecta) {
          var pst = POSTERS[3];
          ctx.fillStyle = '#8A6A4A'; ctx.fillRect(ax - 3, ay - 3, aw + 6, 46);
          ctx.fillStyle = pst[2]; ctx.fillRect(ax, ay, aw, 40);
          ctx.fillStyle = pst[1]; ctx.fillRect(ax, ay, aw, 26);
          ctx.fillStyle = pst[2]; ctx.globalAlpha = .35; ctx.beginPath(); ctx.arc(ax + 42, ay + 14, 10, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
        } else drawPoster(camp, ax + (aw - camp.w) / 2, gy - 23 - camp.h);
        /* sièges coque à la couleur de la ligne */
        ctx.fillStyle = '#5B5A60'; ctx.fillRect(ax - 2, gy - 12, aw + 4, 2);
        for (var s = 0; s < 5; s++) { ctx.fillStyle = L.d.color; rr(ctx, ax + 2 + s * 12, gy - 18, 9, 7, 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(ax + 4 + s * 12, gy - 17, 4, 1); ctx.fillStyle = '#3A3A3E'; ctx.fillRect(ax + 6 + s * 12, gy - 11, 1, 11); }
      }
      /* bandeau lumineux */
      ctx.fillStyle = L.d.color; ctx.globalAlpha = .55; ctx.fillRect(cx * T, wallTop - 4, 14 * T, 3); ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(255,255,240,.55)'; ctx.fillRect(cx * T, wallTop - 1, 14 * T, 1);
    }
  }
  /* textes du décor, dessinés en vraie typo à la résolution de l'écran */
  function drawSigns(th) {
    var t = L.theme;
    if (t === 'viaduc' || t === 'nordsud') { if (t === 'nordsud') drawGuimardText(); return; }
    var c0 = Math.floor(cam.x / T) - 6, c1 = Math.ceil((cam.x + viewW()) / T) + 6;
    for (var cx = Math.max(0, c0 - (c0 % 14)); cx < Math.min(L.w, c1); cx += 14) {
      var gy = groundY(cx + 4); if (gy >= L.h * T) continue;
      var k2 = (cx / 14) % 2;
      if (t === 'cuivre') {
        if (k2 === 1) plaque(cx * T + 70, gy - 70, L.d.name.toUpperCase(), '#7A4520', '#F2C08A', '#E3A869');
        continue;
      }
      if (t === 'l14') {
        var p0 = sxy(cx * T + 10, gy - 59);
        ctx.font = '600 ' + Math.round(4.6 * Z) + 'px ' + FONT; ctx.fillStyle = '#FFFFFF'; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
        ctx.fillText('Prochain train', p0[0] + Math.round(8 * Z), p0[1]);
        ctx.fillStyle = '#FFCE00'; ctx.font = '700 ' + Math.round(6 * Z) + 'px ' + FONT;
        ctx.fillText(((cx * 7) % 3 + 1) + ' min', p0[0] + Math.round(8 * Z), p0[1] + Math.round(6 * Z));
        if (k2 === 1) plaque(cx * T + 64, gy - 72, L.d.name, '#FFFFFF', '#24242C', '#662483', true);
        continue;
      }
      if (k2 === 0) {
        if (!campaignAt(cx).selecta) continue;
        var pst = POSTERS[3];
        var pp = sxy(cx * T + 14, gy - 60);
        ctx.font = '900 ' + Math.round(9 * Z) + 'px ' + FONT; ctx.fillStyle = pst[2]; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(pst[0], pp[0], pp[1]);
        ctx.font = '600 ' + Math.round(4 * Z) + 'px ' + FONT; ctx.fillStyle = pst[1];
        ctx.fillText(pst[0] === 'SELECTA' ? 'management · publishing' : 'Selecta Agency', pp[0], pp[1] + Math.round(25 * Z));
      } else {
        plaque(cx * T + 40, gy - 72, L.d.name.toUpperCase(), '#1F3B7A', '#FFFFFF', '#FFFFFF');
      }
    }
  }
  /* plaque émaillée : fond bleu nuit, lettres blanches, liseré blanc (le vrai nom de la station) */
  function plaque(wx, wy, txt, bg, fg, border, rounded) {
    var p = sxy(wx, wy), fs = Math.round(8 * Z);
    ctx.font = '700 ' + fs + 'px ' + FONT;
    var w = Math.round(ctx.measureText(txt).width + 12 * Z), h = Math.round(14 * Z);
    if (p[0] + w < 0 || p[0] > CW || p[1] > CH || p[1] + h < 0) return;
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(p[0] + Z, p[1] + Z, w, h);
    ctx.fillStyle = bg; if (rounded) { rr(ctx, p[0], p[1], w, h, 2 * Z); ctx.fill(); } else ctx.fillRect(p[0], p[1], w, h);
    ctx.strokeStyle = border; ctx.lineWidth = Math.max(1, Math.round(Z * 0.8)); ctx.strokeRect(p[0] + 2 * Z, p[1] + 2 * Z, w - 4 * Z, h - 4 * Z);
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, p[0] + w / 2, p[1] + h / 2 + Z * 0.5);
  }
  function drawGuimardText() {
    if (!L.exit) return;
    var p = sxy(L.exit.x - 10, L.exit.y - 44);
    ctx.font = '700 ' + Math.round(5 * Z) + 'px Georgia, "Times New Roman", serif';
    ctx.fillStyle = '#F4E3B0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('METROPOLITAIN', p[0] + 18 * Z, p[1]);
  }

  /* ---------- éléments du monde ---------- */
  function drawDynamicTiles() {
    var c0 = Math.max(0, Math.floor(cam.x / T) - 1), c1 = Math.min(L.w, Math.ceil((cam.x + viewW()) / T) + 1);
    var r0 = Math.max(0, Math.floor(cam.y / T) - 1), r1 = Math.min(L.h, Math.ceil((cam.y + viewH()) / T) + 1);
    var off = (G.t * 62) % 6;
    for (var y = r0; y < r1; y++) for (var x = c0; x < c1; x++) {
      var v = L.t[y * L.w + x];
      if (v === CONV_R || v === CONV_L) {
        ctx.fillStyle = '#4C4D54';
        for (var k = -6; k < T + 6; k += 6) {
          var sx = x * T + k + (v === CONV_R ? off : -off);
          if (sx < x * T || sx > x * T + T - 2) continue;
          ctx.fillRect(sx, y * T + 2, 2, 2);
        }
        if (tileAt(x - 1, y) !== v) arrowSign(x * T, y * T, v === CONV_R ? 1 : -1);
      } else if (v === CONV_X && tileAt(x - 1, y) !== CONV_X) {
        ctx.fillStyle = '#E8E8EC'; ctx.fillRect(x * T + 2, y * T - 14, 22, 12);
        ctx.fillStyle = '#E3312D'; ctx.fillRect(x * T + 2, y * T - 14, 22, 3);
        ctx.fillStyle = '#3A3A40'; ctx.fillRect(x * T + 12, y * T - 2, 2, 2);
        ctx.fillStyle = '#1D1D1B'; ctx.fillRect(x * T + 5, y * T - 9, 16, 1); ctx.fillRect(x * T + 5, y * T - 6, 11, 1);
      }
    }
  }
  function arrowSign(x, y) { ctx.fillStyle = '#1F3B7A'; ctx.fillRect(x + 2, y - 10, 10, 8); ctx.fillStyle = '#FFF'; ctx.fillRect(x + 4, y - 7, 5, 2); ctx.fillRect(x + 8, y - 8, 1, 4); }
  function drawBelow(th) {
    var mh = L.h * T, bottom = cam.y + viewH();
    if (bottom <= mh) return;
    if (L.theme === 'viaduc') {
      ctx.fillStyle = '#3B6A90'; ctx.fillRect(cam.x - 2, mh, viewW() + 4, bottom - mh + 2);
      ctx.fillStyle = 'rgba(255,230,200,.18)';
      for (var i = 0; i < 18; i++) { var wx = Math.floor(cam.x / 40) * 40 + i * 40 + (Math.sin(G.t + i) * 6); ctx.fillRect(wx, mh + 10 + (i % 4) * 14, 10, 1); }
      return;
    }
    var g = ctx.createLinearGradient(0, mh, 0, bottom);
    g.addColorStop(0, th.floor2); g.addColorStop(0.15, th.pit); g.addColorStop(1, '#0E0D10');
    ctx.fillStyle = g; ctx.fillRect(cam.x - 2, mh, viewW() + 4, bottom - mh + 2);
  }
  function drawWater() {
    var r0 = Math.max(0, Math.floor(cam.y / T)), r1 = Math.min(L.h, Math.ceil((cam.y + viewH()) / T) + 1);
    var c0 = Math.max(0, Math.floor(cam.x / T) - 1), c1 = Math.min(L.w, Math.ceil((cam.x + viewW()) / T) + 1);
    for (var y = r0; y < r1; y++) for (var x = c0; x < c1; x++) {
      if (L.t[y * L.w + x] !== WATER) continue;
      var top = tileAt(x, y - 1) !== WATER;
      ctx.fillStyle = top ? '#4C7FA8' : '#3B6A90'; ctx.fillRect(x * T, y * T, T, T);
      if (top) {
        ctx.fillStyle = 'rgba(255,230,200,.55)';
        var w = Math.sin(G.t * 2 + x) * 3;
        ctx.fillRect(x * T + 4 + w, y * T + 3, 5, 1); ctx.fillRect(x * T + 10 - w, y * T + 7, 3, 1);
        ctx.fillStyle = '#7FB0D6'; ctx.fillRect(x * T, y * T, T, 1);
      }
    }
  }
  function drawMovers() {
    movers.forEach(function (m) {
      /* engrenage de laiton : on tient debout sur sa jante supérieure */
      var x = Math.round(m.x), y = Math.round(m.y);
      ctx.fillStyle = '#7A4A26'; ctx.fillRect(x, y + 4, m.w, 4);
      ctx.fillStyle = '#E3A869'; ctx.fillRect(x, y, m.w, 4); ctx.fillStyle = '#F7D19F'; ctx.fillRect(x, y, m.w, 1);
      for (var k = 2; k < m.w; k += 6) { ctx.fillStyle = '#B8733A'; ctx.fillRect(x + k, y + 8, 3, 2); }
      ctx.save(); ctx.translate(x + m.w / 2, y + 14); ctx.rotate((m.x + m.y) * 0.05);
      ctx.fillStyle = '#B8733A'; for (var i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); ctx.fillRect(-2, -10, 4, 4); }
      ctx.beginPath(); ctx.arc(0, 0, 7, 0, 7); ctx.fill(); ctx.fillStyle = '#5E3416'; ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, 7); ctx.fill();
      ctx.restore();
    });
  }
  function drawGates() {
    gates.forEach(function (g) {
      /* portillon : borne inox, valideur à pastille, battant vitré */
      var bx = g.x - 4, by = g.y + g.h - 22;
      ctx.fillStyle = '#B9BEC6'; ctx.fillRect(bx - 2, by, 6, 22); ctx.fillStyle = '#E6E9EE'; ctx.fillRect(bx - 2, by, 6, 1);
      ctx.fillStyle = g.light > 0 ? '#38D07A' : g.deny > 0 ? '#E3312D' : '#2F6BFF';
      ctx.fillRect(bx - 1, by + 4, 4, 3);
      ctx.fillStyle = '#9FA5AE'; ctx.fillRect(bx - 1, by + 9, 4, 4);
      var o = Math.min(1, g.open * 3), h = g.h * (1 - o);
      ctx.fillStyle = 'rgba(190,225,255,.55)'; ctx.fillRect(g.x, g.y + g.h - h, g.w, h);
      ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillRect(g.x, g.y + g.h - h, 1, h);
      ctx.fillStyle = '#7A808A'; ctx.fillRect(g.x - 1, g.y + g.h - h, g.w + 2, 2);
      if (g.deny > 0 && Math.floor(G.t * 8) % 2) { ctx.fillStyle = '#E3312D'; ctx.fillRect(g.x - 1, g.y - 4, g.w + 2, 2); }
    });
  }
  function drawDoors() {
    doors.forEach(function (d) {
      var o = d.open, gap = Math.round(o * 10);
      ctx.fillStyle = '#3A3A44'; ctx.fillRect(d.x - 6, d.y - 6, d.w + 12, 5);
      ctx.fillStyle = d.warn && Math.floor(G.t * 10) % 2 ? '#FF6B3D' : '#662483'; ctx.fillRect(d.x - 4, d.y - 5, d.w + 8, 2);
      ctx.fillStyle = 'rgba(200,225,240,.55)';
      ctx.fillRect(d.x - gap, d.y, d.w / 2, d.h); ctx.fillRect(d.x + d.w / 2 + gap, d.y, d.w / 2, d.h);
      ctx.fillStyle = '#C9CDD6'; ctx.fillRect(d.x - gap, d.y, 1, d.h); ctx.fillRect(d.x + d.w - 1 + gap, d.y, 1, d.h);
    });
  }
  function drawCps() {
    cps.forEach(function (c) {
      /* valideur Navigo sur pied : disque violet, voyant vert quand on l'a touché */
      var x = Math.round(c.x), y = Math.round(c.y);
      ctx.fillStyle = '#9AA0A8'; ctx.fillRect(x - 2, y - 26, 4, 26);
      ctx.fillStyle = '#5C2D82'; rr(ctx, x - 7, y - 36, 14, 12, 3); ctx.fill();
      ctx.fillStyle = c.on ? '#38D07A' : '#B9A3D8'; ctx.beginPath(); ctx.arc(x, y - 30, 3.5, 0, 7); ctx.fill();
      if (c.on) { ctx.globalAlpha = .25 + .15 * Math.sin(G.t * 6); ctx.beginPath(); ctx.arc(x, y - 30, 8, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    });
  }
  function drawExit(th) {
    if (!L.exit) return;
    var x = L.exit.x, y = L.exit.y + T;
    if (L.theme === 'nordsud') {
      /* édicule Guimard : piliers verts en tiges végétales, verrière en éventail */
      ctx.fillStyle = '#3E6B4C'; ctx.fillRect(x - 18, y - 46, 3, 46); ctx.fillRect(x + 31, y - 46, 3, 46);
      ctx.fillStyle = 'rgba(255,190,90,.75)';
      ctx.beginPath(); ctx.moveTo(x - 26, y - 46); ctx.lineTo(x + 8, y - 60); ctx.lineTo(x + 42, y - 46); ctx.lineTo(x + 34, y - 42); ctx.lineTo(x - 18, y - 42); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#3E6B4C'; ctx.lineWidth = 1.5; ctx.stroke();
      for (var k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(x + 8, y - 58); ctx.lineTo(x - 22 + k * 12, y - 45); ctx.stroke(); }
      ctx.fillStyle = '#3E6B4C'; ctx.fillRect(x - 12, y - 50, 36, 7);
      ctx.fillStyle = '#FFB347'; ctx.beginPath(); ctx.arc(x - 17, y - 48, 2.5, 0, 7); ctx.arc(x + 33, y - 48, 2.5, 0, 7); ctx.fill();
      return;
    }
    /* panneau SORTIE et lumière du jour au bout */
    var gl = ctx.createRadialGradient(x + 8, y - 20, 2, x + 8, y - 20, 44);
    gl.addColorStop(0, 'rgba(255,250,220,.9)'); gl.addColorStop(1, 'rgba(255,250,220,0)');
    ctx.fillStyle = gl; ctx.fillRect(x - 40, y - 64, 96, 64);
    ctx.fillStyle = '#5E6A63'; ctx.fillRect(x - 6, y - 40, 2, 40); ctx.fillRect(x + 20, y - 40, 2, 40);
    ctx.fillStyle = '#1F3B7A'; ctx.fillRect(x - 10, y - 52, 36, 12);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - 8, y - 50, 32, 1);
  }
  function drawItems() {
    items.forEach(function (it) {
      if (it.got) return;
      if (it.x < cam.x - 20 || it.x > cam.x + viewW() + 20 || it.y < cam.y - 20 || it.y > cam.y + viewH() + 20) return;
      var b = Math.round(Math.sin(G.t * 3.2 + it.x * 0.07) * 2), x = Math.round(it.x), y = Math.round(it.y) + b;
      if (it.k === 'ticket') {
        /* ticket t+ : carton crème, piste magnétique brune, liseré violet */
        ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(x - 5, y - 2, 11, 7);
        ctx.fillStyle = '#FBF6E4'; ctx.fillRect(x - 6, y - 4, 11, 7);
        ctx.fillStyle = '#7B5BB5'; ctx.fillRect(x - 6, y - 4, 2, 7);
        ctx.fillStyle = '#6B4A2E'; ctx.fillRect(x - 3, y + 1, 8, 1);
        ctx.fillStyle = '#B9A3D8'; ctx.fillRect(x - 2, y - 2, 4, 1);
        var tw = (G.t * 1.3 + it.x * 0.037) % 3;
        if (tw < 0.35) sparkle(x + 6, y - 6, tw < 0.18 ? 2 : 1, '#FFFFFF', 0.9);
      } else if (it.k === 'navigo') {
        ctx.globalAlpha = .35 + .2 * Math.sin(G.t * 5); ctx.fillStyle = '#9FD3FF'; ctx.beginPath(); ctx.arc(x, y, 13, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
        /* carte Navigo : moitié anthracite, moitié bleu ciel, puce */
        ctx.fillStyle = '#3B3E46'; rr(ctx, x - 10, y - 6, 20, 13, 2); ctx.fill();
        ctx.fillStyle = '#8FC3E8'; ctx.fillRect(x - 1, y - 6, 11, 13);
        ctx.fillStyle = '#E0C068'; ctx.fillRect(x - 8, y - 2, 4, 3);
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 1, y - 4, 6, 1); ctx.fillRect(x + 1, y + 3, 4, 1);
        for (var sp = 0; sp < 3; sp++) { var an = G.t * 1.8 + sp * 2.09; sparkle(Math.round(x + Math.cos(an) * 15), Math.round(y + Math.sin(an) * 11), 1 + (sp === 0 ? 1 : 0), sp === 1 ? '#FFB3D1' : '#FFFFFF', 0.85); }
      } else if (it.k === 'croissant') {
        ctx.fillStyle = '#B86E2A'; ctx.beginPath(); ctx.ellipse(x, y, 8, 4.5, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(x - 8, y, 16, 2);
        ctx.fillStyle = '#E7A04E'; ctx.beginPath(); ctx.ellipse(x, y - 1, 6, 3.4, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#8A4E1C'; ctx.fillRect(x - 3, y - 4, 1, 4); ctx.fillRect(x + 2, y - 4, 1, 4);
        ctx.fillStyle = '#F7C98A'; ctx.fillRect(x - 5, y - 3, 2, 1);
      }
    });
  }
  function drawEnts() {
    ents.forEach(function (e) {
      var x = Math.round(e.x), y = Math.round(e.y);
      if (!e.alive) { ctx.globalAlpha = Math.max(0, 1 - e.dt * 2.5); y -= Math.round(e.dt * 30); }
      var f = e.vx > 0 ? 1 : -1;
      if (e.k === 'rat') {
        var st = Math.floor(e.anim || 0) % 2;
        ctx.fillStyle = '#6A5A50'; ctx.fillRect(x + 1, y + 2, 10, 5); ctx.fillRect(f > 0 ? x + 9 : x, y + 3, 3, 3);
        ctx.fillStyle = '#E8A0A8'; ctx.fillRect(f > 0 ? x + 11 : x - 1, y + 4, 1, 1);
        ctx.fillStyle = '#4A3E37'; ctx.fillRect(f > 0 ? x + 8 : x + 3, y + 1, 2, 2);
        ctx.fillStyle = '#111'; ctx.fillRect(f > 0 ? x + 10 : x + 1, y + 3, 1, 1);
        ctx.fillStyle = '#C98C8C'; ctx.fillRect(f > 0 ? x - 3 : x + 11, y + 4 + st, 4, 1);
        ctx.fillStyle = '#4A3E37'; ctx.fillRect(x + 2 + st, y + 7, 2, 1); ctx.fillRect(x + 7 - st, y + 7, 2, 1);
      } else if (e.k === 'pigeon') {
        var wing = Math.sin(G.t * 18) > 0;
        ctx.fillStyle = '#8D93A3'; ctx.fillRect(x + 2, y + 3, 9, 5);
        ctx.fillStyle = '#5F6577'; ctx.fillRect(f > 0 ? x + 9 : x, y + 1, 4, 4);
        ctx.fillStyle = '#6FB89A'; ctx.fillRect(f > 0 ? x + 9 : x + 1, y + 4, 3, 1);
        ctx.fillStyle = '#F2A33A'; ctx.fillRect(f > 0 ? x + 13 : x - 1, y + 2, 1, 1);
        ctx.fillStyle = '#B3B8C6'; ctx.fillRect(x + 3, wing ? y : y + 5, 6, 2);
        ctx.fillStyle = '#C9705A'; ctx.fillRect(x + 4, y + 8, 1, 1); ctx.fillRect(x + 7, y + 8, 1, 1);
      } else if (e.k === 'ctrl') {
        /* contrôleur : uniforme bleu marine, casquette, gilet */
        var w = Math.floor(e.anim || 0) % 2;
        ctx.fillStyle = '#1D2A4D'; ctx.fillRect(x + 2, y + 17, 3, 9 - w); ctx.fillRect(x + 7, y + 17, 3, 8 + w);
        ctx.fillStyle = '#26365F'; ctx.fillRect(x + 1, y + 8, 10, 10);
        ctx.fillStyle = '#7CF7C4'; ctx.fillRect(x + 1, y + 12, 10, 1);
        ctx.fillStyle = '#F1C6A8'; ctx.fillRect(x + 3, y + 2, 7, 6);
        ctx.fillStyle = '#1D2A4D'; ctx.fillRect(x + 2, y, 9, 3); ctx.fillRect(f > 0 ? x + 8 : x + 1, y + 2, 4, 1);
        ctx.fillStyle = '#FFCE00'; ctx.fillRect(x + 5, y + 1, 2, 1);
        ctx.fillStyle = '#111'; ctx.fillRect(f > 0 ? x + 8 : x + 4, y + 4, 1, 1);
        if (e.say > 0) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 14, y - 6, 10, 7); ctx.fillStyle = '#1D2A4D'; ctx.fillRect(x + 16, y - 4, 6, 1); ctx.fillRect(x + 16, y - 2, 4, 1); }
      }
      ctx.globalAlpha = 1;
    });
  }
  function drawTrains(th, back) {
    trains.forEach(function (tr) {
      /* phare au bout du tunnel avant l'arrivée */
      if (back && tr.warn > 0 && tr.s.kind === 'pass') {
        var hx = tr.s.dir > 0 ? tr.a : tr.b, hy = tr.y + tr.h - 12;
        var gl = ctx.createRadialGradient(hx, hy, 1, hx, hy, 60 * tr.warn);
        gl.addColorStop(0, 'rgba(255,250,210,' + (0.8 * tr.warn) + ')'); gl.addColorStop(1, 'rgba(255,250,210,0)');
        ctx.fillStyle = gl; ctx.fillRect(hx - 70, hy - 70, 140, 140);
      }
      if (back) {
        /* voie : pistes de roulement (lignes sur pneus 1, 6, 11, 14) et rails de sécurité */
        if (tr.s.kind === 'pass') {
          var ry = tr.y + tr.h;
          var tg = ctx.createLinearGradient(0, tr.y - 24, 0, ry);
          tg.addColorStop(0, 'rgba(18,16,20,.0)'); tg.addColorStop(.35, 'rgba(18,16,20,.78)'); tg.addColorStop(1, 'rgba(18,16,20,.92)');
          ctx.fillStyle = tg; ctx.fillRect(tr.a, tr.y - 24, tr.b - tr.a, tr.h + 24);
          ctx.fillStyle = '#4A4A50'; ctx.fillRect(tr.a, ry - 3, tr.b - tr.a, 3);
          ctx.fillStyle = '#8A8A92'; ctx.fillRect(tr.a, ry - 3, tr.b - tr.a, 1);
          ctx.fillStyle = '#6B6258'; for (var s = tr.a; s < tr.b; s += 8) ctx.fillRect(s, ry - 1, 4, 1);
          ctx.fillStyle = '#7C7F88'; ctx.fillRect(tr.a, ry - 10, tr.b - tr.a, 2);
        }
        return;
      }
      if (!tr.active) return;
      var x = Math.round(tr.x), y = Math.round(tr.y), w = tr.len, h = tr.h, col = L.d.color;
      if (x > cam.x + viewW() + 20 || x + w < cam.x - 20) return;
      var cars = Math.round(w / (6 * T)) || 1, cw = w / cars;
      for (var c = 0; c < cars; c++) {
        var cx = x + c * cw;
        /* caisse blanche, bandeau vitré sombre, filet à la couleur de la ligne */
        ctx.fillStyle = '#F4F4F2'; rr(ctx, cx + 1, y, cw - 2, h - 4, 4); ctx.fill();
        ctx.fillStyle = '#D9DBDF'; ctx.fillRect(cx + 1, y + h - 12, cw - 2, 8);
        ctx.fillStyle = '#1E2229'; ctx.fillRect(cx + 4, y + 8, cw - 8, 13);
        ctx.fillStyle = 'rgba(160,200,230,.35)'; for (var k = 0; k < cw - 12; k += 14) ctx.fillRect(cx + 8 + k, y + 10, 8, 4);
        ctx.fillStyle = col; ctx.fillRect(cx + 1, y + 24, cw - 2, 3);
        /* portes */
        var dOpen = tr.doors || 0;
        for (var d = 0; d < 3; d++) {
          var dx = cx + cw * (0.2 + d * 0.3) - 6, gap = Math.round(dOpen * 5);
          ctx.fillStyle = '#C9CCD2'; ctx.fillRect(dx - gap, y + 7, 6, h - 14); ctx.fillRect(dx + 6 + gap, y + 7, 6, h - 14);
          ctx.fillStyle = '#2A2F38'; ctx.fillRect(dx + 1 - gap, y + 9, 4, 10); ctx.fillRect(dx + 7 + gap, y + 9, 4, 10);
          if (gap) { ctx.fillStyle = '#FFF6D8'; ctx.fillRect(dx + 6 - gap, y + 7, gap * 2, h - 14); }
        }
        ctx.fillStyle = '#2E3138'; ctx.fillRect(cx + 6, y + h - 4, 12, 4); ctx.fillRect(cx + cw - 18, y + h - 4, 12, 4);
        ctx.fillStyle = '#C3C6CC'; ctx.fillRect(cx + 1, y, cw - 2, 2);
      }
      /* face avant : masque noir, phares */
      var front = tr.vx >= 0 ? x + w - 10 : x;
      if (tr.s.kind === 'shuttle') front = tr.dir > 0 ? x + w - 10 : x;
      ctx.fillStyle = '#16181D'; rr(ctx, front, y + 2, 10, h - 8, 3); ctx.fill();
      ctx.fillStyle = '#FFF6C8'; ctx.fillRect(front + (tr.vx >= 0 ? 6 : 1), y + h - 14, 3, 3);
      ctx.fillStyle = col; ctx.fillRect(front + 2, y + 6, 6, 5);
      var p = sxy(front + 5, y + 8.5);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.font = '800 ' + Math.round(4 * Z) + 'px ' + FONT; ctx.fillStyle = L.d.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(L.d.line, p[0], p[1]); ctx.restore();
    });
  }

  /* ---------- l'héroïne : pixel art 16 × 24, peint une fois par tenue ---------- */
  var SPR = {
    head: [
      '.....hhhhh......',
      '...hhhhhhhhh....',
      '..hhhhhhhhhhh...',
      '..hhhhHHhhhhhh..',
      '..hhHssssssshh..',
      '..hhssssssssh...',
      '..hssssesssse...',
      '..hssssesssse...',
      '...sbssssssbs...',
      '....sssssmss....',
      '.....ssssss.....'
    ],
    body: [
      '....tttttttt....',
      '...ttttaattttt..',
      '..sttttaatttts..',
      '..sTttttttttTs..',
      '..s.tttttttt.s..',
      '....TTTTTTTT....'
    ],
    legs: {
      idle: ['....pppppppp....', '....ppp..ppp....', '....ppp..ppp....', '....PPP..PPP....', '....www..www....', '...wwkk..wwkk...', '................'],
      r1: ['....pppppppp....', '...ppp....ppp...', '..ppp......PPP..', '..PP........ww..', '.ww.........kk..', '.wkk............', '................'],
      r2: ['....pppppppp....', '.....pppppp.....', '.....ppPPpp.....', '......PPww......', '......wwkk......', '......kk........', '................'],
      r3: ['....pppppppp....', '...PPP....ppp...', '..PPP......ppp..', '..ww........PP..', '..kk.........ww.', '............wkk.', '................'],
      jump: ['....pppppppp....', '....ppp..ppp....', '...ppp....ppp...', '...www....PPP...', '...wkk....www...', '..........wkk...', '................'],
      fall: ['....pppppppp....', '...ppp....ppp...', '..ppp......ppp..', '..PPP......PPP..', '..www......www..', '..wkk......wkk..', '................']
    }
  };
  var sprCache = {};
  function sprite(sk, legs) {
    var key = sk.id + legs;
    if (sprCache[key]) return sprCache[key];
    var c = document.createElement('canvas'); c.width = 16; c.height = 24; var g = c.getContext('2d');
    var pal = { h: '#5A3420', H: '#7A4A2C', s: '#F6D2B8', b: '#F5A3B5', e: '#2B2233', m: '#D9667F', t: sk.t, T: sk.T, a: sk.a, p: sk.p, P: sk.P, w: '#FFFFFF', k: '#2B2233' };
    var rows = SPR.head.concat(SPR.body, SPR.legs[legs]);
    rows.forEach(function (r, y) { for (var x = 0; x < 16; x++) { var ch = r[x]; if (ch !== '.' && pal[ch]) { g.fillStyle = pal[ch]; g.fillRect(x, y, 1, 1); } } });
    /* chignon */
    g.fillStyle = '#5A3420'; g.fillRect(3, 0, 3, 2); g.fillStyle = '#7A4A2C'; g.fillRect(4, 0, 1, 1);
    /* barrette en étoile rose : la petite touche Filiz */
    g.fillStyle = '#FF8FB8'; g.fillRect(11, 1, 3, 1); g.fillRect(12, 0, 1, 3); g.fillStyle = '#FFE3EE'; g.fillRect(12, 1, 1, 1);
    sprCache[key] = c; return c;
  }
  function drawPlayer() {
    var p = P;
    if (p.inv > 0 && Math.floor(p.inv * 16) % 2 === 0 && G.state === 'play') return;
    var sk = skin(), legs = 'idle';
    if (!p.ground) legs = p.vy < 0 ? 'jump' : 'fall';
    else if (Math.abs(p.vx) > 12) { var f = Math.floor(p.anim) % 4; legs = ['r1', 'r2', 'r3', 'r2'][f]; }
    var img = sprite(sk, legs);
    var sq = p.squash, sx = 1 + sq * 0.18, sy = 1 - sq * 0.16;
    if (!p.ground && p.vy < -200) { sx = 0.92; sy = 1.08; }
    var cx = Math.round(p.x + p.w / 2), by = Math.round(p.y + p.h);
    /* ombre portée */
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(cx - 5, by - 1, 10, 1);
    ctx.save(); ctx.translate(cx, by); ctx.scale(p.face * sx, sy);
    if (p.dash > 0) { ctx.globalAlpha = 0.35; ctx.drawImage(img, -8 - 10, -24); ctx.drawImage(img, -8 - 5, -24); ctx.globalAlpha = 1; }
    ctx.drawImage(img, -8, -24);
    ctx.restore();
  }

  function drawHints() {
    (L.d.hints || []).forEach(function (h) {
      if (G.state === 'menu') return;
      var p = sxy(h[0] * T, h[1] * T);
      if (p[0] < -CW || p[0] > CW * 1.2 || p[1] < -60 || p[1] > CH + 60) return;
      var fs = Math.round(Math.max(11 * DPR, 5.2 * Z));
      ctx.font = '600 ' + fs + 'px ' + FONT;
      var w = ctx.measureText(h[2]).width + fs * 1.2, hh = fs * 1.9;
      ctx.fillStyle = 'rgba(20,30,70,.82)'; rr(ctx, p[0], p[1], w, hh, hh / 2); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(h[2], p[0] + fs * 0.6, p[1] + hh / 2 + 1);
    });
  }
  function drawFloats() {
    var fs = Math.round(Math.max(12 * DPR, 5.6 * Z));
    ctx.font = '800 ' + fs + 'px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    floats.forEach(function (f) {
      var p = sxy(f.x, f.y);
      ctx.globalAlpha = Math.min(1, f.l * 2.5);
      ctx.lineWidth = Math.max(2, fs / 5); ctx.strokeStyle = 'rgba(20,16,30,.75)'; ctx.strokeText(f.t, p[0], p[1]);
      ctx.fillStyle = f.c; ctx.fillText(f.t, p[0], p[1]);
    });
    ctx.globalAlpha = 1;
  }

  /* ---------------------------------------------------------------- cycle de vie */
  document.addEventListener('app:screen', function (e) {
    if (e.detail === 'metro') { sized = false; size(); if (G.state === 'menu') menu(); else { render(); } }
    else { releaseAll(); if (G.state === 'play') pause(true); musicPause(); loopStop(); }
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden && G.state === 'play') pause(true); });
  window.addEventListener('resize', function () { sized = false; if (onScreen()) { sized = size(); if (L && P) clampCam(true); render(); } });

  menu();
  loopStop();
  window.metropop = {
    start: startLevel, menu: menu, size: function () { sized = false; render(); },
    stop: function () { if (G.state === 'play') pause(true); musicPause(); loopStop(); },
    isRunning: function () { return G.state === 'play'; },
    state: function () { return { state: G.state, lv: G.lv, time: G.time, stats: stats, p: P && { x: P.x, y: P.y, vx: P.vx, vy: P.vy, ground: P.ground }, cam: cam, Z: Z }; },
    keys: K, press: function (k) { P_[k] = 1; },
    level: function () { return L; }, teleport: function (x, y) { P.x = x; P.y = y; P.vx = P.vy = 0; cam.x = x - viewW() / 2; clampCam(true); }
  };
})();
