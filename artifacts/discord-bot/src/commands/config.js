import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getGuildConfig, CHANNEL_KEYS } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Zeigt die aktuelle Bot-Konfiguration dieses Servers')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const cfg = getGuildConfig(interaction.guild.id);
    const lines = Object.entries(CHANNEL_KEYS).map(([key, { label }]) => {
      const id = cfg[key];
      return `${label}: ${id ? `<#${id}>` : '❌ nicht gesetzt'}`;
    });

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('⚙️ Bot-Konfiguration')
      .setDescription(
        lines.join('\n') + '\n\n' +
        '*Nutze `/setchannel` um Kanäle zu verknüpfen.*'
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
