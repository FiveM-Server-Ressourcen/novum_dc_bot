import { EmbedBuilder } from 'discord.js';
import { getChannel, getGuildConfig } from '../config.js';

export default {
  name: 'guildMemberAdd',
  async execute(member) {
    const guild = member.guild;
    const cfg = getGuildConfig(guild.id);

    const welcomeChannel = getChannel(guild, 'willkommen');
    if (!welcomeChannel) return;

    const regelnId    = cfg['regeln'];
    const startId     = cfg['start-hier'];
    const ticketsId   = cfg['tickets'];

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('💫 Willkommen auf NOVUM!')
      .setDescription(
        `Hey ${member}, schön dass du zu uns gefunden hast!\n\n` +
        `**Hier findest du alles was du brauchst:**\n` +
        (regelnId  ? `📜 Lies zuerst unsere <#${regelnId}>\n` : '') +
        (startId   ? `🚀 Starte mit <#${startId}>\n` : '') +
        (ticketsId ? `🎟️ Bei Fragen öffne ein <#${ticketsId}>\n` : '') +
        `\nWir freuen uns auf dich! 🎉`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Mitglied #${guild.memberCount}` })
      .setTimestamp();

    await welcomeChannel.send({ content: `${member}`, embeds: [embed] });
  },
};
