const conversations = new Map();
const profiles = new Map();

const key = (channel, userId) => `${channel}:${userId}`;

const getConv = async (channel, userId) => {
  const k = key(channel, userId);
  if (!conversations.has(k)) conversations.set(k, { history: [] });
  return conversations.get(k);
};

const saveConv = async (channel, userId, history) => {
  const k = key(channel, userId);
  conversations.set(k, { history });
  return true;
};

const getProfile = async (userId) => {
  if (!profiles.has(userId)) profiles.set(userId, { language: null, level: 1, prefs: {} });
  return profiles.get(userId);
};

const updateProfile = async (userId, patch) => {
  const p = await getProfile(userId);
  const next = { ...p, ...patch, prefs: { ...(p.prefs||{}), ...(patch.prefs||{}) } };
  profiles.set(userId, next);
  return next;
};

module.exports = { getConv, saveConv, getProfile, updateProfile };
