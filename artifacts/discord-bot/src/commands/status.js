import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from 'discord.js';
import { getChannel } from '../config.js';

const STATUS_CONFIG = {
  online:   { color: 0x57f287, emoji: '✅', label: 'Online' },
  wartung:  { color: 0xfee75c, emoji: '⚠️', label: 'Wartung' },
  offline:  { color: 0xed4245, emoji: '❌', label: 'Offline' },
  neustart: { color: 0x5865f2, emoji: '🔄', label: 'Neustart' },
};

export default {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Postet einen Server-Status in den konfigurierten server-status Kanal')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt =>
      opt.setName('status')
        .setDescription('Aktueller Status')
        .setRequired(true)
        .addChoices(
          { name: '✅ Online',   value: 'online' },
          { name: '⚠️ Wartung', value: 'wartung' },
          { name: '❌ Offline', value: 'offline' },
          { name: '🔄 Neustart', value: 'neustart' },
        )
    )
    .addStringOption(opt =>
      opt.setName('nachricht').setDescription('Zusätzliche Informationen').setRequired(false)
    ),

  async execute(interaction) {
    const statusKey = interaction.options.getString('status');
    const nachricht = interaction.options.getString('nachricht');

    const channel = getChannel(interaction.guild, 'server-status');
    if (!channel) {
      return interaction.reply({
        content: '❌ server-status Kanal nicht konfiguriert. Nutze `/setchannel`.',
        ephemeral: true,
      });
    }

    const { color, emoji, label } = STATUS_CONFIG[statusKey];

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${emoji} Server Status: ${label}`)
      .setDescription(nachricht ?? `Der Server ist aktuell **${label}**.`)
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ Status-Update in ${channel} gepostet!`, ephemeral: true });
  },
};
