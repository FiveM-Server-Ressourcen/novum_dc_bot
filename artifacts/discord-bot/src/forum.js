import { ChannelType } from 'discord.js';

/**
 * Stellt sicher dass alle gewünschten Tags im Forum-Kanal existieren.
 * Gibt ein Map { tagName -> tagId } zurück.
 */
export async function ensureTags(forumChannel, tagDefs) {
  const existing = forumChannel.availableTags ?? [];
  const toAdd = [];

  for (const def of Object.values(tagDefs)) {
    const found = existing.find(t => t.name === def.name);
    if (!found) toAdd.push({ name: def.name, emoji: { name: def.emoji }, moderated: false });
  }

  let current = existing;
  if (toAdd.length > 0) {
    const updated = await forumChannel.edit({ availableTags: [...existing, ...toAdd] });
    current = updated.availableTags;
  }

  const map = {};
  for (const tag of current) map[tag.name] = tag.id;
  return map;
}

/**
 * Gibt die Tag-ID anhand des Namens zurück.
 */
export function getTagId(forumChannel, name) {
  return forumChannel.availableTags?.find(t => t.name === name)?.id ?? null;
}

/**
 * Ändert die Applied-Tags eines Forum-Threads.
 */
export async function setThreadTags(thread, tagIds) {
  const ids = tagIds.filter(Boolean);
  if (ids.length === 0) return;
  await thread.edit({ appliedTags: ids });
}

/**
 * Prüft ob ein Kanal ein Forum-Kanal ist.
 */
export function isForum(channel) {
  return channel?.type === ChannelType.GuildForum;
}
