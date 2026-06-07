import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { CHANNELS, ROLES } from '../config.js';
import { getPermLevel } from '../permissions.js';

// Einfaches In-Memory Warn-System (bleibt bis Bot-Neustart)
// Für persistente Warns → Datenbank ergänzen
const warns = new Map(); // userId -> [{reason, moderator, timestamp}]

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Verwarnt einen Spieler (Moderator+)')
    .addUserOption(o => o.setName('benutzer').setDescription('Zu verwarnender Benutzer').setRequired(true))
    .addStringOption(o => o.setName('grund').setDescription('Grund der Verwarnung').setRequired(true)),

  async execute(interaction) {
    const target = interaction.options.getMember('benutzer');
    const grund  = interaction.options.getString('grund');

    if (!target) return interaction.reply({ content: '❌ Benutzer nicht gefunden.', ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ content: '❌ Du kannst dich nicht selbst verwarnen.', ephemeral: true });
    if (getPermLevel(target) >= getPermLevel(interaction.member)) {
      return interaction.reply({ content: '❌ Du kannst kein Team-Mitglied gleichen oder höheren Ranges verwarnen.', ephemeral: true });
    }

    const entry = { reason: grund, moderator: interaction.user.tag, timestamp: Date.now() };
    const list  = warns.get(target.id) ?? [];
    list.push(entry);
    warns.set(target.id, list);

    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setTitle('⚠️ Verwarnung')
      .addFields(
        { name: '👤 Benutzer',    value: `${target} (${target.user.tag})`,    inline: true },
        { name: '🛡️ Moderator',   value: interaction.user.tag,                inline: true },
        { name: '📋 Grund',       value: grund },
        { name: '🔢 Verwarnungen', value: `${list.length}`,                   inline: true },
        { name: '📅 Datum',       value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // DM an den verwarnten Benutzer
    target.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0xfee75c)
          .setTitle('⚠️ Du wurdest verwarnt')
          .setDescription(`Du hast auf **${interaction.guild.name}** eine Verwarnung erhalten.\n\n**Grund:** ${grund}`)
          .setTimestamp(),
      ],
    }).catch(() => {});
  },
};
