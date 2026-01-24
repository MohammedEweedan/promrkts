const { updateProfile } = require('../core/state');

async function profile_update(patch) {
  const userId = patch.userId || patch.uid || 'anon';
  const p = await updateProfile(userId, patch);
  return { ok: true, profile: p };
}

module.exports = { profile_update };
