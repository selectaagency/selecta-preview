/* =============================================================================
   ARTISTES — chapitres éditoriaux
   =============================================================================
   Trois chapitres, un par artiste. Chacun ouvre sur une photographie traitée
   en bichromie, surmontée du nom en très grand corps posé en « difference »
   sur l'image, puis déroule une fiche, une exergue, la biographie dépliable,
   les réseaux et le lecteur Spotify de l'artiste.

   Les données (biographies, liens, identifiants Spotify) viennent du tableau
   déjà présent dans index.html : rien n'est réécrit ni inventé ici, ce module
   ne fait que les mettre en scène. Il lit window.__ARTISTS.

   Pour associer des visuels à un artiste (affiches, photos de la galerie),
   remplir MEDIA ci-dessous avec des identifiants de window.GALLERY.
   Le tableau est volontairement vide : je ne devine pas qui est sur quelle photo.
   ============================================================================= */

(function (global) {
  'use strict';

  var MEDIA = {
    satine: [],
    filiz: [],
    mitty: []
  };

  /* Photographie d'ouverture de chaque chapitre.
     Trois façons de la définir, dans cet ordre de priorité :
       1. un identifiant de window.GALLERY, par exemple 'p013' — c'est la
          meilleure option, ces fichiers font 1600 px ;
       2. un chemin direct, par exemple 'photos/satine-hd.jpg' ;
       3. rien, et on retombe sur photos/<slug>-hd.jpg puis sur la photo
          déclarée dans la fiche artiste.
     Les fichiers -hd sont des agrandissements soignés des portraits d'origine
     (320 px) : ils évitent le lissage du navigateur mais ne créent pas de
     détail. Pour une vraie netteté, remplacer les sources. */
  var HERO = {
    satine: null,
    filiz: null,
    mitty: null
  };

  function heroSrc(a) {
    var v = HERO[a.id];
    if (v) {
      var g = (global.GALLERY || []).filter(function (m) { return m.id === v; })[0];
      if (g) return g.src;
      return v;
    }
    return 'photos/' + a.id + '-hd.jpg';
  }

  /* Teintes de signature, communes avec l'app Collection. */
  var TINT = { satine: '#E4557A', filiz: '#2FB98A', mitty: '#6E8BFF' };

  var A = [], cur = 0, built = false, host = null, rail = null;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* --------------------------------------------------------------------- */
  /*  Rendu                                                                 */
  /* --------------------------------------------------------------------- */

  function num(i) { return ('0' + (i + 1)).slice(-2); }

  function renderRail() {
    rail.innerHTML = A.map(function (a, i) {
      return '<button type="button" class="ar-name' + (i === cur ? ' on' : '') +
        '" data-i="' + i + '"><i>' + num(i) + '</i>' + esc(a.name) + '</button>';
    }).join('');
  }

  function spotifyId(a) {
    var l = (a.links || []).filter(function (x) { return x.k === 'sp'; })[0];
    if (!l) return null;
    var m = String(l.h).match(/artist\/([A-Za-z0-9]+)/);
    return m ? m[1] : null;
  }

  /* --------------------------------------------------------------------- */
  /*  Carrefour : de la fiche, on rejoint tout l'univers de l'artiste       */
  /* --------------------------------------------------------------------- */

  var EN = function () { return (document.documentElement.lang || 'fr').indexOf('en') === 0; };
  var GAME = { satine: { app: 'game', fr: 'Jouer à 320', en: 'Play 320', sfr: 'Son jeu d’arcade', sen: 'Her arcade game' },
               filiz: { app: 'metro', fr: 'Jouer à Paname rend fou', en: 'Play Paname rend fou', sfr: 'Son jeu dans le métro', sen: 'Her metro game' } };
  var MON_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function todayKey() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function shows(a) {
    var k = todayKey();
    return (global.SHOWS_DATA || []).filter(function (c) { return c.a === a.name && c.d >= k; })
      .sort(function (x, y) { return x.d < y.d ? -1 : 1; });
  }
  function fmtDay(d) {
    var p = d.split('-'), m = parseInt(p[1], 10) - 1, day = parseInt(p[2], 10);
    return EN() ? MON_EN[m] + ' ' + day : day + ' ' + MON_FR[m];
  }
  function nextRow(a) {
    var n = shows(a)[0];
    if (!n) return '';
    var txt = fmtDay(n.d) + ' · ' + n.v + ', ' + n.city;
    return '<div class="ar-row ar-next"><span>' + (EN() ? 'NEXT SHOW' : 'PROCHAINE DATE') + '</span><b>' + esc(txt) + '</b>' +
      (n.url ? '<a href="' + esc(n.url) + '" target="_blank" rel="noopener">' + (EN() ? 'Tickets' : 'Billets') + ' ↗</a>' : '') + '</div>';
  }
  function hub(a) {
    var en = EN(), items = [], g = GAME[a.id];
    if (g) items.push({ act: 'open', arg: g.app, t: en ? g.en : g.fr, s: en ? g.sen : g.sfr, hot: true });
    var nClips = global.__ytCount ? global.__ytCount(a.name) : 0;
    if (nClips) items.push({ act: 'yt', arg: a.name, t: en ? 'Videos' : 'Ses clips', s: nClips + (en ? ' videos' : ' vidéos') });
    var sh = shows(a);
    if (sh.length) items.push({ act: 'map', arg: a.name, t: en ? 'Live dates' : 'Ses concerts', s: sh.length + (en ? (sh.length > 1 ? ' upcoming dates' : ' upcoming date') : (sh.length > 1 ? ' dates à venir' : ' date à venir')) });
    if (global.__hasThread && global.__hasThread(a.id)) items.push({ act: 'thread', arg: a.id, t: en ? 'Messages' : 'Ses messages', s: en ? 'Conversation' : 'Conversation' });
    items.push({ act: 'mail', arg: a.name, t: 'Booking', s: en ? 'Write to the agency' : 'Écrire à l’agence' });
    return '<div class="ar-hub"><div class="ar-hub-head">' + (en ? 'HER WORLD IN THE PHONE' : 'SON UNIVERS DANS LE TÉLÉPHONE') + '</div>' +
      '<div class="ar-hub-grid">' + items.map(function (it) {
        return '<button type="button" class="ar-tile' + (it.hot ? ' hot' : '') + '" data-act="' + it.act + '" data-arg="' + esc(it.arg) + '">' +
          '<b>' + esc(it.t) + '</b><small>' + esc(it.s) + '</small><i aria-hidden="true">→</i></button>';
      }).join('') + '</div></div>';
  }
  function hubAction(act, arg) {
    var open = global.__open;
    if (!open) return;
    if (act === 'open') open(arg);
    else if (act === 'yt') { open('yt'); if (global.__ytArtist) global.__ytArtist(arg); }
    else if (act === 'map') {
      open('plan');
      setTimeout(function () { var b = document.querySelector('#map2-chips [data-f="' + arg + '"]'); if (b) b.click(); }, 260);
    }
    else if (act === 'thread') { if (global.__openThread) global.__openThread(arg); }
    else if (act === 'mail') {
      open('mail');
      var sub = document.getElementById('mail-subject');
      if (sub && (!sub.value || /^Booking — /.test(sub.value))) { sub.value = 'Booking — ' + arg; sub.dispatchEvent(new Event('input', { bubbles: true })); }
    }
  }

  function chapter(a, i) {
    var tint = TINT[a.id] || '#8A8FA3';
    var bio = a.bio || [];
    var lead = bio[0] || '';
    var rest = bio.slice(1);
    var sid = spotifyId(a);
    var med = (MEDIA[a.id] || []).map(function (id) {
      return (global.GALLERY || []).filter(function (g) { return g.id === id; })[0];
    }).filter(Boolean);

    return '' +
    '<article class="ar-chap" data-i="' + i + '" style="--tint:' + tint + '">' +

      '<div class="ar-hero">' +
        '<div class="ar-hero-img"><img src="' + esc(heroSrc(a)) + '" alt="" ' +
          'onerror="this.onerror=null;this.src=\'' + esc(a.photo) + '\'"></div>' +
        '<div class="ar-tint" aria-hidden="true"></div>' +
        '<div class="ar-grain" aria-hidden="true"></div>' +
        '<h2 class="ar-big">' + esc(a.name) + '</h2>' +
        '<span class="ar-index">' + num(i) + ' ⁄ ' + num(A.length - 1) + '</span>' +
        '<span class="ar-vert">' + esc(a.genres || '') + '</span>' +
      '</div>' +

      '<div class="ar-fiche">' +
        (a.facts || []).map(function (f, k) {
          /* une ligne = [intitulé, valeur] ; l'ancien format (texte seul) reste accepté */
          var lab = Array.isArray(f) ? f[0] : (['LABEL', 'SCÈNE', 'PROCHAINE DATE'][k] || 'INFO');
          var val = Array.isArray(f) ? f[1] : f;
          return '<div class="ar-row"><span>' + esc(String(lab).toUpperCase()) + '</span><b>' + esc(val) + '</b></div>';
        }).join('') +
        nextRow(a) +
      '</div>' +

      hub(a) +

      (lead ? '<p class="ar-lead">' + esc(lead) + '</p>' : '') +

      '<div class="ar-bio" data-open="0">' +
        rest.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
      '</div>' +
      (rest.length > 2 ? '<button type="button" class="ar-more">Lire la suite</button>' : '') +

      (med.length ?
        '<div class="ar-strip">' + med.map(function (m) {
          return '<figure><img src="' + m.th + '" alt="" loading="lazy"></figure>';
        }).join('') + '</div>' : '') +

      '<div class="ar-links">' +
        (a.links || []).map(function (l) {
          return '<a class="ar-link" href="' + esc(l.h) + '" target="_blank" rel="noopener">' +
            '<span>' + esc(l.n) + '</span><i>↗</i></a>';
        }).join('') +
      '</div>' +

      (sid ?
        '<div class="ar-play">' +
          '<div class="ar-play-head"><span>ÉCOUTER</span><b>' + esc(a.name) + ' sur Spotify</b></div>' +
          '<iframe title="Lecteur Spotify de ' + esc(a.name) + '" loading="lazy" ' +
            'src="https://open.spotify.com/embed/artist/' + esc(sid) + '?theme=0" ' +
            'width="100%" height="152" frameborder="0" ' +
            'allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>' +
        '</div>' : '') +

      '<div class="ar-end">—</div>' +
    '</article>';
  }

  function render() {
    host.innerHTML = A.map(chapter).join('');
    show(cur, true);
  }

  /* --------------------------------------------------------------------- */
  /*  Changement de chapitre                                                */
  /* --------------------------------------------------------------------- */

  function show(i, instant) {
    cur = (i + A.length) % A.length;
    Array.prototype.forEach.call(rail.children, function (b, k) {
      b.classList.toggle('on', k === cur);
      if (k === cur && b.scrollIntoView) {
        try { b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: instant ? 'auto' : 'smooth' }); }
        catch (e) {}
      }
    });
    Array.prototype.forEach.call(host.children, function (c, k) {
      var on = k === cur;
      c.classList.toggle('on', on);
      if (on) {
        c.classList.remove('enter');
        void c.offsetWidth;          /* on relance l'animation d'apparition */
        if (!instant) c.classList.add('enter');
        c.scrollTop = 0;
      }
    });
    var sc = $('ar-scroll');
    if (sc) sc.scrollTop = 0;
    try { document.dispatchEvent(new CustomEvent('artist:show', { detail: A[cur] && A[cur].id })); } catch (e) {}
  }

  /* --------------------------------------------------------------------- */
  /*  Interactions                                                          */
  /* --------------------------------------------------------------------- */

  function bind() {
    rail.addEventListener('click', function (e) {
      var b = e.target.closest('[data-i]'); if (!b) return;
      show(+b.getAttribute('data-i'));
    });

    host.addEventListener('click', function (e) {
      var tile = e.target.closest('.ar-tile');
      if (tile) { hubAction(tile.getAttribute('data-act'), tile.getAttribute('data-arg')); return; }
      var m = e.target.closest('.ar-more'); if (!m) return;
      var bio = m.previousElementSibling;
      var open = bio.getAttribute('data-open') === '1';
      bio.setAttribute('data-open', open ? '0' : '1');
      m.textContent = open ? 'Lire la suite' : 'Replier';
      if (open) m.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });

    /* glissement horizontal sur la photographie : on change d'artiste */
    var g = null;
    host.addEventListener('pointerdown', function (e) {
      if (!e.target.closest('.ar-hero')) return;
      g = { x: e.clientX, y: e.clientY, t: performance.now() };
    });
    host.addEventListener('pointerup', function (e) {
      if (!g) return;
      var dx = e.clientX - g.x, dy = e.clientY - g.y;
      if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.4) show(cur + (dx < 0 ? 1 : -1));
      g = null;
    });

    /* parallaxe : la photographie glisse moins vite que le texte */
    var sc = $('ar-scroll');
    if (sc) {
      sc.addEventListener('scroll', function () {
        var c = host.children[cur]; if (!c) return;
        var img = c.querySelector('.ar-hero-img');
        var big = c.querySelector('.ar-big');
        var y = sc.scrollTop;
        if (img) img.style.transform = 'translateY(' + (y * 0.18).toFixed(1) + 'px)';
        if (big) {
          big.style.transform = 'translateY(' + (y * -0.12).toFixed(1) + 'px)';
          big.style.opacity = String(Math.max(0, 1 - y / 320));
        }
      }, { passive: true });
    }
  }

  /* --------------------------------------------------------------------- */
  /*  Mise en place                                                         */
  /* --------------------------------------------------------------------- */

  function build() {
    if (built) return;
    host = $('ar-chapters'); rail = $('ar-rail');
    if (!host || !rail) return;
    A = global.__ARTISTS || [];
    if (!A.length) {
      host.innerHTML = '<div class="ar-empty">Aucune fiche artiste trouvée.</div>';
      return;
    }
    built = true;
    renderRail();
    render();
    bind();
  }

  document.addEventListener('app:screen', function (e) {
    if (e.detail === 'mgmt') build();
  });

  /* les liens du carrefour dépendent de la langue et des conversations : on redessine au besoin */
  function refresh() { if (built) { var y = ($('ar-scroll') || {}).scrollTop || 0; render(); var sc = $('ar-scroll'); if (sc) sc.scrollTop = y; } }
  global.ArtistesApp = {
    build: build, show: show, refresh: refresh,
    get index() { return cur; },
    get list() { return A; }
  };
})(window);
