/* BANDAL: three category hubs and registered capacity chips */
/* BANDAL 9646216 category index cards. MakeShop owns all product results. */
(function () {
  'use strict';
  const path = location.pathname;
  const shop = location.hostname === 'bandaltest2.shop3.makeshop.jp';
  const preview = document.documentElement.hasAttribute('data-preview-device');
  const match = shop ? path.match(/^\/view\/category\/(purpose|game_select|price)\/?$/)
    : preview && path.match(/\/(?:pc|sp)\/category-(purpose|game_select|price)\.html$/);
  if (!match) return;
  const query = new URLSearchParams(location.search);
  if (['pc', 'cpu', 'gpu', 'min', 'max', 'keyword'].some(key => query.has(key))) return;
  const index = match[1];
  const labels = { purpose: '用途から選ぶ', game_select: 'ゲームから選ぶ', price: '価格から選ぶ' };
  const purpose = [
    ['purpose_competitive', 'COMPETITIVE', '競技FPS・高FPS'],
    ['purpose_streaming', 'STREAMING', '配信・動画編集'],
    ['purpose_premium', '4K / HIGH QUALITY', '高画質・4Kゲーム']
  ];
  const games = [
    ['game_valorant', 'TACTICAL FPS', 'VALORANT', 'fps'],
    ['ct86', 'BATTLE ROYALE', 'APEX LEGENDS', 'br'],
    ['game_fortnite', 'BATTLE ROYALE', 'FORTNITE', 'br'],
    ['game_mhwilds', 'HUNTING ACTION', 'モンスターハンター|ワイルズ', 'action'],
    ['game_genshin', 'OPEN WORLD RPG', '原神', 'rpg'],
    ['game_minecraft', 'SANDBOX', 'Minecraft', 'rpg'],
    ['game_gta5', 'OPEN WORLD ACTION', 'GTA V', 'action'],
    ['game_sf6', 'FIGHTING', 'ストリート|ファイター6', 'action'],
    ['game_tarkov', 'HARDCORE FPS', 'Escape from Tarkov', 'fps'],
    ['game_wuthering', 'OPEN WORLD RPG', '鳴潮', 'rpg']
  ];
  const prices = [
    [0, 100000, 'UNDER ¥100,000', '10万円以下'],
    [100000, 200000, '¥100,000 –', '10万円台モデル'],
    [200000, 300000, '¥200,000 –', '20万円台モデル'],
    [300000, 400000, '¥300,000 –', '30万円台モデル'],
    [400000, 500000, '¥400,000 –', '40万円台モデル'],
    [500000, null, '¥500,000 +', '50万円以上']
  ];
  function element(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value) node.textContent = value;
    return node;
  }
  // The offline export has connect-src 'none'. Its recorded 6 bands contain
  // 1, 6, 5, 3, 3 and 3 published PCs. The live shop always reads its catalog.
  async function availableBands() {
    if (!shop) return new Set([0,100000,200000,300000,400000,500000]);
    const bands = new Set();
    const catalog = '/view/category/all_items';
    const pending = [new URL(catalog, location.origin).href], seen = new Set();
    while (pending.length && seen.size < 12) {
      const href = pending.shift();
      if (seen.has(href)) continue;
      seen.add(href);
      const response = await fetch(href, {credentials:'same-origin', signal:AbortSignal.timeout(10000)});
      if (!response.ok || new URL(response.url).origin !== location.origin) throw Error('Catalog unavailable');
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      if (!doc.querySelector('.bdlr-catalog-main,[data-bdl-product-card]')) throw Error('Catalog unavailable');
      for (const card of doc.querySelectorAll('[data-bdl-product-card]')) {
        const name = card.querySelector('[data-bdl-product-name]')?.textContent || '';
        if (!/(?:Ryzen|Core\s*i?[3579])/i.test(name) || !/(?:RTX|RX)\s*\d{4}/i.test(name) || /ZALMAN|P30/i.test(name)) continue;
        const price = card.querySelector('.bdlr-product-price strong')?.textContent.match(/[0-9][0-9,]*/);
        const amount = price && Number(price[0].replaceAll(',',''));
        if (!amount) continue;
        const band = prices.find(([min,max]) => amount >= min && (max === null || amount < max));
        if (band) bands.add(band[0]);
      }
      if (bands.size === prices.length) break;
      for (const link of doc.querySelectorAll('.bdlr-pagination a[href]')) {
        const next = new URL(link.getAttribute('href'),href);
        if (next.origin === location.origin && next.pathname === catalog && !seen.has(next.href) && !pending.includes(next.href)) pending.push(next.href);
      }
    }
    return bands;
  }
  async function render() {
    const region = document.getElementById('bdlr-catalog-products');
    if (!region || region.hasAttribute('data-bdlr-hub-loading') || region.querySelector('[data-bdlr-rel-tiles]')) return;
    const nav = element('nav', 'bdlr-rel-tiles');
    nav.setAttribute('aria-label', labels[index]);
    nav.dataset.bdlrRelTiles = index === 'game_select' ? 'game' : index;
    function append(href, label, title, tone) {
      const a = element('a', 'bdlr-rel-tile');
      a.setAttribute('href', href);
      if (tone) a.dataset.tone = tone;
      const strong = element('strong');
      title.split('|').forEach((part,i) => {
        if (i) strong.append(document.createElement('wbr'));
        strong.append(part);
      });
      a.append(element('span', 'bdlr-rel-tile-label', label), strong, element('span', 'bdlr-rel-tile-more', 'モデルを見る'));
      nav.append(a);
    }
    if (index === 'price') {
      region.dataset.bdlrHubLoading = '';
      let populated;
      try { populated = await availableBands(); } catch { populated = new Set(); }
      delete region.dataset.bdlrHubLoading;
      if (region.querySelector('[data-bdlr-rel-tiles]')) return;
      if (!populated.size) {
        // Keep a working entry if no prices are available or the catalog cannot be read.
        append(shop ? '/view/category/all_items?pc=1' : 'catalog-pc-all-up.html', 'PC', 'すべてのPCを見る');
      }
      prices.filter(([min]) => populated.has(min)).forEach(([min,max,label,title]) => {
        const href = shop ? '/view/category/all_items?pc=1&min=' + min + (max === null ? '' : '&max=' + max)
          : 'catalog-pc-' + min + '-' + (max === null ? 'up' : max) + '.html';
        append(href,label,title);
      });
    } else {
      (index === 'purpose' ? purpose : games).forEach(([id,label,title,tone]) =>
        append(shop ? '/view/category/' + id : 'category-' + id + '.html',label,title,tone));
    }
    region.prepend(nav);
    if (index === 'game_select') {
      const note = element('p', 'bdlr-rel-tiles-note', '遊びたいタイトルが決まっていない方は');
      const link = element('a', '', 'PC診断で探す');
      link.href = shop ? '/view/page/bandal_diagnosis_new' : 'page-bandal_diagnosis_new.html';
      note.append(link);
      nav.after(note);
    }
    const empty = region.querySelector(':scope > p.empty');
    if (empty && !region.querySelector('.bdlr-product-card,.item-list > li,.audit-product-list > *, .bdlr-catalog-subcard')) {
      // Existing catalog CSS suppresses the empty notice and toolbar on the parent index.
      const wrapper = element('div', 'bdlr-rel-empty');
      wrapper.dataset.bdlrRelEmpty = '';
      empty.replaceWith(wrapper);
      wrapper.append(empty);
      region.dataset.bdlrRelIndex = '';
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, { once:true });
  else render();
})();

;
/* Registered catalog tags for the test storefront and its two shared HTML previews. */
(function () {
  function mount() {
    const content = document.querySelector('.bdlr-catalog-content');
    if (!content || !document.body.classList.contains('bdlr-catalog-page')) return;
    const cardSelector = '.bdlr-catalog-card';
    const fields = '[data-bdlr-card-memory],[data-bdlr-card-ssd]';
    // The PC and mobile base-spec blocks agree on these 21 standard SKUs.
    const verified = new Set([
      '000000000001','000000000002','000000000003','000000000004','000000000005',
      '000000000006','000000000007','000000000008','000000000009','000000000010',
      '000000000011','000000000012','000000000013','000000000014','000000000015',
      '000000000016','000000000017','000000000018','000000000019','000000000020',
      '000000000026'
    ]);

    function refresh(card) {
      const link = card.querySelector('a.bdlr-catalog-name, a.bdlr-catalog-image');
      const id = link && /(?:\/view\/item\/|(?:^|\/)item-)(\d{12})(?:\.html)?(?:[?#].*)?$/.exec(link.getAttribute('href') || '');
      card.querySelectorAll(fields).forEach(function (field) {
        const row = field.parentElement;
        const isSsd = field.hasAttribute('data-bdlr-card-ssd');
        const raw = field.textContent.trim();
        const native = raw.normalize('NFKC').match(/(\d+(?:\.\d+)?)\s*(GB|TB)\b/i);
        const empty = !raw || raw === '商品詳細で確認';
        const value = native ? native[1] + native[2].toUpperCase()
          : empty && id && verified.has(id[1]) ? (isSsd ? '500GB' : '16GB') : '';
        if (!value) {
          if (row.hasAttribute('data-bandal-capacity-tag')) {
            row.removeAttribute('data-bandal-capacity-tag');
            row.removeAttribute('data-bdc-chip');
            field.removeAttribute('aria-label');
          }
          return;
        }
        const label = isSsd ? 'SSD ' + value : value;
        if (row.getAttribute('data-bdc-chip') !== label) row.setAttribute('data-bdc-chip', label);
        row.setAttribute('data-bandal-capacity-tag', '');
        if (empty) field.setAttribute('aria-label', (isSsd ? 'SSD ' : 'メモリ ') + value);
        else field.removeAttribute('aria-label');
      });
    }

    content.querySelectorAll(cardSelector).forEach(refresh);
    const dirty = new Set();
    let pending = false;
    function enqueue(node) {
      if (node.nodeType !== 1) return;
      const parent = node.closest(cardSelector);
      if (parent) dirty.add(parent);
      else node.querySelectorAll(cardSelector).forEach(card => dirty.add(card));
    }
    new MutationObserver(function (changes) {
      for (const change of changes) {
        if (change.type === 'childList') {
          if (change.target.closest(cardSelector)) enqueue(change.target);
          else change.addedNodes.forEach(enqueue);
        } else enqueue(change.target.parentElement || change.target);
      }
      if (pending || !dirty.size) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        for (const card of dirty) if (card.isConnected) refresh(card);
        dirty.clear();
      });
    }).observe(content, {childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:['href']});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();
