import {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Richtet die komplette NOVUM Serverstruktur ein')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;

    await interaction.editReply({ content: '⚙️ Erstelle Serverstruktur...' });

    // ── Kategorien + Kanäle ──────────────────────────────────────────────────
    const structure = [
      {
        category: '💫 WILLKOMMEN',
        channels: [
          { name: 'willkommen', emoji: '💫', desc: 'Begrüßung neuer Mitglieder und erste Orientierung' },
          { name: 'start-hier', emoji: '🚀', desc: 'Alles Wichtige für deinen Start auf NOVUM' },
          { name: 'regeln', emoji: '📜', desc: 'Bitte vor dem Spielen vollständig lesen' },
        ],
      },
      {
        category: '📢 INFORMATIONEN',
        channels: [
          { name: 'ankündigungen', emoji: '📣', desc: 'Wichtige Neuigkeiten des Teams' },
          { name: 'updates', emoji: '🛠️', desc: 'Changelogs und Entwicklungsfortschritte' },
          { name: 'server-status', emoji: '📡', desc: 'Informationen zu Wartungen und Serverstatus' },
          { name: 'events', emoji: '📅', desc: 'Kommende Events und Community-Aktionen' },
        ],
      },
      {
        category: '🎫 SUPPORT',
        channels: [
          { name: 'tickets', emoji: '🎟️', desc: 'Support-Tickets erstellen' },
          { name: 'bug-report', emoji: '🐞', desc: 'Fehler und Bugs melden' },
          { name: 'spieler-meldungen', emoji: '🚨', desc: 'Regelverstöße melden' },
          { name: 'support-info', emoji: '❔', desc: 'Informationen zum Supportsystem' },
        ],
      },
      {
        category: '💬 COMMUNITY',
        channels: [
          { name: 'chat', emoji: '💭', desc: null },
          { name: 'medien', emoji: '📸', desc: null },
        ],
      },
    ];

    const voiceChannels = [
      'Support Warteraum',
      'Community Talk',
      'Community Talk 2',
    ];

    const createdChannels = {};

    for (const section of structure) {
      // Create or find category
      let cat = guild.channels.cache.find(
        c => c.type === ChannelType.GuildCategory && c.name === section.category
      );
      if (!cat) {
        cat = await guild.channels.create({
          name: section.category,
          type: ChannelType.GuildCategory,
        });
      }

      for (const ch of section.channels) {
        const existing = guild.channels.cache.find(
          c => c.name === ch.name && c.type === ChannelType.GuildText
        );
        if (!existing) {
          const newCh = await guild.channels.create({
            name: ch.name,
            type: ChannelType.GuildText,
            parent: cat.id,
            topic: ch.desc ?? undefined,
          });
          createdChannels[ch.name] = newCh;
        } else {
          createdChannels[ch.name] = existing;
          await existing.setParent(cat.id, { lockPermissions: false });
        }
      }
    }

    // Voice-Kanäle
    const voiceCat = guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && c.name.includes('SPRACHKANÄLE')
    ) ?? await guild.channels.create({ name: '🔊 SPRACHKANÄLE', type: ChannelType.GuildCategory });

    for (const vcName of voiceChannels) {
      const exists = guild.channels.cache.find(
        c => c.name === vcName && c.type === ChannelType.GuildVoice
      );
      if (!exists) {
        await guild.channels.create({ name: vcName, type: ChannelType.GuildVoice, parent: voiceCat.id });
      }
    }

    // ── Willkommen-Embed ─────────────────────────────────────────────────────
    const welcomeCh = createdChannels['willkommen'];
    if (welcomeCh) {
      await welcomeCh.bulkDelete(10).catch(() => {});
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('💫 Willkommen auf NOVUM!')
        .setDescription(
          '> Schön, dass du hier bist! Lies zuerst die Regeln und schau in **#start-hier** vorbei.\n\n' +
          `**📜 Regeln** → <#${createdChannels['regeln']?.id ?? ''}>\n` +
          `**🚀 Start** → <#${createdChannels['start-hier']?.id ?? ''}>\n` +
          `**🎟️ Support** → <#${createdChannels['tickets']?.id ?? ''}>`
        )
        .setImage('https://i.imgur.com/YABLGKn.png')
        .setTimestamp();
      await welcomeCh.send({ embeds: [embed] });
    }

    // ── Regeln-Embed ─────────────────────────────────────────────────────────
    const regelCh = createdChannels['regeln'];
    if (regelCh) {
      await regelCh.bulkDelete(10).catch(() => {});
      const embed = new EmbedBuilder()
        .setColor(0xed4245)
        .setTitle('📜 NOVUM — Serverregeln')
        .setDescription(
          '**1. Respektvoller Umgang**\nBehandle alle Mitglieder mit Respekt. Beleidigungen, Diskriminierung und Hassrede sind verboten.\n\n' +
          '**2. Kein Spam / Werbung**\nKein Spam, keine unerwünschte Werbung oder externe Links ohne Erlaubnis.\n\n' +
          '**3. Themenkanäle beachten**\nSchreibe nur im passenden Kanal. Off-Topic Nachrichten werden gelöscht.\n\n' +
          '**4. Kein Cheating / Exploiting**\nJede Form von Cheats, Hacks oder das Ausnutzen von Bugs ist verboten.\n\n' +
          '**5. Richtlinien folgen**\nDie Discord-Nutzungsbedingungen und Community-Richtlinien sind einzuhalten.\n\n' +
          '**6. Anweisungen des Teams folgen**\nAnweisungen von Moderatoren und Admins sind Folge zu leisten.\n\n' +
          '*Bei Verstößen drohen Verwarnungen, temporäre oder permanente Bans.*'
        )
        .setFooter({ text: 'NOVUM Team • Zuletzt aktualisiert' })
        .setTimestamp();
      await regelCh.send({ embeds: [embed] });
    }

    // ── Ticket-Panel ─────────────────────────────────────────────────────────
    const ticketCh = createdChannels['tickets'];
    if (ticketCh) {
      await ticketCh.bulkDelete(10).catch(() => {});
      const embed = new EmbedBuilder()
        .setColor(0x57f287)
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
      await ticketCh.send({ embeds: [embed], components: [row] });
    }

    // ── Bug-Report Panel ─────────────────────────────────────────────────────
    const bugCh = createdChannels['bug-report'];
    if (bugCh) {
      await bugCh.bulkDelete(10).catch(() => {});
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
      await bugCh.send({ embeds: [embed], components: [row] });
    }

    // ── Spieler-Meldungen Panel ───────────────────────────────────────────────
    const reportCh = createdChannels['spieler-meldungen'];
    if (reportCh) {
      await reportCh.bulkDelete(10).catch(() => {});
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
      await reportCh.send({ embeds: [embed], components: [row] });
    }

    // ── Support-Info ─────────────────────────────────────────────────────────
    const supportInfoCh = createdChannels['support-info'];
    if (supportInfoCh) {
      await supportInfoCh.bulkDelete(10).catch(() => {});
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('❔ Supportsystem — Informationen')
        .setDescription(
          '**Wie bekomme ich Support?**\n' +
          `→ Erstelle ein Ticket in <#${ticketCh?.id ?? 'tickets'}>\n` +
          `→ Melde Bugs in <#${bugCh?.id ?? 'bug-report'}>\n` +
          `→ Melde Spieler in <#${reportCh?.id ?? 'spieler-meldungen'}>\n\n` +
          '**Reaktionszeiten:**\n' +
          '• Tickets: so schnell wie möglich\n' +
          '• Bug-Reports: innerhalb von 24–48h\n' +
          '• Spieler-Meldungen: innerhalb von 12h\n\n' +
          '**Support-Team kontaktieren:**\n' +
          '→ Betrete den 🎧 **Support Warteraum** für direkten Kontakt'
        )
        .setFooter({ text: 'NOVUM Support System' })
        .setTimestamp();
      await supportInfoCh.send({ embeds: [embed] });
    }

    await interaction.editReply({
      content: '✅ **Serverstruktur erfolgreich eingerichtet!**\n\n' +
        '📁 Kategorien und Kanäle wurden erstellt\n' +
        '📋 Alle Panels wurden gepostet\n' +
        '🔊 Sprachkanäle wurden angelegt',
    });
  },
};
