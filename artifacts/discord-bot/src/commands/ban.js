import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getPermLevel } from '../permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannt einen Spieler vom Server (Admin+)')
    .addUserOption(o => o.setName('benutzer').setDescription('Benutzer').setRequired(true))
    .addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(false))
    .addIntegerOption(o =>
      o.setName('nachrichten').setDescription('Nachrichten löschen (Tage, 0–7)').setRequired(false)
        .setMinValue(0).setMaxValue(7)
    ),

  async execute(interaction) {
    const target      = interaction.options.getMember('benutzer');
    const grund       = interaction.options.getString('grund') ?? 'Kein Grund angegeben';
    const deletedays  = interaction.options.getInteger('nachrichten') ?? 0;

    if (!target) return interaction.reply({ content: '❌ Benutzer nicht gefunden.', ephemeral: true });
    if (!target.bannable) return interaction.reply({ content: '❌ Dieser Benutzer kann nicht gebannt werden.', ephemeral: true });
    if (getPermLevel(target) >= getPermLevel(interaction.member)) {
      return interaction.reply({ content: '❌ Du kannst kein Team-Mitglied gleichen oder höheren Ranges bannen.', ephemeral: true });
    }

    await target.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle('🔨 Du wurdest gebannt')
          .setDescription(`Du wurdest von **${interaction.guild.name}** permanent gebannt.\n\n**Grund:** ${grund}`)
          .setTimestamp(),
      ],
    }).catch(() => {});

    await target.ban({ deleteMessageDays: deletedays, reason: grund });

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle('🔨 Benutzer gebannt')
      .addFields(
        { name: '👤 Benutzer',          value: target.user.tag,      inline: true },
        { name: '🛡️ Moderator',          value: interaction.user.tag, inline: true },
        { name: '📋 Grund',             value: grund                              },
        { name: '🗑️ Nachrichten gelöscht', value: `${deletedays} Tage`,          inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
