/* Format registered storefront copy without replacing its wording or existing links. */
(function () {
  const page = (location.pathname.split('/').filter(Boolean).pop() || '').replace(/^page-/, '').replace(/\.html$/, '');
  const articleDates = {
    'news-funding-20250313': '2025-03-13',
    'news-interview-20250428': '2025-04-28',
    'news-award-20250919': '2025-09-19'
  };
  if (page !== 'terms_of_use' && page !== 'policy' && !Object.hasOwn(articleDates, page)) return;
  function formatDocument() {
    const date = articleDates[page];
    if (date) {
      const title = document.querySelector('main.bdlr-migrated .mig-hero h1');
      if (title && !title.parentElement.querySelector('time')) {
        const time = document.createElement('time');
        time.className = 'bdlr-rel-date';
        time.dateTime = date;
        time.textContent = date.replace(/-/g, '.');
        title.before(time);
      }
      return;
    }
    const terms = page === 'terms_of_use' && document.querySelector('main p.bdlr-legal-copy');
    if (terms) {
      const markers = Array.from(terms.querySelectorAll(':scope > span[id^="terms-"]'));
      const lines = markers.map(marker => marker.nextSibling);
      if (markers.length && lines.every(line =>
        line && line.nodeType === Node.TEXT_NODE && /^\s*第[０-９0-9一二三四五六七八九十]+条\s+[^\n]+\s*$/.test(line.nodeValue)
      )) {
        const block = document.createElement('div');
        block.className = 'bdlr-legal-copy bdlr-legal-rich bandal-registered-legal';
        for (const [i, marker] of markers.entries()) {
          const heading = document.createElement('h2');
          heading.id = marker.id;
          marker.replaceWith(heading);
          heading.append(lines[i]);
          if (heading.nextElementSibling?.tagName === 'BR' && heading.nextSibling === heading.nextElementSibling) heading.nextElementSibling.remove();
        }
        block.append(...terms.childNodes);
        terms.replaceWith(block);
      }
    }
    const policy = page === 'policy' && document.querySelector('main pre.bandal-system-policy');
    if (policy && policy.childElementCount === 0) {
      const block = document.createElement('div');
      block.className = 'bandal-system-policy bdlr-legal-rich bandal-registered-legal';
      const lines = policy.textContent.split(/\n/);
      const headingAt = line => line === '個人情報保護ポリシー' || /^[1-9１-９][.．]\s*[^\n]+$/.test(line);
      if (lines.some(line => headingAt(line.trim()))) {
        let section;
        for (const [index, line] of lines.entries()) {
          const separator = index + 1 < lines.length ? '\n' : '';
          if (headingAt(line.trim())) {
            section = null;
            const heading = document.createElement('h2');
            heading.textContent = line;
            block.append(heading, separator);
          } else {
            if (!section) {
              section = document.createElement('div');
              section.className = 'bandal-registered-policy-paragraphs';
              block.append(section);
            }
            section.append(document.createTextNode(line + separator));
          }
        }
        const style = document.createElement('style');
        style.textContent = 'body.bdlr-policy-page .bandal-registered-policy-paragraphs{white-space:pre-line!important;overflow-wrap:anywhere}';
        document.head.append(style);
        policy.replaceWith(block);
      }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', formatDocument, {once:true});
  else formatDocument();
})();
