import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getPermLevel } from '../permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kickt einen Spieler vom Server (Admin+)')
    .addUserOption(o => o.setName('benutzer').setDescription('Benutzer').setRequired(true))
    .addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getMember('benutzer');
    const grund  = interaction.options.getString('grund') ?? 'Kein Grund angegeben';

    if (!target) return interaction.reply({ content: '❌ Benutzer nicht gefunden.', ephemeral: true });
    if (!target.kickable) return interaction.reply({ content: '❌ Dieser Benutzer kann nicht gekickt werden.', ephemeral: true });
    if (getPermLevel(target) >= getPermLevel(interaction.member)) {
      return interaction.reply({ content: '❌ Du kannst kein Team-Mitglied gleichen oder höheren Ranges kicken.', ephemeral: true });
    }

    await target.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle('👢 Du wurdest gekickt')
          .setDescription(`Du wurdest von **${interaction.guild.name}** gekickt.\n\n**Grund:** ${grund}`)
          .setTimestamp(),
      ],
    }).catch(() => {});

    await target.kick(grund);

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle('👢 Benutzer gekickt')
      .addFields(
        { name: '👤 Benutzer',  value: target.user.tag,    inline: true },
        { name: '🛡️ Moderator', value: interaction.user.tag, inline: true },
        { name: '📋 Grund',     value: grund },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
