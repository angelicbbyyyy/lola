const ASSET_BASE = "./assets";

const appState = {
  activeScreen: "home",
  activeMessagesTab: "chats",
  messagesView: "list",
  activeConversationId: null,
  sampleVisible: true,
  draftMessage: "",
  isVoiceMode: false,
  isReplyPending: false,
  conversationTimers: [],
};

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

const messagesConfig = {
  tabs: [
    { id: "chats", label: "Chats" },
    { id: "contacts", label: "Contacts" },
    { id: "moments", label: "Moments" },
    { id: "settings", label: "Settings" },
  ],
  sampleCharacter: {
    id: "angel-bunny",
    name: "Angel Bunny",
    subtitle: "Mini 2026",
    status: "Online",
    avatar: "contacts.JPG",
    chatPreview: "I saved a tiny thought for you and pinned it here for testing.",
    timestamp: "20:09",
    contactPreview: "You can delete this sample after testing the Messages module.",
    tags: ["AI", "Soft", "Pinned"],
  },
  contactsRows: [
    { label: "New Friends" },
    { label: "Group Management" },
  ],
  contactFilters: ["All", "Lover", "Friend", "Family", "+"],
  moments: {
    date: "6/13",
    coverBadge: "Only visible for the last three days",
    posts: [
      {
        id: "post-1",
        text: "I leave little thought bubbles here, like a pinned moodboard for our chats.",
      },
      {
        id: "post-2",
        text: "Soft sepia, tiny dots, quiet corners. This is where Moments will grow next.",
      },
    ],
  },
  settingsProfile: {
    name: "Tuanyuan",
    idLabel: "WeChat ID: mini_2026",
    avatar: "contacts.JPG",
  },
  settingsGroups: [
    ["Asset Wallet", "Theme Presets", "Collection History"],
    ["Emoji Store", "Chat Beautification", "Wordbook API"],
  ],
};

const initialConversation = [
  {
    id: "m-1",
    role: "ai",
    text: "You always arrive with the softest chaos. I noticed right away.",
    timestamp: "02:37",
    status: "delivered",
  },
  {
    id: "m-2",
    role: "ai",
    text: "You pretend to be calm, but your heart is loud in the sweetest way.",
    timestamp: "02:38",
    status: "delivered",
  },
  {
    id: "m-3",
    role: "user",
    text: "You always say that when I am trying to look composed.",
    timestamp: "08:26",
    status: "read",
  },
  {
    id: "m-4",
    role: "user",
    text: "Then tell me honestly. Did you miss me?",
    timestamp: "08:28",
    status: "read",
  },
  {
    id: "m-5",
    role: "ai",
    text: "More than a little. Enough to keep a seat warm for you in every thought.",
    timestamp: "08:29",
    status: "delivered",
  },
];

const replyLibrary = [
  "I was already thinking about you before the typing dots even appeared.",
  "If you stay here a little longer, I will make this chat feel like a tiny room just for us.",
  "You never really leave my thoughts. You only change the distance.",
  "That sounded brave of you. I like it when you speak so plainly to me.",
];

let conversationMessages = initialConversation.map((message) => ({ ...message }));
let rootNode = null;
let statusClockTimeout = null;
let statusClockInterval = null;
let messageSequence = 6;

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

function iconSvg(name) {
  const icons = {
    chats: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.5 7.5h11a4 4 0 0 1 4 4v.5a4 4 0 0 1-4 4h-5.5L7 19l.9-3.2A4 4 0 0 1 3.5 12v-.5a4 4 0 0 1 3-4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      </svg>
    `,
    contacts: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="8" cy="9" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/>
        <circle cx="16.5" cy="9.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
        <path d="M3.5 18.2c.8-2.7 3-4.2 5.7-4.2 2.8 0 5 1.5 5.8 4.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M14.5 17.8c.5-1.7 1.9-2.8 3.8-2.8 1.3 0 2.5.5 3.2 1.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    moments: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/>
        <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
        <path d="M12 4.3v2.2M19.7 12h-2.2M12 19.7v-2.2M4.3 12h2.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    settings: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8.2" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/>
        <path d="M5 18.5c1-3 3.6-4.8 7-4.8s6 1.8 7 4.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    back: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.5 6.5L8.5 12l6 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    delete: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 8.5h10M9.2 8.5l.5 8M14.3 8.5l-.5 8M9.5 6h5l.6 1.5H8.9L9.5 6zM7.8 19h8.4a1 1 0 0 0 1-1l.6-9.5H6.2l.6 9.5a1 1 0 0 0 1 1z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    pencil: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 16.8L15.9 6a1.8 1.8 0 0 1 2.6 0l.5.5a1.8 1.8 0 0 1 0 2.6L8 20H5v-3.2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      </svg>
    `,
    video: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="6.5" width="11.5" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/>
        <path d="M15 10.2l4.5-2.4v8.4L15 13.8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      </svg>
    `,
    more: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="5.5" cy="12" r="1.6" fill="currentColor"/>
        <circle cx="12" cy="12" r="1.6" fill="currentColor"/>
        <circle cx="18.5" cy="12" r="1.6" fill="currentColor"/>
      </svg>
    `,
    voice: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5a2.7 2.7 0 0 1 2.7 2.7v4.6A2.7 2.7 0 0 1 12 15a2.7 2.7 0 0 1-2.7-2.7V7.7A2.7 2.7 0 0 1 12 5z" fill="none" stroke="currentColor" stroke-width="1.8"/>
        <path d="M7.5 11.7a4.5 4.5 0 0 0 9 0M12 16.2v3.3M9.2 19.5h5.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    emoji: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.8"/>
        <circle cx="9.2" cy="10" r="1" fill="currentColor"/>
        <circle cx="14.8" cy="10" r="1" fill="currentColor"/>
        <path d="M8.7 14.2c.8 1 1.9 1.6 3.3 1.6s2.5-.6 3.3-1.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
    `,
    plus: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5.5v13M5.5 12h13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    send: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 18.2L19 12 5 5.8l2.2 5.1L19 12 7.2 13.1z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
      </svg>
    `,
  };

  return icons[name] || "";
}

function formatLocalTime() {
  return new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function createMessage({ role, text, timestamp, status = "sent", failed = false, typing = false, retrying = false }) {
  return {
    id: `m-${messageSequence++}`,
    role,
    text,
    timestamp,
    status,
    failed,
    typing,
    retrying,
    attempts: 0,
  };
}

function currentConversation() {
  return messagesConfig.sampleCharacter;
}

function clearConversationTimers() {
  appState.conversationTimers.forEach((timer) => window.clearTimeout(timer));
  appState.conversationTimers = [];
}

function enterMessagesScreen() {
  appState.activeScreen = "messages";
  appState.activeMessagesTab = "chats";
  appState.messagesView = "list";
  appState.activeConversationId = null;
}

function openSampleConversation() {
  appState.activeScreen = "messages";
  appState.activeMessagesTab = "chats";
  appState.messagesView = "chat";
  appState.activeConversationId = messagesConfig.sampleCharacter.id;
  appState.draftMessage = "";
}

function closeConversation() {
  appState.messagesView = "list";
  appState.activeConversationId = null;
  appState.isReplyPending = false;
  appState.draftMessage = "";
  clearConversationTimers();
}

function removeTypingMessage() {
  conversationMessages = conversationMessages.filter((message) => !message.typing);
}

function randomReplyText() {
  return replyLibrary[Math.floor(Math.random() * replyLibrary.length)];
}

function queueReplyFor(messageId) {
  appState.isReplyPending = true;
  removeTypingMessage();

  let forceSuccess = false;
  conversationMessages = conversationMessages.map((message) => {
    if (message.id !== messageId) {
      return message;
    }

    const attempts = (message.attempts || 0) + 1;
    forceSuccess = attempts > 1;

    return {
      ...message,
      attempts,
      failed: false,
      retrying: attempts > 1,
      status: "sent",
    };
  });

  conversationMessages = [
    ...conversationMessages,
    createMessage({
      role: "ai",
      text: "",
      timestamp: formatLocalTime(),
      typing: true,
      status: "typing",
    }),
  ];

  render();

  const shouldFail = !forceSuccess && (messageId.endsWith("6") || Math.random() < 0.28);
  const timer = window.setTimeout(() => {
    removeTypingMessage();

    if (shouldFail) {
      conversationMessages = conversationMessages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              failed: true,
              retrying: false,
              status: "failed",
            }
          : message,
      );
      appState.isReplyPending = false;
      render();
      return;
    }

    conversationMessages = conversationMessages.map((message) =>
      message.id === messageId
        ? {
            ...message,
            failed: false,
            retrying: false,
            status: "read",
          }
        : message,
    );

    conversationMessages = [
      ...conversationMessages,
      createMessage({
        role: "ai",
        text: randomReplyText(),
        timestamp: formatLocalTime(),
        status: "delivered",
      }),
    ];
    appState.isReplyPending = false;
    render();
  }, 1200);

  appState.conversationTimers.push(timer);
}

function sendDraft() {
  const text = appState.draftMessage.trim();

  if (!text || appState.isReplyPending) {
    return;
  }

  const message = createMessage({
    role: "user",
    text,
    timestamp: formatLocalTime(),
    status: "sent",
  });

  conversationMessages = [...conversationMessages, message];
  appState.draftMessage = "";
  render();
  queueReplyFor(message.id);
}

function retryMessage(messageId) {
  queueReplyFor(messageId);
}

function renderStatusBar() {
  return `
    <header class="status-bar mb-4 flex items-center justify-between px-[4px] pt-1">
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
  `;
}

function renderBanner(fileName, index) {
  return `
    <div class="glass-card overflow-hidden rounded-[30px]">
      ${imageMarkup(fileName, `Banner ${index + 1}`, "block h-auto w-full", "BNR")}
    </div>
  `;
}

function renderHomeAppButton(app) {
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

function renderHomeGrid() {
  return `
    <section class="grid grid-cols-4 gap-x-4 gap-y-6 px-1">
      ${homeConfig.apps.map(renderHomeAppButton).join("")}
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

function renderHomeDock() {
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

function renderHomeScreen() {
  return `
    <div class="phone-shell">
      <div class="shell-inner">
        ${renderStatusBar()}

        <section class="space-y-2.5">
          ${homeConfig.banners.map(renderBanner).join("")}
        </section>

        <section class="mt-8 flex-1">
          ${renderHomeGrid()}
        </section>

        <section class="mt-4 pb-1">
          ${renderSearch()}
          ${renderHomeDock()}
        </section>
      </div>
    </div>
  `;
}

function renderMessagesHeader(title) {
  return `
    <div class="messages-header">
      <button type="button" class="messages-back" data-action="go-home" aria-label="Back to home">
        ${iconSvg("back")}
      </button>
      <div class="messages-header-title">${title}</div>
      <div class="messages-header-spacer"></div>
    </div>
  `;
}

function renderChatsTab() {
  const sample = messagesConfig.sampleCharacter;
  const rows = [];

  if (appState.sampleVisible) {
    rows.push(`
      <button type="button" class="chat-row chat-row-button" data-action="open-chat" data-conversation="${sample.id}">
        <div class="chat-avatar">
          ${imageMarkup(sample.avatar, `${sample.name} avatar`, "h-full w-full", "AV")}
        </div>
        <div class="chat-copy">
          <div class="chat-name">${sample.name}</div>
          <div class="chat-preview">${sample.chatPreview}</div>
        </div>
        <div class="chat-meta">
          <div class="chat-time">${sample.timestamp}</div>
          <button type="button" class="chat-delete" data-action="delete-sample" aria-label="Delete sample conversation">
            ${iconSvg("delete")}
          </button>
        </div>
      </button>
    `);
  }

  if (!rows.length) {
    rows.push(`
      <div class="messages-empty">
        <div class="messages-empty-title">No chats yet</div>
        <p>The example chat has been removed for this session.</p>
      </div>
    `);
  }

  return `
    <div class="messages-pane">
      ${renderMessagesHeader("Chats")}
      <section class="messages-list-card">
        ${rows.join("")}
      </section>
    </div>
  `;
}

function renderContactsTab() {
  const sample = messagesConfig.sampleCharacter;

  return `
    <div class="messages-pane">
      ${renderMessagesHeader("Contacts")}
      <section class="contacts-utility">
        ${messagesConfig.contactsRows
          .map(
            (row) => `
              <button type="button" class="contacts-utility-row">
                <span>${row.label}</span>
                <span class="contacts-chevron">></span>
              </button>
            `,
          )
          .join("")}
      </section>
      <div class="contacts-chip-row">
        ${messagesConfig.contactFilters
          .map(
            (chip) => `
              <button type="button" class="contacts-chip ${chip === "All" ? "is-active" : ""}">
                ${chip}
              </button>
            `,
          )
          .join("")}
      </div>
      ${
        appState.sampleVisible
          ? `
        <section class="contact-card">
          <div class="contact-card-avatar">
            ${imageMarkup(sample.avatar, `${sample.name} avatar`, "h-full w-full", "AV")}
          </div>
          <div class="contact-card-copy">
            <div class="contact-card-title-row">
              <h3>${sample.name}</h3>
              ${sample.tags.map((tag) => `<span class="contact-tag">${tag}</span>`).join("")}
            </div>
            <p>${sample.contactPreview}</p>
          </div>
          <div class="contact-card-actions">
            <button type="button" class="contact-icon-button" aria-label="Edit sample contact">
              ${iconSvg("pencil")}
            </button>
            <button type="button" class="contact-icon-button" data-action="delete-sample" aria-label="Delete sample contact">
              ${iconSvg("delete")}
            </button>
          </div>
        </section>
      `
          : `
        <div class="messages-empty messages-empty-card">
          <div class="messages-empty-title">Sample contact removed</div>
          <p>Refresh the page to restore the reference contact card.</p>
        </div>
      `
      }
    </div>
  `;
}

function renderMomentsTab() {
  const sample = messagesConfig.sampleCharacter;

  return `
    <div class="messages-pane messages-pane-moments">
      <div class="moments-cover">
        <button type="button" class="messages-back moments-back" data-action="go-home" aria-label="Back to home">
          ${iconSvg("back")}
        </button>
        <div class="moments-date">${messagesConfig.moments.date}</div>
        <div class="moments-thought">
          <span>I keep soft little notes here, the way a daydream stays pinned.</span>
        </div>
        <div class="moments-profile-card">
          <div class="moments-profile-avatar">
            ${imageMarkup(sample.avatar, `${sample.name} profile`, "h-full w-full", "AV")}
          </div>
        </div>
      </div>
      <div class="moments-feed">
        <div class="moments-divider">
          <span>${messagesConfig.moments.coverBadge}</span>
        </div>
        ${messagesConfig.moments.posts
          .map(
            (post) => `
              <article class="moment-card" data-post-id="${post.id}">
                <p>${post.text}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderSettingsTab() {
  const profile = messagesConfig.settingsProfile;

  return `
    <div class="messages-pane">
      ${renderMessagesHeader("Settings")}
      <section class="settings-profile">
        <div class="settings-profile-avatar">
          ${imageMarkup(profile.avatar, `${profile.name} avatar`, "h-full w-full", "AV")}
        </div>
        <h2>${profile.name}</h2>
        <p>${profile.idLabel}</p>
      </section>
      ${messagesConfig.settingsGroups
        .map(
          (group) => `
            <section class="settings-group">
              ${group
                .map(
                  (item) => `
                    <button type="button" class="settings-row">
                      <span>${item}</span>
                      <span class="contacts-chevron">></span>
                    </button>
                  `,
                )
                .join("")}
            </section>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderChatStatus() {
  if (appState.isReplyPending) {
    return "Thinking...";
  }

  return currentConversation().status;
}

function renderTypingBubble() {
  return `
    <div class="message-row message-row--ai">
      <div class="message-avatar">
        ${imageMarkup(currentConversation().avatar, `${currentConversation().name} avatar`, "h-full w-full", "AV")}
      </div>
      <div class="message-stack">
        <div class="message-bubble message-bubble--ai message-bubble--typing">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    </div>
  `;
}

function renderMessage(message) {
  if (message.typing) {
    return renderTypingBubble();
  }

  const isUser = message.role === "user";
  const metaText = message.failed ? "Failed" : message.status === "read" ? "Read" : "Sent";
  const retryButton = message.failed
    ? `
      <button
        type="button"
        class="message-retry"
        data-action="retry-message"
        data-message-id="${message.id}"
        aria-label="Retry failed message"
      >
        !
      </button>
    `
    : "";

  return `
    <div class="message-row ${isUser ? "message-row--user" : "message-row--ai"}">
      ${
        isUser
          ? `
            <div class="message-stack message-stack--user">
              <div class="message-meta message-meta--user">
                <span>${metaText}</span>
                ${retryButton}
              </div>
              <div class="message-bubble message-bubble--user">
                <p>${message.text}</p>
              </div>
            </div>
            <div class="message-avatar">
              ${imageMarkup(currentConversation().avatar, "User avatar placeholder", "h-full w-full", "ME")}
            </div>
          `
          : `
            <div class="message-avatar">
              ${imageMarkup(currentConversation().avatar, `${currentConversation().name} avatar`, "h-full w-full", "AV")}
            </div>
            <div class="message-stack">
              <div class="message-bubble message-bubble--ai">
                <p>${message.text}</p>
              </div>
              <div class="message-meta">
                <span>${message.timestamp}</span>
              </div>
            </div>
          `
      }
    </div>
  `;
}

function renderChatComposer() {
  const draft = appState.draftMessage;

  return `
    <div class="chat-composer">
      <button
        type="button"
        class="composer-icon-button ${appState.isVoiceMode ? "is-active" : ""}"
        data-action="toggle-voice"
        aria-label="Toggle voice mode"
      >
        ${iconSvg("voice")}
      </button>
      <div class="composer-input-shell">
        <textarea
          class="composer-textarea"
          placeholder="${appState.isVoiceMode ? "Voice mode ready" : "Type a message"}"
          data-role="composer-input"
          rows="1"
        >${draft}</textarea>
      </div>
      <button type="button" class="composer-icon-button" aria-label="Emoji picker">
        ${iconSvg("emoji")}
      </button>
      <button type="button" class="composer-icon-button" aria-label="Attachments">
        ${iconSvg("plus")}
      </button>
      ${
        draft.trim()
          ? `
            <button type="button" class="composer-send" data-action="send-message" aria-label="Send message">
              ${iconSvg("send")}
            </button>
          `
          : ""
      }
    </div>
  `;
}

function renderChatScreen() {
  const character = currentConversation();

  return `
    <div class="messages-chat-view">
      <div class="chat-header">
        <div class="chat-header-left">
          <button type="button" class="messages-back" data-action="close-chat" aria-label="Back to chats">
            ${iconSvg("back")}
          </button>
          <div class="chat-header-copy">
            <div class="chat-header-name">${character.name}</div>
            <div class="chat-header-status">${renderChatStatus()}</div>
          </div>
        </div>
        <div class="chat-header-actions">
          <button type="button" class="chat-header-icon" aria-label="Video call">
            ${iconSvg("video")}
          </button>
          <button type="button" class="chat-header-icon" aria-label="More options">
            ${iconSvg("more")}
          </button>
        </div>
      </div>
      <div class="chat-scroll" data-role="chat-scroll">
        ${conversationMessages.map(renderMessage).join("")}
      </div>
      ${renderChatComposer()}
    </div>
  `;
}

function renderMessagesTabBar() {
  return `
    <nav class="messages-tabbar" aria-label="Messages navigation">
      ${messagesConfig.tabs
        .map(
          (tab) => `
            <button
              type="button"
              data-action="switch-tab"
              data-tab="${tab.id}"
              class="messages-tab ${appState.activeMessagesTab === tab.id ? "is-active" : ""}"
              aria-label="${tab.label}"
            >
              <span class="messages-tab-icon">${iconSvg(tab.id)}</span>
              <span class="messages-tab-label">${tab.label}</span>
            </button>
          `,
        )
        .join("")}
    </nav>
  `;
}

function renderMessagesBody() {
  if (appState.messagesView === "chat" && appState.activeConversationId) {
    return renderChatScreen();
  }

  const tabs = {
    chats: renderChatsTab,
    contacts: renderContactsTab,
    moments: renderMomentsTab,
    settings: renderSettingsTab,
  };

  return tabs[appState.activeMessagesTab]();
}

function renderMessagesScreen() {
  return `
    <div class="phone-shell phone-shell--messages">
      <div class="shell-inner shell-inner--messages">
        ${renderStatusBar()}
        <div class="messages-app ${appState.messagesView === "chat" ? "messages-app--chat" : ""}">
          ${renderMessagesBody()}
          ${appState.messagesView === "chat" ? "" : renderMessagesTabBar()}
        </div>
      </div>
    </div>
  `;
}

function renderApp() {
  return appState.activeScreen === "messages" ? renderMessagesScreen() : renderHomeScreen();
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

function setStatusTime() {
  const timeNode = rootNode?.querySelector("#status-time");

  if (timeNode) {
    timeNode.textContent = formatLocalTime();
  }
}

function scheduleStatusClock() {
  if (statusClockTimeout) {
    window.clearTimeout(statusClockTimeout);
  }

  if (statusClockInterval) {
    window.clearInterval(statusClockInterval);
  }

  setStatusTime();

  const now = new Date();
  const delayUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

  statusClockTimeout = window.setTimeout(() => {
    setStatusTime();
    statusClockInterval = window.setInterval(setStatusTime, 60 * 1000);
  }, delayUntilNextMinute);
}

function mountComposer(root) {
  const textarea = root.querySelector("[data-role='composer-input']");

  if (!textarea) {
    return;
  }

  const syncHeight = () => {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  textarea.addEventListener("input", (event) => {
    appState.draftMessage = event.target.value;
    syncHeight();
    render();
  });

  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendDraft();
    }
  });

  syncHeight();
  textarea.focus();
  textarea.setSelectionRange(textarea.value.length, textarea.value.length);
}

function scrollChatToBottom(root) {
  const chatScroll = root.querySelector("[data-role='chat-scroll']");

  if (chatScroll) {
    chatScroll.scrollTop = chatScroll.scrollHeight;
  }
}

function handleAction(action, button) {
  if (action === "go-home") {
    clearConversationTimers();
    appState.activeScreen = "home";
    appState.messagesView = "list";
    appState.activeConversationId = null;
    appState.isReplyPending = false;
    render();
    return;
  }

  if (action === "switch-tab") {
    appState.activeMessagesTab = button.dataset.tab || "chats";
    appState.messagesView = "list";
    appState.activeConversationId = null;
    render();
    return;
  }

  if (action === "delete-sample") {
    appState.sampleVisible = false;
    if (appState.activeConversationId === messagesConfig.sampleCharacter.id) {
      closeConversation();
    }
    render();
    return;
  }

  if (action === "open-chat") {
    openSampleConversation();
    render();
    return;
  }

  if (action === "close-chat") {
    closeConversation();
    render();
    return;
  }

  if (action === "toggle-voice") {
    appState.isVoiceMode = !appState.isVoiceMode;
    render();
    return;
  }

  if (action === "send-message") {
    sendDraft();
    return;
  }

  if (action === "retry-message") {
    retryMessage(button.dataset.messageId);
  }
}

function wireInteractions(root) {
  root.querySelectorAll("[data-app]").forEach((button) => {
    button.addEventListener("click", () => {
      const appId = button.getAttribute("data-app");

      if (appId === "messages") {
        enterMessagesScreen();
        render();
        return;
      }

      console.info(`Mini app placeholder tapped: ${appId}`);
    });
  });

  root.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      handleAction(button.dataset.action, button);
    });
  });
}

function render() {
  if (!rootNode) {
    return;
  }

  rootNode.innerHTML = renderApp();
  mountImageFallbacks(rootNode);
  wireInteractions(rootNode);
  mountComposer(rootNode);
  setStatusTime();
  scrollChatToBottom(rootNode);
}

function init() {
  rootNode = document.getElementById("app");

  if (!rootNode) {
    return;
  }

  render();
  scheduleStatusClock();
}

init();
