/* =====================================================================
   MERCH — l'app boutique du téléphone Selecta
   ---------------------------------------------------------------------
   - Accueil : recherche, filtre par artiste, grille d'articles (photo, prix).
   - Fiche article : carrousel de photos, prix, tailles, description,
     « Acheter » → page de l'article sur la boutique officielle.
   - Données : Shopify Storefront API en direct si un jeton est fourni
     (merch-config.js), sinon le catalogue manuel. Dernier catalogue reçu
     gardé en cache : l'app s'affiche instantanément, puis se met à jour.
   - Aucun faux produit : un artiste sans boutique affiche « Collection à venir ».
   ===================================================================== */
(function () {
  'use strict';
  var root = document.getElementById('mc');
  var phone = document.getElementById('phone');
  if (!root || !phone) return;
  var CFG = window.SELECTA_MERCH || { artists: {} };
  var ORDER = ['satine', 'filiz', 'mitty'];
  var EN = function () { return (document.documentElement.lang || 'fr').indexOf('en') === 0; };
  var T = function (fr, en) { return EN() ? en : fr; };
  var CHEV = '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.6 5.4L8 12l6.6 6.6"/></svg>';
  var HEART = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M12 20.3l-1.2-1.1C6.3 15.1 3.3 12.4 3.3 9a4.6 4.6 0 0 1 8.7-2.1A4.6 4.6 0 0 1 20.7 9c0 3.4-3 6.1-7.5 10.2z"/></svg>';
  var CHECK = '<svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M7.5 12.3l3 3 6-6.3" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var OUT = '<svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
  var SEARCH = '<svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function artist(id) { return (window.__ARTISTS || []).filter(function (a) { return a.id === id; })[0] || { id: id, name: id.charAt(0).toUpperCase() + id.slice(1) }; }
  function ig(a) { var l = (a.links || []).filter(function (x) { return x.k === 'ig'; })[0]; return l ? l.h : null; }
  function money(n, cur) {
    try { return new Intl.NumberFormat(EN() ? 'en-GB' : 'fr-FR', { style: 'currency', currency: cur || 'EUR', minimumFractionDigits: n % 1 ? 2 : 0 }).format(n); }
    catch (e) { return n + ' €'; }
  }

  /* ------------------------------------------------------------------ */
  /*  Données                                                            */
  /* ------------------------------------------------------------------ */
  var CACHE_KEY = 'selecta-merch-v2';
  var cache = store(CACHE_KEY) || {};
  var DATA = {};          /* id artiste → { products:[], live:bool, at:ms } */
  var syncing = {};

  function fromManual(id, conf) {
    return (conf.products || []).map(function (p) {
      return {
        id: p.id, artist: id, title: p.title, subtitle: p.subtitle || '', category: p.category || '',
        description: p.description || '', price: p.price, compare: p.compareAt || null, currency: p.currency || 'EUR',
        available: p.available !== false, images: (p.images || []).map(function (u) { return { src: u, alt: p.title }; }),
        options: p.options || [], variants: p.variants || [], url: p.url || conf.shop,
        look: p.look || '', credit: p.credit || '', match: p.match || ''
      };
    });
  }
  function load() {
    ORDER.forEach(function (id) {
      var conf = CFG.artists[id] || {};
      if (!conf.shop) { DATA[id] = { products: [], live: false }; return; }
      var c = cache[id];
      if (conf.domain && c && c.raw) DATA[id] = { products: merge(id, conf, c.raw), live: true, at: c.at };   /* dernier catalogue reçu */
      else DATA[id] = { products: fromManual(id, conf), live: false };
    });
  }
  /* Les fiches de l'agence (textes, prix, photos officiels) restent prioritaires ; la boutique y ajoute
     le lien exact, les tailles et la disponibilité. Ses autres articles s'ajoutent à la suite. */
  function norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function merge(id, conf, raw) {
    var used = {};
    /* Articles de la boutique à ne pas afficher (doublons d'une fiche de l'agence) :
       conf.exclude = ['mot-clé du titre', ...] */
    if (conf.exclude && conf.exclude.length) {
      raw = raw.filter(function (r) {
        var t = norm(r.title);
        return !conf.exclude.some(function (k) { return t.indexOf(norm(k)) > -1; });
      });
    }
    var list = fromManual(id, conf).map(function (m) {
      var key = norm(m.match || m.title);
      var L = raw.filter(function (r) { return !used[r.id] && norm(r.title).indexOf(key) > -1; })[0];
      if (!L) return m;
      used[L.id] = true;
      m.url = L.url; m.available = L.available; m.variants = L.variants; m.options = L.options;
      if (L.price) m.price = L.price;                 /* le prix payé est celui de la boutique */
      if (!m.images.length) m.images = L.images;
      return m;
    });
    raw.forEach(function (r) { if (!used[r.id]) list.push(r); });
    return list;
  }
  /* Shopify Storefront API (GraphQL, prévu pour être appelé depuis un navigateur) */
  /* requête volontairement légère : l'accès sans jeton est limité à une complexité de 1 000 */
  var QUERY = 'query{products(first:20,sortKey:BEST_SELLING){nodes{id title handle description productType onlineStoreUrl availableForSale ' +
    'priceRange{minVariantPrice{amount currencyCode}} compareAtPriceRange{maxVariantPrice{amount currencyCode}} ' +
    'images(first:6){nodes{url altText width height}} options{name values} ' +
    'variants(first:25){nodes{id title availableForSale price{amount currencyCode} selectedOptions{name value}}}}}}';
  function sync(id, force) {
    var conf = CFG.artists[id] || {};
    if (!conf.domain || syncing[id]) return;
    var c = DATA[id];
    if (!force && c && c.live && Date.now() - (c.at || 0) < 5 * 60 * 1000) return;
    syncing[id] = true;
    /* Storefront API de Shopify : sans jeton (accès « tokenless » aux produits), ou avec le jeton public s'il est fourni */
    var headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    if (conf.token) headers['X-Shopify-Storefront-Access-Token'] = conf.token;
    fetch('https://' + conf.domain + '/api/' + (CFG.apiVersion || '2026-10') + '/graphql.json', {
      method: 'POST', headers: headers,
      body: JSON.stringify({ query: QUERY })
    }).then(function (r) { return r.json(); }).then(function (j) {
      var nodes = j && j.data && j.data.products && j.data.products.nodes;
      if (!nodes || !nodes.length) throw new Error('shopify');
      var shopBase = 'https://' + conf.domain;
      var list = nodes.map(function (n) {
        var cur = n.priceRange.minVariantPrice.currencyCode;
        var cmp = n.compareAtPriceRange && n.compareAtPriceRange.maxVariantPrice ? +n.compareAtPriceRange.maxVariantPrice.amount : 0;
        var opts = (n.options || []).filter(function (o) { return !(o.values.length === 1 && /^(title|titre)$/i.test(o.name)); });
        return {
          id: n.id, artist: id, title: n.title, subtitle: '', category: n.productType || '', description: n.description || '',
          price: +n.priceRange.minVariantPrice.amount, compare: cmp > +n.priceRange.minVariantPrice.amount ? cmp : null, currency: cur,
          available: !!n.availableForSale,
          images: n.images.nodes.map(function (i) { return { src: i.url, alt: i.altText || n.title }; }),
          options: opts.map(function (o) { return { name: o.name, values: o.values }; }),
          variants: n.variants.nodes.map(function (v) {
            var o = {}; v.selectedOptions.forEach(function (s) { o[s.name] = s.value; });
            return { id: String(v.id).split('/').pop(), title: v.title, available: !!v.availableForSale, price: +v.price.amount, options: o };
          }),
          url: n.onlineStoreUrl || (shopBase + '/products/' + n.handle)
        };
      });
      DATA[id] = { products: merge(id, conf, list), live: true, at: Date.now() };
      cache[id] = { raw: list, at: DATA[id].at }; store(CACHE_KEY, cache);
    }).catch(function () {
      /* hors ligne ou jeton invalide : on garde le cache, sinon le catalogue manuel */
      if (!DATA[id] || !DATA[id].products.length) DATA[id] = { products: fromManual(id, conf), live: false };
    }).then(function () { syncing[id] = false; if (open) renderHome(true); });
  }

  /* ------------------------------------------------------------------ */
  /*  État de l'interface                                                */
  /* ------------------------------------------------------------------ */
  var FAV_KEY = 'selecta-merch-fav';
  var favs = store(FAV_KEY) || {};
  var ui = { filter: 'all', q: '', favs: false };
  var open = false;

  function all() {
    var out = [];
    ORDER.forEach(function (id) { (DATA[id] ? DATA[id].products : []).forEach(function (p) { out.push(p); }); });
    return out;
  }
  function find(pid) { return all().filter(function (p) { return p.id === pid; })[0]; }

  /* ------------------------------------------------------------------ */
  /*  Gabarit                                                            */
  /* ------------------------------------------------------------------ */
  root.innerHTML =
    '<div class="mc-page mc-home" id="mc-home">' +
      '<header class="mc-top">' +
        '<button type="button" class="bk" data-open="home" aria-label="Accueil">' + CHEV + '</button>' +
        '<button type="button" class="mc-favbtn" id="mc-favbtn" aria-pressed="false">' + HEART + '<span id="mc-favn"></span></button>' +
      '</header>' +
      '<div class="mc-scroll" id="mc-scroll">' +
        '<div class="mc-hero-title"><h2>Merch</h2><p id="mc-tag"></p></div>' +
        '<label class="mc-search">' + SEARCH + '<input id="mc-q" type="search" autocomplete="off" enterkeyhint="search"></label>' +
        '<div class="mc-chips" id="mc-chips" role="tablist"></div>' +
        '<div id="mc-list"></div>' +
      '</div>' +
    '</div>' +
    '<div class="mc-page mc-product" id="mc-product" aria-hidden="true"></div>';

  var home = document.getElementById('mc-home'), prod = document.getElementById('mc-product');
  var listEl = document.getElementById('mc-list'), chipsEl = document.getElementById('mc-chips');
  var qEl = document.getElementById('mc-q'), favBtn = document.getElementById('mc-favbtn');

  function card(p) {
    var img = p.images[0];
    var a = artist(p.artist);
    return '<article class="mc-card' + (p.available ? '' : ' out') + (p.look ? ' look-' + p.look : '') + '">' +
      '<button type="button" class="mc-open" data-pid="' + esc(p.id) + '" aria-label="' + esc(p.title + ', ' + money(p.price, p.currency)) + '">' +
        '<span class="mc-img">' + (img ? '<img src="' + esc(img.src) + '" alt="" loading="lazy" decoding="async">' : '') +
          '<span class="mc-ph" aria-hidden="true">' + esc(p.title.charAt(0)) + '</span>' +
          (p.available ? '' : '<span class="mc-badge">' + T('Épuisé', 'Sold out') + '</span>') +
        '</span>' +
        '<span class="mc-meta"><b>' + money(p.price, p.currency) + (p.compare ? ' <s>' + money(p.compare, p.currency) + '</s>' : '') + '</b>' +
          '<span class="mc-name">' + esc(p.title) + '</span>' +
          '<small>' + esc(p.subtitle || p.category || a.name) + '</small></span>' +
      '</button>' +
      '<button type="button" class="mc-heart' + (favs[p.id] ? ' on' : '') + '" data-fav="' + esc(p.id) + '" aria-pressed="' + (favs[p.id] ? 'true' : 'false') + '" aria-label="' + T('Favori', 'Favourite') + '">' + HEART + '</button>' +
    '</article>';
  }
  function grid(list) { return '<div class="mc-grid">' + list.map(card).join('') + '</div>'; }
  function shopHead(id, n) {
    var a = artist(id), conf = CFG.artists[id] || {}, d = DATA[id] || {};
    return '<div class="mc-shop">' +
      '<span class="mc-av" style="background-image:url(' + esc(a.photo || '') + ')"></span>' +
      '<span class="mc-shop-t"><b>' + esc(a.name) + ' <i class="mc-ok">' + CHECK + '</i></b>' +
        '<small>' + (d.live ? '<i class="mc-dot" title="' + T('Synchronisé avec la boutique', 'Synced with the store') + '"></i>' : '') +
        T('Boutique officielle', 'Official store') + ' · ' + n + ' ' + T(n > 1 ? 'articles' : 'article', n > 1 ? 'items' : 'item') + '</small></span>' +
      '<a class="mc-shop-go" href="' + esc(conf.shop) + '" target="_blank" rel="noopener">' + esc(conf.shopLabel || T('Boutique', 'Store')) + OUT + '</a>' +
    '</div>';
  }
  function soon(id, big) {
    var a = artist(id), link = ig(a);
    return '<div class="mc-soon' + (big ? ' big' : '') + '">' +
      '<span class="mc-av" style="background-image:url(' + esc(a.photo || '') + ')"></span>' +
      '<span class="mc-soon-t"><b>' + esc(a.name) + '</b><small>' + T('Première collection à venir', 'First collection coming soon') + '</small></span>' +
      (link ? '<a href="' + esc(link) + '" target="_blank" rel="noopener">' + T('Être prévenu', 'Get notified') + '</a>' : '') +
    '</div>';
  }

  function renderChips() {
    var items = [['all', T('Tout', 'All')]].concat(ORDER.map(function (id) { return [id, artist(id).name]; }));
    chipsEl.innerHTML = items.map(function (it) {
      var on = ui.filter === it[0] && !ui.favs, a = it[0] !== 'all' ? artist(it[0]) : null;
      var empty = a && !(DATA[it[0]] && DATA[it[0]].products.length);
      return '<button type="button" role="tab" class="mc-chip' + (on ? ' on' : '') + (empty ? ' soon' : '') + '" data-f="' + it[0] + '" aria-selected="' + on + '">' +
        (a ? '<span class="mc-cav" style="background-image:url(' + esc(a.photo || '') + ')"></span>' : '') + esc(it[1]) + '</button>';
    }).join('');
  }
  function match(p) {
    if (!ui.q) return true;
    var q = ui.q.toLowerCase();
    return (p.title + ' ' + p.subtitle + ' ' + p.category + ' ' + artist(p.artist).name).toLowerCase().indexOf(q) > -1;
  }
  function renderHome(keepScroll) {
    var sc = document.getElementById('mc-scroll'), y = sc.scrollTop;
    document.getElementById('mc-tag').textContent = T('Les boutiques officielles des artistes Selecta', 'Official stores of the Selecta artists');
    qEl.placeholder = T('Rechercher un article', 'Search items');
    var nf = Object.keys(favs).filter(function (k) { return favs[k] && find(k); }).length;
    document.getElementById('mc-favn').textContent = nf ? nf : '';
    favBtn.setAttribute('aria-pressed', ui.favs ? 'true' : 'false');
    favBtn.setAttribute('aria-label', T('Mes favoris', 'My favourites'));
    favBtn.classList.toggle('on', ui.favs);
    renderChips();
    var html = '';
    if (ui.favs) {
      var fl = all().filter(function (p) { return favs[p.id]; }).filter(match);
      html = '<h3 class="mc-h">' + T('Mes favoris', 'My favourites') + '</h3>' + (fl.length ? grid(fl)
        : '<p class="mc-empty">' + T('Touche le cœur d’un article pour le retrouver ici.', 'Tap the heart on an item to keep it here.') + '</p>');
    } else if (ui.filter === 'all') {
      ORDER.forEach(function (id) {
        var l = (DATA[id] ? DATA[id].products : []).filter(match);
        if (l.length) html += shopHead(id, DATA[id].products.length) + grid(l);
      });
      if (!html && ui.q) html = '<p class="mc-empty">' + T('Aucun article ne correspond.', 'No item matches.') + '</p>';
      var coming = ORDER.filter(function (id) { return !(DATA[id] && DATA[id].products.length); });
      if (coming.length && !ui.q) html += '<h3 class="mc-h">' + T('Bientôt', 'Coming soon') + '</h3>' + coming.map(function (id) { return soon(id); }).join('');
    } else {
      var id = ui.filter, d = DATA[id] || { products: [] }, l2 = d.products.filter(match);
      if (!d.products.length) html = soon(id, true);
      else html = shopHead(id, d.products.length) + (l2.length ? grid(l2) : '<p class="mc-empty">' + T('Aucun article ne correspond.', 'No item matches.') + '</p>');
    }
    listEl.innerHTML = html;
    listEl.querySelectorAll('.mc-img img').forEach(function (im) {
      function ok() { im.classList.add('on'); }
      if (im.complete && im.naturalWidth) ok(); else { im.onload = ok; im.onerror = function () { im.remove(); }; }
    });
    sc.scrollTop = keepScroll ? y : 0;
  }

  /* ------------------------------------------------------------------ */
  /*  Fiche article                                                      */
  /* ------------------------------------------------------------------ */
  var cur = null, sel = {};
  function variantFor(p) {
    if (!p.variants.length) return null;
    if (!p.options.length) return p.variants[0];
    return p.variants.filter(function (v) { return p.options.every(function (o) { return v.options[o.name] === sel[o.name]; }); })[0] || null;
  }
  function optAvailable(p, name, value) {
    if (!p.variants.length) return true;
    return p.variants.some(function (v) { return v.options[name] === value && v.available; });
  }
  function buyUrl(p) {
    var v = variantFor(p);
    if (v && /\/products\//.test(p.url)) return p.url + (p.url.indexOf('?') > -1 ? '&' : '?') + 'variant=' + encodeURIComponent(v.id);
    return p.url;
  }
  function renderProduct() {
    var p = cur; if (!p) return;
    var a = artist(p.artist), conf = CFG.artists[p.artist] || {}, v = variantFor(p);
    var price = v ? v.price : p.price, avail = v ? v.available : p.available;
    var imgs = p.images.length ? p.images : [{ src: '', alt: p.title }];
    prod.innerHTML =
      '<div class="mc-pscroll" id="mc-pscroll">' +
        '<div class="mc-gal' + (p.look ? ' look-' + p.look : '') + '"><div class="mc-scrim" aria-hidden="true"></div>' +
          '<div class="mc-track" id="mc-track">' + imgs.map(function (im, i) {
            return '<div class="mc-slide"><span class="mc-ph" aria-hidden="true">' + esc(p.title.charAt(0)) + '</span>' +
              (im.src ? '<img src="' + esc(im.src) + '" alt="' + esc(im.alt || p.title) + '"' + (i ? ' loading="lazy"' : '') + '>' : '') + '</div>';
          }).join('') + '</div>' +
          (imgs.length > 1 ? '<div class="mc-dots" id="mc-dots">' + imgs.map(function (_, i) { return '<i' + (i ? '' : ' class="on"') + '></i>'; }).join('') + '</div>' : '') +
        '</div>' +
        '<div class="mc-pbody">' +
          '<div class="mc-ptitle"><h2>' + esc(p.title) + '</h2>' + (p.subtitle ? '<p>' + esc(p.subtitle) + '</p>' : '') + '</div>' +
          '<div class="mc-price"><b>' + money(price, p.currency) + '</b>' + (p.compare ? '<s>' + money(p.compare, p.currency) + '</s>' : '') +
            '<span class="mc-stock' + (avail ? '' : ' out') + '">' + (avail ? T('Disponible', 'In stock') : T('Épuisé', 'Sold out')) + '</span></div>' +
          '<p class="mc-fine">' + T('Paiement et livraison sur la boutique officielle.', 'Checkout and shipping on the official store.') + '</p>' +
          p.options.map(function (o) {
            return '<div class="mc-opt"><span class="mc-lab">' + esc(o.name) + '</span><div class="mc-vals">' + o.values.map(function (val) {
              var ok = optAvailable(p, o.name, val);
              return '<button type="button" class="mc-val' + (sel[o.name] === val ? ' on' : '') + (ok ? '' : ' na') + '" data-o="' + esc(o.name) + '" data-v="' + esc(val) + '"' + (ok ? '' : ' aria-disabled="true"') + '>' + esc(val) + '</button>';
            }).join('') + '</div></div>';
          }).join('') +
          '<a class="mc-seller" href="#" data-artist="' + esc(p.artist) + '">' +
            '<span class="mc-av" style="background-image:url(' + esc(a.photo || '') + ')"></span>' +
            '<span><b>' + esc(a.name) + ' <i class="mc-ok">' + CHECK + '</i></b><small>' + T('Boutique officielle', 'Official store') + ' · ' + esc(conf.shopLabel || '') + '</small></span>' +
            '<i class="mc-go" aria-hidden="true">›</i></a>' +
          (p.description ? '<div class="mc-desc"><span class="mc-lab">' + T('Description', 'Description') + '</span><p>' + esc(p.description).replace(/\n+/g, '<br>') + '</p>' +
            (p.credit ? '<p class="mc-credit">' + esc(p.credit) + '</p>' : '') + '</div>' : '') +
          '<dl class="mc-dl">' +
            (p.category ? '<div><dt>' + T('Catégorie', 'Category') + '</dt><dd>' + esc(p.category) + '</dd></div>' : '') +
            '<div><dt>' + T('Artiste', 'Artist') + '</dt><dd>' + esc(a.name) + '</dd></div>' +
            '<div><dt>' + T('Vendu par', 'Sold by') + '</dt><dd>' + esc(conf.shopLabel || '') + '</dd></div>' +
          '</dl>' +
        '</div>' +
      '</div>' +
      '<div class="mc-pbar-top" id="mc-pbar">' +
        '<button type="button" class="bk mc-back" aria-label="' + T('Retour', 'Back') + '">' + CHEV + '</button>' +
        '<span class="mc-pbar-t">' + esc(p.title) + '</span>' +
        '<button type="button" class="mc-heart big' + (favs[p.id] ? ' on' : '') + '" data-fav="' + esc(p.id) + '" aria-pressed="' + (favs[p.id] ? 'true' : 'false') + '" aria-label="' + T('Favori', 'Favourite') + '">' + HEART + '</button>' +
      '</div>' +
      '<div class="mc-buybar">' +
        '<span class="mc-buyprice"><small>' + esc(p.title) + '</small><b>' + money(price, p.currency) + '</b></span>' +
        (avail
          ? '<a class="mc-buy" href="' + esc(buyUrl(p)) + '" target="_blank" rel="noopener">' + T('Acheter', 'Buy') + OUT + '</a>'
          : '<a class="mc-buy out" href="' + esc(p.url) + '" target="_blank" rel="noopener">' + T('Épuisé · voir la boutique', 'Sold out · view store') + '</a>') +
      '</div>';
    prod.querySelectorAll('.mc-slide img').forEach(function (im) {
      function ok() { im.classList.add('on'); }
      if (im.complete && im.naturalWidth) ok(); else { im.onload = ok; im.onerror = function () { im.remove(); }; }
    });
    /* en faisant défiler la fiche, l'en-tête devient opaque (titre au centre) et la barre d'état s'adapte */
    var ps = document.getElementById('mc-pscroll'), bar = document.getElementById('mc-pbar'), gal = prod.querySelector('.mc-gal'), solid = null;
    function onScroll() {
      var s2 = ps.scrollTop > 40;           /* dès que le voile quitte l'écran */
      if (s2 !== solid) { solid = s2; bar.classList.toggle('solid', s2); if (window.__barTone) window.__barTone(); }
    }
    ps.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    var track = document.getElementById('mc-track'), dots = document.getElementById('mc-dots');
    if (track && dots) track.addEventListener('scroll', function () {
      var i = Math.round(track.scrollLeft / (track.clientWidth || 1));
      Array.prototype.forEach.call(dots.children, function (d, k) { d.classList.toggle('on', k === i); });
    }, { passive: true });
  }
  function showProduct(pid) {
    var p = find(pid); if (!p) return;
    cur = p; sel = {};
    p.options.forEach(function (o) {
      var first = o.values.filter(function (v) { return optAvailable(p, o.name, v); })[0] || o.values[0];
      sel[o.name] = first;
    });
    renderProduct();
    var ps = document.getElementById('mc-pscroll'); if (ps) ps.scrollTop = 0;
    prod.setAttribute('aria-hidden', 'false');
    if (!root.classList.contains('pushed') && window.__histPush) window.__histPush({ mc: pid });
    else if (window.history && history.replaceState && history.state && history.state.mc) history.replaceState(Object.assign({}, history.state, { mc: pid }), '');
    root.classList.add('pushed');
    setTimeout(function () { if (window.__barTone) window.__barTone(); }, 470);
  }
  function hideProduct(fromHistory) {
    if (!root.classList.contains('pushed')) return;
    if (!fromHistory && window.history && history.state && history.state.mc) { history.back(); return; }   /* le popstate refermera la fiche */
    root.classList.remove('pushed');
    prod.setAttribute('aria-hidden', 'true');
    prod.style.transform = ''; home.style.transform = '';
    setTimeout(function () { if (!root.classList.contains('pushed')) { prod.innerHTML = ''; cur = null; } if (window.__barTone) window.__barTone(); }, 470);
  }

  /* ------------------------------------------------------------------ */
  /*  Interactions                                                       */
  /* ------------------------------------------------------------------ */
  function toggleFav(pid) {
    favs[pid] = !favs[pid]; if (!favs[pid]) delete favs[pid];
    store(FAV_KEY, favs);
    root.querySelectorAll('[data-fav="' + (window.CSS && CSS.escape ? CSS.escape(pid) : pid) + '"]').forEach(function (b) {
      b.classList.toggle('on', !!favs[pid]); b.setAttribute('aria-pressed', favs[pid] ? 'true' : 'false');
      b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    });
    var nf = Object.keys(favs).filter(function (k) { return favs[k] && find(k); }).length;
    document.getElementById('mc-favn').textContent = nf ? nf : '';
    if (ui.favs && !favs[pid]) renderHome(true);
  }
  root.addEventListener('click', function (e) {
    var t = e.target.closest('button, a'); if (!t || !root.contains(t)) return;
    if (t.hasAttribute('data-fav')) { e.preventDefault(); toggleFav(t.getAttribute('data-fav')); return; }
    if (t.classList.contains('mc-open')) { showProduct(t.getAttribute('data-pid')); return; }
    if (t.classList.contains('mc-back')) { hideProduct(); return; }
    if (t.classList.contains('mc-chip')) { ui.filter = t.getAttribute('data-f'); ui.favs = false; renderHome(); return; }
    if (t === favBtn) { ui.favs = !ui.favs; renderHome(); return; }
    if (t.classList.contains('mc-val')) {
      if (t.getAttribute('aria-disabled') === 'true') return;
      sel[t.getAttribute('data-o')] = t.getAttribute('data-v');
      var y = (document.getElementById('mc-pscroll') || {}).scrollTop || 0, x = (document.getElementById('mc-track') || {}).scrollLeft || 0;
      renderProduct();
      var ps = document.getElementById('mc-pscroll'); if (ps) ps.scrollTop = y;
      var tr = document.getElementById('mc-track'); if (tr) tr.scrollLeft = x;
      return;
    }
    if (t.classList.contains('mc-seller')) { e.preventDefault(); ui.filter = t.getAttribute('data-artist'); ui.favs = false; renderHome(); hideProduct(); return; }
  });
  qEl.addEventListener('input', function () { ui.q = qEl.value.trim(); renderHome(true); });

  /* La fiche est une étape de l'historique : le bouton retour du navigateur et le geste
     « glisser depuis le bord » de Safari / Android ramènent à la liste, sans quitter l'app. */
  window.addEventListener('popstate', function (e) {
    if (root.classList.contains('pushed') && !(e.state && e.state.mc)) hideProduct(true);
  });

  /* ouverture / fermeture de l'app */
  document.addEventListener('app:screen', function (e) {
    var now = e.detail === 'merch';
    if (now && !open) { open = true; ORDER.forEach(function (id) { sync(id); }); renderHome(); }
    if (!now && open) {
      open = false;
      if (root.classList.contains('pushed')) {        /* l'app se referme : on revient à la liste sans animation */
        root.classList.add('dragging'); root.classList.remove('pushed'); prod.setAttribute('aria-hidden', 'true');
        setTimeout(function () { root.classList.remove('dragging'); prod.innerHTML = ''; cur = null; }, 520);
      }
    }
  });
  /* depuis la fiche, l'app reste sur l'article : on referme proprement en quittant le téléphone */
  new MutationObserver(function () { if (open) { renderHome(true); if (cur) renderProduct(); } })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  load();
  renderHome();
  window.__merch = { data: function () { return DATA; }, open: showProduct, back: hideProduct, sync: sync };
})();
