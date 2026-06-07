import { ActivityType } from 'discord.js';

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`[Bot] Eingeloggt als ${client.user.tag}`);
    client.user.setActivity('NOVUM | /help', { type: ActivityType.Watching });
  },
};
