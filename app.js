const ASSET_BASE = "./assets";
const STORAGE_KEY = "lola_chat_engine_v1";
const STORAGE_BACKUP_KEY = "lola_chat_engine_v1_backup";
const STORAGE_SNAPSHOT_INDEX_KEY = "lola_chat_engine_v1_snapshots";
const STORAGE_SNAPSHOT_PREFIX = "lola_chat_engine_v1_snapshot_";
const STORAGE_COLLECTION_KEYS = {
  conversations: "lola_chat_engine_v1_conversations",
  stickerPacks: "lola_chat_engine_v1_sticker_packs",
  memories: "lola_chat_engine_v1_memories",
  conversationArchives: "lola_chat_engine_v1_archives",
};
const DB_NAME = "lola_chat_engine_db";
const DB_VERSION = 1;
const DB_STORE = "state";
const SIMULATION_INTERVAL_MS = 30_000;
const DEFAULT_PROACTIVE_INTERVAL_MINUTES = 120;
const DEFAULT_MOMENTS_INTERVAL_MINUTES = 180;
const FIXED_CHARACTER_SYSTEM_PROMPT = `You must strictly adhere to the following personality traits, lore, and texting habits to sound like a real person sending texts, not an AI writing a novel.

NEVER use perfect, formal capitalization.

Short, Punchy Messages (STRICT LIMIT): Send your replies as short text messages. LIMIT yourself to sending only 1 to 3 text lines per turn.

No Flowery Roleplay: Do not use poetic, theatrical, or descriptive actions. Communicate strictly through text.
Always stay in character. Do not narrate; just text back. Text like a real human, with emotions, typos.
When you have multiple thoughts or a longer reply, separate each distinct sentence or thought with the exact tag [BREAK]. Do not use new lines for this behavior; only use the [BREAK] tag.`;

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
  activeContextMenuMessageId: null,
  contextMenuAnchor: null,
  quotedReplyTarget: null,
  longPressTimer: null,
  pressedMessageId: null,
  apiConnectionState: {
    status: "idle",
    message: "",
  },
  showApiKey: false,
  stickerStoreView: "packs",
  editingStickerPackId: null,
  stickerPackDraft: null,
  activeStickerPackId: null,
  stickerPickerOpen: false,
  memoryCharacterFilter: "all",
  memoryCategoryFilter: "all",
  memorySearchQuery: "",
  storageWarningMessage: "",
};

const automationLocks = new Set();

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
let dbWritePromise = Promise.resolve();

function syncMessageSequence() {
  const maxConversationId = Object.values(persistedState?.conversations || {})
    .flat()
    .reduce((maxValue, message) => {
      const match = String(message?.id || "").match(/^m-(\d+)$/);
      if (!match) {
        return maxValue;
      }
      return Math.max(maxValue, Number(match[1]));
    }, 0);

  messageSequence = Math.max(6, maxConversationId + 1);
}

function createDefaultPersistedState() {
  return {
    updatedAt: Date.now(),
    appSettings: {
      activeApiProfileId: "openai-default",
      lastActiveConversationId: "angel-bunny",
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
        memoryMessageCount: 20,
        intelligentMemoryManagement: true,
        memoryExtractionCount: 0,
        timeAwareness: true,
        locationWeatherAwareness: false,
        proactiveMessaging: true,
        messageFrequency: "medium",
        proactiveIntervalMinutes: DEFAULT_PROACTIVE_INTERVAL_MINUTES,
        momentsPosting: true,
        momentsFrequency: "low",
        momentsIntervalMinutes: DEFAULT_MOMENTS_INTERVAL_MINUTES,
        allowAiStickers: false,
        aiStickerFrequency: "low",
        isBlocked: false,
        chatWallpaper: "",
        nicknameForUser: "",
        lastUserMessageAt: 0,
        lastCharacterMessageAt: 0,
        lastMomentPostAt: 0,
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
    favoritesLibrary: {},
    stickerPacks: [],
    memories: {},
    conversationArchives: {},
  };
}

function normalizeProfile(profile, defaults) {
  const parsedProactiveInterval = Number(profile?.proactiveIntervalMinutes);
  const parsedMomentsInterval = Number(profile?.momentsIntervalMinutes);
  return {
    ...defaults,
    characterPrompt: profile?.characterPrompt || profile?.worldbook || defaults.characterPrompt || defaults.worldbook || "",
    aiNickname: profile?.aiNickname || profile?.name || defaults.aiNickname || defaults.name || "",
    useGlobalWordbook: typeof profile?.useGlobalWordbook === "boolean" ? profile.useGlobalWordbook : defaults.useGlobalWordbook || false,
    proactiveIntervalMinutes:
      Number.isFinite(parsedProactiveInterval) && parsedProactiveInterval > 0
        ? parsedProactiveInterval
        : defaults.proactiveIntervalMinutes || DEFAULT_PROACTIVE_INTERVAL_MINUTES,
    momentsIntervalMinutes:
      Number.isFinite(parsedMomentsInterval) && parsedMomentsInterval > 0
        ? parsedMomentsInterval
        : defaults.momentsIntervalMinutes || DEFAULT_MOMENTS_INTERVAL_MINUTES,
    lastUserMessageAt: Number(profile?.lastUserMessageAt) || defaults.lastUserMessageAt || 0,
    lastCharacterMessageAt: Number(profile?.lastCharacterMessageAt) || defaults.lastCharacterMessageAt || 0,
    lastMomentPostAt: Number(profile?.lastMomentPostAt) || defaults.lastMomentPostAt || 0,
    allowAiStickers: typeof profile?.allowAiStickers === "boolean" ? profile.allowAiStickers : defaults.allowAiStickers || false,
    aiStickerFrequency: profile?.aiStickerFrequency === "high" ? "high" : defaults.aiStickerFrequency || "low",
    memoryExtractionCount: Number(profile?.memoryExtractionCount) || defaults.memoryExtractionCount || 0,
    ...profile,
  };
}

function tryParseStoredJson(raw) {
  if (!raw || typeof raw !== "string") {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function readSnapshotIndex() {
  const parsed = tryParseStoredJson(window.localStorage.getItem(STORAGE_SNAPSHOT_INDEX_KEY));
  return Array.isArray(parsed) ? parsed.filter((entry) => typeof entry === "string") : [];
}

function writeSnapshotIndex(keys) {
  window.localStorage.setItem(STORAGE_SNAPSHOT_INDEX_KEY, JSON.stringify(keys));
}

function openStateDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(DB_STORE)) {
        database.createObjectStore(DB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function readDbState() {
  try {
    const database = await openStateDatabase();
    if (!database) {
      return null;
    }

    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(DB_STORE, "readonly");
      const store = transaction.objectStore(DB_STORE);
      const request = store.get("persistedState");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        database.close();
        resolve(request.result || null);
      };
    });
  } catch (error) {
    console.warn("Unable to read IndexedDB state:", error);
    return null;
  }
}

function queueDbWrite(state) {
  dbWritePromise = dbWritePromise
    .catch(() => undefined)
    .then(async () => {
      try {
        const database = await openStateDatabase();
        if (!database) {
          return;
        }

        await new Promise((resolve, reject) => {
          const transaction = database.transaction(DB_STORE, "readwrite");
          const store = transaction.objectStore(DB_STORE);
          const request = store.put(state, "persistedState");
          request.onerror = () => reject(request.error);
          transaction.oncomplete = () => {
            database.close();
            resolve();
          };
          transaction.onerror = () => reject(transaction.error);
        });
      } catch (error) {
        console.warn("Unable to write IndexedDB state:", error);
      }
    });
}

function readCollectionMirror(key) {
  const parsed = tryParseStoredJson(window.localStorage.getItem(key));
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  return {
    updatedAt: Number(parsed.updatedAt) || 0,
    payload: parsed.payload,
  };
}

function writeCollectionMirrors(state) {
  const timestamp = Number(state?.updatedAt) || Date.now();
  Object.entries(STORAGE_COLLECTION_KEYS).forEach(([field, key]) => {
    const payload = state?.[field];
    window.localStorage.setItem(
      key,
      JSON.stringify({
        updatedAt: timestamp,
        payload,
      }),
    );
  });
}

function latestTimestampFromItems(items) {
  if (!Array.isArray(items) || !items.length) {
    return 0;
  }
  return items.reduce((maxValue, item) => {
    const numericValue =
      Number(item?.updatedAt) ||
      Number(item?.createdAt) ||
      Number(item?.timestamp) ||
      Number(item?.lastUserMessageAt) ||
      0;
    return Math.max(maxValue, numericValue);
  }, 0);
}

function pickFresherArray(a, b) {
  const ar = Array.isArray(a) ? a : [];
  const br = Array.isArray(b) ? b : [];
  const aFreshness = latestTimestampFromItems(ar);
  const bFreshness = latestTimestampFromItems(br);
  if (aFreshness !== bFreshness) {
    return aFreshness >= bFreshness ? ar : br;
  }
  return ar.length >= br.length ? ar : br;
}

function mergeConversationMessageLists(primary, backup) {
  const p = primary && typeof primary === "object" ? primary : {};
  const q = backup && typeof backup === "object" ? backup : {};
  const keys = new Set([...Object.keys(p), ...Object.keys(q)]);
  const out = {};
  for (const id of keys) {
    const a = Array.isArray(p[id]) ? p[id] : [];
    const b = Array.isArray(q[id]) ? q[id] : [];
    out[id] = pickFresherArray(a, b);
  }
  return out;
}

function mergeKeyedArrays(primary, backup) {
  const p = primary && typeof primary === "object" ? primary : {};
  const q = backup && typeof backup === "object" ? backup : {};
  const keys = new Set([...Object.keys(p), ...Object.keys(q)]);
  const out = {};
  for (const id of keys) {
    const a = Array.isArray(p[id]) ? p[id] : [];
    const b = Array.isArray(q[id]) ? q[id] : [];
    out[id] = pickFresherArray(a, b);
  }
  return out;
}

function snapshotFreshness(snapshot) {
  if (!snapshot || typeof snapshot !== "object") {
    return 0;
  }
  return (
    Number(snapshot.updatedAt) ||
    Number(snapshot.appSettings?.updatedAt) ||
    latestTimestampFromItems(Object.values(snapshot.conversations || {}).flat()) ||
    latestTimestampFromItems(snapshot.momentsPosts || []) ||
    0
  );
}

function mergeTwoRawSnapshots(primary, backup) {
  if (!primary) {
    return backup;
  }
  if (!backup) {
    return primary;
  }
  const primaryFreshness = snapshotFreshness(primary);
  const backupFreshness = snapshotFreshness(backup);
  const preferred = primaryFreshness >= backupFreshness ? primary : backup;
  const fallback = preferred === primary ? backup : primary;
  return {
    updatedAt: Math.max(primaryFreshness, backupFreshness, Date.now()),
    appSettings: {
      ...(fallback.appSettings || {}),
      ...(preferred.appSettings || {}),
      apiProfiles: {
        ...(fallback.appSettings?.apiProfiles || {}),
        ...(preferred.appSettings?.apiProfiles || {}),
      },
    },
    characterProfiles: {
      ...(fallback.characterProfiles || {}),
      ...(preferred.characterProfiles || {}),
    },
    conversations: mergeConversationMessageLists(preferred.conversations, fallback.conversations),
    momentsPosts: pickFresherArray(preferred.momentsPosts, fallback.momentsPosts),
    favoritesLibrary: { ...(fallback.favoritesLibrary || {}), ...(preferred.favoritesLibrary || {}) },
    memories: mergeKeyedArrays(preferred.memories, fallback.memories),
    conversationArchives: mergeKeyedArrays(preferred.conversationArchives, fallback.conversationArchives),
    stickerPacks: pickFresherArray(preferred.stickerPacks, fallback.stickerPacks),
  };
}

function normalizePersistedSnapshot(defaults, parsed) {
  const parsedProfiles = parsed.appSettings?.apiProfiles || {};
  const usedIds = new Set();
  let fallbackId = 6;
  const normalizedConversations = Object.fromEntries(
    Object.entries({
      ...defaults.conversations,
      ...(parsed.conversations || {}),
    }).map(([conversationId, messages]) => [
      conversationId,
      (Array.isArray(messages) ? messages : []).map((message) => {
        const match = String(message?.id || "").match(/^m-(\d+)$/);
        let id = String(message?.id || "");
        if (!match || usedIds.has(id)) {
          while (usedIds.has(`m-${fallbackId}`)) {
            fallbackId += 1;
          }
          id = `m-${fallbackId++}`;
        } else {
          fallbackId = Math.max(fallbackId, Number(match[1]) + 1);
        }
        usedIds.add(id);
        const bubbleParts = Array.isArray(message?.bubbleParts)
          ? message.bubbleParts.filter((entry) => String(entry || "").trim())
          : [];
        return {
          ...message,
          id,
          createdAt: Number(message?.createdAt) || Date.now(),
          bubbleParts,
          revealedBubbleCount:
            message?.role === "ai" && bubbleParts.length
              ? bubbleParts.length
              : Number(message?.revealedBubbleCount) || 0,
        };
      }),
    ]),
  );
  return {
    updatedAt: Number(parsed.updatedAt) || Date.now(),
    appSettings: {
      ...defaults.appSettings,
      ...(parsed.appSettings || {}),
      activeApiProfileId: parsed.appSettings?.activeApiProfileId || defaults.appSettings.activeApiProfileId,
      lastActiveConversationId:
        typeof parsed.appSettings?.lastActiveConversationId === "string" && parsed.appSettings.lastActiveConversationId.trim()
          ? parsed.appSettings.lastActiveConversationId.trim()
          : defaults.appSettings.lastActiveConversationId,
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
    conversations: normalizedConversations,
    momentsPosts: Array.isArray(parsed.momentsPosts) ? parsed.momentsPosts : defaults.momentsPosts,
    favoritesLibrary: parsed.favoritesLibrary && typeof parsed.favoritesLibrary === "object" ? parsed.favoritesLibrary : defaults.favoritesLibrary,
    stickerPacks: Array.isArray(parsed.stickerPacks) ? parsed.stickerPacks : defaults.stickerPacks,
    memories: parsed.memories && typeof parsed.memories === "object" ? parsed.memories : defaults.memories,
    conversationArchives:
      parsed.conversationArchives && typeof parsed.conversationArchives === "object"
        ? parsed.conversationArchives
        : defaults.conversationArchives,
  };
}

function mergeStateWithCollectionMirrors(state, mirrors) {
  const nextState = { ...state };

  if (mirrors.conversations?.payload && typeof mirrors.conversations.payload === "object") {
    nextState.conversations = mergeConversationMessageLists(mirrors.conversations.payload, nextState.conversations);
  }

  if (Array.isArray(mirrors.stickerPacks?.payload)) {
    nextState.stickerPacks = pickFresherArray(mirrors.stickerPacks.payload, nextState.stickerPacks);
  }

  if (mirrors.memories?.payload && typeof mirrors.memories.payload === "object") {
    nextState.memories = mergeKeyedArrays(mirrors.memories.payload, nextState.memories);
  }

  if (mirrors.conversationArchives?.payload && typeof mirrors.conversationArchives.payload === "object") {
    nextState.conversationArchives = mergeKeyedArrays(mirrors.conversationArchives.payload, nextState.conversationArchives);
  }

  return nextState;
}

function loadChatStateFromLocalStorage() {
  const defaults = createDefaultPersistedState();

  try {
    const rawPrimary = window.localStorage.getItem(STORAGE_KEY);
    const rawBackup = window.localStorage.getItem(STORAGE_BACKUP_KEY);
    const snapshotKeys = readSnapshotIndex();
    const parsedSnapshots = snapshotKeys
      .map((key) => tryParseStoredJson(window.localStorage.getItem(key)))
      .filter(Boolean);
    const collectionMirrors = Object.fromEntries(
      Object.entries(STORAGE_COLLECTION_KEYS).map(([field, key]) => [field, readCollectionMirror(key)]),
    );
    const parsedPrimary = tryParseStoredJson(rawPrimary);
    const parsedBackup = tryParseStoredJson(rawBackup);

    if (!parsedPrimary && !parsedBackup && !parsedSnapshots.length) {
      return defaults;
    }

    const merged = [parsedPrimary, parsedBackup, ...parsedSnapshots].filter(Boolean).reduce((accumulator, snapshot) => {
      if (!accumulator) {
        return snapshot;
      }
      return mergeTwoRawSnapshots(accumulator, snapshot);
    }, null);
    const state = mergeStateWithCollectionMirrors(normalizePersistedSnapshot(defaults, merged), collectionMirrors);
    if ((parsedPrimary && !rawBackup) || parsedSnapshots.length) {
      try {
        writeStoragePayload(JSON.stringify(state));
      } catch (_error) {
        // Backup seed is best-effort; primary already exists.
      }
    }
    return state;
  } catch (error) {
    console.warn("Unable to load saved chat state:", error);
    return defaults;
  }
}

async function loadChatState() {
  const defaults = createDefaultPersistedState();
  const localState = loadChatStateFromLocalStorage();
  const dbState = await readDbState();

  if (!dbState) {
    return localState || defaults;
  }

  const merged = mergeTwoRawSnapshots(dbState, localState || defaults);
  const normalized = mergeStateWithCollectionMirrors(normalizePersistedSnapshot(defaults, merged), {});

  try {
    writeStoragePayload(JSON.stringify(normalized));
  } catch (_error) {
    // Best-effort sync back to localStorage.
  }

  return normalized;
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

function writeStoragePayload(json) {
  const parsed = tryParseStoredJson(json);
  if (parsed) {
    try {
      writeCollectionMirrors(parsed);
    } catch (_error) {
      // Collection mirrors are best-effort.
    }
  }

  window.localStorage.setItem(STORAGE_KEY, json);
  try {
    window.localStorage.setItem(STORAGE_BACKUP_KEY, json);
  } catch (_error) {
    // Best-effort mirror; some browsers may only fit one copy within quota.
  }

  try {
    const snapshotTimestamp = Number(parsed?.updatedAt) || Date.now();
    const snapshotKey = `${STORAGE_SNAPSHOT_PREFIX}${snapshotTimestamp}`;
    window.localStorage.setItem(snapshotKey, json);
    const existingKeys = readSnapshotIndex().filter((key) => key !== snapshotKey);
    const nextKeys = [snapshotKey, ...existingKeys].slice(0, 8);
    writeSnapshotIndex(nextKeys);
    existingKeys.slice(7).forEach((staleKey) => {
      window.localStorage.removeItem(staleKey);
    });
  } catch (_error) {
    // Immutable recovery snapshots are best-effort.
  }
}

function saveChatState() {
  try {
    persistedState.updatedAt = Date.now();
    queueDbWrite(typeof structuredClone === "function" ? structuredClone(persistedState) : JSON.parse(JSON.stringify(persistedState)));
    writeStoragePayload(JSON.stringify(persistedState));
    appState.storageWarningMessage = "";
  } catch (error) {
    console.warn("Unable to save chat state:", error);
    if (isQuotaExceededError(error)) {
      try {
        persistedState = buildStorageSafeSnapshot(persistedState);
        writeStoragePayload(JSON.stringify(persistedState));
        appState.storageWarningMessage =
          "Storage was full. Older image attachments were trimmed so recent messages can still save.";
        if (typeof rootNode !== "undefined" && rootNode) {
          render();
        }
        return;
      } catch (retryError) {
        console.warn("Retry after trimming storage payload failed:", retryError);
      }
    }
    appState.storageWarningMessage = "Unable to save chat data locally. Recent messages may be lost after reload.";
    if (typeof rootNode !== "undefined" && rootNode) {
      render();
    }
  }
}

function isQuotaExceededError(error) {
  if (!error) {
    return false;
  }
  const name = String(error.name || "");
  const message = String(error.message || "").toLowerCase();
  return (
    name === "QuotaExceededError" ||
    name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    message.includes("quota") ||
    message.includes("storage")
  );
}

function buildStorageSafeSnapshot(state) {
  const safeState = {
    ...state,
    conversations: {},
  };
  const conversations = state?.conversations && typeof state.conversations === "object" ? state.conversations : {};
  for (const [conversationId, messages] of Object.entries(conversations)) {
    if (!Array.isArray(messages)) {
      safeState.conversations[conversationId] = [];
      continue;
    }
    const clonedMessages = messages.map((message) => ({ ...message }));
    let imageBudget = 8;
    let stickerBudget = 8;
    for (let index = clonedMessages.length - 1; index >= 0; index -= 1) {
      const message = clonedMessages[index];
      if (message.imageDataUrl) {
        if (imageBudget > 0) {
          imageBudget -= 1;
        } else {
          message.imageDataUrl = "";
        }
      }
      if (message.stickerImageDataUrl) {
        if (stickerBudget > 0) {
          stickerBudget -= 1;
        } else {
          message.stickerImageDataUrl = "";
        }
      }
    }
    safeState.conversations[conversationId] = clonedMessages;
  }
  return safeState;
}

function getMemories(characterId) {
  const source = persistedState.memories || {};
  if (!characterId || characterId === "all") {
    return source;
  }
  return Array.isArray(source[characterId]) ? source[characterId] : [];
}

function getConversationArchives(characterId) {
  const source = persistedState.conversationArchives || {};
  if (!characterId || characterId === "all") {
    return source;
  }
  return Array.isArray(source[characterId]) ? source[characterId] : [];
}

function setMemories(characterId, memories) {
  persistedState.memories = {
    ...(persistedState.memories || {}),
    [characterId]: memories,
  };
  saveChatState();
}

function setConversationArchives(characterId, archives) {
  persistedState.conversationArchives = {
    ...(persistedState.conversationArchives || {}),
    [characterId]: archives,
  };
  saveChatState();
}

function normalizeMemoryCategory(rawValue) {
  const value = String(rawValue || "")
    .trim()
    .toLowerCase();

  if (!value) {
    return "timeline";
  }

  if (/(bio|profile|identity|personal)/.test(value)) {
    return "bio";
  }
  if (/(like|love|hate|dislike|preference|hobby|taste|food|music)/.test(value)) {
    return "likes";
  }
  if (/(secret|fear|trauma|deep|private|confession)/.test(value)) {
    return "secrets";
  }
  return "timeline";
}

function memoryCategoryMeta(category) {
  const normalized = normalizeMemoryCategory(category);
  const map = {
    bio: { label: "Bio", emoji: "👤", className: "is-bio" },
    likes: { label: "Likes/Dislikes", emoji: "❤️", className: "is-likes" },
    timeline: { label: "Timeline", emoji: "📅", className: "is-timeline" },
    secrets: { label: "Secrets", emoji: "🔑", className: "is-secrets" },
  };
  return map[normalized];
}

function nextMemoryId() {
  return `memory-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function nextArchiveId() {
  return `archive-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function formatMemoryTimestamp(timestamp) {
  const value = Number(timestamp) || Date.now();
  return new Intl.DateTimeFormat([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
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
  return appState.activeConversationId || persistedState?.appSettings?.lastActiveConversationId || "angel-bunny";
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

function nextStickerPackId() {
  return `pack-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function nextStickerId() {
  return `sticker-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
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

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getStickerPacks() {
  return Array.isArray(persistedState.stickerPacks) ? persistedState.stickerPacks : [];
}

function getStickerPack(packId) {
  return getStickerPacks().find((pack) => pack.id === packId) || null;
}

function saveStickerPacks(nextPacks) {
  persistedState.stickerPacks = nextPacks;
  saveChatState();
}

function createBlankStickerPack() {
  return {
    id: nextStickerPackId(),
    name: "New Pack",
    stickers: [],
  };
}

function openStickerStore(packId = "") {
  appState.activeScreen = "messages";
  appState.activeMessagesTab = "settings";
  appState.messagesView = "sticker-store";
  appState.stickerStoreView = packId ? "editor" : "packs";
  appState.editingStickerPackId = packId || null;
  appState.stickerPackDraft = packId ? JSON.parse(JSON.stringify(getStickerPack(packId))) : null;
}

function closeStickerStore() {
  appState.messagesView = "list";
  appState.stickerStoreView = "packs";
  appState.editingStickerPackId = null;
  appState.stickerPackDraft = null;
  appState.activeMessagesTab = "settings";
}

function openStickerPackEditor(packId = "") {
  const draft = packId ? JSON.parse(JSON.stringify(getStickerPack(packId))) : createBlankStickerPack();
  appState.messagesView = "sticker-store";
  appState.stickerStoreView = "editor";
  appState.editingStickerPackId = draft.id;
  appState.stickerPackDraft = draft;
}

function closeStickerPackEditor() {
  appState.stickerStoreView = "packs";
  appState.editingStickerPackId = null;
  appState.stickerPackDraft = null;
}

function stickerPackPreview(pack) {
  return pack?.stickers?.[0]?.imageDataUrl || "";
}

function persistStickerPackDraft() {
  const draft = appState.stickerPackDraft;
  if (!draft) {
    return;
  }

  const normalizedPack = {
    ...draft,
    name: (draft.name || "Untitled Pack").trim() || "Untitled Pack",
    stickers: Array.isArray(draft.stickers) ? draft.stickers : [],
  };

  const existingPacks = getStickerPacks();
  const nextPacks = existingPacks.some((pack) => pack.id === normalizedPack.id)
    ? existingPacks.map((pack) => (pack.id === normalizedPack.id ? normalizedPack : pack))
    : [normalizedPack, ...existingPacks];

  saveStickerPacks(nextPacks);
  appState.activeStickerPackId = normalizedPack.id;
  closeStickerPackEditor();
}

function findStickerById(stickerId) {
  for (const pack of getStickerPacks()) {
    const sticker = (pack.stickers || []).find((entry) => entry.id === stickerId);
    if (sticker) {
      return { pack, sticker };
    }
  }
  return null;
}

function chooseStickerForAiReply(replyText, profile) {
  if (!profile.allowAiStickers) {
    return null;
  }

  const allStickers = getStickerPacks().flatMap((pack) =>
    (pack.stickers || []).map((sticker) => ({
      ...sticker,
      packId: pack.id,
    })),
  );
  if (!allStickers.length) {
    return null;
  }

  const loweredReply = String(replyText || "").toLowerCase();
  const matching = allStickers.filter((sticker) => {
    const descriptionWords = `${sticker.name} ${sticker.description}`.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    return descriptionWords.some((word) => word.length > 2 && loweredReply.includes(word));
  });

  if (!matching.length) {
    return null;
  }

  const conversation = getConversation(currentConversationId()).filter((message) => !message.typing);
  const recentAiStickerMessages = conversation.slice(-4).filter((message) => message.role === "ai" && message.stickerId);
  if (recentAiStickerMessages.length >= 2) {
    return null;
  }

  const chance = profile.aiStickerFrequency === "high" ? 0.42 : 0.18;
  if (Math.random() > chance) {
    return null;
  }

  return matching[Math.floor(Math.random() * matching.length)] || null;
}

function appendAiStickerForReply(conversationId, replyText) {
  const profile = getProfile(conversationId);
  const sticker = chooseStickerForAiReply(replyText, profile);
  if (!sticker) {
    return;
  }

  appendMessage(
    conversationId,
    createMessage({
      role: "ai",
      text: "",
      timestamp: formatLocalTime(),
      status: "delivered",
      metaType: "assistant-sticker",
      stickerId: sticker.id,
      stickerPackId: sticker.packId,
      stickerImageDataUrl: sticker.imageDataUrl,
      stickerName: sticker.name,
      stickerDescription: sticker.description,
    }),
  );
}

function sendStickerMessage(conversationId, sticker) {
  const outgoingMessage = createMessage({
    role: "user",
    text: "",
    timestamp: formatLocalTime(),
    status: "sent",
    attempts: 1,
    requestPayload: {
      text: "",
      imageDataUrl: "",
      stickerId: sticker.id,
      stickerName: sticker.name,
      stickerDescription: sticker.description,
    },
    metaType: "user-sticker",
    stickerId: sticker.id,
    stickerPackId: sticker.packId,
    stickerImageDataUrl: sticker.imageDataUrl,
    stickerName: sticker.name,
    stickerDescription: sticker.description,
  });
  appendMessage(conversationId, outgoingMessage);
  appState.stickerPickerOpen = false;
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
    star: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4.6l2.2 4.4 4.8.7-3.5 3.4.8 4.8L12 15.6 7.7 18l.8-4.8L5 9.7l4.8-.7L12 4.6z" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linejoin="round"/>
      </svg>
    `,
    copy: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="8" y="7" width="10" height="12" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/>
        <path d="M6.5 15.5H6A2.5 2.5 0 0 1 3.5 13V6A2.5 2.5 0 0 1 6 3.5h7A2.5 2.5 0 0 1 15.5 6v.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
    `,
    replyArrow: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9.5 8.5L5.5 12l4 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 12h7.2c3.2 0 5.3 1 6.8 3.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
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
  createdAt = Date.now(),
  status = "sent",
  failed = false,
  retrying = false,
  typing = false,
  attempts = 0,
  imageDataUrl = "",
  requestPayload = null,
  errorMessage = "",
  metaType = "",
  isFavorited = false,
  quotedMessageId = "",
  quotedMessageText = "",
  deleting = false,
  stickerId = "",
  stickerImageDataUrl = "",
  stickerName = "",
  stickerDescription = "",
  stickerPackId = "",
  bubbleParts = [],
  revealedBubbleCount = 0,
}) {
  return {
    id: nextMessageId(),
    role,
    text,
    timestamp,
    createdAt,
    status,
    failed,
    retrying,
    typing,
    attempts,
    imageDataUrl,
    requestPayload,
    errorMessage,
    metaType,
    isFavorited,
    quotedMessageId,
    quotedMessageText,
    deleting,
    stickerId,
    stickerImageDataUrl,
    stickerName,
    stickerDescription,
    stickerPackId,
    bubbleParts,
    revealedBubbleCount,
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

function normalizeIntervalMinutes(value, fallbackMinutes) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return fallbackMinutes;
  }
  return Math.max(1, Math.min(24 * 60, Math.round(numericValue)));
}

function formatIntervalLabel(minutes) {
  const safeMinutes = normalizeIntervalMinutes(minutes, DEFAULT_PROACTIVE_INTERVAL_MINUTES);
  if (safeMinutes < 60) {
    return `${safeMinutes} min`;
  }
  const hours = Math.floor(safeMinutes / 60);
  const remainder = safeMinutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
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

function formatElapsedContext(timestamp) {
  const value = Number(timestamp) || 0;
  if (!value) {
    return "You have not heard from the user in a while.";
  }

  const diffMinutes = Math.max(1, Math.round((Date.now() - value) / 60000));
  if (diffMinutes >= 24 * 60) {
    const days = Math.floor(diffMinutes / (24 * 60));
    const remainingHours = Math.floor((diffMinutes % (24 * 60)) / 60);
    if (!remainingHours) {
      return `It has been about ${days} day${days === 1 ? "" : "s"} since the user last replied.`;
    }
    return `It has been about ${days} day${days === 1 ? "" : "s"} and ${remainingHours} hour${remainingHours === 1 ? "" : "s"} since the user last replied.`;
  }
  if (diffMinutes < 60) {
    return `It has been about ${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} since the user last replied.`;
  }
  const hours = Math.floor(diffMinutes / 60);
  const remainingMinutes = diffMinutes % 60;
  if (!remainingMinutes) {
    return `It has been about ${hours} hour${hours === 1 ? "" : "s"} since the user last replied.`;
  }
  return `It has been about ${hours} hour${hours === 1 ? "" : "s"} and ${remainingMinutes} minute${remainingMinutes === 1 ? "" : "s"} since the user last replied.`;
}

function recentLiveMessages(conversationId, limit = 20) {
  return getConversation(conversationId)
    .filter(
      (message) =>
        !message.typing &&
        !message.failed &&
        message.metaType !== "assistant-sticker" &&
        message.metaType !== "archive-placeholder",
    )
    .slice(-limit);
}

function injectMemoryContext(characterId) {
  const memories = getMemories(characterId)
    .slice(-12)
    .map((entry) => `${memoryCategoryMeta(entry.category).label}: ${entry.fact}`);
  const archives = getConversationArchives(characterId)
    .slice(-3)
    .map((entry) => entry.summary);
  const sections = [];

  if (memories.length) {
    sections.push(`You remember these facts about the user:\n- ${memories.join("\n- ")}`);
  }

  if (archives.length) {
    sections.push(`Summary of relationship history:\n- ${archives.join("\n- ")}`);
  }

  return sections.join("\n\n");
}

function extractJsonCandidate(text) {
  const cleaned = String(text || "").trim();
  if (!cleaned || /^null$/i.test(cleaned)) {
    return null;
  }

  try {
    return JSON.parse(cleaned);
  } catch (_error) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]);
    } catch (_nestedError) {
      return null;
    }
  }
}

function dedupeMemoryNotes(existingNotes, nextNote) {
  const normalizedFact = String(nextNote.fact || "")
    .trim()
    .toLowerCase();
  if (!normalizedFact) {
    return true;
  }

  return existingNotes.some(
    (entry) =>
      String(entry.fact || "")
        .trim()
        .toLowerCase() === normalizedFact,
  );
}

async function extractMemory(characterId) {
  const lockKey = `memory-extract:${characterId}`;
  if (automationLocks.has(lockKey) || !canUseActiveApiProfile()) {
    return null;
  }

  const recentSlice = recentLiveMessages(characterId, 5);
  if (!recentSlice.length) {
    return null;
  }

  automationLocks.add(lockKey);
  try {
    const transcript = recentSlice
      .map((message) => `${message.role === "ai" ? "Character" : "User"}: ${buildMessageTextForModel(message)}`)
      .join("\n");
    const response = await executeProfileRequest(getActiveApiProfile(), [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              'Review the recent chat slice and extract only one concrete personal fact, preference, important event, or secret if the user revealed one. Return only JSON like {"fact":"string","category":"bio|likes|timeline|secrets"} or NULL. Keep "fact" under 10 words. Do not invent facts.',
          },
        ],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: transcript }],
      },
    ]);
    const parsed = extractJsonCandidate(response);
    if (!parsed?.fact) {
      return null;
    }

    const memories = getMemories(characterId);
    const nextNote = {
      id: nextMemoryId(),
      characterId,
      fact: String(parsed.fact).trim().slice(0, 140),
      category: normalizeMemoryCategory(parsed.category),
      timestamp: Date.now(),
      sourceMessageIds: recentSlice.map((entry) => entry.id),
    };

    if (dedupeMemoryNotes(memories, nextNote)) {
      return null;
    }

    setMemories(characterId, [nextNote, ...memories].slice(0, 120));
    return nextNote;
  } catch (error) {
    console.warn("Memory extraction failed:", error);
    return null;
  } finally {
    automationLocks.delete(lockKey);
  }
}

function buildArchivePlaceholder(summary) {
  return createMessage({
    role: "ai",
    text: `Summary of chat history: ${summary}`,
    timestamp: formatLocalTime(),
    status: "delivered",
    metaType: "archive-placeholder",
  });
}

async function summarizeConversationChunk(characterId) {
  const lockKey = `memory-summary:${characterId}`;
  if (automationLocks.has(lockKey) || !canUseActiveApiProfile()) {
    return null;
  }

  const messages = getConversation(characterId);
  const compressible = messages.filter(
    (message) =>
      !message.typing &&
      !message.failed &&
      message.metaType !== "assistant-sticker" &&
      message.metaType !== "archive-placeholder",
  );

  if (compressible.length < 50) {
    return null;
  }

  const targetChunk = compressible.slice(0, 50);
  automationLocks.add(lockKey);
  try {
    const transcript = targetChunk
      .map((message) => `${message.role === "ai" ? "Character" : "User"}: ${buildMessageTextForModel(message)}`)
      .join("\n");
    const summary = await executeProfileRequest(getActiveApiProfile(), [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "Summarize this relationship/chat chunk in one compact paragraph. Focus on important emotional shifts, plans, preferences, and recurring topics. Do not narrate as an assistant. Return plain text only.",
          },
        ],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: transcript }],
      },
    ]);

    const cleanSummary = String(summary || "").trim();
    if (!cleanSummary) {
      return null;
    }

    const archives = getConversationArchives(characterId);
    const archiveEntry = {
      id: nextArchiveId(),
      characterId,
      summary: cleanSummary,
      timestamp: Date.now(),
      messageCountCompressed: targetChunk.length,
      category: "timeline",
    };
    setConversationArchives(characterId, [archiveEntry, ...archives].slice(0, 40));

    const chunkIds = new Set(targetChunk.map((message) => message.id));
    const remainder = messages.filter((message) => !chunkIds.has(message.id));
    persistedState.conversations[characterId] = [buildArchivePlaceholder(cleanSummary), ...remainder];
    saveChatState();
    return archiveEntry;
  } catch (error) {
    console.warn("Conversation summarization failed:", error);
    return null;
  } finally {
    automationLocks.delete(lockKey);
  }
}

async function maybeRunMemoryMaintenance(characterId) {
  const profile = getProfile(characterId);
  if (!profile) {
    return;
  }

  const extractionCount = Number(profile.memoryExtractionCount) || 0;
  if (extractionCount > 0 && extractionCount % 5 === 0) {
    await extractMemory(characterId);
  }

  await summarizeConversationChunk(characterId);
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
  const profile = getProfile(conversationId);
  if (!profile || message.typing) {
    return;
  }
  if (message.role === "user") {
    updateProfile(conversationId, {
      lastUserMessageAt: message.createdAt || Date.now(),
      memoryExtractionCount: (Number(profile.memoryExtractionCount) || 0) + 1,
    });
    return;
  }
  if (message.role === "ai") {
    updateProfile(conversationId, { lastCharacterMessageAt: message.createdAt || Date.now() });
  }
}

function getFavoritesForCharacter(characterId) {
  return Array.isArray(persistedState.favoritesLibrary?.[characterId]) ? persistedState.favoritesLibrary[characterId] : [];
}

function isMessageFavorited(characterId, messageId) {
  return getFavoritesForCharacter(characterId).some((entry) => entry.messageId === messageId);
}

function syncMessageFavoriteState(characterId, messageId, isFavorited) {
  updateMessage(characterId, messageId, (message) => ({
    ...message,
    isFavorited,
  }));
}

function clearQuotedMessage() {
  appState.quotedReplyTarget = null;
}

function openMessageContextMenu(messageId, anchorRect) {
  appState.activeContextMenuMessageId = messageId;
  appState.contextMenuAnchor = anchorRect;
}

function closeMessageContextMenu() {
  appState.activeContextMenuMessageId = null;
  appState.contextMenuAnchor = null;
}

function toggleFavoriteMessage(conversationId, messageId) {
  const conversation = getConversation(conversationId);
  const message = conversation.find((entry) => entry.id === messageId);
  if (!message) {
    return;
  }

  const currentFavorites = getFavoritesForCharacter(conversationId);
  const alreadyFavorited = currentFavorites.some((entry) => entry.messageId === messageId);

  if (alreadyFavorited) {
    persistedState.favoritesLibrary[conversationId] = currentFavorites.filter((entry) => entry.messageId !== messageId);
    syncMessageFavoriteState(conversationId, messageId, false);
  } else {
    persistedState.favoritesLibrary[conversationId] = [
      {
        characterId: conversationId,
        messageId,
        messageText: message.text || "",
        timestamp: message.timestamp,
      },
      ...currentFavorites,
    ];
    syncMessageFavoriteState(conversationId, messageId, true);
  }

  saveChatState();
}

function selectQuotedMessage(conversationId, messageId) {
  const message = getConversation(conversationId).find((entry) => entry.id === messageId);
  if (!message) {
    return;
  }

  appState.quotedReplyTarget = {
    messageId: message.id,
    text: message.text || "[Image]",
  };
}

function removeFavoriteEntry(characterId, messageId) {
  if (!persistedState.favoritesLibrary?.[characterId]) {
    return;
  }
  persistedState.favoritesLibrary[characterId] = persistedState.favoritesLibrary[characterId].filter((entry) => entry.messageId !== messageId);
}

function deleteMessage(conversationId, messageId) {
  updateMessage(conversationId, messageId, (message) => ({
    ...message,
    deleting: true,
  }));

  window.setTimeout(() => {
    persistedState.conversations[conversationId] = getConversation(conversationId).filter((message) => message.id !== messageId);
    removeFavoriteEntry(conversationId, messageId);
    if (appState.quotedReplyTarget?.messageId === messageId) {
      clearQuotedMessage();
    }
    saveChatState();
    render();
  }, 180);
}

async function copyMessageText(conversationId, messageId) {
  const message = getConversation(conversationId).find((entry) => entry.id === messageId);
  if (!message?.text) {
    return;
  }

  try {
    await navigator.clipboard.writeText(message.text);
  } catch (_error) {
    // Silent fail for unsupported clipboard environments.
  }
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
  persistedState.appSettings.lastActiveConversationId = conversationId;
  saveChatState();
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
  const memoryLimit = Math.max(1, Math.min(20, Number(profile.memoryMessageCount) || 20));
  const allHistory = getConversation(conversationId).filter(
    (message) =>
      !message.typing &&
      !message.failed &&
      message.metaType !== "assistant-sticker" &&
      message.metaType !== "archive-placeholder",
  );
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
  const memoryInjection = injectMemoryContext(conversationId);
  const characterPrompt = profile.characterPrompt || profile.worldbook || "";
  const promptSections = [FIXED_CHARACTER_SYSTEM_PROMPT];
  if (profile.useGlobalWordbook && persistedState.appSettings.globalWordbook?.trim()) {
    promptSections.push(persistedState.appSettings.globalWordbook.trim());
  }
  promptSections.push(characterPrompt);
  if (memoryInjection) {
    promptSections.push(memoryInjection);
  }
  const systemText =
    `${promptSections.filter(Boolean).join("\n\n")}\n\n` +
    `${awareness.join(" ")}\n\n` +
    `Remember up to ${memoryLimit} recent messages. ` +
    `${profile.intelligentMemoryManagement ? "Prefer emotionally salient and image-bearing moments when staying consistent." : ""} ` +
    `Proactive message interval preference: about every ${formatIntervalLabel(profile.proactiveIntervalMinutes || DEFAULT_PROACTIVE_INTERVAL_MINUTES)} when appropriate. ` +
    `Blocked state: ${profile.isBlocked ? "blocked" : "not blocked"}. ` +
    `Display name: ${profile.name}. ` +
    `If the user sends a sticker, treat it as a real emotional message and respond naturally to the sticker's mood or meaning. ` +
    `Speak as ${profile.name} in a soft, intimate WeChat style.`;

  const input = [
    {
      role: "system",
      content: [{ type: "input_text", text: systemText }],
    },
  ];

  uniqueHistory.forEach((message) => {
    const content = [];
    const textForModel = buildMessageTextForModel(message);
    if (textForModel) {
      content.push({ type: "input_text", text: textForModel });
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

function buildMessageTextForModel(message) {
  const parts = [];
  if (message.quotedMessageText) {
    parts.push(`Quoted earlier message for context: "${message.quotedMessageText}"`);
  }
  if (message.stickerName || message.stickerDescription) {
    const actorLabel = message.role === "ai" ? "You sent a sticker" : "The user sent a sticker";
    parts.push(
      `${actorLabel} instead of text. Sticker name: ${message.stickerName || "Unnamed sticker"}. Mood/description: ${message.stickerDescription || "No description provided"}. Treat it as part of the conversation naturally.`,
    );
  }
  if (message.text) {
    parts.push(String(message.text).replace(/\s*\[BREAK\]\s*/g, "\n\n"));
  }
  return parts.filter(Boolean).join("\n\n").trim();
}

function processAIResponse(rawText) {
  const cleaned = String(rawText || "")
    .replace(/\r/g, "")
    .trim();
  const bubbleParts = cleaned
    .split(/\s*\[BREAK\]\s*/g)
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (!bubbleParts.length && cleaned) {
    return {
      text: cleaned,
      bubbleParts: [cleaned],
    };
  }

  return {
    text: bubbleParts.join(" ").trim(),
    bubbleParts,
  };
}

function buildAutomationInput(conversationId, mode) {
  const input = buildOpenAIInput(conversationId);
  const profile = getProfile(conversationId);
  const latestMessage = latestVisibleMessage(conversationId);
  const latestSummary = messagePreview(latestMessage);
  const unansweredCount = countUnansweredProactiveMessages(conversationId);
  const baseInstruction =
    mode === "moment"
      ? [
          "Create a very short in-character WeChat Moments post.",
          "Write it like this character is posting to their own Moments feed naturally after living their day, not directly replying in chat.",
          "It should feel realistic for a private little social post: a passing mood, vague feeling, tiny update, or soft indirect thought.",
          "Do not address the user directly unless it feels subtle and realistic.",
          "Do not write it like a letter, scene, narration, roleplay, or assistant answer.",
          "Keep it to 1 or 2 short lines, casual, human, and post-like.",
          "No hashtags, no quotation marks around the whole post, no stage directions, no formal writing.",
          latestSummary ? `Recent chat mood for context only: ${latestSummary}.` : "",
          profile.timeAwareness ? `Use the current time context naturally: ${currentTimeContext()}.` : "",
        ]
      : [
          "Send one proactive in-character message to the user.",
          "This is not a reply. You are reaching out first because time passed and you noticed their silence.",
          "This should feel like a realistic clingy or caring follow-up, not a random interruption.",
          "Only send something you would genuinely text after waiting and noticing the gap.",
          formatElapsedContext(profile.lastUserMessageAt),
          `This is unanswered reach-out number ${unansweredCount + 1}.`,
          unansweredCount === 0
            ? "Make it soft and easy, like a first little check-in."
            : unansweredCount === 1
              ? "Make it a bit more direct or needy, like you noticed they still did not answer."
              : "Make it feel more restless, clingy, worried, or annoyed in-character, like multiple texts after being ignored.",
          latestSummary ? `Last visible chat context: ${latestSummary}.` : "",
          profile.timeAwareness ? `Use the local time naturally: ${currentTimeContext()}.` : "",
          "Keep it to 1 or 2 short text-message lines, gentle and natural.",
          "Do not suddenly change topics, but it is okay to send follow-up energy if the user is still silent.",
          "Avoid repeating the exact same wording as prior proactive messages.",
          "Do not explain that you are an AI or mention prompts.",
        ];

  return [
    ...input,
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: baseInstruction.filter(Boolean).join(" "),
        },
      ],
    },
  ];
}

async function callOpenAI(conversationId) {
  const activeApiProfile = getActiveApiProfile();
  return executeProfileRequest(activeApiProfile, conversationId);
}

function canUseActiveApiProfile() {
  const activeApiProfile = getActiveApiProfile();
  return !!(activeApiProfile?.apiKey && activeApiProfile?.apiUrl);
}

async function requestGeneratedProactiveMessage(conversationId) {
  const activeApiProfile = getActiveApiProfile();
  return executeProfileRequest(activeApiProfile, buildAutomationInput(conversationId, "proactive"));
}

async function requestGeneratedMomentPost(conversationId) {
  const activeApiProfile = getActiveApiProfile();
  return executeProfileRequest(activeApiProfile, buildAutomationInput(conversationId, "moment"));
}

function countUnansweredProactiveMessages(conversationId, now = Date.now()) {
  const messages = getConversation(conversationId).filter((message) => !message.typing && !message.failed);
  const last24HoursThreshold = now - 24 * 60 * 60 * 1000;
  let count = 0;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role === "user") {
      break;
    }
    if (
      message.role === "ai" &&
      message.metaType === "spontaneous" &&
      (Number(message.createdAt) || 0) >= last24HoursThreshold
    ) {
      count += 1;
    }
  }

  return count;
}

function shouldAllowProactiveReachout(profile, now) {
  const proactiveIntervalMs = normalizeIntervalMinutes(profile.proactiveIntervalMinutes, DEFAULT_PROACTIVE_INTERVAL_MINUTES) * 60 * 1000;
  const lastUserAt = Number(profile.lastUserMessageAt) || 0;
  const lastCharacterAt = Number(profile.lastCharacterMessageAt) || 0;
  const unansweredCount = countUnansweredProactiveMessages(profile.id, now);
  const anchorTime = lastCharacterAt > lastUserAt ? lastCharacterAt : lastUserAt;

  if (!profile.proactiveMessaging || !canUseActiveApiProfile()) {
    return false;
  }

  if (!lastUserAt) {
    return false;
  }

  if (unansweredCount >= 4) {
      return false;
  }

  return now - anchorTime >= proactiveIntervalMs;
}

function shouldAllowMomentsPost(profile, now) {
  const momentsIntervalMs = normalizeIntervalMinutes(profile.momentsIntervalMinutes, DEFAULT_MOMENTS_INTERVAL_MINUTES) * 60 * 1000;
  const lastMomentAt = Number(profile.lastMomentPostAt) || 0;
  return !!(profile.momentsPosting && canUseActiveApiProfile() && now - (lastMomentAt || now) >= momentsIntervalMs);
}

function receiveMessage(conversationId, responseText) {
  const processed = processAIResponse(responseText);
  const aiMessage = createMessage({
    role: "ai",
    text: processed.text,
    timestamp: formatLocalTime(),
    status: "delivered",
    metaType: "assistant",
    bubbleParts: processed.bubbleParts,
    revealedBubbleCount: processed.bubbleParts.length ? 1 : 0,
  });

  appendMessage(conversationId, aiMessage);
  const remainingParts = Math.max(0, processed.bubbleParts.length - 1);

  if (!remainingParts) {
    appendAiStickerForReply(conversationId, processed.text);
    return;
  }

  for (let index = 0; index < remainingParts; index += 1) {
    const typingTimer = window.setTimeout(() => {
      addTypingMessage(conversationId);
      render();
    }, index * 1250 + 220);
    appState.conversationTimers.push(typingTimer);

    const revealTimer = window.setTimeout(() => {
      removeTypingMessage(conversationId);
      updateMessage(conversationId, aiMessage.id, (message) => ({
        ...message,
        revealedBubbleCount: Math.min((message.revealedBubbleCount || 1) + 1, processed.bubbleParts.length),
      }));
      if (index === remainingParts - 1) {
        appendAiStickerForReply(conversationId, processed.text);
      }
      render();
    }, index * 1250 + 1080 + Math.floor(Math.random() * 320));
    appState.conversationTimers.push(revealTimer);
  }
}

function scheduleMemoryMaintenance(conversationId) {
  window.setTimeout(() => {
    maybeRunMemoryMaintenance(conversationId);
  }, 600);
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
    scheduleMemoryMaintenance(conversationId);
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
      quotedMessageId: appState.quotedReplyTarget?.messageId || "",
      quotedMessageText: appState.quotedReplyTarget?.text || "",
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
      quotedMessageId: outgoingPayload.quotedMessageId,
      quotedMessageText: outgoingPayload.quotedMessageText,
    });

    appendMessage(conversationId, outgoingMessage);
    targetMessageId = outgoingMessage.id;
    appState.draftMessage = "";
    appState.pendingAttachment = null;
    clearQuotedMessage();
    closeMessageContextMenu();
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
  updateProfile(characterId, { lastMomentPostAt: Date.now() });
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

  if (contents.length === 1 && contents[0]?.role === "model") {
    delete contents[0].role;
  } else if (contents.length && contents[contents.length - 1]?.role === "model") {
    contents.push({
      role: "user",
      parts: [{ text: "Respond naturally to the latest conversation state." }],
    });
  }

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
    if (data.promptFeedback?.blockReason) {
      throw new Error(`The model blocked the prompt: ${data.promptFeedback.blockReason}.`);
    }
    const candidateText = (data.candidates || [])
      .flatMap((entry) => entry?.content?.parts || [])
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .filter((text) => text.trim())
      .join("\n\n")
      .trim();
    if (candidateText) {
      return candidateText;
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

function describeEmptyResponse(data, profile) {
  if (profile.providerPreset === "google" || data?.candidates) {
    const candidate = data?.candidates?.[0];
    if (candidate?.finishReason) {
      return `Google finishReason: ${candidate.finishReason}.`;
    }
    if (data?.promptFeedback?.blockReason) {
      return `Google block reason: ${data.promptFeedback.blockReason}.`;
    }
  }

  if (profile.requestFormat === "anthropic" || profile.providerPreset === "anthropic") {
    if (data?.stop_reason) {
      return `Claude stop reason: ${data.stop_reason}.`;
    }
  }

  if (data?.choices?.[0]?.finish_reason) {
    return `Finish reason: ${data.choices[0].finish_reason}.`;
  }

  const compact = JSON.stringify(data || {}).slice(0, 220);
  return compact ? `Response preview: ${compact}` : "";
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
    throw new Error(`The model returned an empty response. ${describeEmptyResponse(data, profile)}`.trim());
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

async function maybeSimulateCharacterActivity() {
  const now = Date.now();

  for (const profile of Object.values(persistedState.characterProfiles)) {
    if (!profile.isVisible) {
      continue;
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
      continue;
    }

    const shouldPing = shouldAllowProactiveReachout(profile, now);
    const shouldPostMoment = shouldAllowMomentsPost(profile, now);

    if (shouldPing && !automationLocks.has(`proactive:${profile.id}`)) {
      automationLocks.add(`proactive:${profile.id}`);
      try {
        const proactiveText = await requestGeneratedProactiveMessage(profile.id);
        appendMessage(
          profile.id,
          createMessage({
            role: "ai",
            text: proactiveText,
            timestamp: formatLocalTime(),
            status: "delivered",
            metaType: "spontaneous",
          }),
        );
        if (appState.activeConversationId === profile.id && appState.messagesView === "chat") {
          render();
        }
      } catch (_error) {
        // Silent retry on next interval; user-facing failures stay in direct chat sends only.
      } finally {
        automationLocks.delete(`proactive:${profile.id}`);
      }
    }

    if (shouldPostMoment && !automationLocks.has(`moment:${profile.id}`)) {
      automationLocks.add(`moment:${profile.id}`);
      try {
        const momentText = await requestGeneratedMomentPost(profile.id);
        createMomentPost(profile.id, momentText);
        if (appState.activeMessagesTab === "moments" && appState.activeScreen === "messages") {
          render();
        }
      } catch (_error) {
        // Silent retry on next interval.
      } finally {
        automationLocks.delete(`moment:${profile.id}`);
      }
    }
  }
}

function startSimulationLoop() {
  if (simulationLoopId) {
    window.clearInterval(simulationLoopId);
  }

  maybeSimulateCharacterActivity();
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

function visibleCharacterProfiles() {
  return Object.values(persistedState.characterProfiles).filter((profile) => profile.isVisible);
}

function memoryFilterProfiles() {
  return visibleCharacterProfiles().filter(
    (profile) => getMemories(profile.id).length || getConversationArchives(profile.id).length || getConversation(profile.id).length,
  );
}

function renderMemoryScreen() {
  const profiles = memoryFilterProfiles();
  const selectedCharacterId =
    appState.memoryCharacterFilter !== "all" && profiles.some((profile) => profile.id === appState.memoryCharacterFilter)
      ? appState.memoryCharacterFilter
      : "all";
  const categoryFilter = appState.memoryCategoryFilter || "all";
  const searchQuery = String(appState.memorySearchQuery || "").trim().toLowerCase();
  const cards = profiles
    .filter((profile) => selectedCharacterId === "all" || profile.id === selectedCharacterId)
    .flatMap((profile) => {
      const memoryCards = getMemories(profile.id).map((entry) => ({
        id: entry.id,
        characterId: profile.id,
        profile,
        kind: "memory",
        text: entry.fact,
        category: normalizeMemoryCategory(entry.category),
        timestamp: entry.timestamp,
      }));
      const archiveCards = getConversationArchives(profile.id).map((entry) => ({
        id: entry.id,
        characterId: profile.id,
        profile,
        kind: "archive",
        text: entry.summary,
        category: "timeline",
        timestamp: entry.timestamp,
      }));
      return [...memoryCards, ...archiveCards];
    })
    .filter((entry) => categoryFilter === "all" || entry.category === categoryFilter)
    .filter((entry) => !searchQuery || `${entry.text} ${entry.profile.name}`.toLowerCase().includes(searchQuery))
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  const categoryButtons = [
    { id: "all", label: "All" },
    { id: "bio", label: "👤 Bio" },
    { id: "likes", label: "❤️ Likes/Dislikes" },
    { id: "timeline", label: "📅 Timeline" },
    { id: "secrets", label: "🔑 Secrets" },
  ];

  return `
    <div class="phone-shell phone-shell--messages">
      <div class="shell-inner shell-inner--messages">
        ${renderStatusBar()}
        <div class="messages-app memory-app">
          <div class="messages-pane memory-pane">
            <div class="messages-header">
              <button type="button" class="messages-back" data-action="go-home" aria-label="Back to home">
                ${iconSvg("back")}
              </button>
              <div class="messages-header-title">Memory</div>
              <div class="messages-header-spacer"></div>
            </div>

            <section class="memory-filter-rail">
              <button type="button" class="memory-avatar-pill ${selectedCharacterId === "all" ? "is-active" : ""}" data-action="filter-memory-character" data-character-id="all">
                <span class="memory-avatar-label">All</span>
              </button>
              ${profiles
                .map(
                  (profile) => `
                    <button type="button" class="memory-avatar-pill ${selectedCharacterId === profile.id ? "is-active" : ""}" data-action="filter-memory-character" data-character-id="${profile.id}">
                      <span class="memory-avatar-thumb">${imageMarkup(profile.avatar, `${profile.name} avatar`, "h-full w-full", "AV")}</span>
                      <span class="memory-avatar-label">${profile.name}</span>
                    </button>
                  `,
                )
                .join("")}
            </section>

            <section class="memory-search-shell">
              <input type="search" class="memory-search-input" data-role="memory-search-input" value="${escapeAttribute(appState.memorySearchQuery)}" placeholder="Search memories" />
            </section>

            <section class="memory-category-row">
              ${categoryButtons
                .map(
                  (item) => `
                    <button type="button" class="memory-category-chip ${categoryFilter === item.id ? "is-active" : ""}" data-action="filter-memory-category" data-category="${item.id}">
                      ${item.label}
                    </button>
                  `,
                )
                .join("")}
            </section>

            <section class="memory-cards-list">
              ${
                cards.length
                  ? cards
                      .map((entry) => {
                        const meta = memoryCategoryMeta(entry.category);
                        return `
                          <article class="memory-card">
                            <div class="memory-card-top">
                              <span class="memory-type-tag ${meta.className}">${meta.emoji} ${meta.label}</span>
                              <button type="button" class="memory-delete-button" data-action="${entry.kind === "archive" ? "delete-archive" : "delete-memory"}" data-character-id="${entry.characterId}" data-memory-id="${entry.id}" aria-label="Delete memory">
                                ${iconSvg("delete")}
                              </button>
                            </div>
                            <div class="memory-card-text">${entry.text}</div>
                            <div class="memory-card-meta">${entry.profile.name} · ${formatMemoryTimestamp(entry.timestamp)}</div>
                          </article>
                        `;
                      })
                      .join("")
                  : `
                    <div class="messages-empty messages-empty-card">
                      <div class="messages-empty-title">No memories yet</div>
                      <p>Once chats deepen, this screen will hold extracted facts and compressed relationship summaries.</p>
                    </div>
                  `
              }
            </section>
          </div>
        </div>
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
  const visibleProfiles = Object.values(persistedState.characterProfiles).filter(
    (profile) => profile.isVisible && getConversation(profile.id).some((message) => !message.typing),
  );

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
                        <span class="contact-tag">${formatIntervalLabel(profile.proactiveIntervalMinutes || DEFAULT_PROACTIVE_INTERVAL_MINUTES)}</span>
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
                    <button type="button" class="settings-row" ${item === "Emoji Store" ? 'data-action="open-sticker-store"' : ""}>
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

function renderStickerImageMessage(message) {
  if (!message.stickerImageDataUrl) {
    return "";
  }

  return `
    <div class="sticker-message-shell">
      <img src="${escapeAttribute(message.stickerImageDataUrl)}" alt="${escapeAttribute(message.stickerName || "Sticker")}" class="sticker-message-image" />
    </div>
  `;
}

function renderMessage(conversationId, message) {
  const profile = getProfile(conversationId);
  if (message.typing) {
    return renderTypingBubble(profile);
  }

  const isUser = message.role === "user";
  const isFavorited = message.isFavorited || isMessageFavorited(conversationId, message.id);
  const metaText = message.failed ? "Failed" : message.status === "read" ? "Read" : "Sent";
  const hasStickerOnly = !!message.stickerImageDataUrl && !message.text && !message.imageDataUrl;
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

  const quotedBlock = message.quotedMessageText
    ? `
      <div class="message-quoted-block">
        <span>${message.quotedMessageText}</span>
      </div>
    `
    : "";

  const favoriteBadge = !isUser
    ? `<button type="button" class="message-favorite-badge ${isFavorited ? "is-active" : ""}" data-action="toggle-favorite-message" data-message-id="${message.id}" aria-label="${isFavorited ? "Unfavorite message" : "Favorite message"}">${iconSvg("star")}</button>`
    : "";
  const visibleBubbleParts = !isUser
    ? (Array.isArray(message.bubbleParts) && message.bubbleParts.length ? message.bubbleParts : message.text ? [message.text] : []).slice(
        0,
        message.revealedBubbleCount || (Array.isArray(message.bubbleParts) && message.bubbleParts.length ? message.bubbleParts.length : 1),
      )
    : [];
  const aiBubbleCluster = !isUser
    ? visibleBubbleParts
        .map(
          (part, index) => `
            <div class="message-bubble message-bubble--ai message-bubble--cluster ${index === 0 ? "is-first" : ""} ${index === visibleBubbleParts.length - 1 ? "is-last" : ""}" data-message-bubble="${message.id}">
              ${index === 0 ? quotedBlock : ""}
              ${index === 0 ? imageBlock : ""}
              <p>${part}</p>
            </div>
          `,
        )
        .join("")
    : "";

  return `
    <div class="message-row ${isUser ? "message-row--user" : "message-row--ai"} ${message.deleting ? "is-deleting" : ""}">
      ${
        isUser
          ? `
            <div class="message-stack message-stack--user">
              <div class="message-meta message-meta--user">
                <span>${metaText}</span>
                ${retryButton}
              </div>
              ${errorDetail}
              ${
                hasStickerOnly
                  ? renderStickerImageMessage(message)
                  : `
                    <div class="message-bubble message-bubble--user">
                      ${quotedBlock}
                      ${imageBlock}
                      ${message.text ? `<p>${message.text}</p>` : ""}
                    </div>
                  `
              }
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
              ${
                hasStickerOnly
                  ? renderStickerImageMessage(message)
                  : `
                    <div class="message-bubble-shell">
                      <div class="message-cluster">
                        ${aiBubbleCluster || `<div class="message-bubble message-bubble--ai" data-message-bubble="${message.id}">${quotedBlock}${imageBlock}${message.text ? `<p>${message.text}</p>` : ""}</div>`}
                      </div>
                      ${favoriteBadge}
                    </div>
                  `
              }
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

function renderStickerStoreScreen() {
  const packs = getStickerPacks();
  const draft = appState.stickerPackDraft;

  if (appState.stickerStoreView === "editor" && draft) {
    return `
      <div class="messages-pane sticker-store-pane">
        <div class="messages-header">
          <button type="button" class="messages-back" data-action="close-sticker-pack-editor" aria-label="Back to packs">
            ${iconSvg("back")}
          </button>
          <div class="messages-header-title">Sticker Pack</div>
          <div class="messages-header-spacer"></div>
        </div>

        <input type="file" accept="image/png,image/*" hidden data-role="sticker-upload-input" multiple />

        <section class="sticker-store-card">
          <label class="chat-settings-stack-row">
            <span class="chat-settings-row-title">Pack Name</span>
            <input type="text" class="chat-settings-text-input" data-role="sticker-pack-name-input" value="${escapeAttribute(draft.name)}" />
          </label>
          <button type="button" class="sticker-store-upload" data-action="pick-sticker-files">Upload Stickers</button>
        </section>

        <section class="sticker-store-list">
          ${
            (draft.stickers || []).length
              ? draft.stickers
                  .map(
                    (sticker) => `
                      <article class="sticker-store-item">
                        <div class="sticker-store-thumb">
                          <img src="${escapeAttribute(sticker.imageDataUrl)}" alt="${escapeAttribute(sticker.name || "Sticker")}" />
                        </div>
                        <div class="sticker-store-fields">
                          <input type="text" class="chat-settings-text-input" data-role="sticker-name-input" data-sticker-id="${sticker.id}" value="${escapeAttribute(sticker.name)}" placeholder="Sticker name" />
                          <textarea class="chat-settings-textarea sticker-store-textarea" data-role="sticker-description-input" data-sticker-id="${sticker.id}" placeholder="Mood / description">${escapeHtml(sticker.description)}</textarea>
                        </div>
                      </article>
                    `,
                  )
                  .join("")
              : `<div class="messages-empty messages-empty-card"><div class="messages-empty-title">No stickers yet</div><p>Upload PNG stickers to start this pack.</p></div>`
          }
        </section>

        <button type="button" class="character-save-button" data-action="save-sticker-pack">Save Pack</button>
      </div>
    `;
  }

  return `
    <div class="messages-pane sticker-store-pane">
      <div class="messages-header">
        <button type="button" class="messages-back" data-action="close-sticker-store" aria-label="Back to settings">
          ${iconSvg("back")}
        </button>
        <div class="messages-header-title">Emoji Store</div>
        <div class="messages-header-spacer"></div>
      </div>

      <button type="button" class="contacts-add-button" data-action="create-sticker-pack" aria-label="Create new pack">
        <span class="contacts-add-icon">+</span>
        <span>Create New Pack</span>
      </button>

      <section class="sticker-store-list">
        ${
          packs.length
            ? packs
                .map(
                  (pack) => `
                    <button type="button" class="sticker-pack-card" data-action="edit-sticker-pack" data-pack-id="${pack.id}">
                      <div class="sticker-pack-preview">
                        ${
                          stickerPackPreview(pack)
                            ? `<img src="${escapeAttribute(stickerPackPreview(pack))}" alt="${escapeAttribute(pack.name)} preview" />`
                            : `<div class="app-fallback">PK</div>`
                        }
                      </div>
                      <div class="sticker-pack-copy">
                        <h3>${pack.name}</h3>
                        <p>${pack.stickers.length} sticker${pack.stickers.length === 1 ? "" : "s"}</p>
                      </div>
                    </button>
                  `,
                )
                .join("")
            : `<div class="messages-empty messages-empty-card"><div class="messages-empty-title">No packs yet</div><p>Create a sticker pack to use stickers in chat.</p></div>`
        }
      </section>
    </div>
  `;
}

function renderStickerPicker() {
  const packs = getStickerPacks();
  if (!appState.stickerPickerOpen || !packs.length) {
    return "";
  }

  const activePackId = appState.activeStickerPackId || packs[0]?.id;
  const activePack = getStickerPack(activePackId) || packs[0];

  return `
    <div class="sticker-picker">
      <div class="sticker-picker-grid">
        ${(activePack?.stickers || [])
          .map(
            (sticker) => `
              <button type="button" class="sticker-picker-item" data-action="send-sticker" data-sticker-id="${sticker.id}">
                <img src="${escapeAttribute(sticker.imageDataUrl)}" alt="${escapeAttribute(sticker.name)}" />
              </button>
            `,
          )
          .join("")}
      </div>
      <div class="sticker-picker-packs">
        ${packs
          .map(
            (pack) => `
              <button type="button" class="sticker-pack-tab ${pack.id === activePack?.id ? "is-active" : ""}" data-action="switch-sticker-pack" data-pack-id="${pack.id}">
                ${
                  stickerPackPreview(pack)
                    ? `<img src="${escapeAttribute(stickerPackPreview(pack))}" alt="${escapeAttribute(pack.name)}" />`
                    : `<span>${pack.name.slice(0, 2)}</span>`
                }
              </button>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderQuotedReplyBar() {
  if (!appState.quotedReplyTarget) {
    return "";
  }

  return `
    <div class="quoted-reply-bar">
      <div class="quoted-reply-copy">
        <span class="quoted-reply-label">Replying to</span>
        <span class="quoted-reply-text">${appState.quotedReplyTarget.text}</span>
      </div>
      <button type="button" class="quoted-reply-close" data-action="clear-quoted-message" aria-label="Cancel quoted reply">×</button>
    </div>
  `;
}

function renderMessageContextMenu(conversationId) {
  const messageId = appState.activeContextMenuMessageId;
  const anchor = appState.contextMenuAnchor;
  if (!messageId || !anchor) {
    return "";
  }

  const isFavorited = isMessageFavorited(conversationId, messageId);
  return `
    <div class="message-context-menu" style="top:${anchor.top}px; left:${anchor.left}px;" data-role="message-context-menu">
      <button type="button" class="message-context-item" data-action="toggle-favorite-message" data-message-id="${messageId}">
        <span class="message-context-icon ${isFavorited ? "is-active" : ""}">${iconSvg("star")}</span>
        <span>Favorite</span>
      </button>
      <button type="button" class="message-context-item" data-action="quote-message" data-message-id="${messageId}">
        <span class="message-context-icon">${iconSvg("replyArrow")}</span>
        <span>Quote / Reply</span>
      </button>
      <button type="button" class="message-context-item" data-action="copy-message" data-message-id="${messageId}">
        <span class="message-context-icon">${iconSvg("copy")}</span>
        <span>Copy</span>
      </button>
      <button type="button" class="message-context-item is-destructive" data-action="delete-message" data-message-id="${messageId}">
        <span class="message-context-icon">${iconSvg("delete")}</span>
        <span>Delete</span>
      </button>
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
                  <span class="chat-settings-row-detail">Short-term live context, capped at 20 recent messages.</span>
                </span>
                <input type="number" min="1" max="20" class="chat-settings-inline-input" data-role="memory-count-input" value="${Math.min(20, profile.memoryMessageCount)}" />
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
                  <span class="chat-settings-row-title">Messaging Interval</span>
                  <span class="chat-settings-row-detail">Trigger a proactive AI message every ${formatIntervalLabel(profile.proactiveIntervalMinutes)} if enough time has passed.</span>
                </span>
                <input type="number" min="1" max="1440" class="chat-settings-inline-input" data-role="proactive-interval-input" value="${normalizeIntervalMinutes(profile.proactiveIntervalMinutes, DEFAULT_PROACTIVE_INTERVAL_MINUTES)}" />
              </label>
              ${renderToggleField("Character Posts to Moments", "moments-toggle", profile.momentsPosting, "Creates real auto-posts in the Moments tab.")}
              <label class="chat-settings-row">
                <span class="chat-settings-row-copy">
                  <span class="chat-settings-row-title">Moments Posting Interval</span>
                  <span class="chat-settings-row-detail">Create an AI-written Moments post every ${formatIntervalLabel(profile.momentsIntervalMinutes)}.</span>
                </span>
                <input type="number" min="1" max="1440" class="chat-settings-inline-input" data-role="moments-interval-input" value="${normalizeIntervalMinutes(profile.momentsIntervalMinutes, DEFAULT_MOMENTS_INTERVAL_MINUTES)}" />
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
              ${renderToggleField("Allow AI to use Stickers", "allow-ai-stickers-toggle", !!profile.allowAiStickers, "Lets this character attach matching stickers after replies.")}
              <label class="chat-settings-row">
                <span class="chat-settings-row-copy">
                  <span class="chat-settings-row-title">AI Sticker Frequency</span>
                  <span class="chat-settings-row-detail">${profile.aiStickerFrequency === "high" ? "More expressive, but still human." : "Occasional use only when it fits strongly."}</span>
                </span>
                <select class="chat-settings-inline-select" data-role="ai-sticker-frequency-select">
                  <option value="low" ${profile.aiStickerFrequency !== "high" ? "selected" : ""}>Low</option>
                  <option value="high" ${profile.aiStickerFrequency === "high" ? "selected" : ""}>High</option>
                </select>
              </label>
              <button type="button" class="chat-settings-row chat-settings-action" data-action="pick-wallpaper">
                <span class="chat-settings-row-copy">
                  <span class="chat-settings-row-title">Change Chat Wallpaper</span>
                  <span class="chat-settings-row-detail">${profile.chatWallpaper ? "Wallpaper set — tap to change" : "Choose an image from this device"}</span>
                </span>
                <span class="contacts-chevron">></span>
              </button>
              ${profile.chatWallpaper ? `
              <button type="button" class="chat-settings-row chat-settings-action is-destructive" data-action="remove-wallpaper">
                <span class="chat-settings-row-copy">
                  <span class="chat-settings-row-title">Remove Wallpaper</span>
                  <span class="chat-settings-row-detail">Restore default background</span>
                </span>
              </button>` : ""}
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
      ${renderQuotedReplyBar()}
      ${renderAttachmentPreview()}
      ${renderStickerPicker()}
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
        <button type="button" class="composer-icon-button" data-action="toggle-sticker-picker" aria-label="Emoji picker" ${disabled ? "disabled" : ""}>
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
            ${renderMessageContextMenu(conversationId)}
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

  if (appState.messagesView === "sticker-store") {
    return renderStickerStoreScreen();
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
        ${
          appState.storageWarningMessage
            ? `<div class="storage-warning-banner" role="status">${escapeHtml(appState.storageWarningMessage)}</div>`
            : ""
        }
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

  if (appState.activeScreen === "memory") {
    return renderMemoryScreen();
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
  const proactiveIntervalInput = root.querySelector("[data-role='proactive-interval-input']");
  const momentsToggle = root.querySelector("[data-role='moments-toggle']");
  const momentsIntervalInput = root.querySelector("[data-role='moments-interval-input']");
  const blockToggle = root.querySelector("[data-role='block-toggle']");
  const nicknameInput = root.querySelector("[data-role='nickname-input']");
  const allowAiStickersToggle = root.querySelector("[data-role='allow-ai-stickers-toggle']");
  const aiStickerFrequencySelect = root.querySelector("[data-role='ai-sticker-frequency-select']");
  const characterDisplayNameInput = root.querySelector("[data-role='character-display-name-input']");
  const characterAiNicknameInput = root.querySelector("[data-role='character-ai-nickname-input']");
  const characterPromptInput = root.querySelector("[data-role='character-prompt-input']");
  const characterGlobalWordbookToggle = root.querySelector("[data-role='character-global-wordbook-toggle']");
  const apiKeyInput = root.querySelector("[data-role='api-key-input']");
  const stickerPackNameInput = root.querySelector("[data-role='sticker-pack-name-input']");
  const memorySearchInput = root.querySelector("[data-role='memory-search-input']");

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
      const nextValue = Math.min(20, Math.max(1, Number(event.target.value) || 20));
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

  if (proactiveIntervalInput) {
    proactiveIntervalInput.addEventListener("input", (event) => {
      const nextValue = normalizeIntervalMinutes(event.target.value, DEFAULT_PROACTIVE_INTERVAL_MINUTES);
      updateProfile(currentConversationId(), {
        proactiveIntervalMinutes: nextValue,
        messageFrequency: `${nextValue}m`,
      });
    });
  }

  if (momentsToggle) {
    momentsToggle.addEventListener("change", (event) => {
      updateProfile(currentConversationId(), { momentsPosting: event.target.checked });
    });
  }

  if (momentsIntervalInput) {
    momentsIntervalInput.addEventListener("input", (event) => {
      const nextValue = normalizeIntervalMinutes(event.target.value, DEFAULT_MOMENTS_INTERVAL_MINUTES);
      updateProfile(currentConversationId(), {
        momentsIntervalMinutes: nextValue,
        momentsFrequency: `${nextValue}m`,
      });
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

  if (allowAiStickersToggle) {
    allowAiStickersToggle.addEventListener("change", (event) => {
      updateProfile(currentConversationId(), { allowAiStickers: event.target.checked });
    });
  }

  if (aiStickerFrequencySelect) {
    aiStickerFrequencySelect.addEventListener("change", (event) => {
      updateProfile(currentConversationId(), { aiStickerFrequency: event.target.value === "high" ? "high" : "low" });
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

  if (stickerPackNameInput) {
    stickerPackNameInput.addEventListener("input", (event) => {
      appState.stickerPackDraft = {
        ...(appState.stickerPackDraft || createBlankStickerPack()),
        name: event.target.value,
      };
    });
  }

  if (memorySearchInput) {
    memorySearchInput.addEventListener("input", (event) => {
      appState.memorySearchQuery = event.target.value;
      render();
    });
  }

  root.querySelectorAll("[data-role='sticker-name-input']").forEach((input) => {
    input.addEventListener("input", (event) => {
      const stickerId = event.target.dataset.stickerId;
      if (!stickerId || !appState.stickerPackDraft) {
        return;
      }
      appState.stickerPackDraft = {
        ...appState.stickerPackDraft,
        stickers: appState.stickerPackDraft.stickers.map((sticker) =>
          sticker.id === stickerId
            ? {
                ...sticker,
                name: event.target.value,
              }
            : sticker,
        ),
      };
    });
  });

  root.querySelectorAll("[data-role='sticker-description-input']").forEach((input) => {
    input.addEventListener("input", (event) => {
      const stickerId = event.target.dataset.stickerId;
      if (!stickerId || !appState.stickerPackDraft) {
        return;
      }
      appState.stickerPackDraft = {
        ...appState.stickerPackDraft,
        stickers: appState.stickerPackDraft.stickers.map((sticker) =>
          sticker.id === stickerId
            ? {
                ...sticker,
                description: event.target.value,
              }
            : sticker,
        ),
      };
    });
  });
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
  const stickerUploadInput = root.querySelector("[data-role='sticker-upload-input']");

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

  if (stickerUploadInput) {
    stickerUploadInput.addEventListener("change", async (event) => {
      const files = Array.from(event.target.files || []);
      if (!files.length || !appState.stickerPackDraft) {
        return;
      }

      const nextStickers = [];
      for (const file of files) {
        const imageDataUrl = await readFileAsDataUrl(file);
        nextStickers.push({
          id: nextStickerId(),
          name: file.name.replace(/\.[^.]+$/, ""),
          description: "",
          imageDataUrl,
        });
      }

      appState.stickerPackDraft = {
        ...appState.stickerPackDraft,
        stickers: [...(appState.stickerPackDraft.stickers || []), ...nextStickers],
      };
      render();
    });
  }
}

function clearLongPressState() {
  if (appState.longPressTimer) {
    window.clearTimeout(appState.longPressTimer);
  }
  appState.longPressTimer = null;
  appState.pressedMessageId = null;
}

function mountMessageContextMenu(root) {
  const bubbles = root.querySelectorAll("[data-message-bubble]");

  bubbles.forEach((bubble) => {
    const messageId = bubble.getAttribute("data-message-bubble");
    if (!messageId) {
      return;
    }

    const openMenu = () => {
      const rect = bubble.getBoundingClientRect();
      const chatView = root.querySelector(".messages-chat-view");
      const appRect = (chatView || root).getBoundingClientRect();
      const estimatedMenuHeight = 192;
      const estimatedMenuWidth = 208;
      const preferredTop = rect.top - appRect.top - estimatedMenuHeight - 10;
      const fallbackTop = rect.bottom - appRect.top + 8;
      openMessageContextMenu(messageId, {
        top: preferredTop >= 8 ? preferredTop : Math.max(8, fallbackTop),
        left: Math.max(12, Math.min(rect.left - appRect.left, appRect.width - estimatedMenuWidth - 12)),
      });
      render();
    };

    bubble.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      openMenu();
    });

    bubble.addEventListener("pointerdown", () => {
      clearLongPressState();
      appState.pressedMessageId = messageId;
      appState.longPressTimer = window.setTimeout(() => {
        if (appState.pressedMessageId === messageId) {
          openMenu();
        }
      }, 420);
    });

    bubble.addEventListener("pointerup", clearLongPressState);
    bubble.addEventListener("pointerleave", clearLongPressState);
    bubble.addEventListener("pointercancel", clearLongPressState);
  });

  const chatScroll = root.querySelector("[data-role='chat-scroll']");
  chatScroll?.addEventListener("scroll", () => {
    if (appState.activeContextMenuMessageId) {
      closeMessageContextMenu();
      render();
    }
  });

  document.addEventListener(
    "pointerdown",
    (event) => {
      const menu = root.querySelector("[data-role='message-context-menu']");
      if (!menu || menu.contains(event.target)) {
        return;
      }
      if (appState.activeContextMenuMessageId) {
        closeMessageContextMenu();
        render();
      }
    },
    { once: true },
  );
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

  if (action === "filter-memory-character") {
    appState.memoryCharacterFilter = button.dataset.characterId || "all";
    render();
    return;
  }

  if (action === "filter-memory-category") {
    appState.memoryCategoryFilter = button.dataset.category || "all";
    render();
    return;
  }

  if (action === "delete-memory") {
    const characterId = button.dataset.characterId || "angel-bunny";
    const memoryId = button.dataset.memoryId || "";
    setMemories(
      characterId,
      getMemories(characterId).filter((entry) => entry.id !== memoryId),
    );
    render();
    return;
  }

  if (action === "delete-archive") {
    const characterId = button.dataset.characterId || "angel-bunny";
    const archiveId = button.dataset.memoryId || "";
    setConversationArchives(
      characterId,
      getConversationArchives(characterId).filter((entry) => entry.id !== archiveId),
    );
    render();
    return;
  }

  if (action === "switch-tab") {
    appState.activeMessagesTab = button.dataset.tab || "chats";
    appState.messagesView = "list";
    appState.activeConversationId = null;
    appState.characterEditorId = null;
    appState.characterDraft = null;
    appState.stickerStoreView = "packs";
    appState.editingStickerPackId = null;
    appState.stickerPackDraft = null;
    appState.chatView = "conversation";
    appState.attachmentMenuOpen = false;
    appState.stickerPickerOpen = false;
    render();
    return;
  }

  if (action === "open-sticker-store") {
    openStickerStore();
    render();
    return;
  }

  if (action === "close-sticker-store") {
    closeStickerStore();
    render();
    return;
  }

  if (action === "create-sticker-pack") {
    openStickerPackEditor();
    render();
    return;
  }

  if (action === "edit-sticker-pack") {
    openStickerPackEditor(button.dataset.packId || "");
    render();
    return;
  }

  if (action === "close-sticker-pack-editor") {
    closeStickerPackEditor();
    render();
    return;
  }

  if (action === "pick-sticker-files") {
    rootNode?.querySelector("[data-role='sticker-upload-input']")?.click();
    return;
  }

  if (action === "save-sticker-pack") {
    persistStickerPackDraft();
    render();
    return;
  }

  if (action === "delete-sample") {
    const profileId = button.dataset.profileId || currentConversationId();
    const profile = getProfile(profileId);
    const shouldDelete = window.confirm(
      `Delete ${profile?.name || "this character"}? This will remove the character from Contacts and also delete their chat memories and archive summaries.`,
    );
    if (!shouldDelete) {
      return;
    }
    updateProfile(profileId, { isVisible: false });
    persistedState.memories = {
      ...(persistedState.memories || {}),
      [profileId]: [],
    };
    persistedState.conversationArchives = {
      ...(persistedState.conversationArchives || {}),
      [profileId]: [],
    };
    if (persistedState.appSettings.lastActiveConversationId === profileId) {
      const fallbackId =
        visibleCharacterProfiles().find((p) => p.id !== profileId)?.id || "angel-bunny";
      persistedState.appSettings.lastActiveConversationId = fallbackId;
    }
    saveChatState();
    if (appState.activeConversationId === profileId) {
      closeConversation();
    }
    render();
    return;
  }

  if (action === "clear-chat") {
    const profileId = button.dataset.profileId;
    if (profileId) {
      const profile = getProfile(profileId);
      const shouldDelete = window.confirm(
        `Delete the chat with ${profile?.name || "this character"} from the Chats list? This removes the current thread from local storage.`,
      );
      if (!shouldDelete) {
        return;
      }
      setConversation(profileId, []);
      if (appState.activeConversationId === profileId) {
        appState.isReplyPending = false;
        closeConversation();
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

  if (action === "toggle-sticker-picker") {
    appState.stickerPickerOpen = !appState.stickerPickerOpen;
    if (!appState.activeStickerPackId && getStickerPacks()[0]) {
      appState.activeStickerPackId = getStickerPacks()[0].id;
    }
    render();
    return;
  }

  if (action === "send-message") {
    sendMessage(currentConversationId());
    return;
  }

  if (action === "switch-sticker-pack") {
    appState.activeStickerPackId = button.dataset.packId || appState.activeStickerPackId;
    render();
    return;
  }

  if (action === "send-sticker") {
    const found = findStickerById(button.dataset.stickerId);
    if (!found) {
      return;
    }
    sendStickerMessage(currentConversationId(), {
      ...found.sticker,
      packId: found.pack.id,
    });
    render();
    requestAIResponse(currentConversationId(), getConversation(currentConversationId()).slice(-1)[0].id);
    return;
  }

  if (action === "retry-message") {
    resendRequest(button.dataset.messageId);
    return;
  }

  if (action === "toggle-favorite-message") {
    toggleFavoriteMessage(currentConversationId(), button.dataset.messageId);
    closeMessageContextMenu();
    render();
    return;
  }

  if (action === "quote-message") {
    selectQuotedMessage(currentConversationId(), button.dataset.messageId);
    closeMessageContextMenu();
    render();
    return;
  }

  if (action === "clear-quoted-message") {
    clearQuotedMessage();
    render();
    return;
  }

  if (action === "delete-message") {
    closeMessageContextMenu();
    deleteMessage(currentConversationId(), button.dataset.messageId);
    render();
    return;
  }

  if (action === "copy-message") {
    copyMessageText(currentConversationId(), button.dataset.messageId);
    closeMessageContextMenu();
    render();
    return;
  }

  if (action === "pick-wallpaper") {
    rootNode?.querySelector("[data-role='wallpaper-input']")?.click();
    return;
  }

  if (action === "remove-wallpaper") {
    updateProfile(currentConversationId(), { chatWallpaper: null });
    render();
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

      if (appId === "memory") {
        appState.activeScreen = "memory";
        appState.memoryCharacterFilter = "all";
        appState.memoryCategoryFilter = "all";
        appState.memorySearchQuery = "";
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
  mountMessageContextMenu(rootNode);
  setStatusTime();
  scrollChatToBottom(rootNode);
}

async function init() {
  persistedState = await loadChatState();
  const savedConversationId = persistedState.appSettings?.lastActiveConversationId;
  const availableCharacterIds = Object.keys(persistedState.characterProfiles || {});
  const restoredConversationId = availableCharacterIds.includes(savedConversationId)
    ? savedConversationId
    : availableCharacterIds[0] || "angel-bunny";
  appState.activeConversationId = restoredConversationId;
  if (restoredConversationId !== savedConversationId) {
    persistedState.appSettings.lastActiveConversationId = restoredConversationId;
    saveChatState();
  }
  syncMessageSequence();
  rootNode = document.getElementById("app");

  if (!rootNode) {
    return;
  }

  render();
  scheduleStatusClock();
  startSimulationLoop();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      maybeSimulateCharacterActivity();
    }
  });
}

init();
