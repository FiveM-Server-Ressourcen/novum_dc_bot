// ═══════════════════════════════════════════════════════════════
//  NOVUM Bot — Zentrale Konfiguration
//  Alle IDs hier eintragen, Bot dann neu starten.
// ═══════════════════════════════════════════════════════════════

export const GUILD_ID = '926431717529641002';

// ── Kanäle ──────────────────────────────────────────────────────
export const CHANNELS = {
  willkommen:        '1513086326386458764',
  startHier:         '1513086404790321342',
  regeln:            '926472818365972500',
  ankuendigungen:    '1513087047110230126',
  updates:           '1513087126101823528',
  serverStatus:      '1513087221882818570',
  events:            '1513087284595916881',
  tickets:           '1513087505380151326',
  bugReport:         '1513087599210922066',
  spielerMeldungen:  '1513087681695973396',
  supportInfo:       '1513087756434276392',
  ticketKategorie:   '1513127386529534002',  // Kategorie für neue Ticket-Kanäle
};

// ── Rollen ───────────────────────────────────────────────────────
export const ROLES = {
  // Team
  leitung:    '1513128807597473843',
  coOwner:    '1513128857778126938',
  management: '1513128916422885538',
  admin:      '1513129137383149628',
  moderator:  '1513129196631756961',
  support:    '1513129248481869954',
  developer:  '1513129339892404224',

  // Mitglieder
  spieler:    '1513129413674405928',
  booster:    '1513129485195808938',
  creator:    '1513129543819591752',

  // Sonstige
  muted:      '1513129648161292388',
  bot:        '1513129705937571921',

  // Ping-Rollen (selbst zuweisbar)
  pingEvents:      '1513129762435104798',
  pingAnkuendigungen: '1513129824040910948',
  pingUpdates:     '1513129885248258078',
  pingServerStatus:'1513129987488612393',
};

// ── Permission-Level ─────────────────────────────────────────────
// Je höher die Zahl, desto mehr Rechte.
// 0 = jeder, 1 = Spieler, 2 = Support, 3 = Moderator,
// 4 = Admin, 5 = Management/Co-Owner/Leitung
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

// Welches Permission-Level brauchen die Commands?
export const COMMAND_PERMISSIONS = {
  announce:  3,   // Moderator+
  status:    3,   // Moderator+
  panel:     4,   // Admin+
  userinfo:  2,   // Support+
  warn:      3,   // Moderator+
  mute:      3,   // Moderator+
  unmute:    3,   // Moderator+
  kick:      4,   // Admin+
  ban:       4,   // Admin+
};

// ── Kanal-Berechtigungen ─────────────────────────────────────────
// Welche Rollen dürfen in welchen Kanal schreiben?
// "readOnly" = nur lesen, "write" = schreiben, "deny" = kein Zugriff
export const CHANNEL_PERMISSIONS = {
  // Infos → nur Lesen für normale Mitglieder
  [CHANNELS.ankuendigungen]: { readOnly: [ROLES.spieler, ROLES.booster, ROLES.creator] },
  [CHANNELS.updates]:        { readOnly: [ROLES.spieler, ROLES.booster, ROLES.creator] },
  [CHANNELS.serverStatus]:   { readOnly: [ROLES.spieler, ROLES.booster, ROLES.creator] },
  [CHANNELS.events]:         { readOnly: [ROLES.spieler, ROLES.booster, ROLES.creator] },
  [CHANNELS.regeln]:         { readOnly: [ROLES.spieler, ROLES.booster, ROLES.creator] },
  [CHANNELS.startHier]:      { readOnly: [ROLES.spieler, ROLES.booster, ROLES.creator] },
  // Bug-Report, Spieler-Meldungen → nur Panel-Button, kein freies Schreiben
  [CHANNELS.bugReport]:      { readOnly: [ROLES.spieler, ROLES.booster, ROLES.creator] },
  [CHANNELS.spielerMeldungen]:{ readOnly: [ROLES.spieler, ROLES.booster, ROLES.creator] },
  // Support-Info → nur lesen
  [CHANNELS.supportInfo]:    { readOnly: [ROLES.spieler, ROLES.booster, ROLES.creator] },
};

// ── Ping-Rollen Panel ────────────────────────────────────────────
export const PING_ROLES = [
  { id: ROLES.pingAnkuendigungen, label: '📣 Ankündigungen',  description: 'Wichtige Server-Ankündigungen' },
  { id: ROLES.pingEvents,         label: '📅 Events',          description: 'Benachrichtigung bei Events'    },
  { id: ROLES.pingUpdates,        label: '🛠️ Updates',         description: 'Changelogs und neue Features'   },
  { id: ROLES.pingServerStatus,   label: '📡 Server Status',   description: 'Wartungen und Statusmeldungen'  },
];
