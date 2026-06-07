import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CONFIG_PATH = join(__dirname, '..', 'config.json');

function load() {
  if (!existsSync(CONFIG_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function save(data) {
  writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function getGuildConfig(guildId) {
  const all = load();
  return all[guildId] ?? {};
}

export function setGuildChannel(guildId, key, channelId) {
  const all = load();
  if (!all[guildId]) all[guildId] = {};
  all[guildId][key] = channelId;
  save(all);
}

export function setGuildRole(guildId, key, roleId) {
  const all = load();
  if (!all[guildId]) all[guildId] = {};
  if (!all[guildId].roles) all[guildId].roles = {};
  all[guildId].roles[key] = roleId;
  save(all);
}

export function getChannel(guild, key) {
  const cfg = getGuildConfig(guild.id);
  const id = cfg[key];
  if (!id) return null;
  return guild.channels.cache.get(id) ?? null;
}

export function getRole(guild, key) {
  const cfg = getGuildConfig(guild.id);
  const id = cfg?.roles?.[key];
  if (!id) return null;
  return guild.roles.cache.get(id) ?? null;
}

export const CHANNEL_KEYS = {
  willkommen:        { label: '💫 Willkommen',          desc: 'Begrüßung neuer Mitglieder' },
  'start-hier':      { label: '🚀 Start Hier',           desc: 'Erster Anlaufpunkt' },
  regeln:            { label: '📜 Regeln',               desc: 'Serverregeln' },
  ankuendigungen:    { label: '📣 Ankündigungen',        desc: 'Wichtige Neuigkeiten' },
  updates:           { label: '🛠️ Updates',              desc: 'Changelogs' },
  'server-status':   { label: '📡 Server Status',        desc: 'Wartungs-Infos' },
  events:            { label: '📅 Events',               desc: 'Community Events' },
  tickets:           { label: '🎟️ Tickets',              desc: 'Ticket-Panel' },
  'bug-report':      { label: '🐞 Bug Report',           desc: 'Bug-Melde-Panel' },
  'spieler-meldungen': { label: '🚨 Spieler-Meldungen', desc: 'Report-Panel' },
  'support-info':    { label: '❔ Support Info',         desc: 'Supportsystem-Infos' },
  'ticket-kategorie': { label: '📁 Ticket-Kategorie',   desc: 'Kategorie für neue Ticket-Kanäle' },
};
