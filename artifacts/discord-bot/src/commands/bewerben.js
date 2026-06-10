import { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } from 'discord.js';
import { BEWERBUNG_POSITIONEN } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('bewerben')
    .setDescription('Bewirb dich für eine Position im NOVUM Team'),

  async execute(interaction) {
    const select = new StringSelectMenuBuilder()
      .setCustomId('apply_position')
      .setPlaceholder('Wähle eine Position...')
      .addOptions(
        BEWERBUNG_POSITIONEN.map(p =>
          new StringSelectMenuOptionBuilder()
            .setLabel(p.label)
            .setDescription(p.desc)
            .setValue(p.id)
        )
      );

    await interaction.reply({
      content: '**📋 Team-Bewerbung — NOVUM RP**\nFür welche Position möchtest du dich bewerben?',
      components: [new ActionRowBuilder().addComponents(select)],
      ephemeral: true,
    });
  },
};
