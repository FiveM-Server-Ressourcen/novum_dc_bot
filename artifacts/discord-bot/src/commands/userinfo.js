import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Zeigt Informationen über einen Benutzer')
    .addUserOption(opt =>
      opt.setName('benutzer').setDescription('Benutzer (leer = du selbst)').setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getMember('benutzer') ?? interaction.member;
    const user = target.user;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '📅 Account erstellt', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '📥 Beigetreten', value: target.joinedTimestamp ? `<t:${Math.floor(target.joinedTimestamp / 1000)}:D>` : 'Unbekannt', inline: true },
        { name: '🎭 Rollen', value: target.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r).join(', ') || 'Keine', inline: false },
      )
      .setFooter({ text: `Angefragt von ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
