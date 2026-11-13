/* Switch between the two saved views in the read-only product preview. */
(() => {
  const tabs = [...document.querySelectorAll('.bdlr-config-tabs [role="tab"]')];
  function activate(current, focus) {
    for (const tab of tabs) {
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (!panel) continue;
      const active = tab === current;
      panel.hidden = !active;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    }
    if (focus) current.focus();
  }
  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener('click', () => activate(tab, false));
    tab.addEventListener('keydown', event => {
      const dest = {ArrowRight:(index+1)%tabs.length,ArrowLeft:(index+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1}[event.key];
      if (dest === undefined) return;
      event.preventDefault();
      activate(tabs[dest], true);
    });
  }
})();
