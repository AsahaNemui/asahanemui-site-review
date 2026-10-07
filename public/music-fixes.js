(() => {
  const init = () => {
    if (!document.body.classList.contains('music-page')) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('.music-showcase').forEach(section => {
      const track = section.querySelector('.song-track');
      const primarySet = section.querySelector('.song-set:not([aria-hidden])');
      if (!track || !primarySet) return;

      const count = primarySet.querySelectorAll('.song-frame').length;
      if (!count) return;

      // Keep perceived movement speed consistent: more songs = proportionally longer loop.
      const secondsPerCard = 3.2;
      const duration = Math.max(28, Math.round(count * secondsPerCard));
      section.style.setProperty('--gallery-duration', `${duration}s`);

      if (reduced) track.style.animation = 'none';
    });

    const params = new URLSearchParams(location.search);
    if (params.get('debug') === '1') {
      const dailyCopy = document.querySelector('#daily-pick .daily-copy');
      if (dailyCopy && !dailyCopy.querySelector('.music-debug-reset')) {
        const reset = document.createElement('button');
        reset.type = 'button';
        reset.className = 'music-debug-reset';
        reset.innerHTML = '<span>本日の一曲をリセット</span><small>CREATOR CHECK</small>';
        reset.addEventListener('click', () => {
          try { localStorage.removeItem('asaha-daily-song-v1'); } catch { /* Reload still restores the initial UI for this visit. */ }
          location.reload();
        });
        dailyCopy.append(reset);
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
