import { ActivityType } from 'discord.js';
import { syncPanels } from '../panels.js';

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`[Bot] Eingeloggt als ${client.user.tag}`);
    client.user.setActivity('NOVUM | /help', { type: ActivityType.Watching });

    // Panels automatisch posten oder updaten
    await syncPanels(client);
    console.log('[Bot] Alle Panels synchronisiert.');
  },
};
