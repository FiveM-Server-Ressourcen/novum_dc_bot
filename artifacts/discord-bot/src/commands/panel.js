import { SlashCommandBuilder } from 'discord.js';
import { syncPanels } from '../panels.js';

export default {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Aktualisiert alle Panels (Admin+)'),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    await syncPanels(client);
    await interaction.editReply('✅ Alle Panels wurden aktualisiert!');
  },
};
