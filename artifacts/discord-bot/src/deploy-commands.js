import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const cmd = await import(join(commandsPath, file));
  if (cmd.default?.data) {
    commands.push(cmd.default.data.toJSON());
  }
}

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
  console.error('[ERROR] DISCORD_TOKEN oder DISCORD_CLIENT_ID fehlt!');
  process.exit(1);
}

const rest = new REST().setToken(token);

try {
  console.log(`[Deploy] Registriere ${commands.length} Slash-Commands...`);
  const data = await rest.put(Routes.applicationCommands(clientId), { body: commands });
  console.log(`[Deploy] ${data.length} Commands erfolgreich registriert!`);
} catch (error) {
  console.error('[Deploy] Fehler:', error);
}
