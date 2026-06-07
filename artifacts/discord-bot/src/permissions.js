import { PERMISSION_LEVELS, COMMAND_PERMISSIONS, ROLES } from './config.js';

/**
 * Gibt das höchste Permission-Level eines Members zurück.
 */
export function getPermLevel(member) {
  let highest = 0;
  for (const roleId of member.roles.cache.keys()) {
    const level = PERMISSION_LEVELS[roleId] ?? 0;
    if (level > highest) highest = level;
  }
  return highest;
}

/**
 * Prüft ob ein Member einen Command ausführen darf.
 * Gibt true zurück wenn der Member das benötigte Level hat.
 */
export function hasPermission(member, commandName) {
  const required = COMMAND_PERMISSIONS[commandName] ?? 0;
  if (required === 0) return true;
  return getPermLevel(member) >= required;
}

/**
 * Gibt den Rang-Namen zurück.
 */
export function getPermLabel(level) {
  const labels = {
    0: 'Alle',
    1: 'Spieler',
    2: 'Support+',
    3: 'Moderator+',
    4: 'Admin+',
    5: 'Leitung',
  };
  return labels[level] ?? `Level ${level}`;
}

/**
 * Prüft ob ein Member ein Team-Mitglied ist (Support oder höher).
 */
export function isTeam(member) {
  return getPermLevel(member) >= 2;
}

/**
 * Prüft ob ein Member stumm geschaltet ist.
 */
export function isMuted(member) {
  return member.roles.cache.has(ROLES.muted);
}
