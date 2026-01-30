# ==============================================================================
# Name:        Philipp Fischer
# Kontakt:     p.fischer@itconex.de
# Version:     2026.01.30.13.30.00
# Beschreibung: LogBot v2026.01.30.13.30.00 - FastAPI Hauptanwendung
# ==============================================================================

from datetime import datetime
from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from .config import settings
from .database import get_db
from .models import Webhook, Log
from .schemas import LogResponse, LogDetailResponse
from .routes import auth_router, health_router, users_router, agents_router, logs_router, webhooks_router, settings_router

app = FastAPI(
    title="LogBot",
    description="Zentraler Log-Server",
    version=settings.app_version,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Routes registrieren
app.include_router(auth_router)
app.include_router(health_router)
app.include_router(users_router)
app.include_router(agents_router)
app.include_router(logs_router)
app.include_router(webhooks_router)
app.include_router(settings_router)

# Öffentlicher Webhook Endpoint - KEINE Auth!
@app.get("/api/webhook/{webhook_id}/call", tags=["Webhooks"])
async def call_webhook(webhook_id: int, token: str = Query(...), db: AsyncSession = Depends(get_db)):
    """Öffentlicher Webhook-Endpoint für n8n/externe Tools. Auth via Token-Parameter."""
    result = await db.execute(select(Webhook).where(Webhook.id == webhook_id, Webhook.token == token, Webhook.is_active == True))
    webhook = result.scalar_one_or_none()
    if not webhook:
        raise HTTPException(status_code=401, detail="Ungültiger Webhook oder Token")
    
    filters = webhook.filters or {}
    query = select(Log)
    
    if filters.get("hostname"):
        query = query.where(Log.hostname.ilike(f"%{filters['hostname']}%"))
    if filters.get("source"):
        query = query.where(Log.source.ilike(f"%{filters['source']}%"))
    if filters.get("level"):
        query = query.where(Log.level.in_(filters["level"]))
    
    query = query.order_by(desc(Log.timestamp)).limit(webhook.max_results)
    result = await db.execute(query)
    logs = result.scalars().all()
    
    webhook.call_count += 1
    webhook.last_called_at = datetime.utcnow()
    await db.commit()
    
    if webhook.include_raw:
        return [LogDetailResponse(id=l.id, hostname=l.hostname, ip_address=l.ip_address, timestamp=l.timestamp,
                level=l.level, source=l.source, message=l.message, agent_id=l.agent_id, facility=l.facility,
                raw_message=l.raw_message, metadata=l.metadata or {}) for l in logs]
    return [LogResponse(id=l.id, hostname=l.hostname, ip_address=l.ip_address, timestamp=l.timestamp,
            level=l.level, source=l.source, message=l.message) for l in logs]

@app.get("/api")
async def root():
    return {"name": "LogBot", "version": settings.app_version, "docs": "/api/docs"}
