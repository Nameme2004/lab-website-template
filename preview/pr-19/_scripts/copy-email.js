/* Local to member contact controls; other buttons keep their link behavior. */
(() => {
  const FEEDBACK_MS = 2500;
  const initialize = () => document.querySelectorAll("[data-member-email]").forEach((root) => {
    const button = root.querySelector("[data-copy-email]");
    const address = root.querySelector("[data-email-address]");
    const status = root.querySelector("[data-copy-status]");
    let state = "";
    let busy = false;
    let timer;
    const renderStatus = () => {
      const language = document.documentElement.lang.startsWith("zh") ? "Zh" : "En";
      status.textContent = state ? root.dataset[state + language] : "";
    };
    button.addEventListener("click", async () => {
      if (busy) return;
      busy = true;
      state = "";
      clearTimeout(timer);
      renderStatus();
      button.setAttribute("aria-busy", "true");
      try {
        if (!window.isSecureContext || !navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(address.textContent);
        state = "success";
        timer = setTimeout(() => { state = ""; renderStatus(); }, FEEDBACK_MS);
      } catch (_) {
        // Keep actionable failure instructions visible; never claim success.
        state = "failure";
      } finally {
        busy = false;
        button.removeAttribute("aria-busy");
        renderStatus();
      }
    });
    window.addEventListener("languagechange", renderStatus);
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
