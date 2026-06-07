import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from 'discord.js';
import { getChannel } from '../config.js';

const KANAL_CHOICES = [
  { name: '📣 Ankündigungen', value: 'ankuendigungen' },
  { name: '🛠️ Updates',       value: 'updates' },
  { name: '📅 Events',        value: 'events' },
];

export default {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Erstellt eine Ankündigung in einem konfigurierten Kanal')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt =>
      opt.setName('kanal').setDescription('Zielkanal').setRequired(true).addChoices(...KANAL_CHOICES)
    )
    .addStringOption(opt =>
      opt.setName('titel').setDescription('Titel der Ankündigung').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('nachricht').setDescription('Inhalt der Ankündigung').setRequired(true)
    )
    .addBooleanOption(opt =>
      opt.setName('ping').setDescription('@everyone erwähnen? (Standard: nein)').setRequired(false)
    ),

  async execute(interaction) {
    const kanalKey  = interaction.options.getString('kanal');
    const titel     = interaction.options.getString('titel');
    const nachricht = interaction.options.getString('nachricht');
    const ping      = interaction.options.getBoolean('ping') ?? false;

    const channel = getChannel(interaction.guild, kanalKey);
    if (!channel) {
      return interaction.reply({
        content: `❌ Kanal nicht konfiguriert. Nutze \`/setchannel\` um ihn zu verknüpfen.`,
        ephemeral: true,
      });
    }

    const colorMap = {
      ankuendigungen: 0x5865f2,
      updates:        0x57f287,
      events:         0xfee75c,
    };
    const emojiMap = {
      ankuendigungen: '📣',
      updates:        '🛠️',
      events:         '📅',
    };

    const embed = new EmbedBuilder()
      .setColor(colorMap[kanalKey] ?? 0x5865f2)
      .setTitle(`${emojiMap[kanalKey] ?? '📢'} ${titel}`)
      .setDescription(nachricht)
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await channel.send({ content: ping ? '@everyone' : undefined, embeds: [embed] });
    await interaction.reply({ content: `✅ Ankündigung in ${channel} gepostet!`, ephemeral: true });
  },
};
