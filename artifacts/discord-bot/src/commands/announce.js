import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Erstellt eine Ankündigung')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt =>
      opt.setName('titel').setDescription('Titel der Ankündigung').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('nachricht').setDescription('Inhalt der Ankündigung').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('kanal')
        .setDescription('Zielkanal')
        .setRequired(false)
        .addChoices(
          { name: '📣 Ankündigungen', value: 'ankündigungen' },
          { name: '🛠️ Updates', value: 'updates' },
          { name: '📡 Server Status', value: 'server-status' },
          { name: '📅 Events', value: 'events' },
        )
    ),

  async execute(interaction) {
    const titel = interaction.options.getString('titel');
    const nachricht = interaction.options.getString('nachricht');
    const kanalName = interaction.options.getString('kanal') ?? 'ankündigungen';

    const targetChannel = interaction.guild.channels.cache.find(
      c => c.name === kanalName && c.isTextBased()
    );

    if (!targetChannel) {
      return interaction.reply({ content: `❌ Kanal \`${kanalName}\` nicht gefunden. Bitte zuerst \`/setup\` ausführen.`, ephemeral: true });
    }

    const colorMap = {
      'ankündigungen': 0x5865f2,
      'updates': 0x57f287,
      'server-status': 0xed4245,
      'events': 0xfee75c,
    };

    const emojiMap = {
      'ankündigungen': '📣',
      'updates': '🛠️',
      'server-status': '📡',
      'events': '📅',
    };

    const embed = new EmbedBuilder()
      .setColor(colorMap[kanalName] ?? 0x5865f2)
      .setTitle(`${emojiMap[kanalName] ?? '📢'} ${titel}`)
      .setDescription(nachricht)
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await targetChannel.send({ content: '@everyone', embeds: [embed] });
    await interaction.reply({ content: `✅ Ankündigung in ${targetChannel} gepostet!`, ephemeral: true });
  },
};
