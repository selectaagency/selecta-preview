/* =============================================================================
   PHOTOS — photothèque
   =============================================================================
   Les médias sont décrits par gallery/manifest.js, qui définit window.GALLERY
   (un tableau, pas un JSON chargé par fetch : le site doit aussi fonctionner
   ouvert en file://, où fetch sur un fichier local est refusé).

   Chaque entrée :
     { id, t:'photo'|'video', src, th, w, h, d:'ISO', dur?, o:'nom d origine' }

   Ajouter des médias : relancer la conversion, qui réécrit manifest.js.
   ============================================================================= */

(function (global) {
  'use strict';

  var MEDIA = global.GALLERY || [];
  var FAV_KEY = 'selecta-photos-fav';

  var fav = {};
  try { fav = JSON.parse(localStorage.getItem(FAV_KEY) || '{}'); } catch (e) {}
  function saveFav() { try { localStorage.setItem(FAV_KEY, JSON.stringify(fav)); } catch (e) {} }

  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function dur(s) {
    s = Math.round(s || 0);
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }

  /* --------------------------------------------------------------------- */
  /*  État                                                                  */
  /* --------------------------------------------------------------------- */

  var S = {
    tab: 'library',      /* library | albums */
    album: null,         /* null | 'photos' | 'videos' | 'fav' */
    list: [],            /* la liste affichée, dans l'ordre */
    index: 0,
    open: false,
    selecting: false,
    chosen: {}
  };

  function listFor(album) {
    if (album === 'photos') return MEDIA.filter(function (m) { return m.t === 'photo'; });
    if (album === 'videos') return MEDIA.filter(function (m) { return m.t === 'video'; });
    if (album === 'fav') return MEDIA.filter(function (m) { return fav[m.id]; });
    return MEDIA;
  }

  /* --------------------------------------------------------------------- */
  /*  Grille                                                                */
  /* --------------------------------------------------------------------- */

  function monthKey(iso) { return iso.slice(0, 7); }
  function monthLabel(iso) {
    var y = +iso.slice(0, 4), m = +iso.slice(5, 7);
    var now = new Date();
    var s = MOIS[m - 1];
    return s.charAt(0).toUpperCase() + s.slice(1) + (y === now.getFullYear() ? '' : ' ' + y);
  }

  function tile(m) {
    var b = el('button', 'ph-tile' + (m.t === 'video' ? ' vid' : ''));
    b.type = 'button';
    b.setAttribute('data-id', m.id);
    b.innerHTML =
      '<img src="' + m.th + '" alt="" loading="lazy" decoding="async">' +
      (m.t === 'video' ? '<span class="ph-dur">' + dur(m.dur) + '</span>' : '') +
      (fav[m.id] ? '<span class="ph-fav" aria-hidden="true">♥</span>' : '') +
      '<span class="ph-check" aria-hidden="true"></span>';
    return b;
  }

  function renderGrid() {
    var host = $('ph-scroll');
    if (!host) return;
    S.list = listFor(S.album);
    host.innerHTML = '';

    if (!S.list.length) {
      host.appendChild(el('div', 'ph-empty',
        '<b>Pas encore de photos</b>Les prochaines arrivent bientôt.'));
      return;
    }

    var cur = null, grid = null;
    S.list.forEach(function (m) {
      var k = monthKey(m.d);
      if (k !== cur) {
        cur = k;
        var h = el('h2', 'ph-month', monthLabel(m.d));
        host.appendChild(h);
        grid = el('div', 'ph-grid');
        host.appendChild(grid);
      }
      grid.appendChild(tile(m));
    });
    updateCount();
  }

  function updateCount() {
    var n = $('ph-count');
    if (!n) return;
    var ph = S.list.filter(function (m) { return m.t === 'photo'; }).length;
    var vi = S.list.length - ph;
    var parts = [];
    if (ph) parts.push(ph + ' photo' + (ph > 1 ? 's' : ''));
    if (vi) parts.push(vi + ' vidéo' + (vi > 1 ? 's' : ''));
    n.textContent = parts.join(' · ');
  }

  function renderAlbums() {
    var host = $('ph-albums');
    if (!host) return;
    var defs = [
      ['photos', 'Photos', MEDIA.filter(function (m) { return m.t === 'photo'; })],
      ['videos', 'Vidéos', MEDIA.filter(function (m) { return m.t === 'video'; })],
      ['fav', 'Favoris', MEDIA.filter(function (m) { return fav[m.id]; })]
    ];
    host.innerHTML = defs.map(function (d) {
      var cover = d[2][0];
      return '<button type="button" class="ph-album" data-album="' + d[0] + '">' +
        '<span class="ph-album-img">' +
          (cover ? '<img src="' + cover.th + '" alt="" loading="lazy">' : '') +
        '</span><b>' + d[1] + '</b><small>' + d[2].length + '</small></button>';
    }).join('');
  }

  /* --------------------------------------------------------------------- */
  /*  Visionneuse                                                           */
  /* --------------------------------------------------------------------- */

  var view = {};        /* nœuds de la visionneuse */
  var zoom = { s: 1, x: 0, y: 0 };
  var gest = null;

  function openAt(id) {
    var i = S.list.findIndex(function (m) { return m.id === id; });
    if (i < 0) return;
    var sc = $('ph-scroll');
    if (sc && !S.open) S.scroll = sc.scrollTop;   /* on retient où on en était dans la grille */
    S.index = i; S.open = true;
    view.root.classList.add('on');
    view.root.setAttribute('aria-hidden', 'false');
    buildSlides();
    buildStrip();
    showChrome(true);
  }

  function closeViewer() {
    S.open = false;
    stopVideos();
    view.root.classList.remove('on');
    view.root.setAttribute('aria-hidden', 'true');
    /* on reste dans Photos : jamais de retour à l'accueil */
    var screen = document.getElementById('phone');
    if (screen && screen.getAttribute('data-screen') !== 'gallery' && typeof global.__open === 'function') {
      global.__open('gallery');
    }
    var sc = $('ph-scroll');
    if (sc && typeof S.scroll === 'number') sc.scrollTop = S.scroll;
  }

  /* On ne monte que trois diapositives : la courante et ses voisines.
     Soixante-cinq médias en mémoire d'un coup tueraient le défilement. */

  /* ---- pellicule de miniatures (façon Photos) ---- */
  function buildStrip() {
    var box = $('ph-strip');
    if (!box) return;
    box.innerHTML = S.list.map(function (m, i) {
      return '<button type="button" data-i="' + i + '"' + (i === S.index ? ' class="on"' : '') +
             ' aria-label="Photo ' + (i + 1) + '"><img src="' + (m.th || m.src) + '" alt="" loading="lazy"></button>';
    }).join('');
  }
  function syncStrip() {
    var box = $('ph-strip');
    if (!box) return;
    var btns = box.querySelectorAll('button');
    if (btns.length !== S.list.length) buildStrip(), btns = box.querySelectorAll('button');
    Array.prototype.forEach.call(btns, function (b, i) { b.classList.toggle('on', i === S.index); });
    var cur = btns[S.index];
    if (cur) {
      var rb = box.getBoundingClientRect(), rc = cur.getBoundingClientRect();
      var target = box.scrollLeft + (rc.left - rb.left) - (rb.width - rc.width) / 2;
      box.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    }
  }
  function gotoIndex(i) {
    if (i === S.index) return;
    var d = i - S.index;
    if (Math.abs(d) === 1) { go(d); return; }
    S.index = Math.max(0, Math.min(S.list.length - 1, i));
    stopVideos(); buildSlides();
  }

  function buildSlides() {
    view.track.innerHTML = '';
    for (var k = -1; k <= 1; k++) {
      var i = S.index + k;
      var slide = el('div', 'ph-slide');
      slide.style.transform = 'translateX(' + (k * 100) + '%)';
      if (i >= 0 && i < S.list.length) slide.appendChild(mediaNode(S.list[i], k === 0));
      view.track.appendChild(slide);
    }
    resetZoom();
    syncMeta();
    autoplayCurrent();
    syncStrip();
  }

  /* Lecture automatique : Safari n'accepte le son que si play() vient d'un tap.
     On tente avec le son ; si c'est refusé, on relance en muet et on le signale. */
  function autoplayCurrent() {
    var m = S.list[S.index];
    if (!m || m.t !== 'video') return;
    var v = view.track.querySelector('.ph-slide:nth-child(2) video');
    if (!v) return;
    var tryPlay = function (muted) {
      v.muted = muted;
      var pr = v.play();
      if (pr && pr.catch) {
        pr.catch(function () {
          if (!muted) tryPlay(true);
        });
      }
    };
    v.addEventListener('loadedmetadata', function once() {
      v.removeEventListener('loadedmetadata', once);
      tryPlay(false);
    });
    if (v.readyState >= 1) tryPlay(false);
    else { try { v.load(); } catch (e) {} }
    var bar = v.parentNode && v.parentNode.querySelector('.ph-vbar');
    if (bar) {
      var mb = bar.querySelector('.pv-mute');
      v.addEventListener('play', function () {
        if (mb) { mb.classList.toggle('off', v.muted); mb.textContent = v.muted ? '♪̸' : '♪'; }
      });
    }
  }

  function mediaNode(m, isCurrent) {
    if (m.t === 'video') {
      var wrap = el('div', 'ph-video');
      var v = document.createElement('video');
      v.src = m.src; v.playsInline = true; v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.preload = isCurrent ? 'metadata' : 'none';
      v.poster = m.th;
      v.controls = false;
      wrap.appendChild(v);
      wrap.appendChild(buildVideoBar(v, m));
      return wrap;
    }
    var img = document.createElement('img');
    img.className = 'ph-img';
    img.src = m.src; img.alt = '';
    img.draggable = false;
    return img;
  }

  function buildVideoBar(v, m) {
    var ICON_PLAY = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M7.5 5.2v13.6L19 12z"/></svg>';
    var ICON_PAUSE = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><rect x="6.5" y="5" width="3.6" height="14" rx="1.1"/><rect x="13.9" y="5" width="3.6" height="14" rx="1.1"/></svg>';
    var ICON_SOUND = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5h3l4-3.2v11.4l-4-3.2H4z"/><path d="M15.2 9a4 4 0 0 1 0 6"/></svg>';
    var ICON_MUTED = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5h3l4-3.2v11.4l-4-3.2H4z"/><path d="M16 9.5l4 5M20 9.5l-4 5"/></svg>';
    var ICON_FULL = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
    var bar = el('div', 'ph-vbar',
      '<button type="button" class="pv-play" aria-label="Lecture">' + ICON_PLAY + '</button>' +
      '<span class="pv-t">0:00</span>' +
      '<span class="pv-track"><i><b></b></i></span>' +
      '<span class="pv-d">' + dur(m.dur) + '</span>' +
      '<button type="button" class="pv-mute" aria-label="Son">' + ICON_SOUND + '</button>' +
      '<button type="button" class="pv-full" aria-label="Plein écran">' + ICON_FULL + '</button>');
    var play = bar.querySelector('.pv-play'), fill = bar.querySelector('.pv-track b');
    var tEl = bar.querySelector('.pv-t'), track = bar.querySelector('.pv-track');
    var mute = bar.querySelector('.pv-mute'), full = bar.querySelector('.pv-full');

    function sync() {
      play.innerHTML = v.paused ? ICON_PLAY : ICON_PAUSE;
      play.setAttribute('aria-label', v.paused ? 'Lecture' : 'Pause');
    }
    play.addEventListener('click', function (e) {
      e.stopPropagation();
      if (v.paused) v.play().catch(function () {}); else v.pause();
      sync();
    });
    v.addEventListener('play', sync); v.addEventListener('pause', sync);
    v.addEventListener('timeupdate', function () {
      var f = v.duration ? v.currentTime / v.duration : 0;
      fill.style.width = (f * 100) + '%';
      tEl.textContent = dur(v.currentTime);
    });
    /* glisser sur la barre pour se déplacer dans la vidéo */
    function seekAt(clientX) {
      var r = track.getBoundingClientRect();
      if (v.duration) v.currentTime = clamp((clientX - r.left) / r.width, 0, 1) * v.duration;
    }
    track.addEventListener('pointerdown', function (e) {
      e.stopPropagation(); track.setPointerCapture(e.pointerId);
      track.dataset.drag = '1'; seekAt(e.clientX);
    });
    track.addEventListener('pointermove', function (e) {
      if (track.dataset.drag) { e.stopPropagation(); seekAt(e.clientX); }
    });
    track.addEventListener('pointerup', function (e) {
      e.stopPropagation(); delete track.dataset.drag;
    });
    mute.addEventListener('click', function (e) {
      e.stopPropagation(); v.muted = !v.muted;
      mute.classList.toggle('off', v.muted);
      mute.innerHTML = v.muted ? ICON_MUTED : ICON_SOUND;
    });
    full.addEventListener('click', function (e) {
      e.stopPropagation();
      /* sur iPhone, seule la vidéo elle-même peut passer en plein écran */
      if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
      else if (v.requestFullscreen) v.requestFullscreen();
      else if (v.webkitRequestFullscreen) v.webkitRequestFullscreen();
    });
    bar.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    /* la barre s'efface pendant la lecture, comme sur iPhone */
    var idleT = 0;
    function poke() {
      bar.classList.remove('idle');
      clearTimeout(idleT);
      idleT = setTimeout(function () { if (!v.paused) bar.classList.add('idle'); }, 2600);
    }
    v.addEventListener('play', poke);
    v.addEventListener('pause', function () { clearTimeout(idleT); bar.classList.remove('idle'); });
    v.addEventListener('timeupdate', function () { if (!idleT) poke(); });
    bar.addEventListener('pointermove', poke);
    v.addEventListener('click', poke);
    poke();
    sync();
    return bar;
  }

  function stopVideos() {
    Array.prototype.forEach.call(view.track.querySelectorAll('video'), function (v) {
      try { v.pause(); } catch (e) {}
    });
  }

  function currentMedia() { return S.list[S.index]; }
  function currentSlide() { return view.track.children[1]; }

  function syncMeta() {
    var m = currentMedia(); if (!m) return;
    var d = new Date(m.d);
    var jour = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    var heure = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    view.date.textContent = jour;
    view.time.textContent = heure + ' · ' + m.w + '×' + m.h +
      (m.t === 'video' ? ' · ' + dur(m.dur) : '');
    view.favBtn.classList.toggle('on', !!fav[m.id]);
    view.favBtn.setAttribute('aria-pressed', String(!!fav[m.id]));
    view.pos.textContent = (S.index + 1) + ' / ' + S.list.length;
  }

  function go(delta) {
    var n = S.index + delta;
    if (n < 0 || n >= S.list.length) { springBack(); return; }
    stopVideos();
    S.index = n;
    /* on anime la piste puis on reconstruit, pour que le glissement reste net */
    view.track.style.transition = 'transform .28s cubic-bezier(.22,.61,.36,1)';
    view.track.style.transform = 'translateX(' + (-delta * 100) + '%)';
    setTimeout(function () {
      view.track.style.transition = '';
      view.track.style.transform = '';
      buildSlides();
    }, 280);
  }
  function springBack() {
    view.track.style.transition = 'transform .25s cubic-bezier(.22,.61,.36,1)';
    view.track.style.transform = '';
    setTimeout(function () { view.track.style.transition = ''; }, 250);
  }

  /* ----------------------------- zoom et gestes ----------------------------- */

  function resetZoom() {
    zoom.s = 1; zoom.x = 0; zoom.y = 0;
    applyZoom(false);
  }
  function applyZoom(animate) {
    var slide = currentSlide(); if (!slide) return;
    var node = slide.firstChild; if (!node) return;
    node.style.transition = animate ? 'transform .25s cubic-bezier(.22,.61,.36,1)' : '';
    node.style.transform = 'translate(' + zoom.x + 'px,' + zoom.y + 'px) scale(' + zoom.s + ')';
    view.root.classList.toggle('zoomed', zoom.s > 1.01);
  }
  function clampPan() {
    var slide = currentSlide(); if (!slide) return;
    var node = slide.firstChild; if (!node) return;
    var r = node.getBoundingClientRect();
    var vw = view.root.clientWidth, vh = view.root.clientHeight;
    /* largeur de l'image à l'échelle 1, pour borner le déplacement */
    var w = r.width / zoom.s, h = r.height / zoom.s;
    var maxX = Math.max(0, (w * zoom.s - vw) / 2);
    var maxY = Math.max(0, (h * zoom.s - vh) / 2);
    zoom.x = clamp(zoom.x, -maxX, maxX);
    zoom.y = clamp(zoom.y, -maxY, maxY);
  }

  var pointers = {};
  function bindViewer() {
    var r = view.root;
    r.style.touchAction = 'none';

    r.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.ph-vbar, .ph-top, .ph-bottom')) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pointers);
      if (ids.length === 1) {
        gest = { mode: zoom.s > 1.01 ? 'pan' : 'swipe', x: e.clientX, y: e.clientY,
          x0: e.clientX, y0: e.clientY, t: performance.now(), zx: zoom.x, zy: zoom.y, moved: 0 };
        r.setPointerCapture && r.setPointerCapture(e.pointerId);
      } else if (ids.length === 2) {
        var a = pointers[ids[0]], b = pointers[ids[1]];
        gest = { mode: 'pinch', d0: Math.hypot(a.x - b.x, a.y - b.y), s0: zoom.s,
          zx: zoom.x, zy: zoom.y, moved: 99 };
      }
    });

    r.addEventListener('pointermove', function (e) {
      if (!pointers[e.pointerId] || !gest) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      e.preventDefault();
      var ids = Object.keys(pointers);

      if (gest.mode === 'pinch' && ids.length >= 2) {
        var a = pointers[ids[0]], b = pointers[ids[1]];
        var d = Math.hypot(a.x - b.x, a.y - b.y);
        zoom.s = clamp(gest.s0 * (d / gest.d0), 1, 5);
        clampPan(); applyZoom(false);
        return;
      }
      var dx = e.clientX - gest.x0, dy = e.clientY - gest.y0;
      gest.moved = Math.abs(dx) + Math.abs(dy);

      if (gest.mode === 'pan') {
        zoom.x = gest.zx + dx; zoom.y = gest.zy + dy;
        clampPan(); applyZoom(false);
      } else if (gest.mode === 'swipe') {
        /* glissement vertical franc : on referme, comme sur un téléphone */
        if (Math.abs(dy) > Math.abs(dx) * 1.4 && Math.abs(dy) > 12) {
          gest.mode = 'dismiss';
        } else {
          view.track.style.transform = 'translateX(' + dx + 'px)';
        }
      }
      if (gest.mode === 'dismiss') {
        var k = clamp(1 - Math.abs(dy) / 600, 0.82, 1);
        view.track.style.transform = 'translate(' + (dx * 0.4) + 'px,' + dy + 'px) scale(' + k + ')';
        view.root.style.background = 'rgba(0,0,0,' + clamp(1 - Math.abs(dy) / 500, 0.3, 1) + ')';
      }
    }, { passive: false });

    function end(e) {
      delete pointers[e.pointerId];
      if (!gest) return;
      var ids = Object.keys(pointers);
      if (gest.mode === 'pinch') {
        if (ids.length === 0) {
          if (zoom.s < 1.05) resetZoom();
          gest = null;
        }
        return;
      }
      var dx = e.clientX - gest.x0, dy = e.clientY - gest.y0;
      var quick = performance.now() - gest.t < 320;

      if (gest.mode === 'dismiss') {
        view.root.style.background = '';
        if (Math.abs(dy) > 110) { view.track.style.transform = ''; closeViewer(); }
        else springBack();
      } else if (gest.mode === 'swipe') {
        if (gest.moved < 9 && quick) toggleChrome();
        else if (Math.abs(dx) > view.root.clientWidth * 0.22 || (quick && Math.abs(dx) > 60)) {
          go(dx < 0 ? 1 : -1);
        } else springBack();
      } else if (gest.mode === 'pan') {
        if (gest.moved < 9 && quick) toggleChrome();
      }
      gest = null;
    }
    r.addEventListener('pointerup', end);
    r.addEventListener('pointercancel', end);

    /* double tap : zoom avant ou retour à l'échelle 1 */
    var lastTap = 0;
    r.addEventListener('click', function (e) {
      if (e.target.closest('.ph-vbar, .ph-top, .ph-bottom')) return;
      var now = performance.now();
      if (now - lastTap < 300) {
        if (zoom.s > 1.01) resetZoom();
        else {
          var rect = view.root.getBoundingClientRect();
          zoom.s = 2.6;
          zoom.x = (rect.width / 2 - (e.clientX - rect.left)) * 1.6;
          zoom.y = (rect.height / 2 - (e.clientY - rect.top)) * 1.6;
          clampPan();
        }
        applyZoom(true);
        lastTap = 0;
      } else lastTap = now;
    });

    r.addEventListener('wheel', function (e) {
      e.preventDefault();
      zoom.s = clamp(zoom.s * (e.deltaY < 0 ? 1.12 : 0.89), 1, 5);
      if (zoom.s <= 1.01) { zoom.x = zoom.y = 0; }
      clampPan(); applyZoom(false);
    }, { passive: false });
  }

  var chromeOn = true;
  function showChrome(on) {
    chromeOn = on;
    view.root.classList.toggle('bare', !on);
  }
  function toggleChrome() { showChrome(!chromeOn); }

  /* --------------------------------------------------------------------- */
  /*  Partage et téléchargement                                             */
  /* --------------------------------------------------------------------- */

  function shareCurrent() {
    var m = currentMedia(); if (!m) return;
    var url = new URL(m.src, location.href).href;
    if (navigator.share) {
      /* partager le fichier quand le navigateur le permet, sinon le lien */
      fetch(url).then(function (r) { return r.blob(); }).then(function (b) {
        var f = new File([b], m.o || m.id, { type: b.type });
        if (navigator.canShare && navigator.canShare({ files: [f] })) {
          return navigator.share({ files: [f] });
        }
        return navigator.share({ url: url });
      }).catch(function () {
        navigator.share({ url: url }).catch(function () {});
      });
    } else {
      downloadCurrent();
    }
  }

  function downloadCurrent() {
    var m = currentMedia(); if (!m) return;
    var a = document.createElement('a');
    a.href = m.src; a.download = m.o || m.id;
    document.body.appendChild(a); a.click(); a.remove();
  }

  function toggleFav() {
    var m = currentMedia(); if (!m) return;
    if (fav[m.id]) delete fav[m.id]; else fav[m.id] = 1;
    saveFav(); syncMeta(); renderAlbums();
    var t = document.querySelector('.ph-tile[data-id="' + m.id + '"]');
    if (t) {
      var mark = t.querySelector('.ph-fav');
      if (fav[m.id] && !mark) t.insertBefore(el('span', 'ph-fav', '♥'), t.querySelector('.ph-check'));
      if (!fav[m.id] && mark) mark.remove();
    }
  }

  /* --------------------------------------------------------------------- */
  /*  Sélection multiple                                                    */
  /* --------------------------------------------------------------------- */

  function setSelecting(on) {
    S.selecting = on; S.chosen = {};
    var sc = $('ph-scroll');
    if (sc) sc.classList.toggle('selecting', on);
    $('ph-select').textContent = on ? 'OK' : 'Sélect.';
    $('ph-actions').classList.toggle('on', on);
    Array.prototype.forEach.call(document.querySelectorAll('.ph-tile.sel'),
      function (t) { t.classList.remove('sel'); });
    syncSelCount();
  }
  function syncSelCount() {
    var n = Object.keys(S.chosen).length;
    var lab = $('ph-selcount');
    if (lab) lab.textContent = n ? n + ' sélectionné' + (n > 1 ? 's' : '') : 'Rien de sélectionné';
    $('ph-dl').disabled = !n;
    $('ph-favall').disabled = !n;
  }

  /* --------------------------------------------------------------------- */
  /*  Mise en place                                                         */
  /* --------------------------------------------------------------------- */

  var built = false;
  function build() {
    if (built) return;
    built = true;

    view.root = $('ph-viewer');
    view.track = $('ph-track');
    view.date = $('ph-vdate');
    view.time = $('ph-vtime');
    view.pos = $('ph-vpos');
    view.favBtn = $('ph-vfav');
    if (!view.root) return;

    bindViewer();

    $('ph-scroll').addEventListener('click', function (e) {
      var t = e.target.closest('.ph-tile'); if (!t) return;
      var id = t.getAttribute('data-id');
      if (S.selecting) {
        if (S.chosen[id]) { delete S.chosen[id]; t.classList.remove('sel'); }
        else { S.chosen[id] = 1; t.classList.add('sel'); }
        syncSelCount();
        return;
      }
      openAt(id);
    });

    $('ph-albums').addEventListener('click', function (e) {
      var b = e.target.closest('[data-album]'); if (!b) return;
      S.album = b.getAttribute('data-album');
      S.tab = 'library';
      syncTabs(); renderGrid();
      $('ph-back').hidden = false;
      $('ph-title').textContent = b.querySelector('b').textContent;
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-phtab]'), function (b) {
      b.addEventListener('click', function () {
        S.tab = b.getAttribute('data-phtab');
        if (S.tab === 'library' && S.album) { S.album = null; renderGrid(); }
        $('ph-back').hidden = true;
        $('ph-title').textContent = S.tab === 'albums' ? 'Albums' : 'Photothèque';
        syncTabs();
      });
    });

    $('ph-back').addEventListener('click', function () {
      S.album = null; $('ph-back').hidden = true;
      $('ph-title').textContent = 'Photothèque';
      renderGrid();
    });

    $('ph-select').addEventListener('click', function () { setSelecting(!S.selecting); });
    $('ph-dl').addEventListener('click', function () {
      Object.keys(S.chosen).forEach(function (id, i) {
        var m = MEDIA.filter(function (x) { return x.id === id; })[0];
        if (!m) return;
        setTimeout(function () {
          var a = document.createElement('a');
          a.href = m.src; a.download = m.o || m.id;
          document.body.appendChild(a); a.click(); a.remove();
        }, i * 320);   /* en rafale, les navigateurs bloquent */
      });
    });
    $('ph-favall').addEventListener('click', function () {
      Object.keys(S.chosen).forEach(function (id) { fav[id] = 1; });
      saveFav(); renderGrid(); renderAlbums(); setSelecting(false);
    });

    $('ph-close').addEventListener('click', closeViewer);
    view.favBtn.addEventListener('click', toggleFav);
    $('ph-vshare').addEventListener('click', shareCurrent);

    /* pellicule : aller directement à une photo */
    var strip = $('ph-strip');
    if (strip) strip.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]'); if (!b) return;
      e.stopPropagation();
      gotoIndex(+b.getAttribute('data-i'));
    });

    /* bouton (i) : informations + téléchargement */
    var infoBtn = $('ph-vinfo');
    if (infoBtn) infoBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var box = $('ph-info'), m = currentMedia();
      if (!box || !m) return;
      if (!box.hidden) { box.hidden = true; return; }
      var d = new Date(m.d);
      box.innerHTML = '<b>' + m.t.charAt(0).toUpperCase() + m.t.slice(1) + '</b>' +
        d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) + ' · ' +
        d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '<br>' +
        m.w + ' × ' + m.h + ' px' + (m.t === 'video' ? ' · ' + dur(m.dur) : '') +
        '<br><a href="' + m.src + '" download>Enregistrer sur cet appareil</a>';
      box.hidden = false;
    });

    /* corbeille : retire la photo de la pellicule pour la session */
    var delBtn = $('ph-vdel');
    if (delBtn) delBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (S.list.length < 2) return;
      S.list.splice(S.index, 1);
      if (S.index >= S.list.length) S.index = S.list.length - 1;
      buildSlides(); buildStrip();
      var box = $('ph-info'); if (box) box.hidden = true;
    });

    document.addEventListener('keydown', function (e) {
      if (!S.open) return;
      if (e.key === 'Escape') closeViewer();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    });

    renderAlbums();
    renderGrid();
    syncTabs();
  }

  function syncTabs() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-phtab]'), function (b) {
      b.setAttribute('aria-selected', String(b.getAttribute('data-phtab') === S.tab));
    });
    $('ph-scroll').hidden = S.tab !== 'library';
    $('ph-albums').hidden = S.tab !== 'albums';
  }

  document.addEventListener('app:screen', function (e) {
    if (e.detail === 'gallery') build();
    else if (S.open) closeViewer();
  });

  global.PhotosApp = {
    build: build, media: MEDIA,
    get state() { return S; },
    openAt: openAt, close: closeViewer, go: go,
    get zoom() { return zoom; }
  };
})(window);
