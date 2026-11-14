/* BANDAL store adapter for the ccc2f0e design. Store links, prices and option inputs remain authoritative. */
(function () {
  'use strict';
  if (window.bandalDesignCcc2f0e) return;
  window.bandalDesignCcc2f0e = true;
  const movieMarkup = "<section aria-labelledby=\"bdlr-movie-title\" class=\"bdlr-section bdlr-movie\"><div class=\"bdlr-movie__text\"><p class=\"bdlr-movie__meta\">MOVIE 09:18</p><p aria-hidden=\"true\" class=\"bdlr-movie__display\"><span>Factory</span><span>Tour</span></p><h2 id=\"bdlr-movie-title\">新しい工場を、<br/>すべて公開します</h2><p class=\"bdlr-movie__lead\">組み立てと検品の現場を、代表が動画で案内します。</p><a class=\"bdlr-movie__link\" href=\"https://www.youtube.com/watch?v=-fAUTvSdHX0\" rel=\"noopener\" target=\"_blank\">YouTubeで見る</a></div><div class=\"bdlr-movie__player\"><iframe allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"strict-origin-when-cross-origin\" src=\"https://www.youtube-nocookie.com/embed/-fAUTvSdHX0\" title=\"【BANDAL】新しい工場をすべて公開します。代表から皆様へ\"></iframe></div></section>";
  const iconPaths = ["M229.19,213c-15.81-27.32-40.63-46.49-69.47-54.62a70,70,0,1,0-63.44,0C67.44,166.5,42.62,185.67,26.81,213a6,6,0,1,0,10.38,6C56.4,185.81,90.34,166,128,166s71.6,19.81,90.81,53a6,6,0,1,0,10.38-6ZM70,96a58,58,0,1,1,58,58A58.07,58.07,0,0,1,70,96Z", "M254,136a6,6,0,0,1-6,6H230v18a6,6,0,0,1-12,0V142H200a6,6,0,0,1,0-12h18V112a6,6,0,0,1,12,0v18h18A6,6,0,0,1,254,136Zm-57.41,60.14a6,6,0,1,1-9.18,7.72C166.9,179.45,138.69,166,108,166s-58.89,13.45-79.41,37.86a6,6,0,0,1-9.18-7.72C35.14,177.41,55,164.48,77,158.25a70,70,0,1,1,62,0C161,164.48,180.86,177.41,196.59,196.14ZM108,154a58,58,0,1,0-58-58A58.07,58.07,0,0,0,108,154Z"];
  const all = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const localPage = /\.html$/.test(location.pathname);
  const element = (tag, cls, label) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (label != null) node.textContent = label;
    return node;
  };
  function accountIcons() {
    all('.bdlr-mobile-member a').forEach(link => {
      const label = link.textContent.trim();
      const index = ['ログイン','会員登録'].indexOf(label);
      if (index < 0 || link.querySelector('svg')) return;
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      const path = document.createElementNS(ns, 'path');
      svg.setAttribute('class','ic');
      svg.setAttribute('aria-hidden','true');
      svg.setAttribute('viewBox','0 0 256 256');
      svg.setAttribute('fill','currentColor');
      path.setAttribute('d',iconPaths[index]); svg.append(path);
      link.replaceChildren(svg,element('span','',label));
    });
  }
  function home() {
    const why = document.querySelector('.bdlr-why, .bdlr-service-head');
    const strip = document.querySelector('ul.bdlr-home-trust');
    const anchor = (why && (why.closest('.bdlr-why') || why)) || strip;
    if (anchor && !document.querySelector('.bdlr-movie') && (document.querySelector('.bdlr-hero,.nov-home-picks') || /(?:\/|\/top\.html|\/index\.html)$/.test(location.pathname))) {
      anchor.insertAdjacentHTML('beforebegin',movieMarkup);
    }
    const movie = document.querySelector('.bdlr-movie');
    if (movie && why && why.closest('.bdlr-why') && movie.parentNode !== why.closest('.bdlr-why').parentNode) {
      why.closest('.bdlr-why').before(movie);
    }
    const game = document.querySelector('.bgc--mh .bgc-name, .dx-blk .gm a[href*="mhwilds"] b, .bdlr-game-grid a[href*="mhwilds"] b');
    if (game && /^モン(?:スター|ハン)/.test(game.textContent)) game.textContent = 'Monster Hunter Wilds';
  }
  function group(title, links, open) {
    const wrapper = element('details');
    wrapper.open = !!open;
    const nav = element('nav'); nav.append(...links);
    wrapper.append(element('summary','',title),nav);
    return wrapper;
  }
  function sidebar(body) {
    const details = all(':scope > details',body);
    const named = name => details.find(d => d.querySelector('summary')?.textContent.trim() === name);
    const combined = named('特集・用途');
    if (combined) {
      const pick = pattern => all('a',combined).filter(a => pattern.test(a.textContent));
      const purpose = pick(/競技FPS|配信|高画質/);
      const diagnosis = pick(/診断/);
      const devices = pick(/周辺機器/);
      if (purpose.length) combined.after(group('用途から選ぶ',purpose,true));
      if (diagnosis.length) body.append(group('診断で選ぶ',diagnosis,false));
      if (devices.length) {
        const nav = element('nav','bdlr-filter-solo'); nav.append(...devices); body.append(nav);
      }
      combined.querySelector('summary').textContent = '特集';
    }
    const white = named('White筐体モデル'), black = named('Black筐体モデル');
    if (white && black) {
      const colors = group('筐体の色から選ぶ',[...all('a',white),...all('a',black)],false);
      all('a',colors).forEach(a => a.classList.toggle('is-child',!/モデル一覧/.test(a.textContent)));
      white.replaceWith(colors); black.remove();
    }
    const prices = named('価格から選ぶ');
    if (prices && !body.hasAttribute('data-bandal-budget-initialized')) {
      body.setAttribute('data-bandal-budget-initialized','');
      prices.open = true;
      const names = {'10万円以下':'〜10万円','10万円モデル':'10〜20万円','20万円モデル':'20〜30万円','30万円モデル':'30〜40万円','40万円モデル':'40〜50万円','50万円以上':'50万円〜'};
      all('a',prices).forEach(a => {
        const label=names[a.textContent.trim()]; if (label) a.textContent=label;
        if (a.getAttribute('aria-current')==='page' && a.href!==location.href) a.removeAttribute('aria-current');
      });
    }
    if (combined || named('特集')) body.dataset.bdlrSide='v2';
    const wilds = body.querySelector('a[href*="game_mhwilds"]');
    if (wilds?.textContent.trim()==='モンハンワイルズ') wilds.textContent='モンスターハンターワイルズ';
  }
  function filterChips() {
    all('.bdlr-filter-selection').forEach(summary => {
      if (summary.querySelector('.bdlr-sel-chip')) return;
      const raw = summary.textContent.trim();
      if (!raw && summary.dataset.sel==='0') return;
      const label = raw.replace(/^選択中[（(]\d+[）)]\s*[：:]\s*/,'').replace('モンハンワイルズ','モンスターハンターワイルズ');
      const on = label && !/条件指定なし|選択中[（(]0[）)]/.test(raw);
      summary.dataset.sel=on?'1':'0';
      if (!on) { summary.hidden=true; if (raw) summary.replaceChildren(); return; }
      const clear = element('a','bdlr-sel-x');
      clear.setAttribute('aria-label','絞り込みを解除');
      clear.href = summary.closest('.bdlr-filter-panel')?.querySelector('header > a[href]')?.href || (localPage?'category-all_items.html':'/view/category/all_items');
      const chip = element('span','bdlr-sel-chip',label); chip.append(clear);
      summary.hidden=false;
      summary.replaceChildren(element('span','bdlr-sel-label','表示中'),chip);
    });
  }
  const menuBudgets={'10万円超～15万円未満':'10〜15万円','15万～20万円未満':'15〜20万円','20万～30万円未満':'20〜30万円','30万円以上':'30万円〜'};
  function menuLabels() {
    for(const link of all('.bdlr-mobile-member ~ nav a,.bdlr-mega-panel a,.mega-panel a,.bdlr-mobile-menu a,.bdlr-mobile-nav a')) {
      const label=menuBudgets[link.textContent.trim()];
      if(label && link.childElementCount===0)link.textContent=label;
    }
  }
  function catalog() {
    all('.bdlr-filter-body').forEach(sidebar);
    filterChips();
    all('.bdlr-card-cta').forEach(a => {
      if (a.childElementCount===0 && /^(詳細・カスタマイズ|商品詳細を見る)$/.test(a.textContent.trim())) a.textContent='詳細を見る';
    });
  }
  function breadcrumb() {
    const main = document.querySelector('main.bdl-info-main');
    if (!main || main.querySelector('.bdlr-static-breadcrumb') || !/(?:\/|^)(company|contract|guide)(?:\.html)?\/?$/.test(location.pathname)) return;
    const heading = main.querySelector('h1');
    if (!heading) return;
    const nav=element('nav','bdlr-static-breadcrumb');
    nav.setAttribute('aria-label','パンくず');
    const top=element('a','','TOP'); top.href=localPage?'top.html':'/';
    const separator=element('span','','/'); separator.setAttribute('aria-hidden','true');
    nav.append(top,separator,element('span','',heading.textContent.trim()));
    main.prepend(nav);
  }
  const norm = raw => raw.replace(/￥/g,'¥').replace(/～/g,'〜').replace(/(\d)\s*~/g,'$1〜');
  function summaryRow(source) {
    const original = source.textContent.trim();
    if (!original) return;
    let view = source.nextElementSibling;
    if (!view || !view.classList.contains('bdlr-option-summary-view')) {
      view = element('span','bdlr-option-summary-view');
      source.after(view);
      source.dataset.designRaw=''; source.hidden=true; source.style.setProperty('display','none','important');
    }
    if (view.getAttribute('aria-label') !== original) {
      const parts = norm(original).split(/\s*[｜|]\s*/);
      const choice = parts.shift().trim(), delta = parts.join(' ').trim();
      const added = /^[+＋]/.test(delta);
      view.replaceChildren(element('span','bdlr-os-val',choice),element('span','bdlr-os-price'+(added?' is-added':''),delta.replace(/^変更\s*/,'')));
      view.setAttribute('aria-label',original);
    }
    const select=document.getElementById(source.dataset.bdlrOptionSummary);
    if(select?.options && typeof window.isBdlrChangedFromStandard==='function') {
      source.closest('details')?.toggleAttribute('data-bdlr-changed',window.isBdlrChangedFromStandard(select));
    }
  }
  function totalDelta() {
    const box = document.querySelector('.bdlr-order-summary__total');
    const total = box?.querySelector('[data-bdlr-showroom-total]');
    const base=document.getElementById('bandal-floating-summary')?.getAttribute('data-base-price');
    const changes=document.querySelector('[data-bdlr-configuration-list]');
    if (!total || !changes || !/^\d+$/.test(base || '')) return;
    const amount=total.textContent.replace(/[,，]/g,'').match(/\d+/);
    if(!amount) return;
    const diff=Number(amount[0])-Number(base);
    const count=changes.querySelectorAll('dt').length;
    const text=diff || count ? 'カスタマイズ '+(diff<0?'−':'+')+'¥'+Math.abs(diff).toLocaleString('ja-JP')+(count?'（'+count+'項目）':'') : '標準構成';
    let p=box.querySelector('.bdlr-custom-delta');
    if(!p){p=element('p','bdlr-custom-delta');box.append(p);}
    if(p.textContent!==text) p.textContent=text;
    p.toggleAttribute('data-on',!!(diff||count));
  }
  function shipping() {
    for(const block of all('.product-price-block:has(.bdlr-hero-tax-note)')) {
      const tax=block.querySelector('.bdlr-hero-tax-note');
      const label=tax.textContent.replace(/\s/g,'');
      const match=label.match(/^[(（]?税込[)）]?[・／/]送料別[(（]([^）)]+)[)）]$/);
      if(!match)continue;
      let shipping=block.querySelector('.bdlr-hero-ship-note');
      if(!shipping){shipping=element('small','bdlr-hero-ship-note');tax.after(shipping);}
      const text='送料別・'+match[1];
      if(shipping.textContent!==text)shipping.textContent=text;
      tax.replaceChildren(element('span','','(税込)'));
    }
  }
  function item() {
    shipping();
    const parts=document.querySelector('details.ux-item-fact[data-ux-parts]');
    if (parts && !parts.hasAttribute('data-bdlr-locked-open')) {
      parts.dataset.bdlrLockedOpen='1'; parts.open=true;
      const title=parts.querySelector('summary');
      if (title) {title.textContent='パーツ構成';title.tabIndex=-1;title.addEventListener('click',e=>e.preventDefault());}
      parts.addEventListener('toggle',()=>{if(!parts.open)parts.open=true;});
    }
    all('details.bdlr-option-group > summary > [data-bdlr-option-summary]').forEach(summaryRow);
    all('.bdlr-option-card__copy > strong').forEach(name=>{
      const card=name.closest('.bdlr-option-card');
      const price=card?.querySelector('.bdlr-option-card__price');
      if(card)card.toggleAttribute('data-bdlr-price-dup',name.textContent.includes('標準') && (!price || price.textContent.trim()==='標準'));
    });
    totalDelta();
  }
  const priceSelector='.bdlr-option-card__price,.bdlr-memory-price,.bdlr-order-summary__total,.bandal-floating-summary__price,.bandal-floating-summary__installment,.bdlr-hero-installment,.product-price-block,.bdlr-premium-price,.bdlr-premium-monthly,.bgc-price,.bdlr-price-matrix td';
  function priceText(node) {
    const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
    for(let n=walker.nextNode();n;n=walker.nextNode()){const value=norm(n.data);if(value!==n.data)n.data=value;}
  }
  function run() {
    accountIcons(); menuLabels(); home(); catalog(); breadcrumb(); item(); all(priceSelector).forEach(priceText);
  }
  function init() {
    run();
    let scheduled=false;
    function refresh(){if(!scheduled){scheduled=true;requestAnimationFrame(()=>{scheduled=false;run();});}}
    const areas='.bdlr-mobile-member,.bdlr-filter-body,.bdlr-filter-selection,.bdlr-option-group>summary,[data-bdlr-configuration-list],[data-bdlr-showroom-total],.bdlr-option-card__copy,.bgc--mh';
    const newRoots='.bdlr-why,.bdlr-service-head,.bdlr-service-strip,.bdlr-mobile-member,.bdlr-filter-body,.bdlr-card-cta,.ux-item-fact,.bdlr-option-group,.bdlr-order-summary,.bdlr-option-card,.bgc--mh,main.bdl-info-main';
    new MutationObserver(list=>{
      for(const m of list){
        const target=m.target.nodeType===1?m.target:m.target.parentElement;
        if(target?.closest(areas+','+priceSelector)){refresh();return;}
        if(m.type==='childList' && Array.from(m.addedNodes).some(node=>node.nodeType===1&&(node.matches(newRoots)||node.querySelector(newRoots)))){refresh();return;}
      }
    }).observe(document.body,{childList:true,subtree:true,characterData:true});
    document.addEventListener('change',refresh);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
/* Keep prices on the shared comparison grid, with a separate review and action stack in each card. */
(() => {
  const bodySelector = '.bdlr-catalog-grid > .bdlr-catalog-card > .bdlr-catalog-card-body';
  const footerChild = ':is(.bdlr-review-score,.bdlr-card-leadtime,.bdlr-compare-check,.audit-compare-check,.bdlr-card-cta)';

  function groupFooter(body) {
    const additions = Array.from(body.querySelectorAll(':scope > ' + footerChild));
    if (!additions.length) return;
    let footer = body.querySelector(':scope > .bandal-card-actions');
    if (!footer) {
      footer = document.createElement('div');
      footer.className = 'bandal-card-actions';
      body.append(footer);
    }
    // Move the originals so reviews, comparison controls and checkout links keep their listeners.
    const children = Array.from(footer.children).concat(additions);
    const rank = el => el.matches('.bdlr-review-score') ? 0 : el.matches('.bdlr-card-leadtime') ? 1 : el.matches('.bdlr-card-cta') ? 3 : 2;
    let next = null;
    for (const child of children.sort((a,b) => rank(b) - rank(a))) {
      if (child.parentElement !== footer || child.nextElementSibling !== next) {
        if (footer.moveBefore) footer.moveBefore(child, next);
        else footer.insertBefore(child, next);
      }
      next = child;
    }
  }
  function install() {
    const main = document.querySelector('.bdlr-catalog-content');
    if (!main || main.hasAttribute('data-bandal-review-spacing')) return;
    main.setAttribute('data-bandal-review-spacing', '');
    main.querySelectorAll(bodySelector).forEach(groupFooter);
    new MutationObserver(records => {
      const dirty = new Set();
      for (const {target, addedNodes} of records) {
        if (!addedNodes.length) continue;
        if (target.matches(bodySelector)) dirty.add(target);
        for (const node of addedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.matches(bodySelector)) dirty.add(node);
          node.querySelectorAll(bodySelector).forEach(body => dirty.add(body));
        }
      }
      dirty.forEach(groupFooter);
    }).observe(main, {childList: true, subtree: true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
