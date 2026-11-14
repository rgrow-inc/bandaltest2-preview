/* BANDAL's existing LINE inquiries must open its official friend-add account. */
(() => {
  const inquiry = 'https://lin.ee/2PonVjE';
  const campaign = 'https://lin.ee/o5xCCJg';
  const original = /^https?:\/\/bandal-line-scratch\.fly\.dev\/l\/(?:5f4f08e5|39718837|9d3ec9a4|2718e7cb)\/?(?:[?#].*)?$/i;
  const preview = document.documentElement.hasAttribute('data-preview-device');
  const labels = new Set(['LINEで相談', 'LINEで相談する', 'LINE相談', 'LINEで無料相談',
    '購入前相談（LINE）', 'LINEでPCを相談する', 'LINEで価格を相談する',
    'LINEで相談する →', 'LINEで相談 購入前も購入後も', 'LINEで相談（新しいタブで開きます）']);
  const selector = 'a[href*="bandal-line-scratch.fly.dev"], a[href="https://lin.ee/2PonVjE"]' +
    (preview ? ', a[aria-disabled="true"]:not([href])' : '');

  function fix(a) {
    const link = a.getAttribute('href') || '';
    let url;
    if (original.test(link) || link === inquiry) {
      url = inquiry;
    } else if (preview && !link && a.getAttribute('aria-disabled') === 'true') {
      const text = (a.getAttribute('aria-label') || a.textContent.trim() || a.querySelector('img')?.alt || '').trim().replace(/\s+/g, ' ');
      if (labels.has(text) || a.hasAttribute('data-bdlr-line-configuration') || (a.classList.contains('nov-support-cell') && text.startsWith('LINEで相談'))) {
        url = inquiry;
      } else if (text === 'LINEで問い合わせる' && location.pathname.endsWith('/page-review-campaign.html')) {
        url = campaign;
      }
    }
    if (!url) return;
    if (link !== url) a.href = url;
    a.removeAttribute('aria-disabled');
    if (!a.hasAttribute('data-bandal-line-contact')) a.setAttribute('data-bandal-line-contact','');
  }
  function scan(root) {
    if (root.nodeType !== 1) return;
    if (root.matches(selector)) fix(root);
    root.querySelectorAll(selector).forEach(fix);
  }
  scan(document.documentElement);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') {
        if (record.target.matches(selector)) fix(record.target);
      } else {
        for (const node of record.addedNodes) scan(node);
      }
    }
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['href']});
})();
