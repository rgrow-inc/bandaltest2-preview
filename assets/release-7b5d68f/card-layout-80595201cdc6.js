/* Supplement the design CSS with the markup that the real storefront generates after load. */
(() => {
  'use strict';
  const root = document.documentElement;
  if (root.hasAttribute('data-bandal-parity')) return;
  const stars = ["M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z", "M237.28,97.87A14.18,14.18,0,0,0,224.76,88l-60.25-4.87-23.22-56.2a14.37,14.37,0,0,0-26.58,0L91.49,83.11,31.24,88a14.18,14.18,0,0,0-12.52,9.89A14.43,14.43,0,0,0,23,113.32L69,152.93l-14,59.25a14.4,14.4,0,0,0,5.59,15,14.1,14.1,0,0,0,15.91.6L128,196.12l51.58,31.71a14.1,14.1,0,0,0,15.91-.6,14.4,14.4,0,0,0,5.59-15l-14-59.25L233,113.32A14.43,14.43,0,0,0,237.28,97.87Zm-12.14,6.37-48.69,42a6,6,0,0,0-1.92,5.92l14.88,62.79a2.35,2.35,0,0,1-.95,2.57,2.24,2.24,0,0,1-2.6.1L131.14,184a6,6,0,0,0-6.28,0L70.14,217.61a2.24,2.24,0,0,1-2.6-.1,2.35,2.35,0,0,1-1-2.57l14.88-62.79a6,6,0,0,0-1.92-5.92l-48.69-42a2.37,2.37,0,0,1-.73-2.65,2.28,2.28,0,0,1,2.07-1.65l63.92-5.16a6,6,0,0,0,5.06-3.69l24.63-59.6a2.35,2.35,0,0,1,4.38,0l24.63,59.6a6,6,0,0,0,5.06,3.69l63.92,5.16a2.28,2.28,0,0,1,2.07,1.65A2.37,2.37,0,0,1,225.14,104.24Z"];
  function refreshRatings(area) {
    const targets = area.querySelectorAll('.bdlr-legacy-review-rating > span[aria-hidden], .bdlr-review-score > span[aria-hidden], .bdlr-review-distribution__row > span:first-child');
    for (const label of targets) {
      if (label.children.length) continue;
      const value = label.textContent.trim();
      if (!/^[★☆]+(?:[1-5](?:以下)?)?$/.test(value)) continue;
      const accessible = document.createElement('span');
      accessible.className = 'bdlr-sr-only';
      accessible.textContent = value.replace(/[^★☆]/g,'');
      label.replaceChildren(accessible);
      for (const symbol of accessible.textContent) {
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const path = document.createElementNS(icon.namespaceURI,'path');
        icon.setAttribute('viewBox','0 0 256 256');
        icon.setAttribute('aria-hidden','true');
        icon.setAttribute('class',symbol==='★'?'ic ic-star':'ic ic-star ic-star--empty');
        icon.setAttribute('fill','currentColor');
        path.setAttribute('d',stars[symbol==='★'?0:1]);
        icon.append(path);
        label.append(icon);
      }
      label.append(value.slice(accessible.textContent.length));
    }
  }
  function decorateBudgets(section,matrix) {
    const grid = section?.querySelector('nav.bd');
    if (!grid || !matrix) return;
    const ranges = [...matrix.querySelectorAll('tbody tr')].map(row => ({
      gpu:row.querySelector('th')?.textContent.trim(),
      prices:[...row.querySelectorAll('td a')].map(a => {
        const amount = a.getAttribute('aria-label') || a.textContent;
        const match = amount.match(/[￥¥]\s*([\d,]+)/);
        return match ? Number(match[1].replaceAll(',','')) : NaN;
      })
    }));
    for (const button of grid.querySelectorAll(':scope > a')) {
      const dest = new URL(button.href);
      const file = dest.pathname.match(/catalog-pc-(\d+)-(\d+|up)\.html$/);
      if (!dest.searchParams.has('min') && !file) continue;
      const low = Number(file ? file[1] : dest.searchParams.get('min'));
      const high = Number(file ? file[2] : dest.searchParams.get('max')) || Infinity;
      const models = ranges.filter(row => row.gpu && row.prices.some(price=>price>=low && price<high)).slice(0,2).map(row=>row.gpu);
      let chips = button.querySelector('.bgc-ch');
      if (!models.length) {chips?.remove();continue;}
      if (chips?.dataset.models === models.join('/')) continue;
      if (!chips) {chips=document.createElement('span');chips.className='bgc-ch';button.append(chips);}
      chips.dataset.models=models.join('/');
      chips.replaceChildren(...models.map(gpu=>{const el=document.createElement('span');el.textContent=gpu;return el;}));
    }
  }
  function refreshHome(main) {
    const picks=main.querySelector('.nov-home-picks'), discover=main.querySelector('#bdlr-games.dx-c');
    const matrix=main.querySelector('.bdlr-price-matrix'), banner=main.querySelector('.bdlr-feature-banners');
    const head=main.querySelector('.bdlr-service-head'), strip=main.querySelector('.bdlr-service-strip');
    if (!picks || !discover || !matrix || !banner || !head || !strip) return;
    if (![picks,discover,matrix,banner,head,strip].every(el=>el.parentElement===main)) return;
    for (const [left,right] of [[picks,discover],[matrix,banner],[banner,head],[head,strip]]) {
      if (left.nextElementSibling!==right) left.after(right);
    }
    for (const [i,li] of [...strip.querySelectorAll('.bdlr-service-strip__item')].entries()) {
      const caption=['ASSEMBLY','WARRANTY','SHIPPING','PAYMENT'][i];
      if (!caption||li.querySelector('.bdlr-service-strip__tag')) continue;
      const tag=document.createElement('span');tag.className='bdlr-service-strip__tag';tag.textContent=caption;li.prepend(tag);
    }
    decorateBudgets(discover,matrix);
  }
  function install(){
    const main=document.querySelector('main');
    if (!main) return;
    root.dataset.bandalParity='9646216';
    const home=document.body.classList.contains('bdlr-top-page');
    let queued=false;
    const run=()=>{queued=false;observer.disconnect();
      try {if (home) refreshHome(main);refreshRatings(main);}
      finally {observer.observe(main,{childList:true,subtree:true,characterData:true});}
    };
    const observer=new MutationObserver(()=>{if (!queued) {queued=true;requestAnimationFrame(run);}});
    run();
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true}); else install();
})();
