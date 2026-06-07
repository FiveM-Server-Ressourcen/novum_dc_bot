import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { CHANNELS, PING_ROLES } from './config.js';

const PANEL_DEFS = [
  {
    key: 'tickets',
    channelId: CHANNELS.tickets,
    title: '🎟️ Support Tickets',
    build: () => {
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('🎟️ Support Tickets')
        .setDescription(
          'Benötigst du Hilfe? Unser Support-Team ist für dich da!\n\n' +
          '**1.** Klicke auf **Ticket erstellen**\n' +
          '**2.** Wähle deine Kategorie\n' +
          '**3.** Beschreibe dein Anliegen\n' +
          '**4.** Warte auf eine Antwort des Teams\n\n' +
          '*Bitte öffne nur ein Ticket gleichzeitig.*'
        );
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('open_ticket_select')
          .setLabel('🎟️ Ticket erstellen')
          .setStyle(ButtonStyle.Primary)
      );
      return { embeds: [embed], components: [row] };
    },
  },
  {
    key: 'bugReport',
    channelId: CHANNELS.bugReport,
    title: '🐞 Bug Report',
    build: () => {
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
        new ButtonBuilder()
          .setCustomId('bug_report_btn')
          .setLabel('🐞 Bug melden')
          .setStyle(ButtonStyle.Secondary)
      );
      return { embeds: [embed], components: [row] };
    },
  },
  {
    key: 'spielerMeldungen',
    channelId: CHANNELS.spielerMeldungen,
    title: '🚨 Spieler melden',
    build: () => {
      const embed = new EmbedBuilder()
        .setColor(0xed4245)
        .setTitle('🚨 Spieler melden')
        .setDescription(
          'Regelverstoß beobachtet? Melde es dem Team!\n\n' +
          '→ Klicke auf **Spieler melden**\n' +
          '→ Halte Beweise bereit (Screenshots, Videos)\n' +
          '→ Alle Meldungen werden **vertraulich** behandelt\n\n' +
          '*Missbrauch des Systems kann zu Sanktionen führen.*'
        );
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('player_report_btn')
          .setLabel('🚨 Spieler melden')
          .setStyle(ButtonStyle.Danger)
      );
      return { embeds: [embed], components: [row] };
    },
  },
  {
    key: 'supportInfo',
    channelId: CHANNELS.supportInfo,
    title: '❔ Supportsystem — Informationen',
    build: () => {
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
      return { embeds: [embed], components: [] };
    },
  },
  {
    key: 'pingRollen',
    channelId: CHANNELS.pingRollen,
    title: '🔔 Ping-Rollen',
    build: () => {
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('🔔 Ping-Rollen')
        .setDescription(
          'Wähle selbst welche Benachrichtigungen du erhalten möchtest.\n' +
          'Ein Klick gibt dir die Rolle, ein weiterer Klick entfernt sie wieder.\n\n' +
          PING_ROLES.map(r => `${r.label} — ${r.description}`).join('\n')
        );
      const row = new ActionRowBuilder();
      for (const role of PING_ROLES) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`pingrole_${role.id}`)
            .setLabel(role.label)
            .setStyle(ButtonStyle.Secondary)
        );
      }
      return { embeds: [embed], components: [row] };
    },
  },
];

async function findExistingPanel(channel, title, botId) {
  try {
    const messages = await channel.messages.fetch({ limit: 50 });
    return messages.find(m => m.author.id === botId && m.embeds?.[0]?.title === title) ?? null;
  } catch {
    return null;
  }
}

export async function syncPanels(client) {
  const guild = client.guilds.cache.first();
  if (!guild) return;

  for (const def of PANEL_DEFS) {
    const channel = guild.channels.cache.get(def.channelId);
    if (!channel) {
      console.log(`[Panels] ⚠️  Kanal für "${def.key}" nicht gefunden (${def.channelId})`);
      continue;
    }
    const payload  = def.build();
    const existing = await findExistingPanel(channel, def.title, client.user.id);
    if (existing) {
      await existing.edit(payload);
      console.log(`[Panels] ✏️  "${def.title}" aktualisiert in #${channel.name}`);
    } else {
      await channel.send(payload);
      console.log(`[Panels] ✅  "${def.title}" gepostet in #${channel.name}`);
    }
  }
}
