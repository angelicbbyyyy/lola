const ASSET_BASE = "./assets";
const STORAGE_KEY = "lola_chat_engine_v1";
const SIMULATION_INTERVAL_MS = 30_000;

const appState = {
  activeScreen: "home",
  activeMessagesTab: "chats",
  messagesView: "list",
  activeConversationId: null,
  chatView: "conversation",
  draftMessage: "",
  pendingAttachment: null,
  isVoiceMode: false,
  isReplyPending: false,
  attachmentMenuOpen: false,
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
      openAIApiKey: "",
      apiModel: "gpt-4.1-mini",
    },
    characterProfiles: {
      "angel-bunny": {
        id: "angel-bunny",
        name: "Angel Bunny",
        subtitle: "Mini 2026",
        status: "Online",
        avatar: "contacts.JPG",
        worldbook:
          "You are Angel Bunny. Speak gently, intimately, and a little clingy, like a soft WeChat romance sim character. Stay emotionally aware, affectionate, and reactive. Keep responses concise unless the user is emotional or sends an image.",
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
    return {
      appSettings: {
        ...defaults.appSettings,
        ...(parsed.appSettings || {}),
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
  appState.chatView = "conversation";
  appState.draftMessage = "";
  appState.pendingAttachment = null;
  appState.attachmentMenuOpen = false;
}

function closeConversation() {
  appState.messagesView = "list";
  appState.activeConversationId = null;
  appState.chatView = "conversation";
  appState.isReplyPending = false;
  appState.draftMessage = "";
  appState.pendingAttachment = null;
  appState.attachmentMenuOpen = false;
  clearConversationTimers();
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
  const systemText =
    `${profile.worldbook}\n\n` +
    `${awareness.join(" ")}\n\n` +
    `Remember up to ${memoryLimit} recent messages. ` +
    `${profile.intelligentMemoryManagement ? "Prefer emotionally salient and image-bearing moments when staying consistent." : ""} ` +
    `Message frequency: ${profile.messageFrequency}. ` +
    `Blocked state: ${profile.isBlocked ? "blocked" : "not blocked"}. ` +
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
  const { openAIApiKey, apiModel } = persistedState.appSettings;

  if (!openAIApiKey) {
    throw new Error("Add an OpenAI API key in the chat settings menu first.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAIApiKey}`,
    },
    body: JSON.stringify({
      model: apiModel || "gpt-4.1-mini",
      input: buildOpenAIInput(conversationId),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `OpenAI request failed with ${response.status}`);
  }

  const data = await response.json();

  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  for (const outputItem of data.output || []) {
    for (const contentItem of outputItem.content || []) {
      if (typeof contentItem.text === "string" && contentItem.text.trim()) {
        return contentItem.text.trim();
      }
    }
  }

  throw new Error("The model returned an empty response.");
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
      errorMessage: error.message || "Request failed",
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
      <button type="button" class="chat-row chat-row-button" data-action="open-chat" data-conversation="${profile.id}">
        <div class="chat-avatar">
          ${imageMarkup(profile.avatar, `${profile.name} avatar`, "h-full w-full", "AV")}
        </div>
        <div class="chat-copy">
          <div class="chat-name">${profile.name}</div>
          <div class="chat-preview">${messagePreview(lastMessage) || "Start the conversation..."}</div>
        </div>
        <div class="chat-meta">
          <div class="chat-time">${lastMessage?.timestamp || profile.subtitle}</div>
          <button type="button" class="chat-delete" data-action="delete-sample" data-profile-id="${profile.id}" aria-label="Delete sample conversation">
            ${iconSvg("delete")}
          </button>
        </div>
      </button>
    `;
  });

  return `
    <div class="messages-pane">
      ${renderMessagesHeader("Chats")}
      <section class="messages-list-card">
        ${
          rows.length
            ? rows.join("")
            : `
              <div class="messages-empty">
                <div class="messages-empty-title">No chats yet</div>
                <p>Create or restore a character to start a conversation.</p>
              </div>
            `
        }
      </section>
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
      ${
        visibleProfiles.length
          ? visibleProfiles
              .map(
                (profile) => `
                  <section class="contact-card">
                    <div class="contact-card-avatar">
                      ${imageMarkup(profile.avatar, `${profile.name} avatar`, "h-full w-full", "AV")}
                    </div>
                    <div class="contact-card-copy">
                      <div class="contact-card-title-row">
                        <h3>${profile.name}</h3>
                        <span class="contact-tag">${profile.messageFrequency.toUpperCase()}</span>
                        ${profile.isBlocked ? '<span class="contact-tag">Blocked</span>' : '<span class="contact-tag">AI</span>'}
                      </div>
                      <p>${profile.worldbook.slice(0, 74)}...</p>
                    </div>
                    <div class="contact-card-actions">
                      <button type="button" class="contact-icon-button" data-action="open-chat" data-conversation="${profile.id}" aria-label="Open chat">
                        ${iconSvg("pencil")}
                      </button>
                      <button type="button" class="contact-icon-button" data-action="delete-sample" data-profile-id="${profile.id}" aria-label="Delete sample contact">
                        ${iconSvg("delete")}
                      </button>
                    </div>
                  </section>
                `,
              )
              .join("")
          : `
            <div class="messages-empty messages-empty-card">
              <div class="messages-empty-title">Sample contact removed</div>
              <p>Refresh local storage or recreate the character later.</p>
            </div>
          `
      }
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
  const { openAIApiKey, apiModel } = persistedState.appSettings;
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
                <span class="chat-settings-row-detail">${profile.worldbook.slice(0, 100)}${profile.worldbook.length > 100 ? "..." : ""}</span>
                <textarea class="chat-settings-textarea" data-role="worldbook-input">${profile.worldbook}</textarea>
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
              <h3>Model & API</h3>
            </div>
            <div class="chat-settings-card">
              <label class="chat-settings-stack-row">
                <span class="chat-settings-row-title">OpenAI API Key</span>
                <input type="password" class="chat-settings-text-input" data-role="api-key-input" value="${escapeAttribute(openAIApiKey)}" placeholder="sk-..." />
              </label>
              <label class="chat-settings-stack-row">
                <span class="chat-settings-row-title">Model</span>
                <input type="text" class="chat-settings-text-input" data-role="api-model-input" value="${escapeAttribute(apiModel)}" />
              </label>
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
            <div class="chat-surface" ${wallpaperStyle}>
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

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
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
    appState.draftMessage = event.target.value;
    syncHeight();
    render();
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
  const apiKeyInput = root.querySelector("[data-role='api-key-input']");
  const apiModelInput = root.querySelector("[data-role='api-model-input']");

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
      updateProfile(currentConversationId(), { worldbook: event.target.value });
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

  if (apiKeyInput) {
    apiKeyInput.addEventListener("input", (event) => {
      persistedState.appSettings.openAIApiKey = event.target.value;
      saveChatState();
    });
  }

  if (apiModelInput) {
    apiModelInput.addEventListener("input", (event) => {
      persistedState.appSettings.apiModel = event.target.value;
      saveChatState();
    });
  }
}

function mountFileInputs(root) {
  const wallpaperInput = root.querySelector("[data-role='wallpaper-input']");
  const attachmentInput = root.querySelector("[data-role='attachment-input']");

  if (wallpaperInput) {
    wallpaperInput.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const dataUrl = await readFileAsDataUrl(file);
      updateProfile(currentConversationId(), { chatWallpaper: dataUrl });
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

  if (action === "switch-tab") {
    appState.activeMessagesTab = button.dataset.tab || "chats";
    appState.messagesView = "list";
    appState.activeConversationId = null;
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

  if (action === "open-chat") {
    openConversation(button.dataset.conversation || "angel-bunny");
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
