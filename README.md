# LogBot v2026.01.30.13.30.00

**Zentraler Log-Server für Linux/Windows Systeme und Netzwerkgeräte**

Entwickelt von Philipp Fischer  
Kontakt: p.fischer@itconex.de

## Features

- 📋 **Syslog-Empfang** auf UDP/TCP Port 514
- 🖥️ **Automatische Geräteerkennung** (UniFi APs, Linux, Windows)
- 🔍 **Echtzeit Log-Suche** mit Filtern
- 🔗 **Webhook-Integration** für n8n, Make, Zapier (ohne Login!)
- 📊 **Dashboard** mit Statistiken
- 👥 **Benutzerverwaltung** mit Rollen
- 💚 **Health Monitoring** für System-Ressourcen
- 🐳 **Docker-basiert** für einfache Installation

## Voraussetzungen

- Linux Server (Ubuntu 20.04+ empfohlen)
- Docker & Docker Compose
- Root-Zugriff

## Installation

```bash
# Repository klonen
git clone https://github.com/DEIN-USERNAME/logbot.git
cd logbot

# Installer ausführen
sudo bash install.sh
```

**Oder manuell:**
```bash
tar -xzf logbot-v2026.01.30.13.30.00.tar.gz
cd logbot-v2026.01.30.13.30.00
sudo bash install.sh
```

## Zugriff

Nach der Installation:

- **Web-Interface:** http://SERVER-IP
- **API Docs:** http://SERVER-IP/api/docs
- **Login:** admin / admin (bitte ändern!)

## Syslog-Quellen konfigurieren

### Linux (rsyslog)

```bash
# /etc/rsyslog.d/logbot.conf
*.* @LOGBOT-IP:514
```

### UniFi Controller

Settings → System → Remote Logging → Enable + LogBot IP

## Webhook-Nutzung

Webhooks ermöglichen Zugriff ohne Login:

```
GET /api/webhook/{id}/call?token={token}
```

Ideal für n8n-Workflows:
1. LogBot → Webhooks → Neuer Webhook
2. Filter konfigurieren (Hostname, Level, etc.)
3. URL in n8n HTTP Request Node einfügen

## Verzeichnisstruktur

```
/opt/logbot/
├── docker-compose.yml
├── .env                 # Zugangsdaten (geheim!)
├── backend/             # FastAPI Backend
├── frontend/            # Vue.js Frontend
├── syslog/              # Syslog Server
├── caddy/               # Reverse Proxy
└── db/                  # Datenbank-Schema
```

## Befehle

```bash
cd /opt/logbot

# Status anzeigen
docker compose ps

# Logs anzeigen
docker compose logs -f

# Neustart
docker compose restart

# Stoppen
docker compose down

# Starten
docker compose up -d

# Update (nach neuer Version)
docker compose pull
docker compose up -d --build
```

## Datenbank-Backup

```bash
# Backup erstellen
docker compose exec postgres pg_dump -U logbot logbot > backup.sql

# Backup wiederherstellen
docker compose exec -T postgres psql -U logbot logbot < backup.sql
```

## Changelog

### v2026.01.30.13.30.00 (2026-01-30)
- UniFi Netconsole Parsing Fix (Hex-ID != Hostname)
- Öffentliche Webhook-Endpoints ohne Bearer Token
- Verbessertes Health Monitoring
- Settings-Verwaltung im Web-Interface
- Log-Retention Funktion

### v1.1.0
- Webhook-Integration für n8n
- PostgreSQL statt SQLite
- Verbessertes Agent-Management

### v1.0.0
- Initiale Version
- Basis Syslog-Empfang
- Web-Interface

## Support

Bei Fragen: p.fischer@itconex.de
