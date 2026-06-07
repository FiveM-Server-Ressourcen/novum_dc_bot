import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { ROLES } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Hebt den Mute eines Spielers auf (Moderator+)')
    .addUserOption(o => o.setName('benutzer').setDescription('Benutzer').setRequired(true))
    .addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getMember('benutzer');
    const grund  = interaction.options.getString('grund') ?? 'Kein Grund angegeben';

    if (!target) return interaction.reply({ content: '❌ Benutzer nicht gefunden.', ephemeral: true });

    const muteRole = interaction.guild.roles.cache.get(ROLES.muted);
    if (!muteRole) return interaction.reply({ content: '❌ Muted-Rolle nicht gefunden.', ephemeral: true });
    if (!target.roles.cache.has(ROLES.muted)) {
      return interaction.reply({ content: '❌ Dieser Benutzer ist nicht gemutet.', ephemeral: true });
    }

    await target.roles.remove(muteRole);

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('🔊 Benutzer entmutet')
      .addFields(
        { name: '👤 Benutzer',  value: `${target} (${target.user.tag})`, inline: true },
        { name: '🛡️ Moderator', value: interaction.user.tag,             inline: true },
        { name: '📋 Grund',     value: grund },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    target.send({ content: `🔊 Dein Mute auf **${interaction.guild.name}** wurde aufgehoben.` }).catch(() => {});
  },
};
