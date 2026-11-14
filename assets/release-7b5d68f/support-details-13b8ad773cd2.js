;/* BANDAL 9646216: header, service icon, Pro specifications and survey confirmation */
(function () {
  'use strict';
  if (location.hostname !== 'bandaltest2.shop3.makeshop.jp') return;
  const path = location.pathname.endsWith('/') ? location.pathname.slice(0, -1) || '/' : location.pathname;
  const headerSelector = '.bdlr-header, #bdlr-mobile-drawer';

  function alignHeader() {
    const description = document.querySelector('.bdlr-header [data-bdlr-mega-panel="support"] .bdlr-mm__card-copy > span');
    if (description && !description.children.length) {
      const lines = description.textContent.match(/^(構成選びや納期の質問に、)(スタッフが直接お答えします。)(24時間受付／返信.+)$/);
      if (lines) {
        const hours = document.createElement('span');
        hours.className = 'nb';
        hours.textContent = lines[3];
        description.replaceChildren(lines[1], document.createElement('br'), lines[2], document.createElement('br'), hours);
      }
    }
    const links = document.querySelectorAll('.bdlr-header [data-bdlr-mega-panel="products"] a, #bdlr-mobile-drawer a');
    for (const link of links) {
      if (link.pathname !== '/view/category/game_mhwilds' && !link.pathname.endsWith('/category-game_mhwilds.html')) continue;
      for (const part of link.childNodes) {
        if (part.nodeType === Node.TEXT_NODE && part.data.trim() === 'モンハンワイルズ') {
          part.data = part.data.replace('モンハンワイルズ', 'モンスターハンターワイルズ');
        }
      }
    }
  }

  function wrapWireless(cell) {
    if (!cell) return;
    const texts = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
    const parts = [];
    while (texts.nextNode()) {
      const part = texts.currentNode;
      if (part.data.includes('Wi-Fi') && !part.parentElement.closest('.u-nowrap')) parts.push(part);
    }
    for (const part of parts) {
      const offset = part.data.indexOf('Wi-Fi');
      const word = document.createElement('span');
      word.className = 'u-nowrap';
      word.style.whiteSpace = 'nowrap';
      word.textContent = 'Wi-Fi';
      part.replaceWith(part.data.slice(0, offset), word, part.data.slice(offset + word.textContent.length));
    }
  }

  function alignPage() {
    if (path === '/') {
      const line = document.querySelector('svg.bdlr-service-strip__line-icon');
      if (line && line.getAttribute('viewBox') === '0 0 320 320') line.setAttribute('viewBox', '42 44 236 224');
    } else if (path === '/view/page/kenki-collaboration') {
      const comparison = document.getElementById('grade-comparison');
      if (comparison && comparison.rows.length) {
        const pro = Array.from(comparison.rows[0].cells).findIndex(cell => cell.textContent.trim() === 'Pro');
        const row = Array.from(comparison.rows).find(row => row.cells[0]?.textContent.trim() === '無線LAN');
        if (pro >= 0 && row) wrapWireless(row.cells[pro]);
      }
      for (const row of document.querySelectorAll('#kenki-spec-2 tr')) {
        if (['マザーボード', '無線LAN'].includes(row.cells[0]?.textContent.trim())) wrapWireless(row.cells[1]);
      }
    } else if (path === '/view/page/bandal-survey') {
      const mark = document.querySelector('#bandal-survey-success-screen .bandal-success-icon');
      if (!mark || mark.children.length || mark.textContent.trim() !== String.fromCharCode(10003)) return;
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '0 0 256 256');
      svg.setAttribute('class', 'ic ic-check');
      svg.setAttribute('fill', 'currentColor');
      svg.setAttribute('focusable', 'false');
      svg.setAttribute('aria-hidden', 'true');
      const check = document.createElementNS(ns, 'path');
      check.setAttribute('d', 'M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z');
      svg.append(check);
      mark.replaceChildren(svg);
    }
  }

  function start() {
    if (document.documentElement.hasAttribute('data-bandal-support-9646216')) return;
    document.documentElement.setAttribute('data-bandal-support-9646216', '');
    alignHeader();
    alignPage();
    // MakeShop rebuilds the mega menu and its mobile copy during initialization.
    let pending = false;
    const headerRoots = Array.from(document.querySelectorAll(headerSelector));
    const observerSelector = path === '/' ? headerSelector + ', svg.bdlr-service-strip__line-icon' : headerSelector;
    function needsUpdate(change) {
      if (change.target.closest(headerSelector)) return true;
      return Array.from(change.addedNodes).some(node => node.nodeType === Node.ELEMENT_NODE &&
        (node.matches(observerSelector) || node.querySelector(observerSelector)));
    }
    const observer = new MutationObserver(changes => {
      if (pending || !changes.some(needsUpdate)) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        alignHeader();
        if (path === '/') alignPage();
      });
    });
    if (path === '/' || !headerRoots.length) observer.observe(document.body, { childList: true, subtree: true });
    else for (const region of headerRoots) observer.observe(region, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 15000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
