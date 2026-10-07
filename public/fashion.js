(() => {
  const root = document.querySelector('.fashion-page');
  if (!root) return;

  const dialog = document.querySelector('#fashion-dialog');
  const dialogImage = dialog?.querySelector('[data-fashion-dialog-image]');
  const dialogNumber = dialog?.querySelector('[data-fashion-dialog-number]');
  const dialogTitle = dialog?.querySelector('[data-fashion-dialog-title]');
  const dialogKeywords = dialog?.querySelector('[data-fashion-dialog-keywords]');
  const dialogDescription = dialog?.querySelector('[data-fashion-dialog-description]');
  const dialogFaces = dialog?.querySelector('[data-fashion-dialog-faces]');
  const closeButton = dialog?.querySelector('.fashion-dialog__close');
  let activeLook = null;
  let activeDialogFace = -1;
  let previousFocus = null;
  let restoreFocusOnClose = false;
  let lastInput = 'pointer';
  let imageSwapToken = 0;
  let dialogOpenToken = 0;

  document.addEventListener('keydown', () => { lastInput = 'keyboard'; }, true);
  document.addEventListener('pointerdown', () => { lastInput = 'pointer'; }, true);

  const facesFor = look => (look?.dataset.discoveredFaces || look?.dataset.faces || '').split('|').filter(Boolean);

  const setMissingState = img => {
    const frame = img?.closest('.fashion-protected');
    if (!frame) return;
    frame.classList.toggle('fashion-image-missing', !img.complete || img.naturalWidth === 0);
  };

  const wireImage = img => {
    if (!img) return;
    img.draggable = false;
    img.addEventListener('load', () => img.closest('.fashion-protected')?.classList.remove('fashion-image-missing'));
    img.addEventListener('error', () => img.closest('.fashion-protected')?.classList.add('fashion-image-missing'));
    if (img.complete) setMissingState(img);
  };

  root.querySelectorAll('.fashion-protected').forEach(frame => {
    frame.addEventListener('contextmenu', event => event.preventDefault());
    frame.querySelectorAll('img').forEach(wireImage);
  });

  const swapImage = (img, src, alt, immediate = false) => {
    if (!img || !src) return;
    const token = ++imageSwapToken;
    const absolute = new URL(src, location.href).href;
    const frame = img.closest('.fashion-dialog__visual');

    if (!immediate) frame?.classList.add('is-switching');

    if (img.src === absolute) {
      img.alt = alt;
      requestAnimationFrame(() => frame?.classList.remove('is-switching'));
      return;
    }

    const commit = () => {
      if (token !== imageSwapToken) return;
      img.src = src;
      img.alt = alt;
      requestAnimationFrame(() => requestAnimationFrame(() => frame?.classList.remove('is-switching')));
    };

    if (immediate) {
      commit();
      return;
    }

    const probe = new Image();
    probe.onload = () => {
      if (token !== imageSwapToken) return;
      window.setTimeout(commit, 80);
    };
    probe.onerror = () => {
      if (token !== imageSwapToken) return;
      commit();
    };
    probe.src = src;
  };

  const imageExists = src => new Promise(resolve => {
    const probe = new Image();
    probe.onload = () => resolve(src);
    probe.onerror = () => resolve(null);
    probe.src = src;
  });

  const preloadImage = src => new Promise(resolve => {
    if (!src) {
      resolve(null);
      return;
    }
    const probe = new Image();
    probe.onload = async () => {
      try {
        if (probe.decode) await probe.decode();
      } catch {}
      resolve(src);
    };
    probe.onerror = () => resolve(null);
    probe.src = src;
  });

  const discoverFaces = async look => {
    if (!look) return [];
    if (look.dataset.discoveredFaces) return facesFor(look);
    const first = (look.dataset.faces || '').split('|').filter(Boolean)[0];
    if (!first) return [];
    const candidates = [first];
    if (/face1\.webp$/i.test(first)) {
      for (let i = 2; i <= 8; i += 1) candidates.push(first.replace(/face1\.webp$/i, `face${i}.webp`));
    }
    const found = (await Promise.all(candidates.map(imageExists))).filter(Boolean);
    look.dataset.discoveredFaces = found.join('|');
    return found;
  };

  const setDialogView = (view, faceIndex = activeDialogFace) => {
    if (!activeLook || !dialogImage || !dialog) return;
    const faces = facesFor(activeLook);
    const index = Math.max(0, Math.min(faceIndex, Math.max(0, faces.length - 1)));
    const src = view === 'face' ? faces[index] : activeLook.dataset.full;
    if (!src) return;

    activeDialogFace = view === 'face' ? index : -1;
    dialog.dataset.view = view;
    swapImage(dialogImage, src, `${activeLook.dataset.title || ''} ${view === 'face' ? `表情 ${index + 1}` : '全身'}ビジュアル`);

    dialogFaces?.querySelectorAll('[data-fashion-dialog-face-index]').forEach(button => {
      button.setAttribute('aria-pressed', String(view === 'face' && Number(button.dataset.fashionDialogFaceIndex) === index));
    });
    dialogFaces?.querySelector('[data-fashion-full-reset]')?.setAttribute('aria-pressed', String(view === 'full'));
  };

  const renderDialogFaces = async preparedFaces => {
    if (!dialogFaces || !activeLook) return;
    const requestedLook = activeLook;
    const faces = preparedFaces || await discoverFaces(requestedLook);
    if (activeLook !== requestedLook) return;

    dialogFaces.replaceChildren();
    dialogFaces.hidden = faces.length === 0;
    if (!faces.length) return;

    const head = document.createElement('div');
    head.className = 'fashion-expression-head';
    const label = document.createElement('span');
    label.textContent = 'EXPRESSIONS';
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.dataset.fashionFullReset = '';
    reset.textContent = 'FULL LOOK';
    reset.setAttribute('aria-pressed', 'true');
    reset.addEventListener('click', () => setDialogView('full'));
    head.append(label, reset);

    const list = document.createElement('div');
    list.className = 'fashion-expression-list';
    faces.forEach((src, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'fashion-expression-thumb';
      button.dataset.fashionDialogFaceIndex = String(index);
      button.setAttribute('aria-label', `表情 ${index + 1} を大きく表示`);
      button.setAttribute('aria-pressed', 'false');
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.loading = 'eager';
      img.draggable = false;
      const number = document.createElement('span');
      number.textContent = String(index + 1).padStart(2, '0');
      button.append(img, number);
      button.addEventListener('click', () => {
        if (activeLook !== requestedLook) return;
        const selected = dialog.dataset.view === 'face' && activeDialogFace === index;
        setDialogView(selected ? 'full' : 'face', index);
      });
      list.append(button);
    });
    dialogFaces.append(head, list);
  };

  const openDialog = async look => {
    if (!dialog || !dialogImage || !dialogNumber || !dialogTitle || !dialogKeywords || !dialogDescription) return;

    const openToken = ++dialogOpenToken;
    activeLook = look;
    activeDialogFace = -1;
    previousFocus = document.activeElement;
    restoreFocusOnClose = lastInput === 'keyboard';

    // 文章・メイン画像・表情サムネイルを全部そろえてから一緒に見せる。
    dialogNumber.textContent = look.dataset.number || '';
    dialogTitle.textContent = look.dataset.title || '';
    dialogKeywords.textContent = look.dataset.keywords || '';
    dialogDescription.textContent = look.dataset.description || '';
    dialogFaces?.replaceChildren();
    if (dialogFaces) dialogFaces.hidden = true;

    const frame = dialogImage.closest('.fashion-dialog__visual');
    frame?.classList.add('is-switching');

    const [fullSrc, faces] = await Promise.all([
      preloadImage(look.dataset.full),
      discoverFaces(look)
    ]);

    if (openToken !== dialogOpenToken || activeLook !== look || !fullSrc) return;

    // discoverFaces で存在確認済みだが、描画時のズレを防ぐためデコードも待つ。
    await Promise.all(faces.map(preloadImage));
    if (openToken !== dialogOpenToken || activeLook !== look) return;

    dialog.dataset.view = 'full';
    activeDialogFace = -1;
    dialogImage.src = fullSrc;
    dialogImage.alt = `${look.dataset.title || ''} 全身ビジュアル`;
    await renderDialogFaces(faces);

    frame?.classList.remove('is-switching');
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
    closeButton?.focus();
  };

  const closeDialog = () => {
    ++dialogOpenToken;
    if (!dialog?.open || dialog.classList.contains('is-closing')) return;

    const finish = () => {
      const focusTarget = previousFocus;
      const shouldRestore = restoreFocusOnClose;
      if (dialog.open) dialog.close();
      dialog.classList.remove('is-closing');
      document.documentElement.style.overflow = '';
      activeLook = null;
      activeDialogFace = -1;
      previousFocus = null;
      restoreFocusOnClose = false;
      requestAnimationFrame(() => {
        if (shouldRestore) focusTarget?.focus?.();
        else focusTarget?.blur?.();
      });
    };

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }

    dialog.classList.add('is-closing');
    window.setTimeout(finish, 320);
  };

  root.querySelectorAll('.fashion-look').forEach(look => {
    const opener = look.querySelector('.fashion-look__button');
    const img = opener?.querySelector('img');
    if (img && look.dataset.full) swapImage(img, look.dataset.full, `${look.dataset.title || ''} 全身ビジュアル`, true);
    opener?.addEventListener('click', () => openDialog(look));
  });

  closeButton?.addEventListener('click', closeDialog);
  dialog?.addEventListener('click', event => {
    if (event.target === dialog) closeDialog();
  });
  dialog?.addEventListener('cancel', event => {
    event.preventDefault();
    closeDialog();
  });
  dialog?.addEventListener('close', () => {
    dialog.classList.remove('is-closing');
    document.documentElement.style.overflow = '';
    ++imageSwapToken;
    dialogImage?.removeAttribute('src');
    if (dialogImage) dialogImage.alt = '';
    dialog.querySelector('.fashion-dialog__visual')?.classList.remove('is-switching');
  });

  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          reveal.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    root.querySelectorAll('[data-fashion-reveal]').forEach(node => reveal.observe(node));
  } else {
    root.querySelectorAll('[data-fashion-reveal]').forEach(node => node.classList.add('is-visible'));
  }
})();
