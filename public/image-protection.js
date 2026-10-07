// Shared guard for current and future images, including dynamically added galleries.
// This discourages native saving; publicly displayed assets remain retrievable.
(() => {
  const visualSelector = 'img, picture, svg, canvas, .logo-motion, [data-image-protected]';
  function visualTarget(target) {
    if (!(target instanceof Element)) return false;
    if (target.closest(visualSelector)) return true;
    const anchor = target.closest('a');
    if (anchor?.querySelector(visualSelector)) return true;
    // Include authored CSS background images without disabling text selection.
    return getComputedStyle(target).backgroundImage.includes('url(');
  }
  for (const type of ['contextmenu', 'dragstart']) {
    document.addEventListener(type, event => {
      if (visualTarget(event.target)) event.preventDefault();
    }, { capture: true });
  }
  function protect(root) {
    if (!(root instanceof Element) && root !== document) return;
    if (root instanceof Element && root.matches('img')) root.draggable = false;
    root.querySelectorAll('img').forEach(image => { image.draggable = false; });
  }
  protect(document);
  new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) protect(node);
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
