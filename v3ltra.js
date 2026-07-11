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
    { url: "new-drops.html", title: "New Drops", group: "Building", detail: "Latest additions feed." },
    { url: "status.html", title: "Status & Changelog", group: "Building", detail: "Update notes and link-check status." },
    { url: "faq.html", title: "FAQ", group: "Building", detail: "Passwords, platform notes, requests, and broken links." }
  ];

  const nav = [
    ["index.html", "HOME"],
    ["plugins.html", "WIN PLUGINS"],
    ["software.html", "WIN SOFTWARE"],
    ["plugins-mac.html", "MAC PLUGINS"],
    ["software-mac.html", "MAC SOFTWARE"],
    ["beginners-guide.html", "START HERE"],
    ["extensions.html", "EXTENSIONS"],
    ["guides.html", "GUIDES"],
    ["free-assets.html", "FREE ASSETS"],
    ["new-drops.html", "DROPS"],
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
        if (bar.querySelector(`a[href="${url}"]`)) return;
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
    targets.forEach((target) => target.classList.add("reveal"));
    if (reduce.matches || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    targets.forEach((target) => observer.observe(target));
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

  function boot() {
    document.documentElement.classList.add("v3-js");
    ensureNav();
    initCopy();
    initEmptyStates();
    initReveal();
    buildPalette();
    initPlatformToggle();
    initKeys();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
