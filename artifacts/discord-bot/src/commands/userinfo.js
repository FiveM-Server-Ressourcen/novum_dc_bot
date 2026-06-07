import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getPermLevel, getPermLabel } from '../permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Zeigt Infos über einen Benutzer (Support+)')
    .addUserOption(o =>
      o.setName('benutzer').setDescription('Benutzer (leer = du selbst)').setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getMember('benutzer') ?? interaction.member;
    const user   = target.user;
    const level  = getPermLevel(target);

    const roles = target.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => `${r}`)
      .slice(0, 10)
      .join(', ') || 'Keine';

    const embed = new EmbedBuilder()
      .setColor(target.displayColor || 0x5865f2)
      .setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🆔 ID',              value: user.id,                                                                                         inline: true },
        { name: '🔐 Permission-Level', value: `${level} (${getPermLabel(level)})`,                                                            inline: true },
        { name: '📅 Account erstellt', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`,                                            inline: true },
        { name: '📥 Beigetreten',      value: target.joinedTimestamp ? `<t:${Math.floor(target.joinedTimestamp / 1000)}:D>` : 'Unbekannt',    inline: true },
        { name: `🎭 Rollen (${target.roles.cache.size - 1})`, value: roles },
      )
      .setFooter({ text: `Angefragt von ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
