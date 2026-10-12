// Shared progressive enhancement. Content is visible before any animation runs.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const root = document.documentElement;
const en = root.lang === 'en';
const t = (zh, english) => en ? english : zh;
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* Private previews still work. */ } },
};
const symbol = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

export function initExperience() {
  const header = document.querySelector('.site-header, .m-header');
  if (!header || document.querySelector('.experience-tools')) return;
  const progress = document.createElement('div');
  progress.className = 'page-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span></span>';
  header.append(progress);

  const tools = document.createElement('div');
  tools.className = 'experience-tools';
  tools.setAttribute('role', 'group');
  tools.setAttribute('aria-label', t('页面工具', 'Page tools'));
  tools.innerHTML = `<button class="experience-top" type="button" aria-label="${t('返回顶部', 'Back to top')}" title="${t('返回顶部', 'Back to top')}" hidden>${symbol('<path d="m6 12 6-6 6 6M12 6v13"/>')}</button><button class="experience-motion" type="button"><span class="motion-icon">${symbol('<path d="M8 5v14M16 5v14"/>')}</span><span class="motion-label"></span></button>`;
  document.body.append(tools);
  const motion = tools.querySelector('.experience-motion');
  const top = tools.querySelector('.experience-top');
  let preference = storage.get('wd-motion');
  const applyMotion = () => {
    const enabled = !reducedMotion.matches && preference !== 'off';
    root.dataset.motion = enabled ? 'on' : 'off';
    motion.setAttribute('aria-pressed', String(!enabled));
    motion.disabled = reducedMotion.matches;
    motion.title = reducedMotion.matches ? t('已遵循系统的减少动态效果设置', 'Following your system’s reduced motion setting') : enabled ? t('暂停动态效果', 'Pause motion') : t('启用动态效果', 'Enable motion');
    motion.setAttribute('aria-label', motion.title);
    motion.querySelector('.motion-label').textContent = enabled ? t('动效', 'Motion') : t('静态', 'Still');
    motion.querySelector('.motion-icon').innerHTML = enabled ? symbol('<path d="M8 5v14M16 5v14"/>') : symbol('<path d="m9 5 10 7-10 7z"/>');
    if (!enabled) {
      document.getAnimations().forEach(animation => animation.cancel());
      document.querySelectorAll('[data-depth]').forEach(element => {
        element.style.removeProperty('--depth-x');
        element.style.removeProperty('--depth-y');
      });
    }
  };
  motion.addEventListener('click', () => {
    preference = root.dataset.motion === 'on' ? 'off' : 'on';
    storage.set('wd-motion', preference);
    applyMotion();
  });
  reducedMotion.addEventListener('change', applyMotion);
  window.addEventListener('storage', event => {
    if (event.key === 'wd-motion') { preference = event.newValue; applyMotion(); }
  });
  applyMotion();

  top.addEventListener('click', () => {
    const main = document.querySelector('main');
    window.scrollTo({ top: 0, behavior: root.dataset.motion === 'on' ? 'smooth' : 'instant' });
    // Keep keyboard focus on a visible, stable destination after the button hides.
    main?.focus({ preventScroll: true });
  });
  let frame = 0;
  const update = () => {
    frame = 0;
    header.toggleAttribute('data-scrolled', scrollY > 16);
    top.hidden = scrollY < 500;
    if (!document.querySelector('.h-article')) {
      const distance = document.documentElement.scrollHeight - innerHeight;
      root.style.setProperty('--page-progress', distance > 0 ? Math.min(1, scrollY / distance) : 0);
    }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  update();

  const artwork = document.querySelectorAll('.hero-art, .h-book-cover');
  const pauseAmbient = () => root.toggleAttribute('data-ambient-paused', document.hidden);
  document.addEventListener('visibilitychange', pauseAmbient);
  pauseAmbient();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => target.toggleAttribute('data-art-visible', isIntersecting));
    });
    artwork.forEach(element => observer.observe(element));

    const reveal = new IntersectionObserver(entries => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;
        reveal.unobserve(target);
        if (root.dataset.motion !== 'on' || location.hash || !target.animate) continue;
        target.animate([
          { opacity: .45, transform: 'translateY(18px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 650, delay: Number(target.dataset.enterDelay || 0), easing: 'cubic-bezier(.2,.65,.2,1)' });
      }
    }, { threshold: .08 });
    document.querySelectorAll('.hero-copy, .m-page-heading, .h-full-hero > div:first-child, .section-heading, .h-index-section > header, .research-card, .m-hub-card, .h-essay-card, .h-person-card, .h-stats > div').forEach((element, index) => {
      element.dataset.enterDelay = String((index % 3) * 55);
      reveal.observe(element);
    });
  }

  // One pointer handler, one frame per update, and no idle animation loop.
  const surfaces = '.research-card, .m-hub-card, .h-essay-card';
  document.querySelectorAll(surfaces).forEach(element => element.classList.add('v-surface'));
  artwork.forEach(element => element.setAttribute('data-depth', ''));
  let target = null, bounds = null, pointerFrame = 0, point = null;
  document.addEventListener('pointermove', event => {
    if (!finePointer.matches || root.dataset.motion !== 'on' || event.pointerType === 'touch') return;
    const next = event.target.closest?.(`[data-depth], ${surfaces}`);
    if (next !== target) {
      if (target?.hasAttribute('data-depth')) { target.style.setProperty('--depth-x', '0deg'); target.style.setProperty('--depth-y', '0deg'); }
      target = next;
      bounds = next?.getBoundingClientRect();
    }
    if (!target || !bounds) return;
    point = { x: event.clientX, y: event.clientY };
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      if (!target || root.dataset.motion !== 'on') return;
      const x = Math.max(0, Math.min(1, (point.x - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (point.y - bounds.top) / bounds.height));
      target.style.setProperty('--light-x', `${x * 100}%`);
      target.style.setProperty('--light-y', `${y * 100}%`);
      if (target.hasAttribute('data-depth')) {
        target.style.setProperty('--depth-x', `${(0.5 - y) * 5}deg`);
        target.style.setProperty('--depth-y', `${(x - 0.5) * 5}deg`);
      }
    });
  }, { passive: true });
  const resetDepth = () => {
    if (target?.hasAttribute('data-depth')) { target.style.setProperty('--depth-x', '0deg'); target.style.setProperty('--depth-y', '0deg'); }
    target = bounds = null;
  };
  document.addEventListener('pointerleave', resetDepth);
  addEventListener('scroll', resetDepth, { passive: true });
}
