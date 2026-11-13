// Joy-M – live wedstrijdprogramma en uitslagen via de openbare API van basketball.nl (Foys).
// Elk element met [data-wedstrijden] wordt gevuld:
//   data-wedstrijden="weekend"    → wedstrijden van dit/komend weekend (anders de eerstvolgende)
//   data-wedstrijden="uitslagen"  → laatste uitslagen (data-limit = aantal)
//   data-wedstrijden="overzicht"  → volledige pagina met tabbladen en teamfilter
(function () {
  'use strict';

  var API = 'https://api.foys.io/competition/public-api/v1';
  var nodes = document.querySelectorAll('[data-wedstrijden]');
  if (!nodes.length) return;

  var cfgEl = document.getElementById('joym-wedstrijden-config');
  var cfg = cfgEl ? JSON.parse(cfgEl.textContent) : {};
  var CLUB = cfg.club_id;
  var FED = cfg.federation_id;
  var TEAMS = {};                       // { "M18-1": "U18", ... } uit _data/teams.yml
  (cfg.teams || []).forEach(function (t) { if (t.code) TEAMS[t.code] = t.naam; });
  var NBB_URL = cfg.nbb_url || 'https://basketball.nl';

  var DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  var DAGEN_KORT = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
  var MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  var STATUS = { Cancelled: 'Afgelast', Canceled: 'Afgelast', Postponed: 'Uitgesteld', Forfeited: 'Reglementair', Forfeit: 'Reglementair' };

  // ---------- Hulpfuncties ----------
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(d, n) { var c = new Date(d); c.setDate(c.getDate() + n); return c; }
  function parseYmd(s) { var p = s.slice(0, 10).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function titleCase(s) { return String(s || '').toLowerCase().replace(/(^|[\s-])\S/g, function (m) { return m.toUpperCase(); }); }
  function time(m) { return (m.startTime || '').slice(0, 5); }
  function dateLabel(s) { var d = parseYmd(s); return DAGEN[d.getDay()] + ' ' + d.getDate() + ' ' + MAANDEN[d.getMonth()]; }

  function seasonStart(today) {
    var y = today.getMonth() >= 7 ? today.getFullYear() : today.getFullYear() - 1;
    return new Date(y, 7, 1); // 1 augustus
  }

  function fetchMatches(params) {
    var q = Object.keys(params).filter(function (k) { return params[k] != null; })
      .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
    return fetch(API + '/matches?organisationId=' + encodeURIComponent(CLUB) + '&' + q, {
      headers: { 'X-FederationID': FED, Accept: 'application/json' }
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (d) { return (d && d.items) || []; });
  }

  // ---------- Weergave van één wedstrijd ----------
  function isHome(m) { return m.homeOrganisation && m.homeOrganisation.id === CLUB; }
  function ownTeam(m) { return isHome(m) ? m.homeTeamName : m.awayTeamName; }

  function side(m, which) {
    var org = (m[which + 'Organisation'] || {}).name || '';
    var team = m[which + 'TeamName'] || '';
    var logo = m[which + 'LogoUrl'];
    var mine = (m[which + 'Organisation'] || {}).id === CLUB;
    var label = mine && TEAMS[team] ? TEAMS[team] : team;
    return '<span class="match__team' + (mine ? ' match__team--own' : '') + '">' +
      (logo ? '<img src="' + esc(logo) + '" alt="" width="32" height="32" loading="lazy">' : '<span class="match__nologo"></span>') +
      '<span class="match__names"><strong>' + esc(org) + '</strong><small>' + esc(label) + (mine && TEAMS[team] ? ' · ' + esc(team) : '') + '</small></span>' +
      '</span>';
  }

  function venue(m) {
    var a = m.address || {};
    var name = m.accommodationName || (m.accommodation || {}).name || '';
    var city = titleCase(a.city || '');
    if (!name && !city) return '';
    var q = a.latitude && a.longitude ? a.latitude + ',' + a.longitude
      : [name, a.address1, a.houseNumber, city].filter(Boolean).join(' ');
    var url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
    return '<a class="match__loc" href="' + url + '" target="_blank" rel="noopener">' +
      '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 1 7 7c0 5.2-6.2 12.2-6.5 12.5a.7.7 0 0 1-1 0C11.2 21.2 5 14.2 5 9a7 7 0 0 1 7-7Zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>' +
      esc(name) + (city ? ', ' + esc(city) : '') + (m.fieldName ? ' · ' + esc(m.fieldName) : '') + '</a>';
  }

  function matchRow(m, opts) {
    var home = isHome(m);
    var isFinal = m.status === 'Final' && m.homeScore != null && m.awayScore != null;
    var mid;
    if (isFinal) {
      var own = home ? m.homeScore : m.awayScore, other = home ? m.awayScore : m.homeScore;
      var res = own > other ? 'win' : own < other ? 'loss' : 'draw';
      mid = '<span class="match__score match__score--' + res + '" title="' + (res === 'win' ? 'Gewonnen' : res === 'loss' ? 'Verloren' : 'Gelijk') + '">' +
        '<span>' + esc(m.homeScore) + '</span><i>–</i><span>' + esc(m.awayScore) + '</span></span>';
    } else {
      mid = '<span class="match__vs">' + (STATUS[m.status] ? '<em>' + esc(STATUS[m.status]) + '</em>' : 'vs') + '</span>';
    }
    var d = parseYmd(m.date);
    var badges = '<span class="badge' + (home ? ' badge--orange' : '') + '">' + (home ? 'Thuis' : 'Uit') + '</span>' +
      (m.isFriendly ? '<span class="badge">Oefen</span>' : '');
    return '<li class="match' + (isFinal ? ' match--final' : '') + '">' +
      '<div class="match__when">' +
        (opts && opts.showDate ? '<span class="match__day">' + DAGEN_KORT[d.getDay()] + ' ' + d.getDate() + ' ' + MAANDEN[d.getMonth()].slice(0, 3) + '</span>' : '') +
        '<span class="match__time">' + esc(time(m)) + '</span>' +
      '</div>' +
      '<div class="match__teams">' + side(m, 'home') + mid + side(m, 'away') + '</div>' +
      '<div class="match__meta">' + badges + (isFinal ? "" : venue(m)) +
        (m.competition && m.competition.name ? '<span class="match__comp">' + esc(m.competition.name) + '</span>' : '') +
      '</div>' +
    '</li>';
  }

  function groupedList(items) {
    var html = '', current = null;
    items.forEach(function (m) {
      var day = m.date.slice(0, 10);
      if (day !== current) {
        if (current) html += '</ul>';
        html += '<h3 class="matches__date">' + dateLabel(day) + '</h3><ul class="matches">';
        current = day;
      }
      html += matchRow(m);
    });
    return html ? html + '</ul>' : '';
  }

  function flatList(items) {
    return '<ul class="matches">' + items.map(function (m) { return matchRow(m, { showDate: true }); }).join('') + '</ul>';
  }

  function empty(text) { return '<p class="matches__empty">' + text + '</p>'; }
  function failed(el) {
    el.innerHTML = '<p class="matches__empty">De wedstrijden konden niet worden geladen. Bekijk ze op <a href="' + esc(NBB_URL) + '" target="_blank" rel="noopener">basketball.nl</a>.</p>';
    el.setAttribute('aria-busy', 'false');
  }
  function done(el, html) { el.innerHTML = html; el.setAttribute('aria-busy', 'false'); }

  var today = new Date(); today.setHours(0, 0, 0, 0);
  var todayStr = ymd(today);

  // ---------- Weekend ----------
  function renderWeekend(el) {
    var dow = today.getDay();
    var friday = dow === 0 ? addDays(today, -2) : dow === 6 ? addDays(today, -1) : addDays(today, 5 - dow);
    var sunday = addDays(friday, 2);
    var start = friday < today ? today : friday;
    var title = el.parentNode.querySelector('[data-wedstrijden-titel]');

    fetchMatches({ startDate: todayStr, sorting: 'date asc, startTime asc', maxResultCount: 30 }).then(function (items) {
      items = items.filter(function (m) { return m.status !== 'Final'; });
      var weekend = items.filter(function (m) { var d = m.date.slice(0, 10); return d >= ymd(start) && d <= ymd(sunday); });
      if (weekend.length) {
        if (title) title.textContent = dow === 0 || dow === 6 ? 'Dit weekend' : 'Komend weekend';
        done(el, groupedList(weekend));
      } else if (items.length) {
        if (title) title.textContent = 'Eerstvolgende wedstrijden';
        done(el, groupedList(items.slice(0, +(el.dataset.limit || 5))));
      } else {
        done(el, empty('Er staan op dit moment geen wedstrijden gepland.'));
      }
    }).catch(function () { failed(el); });
  }

  // ---------- Laatste uitslagen ----------
  function renderResults(el) {
    var limit = +(el.dataset.limit || 5);
    fetchMatches({ startDate: ymd(seasonStart(today)), endDate: todayStr, sorting: 'date desc, startTime desc', maxResultCount: limit + 10 })
      .then(function (items) {
        items = items.filter(function (m) { return m.status === 'Final'; }).slice(0, limit);
        done(el, items.length ? flatList(items) : empty('Er zijn dit seizoen nog geen uitslagen.'));
      }).catch(function () { failed(el); });
  }

  // ---------- Volledig overzicht ----------
  function renderOverview(el) {
    var params = new URLSearchParams(location.search);
    var state = { tab: params.get('tab') === 'uitslagen' ? 'uitslagen' : 'programma', team: params.get('team') || '' };
    var data = { programma: null, uitslagen: null };
    var tabs = el.querySelectorAll('[data-tab]');
    var filters = el.querySelector('[data-filters]');
    var out = el.querySelector('[data-output]');

    function load(tab) {
      if (data[tab]) return Promise.resolve(data[tab]);
      var p = tab === 'programma'
        ? fetchMatches({ startDate: todayStr, sorting: 'date asc, startTime asc', maxResultCount: 200 })
            .then(function (i) { return i.filter(function (m) { return m.status !== 'Final'; }); })
        : fetchMatches({ startDate: ymd(seasonStart(today)), endDate: todayStr, sorting: 'date desc, startTime desc', maxResultCount: 200 })
            .then(function (i) { return i.filter(function (m) { return m.status === 'Final'; }); });
      return p.then(function (items) { data[tab] = items; return items; });
    }

    function syncUrl() {
      var p = new URLSearchParams();
      if (state.tab !== 'programma') p.set('tab', state.tab);
      if (state.team) p.set('team', state.team);
      var qs = p.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
    }

    function draw() {
      tabs.forEach(function (t) {
        var on = t.dataset.tab === state.tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      out.setAttribute('aria-busy', 'true');
      out.innerHTML = '<p class="matches__loading">Wedstrijden laden…</p>';
      load(state.tab).then(function (items) {
        var codes = [];
        items.forEach(function (m) { var c = ownTeam(m); if (codes.indexOf(c) < 0) codes.push(c); });
        codes.sort();
        if (state.team && codes.indexOf(state.team) < 0) codes.push(state.team);
        filters.innerHTML = ['', ].concat(codes).map(function (c) {
          var label = c ? (TEAMS[c] || c) : 'Alle teams';
          return '<button type="button" class="chip" data-team="' + esc(c) + '" aria-pressed="' + (state.team === c) + '">' + esc(label) + '</button>';
        }).join('');
        var list = state.team ? items.filter(function (m) { return ownTeam(m) === state.team; }) : items;
        done(out, list.length ? groupedList(list)
          : empty(state.tab === 'programma' ? 'Er staan geen wedstrijden gepland.' : 'Er zijn dit seizoen nog geen uitslagen.'));
      }).catch(function () { failed(out); });
    }

    el.addEventListener('click', function (e) {
      var t = e.target.closest('[data-tab]');
      if (t) { state.tab = t.dataset.tab; syncUrl(); draw(); return; }
      var f = e.target.closest('[data-team]');
      if (f) { state.team = f.dataset.team; syncUrl(); draw(); }
    });
    el.querySelector('[role="tablist"]').addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      state.tab = state.tab === 'programma' ? 'uitslagen' : 'programma';
      syncUrl(); draw();
      el.querySelector('[data-tab="' + state.tab + '"]').focus();
    });
    draw();
  }

  nodes.forEach(function (el) {
    var type = el.dataset.wedstrijden;
    if (!CLUB || !FED) return failed(el);
    if (type === 'weekend') renderWeekend(el);
    else if (type === 'uitslagen') renderResults(el);
    else if (type === 'overzicht') renderOverview(el);
  });
})();
