/* Align the editorial headings and breadcrumb labels with the designer's ccc2f0e pages. */
(function () {
  const path = location.pathname;
  const isPolicy = /^\/(?:view\/policy\/?|(?:pc|sp)\/policy\.html)$/.test(path);
  const page = path.match(/^\/(?:view\/page\/([^/]+)\/?|(?:pc|sp)\/page-([^/]+)\.html)$/);
  const slug = page && (page[1] || page[2]);
  const eligible = ['bandal-survey', 'contact', 'coupon', 'faq', 'kenki-collaboration',
    'news-award-20250919', 'news-funding-20250313', 'news-interview-20250428',
    'recycle', 'review-campaign', 'review-list', 'terms_of_use'];
  if (!isPolicy && !eligible.includes(slug)) return;

  function alignHeadings() {
    // Preserve each page's native link destination, focus handling and accessible name.
    const nav = document.querySelector('main nav[aria-label="パンくず"], main .bdlr-static-breadcrumb, main .mig-breadcrumb, main .bdlr-review-breadcrumb, main .bdlr-content-breadcrumb, main .bdlr-recycle-breadcrumb');
    const home = nav && nav.querySelector('a');
    if (home && ['HOME','ホーム'].includes(home.textContent.trim()) && !home.childElementCount) {
      home.textContent = 'TOP';
    }
    if (slug === 'news-award-20250919') {
      for (const heading of document.querySelectorAll('main .mig-article h3')) {
        const text = heading.firstChild;
        if (text && text.nodeType === Node.TEXT_NODE && /^\s*■/.test(text.data)) {
          text.data = text.data.replace(/^(\s*)■\s*/, '$1');
        }
      }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', alignHeadings, {once:true});
  else alignHeadings();
})();
;
/* Match the Git design using only the legal text and link destinations registered by the shop. */
(() => {
  const route = location.pathname.split('/').filter(Boolean).pop()?.replace(/^page-/, '').replace(/\.html$/, '');
  const make = (tag, text) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    return el;
  };

  function termsLayout(block) {
    // Leave any new links/inline markup intact until the shop has a design for them.
    if (block.querySelector(':not(h2,br)') || !block.querySelector(':scope > h2')) return;
    const fragment = document.createDocumentFragment();
    let list;
    const addItem = (type, item) => {
      if (!list || list.localName !== type) {
        list = make(type);
        fragment.append(list);
      }
      list.append(item);
    };
    for (const node of block.childNodes) {
      if (node.nodeName === 'H2') {
        list = null;
        fragment.append(node.cloneNode(true)); // includes the existing anchor id
        continue;
      }
      if (node.nodeType !== Node.TEXT_NODE) continue;
      for (const line of node.textContent.split('\n').map(s => s.trim()).filter(Boolean)) {
        const number = /^(（[０-９0-9]+）)/.exec(line);
        if (line.startsWith('・')) {
          addItem('ul', make('li', line.slice(1)));
        } else if (number) {
          const item = make('li'); item.append(make('span', number[0]), line.slice(number[0].length));
          addItem('ol', item);
        } else if (list && !/^利用規約\s*\d{4}.+更新$/.test(line)) {
          list.lastElementChild.append(make('br'),line);
        } else {
          list = null;
          const paragraph = make('p', line);
          if (/^利用規約\s*\d{4}.+更新$/.test(line)) paragraph.className = 'bdlr-legal-updated';
          fragment.append(paragraph);
        }
      }
    }
    block.replaceChildren(fragment);
    block.dataset.bandalLegalLayout = '1';
  }

  function policyLayout(block) {
    if (block.querySelector(':not(h2,.bandal-registered-policy-paragraphs)') ||
        !block.querySelector(':scope > .bandal-registered-policy-paragraphs')) return;
    const fragment = document.createDocumentFragment();
    for (const group of block.children) {
      if (group.localName === 'h2') { fragment.append(group.cloneNode(true)); continue; }
      let list, nestedList, parentItem, current;
      for (const raw of group.textContent.split('\n')) {
        const line = raw.trim();
        if (!line) {current = null; continue;}
        if (/^改定日[：:]/.test(line)) {
          const date = make('p', line);
          date.className = 'bdlr-legal-updated';
          fragment.append(date);
          list = nestedList = parentItem = current = null;
        } else if (/^■\s*/.test(line)) {
          if (!list) { list = make('ul'); fragment.append(list); }
          parentItem = make('li', line.replace(/^■\s*/, ''));
          list.append(parentItem);
          current = parentItem;
          nestedList = null;
        } else if (/^-\s+/.test(line) && parentItem) {
          if (!nestedList) {nestedList = make('ul');parentItem.append(nestedList);}
          current = make('li', line.replace(/^-\s+/, '')); nestedList.append(current);
        } else if (current) {
          // Keep paragraph breaks at sentence boundaries; source line wrapping is not a paragraph.
          if (/[。す]$/.test(current.textContent.trim()) && (current.localName === 'p' || /^[（(「]|^この場合/.test(line))) current.append(make('br'));
          current.append(line);
        } else {
          current = make('p', line); fragment.append(current);
          list = nestedList = parentItem = null;
        }
      }
    }
    block.replaceChildren(fragment);
    block.dataset.bandalLegalLayout = '1';
  }

  function initialize() {
    const main=document.querySelector('main'); if(!main) return;
    if (route === 'contact') {
      main.querySelectorAll('.mig-card a.mig-button').forEach(link => link.classList.add('mig-button-secondary'));
    } else if (route === 'kenki-collaboration') {
      main.querySelectorAll('a.mig-button[href="#grades"], a.mig-button[href^="#kenki-spec-"]').forEach(link => link.classList.add('mig-button-secondary'));
    } else if (route === 'terms_of_use' || route === 'policy') {
      const sync = () => {
        const block=main.querySelector('.bandal-registered-legal');
        if (!block) return false;
        if (!block.hasAttribute('data-bandal-legal-layout')) {
          if (route === 'policy') policyLayout(block); else termsLayout(block);
        }
        return true;
      };
      if (!sync()) {
        const observer = new MutationObserver(() => {if (sync()) observer.disconnect();});
        observer.observe(main, {subtree: true, childList: true});
      }
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialize,{once:true}); else initialize();
})();
