/* One timeout per carousel. No animation or external dependencies. */
(() => {
  const AUTO_ADVANCE_MS = 6000;
  const initialize = () => document.querySelectorAll("[data-news-carousel]").forEach((root) => {
    const slides = [...root.querySelectorAll("[data-news-slide]")];
    root.querySelectorAll("[data-news-image]").forEach((image) => {
      const fallback = () => {
        image.closest(".news-carousel__media").hidden = true;
        image.closest(".news-carousel__card").classList.remove("news-carousel__card--image");
      };
      image.addEventListener("error", fallback, { once: true });
      if (image.complete && !image.naturalWidth) fallback();
    });
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let current = 0;
    let autoplay = !motion.matches;
    let hovering = root.matches(":hover");
    let focusWithin = root.contains(document.activeElement);
    let timer;
    const message = (name) => root.dataset[name + (document.documentElement.lang.startsWith("zh") ? "Zh" : "En")];
    root.setAttribute("aria-label", message("region"));
    if (slides.length < 2) {
      window.addEventListener("languagechange", () => root.setAttribute("aria-label", message("region")));
      return;
    }
    const previous = root.querySelector("[data-news-previous]");
    const next = root.querySelector("[data-news-next]");
    const playback = root.querySelector("[data-news-playback]");
    const dots = [...root.querySelectorAll("[data-news-dot]")];
    const counter = root.querySelector("[data-news-counter]");
    const announcement = root.querySelector("[data-news-announcement]");
    const slideLabel = (index) => message("slide").replace("{x}", index + 1).replace("{n}", slides.length);
    const schedule = () => {
      clearTimeout(timer);
      if (autoplay && !hovering && !focusWithin && !document.hidden) {
        timer = setTimeout(() => { show(current + 1, false); }, AUTO_ADVANCE_MS);
      }
    };
    const labels = () => {
      root.setAttribute("aria-label", message("region"));
      previous.setAttribute("aria-label", message("previous"));
      next.setAttribute("aria-label", message("next"));
      playback.textContent = message(autoplay ? "pause" : "play");
      playback.setAttribute("aria-pressed", String(autoplay));
      dots.forEach((dot, i) => dot.setAttribute("aria-label", slideLabel(i)));
      slides.forEach((slide, i) => slide.setAttribute("aria-label", slideLabel(i)));
      counter.textContent = slideLabel(current);
    };
    function show(index, manual = true) {
      const moveFocus = slides[current].contains(document.activeElement);
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => { slide.hidden = i !== current; });
      dots.forEach((dot, i) => dot.setAttribute("aria-current", String(i === current)));
      labels();
      if (manual) announcement.textContent = slideLabel(current);
      if (moveFocus) slides[current].querySelector("[data-news-link]").focus();
      schedule();
    }
    previous.addEventListener("click", () => show(current - 1));
    next.addEventListener("click", () => show(current + 1));
    dots.forEach((dot, i) => dot.addEventListener("click", () => show(i)));
    playback.addEventListener("click", () => { autoplay = !autoplay; labels(); schedule(); });
    root.addEventListener("mouseenter", () => { hovering = true; schedule(); });
    root.addEventListener("mouseleave", () => { hovering = false; schedule(); });
    root.addEventListener("focusin", () => { focusWithin = true; schedule(); });
    root.addEventListener("focusout", () => queueMicrotask(() => { focusWithin = root.contains(document.activeElement); schedule(); }));
    document.addEventListener("visibilitychange", schedule);
    motion.addEventListener("change", (event) => { if (event.matches) autoplay = false; labels(); schedule(); });
    window.addEventListener("languagechange", () => { labels(); announcement.textContent = ""; });
    root.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault(); show(current + (event.key === "ArrowLeft" ? -1 : 1));
      }
    });
    let touch;
    let ignoreClick = false;
    root.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch") touch = { x: event.clientX, y: event.clientY };
    });
    root.addEventListener("pointercancel", () => { touch = null; });
    root.addEventListener("pointerup", (event) => {
      if (!touch || event.pointerType !== "touch") return;
      const dx = event.clientX - touch.x;
      const dy = event.clientY - touch.y;
      touch = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        ignoreClick = true;
        show(current + (dx < 0 ? 1 : -1));
        setTimeout(() => { ignoreClick = false; }, 400);
      }
    });
    root.addEventListener("click", (event) => {
      if (ignoreClick) { event.preventDefault(); event.stopPropagation(); ignoreClick = false; }
    }, true);
    root.querySelector("[data-news-controls]").hidden = false;
    show(0, false);
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
