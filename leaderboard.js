/* =====================================================================
   SELECTA — client des classements (320 et Paname rend fou)
   Parle directement à l'API REST de Supabase (pas de bibliothèque à charger).
   Ne bloque jamais le jeu : tout est asynchrone, avec délai maximal, et
   toute erreur réseau se traduit par « hors ligne », jamais par un faux score.
   ===================================================================== */
(function () {
  'use strict';
  var C = window.SELECTA_LB || {};
  var URL_ = (C.url || '').replace(/\/+$/, ''), KEY = C.key || '';
  var enabled = !!(URL_ && KEY);

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = new Uint8Array(16); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(b) : b.forEach(function (_, i) { b[i] = Math.random() * 256 | 0; });
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = [].map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var player = ls('selecta-player');
  if (!player || !/^[0-9a-f-]{36}$/i.test(player)) { player = uuid(); ls('selecta-player', player); }

  function rpc(fn, body, ms) {
    if (!enabled) return Promise.reject(new Error('offline'));
    var ctl = window.AbortController ? new AbortController() : null;
    var to = setTimeout(function () { if (ctl) ctl.abort(); }, ms || 7000);
    return fetch(URL_ + '/rest/v1/rpc/' + fn, {
      method: 'POST', signal: ctl ? ctl.signal : undefined,
      headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) {
      clearTimeout(to);
      return r.json().then(function (j) {
        if (!r.ok) { var e = new Error((j && j.message) || 'http_' + r.status); e.code = (j && j.message) || 'error'; throw e; }
        return j;
      });
    }, function (e) { clearTimeout(to); var x = new Error('offline'); x.code = 'offline'; throw x; });
  }

  var cache = {};
  var LB = {
    enabled: enabled,
    player: player,
    name: function (v) { if (v === undefined) return ls('selecta-pseudo') || ''; ls('selecta-pseudo', v); },
    /* ouvre une partie : le serveur note l'heure de départ (aucun score ne peut aller plus vite que le temps réel) */
    start: function (game, level) {
      if (!enabled) return Promise.resolve(null);
      return rpc('lb_start', { p_game: game, p_player: player, p_level: level || 0 }, 5000).catch(function () { return null; });
    },
    submit: function (token, name, score, stats) {
      if (!enabled) return Promise.reject(Object.assign(new Error('offline'), { code: 'offline' }));
      if (!token) return Promise.reject(Object.assign(new Error('no_token'), { code: 'no_token' }));
      return rpc('lb_submit', { p_token: token, p_name: name, p_score: Math.round(score), p_stats: stats || {} }).then(function (r) {
        if (r && r.error) { var e = new Error(r.error); e.code = r.error; throw e; }
        delete cache[r && r.game]; cache = {};
        return r;
      });
    },
    top: function (game, fresh) {
      if (!enabled) return Promise.reject(Object.assign(new Error('offline'), { code: 'offline' }));
      var c = cache[game];
      if (c && !fresh && Date.now() - c.t < 20000) return Promise.resolve(c.v);
      return rpc('lb_top', { p_game: game, p_player: player }).then(function (v) { cache[game] = { t: Date.now(), v: v }; return v; });
    },
    /* messages d'erreur lisibles */
    why: function (e, en) {
      var c = (e && e.code) || 'error';
      var fr = { offline: 'Connexion impossible pour le moment.', bad_name: 'Ce pseudo n’est pas accepté. Essaie-en un autre.',
        rate_limited: 'Trop de parties d’un coup : réessaie dans quelques minutes.', bad_token: 'Partie expirée : rejoue pour enregistrer.',
        no_token: 'Partie lancée hors ligne : rejoue connecté pour enregistrer.', implausible: 'Score refusé par le contrôle anti-triche.', mismatch: 'Score refusé par le contrôle anti-triche.' };
      var enT = { offline: 'Can’t connect right now.', bad_name: 'That name isn’t allowed. Try another one.',
        rate_limited: 'Too many games at once: try again in a few minutes.', bad_token: 'Run expired: play again to save.',
        no_token: 'Run started offline: play again online to save.', implausible: 'Score rejected by the anti-cheat check.', mismatch: 'Score rejected by the anti-cheat check.' };
      return (en ? enT : fr)[c] || (en ? 'Something went wrong.' : 'Un souci est survenu.');
    },
    clean: function (s) { return String(s || '').replace(/\s+/g, ' ').replace(/[^A-Za-z0-9À-ÖØ-öø-ÿ _.\-♡★✿]/g, '').trim().slice(0, 14); },
    esc: function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); },
    fmt: function (n) { return Number(n || 0).toLocaleString('fr-FR').replace(/ /g, ' '); }
  };
  window.SelectaLB = LB;
})();
