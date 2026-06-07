import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Collection, Partials } from 'discord.js';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env explizit laden
dotenv.config({
  path: join(__dirname, '.env')
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember],
});

client.commands = new Collection();

// Load commands
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const cmd = await import(join(commandsPath, file));

  if (cmd.default?.data && cmd.default?.execute) {
    client.commands.set(cmd.default.data.name, cmd.default);
    console.log(`[Commands] Loaded: ${cmd.default.data.name}`);
  }
}

// Load events
const eventsPath = join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = await import(join(eventsPath, file));
  const ev = event.default;

  if (ev.once) {
    client.once(ev.name, (...args) => ev.execute(...args, client));
  } else {
    client.on(ev.name, (...args) => ev.execute(...args, client));
  }

  console.log(`[Events] Loaded: ${ev.name}`);
}

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('[ERROR] DISCORD_TOKEN ist nicht gesetzt!');
  console.log('Suche nach .env in:', join(__dirname, '.env'));
  process.exit(1);
}

await client.login(token);
