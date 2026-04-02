const ASSET_BASE = "./assets";

const homeConfig = {
  status: {
    signalImage: "Mobile Signal-2.png",
    wifiImage: "Wifi.png",
    batteryImage: "Battery.png",
  },
  banners: [
    {
      variant: "top",
      left: "☁",
      center: "> Cloud marshmallows♡ .: * ⊹",
    },
    {
      variant: "message",
      leftImage: "topwidget3.png",
      center: "Your message fades away in a looping dream ｡ z w z",
      right: "21:40",
    },
    {
      variant: "gift",
      leftImage: "topwidget2.png",
      centerPrefix: "[Little Rabbit..",
      centerStrong: "Gift from Baby",
      right: "02/04",
    },
  ],
  grid: {
    topLabel: "Top Widgets°",
    bottomLeftLabel: "Top Widgets°",
    bottomRightLabel: "Top Widgets°",
  },
  apps: [
    { id: "qq", label: "QQ", icon: "wallet.JPG" },
    { id: "taobao", label: "淘宝", icon: "music.JPG" },
    { id: "weibo", label: "微博", icon: "twitter.JPG" },
    { id: "wechat", label: "WeChat", icon: "contacts.JPG" },
    { id: "quack", label: "哔哩哔哩", icon: "messages.JPG" },
    { id: "douyin", label: "抖音", icon: "settings.JPG" },
    { id: "meituan", label: "美团", icon: "wallet.JPG" },
    { id: "qqmusic", label: "QQ音乐", icon: "music.JPG" },
  ],
  noteWidget: {
    title: "Crying Cat Emoji",
    meta: "Date   02/04",
    body: "Am I just a star to you •̩̩͙",
    footerLeft: "𖧷  From iPhone 15",
    footerInput: "Comment ...",
    leftImage: "topwidget1.png",
    rightImage: "topwidget2.png",
  },
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
      onerror="this.outerHTML='${createFallback(fallbackLabel, extraClass).replace(/'/g, "&apos;")}'"
    />
  `;
}

function renderBanner(banner) {
  if (banner.variant === "top") {
    return `
      <div class="glass-card rounded-[30px] px-4 py-3">
        <div class="banner-row grid-cols-[16px_1fr] text-[12px] tracking-[0.08em]">
          <span class="opacity-70">${banner.left}</span>
          <span class="truncate whitespace-nowrap">${banner.center}</span>
        </div>
      </div>
    `;
  }

  if (banner.variant === "message") {
    return `
      <div class="glass-card rounded-[30px] px-3 py-2.5">
        <div class="banner-row grid-cols-[34px_1fr_auto]">
          <div class="soft-icon h-[34px] w-[34px] rounded-[16px] bg-white/60">
            ${imageMarkup(banner.leftImage, "Message banner art", "h-full w-full", "ART")}
          </div>
          <p class="truncate text-[9px] font-medium tracking-[0.06em]">${banner.center}</p>
          <span class="text-[12px] font-semibold opacity-45">${banner.right}</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="glass-card rounded-[30px] px-3 py-2.5">
      <div class="banner-row grid-cols-[34px_1fr_auto]">
        <div class="soft-icon h-[34px] w-[34px] rounded-[16px] bg-white/60">
          ${imageMarkup(banner.leftImage, "Gift banner art", "h-full w-full", "ART")}
        </div>
        <div class="min-w-0 text-center leading-none">
          <span class="mr-1 text-[8px] tracking-[0.08em] opacity-55">${banner.centerPrefix}</span>
          <span class="text-[12px] font-semibold">${banner.centerStrong}</span>
        </div>
        <span class="text-[12px] font-semibold opacity-45">${banner.right}</span>
      </div>
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

function renderBearWidget() {
  return `
    <section class="space-y-2">
      <div class="widget-stack">
        <div class="layer layer-3">${imageMarkup("topwidget3.png", "Widget layer 3", "h-full w-full", "W3")}</div>
        <div class="layer layer-2">${imageMarkup("topwidget2.png", "Widget layer 2", "h-full w-full", "W2")}</div>
        <div class="layer layer-1">${imageMarkup("topwidget1.png", "Widget layer 1", "h-full w-full", "W1")}</div>
        <div class="clip-ring">${imageMarkup("topwidget1.png", "Bear photo", "h-full w-full", "BEAR")}</div>
        <div class="caption">(x)Xiaoyu Daimi(3</div>
      </div>
    </section>
  `;
}

function renderStatsCluster() {
  return `
    <section class="grid gap-2 text-center">
      <div class="text-left text-[26px] font-light leading-none opacity-55">:3</div>
      <div class="mini-pill h-[62px] w-[62px] rounded-full border-dashed bg-white/35 text-[14px]">80%</div>
      <div class="mini-pill h-[28px] rounded-[10px] text-[13px]">20</div>
      <div class="mini-pill h-[22px] rounded-[10px] text-[18px]">~</div>
      <div class="mini-pill h-[28px] rounded-[10px] text-[13px]">40</div>
    </section>
  `;
}

function renderTopApps() {
  return `
    <section class="grid grid-cols-2 gap-x-5 gap-y-6">
      ${homeConfig.apps.slice(0, 4).map(renderAppButton).join("")}
    </section>
  `;
}

function renderBottomApps() {
  return `
    <section class="grid grid-cols-2 gap-x-5 gap-y-6">
      ${homeConfig.apps.slice(4).map(renderAppButton).join("")}
    </section>
  `;
}

function renderNoteWidget() {
  const note = homeConfig.noteWidget;

  return `
    <section class="glass-card rounded-[28px] p-3">
      <div class="mb-2 flex items-start gap-2">
        <div class="soft-icon h-[28px] w-[28px] rounded-full bg-white/60">
          ${imageMarkup("topwidget3.png", "Crying cat avatar", "h-full w-full", "CAT")}
        </div>
        <div class="min-w-0 leading-tight">
          <div class="truncate text-[12px] font-semibold">${note.title}</div>
          <div class="text-[9px] opacity-45">${note.meta}</div>
        </div>
      </div>
      <p class="mb-2 text-[11px] font-medium">${note.body}</p>
      <div class="note-slices mb-2">
        <div class="note-slice">${imageMarkup(note.leftImage, "Left bunny slice", "h-full w-full", "L")}</div>
        <div class="note-slice">${imageMarkup(note.rightImage, "Right bunny slice", "h-full w-full", "R")}</div>
      </div>
      <div class="mb-1 text-[8px] opacity-45">${note.footerLeft}</div>
      <div class="glass-card rounded-full px-3 py-1 text-[8px] opacity-75">${note.footerInput}</div>
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
                <span class="icon-frame soft-icon">
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

        <section class="mt-6 flex-1">
          <div class="mb-4 text-center text-[24px] font-semibold tracking-[-0.03em] opacity-85">${homeConfig.grid.topLabel}</div>
          <div class="grid grid-cols-4 gap-x-4 gap-y-5">
            <div class="col-span-2 row-span-2">
              <div class="grid grid-cols-[1.25fr_0.75fr] gap-2">
                ${renderBearWidget()}
                ${renderStatsCluster()}
              </div>
            </div>
            <div class="col-span-2 row-span-2">${renderTopApps()}</div>

            <div class="col-span-2 mt-1">
              <div class="mb-3 text-center text-[24px] font-semibold tracking-[-0.03em] opacity-85">${homeConfig.grid.bottomLeftLabel}</div>
              ${renderBottomApps()}
            </div>

            <div class="col-span-2 mt-1">
              ${renderNoteWidget()}
              <div class="mt-3 text-center text-[24px] font-semibold tracking-[-0.03em] opacity-85">${homeConfig.grid.bottomRightLabel}</div>
            </div>
          </div>
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
  wireInteractions(root);
  mountStatusClock(root);
}

init();
