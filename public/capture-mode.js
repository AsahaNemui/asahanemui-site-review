(() => {
  "use strict";

  const params = new URLSearchParams(location.search);
  const mode = params.get("capture");
  const requestedOpening = params.get("opening");
  const openingVariant = ["live", "mv", "title"].includes(requestedOpening)
    ? requestedOpening
    : "live";
  const requestedLiveFx = params.get("livefx");
  const liveFx = ["lights", "flash", "both"].includes(requestedLiveFx)
    ? requestedLiveFx
    : (openingVariant === "live" ? "lights" : "");

  if (!["15", "30", "full"].includes(mode)) return;

  const path = location.pathname.replace(/\/+$/, "") || "/";
  const scene = params.get("scene") || (
    path === "/profile" ? "profile" :
    path === "/music" ? "music" :
    path === "/guide" ? "guide" :
    path === "/activity" ? "activity" :
    path === "/projects/showcase-a" ? "showcase" :
    path === "/projects/fashion-show" ? "fashion" :
    path === "/works" ? "works" :
    path === "/links" ? "links" :
    "home"
  );

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  let slowStartShown = false;

  const easeInOutQuint = t =>
    t < 0.5
      ? 16 * t * t * t * t * t
      : 1 - Math.pow(-2 * t + 2, 5) / 2;

  function tween(duration, update) {
    return new Promise(resolve => {
      const start = performance.now();

      function frame(now) {
        const raw = clamp((now - start) / duration, 0, 1);
        update(easeInOutQuint(raw));

        if (raw < 1) {
          requestAnimationFrame(frame);
        } else {
          resolve();
        }
      }

      requestAnimationFrame(frame);
    });
  }

  function injectCaptureUI() {
    const style = document.createElement("style");
    style.id = "capture-mode-style";
    style.textContent = `
      html.capture-running,
      html.capture-running * {
        cursor: none !important;
      }

      html.capture-running {
        scroll-behavior: auto !important;
      }

      #capture-transition {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        background: #17142c;
        opacity: 1;
        pointer-events: none;
        will-change: opacity;
      }

      .capture-native-link {
        position: fixed !important;
        width: 1px !important;
        height: 1px !important;
        overflow: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }

      html.capture-running .chapter-row.capture-hover {
        padding-left: 35px !important;
        color: #171429 !important;
      }

      html.capture-running .chapter-row:nth-child(1).capture-hover {
        background: #8cebd0 !important;
      }

      html.capture-running .chapter-row:nth-child(2).capture-hover {
        background: #91dff4 !important;
      }

      html.capture-running .chapter-row:nth-child(3).capture-hover {
        background: #b8a2f4 !important;
      }

      html.capture-running .chapter-row.capture-hover .chapter-arrow {
        transform: translate(8px, -8px) rotate(12deg) !important;
      }

      html.capture-running .chapter-row.capture-hover .chapter-num {
        transform: rotate(-15deg) scale(1.25) !important;
      }

      html.capture-running .chapter-row.capture-hover .chapter-title strong {
        transform: translateX(10px) !important;
      }

      html.capture-running #song-search.capture-typing {
        outline: 3px solid rgba(169, 248, 227, .72) !important;
        outline-offset: 4px;
        box-shadow: 0 0 0 8px rgba(169, 248, 227, .12) !important;
        transition: outline-color .2s ease, box-shadow .2s ease;
      }

      html.capture-running #song-results.capture-result-count {
        animation: capture-result-pop .7s cubic-bezier(.16,1,.3,1);
      }

      html.capture-running .library-item.capture-search-hit {
        animation: capture-hit-in .75s cubic-bezier(.16,1,.3,1) both;
      }

      @keyframes capture-result-pop {
        0% { transform: scale(.92); opacity: .45; }
        55% { transform: scale(1.08); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }

      @keyframes capture-hit-in {
        0% { opacity: 0; transform: translateY(24px) scale(.96); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }

      .capture-start-loader {
        z-index: 2147483646 !important;
        background:
          radial-gradient(ellipse at 70% 55%, #4e3470 0, transparent 55%),
          linear-gradient(120deg, #111b35, #211330 60%, #103846);
      }

      .capture-start-loader .film-shutter {
        animation: none !important;
        transform: translateY(0) !important;
      }

      .capture-start-loader .film-card {
        opacity: 1 !important;
        animation: none !important;
      }

      .capture-start-loader .film-grain {
        opacity: .42 !important;
        animation: none !important;
      }

      .capture-start-loader .film-progress i {
        animation: none !important;
        transform: scaleX(0);
      }

      .capture-start-loader .film-destination {
        opacity: 1 !important;
        transform: translateY(0) !important;
        animation: none !important;
      }

      .capture-start-loader .film-start-foot {
        margin-top: 2px;
        color: #cfc2df;
      }

      html.capture-running .showcase-files.capture-showcase-hover .showcase-file--third {
        transform: translate(70px, -10px) rotate(2.6deg) !important;
      }

      html.capture-running .showcase-files.capture-showcase-hover .showcase-file--second {
        transform: translate(30px, -5px) rotate(-1.4deg) !important;
      }

      html.capture-running .showcase-files.capture-showcase-hover .showcase-file--active {
        transform: translateY(2px) !important;
        box-shadow: 0 38px 100px rgba(30,24,45,.22) !important;
      }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.id = "capture-transition";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);

    // The real capture overlay is now mounted, so the pre-paint safety cover
    // from startup.js can be removed without exposing a frame underneath.
    document.documentElement.classList.remove("capture-arrival-pending");
    document.documentElement.classList.add("capture-running");

    return overlay;
  }

  async function fade(overlay, from, to, duration = 320) {
    if (
      from === 1 &&
      to === 0 &&
      sessionStorage.getItem("capture-skip-arrival-fade") === "1"
    ) {
      sessionStorage.removeItem("capture-skip-arrival-fade");
      overlay.style.opacity = "0";
      return;
    }

    overlay.style.opacity = String(from);

    await tween(duration, t => {
      overlay.style.opacity = String(from + (to - from) * t);
    });

    overlay.style.opacity = String(to);
  }

  async function showSlowStartLoader(overlay) {
    const layer = document.createElement("div");
    layer.className = `film-interlude capture-start-loader opening-${openingVariant}${openingVariant === "live" && liveFx ? ` livefx-${liveFx}` : ""}`;
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = `
      <div class="film-shutter film-shutter-top"></div>
      <div class="film-shutter film-shutter-bottom"></div>
      <div class="film-grain"></div>
      <div class="film-card">
        <span class="film-eyebrow">ASAHA NEMUI / START</span>
        <div class="film-orbit">
          <svg viewBox="0 0 240 240" aria-hidden="true">
            <defs>
              <path id="capture-start-orbit-path" d="M 120,120 m -93,0 a 93,93 0 1,1 186,0 a 93,93 0 1,1 -186,0"></path>
            </defs>
            <text>
              <textPath href="#capture-start-orbit-path" textLength="584.34" lengthAdjust="spacing">
                ASAHA NEMUI ✦ OFFICIAL SITE ✦ ASAHA NEMUI ✦ START ✦
              </textPath>
            </text>
          </svg>
          <span class="film-mark">ゐ</span>
        </div>
        <span class="film-scene">START</span>
        <span class="film-counter">00</span>
        <span class="film-progress"><i></i></span>
        <span class="film-footnote film-start-foot">LOADING OFFICIAL SITE</span>
      </div>
      <div class="film-destination">
        <small>START OBJECTIVE / CH. 00</small>
        <strong>HOME</strong>
        <span>READY TO ENTER</span>
      </div>
      <div class="start-title-call">
        <span class="live-cursor-spot" aria-hidden="true"></span>
        <span class="start-title-kicker">OPENING ACT / 00</span>
        <strong><span class="live-name-word">ASAHA</span><span class="live-name-word">NEMUI</span></strong>
        <span class="start-title-jp">歌、言葉、芸術。</span>
        <i></i>
      </div>
    `;

    const titleKicker = layer.querySelector(".start-title-kicker");
    const titleJapanese = layer.querySelector(".start-title-jp");
    if (openingVariant === "live") {
      if (titleKicker) titleKicker.textContent = "SHOW START / OFFICIAL SITE";
      if (titleJapanese) titleJapanese.textContent = "SING. TALK. PLAY.";
    } else if (openingVariant === "mv") {
      if (titleKicker) titleKicker.textContent = "MV / OPENING SEQUENCE";
      if (titleJapanese) titleJapanese.textContent = "歌、言葉、芸術。";
    } else {
      if (titleKicker) titleKicker.textContent = "TITLE CALL / 00";
      if (titleJapanese) titleJapanese.textContent = "歌、言葉、芸術。";
    }

    if (openingVariant === "live" && matchMedia("(hover:hover) and (pointer:fine)").matches) {
      const cursorSpot = layer.querySelector(".live-cursor-spot");
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

      layer.addEventListener("pointermove", event => {
        targetX = event.clientX;
        targetY = event.clientY;
        if (!cursorFrame) cursorFrame = requestAnimationFrame(drawCursorSpot);
      }, { passive: true });
    }

    document.body.appendChild(layer);

    // HOMEを見せる前に、ロード画面だけを最前面へ。
    overlay.style.opacity = "0";

    const counter = layer.querySelector(".film-counter");
    const progress = layer.querySelector(".film-progress i");
    const foot = layer.querySelector(".film-start-foot");

    await new Promise(resolve => {
      const started = performance.now();
      const duration = 1500;

      const frame = now => {
        const raw = clamp((now - started) / duration, 0, 1);
        const value = Math.round(raw * 100);

        if (counter) counter.textContent = String(value).padStart(2, "0");
        if (progress) progress.style.transform = `scaleX(${raw})`;

        if (raw < 1) requestAnimationFrame(frame);
        else resolve();
      };

      requestAnimationFrame(frame);
    });

    if (counter) counter.textContent = "100";
    if (progress) progress.style.transform = "scaleX(1)";
    if (foot) foot.textContent = "READY / ENTER HOME";

    await wait(180);

    layer.classList.add("is-title-call");
    await wait(openingVariant === "live" ? 1180 : 760);

    layer.classList.add("is-title-reveal");
    await wait(360);

    layer.remove();
    slowStartShown = true;
    await wait(180);
  }

  async function pageReady() {
    if (document.readyState !== "complete") {
      await new Promise(resolve => {
        addEventListener("load", resolve, { once: true });
      });
    }

    // MUSIC / showcase.A はページ固有CSSが多いので、未読込のstyleを
    // 画面に出す前に待ってレイアウトの一瞬の変化を隠す。
    const styleLinks = [...document.querySelectorAll('link[rel="stylesheet"]')];
    await Promise.all(styleLinks.map(link => {
      if (link.sheet) return Promise.resolve();
      return new Promise(resolve => {
        const done = () => resolve();
        link.addEventListener("load", done, { once: true });
        link.addEventListener("error", done, { once: true });
        window.setTimeout(done, 1800);
      });
    }));

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
    } catch (_) {}

    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await wait(90);
  }

  function targetYFor(element, viewportBias = 0.47) {
    if (!element) return scrollY;

    const rect = element.getBoundingClientRect();
    const max = Math.max(
      0,
      document.documentElement.scrollHeight - innerHeight
    );

    return clamp(
      scrollY +
        rect.top +
        rect.height * 0.5 -
        innerHeight * viewportBias,
      0,
      max
    );
  }

  async function scrollToElement(
    element,
    duration = 1500,
    viewportBias = 0.47
  ) {
    if (!element) return;

    const startY = scrollY;
    const targetY = targetYFor(element, viewportBias);

    if (Math.abs(targetY - startY) < 4) return;

    await tween(duration, t => {
      scrollTo(0, startY + (targetY - startY) * t);
    });
  }

  function captureUrl(pathname, nextScene, captureMode = mode) {
    const url = new URL(pathname, location.origin);
    url.searchParams.set("capture", captureMode);
    url.searchParams.set("scene", nextScene);
    return url.toString();
  }

  async function navigate(overlay, pathname, nextScene, captureMode = mode) {
    // 暗転を瞬間表示すると明るいページで「チカッ」と見えるため、
    // 短いフェードで閉じて次ページ側のカバーへ連続させる。
    await fade(overlay, 0, 1, 170);
    location.assign(captureUrl(pathname, nextScene, captureMode));
  }

  function nativeNavigateOnce(pathname, nextScene) {
    sessionStorage.setItem("capture-skip-arrival-fade", "1");

    const anchor = document.createElement("a");
    anchor.className = "capture-native-link";
    anchor.href = captureUrl(pathname, nextScene, "full");
    anchor.textContent = "NEXT";
    document.body.appendChild(anchor);
    anchor.click();
  }

  async function waitForSelector(selector, timeout = 3000) {
    const started = performance.now();

    while (performance.now() - started < timeout) {
      const found = document.querySelector(selector);
      if (found) return found;
      await wait(80);
    }

    return null;
  }

  async function showCharacterIntro() {
    const opener = document.querySelector("[data-character-open]");
    if (!opener) return;

    opener.click();
    await wait(1500);

    const figure = document.querySelector("#character-dialog .character-figure");
    if (figure) {
      figure.click();
      await wait(1200);
      figure.click();
      await wait(1200);
    }

    document.querySelector("#character-dialog .character-close")?.click();
    await wait(450);
  }

  async function showFashionLook(lookSelector) {
    const opener = document.querySelector(`${lookSelector} .fashion-look__button`);
    if (!opener) return;

    opener.click();
    await wait(1700);

    const face = await waitForSelector(
      "#fashion-dialog [data-fashion-dialog-face-index]",
      2600
    );

    if (face) {
      face.click();
      await wait(1500);
    }

    document.querySelector("#fashion-dialog .fashion-dialog__close")?.click();
    await wait(500);
  }

  async function showProfileKeyVisual() {
    const stage = document.querySelector(".profile-kv-stage");
    if (!stage) return;

    stage.click();
    await wait(1900);
  }

  function captureSoloSongs() {
    const data = document.querySelector("#song-data");
    if (!data) return [];

    try {
      return JSON.parse(data.textContent).filter(song =>
        song.category === "solo" &&
        (!song.collaborators || song.collaborators.length === 0)
      );
    } catch (_) {
      return [];
    }
  }

  function rewriteDailyPick(song) {
    if (!song) return null;

    const result = document.querySelector("#daily-result");
    if (!result) return null;

    let card = result.querySelector(".daily-song-card");

    if (!card) {
      card = document.createElement("a");
      card.className = "daily-song-card";

      const img = document.createElement("img");
      img.alt = "";
      img.width = 480;
      img.height = 360;

      const text = document.createElement("div");
      card.append(img, text);
      result.replaceChildren(card);
      result.hidden = false;
    }

    card.href = `https://www.youtube.com/watch?v=${song.videoId}`;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.setAttribute("aria-label", `${song.title}を聴く`);

    const img = card.querySelector("img") || document.createElement("img");
    img.src = `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`;
    img.alt = "";
    img.width = 480;
    img.height = 360;

    let text = card.querySelector("div");
    if (!text) {
      text = document.createElement("div");
      card.append(text);
    }

    const label = document.createElement("small");
    label.textContent = "TODAY’S PICK";

    const title = document.createElement("strong");
    title.textContent = song.title;

    const artist = document.createElement("span");
    artist.textContent = song.artist;

    const play = document.createElement("b");
    play.textContent = "聴いてみる ↗";

    text.replaceChildren(label, title, artist, play);

    if (!card.contains(img)) {
      card.prepend(img);
    }

    const share = result.querySelector(".daily-share");
    if (share) {
      const shareUrl = new URL("https://x.com/intent/tweet");
      shareUrl.searchParams.set(
        "text",
        `今日の一曲は「${song.title}」でした。\nあさはねむゐの歌のおみくじ ✦\n${card.href}\n\n一曲を引く → ${location.origin}/music/#daily-pick`
      );
      share.href = shareUrl.href;
    }

    return card;
  }

  async function showDailyCollection(song) {
    if (!song) return;

    const details = document.querySelector(".song-collection details");
    const list = document.querySelector("#collection-list");
    const count = document.querySelector("#collection-count");
    const empty = document.querySelector("#collection-empty");
    if (!details || !list || !count) return;

    const card = document.createElement("a");
    card.className = "collection-card";
    card.href = `https://www.youtube.com/watch?v=${song.videoId}`;
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    const img = document.createElement("img");
    img.src = `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`;
    img.alt = "";
    img.loading = "lazy";
    img.width = 480;
    img.height = 360;

    const text = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = song.title;
    const artist = document.createElement("span");
    artist.className = "collection-credit";
    artist.textContent = song.artist;
    const date = document.createElement("small");
    date.textContent = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());

    text.append(title, artist, date);
    card.append(img, text);

    list.replaceChildren(card);
    count.textContent = "1曲 / 1日";
    if (empty) empty.hidden = true;
    details.open = true;

    await scrollToElement(details, 1100, 0.43);
    await wait(2200);
  }

  async function showDailyPick() {
    const button = document.querySelector(".daily-draw-button");
    const result = document.querySelector("#daily-result");
    const soloSongs = captureSoloSongs();

    // 撮影では最新曲と重複しすぎないよう、直近のソロ歌ってみたから選ぶ。
    const demoSong = soloSongs[2] || soloSongs[1] || soloSongs[0];
    if (!result || !demoSong) return null;

    // 撮影モードでは通常のおみくじ履歴を変更せず、押した感じだけ見せて結果へ。
    if (button && !button.hidden) {
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        button.animate(
          [
            { transform: "scale(1)", filter: "brightness(1)" },
            { transform: "scale(.96)", filter: "brightness(1.12)" },
            { transform: "scale(1.02)", filter: "brightness(1.2)" },
            { transform: "scale(1)", filter: "brightness(1)" }
          ],
          { duration: 520, easing: "cubic-bezier(.16,1,.3,1)" }
        );
      }
      await wait(520);
    }
    if (button) button.hidden = true;

    const card = rewriteDailyPick(demoSong);
    if (!card) return null;

    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      card.animate(
        [
          { opacity: 0, transform: "translateY(28px) rotate(-4deg) scale(.94)" },
          { opacity: 1, transform: "translateY(0) rotate(0) scale(1)" }
        ],
        { duration: 700, easing: "cubic-bezier(.16,1,.3,1)" }
      );

      await wait(850);

      card.animate(
        [
          { transform: "scale(1)", filter: "brightness(1)" },
          { transform: "scale(1.035)", filter: "brightness(1.15)" },
          { transform: "scale(1)", filter: "brightness(1)" }
        ],
        { duration: 900, easing: "cubic-bezier(.16,1,.3,1)" }
      );
    }

    await wait(1700);
    return demoSong;
  }

  async function showMusicToybox() {
    const showcase = document.querySelector(".music-showcase");
    if (!showcase) return;

    const shuffle = showcase.querySelector(".gallery-shuffle");
    if (shuffle) {
      shuffle.click();
      await wait(1500);
    }
  }

  async function showChapterHoverDemo() {
    const section = document.querySelector(".chapter-section");
    if (!section) return;

    await scrollToElement(section, 1300, 0.45);
    await wait(550);

    const rows = [...section.querySelectorAll(".chapter-row")].slice(0, 3);

    for (const row of rows) {
      row.classList.add("capture-hover");
      await wait(950);
      row.classList.remove("capture-hover");
      await wait(180);
    }

    await wait(350);
  }

  async function showSongSearchDemo() {
    const library = document.querySelector("#song-library");
    const input = document.querySelector("#song-search");
    const count = document.querySelector("#song-results");
    const grid = document.querySelector(".library-grid");
    const searchBox = input?.closest(".song-search") || input;
    if (!library || !input || !grid || !searchBox) return;

    // 検索欄そのものを画面中央に入れてから入力する。
    await scrollToElement(searchBox, 1350, 0.50);
    await wait(850);

    const query = "あさはねむゐ";
    const keyDelays = [360, 260, 380, 300, 340, 420];

    input.classList.add("capture-typing");
    input.focus({ preventScroll: true });
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    // 実際に人が打っているように、一文字ずつ見える速度で入力する。
    for (let i = 0; i < query.length; i += 1) {
      input.value += query[i];
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await wait(keyDelays[i] || 320);
    }

    await wait(700);

    count?.classList.add("capture-result-count");
    const hits = [
      ...document.querySelectorAll(".library-item:not([hidden])")
    ];

    hits.forEach((item, index) => {
      item.classList.add("capture-search-hit");
      item.style.animationDelay = `${index * 140}ms`;
    });

    // 件数表示も見える状態で一度止める。
    await wait(900);

    // 絞れたカードの先頭まで送って、実際の結果をしっかり見せる。
    const resultTarget = hits[0] || grid;
    await scrollToElement(resultTarget, 1100, 0.38);
    await wait(2400);

    // 検索で見つけた作品をそのまま開き、サイト内プレイヤーまで繋げる。
    const resultLink = hits[0]?.querySelector("a[href]");
    if (resultLink) {
      resultLink.click();
      await wait(2600);
      document.querySelector("#song-player .player-close")?.click();
      await wait(650);
    }

    // 検索は解除せず、作品が絞り込まれた状態のまま次のページへ進む。
    input.classList.remove("capture-typing");
    input.blur();
    await wait(650);
  }

  async function showShowcaseArchive() {
    const hero = document.querySelector(".showcase-hero");
    const formats = document.querySelector(".showcase-format__grid");
    const files = document.querySelector(".showcase-files");

    if (hero) {
      await scrollToElement(hero, 900, 0.48);
      await wait(900);
    }

    if (formats) {
      await scrollToElement(formats, 1200, 0.46);
      await wait(700);
    }

    if (!files) return;

    await scrollToElement(files, 1450, 0.42);
    await wait(700);

    // PROJECT ARCHIVEの「重なったファイルが動く」ホバー状態を見せる。
    files.classList.add("capture-showcase-hover");
    await wait(1700);

    const second = files.querySelector(".showcase-file--second");
    if (second) {
      second.click();
      await wait(1000);
    }

    const third = files.querySelector(".showcase-file--third");
    if (third) {
      third.click();
      await wait(1000);
    }

    files.classList.remove("capture-showcase-hover");
    await wait(500);
  }

  async function showSecretStar() {
    const star = document.querySelector(".secret-star");
    if (!star) return;

    star.click();
    await wait(3200);
  }

  async function run15(overlay) {
    if (path !== "/") return;

    scrollTo(0, 0);
    await fade(overlay, 1, 0, 300);

    await wait(1700);

    await scrollToElement(
      document.querySelector(".monthly-feature"),
      1500,
      0.47
    );
    await wait(1000);

    await scrollToElement(
      document.querySelector(".editorial-intro"),
      1500,
      0.48
    );
    await wait(900);

    await scrollToElement(
      document.querySelector(".music-showcase"),
      1800,
      0.45
    );
    await wait(2200);

    await wait(900);
    await fade(overlay, 0, 1, 500);
  }

  async function runHome30(overlay) {
    scrollTo(0, 0);
    await fade(overlay, 1, 0, 320);

    await wait(1680);

    await scrollToElement(
      document.querySelector(".monthly-feature"),
      2500,
      0.47
    );

    await wait(1500);

    await scrollToElement(
      document.querySelector(".editorial-intro"),
      1500,
      0.48
    );

    await wait(1000);

    await navigate(overlay, "/profile/", "profile", "30");
  }

  async function runProfile30(overlay) {
    scrollTo(0, 0);
    await fade(overlay, 1, 0, 320);

    await wait(1680);

    await scrollToElement(
      document.querySelector(".profile-kv"),
      2500,
      0.48
    );

    await wait(1500);

    await navigate(overlay, "/music/", "music", "30");
  }

  async function runMusic30(overlay) {
    scrollTo(0, 0);
    await fade(overlay, 1, 0, 320);

    await wait(1680);

    await scrollToElement(
      document.querySelector(".monthly-feature"),
      1800,
      0.47
    );
    await wait(900);

    await scrollToElement(
      document.querySelector(".music-showcase"),
      2300,
      0.45
    );

    await wait(2300);

    await navigate(overlay, "/", "ending", "30");
  }

  async function runEnding30(overlay) {
    scrollTo(0, 0);
    await fade(overlay, 1, 0, 320);

    await wait(3800);

    await fade(overlay, 0, 1, 700);
  }

  async function runHomeFull(overlay) {
    scrollTo(0, 0);

    if (slowStartShown) {
      overlay.style.opacity = "0";
    } else {
      await fade(overlay, 1, 0, 340);
    }

    // HOMEではポップアップを出さず、まずサイトそのものを一巡して見せる。
    await wait(3200);

    await scrollToElement(
      document.querySelector(".monthly-feature"),
      1450,
      0.47
    );
    await wait(1050);

    await scrollToElement(
      document.querySelector(".editorial-intro"),
      1300,
      0.48
    );
    await wait(650);

    await scrollToElement(
      document.querySelector(".logo-motion"),
      1200,
      0.48
    );
    await wait(1750);

    await scrollToElement(
      document.querySelector(".music-showcase"),
      1300,
      0.45
    );
    await wait(750);

    // 最後にサイト案内の色変化まで見せて、HOMEを見切ってからPROFILEへ。
    await showChapterHoverDemo();

    // ここだけ、サイト本来の「SCENE CHANGE」アニメーションを見せる。
    nativeNavigateOnce("/profile/", "profile");
  }

  async function runProfileFull(overlay) {
    scrollTo(0, 0);
    await fade(overlay, 1, 0, 340);

    // PROFILEだと分かる画面を見せてから、キャラクター紹介を開く。
    await wait(1500);

    await showCharacterIntro();

    await wait(350);

    await scrollToElement(
      document.querySelector(".profile-kv"),
      1450,
      0.48
    );
    await wait(450);

    await showProfileKeyVisual();

    await scrollToElement(
      document.querySelector(".band-section"),
      1000,
      0.47
    );
    await wait(500);

    await scrollToElement(
      document.querySelector(".profile-details"),
      1100,
      0.47
    );
    await wait(700);

    await navigate(overlay, "/music/", "music", "full");
  }

  async function runMusicFull(overlay) {
    scrollTo(0, 0);
    await fade(overlay, 1, 0, 340);

    await wait(900);

    await scrollToElement(
      document.querySelector("#daily-pick"),
      1300,
      0.47
    );
    await wait(500);

    const dailySong = await showDailyPick();

    await showDailyCollection(dailySong);

    await scrollToElement(
      document.querySelector(".original-section"),
      1000,
      0.47
    );
    await wait(550);

    await scrollToElement(
      document.querySelector(".music-showcase"),
      1400,
      0.45
    );
    await wait(550);

    await showMusicToybox();

    await wait(650);

    // 検索欄に本人名を入力し、オリジナル曲まで絞れることを見せる。
    await showSongSearchDemo();

    await wait(650);

    await navigate(overlay, "/guide/", "guide", "full");
  }

  async function runGuideFull(overlay) {
    scrollTo(0, 0);
    await fade(overlay, 1, 0, 300);

    await wait(650);

    await scrollToElement(
      document.querySelector(".guide-index"),
      950,
      0.47
    );
    await wait(450);

    await scrollToElement(
      document.querySelector(".guide-content"),
      1050,
      0.46
    );
    await wait(550);

    await navigate(overlay, "/activity/", "activity", "full");
  }

  async function runActivityFull(overlay) {
    scrollTo(0, 0);
    await fade(overlay, 1, 0, 300);

    await wait(650);

    await scrollToElement(
      document.querySelector(".project-grid"),
      1150,
      0.47
    );
    await wait(850);

    await navigate(
      overlay,
      "/projects/showcase-a/",
      "showcase",
      "full"
    );
  }

  async function runShowcaseFull(overlay) {
    scrollTo(0, 0);
    await fade(overlay, 1, 0, 340);

    await wait(900);

    await showShowcaseArchive();

    await wait(700);

    await navigate(
      overlay,
      "/projects/fashion-show/",
      "fashion",
      "full"
    );
  }

  async function runFashionFull(overlay) {
    scrollTo(0, 0);
    await fade(overlay, 1, 0, 340);

    await wait(1000);

    await scrollToElement(
      document.querySelector(".fashion-about"),
      1200,
      0.47
    );
    await wait(550);

    await scrollToElement(
      document.querySelector(".fashion-collection--seasons"),
      1450,
      0.46
    );
    await wait(650);

    await showFashionLook(
      ".fashion-collection--seasons .fashion-look:nth-child(1)"
    );

    await wait(500);

    await scrollToElement(
      document.querySelector(".fashion-collection--directions"),
      1550,
      0.46
    );
    await wait(650);

    await showFashionLook(
      ".fashion-collection--directions .fashion-look:nth-child(2)"
    );

    await wait(900);

    await navigate(overlay, "/works/", "works", "full");
  }

  async function runWorksFull(overlay) {
    scrollTo(0, 0);
    await fade(overlay, 1, 0, 300);

    await wait(650);

    await scrollToElement(
      document.querySelector(".record-list"),
      1150,
      0.47
    );
    await wait(700);

    await navigate(overlay, "/links/", "links", "full");
  }

  async function runLinksFull(overlay) {
    scrollTo(0, 0);
    await fade(overlay, 1, 0, 300);

    await wait(600);

    await scrollToElement(
      document.querySelector(".link-groups"),
      1000,
      0.47
    );
    await wait(500);

    await scrollToElement(
      document.querySelector(".site-footer"),
      1100,
      0.82
    );
    await wait(350);

    await showSecretStar();

    await wait(500);

    await navigate(overlay, "/", "ending-full", "full");
  }

  async function runEndingFull(overlay) {
    scrollTo(0, 0);
    await fade(overlay, 1, 0, 340);

    await wait(2600);

    await fade(overlay, 0, 1, 700);
  }

  async function start() {
    const overlay = injectCaptureUI();
    await pageReady();

    if (mode === "15") {
      await run15(overlay);
      return;
    }

    if (mode === "30") {
      if (scene === "profile" && path === "/profile") {
        await runProfile30(overlay);
        return;
      }

      if (scene === "music" && path === "/music") {
        await runMusic30(overlay);
        return;
      }

      if (scene === "ending" && path === "/") {
        await runEnding30(overlay);
        return;
      }

      if (path === "/") {
        await runHome30(overlay);
      }

      return;
    }

    if (mode === "full") {
      if (scene === "profile" && path === "/profile") {
        await runProfileFull(overlay);
        return;
      }

      if (scene === "music" && path === "/music") {
        await runMusicFull(overlay);
        return;
      }

      if (scene === "guide" && path === "/guide") {
        await runGuideFull(overlay);
        return;
      }

      if (scene === "activity" && path === "/activity") {
        await runActivityFull(overlay);
        return;
      }

      if (scene === "showcase" && path === "/projects/showcase-a") {
        await runShowcaseFull(overlay);
        return;
      }

      if (scene === "fashion" && path === "/projects/fashion-show") {
        await runFashionFull(overlay);
        return;
      }

      if (scene === "works" && path === "/works") {
        await runWorksFull(overlay);
        return;
      }

      if (scene === "links" && path === "/links") {
        await runLinksFull(overlay);
        return;
      }

      if (scene === "ending-full" && path === "/") {
        await runEndingFull(overlay);
        return;
      }

      if (path === "/") {
        await showSlowStartLoader(overlay);
        await runHomeFull(overlay);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();