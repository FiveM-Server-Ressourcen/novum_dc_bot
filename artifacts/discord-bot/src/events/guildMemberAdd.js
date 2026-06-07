import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { CHANNELS, ROLES } from '../config.js';
import { BANNER_PATH } from '../generateBanner.js';
import { existsSync } from 'fs';

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
        `## 🌆 Willkommen auf NOVUM RP, ${member}!\n\n` +
        `Schön, dass du den Weg in unsere Stadt gefunden hast.\n` +
        `Du bist unser **${guild.memberCount}. Mitglied** — mach's dir gemütlich.\n\n` +
        `**🚀 So legst du los:**\n` +
        `> 📜 Lies unsere <#${CHANNELS.regeln}> durch\n` +
        `> 🏁 Schau dir <#${CHANNELS.startHier}> an\n` +
        `> 🔔 Hol dir Rollen in <#${CHANNELS.pingRollen}>\n` +
        `> 🎟️ Bei Fragen → <#${CHANNELS.tickets}>\n\n` +
        `*Viel Spaß im Roleplay!* 🎮`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setFooter({ text: `NOVUM Roleplay Server • ${new Date().toLocaleDateString('de-DE')}` });

    // Banner anhängen wenn vorhanden
    if (existsSync(BANNER_PATH)) {
      const banner = new AttachmentBuilder(BANNER_PATH, { name: 'welcome_banner.jpg' });
      files.push(banner);
      embed.setImage('attachment://welcome_banner.jpg');
    }

    await welcomeChannel.send({ content: `${member}`, embeds: [embed], files });
  },
};
