import { ActivityType } from 'discord.js';
import { syncPanels } from '../panels.js';
import { setupChannelPermissions, setupRoles } from '../setupPermissions.js';
import { generateBannerTemplate } from '../generateBanner.js';

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`[Bot] Eingeloggt als ${client.user.tag}`);
    client.user.setActivity('NOVUM | /help', { type: ActivityType.Watching });

    const guild = client.guilds.cache.first();
    if (!guild) {
      console.log('[Bot] ⚠️  Keine Guild gefunden.');
      return;
    }

    // Guild-Daten vollständig laden
    await guild.members.fetchMe();
    await guild.roles.fetch();
    await guild.channels.fetch();

    // 1️⃣ Banner-Template generieren (wird einmal gecacht, dann für jeden User wiederverwendet)
    console.log('[Setup] Generiere Banner-Template...');
    await generateBannerTemplate();

    // 2️⃣ Rollen konfigurieren
    console.log('[Setup] Prüfe Rollen...');
    const rolesChanged = await setupRoles(guild);
    console.log(`[Setup] Rollen: ${rolesChanged} Änderungen vorgenommen.`);

    // 3️⃣ Kanal-Berechtigungen setzen
    console.log('[Setup] Prüfe Kanal-Berechtigungen...');
    const permsChanged = await setupChannelPermissions(guild);
    console.log(`[Setup] Berechtigungen: ${permsChanged} Änderungen vorgenommen.`);

    // 4️⃣ Panels synchronisieren
    console.log('[Setup] Synchronisiere Panels...');
    await syncPanels(client);
    console.log('[Bot] ✅ Alles synchronisiert und bereit.');
  },
};
