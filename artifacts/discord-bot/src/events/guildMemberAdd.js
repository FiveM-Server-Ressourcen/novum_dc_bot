import { EmbedBuilder } from 'discord.js';
import { CHANNELS, ROLES } from '../config.js';

export default {
  name: 'guildMemberAdd',
  async execute(member) {
    const guild = member.guild;

    // Spieler-Rolle automatisch vergeben
    try {
      await member.roles.add(ROLES.spieler);
    } catch (e) {
      console.error('[Welcome] Konnte Spieler-Rolle nicht vergeben:', e.message);
    }

    const welcomeChannel = guild.channels.cache.get(CHANNELS.willkommen);
    if (!welcomeChannel) return;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('💫 Willkommen auf NOVUM!')
      .setDescription(
        `Hey ${member}, schön dass du zu uns gefunden hast!\n\n` +
        `**Hier findest du alles was du brauchst:**\n` +
        `📜 Lies zuerst unsere <#${CHANNELS.regeln}>\n` +
        `🚀 Starte mit <#${CHANNELS.startHier}>\n` +
        `🎟️ Bei Fragen öffne ein <#${CHANNELS.tickets}>\n\n` +
        `Wir freuen uns auf dich! 🎉`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Mitglied #${guild.memberCount}` })
      .setTimestamp();

    await welcomeChannel.send({ content: `${member}`, embeds: [embed] });
  },
};
