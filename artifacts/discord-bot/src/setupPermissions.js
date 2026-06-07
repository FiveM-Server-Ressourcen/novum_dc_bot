import { ChannelType } from 'discord.js';
import { CHANNELS, FORUMS, ROLES } from './config.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Team-Rollen (Support und höher)
const TEAM_ROLES = [
  ROLES.support, ROLES.moderator, ROLES.developer,
  ROLES.admin, ROLES.management, ROLES.coOwner, ROLES.leitung,
];

/**
 * Baut ein Overwrite-Array auf.
 */
function buildOverwrites(everyoneId, botId, everyoneAllow, everyoneDeny, teamAllow, teamDeny = []) {
  return [
    { id: everyoneId, allow: everyoneAllow, deny: everyoneDeny },
    ...TEAM_ROLES.map(r => ({ id: r, allow: teamAllow, deny: teamDeny })),
    { id: botId, allow: teamAllow, deny: teamDeny },
  ];
}

/**
 * Vergleicht ob bestehende Overwrites mit dem Ziel übereinstimmen.
 * Schnelle Prüfung: nur Anzahl und IDs vergleichen, dann Flags.
 */
function overwritesMatch(channel, desired) {
  const cache = channel.permissionOverwrites.cache;
  for (const ow of desired) {
    const existing = cache.get(ow.id);
    if (!existing) return false;
    for (const flag of (ow.allow ?? [])) {
      if (!existing.allow.has(flag)) return false;
    }
    for (const flag of (ow.deny ?? [])) {
      if (!existing.deny.has(flag)) return false;
    }
  }
  return true;
}

/**
 * Setzt alle Channel-Overwrites auf einmal (ein API-Call pro Channel).
 */
async function applyChannel(channel, overwrites, label) {
  if (!channel) {
    console.log(`[Perms] ⚠️  Kanal nicht gefunden: ${label}`);
    return false;
  }
  if (overwritesMatch(channel, overwrites)) {
    console.log(`[Perms] ✓  ${label} — bereits korrekt`);
    return false;
  }
  await channel.permissionOverwrites.set(overwrites);
  console.log(`[Perms] ✅  ${label} — Berechtigungen gesetzt`);
  await sleep(500); // Rate-Limit: 2 Channel-Edits/Sekunde
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────

export async function setupChannelPermissions(guild) {
  const everyoneId = guild.roles.everyone.id;
  const botId      = guild.members.me.id;
  let   changed    = 0;

  // Kanäle aus Cache holen
  const ch = id => guild.channels.cache.get(id);

  // ── Lese-Only (Info, Regeln, Welcome, Panels, Ping-Rollen) ────────────────
  const readOnlyOverwrites = buildOverwrites(
    everyoneId, botId,
    ['ViewChannel', 'ReadMessageHistory', 'AddReactions'],  // everyone allow
    ['SendMessages', 'AttachFiles'],                         // everyone deny
    ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages', 'AttachFiles', 'EmbedLinks', 'AddReactions'], // team allow
  );

  const readOnlyChannels = [
    [ch(CHANNELS.willkommen),        '#willkommen'       ],
    [ch(CHANNELS.startHier),         '#start-hier'       ],
    [ch(CHANNELS.regeln),            '#regeln'           ],
    [ch(CHANNELS.ankuendigungen),    '#ankündigungen'    ],
    [ch(CHANNELS.updates),           '#updates'          ],
    [ch(CHANNELS.serverStatus),      '#server-status'    ],
    [ch(CHANNELS.events),            '#events'           ],
    [ch(CHANNELS.tickets),           '#tickets (panel)'  ],
    [ch(CHANNELS.bugReport),         '#bug-report (panel)'],
    [ch(CHANNELS.spielerMeldungen),  '#spieler-meldungen (panel)'],
    [ch(CHANNELS.supportInfo),       '#support-info'     ],
    [ch(CHANNELS.pingRollen),        '#ping-rollen'      ],
  ];

  for (const [channel, label] of readOnlyChannels) {
    if (await applyChannel(channel, readOnlyOverwrites, label)) changed++;
  }

  // ── Ticket-Forum: User lesen (thread-Mitglieder), kein direktes Posten ───
  const ticketForum = ch(FORUMS.tickets);
  if (ticketForum) {
    const ow = [
      {
        id: everyoneId,
        allow: ['ViewChannel', 'ReadMessageHistory', 'SendMessagesInThreads'],
        deny:  ['SendMessages', 'CreatePublicThreads', 'CreatePrivateThreads'],
      },
      ...TEAM_ROLES.map(r => ({
        id: r,
        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages',
                'ManageThreads', 'SendMessagesInThreads', 'CreatePublicThreads', 'AttachFiles'],
        deny: [],
      })),
      {
        id: botId,
        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages',
                'ManageThreads', 'SendMessagesInThreads', 'CreatePublicThreads', 'AttachFiles', 'EmbedLinks'],
        deny: [],
      },
    ];
    if (await applyChannel(ticketForum, ow, 'Forum: Tickets')) changed++;
  }

  // ── Bug-Report-Forum: Nur Team sieht Posts (Datenschutz) ─────────────────
  const bugForum = ch(FORUMS.bugReport);
  if (bugForum) {
    const ow = [
      {
        id: everyoneId,
        allow: ['ViewChannel'],
        deny:  ['SendMessages', 'ReadMessageHistory', 'CreatePublicThreads', 'AddReactions'],
      },
      ...TEAM_ROLES.map(r => ({
        id: r,
        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages',
                'ManageThreads', 'SendMessagesInThreads', 'CreatePublicThreads', 'AttachFiles', 'AddReactions'],
        deny: [],
      })),
      {
        id: botId,
        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages',
                'ManageThreads', 'SendMessagesInThreads', 'CreatePublicThreads', 'AttachFiles', 'EmbedLinks'],
        deny: [],
      },
    ];
    if (await applyChannel(bugForum, ow, 'Forum: Bug-Report')) changed++;
  }

  // ── Spieler-Meldungen-Forum: Nur Team, vollständig privat ─────────────────
  const reportForum = ch(FORUMS.spielerMeldungen);
  if (reportForum) {
    const ow = [
      {
        id: everyoneId,
        allow: ['ViewChannel'],
        deny:  ['SendMessages', 'ReadMessageHistory', 'CreatePublicThreads', 'AddReactions'],
      },
      ...TEAM_ROLES.map(r => ({
        id: r,
        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages',
                'ManageThreads', 'SendMessagesInThreads', 'CreatePublicThreads', 'AttachFiles', 'AddReactions'],
        deny: [],
      })),
      {
        id: botId,
        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages',
                'ManageThreads', 'SendMessagesInThreads', 'CreatePublicThreads', 'AttachFiles', 'EmbedLinks'],
        deny: [],
      },
    ];
    if (await applyChannel(reportForum, ow, 'Forum: Spieler-Meldungen')) changed++;
  }

  return changed;
}

// ─────────────────────────────────────────────────────────────────────────────

export async function setupRoles(guild) {
  let changed = 0;

  const roleConfigs = [
    // Team (hoist = in Mitgliederliste angezeigt)
    { id: ROLES.leitung,            color: 0xe74c3c, hoist: true,  mentionable: false },
    { id: ROLES.coOwner,            color: 0xe67e22, hoist: true,  mentionable: false },
    { id: ROLES.management,         color: 0xf39c12, hoist: true,  mentionable: false },
    { id: ROLES.admin,              color: 0x9b59b6, hoist: true,  mentionable: false },
    { id: ROLES.moderator,          color: 0x3498db, hoist: true,  mentionable: true  },
    { id: ROLES.support,            color: 0x1abc9c, hoist: true,  mentionable: true  },
    { id: ROLES.developer,          color: 0x2ecc71, hoist: true,  mentionable: false },
    // Mitglieder
    { id: ROLES.spieler,            color: 0x95a5a6, hoist: false, mentionable: false },
    { id: ROLES.booster,            color: 0xf47fff, hoist: false, mentionable: false },
    { id: ROLES.creator,            color: 0xe91e63, hoist: false, mentionable: false },
    // Sonstige
    { id: ROLES.muted,              color: 0x607d8b, hoist: false, mentionable: false },
    { id: ROLES.bot,                color: 0x546e7a, hoist: true,  mentionable: false },
    // Ping-Rollen
    { id: ROLES.pingAnkuendigungen, color: 0x5865f2, hoist: false, mentionable: true  },
    { id: ROLES.pingEvents,         color: 0xfee75c, hoist: false, mentionable: true  },
    { id: ROLES.pingUpdates,        color: 0x57f287, hoist: false, mentionable: true  },
    { id: ROLES.pingServerStatus,   color: 0xed4245, hoist: false, mentionable: true  },
  ];

  for (const cfg of roleConfigs) {
    const role = guild.roles.cache.get(cfg.id);
    if (!role) {
      console.log(`[Roles] ⚠️  Rolle nicht gefunden: ${cfg.id}`);
      continue;
    }

    const needsUpdate =
      role.color       !== cfg.color        ||
      role.hoist       !== cfg.hoist        ||
      role.mentionable !== cfg.mentionable;

    if (!needsUpdate) {
      console.log(`[Roles] ✓  @${role.name} — bereits korrekt`);
      continue;
    }

    await role.edit({ color: cfg.color, hoist: cfg.hoist, mentionable: cfg.mentionable });
    console.log(`[Roles] ✅  @${role.name} — aktualisiert`);
    changed++;
    await sleep(300);
  }

  return changed;
}
