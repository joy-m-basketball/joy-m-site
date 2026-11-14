// Joy-M – mobiel menu en header-schaduw bij scrollen
(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  var header = document.querySelector('[data-header]');

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 1241px)').addEventListener('change', function (mq) { if (mq.matches) setOpen(false); });
  }

  var banner = document.querySelector('[data-banner]');
  var bannerClose = document.querySelector('[data-banner-close]');
  if (banner && bannerClose) {
    bannerClose.addEventListener('click', function () {
      banner.hidden = true;
      try { sessionStorage.setItem('joym-banner', 'weg'); } catch (e) {}
    });
  }

  // Clubbeleid-navigatie: actieve pagina in beeld schuiven op smalle schermen
  var beleidActive = document.querySelector('.beleid-nav ul a[aria-current="page"]');
  if (beleidActive) {
    var strip = beleidActive.closest('.beleid-nav__inner');
    strip.scrollLeft = beleidActive.offsetLeft - (strip.clientWidth - beleidActive.offsetWidth) / 2;
  }

  // Donkere modus: knop wisselt en onthoudt de keuze; zonder keuze volgt de site het apparaat
  var root = document.documentElement;
  function setTheme(t, save) {
    root.setAttribute('data-theme', t);
    if (save) { try { localStorage.setItem('joym-theme', t); } catch (e) {} }
  }
  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });
  });
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function (e) {
      var saved = null;
      try { saved = localStorage.getItem('joym-theme'); } catch (err) {}
      if (saved !== 'light' && saved !== 'dark') setTheme(e.matches ? 'dark' : 'light', false);
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  }

  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
