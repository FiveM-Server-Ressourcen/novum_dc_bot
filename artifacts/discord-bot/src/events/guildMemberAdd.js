import { EmbedBuilder } from 'discord.js';

export default {
  name: 'guildMemberAdd',
  async execute(member) {
    const guild = member.guild;
    const welcomeChannel = guild.channels.cache.find(
      ch => ch.name === 'willkommen' && ch.isTextBased()
    );
    if (!welcomeChannel) return;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('💫 Willkommen auf NOVUM!')
      .setDescription(
        `Hey ${member}, schön dass du zu uns gefunden hast!\n\n` +
        `**Hier findest du alles was du brauchst:**\n` +
        `📜 Lies zuerst unsere <#${guild.channels.cache.find(c => c.name === 'regeln')?.id ?? 'regeln'}>\n` +
        `🚀 Starte mit <#${guild.channels.cache.find(c => c.name === 'start-hier')?.id ?? 'start-hier'}>\n` +
        `🎟️ Bei Fragen öffne ein <#${guild.channels.cache.find(c => c.name === 'tickets')?.id ?? 'tickets'}>\n\n` +
        `Wir freuen uns auf dich! 🎉`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Mitglied #${guild.memberCount}` })
      .setTimestamp();

    await welcomeChannel.send({ content: `${member}`, embeds: [embed] });
  },
};
