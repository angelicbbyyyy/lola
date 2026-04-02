const ASSET_BASE = "./assets";

const homeConfig = {
  status: {
    signalImage: "Mobile Signal-2.png",
    wifiImage: "Wifi.png",
    batteryImage: "Battery.png",
  },
  banners: ["topwidget1.png", "topwidget2.png", "topwidget3.png"],
  apps: [
    { id: "messages", label: "Messages", icon: "messages.JPG" },
    { id: "settings", label: "Settings", icon: "settings.JPG" },
    { id: "music", label: "Music", icon: "music.JPG" },
    { id: "contacts", label: "Contacts", icon: "contacts.JPG" },
    { id: "twitter", label: "Twitter", icon: "twitter.JPG" },
    { id: "wallet", label: "Wallet", icon: "wallet.JPG" },
  ],
  search: {
    text: "Search",
  },
  dock: [
    { id: "messages", label: "Messages", icon: "messages.JPG" },
    { id: "settings", label: "Settings", icon: "settings.JPG" },
    { id: "contacts", label: "Contacts", icon: "contacts.JPG" },
  ],
};

function assetPath(fileName) {
  return `${ASSET_BASE}/${fileName}`;
}

function createFallback(label, className = "") {
  return `<div class="app-fallback ${className}">${label}</div>`;
}

function imageMarkup(fileName, alt, extraClass = "", fallbackLabel = "IMG") {
  if (!fileName) {
    return createFallback(fallbackLabel, extraClass);
  }

  return `
    <img
      src="${assetPath(fileName)}"
      alt="${alt}"
      class="${extraClass}"
      data-fallback-label="${fallbackLabel}"
      data-fallback-class="${extraClass}"
    />
  `;
}

function renderBanner(fileName, index) {
  return `
    <div class="glass-card overflow-hidden rounded-[30px]">
      ${imageMarkup(fileName, `Banner ${index + 1}`, "block h-auto w-full", "BNR")}
    </div>
  `;
}

function renderAppButton(app) {
  return `
    <button
      type="button"
      data-app="${app.id}"
      aria-label="${app.label}"
      class="app-button active:opacity-70 active:scale-95 transition-all duration-100 flex flex-col items-center"
    >
      <span class="soft-icon h-[62px] w-[62px] rounded-[20px] bg-white/55">
        ${imageMarkup(app.icon, `${app.label} icon`, "h-full w-full", app.label.slice(0, 2))}
      </span>
      <span class="icon-label">${app.label}</span>
    </button>
  `;
}

function renderAppGrid() {
  return `
    <section class="grid grid-cols-4 gap-x-4 gap-y-6 px-1">
      ${homeConfig.apps.map(renderAppButton).join("")}
    </section>
  `;
}

function renderSearch() {
  return `
    <div class="mx-auto flex w-[104px] items-center justify-center gap-1 rounded-full bg-[#d8d0ca]/90 px-3 py-1.5 text-[13px] font-semibold text-shell shadow-[0_4px_8px_rgba(0,0,0,0.08)]">
      <svg viewBox="0 0 20 20" class="h-3.5 w-3.5 opacity-60" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
        <circle cx="8.5" cy="8.5" r="4.5"></circle>
        <path d="M12 12l4 4"></path>
      </svg>
      <span>${homeConfig.search.text}</span>
    </div>
  `;
}

function renderDock() {
  return `
    <div class="glass-card-strong mt-4 rounded-[30px] p-3">
      <div class="flex items-center gap-3">
        ${homeConfig.dock
          .map(
            (app) => `
              <button
                type="button"
                data-app="${app.id}"
                aria-label="${app.label}"
                class="dock-button active:opacity-70 active:scale-95 transition-all duration-100"
              >
                <span class="icon-frame soft-icon rounded-[18px]">
                  ${imageMarkup(app.icon, `${app.label} dock icon`, "h-full w-full", app.label.slice(0, 2))}
                </span>
              </button>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderScreen() {
  return `
    <div class="phone-shell">
      <div class="shell-inner">
        <header class="mb-5 flex items-center justify-between px-[4px] pt-1">
          <div id="status-time" class="status-time reference-mode">--:--</div>
          <div class="flex h-5 items-center gap-1.5">
            <div class="h-[11px] w-[18px]">
              ${imageMarkup(homeConfig.status.signalImage, "Mobile signal", "h-full w-full object-contain", "SIG")}
            </div>
            <div class="h-[11px] w-[16px]">
              ${imageMarkup(homeConfig.status.wifiImage, "Wi-Fi", "h-full w-full object-contain", "WF")}
            </div>
            <div class="h-[14px] w-[24px]">
              ${imageMarkup(homeConfig.status.batteryImage, "Battery", "h-full w-full object-contain", "BAT")}
            </div>
          </div>
        </header>

        <section class="space-y-2.5">
          ${homeConfig.banners.map(renderBanner).join("")}
        </section>

        <section class="mt-8 flex-1">
          ${renderAppGrid()}
        </section>

        <section class="mt-4 pb-1">
          ${renderSearch()}
          ${renderDock()}
        </section>
      </div>
    </div>
  `;
}

function wireInteractions(root) {
  root.querySelectorAll("[data-app]").forEach((button) => {
    button.addEventListener("click", () => {
      const appId = button.getAttribute("data-app");
      root.dispatchEvent(
        new CustomEvent("phone-app-select", {
          detail: { appId },
        }),
      );
    });
  });

  root.addEventListener("phone-app-select", (event) => {
    const { appId } = event.detail;
    console.info(`Mini app placeholder tapped: ${appId}`);
  });
}

function mountImageFallbacks(root) {
  root.querySelectorAll("img[data-fallback-label]").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        const fallback = document.createElement("div");
        fallback.className = `app-fallback ${image.dataset.fallbackClass || ""}`.trim();
        fallback.textContent = image.dataset.fallbackLabel || "IMG";
        image.replaceWith(fallback);
      },
      { once: true },
    );
  });
}

function formatLocalTime() {
  return new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function mountStatusClock(root) {
  const timeNode = root.querySelector("#status-time");

  if (!timeNode) {
    return;
  }

  const renderTime = () => {
    timeNode.textContent = formatLocalTime();
  };

  renderTime();

  const now = new Date();
  const delayUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

  window.setTimeout(() => {
    renderTime();
    window.setInterval(renderTime, 60 * 1000);
  }, delayUntilNextMinute);
}

function init() {
  const root = document.getElementById("app");

  if (!root) {
    return;
  }

  root.innerHTML = renderScreen();
  mountImageFallbacks(root);
  wireInteractions(root);
  mountStatusClock(root);
}

init();
