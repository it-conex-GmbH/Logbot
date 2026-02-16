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
- 🎨 **Whitelabel-System** mit Dark/Light Mode
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
- **Branding:** http://SERVER-IP/settings/branding
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

## Whitelabel / Branding

LogBot bietet ein vollständiges Whitelabel-System zur Anpassung an deine Marke.

### Features

- 🌓 **Dark/Light Mode** mit Toggle-Button
- 🎨 **Farbschema** vollständig anpassbar
- 🏢 **Firmenname & Logo** austauschbar
- 🖼️ **Favicon** anpassbar
- 📝 **Custom CSS** für erweiterte Anpassungen

### Konfiguration

1. Navigiere zu **Settings → Branding** (`/settings/branding`)
2. Passe Farben, Logo und Texte an
3. Klicke auf **Speichern**

### Einstellungen

| Einstellung | Beschreibung |
|-------------|--------------|
| Firmenname | Wird im Header und Seitentitel angezeigt |
| Tagline | Slogan unter dem Firmennamen |
| Logo | PNG, JPG, SVG oder WebP (empfohlen: 200x50px) |
| Favicon | ICO, PNG oder SVG (empfohlen: 32x32px) |
| Primärfarbe | Buttons, Links, Akzente |
| Dark/Light Mode | Standard-Theme und Toggle-Erlaubnis |
| Custom CSS | Eigene CSS-Regeln für erweiterte Anpassungen |

### Theme-Toggle einbauen

Der Theme-Toggle kann überall eingebaut werden:

```vue
<template>
  <ThemeToggle />
  <!-- oder mit Label: -->
  <ThemeToggle :showLabel="true" />
</template>

<script setup>
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>
```

### API-Endpunkte

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/branding/config` | Aktuelle Konfiguration laden |
| PUT | `/api/branding/config` | Konfiguration speichern |
| POST | `/api/branding/upload/logo` | Logo hochladen |
| POST | `/api/branding/upload/favicon` | Favicon hochladen |
| POST | `/api/branding/reset` | Auf Standardwerte zurücksetzen |

### Standard-Farben (itconex.de inspiriert)

**Dark Mode:**
- Hintergrund: `#0a0a0f`
- Oberfläche: `#111118`
- Primär: `#0ea5e9`

**Light Mode:**
- Hintergrund: `#f8fafc`
- Oberfläche: `#ffffff`
- Primär: `#0ea5e9`

## Verzeichnisstruktur

```
/opt/logbot/
├── docker-compose.yml
├── .env                 # Zugangsdaten (geheim!)
├── backend/             # FastAPI Backend
│   └── app/
│       └── branding.py  # Branding API
├── frontend/            # Vue.js Frontend
│   └── src/
│       ├── stores/
│       │   ├── themeStore.js
│       │   └── brandingStore.js
│       ├── components/
│       │   └── ThemeToggle.vue
│       └── views/
│           └── BrandingSettings.vue
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

### v2026.02.16 (2026-02-16)
- **FIX:** Agent löschen schlug fehl (async SQLAlchemy + Foreign Key Konflikt)
- **FIX:** Health-Seite nicht erreichbar bei hoher DB-Last
- **PERFORMANCE:** Syslog Server komplett überarbeitet:
  - Agent-Cache im Speicher (vermeidet DB-Lookup pro Nachricht)
  - Batch-Inserts via PostgreSQL COPY (statt Einzel-INSERT pro Log)
  - Gebündelte `last_seen` Updates (1x alle 2 Sek statt pro Nachricht)
  - Ergebnis: ~96 DB-Ops/Sek → ~2 DB-Ops/Sek
- **PERFORMANCE:** Dashboard/Logs/Health `COUNT(*)` über Millionen Zeilen eliminiert:
  - Gesamtzahl via `pg_class.reltuples` (Schätzung, sofort verfügbar)
  - Unique Hosts aus `agents`-Tabelle statt `COUNT(DISTINCT)` über `logs`
  - Level/Source Statistiken nur für heute (nutzt timestamp-Index)
- **PERFORMANCE:** Fehlender Index `idx_logs_agent_id` auf `logs.agent_id` ergänzt

### v2026.01.30.17.30.00 (2026-01-30)
- **NEU:** Whitelabel-System mit Dark/Light Mode
- **NEU:** Branding-Einstellungen im Web-Interface
- **NEU:** Logo und Favicon Upload
- **NEU:** Custom CSS Support
- **NEU:** Theme-Toggle Komponente

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