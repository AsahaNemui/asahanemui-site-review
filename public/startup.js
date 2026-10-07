(() => {
  try {
    const path = location.pathname;
    const startupParams = new URLSearchParams(location.search);
    const captureRequest = startupParams.has('capture');
    const backstageEntry = path === '/backstage/';
    const requestedOpening = backstageEntry ? 'spotlight' : startupParams.get('opening');
    const openingVariant = ['live', 'mv', 'title', 'spotlight'].includes(requestedOpening) ? requestedOpening : 'live';
    const requestedLiveFx = startupParams.get('livefx');
    const liveFx = ['lights', 'flash', 'both'].includes(requestedLiveFx) ? requestedLiveFx : (openingVariant === 'live' ? 'lights' : '');
    const openingPreview = ['live', 'mv', 'title', 'spotlight'].includes(requestedOpening);

    // Mark the next document before first paint so neither normal nor capture
    // navigation can briefly expose an unstyled/content frame.
    let normalArrival = false;
    try {
      normalArrival = sessionStorage.getItem('asaha-page-arrival') === '1';
      if (normalArrival) sessionStorage.removeItem('asaha-page-arrival');
    } catch {}

    if (captureRequest && startupParams.has('scene')) {
      document.documentElement.classList.add('capture-arrival-pending');
    } else if (normalArrival) {
      document.documentElement.classList.add('site-arrival-pending');
    }

    // startup.js is the single owner of internal page-transition clicks.
    window.__ASAHANEMUI_TRANSITION_MANAGED__ = true;

    const v = '20261006-1';
    const hrefs = [
      `/global-fixes.css?v=${v}`,
      `/site-polish.css?v=${v}`,
      ...(path === '/' ? [`/home-polish.css?v=${v}`] : []),
      ...(path.startsWith('/music') ? [`/music-fixes.css?v=${v}`] : []),
      ...(path.startsWith('/activity') ? [`/activity-fixes.css?v=${v}`] : []),
      ...(path.startsWith('/projects/fashion-show') ? [
        `/fashion-mobile-pass5.css?v=${v}`,
        `/fashion-pc-frame.css?v=${v}`,
        `/fashion-polish.css?v=${v}`
      ] : []),
      ...(path.startsWith('/profile') ? [`/profile-history.css?v=${v}`] : [])
    ];

    hrefs.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.append(link);
    });

    if (path.startsWith('/profile')) {
      const script = document.createElement('script');
      script.src = `/profile-history.js?v=${v}`;
      script.defer = true;
      document.head.append(script);
    }

    if (path.startsWith('/music')) {
      const script = document.createElement('script');
      script.src = `/music-fixes.js?v=${v}`;
      script.defer = true;
      document.head.append(script);
    }

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

    // Show the cinematic START loader once when entering the normal HOME site.
    // Capture mode has its own dedicated intro, so the two never stack.
    let shouldShowSiteStart = false;
    if ((path === '/' || backstageEntry) && !captureRequest && !reducedMotion.matches) {
      if (openingPreview) {
        shouldShowSiteStart = true;
      } else {
        try {
          shouldShowSiteStart = sessionStorage.getItem('asaha-site-start-v1') !== '1';
        } catch {
          shouldShowSiteStart = true;
        }
      }
    }

    if (shouldShowSiteStart) {
      document.documentElement.classList.add('site-start-pending');

      const runSiteStart = () => {
        scrollTo(0, 0);
        const layer = document.createElement('div');
        layer.className = `film-interlude site-start-loader opening-${openingVariant}${openingVariant === 'live' && liveFx ? ` livefx-${liveFx}` : ''}`;
        layer.setAttribute('aria-hidden', 'true');
        layer.innerHTML = `<div class="film-shutter film-shutter-top"></div><div class="film-shutter film-shutter-bottom"></div><div class="film-grain"></div><div class="film-card"><span class="film-eyebrow">ASAHA NEMUI / START</span><div class="film-orbit"><svg viewBox="0 0 240 240" aria-hidden="true"><defs><path id="site-start-orbit-path" d="M 120,120 m -93,0 a 93,93 0 1,1 186,0 a 93,93 0 1,1 -186,0"></path></defs><text><textPath href="#site-start-orbit-path" textLength="584.34" lengthAdjust="spacing">ASAHA NEMUI ✦ OFFICIAL SITE ✦ ASAHA NEMUI ✦ START ✦ </textPath></text></svg><span class="film-mark">ゐ</span></div><span class="film-scene">START</span><span class="film-counter">00</span><span class="film-progress"><i></i></span><span class="film-footnote site-start-foot">LOADING OFFICIAL SITE</span></div><div class="film-destination"><small>START OBJECTIVE / CH. 00</small><strong>HOME</strong><span>READY TO ENTER</span></div><div class="start-title-call"><span class="live-cursor-spot" aria-hidden="true"></span><span class="start-title-kicker">OPENING ACT / 00</span><strong><span class="live-name-word">ASAHA</span><span class="live-name-word">NEMUI</span></strong><span class="start-title-jp">歌、言葉、芸術。</span><i></i></div><div class="spotlight-entry"><span class="spotlight-entry-glow" aria-hidden="true"></span><div class="spotlight-entry-hint">MOVE THE LIGHT / FIND THE SWITCH</div><div class="spotlight-entry-reveal"><small>ASAHA NEMUI / OFFICIAL SITE</small><strong>LIGHTS ON.</strong><p>歌、言葉、芸術。</p><button type="button" class="spotlight-enter">TURN ON <span>→</span></button></div></div>`;

        const titleKicker = layer.querySelector('.start-title-kicker');
        const titleJapanese = layer.querySelector('.start-title-jp');
        if (openingVariant === 'live') {
          if (titleKicker) titleKicker.textContent = 'SHOW START / OFFICIAL SITE';
          if (titleJapanese) titleJapanese.textContent = 'SING. TALK. PLAY.';
        } else if (openingVariant === 'spotlight') {
          if (titleKicker) titleKicker.textContent = 'LIGHTS ON / OFFICIAL SITE';
          if (titleJapanese) titleJapanese.textContent = '歌、言葉、芸術。';
        } else if (openingVariant === 'mv') {
          if (titleKicker) titleKicker.textContent = 'MV / OPENING SEQUENCE';
          if (titleJapanese) titleJapanese.textContent = '歌、言葉、芸術。';
        } else {
          if (titleKicker) titleKicker.textContent = 'TITLE CALL / 00';
          if (titleJapanese) titleJapanese.textContent = '歌、言葉、芸術。';
        }

        if (openingVariant === 'live' && matchMedia('(hover:hover) and (pointer:fine)').matches) {
          const cursorSpot = layer.querySelector('.live-cursor-spot');
          let targetX = innerWidth * 0.5;
          let targetY = innerHeight * 0.5;
          let currentX = targetX;
          let currentY = targetY;
          let cursorFrame = 0;

          const drawCursorSpot = () => {
            cursorFrame = 0;
            if (!layer.isConnected || !cursorSpot) return;

            currentX += (targetX - currentX) * 0.14;
            currentY += (targetY - currentY) * 0.14;
            cursorSpot.style.transform =
              `translate3d(${currentX}px,${currentY}px,0) translate(-50%,-50%)`;

            if (Math.abs(targetX - currentX) > 0.2 || Math.abs(targetY - currentY) > 0.2) {
              cursorFrame = requestAnimationFrame(drawCursorSpot);
            }
          };

          if (cursorSpot) {
            cursorSpot.style.transform =
              `translate3d(${currentX}px,${currentY}px,0) translate(-50%,-50%)`;
          }

          layer.addEventListener('pointermove', event => {
            targetX = event.clientX;
            targetY = event.clientY;
            if (!cursorFrame) cursorFrame = requestAnimationFrame(drawCursorSpot);
          }, { passive: true });
        }

        if (openingVariant === 'spotlight') {
          layer.setAttribute('aria-hidden', 'false');
          const entry = layer.querySelector('.spotlight-entry');
          const glow = layer.querySelector('.spotlight-entry-glow');
          const enterButton = layer.querySelector('.spotlight-enter');
          const hint = layer.querySelector('.spotlight-entry-hint');
          const coarsePointer = matchMedia('(hover:none), (pointer:coarse)').matches;
          if (coarsePointer && hint) hint.textContent = 'TAP / DRAG THE LIGHT';
          let targetX = innerWidth * 0.5;
          let targetY = innerHeight * 0.54;
          let currentX = targetX;
          let currentY = targetY;
          let frame = 0;
          let leaving = false;

          const drawEntrySpot = () => {
            frame = 0;
            if (!layer.isConnected || !entry || !glow) return;
            currentX += (targetX - currentX) * 0.13;
            currentY += (targetY - currentY) * 0.13;
            entry.style.setProperty('--entry-x', `${currentX}px`);
            entry.style.setProperty('--entry-y', `${currentY}px`);
            glow.style.transform =
              `translate3d(${currentX}px,${currentY}px,0) translate(-50%,-50%)`;

            if (Math.abs(targetX - currentX) > 0.2 || Math.abs(targetY - currentY) > 0.2) {
              frame = requestAnimationFrame(drawEntrySpot);
            }
          };

          if (entry && glow) {
            entry.style.setProperty('--entry-x', `${currentX}px`);
            entry.style.setProperty('--entry-y', `${currentY}px`);
            glow.style.transform =
              `translate3d(${currentX}px,${currentY}px,0) translate(-50%,-50%)`;
          }

          const moveSpotToPointer = event => {
            targetX = event.clientX;
            targetY = event.clientY;
            if (!frame) frame = requestAnimationFrame(drawEntrySpot);
          };

          layer.addEventListener('pointerdown', moveSpotToPointer, { passive: true });
          layer.addEventListener('pointermove', moveSpotToPointer, { passive: true });

          const enterTop = () => {
            if (leaving) return;
            leaving = true;

            // First pull the hand-held spotlight toward center, then bring up the stage.
            targetX = innerWidth * 0.5;
            targetY = innerHeight * 0.46;
            if (!frame) frame = requestAnimationFrame(drawEntrySpot);
            layer.classList.add('is-spotlight-lights-on');

            window.setTimeout(() => {
              layer.classList.add('opening-live', 'livefx-lights', 'is-spotlight-show', 'is-title-call');
            }, 240);

            window.setTimeout(() => {
              document.documentElement.classList.remove('site-start-pending');
              layer.classList.add('is-title-reveal');
            }, 1360);

            window.setTimeout(() => {
              layer.remove();
              document.documentElement.classList.remove('site-start-pending');
            }, 1720);
          };

          enterButton?.addEventListener('click', enterTop);
        }

        document.body.append(layer);
        if (!openingPreview) {
          try { sessionStorage.setItem('asaha-site-start-v1', '1'); } catch {}
        }

        const counter = layer.querySelector('.film-counter');
        const progress = layer.querySelector('.film-progress i');
        const foot = layer.querySelector('.site-start-foot');
        const started = performance.now();
        const duration = 1500;

        const finish = () => {
          if (counter) counter.textContent = '100';
          if (progress) progress.style.transform = 'scaleX(1)';
          if (foot) foot.textContent = 'READY / ENTER HOME';

          window.setTimeout(() => {
            if (openingVariant === 'spotlight') {
              layer.classList.add('is-spotlight-entry');
              return;
            }

            // LIVE / MVのタイトルコールを一度挟んでからHOMEへ。
            layer.classList.add('is-title-call');

            const titleHold = openingVariant === 'live' ? 1180 : 760;

            window.setTimeout(() => {
              document.documentElement.classList.remove('site-start-pending');
              layer.classList.add('is-title-reveal');
            }, titleHold);

            window.setTimeout(() => {
              layer.remove();
              document.documentElement.classList.remove('site-start-pending');
            }, titleHold + 360);
          }, 180);
        };

        const tick = now => {
          if (!layer.isConnected) return;
          const raw = Math.min(1, Math.max(0, (now - started) / duration));
          const value = Math.round(raw * 100);
          if (counter) counter.textContent = String(value).padStart(2, '0');
          if (progress) progress.style.transform = `scaleX(${raw})`;
          if (raw < 1) requestAnimationFrame(tick);
          else finish();
        };

        requestAnimationFrame(tick);

        // Safety valve: never leave the page covered if an animation API fails.
        window.setTimeout(() => {
          if (layer.isConnected) layer.remove();
          document.documentElement.classList.remove('site-start-pending');
        }, openingVariant === 'spotlight' ? 60000 : 7000);
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runSiteStart, { once: true });
      } else {
        runSiteStart();
      }
    }
    if (normalArrival) {
      const revealArrival = async () => {
        if (document.readyState === 'loading') {
          await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
        }

        // MUSIC / showcase.A などページ固有CSSが多いページでは、
        // CSSとフォントが安定するまで到着カバーを残してチラつきを防ぐ。
        const styleLinks = [...document.querySelectorAll('link[rel="stylesheet"]')];
        await Promise.all(styleLinks.map(link => {
          if (link.sheet) return Promise.resolve();
          return new Promise(resolve => {
            const done = () => resolve();
            link.addEventListener('load', done, { once: true });
            link.addEventListener('error', done, { once: true });
            window.setTimeout(done, 1800);
          });
        }));

        try {
          if (document.fonts?.ready) await document.fonts.ready;
        } catch {}

        requestAnimationFrame(() => requestAnimationFrame(() => {
          document.documentElement.classList.add('site-arrival-reveal');
          window.setTimeout(() => {
            document.documentElement.classList.remove('site-arrival-pending', 'site-arrival-reveal');
          }, 300);
        }));
      };

      revealArrival();
    }

    // Legacy handoff flags are no longer used.
    sessionStorage.removeItem('asaha-film-arrival');
    sessionStorage.removeItem('asaha-film-handoff');

    if (!reducedMotion.matches) {
      const scenes = new Map([
        ['/', ['00', 'HOME', 'ホーム']],
        ['/profile/', ['01', 'PROFILE', 'プロフィール']],
        ['/music/', ['02', 'MUSIC', '歌']],
        ['/guide/', ['03', 'FAN GUIDE', '応援ガイド']],
        ['/activity/', ['04', 'ACTIVITY', '活動のいろいろ']],
        ['/works/', ['05', 'WORKS', '活動の記録']],
        ['/links/', ['06', 'LINKS', 'リンク']],
        ['/projects/', ['07', 'PROJECTS', '企画']],
        ['/projects/fashion-show/', ['07', 'FASHION SHOW', 'ファッションショー']],
        ['/projects/showcase-a/', ['07', 'showcase.A', 'showcase.A']]
      ]);
      const burstPalette = ['#baffdb', '#a8e8ff', '#c9adff', '#f6b4e8', '#ffffff'];
      let changingPage = false;

      const createDepartureInterlude = scene => {
        const layer = document.createElement('div');
        layer.className = 'film-interlude';
        layer.setAttribute('aria-hidden', 'true');
        layer.innerHTML = `<div class="film-shutter film-shutter-top"></div><div class="film-shutter film-shutter-bottom"></div><div class="film-grain"></div><div class="film-seam"><i></i><i></i></div><div class="film-card"><span class="film-eyebrow">ASAHA NEMUI / SCENE CHANGE</span><div class="film-orbit"><svg viewBox="0 0 240 240" aria-hidden="true"><defs><path id="film-orbit-path" d="M 120,120 m -93,0 a 93,93 0 1,1 186,0 a 93,93 0 1,1 -186,0"></path></defs><text><textPath href="#film-orbit-path" textLength="584.34" lengthAdjust="spacing">ASAHA NEMUI ✦ NEXT SCENE ✦ ASAHA NEMUI ✦ NEXT SCENE ✦ </textPath></text></svg><span class="film-mark">ゐ</span></div><span class="film-scene"></span><span class="film-counter">01</span><span class="film-progress"><i></i></span></div><div class="film-objective"><span class="film-objective-pin">✦</span><span class="film-objective-ring"></span></div><div class="film-destination"><small>NEXT OBJECTIVE / CH. <b></b></small><strong></strong><span>ENTERING PAGE</span></div>`;

        const [number, title] = scene;
        layer.querySelector('.film-scene').textContent = title;
        layer.querySelector('.film-destination b').textContent = number;
        layer.querySelector('.film-destination strong').textContent = title;

        for (let i = 0; i < 24; i += 1) {
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
        document.documentElement.classList.remove('film-arrival-pending');
        requestAnimationFrame(() => layer.classList.add('is-active'));
        return layer;
      };

      const countToOneHundred = layer => new Promise(resolve => {
        const counter = layer.querySelector('.film-counter');
        const progress = layer.querySelector('.film-progress i');
        let value = 1;
        let lastStep = performance.now();
        const minimumStepMs = 15;

        const render = () => {
          counter.textContent = value < 100 ? String(value).padStart(2, '0') : '100';
          if (progress) {
            progress.style.transformOrigin = 'left center';
            progress.style.transition = 'none';
            progress.style.animation = 'none';
            progress.style.transform = `scaleX(${value / 100})`;
          }
        };

        render();
        const tick = now => {
          if (!layer.isConnected) {
            resolve();
            return;
          }
          if (now - lastStep >= minimumStepMs && value < 100) {
            value += 1;
            lastStep = now;
            render();
          }
          if (value < 100) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });

      document.addEventListener('click', event => {
        if (reducedMotion.matches) return;
        const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
        if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;

        const destination = new URL(anchor.href, location.href);
        if (destination.origin !== location.origin || (destination.pathname === location.pathname && destination.search === location.search)) return;

        event.preventDefault();
        event.stopImmediatePropagation();
        if (changingPage) return;
        changingPage = true;

        const layer = createDepartureInterlude(scenes.get(destination.pathname) || ['—', 'NEXT SCENE', '次のページ']);

        countToOneHundred(layer).then(() => {
          if (!destination.searchParams.has('capture')) {
            try { sessionStorage.setItem('asaha-page-arrival', '1'); } catch {}
          }
          window.setTimeout(() => location.assign(destination.href), 120);
        });
      }, true);

      addEventListener('pageshow', event => {
        if (event.persisted) {
          changingPage = false;
          document.querySelectorAll('.film-interlude').forEach(layer => layer.remove());
        }
      });
    }
  } catch { /* Base site remains usable if an enhancement cannot initialize. */ }

  setTimeout(() => {
    document.documentElement.classList.remove('film-arrival-pending');
    document.querySelectorAll('.film-interlude.is-handoff:not(.is-arriving)').forEach(layer => layer.remove());
  }, 4200);
})();
