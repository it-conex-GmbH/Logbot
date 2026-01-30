# ==============================================================================
# Name:        Philipp Fischer
# Kontakt:     p.fischer@itconex.de
# Version:     2026.01.30.13.30.00
# Beschreibung: LogBot v2026.01.30.13.30.00 - Agents API Endpoints
# ==============================================================================

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models import Agent, Log, User
from ..schemas import AgentResponse, AgentListResponse
from ..auth import get_current_user

router = APIRouter(prefix="/api/agents", tags=["Agents"])

@router.get("", response_model=AgentListResponse)
async def list_agents(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    device_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user)
):
    query = select(Agent)
    count_query = select(func.count(Agent.id))
    
    if search:
        f = f"%{search}%"
        query = query.where((Agent.hostname.ilike(f)) | (Agent.ip_address.ilike(f)) | (Agent.mac_address.ilike(f)))
        count_query = count_query.where((Agent.hostname.ilike(f)) | (Agent.ip_address.ilike(f)) | (Agent.mac_address.ilike(f)))
    if device_type:
        query = query.where(Agent.device_type == device_type)
        count_query = count_query.where(Agent.device_type == device_type)
    
    total = (await db.execute(count_query)).scalar() or 0
    offset = (page - 1) * page_size
    result = await db.execute(query.order_by(Agent.last_seen.desc()).offset(offset).limit(page_size))
    
    return AgentListResponse(items=result.scalars().all(), total=total, page=page, page_size=page_size)

@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Agent).where(Agent.id == agent_id))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent nicht gefunden")
    log_count = (await db.execute(select(func.count(Log.id)).where(Log.agent_id == agent_id))).scalar() or 0
    return AgentResponse(
        id=agent.id, hostname=agent.hostname, ip_address=agent.ip_address,
        mac_address=agent.mac_address, device_type=agent.device_type,
        last_seen=agent.last_seen, first_seen=agent.first_seen,
        metadata=agent.metadata or {}, log_count=log_count
    )

@router.delete("/{agent_id}", status_code=204)
async def delete_agent(agent_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Agent).where(Agent.id == agent_id))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent nicht gefunden")
    await db.delete(agent)
    await db.commit()
