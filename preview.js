/* Navigation and image inspection for the offline design copy. */
(() => {
  const device = document.documentElement.dataset.previewDevice;
  const narrow = matchMedia('(max-width: 767px)');
  function alignDevice() {
    const desired = narrow.matches ? 'sp' : 'pc';
    if (desired === device) return false;
    const dest = new URL(location.href);
    dest.pathname = dest.pathname.replace(/\/(?:pc|sp)\/([^/]+)$/, '/' + desired + '/$1');
    if (dest.pathname === location.pathname) return false;
    location.replace(dest.href);
    return true;
  }
  if (alignDevice()) return;
  narrow.addEventListener('change', alignDevice);

  const drawer = document.querySelector('[data-bdlr-mobile-drawer]');
  const drawerToggle = document.querySelector('[data-bdlr-drawer-open]');
  const shell = document.querySelector('[data-bdlr-mega-shell]');
  const search = document.getElementById('bdlr-header-search');
  const scrim = document.querySelector('[data-bdlr-scrim]');
  let returnFocus;
  function menus(active, trigger) {
    if (trigger) returnFocus = trigger;
    const isDrawer = active === 'drawer';
    const isMega = ['products','feature','parts','support'].includes(active);
    drawer?.classList.toggle('is-open', isDrawer);
    drawer?.setAttribute('aria-hidden', String(!isDrawer));
    drawerToggle?.setAttribute('aria-expanded', String(isDrawer));
    document.body.classList.toggle('bdlr-menu-open', isDrawer);
    shell?.classList.toggle('is-open', isMega);
    shell?.setAttribute('aria-hidden', String(!isMega));
    for (const panel of document.querySelectorAll('[data-bdlr-mega-panel]')) {
      const show = panel.dataset.bdlrMegaPanel === active;
      panel.hidden = !show;
      panel.classList.toggle('is-active', show);
    }
    for (const btn of document.querySelectorAll('[data-bdlr-mega-trigger]')) {
      const expanded = btn.dataset.bdlrMegaTrigger === active;
      btn.classList.toggle('is-active', expanded);
      btn.setAttribute('aria-expanded', String(expanded));
    }
    if (search && matchMedia('(max-width: 980px)').matches) {
      search.hidden = active !== 'search';
      document.querySelectorAll('[data-bdlr-search-open]').forEach(btn =>
        btn.setAttribute('aria-expanded', String(!search.hidden)));
    }
    scrim?.classList.toggle('is-visible', Boolean(active));
    if (isDrawer) drawer?.querySelector('[data-bdlr-drawer-close]')?.focus();
    if (active === 'search') search?.querySelector('input')?.focus();
    if (!active) returnFocus?.focus();
  }

  document.addEventListener('click', evt => {
    const button = evt.target.closest('button,[data-bdlr-scrim]');
    if (!button) return;
    if (button.hasAttribute('data-bdlr-drawer-open')) menus('drawer', button);
    if (button.hasAttribute('data-bdlr-search-open')) menus('search', button);
    if (button.hasAttribute('data-bdlr-mega-trigger')) {
      menus(button.getAttribute('aria-expanded') === 'true' ? null : button.dataset.bdlrMegaTrigger, button);
    }
    if (button.matches('[data-bdlr-scrim],[data-bdlr-drawer-close],[data-bdlr-search-close]')) menus(null);
    const strip = button.closest('.item-image-small');
    if (strip) {
      const selected = button.querySelector('img');
      const hero = document.querySelector('.item-image-large img');
      if (!selected || !hero) return;
      hero.src = selected.currentSrc || selected.src;
      hero.alt = selected.alt;
      const options = Array.from(strip.querySelectorAll('button'));
      for (const option of options) {
        option.setAttribute('aria-pressed', String(option === button));
        option.closest('li')?.classList.toggle('is-current', option === button);
      }
      const counter = document.querySelector('.bdlr-gallery-counter');
      if (counter) counter.textContent = (options.indexOf(button) + 1) + ' / ' + options.length;
    }
  });
  document.addEventListener('keydown', evt => {
    if (evt.key === 'Escape' && (drawer?.classList.contains('is-open') || shell?.classList.contains('is-open') || returnFocus)) {
      menus(null);
      returnFocus = null;
    }
  });
})();

/* BANDAL header and FV / designer 9e7de60. Use the shop's own links and media. */
(() => {
  const live = location.hostname === 'bandaltest2.shop3.makeshop.jp';
  const preview = document.documentElement.hasAttribute('data-preview-device');
  if ((!live && !preview) || document.getElementById('bandal-header-fv-9e7de60')) return;
  const style = document.createElement('link');
  style.id='bandal-header-fv-9e7de60'; style.rel='stylesheet';
  style.href=(live ? 'https://rgrow-inc.github.io/bandaltest2-preview/assets/ui-20261113/' : '../assets/ui-20261113/')+'header-fv-9e7de60.css';
  const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;};
  function account(){
    const source=document.querySelector('.bdlr-header .bdlr-member-links');
    const links=source && [...source.querySelectorAll('a')];
    if(!links || !links.length || !links.some(a=>a.textContent.trim()==='ログイン'))return;
    const login=links.find(a=>a.textContent.trim()==='ログイン'),signup=links.find(a=>a.textContent.includes('会員登録'));
    if(!signup || links.length!==2)return;
    const template=document.createElement('template');template.innerHTML="<div class=\"bdlr-account\" data-bdlr-account=\"\"><button aria-controls=\"bdlr-account-menu\" aria-expanded=\"false\" class=\"bdlr-account__trigger\" data-bdlr-account-trigger=\"\" type=\"button\"><svg aria-hidden=\"true\" class=\"ic\" fill=\"currentColor\" focusable=\"false\" viewBox=\"0 0 256 256\"><path d=\"M229.19,213c-15.81-27.32-40.63-46.49-69.47-54.62a70,70,0,1,0-63.44,0C67.44,166.5,42.62,185.67,26.81,213a6,6,0,1,0,10.38,6C56.4,185.81,90.34,166,128,166s71.6,19.81,90.81,53a6,6,0,1,0,10.38-6ZM70,96a58,58,0,1,1,58,58A58.07,58.07,0,0,1,70,96Z\"></path></svg><span>ログイン</span></button><div aria-label=\"アカウント\" class=\"bdlr-account__menu\" hidden=\"\" id=\"bdlr-account-menu\"><p class=\"bdlr-account__title\">BANDALにログイン</p><a aria-disabled=\"true\" class=\"bdlr-account__login\">ログイン</a><div class=\"bdlr-account__new\"><span>はじめての方</span><a aria-disabled=\"true\">新規会員登録<i aria-hidden=\"true\">→</i></a></div></div></div>";
    const box=template.content.firstElementChild,btn=box.querySelector('button'),menu=box.querySelector('.bdlr-account__menu');
    for(const [from,to] of [[login,menu.querySelector('.bdlr-account__login')],[signup,menu.querySelector('.bdlr-account__new a')]]){
      for(const key of ['href','target','rel','aria-disabled']){if(from.hasAttribute(key))to.setAttribute(key,from.getAttribute(key));else to.removeAttribute(key);}
    }
    const set=open=>{menu.hidden=!open;btn.setAttribute('aria-expanded',String(open));};
    btn.addEventListener('click',()=>set(menu.hidden));
    document.addEventListener('click',e=>{if(!box.contains(e.target))set(false);});
    box.addEventListener('focusout',e=>{if(!box.contains(e.relatedTarget))set(false);});
    box.addEventListener('keydown',e=>{if(e.key==='Escape' && !menu.hidden){set(false);e.stopPropagation();btn.focus();}});
    source.replaceWith(box);
  }
  function slider(){
    const source=document.querySelector('.bdlr-hero:not(.bdlr-fv)');
    if(!source)return;
    const original=[...source.querySelectorAll('[data-bdlr-slide]')].filter(s=>s.querySelector('img'));
    if(!original.length)return;
    const root=el('section','bdlr-hero bdlr-fv'), viewport=el('div','bdlr-fv__viewport'),track=el('div','bdlr-fv__track'),dots=el('div','bdlr-fv__dots');
    root.setAttribute('aria-label',source.getAttribute('aria-label')||'注目キャンペーン');root.setAttribute('aria-roledescription','carousel');root.dataset.bdlrFv='';
    const cards=original.map((s,i)=>{
      const card=el(s.hasAttribute('href')?'a':'div','bdlr-fv__slide');
      for(const key of ['href','rel','target'])if(s.hasAttribute(key))card.setAttribute(key,s.getAttribute(key));
      const img=s.querySelector('img').cloneNode(true);if(!i){img.loading='eager';img.fetchPriority='high';}
      card.append(img);const cap=s.querySelector('.audit-mobile-caption');if(cap)card.append(el('span','bdlr-fv__cap',cap.textContent.trim()));
      const d=el('button');d.type='button';d.setAttribute('aria-label',(i+1)+'枚目：'+img.alt);d.addEventListener('click',()=>move(i,true));dots.append(d);return card;
    });
    const n=cards.length, count=Math.min(2,n-1);
    const dup=s=>{const c=s.cloneNode(true);c.removeAttribute('href');c.setAttribute('aria-hidden','true');return c;};
    const all=[...(count?cards.slice(-count).map(dup):[]),...cards,...cards.slice(0,count).map(dup)];track.append(...all);viewport.append(track);root.append(viewport);if(n>1)root.append(dots);
    source.replaceWith(root);root.classList.add('is-ready');
    const mod=x=>(x%n+n)%n;let index=0,timer,hover=false,focus=false,down=null,swiped=false;
    const reduce=matchMedia('(prefers-reduced-motion:reduce)');
    function position(animate){
      root.classList.toggle('is-jump',!animate);const gap=parseFloat(getComputedStyle(track).columnGap)||0,w=all[0].getBoundingClientRect().width,k=index+count;
      track.style.transform='translate3d('+(viewport.clientWidth/2-w/2-k*(w+gap))+'px,0,0)';
      all.forEach((s,j)=>s.classList.toggle('is-current',j===k));
      cards.forEach((s,j)=>{const active=j===mod(index);s.setAttribute('aria-hidden',String(!active));if(s.hasAttribute('href'))s.tabIndex=active?0:-1;dots.children[j].setAttribute('aria-current',String(active));});
      if(!animate){void track.offsetWidth;root.classList.remove('is-jump');}
    }
    function restart(){clearTimeout(timer);if(n>1&&!hover&&!focus&&!reduce.matches&&!document.hidden)timer=setTimeout(()=>move(mod(index)+1,true),5000);}
    function move(next,animate){
      if(index!==mod(index)){index=mod(index);position(false);}
      index=animate&&!reduce.matches?next:mod(next);position(animate&&!reduce.matches);restart();
    }
    track.addEventListener('transitionend',e=>{if(e.target===track&&e.propertyName==='transform'&&index!==mod(index)){index=mod(index);position(false);}});
    const swipe=(x)=>{if(down!==null && Math.abs(x-down)>40){swiped=true;move(mod(index)+(x<down?1:-1),true);}down=null;};
    viewport.addEventListener('pointerdown',e=>{swiped=false;down=e.pointerType==='mouse'?null:e.clientX;});
    viewport.addEventListener('pointerup',e=>swipe(e.clientX));viewport.addEventListener('pointercancel',()=>{down=null;});
    viewport.addEventListener('click',e=>{if(swiped){e.preventDefault();swiped=false;}},true);
    root.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hover=true;restart();}});root.addEventListener('pointerleave',()=>{hover=false;restart();});
    root.addEventListener('focusin',()=>{focus=true;restart();});root.addEventListener('focusout',e=>{focus=root.contains(e.relatedTarget);restart();});
    document.addEventListener('visibilitychange',restart);reduce.addEventListener('change',restart);
    if(window.ResizeObserver)new ResizeObserver(()=>position(false)).observe(viewport);else window.addEventListener('resize',()=>position(false));
    position(false);restart();
  }
  function install(){account();slider();}
  style.onload=()=>{if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();};
  document.head.append(style);
})();
