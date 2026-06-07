import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { CHANNELS, ROLES } from '../config.js';

const ZIELE = [
  { name: '📣 Ankündigungen', value: 'ankuendigungen', channelKey: 'ankuendigungen', pingRole: ROLES.pingAnkuendigungen, color: 0x5865f2, emoji: '📣' },
  { name: '🛠️ Updates',       value: 'updates',       channelKey: 'updates',        pingRole: ROLES.pingUpdates,        color: 0x57f287, emoji: '🛠️' },
  { name: '📅 Events',        value: 'events',        channelKey: 'events',         pingRole: ROLES.pingEvents,         color: 0xfee75c, emoji: '📅' },
  { name: '📡 Server Status', value: 'status',        channelKey: 'serverStatus',   pingRole: ROLES.pingServerStatus,   color: 0xed4245, emoji: '📡' },
];

export default {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Erstellt eine Ankündigung (Moderator+)')
    .addStringOption(o =>
      o.setName('ziel').setDescription('Zielkanal').setRequired(true)
        .addChoices(...ZIELE.map(z => ({ name: z.name, value: z.value })))
    )
    .addStringOption(o => o.setName('titel').setDescription('Titel').setRequired(true))
    .addStringOption(o => o.setName('nachricht').setDescription('Inhalt').setRequired(true))
    .addBooleanOption(o => o.setName('ping').setDescription('Ping-Rolle erwähnen?').setRequired(false)),

  async execute(interaction) {
    const zielKey  = interaction.options.getString('ziel');
    const titel    = interaction.options.getString('titel');
    const inhalt   = interaction.options.getString('nachricht');
    const doPing   = interaction.options.getBoolean('ping') ?? false;

    const ziel    = ZIELE.find(z => z.value === zielKey);
    const channel = interaction.guild.channels.cache.get(CHANNELS[ziel.channelKey]);
    if (!channel) return interaction.reply({ content: '❌ Kanal nicht gefunden.', ephemeral: true });

    const embed = new EmbedBuilder()
      .setColor(ziel.color)
      .setTitle(`${ziel.emoji} ${titel}`)
      .setDescription(inhalt)
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    const content = doPing ? `<@&${ziel.pingRole}>` : undefined;
    await channel.send({ content, embeds: [embed] });
    await interaction.reply({ content: `✅ Gepostet in ${channel}!`, ephemeral: true });
  },
};
