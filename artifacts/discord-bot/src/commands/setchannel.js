import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from 'discord.js';
import { setGuildChannel, getGuildConfig, CHANNEL_KEYS } from '../config.js';

const choices = Object.entries(CHANNEL_KEYS).map(([value, { label }]) => ({ name: label, value }));

export default {
  data: new SlashCommandBuilder()
    .setName('setchannel')
    .setDescription('Verknüpft einen bestehenden Kanal mit einer Bot-Funktion')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt =>
      opt.setName('funktion')
        .setDescription('Welche Bot-Funktion soll der Kanal bekommen?')
        .setRequired(true)
        .addChoices(...choices)
    )
    .addChannelOption(opt =>
      opt.setName('kanal')
        .setDescription('Bestehender Kanal (leer = aktuelle Zuweisung entfernen)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const key = interaction.options.getString('funktion');
    const channel = interaction.options.getChannel('kanal');
    const { label, desc } = CHANNEL_KEYS[key];

    if (channel) {
      setGuildChannel(interaction.guild.id, key, channel.id);
      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle('✅ Kanal verknüpft')
        .addFields(
          { name: 'Funktion', value: label, inline: true },
          { name: 'Kanal', value: `${channel}`, inline: true },
          { name: 'Beschreibung', value: desc },
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      setGuildChannel(interaction.guild.id, key, null);
      await interaction.reply({
        content: `🗑️ Zuweisung für **${label}** wurde entfernt.`,
        ephemeral: true,
      });
    }
  },
};
