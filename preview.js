/* Navigation and image inspection for the offline design copy. */
(() => {
  const device = document.documentElement.dataset.previewDevice;
  const narrow = matchMedia('(max-width: 767px)');
  function alignDevice() {
    const desired = narrow.matches ? 'sp' : 'pc';
    if (desired === device) return false;
    const dest = new URL(location.href);
    dest.pathname = dest.pathname.replace(/\/(?:pc|sp)\/([^/]+)$/, '/' + desired + '/$1');
    if (dest.pathname === location.pathname) return false;
    location.replace(dest.href);
    return true;
  }
  if (alignDevice()) return;
  narrow.addEventListener('change', alignDevice);

  const drawer = document.querySelector('[data-bdlr-mobile-drawer]');
  const drawerToggle = document.querySelector('[data-bdlr-drawer-open]');
  const shell = document.querySelector('[data-bdlr-mega-shell]');
  const search = document.getElementById('bdlr-header-search');
  const scrim = document.querySelector('[data-bdlr-scrim]');
  let returnFocus;
  function menus(active, trigger) {
    if (trigger) returnFocus = trigger;
    const isDrawer = active === 'drawer';
    const isMega = ['products','feature','parts','support'].includes(active);
    drawer?.classList.toggle('is-open', isDrawer);
    drawer?.setAttribute('aria-hidden', String(!isDrawer));
    drawerToggle?.setAttribute('aria-expanded', String(isDrawer));
    document.body.classList.toggle('bdlr-menu-open', isDrawer);
    shell?.classList.toggle('is-open', isMega);
    shell?.setAttribute('aria-hidden', String(!isMega));
    for (const panel of document.querySelectorAll('[data-bdlr-mega-panel]')) {
      const show = panel.dataset.bdlrMegaPanel === active;
      panel.hidden = !show;
      panel.classList.toggle('is-active', show);
    }
    for (const btn of document.querySelectorAll('[data-bdlr-mega-trigger]')) {
      const expanded = btn.dataset.bdlrMegaTrigger === active;
      btn.classList.toggle('is-active', expanded);
      btn.setAttribute('aria-expanded', String(expanded));
    }
    if (search && matchMedia('(max-width: 980px)').matches) {
      search.hidden = active !== 'search';
      document.querySelectorAll('[data-bdlr-search-open]').forEach(btn =>
        btn.setAttribute('aria-expanded', String(!search.hidden)));
    }
    scrim?.classList.toggle('is-visible', Boolean(active));
    if (isDrawer) drawer?.querySelector('[data-bdlr-drawer-close]')?.focus();
    if (active === 'search') search?.querySelector('input')?.focus();
    if (!active) returnFocus?.focus();
  }

  document.addEventListener('click', evt => {
    const button = evt.target.closest('button,[data-bdlr-scrim]');
    if (!button) return;
    if (button.hasAttribute('data-bdlr-drawer-open')) menus('drawer', button);
    if (button.hasAttribute('data-bdlr-search-open')) menus('search', button);
    if (button.hasAttribute('data-bdlr-mega-trigger')) {
      menus(button.getAttribute('aria-expanded') === 'true' ? null : button.dataset.bdlrMegaTrigger, button);
    }
    if (button.matches('[data-bdlr-scrim],[data-bdlr-drawer-close],[data-bdlr-search-close]')) menus(null);
    const strip = button.closest('.item-image-small');
    if (strip) {
      const selected = button.querySelector('img');
      const hero = document.querySelector('.item-image-large img');
      if (!selected || !hero) return;
      hero.src = selected.currentSrc || selected.src;
      hero.alt = selected.alt;
      const options = Array.from(strip.querySelectorAll('button'));
      for (const option of options) {
        option.setAttribute('aria-pressed', String(option === button));
        option.closest('li')?.classList.toggle('is-current', option === button);
      }
      const counter = document.querySelector('.bdlr-gallery-counter');
      if (counter) counter.textContent = (options.indexOf(button) + 1) + ' / ' + options.length;
    }
  });
  document.addEventListener('keydown', evt => {
    if (evt.key === 'Escape' && (drawer?.classList.contains('is-open') || shell?.classList.contains('is-open') || returnFocus)) {
      menus(null);
      returnFocus = null;
    }
  });
})();
