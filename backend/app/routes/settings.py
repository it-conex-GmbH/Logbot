# ==============================================================================
# Name:        Philipp Fischer
# Kontakt:     p.fischer@itconex.de
# Version:     2026.01.30.13.30.00
# Beschreibung: LogBot v2026.01.30.13.30.00 - Settings API Endpoints
# ==============================================================================

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models import Setting, Log, User
from ..schemas import SettingsResponse, SettingUpdate, RetentionResponse
from ..auth import get_current_user, get_current_admin

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("", response_model=SettingsResponse)
async def get_settings(db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Setting))
    return SettingsResponse(settings={s.key: s.value for s in result.scalars().all()})

@router.get("/{key}")
async def get_setting(key: str, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Setting).where(Setting.key == key))
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(status_code=404, detail=f"Setting '{key}' nicht gefunden")
    return {"key": setting.key, "value": setting.value}

@router.put("/{key}")
async def update_setting(key: str, data: SettingUpdate, db: AsyncSession = Depends(get_db), _=Depends(get_current_admin)):
    result = await db.execute(select(Setting).where(Setting.key == key))
    setting = result.scalar_one_or_none()
    if setting:
        setting.value = data.value
    else:
        setting = Setting(key=key, value=data.value)
        db.add(setting)
    await db.commit()
    await db.refresh(setting)
    return {"key": setting.key, "value": setting.value}

@router.post("/retention/preview", response_model=RetentionResponse)
async def preview_retention(days: int = Query(..., ge=1), db: AsyncSession = Depends(get_db), _=Depends(get_current_admin)):
    cutoff = datetime.utcnow() - timedelta(days=days)
    count = (await db.execute(select(func.count(Log.id)).where(Log.timestamp < cutoff))).scalar() or 0
    oldest = (await db.execute(select(func.min(Log.timestamp)))).scalar()
    return RetentionResponse(logs_to_delete=count, oldest_log_date=oldest)

@router.post("/retention/execute", response_model=RetentionResponse)
async def execute_retention(days: int = Query(..., ge=1), db: AsyncSession = Depends(get_db), _=Depends(get_current_admin)):
    cutoff = datetime.utcnow() - timedelta(days=days)
    result = await db.execute(delete(Log).where(Log.timestamp < cutoff))
    await db.commit()
    return RetentionResponse(deleted_count=result.rowcount, message=f"{result.rowcount} Logs gelöscht")
