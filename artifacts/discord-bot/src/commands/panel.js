import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { getChannel, getGuildConfig } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Postet ein interaktives Panel in den konfigurierten Kanal')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt =>
      opt.setName('typ')
        .setDescription('Welches Panel soll gepostet werden?')
        .setRequired(true)
        .addChoices(
          { name: '🎟️ Ticket-Panel', value: 'tickets' },
          { name: '🐞 Bug-Report-Panel', value: 'bug-report' },
          { name: '🚨 Spieler-Meldungen-Panel', value: 'spieler-meldungen' },
          { name: '❔ Support-Info-Panel', value: 'support-info' },
        )
    ),

  async execute(interaction) {
    const typ = interaction.options.getString('typ');
    const channel = getChannel(interaction.guild, typ);
    const cfg = getGuildConfig(interaction.guild.id);

    if (!channel) {
      return interaction.reply({
        content: `❌ Kanal für **${typ}** nicht konfiguriert. Nutze zuerst \`/setchannel\`.`,
        ephemeral: true,
      });
    }

    if (typ === 'tickets') {
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('🎟️ Support Tickets')
        .setDescription(
          'Benötigst du Hilfe? Unser Support-Team ist für dich da!\n\n' +
          '**So erstellst du ein Ticket:**\n' +
          '→ Klicke auf **Ticket erstellen**\n' +
          '→ Beschreibe dein Anliegen\n' +
          '→ Warte auf eine Antwort des Teams\n\n' +
          '*Bitte öffne nur ein Ticket gleichzeitig.*'
        );
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('create_ticket')
          .setLabel('🎟️ Ticket erstellen')
          .setStyle(ButtonStyle.Primary)
      );
      await channel.send({ embeds: [embed], components: [row] });

    } else if (typ === 'bug-report') {
      const embed = new EmbedBuilder()
        .setColor(0xfee75c)
        .setTitle('🐞 Bug Report')
        .setDescription(
          'Hast du einen Fehler entdeckt? Hilf uns, NOVUM besser zu machen!\n\n' +
          '→ Klicke auf **Bug melden** und fülle das Formular aus\n' +
          '→ Je mehr Details, desto schneller können wir helfen\n\n' +
          '*Vielen Dank für deine Mithilfe! 🙏*'
        );
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('bug_report_btn')
          .setLabel('🐞 Bug melden')
          .setStyle(ButtonStyle.Secondary)
      );
      await channel.send({ embeds: [embed], components: [row] });

    } else if (typ === 'spieler-meldungen') {
      const embed = new EmbedBuilder()
        .setColor(0xed4245)
        .setTitle('🚨 Spieler melden')
        .setDescription(
          'Regelverstoß beobachtet? Melde es dem Team!\n\n' +
          '→ Klicke auf **Spieler melden** und fülle das Formular aus\n' +
          '→ Halte Beweise bereit (Screenshots, Videos)\n' +
          '→ Alle Meldungen werden vertraulich behandelt\n\n' +
          '*Missbrauch des Systems kann zu Sanktionen führen.*'
        );
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('player_report_btn')
          .setLabel('🚨 Spieler melden')
          .setStyle(ButtonStyle.Danger)
      );
      await channel.send({ embeds: [embed], components: [row] });

    } else if (typ === 'support-info') {
      const ticketsId = cfg['tickets'];
      const bugId = cfg['bug-report'];
      const reportId = cfg['spieler-meldungen'];

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('❔ Supportsystem — Informationen')
        .setDescription(
          '**Wie bekomme ich Support?**\n' +
          (ticketsId  ? `→ Erstelle ein Ticket in <#${ticketsId}>\n` : '') +
          (bugId      ? `→ Melde Bugs in <#${bugId}>\n` : '') +
          (reportId   ? `→ Melde Spieler in <#${reportId}>\n` : '') +
          '\n**Reaktionszeiten:**\n' +
          '• Tickets: so schnell wie möglich\n' +
          '• Bug-Reports: innerhalb von 24–48h\n' +
          '• Spieler-Meldungen: innerhalb von 12h\n\n' +
          '**Support-Team kontaktieren:**\n' +
          '→ Betrete den 🎧 **Support Warteraum** für direkten Kontakt'
        )
        .setFooter({ text: 'NOVUM Support System' })
        .setTimestamp();
      await channel.send({ embeds: [embed] });
    }

    await interaction.reply({ content: `✅ Panel wurde in ${channel} gepostet.`, ephemeral: true });
  },
};
