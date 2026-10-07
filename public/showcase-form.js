const form=document.querySelector('#showcase-form');
if(form){
  const button=form.querySelector('button[type=submit]');const status=document.querySelector('#form-status');let busy=false;
  const message=(text,error=false)=>{status.textContent=text;status.dataset.error=String(error);};
  const fields=form.querySelector('.form-fields');let resizeAnimation;
  const updateType=(smooth=false)=>{
    const previousHeight=fields.getBoundingClientRect().height;resizeAnimation?.cancel();
    const type=form.elements.type.value;
    const creator=['self','recommend'].includes(type);
    form.elements.name.required=creator;form.elements.url.required=creator;
    form.querySelector('[data-name-title]').textContent=type==='recommend'?'推薦する活動者名':creator?'活動者名':'お名前・団体名';
    form.querySelector('[data-name-required]').textContent=creator?'必須':'任意';
    form.querySelector('[data-url-title]').textContent=type==='recommend'?'推薦する方の活動先URL':creator?'活動先のURL':'参考URL';
    form.querySelector('[data-url-required]').textContent=creator?'必須':'任意';
    form.querySelector('[data-url-help]').textContent=type==='recommend'?'推薦する方のX・YouTube・公式サイトなど、活動がわかるリンクをひとつ。':creator?'X・YouTube・公式サイトなど、活動がわかるリンクをひとつ。':'公式サイトなど、参考になるリンクがあれば。なくても送信できます。';
    form.elements.name.placeholder=type==='recommend'?'推薦する活動者のお名前':creator?'活動名':'お名前・団体名など（任意）';
    form.querySelector('[data-activity-title]').textContent=type==='recommend'?'推薦する方の活動内容':'活動内容';
    form.elements.activity.placeholder=type==='recommend'?'推薦する方の普段の活動や得意なことなど':'普段の活動や得意なことなど';
    form.querySelector('[data-idea-title]').textContent=type==='recommend'?'その方に参加してほしい企画':'やってみたい企画';
    form.elements.idea.placeholder=type==='recommend'?'推薦する方と見てみたい企画など。ふんわりした案でも大丈夫です。':'カフェ、展示、音楽イベントなど。ふんわりした案でも大丈夫です。';
    form.querySelector('[data-activity-field]').hidden=!creator;form.elements.activity.disabled=!creator;
    form.querySelector('[data-idea-field]').hidden=type==='other';form.elements.idea.disabled=type==='other';
    form.querySelector('[data-submitter-field]').hidden=type!=='recommend';form.elements.submitter.disabled=type!=='recommend';
    form.querySelector('[data-reason-title]').textContent=type==='recommend'?'おすすめポイント':type==='self'?'参加への想い・相談内容':'相談内容';
    form.elements.reason.placeholder=type==='recommend'?'推薦する方の魅力や、おすすめする理由など':creator?'参加への想いや、一緒にやってみたいことなど':'お仕事、協賛、ご質問など、お気軽にお聞かせください。';
    const nextHeight=fields.getBoundingClientRect().height;
    if(smooth&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&Math.abs(nextHeight-previousHeight)>1){
      resizeAnimation=fields.animate([{height:previousHeight+'px',overflow:'hidden'},{height:nextHeight+'px',overflow:'hidden'}],{duration:280,easing:'cubic-bezier(.22,.61,.36,1)'});
    }
  };
  const requested=new URLSearchParams(location.search).get('type');
  const selected=[...form.querySelectorAll('[name="type"]')].find(input=>input.value===requested)||form.querySelector('[name="type"]');selected.checked=true;
  form.addEventListener('change',event=>{if(event.target.name==='type')updateType(true);});updateType();
  fetch('/api/forms/availability',{cache:'no-store'}).then(async response=>{if(!response.ok)throw new Error();const data=await response.json();if(!data.ready)throw new Error();button.disabled=false;message('');}).catch(()=>message('現在、受付を準備しています。しばらくお待ちください。'));
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||!form.reportValidity())return;
    busy=true;button.disabled=true;message('送信しています…');
    const data=Object.fromEntries(new FormData(form));data.consent=form.elements.consent.checked;
    try{
      const response=await fetch('/api/forms/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.error||'送信できませんでした。もう一度お試しください。');
      form.hidden=true;const complete=document.querySelector('#form-complete');complete.hidden=false;
      document.querySelector('#form-reference').textContent='受付番号：'+result.id;complete.focus({preventScroll:true});complete.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    }catch(error){message(error.message||'送信できませんでした。入力内容を残していますので、もう一度お試しください。',true);}
    finally{busy=false;button.disabled=false;}
  });
}
