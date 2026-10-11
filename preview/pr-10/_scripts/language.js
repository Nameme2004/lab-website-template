/* Same-URL language preference; no navigation or content rewriting. */
(() => {
  const initialize = () => {
    const control = document.querySelector("[data-language-control]");
    if (!control) return;
    const buttons = [...control.querySelectorAll("[data-language-choice]")];
    const storageKey = control.dataset.languageStorageKey;

    const applyLanguage = (language) => {
      const selected = language === "zh" ? "zh" : "en";
      document.documentElement.lang = selected === "zh" ? "zh-CN" : "en";
      document.querySelectorAll("[data-i18n-lang]").forEach((element) => {
        element.hidden = element.dataset.i18nLang !== selected;
      });
      buttons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.languageChoice === selected));
      });
      control.setAttribute("aria-label", control.dataset[selected + "Label"]);
      document.querySelectorAll("[data-i18n-tooltip-en]").forEach((element) => {
        const tooltip = element.dataset[selected === "zh" ? "i18nTooltipZh" : "i18nTooltipEn"];
        element.setAttribute("data-tooltip", tooltip);
        // Existing tooltip instances may already have been initialized.
        if (element._tippy) element._tippy.setContent(tooltip);
      });
      window.dispatchEvent(new CustomEvent("languagechange", { detail: { language: selected } }));
    };

    let preferred = "en";
    try {
      if (window.localStorage.getItem(storageKey) === "zh") preferred = "zh";
    } catch (_) { /* Storage may be disabled; in-memory switching still works. */ }
    applyLanguage(preferred);
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const selected = button.dataset.languageChoice;
        applyLanguage(selected);
        try {
          window.localStorage.setItem(storageKey, selected);
        } catch (_) { /* Do not block the language switch. */ }
      });
    });
    control.hidden = false;
  };

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
