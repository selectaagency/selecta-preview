/* =============================================================================
   CAMÉRA — viseur
   =============================================================================
   La vidéo gallery/cam/viewfinder.mp4 tient lieu de flux de l'objectif : elle
   est lue en boucle, sans son et sans contrôles, et recadrée pour remplir le
   viseur. Aucun écran de chargement : tant que la première image n'est pas
   prête, le viseur reste noir, comme un appareil qui s'allume.

   Ce que l'app fait réellement :
     - zoom numérique continu, au bouton et au pincement ;
     - capture d'une vraie image de la vidéo, à l'instant du déclenchement ;
     - enregistrement d'un vrai fichier vidéo quand le navigateur expose
       MediaRecorder sur un canvas, sinon repli annoncé (voir plus bas) ;
     - mise au point simulée au toucher, avec correction d'exposition ;
     - quatre modes au comportement distinct.
   ============================================================================= */

(function (global) {
  'use strict';

  var MODES = [
    { id: 'slow', label: 'RALENTI' },
    { id: 'photo', label: 'PHOTO' },
    { id: 'video', label: 'VIDÉO' },
    { id: 'cine', label: 'CINÉMATIQUE' }
  ];
  var ZOOMS = [0.5, 1, 2, 3];
  var SHOTS_KEY = 'selecta-cam-shots';

  function $(id) { return document.getElementById(id); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  var S = {
    mode: 'video', zoom: 1, wantZoom: 1,   /* l'app s'ouvre en mode vidéo */
    recording: false, recStart: 0, grid: false,
    ev: 0,                 /* correction d'exposition, -1 à +1 */
    shots: []              /* captures de la session */
  };
  try { S.shots = JSON.parse(sessionStorage.getItem(SHOTS_KEY) || '[]'); } catch (e) {}

  var video, stage, ui = {}, built = false, raf = 0;
  var recorder = null, recChunks = [], recCanvas = null, recTimer = 0;

  /* --------------------------------------------------------------------- */
  /*  Mise en place                                                         */
  /* --------------------------------------------------------------------- */

  function build() {
    if (built) return;
    stage = $('cam-stage');
    if (!stage) return;
    built = true;

    video = $('cam-video');
    ui.modes = $('cam-modes');
    ui.zooms = $('cam-zooms');
    ui.shutter = $('cam-shutter');
    ui.thumb = $('cam-thumb');
    ui.rec = $('cam-rec');
    ui.focus = $('cam-focus');
    ui.grid = $('cam-grid');
    ui.flash = $('cam-flash');
    ui.gridBtn = $('cam-gridbtn');
    ui.evTrack = $('cam-ev');
    ui.hint = $('cam-hint');
    ui.sheet = $('cam-sheet');
    ui.sound = $('cam-sound');
    ui.soundTip = $('cam-soundtip');

    renderModes();
    renderZooms();
    bind();
    syncShots();
    applyMode();
    /* le rapport « contain / cover » dépend des dimensions réelles de la
       vidéo : on force un recalcul dès qu'elles sont connues */
    video.addEventListener('loadedmetadata', function () { syncZoomButtons(); });
    window.addEventListener('resize', function () { syncZoomButtons(); });
  }

  function renderModes() {
    ui.modes.innerHTML = MODES.map(function (m) {
      return '<button type="button" data-mode="' + m.id + '"' +
        (m.id === S.mode ? ' class="on"' : '') + '>' + m.label + '</button>';
    }).join('');
  }
  function renderZooms() {
    ui.zooms.innerHTML = ZOOMS.map(function (z) {
      return '<button type="button" data-zoom="' + z + '">' +
        (z === 1 ? '1×' : String(z).replace('.', ',') + '×') + '</button>';
    }).join('');
    syncZoomButtons();
  }

  function syncZoomButtons() {
    /* On se cale sur le zoom VISÉ, pas sur la valeur en cours d'animation :
       sinon la pastille allumée est celle qu'on vient de quitter. */
    var stop = nearestStop(S.wantZoom);
    var v = S.wantZoom;
    Array.prototype.forEach.call(ui.zooms.children, function (b) {
      var z = parseFloat(b.getAttribute('data-zoom'));
      var active = z === stop;
      b.classList.toggle('on', active);
      b.textContent = active
        ? (v < 1 ? v.toFixed(1).replace('.', ',') : String(Math.round(v * 10) / 10).replace('.', ',')) + '×'
        : (z === 1 ? '1×' : String(z).replace('.', ',') + '×');
    });
  }
  function nearestStop(z) {
    var best = ZOOMS[0], d = Infinity;
    ZOOMS.forEach(function (s) { var dd = Math.abs(Math.log(z / s)); if (dd < d) { d = dd; best = s; } });
    return best;
  }

  /* --------------------------------------------------------------------- */
  /*  Rendu du viseur                                                       */
  /* --------------------------------------------------------------------- */

  /* Rapport entre « tout voir » et « remplir le cadre ». À 1x le viseur est
     rempli ; à 0,5x on descend jusqu'à ce rapport, ce qui découvre l'image
     entière. Au-delà de 1x, c'est un simple agrandissement. */
  function containRatio() {
    var vw = video.videoWidth, vh = video.videoHeight;
    var r = stage.getBoundingClientRect();
    if (!vw || !vh || !r.width || !r.height) return 1;
    var cover = Math.max(r.width / vw, r.height / vh);
    var contain = Math.min(r.width / vw, r.height / vh);
    return contain / cover;
  }
  function cssScale(z) {
    if (z >= 1) return z;
    var cr = containRatio();
    return cr + (1 - cr) * ((z - 0.5) / 0.5);
  }

  function tick() {
    if (!built) return;
    raf = requestAnimationFrame(tick);
    /* zoom amorti : un appareil ne saute pas d'un palier à l'autre */
    S.zoom += (S.wantZoom - S.zoom) * 0.18;
    if (Math.abs(S.wantZoom - S.zoom) < 0.002) S.zoom = S.wantZoom;
    video.style.transform = 'scale(' + cssScale(S.zoom).toFixed(4) + ')';
    video.style.filter = filterFor();
    if (S.recording) {
      var t = (performance.now() - S.recStart) / 1000;
      ui.rec.textContent = fmt(t);
    }
  }

  /* La correction d'exposition et le rendu cinématique passent par des filtres
     CSS : c'est le seul traitement d'image gratuit sur un élément vidéo. */
  function filterFor() {
    var f = [];
    if (S.ev) f.push('brightness(' + (1 + S.ev * 0.45).toFixed(3) + ')');
    if (S.mode === 'cine') f.push('contrast(1.08) saturate(1.12)');
    return f.length ? f.join(' ') : 'none';
  }

  function fmt(t) {
    var s = Math.floor(t);
    return ('0' + Math.floor(s / 60)).slice(-2) + ':' + ('0' + (s % 60)).slice(-2);
  }

  /* --------------------------------------------------------------------- */
  /*  Modes                                                                 */
  /* --------------------------------------------------------------------- */

  function applyMode() {
    Array.prototype.forEach.call(ui.modes.children, function (b) {
      var on = b.getAttribute('data-mode') === S.mode;
      b.classList.toggle('on', on);
      if (on && b.scrollIntoView) {
        try { b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); }
        catch (e) { ui.modes.scrollLeft = b.offsetLeft - ui.modes.clientWidth / 2 + b.offsetWidth / 2; }
      }
    });
    stage.setAttribute('data-mode', S.mode);
    /* disque blanc en photo, disque rouge en vidéo ; le carré rouge n'arrive
       qu'une fois l'enregistrement lancé */
    var movie = (S.mode === 'video' || S.mode === 'cine' || S.mode === 'slow');
    ui.shutter.className = 'cam-shutter ' + (movie ? 'movie' : 'still') + (S.recording ? ' rec' : '');

    /* Chaque mode change réellement quelque chose, pas seulement l'étiquette */
    if (S.mode === 'slow') { video.playbackRate = 0.25; ui.hint.textContent = 'LECTURE AU QUART DE VITESSE'; }
    else if (S.mode === 'cine') { video.playbackRate = 1; ui.hint.textContent = 'PROFONDEUR SIMULÉE · 24 IM/S'; }
    else if (S.mode === 'video') { video.playbackRate = 1; ui.hint.textContent = 'APPUYER POUR ENREGISTRER'; }
    else { video.playbackRate = 1; ui.hint.textContent = 'APPUYER POUR CAPTURER'; }

    if (S.recording && S.mode === 'photo') stopRecording();
  }

  /* --------------------------------------------------------------------- */
  /*  Capture                                                               */
  /* --------------------------------------------------------------------- */

  /* Dessine l'image courante du viseur dans un canvas, exactement comme à
     l'écran : même cadrage, même zoom, mêmes filtres. On calcule la taille
     affichée de la vidéo dans le viseur, puis on la reporte à l'échelle du
     canvas et on laisse celui-ci rogner ce qui dépasse. */
  function drawFrame(canvas) {
    var vw = video.videoWidth, vh = video.videoHeight;
    if (!vw || !vh) return false;
    var r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    var outW = canvas.width, outH = canvas.height;
    var kx = outW / r.width, ky = outH / r.height;
    var ctx = canvas.getContext('2d');

    var cover = Math.max(r.width / vw, r.height / vh);
    var s = cover * cssScale(S.zoom);
    var dispW = vw * s, dispH = vh * s;
    var dx = (r.width - dispW) / 2, dy = (r.height - dispH) / 2;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, outW, outH);
    ctx.save();
    ctx.filter = filterFor();
    ctx.drawImage(video, dx * kx, dy * ky, dispW * kx, dispH * ky);
    ctx.restore();
    if (S.mode === 'cine') vignette(ctx, outW, outH);
    return true;
  }

  function vignette(ctx, w, h) {
    var g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.32, w / 2, h / 2, Math.max(w, h) * 0.72);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,.34)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }

  function capture() {
    var r = stage.getBoundingClientRect();
    var c = document.createElement('canvas');
    var k = 2;                       /* capture à deux fois la taille du viseur */
    c.width = Math.round(r.width * k); c.height = Math.round(r.height * k);
    if (!drawFrame(c)) return;
    flash();
    var url = c.toDataURL('image/jpeg', 0.92);
    S.shots.unshift({ url: url, t: Date.now(), mode: S.mode });
    S.shots = S.shots.slice(0, 12);
    try { sessionStorage.setItem(SHOTS_KEY, JSON.stringify(S.shots)); } catch (e) {}
    syncShots();
  }

  function flash() {
    var f = $('cam-flashfx');
    f.classList.remove('go');
    void f.offsetWidth;
    f.classList.add('go');
    ui.shutter.classList.add('fire');
    setTimeout(function () { ui.shutter.classList.remove('fire'); }, 160);
  }

  function syncShots() {
    var last = S.shots[0];
    ui.thumb.innerHTML = last ? '<img src="' + (last.poster || last.url) + '" alt="">' +
      (last.video ? '<span class="cam-thumb-play">\u25B6</span>' : '') : '';
    ui.thumb.classList.toggle('empty', !last);
    ui.thumb.disabled = !last;
  }

  /* --------------------------------------------------------------------- */
  /*  Enregistrement                                                        */
  /* --------------------------------------------------------------------- */

  /* MediaRecorder sur un canvas n'est pas disponible partout — Safari en
     particulier ne l'expose pas toujours. On détecte, et quand ce n'est pas
     possible on le dit franchement au lieu de faire semblant d'enregistrer. */
  function canRecord() {
    return typeof MediaRecorder !== 'undefined' &&
      !!HTMLCanvasElement.prototype.captureStream &&
      (MediaRecorder.isTypeSupported('video/webm') ||
       MediaRecorder.isTypeSupported('video/mp4'));
  }

  function startRecording() {
    S.recording = true;
    S.recStart = performance.now();
    ui.shutter.classList.add('rec');
    ui.rec.hidden = false;
    ui.rec.textContent = '00:00';
    stage.classList.add('recording');

    if (!canRecord()) {
      ui.hint.textContent = 'ENREGISTREMENT NON PRIS EN CHARGE · IMAGE À L’ARRÊT';
      return;
    }
    var r = stage.getBoundingClientRect();
    recCanvas = document.createElement('canvas');
    recCanvas.width = Math.round(r.width); recCanvas.height = Math.round(r.height);
    var stream = recCanvas.captureStream(30);
    var mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4';
    try {
      recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4000000 });
    } catch (e) { recorder = null; ui.hint.textContent = 'ENREGISTREMENT INDISPONIBLE'; return; }
    recChunks = [];
    recorder.ondataavailable = function (e) { if (e.data && e.data.size) recChunks.push(e.data); };
    recorder.onstop = function () {
      var blob = new Blob(recChunks, { type: mime.split(';')[0] });
      var url = URL.createObjectURL(blob);
      /* une vidéo n'a pas de miniature : on en fabrique une avec la dernière
         image du viseur, sinon la pastille affiche une image cassée */
      var tc = document.createElement('canvas');
      tc.width = 160; tc.height = Math.round(160 * recCanvas.height / recCanvas.width);
      tc.getContext('2d').drawImage(recCanvas, 0, 0, tc.width, tc.height);
      S.shots.unshift({ url: url, poster: tc.toDataURL('image/jpeg', 0.7),
        t: Date.now(), mode: 'video', video: true,
        ext: mime.indexOf('webm') > -1 ? 'webm' : 'mp4' });
      S.shots = S.shots.slice(0, 12);
      syncShots();
    };
    recorder.start(250);
    recTimer = setInterval(function () { drawFrame(recCanvas); }, 1000 / 30);
  }

  function stopRecording() {
    S.recording = false;
    ui.shutter.classList.remove('rec');
    ui.rec.hidden = true;
    stage.classList.remove('recording');
    clearInterval(recTimer); recTimer = 0;
    applyMode();
    if (recorder && recorder.state !== 'inactive') {
      try { recorder.stop(); } catch (e) {}
    } else if (!canRecord()) {
      capture();          /* repli : on garde au moins l'image de fin */
    }
    recorder = null;
  }

  /* --------------------------------------------------------------------- */
  /*  Feuille de prévisualisation                                           */
  /* --------------------------------------------------------------------- */

  function openSheet() {
    var s = S.shots[0]; if (!s) return;
    ui.sheet.innerHTML =
      '<div class="cam-sheet-in">' +
        (s.video
          ? '<video src="' + s.url + '" controls playsinline></video>'
          : '<img src="' + s.url + '" alt="">') +
        '<div class="cam-sheet-bar">' +
          '<button type="button" data-sheet="close">Fermer</button>' +
          '<a download="selecta-' + s.t + '.' + (s.ext || 'jpg') + '" href="' + s.url + '">Enregistrer</a>' +
        '</div>' +
      '</div>';
    ui.sheet.classList.add('on');
  }
  function closeSheet() {
    ui.sheet.classList.remove('on');
    ui.sheet.innerHTML = '';
  }

  /* --------------------------------------------------------------------- */
  /*  Gestes et boutons                                                     */
  /* --------------------------------------------------------------------- */

  function bind() {
    ui.modes.addEventListener('click', function (e) {
      var b = e.target.closest('[data-mode]'); if (!b) return;
      S.mode = b.getAttribute('data-mode');
      applyMode();
    });
    /* glissement horizontal sur la bande des modes */
    var mstart = null;
    ui.modes.addEventListener('pointerdown', function (e) { mstart = { x: e.clientX, i: MODES.findIndex(function (m) { return m.id === S.mode; }) }; });
    ui.modes.addEventListener('pointerup', function (e) {
      if (!mstart) return;
      var dx = e.clientX - mstart.x;
      if (Math.abs(dx) > 40) {
        var i = clamp(mstart.i + (dx < 0 ? 1 : -1), 0, MODES.length - 1);
        S.mode = MODES[i].id; applyMode();
      }
      mstart = null;
    });

    ui.zooms.addEventListener('click', function (e) {
      var b = e.target.closest('[data-zoom]'); if (!b) return;
      S.wantZoom = parseFloat(b.getAttribute('data-zoom'));
      syncZoomButtons();
      pulse(b);
    });

    ui.shutter.addEventListener('click', function () {
      enableSound();          /* premier geste : on peut activer le son */
      if (S.mode === 'photo') { capture(); return; }
      if (S.recording) stopRecording(); else startRecording();
    });

    ui.thumb.addEventListener('click', openSheet);
    ui.sheet.addEventListener('click', function (e) {
      if (e.target === ui.sheet || e.target.closest('[data-sheet="close"]')) closeSheet();
    });

    ui.gridBtn.addEventListener('click', function () {
      S.grid = !S.grid;
      ui.grid.hidden = !S.grid;
      ui.gridBtn.classList.toggle('on', S.grid);
    });
    ui.flash.addEventListener('click', function () {
      ui.flash.classList.toggle('on');
      /* pas de vraie lampe : le réglage n'agit que sur l'éclat du déclenchement */
    });
    ui.sound.addEventListener('click', function (e) { e.stopPropagation(); toggleSound(); });
    /* le tout premier geste dans le viseur suffit à rétablir le son */
    stage.addEventListener('pointerdown', function first() {
      enableSound();
      stage.removeEventListener('pointerdown', first);
    });

    /* mise au point au toucher + correction d'exposition par glissement vertical */
    var fstart = null;
    var pts = {};
    stage.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.cam-ui')) return;
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);
      if (ids.length === 1) {
        fstart = { x: e.clientX, y: e.clientY, ev: S.ev, t: performance.now(), moved: 0 };
        stage.setPointerCapture && stage.setPointerCapture(e.pointerId);
      } else if (ids.length === 2) {
        var a = pts[ids[0]], b = pts[ids[1]];
        fstart = { pinch: true, d0: Math.hypot(a.x - b.x, a.y - b.y), z0: S.wantZoom, moved: 99 };
      }
    });
    stage.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId] || !fstart) return;
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      e.preventDefault();
      var ids = Object.keys(pts);
      if (fstart.pinch && ids.length >= 2) {
        var a = pts[ids[0]], b = pts[ids[1]];
        var d = Math.hypot(a.x - b.x, a.y - b.y);
        S.wantZoom = clamp(fstart.z0 * (d / fstart.d0), 0.5, 6);
        syncZoomButtons();
        return;
      }
      var dy = e.clientY - fstart.y, dx = e.clientX - fstart.x;
      fstart.moved = Math.abs(dx) + Math.abs(dy);
      if (fstart.moved > 14) {
        S.ev = clamp(fstart.ev - dy / 260, -1, 1);
        ui.evTrack.hidden = false;
        ui.evTrack.style.setProperty('--ev', String((S.ev + 1) / 2));
        ui.evTrack.setAttribute('data-v', (S.ev >= 0 ? '+' : '') + S.ev.toFixed(1));
      }
    }, { passive: false });
    function endPointer(e) {
      delete pts[e.pointerId];
      if (!fstart) return;
      if (!fstart.pinch && fstart.moved < 12 && performance.now() - fstart.t < 400) {
        focusAt(fstart.x, fstart.y);
      }
      if (Object.keys(pts).length === 0) {
        fstart = null;
        setTimeout(function () { ui.evTrack.hidden = true; }, 1400);
      }
    }
    stage.addEventListener('pointerup', endPointer);
    stage.addEventListener('pointercancel', endPointer);

    stage.addEventListener('wheel', function (e) {
      e.preventDefault();
      S.wantZoom = clamp(S.wantZoom * (e.deltaY < 0 ? 1.1 : 0.91), 0.5, 6);
      syncZoomButtons();
    }, { passive: false });
  }

  function pulse(b) {
    b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse');
  }

  function focusAt(x, y) {
    var r = stage.getBoundingClientRect();
    ui.focus.style.left = (x - r.left) + 'px';
    ui.focus.style.top = (y - r.top) + 'px';
    ui.focus.classList.remove('go'); void ui.focus.offsetWidth;
    ui.focus.classList.add('go');
  }

  /* --------------------------------------------------------------------- */
  /*  Cycle de vie                                                          */
  /* --------------------------------------------------------------------- */

  /* Le son : les navigateurs n'autorisent la lecture automatique que sans son.
     On démarre donc muet, on affiche une invite, et le premier geste de
     l'utilisateur — où que ce soit dans l'app — rétablit l'audio d'origine.
     Le choix est retenu pour la session. */
  var soundWanted = false;
  try { soundWanted = sessionStorage.getItem('selecta-cam-sound') === '1'; } catch (e) {}

  function syncSound() {
    if (!ui.sound) return;
    video.muted = !soundWanted;
    ui.sound.textContent = soundWanted ? '\uD83D\uDD0A' : '\uD83D\uDD07';
    ui.sound.classList.toggle('muted', !soundWanted);
    ui.sound.setAttribute('aria-pressed', String(soundWanted));
    if (ui.soundTip) ui.soundTip.hidden = soundWanted;
  }
  function enableSound() {
    if (soundWanted) return;
    soundWanted = true;
    try { sessionStorage.setItem('selecta-cam-sound', '1'); } catch (e) {}
    syncSound();
    video.play().catch(function () {});
  }
  function toggleSound() {
    soundWanted = !soundWanted;
    try { sessionStorage.setItem('selecta-cam-sound', soundWanted ? '1' : '0'); } catch (e) {}
    syncSound();
    if (soundWanted) video.play().catch(function () {});
  }

  function start() {
    build();
    if (!built) return;
    video.loop = true;
    video.playsInline = true;
    syncSound();
    var p = video.play();
    if (p && p.catch) p.catch(function () {
      /* refus de lecture automatique : on repasse en muet et on retente */
      video.muted = true;
      video.play().catch(function () {});
      soundWanted = false; syncSound();
    });
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }
  function stop() {
    cancelAnimationFrame(raf); raf = 0;
    if (S.recording) stopRecording();
    if (video) { try { video.pause(); } catch (e) {} }
    closeSheet();
  }

  document.addEventListener('app:screen', function (e) {
    if (e.detail === 'cam') start(); else if (built) stop();
  });

  global.CameraApp = {
    start: start, stop: stop,
    get state() { return S; },
    capture: capture,
    canRecord: canRecord,
    setMode: function (m) { S.mode = m; applyMode(); },
    setZoom: function (z) { S.wantZoom = z; syncZoomButtons(); }
  };
})(window);
