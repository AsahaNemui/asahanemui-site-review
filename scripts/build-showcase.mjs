import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const target = 'dist/projects/showcase-a/index.html';
if (!existsSync(target)) throw new Error('showcase.A project page was not generated');

const litlink = 'https://lit.link/showcase_a';
const x = 'https://x.com/showcas_A';
const brandDescription = '個人勢VTuberのあさはねむゐがプロデュースする、バーチャルとリアルをつなぐ挑戦企画。';

const values = [
  ['01', 'WORLD', '世界観から企画をつくる。', 'まず「何をするか」ではなく、「どんな空気を届けたいか」から考える。'],
  ['02', 'EXPERIENCE', '<span class="showcase-break-line">その企画だから残る、</span><span class="showcase-break-line">体験と思い出を。</span>', 'ただ見るだけではなく、行ったこと自体が思い出になる形を目指す。'],
  ['03', 'TOGETHER', '<span class="showcase-break-line">ひとりではできないことを、</span><span class="showcase-break-line">一緒に。</span>', '活動者、クリエイター、場所、企業、ファン。それぞれの力で企画を育てていく。'],
  ['04', 'CONTINUE', '単発で終わらせない。', 'ひとつの企画が次の企画につながり、ブランドとして積み重なっていく形を大切にする。']
];

const formats = [
  ['CAFE', 'コラボカフェ'], ['EXHIBITION', '展示イベント'], ['MUSIC', '音楽イベント'], ['POP-UP', 'ポップアップ'],
  ['FAN MEETING', 'ファンミーティング'], ['EXPERIENCE', '体験型企画'], ['TALK', 'トークイベント'], ['GOODS', 'コラボグッズ']
];

const main = `<main class="showcase-page">
  <section class="showcase-hero" aria-labelledby="showcase-title">
    <div class="showcase-hero__glow showcase-hero__glow--one" aria-hidden="true"></div>
    <div class="showcase-hero__glow showcase-hero__glow--two" aria-hidden="true"></div>
    <div class="showcase-hero__inner">
      <div class="showcase-hero__copy">
        <p class="showcase-eyebrow">ASAHA NEMUI / PROJECT BRAND</p>
        <div class="showcase-hero__message"><strong>WORLDS IN MOTION</strong><p>まだ知らない景色へ。</p></div>
      </div>
      <h1 id="showcase-title" aria-label="showcase.A"><span class="showcase-word">showcase</span><span class="showcase-dot">.</span><span class="showcase-a">A</span></h1>
    </div>
    <p class="showcase-scroll" aria-hidden="true">SCROLL / EXPLORE</p>
  </section>

  <section class="showcase-about showcase-section">
    <div class="showcase-section__label"><span>01</span><p>ABOUT</p></div>
    <div class="showcase-about__copy">
      <p class="showcase-lead">showcase.Aは、個人勢VTuber・あさはねむゐがプロデュースする挑戦企画です。</p>
      <p>VTuberひとりでは実現しづらい企画を、企画・運営から手がけ、ファンのみなさんやさまざまな人と一緒に形にしていきます。</p>
      <p>オンラインで生まれた世界観やアイデアを、カフェ、展示、音楽、体験型企画などへ。オンラインだけでは生まれない体験や交流を通して、バーチャルとリアルをつないでいきます。</p>
    </div>
  </section>

  <section class="showcase-concept showcase-section" aria-labelledby="showcase-concept-title">
    <div class="showcase-section__label"><span>02</span><p id="showcase-concept-title">CONCEPT</p></div>
    <div class="showcase-concept__grid">
      <article><p class="showcase-concept__kicker">VIRTUAL → REAL</p><h2>オンラインから、別の体験へ。</h2><p>オンラインで生まれた世界観やアイデアを、別の体験へ広げていく。</p></article>
      <article><p class="showcase-concept__kicker">EXPERIENCE</p><h2>その企画だから残る、体験と思い出を。</h2><p>その場、その企画だからこそ残る体験や思い出をつくる。</p></article>
      <article><p class="showcase-concept__kicker">TOGETHER</p><h2>ひとりではできないことを、一緒に。</h2><p>ひとりではできないことを、さまざまな人と一緒に形にしていく。</p></article>
    </div>
  </section>

  <section class="showcase-why showcase-section" aria-labelledby="showcase-why-title">
    <div class="showcase-section__label"><span>03</span><p id="showcase-why-title">WHY</p></div>
    <div class="showcase-why__content">
      <p class="showcase-overline">WHY showcase.A?</p><h2><span class="showcase-break-line">画面の中だけで、</span><span class="showcase-break-line">終わらせたくない。</span></h2>
      <div class="showcase-why__copy"><p>配信や動画の中で生まれた世界観やアイデアを、画面の中だけで終わらせたくない。</p><p>その場に行くこと。誰かと同じ時間を過ごすこと。実際に見て、聴いて、触れて、覚えて帰ること。</p><p>オンラインで生まれたものを、別の体験へひらいていく。showcase.Aは、そんな「現実に残る企画」をつくるためのブランドです。</p></div>
    </div>
  </section>

  <section class="showcase-values showcase-section" aria-labelledby="showcase-values-title">
    <div class="showcase-section__label"><span>04</span><p id="showcase-values-title">VALUES</p></div>
    <div class="showcase-values__grid">${values.map(([n,en,title,body]) => `<article><span class="showcase-value__no">${n}</span><p class="showcase-value__en">${en}</p><h2>${title}</h2><p>${body}</p></article>`).join('')}</div>
  </section>

  <section class="showcase-format showcase-section" aria-labelledby="showcase-format-title">
    <div class="showcase-section__label"><span>05</span><p id="showcase-format-title">PROJECT FORMAT</p></div>
    <div class="showcase-format__content"><div class="showcase-format__intro"><h2><span class="showcase-break-line">企画の形は、</span><span class="showcase-break-line">ひとつじゃない。</span></h2><p>テーマや出演者、場所に合わせて、その企画にいちばん似合う形を考えます。</p></div><div class="showcase-format__grid">${formats.map(([en,ja]) => `<div><span>${en}</span><strong>${ja}</strong></div>`).join('')}</div></div>
  </section>

  <section class="showcase-projects showcase-section" aria-labelledby="showcase-projects-title">
    <div class="showcase-section__label"><span>06</span><p id="showcase-projects-title">PROJECTS</p></div>
    <div class="showcase-projects__content">
      <div class="showcase-projects__intro"><p class="showcase-overline">CASE FILES / PROJECT ARCHIVE</p><h2><span class="showcase-break-line">企画を、ひとつずつ</span><span class="showcase-break-line">積み重ねていく。</span></h2><p><span class="showcase-break-line">開催した企画も、これから始まる企画も、</span><span class="showcase-break-line">showcase.Aのアーカイブとして残していきます。</span></p></div>
      <div class="showcase-files" aria-label="showcase.A project archive">
        <button type="button" class="showcase-file showcase-file--back showcase-file--third" aria-expanded="false" aria-label="PROJECT 03：準備中"><span>PROJECT 03</span><strong>COMING SOON</strong></button>
        <button type="button" class="showcase-file showcase-file--back showcase-file--second" aria-expanded="false" aria-label="PROJECT 02：準備中"><span>PROJECT 02</span><strong>COMING SOON</strong></button>
        <article class="showcase-file showcase-file--active">
          <div class="showcase-file__tab"><span>PROJECT 01</span><em>UPCOMING</em></div>
          <p class="showcase-file__class">COLLABORATION CAFE / REAL EVENT</p>
          <div class="showcase-file__body">
            <div class="showcase-file__visual"><img src="/assets/images/showcase/the-first-order-logo.webp" width="1200" height="833" alt="THE FIRST ORDER — showcase.A" loading="lazy" decoding="async"></div>
            <div class="showcase-file__details"><p class="showcase-file__date">2026.10.10 / TOKYO</p><p>showcase.A最初のリアルイベント。「もしVTuberがカフェの店員として働いていたら？」という世界観を、実際のカフェ空間へ。アメリカンダイナーをイメージしたコラボイベントとして開催します。</p><div class="showcase-file__links"><a href="${litlink}" target="_blank" rel="noopener noreferrer">EVENT DETAILS <span>↗</span></a><a href="${x}" target="_blank" rel="noopener noreferrer">LATEST NEWS <span>↗</span></a></div></div>
          </div>
          <span class="showcase-file__stamp" aria-hidden="true">CASE 001</span>
        </article>
      </div>
    </div>
  </section>

  <section class="showcase-collab showcase-section" aria-labelledby="showcase-collab-title">
    <div class="showcase-section__label"><span>07</span><p id="showcase-collab-title">COLLABORATION</p></div>
    <div class="showcase-collab__content">
      <div class="showcase-collab__intro"><p class="showcase-overline">BUILD IT TOGETHER</p><h2><span class="showcase-break-line">一緒につくる人を、</span><span class="showcase-break-line">探しています。</span></h2><p>活動者、企業・店舗、そして「この人とこんな企画が見たい」という声まで。<span class="showcase-collab-note">showcase.Aは、いろんな出会いから企画を育てていきます。</span></p></div>
      <div class="showcase-collab__routes">
        <article><span>01 / CREATOR</span><h3>活動者の方へ</h3><p>「こんなイベントをやってみたい」「この世界観で企画に参加してみたい」。そんな相談も歓迎です。</p></article>
        <article><span>02 / PARTNER</span><h3>企業・店舗・協賛の方へ</h3><p>コラボイベント、空間企画、タイアップ、協賛など。ブランドや場所の魅力と活動者の世界観を掛け合わせます。</p></article>
        <article><span>03 / RECOMMEND</span><h3>おすすめ・自薦</h3><p>「この活動者さんとこんな企画が合いそう」という推薦も、自分自身の活動についての自薦も歓迎です。</p></article>
      </div>

      <section class="showcase-form showcase-form--invite" id="collaboration-form" aria-labelledby="collaboration-form-title">
        <div><p class="showcase-overline">GET IN TOUCH</p><h3 id="collaboration-form-title">アイデアを聞かせてください。</h3><p>参加希望、活動者の推薦、企業・店舗のご相談など。<span class="showcase-invite-note">まだ具体的に決まっていなくても歓迎です。</span></p></div>
        <a class="form-open" href="/projects/showcase-a/contact/" target="_blank" rel="noopener">相談フォームを開く <span aria-hidden="true">↗</span><small>別タブで開きます</small></a>
      </section>
    </div>
  </section>

  <section class="showcase-next showcase-section" aria-labelledby="showcase-next-title">
    <div class="showcase-section__label"><span>08</span><p id="showcase-next-title">WHAT'S NEXT?</p></div>
    <div class="showcase-next__content"><p class="showcase-next__eyebrow">これからの showcase.A</p><h2>次は何をするんだろう？</h2><p class="showcase-next__description">イベントごとにテーマや出演者、場所を変えながら、さまざまな形に挑戦していきます。</p><p class="showcase-next__statement">そう思ってもらえる企画ブランドを目指します。</p></div>
  </section>

  <div class="showcase-return"><a href="/activity/#projects">← 活動のいろいろへ</a></div>
</main>`;

const contactMain = `<main class="showcase-contact"><a class="form-back" href="/">← HOME に戻る</a>      <section class="showcase-form" id="collaboration-form" aria-labelledby="collaboration-form-title">
        <div class="showcase-form__heading"><p class="showcase-overline">CONTACT FORM</p><h1 id="collaboration-form-title">ご相談・お問い合わせ</h1><p><span class="form-intro-line">出演・制作のご依頼、コラボや企画のご相談など、こちらからお送りください。</span><span class="form-intro-line">内容がまだ固まっていない段階でもお気軽にご相談いただけます。</span></p></div><p class="form-help form-reply-notice"><span class="form-notice-line">内容を確認し、必要に応じてご連絡いたします。</span><span class="form-notice-line">すべてのお問い合わせへの返信をお約束するものではございません。</span></p>
        <form id="showcase-form">
          <fieldset class="form-types"><legend>相談の種類 <small>必須</small></legend><label><input type="radio" name="type" value="self" required><span>自薦・参加希望</span></label><label><input type="radio" name="type" value="recommend" required><span>活動者の推薦</span></label><label><input type="radio" name="type" value="partner" required><span>企業・店舗・協賛</span></label><label><input type="radio" name="type" value="other" required><span>その他の相談</span></label></fieldset>
          <div class="form-fields">
            <label><span data-name-title>活動者名</span> <small data-name-required>必須</small><input name="name" maxlength="120" required autocomplete="organization" placeholder="推薦の場合は、推薦する方のお名前"></label>
            <label><span data-url-title>活動先のURL</span> <small data-url-required>必須</small><input type="url" name="url" maxlength="2000" required placeholder="https://x.com/..." inputmode="url"><span class="form-help" data-url-help>X・YouTube・公式サイトなど、活動がわかるリンクをひとつ。</span></label>
            <label class="form-wide" data-activity-field><span data-activity-title>活動内容</span> <small>任意</small><textarea name="activity" maxlength="2000" rows="3" placeholder="普段の活動や得意なことなど"></textarea></label>
            <label class="form-wide" id="form-reason-label"><span><span data-reason-title>相談内容</span> <small>必須</small></span><textarea name="reason" maxlength="4000" rows="4" required placeholder="ご相談・ご依頼の内容をお聞かせください。"></textarea></label>
            <label class="form-wide" data-idea-field><span data-idea-title>やってみたい企画</span> <small>任意</small><textarea name="idea" maxlength="3000" rows="3" placeholder="カフェ、展示、音楽イベントなど。ふんわりした案でも大丈夫です。"></textarea></label>
            <label data-submitter-field>送信する方のお名前 <small>任意</small><input name="submitter" maxlength="120" autocomplete="name" placeholder="活動名・ニックネームでもOK"></label>
            <label>あなたの連絡先 <small>必須</small><input name="contact" maxlength="254" required placeholder="メールアドレス または XのID"><span class="form-help">連絡が取れるご自身の連絡先を入力してください。</span></label>
          </div>
          <div class="form-honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
          <label class="form-consent"><input type="checkbox" name="consent" required><span>入力内容をご相談の検討・連絡に利用することに同意します。<a href="/privacy/" target="_blank" rel="noopener">個人情報の取り扱い ↗</a></span></label>
          <p class="form-help">送信は参加・採用をお約束するものではありません。</p>
          <div class="form-submit"><button type="submit" disabled>内容を送信する <span aria-hidden="true">↗</span></button><p id="form-status" role="status" aria-live="polite">受付状況を確認しています。</p></div>
          <noscript><p>フォームの送信にはJavaScriptを有効にしてください。</p></noscript>
        </form>
        <div class="form-complete" id="form-complete" hidden tabindex="-1"><p class="showcase-overline">THANK YOU</p><h3>ご相談を受け付けました。</h3><p>想いを届けてくださって、ありがとうございます。内容を確認し、必要に応じてご連絡します。</p><small id="form-reference"></small></div>
      </section></main>`;

let html = readFileSync(target, 'utf8');
html = html.replace('<link rel="stylesheet" href="/style.css">', '<link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/showcase.css?v=20261006-3"><link rel="stylesheet" href="/showcase-hero-fixes.css?v=20261006-1"><link rel="stylesheet" href="/showcase-portal.css?v=20260930-1"><link rel="stylesheet" href="/showcase-portal-polish.css?v=20261006-3"><link rel="stylesheet" href="/showcase-linebreaks.css?v=20261006-6"><link rel="stylesheet" href="/showcase-form.css?v=20261006-3">');
html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${brandDescription}">`);
html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${brandDescription}">`);
html = html.replace(/<body([^>]*)>/, (_, attrs) => `<body${attrs}${/class=/.test(attrs) ? '' : ' class="showcase-page-shell"'}>`);
html = html.replace(/<main>[\s\S]*?<\/main>/, main);
html = html.replace('</body>', '<script src="/showcase-files.js?v=20261005-2" defer></script><script src="/showcase-form.js?v=20261006-4" defer></script></body>');
writeFileSync(target, html);
let contactHtml = html.replace('<html lang="ja">','<html lang="ja" class="showcase-contact-root">').replace(/<main[^>]*>[\s\S]*?<\/main>/, contactMain).replace(/<title>[\s\S]*?<\/title>/, '<title>ご相談・お問い合わせ | あさはねむゐ</title>').replace(/<link rel="canonical"[^>]*>/, '<link rel="canonical" href="https://asaha-nemui.com/projects/showcase-a/contact/">').replace(/<meta property="og:url"[^>]*>/, '<meta property="og:url" content="https://asaha-nemui.com/projects/showcase-a/contact/">');
const contactDescription = 'あさはねむゐへの出演・制作のご依頼、コラボや企画のご相談を受け付けるお問い合わせフォーム。';
contactHtml = contactHtml.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${contactDescription}">`).replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${contactDescription}">`).replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="ご相談・お問い合わせ | あさはねむゐ">');
mkdirSync('dist/projects/showcase-a/contact', {recursive:true});
writeFileSync('dist/projects/showcase-a/contact/index.html', contactHtml);

const activityPath = 'dist/activity/index.html';
if (existsSync(activityPath)) {
  let activityHtml = readFileSync(activityPath, 'utf8');
  activityHtml = activityHtml.replace('<p>企画のお知らせと、イベントの記録。</p>', '<p>オンラインで生まれた世界観を、さまざまな体験へ広げる企画プロジェクト。</p>');
  activityHtml = activityHtml.replace('<link rel="stylesheet" href="/style.css">', '<link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/activity-fixes.css?v=20261005-1">');
  activityHtml = activityHtml.replace('<h3>ファッション系グッズ</h3>', '<h3><span class="activity-title-phrase">ファッション系</span><wbr><span class="activity-title-phrase">グッズ</span></h3>');
  writeFileSync(activityPath, activityHtml);
}
