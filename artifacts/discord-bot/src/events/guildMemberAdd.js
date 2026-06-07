import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { CHANNELS, ROLES } from '../config.js';
import { generateWelcomeBanner } from '../generateBanner.js';

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

    const files = [];
    const embed = new EmbedBuilder()
      .setColor(0x8a2be2)
      .setDescription(
        `## Willkommen auf NOVUM RP, ${member}! 🌆\n\n` +
        `Du bist unser **${guild.memberCount}. Mitglied**.\n\n` +
        `**🚀 So legst du los:**\n` +
        `> 📜 Lies unsere <#${CHANNELS.regeln}>\n` +
        `> 🏁 Starte mit <#${CHANNELS.startHier}>\n` +
        `> 🔔 Rollen holen in <#${CHANNELS.pingRollen}>\n` +
        `> 🎟️ Fragen → <#${CHANNELS.tickets}>\n\n` +
        `*Viel Spaß im Roleplay!* 🎮`
      )
      .setFooter({ text: `NOVUM Roleplay Server • ${new Date().toLocaleDateString('de-DE')}` });

    // Banner mit Avatar + Name dynamisch generieren
    try {
      const bannerBuffer = await generateWelcomeBanner(member);
      if (bannerBuffer) {
        const attachment = new AttachmentBuilder(bannerBuffer, { name: 'welcome.jpg' });
        files.push(attachment);
        embed.setImage('attachment://welcome.jpg');
      }
    } catch (err) {
      console.error('[Welcome] Banner-Generierung fehlgeschlagen:', err.message);
    }

    await welcomeChannel.send({ content: `${member}`, embeds: [embed], files });
  },
};
