const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('.mobile-nav');
if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    mobileNav.hidden = !open;
  });
}

const monthlyLabel = document.querySelector('#monthly-label');
if (monthlyLabel) {
  const monthInJapan = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit' }).format(new Date());
  if (monthInJapan !== '2026-09') monthlyLabel.textContent = '最新の歌ってみた';
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function closeDialogSoftly(dialog, duration = 320) {
  if (!dialog?.open || dialog.classList.contains('is-closing')) return;

  if (reducedMotion.matches) {
    dialog.close();
    return;
  }

  dialog.classList.add('is-closing');
  window.setTimeout(() => {
    if (dialog.open) dialog.close();
    dialog.classList.remove('is-closing');
  }, duration);
}
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const progress = document.querySelector('.reading-progress');
let progressQueued = false;
let motionEnergy = 0, lastScrollAt = 0, previousScroll = scrollY;
function updateProgress() {
  motionEnergy = Math.min(18, Math.abs(scrollY - previousScroll) / 8);
  previousScroll = scrollY; lastScrollAt = performance.now();
  const travel = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.transform = `scaleX(${travel > 0 ? Math.min(1, scrollY / travel) : 0})`;
  progressQueued = false;
}
addEventListener('scroll', () => { if (!progressQueued) { progressQueued = true; requestAnimationFrame(updateProgress); } }, { passive: true });
addEventListener('resize', updateProgress, { passive: true });
updateProgress();
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.editorial-intro, .chapter-row, .detail-block, .story-card, .guide-section, .record-year, .original-heading, .monthly-copy, .contact-grid article, .link-group, .music-heading').forEach(el => { el.classList.add('reveal-pending'); observer.observe(el); });
  const textObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); textObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -4% 0px' });
  const grouped = '.editorial-intro,.chapter-row,.detail-block,.story-card,.guide-section,.record-year,.original-heading,.monthly-copy,.contact-grid article,.link-group,.music-heading';
  document.querySelectorAll('main h2, main h3, main p, main li, main .fact, main .tag-card, main .link-row').forEach((el, index) => {
    if (el.closest(grouped)) return;
    el.classList.add('text-enter');
    el.style.setProperty('--text-delay', `${(index % 4) * 70}ms`);
    textObserver.observe(el);
  });
}
if (finePointer.matches && !reducedMotion.matches && !new URLSearchParams(location.search).has('capture')) {
  const siteSpot = document.createElement('span');
  siteSpot.className = 'site-pointer-spot';
  siteSpot.setAttribute('aria-hidden', 'true');
  document.body.append(siteSpot);
  document.documentElement.classList.add('site-spotlight-ready');

  let spotTargetX = innerWidth * 0.5;
  let spotTargetY = innerHeight * 0.5;
  let spotX = spotTargetX;
  let spotY = spotTargetY;
  let spotFrame = 0;

  const drawSiteSpot = () => {
    spotFrame = 0;
    if (!siteSpot.isConnected) return;
    spotX += (spotTargetX - spotX) * 0.14;
    spotY += (spotTargetY - spotY) * 0.14;
    siteSpot.style.transform = `translate3d(${spotX}px,${spotY}px,0) translate(-50%,-50%)`;

    if (Math.abs(spotTargetX - spotX) > 0.2 || Math.abs(spotTargetY - spotY) > 0.2) {
      spotFrame = requestAnimationFrame(drawSiteSpot);
    }
  };

  addEventListener('pointermove', event => {
    spotTargetX = event.clientX;
    spotTargetY = event.clientY;
    document.documentElement.classList.add('site-spotlight-active');
    if (!spotFrame) spotFrame = requestAnimationFrame(drawSiteSpot);
  }, { passive: true });

  addEventListener('blur', () => document.documentElement.classList.remove('site-spotlight-active'));
  addEventListener('focus', () => document.documentElement.classList.add('site-spotlight-active'));
}

if (finePointer.matches && !reducedMotion.matches) {
  document.querySelectorAll('.song-frame').forEach(frame => {
    frame.addEventListener('pointermove', event => {
      const box = frame.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      frame.style.setProperty('--spot-x', `${x * 100}%`);
      frame.style.setProperty('--spot-y', `${y * 100}%`);
      frame.style.setProperty('--tilt-x', `${(0.5 - y) * 5}deg`);
      frame.style.setProperty('--tilt-y', `${(x - 0.5) * 6}deg`);
    });
    frame.addEventListener('pointerleave', () => { frame.style.setProperty('--tilt-x', '0deg'); frame.style.setProperty('--tilt-y', '0deg'); });
  });
  const hero = document.querySelector('.cinema-hero');
  const art = hero?.querySelector('.cinema-art');
  hero?.addEventListener('pointermove', event => {
    const box = hero.getBoundingClientRect();
    art.style.transform = `translate(${((event.clientX-box.left)/box.width-.5)*38}px, ${((event.clientY-box.top)/box.height-.5)*28}px)`;
  });
  hero?.addEventListener('pointerleave', () => { art.style.transform = ''; });
}

document.querySelectorAll('.music-showcase').forEach(section => {
  const viewport = section.querySelector('.song-viewport');
  const track = section.querySelector('.song-track');
  const firstSet = track.querySelector('.song-set');
  const toggle = section.querySelector('.gallery-toggle');
  const autoCapable = () => finePointer.matches && !reducedMotion.matches;
  let paused = !autoCapable(), hovering = false, focused = false, visible = false, touchedUntil = 0, last = 0, fractional = 0;
  viewport.classList.add('is-interactive');
  viewport.tabIndex = 0;
  viewport.setAttribute('aria-label', '楽曲一覧。左右キーでも曲を送れます');
  function fillTrack() {
    track.querySelectorAll('[data-extra]').forEach(el => el.remove());
    if (!autoCapable()) return;
    const width = firstSet.getBoundingClientRect().width;
    if (width <= 0) return;
    const copies = Math.ceil(viewport.clientWidth / width);
    for (let i = 0; i < copies; i++) {
      const clone = firstSet.cloneNode(true);
      clone.setAttribute('aria-hidden','true'); clone.removeAttribute('inert'); clone.dataset.extra = 'true';
      clone.querySelectorAll('a').forEach(a => a.tabIndex = -1);
      track.append(clone);
    }
  }
  function updateButton() {
    toggle.textContent = paused ? '自動で流す' : '流れを止める';
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.hidden = !autoCapable();
  }
  function move(direction) {
    paused = true; updateButton();
    const distance = firstSet.querySelector('.song-frame').getBoundingClientRect().width + 24;
    if (direction < 0 && viewport.scrollLeft < 1 && autoCapable()) viewport.scrollLeft = firstSet.getBoundingClientRect().width;
    viewport.scrollBy({left:direction*distance,behavior:reducedMotion.matches?'instant':'smooth'});
  }
  section.querySelector('.gallery-prev').addEventListener('click',()=>move(-1));
  section.querySelector('.gallery-next').addEventListener('click',()=>move(1));
  toggle.addEventListener('click',()=>{paused=!paused;updateButton();});
  section.querySelector('.gallery-shuffle').addEventListener('click', () => {
    const cards = [...firstSet.children];
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    firstSet.replaceChildren(...cards);
    track.querySelectorAll('.song-set[aria-hidden]').forEach(el => el.remove());
    fillTrack(); viewport.scrollLeft = 0;
    if (!reducedMotion.matches) viewport.animate([{opacity:.25,transform:'translateY(15px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'ease-out'});
  });
  viewport.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowLeft'?-1:1);}});
  viewport.addEventListener('pointerenter',()=>hovering=true);
  viewport.addEventListener('pointerleave',()=>hovering=false);
  viewport.addEventListener('focusin',()=>focused=true);
  viewport.addEventListener('focusout',event=>{focused=viewport.contains(event.relatedTarget);});
  viewport.addEventListener('wheel',()=>{touchedUntil=performance.now()+2500;},{passive:true});
  viewport.addEventListener('pointerdown',()=>{touchedUntil=performance.now()+2500;},{passive:true});
  if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}).observe(section); else visible=true;
  function tick(now) {
    const delta=Math.min(now-last,50);last=now;
    if(visible&&!document.hidden&&!paused&&!hovering&&!focused&&autoCapable()&&now>touchedUntil){
      const loop=firstSet.getBoundingClientRect().width;
      const boost = now-lastScrollAt < 250 ? motionEnergy : 0;
      fractional += delta*(.052+boost*.005);
      const pixels = Math.floor(fractional); fractional -= pixels;
      if (section.querySelector('#collab-title')) {
        if(viewport.scrollLeft < pixels) viewport.scrollLeft += loop;
        viewport.scrollLeft -= pixels;
      } else {
        viewport.scrollLeft+=pixels;
        if(loop&&viewport.scrollLeft>=loop)viewport.scrollLeft-=loop;
      }
    }
    requestAnimationFrame(tick);
  }
  fillTrack();updateButton();requestAnimationFrame(tick);
  addEventListener('resize',fillTrack,{passive:true});
  reducedMotion.addEventListener('change',()=>{paused=true;fillTrack();updateButton();});
});

// Character introduction: native dialog provides focus trapping and Escape support.
const characterDialog = document.querySelector('#character-dialog');
const characterAssetData = document.querySelector('#character-assets');
if (characterDialog && characterAssetData) {
  const assets = JSON.parse(characterAssetData.textContent);
  const figure = characterDialog.querySelector('.character-figure');
  const visual = characterDialog.querySelector('#character-image');
  const label = characterDialog.querySelector('#character-image-label');
  const note = characterDialog.querySelector('#character-note');
  const selectors = [...characterDialog.querySelectorAll('[data-character-index]')];
  let selected = 0, request = 0, trigger = null, oldOverflow = '';
  function showCharacter(index, animate = true) {
    const next = (index + assets.length) % assets.length;
    const asset = assets[next];
    const ticket = ++request;
    const preload = new Image();
    figure.setAttribute('aria-busy', 'true');
    preload.onload = () => {
      if (ticket !== request) return;
      selected = next;
      visual.hidden = false;
      visual.src = asset.src;
      visual.alt = asset.alt;
      visual.width = asset.width;
      visual.height = asset.height;
      figure.dataset.kind = asset.kind;
      figure.removeAttribute('aria-busy');
      label.textContent = `${String(next + 1).padStart(2, '0')} / ${String(assets.length).padStart(2, '0')} — ${asset.label}`;
      note.textContent = asset.description;
      characterDialog.querySelector('.character-scene').style.setProperty('--character-tint', ['#286f72','#70518e','#345975','#8a597e','#476c85','#587ba0'][next % 6]);
      selectors.forEach((button, i) => button.setAttribute('aria-pressed', String(i === next)));
      if (animate && !reducedMotion.matches) {
        visual.animate([{ opacity: 0, transform: 'translateX(24px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
        note.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 480, easing: 'ease-out' });
      }
    };
    preload.onerror = () => {
      if (ticket !== request) return;
      figure.removeAttribute('aria-busy');
      label.textContent = '画像を読み込めませんでした。もう一度選んでください。';
    };
    preload.src = asset.poster || asset.src;
  }
  document.querySelectorAll('[data-character-open]').forEach(button => {
    button.addEventListener('click', () => {
      trigger = button;
      oldOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      characterDialog.showModal();
      characterDialog.scrollTop = 0;
      showCharacter(0, false);
      assets.forEach(asset => { const image = new Image(); image.src = asset.poster || asset.src; });
    });
  });
  characterDialog.querySelector('.character-close').addEventListener('click', () => closeDialogSoftly(characterDialog));
  characterDialog.addEventListener('close', () => {
    ++request;
    characterDialog.classList.remove('is-closing');
    document.body.style.overflow = oldOverflow;
    if (trigger) trigger.focus({ preventScroll: true });
  });
  characterDialog.addEventListener('click', event => {
    if (event.target !== characterDialog) return;
    const rect = characterDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialogSoftly(characterDialog);
  });
  characterDialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeDialogSoftly(characterDialog);
  });
  let touchStart = null, suppressClickUntil = 0;
  figure.addEventListener('touchstart', event => { const t=event.touches[0];touchStart={x:t.clientX,y:t.clientY}; }, {passive:true});
  figure.addEventListener('touchend', event => {
    if(!touchStart)return;
    const t=event.changedTouches[0], dx=t.clientX-touchStart.x, dy=t.clientY-touchStart.y;
    if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.4){suppressClickUntil=performance.now()+450;showCharacter(selected+(dx<0?1:-1));}
    touchStart=null;
  }, {passive:true});
  figure.addEventListener('touchcancel',()=>{touchStart=null;});
  figure.addEventListener('click', () => {if(performance.now()>suppressClickUntil)showCharacter(selected+1);});
  characterDialog.querySelectorAll('[data-character-step]').forEach(button => button.addEventListener('click', () => showCharacter(selected + Number(button.dataset.characterStep))));
  selectors.forEach(button => button.addEventListener('click', () => showCharacter(Number(button.dataset.characterIndex))));
  characterDialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); showCharacter(selected + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
}

// A short cinematic interlude connects internal pages. Normal link behavior is
// preserved for new tabs, external destinations, same-page anchors and reduced motion.
const scenes = new Map([
  ['/', ['00', 'HOME', 'ホーム']], ['/profile/', ['01', 'PROFILE', 'プロフィール']],
  ['/music/', ['02', 'MUSIC', '歌']], ['/guide/', ['03', 'FAN GUIDE', '応援ガイド']],
  ['/activity/', ['04', 'ACTIVITY', '活動のいろいろ']], ['/works/', ['05', 'WORKS', '活動の記録']],
  ['/links/', ['06', 'LINKS', 'リンク']],
  ['/projects/', ['07', 'PROJECTS', '企画']],
  ['/projects/fashion-show/', ['07', 'FASHION SHOW', 'ファッションショー']],
  ['/projects/showcase-a/', ['07', 'showcase.A', 'showcase.A']]
]);
const burstPalette = ['#baffdb', '#a8e8ff', '#c9adff', '#f6b4e8', '#ffffff'];
function filmInterlude(scene, arriving = false) {
  const handoff = arriving && document.querySelector('.film-interlude.is-handoff');
  if (handoff) {
    document.body.append(handoff);
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('film-arrival-pending');
      handoff.classList.add('is-arriving');
    });
    return handoff;
  }
  const layer = document.createElement('div');
  layer.className = `film-interlude${arriving ? ' is-arriving' : ''}`;
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `<div class="film-shutter film-shutter-top"></div><div class="film-shutter film-shutter-bottom"></div><div class="film-grain"></div><div class="film-seam"><i></i><i></i></div><div class="film-card"><span class="film-eyebrow">ASAHA NEMUI / SCENE CHANGE</span><div class="film-orbit"><svg viewBox="0 0 240 240" aria-hidden="true"><defs><path id="film-orbit-path" d="M 120,120 m -93,0 a 93,93 0 1,1 186,0 a 93,93 0 1,1 -186,0"></path></defs><text><textPath href="#film-orbit-path" textLength="584.34" lengthAdjust="spacing">ASAHA NEMUI ✦ NEXT SCENE ✦ ASAHA NEMUI ✦ NEXT SCENE ✦ </textPath></text></svg><span class="film-mark">ゐ</span></div><span class="film-scene"></span><span class="film-counter">00</span><span class="film-progress"><i></i></span></div><div class="film-objective"><span class="film-objective-pin">✦</span><span class="film-objective-ring"></span></div><div class="film-destination"><small>NEXT OBJECTIVE / CH. <b></b></small><strong></strong><span></span></div>`;
  const [number, title, japanese] = scene;
  layer.querySelector('.film-scene').textContent = title;
  layer.querySelector('.film-destination b').textContent = number;
  layer.querySelector('.film-destination strong').textContent = title;
  layer.querySelector('.film-destination span').textContent = 'ENTERING PAGE';
  for (let i = 0; i < 24; i++) {
    const star = document.createElement('span');
    const angle = i * Math.PI * 2 / 24 + (Math.random() - .5) * .22;
    const distance = 95 + Math.random() * Math.min(innerWidth, innerHeight) * .48;
    star.className = 'burst-star';
    star.textContent = i % 4 === 0 ? '✦' : '✧';
    star.style.setProperty('--burst-x', `${Math.cos(angle) * distance}px`);
    star.style.setProperty('--burst-y', `${Math.sin(angle) * distance}px`);
    star.style.setProperty('--burst-delay', `${180 + Math.random() * 260}ms`);
    star.style.setProperty('--burst-size', `${11 + Math.random() * 16}px`);
    star.style.color = burstPalette[i % burstPalette.length];
    layer.append(star);
  }
  document.body.append(layer);
  requestAnimationFrame(() => {
    layer.classList.add('is-active');
    document.documentElement.classList.remove('film-arrival-pending');
  });
  if (!arriving) {
    const counter = layer.querySelector('.film-counter');
    const started = performance.now();
    function count(now) {
      if (!layer.isConnected) return;
      const fraction = Math.min(1, (now - started) / 500);
      counter.textContent = String(Math.round(92 * (1 - (1 - fraction) ** 2))).padStart(2, '0');
      if (fraction < 1) requestAnimationFrame(count);
    }
    requestAnimationFrame(count);
  } else {
    layer.querySelector('.film-counter').textContent = '100';
  }
  return layer;
}
let changingPage = false;
if (!window.__ASAHANEMUI_TRANSITION_MANAGED__ && !reducedMotion.matches) {
  document.addEventListener('click', event => {
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.hasAttribute('download') || anchor.target && anchor.target !== '_self') return;
    const destination = new URL(anchor.href, location.href);
    if (destination.origin !== location.origin || destination.pathname === location.pathname && destination.search === location.search) return;
    event.preventDefault();
    if (changingPage) return;
    changingPage = true;
    filmInterlude(scenes.get(destination.pathname) || ['—', 'NEXT SCENE', '次のページ']);
    setTimeout(() => location.assign(destination.href), 650);
  });
  addEventListener('pageshow', event => {
    if (event.persisted) {
      changingPage = false;
      document.querySelectorAll('.film-interlude').forEach(layer => layer.remove());
    }
  });
}

// Two supplied key visuals trade places when the image is tapped.
const keyVisualStage = document.querySelector('.profile-kv-stage');
keyVisualStage?.addEventListener('click', () => {
  const alternate = keyVisualStage.classList.toggle('is-alt');
  document.querySelector('.profile-kv-count').textContent = alternate ? '02 / 02' : '01 / 02';
  keyVisualStage.setAttribute('aria-label', alternate ? '前のキービジュアルを見る' : '次のキービジュアルを見る');
});

// Searchable catalog and a single, user-initiated YouTube player.
const libraryItems = [...document.querySelectorAll('.library-item')];
const searchInput = document.querySelector('#song-search');
let selectedCategory = 'all';
const normaliseSearch = value => value.normalize('NFKC').toLocaleLowerCase().trim();
function filterSongs() {
  const words = normaliseSearch(searchInput?.value || '').split(/\s+/).filter(Boolean);
  let count = 0;
  libraryItems.forEach(item => {
    const visible = (selectedCategory === 'all' || item.dataset.category === selectedCategory) && words.every(word => normaliseSearch(item.dataset.search).includes(word));
    item.hidden = !visible;
    if (visible) count++;
  });
  document.querySelector('#song-results').textContent = `${count}曲`;
  document.querySelector('.library-empty').hidden = count !== 0;
}
searchInput?.addEventListener('input', filterSongs);
document.querySelectorAll('[data-song-filter]').forEach(button => button.addEventListener('click', () => {
  selectedCategory = button.dataset.songFilter;
  document.querySelectorAll('[data-song-filter]').forEach(x => x.setAttribute('aria-pressed', String(x === button)));
  filterSongs();
}));
const player = document.querySelector('#song-player');
if (player) {
  const songs = JSON.parse(document.querySelector('#song-data').textContent);
  const screen = player.querySelector('.player-screen');
  let playing = 0, opener = null, oldOverflow = '', queue = songs;
  const palette = ['#416e84','#7963a6','#3b8d81','#995a86'];
  function selectSong(index) {
    playing = (index + queue.length) % queue.length;
    const song = queue[playing];
    player.querySelector('#player-title').textContent = song.title;
    player.querySelector('.player-external').href = `https://www.youtube.com/watch?v=${song.videoId}`;
    const iframe = document.createElement('iframe');
    iframe.title = `${song.title} / YouTubeプレイヤー`;
    iframe.src = `https://www.youtube-nocookie.com/embed/${song.videoId}?playsinline=1&rel=0`;
    iframe.allow = 'encrypted-media; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    screen.replaceChildren(iframe);
    player.style.setProperty('--player-glow', palette[playing % palette.length]);
    if (!reducedMotion.matches) screen.animate([{opacity:0,transform:'translateY(18px) scale(.96)'},{opacity:1,transform:'none'}], {duration:430,easing:'cubic-bezier(.16,1,.3,1)'});
  }
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.closest('#song-player')) return;
    const url = new URL(link.href, location.href);
    const id = url.hostname === 'www.youtube.com' ? url.searchParams.get('v') : null;
    if (!id || !songs.some(x => x.videoId === id)) return;
    event.preventDefault();
    opener = link;
    queue = link.closest('#song-library') ? libraryItems.filter(x=>!x.hidden).map(item=>songs.find(song=>item.querySelector('a').href.includes(song.videoId))).filter(Boolean) : songs;
    const index = queue.findIndex(x=>x.videoId===id);
    oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    player.showModal();
    selectSong(index);
  });
  player.querySelector('.player-close').addEventListener('click',()=>closeDialogSoftly(player));
  player.addEventListener('close',()=>{player.classList.remove('is-closing');screen.replaceChildren();document.body.style.overflow=oldOverflow;opener?.focus({preventScroll:true});});
  player.addEventListener('click',event=>{if(event.target===player){const r=player.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialogSoftly(player);}});
  player.addEventListener('cancel',event=>{event.preventDefault();closeDialogSoftly(player);});
    player.querySelectorAll('[data-player-step]').forEach(button=>button.addEventListener('click',()=>selectSong(playing+Number(button.dataset.playerStep))));
}

// One random discovery per device and Japan calendar day; no account required.
const dailyButton = document.querySelector('.daily-draw-button');
if (dailyButton) {
  const allSongs = JSON.parse(document.querySelector('#song-data').textContent);
  const pool = [...new Map(allSongs.map(song => [song.videoId, song])).values()];
  const result = document.querySelector('#daily-result');
  const storageKey = 'asaha-daily-song-v1';
  const collectionKey = 'asaha-song-collection-v1';
  const collectionList = document.querySelector('#collection-list');
  let history = [], storageWorks = true;
  try {
    const savedHistory = JSON.parse(localStorage.getItem(collectionKey) || '[]');
    if(Array.isArray(savedHistory)) history = savedHistory.filter(x => x && /^\d{4}-\d{2}-\d{2}$/.test(x.day) && pool.some(song=>song.videoId===x.id));
    const previous = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if(previous && /^\d{4}-\d{2}-\d{2}$/.test(previous.day) && pool.some(song=>song.videoId===previous.id) && !history.some(x=>x.day===previous.day)) history.push({day:previous.day,id:previous.id});
  } catch { storageWorks=false; }
  function renderCollection() {
    collectionList.replaceChildren();
    const grouped = new Map();
    history.slice().sort((a,b)=>b.day.localeCompare(a.day)).forEach(entry=>{
      if(!grouped.has(entry.id))grouped.set(entry.id,[]);
      grouped.get(entry.id).push(entry.day);
    });
    for(const [id,dates] of grouped){
      const song=pool.find(x=>x.videoId===id);
      const link=document.createElement('a');link.className='collection-card';
      link.href=`https://www.youtube.com/watch?v=${id}`;link.target='_blank';link.rel='noopener noreferrer';
      const img=document.createElement('img');img.src=`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;img.alt='';img.loading='lazy';img.width=480;img.height=360;
      const text=document.createElement('div');
      const title=document.createElement('strong');title.textContent=song.title;
      const date=document.createElement('small');date.textContent=dates.join(' / ');
      const credit=document.createElement('span');credit.className='collection-credit';credit.textContent=song.artist;
      text.append(title,credit);
      if(song.collaborators?.length){const guests=document.createElement('span');guests.className='song-collaborators';guests.textContent='with '+song.collaborators.join('・');text.append(guests);}
      text.append(date);link.append(img,text);collectionList.append(link);
    }
    document.querySelector('#collection-count').textContent=`${grouped.size}曲 / ${history.length}日`;
    document.querySelector('#collection-empty').hidden=history.length>0;
    if(!storageWorks)document.querySelector('.collection-note').textContent='ブラウザに保存できないため、今回はこのページを開いている間だけ記録されます。';
  }
  function savePick() {
    if(!history.some(x=>x.day===activeDay))history.push({day:activeDay,id:picked.videoId});
    try{localStorage.setItem(collectionKey,JSON.stringify(history));}catch{storageWorks=false;}
    renderCollection();
  }
  renderCollection();
  const dayInJapan = () => new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  let activeDay = dayInJapan(), picked = null;
  function recall() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved?.day === activeDay) picked = pool.find(song => song.videoId === saved.id) || null;
    } catch { /* The pick still works for this visit when storage is unavailable. */ }
  }
  function renderPick(animate = false) {
    const link = document.createElement('a');
    link.className = 'daily-song-card';
    link.href = `https://www.youtube.com/watch?v=${picked.videoId}`;
    link.target = '_blank';link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `${picked.title}を聴く`);
    const img = document.createElement('img');
    img.src = `https://i.ytimg.com/vi/${picked.videoId}/hqdefault.jpg`;
    img.alt = '';img.width=480;img.height=360;
    const text = document.createElement('div');
    const label = document.createElement('small');label.textContent = 'TODAY’S PICK';
    const title = document.createElement('strong');title.textContent=picked.title;
    const artist = document.createElement('span');artist.textContent=picked.artist;
    const play = document.createElement('b');play.textContent='聴いてみる ↗';
    text.append(label,title,artist);
    if(picked.collaborators?.length){const guests=document.createElement('span');guests.className='song-collaborators';guests.textContent='with '+picked.collaborators.join('・');text.append(guests);}
    text.append(play);link.append(img,text);
    const share=document.createElement('a');share.className='daily-share';
    const shareUrl=new URL('https://x.com/intent/tweet');
    shareUrl.searchParams.set('text',`今日の一曲は「${picked.title}」でした。\nあさはねむゐの歌のおみくじ ✦\n${link.href}\n\n一曲を引く → ${location.origin}/music/#daily-pick`);
    share.href=shareUrl.href;share.target='_blank';share.rel='noopener noreferrer';share.textContent='今日の一曲をXでシェア ↗';
    result.replaceChildren(link,share);result.hidden=false;dailyButton.hidden=true;
    savePick();
    if(animate && !reducedMotion.matches) link.animate([{opacity:0,transform:'translateY(28px) rotate(-4deg) scale(.94)'},{opacity:1,transform:'translateY(0) rotate(0) scale(1)'}],{duration:650,easing:'cubic-bezier(.16,1,.3,1)'});
  }
  function refreshDay() {
    const today = dayInJapan();
    if (today === activeDay) return;
    activeDay=today;picked=null;result.hidden=true;result.replaceChildren();dailyButton.hidden=false;
    recall();if(picked)renderPick();
  }
  recall();if(picked)renderPick();
  dailyButton.addEventListener('click',()=>{
    refreshDay();
    if(!picked){
      const random = new Uint32Array(1);crypto.getRandomValues(random);
      picked=pool[Math.floor((random[0]/4294967296)*pool.length)];
      try{localStorage.setItem(storageKey,JSON.stringify({day:activeDay,id:picked.videoId}));}catch{}
    }
    renderPick(true);
    result.querySelector('a').focus({preventScroll:true});
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDay();});
  setInterval(refreshDay,60000);
}

function updateAuroraTime() {
  const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',hour:'2-digit',hourCycle:'h23'}).format(new Date()));
  document.documentElement.dataset.auroraTime=hour>=5&&hour<10?'dawn':hour>=10&&hour<17?'day':hour>=17&&hour<20?'dusk':'night';
}
updateAuroraTime();setInterval(updateAuroraTime,60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateAuroraTime();});
let secretBusy=false;
document.querySelector('.secret-star')?.addEventListener('click',()=>{
  if(secretBusy)return;secretBusy=true;
  const layer=document.createElement('div');layer.className='secret-sky';layer.setAttribute('aria-hidden','true');
  for(let i=0;i<14;i++){
    const star=document.createElement('span');star.textContent=i===7?'🍣':i%3===0?'✧':'✦';
    star.style.setProperty('--x',`${5+i*6.5}%`);star.style.setProperty('--delay',`${i*.055}s`);star.style.setProperty('--drift',`${(i%2?1:-1)*(20+i*5)}px`);
    layer.append(star);
  }
  document.body.append(layer);
  setTimeout(()=>{layer.remove();secretBusy=false;},reducedMotion.matches?1400:3500);
});

document.querySelectorAll('img[data-fallback-src]').forEach(img => {
  const fallback = () => { if(img.dataset.fallbackSrc) {const url=img.dataset.fallbackSrc;delete img.dataset.fallbackSrc;img.src=url;} };
  img.addEventListener('error',fallback,{once:true});
  if(img.complete && !img.naturalWidth) fallback();
});

/* Prevent native save/drag actions on the decorative logo animation only. */
document.querySelectorAll('.logo-motion').forEach(logo => {
  logo.addEventListener('contextmenu', event => event.preventDefault());
  logo.addEventListener('dragstart', event => event.preventDefault());
});
