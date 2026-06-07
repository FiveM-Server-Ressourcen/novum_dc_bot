import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Postet einen Server-Status in #server-status')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt =>
      opt.setName('status')
        .setDescription('Aktueller Status')
        .setRequired(true)
        .addChoices(
          { name: '✅ Online', value: 'online' },
          { name: '⚠️ Wartung', value: 'wartung' },
          { name: '❌ Offline', value: 'offline' },
          { name: '🔄 Neustart', value: 'neustart' },
        )
    )
    .addStringOption(opt =>
      opt.setName('nachricht').setDescription('Zusätzliche Informationen').setRequired(false)
    ),

  async execute(interaction) {
    const status = interaction.options.getString('status');
    const nachricht = interaction.options.getString('nachricht');

    const statusChannel = interaction.guild.channels.cache.find(
      c => c.name === 'server-status' && c.isTextBased()
    );

    if (!statusChannel) {
      return interaction.reply({ content: '❌ Kanal `server-status` nicht gefunden.', ephemeral: true });
    }

    const config = {
      online:  { color: 0x57f287, emoji: '✅', label: 'Online' },
      wartung: { color: 0xfee75c, emoji: '⚠️', label: 'Wartung' },
      offline: { color: 0xed4245, emoji: '❌', label: 'Offline' },
      neustart:{ color: 0x5865f2, emoji: '🔄', label: 'Neustart' },
    };

    const { color, emoji, label } = config[status];

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${emoji} Server Status: ${label}`)
      .setDescription(nachricht ?? `Der Server ist aktuell **${label}**.`)
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await statusChannel.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ Status-Update in ${statusChannel} gepostet!`, ephemeral: true });
  },
};
