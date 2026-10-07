document.querySelectorAll('.showcase-file--back').forEach(file => {
  file.addEventListener('click', () => {
    const open = file.getAttribute('aria-expanded') !== 'true';
    document.querySelectorAll('.showcase-file--back').forEach(other => {
      const selected = other === file && open;
      other.classList.toggle('is-open', selected);
      other.setAttribute('aria-expanded', String(selected));
      other.querySelector('strong').textContent = selected ? 'COMING SOON / 準備中' : 'COMING SOON';
    });
  });
});
