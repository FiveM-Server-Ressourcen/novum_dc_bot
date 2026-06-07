import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { CHANNELS, ROLES } from '../config.js';

const STATUS_MAP = {
  online:   { color: 0x57f287, emoji: '✅', label: 'Online'   },
  wartung:  { color: 0xfee75c, emoji: '⚠️', label: 'Wartung'  },
  offline:  { color: 0xed4245, emoji: '❌', label: 'Offline'  },
  neustart: { color: 0x5865f2, emoji: '🔄', label: 'Neustart' },
};

export default {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Postet einen Server-Status (Moderator+)')
    .addStringOption(o =>
      o.setName('status').setDescription('Status').setRequired(true)
        .addChoices(
          { name: '✅ Online',    value: 'online'   },
          { name: '⚠️ Wartung',  value: 'wartung'  },
          { name: '❌ Offline',  value: 'offline'  },
          { name: '🔄 Neustart', value: 'neustart' },
        )
    )
    .addStringOption(o => o.setName('nachricht').setDescription('Zusätzliche Infos').setRequired(false))
    .addBooleanOption(o => o.setName('ping').setDescription('Server-Status Rolle pingen?').setRequired(false)),

  async execute(interaction) {
    const key      = interaction.options.getString('status');
    const extra    = interaction.options.getString('nachricht');
    const doPing   = interaction.options.getBoolean('ping') ?? false;
    const { color, emoji, label } = STATUS_MAP[key];

    const channel = interaction.guild.channels.cache.get(CHANNELS.serverStatus);
    if (!channel) return interaction.reply({ content: '❌ server-status Kanal nicht gefunden.', ephemeral: true });

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${emoji} Server Status: ${label}`)
      .setDescription(extra ?? `Der Server ist aktuell **${label}**.`)
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    const content = doPing ? `<@&${ROLES.pingServerStatus}>` : undefined;
    await channel.send({ content, embeds: [embed] });
    await interaction.reply({ content: `✅ Status-Update gepostet!`, ephemeral: true });
  },
};
