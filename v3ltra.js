(function () {
  "use strict";

  const pages = [
    { url: "index.html", title: "Home", group: "Core", detail: "V3LTRA archive front door." },
    { url: "plugins.html", title: "Windows Plugins & Presets", group: "Windows", detail: "After Effects plugins and preset packs for Windows." },
    { url: "software.html", title: "Windows Software & Configs", group: "Windows", detail: "Creative apps, builds, configs, and setup notes for Windows." },
    { url: "plugins-mac.html", title: "Mac Plugins & Presets", group: "Mac", detail: "After Effects plugins and preset packs for macOS." },
    { url: "software-mac.html", title: "Mac Software", group: "Mac", detail: "Creative apps and setup notes for macOS." },
    { url: "beginners-guide.html", title: "Beginner's Guide", group: "Guides", detail: "Start here for folders, install habits, platform choices, and AE basics." },
    { url: "extensions.html", title: "Extensions & Scripts", group: "Shared Tools", detail: "Panels, scripts, and helper tools with tutorial search." },
    { url: "guides.html", title: "Guides", group: "Guides", detail: "Windows and macOS setup folders and fix videos." },
    { url: "free-assets.html", title: "Free Assets", group: "Building", detail: "Fonts, SFX, LUTs, footage, icons, 3D, and converters." },
    { url: "new-drops.html", title: "Recently Added", group: "Building", detail: "Latest additions feed." },
    { url: "status.html", title: "Status & Changelog", group: "Building", detail: "Update notes and link-check status." },
    { url: "faq.html", title: "FAQ", group: "Building", detail: "Passwords, platform notes, requests, and broken links." }
  ];

  const nav = [
    ["index.html", "HOME"],
    ["plugins.html", "WIN PLUGINS"],
    ["software.html", "WIN SOFTWARE"],
    ["plugins-mac.html", "MAC PLUGINS"],
    ["software-mac.html", "MAC SOFTWARE"],
    ["beginners-guide.html", "BEGINNER'S GUIDE"],
    ["extensions.html", "EXTENSIONS"],
    ["guides.html", "GUIDES"],
    ["free-assets.html", "FREE ASSETS"],
    ["new-drops.html", "RECENTLY ADDED"],
    ["status.html", "STATUS"],
    ["faq.html", "FAQ"]
  ];

  const state = { results: [], selected: 0, open: false };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function fileName() {
    return (location.pathname.split("/").pop() || "index.html").toLowerCase();
  }

  function text(el, selector) {
    return el.querySelector(selector)?.textContent.trim() || "";
  }

  function slug(value) {
    return (value || "item").toLowerCase().replace(/&amp;/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72) || "item";
  }

  function pageGroup(url) {
    return pages.find((page) => page.url === url)?.group || "Archive";
  }

  function buildIndex() {
    const items = [...pages];
    const current = fileName();
    document.querySelectorAll(".browse-tile, .popular-row, .link-card, .vendor, .tool-card, .guide-link, .jump-card, .building-card, .faq-card").forEach((card) => {
      if (card.closest(".legacy-home-links, .home-groups")) return;
      const title = text(card, ".card-title, .vendor-name, strong, h2, h3") || card.getAttribute("data-name");
      if (!title) return;
      const href = card.getAttribute("href") || card.querySelector("a[href]")?.getAttribute("href") || `${current}#${card.id || slug(title)}`;
      if (!card.id && !href.startsWith("http")) card.id = slug(title);
      items.push({
        url: href,
        title,
        group: href.includes(".html") ? pageGroup(href.split("#")[0]) : pageGroup(current),
        detail: text(card, ".tile-copy, .card-sub, .vendor-desc, span, p, .vendor-count")
      });
    });
    return items;
  }

  let index = [];

  function score(query, item) {
    if (!query) return 1;
    const hay = `${item.title} ${item.group} ${item.detail}`.toLowerCase();
    const q = query.toLowerCase().trim();
    if (hay.includes(q)) return 100 + Math.max(0, 30 - hay.indexOf(q));
    let last = -1;
    let value = 0;
    for (const ch of q) {
      if (ch === " ") continue;
      const next = hay.indexOf(ch, last + 1);
      if (next < 0) return 0;
      value += next === last + 1 ? 8 : 3;
      last = next;
    }
    return value;
  }

  function ensureNav() {
    document.querySelectorAll(".nav").forEach((bar) => {
      if (!bar.getAttribute("aria-label")) bar.setAttribute("aria-label", "Main navigation");
      nav.forEach(([url, label]) => {
        const existing = bar.querySelector(`a[href="${url}"]`);
        if (existing) {
          if (url === "beginners-guide.html" || url === "new-drops.html") existing.textContent = label;
          return;
        }
        const link = document.createElement("a");
        link.href = url;
        link.textContent = label;
        bar.append(link);
      });
      bar.querySelectorAll("a").forEach((link) => {
        const url = (link.getAttribute("href") || "").split("#")[0].toLowerCase();
        link.classList.toggle("active", url === fileName());
      });
    });
  }

  function initGlobalNavPolish() {
    document.documentElement.classList.add("v3-nav-polish");
    if (document.getElementById("v3-nav-polish-style")) return;
    const style = document.createElement("style");
    style.id = "v3-nav-polish-style";
    style.textContent = `
      .v3-nav-polish .nav {
        box-sizing: border-box;
        width: 100%;
        max-width: 100%;
        min-height: 54px;
        display: flex !important;
        flex-wrap: nowrap !important;
        align-items: center;
        justify-content: flex-start !important;
        gap: 10px !important;
        padding: 8px 34px 11px 10px !important;
        margin: 0 0 30px !important;
        border: 1px solid rgba(252, 238, 9, 0.28);
        border-radius: 8px;
        background:
          linear-gradient(90deg, rgba(252, 238, 9, 0.1), rgba(140, 236, 255, 0.08)),
          rgba(4, 8, 8, 0.84);
        box-shadow: inset 0 -1px 0 rgba(140, 236, 255, 0.16), 0 0 20px rgba(252, 238, 9, 0.08);
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-color: rgba(252, 238, 9, 0.62) rgba(4, 8, 8, 0.62);
        scrollbar-width: thin;
        scroll-padding-inline: 10px;
        scroll-snap-type: x proximity;
        white-space: nowrap;
        mask-image: linear-gradient(90deg, transparent 0, #000 14px, #000 calc(100% - 18px), transparent 100%);
        -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 14px, #000 calc(100% - 18px), transparent 100%);
      }

      .v3-discord-ready.v3-nav-polish .nav {
        padding-right: 360px !important;
      }

      .v3-nav-polish .nav::-webkit-scrollbar {
        height: 8px;
      }

      .v3-nav-polish .nav::-webkit-scrollbar-track {
        background: rgba(4, 8, 8, 0.62);
      }

      .v3-nav-polish .nav::-webkit-scrollbar-thumb {
        background: linear-gradient(90deg, rgba(252, 238, 9, 0.7), rgba(140, 236, 255, 0.62));
        border-radius: 999px;
      }

      .v3-nav-polish .nav a {
        flex: 0 0 auto;
        min-height: 38px;
        padding: 10px 14px !important;
        border-color: rgba(252, 238, 9, 0.3) !important;
        border-radius: 5px;
        background: rgba(7, 17, 17, 0.82) !important;
        color: #f3f8ef !important;
        font-size: 11px !important;
        font-weight: 700;
        letter-spacing: 0.08em !important;
        line-height: 1;
        scroll-snap-align: start;
        white-space: nowrap;
      }

      .v3-nav-polish .nav a:hover,
      .v3-nav-polish .nav a:focus-visible,
      .v3-nav-polish .nav a.active {
        border-color: rgba(140, 236, 255, 0.68) !important;
        background: rgba(140, 236, 255, 0.1) !important;
        color: #fcee09 !important;
        box-shadow: inset 0 -2px 0 rgba(252, 238, 9, 0.82) !important;
      }

      @media (max-width: 760px) {
        .v3-nav-polish .nav {
          min-height: 50px;
          padding: 8px 24px 10px 8px !important;
          margin-bottom: 24px !important;
          mask-image: linear-gradient(90deg, transparent 0, #000 10px, #000 calc(100% - 12px), transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 10px, #000 calc(100% - 12px), transparent 100%);
        }

        .v3-discord-ready.v3-nav-polish .nav,
        .v3-discord-ready.v3-nav-polish .beginner-guide-page > .nav {
          padding-right: 126px !important;
        }

        .v3-nav-polish .nav a {
          min-height: 36px;
          padding: 9px 11px !important;
          font-size: 10px !important;
        }
      }
    `;
    document.head.append(style);
  }

  function initSmoothMode() {
    document.documentElement.classList.add("v3-smooth-mode");
    if (document.getElementById("v3-smooth-mode-style")) return;
    const style = document.createElement("style");
    style.id = "v3-smooth-mode-style";
    style.textContent = `
      .v3-smooth-mode,
      .v3-smooth-mode body {
        scroll-behavior: auto !important;
      }

      .v3-smooth-mode body::before,
      .v3-smooth-mode #glow-canvas,
      .v3-smooth-mode #particle-canvas,
      .v3-smooth-mode #markers-canvas,
      .v3-smooth-mode .scanlines,
      .v3-smooth-mode .glitch-strip {
        display: none !important;
        animation: none !important;
      }

      .v3-smooth-mode #bg-image {
        opacity: 0.9 !important;
        filter: brightness(0.88) saturate(1.05) contrast(1.04) !important;
        transform: none !important;
        will-change: auto !important;
      }

      .v3-smooth-mode .vignette {
        background:
          linear-gradient(180deg, rgba(5, 6, 4, 0.1), rgba(5, 6, 4, 0.22) 70%, rgba(5, 6, 4, 0.52)),
          radial-gradient(ellipse at center, transparent 48%, rgba(5, 6, 4, 0.46) 100%) !important;
      }

      .v3-smooth-mode .nav,
      .v3-smooth-mode .discord-top-button,
      .v3-smooth-mode .cmd-backdrop,
      .v3-smooth-mode .link-card,
      .v3-smooth-mode .vendor,
      .v3-smooth-mode .tool-card,
      .v3-smooth-mode .stat,
      .v3-smooth-mode .notice,
      .v3-smooth-mode .master-folder,
      .v3-smooth-mode .locked-files-banner,
      .v3-smooth-mode .folder-cta,
      .v3-smooth-mode .guide-panel,
      .v3-smooth-mode .jump-card,
      .v3-smooth-mode .guide-link,
      .v3-smooth-mode .fix-panel,
      .v3-smooth-mode .building-panel,
      .v3-smooth-mode .building-card,
      .v3-smooth-mode .home-search,
      .v3-smooth-mode .browse-tile,
      .v3-smooth-mode .home-panel,
      .v3-smooth-mode .lounge-banner,
      .v3-smooth-mode .search-wrap input {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }

      .v3-smooth-mode .discord-top-button,
      .v3-smooth-mode .home-panel,
      .v3-smooth-mode .lounge-banner,
      .v3-smooth-mode .tool-mark,
      .v3-smooth-mode .os-detect-chip,
      .v3-smooth-mode .guide-empty-icon,
      .v3-smooth-mode .tile-live-dot {
        box-shadow: none !important;
      }

      .v3-smooth-mode .building-panel::after,
      .v3-smooth-mode .lounge-banner::before,
      .v3-smooth-mode .pulse-bar::after,
      .v3-smooth-mode .domain-status::before,
      .v3-smooth-mode .cursor,
      .v3-smooth-mode .avatar-ring svg,
      .v3-smooth-mode .name::before,
      .v3-smooth-mode .name::after {
        animation: none !important;
      }

      .v3-smooth-mode .building-panel::after,
      .v3-smooth-mode .lounge-banner::before,
      .v3-smooth-mode .name::before,
      .v3-smooth-mode .name::after {
        display: none !important;
      }

      .v3-smooth-mode .home-search,
      .v3-smooth-mode .browse-tile,
      .v3-smooth-mode .link-card,
      .v3-smooth-mode .vendor,
      .v3-smooth-mode .tool-card,
      .v3-smooth-mode .guide-link,
      .v3-smooth-mode .jump-card,
      .v3-smooth-mode .building-cta,
      .v3-smooth-mode .platform-tab,
      .v3-smooth-mode .type-tab,
      .v3-smooth-mode .dl-btn,
      .v3-smooth-mode .tool-link,
      .v3-smooth-mode .tutorial-link,
      .v3-smooth-mode .folder-cta,
      .v3-smooth-mode .locked-files-action,
      .v3-smooth-mode .cmd-result,
      .v3-smooth-mode .cmd-trigger {
        transition: color 130ms ease, border-color 130ms ease, background 130ms ease, opacity 130ms ease !important;
      }

      .v3-smooth-mode .home-search:hover,
      .v3-smooth-mode .home-search:focus-visible,
      .v3-smooth-mode .browse-tile:hover,
      .v3-smooth-mode .browse-tile:focus-visible,
      .v3-smooth-mode .link-card:hover,
      .v3-smooth-mode .vendor:hover,
      .v3-smooth-mode .tool-card:hover,
      .v3-smooth-mode .guide-link:hover,
      .v3-smooth-mode .jump-card:hover,
      .v3-smooth-mode .building-cta:hover,
      .v3-smooth-mode .tile-arrow,
      .v3-smooth-mode .card-arrow {
        transform: none !important;
      }

      .v3-smooth-mode .reveal,
      .v3-smooth-mode .reveal.visible {
        opacity: 1 !important;
        transform: none !important;
        transition: color 130ms ease, border-color 130ms ease, background 130ms ease !important;
      }

      .v3-smooth-mode .cmd-backdrop {
        background: rgba(1, 2, 6, 0.78) !important;
      }

      .v3-smooth-mode .cmd-box {
        box-shadow: none !important;
      }

      @media (max-width: 760px) {
        .v3-smooth-mode #bg-image {
          opacity: 0.82 !important;
          filter: brightness(0.82) saturate(1.02) contrast(1.02) !important;
        }
      }
    `;
    document.head.append(style);
  }

  function initDiscordButton() {
    document.documentElement.classList.add("v3-discord-ready");
    if (!document.getElementById("discord-top-button-style")) {
      const style = document.createElement("style");
      style.id = "discord-top-button-style";
      style.textContent = `
        .discord-top-button {
          position: fixed;
          top: 14px;
          right: 14px;
          z-index: 80;
          width: min(350px, calc(100vw - 28px));
          min-height: 58px;
          display: grid;
          grid-template-columns: 38px minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;
          padding: 8px 13px 8px 10px;
          border: 1px solid rgba(252, 238, 9, 0.5);
          border-radius: 7px;
          background:
            linear-gradient(105deg, rgba(88, 101, 242, 0.3), rgba(252, 238, 9, 0.16) 48%, rgba(140, 236, 255, 0.13)),
            rgba(4, 8, 8, 0.92);
          color: #f7fbef;
          text-decoration: none;
          box-shadow: 0 0 22px rgba(252, 238, 9, 0.16), inset 0 0 18px rgba(140, 236, 255, 0.07);
          backdrop-filter: blur(12px);
          transition: border-color 170ms ease, background 170ms ease, color 170ms ease, transform 170ms ease;
        }

        .discord-top-button:hover,
        .discord-top-button:focus-visible {
          border-color: rgba(140, 236, 255, 0.76);
          color: #fcee09;
          background:
            linear-gradient(105deg, rgba(88, 101, 242, 0.42), rgba(252, 238, 9, 0.24) 48%, rgba(140, 236, 255, 0.18)),
            rgba(6, 14, 15, 0.96);
          transform: translateY(-1px);
        }

        .discord-logo {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.24);
          border-radius: 9px;
          background: #5865f2;
          color: #fff;
          box-shadow: 0 0 16px rgba(88, 101, 242, 0.4), inset 0 0 14px rgba(255, 255, 255, 0.08);
        }

        .discord-logo svg {
          width: 24px;
          height: 24px;
          display: block;
        }

        .discord-copy {
          min-width: 0;
          display: grid;
          gap: 1px;
        }

        .discord-copy strong {
          overflow: hidden;
          color: #f7fbef;
          font: 700 11px "Share Tech Mono", monospace;
          letter-spacing: 0.08em;
          line-height: 1.2;
          text-overflow: ellipsis;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .discord-copy small {
          overflow: hidden;
          color: #c6e8e9;
          font: 600 13px "Rajdhani", sans-serif;
          letter-spacing: 0.02em;
          line-height: 1.25;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .discord-open {
          color: #8cecff;
          font: 700 17px "Share Tech Mono", monospace;
        }

        .v3-discord-ready .nav {
          padding-right: 360px;
        }

        @media (max-width: 760px) {
          .discord-top-button {
            width: auto;
            max-width: calc(100vw - 20px);
            min-height: 38px;
            top: 10px;
            right: 10px;
            grid-template-columns: 26px auto;
            gap: 7px;
            padding: 6px 10px 6px 7px;
            border-radius: 6px;
          }

          .discord-logo {
            width: 26px;
            height: 26px;
            border-radius: 6px;
          }

          .discord-logo svg {
            width: 17px;
            height: 17px;
          }

          .discord-copy strong {
            font-size: 9px;
          }

          .discord-copy small,
          .discord-open {
            display: none;
          }

          .v3-discord-ready .nav {
            padding-right: 118px;
          }
        }
      `;
      document.head.append(style);
    }
    if (document.querySelector(".discord-top-button")) return;
    const link = document.createElement("a");
    link.className = "discord-top-button";
    link.href = "https://discord.com/invite/v3ltra";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "Join the V3LTRA community on Discord for help, tutorials, audio packs, resources, requests, updates, and recently added resources.");
    link.innerHTML = '<span class="discord-logo" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.445.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.618-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.028C.533 9.046-.319 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.027c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.042-.106 13.107 13.107 0 0 1-1.872-.891.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.011c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.01c.12.099.246.198.373.292a.077.077 0 0 1-.007.128 12.299 12.299 0 0 1-1.873.89.077.077 0 0 0-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.029 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .031-.056c.5-5.177-.838-9.674-3.548-13.66a.061.061 0 0 0-.031-.029zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z"></path></svg></span><span class="discord-copy"><strong>Join our Discord</strong><small>Help, tutorials, audio packs, resources, requests &amp; updates.</small></span><span class="discord-open" aria-hidden="true">&#8599;</span>';
    document.body.append(link);
  }

  function toast(message) {
    let hub = document.querySelector(".toast-hub");
    if (!hub) {
      hub = document.createElement("div");
      hub.className = "toast-hub";
      hub.setAttribute("aria-live", "polite");
      document.body.append(hub);
    }
    const item = document.createElement("div");
    item.className = "toast";
    item.textContent = message;
    hub.append(item);
    requestAnimationFrame(() => item.classList.add("show"));
    window.setTimeout(() => {
      item.classList.remove("show");
      window.setTimeout(() => item.remove(), 200);
    }, 1500);
  }

  function initCopy() {
    document.querySelectorAll(".pw").forEach((el) => {
      if (el.dataset.copyReady) return;
      el.dataset.copyReady = "true";
      el.tabIndex = 0;
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", `Copy ${el.textContent.trim()}`);
      const copy = () => {
        navigator.clipboard?.writeText(el.textContent.trim()).then(() => toast("Password copied."), () => toast("Password: " + el.textContent.trim()));
      };
      el.addEventListener("click", copy);
      el.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          copy();
        }
      });
    });
  }

  function initEmptyStates() {
    document.querySelectorAll(".no-results").forEach((empty) => {
      empty.innerHTML = '<strong>// no signal found</strong><span>Try a shorter search or jump back to the archive.</span>';
    });
  }

  function initReveal() {
    const targets = document.querySelectorAll(".link-card, .vendor, .tool-card, .notice, .stat, .guide-panel, .guide-link, .building-panel, .building-card, .fix-panel");
    targets.forEach((target) => {
      target.classList.add("reveal");
      target.classList.add("visible");
    });
  }

  function buildPalette() {
    if (document.querySelector(".cmd-trigger")) return;
    const trigger = document.createElement("button");
    trigger.className = "cmd-trigger";
    trigger.type = "button";
    trigger.innerHTML = '<span>Search</span><span aria-hidden="true">⌕</span>';
    trigger.setAttribute("aria-label", "Open archive search");
    document.body.append(trigger);

    const shell = document.createElement("div");
    shell.className = "command-shell";
    shell.setAttribute("aria-hidden", "true");
    shell.innerHTML = `
      <div class="cmd-backdrop" data-close-command></div>
      <div class="cmd-box" role="dialog" aria-modal="true" aria-label="Search V3LTRA">
        <div class="cmd-line"><span>V3</span><input id="cmdInput" type="search" autocomplete="off" placeholder="Search plugins, software, scripts, guides..."><button type="button" data-close-command aria-label="Close">x</button></div>
        <div class="cmd-results" id="cmdResults" role="listbox"></div>
      </div>
    `;
    document.body.append(shell);
    trigger.addEventListener("click", openPalette);
    document.querySelectorAll("[data-command-open]").forEach((control) => {
      control.addEventListener("click", () => openPalette(control.getAttribute("data-command-query") || ""));
    });
    shell.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-command]")) closePalette();
      const row = event.target.closest("[data-result]");
      if (row) go(Number(row.dataset.result));
    });
    shell.querySelector("#cmdInput").addEventListener("input", () => {
      state.selected = 0;
      renderPalette();
    });
  }

  function openPalette(seed) {
    const query = typeof seed === "string" ? seed : "";
    index = buildIndex();
    state.open = true;
    state.selected = 0;
    document.querySelector(".command-shell")?.setAttribute("aria-hidden", "false");
    const input = document.querySelector("#cmdInput");
    if (input) input.value = query;
    renderPalette();
    window.setTimeout(() => document.querySelector("#cmdInput")?.focus(), 20);
  }

  function closePalette() {
    state.open = false;
    document.querySelector(".command-shell")?.setAttribute("aria-hidden", "true");
  }

  function renderPalette() {
    const input = document.querySelector("#cmdInput");
    const out = document.querySelector("#cmdResults");
    if (!input || !out) return;
    const query = input.value.trim();
    state.results = index.map((item) => ({ item, score: score(query, item) })).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score).slice(0, 16).map((entry) => entry.item);
    if (!state.results.length) {
      out.innerHTML = '<div class="cmd-empty">// nothing matched</div>';
      return;
    }
    let group = "";
    out.innerHTML = state.results.map((item, i) => {
      const head = item.group !== group ? `<div class="cmd-group">${item.group}</div>` : "";
      group = item.group;
      return `${head}<button type="button" class="cmd-result ${i === state.selected ? "active" : ""}" data-result="${i}" role="option" aria-selected="${i === state.selected}"><span><strong>${item.title}</strong><small>${item.detail || item.url}</small></span><em>${item.url.replace(".html", "")}</em></button>`;
    }).join("");
  }

  function go(i) {
    const item = state.results[i];
    if (!item) return;
    closePalette();
    location.href = item.url;
  }

  function initKeys() {
    document.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openPalette();
        return;
      }
      if (!state.open) return;
      if (event.key === "Escape") closePalette();
      if (event.key === "ArrowDown") {
        event.preventDefault();
        state.selected = Math.min(state.selected + 1, state.results.length - 1);
        renderPalette();
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        state.selected = Math.max(state.selected - 1, 0);
        renderPalette();
      }
      if (event.key === "Enter") {
        event.preventDefault();
        go(state.selected);
      }
    });
  }

  function getSavedPlatform() {
    try {
      const saved = window.localStorage?.getItem("v3-platform");
      if (saved === "windows" || saved === "mac") return saved;
    } catch (error) {
      // Local storage can be unavailable in privacy-heavy browser modes.
    }
    return "";
  }

  function detectPlatform() {
    const platform = (navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || "").toLowerCase();
    if (platform.includes("mac") || platform.includes("iphone") || platform.includes("ipad")) return "mac";
    return "windows";
  }

  function platformLabel(value) {
    return value === "mac" ? "MacOS" : "Windows";
  }

  function setPlatform(platform, persist, source) {
    const value = platform === "mac" ? "mac" : "windows";
    const mode = source || (persist ? "manual" : "detected");
    document.documentElement.dataset.currentPlatform = value;
    document.documentElement.dataset.platformSource = mode;
    document.querySelectorAll(".platform-tab[data-platform]").forEach((tab) => {
      const active = tab.getAttribute("data-platform") === value;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-pressed", String(active));
      const label = tab.querySelector("[data-detected-label]");
      if (label) label.textContent = active ? (mode === "detected" ? "Detected" : "Selected") : "";
    });
    document.querySelectorAll("[data-platform-card]").forEach((card) => {
      const active = card.getAttribute("data-platform-card") === value;
      card.classList.toggle("is-active-platform", active);
    });
    document.querySelectorAll("[data-platform-badge]").forEach((badge) => {
      const active = badge.getAttribute("data-platform-badge") === value;
      badge.textContent = active ? "Selected" : "Switch";
    });
    document.querySelectorAll("[data-os-detected]").forEach((chip) => {
      const prefix = mode === "detected" ? "Detected" : mode === "saved" ? "Saved" : "Selected";
      chip.textContent = `${prefix} ${platformLabel(value)}`;
      chip.setAttribute("aria-label", `${prefix} platform: ${platformLabel(value)}`);
    });
    if (!persist) return;
    try {
      window.localStorage?.setItem("v3-platform", value);
    } catch (error) {
      // Nothing to do if persistence is blocked.
    }
  }

  function initPlatformToggle() {
    if (!document.querySelector(".platform-tab[data-platform]")) return;
    const saved = getSavedPlatform();
    setPlatform(saved || detectPlatform(), false, saved ? "saved" : "detected");
    document.querySelectorAll(".platform-tab[data-platform]").forEach((tab) => {
      tab.addEventListener("click", () => setPlatform(tab.getAttribute("data-platform"), true, "manual"));
    });
  }

  const brandLogos = [
    { re: /after effects|adobe after effects|\bae\b/i, label: "Ae", name: "After Effects", srcs: ["https://cdn.simpleicons.org/adobeaftereffects/9999ff", "https://www.google.com/s2/favicons?domain=adobe.com&sz=64"] },
    { re: /media encoder/i, label: "Me", name: "Media Encoder", srcs: ["https://cdn.simpleicons.org/adobe/ff0000", "https://www.google.com/s2/favicons?domain=adobe.com&sz=64"] },
    { re: /premiere/i, label: "Pr", name: "Premiere Pro", srcs: ["https://cdn.simpleicons.org/adobepremierepro/9999ff", "https://www.google.com/s2/favicons?domain=adobe.com&sz=64"] },
    { re: /photoshop/i, label: "Ps", name: "Photoshop", srcs: ["https://cdn.simpleicons.org/adobephotoshop/31a8ff", "https://www.google.com/s2/favicons?domain=adobe.com&sz=64"] },
    { re: /illustrator/i, label: "Ai", name: "Illustrator", srcs: ["https://cdn.simpleicons.org/adobeillustrator/ff9a00", "https://www.google.com/s2/favicons?domain=adobe.com&sz=64"] },
    { re: /indesign/i, label: "Id", name: "InDesign", srcs: ["https://cdn.simpleicons.org/adobeindesign/ff3366", "https://www.google.com/s2/favicons?domain=adobe.com&sz=64"] },
    { re: /lightroom/i, label: "Lr", name: "Lightroom", srcs: ["https://cdn.simpleicons.org/adobelightroomclassic/31a8ff", "https://www.google.com/s2/favicons?domain=adobe.com&sz=64"] },
    { re: /davinci|resolve|blackmagic/i, label: "DR", name: "DaVinci Resolve", srcs: ["https://cdn.simpleicons.org/davinciresolve/ff6a3d", "https://www.google.com/s2/favicons?domain=blackmagicdesign.com&sz=64"] },
    { re: /topaz/i, label: "TZ", name: "Topaz Labs", srcs: ["https://cdn.simpleicons.org/topazlabs/3dfff0", "https://www.google.com/s2/favicons?domain=topazlabs.com&sz=64"] },
    { re: /touchdesigner|derivative/i, label: "TD", name: "TouchDesigner", srcs: ["https://cdn.simpleicons.org/touchdesigner/c0c0c0", "https://www.google.com/s2/favicons?domain=derivative.ca&sz=64"] },
    { re: /cinema 4d|c4d/i, label: "C4D", name: "Cinema 4D", srcs: ["https://cdn.simpleicons.org/maxon/5a9dff", "https://www.google.com/s2/favicons?domain=maxon.net&sz=64"] },
    { re: /fl studio|image-line/i, label: "FL", name: "FL Studio", srcs: ["https://cdn.simpleicons.org/flstudio/ff8c00", "https://www.google.com/s2/favicons?domain=image-line.com&sz=64"] },
    { re: /vegas|magix/i, label: "V", name: "VEGAS Pro", srcs: ["https://www.google.com/s2/favicons?domain=vegascreativesoftware.com&sz=64", "https://www.google.com/s2/favicons?domain=magix.com&sz=64"] },
    { re: /boris|sapphire|continuum|mocha/i, label: "BFX", name: "Boris FX", srcs: ["https://www.google.com/s2/favicons?domain=borisfx.com&sz=64"] },
    { re: /maxon|red giant|magic bullet|trapcode|universe/i, label: "Mx", name: "Maxon", srcs: ["https://cdn.simpleicons.org/maxon/ff3b3b", "https://www.google.com/s2/favicons?domain=maxon.net&sz=64"] },
    { re: /video copilot|saber|element 3d|optical flares|twitch/i, label: "VC", name: "Video Copilot", srcs: ["https://www.google.com/s2/favicons?domain=videocopilot.net&sz=64"] },
    { re: /re:?vision|revision|twixtor|rsmb/i, label: "RV", name: "RE:Vision FX", srcs: ["https://www.google.com/s2/favicons?domain=revisionfx.com&sz=64"] },
    { re: /motion bro/i, label: "MB", name: "Motion Bro", srcs: ["https://www.google.com/s2/favicons?domain=motionbro.com&sz=64"] },
    { re: /fx console/i, label: "FX", name: "FX Console", srcs: ["https://www.google.com/s2/favicons?domain=videocopilot.net&sz=64"] },
    { re: /aescripts/i, label: "Ae", name: "aescripts", srcs: ["https://www.google.com/s2/favicons?domain=aescripts.com&sz=64"] },
    { re: /autokroma|aftercodecs|influx/i, label: "AK", name: "Autokroma", srcs: ["https://www.google.com/s2/favicons?domain=autokroma.com&sz=64"] },
    { re: /filmconvert/i, label: "FC", name: "FilmConvert", srcs: ["https://www.google.com/s2/favicons?domain=filmconvert.com&sz=64"] },
    { re: /neat video/i, label: "NV", name: "Neat Video", srcs: ["https://www.google.com/s2/favicons?domain=neatvideo.com&sz=64"] },
    { re: /adobe|unsorted/i, label: "A", name: "Adobe", srcs: ["https://cdn.simpleicons.org/adobe/ff0000", "https://www.google.com/s2/favicons?domain=adobe.com&sz=64"] }
  ];

  function findBrandLogo(name) {
    return brandLogos.find((brand) => brand.re.test(name || ""));
  }

  function hydrateLogo(slot, brand) {
    if (!slot || !brand || slot.dataset.logoReady) return;
    slot.dataset.logoReady = "true";
    slot.classList.add("has-brand-logo");
    slot.setAttribute("aria-label", `${brand.name} logo`);
    slot.title = brand.name;
    slot.textContent = "";

    const fallback = document.createElement("span");
    fallback.className = "brand-logo-fallback";
    fallback.textContent = brand.label;
    fallback.hidden = true;

    const img = document.createElement("img");
    img.className = "brand-logo-img";
    img.alt = "";
    img.decoding = "async";
    img.loading = "lazy";
    let srcIndex = 0;
    img.onerror = () => {
      srcIndex += 1;
      if (srcIndex < brand.srcs.length) {
        img.src = brand.srcs[srcIndex];
        return;
      }
      img.remove();
      fallback.hidden = false;
    };
    img.src = brand.srcs[srcIndex];
    slot.append(img, fallback);
  }

  function initBrandLogos() {
    document.querySelectorAll(".sw-badge").forEach((badge) => {
      const row = badge.closest(".vendor-title-row");
      const card = badge.closest(".vendor");
      const name = row?.querySelector(".vendor-name")?.textContent || card?.dataset.name || badge.textContent;
      hydrateLogo(badge, findBrandLogo(name));
    });

    document.querySelectorAll(".tool-mark").forEach((mark) => {
      const row = mark.closest(".popular-row");
      const name = row?.querySelector("h3")?.textContent || mark.textContent;
      hydrateLogo(mark, findBrandLogo(name));
    });

    document.querySelectorAll(".vendor-title-row").forEach((row) => {
      if (row.querySelector(".sw-badge, .vendor-logo")) return;
      const card = row.closest(".vendor");
      const name = row.querySelector(".vendor-name")?.textContent || card?.dataset.name || "";
      const brand = findBrandLogo(name);
      if (!brand) return;
      const logo = document.createElement("span");
      logo.className = "vendor-logo";
      hydrateLogo(logo, brand);
      row.prepend(logo);
    });
  }

  function initCanvasLoopKillSwitch() {
    if (window.__v3CanvasLoopKillSwitch) return;
    const canvases = document.querySelectorAll("#glow-canvas, #particle-canvas, #markers-canvas");
    if (!canvases.length) return;
    window.__v3CanvasLoopKillSwitch = true;
    const nativeRAF = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback) => {
      const name = typeof callback === "function" ? callback.name : "";
      if (name === "loop" || name === "ml") {
        return nativeRAF(() => {});
      }
      return nativeRAF(callback);
    };
    canvases.forEach((canvas) => {
      canvas.width = 1;
      canvas.height = 1;
      canvas.setAttribute("aria-hidden", "true");
    });
  }

  function initArchivePolishPass() {
    document.documentElement.classList.add("v3-archive-polish-pass");
    document.querySelectorAll("img:not(#bg-image):not([loading])").forEach((img) => {
      img.loading = "lazy";
      img.decoding = "async";
    });
    if (document.getElementById("v3-archive-polish-pass-style")) return;
    const style = document.createElement("style");
    style.id = "v3-archive-polish-pass-style";
    style.textContent = `
      .v3-archive-polish-pass .vendor:not([open]):not(.open) {
        content-visibility: auto;
        contain-intrinsic-size: 88px;
      }

      .v3-archive-polish-pass .vendor[open],
      .v3-archive-polish-pass .vendor.open {
        content-visibility: visible;
      }

      .v3-archive-polish-pass .vendor-body,
      .v3-archive-polish-pass .tutorial-chooser,
      .v3-archive-polish-pass .tutorial-card,
      .v3-archive-polish-pass .satvrn,
      .v3-archive-polish-pass .locked-files-banner {
        transition: color 130ms ease, border-color 130ms ease, background 130ms ease, opacity 130ms ease !important;
      }

      .v3-archive-polish-pass .satvrn,
      .v3-archive-polish-pass .satvrn > summary::before,
      .v3-archive-polish-pass .locked-files-banner,
      .v3-archive-polish-pass .locked-files-banner::before,
      .v3-archive-polish-pass .dl-btn::before,
      .v3-archive-polish-pass .gofile-btn::before,
      .v3-archive-polish-pass .yt-btn::before,
      .v3-archive-polish-pass .tutorial-chooser > summary::before {
        animation: none !important;
      }

      .brand-logo-img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: contain;
        filter: drop-shadow(0 0 8px rgba(140, 236, 255, 0.24));
      }

      .brand-logo-fallback {
        color: #f7fbef;
        font: 700 11px "Share Tech Mono", monospace;
        letter-spacing: 0.02em;
      }

      .sw-badge.has-brand-logo,
      .tool-mark.has-brand-logo,
      .vendor-logo {
        display: grid !important;
        place-items: center;
        padding: 7px;
        border: 1px solid rgba(140, 236, 255, 0.34) !important;
        border-radius: 7px;
        background:
          radial-gradient(circle at 35% 20%, rgba(252, 238, 9, 0.16), transparent 55%),
          rgba(4, 8, 8, 0.88) !important;
        color: #f7fbef !important;
        box-shadow: inset 0 0 15px rgba(140, 236, 255, 0.08) !important;
        font-size: 0 !important;
        overflow: hidden;
      }

      .vendor-logo {
        flex: 0 0 38px;
        width: 38px;
        height: 38px;
      }

      .tool-mark.has-brand-logo {
        width: 46px;
        height: 46px;
      }

    `;
    document.head.append(style);
  }

  function initArchiveFooter() {
    const footerHTML = '<div>&copy; 2025 V3LTRA Archive. All rights reserved.</div><div>Built for editors, by editors. <a href="mailto:vltralegal@gmail.com">Inquiries</a></div>';
    document.querySelectorAll(".footer").forEach((footer) => {
      footer.innerHTML = footerHTML;
    });
  }

  function initVeltraArchiveLook() {
    document.documentElement.classList.add("v3-veltra-archive");
    if (document.getElementById("v3-veltra-archive-look")) return;
    const style = document.createElement("style");
    style.id = "v3-veltra-archive-look";
    style.textContent = `
      .v3-veltra-archive {
        --archive-bg: #050804;
        --archive-panel: rgba(7, 15, 13, 0.82);
        --archive-panel-strong: rgba(8, 18, 16, 0.94);
        --archive-line: rgba(247, 236, 20, 0.34);
        --archive-line-soft: rgba(247, 236, 20, 0.18);
        --archive-cyan: #8cecff;
        --archive-yellow: #f7ec14;
        --archive-green: #93f05d;
        --archive-text: #f8faed;
        --archive-muted: #c9d3ca;
        --archive-radius: 8px;
      }

      .v3-veltra-archive body {
        color: var(--archive-text) !important;
        background:
          radial-gradient(circle at 22% 2%, rgba(247, 236, 20, 0.24), transparent 28%),
          radial-gradient(circle at 72% 18%, rgba(140, 236, 255, 0.16), transparent 32%),
          linear-gradient(180deg, rgba(247, 236, 20, 0.09), rgba(5, 8, 4, 0.88) 64%),
          var(--archive-bg) !important;
      }

      .v3-veltra-archive body::before {
        content: "";
        position: fixed;
        inset: 0;
        z-index: 2;
        pointer-events: none;
        background:
          linear-gradient(180deg, rgba(5, 8, 4, 0.08), rgba(5, 8, 4, 0.48) 72%, rgba(5, 8, 4, 0.86)),
          radial-gradient(ellipse at 48% 20%, transparent 12%, rgba(5, 8, 4, 0.38) 74%);
        mix-blend-mode: multiply;
      }

      .v3-veltra-archive #bg-image {
        opacity: 0.88 !important;
        object-position: 68% top !important;
        filter: blur(1.5px) brightness(0.76) saturate(1.14) contrast(1.08) !important;
        transform: scale(1.018) !important;
      }

      .v3-veltra-archive .vignette {
        background:
          linear-gradient(180deg, rgba(2, 4, 3, 0.16), rgba(2, 4, 3, 0.34) 66%, rgba(2, 4, 3, 0.84)),
          linear-gradient(90deg, rgba(2, 4, 3, 0.4), transparent 48%, rgba(2, 4, 3, 0.54)),
          radial-gradient(ellipse at center, transparent 36%, rgba(2, 4, 3, 0.64) 100%) !important;
      }

      .v3-veltra-archive .page {
        width: min(100% - 28px, 920px);
        max-width: 920px !important;
        padding: 26px 0 64px !important;
      }

      .v3-veltra-archive .home-page {
        align-items: stretch;
      }

      .v3-veltra-archive .home-page .header {
        width: 100%;
        margin: 0 0 16px !important;
        text-align: left !important;
      }

      .v3-veltra-archive .avatar-ring {
        display: none !important;
      }

      .v3-veltra-archive .brand-line {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
      }

      .v3-veltra-archive .home-page .name {
        color: #fff !important;
        font-size: clamp(46px, 9vw, 72px) !important;
        font-style: italic;
        letter-spacing: 0 !important;
        line-height: 0.9;
        text-shadow: 0 0 24px rgba(255, 255, 255, 0.2), 0 0 34px rgba(247, 236, 20, 0.18) !important;
      }

      .v3-veltra-archive .home-page .name .core,
      .v3-veltra-archive .home-page .name .ext {
        color: #fff !important;
        background: none !important;
        -webkit-background-clip: initial !important;
        background-clip: initial !important;
        filter: none !important;
      }

      .v3-veltra-archive .home-page .name .ext {
        color: var(--archive-yellow) !important;
      }

      .v3-veltra-archive .brand-chip {
        min-height: 30px;
        display: inline-flex;
        align-items: center;
        padding: 0 13px;
        border: 1px solid rgba(247, 236, 20, 0.72);
        border-radius: 5px;
        background: rgba(247, 236, 20, 0.06);
        color: var(--archive-yellow);
        font: 700 11px "Share Tech Mono", monospace;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .v3-veltra-archive .home-page .tagline,
      .v3-veltra-archive .home-page .domain-status,
      .v3-veltra-archive .phead .sub {
        max-width: 620px;
        margin-top: 12px;
        padding: 0 !important;
        border: 0 !important;
        background: transparent !important;
        color: var(--archive-text) !important;
        font-size: 14px !important;
        letter-spacing: 0.01em !important;
        line-height: 1.45;
      }

      .v3-veltra-archive .home-page .domain-status {
        justify-content: flex-start;
        color: var(--archive-muted) !important;
        font-size: 12px !important;
      }

      .v3-veltra-archive .nav {
        width: 100%;
        min-height: 54px;
        display: flex !important;
        flex-wrap: nowrap !important;
        align-items: center;
        gap: 6px !important;
        margin: 0 0 22px !important;
        padding: 7px !important;
        border: 1px solid rgba(247, 236, 20, 0.32);
        border-radius: var(--archive-radius);
        background:
          linear-gradient(120deg, rgba(247, 236, 20, 0.08), rgba(140, 236, 255, 0.05)),
          rgba(5, 9, 8, 0.78) !important;
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.18), inset 0 0 0 1px rgba(255, 255, 255, 0.035) !important;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: thin;
        mask-image: none !important;
        -webkit-mask-image: none !important;
      }

      .v3-veltra-archive .nav a,
      .v3-veltra-archive .nav button {
        flex: 0 0 auto;
        min-height: 38px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 13px !important;
        border: 1px solid transparent !important;
        border-radius: 5px;
        background: transparent !important;
        color: var(--archive-text) !important;
        font: 700 11px "Rajdhani", sans-serif !important;
        letter-spacing: 0.02em !important;
        line-height: 1;
        text-decoration: none;
        text-transform: none !important;
        text-shadow: none !important;
        white-space: nowrap;
        cursor: pointer;
      }

      .v3-veltra-archive .nav a.active,
      .v3-veltra-archive .nav a:hover,
      .v3-veltra-archive .nav a:focus-visible,
      .v3-veltra-archive .nav button:hover,
      .v3-veltra-archive .nav button:focus-visible {
        border-color: rgba(247, 236, 20, 0.45) !important;
        background: rgba(247, 236, 20, 0.1) !important;
        color: var(--archive-yellow) !important;
        box-shadow: none !important;
      }

      .v3-veltra-archive .home-top-nav {
        margin-bottom: 26px !important;
      }

      .v3-veltra-archive .discord-top-button {
        top: 18px !important;
        right: 18px !important;
        width: 46px !important;
        min-height: 46px !important;
        grid-template-columns: 1fr !important;
        padding: 7px !important;
        border-color: rgba(247, 236, 20, 0.42) !important;
        border-radius: 8px !important;
        background: rgba(5, 9, 8, 0.86) !important;
        box-shadow: 0 14px 28px rgba(0, 0, 0, 0.24) !important;
      }

      .v3-veltra-archive .discord-copy,
      .v3-veltra-archive .discord-open {
        display: none !important;
      }

      .v3-veltra-archive .discord-logo {
        width: 30px !important;
        height: 30px !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      .v3-veltra-archive.v3-discord-ready .nav {
        padding-right: 60px !important;
      }

      .v3-veltra-archive .home-control-panel {
        margin-bottom: 24px;
      }

      .v3-veltra-archive .home-search,
      .v3-veltra-archive .search-wrap input {
        min-height: 58px;
        border: 1px solid rgba(247, 236, 20, 0.38) !important;
        border-radius: var(--archive-radius);
        background: rgba(8, 13, 11, 0.78) !important;
        color: var(--archive-text) !important;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03) !important;
      }

      .v3-veltra-archive .home-search-open {
        min-width: 46px;
        min-height: 38px;
        border-radius: 5px;
        border-color: rgba(247, 236, 20, 0.86) !important;
        background: var(--archive-yellow) !important;
        color: #090b04 !important;
        font-size: 0;
      }

      .v3-veltra-archive .home-search-open::after {
        content: "->";
        font: 700 15px "Share Tech Mono", monospace;
      }

      .v3-veltra-archive .home-search-copy strong {
        color: var(--archive-text) !important;
      }

      .v3-veltra-archive .home-search-copy small,
      .v3-veltra-archive .tile-copy,
      .v3-veltra-archive .card-sub,
      .v3-veltra-archive .vendor-desc,
      .v3-veltra-archive .popular-copy p,
      .v3-veltra-archive .guide-empty-state p,
      .v3-veltra-archive .building-card p {
        color: var(--archive-muted) !important;
      }

      .v3-veltra-archive .platform-control-row {
        gap: 10px;
      }

      .v3-veltra-archive .os-detect-chip {
        min-height: 34px;
        border-color: rgba(147, 240, 93, 0.34);
        border-radius: 999px;
        background: rgba(147, 240, 93, 0.14);
        color: #d9ffc4;
      }

      .v3-veltra-archive .platform-tabs {
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        gap: 8px;
      }

      .v3-veltra-archive .platform-tab {
        min-height: 34px;
        border: 1px solid rgba(247, 236, 20, 0.22) !important;
        border-radius: 5px;
        background: rgba(9, 15, 13, 0.72) !important;
        color: var(--archive-text) !important;
      }

      .v3-veltra-archive .platform-tab.active {
        border-color: var(--archive-yellow) !important;
        background: var(--archive-yellow) !important;
        color: #070804 !important;
      }

      .v3-veltra-archive .platform-tab:not(.active) em {
        display: none !important;
      }

      .v3-veltra-archive .home-browse,
      .v3-veltra-archive .home-intel-grid,
      .v3-veltra-archive .home-groups {
        width: 100%;
      }

      .v3-veltra-archive .home-section-label,
      .v3-veltra-archive .section-label,
      .v3-veltra-archive .home-panel-head span,
      .v3-veltra-archive .cmd-line span,
      .v3-veltra-archive .cmd-group {
        color: var(--archive-yellow) !important;
      }

      .v3-veltra-archive .home-browse-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        border: 0 !important;
        background: transparent !important;
      }

      .v3-veltra-archive .browse-tile,
      .v3-veltra-archive .home-panel,
      .v3-veltra-archive .link-card,
      .v3-veltra-archive .vendor,
      .v3-veltra-archive .tool-card,
      .v3-veltra-archive .stat,
      .v3-veltra-archive .notice,
      .v3-veltra-archive .master-folder,
      .v3-veltra-archive .locked-files-banner,
      .v3-veltra-archive .folder-cta,
      .v3-veltra-archive .guide-panel,
      .v3-veltra-archive .jump-card,
      .v3-veltra-archive .guide-link,
      .v3-veltra-archive .fix-panel,
      .v3-veltra-archive .building-panel,
      .v3-veltra-archive .building-card,
      .v3-veltra-archive .tutorial-chooser,
      .v3-veltra-archive .tutorial-card,
      .v3-veltra-archive .satvrn,
      .v3-veltra-archive .cmd-box,
      .v3-veltra-archive .cmd-trigger {
        border: 1px solid var(--archive-line-soft) !important;
        border-radius: var(--archive-radius) !important;
        background:
          linear-gradient(135deg, rgba(247, 236, 20, 0.05), rgba(140, 236, 255, 0.05)),
          var(--archive-panel) !important;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.028), 0 18px 40px rgba(0, 0, 0, 0.18) !important;
        backdrop-filter: blur(8px);
      }

      .v3-veltra-archive .browse-tile {
        min-height: 142px;
        padding: 22px;
        gap: 12px;
      }

      .v3-veltra-archive .browse-tile-live {
        grid-column: 1 / -1;
        min-height: 96px;
      }

      .v3-veltra-archive .browse-tile:hover,
      .v3-veltra-archive .browse-tile:focus-visible,
      .v3-veltra-archive .browse-tile.is-active-platform,
      .v3-veltra-archive .home-panel:hover,
      .v3-veltra-archive .link-card:hover,
      .v3-veltra-archive .vendor:hover,
      .v3-veltra-archive .tool-card:hover,
      .v3-veltra-archive .guide-link:hover,
      .v3-veltra-archive .jump-card:hover {
        border-color: rgba(247, 236, 20, 0.46) !important;
        background:
          linear-gradient(135deg, rgba(247, 236, 20, 0.085), rgba(140, 236, 255, 0.075)),
          var(--archive-panel-strong) !important;
        transform: none !important;
      }

      .v3-veltra-archive .browse-tile h2,
      .v3-veltra-archive .home-panel h2,
      .v3-veltra-archive .popular-copy h3,
      .v3-veltra-archive .guide-empty-state h3,
      .v3-veltra-archive .card-title,
      .v3-veltra-archive .vendor-name,
      .v3-veltra-archive .phead h1,
      .v3-veltra-archive .building-card h3 {
        color: var(--archive-text) !important;
        text-shadow: none !important;
      }

      .v3-veltra-archive .tile-arrow,
      .v3-veltra-archive .card-arrow,
      .v3-veltra-archive .home-search-icon,
      .v3-veltra-archive .vendor-chevron,
      .v3-veltra-archive .tutorial-chevron,
      .v3-veltra-archive .guide-empty-icon {
        color: var(--archive-yellow) !important;
        text-shadow: 0 0 14px rgba(247, 236, 20, 0.24) !important;
      }

      .v3-veltra-archive .tile-badge,
      .v3-veltra-archive .vendor-tag,
      .v3-veltra-archive .type-badge,
      .v3-veltra-archive .compat-badge {
        border-color: rgba(247, 236, 20, 0.34) !important;
        color: var(--archive-yellow) !important;
        background: rgba(247, 236, 20, 0.08) !important;
      }

      .v3-veltra-archive .tile-actions a,
      .v3-veltra-archive .platform-pills a,
      .v3-veltra-archive .dl-btn,
      .v3-veltra-archive .tool-link,
      .v3-veltra-archive .tutorial-link,
      .v3-veltra-archive .building-cta,
      .v3-veltra-archive .folder-cta,
      .v3-veltra-archive .locked-files-action {
        border-color: rgba(140, 236, 255, 0.34) !important;
        border-radius: 5px;
        background: rgba(140, 236, 255, 0.06) !important;
        color: #d6fbff !important;
        box-shadow: none !important;
        text-shadow: none !important;
      }

      .v3-veltra-archive .tile-actions a:hover,
      .v3-veltra-archive .platform-pills a:hover,
      .v3-veltra-archive .dl-btn:hover,
      .v3-veltra-archive .tool-link:hover,
      .v3-veltra-archive .tutorial-link:hover,
      .v3-veltra-archive .building-cta:hover,
      .v3-veltra-archive .folder-cta:hover,
      .v3-veltra-archive .locked-files-action:hover {
        border-color: rgba(247, 236, 20, 0.7) !important;
        color: var(--archive-yellow) !important;
      }

      .v3-veltra-archive .home-intel-grid {
        grid-template-columns: minmax(0, 1.04fr) minmax(300px, 0.96fr);
        gap: 14px;
      }

      .v3-veltra-archive .home-panel {
        padding: 18px;
      }

      .v3-veltra-archive .popular-row {
        grid-template-columns: 48px minmax(0, 1fr) auto;
        gap: 12px;
        padding: 12px 0;
        border-top-color: rgba(247, 236, 20, 0.12);
      }

      .v3-veltra-archive .tool-mark,
      .v3-veltra-archive .tool-mark.has-brand-logo,
      .v3-veltra-archive .sw-badge.has-brand-logo,
      .v3-veltra-archive .vendor-logo {
        border-color: rgba(247, 236, 20, 0.26) !important;
        border-radius: 7px;
        background:
          radial-gradient(circle at 30% 16%, rgba(247, 236, 20, 0.18), transparent 54%),
          rgba(7, 15, 13, 0.9) !important;
        box-shadow: none !important;
      }

      .v3-veltra-archive .brand-logo-img {
        filter: drop-shadow(0 0 8px rgba(247, 236, 20, 0.2));
      }

      .v3-veltra-archive .phead {
        margin-bottom: 24px !important;
      }

      .v3-veltra-archive .phead h1 {
        font-size: clamp(34px, 7vw, 54px) !important;
        letter-spacing: 0.01em !important;
        text-transform: none !important;
      }

      .v3-veltra-archive .stats {
        gap: 10px !important;
      }

      .v3-veltra-archive .item-list {
        color: var(--archive-muted) !important;
      }

      .v3-veltra-archive .footer {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px 18px;
        margin-top: 28px !important;
        padding-top: 18px;
        border-top: 1px solid rgba(247, 236, 20, 0.18);
        color: rgba(248, 250, 237, 0.72) !important;
        font: 11px "Rajdhani", sans-serif !important;
        letter-spacing: 0.01em !important;
        line-height: 1.4 !important;
        text-align: left !important;
      }

      .v3-veltra-archive .footer a {
        color: var(--archive-yellow) !important;
        text-decoration-color: rgba(247, 236, 20, 0.48) !important;
        text-underline-offset: 3px;
      }

      .v3-veltra-archive .cmd-trigger {
        width: 42px;
        min-height: 42px;
        right: 18px;
        bottom: 18px;
        justify-content: center;
        padding: 0 !important;
        font-size: 0 !important;
      }

      .v3-veltra-archive .cmd-trigger span {
        display: none;
      }

      .v3-veltra-archive .cmd-trigger::before {
        content: "\\2315";
        color: var(--archive-yellow) !important;
        font: 700 18px "Share Tech Mono", monospace;
      }

      @media (min-width: 980px) {
        .v3-veltra-archive .home-page {
          padding-top: 24px !important;
        }

        .v3-veltra-archive .home-page .header {
          padding-right: 80px;
        }
      }

      @media (max-width: 860px) {
        .v3-veltra-archive .home-browse-grid,
        .v3-veltra-archive .home-intel-grid {
          grid-template-columns: 1fr;
        }

        .v3-veltra-archive .browse-tile,
        .v3-veltra-archive .browse-tile-live {
          min-height: 132px;
        }
      }

      @media (max-width: 600px) {
        .v3-veltra-archive .page {
          width: min(100% - 22px, 920px);
          padding-bottom: 70px !important;
        }

        .v3-veltra-archive .home-page .name {
          font-size: clamp(44px, 15vw, 62px) !important;
        }

        .v3-veltra-archive .nav {
          min-height: 48px;
          padding: 6px !important;
        }

        .v3-veltra-archive .nav a,
        .v3-veltra-archive .nav button {
          min-height: 34px;
          padding: 0 10px !important;
          font-size: 10px !important;
        }

        .v3-veltra-archive .discord-top-button {
          top: 10px !important;
          right: 10px !important;
          width: 40px !important;
          min-height: 40px !important;
        }

        .v3-veltra-archive.v3-discord-ready .nav {
          padding-right: 52px !important;
        }

        .v3-veltra-archive .home-search {
          grid-template-columns: auto minmax(0, 1fr) auto;
          padding: 10px !important;
        }

        .v3-veltra-archive .home-search-open {
          display: inline-flex;
          min-width: 40px;
        }

        .v3-veltra-archive .popular-row {
          grid-template-columns: 44px minmax(0, 1fr);
        }

        .v3-veltra-archive .platform-pills {
          grid-column: 2;
          justify-content: flex-start;
        }

        .v3-veltra-archive .footer {
          display: grid;
        }
      }
    `;
    document.head.append(style);
  }

  function boot() {
    document.documentElement.classList.add("v3-js");
    initCanvasLoopKillSwitch();
    initDiscordButton();
    initGlobalNavPolish();
    initSmoothMode();
    ensureNav();
    initArchivePolishPass();
    initBrandLogos();
    initCopy();
    initEmptyStates();
    initReveal();
    buildPalette();
    initPlatformToggle();
    initKeys();
    initArchiveFooter();
    initVeltraArchiveLook();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
