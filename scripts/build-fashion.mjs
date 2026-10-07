import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const target = 'dist/projects/fashion-show/index.html';
if (!existsSync(target)) throw new Error('FASHION SHOW project page was not generated');

const collections = [
  {
    key: 'seasons', className: 'seasons', index: 'COLLECTION 01', title: 'FOUR SEASONS', ja: '春夏秋冬',
    intro: '春・夏・秋・冬。四つの季節を、それぞれ異なる「あさはねむゐ」として表現したコレクション。',
    looks: [
      { number: 'LOOK 01', key: 'spring', title: 'SPRING', keywords: ['CUTE','PINK','DENIM'], description: '淡いデニムと桜色をベースに、花や小物で遊びを加えた春のストリートスタイル。かわいらしさの中に、自由で少しやんちゃな表情を。' },
      { number: 'LOOK 02', key: 'summer', title: 'SUMMER', keywords: ['YOUTH','AQUA','LIGHT'], description: '青緑を基調に、ハーフパンツと軽やかな素材を合わせたサマースタイル。少年らしい無邪気さと、夏の開放感をひとつのシルエットに。' },
      { number: 'LOOK 03', key: 'autumn', title: 'AUTUMN', keywords: ['CLASSIC','BROWN','DRESSY'], description: '深みのあるブラウンでまとめた、クラシカルなスーツスタイル。きっちりとした装いに遊びを忍ばせた、大人の秋。' },
      { number: 'LOOK 04', key: 'winter', title: 'WINTER', keywords: ['COOL','LEATHER','BLUE'], description: 'ブラックレザーとタートルネックを軸に仕上げた、冬のクールスタイル。無骨なブラックにブルーを差し込み、冷たい季節の空気を映し出す。' }
    ]
  },
  {
    key: 'directions', className: 'directions', index: 'COLLECTION 02', title: 'FOUR DIRECTIONS', ja: '東西南北',
    intro: '東・西・南・北。四つの方角から着想を得て、異なる文化や装いへと広げたコレクション。',
    looks: [
      { number: 'LOOK 01', key: 'chinese', title: 'CHINESE', keywords: ['SHARP','ORIENTAL','RED'], description: 'チャイナ服の意匠を、肌見せとロングシルエットで大胆に再構築。シャープなラインに赤のアクセントを効かせ、凛とした存在感を引き出したスタイル。' },
      { number: 'LOOK 02', key: 'japanese', title: 'JAPANESE', keywords: ['LAYERED','ORNATE','GOLD'], description: '着物を幾重にも重ね、和傘や揺れる装飾を取り入れた華やかな和装スタイル。白と金を中心に紫を添え、幻想的で重厚な佇まいへ。' },
      { number: 'LOOK 03', key: 'western', title: 'WESTERN', keywords: ['NOBLE','ELEGANT','BLUE'], description: 'クラシカルな貴族服をベースに、レースや装飾を重ねたエレガントなスタイル。白と金に淡いブルーを合わせ、気品の中に繊細な華やかさを。' },
      { number: 'LOOK 04', key: 'arabian', title: 'ARABIAN', keywords: ['EXOTIC','JEWEL','FLOW'], description: '月や星を思わせる装飾と、ジュエリーを重ねたアラビアンスタイル。大胆な肌見せと流れるシルエットが、幻想的な異国のムードを描く。' }
    ]
  }
];

const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset = (collection, look, view) => `/assets/images/fashion/fashion-${collection}-${look}-${view}.webp`;

const renderLook = (collection, look) => {
  const full = asset(collection.key, look.key, 'full');
  const face = asset(collection.key, look.key, 'face1');
  const keywords = look.keywords.join(' / ');
  return `<article class="fashion-look" data-full="${full}" data-faces="${face}" data-number="${esc(look.number)}" data-title="${esc(look.title)}" data-keywords="${esc(keywords)}" data-description="${esc(look.description)}">
    <div class="fashion-look__stage fashion-protected fashion-image-missing"><button class="fashion-look__button" type="button" aria-haspopup="dialog" aria-controls="fashion-dialog" aria-label="${esc(look.title)}のLOOK詳細を開く"><img alt="${esc(look.title)} 全身ビジュアル" loading="lazy" decoding="async"></button><span class="fashion-look__open" aria-hidden="true">VIEW LOOK +</span></div>
    <div class="fashion-look__meta"><span class="fashion-look__number">${esc(look.number)}</span><h3 class="fashion-look__title">${esc(look.title)}</h3><div class="fashion-look__keywords">${esc(keywords)}</div></div>
  </article>`;
};

const renderCollection = collection => `<section class="fashion-collection fashion-collection--${collection.className}" aria-labelledby="fashion-${collection.key}-title"><div class="fashion-collection__head" data-fashion-reveal><span class="fashion-collection__index">${esc(collection.index)}</span><div class="fashion-collection__title"><h2 id="fashion-${collection.key}-title">${esc(collection.title)}<small>${esc(collection.ja)}</small></h2><p>${esc(collection.intro)}</p></div></div><div class="fashion-look-grid">${collection.looks.map(look => renderLook(collection, look)).join('')}</div></section>`;

const main = `<main class="fashion-page">
  <section class="fashion-hero" aria-labelledby="fashion-title"><div class="fashion-hero__inner"><p class="fashion-hero__eyebrow">ASAHA NEMUI / COLLECTION ARCHIVE</p><h1 id="fashion-title">FASHION<br>SHOW</h1><p class="fashion-hero__lead">二次元で生まれた衣装を、現実のファッションへ。</p></div><span class="fashion-scroll">SCROLL TO EXPLORE</span></section>
  <section class="fashion-about" data-fashion-reveal><div class="fashion-about__grid"><p class="fashion-kicker">ABOUT THE PROJECT</p><div class="fashion-about__copy"><p>「あさはねむゐ」をテーマに、ひとつのコンセプトから複数の衣装とビジュアルを生み出すファッションプロジェクト。</p><p>衣装ごとに異なる表情や世界観を描きながら、イラストとして見せるだけでなく、グッズ、展示、ファッションアイテムなど、さまざまな形へ展開してきました。</p><p>画面の中で生まれたデザインを、少しずつ現実へ。最終的には、実際に身にまとうことのできる衣装や、リアルな空間でのファッションショーへとつなげていくことを目指しています。</p><p>「あさはねむゐ」というひとりの存在を、テーマごとに違う装い、違う空気、違う姿へ。その変化そのものを、ひとつのコレクションとして残していく企画です。</p></div></div><p class="fashion-manifesto"><span>二次元から、現実へ。</span><span>衣装から、<span class="fashion-manifesto__offset">ファッションへ。</span></span></p></section>
  ${collections.map(renderCollection).join('')}
  <section class="fashion-next" data-fashion-reveal><div><p class="fashion-kicker">NEXT COLLECTION</p><h2>Another theme.<br>Another Asaha Nemui.</h2><strong>COMING SOON</strong></div></section>
  <div class="fashion-return"><a class="text-link" href="/activity/#projects">← 活動のいろいろへ</a></div>
  <dialog class="fashion-dialog" id="fashion-dialog" aria-modal="true" aria-labelledby="fashion-dialog-title" data-view="full"><div class="fashion-dialog__inner"><div class="fashion-dialog__top"><span>FASHION SHOW / LOOK DETAIL</span><button type="button" class="fashion-dialog__close" aria-label="LOOK詳細を閉じる">CLOSE ×</button></div><div class="fashion-dialog__visual fashion-protected fashion-image-missing"><img data-fashion-dialog-image alt="" decoding="async"></div><div class="fashion-dialog__copy"><span class="fashion-dialog__number" data-fashion-dialog-number></span><h2 id="fashion-dialog-title" data-fashion-dialog-title></h2><div class="fashion-dialog__keywords" data-fashion-dialog-keywords></div><div class="fashion-dialog__faces" data-fashion-dialog-faces aria-label="表情差分"></div><p class="fashion-dialog__description" data-fashion-dialog-description></p></div></div></dialog>
</main>`;

let html = readFileSync(target, 'utf8');
html = html.replace('<link rel="stylesheet" href="/style.css">', '<link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/fashion.css"><link rel="stylesheet" href="/fashion-fixes.css">');
html = html.replace(/<body([^>]*)>/, (_, attrs) => `<body${attrs}${/class=/.test(attrs) ? '' : ' class="fashion-page-shell"'}>`);
html = html.replace(/<main>[\s\S]*?<\/main>/, main);
html = html.replace('<script src="/site.js" defer></script>', '<script src="/site.js" defer></script><script src="/fashion.js" defer></script>');
writeFileSync(target, html);

// PROJECTS is a section of ACTIVITY. Keep old URLs working, but do not maintain a duplicate index page.
const activityPath = 'dist/activity/index.html';
if (existsSync(activityPath)) {
  let activityHtml = readFileSync(activityPath, 'utf8');
  const projectSectionPattern = /<section class="section"><p class="kicker">PROJECTS<\/p><h2>企画の特設ページ<\/h2>[\s\S]*?<\/section>/;
  const matched = activityHtml.match(projectSectionPattern);
  if (matched) {
    const moved = matched[0].replace('<section class="section">', '<section class="section" id="projects">');
    activityHtml = activityHtml.replace(projectSectionPattern, '');
    activityHtml = activityHtml.replace('<section class="section related-links">', `${moved}<section class="section related-links">`);
  }
  writeFileSync(activityPath, activityHtml);
}

const projectsIndex = 'dist/projects/index.html';
if (existsSync(projectsIndex)) {
  let projectIndexHtml = readFileSync(projectsIndex, 'utf8');
  projectIndexHtml = projectIndexHtml.replace('<head>', '<head><meta http-equiv="refresh" content="0; url=/activity/#projects">');
  projectIndexHtml = projectIndexHtml.replace(/<main>[\s\S]*?<\/main>/, '<main><section class="section"><p class="kicker">PROJECTS</p><h1>企画は「活動のいろいろ」にまとめました。</h1><p><a class="text-link" href="/activity/#projects">企画を見る →</a></p></section></main>');
  writeFileSync(projectsIndex, projectIndexHtml);
}

const htmlFiles = dir => readdirSync(dir).flatMap(name => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? htmlFiles(path) : path.endsWith('.html') ? [path] : [];
});
for (const file of htmlFiles('dist')) {
  let page = readFileSync(file, 'utf8');
  page = page.replaceAll('href="/projects/"', 'href="/activity/#projects"');
  page = page.replace('<a class="text-link" href="/activity/#projects">← 企画一覧へ</a><a class="text-link" href="/activity/">活動のいろいろへ ↗</a>', '<a class="text-link" href="/activity/#projects">← 活動のいろいろへ</a>');
  writeFileSync(file, page);
}

