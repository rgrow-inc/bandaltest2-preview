/* Buyer-facing corrections. Keep native select values and registered product IDs intact. */
(() => {
  'use strict';
  const processed = 'data-bandal-nov14-copy';
  const ignore = 'script,style,noscript,template,textarea,input,[contenteditable="true"],blockquote,.audit-review-short,.bdlr-legacy-body,.bdlr-review-text,.bdlr-review-comment,.bdlr-review-body h3,[data-bdlr-review-body-text]';
  const wifiCard = '[data-bdlr-guide="無線WiFi"] .bdlr-option-card';
  const attributes = ['data-name','aria-label','alt','title','label'];
  const galleryNote = '[data-bdlr-bd2-photo-note],[data-bdlr-aircooler-note]';
  const selector = [
    '[data-ux-fps]', '.audit-results > h2', '.audit-results > p', '.ux-result > small',
    wifiCard, galleryNote, ...attributes.map(name => '[' + name + ']')
  ].join(',');
  const externalSource = /ドスパラ|dospara/i;

  function gpuLabel(value) {
    return value.replace(/\bRTX[ \t\u3000]*3050(?![0-9A-Za-z]|[ \t\u3000]*[0-9]+[ \t]*GB)/gi, 'RTX 3050 6GB');
  }

  function updateText(node) {
    if (!/3050/.test(node.data) || !node.parentElement || node.parentElement.closest(ignore)) return;
    const value = gpuLabel(node.data);
    if (value === node.data) return;
    const option = node.parentElement.closest('option');
    if (option && !option.hasAttribute('value')) option.value = option.value;
    node.data = value;
  }

  function updateElement(el) {
    if (el.closest(ignore)) return;
    // This particular block is generated exclusively from the old ux-reference-fps dataset.
    // Authentic BANDAL measurements use #bdlr-performance and are independent.
    if (el.matches('[data-ux-fps]')) { el.remove(); return; }
    if (el.matches('.audit-results > p') && externalSource.test(el.textContent)) { el.remove(); return; }
    if (el.matches('.audit-results > h2') && /の1080p参考値を確認できる構成/.test(el.textContent)) {
      el.textContent = el.textContent.replace('の1080p参考値を確認できる構成','の掲載モデル');
    }
    if (el.matches('.ux-result > small') && el.textContent.includes('ゲームの候補は同等構成の1080p参考値に基づきます')) {
      el.remove(); return;
    }
    for (const name of attributes) {
      const before = el.getAttribute(name);
      if (!before || !before.includes('3050')) continue;
      const after = gpuLabel(before);
      if (before !== after) el.setAttribute(name, after);
    }
    if (el.matches(galleryNote)) {
      const product = document.querySelector('h1.product-name')?.textContent || '';
      const text = el.textContent.trim();
      const kenkiPCNote = /けんき|BKM-B1/i.test(product) &&
        (/^写真はBD2仕様です/.test(text) || /^※?空冷クーラーとなります/.test(text));
      if (kenkiPCNote || document.body.classList.contains('is-parts-product')) {
        // The native gallery recreates the cooler note if removed. Keep its element
        // in place so repeated option and gallery updates cannot recreate a duplicate.
        el.hidden = true;
        if (el.style.getPropertyValue('display') !== 'none' || el.style.getPropertyPriority('display') !== 'important') {
          el.style.setProperty('display','none','important');
        }
      }
    }
    if (!el.matches(wifiCard)) return;
    const copy = el.querySelector('.bdlr-option-card__copy');
    if (!copy || !el.querySelector('[data-photo="wifi-usb"]') && !/^(?:USBに挿す子機|外付け)/i.test(copy.querySelector('strong')?.textContent.trim() || '')) return;
    if (copy.querySelector('.bdlr-usb-wifi-note')) return;
    const note = document.createElement('span');
    note.className = 'bdlr-usb-wifi-note';
    note.textContent = 'Bluetoothは使えません';
    const price = copy.querySelector('.bdlr-option-card__price');
    if (price) price.before(note); else copy.append(note);
  }

  function process(root) {
    if (!root.isConnected) return;
    if (root.nodeType === Node.TEXT_NODE) {
      updateText(root);
      const parent = root.parentElement?.closest('.audit-results > h2,.audit-results > p,.ux-result > small,' + wifiCard + ',' + galleryNote);
      if (parent) updateElement(parent);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE || root.closest(ignore)) return;
    if (root.matches('h1.product-name') && /けんき|BKM-B1/i.test(root.textContent)) document.querySelectorAll(galleryNote).forEach(updateElement);
    if (root.matches(selector)) updateElement(root);
    if (!root.isConnected) return;
    root.querySelectorAll(selector).forEach(updateElement);
    const texts = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (texts.nextNode()) updateText(texts.currentNode);
    const card = root.closest(wifiCard);
    if (card && card !== root) updateElement(card);
  }

  function start() {
    if (document.documentElement.hasAttribute(processed)) return;
    document.documentElement.setAttribute(processed,'');
    process(document.documentElement);
    new MutationObserver(records => {
      for (const r of records) {
        if (r.type === 'attributes' && r.attributeName === 'class') {
          if (r.target === document.body && document.body.classList.contains('is-parts-product')) {
            document.querySelectorAll(galleryNote).forEach(updateElement);
          }
          continue;
        }
        if (r.type === 'childList') {
          for (const node of r.addedNodes) process(node);
        } else if (r.type === 'characterData') process(r.target);
        else if (r.target.isConnected) updateElement(r.target);
      }
    }).observe(document.documentElement, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:[...attributes,'class']});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
;
/* Keep the native option values, prices, and click handlers. */
(function () {
  const kenkiCodes = '[data-bdlr-model-code="BKM-B1"],[data-bdlr-model-code="BKM-B2"],[data-bdlr-model-code="BKM-B3"]';

  function applyKenkiPhotos(panel) {
    const kenkiProduct = !!document.querySelector(kenkiCodes);
    for (const group of panel.querySelectorAll('[data-nov-kind="fan"],[data-bdlr-guide="インフィニティミラーファン追加"]')) {
      for (const card of group.querySelectorAll('.bdlr-option-card')) {
        const media = card.querySelector('.bdlr-option-card__media');
        if (!media || (!kenkiProduct && media.dataset.photo !== 'kenki-front')) continue;
        const select = document.getElementById(card.dataset.bdlrSelectId || group.dataset.bdlrSelectId);
        const option = Array.from(select?.options || []).find(o => o.value === card.dataset.bdlrOptionValue);
        const name = option?.textContent || card.querySelector('.bdlr-option-card__copy strong')?.textContent || '';
        let state;
        if (/追加なし|追加しない/.test(name)) state = 'empty';
        else if (/底面.{0,8}[3３]個/.test(name)) state = 'bottom-three';
        else continue;
        let img = media.querySelector('img');
        const filename = state === 'empty' ? 'kenki-empty-floor.webp' : 'kenki-front.webp';
        const src = img?.getAttribute('src') || '';
        const nextSrc = /(?:^|\/)option-media-v1\/[^/?#]+\.webp(?:[?#].*)?$/i.test(src)
          ? src.replace(/[^/]+\.webp(?:[?#].*)?$/i, filename)
          : (document.documentElement.hasAttribute('data-preview-device') ? '../assets/option-media-v1/' : 'https://rgrow-inc.github.io/bandaltest2-preview/assets/option-media-v1/') + filename;
        if (!img) {
          img = document.createElement('img');
          img.width = img.height = 480;
          img.loading = 'lazy';
          media.prepend(img);
        }
        if (src !== nextSrc) img.setAttribute('src', nextSrc);
        const alt = state === 'empty' ? '底面ファンを取り付けていないけんきケース' : 'けんきケースの底面に黒いファンを3個取り付けた状態';
        if (img.alt !== alt) img.alt = alt;
        if (media.dataset.kenkiFan !== state) media.dataset.kenkiFan = state;
        if (state === 'bottom-three') {
          const bg = 'url("' + nextSrc + '")';
          if (media.style.getPropertyValue('--kenki-fan-photo') !== bg) media.style.setProperty('--kenki-fan-photo', bg);
        }
      }
    }
  }

  function start() {
    const panel = document.getElementById('bdlr-options-panel');
    if (!panel) return;
    applyKenkiPhotos(panel);
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        applyKenkiPhotos(panel);
      });
    }).observe(panel, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'data-photo'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
;
/* Keep the answers below the product photos in sync with the shop's FAQ. */
(function () {
  const gallery = document.querySelector('.bdl-renewal-item__gallery');
  if (!gallery || gallery.querySelector('.bdlr-gallery-faq')) return;
  const preview = document.documentElement.hasAttribute('data-preview-device');
  const faqURL = new URL(preview ? 'page-faq.html' : '/view/page/faq', location.href);
  const questions = [
    ["faq-delivery", "どれくらいで発送されますか？", "通常：ご注文から10～14日で出荷（土日祝・大型連休を除く）\n即納対象商品：ご注文後1営業日後に出荷\n対象・在庫状況は各商品の表示をご確認ください。\n※本ページの記載よりも、サイト内での最新告知を優先させていただきますのでご了承ください。\n送料は全国一律3,000円です。"],
    ["faq-payment", "分割払いはできますか？", "当店でご案内している分割払いはあと払い（ペイディ）です。12回払いの適用可否・お支払い条件は決済画面でご確認ください。"],
    ["faq-product", "商品が起動しない・到着時に破損していた場合は？", "注文番号と症状をご用意のうえ、返送前にお問い合わせください。"]
  ];
  function node(tag, text, css) {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (css) el.className = css;
    return el;
  }
  const block = node('details', '', 'bdlr-gallery-faq');
  const content = node('div', '', 'bdlr-gallery-faq__body');
  const list = node('dl', '', 'bdlr-gallery-faq__answers');
  const more = node('a', 'よくある質問をすべて見る', 'bdlr-gallery-faq__more');
  more.href = faqURL.href;
  content.append(list, more);
  block.append(node('summary', 'よくある質問'), content);
  gallery.append(block);

  function fallback() {
    const content = document.createDocumentFragment();
    for (const [group, title, answer] of questions) {
      if (preview) {
        content.append(node('dt', title), node('dd', answer));
      } else {
        const link = node('a', title);
        link.href = faqURL.href + '#' + group;
        const question = node('dt');
        question.append(link);
        content.append(question, node('dd'));
      }
    }
    list.replaceChildren(content);
  }
  fallback();
  if (preview) return;
  let loading = false, loaded = false;
  block.addEventListener('toggle', async () => {
    if (!block.open || loading || loaded) return;
    loading = true;
    list.setAttribute('aria-busy','true');
    try {
      const response = await fetch(faqURL.href, { credentials: 'same-origin', signal: AbortSignal.timeout(10000) });
      if (!response.ok || new URL(response.url).origin !== location.origin) return;
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      const answers = document.createDocumentFragment();
      for (const [group, title] of questions) {
        const summary = Array.from(doc.getElementById(group)?.querySelectorAll('summary') || [])
          .find(el => el.textContent.trim() === title);
        const answer = summary?.parentElement.querySelector('.bdlr-faq-answer');
        if (!answer) continue;
        answer.querySelectorAll('br').forEach(el => el.replaceWith('\n'));
        const text = Array.from(answer.querySelectorAll('p,li'), el => el.textContent.trim()).filter(Boolean).join('\n');
        if (text) answers.append(node('dt', title), node('dd', text));
      }
      if (answers.childElementCount === questions.length * 2) {
        list.replaceChildren(answers);
        loaded = true;
      }
    } catch {
      // The full FAQ remains available through its ordinary shop link.
    } finally {
      list.removeAttribute('aria-busy');
      loading = false;
    }
  });
})();
