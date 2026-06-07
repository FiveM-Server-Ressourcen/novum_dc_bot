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

export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error(`[Error] Command ${interaction.commandName}:`, err);
        const msg = { content: '❌ Ein Fehler ist aufgetreten.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(msg);
        } else {
          await interaction.reply(msg);
        }
      }
      return;
    }

    // Button Interactions
    if (interaction.isButton()) {
      if (interaction.customId === 'create_ticket') {
        await handleCreateTicket(interaction);
      } else if (interaction.customId === 'close_ticket') {
        await handleCloseTicket(interaction);
      } else if (interaction.customId === 'bug_report_btn') {
        await showBugModal(interaction);
      } else if (interaction.customId === 'player_report_btn') {
        await showPlayerReportModal(interaction);
      }
      return;
    }

    // Modal Submissions
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'bug_modal') {
        await handleBugReport(interaction);
      } else if (interaction.customId === 'player_report_modal') {
        await handlePlayerReport(interaction);
      }
      return;
    }
  },
};

async function handleCreateTicket(interaction) {
  const guild = interaction.guild;
  const member = interaction.member;

  const existingTicket = guild.channels.cache.find(
    ch => ch.name === `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}` && ch.parentId
  );

  if (existingTicket) {
    return interaction.reply({
      content: `❌ Du hast bereits ein offenes Ticket: ${existingTicket}`,
      ephemeral: true,
    });
  }

  const supportCategory = guild.channels.cache.find(
    ch => ch.type === ChannelType.GuildCategory && ch.name.toUpperCase().includes('SUPPORT')
  );

  const ticketChannel = await guild.channels.create({
    name: `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    type: ChannelType.GuildText,
    parent: supportCategory?.id ?? null,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    ],
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
      `Hallo ${member}!\n\nBeschreibe dein Anliegen so genau wie möglich.\nUnser Support-Team meldet sich so schnell wie möglich.\n\n` +
      `Wenn dein Problem gelöst wurde, klicke auf **Ticket schließen**.`
    )
    .setTimestamp();

  await ticketChannel.send({ embeds: [embed], components: [closeBtn] });
  await interaction.reply({ content: `✅ Dein Ticket wurde erstellt: ${ticketChannel}`, ephemeral: true });
}

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

async function showBugModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('bug_modal')
    .setTitle('🐞 Bug Report');

  const titleInput = new TextInputBuilder()
    .setCustomId('bug_title')
    .setLabel('Bug Titel')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Kurze Beschreibung des Bugs')
    .setRequired(true);

  const descInput = new TextInputBuilder()
    .setCustomId('bug_description')
    .setLabel('Beschreibung')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Was ist passiert? Wie kann man den Bug reproduzieren?')
    .setRequired(true);

  const stepsInput = new TextInputBuilder()
    .setCustomId('bug_steps')
    .setLabel('Schritte zum Reproduzieren')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('1. ...\n2. ...\n3. ...')
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(titleInput),
    new ActionRowBuilder().addComponents(descInput),
    new ActionRowBuilder().addComponents(stepsInput),
  );

  await interaction.showModal(modal);
}

async function handleBugReport(interaction) {
  const title = interaction.fields.getTextInputValue('bug_title');
  const description = interaction.fields.getTextInputValue('bug_description');
  const steps = interaction.fields.getTextInputValue('bug_steps');

  const bugChannel = interaction.guild.channels.cache.find(ch => ch.name === 'bug-report' && ch.isTextBased());

  const embed = new EmbedBuilder()
    .setColor(0xfee75c)
    .setTitle(`🐞 Bug Report: ${title}`)
    .addFields(
      { name: '👤 Gemeldet von', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
      { name: '📅 Datum', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
      { name: '📋 Beschreibung', value: description },
    )
    .setTimestamp();

  if (steps) embed.addFields({ name: '🔄 Reproduktionsschritte', value: steps });

  if (bugChannel) {
    await bugChannel.send({ embeds: [embed] });
    await interaction.reply({ content: '✅ Dein Bug Report wurde übermittelt! Danke für die Meldung.', ephemeral: true });
  } else {
    await interaction.reply({ content: '❌ Bug-Report Kanal nicht gefunden.', ephemeral: true });
  }
}

async function showPlayerReportModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('player_report_modal')
    .setTitle('🚨 Spieler melden');

  const playerInput = new TextInputBuilder()
    .setCustomId('report_player')
    .setLabel('Spielername')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Name des Spielers')
    .setRequired(true);

  const reasonInput = new TextInputBuilder()
    .setCustomId('report_reason')
    .setLabel('Grund der Meldung')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('z.B. Cheating, Beleidigung, Griefing...')
    .setRequired(true);

  const detailsInput = new TextInputBuilder()
    .setCustomId('report_details')
    .setLabel('Details / Beweise')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Beschreibe den Vorfall genau. Links zu Screenshots/Videos sind hilfreich.')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(playerInput),
    new ActionRowBuilder().addComponents(reasonInput),
    new ActionRowBuilder().addComponents(detailsInput),
  );

  await interaction.showModal(modal);
}

async function handlePlayerReport(interaction) {
  const player = interaction.fields.getTextInputValue('report_player');
  const reason = interaction.fields.getTextInputValue('report_reason');
  const details = interaction.fields.getTextInputValue('report_details');

  const reportChannel = interaction.guild.channels.cache.find(ch => ch.name === 'spieler-meldungen' && ch.isTextBased());

  const embed = new EmbedBuilder()
    .setColor(0xed4245)
    .setTitle('🚨 Spieler Meldung')
    .addFields(
      { name: '👤 Gemeldet von', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
      { name: '🎮 Gemeldeter Spieler', value: player, inline: true },
      { name: '⚠️ Grund', value: reason },
      { name: '📋 Details', value: details },
      { name: '📅 Datum', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
    )
    .setTimestamp();

  if (reportChannel) {
    await reportChannel.send({ embeds: [embed] });
    await interaction.reply({ content: '✅ Deine Meldung wurde übermittelt. Das Team kümmert sich darum.', ephemeral: true });
  } else {
    await interaction.reply({ content: '❌ Meldungskanal nicht gefunden.', ephemeral: true });
  }
}
