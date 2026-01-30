#!/usr/bin/env python3
# ==============================================================================
# Name:        Philipp Fischer
# Kontakt:     p.fischer@itconex.de
# Version:     2026.01.30.13.30.00
# Beschreibung: LogBot v2026.01.30.13.30.00 - Syslog Server mit UniFi Parsing
#               Empfängt Syslog auf UDP/TCP 514, parst verschiedene Formate
# ==============================================================================

import asyncio
import os
import re
import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any, Tuple
import asyncpg

# Logging Setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger('syslog_server')

# Umgebungsvariablen
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', '5432'))
DB_USER = os.getenv('DB_USER', 'logbot')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'logbot')
SYSLOG_PORT = int(os.getenv('SYSLOG_PORT', '514'))

# Syslog Level Namen
LEVEL_NAMES = {0: 'emergency', 1: 'alert', 2: 'critical', 3: 'error',
               4: 'warning', 5: 'notice', 6: 'info', 7: 'debug'}

# ==============================================================================
# REGEX PATTERNS - UniFi Netconsole und MAC/Model Format
# ==============================================================================

# Pattern 1: UniFi Netconsole - {hex} ist Sequenznummer, NICHT Hostname!
# Beispiel: <6>{f1d1} [1234.567890] mclagsyncd[1234]: Message
UNIFI_NETCONSOLE = re.compile(
    r'^<(\d+)>\{([a-fA-F0-9]+)\}\s*\[[\d.]+\]\s*(\S+?)(?:\[\d+\])?:\s*(.*)$'
)

# Pattern 2: UniFi MAC/Model Format
# Beispiel: <30>784558fc21cf,U6-LR-6.7.31+15618: hostapd: Message
UNIFI_MAC_MODEL = re.compile(
    r'^<(\d+)>([a-fA-F0-9]{12}),([^:]+):\s*(\S+?):\s*(.*)$'
)

# Pattern 3: Standard BSD Syslog
BSD_SYSLOG = re.compile(
    r'^<(\d+)>([A-Z][a-z]{2}\s+\d+\s+\d+:\d+:\d+)\s+(\S+)\s+(\S+?)(?:\[\d+\])?:\s*(.*)$'
)

# Pattern 4: Nur Priority
SIMPLE = re.compile(r'^<(\d+)>\s*(.*)$')


class SyslogParser:
    """Parst verschiedene Syslog-Formate inkl. UniFi."""
    
    @staticmethod
    def parse_priority(pri: int) -> Tuple[int, str]:
        """Zerlegt Priority in Facility und Level."""
        facility = pri >> 3
        severity = pri & 0x07
        return facility, LEVEL_NAMES.get(severity, 'info')
    
    @staticmethod
    def format_mac(mac: str) -> str:
        """Formatiert MAC: aabbccddeeff -> aa:bb:cc:dd:ee:ff"""
        return ':'.join(mac[i:i+2].lower() for i in range(0, 12, 2))
    
    def parse(self, raw: str, sender_ip: str) -> Dict[str, Any]:
        """Parst eine Syslog-Nachricht."""
        raw = raw.strip()
        result = {
            'hostname': sender_ip,
            'ip_address': sender_ip,
            'mac_address': None,
            'device_type': 'unknown',
            'facility': 1,
            'level': 'info',
            'source': 'unknown',
            'message': raw,
            'raw_message': raw,
            'extra_data': {}
        }
        
        # Pattern 1: UniFi Netconsole - {hex} ist KEINE Device-ID!
        m = UNIFI_NETCONSOLE.match(raw)
        if m:
            pri, hex_seq, source, msg = m.groups()
            fac, lvl = self.parse_priority(int(pri))
            result.update({
                'hostname': sender_ip,  # IP als Hostname, NICHT hex_seq!
                'facility': fac,
                'level': lvl,
                'source': source,
                'message': msg,
                'device_type': 'unifi_ap',
                'extra_data': {'format': 'netconsole', 'sequence': hex_seq}
            })
            return result
        
        # Pattern 2: UniFi MAC/Model
        m = UNIFI_MAC_MODEL.match(raw)
        if m:
            pri, mac_raw, model, source, msg = m.groups()
            fac, lvl = self.parse_priority(int(pri))
            mac = self.format_mac(mac_raw)
            result.update({
                'hostname': mac,  # MAC als Hostname
                'mac_address': mac,
                'facility': fac,
                'level': lvl,
                'source': source,
                'message': msg,
                'device_type': 'unifi_ap',
                'extra_data': {'format': 'mac_model', 'model': model}
            })
            return result
        
        # Pattern 3: BSD Syslog
        m = BSD_SYSLOG.match(raw)
        if m:
            pri, ts, host, source, msg = m.groups()
            fac, lvl = self.parse_priority(int(pri))
            result.update({
                'hostname': host,
                'facility': fac,
                'level': lvl,
                'source': source,
                'message': msg,
                'extra_data': {'format': 'bsd'}
            })
            return result
        
        # Pattern 4: Simple
        m = SIMPLE.match(raw)
        if m:
            pri, msg = m.groups()
            fac, lvl = self.parse_priority(int(pri))
            result.update({'facility': fac, 'level': lvl, 'message': msg})
        
        return result


class DatabaseManager:
    """Async PostgreSQL Verbindung."""
    
    def __init__(self):
        self.pool = None
    
    async def connect(self):
        """Verbindung herstellen mit Retry."""
        for i in range(30):
            try:
                self.pool = await asyncpg.create_pool(
                    host=DB_HOST, port=DB_PORT, user=DB_USER,
                    password=DB_PASSWORD, database=DB_NAME,
                    min_size=5, max_size=20
                )
                logger.info(f"DB verbunden: {DB_HOST}:{DB_PORT}/{DB_NAME}")
                return
            except Exception as e:
                logger.warning(f"DB Verbindung fehlgeschlagen ({i+1}/30): {e}")
                await asyncio.sleep(2)
        raise Exception("DB Verbindung fehlgeschlagen")
    
    async def close(self):
        if self.pool:
            await self.pool.close()
    
    async def get_or_create_agent(self, hostname: str, ip: str, mac: str, 
                                   device_type: str, extra_data: dict) -> int:
        """Agent finden oder erstellen."""
        async with self.pool.acquire() as conn:
            # Nach MAC suchen wenn vorhanden
            if mac:
                agent = await conn.fetchrow(
                    "SELECT id FROM agents WHERE mac_address = $1", mac)
                if agent:
                    await conn.execute(
                        "UPDATE agents SET last_seen=NOW(), ip_address=$2 WHERE id=$1",
                        agent['id'], ip)
                    return agent['id']
            
            # Nach Hostname+IP suchen
            agent = await conn.fetchrow(
                "SELECT id FROM agents WHERE hostname=$1 AND ip_address=$2",
                hostname, ip)
            if agent:
                await conn.execute(
                    "UPDATE agents SET last_seen=NOW() WHERE id=$1", agent['id'])
                return agent['id']
            
            # Neu erstellen
            return await conn.fetchval(
                """INSERT INTO agents (hostname, ip_address, mac_address, device_type, extra_data)
                   VALUES ($1, $2, $3, $4, $5::jsonb) RETURNING id""",
                hostname, ip, mac, device_type, json.dumps(extra_data))
    
    async def insert_log(self, data: Dict[str, Any]) -> int:
        """Log einfügen."""
        agent_id = await self.get_or_create_agent(
            data['hostname'], data['ip_address'], data.get('mac_address'),
            data['device_type'], data.get('extra_data', {}))
        
        async with self.pool.acquire() as conn:
            return await conn.fetchval(
                """INSERT INTO logs (agent_id, hostname, ip_address, facility, level, 
                   source, message, raw_message, extra_data)
                   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb) RETURNING id""",
                agent_id, data['hostname'], data['ip_address'], data['facility'],
                data['level'], data['source'], data['message'], data['raw_message'],
                json.dumps(data.get('extra_data', {})))


class SyslogUDPProtocol(asyncio.DatagramProtocol):
    """UDP Syslog Empfänger."""
    
    def __init__(self, parser: SyslogParser, db: DatabaseManager):
        self.parser = parser
        self.db = db
        self.count = 0
    
    def datagram_received(self, data: bytes, addr: Tuple[str, int]):
        msg = data.decode('utf-8', errors='replace').strip()
        if msg:
            self.count += 1
            asyncio.create_task(self._process(msg, addr[0]))
    
    async def _process(self, msg: str, ip: str):
        try:
            parsed = self.parser.parse(msg, ip)
            await self.db.insert_log(parsed)
        except Exception as e:
            logger.error(f"Fehler: {e}")


async def handle_tcp(reader, writer, parser: SyslogParser, db: DatabaseManager):
    """TCP Syslog Handler."""
    addr = writer.get_extra_info('peername')
    ip = addr[0] if addr else 'unknown'
    try:
        while True:
            data = await reader.readline()
            if not data:
                break
            msg = data.decode('utf-8', errors='replace').strip()
            if msg:
                parsed = parser.parse(msg, ip)
                await db.insert_log(parsed)
    except:
        pass
    finally:
        writer.close()


async def main():
    logger.info("=" * 60)
    logger.info("LogBot Syslog Server v2026.01.30.13.30.00")
    logger.info("=" * 60)
    
    parser = SyslogParser()
    db = DatabaseManager()
    await db.connect()
    
    loop = asyncio.get_event_loop()
    
    # UDP Server
    transport, protocol = await loop.create_datagram_endpoint(
        lambda: SyslogUDPProtocol(parser, db),
        local_addr=('0.0.0.0', SYSLOG_PORT))
    
    # TCP Server
    tcp_server = await asyncio.start_server(
        lambda r, w: handle_tcp(r, w, parser, db),
        '0.0.0.0', SYSLOG_PORT)
    
    logger.info(f"Syslog Server läuft auf UDP/TCP Port {SYSLOG_PORT}")
    
    try:
        await tcp_server.serve_forever()
    finally:
        transport.close()
        tcp_server.close()
        await db.close()


if __name__ == '__main__':
    asyncio.run(main())
