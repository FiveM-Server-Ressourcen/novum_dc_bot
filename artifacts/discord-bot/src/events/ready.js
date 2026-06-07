export default {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`[Bot] Eingeloggt als ${client.user.tag}`);
    client.user.setActivity('NOVUM | /setup', { type: 3 });
  },
};
