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
import { getChannel, getGuildConfig } from '../config.js';

export default {
  name: 'interactionCreate',
  async execute(interaction, client) {

    // ── Slash Commands ──────────────────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
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

    // ── Buttons ─────────────────────────────────────────────────────────────
    if (interaction.isButton()) {
      if      (interaction.customId === 'create_ticket')    await handleCreateTicket(interaction);
      else if (interaction.customId === 'close_ticket')     await handleCloseTicket(interaction);
      else if (interaction.customId === 'bug_report_btn')   await showBugModal(interaction);
      else if (interaction.customId === 'player_report_btn') await showPlayerReportModal(interaction);
      return;
    }

    // ── Modals ───────────────────────────────────────────────────────────────
    if (interaction.isModalSubmit()) {
      if      (interaction.customId === 'bug_modal')           await handleBugReport(interaction);
      else if (interaction.customId === 'player_report_modal') await handlePlayerReport(interaction);
      return;
    }
  },
};

// ── Ticket erstellen ─────────────────────────────────────────────────────────
async function handleCreateTicket(interaction) {
  const guild  = interaction.guild;
  const member = interaction.member;
  const cfg    = getGuildConfig(guild.id);

  const safeName = member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
  const existing = guild.channels.cache.find(ch => ch.name === `ticket-${safeName}`);
  if (existing) {
    return interaction.reply({ content: `❌ Du hast bereits ein offenes Ticket: ${existing}`, ephemeral: true });
  }

  const categoryId = cfg['ticket-kategorie'];
  const perms = [
    { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
    { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
  ];

  // Gib Moderatoren Zugriff wenn eine Moderator-Rolle gesetzt ist
  if (cfg?.roles?.moderator) {
    perms.push({ id: cfg.roles.moderator, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
  }

  const ticketChannel = await guild.channels.create({
    name: `ticket-${safeName}`,
    type: ChannelType.GuildText,
    parent: categoryId ?? null,
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
      `Hallo ${member}!\n\nBeschreibe dein Anliegen so genau wie möglich.\n` +
      `Unser Support-Team meldet sich so schnell wie möglich.\n\n` +
      `Wenn dein Problem gelöst wurde, klicke auf **Ticket schließen**.`
    )
    .setTimestamp();

  await ticketChannel.send({ embeds: [embed], components: [closeBtn] });
  await interaction.reply({ content: `✅ Dein Ticket wurde erstellt: ${ticketChannel}`, ephemeral: true });
}

// ── Ticket schließen ─────────────────────────────────────────────────────────
async function handleCloseTicket(interaction) {
  const channel = interaction.channel;
  if (!channel.name.startsWith('ticket-')) {
    return interaction.reply({ content: '❌ Dieser Kanal ist kein Ticket.', ephemeral: true });
  }
  const embed = new EmbedBuilder()
    .setColor(0xed4245)
    .setTitle('🔒 Ticket geschlossen')
    .setDescription(`Ticket wurde von ${interaction.user} geschlossen.\nDer Kanal wird in 5 Sekunden gelöscht.`)
    .setTimestamp();
  await interaction.reply({ embeds: [embed] });
  setTimeout(() => channel.delete().catch(console.error), 5000);
}

// ── Bug Report Modal ─────────────────────────────────────────────────────────
async function showBugModal(interaction) {
  const modal = new ModalBuilder().setCustomId('bug_modal').setTitle('🐞 Bug Report');
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('bug_title').setLabel('Bug Titel').setStyle(TextInputStyle.Short)
        .setPlaceholder('Kurze Beschreibung des Bugs').setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('bug_description').setLabel('Beschreibung').setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Was ist passiert? Wie kann man den Bug reproduzieren?').setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('bug_steps').setLabel('Schritte zum Reproduzieren').setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('1. ...\n2. ...\n3. ...').setRequired(false)
    ),
  );
  await interaction.showModal(modal);
}

async function handleBugReport(interaction) {
  const title       = interaction.fields.getTextInputValue('bug_title');
  const description = interaction.fields.getTextInputValue('bug_description');
  const steps       = interaction.fields.getTextInputValue('bug_steps');

  const bugChannel = getChannel(interaction.guild, 'bug-report');
  if (!bugChannel) {
    return interaction.reply({ content: '❌ Bug-Report Kanal nicht konfiguriert.', ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setColor(0xfee75c)
    .setTitle(`🐞 Bug Report: ${title}`)
    .addFields(
      { name: '👤 Gemeldet von', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
      { name: '📅 Datum',       value: `<t:${Math.floor(Date.now() / 1000)}:F>`,         inline: true },
      { name: '📋 Beschreibung', value: description },
    )
    .setTimestamp();
  if (steps) embed.addFields({ name: '🔄 Reproduktionsschritte', value: steps });

  await bugChannel.send({ embeds: [embed] });
  await interaction.reply({ content: '✅ Dein Bug Report wurde übermittelt! Danke.', ephemeral: true });
}

// ── Spieler melden Modal ─────────────────────────────────────────────────────
async function showPlayerReportModal(interaction) {
  const modal = new ModalBuilder().setCustomId('player_report_modal').setTitle('🚨 Spieler melden');
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('report_player').setLabel('Spielername').setStyle(TextInputStyle.Short)
        .setPlaceholder('Name des Spielers').setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('report_reason').setLabel('Grund der Meldung').setStyle(TextInputStyle.Short)
        .setPlaceholder('z.B. Cheating, Beleidigung, Griefing...').setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('report_details').setLabel('Details / Beweise').setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Beschreibe den Vorfall genau. Links zu Screenshots/Videos sind hilfreich.').setRequired(true)
    ),
  );
  await interaction.showModal(modal);
}

async function handlePlayerReport(interaction) {
  const player  = interaction.fields.getTextInputValue('report_player');
  const reason  = interaction.fields.getTextInputValue('report_reason');
  const details = interaction.fields.getTextInputValue('report_details');

  const reportChannel = getChannel(interaction.guild, 'spieler-meldungen');
  if (!reportChannel) {
    return interaction.reply({ content: '❌ Spieler-Meldungen Kanal nicht konfiguriert.', ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setColor(0xed4245)
    .setTitle('🚨 Spieler Meldung')
    .addFields(
      { name: '👤 Gemeldet von',      value: `${interaction.user} (${interaction.user.tag})`, inline: true },
      { name: '🎮 Gemeldeter Spieler', value: player,                                         inline: true },
      { name: '⚠️ Grund',             value: reason },
      { name: '📋 Details',           value: details },
      { name: '📅 Datum',             value: `<t:${Math.floor(Date.now() / 1000)}:F>`,        inline: true },
    )
    .setTimestamp();

  await reportChannel.send({ embeds: [embed] });
  await interaction.reply({ content: '✅ Deine Meldung wurde übermittelt. Das Team kümmert sich darum.', ephemeral: true });
}
