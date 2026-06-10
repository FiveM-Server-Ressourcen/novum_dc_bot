import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getPermLevel, getPermLabel } from '../permissions.js';
import { COMMAND_PERMISSIONS } from '../config.js';

const ALL_COMMANDS = [
  { name: '/help',      desc: 'Zeigt diese Hilfe',                  level: 0 },
  { name: '/bewerben',  desc: 'Bewirb dich fürs Team',              level: 0 },
  { name: '/userinfo',  desc: 'Infos über einen Benutzer',          level: 2 },
  { name: '/warn',      desc: 'Spieler verwarnen',                  level: 3 },
  { name: '/mute',      desc: 'Spieler stummschalten',              level: 3 },
  { name: '/unmute',    desc: 'Mute aufheben',                      level: 3 },
  { name: '/announce',  desc: 'Ankündigung erstellen',              level: 3 },
  { name: '/status',    desc: 'Server-Status posten',               level: 3 },
  { name: '/kick',      desc: 'Spieler kicken',                     level: 4 },
  { name: '/ban',       desc: 'Spieler bannen',                     level: 4 },
  { name: '/panel',     desc: 'Interaktive Panels posten',          level: 4 },
];

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Zeigt alle verfügbaren Commands'),

  async execute(interaction) {
    const level = getPermLevel(interaction.member);

    const visible = ALL_COMMANDS.filter(c => c.level <= level);
    const lines   = visible.map(c =>
      `\`${c.name}\` — ${c.desc} *(${getPermLabel(c.level)})*`
    ).join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('📖 NOVUM Bot — Hilfe')
      .setDescription(
        `**Dein Level:** ${level} (${getPermLabel(level)})\n\n` +
        '**Verfügbare Commands:**\n' + lines
      )
      .setFooter({ text: 'Nur Commands angezeigt, die du nutzen kannst.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
