import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { CHANNELS, PING_ROLES } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Postet ein interaktives Panel (Admin+)')
    .addStringOption(o =>
      o.setName('typ').setDescription('Panel-Typ').setRequired(true)
        .addChoices(
          { name: '🎟️ Ticket-Panel',           value: 'tickets'           },
          { name: '🐞 Bug-Report-Panel',         value: 'bug-report'        },
          { name: '🚨 Spieler-Meldungen-Panel',  value: 'spieler-meldungen' },
          { name: '❔ Support-Info-Panel',        value: 'support-info'      },
          { name: '🔔 Ping-Rollen-Panel',         value: 'ping-rollen'       },
        )
    ),

  async execute(interaction) {
    const typ = interaction.options.getString('typ');
    await interaction.deferReply({ ephemeral: true });

    if (typ === 'tickets') {
      const ch = interaction.guild.channels.cache.get(CHANNELS.tickets);
      if (!ch) return interaction.editReply('❌ Ticket-Kanal nicht gefunden.');
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('🎟️ Support Tickets')
        .setDescription(
          'Benötigst du Hilfe? Unser Support-Team ist für dich da!\n\n' +
          '→ Klicke auf **Ticket erstellen**\n' +
          '→ Beschreibe dein Anliegen\n' +
          '→ Warte auf eine Antwort des Teams\n\n' +
          '*Bitte öffne nur ein Ticket gleichzeitig.*'
        );
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('create_ticket').setLabel('🎟️ Ticket erstellen').setStyle(ButtonStyle.Primary)
      );
      await ch.send({ embeds: [embed], components: [row] });

    } else if (typ === 'bug-report') {
      const ch = interaction.guild.channels.cache.get(CHANNELS.bugReport);
      if (!ch) return interaction.editReply('❌ Bug-Report Kanal nicht gefunden.');
      const embed = new EmbedBuilder()
        .setColor(0xfee75c)
        .setTitle('🐞 Bug Report')
        .setDescription(
          'Hast du einen Fehler entdeckt? Hilf uns NOVUM besser zu machen!\n\n' +
          '→ Klicke auf **Bug melden** und fülle das Formular aus\n' +
          '→ Je mehr Details, desto schneller können wir helfen\n\n' +
          '*Danke für deine Mithilfe! 🙏*'
        );
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('bug_report_btn').setLabel('🐞 Bug melden').setStyle(ButtonStyle.Secondary)
      );
      await ch.send({ embeds: [embed], components: [row] });

    } else if (typ === 'spieler-meldungen') {
      const ch = interaction.guild.channels.cache.get(CHANNELS.spielerMeldungen);
      if (!ch) return interaction.editReply('❌ Spieler-Meldungen Kanal nicht gefunden.');
      const embed = new EmbedBuilder()
        .setColor(0xed4245)
        .setTitle('🚨 Spieler melden')
        .setDescription(
          'Regelverstoß beobachtet? Melde es dem Team!\n\n' +
          '→ Klicke auf **Spieler melden**\n' +
          '→ Halte Beweise bereit (Screenshots, Videos)\n' +
          '→ Alle Meldungen werden vertraulich behandelt\n\n' +
          '*Missbrauch des Systems kann zu Sanktionen führen.*'
        );
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('player_report_btn').setLabel('🚨 Spieler melden').setStyle(ButtonStyle.Danger)
      );
      await ch.send({ embeds: [embed], components: [row] });

    } else if (typ === 'support-info') {
      const ch = interaction.guild.channels.cache.get(CHANNELS.supportInfo);
      if (!ch) return interaction.editReply('❌ Support-Info Kanal nicht gefunden.');
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('❔ Supportsystem — Informationen')
        .setDescription(
          '**Wie bekomme ich Support?**\n' +
          `→ Erstelle ein Ticket in <#${CHANNELS.tickets}>\n` +
          `→ Melde Bugs in <#${CHANNELS.bugReport}>\n` +
          `→ Melde Spieler in <#${CHANNELS.spielerMeldungen}>\n\n` +
          '**Reaktionszeiten:**\n' +
          '• Tickets — so schnell wie möglich\n' +
          '• Bug-Reports — innerhalb von 24–48h\n' +
          '• Spieler-Meldungen — innerhalb von 12h\n\n' +
          '**Direkter Kontakt:**\n' +
          '→ Betrete den 🎧 **Support Warteraum**'
        )
        .setFooter({ text: 'NOVUM Support System' })
        .setTimestamp();
      await ch.send({ embeds: [embed] });

    } else if (typ === 'ping-rollen') {
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('🔔 Ping-Rollen')
        .setDescription(
          'Wähle welche Benachrichtigungen du erhalten möchtest.\n' +
          'Ein Klick gibt dir die Rolle, ein weiterer Klick entfernt sie wieder.\n\n' +
          PING_ROLES.map(r => `${r.label} — ${r.description}`).join('\n')
        );

      // Max 5 Buttons pro Row, Discord-Limit
      const rows = [];
      let currentRow = new ActionRowBuilder();
      let count = 0;
      for (const role of PING_ROLES) {
        if (count > 0 && count % 5 === 0) {
          rows.push(currentRow);
          currentRow = new ActionRowBuilder();
        }
        currentRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`pingrole_${role.id}`)
            .setLabel(role.label)
            .setStyle(ButtonStyle.Secondary)
        );
        count++;
      }
      rows.push(currentRow);

      // Panel in aktuellen Kanal posten (Admin wählt selbst den Kanal)
      await interaction.channel.send({ embeds: [embed], components: rows });
    }

    await interaction.editReply('✅ Panel wurde gepostet!');
  },
};
