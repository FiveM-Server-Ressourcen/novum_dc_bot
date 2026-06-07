import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { ROLES } from '../config.js';
import { getPermLevel } from '../permissions.js';

const DAUER_MAP = {
  '10m':  10  * 60 * 1000,
  '30m':  30  * 60 * 1000,
  '1h':   60  * 60 * 1000,
  '6h':   6   * 60 * 60 * 1000,
  '12h':  12  * 60 * 60 * 1000,
  '1d':   24  * 60 * 60 * 1000,
  '7d':   7   * 24 * 60 * 60 * 1000,
};

export default {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Schaltet einen Spieler stumm (Moderator+)')
    .addUserOption(o => o.setName('benutzer').setDescription('Benutzer').setRequired(true))
    .addStringOption(o =>
      o.setName('dauer').setDescription('Dauer').setRequired(true)
        .addChoices(
          { name: '10 Minuten', value: '10m' },
          { name: '30 Minuten', value: '30m' },
          { name: '1 Stunde',   value: '1h'  },
          { name: '6 Stunden',  value: '6h'  },
          { name: '12 Stunden', value: '12h' },
          { name: '1 Tag',      value: '1d'  },
          { name: '7 Tage',     value: '7d'  },
        )
    )
    .addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getMember('benutzer');
    const dauer  = interaction.options.getString('dauer');
    const grund  = interaction.options.getString('grund') ?? 'Kein Grund angegeben';

    if (!target) return interaction.reply({ content: '❌ Benutzer nicht gefunden.', ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ content: '❌ Du kannst dich nicht selbst muten.', ephemeral: true });
    if (getPermLevel(target) >= getPermLevel(interaction.member)) {
      return interaction.reply({ content: '❌ Du kannst kein Team-Mitglied gleichen oder höheren Ranges muten.', ephemeral: true });
    }

    const muteRole = interaction.guild.roles.cache.get(ROLES.muted);
    if (!muteRole) return interaction.reply({ content: '❌ Muted-Rolle nicht gefunden. Prüfe die config.js.', ephemeral: true });

    await target.roles.add(muteRole);
    const ms = DAUER_MAP[dauer];

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle('🔇 Benutzer gemutet')
      .addFields(
        { name: '👤 Benutzer',   value: `${target} (${target.user.tag})`, inline: true },
        { name: '🛡️ Moderator',  value: interaction.user.tag,             inline: true },
        { name: '⏱️ Dauer',      value: dauer,                            inline: true },
        { name: '📋 Grund',      value: grund },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    target.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle('🔇 Du wurdest gemutet')
          .setDescription(`Du wurdest auf **${interaction.guild.name}** für **${dauer}** gemutet.\n\n**Grund:** ${grund}`)
          .setTimestamp(),
      ],
    }).catch(() => {});

    // Auto-Unmute
    setTimeout(async () => {
      const fresh = await interaction.guild.members.fetch(target.id).catch(() => null);
      if (fresh?.roles.cache.has(ROLES.muted)) {
        await fresh.roles.remove(muteRole).catch(() => {});
        fresh.send({ content: `🔊 Dein Mute auf **${interaction.guild.name}** ist abgelaufen.` }).catch(() => {});
      }
    }, ms);
  },
};
