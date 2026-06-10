// ═══════════════════════════════════════════════════════════════
//  NOVUM Bot — Zentrale Konfiguration
// ═══════════════════════════════════════════════════════════════

export const GUILD_ID = '926431717529641002';

// ── Text-Kanäle (Panel-Buttons) ──────────────────────────────────
export const CHANNELS = {
  willkommen:        '1513086326386458764',
  startHier:         '1513086404790321342',
  regeln:            '926472818365972500',
  ankuendigungen:    '1513087047110230126',
  updates:           '1513087126101823528',
  serverStatus:      '1513087221882818570',
  events:            '1513087284595916881',
  tickets:           '1513087505380151326',   // Panel-Kanal (Button)
  bugReport:         '1513087599210922066',   // Panel-Kanal (Button)
  spielerMeldungen:  '1513087681695973396',   // Panel-Kanal (Button)
  supportInfo:       '1513087756434276392',
  pingRollen:        '1513132932636741693',
  bewerbungen:       'PLACEHOLDER_BEWERBUNGEN_KANAL',  // ← Kanal-ID für den Bewerbungs-Panel eintragen
};

// ── Forum-Kanäle (Posts landen hier) ────────────────────────────
export const FORUMS = {
  tickets:          '1513136309001257033',   // Ticket-Posts + User wird hinzugefügt
  bugReport:        '1513136038309007480',   // Bug-Report-Posts (anonym)
  spielerMeldungen: '1513135960303599666',   // Spieler-Meldungs-Posts (anonym)
  bewerbungen:      'PLACEHOLDER_BEWERBUNGEN_FORUM',  // ← Forum-Kanal-ID für Bewerbungen (nur Team sichtbar)
};

// ── Forum-Tags (werden beim Start automatisch angelegt) ──────────
export const TICKET_TAGS = {
  offen:       { name: 'Offen',         emoji: '🟢' },
  claimed:     { name: 'In Bearbeitung', emoji: '🔵' },
  wartend:     { name: 'Wartet auf Antwort', emoji: '🟡' },
  geloest:     { name: 'Gelöst',        emoji: '✅' },
  // Prioritäten
  niedrig:     { name: 'Niedrig',       emoji: '⬇️' },
  mittel:      { name: 'Mittel',        emoji: '➡️' },
  hoch:        { name: 'Hoch',          emoji: '⬆️' },
  kritisch:    { name: 'Kritisch',      emoji: '🔴' },
};

export const BUG_TAGS = {
  neu:         { name: 'Neu',           emoji: '🐞' },
  inPruefung:  { name: 'In Prüfung',   emoji: '🔄' },
  behoben:     { name: 'Behoben',       emoji: '✅' },
  keinBug:     { name: 'Kein Bug',      emoji: '❌' },
};

export const REPORT_TAGS = {
  neu:         { name: 'Neu',           emoji: '🚨' },
  inPruefung:  { name: 'In Prüfung',   emoji: '🔄' },
  bestraft:    { name: 'Bestraft',      emoji: '✅' },
  abgelehnt:   { name: 'Abgelehnt',    emoji: '❌' },
};

export const BEWERBUNG_TAGS = {
  neu:         { name: 'Neu',           emoji: '📋' },
  inPruefung:  { name: 'In Prüfung',   emoji: '🔄' },
  angenommen:  { name: 'Angenommen',   emoji: '✅' },
  abgelehnt:   { name: 'Abgelehnt',    emoji: '❌' },
};

// ── Bewerbungs-Positionen ────────────────────────────────────────
export const BEWERBUNG_POSITIONEN = [
  { id: 'support',   label: '🎧 Support',   desc: 'Spieler unterstützen & Tickets bearbeiten', roleKey: 'support'   },
  { id: 'moderator', label: '🛡️ Moderator', desc: 'Regeln durchsetzen & Server moderieren',    roleKey: 'moderator' },
  { id: 'developer', label: '💻 Developer', desc: 'Scripts & Features entwickeln',             roleKey: 'developer' },
];

// ── Ticket-Kategorien ────────────────────────────────────────────
export const TICKET_CATEGORIES = [
  { id: 'allgemein',   label: '❓ Allgemeiner Support',  desc: 'Allgemeine Fragen & Hilfe' },
  { id: 'bug',         label: '🐞 Bug / Fehler',          desc: 'Probleme beim Spielen' },
  { id: 'beschwerde',  label: '⚠️ Beschwerde',            desc: 'Beschwerde gegen ein Teammitglied' },
  { id: 'bewerbung',   label: '📋 Bewerbung',             desc: 'Bewerbung fürs Team' },
  { id: 'sonstiges',   label: '📁 Sonstiges',             desc: 'Alles andere' },
];

// ── Rollen ───────────────────────────────────────────────────────
export const ROLES = {
  leitung:    '1513128807597473843',
  coOwner:    '1513128857778126938',
  management: '1513128916422885538',
  admin:      '1513129137383149628',
  moderator:  '1513129196631756961',
  support:    '1513129248481869954',
  developer:  '1513129339892404224',
  spieler:    '1513129413674405928',
  booster:    '1513129485195808938',
  creator:    '1513129543819591752',
  muted:      '1513129648161292388',
  bot:        '1513129705937571921',
  pingEvents:         '1513129762435104798',
  pingAnkuendigungen: '1513129824040910948',
  pingUpdates:        '1513129885248258078',
  pingServerStatus:   '1513129987488612393',
};

// ── Permission-Level ─────────────────────────────────────────────
export const PERMISSION_LEVELS = {
  [ROLES.spieler]:    1,
  [ROLES.booster]:    1,
  [ROLES.creator]:    1,
  [ROLES.support]:    2,
  [ROLES.developer]:  3,
  [ROLES.moderator]:  3,
  [ROLES.admin]:      4,
  [ROLES.management]: 5,
  [ROLES.coOwner]:    5,
  [ROLES.leitung]:    5,
};

export const COMMAND_PERMISSIONS = {
  announce:  3,
  status:    3,
  panel:     4,
  userinfo:  2,
  warn:      3,
  mute:      3,
  unmute:    3,
  kick:      4,
  ban:       4,
};

export const PING_ROLES = [
  { id: ROLES.pingAnkuendigungen, label: '📣 Ankündigungen',  description: 'Wichtige Server-Ankündigungen' },
  { id: ROLES.pingEvents,         label: '📅 Events',          description: 'Benachrichtigung bei Events'    },
  { id: ROLES.pingUpdates,        label: '🛠️ Updates',         description: 'Changelogs und neue Features'   },
  { id: ROLES.pingServerStatus,   label: '📡 Server Status',   description: 'Wartungen und Statusmeldungen'  },
];
