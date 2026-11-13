/* The HTML export shows a fixed configuration. Its link opens that configuration in the shop. */
(() => {
  const share=document.querySelector('.bdlr-share-config');
  if (!share) return;
  const sidebar=document.querySelector('[data-bdlr-purchase-mount]');
  const dock=document.querySelector('#bandal-floating-summary');
  const cta=dock?.querySelector('.bandal-floating-summary__cta');
  const result=share.querySelector('.bdlr-share-result');
  const field=result.querySelector('input');
  function place(){
    if (!cta || !sidebar) return;
    const fixed=dock.classList.contains('is-visible') && getComputedStyle(dock).display!=='none';
    if (fixed && share.parentElement!==cta) cta.append(share);
    if (!fixed && sidebar.nextElementSibling!==share) sidebar.after(share);
  }
  if(dock) new MutationObserver(place).observe(dock,{attributes:true,attributeFilter:['class','aria-hidden']});
  window.addEventListener('resize',place);
  place();
  share.querySelector('button').addEventListener('click',async () => {
    const url=share.dataset.previewUrl;
    field.value=url;
    let copied=false;
    try { await navigator.clipboard.writeText(url); copied=true; } catch { /* readonly field is available for manual copying */ }
    result.hidden=false;
    result.querySelector('p').textContent=copied?'URLをコピーしました。LINEなどに貼ると、この構成のまま開けます。':'自動コピーできませんでした。下のURLを選択してコピーしてください。';
    if (!copied) {field.focus();field.select();}
  });
  field.addEventListener('click',()=>field.select());
  document.addEventListener('click',e=>{if(!share.contains(e.target))result.hidden=true;});
  share.addEventListener('keydown',e=>{if(e.key==='Escape'){result.hidden=true;share.querySelector('button').focus();}});
})();
