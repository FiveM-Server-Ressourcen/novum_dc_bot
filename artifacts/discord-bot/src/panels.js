import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { CHANNELS, PING_ROLES, BEWERBUNG_POSITIONEN } from './config.js';

// ── Regeln ──────────────────────────────────────────────────────────────────
const RULES_EMBED = new EmbedBuilder()
  .setColor(0x8a2be2)
  .setTitle('📜 Serverregeln — NOVUM Roleplay')
  .setDescription(
    '> Bitte lies alle Regeln sorgfältig durch. Unwissenheit schützt nicht vor Konsequenzen.\n\u200b'
  )
  .addFields(
    {
      name: '§1 · Allgemeines Verhalten',
      value:
        '• Respektvoller Umgang miteinander — Beleidigungen, Diskriminierung oder Hassrede sind **verboten**\n' +
        '• Kein Spam, kein Flooding, kein übermäßiges Großschreiben\n' +
        '• Werbung für andere Server ist **nicht gestattet**\n' +
        '• Bots und Selfbots sind verboten',
    },
    {
      name: '§2 · Roleplay-Regeln',
      value:
        '• **RDM** (Random Deathmatch) — grundloses Töten ist verboten\n' +
        '• **VDM** (Vehicle Deathmatch) — Fahrzeuge als Waffe ohne RP-Grund ist verboten\n' +
        '• **Powergaming** — unrealistische Handlungen erzwingen ist untersagt\n' +
        '• **Metagaming** — OOC-Wissen im RP nutzen ist verboten\n' +
        '• **NLR** (New Life Rule) — nach dem Tod vergisst du alles aus dem letzten Leben',
    },
    {
      name: '§3 · Kommunikation',
      value:
        '• Spreche in den richtigen Kanälen (IC vs. OOC beachten)\n' +
        '• Keine NSFW-Inhalte in Text- oder Sprachkanälen\n' +
        '• Bleibe im RP so lange wie möglich — OOC-Abbrüche nur wenn nötig',
    },
    {
      name: '§4 · Fahrzeuge & Gegenstände',
      value:
        '• Fahrzeuge dürfen nur auf legale oder RP-konforme Weise genutzt werden\n' +
        '• Exploits, Bugs oder Glitches müssen sofort via Ticket gemeldet werden\n' +
        '• Das absichtliche Ausnutzen von Bugs führt zu permanentem Bann',
    },
    {
      name: '§5 · Team & Administration',
      value:
        '• Entscheidungen des Teams sind zu respektieren\n' +
        '• Beschwerden gegen Teammitglieder bitte per Ticket einreichen\n' +
        '• Das Team hat das letzte Wort bei Regelauslegungen',
    },
    {
      name: '§6 · Sanktionen',
      value:
        '• Verwarnungen → Temporärer Bann → Permanenter Bann\n' +
        '• Schwere Verstöße (Exploits, Hacks) führen zu sofortigem Bann\n' +
        '• Bann-Appeals können per Ticket eingereicht werden',
    },
    {
      name: '\u200b',
      value: '*Mit dem Betreten des Servers stimmst du diesen Regeln zu.*',
    }
  )
  .setFooter({ text: 'NOVUM RP • Zuletzt aktualisiert' })
  .setTimestamp();

// ── Start Hier ───────────────────────────────────────────────────────────────
const STARTHIER_EMBED = new EmbedBuilder()
  .setColor(0x8a2be2)
  .setTitle('🚀 Start Hier — Dein Einstieg in NOVUM RP')
  .setDescription(
    '> Willkommen! Folge diesen Schritten um vollständig auf dem Server durchzustarten.\n\u200b'
  )
  .addFields(
    {
      name: '1️⃣  Regeln lesen',
      value: `→ Lies zuerst alle Regeln in <#${CHANNELS.regeln}> durch.\nOhne Regelkenntnis kein Roleplay.`,
    },
    {
      name: '2️⃣  Ping-Rollen holen',
      value: `→ Gehe zu <#${CHANNELS.pingRollen}> und wähle deine Benachrichtigungsrollen.\nVerpasse keine Ankündigungen oder Events.`,
    },
    {
      name: '3️⃣  Server joinen',
      value: '→ Verbinde dich mit unserem FiveM-Server:\n```\nconnect novum-rp.de\n```\nAlternativ über die FiveM-Serverliste: **NOVUM RP**',
    },
    {
      name: '4️⃣  Charakter erstellen',
      value: '→ Beim ersten Login wirst du durch die Charaktererstellung geführt.\nWähle einen realistischen Namen und Hintergrund für deinen Charakter.',
    },
    {
      name: '5️⃣  Fragen & Hilfe',
      value: `→ Bei Fragen oder Problemen erstelle ein Ticket in <#${CHANNELS.tickets}>.\n→ Bugs kannst du in <#${CHANNELS.bugReport}> melden.\n→ Unser Team hilft dir gerne weiter!`,
    },
    {
      name: '\u200b',
      value: '**Viel Spaß beim Roleplay! 🎮**\n*Das NOVUM RP Team freut sich auf dich.*',
    }
  )
  .setFooter({ text: 'NOVUM RP • Server-Guide' });

// ────────────────────────────────────────────────────────────────────────────

const PANEL_DEFS = [
  // ── Regeln ────────────────────────────────────────────────────────────────
  {
    key: 'regeln',
    channelId: CHANNELS.regeln,
    title: RULES_EMBED.data.title,
    build: () => ({ embeds: [RULES_EMBED], components: [] }),
  },

  // ── Start Hier ────────────────────────────────────────────────────────────
  {
    key: 'startHier',
    channelId: CHANNELS.startHier,
    title: STARTHIER_EMBED.data.title,
    build: () => ({ embeds: [STARTHIER_EMBED], components: [] }),
  },

  // ── Support-Panels ────────────────────────────────────────────────────────
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
  // ── Bewerbungen ───────────────────────────────────────────────────────────
  {
    key: 'bewerbungen',
    channelId: CHANNELS.bewerbungen,
    title: '📋 Team-Bewerbungen',
    build: () => {
      const embed = new EmbedBuilder()
        .setColor(0x8a2be2)
        .setTitle('📋 Team-Bewerbungen — NOVUM RP')
        .setDescription(
          'Du möchtest Teil des **NOVUM Teams** werden?\nHier kannst du dich für eine Position bewerben!\n\n' +
          '**Verfügbare Positionen:**\n' +
          BEWERBUNG_POSITIONEN.map(p => `${p.label} — ${p.desc}`).join('\n') +
          '\n\n' +
          '**Voraussetzungen:**\n' +
          '• Mindestens 14 Tage auf dem Server\n' +
          '• Aktives Mitglied der Community\n' +
          '• Keine offenen Verwarnungen\n' +
          '• Mindestalter: 16 Jahre\n\n' +
          '*Das Team prüft jede Bewerbung sorgfältig. Du wirst per DM über das Ergebnis informiert.*'
        )
        .setFooter({ text: 'NOVUM RP • Bewerbungsystem' })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('apply_btn')
          .setLabel('📋 Jetzt bewerben')
          .setStyle(ButtonStyle.Primary)
      );

      return { embeds: [embed], components: [row] };
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

// ── Hilfsfunktionen ──────────────────────────────────────────────────────────

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
