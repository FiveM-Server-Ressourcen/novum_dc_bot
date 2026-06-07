import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} from 'discord.js';
import { CHANNELS, ROLES, PING_ROLES } from '../config.js';
import { hasPermission, getPermLevel } from '../permissions.js';

export default {
  name: 'interactionCreate',
  async execute(interaction, client) {

    // ── Slash Commands ──────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      // Permission-Check
      if (!hasPermission(interaction.member, interaction.commandName)) {
        return interaction.reply({
          content: '❌ Du hast keine Berechtigung für diesen Command.',
          ephemeral: true,
        });
      }

      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error(`[Error] /${interaction.commandName}:`, err);
        const msg = { content: '❌ Ein Fehler ist aufgetreten.', ephemeral: true };
        if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
        else await interaction.reply(msg);
      }
      return;
    }

    // ── Buttons ─────────────────────────────────────────────────
    if (interaction.isButton()) {
      if (interaction.customId === 'create_ticket')       return handleCreateTicket(interaction);
      if (interaction.customId === 'close_ticket')        return handleCloseTicket(interaction);
      if (interaction.customId === 'bug_report_btn')      return showBugModal(interaction);
      if (interaction.customId === 'player_report_btn')   return showPlayerReportModal(interaction);
      if (interaction.customId.startsWith('pingrole_'))   return handlePingRole(interaction);
      return;
    }

    // ── Modals ───────────────────────────────────────────────────
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'bug_modal')             return handleBugReport(interaction);
      if (interaction.customId === 'player_report_modal')   return handlePlayerReport(interaction);
      return;
    }
  },
};

// ── Ticket erstellen ─────────────────────────────────────────────
async function handleCreateTicket(interaction) {
  const guild  = interaction.guild;
  const member = interaction.member;

  const safeName = member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || member.user.id;
  const existing = guild.channels.cache.find(ch => ch.name === `ticket-${safeName}`);
  if (existing) {
    return interaction.reply({ content: `❌ Du hast bereits ein offenes Ticket: ${existing}`, ephemeral: true });
  }

  const perms = [
    { id: guild.roles.everyone,  deny:  [PermissionFlagsBits.ViewChannel] },
    { id: member.id,             allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    { id: ROLES.support,         allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    { id: ROLES.moderator,       allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    { id: ROLES.admin,           allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    { id: ROLES.management,      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    { id: ROLES.coOwner,         allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    { id: ROLES.leitung,         allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
  ];

  const ticketChannel = await guild.channels.create({
    name: `ticket-${safeName}`,
    type: ChannelType.GuildText,
    parent: CHANNELS.ticketKategorie,
    permissionOverwrites: perms,
  });

  const closeBtn = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('🔒 Ticket schließen')
      .setStyle(ButtonStyle.Danger)
  );

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🎟️ Support Ticket')
    .setDescription(
      `Hallo ${member}!\n\n` +
      `Beschreibe dein Anliegen so genau wie möglich.\n` +
      `Unser Support-Team meldet sich so schnell wie möglich.\n\n` +
      `Klicke auf **Ticket schließen** wenn dein Problem gelöst wurde.`
    )
    .setTimestamp();

  await ticketChannel.send({ embeds: [embed], components: [closeBtn] });
  await interaction.reply({ content: `✅ Dein Ticket wurde erstellt: ${ticketChannel}`, ephemeral: true });
}

// ── Ticket schließen ─────────────────────────────────────────────
async function handleCloseTicket(interaction) {
  const channel = interaction.channel;
  if (!channel.name.startsWith('ticket-')) {
    return interaction.reply({ content: '❌ Dieser Kanal ist kein Ticket.', ephemeral: true });
  }
  const embed = new EmbedBuilder()
    .setColor(0xed4245)
    .setTitle('🔒 Ticket geschlossen')
    .setDescription(`Geschlossen von ${interaction.user}.\nDieser Kanal wird in 5 Sekunden gelöscht.`)
    .setTimestamp();
  await interaction.reply({ embeds: [embed] });
  setTimeout(() => channel.delete().catch(console.error), 5000);
}

// ── Bug Report ───────────────────────────────────────────────────
async function showBugModal(interaction) {
  const modal = new ModalBuilder().setCustomId('bug_modal').setTitle('🐞 Bug Report');
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('bug_title').setLabel('Bug Titel')
        .setStyle(TextInputStyle.Short).setPlaceholder('Kurze Beschreibung').setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('bug_description').setLabel('Beschreibung')
        .setStyle(TextInputStyle.Paragraph).setPlaceholder('Was ist passiert?').setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('bug_steps').setLabel('Schritte zum Reproduzieren')
        .setStyle(TextInputStyle.Paragraph).setPlaceholder('1. ...\n2. ...\n3. ...').setRequired(false)
    ),
  );
  await interaction.showModal(modal);
}

async function handleBugReport(interaction) {
  const title       = interaction.fields.getTextInputValue('bug_title');
  const description = interaction.fields.getTextInputValue('bug_description');
  const steps       = interaction.fields.getTextInputValue('bug_steps');

  const bugChannel = interaction.guild.channels.cache.get(CHANNELS.bugReport);
  if (!bugChannel) return interaction.reply({ content: '❌ Bug-Report Kanal nicht gefunden.', ephemeral: true });

  const embed = new EmbedBuilder()
    .setColor(0xfee75c)
    .setTitle(`🐞 ${title}`)
    .addFields(
      { name: '👤 Gemeldet von', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
      { name: '📅 Datum',        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,        inline: true },
      { name: '📋 Beschreibung', value: description },
    )
    .setTimestamp();
  if (steps) embed.addFields({ name: '🔄 Schritte', value: steps });

  await bugChannel.send({ embeds: [embed] });
  await interaction.reply({ content: '✅ Bug Report übermittelt! Danke für die Meldung.', ephemeral: true });
}

// ── Spieler melden ───────────────────────────────────────────────
async function showPlayerReportModal(interaction) {
  const modal = new ModalBuilder().setCustomId('player_report_modal').setTitle('🚨 Spieler melden');
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('report_player').setLabel('Spielername')
        .setStyle(TextInputStyle.Short).setPlaceholder('Name des Spielers').setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('report_reason').setLabel('Grund')
        .setStyle(TextInputStyle.Short).setPlaceholder('z.B. Cheating, Beleidigung...').setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('report_details').setLabel('Details / Beweise')
        .setStyle(TextInputStyle.Paragraph).setPlaceholder('Beschreibe den Vorfall. Links zu Screenshots/Videos helfen.').setRequired(true)
    ),
  );
  await interaction.showModal(modal);
}

async function handlePlayerReport(interaction) {
  const player  = interaction.fields.getTextInputValue('report_player');
  const reason  = interaction.fields.getTextInputValue('report_reason');
  const details = interaction.fields.getTextInputValue('report_details');

  const reportChannel = interaction.guild.channels.cache.get(CHANNELS.spielerMeldungen);
  if (!reportChannel) return interaction.reply({ content: '❌ Meldungskanal nicht gefunden.', ephemeral: true });

  const embed = new EmbedBuilder()
    .setColor(0xed4245)
    .setTitle('🚨 Spieler Meldung')
    .addFields(
      { name: '👤 Gemeldet von',       value: `${interaction.user} (${interaction.user.tag})`, inline: true },
      { name: '🎮 Gemeldeter Spieler',  value: player,                                          inline: true },
      { name: '⚠️ Grund',              value: reason },
      { name: '📋 Details',            value: details },
      { name: '📅 Datum',              value: `<t:${Math.floor(Date.now() / 1000)}:F>`,         inline: true },
    )
    .setTimestamp();

  await reportChannel.send({ embeds: [embed] });
  await interaction.reply({ content: '✅ Meldung übermittelt. Das Team kümmert sich darum.', ephemeral: true });
}

// ── Ping-Rollen Toggle ───────────────────────────────────────────
async function handlePingRole(interaction) {
  const roleId = interaction.customId.replace('pingrole_', '');
  const role   = interaction.guild.roles.cache.get(roleId);
  if (!role) return interaction.reply({ content: '❌ Rolle nicht gefunden.', ephemeral: true });

  const pingRoleDef = PING_ROLES.find(r => r.id === roleId);
  if (!pingRoleDef) return interaction.reply({ content: '❌ Keine Ping-Rolle.', ephemeral: true });

  const hasPingRole = interaction.member.roles.cache.has(roleId);
  if (hasPingRole) {
    await interaction.member.roles.remove(role);
    await interaction.reply({ content: `🔕 Du bekommst keine **${pingRoleDef.label}** Pings mehr.`, ephemeral: true });
  } else {
    await interaction.member.roles.add(role);
    await interaction.reply({ content: `🔔 Du bekommst jetzt **${pingRoleDef.label}** Pings!`, ephemeral: true });
  }
}
