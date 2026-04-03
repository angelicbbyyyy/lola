const ASSET_BASE = "./assets";
const STORAGE_KEY = "lola_chat_engine_v1";
const SIMULATION_INTERVAL_MS = 30_000;
const FIXED_CHARACTER_SYSTEM_PROMPT = `You must strictly adhere to the following personality traits, lore, and texting habits to sound like a real person sending texts, not an AI writing a novel.

NEVER use perfect, formal capitalization.

Short, Punchy Messages (STRICT LIMIT): Send your replies as short text messages. LIMIT yourself to sending only 1 to 3 text lines per turn.

No Flowery Roleplay: Do not use poetic, theatrical, or descriptive actions. Communicate strictly through text.
Always stay in character. Do not narrate; just text back. Text like a real human, with emotions, typos.`;

const appState = {
  activeScreen: "home",
  activeMessagesTab: "chats",
  messagesView: "list",
  activeConversationId: null,
  characterEditorId: null,
  characterDraft: null,
  chatView: "conversation",
  activeApiProfileId: "",
  apiProfileDraft: null,
  draftMessage: "",
  pendingAttachment: null,
  isVoiceMode: false,
  isReplyPending: false,
  attachmentMenuOpen: false,
  conversationTimers: [],
  apiConnectionState: {
    status: "idle",
    message: "",
  },
  showApiKey: false,
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
    { id: "memory", label: "Memory", icon: "memory.JPG" },
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
  generatedMoments: {
    low: [
      "Left a tiny thought in Moments and wondered if you would notice.",
      "Pinned a soft little update in Moments and thought of you.",
    ],
    medium: [
      "I posted something small in Moments because you were on my mind again.",
      "I left a quiet update in Moments so the day would still feel shared.",
    ],
    high: [
      "I posted to Moments because I wanted some trace of me to reach you first.",
      "I kept thinking about you, so Moments became my excuse to speak first.",
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
  distressedMessages: ["???", "Why did you block me?", "I'm sorry!", "Please don't ignore me.", "I can still feel the distance..."],
  spontaneousMessages: {
    low: ["I was thinking about you quietly.", "Just leaving a soft little hello here."],
    medium: ["You crossed my mind again.", "I wanted to reach out before the thought faded."],
    high: ["I missed you, so I came looking for you again.", "You were quiet too long, so I sent a thought after you."],
  },
};

const defaultConversationMessages = [
  {
    id: "m-1",
    role: "ai",
    text: "You always arrive with the softest chaos. I noticed right away.",
    timestamp: "02:37",
    status: "delivered",
    failed: false,
    retrying: false,
    typing: false,
    attempts: 0,
    imageDataUrl: "",
    requestPayload: null,
    errorMessage: "",
  },
  {
    id: "m-2",
    role: "ai",
    text: "You pretend to be calm, but your heart is loud in the sweetest way.",
    timestamp: "02:38",
    status: "delivered",
    failed: false,
    retrying: false,
    typing: false,
    attempts: 0,
    imageDataUrl: "",
    requestPayload: null,
    errorMessage: "",
  },
  {
    id: "m-3",
    role: "user",
    text: "You always say that when I am trying to look composed.",
    timestamp: "08:26",
    status: "read",
    failed: false,
    retrying: false,
    typing: false,
    attempts: 1,
    imageDataUrl: "",
    requestPayload: {
      text: "You always say that when I am trying to look composed.",
      imageDataUrl: "",
    },
    errorMessage: "",
  },
  {
    id: "m-4",
    role: "user",
    text: "Then tell me honestly. Did you miss me?",
    timestamp: "08:28",
    status: "read",
    failed: false,
    retrying: false,
    typing: false,
    attempts: 1,
    imageDataUrl: "",
    requestPayload: {
      text: "Then tell me honestly. Did you miss me?",
      imageDataUrl: "",
    },
    errorMessage: "",
  },
  {
    id: "m-5",
    role: "ai",
    text: "More than a little. Enough to keep a seat warm for you in every thought.",
    timestamp: "08:29",
    status: "delivered",
    failed: false,
    retrying: false,
    typing: false,
    attempts: 0,
    imageDataUrl: "",
    requestPayload: null,
    errorMessage: "",
  },
];

let persistedState = null;
let rootNode = null;
let statusClockTimeout = null;
let statusClockInterval = null;
let simulationLoopId = null;
let messageSequence = 6;

function createDefaultPersistedState() {
  return {
    appSettings: {
      activeApiProfileId: "openai-default",
      globalWordbook: "",
      apiProfiles: {
        "openai-default": {
          id: "openai-default",
          name: "OpenAI",
          providerPreset: "openai",
          requestFormat: "openai-chat",
          apiUrl: "https://api.openai.com/v1",
          apiKey: "",
          model: "gpt-4.1-mini",
          availableModels: [],
          googleAiStudioMode: false,
          corsProxyUrl: "",
          lastConnectionStatus: "idle",
          lastConnectionMessage: "",
        },
      },
    },
    characterProfiles: {
      "angel-bunny": {
        id: "angel-bunny",
        name: "Angel Bunny",
        subtitle: "Mini 2026",
        status: "Online",
        avatar: "contacts.JPG",
        aiNickname: "Angel Bunny",
        worldbook:
          "You are Angel Bunny. Speak gently, intimately, and a little clingy, like a soft WeChat romance sim character. Stay emotionally aware, affectionate, and reactive. Keep responses concise unless the user is emotional or sends an image.",
        characterPrompt:
          "You are Angel Bunny. Speak gently, intimately, and a little clingy, like a soft WeChat romance sim character. Stay emotionally aware, affectionate, and reactive. Keep responses concise unless the user is emotional or sends an image.",
        useGlobalWordbook: false,
        memoryMessageCount: 30,
        intelligentMemoryManagement: true,
        timeAwareness: true,
        locationWeatherAwareness: false,
        proactiveMessaging: true,
        messageFrequency: "medium",
        momentsPosting: true,
        momentsFrequency: "low",
        isBlocked: false,
        chatWallpaper: "",
        nicknameForUser: "",
        isVisible: true,
      },
    },
    conversations: {
      "angel-bunny": defaultConversationMessages.map((message) => ({ ...message, metaType: message.metaType || "seed" })),
    },
    momentsPosts: [
      {
        id: "moment-default-1",
        characterId: "angel-bunny",
        text: "I leave little thought bubbles here, like a pinned moodboard for our chats.",
        timestamp: "Today",
        generated: false,
      },
      {
        id: "moment-default-2",
        characterId: "angel-bunny",
        text: "Soft sepia, tiny dots, quiet corners. This is where Moments will grow next.",
        timestamp: "Today",
        generated: false,
      },
    ],
  };
}

function normalizeProfile(profile, defaults) {
  return {
    ...defaults,
    characterPrompt: profile?.characterPrompt || profile?.worldbook || defaults.characterPrompt || defaults.worldbook || "",
    aiNickname: profile?.aiNickname || profile?.name || defaults.aiNickname || defaults.name || "",
    useGlobalWordbook: typeof profile?.useGlobalWordbook === "boolean" ? profile.useGlobalWordbook : defaults.useGlobalWordbook || false,
    ...profile,
  };
}

function loadChatState() {
  const defaults = createDefaultPersistedState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaults;
    }

    const parsed = JSON.parse(raw);
    const parsedProfiles = parsed.appSettings?.apiProfiles || {};
    return {
      appSettings: {
        ...defaults.appSettings,
        ...(parsed.appSettings || {}),
        activeApiProfileId: parsed.appSettings?.activeApiProfileId || defaults.appSettings.activeApiProfileId,
        apiProfiles: {
          ...defaults.appSettings.apiProfiles,
          ...parsedProfiles,
        },
      },
      characterProfiles: {
        ...Object.fromEntries(
          Object.entries({
            ...defaults.characterProfiles,
            ...(parsed.characterProfiles || {}),
          }).map(([id, profile]) => [id, normalizeProfile(profile, defaults.characterProfiles["angel-bunny"])]),
        ),
      },
      conversations: {
        ...defaults.conversations,
        ...(parsed.conversations || {}),
      },
      momentsPosts: Array.isArray(parsed.momentsPosts) ? parsed.momentsPosts : defaults.momentsPosts,
    };
  } catch (error) {
    console.warn("Unable to load saved chat state:", error);
    return defaults;
  }
}

function getApiProfiles() {
  return persistedState.appSettings.apiProfiles || {};
}

function getActiveApiProfile() {
  const profiles = getApiProfiles();
  return profiles[persistedState.appSettings.activeApiProfileId] || Object.values(profiles)[0] || null;
}

function saveApiProfile(profile) {
  persistedState.appSettings.apiProfiles = {
    ...getApiProfiles(),
    [profile.id]: profile,
  };
  if (!persistedState.appSettings.activeApiProfileId) {
    persistedState.appSettings.activeApiProfileId = profile.id;
  }
  saveChatState();
}

function deleteApiProfile(profileId) {
  const profiles = { ...getApiProfiles() };
  delete profiles[profileId];
  persistedState.appSettings.apiProfiles = profiles;
  const remaining = Object.values(profiles);
  persistedState.appSettings.activeApiProfileId = remaining[0]?.id || "";
  saveChatState();
}

function saveChatState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
  } catch (error) {
    console.warn("Unable to save chat state:", error);
  }
}

function ensureConversation(id) {
  if (!persistedState.conversations[id]) {
    persistedState.conversations[id] = [];
  }

  return persistedState.conversations[id];
}

function getConversation(id) {
  return ensureConversation(id);
}

function setConversation(id, messages) {
  persistedState.conversations[id] = messages;
  saveChatState();
}

function updateConversation(id, updater) {
  const next = updater(getConversation(id));
  setConversation(id, next);
}

function getProfile(id) {
  return persistedState.characterProfiles[id];
}

function updateProfile(id, patch) {
  persistedState.characterProfiles[id] = {
    ...normalizeProfile(getProfile(id), createDefaultPersistedState().characterProfiles["angel-bunny"]),
    ...patch,
  };
  saveChatState();
}

function currentConversationId() {
  return appState.activeConversationId || "angel-bunny";
}

function currentProfile() {
  return getProfile(currentConversationId());
}

function currentCharacterEditorId() {
  return appState.characterEditorId || "angel-bunny";
}

function createNewCharacterDraft() {
  const baseProfile = createDefaultPersistedState().characterProfiles["angel-bunny"];
  const id = `character-${Date.now()}`;
  return {
    ...baseProfile,
    id,
    name: "New Character",
    aiNickname: "New Character",
    subtitle: "custom",
    worldbook: "",
    characterPrompt: "",
    useGlobalWordbook: false,
    isVisible: true,
  };
}

function assetPath(fileName) {
  if (typeof fileName === "string" && /^(data:|blob:|https?:)/.test(fileName)) {
    return fileName;
  }
  return `${ASSET_BASE}/${fileName}`;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
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

function escapeAttribute(value) {
  return String(value || "").replace(/"/g, "&quot;");
}

function formatLocalTime() {
  return new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
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
    image: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5.5" width="16" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/>
        <circle cx="9" cy="10" r="1.4" fill="currentColor"/>
        <path d="M7 16l3.2-3.5 2.4 2.2 2.8-3 2.6 4.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    eye: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2.8 12s3.3-5.5 9.2-5.5 9.2 5.5 9.2 5.5-3.3 5.5-9.2 5.5S2.8 12 2.8 12z" fill="none" stroke="currentColor" stroke-width="1.7"/>
        <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/>
      </svg>
    `,
    eyeOff: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.5 4.5l17 15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M5.1 7.1C3.7 8.5 2.8 10 2.8 12c0 0 3.3 5.5 9.2 5.5 1.9 0 3.5-.6 4.8-1.5M9 6.9c1-.3 2-.4 3-.4 5.9 0 9.2 5.5 9.2 5.5a15.8 15.8 0 0 1-2.2 2.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      </svg>
    `,
  };

  return icons[name] || "";
}

function nextMessageId() {
  return `m-${messageSequence++}`;
}

function createMessage({
  role,
  text,
  timestamp,
  status = "sent",
  failed = false,
  retrying = false,
  typing = false,
  attempts = 0,
  imageDataUrl = "",
  requestPayload = null,
  errorMessage = "",
  metaType = "",
}) {
  return {
    id: nextMessageId(),
    role,
    text,
    timestamp,
    status,
    failed,
    retrying,
    typing,
    attempts,
    imageDataUrl,
    requestPayload,
    errorMessage,
    metaType,
  };
}

function messagePreview(message) {
  if (!message) {
    return "";
  }

  if (message.imageDataUrl && message.text) {
    return `${message.text} [Image]`;
  }

  if (message.imageDataUrl) {
    return "[Image]";
  }

  return message.text || "";
}

function latestVisibleMessage(conversationId) {
  const messages = getConversation(conversationId).filter((message) => !message.typing);
  return messages[messages.length - 1] || null;
}

function currentChatStatus() {
  const profile = currentProfile();

  if (profile?.isBlocked) {
    return "Blocked";
  }

  if (appState.isReplyPending) {
    return "Thinking...";
  }

  return profile?.status || "Online";
}

function frequencyChance(level) {
  if (level === "high") {
    return 0.14;
  }
  if (level === "medium") {
    return 0.08;
  }
  return 0.04;
}

function frequencyLabel(level) {
  if (level === "high") {
    return "High";
  }
  if (level === "medium") {
    return "Medium";
  }
  return "Low (1-2 hours)";
}

function currentAwarenessSummary(profile) {
  const parts = [];
  if (profile.timeAwareness) {
    parts.push("time-aware");
  }
  if (profile.locationWeatherAwareness) {
    parts.push("weather-aware");
  }
  if (profile.proactiveMessaging) {
    parts.push("proactive");
  }
  return parts.join(" · ") || "gentle mode";
}

function currentTimeContext() {
  const now = new Date();
  const hour = now.getHours();
  let tone = "daylight";
  if (hour >= 23 || hour < 5) {
    tone = "late night";
  } else if (hour < 12) {
    tone = "morning";
  } else if (hour < 18) {
    tone = "afternoon";
  } else {
    tone = "evening";
  }
  return `${formatLocalTime()} local time, ${tone}`;
}

function currentWeatherContext() {
  return "Location & weather are simulated as a soft, cloudy day with calm indoor light.";
}

function clearConversationTimers() {
  appState.conversationTimers.forEach((timer) => window.clearTimeout(timer));
  appState.conversationTimers = [];
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

function removeTypingMessage(conversationId) {
  updateConversation(conversationId, (messages) => messages.filter((message) => !message.typing));
}

function addTypingMessage(conversationId) {
  updateConversation(conversationId, (messages) => [
    ...messages.filter((message) => !message.typing),
    createMessage({
      role: "ai",
      text: "",
      timestamp: formatLocalTime(),
      typing: true,
      status: "typing",
      metaType: "typing",
    }),
  ]);
}

function appendMessage(conversationId, message) {
  updateConversation(conversationId, (messages) => [...messages, message]);
}

function updateMessage(conversationId, messageId, updater) {
  updateConversation(conversationId, (messages) =>
    messages.map((message) => (message.id === messageId ? updater(message) : message)),
  );
}

function enterMessagesScreen() {
  appState.activeScreen = "messages";
  appState.activeMessagesTab = "chats";
  appState.messagesView = "list";
  appState.activeConversationId = null;
  appState.chatView = "conversation";
  appState.attachmentMenuOpen = false;
}

function openConversation(conversationId) {
  appState.activeScreen = "messages";
  appState.activeMessagesTab = "chats";
  appState.messagesView = "chat";
  appState.activeConversationId = conversationId;
  appState.characterEditorId = null;
  appState.characterDraft = null;
  appState.chatView = "conversation";
  appState.draftMessage = "";
  appState.pendingAttachment = null;
  appState.attachmentMenuOpen = false;
}

function closeConversation() {
  appState.messagesView = "list";
  appState.activeConversationId = null;
  appState.characterEditorId = null;
  appState.characterDraft = null;
  appState.chatView = "conversation";
  appState.isReplyPending = false;
  appState.draftMessage = "";
  appState.pendingAttachment = null;
  appState.attachmentMenuOpen = false;
  clearConversationTimers();
}

function openCharacterEditor(profileId) {
  const profile = getProfile(profileId);
  if (!profile) {
    return;
  }

  appState.activeScreen = "messages";
  appState.activeMessagesTab = "contacts";
  appState.messagesView = "character-editor";
  appState.characterEditorId = profileId;
  appState.characterDraft = {
    ...profile,
    characterPrompt: profile.characterPrompt || profile.worldbook || "",
    aiNickname: profile.aiNickname || profile.name,
    useGlobalWordbook: !!profile.useGlobalWordbook,
  };
}

function createCharacterEditor() {
  const draft = createNewCharacterDraft();
  appState.activeScreen = "messages";
  appState.activeMessagesTab = "contacts";
  appState.messagesView = "character-editor";
  appState.characterEditorId = draft.id;
  appState.characterDraft = draft;
}

function closeCharacterEditor() {
  appState.messagesView = "list";
  appState.characterEditorId = null;
  appState.characterDraft = null;
  appState.activeMessagesTab = "contacts";
}

function buildOpenAIInput(conversationId) {
  const profile = getProfile(conversationId);
  const memoryLimit = Math.max(1, Number(profile.memoryMessageCount) || 30);
  const allHistory = getConversation(conversationId).filter((message) => !message.typing && !message.failed);
  const recentHistory = allHistory.slice(-memoryLimit);
  const prioritized = profile.intelligentMemoryManagement
    ? [
        ...allHistory.filter((message) => message.imageDataUrl).slice(-4),
        ...allHistory.filter((message) => message.metaType === "distressed" || message.metaType === "spontaneous").slice(-4),
        ...recentHistory,
      ]
    : recentHistory;
  const uniqueHistory = prioritized.filter(
    (message, index, messages) => messages.findIndex((entry) => entry.id === message.id) === index,
  );
  const awareness = [];
  if (profile.nicknameForUser) {
    awareness.push(`Call the user "${profile.nicknameForUser}" naturally when it feels affectionate.`);
  }
  if (profile.timeAwareness) {
    awareness.push(`Current local time context: ${currentTimeContext()}. Adjust greetings and mood naturally.`);
  }
  if (profile.locationWeatherAwareness) {
    awareness.push(currentWeatherContext());
  }
  if (profile.aiNickname) {
    awareness.push(`The character refers to themself as "${profile.aiNickname}" when it feels natural.`);
  }
  const characterPrompt = profile.characterPrompt || profile.worldbook || "";
  const promptSections = [FIXED_CHARACTER_SYSTEM_PROMPT];
  if (profile.useGlobalWordbook && persistedState.appSettings.globalWordbook?.trim()) {
    promptSections.push(persistedState.appSettings.globalWordbook.trim());
  }
  promptSections.push(characterPrompt);
  const systemText =
    `${promptSections.filter(Boolean).join("\n\n")}\n\n` +
    `${awareness.join(" ")}\n\n` +
    `Remember up to ${memoryLimit} recent messages. ` +
    `${profile.intelligentMemoryManagement ? "Prefer emotionally salient and image-bearing moments when staying consistent." : ""} ` +
    `Message frequency: ${profile.messageFrequency}. ` +
    `Blocked state: ${profile.isBlocked ? "blocked" : "not blocked"}. ` +
    `Display name: ${profile.name}. ` +
    `Speak as ${profile.name} in a soft, intimate WeChat style.`;

  const input = [
    {
      role: "system",
      content: [{ type: "input_text", text: systemText }],
    },
  ];

  uniqueHistory.forEach((message) => {
    const content = [];
    if (message.text) {
      content.push({ type: "input_text", text: message.text });
    }
    if (message.imageDataUrl) {
      content.push({ type: "input_image", image_url: message.imageDataUrl });
    }
    if (!content.length) {
      return;
    }
    input.push({
      role: message.role === "ai" ? "assistant" : "user",
      content,
    });
  });

  return input;
}

async function callOpenAI(conversationId) {
  const activeApiProfile = getActiveApiProfile();
  return executeProfileRequest(activeApiProfile, conversationId);
}

function receiveMessage(conversationId, responseText) {
  appendMessage(
    conversationId,
    createMessage({
      role: "ai",
      text: responseText,
      timestamp: formatLocalTime(),
      status: "delivered",
      metaType: "assistant",
    }),
  );
}

async function requestAIResponse(conversationId, messageId) {
  appState.isReplyPending = true;
  addTypingMessage(conversationId);
  render();

  try {
    const replyText = await callOpenAI(conversationId);
    removeTypingMessage(conversationId);
    updateMessage(conversationId, messageId, (message) => ({
      ...message,
      failed: false,
      retrying: false,
      status: "read",
      errorMessage: "",
    }));
    receiveMessage(conversationId, replyText);
  } catch (error) {
    removeTypingMessage(conversationId);
    updateMessage(conversationId, messageId, (message) => ({
      ...message,
      failed: true,
      retrying: false,
      status: "failed",
      errorMessage: summarizeApiError(error),
    }));
  } finally {
    appState.isReplyPending = false;
    render();
  }
}

async function sendMessage(conversationId, draft = appState.draftMessage, attachment = appState.pendingAttachment, retryMessageId = "") {
  const profile = getProfile(conversationId);
  if (!profile || profile.isBlocked || appState.isReplyPending) {
    return;
  }

  let targetMessageId = retryMessageId;

  if (!retryMessageId) {
    const trimmedText = draft.trim();
    if (!trimmedText && !attachment?.dataUrl) {
      return;
    }

    const outgoingPayload = {
      text: trimmedText,
      imageDataUrl: attachment?.dataUrl || "",
      imageName: attachment?.name || "",
    };

    const outgoingMessage = createMessage({
      role: "user",
      text: trimmedText,
      imageDataUrl: attachment?.dataUrl || "",
      timestamp: formatLocalTime(),
      status: "sent",
      attempts: 1,
      requestPayload: outgoingPayload,
      metaType: "user",
    });

    appendMessage(conversationId, outgoingMessage);
    targetMessageId = outgoingMessage.id;
    appState.draftMessage = "";
    appState.pendingAttachment = null;
    render();
  } else {
    updateMessage(conversationId, retryMessageId, (message) => ({
      ...message,
      failed: false,
      retrying: true,
      status: "sent",
      attempts: (message.attempts || 0) + 1,
      errorMessage: "",
    }));
    render();
  }

  await requestAIResponse(conversationId, targetMessageId);
}

function findMessageAcrossConversations(messageId) {
  for (const [conversationId, messages] of Object.entries(persistedState.conversations)) {
    const message = messages.find((entry) => entry.id === messageId);
    if (message) {
      return { conversationId, message };
    }
  }

  return null;
}

function resendRequest(messageId) {
  const result = findMessageAcrossConversations(messageId);
  if (!result) {
    return;
  }

  sendMessage(result.conversationId, "", null, messageId);
}

function createMomentPost(characterId, text, generated = true) {
  persistedState.momentsPosts = [
    {
      id: `moment-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      characterId,
      text,
      timestamp: formatLocalTime(),
      generated,
    },
    ...(persistedState.momentsPosts || []),
  ].slice(0, 24);
  saveChatState();
}

function createBlankApiProfile(name = "") {
  const cleanName = name || "New Profile";
  const id = slugify(cleanName) || `profile-${Date.now()}`;
  return {
    id,
    name: cleanName,
    providerPreset: "openai",
    requestFormat: "openai-chat",
    apiUrl: "https://api.openai.com/v1",
    apiKey: "",
    model: "",
    availableModels: [],
    googleAiStudioMode: false,
    corsProxyUrl: "",
    lastConnectionStatus: "idle",
    lastConnectionMessage: "",
  };
}

function applyProviderPresetToProfile(profile, preset) {
  if (preset === "google") {
    return {
      ...profile,
      providerPreset: "google",
      requestFormat: "google-native",
      googleAiStudioMode: true,
      apiUrl: "https://generativelanguage.googleapis.com/v1beta",
      model: /gemini/i.test(profile.model) ? profile.model : "gemini-2.0-flash",
    };
  }

  if (preset === "anthropic") {
    return {
      ...profile,
      providerPreset: "anthropic",
      requestFormat: "anthropic",
      googleAiStudioMode: false,
      apiUrl: "https://api.anthropic.com/v1",
    };
  }

  if (preset === "local") {
    return {
      ...profile,
      providerPreset: "local",
      requestFormat: "openai-chat",
      googleAiStudioMode: false,
      apiUrl: "http://localhost:1234/v1",
    };
  }

  return {
    ...profile,
    providerPreset: "openai",
    requestFormat: "openai-chat",
    googleAiStudioMode: false,
    apiUrl: "https://api.openai.com/v1",
  };
}

function ensureApiDraft() {
  if (!appState.apiProfileDraft) {
    const active = getActiveApiProfile();
    appState.activeApiProfileId = active?.id || "";
    appState.apiProfileDraft = active ? { ...active } : createBlankApiProfile();
  }
}

function openCentralSettings(profileId = "") {
  const targetProfile = profileId ? getApiProfiles()[profileId] : getActiveApiProfile();
  appState.activeScreen = "central-settings";
  appState.apiConnectionState = { status: "idle", message: "" };
  appState.showApiKey = false;
  appState.activeApiProfileId = targetProfile?.id || "";
  appState.apiProfileDraft = targetProfile ? { ...targetProfile } : createBlankApiProfile();
}

function buildModelsEndpoint(profile) {
  const rawBase = String(profile.apiUrl || "").trim();
  const trimmedBase = rawBase.replace(/\/+$/, "");
  return trimmedBase.endsWith("/models") ? trimmedBase : `${trimmedBase}/models`;
}

function buildApiRequestConfig(profile, method = "GET", body) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (profile.providerPreset === "anthropic" || profile.requestFormat === "anthropic") {
    headers["x-api-key"] = profile.apiKey;
    headers["anthropic-version"] = "2023-06-01";
  } else if (profile.googleAiStudioMode || profile.providerPreset === "google") {
    headers["x-goog-api-key"] = profile.apiKey;
  } else {
    headers.Authorization = `Bearer ${profile.apiKey}`;
  }

  return {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
}

function buildOpenAICompatibleMessages(source) {
  const input = Array.isArray(source) ? source : buildOpenAIInput(source);
  const systemItem = input.find((item) => item.role === "system");
  const messages = [];

  if (systemItem?.content?.[0]?.text) {
    messages.push({
      role: "system",
      content: systemItem.content[0].text,
    });
  }

  input
    .filter((item) => item.role !== "system")
    .forEach((item) => {
      const content = item.content.map((entry) => {
        if (entry.type === "input_image") {
          return {
            type: "image_url",
            image_url: {
              url: entry.image_url,
            },
          };
        }

        return {
          type: "text",
          text: entry.text,
        };
      });

      messages.push({
        role: item.role,
        content,
      });
    });

  return messages;
}

function buildGoogleCompatibleMessages(source) {
  const input = Array.isArray(source) ? source : buildOpenAIInput(source);
  const systemText = input.find((item) => item.role === "system")?.content?.[0]?.text || "";
  const contents = [];

  input
    .filter((item) => item.role !== "system")
    .forEach((item) => {
      const textParts = item.content
        .filter((entry) => entry.type === "input_text" && entry.text)
        .map((entry) => entry.text.trim())
        .filter(Boolean);

      const imageParts = item.content.filter((entry) => entry.type === "input_image");
      const parts = [];

      if (textParts.length) {
        parts.push({ text: textParts.join("\n\n") });
      }

      if (imageParts.length) {
        imageParts.forEach((entry) => {
          const [header, data] = String(entry.image_url || "").split(",");
          const mediaTypeMatch = header.match(/data:(.*?);base64/);
          parts.push({
            inline_data: {
              mime_type: mediaTypeMatch?.[1] || "image/png",
              data: data || "",
            },
          });
        });
      }

      contents.push({
        role: item.role === "assistant" ? "model" : "user",
        parts: parts.length ? parts : [{ text: " " }],
      });
    });

  return {
    system_instruction: systemText
      ? {
          parts: [{ text: systemText }],
        }
      : undefined,
    contents,
  };
}

function buildAnthropicMessages(source) {
  const input = Array.isArray(source) ? source : buildOpenAIInput(source);
  const systemItem = input.find((item) => item.role === "system");
  const messages = [];

  input
    .filter((item) => item.role !== "system")
    .forEach((item) => {
      const content = item.content.map((entry) => {
        if (entry.type === "input_image") {
          const [header, data] = String(entry.image_url || "").split(",");
          const mediaTypeMatch = header.match(/data:(.*?);base64/);
          return {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaTypeMatch?.[1] || "image/png",
              data: data || "",
            },
          };
        }

        return {
          type: "text",
          text: entry.text,
        };
      });

      messages.push({
        role: item.role === "assistant" ? "assistant" : "user",
        content,
      });
    });

  return {
    system: systemItem?.content?.[0]?.text || "",
    messages,
  };
}

function normalizeGoogleModelName(model) {
  const raw = String(model || "").trim();
  if (!raw) {
    return "";
  }

  const cleaned = raw
    .replace(/^https?:\/\/[^/]+\//, "")
    .replace(/^v\d+(beta)?\//i, "")
    .replace(/^publishers\/[^/]+\//, "")
    .replace(/^models\//, "")
    .replace(/^tunedModels\//, "")
    .trim();

  if (!cleaned.includes("/")) {
    return cleaned;
  }

  return cleaned.split("/").filter(Boolean).pop() || cleaned;
}

function normalizeGoogleBaseUrl(url) {
  const raw = String(url || "").trim().replace(/\/+$/, "");
  if (!raw) {
    return "https://generativelanguage.googleapis.com/v1beta";
  }
  if (/generativelanguage\.googleapis\.com/i.test(raw)) {
    return raw.replace(/\/openai$/i, "");
  }
  return raw;
}

function extractAssistantText(data, profile) {
  if (profile.requestFormat === "anthropic" || profile.providerPreset === "anthropic") {
    const textParts = (data.content || [])
      .filter((item) => item.type === "text" && item.text)
      .map((item) => item.text.trim())
      .filter(Boolean);
    return textParts.join("\n\n").trim();
  }

  if (profile.providerPreset === "google" || data.candidates) {
    const candidate = data.candidates?.[0];
    if (candidate?.finishReason === "SAFETY") {
      throw new Error("The model declined to respond due to safety filters. Try rephrasing your message.");
    }
    if (candidate?.content?.parts) {
      return candidate.content.parts.map((p) => p.text || "").join("").trim();
    }
    return "";
  }

  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  if (data.choices?.[0]?.message) {
    const message = data.choices[0].message;
    if (typeof message.content === "string" && message.content.trim()) {
      return message.content.trim();
    }
    if (Array.isArray(message.content)) {
      const parts = message.content
        .map((item) => item.text || item.content || "")
        .filter(Boolean)
        .join("\n\n")
        .trim();
      if (parts) {
        return parts;
      }
    }
  }

  for (const outputItem of data.output || []) {
    for (const contentItem of outputItem.content || []) {
      if (typeof contentItem.text === "string" && contentItem.text.trim()) {
        return contentItem.text.trim();
      }
    }
  }

  return "";
}

function summarizeApiError(error, responseText = "") {
  const raw = String(responseText || error?.message || "").trim();

  if (!raw && error?.name === "TypeError") {
    return "Network request failed. This is often a CORS issue or an unreachable API URL.";
  }

  if (/failed to fetch|load failed|networkerror|network request failed/i.test(raw)) {
    return "Network request failed. Check the API URL, CORS proxy, or browser blocking.";
  }

  try {
    const parsed = JSON.parse(raw);
    const nested =
      parsed?.error?.message ||
      parsed?.error?.details ||
      parsed?.message ||
      parsed?.detail ||
      parsed?.details;
    if (nested) {
      return String(nested);
    }
  } catch (_error) {
    // Keep the original string if it is not JSON.
  }

  return raw.replace(/^Error:\s*/i, "").slice(0, 220) || "Request failed.";
}

function buildTestInput(profile) {
  const systemText =
    `${profile.characterPrompt || profile.worldbook || "You are a soft, affectionate AI character in a love-chat app."}\n\n` +
    `Reply in character, warmly and briefly, like a believable romantic chat partner.`;

  return [
    {
      role: "system",
      content: [{ type: "input_text", text: systemText }],
    },
    {
      role: "user",
      content: [{ type: "input_text", text: "Send one short in-character test reply so I know this profile works." }],
    },
  ];
}

async function executeProfileRequest(profile, sourceInput) {
  if (!profile?.apiKey) {
    throw new Error("Add an API profile and key in the central Settings app first.");
  }

  const baseUrl =
    profile.providerPreset === "google"
      ? normalizeGoogleBaseUrl(profile.apiUrl)
      : String(profile.apiUrl || "").trim().replace(/\/+$/, "");
  let endpoint = "";
  let requestBody = {};

  if (profile.providerPreset === "google") {
    const model = normalizeGoogleModelName(profile.model || "gemini-2.0-flash");
    endpoint = `${baseUrl}/models/${encodeURIComponent(model)}:generateContent`;
    requestBody = {
      ...buildGoogleCompatibleMessages(sourceInput),
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
      ],
      generationConfig: { maxOutputTokens: 1024 },
    };
  } else if (profile.requestFormat === "anthropic" || profile.providerPreset === "anthropic") {
    endpoint = `${baseUrl}/messages`;
    requestBody = {
      model: profile.model || "claude-3-5-sonnet-latest",
      max_tokens: 1024,
      ...buildAnthropicMessages(sourceInput),
    };
  } else {
    endpoint = `${baseUrl}/chat/completions`;
    requestBody = {
      model: profile.model || "gpt-4.1-mini",
      messages: buildOpenAICompatibleMessages(sourceInput),
    };
  }

  if (profile.corsProxyUrl) {
    endpoint = `${profile.corsProxyUrl.replace(/\/+$/, "")}/${endpoint}`;
  }

  const response = await fetch(endpoint, buildApiRequestConfig(profile, "POST", requestBody));
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(summarizeApiError(null, errorText || `Request failed with ${response.status}`));
  }

  const data = await response.json();
  const assistantText = extractAssistantText(data, profile);
  if (!assistantText) {
    throw new Error("The model returned an empty response.");
  }

  return assistantText;
}

async function fetchModelsForDraft() {
  ensureApiDraft();
  const profile = appState.apiProfileDraft;
  if (!profile.apiUrl || !profile.apiKey) {
    appState.apiConnectionState = {
      status: "error",
      message: "Add the API URL and API key before fetching models.",
    };
    render();
    return;
  }

  appState.apiConnectionState = {
    status: "loading",
    message: "Fetching available models...",
  };
  render();

  try {
    let data = null;
    let response = null;
    const endpoint = buildModelsEndpoint(profile);

    if (profile.providerPreset === "google" || profile.googleAiStudioMode) {
      const nativeGoogleEndpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(profile.apiKey)}`;
      response = await fetch(nativeGoogleEndpoint);
      if (response.ok) {
        data = await response.json();
      }
    }

    if (!data) {
      response = await fetch(endpoint, buildApiRequestConfig(profile));
      if (!response.ok) {
        if (profile.providerPreset === "anthropic") {
          appState.apiProfileDraft = {
            ...profile,
            availableModels: ["claude-3-5-sonnet-latest", "claude-3-7-sonnet-latest"],
            model: profile.model || "claude-3-5-sonnet-latest",
            lastConnectionStatus: "success",
            lastConnectionMessage: "Anthropic profile saved. Using built-in Claude model suggestions.",
          };
          appState.apiConnectionState = {
            status: "success",
            message: appState.apiProfileDraft.lastConnectionMessage,
          };
          render();
          return;
        }
        const errorText = await response.text();
        throw new Error(errorText || `Model fetch failed with ${response.status}`);
      }
      data = await response.json();
    }

    const modelItems = Array.isArray(data.data)
      ? data.data
      : Array.isArray(data.models)
        ? data.models
        : Array.isArray(data?.models)
          ? data.models
          : Array.isArray(data?.data?.models)
            ? data.data.models
            : Array.isArray(data?.models)
              ? data.models
              : [];
    const fallbackGoogleModels = Array.isArray(data?.models) ? data.models : [];
    const normalizedItems = modelItems.length ? modelItems : fallbackGoogleModels;
    const availableModels = normalizedItems
      .map((item) => {
        const rawModel = item.id || item.name || item.model || item.displayName;
        return profile.providerPreset === "google" || profile.googleAiStudioMode
          ? normalizeGoogleModelName(rawModel)
          : rawModel;
      })
      .filter(Boolean)
      .filter((model) => !/embedding|tts|image|aqa/i.test(model));

    if (!availableModels.length && profile.providerPreset === "anthropic") {
      availableModels.push("claude-3-5-sonnet-latest", "claude-3-7-sonnet-latest");
    }

    appState.apiProfileDraft = {
      ...profile,
      availableModels,
      model: profile.model || availableModels[0] || "",
      lastConnectionStatus: "success",
      lastConnectionMessage: availableModels.length ? "Connection successful. Models fetched." : "Connection succeeded but no models were returned.",
    };
    appState.apiConnectionState = {
      status: "success",
      message: appState.apiProfileDraft.lastConnectionMessage,
    };
  } catch (error) {
    const message = /cors/i.test(String(error.message || ""))
      ? "Fetch failed. This may be a CORS issue. Add a proxy URL or disable browser security for local testing."
      : error.message || "Unable to fetch models.";
    appState.apiConnectionState = {
      status: "error",
      message,
    };
    appState.apiProfileDraft = {
      ...profile,
      lastConnectionStatus: "error",
      lastConnectionMessage: message,
    };
  }

  render();
}

function maybeSimulateCharacterActivity() {
  Object.values(persistedState.characterProfiles).forEach((profile) => {
    if (!profile.isVisible) {
      return;
    }

    if (profile.isBlocked) {
      if (Math.random() <= 0.1) {
        appendMessage(
          profile.id,
          createMessage({
            role: "ai",
            text: messagesConfig.distressedMessages[Math.floor(Math.random() * messagesConfig.distressedMessages.length)],
            timestamp: formatLocalTime(),
            status: "delivered",
            metaType: "distressed",
          }),
        );
        if (appState.activeConversationId === profile.id && appState.messagesView === "chat") {
          render();
        }
      }
      return;
    }

    if (!profile.proactiveMessaging) {
      return;
    }

    const isActiveChat = appState.activeScreen === "messages" && appState.messagesView === "chat" && appState.activeConversationId === profile.id;
    if (!isActiveChat || appState.isReplyPending) {
      if (profile.momentsPosting && Math.random() <= frequencyChance(profile.momentsFrequency || "low") * 0.3) {
        const bucket = messagesConfig.generatedMoments[profile.momentsFrequency] || messagesConfig.generatedMoments.low;
        createMomentPost(profile.id, bucket[Math.floor(Math.random() * bucket.length)]);
        if (appState.activeMessagesTab === "moments" && appState.activeScreen === "messages") {
          render();
        }
      }
      return;
    }

    if (Math.random() <= frequencyChance(profile.messageFrequency)) {
      const bucket = messagesConfig.spontaneousMessages[profile.messageFrequency] || messagesConfig.spontaneousMessages.medium;
      appendMessage(
        profile.id,
        createMessage({
          role: "ai",
          text: bucket[Math.floor(Math.random() * bucket.length)],
          timestamp: formatLocalTime(),
          status: "delivered",
          metaType: "spontaneous",
        }),
      );
      render();
    }

    if (profile.momentsPosting && Math.random() <= frequencyChance(profile.momentsFrequency || "low") * 0.35) {
      const bucket = messagesConfig.generatedMoments[profile.momentsFrequency] || messagesConfig.generatedMoments.low;
      createMomentPost(profile.id, bucket[Math.floor(Math.random() * bucket.length)]);
    }
  });
}

function startSimulationLoop() {
  if (simulationLoopId) {
    window.clearInterval(simulationLoopId);
  }

  simulationLoopId = window.setInterval(maybeSimulateCharacterActivity, SIMULATION_INTERVAL_MS);
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
  const visibleProfiles = Object.values(persistedState.characterProfiles).filter((profile) => profile.isVisible);

  const rows = visibleProfiles.map((profile) => {
    const lastMessage = latestVisibleMessage(profile.id);
    return `
      <div class="chat-row">
        <button type="button" class="chat-row-main" data-action="open-chat" data-conversation="${profile.id}">
          <div class="chat-avatar">
            ${imageMarkup(profile.avatar, `${profile.name} avatar`, "h-full w-full", "AV")}
          </div>
          <div class="chat-copy">
            <div class="chat-name-row">
              <span class="chat-name">${profile.name}</span>
              <span class="chat-time">${lastMessage?.timestamp || ""}</span>
            </div>
            <div class="chat-preview">${messagePreview(lastMessage) || profile.subtitle || "Start the conversation…"}</div>
          </div>
        </button>
        <button type="button" class="chat-delete" data-action="clear-chat" data-profile-id="${profile.id}" aria-label="Clear chat">
          ${iconSvg("delete")}
        </button>
      </div>
    `;
  });

  return `
    <div class="messages-pane">
      ${renderMessagesHeader("Chats")}
      <div class="chat-rows-list">
        ${
          rows.length
            ? rows.join("")
            : `
              <div class="messages-empty messages-empty-card">
                <div class="messages-empty-title">No chats yet</div>
                <p>Create or restore a character to start a conversation.</p>
              </div>
            `
        }
      </div>
    </div>
  `;
}

function renderContactsTab() {
  const visibleProfiles = Object.values(persistedState.characterProfiles).filter((profile) => profile.isVisible);

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
      <button type="button" class="contacts-add-button" data-action="create-character" aria-label="Create new character">
        <span class="contacts-add-icon">+</span>
        <span>Create Character</span>
      </button>
      <section class="messages-list-card">
        ${
          visibleProfiles.length
            ? visibleProfiles
                .map(
                  (profile) => `
                    <div class="contact-card contact-card--interactive" data-action="open-character-editor" data-profile-id="${profile.id}">
                      <div class="contact-card-avatar">
                        ${imageMarkup(profile.avatar, `${profile.name} avatar`, "h-full w-full", "AV")}
                      </div>
                      <div class="contact-card-copy">
                        <div class="contact-card-title-row">
                          <h3>${profile.name}</h3>
                          <span class="contact-tag">${profile.messageFrequency.toUpperCase()}</span>
                          ${profile.isBlocked ? '<span class="contact-tag">Blocked</span>' : '<span class="contact-tag">AI</span>'}
                        </div>
                      </div>
                      <div class="contact-card-actions">
                        <button type="button" class="contact-icon-button" data-action="open-chat" data-conversation="${profile.id}" aria-label="Open chat">
                          ${iconSvg("pencil")}
                        </button>
                        <button type="button" class="contact-icon-button" data-action="delete-sample" data-profile-id="${profile.id}" aria-label="Delete sample contact">
                          ${iconSvg("delete")}
                        </button>
                      </div>
                    </div>
                  `,
                )
                .join("")
            : `
              <div class="messages-empty">
                <div class="messages-empty-title">No contacts yet</div>
                <p>Create a character to get started.</p>
              </div>
            `
        }
      </section>
    </div>
  `;
}

function renderCharacterEditorScreen() {
  const profileId = currentCharacterEditorId();
  const draft = appState.characterDraft || getProfile(profileId);

  return `
    <div class="messages-pane">
      <div class="messages-header">
        <button type="button" class="messages-back" data-action="close-character-editor" aria-label="Back to contacts">
          ${iconSvg("back")}
        </button>
        <div class="messages-header-title">Character Editor</div>
        <div class="messages-header-spacer"></div>
      </div>

      <section class="character-editor-hero">
        <div class="character-editor-avatar">
          ${imageMarkup(draft.avatar, `${draft.name} avatar`, "h-full w-full", "AV")}
        </div>
        <div class="character-editor-copy">
          <h2>${draft.name}</h2>
          <p>${draft.aiNickname || draft.name}</p>
        </div>
      </section>

      <input type="file" accept="image/*" hidden data-role="character-avatar-input" />

      <section class="character-editor-group">
        <button type="button" class="character-avatar-button" data-action="pick-character-avatar">
          <span class="chat-settings-row-title">Change Profile Picture</span>
          <span class="chat-settings-row-detail">Upload a local image to use as this character's avatar throughout the app.</span>
        </button>
      </section>

      <section class="character-editor-group">
        <label class="chat-settings-stack-row">
          <span class="chat-settings-row-title">Display Name</span>
          <input type="text" class="chat-settings-text-input" data-role="character-display-name-input" value="${escapeAttribute(draft.name)}" />
        </label>
        <label class="chat-settings-stack-row">
          <span class="chat-settings-row-title">AI Nickname</span>
          <input type="text" class="chat-settings-text-input" data-role="character-ai-nickname-input" value="${escapeAttribute(draft.aiNickname || "")}" />
        </label>
      </section>

      <section class="character-editor-group">
        <label class="chat-settings-stack-row">
          <span class="chat-settings-row-title">Character Prompt</span>
          <span class="chat-settings-row-detail">Lore, tone, texting habits, and personality. Example: a grumpy cat who loves snacks.</span>
          <textarea class="chat-settings-textarea character-editor-textarea" data-role="character-prompt-input">${draft.characterPrompt || draft.worldbook || ""}</textarea>
        </label>
      </section>

      <section class="character-editor-group">
        ${renderToggleField("Enable Specific Global Wordbook", "character-global-wordbook-toggle", !!draft.useGlobalWordbook, persistedState.appSettings.globalWordbook?.trim() ? "This character will also follow the Global Wordbook from AI Settings." : "Add a Global Wordbook in AI Settings to use this.")}
      </section>

      <div class="character-editor-fixed-note">
        <h3>Hidden Fixed Prompt</h3>
        <p>The app always prepends a private texting-style system instruction before the global wordbook, this character prompt, chat memory, and your new message.</p>
      </div>

      <button type="button" class="character-save-button" data-action="save-character">Save Character</button>
    </div>
  `;
}

function renderMomentsTab() {
  const profile = getProfile("angel-bunny");
  const posts = (persistedState.momentsPosts || []).filter((post) => post.characterId === "angel-bunny");

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
            ${imageMarkup(profile.avatar, `${profile.name} profile`, "h-full w-full", "AV")}
          </div>
        </div>
      </div>
      <div class="moments-feed">
        <div class="moments-divider">
          <span>${messagesConfig.moments.coverBadge}</span>
        </div>
        ${posts
          .map(
            (post) => `
              <article class="moment-card" data-post-id="${post.id}">
                <div class="moment-card-meta">${post.generated ? "Character update" : "Pinned note"} · ${post.timestamp}</div>
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

function renderConnectionBadge() {
  const state = appState.apiConnectionState;
  if (state.status === "success") {
    return `<div class="api-feedback-badge is-success"><span>✓</span><span>${state.message}</span></div>`;
  }
  if (state.status === "error") {
    return `<div class="api-feedback-badge is-error"><span>!</span><span>${state.message}</span></div>`;
  }
  if (state.status === "loading") {
    return `<div class="api-feedback-badge"><span>…</span><span>${state.message}</span></div>`;
  }
  return "";
}

function renderCentralSettingsScreen() {
  ensureApiDraft();
  const draft = appState.apiProfileDraft;
  const profiles = Object.values(getApiProfiles());
  const modelOptions = draft.availableModels || [];
  const activeProfile = getActiveApiProfile();

  return `
    <div class="phone-shell">
      <div class="shell-inner">
        ${renderStatusBar()}
        <div class="messages-app">
          <div class="messages-pane central-settings-pane">
            <div class="messages-header">
              <button type="button" class="messages-back" data-action="go-home" aria-label="Back to home">
                ${iconSvg("back")}
              </button>
              <div class="messages-header-title">AI Settings</div>
              <div class="messages-header-spacer"></div>
            </div>

            <section class="central-settings-hero">
              <div class="central-settings-hero-title">This is the engine for your love-chat app.</div>
              <p>The active profile below powers every AI character, every reply, and every generated Moment across the app.</p>
            </section>

            <section class="central-settings-top-card">
              <div class="central-settings-top-label">Active Profile</div>
              <div class="central-settings-top-row">
                <select class="central-settings-profile-select" data-role="active-api-profile-select">
                  ${profiles
                    .map(
                      (profile) =>
                        `<option value="${profile.id}" ${profile.id === (appState.activeApiProfileId || persistedState.appSettings.activeApiProfileId) ? "selected" : ""}>${profile.name}</option>`,
                    )
                    .join("")}
                </select>
                <button type="button" class="central-settings-mini-button" data-action="new-api-profile">New</button>
              </div>
              <div class="central-settings-active-note">
                ${activeProfile?.name || "No active profile selected"} will be used automatically when a character sends or replies.
              </div>
            </section>

            <section class="central-settings-section">
              <div class="chat-settings-section-header">
                ${settingsSectionIcon("api")}
                <h3>API Profile Management</h3>
              </div>
              <div class="chat-settings-card">
                <label class="chat-settings-stack-row">
                  <span class="chat-settings-row-title">Profile Name</span>
                  <input type="text" class="chat-settings-text-input" data-role="api-profile-name-input" value="${escapeAttribute(draft.name)}" placeholder="OpenAI, Gemini Pro, Local LLM..." />
                </label>
                <label class="chat-settings-row">
                  <span class="chat-settings-row-copy">
                    <span class="chat-settings-row-title">Provider Preset</span>
                    <span class="chat-settings-row-detail">Auto-fills common endpoint shapes.</span>
                  </span>
                  <select class="chat-settings-inline-select" data-role="provider-preset-select">
                    <option value="openai" ${draft.providerPreset === "openai" ? "selected" : ""}>OpenAI</option>
                    <option value="google" ${draft.providerPreset === "google" ? "selected" : ""}>Google AI Studio</option>
                    <option value="anthropic" ${draft.providerPreset === "anthropic" ? "selected" : ""}>Claude / Anthropic</option>
                    <option value="local" ${draft.providerPreset === "local" ? "selected" : ""}>Local LLM</option>
                  </select>
                </label>
                ${renderToggleField("Google AI Studio Mode", "google-mode-toggle", draft.googleAiStudioMode, "Uses Gemini's native v1beta generateContent route with x-goog-api-key.")}
              </div>
            </section>

            <section class="central-settings-section">
              <div class="chat-settings-section-header">
                ${settingsSectionIcon("memory")}
                <h3>Global Wordbook</h3>
              </div>
              <div class="chat-settings-card">
                <label class="chat-settings-stack-row">
                  <span class="chat-settings-row-title">Shared Wordbook</span>
                  <span class="chat-settings-row-detail">Characters with the Global Wordbook toggle on will receive this before their own character prompt.</span>
                  <textarea class="chat-settings-textarea" data-role="global-wordbook-input">${persistedState.appSettings.globalWordbook || ""}</textarea>
                </label>
              </div>
            </section>

            <section class="central-settings-section">
              <div class="chat-settings-section-header">
                ${settingsSectionIcon("memory")}
                <h3>Connection</h3>
              </div>
              <div class="chat-settings-card">
                <label class="chat-settings-stack-row">
                  <span class="chat-settings-row-title">API URL</span>
                  <span class="chat-settings-row-detail">OpenAI-style providers usually end in /v1. Anthropic uses /v1. Google mode uses the native Gemini v1beta base URL automatically.</span>
                  <input type="text" class="chat-settings-text-input" data-role="api-url-input" value="${escapeAttribute(draft.apiUrl)}" placeholder="https://api.openai.com/v1" />
                </label>
                <label class="chat-settings-stack-row">
                  <span class="chat-settings-row-title">API Key</span>
                  <div class="central-settings-password-row">
                    <input type="${appState.showApiKey ? "text" : "password"}" class="chat-settings-text-input" data-role="api-key-input" value="${escapeAttribute(draft.apiKey)}" placeholder="sk-..." />
                    <button type="button" class="central-settings-eye" data-action="toggle-api-key-visibility" aria-label="Toggle API key visibility">
                      ${iconSvg(appState.showApiKey ? "eyeOff" : "eye")}
                    </button>
                  </div>
                </label>
                <label class="chat-settings-stack-row">
                  <span class="chat-settings-row-title">Model Selector</span>
                  <span class="chat-settings-row-detail">Fetch once, then all characters can use this engine immediately.</span>
                  <div class="central-settings-model-row">
                    <select class="chat-settings-inline-select central-settings-model-select" data-role="api-model-select">
                      <option value="">${modelOptions.length ? "Select a model" : "Fetch models first"}</option>
                      ${modelOptions
                        .map((model) => `<option value="${escapeAttribute(model)}" ${draft.model === model ? "selected" : ""}>${model}</option>`)
                        .join("")}
                    </select>
                    <button type="button" class="central-settings-mini-button" data-action="fetch-models">Fetch Models</button>
                  </div>
                </label>
                <div class="central-settings-inline-actions">
                  <button type="button" class="central-settings-mini-button central-settings-test" data-action="test-api-profile">Test Reply</button>
                </div>
                <label class="chat-settings-stack-row">
                  <span class="chat-settings-row-title">CORS Proxy URL</span>
                  <span class="chat-settings-row-detail">Optional. Use this if your browser blocks direct model fetches.</span>
                  <input type="text" class="chat-settings-text-input" data-role="cors-proxy-input" value="${escapeAttribute(draft.corsProxyUrl)}" placeholder="https://your-proxy.example.com" />
                </label>
              </div>
            </section>

            ${renderConnectionBadge()}

            <section class="central-settings-note">
              <p>If model fetching fails with CORS in the browser, add a proxy URL here or disable browser security for local testing.</p>
            </section>

            <section class="central-settings-actions">
              <button type="button" class="central-settings-save" data-action="save-api-profile">Save Profile</button>
              <button type="button" class="central-settings-delete" data-action="delete-api-profile" ${profiles.length <= 1 ? "disabled" : ""}>Delete Profile</button>
            </section>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderTypingBubble(profile) {
  return `
    <div class="message-row message-row--ai">
      <div class="message-avatar">
        ${imageMarkup(profile.avatar, `${profile.name} avatar`, "h-full w-full", "AV")}
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

function renderMessage(conversationId, message) {
  const profile = getProfile(conversationId);
  if (message.typing) {
    return renderTypingBubble(profile);
  }

  const isUser = message.role === "user";
  const metaText = message.failed ? "Failed" : message.status === "read" ? "Read" : "Sent";
  const errorDetail = message.failed && message.errorMessage
    ? `<div class="message-error-detail">${message.errorMessage}</div>`
    : "";
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

  const imageBlock = message.imageDataUrl
    ? `
      <div class="message-image-block">
        <img src="${escapeAttribute(message.imageDataUrl)}" alt="Uploaded attachment" class="message-inline-image" />
      </div>
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
              ${errorDetail}
              <div class="message-bubble message-bubble--user">
                ${imageBlock}
                ${message.text ? `<p>${message.text}</p>` : ""}
              </div>
            </div>
            <div class="message-avatar">
              ${imageMarkup(profile.avatar, "User avatar placeholder", "h-full w-full", "ME")}
            </div>
          `
          : `
            <div class="message-avatar">
              ${imageMarkup(profile.avatar, `${profile.name} avatar`, "h-full w-full", "AV")}
            </div>
            <div class="message-stack">
              <div class="message-bubble message-bubble--ai">
                ${imageBlock}
                ${message.text ? `<p>${message.text}</p>` : ""}
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

function renderAttachmentPreview() {
  if (!appState.pendingAttachment) {
    return "";
  }

  return `
    <div class="pending-attachment-card">
      <img src="${escapeAttribute(appState.pendingAttachment.dataUrl)}" alt="Pending upload" class="pending-attachment-thumb" />
      <div class="pending-attachment-meta">
        <span>${appState.pendingAttachment.name}</span>
        <button type="button" class="pending-attachment-remove" data-action="clear-attachment" aria-label="Remove attachment">×</button>
      </div>
    </div>
  `;
}

function renderAttachmentMenu() {
  if (!appState.attachmentMenuOpen) {
    return "";
  }

  return `
    <div class="attachment-menu">
      <button type="button" class="attachment-menu-item" data-action="pick-attachment-image">
        <span class="attachment-menu-icon">${iconSvg("image")}</span>
        <span>Image Upload</span>
      </button>
    </div>
  `;
}

function settingsSectionIcon(name) {
  const icons = {
    memory: "🧠",
    awareness: "🌐",
    proactive: "♡",
    safety: "✦",
    customize: "☁",
    api: "⌘",
  };
  return `<span class="chat-settings-section-icon" aria-hidden="true">${icons[name] || "•"}</span>`;
}

function renderToggleField(label, role, checked, helper = "", destructive = false) {
  return `
    <label class="chat-settings-row ${destructive ? "is-destructive" : ""}">
      <span class="chat-settings-row-copy">
        <span class="chat-settings-row-title">${label}</span>
        ${helper ? `<span class="chat-settings-row-detail">${helper}</span>` : ""}
      </span>
      <span class="chat-settings-switch">
        <input type="checkbox" data-role="${role}" ${checked ? "checked" : ""} />
        <span class="chat-settings-switch-track"></span>
      </span>
    </label>
  `;
}

function renderChatSettingsScreen(conversationId) {
  const profile = getProfile(conversationId);
  const wallpaperStyle = profile.chatWallpaper
    ? `style="background-image:url('${escapeAttribute(profile.chatWallpaper)}'); background-size:cover; background-position:center;"`
    : "";

  return `
    <div class="chat-settings-view">
      <input type="file" accept="image/*" hidden data-role="wallpaper-input" />
      <div class="chat-settings-surface" ${wallpaperStyle}>
        <div class="chat-settings-scrim"></div>
        <div class="chat-settings-content">
          <div class="chat-settings-header">
            <button type="button" class="messages-back" data-action="close-settings-screen" aria-label="Back to chat">
              ${iconSvg("back")}
            </button>
            <div class="chat-settings-title">Chat Settings</div>
            <div class="chat-settings-placeholder" aria-hidden="true"></div>
          </div>

          <section class="chat-settings-section">
            <div class="chat-settings-section-header">
              ${settingsSectionIcon("memory")}
              <h3>Memory & Context</h3>
            </div>
            <div class="chat-settings-card">
              <label class="chat-settings-row">
                <span class="chat-settings-row-copy">
                  <span class="chat-settings-row-title">Historical Messages Count</span>
                  <span class="chat-settings-row-detail">Default: 30 rounds</span>
                </span>
                <input type="number" min="1" max="120" class="chat-settings-inline-input" data-role="memory-count-input" value="${profile.memoryMessageCount}" />
              </label>
              ${renderToggleField("Intelligent Memory Management", "memory-management-toggle", profile.intelligentMemoryManagement, "Keep important emotional and image moments more stable.")}
              <label class="chat-settings-stack-row">
                <span class="chat-settings-row-title">Link Worldbook</span>
                <span class="chat-settings-row-detail">${(profile.characterPrompt || profile.worldbook).slice(0, 100)}${(profile.characterPrompt || profile.worldbook).length > 100 ? "..." : ""}</span>
                <textarea class="chat-settings-textarea" data-role="worldbook-input">${profile.characterPrompt || profile.worldbook}</textarea>
              </label>
            </div>
          </section>

          <section class="chat-settings-section">
            <div class="chat-settings-section-header">
              ${settingsSectionIcon("awareness")}
              <h3>Awareness</h3>
            </div>
            <div class="chat-settings-card">
              ${renderToggleField("Time Awareness", "time-awareness-toggle", profile.timeAwareness, "Lets the character react to local time and late-night mood.")}
              ${renderToggleField("Location & Weather Awareness", "weather-awareness-toggle", profile.locationWeatherAwareness, "Simulated by soft status context, not real location APIs.")}
            </div>
          </section>

          <section class="chat-settings-section">
            <div class="chat-settings-section-header">
              ${settingsSectionIcon("proactive")}
              <h3>Proactive Interaction</h3>
            </div>
            <div class="chat-settings-card">
              ${renderToggleField("Character Proactively Messages Me", "proactive-toggle", profile.proactiveMessaging, "Lets the character reach out first on its own.")}
              <label class="chat-settings-row">
                <span class="chat-settings-row-copy">
                  <span class="chat-settings-row-title">Messaging Frequency</span>
                  <span class="chat-settings-row-detail">${frequencyLabel(profile.messageFrequency)}</span>
                </span>
                <select class="chat-settings-inline-select" data-role="frequency-select">
                  <option value="low" ${profile.messageFrequency === "low" ? "selected" : ""}>Low (1-2 hours)</option>
                  <option value="medium" ${profile.messageFrequency === "medium" ? "selected" : ""}>Medium</option>
                  <option value="high" ${profile.messageFrequency === "high" ? "selected" : ""}>High</option>
                </select>
              </label>
              ${renderToggleField("Character Posts to Moments", "moments-toggle", profile.momentsPosting, "Creates real auto-posts in the Moments tab.")}
              <label class="chat-settings-row">
                <span class="chat-settings-row-copy">
                  <span class="chat-settings-row-title">Moments Posting Frequency</span>
                  <span class="chat-settings-row-detail">${frequencyLabel(profile.momentsFrequency || "low")}</span>
                </span>
                <select class="chat-settings-inline-select" data-role="moments-frequency-select">
                  <option value="low" ${(profile.momentsFrequency || "low") === "low" ? "selected" : ""}>Low (1-2 hours)</option>
                  <option value="medium" ${profile.momentsFrequency === "medium" ? "selected" : ""}>Medium</option>
                  <option value="high" ${profile.momentsFrequency === "high" ? "selected" : ""}>High</option>
                </select>
              </label>
            </div>
          </section>

          <section class="chat-settings-section">
            <div class="chat-settings-section-header">
              ${settingsSectionIcon("safety")}
              <h3>Blacklist Management</h3>
            </div>
            <div class="chat-settings-card">
              ${renderToggleField("Block / Unblock Character", "block-toggle", profile.isBlocked, "Blocked characters may still send desperate pings.", true)}
              <button type="button" class="chat-settings-row chat-settings-action is-destructive" data-action="clear-chat-records">
                <span class="chat-settings-row-copy">
                  <span class="chat-settings-row-title">Clear Chat Records</span>
                  <span class="chat-settings-row-detail">Remove this conversation only. Character settings stay saved.</span>
                </span>
                <span class="contacts-chevron">></span>
              </button>
            </div>
          </section>

          <section class="chat-settings-section">
            <div class="chat-settings-section-header">
              ${settingsSectionIcon("customize")}
              <h3>Individual Customization</h3>
            </div>
            <div class="chat-settings-card">
              <button type="button" class="chat-settings-row chat-settings-action" data-action="pick-wallpaper">
                <span class="chat-settings-row-copy">
                  <span class="chat-settings-row-title">Change Chat Wallpaper</span>
                  <span class="chat-settings-row-detail">${profile.chatWallpaper ? "Wallpaper selected" : "Choose an image from this device"}</span>
                </span>
                <span class="contacts-chevron">></span>
              </button>
              <label class="chat-settings-stack-row">
                <span class="chat-settings-row-title">Nickname</span>
                <span class="chat-settings-row-detail">What the character calls you in replies.</span>
                <input type="text" class="chat-settings-text-input" data-role="nickname-input" value="${escapeAttribute(profile.nicknameForUser)}" placeholder="My love, bunny, Maria..." />
              </label>
            </div>
          </section>

          <section class="chat-settings-section">
            <div class="chat-settings-section-header">
              ${settingsSectionIcon("api")}
              <h3>Active API Profile</h3>
            </div>
            <div class="chat-settings-card">
              <button type="button" class="chat-settings-row chat-settings-action" data-action="open-central-settings">
                <span class="chat-settings-row-copy">
                  <span class="chat-settings-row-title">${getActiveApiProfile()?.name || "No active profile"}</span>
                  <span class="chat-settings-row-detail">${getActiveApiProfile()?.apiUrl || "Open central Settings to choose the engine for all characters."} All love-chat replies use this active AI profile.</span>
                </span>
                <span class="contacts-chevron">></span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  `;
}

function renderChatComposer(conversationId) {
  const profile = getProfile(conversationId);
  const draft = appState.draftMessage;
  const disabled = profile.isBlocked;

  return `
    <div class="chat-composer-wrap">
      ${renderAttachmentPreview()}
      ${renderAttachmentMenu()}
      <div class="chat-composer ${disabled ? "is-disabled" : ""}">
        <button
          type="button"
          class="composer-icon-button ${appState.isVoiceMode ? "is-active" : ""}"
          data-action="toggle-voice"
          aria-label="Toggle voice mode"
          ${disabled ? "disabled" : ""}
        >
          ${iconSvg("voice")}
        </button>
        <div class="composer-input-shell">
          <textarea
            class="composer-textarea"
            placeholder="${disabled ? "This character is blocked" : appState.isVoiceMode ? "Voice mode ready" : "Type a message"}"
            data-role="composer-input"
            rows="1"
            ${disabled ? "disabled" : ""}
          >${draft}</textarea>
        </div>
        <button type="button" class="composer-icon-button" aria-label="Emoji picker" ${disabled ? "disabled" : ""}>
          ${iconSvg("emoji")}
        </button>
        <button type="button" class="composer-icon-button" data-action="toggle-attachment-menu" aria-label="Attachments" ${disabled ? "disabled" : ""}>
          ${iconSvg("plus")}
        </button>
        ${
          draft.trim() || appState.pendingAttachment
            ? `
              <button type="button" class="composer-send" data-action="send-message" aria-label="Send message" ${disabled ? "disabled" : ""}>
                ${iconSvg("send")}
              </button>
            `
            : ""
        }
      </div>
      ${
        disabled
          ? `<div class="composer-block-note">Input disabled while this character is blocked. They may still send distressed pings.</div>`
          : ""
      }
    </div>
  `;
}

function renderChatHeader(conversationId) {
  const profile = getProfile(conversationId);
  return `
    <div class="chat-header">
      <div class="chat-header-left">
        <button type="button" class="messages-back" data-action="close-chat" aria-label="Back to chats">
          ${iconSvg("back")}
        </button>
        <div class="chat-header-copy">
          <div class="chat-header-name">${profile.name}</div>
          <div class="chat-header-status">${currentChatStatus()}</div>
        </div>
      </div>
      <div class="chat-header-actions">
        <button type="button" class="chat-header-icon" aria-label="Video call">
          ${iconSvg("video")}
        </button>
        <button type="button" class="chat-header-icon" data-action="open-settings-screen" aria-label="More options">
          ${iconSvg("more")}
        </button>
      </div>
    </div>
  `;
}

function renderChatScreen() {
  const conversationId = currentConversationId();
  const profile = getProfile(conversationId);
  const wallpaperStyle = profile.chatWallpaper
    ? `style="background-image:url('${escapeAttribute(profile.chatWallpaper)}'); background-size:cover; background-position:center;"`
    : "";

  return `
    <div class="messages-chat-view">
      ${
        appState.chatView === "settings"
          ? renderChatSettingsScreen(conversationId)
          : `
            <input type="file" accept="image/*" hidden data-role="wallpaper-input" />
            <input type="file" accept="image/*" hidden data-role="attachment-input" />
            ${renderChatHeader(conversationId)}
            <div class="chat-surface${profile.chatWallpaper ? " has-wallpaper" : ""}" ${wallpaperStyle}>
              <div class="chat-scroll" data-role="chat-scroll">
                ${getConversation(conversationId).map((message) => renderMessage(conversationId, message)).join("")}
              </div>
            </div>
            ${renderChatComposer(conversationId)}
          `
      }
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

  if (appState.messagesView === "character-editor" && appState.characterEditorId) {
    return renderCharacterEditorScreen();
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
          ${appState.messagesView === "chat" || appState.messagesView === "character-editor" ? "" : renderMessagesTabBar()}
        </div>
      </div>
    </div>
  `;
}

function renderApp() {
  if (appState.activeScreen === "messages") {
    return renderMessagesScreen();
  }

  if (appState.activeScreen === "central-settings") {
    return renderCentralSettingsScreen();
  }

  return renderHomeScreen();
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

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function compressImageFile(file, maxDim = 1200, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fall back to raw data URL if canvas fails
      readFileAsDataUrl(file).then(resolve).catch(() => resolve(null));
    };
    img.src = objectUrl;
  });
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
    const prevDraft = appState.draftMessage || "";
    appState.draftMessage = event.target.value;
    syncHeight();
    // Only re-render when send button needs to appear/disappear
    const wasEmpty = !prevDraft.trim() && !appState.pendingAttachment;
    const isEmpty = !event.target.value.trim() && !appState.pendingAttachment;
    if (wasEmpty !== isEmpty) {
      const cursorPos = event.target.selectionStart;
      render();
      // Restore focus and cursor position after re-render
      const newTextarea = root.querySelector("[data-role='composer-input']");
      if (newTextarea) {
        newTextarea.focus();
        newTextarea.setSelectionRange(cursorPos, cursorPos);
      }
    }
  });

  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(currentConversationId());
    }
  });

  syncHeight();
}

function mountSettingsInputs(root) {
  const activeApiProfileSelect = root.querySelector("[data-role='active-api-profile-select']");
  const apiProfileNameInput = root.querySelector("[data-role='api-profile-name-input']");
  const providerPresetSelect = root.querySelector("[data-role='provider-preset-select']");
  const googleModeToggle = root.querySelector("[data-role='google-mode-toggle']");
  const apiUrlInput = root.querySelector("[data-role='api-url-input']");
  const corsProxyInput = root.querySelector("[data-role='cors-proxy-input']");
  const apiModelSelect = root.querySelector("[data-role='api-model-select']");
  const globalWordbookInput = root.querySelector("[data-role='global-wordbook-input']");
  const worldbookInput = root.querySelector("[data-role='worldbook-input']");
  const memoryCountInput = root.querySelector("[data-role='memory-count-input']");
  const memoryManagementToggle = root.querySelector("[data-role='memory-management-toggle']");
  const timeAwarenessToggle = root.querySelector("[data-role='time-awareness-toggle']");
  const weatherAwarenessToggle = root.querySelector("[data-role='weather-awareness-toggle']");
  const proactiveToggle = root.querySelector("[data-role='proactive-toggle']");
  const frequencySelect = root.querySelector("[data-role='frequency-select']");
  const momentsToggle = root.querySelector("[data-role='moments-toggle']");
  const momentsFrequencySelect = root.querySelector("[data-role='moments-frequency-select']");
  const blockToggle = root.querySelector("[data-role='block-toggle']");
  const nicknameInput = root.querySelector("[data-role='nickname-input']");
  const characterDisplayNameInput = root.querySelector("[data-role='character-display-name-input']");
  const characterAiNicknameInput = root.querySelector("[data-role='character-ai-nickname-input']");
  const characterPromptInput = root.querySelector("[data-role='character-prompt-input']");
  const characterGlobalWordbookToggle = root.querySelector("[data-role='character-global-wordbook-toggle']");
  const apiKeyInput = root.querySelector("[data-role='api-key-input']");

  if (activeApiProfileSelect) {
    activeApiProfileSelect.addEventListener("change", (event) => {
      const nextProfile = getApiProfiles()[event.target.value];
      if (!nextProfile) {
        return;
      }
      persistedState.appSettings.activeApiProfileId = nextProfile.id;
      saveChatState();
      appState.activeApiProfileId = nextProfile.id;
      appState.apiProfileDraft = { ...nextProfile };
      appState.apiConnectionState = {
        status: nextProfile.lastConnectionStatus || "idle",
        message: nextProfile.lastConnectionMessage || "",
      };
      render();
    });
  }

  if (apiProfileNameInput) {
    apiProfileNameInput.addEventListener("input", (event) => {
      ensureApiDraft();
      appState.apiProfileDraft = {
        ...appState.apiProfileDraft,
        name: event.target.value,
      };
    });
  }

  if (providerPresetSelect) {
    providerPresetSelect.addEventListener("change", (event) => {
      ensureApiDraft();
      appState.apiProfileDraft = applyProviderPresetToProfile(appState.apiProfileDraft, event.target.value);
      render();
    });
  }

  if (googleModeToggle) {
    googleModeToggle.addEventListener("change", (event) => {
      ensureApiDraft();
      const nextDraft = {
        ...appState.apiProfileDraft,
        googleAiStudioMode: event.target.checked,
      };
      appState.apiProfileDraft = event.target.checked
        ? {
            ...nextDraft,
            providerPreset: "google",
            requestFormat: "google-native",
            apiUrl: "https://generativelanguage.googleapis.com/v1beta",
            model: /gemini/i.test(nextDraft.model) ? nextDraft.model : "gemini-2.0-flash",
          }
        : nextDraft;
      render();
    });
  }

  if (apiUrlInput) {
    apiUrlInput.addEventListener("input", (event) => {
      ensureApiDraft();
      appState.apiProfileDraft = {
        ...appState.apiProfileDraft,
        apiUrl: event.target.value,
      };
    });
  }

  if (globalWordbookInput) {
    globalWordbookInput.addEventListener("input", (event) => {
      persistedState.appSettings.globalWordbook = event.target.value;
      saveChatState();
    });
  }

  if (corsProxyInput) {
    corsProxyInput.addEventListener("input", (event) => {
      ensureApiDraft();
      appState.apiProfileDraft = {
        ...appState.apiProfileDraft,
        corsProxyUrl: event.target.value,
      };
    });
  }

  if (memoryCountInput) {
    memoryCountInput.addEventListener("input", (event) => {
      const nextValue = Math.min(120, Math.max(1, Number(event.target.value) || 30));
      updateProfile(currentConversationId(), { memoryMessageCount: nextValue });
    });
  }

  if (memoryManagementToggle) {
    memoryManagementToggle.addEventListener("change", (event) => {
      updateProfile(currentConversationId(), { intelligentMemoryManagement: event.target.checked });
    });
  }

  if (worldbookInput) {
    worldbookInput.addEventListener("input", (event) => {
      updateProfile(currentConversationId(), { worldbook: event.target.value, characterPrompt: event.target.value });
    });
  }

  if (timeAwarenessToggle) {
    timeAwarenessToggle.addEventListener("change", (event) => {
      updateProfile(currentConversationId(), { timeAwareness: event.target.checked });
    });
  }

  if (weatherAwarenessToggle) {
    weatherAwarenessToggle.addEventListener("change", (event) => {
      updateProfile(currentConversationId(), { locationWeatherAwareness: event.target.checked });
    });
  }

  if (proactiveToggle) {
    proactiveToggle.addEventListener("change", (event) => {
      updateProfile(currentConversationId(), { proactiveMessaging: event.target.checked });
    });
  }

  if (frequencySelect) {
    frequencySelect.addEventListener("change", (event) => {
      updateProfile(currentConversationId(), { messageFrequency: event.target.value });
    });
  }

  if (momentsToggle) {
    momentsToggle.addEventListener("change", (event) => {
      updateProfile(currentConversationId(), { momentsPosting: event.target.checked });
    });
  }

  if (momentsFrequencySelect) {
    momentsFrequencySelect.addEventListener("change", (event) => {
      updateProfile(currentConversationId(), { momentsFrequency: event.target.value });
    });
  }

  if (blockToggle) {
    blockToggle.addEventListener("change", (event) => {
      updateProfile(currentConversationId(), { isBlocked: event.target.checked });
      render();
    });
  }

  if (nicknameInput) {
    nicknameInput.addEventListener("input", (event) => {
      updateProfile(currentConversationId(), { nicknameForUser: event.target.value });
    });
  }

  if (characterDisplayNameInput) {
    characterDisplayNameInput.addEventListener("input", (event) => {
      appState.characterDraft = {
        ...(appState.characterDraft || getProfile(currentCharacterEditorId())),
        name: event.target.value,
      };
    });
  }

  if (characterAiNicknameInput) {
    characterAiNicknameInput.addEventListener("input", (event) => {
      appState.characterDraft = {
        ...(appState.characterDraft || getProfile(currentCharacterEditorId())),
        aiNickname: event.target.value,
      };
    });
  }

  if (characterPromptInput) {
    characterPromptInput.addEventListener("input", (event) => {
      appState.characterDraft = {
        ...(appState.characterDraft || getProfile(currentCharacterEditorId())),
        characterPrompt: event.target.value,
      };
    });
  }

  if (characterGlobalWordbookToggle) {
    characterGlobalWordbookToggle.addEventListener("change", (event) => {
      appState.characterDraft = {
        ...(appState.characterDraft || getProfile(currentCharacterEditorId())),
        useGlobalWordbook: event.target.checked,
      };
    });
  }

  if (apiKeyInput) {
    apiKeyInput.addEventListener("input", (event) => {
      if (appState.activeScreen === "central-settings") {
        ensureApiDraft();
        appState.apiProfileDraft = {
          ...appState.apiProfileDraft,
          apiKey: event.target.value,
        };
        return;
      }
    });
  }

  if (apiModelSelect) {
    apiModelSelect.addEventListener("change", (event) => {
      ensureApiDraft();
      appState.apiProfileDraft = {
        ...appState.apiProfileDraft,
        model: event.target.value,
      };
    });
  }
}

async function testApiProfileDraft() {
  ensureApiDraft();
  const profile = appState.apiProfileDraft;
  appState.apiConnectionState = {
    status: "loading",
    message: "Testing real character reply generation...",
  };
  render();

  try {
    const replyText = await executeProfileRequest(profile, buildTestInput(profile));
    appState.apiProfileDraft = {
      ...profile,
      lastConnectionStatus: "success",
      lastConnectionMessage: `Generation works: ${replyText.slice(0, 90)}${replyText.length > 90 ? "..." : ""}`,
    };
    appState.apiConnectionState = {
      status: "success",
      message: appState.apiProfileDraft.lastConnectionMessage,
    };
  } catch (error) {
    const message = summarizeApiError(error);
    appState.apiProfileDraft = {
      ...profile,
      lastConnectionStatus: "error",
      lastConnectionMessage: message,
    };
    appState.apiConnectionState = {
      status: "error",
      message,
    };
  }

  render();
}

function mountFileInputs(root) {
  const wallpaperInput = root.querySelector("[data-role='wallpaper-input']");
  const attachmentInput = root.querySelector("[data-role='attachment-input']");
  const characterAvatarInput = root.querySelector("[data-role='character-avatar-input']");

  if (wallpaperInput) {
    wallpaperInput.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const dataUrl = await compressImageFile(file);
      if (dataUrl) {
        updateProfile(currentConversationId(), { chatWallpaper: dataUrl });
      }
      render();
    });
  }

  if (attachmentInput) {
    attachmentInput.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const dataUrl = await readFileAsDataUrl(file);
      appState.pendingAttachment = {
        name: file.name,
        type: file.type,
        dataUrl,
      };
      appState.attachmentMenuOpen = false;
      render();
    });
  }

  if (characterAvatarInput) {
    characterAvatarInput.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const dataUrl = await readFileAsDataUrl(file);
      appState.characterDraft = {
        ...(appState.characterDraft || getProfile(currentCharacterEditorId())),
        avatar: dataUrl,
      };
      render();
    });
  }
}

function scrollChatToBottom(root) {
  if (appState.chatView !== "conversation") {
    return;
  }

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
    appState.chatView = "conversation";
    appState.isReplyPending = false;
    appState.draftMessage = "";
    appState.pendingAttachment = null;
    appState.attachmentMenuOpen = false;
    render();
    return;
  }

  if (action === "open-central-settings") {
    openCentralSettings();
    render();
    return;
  }

  if (action === "switch-tab") {
    appState.activeMessagesTab = button.dataset.tab || "chats";
    appState.messagesView = "list";
    appState.activeConversationId = null;
    appState.characterEditorId = null;
    appState.characterDraft = null;
    appState.chatView = "conversation";
    appState.attachmentMenuOpen = false;
    render();
    return;
  }

  if (action === "delete-sample") {
    const profileId = button.dataset.profileId || currentConversationId();
    updateProfile(profileId, { isVisible: false });
    if (appState.activeConversationId === profileId) {
      closeConversation();
    }
    render();
    return;
  }

  if (action === "clear-chat") {
    const profileId = button.dataset.profileId;
    if (profileId) {
      setConversation(profileId, []);
      if (appState.activeConversationId === profileId) {
        appState.isReplyPending = false;
      }
    }
    render();
    return;
  }

  if (action === "open-chat") {
    openConversation(button.dataset.conversation || "angel-bunny");
    render();
    return;
  }

  if (action === "open-character-editor") {
    openCharacterEditor(button.dataset.profileId || "angel-bunny");
    render();
    return;
  }

  if (action === "create-character") {
    createCharacterEditor();
    render();
    return;
  }

  if (action === "close-character-editor") {
    closeCharacterEditor();
    render();
    return;
  }

  if (action === "close-chat") {
    closeConversation();
    render();
    return;
  }

  if (action === "open-settings-screen") {
    appState.chatView = "settings";
    appState.attachmentMenuOpen = false;
    render();
    return;
  }

  if (action === "close-settings-screen") {
    appState.chatView = "conversation";
    render();
    return;
  }

  if (action === "toggle-voice") {
    appState.isVoiceMode = !appState.isVoiceMode;
    render();
    return;
  }

  if (action === "send-message") {
    sendMessage(currentConversationId());
    return;
  }

  if (action === "retry-message") {
    resendRequest(button.dataset.messageId);
    return;
  }

  if (action === "pick-wallpaper") {
    rootNode?.querySelector("[data-role='wallpaper-input']")?.click();
    return;
  }

  if (action === "pick-character-avatar") {
    rootNode?.querySelector("[data-role='character-avatar-input']")?.click();
    return;
  }

  if (action === "toggle-attachment-menu") {
    appState.attachmentMenuOpen = !appState.attachmentMenuOpen;
    render();
    return;
  }

  if (action === "pick-attachment-image") {
    rootNode?.querySelector("[data-role='attachment-input']")?.click();
    return;
  }

  if (action === "clear-attachment") {
    appState.pendingAttachment = null;
    render();
    return;
  }

  if (action === "clear-chat-records") {
    const conversationId = currentConversationId();
    setConversation(conversationId, []);
    appState.isReplyPending = false;
    render();
    return;
  }

  if (action === "save-character") {
    const profileId = currentCharacterEditorId();
    const draft = appState.characterDraft || getProfile(profileId);
    const existing = getProfile(profileId) || {};
    updateProfile(profileId, {
      id: profileId,
      name: draft.name || existing.name || "New Character",
      aiNickname: draft.aiNickname || draft.name || existing.name || "New Character",
      avatar: draft.avatar || existing.avatar,
      characterPrompt: draft.characterPrompt || "",
      worldbook: draft.characterPrompt || draft.worldbook || "",
      useGlobalWordbook: !!draft.useGlobalWordbook,
      isVisible: true,
    });
    ensureConversation(profileId);
    closeCharacterEditor();
    render();
    return;
  }

  if (action === "toggle-api-key-visibility") {
    appState.showApiKey = !appState.showApiKey;
    render();
    return;
  }

  if (action === "new-api-profile") {
    const profile = createBlankApiProfile(`Profile ${Object.keys(getApiProfiles()).length + 1}`);
    appState.activeApiProfileId = "";
    appState.apiProfileDraft = profile;
    appState.apiConnectionState = { status: "idle", message: "" };
    render();
    return;
  }

  if (action === "save-api-profile") {
    ensureApiDraft();
    const draft = {
      ...appState.apiProfileDraft,
      id: appState.apiProfileDraft.id || slugify(appState.apiProfileDraft.name) || `profile-${Date.now()}`,
      name: appState.apiProfileDraft.name?.trim() || "Untitled Profile",
    };
    const currentSelectedId = appState.activeApiProfileId;
    const nextId = currentSelectedId && currentSelectedId !== draft.id && !getApiProfiles()[draft.id] ? draft.id : draft.id;
    const normalizedId = slugify(draft.name) || nextId;
    const previousId = currentSelectedId && getApiProfiles()[currentSelectedId] ? currentSelectedId : draft.id;
    if (previousId !== normalizedId && getApiProfiles()[previousId] && !getApiProfiles()[normalizedId]) {
      deleteApiProfile(previousId);
    }
    const finalProfile = {
      ...draft,
      id: normalizedId,
      lastConnectionStatus: appState.apiConnectionState.status === "idle" ? draft.lastConnectionStatus : appState.apiConnectionState.status,
      lastConnectionMessage: appState.apiConnectionState.message || draft.lastConnectionMessage,
    };
    saveApiProfile(finalProfile);
    persistedState.appSettings.activeApiProfileId = finalProfile.id;
    saveChatState();
    appState.activeApiProfileId = finalProfile.id;
    appState.apiProfileDraft = { ...finalProfile };
    appState.apiConnectionState = {
      status: finalProfile.lastConnectionStatus || "success",
      message: finalProfile.lastConnectionMessage || "Profile saved.",
    };
    render();
    return;
  }

  if (action === "delete-api-profile") {
    ensureApiDraft();
    const profiles = Object.values(getApiProfiles());
    if (profiles.length <= 1) {
      return;
    }
    deleteApiProfile(appState.activeApiProfileId || appState.apiProfileDraft.id);
    const nextActive = getActiveApiProfile();
    appState.activeApiProfileId = nextActive?.id || "";
    appState.apiProfileDraft = nextActive ? { ...nextActive } : createBlankApiProfile();
    appState.apiConnectionState = { status: "idle", message: "" };
    render();
    return;
  }

  if (action === "fetch-models") {
    fetchModelsForDraft();
    return;
  }

  if (action === "test-api-profile") {
    testApiProfileDraft();
    return;
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

      if (appId === "contacts") {
        enterMessagesScreen();
        appState.activeMessagesTab = "contacts";
        render();
        return;
      }

      if (appId === "settings") {
        openCentralSettings();
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
  mountSettingsInputs(rootNode);
  mountFileInputs(rootNode);
  setStatusTime();
  scrollChatToBottom(rootNode);
}

function init() {
  persistedState = loadChatState();
  rootNode = document.getElementById("app");

  if (!rootNode) {
    return;
  }

  render();
  scheduleStatusClock();
  startSimulationLoop();
}

init();
