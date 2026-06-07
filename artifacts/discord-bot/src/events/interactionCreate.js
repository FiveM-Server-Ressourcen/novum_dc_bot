import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} from 'discord.js';
import { CHANNELS, FORUMS, ROLES, TICKET_CATEGORIES, TICKET_TAGS, BUG_TAGS, REPORT_TAGS, PING_ROLES } from '../config.js';
import { hasPermission, getPermLevel, isTeam } from '../permissions.js';
import { ensureTags, getTagId, setThreadTags } from '../forum.js';

// ── Globaler Error-Handler ──────────────────────────────────────
async function safeReply(interaction, content) {
  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content, ephemeral: true });
    } else {
      await interaction.reply({ content, ephemeral: true });
    }
  } catch { /* ignore */ }
}

export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand())  return await handleSlash(interaction, client);
      if (interaction.isStringSelectMenu())  return await handleSelect(interaction);
      if (interaction.isButton())            return await handleButton(interaction);
      if (interaction.isModalSubmit())       return await handleModal(interaction);
    } catch (err) {
      console.error('[InteractionCreate]', err);
      await safeReply(interaction, '❌ Ein unerwarteter Fehler ist aufgetreten.');
    }
  },
};

// ════════════════════════════════════════════════════════════════
//  DISPATCHER
// ════════════════════════════════════════════════════════════════

async function handleSlash(interaction, client) {
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  if (!hasPermission(interaction.member, interaction.commandName)) {
    return interaction.reply({ content: '❌ Du hast keine Berechtigung für diesen Command.', ephemeral: true });
  }
  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(`[Slash /${interaction.commandName}]`, err);
    await safeReply(interaction, '❌ Ein Fehler ist aufgetreten.');
  }
}

async function handleSelect(interaction) {
  if (interaction.customId === 'ticket_category') return showTicketModal(interaction);
}

async function handleButton(interaction) {
  const id = interaction.customId;
  if (id === 'open_ticket_select')         return showCategorySelect(interaction);
  if (id === 'bug_report_btn')             return showBugModal(interaction);
  if (id === 'player_report_btn')          return showPlayerReportModal(interaction);
  if (id === 'ticket_claim')               return handleClaim(interaction);
  if (id === 'ticket_close')               return showCloseModal(interaction);
  if (id.startsWith('ticket_prio_'))       return handlePriority(interaction);
  if (id.startsWith('bug_'))               return handleBugStatus(interaction);
  if (id.startsWith('report_'))            return handleReportStatus(interaction);
  if (id.startsWith('pingrole_'))          return handlePingRole(interaction);
}

async function handleModal(interaction) {
  const id = interaction.customId;
  if (id.startsWith('ticket_modal_'))  return handleTicketCreate(interaction);
  if (id === 'bug_modal')              return handleBugReport(interaction);
  if (id === 'player_report_modal')    return handlePlayerReport(interaction);
  if (id === 'ticket_close_modal')     return handleTicketClose(interaction);
}

// ════════════════════════════════════════════════════════════════
//  TICKET SYSTEM
// ════════════════════════════════════════════════════════════════

async function showCategorySelect(interaction) {
  const select = new StringSelectMenuBuilder()
    .setCustomId('ticket_category')
    .setPlaceholder('Wähle eine Kategorie...')
    .addOptions(TICKET_CATEGORIES.map(cat => ({
      label: cat.label,
      description: cat.desc,
      value: cat.id,
    })));

  await interaction.reply({
    content: '**📋 Welches Anliegen hast du?**\nWähle die passende Kategorie aus:',
    components: [new ActionRowBuilder().addComponents(select)],
    ephemeral: true,
  });
}

async function showTicketModal(interaction) {
  const catId = interaction.values[0];
  const cat   = TICKET_CATEGORIES.find(c => c.id === catId);

  const modal = new ModalBuilder()
    .setCustomId(`ticket_modal_${catId}`)
    .setTitle(cat.label);

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('ticket_subject').setLabel('Betreff')
        .setStyle(TextInputStyle.Short).setPlaceholder('Kurze Beschreibung deines Anliegens')
        .setMaxLength(100).setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('ticket_description').setLabel('Beschreibung')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Beschreibe dein Anliegen so detailliert wie möglich...')
        .setMinLength(20).setRequired(true)
    ),
  );

  await interaction.showModal(modal);
}

async function handleTicketCreate(interaction) {
  // Sofort defer — verhindert Timeout
  await interaction.deferReply({ ephemeral: true });

  const catId   = interaction.customId.replace('ticket_modal_', '');
  const cat     = TICKET_CATEGORIES.find(c => c.id === catId);
  const subject = interaction.fields.getTextInputValue('ticket_subject');
  const desc    = interaction.fields.getTextInputValue('ticket_description');
  const member  = interaction.member;
  const guild   = interaction.guild;

  const forumChannel = guild.channels.cache.get(FORUMS.tickets);
  if (!forumChannel) return interaction.editReply('❌ Ticket-Forum nicht gefunden.');

  // Duplikat-Check
  await forumChannel.threads.fetchActive();
  const existing = forumChannel.threads.cache.find(
    t => !t.archived && t.name.toLowerCase().includes(member.user.username.toLowerCase())
  );
  if (existing) {
    return interaction.editReply(`❌ Du hast bereits ein offenes Ticket: ${existing}`);
  }

  // Tags sicherstellen
  await ensureTags(forumChannel, TICKET_TAGS);
  const tagOffen  = getTagId(forumChannel, TICKET_TAGS.offen.name);
  const tagMittel = getTagId(forumChannel, TICKET_TAGS.mittel.name);

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`🎟️ ${subject}`)
    .setDescription(desc)
    .addFields(
      { name: '👤 Ersteller',  value: `${member} (${member.user.tag})`,          inline: true },
      { name: '📋 Kategorie',  value: cat.label,                                 inline: true },
      { name: '⚡ Priorität',  value: '➡️ Mittel',                               inline: true },
      { name: '🔖 Status',     value: '🟢 Offen',                                inline: true },
      { name: '📅 Erstellt',   value: `<t:${Math.floor(Date.now() / 1000)}:F>`,  inline: true },
    )
    .setFooter({ text: `User-ID: ${member.user.id}` })
    .setTimestamp();

  const controlRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_claim').setLabel('✋ Übernehmen').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('ticket_close').setLabel('🔒 Schließen').setStyle(ButtonStyle.Danger),
  );
  const prioRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_prio_niedrig').setLabel('⬇️ Niedrig').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('ticket_prio_mittel').setLabel('➡️ Mittel').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('ticket_prio_hoch').setLabel('⬆️ Hoch').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('ticket_prio_kritisch').setLabel('🔴 Kritisch').setStyle(ButtonStyle.Danger),
  );

  const thread = await forumChannel.threads.create({
    name: `[${cat.id.toUpperCase()}] ${member.user.username} — ${subject}`.slice(0, 100),
    message: { embeds: [embed], components: [controlRow, prioRow] },
    appliedTags: [tagOffen, tagMittel].filter(Boolean),
  });

  // Nur bei Tickets: Ersteller zum Thread hinzufügen
  await thread.members.add(member.id);

  // Team benachrichtigen
  await thread.send({
    content: `<@&${ROLES.support}> <@&${ROLES.moderator}> — neues Ticket von ${member} | Kategorie: **${cat.label}**`,
    allowedMentions: { roles: [ROLES.support, ROLES.moderator] },
  });

  await interaction.editReply(
    `✅ Dein Ticket wurde erstellt: ${thread}\nDas Support-Team meldet sich schnellstmöglich.`
  );
}

async function handleClaim(interaction) {
  if (!isTeam(interaction.member)) {
    return interaction.reply({ content: '❌ Nur Team-Mitglieder können Tickets übernehmen.', ephemeral: true });
  }

  await interaction.deferReply();

  const thread = interaction.channel;
  const forumChannel = interaction.guild.channels.cache.get(FORUMS.tickets);
  await ensureTags(forumChannel, TICKET_TAGS);

  const tagOffen   = getTagId(forumChannel, TICKET_TAGS.offen.name);
  const tagClaimed = getTagId(forumChannel, TICKET_TAGS.claimed.name);
  const remaining  = thread.appliedTags.filter(id => id !== tagOffen);
  await setThreadTags(thread, [...remaining, tagClaimed].filter(Boolean));
  await thread.edit({ name: thread.name.replace(/^\[.*?\]/, '[IN BEARBEITUNG]').slice(0, 100) });

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('✋ Ticket übernommen')
        .setDescription(`${interaction.user} kümmert sich jetzt um dieses Ticket.`)
        .setTimestamp(),
    ],
  });
}

async function showCloseModal(interaction) {
  const isOwner = interaction.channel.name.toLowerCase().includes(
    interaction.user.username.toLowerCase()
  );
  if (!isTeam(interaction.member) && !isOwner) {
    return interaction.reply({
      content: '❌ Nur Team-Mitglieder oder der Ticket-Ersteller können schließen.',
      ephemeral: true,
    });
  }

  const modal = new ModalBuilder().setCustomId('ticket_close_modal').setTitle('🔒 Ticket schließen');
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('close_reason').setLabel('Lösung / Grund')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Was wurde gemacht? Wie wurde das Problem gelöst?')
        .setRequired(true)
    )
  );
  await interaction.showModal(modal);
}

async function handleTicketClose(interaction) {
  await interaction.deferReply();

  const reason = interaction.fields.getTextInputValue('close_reason');
  const thread = interaction.channel;
  const forumChannel = interaction.guild.channels.cache.get(FORUMS.tickets);
  await ensureTags(forumChannel, TICKET_TAGS);

  const statusTagIds = [
    getTagId(forumChannel, TICKET_TAGS.offen.name),
    getTagId(forumChannel, TICKET_TAGS.claimed.name),
    getTagId(forumChannel, TICKET_TAGS.wartend.name),
  ].filter(Boolean);
  const tagGeloest = getTagId(forumChannel, TICKET_TAGS.geloest.name);
  const remaining  = thread.appliedTags.filter(id => !statusTagIds.includes(id));
  await setThreadTags(thread, [...remaining, tagGeloest].filter(Boolean));
  await thread.edit({ name: thread.name.replace(/^\[.*?\]/, '[GELÖST]').slice(0, 100) });

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle('✅ Ticket geschlossen')
        .addFields(
          { name: '🛡️ Geschlossen von', value: `${interaction.user}`,                    inline: true },
          { name: '📅 Datum',            value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: '📋 Lösung / Grund',   value: reason },
        )
        .setTimestamp(),
    ],
  });

  setTimeout(() => thread.setArchived(true).catch(console.error), 8_000);
}

async function handlePriority(interaction) {
  if (!isTeam(interaction.member)) {
    return interaction.reply({ content: '❌ Nur Team-Mitglieder können die Priorität ändern.', ephemeral: true });
  }

  await interaction.deferReply();

  const prioKey = interaction.customId.replace('ticket_prio_', '');
  const prioMap = {
    niedrig:  { label: '⬇️ Niedrig',  color: 0x57f287, tagKey: 'niedrig'  },
    mittel:   { label: '➡️ Mittel',   color: 0xfee75c, tagKey: 'mittel'   },
    hoch:     { label: '⬆️ Hoch',     color: 0xe67e22, tagKey: 'hoch'     },
    kritisch: { label: '🔴 Kritisch', color: 0xed4245, tagKey: 'kritisch' },
  };
  const prio = prioMap[prioKey];
  if (!prio) return interaction.editReply('❌ Ungültige Priorität.');

  const thread = interaction.channel;
  const forumChannel = interaction.guild.channels.cache.get(FORUMS.tickets);
  await ensureTags(forumChannel, TICKET_TAGS);

  const prioTagIds = ['niedrig', 'mittel', 'hoch', 'kritisch']
    .map(k => getTagId(forumChannel, TICKET_TAGS[k].name)).filter(Boolean);
  const newTag    = getTagId(forumChannel, TICKET_TAGS[prio.tagKey].name);
  const remaining = thread.appliedTags.filter(id => !prioTagIds.includes(id));
  await setThreadTags(thread, [...remaining, newTag].filter(Boolean));

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(prio.color)
        .setDescription(`⚡ Priorität auf **${prio.label}** gesetzt von ${interaction.user}`)
        .setTimestamp(),
    ],
  });
}

// ════════════════════════════════════════════════════════════════
//  BUG REPORT
// ════════════════════════════════════════════════════════════════

async function showBugModal(interaction) {
  const modal = new ModalBuilder().setCustomId('bug_modal').setTitle('🐞 Bug Report');
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('bug_title').setLabel('Bug Titel')
        .setStyle(TextInputStyle.Short).setPlaceholder('Kurze Beschreibung des Bugs')
        .setMaxLength(100).setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('bug_description').setLabel('Was ist passiert?')
        .setStyle(TextInputStyle.Paragraph).setPlaceholder('Beschreibe den Bug so genau wie möglich.')
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('bug_steps').setLabel('Schritte zum Reproduzieren')
        .setStyle(TextInputStyle.Paragraph).setPlaceholder('1. ...\n2. ...\n3. ...').setRequired(false)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('bug_expected').setLabel('Erwartetes Verhalten')
        .setStyle(TextInputStyle.Short).setPlaceholder('Was hätte passieren sollen?').setRequired(false)
    ),
  );
  await interaction.showModal(modal);
}

async function handleBugReport(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const title    = interaction.fields.getTextInputValue('bug_title');
  const desc     = interaction.fields.getTextInputValue('bug_description');
  const steps    = interaction.fields.getTextInputValue('bug_steps');
  const expected = interaction.fields.getTextInputValue('bug_expected');

  const forumChannel = interaction.guild.channels.cache.get(FORUMS.bugReport);
  if (!forumChannel) return interaction.editReply('❌ Bug-Report Forum nicht gefunden.');

  await ensureTags(forumChannel, BUG_TAGS);
  const tagNeu = getTagId(forumChannel, BUG_TAGS.neu.name);

  const embed = new EmbedBuilder()
    .setColor(0xfee75c)
    .setTitle(`🐞 ${title}`)
    .addFields(
      { name: '📋 Beschreibung', value: desc },
      ...(steps    ? [{ name: '🔄 Reproduktionsschritte', value: steps }]    : []),
      ...(expected ? [{ name: '✅ Erwartetes Verhalten',   value: expected }] : []),
      { name: '👤 Gemeldet von', value: `${interaction.user.tag}`, inline: true },
      { name: '📅 Datum',        value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
    )
    .setFooter({ text: `User-ID: ${interaction.user.id}` })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('bug_inpruefung').setLabel('🔄 In Prüfung').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('bug_behoben').setLabel('✅ Behoben').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('bug_keinbug').setLabel('❌ Kein Bug').setStyle(ButtonStyle.Danger),
  );

  // Kein members.add() — Reporter bleibt anonym
  await forumChannel.threads.create({
    name: title.slice(0, 100),
    message: { embeds: [embed], components: [row] },
    appliedTags: [tagNeu].filter(Boolean),
  });

  await interaction.editReply('✅ Dein Bug Report wurde übermittelt! Danke für die Meldung.');
}

async function handleBugStatus(interaction) {
  if (!isTeam(interaction.member)) {
    return interaction.reply({ content: '❌ Nur Team-Mitglieder können den Status ändern.', ephemeral: true });
  }

  await interaction.deferReply();

  const forumChannel = interaction.guild.channels.cache.get(FORUMS.bugReport);
  await ensureTags(forumChannel, BUG_TAGS);

  const id = interaction.customId;
  const statusMap = {
    bug_inpruefung: { label: '🔄 In Prüfung', tagKey: 'inPruefung', color: 0x5865f2 },
    bug_behoben:    { label: '✅ Behoben',     tagKey: 'behoben',    color: 0x57f287 },
    bug_keinbug:    { label: '❌ Kein Bug',    tagKey: 'keinBug',    color: 0xed4245 },
  };
  const s = statusMap[id];
  if (!s) return;

  const allTagIds = Object.values(BUG_TAGS).map(t => getTagId(forumChannel, t.name)).filter(Boolean);
  const newTag    = getTagId(forumChannel, BUG_TAGS[s.tagKey].name);
  const remaining = interaction.channel.appliedTags.filter(t => !allTagIds.includes(t));
  await setThreadTags(interaction.channel, [...remaining, newTag].filter(Boolean));

  await interaction.editReply({
    embeds: [
      new EmbedBuilder().setColor(s.color)
        .setDescription(`${s.label} — gesetzt von ${interaction.user}`)
        .setTimestamp(),
    ],
  });

  if (id === 'bug_behoben' || id === 'bug_keinbug') {
    setTimeout(() => interaction.channel.setArchived(true).catch(console.error), 5_000);
  }
}

// ════════════════════════════════════════════════════════════════
//  SPIELER MELDUNG
// ════════════════════════════════════════════════════════════════

async function showPlayerReportModal(interaction) {
  const modal = new ModalBuilder().setCustomId('player_report_modal').setTitle('🚨 Spieler melden');
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('report_player').setLabel('Spielername')
        .setStyle(TextInputStyle.Short).setPlaceholder('Ingame-Name des Spielers').setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('report_reason').setLabel('Regelverstoß')
        .setStyle(TextInputStyle.Short).setPlaceholder('z.B. Cheating, Beleidigung, Griefing...').setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('report_details').setLabel('Details')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Beschreibe den Vorfall genau. Wann? Wo? Was wurde gesagt/getan?').setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('report_evidence').setLabel('Beweise (Links zu Screenshots/Videos)')
        .setStyle(TextInputStyle.Short).setPlaceholder('https://...').setRequired(false)
    ),
  );
  await interaction.showModal(modal);
}

async function handlePlayerReport(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const player   = interaction.fields.getTextInputValue('report_player');
  const reason   = interaction.fields.getTextInputValue('report_reason');
  const details  = interaction.fields.getTextInputValue('report_details');
  const evidence = interaction.fields.getTextInputValue('report_evidence');

  const forumChannel = interaction.guild.channels.cache.get(FORUMS.spielerMeldungen);
  if (!forumChannel) return interaction.editReply('❌ Spieler-Meldungen Forum nicht gefunden.');

  await ensureTags(forumChannel, REPORT_TAGS);
  const tagNeu = getTagId(forumChannel, REPORT_TAGS.neu.name);

  const embed = new EmbedBuilder()
    .setColor(0xed4245)
    .setTitle(`🚨 ${player} — ${reason}`)
    .addFields(
      { name: '🎮 Gemeldeter Spieler', value: player,  inline: true },
      { name: '⚠️ Regelverstoß',       value: reason,  inline: true },
      { name: '📋 Details',            value: details },
      ...(evidence ? [{ name: '🔗 Beweise', value: evidence }] : []),
      { name: '👤 Gemeldet von', value: `${interaction.user.tag}`, inline: true },
      { name: '📅 Datum',        value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
    )
    .setFooter({ text: `User-ID: ${interaction.user.id} • Vertraulich` })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('report_inpruefung').setLabel('🔄 In Prüfung').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('report_bestraft').setLabel('✅ Bestraft').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('report_abgelehnt').setLabel('❌ Abgelehnt').setStyle(ButtonStyle.Danger),
  );

  // Kein members.add() — Meldung bleibt anonym
  await forumChannel.threads.create({
    name: `${player} — ${reason}`.slice(0, 100),
    message: { embeds: [embed], components: [row] },
    appliedTags: [tagNeu].filter(Boolean),
  });

  await interaction.editReply('✅ Deine Meldung wurde vertraulich übermittelt. Das Team kümmert sich darum.');
}

async function handleReportStatus(interaction) {
  if (!isTeam(interaction.member)) {
    return interaction.reply({ content: '❌ Nur Team-Mitglieder können den Status ändern.', ephemeral: true });
  }

  await interaction.deferReply();

  const forumChannel = interaction.guild.channels.cache.get(FORUMS.spielerMeldungen);
  await ensureTags(forumChannel, REPORT_TAGS);

  const id = interaction.customId;
  const statusMap = {
    report_inpruefung: { label: '🔄 In Prüfung', tagKey: 'inPruefung', color: 0x5865f2 },
    report_bestraft:   { label: '✅ Bestraft',    tagKey: 'bestraft',   color: 0x57f287 },
    report_abgelehnt:  { label: '❌ Abgelehnt',   tagKey: 'abgelehnt',  color: 0xed4245 },
  };
  const s = statusMap[id];
  if (!s) return;

  const allTagIds = Object.values(REPORT_TAGS).map(t => getTagId(forumChannel, t.name)).filter(Boolean);
  const newTag    = getTagId(forumChannel, REPORT_TAGS[s.tagKey].name);
  const remaining = interaction.channel.appliedTags.filter(t => !allTagIds.includes(t));
  await setThreadTags(interaction.channel, [...remaining, newTag].filter(Boolean));

  await interaction.editReply({
    embeds: [
      new EmbedBuilder().setColor(s.color)
        .setDescription(`${s.label} — bearbeitet von ${interaction.user}`)
        .setTimestamp(),
    ],
  });

  if (id === 'report_bestraft' || id === 'report_abgelehnt') {
    setTimeout(() => interaction.channel.setArchived(true).catch(console.error), 5_000);
  }
}

// ════════════════════════════════════════════════════════════════
//  PING-ROLLEN
// ════════════════════════════════════════════════════════════════

async function handlePingRole(interaction) {
  const roleId = interaction.customId.replace('pingrole_', '');
  const role   = interaction.guild.roles.cache.get(roleId);
  const def    = PING_ROLES.find(r => r.id === roleId);
  if (!role || !def) return interaction.reply({ content: '❌ Rolle nicht gefunden.', ephemeral: true });

  const has = interaction.member.roles.cache.has(roleId);
  if (has) {
    await interaction.member.roles.remove(role);
    await interaction.reply({ content: `🔕 Du bekommst keine **${def.label}** Pings mehr.`, ephemeral: true });
  } else {
    await interaction.member.roles.add(role);
    await interaction.reply({ content: `🔔 Du bekommst jetzt **${def.label}** Pings!`, ephemeral: true });
  }
}
