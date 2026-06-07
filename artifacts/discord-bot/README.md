# NOVUM Discord Bot

## Setup

### 1. Bot einladen

Generiere den Einladungslink im [Discord Developer Portal](https://discord.com/developers/applications):

```
Permissions: Administrator
OAuth2 → URL Generator → bot + applications.commands
```

### 2. Slash-Commands registrieren

```bash
cd artifacts/discord-bot
node src/deploy-commands.js
```

Dies muss nur einmal (oder nach Command-Änderungen) ausgeführt werden.

### 3. Bot starten

Der Bot läuft automatisch über den Workflow.

---

## Features

| Feature | Beschreibung |
|---|---|
| `/setup` | Erstellt die komplette Serverstruktur (Admin only) |
| `/announce` | Postet Ankündigungen in Info-Kanäle |
| `/status` | Postet Server-Status Updates |
| `/userinfo` | Zeigt Benutzerinformationen |
| Willkommen DM | Automatische Begrüßung neuer Mitglieder |
| Ticket-System | Button-basiertes Ticket-System mit Auto-Kanal |
| Bug-Reports | Modal-Formular → #bug-report |
| Spieler-Meldungen | Modal-Formular → #spieler-meldungen |

## Umgebungsvariablen

- `DISCORD_TOKEN` — Bot-Token (Replit Secret)
- `DISCORD_CLIENT_ID` — Application ID (Replit Secret)
